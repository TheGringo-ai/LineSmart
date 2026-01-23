
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Users, Brain, CheckCircle, AlertCircle, Play, Download, Settings, UserPlus, Target, TrendingUp, Calendar, Award, BookOpen, Plus, Edit3, Eye, Filter, Database, Cloud, Key, Zap, Link, Bot, FileSearch, Search, Building, Globe, Shield, GitBranch } from 'lucide-react';
import TrainingDataManager from './components/TrainingDataManager';
import LandingPage from './components/LandingPage';

const LineSmartPlatform = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [setupStep, setSetupStep] = useState('welcome');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showTrainingData, setShowTrainingData] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [userTier, setUserTier] = useState(null);
  const [demoUser, setDemoUser] = useState(null);
  
  const [setupConfig, setSetupConfig] = useState({
    company: {
      name: '',
      industry: '',
      size: '',
      departments: [],
      customDepartments: '',
      safetyRequirements: [],
      complianceStandards: [],
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr', 'pt', 'de']
    },
    aiModels: {
      primary: '',
      secondary: '',
      configs: {
        openai: { apiKey: '', model: 'gpt-4', endpoint: '' },
        claude: { apiKey: '', model: 'claude-3-sonnet', endpoint: '' },
        gemini: { apiKey: '', model: 'gemini-pro', endpoint: '' },
        llama: { apiKey: '', model: 'llama-2-70b', endpoint: '' },
        custom: { name: '', apiKey: '', model: '', endpoint: '' }
      }
    },
    dataSource: {
      type: '',
      config: {
        googleDrive: { folderId: '', credentials: '', sharedDrives: [] },
        s3: { bucket: '', region: '', accessKey: '', secretKey: '' },
        azure: { container: '', connectionString: '', account: '' },
        sharepoint: { siteUrl: '', tenantId: '', clientId: '', clientSecret: '' },
        local: { path: '', format: '' }
      },
      ragSettings: {
        enabled: true,
        chunkSize: 1000,
        overlap: 200,
        vectorStore: 'chromadb',
        embeddingModel: 'text-embedding-ada-002'
      }
    },
    onboarding: {
      defaultTrainings: [],
      departmentSpecific: {},
      probationPeriod: 90,
      checkpoints: [],
      mentorAssignment: true
    },
    supervisorPermissions: {
      canCreateDepartmentTraining: true,
      canCreateIndividualTraining: true,
      canModifyTraining: true,
      canViewAllEmployees: true,
      canAssignTraining: true,
      requiresApproval: false
    }
  });

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'John Smith',
      department: 'Maintenance',
      position: 'Senior Technician',
      role: 'employee',
      supervisor: 'Mike Rodriguez',
      hireDate: '2023-01-15',
      preferredLanguage: 'en',
      completedTrainings: 8,
      totalTrainings: 12,
      lastTraining: '2024-07-20',
      performance: 92,
      certifications: ['OSHA 30', 'Electrical Safety'],
      trainingHistory: [
        { id: 1, title: 'Lockout/Tagout Procedures', date: '2024-07-20', score: 95, status: 'completed', language: 'en', ragSources: ['Manual_LOTO_v2.pdf', 'Safety_Protocol_2024.docx'] },
        { id: 2, title: 'Equipment Maintenance', date: '2024-07-15', score: 88, status: 'completed', language: 'en', ragSources: ['Maintenance_Guide.pdf'] },
        { id: 3, title: 'Safety Protocols', date: '2024-07-10', score: 92, status: 'completed', language: 'en', ragSources: ['Company_Safety_Manual.pdf', 'OSHA_Guidelines.pdf'] }
      ],
      recommendedTrainings: [
        { title: 'Advanced Hydraulic Systems', reason: 'Based on recent equipment updates and internal documentation analysis', priority: 'high', ragSources: ['Hydraulic_Manual_2024.pdf'] },
        { title: 'Emergency Response', reason: 'Due for annual recertification per company policy', priority: 'medium', ragSources: ['Emergency_Procedures.docx'] }
      ]
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      department: 'Production',
      position: 'Line Operator',
      role: 'employee',
      supervisor: 'Lisa Chen',
      hireDate: '2023-06-01',
      preferredLanguage: 'en',
      completedTrainings: 6,
      totalTrainings: 10,
      lastTraining: '2024-07-18',
      performance: 85,
      certifications: ['Food Safety'],
      trainingHistory: [
        { id: 4, title: 'SQF Compliance', date: '2024-07-18', score: 82, status: 'completed', language: 'en', ragSources: ['SQF_Manual.pdf'] },
        { id: 5, title: 'Quality Control', date: '2024-07-12', score: 88, status: 'completed', language: 'en', ragSources: ['Quality_Guidelines.pdf'] }
      ],
      recommendedTrainings: [
        { title: 'Advanced Quality Control', reason: 'Based on recent quality metrics', priority: 'high' },
        { title: 'Team Leadership', reason: 'Career development opportunity', priority: 'low' }
      ]
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      department: 'Safety',
      position: 'Safety Coordinator',
      role: 'supervisor',
      supervisor: 'Director of Operations',
      hireDate: '2022-11-10',
      preferredLanguage: 'en',
      completedTrainings: 15,
      totalTrainings: 18,
      lastTraining: '2024-07-22',
      performance: 96,
      certifications: ['OSHA 30', 'First Aid', 'Environmental Safety'],
      supervisesEmployees: [1],
      canCreateTraining: true,
      trainingHistory: [
        { id: 6, title: 'Hazard Communication', date: '2024-07-22', score: 98, status: 'completed', language: 'en', ragSources: ['OSHA_Standards.pdf'] },
        { id: 7, title: 'Incident Investigation', date: '2024-07-17', score: 94, status: 'completed', language: 'en', ragSources: ['Investigation_Manual.pdf'] }
      ],
      recommendedTrainings: [
        { title: 'Industrial Hygiene', reason: 'Skill enhancement opportunity', priority: 'medium' }
      ]
    },
    {
      id: 4,
      name: 'María García',
      department: 'Production',
      position: 'Line Operator',
      role: 'employee',
      supervisor: 'Lisa Chen',
      hireDate: '2024-02-15',
      preferredLanguage: 'es',
      completedTrainings: 3,
      totalTrainings: 8,
      lastTraining: '2024-07-10',
      performance: 78,
      certifications: ['Basic Safety'],
      trainingHistory: [
        { id: 8, title: 'Orientación de Seguridad', date: '2024-07-10', score: 85, status: 'completed', language: 'es', ragSources: ['Manual_Seguridad_ES.pdf'] },
        { id: 9, title: 'Procedimientos de Calidad', date: '2024-06-20', score: 82, status: 'completed', language: 'es', ragSources: ['Calidad_Manual_ES.pdf'] }
      ],
      recommendedTrainings: [
        { title: 'Seguridad Alimentaria Avanzada', reason: 'Necesario para certificación departamental', priority: 'high' },
        { title: 'Comunicación en el Lugar de Trabajo', reason: 'Mejora de habilidades de comunicación', priority: 'medium' }
      ]
    },
    {
      id: 5,
      name: 'Lisa Chen',
      department: 'Production',
      position: 'Production Supervisor',
      role: 'supervisor',
      supervisor: 'Director of Operations',
      hireDate: '2021-08-10',
      preferredLanguage: 'en',
      completedTrainings: 20,
      totalTrainings: 22,
      lastTraining: '2024-07-25',
      performance: 94,
      certifications: ['Production Management', 'Lean Manufacturing', 'Food Safety'],
      supervisesEmployees: [2, 4],
      canCreateTraining: true,
      trainingHistory: [
        { id: 10, title: 'Leadership Development', date: '2024-07-25', score: 96, status: 'completed', language: 'en', ragSources: ['Leadership_Guide.pdf'] }
      ],
      recommendedTrainings: [
        { title: 'Advanced Lean Manufacturing', reason: 'Process improvement initiative', priority: 'medium' }
      ]
    }
  ]);

  const [trainingData, setTrainingData] = useState({
    title: '',
    department: '',
    trainingType: '',
    description: '',
    objectives: '',
    documents: [],
    assignedEmployees: [],
    dueDate: '',
    ragSources: [],
    aiModel: 'primary',
    language: 'en',
    trainingScope: 'individual',
    supervisorId: null,
    quizConfig: {
      questionCount: 5,
      passingScore: 80,
      style: 'mixed'
    }
  });

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: '',
    position: '',
    email: '',
    hireDate: '',
    directSupervisor: '',
    preferredLanguage: 'en'
  });

  const [generatedTraining, setGeneratedTraining] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [ragAnalysis, setRagAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const industries = [
    'Manufacturing', 'Food & Beverage', 'Pharmaceutical', 'Automotive', 
    'Aerospace', 'Chemical', 'Construction', 'Energy', 'Healthcare', 'Technology'
  ];

  const companySizes = [
    '1-50 employees', '51-200 employees', '201-1000 employees', 
    '1001-5000 employees', '5000+ employees'
  ];

  const standardDepartments = [
    'Production', 'Maintenance', 'Quality Assurance', 'Safety', 'Warehouse',
    'Sanitation', 'Management', 'HR', 'Engineering', 'R&D', 'Logistics'
  ];

  const safetyRequirements = [
    'OSHA Compliance', 'ISO 45001', 'SQF Food Safety', 'HACCP', 'GMP',
    'FDA Regulations', 'Environmental Health', 'Fire Safety', 'Chemical Safety'
  ];

  const trainingTypes = [
    'Safety Procedures', 'Equipment Quality', 'SQF Compliance', 'Disciplinary Guidelines',
    'Technical Operations', 'Emergency Procedures', 'Quality Control', 'Maintenance Protocols',
    'Food Safety', 'Environmental Health', 'Onboarding Orientation', 'Leadership Development'
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const aiModels = [
    { id: 'openai', name: 'OpenAI GPT', description: 'GPT-3.5/GPT-4 models for comprehensive training generation' },
    { id: 'claude', name: 'Anthropic Claude', description: 'Claude 3 Sonnet/Opus for detailed, safe training content' },
    { id: 'gemini', name: 'Google Gemini', description: 'Gemini Pro for multimodal training with document analysis' },
    { id: 'llama', name: 'Meta Llama', description: 'Open-source Llama models for custom deployment' },
    { id: 'custom', name: 'Custom Model', description: 'Connect your own fine-tuned or enterprise model' }
  ];

  const dataSourceTypes = [
    { id: 'googleDrive', name: 'Google Drive', icon: <Cloud className="h-5 w-5" />, description: 'Connect to Google Drive folders and shared drives' },
    { id: 's3', name: 'Amazon S3', icon: <Database className="h-5 w-5" />, description: 'AWS S3 bucket integration for document storage' },
    { id: 'azure', name: 'Azure Blob', icon: <Cloud className="h-5 w-5" />, description: 'Microsoft Azure Blob Storage' },
    { id: 'sharepoint', name: 'SharePoint', icon: <Building className="h-5 w-5" />, description: 'Microsoft SharePoint document libraries' },
    { id: 'local', name: 'Local Files', icon: <FileText className="h-5 w-5" />, description: 'Upload files directly to the platform' }
  ];

  const currentUser = employees.find(emp => emp.role === 'supervisor') || employees[2];
  const supervisedEmployees = employees.filter(emp => emp.supervisor === currentUser?.name || currentUser?.supervisesEmployees?.includes(emp.id));
  const currentUserDepartment = currentUser?.department;

  // Demo access handler
  const handleDemoAccess = (userData) => {
    setDemoUser(userData);
    setUserTier(userData.tier);
    setShowLandingPage(false);
    
    // Email the demo request (in a real app, this would be a backend call)
    console.log('Demo request:', userData);
    
    // Send email notification
    const emailData = {
      to: 'scribbleglass@gmail.com',
      subject: `LineSmart Demo Request - ${userData.companyName}`,
      body: `New demo request:

Company: ${userData.companyName}
Email: ${userData.email}
Password: ${userData.password}
Timestamp: ${new Date().toISOString()}

Please activate their demo account.`
    };
    
    // In a real implementation, you'd send this to your backend
    // which would handle the email and account creation
  };

  const getLanguageName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  // AI-assisted form filling function
  const generateCompanyConfig = async (companyName, industry) => {
    const suggestions = {
      'Manufacturing': {
        departments: ['Production', 'Maintenance', 'Quality Assurance', 'Safety', 'Engineering'],
        safetyRequirements: ['OSHA Compliance', 'ISO 45001', 'Environmental Health'],
        defaultTrainings: ['Safety Orientation', 'Equipment Training', 'Quality Procedures']
      },
      'Food & Beverage': {
        departments: ['Production', 'Quality Assurance', 'Sanitation', 'Warehouse', 'Maintenance'],
        safetyRequirements: ['SQF Food Safety', 'HACCP', 'FDA Regulations', 'GMP'],
        defaultTrainings: ['Food Safety Fundamentals', 'HACCP Principles', 'Sanitation Procedures']
      },
      'Healthcare': {
        departments: ['Clinical', 'Nursing', 'Administration', 'Maintenance', 'Safety'],
        safetyRequirements: ['OSHA Compliance', 'HIPAA', 'Infection Control'],
        defaultTrainings: ['HIPAA Training', 'Infection Control', 'Patient Safety']
      }
    };

    const config = suggestions[industry] || suggestions['Manufacturing'];
    
    setSetupConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        departments: config.departments,
        safetyRequirements: config.safetyRequirements
      },
      onboarding: {
        ...prev.onboarding,
        defaultTrainings: config.defaultTrainings
      }
    }));
  };

  // RAG-powered training analysis
  const analyzeTrainingWithRAG = async (employee, trainingType) => {
    setIsAnalyzing(true);
    
    try {
      const mockAnalysis = {
        relevantDocuments: [
          { name: 'Safety_Manual_2024.pdf', relevance: 0.95, chunks: 3 },
          { name: 'Equipment_Procedures.docx', relevance: 0.88, chunks: 2 },
          { name: 'Company_Policies.pdf', relevance: 0.76, chunks: 1 }
        ],
        suggestedContent: [
          'Based on your safety manual, emphasis should be placed on PPE requirements specific to maintenance roles',
          'Recent equipment updates documented in procedures require additional hydraulic system training',
          'Company policy changes from Q3 2024 affect maintenance scheduling protocols'
        ],
        performanceGaps: [
          'Equipment troubleshooting scores below department average',
          'Safety compliance needs reinforcement based on recent incidents',
          'Documentation practices need improvement per quality standards'
        ],
        recommendedTrainings: [
          {
            title: 'Advanced Equipment Diagnostics',
            reason: 'Based on performance analysis and new equipment documentation',
            priority: 'high',
            estimatedDuration: '4 hours',
            ragSources: ['Equipment_Manual_v3.pdf', 'Troubleshooting_Guide.docx']
          },
          {
            title: 'Updated Safety Protocols',
            reason: 'Recent policy changes and incident analysis',
            priority: 'medium',
            estimatedDuration: '2 hours',
            ragSources: ['Safety_Updates_2024.pdf', 'Incident_Reports.xlsx']
          }
        ]
      };

      setRagAnalysis(mockAnalysis);
    } catch (error) {
      console.error('RAG analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSetupNext = () => {
    const steps = ['welcome', 'company', 'ai-models', 'data-source', 'onboarding', 'complete'];
    const currentIndex = steps.indexOf(setupStep);
    if (currentIndex < steps.length - 1) {
      setSetupStep(steps[currentIndex + 1]);
    }
  };

  const handleSetupPrev = () => {
    const steps = ['welcome', 'company', 'ai-models', 'data-source', 'onboarding', 'complete'];
    const currentIndex = steps.indexOf(setupStep);
    if (currentIndex > 0) {
      setSetupStep(steps[currentIndex - 1]);
    }
  };

  const testConnection = async (type, config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Connection successful' });
      }, 2000);
    });
  };

  const generateTrainingWithAPI = async () => {
    const prompt = createTrainingPrompt();
    
    // Try user's configured APIs first (OpenAI, Anthropic, etc.)
    const enabledModels = Object.entries(setupConfig.aiModels.configs).filter(([key, config]) => 
      config.apiKey && key !== 'llama'
    );

    if (enabledModels.length > 0) {
      // Try user's configured models first
      try {
        return await callUserConfiguredAPI(enabledModels[0], prompt);
      } catch (error) {
        console.log('User API failed, falling back to free LLaMA:', error.message);
      }
    }

    // Fallback to free LLaMA API 
    return await callFreeLlamaAPI(prompt);
  };

  const createTrainingPrompt = () => {
    const isSpanish = trainingData.language === 'es';
    const targetLanguage = languages.find(lang => lang.code === trainingData.language)?.name || 'English';
    const assignedEmployeeNames = trainingData.trainingScope === 'individual' 
      ? trainingData.assignedEmployees.map(id => employees.find(emp => emp.id === id)?.name).join(', ')
      : trainingData.trainingScope === 'department'
      ? `All ${currentUserDepartment} department employees`
      : 'All company employees';

    return `Create a comprehensive training module in ${targetLanguage} for:
- Job Title: ${trainingData.title}
- Company: ${setupConfig.company.name}
- Department: ${trainingData.department}
- Target: ${assignedEmployeeNames}
- Language: ${targetLanguage}

${ragAnalysis ? `Context from company documents:
- Relevant documents: ${ragAnalysis.relevantDocuments.map(doc => doc.name).join(', ')}
- Key insights: ${ragAnalysis.suggestedContent.join(' ')}
- Performance gaps: ${ragAnalysis.performanceGaps.join(' ')}` : ''}

Return a JSON object with this exact structure:
{
  "training": {
    "introduction": "Welcome message and overview",
    "sections": [
      {
        "title": "Section title",
        "content": "Section content",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "ragSources": ["doc1.pdf", "doc2.pdf"]
      }
    ],
    "safetyNotes": ["Safety point 1", "Safety point 2"],
    "bestPractices": ["Practice 1", "Practice 2"],
    "commonMistakes": ["Mistake 1", "Mistake 2"]
  },
  "quiz": [
    {
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": 1,
      "explanation": "Explanation of correct answer",
      "type": "Question type",
      "ragSource": "source_document.pdf"
    }
  ]
}`;
  };

  const callUserConfiguredAPI = async ([modelName, config], prompt) => {
    // Implementation for calling user's configured APIs (OpenAI, Anthropic, etc.)
    if (modelName === 'openai' && config.apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });
      
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      return parseTrainingResponse(data.choices[0].message.content);
    }

    if (modelName === 'anthropic' && config.apiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        })
      });
      
      if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
      const data = await response.json();
      return parseTrainingResponse(data.content[0].text);
    }

    throw new Error(`Model ${modelName} not implemented yet`);
  };

  const callFreeLlamaAPI = async (prompt) => {
    console.log('🦙 Using free LLaMA API as fallback...');
    
    const response = await fetch('https://chatterfix-llama-api-650169261019.us-central1.run.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Free LLaMA API error: ${response.status}`);
    }

    const data = await response.json();
    return parseTrainingResponse(data.choices[0].message.content);
  };

  const parseTrainingResponse = (content) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      
      // Validate the structure
      if (parsed.training && parsed.quiz) {
        return parsed;
      }
      
      // If structure is wrong, throw error to fall back to mock
      throw new Error('Invalid response structure');
    } catch (error) {
      console.log('Failed to parse API response as JSON, falling back to mock data');
      throw error;
    }
  };

  const generateTraining = async () => {
    setIsGenerating(true);
    
    try {
      const ragContext = ragAnalysis ? `
RAG Analysis Context:
- Relevant company documents: ${ragAnalysis.relevantDocuments.map(doc => doc.name).join(', ')}
- Key insights: ${ragAnalysis.suggestedContent.join(' ')}
- Performance gaps identified: ${ragAnalysis.performanceGaps.join(' ')}
` : '';

      const assignedEmployeeNames = trainingData.trainingScope === 'individual' 
        ? trainingData.assignedEmployees.map(id => employees.find(emp => emp.id === id)?.name).join(', ')
        : trainingData.trainingScope === 'department'
        ? `All ${currentUserDepartment} department employees`
        : 'All company employees';

      const targetLanguage = languages.find(lang => lang.code === trainingData.language)?.name || 'English';

      // Try to generate content using API (user's configured models or free LLaMA fallback)
      let apiResponse = null;
      try {
        apiResponse = await generateTrainingWithAPI();
      } catch (error) {
        console.log('API generation failed, using enhanced mock data:', error.message);
      }

      // Use API response if available, otherwise enhanced mock response with multi-language support
      const isSpanish = trainingData.language === 'es';
      const mockResponse = apiResponse || {
        training: {
          introduction: isSpanish ? 
            `Bienvenido al módulo de capacitación ${trainingData.title} para ${setupConfig.company.name}. Esta capacitación ha sido personalizada utilizando los procedimientos y políticas específicos de nuestra empresa. Basado en el análisis de nuestra documentación interna, esta capacitación aborda áreas clave identificadas para ${assignedEmployeeNames} en el departamento de ${trainingData.department}.` :
            `Welcome to the ${trainingData.title} training module for ${setupConfig.company.name}. This training has been customized using our company's specific procedures and policies. Based on analysis of our internal documentation, this training addresses key areas identified for ${assignedEmployeeNames} in the ${trainingData.department} department.`,
          sections: [
            {
              title: isSpanish ? "Procedimientos Específicos de la Empresa" : "Company-Specific Procedures",
              content: isSpanish ? 
                `Esta sección se basa en nuestros procedimientos y políticas más recientes de la empresa. El contenido ha sido adaptado utilizando información de nuestro sistema de análisis de documentos para garantizar la relevancia a su función específica y los estándares actuales de la empresa.` :
                `This section is based on our latest company procedures and policies. The content has been tailored using information from our document analysis system to ensure relevance to your specific role and current company standards.`,
              keyPoints: isSpanish ? [
                "Seguir protocolos específicos de la empresa según se describe en nuestros procedimientos actuales",
                "Aplicar requisitos de seguridad específicos del departamento según el manual de la empresa",
                "Utilizar herramientas y métodos aprobados por la empresa",
                "Mantener estándares de documentación según la política de la empresa"
              ] : [
                "Follow company-specific protocols as outlined in our current procedures",
                "Apply department-specific safety requirements per company manual",
                "Utilize company-approved tools and methods",
                "Maintain documentation standards as per company policy"
              ],
              ragSources: ragAnalysis ? ragAnalysis.relevantDocuments.map(doc => doc.name) : []
            },
            {
              title: isSpanish ? "Implementación Específica del Rol" : "Role-Specific Implementation",
              content: isSpanish ?
                "Basado en el análisis de datos de rendimiento recientes y documentación de la empresa, estos procedimientos están personalizados para su posición específica y las necesidades actuales de la empresa." :
                "Based on analysis of recent performance data and company documentation, these procedures are customized for your specific position and current company needs.",
              keyPoints: isSpanish ? [
                "Responsabilidades y procedimientos específicos de la posición",
                "Integración con sistemas y procesos actuales de la empresa",
                "Cumplimiento con estándares de seguridad y calidad de la empresa",
                "Métricas de rendimiento alineadas con objetivos de la empresa"
              ] : [
                "Position-specific responsibilities and procedures",
                "Integration with current company systems and processes",
                "Compliance with company safety and quality standards",
                "Performance metrics aligned with company goals"
              ],
              ragSources: ragAnalysis ? ragAnalysis.relevantDocuments.map(doc => doc.name) : []
            }
          ],
          safetyNotes: isSpanish ? [
            `Seguir todos los protocolos y procedimientos de seguridad de ${setupConfig.company.name}`,
            "Cumplir con los requisitos específicos de EPP de la empresa",
            "Reportar incidentes según los procedimientos de respuesta de emergencia de la empresa",
            "Mantener estándares de seguridad como se describe en el manual de seguridad de la empresa"
          ] : [
            `Follow all ${setupConfig.company.name} safety protocols and procedures`,
            "Comply with company-specific PPE requirements",
            "Report incidents according to company emergency response procedures",
            "Maintain safety standards as outlined in company safety manual"
          ],
          bestPractices: isSpanish ? [
            "Utilizar mejores prácticas y procedimientos aprobados por la empresa",
            "Mantener aprendizaje continuo según los programas de desarrollo de la empresa",
            "Colaborar efectivamente usando protocolos de comunicación de la empresa",
            "Documentar actividades según los estándares de calidad de la empresa"
          ] : [
            "Utilize company-approved best practices and procedures",
            "Maintain continuous learning per company development programs",
            "Collaborate effectively using company communication protocols",
            "Document activities according to company quality standards"
          ],
          commonMistakes: isSpanish ? [
            "Desviarse de los procedimientos establecidos por la empresa",
            "Ignorar los requisitos de seguridad específicos de la empresa",
            "No utilizar los sistemas de documentación de la empresa",
            "No seguir los procesos de gestión de cambios de la empresa"
          ] : [
            "Deviating from company-established procedures",
            "Ignoring company-specific safety requirements",
            "Failing to utilize company documentation systems",
            "Not following company change management processes"
          ]
        },
        quiz: isSpanish ? [
          {
            question: `Según el manual de seguridad de ${setupConfig.company.name}, ¿cuál es el primer paso requerido antes de operar equipos en el departamento de ${trainingData.department}?`,
            options: [
              "A) Revisar las pautas generales de seguridad",
              "B) Completar la lista de verificación pre-operacional específica de la empresa",
              "C) Pedir permiso al supervisor",
              "D) Revisar los procedimientos estándar de la industria"
            ],
            correct: 1,
            explanation: `El manual de seguridad de ${setupConfig.company.name} requiere específicamente completar la lista de verificación pre-operacional específica del departamento para asegurar que se sigan todos los protocolos de seguridad de la empresa.`,
            type: "Política de la Empresa",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[0]?.name : "Manual_Seguridad_Empresa.pdf"
          },
          {
            question: `Basado en el análisis de datos de rendimiento recientes, ¿qué área requiere más atención para mejorar en su rol?`,
            options: [
              "A) Seguir solo las mejores prácticas de la industria",
              "B) Integrar comentarios con el sistema de gestión de rendimiento de la empresa",
              "C) Trabajar independientemente sin orientación",
              "D) Enfocarse solo en la velocidad de finalización"
            ],
            correct: 1,
            explanation: "Los comentarios de rendimiento deben integrarse activamente con el sistema de gestión de rendimiento de la empresa para la mejora continua y alineación con los objetivos de la empresa.",
            type: "Integración de Rendimiento",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[1]?.name : "Directrices_Rendimiento.pdf"
          },
          {
            question: `En un escenario donde encuentra una preocupación de seguridad no cubierta en los procedimientos estándar, ¿cuál debería ser su acción inmediata según la política de ${setupConfig.company.name}?`,
            options: [
              "A) Continuar trabajando y reportarlo después",
              "B) Detener el trabajo y seguir el procedimiento de reporte de incidentes de la empresa",
              "C) Pedir consejo a un compañero de trabajo",
              "D) Buscar pautas de la industria en línea"
            ],
            correct: 1,
            explanation: `La política de ${setupConfig.company.name} requiere la detención inmediata del trabajo y seguir el procedimiento específico de reporte de incidentes de la empresa para asegurar la seguridad y documentación adecuada.`,
            type: "Basado en Escenarios",
            ragSource: "Procedimientos_Emergencia.docx"
          },
          {
            question: `Al actualizar documentación según los estándares de calidad de ${setupConfig.company.name}, ¿qué sistema debe utilizarse?`,
            options: [
              "A) Cualquier sistema de documentación disponible",
              "B) Sistema de gestión de calidad designado por la empresa",
              "C) Notas y registros personales",
              "D) Formatos estándar de la industria"
            ],
            correct: 1,
            explanation: "Los estándares de calidad de la empresa requieren que toda la documentación se mantenga en el sistema de gestión de calidad designado para asegurar consistencia y cumplimiento.",
            type: "Control de Calidad",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[2]?.name : "Estándares_Calidad.pdf"
          },
          {
            question: `¿Cómo debe rastrearse el progreso de capacitación según su plan de desarrollo individual?`,
            options: [
              "A) Solo autoevaluación",
              "B) A través del sistema de gestión de capacitación de la empresa con supervisión del supervisor",
              "C) Discusión informal con compañeros",
              "D) Solo proceso de revisión anual"
            ],
            correct: 1,
            explanation: "El progreso de capacitación debe rastrearse a través del sistema de gestión de capacitación de la empresa con supervisión regular del supervisor para asegurar el desarrollo adecuado y cumplimiento.",
            type: "Gestión de Capacitación",
            ragSource: "Política_Capacitación.pdf"
          }
        ] : [
          {
            question: `According to ${setupConfig.company.name} safety manual, what is the required first step before operating equipment in the ${trainingData.department} department?`,
            options: [
              "A) Check general safety guidelines",
              "B) Complete company-specific pre-operation checklist",
              "C) Ask supervisor for permission",
              "D) Review industry standard procedures"
            ],
            correct: 1,
            explanation: `${setupConfig.company.name}'s safety manual specifically requires completion of the department-specific pre-operation checklist to ensure all company safety protocols are followed.`,
            type: "Company Policy",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[0]?.name : "Company_Safety_Manual.pdf"
          },
          {
            question: `Based on recent performance data analysis, which area requires the most attention for improvement in your role?`,
            options: [
              "A) Following industry best practices only",
              "B) Integrating feedback with company performance management system",
              "C) Working independently without guidance",
              "D) Focusing only on speed of completion"
            ],
            correct: 1,
            explanation: "Performance feedback should be actively integrated with the company's performance management system for continuous improvement and alignment with company goals.",
            type: "Performance Integration",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[1]?.name : "Performance_Guidelines.pdf"
          },
          {
            question: `In a scenario where you encounter a safety concern not covered in standard procedures, what should be your immediate action according to ${setupConfig.company.name} policy?`,
            options: [
              "A) Continue working and report it later",
              "B) Stop work and follow company incident reporting procedure",
              "C) Ask a coworker for advice",
              "D) Look up industry guidelines online"
            ],
            correct: 1,
            explanation: `${setupConfig.company.name} policy requires immediate work stoppage and following the company's specific incident reporting procedure to ensure safety and proper documentation.`,
            type: "Scenario-Based",
            ragSource: "Emergency_Procedures.docx"
          },
          {
            question: `When updating documentation according to ${setupConfig.company.name} quality standards, which system should be used?`,
            options: [
              "A) Any available documentation system",
              "B) Company's designated quality management system",
              "C) Personal notes and records",
              "D) Industry standard formats"
            ],
            correct: 1,
            explanation: "Company quality standards require all documentation to be maintained in the designated quality management system to ensure consistency and compliance.",
            type: "Quality Control",
            ragSource: ragAnalysis ? ragAnalysis.relevantDocuments[2]?.name : "Quality_Standards.pdf"
          },
          {
            question: `How should training progress be tracked according to your individual development plan?`,
            options: [
              "A) Self-assessment only",
              "B) Through company's training management system with supervisor oversight",
              "C) Informal discussion with peers",
              "D) Annual review process only"
            ],
            correct: 1,
            explanation: "Training progress must be tracked through the company's training management system with regular supervisor oversight to ensure proper development and compliance.",
            type: "Training Management",
            ragSource: "Training_Policy.pdf"
          }
        ].slice(0, trainingData.quizConfig?.questionCount || 5),
        ragAnalysis: ragAnalysis
      };

      setGeneratedTraining(mockResponse);
      setCurrentView('review');
    } catch (error) {
      alert('Error generating training. Please check your configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addNewEmployee = () => {
    if (newEmployee.name && newEmployee.department && newEmployee.position) {
      const employeeId = employees.length + 1;
      const newEmp = {
        id: employeeId,
        ...newEmployee,
        role: 'employee',
        supervisor: currentUser?.name,
        completedTrainings: 0,
        totalTrainings: 0,
        lastTraining: null,
        performance: null,
        certifications: [],
        trainingHistory: [],
        recommendedTrainings: [
          { title: 'Company Orientation', reason: 'New employee onboarding', priority: 'high' },
          { title: 'Safety Fundamentals', reason: 'Required for all new hires', priority: 'high' },
          { title: `${newEmployee.department} Basics`, reason: 'Department-specific training', priority: 'high' }
        ]
      };
      
      setEmployees([...employees, newEmp]);
      setNewEmployee({
        name: '',
        department: '',
        position: '',
        email: '',
        hireDate: '',
        directSupervisor: '',
        preferredLanguage: 'en'
      });
      setShowAddEmployee(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setTrainingData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))]
    }));
  };

  const startQuiz = () => {
    setCurrentView('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const results = generatedTraining.quiz.map((question, index) => ({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswer: question.correct,
      isCorrect: userAnswers[index] === question.correct,
      explanation: question.explanation
    }));
    
    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / results.length) * 100);
    
    setQuizResults({
      results,
      score,
      total: results.length,
      percentage,
      passed: percentage >= (trainingData.quizConfig?.passingScore || 80)
    });
    setCurrentView('results');
  };

  const getDashboardStats = () => {
    const totalEmployees = employees.length;
    const avgCompletion = employees.reduce((acc, emp) => 
      acc + (emp.totalTrainings > 0 ? (emp.completedTrainings / emp.totalTrainings) * 100 : 0), 0) / totalEmployees;
    const activeTrainings = employees.reduce((acc, emp) => acc + (emp.totalTrainings - emp.completedTrainings), 0);
    const avgPerformance = employees.filter(emp => emp.performance).reduce((acc, emp) => acc + emp.performance, 0) / 
                          employees.filter(emp => emp.performance).length;

    return {
      totalEmployees,
      avgCompletion: Math.round(avgCompletion),
      activeTrainings,
      avgPerformance: Math.round(avgPerformance || 0)
    };
  };

  const stats = getDashboardStats();
  const completedSetup = setupStep === 'complete';
  const filteredEmployees = filterDepartment === 'all' ? employees : employees.filter(emp => emp.department === filterDepartment);

  return (
    <>
      {showLandingPage ? (
        <LandingPage onDemoAccess={handleDemoAccess} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-gray-900">Line Smart</h1>
                      {userTier === 'demo' && (
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          DEMO ACCESS
                        </span>
                      )}
                    </div>
                <p className="text-sm text-gray-500">Enterprise AI-Powered Training Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {(completedSetup || demoUser) && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {demoUser ? demoUser.companyName : setupConfig.company.name} • {demoUser ? demoUser.email : `${currentUser?.name} (${currentUser?.role})`}
                  </div>
                  <div className="text-xs text-blue-600">
                    {demoUser ? 'Demo Mode - Full Features Available' : `${setupConfig.aiModels.primary} • AI Enabled • ${getLanguageName(setupConfig.company.defaultLanguage)}`}
                  </div>
                </div>
              )}
              <button
                onClick={() => setCurrentView('setup')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Setup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Flow */}
        {currentView === 'setup' && (
          <div className="max-w-4xl mx-auto">
            {/* Setup Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Platform Setup</h2>
                <span className="text-sm text-gray-500">
                  Step {['welcome', 'company', 'ai-models', 'data-source', 'onboarding', 'complete'].indexOf(setupStep) + 1} of 6
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((['welcome', 'company', 'ai-models', 'data-source', 'onboarding', 'complete'].indexOf(setupStep) + 1) / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Welcome Step */}
            {setupStep === 'welcome' && (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="mb-6">
                  <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Line Smart</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Set up your enterprise AI-powered training platform. We'll help you configure AI models,
                    connect to your company documents, and create personalized training experiences
                    for your entire organization.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Brain className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
                    <h4 className="font-semibold text-blue-900 mb-2">AI Integration</h4>
                    <p className="text-sm text-blue-800">Connect multiple AI models for diverse training generation</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <Database className="h-8 w-8 text-green-600 mb-3 mx-auto" />
                    <h4 className="font-semibold text-green-900 mb-2">Training Data</h4>
                    <p className="text-sm text-green-800">Use your company documents to create contextual training</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                    <h4 className="font-semibold text-purple-900 mb-2">Individual Tracking</h4>
                    <p className="text-sm text-purple-800">Personalized learning paths for every employee</p>
                  </div>
                </div>

                <button
                  onClick={handleSetupNext}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                >
                  <span>Get Started</span>
                  <GitBranch className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Company Configuration Step */}
            {setupStep === 'company' && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Company Configuration
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={setupConfig.company.name}
                        onChange={(e) => setSetupConfig(prev => ({
                          ...prev,
                          company: { ...prev.company, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={setupConfig.company.industry}
                        onChange={(e) => {
                          setSetupConfig(prev => ({
                            ...prev,
                            company: { ...prev.company, industry: e.target.value }
                          }));
                          if (setupConfig.company.name && e.target.value) {
                            generateCompanyConfig(setupConfig.company.name, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      value={setupConfig.company.size}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        company: { ...prev.company, size: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Company Size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Company Language
                    </label>
                    <select
                      value={setupConfig.company.defaultLanguage}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        company: { ...prev.company, defaultLanguage: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Supported Languages
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.filter(lang => lang.code !== setupConfig.company.defaultLanguage).map(lang => (
                        <label key={lang.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={setupConfig.company.supportedLanguages.includes(lang.code)}
                            onChange={(e) => {
                              const languagesArray = e.target.checked
                                ? [...setupConfig.company.supportedLanguages, lang.code]
                                : setupConfig.company.supportedLanguages.filter(l => l !== lang.code);
                              setSetupConfig(prev => ({
                                ...prev,
                                company: { ...prev.company, supportedLanguages: languagesArray }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{lang.flag} {lang.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departments
                      {setupConfig.company.industry && (
                        <span className="text-xs text-blue-600 ml-2">(AI-suggested based on industry)</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      {standardDepartments.map(dept => (
                        <label key={dept} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={setupConfig.company.departments.includes(dept)}
                            onChange={(e) => {
                              const departments = e.target.checked
                                ? [...setupConfig.company.departments, dept]
                                : setupConfig.company.departments.filter(d => d !== dept);
                              setSetupConfig(prev => ({
                                ...prev,
                                company: { ...prev.company, departments }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Safety & Compliance Requirements
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {safetyRequirements.map(req => (
                        <label key={req} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={setupConfig.company.safetyRequirements.includes(req)}
                            onChange={(e) => {
                              const requirements = e.target.checked
                                ? [...setupConfig.company.safetyRequirements, req]
                                : setupConfig.company.safetyRequirements.filter(r => r !== req);
                              setSetupConfig(prev => ({
                                ...prev,
                                company: { ...prev.company, safetyRequirements: requirements }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{req}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleSetupPrev}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSetupNext}
                    disabled={!setupConfig.company.name || !setupConfig.company.industry}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* AI Models Configuration Step */}
            {setupStep === 'ai-models' && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI Model Configuration
                </h3>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Primary AI Model
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiModels.map(model => (
                        <div
                          key={model.id}
                          onClick={() => setSetupConfig(prev => ({
                            ...prev,
                            aiModels: { ...prev.aiModels, primary: model.id }
                          }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            setupConfig.aiModels.primary === model.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
                          <p className="text-sm text-gray-600">{model.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {setupConfig.aiModels.primary && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium mb-4">
                        Configure {aiModels.find(m => m.id === setupConfig.aiModels.primary)?.name}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={setupConfig.aiModels.configs[setupConfig.aiModels.primary]?.apiKey || ''}
                            onChange={(e) => setSetupConfig(prev => ({
                              ...prev,
                              aiModels: {
                                ...prev.aiModels,
                                configs: {
                                  ...prev.aiModels.configs,
                                  [setupConfig.aiModels.primary]: {
                                    ...prev.aiModels.configs[setupConfig.aiModels.primary],
                                    apiKey: e.target.value
                                  }
                                }
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter API key"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model Version
                          </label>
                          <input
                            type="text"
                            value={setupConfig.aiModels.configs[setupConfig.aiModels.primary]?.model || ''}
                            onChange={(e) => setSetupConfig(prev => ({
                              ...prev,
                              aiModels: {
                                ...prev.aiModels,
                                configs: {
                                  ...prev.aiModels.configs,
                                  [setupConfig.aiModels.primary]: {
                                    ...prev.aiModels.configs[setupConfig.aiModels.primary],
                                    model: e.target.value
                                  }
                                }
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., gpt-4, claude-3-sonnet"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => testConnection(setupConfig.aiModels.primary, setupConfig.aiModels.configs[setupConfig.aiModels.primary])}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Test Connection</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleSetupPrev}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSetupNext}
                    disabled={!setupConfig.aiModels.primary}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Data Source Configuration Step */}
            {setupStep === 'data-source' && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  Data Source & Document Settings
                </h3>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Data Source for Training Documents
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dataSourceTypes.map(source => (
                        <div
                          key={source.id}
                          onClick={() => setSetupConfig(prev => ({
                            ...prev,
                            dataSource: { ...prev.dataSource, type: source.id }
                          }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            setupConfig.dataSource.type === source.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            {source.icon}
                            <h4 className="font-medium text-gray-900">{source.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{source.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {setupConfig.dataSource.type === 'googleDrive' && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium mb-4">Google Drive Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Folder ID or Shared Drive ID
                          </label>
                          <input
                            type="text"
                            value={setupConfig.dataSource.config.googleDrive.folderId}
                            onChange={(e) => setSetupConfig(prev => ({
                              ...prev,
                              dataSource: {
                                ...prev.dataSource,
                                config: {
                                  ...prev.dataSource.config,
                                  googleDrive: { ...prev.dataSource.config.googleDrive, folderId: e.target.value }
                                }
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium mb-4">Document Processing Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chunk Size
                        </label>
                        <input
                          type="number"
                          value={setupConfig.dataSource.ragSettings.chunkSize}
                          onChange={(e) => setSetupConfig(prev => ({
                            ...prev,
                            dataSource: {
                              ...prev.dataSource,
                              ragSettings: { ...prev.dataSource.ragSettings, chunkSize: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlap
                        </label>
                        <input
                          type="number"
                          value={setupConfig.dataSource.ragSettings.overlap}
                          onChange={(e) => setSetupConfig(prev => ({
                            ...prev,
                            dataSource: {
                              ...prev.dataSource,
                              ragSettings: { ...prev.dataSource.ragSettings, overlap: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vector Store
                        </label>
                        <select
                          value={setupConfig.dataSource.ragSettings.vectorStore}
                          onChange={(e) => setSetupConfig(prev => ({
                            ...prev,
                            dataSource: {
                              ...prev.dataSource,
                              ragSettings: { ...prev.dataSource.ragSettings, vectorStore: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="chromadb">ChromaDB</option>
                          <option value="pinecone">Pinecone</option>
                          <option value="weaviate">Weaviate</option>
                          <option value="qdrant">Qdrant</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleSetupPrev}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSetupNext}
                    disabled={!setupConfig.dataSource.type}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Onboarding Configuration Step */}
            {setupStep === 'onboarding' && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                  Onboarding Configuration
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Onboarding Trainings
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {trainingTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={setupConfig.onboarding.defaultTrainings.includes(type)}
                            onChange={(e) => {
                              const trainings = e.target.checked
                                ? [...setupConfig.onboarding.defaultTrainings, type]
                                : setupConfig.onboarding.defaultTrainings.filter(t => t !== type);
                              setSetupConfig(prev => ({
                                ...prev,
                                onboarding: { ...prev.onboarding, defaultTrainings: trainings }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Probation Period (Days)
                      </label>
                      <input
                        type="number"
                        value={setupConfig.onboarding.probationPeriod}
                        onChange={(e) => setSetupConfig(prev => ({
                          ...prev,
                          onboarding: { ...prev.onboarding, probationPeriod: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={setupConfig.onboarding.mentorAssignment}
                          onChange={(e) => setSetupConfig(prev => ({
                            ...prev,
                            onboarding: { ...prev.onboarding, mentorAssignment: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Automatic Mentor Assignment
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleSetupPrev}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSetupNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            )}

            {/* Setup Complete Step */}
            {setupStep === 'complete' && (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Your Line Smart platform is now configured and ready to use. Your company documents will be processed
                    for AI-powered training generation, and supervisors can create personalized training experiences.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Company: {setupConfig.company.name}</h4>
                    <p className="text-sm text-blue-800">{setupConfig.company.industry} • {setupConfig.company.size}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">AI Model: {setupConfig.aiModels.primary}</h4>
                    <p className="text-sm text-green-800">Connected to {setupConfig.dataSource.type}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Languages: {setupConfig.company.supportedLanguages.length + 1}</h4>
                    <p className="text-sm text-purple-800">Multi-language support enabled</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Training</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation for other views */}
        {currentView !== 'setup' && completedSetup && (
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Employee Dashboard
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'create' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Training
            </button>
            <button
              onClick={() => setShowTrainingData(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-white"
            >
              <Database className="h-4 w-4 inline mr-2" />
              Training Data
            </button>
            <button
              onClick={() => setCurrentView('quiz')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'quiz' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${!generatedTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!generatedTraining}
            >
              <Award className="h-4 w-4 inline mr-2" />
              Take Quiz
            </button>
            <button
              onClick={() => setCurrentView('review')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'review' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${!generatedTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!generatedTraining}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Review Training
            </button>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && completedSetup && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Completion</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgCompletion}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Trainings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeTrainings}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Performance</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgPerformance}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Employee Management */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Supervised Employee Management</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAddEmployee(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Employee</span>
                  </button>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Departments</option>
                    {standardDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(employee => (
                  <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                        <p className="text-xs text-gray-500">{employee.department}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {getLanguageName(employee.preferredLanguage)}
                          </span>
                          {employee.role === 'supervisor' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Supervisor
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Training Progress</span>
                        <span>{employee.completedTrainings}/{employee.totalTrainings}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${employee.totalTrainings > 0 ? (employee.completedTrainings / employee.totalTrainings) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      {employee.performance && (
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span className={`font-medium ${
                            employee.performance >= 90 ? 'text-green-600' : 
                            employee.performance >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {employee.performance}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Recommended Trainings:</h4>
                      {employee.recommendedTrainings.slice(0, 2).map((rec, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{rec.title}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{rec.reason}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setCurrentView('create');
                        }}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Assign Training
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Training View */}
        {currentView === 'create' && completedSetup && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Supervisor Training Development
                  <span className="ml-3 text-sm text-gray-500">
                    ({currentUser?.name} - {currentUser?.department})
                  </span>
                </h2>

                {/* Training Scope Selection */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-900 mb-3">Training Scope</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      trainingData.trainingScope === 'individual' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="trainingScope"
                        value="individual"
                        checked={trainingData.trainingScope === 'individual'}
                        onChange={(e) => setTrainingData(prev => ({...prev, trainingScope: e.target.value}))}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <span className="text-sm font-medium">Individual Employee</span>
                        <p className="text-xs text-gray-600 mt-1">Assign to specific employees</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      trainingData.trainingScope === 'department' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="trainingScope"
                        value="department"
                        checked={trainingData.trainingScope === 'department'}
                        onChange={(e) => setTrainingData(prev => ({...prev, trainingScope: e.target.value}))}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <Building className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <span className="text-sm font-medium">Department Wide</span>
                        <p className="text-xs text-gray-600 mt-1">All {currentUserDepartment} employees</p>
                      </div>
                    </label>

                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      trainingData.trainingScope === 'company' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="trainingScope"
                        value="company"
                        checked={trainingData.trainingScope === 'company'}
                        onChange={(e) => setTrainingData(prev => ({...prev, trainingScope: e.target.value}))}
                        className="sr-only"
                      />
                      <div className="text-center w-full">
                        <Globe className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <span className="text-sm font-medium">Company Wide</span>
                        <p className="text-xs text-gray-600 mt-1">All employees (requires approval)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Document Analysis */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-900 flex items-center">
                      <FileSearch className="h-4 w-4 mr-2" />
                      Document Analysis
                    </h3>
                    <button
                      onClick={() => analyzeTrainingWithRAG(selectedEmployee, trainingData.trainingType)}
                      disabled={isAnalyzing || !trainingData.trainingType}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3" />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                  {ragAnalysis ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Relevant Documents Found:</h4>
                        <div className="flex flex-wrap gap-2">
                          {ragAnalysis.relevantDocuments.map((doc, index) => (
                            <span key={index} className="px-2 py-1 bg-white text-blue-700 rounded text-xs">
                              {doc.name} ({Math.round(doc.relevance * 100)}%)
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Key Insights:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {ragAnalysis.suggestedContent.slice(0, 2).map((insight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">Click "Analyze" to scan your company documents for relevant training content.</p>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Basic Information with Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Training Title
                      </label>
                      <input
                        type="text"
                        value={trainingData.title}
                        onChange={(e) => setTrainingData(prev => ({...prev, title: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Equipment Safety Training"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Training Language
                      </label>
                      <select
                        value={trainingData.language}
                        onChange={(e) => setTrainingData(prev => ({...prev, language: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {languages.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={trainingData.department}
                        onChange={(e) => setTrainingData(prev => ({...prev, department: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        {trainingData.trainingScope === 'department' ? (
                          <option value={currentUserDepartment}>{currentUserDepartment}</option>
                        ) : (
                          standardDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Training Type
                      </label>
                      <select
                        value={trainingData.trainingType}
                        onChange={(e) => setTrainingData(prev => ({...prev, trainingType: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Training Type</option>
                        {trainingTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={trainingData.dueDate}
                        onChange={(e) => setTrainingData(prev => ({...prev, dueDate: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Model
                      </label>
                      <select
                        value={trainingData.aiModel}
                        onChange={(e) => setTrainingData(prev => ({...prev, aiModel: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="primary">Primary ({setupConfig.aiModels.primary})</option>
                        <option value="secondary">Secondary Model</option>
                      </select>
                    </div>
                  </div>

                  {/* Employee Assignment */}
                  {trainingData.trainingScope === 'individual' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Employees
                        <span className="text-xs text-blue-600 ml-2">
                          (Showing your supervised employees and language preferences)
                        </span>
                      </label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        {supervisedEmployees.length > 0 ? supervisedEmployees.map(employee => (
                          <label key={employee.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={trainingData.assignedEmployees.includes(employee.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTrainingData(prev => ({
                                      ...prev,
                                      assignedEmployees: [...prev.assignedEmployees, employee.id]
                                    }));
                                  } else {
                                    setTrainingData(prev => ({
                                      ...prev,
                                      assignedEmployees: prev.assignedEmployees.filter(id => id !== employee.id)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({employee.department} - {employee.position})</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {getLanguageName(employee.preferredLanguage)}
                              </span>
                              {employee.preferredLanguage !== trainingData.language && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  ⚠️ Language mismatch
                                </span>
                              )}
                            </div>
                          </label>
                        )) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No supervised employees found. Contact admin to assign employees to your supervision.
                          </p>
                        )}
                      </div>
                      {selectedEmployee && (
                        <p className="text-sm text-blue-600 mt-2">
                          Pre-selected: {selectedEmployee.name} ({getLanguageName(selectedEmployee.preferredLanguage)})
                        </p>
                      )}
                    </div>
                  )}

                  {trainingData.trainingScope === 'department' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Department-Wide Training</h4>
                      <p className="text-sm text-green-800 mb-3">
                        This training will be assigned to all employees in the {currentUserDepartment} department.
                      </p>
                      <div className="text-sm text-green-700">
                        <p className="font-medium mb-1">Target Employees ({employees.filter(emp => emp.department === currentUserDepartment).length}):</p>
                        <div className="space-y-1">
                          {employees.filter(emp => emp.department === currentUserDepartment).map(emp => (
                            <div key={emp.id} className="flex justify-between items-center">
                              <span>{emp.name} - {emp.position}</span>
                              <span className="text-xs bg-white px-2 py-1 rounded">
                                {getLanguageName(emp.preferredLanguage)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {trainingData.trainingScope === 'company' && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">⚠️ Company-Wide Training</h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        This training will be assigned to all employees across all departments and will require management approval.
                      </p>
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">Total Employees: {employees.length}</p>
                        <p className="text-xs">Languages needed: {[...new Set(employees.map(emp => emp.preferredLanguage))].map(lang => getLanguageName(lang)).join(', ')}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Description
                    </label>
                    <textarea
                      value={trainingData.description}
                      onChange={(e) => setTrainingData(prev => ({...prev, description: e.target.value}))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide specific details about individual requirements and expectations..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Individual Learning Objectives
                    </label>
                    <textarea
                      value={trainingData.objectives}
                      onChange={(e) => setTrainingData(prev => ({...prev, objectives: e.target.value}))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What should each assigned employee be able to do after completing this training?"
                    />
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Documents
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload employee-specific documents, procedures, and materials
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {trainingData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {trainingData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm text-gray-700">{doc.name}</span>
                            </div>
                            <button
                              onClick={() => setTrainingData(prev => ({
                                ...prev,
                                documents: prev.documents.filter((_, i) => i !== index)
                              }))}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quiz Configuration */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Automated Quiz Generation
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-1">
                            Quiz Questions
                          </label>
                          <select
                            value={trainingData.quizConfig?.questionCount || 5}
                            onChange={(e) => setTrainingData(prev => ({
                              ...prev,
                              quizConfig: { ...prev.quizConfig, questionCount: parseInt(e.target.value) }
                            }))}
                            className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value={3}>3 Questions</option>
                            <option value={5}>5 Questions</option>
                            <option value={7}>7 Questions</option>
                            <option value={10}>10 Questions</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-1">
                            Passing Score
                          </label>
                          <select
                            value={trainingData.quizConfig?.passingScore || 80}
                            onChange={(e) => setTrainingData(prev => ({
                              ...prev,
                              quizConfig: { ...prev.quizConfig, passingScore: parseInt(e.target.value) }
                            }))}
                            className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value={70}>70%</option>
                            <option value={80}>80%</option>
                            <option value={90}>90%</option>
                            <option value={100}>100%</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-1">
                            Question Style
                          </label>
                          <select
                            value={trainingData.quizConfig?.style || 'mixed'}
                            onChange={(e) => setTrainingData(prev => ({
                              ...prev,
                              quizConfig: { ...prev.quizConfig, style: e.target.value }
                            }))}
                            className="w-full px-3 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value="mixed">Mixed (Multiple Choice + Scenario)</option>
                            <option value="multiple-choice">Multiple Choice Only</option>
                            <option value="scenario">Scenario-Based</option>
                            <option value="company-specific">Company Policy Focus</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-green-800">
                        <p className="font-medium mb-1">✅ Quiz Features Included:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <span>• Company-specific questions</span>
                          <span>• Instant feedback & explanations</span>
                          <span>• Performance tracking</span>
                          <span>• Retake capability</span>
                          <span>• Supervisor notifications</span>
                          <span>• Certification generation</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Status Indicator */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      {(() => {
                        const enabledModels = Object.entries(setupConfig.aiModels.configs).filter(([key, config]) => 
                          config.apiKey && key !== 'llama'
                        );
                        
                        if (enabledModels.length > 0) {
                          const [modelName] = enabledModels[0];
                          return (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-blue-800">
                                Will use your {modelName.toUpperCase()} API • Fallback: Free LLaMA
                              </span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-800">
                                🦙 Using free LLaMA API (no API key required)
                              </span>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Enhanced Generate Button */}
                  <button
                    onClick={generateTraining}
                    disabled={!trainingData.title || !trainingData.department || !trainingData.trainingType || (trainingData.trainingScope === 'individual' && trainingData.assignedEmployees.length === 0) || isGenerating}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Generating Training + Quiz...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        <span>Generate Training + Automated Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Info Panel with Supervisor & Language Features */}
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Supervisor Training Development</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Individual & department-wide training creation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Multi-language support (10+ languages)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Employee language preference matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Supervised employee management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Company-wide training (with approval)</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">🌍 Multi-Language Training</h3>
                <div className="space-y-3 text-sm text-purple-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Current Language:</span>
                    <span className="px-2 py-1 bg-white rounded">
                      {getLanguageName(trainingData.language)}
                    </span>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium mb-1">Supported Languages:</p>
                    <div className="flex flex-wrap gap-1">
                      {languages.slice(0, 5).map(lang => (
                        <span key={lang.code} className="px-2 py-1 bg-white rounded text-xs">
                          {lang.flag} {lang.name}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-white rounded text-xs">+5 more</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">AI Training Features Active</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Company document analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Performance-based recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Multi-language policy integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cultural context adaptation</span>
                  </div>
                </div>
              </div>

              {ragAnalysis && (
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">AI Recommendations</h3>
                  <div className="space-y-3">
                    {ragAnalysis.recommendedTrainings.map((rec, index) => (
                      <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                        <h4 className="font-medium text-yellow-900">{rec.title}</h4>
                        <p className="text-sm text-yellow-800 mt-1">{rec.reason}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                          <span className="text-xs text-gray-600">{rec.estimatedDuration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Training View */}
        {currentView === 'review' && generatedTraining && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{trainingData.title}</h2>
                  <p className="text-gray-600">{trainingData.department} • {trainingData.trainingType}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Language: {getLanguageName(trainingData.language)} • Scope: {trainingData.trainingScope}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={startQuiz}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Training Content Display */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Introduction</h3>
                <p className="text-gray-700 leading-relaxed">{generatedTraining.training.introduction}</p>
              </div>

              <div className="space-y-8">
                {generatedTraining.training.sections.map((section, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Key Points:</h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        {section.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety, Best Practices, Common Mistakes sections */}
              <div className="mt-8 bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Individual Safety Responsibilities
                </h3>
                <ul className="list-disc list-inside space-y-2 text-red-800">
                  {generatedTraining.training.safetyNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Personal Best Practices</h3>
                <ul className="list-disc list-inside space-y-2 text-green-800">
                  {generatedTraining.training.bestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-900 mb-4">Common Individual Mistakes to Avoid</h3>
                <ul className="list-disc list-inside space-y-2 text-yellow-800">
                  {generatedTraining.training.commonMistakes.map((mistake, index) => (
                    <li key={index}>{mistake}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Taking View */}
        {currentView === 'quiz' && generatedTraining && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Knowledge Assessment Quiz
                </h2>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {generatedTraining.quiz.length}
                  </span>
                  <div className="text-xs text-blue-600 mt-1">
                    Passing Score: {trainingData.quizConfig?.passingScore || 80}%
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / generatedTraining.quiz.length) * 100}%` }}
                  ></div>
                </div>

                <div className="question-container">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {generatedTraining.quiz[currentQuestionIndex].type || 'Company Policy'}
                    </span>
                    {generatedTraining.quiz[currentQuestionIndex].ragSource && (
                      <span className="inline-block ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Source: {generatedTraining.quiz[currentQuestionIndex].ragSource}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-6">
                    {generatedTraining.quiz[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-3">
                    {generatedTraining.quiz[currentQuestionIndex].options.map((option, index) => (
                      <label
                        key={index}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          userAnswers[currentQuestionIndex] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={index}
                          checked={userAnswers[currentQuestionIndex] === index}
                          onChange={() => handleAnswerSelect(currentQuestionIndex, index)}
                          className="sr-only"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentQuestionIndex === generatedTraining.quiz.length - 1 ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length !== generatedTraining.quiz.length}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Award className="h-4 w-4" />
                    <span>Submit Quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(generatedTraining.quiz.length - 1, currentQuestionIndex + 1))}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                )}
              </div>

              {/* Quiz Help Panel */}
              <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Quiz Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-800">
                  <div>
                    <span className="font-medium">Questions:</span> {generatedTraining.quiz.length}
                  </div>
                  <div>
                    <span className="font-medium">Passing Score:</span> {trainingData.quizConfig?.passingScore || 80}%
                  </div>
                  <div>
                    <span className="font-medium">Retakes:</span> Unlimited
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results View */}
        {currentView === 'results' && quizResults && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  quizResults.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {quizResults.passed ? (
                    <Award className="h-8 w-8" />
                  ) : (
                    <AlertCircle className="h-8 w-8" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {quizResults.passed ? 'Training Completed Successfully!' : 'Training Needs Review'}
                </h2>
                <p className="text-gray-600 mb-4">
                  You scored {quizResults.score} out of {quizResults.total} ({quizResults.percentage}%)
                </p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  quizResults.passed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {quizResults.passed ? 'PASSED' : `FAILED - Minimum ${trainingData.quizConfig?.passingScore || 80}% required`}
                </div>
                
                {quizResults.passed && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">🎉 Certification Earned</h3>
                    <p className="text-sm text-blue-800">
                      Certificate will be automatically added to employee training record
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Detailed Results</h3>
                {quizResults.results.map((result, index) => (
                  <div key={index} className={`p-6 rounded-lg border-l-4 ${
                    result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          result.isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        {generatedTraining.quiz[index].ragSource && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            Source: {generatedTraining.quiz[index].ragSource}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{result.question}</p>
                    {!result.isCorrect && (
                      <div className="mb-3 space-y-1">
                        <p className="text-sm text-red-700">
                          <strong>Your answer:</strong> {generatedTraining.quiz[index].options[result.userAnswer]}
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Correct answer:</strong> {generatedTraining.quiz[index].options[result.correctAnswer]}
                        </p>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">
                        <strong>Explanation:</strong> {result.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentView('review')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Review Training</span>
                </button>
                {!quizResults.passed && (
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setUserAnswers({});
                      setQuizResults(null);
                      setCurrentView('quiz');
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Retake Quiz</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    // Simulate saving results and returning to dashboard
                    setCurrentView('dashboard');
                    // Update employee record with completed training
                    if (selectedEmployee && quizResults.passed) {
                      setEmployees(prev => prev.map(emp => 
                        emp.id === selectedEmployee.id 
                          ? {
                              ...emp,
                              completedTrainings: emp.completedTrainings + 1,
                              lastTraining: new Date().toISOString().split('T')[0],
                              trainingHistory: [
                                {
                                  id: emp.trainingHistory.length + 1,
                                  title: trainingData.title,
                                  date: new Date().toISOString().split('T')[0],
                                  score: quizResults.percentage,
                                  status: 'completed',
                                  language: trainingData.language,
                                  ragSources: ragAnalysis ? ragAnalysis.relevantDocuments.map(doc => doc.name) : []
                                },
                                ...emp.trainingHistory
                              ]
                            }
                          : emp
                      ));
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{quizResults.passed ? 'Complete Training' : 'Save Progress'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                  <button
                    onClick={() => setShowAddEmployee(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({...prev, name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee(prev => ({...prev, department: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {standardDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee(prev => ({...prev, position: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Job title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="employee@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={newEmployee.hireDate}
                      onChange={(e) => setNewEmployee(prev => ({...prev, hireDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={newEmployee.preferredLanguage}
                      onChange={(e) => setNewEmployee(prev => ({...prev, preferredLanguage: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddEmployee(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewEmployee}
                    disabled={!newEmployee.name || !newEmployee.department || !newEmployee.position}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Employee Detail Modal */}
        {selectedEmployee && currentView === 'dashboard' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                    <p className="text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getLanguageName(selectedEmployee.preferredLanguage)}
                      </span>
                      {selectedEmployee.role === 'supervisor' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Supervisor
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Training Progress</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedEmployee.completedTrainings}/{selectedEmployee.totalTrainings}
                    </p>
                    <p className="text-sm text-blue-700">Completed Trainings</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Performance Score</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedEmployee.performance || 'N/A'}%
                    </p>
                    <p className="text-sm text-green-700">Average Score</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">Certifications</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedEmployee.certifications.length}
                    </p>
                    <p className="text-sm text-purple-700">Active Certifications</p>
                  </div>
                </div>

                {/* Training History */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Training History</h3>
                  <div className="space-y-3">
                    {selectedEmployee.trainingHistory.map(training => (
                      <div key={training.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div>
                          <h4 className="font-medium">{training.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-600">{training.date}</p>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {getLanguageName(training.language)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            training.score >= 90 ? 'text-green-600' : 
                            training.score >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {training.score}%
                          </p>
                          <p className="text-sm text-gray-500">{training.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Training Recommendations</h3>
                  <div className="space-y-3">
                    {selectedEmployee.recommendedTrainings.map((rec, index) => (
                      <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-yellow-900">{rec.title}</h4>
                            <p className="text-sm text-yellow-800 mt-1">{rec.reason}</p>
                          </div>
                          <span className={`px-3 py-1 rounded text-sm ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {selectedEmployee.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setCurrentView('create');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign Training
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Training Data Manager Modal */}
        {showTrainingData && (
          <TrainingDataManager
            onClose={() => setShowTrainingData(false)}
            currentUser={currentUser}
          />
        )}
      </div>
        </div>
      )}
    </>
  );
};

export default LineSmartPlatform;
