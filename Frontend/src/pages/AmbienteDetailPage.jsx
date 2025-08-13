import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';

const AmbienteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ambientes, loading } = useAmbientes();
  const [ambiente, setAmbiente] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showReservaForm, setShowReservaForm] = useState(false);

  useEffect(() => {
    if (ambientes && id) {
      const foundAmbiente = ambientes.find(amb => amb.id === id);
      setAmbiente(foundAmbiente);
    }
  }, [ambientes, id]);

  const handleReserva = () => {
    // Aquí iría la lógica para crear una reserva
    console.log('Crear reserva:', {
      ambienteId: id,
      fecha: selectedDate,
      hora: selectedTime
    });
    setShowReservaForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ambiente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Ambiente no encontrado</h2>
          <button
            onClick={() => navigate('/ambientes')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver a Ambientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/ambientes')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-slate-800">{ambiente.nombre}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del Ambiente */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Información del Ambiente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-slate-600">Capacidad</p>
                    <p className="font-semibold text-slate-800">{ambiente.capacidad} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-slate-600">Ubicación</p>
                    <p className="font-semibold text-slate-800">{ambiente.ubicacion || 'No especificada'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${
                    ambiente.estado === 'disponible' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <p className="font-semibold text-slate-800 capitalize">{ambiente.estado}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded" />
                  <div>
                    <p className="text-sm text-slate-600">Tipo</p>
                    <p className="font-semibold text-slate-800">{ambiente.tipo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {ambiente.descripcion && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Descripción</h2>
                <p className="text-slate-600 leading-relaxed">{ambiente.descripcion}</p>
              </div>
            )}

            {/* Servicios */}
            {ambiente.servicios && ambiente.servicios.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Servicios Disponibles</h2>
                <div className="flex flex-wrap gap-2">
                  {ambiente.servicios.map((servicio, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Equipos */}
            {ambiente.equipos && ambiente.equipos.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Equipos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ambiente.equipos.map((equipo, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-700">{equipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel de Reserva */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg sticky top-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Reservar Ambiente</h2>
              
              {ambiente.estado === 'disponible' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hora de inicio
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar hora</option>
                      <option value="06:00">06:00 AM</option>
                      <option value="07:00">07:00 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleReserva}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Solicitar Reserva
                  </button>
                  
                  <p className="text-xs text-slate-500 text-center">
                    La reserva estará sujeta a aprobación
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Ambiente no disponible</p>
                  <p className="text-sm text-slate-500">Este ambiente no está disponible para reservas</p>
                </div>
              )}
            </div>

            {/* Información del Responsable */}
            {ambiente.responsable && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Responsable</h3>
                <p className="text-slate-600">{ambiente.responsable}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbienteDetailPage;