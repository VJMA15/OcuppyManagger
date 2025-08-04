require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para agregar usuario
const addUser = async () => {
  try {
    // Obtener datos del usuario desde argumentos de línea de comandos
    const args = process.argv.slice(2);
    
    if (args.length < 4) {
      console.log('❌ Uso: node add-user.js <nombre> <cc> <email> <role>');
      console.log('Ejemplo: node add-user.js "Tu Nombre" "12345678" "tu@email.com" "admin"');
      process.exit(1);
    }

    const [nombre, cc, email, role] = args;
    const password = 'admin123'; // Contraseña por defecto

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ cc }, { email }] });
    if (existingUser) {
      console.log('❌ Ya existe un usuario con esa C.C o email');
      process.exit(1);
    }

    // Crear hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const newUser = new User({
      nombre,
      cc,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    console.log('✅ Usuario creado exitosamente:');
    console.log(`- Nombre: ${nombre}`);
    console.log(`- C.C: ${cc}`);
    console.log(`- Email: ${email}`);
    console.log(`- Rol: ${role}`);
    console.log(`- Contraseña: ${password}`);

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Agregando usuario...\n');
  
  await connectDB();
  await addUser();
  
  console.log('\n✅ Proceso completado');
  process.exit(0);
};

// Ejecutar script
main().catch(error => {
  console.error('❌ Error en el script:', error);
  process.exit(1);
}); 