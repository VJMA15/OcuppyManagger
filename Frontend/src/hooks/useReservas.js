import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getReservas();
      setReservas(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reservas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyReservas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getMyReservas();
      setReservas(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my reservas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createReserva = async (reservaData) => {
    try {
      const response = await apiService.createReserva(reservaData);
      setReservas(prev => [...prev, response.data]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateReserva = async (id, reservaData) => {
    try {
      const response = await apiService.updateReserva(id, reservaData);
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? response.data : reserva
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteReserva = async (id) => {
    try {
      await apiService.deleteReserva(id);
      setReservas(prev => prev.filter(reserva => reserva._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const approveReserva = async (id) => {
    try {
      const response = await apiService.updateReserva(id, { estado: 'aprobada' });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? response.data : reserva
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const rejectReserva = async (id, motivoRechazo) => {
    try {
      const response = await apiService.updateReserva(id, { 
        estado: 'rechazada',
        motivoRechazo 
      });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? response.data : reserva
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    isLoading,
    error,
    fetchReservas,
    fetchMyReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    approveReserva,
    rejectReserva
  };
};

export default useReservas; 