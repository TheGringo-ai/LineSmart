import React from 'react';
import { Award, AlertCircle, Eye, Play, CheckCircle } from 'lucide-react';

/**
 * Quiz results view component
 */
export const ResultsView = ({
  quizResults,
  generatedTraining,
  trainingData,
  onReviewTraining,
  onRetakeQuiz,
  onComplete
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            quizResults.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {quizResults.passed ? (
              <Award className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {quizResults.passed ? 'Training Completed Successfully!' : 'Training Needs Review'}
          </h2>
          <p className="text-gray-600 mb-4">
            You scored {quizResults.score} out of {quizResults.total} ({quizResults.percentage}%)
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            quizResults.passed
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {quizResults.passed ? 'PASSED' : `FAILED - Minimum ${trainingData.quizConfig?.passingScore || 80}% required`}
          </div>

          {quizResults.passed && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🎉 Certification Earned</h3>
              <p className="text-sm text-blue-800">
                Certificate will be automatically added to employee training record
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Detailed Results</h3>
          {quizResults.results.map((result, index) => (
            <div key={index} className={`p-6 rounded-lg border-l-4 ${
              result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    result.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  {generatedTraining.quiz[index].ragSource && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      Source: {generatedTraining.quiz[index].ragSource}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{result.question}</p>
              {!result.isCorrect && (
                <div className="mb-3 space-y-1">
                  <p className="text-sm text-red-700">
                    <strong>Your answer:</strong> {generatedTraining.quiz[index].options[result.userAnswer]}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Correct answer:</strong> {generatedTraining.quiz[index].options[result.correctAnswer]}
                  </p>
                </div>
              )}
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">
                  <strong>Explanation:</strong> {result.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={onReviewTraining}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Review Training</span>
          </button>
          {!quizResults.passed && (
            <button
              onClick={onRetakeQuiz}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
          )}
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{quizResults.passed ? 'Complete Training' : 'Save Progress'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
