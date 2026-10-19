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
  ohneMittelpfosten: false, // Variante: kein Pfosten vorne in der Mitte, dafür Traufpfette doppelt
  ecke: "riegel",           // Ecke an der Mauer: "riegel" (Netz über Eck mit Eckriegel) oder "kopfholz" (alt)
};

export const PLATTE = { laenge: 2.0, breite: 1.05, label: "2,00 × 1,05 m", anzahl: 3 };

export const GRENZEN = {
  neigung: [5, 12, 1],
  hoeheVorne: [2.60, 2.85, 0.01],
  plattenStaerke: [0.010, 0.016, 0.020],
  ecke: ["riegel", "kopfholz"],
};

const H = { a: 0.055, b: 0.070 };   // Holz 70×55: a = schmal, b = breit
export const HOLZ = "Kantholz 70×55";
export const LAGER = 3.0;

export const SCHRITTE = [
  { n: 1, titel: "Bestand", text: "Dein Balkon aus Scan und Fotos. Braun: deine Balken 70×55 auf der Brüstung, mit U-Bügeln am innenliegenden Geländer. Rechts die Betonmauer mit Krone auf 2,66 m. Sie endet etwa 40 cm vor der Balkonkante. Das Dach fällt nach vorne zum Garten. Jeder Handgriff ist so geplant, dass du ihn von innen machst." },
  { n: 2, titel: "Pfosten auf den Balken", text: "Vier Pfosten 70×55 auf deinen Balken: auf dem linken Balken einer an der Hauswand und einer an der Ecke, auf dem Gartenbalken einer in der Mitte und einer an der Ecke zur Mauer, genau dort, wo dein Geländer um die Ecke geht. Links braucht es keinen Mittelpfosten, weil das Dach nach vorne fällt und dort kaum Last ankommt. Jeder Pfosten bekommt unten zwei Winkel auf gegenüberliegenden Seiten, in Pfosten und Balken geschraubt, und einen U-Bügel um das Geländerrohr. So sitzt er bombenfest. Nichts steht auf dem Boden." },
  { n: 3, titel: "Mauerkrone und Ecke an der Mauer", text: "Das Dach liegt rechts auf deiner Betonmauer: Die Platten sind so gelegt, dass der rechte Sparren genau über der Mauerkrone liegt. Auf die Krone kommen 1 cm hohe Kunststoff-Unterlegplatten, nur punktuell mit MS-Polymer geklebt, damit darunter Wasser abläuft und Luft durchzieht. Hinten an der Hauswand steht darauf ein Auflagerklotz, der das rechte Ende der Wandpfette trägt. In der Ecke ist zwischen deinem Eckbalken und der Mauer ein Betonstreifen von 19 cm Breite und 51 cm Tiefe, die Mauer endet etwa 40 cm vor der Balkonkante. Bündig mit dem Mauerende wird ein Wandpfosten 70×55 auf einer Unterlegplatte flach mit MS-Polymer an die Innenseite der Mauer geklebt. Er klebt auf ganzer Länge an der Betonwand, oben hält ihn im nächsten Schritt der Eckriegel. Zwischen Eckpfosten und Wandpfosten kommt später das Netz über Eck." },
  { n: 4, titel: "Pfetten und Auflager auf der Mauer", text: "Hinten die Wandpfette: zwei 70×55 hochkant übereinander, verleimt und alle 20 cm verschraubt, weil sie 3 m ohne Stütze überspannt. Sie liegt links auf dem Pfosten und rechts auf dem Auflagerklotz auf der Mauer und wird zusätzlich elastisch an die Hauswand geklebt. Vorne die Traufpfette auf den Gartenpfosten, rechts bis zum späteren rechten Sparren. Dann eine Schnur von Pfette zu Pfette über die Mauerkrone spannen: Sie zeigt die Höhe für die Auflagerklötze, auf denen später der rechte Sparren liegt. Klötze oben in Dachneigung schräg schneiden und auf Unterlegplatten setzen. Einen Stirnriegel links braucht es nicht: Dort liegt der linke Sparren des linken Elements genau über deinem Balken. In der Ecke an der Mauer kommt der Eckriegel dazu: ein 70×55, das genau auf der Netzlinie vom Ende der Traufpfette schräg zum Wandpfosten läuft. Vorne mit einem Winkel an die Traufpfette, hinten von oben in den Wandpfosten geschraubt. So ist der Wandpfosten oben fest und das Netz über Eck bekommt oben eine Leiste." },
  { n: 5, titel: "Kopfbänder", text: "Kopfbänder aus Resten steifen vorne und an der Hauswand aus. Die zwei Kopfbänder links kommen nach dem Einbau der Elemente an den linken Sparren. Ab hier steht das Gerüst stabil, auch für Kratzbaum und Liegebretter später." },
  { n: 6, titel: "Wandprofil vorab kleben", text: "Solange oben noch offen ist, kommst du von innen an die Hauswand. Linie mit Schnur oder Laser anzeichnen (Oberkante Platte plus 1 cm), Kompriband an die Wand, Wandanschlussprofil mit MS-Polymer waagerecht ankleben, oben Dichtfuge ziehen. Nach dem Dach kommst du da nicht mehr hin." },
  { n: 7, titel: "Dachelemente auf Böcken bauen", text: "Jede deiner drei Platten wird auf zwei Böcken zu einem Element: zwei Sparren 70×55 darunter, Platte mit Abstandshaltern und Dichtschrauben drauf. Kanten fertig machen: oben an der Wand Alu-Klebeband, vorne Antistaubband, Tropfprofil und Rinnenhalter, außen die Randprofile. An die Kante zum Nachbarelement kommt ein H-Verbindungsprofil." },
  { n: 8, titel: "Elemente einbauen, Rinne einhängen", text: "Ein Element wiegt etwa 12 kg. Längs gedreht flach durch die Öffnung heben, oben um 90° drehen und ablegen: zuerst links, dann die Mitte, die seitlich ins H-Profil geschoben wird. Das rechte kommt zuletzt leicht gekippt durch die Restöffnung. Jedes Element 5 cm vor der Wand absetzen, unter die Dichtlippe schieben, von unten verschrauben. Der rechte Sparren liegt dabei auf den Klötzen auf der Mauer, dort je einen Winkel von innen an Klotz und Sparren. Dann die zwei Kopfbänder links an den linken Sparren, von innen die Rinne in die Halter hängen und die Füllhölzer über der Traufpfette setzen." },
  { n: 9, titel: "Katzennetz von innen", text: "Das Netz hängt überall innen am Holz, nie an den Platten: Gartenseite bis zur Traufpfette, in der Ecke über Eck vom Eckpfosten zum Wandpfosten, oben am Eckriegel, links bis zum linken Sparren und in die Fensternische, rechts ein Streifen von der Mauerkrone bis zum rechten Sparren. Erst tackern, dann eine Klemmleiste drüberschrauben. Alles ist von innen erreichbar." },
];

// Texte, die sich mit den Varianten unter „Planen“ ändern
const VARIANTE_TEXT = {
  2: (t, p) => p.ohneMittelpfosten
    ? t.replace("Vier Pfosten", "Drei Pfosten").replace("einer in der Mitte und ", "").replace("Links braucht es keinen Mittelpfosten, weil das Dach nach vorne fällt und dort kaum Last ankommt.", "Variante ohne Mittelpfosten: vorne ist die Gartenseite frei, dafür wird die Traufpfette doppelt.")
    : t,
  3: (t, p) => p.ecke === "kopfholz"
    ? t.replace("Er klebt auf ganzer Länge an der Betonwand, oben hält ihn im nächsten Schritt der Eckriegel.", "Oben hält ihn ein Kopfholz, das bis unter das Ende der Traufpfette reicht. Ein Füllholz auf dem Kopfholz schließt die Seite bis unters Dach.")
    : t,
  4: (t, p) => {
    let s = t;
    if (p.ohneMittelpfosten) s = s.replace("Vorne die Traufpfette auf den Gartenpfosten,", "Vorne die Traufpfette, ebenfalls doppelt (2 × 70 hochkant, verleimt und verschraubt, Stöße versetzt), weil sie ohne Mittelpfosten von Ecke zu Ecke spannt,");
    if (p.ecke === "kopfholz") s = s.replace(/ In der Ecke an der Mauer kommt der Eckriegel dazu:.*$/, "");
    return s;
  },
  5: (t, p) => p.ohneMittelpfosten ? t.replace("steifen vorne und an der Hauswand", "steifen die vorderen Ecken und die Hauswand") : t,
  9: (t, p) => p.ecke === "kopfholz" ? t.replace(", oben am Eckriegel", "") : t,
};

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

  // Dachfläche: drei Platten nebeneinander, so gelegt, dass der rechte Sparren auf der Mauerkrone liegt
  const zP1 = B.zWand + 0.005 + H.a + 0.003, zP0 = zP1 - PL.anzahl * PL.breite;
  const xP0 = B.xFassade + 0.01, xP1 = xP0 + PL.laenge * cos;
  const ueberstand = xP1 - B.xBrAussen;
  const yU = (x) => p.hoeheVorne + tan * (xG - x);              // Unterkante Platte = Oberkante Sparren
  const yTop = (x) => yU(x) + t / cos;
  const spU = (x) => yU(x) - d70;                                             // Unterkante Sparren

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
  const tpLagen = p.ohneMittelpfosten ? 2 : 1;                             // ohne Mittelpfosten: doppelt wie hinten
  const tpOK = yU(xG) - d70, tpUK = tpOK - tpLagen * H.b;                  // Traufpfette 55×70 bzw. 55×140
  const zPf0 = zP0 - 0.005, zPf1 = zP1 + 0.005;                              // Pfetten von Sparren zu Sparren
  const zMitte = (zl1 + zw0) / 2;

  // --- 2 Pfosten auf den Balken ------------------------------------------------------------
  const winkel = (name, x0, x1, z0, z1, seite) => {                          // Winkel 60×60×40, außen am Pfosten
    const d = 0.003, l = 0.06, w = 0.02, xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
    if (seite === "+z" || seite === "-z") {
      const zf = seite === "+z" ? z1 : z0, sg = seite === "+z" ? 1 : -1;
      box(2, `${name} – Winkel`, "stahl", xc - w, xc + w, hB, hB + l, Math.min(zf, zf + sg * d), Math.max(zf, zf + sg * d));
      box(2, `${name} – Winkel`, "stahl", xc - w, xc + w, hB, hB + d, Math.min(zf, zf + sg * l), Math.max(zf, zf + sg * l));
    } else {
      const xf = seite === "+x" ? x1 : x0, sg = seite === "+x" ? 1 : -1;
      box(2, `${name} – Winkel`, "stahl", Math.min(xf, xf + sg * d), Math.max(xf, xf + sg * d), hB, hB + l, zc - w, zc + w);
      box(2, `${name} – Winkel`, "stahl", Math.min(xf, xf + sg * l), Math.max(xf, xf + sg * l), hB, hB + d, zc - w, zc + w);
    }
  };
  const buegel = (name, x0, x1, z0, z1, gelaender) => {                      // U-Bügel um das Geländerrohr, durch den Pfosten
    const y0 = B.hGelaender - 0.026, y1 = B.hGelaender + 0.006;
    if (gelaender === "garten") {
      const zc = Math.min(Math.max((z0 + z1) / 2, zl1 + 0.012), zw0 - 0.006);
      box(2, `${name} – U-Bügel ans Geländer`, "stahl", gx - 0.012, x1 + 0.004, y0, y1, zc - 0.005, zc + 0.005);
    } else {
      const xc = (x0 + x1) / 2;
      box(2, `${name} – U-Bügel ans Geländer`, "stahl", xc - 0.005, xc + 0.005, y0, y1, z0 - 0.004, gz + 0.012);
    }
  };
  const pfosten = (name, x0, x1, z0, z1, oben, seiten, gelaender) => {
    box(2, name, "holz", x0, x1, hB, oben, z0, z1, { ...holz, laenge: oben - hB });
    for (const sd of seiten) winkel(name, x0, x1, z0, z1, sd);
    buegel(name, x0, x1, z0, z1, gelaender);
  };
  pfosten("Pfosten links an der Hauswand", xF0, xF0 + H.b, zl0, zl1, wpUK, ["+x"], "links");
  pfosten("Eckpfosten links/Garten", xg0, xg1, zl0, zl0 + H.b, tpUK, ["+z", "-x"], "garten");
  if (!p.ohneMittelpfosten) pfosten("Pfosten Garten Mitte", xg0, xg1, zMitte - H.b / 2, zMitte + H.b / 2, tpUK, ["+z", "-z"], "garten");
  const zEck = [zw1 - H.b, zw1];                                              // Eckpfosten Garten/Mauer, am Geländereck
  pfosten("Eckpfosten Garten/Mauer", xg0, xg1, zEck[0], zEck[1], tpUK, ["-z", "-x"], "garten");
  const wz1 = B.zWand - 0.002, wz0 = wz1 - H.b;                              // Wandpfosten an der Mauer

  // --- 3 Auflager auf der Mauerkrone + Ecke ----------------------------------------------------------
  const PAD = 0.01;                                                         // Unterlegplatten: Wasser läuft darunter ab
  const kUK = B.hMauerkrone + PAD, kz0 = B.zWand + 0.005, kz1 = kz0 + H.a;   // genau unter dem rechten Sparren
  const pad = (step, x0, x1) => box(step, "Unterlegplatte 1 cm (punktuell geklebt)", "stahl", x0, x1, B.hMauerkrone, kUK, kz0 + 0.003, kz1 - 0.003);
  pad(3, xF0 + 0.005, xF1 - 0.005);
  box(3, `Auflagerklotz für die Wandpfette (${cm(wpUK - kUK)} cm)`, "holz", xF0, xF1, kUK, wpUK, kz0, kz1, { ...holz, laenge: wpUK - kUK });
  for (const x of [-0.30, 0.20, B.xWandEnde - 0.05]) {
    const h = spU(x) - kUK;
    pad(4, x - 0.03, x + 0.03);
    if (h >= 0.03) box(4, `Auflagerklotz für den rechten Sparren (${cm(h)} cm)`, "holz", x - H.b / 2, x + H.b / 2, kUK, spU(x) - 0.002, kz0, kz1, { ...holz, laenge: h, schnitt: `oben ${p.neigung}° schräg` });
    else box(4, `Ausgleich unter dem rechten Sparren (${cm(h)} cm Unterlegplatten)`, "stahl", x - 0.03, x + 0.03, kUK, spU(x) - 0.002, kz0 + 0.003, kz1 - 0.003);
  }
  // Wandpfosten: direkt an die Mauer geklebt, etwas weiter hinten als der Eckpfosten
  const xw1 = B.xWandEnde, xw0 = xw1 - H.a;                                  // bündig mit dem Mauerende
  const eckA = [xg0, zw1], eckB = [xw1, wz0];                                 // hintere Innenkante Eckpfosten -> Vorderkante Wandpfosten
  const eckL = Math.hypot(eckA[0] - eckB[0], eckB[1] - eckA[1]);
  let wpfOK, netzOben;                                                        // Oberkante Wandpfosten, Oberkante Netz über Eck
  if (p.ecke === "riegel") {
    // Eckriegel genau auf der Netzlinie: oben bündig mit den Sparrenunterkanten, vorne an die Traufpfette, hinten auf den Wandpfosten
    const d = [(eckB[0] - eckA[0]) / eckL, (eckB[1] - eckA[1]) / eckL], n = [d[1], -d[0]];  // n zeigt nach außen
    const off = (P, s, t) => [P[0] + n[0] * s + d[0] * t, P[1] + n[1] * s + d[1] * t];
    const rA = off(eckA, H.a / 2, -(H.a / 2) * n[0] / d[0]), rB = off(eckB, H.a / 2, 0.02);
    const ry = (x) => spU(x) - H.b / 2;
    stab(4, "Eckriegel auf der Netzlinie (Traufpfette bis Wandpfosten)", "holz", [rA[0], ry(rA[0]), rA[1]], [rB[0], ry(rB[0]), rB[1]], H.a, H.b, { ...holz, schnitt: "vorne und hinten schräg nach Anriss" });
    box(4, "Winkel Eckriegel an die Traufpfette", "stahl", xg0 - 0.003, xg0, ry(xg0) - 0.03, ry(xg0) + 0.03, rA[1] - 0.02, rA[1] + 0.02);
    wpfOK = spU(xw1) - H.b;
    netzOben = [spU(eckA[0]) - H.b, wpfOK];
    // darüber bis unter die Platte: Füllholz bis an den rechten Sparren
    const zSp = zP1 - H.a - 0.003;                                            // Innenkante rechter Sparren
    const tF = Math.min(1, Math.max(0, (zSp - H.a / 2 - rA[1]) / (rB[1] - rA[1])));
    const fB = [rA[0] + (rB[0] - rA[0]) * tF, rA[1] + (rB[1] - rA[1]) * tF];
    const fy = (x) => spU(x) + H.b / 2;
    if (tF > 0.2) stab(8, "Füllholz auf dem Eckriegel (bis unter die Platte)", "holz", [rA[0], fy(rA[0]) - 0.003, rA[1]], [fB[0], fy(fB[0]) - 0.003, fB[1]], H.a, H.b, { ...holz, schnitt: "schräg nach Anriss" });
  } else {
    const khUK = tpUK - H.b;                                                   // Kopfholz: verbindet Wandpfosten oben mit der Traufpfette
    box(3, "Kopfholz auf dem Wandpfosten (unter dem Ende der Traufpfette)", "holz", xw0, xg1, khUK, tpUK, wz0, wz1, { ...holz, laenge: xg1 - xw0 });
    const spUKmin = Math.min(yU(xw0), yU(xg0)) - H.b / Math.cos(a);
    if (spUKmin - tpUK > 0.02) box(3, "Füllholz auf dem Kopfholz (schließt bis unters Dach)", "holz", xw0, xg0, tpUK, spUKmin - 0.003, wz0, wz1, { ...holz, laenge: xg0 - xw0 });
    wpfOK = khUK;
    netzOben = [khUK, khUK];
  }
  box(3, "Wandpfosten an die Mauer geklebt", "holz", xw0, xw1, B.hBruestung + 0.01, wpfOK, wz0, wz1, { ...holz, laenge: wpfOK - B.hBruestung - 0.01 });
  box(3, "Unterlegplatte 1 cm unter dem Wandpfosten", "stahl", xw0, xw1, B.hBruestung, B.hBruestung + 0.01, wz0 + 0.005, wz1 - 0.005);

  // --- 4 Pfetten + Klötze --------------------------------------------------------------------
  const lPf = zPf1 - zPf0;
  const pfette = (name, x0, x1, y0, y1, versatz, za = zPf0, zb = zPf1) => {   // > 3 m: Stück + Ergänzung, versetzt
    const l = zb - za;
    if (l <= LAGER) { box(4, name, "holz", x0, x1, y0, y1, za, zb, { ...holz, laenge: l }); return; }
    const zs = versatz ? zb - LAGER : za + LAGER;
    box(4, `${name}, lang`, "holz", x0, x1, y0, y1, versatz ? zs : za, versatz ? zb : zs, { ...holz, laenge: LAGER });
    box(4, `${name}, Ergänzung`, "holz", x0, x1, y0, y1, versatz ? za : zs, versatz ? zs : zb, { ...holz, laenge: l - LAGER });
  };
  pfette("Wandpfette unten (an die Wand geklebt)", xF0, xF1, wpUK, wpUK + H.b, false);
  pfette("Wandpfette oben", xF0, xF1, wpUK + H.b, wpOK, true);
  if (p.ohneMittelpfosten) {                                                  // doppelt, Stöße versetzt an den Eckpfosten
    pfette("Traufpfette unten", xg0, xg1, tpUK, tpUK + H.b, false);
    pfette("Traufpfette oben", xg0, xg1, tpUK + H.b, tpOK, true);
  } else {
    const tpS = zMitte;                                                       // Traufpfette: Stoß über dem Mittelpfosten
    box(4, "Traufpfette Teil 1", "holz", xg0, xg1, tpUK, tpOK, zPf0, tpS, { ...holz, laenge: tpS - zPf0, schnitt: "Stoß über dem Mittelpfosten" });
    box(4, `Traufpfette Teil 2 (bis zum rechten Sparren, ${p.ecke === "riegel" ? "kragt über den Eckpfosten aus" : "liegt hinten auf dem Kopfholz"})`, "holz", xg0, xg1, tpUK, tpOK, tpS, zPf1, { ...holz, laenge: zPf1 - tpS });
  }
  const zr = zP0 + 0.003 + H.a / 2;                                          // linker Sparren des linken Elements

  // --- 5 Kopfbänder ------------------------------------------------------------------------------
  const kd = 0.30;
  const kb = (name, A, Bp, step = 5) => stab(step, name, "holz", A, Bp, H.a, H.a, { ...holz, schnitt: "beide Enden 45°" });
  const kbVorne = [[zl0 + H.b, 1, "Ecke links"], [zMitte - H.b / 2, -1, "Mitte 1"], [zMitte + H.b / 2, 1, "Mitte 2"], [zEck[0], -1, "Ecke Mauer"]];
  for (const [z, s, nm] of kbVorne.filter((k) => !p.ohneMittelpfosten || !k[2].startsWith("Mitte")))
    kb(`Kopfband vorne ${nm}`, [xG, tpUK - kd, z], [xG, tpUK, z + s * kd]);
  kb("Kopfband Hauswand", [xF, wpUK - kd, zl1], [xF, wpUK, zl1 + kd]);
  for (const [x, s, nm] of [[xF0 + H.b, 1, "Hauswand"], [xg0, -1, "Ecke"]])
    kb(`Kopfband links ${nm} (an den linken Sparren)`, [x, spU(x + s * kd) - kd, zr], [x + s * kd, spU(x + s * kd), zr], 8);

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
    const za = Math.max(z0, zl0), zb = Math.min(z1, zPf1);
    if (zb > za + 0.05) box(8, "Füllholz über der Traufpfette", "holz", xg0, xg1, tpOK, yU(xG) - 0.003, za, zb, { ...holz, laenge: zb - za });
  }

  // --- 9 Katzennetz: immer innen am Holz -------------------------------------------------------------
  const xn = xg0 - 0.003, zn = zl1 + 0.003;
  poly(9, "Netz Gartenseite (Balken bis Traufpfette)", "netz", [[xn, hB, zn], [xn, hB, zw0], [xn, tpOK, zw0], [xn, tpOK, zn]]);
  const yNu = B.hBruestung;
  poly(9, "Netz über Eck (Eckpfosten bis Wandpfosten)", "netz", [[eckA[0] - 0.003, yNu, eckA[1]], [eckB[0] - 0.003, yNu, eckB[1]], [eckB[0] - 0.003, netzOben[1], eckB[1]], [eckA[0] - 0.003, netzOben[0], eckA[1]]]);
  poly(9, "Netz links (Balken bis linker Sparren) bis in die Nische", "netz", [[B.xGlas + 0.1, hB - 0.05, zn], [xn, hB - 0.05, zn], [xn, spU(xn), zn], [xF1, spU(xF1), zn], [B.xFassade, B.hSturzUK, zn], [B.xGlas + 0.1, B.hSturzUK, zn]]);
  // Streifen über der Mauerkrone: von der Krone bis zur Unterkante des rechten Sparrens (unten Klemmleiste an die Mauer geklebt)
  const zs = B.zWand - 0.003;
  poly(9, "Netzstreifen über der Mauerkrone (bis zum rechten Sparren)", "netz", [[xF1, B.hMauerkrone, zs], [B.xWandEnde, B.hMauerkrone, zs], [B.xWandEnde, spU(B.xWandEnde), zs], [xF1, spU(xF1), zs]]);

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
  hinweise.push({ stufe: "ok", text: `Deine 3 Platten ${PL.label} decken ${cm(zP1 - zP0)} cm Breite ab, ohne Querstoß und ohne Zuschnitt. Rechts liegt der äußere Sparren auf der Mauerkrone, die Platte steht ${cm(zP1 - B.zWand)} cm über die Mauer. Links liegt der Sparren über deinem Balken, die Plattenkante endet ${cm(zP0 - B.zLinksAussen)} cm vor der Außenkante der Brüstung.` });
  hinweise.push({ stufe: "ok", text: `Das Dach liegt rechts auf der Betonmauer: Wandpfette und rechter Sparren stehen auf Klötzen auf der Krone, auf 1-cm-Unterlegplatten. Die Mauer trägt die rechte Dachkante, die Pfosten tragen den Rest. Bitte prüfen: Die Mauerkrone muss mindestens ${cm(kz1 - B.zWand + 0.01)} cm breit sein.` });
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
  hinweise.push({ stufe: "ok", text: `Ecke an der Mauer: ${cm(B.zWand - zw1)} × ${cm(B.tiefeEcke)} cm Betonstreifen, die Mauer endet ${cm(B.xBrAussen - B.xWandEnde)} cm vor der Balkonkante. ${`Der Wandpfosten wird bündig am Mauerende flach an die Mauer geklebt (${cm(xg0 - xw1)} cm hinter dem Eckpfosten). ` + (p.ecke === "riegel"
    ? `Oben liegt der Eckriegel genau auf der Netzlinie: vorne mit einem Winkel an der Traufpfette, hinten auf dem Wandpfosten verschraubt, direkt unter dem rechten Sparren. Das Netz über Eck (${cm(eckL)} cm breit) hat so an allen vier Seiten Holz bzw. Beton. Ein Füllholz auf dem Eckriegel schließt bis unter die Platte.`
    : `Oben verbindet ihn das Kopfholz mit der Traufpfette. Achtung: Das Kopfholz liegt an der Mauer, nicht auf der Netzlinie. Die Oberkante des Netzes über Eck (${cm(eckL)} cm) hat so keine Leiste, darüber bleibt ein Spalt bis zum Dach.`)}` });
  {
    // Durchbiegung Traufpfette grob: 1,0 kN/m² (Schnee + Dach) auf die halbe Dachtiefe, E = 11 000 N/mm²
    const q = 1.0 * (xG - xF) / 2, L = p.ohneMittelpfosten ? (zEck[0] + zEck[1]) / 2 - (zl0 + H.b / 2) : Math.max(zMitte - zl0, zEck[1] - zMitte);
    const I = (H.a * Math.pow(tpLagen * H.b, 3)) / 12, f = (5 * q * 1000 * Math.pow(L, 4)) / (384 * 11e9 * I);
    const sigma = ((q * L * L) / 8) / ((H.a * Math.pow(tpLagen * H.b, 2)) / 6) / 1000;   // N/mm²
    hinweise.push({ stufe: f > L / 200 ? "warn" : "ok", text: p.ohneMittelpfosten
      ? `Ohne Mittelpfosten spannt die doppelte Traufpfette (55×140, verleimt und verschraubt) ${cm(L)} cm frei. Grob gerechnet biegt sie sich unter Schnee ${(f * 1000).toFixed(0)} mm durch (${sigma.toFixed(0)} N/mm²). Dafür ist vorne die Kopffreiheit ${cm(H.b)} cm niedriger und es braucht mehr Holz.`
      : `Mit dem Mittelpfosten spannt die einfache Traufpfette nur ${cm(L)} cm. Grob gerechnet biegt sie sich unter Schnee ${(f * 1000).toFixed(0)} mm durch (${sigma.toFixed(0)} N/mm²). Der Stoß sitzt über dem Mittelpfosten.` });
  }
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

  const schritte = SCHRITTE.map((st) => ({ ...st, text: (VARIANTE_TEXT[st.n] ?? ((t) => t))(st.text, p) }));
  return { param: p, platte: PL, parts, schritte, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p) };
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
    { status: "bestellen", teil: "MS-Polymer-Kleb- und Dichtstoff, außen, UV-fest", menge: "5 Kartuschen", hinweis: "Unterlegplatten, Wandpfosten, Wandpfette an der Hauswand, Wandprofil, Fuge" },
    { status: "bestellen", teil: "Kunststoff-Unterlegplatten (Terrassenpads) 10 mm", menge: "1 Pack (mind. 6)", hinweis: "unter den Klötzen auf der Mauer und dem Wandpfosten, Wasser läuft darunter ab" },
    { status: "bestellen", teil: "U-Bügel (Rundstahlbügel M8) mit Gegenplatte, passend zum Geländerrohr", menge: `${parts.filter((q) => q.name.endsWith("U-Bügel ans Geländer")).length}`, hinweis: "je tragender Pfosten einer, Rohrdurchmesser messen; hast du sie schon, nur prüfen" },
    { status: "bestellen", teil: "Dachrinne (z. B. Kunststoff halbrund 100) mit 2 Endstücken + Ablaufstutzen", menge: `1 × ${cm(L + 0.05)} cm`, hinweis: "Ablauf rechts an der Betonmauer, Fallrohr später" },
    { status: "bestellen", teil: "Rinnenhalter zum Anschrauben an den Sparren", menge: `${2 * PLATTE.anzahl}`, hinweis: "auf den Böcken vormontieren" },
    { status: "bestellen", teil: "Holzleisten 20×40 als Klemmleisten fürs Netz", menge: `ca. ${Math.ceil(rand * 1.1)} m`, hinweis: "von innen über den Netzrand schrauben" },
    { status: "bestellen", teil: "Edelstahlschrauben 4×40 für die Klemmleisten", menge: `${Math.ceil(rand / 0.25)}`, hinweis: "alle 25 cm" },
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt ${cm(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PLATTE.label}`, menge: `3 von 3`, hinweis: "Stege in Gefällerichtung (zum Garten)" },
    { status: "vorhanden", teil: "Randprofile, Tropfprofil", menge: `2 × ${cm(PLATTE.laenge)} cm, ${cm(L)} cm`, hinweis: "Seitenkanten links und rechts, vordere Kante" },
    { status: "vorhanden", teil: "Winkelverbinder mit Sicke, ca. 60×60×40", menge: "ca. 30", hinweis: "je Pfosten zwei auf gegenüberliegenden Seiten, Eckriegel, Klötze an der Mauer" },
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
