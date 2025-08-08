import { useState, useEffect } from 'react';
import useReservas from './useReservas';
import { useAmbientes } from './useAmbientes';
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

        // Calcular estadísticas desde los datos de la API
        const totalReservas = reservas.length;
        const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
        const reservasAprobadas = reservas.filter(r => r.estado === 'aprobada').length;
        const reservasRechazadas = reservas.filter(r => r.estado === 'rechazada').length;
        
        // Calcular reservas activas (aprobadas y en curso)
        const ahora = new Date();
        const reservasActivas = reservas.filter(r => {
            if (r.estado !== 'aprobada') return false;
            if (!r.fechaInicio || !r.fechaFin) return false;
            
            const inicio = new Date(r.fechaInicio);
            const fin = new Date(r.fechaFin);
            
            return ahora >= inicio && ahora <= fin;
        }).length;

        // Obtener ambientes ocupados usando la utilidad existente
        const ambientesOcupadosArray = obtenerAmbientesOcupados();
        const ambientesOcupados = ambientesOcupadosArray.length;
        const ambientesDisponibles = Math.max(0, ambientes.length - ambientesOcupados);

        setStats({
            totalReservas,
            reservasPendientes,
            reservasAprobadas,
            reservasRechazadas,
            reservasActivas,
            ambientesDisponibles,
            ambientesOcupados
        });
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
        ambientesOcupados: obtenerAmbientesOcupados(),
        
        // Estados de edición
        edit,
        setEdit,
        
        // Estados de carga
        loading: loadingReservas || loadingAmbientes
    };
};

export default useDashboardStats;