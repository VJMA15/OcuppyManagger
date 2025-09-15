"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_middleware_2 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(auth_middleware_1.authenticateToken);
// Obtener todos los registros
router.get('/', async (req, res) => {
    try {
        // Por ahora devolver datos mock hasta implementar la lógica completa
        const registros = {
            success: true,
            data: {
                registros: [],
                total: 0
            },
            message: 'Registros obtenidos exitosamente'
        };
        res.json(registros);
    }
    catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
// Obtener registro por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Por ahora devolver datos mock
        const registro = {
            success: true,
            data: {
                registro: {
                    _id: id,
                    fechaHora: new Date(),
                    tipo: 'entrada',
                    usuario: req.user?.id,
                    ambiente: null
                }
            },
            message: 'Registro obtenido exitosamente'
        };
        res.json(registro);
    }
    catch (error) {
        console.error('Error al obtener registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
// Crear nuevo registro
router.post('/', (0, auth_middleware_2.requireRole)(['guardia', 'admin']), async (req, res) => {
    try {
        const registroData = req.body;
        // Por ahora devolver respuesta mock
        const nuevoRegistro = {
            success: true,
            data: {
                registro: {
                    _id: 'mock-id',
                    ...registroData,
                    fechaHora: new Date(),
                    usuario: req.user?.id
                }
            },
            message: 'Registro creado exitosamente'
        };
        res.status(201).json(nuevoRegistro);
    }
    catch (error) {
        console.error('Error al crear registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
// Registrar entrada
router.post('/entrada', (0, auth_middleware_2.requireRole)(['guardia', 'admin']), async (req, res) => {
    try {
        const { reservaId } = req.body;
        const registro = {
            success: true,
            data: {
                registro: {
                    _id: 'mock-entrada-id',
                    tipo: 'entrada',
                    reservaId,
                    fechaHora: new Date(),
                    usuario: req.user?.id
                }
            },
            message: 'Entrada registrada exitosamente'
        };
        res.status(201).json(registro);
    }
    catch (error) {
        console.error('Error al registrar entrada:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
// Registrar salida
router.post('/salida', (0, auth_middleware_2.requireRole)(['guardia', 'admin']), async (req, res) => {
    try {
        const { registroId } = req.body;
        const registro = {
            success: true,
            data: {
                registro: {
                    _id: registroId,
                    tipo: 'salida',
                    fechaHora: new Date(),
                    usuario: req.user?.id
                }
            },
            message: 'Salida registrada exitosamente'
        };
        res.json(registro);
    }
    catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
// Obtener registros por ambiente
router.get('/ambiente/:ambienteId', async (req, res) => {
    try {
        const { ambienteId } = req.params;
        const registros = {
            success: true,
            data: {
                registros: [],
                total: 0
            },
            message: 'Registros del ambiente obtenidos exitosamente'
        };
        res.json(registros);
    }
    catch (error) {
        console.error('Error al obtener registros del ambiente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=registros.routes.js.map