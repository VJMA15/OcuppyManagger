// Script para depurar problemas de autenticación
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando depuración de autenticación...');

// Simular el comportamiento del frontend
const simulateAuthCheck = () => {
  console.log('\n📋 Verificando estado de autenticación:');
  
  // Verificar si hay archivos de configuración
  const frontendPath = path.join(__dirname, 'Frontend', 'src');
  const configPath = path.join(frontendPath, 'config', 'api.js');
  
  if (fs.existsSync(configPath)) {
    console.log('✅ Archivo de configuración API encontrado');
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      console.log('📄 Contenido de configuración API:');
      console.log(configContent.substring(0, 500) + '...');
    } catch (error) {
      console.log('❌ Error leyendo configuración:', error.message);
    }
  } else {
    console.log('❌ Archivo de configuración API no encontrado en:', configPath);
  }
  
  // Verificar servicios
  const authServicePath = path.join(frontendPath, 'services', 'auth.js');
  const usersServicePath = path.join(frontendPath, 'services', 'users.js');
  
  console.log('\n🔐 Verificando servicios de autenticación:');
  console.log('Auth service existe:', fs.existsSync(authServicePath));
  console.log('Users service existe:', fs.existsSync(usersServicePath));
  
  // Verificar contexto de autenticación
  const authContextPath = path.join(frontendPath, 'contexts', 'auth-context.jsx');
  console.log('Auth context existe:', fs.existsSync(authContextPath));
  
  console.log('\n🎯 Recomendaciones de depuración:');
  console.log('1. Verificar que el token se esté guardando correctamente en las cookies');
  console.log('2. Verificar que el header Authorization se esté enviando en las peticiones');
  console.log('3. Verificar que el backend esté recibiendo el token correctamente');
  console.log('4. Verificar que el rol del usuario sea "admin" para acceder a /users');
};

simulateAuthCheck();

console.log('\n🔧 Para depurar más a fondo:');
console.log('1. Abrir DevTools del navegador (F12)');
console.log('2. Ir a la pestaña Network');
console.log('3. Intentar cargar la página de usuarios');
console.log('4. Verificar si la petición a /api/v1/users incluye el header Authorization');
console.log('5. Verificar la respuesta del servidor');

console.log('\n✅ Depuración completada');