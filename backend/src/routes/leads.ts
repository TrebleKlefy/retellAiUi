import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, leadValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { LeadController } from '../controllers/leadController';

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(protect);

// Lead CRUD operations
router.get('/', asyncHandler(leadController.getLeads));
router.get('/stats', asyncHandler(leadController.getLeadStats));
router.get('/:id', asyncHandler(leadController.getLead));
router.post('/', validate(leadValidation), asyncHandler(leadController.createLead));
router.put('/:id', validate(leadValidation), asyncHandler(leadController.updateLead));
router.delete('/:id', authorize('admin', 'manager'), asyncHandler(leadController.deleteLead));

// Lead-specific operations
router.get('/:id/calls', asyncHandler(leadController.getLeadCalls));
router.post('/:id/convert', asyncHandler(leadController.convertToClient));
router.put('/:id/status', asyncHandler(leadController.updateLeadStatus));

// Bulk operations
router.post('/bulk-import', authorize('admin', 'manager'), asyncHandler(leadController.bulkImport));
router.post('/bulk-update', authorize('admin', 'manager'), asyncHandler(leadController.bulkUpdate));

export default router; 