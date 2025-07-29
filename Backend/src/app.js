require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ambienteRoutes = require('./routes/ambiente.routes');
const reservaRoutes = require('./routes/reserva.routes');
const registroRoutes = require('./routes/registro.routes');
const bitacoraRoutes = require('./routes/bitacora.routes');

// Importar manejadores de errores
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorHandler');

// Inicializar la aplicación Express
const app = express();

// 1) MIDDLEWARES GLOBALES

// Configuración detallada de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] // Cambiar por tu dominio en producción
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend en desarrollo
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Configurar cabeceras de seguridad con helmet
app.use(helmet());

// Registrar solicitudes HTTP en modo desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Límite de solicitudes de la misma API
const limiter = rateLimit({
  max: 1000, // 1000 solicitudes
  windowMs: 60 * 60 * 1000, // por hora
  message: 'Demasiadas solicitudes desde esta IP. Por favor, inténtalo de nuevo en una hora.',
});
app.use('/api', limiter);

// Body parser, leyendo datos del body en req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitización contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitización contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de registro de rutas
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 2) RUTAS DE LA API
// Configuración de Swagger
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ambientes', ambienteRoutes);
app.use('/api/v1/reservas', reservaRoutes);
app.use('/api/v1/registros', registroRoutes);
app.use('/api/v1/bitacora', bitacoraRoutes);

// Ruta de prueba
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '¡Bienvenido a la API de Occupy Manager!',
    version: '1.0.0',
    timestamp: req.requestTime,
    documentacion: '/api-docs', // Ruta para la documentación de la API (si se implementa Swagger)
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/api/v1');
});

// Manejar rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor`, 404));
});

// Manejador de errores global
app.use(globalErrorHandler);

// 3) INICIAR SERVIDOR
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejar errores no manejados de promesas
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Apagando...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  });

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Apagando...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;
