import { useAuthContext } from '../../contexts/auth-context';

function AccesosPage() {
  const { user } = useAuthContext();

  if (!user || user.rol !== 'guardia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center border border-slate-200 dark:border-slate-700 shadow-lg">
          <h2 className="text-slate-900 dark:text-white text-2xl font-bold mb-4">
            Acceso Restringido
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base mb-6">
            Solo el personal de guardia puede acceder a esta página
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg border-0 text-base font-medium cursor-pointer transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Control de Accesos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Monitoreo en tiempo real de accesos al centro
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-semibold">✓</span>
            </div>
            <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Accesos Permitidos</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">15</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-semibold">✕</span>
            </div>
            <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Accesos Denegados</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-semibold">#</span>
            </div>
            <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Total de Accesos</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">18</p>
          </div>
        </div>
        
        {/* Lista de accesos recientes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white m-0">
              Actividad Reciente
            </h2>
          </div>
          
          <div className="p-0">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500 dark:text-slate-400 text-base">👤</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium m-0">Juan Pérez</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs m-0">Aula 203 • Hace 5 min</p>
                </div>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded uppercase tracking-wide">
                Permitido
              </span>
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500 dark:text-slate-400 text-base">👤</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium m-0">María García</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs m-0">Laboratorio • Hace 12 min</p>
                </div>
              </div>
              <span className="text-red-600 dark:text-red-400 font-semibold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded uppercase tracking-wide">
                Denegado
              </span>
            </div>
            
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500 dark:text-slate-400 text-base">👤</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium m-0">Carlos López</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs m-0">Oficina • Hace 18 min</p>
                </div>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded uppercase tracking-wide">
                Permitido
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer con timestamp */}
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm m-0">
            Última actualización: {new Date().toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccesosPage;
