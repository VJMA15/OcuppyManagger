import { useState, useEffect } from 'react';

export const useUpcomingReservations = () => {
    const [reservasRecientes, setReservasRecientes] = useState(() => {
        const stored = localStorage.getItem("reservas");
        if (!stored) return [];
        const now = new Date();
        return JSON.parse(stored).filter(r => {
            if (!r.fecha || !r.hora) return false;
            const reservaDate = new Date(`${r.fecha}T${r.hora}`);
            return reservaDate > now;
        });
    });

    // Actualizar reservas recientes al montar y cuando cambian las reservas en localStorage
    useEffect(() => {
        function updateRecientes() {
            const stored = localStorage.getItem("reservas");
            if (!stored) {
                setReservasRecientes([]);
                return;
            }
            const now = new Date();
            const recientes = JSON.parse(stored).filter(r => {
                if (!r.fecha || !r.hora) return false;
                const reservaDate = new Date(`${r.fecha}T${r.hora}`);
                return reservaDate > now;
            });
            setReservasRecientes(recientes);
        }
        updateRecientes();
        const interval = setInterval(updateRecientes, 60000);
        const onStorage = (e) => {
            if (e.key === "reservas") updateRecientes();
        };
        window.addEventListener("storage", onStorage);
        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    // También actualiza inmediatamente cuando se agrega una reserva en la misma pestaña
    useEffect(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            if (key === "reservas") {
                window.dispatchEvent(new Event("storage"));
            }
        };
        return () => {
            localStorage.setItem = originalSetItem;
        };
    }, []);

    return reservasRecientes;
}; 