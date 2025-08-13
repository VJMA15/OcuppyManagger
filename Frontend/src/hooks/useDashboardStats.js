import { useState, useEffect } from 'react';
import useReservas from './useReservas';
import { useAmbientes } from './useAmbientes';
// CORRECCIÓN: Cambiar la importación a la ruta correcta
import { obtenerAmbientesOcupados } from '@/utils/ambienteUtils';

export const useDashboardStats = () => {
    const { reservas, loading: loadingReservas } = useReservas();
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

        // Calcular estadísticas desde los datos de la API
        const totalReservas = reservas.length;
        // CORRECCIÓN: Usar los estados correctos que existen en los datos mock
        const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
        const reservasAprobadas = reservas.filter(r => r.estado === 'activa').length; // 'activa' en lugar de 'aprobada'
        const reservasRechazadas = reservas.filter(r => r.estado === 'rechazada').length;
        
        // Calcular reservas activas (usar 'activa' que es el estado en los datos mock)
        const reservasActivas = reservas.filter(r => r.estado === 'activa').length;

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

