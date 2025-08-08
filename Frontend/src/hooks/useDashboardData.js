/**
 * Hook que combina datos de ambientes y reservas
 * para estadísticas del dashboard
 */
import { useAmbientes } from './useAmbientes';
import { useReservas } from './useReservas';
import { obtenerAmbientesOcupados } from '@/utils/disponibilidadUtils';

export const useDashboardData = () => {
  const { ambientes, isLoading: ambientesLoading } = useAmbientes();
  const { reservas, isLoading: reservasLoading } = useReservas();
  
  // Lógica de combinación aquí
  
  return {
    // Estadísticas calculadas
  };
};