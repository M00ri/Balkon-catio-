#Requires -Version 5.1
<#
.SYNOPSIS
    Installiert FocusLock (oder aktualisiert eine bestehende Installation).

.DESCRIPTION
    Muss als Administrator laufen - am einfachsten install.cmd doppelklicken.
      - Programm nach  %ProgramFiles%\FocusLock
      - config.json nach %ProgramData%\FocusLock (nur Admins/SYSTEM dürfen schreiben)
      - Geplante Aufgabe "FocusLock", läuft als SYSTEM ab Systemstart
      - Autostart für das Hinweisfenster, Startmenü-Eintrag "FocusLock Status"
    Die config.json neben diesem Skript wird übernommen und ersetzt eine vorhandene.
#>
[CmdletBinding()]
param([switch]$NoPause)

$ErrorActionPreference = 'Stop'
$TaskName = 'FocusLock'
$SourceDir = $PSScriptRoot

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    return ([Security.Principal.WindowsPrincipal]$identity).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Invoke-Icacls {
    param([string[]]$Arguments)
    $output = & icacls.exe @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) { throw "icacls $($Arguments -join ' ') ist fehlgeschlagen: $output" }
}

function New-Shortcut {
    param([string]$LinkPath, [string]$Target, [string]$Arguments, [int]$WindowStyle, [string]$Description)
    $shell = New-Object -ComObject WScript.Shell
    $link = $shell.CreateShortcut($LinkPath)
    $link.TargetPath = $Target
    $link.Arguments = $Arguments
    $link.WindowStyle = $WindowStyle
    $link.Description = $Description
    $link.Save()
}

function Stop-FocusLockProcesses {
    param([string]$Pattern)
    Get-CimInstance -ClassName Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like $Pattern } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

function Install-FocusLock {
    # Funktionen aus FocusLock.ps1 laden (Konfiguration prüfen, Status anzeigen)
    . (Join-Path $SourceDir 'FocusLock.ps1') -Mode Library

    $programDir = Join-Path $env:ProgramFiles 'FocusLock'
    $dataRoot = Join-Path $env:ProgramData 'FocusLock'
    $psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $sourceConfig = Join-Path $SourceDir 'config.json'

    Write-Host ''
    Write-Host '  FocusLock wird installiert' -ForegroundColor Cyan
    Write-Host ''

    # 1) Konfiguration prüfen, bevor irgendetwas verändert wird
    $cfg = Read-FocusLockConfig $sourceConfig
    Write-Host '  Gesperrt werden:'
    foreach ($n in $cfg.BlockLabels) { Write-Host "    $n" }
    foreach ($p in $cfg.BlockPaths) { Write-Host "    alles in $p" }
    Write-Host ('  Freischalten: {0} Clips von heute, je mindestens {1} MB, aus:' -f $cfg.MinCount, $cfg.MinSizeMb)
    foreach ($f in $cfg.Folders) {
        if (Test-Path -LiteralPath $f -PathType Container) {
            Write-Host "    $f"
        } else {
            Write-Host "    $f   <- Ordner gibt es (noch) nicht!" -ForegroundColor Yellow
        }
    }
    Write-Host ''

    # 2) Alte Installation anhalten
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    Stop-FocusLockProcesses '*FocusLock.ps1*-Mode Run*'

    # 3) Programmdateien (Program Files ist für normale Benutzer schreibgeschützt)
    New-Item -ItemType Directory -Force -Path $programDir | Out-Null
    foreach ($file in @('FocusLock.ps1', 'Notify.ps1')) {
        Copy-Item -LiteralPath (Join-Path $SourceDir $file) -Destination $programDir -Force
    }
    Get-ChildItem -LiteralPath $programDir -File | Unblock-File
    Write-Host "  Programm:      $programDir"

    # 4) Datenordner: SYSTEM + Administratoren Vollzugriff, Benutzer nur lesen.
    #    SIDs statt Namen, damit es auch auf deutschem Windows ("Administratoren") klappt.
    New-Item -ItemType Directory -Force -Path $dataRoot | Out-Null
    Invoke-Icacls @($dataRoot, '/inheritance:r', '/grant:r', '*S-1-5-18:(OI)(CI)F', '*S-1-5-32-544:(OI)(CI)F', '*S-1-5-32-545:(OI)(CI)RX')
    Copy-Item -LiteralPath $sourceConfig -Destination (Join-Path $dataRoot 'config.json') -Force
    Invoke-Icacls @((Join-Path $dataRoot '*'), '/reset', '/T', '/C', '/Q')
    Invoke-Icacls @($dataRoot, '/setowner', '*S-1-5-32-544', '/T', '/C', '/Q')
    Write-Host "  Einstellungen: $dataRoot\config.json"

    # 5) Geplante Aufgabe als SYSTEM: ab Systemstart, alle 5 Minuten nachsehen ob sie läuft
    $arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}" -Mode Run' -f (Join-Path $programDir 'FocusLock.ps1')
    $action = New-ScheduledTaskAction -Execute $psExe -Argument $arguments
    $atStartup = New-ScheduledTaskTrigger -AtStartup
    $repeat = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
    $principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
        -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
        -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
    $settings.Priority = 4
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger @($atStartup, $repeat) -Principal $principal `
        -Settings $settings -Description 'FocusLock: sperrt Programme, bis die Tagesaufgabe erledigt ist.' -Force | Out-Null
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "  Aufgabe:       $TaskName (läuft als SYSTEM)"

    # 6) Hinweisfenster im Autostart aller Benutzer + Startmenü-Eintrag
    $notifyArgs = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}"' -f (Join-Path $programDir 'Notify.ps1')
    $statusArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Mode Status -Pause' -f (Join-Path $programDir 'FocusLock.ps1')
    New-Shortcut (Join-Path ([Environment]::GetFolderPath('CommonStartup')) 'FocusLock Hinweise.lnk') $psExe $notifyArgs 7 'FocusLock-Hinweise'
    New-Shortcut (Join-Path ([Environment]::GetFolderPath('CommonPrograms')) 'FocusLock Status.lnk') $psExe $statusArgs 1 'Wie weit bin ich heute?'
    Write-Host '  Startmenü:     FocusLock Status'
    Write-Host ''

    # 7) Läuft der Wächter?
    $statusFile = Join-Path $dataRoot 'status.json'
    $ok = $false
    for ($i = 0; $i -lt 15 -and -not $ok; $i++) {
        Start-Sleep -Seconds 1
        $ok = Test-Path -LiteralPath $statusFile
    }
    if ($ok) {
        Write-Host '  Der Wächter läuft.' -ForegroundColor Green
    } else {
        Write-Host '  Der Wächter hat sich noch nicht gemeldet. Prüfe die Aufgabenplanung (Aufgabe "FocusLock").' -ForegroundColor Yellow
    }

    Show-FocusLockStatus (Get-FocusLockPaths $dataRoot)

    Write-Host '  Die Hinweisfenster erscheinen ab der nächsten Anmeldung.' -ForegroundColor Gray
    Write-Host '  WICHTIG: Solange dein eigenes Konto Administrator ist, kannst du FocusLock abschalten.' -ForegroundColor Yellow
    Write-Host '  Lies in der README den Abschnitt "Unumgehbar machen".' -ForegroundColor Yellow
    Write-Host ''
}

if (-not (Test-IsAdmin)) {
    Write-Host 'Bitte als Administrator starten (install.cmd doppelklicken).' -ForegroundColor Red
} else {
    try {
        Install-FocusLock
    } catch {
        Write-Host ''
        Write-Host "  Installation abgebrochen: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ''
    }
}
if (-not $NoPause) { [void](Read-Host 'Enter drücken zum Schließen') }
