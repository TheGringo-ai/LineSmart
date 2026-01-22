import React from 'react';
import {
  Bot, Brain, Database, Users, Building, CheckCircle,
  GitBranch, UserPlus, Zap, Cloud, FileText
} from 'lucide-react';
import {
  industries, companySizes, standardDepartments, safetyRequirements,
  trainingTypes, languages, aiModels, setupSteps
} from '../constants';

/**
 * Setup Wizard component for initial platform configuration
 */
export const SetupWizard = ({
  setupStep,
  setupConfig,
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
  currentStepIndex,
  totalSteps,
  progressPercentage,
  setCurrentView
}) => {
  const dataSourceTypes = [
    { id: 'googleDrive', name: 'Google Drive', icon: <Cloud className="h-5 w-5" />, description: 'Connect to Google Drive folders' },
    { id: 's3', name: 'Amazon S3', icon: <Database className="h-5 w-5" />, description: 'AWS S3 bucket integration' },
    { id: 'azure', name: 'Azure Blob', icon: <Cloud className="h-5 w-5" />, description: 'Microsoft Azure Blob Storage' },
    { id: 'sharepoint', name: 'SharePoint', icon: <Building className="h-5 w-5" />, description: 'Microsoft SharePoint' },
    { id: 'local', name: 'Local Files', icon: <FileText className="h-5 w-5" />, description: 'Upload files directly' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Setup Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Platform Setup</h2>
          <span className="text-sm text-gray-500">
            Step {currentStepIndex} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Welcome Step */}
      {setupStep === 'welcome' && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="mb-6">
            <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Line Smart</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Set up your enterprise AI-powered training platform with RAG capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Brain className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
              <h4 className="font-semibold text-blue-900 mb-2">AI Integration</h4>
              <p className="text-sm text-blue-800">Connect multiple AI models</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <Database className="h-8 w-8 text-green-600 mb-3 mx-auto" />
              <h4 className="font-semibold text-green-900 mb-2">RAG System</h4>
              <p className="text-sm text-green-800">Use your company data</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
              <h4 className="font-semibold text-purple-900 mb-2">Individual Tracking</h4>
              <p className="text-sm text-purple-800">Personalized learning paths</p>
            </div>
          </div>

          <button
            onClick={handleSetupNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <span>Get Started</span>
            <GitBranch className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Company Configuration Step */}
      {setupStep === 'company' && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            Company Configuration
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={setupConfig.company.name}
                  onChange={(e) => updateCompanyConfig('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  value={setupConfig.company.industry}
                  onChange={(e) => {
                    updateCompanyConfig('industry', e.target.value);
                    if (setupConfig.company.name && e.target.value) {
                      generateCompanyConfig(setupConfig.company.name, e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select
                value={setupConfig.company.size}
                onChange={(e) => updateCompanyConfig('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Company Size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Company Language</label>
              <select
                value={setupConfig.company.defaultLanguage}
                onChange={(e) => updateCompanyConfig('defaultLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {standardDepartments.map(dept => (
                  <label key={dept} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={setupConfig.company.departments.includes(dept)}
                      onChange={(e) => toggleDepartment(dept, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Safety & Compliance</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {safetyRequirements.map(req => (
                  <label key={req} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={setupConfig.company.safetyRequirements.includes(req)}
                      onChange={(e) => toggleSafetyRequirement(req, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{req}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={handleSetupPrev} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button
              onClick={handleSetupNext}
              disabled={!setupConfig.company.name || !setupConfig.company.industry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* AI Models Configuration Step */}
      {setupStep === 'ai-models' && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            AI Model Configuration
          </h3>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Select Primary AI Model</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map(model => (
                  <div
                    key={model.id}
                    onClick={() => updateAIModelConfig('primary', model.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors relative ${
                      setupConfig.aiModels.primary === model.id
                        ? model.isFree ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {model.badge && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        {model.badge}
                      </span>
                    )}
                    <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {setupConfig.aiModels.primary && setupConfig.aiModels.primary !== 'free' && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4">
                  Configure {aiModels.find(m => m.id === setupConfig.aiModels.primary)?.name}
                </h4>

                {setupConfig.aiModels.primary === 'llama' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Local Llama Setup:</strong> Install Ollama from{' '}
                      <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a>,
                      then run <code className="bg-yellow-100 px-1 rounded">ollama pull llama2</code> in your terminal.
                    </p>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ollama Endpoint</label>
                      <input
                        type="text"
                        value={setupConfig.aiModels.configs.llama?.endpoint || 'http://localhost:11434'}
                        onChange={(e) => updateAIModelAPIConfig('llama', 'endpoint', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="http://localhost:11434"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <input
                        type="password"
                        value={setupConfig.aiModels.configs[setupConfig.aiModels.primary]?.apiKey || ''}
                        onChange={(e) => updateAIModelAPIConfig(setupConfig.aiModels.primary, 'apiKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter API key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model Version</label>
                      <input
                        type="text"
                        value={setupConfig.aiModels.configs[setupConfig.aiModels.primary]?.model || ''}
                        onChange={(e) => updateAIModelAPIConfig(setupConfig.aiModels.primary, 'model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., gpt-4, claude-3-sonnet"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => testConnection(setupConfig.aiModels.primary, setupConfig.aiModels.configs[setupConfig.aiModels.primary])}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Test Connection</span>
                </button>
              </div>
            )}

            {setupConfig.aiModels.primary === 'free' && (
              <div className="border-t pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-800 mb-2">LineSmart Free Tier Selected</h4>
                  <p className="text-sm text-green-700 mb-3">
                    You're using LineSmart's hosted AI service. No API key required!
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>- 50 AI generations per month</li>
                    <li>- Powered by GPT-4o-mini</li>
                    <li>- Full training content generation</li>
                    <li>- Quiz generation included</li>
                  </ul>
                  <p className="text-xs text-green-600 mt-3">
                    Need more? Add your own OpenAI API key for unlimited use.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={handleSetupPrev} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button
              onClick={handleSetupNext}
              disabled={!setupConfig.aiModels.primary}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Data Source Configuration Step */}
      {setupStep === 'data-source' && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Data Source & RAG Configuration
          </h3>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Select Data Source</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataSourceTypes.map(source => (
                  <div
                    key={source.id}
                    onClick={() => updateDataSourceConfig('type', source.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      setupConfig.dataSource.type === source.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {source.icon}
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{source.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium mb-4">RAG System Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chunk Size</label>
                  <input
                    type="number"
                    value={setupConfig.dataSource.ragSettings.chunkSize}
                    onChange={(e) => updateRAGSettings('chunkSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overlap</label>
                  <input
                    type="number"
                    value={setupConfig.dataSource.ragSettings.overlap}
                    onChange={(e) => updateRAGSettings('overlap', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vector Store</label>
                  <select
                    value={setupConfig.dataSource.ragSettings.vectorStore}
                    onChange={(e) => updateRAGSettings('vectorStore', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="chromadb">ChromaDB</option>
                    <option value="pinecone">Pinecone</option>
                    <option value="weaviate">Weaviate</option>
                    <option value="qdrant">Qdrant</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={handleSetupPrev} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button
              onClick={handleSetupNext}
              disabled={!setupConfig.dataSource.type}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Configuration Step */}
      {setupStep === 'onboarding' && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Onboarding Configuration
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Onboarding Trainings</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trainingTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={setupConfig.onboarding.defaultTrainings.includes(type)}
                      onChange={(e) => toggleOnboardingTraining(type, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Probation Period (Days)</label>
                <input
                  type="number"
                  value={setupConfig.onboarding.probationPeriod}
                  onChange={(e) => updateOnboardingConfig('probationPeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={setupConfig.onboarding.mentorAssignment}
                    onChange={(e) => updateOnboardingConfig('mentorAssignment', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Automatic Mentor Assignment</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={handleSetupPrev} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button onClick={handleSetupNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Complete Setup
            </button>
          </div>
        </div>
      )}

      {/* Setup Complete Step */}
      {setupStep === 'complete' && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your Line Smart platform is now configured and ready to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Company: {setupConfig.company.name}</h4>
              <p className="text-sm text-blue-800">{setupConfig.company.industry} • {setupConfig.company.size}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">AI Model: {setupConfig.aiModels.primary}</h4>
              <p className="text-sm text-green-800">RAG Enabled with {setupConfig.dataSource.type}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Languages: {setupConfig.company.supportedLanguages.length + 1}</h4>
              <p className="text-sm text-purple-800">Multi-language support enabled</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Create Training</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
