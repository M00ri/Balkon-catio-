// Parametrisches Modell des Balkon-Catios – eine Quelle für 3D-Viewer und Stückliste.
//
// Koordinaten in Metern, passend zum ausgerichteten Scan (scan/balkon_scan_ausgerichtet.glb):
//   y nach oben, y = 0 ist der Fliesenboden
//   x von der Fassade (-) Richtung Garten (+)
//   z entlang des Balkons, von der Stirnbrüstung (-) zur weißen Seitenwand (+)
//
// Viewer:     index.html importiert baueModell()
// Stückliste: node cad/stueckliste.mjs  ->  docs/stueckliste.md

// ---------------------------------------------------------------------------
// Bestand – aus dem LiDAR-Scan gemessen (ca. ±2 cm, vor dem Zuschnitt nachmessen)
// ---------------------------------------------------------------------------
export const BESTAND = {
  xGlas: -1.08,           // Glasfront, sitzt in einer Nische
  xFassade: -0.78,        // Vorderkante Betonsturz / Ziegelfassade
  hSturzUK: 2.40,         // Unterkante Sturz (Oberkante Nische)
  hSturzOK: 2.57,         // Oberkante Betonsturz, darüber Ziegel
  xBrInnen: 0.93,         // Innenseite Gartenbrüstung
  xBrAussen: 1.10,
  zStirnInnen: -0.33,     // Innenseite Stirnbrüstung
  zStirnAussen: -0.47,
  zSeitenwand: 2.67,      // Innenseite weiße Seitenwand
  xSeitenwandEnde: 0.55,  // Seitenwand reicht bis hier Richtung Garten
  hMauer: 0.59,           // Oberkante Brüstungsmauer
  hBalken: 0.68,          // Oberkante der vorhandenen Balken (mit U-Bügeln auf der Brüstung befestigt)
  balkenB: 0.11,
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 8,             // Dachneigung in Grad, Gefälle zum Garten
  hoeheFassade: 2.50,     // Oberkante Dachplatte an der Fassade
  platte: "2x1",          // vorhandene Polycarbonatplatten
  plattenStaerke: 0.016,
};

export const PLATTEN = {
  "2x1": { laenge: 2.0, breite: 1.0, label: "2,0 × 1,0 m" },
  "2x2": { laenge: 2.0, breite: 2.0, label: "2,0 × 2,0 m" },
};

export const GRENZEN = {
  neigung: [5, 15, 1],
  hoeheFassade: [2.42, 2.52, 0.01],
  plattenStaerke: [0.008, 0.010, 0.016],
};

// Alles Holz ist 70×55 aus 3-m-Stangen (vorhanden)
const H = { a: 0.055, b: 0.070 };         // a = schmale Seite, b = breite Seite
export const HOLZ = "Kantholz 70×55";
export const LAGER = 3.0;
const ANZAHL_PLATTEN_VORHANDEN = 3;

export const SCHRITTE = [
  { n: 1, titel: "Bestand", text: "Dein Balkon aus dem LiDAR-Scan, gerade ausgerichtet. Braun markiert sind deine Balken auf der Brüstung, die mit U-Bügeln befestigt sind. Auf ihnen steht das Gerüst. Die Glasfront sitzt in einer Nische, die Fassade mit dem Betonsturz liegt 30 cm weiter vorne." },
  { n: 2, titel: "Pfosten auf den Balken", text: "Drei Pfosten 70×55 stehen auf dem Gartenbalken. Je zwei Winkelverbinder pro Pfosten werden in den Balken geschraubt, nicht in die Mauer. Die Pfosten sind kurz, weil sie erst auf 68 cm Höhe anfangen." },
  { n: 3, titel: "Pfosten an der Fassade", text: "Zwei Pfosten stehen an den Enden vor der Fassade, damit Tür und Fenster frei bleiben. Der Pfosten an der Stirnseite wird seitlich an den Stirnbalken geschraubt. Der an der Seitenwand bekommt einen aufgeklebten Pfostenfuß." },
  { n: 4, titel: "Pfetten", text: "Die Wandpfette überspannt die ganzen 3 m ohne Mittelpfosten. Deshalb besteht sie aus zwei 70×55 hochkant übereinander, verleimt und alle 20 cm verschraubt, zusammen 55×140. Die Traufpfette auf den Gartenpfosten ist eine einfache Latte 70×55 hochkant." },
  { n: 5, titel: "Sparren mit Dachschräge", text: "Sparren 70×55 hochkant liegen unter jedem Plattenstoß und an beiden Rändern. Auf den Pfetten bekommen sie eine flache Kerbe mit dem Neigungswinkel, die Enden werden lotrecht abgeschnitten. Die Winkel stehen in der Zuschnittliste. Der Stirnriegel trägt oben das Netz an der Stirnseite." },
  { n: 6, titel: "Kopfbänder", text: "Kopfbänder aus Resten 70×55 steifen alle vier Seiten aus. So wird das Gerüst stabil genug für Kratzbaum und Liegebretter, die später an Pfosten und Pfetten kommen." },
  { n: 7, titel: "Dachplatten", text: "Drei Platten mit den Stegen in Gefällerichtung auflegen. Vorher oben Alu-Klebeband aufkleben (dicht), unten Antistaubband (lässt Kondenswasser raus). Die Platten werden mit Schrauben mit Dichtscheibe und Abstandshalter auf den Sparren befestigt. Unten schließt ein Tropfprofil ab." },
  { n: 8, titel: "Wandanschluss abdichten", text: "An der Fassade kommt ein Wandanschlussprofil mit Dichtlippe auf den glatten Betonsturz. Es wird mit MS-Polymer geklebt, oben läuft eine Dichtfuge. Die Lippe drückt auf die Platte und leitet das Wasser auf das Dach. An der Seitenwand dichtet ein Kompriband. Siehe Detailzeichnung." },
  { n: 9, titel: "Katzennetz", text: "Das Netz wird innen an Pfosten und Pfetten getackert, unten an die Bestandsbalken. Dazu kommen die Stirnseite bis zur Nische und die Lücke am Ende der Seitenwand." },
];

// ---------------------------------------------------------------------------
export function baueModell(param = {}) {
  const p = { ...DEFAULTS, ...param };
  const B = BESTAND;
  const PL = PLATTEN[p.platte] ?? PLATTEN["2x1"];
  const a = (p.neigung * Math.PI) / 180;
  const tan = Math.tan(a), cos = Math.cos(a);
  const t = p.plattenStaerke;
  const xTraufe = B.xFassade + PL.laenge * cos;          // Plattenende unten
  const ueberstand = xTraufe - B.xBrAussen;
  const yTop = (x) => p.hoeheFassade - tan * (x - B.xFassade);
  const yU = (x) => yTop(x) - t / cos;                    // Unterkante Platte = Oberkante Sparren
  const dvS = H.b / cos;                                  // Sparrenhöhe lotrecht

  const parts = [];
  const add = (o) => { parts.push({ id: parts.length, ...o }); };
  const box = (step, name, art, x0, x1, y0, y1, z0, z1, extra = {}) =>
    add({ step, name, art, form: "box", c: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], s: [x1 - x0, y1 - y0, z1 - z0], ...extra });
  const stab = (step, name, art, A, Bp, b, h, extra = {}) =>
    add({ step, name, art, form: "stab", a: A, b: Bp, q: [b, h], laenge: Math.hypot(Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]), ...extra });
  const poly = (step, name, art, pts, extra = {}) => add({ step, name, art, form: "poly", pts, ...extra });

  // --- 1 Bestand ----------------------------------------------------------------
  box(1, "Bestandsbalken Gartenseite", "bestand", B.xBrInnen, B.xBrInnen + B.balkenB, B.hMauer, B.hBalken, B.zStirnAussen, B.zSeitenwand);
  box(1, "Bestandsbalken Stirnseite", "bestand", B.xGlas + 0.1, B.xBrInnen, B.hMauer, B.hBalken, B.zStirnInnen - B.balkenB, B.zStirnInnen);

  // --- Lagen -----------------------------------------------------------------------
  const z0 = B.zStirnInnen, z1 = B.zSeitenwand;                 // Dachlänge = 3,00 m
  const xgc = B.xBrInnen + B.balkenB / 2;                        // Gartenpfosten mittig auf dem Balken
  const xg0 = xgc - H.a / 2, xg1 = xgc + H.a / 2;
  const xf0 = B.xFassade, xf1 = B.xFassade + H.b;                // Fassadenpfosten
  const zs0 = z0, zs1 = z0 + H.b, zw0 = z1 - H.b, zw1 = z1;
  const zm = (z0 + z1) / 2;
  const wpH = 2 * H.b;                                           // Wandpfette doppelt
  const xwp0 = B.xFassade, xwp1 = B.xFassade + H.a;
  const wpOK = yU((xwp0 + xwp1) / 2) - dvS;
  const tpOK = yU(xgc) - dvS;
  const hWP = wpOK - wpH, hTP = tpOK - H.b;                      // Unterkanten der Pfetten

  // --- 2 Gartenpfosten auf dem Bestandsbalken --------------------------------------------
  for (const [name, za, zb] of [["Pfosten Garten/Stirn", zs0, zs1], ["Pfosten Garten Mitte", zm - H.b / 2, zm + H.b / 2], ["Pfosten Garten/Seitenwand", zw0, zw1]]) {
    box(2, name, "holz", xg0, xg1, B.hBalken, hTP, za, zb, { profil: HOLZ, laenge: hTP - B.hBalken });
    for (const s of [-1, 1]) box(2, `${name} – Winkel`, "stahl", s < 0 ? xg0 - 0.004 : xg1, s < 0 ? xg0 : xg1 + 0.004, B.hBalken, B.hBalken + 0.07, (za + zb) / 2 - 0.025, (za + zb) / 2 + 0.025);
  }

  // --- 3 Fassadenpfosten -------------------------------------------------------------------
  box(3, "Pfosten Fassade/Stirn", "holz", xf0, xf1, 0, hWP, zs0, zs0 + H.a, { profil: HOLZ, laenge: hWP });
  box(3, "Pfosten Fassade/Stirn – Verschraubung am Stirnbalken", "stahl", xf0 + 0.02, xf1 - 0.02, B.hMauer + 0.02, B.hBalken - 0.02, zs0 - 0.06, zs0 + H.a + 0.01);
  box(3, "Pfosten Fassade/Seitenwand", "holz", xf0, xf1, 0.008, hWP, zw1 - H.a, zw1, { profil: HOLZ, laenge: hWP - 0.008 });
  box(3, "Pfosten Fassade/Seitenwand – Pfostenfuß geklebt", "stahl", xf0 - 0.02, xf1 + 0.02, 0, 0.008, zw1 - H.a - 0.02, zw1);

  // --- 4 Pfetten -----------------------------------------------------------------------------
  box(4, "Wandpfette unten", "holz", xwp0, xwp1, hWP, hWP + H.b, z0, z1, { profil: HOLZ, laenge: z1 - z0 });
  box(4, "Wandpfette oben", "holz", xwp0, xwp1, hWP + H.b, wpOK, z0, z1, { profil: HOLZ, laenge: z1 - z0 });
  box(4, "Traufpfette", "holz", xg0, xg1, hTP, tpOK, z0, z1, { profil: HOLZ, laenge: z1 - z0 });

  // --- 5 Sparren -----------------------------------------------------------------------------
  const maxAbstand = t >= 0.016 ? 1.05 : t >= 0.010 ? 0.80 : 0.60;  // Richtwerte, Herstellerangabe prüfen
  const stoesse = [];
  for (let z = z0 + PL.breite; z < z1 - 0.01; z += PL.breite) stoesse.push(z);
  const nPl = stoesse.length + 1;
  const linien = [z0 + H.a / 2, ...stoesse, z1 - H.a / 2];
  const sparrenZ = [];
  for (let i = 0; i < linien.length - 1; i++) {                   // Zwischensparren, wenn ein Feld zu breit ist
    const n = Math.ceil((linien[i + 1] - linien[i]) / maxAbstand - 0.001);
    for (let k = 0; k < n; k++) sparrenZ.push(linien[i] + (k * (linien[i + 1] - linien[i])) / n);
  }
  sparrenZ.push(linien[linien.length - 1]);
  const xSp1 = xTraufe - 0.03;                                    // Platte steht 3 cm über das Sparrenende
  const cY = (x) => yU(x) - dvS / 2;
  sparrenZ.forEach((z, i) => {
    const istStoss = stoesse.some((s) => Math.abs(s - z) < 0.001);
    stab(5, `Sparren ${i + 1}${istStoss ? " (Plattenstoß)" : ""}`, "holz", [B.xFassade, cY(B.xFassade), z], [xSp1, cY(xSp1), z], H.a, H.b,
      { profil: HOLZ, schnitt: `beide Enden lotrecht ${p.neigung}°, Kerben ${p.neigung}° über den Pfetten` });
  });
  const zr = zs0 + H.a / 2;
  const rx0 = xwp1, rx1 = xg0;
  stab(5, "Stirnriegel", "holz", [rx0, yU(rx0) - dvS / 2, zr + H.a], [rx1, yU(rx1) - dvS / 2, zr + H.a], H.a, H.b, { profil: HOLZ, schnitt: `beide Enden ${p.neigung}° schräg` });

  // --- 6 Kopfbänder -------------------------------------------------------------------------
  const d = 0.30;
  const kb = (name, A, Bp) => stab(6, name, "holz", A, Bp, H.a, H.a, { profil: HOLZ, schnitt: "beide Enden 45°" });
  for (const [zf, s, i] of [[zs1, 1, 1], [zm - H.b / 2, -1, 2], [zm + H.b / 2, 1, 3], [zw0, -1, 4]]) kb(`Kopfband Garten ${i}`, [xgc, hTP - d, zf], [xgc, hTP, zf + s * d]);
  for (const [zf, s, i] of [[zs0 + H.a, 1, 1], [zw1 - H.a, -1, 2]]) kb(`Kopfband Fassade ${i}`, [xf0 + H.b / 2, hWP - d, zf], [xf0 + H.b / 2, hWP, zf + s * d]);
  const ukR = (x) => yU(x) - dvS;
  const zSW = sparrenZ[sparrenZ.length - 1];
  for (const [zc, label] of [[zr + H.a, "Stirn"], [zSW, "Seitenwand"]]) {
    kb(`Kopfband ${label} Fassade`, [xf1, ukR(xf1 + d) - d, zc], [xf1 + d, ukR(xf1 + d), zc]);
    kb(`Kopfband ${label} Garten`, [xg0, ukR(xg0 - d) - d, zc], [xg0 - d, ukR(xg0 - d), zc]);
  }

  // --- 7 Dachplatten -----------------------------------------------------------------------
  const breiten = [];
  for (let i = 0; i < nPl; i++) {
    const a0 = z0 + i * PL.breite, a1 = Math.min(z1, a0 + PL.breite);
    breiten.push(a1 - a0);
    const yc = (x) => yTop(x) - t / cos / 2;
    stab(7, `Platte ${i + 1}${a1 - a0 < PL.breite - 0.01 ? ` (auf ${cmStr(a1 - a0)} cm Breite schneiden)` : ""}`, "platte",
      [B.xFassade + 0.01, yc(B.xFassade + 0.01), (a0 + a1) / 2], [xTraufe, yc(xTraufe), (a0 + a1) / 2], a1 - a0 - 0.004, t, { breite: a1 - a0 });
  }
  const prof = (name, z) => stab(7, name, "profil", [B.xFassade, yTop(B.xFassade) + 0.006, z], [xTraufe, yTop(xTraufe) + 0.006, z], 0.05, 0.012);
  prof("Randprofil Stirnseite", z0 + 0.025);
  stoesse.forEach((z, i) => prof(`Verbindungsprofil ${i + 1}`, z));
  prof("Randprofil Seitenwand", z1 - 0.025);
  stab(7, "Tropfprofil Traufe", "profil", [xTraufe, yTop(xTraufe) - 0.012, z0], [xTraufe, yTop(xTraufe) - 0.012, z1], 0.02, 0.04);

  // --- 8 Wandanschluss ----------------------------------------------------------------------
  box(8, "Wandanschlussprofil mit Dichtlippe (geklebt)", "dicht", B.xFassade - 0.004, B.xFassade + 0.035, p.hoeheFassade - 0.004, p.hoeheFassade + 0.06, z0, z1, { laenge: z1 - z0 });
  stab(8, "Kompriband Seitenwand", "dicht", [B.xFassade, yTop(B.xFassade) - 0.025, z1 - 0.006], [xTraufe, yTop(xTraufe) - 0.025, z1 - 0.006], 0.012, 0.05);

  // --- 9 Katzennetz ---------------------------------------------------------------------------
  const xn = xg0 - 0.004, zn = z0 + 0.004, zg = zw0 - 0.004;
  poly(9, "Netz Gartenseite", "netz", [[xn, B.hBalken, zn], [xn, B.hBalken, z1], [xn, yU(xn), z1], [xn, yU(xn), zn]]);
  poly(9, "Netz Stirnseite", "netz", [[B.xGlas + 0.1, B.hBalken - 0.06, zn], [xn, B.hBalken - 0.06, zn], [xn, yU(xn), zn], [B.xFassade, yU(B.xFassade), zn], [B.xFassade, B.hSturzUK, zn], [B.xGlas + 0.1, B.hSturzUK, zn]]);
  const xl = B.xSeitenwandEnde - 0.10;
  poly(9, "Netz Lücke Seitenwand", "netz", [[xl, 0.0, zg], [xn, 0.0, zg], [xn, yU(xn), zg], [xl, yU(xl), zg]]);

  // --- Kennwerte & Prüfungen -----------------------------------------------------------------
  const abst = sparrenZ.slice(1).map((z, i) => z - sparrenZ[i]);
  const kennwerte = {
    neigung: p.neigung,
    gefaelleCmProM: tan * 100,
    hoeheFassade: p.hoeheFassade,
    hoeheTraufe: yTop(xTraufe),
    ueberstand,
    kopfFassade: hWP,
    kopfGarten: hTP,
    plattenAnzahl: nPl,
    plattenBreiten: breiten,
    sparrenAnzahl: sparrenZ.length,
    sparrenAbstand: Math.max(...abst),
    hoehenunterschied: yTop(B.xFassade) - yTop(xTraufe),
  };
  const hinweise = [];
  hinweise.push(p.neigung < 7
    ? { stufe: "warn", text: `Unter 7° bleibt auf Stegplatten leicht Wasser und Laub liegen. Die meisten Hersteller verlangen mindestens 5°.` }
    : { stufe: "ok", text: `${p.neigung}° Neigung: ${(kennwerte.hoehenunterschied * 100).toFixed(0)} cm Höhenunterschied auf 2 m Platte, das Wasser läuft zum Garten.` });
  hinweise.push(ueberstand < 0.05
    ? { stufe: "warn", text: `Die Platte steht nur ${(ueberstand * 100).toFixed(0)} cm über die Brüstung. Das Wasser läuft an der Brüstung herunter. Flacher bauen oder ein Tropfblech unter die Plattenkante setzen.` }
    : { stufe: "ok", text: `Die Platte steht ${(ueberstand * 100).toFixed(0)} cm über die Außenkante der Brüstung, das Wasser tropft frei ab.` });
  hinweise.push(Math.max(...abst) > maxAbstand + 0.001
    ? { stufe: "warn", text: `Sparrenabstand ${(Math.max(...abst) * 100).toFixed(0)} cm ist zu weit.` }
    : { stufe: "ok", text: `${sparrenZ.length} Sparren, max. ${(Math.max(...abst) * 100).toFixed(0)} cm Abstand. Für ${(t * 1000).toFixed(0)} mm Platten sind bis ca. ${(maxAbstand * 100).toFixed(0)} cm üblich.` });
  hinweise.push(nPl <= ANZAHL_PLATTEN_VORHANDEN
    ? { stufe: "ok", text: `${nPl} von deinen ${ANZAHL_PLATTEN_VORHANDEN} Platten reichen für 3,00 m Dachlänge${breiten.some((b) => b < PL.breite - 0.01) ? `, eine wird auf ${cmStr(Math.min(...breiten))} cm geschnitten` : ""}.` }
    : { stufe: "warn", text: `Du brauchst ${nPl} Platten, hast aber ${ANZAHL_PLATTEN_VORHANDEN}.` });
  hinweise.push({ stufe: "ok", text: `Kopffreiheit: ${cmStr(hWP)} cm unter der Wandpfette, ${cmStr(hTP)} cm unter der Traufpfette.` });
  if (p.hoeheFassade + 0.06 > B.hSturzOK) hinweise.push({ stufe: "warn", text: `Das Wandanschlussprofil ragt über den Betonsturz auf die Ziegel. Auf Ziegeln mit Fugen hält Kleber schlechter und dichtet schlechter.` });
  else hinweise.push({ stufe: "ok", text: `Das Wandanschlussprofil sitzt komplett auf dem glatten Betonsturz (Oberkante ${cmStr(p.hoeheFassade + 0.06)} von max. ${cmStr(B.hSturzOK)} cm).` });

  // --- Maßbeschriftungen -------------------------------------------------------------------------
  const masse = [
    { t: "Innen 3,00 m", p: [B.xBrInnen + 0.3, 0.05, zm], ab: 1, bis: 3 },
    { t: "Fassade–Brüstung 1,71 m", p: [(B.xFassade + B.xBrInnen) / 2, 0.05, z0 + 0.3], ab: 1, bis: 3 },
    { t: "Balken OK 68 cm", p: [B.xBrAussen, B.hBalken + 0.06, 1.9], ab: 1, bis: 3 },
    { t: "Sturz OK 2,57 m", p: [B.xFassade - 0.02, B.hSturzOK + 0.06, 1.2], ab: 1, bis: 3 },
    { t: "Glasfront in Nische", p: [B.xGlas, 1.2, 0.6], ab: 1, bis: 1 },
    { t: `Dach ${fmt(p.hoeheFassade)} m`, p: [B.xFassade, p.hoeheFassade + 0.12, 1.2], ab: 4, bis: 9 },
    { t: `Traufe ${fmt(yTop(xTraufe))} m`, p: [xTraufe + 0.05, yTop(xTraufe) + 0.08, 1.9], ab: 4, bis: 9 },
    { t: `${p.neigung}° Neigung`, p: [0.1, yTop(0.1) + 0.12, 2.2], ab: 5, bis: 9 },
    { t: `Überstand ${Math.round(ueberstand * 100)} cm`, p: [xTraufe, yTop(xTraufe) - 0.4, 0.2], ab: 7, bis: 9 },
  ];

  return { param: p, platte: PL, parts, schritte: SCHRITTE, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p, PL) };
}

function fmt(v) { return v.toFixed(2).replace(".", ","); }
function cmStr(v) { return (Math.round(v * 1000) / 10).toLocaleString("de-DE"); }
export const cm = cmStr;

// First-Fit-Decreasing auf 3-m-Stangen, 5 mm Sägeschnitt
export function zuschnitt(parts) {
  const teile = parts.filter((q) => q.profil).sort((x, y) => y.laenge - x.laenge);
  const stangen = [];
  for (const q of teile) {
    const s = stangen.find((st) => st.rest >= q.laenge + 0.005);
    if (s) { s.teile.push(q); s.rest -= q.laenge + 0.005; }
    else stangen.push({ rest: LAGER - q.laenge - 0.005, teile: [q] });
  }
  return stangen;
}

export function einkauf(parts, k, p, PL) {
  const stangen = zuschnitt(parts);
  const lPl = PL.laenge;
  const L = BESTAND.zSeitenwand - BESTAND.zStirnInnen;
  const proSparren = Math.ceil(lPl / 0.4) + 1;                 // Schrauben alle ca. 40 cm
  const schrauben = k.sparrenAnzahl * proSparren + Math.ceil(L / 0.3);  // + Tropfprofil
  const nStoss = k.plattenAnzahl - 1;
  const mm = Math.round(p.plattenStaerke * 1000);
  const zeilen = [
    // Bestellen
    { status: "bestellen", teil: `Spenglerschrauben 6,5 × ${mm + 45} mm mit EPDM-Dichtscheibe`, menge: `${schrauben}`, hinweis: `Länge = Platte ${mm} mm + Profil + 30–35 mm im Holz` },
    { status: "bestellen", teil: "Abstandshalter (Distanzhülsen) für die Plattenschrauben", menge: `${schrauben}`, hinweis: `passend zu ${mm} mm, verhindern das Eindrücken der Platte` },
    { status: "bestellen", teil: "Alu-Klebeband, geschlossen (oben)", menge: `1 Rolle (min. ${cmStr(L + 0.2)} cm)`, hinweis: "obere Plattenkante an der Wand" },
    { status: "bestellen", teil: "Antistaubband, gelocht (unten)", menge: `1 Rolle (min. ${cmStr(L + 0.2)} cm)`, hinweis: "untere Plattenkante, lässt Kondenswasser raus" },
    { status: "bestellen", teil: "Wandanschlussprofil Alu mit Dichtlippe", menge: `1 × ${cmStr(L)} cm`, hinweis: "falls nicht vorhanden" },
    { status: "bestellen", teil: "MS-Polymer-Kleb- und Dichtstoff, außen, UV-fest", menge: "2 Kartuschen", hinweis: "Wandprofil kleben + Fuge oben, Pfostenfuß" },
    { status: "bestellen", teil: "Kompriband 15/3–7 mm, selbstklebend", menge: `1 Rolle (${cmStr(lPl + 0.2)} cm)`, hinweis: "Fuge zur Seitenwand" },
    // Vorhanden – nur prüfen
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt gesamt ${cmStr(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PL.label}`, menge: `${k.plattenAnzahl} von 3`, hinweis: `Stege in Gefällerichtung` },
    { status: "vorhanden", teil: "Randprofile / Verbindungsprofile", menge: `2 + ${nStoss} × ${cmStr(lPl)} cm`, hinweis: "Rand: Stirnseite und Seitenwand" },
    { status: "vorhanden", teil: "Tropf- bzw. Abschlussprofil", menge: `1 × ${cmStr(L)} cm`, hinweis: "untere Plattenkante" },
    { status: "vorhanden", teil: "Winkelverbinder", menge: "ca. 24", hinweis: "Pfostenfüße, Pfettenauflager, Stirnriegel" },
    { status: "vorhanden", teil: "Sparrenpfettenanker", menge: `${k.sparrenAnzahl * 4}`, hinweis: "je Sparren 2 an jeder Pfette" },
    { status: "vorhanden", teil: "Holzschrauben 6×100 / 6×140", menge: "ca. 60", hinweis: "Wandpfette verschrauben (alle 20 cm), Kopfbänder" },
    { status: "vorhanden", teil: "Holzleim D3 / PU-Leim", menge: "1 Flasche", hinweis: "Wandpfette verleimen" },
    { status: "vorhanden", teil: "Katzenschutznetz + Tacker", menge: `ca. ${Math.ceil(netzFlaeche(parts) * 1.15)} m²`, hinweis: "inkl. 15 % Überlappung" },
  ];
  return { zeilen, stangen };
}

function netzFlaeche(parts) {
  let s = 0;
  for (const n of parts.filter((q) => q.art === "netz")) {
    let sx = 0, sy = 0, sz = 0;
    for (let i = 0; i < n.pts.length; i++) {
      const [ax, ay, az] = n.pts[i], [bx, by, bz] = n.pts[(i + 1) % n.pts.length];
      sx += ay * bz - az * by; sy += az * bx - ax * bz; sz += ax * by - ay * bx;
    }
    s += Math.hypot(sx, sy, sz) / 2;
  }
  return s;
}
