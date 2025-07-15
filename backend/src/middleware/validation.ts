import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { CustomError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const extractedErrors = errors.array().map(err => err.msg);
    next(new CustomError(extractedErrors.join(', '), 400));
  };
};

// Common validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'manager'])
    .withMessage('Role must be admin, user, or manager')
];

export const clientValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Client name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters')
];

export const leadValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters'),
  body('status')
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'closed', 'lost'])
    .withMessage('Status must be new, contacted, qualified, proposal, closed, or lost'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source must be less than 50 characters')
];

export const callValidation = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required'),
  body('leadId')
    .notEmpty()
    .withMessage('Lead ID is required'),
  body('priority')
    .optional()
    .isIn(['urgent', 'high', 'normal', 'low'])
    .withMessage('Priority must be urgent, high, normal, or low'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('dynamicVariables')
    .optional()
    .isObject()
    .withMessage('Dynamic variables must be an object'),
  body('leadIds')
    .optional()
    .isArray()
    .withMessage('Lead IDs must be an array'),
  body('maxConcurrent')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max concurrent must be between 1 and 50')
];

// File upload validation
export const fileUploadValidation = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed');
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB');
      }
      
      return true;
    })
]; 