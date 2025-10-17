import { Response } from 'express';

type Client = {
  id: number;
  res: Response;
  channels: Set<string>;
  user?: { id?: string; role?: string };
};

const clients = new Map<number, Client>();
let nextId = 1;

export function addClient(res: Response, channels: string[], user?: { id?: string; role?: string }) {
  const id = nextId++;
  const client: Client = {
    id,
    res,
    channels: new Set(channels.map((c) => String(c).trim()).filter(Boolean)),
    user,
  };

  // Enviar configuración de reintento para reconexión automática
  try {
    res.write(`retry: 3000\n\n`);
  } catch (_) {
    // Ignorar
  }

  clients.set(id, client);
  return id;
}

export function removeClient(id: number) {
  const client = clients.get(id);
  if (client) {
    try {
      client.res.end();
    } catch (_) {}
  }
  clients.delete(id);
}

export function emitEvent(channel: string, event: string, payload: any = {}) {
  const message = JSON.stringify({ channel, ...payload, ts: Date.now() });
  clients.forEach((client) => {
    if (client.channels.has(channel)) {
      try {
        client.res.write(`event: ${event}\n`);
        client.res.write(`data: ${message}\n\n`);
      } catch (err) {
        // Si falla el write, limpiar el cliente
        clients.delete(client.id);
      }
    }
  });
}

// Atajos de eventos utilizados en la app
export const Events = {
  RESERVAS_UPDATED: 'reservas.updated',
  SOLICITUDES_CHANGED: 'solicitudes.changed',
  HISTORIAL_CHANGED: 'historial.changed',
};