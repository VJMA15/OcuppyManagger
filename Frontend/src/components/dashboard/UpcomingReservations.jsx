import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock as ClockIcon, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { normalizeStatus, translateStatus } from "@/utils/reservasUtils";

const UpcomingReservations = ({ reservations, loading = false }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const filtered = (reservations || []).filter(r => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            r.nombre?.toLowerCase().includes(q) ||
            r.ambiente?.toLowerCase().includes(q)
        );
    });

    const getEstadoStyles = (estadoRaw) => {
        const estado = normalizeStatus(estadoRaw);
        switch (estado) {
            case 'APPROVED':
            case 'ACTIVE':
            case 'IN_PROCESS':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
            case 'PENDING':
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300';
        }
    };

    const capitalizar = (texto) => {
        if (!texto) return '';
        const lower = texto.toString().toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reservas Próximas</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Próximas reservas programadas
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/dashboard/ver-reservas')}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                            Ver todas
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/crear-reserva')}
                            className="px-4 py-2 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors text-sm font-medium"
                        >
                            Nueva Reserva
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <div className="mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filtrar por nombre o ambiente..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 animate-pulse">
                                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-600 rounded" />
                            </div>
                        ))
                    ) : filtered.length > 0 ? (
                        filtered.map((r, idx) => {
                            const statusColors = [
                                "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
                                "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                                "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20",
                                "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            ];
                            const color = statusColors[idx % statusColors.length];
                            
                            const jornadaRaw = (r.jornada || r.hora || '').toString();
                            const jornadaLower = jornadaRaw.toLowerCase();
                            const mostrarJornada = ['mañana', 'tarde', 'noche'].includes(jornadaLower);

                            return (
                                <div key={idx} className={`border-l-4 ${color} rounded-lg p-4 hover:shadow-md transition-all duration-200`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{r.nombre}</h3>
                                                {r.estado && (
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getEstadoStyles(r.estado)}`}>
                                                        {translateStatus(normalizeStatus(r.estado))}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Building2 size={14} />
                                                    {r.ambiente}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon size={14} />
                                                    {r.fecha}
                                                </span>
                                                {mostrarJornada && (
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon size={14} />
                                                        {capitalizar(jornadaLower)}
                                                    </span>
                                                )}
                                            </div>
                                            {r.motivo && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Motivo:</span> {r.motivo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <CalendarIcon size={48} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No hay reservas próximas</h3>
                            <p className="text-sm text-center">No se han programado reservas para las próximas horas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

UpcomingReservations.propTypes = {
    reservations: PropTypes.arrayOf(PropTypes.shape({
        nombre: PropTypes.string.isRequired,
        documento: PropTypes.string,
        ambiente: PropTypes.string.isRequired,
        fecha: PropTypes.string.isRequired,
        hora: PropTypes.string,
        estado: PropTypes.string,
        motivo: PropTypes.string
    })).isRequired,
    loading: PropTypes.bool
};

export default UpcomingReservations;