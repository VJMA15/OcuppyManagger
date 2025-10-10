import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth-context';
import reservationsService from '../services/reservationsService';
import ambientesService from '../services/ambientesService';
import { Button } from '../components/ui';

const CrearReservaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [ambientes, setAmbientes] = useState([]);
  const [loadingAmbientes, setLoadingAmbientes] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    environmentId: '',
    startDate: '',
    endDate: '',
    purpose: '',
    observaciones: '',
    numeroEstudiantes: ''
  });

  const [errors, setErrors] = useState({});
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [checkingDisponibilidad, setCheckingDisponibilidad] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    fetchAmbientes();
  }, []);

  const fetchAmbientes = async () => {
    try {
      setLoadingAmbientes(true);
      const response = await ambientesService.getAmbientes();
      if (response.success) {
        setAmbientes(response.data || []);
      } else {
        setError(response.error || 'Error al cargar los ambientes disponibles');
      }
    } catch (err) {
      console.error('Error fetching ambientes:', err);
      setError('Error al cargar los ambientes disponibles');
    } finally {
      setLoadingAmbientes(false);
    }
  };

  const checkDisponibilidad = async () => {
    if (!formData.environmentId || !formData.startDate || !formData.endDate) {
      return;
    }

    try {
      setCheckingDisponibilidad(true);
      const response = await reservationsService.checkAvailability(
        formData.environmentId,
        formData.startDate,
        formData.endDate
      );
      setDisponibilidad({ disponible: response.success, mensaje: response.message });
    } catch (err) {
      console.error('Error checking disponibilidad:', err);
      setDisponibilidad({ disponible: false, mensaje: 'Error al verificar disponibilidad' });
    } finally {
      setCheckingDisponibilidad(false);
    }
  };

  // Div emergente de conflicto por reserva pendiente
  const PendingConflictModal = () => (
    showPendingModal ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 border border-slate-200 dark:border-slate-700 w-full">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center border border-yellow-200 dark:border-yellow-700">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                No puedes crear otra reserva
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ya tienes una reserva pendiente. No puedes crear otra reserva hasta que la existente sea rechazada, aceptada o cancelada.
              </p>
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowPendingModal(false)}>
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );

  useEffect(() => {
    if (formData.environmentId && formData.startDate && formData.endDate) {
      const timeoutId = setTimeout(() => {
        checkDisponibilidad();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setDisponibilidad(null);
    }
  }, [formData.environmentId, formData.startDate, formData.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.environmentId) {
      newErrors.environmentId = 'Selecciona un ambiente';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Selecciona fecha y hora de inicio';
    } else {
      const selectedDate = new Date(formData.startDate);
      const now = new Date();
      
      if (selectedDate < now) {
        newErrors.startDate = 'La fecha y hora no puede ser anterior a ahora';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Selecciona fecha y hora de fin';
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Describe el propósito de la reserva';
    }

    if (formData.numeroEstudiantes && (isNaN(formData.numeroEstudiantes) || parseInt(formData.numeroEstudiantes) < 1)) {
      newErrors.numeroEstudiantes = 'Ingresa un número válido de estudiantes';
    }

    if (disponibilidad && !disponibilidad.disponible) {
      newErrors.disponibilidad = disponibilidad.mensaje || 'El ambiente no está disponible en el horario seleccionado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const reservationData = {
        userId: user?.id,
        userCC: user?.cc,
        environmentId: formData.environmentId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        purpose: formData.purpose,
        observaciones: formData.observaciones,
        numeroEstudiantes: formData.numeroEstudiantes ? parseInt(formData.numeroEstudiantes) : undefined
      };

      const response = await reservationsService.createReservation(reservationData);
      
      if (response.success) {
        setSuccess('Reserva creada exitosamente. Será revisada por el administrador.');
        
        // Reset form
        setFormData({
          environmentId: '',
          startDate: '',
          endDate: '',
          purpose: '',
          observaciones: '',
          numeroEstudiantes: ''
        });
        setDisponibilidad(null);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/dashboard/mis-reservas');
        }, 2000);
      } else {
        const msg = String(response.message || '').toLowerCase();
        const isPendingConflict =
          msg.includes('reserva pendiente') ||
          msg.includes('ya tienes una reserva') ||
          msg.includes('pendiente') ||
          (msg.includes('otra reserva') && msg.includes('proceso')) ||
          msg.includes('409') ||
          msg.includes('conflict');
        if (isPendingConflict) {
          setError('');
          setShowPendingModal(true);
        } else {
          setError(response.message || 'Error al crear la reserva');
        }
      }
      
    } catch (err) {
      console.error('Error creating reserva:', err);
      const msg = String(err?.message || '').toLowerCase();
      const isPendingConflict =
        msg.includes('reserva pendiente') ||
        msg.includes('ya tienes una reserva') ||
        msg.includes('pendiente') ||
        (msg.includes('otra reserva') && msg.includes('proceso')) ||
        msg.includes('409') ||
        msg.includes('conflict');
      if (isPendingConflict) {
        setError('');
        setShowPendingModal(true);
      } else {
        setError(err.message || 'Error al crear la reserva');
      }
    } finally {
      setLoading(false);
    }
  };



  if (loadingAmbientes) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/mis-reservas')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Reserva</h1>
              <p className="text-gray-600 dark:text-gray-400">Crea una nueva reserva de ambiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && !showPendingModal && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Ambiente Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ambiente *
              </label>
              <select
                name="ambiente"
                value={formData.ambiente}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.ambiente ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecciona un ambiente</option>
                {ambientes.map((ambiente) => (
                  <option key={ambiente._id} value={ambiente.nombre}>
                    {ambiente.nombre} - {ambiente.tipo} (Capacidad: {ambiente.capacidad})
                  </option>
                ))}
              </select>
              {errors.ambiente && (
                <p className="mt-1 text-sm text-red-600">{errors.ambiente}</p>
              )}
            </div>

            {/* Date and Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.fecha ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.fecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Jornada *
                </label>
                <select
                  name="jornada"
                  value={formData.jornada}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.jornada ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Seleccionar jornada</option>
                  <option value="mañana">Mañana (6:00 - 12:00)</option>
                  <option value="tarde">Tarde (12:00 - 18:00)</option>
                  <option value="noche">Noche (18:00 - 22:00)</option>
                </select>
                {errors.jornada && (
                  <p className="mt-1 text-sm text-red-600">{errors.jornada}</p>
                )}
              </div>
            </div>

            {/* Availability Check */}
            {(formData.ambiente && formData.fecha && formData.horaInicio && formData.horaFin) && (
              <div className="p-4 rounded-lg border">
                {checkingDisponibilidad ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Verificando disponibilidad...</span>
                  </div>
                ) : disponibilidad ? (
                  <div className={`flex items-center gap-2 ${
                    disponibilidad.disponible ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {disponibilidad.disponible ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{disponibilidad.mensaje || (disponibilidad.disponible ? 'Ambiente disponible' : 'Ambiente no disponible')}</span>
                  </div>
                ) : null}
              </div>
            )}

            {errors.disponibilidad && (
              <p className="text-sm text-red-600">{errors.disponibilidad}</p>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Propósito de la Reserva *
              </label>
              <textarea
                name="proposito"
                value={formData.proposito}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe el propósito de la reserva (ej: Clase de matemáticas, Reunión de padres, etc.)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                  errors.proposito ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.proposito && (
                <p className="mt-1 text-sm text-red-600">{errors.proposito}</p>
              )}
            </div>

            {/* Number of Students */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Estudiantes (opcional)
              </label>
              <input
                type="number"
                name="numeroEstudiantes"
                value={formData.numeroEstudiantes}
                onChange={handleInputChange}
                min="1"
                placeholder="Ej: 25"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.numeroEstudiantes ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.numeroEstudiantes && (
                <p className="mt-1 text-sm text-red-600">{errors.numeroEstudiantes}</p>
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={3}
                placeholder="Información adicional o requerimientos especiales"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/mis-reservas')}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || checkingDisponibilidad || (disponibilidad && !disponibilidad.disponible)}
                className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creando...' : 'Crear Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal: Conflicto por reserva pendiente */}
      <PendingConflictModal />
    </div>
  );
};

export default CrearReservaPage;