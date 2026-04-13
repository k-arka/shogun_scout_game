# ============================================================
#  Shogun's Scout — Game Launcher (PowerShell 5 compatible)
# ============================================================

$ErrorActionPreference = "Stop"

$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$VENV     = Join-Path $BACKEND ".venv"
$PYTHON   = Join-Path $VENV "Scripts\python.exe"

# Use 127.0.0.1 explicitly to avoid DNS/proxy quirks
$BACKEND_URL  = "http://127.0.0.1:8000/health"
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

# 1. Check Python venv
if (-not (Test-Path $PYTHON)) {
    Write-Host "  ERROR: Python venv not found at:" -ForegroundColor Red
    Write-Host "         $PYTHON" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Run these commands first:" -ForegroundColor Yellow
    Write-Host "    cd $ROOT" -ForegroundColor Gray
    Write-Host "    python -m venv backend\.venv" -ForegroundColor Gray
    Write-Host "    backend\.venv\Scripts\pip install -r backend\requirements.txt" -ForegroundColor Gray
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# 2. Check npm
try { $null = Get-Command npm -ErrorAction Stop }
catch {
    Write-Host "  ERROR: npm not found. Install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host "  Starting Shogun's Scout..." -ForegroundColor Yellow
Write-Host ""

# 3. Write temp batch files to avoid && quoting issues inside Start-Process args
$backendBat = Join-Path $env:TEMP "shogun_backend.bat"
$frontendBat = Join-Path $env:TEMP "shogun_frontend.bat"

$backendContent = "@echo off`r`ntitle Shogun Backend`r`ncd /d `"$ROOT`"`r`n`"$PYTHON`" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload`r`npause"
$frontendContent = "@echo off`r`ntitle Shogun Frontend`r`ncd /d `"$FRONTEND`"`r`nnpm run dev`r`npause"

[System.IO.File]::WriteAllText($backendBat,  $backendContent,  [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($frontendBat, $frontendContent, [System.Text.Encoding]::ASCII)

# 4. Randomize map locations
Write-Host "  [1/4] Randomizing spot locations for fresh layout..." -ForegroundColor Cyan
Start-Process -FilePath $PYTHON -ArgumentList "`"$ROOT\data\seed.py`"", "--randomize" -Wait -NoNewWindow

# 5. Launch backend
Write-Host "  [2/4] Starting FastAPI backend  (port 8000)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/c", $backendBat

# Give it a second head-start before launching frontend
Start-Sleep -Seconds 2

# 6. Launch frontend
Write-Host "  [3/4] Starting Next.js frontend (port 3000)..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/c", $frontendBat

Write-Host ""

# 6. Wait for backend TCP port
$backendReady = Wait-ForPort -Label "Backend  (FastAPI :8000)" -HostName "127.0.0.1" -Port 8000 -TimeoutSec 45
Write-Host ""

# 7. Wait for frontend TCP port (Next.js takes longer on first compile)
$frontendReady = Wait-ForPort -Label "Frontend (Next.js :3000)" -HostName "127.0.0.1" -Port 3000 -TimeoutSec 120
Write-Host ""

# 9. Open browser
if ($frontendReady) {
    Write-Host "  [4/4] Opening browser at $BROWSER_URL ..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1   # brief pause so Next.js finishes route setup
    Start-Process $BROWSER_URL
    Write-Host ""
    Write-Host "  Game is running!  $BROWSER_URL" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Tips:" -ForegroundColor DarkYellow
    Write-Host "    - Close the 'Shogun Backend' and 'Shogun Frontend' windows to stop." -ForegroundColor Gray
    Write-Host "    - Or double-click stop.bat to kill both servers instantly." -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  WARNING: One or more services did not start in time." -ForegroundColor Red
    Write-Host "  Check the Shogun Backend / Shogun Frontend console windows for errors." -ForegroundColor Red
    Write-Host ""
    if ($backendReady) {
        Write-Host "  Backend is up. You can try opening $BROWSER_URL manually once Next.js finishes compiling." -ForegroundColor Yellow
        Start-Process $BROWSER_URL
    }
    Write-Host ""
}

Read-Host "  Press Enter to close this launcher"
