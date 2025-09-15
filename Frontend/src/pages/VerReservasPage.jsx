import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock as ClockIcon 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from '../contexts/auth-context';
import { useReservasContext } from '@/contexts/ReservasContext';
import reservationsService from '../services/reservationsService';
import { enrichReservasWithDetails } from '../utils/reservasUtils';
import VerReservasContainer from "@/containers/VerReservasContainer";

const VerReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { reservas, loading, refreshReservas, error: contextError } = useReservasContext();
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  // Usar el error del contexto si existe
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAprobar = async (id) => {
    try {
      setError(null);
      const response = await reservationsService.approveReservation(id, user?.id);
      if (response.success) {
        console.log('✅ Reserva aprobada, refrescando contexto...');
        // Solo refrescar el contexto global - no manejar estado local
        await refreshReservas();
      } else {
        setError(response.message || 'Error al aprobar la reserva');
      }
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      setError('Error al aprobar la reserva');
    }
  };

  const handleRechazar = async (id, reason = 'Rechazada por el administrador') => {
    try {
      setError(null);
      const response = await reservationsService.rejectReservation(id, reason);
      if (response.success) {
        console.log('✅ Reserva rechazada, refrescando contexto...');
        // Solo refrescar el contexto global - no manejar estado local
        await refreshReservas();
      } else {
        setError(response.message || 'Error al rechazar la reserva');
      }
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
      setError('Error al rechazar la reserva');
    }
  };

  const handleCreateReserva = () => {
    navigate('/admin/reserva');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredReservas = reservas.filter(reserva => {
    if (filter === 'all') return true;
    // Mapear los filtros del frontend a los valores del backend
    const statusMap = {
      'pendiente': 'PENDING',
      'aprobada': 'APPROVED', 
      'rechazada': 'REJECTED'
    };
    return reserva.status === statusMap[filter];
  });

  return (
    <VerReservasContainer
      // Data
      reservas={reservas}
      filteredReservas={filteredReservas}
      loading={loading}
      error={error}
      filter={filter}
      
      // Handlers
      onFilterChange={setFilter}
      onAprobar={handleAprobar}
      onRechazar={handleRechazar}
      onCreateReserva={handleCreateReserva}
      onBack={handleBack}
      
      // Helper functions
      getStatusColor={getStatusColor}
      getStatusIcon={getStatusIcon}
    />
  );
};

export default VerReservasPage;