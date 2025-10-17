"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ambiente_controller_1 = require("../controllers/ambiente.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas
router.use(auth_middleware_1.authenticateToken);
// Rutas públicas (solo lectura para usuarios autenticados)
router.get('/', ambiente_controller_1.obtenerAmbientes); // Todos los usuarios autenticados pueden ver ambientes
router.get('/:id', ambiente_controller_1.obtenerAmbiente); // Todos los usuarios autenticados pueden ver un ambiente específico
router.post('/verificar-disponibilidad', ambiente_controller_1.verificarDisponibilidad); // Todos pueden verificar disponibilidad
// Rutas protegidas (solo administradores)
router.post('/', (0, auth_middleware_1.requireRole)(['admin']), ambiente_controller_1.crearAmbiente);
router.put('/:id', (0, auth_middleware_1.requireRole)(['admin']), ambiente_controller_1.actualizarAmbiente);
router.delete('/:id', (0, auth_middleware_1.requireRole)(['admin']), ambiente_controller_1.eliminarAmbiente);
exports.default = router;
//# sourceMappingURL=ambiente.routes.js.map