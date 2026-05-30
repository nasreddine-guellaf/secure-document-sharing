$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$HardhatPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

$SmartContractDir = Join-Path $ProjectRoot "smart-contract"
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$AiServiceDir = Join-Path $ProjectRoot "ai-service"
$BackendEnvPath = Join-Path $BackendDir ".env"
$BackendAbiPath = Join-Path $BackendDir "src\config\DocumentRegistry.json"
$SmartContractAbiPath = Join-Path $SmartContractDir "artifacts\contracts\DocumentRegistry.sol\DocumentRegistry.json"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function ConvertTo-SingleQuotedPowerShellString {
    param([string]$Value)
    return "'" + ($Value -replace "'", "''") + "'"
}

function Start-DevWindow {
    param(
        [string]$Title,
        [string]$Directory,
        [string[]]$Commands
    )

    $quotedTitle = ConvertTo-SingleQuotedPowerShellString $Title
    $quotedDirectory = ConvertTo-SingleQuotedPowerShellString $Directory
    $body = @(
        "`$Host.UI.RawUI.WindowTitle = $quotedTitle",
        "Set-Location -LiteralPath $quotedDirectory"
    ) + $Commands

    $script = $body -join "`r`n"
    $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($script))

    Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-EncodedCommand",
        $encoded
    )
}

function Wait-ForTcpPort {
    param(
        [string]$HostName,
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        $client = New-Object System.Net.Sockets.TcpClient

        try {
            $connection = $client.BeginConnect($HostName, $Port, $null, $null)

            if ($connection.AsyncWaitHandle.WaitOne(1000, $false)) {
                $client.EndConnect($connection)
                $client.Close()
                return $true
            }
        } catch {
            Start-Sleep -Milliseconds 500
        } finally {
            $client.Close()
        }
    }

    return $false
}

function Set-DotEnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )

    if (Test-Path -LiteralPath $Path) {
        $lines = @(Get-Content -LiteralPath $Path)
    } else {
        $lines = @()
    }

    $pattern = "^\s*" + [regex]::Escape($Key) + "\s*=.*$"
    $updated = $false
    $newLines = @()

    foreach ($line in $lines) {
        if ($line -match $pattern) {
            $newLines += "$Key=$Value"
            $updated = $true
        } else {
            $newLines += $line
        }
    }

    if (-not $updated) {
        $newLines += "$Key=$Value"
    }

    Set-Content -LiteralPath $Path -Value $newLines -Encoding UTF8
}

function Assert-DirectoryExists {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Name directory not found: $Path"
    }
}

try {
    Write-Step "Project root: $ProjectRoot"

    Assert-DirectoryExists -Path $SmartContractDir -Name "Smart contract"
    Assert-DirectoryExists -Path $BackendDir -Name "Backend"
    Assert-DirectoryExists -Path $FrontendDir -Name "Frontend"

    Write-Step "Starting Hardhat node"
    Start-DevWindow -Title "SecureShare - Hardhat Node" -Directory $SmartContractDir -Commands @(
        "npx.cmd hardhat node"
    )

    Write-Host "Waiting for Hardhat node on http://127.0.0.1:8545 ..."
    Start-Sleep -Seconds 5

    if (-not (Wait-ForTcpPort -HostName "127.0.0.1" -Port 8545 -TimeoutSeconds 30)) {
        throw "Hardhat node did not start on port 8545. Check the Hardhat window for errors."
    }

    Write-Step "Deploying smart contract"
    Push-Location $SmartContractDir
    try {
        $deployOutput = & npx.cmd hardhat run ".\scripts\deploy.js" --network localhost 2>&1
        $deployExitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }

    $deployText = ($deployOutput | Out-String).Trim()
    if ($deployText) {
        Write-Host $deployText
    }

    if ($deployExitCode -ne 0) {
        throw "Smart contract deployment failed. Output:`n$deployText"
    }

    $addressMatch = [regex]::Match($deployText, "DocumentRegistry deployed to:\s*(0x[a-fA-F0-9]{40})")

    if (-not $addressMatch.Success) {
        throw "Contract address was not detected in deploy output. Expected: DocumentRegistry deployed to: 0x..."
    }

    $contractAddress = $addressMatch.Groups[1].Value
    Write-Step "Contract deployed at $contractAddress"

    if (-not (Test-Path -LiteralPath $SmartContractAbiPath -PathType Leaf)) {
        throw "ABI file does not exist: $SmartContractAbiPath"
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $BackendAbiPath -Parent) | Out-Null
    Copy-Item -LiteralPath $SmartContractAbiPath -Destination $BackendAbiPath -Force
    Write-Step "ABI copied"

    Set-DotEnvValue -Path $BackendEnvPath -Key "USE_BLOCKCHAIN_MOCK" -Value "false"
    Set-DotEnvValue -Path $BackendEnvPath -Key "BLOCKCHAIN_RPC_URL" -Value "http://127.0.0.1:8545"
    Set-DotEnvValue -Path $BackendEnvPath -Key "CONTRACT_ADDRESS" -Value $contractAddress
    Set-DotEnvValue -Path $BackendEnvPath -Key "PRIVATE_KEY" -Value $HardhatPrivateKey
    Set-DotEnvValue -Path $BackendEnvPath -Key "CONTRACT_ABI_PATH" -Value "./src/config/DocumentRegistry.json"
    Set-DotEnvValue -Path $BackendEnvPath -Key "AI_SERVICE_URL" -Value "http://127.0.0.1:8001"
    Set-DotEnvValue -Path $BackendEnvPath -Key "AI_SERVICE_TIMEOUT_MS" -Value "600000"
    Write-Step "Backend .env updated"

    Write-Step "Starting backend"
    Start-DevWindow -Title "SecureShare - Backend" -Directory $BackendDir -Commands @(
        "npm.cmd run dev"
    )

    Write-Step "Starting frontend"
    Start-DevWindow -Title "SecureShare - Frontend" -Directory $FrontendDir -Commands @(
        "npm.cmd run dev"
    )

    if (Test-Path -LiteralPath $AiServiceDir -PathType Container) {
        Write-Step "Starting AI service"
        Start-DevWindow -Title "SecureShare - AI Service" -Directory $AiServiceDir -Commands @(
            "if (-not (Test-Path -LiteralPath '.\venv\Scripts\python.exe')) {",
            "    Write-Host 'Creating Python virtual environment...' -ForegroundColor Cyan",
            "    python -m venv venv",
            "    if (`$LASTEXITCODE -ne 0) { Write-Host 'Failed to create AI service virtual environment.' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit `$LASTEXITCODE }",
            "    Write-Host 'Installing AI service dependencies...' -ForegroundColor Cyan",
            "    .\venv\Scripts\python.exe -m pip install -r requirements.txt",
            "    if (`$LASTEXITCODE -ne 0) { Write-Host 'Failed to install AI service dependencies.' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit `$LASTEXITCODE }",
            "}",
            ".\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"
        )
    } else {
        Write-WarningMessage "ai-service folder not found. Skipping AI service startup."
    }

    $startPrisma = Read-Host "Start Prisma Studio? (y/N)"
    if ($startPrisma -match "^(y|yes)$") {
        Write-Step "Starting Prisma Studio"
        Start-DevWindow -Title "SecureShare - Prisma Studio" -Directory $BackendDir -Commands @(
            "npx.cmd prisma studio"
        )
    }

    Write-Step "Done"
    Write-Host "Backend:  http://localhost:5000"
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "AI:       http://127.0.0.1:8001"
    Write-Host "Chain:    http://127.0.0.1:8545"
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
