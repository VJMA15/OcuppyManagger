import { useState, useEffect, useCallback } from 'react';
import reportesService from '../services/reportes';
import { useAuthContext } from '../contexts/auth-context';

/**
 * Hook personalizado para gestión de reportes y estadísticas
 */
export const useReportes = () => {
  const { user } = useAuthContext();
  
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [reporteReservas, setReporteReservas] = useState(null);
  const [reporteEntregas, setReporteEntregas] = useState(null);
  const [reporteUsoAmbientes, setReporteUsoAmbientes] = useState(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    formato: 'json',
    estado: '',
    ambiente: '',
    usuario: '',
    jornada: '',
    instructor: ''
  });
  
  // Estados para datos auxiliares
  const [formatosDisponibles] = useState(reportesService.obtenerFormatosDisponibles());
  const [estadosReservas] = useState(reportesService.obtenerEstadosReservas());
  const [estadosEntregas] = useState(reportesService.obtenerEstadosEntregas());
  const [jornadas] = useState(reportesService.obtenerJornadas());
  
  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Actualizar filtros
   */
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);
  
  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      formato: 'json',
      estado: '',
      ambiente: '',
      usuario: '',
      jornada: '',
      instructor: ''
    });
  }, []);
  
  /**
   * Obtener estadísticas generales
   */
  const obtenerEstadisticasGenerales = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin
      };
      
      // Validar fechas
      if (parametros.fechaInicio && parametros.fechaFin) {
        const validacion = reportesService.validarFechas(parametros.fechaInicio, parametros.fechaFin);
        if (!validacion.valido) {
          throw new Error(validacion.errores.join(', '));
        }
      }
      
      const response = await reportesService.obtenerEstadisticasGenerales(parametros);
      setEstadisticasGenerales(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener estadísticas generales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);
  
  /**
   * Generar reporte de reservas
   */
  const generarReporteReservas = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin,
        formato: params.formato || filtros.formato,
        estado: params.estado || filtros.estado,
        ambiente: params.ambiente || filtros.ambiente,
        usuario: params.usuario || filtros.usuario
      };
      
      // Validar fechas si están presentes
      if (parametros.fechaInicio && parametros.fechaFin) {
        const validacion = reportesService.validarFechas(parametros.fechaInicio, parametros.fechaFin);
        if (!validacion.valido) {
          throw new Error(validacion.errores.join(', '));
        }
      }
      
      const response = await reportesService.generarReporteReservas(parametros);
      
      if (parametros.formato === 'json') {
        setReporteReservas(response.data);
        return response.data;
      } else {
        // Descargar archivo
        reportesService.descargarArchivo(response.blob, response.filename);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de reservas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  /**
   * Generar reporte de entregas
   */
  const generarReporteEntregas = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin,
        formato: params.formato || filtros.formato,
        estado: params.estado || filtros.estado,
        jornada: params.jornada || filtros.jornada,
        instructor: params.instructor || filtros.instructor
      };
      
      // Validar fechas si están presentes
      if (parametros.fechaInicio && parametros.fechaFin) {
        const validacion = reportesService.validarFechas(parametros.fechaInicio, parametros.fechaFin);
        if (!validacion.valido) {
          throw new Error(validacion.errores.join(', '));
        }
      }
      
      const response = await reportesService.generarReporteEntregas(parametros);
      
      if (parametros.formato === 'json') {
        setReporteEntregas(response.data);
        return response.data;
      } else {
        // Descargar archivo
        reportesService.descargarArchivo(response.blob, response.filename);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de entregas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  /**
   * Generar reporte de uso de ambientes
   */
  const generarReporteUsoAmbientes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin,
        formato: params.formato || filtros.formato
      };
      
      // Validar fechas si están presentes
      if (parametros.fechaInicio && parametros.fechaFin) {
        const validacion = reportesService.validarFechas(parametros.fechaInicio, parametros.fechaFin);
        if (!validacion.valido) {
          throw new Error(validacion.errores.join(', '));
        }
      }
      
      const response = await reportesService.generarReporteUsoAmbientes(parametros);
      
      if (parametros.formato === 'json') {
        setReporteUsoAmbientes(response.data);
        return response.data;
      } else {
        // Descargar archivo
        reportesService.descargarArchivo(response.blob, response.filename);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de uso de ambientes';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  /**
   * Obtener mis reportes de reservas (para instructores)
   */
  const obtenerMisReportesReservas = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin,
        formato: params.formato || filtros.formato
      };
      
      const response = await reportesService.obtenerMisReportesReservas(parametros);
      
      if (parametros.formato === 'json') {
        setReporteReservas(response.data);
        return response.data;
      } else {
        reportesService.descargarArchivo(response.blob, response.filename);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener mis reportes de reservas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  /**
   * Obtener mis reportes de entregas (para instructores)
   */
  const obtenerMisReportesEntregas = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        fechaInicio: params.fechaInicio || filtros.fechaInicio,
        fechaFin: params.fechaFin || filtros.fechaFin,
        formato: params.formato || filtros.formato
      };
      
      const response = await reportesService.obtenerMisReportesEntregas(parametros);
      
      if (parametros.formato === 'json') {
        setReporteEntregas(response.data);
        return response.data;
      } else {
        reportesService.descargarArchivo(response.blob, response.filename);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener mis reportes de entregas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  /**
   * Obtener estadísticas de mi turno (para guardias)
   */
  const obtenerEstadisticasMiTurno = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportesService.obtenerEstadisticasMiTurno(params);
      setEstadisticasGenerales(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener estadísticas de mi turno';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Formatear datos para gráficos
   */
  const formatearDatosGrafico = useCallback((datos, tipo = 'pie') => {
    return reportesService.formatearDatosGrafico(datos, tipo);
  }, []);
  
  /**
   * Obtener rango de fechas predefinido
   */
  const establecerRangoFechas = useCallback((tipo) => {
    const hoy = new Date();
    let fechaInicio, fechaFin;
    
    switch (tipo) {
      case 'hoy':
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'trimestre':
        const trimestre = Math.floor(hoy.getMonth() / 3);
        fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    actualizarFiltros({ fechaInicio, fechaFin });
  }, [actualizarFiltros]);
  
  /**
   * Validar permisos según el rol del usuario
   */
  const validarPermisos = useCallback((accion) => {
    if (!user) return false;
    
    const permisos = {
      'estadisticas-generales': ['admin'],
      'reporte-reservas': ['admin', 'guardia'],
      'reporte-entregas': ['admin', 'guardia'],
      'reporte-uso-ambientes': ['admin'],
      'mis-reportes': ['instructor'],
      'estadisticas-turno': ['guardia']
    };
    
    return permisos[accion]?.includes(user.role) || false;
  }, [user]);
  
  /**
   * Obtener opciones de rango de fechas
   */
  const opcionesRangoFechas = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Última semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'trimestre', label: 'Este trimestre' },
    { value: 'año', label: 'Este año' }
  ];
  
  // Efecto para limpiar datos cuando cambian los filtros principales
  useEffect(() => {
    setReporteReservas(null);
    setReporteEntregas(null);
    setReporteUsoAmbientes(null);
  }, [filtros.fechaInicio, filtros.fechaFin]);
  
  return {
    // Estados
    loading,
    error,
    estadisticasGenerales,
    reporteReservas,
    reporteEntregas,
    reporteUsoAmbientes,
    filtros,
    
    // Datos auxiliares
    formatosDisponibles,
    estadosReservas,
    estadosEntregas,
    jornadas,
    opcionesRangoFechas,
    
    // Funciones principales
    obtenerEstadisticasGenerales,
    generarReporteReservas,
    generarReporteEntregas,
    generarReporteUsoAmbientes,
    obtenerMisReportesReservas,
    obtenerMisReportesEntregas,
    obtenerEstadisticasMiTurno,
    
    // Funciones auxiliares
    actualizarFiltros,
    limpiarFiltros,
    limpiarError,
    formatearDatosGrafico,
    establecerRangoFechas,
    validarPermisos,
    
    // Utilidades
    validarFechas: reportesService.validarFechas,
    descargarArchivo: reportesService.descargarArchivo
  };
};

export default useReportes;