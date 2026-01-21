import React from 'react';
import {
  FileText, Users, Building, Globe, FileSearch, Search,
  Upload, CheckCircle, Brain
} from 'lucide-react';
import { standardDepartments, trainingTypes, languages } from '../constants';
import { getLanguageName } from '../utils';

/**
 * Create Training view component
 */
export const CreateTrainingView = ({
  setupConfig,
  currentUser,
  currentUserDepartment,
  supervisedEmployees,
  employees,
  selectedEmployee,
  trainingData,
  updateTrainingData,
  updateQuizConfig,
  toggleAssignedEmployee,
  ragAnalysis,
  isAnalyzing,
  isGenerating,
  fileInputRef,
  onFileUpload,
  onRemoveDocument,
  onAnalyzeRAG,
  onGenerateTraining,
  getEnabledModels
}) => {
  const enabledModels = getEnabledModels();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Supervisor Training Development
            <span className="ml-3 text-sm text-gray-500">
              ({currentUser?.name} - {currentUser?.department})
            </span>
          </h2>

          {/* Training Scope Selection */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-900 mb-3">Training Scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'individual', icon: Users, label: 'Individual Employee', desc: 'Assign to specific employees' },
                { value: 'department', icon: Building, label: 'Department Wide', desc: `All ${currentUserDepartment} employees` },
                { value: 'company', icon: Globe, label: 'Company Wide', desc: 'All employees (requires approval)' }
              ].map(scope => (
                <label
                  key={scope.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    trainingData.trainingScope === scope.value ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="trainingScope"
                    value={scope.value}
                    checked={trainingData.trainingScope === scope.value}
                    onChange={(e) => updateTrainingData('trainingScope', e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center w-full">
                    <scope.icon className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-sm font-medium">{scope.label}</span>
                    <p className="text-xs text-gray-600 mt-1">{scope.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* RAG Analysis */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-900 flex items-center">
                <FileSearch className="h-4 w-4 mr-2" />
                RAG Analysis
              </h3>
              <button
                onClick={onAnalyzeRAG}
                disabled={isAnalyzing || !trainingData.trainingType}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-1"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
            {ragAnalysis ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Relevant Documents Found:</h4>
                  <div className="flex flex-wrap gap-2">
                    {ragAnalysis.relevantDocuments.map((doc, index) => (
                      <span key={index} className="px-2 py-1 bg-white text-blue-700 rounded text-xs">
                        {doc.name} ({Math.round(doc.relevance * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Key Insights:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {ragAnalysis.suggestedContent.slice(0, 2).map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-700">Click "Analyze" to scan your company documents for relevant training content.</p>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Title</label>
                <input
                  type="text"
                  value={trainingData.title}
                  onChange={(e) => updateTrainingData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Equipment Safety Training"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Language</label>
                <select
                  value={trainingData.language}
                  onChange={(e) => updateTrainingData('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={trainingData.department}
                  onChange={(e) => updateTrainingData('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {trainingData.trainingScope === 'department' ? (
                    <option value={currentUserDepartment}>{currentUserDepartment}</option>
                  ) : (
                    standardDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
                <select
                  value={trainingData.trainingType}
                  onChange={(e) => updateTrainingData('trainingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Training Type</option>
                  {trainingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={trainingData.dueDate}
                  onChange={(e) => updateTrainingData('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <select
                  value={trainingData.aiModel}
                  onChange={(e) => updateTrainingData('aiModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="primary">Primary ({setupConfig.aiModels.primary})</option>
                  <option value="secondary">Secondary Model</option>
                </select>
              </div>
            </div>

            {/* Employee Assignment for Individual Scope */}
            {trainingData.trainingScope === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Employees
                  <span className="text-xs text-blue-600 ml-2">(Showing your supervised employees)</span>
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {supervisedEmployees.length > 0 ? supervisedEmployees.map(employee => (
                    <label key={employee.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={trainingData.assignedEmployees.includes(employee.id)}
                          onChange={(e) => toggleAssignedEmployee(employee.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({employee.department} - {employee.position})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {getLanguageName(employee.preferredLanguage)}
                        </span>
                        {employee.preferredLanguage !== trainingData.language && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ⚠️ Language mismatch
                          </span>
                        )}
                      </div>
                    </label>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No supervised employees found.
                    </p>
                  )}
                </div>
                {selectedEmployee && (
                  <p className="text-sm text-blue-600 mt-2">
                    Pre-selected: {selectedEmployee.name} ({getLanguageName(selectedEmployee.preferredLanguage)})
                  </p>
                )}
              </div>
            )}

            {/* Department Wide Info */}
            {trainingData.trainingScope === 'department' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Department-Wide Training</h4>
                <p className="text-sm text-green-800">
                  This training will be assigned to all employees in the {currentUserDepartment} department.
                </p>
              </div>
            )}

            {/* Company Wide Warning */}
            {trainingData.trainingScope === 'company' && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Company-Wide Training</h4>
                <p className="text-sm text-yellow-800">
                  This training will require management approval.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Training Description</label>
              <textarea
                value={trainingData.description}
                onChange={(e) => updateTrainingData('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Provide specific details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              <textarea
                value={trainingData.objectives}
                onChange={(e) => updateTrainingData('objectives', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What should employees be able to do after completing this training?"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Upload documents, procedures, and materials</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={onFileUpload}
                className="hidden"
              />

              {trainingData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {trainingData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => onRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Automated Quiz Generation
              </h3>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Quiz Questions</label>
                    <select
                      value={trainingData.quizConfig?.questionCount || 5}
                      onChange={(e) => updateQuizConfig('questionCount', parseInt(e.target.value))}
                      className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={7}>7 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Passing Score</label>
                    <select
                      value={trainingData.quizConfig?.passingScore || 80}
                      onChange={(e) => updateQuizConfig('passingScore', parseInt(e.target.value))}
                      className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                    >
                      <option value={70}>70%</option>
                      <option value={80}>80%</option>
                      <option value={90}>90%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Question Style</label>
                    <select
                      value={trainingData.quizConfig?.style || 'mixed'}
                      onChange={(e) => updateQuizConfig('style', e.target.value)}
                      className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="multiple-choice">Multiple Choice Only</option>
                      <option value="scenario">Scenario-Based</option>
                      <option value="company-specific">Company Policy Focus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                {enabledModels.length > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-blue-800">
                      Will use your {enabledModels[0][0].toUpperCase()} API • Fallback: Free LLaMA
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">
                      🦙 Using free LLaMA API (no API key required)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerateTraining}
              disabled={!trainingData.title || !trainingData.department || !trainingData.trainingType || (trainingData.trainingScope === 'individual' && trainingData.assignedEmployees.length === 0) || isGenerating}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating Training + Quiz...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Generate Training + Automated Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="space-y-6">
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Supervisor Training Development</h3>
          <div className="space-y-3 text-sm text-green-800">
            {['Individual & department-wide training', 'Multi-language support (10+ languages)', 'Employee language preference matching'].map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">🌍 Multi-Language Training</h3>
          <div className="space-y-3 text-sm text-purple-800">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Current Language:</span>
              <span className="px-2 py-1 bg-white rounded">
                {getLanguageName(trainingData.language)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🤖 RAG Features Active</h3>
          <div className="space-y-3 text-sm text-blue-800">
            {['Company document analysis', 'Performance-based recommendations', 'Multi-language policy integration'].map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {ragAnalysis && (
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">AI Recommendations</h3>
            <div className="space-y-3">
              {ragAnalysis.recommendedTrainings.map((rec, index) => (
                <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-900">{rec.title}</h4>
                  <p className="text-sm text-yellow-800 mt-1">{rec.reason}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority} priority
                    </span>
                    <span className="text-xs text-gray-600">{rec.estimatedDuration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrainingView;
