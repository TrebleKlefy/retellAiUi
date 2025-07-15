import api from './api';
import { 
  QueueItem, 
  ScheduleRequest, 
  CreateQueueItemRequest,
  UpdateQueueItemRequest,
  QueueFilters,
  QueueStats,
  ProcessQueueResult,
  BatchScheduleResult,
  QueueConfig,
  QueueItemsResponse,
  QueueStatsResponse,
  ProcessQueueResponse,
  BatchScheduleResponse
} from '../types/queue';

export class QueueService {
  async addToQueue(clientId: string, queueData: CreateQueueItemRequest): Promise<QueueItem> {
    const response = await api.post(`/clients/${clientId}/queue`, queueData);
    return response.data.data;
  }

  async getQueueItems(clientId: string, filters?: QueueFilters): Promise<QueueItem[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.search) params.append('search', filters.search);
    }

    const response = await api.get(`/clients/${clientId}/queue?${params.toString()}`);
    return response.data.data;
  }

  async getQueueItem(itemId: string): Promise<QueueItem> {
    const response = await api.get(`/queue/${itemId}`);
    return response.data.data;
  }

  async updateQueueItem(itemId: string, updates: UpdateQueueItemRequest): Promise<QueueItem> {
    const response = await api.put(`/queue/${itemId}`, updates);
    return response.data.data;
  }

  async processQueue(clientId: string): Promise<ProcessQueueResult> {
    const response = await api.post(`/clients/${clientId}/queue/process`);
    return response.data.data;
  }

  async cancelQueueItem(itemId: string): Promise<void> {
    await api.delete(`/queue/${itemId}`);
  }

  async getQueueStats(clientId: string): Promise<QueueStats> {
    const response = await api.get(`/clients/${clientId}/queue/stats`);
    return response.data.data;
  }

  async scheduleBatch(clientId: string, scheduleData: ScheduleRequest): Promise<BatchScheduleResult> {
    const response = await api.post(`/clients/${clientId}/queue/schedule-batch`, scheduleData);
    return response.data.data;
  }

  async getQueueConfig(clientId: string): Promise<QueueConfig> {
    const response = await api.get(`/clients/${clientId}/queue/config`);
    return response.data.data;
  }

  async updateQueueConfig(clientId: string, config: Partial<QueueConfig>): Promise<QueueConfig> {
    const response = await api.put(`/clients/${clientId}/queue/config`, config);
    return response.data.data;
  }
}

export const queueService = new QueueService();