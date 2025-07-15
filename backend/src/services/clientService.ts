import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { Client, CreateClientRequest, UpdateClientRequest, ClientStats } from '../models/Client';

export class ClientService {
  private readonly tableName = 'Clients';

  async getClients(options: { page: number; limit: number; search?: string; status?: string; assignedTo?: string }) {
    try {
      const { page, limit, search, status, assignedTo } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      const conditions = [];

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {Name}) > 0, SEARCH('${search}', {Email}) > 0, SEARCH('${search}', {Company}) > 0)`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
      }

      if (assignedTo) {
        conditions.push(`{AssignedTo} = '${assignedTo}'`);
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
      throw new CustomError('Failed to get clients', 500);
    }
  }

  async getClientById(clientId: string): Promise<Client> {
    try {
      const client = await AirtableService.getRecord(this.tableName, clientId);
      
      if (!client) {
        throw new CustomError('Client not found', 404);
      }

      return client;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get client', 500);
    }
  }

  async createClient(clientData: CreateClientRequest, userId: string): Promise<Client> {
    try {
      const newClient = await AirtableService.createRecord(this.tableName, {
        ...clientData,
        assignedTo: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newClient;
    } catch (error) {
      throw new CustomError('Failed to create client', 500);
    }
  }

  async updateClient(clientId: string, updateData: UpdateClientRequest): Promise<Client> {
    try {
      const existingClient = await AirtableService.getRecord(this.tableName, clientId);
      
      if (!existingClient) {
        throw new CustomError('Client not found', 404);
      }

      const updatedClient = await AirtableService.updateRecord(this.tableName, clientId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      return updatedClient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update client', 500);
    }
  }

  async deleteClient(clientId: string): Promise<void> {
    try {
      const existingClient = await AirtableService.getRecord(this.tableName, clientId);
      
      if (!existingClient) {
        throw new CustomError('Client not found', 404);
      }

      // Soft delete by updating status
      await AirtableService.updateRecord(this.tableName, clientId, {
        status: 'inactive',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete client', 500);
    }
  }

  async getClientStats(): Promise<ClientStats> {
    try {
      const allClients = await AirtableService.getRecords(this.tableName);
      
      const stats: ClientStats = {
        total: allClients.length,
        active: allClients.filter(client => client.status === 'active').length,
        inactive: allClients.filter(client => client.status === 'inactive').length,
        prospects: allClients.filter(client => client.status === 'prospect').length
      };

      return stats;
    } catch (error) {
      throw new CustomError('Failed to get client stats', 500);
    }
  }

  async getClientLeads(clientId: string, options: { page: number; limit: number }) {
    try {
      // This would typically query a leads table filtered by clientId
      // For now, return empty result
      return {
        data: [],
        pagination: {
          page: options.page,
          limit: options.limit,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get client leads', 500);
    }
  }

  async getClientCalls(clientId: string, options: { page: number; limit: number }) {
    try {
      // This would typically query a calls table filtered by clientId
      // For now, return empty result
      return {
        data: [],
        pagination: {
          page: options.page,
          limit: options.limit,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get client calls', 500);
    }
  }
} 