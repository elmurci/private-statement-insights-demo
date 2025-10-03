import React, { useCallback, useState } from 'react';
import { Upload, FileText, Check, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  onStartProcessing?: () => void;
  isUploaded: boolean;
  isReadyToProcess: boolean;
  isCompact: boolean;
  isProcessing?: boolean;
  isUploading?: boolean;
  uploadResult?: {
    fileName: string;
    fileSize: number;
  };
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUpload, 
  onStartProcessing,
  isUploaded, 
  isReadyToProcess,
  isCompact,
  isProcessing = false,
  isUploading = false,
  uploadResult
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File selected:', file.name, 'isUploading:', isUploading);
      onFileUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      onFileUpload(file);
    }
  }, [onFileUpload]);

  // Show success state when uploaded, regardless of compact mode
  if (isUploaded) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        {/* Success Header */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 ${isProcessing ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
            <Check className={`w-8 h-8 ${isProcessing ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
        </div>

        {!isProcessing && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-green-700 mb-1">
              Upload Successful!
            </h3>
            <p className="text-sm text-gray-600 text-xl">
              Your bank statement has been uploaded to <b>nilDB</b>'s MPC Network and is ready for analysis.
              <br/><br/>
              Your data has been secret shared across 3 nodes and it is not accessible by any user o entity execpt you.
            </p>
          </div>
        )}
        
        {/* File Details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadResult?.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {uploadResult && (uploadResult.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
        
        {isReadyToProcess && onStartProcessing && (
          <button 
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={onStartProcessing}
          >
            Generate Insights
          </button>
        )}
        
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    );
  }

  // Show upload form when not uploaded
  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl transition-all duration-300
        ${isDragOver 
          ? 'border-blue-400 bg-blue-50/50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isCompact ? 'p-6' : 'p-12'}
        bg-white/80 backdrop-blur-sm shadow-lg
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className={`mx-auto ${isCompact ? 'w-16 h-16' : 'w-24 h-24'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6`}>
          <Upload className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} text-white`} />
        </div>
        
        <h3 className={`${isCompact ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900 mb-2`}>
          Upload Bank Statement
        </h3>
        
        <p className={`text-gray-600 mb-6 ${isCompact ? 'text-sm' : 'text-base'}`}>
          Drag and drop your file here, or click to browse
        </p>
        
        <div className="relative">
          <label className="cursor-pointer">
            <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 inline-block ${isUploading ? 'opacity-75 cursor-not-allowed' : ''}`}>
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                'Choose File'
              )}
            </div>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.csv,.xlsx,.xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </label>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Supports PDF files up to 10MB
        </p>
      </div>
    </div>
  );
};