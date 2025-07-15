import Airtable from 'airtable';
import { CustomError } from '../middleware/errorHandler';

export class AirtableService {
  async testConnection(apiKey: string, baseId: string): Promise<boolean> {
    try {
      const testBase = new Airtable({ apiKey }).base(baseId);
      
      // Try to get the first table to test the connection
      const table = testBase.table('Test');
      
      // If we can get a table, the connection is working
      return !!table;
    } catch (error) {
      console.error('Airtable connection test failed:', error);
      return false;
    }
  }

  async validateTable(apiKey: string, baseId: string, tableName: string): Promise<boolean> {
    try {
      const testBase = new Airtable({ apiKey }).base(baseId);
      
      // Try to get the first record from the table
      await testBase(tableName).select({ maxRecords: 1 }).firstPage();
      
      return true;
    } catch (error) {
      console.error('Airtable table validation failed:', error);
      return false;
    }
  }

  async getRecords(apiKey: string, baseId: string, tableName: string, options: {
    filterByFormula?: string;
    maxRecords?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      const base = new Airtable({ apiKey }).base(baseId);
      const table = base(tableName);
      
      const selectOptions: any = {};
      
      if (options.filterByFormula) {
        selectOptions.filterByFormula = options.filterByFormula;
      }
      
      if (options.maxRecords) {
        selectOptions.maxRecords = options.maxRecords;
      }
      
      const records = await table.select(selectOptions).firstPage();
      return records.map(record => ({
        id: record.id,
        ...record.fields
      } as any));
    } catch (error: any) {
      throw new CustomError(`Failed to get records from Airtable: ${error.message}`, 500);
    }
  }

  async createRecord(apiKey: string, baseId: string, tableName: string, fields: any): Promise<any> {
    try {
      const base = new Airtable({ apiKey }).base(baseId);
      const table = base(tableName);
      
      const record = await table.create(fields);
      return {
        id: record.id,
        ...record.fields
      } as any;
    } catch (error: any) {
      throw new CustomError(`Failed to create record in Airtable: ${error.message}`, 500);
    }
  }

  async updateRecord(apiKey: string, baseId: string, tableName: string, recordId: string, fields: any): Promise<any> {
    try {
      const base = new Airtable({ apiKey }).base(baseId);
      const table = base(tableName);
      
      const record = await table.update(recordId, fields);
      return {
        id: record.id,
        ...record.fields
      } as any;
    } catch (error: any) {
      throw new CustomError(`Failed to update record in Airtable: ${error.message}`, 500);
    }
  }
}