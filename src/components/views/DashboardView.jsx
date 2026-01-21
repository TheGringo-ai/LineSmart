import React from 'react';
import { UserPlus } from 'lucide-react';
import { standardDepartments } from '../../constants';
import { StatsCards, EmployeeCard } from '../ui';

/**
 * Dashboard view component
 */
export const DashboardView = ({
  stats,
  employees,
  filterDepartment,
  setFilterDepartment,
  setShowAddEmployee,
  setSelectedEmployee,
  setCurrentView
}) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Employee Management */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Supervised Employee Management</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddEmployee(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {standardDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={(emp) => setSelectedEmployee(emp)}
              onAssignTraining={(emp) => {
                setSelectedEmployee(emp);
                setCurrentView('create');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
