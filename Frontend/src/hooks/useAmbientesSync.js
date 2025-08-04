import { useState, useEffect } from 'react';
import { verificarDisponibilidadAmbiente, actualizarEstadosAmbientes } from '@/utils/ambienteUtils';

export const useAmbientesSync = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const cargarAmbientes = () => {
        try {
            const ambientesGuardados = localStorage.getItem("ambientes");
            if (ambientesGuardados) {
                const parsed = JSON.parse(ambientesGuardados);
                // Verificar si los ambientes tienen todas las propiedades necesarias
                const ambientesCompletos = parsed.map(ambiente => ({
                    id: ambiente.id || Math.random(),
                    nombre: ambiente.nombre || "Ambiente sin nombre",
                    tipo: ambiente.tipo || "General",
                    capacidad: ambiente.capacidad || 0,
                    equipos: ambiente.equipos || 0,
                    estado: ambiente.estado || "Disponible",
                    ubicacion: ambiente.ubicacion || "Sin ubicación",
                    descripcion: ambiente.descripcion || "Sin descripción",
                    servicios: ambiente.servicios || [],
                    horario: ambiente.horario || "8:00 AM - 6:00 PM",
                    responsable: ambiente.responsable || "Sin responsable",
                    ultimaReserva: ambiente.ultimaReserva || null
                }));
                
                // Actualizar estados basado en reservas aprobadas
                const ambientesConEstadoActualizado = ambientesCompletos.map(ambiente => ({
                    ...ambiente,
                    estado: verificarDisponibilidadAmbiente(ambiente.id) ? "Disponible" : "Ocupado"
                }));
                
                setAmbientes(ambientesConEstadoActualizado);
                localStorage.setItem("ambientes", JSON.stringify(ambientesConEstadoActualizado));
            } else {
                // Si no hay ambientes guardados, usar datos de ejemplo
                const ambientesEjemplo = [
                    {
                        id: "101",
                        nombre: "Sala de Conferencias A",
                        tipo: "Conferencia",
                        capacidad: 20,
                        equipos: 15,
                        estado: "Disponible",
                        ubicacion: "Piso 1 - Ala Norte",
                        descripcion: "Sala equipada con proyector, sistema de audio y micrófonos inalámbricos.",
                        servicios: ["Proyector", "Audio", "WiFi", "Aire acondicionado"],
                        horario: "8:00 AM - 6:00 PM",
                        responsable: "María González",
                        ultimaReserva: "2024-01-15"
                    },
                    {
                        id: "102",
                        nombre: "Laboratorio de Computación 1",
                        tipo: "Laboratorio",
                        capacidad: 25,
                        equipos: 25,
                        estado: "Disponible",
                        ubicacion: "Piso 2 - Ala Este",
                        descripcion: "Laboratorio con 25 computadoras de última generación.",
                        servicios: ["Computadoras", "Software especializado", "WiFi", "Impresora"],
                        horario: "7:00 AM - 8:00 PM",
                        responsable: "Carlos Ruiz",
                        ultimaReserva: "2024-01-16"
                    }
                ];
                
                const ambientesConEstadoActualizado = ambientesEjemplo.map(ambiente => ({
                    ...ambiente,
                    estado: verificarDisponibilidadAmbiente(ambiente.id) ? "Disponible" : "Ocupado"
                }));
                
                setAmbientes(ambientesConEstadoActualizado);
                localStorage.setItem("ambientes", JSON.stringify(ambientesConEstadoActualizado));
            }
        } catch (error) {
            console.error('Error cargando ambientes:', error);
            setAmbientes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const actualizarEstados = () => {
        setAmbientes(prevAmbientes => prevAmbientes.map(ambiente => ({
            ...ambiente,
            estado: verificarDisponibilidadAmbiente(ambiente.id) ? "Disponible" : "Ocupado"
        })));
    };

    useEffect(() => {
        // Cargar ambientes al montar
        cargarAmbientes();
        
        // Actualizar cada minuto para cambios en tiempo real
        const interval = setInterval(actualizarEstados, 60000);
        
        // Escuchar todos los eventos relevantes
        const handleReservaChange = () => {
            console.log('🔄 Evento de reserva detectado, actualizando estados de ambientes...');
            actualizarEstados();
        };

        const handleDisponibilidadChange = () => {
            console.log('🔄 Cambio de disponibilidad detectado, actualizando estados de ambientes...');
            actualizarEstados();
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

    return {
        ambientes,
        isLoading,
        actualizarEstados,
        cargarAmbientes
    };
}; 