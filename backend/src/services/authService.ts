import { CustomError } from '../middleware/errorHandler';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { AirtableService } from '../utils/database';
import { hashPassword, comparePassword, sanitizeEmail } from '../utils/helpers';
import { 
  User, 
  UserRole,
  CreateUserRequest, 
  UpdateUserRequest, 
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest
} from '../models/User';

export class AuthService {
  private readonly tableName = 'Users';

  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      const sanitizedEmail = sanitizeEmail(userData.email);
      
      // Check if user already exists
      const existingUsers = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{Email} = '${sanitizedEmail}'`,
        maxRecords: 1
      });

      if (existingUsers.length > 0) {
        throw new CustomError('User with this email already exists', 400);
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user record
      const newUser = await AirtableService.createRecord(this.tableName, {
        Email: sanitizedEmail,
        Password: hashedPassword,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        Role: userData.role || UserRole.USER,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Generate tokens
      const token = generateToken(newUser.id, sanitizedEmail, newUser.Role as UserRole);
      const refreshToken = generateRefreshToken(newUser.id, sanitizedEmail, newUser.Role as UserRole);

      // Format user response
      const user: User = {
        id: newUser.id,
        email: newUser.Email,
        firstName: newUser.FirstName,
        lastName: newUser.LastName,
        role: newUser.Role as UserRole,
        isActive: newUser.isActive,
        createdAt: new Date(newUser.createdAt),
        updatedAt: new Date(newUser.updatedAt)
      };

      return {
        user,
        token,
        refreshToken
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Registration failed', 500);
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const sanitizedEmail = sanitizeEmail(credentials.email);
      
      // Find user by email
      const users = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{Email} = '${sanitizedEmail}'`,
        maxRecords: 1
      });

      if (users.length === 0) {
        throw new CustomError('Invalid credentials', 401);
      }

      const user = users[0];

      // Check if user is active
      if (!user.isActive) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Verify password
      const isValidPassword = await comparePassword(credentials.password, user.Password);
      if (!isValidPassword) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate tokens
      const token = generateToken(user.id, user.Email, user.Role as UserRole);
      const refreshToken = generateRefreshToken(user.id, user.Email, user.Role as UserRole);

      // Update last login
      await AirtableService.updateRecord(this.tableName, user.id, {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Format user response
      const userResponse: User = {
        id: user.id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role as UserRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };

      return {
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Get user
      const user = await AirtableService.getRecord(this.tableName, decoded.id);
      
      if (!user || !user.isActive) {
        throw new CustomError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newToken = generateToken(user.id, user.Email, user.Role as UserRole);
      const newRefreshToken = generateRefreshToken(user.id, user.Email, user.Role as UserRole);

      // Format user response
      const userResponse: User = {
        id: user.id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role as UserRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };

      return {
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token refresh failed', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. However, we can log the logout event.
      await AirtableService.updateRecord(this.tableName, userId, {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // Don't throw error for logout as it's not critical
      console.error('Logout logging failed:', error);
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await AirtableService.getRecord(this.tableName, userId);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return {
        id: user.id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role as UserRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user', 500);
    }
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await AirtableService.getRecord(this.tableName, userId);
      
      if (!existingUser) {
        throw new CustomError('User not found', 404);
      }

      // Prepare update fields
      const updateFields: any = {
        updatedAt: new Date().toISOString()
      };

      if (updateData.firstName) updateFields.FirstName = updateData.firstName;
      if (updateData.lastName) updateFields.LastName = updateData.lastName;
      if (updateData.email) updateFields.Email = sanitizeEmail(updateData.email);
      if (updateData.role) updateFields.Role = updateData.role;
      if (typeof updateData.isActive === 'boolean') updateFields.isActive = updateData.isActive;

      // Check for email uniqueness if email is being updated
      if (updateData.email) {
        const sanitizedEmail = sanitizeEmail(updateData.email);
        const existingUsers = await AirtableService.getRecords(this.tableName, {
          filterByFormula: `AND({Email} = '${sanitizedEmail}', RECORD_ID() != '${userId}')`,
          maxRecords: 1
        });

        if (existingUsers.length > 0) {
          throw new CustomError('User with this email already exists', 400);
        }
      }

      // Update user
      const updatedUser = await AirtableService.updateRecord(this.tableName, userId, updateFields);

      return {
        id: updatedUser.id,
        email: updatedUser.Email,
        firstName: updatedUser.FirstName,
        lastName: updatedUser.LastName,
        role: updatedUser.Role as UserRole,
        isActive: updatedUser.isActive,
        lastLoginAt: updatedUser.lastLoginAt ? new Date(updatedUser.lastLoginAt) : undefined,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update user', 500);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password
      const user = await AirtableService.getRecord(this.tableName, userId);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.Password);
      if (!isValidPassword) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await AirtableService.updateRecord(this.tableName, userId, {
        Password: hashedNewPassword,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to change password', 500);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
      // Find user by email
      const users = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{Email} = '${sanitizedEmail}'`,
        maxRecords: 1
      });

      if (users.length === 0) {
        // Don't reveal if user exists or not for security
        return;
      }

      const user = users[0];

      // Generate reset token (in a real app, you'd send this via email)
      const resetToken = generateToken(user.id, user.Email, user.Role as UserRole);
      
      // Store reset token (in a real app, you'd store this with expiration)
      await AirtableService.updateRecord(this.tableName, user.id, {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        updatedAt: new Date().toISOString()
      });

      // In a real app, you'd send an email here
      console.log(`Password reset token for ${sanitizedEmail}: ${resetToken}`);
    } catch (error) {
      // Don't throw error for security reasons
      console.error('Password reset failed:', error);
    }
  }

  async getUsers(options: { page: number; limit: number; search?: string }) {
    try {
      const { page, limit, search } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      if (search) {
        filterFormula = `OR(SEARCH('${search}', {FirstName}) > 0, SEARCH('${search}', {LastName}) > 0, SEARCH('${search}', {Email}) > 0)`;
      }

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula,
        maxRecords: limit,
        offset: offset
      });

      // Format users
      const users: User[] = records.map(user => ({
        id: user.id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role as UserRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));

      return {
        data: users,
        pagination: {
          page,
          limit,
          total: records.length, // Note: Airtable doesn't provide total count easily
          totalPages: Math.ceil(records.length / limit)
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get users', 500);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await AirtableService.getRecord(this.tableName, userId);
      
      if (!existingUser) {
        throw new CustomError('User not found', 404);
      }

      // Soft delete by setting isActive to false
      await AirtableService.updateRecord(this.tableName, userId, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete user', 500);
    }
  }
} 