import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, callValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { CallController } from '../controllers/callController';

const router = Router();
const callController = new CallController();

// Webhook endpoint (no auth required)
router.post('/webhook/retell', asyncHandler(callController.handleWebhook));

// All other routes require authentication
router.use(protect);

// Call management
router.post('/clients/:clientId/calls', validate(callValidation), asyncHandler(callController.createCall));
router.post('/clients/:clientId/batch-calls', validate(callValidation), asyncHandler(callController.createBatchCall));
router.get('/clients/:clientId/calls', asyncHandler(callController.getCalls));
router.get('/calls/:id', asyncHandler(callController.getCall));
router.delete('/calls/:id', authorize('admin', 'manager'), asyncHandler(callController.cancelCall));
router.get('/clients/:clientId/call-stats', asyncHandler(callController.getCallStats));

export default router; 