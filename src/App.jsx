import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage, SignupPage, ProtectedRoute } from './components/auth';
import JoinPage from './components/auth/JoinPage';
import LineSmartPlatform from './LineSmartPlatformRefactored';

/**
 * App Component
 * Handles authentication routing and renders the appropriate view
 */
const App = () => {
  const { currentUser, loading, resetPassword } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isJoinPage, setIsJoinPage] = useState(false);

  // Check if we're on the /join page
  useEffect(() => {
    const checkJoinPath = () => {
      setIsJoinPage(window.location.pathname === '/join');
    };
    checkJoinPath();
    window.addEventListener('popstate', checkJoinPath);
    return () => window.removeEventListener('popstate', checkJoinPath);
  }, []);

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email');
      return;
    }
    try {
      await resetPassword(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setResetMessage('Error sending reset email. Please try again.');
    }
  };

  // Show join page if on /join path (before auth check)
  if (isJoinPage) {
    return <JoinPage />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading LineSmart...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not logged in
  if (!currentUser) {
    if (showForgotPassword) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LS</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">LineSmart</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
              <p className="text-gray-500 mt-1">Enter your email to receive a reset link</p>
            </div>

            {resetMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                resetMessage.includes('sent')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <p className="text-sm">{resetMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleForgotPassword}
                className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
              >
                Send Reset Link
              </button>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetMessage('');
                }}
                className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (authView === 'signup') {
      return (
        <SignupPage
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <LoginPage
        onSwitchToSignup={() => setAuthView('signup')}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  // Show main app for authenticated users
  return (
    <ProtectedRoute>
      <LineSmartPlatform />
    </ProtectedRoute>
  );
};

export default App;
