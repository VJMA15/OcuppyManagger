import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Building2, CreditCard, Mail, ArrowLeft, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usersService from '@/services/users';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default function RegistrarUsuarioPage() {
  const [form, setForm] = useState({
    nombre: "",
    cc: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "instructor"
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
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError("La contraseña debe contener al menos una mayúscula, una minúscula y un número");
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
      const response = await usersService.createUser({
        nombre: form.nombre,
        cc: form.cc,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        role: form.role
      });
      
      if (response.success) {
        setSuccess(response.message || "Usuario registrado exitosamente.");
      } else {
        throw new Error(response.error || "Error al registrar usuario");
      }
      setForm({
        nombre: "",
        cc: "",
        email: "",
        password: "",
        passwordConfirm: "",
        role: "instructor"
      });
      
    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError(err.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Registrar Nuevo Usuario
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Crea una nueva cuenta de usuario en el sistema
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-dark text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Información del Usuario</CardTitle>
                <CardDescription className="text-white/80">
                  Completa todos los campos para crear la cuenta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            {/* Mensajes de estado */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Ingresa el nombre completo"
                      required
                    />
                  </div>
                </div>

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
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Ingresa la C.C"
                      required
                      pattern="[0-9]{8,12}"
                      title="La cédula debe tener entre 8 y 12 dígitos"
                    />
                  </div>
                </div>
              </div>

              {/* Email y Rol */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Ingresa el correo electrónico"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Rol del Usuario
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrador</option>
                    <option value="guardia">Guardia de Seguridad</option>
                  </select>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      className="w-full pl-10 pr-12 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Ingresa la contraseña"
                      required
                      minLength="6"
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
                      className="w-full pl-10 pr-12 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Confirma la contraseña"
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
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary/50 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Registrar Usuario
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}