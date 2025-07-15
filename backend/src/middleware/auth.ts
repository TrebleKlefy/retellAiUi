import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { CustomError } from './errorHandler';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(new CustomError('Access token required', 401));
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Add user to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else {
      next(new CustomError('Not authorized to access this route', 401));
    }
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new CustomError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new CustomError(`User role ${req.user.role} is not authorized to access this route`, 403));
      return;
    }

    next();
  };
};

export const generateToken = (userId: string, email: string, role: UserRole): string => {
  return jwt.sign(
    { id: userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const generateRefreshToken = (userId: string, email: string, role: UserRole): string => {
  return jwt.sign(
    { id: userId, email, role, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new CustomError('Invalid token', 401);
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
    if (decoded.type !== 'refresh') {
      throw new CustomError('Invalid refresh token', 401);
    }
    return decoded;
  } catch (error) {
    throw new CustomError('Invalid refresh token', 401);
  }
};

// Legacy function names for backward compatibility
export const protect = authenticateToken;
export const authorize = requireRole; 