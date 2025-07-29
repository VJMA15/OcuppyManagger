import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import logoSena from '@/assets/logo-sena.png';

export default function Login() {
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Credenciales simples (puedes cambiarlas en el futuro)
  const adminUser = "admin";
  const adminPass = "admin123";

  // Log del estado inicial
  console.log('Estado inicial del formulario:', form);
  console.log('Credenciales esperadas:', { adminUser, adminPass });

  const handleChange = e => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    console.log('Campo cambiado:', e.target.name, 'Valor:', e.target.value);
    console.log('Nuevo estado del formulario:', newForm);
    setForm(newForm);
    if (error) setError(""); // Limpiar error cuando el usuario escribe
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    // Logs de depuración
    console.log('Valores del formulario:', form);
    console.log('Usuario ingresado:', form.usuario);
    console.log('Contraseña ingresada:', form.password);
    console.log('Usuario esperado:', adminUser);
    console.log('Contraseña esperada:', adminPass);
    console.log('¿Usuario coincide?', form.usuario === adminUser);
    console.log('¿Contraseña coincide?', form.password === adminPass);
    
    // Verificación simplificada
    const usuarioCorrecto = form.usuario === adminUser;
    const passwordCorrecto = form.password === adminPass;
    
    console.log('Usuario correcto:', usuarioCorrecto);
    console.log('Password correcto:', passwordCorrecto);
    
    if (usuarioCorrecto && passwordCorrecto) {
      console.log('✅ Autenticación exitosa');
      login(); // Usar la función del contexto
    } else {
      console.log('❌ Autenticación fallida');
      console.log('Razón: Usuario correcto =', usuarioCorrecto, ', Password correcto =', passwordCorrecto);
      setError("Usuario o contraseña incorrectos");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sena/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sena/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-sena to-sena-dark rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <img src={logoSena} alt="SENA" className="w-5 h-5 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Occupy Manager
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Sistema de Gestión de Ambientes
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="usuario"
                  value={form.usuario}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Ingresa tu usuario"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sena to-sena-dark text-white font-semibold py-3 px-4 rounded-xl hover:from-sena-dark hover:to-sena focus:ring-2 focus:ring-sena focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

            {/* Botón de prueba - siempre funciona */}
            <button
              type="button"
              onClick={() => {
                console.log('🔧 Botón de prueba clickeado');
                login();
              }}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 mt-2"
            >
              🔧 Login de Prueba (Siempre funciona)
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2024 SENA - Sistema de Gestión de Ambientes
            </p>
          </div>
        </div>

        {/* Información de credenciales para desarrollo */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Credenciales de Desarrollo
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Usuario:</strong> admin</p>
                <p><strong>Contraseña:</strong> admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
