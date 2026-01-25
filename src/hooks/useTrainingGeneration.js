import { useState, useCallback, useRef } from 'react';
import { initialTrainingData, languages } from '../constants';
import { parseTrainingResponse } from '../utils';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use unpkg for reliable version matching
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extract text AND images from a PDF file for comprehensive training
 * Returns structured data with page references and image locations
 */
const extractTextFromPDF = async (file) => {
  try {
    console.log('📄 Starting comprehensive PDF extraction for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 Got array buffer, size:', arrayBuffer.byteLength);

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('📄 PDF loaded, pages:', pdf.numPages);

    let fullText = '';
    let figureCount = 0;
    const pageInfo = [];

    // Add document header with reference info
    fullText += `\n=== DOCUMENT: ${file.name} (${pdf.numPages} pages) ===\n`;
    fullText += `[Reference this document for all figures, diagrams, and images mentioned below]\n\n`;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      // Extract text
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');

      // Mark page clearly for AI reference
      fullText += `\n======== PAGE ${i} of ${pdf.numPages} ========\n`;
      fullText += pageText + '\n';

      // Check for figures/images and note their locations
      try {
        const operatorList = await page.getOperatorList();
        const imgCount = operatorList.fnArray.filter(fn =>
          fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject
        ).length;

        if (imgCount > 0) {
          figureCount += imgCount;
          console.log(`🖼️ Page ${i}: found ${imgCount} figures/diagrams`);
          fullText += `\n[📷 PAGE ${i} CONTAINS ${imgCount} FIGURE(S)/DIAGRAM(S) - Reference: "${file.name}", Page ${i}]\n`;

          pageInfo.push({
            page: i,
            figures: imgCount,
            reference: `See ${file.name}, Page ${i}`
          });
        }
      } catch (imgError) {
        console.log(`📄 Page ${i}: image detection skipped`);
      }

      console.log(`📄 Page ${i}: extracted ${pageText.length} characters`);
    }

    // Add summary of figures at the end
    if (figureCount > 0) {
      fullText += `\n\n=== FIGURE REFERENCE SUMMARY ===\n`;
      fullText += `Total Figures/Diagrams in document: ${figureCount}\n`;
      pageInfo.forEach(info => {
        fullText += `- Page ${info.page}: ${info.figures} figure(s)\n`;
      });
      fullText += `\nIMPORTANT: When referencing procedures that have diagrams, include "(See ${file.name}, Page X)" in the training content.\n`;
    }

    console.log('📄 Total extracted:', fullText.trim().length, 'characters');
    console.log('🖼️ Total figures found:', figureCount, 'across', pageInfo.length, 'pages');

    return fullText.trim();
  } catch (error) {
    console.error('❌ Error extracting PDF content:', error);
    console.error('❌ Error details:', error.message, error.stack);
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
 */
export const useTrainingGeneration = (setupConfig, employees) => {
  const [trainingData, setTrainingData] = useState(initialTrainingData);
  const [generatedTraining, setGeneratedTraining] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragAnalysis, setRagAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
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

    // NO LIMITS - send ALL document content to AI for comprehensive extraction
    console.log('📄 Document content length:', combinedDocContent.length, 'characters (no limit - sending all)');

    if (!combinedDocContent || combinedDocContent.length < 100) {
      console.warn('⚠️ No document content available for training generation');
    }

    return `You are a senior industrial training engineer creating COMPREHENSIVE operator certification training for ${companyName}.

Your task: Extract EVERY technical detail, specification, procedure, and safety requirement from the complete documentation below. Leave NOTHING out.

TRAINING REQUIREMENTS:
- Title: ${trainingData.title || 'Training Module'}
- Department: ${trainingData.department || 'General'}
- Language: ${targetLanguage}
- Quiz Questions: ${questionCount}

COMPLETE SOURCE DOCUMENTATION:
===============================
${combinedDocContent || 'No documentation provided.'}
===============================

MANDATORY EXTRACTION REQUIREMENTS:
1. Extract EVERY measurement, temperature, pressure, timing, voltage, amperage specification
2. Include ALL model numbers, part numbers, serial number locations, component names
3. Provide COMPLETE numbered step-by-step procedures for ALL operations
4. List EVERY safety warning, caution, danger statement, and required PPE
5. Include ALL maintenance intervals (daily, weekly, monthly, hourly)
6. Extract troubleshooting tables, error codes, and diagnostic procedures
7. Reference figure numbers, diagram descriptions, and visual indicators
8. Include electrical schematics info, wiring details, and connection points
9. List ALL required tools, materials, lubricants, and replacement parts
10. Extract quality checkpoints, acceptance criteria, and inspection requirements
11. Include installation requirements, leveling specs, utility connections
12. Note any referenced standards (OSHA, NFPA, NEC, manufacturer codes)

**MANDATORY PAGE REFERENCES - YOU MUST DO THIS:**
The source documentation above contains "PAGE X of Y" markers. You MUST include page references in your output.

FOR EVERY SECTION, YOU MUST:
1. Add "(See Page X)" at the end of each procedure description
2. Add "(See Page X)" after specifications that have diagrams
3. Include "See Page X" in keyPoints for visual procedures
4. Format: "(See Page 5)" or "(See Pages 12-15)" or "(See Figure 3 on Page 8)"

EXAMPLE OUTPUT WITH PAGE REFERENCES:
- "Step 1: Turn main power switch to ON position. Step 2: Press JOG button to verify operation. (See Page 12 for control panel layout)"
- "Electrical: 460 VAC, 3 phase, 20 AMP (See Page 5 for wiring diagram)"
- keyPoints: ["Check vacuum pump oil level (See Page 23)", "Verify seal bar alignment (See Page 18)"]

DO NOT SKIP PAGE REFERENCES. Every procedure and specification MUST reference its source page number.

CREATE 8-10 DETAILED SECTIONS:
- Machine Specifications (ALL technical data)
- Installation Requirements
- Pre-Operation Safety Checklist
- Start-Up Procedure (complete steps)
- Operating Procedures
- Shutdown Procedure
- Daily/Weekly Maintenance
- Periodic Maintenance (hours-based)
- Troubleshooting Guide
- Emergency Procedures

Return ONLY valid JSON:
{
  "training": {
    "introduction": "Complete operator certification training for [equipment model] covering installation, operation, maintenance, and safety per manufacturer specifications. (See Page 1 for equipment overview)",
    "sections": [
      {
        "title": "Machine Specifications",
        "content": "Model: [exact model]. Dimensions: Height [X], Width [Y], Length [Z]. (See Page 3 for dimensional drawing). Electrical: [voltage/phase/amps] (See Page 5 for wiring diagram). Capacity: [exact]. Weight: [exact].",
        "keyPoints": ["Dimensions: H x W x L (See Page 3)", "Electrical specs (See Page 5)", "Weight capacity (See Page 4)", "Operating parameters (See Page 6)"]
      },
      {
        "title": "Installation Requirements",
        "content": "Floor must support [weight]. Level machine using jack bolts. (See Page 8 for leveling procedure). Utility connections: [specs] (See Page 9 for connection diagram).",
        "keyPoints": ["Floor requirements (See Page 7)", "Leveling procedure (See Page 8)", "Electrical connections (See Page 9)", "Air/water hookups (See Page 10)"]
      },
      {
        "title": "Safety Requirements & PPE",
        "content": "Required PPE: [items]. Safety devices include [list]. (See Page 12 for safety device locations). Lockout/tagout procedure on Page 14.",
        "keyPoints": ["Required PPE (See Page 11)", "Safety switch locations (See Page 12)", "Lockout procedure (See Page 14)", "Emergency stops (See Page 13)"]
      },
      {
        "title": "Pre-Operation Checklist",
        "content": "Before starting: 1) Check [item] 2) Verify [item] 3) Inspect [item]. (See Page 16 for complete checklist with diagrams).",
        "keyPoints": ["Visual inspection points (See Page 16)", "Fluid level checks (See Page 17)", "Safety device verification (See Page 18)", "Control panel check (See Page 19)"]
      },
      {
        "title": "Start-Up Procedure",
        "content": "Step 1: [action]. Step 2: [action]. Step 3: [action]. (See Page 20 for control panel diagram). Step 4: [action]. (See Page 21 for startup sequence).",
        "keyPoints": ["Power-on sequence (See Page 20)", "Control settings (See Page 21)", "Verification steps (See Page 22)", "Normal indicators (See Page 23)"]
      },
      {
        "title": "Normal Operation",
        "content": "Operating cycle: [description]. Vacuum level: [spec]. Seal time: [spec]. (See Page 25 for operating parameters). Product loading procedure on Page 26.",
        "keyPoints": ["Vacuum settings (See Page 25)", "Seal parameters (See Page 26)", "Cycle monitoring (See Page 27)", "Quality checks (See Page 28)"]
      },
      {
        "title": "Shutdown Procedure",
        "content": "Step 1: [action]. Step 2: [action]. (See Page 30 for shutdown sequence). Cleaning procedure on Page 31.",
        "keyPoints": ["Shutdown sequence (See Page 30)", "Cleaning (See Page 31)", "Securing equipment (See Page 32)", "End-of-shift checklist (See Page 33)"]
      },
      {
        "title": "Preventive Maintenance Schedule",
        "content": "Daily: [tasks] (See Page 35). Weekly: [tasks] (See Page 36). Every [X] hours: [tasks] (See Page 37). Lubrication diagram on Page 38.",
        "keyPoints": ["Daily maintenance (See Page 35)", "Weekly inspection (See Page 36)", "Hour-based service (See Page 37)", "Lubrication points (See Page 38)"]
      },
      {
        "title": "Troubleshooting Guide",
        "content": "Problem: [symptom] - Solution: [fix] (See Page 40). Error codes on Page 41. Diagnostic flowchart on Page 42.",
        "keyPoints": ["Common problems (See Page 40)", "Error codes (See Page 41)", "Diagnostics (See Page 42)", "Service contacts (See Page 43)"]
      },
      {
        "title": "Emergency Procedures",
        "content": "Emergency stop locations on Page 45. Emergency shutdown procedure on Page 46. First aid on Page 47.",
        "keyPoints": ["E-stop locations (See Page 45)", "Emergency shutdown (See Page 46)", "First aid (See Page 47)", "Emergency contacts (See Page 48)"]
      }
    ],
    "safetyNotes": ["Required PPE (See Page 11)", "Lockout/tagout procedure (See Page 14)", "Emergency stops (See Page 45)", "Safety warnings (See Page 12)"],
    "bestPractices": ["Follow maintenance schedule (See Page 35)", "Daily inspections (See Page 16)", "Keep manual accessible", "Document all service"],
    "commonMistakes": ["Skipping pre-op checklist (See Page 16)", "Ignoring warnings", "Delayed maintenance", "Improper loading (See Page 26)"]
  },
  "quiz": [
    {
      "question": "What is the [specification]? (Reference: Page X)",
      "options": ["A) [Correct]", "B) [Wrong]", "C) [Wrong]", "D) [Wrong]"],
      "correct": 0,
      "explanation": "Per Page X of the manual, the answer is [value]. See Page X for details.",
      "type": "Specifications"
    }
  ]
}

CRITICAL REMINDER: EVERY section content and EVERY keyPoint MUST include "(See Page X)" references. The source documentation has PAGE markers - use them!

Generate EXACTLY ${questionCount} questions. Each explanation MUST reference the page number.`;
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
    // Use the correct API URL - the known working Cloud Run URL
    const apiUrl = 'https://linesmart-api-650169261019.us-central1.run.app/api/ai/generate-training';

    console.log('🔌 Calling backend API at:', apiUrl);
    console.log('📄 Document content length:', docContent?.length || 0, 'characters');
    console.log('📝 Prompt length:', prompt?.length || 0, 'characters');

    try {
      const requestBody = {
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
      };

      console.log('📤 Sending request to backend...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend API response:', {
        success: result.success,
        hasData: !!result.data,
        provider: result.meta?.provider,
        model: result.meta?.model
      });

      if (result.success && result.data) {
        console.log('🎉 Using GPT-4o-mini generated training!');
        return result.data;
      }
      throw new Error('Invalid response structure from backend');
    } catch (error) {
      console.error('❌ Backend API call failed:', error.message);
      console.error('❌ Full error:', error);
      throw error;
    }
  }, [setupConfig, trainingData.department, trainingData.quizConfig?.questionCount]);

  const generateTrainingWithAPI = useCallback(async (prompt) => {
    // Get document content
    const allDocText = trainingData.documents
      .filter(doc => doc.extractedText)
      .map(doc => doc.extractedText)
      .join('\n\n');
    const docContent = documentContent || allDocText;

    console.log('🚀 Starting API call chain...');
    console.log('📄 Total document content:', docContent?.length || 0, 'characters');

    // First try backend API (has server-side API keys - GPT-4o-mini)
    try {
      console.log('1️⃣ Trying backend API (GPT-4o-mini)...');
      const result = await callBackendAPI(prompt, docContent);
      console.log('✅ Backend API succeeded!');
      return result;
    } catch (backendError) {
      console.warn('⚠️ Backend API failed:', backendError.message);
      // Continue to next option
    }

    // Then try user-configured API keys
    const configs = setupConfig?.aiModels?.configs || setupConfig?.aiModels?.modelConfigs || {};
    const enabledModels = Object.entries(configs).filter(([key, config]) =>
      config?.apiKey && key !== 'llama'
    );

    if (enabledModels.length > 0) {
      try {
        console.log('2️⃣ Trying user-configured API:', enabledModels[0][0]);
        const result = await callUserConfiguredAPI(enabledModels[0], prompt);
        console.log('✅ User API succeeded!');
        return result;
      } catch (error) {
        console.warn('⚠️ User API failed:', error.message);
      }
    } else {
      console.log('2️⃣ No user-configured API keys found');
    }

    // Finally fall back to free LLaMA (limited but works)
    console.log('3️⃣ Falling back to free LLaMA API (limited capabilities)');
    console.log('⚠️ Note: LLaMA has limited context and may produce less detailed training');
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
  }, []);

  const getEnabledModels = useCallback(() => {
    // Handle both 'configs' and 'modelConfigs' field names (Firestore uses modelConfigs)
    const configs = setupConfig?.aiModels?.configs || setupConfig?.aiModels?.modelConfigs || {};
    return Object.entries(configs).filter(([key, config]) =>
      config?.apiKey && key !== 'llama'
    );
  }, [setupConfig?.aiModels]);

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
    getEnabledModels
  };
};

export default useTrainingGeneration;
