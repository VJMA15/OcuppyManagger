require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Configuración básica de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'success',
    message: '¡API de prueba funcionando correctamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de prueba de MongoDB
app.get('/api/v1/test-db', async (req, res) => {
  // Mostrar la URI (sin contraseña) para depuración
  const maskedUri = process.env.MONGODB_URI 
    ? process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@')
    : 'No configurada';

  console.log('🔍 Intentando conectar a MongoDB con URI:', maskedUri);

  try {
    // Verificar conexión a MongoDB con opciones mejoradas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Tiempo de espera de 5 segundos
      socketTimeoutMS: 45000, // Cierra sockets después de 45 segundos de inactividad
    });
    
    // Si llegamos aquí, la conexión fue exitosa
    const dbInfo = {
      status: 'success',
      message: '✅ Conexión exitosa a MongoDB Atlas!',
      database: conn.connection.name,
      host: conn.connection.host,
      port: conn.connection.port,
      version: (await conn.connection.db.admin().serverInfo()).version,
    };

    console.log('📊 Información de la base de datos:', JSON.stringify(dbInfo, null, 2));
    
    res.json(dbInfo);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    
    // Mensajes de error más descriptivos
    let errorMessage = 'Error al conectar a la base de datos';
    let errorDetails = {};
    
    if (error.name === 'MongooseServerSelectionError') {
      errorMessage = 'No se pudo conectar a ningún servidor de MongoDB';
      errorDetails = {
        code: error.code,
        reason: error.reason ? error.reason.toString() : 'Razón desconocida',
        message: error.message,
      };
      
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        errorDetails.suggestion = 'Verifica el nombre del host/clúster en la cadena de conexión';
      } else if (error.message.includes('bad auth')) {
        errorDetails.suggestion = 'Verifica el nombre de usuario y la contraseña';
      } else if (error.message.includes('timed out')) {
        errorDetails.suggestion = 'El servidor no respondió a tiempo. Verifica tu conexión a internet o la configuración del firewall';
      }
    } else if (error.name === 'MongooseError') {
      errorMessage = 'Error de configuración de Mongoose';
      errorDetails = { message: error.message };
    }
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      connectionString: maskedUri,
    });
  }
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor de prueba ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 ${new Date().toLocaleString()}`);
  console.log('\nEndpoints disponibles:');
  console.log(`- GET http://localhost:${PORT}/api/v1`);
  console.log(`- GET http://localhost:${PORT}/api/v1/test-db\n`);
});

// Manejar cierre de la aplicación
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
  console.log('👋 Servidor detenido');
  process.exit(0);
});
