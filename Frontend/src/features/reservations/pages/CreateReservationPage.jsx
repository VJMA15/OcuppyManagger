import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../hooks/useReservations';
import { ReservationForm } from '../components/ReservationForm';
import { toast } from 'react-hot-toast';

export const CreateReservationPage = () => {
  const navigate = useNavigate();
  const { actions } = useReservations();

  const handleSubmit = async (formData) => {
    try {
      await actions.createReservation(formData);
      toast.success('Reserva creada exitosamente');
      navigate('/reservations');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Reserva</h1>
        <p className="text-gray-600">Crea una nueva reserva de ambiente</p>
      </div>
      
      <ReservationForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/reservations')}
      />
    </div>
  );
};