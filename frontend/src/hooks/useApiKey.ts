// useApiKey.ts
// Custom hook for API key management

import { useState, useEffect } from 'react';
import { ERROR_MESSAGES } from '@/lib/constants';

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = () => {
      const storedApiKey = localStorage.getItem('gemini_api_key');
      setApiKey(storedApiKey);
      setHasApiKey(!!storedApiKey);
    };

    checkApiKey();
    
    // Listen for storage changes (in case API key is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gemini_api_key') {
        checkApiKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically (in case API key is updated in same tab)
    const interval = setInterval(checkApiKey, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const saveApiKey = (key: string) => {
    if (!key.trim()) {
      throw new Error('API key cannot be empty');
    }
    
    localStorage.setItem('gemini_api_key', key.trim());
    setApiKey(key.trim());
    setHasApiKey(true);
  };

  const removeApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey(null);
    setHasApiKey(false);
  };

  const validateApiKey = (): boolean => {
    if (!hasApiKey) {
      throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
    }
    return true;
  };

  return {
    hasApiKey,
    apiKey,
    saveApiKey,
    removeApiKey,
    validateApiKey,
  };
}; 