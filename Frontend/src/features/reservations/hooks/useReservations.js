import { useState, useEffect, useCallback, useMemo } from 'react';
import { reservationApi } from '../services/reservationApi';

export const useReservations = (filters = {}) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoizar los filtros para evitar recreación innecesaria
  const memoizedFilters = useMemo(() => filters, [
    filters.status,
    filters.userId,
    filters.environmentId,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reservationApi.getReservations(memoizedFilters);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createReservation = useCallback(async (reservationData) => {
    try {
      const newReservation = await reservationApi.createReservation(reservationData);
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateReservation = useCallback(async (id, updates) => {
    try {
      const updatedReservation = await reservationApi.updateReservation(id, updates);
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id ? updatedReservation : reservation
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteReservation = useCallback(async (id) => {
    try {
      await reservationApi.deleteReservation(id);
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const approveReservation = useCallback(async (id) => {
    try {
      const approvedReservation = await reservationApi.approveReservation(id);
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id ? approvedReservation : reservation
        )
      );
      return approvedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const rejectReservation = useCallback(async (id, reason) => {
    try {
      const rejectedReservation = await reservationApi.rejectReservation(id, reason);
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id ? rejectedReservation : reservation
        )
      );
      return rejectedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    loading,
    error,
    actions: {
      createReservation,
      updateReservation,
      deleteReservation,
      approveReservation,
      rejectReservation,
      refetch: fetchReservations
    }
  };
};