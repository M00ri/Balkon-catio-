# Balkon-Catio

Planung eines Katzengeheges für den Balkon: 3D-Scan, parametrisches CAD-Modell, Bauanleitung mit Animation und Stückliste.

| Datei | Inhalt |
|---|---|
| `index.html` | 3D-Viewer: Scan + Gehege, Schritt-für-Schritt-Aufbau, Material, Maße |
| `cad/modell.js` | Parametrisches Modell (Bestand, Planungswerte, Bauteile, Prüfungen, Einkauf) |
| `cad/stueckliste.mjs` | Erzeugt `docs/stueckliste.md` aus dem Modell |
| `docs/stueckliste.md` | Vom Modell erzeugt: Einkaufs- und Zuschnittliste |
| `scan/balkon_scan.usdz` | Original-Scan (3d Scanner App, iPhone LiDAR) |
| `scan/balkon_scan_ausgerichtet.glb` | Scan gerade ausgerichtet (12° gedreht, Boden auf y = 0) und zugeschnitten |

## Modell ändern

```bash
node cad/stueckliste.mjs neigung=10 ueberstand=0.1   # Stückliste mit eigenen Werten
python3 -m http.server                               # Viewer unter http://localhost:8000
```

Koordinaten in Metern: y nach oben (Boden = 0), x von der Fassade (Sturzvorderkante) Richtung Garten, z von der Stirnbrüstung zur weißen Seitenwand.
