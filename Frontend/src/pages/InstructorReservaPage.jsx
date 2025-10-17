import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Building2, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  Users
} from "lucide-react";
import apiService from "../services/api";
import { Button, Input, Card, CardContent } from "../components/ui";
// Eliminamos uso del componente Select con Portal para evitar conflictos de reconcilio DOM
// y usamos un <select> nativo que ya se emplea en otras páginas sin problemas.
import CompactCalendarWidget from "../components/dashboard/CompactCalendarWidget.jsx";

export default function InstructorReservaPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedAmbienteId = location.state?.ambienteId;
  
  const [form, setForm] = useState({
    nombre: "", 
    documento: "", 
    ambiente: "",
    fecha: "",
    jornada: "",
    useHorarioPersonalizado: false,
    horaInicio: "",
    horaFin: "",
    motivo: "",
    dispositivos: {
      Cargadores: false,
      computadores: false,
      sonido: false,
      microfono: false,
      videoBeam: false,
      pizarra: false,
      pizarraDigital: false
    }
  });

  // Agregar la definición de jornadas
  const jornadas = [
    { value: "mañana", label: "Mañana (6:00 AM - 12:00 PM)" },
    { value: "tarde", label: "Tarde (12:30 PM - 6:00 PM)" },
    { value: "noche", label: "Noche (6:30 PM - 10:00 PM)" }
  ];

  const jornadaHorarios = {
    mañana: { inicio: '06:00', fin: '12:00' },
    tarde: { inicio: '12:30', fin: '18:00' },
    noche: { inicio: '18:30', fin: '22:00' },
  };

  const [ambientes, setAmbientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [dailyAvailability, setDailyAvailability] = useState(null);
  const [occupiedDays, setOccupiedDays] = useState([]);

  useEffect(() => {
    const fetchAmbientes = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAmbientes();
        setAmbientes(response.data || []);
      } catch (err) {
        console.error('Error fetching ambientes:', err);
        setError('Error al cargar los ambientes');
      } finally {
        setLoading(false);
      }
    };

    fetchAmbientes();
  }, []);

  // Preseleccionar ambiente si viene desde navegación
  useEffect(() => {
    if (preselectedAmbienteId && ambientes.length > 0) {
      const found = ambientes.find(a => a._id === preselectedAmbienteId || a.id === preselectedAmbienteId);
      if (found) {
        setSelectedAmbiente(found);
        setForm(prev => ({ ...prev, ambiente: found._id || found.id }));
      }
    }
  }, [preselectedAmbienteId, ambientes]);

  // Auto-llenar campos con datos del usuario autenticado
  useEffect(() => {
    if (user && user.nombre && user.cc) {
      setForm(prevForm => ({
        ...prevForm,
        nombre: user.nombre,
        documento: user.cc
      }));
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmbienteSelect = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setForm({ ...form, ambiente: ambiente._id });
  };

  // Disponibilidad diaria según ambiente y fecha seleccionados
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        if (!selectedAmbiente || !form.fecha) {
          setDailyAvailability(null);
          return;
        }
        const params = new URLSearchParams({ environmentId: selectedAmbiente._id || selectedAmbiente.id, date: form.fecha });
        const resp = await apiService.get(`/api/v1/reservas/availability?${params.toString()}`);
        setDailyAvailability(resp?.data || resp);
      } catch (e) {
        console.error('Error fetching availability:', e);
        setDailyAvailability(null);
      }
    };
    fetchAvailability();
  }, [selectedAmbiente, form.fecha]);

  // Días ocupados (próximas 2 semanas) para el ambiente seleccionado
  useEffect(() => {
    const fetchOccupiedDays = async () => {
      try {
        if (!selectedAmbiente) {
          setOccupiedDays([]);
          return;
        }
        const today = new Date();
        const dates = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          return d.toISOString().split('T')[0];
        });
        const environmentId = selectedAmbiente._id || selectedAmbiente.id;
        const results = await Promise.all(
          dates.map(async (dateStr) => {
            const params = new URLSearchParams({ environmentId, date: dateStr });
            const resp = await apiService.get(`/api/v1/reservas/availability?${params.toString()}`);
            const data = resp?.data || resp;
            if (data?.fullyOccupied) return dateStr;
            return null;
          })
        );
        setOccupiedDays(results.filter(Boolean));
      } catch (e) {
        console.error('Error fetching occupied days:', e);
        setOccupiedDays([]);
      }
    };
    fetchOccupiedDays();
  }, [selectedAmbiente]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Verificar que los campos requeridos estén llenos
      if (!form.nombre || !form.documento) {
        setError('Por favor, complete todos los campos requeridos.');
        return;
      }
      
      // Determinar horarios según jornada o personalizado
      let horaInicio;
      let horaFin;
      if (form.useHorarioPersonalizado) {
        if (!form.horaInicio || !form.horaFin) {
          setError('Debe seleccionar hora de inicio y fin.');
          return;
        }
        if (form.horaInicio >= form.horaFin) {
          setError('La hora de fin debe ser posterior a la hora de inicio.');
          return;
        }
        horaInicio = form.horaInicio;
        horaFin = form.horaFin;
      } else {
        if (!form.jornada) {
          setError('Debe seleccionar una jornada.');
          return;
        }
        const horario = jornadaHorarios[form.jornada];
        horaInicio = horario?.inicio;
        horaFin = horario?.fin;
      }
      
      const reservaData = {
        environmentId: form.ambiente,
        reservationDate: form.fecha,
        jornada: form.jornada,
        startDate: `${form.fecha}T${horaInicio}:00`,
        endDate: `${form.fecha}T${horaFin}:00`,
        purpose: form.motivo,
        userCC: form.documento,
        userName: form.nombre
      };
      
      await apiService.createReserva(reservaData);
      setShowSuccess(true);
      
      // Redirigir después de mostrar éxito
      setTimeout(() => {
        navigate("/instructor/mis-reservas");
      }, 2000);
    } catch (err) {
      console.error('Error creating reservation:', err);
      const msg = (err && (err.message || err.error?.message)) || '';
      const isConflict = /reservad[oa].*jornada/i.test(msg) || /ya est[aá] reservado/i.test(msg);
      setError(isConflict ? 'El ambiente ya está reservado para esta jornada en la fecha seleccionada.' : 'Error al crear la reserva. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAmbienteIcon = (tipo) => {
    switch (tipo) {
      case 'Aula': return '🏫';
      case 'Laboratorio': return '🔬';
      case 'Auditorio': return '🎭';
      case 'Conferencia': return '💼';
      case 'Reunión': return '👥';
      case 'Taller': return '🔧';
      default: return '🏢';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 dark:bg-slate-900/95 dark:border-slate-600 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/instructor/ambientes')}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Nueva Reserva
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reserva un ambiente para tu actividad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Formulario Principal */}
          <div className="xl:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Información de la Reserva
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Completa los datos para crear tu reserva
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 dark:text-red-400">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información Personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nombre Completo
                      </label>
                      <Input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ingrese su nombre completo"
                        readOnly={!!user}
                        disabled={!!user}
                        className={user ? "bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-600 dark:text-gray-400" : ""}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Número de Documento
                      </label>
                      <Input
                        type="text"
                        name="documento"
                        value={form.documento}
                        onChange={handleChange}
                        required
                        placeholder="CC"
                        readOnly={!!user}
                        disabled={!!user}
                        className={user ? "bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-600 dark:text-gray-400" : ""}
                      />
                    </div>
                  </div>

                  {/* Selección de Ambiente */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Selecciona un Ambiente
                    </label>
                    
                    {/* Grid de ambientes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {ambientes.map(ambiente => (
                        <div
                          key={ambiente._id}
                          onClick={() => handleAmbienteSelect(ambiente)}
                          className={`
                            relative bg-white dark:bg-slate-800 rounded-xl border-2 cursor-pointer
                            transition-all duration-200 p-4 hover:shadow-lg hover:scale-105
                            ${
                              selectedAmbiente?._id === ambiente._id
                                ? 'border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                            }
                          `}
                        >
                          {/* Icono del ambiente */}
                          <div className="text-2xl mb-2 text-center">
                            {getAmbienteIcon(ambiente.tipo)}
                          </div>
                          
                          {/* Nombre del ambiente */}
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white text-center mb-2">
                            {ambiente.nombre}
                          </h3>
                          
                          {/* Información básica */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{ambiente.capacidad} personas</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{ambiente.ubicacion}</span>
                            </div>
                          </div>
                          
                          {/* Indicador de selección */}
                          {selectedAmbiente?._id === ambiente._id && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <input type="hidden" name="ambiente" value={form.ambiente} />
                  </div>

                  {/* Fecha y Jornada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Fecha de Reserva"
                        icon={Calendar}
                        type="date"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Jornada
                      </label>
                      {!form.useHorarioPersonalizado ? (
                        <>
                          <select
                            name="jornada"
                            value={form.jornada}
                            onChange={(e) => setForm(prev => ({ ...prev, jornada: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="" disabled>Selecciona una jornada</option>
                            {jornadas.map(j => (
                              <option key={j.value} value={j.value}>{j.label}</option>
                            ))}
                          </select>
                          {dailyAvailability && (
                            <div className="mt-2 text-sm">
                              <div className="flex flex-wrap gap-2">
                                {['mañana','tarde','noche'].map(j => (
                                  <span
                                    key={j}
                                    className={`px-2 py-1 rounded-lg border text-xs ${dailyAvailability[j] ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                                  >
                                    {j.charAt(0).toUpperCase()+j.slice(1)} {dailyAvailability[j] ? 'Ocupada' : 'Disponible'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            type="time"
                            label="Hora inicio"
                            name="horaInicio"
                            value={form.horaInicio}
                            onChange={handleChange}
                            required
                          />
                          <Input
                            type="time"
                            label="Hora fin"
                            name="horaFin"
                            value={form.horaFin}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="horarioPersonalizado"
                          type="checkbox"
                          checked={form.useHorarioPersonalizado}
                          onChange={(e) => setForm(prev => ({ ...prev, useHorarioPersonalizado: e.target.checked }))}
                          className="h-4 w-4 border-slate-300 dark:border-slate-600 rounded"
                        />
                        <label htmlFor="horarioPersonalizado" className="text-sm text-slate-700 dark:text-slate-300">
                          Usar horario personalizado
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Motivo de la Reserva
                    </label>
                    <textarea
                      name="motivo"
                      value={form.motivo}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Describe el motivo de tu reserva..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/instructor/ambientes')}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedAmbiente || (dailyAvailability && form.jornada && dailyAvailability[form.jornada])}
                      className="flex-1 sm:flex-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Reserva
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
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>

            {/* Días Ocupados (Próximas 2 Semanas) */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Días ocupados (próximas 2 semanas)
                </h3>
                <div className="mb-4">
                  <CompactCalendarWidget
                    environmentId={selectedAmbiente?._id || selectedAmbiente?.id}
                    jornada={form.jornada}
                    rangeDays={14}
                  />
                </div>
                {occupiedDays.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">No hay días totalmente ocupados en este periodo.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {occupiedDays.map(dateStr => (
                      <span key={dateStr} className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs">
                        {new Date(dateStr).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Políticas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>

            {/* Resumen de Selección */}
            {selectedAmbiente && (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Ambiente Seleccionado
                  </h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {getAmbienteIcon(selectedAmbiente.tipo)}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {selectedAmbiente.nombre}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedAmbiente.tipo}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Users className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                        <div className="font-medium">{selectedAmbiente.capacidad}</div>
                        <div className="text-xs text-slate-500">Capacidad</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                        <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                        <div className="font-medium text-xs">{selectedAmbiente.ubicacion}</div>
                        <div className="text-xs text-slate-500">Ubicación</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 dark:border-green-700">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              ¡Reserva Creada Exitosamente!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tu reserva ha sido registrada y está pendiente de aprobación. Serás redirigido a la lista de reservas.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}