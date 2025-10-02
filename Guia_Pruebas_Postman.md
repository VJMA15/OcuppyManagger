# 📋 Guía de Pruebas API con Postman - OcuppyManager

## 🎯 Objetivo
Validar el correcto funcionamiento de la API de OcuppyManager mediante pruebas sistemáticas que verifiquen tanto **respuestas correctas** como **respuestas incorrectas**.

## 📦 Configuración Inicial

### 1. Importar la Colección
1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar el archivo `OcuppyManager_API_Tests.postman_collection.json`
4. Confirmar la importación

### 2. Verificar Variables de Entorno
La colección incluye las siguientes variables:
- `base_url`: http://localhost:5000/api/v1
- `auth_token`: (se actualiza automáticamente tras login exitoso)
- `user_id`: (se actualiza automáticamente tras login exitoso)
- `ambiente_id`: (se actualiza automáticamente tras obtener ambientes)

### 3. Verificar Servidor Backend
Antes de ejecutar las pruebas, asegurar que el servidor esté funcionando:
```bash
# Verificar que el servidor responda
curl http://localhost:5000/api/v1
```

## 🧪 Casos de Prueba Incluidos

### 🔐 AUTENTICACIÓN

#### ✅ Casos Exitosos
1. **Registro Exitoso**
   - **Endpoint**: `POST /auth/register`
   - **Validaciones**:
     - Status code: 201
     - Campo `success: true`
     - Contiene datos del usuario creado
   - **Datos de prueba**: Usuario válido con todos los campos requeridos

2. **Login Exitoso**
   - **Endpoint**: `POST /auth/login`
   - **Validaciones**:
     - Status code: 200
     - Campo `success: true`
     - Contiene token de autenticación
     - Guarda token automáticamente en variables
   - **Datos de prueba**: Credenciales válidas

#### ❌ Casos de Error
1. **Registro - Email Duplicado**
   - **Validaciones**:
     - Status code: 400
     - Campo `success: false`
     - Mensaje de error descriptivo

2. **Registro - Datos Inválidos**
   - **Validaciones**:
     - Status code: 400
     - Campo `success: false`
     - Mensaje de validación

3. **Login - Credenciales Incorrectas**
   - **Validaciones**:
     - Status code: 401
     - Campo `success: false`
     - Mensaje de error de autenticación

4. **Login - Usuario No Existe**
   - **Validaciones**:
     - Status code: 401
     - Campo `success: false`
     - Mensaje de error apropiado

### 🏢 AMBIENTES

#### ✅ Casos Exitosos
1. **Obtener Todos los Ambientes**
   - **Endpoint**: `GET /ambientes`
   - **Validaciones**:
     - Status code: 200
     - Campo `success: true`
     - Array de ambientes
     - Guarda ID del primer ambiente

2. **Obtener Ambiente por ID**
   - **Endpoint**: `GET /ambientes/:id`
   - **Validaciones**:
     - Status code: 200
     - Campo `success: true`
     - Datos completos del ambiente

#### ❌ Casos de Error
1. **Obtener Ambiente - ID Inválido**
   - **Validaciones**:
     - Status code: 400 o 404
     - Campo `success: false`
     - Mensaje de error

2. **Obtener Ambiente - No Existe**
   - **Validaciones**:
     - Status code: 404
     - Campo `success: false`
     - Mensaje de error

### 👥 USUARIOS (Requiere Autenticación)

#### ✅ Casos Exitosos
1. **Obtener Mi Perfil**
   - **Endpoint**: `GET /auth/me`
   - **Validaciones**:
     - Status code: 200
     - Campo `success: true`
     - Datos del usuario autenticado

#### ❌ Casos de Error
1. **Obtener Perfil - Sin Token**
   - **Validaciones**:
     - Status code: 401
     - Campo `success: false`
     - Mensaje de error de autorización

2. **Obtener Perfil - Token Inválido**
   - **Validaciones**:
     - Status code: 401
     - Campo `success: false`
     - Mensaje de error de token

### 🚫 CASOS DE ERROR GENERALES

1. **Endpoint No Encontrado**
   - **Validaciones**:
     - Status code: 404
     - Campo `success: false`
     - Mensaje de error

2. **Método HTTP No Permitido**
   - **Validaciones**:
     - Status code: 405
     - Campo `success: false`
     - Mensaje de error

## 🚀 Ejecución de Pruebas

### Orden Recomendado de Ejecución

1. **Primero**: Ejecutar casos de error de autenticación (para verificar validaciones)
2. **Segundo**: Ejecutar registro exitoso
3. **Tercero**: Ejecutar login exitoso (esto configurará el token)
4. **Cuarto**: Ejecutar pruebas de ambientes
5. **Quinto**: Ejecutar pruebas de usuarios autenticados
6. **Sexto**: Ejecutar casos de error generales

### Ejecución Individual
1. Seleccionar la prueba específica
2. Hacer clic en "Send"
3. Verificar que todos los tests pasen (verde)
4. Revisar la respuesta en la pestaña "Body"

### Ejecución en Lote
1. Hacer clic derecho en la carpeta de pruebas
2. Seleccionar "Run collection"
3. Configurar el orden de ejecución
4. Hacer clic en "Run"
5. Revisar el reporte de resultados

## 📊 Interpretación de Resultados

### 🟢 Test Passed (Verde)
- La validación fue exitosa
- La API responde según lo esperado
- Los datos son correctos

### 🔴 Test Failed (Rojo)
- Hay un problema con la respuesta
- Revisar el código de estado
- Verificar la estructura de datos
- Comprobar la configuración del servidor

### ⚠️ Casos Especiales
- **403 Forbidden**: Usuario sin permisos suficientes
- **404 Not Found**: Recurso no encontrado (puede ser esperado)
- **401 Unauthorized**: Token inválido o expirado

## 🔧 Troubleshooting

### Problema: "Connection refused"
**Solución**: Verificar que el servidor backend esté ejecutándose en puerto 5000

### Problema: "401 Unauthorized" en todas las requests
**Solución**: 
1. Ejecutar "Login - Success" primero
2. Verificar que el token se guardó en las variables

### Problema: Tests fallan por datos faltantes
**Solución**:
1. Ejecutar las pruebas en el orden recomendado
2. Verificar que las variables se estén guardando correctamente

### Problema: "404 Not Found" en endpoints válidos
**Solución**:
1. Verificar que la URL base sea correcta
2. Confirmar que el servidor tenga las rutas configuradas

## 📸 Capturas de Evidencia

Para cada caso de prueba, tomar capturas de pantalla que muestren:

1. **Request configurado** (método, URL, headers, body)
2. **Response recibido** (status code, headers, body)
3. **Tests ejecutados** (resultados de validaciones)
4. **Variables actualizadas** (si aplica)

### Casos Críticos para Capturar
- ✅ Login exitoso con token generado
- ❌ Login fallido con credenciales incorrectas
- ✅ Obtener ambientes con datos válidos
- ❌ Endpoint no encontrado (404)
- ❌ Acceso sin autorización (401)

## 📋 Checklist de Validaciones

### Para Cada Endpoint - Casos Exitosos
- [ ] ✅ Status code correcto (200, 201, etc.)
- [ ] ✅ Campo `success: true`
- [ ] ✅ Mensaje descriptivo apropiado
- [ ] ✅ Datos en el formato esperado
- [ ] ✅ Campos requeridos presentes
- [ ] ✅ Tipos de datos correctos
- [ ] ✅ IDs en formato MongoDB válido
- [ ] ✅ Fechas en formato ISO 8601
- [ ] ✅ No exposición de datos sensibles

### Para Cada Endpoint - Casos de Error
- [ ] ❌ Status code de error apropiado
- [ ] ❌ Campo `success: false`
- [ ] ❌ Mensaje de error descriptivo
- [ ] ❌ No exposición de información sensible
- [ ] ❌ Estructura de respuesta consistente

## 📈 Métricas de Éxito

- **Cobertura de Casos**: 100% de endpoints críticos probados
- **Validaciones**: Todos los tests deben pasar
- **Tiempo de Respuesta**: < 2 segundos para operaciones simples
- **Consistencia**: Estructura de respuesta uniforme
- **Seguridad**: No exposición de datos sensibles

## 🎯 Próximos Pasos

1. Ejecutar todas las pruebas sistemáticamente
2. Documentar cualquier fallo encontrado
3. Tomar capturas de evidencia
4. Generar reporte final con hallazgos
5. Proponer mejoras basadas en los resultados