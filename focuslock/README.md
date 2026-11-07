# FocusLock – erst die Arbeit, dann das Spiel

> **Stand der Entwicklung:** Wir bauen das in zwei Stufen.
> **1. Testmodus (jetzt) – gefahrlos:** `test.cmd` startet ein sichtbares Fenster, das die Regeln prüft, den Stand als Tray-Icon zeigt und in deinen Obsidian-Vault schreibt. Es schließt gesperrte Programme, lässt sich aber **jederzeit beenden** (Fenster zu, Strg+C, oder Rechtsklick aufs Symbol → Beenden). Nichts bleibt zurück: kein Dienst, keine Registry, kein Autostart. Damit finden wir Fehler in den Regeln.
> **2. Echte Sperre (später):** Windows-Dienst als SYSTEM, Registry-Startsperre, Brave nur für Canva, Timer-Notausgang. Erst wenn der Testmodus sauber läuft.
>
> **Testmodus starten:** Werte in `engine/gate.json` prüfen (Ordner, Vault, gesperrte Programme), dann `test.cmd` doppelklicken. Den Mess-Kern testen: `pwsh -NoProfile -File tests/MediaGate.Tests.ps1`.
>
> **Punkte-Regel:** Clip (Video unter 2 Min) = 1 Punkt. Long-form (Video + PNG-Thumbnail im selben Ordner) = 3 Punkte. 2–5 Min zählt nicht. Ziel: 5 Punkte am Tag. Ein Long-form zählt schon **während** es rendert (es hängt am PNG, nicht an der fertigen Dauer).
>
> Der Rest dieser Datei beschreibt die geplante echte Sperre (Stufe 2).

---


FocusLock sperrt auf deinem Windows-PC bestimmte Programme (Steam, ein Spiel, einen Launcher …).
Freigeschaltet wird automatisch, sobald du die Tagesaufgabe erledigt hast, zum Beispiel:

> **Im Ordner `Videos\Clips` liegen 5 Videos, die heute aufgenommen wurden.**

Startest du vorher ein gesperrtes Programm, wird es nach ein bis zwei Sekunden beendet, und ein Fenster sagt dir, wie viele Clips noch fehlen.
Ab dem nächsten Morgen (04:00 Uhr) ist wieder gesperrt, und es zählen nur neue Clips.

## So funktioniert es

| Teil | Läuft als | Aufgabe |
|---|---|---|
| **Wächter** (`FocusLock.ps1 -Mode Run`) | SYSTEM, über die Aufgabenplanung, ab Systemstart | Beendet gesperrte Programme, prüft alle 20 s die Clips, schaltet frei |
| **Hinweisfenster** (`Notify.ps1`) | dein Konto, Autostart | Zeigt „gesperrt, noch 2 Clips“ bzw. „freigeschaltet!“ |
| **FocusLock Status** (Startmenü) | dein Konto | Listet die heutigen Clips und warum einer nicht zählt |

Ein normales Benutzerkonto kann einen SYSTEM-Prozess weder beenden noch die Aufgabe abschalten.
Auch die Einstellungen in `C:\ProgramData\FocusLock` darf es nicht ändern. Das ist der ganze Trick, siehe [Unumgehbar machen](#unumgehbar-machen).

## Einrichten

### 1. Herunterladen

Auf GitHub den Branch öffnen, dann **Code → Download ZIP**.
Vor dem Entpacken: Rechtsklick auf die ZIP → **Eigenschaften** → unten **Zulassen** anhaken.
Sonst warnt Windows bei jedem Skript. Danach entpacken und in den Ordner `focuslock` gehen.

### 2. `config.json` anpassen

Mit dem Editor öffnen. Pfade bitte mit `/` schreiben (oder mit doppeltem `\\`):

```json
"blocked": {
  "process_names": ["steam.exe", "EpicGamesLauncher.exe"],
  "path_prefixes": ["C:/Program Files (x86)/Steam/steamapps/common"]
},
"unlock": {
  "folders": ["C:/Users/Max/Videos/Clips"],
  "min_count": 5,
  "min_size_mb": 5
}
```

* **Welche Programme?** Spiel starten, Task-Manager öffnen (Strg+Umschalt+Esc) und auf den Reiter **Details** gehen. Dort steht der Name, z.B. `FortniteClient-Win64-Shipping.exe`.
  Am wirksamsten ist es, den **Launcher** (Steam, Epic, Riot …) zu sperren *und* den **Spiele-Ordner** unter `path_prefixes`.
  Dann wird alles darin gesperrt, auch wenn du eine `.exe` umbenennst.
* **Welcher Clip-Ordner?** Der Ordner, in dem OBS, NVIDIA, Xbox Game Bar oder dein Handy die Videos ablegen.
  Bei OneDrive z.B. `C:/Users/Max/OneDrive/Videos/Clips`. Unterordner zählen mit.
* `DEINNAME` unbedingt ersetzen. Der Installer warnt, wenn der Ordner nicht existiert.

### 3. Installieren

**`install.cmd` doppelklicken** und die Admin-Abfrage bestätigen.
Der Installer prüft die Einstellungen, richtet alles ein und zeigt am Ende den aktuellen Stand.

### 4. Ausprobieren

Gesperrtes Programm starten: Es wird beendet und das Hinweisfenster erscheint (ab der nächsten Anmeldung).
Den Stand siehst du jederzeit über **Startmenü → FocusLock Status**:

```
  GESPERRT - 3 von 5 Clips geschafft, es fehlen noch 2.

  [OK] Replay 2026-11-06 14-02-11.mp4           14:02      48,2 MB
  [OK] Replay 2026-11-06 14-30-55.mp4           14:31      51,0 MB
  [OK] Replay 2026-11-06 15-12-03.mp4           15:12      47,9 MB
  [--] test.mp4                                 15:20       0,3 MB  zu klein (0,3 MB, mindestens 5,0 MB)
```

### 5. Unumgehbar machen

**Solange dein eigenes Konto Administrator ist, kannst du FocusLock jederzeit abschalten.** Daran kommt kein Programm vorbei.
Für eine echte Sperre musst du dir selbst die Admin-Rechte wegnehmen:

1. **Einstellungen → Konten → Andere Benutzer → Konto hinzufügen**
   → „Ich kenne die Anmeldeinformationen für diese Person nicht“ → „Benutzer ohne Microsoft-Konto hinzufügen“.
   Name z.B. `Waechter`, dazu ein langes, zufälliges Passwort.
2. Bei dem neuen Konto auf **Kontotyp ändern → Administrator** stellen.
3. **Das Passwort weggeben:** einer Vertrauensperson geben oder auf Papier in einen Umschlag stecken, den jemand anderes aufbewahrt.
   Nicht im Passwortmanager speichern und nicht abfotografieren.
4. Einmal als `Waechter` anmelden, dann bei **deinem** Konto **Kontotyp ändern → Standardbenutzer**.
5. Ab- und wieder anmelden.

Ab jetzt gilt: Die Aufgabe beenden, Einstellungen ändern oder deinstallieren geht nur mit dem Wächter-Passwort.
Bei jedem Versuch fragt Windows danach.

> Tipp: Prüfe vorher, dass das Wächter-Konto wirklich funktioniert (einmal damit anmelden). Ohne ein funktionierendes Admin-Konto kommst du sonst selbst nicht mehr an Systemeinstellungen.

## Was zählt als Clip?

Eine Datei zählt, wenn alles davon zutrifft:

* Sie liegt in einem der `folders` und hat eine der `extensions`.
* Sie wurde **heute** aufgenommen: Angelegt *und* zuletzt geschrieben nach dem Tagesbeginn (04:00).
  Ein alter Clip, den du heute nur kopierst oder verschiebst, behält sein altes Aufnahmedatum und zählt nicht.
* Sie ist mindestens `min_size_mb` groß.
* Sie ist **wirklich ein Video**. Der Dateianfang muss zu MP4, MOV, MKV, WebM oder AVI passen.
  Eine leere oder zufällige Datei namens `clip.mp4` zählt nicht.
* Sie ist **keine Kopie** eines anderen Clips von heute.
* Sie wurde **noch nie für eine Freischaltung benutzt** (`no_reuse`). FocusLock merkt sich einen Fingerabdruck jedes Clips, der dich schon einmal freigeschaltet hat.

## Alle Einstellungen

| Schlüssel | Standard | Bedeutung |
|---|---|---|
| `enabled` | `true` | `false` = Sperre aus (z.B. im Urlaub), ohne zu deinstallieren |
| `blocked.process_names` | | Programmnamen, z.B. `"steam.exe"`. Erkennt auch umbenannte Programme am eingebauten Originalnamen |
| `blocked.path_prefixes` | | Ordner: Jedes Programm darin ist gesperrt. Ganze Laufwerke und der Windows-Ordner sind nicht erlaubt |
| `unlock.folders` | | Clip-Ordner, vollständiger Pfad |
| `unlock.recursive` | `true` | Unterordner mitzählen |
| `unlock.extensions` | Video-Endungen | Leere Liste `[]` = alle Dateien |
| `unlock.min_count` | `5` | So viele Clips braucht es |
| `unlock.min_size_mb` | `5` | Mindestgröße pro Clip |
| `unlock.no_reuse` | `true` | Ein Clip schaltet nur einmal frei |
| `day_reset_hour` | `4` | Uhrzeit, zu der ein neuer Tag beginnt und wieder gesperrt wird |
| `time_zone` | `W. Europe Standard Time` | Feste Zeitzone. Ein Verstellen der Windows-Zeitzone hebelt den Tag nicht aus |
| `poll_seconds` | `2` | Wie oft nach gesperrten Programmen gesucht wird |
| `check_seconds` | `20` | Wie oft der Clip-Ordner geprüft wird (beim Start eines gesperrten Programms sofort) |

**Später ändern:** Als Administrator `C:\ProgramData\FocusLock\config.json` bearbeiten. Der Wächter übernimmt Änderungen innerhalb von Sekunden.
Oder die `config.json` im Download-Ordner ändern und `install.cmd` erneut ausführen.
Eine fehlerhafte Datei hebt die Sperre **nicht** auf. Der Wächter arbeitet dann mit den letzten gültigen Einstellungen weiter und schreibt den Fehler ins Protokoll.

**Protokoll:** `C:\ProgramData\FocusLock\focuslock.log`. Dort steht, was wann gesperrt und freigeschaltet wurde.

**Deinstallieren:** `uninstall.cmd` doppelklicken. Dafür braucht es Admin-Rechte, also das Wächter-Passwort.

## Ehrliche Grenzen

FocusLock ist eine hohe Hürde, kein Gefängnis. Es kann nicht verhindern:

* **Admin-Rechte:** Wer Administrator ist, kann alles abschalten. Darum Schritt 5.
* **Windows neu installieren, von USB-Stick starten:** Dagegen helfen nur ein BIOS-Passwort und ein abgeschalteter USB-Start.
* **Abgesicherter Modus:** Dort läuft der Wächter nicht. Allerdings laufen dort auch kaum Spiele (keine Grafiktreiber, meist kein Netzwerk).
* **Spiele, die nicht auf diesem PC laufen:** Browser-Spiele, Cloud-Gaming, Konsole, Handy.
* **Ein umbenanntes Spiel außerhalb der gesperrten Ordner,** das keinen Originalnamen eingebaut hat. Darum den Launcher und den Spiele-Ordner sperren.
* **Absichtlich gefälschte Clips:** FocusLock prüft Datum, Größe, Dateiformat und Wiederverwendung, aber nicht, *was* im Video zu sehen ist.
  Wer extra fünf Schwarzbild-Videos erzeugt, betrügt sich selbst, und zwar sehr bewusst.
  Falls du das irgendwann brauchst: Eine Prüfung des Inhalts (z.B. eine KI schaut sich ein Standbild an) ließe sich ergänzen.

## Für Entwickler

```bash
pwsh -NoProfile -File tests/FocusLock.Tests.ps1        # Linux/macOS mit PowerShell 7
powershell -NoProfile -File tests\FocusLock.Tests.ps1  # Windows
```

Die Tests prüfen die Konfiguration, die Tagesgrenze, die Clip-Regeln und das Sperren und Freischalten an einem echten Testprozess.
Dazu kommt ein kompletter Durchlauf mit laufendem Wächter.
Die `.ps1`-Dateien müssen als UTF-8 **mit BOM** gespeichert bleiben, sonst zeigt Windows PowerShell 5.1 die Umlaute falsch an.
