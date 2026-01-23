// LineSmart Platform Constants and Configuration Data

export const industries = [
  'Manufacturing', 'Food & Beverage', 'Pharmaceutical', 'Automotive',
  'Aerospace', 'Chemical', 'Construction', 'Energy', 'Healthcare', 'Technology'
];

export const companySizes = [
  '1-50 employees', '51-200 employees', '201-1000 employees',
  '1001-5000 employees', '5000+ employees'
];

export const standardDepartments = [
  'Production', 'Maintenance', 'Quality Assurance', 'Safety', 'Warehouse',
  'Sanitation', 'Management', 'HR', 'Engineering', 'R&D', 'Logistics'
];

export const safetyRequirements = [
  'OSHA Compliance', 'ISO 45001', 'SQF Food Safety', 'HACCP', 'GMP',
  'FDA Regulations', 'Environmental Health', 'Fire Safety', 'Chemical Safety'
];

export const trainingTypes = [
  'Safety Procedures', 'Equipment Quality', 'SQF Compliance', 'Disciplinary Guidelines',
  'Technical Operations', 'Emergency Procedures', 'Quality Control', 'Maintenance Protocols',
  'Food Safety', 'Environmental Health', 'Onboarding Orientation', 'Leadership Development'
];

export const languages = [
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

export const aiModels = [
  { id: 'free', name: 'LineSmart Free Tier', description: 'Free AI-powered training (limited to 50 generations/month)', isFree: true, badge: 'FREE' },
  { id: 'openai', name: 'OpenAI GPT', description: 'GPT-3.5/GPT-4 models - bring your own API key for unlimited use' },
  { id: 'claude', name: 'Anthropic Claude', description: 'Claude 3 Sonnet/Opus - bring your own API key' },
  { id: 'gemini', name: 'Google Gemini', description: 'Gemini Pro for multimodal training - bring your own API key' },
  { id: 'llama', name: 'Local Llama', description: 'Run Llama locally with Ollama - free & private, requires local setup' },
  { id: 'custom', name: 'Custom Model', description: 'Connect your own fine-tuned or enterprise model' }
];

// Initial state configurations
export const initialSetupConfig = {
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
    primary: 'free',
    secondary: '',
    configs: {
      free: { model: 'gpt-4o-mini', usesBackend: true },
      openai: { apiKey: '', model: 'gpt-4o-mini', endpoint: '' },
      claude: { apiKey: '', model: 'claude-3-sonnet', endpoint: '' },
      gemini: { apiKey: '', model: 'gemini-pro', endpoint: '' },
      llama: { apiKey: '', model: 'llama-2-70b', endpoint: 'http://localhost:11434' },
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
    trainingDataSettings: {
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
};

export const initialTrainingData = {
  title: '',
  department: '',
  trainingType: '',
  description: '',
  objectives: '',
  documents: [],
  assignedEmployees: [],
  dueDate: '',
  sourceDocs: [],
  aiModel: 'primary',
  language: 'en',
  trainingScope: 'individual',
  supervisorId: null,
  quizConfig: {
    questionCount: 5,
    passingScore: 80,
    style: 'mixed'
  }
};

export const initialNewEmployee = {
  name: '',
  department: '',
  position: '',
  email: '',
  hireDate: '',
  directSupervisor: '',
  preferredLanguage: 'en'
};

export const sampleEmployees = [
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
      { id: 1, title: 'Lockout/Tagout Procedures', date: '2024-07-20', score: 95, status: 'completed', language: 'en', sourceDocs: ['Manual_LOTO_v2.pdf', 'Safety_Protocol_2024.docx'] },
      { id: 2, title: 'Equipment Maintenance', date: '2024-07-15', score: 88, status: 'completed', language: 'en', sourceDocs: ['Maintenance_Guide.pdf'] },
      { id: 3, title: 'Safety Protocols', date: '2024-07-10', score: 92, status: 'completed', language: 'en', sourceDocs: ['Company_Safety_Manual.pdf', 'OSHA_Guidelines.pdf'] }
    ],
    recommendedTrainings: [
      { title: 'Advanced Hydraulic Systems', reason: 'Based on recent equipment updates and internal documentation analysis', priority: 'high', sourceDocs: ['Hydraulic_Manual_2024.pdf'] },
      { title: 'Emergency Response', reason: 'Due for annual recertification per company policy', priority: 'medium', sourceDocs: ['Emergency_Procedures.docx'] }
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
      { id: 4, title: 'SQF Compliance', date: '2024-07-18', score: 82, status: 'completed', language: 'en', sourceDocs: ['SQF_Manual.pdf'] },
      { id: 5, title: 'Quality Control', date: '2024-07-12', score: 88, status: 'completed', language: 'en', sourceDocs: ['Quality_Guidelines.pdf'] }
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
      { id: 6, title: 'Hazard Communication', date: '2024-07-22', score: 98, status: 'completed', language: 'en', sourceDocs: ['OSHA_Standards.pdf'] },
      { id: 7, title: 'Incident Investigation', date: '2024-07-17', score: 94, status: 'completed', language: 'en', sourceDocs: ['Investigation_Manual.pdf'] }
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
      { id: 8, title: 'Orientación de Seguridad', date: '2024-07-10', score: 85, status: 'completed', language: 'es', sourceDocs: ['Manual_Seguridad_ES.pdf'] },
      { id: 9, title: 'Procedimientos de Calidad', date: '2024-06-20', score: 82, status: 'completed', language: 'es', sourceDocs: ['Calidad_Manual_ES.pdf'] }
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
      { id: 10, title: 'Leadership Development', date: '2024-07-25', score: 96, status: 'completed', language: 'en', sourceDocs: ['Leadership_Guide.pdf'] }
    ],
    recommendedTrainings: [
      { title: 'Advanced Lean Manufacturing', reason: 'Process improvement initiative', priority: 'medium' }
    ]
  }
];

// Setup wizard steps - simplified flow for quick start
export const setupSteps = ['welcome', 'company', 'ai-models', 'complete'];

// Full setup steps (for advanced users)
export const advancedSetupSteps = ['welcome', 'company', 'ai-models', 'data-source', 'onboarding', 'complete'];

// User roles for access control
export const userRoles = {
  admin: {
    name: 'Administrator',
    description: 'Full access to all company data and settings',
    level: 1,
    canViewAllEmployees: true,
    canViewAllDepartments: true,
    canManageUsers: true,
    canInviteUsers: true,
    canManageSettings: true,
    canCreateTraining: true,
    canAssignTraining: true,
    canApproveTraining: true,
    canDeleteTraining: true,
    canViewReports: true,
    canExportData: true
  },
  manager: {
    name: 'Manager',
    description: 'Department management and training approval',
    level: 2,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: true,
    canManageSettings: false,
    canCreateTraining: true,
    canAssignTraining: true,
    canApproveTraining: true,
    canDeleteTraining: false,
    canViewReports: true,
    canExportData: true
  },
  supervisor: {
    name: 'Supervisor',
    description: 'Team oversight and training creation',
    level: 3,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: false,
    canManageSettings: false,
    canCreateTraining: true,
    canAssignTraining: true,
    canApproveTraining: false,
    canDeleteTraining: false,
    canViewReports: true,
    canExportData: false
  },
  lead: {
    name: 'Team Lead',
    description: 'Lead a team and assign training',
    level: 4,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: false,
    canManageSettings: false,
    canCreateTraining: false,
    canAssignTraining: true,
    canApproveTraining: false,
    canDeleteTraining: false,
    canViewReports: true,
    canExportData: false
  },
  technician: {
    name: 'Technician',
    description: 'Technical role with own training access',
    level: 5,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: false,
    canManageSettings: false,
    canCreateTraining: false,
    canAssignTraining: false,
    canApproveTraining: false,
    canDeleteTraining: false,
    canViewReports: false,
    canExportData: false
  },
  operator: {
    name: 'Operator',
    description: 'Production/operations role with own training access',
    level: 5,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: false,
    canManageSettings: false,
    canCreateTraining: false,
    canAssignTraining: false,
    canApproveTraining: false,
    canDeleteTraining: false,
    canViewReports: false,
    canExportData: false
  },
  employee: {
    name: 'Employee',
    description: 'General employee with own training access',
    level: 6,
    canViewAllEmployees: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canInviteUsers: false,
    canManageSettings: false,
    canCreateTraining: false,
    canAssignTraining: false,
    canApproveTraining: false,
    canDeleteTraining: false,
    canViewReports: false,
    canExportData: false
  }
};

// Position/Job titles by department
export const positionsByDepartment = {
  Production: ['Line Operator', 'Machine Operator', 'Production Lead', 'Production Supervisor', 'Production Manager'],
  Maintenance: ['Maintenance Technician', 'Electrician', 'Mechanic', 'Maintenance Lead', 'Maintenance Supervisor', 'Maintenance Manager'],
  'Quality Assurance': ['QA Inspector', 'QA Technician', 'QA Lead', 'QA Supervisor', 'QA Manager'],
  Safety: ['Safety Coordinator', 'Safety Specialist', 'Safety Supervisor', 'Safety Manager', 'EHS Manager'],
  Warehouse: ['Warehouse Associate', 'Forklift Operator', 'Shipping Clerk', 'Warehouse Lead', 'Warehouse Supervisor', 'Warehouse Manager'],
  Sanitation: ['Sanitation Worker', 'Sanitation Lead', 'Sanitation Supervisor', 'Sanitation Manager'],
  Management: ['Director', 'Plant Manager', 'Operations Manager', 'General Manager'],
  HR: ['HR Coordinator', 'HR Specialist', 'HR Manager', 'HR Director'],
  Engineering: ['Process Engineer', 'Manufacturing Engineer', 'Engineering Manager'],
  'R&D': ['Research Scientist', 'R&D Technician', 'R&D Manager'],
  Logistics: ['Logistics Coordinator', 'Logistics Analyst', 'Logistics Manager']
};

// Employee ID configuration
export const employeeIdConfig = {
  prefix: 'EMP',
  digits: 4,
  format: 'PREFIX-NUMBER' // e.g., EMP-0001
};

// Invitation status
export const inviteStatus = {
  pending: { label: 'Pending', color: 'yellow' },
  accepted: { label: 'Accepted', color: 'green' },
  expired: { label: 'Expired', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'gray' }
};

// Onboarding status
export const onboardingStatus = {
  not_started: { label: 'Not Started', color: 'gray' },
  in_progress: { label: 'In Progress', color: 'blue' },
  completed: { label: 'Completed', color: 'green' }
};
