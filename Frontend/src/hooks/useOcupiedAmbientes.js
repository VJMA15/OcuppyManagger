import { useState, useEffect } from 'react';
import { obtenerAmbientesOcupados, notificarCambioDisponibilidad } from '@/utils/ambienteUtils';

export const useOcupiedAmbientes = () => {
    const [ambientesOcupados, setAmbientesOcupados] = useState([]);

    const actualizarAmbientesOcupados = () => {
        const ocupados = obtenerAmbientesOcupados();
        setAmbientesOcupados(ocupados);
    };

    useEffect(() => {
        // Actualizar inmediatamente al montar
        actualizarAmbientesOcupados();
        
        // Actualizar cada minuto para cambios en tiempo real
        const interval = setInterval(actualizarAmbientesOcupados, 60000);
        
        // Escuchar todos los eventos relevantes
        const handleReservaChange = () => {
            console.log('🔄 Evento de reserva detectado, actualizando ambientes ocupados...');
            actualizarAmbientesOcupados();
        };

        const handleDisponibilidadChange = () => {
            console.log('🔄 Cambio de disponibilidad detectado, actualizando ambientes ocupados...');
            actualizarAmbientesOcupados();
        };

        // Eventos de reservas
        window.addEventListener('reserva-created', handleReservaChange);
        window.addEventListener('reserva-approved', handleReservaChange);
        window.addEventListener('reserva-rejected', handleReservaChange);
        window.addEventListener('reserva-cancelled', handleReservaChange);
        
        // Eventos de disponibilidad
        window.addEventListener('disponibilidad-cambiada', handleDisponibilidadChange);
        window.addEventListener('ambientes-updated', handleDisponibilidadChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('reserva-created', handleReservaChange);
            window.removeEventListener('reserva-approved', handleReservaChange);
            window.removeEventListener('reserva-rejected', handleReservaChange);
            window.removeEventListener('reserva-cancelled', handleReservaChange);
            window.removeEventListener('disponibilidad-cambiada', handleDisponibilidadChange);
            window.removeEventListener('ambientes-updated', handleDisponibilidadChange);
        };
    }, []);

    return ambientesOcupados;
}; 