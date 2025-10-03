import { useState, useCallback } from 'react';
import { apiService, FinancialInsights, ProcessingStep, UploadResult, createNilCCWorkload } from '../services/api';

export interface ProcessingState {
  isUploaded: boolean;
  isUploading: boolean;
  isReadyToProcess: boolean;
  hasStartedProcessing: boolean;
  documentId: string,
  collectionId: string,
  nucReadTokens: string,
  isProcessing: boolean;
  isComplete: boolean;
  hasError: boolean;
  errorMessage?: string;
  uploadId?: string;
  uploadResult?: UploadResult;
  insights?: FinancialInsights;
  processingSteps: ProcessingStep[];
  progress: number;
  currentStep?: {
    step: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  } | null;
}

export const useBankStatementProcessor = () => {
  const [state, setState] = useState<ProcessingState>({
    isUploaded: false,
    isUploading: false,
    isReadyToProcess: false,
    hasStartedProcessing: false,
    documentId: "",
    collectionId: "",
    nucReadTokens: "",
    isProcessing: false,
    isComplete: false,
    hasError: false,
    processingSteps: [],
    progress: 0,
    currentStep: null,
  });

  const stepGuides = {
    init: {
      title: 'Initializing nilCC Workload',
      description: 'Setting up a secure computational environment using Nillion\'s nilCC (Nillion Confidential Computing). This creates an isolated, privacy-preserving workspace where your data can be processed without exposing sensitive information.',
      step: 'init',
      icon: 'shield',
      color: 'from-blue-500 to-indigo-600'
    },
    process: {
      title: 'Processing Bank Statement Data',
      description: 'Your encrypted bank statement is being analyzed within the secure nilCC environment. Extracting transaction data, categorizing expenses, and identifying patterns - all while keeping your raw data completely private and encrypted.',
      step: 'process',
      icon: 'database',
      color: 'from-purple-500 to-violet-600'
    },
    insights: {
      title: 'Generating Private Insights',
      description: 'Using advanced privacy-preserving algorithms to generate personalized financial insights and recommendations. The analysis happens on encrypted data, ensuring your financial patterns remain confidential while providing valuable insights.',
      step: 'insights',
      icon: 'brain',
      color: 'from-orange-500 to-amber-600'
    },
    complete: {
      title: 'Analysis Complete!',
      description: 'Your private financial analysis is ready! All insights have been generated using privacy-preserving computation, ensuring your sensitive financial data never left the secure, encrypted environment.',
      step: 'complete',
      icon: 'check-circle',
      color: 'from-green-500 to-emerald-600'
    }
  };

  const processingSteps = [
    { step: 'init', message: 'Initiating nilCC workload', completed: false, timestamp: new Date() },
    { step: 'process', message: 'Processing bank statement data', completed: false, timestamp: new Date() },
    { step: 'insights', message: 'Generating insights and recommendations', completed: false, timestamp: new Date() },
    { step: 'complete', message: 'Delete nilCC Workload', completed: false, timestamp: new Date() },
  ];

  const getInsights = useCallback(async () => {
    try {

      let i = 0;
      let currentStep = processingSteps[i];
      
      // Show tooltip for current step
      setState(prev => ({
        ...prev,
        currentStep: {
          step: currentStep.step,
          title: stepGuides[Object.keys(stepGuides)[i]]?.title || 'Processing...',
          description: stepGuides[Object.keys(stepGuides)[i]]?.description || 'Working on your request...',
          icon: stepGuides[Object.keys(stepGuides)[i]]?.icon || 'loader',
          color: stepGuides[Object.keys(stepGuides)[i]]?.color || 'from-gray-500 to-gray-600',
        },
      }));

      const createNilCC = await apiService.createNilCCWorkload(
        state.documentId,
        state.collectionId,
        state.nucReadTokens,
      );

      console.log("createNilCC", createNilCC);

      // Monitor workload 
      let workloadStatusRequest;
      do {
        workloadStatusRequest = await apiService.getWorkloadStatus(createNilCC.workloadId);
        console.log("WORKLOAD STATUS", workloadStatusRequest.status);
        await new Promise(res => setTimeout(res, 1000));
      } while (workloadStatusRequest.status !== "running");

      console.log("WORKLOAD STATUS OUT", workloadStatusRequest.status);

      i = 1;
      currentStep = processingSteps[i];

      setState(prev => ({
        ...prev,
        processingSteps: processingSteps.map((step, index) => ({
          ...step,
          completed: index <= i,
          timestamp: index === i ? new Date() : step.timestamp,
        })),
        progress: (i + 1 / processingSteps.length) * 100,
        currentStep: stepGuides[currentStep.step] ? {
          step: currentStep.step,
          title: stepGuides[currentStep.step].title,
          description: stepGuides[currentStep.step].description,
          icon: stepGuides[currentStep.step].icon,
          color: stepGuides[currentStep.step].color,
        } : null,
      }));

      // nilAI Response
      
      let nilAIStatusRequest;
      do {
        nilAIStatusRequest = await apiService.getNilAIStatus(createNilCC.workloadId);
        await new Promise(res => setTimeout(res, 1000));
        console.log("nilAIStatusRequest.state", nilAIStatusRequest.state)
      } while (!nilAIStatusRequest || nilAIStatusRequest.state !== "completed");
      console.log("NILAI RESPONSE STATUS", nilAIStatusRequest);

      i = 2;
      currentStep = processingSteps[i];

      setState(prev => ({
        ...prev,
        processingSteps: processingSteps.map((step, index) => ({
          ...step,
          completed: index <= i,
          timestamp: index === i ? new Date() : step.timestamp,
        })),
        progress: (i + 1 / processingSteps.length) * 100,
        currentStep: stepGuides[currentStep.step] ? {
          step: currentStep.step,
          title: stepGuides[currentStep.step].title,
          description: stepGuides[currentStep.step].description,
          icon: stepGuides[currentStep.step].icon,
          color: stepGuides[currentStep.step].color,
        } : null,
      }));

      const deleteWorkloadRequest = await apiService.deleteWorkload(createNilCC.workloadId);
      console.log("DELETE WORKLOAD RESPONSE STATUS", deleteWorkloadRequest);

      i = 3;
      currentStep = processingSteps[i];

      setState(prev => ({
        ...prev,
        processingSteps: processingSteps.map((step, index) => ({
          ...step,
          completed: index <= i,
          timestamp: index === i ? new Date() : step.timestamp,
        })),
        progress: (i + 1 / processingSteps.length) * 100,
        currentStep: stepGuides[currentStep.step] ? {
          step: currentStep.step,
          title: stepGuides[currentStep.step].title,
          description: stepGuides[currentStep.step].description,
          icon: stepGuides[currentStep.step].icon,
          color: stepGuides[currentStep.step].color,
        } : null,
      }));

      return nilAIStatusRequest.result.message.insights;

    } catch (error) {
      console.error('❌ Failed to create nilCC workload:', error);
    }
    
    setState(prev => ({
      ...prev,
      currentStep: null,
    }));
  }, [state.documentId, state.collectionId, state.nucReadTokens]);

  const uploadFile = useCallback(async (file: File) => {
    console.log('uploadFile called with:', file.name);
    try {
      setState(prev => ({
        ...prev,
        isUploading: true,
        hasError: false,
        errorMessage: undefined,
      }));

      const uploadResult = await apiService.uploadToNilDB(file);

      setState(prev => {
        const newState = {
          ...prev,
          isUploaded: true,
          isUploading: false,
          isReadyToProcess: true,
          uploadId: uploadResult.uploadId,
          documentId: uploadResult.documentId,
          collectionId: uploadResult.collectionId,
          nucReadTokens: uploadResult.nucReadTokens,
          uploadResult,
        };
        return newState;
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, []);

  const startProcessing = useCallback(async () => {
    if (!state.uploadId) return;

    try {

      setState(prev => ({
        ...prev,
        hasStartedProcessing: true,
        isProcessing: true,
        isReadyToProcess: false,
        hasError: false,
        errorMessage: undefined,
        processingSteps: processingSteps,
      }));

      const insights = await getInsights(
        state.documentId,
        state.collectionId,
        state.nucReadTokens,
      );

      setState(prev => ({
        ...prev,
        isProcessing: false,
        isComplete: true,
        insights,
        progress: 100,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred',
        currentStep: null,
      }));
    }
  }, [state.uploadId, getInsights]);

  const reset = useCallback(() => {
    setState({
      isUploaded: false,
      isUploading: false,
      isReadyToProcess: false,
      hasStartedProcessing: false,
      documentId: "",
      collectionId: "",
      nucReadTokens: "",
      isProcessing: false,
      isComplete: false,
      hasError: false,
      processingSteps: [],
      progress: 0,
      currentStep: null,
    });
  }, []);


  return {
    ...state,
    uploadFile,
    startProcessing,
    reset,
  };
};