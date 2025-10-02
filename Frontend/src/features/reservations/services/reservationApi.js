import apiClient from '@/services/apiClient';

class ReservationApi {
  async getReservations(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/api/v1/reservas?${params}`);
    return response.data;
  }

  async getMyReservations() {
    const response = await apiClient.get('/api/v1/reservas/my-reservations');
    return response.data;
  }

  async createReservation(data) {
    const response = await apiClient.post('/api/v1/reservas', data);
    return response.data;
  }

  async updateReservation(id, data) {
    const response = await apiClient.put(`/api/v1/reservas/${id}`, data);
    return response.data;
  }

  async deleteReservation(id) {
    await apiClient.delete(`/api/v1/reservas/${id}`);
  }

  async approveReservation(id) {
    const response = await apiClient.patch(`/api/v1/reservas/${id}/approve`);
    return response.data;
  }

  async rejectReservation(id, reason) {
    const response = await apiClient.patch(`/api/v1/reservas/${id}/reject`, { reason });
    return response.data;
  }
}

export const reservationApi = new ReservationApi();