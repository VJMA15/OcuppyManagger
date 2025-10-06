import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";

export default function RequireAdmin({ children, requireAdmin = true }) {
  const { user, isAuthenticated, logout } = useAuthContext();
  
  // Solo verificar si está autenticado (sin verificaciones de consistencia)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar rol de admin si es requerido
  if (requireAdmin && user?.role !== 'admin' && user?.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos de administrador</p>
          <button 
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }
  
  return children;
}
