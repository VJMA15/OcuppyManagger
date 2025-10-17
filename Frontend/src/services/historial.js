import api from './api';

/**
 * Servicio para consultar historial de reservas (reservas eliminadas)
 */
class HistorialService {
  /**
   * Obtener historial con filtros opcionales
   * @param {Object} params
   * @param {string} [params.status]
   * @param {string} [params.environmentId]
   * @param {string} [params.userId]
   * @param {string} [params.deletedBy]
   * @param {string} [params.startDeletedAt] - YYYY-MM-DD
   * @param {string} [params.endDeletedAt] - YYYY-MM-DD
   */
  async obtenerHistorial(params = {}) {
    try {
      const qp = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          qp.append(key, val);
        }
      });
      const response = await api.get(`/api/v1/historial?${qp.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de un registro de historial
   * @param {string} id
   */
  async obtenerDetalle(id) {
    try {
      const response = await api.get(`/api/v1/historial/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de historial:', error);
      throw error;
    }
  }

  /**
   * Eliminar un registro del historial
   * @param {string} id
   */
  async eliminarRegistro(id) {
    try {
      const response = await api.delete(`/api/v1/historial/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar registro del historial:', error);
      throw error;
    }
  }

  /**
   * Limpiar completamente el historial
   */
  async limpiarHistorial() {
    try {
      const response = await api.delete(`/api/v1/historial`);
      return response.data;
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      throw error;
    }
  }
}

const historialService = new HistorialService();
export default historialService;