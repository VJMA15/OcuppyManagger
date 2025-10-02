import { API_CONFIG } from '../config/api';
import ApiService from './apiService';

class ReservationsService extends ApiService {
  // Obtener todas las reservas con filtros opcionales
  async getReservations(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/reservas?${queryString}` : '/api/v1/reservas';
    
    return this.get(endpoint);
  }

  // Obtener mis reservas (no requiere userId, se obtiene del token)
  async getMyReservations() {
    return this.get('/api/v1/reservas/my-reservations');
  }

  // Crear nueva reserva
  async createReservation(reservationData) {
    return this.post('/api/v1/reservas', reservationData);
  }

  // Aprobar reserva
  async approveReservation(reservationId, approvedBy) {
    return this.patch(`/api/v1/reservas/${reservationId}/approve`, { approvedBy });
  }

  // Rechazar reserva
  async rejectReservation(reservationId, reason) {
    return this.patch(`/api/v1/reservas/${reservationId}/reject`, { reason });
  }

  // Cancelar reserva
  async cancelReservation(reservationId) {
    return this.patch(`/api/v1/reservas/${reservationId}/cancel`);
  }

  // Verificar disponibilidad
  async checkAvailability(environmentId, startTime, endTime, date) {
    const params = new URLSearchParams({
      environmentId,
      startTime,
      endTime,
      date
    });
    
    return this.get(`/api/v1/reservas/check-availability?${params}`);
  }

  // Obtener reserva por ID
  async getReservationById(id) {
    return this.get(`/api/v1/reservas/${id}`);
  }

  // Actualizar reserva
  async updateReservation(id, reservationData) {
    return this.put(`/api/v1/reservas/${id}`, reservationData);
  }

  // Eliminar reserva
  async deleteReservation(id) {
    return this.delete(`/api/v1/reservas/${id}`);
  }

  // Obtener reservas por estado
  async getReservationsByStatus(status) {
    return this.getReservations({ status });
  }

  // Obtener reservas por ambiente
  async getReservationsByEnvironment(environmentId) {
    return this.getReservations({ environmentId });
  }

  // Obtener reservas por rango de fechas
  async getReservationsByDateRange(startDate, endDate) {
    return this.getReservations({ startDate, endDate });
  }
}

const reservationsService = new ReservationsService();
export default reservationsService;