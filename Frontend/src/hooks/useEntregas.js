import { useState, useEffect, useCallback } from 'react';
import entregasService from '../services/entregas';

const useEntregas = () => {
  // Estados principales
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  
  // Estados para filtros y paginación
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    estado: '',
    jornada: '',
    instructor: '',
    ambiente: '',
    fechaInicio: '',
    fechaFin: '',
    search: ''
  });
  
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Obtener entregas con filtros
  const fetchEntregas = useCallback(async (filtrosPersonalizados = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosAUsar = filtrosPersonalizados || filtros;
      const response = await entregasService.obtenerEntregas(filtrosAUsar);
      
      if (response.success) {
        setEntregas(response.data || []);
        if (response.pagination) {
          setPaginacion(response.pagination);
        }
      } else {
        throw new Error(response.message || 'Error al obtener entregas');
      }
    } catch (err) {
      setError(err.message);
      setEntregas([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Crear nueva entrega
  const crearEntrega = async (datosEntrega) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar datos antes de enviar
      const erroresValidacion = entregasService.validarDatosEntrega(datosEntrega);
      if (erroresValidacion.length > 0) {
        throw new Error(erroresValidacion.join(', '));
      }
      
      const response = await entregasService.crearEntrega(datosEntrega);
      
      if (response.success) {
        // Actualizar la lista de entregas
        await fetchEntregas();
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear entrega');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Devolver entrega
  const devolverEntrega = async (id, observaciones = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.devolverEntrega(id, observaciones);
      
      if (response.success) {
        // Actualizar la entrega en el estado local
        setEntregas(prev => prev.map(entrega => 
          entrega._id === id ? { ...entrega, ...response.data } : entrega
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Error al devolver entrega');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar entrega
  const cancelarEntrega = async (id, motivo = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.cancelarEntrega(id, motivo);
      
      if (response.success) {
        // Actualizar la entrega en el estado local
        setEntregas(prev => prev.map(entrega => 
          entrega._id === id ? { ...entrega, ...response.data } : entrega
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Error al cancelar entrega');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener entrega por ID
  const obtenerEntregaPorId = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerEntregaPorId(id);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener entrega');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener entregas por jornada
  const obtenerEntregasPorJornada = async (jornada, fecha = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerEntregasPorJornada(jornada, fecha);
      
      if (response.success) {
        setEntregas(response.data || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener entregas por jornada');
      }
    } catch (err) {
      setError(err.message);
      setEntregas([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener entregas vencidas
  const obtenerEntregasVencidas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerEntregasVencidas();
      
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.message || 'Error al obtener entregas vencidas');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas
  const fetchEstadisticas = async (fechaInicio = null, fechaFin = null) => {
    try {
      setError(null);
      
      const response = await entregasService.obtenerEstadisticasEntregas(fechaInicio, fechaFin);
      
      if (response.success) {
        setEstadisticas(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verificar entrega por código
  const verificarEntregaPorCodigo = async (codigo) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.verificarEntregaPorCodigo(codigo);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Código de verificación no válido');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Métodos específicos para instructores
  const obtenerMisEntregas = async (filtrosPersonalizados = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerMisEntregas(filtrosPersonalizados);
      
      if (response.success) {
        setEntregas(response.data || []);
        if (response.pagination) {
          setPaginacion(response.pagination);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener mis entregas');
      }
    } catch (err) {
      setError(err.message);
      setEntregas([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Métodos específicos para guardias
  const obtenerEntregasDeMiTurno = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerEntregasDeMiTurno();
      
      if (response.success) {
        setEntregas(response.data || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener entregas del turno');
      }
    } catch (err) {
      setError(err.message);
      setEntregas([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const obtenerMisEntregasComoGuardia = async (filtrosPersonalizados = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await entregasService.obtenerMisEntregasComoGuardia(filtrosPersonalizados);
      
      if (response.success) {
        setEntregas(response.data || []);
        if (response.pagination) {
          setPaginacion(response.pagination);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener mis entregas como guardia');
      }
    } catch (err) {
      setError(err.message);
      setEntregas([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros, page: 1 }));
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      limit: 10,
      estado: '',
      jornada: '',
      instructor: '',
      ambiente: '',
      fechaInicio: '',
      fechaFin: '',
      search: ''
    });
  };

  // Limpiar error
  const limpiarError = () => {
    setError(null);
  };

  // Utilidades
  const obtenerJornadaActual = () => {
    return entregasService.determinarJornadaActual();
  };

  const formatearFecha = (fecha) => {
    return entregasService.formatearFecha(fecha);
  };

  const formatearHora = (fecha) => {
    return entregasService.formatearHora(fecha);
  };

  const calcularTiempoTranscurrido = (fechaEntrega) => {
    return entregasService.calcularTiempoTranscurrido(fechaEntrega);
  };

  const esEntregaVencida = (fechaEntrega, estado) => {
    return entregasService.esEntregaVencida(fechaEntrega, estado);
  };

  const obtenerColorEstado = (estado) => {
    return entregasService.obtenerColorEstado(estado);
  };

  const obtenerTextoEstado = (estado) => {
    return entregasService.obtenerTextoEstado(estado);
  };

  // Generar reporte
  const generarReporte = async (filtrosReporte = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const reporte = await entregasService.generarReporteEntregas(filtrosReporte);
      return reporte;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen rápido
  const obtenerResumenRapido = () => {
    if (!entregas.length) return null;
    
    const resumen = {
      total: entregas.length,
      entregados: entregas.filter(e => e.estado === 'entregado').length,
      devueltos: entregas.filter(e => e.estado === 'devuelto').length,
      cancelados: entregas.filter(e => e.estado === 'cancelado').length,
      vencidos: entregas.filter(e => 
        entregasService.esEntregaVencida(e.fechaEntrega, e.estado)
      ).length
    };
    
    return resumen;
  };

  // Efecto para cargar entregas cuando cambian los filtros
  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  return {
    // Estados
    entregas,
    loading,
    error,
    estadisticas,
    filtros,
    paginacion,
    
    // Acciones principales
    fetchEntregas,
    crearEntrega,
    devolverEntrega,
    cancelarEntrega,
    obtenerEntregaPorId,
    
    // Consultas específicas
    obtenerEntregasPorJornada,
    obtenerEntregasVencidas,
    fetchEstadisticas,
    verificarEntregaPorCodigo,
    
    // Métodos por rol
    obtenerMisEntregas,
    obtenerEntregasDeMiTurno,
    obtenerMisEntregasComoGuardia,
    
    // Gestión de filtros
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    
    // Utilidades
    limpiarError,
    obtenerJornadaActual,
    formatearFecha,
    formatearHora,
    calcularTiempoTranscurrido,
    esEntregaVencida,
    obtenerColorEstado,
    obtenerTextoEstado,
    generarReporte,
    obtenerResumenRapido
  };
};

export default useEntregas;