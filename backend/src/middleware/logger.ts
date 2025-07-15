import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';

// Create logs directory if it doesn't exist
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(config.logging.file, { flags: 'a' });

// Custom token for request ID
morgan.token('id', (req: any) => req.id);

// Custom token for response time
morgan.token('response-time', (req: any, res: any) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(3);
});

// Custom format for development
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Custom format for production
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Create logger middleware
export const logger = morgan(
  config.nodeEnv === 'development' ? devFormat : prodFormat,
  {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400
  }
);

// Console logger for development
export const consoleLogger = morgan(
  config.nodeEnv === 'development' ? devFormat : prodFormat,
  {
    skip: (req, res) => res.statusCode >= 400
  }
);

// Error logger
export const errorLogger = (err: Error, req: any, res: any, next: any) => {
  const timestamp = new Date().toISOString();
  const errorLog = `${timestamp} - ERROR: ${err.message}\n${err.stack}\n`;
  
  fs.appendFileSync(config.logging.file, errorLog);
  
  if (config.nodeEnv === 'development') {
    console.error(errorLog);
  }
  
  next(err);
};

// Request logger
export const requestLogger = (req: any, res: any, next: any) => {
  req._startAt = process.hrtime();
  req.id = Math.random().toString(36).substr(2, 9);
  
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${req.method} ${req.url} - ${req.ip}\n`;
  
  if (config.nodeEnv === 'development') {
    console.log(logEntry);
  }
  
  next();
}; 