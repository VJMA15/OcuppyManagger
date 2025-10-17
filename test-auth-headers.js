// Script para probar headers de autenticación
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Simular el token que debería estar en las cookies del navegador
// Este es el token del usuario Victor Admin que verificamos anteriormente
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWY5ZGJkNzJiNzNjMzE4ZjY4ZGY4YSIsImlhdCI6MTczNDM4NzE5MywiZXhwIjoxNzM1MjUxMTkzfQ.example'; // Token de ejemplo

async function testAuthHeaders() {
  console.log('🔍 Probando headers de autenticación...');
  
  // Configuración de la petición
  const apiUrl = 'https://ocuppymanagger-api.netlify.app/api/v1/users';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${testToken}`
  };
  
  console.log('\n📋 Configuración de la petición:');
  console.log('URL:', apiUrl);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  
  try {
    console.log('\n🚀 Enviando petición...');
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    
    console.log('\n📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('Response Headers:', JSON.stringify(responseHeaders, null, 2));
    
    const data = await response.text();
    console.log('\n📄 Contenido de la respuesta:');
    console.log(data);
    
    if (response.status === 403) {
      console.log('\n❌ Error 403: Problema de permisos detectado');
      console.log('Posibles causas:');
      console.log('1. El token no se está enviando correctamente');
      console.log('2. El token ha expirado');
      console.log('3. El usuario no tiene rol de admin');
      console.log('4. El middleware de autenticación no está funcionando');
    } else if (response.status === 401) {
      console.log('\n❌ Error 401: Problema de autenticación detectado');
      console.log('Posibles causas:');
      console.log('1. Token inválido o malformado');
      console.log('2. Token expirado');
      console.log('3. Usuario no existe');
    } else if (response.status === 200) {
      console.log('\n✅ Petición exitosa - El problema no está en los headers');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la petición:', error.message);
    console.log('\nPosibles causas:');
    console.log('1. El backend no está ejecutándose');
    console.log('2. Problema de conectividad');
    console.log('3. CORS mal configurado');
  }
}

// Función para verificar el token actual del usuario
function checkCurrentUserToken() {
  console.log('\n🔐 Información sobre tokens:');
  console.log('Para verificar el token actual del usuario:');
  console.log('1. Abrir DevTools (F12)');
  console.log('2. Ir a Application > Cookies');
  console.log('3. Buscar la cookie "auth_token"');
  console.log('4. Copiar el valor y decodificarlo en jwt.io');
  console.log('\nO ejecutar en la consola del navegador:');
  console.log('document.cookie.split(";").find(c => c.includes("auth_token"))');
}

testAuthHeaders().then(() => {
  checkCurrentUserToken();
  console.log('\n✅ Prueba de headers completada');
});