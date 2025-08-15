import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock as ClockIcon 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import VerReservasContainer from "@/containers/VerReservasContainer";

const VerReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getReservas();
        setReservas(response.data || []);
      } catch (err) {
        console.error('Error fetching reservas:', err);
        setError('Error al cargar las reservas');
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4" />;
      case 'pendiente':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAprobar = async (id) => {
    try {
      await apiService.updateReserva(id, { estado: 'aprobada' });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? { ...reserva, estado: 'aprobada' } : reserva
        )
      );
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      setError('Error al aprobar la reserva');
    }
  };

  const handleRechazar = async (id) => {
    try {
      await apiService.updateReserva(id, { estado: 'rechazada' });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? { ...reserva, estado: 'rechazada' } : reserva
        )
      );
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
    return reserva.estado === filter;
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