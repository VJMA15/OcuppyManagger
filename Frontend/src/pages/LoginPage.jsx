import { useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import LoginContainer from '@/containers/LoginContainer';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
  const [form, setForm] = useState({ cc: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuthContext();

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

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // If already authenticated, redirect based on role (SPA-friendly)
  if (isAuthenticated) {
    const userRole = user?.role || user?.rol;
    const redirectPath = 
      userRole === 'admin' ? '/dashboard' :
      userRole === 'instructor' ? '/instructor' :
      userRole === 'guardia' ? '/guardia' :
      '/ambientes';
    
    return <Navigate to={redirectPath} replace />;
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