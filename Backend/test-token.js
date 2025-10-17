// Script simple para probar el token JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Token generado anteriormente
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGJkNTI1YzI1MGQ5MjBjMWU0MGQ1MyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NzYxNDIyNCwiZXhwIjoxNzYwMjA2MjI0fQ.uPoLE7c7iMj5IyPm90iOHYdiAq9P9MRN23C3pmrvqR4';

console.log('🔍 Verificando token JWT...');

try {
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('✅ Token válido:');
  console.log('- ID:', decoded.id);
  console.log('- Rol:', decoded.role);
  console.log('- Emitido:', new Date(decoded.iat * 1000).toLocaleString());
  console.log('- Expira:', new Date(decoded.exp * 1000).toLocaleString());
  
  console.log('\n🌐 Para probar manualmente con curl:');
  console.log(`curl -H "Authorization: Bearer ${testToken}" -H "Content-Type: application/json" https://ocuppymanagger-api.netlify.app/api/v1/users`);
  
  console.log('\n🔧 Para usar en el navegador:');
  console.log('1. Ir a http://localhost:3003/debug-auth.html');
  console.log('2. Abrir DevTools (F12)');
  console.log('3. En la consola, ejecutar:');
  console.log(`document.cookie = "auth_token=${testToken}; path=/; max-age=2592000";`);
  console.log('4. Recargar la página y probar la API');
  
} catch (error) {
  console.log('❌ Token inválido:', error.message);
}

console.log('\n✅ Verificación completada');