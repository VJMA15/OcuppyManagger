import React, { useState } from 'react';
import { useReservations } from '../hooks/useReservations';
import { ReservationList } from '../components/ReservationList';
import { ReservationFilters } from '../components/ReservationFilters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export const ViewReservationsPage = () => {
  const [filters, setFilters] = useState({});
  const { reservations, loading, error, actions } = useReservations(filters);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="text-gray-600">Gestiona tus reservas de ambientes</p>
      </div>
      
      <div className="mb-6">
        <ReservationFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      
      <ReservationList 
        reservations={reservations}
        onUpdate={actions.updateReservation}
        onDelete={actions.deleteReservation}
      />
    </div>
  );
};