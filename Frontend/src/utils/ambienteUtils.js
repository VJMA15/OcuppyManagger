/**
 * Utilidades para manejo de ambientes y disponibilidad
 * Actualizado para trabajar con datos del backend
 */

/**
 * Verifica si un ambiente está disponible basado en las reservas aprobadas
 * @param {string} ambienteId - ID del ambiente a verificar
 * @param {Array} reservas - Array de reservas del backend
 * @returns {boolean} - true si está disponible, false si está ocupado
 */
export const verificarDisponibilidadAmbiente = (ambienteId, reservas = []) => {
    try {
        // Ensure reservas is an array
        if (!Array.isArray(reservas)) {
            console.warn('reservas is not an array:', reservas);
            return true; // Default to available if reservas is not valid
        }

        const ahora = new Date();
        const fechaActual = ahora.toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)
        
        // CORRECCIÓN: Buscar reservas activas para este ambiente en la fecha actual
        const reservaActiva = reservas.find(reserva => {
            const ambienteIdReserva = reserva.ambienteId || reserva.ambiente;
            if (ambienteIdReserva === ambienteId && reserva.estado === "activa") {
                try {
                    // Verificar si la reserva es para la fecha actual
                    if (reserva.fecha === fechaActual) {
                        const horaReserva = parseInt(reserva.hora.split(':')[0]); // Hora de la reserva
                        const horaActual = ahora.getHours(); // Hora actual
                        
                        // Determinar la jornada de la reserva
                        let jornadaReserva = '';
                        if (horaReserva >= 6 && horaReserva < 12) {
                            jornadaReserva = 'mañana';
                        } else if (horaReserva >= 12 && horaReserva < 18) {
                            jornadaReserva = 'tarde';
                        } else {
                            jornadaReserva = 'noche';
                        }
                        
                        // Determinar la jornada actual
                        let jornadaActual = '';
                        if (horaActual >= 6 && horaActual < 12) {
                            jornadaActual = 'mañana';
                        } else if (horaActual >= 12 && horaActual < 18) {
                            jornadaActual = 'tarde';
                        } else {
                            jornadaActual = 'noche';
                        }
                        
                        // Si es la misma jornada, el ambiente está ocupado
                        return jornadaReserva === jornadaActual;
                    }
                    
                    return false;
                } catch (dateError) {
                    return false;
                }
            }
            return false;
        });

        // Si hay una reserva activa, el ambiente NO está disponible
        return !reservaActiva;
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        return true; // Default to available on error
    }
};

/**
 * Obtiene la lista de ambientes ocupados actualmente
 * @param {Array} ambientes - Array de ambientes del backend
 * @param {Array} reservas - Array de reservas del backend
 * @returns {Array} - Array de ambientes ocupados
 */
export const obtenerAmbientesOcupados = (ambientes = [], reservas = []) => {
    try {
        // Ensure both parameters are arrays
        if (!Array.isArray(ambientes)) {
            console.warn('ambientes is not an array:', ambientes);
            return [];
        }
        if (!Array.isArray(reservas)) {
            console.warn('reservas is not an array:', reservas);
            return [];
        }

        const ahora = new Date();
        const fechaActual = ahora.toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)

        const ocupados = ambientes.filter(ambiente => {
            const reservaActiva = reservas.find(reserva => {
                // CORRECCIÓN: Usar ambienteId y estado 'activa' para compatibilidad con mock
                const ambienteIdReserva = reserva.ambienteId || reserva.ambiente;
                const ambienteIdComparar = ambiente.id || ambiente._id;
                
                if (ambienteIdReserva === ambienteIdComparar && reserva.estado === 'activa') {
                    try {
                        // Verificar si la reserva es para la fecha actual
                        if (reserva.fecha === fechaActual) {
                            const horaReserva = parseInt(reserva.hora.split(':')[0]); // Hora de la reserva
                            const horaActual = ahora.getHours(); // Hora actual
                            
                            // Determinar la jornada de la reserva
                            let jornadaReserva = '';
                            if (horaReserva >= 6 && horaReserva < 12) {
                                jornadaReserva = 'mañana';
                            } else if (horaReserva >= 12 && horaReserva < 18) {
                                jornadaReserva = 'tarde';
                            } else {
                                jornadaReserva = 'noche';
                            }
                            
                            // Determinar la jornada actual
                            let jornadaActual = '';
                            if (horaActual >= 6 && horaActual < 12) {
                                jornadaActual = 'mañana';
                            } else if (horaActual >= 12 && horaActual < 18) {
                                jornadaActual = 'tarde';
                            } else {
                                jornadaActual = 'noche';
                            }
                            
                            // Si es la misma jornada, el ambiente está ocupado
                            return jornadaReserva === jornadaActual;
                        }
                        
                        return false;
                    } catch (dateError) {
                        return false;
                    }
                }
                return false;
            });

            return !!reservaActiva;
        });

        console.log('🏢 Ambientes ocupados encontrados:', ocupados);
        return ocupados;
    } catch (error) {
        console.error('Error obteniendo ambientes ocupados:', error);
        return [];
    }
};

/**
 * Obtiene ambientes ocupados por fecha y jornada específicas
 * @param {Array} ambientes
 * @param {Array} reservas
 * @param {string} fecha - YYYY-MM-DD
 * @param {string} jornada - 'mañana' | 'tarde' | 'noche'
 * @returns {Array}
 */
export const obtenerAmbientesOcupadosPorFechaJornada = (ambientes = [], reservas = [], fecha, jornada) => {
    try {
        if (!Array.isArray(ambientes) || !Array.isArray(reservas) || !fecha || !jornada) {
            return [];
        }

        const jornadaTarget = (jornada || '').toLowerCase();

        return ambientes.filter(ambiente => {
            const ambienteId = ambiente.id || ambiente._id;
            const match = reservas.find(reserva => {
                const ambienteIdReserva = reserva.ambienteId || reserva.ambiente;
                const estado = (reserva.estado || '').toLowerCase();
                const fechaReserva = reserva.fecha;

                let jornadaReserva = (reserva.jornada || '').toLowerCase();
                if (!jornadaReserva && reserva.hora) {
                    try {
                        const horaReserva = parseInt(String(reserva.hora).split(':')[0]);
                        if (horaReserva >= 6 && horaReserva < 12) jornadaReserva = 'mañana';
                        else if (horaReserva >= 12 && horaReserva < 18) jornadaReserva = 'tarde';
                        else jornadaReserva = 'noche';
                    } catch {
                        jornadaReserva = '';
                    }
                }

                return (
                    ambienteIdReserva === ambienteId &&
                    fechaReserva === fecha &&
                    jornadaReserva === jornadaTarget &&
                    (estado === 'aprobada' || estado === 'aprobado')
                );
            });
            return !!match;
        });
    } catch (e) {
        console.error('Error obteniendo ocupados por fecha/jornada:', e);
        return [];
    }
};

/**
 * Actualiza el estado de todos los ambientes basado en las reservas actuales
 * @param {Array} ambientes - Array de ambientes del backend
 * @param {Array} reservas - Array de reservas del backend
 * @returns {Array} - Array de ambientes con estado actualizado
 */
export const actualizarEstadosAmbientes = (ambientes = [], reservas = []) => {
    try {
        const ambientesActualizados = ambientes.map(ambiente => ({
            ...ambiente,
            estado: verificarDisponibilidadAmbiente(ambiente._id, reservas) ? "Disponible" : "Ocupado"
        }));

        return ambientesActualizados;
    } catch (error) {
        console.error("Error actualizando estados de ambientes:", error);
        return [];
    }
};

/**
 * Verifica si un ambiente está disponible para una fecha y hora específica
 * @param {string} ambienteId - ID del ambiente a verificar
 * @param {string} fecha - Fecha de la reserva (YYYY-MM-DD)
 * @param {string} hora - Hora de la reserva (HH:MM)
 * @param {Array} reservas - Array de reservas del backend
 * @returns {boolean} - true si está disponible, false si está ocupado
 */
export const verificarDisponibilidadFutura = (ambienteId, fecha, hora, reservas = []) => {
    try {
        // Ensure reservas is an array
        if (!Array.isArray(reservas)) {
            console.warn('reservas is not an array in verificarDisponibilidadFutura:', reservas);
            return true; // Default to available if reservas is not valid
        }

        const horaReserva = parseInt(hora.split(':')[0]); // Hora de la reserva
        
        // Determinar la jornada de la reserva
        let jornadaReserva = '';
        if (horaReserva >= 6 && horaReserva < 12) {
            jornadaReserva = 'mañana';
        } else if (horaReserva >= 12 && horaReserva < 18) {
            jornadaReserva = 'tarde';
        } else {
            jornadaReserva = 'noche';
        }
        
        // Buscar reservas aprobadas para este ambiente en la misma fecha y jornada
        const reservaConflictiva = reservas.find(reserva => {
            if (reserva.ambiente === ambienteId && reserva.estado === "aprobada" && reserva.fecha === fecha) {
                try {
                    const horaReservaExistente = parseInt(reserva.hora.split(':')[0]);
                    
                    // Determinar la jornada de la reserva existente
                    let jornadaExistente = '';
                    if (horaReservaExistente >= 6 && horaReservaExistente < 12) {
                        jornadaExistente = 'mañana';
                    } else if (horaReservaExistente >= 12 && horaReservaExistente < 18) {
                        jornadaExistente = 'tarde';
                    } else {
                        jornadaExistente = 'noche';
                    }
                    
                    // Si es la misma jornada, hay conflicto
                    return jornadaExistente === jornadaReserva;
                } catch (dateError) {
                    return false;
                }
            }
            return false;
        });
        
        return !reservaConflictiva; // Retorna true si NO hay conflicto (disponible)
    } catch (error) {
        console.error("Error verificando disponibilidad futura:", error);
        return true; // Por defecto disponible si hay error
    }
};

/**
 * Dispara eventos para notificar cambios en la disponibilidad
 */
export const notificarCambioDisponibilidad = () => {
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('disponibilidad-cambiada'));
    
    // También disparar eventos específicos para compatibilidad
    window.dispatchEvent(new CustomEvent('ambientes-updated'));
};

/**
 * Utilidades SOLO para ambientes
 * (Sin dependencias de reservas)
 */
export const formatearAmbiente = (ambiente) => {
  // Formateo de datos de ambiente
};

export const validarAmbiente = (ambienteData) => {
  // Validaciones específicas de ambiente
};