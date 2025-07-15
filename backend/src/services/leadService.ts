import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from './airtableService';
import { GoogleSheetsService } from './googleSheetsService';
import { FileProcessingService } from './fileProcessingService';
import { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  ImportLeadRequest, 
  LeadFieldMapping,
  LeadFilters,
  LeadStats,
  ImportResult,
  SyncResult,
  LeadStatus,
  LeadPriority
} from '../models/Lead';

export class LeadService {
  private airtableService: AirtableService;
  private googleSheetsService: GoogleSheetsService;
  private fileProcessingService: FileProcessingService;
  private readonly tableName = 'Leads';

  constructor() {
    this.airtableService = new AirtableService();
    this.googleSheetsService = new GoogleSheetsService();
    this.fileProcessingService = new FileProcessingService();
  }

  async createLead(leadData: CreateLeadRequest, userId: string): Promise<Lead> {
    try {
      // Check for duplicates
      const duplicates = await this.detectDuplicates(leadData, leadData.clientId);
      if (duplicates.length > 0) {
        throw new CustomError('Duplicate lead found', 400);
      }

      // Calculate lead score
      const score = await this.calculateLeadScore(leadData);

      const newLead = await AirtableService.createRecord(this.tableName, {
        ...leadData,
        status: LeadStatus.NEW,
        priority: leadData.priority || LeadPriority.NORMAL,
        score,
        attemptCount: 0,
        maxAttempts: 5,
        tags: leadData.tags || [],
        customFields: leadData.customFields || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newLead;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create lead', 500);
    }
  }

  async getLeads(clientId: string, filters?: LeadFilters & { page?: number; limit?: number }): Promise<Lead[]> {
    try {
      const { page = 1, limit = 10, search, status, priority, source, assignedTo, dateFrom, dateTo, tags, scoreMin, scoreMax } = filters || {};
      const offset = (page - 1) * limit;

      let filterFormula = '';
      const conditions = [];

      // Client filter
      conditions.push(`{ClientId} = '${clientId}'`);

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {FirstName}) > 0, SEARCH('${search}', {LastName}) > 0, SEARCH('${search}', {Email}) > 0, SEARCH('${search}', {Phone}) > 0)`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
      }

      if (priority) {
        conditions.push(`{Priority} = '${priority}'`);
      }

      if (source) {
        conditions.push(`{Source} = '${source}'`);
      }

      if (assignedTo) {
        conditions.push(`{AssignedTo} = '${assignedTo}'`);
      }

      if (dateFrom || dateTo) {
        let dateCondition = '';
        if (dateFrom && dateTo) {
          dateCondition = `AND({CreatedAt} >= '${dateFrom}', {CreatedAt} <= '${dateTo}')`;
        } else if (dateFrom) {
          dateCondition = `{CreatedAt} >= '${dateFrom}'`;
        } else if (dateTo) {
          dateCondition = `{CreatedAt} <= '${dateTo}'`;
        }
        conditions.push(dateCondition);
      }

      if (tags && tags.length > 0) {
        const tagConditions = tags.map(tag => `SEARCH('${tag}', {Tags}) > 0`);
        conditions.push(`OR(${tagConditions.join(', ')})`);
      }

      if (scoreMin !== undefined) {
        conditions.push(`{Score} >= ${scoreMin}`);
      }

      if (scoreMax !== undefined) {
        conditions.push(`{Score} <= ${scoreMax}`);
      }

      if (conditions.length > 0) {
        filterFormula = `AND(${conditions.join(', ')})`;
      }

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula,
        maxRecords: limit,
        offset: offset
      });

      return records;
    } catch (error) {
      throw new CustomError('Failed to get leads', 500);
    }
  }

  async getLead(leadId: string): Promise<Lead> {
    try {
      const lead = await AirtableService.getRecord(this.tableName, leadId);
      
      if (!lead) {
        throw new CustomError('Lead not found', 404);
      }

      return lead;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get lead', 500);
    }
  }

  async updateLead(leadId: string, updates: UpdateLeadRequest): Promise<Lead> {
    try {
      const existingLead = await AirtableService.getRecord(this.tableName, leadId);
      
      if (!existingLead) {
        throw new CustomError('Lead not found', 404);
      }

      // Recalculate score if relevant fields changed
      if (updates.email || updates.phone || updates.source || updates.priority) {
        const updatedData = { ...existingLead, ...updates };
        updates.score = await this.calculateLeadScore(updatedData);
      }

      const updatedLead = await AirtableService.updateRecord(this.tableName, leadId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      return updatedLead;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update lead', 500);
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    try {
      const existingLead = await AirtableService.getRecord(this.tableName, leadId);
      
      if (!existingLead) {
        throw new CustomError('Lead not found', 404);
      }

      await AirtableService.deleteRecord(this.tableName, leadId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete lead', 500);
    }
  }

  async importLeads(importRequest: ImportLeadRequest): Promise<ImportResult> {
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result: ImportResult = {
      total: 0,
      imported: 0,
      duplicates: 0,
      errors: 0,
      sessionId,
      errors: []
    };

    try {
      let rawData: any[] = [];

      if (importRequest.file) {
        // Process uploaded file
        rawData = await this.fileProcessingService.processFile(importRequest.file);
      } else if (importRequest.airtableSync) {
        // Sync from Airtable
        const syncResult = await this.syncFromAirtable(importRequest.clientId);
        return {
          total: syncResult.total,
          imported: syncResult.imported,
          duplicates: 0,
          errors: syncResult.errors,
          sessionId
        };
      } else if (importRequest.googleSheetsSync) {
        // Sync from Google Sheets
        const syncResult = await this.syncFromGoogleSheets(importRequest.clientId);
        return {
          total: syncResult.total,
          imported: syncResult.imported,
          duplicates: 0,
          errors: syncResult.errors,
          sessionId
        };
      }

      result.total = rawData.length;

      // Map data to lead format
      const mappedData = this.fileProcessingService.mapDataToLeadFormat(rawData, importRequest.mapping);
      
      // Clean and validate data
      const cleanedData = this.fileProcessingService.cleanData(mappedData);

      for (const data of cleanedData) {
        try {
          // Validate data
          const validation = this.fileProcessingService.validateLeadData(data);
          if (!validation.isValid) {
            result.errors++;
            result.errors?.push({
              row: data._rowIndex,
              field: 'validation',
              message: validation.errors.join(', '),
              data
            });
            continue;
          }

          // Check for duplicates
          const duplicates = await this.detectDuplicates(data, importRequest.clientId);
          if (duplicates.length > 0) {
            result.duplicates++;
            continue;
          }

          // Create lead
          await this.createLead({
            ...data,
            clientId: importRequest.clientId,
            importedAt: new Date()
          }, 'system');

          result.imported++;
        } catch (error) {
          result.errors++;
          result.errors?.push({
            row: data._rowIndex,
            field: 'import',
            message: error instanceof Error ? error.message : 'Unknown error',
            data
          });
        }
      }

      return result;
    } catch (error) {
      throw new CustomError(`Failed to import leads: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async syncFromAirtable(clientId: string): Promise<SyncResult> {
    try {
      const mapping: LeadFieldMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        state: 'State',
        zipCode: 'Zip Code',
        country: 'Country',
        source: 'Source',
        notes: 'Notes'
      };

      const result = await this.airtableService.syncLeads('Leads', mapping);
      
      // Process imported data
      for (const record of result.imported) {
        try {
          await this.createLead({
            ...record,
            clientId,
            importedAt: new Date()
          }, 'system');
        } catch (error) {
          result.errors++;
        }
      }

      return result;
    } catch (error) {
      throw new CustomError(`Failed to sync from Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async syncFromGoogleSheets(clientId: string): Promise<SyncResult> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
      const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z';
      
      if (!spreadsheetId) {
        throw new CustomError('Google Sheets Spreadsheet ID not configured', 500);
      }

      const mapping: LeadFieldMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        state: 'State',
        zipCode: 'Zip Code',
        country: 'Country',
        source: 'Source',
        notes: 'Notes'
      };

      const result = await this.googleSheetsService.syncLeads(spreadsheetId, range, mapping);
      
      // Process imported data
      for (const record of result.imported) {
        try {
          await this.createLead({
            ...record,
            clientId,
            importedAt: new Date()
          }, 'system');
        } catch (error) {
          result.errors++;
        }
      }

      return result;
    } catch (error) {
      throw new CustomError(`Failed to sync from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async calculateLeadScore(lead: Partial<Lead>): Promise<number> {
    let score = 0;

    // Email presence (20 points)
    if (lead.email && lead.email.trim() !== '') {
      score += 20;
    }

    // Phone number quality (25 points)
    if (lead.phone) {
      const digitsOnly = lead.phone.replace(/\D/g, '');
      if (digitsOnly.length >= 10) {
        score += 25;
      } else if (digitsOnly.length >= 7) {
        score += 15;
      }
    }

    // Source quality (15 points)
    const highQualitySources = ['website', 'referral', 'cold_call', 'trade_show'];
    if (lead.source && highQualitySources.includes(lead.source.toLowerCase())) {
      score += 15;
    } else if (lead.source) {
      score += 5;
    }

    // Priority bonus (10 points)
    if (lead.priority === LeadPriority.URGENT) {
      score += 10;
    } else if (lead.priority === LeadPriority.HIGH) {
      score += 5;
    }

    // Address completeness (10 points)
    if (lead.address && lead.city && lead.state) {
      score += 10;
    } else if (lead.address || lead.city || lead.state) {
      score += 5;
    }

    // Tags (5 points per tag, max 15)
    if (lead.tags && lead.tags.length > 0) {
      score += Math.min(lead.tags.length * 5, 15);
    }

    // Custom fields (5 points per field, max 15)
    if (lead.customFields && Object.keys(lead.customFields).length > 0) {
      score += Math.min(Object.keys(lead.customFields).length * 5, 15);
    }

    return Math.min(score, 100); // Cap at 100
  }

  async detectDuplicates(lead: Partial<Lead>, clientId: string): Promise<Lead[]> {
    try {
      const conditions = [
        `{ClientId} = '${clientId}'`,
        `OR({Email} = '${lead.email}', {Phone} = '${lead.phone}')`
      ];

      const filterFormula = `AND(${conditions.join(', ')})`;

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula
      });

      return records.filter(record => 
        record.email === lead.email || record.phone === lead.phone
      );
    } catch (error) {
      return [];
    }
  }

  async getLeadStats(clientId: string): Promise<LeadStats> {
    try {
      const allLeads = await this.getLeads(clientId);
      
      const totalValue = allLeads.reduce((sum, lead) => sum + (lead.score || 0), 0);
      const saleMadeLeads = allLeads.filter(lead => lead.status === LeadStatus.SALE_MADE).length;
      const conversionRate = allLeads.length > 0 ? (saleMadeLeads / allLeads.length) * 100 : 0;
      const averageScore = allLeads.length > 0 ? totalValue / allLeads.length : 0;

      const stats: LeadStats = {
        total: allLeads.length,
        new: allLeads.filter(lead => lead.status === LeadStatus.NEW).length,
        inProgress: allLeads.filter(lead => lead.status === LeadStatus.IN_PROGRESS).length,
        contacted: allLeads.filter(lead => lead.status === LeadStatus.CONTACTED).length,
        qualified: allLeads.filter(lead => lead.status === LeadStatus.QUALIFIED).length,
        appointmentScheduled: allLeads.filter(lead => lead.status === LeadStatus.APPOINTMENT_SCHEDULED).length,
        saleMade: saleMadeLeads,
        notInterested: allLeads.filter(lead => lead.status === LeadStatus.NOT_INTERESTED).length,
        doNotCall: allLeads.filter(lead => lead.status === LeadStatus.DO_NOT_CALL).length,
        failed: allLeads.filter(lead => lead.status === LeadStatus.FAILED).length,
        expired: allLeads.filter(lead => lead.status === LeadStatus.EXPIRED).length,
        totalValue,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100
      };

      return stats;
    } catch (error) {
      throw new CustomError('Failed to get lead stats', 500);
    }
  }

  async getImportProgress(sessionId: string): Promise<{
    status: string;
    progress: number;
    total: number;
    processed: number;
  }> {
    // This would typically be stored in a cache or database
    // For now, return a mock response
    return {
      status: 'completed',
      progress: 100,
      total: 0,
      processed: 0
    };
  }
} 