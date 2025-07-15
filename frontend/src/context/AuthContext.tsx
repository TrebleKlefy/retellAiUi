import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterData, User } from '../types/auth';
import { authService } from '../services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: true,
  isAuthenticated: false,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REFRESH_TOKEN'; payload: { token: string; refreshToken: string } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await authService.getCurrentUser();
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user, token, refreshToken } 
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try to refresh token
          try {
            const authResponse = await authService.refreshToken(refreshToken);
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { 
                user: authResponse.user, 
                token: authResponse.token, 
                refreshToken: authResponse.refreshToken 
              } 
            });
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'AUTH_FAILURE' });
          }
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          token: response.token, 
          refreshToken: response.refreshToken 
        } 
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          token: response.token, 
          refreshToken: response.refreshToken 
        } 
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  // Refresh token function
  const refreshToken = async (refreshToken: string) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatch({ 
        type: 'REFRESH_TOKEN', 
        payload: { 
          token: response.token, 
          refreshToken: response.refreshToken 
        } 
      });
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 