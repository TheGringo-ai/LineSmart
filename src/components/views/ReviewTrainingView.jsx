import React from 'react';
import { Play, Download, AlertCircle } from 'lucide-react';
import { getLanguageName } from '../../utils';

/**
 * Training review view component
 */
export const ReviewTrainingView = ({
  generatedTraining,
  trainingData,
  onStartQuiz
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{trainingData.title}</h2>
            <p className="text-gray-600">{trainingData.department} • {trainingData.trainingType}</p>
            <p className="text-sm text-blue-600 mt-1">
              Language: {getLanguageName(trainingData.language)} • Scope: {trainingData.trainingScope}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onStartQuiz}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Quiz</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Training Content Display */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Introduction</h3>
          <p className="text-gray-700 leading-relaxed">{generatedTraining.training.introduction}</p>
        </div>

        <div className="space-y-8">
          {generatedTraining.training.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Points:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  {section.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Notes */}
        <div className="mt-8 bg-red-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Individual Safety Responsibilities
          </h3>
          <ul className="list-disc list-inside space-y-2 text-red-800">
            {generatedTraining.training.safetyNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>

        {/* Best Practices */}
        <div className="mt-6 bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-900 mb-4">Personal Best Practices</h3>
          <ul className="list-disc list-inside space-y-2 text-green-800">
            {generatedTraining.training.bestPractices.map((practice, index) => (
              <li key={index}>{practice}</li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-900 mb-4">Common Individual Mistakes to Avoid</h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800">
            {generatedTraining.training.commonMistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewTrainingView;
