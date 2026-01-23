import React, { useState, useEffect } from 'react';
import { Database, Upload, Settings, Brain, FileText, Search } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import TrainingDataLibrary from './TrainingDataLibrary';
import StorageConfiguration from './StorageConfiguration';
import TrainingDataProcessor from './TrainingDataProcessor';

const TrainingDataManager = ({ onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState([
    // Mock documents for demonstration
    {
      id: 1,
      name: 'Safety_Procedures_2024.pdf',
      type: 'pdf',
      size: 2547830,
      uploadedAt: '2024-08-01T10:30:00Z',
      tags: ['safety', 'procedures', 'training'],
      content: 'Safety procedures for workplace operations...',
      url: '#',
      metadata: {
        storageType: 'secure-db',
        extractedKeywords: ['safety', 'procedures', 'PPE', 'emergency'],
        language: 'en',
        summary: 'Comprehensive safety procedures for all workplace operations'
      }
    },
    {
      id: 2,
      name: 'Employee_Handbook_Spanish.docx',
      type: 'text',
      size: 1847294,
      uploadedAt: '2024-07-28T14:15:00Z',
      tags: ['handbook', 'policies', 'spanish'],
      content: 'Manual del empleado en español...',
      url: '#',
      metadata: {
        storageType: 'google-cloud',
        extractedKeywords: ['políticas', 'empleado', 'beneficios'],
        language: 'es',
        summary: 'Manual completo del empleado en español'
      }
    },
    {
      id: 3,
      name: 'Training_Metrics_Q2.xlsx',
      type: 'spreadsheet',
      size: 598273,
      uploadedAt: '2024-07-25T09:45:00Z',
      tags: ['metrics', 'training', 'q2'],
      content: 'Training completion rates and scores...',
      url: '#',
      metadata: {
        storageType: 'secure-db',
        extractedKeywords: ['metrics', 'completion', 'scores'],
        language: 'en',
        summary: 'Q2 training metrics and performance data'
      }
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [storageConfig, setStorageConfig] = useState({
    provider: 'secure-db',
    config: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState({});

  const tabs = [
    { id: 'upload', name: 'Upload Documents', icon: Upload },
    { id: 'library', name: 'Document Library', icon: FileText },
    { id: 'processing', name: 'Process Documents', icon: Brain },
    { id: 'storage', name: 'Storage Settings', icon: Settings }
  ];

  const handleDocumentUpload = (newDocument) => {
    const documentWithId = {
      ...newDocument,
      id: documents.length + 1,
      uploadedAt: new Date().toISOString(),
      tags: [], // Auto-tagging would happen here
      type: getDocumentType(newDocument.metadata.mimeType)
    };
    
    setDocuments(prev => [documentWithId, ...prev]);
  };

  const getDocumentType = (mimeType) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'spreadsheet';
    return 'text';
  };

  const handleDocumentDelete = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleDocumentSelect = (document) => {
    // Open document viewer/editor
    console.log('Selected document:', document);
  };

  const handleStorageConfigUpdate = (newConfig) => {
    setStorageConfig(newConfig);
  };

  const handleTestConnection = async (provider, config) => {
    // Simulate connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        if (provider === 'secure-db') {
          resolve({ success: true, message: 'Connection successful' });
        } else if (config.bucketName || config.accountName) {
          resolve({ success: true, message: 'Connection successful' });
        } else {
          resolve({ success: false, message: 'Invalid configuration' });
        }
      }, 2000);
    });
  };

  const handleStartProcessing = async (settings) => {
    setIsProcessing(true);

    // Simulate document processing
    const totalDocs = documents.length;
    for (let i = 0; i < totalDocs; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStats({
        totalDocuments: totalDocs,
        processedDocuments: i + 1,
        totalChunks: (i + 1) * 15,
        extractedKeywords: (i + 1) * 8,
        processingTime: (i + 1) * 1000
      });
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStats({});
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Training Data Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'upload' && (
            <DocumentUpload
              onUpload={handleDocumentUpload}
              storageConfig={storageConfig}
              onStorageChange={(type) => setStorageConfig(prev => ({ ...prev, provider: type }))}
            />
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <TrainingDataLibrary
                documents={documents}
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDocumentDelete}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {activeTab === 'processing' && (
            <TrainingDataProcessor
              documents={documents}
              isProcessing={isProcessing}
              onStartProcessing={handleStartProcessing}
              processingStats={processingStats}
            />
          )}

          {activeTab === 'storage' && (
            <StorageConfiguration
              currentConfig={storageConfig}
              onConfigUpdate={handleStorageConfigUpdate}
              onTestConnection={handleTestConnection}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {documents.length} documents • Storage: {storageConfig.provider}
            </div>
            <div className="flex items-center space-x-3">
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Processing documents...</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDataManager;
