import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import logger from './logger.js';

let firebaseApp = null;
let auth = null;

function initializeFirebase() {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    return;
  }

  try {
    // Check for service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Parse JSON service account from env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      logger.info('Firebase Admin initialized with service account');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Application Default Credentials (works on Cloud Run)
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      });
      logger.info('Firebase Admin initialized with ADC');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Fallback to project ID only (works on Cloud Run with default SA)
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      logger.info('Firebase Admin initialized with project ID');
    } else {
      logger.warn('Firebase not configured - auth middleware will be disabled');
      return;
    }

    auth = getAuth(firebaseApp);
  } catch (error) {
    logger.error('Firebase initialization error', { error: error.message });
  }
}

// Initialize on module load
initializeFirebase();

export function getFirebaseAuth() {
  return auth;
}

export function isFirebaseConfigured() {
  return auth !== null;
}

export default { getFirebaseAuth, isFirebaseConfigured };
