"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bitacora_controller_1 = __importDefault(require("../controllers/bitacora.controller"));
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(auth_middleware_1.authenticateToken);
// Obtener todos los registros de bitácora
router.get('/', bitacora_controller_1.default.obtenerBitacora);
// Obtener estadísticas de bitácora (solo admin) - debe ir antes de /:id
router.get('/estadisticas', (0, auth_middleware_1.requireRole)(['admin']), bitacora_controller_1.default.obtenerEstadisticas);
// Obtener bitácora por entidad - debe ir antes de /:id
router.get('/entidad/:entidad', bitacora_controller_1.default.obtenerBitacoraPorEntidad);
// Crear nuevo registro de bitácora
router.post('/', bitacora_controller_1.default.crearBitacora);
// Obtener registro de bitácora por ID - debe ir al final
router.get('/:id', bitacora_controller_1.default.obtenerBitacoraPorId);
// Limpiar registros antiguos (solo admin)
router.delete('/limpiar', (0, auth_middleware_1.requireRole)(['admin']), bitacora_controller_1.default.limpiarRegistrosAntiguos);
exports.default = router;
//# sourceMappingURL=bitacora.routes.js.map