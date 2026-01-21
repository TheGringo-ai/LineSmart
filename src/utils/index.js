// LineSmart Platform Utility Functions
import { languages } from '../constants';

/**
 * Get language display name with flag from language code
 */
export const getLanguageName = (code) => {
  const lang = languages.find(l => l.code === code);
  return lang ? `${lang.flag} ${lang.name}` : code;
};

/**
 * Calculate dashboard statistics from employees array
 */
export const getDashboardStats = (employees) => {
  const totalEmployees = employees.length;
  const avgCompletion = employees.reduce((acc, emp) =>
    acc + (emp.totalTrainings > 0 ? (emp.completedTrainings / emp.totalTrainings) * 100 : 0), 0) / totalEmployees;
  const activeTrainings = employees.reduce((acc, emp) => acc + (emp.totalTrainings - emp.completedTrainings), 0);
  const avgPerformance = employees.filter(emp => emp.performance).reduce((acc, emp) => acc + emp.performance, 0) /
    employees.filter(emp => emp.performance).length;

  return {
    totalEmployees,
    avgCompletion: Math.round(avgCompletion),
    activeTrainings,
    avgPerformance: Math.round(avgPerformance || 0)
  };
};

/**
 * Get company config suggestions based on industry
 */
export const getIndustrySuggestions = (industry) => {
  const suggestions = {
    'Manufacturing': {
      departments: ['Production', 'Maintenance', 'Quality Assurance', 'Safety', 'Engineering'],
      safetyRequirements: ['OSHA Compliance', 'ISO 45001', 'Environmental Health'],
      defaultTrainings: ['Safety Orientation', 'Equipment Training', 'Quality Procedures']
    },
    'Food & Beverage': {
      departments: ['Production', 'Quality Assurance', 'Sanitation', 'Warehouse', 'Maintenance'],
      safetyRequirements: ['SQF Food Safety', 'HACCP', 'FDA Regulations', 'GMP'],
      defaultTrainings: ['Food Safety Fundamentals', 'HACCP Principles', 'Sanitation Procedures']
    },
    'Healthcare': {
      departments: ['Clinical', 'Nursing', 'Administration', 'Maintenance', 'Safety'],
      safetyRequirements: ['OSHA Compliance', 'HIPAA', 'Infection Control'],
      defaultTrainings: ['HIPAA Training', 'Infection Control', 'Patient Safety']
    }
  };

  return suggestions[industry] || suggestions['Manufacturing'];
};

/**
 * Parse AI training response to extract JSON
 */
export const parseTrainingResponse = (content) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.training && parsed.quiz) {
      return parsed;
    }
    throw new Error('Invalid response structure');
  } catch (error) {
    console.log('Failed to parse API response as JSON, falling back to mock data');
    throw error;
  }
};

/**
 * Filter employees by department
 */
export const filterEmployeesByDepartment = (employees, department) => {
  if (department === 'all') return employees;
  return employees.filter(emp => emp.department === department);
};

/**
 * Get employee training completion percentage
 */
export const getTrainingCompletionPercentage = (employee) => {
  if (employee.totalTrainings === 0) return 0;
  return Math.round((employee.completedTrainings / employee.totalTrainings) * 100);
};
