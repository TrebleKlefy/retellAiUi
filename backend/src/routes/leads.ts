import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, leadValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { LeadController } from '../controllers/leadController';
import { upload } from '../middleware/upload';

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(protect);

// Lead CRUD operations
router.post('/clients/:clientId/leads', validate(leadValidation), asyncHandler(leadController.createLead));
router.get('/clients/:clientId/leads', asyncHandler(leadController.getLeads));
router.get('/leads/:id', asyncHandler(leadController.getLead));
router.put('/leads/:id', validate(leadValidation), asyncHandler(leadController.updateLead));
router.delete('/leads/:id', authorize('admin', 'manager'), asyncHandler(leadController.deleteLead));

// Lead statistics
router.get('/clients/:clientId/leads/stats', asyncHandler(leadController.getLeadStats));

// Lead status management
router.put('/leads/:id/status', asyncHandler(leadController.updateLeadStatus));

// Import operations
router.post('/clients/:clientId/import', upload.single('file'), asyncHandler(leadController.importLeads));
router.post('/clients/:clientId/sync/airtable', asyncHandler(leadController.syncFromAirtable));
router.post('/clients/:clientId/sync/google-sheets', asyncHandler(leadController.syncFromGoogleSheets));
router.get('/import/:sessionId/progress', asyncHandler(leadController.getImportProgress));

// Lead analysis
router.post('/leads/calculate-score', asyncHandler(leadController.calculateLeadScore));
router.post('/clients/:clientId/leads/detect-duplicates', asyncHandler(leadController.detectDuplicates));

export default router; 