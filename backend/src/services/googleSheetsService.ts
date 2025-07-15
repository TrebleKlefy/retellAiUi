import { google } from 'googleapis';
import { Lead, CreateLeadRequest, LeadFieldMapping, SyncResult } from '../models/Lead';

export class GoogleSheetsService {
  private sheets: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async syncLeads(spreadsheetId: string, range: string, mapping: LeadFieldMapping): Promise<SyncResult> {
    const result: SyncResult = {
      total: 0,
      imported: 0,
      updated: 0,
      errors: 0,
      errors: []
    };

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return result;
      }

      // First row contains headers
      const headers = rows[0];
      const dataRows = rows.slice(1);
      result.total = dataRows.length;

      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          const leadData = this.mapRowToLead(row, headers, mapping);
          result.imported++;
        } catch (error) {
          result.errors++;
          result.errors?.push({
            record: dataRows[i],
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to sync from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapRowToLead(row: any[], headers: string[], mapping: LeadFieldMapping): CreateLeadRequest {
    const leadData: any = {};

    // Map fields according to the mapping configuration
    Object.keys(mapping).forEach(field => {
      const sourceField = mapping[field];
      if (sourceField) {
        const columnIndex = headers.findIndex(header => 
          header.toLowerCase() === sourceField.toLowerCase()
        );
        if (columnIndex !== -1 && row[columnIndex] !== undefined) {
          leadData[field] = row[columnIndex];
        }
      }
    });

    // Validate required fields
    if (!leadData.firstName || !leadData.lastName || !leadData.phone) {
      throw new Error('Missing required fields: firstName, lastName, or phone');
    }

    return leadData as CreateLeadRequest;
  }

  async getSheetHeaders(spreadsheetId: string, range: string): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${range}!A1:Z1`, // Get first row
      });

      const rows = response.data.values;
      return rows && rows.length > 0 ? rows[0] : [];
    } catch (error) {
      throw new Error(`Failed to get sheet headers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(spreadsheetId: string): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSpreadsheetInfo(spreadsheetId: string): Promise<{
    title: string;
    sheets: Array<{ title: string; sheetId: number }>;
  }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet: any) => ({
          title: sheet.properties.title,
          sheetId: sheet.properties.sheetId,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get spreadsheet info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}