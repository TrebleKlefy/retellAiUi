import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login with the current location for redirect after login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRole && requiredRole.length > 0) {
    if (!requiredRole.includes(user.role)) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;