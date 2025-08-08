import { Router } from 'express';
import {
  crearAmbiente,
  obtenerAmbientes,  // Cambiar getAmbientes por obtenerAmbientes
  obtenerAmbiente,
  actualizarAmbiente,
  eliminarAmbiente,
  verificarDisponibilidad
} from '../controllers/ambiente.controller';

const router = Router();

router.post('/', crearAmbiente);
router.get('/', obtenerAmbientes);  // Esto ya está correcto
router.get('/:id', obtenerAmbiente);
router.put('/:id', actualizarAmbiente);
router.delete('/:id', eliminarAmbiente);
router.post('/verificar-disponibilidad', verificarDisponibilidad);

export default router;