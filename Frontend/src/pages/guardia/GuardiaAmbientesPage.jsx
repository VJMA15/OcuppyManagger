import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Building2, 
  AlertTriangle, 
  Clock, 
  UserCheck,
  Activity,
  FileText,
  Settings
} from 'lucide-react';
import { useAmbientes } from '@/hooks/useAmbientes';
import { useAuthContext } from '@/contexts/auth-context';
import { Modal } from '@/components/ui';
import apiService from '@/services/api';
import StatsCard from '@/components/dashboard/StatsCard';
import { Footer } from '@/layouts/footer';
import { GuardiaHeader } from '@/components/guardia';
import { GuardiaTabs } from '@/components/guardia';
import { MonitoreoPage } from './MonitoreoPage';
// import { IncidentesPage } from './IncidentesPage';
// import { AccesosPage } from './AccesosPage';
// import { ReservasPage } from './ReservasPage';

export const GuardiaAmbientesPage = () => {
    const [activeTab, setActiveTab] = useState("monitoreo");

    const renderTabContent = () => {
        switch (activeTab) {
            case "monitoreo":
                return <MonitoreoPage />;
            case "incidentes":
                return <div className="p-8 text-center text-slate-500">Página de Incidentes - En desarrollo</div>;
            case "accesos":
                return <div className="p-8 text-center text-slate-500">Página de Control de Acceso - En desarrollo</div>;
            case "reservas":
                return <div className="p-8 text-center text-slate-500">Página de Reservas Activas - En desarrollo</div>;
            default:
                return <MonitoreoPage />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <GuardiaHeader />
            <GuardiaTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GuardiaAmbientesPage;