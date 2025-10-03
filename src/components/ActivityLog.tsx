import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

import { ProcessingStep } from '../services/api';

interface ActivityLogProps {
  isProcessing: boolean;
  processingSteps: ProcessingStep[];
  hasError: boolean;
  errorMessage?: string;
}


const stepGuides = {
  init: {
    title: 'Initializing nilCC Workload',
    description: 'Setting up a secure computational environment using Nillion\'s nilCC (Nillion Confidential Computing). This creates an isolated, privacy-preserving workspace where your data can be processed without exposing sensitive information.'
  },
  process: {
    title: 'Processing Bank Statement Data',
    description: 'Your encrypted bank statement is being analyzed within the secure nilCC environment. We\'re extracting transaction data, categorizing expenses, and identifying patterns - all while keeping your raw data completely private and encrypted.'
  },
  insights: {
    title: 'Generating Private Insights',
    description: 'Using nilAI, we\'re generating personalized financial insights and recommendations, ensuring your financial patterns remain confidential.'
  },
  complete: {
    title: 'Analysis Complete!',
    description: 'Your private financial analysis is ready! All insights have been generated using privacy-preserving technology, ensuring your sensitive financial data never left the secure, encrypted environment.'
  }
};


export const ActivityLog: React.FC<ActivityLogProps> = ({ 
  isProcessing, 
  processingSteps, 
  hasError, 
  errorMessage,
  currentTooltip
}) => {

  const getIcon = (step: ProcessingStep, isCurrentStep: boolean) => {
    if (hasError && isCurrentStep) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (step.completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (isCurrentStep && isProcessing) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (step: ProcessingStep, isCurrentStep: boolean) => {
    console.log("step", step, "isCurrentStep", isCurrentStep);
    if (hasError && isCurrentStep) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (step.completed) {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    if (isCurrentStep && isProcessing) {
      return 'text-blue-700 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };


  const currentStepIndex = processingSteps.findIndex(step => !step.completed);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 relative">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Processing Activity</h3>
        </div>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        {processingSteps.length === 0 && !isProcessing && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Upload a file to see processing activity</p>
          </div>
        )}
        
        <div className="space-y-3">
          {processingSteps.map((step, index) => {
            const isCurrentStep = index === currentStepIndex;
            return (
            <div
              key={step.step}
              data-step={step.step}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ${getStatusColor(step, isCurrentStep)}`}
              style={{
                animation: `fadeInSlide 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(step, isCurrentStep)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {step.message}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {step.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            );
          })}
          
          {hasError && errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Error: {errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};