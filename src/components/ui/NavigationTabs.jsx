import React from 'react';
import { Users, Plus, Database, Award, Eye } from 'lucide-react';

/**
 * Navigation tabs component for switching between views
 */
export const NavigationTabs = ({
  currentView,
  setCurrentView,
  setShowRAGManager,
  generatedTraining
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Employee Dashboard',
      icon: Users,
      disabled: false
    },
    {
      id: 'create',
      label: 'Create Training',
      icon: Plus,
      disabled: false
    },
    {
      id: 'rag',
      label: 'RAG Documents',
      icon: Database,
      disabled: false,
      onClick: () => setShowRAGManager(true)
    },
    {
      id: 'quiz',
      label: 'Take Quiz',
      icon: Award,
      disabled: !generatedTraining
    },
    {
      id: 'review',
      label: 'Review Training',
      icon: Eye,
      disabled: !generatedTraining
    }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => tab.onClick ? tab.onClick() : setCurrentView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            <Icon className="h-4 w-4 inline mr-2" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationTabs;
