import React, { useState } from "react";
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

export default function Reserva() {
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    ambiente: "",
    fecha: "",
    hora: "",
    duracion: "",
    motivo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear nueva reserva con estado pendiente
    const nuevaReserva = {
      ...form,
      estado: "pendiente", // Estado inicial: pendiente de aprobación
      fechaCreacion: new Date().toISOString(),
      aprobadaPor: null,
      fechaAprobacion: null,
      motivoRechazo: null,
      motivoCancelacion: null
    };
    
    // Guardar en localStorage
    const reservasGuardadas = JSON.parse(localStorage.getItem("reservas") || "[]");
    const nuevasReservas = [...reservasGuardadas, nuevaReserva];
    localStorage.setItem("reservas", JSON.stringify(nuevasReservas));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Redirigir después de mostrar éxito
    setTimeout(() => {
    navigate("/ver-reservas");
    }, 2000);
  };

  const ambientes = [
    { id: "101", nombre: "Ambiente 101", capacidad: "25 personas", tipo: "Aula" },
    { id: "102", nombre: "Ambiente 102", capacidad: "30 personas", tipo: "Laboratorio" },
    { id: "103", nombre: "Ambiente 103", capacidad: "20 personas", tipo: "Sala de reuniones" },
    { id: "104", nombre: "Ambiente 104", capacidad: "40 personas", tipo: "Auditorio" },
    { id: "105", nombre: "Ambiente 105", capacidad: "15 personas", tipo: "Oficina" },
  ];

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
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Sistema Activo</span>
            </div>
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
                    {ambientes.map(ambiente => (
                      <option key={ambiente.id} value={ambiente.nombre}>
                        {ambiente.nombre} - {ambiente.tipo} ({ambiente.capacidad})
                      </option>
                    ))}
          </select>
        </div>

                {/* Fecha y Hora */}
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
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={form.hora}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Duración */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Duración de la Reserva (en horas)
                  </label>
                  <input
                    type="number"
                    name="duracion"
                    value={form.duracion || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                    placeholder="Ej: 1.5"
                    required
                  />
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
                    disabled={isSubmitting}
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
            {/* Información de Ambientes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Ambientes Disponibles
              </h3>
              <div className="space-y-3">
                {ambientes.map(ambiente => (
                  <div key={ambiente.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
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
