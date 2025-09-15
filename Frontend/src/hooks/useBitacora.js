import { useState, useEffect, useCallback } from 'react';
import bitacoraService from '../services/bitacora';

const useBitacora = () => {
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});

  // Obtener todos los registros de bitácora
  const fetchBitacora = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bitacoraService.getBitacora(filtros);
      
      if (response.success) {
        setBitacora(response.data);
        // No establecer error si la respuesta es exitosa, incluso si no hay datos
        setError(null);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener bitácora';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un registro de bitácora por ID
  const getBitacoraById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bitacoraService.getBitacoraById(id);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener registro de bitácora';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo registro de bitácora
  const createBitacora = useCallback(async (bitacoraData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bitacoraService.createBitacora(bitacoraData);
      
      if (response.success) {
        // Agregar el nuevo registro al estado local
        setBitacora(prev => [response.data, ...prev]);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear registro de bitácora';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener bitácora por entidad
  const getBitacoraPorEntidad = useCallback(async (entidad, entidadId = null, filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bitacoraService.getBitacoraPorEntidad(entidad, entidadId, filtros);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener bitácora de la entidad';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar acción en bitácora
  const registrarAccion = useCallback(async (accion, entidad, entidadId, detalles = {}) => {
    try {
      const response = await bitacoraService.registrarAccion(accion, entidad, entidadId, detalles);
      
      if (response.success) {
        // Agregar el nuevo registro al estado local si estamos viendo la bitácora
        setBitacora(prev => [response.data, ...prev]);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar acción';
      console.error('❌ Error al registrar acción en bitácora:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Obtener estadísticas de bitácora
  const fetchEstadisticas = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bitacoraService.getEstadisticasBitacora(filtros);
      
      if (response.success) {
        setEstadisticas(response.data);
        return response;
      } else {
        setError(response.error);
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener estadísticas';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar bitácora
  const refreshBitacora = useCallback(() => {
    return fetchBitacora();
  }, [fetchBitacora]);

  // Funciones de utilidad
  const getBitacoraPorAccion = useCallback((accion) => {
    return bitacora.filter(registro => registro.accion === accion);
  }, [bitacora]);

  const getBitacoraPorUsuario = useCallback((usuarioId) => {
    return bitacora.filter(registro => 
      registro.usuario && 
      (registro.usuario._id === usuarioId || registro.usuario === usuarioId)
    );
  }, [bitacora]);

  const getBitacoraPorEntidadLocal = useCallback((entidad) => {
    return bitacora.filter(registro => registro.entidad === entidad);
  }, [bitacora]);

  const getBitacoraReciente = useCallback((limite = 10) => {
    return bitacora
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limite);
  }, [bitacora]);

  // Funciones de análisis
  const getAccionesMasComunes = useCallback(() => {
    const conteoAcciones = bitacora.reduce((acc, registro) => {
      acc[registro.accion] = (acc[registro.accion] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(conteoAcciones)
      .sort(([,a], [,b]) => b - a)
      .map(([accion, cantidad]) => ({ accion, cantidad }));
  }, [bitacora]);

  const getUsuariosMasActivos = useCallback(() => {
    const conteoUsuarios = bitacora.reduce((acc, registro) => {
      const usuarioId = registro.usuario?._id || registro.usuario;
      const usuarioNombre = registro.usuario?.nombre || 'Usuario desconocido';
      
      if (usuarioId) {
        acc[usuarioId] = {
          nombre: usuarioNombre,
          cantidad: (acc[usuarioId]?.cantidad || 0) + 1
        };
      }
      
      return acc;
    }, {});
    
    return Object.entries(conteoUsuarios)
      .sort(([,a], [,b]) => b.cantidad - a.cantidad)
      .map(([id, data]) => ({ id, ...data }));
  }, [bitacora]);

  // Cargar bitácora al montar el componente
  useEffect(() => {
    fetchBitacora();
  }, [fetchBitacora]);

  return {
    // Estado
    bitacora,
    loading,
    error,
    estadisticas,
    
    // Acciones principales
    fetchBitacora,
    createBitacora,
    getBitacoraById,
    getBitacoraPorEntidad,
    registrarAccion,
    fetchEstadisticas,
    
    // Utilidades
    clearError,
    refreshBitacora,
    getBitacoraPorAccion,
    getBitacoraPorUsuario,
    getBitacoraPorEntidadLocal,
    getBitacoraReciente,
    
    // Análisis
    getAccionesMasComunes,
    getUsuariosMasActivos,
    
    // Estadísticas
    totalRegistros: bitacora.length,
    registrosHoy: bitacora.filter(registro => {
      const hoy = new Date().toDateString();
      const fechaRegistro = new Date(registro.createdAt).toDateString();
      return fechaRegistro === hoy;
    }).length
  };
};

export default useBitacora;