const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Definir el esquema de usuario (simplificado)
const userSchema = new mongoose.Schema({
  cc: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'instructor', 'estudiante', 'guardia'], default: 'estudiante' },
  telefono: String,
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ rol: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log(`   CC: ${existingAdmin.cc}`);
      console.log(`   Nombre: ${existingAdmin.nombre}`);
      console.log(`   Email: ${existingAdmin.email}`);
      return;
    }

    // Datos del administrador
    const adminData = {
      cc: '12345678',
      nombre: 'Administrador Sistema',
      email: 'admin@sena.edu.co',
      password: 'admin123',
      rol: 'admin',
      telefono: '3001234567',
      estado: 'activo'
    };

    // Hashear la contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 12;
    adminData.password = await bcrypt.hash(adminData.password, saltRounds);

    // Crear el usuario administrador
    console.log('👤 Creando usuario administrador...');
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log('📋 Datos de acceso:');
    console.log(`   CC: 12345678`);
    console.log(`   Contraseña: admin123`);
    console.log(`   Rol: admin`);
    console.log(`   Email: admin@sena.edu.co`);
    console.log('\n🚀 Ya puedes iniciar sesión en la aplicación');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    
    if (error.code === 11000) {
      console.log('\n⚠️  El usuario ya existe. Datos duplicados:');
      console.log('   - CC o email ya registrado');
    }
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar la función
createAdminUser();