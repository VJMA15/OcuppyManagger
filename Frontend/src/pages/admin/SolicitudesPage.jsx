import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Search, Calendar, Users, FileText } from 'lucide-react';
import solicitudesService from '@/services/solicitudesService';
import realtime from '@/services/realtime';
import { useAuthContext } from '@/contexts/auth-context';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal, Textarea } from '@/components/ui';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';

const formatDate = (value) => {
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch (_) {
    return String(value);
  }
};

export default function SolicitudesPage() {
  const { user } = useAuthContext();

  const [filters, setFilters] = useState({
    status: 'todos',
    search: '',
    startDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [stats, setStats] = useState(null);

  // Estado para modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Información insuficiente');
  const [rejectingId, setRejectingId] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {};
      if (filters.status && filters.status !== 'todos') apiFilters.status = filters.status;
      if (filters.search) apiFilters.search = filters.search;
      if (filters.startDate) apiFilters.startDate = filters.startDate;
      const data = await solicitudesService.getSolicitudes(apiFilters);
      setSolicitudes(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : (data?.data?.items || []));
      const s = await solicitudesService.getEstadisticas();
      setStats(s?.data || s);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suscripción SSE para refrescar lista y estadísticas cuando cambian solicitudes
  useEffect(() => {
    realtime.connect({ channels: ['solicitudes'] });
    const onSolicitudesChanged = () => {
      fetchData();
    };
    realtime.on('solicitudes.changed', onSolicitudesChanged);
    return () => {
      realtime.off('solicitudes.changed', onSolicitudesChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar resultados automáticamente al cambiar filtros (con debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const aprobar = async (id) => {
    if (!window.confirm('¿Aprobar esta solicitud y crear usuario?')) return;
    setLoading(true);
    try {
      await solicitudesService.approveSolicitud(id);
      await fetchData();
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
      setError(err.message || 'Error al aprobar solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de rechazo con mejor diseño
  const rechazar = (id) => {
    setRejectingId(id);
    setRejectReason('Información insuficiente');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    setIsRejecting(true);
    try {
      await solicitudesService.rejectSolicitud(rejectingId, rejectReason || '');
      await fetchData();
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('Información insuficiente');
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setError(err.message || 'Error al rechazar solicitud');
    } finally {
      setIsRejecting(false);
    }
  };

  const total = useMemo(() => solicitudes.length, [solicitudes]);

  // Resolver estadísticas: aceptar claves en singular del backend y
  // hacer fallback a conteo local desde la lista en caso de ausencia
  const resolvedStats = useMemo(() => {
    const counts = { pendientes: 0, aprobadas: 0, rechazadas: 0 };
    for (const s of solicitudes) {
      if (s.status === 'pendiente') counts.pendientes++;
      else if (s.status === 'aprobada') counts.aprobadas++;
      else if (s.status === 'rechazada') counts.rechazadas++;
    }
    const api = stats || {};
    return {
      pendientes: (api.pendientes ?? api.pendiente ?? counts.pendientes) || 0,
      aprobadas: (api.aprobadas ?? api.aprobada ?? counts.aprobadas) || 0,
      rechazadas: (api.rechazadas ?? api.rechazada ?? counts.rechazadas) || 0,
    };
  }, [solicitudes, stats]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Solicitudes</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestión de solicitudes de acceso al sistema</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
              <Input
                placeholder="Nombre, documento o email"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Fecha inicio</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ status: 'todos', search: '', startDate: '' })}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Pendientes</CardTitle>
          </CardHeader>
          <CardContent><span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{resolvedStats.pendientes}</span></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Aprobadas</CardTitle>
          </CardHeader>
        <CardContent><span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{resolvedStats.aprobadas}</span></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent><span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{resolvedStats.rechazadas}</span></CardContent>
        </Card>
      </div>

      {/* Tabla de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Solicitudes ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2 text-gray-600 dark:text-gray-200">Nombre</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Documento</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Email</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Rol</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Centro</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Estado</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Creada</th>
                  <th className="p-2 text-gray-600 dark:text-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s._id || s.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2 text-gray-700 dark:text-gray-200">{s.fullName}</td>
                    <td className="p-2 text-gray-700 dark:text-gray-200">{s.documentNumber}</td>
                    <td className="p-2 text-gray-700 dark:text-gray-200">{s.email}</td>
                    <td className="p-2 text-gray-700 dark:text-gray-200">{s.requestedRole}</td>
                    <td className="p-2 text-gray-700 dark:text-gray-200">{s.trainingCenter}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs border ${
                        s.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                        s.status === 'aprobada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-700 dark:text-gray-200">{formatDate(s.createdAt)}</td>
                    <td className="p-2">
                      {s.status === 'pendiente' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => aprobar(s._id || s.id)} className="bg-green-600 hover:bg-green-700">
                            Aprobar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rechazar(s._id || s.id)}>
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {solicitudes.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-500 dark:text-gray-400" colSpan={8}>No hay solicitudes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de rechazo */}
      <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rechazar solicitud" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-medium">Vas a rechazar esta solicitud.</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Puedes indicar un motivo para notificar al solicitante.</p>
            </div>
          </div>

          <Textarea
            label="Motivo del rechazo (opcional)"
            placeholder="Ej.: Información insuficiente"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Se enviará una notificación con este motivo.</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={isRejecting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmReject} disabled={isRejecting}>
                {isRejecting ? 'Rechazando…' : 'Rechazar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}