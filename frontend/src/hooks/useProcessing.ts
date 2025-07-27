// useProcessing.ts
// Custom hook for processing state management

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useApiKey } from './useApiKey';
import apiClient from '@/lib/api';
import { PROCESSING_STATES, ERROR_MESSAGES } from '@/lib/constants';
import type { 
  ProcessingStatus, 
  ProcessingState,
  ProcessingResults, 
  SummarizeTextInput,
  MindmapInput,
  MCQQuizInput,
  FlashcardInput,
  UploadedFile
} from '@/lib/types';

const useProcessing = (uploadedFiles: UploadedFile[] = []) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingState>({
    state: PROCESSING_STATES.IDLE,
    progress: 0,
    message: '',
  });

  const [results, setResults] = useState<ProcessingResults | null>(null);
  const { validateApiKey } = useApiKey();

  // Update processing status
  const updateStatus = useCallback((
    state: ProcessingStatus,
    progress?: number,
    message?: string,
    error?: string
  ) => {
    setProcessingStatus(prev => ({
      ...prev,
      state,
      progress: progress ?? prev.progress,
      message: message ?? prev.message,
      error,
    }));
  }, []);

  // Reset processing state
  const resetProcessing = useCallback(() => {
    setProcessingStatus({
      state: PROCESSING_STATES.IDLE,
      progress: 0,
      message: '',
    });
    setResults(null);
  }, []);

  // Text summarization mutation
  const summarizeTextMutation = useMutation({
    mutationFn: async (input: SummarizeTextInput) => {
      updateStatus(PROCESSING_STATES.PROCESSING, 0, 'Generating summary...');
      return apiClient.summarizeContent(input);
    },
    onSuccess: (data) => {
      setResults({
        id: Date.now().toString(),
        type: 'summary',
        data: data.data,
        createdAt: new Date().toISOString(),
        status: 'completed',
        summary: data.data,
      });
      updateStatus(PROCESSING_STATES.SUCCESS, 100, 'Summary generated successfully!');
    },
    onError: (error: Error) => {
      updateStatus(PROCESSING_STATES.ERROR, 0, '', error.message);
    },
  });

  // Mindmap generation mutation
  const generateMindmapMutation = useMutation({
    mutationFn: async (input: MindmapInput) => {
      updateStatus(PROCESSING_STATES.PROCESSING, 0, 'Generating mindmap...');
      return apiClient.createMindmap(input);
    },
    onSuccess: (data) => {
      console.log("Mindmap data received:", data);
      
      if (!data.success || !data.data) {
        updateStatus(PROCESSING_STATES.ERROR, 0, '', 'Invalid response from server');
        return;
      }
      
      setResults({
        id: Date.now().toString(),
        type: 'mindmap',
        data: data.data,
        createdAt: new Date().toISOString(),
        status: 'completed',
        mindmap: data.data,
      });
      updateStatus(PROCESSING_STATES.SUCCESS, 100, 'Mindmap generated successfully!');
    },
    onError: (error: Error) => {
      console.error("Mindmap generation error:", error);
      updateStatus(PROCESSING_STATES.ERROR, 0, '', error.message);
    },
  });

  // Quiz generation mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (input: MCQQuizInput) => {
      updateStatus(PROCESSING_STATES.PROCESSING, 0, 'Generating quiz...');
      return apiClient.createMCQQuiz(input);
    },
    onSuccess: (data) => {
      setResults({
        id: Date.now().toString(),
        type: 'quiz',
        data: data.data,
        createdAt: new Date().toISOString(),
        status: 'completed',
        quiz: data.data,
      });
      updateStatus(PROCESSING_STATES.SUCCESS, 100, 'Quiz generated successfully!');
    },
    onError: (error: Error) => {
      updateStatus(PROCESSING_STATES.ERROR, 0, '', error.message);
    },
  });

  // Flashcards generation mutation
  const generateFlashcardsMutation = useMutation({
    mutationFn: async (input: FlashcardInput) => {
      updateStatus(PROCESSING_STATES.PROCESSING, 0, 'Generating flashcards...');
      return apiClient.createFlashcards(input);
    },
    onSuccess: (data) => {
      console.log("Flashcards data received:", data);
      
      if (!data.success || !data.data) {
        updateStatus(PROCESSING_STATES.ERROR, 0, '', 'Invalid response from server');
        return;
      }
      
      // Process flashcards data
      const flashcardsData = data.data;
      
      // Check if we need to transform the data format
      let formattedData = flashcardsData;
      
      // Convert simple array format to the expected structure if needed
      if (Array.isArray(flashcardsData)) {
        formattedData = {
          total_cards: flashcardsData.length,
          flashcards: flashcardsData.map(card => {
            // If already in correct format
            if (card.front && card.back) {
              return card;
            }
            // Transform from Q&A format if needed
            if (card.question && card.answer) {
              return {
                front: card.question,
                back: card.answer,
                category: card.category || "General",
                difficulty: card.difficulty || "Medium"
              };
            }
            // Default format if structure is unknown
            return {
              front: Object.keys(card)[0] || "Question",
              back: Object.values(card)[0] || "Answer",
              category: "General",
              difficulty: "Medium"
            };
          })
        };
      }
      
      setResults({
        id: Date.now().toString(),
        type: 'flashcards',
        data: data.data,
        createdAt: new Date().toISOString(),
        status: 'completed',
        flashcards: formattedData,
      });
      updateStatus(PROCESSING_STATES.SUCCESS, 100, 'Flashcards generated successfully!');
    },
    onError: (error: Error) => {
      console.error("Flashcards generation error:", error);
      updateStatus(PROCESSING_STATES.ERROR, 0, '', error.message);
    },
  });

  // Exported functions
  const summarizeText = useCallback(
    (input: SummarizeTextInput) => summarizeTextMutation.mutate(input),
    [summarizeTextMutation]
  );

  const generateMindmap = useCallback(
    (input: MindmapInput) => generateMindmapMutation.mutate(input),
    [generateMindmapMutation]
  );

  const generateQuiz = useCallback(
    (input: MCQQuizInput) => generateQuizMutation.mutate(input),
    [generateQuizMutation]
  );

  const generateFlashcards = useCallback(
    (input: FlashcardInput) => generateFlashcardsMutation.mutate(input),
    [generateFlashcardsMutation]
  );

  return {
    processingStatus,
    results,
    summarizeText,
    generateMindmap,
    generateQuiz,
    generateFlashcards,
    resetProcessing,
    updateStatus,
    isProcessing: processingStatus.state === PROCESSING_STATES.PROCESSING,
    isIdle: processingStatus.state === PROCESSING_STATES.IDLE,
    hasResults: !!results,
  };
};

export { useProcessing };
export default useProcessing;
