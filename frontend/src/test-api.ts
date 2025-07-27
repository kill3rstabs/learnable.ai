// Simple API test script
import { ApiClient } from './lib/api';

const apiClient = new ApiClient();

// Test summarization
async function testSummarize() {
  try {
    const response = await apiClient.summarizeContent({ 
      text: "Artificial Intelligence (AI) is a field of computer science focused on creating machines that can perform tasks typically requiring human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. Machine learning, a subset of AI, involves algorithms that improve through experience. Deep learning, a subset of machine learning, uses neural networks with many layers to analyze various factors of data. AI systems can be categorized as either narrow AI (designed for specific tasks) or general AI (capable of performing any intellectual task a human can do). The field raises important ethical considerations around privacy, bias, accountability, and potential impacts on employment."
    });
    console.log("Summarize Test:", response);
    return response.success;
  } catch (error) {
    console.error("Summarize API Error:", error);
    return false;
  }
}

// Test mindmap generation
async function testMindmap() {
  try {
    const response = await apiClient.createMindmap({ 
      topic: "Artificial Intelligence" 
    });
    console.log("Mindmap Test:", response);
    return response.success;
  } catch (error) {
    console.error("Mindmap API Error:", error);
    return false;
  }
}

// Test quiz generation
async function testQuiz() {
  try {
    const response = await apiClient.createMCQQuiz({ 
      content: "Artificial Intelligence (AI) is a field of computer science focused on creating machines that can perform tasks typically requiring human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. Machine learning, a subset of AI, involves algorithms that improve through experience. Deep learning, a subset of machine learning, uses neural networks with many layers to analyze various factors of data.",
      num_questions: 3
    });
    console.log("Quiz Test:", response);
    return response.success;
  } catch (error) {
    console.error("Quiz API Error:", error);
    return false;
  }
}

// Test flashcard generation
async function testFlashcards() {
  try {
    const response = await apiClient.createFlashcards({ 
      content: "Artificial Intelligence (AI) is a field of computer science focused on creating machines that can perform tasks typically requiring human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding." 
    });
    console.log("Flashcards Test:", response);
    return response.success;
  } catch (error) {
    console.error("Flashcards API Error:", error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("Starting API tests...");
  
  const summaryResult = await testSummarize();
  const mindmapResult = await testMindmap();
  const quizResult = await testQuiz();
  const flashcardsResult = await testFlashcards();
  
  console.log("Test Results:", {
    summary: summaryResult,
    mindmap: mindmapResult,
    quiz: quizResult,
    flashcards: flashcardsResult
  });
}

export { runTests };
