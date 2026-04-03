@echo off
TITLE Centro de Control - Sistema de Reservas Teknosur
cd /d "%~dp0\.."

:MENU
CLS
COLOR 0B
echo ========================================================
echo        CENTRO DE CONTROL - SISTEMA DE RESERVAS
echo ========================================================
echo.
echo  [1] PC DESARROLLO: Subir cambios a la nube (Push)
echo  [2] PC REMOTA: Descargar ultima version (Pull + Build)
echo.
echo  [3] REPARAR: Re-vincular a GitHub (Teknosur)
echo  [4] FORZAR: Limpiar y sincronizar (en caso de error)
echo.
echo  [5] INSTALAR: Instalar librerias (npm install)
echo  [6] INICIAR: Arrancar servidor local
echo.
echo  [X] Salir
echo.
echo ========================================================
set /p opt="Elija una opcion y presione ENTER: "

if "%opt%"=="1" goto PUSH
if "%opt%"=="2" goto PULL
if "%opt%"=="3" goto REPAIR
if "%opt%"=="4" goto FORCE
if "%opt%"=="5" goto INSTALL
if "%opt%"=="6" goto START
if "%opt%"=="X" exit
if "%opt%"=="x" exit
goto MENU

:PUSH
CLS
COLOR 0E
echo [+] Preparando subida a GitHub...
git add .
set /p msg="Descripcion de los cambios (presione ENTER si no hay): "
if "%msg%"=="" set msg=Actualizacion %date% %time%
git commit -m "%msg%"
git push origin main
echo.
pause
goto MENU

:PULL
CLS
COLOR 0A
echo [+] Descargando cambios de GitHub...
git pull origin main
echo.
echo [+] Compilando version de produccion...
call npm install
call npm run build
echo.
pause
goto MENU

:REPAIR
CLS
COLOR 0D
echo [+] Verificando y corrigiendo enlace de GitHub...
if not exist ".git" (
    git init
    git remote add origin https://github.com/teknosur/bicicletas-turnos-v1.git
) else (
    git remote set-url origin https://github.com/teknosur/bicicletas-turnos-v1.git
)
git remote -v
echo.
pause
goto MENU

:FORCE
CLS
COLOR 4F
echo [!] ADVERTENCIA: Se borraran cambios locales para igualar a la nube.
echo.
pause
git fetch --all
git reset --hard origin/main
echo.
pause
goto MENU

:INSTALL
CLS
COLOR 0B
echo [+] Instalando dependencias necesarias (npm install)...
call npm install
echo.
pause
goto MENU

:START
CLS
COLOR 0B
echo [+] Iniciando el servidor de reservas...
npm start
goto MENU
