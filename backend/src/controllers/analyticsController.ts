import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { CustomError } from '../middleware/errorHandler';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardData = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { timeRange } = req.query;
      const data = await this.analyticsService.getDashboardData(
        clientId, 
        timeRange as string
      );
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get dashboard data' });
      }
    }
  };

  getLeadMetrics = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { timeRange } = req.query;
      const metrics = await this.analyticsService.getLeadMetrics(
        clientId, 
        timeRange as string
      );
      res.json({ success: true, data: metrics });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get lead metrics' });
      }
    }
  };

  getCallMetrics = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { timeRange } = req.query;
      const metrics = await this.analyticsService.getCallMetrics(
        clientId, 
        timeRange as string
      );
      res.json({ success: true, data: metrics });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get call metrics' });
      }
    }
  };

  getQueueMetrics = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const metrics = await this.analyticsService.getQueueMetrics(clientId);
      res.json({ success: true, data: metrics });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get queue metrics' });
      }
    }
  };

  getTrendData = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { timeRange } = req.query;
      const trends = await this.analyticsService.getTrendData(
        clientId, 
        timeRange as string
      );
      res.json({ success: true, data: trends });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get trend data' });
      }
    }
  };

  createDashboard = async (req: Request, res: Response) => {
    try {
      const dashboard = await this.analyticsService.createDashboard(req.body);
      res.status(201).json({ success: true, data: dashboard });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Failed to create dashboard' });
      }
    }
  };

  getDashboards = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const dashboards = await this.analyticsService.getDashboards(clientId);
      res.json({ success: true, data: dashboards });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to get dashboards' });
      }
    }
  };

  updateDashboard = async (req: Request, res: Response) => {
    try {
      const dashboard = await this.analyticsService.updateDashboard(
        req.params.id, 
        req.body
      );
      res.json({ success: true, data: dashboard });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Failed to update dashboard' });
      }
    }
  };

  deleteDashboard = async (req: Request, res: Response) => {
    try {
      await this.analyticsService.deleteDashboard(req.params.id);
      res.json({ success: true, message: 'Dashboard deleted successfully' });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to delete dashboard' });
      }
    }
  };

  generateReport = async (req: Request, res: Response) => {
    try {
      const report = await this.analyticsService.generateReport(req.body);
      res.json({ success: true, data: report });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Failed to generate report' });
      }
    }
  };
}