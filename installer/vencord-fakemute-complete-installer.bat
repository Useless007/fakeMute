@echo off
setlocal enabledelayedexpansion

echo 🎭 Vencord + FakeMute Complete External Installer
echo =================================================
echo.

:: Step 1: Check Git installation
echo [1/8] Checking Git installation...
where git >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found. Installing Git...
    echo Downloading Git for Windows...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -OutFile '%TEMP%\Git-Installer.exe'}"
    
    echo Installing Git silently...
    start /wait %TEMP%\Git-Installer.exe /VERYSILENT /NORESTART
    del %TEMP%\Git-Installer.exe
    
    :: Refresh PATH
    set "PATH=%PATH%;C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
    
    :: Verify installation
    where git >nul 2>&1
    if errorlevel 1 (
        echo ❌ Git installation failed. Please install Git manually from https://git-scm.com/
        pause
        exit /b 1
    )
    echo ✅ Git installed successfully!
) else (
    echo ✅ Git is already installed
)

:: Step 2: Clone Vencord to Desktop
echo.
echo [2/8] Cloning Vencord to Desktop...
set "vencord_path=%USERPROFILE%\Desktop\Vencord"

if exist "%vencord_path%" (
    echo ⚠️  Vencord folder already exists on Desktop. Removing old version...
    rmdir /s /q "%vencord_path%"
)

echo Cloning Vencord repository...
git clone https://github.com/Vendicated/Vencord.git "%vencord_path%"

if errorlevel 1 (
    echo ❌ Failed to clone Vencord repository
    pause
    exit /b 1
)
echo ✅ Vencord cloned successfully!

:: Step 3: Create userplugins folder and clone fakeMute
echo.
echo [3/8] Installing fakeMute plugin...
set "userplugins_path=%vencord_path%\src\userplugins"

if not exist "%userplugins_path%" (
    echo Creating userplugins directory...
    mkdir "%userplugins_path%"
)

echo Cloning fakeMute plugin...
cd /d "%userplugins_path%"
git clone https://github.com/Useless007/fakeMute.git fakeMute

if errorlevel 1 (
    echo ❌ Failed to clone fakeMute plugin
    pause
    exit /b 1
)
echo ✅ fakeMute plugin installed successfully!

:: Step 4: Check Node.js and npm
echo.
echo [4/8] Checking Node.js and npm...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Installing Node.js...
    echo Downloading Node.js installer...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\NodeJS-Installer.msi'}"
    
    echo Installing Node.js silently...
    start /wait msiexec /i %TEMP%\NodeJS-Installer.msi /quiet /norestart
    del %TEMP%\NodeJS-Installer.msi
    
    :: Refresh PATH
    set "PATH=%PATH%;C:\Program Files\nodejs"
    
    :: Verify installation
    where node >nul 2>&1
    if errorlevel 1 (
        echo ❌ Node.js installation failed. Please install Node.js manually from https://nodejs.org/
        pause
        exit /b 1
    )
    echo ✅ Node.js installed successfully!
) else (
    echo ✅ Node.js is already installed
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found in PATH
    pause
    exit /b 1
) else (
    echo ✅ npm is available
)

:: Step 5: Install pnpm globally
echo.
echo [5/8] Installing pnpm...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo Installing pnpm globally...
    call npm install -g pnpm
    
    if errorlevel 1 (
        echo ❌ Failed to install pnpm
        pause
        exit /b 1
    )
    echo ✅ pnpm installed successfully!
) else (
    echo ✅ pnpm is already installed
)

:: Step 6: Install dependencies
echo.
echo [6/8] Installing Vencord dependencies...
cd /d "%vencord_path%"
echo Running pnpm install...
call pnpm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully!

:: Step 7: Build Vencord
echo.
echo [7/8] Building Vencord...
echo Running pnpm build...
call pnpm build

if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Vencord built successfully!

:: Step 8: Inject Vencord
echo.
echo [8/8] Injecting Vencord into Discord...
echo Running pnpm inject...
call pnpm inject

if errorlevel 1 (
    echo ❌ Injection failed
    pause
    exit /b 1
)
echo ✅ Vencord injected successfully!

:: Final success message
echo.
echo 🎉 Installation completed successfully!
echo.
echo 📋 Summary:
echo    ✅ Git installed and configured
echo    ✅ Vencord cloned to Desktop
echo    ✅ fakeMute plugin installed
echo    ✅ Node.js and npm installed
echo    ✅ pnpm installed
echo    ✅ Dependencies installed
echo    ✅ Vencord built
echo    ✅ Vencord injected into Discord
echo.
echo 🚀 Next steps:
echo    1. Restart Discord completely
echo    2. Go to Settings ^> Plugins
echo    3. Find "FakeMute" and enable it
echo    4. Look for the microphone icon with slash in the top right corner
echo.
echo 📁 Vencord location: %vencord_path%
echo.
pause
