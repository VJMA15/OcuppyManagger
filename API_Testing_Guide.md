# Guía de Pruebas de API - OcuppyManager

## Descripción General
Esta guía te ayudará a realizar pruebas exhaustivas de la API de OcuppyManager utilizando Postman, validando tanto respuestas correctas como incorrectas.

## Archivos Incluidos
- `OcuppyManager_API_Tests.postman_collection.json` - Colección completa de pruebas
- `OcuppyManager_Environment.postman_environment.json` - Variables de entorno

## Configuración Inicial

### 1. Importar en Postman
1. Abre Postman
2. Haz clic en "Import"
3. Selecciona ambos archivos JSON
4. Confirma la importación

### 2. Configurar el Entorno
1. Selecciona el entorno "OcuppyManager Environment"
2. Verifica que `base_url` esté configurada como `https://ocuppymanagger-api.netlify.app/api`
3. Asegúrate de que el servidor backend esté ejecutándose

### 3. Verificar el Servidor
Antes de ejecutar las pruebas, confirma que:
- El servidor backend esté corriendo en `https://ocuppymanagger-api.netlify.app`
- La base de datos esté conectada
- No hay errores en la consola del servidor

## Estructura de Pruebas

### 📁 Authentication
Pruebas de autenticación y autorización:

#### ✅ Casos Exitosos:
- **Register User - Success**: Registro de usuario válido
- **Login - Success**: Inicio de sesión correcto (guarda el token automáticamente)
- **Verify Token - Success**: Validación de token válido

#### ❌ Casos de Error:
- **Register User - Invalid Email**: Email con formato incorrecto
- **Login - Invalid Credentials**: Credenciales incorrectas
- **Verify Token - Invalid Token**: Token inválido o expirado

### 📁 Ambientes
Pruebas de gestión de ambientes:

#### ✅ Casos Exitosos:
- **Get All Ambientes - Success**: Listar todos los ambientes
- **Get Ambiente by ID - Success**: Obtener ambiente específico
- **Create Ambiente - Success**: Crear nuevo ambiente (solo admin)

#### ❌ Casos de Error:
- **Get All Ambientes - No Token**: Acceso sin autenticación
- **Get Ambiente by Invalid ID**: ID de ambiente inválido
- **Create Ambiente**: Sin permisos de administrador

### 📁 Reservas
Pruebas de sistema de reservas:

#### ✅ Casos Exitosos:
- **Create Reserva - Success**: Crear nueva reserva
- **Get My Reservations - Success**: Listar reservas del usuario
- **Get All Reservations**: Listar todas las reservas (admin/guardia)
- **Approve Reserva**: Aprobar reserva (admin/guardia)

#### ❌ Casos de Error:
- **Create Reserva - Missing Required Fields**: Campos obligatorios faltantes
- **Get All Reservations**: Sin permisos adecuados
- **Approve Reserva**: Sin permisos o reserva inexistente

### 📁 Users
Pruebas de gestión de usuarios:

#### ✅ Casos Exitosos:
- **Get All Users**: Listar usuarios (solo admin)
- **Get User Profile**: Obtener perfil del usuario autenticado

#### ❌ Casos de Error:
- **Get All Users**: Sin permisos de administrador

### 📁 Error Scenarios
Pruebas de manejo de errores:

#### ❌ Casos de Error:
- **404 - Endpoint Not Found**: Endpoint inexistente
- **500 - Server Error Simulation**: Simulación de error del servidor

## Ejecución de Pruebas

### Método 1: Ejecución Individual
1. Selecciona una carpeta o request específico
2. Haz clic en "Send"
3. Revisa la respuesta y los tests automáticos en la pestaña "Test Results"

### Método 2: Ejecución de Colección Completa
1. Haz clic derecho en la colección "OcuppyManager API Tests"
2. Selecciona "Run collection"
3. Configura las opciones de ejecución
4. Haz clic en "Run OcuppyManager API Tests"

### Método 3: Ejecución por Carpetas
1. Haz clic derecho en una carpeta específica (ej: "Authentication")
2. Selecciona "Run folder"
3. Revisa los resultados

## Validaciones Automáticas

Cada request incluye tests automáticos que validan:

### ✅ Respuestas Exitosas:
- Código de estado correcto (200, 201)
- Estructura de respuesta válida
- Presencia de campos requeridos
- Tipos de datos correctos
- Guardado automático de variables (tokens, IDs)

### ❌ Respuestas de Error:
- Códigos de estado de error apropiados (400, 401, 403, 404, 500)
- Mensajes de error informativos
- Estructura de error consistente
- Validación de campos faltantes

## Orden Recomendado de Ejecución

### 1. Preparación
```
1. Authentication → Register User - Success
2. Authentication → Login - Success
```

### 2. Pruebas Funcionales
```
3. Ambientes → Get All Ambientes - Success
4. Reservas → Create Reserva - Success
5. Reservas → Get My Reservations - Success
6. Users → Get User Profile - Success
```

### 3. Pruebas de Errores
```
7. Authentication → Login - Invalid Credentials
8. Ambientes → Get All Ambientes - No Token
9. Error Scenarios → 404 - Endpoint Not Found
```

## Interpretación de Resultados

### 🟢 Test Passed
- La validación fue exitosa
- La API responde según lo esperado
- Los datos son correctos

### 🔴 Test Failed
- Hay un problema con la respuesta
- Revisar el código de estado
- Verificar la estructura de datos
- Comprobar la configuración del servidor

### ⚠️ Casos Especiales
- **403 Forbidden**: Usuario sin permisos suficientes (normal para instructores)
- **404 Not Found**: Recurso no encontrado (puede ser esperado)
- **401 Unauthorized**: Token inválido o expirado

## Troubleshooting

### Problema: "Connection refused"
**Solución**: Verificar que el servidor backend esté ejecutándose

### Problema: "401 Unauthorized" en todas las requests
**Solución**: 
1. Ejecutar "Login - Success" primero
2. Verificar que el token se guardó en las variables

### Problema: "403 Forbidden" en operaciones admin
**Solución**: 
1. Crear un usuario administrador en la base de datos
2. Usar credenciales de administrador para el login

### Problema: Tests fallan por datos faltantes
**Solución**:
1. Ejecutar las pruebas en el orden recomendado
2. Verificar que las variables se estén guardando correctamente

## Variables de Entorno Importantes

- `base_url`: URL base de la API
- `auth_token`: Token de autenticación (se actualiza automáticamente)
- `user_id`: ID del usuario autenticado
- `ambiente_id`: ID de ambiente para pruebas
- `reserva_id`: ID de reserva para pruebas

## Reportes y Documentación

Después de ejecutar las pruebas:
1. Exportar los resultados desde Postman
2. Documentar cualquier fallo encontrado
3. Reportar bugs o inconsistencias en la API
4. Actualizar la documentación según sea necesario

## Casos de Prueba Adicionales

Para pruebas más exhaustivas, considera agregar:
- Pruebas de carga con múltiples usuarios
- Validación de límites de datos
- Pruebas de concurrencia en reservas
- Validación de fechas y horarios
- Pruebas de seguridad adicionales

---

**Nota**: Esta guía asume que tienes conocimientos básicos de Postman y APIs REST. Si encuentras problemas, revisa la documentación oficial de Postman o consulta con el equipo de desarrollo.