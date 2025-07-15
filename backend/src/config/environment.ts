import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Airtable Configuration
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID
  },
  
  // Google Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
  },
  
  // Retell AI Configuration
  retell: {
    apiKey: process.env.RETELL_API_KEY,
    webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3001/api/webhooks/retell'
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5')
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please check your .env file and ensure all required variables are set.');
} 