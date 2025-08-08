"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ambiente_controller_1 = require("../controllers/ambiente.controller");
const router = (0, express_1.Router)();
router.post('/', ambiente_controller_1.crearAmbiente);
router.get('/', ambiente_controller_1.obtenerAmbientes); // Esto ya está correcto
router.get('/:id', ambiente_controller_1.obtenerAmbiente);
router.put('/:id', ambiente_controller_1.actualizarAmbiente);
router.delete('/:id', ambiente_controller_1.eliminarAmbiente);
router.post('/verificar-disponibilidad', ambiente_controller_1.verificarDisponibilidad);
exports.default = router;
//# sourceMappingURL=ambiente.routes.js.map