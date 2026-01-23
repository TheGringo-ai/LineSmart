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
 * Handles various formats: raw JSON, markdown code blocks, or mixed content
 */
export const parseTrainingResponse = (content) => {
  if (!content) {
    throw new Error('Empty response from AI');
  }

  let jsonString = content;

  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonString = jsonBlockMatch[1].trim();
    console.log('📋 Extracted JSON from code block');
  } else {
    // Try to find JSON object in the content (starts with { ends with })
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
      console.log('📋 Extracted JSON object from response');
    }
  }

  try {
    const parsed = JSON.parse(jsonString);

    // Validate the structure
    if (parsed.training && Array.isArray(parsed.quiz)) {
      console.log('✅ Successfully parsed training response with', parsed.quiz.length, 'quiz questions');
      return parsed;
    }

    // Try to fix common structure issues
    if (parsed.training && !parsed.quiz) {
      console.log('⚠️ No quiz found, adding empty quiz array');
      parsed.quiz = [];
      return parsed;
    }

    throw new Error('Invalid response structure - missing training or quiz');
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError.message);
    console.log('Raw content (first 500 chars):', jsonString.substring(0, 500));

    // Try to salvage partial JSON
    try {
      // Sometimes the response is cut off - try to close it
      let fixedJson = jsonString;
      if (!fixedJson.endsWith('}')) {
        fixedJson = fixedJson + ']}}'
      }
      const parsed = JSON.parse(fixedJson);
      console.log('⚠️ Recovered partial JSON response');
      return parsed;
    } catch {
      throw new Error('Failed to parse AI response as JSON: ' + parseError.message);
    }
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
