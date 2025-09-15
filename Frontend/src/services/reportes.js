import api from './api';

/**
 * Servicio para gestión de reportes y estadísticas
 */
class ReportesService {
  /**
   * Obtener estadísticas generales del sistema
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} params.fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Estadísticas generales
   */
  async obtenerEstadisticasGenerales(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.fechaInicio) {
        queryParams.append('fechaInicio', params.fechaInicio);
      }
      
      if (params.fechaFin) {
        queryParams.append('fechaFin', params.fechaFin);
      }
      
      const response = await api.get(`/api/v1/reportes/estadisticas?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de reservas
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.fechaInicio - Fecha de inicio
   * @param {string} params.fechaFin - Fecha de fin
   * @param {string} params.formato - Formato del reporte (json, excel, pdf)
   * @param {string} params.estado - Estado de las reservas
   * @param {string} params.ambiente - ID del ambiente
   * @param {string} params.usuario - ID del usuario
   * @returns {Promise<Object|Blob>} Datos del reporte o archivo
   */
  async generarReporteReservas(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const config = {
        responseType: params.formato === 'json' ? 'json' : 'blob'
      };
      
      const response = await api.get(`/api/v1/reportes/reservas?${queryParams.toString()}`, config);
      
      if (params.formato === 'json') {
        return response.data;
      }
      
      // Para archivos Excel y PDF
      return {
        blob: response.data,
        filename: `reporte_reservas.${params.formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.error('Error al generar reporte de reservas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de entregas
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.fechaInicio - Fecha de inicio
   * @param {string} params.fechaFin - Fecha de fin
   * @param {string} params.formato - Formato del reporte (json, excel, pdf)
   * @param {string} params.estado - Estado de las entregas
   * @param {string} params.jornada - Jornada (mañana, tarde, noche)
   * @param {string} params.instructor - ID del instructor
   * @returns {Promise<Object|Blob>} Datos del reporte o archivo
   */
  async generarReporteEntregas(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const config = {
        responseType: params.formato === 'json' ? 'json' : 'blob'
      };
      
      const response = await api.get(`/api/v1/reportes/entregas?${queryParams.toString()}`, config);
      
      if (params.formato === 'json') {
        return response.data;
      }
      
      return {
        blob: response.data,
        filename: `reporte_entregas.${params.formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.error('Error al generar reporte de entregas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de uso de ambientes
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.fechaInicio - Fecha de inicio
   * @param {string} params.fechaFin - Fecha de fin
   * @param {string} params.formato - Formato del reporte (json, excel, pdf)
   * @returns {Promise<Object|Blob>} Datos del reporte o archivo
   */
  async generarReporteUsoAmbientes(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const config = {
        responseType: params.formato === 'json' ? 'json' : 'blob'
      };
      
      const response = await api.get(`/api/v1/reportes/uso-ambientes?${queryParams.toString()}`, config);
      
      if (params.formato === 'json') {
        return response.data;
      }
      
      return {
        blob: response.data,
        filename: `reporte_uso_ambientes.${params.formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.error('Error al generar reporte de uso de ambientes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener mis reportes de reservas (para instructores)
   * @param {Object} params - Parámetros del reporte
   * @returns {Promise<Object|Blob>} Datos del reporte o archivo
   */
  async obtenerMisReportesReservas(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const config = {
        responseType: params.formato === 'json' ? 'json' : 'blob'
      };
      
      const response = await api.get(`/api/v1/reportes/instructor/mis-reservas?${queryParams.toString()}`, config);
      
      if (params.formato === 'json') {
        return response.data;
      }
      
      return {
        blob: response.data,
        filename: `mis_reservas.${params.formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.error('Error al obtener mis reportes de reservas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener mis reportes de entregas (para instructores)
   * @param {Object} params - Parámetros del reporte
   * @returns {Promise<Object|Blob>} Datos del reporte o archivo
   */
  async obtenerMisReportesEntregas(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const config = {
        responseType: params.formato === 'json' ? 'json' : 'blob'
      };
      
      const response = await api.get(`/api/v1/reportes/instructor/mis-entregas?${queryParams.toString()}`, config);
      
      if (params.formato === 'json') {
        return response.data;
      }
      
      return {
        blob: response.data,
        filename: `mis_entregas.${params.formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.error('Error al obtener mis reportes de entregas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de mi turno (para guardias)
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Estadísticas del turno
   */
  async obtenerEstadisticasMiTurno(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/api/v1/reportes/guardia/mi-turno?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de mi turno:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Descargar archivo de reporte
   * @param {Blob} blob - Blob del archivo
   * @param {string} filename - Nombre del archivo
   */
  descargarArchivo(blob, filename) {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw new Error('Error al descargar el archivo');
    }
  }

  /**
   * Validar parámetros de fecha
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {Object} Resultado de la validación
   */
  validarFechas(fechaInicio, fechaFin) {
    const errores = [];
    
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      
      if (inicio > fin) {
        errores.push('La fecha de inicio no puede ser mayor que la fecha de fin');
      }
      
      const hoy = new Date();
      if (fin > hoy) {
        errores.push('La fecha de fin no puede ser mayor que la fecha actual');
      }
      
      // Validar que no sea un rango muy amplio (más de 1 año)
      const unAño = 365 * 24 * 60 * 60 * 1000;
      if ((fin - inicio) > unAño) {
        errores.push('El rango de fechas no puede ser mayor a un año');
      }
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Obtener formatos disponibles
   * @returns {Array} Lista de formatos disponibles
   */
  obtenerFormatosDisponibles() {
    return [
      { value: 'json', label: 'Ver en pantalla', icon: 'Eye' },
      { value: 'excel', label: 'Descargar Excel', icon: 'FileSpreadsheet' },
      { value: 'pdf', label: 'Descargar PDF', icon: 'FileText' }
    ];
  }

  /**
   * Obtener estados disponibles para reservas
   * @returns {Array} Lista de estados
   */
  obtenerEstadosReservas() {
    return [
      { value: '', label: 'Todos los estados' },
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'aprobada', label: 'Aprobada' },
      { value: 'rechazada', label: 'Rechazada' },
      { value: 'cancelada', label: 'Cancelada' }
    ];
  }

  /**
   * Obtener estados disponibles para entregas
   * @returns {Array} Lista de estados
   */
  obtenerEstadosEntregas() {
    return [
      { value: '', label: 'Todos los estados' },
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'entregado', label: 'Entregado' },
      { value: 'devuelto', label: 'Devuelto' },
      { value: 'cancelado', label: 'Cancelado' }
    ];
  }

  /**
   * Obtener jornadas disponibles
   * @returns {Array} Lista de jornadas
   */
  obtenerJornadas() {
    return [
      { value: '', label: 'Todas las jornadas' },
      { value: 'mañana', label: 'Mañana (6:00 - 14:00)' },
      { value: 'tarde', label: 'Tarde (14:00 - 22:00)' },
      { value: 'noche', label: 'Noche (22:00 - 6:00)' }
    ];
  }

  /**
   * Formatear datos para gráficos
   * @param {Array} datos - Datos a formatear
   * @param {string} tipo - Tipo de gráfico (pie, bar, line)
   * @returns {Object} Datos formateados
   */
  formatearDatosGrafico(datos, tipo = 'pie') {
    if (!Array.isArray(datos)) {
      return { labels: [], datasets: [] };
    }
    
    const colores = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    
    switch (tipo) {
      case 'pie':
        return {
          labels: datos.map(item => item._id || item.nombre || 'Sin nombre'),
          datasets: [{
            data: datos.map(item => item.count || item.totalReservas || item.valor || 0),
            backgroundColor: colores.slice(0, datos.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
        
      case 'bar':
        return {
          labels: datos.map(item => item._id || item.nombre || 'Sin nombre'),
          datasets: [{
            label: 'Cantidad',
            data: datos.map(item => item.count || item.totalReservas || item.valor || 0),
            backgroundColor: colores[0],
            borderColor: colores[0],
            borderWidth: 1
          }]
        };
        
      default:
        return { labels: [], datasets: [] };
    }
  }

  /**
   * Manejar errores de la API
   * @param {Error} error - Error de la API
   * @returns {Error} Error procesado
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Parámetros inválidos');
        case 401:
          return new Error('No tienes autorización para acceder a los reportes');
        case 403:
          return new Error('No tienes permisos para generar este reporte');
        case 404:
          return new Error('Endpoint de reportes no encontrado');
        case 500:
          return new Error('Error interno del servidor al generar el reporte');
        default:
          return new Error(data.message || 'Error desconocido al generar el reporte');
      }
    }
    
    if (error.request) {
      return new Error('No se pudo conectar con el servidor de reportes');
    }
    
    return new Error(error.message || 'Error desconocido');
  }
}

// Crear instancia del servicio
const reportesService = new ReportesService();

export default reportesService;