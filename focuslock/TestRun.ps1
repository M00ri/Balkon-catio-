#Requires -Version 5.1
<#
.SYNOPSIS
    FocusLock TESTMODUS - gefahrlos zum Ausprobieren und Fehlersuchen.

.DESCRIPTION
    Dies ist NICHT die spaetere unumgehbare Version. Hier gilt:
      - laeuft als DU in einem sichtbaren Fenster (kein Dienst, kein SYSTEM)
      - KEIN Registry-Eintrag, KEIN Autostart - nichts bleibt zurueck
      - jederzeit beendbar: Fenster schliessen, Strg+C, oder Rechtsklick aufs Tray-Icon -> Beenden
    So koennen wir die Regeln testen, ohne dass du dich aussperrst.

    Was es tut:
      - liest engine/gate.json (dieselbe Datei, die spaeter der Dienst nutzt)
      - zaehlt deine heutige Arbeit (Clips / Long-form) mit dem Mess-Kern
      - solange nicht erfuellt: schliesst die in 'blocked' genannten Programme (sanft, Stop-Process)
      - zeigt den Stand als Tray-Icon (Maus drueber) und schreibt ihn in deinen Obsidian-Vault
      - ist die Bedingung erfuellt, hoert es auf zu schliessen

    Nur-Anzeige (schliesst nichts): -DryRun
#>
[CmdletBinding()]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'engine/gate.json'),
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'engine/MediaGate.ps1')
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Windows selbst nie anfassen
$script:ProtectedNames = @(
    'system', 'idle', 'registry', 'smss', 'csrss', 'wininit', 'winlogon', 'services', 'lsass',
    'svchost', 'fontdrvhost', 'dwm', 'explorer', 'sihost', 'ctfmon', 'conhost', 'taskmgr',
    'powershell', 'pwsh', 'windowsterminal', 'runtimebroker', 'searchhost', 'startmenuexperiencehost',
    'shellexperiencehost', 'textinputhost', 'spoolsv', 'audiodg'
)

function Get-ExeBase {
    param([string]$Name)
    if (-not $Name) { return '' }
    $n = $Name.Trim()
    $slash = $n.LastIndexOfAny([char[]]@('\', '/'))
    if ($slash -ge 0) { $n = $n.Substring($slash + 1) }
    if ($n.EndsWith('.exe', [System.StringComparison]::OrdinalIgnoreCase)) { $n = $n.Substring(0, $n.Length - 4) }
    return $n.ToLowerInvariant()
}

function Test-PathUnder {
    param([string]$Path, [string]$Prefix)
    if (-not $Path -or -not $Prefix) { return $false }
    $a = $Path.Replace('\', '/')
    $b = $Prefix.Replace('\', '/').TrimEnd('/')
    if ($b.Length -eq 0) { return $false }
    if (-not $a.StartsWith($b, [System.StringComparison]::OrdinalIgnoreCase)) { return $false }
    return ($a.Length -eq $b.Length -or $a[$b.Length] -eq '/')
}

function Read-AppConfig {
    param([string]$Path)
    if (-not [System.IO.File]::Exists($Path)) { throw "Konfiguration nicht gefunden: $Path" }
    $json = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    $gate = ConvertTo-MediaGateConfig $json
    $blocked = Get-JsonValue $json 'blocked' $null
    $names = New-Object System.Collections.Generic.List[string]
    foreach ($n in @(Get-JsonValue $blocked 'process_names' @())) {
        $b = Get-ExeBase ([string]$n)
        if ($b -and ($script:ProtectedNames -notcontains $b)) { $names.Add($b) }
    }
    $paths = New-Object System.Collections.Generic.List[string]
    foreach ($p in @(Get-JsonValue $blocked 'path_prefixes' @())) {
        $np = (ConvertTo-NativePath ([string]$p)).TrimEnd('\', '/')
        if ($np.Length -ge 4) { $paths.Add($np) }
    }
    $vault = [string](Get-JsonValue $json 'vault' '')
    $note = ''
    if ($vault) { $note = Join-Path (ConvertTo-NativePath $vault) 'FocusLock/Status.md' }
    return [pscustomobject]@{
        Gate        = $gate
        BlockNames  = $names.ToArray()
        BlockPaths  = $paths.ToArray()
        PollSeconds = [double](Get-JsonValue $json 'poll_seconds' 3)
        NotePath    = $note
    }
}

function Stop-BlockedPrograms {
    param($App)
    $closed = New-Object System.Collections.Generic.List[string]
    foreach ($p in @(Get-Process)) {
        if ($p.Id -le 4 -or $p.Id -eq $PID) { continue }
        $base = Get-ExeBase $p.ProcessName
        if ($script:ProtectedNames -contains $base) { continue }
        $path = $null
        try { $path = $p.Path } catch { }
        if ($path -and $env:SystemRoot -and (Test-PathUnder $path $env:SystemRoot)) { continue }
        $hit = ($App.BlockNames -contains $base)
        if (-not $hit -and $path) {
            foreach ($prefix in $App.BlockPaths) { if (Test-PathUnder $path $prefix) { $hit = $true; break } }
        }
        if (-not $hit) { continue }
        if ($DryRun) { $closed.Add("$base (nur Anzeige)"); continue }
        try { Stop-Process -Id $p.Id -Force -ErrorAction Stop; $closed.Add($base) } catch { }
    }
    return , $closed.ToArray()
}

function Write-VaultNote {
    param($App, $Score, [bool]$Unlocked)
    if (-not $App.NotePath) { return }
    try {
        $dir = Split-Path -Parent $App.NotePath
        if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        $sb = New-Object System.Text.StringBuilder
        [void]$sb.AppendLine('# FocusLock - Status (Testmodus)')
        [void]$sb.AppendLine('')
        [void]$sb.AppendLine(('> Stand: {0}' -f (Get-Date).ToString('dd.MM.yyyy HH:mm:ss')))
        [void]$sb.AppendLine('')
        if ($Unlocked) {
            [void]$sb.AppendLine(('**FREIGESCHALTET** - {0} von {1} Punkten geschafft.' -f $Score.Points, $Score.Target))
        } else {
            [void]$sb.AppendLine(('**GESPERRT** - {0} von {1} Punkten. Es fehlen noch {2}.' -f $Score.Points, $Score.Target, [Math]::Max(0, $Score.Target - $Score.Points)))
        }
        [void]$sb.AppendLine('')
        [void]$sb.AppendLine(('- Clips: {0} Punkte' -f $Score.ClipPoints))
        [void]$sb.AppendLine(('- Long-form: {0} Punkte' -f $Score.LongformPoints))
        [void]$sb.AppendLine('')
        [void]$sb.AppendLine('| Datei | Art | Zeit | zaehlt | Hinweis |')
        [void]$sb.AppendLine('|---|---|---|---|---|')
        foreach ($it in $Score.Items) {
            $ok = if ($it.Counts) { "+$($it.Points)" } else { '-' }
            [void]$sb.AppendLine(('| {0} | {1} | {2} | {3} | {4} |' -f $it.Name, $it.Kind, $it.Time, $ok, $it.Reason))
        }
        foreach ($pr in $Score.Problems) { [void]$sb.AppendLine(''); [void]$sb.AppendLine("> [!warning] $pr") }
        $tmp = $App.NotePath + '.tmp'
        [System.IO.File]::WriteAllText($tmp, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
        if ([System.IO.File]::Exists($App.NotePath)) { [System.IO.File]::Replace($tmp, $App.NotePath, [NullString]::Value) }
        else { [System.IO.File]::Move($tmp, $App.NotePath) }
    } catch {
        Write-Host "  (Vault-Notiz konnte nicht geschrieben werden: $($_.Exception.Message))" -ForegroundColor DarkYellow
    }
}

# --- Tray-Icon --------------------------------------------------------------
$script:Running = $true
function New-TrayIcon {
    $icon = New-Object System.Windows.Forms.NotifyIcon
    $icon.Icon = [System.Drawing.SystemIcons]::Shield
    $icon.Visible = $true
    $icon.Text = 'FocusLock (Testmodus) startet...'
    $menu = New-Object System.Windows.Forms.ContextMenuStrip
    $item = $menu.Items.Add('FocusLock-Test beenden')
    $item.add_Click({ $script:Running = $false })
    $icon.ContextMenuStrip = $menu
    return $icon
}
function Set-TrayText { param($Icon, [string]$Text)
    # NotifyIcon.Text ist auf 63 Zeichen begrenzt
    if ($Text.Length -gt 63) { $Text = $Text.Substring(0, 60) + '...' }
    $Icon.Text = $Text
}

# --- Start ------------------------------------------------------------------
Write-Host ''
Write-Host '  FocusLock - TESTMODUS' -ForegroundColor Cyan
Write-Host '  ====================' -ForegroundColor Cyan
Write-Host '  Nichts wird dauerhaft installiert. Beenden: Fenster schliessen, Strg+C,' -ForegroundColor Gray
Write-Host '  oder Rechtsklick auf das Schild-Symbol unten rechts -> Beenden.' -ForegroundColor Gray
if ($DryRun) { Write-Host '  (Nur-Anzeige-Modus: es wird nichts geschlossen.)' -ForegroundColor Yellow }
Write-Host ''

$tray = New-TrayIcon

try {
    $lastConfigError = ''
    while ($script:Running) {
        try {
            $app = Read-AppConfig $ConfigPath
            $lastConfigError = ''
        } catch {
            if ($_.Exception.Message -ne $lastConfigError) {
                $lastConfigError = $_.Exception.Message
                Write-Host "  Konfiguration fehlerhaft: $lastConfigError" -ForegroundColor Red
            }
            Set-TrayText $tray "FocusLock Test: Konfig-Fehler"
            Start-Sleep -Seconds 3
            continue
        }

        $score = Get-DayScore $app.Gate
        $unlocked = $score.Met
        $closed = @()
        if (-not $unlocked) { $closed = Stop-BlockedPrograms $app }
        Write-VaultNote $app $score $unlocked

        $stamp = (Get-Date).ToString('HH:mm:ss')
        if ($unlocked) {
            $tray.Icon = [System.Drawing.SystemIcons]::Information
            Set-TrayText $tray ("FocusLock: FREI - {0}/{1} Punkte" -f $score.Points, $score.Target)
            Write-Host ("  [$stamp] FREIGESCHALTET - {0}/{1} Punkte (Clips {2}, Long-form {3})" -f $score.Points, $score.Target, $score.ClipPoints, $score.LongformPoints) -ForegroundColor Green
        } else {
            $tray.Icon = [System.Drawing.SystemIcons]::Shield
            Set-TrayText $tray ("FocusLock: GESPERRT - {0}/{1} Punkte" -f $score.Points, $score.Target)
            $extra = if ($closed.Count -gt 0) { ' | geschlossen: ' + ($closed -join ', ') } else { '' }
            Write-Host ("  [$stamp] GESPERRT - {0}/{1} Punkte (Clips {2}, Long-form {3}){4}" -f $score.Points, $score.Target, $score.ClipPoints, $score.LongformPoints, $extra) -ForegroundColor Yellow
        }
        foreach ($pr in $score.Problems) { Write-Host "    ! $pr" -ForegroundColor DarkYellow }

        $slept = 0.0
        while ($script:Running -and $slept -lt $app.PollSeconds) {
            [System.Windows.Forms.Application]::DoEvents()
            Start-Sleep -Milliseconds 200
            $slept += 0.2
        }
    }
} finally {
    $tray.Visible = $false
    $tray.Dispose()
    Write-Host ''
    Write-Host '  FocusLock-Test beendet. Es wurde nichts auf dem System veraendert.' -ForegroundColor Cyan
    Write-Host ''
}
