import { google } from 'googleapis';
import { CustomError } from '../middleware/errorHandler';

export class GoogleSheetsService {

  async testConnection(apiKey: string, spreadsheetId: string): Promise<boolean> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      // Try to get spreadsheet metadata
      const response = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        ranges: [],
        includeGridData: false
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
  }

  async validateSheet(apiKey: string, spreadsheetId: string, sheetName: string): Promise<boolean> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      // Try to read a small range from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1:A1`
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Google Sheets sheet validation failed:', error);
      return false;
    }
  }

  async getValues(apiKey: string, spreadsheetId: string, sheetName: string, range?: string): Promise<any[][]> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range || sheetName
      });
      
      return response.data.values || [];
    } catch (error: any) {
      throw new CustomError(`Failed to get values from Google Sheets: ${error.message}`, 500);
    }
  }

  async appendValues(apiKey: string, spreadsheetId: string, sheetName: string, values: any[][]): Promise<any> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to append values to Google Sheets: ${error.message}`, 500);
    }
  }

  async updateValues(apiKey: string, spreadsheetId: string, sheetName: string, range: string, values: any[][]): Promise<any> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to update values in Google Sheets: ${error.message}`, 500);
    }
  }

  async getSheetInfo(apiKey: string, spreadsheetId: string): Promise<any> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: apiKey });
      
      const response = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        includeGridData: false
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to get sheet info from Google Sheets: ${error.message}`, 500);
    }
  }
}