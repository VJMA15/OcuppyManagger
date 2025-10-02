require('dotenv').config();
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixInstructorActiveField() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    // Buscar el usuario VJX
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log('🔍 Buscando usuario VJX...');
    const user = await User.findOne({ nombre: 'VJX' });
    
    if (!user) {
      console.log('❌ Usuario VJX no encontrado');
      return;
    }
    
    console.log('📋 Usuario encontrado:', {
      id: user._id,
      nombre: user.nombre,
      role: user.role,
      activo: user.activo,
      email: user.email
    });
    
    // Actualizar el campo activo a true
    console.log('🔧 Actualizando campo activo a true...');
    const result = await User.updateOne(
      { _id: user._id },
      { $set: { activo: true } }
    );
    
    console.log('✅ Resultado de la actualización:', result);
    
    // Verificar la actualización
    const updatedUser = await User.findById(user._id);
    console.log('✅ Usuario actualizado:', {
      id: updatedUser._id,
      nombre: updatedUser.nombre,
      role: updatedUser.role,
      activo: updatedUser.activo,
      email: updatedUser.email
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixInstructorActiveField();