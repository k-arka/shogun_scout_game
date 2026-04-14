# ============================================================
#  Shogun's Scout — Game Launcher (PowerShell 5 compatible)
# ============================================================

$ErrorActionPreference = "Stop"

$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$FRONTEND = Join-Path $ROOT "frontend"

$FRONTEND_URL = "http://127.0.0.1:3000"
$BROWSER_URL  = "http://localhost:3000"

# ── Helpers ─────────────────────────────────────────────────

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  +==========================================+" -ForegroundColor DarkYellow
    Write-Host "  |       Shogun's Scout  --  Launcher      |" -ForegroundColor Yellow
    Write-Host "  +==========================================+" -ForegroundColor DarkYellow
    Write-Host ""
}

function Test-Port {
    param ([string]$HostName, [int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect($HostName, $Port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Wait-ForPort {
    param ([string]$Label, [string]$HostName, [int]$Port, [int]$TimeoutSec = 90)
    $elapsed = 0
    Write-Host "  Waiting for $Label" -NoNewline -ForegroundColor Cyan
    while ($elapsed -lt $TimeoutSec) {
        if (Test-Port -HostName $HostName -Port $Port) {
            Write-Host " READY" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host "." -NoNewline -ForegroundColor DarkCyan
    }
    Write-Host " TIMEOUT" -ForegroundColor Red
    return $false
}

# ── Main ────────────────────────────────────────────────────

Write-Banner

# 1. Check npm
try { $null = Get-Command npm -ErrorAction Stop }
catch {
    Write-Host "  ERROR: npm not found. Install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host "  Starting Shogun's Scout..." -ForegroundColor Yellow
Write-Host ""

# 2. Write temp batch files
$frontendBat = Join-Path $env:TEMP "shogun_frontend.bat"
$frontendContent = "@echo off`r`ntitle Shogun Frontend`r`ncd /d `"$FRONTEND`"`r`nnpm run dev`r`npause"
[System.IO.File]::WriteAllText($frontendBat, $frontendContent, [System.Text.Encoding]::ASCII)

# 3. Launch frontend
Write-Host "  [1/1] Starting Next.js frontend (port 3000)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/c", $frontendBat

Write-Host ""

# 4. Wait for frontend TCP port
$frontendReady = Wait-ForPort -Label "Frontend (Next.js :3000)" -HostName "127.0.0.1" -Port 3000 -TimeoutSec 120
Write-Host ""

# 5. Open browser
if ($frontendReady) {
    Write-Host "  Opening browser at $BROWSER_URL ..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process $BROWSER_URL
    Write-Host ""
    Write-Host "  Game is running!  $BROWSER_URL" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Tips:" -ForegroundColor DarkYellow
    Write-Host "    - Close the 'Shogun Frontend' console window to stop." -ForegroundColor Gray
    Write-Host "    - Or double-click stop.bat to kill the server instantly." -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  WARNING: Service did not start in time." -ForegroundColor Red
    Write-Host "  Check the Shogun Frontend console window for errors." -ForegroundColor Red
    Write-Host ""
}

Read-Host "  Press Enter to close this launcher"
