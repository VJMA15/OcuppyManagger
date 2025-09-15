import React from 'react';
import AuthStatus from '@/components/AuthStatus';
import { Shield, AlertCircle } from 'lucide-react';

const AuthRequiredPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Restringido
          </h1>
          <p className="text-gray-600">
            Esta página requiere autenticación para acceder.
          </p>
        </div>

        {/* Auth Status Component */}
        <AuthStatus />
        
        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Por qué veo esto?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Tu sesión puede haber expirado</li>
                <li>No has iniciado sesión</li>
                <li>No tienes permisos para acceder a este recurso</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredPage;