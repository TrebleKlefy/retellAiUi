import api from './api';
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientStats, 
  IntegrationTestResult,
  ClientsResponse,
  ClientResponse
} from '../types/client';

export class ClientService {
  async getClients(): Promise<Client[]> {
    const response = await api.get<ClientsResponse>('/clients');
    return response.data.data;
  }

  async getClient(clientId: string): Promise<Client> {
    const response = await api.get<ClientResponse>(`/clients/${clientId}`);
    return response.data.data;
  }

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await api.post<ClientResponse>('/clients', clientData);
    return response.data.data;
  }

  async updateClient(clientId: string, updates: UpdateClientRequest): Promise<Client> {
    const response = await api.put<ClientResponse>(`/clients/${clientId}`, updates);
    return response.data.data;
  }

  async deleteClient(clientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  }

  async testIntegrations(clientId: string): Promise<IntegrationTestResult> {
    const response = await api.post<{ success: boolean; data: IntegrationTestResult }>(
      `/clients/${clientId}/test-integrations`
    );
    return response.data.data;
  }

  async getClientStats(clientId: string): Promise<ClientStats> {
    const response = await api.get<{ success: boolean; data: ClientStats }>(
      `/clients/${clientId}/stats`
    );
    return response.data.data;
  }
}

export const clientService = new ClientService();