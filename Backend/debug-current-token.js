const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Esquema del usuario
const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  activo: { type: Boolean, default: true },
  passwordChangedAt: Date
});

const User = mongoose.model('User', userSchema);

async function debugCurrentToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado a MongoDB Atlas');
    
    // Simular el token que se está enviando desde el frontend
    // Este token debería ser el que está causando los errores 403
    
    console.log('\n🔍 DEPURACIÓN DEL TOKEN ACTUAL');
    console.log('=====================================');
    
    // 1. Buscar el usuario en la base de datos
    const user = await User.findOne({ cc: '1038647805' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return;
    }
    
    console.log('👤 Usuario en la base de datos:');
    console.log('- ID:', user._id);
    console.log('- Nombre:', user.nombre);
    console.log('- CC:', user.cc);
    console.log('- Email:', user.email);
    console.log('- Rol:', user.role);
    console.log('- Activo:', user.activo);
    
    // 2. Generar un token nuevo con los datos correctos
    const newToken = jwt.sign(
      { 
        id: user._id.toString(),
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('\n🔑 Token generado:');
    console.log('Token:', newToken);
    
    // 3. Decodificar el token para verificar su contenido
    const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
    console.log('\n📋 Contenido del token decodificado:');
    console.log('- ID:', decoded.id);
    console.log('- Rol:', decoded.role);
    console.log('- Emitido en:', new Date(decoded.iat * 1000));
    console.log('- Expira en:', new Date(decoded.exp * 1000));
    
    // 4. Verificar si el middleware debería aceptar este token
    console.log('\n✅ VERIFICACIÓN DEL MIDDLEWARE:');
    console.log('- Usuario existe en BD:', !!user);
    console.log('- Usuario activo:', user.activo);
    console.log('- Rol en token:', decoded.role);
    console.log('- Rol en BD:', user.role);
    console.log('- Roles coinciden:', decoded.role === user.role);
    
    // 5. Simular el middleware requireRole para admin
    const requiredRoles = ['admin'];
    const hasPermission = user && requiredRoles.includes(user.role);
    console.log('- Tiene permisos de admin:', hasPermission);
    
    if (!hasPermission) {
      console.log('\n❌ PROBLEMA IDENTIFICADO:');
      console.log('El usuario no tiene permisos de admin según el middleware');
      console.log('Rol requerido: admin');
      console.log('Rol actual:', user.role);
    } else {
      console.log('\n✅ El usuario DEBERÍA tener permisos de admin');
      console.log('Posible problema: Token enviado desde el frontend es diferente');
    }
    
    console.log('\n🔧 SOLUCIÓN SUGERIDA:');
    console.log('1. Verificar que el frontend esté enviando el token correcto');
    console.log('2. Hacer logout y login nuevamente para obtener un token fresco');
    console.log('3. Verificar que el middleware esté leyendo el rol correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugCurrentToken();