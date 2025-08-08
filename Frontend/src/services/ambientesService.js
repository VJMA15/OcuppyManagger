import ApiService from './apiService';
import API_CONFIG from '@/config/api';

class AmbientesService extends ApiService {
  async getAmbientes() {
    return this.get(API_CONFIG.ENDPOINTS.AMBIENTES.ALL);
  }

  async getAmbienteById(id) {
    return this.get(API_CONFIG.ENDPOINTS.AMBIENTES.BY_ID(id));
  }

  async createAmbiente(ambienteData) {
    return this.post(API_CONFIG.ENDPOINTS.AMBIENTES.CREATE, ambienteData);
  }

  async updateAmbiente(id, ambienteData) {
    return this.put(API_CONFIG.ENDPOINTS.AMBIENTES.UPDATE(id), ambienteData);
  }

  async deleteAmbiente(id) {
    return this.delete(API_CONFIG.ENDPOINTS.AMBIENTES.DELETE(id));
  }
}

const ambientesService = new AmbientesService();
export default ambientesService;