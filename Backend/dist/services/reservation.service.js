"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const reservation_model_1 = require("../models/reservation.model");
const reservation_types_1 = require("../types/reservation.types");
class ReservationService {
    // Normaliza estado desde 'status' (inglés) o 'estado' (español) a minúsculas inglés
    normalizeStatusLegacy(reservation) {
        const raw = String(reservation?.status ?? reservation?.estado ?? '')
            .trim()
            .toLowerCase();
        if (!raw)
            return null;
        const map = {
            pending: reservation_types_1.ReservationStatus.PENDING,
            pendiente: reservation_types_1.ReservationStatus.PENDING,
            approved: reservation_types_1.ReservationStatus.APPROVED,
            aprobada: reservation_types_1.ReservationStatus.APPROVED,
            aprobado: reservation_types_1.ReservationStatus.APPROVED,
            aceptada: reservation_types_1.ReservationStatus.APPROVED,
            aceptado: reservation_types_1.ReservationStatus.APPROVED,
            rejected: reservation_types_1.ReservationStatus.REJECTED,
            rechazada: reservation_types_1.ReservationStatus.REJECTED,
            rechazado: reservation_types_1.ReservationStatus.REJECTED,
            cancelled: reservation_types_1.ReservationStatus.CANCELLED,
            canceled: reservation_types_1.ReservationStatus.CANCELLED,
            cancelada: reservation_types_1.ReservationStatus.CANCELLED,
            completed: reservation_types_1.ReservationStatus.COMPLETED,
            completada: reservation_types_1.ReservationStatus.COMPLETED
        };
        return map[raw] || raw;
    }
    async createReservation(data) {
        // Validar disponibilidad
        await this.validateAvailability(data.environmentId, data.startDate, data.endDate);
        const reservation = new reservation_model_1.ReservationModel(data);
        return await reservation.save();
    }
    async getReservations(filters = {}) {
        console.log('🔍 [ReservationService] getReservations called with filters:', JSON.stringify(filters, null, 2));
        try {
            console.log('📊 [ReservationService] Attempting to query ReservationModel...');
            // Verificar que el modelo esté disponible
            if (!reservation_model_1.ReservationModel) {
                console.error('❌ [ReservationService] ReservationModel is undefined');
                throw new Error('ReservationModel is not available');
            }
            console.log('✅ [ReservationService] ReservationModel is available');
            // Construir la consulta
            const query = reservation_model_1.ReservationModel.find(filters);
            console.log('🔍 [ReservationService] Query built:', query.getQuery());
            // Ejecutar la consulta
            console.log('⏳ [ReservationService] Executing query...');
            const reservations = await query.exec();
            console.log('✅ [ReservationService] Query executed successfully');
            console.log(`📈 [ReservationService] Found ${reservations.length} reservations`);
            return reservations;
        }
        catch (error) {
            console.error('❌ [ReservationService] Error in getReservations:', error);
            console.error('❌ [ReservationService] Error name:', error instanceof Error ? error.name : 'Unknown');
            console.error('❌ [ReservationService] Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('❌ [ReservationService] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    }
    async getReservationById(id) {
        console.log('🔍 [ReservationService] getReservationById called with id:', id);
        try {
            console.log('📊 [ReservationService] Attempting to find reservation by ID...');
            const reservation = await reservation_model_1.ReservationModel.findById(id);
            if (!reservation) {
                console.log('❌ [ReservationService] Reservation not found with id:', id);
                return null;
            }
            console.log('✅ [ReservationService] Reservation found:', reservation._id);
            return reservation;
        }
        catch (error) {
            console.error('❌ [ReservationService] Error in getReservationById:', error);
            throw error;
        }
    }
    async updateReservation(id, updateData) {
        console.log('🔍 [ReservationService] updateReservation called with id:', id);
        console.log('📝 [ReservationService] Update data:', JSON.stringify(updateData, null, 2));
        try {
            const reservation = await reservation_model_1.ReservationModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!reservation) {
                console.log('❌ [ReservationService] Reservation not found for update with id:', id);
                return null;
            }
            console.log('✅ [ReservationService] Reservation updated successfully:', reservation._id);
            return reservation;
        }
        catch (error) {
            console.error('❌ [ReservationService] Error in updateReservation:', error);
            throw error;
        }
    }
    async deleteReservation(id) {
        console.log('🔍 [ReservationService] deleteReservation called with id:', id);
        try {
            // Primero obtener la reserva para validar el estado
            const existing = await reservation_model_1.ReservationModel.findById(id);
            if (!existing) {
                console.log('❌ [ReservationService] Reservation not found for deletion with id:', id);
                return null;
            }
            const normalized = this.normalizeStatusLegacy(existing);
            if (normalized !== reservation_types_1.ReservationStatus.REJECTED &&
                normalized !== reservation_types_1.ReservationStatus.APPROVED &&
                normalized !== reservation_types_1.ReservationStatus.CANCELLED) {
                console.log('⚠️ [ReservationService] Attempt to delete reservation with non-deletable status:', {
                    id,
                    status: existing.status,
                    estado: existing.estado,
                    normalized
                });
                throw new Error('Solo se pueden eliminar reservas con estado REJECTED, APPROVED o CANCELLED');
            }
            const reservation = await reservation_model_1.ReservationModel.findByIdAndDelete(id);
            if (!reservation) {
                console.log('❌ [ReservationService] Reservation not found for deletion with id:', id);
                return null;
            }
            console.log('✅ [ReservationService] Reservation deleted successfully:', reservation._id);
            return reservation;
        }
        catch (error) {
            console.error('❌ [ReservationService] Error in deleteReservation:', error);
            throw error;
        }
    }
    async deleteRejectedReservations() {
        console.log('🔍 [ReservationService] deleteRejectedReservations called');
        try {
            // Soporta documentos legado con campo 'estado: rechazad(a/o)'
            const result = await reservation_model_1.ReservationModel.deleteMany({
                $or: [
                    { status: reservation_types_1.ReservationStatus.REJECTED },
                    { estado: 'rechazada' },
                    { estado: 'rechazado' }
                ]
            });
            console.log('✅ [ReservationService] Rejected reservations deleted:', result.deletedCount || 0);
            return { deletedCount: result.deletedCount || 0 };
        }
        catch (error) {
            console.error('❌ [ReservationService] Error in deleteRejectedReservations:', error);
            throw error;
        }
    }
    async approveReservation(id, approvedBy) {
        return await reservation_model_1.ReservationModel.findByIdAndUpdate(id, {
            status: reservation_types_1.ReservationStatus.APPROVED,
            approvedBy,
            approvedAt: new Date()
        }, { new: true });
    }
    async rejectReservation(id, reason) {
        return await reservation_model_1.ReservationModel.findByIdAndUpdate(id, {
            status: reservation_types_1.ReservationStatus.REJECTED,
            rejectionReason: reason
        }, { new: true });
    }
    async validateAvailability(environmentId, startDate, endDate) {
        const conflictingReservation = await reservation_model_1.ReservationModel.findOne({
            environmentId,
            status: { $in: [reservation_types_1.ReservationStatus.PENDING, reservation_types_1.ReservationStatus.APPROVED] },
            $or: [
                {
                    startDate: { $lte: startDate },
                    endDate: { $gt: startDate }
                },
                {
                    startDate: { $lt: endDate },
                    endDate: { $gte: endDate }
                },
                {
                    startDate: { $gte: startDate },
                    endDate: { $lte: endDate }
                }
            ]
        });
        if (conflictingReservation) {
            throw new Error('El ambiente no está disponible en el horario solicitado');
        }
    }
}
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation.service.js.map