import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { Lead, CreateLeadRequest, UpdateLeadRequest, LeadStats, LeadFilters } from '../models/Lead';

export class LeadService {
  private readonly tableName = 'Leads';

  async getLeads(options: LeadFilters & { page: number; limit: number }) {
    try {
      const { page, limit, search, status, source, assignedTo, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      const conditions = [];

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {FirstName}) > 0, SEARCH('${search}', {LastName}) > 0, SEARCH('${search}', {Email}) > 0, SEARCH('${search}', {Company}) > 0)`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
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
      throw new CustomError('Failed to get leads', 500);
    }
  }

  async getLeadById(leadId: string): Promise<Lead> {
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

  async createLead(leadData: CreateLeadRequest, userId: string): Promise<Lead> {
    try {
      const newLead = await AirtableService.createRecord(this.tableName, {
        ...leadData,
        assignedTo: userId,
        status: leadData.status || 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newLead;
    } catch (error) {
      throw new CustomError('Failed to create lead', 500);
    }
  }

  async updateLead(leadId: string, updateData: UpdateLeadRequest): Promise<Lead> {
    try {
      const existingLead = await AirtableService.getRecord(this.tableName, leadId);
      
      if (!existingLead) {
        throw new CustomError('Lead not found', 404);
      }

      const updatedLead = await AirtableService.updateRecord(this.tableName, leadId, {
        ...updateData,
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

  async getLeadStats(): Promise<LeadStats> {
    try {
      const allLeads = await AirtableService.getRecords(this.tableName);
      
      const totalValue = allLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
      const closedLeads = allLeads.filter(lead => lead.status === 'closed').length;
      const conversionRate = allLeads.length > 0 ? (closedLeads / allLeads.length) * 100 : 0;

      const stats: LeadStats = {
        total: allLeads.length,
        new: allLeads.filter(lead => lead.status === 'new').length,
        contacted: allLeads.filter(lead => lead.status === 'contacted').length,
        qualified: allLeads.filter(lead => lead.status === 'qualified').length,
        proposal: allLeads.filter(lead => lead.status === 'proposal').length,
        closed: closedLeads,
        lost: allLeads.filter(lead => lead.status === 'lost').length,
        totalValue,
        conversionRate: Math.round(conversionRate * 100) / 100
      };

      return stats;
    } catch (error) {
      throw new CustomError('Failed to get lead stats', 500);
    }
  }

  async getLeadCalls(leadId: string, options: { page: number; limit: number }) {
    try {
      // This would typically query a calls table filtered by leadId
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
      throw new CustomError('Failed to get lead calls', 500);
    }
  }

  async convertToClient(leadId: string, clientData: any, userId: string) {
    try {
      const lead = await this.getLeadById(leadId);
      
      if (!lead) {
        throw new CustomError('Lead not found', 404);
      }

      // Create client from lead data
      const clientService = new (await import('./clientService')).ClientService();
      const newClient = await clientService.createClient({
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        assignedTo: userId
      }, userId);

      // Update lead with client ID
      await this.updateLead(leadId, {
        clientId: newClient.id,
        status: 'closed'
      });

      return newClient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to convert lead to client', 500);
    }
  }

  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    try {
      return await this.updateLead(leadId, { status });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update lead status', 500);
    }
  }

  async bulkImport(leadsData: CreateLeadRequest[], userId: string) {
    try {
      const results = [];
      
      for (const leadData of leadsData) {
        try {
          const lead = await this.createLead(leadData, userId);
          results.push({ success: true, data: lead });
        } catch (error) {
          results.push({ success: false, error: error.message, data: leadData });
        }
      }

      return {
        total: leadsData.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      throw new CustomError('Failed to import leads', 500);
    }
  }

  async bulkUpdate(leadIds: string[], updateData: UpdateLeadRequest) {
    try {
      const results = [];
      
      for (const leadId of leadIds) {
        try {
          const lead = await this.updateLead(leadId, updateData);
          results.push({ success: true, data: lead });
        } catch (error) {
          results.push({ success: false, error: error.message, leadId });
        }
      }

      return {
        total: leadIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      throw new CustomError('Failed to update leads', 500);
    }
  }
} 