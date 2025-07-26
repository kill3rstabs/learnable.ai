// useFileUpload.ts
// Custom hook for file upload functionality

import { useState, useCallback, useRef } from 'react';
import { SUPPORTED_FILE_TYPES, API_CONFIG, ERROR_MESSAGES } from '@/lib/constants';
import type { UploadedFile, FileValidationResult } from '@/lib/types';

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type and size
  const validateFile = useCallback((file: File): FileValidationResult => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!SUPPORTED_FILE_TYPES.ALL.includes(extension)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE,
      };
    }

    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      };
    }

    return { isValid: true };
  }, []);

  // Create uploaded file object
  const createUploadedFile = useCallback((file: File): UploadedFile => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    return {
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
      uploadProgress: 0,
      status: 'pending',
    };
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const uploadedFile = createUploadedFile(file);
        newFiles.push(uploadedFile);
      } else {
        console.error(`File validation failed for ${file.name}:`, validation.error);
        // You might want to show a toast notification here
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }, [validateFile, createUploadedFile]);

  // Handle drag and drop
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
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  // Update file status
  const updateFileStatus = useCallback((
    fileId: string, 
    status: UploadedFile['status'], 
    progress?: number,
    error?: string
  ) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              status, 
              uploadProgress: progress ?? file.uploadProgress,
              error: error ?? file.error 
            }
          : file
      )
    );
  }, []);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Get files by type
  const getFilesByType = useCallback((type: 'audio' | 'video' | 'document') => {
    const typeExtensions = {
      audio: SUPPORTED_FILE_TYPES.AUDIO,
      video: SUPPORTED_FILE_TYPES.VIDEO,
      document: SUPPORTED_FILE_TYPES.DOCUMENTS,
    };

    return uploadedFiles.filter(file => 
      typeExtensions[type].includes(file.extension)
    );
  }, [uploadedFiles]);

  // Get total file size
  const getTotalFileSize = useCallback(() => {
    return uploadedFiles.reduce((total, file) => total + file.size, 0);
  }, [uploadedFiles]);

  // Check if files are valid
  const areFilesValid = useCallback(() => {
    return uploadedFiles.every(file => file.status !== 'error');
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isDragOver,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    removeFile,
    clearFiles,
    updateFileStatus,
    triggerFileInput,
    getFilesByType,
    getTotalFileSize,
    areFilesValid,
    validateFile,
  };
}; 