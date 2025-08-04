const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/ocuppy_manager')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    updateUserPassword();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function updateUserPassword() {
  try {
    const cc = '1038647805'; // Tu CC
    const newPassword = 'admin123'; // Nueva contraseña
    
    // Buscar el usuario
    const user = await User.findOne({ cc });
    
    if (!user) {
      console.log('❌ Usuario no encontrado con CC:', cc);
      process.exit(1);
    }
    
    console.log('👤 Usuario encontrado:', user.nombre);
    console.log('📧 Email:', user.email);
    console.log('🔑 Rol:', user.role);
    
    // Actualizar la contraseña
    user.password = newPassword;
    await user.save();
    
    console.log('\n✅ Contraseña actualizada exitosamente!');
    console.log('\n🔐 Credenciales para login:');
    console.log('CC:', cc);
    console.log('Contraseña:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}