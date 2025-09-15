const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Importar modelo de usuario desde dist (compilado)
const User = require('./dist/models/user.model').default;

async function debugToken() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGJkNTI1YzI1MGQ5MjBjMWU0MGQ1MyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NzYxNDU2MSwiZXhwIjoxNzYwMjA2NTYxfQ.gGDLzt5VRUlFQVDzTeL9OnGrwz1j7Ej3_6YGZqPzY8w';
    
    console.log('🔍 Depurando token JWT...');
    
    // 1. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verificado:', decoded);
    
    // 2. Buscar usuario en la base de datos
    const user = await User.findById(decoded.id);
    console.log('👤 Usuario encontrado:', {
      id: user?._id,
      nombre: user?.nombre,
      email: user?.email,
      role: user?.role,
      activo: user?.activo
    });
    
    // 3. Verificar si el usuario tiene rol admin
    console.log('🔐 Verificación de rol:');
    console.log('- Rol del usuario:', user?.role);
    console.log('- Es admin?:', user?.role === 'admin');
    console.log('- Roles permitidos incluyen admin?:', ['admin'].includes(user?.role));
    
    // 4. Simular el middleware requireRole
    const roles = ['admin'];
    const hasPermission = user && roles.includes(user.role);
    console.log('✅ Tiene permisos?:', hasPermission);
    
    if (!hasPermission) {
      console.log('❌ PROBLEMA: El usuario no tiene permisos para esta acción');
      console.log('- Usuario existe?:', !!user);
      console.log('- Rol del usuario:', user?.role);
      console.log('- Roles requeridos:', roles);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

debugToken();