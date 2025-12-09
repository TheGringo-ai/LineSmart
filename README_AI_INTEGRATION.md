# LineSmart AI Integration Guide

This document explains how to use the AI integrations in LineSmart platform.

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 2. Configure API Keys

Edit `server/.env` and add your API keys:

```env
# Choose at least one provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
XAI_API_KEY=...
REPLICATE_API_KEY=...

# Set default provider
DEFAULT_AI_PROVIDER=openai
```

### 3. Frontend Setup

Update `REACT_APP_API_URL` in your frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

---

## 🤖 Supported AI Providers

### OpenAI (GPT-4, GPT-3.5)
- **Best for**: General training content, embeddings
- **Setup**: Get API key from [platform.openai.com](https://platform.openai.com)
- **Cost**: Pay-per-use (~$0.03/1K tokens for GPT-4)

### Claude (Anthropic)
- **Best for**: Safety content, analysis, long-form content
- **Setup**: Get API key from [console.anthropic.com](https://console.anthropic.com)
- **Cost**: Pay-per-use (~$0.015/1K tokens for Sonnet)

### Gemini (Google)
- **Best for**: Multilingual translation, multimodal content
- **Setup**: Get API key from [ai.google.dev](https://ai.google.dev)
- **Cost**: Free tier available, then pay-per-use

### Grok (xAI)
- **Best for**: Fast responses, engaging content
- **Setup**: Get API key from [x.ai](https://x.ai)
- **Cost**: Pay-per-use

### Llama (Meta)
- **Best for**: Cost-effective, privacy (local deployment)
- **Setup Options**:
  - **Local (Free)**: Install [Ollama](https://ollama.ai) → `ollama pull llama2`
  - **Cloud**: Get API key from [replicate.com](https://replicate.com)

---

## 📚 API Endpoints

### Generate Training Content
```javascript
POST /api/ai/generate-training

{
  "prompt": "Create a training module about forklift safety",
  "context": {
    "employee": {
      "department": "Warehouse",
      "position": "Operator",
      "language": "en",
      "experienceLevel": "beginner"
    },
    "documents": [
      {
        "name": "safety_manual.pdf",
        "content": "..."
      }
    ]
  },
  "options": {
    "provider": "claude",  // optional, uses default if not specified
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

### Generate Quiz
```javascript
POST /api/ai/generate-quiz

{
  "content": "Training content here...",
  "questionCount": 5,
  "options": {
    "provider": "openai"
  }
}
```

### Translate Content
```javascript
POST /api/ai/translate

{
  "content": "Safety procedures...",
  "targetLanguage": "es",  // Spanish
  "options": {
    "provider": "gemini"  // Recommended for translation
  }
}
```

### Analyze Employee Performance
```javascript
POST /api/ai/analyze-performance

{
  "employeeData": {
    "id": 1,
    "name": "John Smith",
    "trainingHistory": [...],
    "completedTrainings": 8,
    "totalTrainings": 12
  },
  "options": {
    "provider": "claude"  // Recommended for analysis
  }
}
```

### Generate Safety Content
```javascript
POST /api/ai/safety-content

{
  "scenario": "Lockout/Tagout procedures for hydraulic press maintenance",
  "context": {
    "documents": [...]
  },
  "options": {
    "provider": "claude"  // Recommended for safety
  }
}
```

### Health Check
```javascript
GET /api/ai/health
// Returns status of all configured providers

GET /api/ai/health/openai
// Check specific provider
```

### Get Providers
```javascript
GET /api/ai/providers
// Returns list of available providers and their capabilities
```

### Get Recommendation
```javascript
GET /api/ai/recommend/safety
// Returns recommended provider for task type
// Task types: trainingContent, quiz, translation, safety, analysis, embeddings
```

---

## 💻 Frontend Usage

### Example: Generate Training Content

```javascript
import AIService from './services/AIService';

const generateTraining = async () => {
  try {
    const result = await AIService.generateTrainingContent(
      "Create a safety training module about electrical hazards",
      {
        employee: {
          department: "Maintenance",
          position: "Electrician",
          language: "en",
          experienceLevel: "intermediate"
        }
      },
      {
        provider: "claude",  // optional
        temperature: 0.7
      }
    );

    console.log(result.content);
    console.log(`Used ${result.usage.totalTokens} tokens`);
  } catch (error) {
    console.error('Failed to generate training:', error);
  }
};
```

### Example: Generate Quiz

```javascript
const generateQuiz = async (trainingContent) => {
  try {
    const questions = await AIService.generateQuiz(
      trainingContent,
      5,  // number of questions
      { provider: "openai" }
    );

    questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.question}`);
      console.log(`Answer: ${q.options[q.correctAnswer]}`);
    });
  } catch (error) {
    console.error('Failed to generate quiz:', error);
  }
};
```

### Example: Translate Content

```javascript
const translateTraining = async (content, targetLang) => {
  try {
    const translated = await AIService.translateContent(
      content,
      targetLang,
      { provider: "gemini" }
    );

    console.log('Translated:', translated);
  } catch (error) {
    console.error('Translation failed:', error);
  }
};
```

### Example: Check Provider Health

```javascript
const checkHealth = async () => {
  try {
    const health = await AIService.healthCheck();

    Object.entries(health).forEach(([provider, status]) => {
      console.log(`${provider}: ${status.status}`);
    });
  } catch (error) {
    console.error('Health check failed:', error);
  }
};
```

---

## 🎯 Provider Recommendations

| Task | Best Provider | Fallback | Notes |
|------|---------------|----------|-------|
| Training Content | Claude | OpenAI | Claude excels at long-form educational content |
| Quiz Generation | OpenAI | Claude | Better at structured JSON output |
| Translation | Gemini | OpenAI | Superior multilingual capabilities |
| Safety Content | Claude | OpenAI | Most thorough and safety-conscious |
| Performance Analysis | Claude | Grok | Better analytical depth |
| Embeddings | OpenAI | - | Currently only OpenAI supports embeddings |
| Speed | Grok | Gemini | Fastest response times |
| Cost | Llama (local) | Gemini | Free with Ollama, or Gemini free tier |

---

## 🔒 Security Best Practices

1. **Never commit API keys** - Use `.env` files and add to `.gitignore`
2. **Use rate limiting** - Already configured in the backend
3. **Validate inputs** - Always sanitize user inputs
4. **Monitor usage** - Track API costs through provider dashboards
5. **Rotate keys** - Regularly rotate API keys
6. **Use HTTPS** - Always use HTTPS in production

---

## 💰 Cost Optimization

1. **Choose the right model**:
   - Development: Use Llama (local/free) or Gemini (free tier)
   - Production: Claude Haiku (fast/cheap) or GPT-3.5 Turbo

2. **Cache responses**: Cache common training content
3. **Use lower temperatures**: For predictable outputs (0.3-0.5)
4. **Limit max tokens**: Set appropriate limits
5. **Batch operations**: Process multiple items together

---

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file has the correct key
- Restart the server after updating `.env`

### "Rate limit exceeded"
- Wait before retrying
- Upgrade API plan with provider
- Use different provider as fallback

### "Ollama connection refused"
- Ensure Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL in `.env`
- Pull the model: `ollama pull llama2`

### "Context length exceeded"
- Reduce chunk size in RAG settings
- Use shorter prompts
- Increase maxTokens limit

---

## 📊 Monitoring & Logging

Check server logs for AI operations:

```bash
# All logs
tail -f server/logs/combined.log

# Errors only
tail -f server/logs/error.log
```

---

## 🚀 Production Deployment

1. **Set environment variables** in your hosting platform
2. **Enable HTTPS** for API endpoints
3. **Configure CORS** for your production frontend URL
4. **Set up monitoring** (e.g., Sentry, DataDog)
5. **Implement caching** (Redis recommended)
6. **Use load balancing** for high traffic

---

## 📖 Further Reading

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Google Gemini Docs](https://ai.google.dev/docs)
- [xAI Grok Docs](https://docs.x.ai)
- [Ollama Documentation](https://ollama.ai)

---

## 🆘 Support

For issues or questions:
1. Check server logs
2. Verify API key configuration
3. Test with `/api/ai/health` endpoint
4. Check provider status pages
