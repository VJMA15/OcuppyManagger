import React from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showAccessForm, setShowAccessForm] = React.useState(false);
  const [termsExpanded, setTermsExpanded] = React.useState(false);
  const features = [
    {
      icon: Building2,
      title: "Gestión de Ambientes",
      description: "Administra aulas, laboratorios y espacios de manera eficiente"
    },
    {
      icon: Calendar,
      title: "Reservas de Instructores",
      description: "Crear, consultar y cancelar reservas de ambientes"
    },
    {
      icon: Users,
      title: "Acceso por Roles",
      description: "Roles actualmente soportados: Admin e Instructor"
    },
    {
      icon: Shield,
      title: "Disponibilidad y Horarios",
      description: "Consulta de horarios y disponibilidad por ambiente"
    },
    {
      icon: Clock,
      title: "Actualización en Tiempo Real",
      description: "Notificaciones básicas de cambios de reserva (SSE)"
    },
    {
      icon: CheckCircle,
      title: "Historial de Reservas",
      description: "Consulta de reservas realizadas por el usuario"
    }
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGuestAccess = () => {
    navigate('/consulta/ambientes?mode=guest');
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
                onClick={handleGuestAccess}
                className="bg-sena hover:bg-sena-dark text-white border border-sena transition-colors shadow-sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes
              </Button>
              <Button 
                onClick={handleContactAdmin}
                className="bg-primary hover:bg-primary-dark text-white border border-primary transition-colors shadow-sm"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Solicitar Acceso
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-sena hover:bg-sena-dark text-white font-medium shadow-sm transition-colors"
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
                onClick={handleGuestAccess}
                className="w-full bg-sena hover:bg-sena-dark text-white border border-sena justify-start"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes
              </Button>
              <Button 
                onClick={handleContactAdmin}
                className="w-full bg-primary hover:bg-primary-dark text-white border border-primary justify-start"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Solicitar Acceso
              </Button>
              <Button 
                onClick={handleLogin}
                className="w-full bg-sena text-white hover:bg-sena-dark shadow-md transition-all duration-200 justify-start"
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
          <div className="inline-block bg-sena/10 text-sena text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            SENA - Centro tecnologico para la gestion agroempresarial
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Gestión Inteligente de
            <span className="block text-sena mt-2">Ambientes Educativos</span>
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
                <div className="bg-sena/10 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-sena" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">Acceso para Aprendices</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Consulta la disponibilidad y horarios de los ambientes de formación 
                sin necesidad de cuenta de usuario.
              </p>
              <Button 
                className="w-full bg-sena hover:bg-sena-dark text-white font-medium"
                onClick={handleGuestAccess}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Ambientes Disponibles
              </Button>
            </div>

            {/* Account Access */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">Acceso Personal</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Inicia sesión para acceder a todas las funcionalidades del sistema de 
                gestión de ambientes educativos.
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-sena hover:text-sena font-medium"
              >
                Iniciar Sesión
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                ¿No tienes una cuenta?{' '}
                <button 
                  onClick={handleContactAdmin}
                  className="text-primary hover:underline font-medium"
                >
                  Solicita acceso
                </button>
              </p>
            </div>
          </div>

          {/* CTA principal simplificado */}
          <div className="flex justify-center px-4">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-sena text-white hover:bg-sena-dark px-8 py-4 text-lg shadow-lg transition-all duration-200"
            >
              Acceder al Sistema
              <ArrowRight className="ml-2 h-5 w-5" />
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <li>• Historial básico</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-neutral-soft-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Administrador</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Gestión de usuarios y administración del sistema.
              </p>
              <ul className="text-xs text-neutral-soft-500 space-y-1">
                <li>• Aprobar solicitudes</li>
                <li>• Administrar ambientes</li>
                <li>• Consultas generales</li>
                <li>• Configuración básica</li>
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
                como instructor o administrador, solicita una cuenta.
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
                    <p>• Rol solicitado (Instructor/Admin)</p>
                    <p>• Centro de formación</p>
                    <p>• Justificación del acceso</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center px-4">
                <Button 
                  size="lg" 
                  onClick={() => setShowAccessForm(true)}
                  className="bg-sena-soft-500 text-white hover:bg-sena-soft-600 px-8 py-4 text-lg shadow-lg transition-all duration-200"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Solicitar Acceso
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

      {/* Cómo usar la aplicación */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-soft-800 mb-3">Cómo usar la aplicación</h3>
            <p className="text-neutral-soft-600 text-base sm:text-lg max-w-3xl mx-auto">Guía rápida para aprendices e instructores. En minutos estarás consultando disponibilidad y creando reservas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aprendices */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Para Aprendices (Consulta)</h4>
              </div>
              <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
                <li>En el encabezado, haz clic en <span className="font-medium">Ver Ambientes</span>.</li>
                <li>Filtra por <span className="font-medium">fecha</span> y <span className="font-medium">jornada</span> para ver disponibilidad.</li>
                <li>Abre un ambiente para detalles de capacidad, ubicación y estado.</li>
              </ol>
            </div>

            {/* Instructores */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Para Instructores (Reservas)</h4>
              </div>
              <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
                <li>Haz clic en <span className="font-medium">Iniciar Sesión</span> y accede con tus credenciales.</li>
                <li>Desde <span className="font-medium">Ambientes</span>, elige un ambiente y crea tu reserva con fecha y jornada.</li>
                <li>Revisa tus reservas en <span className="font-medium">Mis Reservas</span> y cancela si es necesario.</li>
              </ol>
            </div>
          </div>

          {/* Tips rápidos */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Disponibilidad por jornada</p>
              <p className="text-green-800 mt-1">La disponibilidad se consulta por mañana, tarde o noche.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Datos en tiempo real</p>
              <p className="text-blue-800 mt-1">Cambios de reservas se reflejan automáticamente.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-medium text-amber-900 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Acceso sin cuenta</p>
              <p className="text-amber-800 mt-1">Cualquiera puede consultar ambientes desde “Ver Ambientes”.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Términos y Condiciones */}
      <section id="terminos" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-soft-800 mb-3">Términos y Condiciones</h3>
            <p className="text-neutral-soft-600 text-base sm:text-lg max-w-3xl mx-auto">
              Al utilizar esta plataforma aceptas el tratamiento responsable de los datos personales y el uso de la información únicamente para la gestión de ambientes educativos y fines administrativos institucionales.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-6">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Resumen: recopilamos datos de identificación básica, información de acceso y trazabilidad de uso para operar las funcionalidades del sistema, mejorar el servicio y mantener la seguridad de la plataforma.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setTermsExpanded((v) => !v)}
                className="text-primary hover:underline font-medium text-sm sm:text-base"
              >
                {termsExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            </div>

            {termsExpanded && (
              <div className="mt-6 text-sm sm:text-base text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-5 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Contenido Completo</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Datos que recopilamos: nombre, documento, correo institucional, rol, registros de uso (fechas, IP, acciones realizadas) y datos operativos de reservas/ambientes.
                  </li>
                  <li>
                    Finalidades: autenticar usuarios, gestionar reservas y accesos, generar reportes e histórico, asegurar la integridad operativa, y contactar por temas relacionados con el servicio.
                  </li>
                  <li>
                    Bases legales: autorización del titular, cumplimiento de funciones y obligaciones institucionales, y protección del interés legítimo en seguridad y operación del servicio.
                  </li>
                  <li>
                    Conservación: los datos se almacenan por el tiempo necesario para cumplir las finalidades y obligaciones aplicables. Se aplican políticas de depuración y minimización.
                  </li>
                  <li>
                    Compartición: no transferimos datos a terceros salvo obligación legal o requerimientos institucionales. El acceso interno está restringido por rol y necesidad operativa.
                  </li>
                  <li>
                    Seguridad: implementamos controles técnicos y organizativos razonables (autenticación, autorización por roles, registro de actividad y medidas de protección de infraestructura).
                  </li>
                  <li>
                    Cookies y tecnologías similares: usamos almacenamiento local/cookies para mantener sesión y preferencias estrictamente necesarias para el funcionamiento.
                  </li>
                  <li>
                    Derechos de los titulares: puedes consultar, actualizar, rectificar y solicitar la eliminación de tus datos cuando aplique, así como revocar la autorización. Canal de contacto más abajo.
                  </li>
                </ul>
                <p className="mt-4">
                  Para ejercer tus derechos o resolver inquietudes, comunícate con el área administrativa a través de los medios de contacto en el pie de página.
                </p>
              </div>
            )}
          </div>
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
                {/* Enlace de acceso Guest eliminado */}
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
                  <span className="break-all">vmendez8@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>cacucacia antioquia, colombia</span>
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