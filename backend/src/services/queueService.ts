import { 
  QueueItem, 
  QueuePriority, 
  QueueStatus, 
  QueueConfig, 
  ScheduleRequest,
  ProcessQueueResult,
  BatchScheduleResult,
  CreateQueueItemRequest,
  UpdateQueueItemRequest,
  QueueFilters,
  QueueStats
} from '../models/Queue';
import { CallService } from './callService';
import { ClientService } from './clientService';
import { LeadService } from './leadService';
import { SchedulerService } from './schedulerService';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for queue items (in production, this would be a database)
const queueItems: Map<string, QueueItem> = new Map();
const queueConfigs: Map<string, QueueConfig> = new Map();

export class QueueService {
  private callService: CallService;
  private clientService: ClientService;
  private leadService: LeadService;
  private schedulerService: SchedulerService;

  constructor() {
    this.callService = new CallService();
    this.clientService = new ClientService();
    this.leadService = new LeadService();
    this.schedulerService = new SchedulerService();
  }

  async addToQueue(queueData: CreateQueueItemRequest): Promise<QueueItem> {
    // Validate queue data
    if (!queueData.clientId || !queueData.leadId) {
      throw new Error('Client ID and Lead ID are required');
    }

    // Get client configuration
    const config = await this.getQueueConfig(queueData.clientId);
    
    // Calculate optimal call time if not provided
    const scheduledAt = queueData.scheduledAt || 
      this.schedulerService.calculateOptimalCallTime(
        queueData.priority,
        config.businessHours,
        config.timezone
      );

    // Create queue item
    const queueItem: QueueItem = {
      id: uuidv4(),
      clientId: queueData.clientId,
      leadId: queueData.leadId,
      priority: queueData.priority,
      scheduledAt,
      retryCount: 0,
      maxRetries: queueData.maxRetries || 3,
      status: QueueStatus.PENDING,
      metadata: queueData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store queue item
    queueItems.set(queueItem.id, queueItem);
    
    return queueItem;
  }

  async getQueueItems(clientId: string, filters?: QueueFilters): Promise<QueueItem[]> {
    let items = Array.from(queueItems.values()).filter(item => item.clientId === clientId);

    // Apply filters
    if (filters) {
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      if (filters.priority) {
        items = items.filter(item => item.priority === filters.priority);
      }
      if (filters.dateFrom) {
        items = items.filter(item => item.scheduledAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        items = items.filter(item => item.scheduledAt <= filters.dateTo!);
      }
      if (filters.search) {
        items = items.filter(item => 
          item.leadId.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
    }

    // Sort by priority and scheduled time
    items.sort((a, b) => {
      const priorityOrder = { [QueuePriority.URGENT]: 0, [QueuePriority.HIGH]: 1, [QueuePriority.NORMAL]: 2, [QueuePriority.LOW]: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.scheduledAt.getTime() - b.scheduledAt.getTime();
    });

    return items;
  }

  async processQueue(clientId: string): Promise<ProcessQueueResult> {
    // Get client configuration
    const config = await this.getQueueConfig(clientId);
    
    // Check if calling is allowed
    if (!this.schedulerService.isCallingAllowed(config)) {
      return { processed: 0, successful: 0, failed: 0, errors: ['Calling not allowed outside business hours'] };
    }
    
    // Get next items from queue
    const items = await this.getNextQueueItems(clientId, config.maxConcurrent);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    
    // Process each item
    for (const item of items) {
      try {
        await this.processQueueItem(item);
        successful++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Item ${item.id}: ${errorMessage}`);
        await this.handleQueueItemFailure(item, error);
        failed++;
      }
      processed++;
    }
    
    return { processed, successful, failed, errors };
  }

  async scheduleRetry(queueItem: QueueItem, reason: string): Promise<void> {
    const config = await this.getQueueConfig(queueItem.clientId);
    
    // Calculate retry delay
    const retryDelay = this.schedulerService.calculateRetryDelay(queueItem.retryCount, config);
    
    // Calculate retry time
    const retryTime = new Date();
    retryTime.setMinutes(retryTime.getMinutes() + retryDelay);
    
    // Update queue item
    queueItem.retryCount++;
    queueItem.scheduledAt = retryTime;
    queueItem.status = QueueStatus.RETRY_SCHEDULED;
    queueItem.updatedAt = new Date();
    queueItem.metadata.lastRetryReason = reason;
    
    // Store updated item
    queueItems.set(queueItem.id, queueItem);
  }

  async cancelQueueItem(itemId: string): Promise<void> {
    const item = queueItems.get(itemId);
    if (!item) {
      throw new Error('Queue item not found');
    }
    
    item.status = QueueStatus.CANCELLED;
    item.updatedAt = new Date();
    queueItems.set(itemId, item);
  }

  async getQueueStats(clientId: string): Promise<QueueStats> {
    const items = await this.getQueueItems(clientId);
    
    const totalItems = items.length;
    const pendingItems = items.filter(item => item.status === QueueStatus.PENDING).length;
    const inProgressItems = items.filter(item => item.status === QueueStatus.IN_PROGRESS).length;
    const completedItems = items.filter(item => item.status === QueueStatus.COMPLETED).length;
    const failedItems = items.filter(item => item.status === QueueStatus.FAILED).length;
    
    // Calculate average wait time
    const completedItemsWithWaitTime = items.filter(item => 
      item.status === QueueStatus.COMPLETED && item.updatedAt
    );
    const averageWaitTime = completedItemsWithWaitTime.length > 0 
      ? completedItemsWithWaitTime.reduce((sum, item) => 
          sum + (item.updatedAt.getTime() - item.createdAt.getTime()), 0
        ) / completedItemsWithWaitTime.length / (1000 * 60) // Convert to minutes
      : 0;
    
    // Priority breakdown
    const priorityBreakdown = {
      [QueuePriority.URGENT]: items.filter(item => item.priority === QueuePriority.URGENT).length,
      [QueuePriority.HIGH]: items.filter(item => item.priority === QueuePriority.HIGH).length,
      [QueuePriority.NORMAL]: items.filter(item => item.priority === QueuePriority.NORMAL).length,
      [QueuePriority.LOW]: items.filter(item => item.priority === QueuePriority.LOW).length,
    };
    
    // Status breakdown
    const statusBreakdown = {
      [QueueStatus.PENDING]: items.filter(item => item.status === QueueStatus.PENDING).length,
      [QueueStatus.SCHEDULED]: items.filter(item => item.status === QueueStatus.SCHEDULED).length,
      [QueueStatus.IN_PROGRESS]: items.filter(item => item.status === QueueStatus.IN_PROGRESS).length,
      [QueueStatus.COMPLETED]: items.filter(item => item.status === QueueStatus.COMPLETED).length,
      [QueueStatus.FAILED]: items.filter(item => item.status === QueueStatus.FAILED).length,
      [QueueStatus.CANCELLED]: items.filter(item => item.status === QueueStatus.CANCELLED).length,
      [QueueStatus.RETRY_SCHEDULED]: items.filter(item => item.status === QueueStatus.RETRY_SCHEDULED).length,
    };
    
    return {
      totalItems,
      pendingItems,
      inProgressItems,
      completedItems,
      failedItems,
      averageWaitTime,
      priorityBreakdown,
      statusBreakdown
    };
  }

  async scheduleBatch(scheduleData: ScheduleRequest): Promise<BatchScheduleResult> {
    const { clientId, leadIds, priority = QueuePriority.NORMAL, scheduledAt, batchSize = 10 } = scheduleData;
    
    const scheduled: QueueItem[] = [];
    const errors: string[] = [];
    
    // Process leads in batches
    for (let i = 0; i < leadIds.length; i += batchSize) {
      const batch = leadIds.slice(i, i + batchSize);
      
      for (const leadId of batch) {
        try {
          const queueItem = await this.addToQueue({
            clientId,
            leadId,
            priority,
            scheduledAt,
            maxRetries: 3
          });
          scheduled.push(queueItem);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Lead ${leadId}: ${errorMessage}`);
        }
      }
    }
    
    return {
      scheduled: scheduled.length,
      items: scheduled,
      errors
    };
  }

  async updateQueueItem(itemId: string, updates: UpdateQueueItemRequest): Promise<QueueItem> {
    const item = queueItems.get(itemId);
    if (!item) {
      throw new Error('Queue item not found');
    }
    
    // Apply updates
    Object.assign(item, updates);
    item.updatedAt = new Date();
    
    // Store updated item
    queueItems.set(itemId, item);
    
    return item;
  }

  async getQueueItem(itemId: string): Promise<QueueItem | null> {
    return queueItems.get(itemId) || null;
  }

  private async processQueueItem(item: QueueItem): Promise<void> {
    // Update status to in progress
    await this.updateQueueItem(item.id, { status: QueueStatus.IN_PROGRESS });
    
    try {
      // Create call
      await this.callService.createCall({
        clientId: item.clientId,
        leadId: item.leadId,
        priority: item.priority
      });
      
      // Mark as completed
      await this.updateQueueItem(item.id, { status: QueueStatus.COMPLETED });
    } catch (error) {
      // Handle failure
      throw error;
    }
  }

  private async handleQueueItemFailure(item: QueueItem, error: any): Promise<void> {
    // Check if retry is allowed
    if (item.retryCount < item.maxRetries) {
      await this.scheduleRetry(item, error.message);
    } else {
      await this.updateQueueItem(item.id, { status: QueueStatus.FAILED });
    }
  }

  private async getNextQueueItems(clientId: string, maxConcurrent: number): Promise<QueueItem[]> {
    // Get pending items ordered by priority and scheduled time
    const items = await this.getQueueItems(clientId, { status: QueueStatus.PENDING });
    
    // Filter items that are ready to be processed (scheduled time has passed)
    const now = new Date();
    const readyItems = items.filter(item => item.scheduledAt <= now);
    
    // Return items up to maxConcurrent limit
    return readyItems.slice(0, maxConcurrent);
  }

  private async getQueueConfig(clientId: string): Promise<QueueConfig> {
    // Check if config exists in memory
    let config = queueConfigs.get(clientId);
    
    if (!config) {
      // Create default config
      config = {
        clientId,
        maxConcurrent: 5,
        retryDelays: [5, 15, 30, 60], // minutes between retries
        businessHours: {
          start: '09:00',
          end: '17:00',
          priorityHours: [9, 10, 11, 14, 15, 16], // hours with increased calling
          timezone: 'America/New_York'
        },
        timezone: 'America/New_York',
        activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        priorityWeights: {
          [QueuePriority.URGENT]: 100,
          [QueuePriority.HIGH]: 75,
          [QueuePriority.NORMAL]: 50,
          [QueuePriority.LOW]: 25
        }
      };
      
      // Store config
      queueConfigs.set(clientId, config);
    }
    
    return config;
  }

  async updateQueueConfig(clientId: string, config: Partial<QueueConfig>): Promise<QueueConfig> {
    const existingConfig = await this.getQueueConfig(clientId);
    const updatedConfig = { ...existingConfig, ...config };
    queueConfigs.set(clientId, updatedConfig);
    return updatedConfig;
  }
}