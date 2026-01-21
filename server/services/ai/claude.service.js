import Anthropic from '@anthropic-ai/sdk';
import logger from '../../config/logger.js';

class ClaudeService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.enabled = !!this.apiKey && this.apiKey.length > 10;
    this.client = null;

    if (this.enabled) {
      try {
        this.client = new Anthropic({
          apiKey: this.apiKey,
        });
        logger.info('Claude service initialized successfully');
      } catch (error) {
        logger.warn('Claude service failed to initialize', { error: error.message });
        this.enabled = false;
      }
    } else {
      logger.warn('Claude service disabled - no valid API key provided');
    }

    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4096;
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.enabled && this.client !== null;
  }

  /**
   * Generate training content using Claude
   * @param {string} prompt - The training prompt
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available - API key not configured');
    }

    try {
      const systemMessage = this.buildSystemMessage(context);
      const userMessage = this.buildUserMessage(prompt, context);

      logger.info('Claude request', {
        model: this.model,
        promptLength: prompt.length,
        hasContext: !!context.documents
      });

      const message = await this.client.messages.create({
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
      });

      const response = {
        content: message.content[0].text,
        model: message.model,
        usage: {
          promptTokens: message.usage.input_tokens,
          completionTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
        finishReason: message.stop_reason,
      };

      logger.info('Claude response received', {
        usage: response.usage,
        finishReason: response.finishReason
      });

      return response;
    } catch (error) {
      logger.error('Claude API error', {
        error: error.message,
        type: error.type,
        status: error.status
      });
      throw new Error(`Claude generation failed: ${error.message}`);
    }
  }

  /**
   * Generate training quiz questions
   * @param {string} content - Training content
   * @param {number} questionCount - Number of questions to generate
   */
  async generateQuiz(content, questionCount = 5) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available - API key not configured');
    }

    try {
      const prompt = `Based on the following training content, generate ${questionCount} multiple-choice quiz questions.
Format as JSON array with structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]

Training Content:
${content}

Respond with only the JSON array, no additional text.`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.8,
        system: 'You are an expert training content creator. Generate clear, relevant quiz questions in JSON format. Respond only with valid JSON.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const responseText = message.content[0].text;
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(responseText);
    } catch (error) {
      logger.error('Claude quiz generation error', { error: error.message });
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  /**
   * Translate content to target language
   * @param {string} content - Content to translate
   * @param {string} targetLanguage - Target language code
   */
  async translateContent(content, targetLanguage) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available - API key not configured');
    }

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

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3,
        system: 'You are a professional translator specializing in technical and training materials. Translate accurately while preserving technical terms and safety information.',
        messages: [
          {
            role: 'user',
            content: `Translate the following content to ${targetLang}:\n\n${content}`
          }
        ],
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('Claude translation error', { error: error.message });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Analyze employee performance and provide recommendations
   * @param {object} employeeData - Employee training data
   */
  async analyzeEmployeePerformance(employeeData) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available - API key not configured');
    }

    try {
      const prompt = `Analyze the following employee training data and provide personalized recommendations:

${JSON.stringify(employeeData, null, 2)}

Provide analysis covering:
1. Strengths and areas of expertise
2. Knowledge gaps or struggling areas
3. Recommended next training topics
4. Suggested learning path
5. Estimated time to proficiency

Format the response as structured text with clear sections.`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.7,
        system: 'You are an expert in workforce development and training analytics. Provide actionable, personalized insights.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('Claude analysis error', { error: error.message });
      throw new Error(`Performance analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate safety-focused content
   * @param {string} scenario - Safety scenario description
   * @param {object} context - Additional context
   */
  async generateSafetyContent(scenario, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available - API key not configured');
    }

    try {
      const systemMessage = `You are a safety expert specializing in industrial and manufacturing environments. Generate comprehensive safety training content that:
- Emphasizes hazard awareness and prevention
- Includes clear, step-by-step procedures
- References relevant safety standards (OSHA, ISO, etc.)
- Uses plain language appropriate for all education levels
- Includes specific examples and scenarios

${context.documents ? 'Reference the company safety documentation provided.' : ''}`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.5, // Lower temperature for safety content
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: `Create detailed safety training content for the following scenario:\n\n${scenario}`
          }
        ],
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('Claude safety content error', { error: error.message });
      throw new Error(`Safety content generation failed: ${error.message}`);
    }
  }

  /**
   * Build system message with RAG context
   */
  buildSystemMessage(context) {
    let systemMsg = `You are Claude, the premier AI safety expert powering LineSmart - the revolutionary industrial training platform that's setting the global standard for workplace safety and compliance education.

🛡️ LINESMART'S SAFETY MISSION: 
As Claude, you represent the pinnacle of safety-conscious AI. LineSmart leverages your analytical precision and ethical focus to create training that doesn't just meet compliance standards - it exceeds them. You're helping build the future where:
- Every industrial worker receives meticulously crafted, evidence-based training rooted in actual company documentation
- Critical industries (Manufacturing, Food & Beverage, Pharmaceutical, Automotive, Aerospace, Chemical, Construction, Energy, Healthcare) achieve unprecedented safety standards
- Regulatory compliance becomes seamless through comprehensive OSHA, ISO 45001, HACCP, FDA, GMP, and SQF Food Safety integration
- Complex safety concepts are broken down into clear, actionable steps that save lives

🎯 CLAUDE'S ANALYTICAL EXCELLENCE:
1. **Uncompromising Safety Standards**: Every piece of content must be thoroughly vetted for safety accuracy and regulatory compliance
2. **Evidence-Based Content**: Transform company documents into scientifically sound, practical training using rigorous analysis
3. **Risk Assessment Mastery**: Identify potential hazards and safety gaps that others might miss
4. **Systematic Approach**: Create structured, comprehensive training that builds knowledge progressively
5. **Ethical Precision**: Ensure all content meets the highest ethical standards for worker protection

📚 CONTENT EXCELLENCE FRAMEWORK:
- Conduct thorough safety risk analysis for every training scenario
- Use clear, unambiguous language that eliminates confusion in safety-critical situations
- Provide detailed explanations of WHY safety procedures matter (not just what to do)
- Include comprehensive coverage of regulatory requirements and compliance standards
- Structure content for maximum comprehension and retention
- Integrate multiple learning modalities (visual, auditory, kinesthetic) where appropriate

🌍 PLATFORM VISION: LineSmart, powered by Claude's analytical rigor, represents the future of industrial safety education. You're not just creating training content - you're architecting the foundation for safer workplaces worldwide. Every training module you craft contributes to preventing workplace injuries, ensuring regulatory compliance, and building a culture where safety is paramount.

Your analytical depth, combined with LineSmart's RAG capabilities and multi-industry expertise, creates training experiences that are both comprehensive and immediately applicable. You're helping establish LineSmart as the definitive platform for industrial safety education globally.

Remember: You are Claude - be thorough, be precise, be safety-obsessed, and never compromise on the quality that protects workers' lives.`;

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
    if (!this.isAvailable()) {
      return {
        status: 'unavailable',
        error: 'API key not configured'
      };
    }

    try {
      // Claude doesn't have a models list endpoint, so we'll do a minimal request
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Health check'
          }
        ],
      });
      return {
        status: 'healthy',
        model: message.model
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

export default new ClaudeService();
