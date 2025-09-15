import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const GuardiaContext = createContext();

export const useGuardia = () => {
  const context = useContext(GuardiaContext);
  if (!context) {
    throw new Error('useGuardia debe ser usado dentro de GuardiaProvider');
  }
  return context;
};

const GuardiaProvider = ({ children }) => {
  const [monitoreoData, setMonitoreoData] = useState({
    ambientes: [],
    alertas: [],
    estadisticas: {
      ocupados: 0,
      disponibles: 0,
      mantenimiento: 0,
      alertasActivas: 0
    },
    filtros: { searchTerm: '', filterEstado: 'todos' },
    loading: false
  });

  const [incidentesData, setIncidentesData] = useState({
    incidentes: [],
    filtros: { searchTerm: '', filterStatus: 'todos' },
    loading: false
  });

  const [accesosData, setAccesosData] = useState({
    accesos: [],
    filtros: { searchTerm: '', filterTipo: 'todos', filterEstado: 'todos' },
    loading: false
  });

  const [reservasData, setReservasData] = useState({
    reservas: [],
    filtros: { searchTerm: '', filterEstado: 'activas', filterTipo: 'todos' },
    loading: false
  });

  const updateMonitoreoData = useCallback((newData) => {
    setMonitoreoData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateIncidentesData = useCallback((newData) => {
    setIncidentesData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateAccesosData = useCallback((newData) => {
    setAccesosData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateReservasData = useCallback((newData) => {
    setReservasData(prev => ({ ...prev, ...newData }));
  }, []);

  const clearAllData = useCallback(() => {
    setMonitoreoData({
      ambientes: [],
      alertas: [],
      estadisticas: { ocupados: 0, disponibles: 0, mantenimiento: 0, alertasActivas: 0 },
      filtros: { searchTerm: '', filterEstado: 'todos' },
      loading: false
    });
    setIncidentesData({
      incidentes: [],
      filtros: { searchTerm: '', filterStatus: 'todos' },
      loading: false
    });
    setAccesosData({
      accesos: [],
      filtros: { searchTerm: '', filterTipo: 'todos', filterEstado: 'todos' },
      loading: false
    });
    setReservasData({
      reservas: [],
      filtros: { searchTerm: '', filterEstado: 'activas', filterTipo: 'todos' },
      loading: false
    });
  }, []);

  const value = {
    monitoreoData,
    incidentesData,
    accesosData,
    reservasData,
    updateMonitoreoData,
    updateIncidentesData,
    updateAccesosData,
    updateReservasData,
    clearAllData
  };

  return (
    <GuardiaContext.Provider value={value}>
      {children}
    </GuardiaContext.Provider>
  );
};

GuardiaProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { GuardiaProvider };
export default GuardiaProvider;