import apiClient from '@/services/apiClient';

class ReservationApi {
  async getReservations(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/reservations?${params}`);
    return response.data;
  }

  async getMyReservations() {
    const response = await apiClient.get('/reservations/my');
    return response.data;
  }

  async createReservation(data) {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  }

  async updateReservation(id, data) {
    const response = await apiClient.put(`/reservations/${id}`, data);
    return response.data;
  }

  async deleteReservation(id) {
    await apiClient.delete(`/reservations/${id}`);
  }

  async approveReservation(id) {
    const response = await apiClient.patch(`/reservations/${id}/approve`);
    return response.data;
  }

  async rejectReservation(id, reason) {
    const response = await apiClient.patch(`/reservations/${id}/reject`, { reason });
    return response.data;
  }
}

export const reservationApi = new ReservationApi();