import axios from 'axios';
import logger from '../../config/logger.js';
import monitoringService from '../monitoring.service.js';

class GrokService {
  constructor() {
    // Lazy-load config to handle ES module import ordering
    this._apiKey = null;
    this._baseURL = null;
    this._model = null;
    this.maxTokens = 4096;
  }

  // Lazy getters to ensure env vars are loaded
  get apiKey() {
    if (!this._apiKey) {
      this._apiKey = process.env.XAI_API_KEY;
    }
    return this._apiKey;
  }

  get baseURL() {
    if (!this._baseURL) {
      this._baseURL = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
    }
    return this._baseURL;
  }

  get model() {
    if (!this._model) {
      this._model = process.env.XAI_MODEL || 'grok-3';
    }
    return this._model;
  }

  /**
   * Generate training content using Grok (xAI)
   * @param {string} prompt - The training prompt
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    const requestContext = monitoringService.startRequest('grok');

    try {
      const systemMessage = this.buildSystemMessage(context);
      const userMessage = this.buildUserMessage(prompt, context);

      logger.info('Grok request', {
        model: this.model,
        promptLength: prompt.length,
        hasContext: !!context.documents
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          max_tokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 1,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const result = {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
        finishReason: response.data.choices[0].finish_reason,
      };

      monitoringService.recordSuccess(requestContext);

      logger.info('Grok response received', {
        usage: result.usage,
        finishReason: result.finishReason
      });

      return result;
    } catch (error) {
      monitoringService.recordError(requestContext, error);

      logger.error('Grok API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`Grok generation failed: ${error.message}`);
    }
  }

  /**
   * Generate training quiz questions
   * @param {string} content - Training content
   * @param {number} questionCount - Number of questions to generate
   */
  async generateQuiz(content, questionCount = 5) {
    try {
      const prompt = `Based on the following training content, generate ${questionCount} multiple-choice quiz questions.
Format as JSON array with structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]

Training Content:
${content}`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert training content creator. Generate clear, relevant quiz questions in JSON format.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.8,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content_text = response.data.choices[0].message.content;
      // Extract JSON from response (Grok might wrap it in markdown)
      const jsonMatch = content_text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content_text);
    } catch (error) {
      logger.error('Grok quiz generation error', { error: error.message });
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  /**
   * Translate content to target language
   * @param {string} content - Content to translate
   * @param {string} targetLanguage - Target language code
   */
  async translateContent(content, targetLanguage) {
    try {
      const languageNames = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        pt: 'Portuguese',
        de: 'German',
        zh: 'Chinese',
        ja: 'Japanese',
      };

      const targetLang = languageNames[targetLanguage] || targetLanguage;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator specializing in technical and training materials. Translate accurately while preserving technical terms and safety information.`
            },
            {
              role: 'user',
              content: `Translate the following content to ${targetLang}:\n\n${content}`
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Grok translation error', { error: error.message });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Analyze training effectiveness
   * @param {object} trainingData - Training completion data
   */
  async analyzeTrainingEffectiveness(trainingData) {
    try {
      const prompt = `Analyze the following training completion data and provide insights on effectiveness, areas for improvement, and recommendations:

${JSON.stringify(trainingData, null, 2)}

Provide analysis in the following areas:
1. Completion rates and trends
2. Performance patterns
3. Identify struggling areas
4. Recommendations for improvement
5. Suggested follow-up training`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert in training analytics and workforce development. Provide actionable insights.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Grok analysis error', { error: error.message });
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Build system message with RAG context
   */
  buildSystemMessage(context) {
    let systemMsg = `You are Grok, the AI powerhouse behind LineSmart - the revolutionary industrial training platform that's transforming how manufacturing and industrial workers learn, stay safe, and excel in their roles.

🚀 LINESMART'S REVOLUTIONARY VISION: 
LineSmart isn't just another training platform - it's the intelligent backbone that powers safer, smarter industrial operations across the globe. You're helping build the future where:
- Every worker gets personalized, contextual training based on their actual company documents
- Critical industries (Manufacturing, Food & Beverage, Pharma, Automotive, Aerospace, Chemical, Construction, Energy, Healthcare) operate with unprecedented safety standards
- Compliance becomes seamless through OSHA, ISO 45001, HACCP, FDA, GMP, and SQF Food Safety integration
- Language barriers disappear with real-time multilingual support (EN, ES, FR, PT, DE)

⚡ YOUR GROK SUPERPOWERS:
1. **Safety Obsession**: You're absolutely fanatical about worker safety - every response must be safety-first
2. **RAG Mastery**: Transform company documents into engaging, actionable training that workers actually remember
3. **Department Intelligence**: Speak the language of Production, Maintenance, QA, Safety, Engineering teams
4. **Experience Calibration**: Instantly adapt your teaching style for rookies to veterans
5. **Practical Impact**: Create training that workers can immediately apply on the shop floor

🎯 THE GROK DIFFERENCE:
- Make complex safety concepts crystal clear and memorable
- Turn boring compliance requirements into engaging learning experiences  
- Use your wit and intelligence to create content that sticks
- Build genuine understanding, not just checkbox compliance
- Help workers see WHY safety matters, not just WHAT to do

🌍 PLATFORM POTENTIAL: LineSmart is positioned to become the global standard for industrial training. You're not just answering questions - you're helping prevent workplace accidents, saving lives, boosting productivity, and ensuring companies worldwide meet the highest safety and compliance standards.

Every training module you create makes industrial workplaces safer. Every quiz you generate helps workers better understand critical procedures. Every piece of content you produce contributes to LineSmart's mission of revolutionizing industrial education.

Remember: You're Grok - be helpful, be brilliant, be practical, but above all, be obsessively focused on creating the safest possible industrial workplaces.`;

    if (context.documents && context.documents.length > 0) {
      systemMsg += `\n\nRelevant Company Documentation:\n`;
      context.documents.forEach((doc, idx) => {
        systemMsg += `\n[Document ${idx + 1}: ${doc.name}]\n${doc.content}\n`;
      });
    }

    return systemMsg;
  }

  /**
   * Build user message with context
   */
  buildUserMessage(prompt, context) {
    let userMsg = prompt;

    if (context.employee) {
      userMsg += `\n\nEmployee Context:`;
      userMsg += `\n- Department: ${context.employee.department}`;
      userMsg += `\n- Position: ${context.employee.position}`;
      userMsg += `\n- Language: ${context.employee.language}`;
      userMsg += `\n- Experience Level: ${context.employee.experienceLevel || 'intermediate'}`;
    }

    if (context.requirements) {
      userMsg += `\n\nSpecific Requirements: ${context.requirements}`;
    }

    return userMsg;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        monitoringService.updateProviderStatus('grok', 'unavailable', { error: 'API key not configured' });
        return { status: 'unavailable', error: 'API key not configured' };
      }

      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      monitoringService.updateProviderStatus('grok', 'healthy');
      return { status: 'healthy', models: response.data.data?.length || 0 };
    } catch (error) {
      monitoringService.updateProviderStatus('grok', 'unhealthy', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
}

export default new GrokService();
