import React, { useState, useCallback, useRef } from 'react';
import { Play, Download, AlertCircle, FileText, Eye, X, Printer } from 'lucide-react';
import { getLanguageName } from '../../utils';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is set
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Training review view component
 */
export const ReviewTrainingView = ({
  generatedTraining,
  trainingData,
  onStartQuiz
}) => {
  const [viewingDocument, setViewingDocument] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState('');
  const printContentRef = useRef(null);

  // Create object URL for viewing PDF at specific page
  const viewDocument = useCallback((doc, page = 1) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      setViewingDocument({ ...doc, url, page });
    }
  }, []);

  // Render PDF pages as images for printing
  const renderPDFPagesAsImages = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      setPrintProgress(`Rendering ${file.name} - Page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const scale = 1.5; // Good quality for printing
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      images.push({
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        pageNum: i,
        width: viewport.width,
        height: viewport.height
      });
    }

    return images;
  };

  // Print training with embedded PDF pages
  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintProgress('Preparing training document...');

    try {
      // Render all PDF pages as images
      const allDocImages = [];
      for (const doc of (trainingData.documents || [])) {
        if (doc.file) {
          const images = await renderPDFPagesAsImages(doc.file);
          allDocImages.push({ name: doc.name, images });
        }
      }

      setPrintProgress('Opening print dialog...');

      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the training document.');
        setIsPrinting(false);
        return;
      }

      // Build print HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${trainingData.title} - Training Document</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0.5in;
            }
            h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { color: #374151; margin-top: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            .section { margin-bottom: 25px; padding-left: 15px; border-left: 4px solid #3b82f6; }
            .key-points { background: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 10px; }
            .key-points h4 { margin: 0 0 10px 0; color: #1e40af; }
            .key-points ul { margin: 0; padding-left: 20px; }
            .safety { background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; }
            .safety h3 { color: #dc2626; margin-top: 0; }
            .best-practices { background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; }
            .best-practices h3 { color: #16a34a; margin-top: 0; }
            .mistakes { background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #ca8a04; }
            .mistakes h3 { color: #ca8a04; margin-top: 0; }
            .page-ref { color: #2563eb; font-weight: 500; }
            .doc-section { page-break-before: always; margin-top: 40px; }
            .doc-section h2 { color: #059669; border-bottom: 2px solid #059669; }
            .pdf-page {
              margin: 20px 0;
              text-align: center;
              page-break-inside: avoid;
            }
            .pdf-page img {
              max-width: 100%;
              border: 1px solid #ddd;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .pdf-page-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            @media print {
              body { padding: 0; }
              .doc-section { page-break-before: always; }
              .pdf-page { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${trainingData.title}</h1>
            <div class="meta">
              <strong>Department:</strong> ${trainingData.department} |
              <strong>Type:</strong> ${trainingData.trainingType} |
              <strong>Language:</strong> ${getLanguageName(trainingData.language)} |
              <strong>Scope:</strong> ${trainingData.trainingScope}
            </div>
          </div>

          <h2>Introduction</h2>
          <p>${generatedTraining.training.introduction}</p>

          ${generatedTraining.training.sections.map(section => `
            <div class="section">
              <h3>${section.title}</h3>
              <p>${section.content}</p>
              <div class="key-points">
                <h4>Key Points:</h4>
                <ul>
                  ${section.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}

          <div class="safety">
            <h3>⚠️ Safety Responsibilities</h3>
            <ul>
              ${generatedTraining.training.safetyNotes.map(note => `<li>${note}</li>`).join('')}
            </ul>
          </div>

          <div class="best-practices">
            <h3>✓ Best Practices</h3>
            <ul>
              ${generatedTraining.training.bestPractices.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>

          <div class="mistakes">
            <h3>✗ Common Mistakes to Avoid</h3>
            <ul>
              ${generatedTraining.training.commonMistakes.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>

          ${allDocImages.map(doc => `
            <div class="doc-section">
              <h2>📄 Reference Document: ${doc.name}</h2>
              <p>The following pages are from the source documentation referenced throughout this training.</p>
              ${doc.images.map(img => `
                <div class="pdf-page">
                  <img src="${img.dataUrl}" alt="Page ${img.pageNum}" />
                  <div class="pdf-page-label">Page ${img.pageNum}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666;">
            <p>Generated by LineSmart Training Platform</p>
            <p>Print Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Wait for images to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

    } catch (error) {
      console.error('Print error:', error);
      alert('Error preparing print document: ' + error.message);
    } finally {
      setIsPrinting(false);
      setPrintProgress('');
    }
  };

  const closeDocumentViewer = () => {
    if (viewingDocument?.url) {
      URL.revokeObjectURL(viewingDocument.url);
    }
    setViewingDocument(null);
  };

  // Parse text and make page references clickable
  const renderContentWithLinks = useCallback((text) => {
    if (!text || !trainingData.documents?.length) return text;

    // Pattern to match "(See [Document Name], Page X)" or "See Page X" or "Page X"
    const pageRefPattern = /\(?\s*[Ss]ee\s+(?:["']?([^"',]+)["']?,?\s+)?[Pp]age\s+(\d+)\s*\)?|(?:\([Pp]age\s+(\d+)\))|(?:[Ss]ee\s+[Ff]igure\s+[\d\-]+\s+on\s+[Pp]age\s+(\d+))/gi;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pageRefPattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const pageNum = match[2] || match[3] || match[4];
      const docName = match[1];

      // Find matching document
      const doc = trainingData.documents.find(d =>
        !docName || d.name.toLowerCase().includes(docName.toLowerCase())
      ) || trainingData.documents[0];

      // Add clickable link
      parts.push(
        <button
          key={match.index}
          onClick={() => viewDocument(doc, parseInt(pageNum))}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium mx-1"
          title={`View ${doc?.name || 'document'} page ${pageNum}`}
        >
          📄 {match[0]}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  }, [trainingData.documents, viewDocument]);

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
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>{isPrinting ? 'Preparing...' : 'Print with Manual'}</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Print Progress Indicator */}
          {isPrinting && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <span>{printProgress}</span>
              </div>
            </div>
          )}
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
          <p className="text-gray-700 leading-relaxed">{renderContentWithLinks(generatedTraining.training.introduction)}</p>
        </div>

        <div className="space-y-8">
          {generatedTraining.training.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">{renderContentWithLinks(section.content)}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Points:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  {section.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>{renderContentWithLinks(point)}</li>
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
                {viewingDocument.page > 1 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    Page {viewingDocument.page}
                  </span>
                )}
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
                src={`${viewingDocument.url}#page=${viewingDocument.page || 1}`}
                className="w-full h-full"
                title={viewingDocument.name}
              />
            </div>
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                📌 Viewing page {viewingDocument.page || 1} - Scroll or use PDF controls to navigate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTrainingView;
