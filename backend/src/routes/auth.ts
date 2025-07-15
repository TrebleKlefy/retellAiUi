import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { validate, loginValidation, registerValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validate(loginValidation), asyncHandler(authController.login));
router.post('/register', validate(registerValidation), asyncHandler(authController.register));

// Protected routes
router.get('/me', protect, asyncHandler(authController.getCurrentUser));
router.post('/logout', protect, asyncHandler(authController.logout));
router.put('/profile', protect, asyncHandler(authController.updateProfile));
router.put('/password', protect, asyncHandler(authController.changePassword));

// Admin only routes
router.get('/users', protect, authorize('admin'), asyncHandler(authController.getUsers));
router.get('/users/:id', protect, authorize('admin'), asyncHandler(authController.getUser));
router.put('/users/:id', protect, authorize('admin'), asyncHandler(authController.updateUser));
router.delete('/users/:id', protect, authorize('admin'), asyncHandler(authController.deleteUser));

export default router; 