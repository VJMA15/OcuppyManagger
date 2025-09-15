import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import authService from '@/services/auth';
import { AlertCircle, CheckCircle, LogIn, User } from 'lucide-react';

const AuthStatus = () => {
  const { user, isAuthenticated, loading, login } = useAuthContext();
  const [loginForm, setLoginForm] = useState({ cc: '', password: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Si no está autenticado, mostrar el formulario de login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [loading, isAuthenticated]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await login(loginForm);
      if (result.success) {
        setShowLogin(false);
        setLoginForm({ cc: '', password: '' });
      } else {
        setLoginError(result.message || 'Error en el login');
      }
    } catch (error) {
      setLoginError(error.message || 'Error de conexión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
    if (loginError) setLoginError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-blue-700">Verificando autenticación...</span>
      </div>
    );
  }

  if (!isAuthenticated && showLogin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-amber-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Autenticación Requerida</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Para acceder a esta funcionalidad, necesitas iniciar sesión.
        </p>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-1">
              Cédula de Ciudadanía
            </label>
            <input
              type="text"
              id="cc"
              name="cc"
              value={loginForm.cc}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu cédula"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginForm.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {loginError && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
        <div>
          <p className="text-green-800 font-medium">
            Autenticado como: {user.nombre || user.name || 'Usuario'}
          </p>
          <p className="text-green-600 text-sm">
            Rol: {user.role || user.rol || 'Usuario'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
      <div>
        <p className="text-red-800 font-medium">Error de Autenticación</p>
        <p className="text-red-600 text-sm">
          No se pudo verificar tu identidad. Por favor, recarga la página.
        </p>
      </div>
    </div>
  );
};

export default AuthStatus;