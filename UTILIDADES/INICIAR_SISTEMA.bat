@echo off
TITLE Sistema de Reservas - Produccion
cd /d "%~dp0\.."
COLOR 0A

echo Iniciando servidor en produccion...
node server/index.js
pause
