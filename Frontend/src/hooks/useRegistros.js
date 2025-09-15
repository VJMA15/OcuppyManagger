import { useState, useEffect, useCallback } from 'react';
import registrosService from '../services/registros';

const useRegistros = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los registros
  const fetchRegistros = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.getRegistros(filtros);
      
      if (response.success) {
        setRegistros(response.data);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener registros';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un registro por ID
  const getRegistroById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.getRegistroById(id);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo registro
  const createRegistro = useCallback(async (registroData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.createRegistro(registroData);
      
      if (response.success) {
        // Agregar el nuevo registro al estado local
        setRegistros(prev => [response.data, ...prev]);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar entrada
  const registrarEntrada = useCallback(async (reservaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.registrarEntrada(reservaId);
      
      if (response.success) {
        // Agregar el nuevo registro al estado local
        setRegistros(prev => [response.data, ...prev]);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar entrada';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar salida
  const registrarSalida = useCallback(async (registroId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.registrarSalida(registroId);
      
      if (response.success) {
        // Actualizar el registro en el estado local
        setRegistros(prev => 
          prev.map(registro => 
            registro._id === registroId ? response.data : registro
          )
        );
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar salida';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener registros por ambiente
  const getRegistrosPorAmbiente = useCallback(async (ambienteId, filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registrosService.getRegistrosPorAmbiente(ambienteId, filtros);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener registros del ambiente';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar registros
  const refreshRegistros = useCallback(() => {
    return fetchRegistros();
  }, [fetchRegistros]);

  // Funciones de utilidad
  const getRegistrosActivos = useCallback(() => {
    return registros.filter(registro => registro.estado === 'activo');
  }, [registros]);

  const getRegistrosFinalizados = useCallback(() => {
    return registros.filter(registro => registro.estado === 'finalizado');
  }, [registros]);

  const getRegistrosByUsuario = useCallback((usuarioId) => {
    return registros.filter(registro => 
      registro.usuario && 
      (registro.usuario._id === usuarioId || registro.usuario === usuarioId)
    );
  }, [registros]);

  const getRegistrosByAmbiente = useCallback((ambienteId) => {
    return registros.filter(registro => 
      registro.ambiente && 
      (registro.ambiente._id === ambienteId || registro.ambiente === ambienteId)
    );
  }, [registros]);

  // Cargar registros al montar el componente
  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  return {
    // Estado
    registros,
    loading,
    error,
    
    // Acciones principales
    fetchRegistros,
    createRegistro,
    getRegistroById,
    registrarEntrada,
    registrarSalida,
    getRegistrosPorAmbiente,
    
    // Utilidades
    clearError,
    refreshRegistros,
    getRegistrosActivos,
    getRegistrosFinalizados,
    getRegistrosByUsuario,
    getRegistrosByAmbiente,
    
    // Estadísticas
    totalRegistros: registros.length,
    registrosActivos: getRegistrosActivos().length,
    registrosFinalizados: getRegistrosFinalizados().length
  };
};

export default useRegistros;