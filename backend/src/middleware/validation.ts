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
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  // Airtable Configuration
  body('airtable.apiKey')
    .optional()
    .isString()
    .withMessage('Airtable API key must be a string'),
  body('airtable.baseId')
    .optional()
    .isString()
    .withMessage('Airtable base ID must be a string'),
  body('airtable.leadsTable')
    .optional()
    .isString()
    .withMessage('Airtable leads table must be a string'),
  body('airtable.resultsTable')
    .optional()
    .isString()
    .withMessage('Airtable results table must be a string'),
  body('airtable.enabled')
    .optional()
    .isBoolean()
    .withMessage('Airtable enabled must be a boolean'),
  
  // Google Sheets Configuration
  body('googleSheets.spreadsheetId')
    .optional()
    .isString()
    .withMessage('Google Sheets spreadsheet ID must be a string'),
  body('googleSheets.sheetName')
    .optional()
    .isString()
    .withMessage('Google Sheets sheet name must be a string'),
  body('googleSheets.enabled')
    .optional()
    .isBoolean()
    .withMessage('Google Sheets enabled must be a boolean'),
  body('googleSheets.syncInterval')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Google Sheets sync interval must be a positive integer'),
  
  // Retell AI Configuration
  body('retell.apiKey')
    .optional()
    .isString()
    .withMessage('Retell API key must be a string'),
  body('retell.agentId')
    .optional()
    .isString()
    .withMessage('Retell agent ID must be a string'),
  body('retell.fromNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  // Schedule Configuration
  body('schedule.timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('schedule.activeDays')
    .optional()
    .isArray()
    .withMessage('Active days must be an array'),
  body('schedule.timeWindows')
    .optional()
    .isArray()
    .withMessage('Time windows must be an array'),
  body('schedule.maxConcurrent')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max concurrent calls must be between 1 and 50'),
  body('schedule.delayBetweenCalls')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Delay between calls must be a positive integer'),
  body('schedule.maxAttempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  body('schedule.callCooldownHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Call cooldown hours must be a positive integer'),
  
  // Compliance Settings
  body('compliance.enableStateFiltering')
    .optional()
    .isBoolean()
    .withMessage('Enable state filtering must be a boolean'),
  body('compliance.allowedStates')
    .optional()
    .isArray()
    .withMessage('Allowed states must be an array'),
  body('compliance.enableDuplicateDetection')
    .optional()
    .isBoolean()
    .withMessage('Enable duplicate detection must be a boolean'),
  body('compliance.quotaEnabled')
    .optional()
    .isBoolean()
    .withMessage('Quota enabled must be a boolean'),
  body('compliance.dailyQuota')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Daily quota must be a positive integer'),
  
  // Client Preferences
  body('preferences.priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  body('preferences.urgentCallsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Urgent calls enabled must be a boolean'),
  body('preferences.batchDialingEnabled')
    .optional()
    .isBoolean()
    .withMessage('Batch dialing enabled must be a boolean'),
  body('preferences.pauseForUrgent')
    .optional()
    .isBoolean()
    .withMessage('Pause for urgent must be a boolean'),
  body('preferences.leadScoring')
    .optional()
    .isBoolean()
    .withMessage('Lead scoring must be a boolean'),
  body('preferences.duplicateDetection')
    .optional()
    .isBoolean()
    .withMessage('Duplicate detection must be a boolean'),
  body('preferences.autoFailAfterAttempts')
    .optional()
    .isBoolean()
    .withMessage('Auto fail after attempts must be a boolean')
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
  body('leadId')
    .notEmpty()
    .withMessage('Lead ID is required'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('outcome')
    .optional()
    .isIn(['successful', 'no-answer', 'voicemail', 'busy', 'wrong-number'])
    .withMessage('Outcome must be successful, no-answer, voicemail, busy, or wrong-number')
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