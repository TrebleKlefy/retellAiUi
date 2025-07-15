import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from './airtableService';
import { RetellService } from './retellService';
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientStats, 
  IntegrationTestResult 
} from '../models/Client';

export class ClientService {
  private airtableService: AirtableService;
  private retellService: RetellService;

  constructor() {
    this.airtableService = new AirtableService();
    this.retellService = new RetellService();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private getDefaultClientConfig(): Partial<Client> {
    return {
      isActive: true,
      airtable: {
        apiKey: '',
        baseId: '',
        leadsTable: 'Leads',
        resultsTable: 'Call Results',
        enabled: false
      },
      googleSheets: {
        spreadsheetId: '',
        sheetName: 'Sheet1',
        enabled: false,
        syncInterval: null
      },
      retell: {
        apiKey: '',
        agentId: '',
        fromNumber: ''
      },
      schedule: {
        timezone: 'America/New_York',
        activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timeWindows: [{ start: '09:00', end: '17:00' }],
        maxConcurrent: 5,
        delayBetweenCalls: 3000,
        maxAttempts: 3,
        callCooldownHours: 24
      },
      compliance: {
        enableStateFiltering: false,
        allowedStates: [],
        enableDuplicateDetection: true,
        quotaEnabled: false,
        dailyQuota: 100
      },
      preferences: {
        priority: 1,
        urgentCallsEnabled: true,
        batchDialingEnabled: true,
        pauseForUrgent: false,
        leadScoring: true,
        duplicateDetection: true,
        autoFailAfterAttempts: true
      }
    };
  }

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    try {
      // Validate client data
      if (!clientData.name || clientData.name.trim().length === 0) {
        throw new CustomError('Client name is required', 400);
      }

      // Check for duplicate names
      const existingClients = await this.getClients();
      const duplicateName = existingClients.find(
        client => client.name.toLowerCase() === clientData.name.toLowerCase()
      );
      
      if (duplicateName) {
        throw new CustomError('A client with this name already exists', 400);
      }

      // Generate slug
      const slug = this.generateSlug(clientData.name);
      const duplicateSlug = existingClients.find(client => client.slug === slug);
      
      if (duplicateSlug) {
        throw new CustomError('A client with this slug already exists', 400);
      }

      // Merge with default configuration
      const defaultConfig = this.getDefaultClientConfig();
      const newClient: Client = {
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: clientData.name.trim(),
        slug,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        airtable: { ...defaultConfig.airtable!, ...clientData.airtable },
        googleSheets: { ...defaultConfig.googleSheets!, ...clientData.googleSheets },
        retell: { ...defaultConfig.retell!, ...clientData.retell },
        schedule: { ...defaultConfig.schedule!, ...clientData.schedule },
        compliance: { ...defaultConfig.compliance!, ...clientData.compliance },
        preferences: { ...defaultConfig.preferences!, ...clientData.preferences }
      };

      // Test integrations if provided
      if (clientData.airtable?.enabled && clientData.airtable.apiKey && clientData.airtable.baseId) {
        const airtableTest = await this.airtableService.testConnection(
          clientData.airtable.apiKey,
          clientData.airtable.baseId
        );
        if (!airtableTest) {
          throw new CustomError('Airtable integration test failed', 400);
        }
      }

      if (clientData.retell?.apiKey && clientData.retell.agentId) {
        const retellTest = await this.retellService.testConnection(clientData.retell.apiKey);
        if (!retellTest) {
          throw new CustomError('Retell AI integration test failed', 400);
        }
      }

      // In a real application, you would save this to a database
      // For now, we'll return the client object
      return newClient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create client', 500);
    }
  }

  async getClient(clientId: string): Promise<Client> {
    try {
      // In a real application, you would fetch from database
      // For now, we'll return a mock client
      const mockClient: Client = {
        id: clientId,
        name: 'Mock Client',
        slug: 'mock-client',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        airtable: {
          apiKey: '',
          baseId: '',
          leadsTable: 'Leads',
          resultsTable: 'Call Results',
          enabled: false
        },
        googleSheets: {
          spreadsheetId: '',
          sheetName: 'Sheet1',
          enabled: false,
          syncInterval: null
        },
        retell: {
          apiKey: '',
          agentId: '',
          fromNumber: ''
        },
        schedule: {
          timezone: 'America/New_York',
          activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          timeWindows: [{ start: '09:00', end: '17:00' }],
          maxConcurrent: 5,
          delayBetweenCalls: 3000,
          maxAttempts: 3,
          callCooldownHours: 24
        },
        compliance: {
          enableStateFiltering: false,
          allowedStates: [],
          enableDuplicateDetection: true,
          quotaEnabled: false,
          dailyQuota: 100
        },
        preferences: {
          priority: 1,
          urgentCallsEnabled: true,
          batchDialingEnabled: true,
          pauseForUrgent: false,
          leadScoring: true,
          duplicateDetection: true,
          autoFailAfterAttempts: true
        }
      };

      return mockClient;
    } catch (error) {
      throw new CustomError('Client not found', 404);
    }
  }

  async getClients(): Promise<Client[]> {
    try {
      // In a real application, you would fetch from database
      // For now, we'll return mock clients
      const mockClients: Client[] = [
        {
          id: 'client_1',
          name: 'Acme Corporation',
          slug: 'acme-corporation',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          airtable: {
            apiKey: 'key123',
            baseId: 'base123',
            leadsTable: 'Leads',
            resultsTable: 'Call Results',
            enabled: true
          },
          googleSheets: {
            spreadsheetId: 'sheet123',
            sheetName: 'Sheet1',
            enabled: false,
            syncInterval: null
          },
          retell: {
            apiKey: 'retell123',
            agentId: 'agent123',
            fromNumber: '+1234567890'
          },
          schedule: {
            timezone: 'America/New_York',
            activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            timeWindows: [{ start: '09:00', end: '17:00' }],
            maxConcurrent: 5,
            delayBetweenCalls: 3000,
            maxAttempts: 3,
            callCooldownHours: 24
          },
          compliance: {
            enableStateFiltering: false,
            allowedStates: [],
            enableDuplicateDetection: true,
            quotaEnabled: false,
            dailyQuota: 100
          },
          preferences: {
            priority: 1,
            urgentCallsEnabled: true,
            batchDialingEnabled: true,
            pauseForUrgent: false,
            leadScoring: true,
            duplicateDetection: true,
            autoFailAfterAttempts: true
          }
        }
      ];

      return mockClients;
    } catch (error) {
      throw new CustomError('Failed to get clients', 500);
    }
  }

  async updateClient(clientId: string, updates: UpdateClientRequest): Promise<Client> {
    try {
      const existingClient = await this.getClient(clientId);
      
      if (!existingClient) {
        throw new CustomError('Client not found', 404);
      }

      // Validate name uniqueness if name is being updated
      if (updates.name && updates.name !== existingClient.name) {
        const allClients = await this.getClients();
        const duplicateName = allClients.find(
          client => client.id !== clientId && client.name.toLowerCase() === updates.name!.toLowerCase()
        );
        
        if (duplicateName) {
          throw new CustomError('A client with this name already exists', 400);
        }
      }

      // Test integrations if they're being updated
      if (updates.airtable?.enabled && updates.airtable.apiKey && updates.airtable.baseId) {
        const airtableTest = await this.airtableService.testConnection(
          updates.airtable.apiKey,
          updates.airtable.baseId
        );
        if (!airtableTest) {
          throw new CustomError('Airtable integration test failed', 400);
        }
      }

      if (updates.retell?.apiKey && updates.retell.agentId) {
        const retellTest = await this.retellService.testConnection(updates.retell.apiKey);
        if (!retellTest) {
          throw new CustomError('Retell AI integration test failed', 400);
        }
      }

      // Merge updates with existing client
      const updatedClient: Client = {
        ...existingClient,
        ...updates,
        updatedAt: new Date(),
        airtable: { ...existingClient.airtable, ...updates.airtable },
        googleSheets: { ...existingClient.googleSheets, ...updates.googleSheets },
        retell: { ...existingClient.retell, ...updates.retell },
        schedule: { ...existingClient.schedule, ...updates.schedule },
        compliance: { ...existingClient.compliance, ...updates.compliance },
        preferences: { ...existingClient.preferences, ...updates.preferences }
      };

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
      const existingClient = await this.getClient(clientId);
      
      if (!existingClient) {
        throw new CustomError('Client not found', 404);
      }

      // In a real application, you would:
      // 1. Check if client has active leads/calls
      // 2. Archive client data
      // 3. Remove client record
      
      // For now, we'll just return success
      return;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete client', 500);
    }
  }

  async testIntegrations(clientId: string): Promise<IntegrationTestResult> {
    try {
      const client = await this.getClient(clientId);
      
      const results: IntegrationTestResult = {
        airtable: false,
        googleSheets: false,
        retell: false
      };

      // Test Airtable
      if (client.airtable.enabled && client.airtable.apiKey && client.airtable.baseId) {
        results.airtable = await this.airtableService.testConnection(
          client.airtable.apiKey,
          client.airtable.baseId
        );
      }

      // Test Google Sheets
      if (client.googleSheets.enabled && client.googleSheets.spreadsheetId) {
        // Note: Google Sheets requires OAuth2, so we'll need a different approach
        // For now, we'll just check if the configuration is valid
        results.googleSheets = !!client.googleSheets.spreadsheetId;
      }

      // Test Retell AI
      if (client.retell.apiKey && client.retell.agentId) {
        results.retell = await this.retellService.testConnection(client.retell.apiKey);
      }

      return results;
    } catch (error) {
      throw new CustomError('Failed to test integrations', 500);
    }
  }

  async getClientStats(_clientId: string): Promise<ClientStats> {
    try {
      // In a real application, you would calculate these from the database
      // For now, we'll return mock stats
      const mockStats: ClientStats = {
        totalLeads: 150,
        activeLeads: 45,
        totalCalls: 120,
        successfulCalls: 85,
        successRate: 70.8
      };

      return mockStats;
    } catch (error) {
      throw new CustomError('Failed to get client stats', 500);
    }
  }
} 