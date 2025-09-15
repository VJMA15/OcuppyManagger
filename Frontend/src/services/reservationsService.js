import { API_CONFIG } from '../config/api';

class ReservationsService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Crear nueva reserva
  async createReservation(reservationData) {
    return this.request('/api/v1/reservas', {
      method: 'POST',
      body: reservationData,
    });
  }

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
    
    return this.request(endpoint);
  }

  // Obtener mis reservas (requiere userId)
  async getMyReservations(userId) {
    if (!userId) {
      throw new Error('userId es requerido para obtener mis reservas');
    }
    
    return this.request(`/api/v1/reservas/my-reservations?userId=${userId}`);
  }

  // Aprobar reserva
  async approveReservation(reservationId, approvedBy) {
    if (!approvedBy) {
      throw new Error('approvedBy es requerido para aprobar una reserva');
    }
    
    return this.request(`/api/v1/reservas/${reservationId}/approve`, {
      method: 'PATCH',
      body: { approvedBy },
    });
  }

  // Rechazar reserva
  async rejectReservation(reservationId, reason) {
    return this.request(`/api/v1/reservas/${reservationId}/reject`, {
      method: 'PATCH',
      body: { reason },
    });
  }

  // Actualizar reserva (método genérico)
  async updateReservation(reservationId, updateData) {
    return this.request(`/api/v1/reservas/${reservationId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  // Eliminar reserva
  async deleteReservation(reservationId) {
    return this.request(`/api/v1/reservas/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // Verificar disponibilidad de ambiente
  async checkAvailability(environmentId, startDate, endDate) {
    return this.request('/api/v1/ambientes/verificar-disponibilidad', {
      method: 'POST',
      body: {
        ambienteId: environmentId,
        fechaInicio: startDate,
        fechaFin: endDate,
      },
    });
  }

  // Obtener reserva por ID
  async getReservationById(reservationId) {
    return this.request(`/api/v1/reservas/${reservationId}`);
  }

  // Cancelar reserva (cambiar estado a cancelada)
  async cancelReservation(reservationId) {
    return this.updateReservation(reservationId, { status: 'CANCELLED' });
  }

  // Obtener reservas por estado
  async getReservationsByStatus(status) {
    return this.getReservations({ status });
  }

  // Obtener reservas por ambiente
  async getReservationsByEnvironment(environmentId) {
    return this.getReservations({ environmentId });
  }

  // Obtener reservas en un rango de fechas
  async getReservationsByDateRange(startDate, endDate) {
    return this.getReservations({ startDate, endDate });
  }
}

const reservationsService = new ReservationsService();
export default reservationsService;