import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Building2, 
  ArrowLeft, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Check,
  X,
  Clock as ClockIcon,
  CalendarCheck
} from "lucide-react";
import { notificarCambioDisponibilidad } from "@/utils/ambienteUtils";

// Función helper para convertir hora a jornada
const getJornadaFromHora = (hora) => {
  if (!hora) return 'N/A';
  const horaNum = parseInt(hora.split(':')[0]);
  if (horaNum >= 6 && horaNum < 12) return 'Mañana';
  if (horaNum >= 12 && horaNum < 18) return 'Tarde';
  return 'Noche';
};

export default function VerReservas() {
  const [reservas, setReservas] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, idx: null });
  const [showApproveModal, setShowApproveModal] = useState({ show: false, idx: null, action: null });

  const navigate = useNavigate();

  // Carga las reservas siempre desde localStorage al montar y después de cambios
  const cargarReservas = () => {
    try {
      const stored = localStorage.getItem("reservas");
      const reservasData = stored ? JSON.parse(stored) : [];
      
      // Procesar reservas para agregar estados automáticos
      const reservasProcesadas = reservasData.map(reserva => {
        const estado = getReservaStatus(reserva.fecha, reserva.hora);
        return {
          ...reserva,
          estado: reserva.estado || "pendiente", // pendiente, aprobada, rechazada, cancelada
          estadoAutomatico: estado.status,
          aprobadaPor: reserva.aprobadaPor || null,
          fechaAprobacion: reserva.fechaAprobacion || null,
          motivoRechazo: reserva.motivoRechazo || null
        };
      });
      
      setReservas(reservasProcesadas);
    } catch {
      setReservas([]);
    }
  };

  useEffect(() => {
    cargarReservas();
    // Verificar reservas cada minuto para finalización automática
    const interval = setInterval(cargarReservas, 60000);
    return () => clearInterval(interval);
  }, []);

  const actualizarYRecargar = (nuevas) => {
    localStorage.setItem("reservas", JSON.stringify(nuevas));
    cargarReservas();
  };

  const handleDelete = idx => {
    const nuevas = reservas.filter((_, i) => i !== idx);
    actualizarYRecargar(nuevas);
    setShowDeleteModal({ show: false, idx: null });
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditForm(reservas[idx]);
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = idx => {
    const nuevas = reservas.map((r, i) => (i === idx ? editForm : r));
    actualizarYRecargar(nuevas);
    setEditIdx(null);
  };

  const handleApproveReject = (idx, action) => {
    const reserva = reservas[idx];
    const nuevas = reservas.map((r, i) => {
      if (i === idx) {
        const reservaActualizada = {
          ...r,
          estado: action === 'approve' ? 'aprobada' : 'rechazada',
          aprobadaPor: action === 'approve' ? 'Administrador' : null,
          fechaAprobacion: action === 'approve' ? new Date().toISOString() : null,
          motivoRechazo: action === 'reject' ? 'Reserva rechazada por el administrador' : null
        };
        
        // Notificar cambio de disponibilidad y disparar eventos
        notificarCambioDisponibilidad();
        if (action === 'approve') {
          window.dispatchEvent(new CustomEvent('reserva-approved', {
            detail: { reserva: reservaActualizada }
          }));
        } else if (action === 'reject') {
          window.dispatchEvent(new CustomEvent('reserva-rejected', {
            detail: { reserva: reservaActualizada }
          }));
        }
        
        return reservaActualizada;
      }
      return r;
    });
    actualizarYRecargar(nuevas);
    setShowApproveModal({ show: false, idx: null, action: null });
  };

  const handleCancel = (idx) => {
    const nuevas = reservas.map((r, i) => {
      if (i === idx) {
        const reservaCancelada = {
          ...r,
          estado: 'cancelada',
          motivoCancelacion: 'Cancelada por el administrador'
        };
        
        // Notificar cambio de disponibilidad y disparar evento para generar informe de cancelación
        notificarCambioDisponibilidad();
        window.dispatchEvent(new CustomEvent('reserva-cancelled', {
          detail: { reserva: reservaCancelada }
        }));
        
        return reservaCancelada;
      }
      return r;
    });
    actualizarYRecargar(nuevas);
  };

  const getReservaStatus = (fecha, hora) => {
    if (!fecha || !hora) return { status: "Pendiente", color: "yellow", icon: AlertCircle };
    
    const ahora = new Date();
    const fechaHora = new Date(fecha + 'T' + hora);
    const tiempoRestante = fechaHora - ahora;
    
    if (tiempoRestante < 0) {
      return { status: "Completada", color: "gray", icon: CheckCircle };
    } else if (tiempoRestante < 3600000) { // Menos de 1 hora
      return { status: "En Curso", color: "green", icon: CheckCircle };
    } else {
      return { status: "Pendiente", color: "yellow", icon: AlertCircle };
    }
  };

  const getEstadoBadge = (reserva) => {
    const estados = {
      pendiente: { color: "yellow", icon: AlertCircle, text: "Pendiente de Aprobación" },
      aprobada: { color: "green", icon: CheckCircle, text: "Aprobada" },
      rechazada: { color: "red", icon: XCircle, text: "Rechazada" },
      cancelada: { color: "gray", icon: XCircle, text: "Cancelada" }
    };
    
    const estado = estados[reserva.estado] || estados.pendiente;
    const colorClasses = {
      green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[estado.color]}`}>
        <estado.icon className="w-3 h-3" />
        {estado.text}
      </span>
    );
  };

  const filteredReservas = reservas.filter(reserva => {
    const matchesSearch = 
      reserva.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.ambiente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.documento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getReservaStatus(reserva.fecha, reserva.hora);
    const matchesFilter = filterStatus === "todos" || status.status.toLowerCase().includes(filterStatus);
    
    return matchesSearch && matchesFilter;
  });

  const StatusBadge = ({ status, color, icon: Icon }) => {
    const colorClasses = {
      green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

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
                  Gestión de Reservas
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Aprobar, rechazar y gestionar todas las reservas
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/reserva')}
              className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark text-white rounded-lg hover:from-sena-dark hover:to-sena transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
          
          {/* Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, ambiente o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en curso">En Curso</option>
                <option value="completada">Completadas</option>
              </select>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Reservas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{reservas.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-sena" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {reservas.filter(r => r.estado === "pendiente").length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {reservas.filter(r => r.estado === "aprobada").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {reservas.filter(r => r.estado === "rechazada").length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Canceladas</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {reservas.filter(r => r.estado === "cancelada").length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Tabla de Reservas */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <User className="inline w-4 h-4 mr-2" />
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Ambiente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Fecha/Jornada
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
              </tr>
            </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-slate-400 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No hay reservas
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {searchTerm || filterStatus !== "todos" 
                              ? "No se encontraron reservas con los filtros aplicados."
                              : "Aún no se han registrado reservas en el sistema."
                            }
                          </p>
                          <button
                            onClick={() => navigate('/reserva')}
                            className="px-4 py-2 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors"
                          >
                            Crear Primera Reserva
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map((reserva, idx) => {
                      const { status, color, icon: StatusIcon } = getReservaStatus(reserva.fecha, reserva.hora);
                      
                return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {reserva.nombre}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {reserva.documento}
                              </div>
                              {reserva.motivo && (
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {reserva.motivo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {reserva.ambiente}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-slate-900 dark:text-white">
                                {reserva.fecha}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {getJornadaFromHora(reserva.hora)}
                              </div>
                            </div>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {getEstadoBadge(reserva)}
                              <StatusBadge status={status} color={color} icon={StatusIcon} />
                            </div>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {reserva.estado === "pendiente" && (
                                <>
                           <button
                                    onClick={() => setShowApproveModal({ show: true, idx, action: 'approve' })}
                                    className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                    title="Aprobar"
                                  >
                                    <Check className="w-4 h-4" />
                           </button>
                           <button
                                    onClick={() => setShowApproveModal({ show: true, idx, action: 'reject' })}
                                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    title="Rechazar"
                                  >
                                    <X className="w-4 h-4" />
                           </button>
                      </>
                    )}
                              {reserva.estado === "aprobada" && (
                                <button
                                  onClick={() => handleCancel(idx)}
                                  className="p-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                                  title="Cancelar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(idx)}
                                className="p-2 text-slate-600 hover:text-sena dark:text-slate-400 dark:hover:text-sena-light transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteModal({ show: true, idx })}
                                className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                  </tr>
                );
                    })
                  )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div>

      {/* Modal de Eliminación */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Eliminar Reserva
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal({ show: false, idx: null })}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.idx)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aprobar/Rechazar */}
      {showApproveModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                showApproveModal.action === 'approve' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {showApproveModal.action === 'approve' ? (
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {showApproveModal.action === 'approve' ? 'Aprobar' : 'Rechazar'} Reserva
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {showApproveModal.action === 'approve' 
                    ? '¿Estás seguro de que quieres aprobar esta reserva?'
                    : '¿Estás seguro de que quieres rechazar esta reserva?'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowApproveModal({ show: false, idx: null, action: null })}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApproveReject(showApproveModal.idx, showApproveModal.action)}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  showApproveModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {showApproveModal.action === 'approve' ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
