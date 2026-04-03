@echo off
TITLE Instalador del Sistema de Reservas
COLOR 0B

echo ==========================================
echo    INSTALADOR DEL SISTEMA DE RESERVAS
echo ==========================================
echo.

:: 1. Verificar si Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. 
    echo Por favor, descarga e instala Node.js desde https://nodejs.org/
    pause
    exit /b
)

echo [1/3] Node.js detectado correctamente.
echo.

:: 2. Instalar dependencias
echo [2/3] Instalando dependencias del sistema...
echo Esto puede tomar un minuto...
call npm install --no-fund --no-audit
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias.
    pause
    exit /b
)
echo.

:: 3. Preparar el sistema (Build)
echo [3/3] Optimizando el sistema para produccion...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Error al compilar el sistema.
    pause
    exit /b
)

echo.
echo ==========================================
echo    INSTALACION COMPLETADA CON EXITO
echo ==========================================
echo.
echo Ahora puedes usar "INICIAR_SISTEMA.bat" para lanzar el programa.
echo.
pause
