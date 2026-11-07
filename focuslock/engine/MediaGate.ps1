#Requires -Version 5.1
<#
.SYNOPSIS
    Mess-Kern von FocusLock: zaehlt die heutige Arbeit und sagt, ob die Tagesbedingung erfuellt ist.

.DESCRIPTION
    Reine Logik, kein Sperren, kein Windows-Dienst. Der Dienst benutzt diese Funktionen spaeter.
    Punkte-Modell:
      - Clip      (Ordner F:\work\Clips\fertig):   Video unter 2 Minuten = 1 Punkt
      - Long-form (Ordner E:\kittn\youtube\fertig): Video + PNG-Thumbnail  = 3 Punkte
    Ein Long-form-Video muss NICHT fertig gerendert sein: es zaehlt ueber (Video heute + PNG heute),
    nicht ueber die fertige Dauer. Das Thumbnail ist der Beweis fuer echte Arbeit.
    Thumbnail-Paarung nach Anzahl: heutige Videos und heutige PNGs werden 1:1 gepaart, Namen egal.

    Gegen Schummeln:
      - zaehlt nur, was HEUTE angelegt UND zuletzt geschrieben wurde (eine Kopie alter Clips behaelt
        ihr altes Schreibdatum und faellt durch)
      - Dateikopf muss zu einem echten Video bzw. PNG passen (leere/zufaellige Datei zaehlt nicht)
      - Kopien werden am Fingerabdruck erkannt
      - no_reuse: ein schon einmal angerechneter Clip/Video zaehlt nicht nochmal (Fingerabdruck in state)
#>

$script:German = [System.Globalization.CultureInfo]::GetCultureInfo('de-DE')
$script:FingerprintCache = @{}
$script:FingerprintChunk = 1MB
$script:IsWindowsOs = ([Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT)

# Unter Windows sind / und \ beides erlaubt; sonst (Test unter Linux) den Pfad so lassen.
function ConvertTo-NativePath {
    param([string]$Path)
    if ($script:IsWindowsOs) { return $Path.Replace('/', '\') }
    return $Path
}

# ---------------------------------------------------------------------------
# kleine Helfer
# ---------------------------------------------------------------------------

function Get-JsonValue {
    param($Object, [string]$Name, $Default)
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop -or $null -eq $prop.Value) { return $Default }
    return $prop.Value
}

function ConvertTo-ExtList {
    param($Value)
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($item in @($Value)) {
        if ($null -eq $item) { continue }
        $x = ([string]$item).Trim().ToLowerInvariant()
        if (-not $x) { continue }
        if (-not $x.StartsWith('.')) { $x = '.' + $x }
        $list.Add($x)
    }
    return , $list.ToArray()
}

function Format-Seconds {
    param($Seconds)
    if ($null -eq $Seconds) { return '--:--' }
    $t = [TimeSpan]::FromSeconds([double]$Seconds)
    return '{0:0}:{1:00}' -f [Math]::Floor($t.TotalMinutes), $t.Seconds
}

function Format-DayKey {
    param([string]$Key)
    $d = [datetime]::MinValue
    if ([datetime]::TryParseExact($Key, 'yyyy-MM-dd', [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::None, [ref]$d)) {
        return $d.ToString('dd.MM.yyyy')
    }
    return $Key
}

# ---------------------------------------------------------------------------
# Big-Endian-Zahlen und MP4-Dauer (ohne externe Programme wie ffprobe)
# ---------------------------------------------------------------------------

function Read-BeInt {
    param([byte[]]$Bytes, [int]$Offset, [int]$Count)
    [long]$v = 0
    for ($i = 0; $i -lt $Count; $i++) { $v = ($v -shl 8) -bor [long]$Bytes[$Offset + $i] }
    return $v
}

# Liest die Spieldauer aus dem moov/mvhd-Atom einer MP4-/MOV-Datei.
# $null, wenn die Datei (noch) kein moov hat - z.B. waehrend ein Video rendert.
function Get-VideoDurationSeconds {
    param([System.IO.FileInfo]$File)
    $ext = $File.Extension.ToLowerInvariant()
    if (@('.mp4', '.mov', '.m4v', '.3gp') -notcontains $ext) { return $null }
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $fs = $null
    try { $fs = [System.IO.File]::Open($File.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share) }
    catch { return $null }
    try {
        $moov = Find-Mp4Box $fs 0 $fs.Length 'moov'
        if ($null -eq $moov) { return $null }
        $mvhd = Find-Mp4Box $fs $moov.ContentStart $moov.End 'mvhd'
        if ($null -eq $mvhd) { return $null }
        return Read-MvhdDuration $fs $mvhd.ContentStart $mvhd.End
    } catch { return $null } finally { $fs.Dispose() }
}

# Sucht eine Box eines Typs im Bereich [Start,End) und gibt ihre Grenzen zurueck.
function Find-Mp4Box {
    param([System.IO.Stream]$Stream, [long]$Start, [long]$End, [string]$Type)
    $pos = $Start
    $guard = 0
    while ($pos + 8 -le $End) {
        if (++$guard -gt 100000) { break }
        $hdr = New-Object byte[] 8
        $Stream.Position = $pos
        if ($Stream.Read($hdr, 0, 8) -lt 8) { break }
        [long]$size = Read-BeInt $hdr 0 4
        $t = [System.Text.Encoding]::ASCII.GetString($hdr, 4, 4)
        $headerSize = 8
        if ($size -eq 1) {
            $big = New-Object byte[] 8
            if ($Stream.Read($big, 0, 8) -lt 8) { break }
            $size = Read-BeInt $big 0 8
            $headerSize = 16
        } elseif ($size -eq 0) {
            $size = $End - $pos
        }
        if ($size -lt $headerSize -or ($pos + $size) -gt $End) { break }
        if ($t -eq $Type) {
            return [pscustomobject]@{ ContentStart = $pos + $headerSize; End = $pos + $size }
        }
        $pos += $size
    }
    return $null
}

function Read-MvhdDuration {
    param([System.IO.Stream]$Stream, [long]$Start, [long]$End)
    $Stream.Position = $Start
    $ver = New-Object byte[] 1
    if ($Stream.Read($ver, 0, 1) -lt 1) { return $null }
    if ($ver[0] -eq 1) {
        $buf = New-Object byte[] 27    # 3 flags + 8 create + 8 mod + 4 timescale + 8 duration = 31, ab hier 27 nach Version
        if (($Start + 1 + 27) -gt $End) { return $null }
        $Stream.Position = $Start + 4  # Version+Flags ueberspringen
        $b = New-Object byte[] 20
        if ($Stream.Read($b, 0, 20) -lt 20) { return $null }
        $timescale = Read-BeInt $b 16 4
        $db = New-Object byte[] 8
        if ($Stream.Read($db, 0, 8) -lt 8) { return $null }
        $duration = Read-BeInt $db 0 8
    } else {
        $Stream.Position = $Start + 4
        $b = New-Object byte[] 16
        if ($Stream.Read($b, 0, 16) -lt 16) { return $null }
        $timescale = Read-BeInt $b 8 4
        $duration = Read-BeInt $b 12 4
    }
    if ($timescale -le 0 -or $duration -lt 0) { return $null }
    return [double]$duration / [double]$timescale
}

# ---------------------------------------------------------------------------
# Dateikopf-Pruefungen: ist das wirklich ein Video / ein PNG?
# ---------------------------------------------------------------------------

function Test-VideoHeader {
    param([System.IO.FileInfo]$File)
    $ext = $File.Extension.ToLowerInvariant()
    $head = New-Object byte[] 12
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $fs = [System.IO.File]::Open($File.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share)
    try { $n = $fs.Read($head, 0, 12) } finally { $fs.Dispose() }
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
    return $true
}

function Test-PngHeader {
    param([System.IO.FileInfo]$File)
    $head = New-Object byte[] 8
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $fs = [System.IO.File]::Open($File.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $share)
    try { $n = $fs.Read($head, 0, 8) } finally { $fs.Dispose() }
    if ($n -lt 8) { return $false }
    $sig = @(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
    for ($i = 0; $i -lt 8; $i++) { if ($head[$i] -ne $sig[$i]) { return $false } }
    return $true
}

# ---------------------------------------------------------------------------
# Fingerabdruck (Groesse + erstes und letztes MB) - erkennt Kopien und benutzte Dateien
# ---------------------------------------------------------------------------

function Copy-StreamRange {
    param([System.IO.Stream]$Source, [System.IO.Stream]$Target, [long]$Offset, [long]$Count)
    $Source.Position = $Offset
    $buf = New-Object byte[] 65536
    $left = $Count
    while ($left -gt 0) {
        $read = $Source.Read($buf, 0, [int][Math]::Min([long]$buf.Length, $left))
        if ($read -le 0) { break }
        $Target.Write($buf, 0, $read)
        $left -= $read
    }
}

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
    } finally { $stream.Dispose() }
    $fp = ([BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    if ($script:FingerprintCache.Count -gt 5000) { $script:FingerprintCache.Clear() }
    $script:FingerprintCache[$key] = $fp
    return $fp
}

# ---------------------------------------------------------------------------
# Tagesfenster (Tag beginnt um day_reset_hour, Standard 04:00)
# ---------------------------------------------------------------------------

function ConvertTo-UtcSafe {
    param([datetime]$Local, [System.TimeZoneInfo]$Zone)
    $t = [datetime]::SpecifyKind($Local, [System.DateTimeKind]::Unspecified)
    while ($Zone.IsInvalidTime($t)) { $t = $t.AddMinutes(30) }
    return [System.TimeZoneInfo]::ConvertTimeToUtc($t, $Zone)
}

function Get-DayWindow {
    param($Config, [datetime]$UtcNow)
    $tz = $Config.TimeZone
    $local = [System.TimeZoneInfo]::ConvertTimeFromUtc([datetime]::SpecifyKind($UtcNow, [System.DateTimeKind]::Utc), $tz)
    $start = [datetime]::SpecifyKind($local.Date.AddHours($Config.DayResetHour), [System.DateTimeKind]::Unspecified)
    if ($local -lt $start) { $start = $start.AddDays(-1) }
    return [pscustomobject]@{
        Key        = $start.ToString('yyyy-MM-dd')
        StartLocal = $start
        EndLocal   = $start.AddDays(1)
        StartUtc   = ConvertTo-UtcSafe $start $tz
    }
}

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------

function Read-MediaGateConfig {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not [System.IO.File]::Exists($Path)) { throw "Konfiguration nicht gefunden: $Path" }
    try { $j = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json }
    catch { throw ("gate.json ist kein gueltiges JSON: {0}" -f $_.Exception.Message) }
    return ConvertTo-MediaGateConfig $j
}

function ConvertTo-MediaGateConfig {
    param($Json)
    $tzId = [string](Get-JsonValue $Json 'time_zone' '')
    $tz = [System.TimeZoneInfo]::Local
    if ($tzId) {
        try { $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById($tzId) }
        catch { throw "gate.json: Zeitzone '$tzId' ist unbekannt (fuer Deutschland: 'W. Europe Standard Time')." }
    }
    $resetHour = [int](Get-JsonValue $Json 'day_reset_hour' 4)
    if ($resetHour -lt 0 -or $resetHour -gt 23) { throw "gate.json: 'day_reset_hour' muss zwischen 0 und 23 liegen." }
    $target = [int](Get-JsonValue $Json 'target_points' 5)
    if ($target -lt 1) { throw "gate.json: 'target_points' muss mindestens 1 sein." }

    $sources = New-Object System.Collections.Generic.List[object]
    foreach ($s in @(Get-JsonValue $Json 'sources' @())) {
        $kind = ([string](Get-JsonValue $s 'kind' '')).ToLowerInvariant()
        if ($kind -ne 'clip' -and $kind -ne 'longform') { throw "gate.json: 'kind' muss 'clip' oder 'longform' sein." }
        $folder = [string](Get-JsonValue $s 'folder' '')
        if (-not $folder) { throw "gate.json: eine Quelle hat keinen 'folder'." }
        $sources.Add([pscustomobject]@{
                Kind       = $kind
                Folder     = ConvertTo-NativePath $folder
                VideoExt   = (ConvertTo-ExtList (Get-JsonValue $s 'video_ext' @('.mp4', '.mov', '.mkv')))
                ThumbExt   = (ConvertTo-ExtList (Get-JsonValue $s 'thumb_ext' @('.png')))
                MaxSeconds = [double](Get-JsonValue $s 'max_seconds' 120)
                MinSeconds = [double](Get-JsonValue $s 'min_seconds' 300)
                MinSize    = [long]([double](Get-JsonValue $s 'min_size_mb' 1) * 1MB)
                ThumbMin   = [long]([double](Get-JsonValue $s 'thumb_min_kb' 10) * 1KB)
                Points     = [int](Get-JsonValue $s 'points' $(if ($kind -eq 'longform') { 3 } else { 1 }))
            })
    }
    if ($sources.Count -eq 0) { throw "gate.json: keine 'sources' angegeben." }

    return [pscustomobject]@{
        TargetPoints = $target
        DayResetHour = $resetHour
        TimeZone     = $tz
        NoReuse      = [bool](Get-JsonValue $Json 'no_reuse' $true)
        Sources      = $sources.ToArray()
    }
}

# ---------------------------------------------------------------------------
# Bewertung eines Tages
# ---------------------------------------------------------------------------

function Test-CountsAsToday {
    param([System.IO.FileInfo]$File, [datetime]$StartUtc, [datetime]$UtcNow, [System.TimeZoneInfo]$Tz)
    if ($File.LastWriteTimeUtc -lt $StartUtc) {
        $w = [System.TimeZoneInfo]::ConvertTimeFromUtc($File.LastWriteTimeUtc, $Tz)
        return 'nicht von heute (zuletzt {0})' -f $w.ToString('dd.MM. HH:mm')
    }
    if ($File.CreationTimeUtc -lt $StartUtc) { return 'aeltere Datei, heute nur kopiert/verschoben' }
    if ($File.LastWriteTimeUtc -gt $UtcNow.AddMinutes(10)) { return 'Zeitstempel liegt in der Zukunft' }
    return ''
}

function New-GateItem {
    param([System.IO.FileInfo]$File, [string]$Kind, [System.TimeZoneInfo]$Tz)
    $w = [System.TimeZoneInfo]::ConvertTimeFromUtc($File.LastWriteTimeUtc, $Tz)
    return [pscustomobject]@{
        Name        = $File.Name
        Path        = $File.FullName
        Kind        = $Kind
        SizeMB      = [Math]::Round($File.Length / 1MB, 1)
        Time        = $w.ToString('HH:mm')
        Duration    = $null
        Counts      = $false
        Points      = 0
        Reason      = ''
        Fingerprint = ''
    }
}

function Get-DayScore {
    param($Config, $State, [datetime]$UtcNow = [datetime]::UtcNow)

    $day = Get-DayWindow $Config $UtcNow
    $tz = $Config.TimeZone
    $used = $State.Used
    $items = New-Object System.Collections.Generic.List[object]
    $problems = New-Object System.Collections.Generic.List[string]
    $counted = New-Object System.Collections.Generic.List[string]
    $clipPoints = 0
    $longformPoints = 0

    foreach ($src in $Config.Sources) {
        if (-not [System.IO.Directory]::Exists($src.Folder)) {
            $problems.Add("Ordner nicht gefunden: $($src.Folder)")
            continue
        }
        $files = @()
        try { $files = @(Get-ChildItem -LiteralPath $src.Folder -File -ErrorAction Stop) } catch {
            $problems.Add("Ordner nicht lesbar: $($src.Folder)")
            continue
        }

        if ($src.Kind -eq 'clip') {
            $seen = @{}
            foreach ($f in ($files | Sort-Object LastWriteTimeUtc, FullName)) {
                if ($src.VideoExt -notcontains $f.Extension.ToLowerInvariant()) { continue }
                $item = New-GateItem $f 'clip' $tz
                $today = Test-CountsAsToday $f $day.StartUtc $UtcNow $tz
                if ($today) { $item.Reason = $today; $items.Add($item); continue }
                if ($f.Length -lt $src.MinSize) { $item.Reason = 'zu klein'; $items.Add($item); continue }
                if (-not (Test-VideoHeader $f)) { $item.Reason = 'keine echte Videodatei'; $items.Add($item); continue }
                $dur = Get-VideoDurationSeconds $f
                $item.Duration = $dur
                if ($null -eq $dur) { $item.Reason = 'Dauer noch nicht lesbar (rendert noch?)'; $items.Add($item); continue }
                if ($dur -ge $src.MaxSeconds) {
                    $item.Reason = if ($dur -ge 300) { 'laenger als 5 Min - gehoert in den Long-form-Ordner' } else { 'zwischen 2 und 5 Minuten - zaehlt nicht' }
                    $items.Add($item); continue
                }
                $fp = Get-FileFingerprint $f
                $item.Fingerprint = $fp
                $usedOn = if ($used.ContainsKey($fp)) { [string]$used[$fp] } else { '' }
                if ($Config.NoReuse -and $usedOn -and $usedOn -ne $day.Key) {
                    $item.Reason = 'schon am {0} benutzt' -f (Format-DayKey $usedOn)
                } elseif ($seen.ContainsKey($fp)) {
                    $item.Reason = 'gleicher Inhalt wie {0}' -f $seen[$fp]
                } else {
                    $seen[$fp] = $f.Name
                    $item.Counts = $true
                    $item.Points = $src.Points
                    $clipPoints += $src.Points
                    $counted.Add($fp)
                }
                $items.Add($item)
            }
        } else {
            # Long-form: gueltige Videos und PNGs sammeln, dann 1:1 nach Anzahl paaren
            $videoItems = New-Object System.Collections.Generic.List[object]
            $thumbItems = New-Object System.Collections.Generic.List[object]
            $seen = @{}
            foreach ($f in ($files | Sort-Object LastWriteTimeUtc, FullName)) {
                $ext = $f.Extension.ToLowerInvariant()
                $isVideo = ($src.VideoExt -contains $ext)
                $isThumb = ($src.ThumbExt -contains $ext)
                if (-not $isVideo -and -not $isThumb) { continue }
                $item = New-GateItem $f $(if ($isVideo) { 'longform-video' } else { 'thumbnail' }) $tz
                $today = Test-CountsAsToday $f $day.StartUtc $UtcNow $tz
                if ($today) { $item.Reason = $today; $items.Add($item); continue }

                if ($isThumb) {
                    if ($f.Length -lt $src.ThumbMin) { $item.Reason = 'zu klein fuer ein Thumbnail'; $items.Add($item); continue }
                    if (-not (Test-PngHeader $f)) { $item.Reason = 'kein echtes PNG'; $items.Add($item); continue }
                    $fp = Get-FileFingerprint $f
                    $item.Fingerprint = $fp
                    $usedOn = if ($used.ContainsKey($fp)) { [string]$used[$fp] } else { '' }
                    if ($Config.NoReuse -and $usedOn -and $usedOn -ne $day.Key) { $item.Reason = 'Thumbnail schon am {0} benutzt' -f (Format-DayKey $usedOn); $items.Add($item); continue }
                    if ($seen.ContainsKey($fp)) { $item.Reason = 'gleiches Thumbnail wie {0}' -f $seen[$fp]; $items.Add($item); continue }
                    $seen[$fp] = $f.Name
                    $thumbItems.Add($item); $items.Add($item); continue
                }

                # Video
                if ($f.Length -lt $src.MinSize) { $item.Reason = 'zu klein'; $items.Add($item); continue }
                if (-not (Test-VideoHeader $f)) { $item.Reason = 'keine echte Videodatei'; $items.Add($item); continue }
                $dur = Get-VideoDurationSeconds $f
                $item.Duration = $dur
                # Dauer nur pruefen, wenn lesbar. Rendert es noch (Dauer $null), zaehlt es trotzdem.
                if ($null -ne $dur -and $dur -lt $src.MinSeconds) { $item.Reason = 'unter 5 Minuten - kein Long-form'; $items.Add($item); continue }
                $fp = Get-FileFingerprint $f
                $item.Fingerprint = $fp
                $usedOn = if ($used.ContainsKey($fp)) { [string]$used[$fp] } else { '' }
                if ($Config.NoReuse -and $usedOn -and $usedOn -ne $day.Key) { $item.Reason = 'schon am {0} benutzt' -f (Format-DayKey $usedOn); $items.Add($item); continue }
                if ($seen.ContainsKey($fp)) { $item.Reason = 'gleiches Video wie {0}' -f $seen[$fp]; $items.Add($item); continue }
                $seen[$fp] = $f.Name
                $videoItems.Add($item); $items.Add($item)
            }

            $bundles = [Math]::Min($videoItems.Count, $thumbItems.Count)
            for ($i = 0; $i -lt $videoItems.Count; $i++) {
                if ($i -lt $bundles) {
                    $videoItems[$i].Counts = $true
                    $videoItems[$i].Points = $src.Points
                    $longformPoints += $src.Points
                    $counted.Add($videoItems[$i].Fingerprint)
                } else {
                    $videoItems[$i].Reason = 'kein Partner - es fehlt ein Thumbnail (PNG)'
                }
            }
            for ($i = 0; $i -lt $thumbItems.Count; $i++) {
                if ($i -lt $bundles) {
                    $thumbItems[$i].Counts = $true
                    $counted.Add($thumbItems[$i].Fingerprint)
                } else {
                    $thumbItems[$i].Reason = 'kein Partner - es fehlt ein Video'
                }
            }
        }
    }

    foreach ($it in $items) {
        if ($it.Duration -ne $null) { $it.Duration = Format-Seconds $it.Duration }
    }

    $points = $clipPoints + $longformPoints
    return [pscustomobject]@{
        DayKey         = $day.Key
        DayStart       = $day.StartLocal
        DayEnd         = $day.EndLocal
        Points         = $points
        ClipPoints     = $clipPoints
        LongformPoints = $longformPoints
        Target         = $Config.TargetPoints
        Met            = ($points -ge $Config.TargetPoints)
        Items          = $items.ToArray()
        Fingerprints   = $counted.ToArray()
        Problems       = $problems.ToArray()
    }
}
