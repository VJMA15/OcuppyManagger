import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { useNavigate } from 'react-router-dom';
import SettingsContainer from '@/containers/SettingsContainer';

const SettingsPage = () => {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : {
      reservas: true,
      recordatorios: true
    };
  });
  
  // Logout confirmation state
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleNotificationsChange = (type, value) => {
    const newNotifications = {
      ...notifications,
      [type]: value
    };
    setNotifications(newNotifications);
    localStorage.setItem("notifications", JSON.stringify(newNotifications));
  };

  const handleLogout = () => {
    console.log('🔓 Iniciando logout desde Settings...');
    
    // Ejecutar logout del contexto
    logout();
    
    // Navegar directamente sin recarga forzada
    navigate('/login', { replace: true });
  };

  const handleConfirmLogout = () => {
    setConfirmLogout(true);
  };

  const handleCancelLogout = () => {
    setConfirmLogout(false);
  };

  return (
    <SettingsContainer
      // Theme settings
      theme={theme}
      handleThemeChange={handleThemeChange}
      
      // Notifications
      notifications={notifications}
      handleNotificationsChange={handleNotificationsChange}
      
      // Logout
      confirmLogout={confirmLogout}
      handleConfirmLogout={handleConfirmLogout}
      handleCancelLogout={handleCancelLogout}
      handleLogout={handleLogout}
      
      // User info
      userInfo={user}
    />
  );
};

export default SettingsPage;