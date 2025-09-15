import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Building2, CreditCard, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoSena from '@/assets/logo-sena.png';
import apiService from '@/services/api';

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    cc: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "estudiante"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }
    if (!form.cc.trim()) {
      setError("La cédula de ciudadanía es obligatoria");
      return false;
    }
    if (!/^\d{8,12}$/.test(form.cc)) {
      setError("La cédula debe tener entre 8 y 12 dígitos");
      return false;
    }
    if (!form.email.trim()) {
      setError("El correo electrónico es obligatorio");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Ingrese un correo electrónico válido");
      return false;
    }
    if (!form.password) {
      setError("La contraseña es obligatoria");
      return false;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await apiService.post('/api/v1/auth/signup', {
        nombre: form.nombre,
        cc: form.cc,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        role: form.role
      });
      
      setSuccess("Usuario registrado exitosamente. Puede iniciar sesión ahora.");
      setForm({
        nombre: "",
        cc: "",
        email: "",
        password: "",
        passwordConfirm: "",
        role: "estudiante"
      });
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError(err.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
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
                <img src={logoSena} alt="SENA" className="w-5 h-5 object-contain rounded-full" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Registro de Usuario
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Crea tu cuenta en Occupy Manager
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>
            </div>

            {/* Campo C.C */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cédula de Ciudadanía
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="cc"
                  value={form.cc}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Ingresa tu C.C"
                  required
                  pattern="[0-9]{8,12}"
                  title="La cédula debe tener entre 8 y 12 dígitos"
                />
              </div>
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Ingresa tu correo electrónico"
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

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                  placeholder="Confirma tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Campo Rol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Rol
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
                required
              >
                <option value="estudiante">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrador</option>
              </select>
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

            {/* Mensaje de éxito */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-sena to-sena-dark text-white font-semibold py-3 px-4 rounded-xl hover:from-sena-dark hover:to-sena focus:ring-2 focus:ring-sena focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  "Registrarse"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2024 SENA - Sistema de Gestión de Ambientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}