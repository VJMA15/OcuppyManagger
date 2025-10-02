const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Importar el modelo de usuario
const User = require('./dist/models/user.model.js').default;

async function updateUserPassword() {
  try {
    // Buscar el usuario por CC
    const user = await User.findOne({ cc: '1038647805' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.nombre);
    
    // Actualizar la contraseña directamente
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      passwordChangedAt: new Date()
    });
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('📋 Credenciales para login:');
    console.log('   CC:', user.cc);
    console.log('   Contraseña:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserPassword();