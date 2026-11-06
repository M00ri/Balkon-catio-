#Requires -Version 5.1
<#
    Tests für FocusLock. Ohne Zusatzmodule lauffähig:
        pwsh -NoProfile -File tests/FocusLock.Tests.ps1          (Linux/macOS, PowerShell 7)
        powershell -NoProfile -File tests\FocusLock.Tests.ps1    (Windows)
    Gesperrt und beendet wird dabei nur ein eigens gestarteter Testprozess.
#>
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectDir = Split-Path -Parent $PSScriptRoot
. (Join-Path $projectDir 'FocusLock.ps1') -Mode Library

$script:Passed = 0
$script:Failed = 0
function Assert-True {
    param($Condition, [string]$Message)
    if ($Condition) {
        $script:Passed++
        Write-Host "  ok    $Message" -ForegroundColor Green
    } else {
        $script:Failed++
        Write-Host "  FEHLER $Message" -ForegroundColor Red
    }
}
function Assert-Equal {
    param($Expected, $Actual, [string]$Message)
    Assert-True ($Expected -eq $Actual) ("{0} (erwartet: {1}, ist: {2})" -f $Message, $Expected, $Actual)
}
function Assert-Throws {
    param([scriptblock]$Script, [string]$Pattern, [string]$Message)
    $thrown = ''
    try { & $Script } catch { $thrown = $_.Exception.Message }
    Assert-True ($thrown -and $thrown -match $Pattern) "$Message ($thrown)"
}

$root = Join-Path ([System.IO.Path]::GetTempPath()) ('focuslock-test-' + [guid]::NewGuid().ToString('N'))
$dataDir = Join-Path $root 'data'
$clipDir = Join-Path $root 'clips'
New-Item -ItemType Directory -Path $dataDir, $clipDir | Out-Null
$paths = Get-FocusLockPaths $dataDir

# Testprogramm: eine umbenannte Kopie von sleep (Linux/macOS) bzw. ping (Windows),
# damit nur dieser eine Prozess gesperrt wird und nichts anderes auf dem Rechner.
$testName = 'fltestprog'
if ($script:IsWindowsOs) {
    $testExe = Join-Path $root "$testName.exe"
    Copy-Item (Join-Path $env:SystemRoot 'System32\PING.EXE') $testExe
    $testArgs = @('-n', '300', '127.0.0.1')
} else {
    $testExe = Join-Path $root $testName
    Copy-Item (Get-Command sleep -CommandType Application | Select-Object -First 1).Source $testExe
    & chmod +x $testExe
    $testArgs = @('300')
}

function Write-TestConfig {
    param([hashtable]$Changes = @{})
    $cfg = [ordered]@{
        enabled        = $true
        blocked        = [ordered]@{ process_names = @("$testName.exe"); path_prefixes = @() }
        unlock         = [ordered]@{
            folders     = @($clipDir)
            recursive   = $true
            extensions  = @('.mp4', 'MOV')
            min_count   = 3
            min_size_mb = 0.01
            no_reuse    = $true
        }
        day_reset_hour = 4
        time_zone      = 'UTC'
        poll_seconds   = 1
        check_seconds  = 5
    }
    foreach ($k in $Changes.Keys) {
        if ($k -like 'unlock.*') { $cfg.unlock[$k.Substring(7)] = $Changes[$k] }
        elseif ($k -like 'blocked.*') { $cfg.blocked[$k.Substring(8)] = $Changes[$k] }
        else { $cfg[$k] = $Changes[$k] }
    }
    $json = ConvertTo-Json -InputObject $cfg -Depth 5
    [System.IO.File]::WriteAllText($paths.Config, $json)
    # Neuer Zeitstempel, damit der Wächter die Änderung sicher bemerkt
    (Get-Item $paths.Config).LastWriteTimeUtc = [datetime]::UtcNow.AddSeconds($script:configBump++)
}
$script:configBump = 1

$script:seed = 1
# Erzeugt eine Datei mit zufälligem Inhalt und (je nach Endung) echtem Video-Dateikopf
function New-Clip {
    param([string]$Name, [int]$KiloBytes = 64, [string]$Folder = $clipDir, [switch]$NoHeader)
    $bytes = New-Object byte[] ($KiloBytes * 1024)
    (New-Object System.Random($script:seed++)).NextBytes($bytes)
    if (-not $NoHeader) {
        $ext = [System.IO.Path]::GetExtension($Name).ToLowerInvariant()
        if (@('.mp4', '.mov') -contains $ext) {
            $hdr = [byte[]](0, 0, 0, 0x18) + [System.Text.Encoding]::ASCII.GetBytes('ftypisom')
        } elseif ($ext -eq '.mkv') {
            $hdr = [byte[]](0x1A, 0x45, 0xDF, 0xA3)
        } else {
            $hdr = [byte[]]@()
        }
        [Array]::Copy($hdr, $bytes, $hdr.Length)
    }
    $path = Join-Path $Folder $Name
    [System.IO.File]::WriteAllBytes($path, $bytes)
    return $path
}

function Start-TestProcess {
    return Start-Process -FilePath $testExe -ArgumentList $testArgs -PassThru
}
function Wait-Exit {
    param($Process, [int]$Seconds = 5)
    try { [void]$Process.WaitForExit($Seconds * 1000) } catch { }
    return $Process.HasExited
}

try {
    Write-Host ''
    Write-Host 'Konfiguration' -ForegroundColor Cyan
    Write-TestConfig
    $cfg = Read-FocusLockConfig $paths.Config
    Assert-Equal $testName $cfg.BlockNames[0] 'Programmname ohne .exe, klein geschrieben'
    Assert-True ($cfg.Extensions -contains '.mov') 'Endung MOV wird zu .mov'
    Assert-Equal 3 $cfg.MinCount 'min_count'
    Assert-Equal ([long](0.01 * 1MB)) $cfg.MinSizeBytes 'min_size_mb in Bytes'

    Write-TestConfig @{ 'blocked.process_names' = @('explorer.exe') }
    Assert-Throws { Read-FocusLockConfig $paths.Config } 'Windows' 'Systemprozesse lassen sich nicht sperren'
    Write-TestConfig @{ 'blocked.process_names' = @(); 'blocked.path_prefixes' = @('C:\') }
    Assert-Throws { Read-FocusLockConfig $paths.Config } 'allgemein' 'Ganzes Laufwerk als Sperr-Ordner wird abgelehnt'
    Write-TestConfig @{ 'blocked.process_names' = @() }
    Assert-Throws { Read-FocusLockConfig $paths.Config } 'kein Programm' 'Leere Sperrliste wird abgelehnt'
    Write-TestConfig @{ 'unlock.folders' = @() }
    Assert-Throws { Read-FocusLockConfig $paths.Config } 'leer' 'Ohne Clip-Ordner geht es nicht'
    [System.IO.File]::WriteAllText($paths.Config, '{ "unlock": { "folders": ["C:\Users\x"] } }')
    Assert-Throws { Read-FocusLockConfig $paths.Config } 'Backslashes' 'Einfacher Backslash: verständlicher Hinweis'
    Write-TestConfig

    Write-Host ''
    Write-Host 'Tagesgrenze' -ForegroundColor Cyan
    $utcCfg = [pscustomobject]@{ TimeZone = [System.TimeZoneInfo]::FindSystemTimeZoneById('UTC'); DayResetHour = 4 }
    Assert-Equal '2026-11-05' (Get-DayWindow $utcCfg ([datetime]'2026-11-06 03:59')).Key '03:59 gehört noch zum Vortag'
    Assert-Equal '2026-11-06' (Get-DayWindow $utcCfg ([datetime]'2026-11-06 04:00')).Key 'Ab 04:00 neuer Tag'
    $berlin = $null
    foreach ($id in @('W. Europe Standard Time', 'Europe/Berlin')) {
        try { $berlin = [System.TimeZoneInfo]::FindSystemTimeZoneById($id); break } catch { }
    }
    if ($berlin) {
        $bCfg = [pscustomobject]@{ TimeZone = $berlin; DayResetHour = 4 }
        Assert-Equal '2026-11-05' (Get-DayWindow $bCfg ([datetime]'2026-11-06 02:30')).Key 'Berlin 03:30 (Winterzeit) gehört zum Vortag'
        Assert-Equal '2026-11-06' (Get-DayWindow $bCfg ([datetime]'2026-11-06 03:30')).Key 'Berlin 04:30 ist der neue Tag'
        $w = Get-DayWindow ([pscustomobject]@{ TimeZone = $berlin; DayResetHour = 2 }) ([datetime]'2026-03-29 12:00')
        Assert-Equal ([datetime]'2026-03-29 01:00') $w.StartUtc 'Zeitumstellung: 02:00 gibt es nicht, Tag beginnt 03:00 Sommerzeit'
    }

    Write-Host ''
    Write-Host 'Sperr-Regeln' -ForegroundColor Cyan
    $ruleCfg = [pscustomobject]@{ BlockNames = @('steam', 'fortniteclient-win64-shipping'); BlockPaths = @('C:\Spiele\Steam\steamapps\common') }
    Assert-True (Get-BlockReason $ruleCfg @('Steam') '') 'Name ohne .exe, Groß/klein egal'
    Assert-True (Get-BlockReason $ruleCfg @('x', 'C:\a\STEAM.EXE') '') 'Name aus dem Pfad'
    Assert-True (Get-BlockReason $ruleCfg @('harmlos', '', 'FortniteClient-Win64-Shipping.exe') '') 'Umbenannt, aber Originalname passt'
    Assert-True (Get-BlockReason $ruleCfg @('foo') 'c:\spiele\steam\steamapps\common\Game\foo.exe') 'Alles im gesperrten Ordner'
    Assert-True (-not (Get-BlockReason $ruleCfg @('foo') 'C:\Spiele\Steam\steamapps\commonX\foo.exe')) 'Nachbarordner mit ähnlichem Namen bleibt frei'
    Assert-True (-not (Get-BlockReason $ruleCfg @('notepad') 'C:\Windows\notepad.exe')) 'Anderes Programm bleibt frei'
    Assert-True (Test-PathUnder 'C:\A\B' 'C:\A\') 'Test-PathUnder mit Schrägstrich am Ende'

    $savedRoot = $env:SystemRoot
    try {
        $env:SystemRoot = 'C:\Windows'
        $vCfg = [pscustomobject]@{ BlockNames = @('explorer'); BlockPaths = @('C:\Users\max\Games') }
        $real = [pscustomobject]@{ ProcessName = 'explorer'; Path = 'C:\Windows\explorer.exe'; Id = 999991 }
        $fake = [pscustomobject]@{ ProcessName = 'explorer'; Path = 'C:\Users\max\Games\explorer.exe'; Id = 999992 }
        $hidden = [pscustomobject]@{ ProcessName = 'csrss'; Path = $null; Id = 999993 }
        Assert-True (-not (Get-ProcessVerdict $vCfg $real $null).Reason) 'Echter Explorer aus C:\Windows bleibt unangetastet'
        Assert-True ((Get-ProcessVerdict $vCfg $fake $null).Reason) 'Spiel, umbenannt in explorer.exe, wird trotzdem gesperrt'
        $v = Get-ProcessVerdict $vCfg $hidden $null
        Assert-True (-not $v.Reason -and -not $v.Final) 'Systemprozess ohne lesbaren Pfad: in Ruhe lassen, aber nochmal nachsehen'
        Write-TestConfig @{ 'blocked.path_prefixes' = @('C:/Windows/System32') }
        Assert-Throws { Read-FocusLockConfig $paths.Config } 'Windows-Ordner' 'Windows-Ordner kann nicht gesperrt werden'
        Write-TestConfig @{ 'blocked.path_prefixes' = @('C:/Spiele') }
        Assert-True (Read-FocusLockConfig $paths.Config) 'Normaler Spiele-Ordner ist erlaubt'
    } finally {
        $env:SystemRoot = $savedRoot
        Write-TestConfig
    }

    Write-Host ''
    Write-Host 'Clips zählen' -ForegroundColor Cyan
    $cfg = Read-FocusLockConfig $paths.Config
    $state = Read-FocusLockState $paths.State
    $c1 = New-Clip 'clip1.mp4'
    New-Clip 'clip2.MOV' | Out-Null
    $p = Get-UnlockProgress $cfg $state
    Assert-Equal 2 $p.Count 'Zwei Clips gezählt'
    Assert-True (-not $p.Met) 'Noch nicht erfüllt (3 nötig)'

    New-Clip 'notizen.txt' | Out-Null
    New-Clip 'winzig.mp4' -KiloBytes 1 | Out-Null
    Copy-Item $c1 (Join-Path $clipDir 'clip1-kopie.mp4')
    $old = New-Clip 'alt.mp4'
    (Get-Item $old).LastWriteTimeUtc = [datetime]::UtcNow.AddDays(-3)
    $p = Get-UnlockProgress $cfg $state
    Assert-Equal 2 $p.Count 'Txt, zu kleine, kopierte und alte Dateien zählen nicht'
    Assert-True (-not ($p.Files | Where-Object { $_.Name -eq 'notizen.txt' })) 'Falsche Endung wird ignoriert'
    Assert-True (($p.Files | Where-Object { $_.Name -eq 'winzig.mp4' }).Reason -match 'zu klein') 'Zu kleiner Clip wird erklärt'
    Assert-Equal 1 @($p.Files | Where-Object { $_.Name -like 'clip1*' -and $_.Reason -match 'gleicher Inhalt' }).Count 'Kopie wird erkannt'
    $oldEntry = $p.Files | Where-Object { $_.Name -eq 'alt.mp4' }
    Assert-True ($null -eq $oldEntry -or -not $oldEntry.Counts) 'Alter Clip zählt nicht'

    New-Clip 'zufall.mp4' -NoHeader | Out-Null
    [System.IO.File]::WriteAllBytes((Join-Path $clipDir 'nullen.mp4'), (New-Object byte[] 65536))
    New-Clip 'falsch.mkv' -NoHeader | Out-Null
    $p = Get-UnlockProgress $cfg $state
    Assert-Equal 2 $p.Count 'Dateien, die nur wie Videos heißen, zählen nicht'
    Assert-Equal 2 @($p.Files | Where-Object { $_.Name -match '^(zufall|nullen)' -and $_.Reason -match 'keine echte Videodatei' }).Count 'Zufalls- und Null-Datei als Fake erkannt'
    $cfgMkv = Read-FocusLockConfig $paths.Config
    $cfgMkv.Extensions = @('.mkv')
    New-Clip 'echt.mkv' | Out-Null
    $pm = Get-UnlockProgress $cfgMkv $state
    Assert-True (@($pm.Files | Where-Object { $_.Name -eq 'echt.mkv' })[0].Counts -and -not @($pm.Files | Where-Object { $_.Name -eq 'falsch.mkv' })[0].Counts) 'MKV-Kopf wird erkannt'
    Remove-Item (Join-Path $clipDir 'zufall.mp4'), (Join-Path $clipDir 'nullen.mp4'), (Join-Path $clipDir 'falsch.mkv'), (Join-Path $clipDir 'echt.mkv')

    $sub = Join-Path $clipDir 'Unterordner'
    New-Item -ItemType Directory -Path $sub | Out-Null
    New-Clip 'clip3.mp4' -Folder $sub | Out-Null
    try {
        New-Item -ItemType SymbolicLink -Path (Join-Path $sub 'schleife') -Target $clipDir -ErrorAction Stop | Out-Null
        $linkMade = $true
    } catch { $linkMade = $false }
    $p = Get-UnlockProgress $cfg $state
    Assert-Equal 3 $p.Count 'Clip im Unterordner zählt'
    Assert-True $p.Met 'Bedingung erfüllt'
    if ($linkMade) { Assert-Equal 3 @($p.Files | Where-Object { $_.Counts }).Count 'Verknüpfter Ordner wird nicht doppelt durchsucht' }

    $reuseState = [pscustomobject]@{ UnlockedDay = ''; UnlockedAt = ''; Used = @{ ($p.Fingerprints[0]) = '2020-01-01' } }
    $p2 = Get-UnlockProgress $cfg $reuseState
    Assert-Equal 2 $p2.Count 'Schon benutzter Clip zählt nicht nochmal'
    Assert-True ((@($p2.Files | Where-Object { $_.Name -eq 'clip1.mp4' })[0].Reason) -match 'schon am 01\.01\.2020') 'Grund nennt das Datum'

    $nr = Read-FocusLockConfig $paths.Config
    $nr.NoReuse = $false
    Assert-Equal 3 (Get-UnlockProgress $nr $reuseState).Count 'Mit no_reuse=false darf er wieder zählen'

    Write-Host ''
    Write-Host 'Wächter: sperren und freischalten' -ForegroundColor Cyan
    Remove-Item (Join-Path $sub 'clip3.mp4') -Force
    $ctx = New-WatcherContext $paths
    $proc = Start-TestProcess
    Start-Sleep -Milliseconds 300
    Invoke-WatcherTick $ctx
    Assert-True (Wait-Exit $proc) 'Gesperrtes Programm wird beendet'
    $status = Read-JsonFile $paths.Status
    Assert-Equal $false $status.unlocked 'status.json: gesperrt'
    Assert-Equal 2 $status.count 'status.json: 2 Clips'
    Assert-Equal 3 $status.required 'status.json: 3 nötig'
    Assert-True ($null -ne $status.last_block -and $status.last_block.process) 'status.json meldet die Sperre für das Hinweisfenster'

    New-Clip 'clip4.mp4' | Out-Null
    $ctx.LastCheckUtc = [datetime]::MinValue
    Invoke-WatcherTick $ctx
    $state = Read-FocusLockState $paths.State
    $today = (Get-DayWindow $cfg ([datetime]::UtcNow)).Key
    Assert-Equal $today $state.UnlockedDay 'Freigeschaltet und in state.json vermerkt'
    Assert-Equal 3 $state.Used.Count 'Die drei Clips sind als benutzt gespeichert'
    Assert-Equal $true (Read-JsonFile $paths.Status).unlocked 'status.json: freigeschaltet'

    $proc = Start-TestProcess
    Start-Sleep -Milliseconds 300
    Invoke-WatcherTick $ctx
    Assert-True (-not (Wait-Exit $proc 1)) 'Nach der Freischaltung darf das Programm laufen'

    # Am nächsten Tag ist wieder gesperrt und die alten Clips zählen nicht mehr
    $tomorrow = [datetime]::UtcNow.AddDays(1)
    $ctx.LastCheckUtc = [datetime]::MinValue
    Invoke-WatcherTick $ctx $tomorrow
    Assert-True (Wait-Exit $proc) 'Am nächsten Tag wird wieder gesperrt'
    Assert-Equal 0 (Read-JsonFile $paths.Status).count 'Gestrige Clips zählen am nächsten Tag nicht'

    # Ein Neustart des Wächters vergisst die Freischaltung nicht
    $ctx2 = New-WatcherContext $paths
    $proc = Start-TestProcess
    Start-Sleep -Milliseconds 300
    Invoke-WatcherTick $ctx2
    Assert-True (-not (Wait-Exit $proc 1)) 'Freischaltung übersteht einen Neustart des Wächters'
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue

    # Kaputte Konfiguration hebt die Sperre nicht auf
    $ctx3 = New-WatcherContext $paths
    $ctx3.State.UnlockedDay = ''
    Invoke-WatcherTick $ctx3 $tomorrow
    [System.IO.File]::WriteAllText($paths.Config, '{ kaputt')
    (Get-Item $paths.Config).LastWriteTimeUtc = [datetime]::UtcNow.AddMinutes(5)
    $proc = Start-TestProcess
    Start-Sleep -Milliseconds 300
    Invoke-WatcherTick $ctx3 $tomorrow
    Assert-True (Wait-Exit $proc) 'Kaputte config.json: bisherige Sperre bleibt aktiv'
    Assert-True ($ctx3.ConfigError -match 'JSON') 'Fehler wird gemeldet'

    # Ausgeschaltet
    Write-TestConfig @{ enabled = $false }
    $proc = Start-TestProcess
    Start-Sleep -Milliseconds 300
    Invoke-WatcherTick $ctx3 $tomorrow
    Assert-True (-not (Wait-Exit $proc 1)) 'enabled=false sperrt nichts'
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue

    Write-Host ''
    Write-Host 'Kompletter Durchlauf als eigener Prozess' -ForegroundColor Cyan
    Write-TestConfig
    Remove-Item $paths.State, $paths.Status -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $clipDir 'clip4.mp4') -Force
    $shell = (Get-Process -Id $PID).Path
    $script = Join-Path $projectDir 'FocusLock.ps1'
    $statusText = & $shell -NoProfile -File $script -Mode Status -DataDir $dataDir 2>&1 | Out-String
    Assert-True ($statusText -match 'GESPERRT' -and $statusText -match '2 von 3') "Status-Anzeige: gesperrt, 2 von 3"
    Assert-True ($statusText -match 'nicht zu laufen') 'Status-Anzeige merkt, dass kein Wächter läuft'

    $watcher = Start-Process -FilePath $shell -ArgumentList @('-NoProfile', '-File', "`"$script`"", '-Mode', 'Run', '-DataDir', "`"$dataDir`"") -PassThru
    $proc = Start-TestProcess
    Assert-True (Wait-Exit $proc 15) 'Laufender Wächter beendet das gesperrte Programm'
    New-Clip 'clip5.mp4' | Out-Null
    $proc = Start-TestProcess   # löst sofortige Prüfung aus -> Freischaltung
    [void](Wait-Exit $proc 10)
    $deadline = (Get-Date).AddSeconds(15)
    $unlocked = $false
    while (-not $unlocked -and (Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 500
        try { $unlocked = [bool](Read-JsonFile $paths.Status).unlocked } catch { }
    }
    Assert-True $unlocked 'Laufender Wächter schaltet frei, sobald der dritte Clip da ist'
    $statusText = & $shell -NoProfile -File $script -Mode Status -DataDir $dataDir 2>&1 | Out-String
    Assert-True ($statusText -match 'FREIGESCHALTET') 'Status-Anzeige: freigeschaltet'
    $checkJson = & $shell -NoProfile -File $script -Mode Check -DataDir $dataDir | Out-String | ConvertFrom-Json
    Assert-True ($checkJson.Unlocked -and $checkJson.Count -eq 3) 'Check-Modus liefert JSON'
    Stop-Process -Id $watcher.Id -Force -ErrorAction SilentlyContinue
    $log = [System.IO.File]::ReadAllText($paths.Log)
    Assert-True ($log -match 'Wächter gestartet' -and $log -match 'Gesperrt:' -and $log -match 'FREIGESCHALTET') 'Protokoll enthält Start, Sperre und Freischaltung'

    Write-Host ''
    Write-Host 'Dateien' -ForegroundColor Cyan
    foreach ($f in Get-ChildItem -Path $projectDir -Filter '*.ps1' -Recurse) {
        $head = [System.IO.File]::ReadAllBytes($f.FullName)[0..2]
        Assert-True ($head[0] -eq 0xEF -and $head[1] -eq 0xBB -and $head[2] -eq 0xBF) "$($f.Name) ist UTF-8 mit BOM (nötig für Umlaute in Windows PowerShell 5.1)"
    }
    $shipped = Join-Path $projectDir 'config.json'
    $sc = Read-FocusLockConfig $shipped
    Assert-True ($sc.BlockNames -contains 'steam' -and $sc.MinCount -eq 5 -and $sc.Folders.Count -eq 1) 'Mitgelieferte config.json ist gültig'
} catch {
    $script:Failed++
    Write-Host "  ABBRUCH: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace
} finally {
    Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $testExe } | Stop-Process -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host ("{0} bestanden, {1} fehlgeschlagen" -f $script:Passed, $script:Failed) -ForegroundColor $(if ($script:Failed) { 'Red' } else { 'Green' })
if ($script:Failed) { exit 1 }
