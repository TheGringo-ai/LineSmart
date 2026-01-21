import { useState, useCallback } from 'react';

/**
 * Custom hook for managing quiz state and operations
 */
export const useQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);

  const handleAnswerSelect = useCallback((questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  }, []);

  const startQuiz = useCallback((setCurrentView) => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setCurrentView('quiz');
  }, []);

  const submitQuiz = useCallback((generatedTraining, passingScore, setCurrentView) => {
    const results = generatedTraining.quiz.map((question, index) => ({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswer: question.correct,
      isCorrect: userAnswers[index] === question.correct,
      explanation: question.explanation
    }));

    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / results.length) * 100);

    setQuizResults({
      results,
      score,
      total: results.length,
      percentage,
      passed: percentage >= (passingScore || 80)
    });
    setCurrentView('results');
  }, [userAnswers]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextQuestion = useCallback((totalQuestions) => {
    setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1));
  }, []);

  const retakeQuiz = useCallback((setCurrentView) => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setCurrentView('quiz');
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
  }, []);

  const isAllQuestionsAnswered = useCallback((totalQuestions) => {
    return Object.keys(userAnswers).length === totalQuestions;
  }, [userAnswers]);

  const getCurrentProgress = useCallback((totalQuestions) => {
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  }, [currentQuestionIndex]);

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    quizResults,
    setQuizResults,
    handleAnswerSelect,
    startQuiz,
    submitQuiz,
    goToPreviousQuestion,
    goToNextQuestion,
    retakeQuiz,
    resetQuiz,
    isAllQuestionsAnswered,
    getCurrentProgress
  };
};

export default useQuiz;
