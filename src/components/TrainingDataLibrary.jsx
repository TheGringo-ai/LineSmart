import React, { useState, useEffect } from 'react';
import { Search, FileText, Image, Calendar, User, Tag, Filter, Download, Eye, Trash2 } from 'lucide-react';

const TrainingDataLibrary = ({ documents, onDocumentSelect, onDocumentDelete, searchQuery, onSearchChange }) => {
  const [filteredDocuments, setFilteredDocuments] = useState(documents || []);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const fileTypeFilters = [
    { id: 'all', label: 'All Files', count: documents?.length || 0 },
    { id: 'pdf', label: 'PDFs', count: documents?.filter(d => d.type === 'pdf').length || 0 },
    { id: 'image', label: 'Images', count: documents?.filter(d => d.type === 'image').length || 0 },
    { id: 'text', label: 'Text Files', count: documents?.filter(d => d.type === 'text').length || 0 },
    { id: 'spreadsheet', label: 'Spreadsheets', count: documents?.filter(d => d.type === 'spreadsheet').length || 0 }
  ];

  useEffect(() => {
    let filtered = documents || [];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'oldest':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedFilter, sortBy]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'image':
        return <Image className="h-8 w-8 text-blue-600" />;
      case 'text':
        return <FileText className="h-8 w-8 text-gray-600" />;
      case 'spreadsheet':
        return <FileText className="h-8 w-8 text-green-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">📚 Document Library</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents, content, or tags..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* File Type Filters */}
          <div className="flex flex-wrap gap-2">
            {fileTypeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Largest First</option>
          </select>
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 ${
                viewMode === 'list' ? 'flex items-center space-x-4' : ''
              }`}
            >
              {/* File Icon */}
              <div className={`flex-shrink-0 ${viewMode === 'list' ? '' : 'mb-3'}`}>
                {getFileIcon(doc.type)}
              </div>

              {/* File Info */}
              <div className={`flex-1 ${viewMode === 'list' ? '' : 'space-y-2'}`}>
                <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                  <h4 className="font-medium text-gray-900 truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm text-gray-500">{formatFileSize(doc.size)}</span>
                      <span className="text-sm text-gray-500">{formatDate(doc.uploadedAt)}</span>
                    </div>
                  )}
                </div>

                {viewMode === 'grid' && (
                  <>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{doc.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {viewMode === 'list' && doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doc.tags.slice(0, 5).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`flex ${
                viewMode === 'list' ? 'items-center space-x-2' : 'justify-between mt-3'
              }`}>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onDocumentSelect?.(doc)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDocumentDelete?.(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload some documents to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainingDataLibrary;
