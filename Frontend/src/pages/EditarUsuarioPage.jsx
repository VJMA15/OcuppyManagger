import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, User, Building2, CreditCard, Mail, ArrowLeft, UserPlus, CheckCircle, AlertCircle, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import usersService from '@/services/users';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    cc: "",
    email: "",
    role: "instructor",
    telefono: "",
    documento: "",
    activo: true
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const response = await usersService.getUserById(id);
        if (response.success) {
          const user = response.user;
          setForm({
            nombre: user.nombre || "",
            cc: user.cc || "",
            email: user.email || "",
            role: user.role || "instructor",
            telefono: user.telefono || "",
            documento: user.documento || "",
            activo: user.activo !== undefined ? user.activo : true
          });
        } else {
          setError(response.error || "Error al cargar el usuario");
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError("Error de conexión con el servidor");
      } finally {
        setLoadingUser(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar mensajes al cambiar campos
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Mapear 'role' a 'rol' para que coincida con el backend
      const userData = {
        ...form,
        rol: form.role
      };
      delete userData.role;
      
      const response = await usersService.updateUser(id, userData);
      
      if (response.success) {
        setSuccess("Usuario actualizado exitosamente");
        setTimeout(() => {
          navigate('/dashboard/gestion-usuarios');
        }, 2000);
      } else {
        setError(response.error || "Error al actualizar el usuario");
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: "Administrador",
      instructor: "Instructor",
      guardia: "Guardia",
      estudiante: "Estudiante",
      usuario: "Usuario"
    };
    return roles[role] || role;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sena-soft-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Cargando usuario...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/gestion-usuarios')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Editar Usuario
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Modifica la información del usuario en el sistema
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-sena-soft-500 to-sena-soft-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Información del Usuario
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Actualiza los datos del usuario
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre y Cédula */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
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
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                        placeholder="Ingresa la C.C"
                        required
                        pattern="[0-9]{8,12}"
                        title="La cédula debe tener entre 8 y 12 dígitos"
                      />
                    </div>
                  </div>
                </div>

                {/* Email y Rol */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      required
                    >
                      <option value="instructor">Instructor</option>
                      <option value="admin">Administrador</option>
                      <option value="guardia">Guardia</option>
                      <option value="estudiante">Estudiante</option>
                      <option value="usuario">Usuario</option>
                    </select>
                  </div>
                </div>

                {/* Teléfono y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Teléfono (Opcional)
                    </label>
                    <input
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
                      placeholder="Ingresa el teléfono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Estado del Usuario
                    </label>
                    <div className="flex items-center space-x-3 pt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={form.activo}
                          onChange={handleChange}
                          className="rounded border-slate-300 text-sena-soft-500 focus:ring-sena-soft-500"
                        />
                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                          Usuario activo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/gestion-usuarios')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-sena-soft-500 to-sena-soft-600 hover:from-sena-soft-600 hover:to-sena-soft-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Actualizando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Actualizar Usuario
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}