import { useState, useCallback, useEffect } from 'react';
import { initialSetupConfig, setupSteps } from '../constants';
import { getIndustrySuggestions } from '../utils';

const SETUP_STEP_KEY = 'linesmart_setup_step';
const SETUP_CONFIG_KEY = 'linesmart_setup_config';
const SETUP_COMPLETED_KEY = 'linesmart_setup_completed';

/**
 * Custom hook for managing setup wizard state and navigation
 * Now with localStorage persistence to retain data across page refreshes
 */
export const useSetupWizard = () => {
  // Initialize state from localStorage if available
  const [setupStep, setSetupStep] = useState(() => {
    try {
      const saved = localStorage.getItem(SETUP_STEP_KEY);
      return saved || 'welcome';
    } catch (error) {
      console.error('Error loading setup step from localStorage:', error);
      return 'welcome';
    }
  });

  const [setupConfig, setSetupConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(SETUP_CONFIG_KEY);
      return saved ? JSON.parse(saved) : initialSetupConfig;
    } catch (error) {
      console.error('Error loading setup config from localStorage:', error);
      return initialSetupConfig;
    }
  });

  const [completedSetup, setCompletedSetup] = useState(() => {
    try {
      const saved = localStorage.getItem(SETUP_COMPLETED_KEY);
      return saved === 'true';
    } catch (error) {
      console.error('Error loading setup completed from localStorage:', error);
      return false;
    }
  });

  // Persist setupStep to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SETUP_STEP_KEY, setupStep);
    } catch (error) {
      console.error('Error saving setup step to localStorage:', error);
    }
  }, [setupStep]);

  // Persist setupConfig to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SETUP_CONFIG_KEY, JSON.stringify(setupConfig));
    } catch (error) {
      console.error('Error saving setup config to localStorage:', error);
    }
  }, [setupConfig]);

  // Persist completedSetup to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SETUP_COMPLETED_KEY, completedSetup.toString());
    } catch (error) {
      console.error('Error saving setup completed to localStorage:', error);
    }
  }, [completedSetup]);

  const handleSetupNext = useCallback(() => {
    const currentIndex = setupSteps.indexOf(setupStep);
    if (currentIndex < setupSteps.length - 1) {
      setSetupStep(setupSteps[currentIndex + 1]);
    }
  }, [setupStep]);

  const handleSetupPrev = useCallback(() => {
    const currentIndex = setupSteps.indexOf(setupStep);
    if (currentIndex > 0) {
      setSetupStep(setupSteps[currentIndex - 1]);
    }
  }, [setupStep]);

  const updateCompanyConfig = useCallback((field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }));
  }, []);

  const updateAIModelConfig = useCallback((field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      aiModels: { ...prev.aiModels, [field]: value }
    }));
  }, []);

  const updateAIModelAPIConfig = useCallback((modelName, field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      aiModels: {
        ...prev.aiModels,
        configs: {
          ...prev.aiModels.configs,
          [modelName]: {
            ...prev.aiModels.configs[modelName],
            [field]: value
          }
        }
      }
    }));
  }, []);

  const updateDataSourceConfig = useCallback((field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      dataSource: { ...prev.dataSource, [field]: value }
    }));
  }, []);

  const updateDataSourceTypeConfig = useCallback((type, field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        config: {
          ...prev.dataSource.config,
          [type]: { ...prev.dataSource.config[type], [field]: value }
        }
      }
    }));
  }, []);

  const updateRAGSettings = useCallback((field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        ragSettings: { ...prev.dataSource.ragSettings, [field]: value }
      }
    }));
  }, []);

  const updateOnboardingConfig = useCallback((field, value) => {
    setSetupConfig(prev => ({
      ...prev,
      onboarding: { ...prev.onboarding, [field]: value }
    }));
  }, []);

  const generateCompanyConfig = useCallback((companyName, industry) => {
    const config = getIndustrySuggestions(industry);

    setSetupConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        departments: config.departments,
        safetyRequirements: config.safetyRequirements
      },
      onboarding: {
        ...prev.onboarding,
        defaultTrainings: config.defaultTrainings
      }
    }));
  }, []);

  const testConnection = useCallback(async (type, config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Connection successful' });
      }, 2000);
    });
  }, []);

  const toggleDepartment = useCallback((dept, checked) => {
    setSetupConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        departments: checked
          ? [...prev.company.departments, dept]
          : prev.company.departments.filter(d => d !== dept)
      }
    }));
  }, []);

  const toggleSafetyRequirement = useCallback((req, checked) => {
    setSetupConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        safetyRequirements: checked
          ? [...prev.company.safetyRequirements, req]
          : prev.company.safetyRequirements.filter(r => r !== req)
      }
    }));
  }, []);

  const toggleSupportedLanguage = useCallback((langCode, checked) => {
    setSetupConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        supportedLanguages: checked
          ? [...prev.company.supportedLanguages, langCode]
          : prev.company.supportedLanguages.filter(l => l !== langCode)
      }
    }));
  }, []);

  const toggleOnboardingTraining = useCallback((training, checked) => {
    setSetupConfig(prev => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        defaultTrainings: checked
          ? [...prev.onboarding.defaultTrainings, training]
          : prev.onboarding.defaultTrainings.filter(t => t !== training)
      }
    }));
  }, []);

  // Clear localStorage data (called after successful setup completion)
  const clearSetupData = useCallback(() => {
    try {
      localStorage.removeItem(SETUP_STEP_KEY);
      localStorage.removeItem(SETUP_CONFIG_KEY);
      // Keep SETUP_COMPLETED_KEY to remember setup was done
      console.log('✅ Setup wizard data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing setup data from localStorage:', error);
    }
  }, []);

  // Update completedSetup when reaching the complete step
  const isComplete = setupStep === 'complete';
  const currentStepIndex = setupSteps.indexOf(setupStep) + 1;
  const totalSteps = setupSteps.length;
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  return {
    setupStep,
    setSetupStep,
    setupConfig,
    setSetupConfig,
    handleSetupNext,
    handleSetupPrev,
    updateCompanyConfig,
    updateAIModelConfig,
    updateAIModelAPIConfig,
    updateDataSourceConfig,
    updateDataSourceTypeConfig,
    updateRAGSettings,
    updateOnboardingConfig,
    generateCompanyConfig,
    testConnection,
    toggleDepartment,
    toggleSafetyRequirement,
    toggleSupportedLanguage,
    toggleOnboardingTraining,
    completedSetup: completedSetup || isComplete,
    setCompletedSetup,
    clearSetupData,
    currentStepIndex,
    totalSteps,
    progressPercentage
  };
};

export default useSetupWizard;
