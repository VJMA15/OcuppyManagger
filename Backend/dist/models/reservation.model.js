"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationModel = void 0;
const mongoose_1 = require("mongoose");
const reservation_types_1 = require("../types/reservation.types");
const equipmentSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(reservation_types_1.EquipmentType),
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});
const reservationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    environmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Ambiente',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(reservation_types_1.ReservationStatus),
        default: reservation_types_1.ReservationStatus.PENDING
    },
    purpose: {
        type: String,
        required: true,
        maxlength: 500
    },
    equipment: [equipmentSchema],
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});
// Índices para optimizar consultas
reservationSchema.index({ userId: 1, startDate: 1 });
reservationSchema.index({ environmentId: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });
exports.ReservationModel = (0, mongoose_1.model)('Reservation', reservationSchema);
//# sourceMappingURL=reservation.model.js.map