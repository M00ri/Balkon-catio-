#Requires -Version 5.1
<#
.SYNOPSIS
    FocusLock-Hinweise: zeigt ein Fenster, wenn ein Programm gesperrt oder freigeschaltet wurde.

.DESCRIPTION
    Läuft im Benutzerkonto (Autostart). Der Wächter selbst läuft als SYSTEM und kann
    keine Fenster auf deinem Desktop öffnen - deshalb liest dieses Skript nur
    %ProgramData%\FocusLock\status.json und meldet Änderungen.
    Wird es beendet, fehlen nur die Hinweise; die Sperre bleibt bestehen.
#>
param([string]$DataDir = '')

if (-not $DataDir) { $DataDir = Join-Path $env:ProgramData 'FocusLock' }
$statusPath = Join-Path $DataDir 'status.json'

Add-Type -AssemblyName System.Windows.Forms

$createdNew = $false
$mutex = New-Object System.Threading.Mutex($true, 'Local\FocusLockNotify', [ref]$createdNew)
if (-not $createdNew) { exit }

function Read-FocusLockStatus {
    try {
        return ([System.IO.File]::ReadAllText($statusPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json)
    } catch {
        return $null
    }
}

function Show-FocusLockMessage {
    param([string]$Text, [System.Windows.Forms.MessageBoxIcon]$Icon)
    $owner = New-Object System.Windows.Forms.Form
    $owner.TopMost = $true
    try {
        [void][System.Windows.Forms.MessageBox]::Show($owner, $Text, 'FocusLock', [System.Windows.Forms.MessageBoxButtons]::OK, $Icon)
    } finally {
        $owner.Dispose()
    }
}

function Get-BlockId {
    param($Status)
    if ($null -eq $Status -or $null -eq $Status.last_block) { return '' }
    return [string]$Status.last_block.id
}

# Alte Ereignisse von vor dem Start nicht nochmal melden
$status = Read-FocusLockStatus
$lastBlockId = Get-BlockId $status
$wasUnlocked = ($null -ne $status -and [bool]$status.unlocked)
$lastPopup = [datetime]::MinValue

while ($true) {
    Start-Sleep -Seconds 2
    $status = Read-FocusLockStatus
    if ($null -eq $status) { continue }

    $blockId = Get-BlockId $status
    if ($blockId -and $blockId -ne $lastBlockId) {
        $lastBlockId = $blockId
        # Launcher starten Spiele gern mehrfach neu - nicht mit Fenstern zuschütten
        if (((Get-Date) - $lastPopup).TotalSeconds -ge 20) {
            $text = '"{0}" ist noch gesperrt.' -f $status.last_block.process
            if ([int]$status.required -gt 0) {
                $missing = [Math]::Max(0, [int]$status.required - [int]$status.count)
                $text += "`n`nHeute geschafft: {0} von {1} Clips - es fehlen noch {2}." -f $status.count, $status.required, $missing
            }
            if (@($status.problems).Count -gt 0) {
                $text += "`n`n" + (@($status.problems) -join "`n")
            }
            $text += "`n`nSobald die Clips im Ordner liegen, schaltet FocusLock automatisch frei."
            $text += "`nDetails: Startmenü > FocusLock Status"
            Show-FocusLockMessage $text ([System.Windows.Forms.MessageBoxIcon]::Warning)
            $lastPopup = Get-Date
        }
    }

    $isUnlocked = [bool]$status.unlocked
    if ($isUnlocked -and -not $wasUnlocked) {
        $text = "Freigeschaltet! Du hast heute {0} Clips gemacht.`n`nGilt bis {1} Uhr. Viel Spaß!" -f $status.count, $status.day_end
        Show-FocusLockMessage $text ([System.Windows.Forms.MessageBoxIcon]::Information)
    }
    $wasUnlocked = $isUnlocked
}
