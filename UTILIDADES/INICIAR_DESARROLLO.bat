@echo off
TITLE Sistema de Reservas - Modo Programador
COLOR 0D

echo ==========================================
echo    MODO DESARROLLO (VITE + SERVER)
echo ==========================================
echo.
echo 1. Lanzando Servidor API (Node)...
start "Servidor/API" cmd /k "node server/index.js"

echo.
echo Esperando inicializacion de DB...
timeout /t 3 /nobreak > nul

echo.
echo 2. Lanzando Frontend (Vite)...
npm run dev -- --host

echo.
echo El sistema de desarrollo se ha detenido.
pause
