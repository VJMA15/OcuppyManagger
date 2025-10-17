$USER = "<usuario>"          # ej. azureuser
$HOST = "51.143.132.191"

$BACKEND_LOCAL = "c:\Users\VICTOR\OneDrive\Desktop\OcuppyManagger\Backend"
$FRONTEND_DIST = "c:\Users\VICTOR\OneDrive\Desktop\OcuppyManagger\Frontend\dist"

$BACKEND_REMOTE = "/opt/occupymanager/backend"
$FRONTEND_REMOTE = "/var/www/occupymanager/frontend"

Write-Host "Creando directorios remotos y ajustando permisos..."
ssh "$USER@$HOST" "sudo mkdir -p $FRONTEND_REMOTE $BACKEND_REMOTE && sudo chown -R $USER:$USER /var/www/occupymanager /opt/occupymanager"

Write-Host "Subiendo frontend (dist)..."
scp -r "$FRONTEND_DIST/*" "$USER@$HOST:$FRONTEND_REMOTE/"

Write-Host "Subiendo backend..."
scp -r "$BACKEND_LOCAL/*" "$USER@$HOST:$BACKEND_REMOTE/"

Write-Host "Instalando dependencias y construyendo backend..."
ssh "$USER@$HOST" "cd $BACKEND_REMOTE && npm install && npm run build && (pm2 restart occupymanager-api || pm2 start dist/app.js --name occupymanager-api) && pm2 save"

Write-Host "Configurando Nginx..."
scp "$(Split-Path $MyInvocation.MyCommand.Path)/nginx.conf.example" "$USER@$HOST:/tmp/occupymanager.nginx"
ssh "$USER@$HOST" "sudo mv /tmp/occupymanager.nginx /etc/nginx/sites-available/occupymanager && sudo ln -sf /etc/nginx/sites-available/occupymanager /etc/nginx/sites-enabled/occupymanager && sudo nginx -t && sudo systemctl reload nginx"

Write-Host "Despliegue completo. Verifica en: http://$HOST"