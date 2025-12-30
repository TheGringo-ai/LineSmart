import express from 'express';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage (replace with Firebase/database in production)
const assessments = new Map();
const userProgress = new Map();

// Assessment tiers configuration
const TIERS = {
  apprentice: {
    name: 'Apprentice',
    level: 1,
    description: 'Entry-level fundamentals and safety basics',
    passingScore: 70,
    timeLimit: 30, // minutes
    questionCount: 10
  },
  journeyman: {
    name: 'Journeyman',
    level: 2,
    description: 'Intermediate skills and troubleshooting',
    passingScore: 75,
    timeLimit: 45,
    questionCount: 15
  },
  master: {
    name: 'Master',
    level: 3,
    description: 'Advanced expertise and leadership',
    passingScore: 80,
    timeLimit: 60,
    questionCount: 20
  }
};

/**
 * GET /api/assessments/tiers
 * Get available assessment tiers
 */
router.get('/tiers', (req, res) => {
  try {
    res.json({
      success: true,
      data: TIERS
    });
  } catch (error) {
    logger.error('Get tiers error', { error: error.message });
    res.status(500).json({ error: 'Failed to get tiers' });
  }
});

/**
 * POST /api/assessments/start
 * Start a new assessment
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, tier, category } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({
        error: 'userId and tier are required'
      });
    }

    if (!TIERS[tier]) {
      return res.status(400).json({
        error: 'Invalid tier. Use: apprentice, journeyman, or master'
      });
    }

    const tierConfig = TIERS[tier];
    const assessmentId = uuidv4();

    const assessment = {
      id: assessmentId,
      userId,
      tier,
      category: category || 'general',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      timeLimit: tierConfig.timeLimit,
      questions: [], // Would be populated from AI or question bank
      answers: [],
      currentQuestion: 0,
      score: null,
      passed: null
    };

    assessments.set(assessmentId, assessment);

    logger.info('Assessment started', {
      assessmentId,
      userId,
      tier
    });

    res.json({
      success: true,
      data: {
        assessmentId,
        tier: tierConfig,
        message: `${tierConfig.name} assessment started. You have ${tierConfig.timeLimit} minutes.`
      }
    });
  } catch (error) {
    logger.error('Start assessment error', { error: error.message });
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

/**
 * POST /api/assessments/:id/answer
 * Submit an answer for an assessment
 */
router.post('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, answer } = req.body;

    const assessment = assessments.get(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'in_progress') {
      return res.status(400).json({ error: 'Assessment is not in progress' });
    }

    // Store the answer
    assessment.answers[questionIndex] = {
      answer,
      submittedAt: new Date().toISOString()
    };
    assessment.currentQuestion = questionIndex + 1;

    assessments.set(id, assessment);

    logger.info('Answer submitted', {
      assessmentId: id,
      questionIndex
    });

    res.json({
      success: true,
      data: {
        currentQuestion: assessment.currentQuestion,
        answersSubmitted: assessment.answers.filter(Boolean).length
      }
    });
  } catch (error) {
    logger.error('Submit answer error', { error: error.message });
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * POST /api/assessments/:id/finish
 * Complete an assessment and get results
 */
router.post('/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = assessments.get(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status === 'completed') {
      return res.status(400).json({ error: 'Assessment already completed' });
    }

    const tierConfig = TIERS[assessment.tier];

    // Calculate score (simplified - in production, compare with correct answers)
    const answeredCount = assessment.answers.filter(Boolean).length;
    const totalQuestions = tierConfig.questionCount;

    // Simulated scoring - replace with actual grading logic
    const correctCount = Math.floor(answeredCount * (0.6 + Math.random() * 0.3));
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= tierConfig.passingScore;

    assessment.status = 'completed';
    assessment.completedAt = new Date().toISOString();
    assessment.score = score;
    assessment.passed = passed;
    assessment.correctCount = correctCount;
    assessment.totalQuestions = totalQuestions;

    assessments.set(id, assessment);

    // Update user progress
    const userKey = assessment.userId;
    const progress = userProgress.get(userKey) || { assessments: [], certifications: [] };
    progress.assessments.push({
      assessmentId: id,
      tier: assessment.tier,
      score,
      passed,
      completedAt: assessment.completedAt
    });

    if (passed) {
      progress.certifications.push({
        tier: assessment.tier,
        earnedAt: assessment.completedAt,
        score
      });
    }
    userProgress.set(userKey, progress);

    logger.info('Assessment completed', {
      assessmentId: id,
      score,
      passed
    });

    res.json({
      success: true,
      data: {
        assessmentId: id,
        tier: tierConfig.name,
        score,
        passingScore: tierConfig.passingScore,
        passed,
        correctCount,
        totalQuestions,
        message: passed
          ? `Congratulations! You passed the ${tierConfig.name} assessment!`
          : `Score: ${score}%. You need ${tierConfig.passingScore}% to pass. Keep practicing!`
      }
    });
  } catch (error) {
    logger.error('Finish assessment error', { error: error.message });
    res.status(500).json({ error: 'Failed to finish assessment' });
  }
});

/**
 * GET /api/assessments/:id
 * Get assessment details
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Get assessment error', { error: error.message });
    res.status(500).json({ error: 'Failed to get assessment' });
  }
});

/**
 * GET /api/assessments/user/:userId/progress
 * Get user's assessment progress and certifications
 */
router.get('/user/:userId/progress', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress.get(userId) || { assessments: [], certifications: [] };

    res.json({
      success: true,
      data: {
        userId,
        ...progress,
        stats: {
          totalAssessments: progress.assessments.length,
          passed: progress.assessments.filter(a => a.passed).length,
          certifications: progress.certifications.length
        }
      }
    });
  } catch (error) {
    logger.error('Get user progress error', { error: error.message });
    res.status(500).json({ error: 'Failed to get user progress' });
  }
});

/**
 * GET /api/assessments/user/:userId/results
 * Get all assessment results for a user
 */
router.get('/user/:userId/results', (req, res) => {
  try {
    const { userId } = req.params;

    const userAssessments = Array.from(assessments.values())
      .filter(a => a.userId === userId && a.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.json({
      success: true,
      data: userAssessments
    });
  } catch (error) {
    logger.error('Get user results error', { error: error.message });
    res.status(500).json({ error: 'Failed to get user results' });
  }
});

export default router;
