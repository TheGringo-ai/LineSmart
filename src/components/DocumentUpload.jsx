import React, { useState, useCallback } from 'react';
import { Upload, FileText, Image, Database, Cloud, Shield, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const DocumentUpload = ({ onUpload, storageConfig, onStorageChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(storageConfig?.type || 'secure-db');

  const supportedFileTypes = {
    'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-600' },
    'text/plain': { icon: FileText, label: 'TXT', color: 'text-gray-600' },
    'image/jpeg': { icon: Image, label: 'JPG', color: 'text-blue-600' },
    'image/png': { icon: Image, label: 'PNG', color: 'text-blue-600' },
    'image/gif': { icon: Image, label: 'GIF', color: 'text-green-600' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'DOCX', color: 'text-blue-700' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, label: 'XLSX', color: 'text-green-700' },
    'text/csv': { icon: FileText, label: 'CSV', color: 'text-orange-600' },
    'application/vnd.ms-powerpoint': { icon: FileText, label: 'PPT', color: 'text-orange-700' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, label: 'PPTX', color: 'text-orange-700' }
  };

  const storageOptions = [
    {
      id: 'secure-db',
      name: 'Secure Database',
      description: 'Our encrypted, SOC2-compliant database',
      icon: Shield,
      features: ['End-to-end encryption', 'SOC2 Type II certified', 'GDPR compliant', 'Automatic backups'],
      pricing: 'Included',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Storage',
      description: 'Your own Google Cloud Storage bucket',
      icon: Cloud,
      features: ['Your own GCS bucket', 'Full control', 'Custom retention', 'Regional storage'],
      pricing: 'Google Cloud pricing',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      description: 'Your own AWS S3 bucket',
      icon: Cloud,
      features: ['Your own S3 bucket', 'Full control', 'Lifecycle policies', 'Global regions'],
      pricing: 'AWS pricing',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      id: 'azure-blob',
      name: 'Azure Blob Storage',
      description: 'Your own Azure Storage account',
      icon: Cloud,
      features: ['Your own storage account', 'Full control', 'Hot/Cool tiers', 'Global distribution'],
      pricing: 'Azure pricing',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    const newFiles = [];

    for (const file of files) {
      if (Object.keys(supportedFileTypes).includes(file.type)) {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          file: file
        };
        newFiles.push(fileData);
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload process
    for (const fileData of newFiles) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileData.id ? { ...f, progress } : f)
          );
        }

        // Process the file based on storage type
        const processedFile = await processFile(fileData, selectedStorage);
        
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, status: 'completed', ...processedFile } : f)
        );

        if (onUpload) {
          onUpload(processedFile);
        }
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f)
        );
      }
    }

    setUploading(false);
  };

  const processFile = async (fileData, storageType) => {
    // This would integrate with your chosen storage provider
    const processed = {
      storageId: `${storageType}_${Date.now()}`,
      url: URL.createObjectURL(fileData.file), // Temporary preview URL
      extractedText: await extractTextFromFile(fileData.file),
      metadata: {
        uploadedAt: new Date().toISOString(),
        storageType,
        originalName: fileData.name,
        fileSize: fileData.size,
        mimeType: fileData.type
      }
    };

    return processed;
  };

  const extractTextFromFile = async (file) => {
    // Mock text extraction - in real implementation, you'd use:
    // - PDF.js for PDFs
    // - Tesseract.js for images
    // - Papa Parse for CSV
    // - Your backend services for complex documents
    
    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type === 'text/csv') {
      const text = await file.text();
      return `CSV Data:\n${text}`;
    } else if (file.type.startsWith('image/')) {
      return `[Image: ${file.name}] - OCR extraction would happen here`;
    } else if (file.type === 'application/pdf') {
      return `[PDF: ${file.name}] - PDF text extraction would happen here`;
    } else {
      return `[Document: ${file.name}] - Document parsing would happen here`;
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleStorageChange = (storageType) => {
    setSelectedStorage(storageType);
    if (onStorageChange) {
      onStorageChange(storageType);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const fileInfo = supportedFileTypes[fileType];
    if (fileInfo) {
      const IconComponent = fileInfo.icon;
      return <IconComponent className={`h-4 w-4 ${fileInfo.color}`} />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Storage Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Choose Storage Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storageOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                onClick={() => handleStorageChange(option.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedStorage === option.id ? option.color : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-sm opacity-75 mb-2">{option.description}</p>
                    <div className="space-y-1">
                      {option.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="text-xs flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-medium mt-2">💰 {option.pricing}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Upload Training Materials</h3>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <div className="text-lg font-medium text-gray-900">
              Drag and drop files here, or click to browse
            </div>
            <div className="text-sm text-gray-600">
              Supports: PDF, TXT, DOCX, XLSX, CSV, PPT, PPTX, JPG, PNG, GIF
            </div>
            <div className="text-xs text-gray-500">
              Maximum file size: 50MB per file
            </div>
          </div>
          
          <input
            type="file"
            multiple
            accept={Object.keys(supportedFileTypes).join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Supported File Types */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(supportedFileTypes).map(([type, info]) => {
            const IconComponent = info.icon;
            return (
              <div key={type} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                <IconComponent className={`h-3 w-3 ${info.color}`} />
                <span className="text-xs text-gray-600">{info.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center space-x-2">
                      {file.status === 'uploading' && (
                        <Loader className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                      {file.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {file.status === 'uploading' && (
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-500">{file.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
