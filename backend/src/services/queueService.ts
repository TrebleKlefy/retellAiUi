import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { 
  QueueItem, 
  CreateQueueItemRequest, 
  UpdateQueueItemRequest, 
  QueueStats, 
  QueueFilters 
} from '../models/Queue';

export class QueueService {
  private readonly tableName = 'Queue';

  async getQueueItems(options: QueueFilters & { page: number; limit: number }) {
    try {
      const { page, limit, search, clientId, type, priority, status, assignedTo, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      const conditions = [];

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {Notes}) > 0, SEARCH('${search}', {LeadId}) > 0)`);
      }

      if (clientId) {
        conditions.push(`{ClientId} = '${clientId}'`);
      }

      if (type) {
        conditions.push(`{Type} = '${type}'`);
      }

      if (priority) {
        conditions.push(`{Priority} = '${priority}'`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
      }

      if (assignedTo) {
        conditions.push(`{AssignedTo} = '${assignedTo}'`);
      }

      if (dateFrom || dateTo) {
        let dateCondition = '';
        if (dateFrom && dateTo) {
          dateCondition = `AND({ScheduledAt} >= '${dateFrom}', {ScheduledAt} <= '${dateTo}')`;
        } else if (dateFrom) {
          dateCondition = `{ScheduledAt} >= '${dateFrom}'`;
        } else if (dateTo) {
          dateCondition = `{ScheduledAt} <= '${dateTo}'`;
        }
        conditions.push(dateCondition);
      }

      if (conditions.length > 0) {
        filterFormula = `AND(${conditions.join(', ')})`;
      }

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula,
        maxRecords: limit,
        offset: offset
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total: records.length,
          totalPages: Math.ceil(records.length / limit)
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get queue items', 500);
    }
  }

  async getQueueItemById(itemId: string): Promise<QueueItem> {
    try {
      const item = await AirtableService.getRecord(this.tableName, itemId);
      
      if (!item) {
        throw new CustomError('Queue item not found', 404);
      }

      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get queue item', 500);
    }
  }

  async createQueueItem(itemData: CreateQueueItemRequest, userId: string): Promise<QueueItem> {
    try {
      const newItem = await AirtableService.createRecord(this.tableName, {
        ...itemData,
        priority: itemData.priority || 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newItem;
    } catch (error) {
      throw new CustomError('Failed to create queue item', 500);
    }
  }

  async updateQueueItem(itemId: string, updateData: UpdateQueueItemRequest): Promise<QueueItem> {
    try {
      const existingItem = await AirtableService.getRecord(this.tableName, itemId);
      
      if (!existingItem) {
        throw new CustomError('Queue item not found', 404);
      }

      const updatedItem = await AirtableService.updateRecord(this.tableName, itemId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      return updatedItem;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update queue item', 500);
    }
  }

  async deleteQueueItem(itemId: string): Promise<void> {
    try {
      const existingItem = await AirtableService.getRecord(this.tableName, itemId);
      
      if (!existingItem) {
        throw new CustomError('Queue item not found', 404);
      }

      await AirtableService.deleteRecord(this.tableName, itemId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete queue item', 500);
    }
  }

  async getQueueStats(clientId?: string): Promise<QueueStats> {
    try {
      const allItems = await AirtableService.getRecords(this.tableName);
      
      // Filter by client if provided
      const items = clientId ? allItems.filter(item => item.clientId === clientId) : allItems;
      
      const totalItems = items.length;
      const pendingItems = items.filter(item => item.status === 'pending').length;
      const inProgressItems = items.filter(item => item.status === 'in_progress').length;
      const completedItems = items.filter(item => item.status === 'completed').length;
      const cancelledItems = items.filter(item => item.status === 'cancelled').length;

      // Calculate average wait time (time from creation to start)
      const completedWithStartTime = items.filter(item => 
        item.status === 'completed' && item.startedAt && item.createdAt
      );
      
      let averageWaitTime = 0;
      if (completedWithStartTime.length > 0) {
        const totalWaitTime = completedWithStartTime.reduce((sum, item) => {
          const startTime = new Date(item.startedAt!).getTime();
          const createTime = new Date(item.createdAt).getTime();
          return sum + (startTime - createTime);
        }, 0);
        averageWaitTime = totalWaitTime / completedWithStartTime.length / (1000 * 60); // Convert to minutes
      }

      // Calculate processing rate (items completed per day)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentCompleted = items.filter(item => 
        item.status === 'completed' && 
        item.completedAt && 
        new Date(item.completedAt) > oneDayAgo
      ).length;
      
      const processingRate = recentCompleted;

      // Calculate priority distribution
      const priorityDistribution: Record<string, number> = {};
      items.forEach(item => {
        priorityDistribution[item.priority] = (priorityDistribution[item.priority] || 0) + 1;
      });

      return {
        totalItems,
        pendingItems,
        inProgressItems,
        completedItems,
        cancelledItems,
        averageWaitTime: Math.round(averageWaitTime * 100) / 100,
        processingRate,
        priorityDistribution
      };
    } catch (error) {
      throw new CustomError('Failed to get queue stats', 500);
    }
  }

  async getPriorityDistribution(clientId?: string): Promise<Record<string, number>> {
    try {
      const allItems = await AirtableService.getRecords(this.tableName);
      const items = clientId ? allItems.filter(item => item.clientId === clientId) : allItems;
      
      const distribution: Record<string, number> = {};
      items.forEach(item => {
        distribution[item.priority] = (distribution[item.priority] || 0) + 1;
      });
      
      return distribution;
    } catch (error) {
      throw new CustomError('Failed to get priority distribution', 500);
    }
  }

  async getQueueItemsByLead(leadId: string): Promise<QueueItem[]> {
    try {
      const allItems = await AirtableService.getRecords(this.tableName);
      return allItems.filter(item => item.leadId === leadId);
    } catch (error) {
      throw new CustomError('Failed to get queue items by lead', 500);
    }
  }

  async getQueueItemsByUser(userId: string): Promise<QueueItem[]> {
    try {
      const allItems = await AirtableService.getRecords(this.tableName);
      return allItems.filter(item => item.assignedTo === userId);
    } catch (error) {
      throw new CustomError('Failed to get queue items by user', 500);
    }
  }
}