import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import LoginContainer from '@/containers/LoginContainer';

const LoginPage = () => {
  const [form, setForm] = useState({ cc: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthContext();

  // Event handlers
  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await login(form.cc, form.password);
      console.log('✅ Login exitoso');
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message || "C.C o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTestLogin = () => {
    console.log('🔧 Botón de prueba clickeado');
    localStorage.setItem("isAdmin", "true");
    window.location.href = '/dashboard';
  };

  // If already authenticated, redirect
  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <LoginContainer
      // Form data
      form={form}
      handleChange={handleChange}
      
      // Password visibility
      showPassword={showPassword}
      handleTogglePassword={handleTogglePassword}
      
      // Form submission
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      
      // Additional actions
      handleTestLogin={handleTestLogin}
    />
  );
};

export default LoginPage;