import React from 'react';
import { Brain, Settings, LogOut } from 'lucide-react';
import { getLanguageName } from '../../utils';

/**
 * Application header component with logout support
 */
export const Header = ({
  setupConfig,
  currentUser,
  userProfile,
  userTier,
  demoUser,
  completedSetup,
  onSetupClick,
  onLogout,
  showLogout = false
}) => {
  const employeeId = userProfile?.employeeId || currentUser?.employeeId;
  const companyName = setupConfig?.company?.name || setupConfig?.companyName || 'Company';

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Line Smart</h1>
                {userTier === 'demo' && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    DEMO ACCESS
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">AI-Powered Training Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {(completedSetup || demoUser) && (
              <div className="text-right">
                <div className="text-sm text-gray-700 font-medium">
                  {demoUser ? demoUser.companyName : companyName}
                </div>
                <div className="text-sm text-gray-500">
                  {demoUser ? demoUser.email : `${currentUser?.name || 'User'}`}
                  {employeeId && <span className="ml-2 font-mono text-blue-600">({employeeId})</span>}
                  <span className="ml-1 text-gray-400">• {currentUser?.role || 'admin'}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {demoUser
                    ? 'Demo Mode - Full Features Available'
                    : `${setupConfig?.aiModels?.primary || setupConfig?.primaryModel || 'gpt-4o-mini'} • ${getLanguageName(setupConfig?.company?.defaultLanguage || setupConfig?.defaultLanguage || 'en')}`
                  }
                </div>
              </div>
            )}
            <button
              onClick={onSetupClick}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Setup</span>
            </button>
            {showLogout && onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
