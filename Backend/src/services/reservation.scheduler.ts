import { ReservationModel } from '../models/reservation.model';
import { ReservationStatus } from '../types/reservation.types';
import { emitEvent, Events } from './eventBus';

// Intervalo en milisegundos para verificar reservas vencidas
const DEFAULT_INTERVAL_MS = 60 * 1000; // 1 minuto

export const startReservationScheduler = (intervalMs: number = DEFAULT_INTERVAL_MS) => {
  const run = async () => {
    const now = new Date();
    try {
      // Marcar como COMPLETED las reservas aprobadas cuyo endDate ya pasó
      const completeResult = await ReservationModel.updateMany(
        {
          status: ReservationStatus.APPROVED,
          endDate: { $lt: now }
        },
        {
          $set: {
            status: ReservationStatus.COMPLETED,
            completedAt: now
          }
        }
      );

      // Marcar como EXPIRED las reservas pendientes cuyo endDate ya pasó
      const expireResult = await ReservationModel.updateMany(
        {
          status: ReservationStatus.PENDING,
          endDate: { $lt: now }
        },
        {
          $set: {
            status: ReservationStatus.EXPIRED,
            expiredAt: now,
            rejectionReason: 'Expirada automáticamente por superar la fecha/horario programado'
          }
        }
      );

      const completed = (completeResult as any)?.modifiedCount ?? (completeResult as any)?.nModified ?? 0;
      const expired = (expireResult as any)?.modifiedCount ?? (expireResult as any)?.nModified ?? 0;
      if (completed || expired) {
        console.log(`⏱️ [ReservationScheduler] Actualizadas ${completed} completadas y ${expired} expiradas`);
        try {
          emitEvent('reservas', Events.RESERVAS_UPDATED, { completed, expired });
        } catch (_) {}
      }
    } catch (err) {
      console.error('❌ [ReservationScheduler] Error al actualizar estados de reservas:', err);
    }
  };

  // Ejecutar al inicio y luego cada intervalo
  run();
  const timer = setInterval(run, intervalMs);
  return timer;
};

export default startReservationScheduler;