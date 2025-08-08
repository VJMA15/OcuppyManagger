import { useState, useEffect } from 'react';
import { obtenerAmbientesOcupados } from '@/utils/ambienteUtils';
import useAmbientes from '@/hooks/useAmbientes'; // Importar el hook de la API
import useReservas from '@/hooks/useReservas'; // Importar el hook de reservas

export const useDashboardStats = () => {
    // Usar hooks de la API en lugar de localStorage
    const { ambientes: ambientesAPI, isLoading: ambientesLoading } = useAmbientes();
    const { reservas: reservasAPI, isLoading: reservasLoading } = useReservas();
    
    const [reservasPendientes, setReservasPendientes] = useState(0);
    const [reservasAprobadas, setReservasAprobadas] = useState(0);
    const [reservasRechazadas, setReservasRechazadas] = useState(0);
    const [reservasActivas, setReservasActivas] = useState(0);

    // Calcular estadísticas basadas en datos reales de la API
    const ambientes = ambientesAPI?.length || 0;
    const reservas = reservasAPI?.length || 0;
    
    // Obtener ambientes ocupados directamente
    const ambientesOcupados = obtenerAmbientesOcupados(ambientesAPI, reservasAPI);
    const ocupados = ambientesOcupados.length;
    const disponibles = Math.max(0, ambientes - ocupados);

    const [edit, setEdit] = useState(null);

    // Calcular estadísticas de reservas
    useEffect(() => {
        if (reservasAPI && Array.isArray(reservasAPI)) {
            setReservasPendientes(reservasAPI.filter(r => r.estado === 'pendiente').length);
            setReservasAprobadas(reservasAPI.filter(r => r.estado === 'aprobada').length);
            setReservasRechazadas(reservasAPI.filter(r => r.estado === 'rechazada').length);
            
            // Calcular reservas activas (aprobadas y en curso)
            const ahora = new Date();
            const activas = reservasAPI.filter(r => {
                if (r.estado !== 'aprobada') return false;
                if (!r.fechaInicio || !r.fechaFin) return false;
                
                const inicio = new Date(r.fechaInicio);
                const fin = new Date(r.fechaFin);
                return ahora >= inicio && ahora <= fin;
            }).length;
            
            setReservasActivas(activas);
        }
    }, [reservasAPI]);

    return {
        disponibles,
        ocupados,
        ambientes,
        reservas,
        reservasPendientes,
        reservasAprobadas,
        reservasRechazadas,
        reservasActivas,
        ambientesOcupados,
        edit,
        setEdit,
        isLoading: ambientesLoading || reservasLoading
    };
};