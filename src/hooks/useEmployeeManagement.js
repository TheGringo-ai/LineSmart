import { useState, useCallback } from 'react';
import { sampleEmployees, initialNewEmployee } from '../constants';

/**
 * Custom hook for managing employee state and operations
 */
export const useEmployeeManagement = () => {
  const [employees, setEmployees] = useState(sampleEmployees);
  const [newEmployee, setNewEmployee] = useState(initialNewEmployee);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');

  const updateNewEmployee = useCallback((field, value) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetNewEmployee = useCallback(() => {
    setNewEmployee(initialNewEmployee);
  }, []);

  const addNewEmployee = useCallback((currentUser) => {
    if (newEmployee.name && newEmployee.department && newEmployee.position) {
      const employeeId = employees.length + 1;
      const newEmp = {
        id: employeeId,
        ...newEmployee,
        role: 'employee',
        supervisor: currentUser?.name,
        completedTrainings: 0,
        totalTrainings: 0,
        lastTraining: null,
        performance: null,
        certifications: [],
        trainingHistory: [],
        recommendedTrainings: [
          { title: 'Company Orientation', reason: 'New employee onboarding', priority: 'high' },
          { title: 'Safety Fundamentals', reason: 'Required for all new hires', priority: 'high' },
          { title: `${newEmployee.department} Basics`, reason: 'Department-specific training', priority: 'high' }
        ]
      };

      setEmployees(prev => [...prev, newEmp]);
      setNewEmployee(initialNewEmployee);
      setShowAddEmployee(false);
    }
  }, [newEmployee, employees]);

  const updateEmployeeTraining = useCallback((employeeId, trainingData, quizResults, ragAnalysis) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === employeeId
        ? {
          ...emp,
          completedTrainings: emp.completedTrainings + 1,
          lastTraining: new Date().toISOString().split('T')[0],
          trainingHistory: [
            {
              id: emp.trainingHistory.length + 1,
              title: trainingData.title,
              date: new Date().toISOString().split('T')[0],
              score: quizResults.percentage,
              status: 'completed',
              language: trainingData.language,
              ragSources: ragAnalysis ? ragAnalysis.relevantDocuments.map(doc => doc.name) : []
            },
            ...emp.trainingHistory
          ]
        }
        : emp
    ));
  }, []);

  const getFilteredEmployees = useCallback(() => {
    if (filterDepartment === 'all') return employees;
    return employees.filter(emp => emp.department === filterDepartment);
  }, [employees, filterDepartment]);

  const getCurrentUser = useCallback(() => {
    return employees.find(emp => emp.role === 'supervisor') || employees[2];
  }, [employees]);

  const getSupervisedEmployees = useCallback((currentUser) => {
    return employees.filter(emp =>
      emp.supervisor === currentUser?.name || currentUser?.supervisesEmployees?.includes(emp.id)
    );
  }, [employees]);

  const getEmployeesByDepartment = useCallback((department) => {
    return employees.filter(emp => emp.department === department);
  }, [employees]);

  const getEmployeeById = useCallback((id) => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  return {
    employees,
    setEmployees,
    newEmployee,
    setNewEmployee,
    updateNewEmployee,
    selectedEmployee,
    setSelectedEmployee,
    showAddEmployee,
    setShowAddEmployee,
    filterDepartment,
    setFilterDepartment,
    addNewEmployee,
    resetNewEmployee,
    updateEmployeeTraining,
    getFilteredEmployees,
    getCurrentUser,
    getSupervisedEmployees,
    getEmployeesByDepartment,
    getEmployeeById
  };
};

export default useEmployeeManagement;
