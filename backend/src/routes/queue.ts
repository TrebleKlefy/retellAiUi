import { Router } from 'express';
import { QueueController } from '../controllers/queueController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const queueController = new QueueController();

// All routes require authentication
router.use(authenticateToken);

// Queue management
router.post('/clients/:clientId/queue', queueController.addToQueue);
router.get('/clients/:clientId/queue', queueController.getQueueItems);
router.get('/queue/:id', queueController.getQueueItem);
router.put('/queue/:id', queueController.updateQueueItem);
router.post('/clients/:clientId/queue/process', queueController.processQueue);
router.delete('/queue/:id', queueController.cancelQueueItem);
router.get('/clients/:clientId/queue/stats', queueController.getQueueStats);
router.post('/clients/:clientId/queue/schedule-batch', queueController.scheduleBatch);

// Queue configuration
router.get('/clients/:clientId/queue/config', queueController.getQueueConfig);
router.put('/clients/:clientId/queue/config', queueController.updateQueueConfig);

export default router;