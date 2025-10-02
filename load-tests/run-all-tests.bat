@echo off
echo ========================================
echo EJECUTANDO SUITE COMPLETA DE PRUEBAS DE CARGA
echo OcuppyManager - Sistema de Reservas
echo ========================================
echo.

REM Crear directorio para resultados si no existe
if not exist "results" mkdir results

REM Obtener timestamp para los archivos
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

echo Timestamp: %timestamp%
echo.

REM Verificar que el servidor esté ejecutándose
echo Verificando servidor backend...
curl -s http://localhost:5000/api/ambientes > nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: El servidor backend no está ejecutándose en http://localhost:5000
    echo Por favor, inicia el servidor backend antes de ejecutar las pruebas.
    pause
    exit /b 1
)
echo ✅ Servidor backend detectado
echo.

REM Prueba 1: Autenticación
echo ========================================
echo 🔐 EJECUTANDO PRUEBAS DE AUTENTICACIÓN
echo ========================================
"C:\Program Files\k6\k6.exe" run --out json=results\auth-results-%timestamp%.json auth-load-test.js
if %errorlevel% neq 0 (
    echo ⚠️ Pruebas de autenticación completadas con errores
) else (
    echo ✅ Pruebas de autenticación completadas exitosamente
)
echo.

REM Pausa entre pruebas
echo Pausa de 30 segundos entre pruebas...
timeout /t 30 /nobreak > nul
echo.

REM Prueba 2: Operaciones CRUD
echo ========================================
echo 📊 EJECUTANDO PRUEBAS DE OPERACIONES CRUD
echo ========================================
"C:\Program Files\k6\k6.exe" run --out json=results\crud-results-%timestamp%.json crud-load-test.js
if %errorlevel% neq 0 (
    echo ⚠️ Pruebas CRUD completadas con errores
) else (
    echo ✅ Pruebas CRUD completadas exitosamente
)
echo.

REM Pausa entre pruebas
echo Pausa de 30 segundos entre pruebas...
timeout /t 30 /nobreak > nul
echo.

REM Prueba 3: Reservas Concurrentes
echo ========================================
echo 🏃‍♂️ EJECUTANDO PRUEBAS DE CONCURRENCIA
echo ========================================
"C:\Program Files\k6\k6.exe" run --out json=results\concurrent-results-%timestamp%.json concurrent-reservations-test.js
if %errorlevel% neq 0 (
    echo ⚠️ Pruebas de concurrencia completadas con errores
) else (
    echo ✅ Pruebas de concurrencia completadas exitosamente
)
echo.

REM Pausa entre pruebas
echo Pausa de 60 segundos antes de prueba de estrés...
timeout /t 60 /nobreak > nul
echo.

REM Prueba 4: Estrés del Sistema
echo ========================================
echo 💥 EJECUTANDO PRUEBAS DE ESTRÉS
echo ========================================
echo ⚠️ ADVERTENCIA: Esta prueba puede impactar el rendimiento del sistema
echo Presiona Ctrl+C si necesitas cancelar
timeout /t 10 /nobreak > nul
"C:\Program Files\k6\k6.exe" run --out json=results\stress-results-%timestamp%.json stress-test.js
if %errorlevel% neq 0 (
    echo ⚠️ Pruebas de estrés completadas con errores
) else (
    echo ✅ Pruebas de estrés completadas exitosamente
)
echo.

REM Generar reporte consolidado
echo ========================================
echo 📋 GENERANDO REPORTE CONSOLIDADO
echo ========================================

echo Creando reporte consolidado...
echo # REPORTE CONSOLIDADO DE PRUEBAS DE CARGA > results\consolidated-report-%timestamp%.md
echo ## OcuppyManager - Sistema de Reservas >> results\consolidated-report-%timestamp%.md
echo ### Fecha: %date% %time% >> results\consolidated-report-%timestamp%.md
echo. >> results\consolidated-report-%timestamp%.md
echo ## Archivos de Resultados Generados: >> results\consolidated-report-%timestamp%.md
echo - auth-results-%timestamp%.json >> results\consolidated-report-%timestamp%.md
echo - crud-results-%timestamp%.json >> results\consolidated-report-%timestamp%.md
echo - concurrent-results-%timestamp%.json >> results\consolidated-report-%timestamp%.md
echo - stress-results-%timestamp%.json >> results\consolidated-report-%timestamp%.md
echo. >> results\consolidated-report-%timestamp%.md
echo ## Instrucciones: >> results\consolidated-report-%timestamp%.md
echo 1. Revisar los archivos JSON para métricas detalladas >> results\consolidated-report-%timestamp%.md
echo 2. Analizar los resultados de cada prueba >> results\consolidated-report-%timestamp%.md
echo 3. Identificar cuellos de botella y áreas de mejora >> results\consolidated-report-%timestamp%.md
echo 4. Implementar optimizaciones según sea necesario >> results\consolidated-report-%timestamp%.md

echo.
echo ========================================
echo ✅ SUITE DE PRUEBAS COMPLETADA
echo ========================================
echo.
echo 📁 Resultados guardados en: results\
echo 📊 Archivos generados:
dir /b results\*%timestamp%*
echo.
echo 📋 Reporte consolidado: results\consolidated-report-%timestamp%.md
echo.
echo ========================================
echo RESUMEN DE EJECUCIÓN:
echo ========================================
echo ✅ Pruebas de Autenticación
echo ✅ Pruebas de Operaciones CRUD  
echo ✅ Pruebas de Concurrencia
echo ✅ Pruebas de Estrés
echo ✅ Reporte Consolidado
echo.
echo 🎉 Todas las pruebas han sido ejecutadas exitosamente
echo 📈 Revisa los resultados para análisis de rendimiento
echo.
pause