import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate, loginValidation, registerValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthController } from '../controllers/authController';
import { rateLimit } from 'express-rate-limit';
import { config } from '../config/environment';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validate(registerValidation), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginValidation), asyncHandler(authController.login));
router.post('/refresh-token', asyncHandler(authController.refreshToken));
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser));
router.post('/logout', authenticateToken, asyncHandler(authController.logout));
router.put('/profile', authenticateToken, asyncHandler(authController.updateProfile));
router.put('/password', authenticateToken, asyncHandler(authController.changePassword));

// Admin only routes
router.get('/users', authenticateToken, requireRole(['admin']), asyncHandler(authController.getUsers));
router.get('/users/:id', authenticateToken, requireRole(['admin']), asyncHandler(authController.getUser));
router.put('/users/:id', authenticateToken, requireRole(['admin']), asyncHandler(authController.updateUser));
router.delete('/users/:id', authenticateToken, requireRole(['admin']), asyncHandler(authController.deleteUser));

export default router; 