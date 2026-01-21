import React from 'react';
import { getLanguageName } from '../../utils';

/**
 * Modal for viewing employee details
 */
export const EmployeeDetailModal = ({
  employee,
  onClose
}) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.position} • {employee.department}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {getLanguageName(employee.preferredLanguage)}
                </span>
                {employee.role === 'supervisor' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Supervisor
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Training Progress</h3>
              <p className="text-2xl font-bold text-blue-600">
                {employee.completedTrainings}/{employee.totalTrainings}
              </p>
              <p className="text-sm text-blue-700">Completed Trainings</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Performance Score</h3>
              <p className="text-2xl font-bold text-green-600">
                {employee.performance || 'N/A'}%
              </p>
              <p className="text-sm text-green-700">Current Performance</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Last Training</h3>
              <p className="text-lg font-bold text-purple-600">
                {employee.lastTraining || 'No training yet'}
              </p>
              <p className="text-sm text-purple-700">Most Recent</p>
            </div>
          </div>

          {/* Certifications */}
          {employee.certifications && employee.certifications.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {employee.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Training History */}
          {employee.trainingHistory && employee.trainingHistory.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Training History</h3>
              <div className="space-y-3">
                {employee.trainingHistory.map((training, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{training.title}</p>
                      <p className="text-sm text-gray-600">
                        {training.date} • {getLanguageName(training.language)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${
                        training.score >= 90 ? 'text-green-600' :
                        training.score >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {training.score}%
                      </span>
                      <p className="text-xs text-gray-500">{training.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Trainings */}
          {employee.recommendedTrainings && employee.recommendedTrainings.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recommended Trainings</h3>
              <div className="space-y-3">
                {employee.recommendedTrainings.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-yellow-900">{rec.title}</p>
                        <p className="text-sm text-yellow-800 mt-1">{rec.reason}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
