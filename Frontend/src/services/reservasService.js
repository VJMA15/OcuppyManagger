import ApiService from './apiService';
import { API_CONFIG } from '@/config/api';

class ReservasService extends ApiService {
  async getReservas() {
    return this.get(API_CONFIG.ENDPOINTS.RESERVAS.ALL);
  }

  async getReservaById(id) {
    return this.get(API_CONFIG.ENDPOINTS.RESERVAS.BY_ID(id));
  }

  async createReserva(reservaData) {
    return this.post(API_CONFIG.ENDPOINTS.RESERVAS.CREATE, reservaData);
  }

  async updateReserva(id, reservaData) {
    return this.put(API_CONFIG.ENDPOINTS.RESERVAS.UPDATE(id), reservaData);
  }

  async deleteReserva(id) {
    return this.delete(API_CONFIG.ENDPOINTS.RESERVAS.DELETE(id));
  }

  async getMyReservas(userId) {
    const endpoint = userId
      ? `${API_CONFIG.ENDPOINTS.RESERVAS.MY_RESERVAS}?userId=${encodeURIComponent(userId)}`
      : API_CONFIG.ENDPOINTS.RESERVAS.MY_RESERVAS;
    return this.get(endpoint);
  }
}

const reservasService = new ReservasService();
export default reservasService;