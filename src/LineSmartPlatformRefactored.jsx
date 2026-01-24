import React, { useState, useEffect } from 'react';

// Import contexts
import { useAuth } from './contexts/AuthContext';
import { useCompany } from './contexts/CompanyContext';

// Import hooks
import {
  useSetupWizard,
  useTrainingGeneration,
  useEmployeeManagement,
  useQuiz
} from './hooks';

// Import components
import { Header, NavigationTabs, ErrorNotification } from './components/ui';
import { AddEmployeeModal, EmployeeDetailModal } from './components/modals';
import { DashboardView, QuizView, ResultsView, ReviewTrainingView } from './components/views';

// Import existing components
import TrainingDataManager from './components/TrainingDataManager';
import UserManagement from './components/UserManagement';

// Import setup wizard views
import SetupWizard from './components/SetupWizard';
import CreateTrainingView from './components/CreateTrainingView';

// Import utilities
import { getDashboardStats, filterEmployeesByDepartment } from './utils';

/**
 * LineSmart Platform - Main Component with Firebase Integration
 *
 * This component orchestrates the entire application using extracted
 * custom hooks, modular components, and Firebase for data persistence.
 */
const LineSmartPlatform = () => {
  // Auth context
  const { currentUser: authUser, userProfile, logout, refreshUserProfile } = useAuth();

  // Company context
  const {
    company,
    employees: firestoreEmployees,
    saveCompany,
    addEmployee: addFirestoreEmployee,
    updateEmployee: updateFirestoreEmployee,
    saveTraining,
    saveQuizResult,
    loading: companyLoading,
    rolePermissions,
    error: companyError
  } = useCompany();

  // View state - null means "waiting to determine", then we set the right view
  const [currentView, setCurrentView] = useState(null);
  const [showTrainingData, setShowTrainingData] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Custom hooks
  const setupWizard = useSetupWizard();
  const employeeManagement = useEmployeeManagement();
  const trainingGeneration = useTrainingGeneration(
    setupWizard.setupConfig,
    employeeManagement.employees
  );
  const quiz = useQuiz();

  // Sync Firestore employees with local state
  useEffect(() => {
    if (firestoreEmployees && firestoreEmployees.length > 0) {
      employeeManagement.setEmployees(firestoreEmployees);
    }
  }, [firestoreEmployees]);

  // Determine initial view based on company data - runs once after loading
  useEffect(() => {
    if (!companyLoading && !initialLoadDone) {
      setInitialLoadDone(true);
      if (company && company.name) {
        // Company exists - go to dashboard
        setupWizard.setCompletedSetup(true);
        setCurrentView('dashboard');
        console.log('📊 Company loaded:', company.name, '- going to dashboard');
      } else {
        // No company - show setup
        setCurrentView('setup');
        console.log('🔧 No company found - showing setup');
      }
    }
  }, [companyLoading, company, initialLoadDone]);

  // Sync company config with setup wizard when company data changes
  useEffect(() => {
    if (company) {
      setupWizard.setSetupConfig(prev => ({
        ...prev,
        companyName: company.name || prev.companyName,
        company: { name: company.name, ...company },
        industry: company.industry || prev.industry,
        companySize: company.size || prev.companySize,
        departments: company.departments || prev.departments,
        safetyRequirements: company.safetyRequirements || prev.safetyRequirements,
        defaultLanguage: company.defaultLanguage || prev.defaultLanguage,
        supportedLanguages: company.supportedLanguages || prev.supportedLanguages,
        primaryModel: company.aiModels?.primary || prev.primaryModel,
        secondaryModel: company.aiModels?.secondary || prev.secondaryModel,
        dataSourceType: company.dataSource?.type || prev.dataSourceType,
        aiModels: company.aiModels || prev.aiModels
      }));
      setupWizard.setCompletedSetup(true);
    }
  }, [company]);

  // Sync company context error with local error state
  useEffect(() => {
    if (companyError) {
      setErrorMessage(companyError);
    }
  }, [companyError]);

  // Computed values
  const currentUser = userProfile ? {
    id: userProfile.id,
    name: userProfile.displayName || authUser?.displayName || 'User',
    email: authUser?.email,
    role: userProfile.role || 'admin',
    department: userProfile.department || 'Management'
  } : employeeManagement.getCurrentUser();

  const currentUserDepartment = currentUser?.department;
  const supervisedEmployees = employeeManagement.getSupervisedEmployees(currentUser);
  const filteredEmployees = filterEmployeesByDepartment(
    employeeManagement.employees,
    employeeManagement.filterDepartment
  );
  const stats = getDashboardStats(employeeManagement.employees);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle setup completion - save to Firestore
  const handleSetupComplete = async (config) => {
    try {
      setErrorMessage(null);
      await saveCompany({
        name: config.companyName,
        industry: config.industry,
        size: config.companySize,
        departments: config.departments,
        safetyRequirements: config.safetyRequirements,
        defaultLanguage: config.defaultLanguage,
        supportedLanguages: config.supportedLanguages,
        aiModels: {
          primary: config.primaryModel,
          secondary: config.secondaryModel,
          modelConfigs: config.modelConfigs
        },
        dataSource: {
          type: config.dataSourceType,
          ragSettings: config.ragSettings
        },
        onboarding: {
          defaultTrainings: config.defaultTrainings,
          probationPeriod: config.probationPeriod
        }
      });
      // Refresh user profile to get the updated companyId
      await refreshUserProfile();
      setupWizard.setCompletedSetup(true);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving company:', error);
      setErrorMessage(error.message || 'Failed to save company information');
    }
  };

  // Handle adding employee - save to Firestore
  const handleAddEmployee = async () => {
    try {
      setErrorMessage(null);
      const newEmp = employeeManagement.newEmployee;
      await addFirestoreEmployee({
        name: newEmp.name,
        email: newEmp.email,
        department: newEmp.department,
        position: newEmp.position,
        role: newEmp.role || 'employee',
        supervisor: currentUser?.id,
        hireDate: new Date().toISOString(),
        preferredLanguage: setupWizard.setupConfig.defaultLanguage
      });
      employeeManagement.setShowAddEmployee(false);
      employeeManagement.resetNewEmployee();
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrorMessage(error.message || 'Failed to add employee');
    }
  };

  // Quiz handlers
  const handleStartQuiz = () => {
    quiz.startQuiz(setCurrentView);
  };

  const handleSubmitQuiz = () => {
    quiz.submitQuiz(
      trainingGeneration.generatedTraining,
      trainingGeneration.trainingData.quizConfig?.passingScore,
      setCurrentView
    );
  };

  const handleRetakeQuiz = () => {
    quiz.retakeQuiz(setCurrentView);
  };

  const handleCompleteTraining = async () => {
    if (employeeManagement.selectedEmployee && quiz.quizResults) {
      try {
        setErrorMessage(null);
        // Save quiz result to Firestore
        await saveQuizResult({
          employeeId: employeeManagement.selectedEmployee.id,
          trainingId: trainingGeneration.generatedTraining?.id,
          trainingTitle: trainingGeneration.trainingData.title,
          score: quiz.quizResults.score,
          percentage: quiz.quizResults.percentage,
          passed: quiz.quizResults.passed,
          answers: quiz.userAnswers
        });

        // Update local state
        if (quiz.quizResults.passed) {
          employeeManagement.updateEmployeeTraining(
            employeeManagement.selectedEmployee.id,
            trainingGeneration.trainingData,
            quiz.quizResults,
            trainingGeneration.ragAnalysis
          );
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
        setErrorMessage(error.message || 'Failed to save quiz result');
      }
    }
    setCurrentView('dashboard');
  };

  // Training generation handler
  const handleGenerateTraining = async () => {
    await trainingGeneration.generateTraining(currentUserDepartment, setCurrentView);

    // Save generated training to Firestore
    if (trainingGeneration.generatedTraining) {
      try {
        setErrorMessage(null);
        await saveTraining({
          title: trainingGeneration.trainingData.title,
          department: trainingGeneration.trainingData.department,
          trainingType: trainingGeneration.trainingData.trainingType,
          language: trainingGeneration.trainingData.language,
          description: trainingGeneration.trainingData.description,
          objectives: trainingGeneration.trainingData.objectives,
          trainingScope: trainingGeneration.trainingData.trainingScope,
          content: trainingGeneration.generatedTraining.content,
          quiz: trainingGeneration.generatedTraining.quiz,
          assignedEmployees: trainingGeneration.trainingData.assignedEmployees,
          dueDate: trainingGeneration.trainingData.dueDate
        });
      } catch (error) {
        console.error('Error saving training:', error);
        setErrorMessage(error.message || 'Failed to save training');
      }
    }
  };

  // Show loading while company data loads or view is being determined
  if (companyLoading || currentView === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Notification */}
      <ErrorNotification 
        error={errorMessage || companyError} 
        onClose={() => setErrorMessage(null)} 
      />

      {/* Header */}
      <Header
        setupConfig={setupWizard.setupConfig}
        currentUser={currentUser}
        userProfile={userProfile}
        userTier={userProfile?.tier || 'pro'}
        demoUser={null}
        completedSetup={setupWizard.completedSetup}
        onSetupClick={() => setCurrentView('setup')}
        onLogout={handleLogout}
        showLogout={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Flow */}
        {currentView === 'setup' && (
          <SetupWizard
            {...setupWizard}
            setCurrentView={setCurrentView}
            onComplete={handleSetupComplete}
          />
        )}

        {/* Navigation for other views */}
        {currentView !== 'setup' && setupWizard.completedSetup && (
          <NavigationTabs
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowTrainingData={setShowTrainingData}
            generatedTraining={trainingGeneration.generatedTraining}
            canManageUsers={rolePermissions?.canManageUsers || rolePermissions?.canInviteUsers}
          />
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && setupWizard.completedSetup && (
          <DashboardView
            stats={stats}
            employees={filteredEmployees}
            filterDepartment={employeeManagement.filterDepartment}
            setFilterDepartment={employeeManagement.setFilterDepartment}
            setShowAddEmployee={employeeManagement.setShowAddEmployee}
            setSelectedEmployee={employeeManagement.setSelectedEmployee}
            setCurrentView={setCurrentView}
          />
        )}

        {/* Create Training View */}
        {currentView === 'create' && setupWizard.completedSetup && (
          <CreateTrainingView
            setupConfig={setupWizard.setupConfig}
            currentUser={currentUser}
            currentUserDepartment={currentUserDepartment}
            supervisedEmployees={supervisedEmployees}
            employees={employeeManagement.employees}
            selectedEmployee={employeeManagement.selectedEmployee}
            trainingData={trainingGeneration.trainingData}
            updateTrainingData={trainingGeneration.updateTrainingData}
            updateQuizConfig={trainingGeneration.updateQuizConfig}
            toggleAssignedEmployee={trainingGeneration.toggleAssignedEmployee}
            ragAnalysis={trainingGeneration.ragAnalysis}
            isAnalyzing={trainingGeneration.isAnalyzing}
            isGenerating={trainingGeneration.isGenerating}
            fileInputRef={trainingGeneration.fileInputRef}
            onFileUpload={trainingGeneration.handleFileUpload}
            onRemoveDocument={trainingGeneration.removeDocument}
            onAnalyzeRAG={() => trainingGeneration.analyzeTrainingWithRAG(
              employeeManagement.selectedEmployee,
              trainingGeneration.trainingData.trainingType
            )}
            onGenerateTraining={handleGenerateTraining}
            getEnabledModels={trainingGeneration.getEnabledModels}
          />
        )}

        {/* Review Training View */}
        {currentView === 'review' && trainingGeneration.generatedTraining && (
          <ReviewTrainingView
            generatedTraining={trainingGeneration.generatedTraining}
            trainingData={trainingGeneration.trainingData}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {/* Quiz View */}
        {currentView === 'quiz' && trainingGeneration.generatedTraining && (
          <QuizView
            generatedTraining={trainingGeneration.generatedTraining}
            currentQuestionIndex={quiz.currentQuestionIndex}
            userAnswers={quiz.userAnswers}
            trainingData={trainingGeneration.trainingData}
            onAnswerSelect={quiz.handleAnswerSelect}
            onPrevious={quiz.goToPreviousQuestion}
            onNext={() => quiz.goToNextQuestion(trainingGeneration.generatedTraining.quiz.length)}
            onSubmit={handleSubmitQuiz}
            progressPercentage={quiz.getCurrentProgress(trainingGeneration.generatedTraining.quiz.length)}
            canSubmit={quiz.isAllQuestionsAnswered(trainingGeneration.generatedTraining.quiz.length)}
          />
        )}

        {/* Results View */}
        {currentView === 'results' && quiz.quizResults && (
          <ResultsView
            quizResults={quiz.quizResults}
            generatedTraining={trainingGeneration.generatedTraining}
            trainingData={trainingGeneration.trainingData}
            onReviewTraining={() => setCurrentView('review')}
            onRetakeQuiz={handleRetakeQuiz}
            onComplete={handleCompleteTraining}
          />
        )}

        {/* User Management View */}
        {currentView === 'users' && setupWizard.completedSetup && (rolePermissions?.canManageUsers || rolePermissions?.canInviteUsers) && (
          <UserManagement />
        )}
      </div>

      {/* Training Data Manager Modal */}
      {showTrainingData && (
        <TrainingDataManager onClose={() => setShowTrainingData(false)} />
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={employeeManagement.showAddEmployee}
        onClose={() => employeeManagement.setShowAddEmployee(false)}
        newEmployee={employeeManagement.newEmployee}
        onUpdateNewEmployee={employeeManagement.updateNewEmployee}
        onAddEmployee={handleAddEmployee}
      />

      {/* Employee Detail Modal */}
      {employeeManagement.selectedEmployee && currentView === 'dashboard' && (
        <EmployeeDetailModal
          employee={employeeManagement.selectedEmployee}
          onClose={() => employeeManagement.setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default LineSmartPlatform;
