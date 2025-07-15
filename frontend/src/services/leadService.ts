import api from './api';
import { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  ImportLeadRequest, 
  LeadFilters,
  LeadStats,
  ImportResult,
  SyncResult,
  ImportProgress
} from '../types/lead';

export class LeadService {
  async getLeads(clientId: string, filters?: LeadFilters): Promise<Lead[]> {
    const response = await api.get(`/clients/${clientId}/leads`, { params: filters });
    return response.data.data;
  }

  async getLead(leadId: string): Promise<Lead> {
    const response = await api.get(`/leads/${leadId}`);
    return response.data.data;
  }

  async createLead(clientId: string, leadData: CreateLeadRequest): Promise<Lead> {
    const response = await api.post(`/clients/${clientId}/leads`, leadData);
    return response.data.data;
  }

  async updateLead(leadId: string, updates: UpdateLeadRequest): Promise<Lead> {
    const response = await api.put(`/leads/${leadId}`, updates);
    return response.data.data;
  }

  async deleteLead(leadId: string): Promise<void> {
    await api.delete(`/leads/${leadId}`);
  }

  async getLeadStats(clientId: string): Promise<LeadStats> {
    const response = await api.get(`/clients/${clientId}/leads/stats`);
    return response.data.data;
  }

  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    const response = await api.put(`/leads/${leadId}/status`, { status });
    return response.data.data;
  }

  async importLeads(clientId: string, file: File, mapping: any): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    const response = await api.post(`/clients/${clientId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async syncFromAirtable(clientId: string): Promise<SyncResult> {
    const response = await api.post(`/clients/${clientId}/sync/airtable`);
    return response.data.data;
  }

  async syncFromGoogleSheets(clientId: string): Promise<SyncResult> {
    const response = await api.post(`/clients/${clientId}/sync/google-sheets`);
    return response.data.data;
  }

  async getImportProgress(sessionId: string): Promise<ImportProgress> {
    const response = await api.get(`/import/${sessionId}/progress`);
    return response.data.data;
  }

  async calculateLeadScore(leadData: Partial<Lead>): Promise<number> {
    const response = await api.post('/leads/calculate-score', leadData);
    return response.data.data.score;
  }

  async detectDuplicates(clientId: string, leadData: Partial<Lead>): Promise<Lead[]> {
    const response = await api.post(`/clients/${clientId}/leads/detect-duplicates`, leadData);
    return response.data.data.duplicates;
  }

  // Helper method to format lead status for display
  formatLeadStatus(status: string): string {
    const statusMap: Record<string, string> = {
      new: 'New',
      in_progress: 'In Progress',
      contacted: 'Contacted',
      qualified: 'Qualified',
      appointment_scheduled: 'Appointment Scheduled',
      sale_made: 'Sale Made',
      not_interested: 'Not Interested',
      do_not_call: 'Do Not Call',
      failed: 'Failed',
      expired: 'Expired'
    };
    return statusMap[status] || status;
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-green-100 text-green-800',
      appointment_scheduled: 'bg-indigo-100 text-indigo-800',
      sale_made: 'bg-emerald-100 text-emerald-800',
      not_interested: 'bg-red-100 text-red-800',
      do_not_call: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to format priority for display
  formatPriority(priority: string): string {
    const priorityMap: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High',
      normal: 'Normal',
      low: 'Low'
    };
    return priorityMap[priority] || priority;
  }

  // Helper method to get priority color
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to format phone number
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  // Helper method to validate email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to validate phone
  isValidPhone(phone: string): boolean {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }
}

export const leadService = new LeadService();