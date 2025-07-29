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
        reservasActivas
    } = useDashboardStats();
    
    const reservasRecientes = useUpcomingReservations();

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
            value: ocupados,
            icon: AlertCircle,
            color: {
                bg: "bg-red-100 dark:bg-red-900/30",
                icon: "text-red-600 dark:text-red-400",
                text: "text-red-600 dark:text-red-400"
            },
            subtitle: "Reservas activas actualmente",
            onClick: () => navigate('/ver-reservas')
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

            {/* Sección de Reservas Próximas */}
            <UpcomingReservations reservations={reservasRecientes} />

            {/* Gráfico de Actividad */}
            <ActivityChart data={overviewData} />

            <Footer />
        </div>
    );
};

export default DashboardPage;
