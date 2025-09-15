import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Send, User, Mail, FileText, Building, AlertCircle, X } from 'lucide-react';

const AccessRequestForm = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    documentNumber: '',
    email: '',
    requestedRole: '',
    trainingCenter: '',
    justification: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      const requiredFields = ['fullName', 'documentNumber', 'email', 'requestedRole', 'trainingCenter', 'justification'];
      const missingFields = requiredFields.filter(field => !formData[field].trim());
      
      if (missingFields.length > 0) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        setIsSubmitting(false);
        return;
      }

      // Simular envío de solicitud (aquí conectarías con tu API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí harías la llamada real a tu API
      // const response = await fetch('/api/access-requests', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      setIsSubmitted(true);
      showNotification('Solicitud enviada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      showNotification('Error al enviar la solicitud. Inténtalo nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu solicitud de acceso ha sido enviada al administrador del sistema.
              Recibirás una respuesta en tu correo electrónico en un plazo de 24-48 horas.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Próximos pasos:</h4>
              <ul className="text-blue-700 text-sm space-y-1 text-left">
                <li>• El administrador revisará tu solicitud</li>
                <li>• Recibirás un email con la respuesta</li>
                <li>• Si es aprobada, se te proporcionarán las credenciales de acceso</li>
                <li>• Mientras tanto, puedes usar el acceso Guest para consultar ambientes</li>
              </ul>
            </div>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  fullName: '',
                  documentNumber: '',
                  email: '',
                  requestedRole: '',
                  trainingCenter: '',
                  justification: ''
                });
              }}
              variant="outline"
            >
              Enviar otra solicitud
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header con identidad SENA */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white border border-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Solicitud de Acceso
          </h1>
          <p className="text-gray-500 text-sm">
            SENA CTPGA - Gestión de Ambientes
          </p>
        </div>

        <Card className="shadow-sm border border-gray-100 bg-white overflow-hidden">
          <CardContent className="p-0">
            {/* Notification */}
            {notification && (
              <div className={`mx-6 mt-6 p-4 rounded-lg border-l-4 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-600 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}>
                <div className="flex items-center">
                  {notification.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
                  )}
                  <span className="font-medium text-sm">{notification.message}</span>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Header del formulario */}
              <div className="bg-green-600 p-6 text-white">
                <h2 className="text-xl font-semibold text-center">Formulario de Solicitud de Acceso</h2>
                <p className="text-center text-green-100 text-sm mt-2">Complete todos los campos obligatorios (*)</p>
              </div>

              {/* Sección 1: Datos Personales */}
              <div className="p-8 border-b border-gray-100 bg-white">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800">Información Personal</h3>
                    <p className="text-gray-500 text-xs">Datos básicos del solicitante</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Ingrese su nombre completo"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="h-10 border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-100 rounded-md transition-colors text-sm bg-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber" className="text-sm font-medium text-gray-700">Número de Documento <span className="text-red-500">*</span></Label>
                    <Input
                      id="documentNumber"
                      type="text"
                      placeholder="Número de identificación"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      className="h-10 border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-100 rounded-md transition-colors text-sm bg-white"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@sena.edu.co"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-10 border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-100 rounded-md transition-colors text-sm bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Información del Acceso */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800">Información del Acceso</h3>
                    <p className="text-gray-400 text-xs">Detalles sobre el tipo de acceso solicitado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requestedRole" className="text-sm font-medium text-gray-700">Rol Solicitado <span className="text-red-500">*</span></Label>
                    <Select 
                      id="requestedRole"
                      value={formData.requestedRole} 
                      onChange={(e) => handleInputChange('requestedRole', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-600 focus:ring-green-600/20 rounded-lg transition-all"
                      required
                    >
                      <option value="">Seleccione un rol</option>
                      <option value="instructor">Instructor</option>
                      <option value="guardia">Guardia</option>
                      <option value="estudiante">Aprendiz (con cuenta)</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trainingCenter" className="text-sm font-medium text-gray-700">Centro de Formación <span className="text-red-500">*</span></Label>
                    <Input
                      id="trainingCenter"
                      type="text"
                      placeholder="Nombre del centro de formación"
                      value={formData.trainingCenter}
                      onChange={(e) => handleInputChange('trainingCenter', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-600 focus:ring-green-600/20 rounded-lg transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Justificación */}
              <div className="p-8 border-b border-gray-100 bg-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800">Justificación</h3>
                    <p className="text-gray-400 text-xs">Explique el motivo de su solicitud</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="justification" className="text-sm font-medium text-gray-700">Motivo del Acceso <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="justification"
                    placeholder="Describa detalladamente por qué necesita acceso al sistema, sus responsabilidades y cómo planea utilizarlo en el marco de sus funciones en el SENA..."
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    className="min-h-[120px] border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-100 rounded-md transition-colors resize-none text-sm p-3"
                    required
                  />
                </div>
              </div>

              {/* Información Importante */}
              <div className="p-8 bg-white border-t border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3 text-sm">Información Importante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Las solicitudes son revisadas por administradores del sistema</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Proceso de aprobación: 1-3 días hábiles</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Notificación por correo electrónico institucional</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Información veraz y completa requerida</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="p-8 bg-white border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium rounded-md text-sm"
                    onClick={() => {
                      setFormData({
                        fullName: '',
                        documentNumber: '',
                        email: '',
                        requestedRole: '',
                        trainingCenter: '',
                        justification: ''
                      });
                      setErrors({});
                      setNotification(null);
                      if (onCancel) {
                        onCancel();
                      }
                    }}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full h-10 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Enviando solicitud...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessRequestForm;