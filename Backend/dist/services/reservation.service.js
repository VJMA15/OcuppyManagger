"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const reservation_model_1 = require("../models/reservation.model");
const reservation_types_1 = require("../types/reservation.types");
class ReservationService {
    async createReservation(data) {
        // Validar disponibilidad
        await this.validateAvailability(data.environmentId, data.startDate, data.endDate);
        const reservation = new reservation_model_1.ReservationModel(data);
        return await reservation.save();
    }
    async getReservations(filters) {
        // Eliminamos los populate() ya que los modelos referenciados no existen
        return await reservation_model_1.ReservationModel
            .find(filters)
            .sort({ createdAt: -1 });
    }
    async getReservationById(id) {
        // Eliminamos los populate() ya que los modelos referenciados no existen
        return await reservation_model_1.ReservationModel.findById(id);
    }
    async updateReservation(id, data) {
        return await reservation_model_1.ReservationModel.findByIdAndUpdate(id, data, { new: true });
    }
    async deleteReservation(id) {
        const result = await reservation_model_1.ReservationModel.findByIdAndDelete(id);
        return !!result;
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