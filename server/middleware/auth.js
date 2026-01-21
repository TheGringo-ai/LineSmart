import { getFirebaseAuth, isFirebaseConfigured } from '../config/firebase.js';
import logger from '../config/logger.js';

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens from the Authorization header
 */
export async function authMiddleware(req, res, next) {
  // Skip auth if Firebase is not configured (development mode)
  if (!isFirebaseConfigured()) {
    logger.debug('Firebase not configured - skipping auth');
    req.user = null;
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    logger.debug('User authenticated', { uid: req.user.uid });
    next();
  } catch (error) {
    logger.warn('Auth token verification failed', { error: error.message });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
}

/**
 * Optional auth middleware - doesn't require authentication but extracts user if token present
 */
export async function optionalAuthMiddleware(req, res, next) {
  if (!isFirebaseConfigured()) {
    req.user = null;
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    req.user = null;
  }

  next();
}

export default authMiddleware;
