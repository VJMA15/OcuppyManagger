import React from 'react';
import { Eye, EyeOff, Lock, Building2, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoSena from '@/assets/logo-sena.png';

const LoginContainer = ({
  // Form data
  form,
  handleChange,
  
  // Password visibility
  showPassword,
  handleTogglePassword,
  
  // Form submission
  handleSubmit,
  isLoading,
  error,
  
  // Additional actions
  handleTestLogin
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-neutral-soft-50 to-sena-soft-50">
      {/* Decorative background - más suave */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sena-soft-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-neutral-soft-200 p-8">
          {/* Botón de regreso integrado en la tarjeta */}
          <div className="flex justify-start mb-6">
            <button
              onClick={handleBackToHome}
              className="group flex items-center px-3 py-2 text-neutral-soft-600 hover:text-neutral-soft-800 hover:bg-neutral-soft-50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-sm font-medium">Volver</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-sena-soft-400 to-sena-soft-500 rounded-2xl flex items-center justify-center shadow-md">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-neutral-soft-200">
                <img src={logoSena} alt="SENA" className="w-5 h-5 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-soft-800 mb-2">
              Occupy Manager
            </h1>
            <p className="text-neutral-soft-600 text-sm">
              Sistema de Gestión de Ambientes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CC Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-soft-700">
                Cédula de Ciudadanía
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-neutral-soft-400" />
                </div>
                <input
                  name="cc"
                  value={form.cc}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-soft-300 rounded-xl focus:ring-2 focus:ring-sena-soft-400 focus:border-transparent bg-white transition-all duration-200"
                  placeholder="Ingresa tu C.C"
                  autoFocus
                  required
                  pattern="[0-9]{8,12}"
                  title="La cédula debe tener entre 8 y 12 dígitos"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-soft-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-soft-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-soft-300 rounded-xl focus:ring-2 focus:ring-sena-soft-400 focus:border-transparent bg-white transition-all duration-200"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-soft-400 hover:text-neutral-soft-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sena-soft-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-sena-soft-600 focus:ring-2 focus:ring-sena-soft-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {/* Development test button - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={handleTestLogin}
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-600 transition-all duration-200 text-sm"
              >
                🔧 Login de Prueba (Solo Desarrollo)
              </button>
            )}

            {/* Info sobre cuentas */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    ¿No tienes cuenta?
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Las cuentas son creadas únicamente por administradores. 
                    Contacta al administrador de tu institución para solicitar acceso.
                  </p>
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Ver información de contacto →
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-soft-500">
              © 2024 SENA - Sistema de Gestión de Ambientes
            </p>
          </div>
        </div>

        {/* Credenciales de desarrollo - solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Credenciales de Desarrollo
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p><strong>C.C:</strong> 12345678</p>
                  <p><strong>Contraseña:</strong> admin123</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginContainer;