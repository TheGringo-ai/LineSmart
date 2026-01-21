import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle, XCircle, Play, ChevronRight, Trophy, Target, Star, ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }
  return { 'Content-Type': 'application/json' };
};

const AssessmentCenter = ({ userId, onBack }) => {
  const [tiers, setTiers] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample questions for demo (in production, these come from AI generation)
  const sampleQuestions = {
    apprentice: [
      { question: "What is the primary purpose of lockout/tagout procedures?", options: ["To save energy", "To prevent accidental startup during maintenance", "To track equipment usage", "To improve productivity"], correct: 1 },
      { question: "Which PPE is required in a welding area?", options: ["Safety glasses", "Hard hat", "Welding helmet and gloves", "Ear plugs only"], correct: 2 },
      { question: "What should you do if you notice a safety hazard?", options: ["Ignore it", "Report it immediately", "Fix it yourself", "Wait for someone else"], correct: 1 },
      { question: "How often should fire extinguishers be inspected?", options: ["Yearly", "Monthly", "Weekly", "Daily"], correct: 1 },
      { question: "What does a yellow safety sign typically indicate?", options: ["Danger", "Caution", "Safety equipment", "First aid"], correct: 1 },
    ],
    journeyman: [
      { question: "What is the correct procedure for confined space entry?", options: ["Just enter carefully", "Complete permit, test atmosphere, have attendant", "Wear a respirator", "Work in pairs"], correct: 1 },
      { question: "When troubleshooting electrical equipment, you should first:", options: ["Check the manual", "Verify zero energy state", "Replace the fuse", "Call a supervisor"], correct: 1 },
      { question: "What causes most bearing failures?", options: ["Improper lubrication", "Manufacturing defects", "Overloading", "Vibration"], correct: 0 },
      { question: "Proper torque sequence for flange bolts is:", options: ["Random", "Circular", "Star pattern", "Left to right"], correct: 2 },
      { question: "What is the purpose of vibration analysis?", options: ["Noise reduction", "Predictive maintenance", "Energy savings", "Quality control"], correct: 1 },
    ],
    master: [
      { question: "When implementing a reliability-centered maintenance program, the first step is:", options: ["Train technicians", "Identify critical assets", "Purchase software", "Hire consultants"], correct: 1 },
      { question: "Root cause analysis should identify:", options: ["Who to blame", "Immediate cause only", "Physical, human, and latent causes", "Equipment age"], correct: 2 },
      { question: "The optimal PM frequency is determined by:", options: ["Manufacturer recommendation only", "Failure history and criticality analysis", "Budget constraints", "Technician availability"], correct: 1 },
      { question: "Key metrics for maintenance effectiveness include:", options: ["Only downtime", "OEE, MTBF, MTTR", "Labor hours only", "Parts cost only"], correct: 1 },
      { question: "When mentoring apprentices, the most effective approach is:", options: ["Let them figure it out", "Do it for them", "Explain why, demonstrate, observe, provide feedback", "Give written instructions"], correct: 2 },
    ]
  };

  useEffect(() => {
    fetchTiers();
    fetchUserProgress();
  }, [userId]);

  const fetchTiers = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/assessments/tiers`, { headers });
      const data = await res.json();
      if (data.success) {
        setTiers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tiers:', err);
      // Use default tiers
      setTiers({
        apprentice: { name: 'Apprentice', level: 1, description: 'Entry-level fundamentals', passingScore: 70, timeLimit: 30 },
        journeyman: { name: 'Journeyman', level: 2, description: 'Intermediate skills', passingScore: 75, timeLimit: 45 },
        master: { name: 'Master', level: 3, description: 'Advanced expertise', passingScore: 80, timeLimit: 60 }
      });
    }
  };

  const fetchUserProgress = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/assessments/user/${userId}/progress`, { headers });
      const data = await res.json();
      if (data.success) {
        setUserProgress(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      setUserProgress({ assessments: [], certifications: [], stats: { totalAssessments: 0, passed: 0, certifications: 0 } });
    }
  };

  const startAssessment = async (tier) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/assessments/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, tier })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentAssessment({ ...data.data, tier, questions: sampleQuestions[tier] });
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
      }
    } catch (err) {
      setError('Failed to start assessment');
      // Fallback to local mode
      setCurrentAssessment({
        assessmentId: `local-${Date.now()}`,
        tier,
        questions: sampleQuestions[tier]
      });
      setCurrentQuestion(0);
      setAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answerIndex) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < currentAssessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = async (finalAnswers) => {
    setLoading(true);
    const questions = currentAssessment.questions;
    const correctCount = finalAnswers.filter((ans, idx) => ans === questions[idx].correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const tierConfig = tiers[currentAssessment.tier];
    const passed = score >= tierConfig.passingScore;

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/api/assessments/${currentAssessment.assessmentId}/finish`, {
        method: 'POST',
        headers
      });
    } catch (err) {
      console.error('Failed to save result:', err);
    }

    setResult({
      score,
      correctCount,
      totalQuestions: questions.length,
      passed,
      tier: tierConfig.name
    });
    setLoading(false);
    fetchUserProgress();
  };

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'apprentice': return <Target className="w-8 h-8 text-green-400" />;
      case 'journeyman': return <Star className="w-8 h-8 text-blue-400" />;
      case 'master': return <Trophy className="w-8 h-8 text-yellow-400" />;
      default: return <Award className="w-8 h-8 text-gray-400" />;
    }
  };

  const hasCertification = (tier) => {
    return userProgress?.certifications?.some(c => c.tier === tier);
  };

  // Assessment in progress
  if (currentAssessment && !result) {
    const question = currentAssessment.questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
            {/* Progress */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400">Question {currentQuestion + 1} of {currentAssessment.questions.length}</span>
              <span className="text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {tiers[currentAssessment.tier]?.name} Assessment
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-8">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentAssessment.questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white mb-8">{question.question}</h2>

            {/* Options */}
            <div className="space-y-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => submitAnswer(idx)}
                  className="w-full p-4 text-left bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600 hover:border-cyan-500 transition-all text-white flex items-center gap-4"
                >
                  <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {result.passed ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-400 mb-8">
            {result.passed
              ? `You passed the ${result.tier} assessment!`
              : `You scored ${result.score}%. You need 70% to pass.`
            }
          </p>
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-bold text-white mb-2">{result.score}%</div>
            <div className="text-slate-400">{result.correctCount} of {result.totalQuestions} correct</div>
          </div>
          <button
            onClick={() => {
              setCurrentAssessment(null);
              setResult(null);
            }}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // Main assessment center
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">Assessment Center</h1>
            <p className="text-slate-400">Test your skills and earn certifications</p>
          </div>
        </div>

        {/* User Stats */}
        {userProgress && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
              <div className="text-3xl font-bold text-white">{userProgress.stats?.totalAssessments || 0}</div>
              <div className="text-slate-400 text-sm">Assessments Taken</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
              <div className="text-3xl font-bold text-green-400">{userProgress.stats?.passed || 0}</div>
              <div className="text-slate-400 text-sm">Passed</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
              <div className="text-3xl font-bold text-yellow-400">{userProgress.stats?.certifications || 0}</div>
              <div className="text-slate-400 text-sm">Certifications</div>
            </div>
          </div>
        )}

        {/* Tier Cards */}
        {tiers && (
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(tiers).map(([key, tier]) => (
              <div key={key} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  {getTierIcon(key)}
                  {hasCertification(key) && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      CERTIFIED
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tier.timeLimit} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {tier.passingScore}% to pass
                  </span>
                </div>
                <button
                  onClick={() => startAssessment(key)}
                  disabled={loading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Loading...' : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Assessment
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentCenter;
