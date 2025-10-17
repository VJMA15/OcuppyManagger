import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAdmin from "@/routes/RequireAdmin";
import AdminLayout from "@/layouts/AdminLayout";
import { ReservasProvider } from "@/contexts/ReservasContext";

// Páginas del admin - usando las páginas existentes
import DashboardPage from "@/routes/dashboard/page";
import ReservaPage from "@/pages/ReservaPage";
import VerReservasPage from "@/pages/VerReservasPage";
import AmbientesPage from "@/pages/AmbientesPage";
import ReportesPage from "@/pages/admin/ReportesPage";
import HistorialReservasPage from "@/pages/admin/HistorialReservasPage";
import SettingsPage from "@/pages/SettingsPage";
import RegistrarUsuarioPage from "@/pages/RegistrarUsuarioPage";
import GestionUsuariosPage from "@/pages/GestionUsuariosPage";
import EditarUsuarioPage from "@/pages/EditarUsuarioPage";
import MisReservasPage from "@/pages/MisReservasPage";
import SolicitudesPage from "@/pages/admin/SolicitudesPage";
import RegistrosUsuariosPage from "@/pages/RegistrosUsuariosPage";

// Hooks específicos del admin
import { useAutoCompleteReservations } from "@/hooks/useAutoCompleteReservations";
import { useReportGeneration } from "@/hooks/useReportGeneration";

const AdminContent = () => {
  // Solo cargar hooks del admin cuando esté en el módulo admin
  useAutoCompleteReservations();
  useReportGeneration();

  return (
    <RequireAdmin>
      <ReservasProvider>
        <AdminLayout>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reserva" element={<ReservaPage />} />
            <Route path="ver-reservas" element={<VerReservasPage />} />
            <Route path="mis-reservas" element={<MisReservasPage />} />
            <Route path="ambientes" element={<AmbientesPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="historial" element={<HistorialReservasPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="registrar-usuario" element={<RegistrarUsuarioPage />} />
            <Route path="gestion-usuarios" element={<GestionUsuariosPage />} />
            <Route path="usuarios/:id/editar" element={<EditarUsuarioPage />} />
            <Route path="registros-usuarios" element={<RegistrosUsuariosPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AdminLayout>
      </ReservasProvider>
    </RequireAdmin>
  );
};

const AdminModule = () => {
  return (
    <AdminContent />
  );
};

export default AdminModule;