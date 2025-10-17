import { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';

// Utilidades reutilizadas
const getJornadaFromReserva = (reserva) => {
  const raw = (reserva?.jornada || '').toLowerCase();
  if (raw === 'mañana' || raw === 'tarde' || raw === 'noche') return raw;
  try {
    if (reserva?.horaInicio) {
      const h = parseInt(String(reserva.horaInicio).split(':')[0], 10);
      if (h >= 6 && h < 12) return 'mañana';
      if (h >= 12 && h < 18) return 'tarde';
      return 'noche';
    }
    if (reserva?.startDate) {
      const d = new Date(reserva.startDate);
      const h = d.getHours();
      if (h >= 6 && h < 12) return 'mañana';
      if (h >= 12 && h < 18) return 'tarde';
      return 'noche';
    }
  } catch (_) {}
  return '';
};

const getFechaYYYYMMDD = (reserva) => {
  const base = reserva?.startDate || reserva?.reservationDate || reserva?.fecha;
  if (!base) return null;
  const d = new Date(base);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getEnvironmentId = (reserva) => (
  reserva?.environmentId ||
  reserva?.ambiente?.id ||
  reserva?.ambiente ||
  null
);

const buildMonthMatrix = (year, month /* 0-based */) => {
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < startWeekDay; i++) {
    const day = prevMonthDays - (startWeekDay - 1 - i);
    cells.push({ date: new Date(year, month - 1, day), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  return cells;
};

const weekNames = ['D','L','M','X','J','V','S'];

export default function CompactCalendarWidget({ environmentId, jornada = '', rangeDays = 14 }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const matrix = buildMonthMatrix(year, month);

  const [occupiedMap, setOccupiedMap] = useState(() => new Map());

  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const map = new Map();
        if (!environmentId) {
          setOccupiedMap(map);
          return;
        }
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dates = Array.from({ length: rangeDays }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        });
        const environmentIdStr = String(environmentId);
        const results = await Promise.all(
          dates.map(async (dateStr) => {
            const params = new URLSearchParams({ environmentId: environmentIdStr, date: dateStr });
            try {
              const resp = await apiService.get(`/api/v1/reservas/availability?${params.toString()}`);
              const data = resp?.data || resp;
              // Si se especifica jornada, usamos esa; si no, cualquier ocupación
              const occupied = jornada
                ? Boolean(data?.[jornada])
                : Boolean(data?.mañana || data?.tarde || data?.noche || data?.fullyOccupied);
              return occupied ? dateStr : null;
            } catch (_) {
              return null;
            }
          })
        );
        results.filter(Boolean).forEach((ds) => map.set(ds, true));
        setOccupiedMap(map);
      } catch (e) {
        setOccupiedMap(new Map());
      }
    };
    fetchOccupied();
  }, [environmentId, jornada, rangeDays]);

  const occupiedSet = useMemo(() => {
    const set = new Set();
    occupiedMap.forEach((val, key) => {
      if (!val) return;
      const d = new Date(key);
      if (isNaN(d)) return;
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(key);
      }
    });
    return set;
  }, [occupiedMap, year, month]);

  return (
    <div className="pt-1">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekNames.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">{w}</div>
        ))}
      </div>
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
}