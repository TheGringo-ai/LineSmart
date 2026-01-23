/**
 * Production server that serves both API and frontend
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.x.ai", "https://api.anthropic.com", "https://generativelanguage.googleapis.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (same-origin requests, mobile apps, etc)
    if (!origin) return callback(null, true);

    // Allow all Cloud Run domains and localhost
    const allowedPatterns = [
      /^https:\/\/.*\.run\.app$/,
      /^https:\/\/.*\.googleusercontent\.com$/,
      /^http:\/\/localhost:\d+$/,
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin)) ||
      origin === process.env.FRONTEND_URL;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// API Routes
app.use('/api/ai', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'running',
      frontend: 'serving'
    }
  });
});

// Serve static files from React build
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('LineSmart Production Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'production',
    buildPath
  });
});

export default app;