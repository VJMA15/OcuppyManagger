const mongoose = require('mongoose');
require('dotenv').config();

// Usar un esquema flexible para acceder a la colección
const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: String,
  activo: Boolean,
  rol: String,
  estado: String
});

const User = mongoose.model('User', userSchema);

async function fixAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const cc = '12345678';
    const user = await User.findOne({ cc });

    if (!user) {
      console.log('❌ No existe usuario con CC:', cc);
      process.exit(1);
    }

    console.log('👤 Usuario encontrado:', {
      nombre: user.nombre,
      cc: user.cc,
      email: user.email,
      role: user.role,
      activo: user.activo,
      rol: user.rol,
      estado: user.estado
    });

    // Preparar actualización corrigiendo campos
    const update = {
      role: 'admin',
      activo: true,
      $unset: { rol: '', estado: '' }
    };

    const result = await User.updateOne({ _id: user._id }, update);

    if (result.modifiedCount > 0) {
      const updated = await User.findById(user._id);
      console.log('✅ Usuario actualizado:', {
        role: updated.role,
        activo: updated.activo
      });
      console.log('🚀 Admin listo para login con CC 12345678');
    } else {
      console.log('⚠️ No hubo cambios aplicados');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAdminUser();