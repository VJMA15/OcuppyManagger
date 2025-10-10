import { useState, useEffect, useMemo } from 'react';
import { useReservasContext } from '@/contexts/ReservasContext';
import { useAmbientes } from './useAmbientes';
import { obtenerAmbientesOcupados } from '@/utils/ambienteUtils';
 
export const useDashboardStats = () => {
    const { reservas, loading: loadingReservas, stats: contextStats } = useReservasContext();
    const { ambientes, loading: loadingAmbientes } = useAmbientes();
    
    const [edit, setEdit] = useState(null);
    // Mantener estadísticas estables para evitar que "parpadeen" a cero
    const [stableStats, setStableStats] = useState({
        totalReservas: 0,
        reservasPendientes: 0,
        reservasAprobadas: 0,
        reservasRechazadas: 0,
        reservasActivas: 0,
        ambientesDisponibles: 0,
        ambientesOcupados: 0
    });

    // Memoizar las estadísticas para evitar recálculos innecesarios
    const stats = useMemo(() => {
        // No volver a cero por estados de carga; solo si faltan datos reales
        if (!reservas || !ambientes) {
            return {
                totalReservas: 0,
                reservasPendientes: 0,
                reservasAprobadas: 0,
                reservasRechazadas: 0,
                reservasActivas: 0,
                ambientesDisponibles: 0,
                ambientesOcupados: 0
            };
        }

        console.log('📊 Calculando estadísticas con:', { reservas, ambientes });

        // Usar las estadísticas calculadas del contexto
        const totalReservas = contextStats.total;
        const reservasPendientes = contextStats.pendientes;
        const reservasAprobadas = contextStats.aprobadas;
        const reservasRechazadas = contextStats.rechazadas;
        const reservasActivas = contextStats.aprobadas; // Las aprobadas son las activas

        // Calcular ambientes ocupados sin filtros de fecha/jornada
        const ambientesOcupadosArray = obtenerAmbientesOcupados(ambientes, reservas);
        const ambientesOcupados = ambientesOcupadosArray.length;
        const ambientesDisponibles = Math.max(0, ambientes.length - ambientesOcupados);

        const newStats = {
            totalReservas,
            reservasPendientes,
            reservasAprobadas,
            reservasRechazadas,
            reservasActivas,
            ambientesDisponibles,
            ambientesOcupados
        };

        console.log('📈 Estadísticas calculadas:', newStats);
        return newStats;
    }, [reservas, ambientes, contextStats]);

    // Actualizar estadísticas estables solo cuando haya datos reales
    useEffect(() => {
        // Condición de datos válidos: hay ambientes o reservas calculadas
        const hasValidData = Array.isArray(ambientes) && Array.isArray(reservas) &&
            ((ambientes.length > 0) || (contextStats?.total > 0) ||
             (contextStats?.pendientes > 0) || (contextStats?.aprobadas > 0) || (contextStats?.rechazadas > 0));

        if (hasValidData) {
            setStableStats(stats);
        }
        // Si no hay datos válidos, mantenemos el último valor estable
    }, [stats, ambientes, reservas, contextStats]);

    // Memoizar los ambientes ocupados para evitar recálculos
    const ambientesOcupadosArray = useMemo(() => {
        return obtenerAmbientesOcupados(ambientes || [], reservas || []);
    }, [ambientes, reservas]);

    // Retornar tanto el formato nuevo como compatibilidad con el anterior
    return {
        // Formato nuevo y limpio (usar valores estables para evitar zeros transitorios)
        ...stableStats,
        
        // Compatibilidad con código existente
        disponibles: stableStats.ambientesDisponibles,
        ocupados: stableStats.ambientesOcupados,
        ambientes: ambientes?.length || 0,
        reservas: stableStats.totalReservas,
        // CORRECCIÓN: Usar el valor memoizado
        ambientesOcupados: ambientesOcupadosArray,
        
        // Estados de edición
        edit,
        setEdit,
        
        // Estados de carga
        loading: loadingReservas || loadingAmbientes
    };
};

export default useDashboardStats;

