import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ELIMINAR: import { useAuthContext } from "@/contexts/auth-context";
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
import apiService from "@/services/api";
import { Button, Input, Select, Card, CardContent } from "@/components/ui";

export default function ReservaPage() {
  // ELIMINAR: const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    nombre: "", // Ahora editable manualmente
    documento: "", // Ahora editable manualmente
    ambiente: "",
    fecha: "",
    jornada: "",
    motivo: "",
  });

  // Agregar la definición de jornadas
  const jornadas = [
    { value: "06:00-12:00", label: "Mañana (6:00 AM - 12:00 PM)" },
    { value: "12:30-18:00", label: "Tarde (12:30 PM - 6:00 PM)" },
    { value: "18:30-22:00", label: "Noche (6:30 PM - 10:00 PM)" }
  ];

  const [ambientes, setAmbientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);

  // ELIMINAR la declaración duplicada de navigate (línea 47)
  // const navigate = useNavigate(); // <-- ELIMINAR ESTA LÍNEA

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmbienteSelect = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setForm({ ...form, ambiente: ambiente.nombre });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // ELIMINAR estas líneas comentadas si aún están:
      // if (!user || !user.cc) {
      //   setError('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      //   return;
      // }
      
      // Verificar que los campos requeridos estén llenos
      if (!form.nombre || !form.documento) {
        setError('Por favor, complete todos los campos requeridos.');
        return;
      }
      
      // Extraer horarios de la jornada seleccionada
      const [horaInicio, horaFin] = form.jornada.split('-');
      
      const reservaData = {
        ambiente: form.ambiente,
        fecha: form.fecha,
        startDate: `${form.fecha}T${horaInicio}:00.000Z`,
        endDate: `${form.fecha}T${horaFin}:00.000Z`,
        motivo: form.motivo,
        // Enviar los datos del formulario directamente
        userCC: form.documento, // Usar el documento del formulario
        userName: form.nombre   // Usar el nombre del formulario
      };
      
      await apiService.createReserva(reservaData);
      setShowSuccess(true);
      
      // Redirigir después de mostrar éxito
      setTimeout(() => {
        navigate("/ver-reservas");
      }, 2000);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Error al crear la reserva. Por favor, intenta nuevamente.');
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

  // Al inicio del componente, después de obtener el usuario
  // ELIMINAR COMPLETAMENTE esta verificación (líneas 136-148 aproximadamente):
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
  //       <div className="text-center">
  //         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
  //           Acceso Denegado
  //         </h2>
  //         <p className="text-slate-600 dark:text-slate-400 mb-4">
  //           Debes iniciar sesión para crear una reserva.
  //         </p>
  //         <Button onClick={() => navigate('/login')}>
  //           Ir al Login
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 dark:bg-slate-900/95 dark:border-slate-600 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-sena-100 dark:hover:bg-sena-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-sena dark:text-sena-light" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sena to-sena-dark bg-clip-text text-transparent">
                  Nueva Reserva
                </h1>
                <p className="text-sm text-slate-300 dark:text-slate-400">
                  Reserva un ambiente para tu actividad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-sena-50 dark:bg-sena-900/30 rounded-xl border border-sena-200 dark:border-sena-700">
              <div className="w-2 h-2 bg-sena rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-sena-dark dark:text-sena-light">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Formulario Principal */}
          <div className="xl:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-sena-200 dark:bg-slate-900/80 dark:border-sena-700">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sena" />
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
                                ? 'border-sena shadow-lg bg-sena-50 dark:bg-sena-900/20'
                                : 'border-sena-200 dark:border-sena-700 hover:border-sena'
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
                              <CheckCircle className="w-5 h-5 text-sena" />
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
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Clock className="inline w-4 h-4 mr-2" />
                        Jornada
                      </label>
                      <select
                        name="jornada"
                        value={form.jornada}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-sena-200 rounded-xl focus:ring-2 focus:ring-sena focus:border-sena dark:bg-slate-800 dark:border-sena-700 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                        required
                      >
                        <option value="">Selecciona una jornada</option>
                        {jornadas.map(jornada => (
                          <option key={jornada.value} value={jornada.value}>
                            {jornada.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Eliminar esta sección completa de Duración */}
                  {/* <div>
                    <Input
                      label="Duración de la Reserva (en horas)"
                      icon={Clock}
                      type="number"
                      name="duracion"
                      value={form.duracion || ""}
                      onChange={handleChange}
                      placeholder="Ej: 1.5"
                      required
                    />
                  </div> */}

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Motivo de la Reserva
                    </label>
                    <textarea
                      name="motivo"
                      value={form.motivo}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-sena-200 rounded-xl focus:ring-2 focus:ring-sena focus:border-sena dark:bg-slate-800 dark:border-sena-700 dark:text-white dark:focus:ring-sena-light transition-all duration-200 resize-none"
                      placeholder="Describe el motivo de tu reserva..."
                      required
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="flex-1 border-sena-200 text-sena hover:bg-sena-50 hover:border-sena dark:border-sena-700 dark:text-sena-light dark:hover:bg-sena-900/20"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedAmbiente}
                      className="flex-1 bg-sena hover:bg-sena-dark text-white border-sena disabled:bg-sena/50 disabled:border-sena/50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Crear Reserva
                        </div>
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
            <Card className="bg-white/80 backdrop-blur-sm border-sena-200 dark:bg-slate-900/80 dark:border-sena-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sena" />
                  Jornadas Disponibles
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-sena-50 dark:bg-sena-900/20 rounded-lg border border-sena-100 dark:border-sena-800">
                    <span className="text-slate-600 dark:text-slate-400">Mañana</span>
                    <span className="font-medium text-slate-900 dark:text-white">6:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-sena-50 dark:bg-sena-900/20 rounded-lg border border-sena-100 dark:border-sena-800">
                    <span className="text-slate-600 dark:text-slate-400">Tarde</span>
                    <span className="font-medium text-slate-900 dark:text-white">12:30 PM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-sena-50 dark:bg-sena-900/20 rounded-lg border border-sena-100 dark:border-sena-800">
                    <span className="text-slate-600 dark:text-slate-400">Noche</span>
                    <span className="font-medium text-slate-900 dark:text-white">6:30 PM - 10:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Políticas */}
            <Card className="bg-white/80 backdrop-blur-sm border-sena-200 dark:bg-slate-900/80 dark:border-sena-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-sena" />
                  Políticas de Reserva
                </h3>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2 p-2 bg-sena-50 dark:bg-sena-900/20 rounded-lg border border-sena-100 dark:border-sena-800">
                    <CheckCircle className="w-4 h-4 text-sena mt-0.5 flex-shrink-0" />
                    <span>Reservas con 24h de anticipación</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-sena-50 dark:bg-sena-900/20 rounded-lg border border-sena-100 dark:border-sena-800">
                    <CheckCircle className="w-4 h-4 text-sena mt-0.5 flex-shrink-0" />
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
              <Card className="bg-gradient-to-br from-sena-50 to-sena-100 dark:from-sena-900/20 dark:to-sena-800/20 border-sena-200 dark:border-sena-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-sena" />
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
                      <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-sena-100 dark:border-sena-800">
                        <Users className="w-4 h-4 mx-auto mb-1 text-sena" />
                        <div className="font-medium">{selectedAmbiente.capacidad}</div>
                        <div className="text-xs text-slate-500">Capacidad</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-sena-100 dark:border-sena-800">
                        <MapPin className="w-4 h-4 mx-auto mb-1 text-sena" />
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center border border-sena-200 dark:border-sena-700">
            <div className="w-16 h-16 bg-gradient-to-br from-sena-100 to-sena-200 dark:from-sena-900/30 dark:to-sena-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-sena-200 dark:border-sena-700">
              <CheckCircle className="w-8 h-8 text-sena dark:text-sena-light" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              ¡Reserva Creada Exitosamente!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tu reserva ha sido registrada y está pendiente de aprobación. Serás redirigido a la lista de reservas.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sena"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};
