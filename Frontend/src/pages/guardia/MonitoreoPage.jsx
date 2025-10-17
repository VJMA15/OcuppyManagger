import { useState, useEffect } from "react";
import { useAmbientes } from "@/hooks/useAmbientes";
import { useGuardia } from "@/contexts/GuardiaContext";
import { 
    Users, 
    AlertTriangle, 
    CheckCircle, 
    Search, 
    Filter, 
    Activity, 
    Building2, 
    MapPin, 
    Clock,
    ArrowRight,
    Calendar,
    User,
    Info,
    AlertCircle,
    Sliders,
    Plus
} from "lucide-react";
import { cn } from "@/utils/cn";

// Componente de tarjeta de estadísticas
const StatsCard = ({ title, value, icon: Icon, color, subtitle, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color.bg} ${color.icon} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className={`text-sm mt-2 ${color.text}`}>
                {subtitle}
            </p>
        </div>
    );
};

const MonitoreoPage = () => {
    const { ambientes, loading, error } = useAmbientes();
    const { monitoreoData, updateMonitoreoData } = useGuardia();
    const [searchTerm, setSearchTerm] = useState(monitoreoData.filtros?.searchTerm || "");
    const [filterEstado, setFilterEstado] = useState(monitoreoData.filtros?.filterEstado || "todos");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Función para manejar clic en ambiente
    const handleAmbienteClick = (ambienteId) => {
        console.log('Ambiente seleccionado:', ambienteId);
        // Aquí se puede agregar navegación o modal de detalles
    };

    // Actualizar contexto cuando cambien los datos
    useEffect(() => {
        if (ambientes.length > 0) {
            updateMonitoreoData({
                ambientes,
                loading,
                filtros: { searchTerm, filterEstado }
            });
        }
    }, [ambientes, loading, searchTerm, filterEstado, updateMonitoreoData]);

    // Restaurar filtros desde el contexto al montar
    useEffect(() => {
        if (monitoreoData.filtros) {
            setSearchTerm(monitoreoData.filtros.searchTerm || "");
            setFilterEstado(monitoreoData.filtros.filterEstado || "todos");
        }
    }, []);

    // Filtrar ambientes
    const ambientesFiltrados = ambientes.filter(ambiente => {
        const matchesSearch = ambiente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ambiente.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
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
            title: "Total de Ambientes",
            value: totalAmbientes,
            icon: Building2,
            color: {
                bg: "bg-slate-50 dark:bg-slate-800/50",
                icon: "text-slate-600 dark:text-slate-400",
                text: "text-slate-600 dark:text-slate-400"
            },
            subtitle: `${totalAmbientes} ambientes registrados en total`
        },
        {
            title: "Disponibles",
            value: ambientesDisponibles,
            icon: CheckCircle,
            color: {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                icon: "text-emerald-600 dark:text-emerald-400",
                text: "text-emerald-600 dark:text-emerald-400"
            },
            subtitle: `${((ambientesDisponibles / totalAmbientes) * 100 || 0).toFixed(0)}% de disponibilidad`
        },
        {
            title: "Ocupados",
            value: ambientesOcupados,
            icon: Users,
            color: {
                bg: "bg-amber-50 dark:bg-amber-900/20",
                icon: "text-amber-600 dark:text-amber-400",
                text: "text-amber-600 dark:text-amber-400"
            },
            subtitle: `${((ambientesOcupados / totalAmbientes) * 100 || 0).toFixed(0)}% de ocupación`
        },
        {
            title: "Mantenimiento",
            value: ambientesMantenimiento,
            icon: AlertTriangle,
            color: {
                bg: "bg-red-50 dark:bg-red-900/20",
                icon: "text-red-600 dark:text-red-400",
                text: "text-red-600 dark:text-red-400"
            },
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
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative p-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
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
                {statsCards.map((stat) => (
                    <div key={stat.title} className="transform hover:scale-105 transition-all duration-300">
                        <StatsCard 
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={typeof stat.color === 'string' ? {
                                bg: `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`,
                                icon: `text-${stat.color}-600 dark:text-${stat.color}-400`,
                                text: `text-${stat.color}-600 dark:text-${stat.color}-400`
                            } : stat.color}
                            subtitle={stat.subtitle}
                        />
                    </div>
                ))}
            </div>

            {/* Lista de ambientes */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Ambientes {filterEstado !== 'todos' ? `(${filterEstado})` : ''}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {ambientesFiltrados.length} {ambientesFiltrados.length === 1 ? 'ambiente encontrado' : 'ambientes encontrados'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Ordenar por:
                        </span>
                        <select className="text-sm bg-transparent border-0 text-ctpga-600 dark:text-ctpga-400 font-medium focus:ring-0 focus:ring-offset-0 p-0">
                            <option>Nombre (A-Z)</option>
                            <option>Estado</option>
                            <option>Capacidad</option>
                        </select>
                    </div>
                </div>

                {ambientesFiltrados.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {ambientesFiltrados.map((ambiente) => {
                            const statusColors = {
                                disponible: {
                                    bg: 'bg-green-100 dark:bg-green-900/20',
                                    text: 'text-green-800 dark:text-green-400',
                                    icon: 'text-green-500',
                                    border: 'border-green-200 dark:border-green-800'
                                },
                                ocupado: {
                                    bg: 'bg-amber-100 dark:bg-amber-900/20',
                                    text: 'text-amber-800 dark:text-amber-400',
                                    icon: 'text-amber-500',
                                    border: 'border-amber-200 dark:border-amber-800'
                                },
                                mantenimiento: {
                                    bg: 'bg-red-100 dark:bg-red-900/20',
                                    text: 'text-red-800 dark:text-red-400',
                                    icon: 'text-red-500',
                                    border: 'border-red-200 dark:border-red-800'
                                }
                            };
                            
                            const status = statusColors[ambiente.estado] || statusColors.disponible;
                            
                            return (
                                <div 
                                    key={`ambiente-${ambiente._id || ambiente.id}`}
                                    className="group p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 cursor-pointer"
                                    onClick={() => handleAmbienteClick(ambiente._id || ambiente.id)}
                                >
                                    <div className="flex items-start">
                                        <div className={`p-3 rounded-lg ${status.bg} ${status.icon} ${status.border} border`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-ctpga-600 dark:group-hover:text-ctpga-400 transition-colors truncate">
                                                    {ambiente.nombre}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border} border`}>
                                                    {ambiente.estado.charAt(0).toUpperCase() + ambiente.estado.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                                {ambiente.codigo}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate">{ambiente.ubicacion || 'Sin ubicación'}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                    <Users className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
                                                    {ambiente.capacidad || '0'} personas
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                    <Clock className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
                                                    Actualizado hace 5 min
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button 
                                                className="text-ctpga-600 hover:text-ctpga-700 dark:text-ctpga-400 dark:hover:text-ctpga-300 p-1 rounded-full hover:bg-ctpga-50 dark:hover:bg-ctpga-900/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAmbienteClick(ambiente._id);
                                                }}
                                                aria-label="Ver detalles"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mb-4">
                            <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                            {searchTerm || filterEstado !== 'todos' ? 'No se encontraron coincidencias' : 'No hay ambientes registrados'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {searchTerm || filterEstado !== 'todos' 
                                ? 'No hay ambientes que coincidan con los criterios de búsqueda. Intenta con otros términos o ajusta los filtros.'
                                : 'Actualmente no hay ambientes registrados en el sistema. Crea un nuevo ambiente para comenzar.'}
                        </p>
                        {searchTerm || filterEstado !== 'todos' ? (
                            <button
                                type="button"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-ctpga-700 bg-ctpga-100 hover:bg-ctpga-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ctpga-500 dark:bg-ctpga-900/30 dark:text-ctpga-200 dark:hover:bg-ctpga-900/40"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterEstado('todos');
                                }}
                            >
                                Limpiar filtros
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ctpga-600 hover:bg-ctpga-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ctpga-500"
                            >
                                <Plus className="-ml-1 mr-2 h-4 w-4" />
                                Agregar ambiente
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoreoPage;