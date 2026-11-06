#Requires -Version 5.1
<#
.SYNOPSIS
    FocusLock - sperrt Spiele und andere Programme, bis die Tagesaufgabe erledigt ist.

.DESCRIPTION
    Modi:
      Run      Wächter. Läuft über die Aufgabenplanung als SYSTEM, beendet gesperrte
               Programme und schaltet frei, sobald die Bedingung erfüllt ist.
      Status   Zeigt dir, wie weit du heute bist. Nur lesend, läuft als normaler Benutzer.
      Check    Wie Status, aber als JSON (Diagnose).
      Library  Lädt nur die Funktionen (für Installer und Tests).

    Alle Daten liegen in %ProgramData%\FocusLock:
      config.json   Was gesperrt wird und was zum Freischalten nötig ist
      state.json    Freischaltung von heute und schon benutzte Clips
      status.json   Aktueller Stand für Hinweisfenster und Status-Anzeige
      focuslock.log Protokoll
    Schreiben dürfen dort nur Administratoren und SYSTEM.
#>
[CmdletBinding()]
param(
    [ValidateSet('Run', 'Status', 'Check', 'Library')]
    [string]$Mode = 'Status',
    [string]$DataDir = '',
    [switch]$Pause
)

# Prozesse, die FocusLock nie anfasst, egal was in der Konfiguration steht.
$script:ProtectedNames = @(
    'system', 'idle', 'registry', 'secure system', 'memory compression', 'memcompression',
    'smss', 'csrss', 'wininit', 'winlogon', 'services', 'lsass', 'lsaiso', 'svchost',
    'fontdrvhost', 'dwm', 'explorer', 'sihost', 'ctfmon', 'conhost', 'taskmgr',
    'powershell', 'pwsh', 'runtimebroker', 'searchhost', 'startmenuexperiencehost',
    'shellexperiencehost', 'textinputhost', 'spoolsv', 'audiodg', 'msmpeng'
)
$script:LogPath = ''
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$script:FingerprintCache = @{}
$script:FingerprintChunk = 1MB
# Obergrenzen, damit ein vollgemüllter Clip-Ordner den Wächter nicht ausbremst
$script:MaxFilesToHash = 300
$script:MaxDirEntries = 50000
$script:MaxDepth = 10
$script:IsWindowsOs = ([Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT)
$script:German = [System.Globalization.CultureInfo]::GetCultureInfo('de-DE')

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

function Get-FocusLockPaths {
    param([string]$DataDir)
    if (-not $DataDir) { $DataDir = Join-Path $env:ProgramData 'FocusLock' }
    return [pscustomobject]@{
        Dir    = $DataDir
        Config = Join-Path $DataDir 'config.json'
        State  = Join-Path $DataDir 'state.json'
        Status = Join-Path $DataDir 'status.json'
        Log    = Join-Path $DataDir 'focuslock.log'
    }
}

function Write-FocusLog {
    param([string]$Message)
    if (-not $script:LogPath) { return }
    try {
        $info = New-Object System.IO.FileInfo($script:LogPath)
        if ($info.Exists -and $info.Length -gt 2MB) {
            $old = $script:LogPath + '.old'
            if ([System.IO.File]::Exists($old)) { [System.IO.File]::Delete($old) }
            [System.IO.File]::Move($script:LogPath, $old)
        }
        $line = '{0}  {1}{2}' -f (Get-Date).ToString('yyyy-MM-dd HH:mm:ss'), $Message, [Environment]::NewLine
        [System.IO.File]::AppendAllText($script:LogPath, $line, $script:Utf8NoBom)
    } catch { }
}

function Read-JsonFile {
    param([string]$Path)
    return ([System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json)
}

# Schreibt erst in eine Hilfsdatei und tauscht dann, damit Leser nie halbe Dateien sehen.
function Write-JsonFile {
    param([string]$Path, $Data)
    $json = ConvertTo-Json -InputObject $Data -Depth 8
    $tmp = $Path + '.tmp'
    [System.IO.File]::WriteAllText($tmp, $json, $script:Utf8NoBom)
    for ($i = 0; $i -lt 5; $i++) {
        try {
            if ([System.IO.File]::Exists($Path)) {
                [System.IO.File]::Replace($tmp, $Path, [NullString]::Value)
            } else {
                [System.IO.File]::Move($tmp, $Path)
            }
            return
        } catch {
            Start-Sleep -Milliseconds 100
        }
    }
    [System.IO.File]::WriteAllText($Path, $json, $script:Utf8NoBom)
    try { [System.IO.File]::Delete($tmp) } catch { }
}

function Get-JsonValue {
    param($Object, [string]$Name, $Default)
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop -or $null -eq $prop.Value) { return $Default }
    return $prop.Value
}

function ConvertTo-StringList {
    param($Value)
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($item in @($Value)) {
        if ($null -eq $item) { continue }
        $text = ([string]$item).Trim()
        if ($text) { $list.Add($text) }
    }
    return , $list.ToArray()
}

function ConvertTo-DayKey {
    param($Value)
    if ($null -eq $Value) { return '' }
    if ($Value -is [datetime]) { return $Value.ToString('yyyy-MM-dd') }
    return [string]$Value
}

function Format-DayKey {
    param([string]$Key)
    $d = [datetime]::MinValue
    if ([datetime]::TryParseExact($Key, 'yyyy-MM-dd', [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::None, [ref]$d)) {
        return $d.ToString('dd.MM.yyyy')
    }
    return $Key
}

function ConvertTo-UnixSeconds {
    param([datetime]$UtcTime)
    return [long][Math]::Floor(($UtcTime - [datetime]::new(1970, 1, 1)).TotalSeconds)
}

# Unter Windows sind / und \ beides erlaubt; intern wird mit \ verglichen.
function ConvertTo-NativePath {
    param([string]$Path)
    if ($script:IsWindowsOs) { return $Path.Replace('/', '\') }
    return $Path
}

# "C:\Spiele\Foo\foo.exe" -> "foo"
function Get-ExeBase {
    param([string]$Name)
    if (-not $Name) { return '' }
    $n = $Name.Trim()
    $slash = $n.LastIndexOfAny([char[]]@('\', '/'))
    if ($slash -ge 0) { $n = $n.Substring($slash + 1) }
    if ($n.EndsWith('.exe', [System.StringComparison]::OrdinalIgnoreCase)) { $n = $n.Substring(0, $n.Length - 4) }
    return $n.ToLowerInvariant()
}

# Liegt $Path in $Prefix (oder ist es selbst)? / und \ gelten als gleich, Groß/klein egal.
function Test-PathUnder {
    param([string]$Path, [string]$Prefix)
    if (-not $Path -or -not $Prefix) { return $false }
    $a = $Path.Replace('\', '/')
    $b = $Prefix.Replace('\', '/').TrimEnd('/')
    if ($b.Length -eq 0) { return $false }
    if (-not $a.StartsWith($b, [System.StringComparison]::OrdinalIgnoreCase)) { return $false }
    return ($a.Length -eq $b.Length -or $a[$b.Length] -eq '/')
}

function Test-AbsolutePath {
    param([string]$Path)
    return ($Path -match '^[A-Za-z]:[\\/]' -or $Path.StartsWith('\\') -or [System.IO.Path]::IsPathRooted($Path))
}

# ---------------------------------------------------------------------------
# Konfiguration und Zustand
# ---------------------------------------------------------------------------

function Read-FocusLockConfig {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not [System.IO.File]::Exists($Path)) { throw "Konfiguration nicht gefunden: $Path" }
    try {
        $j = Read-JsonFile $Path
    } catch {
        throw ("config.json ist kein gültiges JSON: {0}`nTipp: In Pfaden doppelte Backslashes (C:\\Users\\...) oder normale Schrägstriche (C:/Users/...) verwenden." -f $_.Exception.Message)
    }

    $blocked = Get-JsonValue $j 'blocked' $null
    $unlock = Get-JsonValue $j 'unlock' $null
    if ($null -eq $blocked) { throw "config.json: Der Abschnitt 'blocked' fehlt." }
    if ($null -eq $unlock) { throw "config.json: Der Abschnitt 'unlock' fehlt." }

    $names = New-Object System.Collections.Generic.List[string]
    $labels = New-Object System.Collections.Generic.List[string]
    foreach ($n in (ConvertTo-StringList (Get-JsonValue $blocked 'process_names' $null))) {
        $base = Get-ExeBase $n
        if (-not $base) { continue }
        if ($script:ProtectedNames -contains $base) {
            throw "config.json: '$n' gehört zu Windows selbst und kann nicht gesperrt werden."
        }
        $names.Add($base)
        $labels.Add([System.IO.Path]::GetFileName($n))
    }

    $paths = New-Object System.Collections.Generic.List[string]
    foreach ($p in (ConvertTo-StringList (Get-JsonValue $blocked 'path_prefixes' $null))) {
        $native = ConvertTo-NativePath $p
        $trimmed = $native.TrimEnd('\', '/')
        if ($trimmed.Length -lt 4 -or $trimmed -match '^[A-Za-z]:$') {
            throw "config.json: '$p' ist als gesperrter Ordner zu allgemein."
        }
        if (-not (Test-AbsolutePath $native)) {
            throw "config.json: '$p' muss ein vollständiger Pfad sein (z.B. C:/Spiele/...)."
        }
        if ($env:SystemRoot -and ((Test-PathUnder $trimmed $env:SystemRoot) -or (Test-PathUnder $env:SystemRoot $trimmed))) {
            throw "config.json: '$p' enthält den Windows-Ordner und kann nicht gesperrt werden."
        }
        $paths.Add($trimmed)
    }
    if ($names.Count -eq 0 -and $paths.Count -eq 0) {
        throw "config.json: Unter 'blocked' ist kein Programm und kein Ordner eingetragen."
    }

    $folders = New-Object System.Collections.Generic.List[string]
    foreach ($f in (ConvertTo-StringList (Get-JsonValue $unlock 'folders' $null))) {
        $native = ConvertTo-NativePath $f
        if (-not (Test-AbsolutePath $native)) {
            throw "config.json: Clip-Ordner '$f' muss ein vollständiger Pfad sein (z.B. C:/Users/Max/Videos/Clips)."
        }
        $folders.Add($native)
    }
    if ($folders.Count -eq 0) { throw "config.json: 'unlock.folders' ist leer." }

    $extensions = New-Object System.Collections.Generic.List[string]
    foreach ($e in (ConvertTo-StringList (Get-JsonValue $unlock 'extensions' $null))) {
        $x = $e.ToLowerInvariant()
        if (-not $x.StartsWith('.')) { $x = '.' + $x }
        $extensions.Add($x)
    }

    $minCount = [int](Get-JsonValue $unlock 'min_count' 5)
    if ($minCount -lt 1) { throw "config.json: 'unlock.min_count' muss mindestens 1 sein." }
    $minSizeMb = [double](Get-JsonValue $unlock 'min_size_mb' 1)
    if ($minSizeMb -lt 0) { throw "config.json: 'unlock.min_size_mb' darf nicht negativ sein." }

    $resetHour = [int](Get-JsonValue $j 'day_reset_hour' 4)
    if ($resetHour -lt 0 -or $resetHour -gt 23) { throw "config.json: 'day_reset_hour' muss zwischen 0 und 23 liegen." }

    $tzId = [string](Get-JsonValue $j 'time_zone' '')
    $tz = [System.TimeZoneInfo]::Local
    if ($tzId) {
        try { $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById($tzId) }
        catch { throw "config.json: Zeitzone '$tzId' ist unbekannt (für Deutschland: 'W. Europe Standard Time')." }
    }

    $poll = [Math]::Min(30.0, [Math]::Max(0.5, [double](Get-JsonValue $j 'poll_seconds' 2)))
    $check = [Math]::Min(3600.0, [Math]::Max(5.0, [double](Get-JsonValue $j 'check_seconds' 20)))

    return [pscustomobject]@{
        Enabled      = [bool](Get-JsonValue $j 'enabled' $true)
        BlockNames   = $names.ToArray()
        BlockLabels  = $labels.ToArray()
        BlockPaths   = $paths.ToArray()
        Folders      = $folders.ToArray()
        Recursive    = [bool](Get-JsonValue $unlock 'recursive' $true)
        Extensions   = $extensions.ToArray()
        MinCount     = $minCount
        MinSizeMb    = $minSizeMb
        MinSizeBytes = [long]($minSizeMb * 1MB)
        NoReuse      = [bool](Get-JsonValue $unlock 'no_reuse' $true)
        DayResetHour = $resetHour
        TimeZone     = $tz
        PollSeconds  = $poll
        CheckSeconds = $check
    }
}

function Read-FocusLockState {
    param([string]$Path)
    $state = [pscustomobject]@{ UnlockedDay = ''; UnlockedAt = ''; Used = @{} }
    if (-not [System.IO.File]::Exists($Path)) { return $state }
    try {
        $j = Read-JsonFile $Path
        $state.UnlockedDay = ConvertTo-DayKey (Get-JsonValue $j 'unlocked_day' '')
        $state.UnlockedAt = [string](Get-JsonValue $j 'unlocked_at' '')
        $used = Get-JsonValue $j 'used' $null
        if ($null -ne $used) {
            foreach ($prop in $used.PSObject.Properties) { $state.Used[$prop.Name] = ConvertTo-DayKey $prop.Value }
        }
    } catch {
        Write-FocusLog "state.json ist nicht lesbar: $($_.Exception.Message)"
    }
    return $state
}

function Save-FocusLockState {
    param([string]$Path, $State, [datetime]$UtcNow)
    # Nach gut einem Jahr dürfen Fingerabdrücke vergessen werden
    $limit = $UtcNow.AddDays(-400).ToString('yyyy-MM-dd')
    $used = [ordered]@{}
    foreach ($k in @($State.Used.Keys | Sort-Object)) {
        $d = [string]$State.Used[$k]
        if ([string]::CompareOrdinal($d, $limit) -ge 0) { $used[$k] = $d }
    }
    Write-JsonFile $Path ([ordered]@{
            unlocked_day = $State.UnlockedDay
            unlocked_at  = $State.UnlockedAt
            used         = $used
        })
}

# ---------------------------------------------------------------------------
# Bedingung: Clips von heute
# ---------------------------------------------------------------------------

function ConvertTo-UtcSafe {
    param([datetime]$Local, [System.TimeZoneInfo]$Zone)
    $t = [datetime]::SpecifyKind($Local, [System.DateTimeKind]::Unspecified)
    # Zeitumstellung: eine Uhrzeit, die es nicht gibt, nach hinten schieben
    while ($Zone.IsInvalidTime($t)) { $t = $t.AddMinutes(30) }
    return [System.TimeZoneInfo]::ConvertTimeToUtc($t, $Zone)
}

# Der "Tag" beginnt um day_reset_hour (Standard 04:00), damit Clips nach Mitternacht noch zählen.
function Get-DayWindow {
    param($Config, [datetime]$UtcNow)
    $tz = $Config.TimeZone
    $local = [System.TimeZoneInfo]::ConvertTimeFromUtc([datetime]::SpecifyKind($UtcNow, [System.DateTimeKind]::Utc), $tz)
    $start = [datetime]::SpecifyKind($local.Date.AddHours($Config.DayResetHour), [System.DateTimeKind]::Unspecified)
    if ($local -lt $start) { $start = $start.AddDays(-1) }
    $end = $start.AddDays(1)
    return [pscustomobject]@{
        Key        = $start.ToString('yyyy-MM-dd')
        StartLocal = $start
        EndLocal   = $end
        StartUtc   = ConvertTo-UtcSafe $start $tz
        EndUtc     = ConvertTo-UtcSafe $end $tz
    }
}

function Test-IsLink {
    param($Info)
    $prop = $Info.PSObject.Properties['LinkType']
    if ($null -ne $prop) { return [bool]$prop.Value }
    return $true
}

# Sucht Dateien ohne Verknüpfungen/Junctions zu folgen (sonst wären Endlosschleifen möglich).
function Get-ClipCandidates {
    param([string]$Root, [bool]$Recurse, [string[]]$Extensions)
    $result = New-Object System.Collections.Generic.List[System.IO.FileInfo]
    $stack = New-Object System.Collections.Generic.Stack[object]
    $stack.Push(@($Root, 0))
    $visited = 0
    while ($stack.Count -gt 0) {
        $item = $stack.Pop()
        $dir = New-Object System.IO.DirectoryInfo([string]$item[0])
        $entries = @()
        try { $entries = $dir.GetFileSystemInfos() } catch { continue }
        foreach ($e in $entries) {
            $visited++
            if ($visited -gt $script:MaxDirEntries) { return , $result.ToArray() }
            if ($e -is [System.IO.DirectoryInfo]) {
                if (-not $Recurse -or [int]$item[1] -ge $script:MaxDepth) { continue }
                if (($e.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -and (Test-IsLink $e)) { continue }
                $stack.Push(@($e.FullName, ([int]$item[1] + 1)))
            } elseif ($Extensions.Count -eq 0 -or $Extensions -contains $e.Extension.ToLowerInvariant()) {
                $result.Add($e)
            }
        }
    }
    return , $result.ToArray()
}

function Copy-StreamRange {
    param([System.IO.Stream]$Source, [System.IO.Stream]$Target, [long]$Offset, [long]$Count)
    $Source.Position = $Offset
    $buf = New-Object byte[] 65536
    $left = $Count
    while ($left -gt 0) {
        $n = $Source.Read($buf, 0, [int][Math]::Min([long]$buf.Length, $left))
        if ($n -le 0) { break }
        $Target.Write($buf, 0, $n)
        $left -= $n
    }
}

# Fingerabdruck aus Größe + erstem und letztem MB. Erkennt Kopien und schon benutzte Clips,
# ohne Gigabyte-Dateien komplett lesen zu müssen.
function Get-FileFingerprint {
    param([System.IO.FileInfo]$File)
    $key = '{0}|{1}|{2}' -f $File.FullName, $File.Length, $File.LastWriteTimeUtc.Ticks
    if ($script:FingerprintCache.ContainsKey($key)) { return $script:FingerprintCache[$key] }

    $chunk = [long]$script:FingerprintChunk
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $stream = [System.IO.File]::Open($File.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share)
    try {
        $length = $stream.Length
        $buffer = New-Object System.IO.MemoryStream
        $lenBytes = [BitConverter]::GetBytes([long]$length)
        $buffer.Write($lenBytes, 0, $lenBytes.Length)
        Copy-StreamRange $stream $buffer 0 ([Math]::Min($length, $chunk))
        if ($length -gt $chunk) {
            $tailStart = [Math]::Max($chunk, $length - $chunk)
            Copy-StreamRange $stream $buffer $tailStart ($length - $tailStart)
        }
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try { $hash = $sha.ComputeHash($buffer.ToArray()) } finally { $sha.Dispose() }
    } finally {
        $stream.Dispose()
    }
    $fp = ([BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    if ($script:FingerprintCache.Count -gt 5000) { $script:FingerprintCache.Clear() }
    $script:FingerprintCache[$key] = $fp
    return $fp
}

# Prüft, ob die Datei wirklich wie ein Video anfängt und nicht nur so heißt.
# Eine leere oder zufällige Datei "clip.mp4" zählt damit nicht.
function Test-VideoHeader {
    param([System.IO.FileInfo]$File)
    $ext = $File.Extension.ToLowerInvariant()
    $head = New-Object byte[] 12
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $stream = [System.IO.File]::Open($File.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share)
    try { $n = $stream.Read($head, 0, 12) } finally { $stream.Dispose() }
    if ($n -lt 12) { return $false }
    $ascii = [System.Text.Encoding]::ASCII
    if (@('.mp4', '.mov', '.m4v', '.3gp') -contains $ext) {
        return (@('ftyp', 'moov', 'mdat', 'free', 'wide', 'skip', 'pnot') -contains $ascii.GetString($head, 4, 4))
    }
    if (@('.mkv', '.webm') -contains $ext) {
        return ($head[0] -eq 0x1A -and $head[1] -eq 0x45 -and $head[2] -eq 0xDF -and $head[3] -eq 0xA3)
    }
    if ($ext -eq '.avi') {
        return ($ascii.GetString($head, 0, 4) -eq 'RIFF' -and $ascii.GetString($head, 8, 4) -eq 'AVI ')
    }
    return $true   # andere Endungen lassen sich nicht prüfen
}

function Get-UnlockProgress {
    param($Config, $State, [datetime]$UtcNow = [datetime]::UtcNow)

    $day = Get-DayWindow $Config $UtcNow
    $tz = $Config.TimeZone
    $entries = New-Object System.Collections.Generic.List[object]
    $problems = New-Object System.Collections.Generic.List[string]
    $counted = New-Object System.Collections.Generic.List[string]
    $firstByFingerprint = @{}
    $hashed = 0

    $candidates = New-Object System.Collections.Generic.List[System.IO.FileInfo]
    foreach ($folder in $Config.Folders) {
        if (-not [System.IO.Directory]::Exists($folder)) {
            $problems.Add("Ordner nicht gefunden: $folder")
            continue
        }
        foreach ($f in (Get-ClipCandidates $folder $Config.Recursive $Config.Extensions)) {
            if ($f.LastWriteTimeUtc -ge $day.StartUtc -or $f.CreationTimeUtc -ge $day.StartUtc) { $candidates.Add($f) }
        }
    }

    # Älteste zuerst: bei Kopien zählt das Original
    $sorted = @($candidates | Sort-Object -Property { $_.LastWriteTimeUtc }, { $_.CreationTimeUtc }, { $_.FullName })
    foreach ($f in $sorted) {
        $reason = ''
        $fp = ''
        $written = [System.TimeZoneInfo]::ConvertTimeFromUtc($f.LastWriteTimeUtc, $tz)
        $created = [System.TimeZoneInfo]::ConvertTimeFromUtc($f.CreationTimeUtc, $tz)

        if ($f.LastWriteTimeUtc -lt $day.StartUtc) {
            $reason = 'aufgenommen am {0} - zählt nicht für heute' -f $written.ToString('dd.MM. HH:mm')
        } elseif ($f.CreationTimeUtc -lt $day.StartUtc) {
            $reason = 'ältere Datei (angelegt am {0}), heute nur verändert' -f $created.ToString('dd.MM.')
        } elseif ($f.LastWriteTimeUtc -gt $UtcNow.AddMinutes(10)) {
            $reason = 'Zeitstempel liegt in der Zukunft'
        } elseif ($f.Length -lt $Config.MinSizeBytes) {
            $reason = 'zu klein ({0} MB, mindestens {1} MB)' -f ($f.Length / 1MB).ToString('N1', $script:German), $Config.MinSizeMb.ToString('N1', $script:German)
        } elseif ($hashed -ge $script:MaxFilesToHash) {
            $reason = 'nicht geprüft (zu viele Dateien im Ordner)'
        } else {
            $hashed++
            try {
                if (Test-VideoHeader $f) {
                    $fp = Get-FileFingerprint $f
                } else {
                    $reason = 'keine echte Videodatei (der Inhalt passt nicht zu {0})' -f $f.Extension
                }
            } catch {
                $reason = 'nicht lesbar (wird vielleicht noch aufgenommen)'
            }
            if (-not $reason) {
                $usedOn = ''
                if ($State.Used.ContainsKey($fp)) { $usedOn = [string]$State.Used[$fp] }
                if ($Config.NoReuse -and $usedOn -and $usedOn -ne $day.Key) {
                    $reason = 'wurde schon am {0} für eine Freischaltung benutzt' -f (Format-DayKey $usedOn)
                } elseif ($firstByFingerprint.ContainsKey($fp)) {
                    $reason = 'gleicher Inhalt wie {0}' -f $firstByFingerprint[$fp]
                } else {
                    $firstByFingerprint[$fp] = $f.Name
                    $counted.Add($fp)
                }
            }
        }

        $entries.Add([pscustomobject]@{
                Name        = $f.Name
                Path        = $f.FullName
                SizeMB      = [Math]::Round($f.Length / 1MB, 1)
                Time        = $written.ToString('HH:mm')
                Counts      = (-not $reason)
                Reason      = $reason
                Fingerprint = $fp
            })
    }

    return [pscustomobject]@{
        DayKey       = $day.Key
        DayStart     = $day.StartLocal
        DayEnd       = $day.EndLocal
        Count        = $counted.Count
        Required     = $Config.MinCount
        Met          = ($counted.Count -ge $Config.MinCount)
        Files        = $entries.ToArray()
        Fingerprints = $counted.ToArray()
        Problems     = $problems.ToArray()
    }
}

# ---------------------------------------------------------------------------
# Programme sperren
# ---------------------------------------------------------------------------

function Get-BlockReason {
    param($Config, [string[]]$Names, [string]$Path)
    foreach ($n in $Names) {
        $b = Get-ExeBase $n
        if ($b -and ($Config.BlockNames -contains $b)) { return "Programm $b" }
    }
    foreach ($prefix in $Config.BlockPaths) {
        if (Test-PathUnder $Path $prefix) { return "Ordner $prefix" }
    }
    return ''
}

function Get-ProcessPathFallback {
    param([int]$ProcessId)
    if (-not $script:IsWindowsOs) { return $null }
    try {
        return (Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction Stop).ExecutablePath
    } catch {
        return $null
    }
}

function Get-ProcessVerdict {
    param($Config, $Process, $Previous)
    $tries = 1
    if ($null -ne $Previous) { $tries = $Previous.Tries + 1 }
    $name = $Process.ProcessName
    $verdict = [pscustomobject]@{ Exe = $name; Reason = ''; Final = $true; Tries = $tries; KillFailed = $false }
    $isSystemName = ($script:ProtectedNames -contains (Get-ExeBase $name))

    $path = $null
    try { $path = $Process.Path } catch { }
    if (-not $path) { $path = Get-ProcessPathFallback $Process.Id }
    if ($path) { $verdict.Exe = [System.IO.Path]::GetFileName($path) }

    # Echte Windows-Prozesse nie anfassen. Ein Spiel, das nur in "explorer.exe" umbenannt
    # wurde, liegt aber nicht im Windows-Ordner und wird ganz normal geprüft.
    if ($isSystemName) {
        if (-not $path) {
            $verdict.Final = ($tries -ge 5)
            return $verdict
        }
        if ($env:SystemRoot -and (Test-PathUnder $path $env:SystemRoot)) { return $verdict }
    }

    # Umbenannte Programme verraten sich über den eingebauten Originalnamen
    $original = ''
    if ($path) {
        try { $original = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($path).OriginalFilename } catch { }
    }
    $verdict.Reason = Get-BlockReason $Config @($name, $path, $original) $path
    # Ohne Pfad noch ein paar Mal nachsehen: frisch gestartete Prozesse geben ihn manchmal erst später her
    $verdict.Final = ([bool]$path -or [bool]$verdict.Reason -or $tries -ge 5)
    return $verdict
}

function Invoke-Enforcement {
    param($Config, [hashtable]$Cache)
    $killed = New-Object System.Collections.Generic.List[object]
    $alive = @{}
    foreach ($p in @(Get-Process)) {
        $id = $p.Id
        if ($id -le 4 -or $id -eq $PID) { continue }
        $startTicks = 0L
        try { $startTicks = $p.StartTime.Ticks } catch { }
        $key = '{0}|{1}|{2}' -f $id, $p.ProcessName, $startTicks
        $alive[$key] = $true

        $entry = $Cache[$key]
        if ($null -eq $entry -or -not $entry.Final) {
            $entry = Get-ProcessVerdict $Config $p $entry
            $Cache[$key] = $entry
        }
        if (-not $entry.Reason) { continue }

        try {
            Stop-Process -Id $id -Force -ErrorAction Stop
            $killed.Add([pscustomobject]@{ Exe = $entry.Exe; Id = $id; Reason = $entry.Reason })
        } catch {
            if (-not $entry.KillFailed) {
                $entry.KillFailed = $true
                Write-FocusLog ('Konnte {0} (PID {1}) nicht beenden: {2}' -f $entry.Exe, $id, $_.Exception.Message)
            }
        }
    }
    foreach ($k in @($Cache.Keys)) {
        if (-not $alive.ContainsKey($k)) { $Cache.Remove($k) }
    }
    return , $killed.ToArray()
}

# ---------------------------------------------------------------------------
# Wächter
# ---------------------------------------------------------------------------

function New-WatcherContext {
    param($Paths)
    return @{
        Paths        = $Paths
        Config       = $null
        ConfigStamp  = $null
        ConfigError  = ''
        State        = (Read-FocusLockState $Paths.State)
        ProcCache    = @{}
        LastCheckUtc = [datetime]::MinValue
        Progress     = $null
        CheckError   = ''
        LastBlock    = $null
    }
}

function Update-WatcherConfig {
    param([hashtable]$Ctx)
    $stamp = 'fehlt'
    try {
        $info = New-Object System.IO.FileInfo($Ctx.Paths.Config)
        if ($info.Exists) { $stamp = '{0}|{1}' -f $info.LastWriteTimeUtc.Ticks, $info.Length }
    } catch { }
    if ($stamp -eq $Ctx.ConfigStamp) { return }
    $Ctx.ConfigStamp = $stamp
    try {
        $Ctx.Config = Read-FocusLockConfig $Ctx.Paths.Config
        $Ctx.ConfigError = ''
        $Ctx.ProcCache.Clear()
        $Ctx.LastCheckUtc = [datetime]::MinValue
        $what = @($Ctx.Config.BlockLabels) + @($Ctx.Config.BlockPaths)
        Write-FocusLog ('Konfiguration geladen. Gesperrt: {0}. Freischalten ab {1} Clips.' -f ($what -join ', '), $Ctx.Config.MinCount)
    } catch {
        # Die bisherige Konfiguration bleibt aktiv - ein kaputtes config.json hebt die Sperre nicht auf.
        $Ctx.ConfigError = $_.Exception.Message
        Write-FocusLog "Konfiguration fehlerhaft, die bisherige bleibt aktiv: $($Ctx.ConfigError)"
    }
}

function Invoke-Unlock {
    param([hashtable]$Ctx, $Progress, [datetime]$UtcNow)
    $state = $Ctx.State
    $state.UnlockedDay = $Progress.DayKey
    $state.UnlockedAt = $UtcNow.ToString('o')
    foreach ($fp in $Progress.Fingerprints) { $state.Used[$fp] = $Progress.DayKey }
    Save-FocusLockState $Ctx.Paths.State $state $UtcNow
    $names = @($Progress.Files | Where-Object { $_.Counts } | ForEach-Object { $_.Name })
    Write-FocusLog ('FREIGESCHALTET für {0}: {1} von {2} Clips ({3}).' -f $Progress.DayKey, $Progress.Count, $Progress.Required, ($names -join ', '))
}

function Write-WatcherStatus {
    param([hashtable]$Ctx, [datetime]$UtcNow, [bool]$Unlocked, $Day)
    $cfg = $Ctx.Config
    $p = $Ctx.Progress
    $errors = @(@($Ctx.ConfigError, $Ctx.CheckError) | Where-Object { $_ })
    $status = [ordered]@{
        updated_unix = ConvertTo-UnixSeconds $UtcNow
        enabled      = ($null -ne $cfg -and $cfg.Enabled)
        unlocked     = $Unlocked
        day          = ''
        day_end      = ''
        count        = -1
        required     = -1
        problems     = @()
        error        = ($errors -join ' | ')
        last_block   = $Ctx.LastBlock
    }
    if ($null -ne $Day) {
        $status.day = $Day.Key
        $status.day_end = $Day.EndLocal.ToString('ddd dd.MM. HH:mm', $script:German)
    }
    if ($null -ne $p) {
        $status.count = $p.Count
        $status.required = $p.Required
        $status.problems = @($p.Problems)
    }
    try { Write-JsonFile $Ctx.Paths.Status $status } catch { Write-FocusLog "status.json nicht schreibbar: $($_.Exception.Message)" }
}

function Invoke-WatcherTick {
    param([hashtable]$Ctx, [datetime]$UtcNow = [datetime]::UtcNow)

    Update-WatcherConfig $Ctx
    $cfg = $Ctx.Config
    if ($null -eq $cfg) {
        if (($UtcNow - $Ctx.LastCheckUtc).TotalSeconds -ge 30) {
            $Ctx.LastCheckUtc = $UtcNow
            Write-WatcherStatus $Ctx $UtcNow $false $null
        }
        return
    }

    $day = Get-DayWindow $cfg $UtcNow
    $unlocked = ($Ctx.State.UnlockedDay -eq $day.Key)
    $dirty = $false

    # 1) Durchsetzen - immer zuerst, damit eine hängende Prüfung die Sperre nicht aufhebt
    if ($cfg.Enabled -and -not $unlocked) {
        $killed = @()
        try {
            $killed = Invoke-Enforcement $cfg $Ctx.ProcCache
        } catch {
            Write-FocusLog "Fehler beim Prüfen der Prozesse: $($_.Exception.Message)"
        }
        if ($killed.Count -gt 0) {
            foreach ($k in $killed) { Write-FocusLog ('Gesperrt: {0} (PID {1}) - {2}' -f $k.Exe, $k.Id, $k.Reason) }
            $Ctx.LastBlock = [ordered]@{
                id        = [string]$UtcNow.Ticks
                time_unix = ConvertTo-UnixSeconds $UtcNow
                process   = $killed[0].Exe
                reason    = $killed[0].Reason
            }
            $dirty = $true
            # Vielleicht sind die Clips gerade fertig geworden: gleich nachsehen
            if (($UtcNow - $Ctx.LastCheckUtc).TotalSeconds -ge 5) { $Ctx.LastCheckUtc = [datetime]::MinValue }
        }
    }

    # 2) Bedingung prüfen
    if (($UtcNow - $Ctx.LastCheckUtc).TotalSeconds -ge $cfg.CheckSeconds) {
        $Ctx.LastCheckUtc = $UtcNow
        try {
            $progress = Get-UnlockProgress $cfg $Ctx.State $UtcNow
            $Ctx.Progress = $progress
            $Ctx.CheckError = ''
            if ($cfg.Enabled -and -not $unlocked -and $progress.Met) {
                Invoke-Unlock $Ctx $progress $UtcNow
                $unlocked = $true
            }
        } catch {
            $Ctx.CheckError = $_.Exception.Message
            Write-FocusLog "Fehler bei der Prüfung: $($Ctx.CheckError)"
        }
        $dirty = $true
    }

    if ($dirty) { Write-WatcherStatus $Ctx $UtcNow $unlocked $day }
}

function Start-Watcher {
    param($Paths)
    $script:LogPath = $Paths.Log
    Write-FocusLog ('Wächter gestartet (PID {0}, Konto {1}).' -f $PID, [Environment]::UserName)
    $ctx = New-WatcherContext $Paths
    while ($true) {
        try {
            Invoke-WatcherTick $ctx
        } catch {
            Write-FocusLog "Unerwarteter Fehler: $($_.Exception.Message)"
        }
        $seconds = 2.0
        if ($null -ne $ctx.Config) { $seconds = $ctx.Config.PollSeconds }
        Start-Sleep -Milliseconds ([int]($seconds * 1000))
    }
}

# ---------------------------------------------------------------------------
# Status-Anzeige für den Benutzer
# ---------------------------------------------------------------------------

function Show-FocusLockStatus {
    param($Paths)
    Write-Host ''
    Write-Host '  FocusLock' -ForegroundColor Cyan
    Write-Host '  =========' -ForegroundColor Cyan
    try {
        $cfg = Read-FocusLockConfig $Paths.Config
    } catch {
        Write-Host "  Konfiguration kann nicht gelesen werden: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    $state = Read-FocusLockState $Paths.State
    $progress = Get-UnlockProgress $cfg $state
    $unlocked = ($state.UnlockedDay -eq $progress.DayKey)
    $dayEnd = $progress.DayEnd.ToString('dddd, HH:mm', $script:German)

    Write-Host ('  Heute: {0}  (der Tag endet {1} Uhr)' -f $progress.DayStart.ToString('dddd, dd.MM.yyyy', $script:German), $dayEnd)
    Write-Host ''
    if (-not $cfg.Enabled) {
        Write-Host '  Die Sperre ist in der Konfiguration ausgeschaltet.' -ForegroundColor Yellow
    } elseif ($unlocked) {
        Write-Host ('  FREIGESCHALTET bis {0} Uhr. Viel Spaß!' -f $dayEnd) -ForegroundColor Green
    } else {
        $missing = [Math]::Max(0, $progress.Required - $progress.Count)
        if ($progress.Met) {
            Write-Host ('  {0} von {1} Clips - Bedingung erfüllt! Die Freischaltung kommt in wenigen Sekunden.' -f $progress.Count, $progress.Required) -ForegroundColor Green
        } else {
            Write-Host ('  GESPERRT - {0} von {1} Clips geschafft, es fehlen noch {2}.' -f $progress.Count, $progress.Required, $missing) -ForegroundColor Red
        }
    }

    Write-Host ''
    $ext = 'alle Dateien'
    if ($cfg.Extensions.Count -gt 0) { $ext = $cfg.Extensions -join ' ' }
    Write-Host ('  Es zählen: {0}, mindestens {1} MB, heute aufgenommen, in:' -f $ext, $cfg.MinSizeMb.ToString('N1', $script:German)) -ForegroundColor Gray
    foreach ($f in $cfg.Folders) { Write-Host "    $f" -ForegroundColor Gray }
    foreach ($problem in $progress.Problems) { Write-Host "  ! $problem" -ForegroundColor Yellow }
    Write-Host ''

    if ($progress.Files.Count -eq 0) {
        Write-Host '  Noch keine Clips von heute gefunden.' -ForegroundColor DarkGray
    }
    foreach ($e in $progress.Files) {
        $line = '{0,-40} {1,5}  {2,8} MB' -f $e.Name, $e.Time, $e.SizeMB.ToString('N1', $script:German)
        if ($e.Counts) {
            Write-Host "  [OK] $line" -ForegroundColor Green
        } else {
            Write-Host "  [--] $line  $($e.Reason)" -ForegroundColor DarkYellow
        }
    }

    Write-Host ''
    $blocked = @($cfg.BlockLabels) + @($cfg.BlockPaths | ForEach-Object { "alles in $_" })
    Write-Host ('  Gesperrt bis dahin: {0}' -f ($blocked -join ', ')) -ForegroundColor Gray

    # Läuft der Wächter überhaupt?
    $alive = $false
    try {
        $s = Read-JsonFile $Paths.Status
        $age = (ConvertTo-UnixSeconds ([datetime]::UtcNow)) - [long]$s.updated_unix
        $alive = ($age -lt [Math]::Max(120, 3 * $cfg.CheckSeconds))
        if ($s.error) { Write-Host "  ! Wächter meldet: $($s.error)" -ForegroundColor Yellow }
    } catch { }
    if (-not $alive) {
        Write-Host '  ! Der Wächter scheint gerade nicht zu laufen (neu starten hilft meistens).' -ForegroundColor Yellow
    }
    Write-Host ''
}

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------

if ($Mode -eq 'Library') { return }

$focusLockPaths = Get-FocusLockPaths $DataDir
switch ($Mode) {
    'Run' {
        Start-Watcher $focusLockPaths
    }
    'Status' {
        Show-FocusLockStatus $focusLockPaths
        if ($Pause) { [void](Read-Host '  Enter drücken zum Schließen') }
    }
    'Check' {
        $cfg = Read-FocusLockConfig $focusLockPaths.Config
        $state = Read-FocusLockState $focusLockPaths.State
        $progress = Get-UnlockProgress $cfg $state
        $progress | Add-Member -NotePropertyName Unlocked -NotePropertyValue ($state.UnlockedDay -eq $progress.DayKey)
        ConvertTo-Json -InputObject $progress -Depth 5
    }
}
