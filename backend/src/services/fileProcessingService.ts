import XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import { LeadFieldMapping } from '../models/Lead';

export class FileProcessingService {
  async processExcelFile(filePath: string): Promise<any[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Clean up file
      fs.unlinkSync(filePath);
      
      return data;
    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  async processCSVFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Clean up file
          fs.unlinkSync(filePath);
          resolve(results);
        })
        .on('error', (error) => {
          // Clean up file on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error(`Failed to process CSV file: ${error.message}`));
        });
    });
  }

  async processFile(file: Express.Multer.File): Promise<any[]> {
    const filePath = file.path;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'xlsx':
      case 'xls':
        return this.processExcelFile(filePath);
      case 'csv':
        return this.processCSVFile(filePath);
      default:
        // Clean up unsupported file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw new Error('Unsupported file format. Please upload CSV or Excel files only.');
    }
  }

  mapDataToLeadFormat(rawData: any[], mapping: LeadFieldMapping): any[] {
    return rawData.map((row, index) => {
      const mappedData: any = {};
      
      // Map each field according to the mapping configuration
      Object.keys(mapping).forEach(field => {
        const sourceField = mapping[field];
        if (sourceField && row[sourceField] !== undefined) {
          mappedData[field] = row[sourceField];
        }
      });

      // Add row index for error tracking
      mappedData._rowIndex = index + 1;
      
      return mappedData;
    });
  }

  validateLeadData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!data.phone || data.phone.trim() === '') {
      errors.push('Phone number is required');
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it has 10-15 digits (international format)
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Format as US phone number if 10 digits
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    
    // Return original if can't format
    return phone;
  }

  normalizeName(name: string): string {
    // Capitalize first letter of each word
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  cleanData(data: any[]): any[] {
    return data.map(row => ({
      ...row,
      firstName: row.firstName ? this.normalizeName(row.firstName) : row.firstName,
      lastName: row.lastName ? this.normalizeName(row.lastName) : row.lastName,
      phone: row.phone ? this.normalizePhoneNumber(row.phone) : row.phone,
      email: row.email ? row.email.toLowerCase().trim() : row.email,
      address: row.address ? row.address.trim() : row.address,
      city: row.city ? row.city.trim() : row.city,
      state: row.state ? row.state.trim().toUpperCase() : row.state,
      zipCode: row.zipCode ? row.zipCode.toString().trim() : row.zipCode,
      country: row.country ? row.country.trim() : row.country,
      source: row.source ? row.source.trim() : row.source,
      notes: row.notes ? row.notes.trim() : row.notes
    }));
  }
}