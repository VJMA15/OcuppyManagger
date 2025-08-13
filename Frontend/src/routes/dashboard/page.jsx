import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, CreditCard, Package, TrendingUp, CalendarIcon, Building2, Clock, XCircle } from "lucide-react";

import { overviewData } from "@/constants";
import { Footer } from "@/layouts/footer";


// Componentes
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingReservations from "@/components/dashboard/UpcomingReservations";
import ActivityChart from "@/components/dashboard/ActivityChart";

// Hooks
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUpcomingReservations } from "@/hooks/useUpcomingReservations";

const DashboardPage = () => {
    const navigate = useNavigate();
    const {
        disponibles,
        ocupados,
        ambientes,
        reservas,
        reservasPendientes,
        reservasAprobadas,
        reservasRechazadas,
        reservasActivas,
        ambientesOcupados
    } = useDashboardStats();
    
    // ✅ CORRECTO: Hook dentro del componente
    const { upcomingReservations, loading: loadingReservations } = useUpcomingReservations();

    // Configuración de colores para las tarjetas
    const cardConfigs = [
        {
            title: "Disponibles",
            value: disponibles,
            icon: CheckCircle,
            color: {
                bg: "bg-emerald-100 dark:bg-emerald-900/30",
                icon: "text-emerald-600 dark:text-emerald-400",
                text: "text-emerald-600 dark:text-emerald-400"
            },
            subtitle: `De ${ambientes} ambientes totales`,
            onClick: () => navigate('/ambientes')
        },
        {
            title: "Ocupados",
            value: ambientesOcupados.length,
            icon: AlertCircle,
            color: {
                bg: "bg-red-100 dark:bg-red-900/30",
                icon: "text-red-600 dark:text-red-400",
                text: "text-red-600 dark:text-red-400"
            },
            subtitle: "Ambientes ocupados actualmente",
            onClick: () => navigate('/ambientes?filter=ocupados')
        },
        {
            title: "Pendientes",
            value: reservasPendientes,
            icon: Clock,
            color: {
                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                icon: "text-yellow-600 dark:text-yellow-400",
                text: "text-yellow-600 dark:text-yellow-400"
            },
            subtitle: "Esperando aprobación",
            onClick: () => navigate('/ver-reservas')
        },
        {
            title: "Aprobadas",
            value: reservasAprobadas,
            icon: CheckCircle,
            color: {
                bg: "bg-green-100 dark:bg-green-900/30",
                icon: "text-green-600 dark:text-green-400",
                text: "text-green-600 dark:text-green-400"
            },
            subtitle: "Reservas confirmadas",
            onClick: () => navigate('/ver-reservas')
        }
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header del Dashboard */}
            <DashboardHeader />

            {/* Botones de prueba para desarrollo */}


            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cardConfigs.map((config, index) => (
                    <StatsCard
                        key={index}
                        title={config.title}
                        value={config.value}
                        icon={config.icon}
                        color={config.color}
                        subtitle={config.subtitle}
                        onClick={config.onClick}
                    />
                ))}
            </div>

            {/* Estadísticas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reservas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{reservas}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <span>Total registradas</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ambientes</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{ambientes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                        <span>Gestionar equipos</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rechazadas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{reservasRechazadas}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <span>Reservas rechazadas</span>
                    </div>
                </div>
            </div>

            {/* Sección de Ambientes Ocupados */}
            {ocupados > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ambientes Ocupados</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {ocupados} ambiente{ocupados !== 1 ? 's' : ''} actualmente en uso
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/ambientes?filter=ocupados')}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        >
                            Ver Ambientes Ocupados
                        </button>
                    </div>
                    
                    {/* Lista de ambientes ocupados */}
                    <div className="space-y-3">
                        {ambientesOcupados.map((ambiente, index) => (
                            <div key={ambiente.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{ambiente.nombre}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {ambiente.tipo} • {ambiente.capacidad} personas
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                        OCUPADO
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <p className="text-sm text-red-700 dark:text-red-300">
                            ⚠️ Estos ambientes no están disponibles para nuevas reservas hasta que terminen las reservas actuales.
                        </p>
                    </div>
                </div>
            )}

            {/* Sección de Reservas Próximas */}
            <UpcomingReservations reservations={upcomingReservations || []} />

            {/* Gráfico de Actividad */}
            <ActivityChart data={overviewData} />

            <Footer />
        </div>
    );
};

export default DashboardPage;
