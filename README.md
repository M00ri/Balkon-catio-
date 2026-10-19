# Balkon-Catio

Planung eines Katzengeheges für den Balkon: 3D-Scan, parametrisches CAD-Modell, Bauanleitung mit Animation und Stückliste.

| Datei | Inhalt |
|---|---|
| `index.html` | 3D-Viewer: Scan + Gehege, Schritt-für-Schritt-Aufbau, Material, Maße |
| `cad/catio_modell.py` | Parametrisches Modell. Alle Maße stehen oben in der Datei |
| `cad/modell.json` | Vom Modell erzeugt: Bauteile und Bauschritte für den Viewer |
| `docs/stueckliste.md` | Vom Modell erzeugt: Einkaufs- und Zuschnittliste |
| `scan/balkon_scan.usdz` | Original-Scan (3d Scanner App, iPhone LiDAR) |
| `scan/balkon_scan_ausgerichtet.glb` | Scan gerade ausgerichtet (12° gedreht, Boden auf y = 0) und zugeschnitten |

## Modell ändern

```bash
python3 cad/catio_modell.py   # schreibt cad/modell.json und docs/stueckliste.md neu
python3 -m http.server        # dann http://localhost:8000 öffnen
```

Koordinaten in Metern: y nach oben (Boden = 0), x von der Glasfront Richtung Garten, z von der Stirnbrüstung zur weißen Seitenwand.
