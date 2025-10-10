import { API_CONFIG } from '../config/api';
import ApiService from './apiService';

class ReservationsService extends ApiService {
  // Invalida caché de listados de reservas (GET /api/v1/reservas[?...])
  invalidateReservationsCache() {
    try {
      const prefix = `GET:${this.baseURL}/api/v1/reservas`;
      if (this.registry && this.registry.cache && typeof this.registry.cache.keys === 'function') {
        for (const key of Array.from(this.registry.cache.keys())) {
          if (key.startsWith(prefix)) {
            this.registry.cache.delete(key);
          }
        }
      }
    } catch (_) {
      // No romper flujo si no existe registro
    }
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
    
    return this.get(endpoint);
  }

  // Obtener mis reservas (requiere userId en query según backend)
  async getMyReservations(userId) {
    try {
      const uid = userId;
      const endpoint = uid
        ? `/api/v1/reservas/my-reservations?userId=${encodeURIComponent(uid)}`
        : '/api/v1/reservas/my-reservations';

      return this.get(endpoint);
    } catch (error) {
      console.error('Error obteniendo mis reservas:', error);
      throw error;
    }
  }

  // Crear nueva reserva
  async createReservation(reservationData) {
    const result = await this.post('/api/v1/reservas', reservationData);
    // Mutación: invalidar caché para reflejar cambios inmediatamente
    this.invalidateReservationsCache();
    return result;
  }

  // Aprobar reserva
  async approveReservation(reservationId, approvedBy) {
    const result = await this.patch(`/api/v1/reservas/${reservationId}/approve`, { approvedBy });
    this.invalidateReservationsCache();
    return result;
  }

  // Rechazar reserva
  async rejectReservation(reservationId, reason) {
    const result = await this.patch(`/api/v1/reservas/${reservationId}/reject`, { reason });
    this.invalidateReservationsCache();
    return result;
  }

  // Cancelar reserva
  async cancelReservation(reservationId) {
    const result = await this.patch(`/api/v1/reservas/${reservationId}/cancel`);
    this.invalidateReservationsCache();
    return result;
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
    const result = await this.put(`/api/v1/reservas/${id}`, reservationData);
    this.invalidateReservationsCache();
    return result;
  }

  // Eliminar reserva
  async deleteReservation(id) {
    const result = await this.delete(`/api/v1/reservas/${id}`);
    this.invalidateReservationsCache();
    return result;
  }

  // Eliminar varias reservas por ID (solo se eliminarán si están REJECTED en backend)
  async deleteReservationsBulk(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: 'No hay IDs para eliminar' };
    }

    try {
      const settled = await Promise.allSettled(
        ids.map((id) => this.delete(`/api/v1/reservas/${id}`))
      );

      const deletedIds = [];
      const failedIds = [];
      const details = [];

      settled.forEach((result, index) => {
        const id = ids[index];
        if (result.status === 'fulfilled') {
          const value = result.value;
          const ok = value && value.success !== false; // tratar como éxito si success no es false
          if (ok) {
            deletedIds.push(id);
            details.push({ id, status: 'deleted', response: value });
          } else {
            failedIds.push(id);
            details.push({ id, status: 'failed', response: value });
          }
        } else {
          failedIds.push(id);
          details.push({ id, status: 'error', error: result.reason?.message || String(result.reason) });
        }
      });

      const successCount = deletedIds.length;
      const failureCount = failedIds.length;

      // Invalidate cache if any success
      if (successCount > 0) {
        this.invalidateReservationsCache();
      }

      return {
        success: successCount > 0,
        message:
          failureCount === 0
            ? `Se eliminaron ${successCount} reservas`
            : `Se eliminaron ${successCount} reservas, ${failureCount} no pudieron eliminarse`,
        successCount,
        failureCount,
        deletedIds,
        failedIds,
        results: details
      };
    } catch (err) {
      return { success: false, message: 'Error al eliminar en lote', error: err?.message };
    }
  }

  // Eliminar todas las reservas rechazadas
  async deleteRejectedReservations() {
    const result = await this.delete('/api/v1/reservas/rejected');
    this.invalidateReservationsCache();
    return result;
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