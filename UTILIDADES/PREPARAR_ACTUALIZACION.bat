@echo off
TITLE Preparador de Actualizacion
COLOR 0E

echo ===========================================
echo    PREPARANDO ARCHIVOS PARA ACTUALIZAR
echo ===========================================
echo.
echo 1. Generando version de produccion optimizada...
call npm run build

echo.
echo ===========================================
echo     LISTO PARA LLEVAR A PRODUCCION
echo ===========================================
echo.
echo Solo necesitas copiar estos ARCHIVOS/CARPETAS a la PC nueva:
echo [X] Carpeta "dist" (OBLIGATORIO para cambios visuales)
echo [ ] Archivo "server/index.js" (Solo si hubo cambios en la base de datos o rutas)
echo.
echo NO COPIES "bookings.db" si quieres mantener los datos del cliente.
echo.
pause
