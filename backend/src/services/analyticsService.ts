import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { 
  AnalyticsData, 
  Dashboard, 
  DashboardWidget,
  LeadMetrics,
  CallMetrics,
  QueueMetrics,
  PerformanceMetrics,
  TrendData,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  ReportConfig
} from '../models/Dashboard';
import { LeadService } from './leadService';
import { CallService } from './callService';
import { QueueService } from './queueService';
import { ClientService } from './clientService';

export class AnalyticsService {
  private leadService: LeadService;
  private callService: CallService;
  private queueService: QueueService;
  private clientService: ClientService;
  private readonly dashboardTableName = 'Dashboards';

  constructor() {
    this.leadService = new LeadService();
    this.callService = new CallService();
    this.queueService = new QueueService();
    this.clientService = new ClientService();
  }

  async getDashboardData(clientId?: string, timeRange: string = '7d'): Promise<AnalyticsData> {
    try {
      const [leads, calls, queue, performance] = await Promise.all([
        this.getLeadMetrics(clientId, timeRange),
        this.getCallMetrics(clientId, timeRange),
        this.getQueueMetrics(clientId),
        this.getPerformanceMetrics(clientId, timeRange)
      ]);

      return {
        leads,
        calls,
        queue,
        performance,
        trends: await this.getTrendData(clientId, timeRange)
      };
    } catch (error) {
      throw new CustomError('Failed to get dashboard data', 500);
    }
  }

  async getLeadMetrics(clientId?: string, timeRange: string = '7d'): Promise<LeadMetrics> {
    try {
      const allLeads = await AirtableService.getRecords('Leads');
      
      // Filter by client if provided
      let leads = allLeads;
      if (clientId) {
        leads = allLeads.filter(lead => lead.clientId === clientId);
      }

      // Filter by time range
      leads = this.filterByTimeRange(leads, timeRange, 'createdAt');

      const total = leads.length;
      const newLeads = leads.filter(lead => lead.status === 'new').length;
      const contacted = leads.filter(lead => lead.status === 'contacted').length;
      const qualified = leads.filter(lead => lead.status === 'qualified').length;
      const converted = leads.filter(lead => lead.status === 'closed').length;

      const conversionRate = total > 0 ? (converted / total) * 100 : 0;
      
      // Calculate average score (assuming leads have a score field)
      const leadsWithScore = leads.filter(lead => lead.value !== undefined);
      const averageScore = leadsWithScore.length > 0 
        ? leadsWithScore.reduce((sum, lead) => sum + (lead.value || 0), 0) / leadsWithScore.length 
        : 0;

      return {
        total,
        new: newLeads,
        contacted,
        qualified,
        converted,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100
      };
    } catch (error) {
      throw new CustomError('Failed to get lead metrics', 500);
    }
  }

  async getCallMetrics(clientId?: string, timeRange: string = '7d'): Promise<CallMetrics> {
    try {
      const allCalls = await AirtableService.getRecords('Calls');
      
      // Filter by client if provided (through leads)
      let calls = allCalls;
      if (clientId) {
        const clientLeads = await AirtableService.getRecords('Leads');
        const clientLeadIds = clientLeads
          .filter(lead => lead.clientId === clientId)
          .map(lead => lead.id);
        calls = allCalls.filter(call => clientLeadIds.includes(call.leadId));
      }

      // Filter by time range
      calls = this.filterByTimeRange(calls, timeRange, 'createdAt');

      const total = calls.length;
      const successful = calls.filter(call => call.outcome === 'successful').length;
      const failed = calls.filter(call => call.outcome === 'failed').length;
      const successRate = total > 0 ? (successful / total) * 100 : 0;

      const callsWithDuration = calls.filter(call => call.duration !== undefined);
      const averageDuration = callsWithDuration.length > 0 
        ? callsWithDuration.reduce((sum, call) => sum + (call.duration || 0), 0) / callsWithDuration.length 
        : 0;
      
      const totalDuration = callsWithDuration.reduce((sum, call) => sum + (call.duration || 0), 0);

      // Calculate outcome distribution
      const outcomes: Record<string, number> = {};
      calls.forEach(call => {
        outcomes[call.outcome] = (outcomes[call.outcome] || 0) + 1;
      });

      return {
        total,
        successful,
        failed,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(averageDuration * 100) / 100,
        totalDuration,
        outcomes
      };
    } catch (error) {
      throw new CustomError('Failed to get call metrics', 500);
    }
  }

  async getQueueMetrics(clientId?: string): Promise<QueueMetrics> {
    try {
      const stats = await this.queueService.getQueueStats(clientId);
      
      return {
        totalItems: stats.totalItems,
        pendingItems: stats.pendingItems,
        inProgressItems: stats.inProgressItems,
        averageWaitTime: stats.averageWaitTime,
        processingRate: stats.processingRate,
        priorityDistribution: stats.priorityDistribution
      };
    } catch (error) {
      throw new CustomError('Failed to get queue metrics', 500);
    }
  }

  async getPerformanceMetrics(clientId?: string, timeRange: string = '7d'): Promise<PerformanceMetrics> {
    try {
      const allCalls = await AirtableService.getRecords('Calls');
      const allLeads = await AirtableService.getRecords('Leads');
      
      // Filter by client if provided
      let calls = allCalls;
      let leads = allLeads;
      
      if (clientId) {
        const clientLeadIds = allLeads
          .filter(lead => lead.clientId === clientId)
          .map(lead => lead.id);
        calls = allCalls.filter(call => clientLeadIds.includes(call.leadId));
        leads = allLeads.filter(lead => lead.clientId === clientId);
      }

      // Calculate daily, weekly, monthly metrics
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyCalls = calls.filter(call => new Date(call.createdAt) > oneDayAgo).length;
      const weeklyCalls = calls.filter(call => new Date(call.createdAt) > oneWeekAgo).length;
      const monthlyCalls = calls.filter(call => new Date(call.createdAt) > oneMonthAgo).length;

      const dailyLeads = leads.filter(lead => new Date(lead.createdAt) > oneDayAgo).length;
      const weeklyLeads = leads.filter(lead => new Date(lead.createdAt) > oneWeekAgo).length;
      const monthlyLeads = leads.filter(lead => new Date(lead.createdAt) > oneMonthAgo).length;

      // Calculate efficiency (successful calls / total calls)
      const successfulCalls = calls.filter(call => call.outcome === 'successful').length;
      const efficiency = calls.length > 0 ? (successfulCalls / calls.length) * 100 : 0;

      return {
        dailyCalls,
        weeklyCalls,
        monthlyCalls,
        dailyLeads,
        weeklyLeads,
        monthlyLeads,
        efficiency: Math.round(efficiency * 100) / 100
      };
    } catch (error) {
      throw new CustomError('Failed to get performance metrics', 500);
    }
  }

  async getTrendData(clientId?: string, timeRange: string = '7d'): Promise<TrendData[]> {
    try {
      const trends = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
      
      // Get data for the last N days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const allCalls = await AirtableService.getRecords('Calls');
        const allLeads = await AirtableService.getRecords('Leads');
        
        // Filter by client if provided
        let calls = allCalls;
        let leads = allLeads;
        
        if (clientId) {
          const clientLeadIds = allLeads
            .filter(lead => lead.clientId === clientId)
            .map(lead => lead.id);
          calls = allCalls.filter(call => clientLeadIds.includes(call.leadId));
          leads = allLeads.filter(lead => lead.clientId === clientId);
        }

        // Filter by date
        const dayCalls = calls.filter(call => {
          const callDate = new Date(call.createdAt).toISOString().split('T')[0];
          return callDate === dateStr;
        }).length;
        
        const dayLeads = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
          return leadDate === dateStr;
        }).length;

        // Calculate conversions for the day
        const dayConversions = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
          return leadDate === dateStr && lead.status === 'closed';
        }).length;

        trends.push({
          date: dateStr,
          calls: dayCalls,
          leads: dayLeads,
          conversions: dayConversions
        });
      }
      
      return trends;
    } catch (error) {
      throw new CustomError('Failed to get trend data', 500);
    }
  }

  async createDashboard(dashboardData: CreateDashboardRequest): Promise<Dashboard> {
    try {
      const newDashboard = await AirtableService.createRecord(this.dashboardTableName, {
        ...dashboardData,
        isDefault: dashboardData.isDefault || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newDashboard;
    } catch (error) {
      throw new CustomError('Failed to create dashboard', 500);
    }
  }

  async getDashboards(clientId?: string): Promise<Dashboard[]> {
    try {
      const allDashboards = await AirtableService.getRecords(this.dashboardTableName);
      
      if (clientId) {
        return allDashboards.filter(dashboard => dashboard.clientId === clientId);
      }
      
      return allDashboards.filter(dashboard => !dashboard.clientId); // Global dashboards
    } catch (error) {
      throw new CustomError('Failed to get dashboards', 500);
    }
  }

  async updateDashboard(dashboardId: string, updates: UpdateDashboardRequest): Promise<Dashboard> {
    try {
      const existingDashboard = await AirtableService.getRecord(this.dashboardTableName, dashboardId);
      
      if (!existingDashboard) {
        throw new CustomError('Dashboard not found', 404);
      }

      const updatedDashboard = await AirtableService.updateRecord(this.dashboardTableName, dashboardId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      return updatedDashboard;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update dashboard', 500);
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    try {
      const existingDashboard = await AirtableService.getRecord(this.dashboardTableName, dashboardId);
      
      if (!existingDashboard) {
        throw new CustomError('Dashboard not found', 404);
      }

      await AirtableService.deleteRecord(this.dashboardTableName, dashboardId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete dashboard', 500);
    }
  }

  async generateReport(reportConfig: ReportConfig): Promise<{
    data: any;
    format: string;
    filename: string;
  }> {
    try {
      const { type, format, timeRange, clientId, filters, includeCharts, includeTables } = reportConfig;
      
      let reportData: any = {};
      
      switch (type) {
        case 'leads':
          reportData = await this.getLeadMetrics(clientId, timeRange);
          break;
        case 'calls':
          reportData = await this.getCallMetrics(clientId, timeRange);
          break;
        case 'performance':
          reportData = await this.getPerformanceMetrics(clientId, timeRange);
          break;
        case 'custom':
          reportData = await this.getDashboardData(clientId, timeRange);
          break;
      }

      if (includeCharts) {
        reportData.trends = await this.getTrendData(clientId, timeRange);
      }

      const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;

      return {
        data: reportData,
        format,
        filename
      };
    } catch (error) {
      throw new CustomError('Failed to generate report', 500);
    }
  }

  private filterByTimeRange<T extends { createdAt: string }>(items: T[], timeRange: string, dateField: keyof T): T[] {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days
    }

    return items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate >= startDate && itemDate <= now;
    });
  }
}