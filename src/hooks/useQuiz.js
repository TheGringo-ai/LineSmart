import { useState, useCallback, useEffect } from 'react';

const QUIZ_ANSWERS_KEY = 'linesmart_quiz_answers';
const QUIZ_QUESTION_INDEX_KEY = 'linesmart_quiz_question_index';

/**
 * Custom hook for managing quiz state and operations
 * Now with localStorage persistence to retain progress across page refreshes
 */
export const useQuiz = () => {
  // Initialize state from localStorage if available
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(QUIZ_QUESTION_INDEX_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.error('Error loading quiz question index from localStorage:', error);
      return 0;
    }
  });

  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(QUIZ_ANSWERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading quiz answers from localStorage:', error);
      return {};
    }
  });

  const [quizResults, setQuizResults] = useState(null);

  // Persist currentQuestionIndex to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_QUESTION_INDEX_KEY, currentQuestionIndex.toString());
    } catch (error) {
      console.error('Error saving quiz question index to localStorage:', error);
    }
  }, [currentQuestionIndex]);

  // Persist userAnswers to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(userAnswers));
    } catch (error) {
      console.error('Error saving quiz answers to localStorage:', error);
    }
  }, [userAnswers]);

  // Clear localStorage data when quiz is completed or reset
  const clearQuizData = useCallback(() => {
    try {
      localStorage.removeItem(QUIZ_ANSWERS_KEY);
      localStorage.removeItem(QUIZ_QUESTION_INDEX_KEY);
      console.log('✅ Quiz data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing quiz data from localStorage:', error);
    }
  }, []); // Empty deps - function doesn't depend on any state

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
    clearQuizData(); // Clear any old quiz data
    setCurrentView('quiz');
  }, []); // clearQuizData is stable (empty deps), so not needed in deps

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
    // Clear quiz data from localStorage after submission
    clearQuizData();
    setCurrentView('results');
  }, [userAnswers]); // clearQuizData is stable, only userAnswers changes

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
    clearQuizData();
    setCurrentView('quiz');
  }, []); // clearQuizData is stable, not needed in deps

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    clearQuizData();
  }, []); // clearQuizData is stable, not needed in deps

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
    getCurrentProgress,
    clearQuizData
  };
};

export default useQuiz;
