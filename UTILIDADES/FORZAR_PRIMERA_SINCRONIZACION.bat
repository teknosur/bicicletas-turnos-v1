@echo off
TITLE Forzar Sincronizacion Inicial - Teknosur
COLOR 4F
echo ===========================================
echo    FORZANDO SINCRONIZACION CON GITHUB
echo ===========================================
echo.
echo [!] ADVERTENCIA: Este proceso reemplazara los archivos locales
echo con la ultima version de GitHub.
echo.
pause

echo.
echo [+] 1. Buscando informacion en la nube...
git fetch origin main

echo.
echo [+] 2. Sobreescribiendo archivos locales con la version de GitHub...
git reset --hard origin/main

echo.
echo ===========================================
echo    ¡CONEXION ESTABLECIDA CON EXITO!
echo ===========================================
echo.
echo Ahora ya puedes usar "DESCARGAR_ACTUALIZACION.bat" 
echo para las futuras actualizaciones normales.
echo.
pause
