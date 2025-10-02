import { Router } from 'express';
import {
  crearAmbiente,
  obtenerAmbientes,  // Cambiar getAmbientes por obtenerAmbientes
  obtenerAmbiente,
  actualizarAmbiente,
  eliminarAmbiente,
  verificarDisponibilidad
} from '../controllers/ambiente.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas públicas (solo lectura para usuarios autenticados)
router.get('/', obtenerAmbientes);  // Todos los usuarios autenticados pueden ver ambientes
router.get('/:id', obtenerAmbiente);  // Todos los usuarios autenticados pueden ver un ambiente específico
router.post('/verificar-disponibilidad', verificarDisponibilidad);  // Todos pueden verificar disponibilidad

// Rutas protegidas (solo administradores)
router.post('/', requireRole(['admin']), crearAmbiente);
router.put('/:id', requireRole(['admin']), actualizarAmbiente);
router.delete('/:id', requireRole(['admin']), eliminarAmbiente);

export default router;