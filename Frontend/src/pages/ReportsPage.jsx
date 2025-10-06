import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock as ClockIcon 
} from 'lucide-react';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import ReportsContainer from '@/containers/ReportsContainer';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { reports, deleteReport, deleteMultipleReports } = useReportGeneration();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterAmbiente, setFilterAmbiente] = useState("todos");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Get unique environments for filter
  const ambientes = [...new Set(reports.map(r => r.ambiente))];

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.usuario.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ambiente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === "todos" || report.tipo === filterTipo;
    const matchesAmbiente = filterAmbiente === "todos" || report.ambiente === filterAmbiente;
    
    return matchesSearch && matchesTipo && matchesAmbiente;
  });

  // Statistics
  const stats = {
    total: reports.length,
    completadas: reports.filter(r => r.tipo === 'completada').length,
    canceladas: reports.filter(r => r.tipo === 'cancelada').length,
    rechazadas: reports.filter(r => r.tipo === 'rechazada').length,
    ambientes: ambientes.length
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'completada':
        return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'cancelada':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'rechazada':
        return { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      default:
        return { icon: ClockIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  // Event handlers
  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleDeleteReport = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedReports.length > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmDeleteReport = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete.id);
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedReports.length > 0) {
      deleteMultipleReports(selectedReports);
      setSelectedReports([]);
      setShowBulkDeleteModal(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  const handleCloseBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
  };

  return (
    <ReportsContainer
      // Navigation
      navigate={navigate}
      
      // Data
      reports={filteredReports}
      stats={stats}
      ambientes={ambientes}
      
      // Search and filters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterTipo={filterTipo}
      setFilterTipo={setFilterTipo}
      filterAmbiente={filterAmbiente}
      setFilterAmbiente={setFilterAmbiente}
      
      // Selection
      selectedReports={selectedReports}
      handleSelectReport={handleSelectReport}
      handleSelectAll={handleSelectAll}
      
      // Actions
      handleViewDetails={handleViewDetails}
      handleDeleteReport={handleDeleteReport}
      handleBulkDelete={handleBulkDelete}
      
      // Modals
      selectedReport={selectedReport}
      showDetailModal={showDetailModal}
      handleCloseDetailModal={handleCloseDetailModal}
      
      showDeleteModal={showDeleteModal}
      reportToDelete={reportToDelete}
      handleCloseDeleteModal={handleCloseDeleteModal}
      confirmDeleteReport={confirmDeleteReport}
      
      showBulkDeleteModal={showBulkDeleteModal}
      handleCloseBulkDeleteModal={handleCloseBulkDeleteModal}
      confirmBulkDelete={confirmBulkDelete}
      
      // Helper functions
      formatDate={formatDate}
      getTipoIcon={getTipoIcon}
      getTipoText={getTipoText}
    />
  );
};

export default ReportsPage;