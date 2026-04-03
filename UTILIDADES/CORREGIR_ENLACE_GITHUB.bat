@echo off
TITLE Corregir Enlace GitHub - Teknosur
COLOR 0D
echo ===========================================
echo    ACTUALIZANDO ENLACE DE GITHUB (TEKNOSUR)
echo ===========================================
echo.

echo [+] Verificando si existe la carpeta .git...
if not exist ".git" (
    echo [!] No se encontro la carpeta .git. Inicializando repositorio local...
    git init
    git remote add origin https://github.com/teknosur/bicicletas-turnos-v1.git
) else (
    echo [+] Cambiando direccion de "hugoescalada" a "teknosur"...
    git remote set-url origin https://github.com/teknosur/bicicletas-turnos-v1.git
)

echo.
echo [+] Verificando enlace final...
git remote -v

echo.
echo ===========================================
echo    ¡PROCESO FINALIZADO CON EXITO!
echo ===========================================
echo.
echo Si es la primera vez en esta PC, recuerda ejecutar
echo el archivo "DESCARGAR_ACTUALIZACION.bat" ahora.
echo.
pause
