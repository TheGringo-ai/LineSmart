import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../config/logger.js';
import monitoringService from '../monitoring.service.js';

class GeminiService {
  constructor() {
    // Lazy-load API key to handle ES module import ordering
    this._apiKey = null;
    this._genAI = null;
    this.maxTokens = 4096;
  }

  get apiKey() {
    if (!this._apiKey) {
      this._apiKey = process.env.GOOGLE_API_KEY;
    }
    return this._apiKey;
  }

  get genAI() {
    if (!this._genAI && this.apiKey) {
      this._genAI = new GoogleGenerativeAI(this.apiKey);
    }
    return this._genAI;
  }

  getModelName() {
    return process.env.GOOGLE_MODEL || 'gemini-2.0-flash';
  }

  /**
   * Generate training content using Gemini
   * @param {string} prompt - The training prompt
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    const requestContext = monitoringService.startRequest('gemini');

    try {
      const systemMessage = this.buildSystemMessage(context);
      const userMessage = this.buildUserMessage(prompt, context);
      const fullPrompt = `${systemMessage}\n\n${userMessage}`;

      logger.info('Gemini request', {
        model: this.getModelName(),
        promptLength: prompt.length,
        hasContext: !!context.documents
      });

      const model = this.genAI.getGenerativeModel({
        model: options.model || this.getModelName(),
      });

      const generationConfig = {
        temperature: options.temperature || 0.7,
        topP: options.topP || 1,
        topK: options.topK || 40,
        maxOutputTokens: options.maxTokens || this.maxTokens,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = await result.response;
      const text = response.text();

      const apiResponse = {
        content: text,
        model: this.getModelName(),
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: response.candidates?.[0]?.finishReason || 'stop',
      };

      monitoringService.recordSuccess(requestContext);

      logger.info('Gemini response received', {
        usage: apiResponse.usage,
        finishReason: apiResponse.finishReason
      });

      return apiResponse;
    } catch (error) {
      monitoringService.recordError(requestContext, error);

      logger.error('Gemini API error', {
        error: error.message,
        status: error.status
      });
      throw new Error(`Gemini generation failed: ${error.message}`);
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
${content}

Respond with only the JSON array, no additional text or markdown formatting.`;

      const model = this.genAI.getGenerativeModel({
        model: this.getModelName(),
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `You are an expert training content creator. ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        },
      });

      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response (remove markdown if present)
      let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(jsonText);
    } catch (error) {
      logger.error('Gemini quiz generation error', { error: error.message });
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
      const prompt = `You are a professional translator specializing in technical and training materials.
Translate the following content to ${targetLang}. Preserve all technical terms and safety information accurately.

Content to translate:
${content}`;

      const model = this.genAI.getGenerativeModel({
        model: this.getModelName(),
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: this.maxTokens,
        },
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini translation error', { error: error.message });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Analyze training data and provide insights
   * @param {object} trainingData - Training completion and performance data
   */
  async analyzeTrainingData(trainingData) {
    try {
      const prompt = `Analyze the following training data and provide actionable insights:

${JSON.stringify(trainingData, null, 2)}

Provide analysis on:
1. Overall performance trends
2. Completion rate patterns
3. Areas needing attention
4. Success factors
5. Recommended interventions

Format the response with clear sections and bullet points.`;

      const model = this.genAI.getGenerativeModel({
        model: this.getModelName(),
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `You are an expert in training analytics and workforce development. ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini analysis error', { error: error.message });
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate multimodal content (text + images)
   * Only works with gemini-pro-vision model
   * @param {string} prompt - The prompt
   * @param {string} imageData - Base64 encoded image data
   */
  async generateWithImage(prompt, imageData) {
    try {
      // Use gemini-2.0-flash which supports vision natively
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const imageParts = [{
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg',
        },
      }];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini vision error', { error: error.message });
      throw new Error(`Vision generation failed: ${error.message}`);
    }
  }

  /**
   * Build system message with RAG context
   */
  buildSystemMessage(context) {
    let systemMsg = `You are Gemini, the multilingual and multimodal AI powerhouse behind LineSmart - the revolutionary industrial training platform that's transforming global workplace safety through intelligent, accessible education.

🌍 LINESMART'S GLOBAL VISION: 
As Gemini, you bring unparalleled multilingual capabilities and cultural intelligence to LineSmart's mission. You're creating training that transcends language barriers and cultural differences to deliver consistent safety standards worldwide:
- Every worker, regardless of language or cultural background, receives training in their native language with cultural context
- Critical industries (Manufacturing, Food & Beverage, Pharmaceutical, Automotive, Aerospace, Chemical, Construction, Energy, Healthcare) maintain unified safety standards across global operations
- Regulatory compliance spans international standards: OSHA, ISO 45001, HACCP, FDA, GMP, SQF Food Safety, and regional equivalents
- Complex visual and textual content is seamlessly integrated for maximum comprehension

🚀 GEMINI'S MULTILINGUAL MASTERY:
1. **Cultural Safety Intelligence**: Adapt safety concepts to cultural contexts while maintaining universal safety standards
2. **Language Precision**: Deliver technically accurate content in multiple languages (EN, ES, FR, PT, DE, and beyond)
3. **Visual Integration**: Excel at describing and integrating visual safety elements, diagrams, and multimedia content
4. **Global Compliance**: Navigate international safety regulations and standards with cultural sensitivity
5. **Accessible Design**: Create inclusive content that works across diverse educational backgrounds and learning styles

🎯 CONTENT LOCALIZATION EXCELLENCE:
- Translate complex safety concepts while preserving technical accuracy
- Adapt examples and scenarios to local workplace cultures and practices
- Integrate visual learning elements that transcend language barriers
- Ensure compliance messaging aligns with both local and international standards
- Create content that's immediately applicable across diverse industrial environments
- Design training that respects cultural differences while maintaining safety universality

🌟 PLATFORM POTENTIAL: LineSmart, enhanced by Gemini's global intelligence, is positioned to become the universal language of industrial safety. You're not just creating training content - you're building bridges that connect workers worldwide through shared safety knowledge, regardless of their native language or cultural background.

Your multilingual expertise and cultural intelligence, combined with LineSmart's RAG capabilities and global industry reach, creates training experiences that are both locally relevant and universally effective. You're helping establish LineSmart as the definitive platform for international industrial safety education.

Remember: You are Gemini - be globally minded, culturally intelligent, linguistically precise, and committed to making safety knowledge accessible to every worker worldwide.`;

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
        monitoringService.updateProviderStatus('gemini', 'unavailable', { error: 'API key not configured' });
        return { status: 'unavailable', error: 'API key not configured' };
      }

      const model = this.genAI.getGenerativeModel({
        model: this.getModelName(),
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Health check' }] }],
        generationConfig: {
          maxOutputTokens: 10,
        },
      });

      await result.response;
      monitoringService.updateProviderStatus('gemini', 'healthy');
      return {
        status: 'healthy',
        model: this.getModelName()
      };
    } catch (error) {
      monitoringService.updateProviderStatus('gemini', 'unhealthy', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

export default new GeminiService();
