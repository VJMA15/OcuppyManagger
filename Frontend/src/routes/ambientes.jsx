import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Monitor,
  Wifi,
  Power
} from "lucide-react";

// Datos de ejemplo para ambientes
const ambientesEjemplo = [
  {
    id: 1,
    nombre: "Sala de Conferencias A",
    tipo: "Conferencia",
    capacidad: 20,
    equipos: 15,
    estado: "Disponible",
    ubicacion: "Piso 1 - Ala Norte",
    descripcion: "Sala equipada con proyector, sistema de audio y micrófonos inalámbricos. Ideal para presentaciones y conferencias.",
    servicios: ["Proyector", "Audio", "WiFi", "Aire acondicionado"],
    horario: "8:00 AM - 6:00 PM",
    responsable: "María González",
    ultimaReserva: "2024-01-15"
  },
  {
    id: 2,
    nombre: "Laboratorio de Computación 1",
    tipo: "Laboratorio",
    capacidad: 25,
    equipos: 25,
    estado: "Ocupado",
    ubicacion: "Piso 2 - Ala Este",
    descripcion: "Laboratorio con 25 computadoras de última generación, software especializado y conexión de alta velocidad.",
    servicios: ["Computadoras", "Software especializado", "WiFi", "Impresora"],
    horario: "7:00 AM - 8:00 PM",
    responsable: "Carlos Ruiz",
    ultimaReserva: "2024-01-16"
  },
  {
    id: 3,
    nombre: "Aula de Capacitación 1",
    tipo: "Aula",
    capacidad: 30,
    equipos: 8,
    estado: "Disponible",
    ubicacion: "Piso 1 - Ala Sur",
    descripcion: "Aula tradicional con pizarra digital, sistema de audio y mobiliario ergonómico para capacitaciones.",
    servicios: ["Pizarra digital", "Audio", "WiFi", "Ventilación"],
    horario: "8:00 AM - 6:00 PM",
    responsable: "Ana Martínez",
    ultimaReserva: "2024-01-14"
  },
  {
    id: 4,
    nombre: "Auditorio Principal",
    tipo: "Auditorio",
    capacidad: 100,
    equipos: 5,
    estado: "Disponible",
    ubicacion: "Piso 3 - Centro",
    descripcion: "Auditorio principal con capacidad para 100 personas, equipado con sistema de proyección profesional y audio surround.",
    servicios: ["Proyector 4K", "Audio surround", "WiFi", "Aire acondicionado"],
    horario: "8:00 AM - 10:00 PM",
    responsable: "Luis Pérez",
    ultimaReserva: "2024-01-13"
  },
  {
    id: 5,
    nombre: "Sala de Reuniones",
    tipo: "Reunión",
    capacidad: 10,
    equipos: 3,
    estado: "Ocupado",
    ubicacion: "Piso 2 - Ala Oeste",
    descripcion: "Sala íntima para reuniones ejecutivas con mesa de conferencia y sistema de videoconferencia.",
    servicios: ["Videoconferencia", "WiFi", "Café", "Aire acondicionado"],
    horario: "8:00 AM - 6:00 PM",
    responsable: "Sofia López",
    ultimaReserva: "2024-01-16"
  },
  {
    id: 6,
    nombre: "Taller de Mecánica",
    tipo: "Taller",
    capacidad: 20,
    equipos: 12,
    estado: "Disponible",
    ubicacion: "Piso 1 - Ala Este",
    descripcion: "Taller equipado con herramientas especializadas para prácticas de mecánica automotriz.",
    servicios: ["Herramientas especializadas", "Compresor", "Ventilación", "Iluminación"],
    horario: "7:00 AM - 5:00 PM",
    responsable: "Roberto Silva",
    ultimaReserva: "2024-01-12"
  }
];

export default function Ambientes() {
  const [ambientes, setAmbientes] = useState([]);
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Cargar ambientes desde localStorage o usar datos de ejemplo
  useEffect(() => {
    const ambientesGuardados = localStorage.getItem("ambientes");
    if (ambientesGuardados) {
      const parsed = JSON.parse(ambientesGuardados);
      // Verificar si los ambientes tienen todas las propiedades necesarias
      const ambientesCompletos = parsed.map(ambiente => ({
        id: ambiente.id || Math.random(),
        nombre: ambiente.nombre || "Ambiente sin nombre",
        tipo: ambiente.tipo || "General",
        capacidad: ambiente.capacidad || 0,
        equipos: ambiente.equipos || 0,
        estado: ambiente.estado || "Disponible",
        ubicacion: ambiente.ubicacion || "Sin ubicación",
        descripcion: ambiente.descripcion || "Sin descripción",
        servicios: ambiente.servicios || [],
        horario: ambiente.horario || "8:00 AM - 6:00 PM",
        responsable: ambiente.responsable || "Sin responsable",
        ultimaReserva: ambiente.ultimaReserva || null
      }));
      setAmbientes(ambientesCompletos);
      localStorage.setItem("ambientes", JSON.stringify(ambientesCompletos));
    } else {
      localStorage.setItem("ambientes", JSON.stringify(ambientesEjemplo));
      setAmbientes(ambientesEjemplo);
    }
  }, []);

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || ambiente.tipo === filterTipo;
    const matchesEstado = filterEstado === "todos" || ambiente.estado === filterEstado;
    
    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(ambientes.map(a => a.tipo))];
  const estadosUnicos = [...new Set(ambientes.map(a => a.estado))];

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Disponible":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Ocupado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  // Función para obtener el icono del tipo
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "Conferencia":
        return <Users className="w-4 h-4" />;
      case "Laboratorio":
        return <Monitor className="w-4 h-4" />;
      case "Aula":
        return <Building2 className="w-4 h-4" />;
      case "Auditorio":
        return <Users className="w-4 h-4" />;
      case "Reunión":
        return <Users className="w-4 h-4" />;
      case "Taller":
        return <Building2 className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const handleAmbienteClick = (ambiente) => {
    console.log('🔍 Click en ambiente:', ambiente.nombre);
    setSelectedAmbiente(ambiente);
    setShowPanel(true);
    console.log('✅ Panel abierto para:', ambiente.nombre);
  };

  const handleClosePanel = () => {
    console.log('🚪 Cerrando panel');
    setShowPanel(false);
    setSelectedAmbiente(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ambientes</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona y visualiza todos los ambientes disponibles</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Ambiente
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ambientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
          >
            <option key="todos" value="todos">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
          >
            <option key="todos" value="todos">Todos los estados</option>
            {estadosUnicos.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {/* Contador */}
          <div className="flex items-center justify-center px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {filteredAmbientes.length} de {ambientes.length} ambientes
            </span>
          </div>
        </div>
      </div>

      {/* Grid de ambientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAmbientes.map((ambiente) => (
          <div
            key={ambiente.id}
            onClick={() => handleAmbienteClick(ambiente)}
            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg hover:border-sena/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Estado badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(ambiente.estado)}`}>
                {ambiente.estado}
              </span>
            </div>

            {/* Icono del tipo */}
            <div className="w-12 h-12 bg-sena/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sena/20 transition-colors">
              {getTipoIcon(ambiente.tipo)}
            </div>

            {/* Información principal */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-sena transition-colors">
                  {ambiente.nombre}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{ambiente.tipo}</p>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {ambiente.capacidad} personas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {ambiente.equipos} equipos
                  </span>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {ambiente.ubicacion}
                </span>
              </div>
            </div>

            {/* Hover overlay con información adicional */}
            <div className="absolute inset-0 bg-sena/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Ver detalles</p>
                <p className="text-sm opacity-90">Click para más información</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel de detalles - Versión simple para debug */}
      {console.log('🎯 Renderizando panel - showPanel:', showPanel, 'selectedAmbiente:', selectedAmbiente?.nombre)}
      
      {/* Debug info */}
      {showPanel && (
        <div className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded z-50">
          Panel activo: {selectedAmbiente?.nombre}
        </div>
      )}
      
      {showPanel && selectedAmbiente && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sena/10 rounded-lg flex items-center justify-center">
                  {getTipoIcon(selectedAmbiente.tipo)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {selectedAmbiente.nombre}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">{selectedAmbiente.tipo}</p>
                </div>
              </div>
              <button
                onClick={handleClosePanel}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Estado */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${selectedAmbiente.estado === 'Disponible' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Estado</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.estado}</p>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ubicación</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.ubicacion}</p>
                </div>
              </div>

                             {/* Capacidad y equipos */}
               <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                   <Users className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Capacidad</p>
                     <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.capacidad} personas</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                   <Monitor className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Equipos</p>
                     <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.equipos} equipos</p>
                   </div>
                 </div>
               </div>

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Descripción</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedAmbiente.descripcion}
                </p>
              </div>

                             {/* Servicios */}
               <div>
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Servicios disponibles</h3>
                 <div className="grid grid-cols-1 gap-2">
                   {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 ? (
                     selectedAmbiente.servicios.map((servicio, index) => (
                       <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         <span className="text-sm text-slate-700 dark:text-slate-300">{servicio}</span>
                       </div>
                     ))
                   ) : (
                     <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                       <span className="text-sm text-slate-500 dark:text-slate-400">No hay servicios registrados</span>
                     </div>
                   )}
                 </div>
               </div>

               {/* Información adicional */}
               <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                   <Clock className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Horario</p>
                     <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.horario}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                   <Users className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Responsable</p>
                     <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.responsable}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                   <Calendar className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Última reserva</p>
                     <p className="font-medium text-slate-900 dark:text-white">
                       {selectedAmbiente.ultimaReserva ? new Date(selectedAmbiente.ultimaReserva).toLocaleDateString('es-ES') : 'Sin reservas'}
                     </p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleClosePanel}
                className="flex-1 px-4 py-3 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button className="flex-1 px-4 py-3 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors font-medium">
                Reservar Ambiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
