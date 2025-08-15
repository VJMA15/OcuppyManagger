import { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import { useAmbientes } from "@/hooks/useAmbientes";
import { Building2, Users, AlertTriangle, CheckCircle, Search, Filter, Activity } from "lucide-react";
import { cn } from "@/utils/cn";

export const MonitoreoPage = () => {
    const { ambientes, loading, error } = useAmbientes();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos");

    // Filtrar ambientes
    const ambientesFiltrados = ambientes.filter(ambiente => {
        const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ambiente.codigo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterEstado === "todos" || ambiente.estado === filterEstado;
        return matchesSearch && matchesFilter;
    });

    // Calcular estadísticas
    const totalAmbientes = ambientes.length;
    const ambientesDisponibles = ambientes.filter(a => a.estado === "disponible").length;
    const ambientesOcupados = ambientes.filter(a => a.estado === "ocupado").length;
    const ambientesMantenimiento = ambientes.filter(a => a.estado === "mantenimiento").length;

    const statsCards = [
        {
            title: "Total Ambientes",
            value: totalAmbientes,
            icon: Building2,
            color: "blue",
            subtitle: "Ambientes registrados"
        },
        {
            title: "Disponibles",
            value: ambientesDisponibles,
            icon: CheckCircle,
            color: "green",
            subtitle: "Listos para usar"
        },
        {
            title: "Ocupados",
            value: ambientesOcupados,
            icon: Users,
            color: "orange",
            subtitle: "En uso actualmente"
        },
        {
            title: "Mantenimiento",
            value: ambientesMantenimiento,
            icon: AlertTriangle,
            color: "red",
            subtitle: "Requieren atención"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-sena-500 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-sena-300 animate-ping mx-auto"></div>
                    </div>
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Cargando panel de monitoreo...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Obteniendo datos en tiempo real</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error de Conexión</h3>
                    <p className="text-red-600 dark:text-red-300">No se pudieron cargar los datos: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header mejorado con gradiente */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative p-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-sena-500 to-sena-600 rounded-xl shadow-lg">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                        Centro de Monitoreo
                                    </h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                                        Supervisión en tiempo real de todos los ambientes
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700 shadow-sm">
                            <div className="relative">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <div className="text-sm">
                                <div className="font-semibold text-green-700 dark:text-green-300">Sistema Operativo</div>
                                <div className="text-green-600 dark:text-green-400 text-xs">Última actualización: hace 2 min</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas con diseño mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className="transform hover:scale-105 transition-all duration-300">
                        <StatsCard {...stat} />
                    </div>
                ))}
            </div>

            {/* Panel de filtros rediseñado */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros de Búsqueda
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código del ambiente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sena-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-slate-400 transition-all duration-200"
                            />
                        </div>
                        <div className="lg:w-64">
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sena-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all duration-200"
                            >
                                <option value="todos">📊 Todos los estados</option>
                                <option value="disponible">✅ Disponible</option>
                                <option value="ocupado">👥 Ocupado</option>
                                <option value="mantenimiento">⚠️ Mantenimiento</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de ambientes con diseño de tarjetas mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ambientesFiltrados.map((ambiente) => (
                    <div
                        key={ambiente._id}
                        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                        {/* Header de la tarjeta */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-600">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-sena-600 dark:group-hover:text-sena-400 transition-colors">
                                        {ambiente.nombre}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                        {ambiente.codigo}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm",
                                    ambiente.estado === "disponible" 
                                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-300 dark:border-green-700"
                                        : ambiente.estado === "ocupado"
                                        ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-300 dark:border-orange-700"
                                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 dark:from-red-900/40 dark:to-rose-900/40 dark:text-red-300 dark:border-red-700"
                                )}>
                                    {ambiente.estado}
                                </span>
                            </div>
                        </div>
                        
                        {/* Contenido de la tarjeta */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-400">Capacidad</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-400">Ubicación</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {ambiente.capacidad} personas
                                    </div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">
                                        {ambiente.ubicacion}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Tipo de ambiente</span>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                        {ambiente.tipo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado vacío mejorado */}
            {ambientesFiltrados.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Building2 size={48} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No se encontraron ambientes
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Intenta ajustar los filtros de búsqueda o verifica que existan ambientes registrados en el sistema.
                    </p>
                </div>
            )}
        </div>
    );
};