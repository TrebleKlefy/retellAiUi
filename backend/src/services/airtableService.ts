import Airtable from 'airtable';
import { Lead, CreateLeadRequest, LeadFieldMapping, SyncResult } from '../models/Lead';

export class AirtableService {
  private base: Airtable.Base;

  constructor() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    
    if (!apiKey || !baseId) {
      throw new Error('Airtable API key and Base ID are required');
    }

    this.base = new Airtable({ apiKey }).base(baseId);
  }

  async syncLeads(tableName: string, mapping: LeadFieldMapping): Promise<SyncResult> {
    const result: SyncResult = {
      total: 0,
      imported: 0,
      updated: 0,
      errors: 0,
      errors: []
    };

    try {
      const records = await this.base(tableName).select().all();
      result.total = records.length;

      for (const record of records) {
        try {
          const leadData = this.mapRecordToLead(record, mapping);
          result.imported++;
        } catch (error) {
          result.errors++;
          result.errors?.push({
            record: record.fields,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to sync from Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapRecordToLead(record: Airtable.Record, mapping: LeadFieldMapping): CreateLeadRequest {
    const fields = record.fields;
    const leadData: any = {};

    // Map fields according to the mapping configuration
    Object.keys(mapping).forEach(field => {
      const sourceField = mapping[field];
      if (sourceField && fields[sourceField] !== undefined) {
        leadData[field] = fields[sourceField];
      }
    });

    // Validate required fields
    if (!leadData.firstName || !leadData.lastName || !leadData.phone) {
      throw new Error('Missing required fields: firstName, lastName, or phone');
    }

    return leadData as CreateLeadRequest;
  }

  async getTableFields(tableName: string): Promise<string[]> {
    try {
      const records = await this.base(tableName).select({ maxRecords: 1 }).all();
      if (records.length > 0) {
        return Object.keys(records[0].fields);
      }
      return [];
    } catch (error) {
      throw new Error(`Failed to get table fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.base('Leads').select({ maxRecords: 1 }).all();
      return true;
    } catch (error) {
      return false;
    }
  }
}