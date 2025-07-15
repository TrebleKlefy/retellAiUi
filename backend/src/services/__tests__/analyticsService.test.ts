import { AnalyticsService } from '../analyticsService';

// Mock the database service
jest.mock('../../utils/database', () => ({
  AirtableService: {
    getRecords: jest.fn(),
    getRecord: jest.fn(),
    createRecord: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn(),
  },
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
  });

  describe('getLeadMetrics', () => {
    it('should calculate lead metrics correctly', async () => {
      const mockLeads = [
        { id: '1', status: 'new', value: 100, createdAt: '2024-01-01T00:00:00Z', clientId: 'client1' },
        { id: '2', status: 'contacted', value: 200, createdAt: '2024-01-02T00:00:00Z', clientId: 'client1' },
        { id: '3', status: 'qualified', value: 300, createdAt: '2024-01-03T00:00:00Z', clientId: 'client1' },
        { id: '4', status: 'closed', value: 400, createdAt: '2024-01-04T00:00:00Z', clientId: 'client1' },
      ];

      const { AirtableService } = require('../../utils/database');
      AirtableService.getRecords.mockResolvedValue(mockLeads);

      const result = await analyticsService.getLeadMetrics('client1', '7d');

      expect(result.total).toBe(4);
      expect(result.new).toBe(1);
      expect(result.contacted).toBe(1);
      expect(result.qualified).toBe(1);
      expect(result.converted).toBe(1);
      expect(result.conversionRate).toBe(25);
      expect(result.averageScore).toBe(250);
    });
  });

  describe('getCallMetrics', () => {
    it('should calculate call metrics correctly', async () => {
      const mockCalls = [
        { id: '1', outcome: 'successful', duration: 120, createdAt: '2024-01-01T00:00:00Z', leadId: 'lead1' },
        { id: '2', outcome: 'failed', duration: 60, createdAt: '2024-01-02T00:00:00Z', leadId: 'lead2' },
        { id: '3', outcome: 'successful', duration: 180, createdAt: '2024-01-03T00:00:00Z', leadId: 'lead3' },
      ];

      const mockLeads = [
        { id: 'lead1', clientId: 'client1' },
        { id: 'lead2', clientId: 'client1' },
        { id: 'lead3', clientId: 'client1' },
      ];

      const { AirtableService } = require('../../utils/database');
      AirtableService.getRecords
        .mockResolvedValueOnce(mockCalls) // First call for calls
        .mockResolvedValueOnce(mockLeads); // Second call for leads

      const result = await analyticsService.getCallMetrics('client1', '7d');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.successRate).toBe(66.67);
      expect(result.averageDuration).toBe(120);
      expect(result.totalDuration).toBe(360);
      expect(result.outcomes.successful).toBe(2);
      expect(result.outcomes.failed).toBe(1);
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard data', async () => {
      const mockLeads = [
        { id: '1', status: 'new', value: 100, createdAt: '2024-01-01T00:00:00Z', clientId: 'client1' },
      ];

      const mockCalls = [
        { id: '1', outcome: 'successful', duration: 120, createdAt: '2024-01-01T00:00:00Z', leadId: 'lead1' },
      ];

      const { AirtableService } = require('../../utils/database');
      AirtableService.getRecords
        .mockResolvedValueOnce(mockLeads) // For lead metrics
        .mockResolvedValueOnce(mockCalls) // For call metrics
        .mockResolvedValueOnce(mockLeads) // For performance metrics
        .mockResolvedValueOnce(mockCalls) // For performance metrics
        .mockResolvedValue([]); // For trend data

      const result = await analyticsService.getDashboardData('client1', '7d');

      expect(result).toHaveProperty('leads');
      expect(result).toHaveProperty('calls');
      expect(result).toHaveProperty('queue');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('trends');
    });
  });
});