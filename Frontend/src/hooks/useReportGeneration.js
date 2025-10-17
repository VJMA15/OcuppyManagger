import { useEffect, useState, useCallback } from 'react';

// Función helper para convertir hora a jornada
const getJornadaFromHora = (hora) => {
  if (!hora) return 'N/A';
  const horaNum = parseInt(hora.split(':')[0]);
  if (horaNum >= 6 && horaNum < 12) return 'Mañana';
  if (horaNum >= 12 && horaNum < 18) return 'Tarde';
  return 'Noche';
};

export const useReportGeneration = () => {
  const [reports, setReports] = useState([]);

  // Generar informe automático cuando una reserva se completa
  const generateReport = useCallback((reserva) => {
    const report = {
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      ambiente: reserva.ambiente,
      usuario: {
        nombre: reserva.nombre,
        documento: reserva.documento
      },
      fechaReserva: reserva.fecha,
      jornada: getJornadaFromHora(reserva.hora),
      duracion: reserva.duracion || 6,
      estado: reserva.estado,
      motivo: reserva.motivo,
      aprobadaPor: reserva.aprobadaPor,
      fechaAprobacion: reserva.fechaAprobacion,
      fechaCompletacion: new Date().toISOString(),
      tipo: 'completada'
    };

    // Guardar en localStorage
    const reportsGuardados = JSON.parse(localStorage.getItem('reports') || '[]');
    const nuevosReports = [...reportsGuardados, report];
    localStorage.setItem('reports', JSON.stringify(nuevosReports));
    
    // Actualizar estado
    setReports(nuevosReports);
    
    return report;
  }, []);

  // Generar informe de reserva cancelada
  const generateCancellationReport = useCallback((reserva) => {
    const report = {
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      ambiente: reserva.ambiente,
      usuario: {
        nombre: reserva.nombre,
        documento: reserva.documento
      },
      fechaReserva: reserva.fecha,
      jornada: getJornadaFromHora(reserva.hora),
      duracion: reserva.duracion || 6,
      estado: 'cancelada',
      motivo: reserva.motivo,
      motivoCancelacion: reserva.motivoCancelacion,
      aprobadaPor: reserva.aprobadaPor,
      fechaAprobacion: reserva.fechaAprobacion,
      fechaCancelacion: new Date().toISOString(),
      tipo: 'cancelada'
    };

    const reportsGuardados = JSON.parse(localStorage.getItem('reports') || '[]');
    const nuevosReports = [...reportsGuardados, report];
    localStorage.setItem('reports', JSON.stringify(nuevosReports));
    
    setReports(nuevosReports);
    return report;
  }, []);

  // Generar informe de reserva rechazada
  const generateRejectionReport = useCallback((reserva) => {
    const report = {
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      ambiente: reserva.ambiente,
      usuario: {
        nombre: reserva.nombre,
        documento: reserva.documento
      },
      fechaReserva: reserva.fecha,
      jornada: getJornadaFromHora(reserva.hora),
      duracion: reserva.duracion || 6,
      estado: 'rechazada',
      motivo: reserva.motivo,
      fechaRechazo: new Date().toISOString(),
      tipo: 'rechazada'
    };

    // Guardar en localStorage
    const reportsGuardados = JSON.parse(localStorage.getItem('reports') || '[]');
    const nuevosReports = [...reportsGuardados, report];
    localStorage.setItem('reports', JSON.stringify(nuevosReports));
    
    setReports(nuevosReports);
    return report;
  }, []);

  // Cargar informes existentes
  useEffect(() => {
    const reportsGuardados = localStorage.getItem('reports');
    if (reportsGuardados) {
      try {
        setReports(JSON.parse(reportsGuardados));
      } catch {
        setReports([]);
      }
    }
  }, []);

  // Escuchar eventos de reservas para generar informes automáticamente
  useEffect(() => {
    const handleReservaCompleted = (event) => {
      if (event.detail && event.detail.reserva) {
        generateReport(event.detail.reserva);
      }
    };

    const handleReservaCancelled = (event) => {
      if (event.detail && event.detail.reserva) {
        generateCancellationReport(event.detail.reserva);
      }
    };

    const handleReservaRejected = (event) => {
      if (event.detail && event.detail.reserva) {
        generateRejectionReport(event.detail.reserva);
      }
    };

    window.addEventListener('reserva-completed', handleReservaCompleted);
    window.addEventListener('reserva-cancelled', handleReservaCancelled);
    window.addEventListener('reserva-rejected', handleReservaRejected);

    return () => {
      window.removeEventListener('reserva-completed', handleReservaCompleted);
      window.removeEventListener('reserva-cancelled', handleReservaCancelled);
      window.removeEventListener('reserva-rejected', handleReservaRejected);
    };
  }, [generateReport, generateCancellationReport, generateRejectionReport]);

  // Función para eliminar un informe individual
  const deleteReport = (reportId) => {
    const reportsGuardados = JSON.parse(localStorage.getItem('reports') || '[]');
    const nuevosReports = reportsGuardados.filter(report => report.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(nuevosReports));
    setReports(nuevosReports);
  };

  // Función para eliminar múltiples informes
  const deleteMultipleReports = (reportIds) => {
    const reportsGuardados = JSON.parse(localStorage.getItem('reports') || '[]');
    const nuevosReports = reportsGuardados.filter(report => !reportIds.includes(report.id));
    localStorage.setItem('reports', JSON.stringify(nuevosReports));
    setReports(nuevosReports);
  };

  return {
    reports,
    generateReport,
    generateCancellationReport,
    generateRejectionReport,
    deleteReport,
    deleteMultipleReports
  };
};