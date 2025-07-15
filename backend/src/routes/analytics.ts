import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authenticateToken);

// Analytics data endpoints
router.get('/clients/:clientId/analytics/dashboard', analyticsController.getDashboardData);
router.get('/clients/:clientId/analytics/leads', analyticsController.getLeadMetrics);
router.get('/clients/:clientId/analytics/calls', analyticsController.getCallMetrics);
router.get('/clients/:clientId/analytics/queue', analyticsController.getQueueMetrics);
router.get('/clients/:clientId/analytics/trends', analyticsController.getTrendData);

// Global analytics endpoints
router.get('/analytics/dashboard', analyticsController.getDashboardData);
router.get('/analytics/leads', analyticsController.getLeadMetrics);
router.get('/analytics/calls', analyticsController.getCallMetrics);
router.get('/analytics/queue', analyticsController.getQueueMetrics);
router.get('/analytics/trends', analyticsController.getTrendData);

// Dashboard management endpoints
router.post('/dashboards', analyticsController.createDashboard);
router.get('/clients/:clientId/dashboards', analyticsController.getDashboards);
router.get('/dashboards', analyticsController.getDashboards);
router.put('/dashboards/:id', analyticsController.updateDashboard);
router.delete('/dashboards/:id', analyticsController.deleteDashboard);

// Report generation endpoint
router.post('/reports/generate', analyticsController.generateReport);

export default router;