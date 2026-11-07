# FocusLock – Übergabe / Kontext für eine neue (lokale) Claude-Code-Sitzung

Diese Datei fasst **alles** zusammen, was bisher besprochen und gebaut wurde, damit ein frischer Chat
ohne Vorwissen weitermachen kann. Lies sie zuerst komplett.

---

## 1. Was FocusLock ist

Ein Selbstbindungs-Tool für **Windows** (wie eine Kindersicherung für sich selbst):
Es sperrt Programme (Browser, Spiele, …) und gibt sie erst frei, wenn der Nutzer seine
**Tagesaufgabe** erledigt hat – nämlich genug Videomaterial produziert hat. Der Nutzer ist
Content-Creator und will sich zwingen, erst zu arbeiten, bevor er spielt/surft.

Der Nutzer heißt im Alltag „du“, schreibt Deutsch. Bitte Deutsch antworten.

---

## 2. Die vereinbarten Regeln (Stand jetzt)

**Punkte-Modell, Ziel 5 Punkte pro Tag:**
- **Clip** = Video **unter 2 Minuten** → **1 Punkt**. Liegt in `F:\work\Clips\fertig`.
- **Long-form** = Video **+ ein PNG-Thumbnail** im selben Ordner → **3 Punkte**. Liegt in `E:\kittn\youtube\fertig`.
- Videos zwischen **2 und 5 Minuten zählen nicht** (weder Clip noch Long-form).
- Ein Long-form-Video muss **nicht fertig gerendert** sein. Es zählt über *(Video von heute + PNG von heute)*,
  nicht über die fertige Dauer – sonst müsste man bei 2-Stunden-Renders ewig warten. Das PNG ist der Beweis für echte Arbeit.
- **Thumbnail-Paarung „nach Anzahl“**: heutige Videos und heutige PNGs werden 1:1 gepaart, Dateinamen egal
  (Canva benennt das PNG anders als DaVinci das Video).
- Videos kommen normalerweise aus **DaVinci Resolve** (MP4/MOV).

**Schummel-Schutz im Mess-Kern:**
- Zählt nur, was **heute** angelegt UND zuletzt geschrieben wurde (eine Kopie alter Clips behält ihr altes Schreibdatum → fällt durch).
- Dateikopf muss zu echtem Video bzw. echtem PNG passen (leere/zufällige Datei zählt nicht).
- Kopien werden am Fingerabdruck erkannt.
- `no_reuse`: eine schon einmal angerechnete Datei zählt nicht an einem anderen Tag nochmal.
- Dauer wird direkt aus dem MP4/MOV-Atom (`moov/mvhd`) gelesen, **ohne** ffprobe/externe Tools.

**Tageswechsel:** Ein „Tag“ beginnt um **04:00** (`day_reset_hour`), Zeitzone fest `W. Europe Standard Time`
(verstellen der Windows-Zeitzone hebelt den Tag nicht aus).

---

## 3. Sperren – Architektur (wichtig!)

**Zwei Stufen.** Stufe 1 ist gebaut, Stufe 2 noch nicht.

### Stufe 1 – TESTMODUS (fertig, gefahrlos)
`TestRun.ps1` / `test.cmd`: läuft als normaler Benutzer in einem **sichtbaren Fenster**,
**jederzeit beendbar** (Fenster zu, Strg+C, Tray-Icon → Beenden). **Kein Dienst, keine Registry,
kein Autostart – nichts bleibt zurück.** Zweck: die Regeln testen, ohne sich auszusperren.
Schließt gesperrte Programme sanft per `Stop-Process`; `-DryRun` zeigt nur an.
Schreibt den Stand als Tray-Icon und als Notiz in den Obsidian-Vault.

### Stufe 2 – ECHTE SPERRE (noch zu bauen)
Geplant, in dieser Reihenfolge:
1. **Windows-Dienst** als `SYSTEM` (sichtbar in `services.msc`, kein Tarnname), der:
   - die Dateien prüft (Mess-Kern), die Registry-Sperre setzt/entfernt, selbst neu startet.
2. **Registry-Startsperre** (dokumentierte Richtlinie, dieselbe Art wie Kindersicherungen):
   blockiert Browser/Spiele am Starten. Der Dienst schreibt sie im Sekundentakt neu
   (Löschen bringt nichts). **Bedingung erfüllt → Eintrag entfernt → alles frei. Nächster Tag → Eintrag zurück.**
3. **Brave nur für Canva:** während der Sperre bleibt Brave startbar, aber per Chromium-URL-Richtlinie
   (`URLAllowlist`/`URLBlocklist`) auf `canva.com` beschränkt (Thumbnails!). Alle anderen Browser ganz gesperrt.
   Google-Login-Domains ggf. mit erlauben. Nach dem Entsperren ist Brave wieder voll frei.
4. **Timer-Notausgang** statt eines geheimen „Notfallworts“: man tippt einen Satz und wartet einen
   **sichtbaren Countdown** (z.B. 15–30 Min), dann geht es auf. (Ein geheimes Wort nutzt man genau im
   Moment der Versuchung → deshalb bewusst mit Reibung.)
5. **Tray-Icon** fürs Benutzerkonto, das den Dienst-Status anzeigt.

### WICHTIGE EHRLICHKEIT (mit dem Nutzer so besprochen)
- Der Nutzer will **kein** getrenntes Admin-/Standardbenutzer-Konto und **kein** Admin-Passwort.
- **Folge:** Solange sein Alltagskonto Admin ist, ist jede Sperre letztlich **von ihm selbst abbaubar**
  (Dienst stoppen, Registry löschen, abgesicherter Modus). Stufe 2 ist damit **starke Reibung, keine absolute Wand.**
  Das ist dem Nutzer klar und ausdrücklich ok. Nicht so tun, als wäre es unknackbar.
- **Kein Tarnname, kein Verstecken, keine Prozess-Injektion, kein Defender-/Task-Manager-Abschalten.**
  Das würde als Schadsoftware geflaggt. Nur dokumentierte Windows-Bausteine (Dienst, Richtlinie, geplante Aufgabe),
  sichtbar, mit normalem Deinstallierer. Die Stärke kommt aus Selbst-Neustart, nicht aus Tarnung.

---

## 4. Obsidian / Claudian

- Vault: `I:\Obsidian second brain\second-brain`. Der Testmodus schreibt `FocusLock\Status.md` dort hinein.
- **Claudian** (Claude-Plugin in Obsidian, läuft über die Anthropic-API des Nutzers) soll:
  Protokoll ansehen, Regeln bearbeiten, gegenchecken.
- **Prinzip: Lesen dürfen beide, aufschließen darf nur der Dienst.** Claudian liest/zeigt den Stand und darf
  gegenchecken, aber den Riegel legt **nur der Dienst** um (er liest die echten Dateien). Sonst wäre „ist erledigt“
  in Claudian ein Schlupfloch. Da die Regeln rein messbar sind (Dauer, PNG, Anzahl), braucht der Dienst dafür
  **keine KI und kein Internet**. Eine inhaltliche KI-Prüfung (z.B. „5 Min Schwarzbild zählt nicht“) wäre später Kür –
  und müsste dann **im Dienst** laufen, nicht im Plugin.

---

## 5. Repo-Landkarte (Ordner `focuslock/`)

**Aktuell / gültig (neue Richtung):**
- `engine/MediaGate.ps1` – Mess-Kern (Punkte, Dauer-Parser, Datei-Prüfungen, Tagesfenster). Pure Logik.
- `engine/gate.json` – Live-Konfiguration mit echten Ordnern/Vault/gesperrten Programmen.
- `engine/gate.sample.json` – Beispiel-Konfiguration.
- `TestRun.ps1` + `test.cmd` – Testmodus (Stufe 1).
- `tests/MediaGate.Tests.ps1` – **24 Tests, alle grün** (`pwsh -NoProfile -File tests/MediaGate.Tests.ps1`).

**Älterer erster Prototyp (teilweise überholt – als Baustein-Fundus behalten):**
- `FocusLock.ps1` – erster Wurf: geplante Aufgabe als SYSTEM + Prozess-Blockliste nach Name/Pfad.
  Enthält brauchbare Enforcement-Logik (umbenannte Programme am Originalnamen erkennen, Schutzliste),
  die in den Dienst von Stufe 2 übernommen werden kann. **Aber:** das Mess-/Punktesystem dort ist veraltet,
  der Mess-Kern lebt jetzt in `engine/MediaGate.ps1`.
- `Install.ps1`, `Uninstall.ps1`, `Notify.ps1`, `install.cmd`, `uninstall.cmd`,
  `tests/FocusLock.Tests.ps1` – gehören zu diesem ersten Prototyp.
- `README.md` – oben Hinweis zu Stufe 1/2, darunter die Doku des ersten Prototyps.

**Technik-Hinweise:**
- Alle `.ps1` müssen **UTF-8 mit BOM** bleiben (sonst falsche Umlaute in Windows PowerShell 5.1).
- `.cmd` müssen CRLF-Zeilenenden haben.
- Kompatibel zu Windows PowerShell 5.1 halten (mit PSScriptAnalyzer-Regeln `PSUseCompatible*` geprüft).
- Hier (Cloud-Linux) wurde mit **PowerShell 7** getestet; Windows-Teile (Dienst, Registry, Tray, Brave)
  brauchen einen echten Windows-Lauf.

---

## 6. So startest du den Testmodus (auf dem echten PC)

```powershell
cd focuslock
# Erst nur anzeigen (schließt nichts):
powershell -ExecutionPolicy Bypass -File TestRun.ps1 -DryRun
# Wenn es passt, richtig (schließt die in gate.json genannten Programme):
.\test.cmd
```
Vorher `engine/gate.json` prüfen: stimmen die Ordner `F:\work\Clips\fertig` und `E:\kittn\youtube\fertig`,
der Vault-Pfad und die Liste `blocked.process_names` (aktuell chrome/msedge/firefox; Brave bewusst NICHT)?

Den Mess-Kern allein testen:
```powershell
pwsh -NoProfile -File tests/MediaGate.Tests.ps1    # oder: powershell -NoProfile -File tests\MediaGate.Tests.ps1
```

---

## 7. Offene Punkte / nächste Schritte

1. **Testmodus auf echtem Windows laufen lassen** und prüfen, ob die Clips/Videos korrekt erkannt werden
   (Zahlen aus dem Fenster oder `FocusLock\Status.md` ansehen). Regeln/Schwellen (`min_size_mb` usw.) nachjustieren.
2. Entscheiden, **welche Programme** in die echte Sperrliste sollen (alle Browser außer Brave? welche Spiele/Launcher?
   per Name und/oder per Ordner `path_prefixes`).
3. Stufe 2 bauen: Windows-Dienst → Registry-Startsperre → Brave-nur-Canva → Timer-Notausgang → Tray-Icon.
   Am besten mit einem Windows-CI-Lauf (GitHub Actions) testen, da hier kein Windows verfügbar ist.
4. Entscheiden, ob FocusLock **ein eigenes Repo** bekommen soll (es liegt derzeit im Repo `Balkon-catio-`
   auf dem Branch `claude/program-blocker-work-verification-r7ipnr`, gehört aber thematisch nicht zum Balkon-Projekt).

---

## 8. Branch / Herkunft

- Repo: `github.com/M00ri/Balkon-catio-`
- Branch: `claude/program-blocker-work-verification-r7ipnr`
- Der Balkon-`main`-Branch ist unberührt; FocusLock lebt nur auf diesem Branch im Unterordner `focuslock/`.
