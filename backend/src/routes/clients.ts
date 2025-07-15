import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, clientValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ClientController } from '../controllers/clientController';

const router = Router();
const clientController = new ClientController();

// All routes require authentication
router.use(protect);

// Client CRUD operations
router.get('/', asyncHandler(clientController.getClients));
router.get('/stats', asyncHandler(clientController.getClientStats));
router.get('/:id', asyncHandler(clientController.getClient));
router.post('/', validate(clientValidation), asyncHandler(clientController.createClient));
router.put('/:id', validate(clientValidation), asyncHandler(clientController.updateClient));
router.delete('/:id', authorize('admin', 'manager'), asyncHandler(clientController.deleteClient));

// Client-specific operations
router.get('/:id/leads', asyncHandler(clientController.getClientLeads));
router.get('/:id/calls', asyncHandler(clientController.getClientCalls));

export default router; 