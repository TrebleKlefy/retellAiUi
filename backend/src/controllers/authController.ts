import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { AuthService } from '../services/authService';
import { 
  LoginRequest, 
  CreateUserRequest, 
  UpdateUserRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  UserResponse,
  UsersResponse 
} from '../models/User';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      
      const result: AuthResponse = await this.authService.register(userData);
      
      res.status(201).json(createSuccessResponse(result, 'User registered successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Registration failed'));
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;
      
      const result: AuthResponse = await this.authService.login({ email, password });
      
      res.status(200).json(createSuccessResponse(result, 'Login successful'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Login failed'));
      }
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;
      
      if (!refreshToken) {
        res.status(400).json(createErrorResponse('Refresh token is required', 400));
        return;
      }
      
      const result: AuthResponse = await this.authService.refreshToken(refreshToken);
      
      res.status(200).json(createSuccessResponse(result, 'Token refreshed successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Token refresh failed'));
      }
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json(createErrorResponse('User not authenticated', 401));
        return;
      }
      
      const user = await this.authService.getUserById(userId);
      
      res.status(200).json(createSuccessResponse(user));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get user'));
      }
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        await this.authService.logout(userId);
      }
      
      res.status(200).json(createSuccessResponse(null, 'Logout successful'));
    } catch (error) {
      res.status(500).json(createErrorResponse('Logout failed'));
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const updateData: UpdateUserRequest = req.body;
      
      if (!userId) {
        res.status(401).json(createErrorResponse('User not authenticated', 401));
        return;
      }
      
      const updatedUser = await this.authService.updateUser(userId, updateData);
      
      res.status(200).json(createSuccessResponse(updatedUser, 'Profile updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update profile'));
      }
    }
  };

  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
      
      if (!userId) {
        res.status(401).json(createErrorResponse('User not authenticated', 401));
        return;
      }
      
      await this.authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json(createSuccessResponse(null, 'Password changed successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to change password'));
      }
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: ResetPasswordRequest = req.body;
      
      if (!email) {
        res.status(400).json(createErrorResponse('Email is required', 400));
        return;
      }
      
      await this.authService.resetPassword(email);
      
      // Always return success for security reasons
      res.status(200).json(createSuccessResponse(null, 'If an account with that email exists, a password reset link has been sent'));
    } catch (error) {
      // Always return success for security reasons
      res.status(200).json(createSuccessResponse(null, 'If an account with that email exists, a password reset link has been sent'));
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      
      const result = await this.authService.getUsers({ page, limit, search });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get users'));
    }
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const user = await this.authService.getUserById(id);
      
      res.status(200).json(createSuccessResponse(user));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get user'));
      }
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      
      const updatedUser = await this.authService.updateUser(id, updateData);
      
      res.status(200).json(createSuccessResponse(updatedUser, 'User updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update user'));
      }
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.authService.deleteUser(id);
      
      res.status(200).json(createSuccessResponse(null, 'User deleted successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to delete user'));
      }
    }
  };
} 