import apiService from './apiService';

class EntregasService {
  constructor() {
    this.baseURL = '/entregas';
  }

  // Crear nueva entrega
  async crearEntrega(entregaData) {
    try {
      const response = await apiService.post(this.baseURL, entregaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear entrega:', error);
      throw this.handleError(error);
    }
  }

  // Obtener todas las entregas con filtros
  async obtenerEntregas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros como parámetros de consulta
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;
      
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      throw this.handleError(error);
    }
  }

  // Obtener entrega por ID
  async obtenerEntregaPorId(id) {
    try {
      const response = await apiService.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entrega:', error);
      throw this.handleError(error);
    }
  }

  // Marcar entrega como devuelta
  async devolverEntrega(id, observaciones = '') {
    try {
      const response = await apiService.patch(`${this.baseURL}/${id}/devolver`, {
        observacionesDevolucion: observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al devolver entrega:', error);
      throw this.handleError(error);
    }
  }

  // Cancelar entrega
  async cancelarEntrega(id, motivo = '') {
    try {
      const response = await apiService.patch(`${this.baseURL}/${id}/cancelar`, {
        motivo
      });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar entrega:', error);
      throw this.handleError(error);
    }
  }

  // Obtener entregas por jornada
  async obtenerEntregasPorJornada(jornada, fecha = null) {
    try {
      const params = fecha ? `?fecha=${fecha}` : '';
      const response = await apiService.get(`${this.baseURL}/jornada/${jornada}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas por jornada:', error);
      throw this.handleError(error);
    }
  }

  // Obtener entregas vencidas
  async obtenerEntregasVencidas() {
    try {
      const response = await apiService.get(`${this.baseURL}/vencidas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas vencidas:', error);
      throw this.handleError(error);
    }
  }

  // Obtener estadísticas de entregas
  async obtenerEstadisticasEntregas(fechaInicio = null, fechaFin = null) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/estadisticas?${queryString}` : `${this.baseURL}/estadisticas`;
      
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw this.handleError(error);
    }
  }

  // Verificar entrega por código
  async verificarEntregaPorCodigo(codigo) {
    try {
      const response = await apiService.get(`${this.baseURL}/verificar/${codigo}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar código:', error);
      throw this.handleError(error);
    }
  }

  // Métodos específicos para instructores
  async obtenerMisEntregas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/instructor/mis-entregas?${queryString}` : `${this.baseURL}/instructor/mis-entregas`;
      
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis entregas:', error);
      throw this.handleError(error);
    }
  }

  // Métodos específicos para guardias
  async obtenerEntregasDeMiTurno() {
    try {
      const response = await apiService.get(`${this.baseURL}/guardia/mi-turno`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entregas del turno:', error);
      throw this.handleError(error);
    }
  }

  async obtenerMisEntregasComoGuardia(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/guardia/mis-entregas?${queryString}` : `${this.baseURL}/guardia/mis-entregas`;
      
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis entregas como guardia:', error);
      throw this.handleError(error);
    }
  }

  // Utilidades
  determinarJornadaActual() {
    const hora = new Date().getHours();
    
    if (hora >= 6 && hora < 14) {
      return 'mañana';
    } else if (hora >= 14 && hora < 22) {
      return 'tarde';
    } else {
      return 'noche';
    }
  }

  formatearFecha(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatearHora(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularTiempoTranscurrido(fechaEntrega) {
    if (!fechaEntrega) return null;
    
    const ahora = new Date();
    const entrega = new Date(fechaEntrega);
    const diff = ahora - entrega;
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  esEntregaVencida(fechaEntrega, estado) {
    if (estado !== 'entregado' || !fechaEntrega) return false;
    
    const ahora = new Date();
    const entrega = new Date(fechaEntrega);
    const diff = ahora - entrega;
    const horas = diff / (1000 * 60 * 60);
    
    return horas > 8; // Más de 8 horas
  }

  obtenerColorEstado(estado) {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'entregado': 'bg-blue-100 text-blue-800',
      'devuelto': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    
    return colores[estado] || 'bg-gray-100 text-gray-800';
  }

  obtenerTextoEstado(estado) {
    const textos = {
      'pendiente': 'Pendiente',
      'entregado': 'Entregado',
      'devuelto': 'Devuelto',
      'cancelado': 'Cancelado'
    };
    
    return textos[estado] || estado;
  }

  // Validaciones
  validarDatosEntrega(datos) {
    const errores = [];
    
    if (!datos.ambiente) {
      errores.push('El ambiente es obligatorio');
    }
    
    if (!datos.instructor) {
      errores.push('El instructor es obligatorio');
    }
    
    if (!datos.jornada) {
      errores.push('La jornada es obligatoria');
    }
    
    if (!['mañana', 'tarde', 'noche'].includes(datos.jornada)) {
      errores.push('La jornada debe ser: mañana, tarde o noche');
    }
    
    if (datos.observacionesEntrega && datos.observacionesEntrega.length > 500) {
      errores.push('Las observaciones no pueden exceder 500 caracteres');
    }
    
    return errores;
  }

  // Manejo de errores
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.message || error.response.data?.error || 'Error en el servidor';
      return new Error(message);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifique su conexión a internet.');
    } else {
      // Error de configuración
      return new Error(error.message || 'Error desconocido');
    }
  }

  // Generar reporte de entregas
  async generarReporteEntregas(filtros = {}) {
    try {
      const entregas = await this.obtenerEntregas(filtros);
      const estadisticas = await this.obtenerEstadisticasEntregas(
        filtros.fechaInicio,
        filtros.fechaFin
      );
      
      return {
        entregas: entregas.data || [],
        estadisticas: estadisticas.data || {},
        filtros,
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw this.handleError(error);
    }
  }
}

// Crear instancia única del servicio
const entregasService = new EntregasService();

export default entregasService;