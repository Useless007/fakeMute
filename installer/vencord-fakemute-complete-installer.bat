@echo off
setlocal enabledelayedexpansion

:: enable color
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: colors
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set CYAN=[96m
set RESET=[0m

echo.
echo %CYAN%=====================================%RESET%
echo %CYAN%  Vencord + FakeMute Auto Installer  %RESET%
echo %CYAN%=====================================%RESET%
echo.

set "VENCORD_DIR=%USERPROFILE%\Desktop\Vencord"
set "PLUGIN_DIR=%VENCORD_DIR%\src\userplugins\fakeMute"

:: STEP 1
echo %CYAN%[1/8] Checking Git...%RESET%

where git >nul 2>&1
if errorlevel 1 (

echo %YELLOW%Installing Git...%RESET%

powershell -Command "iwr https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe -OutFile %TEMP%\git.exe"

start /wait %TEMP%\git.exe /VERYSILENT

)

echo %GREEN%Git OK%RESET%


:: STEP 2
echo.
echo %CYAN%[2/8] Installing Vencord to Desktop...%RESET%

if exist "%VENCORD_DIR%" (
echo %YELLOW%Removing old version%RESET%
rmdir /s /q "%VENCORD_DIR%"
)

git clone https://github.com/Vendicated/Vencord.git "%VENCORD_DIR%"

echo %GREEN%Vencord OK%RESET%


:: STEP 3
echo.
echo %CYAN%[3/8] Installing fakeMute...%RESET%

if not exist "%VENCORD_DIR%\src\userplugins" mkdir "%VENCORD_DIR%\src\userplugins"

git clone https://github.com/Useless007/fakeMute.git "%PLUGIN_DIR%"

echo %GREEN%fakeMute OK%RESET%


:: STEP 4
echo.
echo %CYAN%[4/8] Checking node...%RESET%

where node >nul 2>&1

if errorlevel 1 (

echo %YELLOW%Installing node...%RESET%

powershell -Command "iwr https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi -OutFile %TEMP%\node.msi"

start /wait msiexec /i %TEMP%\node.msi /quiet

)

echo %GREEN%node OK%RESET%


:: STEP 5
echo.
echo %CYAN%[5/8] Installing pnpm...%RESET%

where pnpm >nul 2>&1

if errorlevel 1 npm i -g pnpm

echo %GREEN%pnpm OK%RESET%


:: STEP 6
echo.
echo %CYAN%[6/8] Installing dependencies...%RESET%

cd /d "%VENCORD_DIR%"

call pnpm i

echo %GREEN%deps OK%RESET%


:: STEP 7
echo.
echo %CYAN%[7/8] Building...%RESET%

call pnpm build

echo %GREEN%build OK%RESET%


:: STEP 8
echo.
echo %CYAN%[8/8] Injecting...%RESET%

call pnpm inject

echo %GREEN%inject OK%RESET%


echo.
echo %GREEN%==============================%RESET%
echo %GREEN% INSTALL COMPLETE %RESET%
echo %GREEN%==============================%RESET%

echo.
echo %CYAN%Vencord installed at:%RESET%
echo %YELLOW%%VENCORD_DIR%%RESET%

echo.
echo restart discord
pause