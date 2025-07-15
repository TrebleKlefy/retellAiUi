import api from './api';
import { AnalyticsData, Dashboard } from '../types/analytics';

export class AnalyticsService {
  async getDashboardData(clientId?: string, timeRange: string = '7d'): Promise<AnalyticsData> {
    const endpoint = clientId 
      ? `/clients/${clientId}/analytics/dashboard`
      : '/analytics/dashboard';
    const response = await api.get(endpoint, { params: { timeRange } });
    return response.data.data;
  }

  async getLeadMetrics(clientId?: string, timeRange: string = '7d'): Promise<any> {
    const endpoint = clientId 
      ? `/clients/${clientId}/analytics/leads`
      : '/analytics/leads';
    const response = await api.get(endpoint, { params: { timeRange } });
    return response.data.data;
  }

  async getCallMetrics(clientId?: string, timeRange: string = '7d'): Promise<any> {
    const endpoint = clientId 
      ? `/clients/${clientId}/analytics/calls`
      : '/analytics/calls';
    const response = await api.get(endpoint, { params: { timeRange } });
    return response.data.data;
  }

  async getQueueMetrics(clientId?: string): Promise<any> {
    const endpoint = clientId 
      ? `/clients/${clientId}/analytics/queue`
      : '/analytics/queue';
    const response = await api.get(endpoint);
    return response.data.data;
  }

  async getTrendData(clientId?: string, timeRange: string = '7d'): Promise<any[]> {
    const endpoint = clientId 
      ? `/clients/${clientId}/analytics/trends`
      : '/analytics/trends';
    const response = await api.get(endpoint, { params: { timeRange } });
    return response.data.data;
  }

  async createDashboard(dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.post('/dashboards', dashboardData);
    return response.data.data;
  }

  async getDashboards(clientId?: string): Promise<Dashboard[]> {
    const endpoint = clientId ? `/clients/${clientId}/dashboards` : '/dashboards';
    const response = await api.get(endpoint);
    return response.data.data;
  }

  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.put(`/dashboards/${dashboardId}`, updates);
    return response.data.data;
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    await api.delete(`/dashboards/${dashboardId}`);
  }

  async generateReport(reportConfig: any): Promise<{
    data: any;
    format: string;
    filename: string;
  }> {
    const response = await api.post('/reports/generate', reportConfig);
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();