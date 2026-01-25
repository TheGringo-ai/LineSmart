import React, { useState } from 'react';
import { Play, Download, AlertCircle, FileText, Eye, X } from 'lucide-react';
import { getLanguageName } from '../../utils';

/**
 * Training review view component
 */
export const ReviewTrainingView = ({
  generatedTraining,
  trainingData,
  onStartQuiz
}) => {
  const [viewingDocument, setViewingDocument] = useState(null);

  // Create object URL for viewing PDF
  const viewDocument = (doc) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      setViewingDocument({ ...doc, url });
    }
  };

  const closeDocumentViewer = () => {
    if (viewingDocument?.url) {
      URL.revokeObjectURL(viewingDocument.url);
    }
    setViewingDocument(null);
  };

  return (
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
              onClick={onStartQuiz}
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

        {/* Source Documents Section */}
        {trainingData.documents && trainingData.documents.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Source Documents (Click to View)
            </h3>
            <div className="flex flex-wrap gap-2">
              {trainingData.documents.map((doc, index) => (
                <button
                  key={index}
                  onClick={() => viewDocument(doc)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                  <span className="text-xs text-gray-500">({Math.round(doc.size / 1024)} KB)</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📌 Training content references page numbers from these documents. Click to view diagrams and figures.
            </p>
          </div>
        )}

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

        {/* Safety Notes */}
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

        {/* Best Practices */}
        <div className="mt-6 bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-900 mb-4">Personal Best Practices</h3>
          <ul className="list-disc list-inside space-y-2 text-green-800">
            {generatedTraining.training.bestPractices.map((practice, index) => (
              <li key={index}>{practice}</li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-900 mb-4">Common Individual Mistakes to Avoid</h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800">
            {generatedTraining.training.commonMistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                {viewingDocument.name}
              </h3>
              <button
                onClick={closeDocumentViewer}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full"
                title={viewingDocument.name}
              />
            </div>
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                📌 Use this document to view figures and diagrams referenced in the training content
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTrainingView;
