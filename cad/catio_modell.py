"""Parametrisches Modell des Balkon-Catios.

Koordinaten in Metern, passend zum ausgerichteten Scan
(scan/balkon_scan_ausgerichtet.glb):
  y = oben, y=0 ist der Balkonboden (Fliesen)
  x = von der Hauswand (-) Richtung Garten (+)
  z = entlang des Balkons, von der Stirnbrüstung (-) zur weißen Seitenwand (+)

Ausführen:  python cad/catio_modell.py
Erzeugt:    cad/modell.json      (Bauteile + Bauschritte für den 3D-Viewer index.html)
            docs/stueckliste.md  (Material- und Zuschnittliste)
"""

import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Bestand – aus dem LiDAR-Scan gemessen (Genauigkeit ca. ±2 cm, vor dem
# Zuschneiden nachmessen!)
# ---------------------------------------------------------------------------
X_FASSADE = -0.98      # Glasfront / Hauswand
X_RINNE = -0.83        # Ende der Entwässerungsrinne vor der Glasfront
X_BRUEST_INNEN = 0.93  # Innenseite Gartenbrüstung
X_BRUEST_AUSSEN = 1.10
Z_STIRN_INNEN = -0.33  # Innenseite Stirnbrüstung
Z_STIRN_AUSSEN = -0.47
Z_SEITENWAND = 2.67    # Innenseite weiße Seitenwand
X_SEITENWAND_ENDE = 0.55  # bis hier reicht die Seitenwand Richtung Garten
H_BRUESTUNG = 0.67     # Oberkante Brüstung inkl. Holzabdeckung
H_STURZ = 2.39         # Unterkante Fenstersturz

# ---------------------------------------------------------------------------
# Konstruktion – frei änderbar
# ---------------------------------------------------------------------------
H_OBEN = 2.30          # Oberkante Rahmen (9 cm Luft unter dem Sturz)
PFOSTEN = 0.07         # Kantholz 70x70
LATTE_B, LATTE_H = 0.07, 0.045  # Kantholz 45x70, flach liegend
KOPFBAND = 0.045       # Kantholz 45x45
BRETT_D, BRETT_B = 0.02, 0.10   # Brett 20x100 für Brüstungsklemmen
Z_SPARREN = [0.67, 1.67]
LAGERLAENGE = {"Kantholz 70×70": 2.40, "Kantholz 45×70": 3.00,
               "Kantholz 45×45": 2.00, "Brett 20×100": 2.00}

parts = []


def teil(step, name, art, x0, x1, y0, y1, z0, z1, profil=None, laenge=None, rot=None):
    """Quader von (x0,y0,z0) bis (x1,y1,z1); rot = Drehung um die eigene Mitte."""
    parts.append({
        "step": step, "name": name, "art": art, "profil": profil,
        "laenge": round(laenge, 3) if laenge else None,
        "c": [round((x0 + x1) / 2, 4), round((y0 + y1) / 2, 4), round((z0 + z1) / 2, 4)],
        "s": [round(abs(x1 - x0), 4), round(abs(y1 - y0), 4), round(abs(z1 - z0), 4)],
        "r": rot or [0, 0, 0],
    })


def netz(step, name, x0, x1, y0, y1, z0, z1):
    parts.append({"step": step, "name": name, "art": "netz",
                  "c": [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
                  "s": [max(abs(x1 - x0), 0.004), max(abs(y1 - y0), 0.004), max(abs(z1 - z0), 0.004)],
                  "r": [0, 0, 0],
                  "flaeche": round(sorted([abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)])[1]
                                   * sorted([abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)])[2], 2)})


# Abgeleitete Lagen
xg0, xg1 = X_BRUEST_INNEN - PFOSTEN, X_BRUEST_INNEN          # Gartenseite
xf0, xf1 = X_RINNE, X_RINNE + PFOSTEN                        # Fassadenseite (vor der Rinne)
zs0, zs1 = Z_STIRN_INNEN, Z_STIRN_INNEN + PFOSTEN            # Stirnseite
zw0, zw1 = Z_SEITENWAND - PFOSTEN, Z_SEITENWAND              # Seitenwand
y_schwelle = LATTE_H
y_rahmen = H_OBEN - LATTE_H

# --- Schritt 2: Bodenschwellen (liegen nur auf, nichts wird gebohrt) ---------
S = "Kantholz 45×70"
teil(2, "Schwelle Gartenseite", "holz", xg0, xg1, 0, y_schwelle, Z_STIRN_INNEN, Z_SEITENWAND, S, Z_SEITENWAND - Z_STIRN_INNEN)
teil(2, "Schwelle Stirnseite", "holz", X_FASSADE, xg0, 0, y_schwelle, zs0, zs1, S, xg0 - X_FASSADE)
teil(2, "Schwelle Seitenwand", "holz", X_FASSADE, xg0, 0, y_schwelle, zw0, zw1, S, xg0 - X_FASSADE)

# --- Schritt 3: Pfosten -------------------------------------------------------
P = "Kantholz 70×70"
h_pf = y_rahmen - y_schwelle
z_mitte = (Z_STIRN_INNEN + Z_SEITENWAND) / 2
for name, (x0, x1), (z0, z1) in [
    ("Pfosten Ecke Fassade/Stirn", (xf0, xf1), (zs0, zs1)),
    ("Pfosten Ecke Stirn/Garten", (xg0, xg1), (zs0, zs1)),
    ("Pfosten Mitte Garten", (xg0, xg1), (z_mitte - PFOSTEN / 2, z_mitte + PFOSTEN / 2)),
    ("Pfosten Ecke Garten/Seitenwand", (xg0, xg1), (zw0, zw1)),
    ("Pfosten Ecke Seitenwand/Fassade", (xf0, xf1), (zw0, zw1)),
]:
    teil(3, name, "holz", x0, x1, y_schwelle, y_rahmen, z0, z1, P, h_pf)

# --- Schritt 4: Oberer Rahmen -----------------------------------------------
teil(4, "Rähm Gartenseite", "holz", xg0, xg1, y_rahmen, H_OBEN, Z_STIRN_INNEN, Z_SEITENWAND, S, Z_SEITENWAND - Z_STIRN_INNEN)
teil(4, "Rähm Stirnseite", "holz", X_FASSADE, xg0, y_rahmen, H_OBEN, zs0, zs1, S, xg0 - X_FASSADE)
teil(4, "Rähm Seitenwand", "holz", X_FASSADE, xg0, y_rahmen, H_OBEN, zw0, zw1, S, xg0 - X_FASSADE)
teil(4, "Rähm Fassade", "holz", xf0, xf1, y_rahmen, H_OBEN, zs1, zw0, S, zw0 - zs1)

# --- Schritt 5: Sparren + Kopfbänder ------------------------------------------
for i, z in enumerate(Z_SPARREN, 1):
    teil(5, f"Dachsparren {i}", "holz", xf1, xg0, y_rahmen, H_OBEN, z - LATTE_B / 2, z + LATTE_B / 2, S, xg0 - xf1)
kb_l = 0.42
d = kb_l / math.sqrt(2) / 2
yk = y_rahmen - d
# Gartenseite (Ebene x = const), Drehung um x-Achse
xk = (xg0 + xg1) / 2
for name, zc, sgn in [("Kopfband Garten Stirn", zs1 + d, 1), ("Kopfband Garten Seitenwand", zw0 - d, -1),
                      ("Kopfband Garten Mitte 1", z_mitte - PFOSTEN / 2 - d, -1),
                      ("Kopfband Garten Mitte 2", z_mitte + PFOSTEN / 2 + d, 1)]:
    teil(5, name, "holz", xk - KOPFBAND / 2, xk + KOPFBAND / 2, yk - KOPFBAND / 2, yk + KOPFBAND / 2,
         zc - kb_l / 2, zc + kb_l / 2, "Kantholz 45×45", kb_l, [sgn * math.pi / 4, 0, 0])
# Stirnseite (Ebene z = const), Drehung um z-Achse
zk = (zs0 + zs1) / 2
for name, xc, sgn in [("Kopfband Stirn Fassade", xf1 + d, -1), ("Kopfband Stirn Garten", xg0 - d, 1)]:
    teil(5, name, "holz", xc - kb_l / 2, xc + kb_l / 2, yk - KOPFBAND / 2, yk + KOPFBAND / 2,
         zk - KOPFBAND / 2, zk + KOPFBAND / 2, "Kantholz 45×45", kb_l, [0, 0, sgn * math.pi / 4])

# --- Schritt 6: Brüstungsklemmen (U-Bügel über die Brüstung, ohne Bohren) -----
B = "Brett 20×100"
y_kl0, y_kl1 = H_BRUESTUNG + 0.005, H_BRUESTUNG + 0.005 + BRETT_D
for name, zc in [("Klemme Stirnecke", zs0 + PFOSTEN / 2), ("Klemme Mitte", z_mitte), ("Klemme Seitenwandecke", zw1 - PFOSTEN / 2)]:
    z0, z1 = zc - BRETT_B / 2, zc + BRETT_B / 2
    teil(6, f"{name} – Deckbrett", "klemme", xg1, X_BRUEST_AUSSEN + 0.03, y_kl0, y_kl1, z0, z1, B, X_BRUEST_AUSSEN + 0.03 - xg1)
    teil(6, f"{name} – Außenbrett", "klemme", X_BRUEST_AUSSEN + 0.01, X_BRUEST_AUSSEN + 0.03, y_kl1 - 0.30, y_kl1, z0, z1, B, 0.30)
for name, xc in [("Klemme Stirn Fassade", xf0 + PFOSTEN / 2), ("Klemme Stirn Garten", xg0 + PFOSTEN / 2)]:
    x0, x1 = xc - BRETT_B / 2, xc + BRETT_B / 2
    teil(6, f"{name} – Deckbrett", "klemme", x0, x1, y_kl0, y_kl1, Z_STIRN_AUSSEN - 0.03, zs0, B, zs0 - Z_STIRN_AUSSEN + 0.03)
    teil(6, f"{name} – Außenbrett", "klemme", x0, x1, y_kl1 - 0.30, y_kl1, Z_STIRN_AUSSEN - 0.03, Z_STIRN_AUSSEN - 0.01, B, 0.30)

# --- Schritt 7: Katzennetz Seiten (innen an Pfosten, vom Boden bis Rahmen) ----
netz(7, "Netz Gartenseite", xg0 - 0.003, xg0 - 0.003, 0.0, H_OBEN, Z_STIRN_INNEN, Z_SEITENWAND)
netz(7, "Netz Stirnseite", X_FASSADE, xg1, 0.0, H_OBEN, zs1 + 0.003, zs1 + 0.003)
netz(7, "Netz Lücke an der Seitenwand", X_SEITENWAND_ENDE - 0.10, xg1, 0.0, H_OBEN, zw0 - 0.003, zw0 - 0.003)

# --- Schritt 8: Dach + Anschluss an Fassade -------------------------------------
netz(8, "Netz Dach", X_FASSADE, xg1, H_OBEN + 0.003, H_OBEN + 0.003, Z_STIRN_INNEN, Z_SEITENWAND)
netz(8, "Netzstreifen unter dem Sturz", X_FASSADE + 0.004, X_FASSADE + 0.004, H_OBEN, H_STURZ, Z_STIRN_INNEN, Z_SEITENWAND)

STEPS = [
    {"n": 1, "titel": "Bestand", "text": "Dein Balkon aus dem LiDAR-Scan, gerade ausgerichtet. Innen ca. 3,00 m lang und 1,91 m tief, Brüstung 67 cm hoch, nach oben offen. Unter dem Fenstersturz sind 2,39 m Platz."},
    {"n": 2, "titel": "Bodenschwellen", "text": "Drei Kanthölzer 45×70 in U-Form auf den Boden legen: entlang Gartenbrüstung, Stirnbrüstung und Seitenwand. Gummipads darunter schützen die Fliesen und lassen Wasser ablaufen. Die Fensterseite bleibt frei."},
    {"n": 3, "titel": "Pfosten", "text": "Fünf Pfosten 70×70 auf die Schwellen stellen und mit Winkelverbindern verschrauben. Die beiden Pfosten an der Glasfront stehen direkt vor der Rinne, damit sie frei bleibt."},
    {"n": 4, "titel": "Oberer Rahmen", "text": "Rähm 45×70 rundum auf die Pfosten, Oberkante 2,30 m. Das lässt 9 cm Luft unter dem Fenstersturz."},
    {"n": 5, "titel": "Sparren und Kopfbänder", "text": "Zwei Dachsparren tragen das Dachnetz. Kopfbänder 45×45 unter 45° steifen den Rahmen in Längs- und Querrichtung aus, damit er nicht wackelt."},
    {"n": 6, "titel": "Brüstungsklemmen", "text": "U-Bügel aus Brettern 20×100 über die Brüstung, an den Pfosten verschraubt. Sie halten das Gestell gegen Wind, ohne dass ins Mauerwerk gebohrt wird."},
    {"n": 7, "titel": "Netz an den Seiten", "text": "Katzenschutznetz innen an Pfosten, Schwellen und Rähm tackern oder mit Kabelbindern befestigen. An der Seitenwand nur die Lücke zwischen Wandende und Gartenseite schließen."},
    {"n": 8, "titel": "Dach und Fassadenanschluss", "text": "Netz über Rähm und Sparren spannen. Den Spalt zwischen Rahmen und Fenstersturz mit einem Netzstreifen schließen, je nach Erlaubnis geklebt oder geklemmt."},
]

MASSE = [
    {"t": "3,00 m", "p": [X_BRUEST_INNEN + 0.25, 0.05, (Z_STIRN_INNEN + Z_SEITENWAND) / 2]},
    {"t": "1,91 m", "p": [(X_FASSADE + X_BRUEST_INNEN) / 2, 0.05, Z_STIRN_INNEN + 0.25]},
    {"t": "Brüstung 0,67 m", "p": [X_BRUEST_AUSSEN, H_BRUESTUNG + 0.05, 1.8]},
    {"t": "Sturz 2,39 m", "p": [X_FASSADE + 0.05, H_STURZ + 0.05, 1.2]},
    {"t": "Seitenwand", "p": [0.0, 2.0, Z_SEITENWAND]},
]


def cm(v):
    return f"{v * 100:.1f}".replace(".", ",").replace(",0", "")


def stueckliste():
    einkauf = []
    wood = defaultdict(list)
    for p in parts:
        if p.get("profil"):
            wood[p["profil"]].append((p["laenge"], p["name"]))
    lines = ["# Stückliste Balkon-Catio", "",
             "Automatisch erzeugt aus `cad/catio_modell.py`. Alle Längen in cm.",
             "Maße stammen aus dem LiDAR-Scan (±2 cm): **vor dem Zuschnitt am Balkon nachmessen.**", ""]
    lines += ["## Holz und Zuschnitt", ""]
    for prof, items in wood.items():
        stock = LAGERLAENGE[prof]
        # First-Fit-Decreasing auf Lagerlänge, 5 mm Sägeschnitt
        bars = []
        for l, n in sorted(items, reverse=True):
            for b in bars:
                if b["rest"] >= l + 0.005:
                    b["teile"].append((l, n)); b["rest"] -= l + 0.005; break
            else:
                bars.append({"rest": stock - l - 0.005, "teile": [(l, n)]})
        einkauf.append({"teil": prof, "menge": f"{len(bars)} × {stock * 100:.0f} cm",
                        "zuschnitt": [[cm(l), n] for b in bars for l, n in b["teile"]]})
        lines += [f"### {prof}: {len(bars)} × {stock * 100:.0f} cm kaufen", "",
                  "| Stange | Zuschnitt | Rest |", "|---|---|---|"]
        for i, b in enumerate(bars, 1):
            zs = ", ".join(f"{cm(l)} ({n})" for l, n in b["teile"])
            lines.append(f"| {i} | {zs} | {max(b['rest'], 0) * 100:.0f} |")
        lines.append("")
    netz_m2 = sum(p["flaeche"] for p in parts if p["art"] == "netz")
    n_pf = sum(1 for p in parts if p["name"].startswith("Pfosten"))
    klein = [
        ("Katzenschutznetz (transparent, drahtverstärkt)", f"ca. {netz_m2 * 1.15:.0f} m²",
         f"{netz_m2:.1f} m² netto + 15 % für Überlappung".replace(".", ",")),
        ("Winkelverbinder 70×70", str(n_pf * 2 + 8), "Pfosten unten/oben, Rahmenecken, Sparren"),
        ("Holzschrauben 5×80", "1 Pack (100)", "Rahmen, Kopfbänder"),
        ("Holzschrauben 4×40", "1 Pack (200)", "Winkel, Klemmen"),
        ("Gummipads 8 mm", "8", "unter die Schwellen"),
        ("Moosgummistreifen", "3 m", "Klemmen innen, schützt die Brüstung"),
        ("Tackerklammern 10 mm + UV-feste Kabelbinder", "je 1 Pack", "Netzbefestigung"),
        ("Holzlasur außen", "0,75 l", "vor dem Aufbau streichen"),
    ]
    lines += ["## Netz und Kleinteile", "", "| Teil | Menge | Hinweis |", "|---|---|---|"]
    lines += [f"| {t} | {m} | {h} |" for t, m, h in klein] + [""]
    einkauf += [{"teil": t, "menge": m, "hinweis": h} for t, m, h in klein]
    return "\n".join(lines), einkauf


if __name__ == "__main__":
    (ROOT / "docs").mkdir(exist_ok=True)
    md, einkauf = stueckliste()
    data = {"steps": STEPS, "parts": parts, "masse": MASSE, "einkauf": einkauf,
            "bestand": {"x_fassade": X_FASSADE, "x_bruestung": X_BRUEST_INNEN, "z_stirn": Z_STIRN_INNEN,
                        "z_seitenwand": Z_SEITENWAND, "h_bruestung": H_BRUESTUNG, "h_sturz": H_STURZ}}
    (ROOT / "cad" / "modell.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    (ROOT / "docs" / "stueckliste.md").write_text(md)
    print(f"{len(parts)} Bauteile, {len(STEPS)} Schritte geschrieben.")
