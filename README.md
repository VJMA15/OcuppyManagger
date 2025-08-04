# Occupy Manager - Sistema de Gestión de Reservas

Sistema completo para la gestión de reservas de ambientes con frontend en React y backend en Node.js.

## 🚀 Características

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Autenticación**: JWT
- **API RESTful**: Documentada con Swagger
- **Interfaz moderna**: Diseño responsive y dark mode

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MongoDB (local o Atlas)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd OcuppyManagger
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno

#### Backend (.env en la carpeta Backend/)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/occupy-manager
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_EXPIRES_IN=90d
```

#### Frontend (configuración en src/config/api.js)
La URL de la API está configurada por defecto en `http://localhost:5000/api/v1`

## 🚀 Ejecutar el Proyecto

### Opción 1: Ejecutar todo junto
```bash
npm run dev
```

### Opción 2: Ejecutar por separado

#### Backend
```bash
npm run dev:backend
# o
cd Backend && npm run dev
```

#### Frontend
```bash
npm run dev:frontend
# o
cd Frontend && npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Documentación API**: http://localhost:5000/api-docs

## 📁 Estructura del Proyecto

```
OcuppyManagger/
├── Backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Controladores de la API
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Middlewares personalizados
│   │   └── utils/          # Utilidades
│   └── package.json
├── Frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Servicios de API
│   │   ├── routes/        # Páginas/Rutas
│   │   └── config/        # Configuración
│   └── package.json
└── package.json           # Scripts principales
```

## 🔌 Conexión Frontend-Backend

### Configuración de la API

El frontend está configurado para conectarse automáticamente al backend a través de:

1. **Configuración de API** (`Frontend/src/config/api.js`)
2. **Servicio de API** (`Frontend/src/services/api.js`)
3. **Hooks personalizados** para cada entidad

### Endpoints Disponibles

- **Autenticación**: `/api/v1/auth`
- **Usuarios**: `/api/v1/users`
- **Ambientes**: `/api/v1/ambientes`
- **Reservas**: `/api/v1/reservas`
- **Registros**: `/api/v1/registros`
- **Bitácora**: `/api/v1/bitacora`

### Estado de Conexión

El sistema incluye un indicador de estado de conexión que muestra:
- ✅ **Conectado**: Backend disponible
- ❌ **Sin conexión**: Error de conexión
- 🔄 **Conectando**: Verificando conexión

## 🔧 Desarrollo

### Agregar nuevos endpoints

1. **Backend**: Crear controlador y ruta en `Backend/src/`
2. **Frontend**: Agregar método en `Frontend/src/services/api.js`
3. **Frontend**: Crear hook personalizado en `Frontend/src/hooks/`

### Ejemplo de uso de hooks

```javascript
import useAmbientes from '@/hooks/useAmbientes';
import useReservas from '@/hooks/useReservas';

function MiComponente() {
  const { ambientes, isLoading, createAmbiente } = useAmbientes();
  const { reservas, createReserva } = useReservas();

  // Usar los datos y métodos...
}
```

## 🐛 Solución de Problemas

### Error de CORS
- Verificar que el backend esté ejecutándose en el puerto 5000
- Revisar la configuración de CORS en `Backend/src/app.js`

### Error de conexión a MongoDB
- Verificar que MongoDB esté ejecutándose
- Revisar la variable `MONGODB_URI` en el archivo `.env`

### Error de módulos no encontrados
- Ejecutar `npm run install:all` para instalar todas las dependencias

## 📝 Scripts Disponibles

- `npm run dev`: Ejecutar frontend y backend en desarrollo
- `npm run dev:backend`: Solo backend
- `npm run dev:frontend`: Solo frontend
- `npm run build`: Construir frontend para producción
- `npm run install:all`: Instalar todas las dependencias

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
