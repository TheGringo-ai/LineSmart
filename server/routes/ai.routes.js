import express from 'express';
import aiManager from '../services/ai/ai-manager.service.js';
import monitoringService from '../services/monitoring.service.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * Parse training response from AI to extract JSON
 */
function parseTrainingResponse(content) {
  if (!content) {
    throw new Error('Empty response from AI');
  }

  let jsonString = content;

  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonString = jsonBlockMatch[1].trim();
    logger.info('Extracted JSON from code block');
  } else {
    // Try to find JSON object in the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
      logger.info('Extracted JSON object from response');
    }
  }

  try {
    const parsed = JSON.parse(jsonString);

    // Validate the structure
    if (parsed.training && Array.isArray(parsed.quiz)) {
      logger.info('Successfully parsed training response', { quizCount: parsed.quiz.length });
      return parsed;
    }

    // Try to fix common structure issues
    if (parsed.training && !parsed.quiz) {
      logger.warn('No quiz found, adding empty quiz array');
      parsed.quiz = [];
      return parsed;
    }

    throw new Error('Invalid response structure - missing training or quiz');
  } catch (parseError) {
    logger.error('JSON parse error', { error: parseError.message });

    // Try to salvage partial JSON
    try {
      let fixedJson = jsonString;
      if (!fixedJson.endsWith('}')) {
        fixedJson = fixedJson + ']}}';
      }
      const parsed = JSON.parse(fixedJson);
      logger.warn('Recovered partial JSON response');
      return parsed;
    } catch {
      throw new Error('Failed to parse AI response as JSON: ' + parseError.message);
    }
  }
}

/**
 * POST /api/ai/generate-training
 * Generate training content
 */
router.post('/generate-training', async (req, res) => {
  try {
    const { prompt, context, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    logger.info('Training content generation request', {
      provider: options?.provider,
      hasContext: !!context,
      hasDocumentContent: !!context?.documentContent,
      documentLength: context?.documentContent?.length || 0
    });

    // Include document content in the context if provided
    const enrichedContext = {
      ...context,
      documents: context?.documentContent ? [{
        name: 'Uploaded Document',
        content: context.documentContent
      }] : context?.documents || []
    };

    // Use higher token limit for comprehensive training
    const enrichedOptions = {
      ...options,
      maxTokens: options?.maxTokens || 4000
    };

    const result = await aiManager.generateTrainingContent(prompt, enrichedContext, enrichedOptions);

    // Parse the AI response to extract structured training data
    let trainingData;
    try {
      trainingData = parseTrainingResponse(result.content);
    } catch (parseError) {
      logger.error('Failed to parse training response', { error: parseError.message });
      // Return a fallback structure
      trainingData = {
        training: {
          introduction: result.content.substring(0, 500),
          sections: [{
            title: 'Generated Content',
            content: result.content,
            keyPoints: ['Review the full content for detailed information']
          }],
          safetyNotes: ['Follow all safety procedures'],
          bestPractices: ['Review documentation before starting'],
          commonMistakes: ['Not following documented procedures']
        },
        quiz: []
      };
    }

    res.json({
      success: true,
      data: trainingData,
      meta: {
        provider: result.provider,
        model: result.model,
        usage: result.usage
      }
    });
  } catch (error) {
    logger.error('Training generation endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate training content',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/generate-sop
 * Generate Standard Operating Procedure (SOP)
 */
router.post('/generate-sop', async (req, res) => {
  try {
    const { prompt, context, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'SOP prompt is required'
      });
    }

    logger.info('SOP generation request', {
      provider: options?.provider,
      hasContext: !!context,
      promptLength: prompt.length
    });

    const result = await aiManager.generateSOP(prompt, context, options);

    res.json({
      success: true,
      data: result,
      message: 'SOP generated successfully by SOPHAIA'
    });
  } catch (error) {
    logger.error('SOP generation endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate SOP',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/generate-quiz
 * Generate quiz questions
 */
router.post('/generate-quiz', async (req, res) => {
  try {
    const { content, questionCount = 5, options } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    logger.info('Quiz generation request', {
      provider: options?.provider,
      questionCount
    });

    const questions = await aiManager.generateQuiz(content, questionCount, options);

    res.json({
      success: true,
      data: {
        questions,
        count: questions.length
      }
    });
  } catch (error) {
    logger.error('Quiz generation endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate quiz',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/translate
 * Translate content
 */
router.post('/translate', async (req, res) => {
  try {
    const { content, targetLanguage, options } = req.body;

    if (!content || !targetLanguage) {
      return res.status(400).json({
        error: 'Content and targetLanguage are required'
      });
    }

    logger.info('Translation request', {
      provider: options?.provider,
      targetLanguage
    });

    const translatedContent = await aiManager.translateContent(
      content,
      targetLanguage,
      options
    );

    res.json({
      success: true,
      data: {
        originalContent: content,
        translatedContent,
        targetLanguage
      }
    });
  } catch (error) {
    logger.error('Translation endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to translate content',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/analyze-performance
 * Analyze employee performance
 */
router.post('/analyze-performance', async (req, res) => {
  try {
    const { employeeData, options } = req.body;

    if (!employeeData) {
      return res.status(400).json({
        error: 'Employee data is required'
      });
    }

    logger.info('Performance analysis request', {
      provider: options?.provider,
      employeeId: employeeData.id
    });

    const analysis = await aiManager.analyzeEmployeePerformance(employeeData, options);

    res.json({
      success: true,
      data: {
        analysis,
        employeeId: employeeData.id
      }
    });
  } catch (error) {
    logger.error('Performance analysis endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to analyze performance',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/safety-content
 * Generate safety-focused content
 */
router.post('/safety-content', async (req, res) => {
  try {
    const { scenario, context, options } = req.body;

    if (!scenario) {
      return res.status(400).json({
        error: 'Safety scenario is required'
      });
    }

    logger.info('Safety content generation request', {
      provider: options?.provider
    });

    const content = await aiManager.generateSafetyContent(scenario, context, options);

    res.json({
      success: true,
      data: {
        content,
        scenario
      }
    });
  } catch (error) {
    logger.error('Safety content endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate safety content',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/embeddings
 * Generate embeddings for RAG
 */
router.post('/embeddings', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Texts array is required'
      });
    }

    logger.info('Embeddings generation request', {
      count: texts.length
    });

    const embeddings = await aiManager.generateEmbeddings(texts);

    res.json({
      success: true,
      data: {
        embeddings,
        count: embeddings.length
      }
    });
  } catch (error) {
    logger.error('Embeddings endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to generate embeddings',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/providers
 * List available AI providers
 */
router.get('/providers', (req, res) => {
  try {
    const providers = aiManager.listProviders();
    const capabilities = aiManager.getProviderCapabilities();

    res.json({
      success: true,
      data: {
        providers,
        capabilities,
        default: process.env.DEFAULT_AI_PROVIDER || 'openai'
      }
    });
  } catch (error) {
    logger.error('Providers endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to list providers',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for all providers
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await aiManager.healthCheckAll();

    const allHealthy = Object.values(healthStatus).every(
      status => status.status === 'healthy'
    );

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: healthStatus
    });
  } catch (error) {
    logger.error('Health check endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/health/:provider
 * Health check for specific provider
 */
router.get('/health/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const healthStatus = await aiManager.healthCheck(provider);

    res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus
    });
  } catch (error) {
    logger.error('Provider health check error', {
      provider: req.params.provider,
      error: error.message
    });
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/recommend/:taskType
 * Get recommended provider for task type
 */
router.get('/recommend/:taskType', (req, res) => {
  try {
    const { taskType } = req.params;
    const recommended = aiManager.recommendProvider(taskType);

    res.json({
      success: true,
      data: {
        taskType,
        recommendedProvider: recommended
      }
    });
  } catch (error) {
    logger.error('Recommendation endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to get recommendation',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/metrics
 * Get detailed monitoring metrics for all AI providers
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = monitoringService.getAllMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Metrics endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/metrics/:provider
 * Get monitoring metrics for a specific provider
 */
router.get('/metrics/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const metrics = monitoringService.getProviderMetrics(provider);

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: `Provider '${provider}' not found`
      });
    }

    res.json({
      success: true,
      data: {
        provider,
        metrics
      }
    });
  } catch (error) {
    logger.error('Provider metrics endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to get provider metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/health-summary
 * Get health summary for dashboard
 */
router.get('/health-summary', (req, res) => {
  try {
    const summary = monitoringService.getHealthSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Health summary endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to get health summary',
      message: error.message
    });
  }
});

export default router;
