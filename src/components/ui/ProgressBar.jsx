import React from 'react';

/**
 * Reusable progress bar component
 */
export const ProgressBar = ({
  percentage,
  height = 'h-2',
  color = 'bg-blue-600',
  backgroundColor = 'bg-gray-200',
  showLabel = false,
  label = ''
}) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${backgroundColor} rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
