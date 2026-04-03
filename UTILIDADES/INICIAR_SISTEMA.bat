@echo off
TITLE Sistema de Reservas - Bicis
COLOR 0A

echo ==========================================
echo    INICIANDO SISTEMA DE RESERVAS
echo ==========================================
echo.
echo Iniciando Servidor (Modo Optivo / Todo en uno)...
echo Puedes acceder en: http://localhost:3000
echo.

node server/index.js

echo.
echo Sistema detenido.
pause
