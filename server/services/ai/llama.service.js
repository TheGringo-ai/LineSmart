import axios from 'axios';
import logger from '../../config/logger.js';

class LlamaService {
  constructor() {
    this.replicateApiKey = process.env.REPLICATE_API_KEY;
    this.ollamaBaseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.LLAMA_MODEL || 'meta/llama-2-70b-chat';
    this.useOllama = !this.replicateApiKey; // Use Ollama if no Replicate key
    this.maxTokens = 4096;
  }

  /**
   * Generate training content using Llama
   * @param {string} prompt - The training prompt
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    try {
      const systemMessage = this.buildSystemMessage(context);
      const userMessage = this.buildUserMessage(prompt, context);

      logger.info('Llama request', {
        provider: this.useOllama ? 'Ollama' : 'Replicate',
        model: this.model,
        promptLength: prompt.length,
        hasContext: !!context.documents
      });

      let response;
      if (this.useOllama) {
        response = await this.generateWithOllama(systemMessage, userMessage, options);
      } else {
        response = await this.generateWithReplicate(systemMessage, userMessage, options);
      }

      logger.info('Llama response received', {
        provider: this.useOllama ? 'Ollama' : 'Replicate',
        contentLength: response.content.length
      });

      return response;
    } catch (error) {
      logger.error('Llama API error', {
        error: error.message,
        provider: this.useOllama ? 'Ollama' : 'Replicate'
      });
      throw new Error(`Llama generation failed: ${error.message}`);
    }
  }

  /**
   * Generate using Ollama (local)
   */
  async generateWithOllama(systemMessage, userMessage, options = {}) {
    try {
      const response = await axios.post(
        `${this.ollamaBaseURL}/api/chat`,
        {
          model: options.model || 'llama2',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.topP || 1,
            num_predict: options.maxTokens || this.maxTokens,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout for local generation
        }
      );

      return {
        content: response.data.message.content,
        model: response.data.model,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
        },
        finishReason: 'stop',
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Start it with: ollama serve');
      }
      throw error;
    }
  }

  /**
   * Generate using Replicate (cloud)
   */
  async generateWithReplicate(systemMessage, userMessage, options = {}) {
    try {
      // Combine system and user messages for Llama format
      const fullPrompt = `<s>[INST] <<SYS>>\n${systemMessage}\n<</SYS>>\n\n${userMessage} [/INST]`;

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: this.getModelVersion(options.model || this.model),
          input: {
            prompt: fullPrompt,
            max_new_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 1,
            repetition_penalty: 1.15,
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Poll for completion
      const prediction = await this.pollReplicate(response.data.urls.get);

      const content = Array.isArray(prediction.output)
        ? prediction.output.join('')
        : prediction.output;

      return {
        content,
        model: this.model,
        usage: {
          promptTokens: 0, // Replicate doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0,
        },
        finishReason: prediction.status === 'succeeded' ? 'stop' : 'error',
      };
    } catch (error) {
      throw new Error(`Replicate generation failed: ${error.message}`);
    }
  }

  /**
   * Poll Replicate for prediction completion
   */
  async pollReplicate(getUrl, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.get(getUrl, {
        headers: {
          'Authorization': `Token ${this.replicateApiKey}`,
        },
      });

      if (response.data.status === 'succeeded') {
        return response.data;
      }

      if (response.data.status === 'failed') {
        throw new Error(response.data.error || 'Prediction failed');
      }
    }

    throw new Error('Prediction timeout');
  }

  /**
   * Get Replicate model version
   */
  getModelVersion(model) {
    const versions = {
      'meta/llama-2-70b-chat': '02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
      'meta/llama-2-13b-chat': 'f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d',
      'meta/llama-2-7b-chat': '13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0',
    };

    return versions[model] || versions['meta/llama-2-70b-chat'];
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

Respond only with the JSON array, no additional text.`;

      const systemMsg = 'You are an expert training content creator. Generate clear, relevant quiz questions in JSON format.';

      let response;
      if (this.useOllama) {
        response = await this.generateWithOllama(systemMsg, prompt, { temperature: 0.8 });
      } else {
        response = await this.generateWithReplicate(systemMsg, prompt, { temperature: 0.8 });
      }

      // Extract JSON from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response.content);
    } catch (error) {
      logger.error('Llama quiz generation error', { error: error.message });
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
      const systemMsg = 'You are a professional translator specializing in technical and training materials. Translate accurately while preserving technical terms and safety information.';
      const userMsg = `Translate the following content to ${targetLang}:\n\n${content}`;

      let response;
      if (this.useOllama) {
        response = await this.generateWithOllama(systemMsg, userMsg, { temperature: 0.3 });
      } else {
        response = await this.generateWithReplicate(systemMsg, userMsg, { temperature: 0.3 });
      }

      return response.content;
    } catch (error) {
      logger.error('Llama translation error', { error: error.message });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Build system message with RAG context
   */
  buildSystemMessage(context) {
    let systemMsg = `You are Llama, the cost-effective and privacy-focused AI driving LineSmart - the revolutionary industrial training platform that democratizes world-class safety education for organizations of all sizes.

💰 LINESMART'S ACCESSIBLE VISION: 
As Llama, you represent LineSmart's commitment to making premium industrial safety training accessible to everyone. You're proving that exceptional training doesn't require massive budgets, while maintaining the highest safety standards:
- Every organization, from small manufacturers to global enterprises, can access world-class safety training
- Critical industries (Manufacturing, Food & Beverage, Pharmaceutical, Automotive, Aerospace, Chemical, Construction, Energy, Healthcare) benefit from cost-effective, high-quality training solutions
- Local deployment options ensure data privacy and compliance with regional regulations
- Open-source foundations enable customization for specific industry needs and compliance requirements

🔓 LLAMA'S OPEN INTELLIGENCE:
1. **Cost-Effective Excellence**: Deliver premium training quality at a fraction of traditional costs
2. **Privacy-First Design**: Enable on-premises deployment for organizations with strict data sovereignty requirements
3. **Customizable Foundation**: Adapt to specific industry vocabularies, procedures, and cultural contexts
4. **Scalable Solutions**: From small workshops to global manufacturing networks - training that grows with organizations
5. **Community-Driven Innovation**: Leverage open-source principles to continuously improve safety training methodologies

⚙️ DEPLOYMENT FLEXIBILITY:
- Support both cloud-based and local deployment models for maximum flexibility
- Ensure consistent training quality across different deployment environments
- Optimize for resource-efficient operation without compromising content quality
- Enable offline training capabilities for remote or high-security environments
- Provide seamless integration with existing industrial training infrastructures

🌱 PLATFORM DEMOCRATIZATION: LineSmart, powered by Llama's accessible intelligence, is breaking down barriers to exceptional industrial safety training. You're not just creating training content - you're democratizing access to life-saving knowledge, ensuring that worker safety doesn't depend on organizational budget size.

Your efficiency and adaptability, combined with LineSmart's RAG capabilities and industry expertise, creates training experiences that are both affordable and exceptionally effective. You're helping establish LineSmart as the platform that makes world-class industrial safety education accessible to every organization, regardless of size or budget.

Remember: You are Llama - be efficient, accessible, privacy-conscious, and committed to proving that exceptional safety training should be available to every worker, everywhere.`;

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
      if (this.useOllama) {
        const response = await axios.get(`${this.ollamaBaseURL}/api/tags`);
        return {
          status: 'healthy',
          provider: 'Ollama',
          models: response.data.models?.length || 0
        };
      } else {
        // Simple check for Replicate
        return {
          status: 'healthy',
          provider: 'Replicate',
          apiKeyConfigured: !!this.replicateApiKey
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.useOllama ? 'Ollama' : 'Replicate',
        error: error.message
      };
    }
  }
}

export default new LlamaService();
