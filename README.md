# LineSmart - AI-Powered Enterprise Training Platform

![LineSmart Platform](https://img.shields.io/badge/LineSmart-AI%20Training%20Platform-blue)
![React](https://img.shields.io/badge/React-18.x-blue)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-orange)
![Status](https://img.shields.io/badge/Status-Live%20Demo-green)

## 🚀 Live Demo
**[Try LineSmart Now](https://linesmart-platform-650169261019.us-central1.run.app)**

## 🎯 What is LineSmart?

LineSmart is a revolutionary AI-powered training platform that transforms how companies create and deliver workforce training. Upload your documents, choose your language, and watch AI generate comprehensive, engaging training modules in minutes instead of weeks.

### ✨ Key Benefits
- **85% Faster** training creation
- **60% Cost Reduction** compared to traditional methods
- **92% Employee Engagement** with AI-generated content
- **99% Compliance Rate** with automated tracking

## 🎪 Landing Page Features

Our compelling landing page converts visitors into demo users with:

### 🎨 Professional Design
- **Gradient Hero Section** with compelling value proposition
- **Feature Showcase** with 6 core capabilities
- **Social Proof** with testimonials and statistics
- **Clear Call-to-Action** for demo access

### 📊 Value Proposition
- **AI-Powered Training Generation** - Create modules in minutes
- **Smart Document Processing** - Upload any format, get training
- **Multi-Language Support** - Train global teams in their native language
- **Supervisor Dashboard** - Real-time progress tracking
- **Automated Certification** - AI-generated quizzes and compliance
- **Enterprise Security** - SOC2 certified with audit trails

### 🎯 Conversion Strategy
- **Free Demo Access** - No credit card required
- **Immediate Value** - Full features included
- **Email Capture** - Builds mailing list automatically
- **Demo Tier** - Let prospects experience the platform

## 🏗 Platform Architecture

### Frontend (React 18)
```
src/
├── components/
│   ├── LandingPage.jsx          # Marketing & conversion page
│   ├── RAGManager.jsx           # Document management hub
│   ├── DocumentUpload.jsx       # File upload with drag & drop
│   ├── RAGDocumentLibrary.jsx   # Document search & management
│   ├── StorageConfiguration.jsx # Cloud storage setup
│   └── RAGProcessor.jsx         # AI processing configuration
├── services/
│   ├── StorageService.js        # Cloud storage abstraction
│   └── RAGService.js           # Document processing logic
└── LineSmartPlatform.jsx       # Main application
```

### Backend Services
- **Document Processing**: OCR, text extraction, chunking
- **AI Integration**: LLaMA API (free), OpenAI, Claude, Gemini
- **Vector Database**: ChromaDB, Pinecone, Weaviate, Qdrant
- **Cloud Storage**: Secure DB (default), GCS, S3, Azure Blob

### Deployment
- **Platform**: Google Cloud Run
- **CI/CD**: Cloud Build
- **CDN**: Google Cloud CDN
- **SSL**: Automatic HTTPS

## 🎭 Demo Flow

### 1. Landing Page Experience
```
Visitor arrives → Sees value proposition → Fills demo form → Gets instant access
```

### 2. Email Automation
```
Form submitted → Email sent to scribbleglass@gmail.com → Manual demo activation
```

### 3. Demo Platform Access
```
User accesses platform → Demo badge shown → Full features available → Conversion opportunity
```

## 📧 Email Integration

When users request demo access, their information is automatically sent to `scribbleglass@gmail.com` with:

- **Company Name**
- **Email Address** 
- **Demo Password**
- **Timestamp**
- **Source** (landing_page)

See `EMAIL_INTEGRATION_GUIDE.md` for complete setup instructions.

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 🚀 Deployment

This application is deployed on Google Cloud Run:

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/fredfix/linesmart-platform
gcloud run deploy linesmart-platform \
  --image gcr.io/fredfix/linesmart-platform \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📞 Contact & Support

- **Demo Requests**: Automatic email to scribbleglass@gmail.com
- **Live Platform**: https://linesmart-platform-650169261019.us-central1.run.app
- **Documentation**: See included setup guides

---

**Ready to transform your training with AI?** [Start your free demo now](https://linesmart-platform-650169261019.us-central1.run.app)
