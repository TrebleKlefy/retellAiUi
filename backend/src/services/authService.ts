import { CustomError } from '../middleware/errorHandler';
import { generateToken, verifyToken } from '../middleware/auth';
import { AirtableService } from '../utils/database';
import { hashPassword, comparePassword, sanitizeEmail } from '../utils/helpers';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  LoginRequest,
  LoginResponse 
} from '../models/User';

export class AuthService {
  private readonly tableName = 'Users';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
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
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      // Update last login
      await AirtableService.updateRecord(this.tableName, user.id, {
        lastLogin: new Date().toISOString()
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', 500);
    }
  }

  async register(userData: CreateUserRequest): Promise<Omit<User, 'password'>> {
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
        Name: userData.name,
        Email: sanitizedEmail,
        Password: hashedPassword,
        Role: userData.role || 'user',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Remove password from response
      const { Password: _, ...userWithoutPassword } = newUser;

      return userWithoutPassword;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Registration failed', 500);
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await AirtableService.getRecord(this.tableName, userId);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Remove password from response
      const { Password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user', 500);
    }
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<Omit<User, 'password'>> {
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

      if (updateData.name) updateFields.Name = updateData.name;
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

      // Remove password from response
      const { Password: _, ...userWithoutPassword } = updatedUser;

      return userWithoutPassword;
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

  async getUsers(options: { page: number; limit: number; search?: string }) {
    try {
      const { page, limit, search } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      if (search) {
        filterFormula = `OR(SEARCH('${search}', {Name}) > 0, SEARCH('${search}', {Email}) > 0)`;
      }

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula,
        maxRecords: limit,
        offset: offset
      });

      // Remove passwords from response
      const usersWithoutPasswords = records.map(user => {
        const { Password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        data: usersWithoutPasswords,
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

  async logout(userId: string): Promise<void> {
    try {
      // Log logout event (could be stored in a separate table)
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Logout logging failed:', error);
    }
  }

  async validateToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      const decoded = verifyToken(token);
      const user = await this.getUserById(decoded.id);
      return user;
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
  }
} 