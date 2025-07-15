import Airtable from 'airtable';
import { google } from 'googleapis';
import { config } from '../config/environment';

// Airtable configuration
const airtable = new Airtable({ apiKey: config.airtable.apiKey });
const base = airtable.base(config.airtable.baseId!);

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export class AirtableService {
  static async getRecords(tableName: string, options: any = {}) {
    try {
      const records = await base(tableName).select(options).all();
      return records.map(record => ({
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      }));
    } catch (error) {
      console.error('Airtable getRecords error:', error);
      throw error;
    }
  }

  static async getRecord(tableName: string, recordId: string) {
    try {
      const record = await base(tableName).find(recordId);
      return {
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      };
    } catch (error) {
      console.error('Airtable getRecord error:', error);
      throw error;
    }
  }

  static async createRecord(tableName: string, fields: any) {
    try {
      const record = await base(tableName).create([{ fields }]);
      return {
        id: record[0].id,
        ...record[0].fields,
        createdTime: record[0]._rawJson.createdTime
      };
    } catch (error) {
      console.error('Airtable createRecord error:', error);
      throw error;
    }
  }

  static async updateRecord(tableName: string, recordId: string, fields: any) {
    try {
      const record = await base(tableName).update([{ id: recordId, fields }]);
      return {
        id: record[0].id,
        ...record[0].fields,
        createdTime: record[0]._rawJson.createdTime
      };
    } catch (error) {
      console.error('Airtable updateRecord error:', error);
      throw error;
    }
  }

  static async deleteRecord(tableName: string, recordId: string) {
    try {
      await base(tableName).destroy(recordId);
      return true;
    } catch (error) {
      console.error('Airtable deleteRecord error:', error);
      throw error;
    }
  }
}

export class GoogleSheetsService {
  static async readSheet(spreadsheetId: string, range: string) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values;
    } catch (error) {
      console.error('Google Sheets readSheet error:', error);
      throw error;
    }
  }

  static async writeSheet(spreadsheetId: string, range: string, values: any[][]) {
    try {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Google Sheets writeSheet error:', error);
      throw error;
    }
  }

  static async appendSheet(spreadsheetId: string, range: string, values: any[][]) {
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Google Sheets appendSheet error:', error);
      throw error;
    }
  }

  static async createSheet(spreadsheetId: string, title: string) {
    try {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Google Sheets createSheet error:', error);
      throw error;
    }
  }
}

// Database connection test
export const testDatabaseConnection = async () => {
  try {
    // Test Airtable connection
    if (config.airtable.apiKey && config.airtable.baseId) {
      await AirtableService.getRecords('Users', { maxRecords: 1 });
      console.log('✅ Airtable connection successful');
    }

    // Test Google Sheets connection
    if (config.google.clientId && config.google.clientSecret) {
      console.log('✅ Google Sheets credentials configured');
    }

    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}; 