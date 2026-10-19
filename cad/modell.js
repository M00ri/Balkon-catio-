// Parametrisches Modell des Balkon-Catios – eine Quelle für 3D-Viewer und Stückliste.
//
// Koordinaten in Metern, passend zum ausgerichteten Scan (scan/balkon_scan_ausgerichtet.glb):
//   y nach oben, y = 0 ist der Fliesenboden
//   x von der Hauswand (-) Richtung Garten (+)
//   z entlang des Balkons: links die Brüstung (-), rechts die Betonmauer (+)
//
// Viewer:     index.html importiert baueModell()
// Stückliste: node cad/stueckliste.mjs  ->  docs/stueckliste.md

// ---------------------------------------------------------------------------
// Bestand – aus dem LiDAR-Scan gemessen (ca. ±2 cm, vor dem Zuschnitt nachmessen)
// ---------------------------------------------------------------------------
export const BESTAND = {
  xGlas: -1.08,           // Glasfront, sitzt in einer Nische
  xFassade: -0.76,        // Vorderkante Hauswand (Betonsturz / Ziegel darüber)
  hSturzUK: 2.40,         // Unterkante Sturz = Oberkante Nische
  hSturzOK: 2.57,         // Oberkante Betonsturz, darüber Ziegel
  xBrAussen: 1.10,        // Außenkante Gartenbrüstung
  zLinksAussen: -0.47,    // Außenkante linke Brüstung
  zWand: 2.67,            // Innenseite Betonmauer rechts
  xWandEnde: 0.68,        // Betonmauer endet hier, danach Spalt bis zum Eckpfosten
  hMauerkrone: 2.66,      // Oberkante Betonmauer (flach, nutzbar)
  hBruestung: 0.60,       // Oberkante Betonbrüstung
  hGelaender: 0.80,       // innenliegendes Metallgeländer, Oberkante
  // Bestandsbalken 70×55, auf der Brüstung, mit U-Bügeln am Geländer befestigt
  balken: { b: 0.055, h: 0.07 },
  xBalkenGarten: 0.945,   // Innenkante Gartenbalken
  zBalkenLinks: -0.345,   // Innenkante linker Balken
  zBalkenWand: 2.515,     // Innenkante Balken auf dem Brüstungsstück vor der Mauer (Geländer liegt innen, Balken ca. 10 cm von der Mauer weg)
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 6,             // Dachneigung in Grad, Gefälle nach links (weg von der Betonmauer)
  hoeheLinks: 2.71,       // Unterkante Dachplatte an der linken (tiefen) Seite, knapp über der Mauerkrone
  platte: "2x2",
  plattenStaerke: 0.016,
};

export const PLATTEN = {
  "2x2": { laenge: 2.0, breite: 2.0, label: "2,0 × 2,0 m" },
  "2x1": { laenge: 2.0, breite: 1.0, label: "2,0 × 1,0 m" },
};

export const GRENZEN = {
  neigung: [4, 9, 1],
  hoeheLinks: [2.55, 2.90, 0.01],
  plattenStaerke: [0.008, 0.010, 0.016],
};

const H = { a: 0.055, b: 0.070 };   // Holz 70×55: a = schmal, b = breit
export const HOLZ = "Kantholz 70×55";
export const LAGER = 3.0;
const PLATTEN_VORHANDEN = 3;
const UEBERLAPPUNG = 0.10;          // Querstoß der Platten

export const SCHRITTE = [
  { n: 1, titel: "Bestand", text: "Dein Balkon aus dem LiDAR-Scan. Braun: deine Balken 70×55 auf der Brüstung, mit U-Bügeln am innenliegenden Geländer befestigt. Rechts die Betonmauer mit flacher Krone auf 2,66 m. Sie endet etwa 26 cm vor der Gartenbrüstung." },
  { n: 2, titel: "Pfosten auf den Balken", text: "Fünf Pfosten 70×55 stehen auf deinen Balken: drei auf dem linken Balken (an der Hauswand, in der Mitte, an der Ecke) und zwei weitere auf dem Gartenbalken. Jeder Pfosten bekommt zwei Winkel, die in den Balken geschraubt werden. Nichts steht auf dem Boden." },
  { n: 3, titel: "Mauerlatte und Wandständer", text: "Auf die Krone der Betonmauer kommt eine Mauerlatte, vollflächig mit MS-Polymer verklebt. Darauf stehen kurze Stiele mit einem Wandrähm, damit die hohe Seite des Dachs über der Mauer liegt. Den Spalt am Mauerende schließt ein Wandständer. Weil dein Eckbalken dort rund 10 cm vor der Mauer liegt, steht der Ständer hinter dem Balken auf der Brüstung, direkt am Mauerende. Er wird seitlich an deinen Balken geschraubt, die letzten 3 cm zur Mauer füllt geklebtes Kompriband. Oben verbindet ein Lochband ihn mit der Mauerlatte, ein Riegel hinter dem Eckpfosten verbindet ihn mit dem Eckpfosten." },
  { n: 4, titel: "Traufriegel und Gartenrähm", text: "Links liegt der Traufriegel auf den drei Pfosten, das ist die tiefe Seite des Dachs. Über die Gartenpfosten läuft der Rähm mit dem Dachgefälle. Er besteht aus zwei Stücken, die sich über dem Mittelpfosten treffen, weil 3 m nicht ganz reichen." },
  { n: 5, titel: "Doppelsparren", text: "Die Sparren an der Hauswand und in der Mitte überspannen gut 3 m ohne Stütze. Jeder besteht deshalb aus zwei 70×55 übereinander, verleimt und alle 20 cm verschraubt. Der Doppelsparren an der Hauswand wird zusätzlich mit Raupen aus elastischem MS-Polymer an die Wand geklebt. Das hält ihn ruhig, getragen wird er trotzdem von Pfosten und Mauer. Die Stöße liegen versetzt, je einer nah an jedem Auflager. Unter dem Plattenstoß liegt ein Querriegel." },
  { n: 6, titel: "Kopfbänder", text: "Kopfbänder aus Resten steifen das Gerüst an der linken Seite, an der Gartenseite und unter den Doppelsparren aus. Damit hält es auch Kratzbaum und Liegebretter." },
  { n: 7, titel: "Dachplatten", text: "Die Platten liegen mit den Stegen in Gefällerichtung, also nach links. Die obere Platte überlappt die untere 10 cm, mit Dichtband dazwischen. Oben kommt Alu-Klebeband auf die Kante, unten Antistaubband und ein Tropfprofil. Befestigt wird mit Schrauben mit Dichtscheibe und Abstandshaltern." },
  { n: 8, titel: "Abdichtung an der Hauswand", text: "Entlang der Hauswand läuft die Plattenkante schräg. Ein Wandanschlussprofil wird mit MS-Polymer an die Wand geklebt, dahinter dichtet Kompriband, oben läuft eine Dichtfuge. Die Dichtlippe liegt auf der Platte. So kommt kein Regenwasser an die Hauswand. Siehe Detailzeichnung." },
  { n: 9, titel: "Katzennetz", text: "Netz an der Gartenseite, an der linken Seite bis in die Fensternische, im Spalt zwischen Wandständer und Eckpfosten und als Streifen über der Mauerkrone. Getackert an Pfosten, Riegel und deine Balken." },
];

// ---------------------------------------------------------------------------
export function baueModell(param = {}) {
  const p = { ...DEFAULTS, ...param };
  const B = BESTAND;
  const PL = PLATTEN[p.platte] ?? PLATTEN["2x2"];
  const a = (p.neigung * Math.PI) / 180;
  const tan = Math.tan(a), cos = Math.cos(a);
  const t = p.plattenStaerke;
  const d70 = H.b / cos, d140 = (2 * H.b) / cos;              // Bauteilhöhen lotrecht gemessen

  // Lagen der Balken auf der Brüstung
  const xg0 = B.xBalkenGarten, xg1 = xg0 + B.balken.b;          // Gartenbalken
  const zl1 = B.zBalkenLinks, zl0 = zl1 - B.balken.b;            // linker Balken
  const zw0 = B.zBalkenWand, zw1 = zw0 + B.balken.b;             // Balken vor der Mauer
  const hB = B.hBruestung + B.balken.h;                          // Oberkante Balken

  // Dachfläche: links 8 cm über die Brüstung, rechts bis über die Mauerlatte
  const mlZ0 = B.zWand, mlZ1 = B.zWand + H.b;                    // Mauerlatte 70 breit, 55 hoch
  const mlOK = B.hMauerkrone + H.a;
  const zP0 = B.zLinksAussen - 0.08, zP1 = mlZ1;
  const xP0 = B.xFassade + 0.005, xGartenSoll = B.xBrAussen + 0.10;
  // Höhe: links ist die Unterkante der Platte vorgegeben, nach rechts steigt das Dach an
  const zAufl = mlZ1 - 0.035;
  const zTr0 = (zl0 + zl1) / 2;
  const yU = (z) => p.hoeheLinks + tan * (z - zTr0);              // Unterkante Platte = Oberkante Sparren
  const yTop = (z) => yU(z) + t / cos;

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
  box(1, "Bestandsbalken vor der Mauer", "bestand", 0.45, xg0, B.hBruestung, hB, zw0, zw1);
  // innenliegendes Geländer (schematisch)
  const gx = xg0 - 0.012, gz = zl1 + 0.012, gw = zw0 - 0.012;
  box(1, "Geländer Garten (Bestand)", "geländer", gx - 0.008, gx + 0.008, B.hGelaender - 0.02, B.hGelaender, zl1, zw0);
  box(1, "Geländer links (Bestand)", "geländer", B.xGlas + 0.1, gx, B.hGelaender - 0.02, B.hGelaender, gz - 0.008, gz + 0.008);
  box(1, "Geländer vor der Mauer (Bestand)", "geländer", 0.45, gx, B.hGelaender - 0.02, B.hGelaender, gw - 0.008, gw + 0.008);
  for (let z = zl1 + 0.3; z < zw0; z += 0.75) box(1, "Geländerstütze", "geländer", gx - 0.008, gx + 0.008, B.hBruestung, B.hGelaender, z - 0.008, z + 0.008);

  // --- Sparrenlinien (in x, laufen mit dem Gefälle in z) ----------------------------------------
  const maxAbstand = t >= 0.016 ? 1.05 : t >= 0.010 ? 0.80 : 0.60;   // Richtwerte, Herstellerangabe prüfen
  const nSp = Math.max(1, Math.ceil((xGartenSoll - xP0) / PL.breite - 0.02));
  const xP1 = xP0 + nSp * PL.breite;                                  // Gartenkante der Platten
  const xF = B.xFassade + H.a / 2, xG = xg0 + H.a / 2;                 // Fassaden- und Gartenlinie
  let linien = [xF];
  for (let k = 1; k < nSp; k++) { const xs = xP0 + k * PL.breite; if (xs > xF + 0.1 && xs < xG - 0.1) linien.push(xs); }
  linien.push(xG);
  const xs = [];
  for (let i = 0; i < linien.length - 1; i++) {
    const n = Math.ceil((linien[i + 1] - linien[i]) / maxAbstand - 0.001);
    for (let k = 0; k < n; k++) xs.push(linien[i] + (k * (linien[i + 1] - linien[i])) / n);
  }
  xs.push(xG);
  const innen = xs.slice(0, -1);                                       // Doppelsparren (Fassade + Mitte)

  // --- Höhen der Tragglieder -----------------------------------------------------------------
  const zTr = zTr0;
  const trOK = yU(zTr) - d140, trUK = trOK - H.b;                      // Traufriegel unter den Doppelsparren
  const raUK = (z) => yU(z) - d70;                                     // Gartenrähm (einfach)
  const zMitte = (zl1 + zw0) / 2;

  // --- 2 Pfosten auf den Balken -------------------------------------------------------------
  const pfosten = (name, x0, x1, z0, z1, oben) => {
    box(2, name, "holz", x0, x1, hB, oben, z0, z1, { ...holz, laenge: oben - hB });
    box(2, `${name} – Winkel`, "stahl", x0 - 0.003, x1 + 0.003, hB, hB + 0.06, (z0 + z1) / 2 - 0.02, (z0 + z1) / 2 + 0.02);
  };
  pfosten("Pfosten links an der Hauswand", B.xFassade, B.xFassade + H.b, zl0, zl1, trUK);
  const xL2 = innen[1] ?? (xF + xG) / 2;
  pfosten("Pfosten links Mitte", xL2 - H.b / 2, xL2 + H.b / 2, zl0, zl1, trUK);
  pfosten("Eckpfosten links/Garten", xg0, xg1, zl0, zl0 + H.b, raUK(zl0 + H.b / 2));
  pfosten("Pfosten Garten Mitte", xg0, xg1, zMitte - H.b / 2, zMitte + H.b / 2, raUK(zMitte));
  pfosten("Eckpfosten Garten/Mauer", xg0, xg1, zw1 - H.b, zw1, raUK(zw1 - H.b / 2));

  // --- 3 Mauerlatte + Wandständer + Lückenriegel ------------------------------------------------
  box(3, "Mauerlatte (auf die Mauerkrone geklebt)", "holz", B.xFassade, B.xWandEnde, B.hMauerkrone, mlOK, mlZ0, mlZ1, { ...holz, laenge: B.xWandEnde - B.xFassade });
  // Auflager der hohen Seite: so hoch wie nötig über der Mauerlatte
  const auflOK = yU(zAufl) - d140;
  const luecke = auflOK - mlOK;
  let auflager = "direkt";
  const stielX = () => [B.xFassade + H.a / 2, ...xs.slice(1, -1), B.xWandEnde - H.a / 2];
  if (luecke >= H.b + 0.03) {
    auflager = "stiele";
    box(3, "Wandrähm auf Stielen", "holz", B.xFassade, B.xWandEnde, auflOK - H.b, auflOK, mlZ0, mlZ1, { ...holz, laenge: B.xWandEnde - B.xFassade });
    for (const x of stielX()) box(3, "Stiel auf der Mauerlatte", "holz", x - H.a / 2, x + H.a / 2, mlOK, auflOK - H.b, mlZ0 + 0.0075, mlZ1 - 0.0075, { ...holz, laenge: auflOK - H.b - mlOK });
  } else if (luecke > 0.005) {
    auflager = "futter";
    for (const x of stielX().slice(0, -1)) box(3, "Futterklotz auf der Mauerlatte", "holz", x - H.a / 2, x + H.a / 2, mlOK, auflOK, mlZ0, mlZ1, { ...holz, laenge: H.b });
  } else if (luecke < -0.02) auflager = "zuTief";
  // Wandständer: hinter dem Eckbalken auf der Brüstung, 70 mm in Richtung Mauer, Rest zur Mauer mit Kompriband
  const wz0 = zw1, wz1 = Math.min(B.zWand - 0.01, zw1 + H.b);
  box(3, "Wandständer am Mauerende (an den Eckbalken geschraubt)", "holz", B.xWandEnde - H.a, B.xWandEnde, B.hBruestung, mlOK, wz0, wz1, { ...holz, laenge: mlOK - B.hBruestung });
  box(3, "Wandständer – Schrauben in den Eckbalken", "stahl", B.xWandEnde - H.a + 0.015, B.xWandEnde - 0.015, B.hBruestung + 0.02, hB - 0.02, zw0 + 0.01, wz0 + 0.02);
  if (B.zWand - wz1 > 0.002) box(3, "Kompriband Wandständer–Mauer (geklebt)", "dicht", B.xWandEnde - H.a, B.xWandEnde, B.hBruestung, mlOK, wz1, B.zWand);
  box(3, "Lochband Wandständer–Mauerlatte", "stahl", B.xWandEnde - H.a, B.xWandEnde, mlOK - 0.002, mlOK + 0.002, wz0, mlZ1 - 0.01);
  box(3, "Lückenriegel hinter dem Eckpfosten", "holz", B.xWandEnde, xg1, mlOK - H.b, mlOK, wz0, wz0 + H.a, { ...holz, laenge: xg1 - B.xWandEnde });

  // --- 4 Traufriegel + Gartenrähm ---------------------------------------------------------------
  box(4, "Traufriegel links", "holz", B.xFassade, xg0, trUK, trOK, zl0, zl1, { ...holz, laenge: xg0 - B.xFassade });
  const zR0 = zl0, zR1 = zw1;
  stab(4, "Gartenrähm Teil 1", "holz", [xG, yU(zR0) - d70 / 2, zR0], [xG, yU(zMitte) - d70 / 2, zMitte], H.a, H.b, { ...holz, schnitt: `Stoß über dem Mittelpfosten, Enden lotrecht ${p.neigung}°` });
  stab(4, "Gartenrähm Teil 2", "holz", [xG, yU(zMitte) - d70 / 2, zMitte], [xG, yU(zR1) - d70 / 2, zR1], H.a, H.b, { ...holz, schnitt: `Enden lotrecht ${p.neigung}°` });

  // --- 5 Doppelsparren mit versetzten Stößen ---------------------------------------------------------
  const zS0 = zl0 - 0.03, zS1 = mlZ1 - 0.005;
  const lGes = (zS1 - zS0) / cos;
  const dz = LAGER * cos;                                              // 3 m Stange in z gemessen
  const seg = (step, name, x, z0, z1, lage) => {
    const off = lage === "oben" ? d70 / 2 : 1.5 * d70;
    stab(step, name, "holz", [x, yU(z0) - off, z0], [x, yU(z1) - off, z1], H.a, H.b, { ...holz, schnitt: `Enden lotrecht ${p.neigung}°` });
  };
  innen.forEach((x, i) => {
    const nm = i === 0 ? "Doppelsparren Hauswand (an die Wand geklebt)" : `Doppelsparren Mitte${innen.length > 2 ? " " + i : ""}`;
    if (lGes <= LAGER) { seg(5, `${nm} oben`, x, zS0, zS1, "oben"); seg(5, `${nm} unten`, x, zS0, zS1, "unten"); return; }
    seg(5, `${nm} unten, lang`, x, zS0, zS0 + dz, "unten"); seg(5, `${nm} unten, Ergänzung`, x, zS0 + dz, zS1, "unten");
    seg(5, `${nm} oben, Ergänzung`, x, zS0, zS1 - dz, "oben"); seg(5, `${nm} oben, lang`, x, zS1 - dz, zS1, "oben");
  });
  // Querriegel unter dem Plattenstoß
  const reihen = [];
  { let zo = zP1; while (zo > zP0 + 0.001) { const zu = Math.max(zP0, zo - PL.laenge); reihen.push([zu, zo]); zo = zu + (zu > zP0 ? UEBERLAPPUNG : 0); if (zu <= zP0) break; } }
  const stoesseZ = reihen.slice(0, -1).map(([zu]) => zu + UEBERLAPPUNG / 2);
  stoesseZ.forEach((zq, j) => {
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i] + H.a / 2, x1 = xs[i + 1] - H.a / 2;
      box(5, `Querriegel Plattenstoß ${j + 1}.${i + 1}`, "holz", x0, x1, yU(zq) - H.b, yU(zq), zq - H.a / 2, zq + H.a / 2, { ...holz, laenge: x1 - x0 });
    }
  });

  // --- 6 Kopfbänder -----------------------------------------------------------------------------
  const kd = 0.30;
  const kb = (name, A, Bp) => stab(6, name, "holz", A, Bp, H.a, H.a, { ...holz, schnitt: "beide Enden 45°" });
  for (const [x, s, nm] of [[B.xFassade + H.b, 1, "Hauswand"], [xL2 - H.b / 2, -1, "Mitte 1"], [xL2 + H.b / 2, 1, "Mitte 2"], [xg0, -1, "Ecke"]])
    kb(`Kopfband links ${nm}`, [x, trUK - kd, zTr], [x + s * kd, trUK, zTr]);
  for (const [z, s, nm] of [[zl0 + H.b, 1, "Ecke links"], [zMitte - H.b / 2, -1, "Mitte 1"], [zMitte + H.b / 2, 1, "Mitte 2"], [zw1 - H.b, -1, "Ecke Mauer"]])
    kb(`Kopfband Garten ${nm}`, [xG, raUK(z + s * kd) - kd, z], [xG, raUK(z + s * kd), z + s * kd]);
  for (const [x, nm] of [[xF, "Hauswand"], [xL2, "Mitte"]])
    kb(`Kopfband Doppelsparren ${nm}`, [x, trUK - kd + 0.05, zl1], [x, yU(zl1 + kd) - d140, zl1 + kd]);

  // --- 7 Dachplatten -----------------------------------------------------------------------------
  let nPlatten = 0;
  for (let c = 0; c < nSp; c++) {
    const x0 = xP0 + c * PL.breite, x1 = x0 + PL.breite;
    reihen.forEach(([zu, zo], r) => {
      nPlatten++;
      const lift = r === 0 && reihen.length > 1 ? t / cos : 0;             // obere Platte liegt auf der unteren
      const yc = (z) => yTop(z) - t / cos / 2 + lift;
      const kurz = (zo - zu) / cos < PL.laenge - 0.01;
      stab(7, `Platte ${nPlatten}${kurz ? ` (auf ${cm((zo - zu) / cos)} cm kürzen)` : ""}`, "platte", [(x0 + x1) / 2, yc(zu), zu], [(x0 + x1) / 2, yc(zo), zo], PL.breite - 0.004, t,
        { breite: PL.breite, quer: true });
    });
  }
  const prof = (name, x) => stab(7, name, "profil", [x, yTop(zP0) + 0.006, zP0], [x, yTop(zP1) + 0.006, zP1], 0.05, 0.012);
  prof("Randprofil Gartenseite", xP1 - 0.025);
  for (let c = 1; c < nSp; c++) prof(`Verbindungsprofil ${c}`, xP0 + c * PL.breite);
  stab(7, "Tropfprofil links", "profil", [xP0, yTop(zP0) - 0.012, zP0], [xP1, yTop(zP0) - 0.012, zP0], 0.02, 0.04, { laenge: xP1 - xP0 });

  // --- 8 Abdichtung Hauswand + Mauerkrone -------------------------------------------------------------
  stab(8, "Wandanschlussprofil an der Hauswand (geklebt)", "dicht", [B.xFassade + 0.01, yTop(zP0) + 0.03, zP0], [B.xFassade + 0.01, yTop(zP1) + 0.03, zP1], 0.035, 0.06, { laenge: (zP1 - zP0) / cos });
  box(8, "Abschluss obere Plattenkante über der Mauer", "dicht", xP0, xP1, yTop(zP1) - 0.02, yTop(zP1) + 0.01, zP1 - 0.01, zP1 + 0.01);

  // --- 9 Katzennetz ------------------------------------------------------------------------------
  const xn = xg0 - 0.003, zn = zl1 + 0.003;
  poly(9, "Netz Gartenseite", "netz", [[xn, hB, zn], [xn, hB, zw0], [xn, yU(zw0), zw0], [xn, yU(zn), zn]]);
  poly(9, "Netz links bis in die Nische", "netz", [[B.xGlas + 0.1, hB - 0.05, zn], [xn, hB - 0.05, zn], [xn, yU(zn), zn], [B.xFassade, yU(zn), zn], [B.xFassade, B.hSturzUK, zn], [B.xGlas + 0.1, B.hSturzUK, zn]]);
  const zs = zw1 + 0.002;
  poly(9, "Netz Spalt Wandständer–Eckpfosten", "netz", [[B.xWandEnde, hB - 0.04, zs], [xg0, hB - 0.04, zs], [xg0, yU(zs), zs], [B.xWandEnde, yU(zs), zs]]);
  poly(9, "Netzstreifen über der Mauerkrone", "netz", [[B.xFassade, mlOK, mlZ0 + 0.003], [B.xWandEnde, mlOK, mlZ0 + 0.003], [B.xWandEnde, yU(mlZ0), mlZ0 + 0.003], [B.xFassade, yU(mlZ0), mlZ0 + 0.003]]);

  // --- Kennwerte & Prüfungen -------------------------------------------------------------------------
  const abst = xs.slice(1).map((x, i) => x - xs[i]);
  const fugeLinks = yTop(B.zLinksAussen + 0.14);
  const kopfTuer = yU(0.6) - d140;
  const kennwerte = {
    neigung: p.neigung, gefaelleCmProM: tan * 100,
    hoeheMauer: yTop(zP1), hoeheLinks: yTop(zP0), fugeLinks, unterkanteLinks: p.hoeheLinks,
    ueberKrone: p.hoeheLinks - B.hMauerkrone, auflager, luecke,
    kopfTuer, kopfLinks: trUK,
    plattenAnzahl: nPlatten, reihen: reihen.length, spalten: nSp,
    sparrenAnzahl: xs.length, sparrenAbstand: Math.max(...abst),
    spalt: xg0 - B.xWandEnde, laengeSparren: lGes,
  };
  const hinweise = [];
  hinweise.push(p.neigung < 5
    ? { stufe: "warn", text: `Unter 5° bleibt auf Stegplatten Wasser stehen. Mindestens 5° einplanen.` }
    : { stufe: "ok", text: `${p.neigung}° Neigung nach links: ${cm(yTop(zP1) - yTop(zP0))} cm Höhenunterschied, das Wasser läuft weg von der Betonmauer und tropft links ab.` });
  hinweise.push(fugeLinks < B.hSturzUK + 0.03
    ? { stufe: "warn", text: `Links liegt die Dachkante an der Hauswand nur noch auf ${cm(fugeLinks)} cm. Das ist unter dem Sturz (${cm(B.hSturzUK)} cm) in der Fensternische, dort kann man nicht abdichten. Weniger Neigung wählen.` }
    : { stufe: "ok", text: `Die Fuge an der Hauswand liegt überall auf Wandfläche (links ${cm(fugeLinks)} cm, über dem Sturz bei ${cm(B.hSturzUK)} cm). ${fugeLinks > B.hSturzOK ? "Sie verläuft komplett auf dem Ziegel über dem Betonsturz, die Mörtelfugen mit MS-Polymer satt füllen." : "Rechts auf Ziegel, links auf dem glatten Betonsturz."}` });
  hinweise.push(nPlatten <= PLATTEN_VORHANDEN
    ? { stufe: "ok", text: `${nPlatten} Platten ${PL.label} reichen (du hast ${PLATTEN_VORHANDEN}). ${reihen.length > 1 ? `Eine wird auf ${cm((reihen[reihen.length - 1][1] - reihen[reihen.length - 1][0]) / cos)} cm gekürzt, der Querstoß überlappt 10 cm.` : ""}` }
    : { stufe: "warn", text: `Mit ${PL.label} brauchst du ${nPlatten} Platten, du hast ${PLATTEN_VORHANDEN}. Die Dachfläche ist ${cm((zP1 - zP0) / cos)} × ${cm(xP1 - xP0)} cm, und die Stege müssen in Gefällerichtung liegen.` });
  hinweise.push(Math.max(...abst) > maxAbstand + 0.001
    ? { stufe: "warn", text: `Sparrenabstand ${cm(Math.max(...abst))} cm ist zu weit.` }
    : { stufe: "ok", text: `${xs.length} Sparrenlinien, max. ${cm(Math.max(...abst))} cm Abstand (Richtwert bis ${cm(maxAbstand)} cm bei ${Math.round(t * 1000)} mm).` });
  hinweise.push({ stufe: "info", text: `Die Doppelsparren sind ${cm(lGes)} cm lang, also länger als deine 3-m-Stangen. Jede Lage wird gestoßen, die Stöße liegen versetzt nah an den Auflagern. Verleimt und verschraubt trägt das wie ein durchgehender Balken.` });
  hinweise.push({ stufe: kopfTuer < 2.0 ? "warn" : "ok", text: `Kopffreiheit vor der Tür ${cm(kopfTuer)} cm, links unter dem Traufriegel ${cm(trUK)} cm.` });
  hinweise.push(p.hoeheLinks < B.hMauerkrone
    ? { stufe: "info", text: `Links liegt die Dachunterkante ${cm(B.hMauerkrone - p.hoeheLinks)} cm unter der Mauerkrone.` }
    : { stufe: "ok", text: `Links liegt die Dachunterkante ${cm(p.hoeheLinks - B.hMauerkrone)} cm über der Mauerkrone (${cm(B.hMauerkrone)} cm).` });
  hinweise.push({
    stiele: { stufe: "ok", text: `An der Betonmauer liegen die Sparren auf einem Wandrähm. Er steht auf ${cm(luecke - H.b)} cm hohen Stielen auf der Mauerlatte.` },
    futter: { stufe: "ok", text: `An der Betonmauer liegen die Sparren auf ${cm(luecke)} cm Futterklötzen auf der Mauerlatte.` },
    direkt: { stufe: "ok", text: `An der Betonmauer liegen die Sparren direkt auf der Mauerlatte.` },
    zuTief: { stufe: "warn", text: `So tief würden die Sparren ${cm(-luecke)} cm in die Mauerlatte schneiden. Höher bauen oder weniger Neigung.` },
  }[auflager]);
  hinweise.push({ stufe: "info", text: `Der Doppelsparren an der Hauswand wird zusätzlich mit elastischem MS-Polymer an die Wand geklebt, nicht mit hartem Montagekleber. Holz arbeitet, eine starre Klebung reißt. Die Klebung hält ihn ruhig, tragen tun Pfosten und Mauer.` });
  hinweise.push({ stufe: "info", text: `Bitte prüfen: Ist über der Hauswand bis ${cm(yTop(zP1) + 0.1)} cm Höhe frei (kein Fenster, keine Fensterbank, kein Balkon darüber)?` });
  hinweise.push({ stufe: "ok", text: `Ecke an der Mauer: ${cm(xg0 - B.xWandEnde)} cm Spalt zwischen Mauerende und Eckpfosten, dazu ${cm(B.zWand - zw1)} cm vom Eckbalken bis zur Mauer. Wandständer hinter dem Balken, Riegel und Netz schließen beides.` });
  hinweise.push({ stufe: "info", text: `Die Mauerlatte hält über den Kleber auf der Mauerkrone und die Verschraubung mit dem Wandständer. Vollflächig kleben, 24 h aushärten lassen, erst dann die Sparren auflegen.` });

  const masse = [
    { t: "Balken 70×55 auf Brüstung", p: [B.xBrAussen, hB + 0.06, 1.2], ab: 1, bis: 3 },
    { t: `Mauerkrone ${fmt(B.hMauerkrone)} m`, p: [0.0, B.hMauerkrone + 0.08, B.zWand + 0.05], ab: 1, bis: 3 },
    { t: `Spalt ${cm(xg0 - B.xWandEnde)} cm`, p: [(B.xWandEnde + xg0) / 2, 1.4, zw0], ab: 1, bis: 9 },
    { t: "Sturz OK 2,57 m", p: [B.xFassade - 0.02, B.hSturzOK + 0.06, 1.2], ab: 1, bis: 2 },
    { t: "innenliegendes Geländer", p: [gx, B.hGelaender + 0.06, 0.4], ab: 1, bis: 1 },
    { t: `Mauerkrone ${fmt(B.hMauerkrone)} m`, p: [0.0, B.hMauerkrone + 0.06, B.zWand + 0.05], ab: 4, bis: 9 },
    { t: `Hoch ${fmt(yTop(zP1))} m`, p: [0.2, yTop(zP1) + 0.1, zP1], ab: 5, bis: 9 },
    { t: `Tief ${fmt(yTop(zP0))} m`, p: [0.2, yTop(zP0) + 0.1, zP0], ab: 5, bis: 9 },
    { t: `${p.neigung}° nach links`, p: [0.6, yTop(1.1) + 0.12, 1.1], ab: 5, bis: 9 },
  ];

  return { param: p, platte: PL, parts, schritte: SCHRITTE, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p, PL, { xP0, xP1, zP0, zP1, cos, stoesseZ }) };
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

export function einkauf(parts, k, p, PL, g) {
  const stangen = zuschnitt(parts);
  const lDach = (g.zP1 - g.zP0) / g.cos, bDach = g.xP1 - g.xP0;
  const schrauben = k.sparrenAnzahl * (Math.ceil(lDach / 0.4) + 1) + Math.ceil(bDach / 0.3) * (1 + g.stoesseZ.length);
  const mm = Math.round(p.plattenStaerke * 1000);
  const zeilen = [
    { status: "bestellen", teil: `Spenglerschrauben 6,5 × ${mm + 45} mm mit EPDM-Dichtscheibe`, menge: `${schrauben}`, hinweis: `Platte ${mm} mm + Profil + 30–35 mm im Holz, alle ca. 40 cm` },
    { status: "bestellen", teil: "Abstandshalter (Distanzhülsen) für die Plattenschrauben", menge: `${schrauben}`, hinweis: `passend zu ${mm} mm, verhindern das Eindrücken der Platte` },
    { status: "bestellen", teil: "Alu-Klebeband, geschlossen", menge: `${cm(bDach + 0.2)} cm`, hinweis: "obere Plattenkante (über der Mauer)" },
    { status: "bestellen", teil: "Antistaubband, gelocht", menge: `${cm(bDach * (1 + g.stoesseZ.length) + 0.2)} cm`, hinweis: "untere Kante links + Querstoß" },
    { status: "bestellen", teil: "Butyl-Dichtband 15 mm", menge: `${cm(bDach * g.stoesseZ.length + 0.2)} cm`, hinweis: "zwischen die Platten im Querstoß" },
    { status: "bestellen", teil: "Wandanschlussprofil Alu mit Dichtlippe", menge: `${cm(lDach)} cm`, hinweis: "an der Hauswand, schräg verlegt" },
    { status: "bestellen", teil: "Kompriband 15/3–7 mm", menge: `${cm(lDach + 0.2)} cm`, hinweis: "hinter dem Wandanschlussprofil" },
    { status: "bestellen", teil: "MS-Polymer-Kleb- und Dichtstoff, außen, UV-fest", menge: "6 Kartuschen", hinweis: "Mauerlatte vollflächig, Wandständer, Doppelsparren an der Hauswand, Wandprofil, Fuge oben" },
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt ${cm(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PL.label}`, menge: `${k.plattenAnzahl} von 3`, hinweis: "Stege in Gefällerichtung (nach links)" },
    { status: "vorhanden", teil: "Rand- und Verbindungsprofile", menge: `${1 + k.spalten - 1} × ${cm(lDach)} cm`, hinweis: "Gartenkante, Plattenstöße" },
    { status: "vorhanden", teil: "Tropfprofil", menge: `${cm(bDach)} cm`, hinweis: "linke Plattenkante" },
    { status: "vorhanden", teil: "Winkelverbinder", menge: "ca. 30", hinweis: "Pfosten auf Balken, Riegel, Mauerlatte–Wandständer" },
    { status: "vorhanden", teil: "Sparrenpfettenanker", menge: `${k.sparrenAnzahl * 4}`, hinweis: "Sparren auf Traufriegel und Mauerlatte" },
    { status: "vorhanden", teil: "Holzschrauben 6×120 + Holzleim D3", menge: "ca. 80", hinweis: "Doppelsparren alle 20 cm, Kopfbänder" },
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
