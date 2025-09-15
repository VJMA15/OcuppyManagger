import { API_CONFIG } from '../config/api';
import apiService from './api';

class BitacoraService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obtener todos los registros de bitácora
  async getBitacora(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.entidad) queryParams.append('entidad', filtros.entidad);
      if (filtros.entidadId) queryParams.append('entidadId', filtros.entidadId);
      if (filtros.usuarioId) queryParams.append('usuarioId', filtros.usuarioId);
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.accion) queryParams.append('accion', filtros.accion);

      const endpoint = `${API_CONFIG.ENDPOINTS.BITACORA.ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await apiService.request(endpoint, {
        method: 'GET'
      });
      
      if (data.status === 'success' || data.success) {
        return {
          success: true,
          data: data.data.registros || [],
          total: data.results || 0,
          message: data.message
        };
      } else {
        throw new Error(data.message || 'Error al obtener bitácora');
      }
    } catch (error) {
      console.error('❌ Error al obtener bitácora:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Obtener un registro de bitácora por ID
  async getBitacoraById(id) {
    try {
      const data = await apiService.request(API_CONFIG.ENDPOINTS.BITACORA.BY_ID(id), {
        method: 'GET'
      });
      
      if (data.status === 'success') {
        return {
          success: true,
          data: data.data.registro
        };
      } else {
        throw new Error(data.message || 'Error al obtener registro de bitácora');
      }
    } catch (error) {
      console.error('❌ Error al obtener registro de bitácora:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear un nuevo registro de bitácora
  async createBitacora(bitacoraData) {
    try {
      const data = await apiService.request(API_CONFIG.ENDPOINTS.BITACORA.ALL, {
        method: 'POST',
        body: bitacoraData
      });
      
      if (data.status === 'success') {
        return {
          success: true,
          data: data.data.registro,
          message: 'Registro de bitácora creado exitosamente'
        };
      } else {
        throw new Error(data.message || 'Error al crear registro de bitácora');
      }
    } catch (error) {
      console.error('❌ Error al crear registro de bitácora:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener bitácora por entidad
  async getBitacoraPorEntidad(entidad, entidadId = null, filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('entidad', entidad);
      
      if (entidadId) queryParams.append('entidadId', entidadId);
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.accion) queryParams.append('accion', filtros.accion);

      const endpoint = `/bitacora/entidad/${entidad}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await apiService.request(endpoint, {
        method: 'GET'
      });
      
      if (data.status === 'success') {
        return {
          success: true,
          data: data.data.registros || [],
          total: data.results || 0
        };
      } else {
        throw new Error(data.message || 'Error al obtener bitácora de la entidad');
      }
    } catch (error) {
      console.error('❌ Error al obtener bitácora de la entidad:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Registrar acción en bitácora (método de utilidad)
  async registrarAccion(accion, entidad, entidadId, detalles = {}) {
    const bitacoraData = {
      accion,
      entidad,
      entidadId,
      detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles
    };

    return this.createBitacora(bitacoraData);
  }

  // Obtener estadísticas de bitácora
  async getEstadisticasBitacora(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);

      const endpoint = `/bitacora/estadisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await apiService.request(endpoint, {
        method: 'GET'
      });
      
      if (data.status === 'success') {
        return {
          success: true,
          data: data.data
        };
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas de bitácora');
      }
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de bitácora:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  // Verificar conexión con el backend
  async checkConnection() {
    try {
      await apiService.request('/api/v1/bitacora', {
        method: 'GET'
      });

      return true;
    } catch (error) {
      console.error('❌ Error de conexión con backend de bitácora:', error);
      return false;
    }
  }
}

// Crear instancia única del servicio
const bitacoraService = new BitacoraService();
export default bitacoraService;