import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock as ClockIcon 
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from '../contexts/auth-context';
import { useReservasContext } from '@/contexts/ReservasContext';
import reservationsService from '../services/reservationsService';
import { enrichReservasWithDetails, normalizeStatus } from '../utils/reservasUtils';
import VerReservasContainer from "@/containers/VerReservasContainer";
import useHotkeys from "@/hooks/useHotkeys";

const VerReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { reservas, loading, refreshReservas, updateReservaLocal, removeReservaLocal, error: contextError } = useReservasContext();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingIds, setPendingIds] = useState([]);
  const [didRefresh, setDidRefresh] = useState(false);

  // Usar el error del contexto si existe
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Inicializar filtro desde la URL si existe (?filter=pendiente|aprobada|rechazada|all)
  useEffect(() => {
    const initialFilter = (searchParams.get('filter') || '').toLowerCase();
    if (['pendiente','aprobada','rechazada','all'].includes(initialFilter)) {
      setFilter(initialFilter);
    }
  }, [searchParams]);

  // Forzar recarga si venimos con ?refresh=1 (p. ej., tras crear una reserva)
  useEffect(() => {
    const shouldRefresh = (searchParams.get('refresh') || '') === '1';
    if (shouldRefresh && !didRefresh) {
      // fuerza recarga suave para evitar parpadeo
      refreshReservas({ force: true, soft: true });
      setDidRefresh(true);
    }
  }, [searchParams, didRefresh, refreshReservas]);

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

  const markPending = (id) => setPendingIds(prev => Array.from(new Set([...prev, String(id)])));
  const unmarkPending = (id) => setPendingIds(prev => prev.filter(x => String(x) !== String(id)));

  const handleAprobar = async (id) => {
    try {
      setError(null);
      markPending(id);
      const response = await reservationsService.approveReservation(id, user?.id);
      if (response.success) {
        console.log('✅ Reserva aprobada exitosamente');
        // Actualización optimista inmediata
        updateReservaLocal(id, { status: 'APPROVED', approvedBy: user?.id });
        // Refetch con retraso para sincronizar sin parpadeos
        setTimeout(() => { refreshReservas({ force: true }); }, 1200);
      } else {
        setError(response.message || 'Error al aprobar la reserva');
      }
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      setError('Error al aprobar la reserva');
    }
    finally {
      unmarkPending(id);
    }
  };

  const handleRechazar = async (id, reason = 'Rechazada por el administrador') => {
    try {
      setError(null);
      markPending(id);
      const response = await reservationsService.rejectReservation(id, reason);
      if (response.success) {
        console.log('✅ Reserva rechazada exitosamente');
        // Actualización optimista inmediata
        updateReservaLocal(id, { status: 'REJECTED', rejectionReason: reason });
        // Refetch con retraso para sincronizar sin parpadeos
        setTimeout(() => { refreshReservas({ force: true }); }, 1200);
      } else {
        setError(response.message || 'Error al rechazar la reserva');
      }
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
      setError('Error al rechazar la reserva');
    }
    finally {
      unmarkPending(id);
    }
  };

  const handleEliminar = async (id) => {
    try {
      setError(null);
      markPending(id);
      const response = await reservationsService.deleteReservation(id);
      // La API devuelve success true si se elimina correctamente
      if (response?.success !== false) {
        console.log('🗑️ Reserva rechazada eliminada exitosamente');
        // Eliminación optimista inmediata en la UI
        removeReservaLocal(id);
        // Refetch con retraso para sincronizar sin parpadeos
        setTimeout(() => { refreshReservas({ force: true }); }, 1200);
      } else {
        setError(response.message || 'No se pudo eliminar la reserva');
      }
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
      setError('Error al eliminar la reserva');
    }
    finally {
      unmarkPending(id);
    }
  };

  
  const handleCreateReserva = () => {
    navigate('/dashboard/reserva');
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

  // Eliminación de rechazadas no necesaria; botón removido

  // Hotkeys: Ctrl+D (eliminar seleccionadas), N (nueva), Esc (volver), / (enfocar filtro)
  useHotkeys([
    {
      combo: 'ctrl+d',
      handler: () => {
        if (selectedIds.length > 0) {
          handleEliminarSeleccionadas();
        }
      }
    },
    {
      combo: 'n',
      handler: () => handleCreateReserva()
    },
    {
      combo: 'esc',
      handler: () => handleBack(),
      allowWhenTyping: true // permitir cerrar aunque esté enfocado el filtro
    },
    {
      combo: '/',
      handler: () => {
        const el = document.getElementById('filter-select');
        if (el) el.focus();
      }
    }
  ]);

  const handleEliminarSeleccionadas = async () => {
    try {
      setError(null);
      // Limitar a estados eliminables: REJECTED, APPROVED y CANCELLED (case-insensitive)
      const selectedSet = new Set(selectedIds.map(String));
      let deletableSelectedIds = reservas
        .filter(r => selectedSet.has(String(r._id || r.id)))
        .filter(r => ['REJECTED','APPROVED','CANCELLED'].includes(normalizeStatus(r.status || r.estado)))
        .map(r => String(r._id || r.id));

      if (deletableSelectedIds.length === 0) {
        // Fallback defensivo: intentar con las visibles por si hay desajuste de datos
        deletableSelectedIds = filteredReservas
          .filter(r => selectedSet.has(String(r._id || r.id)))
          .filter(r => ['REJECTED','APPROVED','CANCELLED'].includes(normalizeStatus(r.status || r.estado)))
          .map(r => String(r._id || r.id));

        if (deletableSelectedIds.length === 0) {
          setError('Selecciona reservas aprobadas, rechazadas o canceladas para eliminar');
          return;
        }
      }

      // Marcar como pendientes y eliminar localmente de inmediato
      deletableSelectedIds.forEach(id => markPending(id));
      deletableSelectedIds.forEach(id => removeReservaLocal(id));

      const response = await reservationsService.deleteReservationsBulk(deletableSelectedIds);
      if (response?.successCount > 0) {
        // Quitar de la selección las que sí se eliminaron
        const removed = new Set((response.deletedIds || []).map(String));
        setSelectedIds(prev => prev.filter(id => !removed.has(id)));
        // Desmarcar pendientes de las eliminadas
        (response.deletedIds || []).forEach(id => unmarkPending(id));
        console.log('🗑️ Reservas eliminadas exitosamente');
        // Refetch con retraso para sincronizar sin parpadeos
        setTimeout(() => { refreshReservas({ force: true }); }, 1200);
      }

      if (response?.failureCount > 0) {
        // Desmarcar pendientes de las que fallaron
        (response.failedIds || []).forEach(id => unmarkPending(id));
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
      pendingIds={pendingIds}
      
      // Handlers
      onFilterChange={setFilter}
      onAprobar={handleAprobar}
      onRechazar={handleRechazar}
      onEliminar={handleEliminar}
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