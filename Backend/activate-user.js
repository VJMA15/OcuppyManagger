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

async function activateUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado a MongoDB Atlas');
    
    // Buscar el usuario por CC
    const user = await User.findOne({ cc: '1038647805' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('👤 Estado actual del usuario:');
    console.log('- Nombre:', user.nombre);
    console.log('- CC:', user.cc);
    console.log('- Email:', user.email);
    console.log('- Rol:', user.role);
    console.log('- Activo:', user.activo);
    
    if (user.activo) {
      console.log('✅ El usuario ya está activo');
    } else {
      // Activar el usuario
      user.activo = true;
      await user.save();
      console.log('✅ Usuario activado exitosamente');
    }
    
    console.log('\n📋 Estado final del usuario:');
    console.log('- Activo:', user.activo);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

activateUser();