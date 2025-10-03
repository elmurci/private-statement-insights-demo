import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { InsightsSummary } from './components/InsightsSummary';
import { ActivityLog } from './components/ActivityLog';
import { useBankStatementProcessor } from './hooks/useBankStatementProcessor';
import { Shield, Database, Brain, CheckCircle, Loader2 } from 'lucide-react';

function App() {
  const {
    isUploaded,
    isUploading,
    isReadyToProcess,
    hasStartedProcessing,
    isProcessing,
    isComplete,
    hasError,
    errorMessage,
    uploadResult,
    insights,
    processingSteps,
    currentStep,
    uploadFile,
    startProcessing,
    reset,
  } = useBankStatementProcessor();

  const getStepIcon = (step?: string) => {
    switch (step) {
      case 'init': return Shield;
      case 'process': return Database;
      case 'insights': return Brain;
      case 'complete': return CheckCircle;
      default: return Loader2;
    }
  };

  const getStepColor = (step?: string) => {
    switch (step) {
      case 'init': return 'from-blue-500 to-indigo-600';
      case 'process': return 'from-purple-500 to-violet-600';
      case 'insights': return 'from-orange-500 to-amber-600';
      case 'complete': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bank Statement Private Insights
          </h1>
          <p className="text-xl text-gray-600">
            Upload your statement and get instant financial analysis in a private way
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - File Uploader */}
          <div 
            className={`transition-all duration-700 ease-in-out ${
              hasStartedProcessing ? 'lg:w-1/4' : 'w-full max-w-2xl mx-auto'
            }`}
          >
            <div className={`space-y-6 ${hasStartedProcessing ? '' : 'flex flex-col items-center'}`}>
              <FileUploader
                onFileUpload={uploadFile}
                onStartProcessing={startProcessing}
                isUploaded={isUploaded}
                isUploading={isUploading}
                isReadyToProcess={isReadyToProcess}
                isCompact={hasStartedProcessing}
                isProcessing={isProcessing}
                uploadResult={uploadResult}
              />
              
              {/* Activity Log - moves with uploader */}
              {hasStartedProcessing && (isProcessing || processingSteps.length > 0) && (
                <ActivityLog 
                  isProcessing={isProcessing}
                  processingSteps={processingSteps}
                  hasError={hasError}
                  errorMessage={errorMessage}
                />
              )}
            </div>
          </div>

          {/* Right Column - Insights */}
          {hasStartedProcessing && (
            <div className="lg:w-3/4 order-2 lg:order-2 space-y-6">
              {isProcessing && !isComplete && !hasError && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 min-h-96">
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${getStepColor(currentStep?.step)} p-6 rounded-t-xl text-white`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        {(() => {
                          const IconComponent = getStepIcon(currentStep?.step);
                          return currentStep?.step ? (
                            <IconComponent className="w-8 h-8" />
                          ) : (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          );
                        })()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {currentStep?.title || 'Processing Your Statement'}
                        </h3>
                        <p className="text-white/80 text-sm">
                          Privacy-preserving financial analysis
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 flex flex-col items-center justify-center">
                    <p className="text-gray-700 text-center max-w-2xl text-lg leading-relaxed mb-8">
                      {currentStep?.description || 
                        "We're analyzing your bank statement and generating insights using privacy-preserving computation. This usually takes a few moments."
                      }
                    </p>
                    
                    {/* Progress indicator */}
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {currentStep?.step === 'init' && 'Initializing secure environment...'}
                        {currentStep?.step === 'process' && 'Extracting transaction data...'}
                        {currentStep?.step === 'insights' && 'Generating insights...'}
                        {!currentStep && 'Starting analysis...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {isComplete && insights && !hasError && (
                <div className="animate-slide-in">
                  <InsightsSummary insights={insights} />
                </div>
              )}
              
              {hasError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Processing Failed</h3>
                  <p className="text-red-700 mb-4">{errorMessage}</p>
                  <button
                    onClick={reset}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;