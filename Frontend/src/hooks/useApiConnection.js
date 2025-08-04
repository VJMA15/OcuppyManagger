import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useApiConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.testConnection();
      setIsConnected(result.success);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    testConnection
  };
};

export default useApiConnection; 