import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Building2, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { verificarDisponibilidadAmbiente, verificarDisponibilidadFutura, notificarCambioDisponibilidad } from "@/utils/ambienteUtils";
import useAmbientes from "@/hooks/useAmbientes";
import useReservas from "@/hooks/useReservas";
import ConnectionStatus from "@/components/ConnectionStatus";

// Función helper para convertir jornada a hora representativa
const getHoraFromJornada = (jornada) => {
  switch (jornada) {
    case 'mañana': return '08:00';
    case 'tarde': return '14:00';
    case 'noche': return '20:00';
    default: return '08:00';
  }
};

export default function Reserva() {
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    ambiente: "",
    fecha: "",
    jornada: "",
    motivo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Usar hooks para conectar con el backend
  const { ambientes, isLoading: ambientesLoading, error: ambientesError } = useAmbientes();
  const { createReserva, reservas } = useReservas();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Si cambia la fecha o jornada, forzar re-render para actualizar disponibilidad
    if (e.target.name === 'fecha' || e.target.name === 'jornada') {
      // Forzar actualización del estado para re-renderizar los ambientes
      setTimeout(() => {
        setForm(prev => ({ ...prev }));
      }, 100);
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Crear nueva reserva con estado pendiente
      const nuevaReserva = {
        ...form,
        hora: getHoraFromJornada(form.jornada), // Convertir jornada a hora representativa
        duracion: "6", // Duración fija de 6 horas por jornada
        estado: "pendiente", // Estado inicial: pendiente de aprobación
        fechaCreacion: new Date().toISOString(),
        aprobadaPor: null,
        fechaAprobacion: null,
        motivoRechazo: null,
        motivoCancelacion: null
      };
      
      // Enviar al backend
      await createReserva(nuevaReserva);
      
      // Notificar cambio de disponibilidad y disparar eventos
      notificarCambioDisponibilidad();
      window.dispatchEvent(new CustomEvent('reserva-created', {
        detail: { reserva: nuevaReserva }
      }));
      
      setShowSuccess(true);
      
      // Redirigir después de mostrar éxito
      setTimeout(() => {
        navigate("/ver-reservas");
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al crear la reserva');
      console.error('Error creating reserva:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Usar la función centralizada de verificación de disponibilidad

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
            <ConnectionStatus />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Información de la Reserva
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Completa los datos para crear tu reserva
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <User className="inline w-4 h-4 mr-2" />
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                      placeholder="Ingresa tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      name="documento"
                      value={form.documento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                      placeholder="CC, CE, TI, etc."
                      required
                    />
                  </div>
        </div>

                {/* Selección de Ambiente */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Building2 className="inline w-4 h-4 mr-2" />
                    Ambiente a Reservar
                  </label>
          <select
            name="ambiente"
            value={form.ambiente}
            onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
            required
          >
            <option value="">Selecciona un ambiente</option>
                    {ambientes.map(ambiente => {
                      // Verificar disponibilidad para la fecha y jornada seleccionadas
                      const disponible = form.fecha && form.jornada 
                        ? verificarDisponibilidadFutura(ambiente._id, form.fecha, getHoraFromJornada(form.jornada), reservas)
                        : verificarDisponibilidadAmbiente(ambiente._id, reservas);
                      
                      return (
                        <option 
                          key={ambiente._id} 
                          value={ambiente._id}
                          disabled={!disponible}
                          className={!disponible ? "text-red-500" : ""}
                        >
                          {ambiente.nombre} - {ambiente.tipo} ({ambiente.capacidad}) 
                          {!disponible ? " - OCUPADO" : " - Disponible"}
                        </option>
                      );
                    })}
          </select>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Los ambientes marcados como "OCUPADO" no están disponibles para reserva
          </p>
        </div>

                {/* Fecha y Jornada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Fecha de Reserva
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="inline w-4 h-4 mr-2" />
                      Jornada
                    </label>
                    <select
                      name="jornada"
                      value={form.jornada}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                      required
                    >
                      <option value="">Selecciona una jornada</option>
                      <option value="mañana">Mañana (6:00 AM - 12:00 PM)</option>
                      <option value="tarde">Tarde (12:30 PM - 6:00 PM)</option>
                      <option value="noche">Noche (6:30 PM - 10:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <FileText className="inline w-4 h-4 mr-2" />
                    Motivo de la Reserva
                  </label>
                  <textarea
                    name="motivo"
                    value={form.motivo}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200 resize-none"
                    placeholder="Describe el motivo de tu reserva..."
                    required
                  />
                </div>

                {/* Mensaje de Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">
                          Error al crear reserva
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || ambientesLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-sena to-sena-dark text-white rounded-xl hover:from-sena-dark hover:to-sena focus:ring-2 focus:ring-sena focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      "Crear Reserva"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estado de Conexión */}
            {ambientesError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Error de Conexión
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {ambientesError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Ambientes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Ambientes Disponibles
              </h3>
              {ambientesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sena"></div>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">Cargando ambientes...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {ambientes.map(ambiente => (
                    <div key={ambiente._id || ambiente.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {ambiente.nombre}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {ambiente.tipo} • {ambiente.capacidad}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 dark:text-green-400">Disponible</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información de Horarios */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Horarios de Atención
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Lunes - Viernes</span>
                  <span className="font-medium text-slate-900 dark:text-white">7:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sábados</span>
                  <span className="font-medium text-slate-900 dark:text-white">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Domingos</span>
                  <span className="font-medium text-slate-900 dark:text-white">Cerrado</span>
                </div>
              </div>
            </div>

            {/* Políticas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Políticas de Reserva
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Reservas con 24h de anticipación</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Máximo 4 horas por reserva</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Cancelar con 2h de anticipación</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              ¡Reserva Creada!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tu reserva ha sido registrada exitosamente. Serás redirigido a la lista de reservas.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sena"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}    