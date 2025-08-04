import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useAmbientes = () => {
  const [ambientes, setAmbientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmbientes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAmbientes();
      // Cambiar esta línea:
      // setAmbientes(response.data || []);
      // Por esta:
   setAmbientes(response.data?.ambientes || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ambientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createAmbiente = async (ambienteData) => {
    try {
      const response = await apiService.createAmbiente(ambienteData);
      setAmbientes(prev => [...prev, response.data]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAmbiente = async (id, ambienteData) => {
    try {
      const response = await apiService.updateAmbiente(id, ambienteData);
      setAmbientes(prev => 
        prev.map(ambiente => 
          ambiente._id === id ? response.data : ambiente
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAmbiente = async (id) => {
    try {
      await apiService.deleteAmbiente(id);
      setAmbientes(prev => prev.filter(ambiente => ambiente._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAmbientes();
  }, []);

  return {
    ambientes,
    isLoading,
    error,
    fetchAmbientes,
    createAmbiente,
    updateAmbiente,
    deleteAmbiente
  };
};

export default useAmbientes;