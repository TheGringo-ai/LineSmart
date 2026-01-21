import { useState, useCallback, useRef } from 'react';
import { initialTrainingData, languages } from '../constants';
import { parseTrainingResponse } from '../utils';

/**
 * Custom hook for managing training generation state and API calls
 */
export const useTrainingGeneration = (setupConfig, employees) => {
  const [trainingData, setTrainingData] = useState(initialTrainingData);
  const [generatedTraining, setGeneratedTraining] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragAnalysis, setRagAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const updateTrainingData = useCallback((field, value) => {
    setTrainingData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateQuizConfig = useCallback((field, value) => {
    setTrainingData(prev => ({
      ...prev,
      quizConfig: { ...prev.quizConfig, [field]: value }
    }));
  }, []);

  const toggleAssignedEmployee = useCallback((employeeId, checked) => {
    setTrainingData(prev => ({
      ...prev,
      assignedEmployees: checked
        ? [...prev.assignedEmployees, employeeId]
        : prev.assignedEmployees.filter(id => id !== employeeId)
    }));
  }, []);

  const handleFileUpload = useCallback((e) => {
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
  }, []);

  const removeDocument = useCallback((index) => {
    setTrainingData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  }, []);

  const analyzeTrainingWithRAG = useCallback(async (employee, trainingType) => {
    setIsAnalyzing(true);

    try {
      // Mock RAG analysis - replace with actual API call
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
  }, []);

  const createTrainingPrompt = useCallback((currentUserDepartment) => {
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
  }, [trainingData, employees, setupConfig, ragAnalysis]);

  const callUserConfiguredAPI = useCallback(async ([modelName, config], prompt) => {
    if (modelName === 'openai' && config.apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
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
  }, []);

  const callFreeLlamaAPI = useCallback(async (prompt) => {
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
  }, []);

  const generateTrainingWithAPI = useCallback(async (prompt) => {
    const enabledModels = Object.entries(setupConfig.aiModels.configs).filter(([key, config]) =>
      config.apiKey && key !== 'llama'
    );

    if (enabledModels.length > 0) {
      try {
        return await callUserConfiguredAPI(enabledModels[0], prompt);
      } catch (error) {
        console.log('User API failed, falling back to free LLaMA:', error.message);
      }
    }

    return await callFreeLlamaAPI(prompt);
  }, [setupConfig.aiModels.configs, callUserConfiguredAPI, callFreeLlamaAPI]);

  const generateMockTraining = useCallback((currentUserDepartment) => {
    const isSpanish = trainingData.language === 'es';
    const assignedEmployeeNames = trainingData.trainingScope === 'individual'
      ? trainingData.assignedEmployees.map(id => employees.find(emp => emp.id === id)?.name).join(', ')
      : trainingData.trainingScope === 'department'
        ? `All ${currentUserDepartment} department employees`
        : 'All company employees';

    return {
      training: {
        introduction: isSpanish ?
          `Bienvenido al módulo de capacitación ${trainingData.title} para ${setupConfig.company.name}. Esta capacitación ha sido personalizada utilizando los procedimientos y políticas específicos de nuestra empresa.` :
          `Welcome to the ${trainingData.title} training module for ${setupConfig.company.name}. This training has been customized using our company's specific procedures and policies.`,
        sections: [
          {
            title: isSpanish ? "Procedimientos Específicos de la Empresa" : "Company-Specific Procedures",
            content: isSpanish ?
              `Esta sección se basa en nuestros procedimientos y políticas más recientes de la empresa.` :
              `This section is based on our latest company procedures and policies.`,
            keyPoints: isSpanish ? [
              "Seguir protocolos específicos de la empresa",
              "Aplicar requisitos de seguridad específicos del departamento",
              "Utilizar herramientas y métodos aprobados por la empresa"
            ] : [
              "Follow company-specific protocols",
              "Apply department-specific safety requirements",
              "Utilize company-approved tools and methods"
            ],
            ragSources: ragAnalysis ? ragAnalysis.relevantDocuments.map(doc => doc.name) : []
          }
        ],
        safetyNotes: isSpanish ? [
          `Seguir todos los protocolos de seguridad de ${setupConfig.company.name}`,
          "Cumplir con los requisitos específicos de EPP"
        ] : [
          `Follow all ${setupConfig.company.name} safety protocols`,
          "Comply with company-specific PPE requirements"
        ],
        bestPractices: isSpanish ? [
          "Utilizar mejores prácticas aprobadas por la empresa"
        ] : [
          "Utilize company-approved best practices"
        ],
        commonMistakes: isSpanish ? [
          "Desviarse de los procedimientos establecidos"
        ] : [
          "Deviating from established procedures"
        ]
      },
      quiz: (isSpanish ? [
        {
          question: `Según el manual de seguridad de ${setupConfig.company.name}, ¿cuál es el primer paso requerido?`,
          options: [
            "A) Revisar las pautas generales",
            "B) Completar la lista de verificación pre-operacional",
            "C) Pedir permiso al supervisor",
            "D) Revisar los procedimientos estándar"
          ],
          correct: 1,
          explanation: `El manual de ${setupConfig.company.name} requiere completar la lista de verificación.`,
          type: "Política de la Empresa",
          ragSource: "Manual_Seguridad.pdf"
        }
      ] : [
        {
          question: `According to ${setupConfig.company.name} safety manual, what is the first required step?`,
          options: [
            "A) Check general guidelines",
            "B) Complete pre-operation checklist",
            "C) Ask supervisor for permission",
            "D) Review standard procedures"
          ],
          correct: 1,
          explanation: `${setupConfig.company.name}'s manual requires completing the checklist.`,
          type: "Company Policy",
          ragSource: "Safety_Manual.pdf"
        }
      ]).slice(0, trainingData.quizConfig?.questionCount || 5),
      ragAnalysis: ragAnalysis
    };
  }, [trainingData, employees, setupConfig, ragAnalysis]);

  const generateTraining = useCallback(async (currentUserDepartment, setCurrentView) => {
    setIsGenerating(true);

    try {
      const prompt = createTrainingPrompt(currentUserDepartment);

      let apiResponse = null;
      try {
        apiResponse = await generateTrainingWithAPI(prompt);
      } catch (error) {
        console.log('API generation failed, using enhanced mock data:', error.message);
      }

      const response = apiResponse || generateMockTraining(currentUserDepartment);
      setGeneratedTraining(response);
      setCurrentView('review');
    } catch (error) {
      alert('Error generating training. Please check your configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [createTrainingPrompt, generateTrainingWithAPI, generateMockTraining]);

  const resetTrainingData = useCallback(() => {
    setTrainingData(initialTrainingData);
    setGeneratedTraining(null);
    setRagAnalysis(null);
  }, []);

  const getEnabledModels = useCallback(() => {
    return Object.entries(setupConfig.aiModels.configs).filter(([key, config]) =>
      config.apiKey && key !== 'llama'
    );
  }, [setupConfig.aiModels.configs]);

  return {
    trainingData,
    setTrainingData,
    updateTrainingData,
    updateQuizConfig,
    toggleAssignedEmployee,
    generatedTraining,
    setGeneratedTraining,
    isGenerating,
    ragAnalysis,
    isAnalyzing,
    fileInputRef,
    handleFileUpload,
    removeDocument,
    analyzeTrainingWithRAG,
    generateTraining,
    resetTrainingData,
    getEnabledModels
  };
};

export default useTrainingGeneration;
