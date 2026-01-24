import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return null;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;
        const userData = {
          email,
          displayName: displayName || additionalData.displayName || '',
          photoURL: photoURL || '',
          role: additionalData.role || 'admin',
          companyId: additionalData.companyId || null,
          employeeId: additionalData.employeeId || null,
          department: additionalData.department || null,
          created_at: serverTimestamp(),
          lastLogin: serverTimestamp(),
          ...additionalData
        };

        await setDoc(userRef, userData);
        return userData;
      } else {
        // Update last login
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        return userSnap.data();
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw new Error(`Failed to save user data: ${error.message}`);
    }
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Error getting user profile:', err);
      setError(`Failed to load user profile: ${err.message}`);
      return null;
    }
  };

  // Sign up with email/password
  const signup = async (email, password, displayName, companyData = null) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(user, { displayName });

      // Create company if provided
      let companyId = null;
      if (companyData) {
        const companyRef = doc(db, 'companies', user.uid);
        await setDoc(companyRef, {
          ...companyData,
          ownerId: user.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        companyId = user.uid;
      }

      // Create user document
      await createUserDocument(user, { displayName, companyId, role: 'admin' });

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const { user } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      setError(null);
      if (!currentUser) throw new Error('No user logged in');

      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { ...data, updated_at: serverTimestamp() }, { merge: true });

      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);

      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Refresh user profile (to get updated companyId, etc.)
  const refreshUserProfile = async () => {
    try {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      setError(`Failed to refresh profile: ${err.message}`);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserProfile,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
