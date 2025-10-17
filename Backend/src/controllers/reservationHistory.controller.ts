import { Request, Response } from 'express';
import { ReservationHistoryModel } from '../models/reservation-history.model';
import { emitEvent, Events } from '../services/eventBus';

export class ReservationHistoryController {
  async getHistory(req: Request, res: Response) {
    try {
      const {
        status,
        environmentId,
        userId,
        deletedBy,
        startDeletedAt,
        endDeletedAt,
        environmentName,
        userName,
        deletedByName,
        q
      } = req.query as Record<string, string>;

      const filters: any = {};
      if (status) filters.status = status;
      if (environmentId) filters.environmentId = environmentId;
      if (userId) filters.userId = userId;
      if (deletedBy) filters.deletedBy = deletedBy;

      if (startDeletedAt || endDeletedAt) {
        filters.deletedAt = {};
        if (startDeletedAt) filters.deletedAt.$gte = new Date(startDeletedAt);
        if (endDeletedAt) filters.deletedAt.$lte = new Date(endDeletedAt);
      }

      // Si se solicita filtrado por nombres o búsqueda global, usar agregación con lookups
      if (environmentName || userName || deletedByName || q) {
        const pipeline: any[] = [
          { $match: filters },
          { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
          { $lookup: { from: 'ambientes', localField: 'environmentId', foreignField: '_id', as: 'environment' } },
          { $lookup: { from: 'users', localField: 'deletedBy', foreignField: '_id', as: 'deletedByUser' } },
          { $lookup: { from: 'users', localField: 'approvedBy', foreignField: '_id', as: 'approvedByUser' } },
          { $unwind: '$user' },
          { $unwind: '$environment' },
          { $unwind: { path: '$deletedByUser', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$approvedByUser', preserveNullAndEmptyArrays: true } }
        ];

        const matchStage: any = {};
        if (userName) matchStage['user.nombre'] = { $regex: userName, $options: 'i' };
        if (environmentName) matchStage['environment.nombre'] = { $regex: environmentName, $options: 'i' };
        if (deletedByName) matchStage['deletedByUser.nombre'] = { $regex: deletedByName, $options: 'i' };
        if (q) {
          matchStage.$or = [
            { 'user.nombre': { $regex: q, $options: 'i' } },
            { 'environment.nombre': { $regex: q, $options: 'i' } },
            { 'deletedByUser.nombre': { $regex: q, $options: 'i' } }
          ];
        }
        if (Object.keys(matchStage).length > 0) {
          pipeline.push({ $match: matchStage });
        }

        pipeline.push({
          $project: {
            originalId: 1,
            reservationDate: 1,
            jornada: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            purpose: 1,
            equipment: 1,
            rejectionReason: 1,
            completedAt: 1,
            expiredAt: 1,
            deletedAt: 1,
            createdAt: 1,
            updatedAt: 1,
            userId: { _id: '$user._id', nombre: '$user.nombre', email: '$user.email', cc: '$user.cc', role: '$user.role' },
            environmentId: { _id: '$environment._id', nombre: '$environment.nombre', codigo: '$environment.codigo', tipo: '$environment.tipo' },
            deletedBy: { _id: { $ifNull: ['$deletedByUser._id', '$deletedBy'] }, nombre: '$deletedByUser.nombre', cc: '$deletedByUser.cc' },
            approvedBy: { _id: { $ifNull: ['$approvedByUser._id', '$approvedBy'] }, nombre: '$approvedByUser.nombre', cc: '$approvedByUser.cc' }
          }
        });

        pipeline.push({ $sort: { deletedAt: -1 } });

        const history = await ReservationHistoryModel.aggregate(pipeline).exec();
        return res.json({ success: true, data: history });
      }

      const history = await ReservationHistoryModel.find(filters)
        .populate('userId', 'nombre email cc role')
        .populate('environmentId', 'nombre codigo tipo')
        .populate('deletedBy', 'nombre cc')
        .populate('approvedBy', 'nombre cc')
        .sort({ deletedAt: -1 })
        .exec();

      res.json({ success: true, data: history });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: msg });
    }
  }

  async getHistoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = await ReservationHistoryModel.findById(id)
        .populate('userId', 'nombre email cc role')
        .populate('environmentId', 'nombre codigo tipo')
        .populate('deletedBy', 'nombre cc')
        .populate('approvedBy', 'nombre cc')
        .exec();
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Historial no encontrado' });
      }
      res.json({ success: true, data: doc });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: msg });
    }
  }

  // Eliminar un registro individual del historial
  async deleteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ReservationHistoryModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Registro de historial no encontrado' });
      }
      res.json({ success: true, data: { _id: id }, message: 'Registro de historial eliminado' });
      try {
        emitEvent('historial', Events.HISTORIAL_CHANGED, { action: 'deletedHistory', id: String(id) });
      } catch (_) {}
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: msg });
    }
  }

  // Limpiar por completo el historial
  async clearHistory(req: Request, res: Response) {
    try {
      const result = await ReservationHistoryModel.deleteMany({});
      res.json({ success: true, deletedCount: result.deletedCount || 0, message: 'Historial limpiado' });
      try {
        emitEvent('historial', Events.HISTORIAL_CHANGED, { action: 'cleared', count: result.deletedCount || 0 });
      } catch (_) {}
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: msg });
    }
  }
}

export default ReservationHistoryController;