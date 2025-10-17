// Script para generar un token JWT válido para el usuario Victor Admin
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Modelo de usuario (simplificado)
const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  role: String,
  activo: Boolean
});

const User = mongoose.model('User', userSchema);

async function generateValidToken() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar el usuario Victor Admin
    const user = await User.findOne({ cc: '1038647805' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log('- Nombre:', user.nombre);
    console.log('- CC:', user.cc);
    console.log('- Email:', user.email);
    console.log('- Rol:', user.role);
    console.log('- Activo:', user.activo);

    // Generar nuevo token JWT
    const payload = {
      id: user._id.toString(),
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 días
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    
    console.log('\n🔐 Token JWT generado:');
    console.log('Token:', token);
    
    console.log('\n📋 Payload del token:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Verificar el token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('\n✅ Token verificado correctamente:');
      console.log(JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Error verificando token:', error.message);
    }

    // Probar petición con el token
    console.log('\n🌐 Probando petición a /api/v1/users con el token...');
    
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 Respuesta:', responseText.substring(0, 500));
      
      if (response.status === 200) {
        console.log('\n✅ ¡Petición exitosa! El token funciona correctamente.');
        console.log('\n🔧 Para usar este token en el frontend:');
        console.log('1. Abrir DevTools (F12)');
        console.log('2. Ir a Application > Cookies');
        console.log('3. Editar la cookie "auth_token"');
        console.log('4. Reemplazar el valor con este token:');
        console.log(token);
      } else {
        console.log('\n❌ La petición falló. Revisar logs del backend.');
      }
      
    } catch (fetchError) {
      console.log('❌ Error en petición:', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

generateValidToken();