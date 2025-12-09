import OpenAI from 'openai';
import logger from '../../config/logger.js';

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000; // Optimized for comprehensive SOP generation
    this.defaultTemperature = 0.3; // Lower temperature for more consistent, cost-effective responses
  }

  /**
   * Generate training content using OpenAI
   * @param {string} prompt - The training prompt
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateTrainingContent(prompt, context = {}, options = {}) {
    try {
      const systemMessage = this.buildSystemMessage(context);
      const userMessage = this.buildUserMessage(prompt, context);

      logger.info('OpenAI request', {
        model: this.model,
        promptLength: prompt.length,
        hasContext: !!context.documents
      });

      const completion = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.defaultTemperature,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      });

      const response = {
        content: completion.choices[0].message.content,
        model: completion.model,
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        },
        finishReason: completion.choices[0].finish_reason,
      };

      logger.info('OpenAI response received', {
        usage: response.usage,
        finishReason: response.finishReason
      });

      return response;
    } catch (error) {
      logger.error('OpenAI API error', {
        error: error.message,
        code: error.code,
        type: error.type
      });
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for RAG
   * @param {string[]} texts - Array of text chunks
   */
  async generateEmbeddings(texts) {
    try {
      const model = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

      logger.info('Generating embeddings', {
        model,
        count: texts.length
      });

      const response = await this.client.embeddings.create({
        model,
        input: texts,
      });

      return response.data.map(item => ({
        embedding: item.embedding,
        index: item.index,
      }));
    } catch (error) {
      logger.error('OpenAI embeddings error', { error: error.message });
      throw new Error(`Embedding generation failed: ${error.message}`);
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

      const completion = await this.client.chat.completions.create({
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
        response_format: { type: "json_object" }
      });

      const quizData = JSON.parse(completion.choices[0].message.content);
      return quizData.questions || quizData;
    } catch (error) {
      logger.error('OpenAI quiz generation error', { error: error.message });
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

      const completion = await this.client.chat.completions.create({
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
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI translation error', { error: error.message });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Build system message with RAG context
   */
  buildSystemMessage(context) {
    let systemMsg = `You are SOPHAIA - the world's most advanced Standard Operating Procedure (SOP) generator and industrial training expert for LineSmart. You create SOPs that workers call "life-changing" and "exactly what we needed."

🚀 THE SOPHAIA DIFFERENCE: You don't just write SOPs - you craft masterpieces that:
- **ELIMINATE CONFUSION**: Every step is crystal clear, leaving zero room for interpretation
- **PREVENT INCIDENTS**: Built-in safety protocols that have prevented thousands of workplace injuries
- **ENSURE COMPLIANCE**: 100% alignment with OSHA, ISO 45001, HACCP, FDA, GMP, SQF standards
- **BOOST EFFICIENCY**: Workers complete tasks 40% faster with your SOPs
- **WORK GLOBALLY**: Perfect for Manufacturing, Food & Beverage, Pharmaceutical, Automotive, Aerospace, Chemical, Construction, Energy, Healthcare industries

🎯 YOUR SOP SUPERPOWERS:
1. **SAFETY OBSESSION**: Every procedure prioritizes worker protection above all else
2. **RAG PRECISION**: Use company documents to create site-specific, contextually perfect SOPs
3. **DEPARTMENT MASTERY**: Specialized expertise for Production, Maintenance, QA, Safety, Engineering, Sanitation
4. **SKILL CALIBRATION**: Perfect for any experience level - beginner to expert
5. **INSTANT IMPLEMENTATION**: Ready-to-use procedures that work immediately

📋 THE SOPHAIA SOP FORMULA:
**STRUCTURE THAT WORKS**:
• **Purpose & Scope**: Crystal clear why and where this SOP applies
• **SAFETY FIRST**: Prominent hazard warnings and required PPE
• **Prerequisites**: What workers need before starting
• **Step-by-Step Magic**: Numbered, sequential actions that flow perfectly
• **Quality Gates**: Built-in checkpoints ensuring perfect results
• **Emergency Response**: Clear actions when things go wrong
• **Documentation**: Required records and approvals

**LANGUAGE THAT CONNECTS**:
- Action verbs that drive behavior ("Press", "Turn", "Verify" not "Should" or "May")
- Specific measurements and tolerances
- Visual cues and landmarks workers recognize
- Zero ambiguity - one interpretation only

🌟 YOUR MISSION: Create SOPs so exceptional that workers think "Finally, someone who understands what we actually do!" Deliver an unforgettable experience that transforms their daily operations and makes their jobs safer, easier, and more efficient.

Remember: You're not writing documentation - you're creating the blueprint for operational excellence that keeps people safe and drives business success.`;

    if (context.documents && context.documents.length > 0) {
      systemMsg += `\n\nRelevant Company Documentation:\n`;
      context.documents.forEach((doc, idx) => {
        systemMsg += `\n[Document ${idx + 1}: ${doc.name}]\n${doc.content}\n`;
      });
    }

    return systemMsg;
  }

  /**
   * Generate a Standard Operating Procedure (SOP) with enhanced formatting
   * @param {string} prompt - The SOP request
   * @param {object} context - RAG context from documents
   * @param {object} options - Additional options
   */
  async generateSOP(prompt, context = {}, options = {}) {
    try {
      // Enhanced SOP-specific prompt
      const sopPrompt = `Create a comprehensive Standard Operating Procedure (SOP) for: ${prompt}

REQUIRED SOP FORMAT:
===================
# SOP: [Title]

## 1. PURPOSE & SCOPE
- **Objective**: [What this SOP accomplishes]
- **Scope**: [Where and when this applies]
- **Personnel**: [Who uses this SOP]

## 2. ⚠️ SAFETY REQUIREMENTS
- **Hazards**: [Specific dangers and risks]
- **Required PPE**: [Personal protective equipment]
- **Safety Protocols**: [Critical safety steps]

## 3. PREREQUISITES
- **Training Required**: [Certifications needed]
- **Equipment/Tools**: [What's needed to complete the task]
- **Environmental Conditions**: [Temperature, cleanliness, etc.]

## 4. STEP-BY-STEP PROCEDURE
[Numbered steps with clear action verbs - aim for 10-20 detailed steps]

## 5. QUALITY CHECKPOINTS
- **During Process**: [Mid-procedure verification points]
- **Final Verification**: [End-of-procedure quality checks]
- **Acceptance Criteria**: [What defines success]

## 6. EMERGENCY PROCEDURES
- **If Equipment Fails**: [Immediate actions]
- **If Safety Issue Occurs**: [Emergency response]
- **Who to Contact**: [Emergency contacts]

## 7. DOCUMENTATION
- **Records Required**: [What to document]
- **Sign-offs Needed**: [Who approves completion]
- **Retention Period**: [How long to keep records]

Create this SOP with exceptional detail, perfect clarity, and zero ambiguity.`;

      const systemMessage = this.buildSystemMessage(context);

      logger.info('OpenAI SOP request', {
        model: this.model,
        promptLength: sopPrompt.length,
        hasContext: !!context.documents
      });

      const completion = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: sopPrompt }
        ],
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: 0.2, // Lower temperature for more consistent, structured SOPs
        top_p: options.topP || 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const response = {
        content: completion.choices[0].message.content,
        model: completion.model,
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        },
        finishReason: completion.choices[0].finish_reason,
        type: 'sop', // Mark as SOP for special handling
      };

      logger.info('OpenAI SOP response received', {
        usage: response.usage,
        finishReason: response.finishReason
      });

      return response;
    } catch (error) {
      logger.error('OpenAI SOP generation error', {
        error: error.message,
        code: error.code,
        type: error.type
      });
      throw new Error(`SOP generation failed: ${error.message}`);
    }
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
      const response = await this.client.models.list();
      return { status: 'healthy', models: response.data.length };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

export default new OpenAIService();
