# OcuppyManagger
Este es un proyecto final en el cual esta trabajando el equipo NexAccess, el cual consiste en un administrador de ambientes con el cual se puedan realizar solicitudes para poder reservar un ambiente o auditorio para un determinado dia y asi hacer uso de él de manera eficiente, sin la preocupacion de que se tengan que retirar por otros eventos pendientes.

OccupyManager es una aplicación web desarrollada para la gestión de reservas de ambientes del SENA. Este documento técnico describe la arquitectura del sistema, los componentes de software, las dependencias, y los procedimientos necesarios para su despliegue, mantenimiento y futuras mejoras.
# Arquitectura del Sistema
El sistema sigue el patrón MVC (Modelo–Vista–Controlador) bajo una arquitectura Cliente–Servidor. El backend está implementado en Node.js con Express, mientras que el frontend utiliza React.js para ofrecer una interfaz interactiva y dinámica. Los datos se almacenan en MongoDB. El despliegue se realiza directamente en el servidor sin el uso de Docker, garantizando flexibilidad y control.
(Figura 1: Diagrama de Arquitectura del Sistema)
Frontend (React.js) → API REST (Node.js / Express) → MongoDB



# Estructura del Proyecto
El proyecto se divide en dos capas principales: backend y frontend, organizadas de la siguiente manera:

occupymanager/

│

├── backend/

│   ├── config/          # Configuración y conexión a MongoDB

│   ├── controllers/     # Lógica de negocio

│   ├── models/          # Esquemas Mongoose

│   ├── routes/          # Rutas de la API REST

│   └── middlewares/     # Validación JWT y roles

│

├── frontend/

│   ├── src/

│   │   ├── components/  # Componentes React reutilizables

│   │   ├── pages/       # Páginas (Dashboard, Login, Reservas)

│   │   ├── services/    # Llamadas API con Axios

│   │   └── App.js       # Punto de entrada principal

│   └── public/          # Archivos estáticos

│

└── README.md            # Documentación general del repositorio



# Dependencias del Proyecto
Dependencia	Versión	Uso Principal
Node.js	18.x	Entorno de ejecución backend
Express	4.18	Framework web
Mongoose	7.x	ODM para MongoDB
React	18.x	Framework frontend
Axios	1.x	Comunicación HTTP con backend
bcrypt	5.x	Encriptación de contraseñas
jsonwebtoken	9.x	Gestión de tokens JWT
dotenv	16.x	Gestión de variables de entorno
pm2	5.x	Ejecución persistente en servidor



# API REST
El backend expone una API RESTful que permite realizar operaciones sobre usuarios, ambientes y reservas. Los endpoints principales son:
• POST /api/login – Autenticación de usuario (Administrador/Instructor)
• GET /api/ambientes – Consultar ambientes disponibles
• POST /api/reservas – Crear reserva (Instructor)
• PUT /api/reservas/:id/aprobar – Aprobar o rechazar reserva (Administrador)
• GET /api/reportes – Generar reportes de ocupación (Administrador)



# Configuración y Despliegue
Configuración de entorno (.env):
PORT=3000
MONGO_URI=mongodb://localhost:27017/occupymanager
JWT_SECRET=claveSegura



# Pasos para el despliegue:
1. Clonar el repositorio del proyecto.
2. Instalar dependencias con npm install en backend y frontend.
3. Ejecutar el backend con npm start o pm2 start server.js.
4. Compilar el frontend con npm run build.
5. Servir la carpeta build mediante Nginx o Apache.
7. Estrategia de Pruebas (QA)
Se aplicaron pruebas funcionales, unitarias y de rendimiento.
• Postman: pruebas de endpoints API.
• Jest: pruebas unitarias de controladores.
• Cypress: validación de interfaz React.
• JMeter: rendimiento con hasta 30 usuarios concurrentes.



# Seguridad
• Hash de contraseñas con bcrypt.
• Tokens JWT para autenticación segura.
• Middleware de autorización por rol.
• Conexión HTTPS en despliegue institucional.



# Plan de Mantenimiento
El mantenimiento del sistema se divide en:
• Preventivo: revisión de logs, respaldos y monitoreo.
• Correctivo: resolución de errores en producción.
• Evolutivo: incorporación de mejoras o nuevos módulos.

