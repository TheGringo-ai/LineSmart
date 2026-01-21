/**
 * API-only server for Cloud Run deployment
 * This server only serves the API endpoints without React frontend
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import logger from './config/logger.js';
import { authMiddleware } from './middleware/auth.js';
import './config/firebase.js'; // Initialize Firebase

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS - allow frontend domain
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://linesmart-platform-650169261019.us-central1.run.app',
    'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info('API request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'linesmart-api',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'LineSmart API',
    version: '1.0.0',
    endpoints: ['/api/ai', '/api/admin', '/health']
  });
});

// API Routes - protected by Firebase auth
app.use('/api/ai', authMiddleware, apiRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
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
  logger.info('LineSmart API Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'production',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
  console.log(`Server running on port ${PORT}`);
});

export default app;
