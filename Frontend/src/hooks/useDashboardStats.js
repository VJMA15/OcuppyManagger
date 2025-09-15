import { useState, useEffect } from 'react';
import { useReservasContext } from '@/contexts/ReservasContext';
import { useAmbientes } from './useAmbientes';
// CORRECCIÓN: Cambiar la importación a la ruta correcta
import { obtenerAmbientesOcupados } from '@/utils/ambienteUtils';

export const useDashboardStats = () => {
    const { reservas, loading: loadingReservas, stats: contextStats } = useReservasContext();
    const { ambientes, loading: loadingAmbientes } = useAmbientes();
    
    const [stats, setStats] = useState({
        totalReservas: 0,
        reservasPendientes: 0,
        reservasAprobadas: 0,
        reservasRechazadas: 0,
        reservasActivas: 0,
        ambientesDisponibles: 0,
        ambientesOcupados: 0
    });

    const [edit, setEdit] = useState(null);

    useEffect(() => {
        if (loadingReservas || loadingAmbientes || !reservas || !ambientes) {
            return;
        }

        console.log('📊 Calculando estadísticas con:', { reservas, ambientes });

        // Usar las estadísticas calculadas del contexto
        const totalReservas = contextStats.total;
        const reservasPendientes = contextStats.pendientes;
        const reservasAprobadas = contextStats.aprobadas;
        const reservasRechazadas = contextStats.rechazadas;
        const reservasActivas = contextStats.aprobadas; // Las aprobadas son las activas

        // CORRECCIÓN: Usar los datos correctos para calcular ambientes ocupados
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
        setStats(newStats);
    }, [reservas, ambientes, loadingReservas, loadingAmbientes]);

    // Retornar tanto el formato nuevo como compatibilidad con el anterior
    return {
        // Formato nuevo y limpio
        ...stats,
        
        // Compatibilidad con código existente
        disponibles: stats.ambientesDisponibles,
        ocupados: stats.ambientesOcupados,
        ambientes: ambientes?.length || 0,
        reservas: stats.totalReservas,
        // CORRECCIÓN: Pasar parámetros correctos aquí también
        ambientesOcupados: obtenerAmbientesOcupados(ambientes || [], reservas || []),
        
        // Estados de edición
        edit,
        setEdit,
        
        // Estados de carga
        loading: loadingReservas || loadingAmbientes
    };
};

export default useDashboardStats;

