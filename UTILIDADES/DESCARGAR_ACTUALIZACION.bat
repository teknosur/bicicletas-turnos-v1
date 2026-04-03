@echo off
TITLE Descargar Actualizacion - Sistema de Reservas
COLOR 0B
echo ===========================================
echo    ACTUALIZANDO SISTEMA DESDE GITHUB
echo ===========================================
echo.

:: 1. Traer los ultimos cambios de la nube (Git)
echo [+] 1. Descargando ultimos cambios de GitHub...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] ERROR: No se pudieron descargar los cambios. 
    echo Verifique su conexion a internet o si Git esta instalado.
    pause
    exit /b
)

:: 2. Instalar dependencias (por si acaso se agrego una nueva)
echo.
echo [+] 2. Verificando paquetes necesarios...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] ERROR: Fallo la instalacion de dependencias.
    pause
    exit /b
)

:: 3. Generar nueva Carpeta "dist" (Cambios visuales)
echo.
echo [+] 3. Compilando version de produccion...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] ERROR: Fallo la compilacion.
    pause
    exit /b
)

echo.
echo ===========================================
echo    ¡SISTEMA ACTUALIZADO CON EXITO!
echo ===========================================
echo.
echo Puede cerrar esta ventana y reiniciar el servidor si es necesario.
echo.
pause
