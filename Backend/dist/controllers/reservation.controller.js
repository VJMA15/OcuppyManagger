"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const reservation_service_1 = require("../services/reservation.service");
const User = require('../models/user.model');
class ReservationController {
    constructor() {
        this.reservationService = new reservation_service_1.ReservationService();
    }
    async createReservation(req, res) {
        try {
            // Obtener el usuario autenticado desde el middleware de autenticación
            // Asumiendo que tienes middleware que agrega user al request
            const userCC = req.user?.cc || req.body.userCC;
            if (!userCC) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario no autenticado o CC no proporcionado'
                });
            }
            // Buscar usuario por CC
            const user = await User.findOne({ cc: userCC });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado en el sistema'
                });
            }
            const reservationData = {
                ...req.body,
                userId: user._id // Usar el ObjectId del usuario autenticado
            };
            const reservation = await this.reservationService.createReservation(reservationData);
            res.status(201).json({
                success: true,
                data: reservation,
                message: 'Reserva creada exitosamente'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
    }
    async getReservations(req, res) {
        try {
            const filters = this.buildFilters(req.query);
            const reservations = await this.reservationService.getReservations(filters);
            res.json({
                success: true,
                data: reservations
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    async getMyReservations(req, res) {
        try {
            // Ahora el userId debe venir como parámetro de query
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido'
                });
            }
            const reservations = await this.reservationService.getReservations({
                userId: userId
            });
            res.json({
                success: true,
                data: reservations
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    async approveReservation(req, res) {
        try {
            const { id } = req.params;
            const { approvedBy } = req.body; // El ID del aprobador viene del frontend
            if (!approvedBy) {
                return res.status(400).json({
                    success: false,
                    message: 'approvedBy es requerido'
                });
            }
            const reservation = await this.reservationService.approveReservation(id, approvedBy);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation,
                message: 'Reserva aprobada exitosamente'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    buildFilters(query) {
        const filters = {};
        if (query.status)
            filters.status = query.status;
        if (query.environmentId)
            filters.environmentId = query.environmentId;
        if (query.userId)
            filters.userId = query.userId;
        if (query.startDate && query.endDate) {
            filters.startDate = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate)
            };
        }
        return filters;
    }
}
exports.ReservationController = ReservationController;
//# sourceMappingURL=reservation.controller.js.map