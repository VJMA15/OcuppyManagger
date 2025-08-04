import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";

export default function RequireAdmin({ children, requireAdmin = true }) {
  const { user, isAuthenticated } = useAuthContext();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Solo verificar rol de admin si se requiere explícitamente
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos de administrador</p>
        </div>
      </div>
    );
  }
  
  return children;
}
