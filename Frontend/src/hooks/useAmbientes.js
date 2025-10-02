import { useState, useEffect } from 'react';
import ambientesService from '@/services/ambientesService';

export const useAmbientes = () => {
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmbientes = async () => {
    try {
      setLoading(true);
      const response = await ambientesService.getAmbientes();
      
      if (response.success) {
        setAmbientes(response.data);
      } else {
        setError(response.error || 'Error al cargar ambientes');
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
      const response = await ambientesService.createAmbiente(ambienteData);
      if (response.success) {
        setAmbientes(prev => [...prev, response.data]);
        return response;
      } else {
        throw new Error(response.error || 'Error al crear ambiente');
      }
    } catch (err) {
      console.error('Error creating ambiente:', err);
      throw err;
    }
  };

  const updateAmbiente = async (id, ambienteData) => {
    try {
      const response = await ambientesService.updateAmbiente(id, ambienteData);
      if (response.success) {
        setAmbientes(prev => 
          prev.map(ambiente => 
            ambiente._id === id ? response.data : ambiente
          )
        );
        return response;
      } else {
        throw new Error(response.error || 'Error al actualizar ambiente');
      }
    } catch (err) {
      console.error('Error updating ambiente:', err);
      throw err;
    }
  };

  const deleteAmbiente = async (id) => {
    try {
      const response = await ambientesService.deleteAmbiente(id);
      if (response.success) {
        setAmbientes(prev => prev.filter(ambiente => ambiente._id !== id));
        return response;
      } else {
        throw new Error(response.error || 'Error al eliminar ambiente');
      }
    } catch (err) {
      console.error('Error deleting ambiente:', err);
      throw err;
    }
  };

  return {
    ambientes,
    loading,
    error,
    fetchAmbientes,
    createAmbiente,
    updateAmbiente,
    deleteAmbiente
  };
};

export default useAmbientes;