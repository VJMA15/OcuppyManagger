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

// Rutas públicas (lectura sin autenticación)
router.get('/', obtenerAmbientes);
router.get('/:id', obtenerAmbiente);
router.post('/verificar-disponibilidad', verificarDisponibilidad);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, requireRole(['admin']), crearAmbiente);
router.put('/:id', authenticateToken, requireRole(['admin']), actualizarAmbiente);
router.delete('/:id', authenticateToken, requireRole(['admin']), eliminarAmbiente);

export default router;