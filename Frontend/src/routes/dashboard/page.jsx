// Modern JSX runtime no requiere importar React como default
import { useNavigate } from "react-router-dom";
// import { useState, useMemo } from "react";
import { CheckCircle, CreditCard, Clock, XCircle } from "lucide-react";

import { overviewData } from "@/constants";
import Footer from "@/layouts/footer";


// Componentes
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingReservations from "@/components/dashboard/UpcomingReservations";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
// import ActivityChart from "@/components/dashboard/ActivityChart"; // Eliminado por usar datos ficticios

// Hooks
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUpcomingReservations } from "@/hooks/useUpcomingReservations";

const DashboardPage = () => {
    const navigate = useNavigate();
    const {
        ambientes,
        reservas,
        reservasPendientes,
        reservasAprobadas,
        reservasRechazadas,
    } = useDashboardStats();
    
    // ✅ CORRECTO: Hook dentro del componente
    const { upcomingReservations, loading: loadingReservations } = useUpcomingReservations();

    // Configuración de colores para las tarjetas
    const cardConfigs = [
        {
            title: "Total Ambientes",
            value: ambientes,
            icon: CheckCircle,
            color: {
                bg: "bg-emerald-100 dark:bg-emerald-900/30",
                icon: "text-emerald-600 dark:text-emerald-400",
                text: "text-emerald-600 dark:text-emerald-400"
            },
            subtitle: "Ambientes registrados",
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
            onClick: () => navigate('/admin/ver-reservas?filter=pendiente')
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
            onClick: () => navigate('/admin/ver-reservas?filter=aprobada')
        }
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header del Dashboard */}
            <DashboardHeader />

            {/* Botones de prueba para desarrollo */}


            {/* Filtros de Fecha y Jornada removidos temporalmente */}


            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Estadísticas y Calendario con mejor distribución */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario a la izquierda ocupando dos columnas en pantallas grandes */}
                <div className="lg:col-span-2">
                    <CalendarWidget />
                </div>

                {/* Columna derecha: tarjetas apiladas */}
                <div className="space-y-6">
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

                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => navigate('/admin/ver-reservas?filter=rechazada')}
                    >
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
            </div>

            {/* Sección de Ambientes Ocupados eliminada para simplificar el layout */}

            {/* Sección de Reservas Próximas */}
            <UpcomingReservations reservations={upcomingReservations || []} loading={loadingReservations} />

            {/* Gráfico de Actividad eliminado: usaba datos ficticios */}

            <Footer />
        </div>
    );
};

export default DashboardPage;
