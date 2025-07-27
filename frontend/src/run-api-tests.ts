// API Test Runner Script
import { runTests } from './test-api';

// Run all API tests
console.log('=== API TESTING ===');
runTests()
  .then(() => {
    console.log('All tests completed');
  })
  .catch((error) => {
    console.error('Error running tests:', error);
  });
