import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Eye, CheckCircle, XCircle, X, Building2, Star } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { guestOcupaciones } from '../mock/guestOcupaciones';
import { Modal } from '../components/ui';
import api from '../services/api';

const AmbientesMainPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ambientes, loading, error } = useAmbientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Filtros específicos para modo invitado
  const [guestDate, setGuestDate] = useState('');
  const [guestJornada, setGuestJornada] = useState('');
  const [guestOccupiedMap, setGuestOccupiedMap] = useState(new Map());
  
  // Detectar si está en modo guest
  const isGuestMode = searchParams.get('mode') === 'guest';

  // Fuente de datos: siempre usar lista real del backend
  const ambientesSource = ambientes;

  // Filtrar ambientes
  let filteredAmbientes = ambientesSource.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || ambiente.tipo === filterType;
    const matchesStatus = isGuestMode ? true : (filterStatus === '' || ambiente.estado === filterStatus);
    return matchesSearch && matchesType && matchesStatus;
  });

  // En modo invitado: si hay fecha y jornada, mostrar solo ocupados en ese momento
  const isAmbienteOcupadoGuest = (id, dateStr, jornada) => {
    if (!dateStr || !jornada) return true; // sin selección, no limitar
    const d = new Date(dateStr);
    if (isNaN(d)) return true;
    const dow = d.getDay(); // 0=Domingo ... 6=Sábado
    const rules = guestOcupaciones[id];
    if (!rules) return false;
    const jornadasDia = rules[dow] || rules['*'] || [];
    return Array.isArray(jornadasDia) && jornadasDia.includes(jornada);
  };

  // Ya no filtramos la lista en modo invitado; solo etiquetamos disponibilidad

  // Cargar disponibilidad real desde backend para cada ambiente mostrado (guest)
  useEffect(() => {
    const fetchAvailabilityForAll = async () => {
      try {
        if (!isGuestMode || !guestDate || !guestJornada || !Array.isArray(ambientesSource) || ambientesSource.length === 0) {
          setGuestOccupiedMap(new Map());
          return;
        }
        const envIds = ambientesSource.map(a => a._id || a.id).filter(Boolean);
        const results = await Promise.allSettled(
          envIds.map(async (id) => {
            const params = new URLSearchParams({ environmentId: String(id), date: guestDate });
            const resp = await api.get(`/api/v1/reservas/availability?${params.toString()}`);
            const data = resp?.data || resp;
            const occupied = Boolean(data?.[guestJornada] || data?.fullyOccupied);
            return { id, occupied };
          })
        );
        const map = new Map();
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            map.set(r.value.id, r.value.occupied);
          }
        });
        // Fallback al mock para IDs sin respuesta
        envIds.forEach((id) => {
          if (!map.has(id)) {
            map.set(id, isAmbienteOcupadoGuest(id, guestDate, guestJornada));
          }
        });
        setGuestOccupiedMap(map);
      } catch (e) {
        // Si falla el backend, usar únicamente el mock
        const map = new Map();
        if (Array.isArray(ambientesSource)) {
          ambientesSource.forEach((a) => {
            const id = a._id || a.id;
            if (id) {
              map.set(id, isAmbienteOcupadoGuest(id, guestDate, guestJornada));
            }
          });
        }
        setGuestOccupiedMap(map);
      }
    };
    fetchAvailabilityForAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuestMode, guestDate, guestJornada, ambientesSource]);

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(ambientesSource.map(ambiente => ambiente.tipo))];

  const handleAmbienteClick = (ambiente) => {
    if (isGuestMode) {
      setSelectedAmbiente(ambiente);
      setShowModal(true);
    } else {
      navigate(`/ambientes/${ambiente._id}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAmbiente(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sena border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando ambientes...</p>
        </div>
      </div>
    );
  }

  if (error && !isGuestMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-red-200">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Error al cargar ambientes</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Guest Mode Header */}
      {isGuestMode && (
        <div className="bg-white text-slate-900 py-12 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 text-sena px-6 py-3 rounded-full mb-6">
                <Building2 className="w-6 h-6 text-sena" />
                <span className="font-semibold text-lg text-sena">Vista de Invitado</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Ambientes y Disponibilidad</h1>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Consulta información esencial de los ambientes de formación y su disponibilidad.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
              >
                ← Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className={`${isGuestMode ? 'pt-12' : 'pt-12'} px-6 pb-12`}>
        <div className="max-w-7xl mx-auto">
          {/* Header para usuarios autenticados */}
          {!isGuestMode && (
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg">
                <Building2 className="w-6 h-6 text-sena" />
                <span className="font-semibold text-sena">Gestión de Ambientes</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Ambientes Disponibles</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">Gestiona y reserva los ambientes de la institución de manera eficiente</p>
            </div>
          )}

          {/* Filtros y búsqueda mejorados */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Barra de búsqueda mejorada */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ambientes por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-sena/20 focus:border-sena transition-all duration-200 text-lg placeholder-slate-400"
                />
              </div>
              
              {/* Filtros mejorados */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="select-input px-6 py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 text-lg"
                >
                  <option value="">Todos los tipos</option>
                  {tiposUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                
                {!isGuestMode && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select-input px-6 py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 text-lg"
                  >
                    <option value="">Todos los estados</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                )}
              </div>
            </div>

            {/* Controles compactos de fecha y jornadas (Guest) */}
            {isGuestMode && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={guestDate}
                    onChange={(e) => setGuestDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-sena/20 focus:border-sena text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-2">Jornada</label>
                  <div className="flex flex-wrap gap-2">
                    {['mañana','tarde','noche'].map(j => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setGuestJornada(j)}
                        className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sena/30 ${guestJornada === j ? 'bg-sena-soft-500 text-white border-transparent hover:bg-sena-soft-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {j.charAt(0).toUpperCase() + j.slice(1)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGuestJornada('')}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sena/30 ${guestJornada === '' ? 'bg-sena-soft-500 text-white border-transparent hover:bg-sena-soft-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      Todas
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Estadísticas rápidas */}
            {!isGuestMode && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-sena">{filteredAmbientes.length}</p>
                  <p className="text-slate-600">Ambientes encontrados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{filteredAmbientes.filter(a => a.estado === 'Disponible').length}</p>
                  <p className="text-slate-600">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{tiposUnicos.length}</p>
                  <p className="text-slate-600">Tipos diferentes</p>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Grid de ambientes mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAmbientes.map((ambiente) => (
              isGuestMode ? (
                <div
                  key={ambiente._id}
                  className="bg-white/95 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col cursor-pointer"
                  onClick={() => handleAmbienteClick(ambiente)}
                >
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-800 truncate">
                        {ambiente.nombre}
                      </h3>
                      {/* Chip de disponibilidad dinámico (fecha+jornada) */}
                      {isGuestMode && guestDate && guestJornada && (() => {
                        const id = ambiente._id || ambiente.id;
                        const flag = guestOccupiedMap.get(id);
                        const ocupado = typeof flag === 'boolean' ? flag : isAmbienteOcupadoGuest(id, guestDate, guestJornada);
                        return ocupado ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium border text-red-700 bg-red-50 border-red-200">
                            Ocupado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium border text-sena bg-green-50 border-green-200">
                            Disponible
                          </span>
                        );
                      })()}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm truncate">{ambiente.ubicacion}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 min-h-[84px] flex flex-col items-center justify-center text-center">
                        <Users className="w-5 h-5 text-sena mb-1" />
                        <p className="text-xl font-semibold text-slate-800">{ambiente.capacidad}</p>
                        <p className="text-xs text-slate-500">Capacidad</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 min-h-[84px] flex flex-col items-center justify-center text-center">
                        <Filter className="w-5 h-5 text-sena mb-1" />
                        <p className="text-base font-medium text-slate-800">{ambiente.tipo}</p>
                        <p className="text-xs text-slate-500">Tipo</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-200">
                    <button
                      className="w-full bg-sena text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-sena-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sena/30"
                      onClick={(e) => { e.stopPropagation(); handleAmbienteClick(ambiente); }}
                    >
                      <Eye className="w-5 h-5" />
                      Ver información
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={ambiente._id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleAmbienteClick(ambiente)}
                >
                  {/* Header de la tarjeta con gradiente */}
                  <div className={`p-6 bg-gradient-to-r ${
                    ambiente.estado === 'Disponible' 
                      ? 'from-green-500 to-emerald-600' 
                      : ambiente.estado === 'Ocupado'
                      ? 'from-red-500 to-rose-600'
                                          : 'from-green-600 to-green-700'
                  } text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold leading-tight">
                          {ambiente.nombre}
                        </h3>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                          {ambiente.estado}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{ambiente.ubicacion}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{ambiente.capacidad}</p>
                        <p className="text-sm text-slate-600">personas</p>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Filter className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-slate-900">{ambiente.tipo}</p>
                        <p className="text-sm text-slate-600">tipo</p>
                      </div>
                    </div>
                    
                  {/* Servicios destacados - oculto en modo invitado para mantener consistencia visual */}
                  {!isGuestMode && ambiente.servicios && ambiente.servicios.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-2">Servicios destacados:</p>
                      <div className="flex flex-wrap gap-2">
                        {ambiente.servicios.slice(0, 3).map((servicio, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                            {servicio}
                          </span>
                        ))}
                        {ambiente.servicios.length > 3 && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-medium">
                            +{ambiente.servicios.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                    
                    <button
                      className="w-full bg-gradient-to-r from-sena to-sena-soft-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                      onClick={(e) => { e.stopPropagation(); handleAmbienteClick(ambiente); }}
                    >
                      <Eye className="w-5 h-5" />
                      {isGuestMode ? 'Ver Información Completa' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
          
          {/* Mensaje cuando no hay resultados */}
          {filteredAmbientes.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron ambientes</h3>
                <p className="text-slate-600">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal formal para guest mode */}
      {isGuestMode && selectedAmbiente && (
        <Modal
          show={showModal}
          onClose={handleCloseModal}
          title="Información del Ambiente"
          size="xl"
          variant="light"
        >
          <div className="space-y-8">
            {/* Header del modal con estilo formal y acento único */}
            <div className="rounded-xl p-6 bg-white text-slate-900 border border-slate-200">
              <h2 className="text-3xl font-bold mb-3">
                {selectedAmbiente.nombre}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-2 bg-green-50 border border-green-200 text-sena px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4 text-sena" />
                  {selectedAmbiente.ubicacion}
                </span>
                <span className="flex items-center gap-2 bg-green-50 border border-green-200 text-sena px-3 py-1 rounded-full">
                  <Filter className="w-4 h-4 text-sena" />
                  {selectedAmbiente.tipo}
                </span>
                {isGuestMode && guestDate && guestJornada ? (
                  (() => {
                    const id = selectedAmbiente._id || selectedAmbiente.id;
                    const flag = guestOccupiedMap.get(id);
                    const ocupado = typeof flag === 'boolean' ? flag : isAmbienteOcupadoGuest(id, guestDate, guestJornada);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${
                        ocupado
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-green-200 bg-green-50 text-sena'
                      }`}>
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          ocupado ? 'bg-red-500' : 'bg-sena'
                        }`} />
                        {ocupado ? 'Ocupado' : 'Disponible'}
                      </span>
                    );
                  })()
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-green-200 bg-green-50 text-sena flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      selectedAmbiente.estado === 'Disponible'
                        ? 'bg-sena'
                        : selectedAmbiente.estado === 'Ocupado'
                        ? 'bg-red-500'
                        : 'bg-amber-400'
                    }`} />
                    {selectedAmbiente.estado}
                  </span>
                )}
              </div>
            </div>
            
            {/* Información principal en tarjetas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Capacidad */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 min-h-[120px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-sena rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Capacidad</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {selectedAmbiente.capacidad}
                </p>
                <p className="text-slate-600 text-sm mt-1">personas máximo</p>
              </div>
              
              {/* Estado del ambiente */}
              <div className="rounded-xl p-6 border min-h-[120px] bg-white border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg bg-sena`}>
                    {selectedAmbiente.estado === 'Disponible' ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <XCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h3 className={`font-semibold text-slate-900`}>Estado</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    selectedAmbiente.estado === 'Disponible' 
                      ? 'bg-sena' 
                      : selectedAmbiente.estado === 'Ocupado'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }`} />
                  {selectedAmbiente.estado}
                </p>
                <p className={`text-sm mt-1 text-slate-600`}>
                  {selectedAmbiente.estado === 'Disponible' ? 'Listo para reservar' : 'No disponible'}
                </p>
              </div>
              
              {/* Tipo de ambiente */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 min-h-[120px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-sena rounded-lg">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Tipo</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedAmbiente.tipo}
                </p>
                <p className="text-slate-600 text-sm mt-1">de ambiente</p>
              </div>
            </div>
            
            {/* Descripción */}
            {selectedAmbiente.descripcion && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 text-lg">Descripción</h3>
                <p className="text-slate-700 leading-relaxed">
                  {selectedAmbiente.descripcion}
                </p>
              </div>
            )}
            
            {/* Servicios y Equipos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Servicios */}
              {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 text-lg flex items-center gap-2">
                    <div className="p-2 bg-sena rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Equipos Disponibles
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedAmbiente.servicios.map((servicio, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle className="w-5 h-5 text-sena flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{servicio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Equipos */}
              {selectedAmbiente.equipos && selectedAmbiente.equipos.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 text-lg flex items-center gap-2">
                    <div className="p-2 bg-sena rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Equipos Disponibles
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedAmbiente.equipos.map((equipo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-3 h-3 bg-sena rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">{equipo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mensaje para invitados con estilo neutro y acento único */}
            <div className="rounded-xl p-6 bg-slate-100 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-sky-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl mb-2 text-slate-900">
                    ¿Necesitas reservar este ambiente?
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    Para reservas y funcionalidades completas del sistema, solicita una cuenta de usuario a través de los canales oficiales de la institución.
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">Tip: Contacta al administrador del sistema para obtener acceso completo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AmbientesMainPage;