import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { AuthService } from '../services/authService';
import { 
  LoginRequest, 
  CreateUserRequest, 
  UpdateUserRequest,
  LoginResponse,
  UserResponse,
  UsersResponse 
} from '../models/User';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;
      
      const result = await this.authService.login(email, password);
      
      res.status(200).json(createSuccessResponse(result, 'Login successful'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Login failed'));
      }
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      
      const result = await this.authService.register(userData);
      
      res.status(201).json(createSuccessResponse(result, 'User registered successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Registration failed'));
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
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. However, we can log the logout event.
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
      const { currentPassword, newPassword } = req.body;
      
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