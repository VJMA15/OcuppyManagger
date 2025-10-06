import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/theme-context';
import { AuthProvider } from './contexts/auth-context';
import { useAuthContext } from './contexts/auth-context';

// Layouts
import Layout from './routes/layout';
import { ReservasProvider } from '@/contexts/ReservasContext';
import InstructorLayout from './layouts/InstructorLayout';
import GuardiaLayout from './layouts/GuardiaLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './routes/dashboard/page';
import ReservaPage from './pages/ReservaPage';
import VerReservasPage from './pages/VerReservasPage';
import MisReservasPage from './pages/MisReservasPage';
import CrearReservaPage from './pages/CrearReservaPage';
import AmbientesPage from './pages/AmbientesPage';
import AmbientesMainPage from './pages/AmbientesMainPage';
import AmbienteDetailPage from './pages/AmbienteDetailPage';
import ReportsPage from './pages/ReportsPage';
import RegistrarUsuarioPage from './pages/RegistrarUsuarioPage';
import EditarUsuarioPage from './pages/EditarUsuarioPage';
import GestionUsuariosPage from './pages/GestionUsuariosPage';
import RegistrosPage from './pages/RegistrosPage';
import BitacoraPage from './pages/BitacoraPage';
import EntregasPage from './pages/EntregasPage';

// Instructor Pages
import InstructorReservaPage from './pages/InstructorReservaPage';
import InstructorAmbientesPage from './pages/InstructorAmbientesPage';

// Guardia Pages
import MonitoreoPage from './pages/guardia/MonitoreoPage';
import ReservasGuardiaPage from './pages/guardia/ReservasPage';
import IncidentesPage from './pages/guardia/IncidentesPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect authenticated users */}
      {isAuthenticated && (
        <Route path="/login" element={
          <Navigate to={
            user?.role === 'admin' ? '/dashboard' :
            user?.role === 'instructor' ? '/instructor' :
            user?.role === 'guardia' ? '/guardia' :
            '/ambientes'
          } replace />
        } />
      )}

      {/* Admin Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ReservasProvider>
            <Layout>
              <DashboardPage />
            </Layout>
          </ReservasProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ReservasProvider>
            <Layout>
              <Routes>
                <Route path="reserva" element={<ReservaPage />} />
                <Route path="ver-reservas" element={<VerReservasPage />} />
                <Route path="mis-reservas" element={<MisReservasPage />} />
                <Route path="crear-reserva" element={<CrearReservaPage />} />
                <Route path="ambientes" element={<AmbientesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="registrar-usuario" element={<RegistrarUsuarioPage />} />
                <Route path="editar-usuario/:id" element={<EditarUsuarioPage />} />
                <Route path="gestion-usuarios" element={<GestionUsuariosPage />} />
                <Route path="registros" element={<RegistrosPage />} />
                <Route path="bitacora" element={<BitacoraPage />} />
                <Route path="entregas" element={<EntregasPage />} />
              </Routes>
            </Layout>
          </ReservasProvider>
        </ProtectedRoute>
      } />

      {/* Instructor Routes */}
      <Route path="/instructor" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <InstructorLayout>
            <InstructorAmbientesPage />
          </InstructorLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/instructor/*" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <InstructorLayout>
            <Routes>
              <Route path="ambientes" element={<InstructorAmbientesPage />} />
              <Route path="nueva-reserva" element={<InstructorReservaPage />} />
              <Route path="mis-reservas" element={<MisReservasPage />} />
            </Routes>
          </InstructorLayout>
        </ProtectedRoute>
      } />

      {/* Guardia Routes */}
      <Route path="/guardia" element={
        <ProtectedRoute allowedRoles={['guardia']}>
          <GuardiaLayout>
            <MonitoreoPage />
          </GuardiaLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/guardia/*" element={
        <ProtectedRoute allowedRoles={['guardia']}>
          <GuardiaLayout>
            <Routes>
              <Route path="monitoreo" element={<MonitoreoPage />} />
              <Route path="reservas" element={<ReservasGuardiaPage />} />
              <Route path="incidentes" element={<IncidentesPage />} />
            </Routes>
          </GuardiaLayout>
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/ambientes" element={
        <ProtectedRoute>
          <AmbientesMainPage />
        </ProtectedRoute>
      } />
      
      <Route path="/ambientes/:id" element={
        <ProtectedRoute>
          <AmbienteDetailPage />
        </ProtectedRoute>
      } />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso No Autorizado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;