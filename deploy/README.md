# Despliegue por SSH (VM con Nginx + PM2)

Este guion te permite desplegar el frontend (Vite) y backend (Node/Express) en un servidor accesible por SSH.

## Supuestos
- Servidor Linux (Ubuntu/Debian) con acceso SSH.
- IP del servidor: `51.143.132.191`.
- Backend escuchará en `:5000` (PM2).
- Nginx servirá el frontend en `:80` y hará proxy al backend (`/api/*` y SSE `/api/v1/events/stream`).

## Rutas remotas
- Frontend: `/var/www/occupymanager/frontend`
- Backend: `/opt/occupymanager/backend`

## Pasos rápidos
1) Preparar el servidor (Node, PM2, Nginx):
   - Ejecuta en el servidor:
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
     sudo apt-get install -y nodejs nginx
     sudo npm i -g pm2
     sudo mkdir -p /var/www/occupymanager/frontend /opt/occupymanager/backend
     sudo chown -R $USER:$USER /var/www/occupymanager /opt/occupymanager
     ```

2) Variables de entorno del backend:
   - Copia `Backend/.env.example` a `/opt/occupymanager/backend/.env` y completa:
     - `NODE_ENV=production`
     - `PORT=5000`
     - `MONGODB_URI=<cadena de conexión>`
     - `JWT_SECRET=<secreto robusto>`
     - `CLIENT_URL=http://51.143.132.191`
     - `CORS_ALLOWED_ORIGINS=http://51.143.132.191`

3) Subir artefactos:
   - Frontend: subir `Frontend/dist` al servidor.
   - Backend: subir carpeta `Backend` (código + package.json + dist tras build, o construir en el servidor).

4) Configurar Nginx:
   - Copia `deploy/nginx.conf.example` a `/etc/nginx/sites-available/occupymanager`.
   - En el servidor:
     ```bash
     sudo ln -sf /etc/nginx/sites-available/occupymanager /etc/nginx/sites-enabled/occupymanager
     sudo nginx -t && sudo systemctl reload nginx
     ```

5) Construir y levantar backend con PM2:
   ```bash
   cd /opt/occupymanager/backend
   npm install
   npm run build
   pm2 start dist/app.js --name occupymanager-api
   pm2 save && pm2 startup
   ```

6) Verificación:
   - Frontend: `http://51.143.132.191` debe cargar la app.
   - API root: `http://51.143.132.191/api/v1` responde JSON de info.
   - SSE: al autenticarse, la app conecta a `/api/v1/events/stream` (ver consola del navegador para eventos).

## Notas
- Si usas HTTPS, ajusta `VITE_API_BASE_URL`/`VITE_SSE_BASE_URL` a `https://` y configura certificados en Nginx.
- Abre puertos si aplica: `sudo ufw allow 80` y `sudo ufw allow 5000`.
- Para despliegues repetibles en Windows, usa `deploy/deploy.ps1`.