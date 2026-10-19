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
  hBalken: 0.68,          // Oberkante der vorhandenen Holzbalken auf der Brüstung
  balkenB: 0.11,
  hGarten: -2.90,         // Gartenboden unter dem Balkon
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 8,             // Dachneigung in Grad, Gefälle zum Garten
  hoeheFassade: 2.50,     // Oberkante Dachplatte an der Fassade
  ueberstand: 0.15,       // Dachüberstand über die Brüstung hinaus
  plattenBreite: 1.05,    // Systembreite Stegplatte inkl. Profil
  plattenStaerke: 0.016,  // 16 mm Doppelstegplatte
};

export const GRENZEN = {
  neigung: [5, 15, 1],
  hoeheFassade: [2.42, 2.55, 0.01],
  ueberstand: [0, 0.30, 0.01],
  plattenBreite: [0.98, 1.05, 1.20],
  plattenStaerke: [0.010, 0.016],
};

const PF = 0.07;                          // Pfosten 70×70
const PFETTE = { b: 0.06, h: 0.12 };      // KVH 60×120
const SPARREN = { b: 0.045, h: 0.095 };   // 45×95
const RIEGEL = { b: 0.045, h: 0.07 };     // 45×70
const KB = 0.045;                         // Kopfband 45×45
const PLATTEN_LAENGEN = [2.0, 2.5, 3.0, 3.5, 4.0];
export const LAGER = { "Kantholz 70×70": 2.5, "KVH 60×120": 4.0, "Kantholz 45×95": 2.5, "Kantholz 45×70": 2.5, "Kantholz 45×45": 2.0 };

export const SCHRITTE = [
  { n: 1, titel: "Bestand", text: "Dein Balkon aus dem LiDAR-Scan, gerade ausgerichtet. Braun markiert sind die vorhandenen Holzbalken auf der Brüstung: Sie sind der feste Ausgangspunkt. Die Glasfront sitzt in einer Nische, die Fassade mit dem Betonsturz liegt 30 cm weiter vorne." },
  { n: 2, titel: "Pfosten Gartenseite", text: "Drei Pfosten 70×70 stehen auf dem Boden direkt an der Brüstung. Je eine Schlossschraube M10 geht durch Pfosten und Bestandsbalken, oben sichert ein Winkel. Das ist der Anker der ganzen Konstruktion." },
  { n: 3, titel: "Pfosten Fassadenseite", text: "Zwei Pfosten stehen direkt vor der Fassade an den Enden, damit Tür und Fenster frei bleiben. Ihre Pfostenfüße werden auf die Fliesen geklebt. Gehalten werden sie später über Pfetten, Sparren und Kopfbänder." },
  { n: 4, titel: "Pfetten", text: "Zwei Pfetten aus KVH 60×120 tragen das Dach. Die Wandpfette an der Fassade überspannt die ganzen 3 m ohne Mittelpfosten. Die Traufpfette an der Gartenseite liegt auf drei Pfosten." },
  { n: 5, titel: "Sparren und Stirnriegel", text: "Sparren 45×95 laufen mit Gefälle zum Garten. Sie liegen immer unter einem Plattenstoß. Der Stirnriegel schließt die Stirnseite oben ab und trägt dort das Netz." },
  { n: 6, titel: "Kopfbänder", text: "Kopfbänder 45×45 steifen alle vier Seiten aus. Damit steht das Gestell auch ohne Verbindung zur Fassade wackelfrei." },
  { n: 7, titel: "Dachplatten", text: "Polycarbonat-Stegplatten mit den Stegen in Gefällerichtung auflegen. Randprofile und Verbindungsprofile werden auf die Sparren geschraubt. Unten kommen Antistaubband und ein Abschlussprofil hin, damit Wasser abtropfen kann." },
  { n: 8, titel: "Katzennetz", text: "Das Netz läuft an der Gartenseite und an der Stirnseite vom Bestandsbalken bis unter die Dachplatte. Dazu kommt die Lücke zwischen dem Ende der Seitenwand und der Gartenseite." },
  { n: 9, titel: "Anschlüsse kleben", text: "Ein Wandanschlussprofil wird auf den glatten Betonsturz geklebt und dichtet die Fuge zur Fassade ab. An der Seitenwand kommt ein geklebtes Dichtband dazu. Gebohrt wird nirgends in die Fassade." },
];

// ---------------------------------------------------------------------------
export function baueModell(param = {}) {
  const p = { ...DEFAULTS, ...param };
  const B = BESTAND;
  const a = (p.neigung * Math.PI) / 180;
  const tan = Math.tan(a), cos = Math.cos(a);
  const t = p.plattenStaerke;
  const xTraufe = B.xBrAussen + p.ueberstand;
  const yTop = (x) => p.hoeheFassade - tan * (x - B.xFassade);     // Oberkante Platte
  const yU = (x) => yTop(x) - t / cos;                               // Unterkante Platte = OK Sparren
  const dvS = SPARREN.h / cos;                                       // Sparrenhöhe lotrecht

  const parts = [];
  const add = (o) => { parts.push({ id: parts.length, ...o }); };
  const box = (step, name, art, x0, x1, y0, y1, z0, z1, extra = {}) =>
    add({ step, name, art, form: "box", c: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], s: [x1 - x0, y1 - y0, z1 - z0], ...extra });
  const stab = (step, name, art, A, Bp, b, h, extra = {}) =>
    add({ step, name, art, form: "stab", a: A, b: Bp, q: [b, h], laenge: Math.hypot(Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]), ...extra });
  const poly = (step, name, art, pts, extra = {}) => add({ step, name, art, form: "poly", pts, ...extra });

  // --- 1 Bestand: Holzbalken auf der Brüstung ---------------------------------
  box(1, "Bestandsbalken Gartenseite", "bestand", B.xBrInnen, B.xBrInnen + B.balkenB, B.hMauer, B.hBalken, B.zStirnAussen, B.zSeitenwand);
  box(1, "Bestandsbalken Stirnseite", "bestand", B.xGlas + 0.1, B.xBrInnen, B.hMauer, B.hBalken, B.zStirnInnen - B.balkenB, B.zStirnInnen);

  // --- Lagen ------------------------------------------------------------------
  const xg0 = B.xBrInnen - PF, xg1 = B.xBrInnen;                 // Gartenpfosten
  const xf0 = B.xFassade, xf1 = B.xFassade + PF;                 // Fassadenpfosten
  const xpg = (xg0 + xg1) / 2, xpf = B.xFassade + PFETTE.b / 2;   // Pfettenachsen
  const pfetteOK = (x) => yU(x) - dvS;
  const zs0 = B.zStirnInnen, zs1 = zs0 + PF;
  const zw0 = B.zSeitenwand - PF, zw1 = B.zSeitenwand;
  const zm = (B.zStirnInnen + B.zSeitenwand) / 2;
  const hPfG = pfetteOK(xpg) - PFETTE.h, hPfF = pfetteOK(xpf) - PFETTE.h;

  // --- 2 Gartenpfosten ----------------------------------------------------------
  const P = "Kantholz 70×70";
  for (const [name, z0, z1] of [["Pfosten Garten/Stirn", zs0, zs1], ["Pfosten Garten Mitte", zm - PF / 2, zm + PF / 2], ["Pfosten Garten/Seitenwand", zw0, zw1]]) {
    box(2, name, "holz", xg0, xg1, 0.008, hPfG, z0, z1, { profil: P, laenge: hPfG - 0.008 });
    box(2, `${name} – Schlossschraube M10`, "stahl", xg0 - 0.012, B.xBrInnen + B.balkenB + 0.012, (B.hMauer + B.hBalken) / 2 - 0.008, (B.hMauer + B.hBalken) / 2 + 0.008, (z0 + z1) / 2 - 0.008, (z0 + z1) / 2 + 0.008);
    box(2, `${name} – Winkel`, "stahl", xg1, xg1 + 0.07, B.hBalken, B.hBalken + 0.07, (z0 + z1) / 2 - 0.03, (z0 + z1) / 2 + 0.03);
  }

  // --- 3 Fassadenpfosten ----------------------------------------------------------
  for (const [name, z0, z1] of [["Pfosten Fassade/Stirn", zs0, zs1], ["Pfosten Fassade/Seitenwand", zw0, zw1]]) {
    box(3, name, "holz", xf0, xf1, 0.008, hPfF, z0, z1, { profil: P, laenge: hPfF - 0.008 });
    box(3, `${name} – Pfostenfuß geklebt`, "stahl", xf0 - 0.02, xf1 + 0.02, 0, 0.008, z0 - 0.02, z1 + 0.02);
  }

  // --- 4 Pfetten ------------------------------------------------------------------
  const PFP = "KVH 60×120";
  const pz0 = B.zStirnAussen, pz1 = B.zSeitenwand;
  box(4, "Wandpfette", "holz", xf0, xf0 + PFETTE.b, hPfF, hPfF + PFETTE.h, pz0, pz1, { profil: PFP, laenge: pz1 - pz0 });
  box(4, "Traufpfette", "holz", xpg - PFETTE.b / 2, xpg + PFETTE.b / 2, hPfG, hPfG + PFETTE.h, pz0, pz1, { profil: PFP, laenge: pz1 - pz0 });

  // --- 5 Sparren + Stirnriegel -------------------------------------------------------
  const L = pz1 - pz0;
  const nPl = Math.max(1, Math.ceil(L / p.plattenBreite - 0.01));
  const stoesse = [];
  for (let i = 1; i < nPl; i++) stoesse.push(pz0 + i * p.plattenBreite);
  const sparrenZ = [pz0 + SPARREN.b / 2, ...stoesse, pz1 - SPARREN.b / 2];
  const SP = "Kantholz 45×95";
  const cY = (x) => yU(x) - dvS / 2;
  sparrenZ.forEach((z, i) => {
    stab(5, `Sparren ${i + 1}`, "holz", [B.xFassade, cY(B.xFassade), z], [xTraufe, cY(xTraufe), z], SPARREN.b, SPARREN.h, { profil: SP });
  });
  const zr = (zs0 + zs1) / 2, dvR = RIEGEL.h / cos;
  const rx0 = xf0 + PFETTE.b, rx1 = xg0;
  stab(5, "Stirnriegel", "holz", [rx0, yU(rx0) - dvR / 2, zr], [rx1, yU(rx1) - dvR / 2, zr], RIEGEL.b, RIEGEL.h, { profil: "Kantholz 45×70" });

  // --- 6 Kopfbänder ---------------------------------------------------------------
  const KBN = "Kantholz 45×45", d = 0.30;
  const kb = (name, A, Bp) => stab(6, name, "holz", A, Bp, KB, KB, { profil: KBN });
  // Gartenseite, Fassadenseite (Ebene x = const, Ziel: Pfettenunterseite)
  for (const [xc, h, label] of [[xpg, hPfG, "Garten"], [xf0 + PF / 2, hPfF, "Fassade"]]) {
    const ziele = label === "Garten"
      ? [[zs1, 1], [zm - PF / 2, -1], [zm + PF / 2, 1], [zw0, -1]]
      : [[zs1, 1], [zw0, -1]];
    ziele.forEach(([zf, s], i) => kb(`Kopfband ${label} ${i + 1}`, [xc, h - d, zf], [xc, h, zf + s * d]));
  }
  // Stirnseite (Ziel: Unterkante Stirnriegel) und Seitenwand (Ziel: Unterkante Randsparren)
  const ukR = (x) => yU(x) - dvR, ukS = (x) => yU(x) - dvS;
  const zSW = sparrenZ[sparrenZ.length - 1];
  for (const [zc, uk, label] of [[zr, ukR, "Stirn"], [zSW, ukS, "Seitenwand"]]) {
    kb(`Kopfband ${label} Fassade`, [xf1, uk(xf1 + d) - d, zc], [xf1 + d, uk(xf1 + d), zc]);
    kb(`Kopfband ${label} Garten`, [xg0, uk(xg0 - d) - d, zc], [xg0 - d, uk(xg0 - d), zc]);
  }

  // --- 7 Dachplatten + Profile -------------------------------------------------------
  const lPl = (xTraufe - B.xFassade) / cos;
  const lagerPl = PLATTEN_LAENGEN.find((l) => l >= lPl - 0.001) ?? null;
  const breiten = [];
  for (let i = 0; i < nPl; i++) {
    const z0 = pz0 + i * p.plattenBreite, z1 = Math.min(pz1, z0 + p.plattenBreite);
    breiten.push(z1 - z0);
    const yc = (x) => yTop(x) - t / cos / 2;
    stab(7, `Stegplatte ${i + 1}`, "platte", [B.xFassade, yc(B.xFassade), (z0 + z1) / 2], [xTraufe, yc(xTraufe), (z0 + z1) / 2], z1 - z0 - 0.004, t,
      { breite: z1 - z0 });
  }
  const prof = (name, z) => stab(7, name, "profil", [B.xFassade, yTop(B.xFassade) + 0.006, z], [xTraufe, yTop(xTraufe) + 0.006, z], 0.05, 0.012);
  prof("Randprofil Stirnseite", pz0 + 0.025);
  stoesse.forEach((z, i) => prof(`Verbindungsprofil ${i + 1}`, z));
  prof("Randprofil Seitenwand", pz1 - 0.025);
  add({ step: 7, name: "Abschlussprofil Traufe", art: "profil", form: "stab", a: [xTraufe, yTop(xTraufe) - 0.01, pz0], b: [xTraufe, yTop(xTraufe) - 0.01, pz1], q: [0.02, 0.04], laenge: L });

  // --- 8 Katzennetz ----------------------------------------------------------------
  const xn = B.xBrInnen + 0.004, zn = B.zStirnInnen - 0.004, zg = zw0 - 0.004;
  poly(8, "Netz Gartenseite", "netz", [[xn, B.hBalken, zn], [xn, B.hBalken, B.zSeitenwand], [xn, yU(xn), B.zSeitenwand], [xn, yU(xn), zn]]);
  poly(8, "Netz Stirnseite", "netz", [[B.xGlas + 0.1, B.hBalken, zn], [xn, B.hBalken, zn], [xn, yU(xn), zn], [B.xFassade, yU(B.xFassade), zn], [B.xFassade, B.hSturzUK, zn], [B.xGlas + 0.1, B.hSturzUK, zn]]);
  const xl = B.xSeitenwandEnde - 0.10;
  poly(8, "Netz Lücke Seitenwand", "netz", [[xl, 0.0, zg], [xn, 0.0, zg], [xn, yU(xn), zg], [xl, yU(xl), zg]]);

  // --- 9 Geklebte Anschlüsse ----------------------------------------------------------
  box(9, "Wandanschlussprofil geklebt", "dicht", B.xFassade - 0.004, B.xFassade + 0.03, p.hoeheFassade - 0.005, p.hoeheFassade + 0.05, pz0, pz1, { laenge: L });
  stab(9, "Dichtband Seitenwand geklebt", "dicht", [B.xFassade, yTop(B.xFassade) - 0.03, B.zSeitenwand - 0.006], [xTraufe, yTop(xTraufe) - 0.03, B.zSeitenwand - 0.006], 0.012, 0.06);

  // --- Kennwerte & Prüfungen -----------------------------------------------------------
  const sparrenAbstand = Math.max(...sparrenZ.slice(1).map((z, i) => z - sparrenZ[i]));
  const maxAbstand = t >= 0.016 ? 1.05 : 0.75;
  const kennwerte = {
    neigung: p.neigung,
    gefaelleCmProM: tan * 100,
    hoeheFassade: p.hoeheFassade,
    hoeheTraufe: yTop(xTraufe),
    lichteGarten: hPfG,
    lichteFassade: hPfF,
    plattenLaenge: lPl,
    plattenLager: lagerPl,
    plattenAnzahl: nPl,
    plattenBreiten: breiten,
    sparrenAnzahl: sparrenZ.length,
    sparrenAbstand,
  };
  // Kleinere Lagerlänge, die mit einem Überstand von 0–30 cm ohne Zuschnitt passt
  const passend = PLATTEN_LAENGEN.filter((l) => l < (lagerPl ?? 0))
    .map((l) => ({ l, u: l * cos - (B.xBrAussen - B.xFassade) }))
    .filter((o) => o.u >= 0 && o.u <= 0.30).pop();
  const hinweise = [];
  if (p.neigung < 7) hinweise.push({ stufe: "warn", text: `Unter 7° bleibt auf Stegplatten leichter Wasser und Laub liegen. Viele Hersteller verlangen mindestens 5°.` });
  else hinweise.push({ stufe: "ok", text: `${p.neigung}° Neigung, ${kennwerte.gefaelleCmProM.toFixed(0)} cm Gefälle pro Meter: Wasser läuft gut zum Garten ab.` });
  if (hPfG < 1.95) hinweise.push({ stufe: "warn", text: `Unter der Traufpfette bleiben nur ${(hPfG * 100).toFixed(0)} cm. Direkt an der Brüstung stößt man sich leicht den Kopf.` });
  else hinweise.push({ stufe: "ok", text: `Unter der Traufpfette bleiben ${(hPfG * 100).toFixed(0)} cm Kopffreiheit.` });
  if (sparrenAbstand > maxAbstand + 0.001) hinweise.push({ stufe: "warn", text: `Sparrenabstand ${(sparrenAbstand * 100).toFixed(0)} cm ist für ${(t * 1000).toFixed(0)} mm Platten zu weit (Richtwert ${(maxAbstand * 100).toFixed(0)} cm). Dickere Platten oder Zwischensparren nehmen.` });
  else hinweise.push({ stufe: "ok", text: `Sparrenabstand ${(sparrenAbstand * 100).toFixed(0)} cm passt zu ${(t * 1000).toFixed(0)} mm Platten (Richtwert bis ${(maxAbstand * 100).toFixed(0)} cm).` });
  const rest = breiten[breiten.length - 1];
  if (rest < p.plattenBreite - 0.03) hinweise.push({ stufe: rest < 0.3 ? "warn" : "info", text: `Die letzte Platte wird auf ${(rest * 100).toFixed(0)} cm Breite zugeschnitten.` });
  if (lagerPl) {
    const ab = lagerPl - lPl;
    hinweise.push({ stufe: ab > 0.15 ? "info" : "ok", text: `Platten ${(lPl * 100).toFixed(0)} cm lang: aus ${(lagerPl * 100).toFixed(0)}-cm-Platten zuschneiden (${(ab * 100).toFixed(0)} cm Verschnitt).` +
      (ab > 0.15 && passend ? ` Mit ${(passend.u * 100).toFixed(0)} cm Überstand passt die ${(passend.l * 100).toFixed(0)}-cm-Platte ohne Zuschnitt.` : "") });
  }
  if (p.hoeheFassade + 0.05 > B.hSturzOK) hinweise.push({ stufe: "warn", text: `Das Wandanschlussprofil ragt über den Betonsturz auf die Ziegel. Auf Ziegeln hält Kleber schlechter.` });

  // --- Maßbeschriftungen ------------------------------------------------------------------
  const masse = [
    { t: "Innen 3,00 m", p: [B.xBrInnen + 0.3, 0.05, zm], ab: 1, bis: 3 },
    { t: "Fassade–Brüstung 1,71 m", p: [(B.xFassade + B.xBrInnen) / 2, 0.05, B.zStirnInnen + 0.3], ab: 1, bis: 3 },
    { t: "Bestandsbalken 68 cm", p: [B.xBrAussen, B.hBalken + 0.06, 1.9], ab: 1, bis: 3 },
    { t: "Sturz OK 2,57 m", p: [B.xFassade - 0.02, B.hSturzOK + 0.06, 1.2], ab: 1, bis: 3 },
    { t: "Glasfront in Nische", p: [B.xGlas, 1.2, 0.6], ab: 1, bis: 1 },
    { t: `Dach ${fmt(p.hoeheFassade)} m`, p: [B.xFassade, p.hoeheFassade + 0.12, 1.2], ab: 4, bis: 9 },
    { t: `Traufe ${fmt(yTop(xTraufe))} m`, p: [xTraufe + 0.05, yTop(xTraufe) + 0.08, 1.9], ab: 4, bis: 9 },
    { t: `Kopffreiheit ${fmt(hPfG)} m`, p: [xpg - 0.15, hPfG - 0.12, 0.4], ab: 4, bis: 9 },
    { t: `${p.neigung}° Neigung`, p: [0.1, yTop(0.1) + 0.12, 2.2], ab: 5, bis: 9 },
  ];

  return { param: p, parts, schritte: SCHRITTE, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p) };
}

function fmt(v) { return v.toFixed(2).replace(".", ","); }
const cm = (v) => (Math.round(v * 1000) / 10).toLocaleString("de-DE");

// First-Fit-Decreasing auf Lagerlängen, 5 mm Sägeschnitt
function zuschnitt(parts) {
  const nachProfil = {};
  for (const q of parts) if (q.profil) (nachProfil[q.profil] ??= []).push(q);
  return Object.entries(nachProfil).map(([profil, teile]) => {
    const lager = LAGER[profil];
    const stangen = [];
    for (const q of [...teile].sort((x, y) => y.laenge - x.laenge)) {
      const s = stangen.find((st) => st.rest >= q.laenge + 0.005);
      if (s) { s.teile.push(q); s.rest -= q.laenge + 0.005; }
      else stangen.push({ rest: lager - q.laenge - 0.005, teile: [q] });
    }
    return { profil, lager, stangen };
  });
}

export function einkauf(parts, k, p) {
  const z = zuschnitt(parts);
  const zeilen = z.map(({ profil, lager, stangen }) => ({
    gruppe: "Holz", teil: profil, menge: `${stangen.length} × ${cm(lager)} cm`,
    hinweis: profil.startsWith("KVH") ? "Konstruktionsvollholz, trocken und maßhaltig" : "",
  }));
  const nNetz = parts.filter((q) => q.art === "netz");
  let netzM2 = 0;
  for (const n of nNetz) netzM2 += polyFlaeche(n.pts);
  const L = BESTAND.zSeitenwand - BESTAND.zStirnAussen;
  const lPl = k.plattenLaenge;
  const nStoss = k.plattenAnzahl - 1;
  const schraubenProSparren = Math.ceil(lPl / 0.5) + 1;
  zeilen.push(
    { gruppe: "Dach", teil: `Polycarbonat-Stegplatte ${(p.plattenStaerke * 1000).toFixed(0)} mm, ${cm(p.plattenBreite)} cm breit`, menge: `${k.plattenAnzahl} × ${k.plattenLager ? cm(k.plattenLager) : "?"} cm`, hinweis: `auf ${cm(lPl)} cm kürzen, Stege in Gefällerichtung` },
    { gruppe: "Dach", teil: "Alu-Randprofil", menge: `2 × ${cm(lPl)} cm`, hinweis: "Stirnseite und Seitenwand" },
    ...(nStoss ? [{ gruppe: "Dach", teil: "Alu-Verbindungsprofil", menge: `${nStoss} × ${cm(lPl)} cm`, hinweis: "auf jedem Plattenstoß" }] : []),
    { gruppe: "Dach", teil: "Abschlussprofil mit Tropfkante", menge: `1 × ${cm(L)} cm`, hinweis: "untere Plattenkante" },
    { gruppe: "Dach", teil: "Antistaubband (unten) und Alu-Klebeband (oben)", menge: `je ${cm(L)} cm`, hinweis: "verschließt die Stegkammern" },
    { gruppe: "Dach", teil: "Wandanschlussprofil zum Kleben", menge: `1 × ${cm(L)} cm`, hinweis: "auf den Betonsturz" },
    { gruppe: "Dach", teil: "Kompriband / Dichtband selbstklebend", menge: `${cm(lPl + 0.2)} cm`, hinweis: "Fuge zur Seitenwand" },
    { gruppe: "Dach", teil: "Profilschrauben mit Dichtscheibe", menge: `${k.sparrenAnzahl * schraubenProSparren}`, hinweis: "alle ca. 50 cm je Sparren" },
    { gruppe: "Netz", teil: "Katzenschutznetz transparent, drahtverstärkt", menge: `ca. ${Math.ceil(netzM2 * 1.15)} m²`, hinweis: `${netzM2.toFixed(1).replace(".", ",")} m² netto + 15 % Überlappung` },
    { gruppe: "Verbinder", teil: "Schlossschraube M10×200 + U-Scheibe + Mutter", menge: "3", hinweis: "Gartenpfosten an Bestandsbalken" },
    { gruppe: "Verbinder", teil: "Winkelverbinder 90×90 verstärkt", menge: "13", hinweis: "Pfosten oben/Bestandsbalken, Stirnriegel" },
    { gruppe: "Verbinder", teil: "Pfostenträger mit Bodenplatte 71 mm", menge: "5", hinweis: "auf die Fliesen kleben" },
    { gruppe: "Verbinder", teil: "Sparrenpfettenanker", menge: `${k.sparrenAnzahl * 4}`, hinweis: "je Sparren 2 oben, 2 unten" },
    { gruppe: "Verbinder", teil: "Tellerkopfschrauben 6×120", menge: "1 Pack (50)", hinweis: "Kopfbänder, Pfetten" },
    { gruppe: "Verbinder", teil: "Kammnägel / Schrauben 4×40 für Winkel", menge: "1 Pack (250)", hinweis: "" },
    { gruppe: "Kleben", teil: "MS-Polymer-Montagekleber (außen, UV-fest)", menge: "3 Kartuschen", hinweis: "Pfostenfüße, Wandanschluss" },
    { gruppe: "Netz", teil: "Tackerklammern 10 mm + UV-feste Kabelbinder", menge: "je 1 Pack", hinweis: "" },
    { gruppe: "Holz", teil: "Holzlasur außen", menge: "1 l", hinweis: "vor dem Aufbau streichen" },
  );
  return { zeilen, zuschnitt: z };
}

function polyFlaeche(pts) {
  // Fläche eines ebenen Polygons im Raum
  let sx = 0, sy = 0, sz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay, az] = pts[i], [bx, by, bz] = pts[(i + 1) % pts.length];
    sx += ay * bz - az * by; sy += az * bx - ax * bz; sz += ax * by - ay * bx;
  }
  return Math.hypot(sx, sy, sz) / 2;
}

export { cm };
