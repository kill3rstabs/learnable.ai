// api.ts
// API client for backend communication

import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './constants';
import type {
  ApiResponse,
  SummarizeTextInput,
  SummarizeTextOutput,
  MindmapInput,
  MindmapMultimediaInput,
  MindmapOutput,
  MCQQuizInput,
  MCQQuizMultimediaInput,
  MCQQuizOutput,
  FlashcardInput,
  FlashcardMultimediaInput,
  FlashcardOutput,
  ApiError
} from './types';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw this.handleError(error);
    }
  }

  private async makeFileRequest<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('makeFileRequest called with URL:', url);
    
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        // Set longer timeout for file uploads (5 minutes)
        xhr.timeout = 300000; // 5 minutes
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          console.log('XHR load event - status:', xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('XHR response data:', data);
              if (data.error) {
                reject(new Error(data.error));
              } else {
                resolve(data);
              }
            } catch (error) {
              console.error('XHR JSON parse error:', error);
              reject(new Error('Invalid JSON response'));
            }
          } else {
            console.error('XHR HTTP error - status:', xhr.status, 'response:', xhr.responseText);
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('XHR error occurred');
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('XHR timeout occurred');
          reject(new Error('Request timed out. Please try with a smaller file or check your connection.'));
        });

        xhr.addEventListener('abort', () => {
          console.error('XHR request was aborted');
          reject(new Error('Request was aborted'));
        });

        xhr.open('POST', url, true);
        
        // Don't set Content-Type header for FormData - let the browser set it with boundary
        console.log('Sending XHR request to:', url);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload failed:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>(API_ENDPOINTS.HEALTH_CHECK);
  }

  // Text summarization
  async summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
    return this.makeRequest<SummarizeTextOutput>(
      API_ENDPOINTS.SUMMARIZE_CONTENT,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  // File-based summarization
  async summarizeFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<SummarizeTextOutput> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeFileRequest<SummarizeTextOutput>(
      API_ENDPOINTS.SUMMARIZE_CONTENT,
      formData,
      onProgress
    );
  }

  // Multimedia summarization
  async summarizeMultimedia(
    audioFile?: File,
    videoFile?: File,
    documentFile?: File,
    text?: string,
    onProgress?: (progress: number) => void
  ): Promise<SummarizeTextOutput> {
    const formData = new FormData();
    
    if (text && text.trim()) {
      formData.append('data', JSON.stringify({ text }));
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (videoFile) {
      formData.append('video_file', videoFile);
    }
    if (documentFile) {
      formData.append('document_file', documentFile);
    }
    
    return this.makeFileRequest<SummarizeTextOutput>(
      API_ENDPOINTS.SUMMARIZE_CONTENT,
      formData,
      onProgress
    );
  }

  // Mindmap generation (text only)
  async generateMindmap(input: MindmapInput): Promise<MindmapOutput> {
    return this.makeRequest<MindmapOutput>(
      API_ENDPOINTS.GENERATE_MINDMAP,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  // Mindmap generation (multimedia)
  async generateMindmapMultimedia(
    audioFile?: File,
    videoFile?: File,
    documentFile?: File,
    topic?: string,
    onProgress?: (progress: number) => void
  ): Promise<MindmapOutput> {
    const formData = new FormData();
    
    if (topic && topic.trim()) {
      formData.append('data', JSON.stringify({ topic }));
    } else if (audioFile || videoFile || documentFile) {
      // Send empty data object when files are present but no topic
      formData.append('data', JSON.stringify({}));
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (videoFile) {
      formData.append('video_file', videoFile);
    }
    if (documentFile) {
      formData.append('document_file', documentFile);
    }
    
    return this.makeFileRequest<MindmapOutput>(
      API_ENDPOINTS.GENERATE_MINDMAP_MULTIMEDIA,
      formData,
      onProgress
    );
  }

  // MCQ Quiz generation (text only)
  async generateMCQQuiz(input: MCQQuizInput): Promise<MCQQuizOutput> {
    console.log('API Client - generateMCQQuiz input:', input);
    console.log('API Client - JSON body:', JSON.stringify(input));
    return this.makeRequest<MCQQuizOutput>(
      API_ENDPOINTS.GENERATE_MCQ_QUIZ,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  // MCQ Quiz generation (multimedia)
  async generateMCQQuizMultimedia(
    audioFile?: File,
    videoFile?: File,
    documentFile?: File,
    content?: string,
    numQuestions: number = 10,
    onProgress?: (progress: number) => void
  ): Promise<MCQQuizOutput> {
    const formData = new FormData();
    
    if (content && content.trim()) {
      formData.append('data', JSON.stringify({ content, num_questions: numQuestions }));
    } else {
      formData.append('data', JSON.stringify({ num_questions: numQuestions }));
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (videoFile) {
      formData.append('video_file', videoFile);
    }
    if (documentFile) {
      formData.append('document_file', documentFile);
    }
    
    return this.makeFileRequest<MCQQuizOutput>(
      API_ENDPOINTS.GENERATE_MCQ_QUIZ_MULTIMEDIA,
      formData,
      onProgress
    );
  }

  // Flashcard generation (text only)
  async generateFlashcards(input: FlashcardInput): Promise<FlashcardOutput> {
    return this.makeRequest<FlashcardOutput>(
      API_ENDPOINTS.GENERATE_FLASHCARDS,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  // Flashcard generation (multimedia)
  async generateFlashcardsMultimedia(
    audioFile?: File,
    videoFile?: File,
    documentFile?: File,
    content?: string,
    onProgress?: (progress: number) => void
  ): Promise<FlashcardOutput> {
    console.log('generateFlashcardsMultimedia called with:', { audioFile, videoFile, documentFile, content });
    const formData = new FormData();
    
    if (content && content.trim()) {
      formData.append('data', JSON.stringify({ content }));
    } else if (audioFile || videoFile || documentFile) {
      // Send empty data object when files are present but no content
      formData.append('data', JSON.stringify({}));
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (videoFile) {
      formData.append('video_file', videoFile);
    }
    if (documentFile) {
      formData.append('document_file', documentFile);
    }
    
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    return this.makeFileRequest<FlashcardOutput>(
      API_ENDPOINTS.GENERATE_FLASHCARDS_MULTIMEDIA,
      formData,
      onProgress
    );
  }

  // Process all types (summary, mindmap, quiz, flashcards) from multimedia
  async processMultimedia(
    audioFile?: File,
    videoFile?: File,
    documentFile?: File,
    text?: string,
    onProgress?: (progress: number) => void
  ): Promise<{
    summary: SummarizeTextOutput;
    mindmap: MindmapOutput;
    quiz: MCQQuizOutput;
    flashcards: FlashcardOutput;
  }> {
    const results = await Promise.all([
      this.summarizeMultimedia(audioFile, videoFile, documentFile, text, onProgress),
      this.generateMindmapMultimedia(audioFile, videoFile, documentFile, text, onProgress),
      this.generateMCQQuizMultimedia(audioFile, videoFile, documentFile, text, 10, onProgress),
      this.generateFlashcardsMultimedia(audioFile, videoFile, documentFile, text, onProgress),
    ]);

    return {
      summary: results[0],
      mindmap: results[1],
      quiz: results[2],
      flashcards: results[3],
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 