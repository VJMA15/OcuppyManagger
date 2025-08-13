import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useAmbientes = () => {
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmbientes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAmbientes();
      
      if (response.success) {
        setAmbientes(response.data);
      } else {
        setError('Error al cargar ambientes');
      }
    } catch (err) {
      console.error('Error fetching ambientes:', err);
      setError('Error al cargar ambientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbientes();
  }, []);

  const createAmbiente = async (ambienteData) => {
    try {
      const response = await apiService.createAmbiente(ambienteData);
      if (response.success) {
        setAmbientes(prev => [...prev, response.data]);
        return response;
      }
    } catch (err) {
      console.error('Error creating ambiente:', err);
      throw err;
    }
  };

  return {
    ambientes,
    loading,
    error,
    fetchAmbientes,
    createAmbiente
  };
};

export default useAmbientes;