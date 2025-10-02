"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Use require for packages without TypeScript types
const xss = require('xss-clean');
// Importar rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const ambiente_routes_1 = __importDefault(require("./routes/ambiente.routes"));
const reserva_routes_1 = __importDefault(require("./routes/reserva.routes"));
const entrega_routes_1 = __importDefault(require("./routes/entrega.routes"));
const registros_routes_1 = __importDefault(require("./routes/registros.routes"));
const bitacora_routes_1 = __importDefault(require("./routes/bitacora.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
// Importar manejadores de errores
const appError_1 = __importDefault(require("./utils/appError"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
// Inicializar la aplicación Express
const app = (0, express_1.default)();
// 1) MIDDLEWARES GLOBALES
// Configuración detallada de CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://tu-dominio.com']
        : [
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
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// Configurar helmet para seguridad
app.use((0, helmet_1.default)());
// Logging de desarrollo
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Limitador de velocidad
const limiter = (0, express_rate_limit_1.default)({
    max: 1000, // 1000 solicitudes
    windowMs: 60 * 60 * 1000, // por hora
    message: 'Demasiadas solicitudes desde esta IP. Por favor, inténtalo de nuevo en una hora.',
});
app.use('/api', limiter);
// Parseo del cuerpo de la solicitud
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
// Sanitización de datos contra ataques NoSQL
app.use((0, express_mongo_sanitize_1.default)());
// Sanitización de datos contra ataques XSS
app.use(xss());
// Prevenir contaminación de parámetros HTTP
app.use((0, hpp_1.default)({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price',
    ],
}));
// Servir archivos estáticos
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Middleware de prueba
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
// 3) CONFIGURACIÓN DE SWAGGER
// const setupSwagger = require('./config/swagger'); // Archivo no disponible
// setupSwagger(app); // Comentado temporalmente
// 3) RUTAS
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/ambientes', ambiente_routes_1.default);
app.use('/api/v1/reservas', reserva_routes_1.default);
app.use('/api/v1/entregas', entrega_routes_1.default);
app.use('/api/v1/registros', registros_routes_1.default);
app.use('/api/v1/bitacora', bitacora_routes_1.default);
app.use('/api/v1/reportes', reports_routes_1.default);
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
    next(new appError_1.default(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});
// Middleware global de manejo de errores
app.use(errorHandler_1.default);
// 5) CONFIGURACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 5000;
// Conexión a MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('✅ Conectado a MongoDB exitosamente');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`📡 Servidor corriendo en puerto ${PORT}`);
    console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
    // Solo iniciar el servidor si no estamos en modo de prueba
    if (process.env.NODE_ENV !== 'test') {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
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
exports.default = app;
//# sourceMappingURL=app.js.map