import { API_CONFIG } from '../config/api';
import ApiService from './apiService';

class RegistrosService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.apiService = new ApiService();
  }

  // Obtener todos los registros
  async getRegistros(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.ambienteId) queryParams.append('ambienteId', filtros.ambienteId);
      if (filtros.usuarioId) queryParams.append('usuarioId', filtros.usuarioId);

      const endpoint = `${API_CONFIG.ENDPOINTS.REGISTROS.ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await this.apiService.request(endpoint, {
        method: 'GET'
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registros || [],
          total: data.results || 0
        };
      } else {
        throw new Error(data.message || 'Error al obtener registros');
      }
    } catch (error) {
      console.error('❌ Error al obtener registros:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Obtener un registro por ID
  async getRegistroById(id) {
    try {
      const data = await this.apiService.request(API_CONFIG.ENDPOINTS.REGISTROS.BY_ID(id), {
        method: 'GET'
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registro
        };
      } else {
        throw new Error(data.message || 'Error al obtener registro');
      }
    } catch (error) {
      console.error('❌ Error al obtener registro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear un nuevo registro
  async createRegistro(registroData) {
    try {
      const data = await this.apiService.request(API_CONFIG.ENDPOINTS.REGISTROS.CREATE, {
        method: 'POST',
        body: registroData
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registro,
          message: 'Registro creado exitosamente'
        };
      } else {
        throw new Error(data.message || 'Error al crear registro');
      }
    } catch (error) {
      console.error('❌ Error al crear registro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar entrada
  async registrarEntrada(reservaId) {
    try {
      const data = await this.apiService.request(`/api/v1/registros/entrada/${reservaId}`, {
        method: 'POST'
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registro,
          message: 'Entrada registrada exitosamente'
        };
      } else {
        throw new Error(data.message || 'Error al registrar entrada');
      }
    } catch (error) {
      console.error('❌ Error al registrar entrada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar salida
  async registrarSalida(registroId) {
    try {
      const data = await this.apiService.request(`/api/v1/registros/salida/${registroId}`, {
        method: 'PATCH'
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registro,
          message: 'Salida registrada exitosamente'
        };
      } else {
        throw new Error(data.message || 'Error al registrar salida');
      }
    } catch (error) {
      console.error('❌ Error al registrar salida:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener registros por ambiente
  async getRegistrosPorAmbiente(ambienteId, filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);

      const endpoint = `/registros/ambiente/${ambienteId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await this.apiService.request(endpoint, {
        method: 'GET'
      });
      
      if (data.success === true) {
        return {
          success: true,
          data: data.data.registros || [],
          total: data.results || 0
        };
      } else {
        throw new Error(data.message || 'Error al obtener registros del ambiente');
      }
    } catch (error) {
      console.error('❌ Error al obtener registros del ambiente:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Verificar conexión con el backend
  async checkConnection() {
    try {
      await this.apiService.request('/api/v1/registros', {
        method: 'GET'
      });

      return true;
    } catch (error) {
      console.error('❌ Error de conexión con backend de registros:', error);
      return false;
    }
  }
}

// Crear instancia única del servicio
const registrosService = new RegistrosService();
export default registrosService;