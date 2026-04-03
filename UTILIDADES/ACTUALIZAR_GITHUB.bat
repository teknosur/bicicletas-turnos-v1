@echo off
TITLE Actualizar GitHub - Sistema de Reservas
echo Preparando subida a GitHub...
echo.

:: 1. Agregar cambios al area de preparacion
echo [+] Agregando cambios...
git add .

:: 2. Solicitar mensaje de commit
echo.
set /p msg="Ingresa una breve descripcion de los cambios (ej: mejoras visuales) y presiona ENTER: "

:: Si no pone nada, usar uno por defecto con fecha
if "%msg%"=="" set msg=Actualizacion automatica %date% %time%

:: 3. Crear el punto de control (Commit)
echo.
echo [+] Creando punto de control: %msg%
git commit -m "%msg%"

:: 4. Subir a la nube
echo.
echo [+] Subiendo cambios a GitHub (Rama main)...
git push origin main

echo.
echo ===========================================
echo    ¡PROYECTO ACTUALIZADO EN GITHUB!
echo ===========================================
echo.
pause
