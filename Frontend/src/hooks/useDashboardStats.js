import { useState, useEffect } from 'react';

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

    // Calcular automáticamente disponibles y ocupados
    const disponibles = Math.max(0, ambientes - reservasActivas);
    const ocupados = reservasActivas;

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
        window.addEventListener('storage', onStorage);
        window.addEventListener('reservas-updated', onReservasUpdated);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('reservas-updated', onReservasUpdated);
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
        edit,
        setEdit
    };
}; 