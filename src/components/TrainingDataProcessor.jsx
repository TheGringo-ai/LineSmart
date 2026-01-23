import React, { useState } from 'react';
import { Brain, Search, FileText, Layers, Settings, Zap } from 'lucide-react';

const TrainingDataProcessor = ({ documents, onProcessingComplete, isProcessing, onStartProcessing }) => {
  const [processingSettings, setProcessingSettings] = useState({
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'text-embedding-ada-002',
    vectorStore: 'chromadb',
    enableOCR: true,
    enableSummarization: true,
    extractKeywords: true,
    languageDetection: true
  });

  const [processingStats, setProcessingStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    totalChunks: 0,
    extractedKeywords: 0,
    processingTime: 0
  });

  const embeddingModels = [
    { id: 'text-embedding-ada-002', name: 'OpenAI Ada v2', description: 'High quality, 1536 dimensions' },
    { id: 'text-embedding-3-small', name: 'OpenAI v3 Small', description: 'Latest model, efficient' },
    { id: 'text-embedding-3-large', name: 'OpenAI v3 Large', description: 'Highest quality, 3072 dimensions' },
    { id: 'sentence-transformers', name: 'Sentence Transformers', description: 'Open source, local processing' }
  ];

  const vectorStores = [
    { id: 'chromadb', name: 'ChromaDB', description: 'Fast, open-source vector database' },
    { id: 'pinecone', name: 'Pinecone', description: 'Managed vector database service' },
    { id: 'weaviate', name: 'Weaviate', description: 'Open-source vector search engine' },
    { id: 'qdrant', name: 'Qdrant', description: 'High-performance vector database' }
  ];

  const handleSettingChange = (setting, value) => {
    setProcessingSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const startProcessing = async () => {
    if (onStartProcessing) {
      await onStartProcessing(processingSettings);
    }
  };

  const ProcessingProgress = () => {
    if (!isProcessing) return null;

    const progress = processingStats.totalDocuments > 0 
      ? (processingStats.processedDocuments / processingStats.totalDocuments) * 100 
      : 0;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          <span className="font-medium text-blue-900">Processing Documents...</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-blue-800">
            <span>Documents: {processingStats.processedDocuments}/{processingStats.totalDocuments}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>📄 Chunks Created: {processingStats.totalChunks}</div>
            <div>🏷️ Keywords: {processingStats.extractedKeywords}</div>
          </div>
          
          {processingStats.processingTime > 0 && (
            <div className="text-sm text-blue-600">
              ⏱️ Processing Time: {Math.round(processingStats.processingTime / 1000)}s
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Document Processing Settings</h3>
      </div>

      <ProcessingProgress />

      {!isProcessing && (
        <div className="space-y-6">
          {/* Chunking Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Text Chunking</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Size (characters)
                </label>
                <input
                  type="number"
                  value={processingSettings.chunkSize}
                  onChange={(e) => handleSettingChange('chunkSize', parseInt(e.target.value))}
                  min="100"
                  max="4000"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1000-2000 for training content</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Overlap (characters)
                </label>
                <input
                  type="number"
                  value={processingSettings.chunkOverlap}
                  onChange={(e) => handleSettingChange('chunkOverlap', parseInt(e.target.value))}
                  min="0"
                  max="500"
                  step="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Maintains context between chunks</p>
              </div>
            </div>
          </div>

          {/* Embedding Model Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Embedding Model</span>
            </h4>
            
            <div className="space-y-3">
              {embeddingModels.map((model) => (
                <label key={model.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="embeddingModel"
                    value={model.id}
                    checked={processingSettings.embeddingModel === model.id}
                    onChange={(e) => handleSettingChange('embeddingModel', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-600">{model.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Vector Store Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Vector Store</span>
            </h4>
            
            <div className="space-y-3">
              {vectorStores.map((store) => (
                <label key={store.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="vectorStore"
                    value={store.id}
                    checked={processingSettings.vectorStore === store.id}
                    onChange={(e) => handleSettingChange('vectorStore', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{store.name}</div>
                    <div className="text-sm text-gray-600">{store.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Processing Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Processing Options</span>
            </h4>
            
            <div className="space-y-3">
              {[
                { key: 'enableOCR', label: 'Enable OCR for Images', description: 'Extract text from images and scanned documents' },
                { key: 'enableSummarization', label: 'Generate Summaries', description: 'Create AI-powered summaries for each document' },
                { key: 'extractKeywords', label: 'Extract Keywords', description: 'Automatically identify and tag key terms' },
                { key: 'languageDetection', label: 'Language Detection', description: 'Detect and tag document languages' }
              ].map((option) => (
                <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={processingSettings[option.key]}
                    onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Document Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 Processing Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-600">Documents</div>
                <div className="font-medium text-blue-900">{documents?.length || 0}</div>
              </div>
              <div>
                <div className="text-blue-600">Est. Chunks</div>
                <div className="font-medium text-blue-900">
                  {documents ? Math.ceil(documents.reduce((acc, doc) => acc + (doc.size || 0), 0) / processingSettings.chunkSize) : 0}
                </div>
              </div>
              <div>
                <div className="text-blue-600">Embedding Model</div>
                <div className="font-medium text-blue-900">
                  {embeddingModels.find(m => m.id === processingSettings.embeddingModel)?.name || 'None'}
                </div>
              </div>
              <div>
                <div className="text-blue-600">Vector Store</div>
                <div className="font-medium text-blue-900">
                  {vectorStores.find(s => s.id === processingSettings.vectorStore)?.name || 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Start Processing Button */}
          <div className="flex justify-center">
            <button
              onClick={startProcessing}
              disabled={!documents || documents.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              <Brain className="h-5 w-5" />
              <span>Process Documents</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDataProcessor;
