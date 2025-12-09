import openaiService from './openai.service.js';
import claudeService from './claude.service.js';
import geminiService from './gemini.service.js';
import grokService from './grok.service.js';
import llamaService from './llama.service.js';
import logger from '../../config/logger.js';

/**
 * Unified AI Manager Service
 * Provides a single interface to interact with multiple AI providers
 */
class AIManagerService {
  constructor() {
    this.providers = {
      openai: openaiService,
      claude: claudeService,
      gemini: geminiService,
      grok: grokService,
      llama: llamaService,
    };

    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai'; // Using GPT-3.5-turbo for cost efficiency
  }

  /**
   * Generate training content using specified or default AI provider
   * @param {string} prompt - Training content prompt
   * @param {object} context - RAG context and employee data
   * @param {object} options - Generation options including provider
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    const provider = options.provider || this.defaultProvider;
    const service = this.getService(provider);

    logger.info('Generating training content', {
      provider,
      promptLength: prompt.length,
      hasDocuments: !!context.documents?.length
    });

    try {
      const result = await service.generateTrainingContent(prompt, context, options);
      return {
        ...result,
        provider,
      };
    } catch (error) {
      logger.error('Training content generation failed', {
        provider,
        error: error.message
      });

      // Attempt fallback if enabled
      if (options.enableFallback && options.fallbackProvider) {
        logger.info('Attempting fallback provider', {
          fallback: options.fallbackProvider
        });
        return this.generateTrainingContent(prompt, context, {
          ...options,
          provider: options.fallbackProvider,
          enableFallback: false, // Prevent infinite fallback loop
        });
      }

      throw error;
    }
  }

  /**
   * Generate Standard Operating Procedure (SOP) with exceptional quality
   * @param {string} prompt - SOP request
   * @param {object} context - RAG context and employee data
   * @param {object} options - Generation options including provider
   */
  async generateSOP(prompt, context = {}, options = {}) {
    const provider = options.provider || 'openai'; // OpenAI optimized for SOP generation
    const service = this.getService(provider);

    logger.info('Generating SOP', {
      provider,
      promptLength: prompt.length,
      hasDocuments: !!context.documents?.length
    });

    try {
      // Use specialized SOP method if available, otherwise fallback to training content
      let result;
      if (service.generateSOP) {
        result = await service.generateSOP(prompt, context, options);
      } else {
        // Fallback with SOP-optimized prompt
        const sopPrompt = `Create a detailed Standard Operating Procedure (SOP) for: ${prompt}. Include safety requirements, step-by-step instructions, quality checkpoints, and emergency procedures.`;
        result = await service.generateTrainingContent(sopPrompt, context, options);
      }
      
      return {
        ...result,
        provider,
        type: 'sop',
      };
    } catch (error) {
      logger.error('SOP generation failed', {
        provider,
        error: error.message
      });

      // Attempt fallback if enabled
      if (options.enableFallback && options.fallbackProvider) {
        logger.info('Attempting fallback provider for SOP', {
          fallback: options.fallbackProvider
        });
        return this.generateSOP(prompt, context, {
          ...options,
          provider: options.fallbackProvider,
          enableFallback: false, // Prevent infinite fallback loop
        });
      }

      throw error;
    }
  }

  /**
   * Generate quiz questions
   * @param {string} content - Training content to generate quiz from
   * @param {number} questionCount - Number of questions
   * @param {object} options - Options including provider
   */
  async generateQuiz(content, questionCount = 5, options = {}) {
    const provider = options.provider || this.defaultProvider;
    const service = this.getService(provider);

    logger.info('Generating quiz', { provider, questionCount });

    try {
      return await service.generateQuiz(content, questionCount);
    } catch (error) {
      logger.error('Quiz generation failed', {
        provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Translate content to target language
   * @param {string} content - Content to translate
   * @param {string} targetLanguage - Target language code
   * @param {object} options - Options including provider
   */
  async translateContent(content, targetLanguage, options = {}) {
    const provider = options.provider || this.defaultProvider;
    const service = this.getService(provider);

    logger.info('Translating content', {
      provider,
      targetLanguage,
      contentLength: content.length
    });

    try {
      return await service.translateContent(content, targetLanguage);
    } catch (error) {
      logger.error('Translation failed', {
        provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate embeddings (OpenAI only for now)
   * @param {string[]} texts - Array of text chunks
   */
  async generateEmbeddings(texts) {
    logger.info('Generating embeddings', { count: texts.length });

    try {
      if (openaiService.generateEmbeddings) {
        return await openaiService.generateEmbeddings(texts);
      }
      throw new Error('Embeddings only supported with OpenAI provider');
    } catch (error) {
      logger.error('Embedding generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze employee performance (Claude or Grok)
   * @param {object} employeeData - Employee training data
   * @param {object} options - Options including provider
   */
  async analyzeEmployeePerformance(employeeData, options = {}) {
    const provider = options.provider || 'claude'; // Claude is good at analysis
    const service = this.getService(provider);

    logger.info('Analyzing employee performance', { provider });

    try {
      if (service.analyzeEmployeePerformance) {
        return await service.analyzeEmployeePerformance(employeeData);
      }
      // Fallback to general analysis
      if (service.analyzeTrainingData) {
        return await service.analyzeTrainingData(employeeData);
      }
      throw new Error(`Performance analysis not supported by ${provider}`);
    } catch (error) {
      logger.error('Performance analysis failed', {
        provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate safety-focused content (Claude recommended)
   * @param {string} scenario - Safety scenario
   * @param {object} context - Additional context
   * @param {object} options - Options including provider
   */
  async generateSafetyContent(scenario, context = {}, options = {}) {
    const provider = options.provider || 'claude'; // Claude excels at safety content
    const service = this.getService(provider);

    logger.info('Generating safety content', { provider });

    try {
      if (service.generateSafetyContent) {
        return await service.generateSafetyContent(scenario, context);
      }
      // Fallback to regular content generation with safety emphasis
      const safetyPrompt = `Generate comprehensive safety training content for the following scenario. Emphasize hazard awareness, prevention, and step-by-step safety procedures:\n\n${scenario}`;
      const result = await service.generateTrainingContent(safetyPrompt, context, options);
      return result.content;
    } catch (error) {
      logger.error('Safety content generation failed', {
        provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check for all providers
   */
  async healthCheckAll() {
    const results = {};

    for (const [name, service] of Object.entries(this.providers)) {
      try {
        results[name] = await service.healthCheck();
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Health check for specific provider
   * @param {string} provider - Provider name
   */
  async healthCheck(provider) {
    const service = this.getService(provider);
    return await service.healthCheck();
  }

  /**
   * Get service instance by provider name
   * @param {string} provider - Provider name
   */
  getService(provider) {
    const service = this.providers[provider.toLowerCase()];
    if (!service) {
      throw new Error(`Unknown AI provider: ${provider}. Available: ${Object.keys(this.providers).join(', ')}`);
    }
    return service;
  }

  /**
   * List available providers
   */
  listProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities() {
    return {
      openai: {
        trainingContent: true,
        quiz: true,
        translation: true,
        embeddings: true,
        analysis: false,
        safety: false,
        vision: false,
      },
      claude: {
        trainingContent: true,
        quiz: true,
        translation: true,
        embeddings: false,
        analysis: true,
        safety: true,
        vision: false,
      },
      gemini: {
        trainingContent: true,
        quiz: true,
        translation: true,
        embeddings: false,
        analysis: true,
        safety: false,
        vision: true, // gemini-pro-vision
      },
      grok: {
        trainingContent: true,
        quiz: true,
        translation: true,
        embeddings: false,
        analysis: true,
        safety: false,
        vision: false,
      },
      llama: {
        trainingContent: true,
        quiz: true,
        translation: true,
        embeddings: false,
        analysis: false,
        safety: false,
        vision: false,
      },
    };
  }

  /**
   * Recommend best provider for task
   * @param {string} taskType - Type of task
   */
  recommendProvider(taskType) {
    const recommendations = {
      trainingContent: 'openai', // GPT-3.5-turbo is cost-effective with good quality
      quiz: 'openai', // Good at structured output, cost-effective
      translation: 'openai', // Cost-effective option
      embeddings: 'openai', // Only option currently
      analysis: 'openai', // Cost-effective for basic analysis
      safety: 'openai', // Cost-effective safety content
      vision: 'gemini', // Only vision-capable
      speed: 'openai', // Fast and cost-effective
      cost: 'llama', // Free with Ollama
    };

    return recommendations[taskType] || this.defaultProvider;
  }
}

export default new AIManagerService();
