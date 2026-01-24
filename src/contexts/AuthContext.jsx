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

  // Create user document in Firestore with timeout
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return null;

    // Add timeout to prevent hanging forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 10000)
    );

    try {
      const userRef = doc(db, 'users', user.uid);

      // Race between Firestore operation and timeout
      const userSnap = await Promise.race([
        getDoc(userRef),
        timeoutPromise
      ]);

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

        await Promise.race([
          setDoc(userRef, userData),
          timeoutPromise
        ]);
        return userData;
      } else {
        // Update last login
        await Promise.race([
          setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true }),
          timeoutPromise
        ]);
        return userSnap.data();
      }
    } catch (err) {
      console.error('createUserDocument error:', err);
      // Return basic user data even if Firestore fails
      return {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'admin'
      };
    }
  };

  // Get user profile from Firestore with timeout
  const getUserProfile = async (uid) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 10000)
    );

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await Promise.race([
        getDoc(userRef),
        timeoutPromise
      ]);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Error getting user profile:', err);
      // Return basic profile on timeout/error
      return { id: uid, role: 'admin' };
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
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      return profile;
    }
    return null;
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 AuthContext: Auth state changed, user:', user?.uid || 'NONE');
      setCurrentUser(user);

      try {
        if (user) {
          const profile = await getUserProfile(user.uid);
          console.log('🔐 AuthContext: User profile loaded:', {
            id: profile?.id,
            companyId: profile?.companyId,
            email: profile?.email,
            role: profile?.role
          });
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('🔐 AuthContext: Error loading profile:', err);
        // Set basic profile on error
        if (user) {
          setUserProfile({ id: user.uid, email: user.email, role: 'admin' });
        }
      } finally {
        // ALWAYS set loading to false
        setLoading(false);
      }
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
