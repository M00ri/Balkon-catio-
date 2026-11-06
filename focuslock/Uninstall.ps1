#Requires -Version 5.1
<#
.SYNOPSIS
    Entfernt FocusLock vollständig. Geht nur mit Administratorrechten.
#>
[CmdletBinding()]
param([switch]$NoPause)

$ErrorActionPreference = 'Stop'
$TaskName = 'FocusLock'

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    return ([Security.Principal.WindowsPrincipal]$identity).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Uninstall-FocusLock {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host '  Aufgabe entfernt.'
    }

    Get-CimInstance -ClassName Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like '*FocusLock.ps1*' -or $_.CommandLine -like '*FocusLock*Notify.ps1*' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

    $links = @(
        (Join-Path ([Environment]::GetFolderPath('CommonStartup')) 'FocusLock Hinweise.lnk'),
        (Join-Path ([Environment]::GetFolderPath('CommonPrograms')) 'FocusLock Status.lnk')
    )
    foreach ($link in $links) {
        if (Test-Path -LiteralPath $link) { Remove-Item -LiteralPath $link -Force }
    }

    foreach ($dir in @((Join-Path $env:ProgramFiles 'FocusLock'), (Join-Path $env:ProgramData 'FocusLock'))) {
        if (Test-Path -LiteralPath $dir) {
            Remove-Item -LiteralPath $dir -Recurse -Force
            Write-Host "  Entfernt: $dir"
        }
    }
    Write-Host ''
    Write-Host '  FocusLock ist deinstalliert.' -ForegroundColor Green
}

if (-not (Test-IsAdmin)) {
    Write-Host 'Bitte als Administrator starten (uninstall.cmd doppelklicken).' -ForegroundColor Red
} else {
    try {
        Uninstall-FocusLock
    } catch {
        Write-Host "  Fehler: $($_.Exception.Message)" -ForegroundColor Red
    }
}
if (-not $NoPause) { [void](Read-Host 'Enter drücken zum Schließen') }
