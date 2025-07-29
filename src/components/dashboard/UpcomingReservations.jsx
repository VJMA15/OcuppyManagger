import React from "react";
import { Calendar as CalendarIcon, Clock as ClockIcon, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const UpcomingReservations = ({ reservations }) => {
    const navigate = useNavigate();

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
                    <button 
                        onClick={() => navigate('/reserva')}
                        className="px-4 py-2 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors text-sm font-medium"
                    >
                        Nueva Reserva
                    </button>
                </div>
            </div>
            
            <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {reservations.length > 0 ? (
                        reservations.map((r, idx) => {
                            const statusColors = [
                                "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
                                "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                                "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20",
                                "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            ];
                            const color = statusColors[idx % statusColors.length];
                            
                            return (
                                <div key={idx} className={`border-l-4 ${color} rounded-lg p-4 hover:shadow-md transition-all duration-200`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{r.nombre}</h3>
                                                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-300">
                                                    {r.documento}
                                                </span>
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
                                                <span className="flex items-center gap-1">
                                                    <ClockIcon size={14} />
                                                    {r.hora}
                                                </span>
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
        documento: PropTypes.string.isRequired,
        ambiente: PropTypes.string.isRequired,
        fecha: PropTypes.string.isRequired,
        hora: PropTypes.string.isRequired,
        motivo: PropTypes.string
    })).isRequired
};

export default UpcomingReservations; 