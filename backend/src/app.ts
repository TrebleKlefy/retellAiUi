import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { logger, consoleLogger, errorLogger } from './middleware/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Import routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import leadRoutes from './routes/leads';
import callRoutes from './routes/calls';
import queueRoutes from './routes/queue';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(requestLogger);
app.use(logger);
app.use(consoleLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/calls', callRoutes);
app.use('/api', queueRoutes);

// Webhook routes
app.use('/api/webhooks', (req, res) => {
  res.status(200).json({ success: true, message: 'Webhook endpoint ready' });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);

export default app; 