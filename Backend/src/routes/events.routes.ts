import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import AppError from '../utils/appError';
import { addClient, removeClient, emitEvent, Events } from '../services/eventBus';

const router = Router();

// GET /api/v1/events/stream
router.get('/stream', async (req: Request, res: Response) => {
  // Configurar cabeceras SSE (expresas y amigables con CORS/SSE)
  try {
    const origin = req.headers.origin || '';
    // Content-Type correcto para SSE
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    // Deshabilitar caching y mantener conexión viva
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // Evitar buffering en proxies como Nginx
    res.setHeader('X-Accel-Buffering', 'no');
    // Fortalecer compatibilidad CORP/CORS para desarrollo
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    // Enviar cabeceras inmediatamente
    // @ts-ignore: flushHeaders puede existir en runtime
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }
  } catch (_) {
    // Si algo falla al configurar cabeceras, no romper el flujo
  }

  // Extraer token JWT desde query o header como respaldo
  const token = (req.query.token as string) || (req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : undefined);
  if (!token) {
    // Enviar evento de error pero mantener la conexión abierta para evitar ERR_ABORTED
    try {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'Token de acceso requerido' })}\n\n`);
    } catch (_) {}
    // Mantener la conexión con ping periódico aunque no se registre el cliente
    const keepAliveNoAuth = setInterval(() => {
      try { res.write(`:keepalive-noauth\n\n`); } catch (_) {}
    }, 25000);
    req.on('close', () => {
      clearInterval(keepAliveNoAuth);
      try { res.end(); } catch (_) {}
    });
    return; // No registrar cliente, sólo mantener la conexión
  }

  // Verificar token y usuario
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; iat: number };
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      // No usar 401 en SSE; emitir evento y cerrar
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'El usuario ya no existe' })}\n\n`);
      return res.end();
    }
    // Normalizar role
    (currentUser as any).role = (currentUser as any).role || (currentUser as any).rol;

    // Registrar cliente
    const channelsParam = String(req.query.channels || '').trim();
    const channels = (channelsParam ? channelsParam.split(',') : ['reservas','solicitudes','historial']).map(c => c.trim()).filter(Boolean);
    const clientId = addClient(res, channels, { id: String(currentUser._id || currentUser.id), role: (currentUser as any).role });

    // Notificar conexión
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ userId: String(currentUser._id || currentUser.id), role: (currentUser as any).role, channels, ts: Date.now() })}\n\n`);

    // Keep-alive ping
    const keepAlive = setInterval(() => {
      try { res.write(`:keepalive\n\n`); } catch (_) {}
    }, 25000);

    // Limpieza en cierre
    req.on('close', () => {
      clearInterval(keepAlive);
      removeClient(clientId);
    });
  } catch (err) {
    // Enviar evento de error pero mantener la conexión abierta para evitar ERR_ABORTED
    try {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'Token inválido', detail: err instanceof Error ? err.message : String(err) })}\n\n`);
    } catch (_) {}
    const keepAliveInvalid = setInterval(() => {
      try { res.write(`:keepalive-invalid\n\n`); } catch (_) {}
    }, 25000);
    req.on('close', () => {
      clearInterval(keepAliveInvalid);
      try { res.end(); } catch (_) {}
    });
    return; // No registrar cliente
  }
});

export default router;