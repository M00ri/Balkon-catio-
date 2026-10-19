// Parametrisches Modell des Balkon-Catios – eine Quelle für 3D-Viewer und Stückliste.
//
// Koordinaten in Metern, passend zum ausgerichteten Scan (scan/balkon_scan_ausgerichtet.glb):
//   y nach oben, y = 0 ist der Fliesenboden
//   x von der Hauswand (-) Richtung Garten (+)   <- in diese Richtung fällt das Dach
//   z entlang des Balkons: links die Brüstung (-), rechts die Betonmauer (+)
//
// Viewer:     index.html importiert baueModell()
// Stückliste: node cad/stueckliste.mjs  ->  docs/stueckliste.md

// ---------------------------------------------------------------------------
// Bestand – aus Scan und Fotos (ca. ±2 cm, vor dem Zuschnitt nachmessen)
// ---------------------------------------------------------------------------
export const BESTAND = {
  xGlas: -1.08,           // Glasfront, sitzt in einer Nische
  xFassade: -0.76,        // Vorderkante Hauswand (Betonsturz / Ziegel darüber)
  hSturzUK: 2.40,         // Unterkante Sturz = Oberkante Nische
  hSturzOK: 2.57,         // Oberkante Betonsturz, darüber Ziegel
  xBrAussen: 1.10,        // Außenkante Gartenbrüstung
  zLinksAussen: -0.47,    // Außenkante linke Brüstung
  zWand: 2.67,            // Innenseite Betonmauer rechts
  xWandEnde: 0.70,        // Betonmauer endet ca. 40 cm vor der Balkonkante (Foto + Scan)
  hMauerkrone: 2.66,      // Oberkante Betonmauer (flach, nutzbar)
  hWandFrei: 3.10,        // Hauswand ist bis hier frei (gemessen)
  hBruestung: 0.60,       // Oberkante Betonbrüstung
  hGelaender: 0.80,       // innenliegendes Metallgeländer, Oberkante
  // deine Balken 70×55 auf der Brüstung, mit U-Bügeln am Geländer befestigt
  balken: { b: 0.055, h: 0.07 },
  xBalkenGarten: 0.945,   // Innenkante Gartenbalken
  zBalkenLinks: -0.345,   // Innenkante linker Balken
  zBalkenWand: 2.425,     // Innenkante Eckbalken vor der Mauer (19 cm Beton bis zur Mauer, gemessen)
  tiefeEcke: 0.51,        // Brüstungsstück vor der Mauer: 51 cm tief (von der Außenkante nach innen)
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 8,             // Dachneigung in Grad, Gefälle nach vorne zum Garten
  hoeheVorne: 2.71,       // Unterkante Platte über der vorderen Pfette, knapp über der Mauerkrone
  plattenStaerke: 0.016,
};

export const PLATTE = { laenge: 2.0, breite: 1.05, label: "2,00 × 1,05 m", anzahl: 3 };

export const GRENZEN = {
  neigung: [5, 12, 1],
  hoeheVorne: [2.60, 2.85, 0.01],
  plattenStaerke: [0.010, 0.016, 0.020],
};

const H = { a: 0.055, b: 0.070 };   // Holz 70×55: a = schmal, b = breit
export const HOLZ = "Kantholz 70×55";
export const LAGER = 3.0;

export const SCHRITTE = [
  { n: 1, titel: "Bestand", text: "Dein Balkon aus Scan und Fotos. Braun: deine Balken 70×55 auf der Brüstung, mit U-Bügeln am innenliegenden Geländer. Rechts die Betonmauer mit Krone auf 2,66 m. Sie endet etwa 40 cm vor der Balkonkante. Das Dach fällt nach vorne zum Garten. Jeder Handgriff ist so geplant, dass du ihn von innen machst." },
  { n: 2, titel: "Pfosten auf den Balken", text: "Vier Pfosten 70×55 auf deinen Balken: auf dem linken Balken einer an der Hauswand und einer an der Ecke, auf dem Gartenbalken einer in der Mitte und einer an der Ecke zur Mauer. Links braucht es keinen Mittelpfosten, weil das Dach nach vorne fällt und dort kaum Last ankommt. Je zwei Winkel pro Pfosten, von innen in den Balken geschraubt. Nichts steht auf dem Boden." },
  { n: 3, titel: "Mauerlatte und Ecke an der Mauer", text: "Mauerlatte mit MS-Polymer auf die Mauerkrone kleben. Sie trägt das rechte Ende der Wandpfette und hält unten den Netzstreifen über der Mauer. In der Ecke ist zwischen deinem Eckbalken und der Mauer ein Betonstreifen von 19 cm Breite und 51 cm Tiefe. Die Betonmauer endet etwa 40 cm vor der Balkonkante. Genau dort, bündig mit dem Mauerende, wird ein Wandpfosten 70×55 flach mit MS-Polymer an die Innenseite der Mauer geklebt. Oben hält ihn ein Kopfholz, das bis unter das Ende der Traufpfette reicht, dazu ein Lochband aus Stahlblech, das an der Mauer hoch und über die Kante auf die Mauerlatte geschraubt wird. Ein Füllholz auf dem Kopfholz schließt die Seite bis unters Dach. Zwischen Eckpfosten und Wandpfosten kommt später das Netz über Eck." },
  { n: 4, titel: "Pfetten und Stirnriegel", text: "Hinten die Wandpfette: zwei 70×55 hochkant übereinander, verleimt und alle 20 cm verschraubt, weil sie 3 m ohne Stütze überspannt. Sie liegt links auf dem Pfosten und rechts auf der Mauerlatte und wird zusätzlich elastisch an die Hauswand geklebt. Vorne die Traufpfette auf den Gartenpfosten. Links ein schräger Stirnriegel von Pfosten zu Pfosten (1,65 m frei), an dem später das Netz endet. Er trägt fast nichts, deshalb reicht er ohne Mittelstütze." },
  { n: 5, titel: "Kopfbänder", text: "Kopfbänder aus Resten steifen links, vorne und an der Hauswand aus. Ab hier steht das Gerüst stabil, auch für Kratzbaum und Liegebretter später." },
  { n: 6, titel: "Wandprofil vorab kleben", text: "Solange oben noch offen ist, kommst du von innen an die Hauswand. Linie mit Schnur oder Laser anzeichnen (Oberkante Platte plus 1 cm), Kompriband an die Wand, Wandanschlussprofil mit MS-Polymer waagerecht ankleben, oben Dichtfuge ziehen. Nach dem Dach kommst du da nicht mehr hin." },
  { n: 7, titel: "Dachelemente auf Böcken bauen", text: "Jede deiner drei Platten wird auf zwei Böcken zu einem Element: zwei Sparren 70×55 darunter, Platte mit Abstandshaltern und Dichtschrauben drauf. Kanten fertig machen: oben an der Wand Alu-Klebeband, vorne Antistaubband, Tropfprofil und Rinnenhalter, außen die Randprofile. An die Kante zum Nachbarelement kommt ein H-Verbindungsprofil." },
  { n: 8, titel: "Elemente einbauen, Rinne einhängen", text: "Ein Element wiegt etwa 12 kg. Längs gedreht flach durch die Öffnung heben, oben um 90° drehen und ablegen: zuerst links, dann die Mitte, die seitlich ins H-Profil geschoben wird. Das rechte kommt zuletzt leicht gekippt durch die Restöffnung. Jedes Element 5 cm vor der Wand absetzen, unter die Dichtlippe schieben, von unten verschrauben. Dann von innen die Rinne in die Halter hängen und die Füllhölzer über der Traufpfette setzen." },
  { n: 9, titel: "Katzennetz von innen", text: "Das Netz hängt überall innen am Holz, nie an den Platten: Gartenseite bis zur Traufpfette, in der Ecke über Eck vom Eckpfosten zum Wandpfosten, links bis zum Stirnriegel und in die Fensternische, rechts ein Streifen über der Mauerkrone. Erst tackern, dann eine Klemmleiste drüberschrauben. Alles ist von innen erreichbar." },
];

// ---------------------------------------------------------------------------
export function baueModell(param = {}) {
  const p = { ...DEFAULTS, ...param };
  const B = BESTAND;
  const PL = PLATTE;
  const a = (p.neigung * Math.PI) / 180;
  const tan = Math.tan(a), cos = Math.cos(a);
  const t = p.plattenStaerke;
  const d70 = H.b / cos;                                        // Sparrenhöhe lotrecht

  // Balken auf der Brüstung
  const xg0 = B.xBalkenGarten, xg1 = xg0 + B.balken.b, xG = (xg0 + xg1) / 2;
  const zl1 = B.zBalkenLinks, zl0 = zl1 - B.balken.b;
  const zw0 = B.zBalkenWand, zw1 = zw0 + B.balken.b;
  const hB = B.hBruestung + B.balken.h;

  // Dachfläche: drei Platten nebeneinander, 1 cm Luft zur Betonmauer
  const zP1 = B.zWand - 0.005, zP0 = zP1 - PL.anzahl * PL.breite;
  const xP0 = B.xFassade + 0.01, xP1 = xP0 + PL.laenge * cos;
  const ueberstand = xP1 - B.xBrAussen;
  const yU = (x) => p.hoeheVorne + tan * (xG - x);              // Unterkante Platte = Oberkante Sparren
  const yTop = (x) => yU(x) + t / cos;

  const parts = [];
  const add = (o) => { parts.push({ id: parts.length, ...o }); };
  const box = (step, name, art, x0, x1, y0, y1, z0, z1, extra = {}) =>
    add({ step, name, art, form: "box", c: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], s: [x1 - x0, y1 - y0, z1 - z0], ...extra });
  const stab = (step, name, art, A, Bp, b, h, extra = {}) =>
    add({ step, name, art, form: "stab", a: A, b: Bp, q: [b, h], laenge: Math.hypot(Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]), ...extra });
  const poly = (step, name, art, pts, extra = {}) => add({ step, name, art, form: "poly", pts, ...extra });
  const holz = { profil: HOLZ };

  // --- 1 Bestand -------------------------------------------------------------------
  box(1, "Bestandsbalken Garten", "bestand", xg0, xg1, B.hBruestung, hB, zl0, zw1);
  box(1, "Bestandsbalken links", "bestand", B.xGlas + 0.1, xg0, B.hBruestung, hB, zl0, zl1);
  const xEcke = B.xBrAussen - B.tiefeEcke;
  box(1, "Bestandsbalken vor der Mauer", "bestand", xEcke, xg0, B.hBruestung, hB, zw0, zw1);
  const gx = xg0 - 0.012, gz = zl1 + 0.012, gw = zw0 - 0.012;
  box(1, "Geländer Garten (Bestand)", "geländer", gx - 0.008, gx + 0.008, B.hGelaender - 0.02, B.hGelaender, zl1, zw0);
  box(1, "Geländer links (Bestand)", "geländer", B.xGlas + 0.1, gx, B.hGelaender - 0.02, B.hGelaender, gz - 0.008, gz + 0.008);
  box(1, "Geländer vor der Mauer (Bestand)", "geländer", xEcke, gx, B.hGelaender - 0.02, B.hGelaender, gw - 0.008, gw + 0.008);
  for (let z = zl1 + 0.3; z < zw0; z += 0.75) box(1, "Geländerstütze", "geländer", gx - 0.008, gx + 0.008, B.hBruestung, B.hGelaender, z - 0.008, z + 0.008);

  // --- Höhen der Pfetten ----------------------------------------------------------------
  const xF0 = B.xFassade, xF1 = xF0 + H.a, xF = (xF0 + xF1) / 2;          // Wandpfette
  const wpOK = yU(xF) - d70, wpUK = wpOK - 2 * H.b;                        // doppelt, 55×140
  const tpOK = yU(xG) - d70, tpUK = tpOK - H.b;                            // Traufpfette 55×70
  const zPf0 = zP0 - 0.005, zPf1 = B.zWand + 0.06;                          // Pfetten von links bis über die Mauerlatte
  const zMitte = (zl1 + zw0) / 2;

  // --- 2 Pfosten auf den Balken ------------------------------------------------------------
  const pfosten = (name, x0, x1, z0, z1, oben) => {
    box(2, name, "holz", x0, x1, hB, oben, z0, z1, { ...holz, laenge: oben - hB });
    box(2, `${name} – Winkel`, "stahl", x0 - 0.003, x1 + 0.003, hB, hB + 0.06, (z0 + z1) / 2 - 0.02, (z0 + z1) / 2 + 0.02);
  };
  const srUK = (x) => yU(x) - H.b / cos;                                    // Unterkante Stirnriegel
  pfosten("Pfosten links an der Hauswand", xF0, xF0 + H.b, zl0, zl1, wpUK);
  pfosten("Eckpfosten links/Garten", xg0, xg1, zl0, zl0 + H.b, tpUK);
  pfosten("Pfosten Garten Mitte", xg0, xg1, zMitte - H.b / 2, zMitte + H.b / 2, tpUK);
  pfosten("Eckpfosten Garten/Mauer", xg0, xg1, zw1 - H.b, zw1, tpUK);

  // --- 3 Mauerlatte + Ecke -------------------------------------------------------------------
  const mlZ0 = B.zWand, mlZ1 = B.zWand + H.b, mlOK = B.hMauerkrone + H.a;
  box(3, "Mauerlatte (auf die Mauerkrone geklebt)", "holz", xF0, B.xWandEnde, B.hMauerkrone, mlOK, mlZ0, mlZ1, { ...holz, laenge: B.xWandEnde - xF0 });
  const futter = wpUK - mlOK;
  if (futter > 0.005) box(3, `Auflagerklotz für die Wandpfette (${cm(futter)} cm)`, "holz", xF0, xF0 + H.b, mlOK, wpUK, mlZ0 + 0.005, mlZ1 - 0.005, { ...holz, laenge: H.b });
  // Wandpfosten: direkt an die Mauer geklebt, etwas weiter hinten als der Eckpfosten; Netz über Eck dazwischen
  const wz1 = B.zWand - 0.002, wz0 = wz1 - H.b;
  const xw1 = B.xWandEnde, xw0 = xw1 - H.a;                                  // bündig mit dem Mauerende
  const khUK = tpUK - H.b;                                                   // Kopfholz: verbindet Wandpfosten oben mit der Traufpfette
  box(3, "Wandpfosten an die Mauer geklebt", "holz", xw0, xw1, B.hBruestung, khUK, wz0, wz1, { ...holz, laenge: khUK - B.hBruestung });
  box(3, "Kopfholz auf dem Wandpfosten (unter dem Ende der Traufpfette)", "holz", xw0, xg1, khUK, tpUK, wz0, wz1, { ...holz, laenge: xg1 - xw0 });
  // Lochband (dünnes Stahlblech): vom Kopfholz an der Mauer hoch, über die Mauerkante, auf die Mauerlatte geschraubt
  const lbx0 = xw0 + 0.01, lbx1 = xw0 + 0.04;
  box(3, "Lochband Wandpfosten–Mauerlatte (senkrecht)", "stahl", lbx0, lbx1, khUK, mlOK + 0.003, wz1 - 0.003, wz1);
  box(3, "Lochband Wandpfosten–Mauerlatte (auf der Mauerlatte)", "stahl", lbx0, lbx1, mlOK, mlOK + 0.003, wz1 - 0.003, mlZ0 + 0.06);
  // Neben der Mauer ist es offen: Füllholz auf dem Kopfholz bis unter den rechten Sparren
  const spUKmin = Math.min(yU(xw0), yU(xg0)) - H.b / Math.cos(a);
  if (spUKmin - tpUK > 0.02) box(3, "Füllholz auf dem Kopfholz (schließt bis unters Dach)", "holz", xw0, xg0, tpUK, spUKmin - 0.003, wz0, wz1, { ...holz, laenge: xg0 - xw0 });
  const eckA = [xg0, zw1], eckB = [xw1, wz0];                                 // hintere Innenkante Eckpfosten -> Vorderkante Wandpfosten

  // --- 4 Pfetten + Stirnriegel ---------------------------------------------------------------
  const lPf = zPf1 - zPf0;
  const pfette = (name, x0, x1, y0, y1, versatz) => {             // > 3 m: Stück + Ergänzung, versetzt
    if (lPf <= LAGER) { box(4, name, "holz", x0, x1, y0, y1, zPf0, zPf1, { ...holz, laenge: lPf }); return; }
    const zs = versatz ? zPf1 - LAGER : zPf0 + LAGER;
    box(4, `${name}, lang`, "holz", x0, x1, y0, y1, versatz ? zs : zPf0, versatz ? zPf1 : zs, { ...holz, laenge: LAGER });
    box(4, `${name}, Ergänzung`, "holz", x0, x1, y0, y1, versatz ? zPf0 : zs, versatz ? zs : zPf1, { ...holz, laenge: lPf - LAGER });
  };
  pfette("Wandpfette unten (an die Wand geklebt)", xF0, xF1, wpUK, wpUK + H.b, false);
  pfette("Wandpfette oben", xF0, xF1, wpUK + H.b, wpOK, true);
  const tpS = zMitte;                                                         // Traufpfette: Stoß über dem Mittelpfosten
  box(4, "Traufpfette Teil 1", "holz", xg0, xg1, tpUK, tpOK, zPf0, tpS, { ...holz, laenge: tpS - zPf0, schnitt: "Stoß über dem Mittelpfosten" });
  box(4, "Traufpfette Teil 2 (bis zur Mauer, liegt hinten auf dem Kopfholz)", "holz", xg0, xg1, tpUK, tpOK, tpS, wz1, { ...holz, laenge: wz1 - tpS });
  const zr = (zl0 + zl1) / 2, cr = (x) => yU(x) - H.b / cos / 2;
  stab(4, "Stirnriegel links (schräg)", "holz", [xF1, cr(xF1), zr], [xg0, cr(xg0), zr], H.a, H.b, { ...holz, schnitt: `beide Enden ${p.neigung}° schräg` });

  // --- 5 Kopfbänder ------------------------------------------------------------------------------
  const kd = 0.30;
  const kb = (name, A, Bp) => stab(5, name, "holz", A, Bp, H.a, H.a, { ...holz, schnitt: "beide Enden 45°" });
  for (const [z, s, nm] of [[zl0 + H.b, 1, "Ecke links"], [zMitte - H.b / 2, -1, "Mitte 1"], [zMitte + H.b / 2, 1, "Mitte 2"], [zw1 - H.b, -1, "Ecke Mauer"]])
    kb(`Kopfband vorne ${nm}`, [xG, tpUK - kd, z], [xG, tpUK, z + s * kd]);
  kb("Kopfband Hauswand", [xF, wpUK - kd, zl1], [xF, wpUK, zl1 + kd]);
  for (const [x, s, nm] of [[xF0 + H.b, 1, "Hauswand"], [xg0, -1, "Ecke"]])
    kb(`Kopfband links ${nm}`, [x, srUK(x + s * kd) - kd, zr], [x + s * kd, srUK(x + s * kd), zr]);

  // --- 6 Wandanschluss vorab (waagerecht) -----------------------------------------------------
  stab(6, "Wandanschlussprofil mit Dichtlippe (vorab geklebt)", "dicht", [B.xFassade + 0.012, yTop(xP0) + 0.03, zP0], [B.xFassade + 0.012, yTop(xP0) + 0.03, zP1], 0.035, 0.06, { laenge: zP1 - zP0 });

  // --- 7/8 Dachelemente -----------------------------------------------------------------------------
  const xSp0 = xP0, xSp1 = xP1 - 0.03;                                      // Platte steht 3 cm über das Sparrenende
  const cS = (x) => yU(x) - d70 / 2;
  const elementNamen = ["Element links", "Element Mitte", "Element rechts"];
  const elemente = [];
  for (let i = 0; i < PL.anzahl; i++) {
    const z0 = zP0 + i * PL.breite, z1 = z0 + PL.breite;
    const name = elementNamen[i] ?? `Element ${i + 1}`;
    const minY = cS(xSp1) - d70 / 2;
    const e = { vor: { step: 7, dy: 0.85 - minY }, element: name };
    elemente.push(name);
    for (const [zc, seite] of [[z0 + H.a / 2 + 0.003, "links"], [z1 - H.a / 2 - 0.003, "rechts"]])
      stab(8, `${name}: Sparren ${seite}`, "holz", [xSp0, cS(xSp0), zc], [xSp1, cS(xSp1), zc], H.a, H.b, { ...holz, schnitt: `vorne lotrecht ${p.neigung}°, Kerbe ${p.neigung}° über den Pfetten`, ...e });
    const yc = (x) => yTop(x) - t / cos / 2;
    stab(8, `${name}: Platte ${PL.label}`, "platte", [xP0, yc(xP0), (z0 + z1) / 2], [xP1, yc(xP1), (z0 + z1) / 2], PL.breite - 0.006, t, { breite: PL.breite, ...e });
    const rand = (pn, z) => stab(8, `${name}: ${pn}`, "profil", [xP0, yTop(xP0) + 0.006, z], [xP1, yTop(xP1) + 0.006, z], 0.05, 0.012, { laenge: PL.laenge, ...e });
    if (i === 0) rand("Randprofil links", z0 + 0.02);
    if (i < PL.anzahl - 1) rand("H-Verbindungsprofil zum Nachbarelement", z1);
    if (i === PL.anzahl - 1) rand("Randprofil rechts", z1 - 0.02);
    stab(8, `${name}: Tropfprofil + Antistaubband vorne`, "profil", [xP1, yTop(xP1) - 0.012, z0], [xP1, yTop(xP1) - 0.012, z1], 0.02, 0.04, { laenge: PL.breite, ...e });
    box(8, `${name}: Alu-Klebeband oben`, "dicht", xP0 - 0.004, xP0 + 0.006, yTop(xP0) - 0.02, yTop(xP0) + 0.004, z0, z1, e);
    for (const [zc] of [[z0 + 0.25], [z1 - 0.25]]) box(8, `${name}: Rinnenhalter`, "stahl", xSp1 - 0.02, xP1 + 0.10, cS(xSp1) - 0.01, cS(xSp1) + 0.004, zc - 0.012, zc + 0.012, e);
  }
  // Rinne: von innen eingehängt, bevor das Netz an der Gartenseite hängt, mit Gefälle zum Ablauf an der Betonmauer
  const yR = yTop(xP1) - 0.07, rGef = 0.003 * (zP1 - zP0);          // 3 mm pro Meter
  stab(8, "Dachrinne vorne (Gefälle zur Betonmauer)", "rinne", [xP1 + 0.06, yR + rGef, zP0 - 0.02], [xP1 + 0.06, yR, zP1], 0.10, 0.07, { laenge: zP1 - zP0 + 0.02 });
  box(8, "Ablaufstutzen an der Betonmauer (Fallrohr später)", "rinne", xP1 + 0.03, xP1 + 0.09, yR - 0.12, yR - 0.035, zP1 - 0.15, zP1 - 0.09);
  // Füllhölzer zwischen den Sparren über der Traufpfette
  for (let i = 0; i < PL.anzahl; i++) {
    const z0 = zP0 + i * PL.breite + H.a + 0.003, z1 = zP0 + (i + 1) * PL.breite - H.a - 0.003;
    const za = Math.max(z0, zl0), zb = Math.min(z1, wz1);
    if (zb > za + 0.05) box(8, "Füllholz über der Traufpfette", "holz", xg0, xg1, tpOK, yU(xG) - 0.003, za, zb, { ...holz, laenge: zb - za });
  }

  // --- 9 Katzennetz: immer innen am Holz -------------------------------------------------------------
  const xn = xg0 - 0.003, zn = zl1 + 0.003;
  poly(9, "Netz Gartenseite (Balken bis Traufpfette)", "netz", [[xn, hB, zn], [xn, hB, zw0], [xn, tpOK, zw0], [xn, tpOK, zn]]);
  const yNu = B.hBruestung, yNo = khUK;
  poly(9, "Netz über Eck (Eckpfosten bis Wandpfosten)", "netz", [[eckA[0] - 0.003, yNu, eckA[1]], [eckB[0] - 0.003, yNu, eckB[1]], [eckB[0] - 0.003, yNo, eckB[1]], [eckA[0] - 0.003, yNo, eckA[1]]]);
  poly(9, "Netz links (Balken bis Stirnriegel) bis in die Nische", "netz", [[B.xGlas + 0.1, hB - 0.05, zn], [xn, hB - 0.05, zn], [xn, srUK(xn), zn], [xF1, srUK(xF1), zn], [B.xFassade, B.hSturzUK, zn], [B.xGlas + 0.1, B.hSturzUK, zn]]);
  // Streifen über der Mauerkrone: von der Mauerlatte bis zur Unterkante des rechten Sparrens
  const spUK = (x) => yU(x) - d70;
  const xEnde = Math.min(B.xWandEnde, xG - (mlOK + 0.01 - spUK(xG)) / tan);
  if (xEnde > xF1 + 0.05) poly(9, "Netzstreifen über der Mauerkrone", "netz", [[xF1, mlOK, mlZ0 - 0.003], [xEnde, mlOK, mlZ0 - 0.003], [xEnde, Math.max(mlOK, spUK(xEnde)), mlZ0 - 0.003], [xF1, spUK(xF1), mlZ0 - 0.003]]);

  // --- Kennwerte & Prüfungen -----------------------------------------------------------------------
  const sparrenAbstand = PL.breite - H.a - 0.006;
  const maxAbstand = t >= 0.016 ? 1.05 : t >= 0.010 ? 0.80 : 0.60;
  const kennwerte = {
    neigung: p.neigung, gefaelleCmProM: tan * 100,
    hoeheWand: yTop(xP0), hoeheVorne: yTop(xP1), fugeWand: yTop(xP0) + 0.06,
    ueberstand, kopfWand: wpUK, kopfVorne: tpUK, ueberKrone: p.hoeheVorne - B.hMauerkrone,
    plattenAnzahl: PL.anzahl, sparrenAnzahl: 2 * PL.anzahl, sparrenAbstand,
    dachLaenge: zP1 - zP0, dachTiefe: xP1 - xP0, elemente: elemente.length,
  };
  const hinweise = [];
  hinweise.push(p.neigung < 7
    ? { stufe: "warn", text: `Unter 7° bleibt auf Stegplatten leicht Wasser und Laub liegen. Die meisten Hersteller verlangen mindestens 5°.` }
    : { stufe: "ok", text: `${p.neigung}° Neigung nach vorne: ${cm(yTop(xP0) - yTop(xP1))} cm Höhenunterschied auf 2 m Platte.` });
  hinweise.push({ stufe: "ok", text: `Deine 3 Platten ${PL.label} decken ${cm(zP1 - zP0)} cm Breite ab, ohne Querstoß und ohne Zuschnitt. Links stehen sie ${cm(B.zLinksAussen - zP0)} cm über die Brüstung, rechts bleibt 5 mm Luft zur Mauer.` });
  hinweise.push(ueberstand < 0.05
    ? { stufe: "warn", text: `Vorne stehen die Platten nur ${cm(ueberstand)} cm über die Brüstung. Die Rinne braucht etwas Platz, weniger Neigung wählen.` }
    : { stufe: "ok", text: `Vorne stehen die Platten ${cm(ueberstand)} cm über die Brüstung. Die Rinne fängt das Wasser auf, damit nichts auf dein späteres unteres Catio tropft. Der Ablauf sitzt an der Betonmauer.` });
  hinweise.push(sparrenAbstand > maxAbstand + 0.001
    ? { stufe: "warn", text: `Sparrenabstand ${cm(sparrenAbstand)} cm ist für ${Math.round(t * 1000)} mm Platten zu weit. Pro Element einen dritten Sparren einplanen.` }
    : { stufe: "ok", text: `Jedes Element hat zwei Sparren, ${cm(sparrenAbstand)} cm auseinander (Richtwert bis ${cm(maxAbstand)} cm bei ${Math.round(t * 1000)} mm).` });
  hinweise.push({ stufe: "ok", text: `Die Fuge an der Hauswand ist waagerecht auf ${cm(yTop(xP0))} cm, ${yTop(xP0) > B.hSturzOK ? "auf dem Ziegel über dem Betonsturz. Mörtelfugen hinter dem Profil satt mit MS-Polymer füllen." : "auf dem glatten Betonsturz."}` });
  const profilOK = yTop(xP0) + 0.06;
  hinweise.push(profilOK > B.hWandFrei
    ? { stufe: "warn", text: `Das Wandprofil reicht bis ${cm(profilOK)} cm, die Hauswand ist aber nur bis ${cm(B.hWandFrei)} cm frei. Dach vorne tiefer oder flacher bauen.` }
    : { stufe: "ok", text: `Das Wandprofil endet bei ${cm(profilOK)} cm, die Hauswand ist bis ${cm(B.hWandFrei)} cm frei (${cm(B.hWandFrei - profilOK)} cm Reserve).` });
  hinweise.push({ stufe: "ok", text: `Die Rinne fällt 3 mm pro Meter zur Betonmauer. Dort sitzt der Ablaufstutzen, das Fallrohr kann später an der Mauerecke runter.` });
  hinweise.push({ stufe: tpUK < 1.95 ? "warn" : "ok", text: `Kopffreiheit: ${cm(wpUK)} cm unter der Wandpfette, ${cm(tpUK)} cm unter der Traufpfette vorne.` });
  hinweise.push({ stufe: "ok", text: `Elemente: je ca. 12 kg, 2,0 m × 1,05 m. Die Öffnung im Rahmen ist ${cm(xg0 - xF1)} cm tief und 3 m breit. Längs gedreht passen die ersten beiden flach durch und werden oben gedreht, das letzte geht leicht gekippt (ca. 35°) durch die Restöffnung.` });
  hinweise.push({ stufe: "info", text: `Die Wandpfette ist ${cm(lPf)} cm lang. Jede Lage wird einmal gestoßen, die Stöße liegen versetzt an den beiden Auflagern. Verleimt und verschraubt trägt das wie ein Balken.` });
  hinweise.push({ stufe: "ok", text: `Das Netz endet überall an Holz, nie an den Platten. Über der Traufpfette schließen Füllhölzer die Lücken zwischen den Sparren. Befestigt wird von innen: tackern, Klemmleiste drüber.` });
  hinweise.push({ stufe: "ok", text: `Ecke an der Mauer: ${cm(B.zWand - zw1)} × ${cm(B.tiefeEcke)} cm Betonstreifen. Die Mauer endet ${cm(B.xBrAussen - B.xWandEnde)} cm vor der Balkonkante. Der Wandpfosten wird bündig am Mauerende flach an die Mauer geklebt (${cm(xg0 - xw1)} cm hinter dem Eckpfosten) und oben über Kopfholz und Lochband mit Traufpfette und Mauerlatte verbunden. Dazwischen spannt das Netz über Eck (${cm(Math.hypot(eckA[0] - eckB[0], eckB[1] - eckA[1]))} cm breit), seitlich an beide Pfosten getackert, unten mit einer kurzen Klemmleiste auf den Beton geklebt.` });
  hinweise.push(p.hoeheVorne < B.hMauerkrone
    ? { stufe: "info", text: `Vorne liegt die Dachunterkante ${cm(B.hMauerkrone - p.hoeheVorne)} cm unter der Mauerkrone.` }
    : { stufe: "ok", text: `Vorne liegt die Dachunterkante ${cm(p.hoeheVorne - B.hMauerkrone)} cm über der Mauerkrone, hinten an der Hauswand ${cm(yU(xP0) - B.hMauerkrone)} cm darüber.` });

  const masse = [
    { t: "Balken 70×55 auf Brüstung", p: [B.xBrAussen, hB + 0.06, 1.2], ab: 1, bis: 3 },
    { t: `Mauerkrone ${fmt(B.hMauerkrone)} m`, p: [0.0, B.hMauerkrone + 0.06, B.zWand + 0.05], ab: 1, bis: 9 },
    { t: `Ecke ${cm(B.zWand - zw1)} × ${cm(B.tiefeEcke)} cm`, p: [xg1 + 0.05, B.hBruestung + 0.25, (zw1 + B.zWand) / 2], ab: 1, bis: 3 },
    { t: "innenliegendes Geländer", p: [gx, B.hGelaender + 0.06, 0.4], ab: 1, bis: 1 },
    { t: `Hauswand ${fmt(yTop(xP0))} m`, p: [xP0, yTop(xP0) + 0.15, 1.1], ab: 6, bis: 9 },
    { t: `Vorne ${fmt(yTop(xP1))} m`, p: [xP1 + 0.1, yTop(xP1) + 0.1, 1.1], ab: 8, bis: 9 },
    { t: `${p.neigung}° nach vorne`, p: [0.2, yTop(0.2) + 0.12, 0.4], ab: 8, bis: 9 },
    { t: `Rinne`, p: [xP1 + 0.08, yTop(xP1) - 0.18, 2.3], ab: 8, bis: 9 },
  ];

  return { param: p, platte: PL, parts, schritte: SCHRITTE, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p) };
}

function fmt(v) { return v.toFixed(2).replace(".", ","); }
export function cm(v) { return (Math.round(v * 1000) / 10).toLocaleString("de-DE"); }

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

export function einkauf(parts, k, p) {
  const stangen = zuschnitt(parts);
  const mm = Math.round(p.plattenStaerke * 1000);
  const schrauben = k.sparrenAnzahl * (Math.ceil(PLATTE.laenge / 0.4) + 1);
  const L = k.dachLaenge;
  const rand = netzRand(parts);
  const zeilen = [
    { status: "bestellen", teil: `Spenglerschrauben 6,5 × ${mm + 45} mm mit EPDM-Dichtscheibe`, menge: `${schrauben}`, hinweis: `Platte ${mm} mm + Profil + 30–35 mm im Holz, alle ca. 40 cm` },
    { status: "bestellen", teil: "Abstandshalter (Distanzhülsen) für die Plattenschrauben", menge: `${schrauben}`, hinweis: `passend zu ${mm} mm` },
    { status: "bestellen", teil: "Alu-Klebeband, geschlossen", menge: `${cm(L + 0.2)} cm`, hinweis: "obere Plattenkanten an der Hauswand" },
    { status: "bestellen", teil: "Antistaubband, gelocht", menge: `${cm(L + 0.2)} cm`, hinweis: "vordere Plattenkanten" },
    { status: "bestellen", teil: `H-Verbindungsprofil zum Einschieben, für ${mm} mm`, menge: `${PLATTE.anzahl - 1} × ${cm(PLATTE.laenge)} cm`, hinweis: "verbindet die Elemente ohne Schrauben von oben" },
    { status: "bestellen", teil: "Wandanschlussprofil Alu mit Dichtlippe", menge: `${cm(L)} cm`, hinweis: "waagerecht an die Hauswand" },
    { status: "bestellen", teil: "Kompriband 15/3–7 mm", menge: `${cm(L + 0.2)} cm`, hinweis: "hinter dem Wandprofil" },
    { status: "bestellen", teil: "MS-Polymer-Kleb- und Dichtstoff, außen, UV-fest", menge: "5 Kartuschen", hinweis: "Mauerlatte, Wandpfosten, Wandpfette an der Hauswand, Wandprofil, Fuge" },
    { status: "bestellen", teil: "Dachrinne (z. B. Kunststoff halbrund 100) mit 2 Endstücken + Ablaufstutzen", menge: `1 × ${cm(L + 0.05)} cm`, hinweis: "Ablauf rechts an der Betonmauer, Fallrohr später" },
    { status: "bestellen", teil: "Rinnenhalter zum Anschrauben an den Sparren", menge: `${2 * PLATTE.anzahl}`, hinweis: "auf den Böcken vormontieren" },
    { status: "bestellen", teil: "Holzleisten 20×40 als Klemmleisten fürs Netz", menge: `ca. ${Math.ceil(rand * 1.1)} m`, hinweis: "von innen über den Netzrand schrauben" },
    { status: "bestellen", teil: "Edelstahlschrauben 4×40 für die Klemmleisten", menge: `${Math.ceil(rand / 0.25)}`, hinweis: "alle 25 cm" },
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt ${cm(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PLATTE.label}`, menge: `3 von 3`, hinweis: "Stege in Gefällerichtung (zum Garten)" },
    { status: "vorhanden", teil: "Randprofile, Tropfprofil", menge: `2 × ${cm(PLATTE.laenge)} cm, ${cm(L)} cm`, hinweis: "Seitenkanten links und rechts, vordere Kante" },
    { status: "bestellen", teil: "Lochband verzinkt 20 mm", menge: "1 m", hinweis: "Wandpfosten oben mit der Mauerlatte verbinden" },
    { status: "vorhanden", teil: "Winkelverbinder", menge: "ca. 30", hinweis: "Pfosten auf Balken, Pfetten, Stirnriegel" },
    { status: "vorhanden", teil: "Sparrenpfettenanker", menge: `${k.sparrenAnzahl * 2}`, hinweis: "je Sparren einer an jeder Pfette, von unten" },
    { status: "vorhanden", teil: "Holzschrauben 6×120 + Holzleim D3", menge: "ca. 60", hinweis: "Wandpfette alle 20 cm, Kopfbänder" },
    { status: "vorhanden", teil: "Katzenschutznetz + Tacker", menge: `ca. ${Math.ceil(netzFlaeche(parts) * 1.15)} m²`, hinweis: "inkl. 15 % Überlappung" },
    { status: "vorhanden", teil: "2 Arbeitsböcke, 2 Leitern, eine zweite Person", menge: "–", hinweis: "Elemente bauen und einheben" },
  ];
  return { zeilen, stangen };
}

function netzRand(parts) {
  let l = 0;
  for (const n of parts.filter((q) => q.art === "netz"))
    for (let i = 0; i < n.pts.length; i++) { const a = n.pts[i], b = n.pts[(i + 1) % n.pts.length]; l += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); }
  return l;
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
