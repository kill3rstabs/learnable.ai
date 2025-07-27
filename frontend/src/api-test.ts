// API Test File
// Run this file directly to test API connectivity

import { ApiClient } from './lib/api';

const apiClient = new ApiClient();

async function testMindmapAPI() {
  try {
    console.log("Testing mindmap API...");
    const response = await apiClient.createMindmap({
      topic: "Artificial Intelligence"
    });
    console.log("API Response:", JSON.stringify(response, null, 2));
    return response.success;
  } catch (error) {
    console.error("API Error:", error);
    return false;
  }
}

// Run the test
testMindmapAPI().then(success => {
  console.log("API Test Result:", success ? "SUCCESS" : "FAILURE");
});
