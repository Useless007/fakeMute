@echo off
setlocal enabledelayedexpansion

reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

for /f %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[92m"
set "RED=%ESC%[91m"
set "YELLOW=%ESC%[93m"
set "CYAN=%ESC%[96m"
set "DIM=%ESC%[2m"
set "BOLD=%ESC%[1m"
set "RESET=%ESC%[0m"

set "VENCORD_DIR=%USERPROFILE%\Desktop\Vencord"
set "PLUGIN_DIR=%VENCORD_DIR%\src\userplugins\fakeMute"

cls
echo.
echo %CYAN%%BOLD%  =======================================================%RESET%
echo %CYAN%%BOLD%     Vencord + FakeMute Auto Installer                 %RESET%
echo %CYAN%%BOLD%  =======================================================%RESET%
echo.

:: ──────────────────────────────────────
:: STEP 1 - Git
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [1/8]%RESET% Checking Git...        "
where git >nul 2>&1
if errorlevel 1 (
    <nul set /p "=%YELLOW%not found, installing...%RESET%  "
    powershell -Command "iwr https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe -OutFile '%TEMP%\git.exe'" >nul 2>&1
    start /wait %TEMP%\git.exe /VERYSILENT >nul 2>&1
)
echo %GREEN% Git ready%RESET%

:: ──────────────────────────────────────
:: STEP 2 - Clone Vencord
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [2/8]%RESET% Cloning Vencord...     "
if exist "%VENCORD_DIR%" rmdir /s /q "%VENCORD_DIR%" >nul 2>&1
git clone https://github.com/Vendicated/Vencord.git "%VENCORD_DIR%" >nul 2>&1
if errorlevel 1 ( echo %RED%✘ Failed to clone Vencord%RESET% & pause & exit /b 1 )
echo %GREEN% Vencord cloned%RESET%

:: ──────────────────────────────────────
:: STEP 3 - FakeMute plugin
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [3/8]%RESET% Installing fakeMute... "
if not exist "%VENCORD_DIR%\src\userplugins" mkdir "%VENCORD_DIR%\src\userplugins" >nul 2>&1
git clone https://github.com/Useless007/fakeMute.git "%PLUGIN_DIR%" >nul 2>&1
if errorlevel 1 ( echo %RED%✘ Failed to clone fakeMute%RESET% & pause & exit /b 1 )
echo %GREEN% fakeMute ready%RESET%

:: ──────────────────────────────────────
:: STEP 4 - Node.js
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [4/8]%RESET% Checking Node.js...    "
where node >nul 2>&1
if errorlevel 1 (
    <nul set /p "=%YELLOW%not found, installing...%RESET%  "
    powershell -Command "iwr https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi -OutFile '%TEMP%\node.msi'" >nul 2>&1
    start /wait msiexec /i %TEMP%\node.msi /quiet >nul 2>&1
)
echo %GREEN% Node.js ready%RESET%

:: ──────────────────────────────────────
:: STEP 5 - pnpm
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [5/8]%RESET% Checking pnpm...       "
where pnpm >nul 2>&1
if errorlevel 1 (
    npm i -g pnpm >nul 2>&1
    if errorlevel 1 ( echo %RED%✘ Failed to install pnpm%RESET% & pause & exit /b 1 )
)
echo %GREEN% pnpm ready%RESET%

:: ──────────────────────────────────────
:: STEP 6 - Install deps
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [6/8]%RESET% Installing packages...  "
cd /d "%VENCORD_DIR%"
call pnpm i >nul 2>&1
if errorlevel 1 ( echo %RED%✘ pnpm install failed%RESET% & pause & exit /b 1 )
echo %GREEN% Dependencies installed%RESET%

:: ──────────────────────────────────────
:: STEP 7 - Build
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [7/8]%RESET% Building Vencord...    "
call pnpm build >nul 2>&1
if errorlevel 1 ( echo %RED%✘ Build failed%RESET% & pause & exit /b 1 )
echo %GREEN% Build complete%RESET%

:: ──────────────────────────────────────
:: STEP 8 - Inject
:: ──────────────────────────────────────
<nul set /p "=%CYAN%  [8/8]%RESET% Injecting into Discord... [Press Enter to Continue] "
call pnpm inject >nul 2>&1
if errorlevel 1 ( echo %RED%✘ Inject failed%RESET% & pause & exit /b 1 )
echo %GREEN% Injected successfully%RESET%

:: ──────────────────────────────────────
:: DONE
:: ──────────────────────────────────────
echo.
echo %GREEN%  ================================================%RESET%
echo %GREEN%  ║       INSTALL  COMPLETE      		  ║%RESET%
echo %GREEN%  ================================================%RESET%
echo.
echo %DIM%  Location : %RESET%%YELLOW%%VENCORD_DIR%%RESET%
echo %DIM%  Action   : %RESET%Restart Discord to apply changes
echo.
pause