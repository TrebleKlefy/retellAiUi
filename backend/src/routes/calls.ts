import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, callValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { CallController } from '../controllers/callController';

const router = Router();
const callController = new CallController();

// All routes require authentication
router.use(protect);

// Call CRUD operations
router.get('/', asyncHandler(callController.getCalls));
router.get('/stats', asyncHandler(callController.getCallStats));
router.get('/:id', asyncHandler(callController.getCall));
router.post('/', validate(callValidation), asyncHandler(callController.createCall));
router.put('/:id', validate(callValidation), asyncHandler(callController.updateCall));
router.delete('/:id', authorize('admin', 'manager'), asyncHandler(callController.deleteCall));

// Call-specific operations
router.post('/:id/start', asyncHandler(callController.startCall));
router.post('/:id/end', asyncHandler(callController.endCall));
router.get('/:id/recording', asyncHandler(callController.getCallRecording));
router.get('/:id/transcript', asyncHandler(callController.getCallTranscript));

// Retell AI integration
router.post('/retell/webhook', asyncHandler(callController.handleRetellWebhook));
router.post('/retell/create', asyncHandler(callController.createRetellCall));

// Scheduled calls
router.get('/scheduled', asyncHandler(callController.getScheduledCalls));
router.post('/schedule', asyncHandler(callController.scheduleCall));
router.put('/:id/schedule', asyncHandler(callController.updateScheduledCall));
router.delete('/:id/schedule', asyncHandler(callController.cancelScheduledCall));

export default router; 