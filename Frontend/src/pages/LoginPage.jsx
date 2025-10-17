import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import LoginContainer from '@/containers/LoginContainer';

const LoginPage = () => {
  const [form, setForm] = useState({ cc: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthContext();

  // Leer cooldown global si existe (lo setea el cliente al recibir Retry-After)
  const getGlobalCooldownRemaining = () => {
    try {
      const until = typeof window !== 'undefined' && window.__apiGlobalRegistry ? window.__apiGlobalRegistry.cooldownUntil : 0;
      const now = Date.now();
      return until && until > now ? (until - now) : 0;
    } catch {
      return 0;
    }
  };

  // Event handlers
  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prevenir submit durante cooldown global y mostrar tiempo amigable
    const ms = getGlobalCooldownRemaining();
    if (ms > 0) {
      const secs = Math.floor(ms / 1000);
      if (secs <= 120) {
        setError(`En pausa por límite de tasa. Reintento en ${secs}s`);
      } else {
        const mins = Math.ceil(secs / 60);
        setError(`En pausa por límite de tasa. Reintentar automáticamente (~${mins} min).`);
      }
      return; // No iniciar carga ni golpear backend
    }

    setIsLoading(true);
    try {
      const result = await login({ cc: form.cc, password: form.password });
      if (result.success) {
        console.log('✅ Login exitoso');
      } else {
        setError(result.message || "C.C o contraseña incorrectos");
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message || "C.C o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  // Al montar, si hay cooldown activo, mostrar aviso sin obligar al usuario a enviar
  useEffect(() => {
    const ms = getGlobalCooldownRemaining();
    if (ms > 0 && !error) {
      const secs = Math.floor(ms / 1000);
      if (secs <= 120) {
        setError(`En pausa por límite de tasa. Reintento en ${secs}s`);
      } else {
        const mins = Math.ceil(secs / 60);
        setError(`En pausa por límite de tasa. Reintentar automáticamente (~${mins} min).`);
      }
    }
  }, []);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
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
      
    />
  );
};

export default LoginPage;