# 🎭 FakeMute Vencord Plugin Installer
# PowerShell Version

Write-Host "🎭 FakeMute Vencord Plugin Installer" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Function to find Vencord installation
function Find-VencordPath {
    $possiblePaths = @(
        "$env:USERPROFILE\vencord",
        "$env:USERPROFILE\Vencord", 
        "$env:USERPROFILE\Documents\vencord",
        "$env:USERPROFILE\Documents\Vencord",
        "$env:APPDATA\vencord",
        "$env:APPDATA\Vencord"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    return $null
}

# Find Vencord installation
$vencordPath = Find-VencordPath

if (-not $vencordPath) {
    Write-Host "Vencord directory not found in common locations." -ForegroundColor Yellow
    $vencordPath = Read-Host "Please enter the full path to your Vencord installation"
    
    if (-not (Test-Path $vencordPath)) {
        Write-Host "Error: Directory does not exist: $vencordPath" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Using Vencord path: $vencordPath" -ForegroundColor Green

# Create userplugins directory if it doesn't exist
$userPluginsPath = Join-Path $vencordPath "src\userplugins"
if (-not (Test-Path $userPluginsPath)) {
    Write-Host "Creating userplugins directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $userPluginsPath -Force | Out-Null
}

# Download the plugin
Write-Host "Downloading fakeMute plugin..." -ForegroundColor Yellow
$tempDir = Join-Path $env:TEMP "fakeMute_$(Get-Random)"

try {
    git clone https://github.com/Useless007/fakeMute.git $tempDir
    
    if ($LASTEXITCODE -ne 0) {
        throw "Git clone failed"
    }
    
    # Remove existing plugin if it exists
    $pluginPath = Join-Path $userPluginsPath "fakeMute"
    if (Test-Path $pluginPath) {
        Write-Host "Removing existing fakeMute plugin..." -ForegroundColor Yellow
        Remove-Item -Path $pluginPath -Recurse -Force
    }
    
    # Copy the plugin
    Write-Host "Installing plugin..." -ForegroundColor Yellow
    Copy-Item -Path $tempDir -Destination $pluginPath -Recurse -Force
    
    # Clean up
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: Failed to download the plugin. Please check your internet connection." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build Vencord
Write-Host "Building Vencord..." -ForegroundColor Yellow
Set-Location $vencordPath

# Check if pnpm is available
$pnpmAvailable = Get-Command pnpm -ErrorAction SilentlyContinue

if ($pnpmAvailable) {
    try {
        pnpm build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Build failed. Please try building manually." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Build failed. Please try building manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  pnpm not found. Please build Vencord manually:" -ForegroundColor Yellow
    Write-Host "   1. Open terminal in: $vencordPath" -ForegroundColor Yellow
    Write-Host "   2. Run: pnpm build" -ForegroundColor Yellow
    Write-Host "   3. Restart Discord" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart Discord completely" -ForegroundColor White
Write-Host "   2. Go to Settings > Plugins" -ForegroundColor White
Write-Host "   3. Find 'FakeMute' and enable it" -ForegroundColor White
Write-Host "   4. Look for the microphone icon with slash in the top right corner" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
