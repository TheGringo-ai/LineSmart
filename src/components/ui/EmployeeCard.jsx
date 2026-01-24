import React from 'react';
import { Edit3 } from 'lucide-react';
import { getLanguageName } from '../../utils';

/**
 * Employee card component for dashboard display
 */
export const EmployeeCard = ({
  employee,
  onEdit,
  onAssignTraining
}) => {
  const completionPercentage = employee.totalTrainings > 0
    ? (employee.completedTrainings / employee.totalTrainings) * 100
    : 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-600">{employee.position}</p>
          <p className="text-xs text-gray-500">{employee.department}</p>
          <div className="flex items-center space-x-2 mt-1">
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
          onClick={() => onEdit(employee)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Training Progress</span>
          <span>{employee.completedTrainings}/{employee.totalTrainings}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        {employee.performance && (
          <div className="flex justify-between text-sm">
            <span>Performance</span>
            <span className={`font-medium ${employee.performance >= 90 ? 'text-green-600' :
                employee.performance >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {employee.performance}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Recommended Trainings:</h4>
        {(employee.recommendedTrainings || []).slice(0, 2).map((rec, index) => (
          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">{rec.title}</span>
              <span className={`px-2 py-1 rounded text-xs ${rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                }`}>
                {rec.priority}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{rec.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <button
          onClick={() => onAssignTraining(employee)}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Assign Training
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
