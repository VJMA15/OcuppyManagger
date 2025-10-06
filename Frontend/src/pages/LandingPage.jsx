import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui';
import logoSena from '@/assets/logo-sena.png';
import AccessRequestForm from '@/components/AccessRequestForm';

const LandingPage = () => {
  const navigate = useNavigate();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [showAccessForm, setShowAccessForm] = useState(false);

  const features = [
    {
      icon: Building2,
      title: "Gestión de Ambientes",
      description: "Administra aulas, laboratorios y espacios de manera eficiente"
    },
    {
      icon: Calendar,
      title: "Reservas Inteligentes",
      description: "Sistema de reservas en tiempo real con validación automática"
    },
    {
      icon: Users,
      title: "Control de Acceso",
      description: "Gestión de usuarios por roles: Admin, Instructor, Guardia y Aprendiz"
    },
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description: "Autenticación segura y control de permisos por nivel"
    },
    {
      icon: Clock,
      title: "Tiempo Real",
      description: "Monitoreo en vivo del estado de todos los ambientes"
    },
    {
      icon: CheckCircle,
      title: "Reportes Completos",
      description: "Informes detallados de uso y ocupación de espacios"
    }
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGuestAccess = () => {
    navigate('/ambientes?mode=guest');
  };

  const handleContactAdmin = () => {
    setShowAccessForm(true);
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5">
            {/* Logo y título */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img src={logoSena} alt="SENA" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900">OccupyManager</h1>
                <p className="text-gray-600 text-sm">Sistema de Gestión de Ambientes SENA</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold text-gray-900">OccupyManager</h1>
              </div>
            </div>
            
            {/* Botones Desktop */}
            <div className="hidden lg:flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleGuestAccess}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-colors"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes
              </Button>
              <Button 
                variant="outline" 
                onClick={handleContactAdmin}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-colors"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Solicitar Acceso
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-colors"
              >
                Iniciar Sesión
              </Button>
            </div>

            {/* Botón móvil */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-neutral-soft-200 py-4 space-y-3">
              <Button 
                variant="outline" 
                onClick={handleGuestAccess}
                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 justify-start"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes
              </Button>
              <Button 
                variant="outline" 
                onClick={handleContactAdmin}
                className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-800 justify-start"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Solicitar Acceso
              </Button>
              <Button 
                onClick={handleLogin}
                className="w-full bg-sena-soft-500 text-white hover:bg-sena-soft-600 shadow-md transition-all duration-200 justify-start"
              >
                Iniciar Sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            SENA - Centro de Teleinformática y Producción Industrial
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Gestión Inteligente de
            <span className="block text-green-600 mt-2">Ambientes Educativos</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Optimiza el uso de los espacios educativos del SENA con nuestra plataforma de gestión integral.
            Facilita la reserva, control y monitoreo de ambientes de manera eficiente y segura.
          </p>
          
          {/* Access Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto bg-gray-50 rounded-xl p-6">
            {/* Guest Access for Students */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">Acceso para Aprendices</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Consulta la disponibilidad y horarios de los ambientes de formación 
                sin necesidad de cuenta de usuario.
              </p>
              <Button 
                onClick={handleGuestAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes Disponibles
              </Button>
            </div>

            {/* Account Access */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">Acceso Personal</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Inicia sesión para acceder a todas las funcionalidades del sistema de 
                gestión de ambientes educativos.
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 font-medium"
              >
                Iniciar Sesión
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                ¿No tienes una cuenta?{' '}
                <button 
                  onClick={handleContactAdmin}
                  className="text-green-600 hover:underline font-medium"
                >
                  Solicita acceso
                </button>
              </p>
            </div>
          </div>

          {/* Botones principales responsivos */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-sena-soft-500 text-white hover:bg-sena-soft-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-200 w-full sm:w-auto"
            >
              Acceder al Sistema
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGuestAccess}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200 w-full sm:w-auto"
            >
              <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Modo Consulta
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section Responsivo */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-soft-800 mb-4">
              Características Principales
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-soft-600 max-w-2xl mx-auto px-4">
              Descubre todas las funcionalidades que hacen de OccupyManager 
              la mejor opción para tu institución.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 sm:p-6 border border-gray-200 transition-all duration-200 hover:border-sena-soft-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sena-soft-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-sena-soft-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-neutral-soft-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section Responsivo */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-neutral-soft-50 to-sena-soft-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-soft-800 mb-4">
              Tipos de Acceso
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-soft-600 px-4">
              Diferentes niveles de acceso según el tipo de usuario
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Guest Access */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-blue-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Aprendiz (Guest)</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Acceso de solo lectura para consultar ambientes.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Ver ambientes disponibles</li>
                <li>• Consultar horarios</li>
                <li>• Ver estado en tiempo real</li>
                <li>• Sin necesidad de cuenta</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-neutral-soft-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Guardia</h4>
               <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Control total del sistema, gestión de usuarios y configuración.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Crear/eliminar usuarios</li>
                <li>• Gestionar ambientes</li>
                <li>• Ver todos los reportes</li>
                <li>• Configurar sistema</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-neutral-soft-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Instructor</h4>
               <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Reserva ambientes para clases y actividades académicas.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Reservar ambientes</li>
                <li>• Ver sus reservas</li>
                <li>• Cancelar reservas</li>
                <li>• Reportes básicos</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-neutral-soft-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Coordinador</h4>
               <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Monitorea el acceso y estado de los ambientes.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Ver estado de ambientes</li>
                <li>• Controlar accesos</li>
                <li>• Reportar incidencias</li>
                <li>• Verificar reservas</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Aprendiz (Cuenta)</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Acceso completo con funciones personalizadas.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Todas las funciones Guest</li>
                <li>• Historial personalizado</li>
                <li>• Notificaciones</li>
                <li>• Favoritos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Access Request Section Responsivo */}
      <section id="contact-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-sena-soft-100 to-sena-soft-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showAccessForm ? (
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                ¿Necesitas Acceso Completo al Sistema?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 px-4">
                Los aprendices pueden consultar ambientes sin cuenta. Para acceso completo 
                como instructor, guardia o administrador, solicita una cuenta.
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-sena-soft-300">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Información Requerida para Solicitar Cuenta:</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 text-xs sm:text-sm">
                  <div className="text-left">
                    <p>• Nombre completo</p>
                    <p>• Número de documento</p>
                    <p>• Correo electrónico institucional</p>
                  </div>
                  <div className="text-left">
                    <p>• Rol solicitado (Instructor/Guardia/Aprendiz)</p>
                    <p>• Centro de formación</p>
                    <p>• Justificación del acceso</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
                <Button 
                  size="lg" 
                  onClick={handleGuestAccess}
                  className="bg-blue-500 text-white hover:bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Acceso Guest
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setShowAccessForm(true)}
                  className="bg-sena-soft-500 text-white hover:bg-sena-soft-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <UserCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Solicitar Acceso
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleLogin}
                  variant="outline"
                  className="border-sena-soft-300 text-sena-soft-600 hover:bg-sena-soft-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200 w-full sm:w-auto"
                >
                  Tengo Cuenta
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <AccessRequestForm onCancel={() => {
                console.log('onCancel ejecutado'); // Añade esto para debug
                setShowAccessForm(false);
              }} />
            </div>
          )}
        </div>
      </section>

      {/* Footer Responsivo */}
      <footer className="bg-gray-100 text-gray-800 py-8 sm:py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={logoSena} alt="SENA" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                <span className="text-lg sm:text-xl font-bold text-gray-800">OccupyManager</span>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Sistema integral de gestión de ambientes para la institución SENA CTPGA.
                Optimiza, controla y administra los espacios educativos.
              </p>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Aprendices:</strong> Pueden acceder sin cuenta para consultar 
                  la disponibilidad de ambientes de formación.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Acceso Rápido</h4>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li>
                  <button 
                    onClick={handleGuestAccess}
                    className="hover:text-blue-600 transition-colors text-left"
                  >
                    Ver Ambientes (Guest)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLogin}
                    className="hover:text-sena-soft-600 transition-colors text-left"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li><a href="#contact-section" className="hover:text-sena-soft-600 transition-colors">Solicitar Cuenta</a></li>
                <li><a href="#" className="hover:text-sena-soft-600 transition-colors">Soporte Técnico</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Contacto Administrativo</h4>
              <div className="space-y-3 text-gray-600 text-sm sm:text-base">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+57 (1) 234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">admin@occupymanager.sena.edu.co</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Bogotá, Colombia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>&copy; 2024 OccupyManager - SENA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;