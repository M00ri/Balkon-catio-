#Requires -Version 5.1
<#
    Tests fuer den Mess-Kern (engine/MediaGate.ps1). Laeuft ohne Zusatzmodule:
        pwsh -NoProfile -File tests/MediaGate.Tests.ps1
    Erzeugt echte kleine MP4-/PNG-Dateien (gueltige Dateikoepfe, echte MP4-Dauer),
    auch ein "noch renderndes" Video ohne moov-Atom.
#>
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectDir = Split-Path -Parent $PSScriptRoot
. (Join-Path $projectDir 'engine/MediaGate.ps1')

$script:Passed = 0
$script:Failed = 0
function Assert-True { param($Condition, [string]$Message)
    if ($Condition) { $script:Passed++; Write-Host "  ok    $Message" -ForegroundColor Green }
    else { $script:Failed++; Write-Host "  FEHLER $Message" -ForegroundColor Red }
}
function Assert-Equal { param($Expected, $Actual, [string]$Message)
    Assert-True ($Expected -eq $Actual) ("{0} (erwartet: {1}, ist: {2})" -f $Message, $Expected, $Actual)
}

# --- kleine Datei-Bauer -----------------------------------------------------
function Get-Be32 { param([long]$N)
    return [byte[]]@([byte](($N -shr 24) -band 0xFF), [byte](($N -shr 16) -band 0xFF), [byte](($N -shr 8) -band 0xFF), [byte]($N -band 0xFF))
}
function Join-Bytes { param([byte[][]]$Parts)
    $ms = New-Object System.IO.MemoryStream
    foreach ($p in $Parts) { $ms.Write($p, 0, $p.Length) }
    return $ms.ToArray()
}
function New-Box { param([string]$Type, [byte[]]$Content)
    return Join-Bytes @((Get-Be32 (8 + $Content.Length)), [System.Text.Encoding]::ASCII.GetBytes($Type), $Content)
}
function New-Filler { param([int]$Bytes, [int]$Seed = 0)
    $b = New-Object byte[] $Bytes
    (New-Object System.Random($Seed)).NextBytes($b)
    return $b
}
$script:seed = 1
function New-Mp4 {
    param([string]$Path, [int]$Seconds, [switch]$InProgress, [int]$FillKb = 40, [byte[]]$Filler = $null)
    $ftyp = New-Box 'ftyp' (Join-Bytes @([System.Text.Encoding]::ASCII.GetBytes('isom'), (Get-Be32 0), [System.Text.Encoding]::ASCII.GetBytes('isom')))
    if ($null -eq $Filler) { $Filler = New-Filler ($FillKb * 1024) ($script:seed++) }
    $mdat = New-Box 'mdat' $Filler
    if ($InProgress) {
        [System.IO.File]::WriteAllBytes($Path, (Join-Bytes @($ftyp, $mdat)))   # kein moov -> Dauer nicht lesbar
    } else {
        $mvhd = New-Box 'mvhd' (Join-Bytes @([byte[]]@(0, 0, 0, 0), [byte[]]@(0, 0, 0, 0), [byte[]]@(0, 0, 0, 0), (Get-Be32 1000), (Get-Be32 ([long]$Seconds * 1000))))
        $moov = New-Box 'moov' $mvhd
        [System.IO.File]::WriteAllBytes($Path, (Join-Bytes @($ftyp, $moov, $mdat)))
    }
    return (Get-Item -LiteralPath $Path)
}
function New-Png { param([string]$Path, [int]$FillKb = 4, [switch]$Fake)
    $sig = if ($Fake) { [byte[]]@(0, 1, 2, 3, 4, 5, 6, 7) } else { [byte[]]@(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) }
    [System.IO.File]::WriteAllBytes($Path, (Join-Bytes @($sig, (New-Filler ($FillKb * 1024) ($script:seed++)))))
    return (Get-Item -LiteralPath $Path)
}

$root = Join-Path ([System.IO.Path]::GetTempPath()) ('mediagate-' + [guid]::NewGuid().ToString('N'))
$clipDir = Join-Path $root 'clips'
$lfDir = Join-Path $root 'youtube'
New-Item -ItemType Directory -Path $clipDir, $lfDir | Out-Null

$configJson = @"
{
  "target_points": 5,
  "day_reset_hour": 4,
  "time_zone": "UTC",
  "no_reuse": true,
  "sources": [
    { "kind": "clip", "folder": "$($clipDir.Replace('\','/'))", "video_ext": [".mp4"], "max_seconds": 120, "min_size_mb": 0.01, "points": 1 },
    { "kind": "longform", "folder": "$($lfDir.Replace('\','/'))", "video_ext": [".mp4"], "thumb_ext": [".png"], "min_seconds": 300, "min_size_mb": 0.01, "thumb_min_kb": 1, "points": 3 }
  ]
}
"@
$cfg = ConvertTo-MediaGateConfig ($configJson | ConvertFrom-Json)
$emptyState = [pscustomobject]@{ Used = @{} }

try {
    Write-Host ''
    Write-Host 'MP4-Dauer lesen' -ForegroundColor Cyan
    $fA = New-Mp4 (Join-Path $root 'dur90.mp4') 90
    $fB = New-Mp4 (Join-Path $root 'dur600.mp4') 600
    $fP = New-Mp4 (Join-Path $root 'prog.mp4') 0 -InProgress
    Assert-Equal 90 ([int](Get-VideoDurationSeconds $fA)) 'Dauer 90 s wird korrekt gelesen'
    Assert-Equal 600 ([int](Get-VideoDurationSeconds $fB)) 'Dauer 600 s wird korrekt gelesen'
    Assert-True ($null -eq (Get-VideoDurationSeconds $fP)) 'Renderndes Video (kein moov) -> Dauer nicht lesbar'
    Remove-Item (Join-Path $root 'dur90.mp4'), (Join-Path $root 'dur600.mp4'), (Join-Path $root 'prog.mp4')

    Write-Host ''
    Write-Host 'Dateikopf-Pruefung' -ForegroundColor Cyan
    Assert-True (Test-PngHeader (New-Png (Join-Path $root 't.png'))) 'Echtes PNG erkannt'
    Assert-True (-not (Test-PngHeader (New-Png (Join-Path $root 'f.png') -Fake))) 'Falsches PNG abgelehnt'
    Assert-True (Test-VideoHeader (New-Mp4 (Join-Path $root 'v.mp4') 10)) 'Echtes MP4 erkannt'
    [System.IO.File]::WriteAllBytes((Join-Path $root 'r.mp4'), (New-Filler 2048 99))
    Assert-True (-not (Test-VideoHeader (Get-Item (Join-Path $root 'r.mp4')))) 'Zufallsdatei als MP4 abgelehnt'
    Remove-Item (Join-Path $root 't.png'), (Join-Path $root 'f.png'), (Join-Path $root 'v.mp4'), (Join-Path $root 'r.mp4')

    Write-Host ''
    Write-Host 'Clips zaehlen (1 Punkt, unter 2 Minuten)' -ForegroundColor Cyan
    $short1 = New-Mp4 (Join-Path $clipDir 'short1.mp4') 30
    New-Mp4 (Join-Path $clipDir 'short2.mp4') 90 | Out-Null
    New-Mp4 (Join-Path $clipDir 'mid.mp4') 180 | Out-Null                       # 2-5 Min -> ignorieren
    New-Mp4 (Join-Path $clipDir 'langinclip.mp4') 360 | Out-Null                # >5 Min im Clip-Ordner -> ignorieren
    New-Mp4 (Join-Path $clipDir 'prog.mp4') 0 -InProgress | Out-Null            # rendert -> Clip zaehlt (noch) nicht
    Copy-Item (Join-Path $clipDir 'short1.mp4') (Join-Path $clipDir 'short1-copy.mp4')
    $old = New-Mp4 (Join-Path $clipDir 'alt.mp4') 30
    (Get-Item $old.FullName).LastWriteTimeUtc = [datetime]::UtcNow.AddDays(-2)   # altes Schreibdatum -> zaehlt nicht

    $score = Get-DayScore $cfg $emptyState
    Assert-Equal 2 $score.ClipPoints 'Nur die zwei echten Clips zaehlen'
    $byName = @{}; foreach ($it in $score.Items) { $byName[$it.Name] = $it }
    Assert-True ($byName['mid.mp4'].Reason -match 'zwischen 2 und 5') 'mid.mp4: 2-5 Minuten erklaert'
    Assert-True ($byName['langinclip.mp4'].Reason -match 'laenger als 5') 'langinclip.mp4: >5 Min erklaert'
    Assert-True ($byName['prog.mp4'].Reason -match 'rendert') 'prog.mp4: rendert noch'
    Assert-Equal 1 @($score.Items | Where-Object { $_.Name -like 'short1*' -and $_.Reason -match 'gleicher Inhalt' }).Count 'Kopie erkannt (eine der beiden short1-Dateien ist Duplikat)'
    Assert-True ($byName['alt.mp4'].Reason -match 'nicht von heute') 'Heute nur kopierte alte Datei zaehlt nicht'

    Write-Host ''
    Write-Host 'Long-form (Video + PNG = 3 Punkte, auch beim Rendern)' -ForegroundColor Cyan
    New-Mp4 (Join-Path $lfDir 'vidA.mp4') 600 | Out-Null
    New-Mp4 (Join-Path $lfDir 'vidB.mp4') 0 -InProgress -FillKb 80 | Out-Null    # rendert noch -> zaehlt via PNG
    New-Mp4 (Join-Path $lfDir 'vidShort.mp4') 120 | Out-Null                     # unter 5 Min -> kein Long-form
    New-Png (Join-Path $lfDir 'thumbA.png') | Out-Null
    New-Png (Join-Path $lfDir 'thumbB.png') | Out-Null
    New-Png (Join-Path $lfDir 'thumbExtra.png') | Out-Null                       # ueberzaehlig

    $score = Get-DayScore $cfg $emptyState
    Assert-Equal 6 $score.LongformPoints 'Zwei Bundles (vidA+Thumb, vidB+Thumb) = 6 Punkte'
    $byName = @{}; foreach ($it in $score.Items) { $byName[$it.Name] = $it }
    Assert-True ($byName['vidB.mp4'].Counts) 'Renderndes Long-form zaehlt (dank PNG), ohne fertige Dauer'
    Assert-True ($byName['vidShort.mp4'].Reason -match 'unter 5') 'Zu kurzes Video ist kein Long-form'
    Assert-True ($byName['thumbExtra.png'].Reason -match 'kein Partner') 'Ueberzaehliges Thumbnail hat keinen Partner'

    Write-Host ''
    Write-Host 'Gesamtpunkte und Ziel' -ForegroundColor Cyan
    Assert-Equal 8 $score.Points 'Clips (2) + Long-form (6) = 8 Punkte'
    Assert-Equal 5 $score.Target 'Ziel sind 5 Punkte'
    Assert-True $score.Met 'Bedingung erfuellt (8 >= 5)'

    Write-Host ''
    Write-Host 'no_reuse: schon benutzte Dateien zaehlen nicht nochmal' -ForegroundColor Cyan
    $usedFps = @{}
    foreach ($it in $score.Items) {
        if ($it.Kind -ne 'clip' -and $it.Fingerprint -and $it.Counts) { $usedFps[$it.Fingerprint] = '2000-01-01' }
    }
    $reuseState = [pscustomobject]@{ Used = $usedFps }
    $score2 = Get-DayScore $cfg $reuseState
    Assert-Equal 0 $score2.LongformPoints 'Gestern benutzte Long-form-Dateien zaehlen heute nicht'
    Assert-Equal 2 $score2.Points 'Nur die zwei Clips bleiben'
    Assert-True (-not $score2.Met) 'Damit ist das Ziel nicht mehr erreicht'

    Write-Host ''
    Write-Host 'Mitgelieferte gate.json' -ForegroundColor Cyan
    $shipped = Join-Path $projectDir 'engine/gate.sample.json'
    $sc = Read-MediaGateConfig $shipped
    Assert-True ($sc.TargetPoints -eq 5 -and $sc.Sources.Count -eq 2) 'gate.sample.json ist gueltig und hat 5 Punkte + 2 Quellen'
} catch {
    $script:Failed++
    Write-Host "  ABBRUCH: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace
} finally {
    Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host ("{0} bestanden, {1} fehlgeschlagen" -f $script:Passed, $script:Failed) -ForegroundColor $(if ($script:Failed) { 'Red' } else { 'Green' })
if ($script:Failed) { exit 1 }
