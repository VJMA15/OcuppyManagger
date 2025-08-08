import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";

export default function RequireAdmin({ children }) {
  const { isAuthenticated, user } = useAuthContext();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  // Verificar tanto el contexto como el localStorage
  if (!isAuthenticated || !isAdmin) {
    // Limpiar datos inconsistentes
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
