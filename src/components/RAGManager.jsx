import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Plus, Database, Trash2, Download, Eye, Search, Filter, Cloud, Link, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const RAGManager = ({ onClose, currentUser }) => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Safety_Procedures_2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'processed',
      chunks: 45,
      language: 'en',
      category: 'Safety'
    },
    {
      id: 2,
      name: 'Equipment_Manual_Spanish.docx',
      type: 'docx',
      size: '1.8 MB',
      uploadDate: '2024-01-10',
      status: 'processing',
      chunks: 0,
      language: 'es',
      category: 'Equipment'
    },
    {
      id: 3,
      name: 'Quality_Standards_ISO.pdf',
      type: 'pdf',
      size: '3.2 MB',
      uploadDate: '2024-01-08',
      status: 'processed',
      chunks: 62,
      language: 'en',
      category: 'Quality'
    }
  ]);

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ['Safety', 'Equipment', 'Quality', 'Compliance', 'Training', 'Other'];
  
  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop(),
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploading',
        chunks: 0,
        language: 'en',
        category: 'Other'
      };

      setDocuments(prev => [...prev, newDoc]);
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [newDoc.id]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[newDoc.id] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            setDocuments(prevDocs => 
              prevDocs.map(doc => 
                doc.id === newDoc.id 
                  ? { ...doc, status: 'processing' }
                  : doc
              )
            );
            
            // Simulate processing completion
            setTimeout(() => {
              setDocuments(prevDocs => 
                prevDocs.map(doc => 
                  doc.id === newDoc.id 
                    ? { ...doc, status: 'processed', chunks: Math.floor(Math.random() * 50) + 10 }
                    : doc
                )
              );
            }, 2000);
            
            return prev;
          }
          return { ...prev, [newDoc.id]: currentProgress + 10 };
        });
      }, 300);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">RAG Document Manager</h2>
                <p className="text-purple-100">Upload and manage training documents for AI processing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Training Documents
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOCX, TXT, MD (Max 10MB each)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 my-6">
            <div className="relative flex-1">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-blue-700">Total Documents</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'processed').length}
              </div>
              <div className="text-sm text-green-700">Processed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
              </div>
              <div className="text-sm text-purple-700">Total Chunks</div>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
              <span className="text-sm text-gray-500">{filteredDocuments.length} documents</span>
            </div>

            {filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {doc.size} • {doc.uploadDate} • {doc.language.toUpperCase()}
                        {doc.chunks > 0 && ` • ${doc.chunks} chunks`}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.category === 'Safety' ? 'bg-red-100 text-red-700' :
                        doc.category === 'Equipment' ? 'bg-blue-100 text-blue-700' :
                        doc.category === 'Quality' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.category}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'processed' ? 'bg-green-100 text-green-700' :
                        doc.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        doc.status === 'uploading' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {doc.status === 'uploading' && uploadProgress[doc.id] !== undefined && (
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[doc.id]}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress[doc.id]}%
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents found matching your search.</p>
              </div>
            )}
          </div>

          {/* RAG Settings */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">RAG Processing Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Size</label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overlap</label>
                <input
                  type="number"
                  defaultValue="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vector Store</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="chromadb">ChromaDB</option>
                  <option value="pinecone">Pinecone</option>
                  <option value="weaviate">Weaviate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Embedding Model</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                  <option value="sentence-transformers">Sentence Transformers</option>
                  <option value="cohere">Cohere Embed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Documents are processed using your configured AI models and stored securely.
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAGManager;
