export interface QueueItem {
  id: string;
  clientId?: string;
  leadId: string;
  type: 'call' | 'follow_up' | 'meeting' | 'task';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string; // User ID
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQueueItemRequest {
  clientId?: string;
  leadId: string;
  type: 'call' | 'follow_up' | 'meeting' | 'task';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  scheduledAt: Date;
  notes?: string;
  tags?: string[];
}

export interface UpdateQueueItemRequest {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  tags?: string[];
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

export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  inProgressItems: number;
  completedItems: number;
  cancelledItems: number;
  averageWaitTime: number;
  processingRate: number;
  priorityDistribution: Record<string, number>;
}

export interface QueueFilters {
  clientId?: string;
  type?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}