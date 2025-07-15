import api from './api';
import { 
  Call, 
  CreateCallRequest, 
  BatchCallRequest, 
  CallFilters, 
  CallStats,
  CallResponse,
  CallsResponse,
  BatchCallResponse,
  CallStatsResponse
} from '../types/call';

export class CallService {
  async createCall(clientId: string, callData: CreateCallRequest): Promise<Call> {
    const response = await api.post<CallResponse>(`/clients/${clientId}/calls`, callData);
    return response.data.data;
  }

  async createBatchCall(clientId: string, batchData: BatchCallRequest): Promise<{
    batchCallId: string;
    totalCalls: number;
    calls: Call[];
  }> {
    const response = await api.post<BatchCallResponse>(`/clients/${clientId}/batch-calls`, batchData);
    return response.data.data;
  }

  async getCalls(clientId: string, filters?: CallFilters): Promise<Call[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.outcome) params.append('outcome', filters.outcome);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    const response = await api.get<CallsResponse>(`/clients/${clientId}/calls`, { 
      params: Object.fromEntries(params)
    });
    return response.data.data;
  }

  async getCall(callId: string): Promise<Call> {
    const response = await api.get<CallResponse>(`/calls/${callId}`);
    return response.data.data;
  }

  async cancelCall(callId: string): Promise<void> {
    await api.delete(`/calls/${callId}`);
  }

  async getCallStats(clientId: string): Promise<CallStats> {
    const response = await api.get<CallStatsResponse>(`/clients/${clientId}/call-stats`);
    return response.data.data;
  }
}

export const callService = new CallService();