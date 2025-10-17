import { useEffect, useState } from 'react';
import realtime from '@/services/realtime';
import historialService from '@/services/historial';
import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-700',
    pending: 'bg-purple-100 text-purple-700',
  };
  const cls = map[String(status)] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{String(status).toUpperCase()}</span>;
};

export default function HistorialReservasPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [filtros, setFiltros] = useState({
    status: '',
    q: '',
    startDeletedAt: '',
    endDeletedAt: '',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(''); // 'delete-selected'
  const [targetId, setTargetId] = useState(null);
  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState([]);
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await historialService.obtenerHistorial(filtros);
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Suscripción SSE para refrescar historial en tiempo real
  useEffect(() => {
    realtime.connect({ channels: ['historial'] });
    const onHistorialChanged = () => {
      cargar();
    };
    realtime.on('historial.changed', onHistorialChanged);
    return () => {
      realtime.off('historial.changed', onHistorialChanged);
    };
  }, []);

  const handleChange = (key, val) => setFiltros(prev => ({ ...prev, [key]: val }));
  const handleLimpiar = () => setFiltros({ status: '', q: '', startDeletedAt: '', endDeletedAt: '' });

  // Selección
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(items.map(it => it._id));
  };

  // Eliminar seleccionados
  const askDeleteSelected = () => {
    setConfirmType('delete-selected');
    setConfirmOpen(true);
  };

  const performAction = async () => {
    try {
      if (confirmType === 'delete-selected') {
        if (selectedIds.length === 0) {
          toast.error('No hay registros seleccionados');
          return;
        }
        const ids = [...selectedIds];
        const results = await Promise.allSettled(ids.map(id => historialService.eliminarRegistro(id)));
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.length - successCount;
        if (successCount > 0) toast.success(`${successCount} registro(s) eliminados del historial`);
        if (failureCount > 0) toast.error(`${failureCount} registro(s) no pudieron eliminarse`);
        // limpiar selección de los que se eliminaron (asumimos todos los fulfilled)
        const removed = new Set(ids.filter((_, idx) => results[idx].status === 'fulfilled'));
        setSelectedIds(prev => prev.filter(id => !removed.has(id)));
      }
      setConfirmOpen(false);
      setConfirmType('');
      await cargar();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Error al procesar la acción');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Historial de Reservas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Registros de reservas eliminadas. Solo visible para administradores y guardias.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={askDeleteSelected}
            title="Eliminar definitivamente los registros seleccionados"
            disabled={selectedIds.length === 0}
          >
            Eliminar seleccionados {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Estado</label>
            <select value={filtros.status} onChange={e => handleChange('status', e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              <option value="">Todos</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
              <option value="expired">Expiradas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300">Buscar</label>
            <input value={filtros.q} onChange={e => handleChange('q', e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Ambiente, usuario o eliminador" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Fecha eliminación inicio</label>
            <input type="date" value={filtros.startDeletedAt} onChange={e => handleChange('startDeletedAt', e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Fecha eliminación fin</label>
            <input type="date" value={filtros.endDeletedAt} onChange={e => handleChange('endDeletedAt', e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button onClick={cargar} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Buscar</button>
          <button onClick={handleLimpiar} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Limpiar</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Eliminada</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Jornada</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Inicio</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Fin</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Ambiente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Usuario</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200">Eliminado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">Cargando...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">No hay registros para los filtros seleccionados</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelect(item._id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{new Date(item.deletedAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item.jornada}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{new Date(item.startDate).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{new Date(item.endDate).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item?.environmentId?.nombre || String(item.environmentId)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item?.userId?.nombre || String(item.userId)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item?.deletedBy?.nombre || String(item.deletedBy)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={confirmOpen} onClose={() => setConfirmOpen(false)} title={confirmType === 'delete-selected' ? 'Eliminar seleccionados' : 'Confirmar'}>
        {/* Contenido del modal */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {confirmType === 'delete-selected'
            ? `Esta acción eliminará definitivamente ${selectedIds.length} registro(s) del historial. ¿Deseas continuar?`
            : '¿Deseas continuar?'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={performAction}>Confirmar</Button>
        </div>
      </Modal>
    </div>
  );
}