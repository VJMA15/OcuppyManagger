import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useReservasContext } from '@/contexts/ReservasContext';
import { useAmbientes } from '@/hooks/useAmbientes';
import { normalizeStatus as normalizeReservaStatus } from '@/utils/reservasUtils';

// Utilidad: obtener jornada a partir de diferentes campos
const getJornadaFromReserva = (reserva) => {
  const raw = (reserva?.jornada || '').toLowerCase();
  if (raw === 'mañana' || raw === 'tarde' || raw === 'noche') return raw;

  const pickHour = () => {
    try {
      if (reserva?.horaInicio) {
        return parseInt(String(reserva.horaInicio).split(':')[0], 10);
      }
      if (reserva?.hora) {
        return parseInt(String(reserva.hora).split(':')[0], 10);
      }
      if (reserva?.startDate) {
        const d = new Date(reserva.startDate);
        if (!isNaN(d)) return d.getHours();
      }
    } catch (_) {}
    return null;
  };

  const h = pickHour();
  if (typeof h === 'number') {
    if (h >= 6 && h < 12) return 'mañana';
    if (h >= 12 && h < 18) return 'tarde';
    return 'noche';
  }
  return '';
};

// Utilidad: obtener fecha base (YYYY-MM-DD)
const getFechaFromReserva = (reserva) => {
  const base = reserva?.startDate || reserva?.reservationDate || reserva?.fecha;
  if (!base) return null;
  try {
    const d = new Date(base);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch (_) {
    return null;
  }
};

// Utilidad: obtener ID de ambiente desde diferentes estructuras
const getEnvironmentId = (reserva) => {
  return (
    reserva?.environmentId ||
    reserva?.ambiente?.id ||
    reserva?.ambiente // en datos antiguos podría ser un ID directo
  );
};

// Generar matriz de calendario (6 semanas, 7 días)
const buildMonthMatrix = (year, month /* 0-based */) => {
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay(); // 0=Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Relleno anterior (días del mes anterior)
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < startWeekDay; i++) {
    const day = prevMonthDays - (startWeekDay - 1 - i);
    const d = new Date(year, month - 1, day);
    cells.push({ date: d, inMonth: false });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  // Relleno posterior
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }

  // Asegurar 6 filas (42 celdas)
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }

  return cells;
};

const monthNames = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const weekNames = ['D','L','M','X','J','V','S'];

const CalendarWidget = () => {
  const { reservas } = useReservasContext();
  const { ambientes, loading: loadingAmbientes } = useAmbientes();

  const [selectedAmbienteId, setSelectedAmbienteId] = useState('');
  const [selectedJornada, setSelectedJornada] = useState(''); // '' = todas
  const [cursorDate, setCursorDate] = useState(() => new Date());

  // Preseleccionar el primer ambiente cuando la lista esté disponible
  useEffect(() => {
    if (!loadingAmbientes && Array.isArray(ambientes) && ambientes.length > 0 && !selectedAmbienteId) {
      const first = ambientes[0];
      setSelectedAmbienteId(first._id || first.id || '');
    }
  }, [ambientes, loadingAmbientes, selectedAmbienteId]);

  const { occupiedSet, year, month, matrix } = useMemo(() => {
    const y = cursorDate.getFullYear();
    const m = cursorDate.getMonth();
    const mat = buildMonthMatrix(y, m);

    const occ = new Set();
    if (Array.isArray(reservas) && selectedAmbienteId) {
      reservas.forEach((r) => {
        const status = normalizeReservaStatus(r.status ?? r.estado);
        if (status !== 'APPROVED') return;
        const envId = String(getEnvironmentId(r) || '');
        if (!envId || envId !== String(selectedAmbienteId)) return;
        const j = getJornadaFromReserva(r);
        if (selectedJornada && j !== selectedJornada) return;
        const f = getFechaFromReserva(r);
        if (!f) return;
        const d = new Date(f);
        if (isNaN(d)) return;
        if (d.getFullYear() === y && d.getMonth() === m) {
          occ.add(f);
        }
      });
    }
    return { occupiedSet: occ, year: y, month: m, matrix: mat };
  }, [reservas, selectedAmbienteId, selectedJornada, cursorDate]);

  const goPrevMonth = () => {
    const d = new Date(cursorDate);
    d.setMonth(d.getMonth() - 1);
    setCursorDate(d);
  };
  const goNextMonth = () => {
    const d = new Date(cursorDate);
    d.setMonth(d.getMonth() + 1);
    setCursorDate(d);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Calendario de ocupación</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{monthNames[month]} {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrevMonth} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goNextMonth} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Ambiente</label>
          <select
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            value={selectedAmbienteId}
            onChange={(e) => setSelectedAmbienteId(e.target.value)}
          >
            {loadingAmbientes && <option>Cargando...</option>}
            {!loadingAmbientes && Array.isArray(ambientes) && ambientes.map(a => (
              <option key={a._id || a.id} value={a._id || a.id}>
                {a.nombre || a.name || 'Ambiente'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Jornada</label>
          <select
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>
        <div className="flex items-end">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span> Reservas aprobadas</span>
          </div>
        </div>
      </div>

      {/* Cabecera de semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekNames.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">{w}</div>
        ))}
      </div>

      {/* Celdas del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {matrix.map((cell, idx) => {
          const d = cell.date;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const key = `${y}-${m}-${day}`;
          const occupied = cell.inMonth && occupiedSet.has(key);
          return (
            <div
              key={key + idx}
              className={`relative p-2 rounded-md border text-center ${cell.inMonth ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' : 'border-transparent bg-transparent'} ${occupied ? 'ring-2 ring-red-500/60' : ''}`}
            >
              <span className={`text-sm ${cell.inMonth ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{d.getDate()}</span>
              {occupied && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;