import { apiService } from './api';
import { LoginCredentials, RegisterData, User, AuthResponse } from '../types/auth';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }
    return response.data!;
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
    return response.data!;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiService.get<User>('/auth/me');
    if (!response.success) {
      throw new Error(response.error || 'Failed to get user');
    }
    return response.data!;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiService.post('/auth/logout');
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiService.put<User>('/auth/profile', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update profile');
    }
    return response.data!;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await apiService.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  },

  // Get all users (admin only)
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `/auth/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get(url);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get users');
    }
    return response.data;
  },

  // Get user by ID (admin only)
  getUser: async (id: string): Promise<User> => {
    const response = await apiService.get<User>(`/auth/users/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get user');
    }
    return response.data!;
  },

  // Update user (admin only)
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiService.put<User>(`/auth/users/${id}`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }
    return response.data!;
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    const response = await apiService.delete(`/auth/users/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  },
}; 