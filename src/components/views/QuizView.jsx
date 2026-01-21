import React from 'react';
import { CheckCircle, Award } from 'lucide-react';

/**
 * Quiz taking view component
 */
export const QuizView = ({
  generatedTraining,
  currentQuestionIndex,
  userAnswers,
  trainingData,
  onAnswerSelect,
  onPrevious,
  onNext,
  onSubmit,
  progressPercentage,
  canSubmit
}) => {
  const currentQuestion = generatedTraining.quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === generatedTraining.quiz.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            Knowledge Assessment Quiz
          </h2>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {generatedTraining.quiz.length}
            </span>
            <div className="text-xs text-blue-600 mt-1">
              Passing Score: {trainingData.quizConfig?.passingScore || 80}%
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="question-container">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentQuestion.type || 'Company Policy'}
              </span>
              {currentQuestion.ragSource && (
                <span className="inline-block ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Source: {currentQuestion.ragSource}
                </span>
              )}
            </div>

            <h3 className="text-lg font-medium mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    userAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={userAnswers[currentQuestionIndex] === index}
                    onChange={() => onAnswerSelect(currentQuestionIndex, index)}
                    className="sr-only"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Award className="h-4 w-4" />
              <span>Submit Quiz</span>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>

        {/* Quiz Help Panel */}
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Quiz Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-800">
            <div>
              <span className="font-medium">Questions:</span> {generatedTraining.quiz.length}
            </div>
            <div>
              <span className="font-medium">Passing Score:</span> {trainingData.quizConfig?.passingScore || 80}%
            </div>
            <div>
              <span className="font-medium">Retakes:</span> Unlimited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
