import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/theme-context";
import { AuthProvider, useAuthContext } from "./contexts/auth-context";
import { ReservasProvider } from "./contexts/ReservasContext";
import { useAutoCompleteReservations } from "./hooks/useAutoCompleteReservations";
import { useReportGeneration } from "./hooks/useReportGeneration";

// Importar páginas
import LandingPage from "./pages/LandingPage";
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import RequireAdmin from "./routes/RequireAdmin";
import ReservaPage from './pages/ReservaPage';
import AmbientesPage from './pages/AmbientesPage';
import VerReservasPage from './pages/VerReservasPage';
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegistrarUsuarioPage from "./pages/RegistrarUsuarioPage";
import GestionUsuariosPage from "./pages/GestionUsuariosPage";
import EditarUsuarioPage from "./pages/EditarUsuarioPage";
import RegistrosPage from "./pages/RegistrosPage";
import BitacoraPage from "./pages/BitacoraPage";
import EntregasPage from "./pages/EntregasPage";
import ReportesPage from "./pages/admin/ReportesPage";

// Nuevo componente para usuarios no admin
import UserLayout from "./routes/UserLayout";
import AmbientesMainPage from "./pages/AmbientesMainPage";
import AmbienteDetailPage from "./pages/AmbienteDetailPage";

// Importar las nuevas páginas
import InstructorAmbientesPage from "./pages/InstructorAmbientesPage";
import GuardiaAmbientesPage from "./pages/guardia/GuardiaAmbientesPage";
import MisReservasPage from "./pages/MisReservasPage";
import CrearReservaPage from "./pages/CrearReservaPage";

// Importar páginas de guardia
import GuardiaLayout from "./layouts/GuardiaLayout";
import MonitoreoPage from "./pages/guardia/MonitoreoPage";
import IncidentesPage from "./pages/guardia/IncidentesPage";
import AccesosPage from "./pages/guardia/AccesosPage";
import ReservasPage from "./pages/guardia/ReservasPage";

// Importar InstructorLayout
import InstructorLayout from "./layouts/InstructorLayout";

// Importar componente de timeout de sesión
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";

// Importar página de autenticación requerida
import AuthRequiredPage from "./pages/AuthRequiredPage";

function AppContent() {
  const { isAuthenticated, user } = useAuthContext();
  const location = useLocation();
  
  // Hooks para funcionalidades automáticas
  useAutoCompleteReservations();
  useReportGeneration();

  // Verificar roles
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const isGuardia = user?.role === 'guardia';
  
  // Verificar si es modo guest
  const isGuestMode = location.search.includes('mode=guest');
  
  return (
    <>
    <Routes>
      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Ruta de login actualizada */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" : 
              isInstructor ? "/instructor" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      
      {/* Ruta para errores de autenticación */}
      <Route path="/auth-required" element={<AuthRequiredPage />} />
      

      
      {/* Rutas para ADMIN - Corregidas */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated && isAdmin ? (
            <RequireAdmin>
              <Layout />
            </RequireAdmin>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Rutas hijas que se renderizan en <Outlet /> */}
        <Route index element={<DashboardPage />} />
        <Route path="reserva" element={<ReservaPage />} />
        <Route path="ver-reservas" element={<VerReservasPage />} />
        <Route path="ambientes" element={<AmbientesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="registrar-usuario" element={<RegistrarUsuarioPage />} />
        <Route path="gestion-usuarios" element={<GestionUsuariosPage />} />
        <Route path="usuarios/:id/editar" element={<EditarUsuarioPage />} />
        <Route path="mis-reservas" element={<MisReservasPage />} />
        <Route path="registros" element={<RegistrosPage />} />
        <Route path="bitacora" element={<BitacoraPage />} />
        <Route path="entregas" element={<EntregasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
      
      {/* Rutas para INSTRUCTORES - Modificadas para usar InstructorLayout */}
      <Route
        path="/instructor/*"
        element={
          isAuthenticated && isInstructor ? (
            <InstructorLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="ambientes" replace />} />
        <Route path="ambientes" element={<InstructorAmbientesPage />} />
        <Route path="mis-reservas" element={<MisReservasPage />} />
        <Route path="crear-reserva" element={<CrearReservaPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
      
      {/* Rutas para GUARDIAS - Usando GuardiaLayout */}
      <Route
        path="/guardia/*"
        element={
          isAuthenticated && isGuardia ? (
            <GuardiaLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="monitoreo" replace />} />
        <Route path="monitoreo" element={<MonitoreoPage />} />
        <Route path="incidentes" element={<IncidentesPage />} />
        <Route path="accesos" element={<AccesosPage />} />
        <Route path="reservas" element={<ReservasPage />} />
        <Route path="ambientes" element={<GuardiaAmbientesPage />} />
        <Route path="entregas" element={<EntregasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
      
      {/* Rutas para USUARIOS NORMALES y GUEST */}
      <Route
        path="/ambientes/*"
        element={
          isAuthenticated && !isAdmin && !isInstructor && !isGuardia ? (
            <UserLayout>
              <Routes>
                <Route index element={<AmbientesMainPage />} />
                <Route path=":id" element={<AmbienteDetailPage />} />
              </Routes>
            </UserLayout>
          ) : isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" :
              isInstructor ? "/instructor" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : isGuestMode ? (
            // Permitir acceso guest sin autenticación
            <Routes>
              <Route index element={<AmbientesMainPage />} />
            </Routes>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Redirección por defecto */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" :
              isInstructor ? "/instructor" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
    
    {/* Componente global de advertencia de timeout de sesión */}
    {isAuthenticated && <SessionTimeoutWarning />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ReservasProvider>
            <AppContent />
          </ReservasProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;