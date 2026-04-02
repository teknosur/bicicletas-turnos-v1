@echo off
TITLE Sistema de Reservas - Bicis
COLOR 0A

echo ==========================================
echo    SISTEMA DE RESERVAS (INICIO)
echo ==========================================
echo.
echo Selecciona el modo de inicio:
echo 1. Modo PRODUCCION (Recomendado - Ligero)
echo 2. Modo DESARROLLO (Vite + Node separado)
echo.
set /p choice="Ingresa (1 o 2): "

if "%choice%"=="1" (
    echo Iniciando Servidor de Produccion (Todo en uno)...
    node server/index.js
) else (
    echo Iniciando Servidor de Base de Datos...
    start "Servidor/BD" cmd /k "node server/index.js"
    timeout /t 2 /nobreak > nul
    echo Iniciando Servidor Web (Modo Red Local)...
    npm run dev -- --host
)

echo.
echo Sistema detenido.
pause
