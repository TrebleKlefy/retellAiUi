export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'manager';
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: Omit<User, 'password'>;
}

export interface UserResponse {
  success: boolean;
  data: Omit<User, 'password'>;
}

export interface UsersResponse {
  success: boolean;
  data: Omit<User, 'password'>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 