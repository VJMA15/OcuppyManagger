import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Building2, Calendar, Clock, BookOpen, X, User, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { useTheme } from '../hooks/use-theme';
import Modal from '../components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import reservationsService from '../services/reservationsService';

// Estilos personalizados para los botones de estado (modo claro y oscuro)
const statusStyles = {
  disponible: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  ocupado: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  mantenimiento: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  inactivo: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
};

// Estilos para los tipos de ambiente (modo claro y oscuro)
const typeStyles = {
  aula: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  laboratorio: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  taller: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  auditorio: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800',
  otro: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
};

// Componente para cada tarjeta de ambiente
const AmbienteCard = React.memo(({ ambiente, onAmbienteClick, onReservaSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [localReservaForm, setLocalReservaForm] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    jornada: '',
    numeroPersonas: '',
    proposito: '',
    motivo: '',
    equipoRequerido: '',
    observaciones: '',
    aceptaTerminos: false
  });

  const navigate = useNavigate();
  const handleToggleExpanded = (e) => {
    e.stopPropagation();
    navigate('/instructor/nueva-reserva', { state: { ambienteId: ambiente._id } });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones de información personal
    if (!localReservaForm.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!localReservaForm.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    }

    if (!localReservaForm.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!localReservaForm.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(localReservaForm.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validaciones de fecha y hora
    if (!localReservaForm.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!localReservaForm.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida';
    }

    if (!localReservaForm.horaFin) {
      newErrors.horaFin = 'La hora de fin es requerida';
    }

    if (localReservaForm.horaInicio && localReservaForm.horaFin) {
      if (localReservaForm.horaInicio >= localReservaForm.horaFin) {
        newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    if (!localReservaForm.jornada) {
      newErrors.jornada = 'La jornada es requerida';
    }

    if (!localReservaForm.numeroPersonas) {
      newErrors.numeroPersonas = 'El número de personas es requerido';
    } else if (parseInt(localReservaForm.numeroPersonas) > ambiente.capacidad) {
      newErrors.numeroPersonas = `No puede exceder la capacidad máxima de ${ambiente.capacidad} personas`;
    }

    // Validaciones de información adicional
    if (!localReservaForm.proposito.trim()) {
      newErrors.proposito = 'El propósito es requerido';
    }

    if (!localReservaForm.motivo.trim()) {
      newErrors.motivo = 'El motivo detallado es requerido';
    }

    if (!localReservaForm.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocalReservaSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reservaData = {
        ambiente: ambiente._id,
        ...localReservaForm
      };
      
      await onReservaSubmit(reservaData);
      
      // Reset form and close
      setLocalReservaForm({
        nombre: '',
        documento: '',
        telefono: '',
        email: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        jornada: '',
        numeroPersonas: '',
        proposito: '',
        motivo: '',
        equipoRequerido: '',
        observaciones: '',
        aceptaTerminos: false
      });
      setIsExpanded(false);
      setErrors({});
    } catch (error) {
      console.error('Error al crear reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLocalReservaForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  return (
    <div
      key={ambiente._id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600"
      onClick={() => onAmbienteClick(ambiente)}
    >
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{ambiente.nombre}</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-gray-500" />
              {ambiente.ubicacion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
              statusStyles[ambiente.estado] || statusStyles.inactivo
            }`}>
              {ambiente.estado.charAt(0).toUpperCase() + ambiente.estado.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              typeStyles[(ambiente.tipo && ambiente.tipo.toLowerCase()) || 'otro'] || typeStyles.otro
            }`}>
              {ambiente.tipo}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg mr-3">
                <Users className="h-4 w-4 text-slate-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-400">Capacidad</p>
                <p className="font-medium text-slate-800 dark:text-gray-200">{ambiente.capacidad} personas</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg mr-3">
                <BookOpen className="h-4 w-4 text-slate-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-400">Tipo</p>
                <p className="font-medium text-slate-800 dark:text-gray-200">{ambiente.tipo}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleToggleExpanded}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
              isExpanded
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                : 'bg-green-700 text-white hover:bg-green-800 shadow-sm hover:shadow-md'
            }`}
          >
            {isExpanded ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Reservar
              </>
            )}
          </button>
        </div>
        
        {/* Formulario inline de reserva mejorado - Estilo Administrador */}
        {isExpanded && (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 fixed inset-0 z-50">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Nueva Reserva
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Reserva un ambiente para tu actividad
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-sena-soft-500 to-sena-soft-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Información de la Reserva</CardTitle>
                      <CardDescription className="text-white/80">
                        Completa todos los campos para crear la reserva
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  {/* Mensajes de estado */}
                  {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-300 text-sm">Por favor, corrige los errores en el formulario</p>
                    </div>
                  )}

                  <form onSubmit={handleLocalReservaSubmit} className="space-y-6">
                    {/* Selección de Ambiente */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Selecciona un Ambiente
                      </h3>
                      
                      {/* Grid de ambientes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {ambiente.nombre}
                              </h4>
                            </div>
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>Capacidad: {ambiente.capacidad}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{ambiente.ubicacion}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[(ambiente.tipo && ambiente.tipo.toLowerCase()) || 'otro'] || typeStyles.otro}`}>
                              {ambiente.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información Personal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200 ${
                              errors.nombre ? 'border-red-300 dark:border-red-600' : ''
                            }`}
                            value={localReservaForm.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            placeholder="Ingrese su nombre completo"
                            required
                          />
                        </div>
                        {errors.nombre && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.nombre}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Número de Documento
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200 ${
                              errors.documento ? 'border-red-300 dark:border-red-600' : ''
                            }`}
                            value={localReservaForm.documento}
                            onChange={(e) => handleInputChange('documento', e.target.value)}
                            placeholder="Número de documento"
                            required
                          />
                        </div>
                        {errors.documento && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.documento}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Teléfono y Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Teléfono
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200 ${
                              errors.telefono ? 'border-red-300 dark:border-red-600' : ''
                            }`}
                            value={localReservaForm.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            placeholder="Número de teléfono"
                            required
                          />
                        </div>
                        {errors.telefono && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.telefono}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200 ${
                              errors.email ? 'border-red-300 dark:border-red-600' : ''
                            }`}
                            value={localReservaForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Correo electrónico"
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fecha y Jornada */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Fecha y Horario
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Fecha de Reserva
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-400" />
                              </div>
                              <input
                                type="date"
                                className={`w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200 ${
                                  errors.fecha ? 'border-red-300 dark:border-red-600' : ''
                                }`}
                                value={localReservaForm.fecha}
                                onChange={(e) => handleInputChange('fecha', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                 required
                               />
                               {errors.fecha && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.fecha}
                                 </p>
                               )}
                             </div>
                           </div>

                           <div className="space-y-2">
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <Clock className="w-4 h-4 inline mr-2" />
                                 Jornada
                               </label>
                               <select
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                                   errors.jornada ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.jornada}
                                 onChange={(e) => handleInputChange('jornada', e.target.value)}
                                 required
                               >
                                 <option value="">Seleccionar jornada</option>
                                 <option value="mañana">Mañana (6:00 - 12:00)</option>
                                 <option value="tarde">Tarde (12:00 - 18:00)</option>
                                 <option value="noche">Noche (18:00 - 22:00)</option>
                               </select>
                               {errors.jornada && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.jornada}
                                 </p>
                               )}
                             </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <Clock className="w-4 h-4 inline mr-2" />
                                 Hora de Inicio
                               </label>
                               <input
                                 type="time"
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                                   errors.horaInicio ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.horaInicio}
                                 onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                                 required
                               />
                               {errors.horaInicio && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.horaInicio}
                                 </p>
                               )}
                             </div>

                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <Clock className="w-4 h-4 inline mr-2" />
                                 Hora de Fin
                               </label>
                               <input
                                 type="time"
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                                   errors.horaFin ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.horaFin}
                                 onChange={(e) => handleInputChange('horaFin', e.target.value)}
                                 required
                               />
                               {errors.horaFin && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.horaFin}
                                 </p>
                               )}
                             </div>

                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <Users className="w-4 h-4 inline mr-2" />
                                 Número de Personas
                               </label>
                               <input
                                 type="number"
                                 min="1"
                                 max={ambiente.capacidad}
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                                   errors.numeroPersonas ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.numeroPersonas}
                                 onChange={(e) => handleInputChange('numeroPersonas', e.target.value)}
                                 placeholder={`Máximo ${ambiente.capacidad} personas`}
                                 required
                               />
                               {errors.numeroPersonas && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.numeroPersonas}
                                 </p>
                               )}
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Información Adicional */}
                       <div className="space-y-6">
                         <div>
                           <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                             <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                             Información Adicional
                           </h3>
                           
                           <div className="space-y-6">
                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <BookOpen className="w-4 h-4 inline mr-2" />
                                 Propósito de la Reserva
                               </label>
                               <input
                                 type="text"
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                                   errors.proposito ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.proposito}
                                 onChange={(e) => handleInputChange('proposito', e.target.value)}
                                 placeholder="Ej: Clase de programación, Reunión de trabajo, Taller de capacitación"
                                 required
                               />
                               {errors.proposito && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.proposito}
                                 </p>
                               )}
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <FileText className="w-4 h-4 inline mr-2" />
                                 Motivo Detallado
                               </label>
                               <textarea
                                 rows={4}
                                 className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 resize-none ${
                                   errors.motivo ? 'border-red-300 dark:border-red-600' : ''
                                 }`}
                                 value={localReservaForm.motivo}
                                 onChange={(e) => handleInputChange('motivo', e.target.value)}
                                 placeholder="Describa detalladamente el motivo de la reserva, actividades a realizar, número de participantes esperados, etc."
                                 required
                               />
                               {errors.motivo && (
                                 <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                   <AlertCircle className="h-4 w-4 mr-1" />
                                   {errors.motivo}
                                 </p>
                               )}
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <Building2 className="w-4 h-4 inline mr-2" />
                                 Equipo Requerido
                               </label>
                               <input
                                 type="text"
                                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200"
                                 value={localReservaForm.equipoRequerido}
                                 onChange={(e) => handleInputChange('equipoRequerido', e.target.value)}
                                 placeholder="Ej: Proyector, computadores, sonido, pizarra digital, etc."
                               />
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                 <FileText className="w-4 h-4 inline mr-2" />
                                 Observaciones Adicionales
                               </label>
                               <textarea
                                 rows={3}
                                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 resize-none"
                                 value={localReservaForm.observaciones}
                                 onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                 placeholder="Cualquier información adicional relevante para la reserva..."
                               />
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Términos y Condiciones */}
                       <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                         <div className="flex items-start gap-3">
                           <input
                             id="aceptaTerminos"
                             type="checkbox"
                             className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                             checked={localReservaForm.aceptaTerminos}
                             onChange={(e) => handleInputChange('aceptaTerminos', e.target.checked)}
                           />
                           <div className="flex-1">
                             <label htmlFor="aceptaTerminos" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                               Acepto los términos y condiciones *
                             </label>
                             <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                               Al marcar esta casilla, acepto cumplir con las políticas de uso de los espacios del CTPGA y me comprometo a hacer un uso responsable del ambiente reservado.
                             </p>
                           </div>
                         </div>
                         {errors.aceptaTerminos && (
                           <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                             <AlertCircle className="h-4 w-4 mr-1" />
                             {errors.aceptaTerminos}
                           </p>
                         )}
                       </div>
                       
                       {/* Botones de Acción */}
                       <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                         <Button
                           type="button"
                           variant="outline"
                           onClick={() => navigate('/instructor')}
                           className="flex-1 px-6 py-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                         >
                           Cancelar
                         </Button>
                         <Button
                           type="submit"
                           disabled={isSubmitting}
                           className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                         >
                           {isSubmitting ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               Procesando...
                             </>
                           ) : (
                             <>
                               <Calendar className="w-4 h-4" />
                               Confirmar Reserva
                             </>
                           )}
                         </Button>
                       </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

                 {/* Panel Lateral */}
                 <div className="xl:col-span-1 space-y-6">
                   {/* Información de Jornadas */}
                   <div className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700 rounded-xl border p-6">
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                       Jornadas Disponibles
                     </h3>
                     <div className="space-y-3 text-sm">
                       <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="text-slate-600 dark:text-slate-400">Mañana</span>
                         <span className="font-medium text-slate-900 dark:text-white">6:00 AM - 12:00 PM</span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="text-slate-600 dark:text-slate-400">Tarde</span>
                         <span className="font-medium text-slate-900 dark:text-white">12:30 PM - 6:00 PM</span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="text-slate-600 dark:text-slate-400">Noche</span>
                         <span className="font-medium text-slate-900 dark:text-white">6:30 PM - 10:00 PM</span>
                       </div>
                     </div>
                   </div>

                   {/* Políticas */}
                   <div className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700 rounded-xl border p-6">
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                       Políticas de Reserva
                     </h3>
                     <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                       <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                         <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                         <span>Reservas con 24h de anticipación</span>
                       </div>
                       <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                         <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                         <span>Máximo 4 horas por reserva</span>
                       </div>
                       <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                         <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                         <span>Cancelar con 2h de anticipación</span>
                       </div>
                     </div>
                   </div>

                   {/* Resumen de Selección */}
                   <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 rounded-xl border p-6">
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                       Ambiente Seleccionado
                     </h3>
                     <div className="space-y-3">
                       <div className="text-center">
                         <div className="text-3xl mb-2">
                           🏢
                         </div>
                         <h4 className="font-medium text-slate-900 dark:text-white">
                           {ambiente.nombre}
                         </h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400">
                           {ambiente.tipo}
                         </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                           <Users className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                           <div className="font-medium">{ambiente.capacidad}</div>
                           <div className="text-xs text-slate-500">Capacidad</div>
                         </div>
                         <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                            <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                            <div className="font-medium text-xs">{ambiente.ubicacion}</div>
                            <div className="text-xs text-slate-500">Ubicación</div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const InstructorAmbientesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { ambientes, loading, error } = useAmbientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Estado mejorado para el formulario del modal
  const [reservaForm, setReservaForm] = useState({
    fecha: '',
    jornada: '',
    proposito: '',
    observaciones: ''
  });
  const [modalErrors, setModalErrors] = useState({});
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Función para manejar el envío de reservas del modal
  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAmbiente) return;
    
    const newErrors = {};
    
    // Validaciones
    if (!reservaForm.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!reservaForm.jornada) newErrors.jornada = 'La jornada es requerida';
    if (!reservaForm.proposito) newErrors.proposito = 'El propósito es requerido';
    
    if (Object.keys(newErrors).length > 0) {
      setModalErrors(newErrors);
      return;
    }
    
    setIsModalSubmitting(true);
    setModalErrors({});
    
    try {
      // Mapear jornada a horarios específicos (alineado con ReservaPage/InstructorReservaPage)
      const horarios = {
        'mañana': { inicio: '06:00', fin: '12:00' },
        'tarde': { inicio: '12:30', fin: '18:00' },
        'noche': { inicio: '18:30', fin: '22:00' }
      };
      
      const horario = horarios[reservaForm.jornada];
      
      const reservaData = {
        environmentId: selectedAmbiente._id,
        reservationDate: reservaForm.fecha,
        jornada: reservaForm.jornada,
        startDate: `${reservaForm.fecha}T${horario.inicio}:00`,
        endDate: `${reservaForm.fecha}T${horario.fin}:00`,
        purpose: reservaForm.proposito,
        equipment: [],
        userCC: user.cc
      };
      
      console.log('Enviando datos de reserva:', reservaData);
      
      const response = await reservationsService.createReservation(reservaData);
      
      if (response.success) {
        // Resetear formulario y cerrar modal
        setReservaForm({
          fecha: '',
          jornada: '',
          proposito: '',
          observaciones: ''
        });
        setShowReservaModal(false);
        setSelectedAmbiente(null);
        setShowSuccessModal(true);
      } else {
        setModalErrors({ general: response.message || 'Error al crear la reserva' });
      }
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('ya está reservada') || (msg.includes('jornada') && msg.includes('reservada'))) {
        setModalErrors({ general: 'La jornada seleccionada ya está reservada para esa fecha.' });
      } else {
        setModalErrors({ general: 'Error al crear la reserva. Intente nuevamente.' });
      }
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Función para manejar la reserva desde las tarjetas
  const handleReservarClick = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setShowReservaModal(true);
  };

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || ambiente.tipo.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = !filterStatus || ambiente.estado === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Renderizar modal de reserva
  const renderReservaModal = () => {
    if (!showReservaModal || !selectedAmbiente) return null;

    return (
      <Modal
        isOpen={showReservaModal}
        onClose={() => {
          setShowReservaModal(false);
          setSelectedAmbiente(null);
          setReservaForm({
            fecha: '',
            jornada: '',
            proposito: '',
            observaciones: ''
          });
          setModalErrors({});
        }}
        title={`Reservar ${selectedAmbiente.nombre}`}
      >
        <form onSubmit={handleReservaSubmit} className="space-y-4">
          {modalErrors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {modalErrors.general}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              className={`block w-full px-3 py-2 border rounded-md ${
                modalErrors.fecha ? 'border-red-300' : 'border-gray-300'
              }`}
              value={reservaForm.fecha}
              onChange={(e) => setReservaForm(prev => ({ ...prev, fecha: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
            {modalErrors.fecha && (
              <p className="mt-1 text-sm text-red-600">{modalErrors.fecha}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jornada *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md ${
                modalErrors.jornada ? 'border-red-300' : 'border-gray-300'
              }`}
              value={reservaForm.jornada}
              onChange={(e) => setReservaForm(prev => ({ ...prev, jornada: e.target.value }))}
            >
              <option value="">Seleccionar jornada</option>
              <option value="mañana">Mañana (6:00 - 12:00)</option>
              <option value="tarde">Tarde (12:00 - 18:00)</option>
              <option value="noche">Noche (18:00 - 22:00)</option>
            </select>
            {modalErrors.jornada && (
              <p className="mt-1 text-sm text-red-600">{modalErrors.jornada}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propósito *
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2 border rounded-md ${
                modalErrors.proposito ? 'border-red-300' : 'border-gray-300'
              }`}
              value={reservaForm.proposito}
              onChange={(e) => setReservaForm(prev => ({ ...prev, proposito: e.target.value }))}
              placeholder="Ej: Clase de programación"
            />
            {modalErrors.proposito && (
              <p className="mt-1 text-sm text-red-600">{modalErrors.proposito}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={reservaForm.observaciones}
              onChange={(e) => setReservaForm(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowReservaModal(false);
                setSelectedAmbiente(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isModalSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isModalSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando ambientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar ambientes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Gestión de Ambientes</h1>
                <p className="text-green-100 opacity-90 mt-1">Panel de control para instructores CTPGA</p>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                  </div>
                  <select
                    className="appearance-none bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Aula">Aula</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Taller">Taller</option>
                    <option value="Auditorio">Auditorio</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                  </div>
                  <select
                    className="appearance-none bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">En mantenimiento</option>
                  </select>
                </div>

                {(searchTerm || filterType || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      setFilterStatus('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ambientes */}
        {filteredAmbientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map((ambiente) => (
              <AmbienteCard
                key={ambiente._id}
                ambiente={ambiente}
                onAmbienteClick={(amb) => {
                  setSelectedAmbiente(amb);
                  setShowModal(true);
                }}
                onReservaSubmit={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center p-12">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-slate-50 dark:bg-gray-700 mb-4">
                <Search className="h-10 w-10 text-slate-300 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No se encontraron ambientes</h3>
              <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No hay ambientes que coincidan con los filtros actuales. Intenta con otros criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <X className="-ml-1 mr-2 h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles de ambiente */}
      {showModal && selectedAmbiente && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedAmbiente(null);
          }}
          title={selectedAmbiente.nombre}
        >
          <div className="space-y-6">
            {/* Etiquetas de estado y tipo */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                statusStyles[selectedAmbiente.estado] || statusStyles.inactivo
              }`}>
                {selectedAmbiente.estado}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                typeStyles[(selectedAmbiente.tipo && selectedAmbiente.tipo.toLowerCase()) || 'otro'] || typeStyles.otro
              }`}>
                {selectedAmbiente.tipo}
              </span>
            </div>

            {/* Información principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500">Ubicación</div>
                  <div className="font-medium text-slate-800 dark:text-gray-200">{selectedAmbiente.ubicacion}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500">Capacidad</div>
                  <div className="font-medium text-slate-800 dark:text-gray-200">{selectedAmbiente.capacidad} personas</div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {selectedAmbiente.descripcion && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Descripción</div>
                <p className="text-slate-700 dark:text-gray-300">{selectedAmbiente.descripcion}</p>
              </div>
            )}

            {/* Recursos / Servicios / Equipos si existen */}
            {Array.isArray(selectedAmbiente.recursos) && selectedAmbiente.recursos.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Recursos</div>
                <ul className="list-disc list-inside text-slate-700 dark:text-gray-300">
                  {selectedAmbiente.recursos.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(selectedAmbiente.servicios) && selectedAmbiente.servicios.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Servicios</div>
                <ul className="list-disc list-inside text-slate-700 dark:text-gray-300">
                  {selectedAmbiente.servicios.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(selectedAmbiente.equipos) && selectedAmbiente.equipos.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Equipos</div>
                <ul className="list-disc list-inside text-slate-700 dark:text-gray-300">
                  {selectedAmbiente.equipos.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowModal(false); setSelectedAmbiente(null); }}>
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  navigate('/instructor/nueva-reserva', { state: { ambienteId: selectedAmbiente._id } });
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Reservar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modales de reserva */}
      {renderReservaModal()}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="¡Reserva exitosa!"
        >
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Tu reserva ha sido creada exitosamente. Recibirás una confirmación por email.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InstructorAmbientesPage;
