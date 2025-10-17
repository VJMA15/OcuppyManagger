import ApiService from './apiService';
import { API_CONFIG } from '@/config/api';

class SolicitudesService extends ApiService {
  // Crear una nueva solicitud (público)
  async createSolicitud(data) {
    return this.post(API_CONFIG.ENDPOINTS.SOLICITUDES.CREATE, data);
  }

  // Listar solicitudes con filtros (admin/guardia)
  async getSolicitudes(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const qs = params.toString();
    const endpoint = qs
      ? `${API_CONFIG.ENDPOINTS.SOLICITUDES.ALL}?${qs}`
      : API_CONFIG.ENDPOINTS.SOLICITUDES.ALL;
    return this.get(endpoint);
  }

  // Obtener solicitud por ID
  async getSolicitudById(id) {
    return this.get(API_CONFIG.ENDPOINTS.SOLICITUDES.BY_ID(id));
  }

  // Aprobar solicitud (admin)
  async approveSolicitud(id) {
    return this.patch(API_CONFIG.ENDPOINTS.SOLICITUDES.APPROVE(id));
  }

  // Rechazar solicitud (admin)
  async rejectSolicitud(id, reason = '') {
    return this.patch(API_CONFIG.ENDPOINTS.SOLICITUDES.REJECT(id), { reason });
  }

  // Estadísticas de solicitudes
  async getEstadisticas() {
    return this.get(API_CONFIG.ENDPOINTS.SOLICITUDES.STATS);
  }
}

const solicitudesService = new SolicitudesService();
export default solicitudesService;