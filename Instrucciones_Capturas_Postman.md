# 📸 Guía para Capturas de Pantalla en Postman - OcuppyManager

## 🎯 Objetivo
Documentar visualmente todos los casos de prueba ejecutados para crear evidencia completa de las validaciones realizadas.

## 📋 Lista de Capturas Requeridas

### 🔐 **AUTENTICACIÓN**

#### 1. ✅ **Registro Exitoso**
- **URL**: `POST http://localhost:5000/api/v1/auth/register`
- **Body (JSON)**:
```json
{
  "nombre": "Usuario Test",
  "email": "test@example.com",
  "cc": "12345678",
  "password": "Password123",
  "role": "instructor"
}
```
- **Capturar**: 
  - Request completo (URL, método, headers, body)
  - Response (Status 201, JSON con success: true, token)

#### 2. ❌ **Registro con Datos Inválidos**
- **URL**: `POST http://localhost:5000/api/v1/auth/register`
- **Body (JSON)**:
```json
{
  "nombre": "Usuario Test",
  "email": "test@example.com",
  "password": "password123"
}
```
- **Capturar**: 
  - Request completo
  - Response (Status 400, errores de validación)

#### 3. ✅ **Login Exitoso**
- **URL**: `POST http://localhost:5000/api/v1/auth/login`
- **Body (JSON)**:
```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```
- **Capturar**: 
  - Request completo
  - Response (Status 200, JSON con success: true, token)

#### 4. ❌ **Login con Credenciales Incorrectas**
- **URL**: `POST http://localhost:5000/api/v1/auth/login`
- **Body (JSON)**:
```json
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```
- **Capturar**: 
  - Request completo
  - Response (Status 401, error message)

### 🏢 **AMBIENTES**

#### 5. ✅ **Obtener Ambientes (Con Autenticación)**
- **URL**: `GET http://localhost:5000/api/v1/ambientes`
- **Headers**: 
  - `Authorization: Bearer [TOKEN_DEL_LOGIN]`
  - `Content-Type: application/json`
- **Capturar**: 
  - Request con headers de autorización
  - Response (Status 200, lista de ambientes)

#### 6. ❌ **Obtener Ambientes (Sin Autenticación)**
- **URL**: `GET http://localhost:5000/api/v1/ambientes`
- **Headers**: Solo `Content-Type: application/json`
- **Capturar**: 
  - Request sin token de autorización
  - Response (Status 401, error de acceso)

### 🚫 **CASOS DE ERROR**

#### 7. ❌ **Endpoint No Encontrado**
- **URL**: `GET http://localhost:5000/api/v1/nonexistent-endpoint`
- **Capturar**: 
  - Request a endpoint inexistente
  - Response (Status 404, error message)

## 📸 Instrucciones para Capturas

### 🔧 **Configuración Inicial en Postman**

1. **Abrir Postman**
2. **Importar la colección**: `OcuppyManager_API_Tests.postman_collection.json`
3. **Verificar servidor**: Asegurar que `http://localhost:5000` esté funcionando
4. **Configurar variables**:
   - `base_url`: `http://localhost:5000`
   - `token`: (se obtendrá del login)

### 📋 **Proceso de Captura**

Para cada caso de prueba:

1. **Configurar Request**:
   - Método HTTP correcto
   - URL completa
   - Headers necesarios
   - Body (si aplica)

2. **Ejecutar Request**:
   - Hacer clic en "Send"
   - Esperar respuesta completa

3. **Tomar Captura**:
   - Capturar pantalla completa mostrando:
     - Panel izquierdo con la request
     - Panel derecho con la response
     - Status code visible
     - Headers y body de respuesta

4. **Nombrar Archivo**:
   - `01_registro_exitoso.png`
   - `02_registro_error.png`
   - `03_login_exitoso.png`
   - `04_login_error.png`
   - `05_ambientes_con_auth.png`
   - `06_ambientes_sin_auth.png`
   - `07_endpoint_404.png`

### 🎯 **Puntos Importantes a Mostrar**

#### ✅ **Para Casos Exitosos**:
- Status code verde (200, 201)
- Campo `"success": true` en la respuesta
- Datos completos en la respuesta
- Token generado (para auth)

#### ❌ **Para Casos de Error**:
- Status code rojo (400, 401, 404)
- Campo `"success": false` en la respuesta
- Mensajes de error descriptivos
- Validaciones específicas

### 📁 **Organización de Archivos**

Crear carpeta: `C:\Users\VICTOR\OneDrive\Desktop\OcuppyManagger\capturas_postman\`

Estructura:
```
capturas_postman/
├── 01_registro_exitoso.png
├── 02_registro_error.png
├── 03_login_exitoso.png
├── 04_login_error.png
├── 05_ambientes_con_auth.png
├── 06_ambientes_sin_auth.png
└── 07_endpoint_404.png
```

## 🔄 **Orden de Ejecución Recomendado**

1. **Registro Exitoso** → Obtener usuario válido
2. **Login Exitoso** → Obtener token
3. **Ambientes con Auth** → Usar token obtenido
4. **Registro con Error** → Validar errores
5. **Login con Error** → Validar credenciales incorrectas
6. **Ambientes sin Auth** → Validar protección
7. **Endpoint 404** → Validar manejo de errores

## ✅ **Checklist de Validación**

Para cada captura, verificar que se muestre:

- [ ] URL completa y método HTTP
- [ ] Headers (especialmente Authorization cuando aplique)
- [ ] Body del request (para POST)
- [ ] Status code claramente visible
- [ ] Response completa con formato JSON
- [ ] Tiempo de respuesta
- [ ] Tamaño de la respuesta

## 🎯 **Resultado Final**

Al completar todas las capturas, tendrás evidencia visual completa de:

1. **Funcionalidad Correcta**: Casos exitosos funcionando
2. **Manejo de Errores**: Validaciones y errores apropiados
3. **Seguridad**: Protección de endpoints
4. **Consistencia**: Estructura de respuesta uniforme

Estas capturas servirán como evidencia para el reporte final de pruebas funcionales y demostrarán la calidad de la API de OcuppyManager.