import { useState, useCallback, useRef, useEffect } from 'react';
import { initialTrainingData, languages } from '../constants';
import { parseTrainingResponse } from '../utils';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const TRAINING_DATA_KEY = 'linesmart_training_data';
const GENERATED_TRAINING_KEY = 'linesmart_generated_training';
const DOCUMENT_CONTENT_KEY = 'linesmart_document_content';

/**
 * Extract text content from a PDF file
 */
const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return null;
  }
};

/**
 * Extract text from various document types
 */
const extractDocumentText = async (file) => {
  const fileType = file.type || file.name.split('.').pop().toLowerCase();

  if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  }

  // For text files
  if (fileType.includes('text') || file.name.endsWith('.txt')) {
    return await file.text();
  }

  // For other files, try to read as text
  try {
    return await file.text();
  } catch {
    console.warn(`Could not extract text from ${file.name}`);
    return null;
  }
};

/**
 * Custom hook for managing training generation state and API calls
 * Now with localStorage persistence to retain data across page refreshes
 */
export const useTrainingGeneration = (setupConfig, employees) => {
  // Initialize state from localStorage if available
  const [trainingData, setTrainingData] = useState(() => {
    try {
      const saved = localStorage.getItem(TRAINING_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore documents without File objects (can't serialize Files)
        return {
          ...parsed,
          documents: parsed.documents?.map(doc => ({ ...doc, file: null })) || []
        };
      }
      return initialTrainingData;
    } catch (error) {
      console.error('Error loading training data from localStorage:', error);
      return initialTrainingData;
    }
  });

  const [generatedTraining, setGeneratedTraining] = useState(() => {
    try {
      const saved = localStorage.getItem(GENERATED_TRAINING_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading generated training from localStorage:', error);
      return null;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [ragAnalysis, setRagAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [documentContent, setDocumentContent] = useState(() => {
    try {
      const saved = localStorage.getItem(DOCUMENT_CONTENT_KEY);
      return saved || '';
    } catch (error) {
      console.error('Error loading document content from localStorage:', error);
      return '';
    }
  });

  const fileInputRef = useRef(null);

  // Persist trainingData to localStorage whenever it changes
  useEffect(() => {
    try {
      // Don't store File objects, just metadata
      const dataToStore = {
        ...trainingData,
        documents: trainingData.documents?.map(doc => ({
          name: doc.name,
          size: doc.size,
          type: doc.type,
          extractedText: doc.extractedText
          // Omit file: doc.file as File objects can't be serialized
        })) || []
      };
      localStorage.setItem(TRAINING_DATA_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving training data to localStorage:', error);
    }
  }, [trainingData]);

  // Persist generatedTraining to localStorage whenever it changes
  useEffect(() => {
    try {
      if (generatedTraining) {
        localStorage.setItem(GENERATED_TRAINING_KEY, JSON.stringify(generatedTraining));
      } else {
        localStorage.removeItem(GENERATED_TRAINING_KEY);
      }
    } catch (error) {
      console.error('Error saving generated training to localStorage:', error);
    }
  }, [generatedTraining]);

  // Persist documentContent to localStorage whenever it changes
  useEffect(() => {
    try {
      if (documentContent) {
        localStorage.setItem(DOCUMENT_CONTENT_KEY, documentContent);
      } else {
        localStorage.removeItem(DOCUMENT_CONTENT_KEY);
      }
    } catch (error) {
      console.error('Error saving document content to localStorage:', error);
    }
  }, [documentContent]);

  // Clear localStorage data (called after training is saved to Firebase)
  const clearTrainingData = useCallback(() => {
    try {
      localStorage.removeItem(TRAINING_DATA_KEY);
      localStorage.removeItem(GENERATED_TRAINING_KEY);
      localStorage.removeItem(DOCUMENT_CONTENT_KEY);
      console.log('✅ Training data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing training data from localStorage:', error);
    }
  }, []);

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

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);

    // Process each file and extract text
    const processedDocs = await Promise.all(files.map(async (file) => {
      const extractedText = await extractDocumentText(file);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        extractedText: extractedText
      };
    }));

    // Update documents list
    setTrainingData(prev => ({
      ...prev,
      documents: [...prev.documents, ...processedDocs]
    }));

    // Combine all extracted text
    const allText = processedDocs
      .filter(doc => doc.extractedText)
      .map(doc => `=== ${doc.name} ===\n${doc.extractedText}`)
      .join('\n\n');

    if (allText) {
      setDocumentContent(prev => prev ? `${prev}\n\n${allText}` : allText);
      console.log('📄 Extracted text from documents:', allText.substring(0, 500) + '...');
    }
  }, []);

  const removeDocument = useCallback((index) => {
    setTrainingData(prev => {
      const removedDoc = prev.documents[index];
      const newDocs = prev.documents.filter((_, i) => i !== index);

      // Recalculate document content
      const newContent = newDocs
        .filter(doc => doc.extractedText)
        .map(doc => `=== ${doc.name} ===\n${doc.extractedText}`)
        .join('\n\n');
      setDocumentContent(newContent);

      return { ...prev, documents: newDocs };
    });
  }, []);

  const analyzeTrainingWithRAG = useCallback(async (employee, trainingType) => {
    setIsAnalyzing(true);

    try {
      // Analyze actual uploaded documents
      const uploadedDocs = trainingData.documents || [];

      if (uploadedDocs.length === 0) {
        setRagAnalysis({
          relevantDocuments: [],
          suggestedContent: ['No documents uploaded yet. Upload training materials to generate content.'],
          performanceGaps: [],
          recommendedTrainings: []
        });
        return;
      }

      // Get document names and content summary
      const docAnalysis = uploadedDocs.map(doc => ({
        name: doc.name,
        relevance: 1.0,
        hasContent: !!doc.extractedText,
        contentPreview: doc.extractedText ? doc.extractedText.substring(0, 200) + '...' : 'Content not extracted'
      }));

      // Extract key topics from document content
      const allContent = uploadedDocs
        .filter(doc => doc.extractedText)
        .map(doc => doc.extractedText)
        .join(' ');

      // Simple keyword extraction for suggested content
      const suggestedContent = [];
      if (allContent.toLowerCase().includes('safety')) {
        suggestedContent.push('Safety procedures and requirements identified in documents');
      }
      if (allContent.toLowerCase().includes('maintenance')) {
        suggestedContent.push('Maintenance procedures found in uploaded materials');
      }
      if (allContent.toLowerCase().includes('equipment') || allContent.toLowerCase().includes('machine')) {
        suggestedContent.push('Equipment operation guidelines available');
      }
      if (allContent.toLowerCase().includes('procedure') || allContent.toLowerCase().includes('protocol')) {
        suggestedContent.push('Standard operating procedures documented');
      }
      if (suggestedContent.length === 0) {
        suggestedContent.push(`Document content ready for training generation (${allContent.length} characters extracted)`);
      }

      const analysis = {
        relevantDocuments: docAnalysis,
        suggestedContent: suggestedContent,
        performanceGaps: [],
        recommendedTrainings: [
          {
            title: trainingType || trainingData.title || 'Custom Training',
            reason: `Based on ${uploadedDocs.length} uploaded document(s)`,
            priority: 'high',
            estimatedDuration: '1-2 hours',
            ragSources: uploadedDocs.map(d => d.name)
          }
        ],
        totalContentLength: allContent.length
      };

      setRagAnalysis(analysis);
      console.log('📊 Document analysis complete:', analysis);
    } catch (error) {
      console.error('Document analysis failed:', error);
      setRagAnalysis({
        relevantDocuments: [],
        suggestedContent: ['Error analyzing documents: ' + error.message],
        performanceGaps: [],
        recommendedTrainings: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [trainingData.documents, trainingData.title]);

  const createTrainingPrompt = useCallback((currentUserDepartment) => {
    const targetLanguage = languages.find(lang => lang.code === trainingData.language)?.name || 'English';
    const companyName = setupConfig?.company?.name || setupConfig?.companyName || 'Company';
    const questionCount = trainingData.quizConfig?.questionCount || 10;

    // Get all document text (from previously uploaded docs + current ones)
    const allDocText = trainingData.documents
      .filter(doc => doc.extractedText)
      .map(doc => doc.extractedText)
      .join('\n\n');

    const combinedDocContent = documentContent || allDocText;

    // Truncate if too long (keep most important content)
    const maxDocLength = 20000;
    const truncatedDocContent = combinedDocContent.length > maxDocLength
      ? combinedDocContent.substring(0, maxDocLength) + '\n\n[Document continues...]'
      : combinedDocContent;

    console.log('📄 Document content length:', combinedDocContent.length, 'characters');

    if (!truncatedDocContent || truncatedDocContent.length < 100) {
      console.warn('⚠️ No document content available for training generation');
    }

    return `You are a professional corporate training developer for ${companyName}. Create a comprehensive, enterprise-grade training module based EXCLUSIVELY on the documentation provided below.

TRAINING REQUIREMENTS:
- Title: ${trainingData.title || 'Training Module'}
- Department: ${trainingData.department || 'General'}
- Language: ${targetLanguage}
- Quiz Questions Required: ${questionCount}

SOURCE DOCUMENTATION:
====================
${truncatedDocContent || 'No documentation provided. Create a general training outline.'}
====================

CRITICAL INSTRUCTIONS:
1. Extract ALL relevant procedures, protocols, safety requirements, and best practices from the documentation above
2. Create detailed, specific training content - NOT generic placeholder text
3. Include actual steps, measurements, temperatures, times, or specifications mentioned in the documents
4. Create ${questionCount} quiz questions that test SPECIFIC knowledge from the documents
5. Each quiz question must reference actual content from the documentation
6. Include safety warnings and compliance requirements mentioned in the docs

Return ONLY valid JSON (no markdown code blocks, no extra text):
{
  "training": {
    "introduction": "Comprehensive introduction to ${trainingData.title} covering the key topics from the documentation",
    "sections": [
      {
        "title": "Section title from document",
        "content": "Detailed procedural content with specific steps, measurements, and requirements from the documentation. Include numbered steps if applicable.",
        "keyPoints": ["Specific technical point 1", "Specific technical point 2", "Specific technical point 3", "Specific technical point 4"]
      },
      {
        "title": "Another key section",
        "content": "More detailed content from documents",
        "keyPoints": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "Safety and Compliance",
        "content": "Safety requirements and compliance information from documentation",
        "keyPoints": ["Safety point 1", "Safety point 2", "Safety point 3"]
      }
    ],
    "safetyNotes": ["Specific safety requirement from docs", "Another safety requirement", "PPE or protection requirements"],
    "bestPractices": ["Best practice 1 from docs", "Best practice 2", "Best practice 3"],
    "commonMistakes": ["Common error to avoid", "Another mistake", "Third mistake to prevent"]
  },
  "quiz": [
    {
      "question": "Specific question about content from the documentation?",
      "options": ["A) Correct answer from docs", "B) Plausible but wrong", "C) Another wrong option", "D) Fourth option"],
      "correct": 0,
      "explanation": "This is correct because [reference to document content]",
      "type": "Procedures"
    }
  ]
}

Generate EXACTLY ${questionCount} quiz questions covering different aspects of the documentation.`;
  }, [trainingData, setupConfig, documentContent]);

  const callUserConfiguredAPI = useCallback(async ([modelName, config], prompt) => {
    console.log(`🤖 Calling ${modelName} API with prompt length: ${prompt.length} characters`);

    if (modelName === 'openai' && config.apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional corporate training developer. Create comprehensive, detailed training content based on provided documentation. Always return valid JSON only, no markdown.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      const data = await response.json();
      console.log('✅ OpenAI response received, parsing...');
      return parseTrainingResponse(data.choices[0].message.content);
    }

    if (modelName === 'anthropic' && config.apiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-sonnet-20240229',
          system: 'You are a professional corporate training developer. Create comprehensive, detailed training content based on provided documentation. Always return valid JSON only, no markdown.',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      const data = await response.json();
      console.log('✅ Anthropic response received, parsing...');
      return parseTrainingResponse(data.content[0].text);
    }

    throw new Error(`Model ${modelName} not configured with API key`);
  }, []);

  const callFreeLlamaAPI = useCallback(async (prompt) => {
    console.log('🦙 Using free LLaMA API as fallback (limited capabilities)...');

    // Truncate prompt for LLaMA which has limited context
    const truncatedPrompt = prompt.length > 8000 ? prompt.substring(0, 8000) + '\n\n[Content truncated. Generate training based on the content above.]' : prompt;

    const response = await fetch('https://chatterfix-llama-api-650169261019.us-central1.run.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [{ role: 'user', content: truncatedPrompt }],
        max_tokens: 3000,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`Free LLaMA API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ LLaMA response received, parsing...');
    return parseTrainingResponse(data.choices[0].message.content);
  }, []);

  // Call backend API for training generation
  const callBackendAPI = useCallback(async (prompt, docContent) => {
    // Use the correct API URL - prioritize the known working URL
    const apiUrls = [
      'https://linesmart-api-650169261019.us-central1.run.app',
      process.env.REACT_APP_API_URL
    ].filter(Boolean);

    // Remove duplicates
    const uniqueUrls = [...new Set(apiUrls)];

    console.log('🔧 Environment API URL:', process.env.REACT_APP_API_URL || 'NOT SET');
    console.log('🔧 Will try URLs:', uniqueUrls);

    let lastError = null;

    for (const baseUrl of uniqueUrls) {
      try {
        const apiUrl = `${baseUrl}/api/ai/generate-training`;

        console.log('🔌 Trying backend API at:', apiUrl);
        console.log('📄 Document content length:', docContent?.length || 0, 'characters');
        console.log('📝 Prompt length:', prompt?.length || 0, 'characters');

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            context: {
              documentContent: docContent,
              company: setupConfig?.company?.name || setupConfig?.companyName,
              department: trainingData.department
            },
            options: {
              questionCount: trainingData.quizConfig?.questionCount || 10,
              maxTokens: 4000
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('✅ Backend API response received:', result.success ? 'Success' : 'Failed');

        if (result.success && result.data) {
          // The backend now returns parsed training data directly
          return result.data;
        }
        throw new Error('Invalid response structure from backend');
      } catch (error) {
        console.log(`❌ API call to ${baseUrl} failed:`, error.message);
        lastError = error;
      }
    }

    throw lastError || new Error('All backend API attempts failed');
  }, [setupConfig, trainingData.department, trainingData.quizConfig?.questionCount]);

  const generateTrainingWithAPI = useCallback(async (prompt) => {
    // Get document content
    const allDocText = trainingData.documents
      .filter(doc => doc.extractedText)
      .map(doc => doc.extractedText)
      .join('\n\n');
    const docContent = documentContent || allDocText;

    // First try backend API (has server-side API keys)
    try {
      return await callBackendAPI(prompt, docContent);
    } catch (backendError) {
      console.log('Backend API failed:', backendError.message);
    }

    // Then try user-configured API keys
    const enabledModels = Object.entries(setupConfig?.aiModels?.configs || {}).filter(([key, config]) =>
      config?.apiKey && key !== 'llama'
    );

    if (enabledModels.length > 0) {
      try {
        return await callUserConfiguredAPI(enabledModels[0], prompt);
      } catch (error) {
        console.log('User API failed:', error.message);
      }
    }

    // Finally fall back to free LLaMA
    console.log('⚠️ Falling back to free LLaMA API (limited capabilities)');
    return await callFreeLlamaAPI(prompt);
  }, [setupConfig, trainingData.documents, documentContent, callBackendAPI, callUserConfiguredAPI, callFreeLlamaAPI]);

  const generateMockTraining = useCallback((currentUserDepartment) => {
    const isSpanish = trainingData.language === 'es';
    const companyName = setupConfig?.company?.name || setupConfig?.companyName || 'Company';
    const uploadedDocs = trainingData.documents || [];
    const hasDocuments = uploadedDocs.some(doc => doc.extractedText);

    // If we have document content, create a better fallback
    if (hasDocuments) {
      const docContent = uploadedDocs
        .filter(doc => doc.extractedText)
        .map(doc => doc.extractedText)
        .join('\n');

      // Extract some content snippets for the training
      const contentSnippets = docContent.substring(0, 2000).split('\n').filter(line => line.trim().length > 20);

      return {
        training: {
          introduction: `Welcome to the ${trainingData.title} training module. This training is based on your uploaded documentation and covers key procedures and requirements.`,
          sections: [
            {
              title: "Overview from Documentation",
              content: `This training is generated from your uploaded documents: ${uploadedDocs.map(d => d.name).join(', ')}. The content below summarizes key information from these materials.`,
              keyPoints: contentSnippets.slice(0, 5).map(s => s.substring(0, 100))
            },
            {
              title: "Key Procedures",
              content: contentSnippets.slice(5, 10).join(' ') || "Review the uploaded documentation for detailed procedures.",
              keyPoints: [
                "Follow all documented procedures",
                "Refer to source materials for specific requirements",
                "Contact supervisor for clarification when needed"
              ]
            }
          ],
          safetyNotes: [
            "Always follow safety procedures outlined in documentation",
            "Report any safety concerns immediately"
          ],
          bestPractices: [
            "Review documentation before starting tasks",
            "Keep training materials accessible for reference"
          ],
          commonMistakes: [
            "Skipping documented steps",
            "Not referring to updated procedures"
          ]
        },
        quiz: [
          {
            question: "What should you always do before starting a new task?",
            options: ["A) Review the documented procedures", "B) Skip to the practical work", "C) Ask a coworker what to do", "D) Use your best judgment"],
            correct: 0,
            explanation: "Always review documented procedures before starting any task to ensure compliance and safety.",
            type: "General Knowledge"
          }
        ],
        ragAnalysis: ragAnalysis,
        note: "Training generated from uploaded documents. For better results, ensure an AI API key is configured."
      };
    }

    // Original fallback for when no documents are uploaded
    return {
      training: {
        introduction: isSpanish ?
          `Bienvenido al módulo de capacitación ${trainingData.title} para ${companyName}.` :
          `Welcome to the ${trainingData.title} training module for ${companyName}. Please upload training documents to generate customized content.`,
        sections: [
          {
            title: isSpanish ? "Contenido Pendiente" : "Content Pending",
            content: isSpanish ?
              `Por favor suba documentos de capacitación para generar contenido personalizado.` :
              `Please upload training documents (PDF, TXT) to generate comprehensive training content based on your materials.`,
            keyPoints: isSpanish ? [
              "Suba manuales de la empresa",
              "Incluya procedimientos de seguridad",
              "Agregue guías de operación"
            ] : [
              "Upload company manuals",
              "Include safety procedures",
              "Add operation guides"
            ]
          }
        ],
        safetyNotes: [isSpanish ? "Siempre siga los protocolos de seguridad" : "Always follow safety protocols"],
        bestPractices: [isSpanish ? "Revise la documentación regularmente" : "Review documentation regularly"],
        commonMistakes: [isSpanish ? "No revisar procedimientos actualizados" : "Not reviewing updated procedures"]
      },
      quiz: [],
      ragAnalysis: ragAnalysis
    };
  }, [trainingData, setupConfig, ragAnalysis]);

  const generateTraining = useCallback(async (currentUserDepartment, setCurrentView) => {
    setIsGenerating(true);
    console.log('🚀 Starting training generation...');
    console.log('📋 Training data:', {
      title: trainingData.title,
      department: trainingData.department,
      type: trainingData.trainingType,
      documentsCount: trainingData.documents?.length || 0
    });

    try {
      const prompt = createTrainingPrompt(currentUserDepartment);
      console.log('📝 Generated prompt length:', prompt.length);

      let apiResponse = null;
      let apiError = null;

      try {
        console.log('🔌 Calling API...');
        apiResponse = await generateTrainingWithAPI(prompt);
        console.log('✅ API response received:', apiResponse ? 'Success' : 'Empty');
      } catch (error) {
        apiError = error;
        console.error('❌ API generation failed:', error.message);
      }

      if (apiResponse && apiResponse.training) {
        console.log('✅ Using API-generated training');
        setGeneratedTraining(apiResponse);
        setCurrentView('review');
      } else if (apiError) {
        // Show error to user instead of silently falling back
        const errorMsg = `Training generation failed: ${apiError.message}\n\nPlease check:\n1. Your internet connection\n2. The API service status\n\nTry again or contact support.`;
        console.error(errorMsg);
        alert(errorMsg);
      } else {
        // Only use mock data if explicitly requested or no API available
        console.log('⚠️ No API response, using placeholder training');
        const mockResponse = generateMockTraining(currentUserDepartment);
        setGeneratedTraining(mockResponse);
        setCurrentView('review');
      }
    } catch (error) {
      console.error('❌ Training generation error:', error);
      alert(`Error generating training: ${error.message}\n\nPlease try again.`);
    } finally {
      setIsGenerating(false);
    }
  }, [createTrainingPrompt, generateTrainingWithAPI, generateMockTraining, trainingData]);

  const resetTrainingData = useCallback(() => {
    setTrainingData(initialTrainingData);
    setGeneratedTraining(null);
    setRagAnalysis(null);
    setDocumentContent('');
    clearTrainingData();
  }, [clearTrainingData]);

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
    documentContent,
    fileInputRef,
    handleFileUpload,
    removeDocument,
    analyzeTrainingWithRAG,
    generateTraining,
    resetTrainingData,
    clearTrainingData,
    getEnabledModels
  };
};

export default useTrainingGeneration;
