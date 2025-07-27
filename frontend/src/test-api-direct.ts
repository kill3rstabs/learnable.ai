// test-api-direct.ts
// Script to directly test API endpoints

import apiClient from './lib/api';

// Test function to check all features
async function testAllFeatures() {
  console.log("=== Testing Learnable.AI API ===");

  try {
    // 1. Test mindmap generation with a simple topic
    console.log("\n--- Testing Mindmap Generation ---");
    const mindmapResult = await apiClient.createMindmap({ topic: "Machine Learning Fundamentals" });
    console.log("Mindmap Result:", mindmapResult);
    console.log("Mindmap Data Structure:", JSON.stringify(mindmapResult.data, null, 2));

    // 2. Test YouTube URL processing for mindmap
    console.log("\n--- Testing YouTube Mindmap ---");
    const youtubeResult = await apiClient.createMindmap({ 
      youtubeUrl: "https://www.youtube.com/watch?v=aircAruvnKk" 
    });
    console.log("YouTube Mindmap Result:", youtubeResult);

    // 3. Test flashcards generation
    console.log("\n--- Testing Flashcards Generation ---");
    const flashcardsResult = await apiClient.createFlashcards({ 
      content: "Machine Learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. It focuses on the development of computer programs that can access data and use it to learn for themselves."
    });
    console.log("Flashcards Result:", flashcardsResult);
    console.log("Flashcards Structure:", JSON.stringify(flashcardsResult.data, null, 2));

    // 4. Test quiz generation
    console.log("\n--- Testing Quiz Generation ---");
    const quizResult = await apiClient.createMCQQuiz({ 
      content: "Machine Learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. It focuses on the development of computer programs that can access data and use it to learn for themselves.", 
      num_questions: 3
    });
    console.log("Quiz Result:", quizResult);
    console.log("Quiz Structure:", JSON.stringify(quizResult.data, null, 2));

  } catch (error) {
    console.error("Error during tests:", error);
  }
}

// Run tests
testAllFeatures();

// Export the test function for use in browser console
export { testAllFeatures };
