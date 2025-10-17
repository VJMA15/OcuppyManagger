import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Use require for packages without TypeScript types
const xss = require('xss-clean');

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ambienteRoutes from './routes/ambiente.routes';
import reservaRoutes from './routes/reserva.routes';
import entregaRoutes from './routes/entrega.routes';
import registrosRoutes from './routes/registros.routes';
import bitacoraRoutes from './routes/bitacora.routes';
import solicitudRoutes from './routes/solicitud.routes';
import reportsRoutes from './routes/reports.routes';
import historialRoutes from './routes/historial.routes';
import eventsRoutes from './routes/events.routes';
import startReservationScheduler from './services/reservation.scheduler';

// Importar manejadores de errores
import AppError from './utils/appError';
import globalErrorHandler from './middlewares/errorHandler';

// Inicializar la aplicación Express
const app = express();

// 1) MIDDLEWARES GLOBALES

// Configuración detallada de CORS (parametrizable por entorno)
const devOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000', 
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

const prodOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'https://tu-dominio.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Configurar helmet para seguridad
// Ajuste de Helmet para evitar bloqueo CORP en streams SSE cruzados en desarrollo
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Logging de desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limitador de velocidad (excluir SSE de eventos para evitar abortos)
const limiter = rateLimit({
  max: 1000, // 1000 solicitudes
  windowMs: 60 * 60 * 1000, // por hora
  message: 'Demasiadas solicitudes desde esta IP. Por favor, inténtalo de nuevo en una hora.',
  skip: (req) => {
    // Dentro del prefijo '/api', el path es '/v1/events/stream' para SSE
    const p = req.path || '';
    return p.startsWith('/v1/events');
  }
});
app.use('/api', limiter);

// Parseo del cuerpo de la solicitud
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitización de datos contra ataques NoSQL
app.use(mongoSanitize());

// Sanitización de datos contra ataques XSS
app.use(xss());

// Prevenir contaminación de parámetros HTTP
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

// Middleware de prueba
app.use((req, res, next) => {
(req as any).requestTime = new Date().toISOString();
  next();
});

// 3) CONFIGURACIÓN DE SWAGGER
// const setupSwagger = require('./config/swagger'); // Archivo no disponible
// setupSwagger(app); // Comentado temporalmente

// 3) RUTAS
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ambientes', ambienteRoutes);
app.use('/api/v1/reservas', reservaRoutes);
app.use('/api/v1/entregas', entregaRoutes);
app.use('/api/v1/registros', registrosRoutes);
app.use('/api/v1/bitacora', bitacoraRoutes);
app.use('/api/v1/solicitudes', solicitudRoutes);
app.use('/api/v1/reportes', reportsRoutes);
app.use('/api/v1/historial', historialRoutes);
app.use('/api/v1/events', eventsRoutes);

// Ruta de información de la API
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API de Gestión de Ambientes',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      ambientes: '/api/v1/ambientes',
      reservas: '/api/v1/reservas',
      entregas: '/api/v1/entregas',
      reportes: '/api/v1/reportes'
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Manejar rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

// 5) CONFIGURACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('✅ Conectado a MongoDB exitosamente');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`📡 Servidor corriendo en puerto ${PORT}`);
    console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
    
    // Solo iniciar el servidor si no estamos en modo de prueba
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
        // Iniciar tarea programada para actualizar estados de reservas
        startReservationScheduler();
        console.log('⏱️ Tarea programada de reservas iniciada.');
      });
    }
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  });

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Cerrando...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;