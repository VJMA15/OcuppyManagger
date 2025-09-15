import React, { useState } from 'react';
import { 
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import GuardiaTabs from '../../components/guardia/GuardiaTabs';
import MonitoreoPage from './MonitoreoPage';
import IncidentesPage from './IncidentesPage';
import AccesosPage from './AccesosPage';
import ReservasPage from './ReservasPage';

const GuardiaAmbientesPage = () => {
    const [activeTab, setActiveTab] = useState("monitoreo");

    const renderTabContent = () => {
        switch (activeTab) {
            case "monitoreo":
                return <MonitoreoPage />;
            case "incidentes":
                return <IncidentesPage />;
            case "accesos":
                return <AccesosPage />;
            case "reservas":
                return <ReservasPage />;
            default:
                return <MonitoreoPage />;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <GuardiaTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 p-6 overflow-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GuardiaAmbientesPage;