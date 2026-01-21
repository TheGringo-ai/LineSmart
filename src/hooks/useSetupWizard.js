import { useState, useCallback } from 'react';
import { initialSetupConfig, setupSteps } from '../constants';
import { getIndustrySuggestions } from '../utils';

/**
 * Custom hook for managing setup wizard state and navigation
 */
export const useSetupWizard = () => {
  const [setupStep, setSetupStep] = useState('welcome');
  const [setupConfig, setSetupConfig] = useState(initialSetupConfig);
  const [completedSetup, setCompletedSetup] = useState(false);

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
    currentStepIndex,
    totalSteps,
    progressPercentage
  };
};

export default useSetupWizard;
