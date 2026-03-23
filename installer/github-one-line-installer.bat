@echo off
:: One-line Vencord + fakeMute External Installer
:: Usage: curl -o install.bat https://raw.githubusercontent.com/yourusername/yourrepo/main/install.bat && install.bat

echo 🎭 Vencord + fakeMute One-Line Installer
echo ======================================
echo.

:: Check Git and install if needed
where git >nul 2>&1 || (
    echo Installing Git...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iwr -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -OutFile '%TEMP%\git.exe'; start -wait -filepath '%TEMP%\git.exe' -argumentlist '/VERYSILENT /NORESTART'; rm '%TEMP%\git.exe'}"
    set "PATH=%PATH%;C:\Program Files\Git\bin"
)

:: Check Node.js and install if needed  
where node >nul 2>&1 || (
    echo Installing Node.js...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iwr -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node.msi'; start -wait -filepath msiexec -argumentlist '/i %TEMP%\node.msi /quiet /norestart'; rm '%TEMP%\node.msi'}"
    set "PATH=%PATH%;C:\Program Files\nodejs"
)

:: Install pnpm if needed
where pnpm >nul 2>&1 || npm i -g pnpm

:: Clone Vencord to Desktop
set "vd=%USERPROFILE%\Desktop\Vencord"
if exist "%vd%" rmdir /s /q "%vd%"
echo Cloning Vencord...
git clone https://github.com/Vendicated/Vencord.git "%vd%"

:: Install fakeMute plugin
echo Installing fakeMute plugin...
if not exist "%vd%\src\userplugins" mkdir "%vd%\src\userplugins"
cd /d "%vd%\src\userplugins"
git clone https://github.com/Useless007/fakeMute.git fakeMute

:: Build and inject Vencord
cd /d "%vd%"
echo Installing dependencies...
pnpm i
echo Building Vencord...
pnpm build
echo Injecting Vencord...
pnpm inject

echo ✅ Done! Restart Discord and enable FakeMute in Settings ^> Plugins
pause
