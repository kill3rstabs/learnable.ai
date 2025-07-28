// constants.ts
// Development vs Production API URLs
export const is_dev = import.meta.env.DEV;

// API Configuration
export const API_CONFIG = {
  BASE_URL: is_dev 
    ? 'http://localhost:8000/api' 
    : 'https://your-production-domain.com/api', // Update this with your production URL
  TIMEOUT: 300000, // 5 minutes for large file uploads
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
};

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.docx', '.doc'],
  AUDIO: ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'],
  VIDEO: ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'],
  ALL: ['.pdf', '.docx', '.doc', '.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v']
};

// File type labels for UI
export const FILE_TYPE_LABELS = {
  '.pdf': 'PDF Document',
  '.docx': 'Word Document',
  '.doc': 'Word Document',
  '.mp3': 'Audio File',
  '.wav': 'Audio File',
  '.m4a': 'Audio File',
  '.flac': 'Audio File',
  '.aac': 'Audio File',
  '.ogg': 'Audio File',
  '.mp4': 'Video File',
  '.avi': 'Video File',
  '.mov': 'Video File',
  '.mkv': 'Video File',
  '.wmv': 'Video File',
  '.flv': 'Video File',
  '.webm': 'Video File',
  '.m4v': 'Video File',
};

// API Endpoints
export const API_ENDPOINTS = {
  SUMMARIZE_CONTENT: '/learning/summarize-content',
  GENERATE_MINDMAP: '/learning/generate-mindmap',
  GENERATE_MINDMAP_MULTIMEDIA: '/learning/generate-mindmap-multimedia',
  GENERATE_MCQ_QUIZ: '/learning/generate-mcq-quiz',
  GENERATE_MCQ_QUIZ_MULTIMEDIA: '/learning/generate-mcq-quiz-multimedia',
  GENERATE_FLASHCARDS: '/learning/generate-flashcards',
  GENERATE_FLASHCARDS_MULTIMEDIA: '/learning/generate-flashcards-multimedia',
  HEALTH_CHECK: '/learning/hello',
};

// Processing states
export const PROCESSING_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 50MB',
  UNSUPPORTED_FILE_TYPE: 'This file type is not supported',
  API_KEY_MISSING: 'API key is required. Please configure it in Settings.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PROCESSING_ERROR: 'Error processing your file. Please try again.',
  UPLOAD_ERROR: 'Error uploading file. Please try again.',
} as const; 