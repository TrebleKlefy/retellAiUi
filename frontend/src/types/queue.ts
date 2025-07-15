export interface QueueItem {
  id: string;
  clientId: string;
  leadId: string;
  priority: QueuePriority;
  scheduledAt: Date;
  retryCount: number;
  maxRetries: number;
  status: QueueStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum QueuePriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum QueueStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY_SCHEDULED = 'retry_scheduled'
}

export interface QueueConfig {
  clientId: string;
  maxConcurrent: number;
  retryDelays: number[];
  businessHours: BusinessHours;
  timezone: string;
  activeDays: string[];
  priorityWeights: Record<QueuePriority, number>;
}

export interface BusinessHours {
  start: string;
  end: string;
  priorityHours: number[];
  timezone: string;
}

export interface ScheduleRequest {
  clientId: string;
  leadIds: string[];
  priority?: QueuePriority;
  scheduledAt?: Date;
  batchSize?: number;
}

export interface CreateQueueItemRequest {
  clientId: string;
  leadId: string;
  priority: QueuePriority;
  scheduledAt?: Date;
  maxRetries?: number;
  metadata?: Record<string, any>;
}

export interface UpdateQueueItemRequest {
  priority?: QueuePriority;
  scheduledAt?: Date;
  status?: QueueStatus;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  inProgressItems: number;
  completedItems: number;
  failedItems: number;
  averageWaitTime: number;
  priorityBreakdown: Record<QueuePriority, number>;
  statusBreakdown: Record<QueueStatus, number>;
}

export interface QueueFilters {
  status?: QueueStatus;
  priority?: QueuePriority;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ProcessQueueResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export interface BatchScheduleResult {
  scheduled: number;
  items: QueueItem[];
  errors: string[];
}

export interface QueueItemResponse {
  success: boolean;
  data: QueueItem;
}

export interface QueueItemsResponse {
  success: boolean;
  data: QueueItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueueStatsResponse {
  success: boolean;
  data: QueueStats;
}

export interface ProcessQueueResponse {
  success: boolean;
  data: ProcessQueueResult;
}

export interface BatchScheduleResponse {
  success: boolean;
  data: BatchScheduleResult;
}