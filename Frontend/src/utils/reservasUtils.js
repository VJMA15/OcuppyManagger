import usersService from '../services/users';
import ambientesService from '../services/ambientesService';

/**
 * Enriquece las reservas con información de usuarios y ambientes
 * @param {Array} reservas - Array de reservas del backend
 * @returns {Promise<Array>} - Array de reservas con datos completos
 */
export const enrichReservasWithDetails = async (reservas, currentUser = null) => {
  if (!Array.isArray(reservas) || reservas.length === 0) {
    return [];
  }

  try {
    // Obtener IDs únicos de usuarios y ambientes
    const currentUserId = currentUser ? (currentUser._id || currentUser.id) : null;
    const userIds = [...new Set(reservas.map(r => r.userId).filter(Boolean))];
    const fetchUserIds = currentUserId ? userIds.filter(id => id !== currentUserId) : userIds;
    const environmentIds = [...new Set(reservas.map(r => r.environmentId).filter(Boolean))];

    // Obtener datos de usuarios y ambientes en paralelo
    const [usersData, ambientesData] = await Promise.all([
      Promise.all(fetchUserIds.map(async (id) => {
        try {
          const response = await usersService.getUserById(id, { silent: true });
          return response.success ? { id, data: response.user } : { id, data: null };
        } catch (error) {
          console.warn(`Error obteniendo usuario ${id}:`, error);
          return { id, data: null };
        }
      })),
      Promise.all(environmentIds.map(async (id) => {
        try {
          const response = await ambientesService.getAmbienteById(id);
          return response.success ? { id, data: response.data } : { id, data: null };
        } catch (error) {
          console.warn(`Error obteniendo ambiente ${id}:`, error);
          return { id, data: null };
        }
      }))
    ]);

    // Crear mapas para acceso rápido
    const usersMap = new Map(usersData.map(u => [u.id, u.data]));
    if (currentUserId) {
      usersMap.set(currentUserId, currentUser);
    }
    const ambientesMap = new Map(ambientesData.map(a => [a.id, a.data]));

    // Enriquecer reservas con datos completos
    const enrichedReservas = reservas.map(reserva => {
      const userData = usersMap.get(reserva.userId);
      const ambienteData = ambientesMap.get(reserva.environmentId);

      return {
        ...reserva,
        // Mantener campos originales para compatibilidad
        usuario: userData ? {
          id: userData._id || userData.id,
          nombre: userData.nombre || userData.name || 'Usuario desconocido',
          email: userData.email || '',
          documento: userData.documento || userData.cedula || userData.cc || 'N/A'
        } : {
          id: reserva.userId,
          nombre: 'Usuario desconocido',
          email: '',
          documento: 'N/A'
        },
        ambiente: ambienteData ? {
          id: ambienteData._id || ambienteData.id,
          nombre: ambienteData.nombre || ambienteData.name || 'Ambiente desconocido',
          tipo: ambienteData.tipo || 'N/A',
          ubicacion: ambienteData.ubicacion || 'N/A'
        } : {
          id: reserva.environmentId,
          nombre: 'Ambiente desconocido',
          tipo: 'N/A',
          ubicacion: 'N/A'
        },
        // Campos adicionales para compatibilidad con el frontend
        nombre: userData?.nombre || userData?.name || 'Usuario desconocido',
        documento: userData?.documento || userData?.cedula || userData?.cc || 'N/A',
        ambienteNombre: ambienteData?.nombre || ambienteData?.name || 'Ambiente desconocido'
      };
    });

    return enrichedReservas;
  } catch (error) {
    console.error('Error enriqueciendo reservas:', error);
    // Retornar reservas originales con datos básicos si hay error
    return reservas.map(reserva => ({
      ...reserva,
      usuario: {
        id: reserva.userId,
        nombre: 'Usuario desconocido',
        email: '',
        documento: 'N/A'
      },
      ambiente: {
        id: reserva.environmentId,
        nombre: 'Ambiente desconocido',
        tipo: 'N/A',
        ubicacion: 'N/A'
      },
      nombre: 'Usuario desconocido',
      documento: 'N/A',
      ambienteNombre: 'Ambiente desconocido'
    }));
  }
};

/**
 * Formatea una fecha para mostrar en el frontend
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una hora para mostrar en el frontend
 * @param {string|Date} fecha - Fecha/hora a formatear
 * @returns {string} - Hora formateada
 */
export const formatearHora = (fecha) => {
  if (!fecha) return 'N/A';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Hora inválida';
  }
};

/**
 * Obtiene el color del badge según el estado de la reserva
 * @param {string} status - Estado de la reserva
 * @returns {string} - Clase CSS para el color
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800',
    'COMPLETED': 'bg-blue-100 text-blue-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Normaliza el estado de la reserva a formato estándar
 * @param {string} status - Estado de la reserva (puede venir en diferentes formatos)
 * @returns {string} - Estado normalizado en mayúsculas
 */
export const normalizeStatus = (status) => {
  if (!status) return 'PENDING';
  
  const statusStr = String(status).toUpperCase().trim();
  
  // Mapear diferentes variaciones al formato estándar
  const statusMap = {
    'PENDIENTE': 'PENDING',
    'APROBADA': 'APPROVED',
    'APROBADO': 'APPROVED',
    'RECHAZADA': 'REJECTED',
    'RECHAZADO': 'REJECTED',
    'CANCELADA': 'CANCELLED',
    'CANCELADO': 'CANCELLED',
    'COMPLETADA': 'COMPLETED',
    'COMPLETADO': 'COMPLETED',
    'FINALIZADA': 'COMPLETED',
    'FINALIZADO': 'COMPLETED'
  };
  
  return statusMap[statusStr] || statusStr;
};

/**
 * Traduce el estado de la reserva al español
 * @param {string} status - Estado en inglés
 * @returns {string} - Estado en español
 */
export const translateStatus = (status) => {
  const translations = {
    'PENDING': 'Pendiente',
    'APPROVED': 'Aprobada',
    'REJECTED': 'Rechazada',
    'CANCELLED': 'Cancelada',
    'COMPLETED': 'Completada'
  };
  
  return translations[status] || status;
};