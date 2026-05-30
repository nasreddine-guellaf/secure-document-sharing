$ErrorActionPreference = "Continue"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$DevPorts = @(
    @{ Name = "Backend API"; Port = 5000 },
    @{ Name = "Frontend Vite"; Port = 5173 },
    @{ Name = "AI Service"; Port = 8001 },
    @{ Name = "Hardhat Node"; Port = 8545 },
    @{ Name = "Prisma Studio"; Port = 5555 }
)

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) {
        return
    }

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $process) {
        return
    }

    Write-Host "Stopping PID $ProcessId ($($process.ProcessName))"
    taskkill.exe /PID $ProcessId /T /F | Out-Null
}

function Get-ListeningProcessIds {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

    if (-not $connections) {
        return @()
    }

    return @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
}

try {
    Write-Step "Project root: $ProjectRoot"
    Write-Step "Stopping SecureShare development services"

    $stoppedAny = $false

    foreach ($service in $DevPorts) {
        $name = $service.Name
        $port = $service.Port
        $processIds = Get-ListeningProcessIds -Port $port

        if ($processIds.Count -eq 0) {
            Write-Host "$name on port ${port}: not running" -ForegroundColor DarkGray
            continue
        }

        Write-Host "$name on port ${port}: found PID(s) $($processIds -join ', ')" -ForegroundColor Yellow

        foreach ($processId in $processIds) {
            Stop-ProcessTree -ProcessId $processId
            $stoppedAny = $true
        }
    }

    Start-Sleep -Seconds 1

    Write-Step "Final port check"
    foreach ($service in $DevPorts) {
        $name = $service.Name
        $port = $service.Port
        $processIds = Get-ListeningProcessIds -Port $port

        if ($processIds.Count -eq 0) {
            Write-Host "$name on port ${port}: stopped" -ForegroundColor Green
        } else {
            Write-Host "$name on port ${port}: still listening with PID(s) $($processIds -join ', ')" -ForegroundColor Red
        }
    }

    if (-not $stoppedAny) {
        Write-Host ""
        Write-Host "No SecureShare dev services were listening on the known ports." -ForegroundColor Yellow
    }

    Write-Step "Done"
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
