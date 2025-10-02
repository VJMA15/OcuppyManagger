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
import { enrichReservasWithDetails, normalizeStatus } from '../utils/reservasUtils';
import VerReservasContainer from "@/containers/VerReservasContainer";

const VerReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { reservas, loading, refreshReservas, error: contextError } = useReservasContext();
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleEliminar = async (id) => {
    try {
      setError(null);
      const response = await reservationsService.deleteReservation(id);
      // La API devuelve success true si se elimina correctamente
      if (response?.success !== false) {
        console.log('🗑️ Reserva rechazada eliminada, refrescando contexto...');
        await refreshReservas();
      } else {
        setError(response.message || 'No se pudo eliminar la reserva');
      }
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
      setError('Error al eliminar la reserva');
    }
  };

  const handleEliminarRechazadas = async () => {
    try {
      setError(null);
      const response = await reservationsService.deleteRejectedReservations();
      if (response?.success !== false) {
        console.log('🧹 Eliminación masiva de rechazadas realizada, refrescando contexto...');
        await refreshReservas();
      } else {
        setError(response.message || 'No se pudieron eliminar las reservas rechazadas');
      }
    } catch (err) {
      console.error('Error al eliminar rechazadas:', err);
      setError('Error al eliminar las reservas rechazadas');
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
      'rechazada': 'REJECTED',
      'cancelada': 'CANCELLED'
    };
    const normalized = normalizeStatus(reserva.status || reserva.estado);
    return normalized === statusMap[filter];
  });

  // Selección de reservas (solo REJECTED)
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredReservas.map(r => String(r._id || r.id));
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectedIds(
      allSelected
        ? selectedIds.filter(id => !visibleIds.includes(id))
        : Array.from(new Set([...selectedIds, ...visibleIds]))
    );
  };

  const handleEliminarSeleccionadas = async () => {
    try {
      setError(null);
      // Limitar a estados eliminables: REJECTED y APPROVED (case-insensitive) sobre toda la lista
      const selectedSet = new Set(selectedIds.map(String));
      let deletableSelectedIds = reservas
        .filter(r => selectedSet.has(String(r._id || r.id)))
        .filter(r => ['REJECTED','APPROVED'].includes(normalizeStatus(r.status || r.estado)))
        .map(r => String(r._id || r.id));

      if (deletableSelectedIds.length === 0) {
        // Fallback defensivo: intentar con las visibles por si hay desajuste de datos
        deletableSelectedIds = filteredReservas
          .filter(r => selectedSet.has(String(r._id || r.id)))
          .filter(r => ['REJECTED','APPROVED'].includes(normalizeStatus(r.status || r.estado)))
          .map(r => String(r._id || r.id));

        if (deletableSelectedIds.length === 0) {
          setError('Selecciona reservas aprobadas o rechazadas para eliminar');
          return;
        }
      }

      const response = await reservationsService.deleteReservationsBulk(deletableSelectedIds);
      if (response?.successCount > 0) {
        // Quitar de la selección las que sí se eliminaron
        const removed = new Set((response.deletedIds || []).map(String));
        setSelectedIds(prev => prev.filter(id => !removed.has(id)));
        await refreshReservas();
      }

      if (response?.failureCount > 0) {
        setError(response?.message || `Algunas reservas no pudieron eliminarse (${response.failureCount})`);
      }
    } catch (err) {
      console.error('Error al eliminar seleccionadas:', err);
      setError('Error al eliminar las reservas seleccionadas');
    }
  };

  return (
    <VerReservasContainer
      // Data
      reservas={reservas}
      filteredReservas={filteredReservas}
      loading={loading}
      error={error}
      filter={filter}
      selectedIds={selectedIds}
      
      // Handlers
      onFilterChange={setFilter}
      onAprobar={handleAprobar}
      onRechazar={handleRechazar}
      onEliminar={handleEliminar}
      onDeleteRejected={handleEliminarRechazadas}
      onToggleSelect={toggleSelect}
      onToggleSelectAll={toggleSelectAllVisible}
      onDeleteSelected={handleEliminarSeleccionadas}
      onCreateReserva={handleCreateReserva}
      onBack={handleBack}
      
      // Helper functions
      getStatusColor={getStatusColor}
      getStatusIcon={getStatusIcon}
    />
  );
};

export default VerReservasPage;