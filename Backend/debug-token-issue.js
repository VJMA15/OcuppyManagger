require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: String,
  activo: Boolean
});

const User = mongoose.model('User', userSchema);

async function debugTokenIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Token del último login exitoso
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2M1YjFmYzJjNzdhN2IyMTliZGVjYyIsImlhdCI6MTc1OTE3Njk5NiwiZXhwIjoxNzY2OTUyOTk2fQ.Kfoc2medCJp-TDby5ZvHOnbQSdiDVJn1YGwWaizubXA';
    
    console.log('\n🔍 DEPURANDO TOKEN ESPECÍFICO...');
    
    // 1. Decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', {
      id: decoded.id,
      iat: decoded.iat,
      exp: decoded.exp,
      emitido: new Date(decoded.iat * 1000),
      expira: new Date(decoded.exp * 1000)
    });
    
    // 2. Buscar usuario en BD
    const user = await User.findById(decoded.id);
    console.log('\n👤 Usuario en BD:', {
      id: user._id.toString(),
      nombre: user.nombre,
      cc: user.cc,
      email: user.email,
      role: user.role,
      activo: user.activo,
      tipo_activo: typeof user.activo
    });
    
    // 3. Verificar condiciones del middleware
    console.log('\n🔐 VERIFICACIÓN DEL MIDDLEWARE:');
    console.log('- Usuario existe:', !!user);
    console.log('- user.activo:', user.activo);
    console.log('- !user.activo:', !user.activo);
    console.log('- Tipo de user.activo:', typeof user.activo);
    console.log('- user.activo === true:', user.activo === true);
    console.log('- user.activo === false:', user.activo === false);
    
    // 4. Simular exactamente el middleware
    console.log('\n🧪 SIMULANDO MIDDLEWARE:');
    if (!user.activo) {
      console.log('❌ PROBLEMA: El middleware detecta que !user.activo es true');
      console.log('Esto significa que user.activo es falsy');
    } else {
      console.log('✅ El middleware DEBERÍA permitir el acceso');
    }
    
    // 5. Verificar todos los usuarios con el mismo CC
    const allUsersWithCC = await User.find({ cc: '5087468301' });
    console.log('\n📋 TODOS LOS USUARIOS CON CC 5087468301:');
    allUsersWithCC.forEach((u, index) => {
      console.log(`Usuario ${index + 1}:`, {
        id: u._id.toString(),
        nombre: u.nombre,
        activo: u.activo,
        tipo_activo: typeof u.activo
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugTokenIssue();