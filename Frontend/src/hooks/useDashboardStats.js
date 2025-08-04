import { useState, useEffect } from 'react';
import { obtenerAmbientesOcupados } from '@/utils/ambienteUtils';

export const useDashboardStats = () => {
    // Calcular automáticamente basándose en ambientes y reservas
    const [ambientes, setAmbientes] = useState(() => {
        const a = localStorage.getItem('ambientes');
        if (a) {
            try {
                const ambientesArray = JSON.parse(a);
                return Array.isArray(ambientesArray) ? ambientesArray.length : 12; // 12 por defecto
            } catch {
                return 12;
            }
        }
        return 12; // Total de ambientes por defecto
    });
    
    const [reservas, setReservas] = useState(() => {
        const r = localStorage.getItem('reservas');
        if (r) {
            try {
                const arr = JSON.parse(r);
                return Array.isArray(arr) ? arr.length : 0;
            } catch {
                return 0;
            }
        }
        return 0;
    });

    const [reservasPendientes, setReservasPendientes] = useState(0);
    const [reservasAprobadas, setReservasAprobadas] = useState(0);
    const [reservasRechazadas, setReservasRechazadas] = useState(0);
    const [reservasActivas, setReservasActivas] = useState(0); // Reservas aprobadas y en curso

    // Obtener ambientes ocupados directamente
    const ambientesOcupados = obtenerAmbientesOcupados();
    const ocupados = ambientesOcupados.length;
    const disponibles = Math.max(0, ambientes - ocupados);

    const [edit, setEdit] = useState(null);

    // Sincronizar cuando cambian ambientes o reservas
    useEffect(() => {
        function syncData() {
            // Sincronizar ambientes
            const a = localStorage.getItem('ambientes');
            if (a) {
                try {
                    const ambientesArray = JSON.parse(a);
                    setAmbientes(Array.isArray(ambientesArray) ? ambientesArray.length : 12);
                } catch {
                    setAmbientes(12);
                }
            } else {
                setAmbientes(12);
            }

            // Sincronizar reservas
            const r = localStorage.getItem('reservas');
            if (r) {
                try {
                    const arr = JSON.parse(r);
                    const reservasArray = Array.isArray(arr) ? arr : [];
                    setReservas(reservasArray.length);
                    
                    // Contar por estado
                    setReservasPendientes(reservasArray.filter(r => r.estado === 'pendiente').length);
                    setReservasAprobadas(reservasArray.filter(r => r.estado === 'aprobada').length);
                    setReservasRechazadas(reservasArray.filter(r => r.estado === 'rechazada').length);
                    
                    // Calcular reservas activas (aprobadas y en curso)
                    const ahora = new Date();
                    const activas = reservasArray.filter(r => {
                        if (r.estado !== 'aprobada') return false;
                        if (!r.fecha || !r.hora) return false;
                        
                        const fechaHora = new Date(r.fecha + 'T' + r.hora);
                        const duracion = r.duracion ? parseFloat(r.duracion) * 60 * 60 * 1000 : 60 * 60 * 1000;
                        const fechaFin = new Date(fechaHora.getTime() + duracion);
                        
                        return ahora >= fechaHora && ahora <= fechaFin;
                    });
                    setReservasActivas(activas.length);
                } catch {
                    setReservas(0);
                    setReservasPendientes(0);
                    setReservasAprobadas(0);
                    setReservasRechazadas(0);
                    setReservasActivas(0);
                }
            } else {
                setReservas(0);
                setReservasPendientes(0);
                setReservasAprobadas(0);
                setReservasRechazadas(0);
                setReservasActivas(0);
            }
        }
        
        syncData();
        const interval = setInterval(syncData, 60000); // Verificar cada minuto
        const onStorage = (e) => {
            if (e.key === 'reservas' || e.key === 'ambientes') {
                syncData();
            }
        };
        const onReservasUpdated = () => {
            syncData();
        };
        
        // Escuchar eventos específicos de reservas
        const onReservaApproved = () => {
            console.log('🔄 Evento de reserva aprobada detectado en dashboard stats');
            syncData();
        };
        const onReservaRejected = () => {
            console.log('🔄 Evento de reserva rechazada detectado en dashboard stats');
            syncData();
        };
        const onReservaCancelled = () => {
            console.log('🔄 Evento de reserva cancelada detectado en dashboard stats');
            syncData();
        };
        const onReservaCreated = () => {
            console.log('🔄 Evento de reserva creada detectado en dashboard stats');
            syncData();
        };
        const onDisponibilidadChanged = () => {
            console.log('🔄 Evento de cambio de disponibilidad detectado en dashboard stats');
            syncData();
        };
        
        // Forzar actualización inmediata cuando cambien los ambientes ocupados
        const forceUpdate = () => {
            console.log('🔄 Forzando actualización de dashboard stats...');
            syncData();
        };
        
        window.addEventListener('storage', onStorage);
        window.addEventListener('reservas-updated', onReservasUpdated);
        window.addEventListener('reserva-created', onReservaCreated);
        window.addEventListener('reserva-approved', onReservaApproved);
        window.addEventListener('reserva-rejected', onReservaRejected);
        window.addEventListener('reserva-cancelled', onReservaCancelled);
        window.addEventListener('disponibilidad-cambiada', onDisponibilidadChanged);
        window.addEventListener('ambientes-updated', onDisponibilidadChanged);
        
        // Actualizar cada 5 segundos para cambios en tiempo real
        const quickInterval = setInterval(forceUpdate, 5000);
        
        return () => {
            clearInterval(interval);
            clearInterval(quickInterval);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('reservas-updated', onReservasUpdated);
            window.removeEventListener('reserva-created', onReservaCreated);
            window.removeEventListener('reserva-approved', onReservaApproved);
            window.removeEventListener('reserva-rejected', onReservaRejected);
            window.removeEventListener('reserva-cancelled', onReservaCancelled);
            window.removeEventListener('disponibilidad-cambiada', onDisponibilidadChanged);
            window.removeEventListener('ambientes-updated', onDisponibilidadChanged);
        };
    }, []);

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
        setEdit
    };
}; 