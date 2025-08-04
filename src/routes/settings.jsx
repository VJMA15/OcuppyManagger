import React, { useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Palette, 
  Building2, 
  Database, 
  LogOut, 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Monitor
} from "lucide-react";

export default function Settings() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  
  // Permite cambiar el tema (oscuro/claro)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  // Permite cambiar el nombre del sistema
  const [systemName, setSystemName] = useState(() => localStorage.getItem("systemName") || "OCCUPY MANAGER");
  // Permite cargar un nuevo logo
  const [logo, setLogo] = useState(() => localStorage.getItem("logoSena") || null);
  // Permite limpiar todos los datos (ambientes, reservas, informes)
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleThemeChange = e => {
    setTheme(e.target.value);
    localStorage.setItem("theme", e.target.value);
    document.documentElement.classList.toggle("dark", e.target.value === "dark");
  };

  const handleSystemNameChange = e => {
    setSystemName(e.target.value);
    localStorage.setItem("systemName", e.target.value);
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setLogo(ev.target.result);
        localStorage.setItem("logoSena", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showRestore, setShowRestore] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem("ambientes");
    localStorage.removeItem("reservas");
    localStorage.removeItem("informes");
    setConfirmClear(false);
    setShowRestore(true);
    // No recargar aún, para dar opción de restaurar
  };

  const handleRestoreData = () => {
    // Datos de ejemplo para ambientes, reservas e informes
    const ambientesEjemplo = [
      { nombre: "Ambiente 101", estado: "Desocupado", equipos: 10 },
      { nombre: "Ambiente 102", estado: "Desocupado", equipos: 8 },
      { nombre: "Ambiente 103", estado: "Desocupado", equipos: 12 },
      { nombre: "Ambiente 104", estado: "Desocupado", equipos: 9 },
    ];
    const reservasEjemplo = [
      { nombre: "Juan Perez", documento: "123456", ambiente: "Ambiente 101", fecha: "2025-07-10", hora: "08:00", motivo: "Clase de informática" },
      { nombre: "Ana Gómez", documento: "654321", ambiente: "Ambiente 102", fecha: "2025-07-11", hora: "10:00", motivo: "Reunión de proyecto" }
    ];
    const informesEjemplo = [
      { turno: "Mañana", responsable: "Pedro Ruiz", fecha: "2025-07-09", equiposEntregados: "10 laptops", equiposRecibidos: "10 laptops", observaciones: "Todo en orden" }
    ];
    localStorage.setItem("ambientes", JSON.stringify(ambientesEjemplo));
    localStorage.setItem("reservas", JSON.stringify(reservasEjemplo));
    localStorage.setItem("informes", JSON.stringify(informesEjemplo));
    setShowRestore(false);
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-sena/10 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-sena" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona las preferencias del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          {/* Sección: Cuenta */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cuenta</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona tu sesión</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Administrador</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">admin@senasoft.com</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Sección: Tema Visual */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tema Visual</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Personaliza la apariencia</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === "light"} 
                    onChange={handleThemeChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    theme === "light" 
                      ? "border-sena bg-sena/5" 
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border-2 border-slate-200 rounded"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Claro</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tema claro</p>
                      </div>
                    </div>
                  </div>
          </label>
                
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === "dark"} 
                    onChange={handleThemeChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    theme === "dark" 
                      ? "border-sena bg-sena/5" 
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Oscuro</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tema oscuro</p>
                      </div>
                    </div>
                  </div>
          </label>
        </div>
      </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          {/* Sección: Identidad del Sistema */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Identidad del Sistema</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Personaliza la marca</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre del sistema
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent transition-all duration-200" 
                  value={systemName} 
                  onChange={handleSystemNameChange} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logo institucional
                </label>
                <div className="space-y-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sena file:text-white hover:file:bg-sena-dark transition-all duration-200"
                  />
                  {logo && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <img src={logo} alt="Logo previsualización" className="w-12 h-12 object-contain" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Logo cargado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Administrar Datos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Administrar Datos</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona la información del sistema</p>
              </div>
            </div>
            
            <div className="space-y-4">
        <button
          onClick={() => setConfirmClear(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 font-medium"
        >
                <Database className="w-5 h-5" />
          Borrar todos los datos
        </button>
              
        {confirmClear && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium mb-3">
                    ¿Seguro que quieres borrar todos los ambientes, reservas e informes? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium" 
                      onClick={handleClearData}
                    >
                      Sí, borrar todo
                    </button>
                    <button 
                      className="px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium" 
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancelar
                    </button>
                  </div>
          </div>
        )}
              
        {showRestore && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-3">
                    Los datos han sido borrados. ¿Quieres restaurar los datos de ejemplo?
                  </p>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" 
                    onClick={handleRestoreData}
                  >
                    Restaurar datos de ejemplo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cerrar Sesión</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">¿Estás seguro de que quieres salir?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sí, cerrar sesión
              </button>
              <button 
                onClick={() => setConfirmLogout(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
