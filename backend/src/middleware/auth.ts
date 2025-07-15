import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { CustomError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(new CustomError('Not authorized to access this route', 401));
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Add user to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    next(new CustomError('Not authorized to access this route', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new CustomError('Not authorized to access this route', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new CustomError(`User role ${req.user.role} is not authorized to access this route`, 403));
      return;
    }

    next();
  };
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new CustomError('Invalid token', 401);
  }
}; 