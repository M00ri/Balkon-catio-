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
  hSturzOK: 2.78,         // Oberkante der glatten Betonfläche an der Hauswand, darüber Ziegel (stehen minimal vor), gemessen
  xBrAussen: 1.10,        // Außenkante Gartenbrüstung
  zLinksAussen: -0.40,    // Außenkante linke Brüstung (an deine 3,00-m-Querbalken angepasst)
  zWand: 2.67,            // Innenseite Betonmauer rechts
  xWandEnde: 0.70,        // Betonmauer endet ca. 40 cm vor der Balkonkante (Foto + Scan)
  hMauerkrone: 2.564,     // Oberkante Betonmauer (gemessen: 261,9 − 5,5 cm)
  mauerBalken: 0.055,     // darauf liegt dein Balken flach (5,5 cm hoch), oben 261,9 cm = so hoch wie der Pfosten links
  hWandFrei: 3.10,        // Hauswand ist bis hier frei (gemessen)
  hBruestung: 0.60,       // Oberkante Betonbrüstung
  hGelaender: 0.80,       // innenliegendes Metallgeländer, Oberkante
  // deine Balken 70×55 auf der Brüstung, mit U-Bügeln am Geländer befestigt
  balken: { b: 0.055, h: 0.055 },  // deine Balken liegen flach auf der Brüstung: 5,5 cm hoch
  eckEinzug: 0.055,       // die vorderen Eckpfosten stehen 5,5 cm von der Balkenecke nach innen (U-Bügel ans Geländer)
  xBalkenGarten: 0.945,   // Innenkante Gartenbalken
  zBalkenLinks: -0.275,   // Innenkante linker Balken = Außenseite der linken Pfosten (von dort bis Mauer-Innenseite 2,945 m)
  querbalken: 3.00,       // alle Querbalken genau 3 m: von der Außenseite der linken Pfosten bis 5,5 cm auf die Mauer (gemessen)
  zBalkenWand: 2.425,     // Innenkante Eckbalken vor der Mauer (19 cm Beton bis zur Mauer, gemessen)
  tiefeEcke: 0.51,        // Brüstungsstück vor der Mauer: 51 cm tief (von der Außenkante nach innen)
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 7,             // Dachneigung in Grad, Gefälle nach vorne zum Garten (7°: untere Lage der Wandpfette genau auf dem glatten Beton)
  hoeheVorne: 2.69,       // Unterkante Platte über der vorderen Pfette (so liegt die Wandpfette hinten auf Pfosten und Mauerbalken, 261,9 cm)
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
  { n: 1, titel: "Bestand", text: "Dein Balkon aus Scan und Fotos. Braun: deine Balken 70×55 flach auf der Brüstung (5,5 cm hoch), mit U-Bügeln am innenliegenden Geländer. Rechts die Betonmauer mit Krone auf 2,56 m. Sie endet etwa 40 cm vor der Balkonkante. Das Dach fällt nach vorne zum Garten. Jeder Handgriff ist so geplant, dass du ihn von innen machst." },
  { n: 2, titel: "Pfosten auf den Balken", text: "Vier Pfosten 70×55: links an der Hauswand einer, der bis auf den Boden geht (oben 261,9 cm, so hoch wie dein Balken auf der Mauerkrone, direkt an deinem Balken: dort zwei Schrauben 6×120 seitlich durch den Pfosten in den Balken, das Geländer geht dort nicht durch), vorne links einer an der Ecke, auf dem Gartenbalken einer in der Mitte und einer an der Ecke zur Mauer, genau dort, wo dein Geländer um die Ecke geht. Die beiden vorderen Eckpfosten stehen 5,5 cm von der Balkenecke nach innen, damit die U-Bügel ans Geländer passen. Dort hat dein Gartenbalken je eine Lücke, die Pfosten stehen direkt auf dem Beton und werden oben mit Winkeln auf die Balkenenden links und rechts geschraubt. Der linke steht so genau in einer Linie mit dem Pfosten an der Hauswand. Links braucht es keinen Mittelpfosten, weil das Dach nach vorne fällt und dort kaum Last ankommt. Die Pfosten auf den Balken bekommen unten zwei Winkel auf gegenüberliegenden Seiten, in Pfosten und Balken geschraubt, und einen U-Bügel um das Geländerrohr. So sitzt alles bombenfest." },
  { n: 3, titel: "Mauerkrone und Ecke an der Mauer", text: "Rechts stehen die Platten ein Stück über deine Betonmauer, damit der Regen außen auf die Mauer abläuft. Das Dach liegt aber nicht auf der Mauer: Auch der rechte Dachbalken wird nur von den beiden Querbalken getragen. Auf der Krone liegt dein Balken flach (5,5 cm hoch), oben auf 261,9 cm. Auf ihm liegt rechts die Wandpfette, links liegt sie auf deinem Pfosten an der Hauswand, beide auf 261,9 cm. Mit der Wasserwaage prüfen. In der Ecke ist zwischen deinem Eckbalken und der Mauer ein Betonstreifen von 19 cm Breite und 51 cm Tiefe, die Mauer endet etwa 40 cm vor der Balkonkante. Bündig mit dem Mauerende wird ein Wandpfosten 70×55 auf einer Unterlegplatte flach mit MS-Polymer an die Innenseite der Mauer geklebt. Er klebt auf ganzer Länge an der Betonwand und reicht oben bis zur Oberkante deines Balkens auf der Mauer (261,9 cm). Dort wird er mit einem Lochblech über beide Oberseiten an diesem Balken festgeschraubt. Unten kommt zwischen das Ende deines Eckbalkens und den Wandpfosten eine kurze Schwelle: ein 70×55 flach auf den Betonstreifen, auf einer Unterlegplatte punktuell geklebt, beide Enden schräg nach Anriss, vorne mit einem Winkel an den Eckbalken und hinten an den Wandpfosten geschraubt. Daran wird später das Netz über Eck unten befestigt." },
  { n: 4, titel: "Pfetten und Auflager auf der Mauer", text: "Hinten die Wandpfette: zwei 70×55 hochkant übereinander: zwei Raupen Fix ALL dazwischen und sofort alle 20 cm mit 6×120 verschrauben, versetzt. 24 Stunden aushärten lassen. Sie liegt links auf dem Pfosten und rechts direkt auf der Mauerkrone. Beide Lagen liegen an der glatten Betonfläche der Hauswand und werden dort zusätzlich punktuell angeklebt. An der Hauswand wird also nichts über der glatten Betonfläche befestigt, außer später dem schmalen Dichtprofil über der Platte. Vorne die Traufpfette auf den Gartenpfosten, rechts bis zum späteren rechten Sparren. Einen Stirnriegel links braucht es nicht: Dort liegt der linke Sparren des linken Elements genau über deinem Balken. In der Ecke an der Mauer kommt der Eckriegel dazu: ein 70×55, das genau auf der Netzlinie vom Ende der Traufpfette schräg zum Wandpfosten läuft. Vorne mit einem Winkel an die Traufpfette, hinten stumpf vorne an den Wandpfosten gestoßen und mit einem Winkel seitlich daran geschraubt. Der Wandpfosten selbst ist oben am Balken auf der Mauer festgeschraubt, das Netz über Eck bekommt am Eckriegel oben eine Leiste." },
  { n: 5, titel: "Kopfbänder", text: "Kopfbänder aus Resten steifen vorne und an der Hauswand aus. Die zwei Kopfbänder links kommen nach dem Einbau der Elemente an den linken Sparren. Ab hier steht das Gerüst stabil, auch für Kratzbaum und Liegebretter später." },
  { n: 6, titel: "Wandprofil vorab kleben", text: "Solange oben noch offen ist, kommst du von innen an die Hauswand. Linie mit Schnur oder Laser anzeichnen (Oberkante Platte plus 1 cm), Kompriband an die Wand, Wandanschlussprofil mit MS-Polymer waagerecht ankleben, oben Dichtfuge ziehen. Nach dem Dach kommst du da nicht mehr hin." },
  { n: 7, titel: "Dachelemente auf Böcken bauen", text: "Jede deiner drei Platten wird auf zwei Böcken zu einem Element: zwei Sparren 70×55 darunter, Platte mit Abstandshaltern und Dichtschrauben drauf. Unter das hintere Ende jedes Sparrens kommt ein 7 cm hoher Klotz (Reststück 70×55, ca. 9 cm lang), mit zwei Schrauben von der Seite angeschraubt. Mit diesem Klotz liegt das Element später auf der Wandpfette. So bekommt das Dach seine 7° Gefälle, ohne dass an der Hauswand ein dritter Balken nötig ist. Kanten fertig machen: oben an der Wand Alu-Klebeband, vorne Antistaubband, Tropfprofil und Rinnenhalter, außen die Randprofile. An die Kante zum Nachbarelement kommt ein H-Verbindungsprofil." },
  { n: 8, titel: "Elemente einbauen, Rinne einhängen", text: "Ein Element wiegt etwa 12 kg. Längs gedreht flach durch die Öffnung heben, oben um 90° drehen und ablegen: zuerst links, dann die Mitte, die seitlich ins H-Profil geschoben wird. Das rechte kommt zuletzt leicht gekippt durch die Restöffnung. Jedes Element 5 cm vor der Wand absetzen, unter die Dichtlippe schieben, von unten verschrauben. Dann die zwei Kopfbänder links an den linken Sparren, von innen die Rinne in die Halter hängen und die Füllhölzer über der Traufpfette setzen." },
  { n: 9, titel: "Katzennetz von innen", text: "Das Netz kommt nicht innen vor die Hölzer, sondern Feld für Feld zwischen sie, wie eine Fensterscheibe. Pro Feld ein Netzstück mit 5 cm Rand zuschneiden. Den Rand auf die Seitenflächen der Pfosten, die Unterseite des Querbalkens und die Oberseite deines Balkens tackern, möglichst weit außen, dann eine Leiste 20×20 außen bündig drüberschrauben. Das Netz sitzt so nur 2 cm hinter der Außenkante, und alle Innenseiten bleiben frei für spätere Wandelemente. Links genauso zwischen den beiden linken Pfosten, unten an deinem Balken, oben am linken Dachbalken. In der Fensternische hinter dem Pfosten an der Hauswand ist kein Holz fürs Netz, dort kommt eine Platte hin: zwei Leisten 20×40 mit Fix ALL unter den Sturz und an die Fensterlaibung kleben, die Platte auf deinen Balken stellen und von innen durch den Pfosten und die Leisten festschrauben, Fugen mit Fix ALL dicht machen. in der Ecke über Eck vom Eckpfosten zum Wandpfosten, oben am Eckriegel, rechts ein Streifen von der Mauerkrone bis zum rechten Dachbalken. Links sitzt das Netz zwischen dem Pfosten an der Hauswand und dem Eckpfosten, außen bündig mit deinem Balken. Vorne an der Mauer läuft es außen am Eckpfosten vorbei bis ans Balkenende, dort mit dem Netz über Eck mit Kabelbindern oder Netzklammern verbinden und oben und unten klemmen. Nie an die Platten. Alles ist von innen erreichbar." },
];

// Texte, die sich mit den Varianten unter „Planen“ ändern
const VARIANTE_TEXT = {
  2: (t, p) => p.ohneMittelpfosten
    ? t.replace("Vier Pfosten", "Drei Pfosten").replace("einer in der Mitte und ", "").replace("Links braucht es keinen Mittelpfosten, weil das Dach nach vorne fällt und dort kaum Last ankommt.", "Variante ohne Mittelpfosten: vorne ist die Gartenseite frei, dafür wird die Traufpfette doppelt.")
    : t,
  3: (t, p) => p.ecke === "kopfholz"
    ? t.replace("Er klebt auf ganzer Länge an der Betonwand und reicht oben bis zur Oberkante deines Balkens auf der Mauer (261,9 cm). Dort wird er mit einem Lochblech über beide Oberseiten an diesem Balken festgeschraubt.", "Oben hält ihn ein Kopfholz, das bis unter das Ende der Traufpfette reicht. Ein Füllholz auf dem Kopfholz schließt die Seite bis unters Dach.")
    : t,
  4: (t, p) => {
    let s = t;
    if (p.ohneMittelpfosten) s = s.replace("Vorne die Traufpfette auf den Gartenpfosten,", "Vorne die Traufpfette, ebenfalls doppelt (2 × 70 hochkant, verklebt und verschraubt, Stöße versetzt), weil sie ohne Mittelpfosten von Ecke zu Ecke spannt,");
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
  const hB = B.hBruestung + B.balken.h, hBalken = hB;

  // Dachfläche: drei Platten nebeneinander, so gelegt, dass der rechte Sparren auf der Mauerkrone liegt
  const zPf0 = zl0 + B.eckEinzug, zPf1 = zPf0 + B.querbalken;                              // Querbalken: genau 3 m, rechts 5,5 cm auf der Mauer
  const zP0 = (zPf0 + zPf1) / 2 - (PL.anzahl * PL.breite) / 2, zP1 = zP0 + PL.anzahl * PL.breite;   // Platten stehen beidseitig gleich über
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
  // Stab mit echten Schrägschnitten: jedes Ende wird an einer Ebene {n, p} abgeschnitten (ohne Ebene: gerade).
  // Die 8 Ecken gehen an den Viewer, die lange und kurze Kante in die Stückliste.
  const schnittStab = (step, name, art, A, Bp, b, h, ebeneA, ebeneB, extra = {}) => {
    const L = Math.hypot(...v3.sub(Bp, A)), d = v3.scale(v3.sub(Bp, A), 1 / L);
    const up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
    const side = v3.norm(v3.cross(d, up)), nUp = v3.norm(v3.cross(side, d));
    const offs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => v3.add(v3.scale(side, (i * b) / 2), v3.scale(nUp, (j * h) / 2)));
    const ende = (P, e, t0) => (e ? v3.add(P, v3.scale(d, v3.dot(e.n, v3.sub(e.p, P)) / v3.dot(e.n, d))) : v3.add(P, v3.scale(d, t0)));
    const ea = offs.map((o) => ende(v3.add(A, o), ebeneA, 0)), eb = offs.map((o) => ende(v3.add(A, o), ebeneB, L));
    const kanten = ea.map((v, i) => Math.hypot(...v3.sub(eb[i], v)));
    stab(step, name, art, A, Bp, b, h, { ecken: [...ea, ...eb], laenge: Math.max(...kanten), kurzeKante: Math.min(...kanten), ...extra });
  };
  // Prisma: ebenes Vieleck (Seitenansicht) um den Vektor ext ausgezogen, z. B. ein Sparren mit Kerbe
  const prisma = (step, name, art, pts, ext, extra = {}) => add({ step, name, art, form: "prisma", pts, ext, ...extra });
  const ebX = (x) => ({ n: [1, 0, 0], p: [x, 0, 0] }), ebY = (y) => ({ n: [0, 1, 0], p: [0, y, 0] }), ebZ = (z) => ({ n: [0, 0, 1], p: [0, 0, z] });
  const ebSparren = (x) => ({ n: [tan, 1, 0], p: [x, spU(x), 0] });              // Unterkante eines Sparrens (schräg)
  const holz = { profil: HOLZ };

  // --- 1 Bestand -------------------------------------------------------------------
  // Gartenbalken mit zwei Lücken für die vorderen Eckpfosten (5,5 cm von den Ecken nach innen), die Pfosten stehen dort auf dem Beton
  {
    const a1 = [zl0 + B.eckEinzug, zl0 + B.eckEinzug + H.b];                               // = Pfosten links
    const a2 = [zw1 - B.eckEinzug - H.b, zw1 - B.eckEinzug];                                // = Pfosten an der Mauer
    for (const [z0, z1] of [[zl1, a1[0]], [a1[1], a2[0]], [a2[1], zw1]].filter(([z0, z1]) => z1 - z0 > 0.002)) box(1, "Bestandsbalken Garten", "bestand", xg0, xg1, B.hBruestung, hB, z0, z1);
  }
  box(1, "Bestandsbalken links (geht bis vorne an die Ecke)", "bestand", B.xGlas + 0.1, xg1, B.hBruestung, hB, zl0, zl1);
  const xEcke = B.xBrAussen - B.tiefeEcke;
  box(1, "Bestandsbalken vor der Mauer", "bestand", xEcke, xg0, B.hBruestung, hB, zw0, zw1);
  const gx = xg0 - 0.012, gz = zl1 + 0.012, gw = zw0 - 0.012;
  box(1, "Geländer Garten (Bestand)", "geländer", gx - 0.008, gx + 0.008, B.hGelaender - 0.02, B.hGelaender, zl1, zw0);
  box(1, "Geländer links (Bestand, endet vor der Hauswand)", "geländer", B.xFassade + 0.15, gx, B.hGelaender - 0.02, B.hGelaender, gz - 0.008, gz + 0.008);
  box(1, "Geländer vor der Mauer (Bestand)", "geländer", xEcke, gx, B.hGelaender - 0.02, B.hGelaender, gw - 0.008, gw + 0.008);
  for (let z = zl1 + 0.3; z < zw0; z += 0.75) box(1, "Geländerstütze", "geländer", gx - 0.008, gx + 0.008, B.hBruestung, B.hGelaender, z - 0.008, z + 0.008);

  // --- Höhen der Pfetten ----------------------------------------------------------------
  const xF0 = B.xFassade, xF1 = xF0 + H.a, xF = (xF0 + xF1) / 2;          // Wandpfette
  const SK = H.b;                                                          // Klotz unter jedem Sparrenende, auf den Böcken angeschraubt
  const WP_LAGEN = 2, wpOK = yU(xF) - d70 - SK, wpUK = wpOK - WP_LAGEN * H.b;   // zwei Lagen, beide an der glatten Betonfläche
  const tpLagen = p.ohneMittelpfosten ? 2 : 1;                             // ohne Mittelpfosten: doppelt wie hinten
  const tpOK = yU(xg1) - d70, tpUK = tpOK - tpLagen * H.b;                 // Traufpfette: der Sparren liegt an ihrer Vorderkante auf, dahinter ist er eingekerbt
  const zMitte = (zl1 + zw0) / 2;

  // --- 2 Pfosten auf den Balken ------------------------------------------------------------
  const winkel = (name, x0, x1, z0, z1, seite, hB = hBalken) => {           // Winkel 60×60×40, außen am Pfosten
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
    if (!gelaender) return;
    if (gelaender === "garten") {
      const zc = Math.min(Math.max((z0 + z1) / 2, zl1 + 0.012), zw0 - 0.006);
      box(2, `${name} – U-Bügel ans Geländer`, "stahl", gx - 0.012, x1 + 0.004, y0, y1, zc - 0.005, zc + 0.005);
    } else {
      const xc = (x0 + x1) / 2;
      box(2, `${name} – U-Bügel ans Geländer`, "stahl", xc - 0.005, xc + 0.005, y0, y1, z0 - 0.004, gz + 0.012);
    }
  };
  const pfosten = (name, x0, x1, z0, z1, oben, seiten, gelaender, tiefer = 0, notiz) => {
    const fuss = hBalken - tiefer;                                            // in der Lücke steht der Pfosten tiefer, auf dem Beton
    const schnitt = notiz ?? (tiefer ? `steht in der Lücke im Balken direkt auf dem Beton (${cm(tiefer)} cm tiefer)` : undefined);
    box(2, name, "holz", x0, x1, fuss, oben, z0, z1, { ...holz, laenge: oben - fuss, ...(schnitt ? { schnitt } : {}) });
    for (const sd of seiten) winkel(name, x0, x1, z0, z1, sd, tiefer ? hBalken : fuss);   // in der Lücke: Winkel oben auf die Balkenenden
    buegel(name, x0, x1, z0, z1, gelaender);
  };
  // links an der Hauswand: vom Boden bis unter die Wandpfette (innen neben dem Geländer, hält auch das Netz in der Ecke)
  const zh0 = zl1 + 0.001, zh1 = zh0 + H.b;                                 // direkt innen am Balken, dort ist kein Geländer
  pfosten("Pfosten links an der Hauswand (bis zum Boden)", xF0, xF0 + H.b, zh0, zh1, wpUK, [], null, hBalken, "steht auf dem Boden direkt am Balken, oben 261,9 cm wie der Balken auf der Mauer");
  for (const y of [B.hBruestung + 0.02, hBalken - 0.02]) box(2, "Schraube 6×120 durch den Pfosten in den Balken", "stahl", xF0 + H.b / 2 - 0.003, xF0 + H.b / 2 + 0.003, y - 0.003, y + 0.003, zl1 - 0.06, zh1);
  const zEL = [zl0 + B.eckEinzug, zl0 + B.eckEinzug + H.b];                 // Eckpfosten links/Garten, in einer Linie mit dem Pfosten an der Hauswand
  pfosten("Eckpfosten links/Garten", xg0, xg1, zEL[0], zEL[1], tpUK, ["+z", "-z"], "garten", B.balken.h);
  if (!p.ohneMittelpfosten) pfosten("Pfosten Garten Mitte", xg0, xg1, zMitte - H.b / 2, zMitte + H.b / 2, tpUK, ["+z", "-z"], "garten");
  const zEck = [zw1 - B.eckEinzug - H.b, zw1 - B.eckEinzug];                // Eckpfosten Garten/Mauer, 5,5 cm vom Balkenende nach innen
  pfosten("Eckpfosten Garten/Mauer", xg0, xg1, zEck[0], zEck[1], tpUK, ["-z", "+z"], "garten", B.balken.h);
  const wz1 = B.zWand - 0.002, wz0 = wz1 - H.b;                              // Wandpfosten an der Mauer

  // --- 3 Auflager auf der Mauerkrone + Ecke ----------------------------------------------------------
  const PAD = 0.01;                                                         // Unterlegplatten: Wasser läuft darunter ab
  const kUK = B.hMauerkrone + B.mauerBalken, kz0 = B.zWand + 0.003, kz1 = zPf1;        // Auflage der Wandpfette auf der Mauer
  const pad = (step, x0, x1) => box(step, "Unterlegplatte 1 cm (punktuell geklebt)", "stahl", x0, x1, B.hMauerkrone, kUK, kz0 + 0.003, kz1 - 0.003);
  box(3, "Balken flach auf der Mauerkrone (5,5 cm hoch, hast du schon)", "holz", xF0, B.xWandEnde, B.hMauerkrone, kUK, B.zWand + 0.003, B.zWand + 0.003 + H.b, { laenge: B.xWandEnde - xF0 });
  if (wpUK - kUK > 0.01) {                                                   // nur nötig, wenn die Wandpfette höher liegt als die Krone
    box(3, `Auflagerklotz für die Wandpfette (${cm(wpUK - kUK)} cm)`, "holz", xF0, xF1, kUK, wpUK, kz0, kz1, { ...holz, laenge: wpUK - kUK });
    box(3, "Winkel Wandpfette an den Auflagerklotz", "stahl", xF1, xF1 + 0.003, wpUK - 0.04, wpUK + 0.04, kz0 + 0.008, kz0 + 0.048);
  }
  // Der rechte Sparren liegt nicht auf der Mauer: er wird wie alle anderen von Wand- und Traufpfette getragen
  // Wandpfosten: direkt an die Mauer geklebt, etwas weiter hinten als der Eckpfosten
  const xw1 = B.xWandEnde, xw0 = xw1 - H.a;                                  // bündig mit dem Mauerende
  const eckA = [xg0, zw1], eckB = [xw1, wz0];                                 // hintere Innenkante Eckpfosten -> Vorderkante Wandpfosten
  const eckL = Math.hypot(eckA[0] - eckB[0], eckB[1] - eckA[1]);
  const wEck = Math.round((Math.acos(Math.abs(eckB[0] - eckA[0]) / eckL) * 180) / Math.PI);   // Schnittwinkel der schrägen Hölzer in der Ecke
  const wk = (w, wie) => ({ winkel: `${w}°${wie ? ", " + wie : ""} (Kappsäge auf ${w}°)` });
  const winkelLabels = [];
  let wpfOK, netzOben;                                                        // Oberkante Wandpfosten, Oberkante Netz über Eck
  if (p.ecke === "riegel") {
    // Eckriegel genau auf der Netzlinie: oben bündig mit den Sparrenunterkanten, vorne an die Traufpfette, hinten auf den Wandpfosten
    const d = [(eckB[0] - eckA[0]) / eckL, (eckB[1] - eckA[1]) / eckL], n = [d[1], -d[0]];  // n zeigt nach außen
    const off = (P, s, t) => [P[0] + n[0] * s + d[0] * t, P[1] + n[1] * s + d[1] * t];
    const rA = off(eckA, H.a / 2, -(H.a / 2) * n[0] / d[0]), rB = off(eckB, H.a / 2, (xw1 - eckB[0] - n[0] * H.a / 2) / d[0]);   // hinten stumpf vorne an den Wandpfosten
    const ry = (x) => spU(x) - H.b / 2;
    schnittStab(4, "Eckriegel auf der Netzlinie (Traufpfette bis Wandpfosten)", "holz", [rA[0], ry(rA[0]), rA[1]], [rB[0], ry(rB[0]), rB[1]], H.a, H.b, ebX(rA[0]), ebX(rB[0]), { ...holz, ...wk(wEck, "beide Enden, parallel"), schnitt: "am Bau anhalten und anreißen" });
    winkelLabels.push({ t: `${wEck}°`, p: [rA[0] - 0.08, ry(rA[0]) - 0.08, rA[1] + 0.03], ab: 4, bis: 4 });
    box(4, "Winkel Eckriegel an die Traufpfette", "stahl", xg0 - 0.003, xg0, ry(xg0) - 0.03, ry(xg0) + 0.03, rA[1] - 0.02, rA[1] + 0.02);
    wpfOK = kUK;                                                              // Wandpfosten bis Oberkante Mauerbalken, dort angeschraubt
    netzOben = [spU(eckA[0]) - H.b, spU(xw1) - H.b];
    box(4, "Winkel Eckriegel seitlich an den Wandpfosten", "stahl", xw1, xw1 + 0.003, ry(xw1) - 0.03, ry(xw1) + 0.03, rB[1] - 0.02, rB[1] + 0.02);
    // darüber bis unter die Platte: Füllholz bis an den rechten Sparren
    const zSp = zPf1 - H.a - 0.003;                                           // Innenkante rechter Sparren
    const tF = (zSp - rA[1]) / d[1];                                          // bis an die Seite des rechten Sparrens
    const fB = [rA[0] + d[0] * tF, rA[1] + d[1] * tF];
    const fy = (x) => spU(x) + H.b / 2;
    schnittStab(8, "Füllholz auf dem Eckriegel (bis unter die Platte)", "holz", [rA[0], fy(rA[0]) - 0.003, rA[1]], [fB[0], fy(fB[0]) - 0.003, fB[1]], H.a, H.b, ebX(rA[0]), ebZ(zSp), { ...holz, winkel: `vorne ${wEck}° (Kappsäge auf ${wEck}°), hinten ${90 - wEck}° gegen den Dachbalken: das schafft kaum eine Kappsäge, also anreißen (Schnittlinie ${wEck}° zur Längskante) und mit der Handsäge schneiden`, schnitt: "hinten satt an den rechten Dachbalken: zwei Schrauben 6×120 quer in den Dachbalken, dazu von unten zwei 6×120 durch den Eckriegel ins Füllholz" });
    winkelLabels.push({ t: `${90 - wEck}°`, p: [fB[0] + 0.05, fy(fB[0]) + 0.06, zSp - 0.02], ab: 8, bis: 8 });
    for (const dy of [-0.017, 0.017]) stab(8, "Schraube 6×120 Füllholz in den Dachbalken", "stahl", [fB[0] + 0.03, fy(fB[0]) + dy, zSp - 0.07], [fB[0] + 0.03, fy(fB[0]) + dy, zSp + 0.05], 0.006, 0.006);
    for (const t of [0.35, 0.7]) { const q = [rA[0] + (rB[0] - rA[0]) * t, rA[1] + (rB[1] - rA[1]) * t]; stab(8, "Schraube 6×120 von unten durch den Eckriegel ins Füllholz", "stahl", [q[0], ry(q[0]) - H.b / 2, q[1]], [q[0], ry(q[0]) + H.b / 2 + 0.05, q[1]], 0.006, 0.006); }
  } else {
    const khUK = tpUK - H.b;                                                   // Kopfholz: verbindet Wandpfosten oben mit der Traufpfette
    box(3, "Kopfholz auf dem Wandpfosten (unter dem Ende der Traufpfette)", "holz", xw0, xg1, khUK, tpUK, wz0, wz1, { ...holz, laenge: xg1 - xw0 });
    const spUKmin = Math.min(yU(xw0), yU(xg0)) - H.b / Math.cos(a);
    if (spUKmin - tpUK > 0.02) box(3, "Füllholz auf dem Kopfholz (schließt bis unters Dach)", "holz", xw0, xg0, tpUK, spUKmin - 0.003, wz0, wz1, { ...holz, laenge: xg0 - xw0 });
    wpfOK = khUK;
    netzOben = [khUK, khUK];
  }
  box(3, "Wandpfosten an die Mauer geklebt", "holz", xw0, xw1, B.hBruestung + 0.01, wpfOK, wz0, wz1, { ...holz, laenge: wpfOK - B.hBruestung - 0.01 });
  if (p.ecke === "riegel") box(3, "Lochblech Wandpfosten oben an den Mauerbalken", "stahl", xw0 + 0.005, xw1 - 0.005, wpfOK, wpfOK + 0.003, wz0 + 0.01, B.zWand + H.b - 0.01);
  box(3, "Unterlegplatte 1 cm unter dem Wandpfosten", "stahl", xw0, xw1, B.hBruestung, B.hBruestung + 0.01, wz0 + 0.005, wz1 - 0.005);
  // Schwelle unten auf der Netzlinie: verbindet Eckbalken und Wandpfosten, daran wird das Netz über Eck unten befestigt
  const ed = [(eckB[0] - eckA[0]) / eckL, (eckB[1] - eckA[1]) / eckL], en = [ed[1], -ed[0]];   // en zeigt nach außen
  // vorne schräg ans Balkenende (z = Ende Eckbalken), außen bündig mit deinem Balken; hinten an die Vorderseite des Wandpfostens
  const kq = en[0] - (ed[0] * en[1]) / ed[1], swO = (xg1 - eckA[0]) / kq - H.b / 2;   // Versatz der Schwellenmitte zur Netzlinie
  const swA = [eckA[0] + en[0] * swO, eckA[1] + en[1] * swO], swB = [eckB[0] + en[0] * swO, eckB[1] + en[1] * swO];
  const swUK = B.hBruestung + 0.01, swOK = swUK + H.a;
  schnittStab(3, "Schwelle unten in der Ecke (flach auf dem Betonstreifen, Eckbalken bis Wandpfosten)", "holz", [swA[0], swUK + H.a / 2, swA[1]], [swB[0], swUK + H.a / 2, swB[1]], H.b, H.a, ebZ(zw1), ebX(xw1), { ...holz, winkel: `vorne ${90 - wEck}° gegen das Balkenende: anreißen (Schnittlinie ${wEck}° zur Längskante) und mit der Handsäge schneiden, hinten ${wEck}° an den Wandpfosten (Kappsäge auf ${wEck}°)`, schnitt: "liegt flach" });
  winkelLabels.push({ t: `vorne ${90 - wEck}°`, p: [swA[0] + 0.02, swOK + 0.05, swA[1]], ab: 3, bis: 3 }, { t: `hinten ${wEck}°`, p: [swB[0] + 0.03, swOK + 0.05, swB[1]], ab: 3, bis: 3 });
  stab(3, "Unterlegplatte 1 cm unter der Schwelle", "stahl", [swA[0], B.hBruestung + 0.005, swA[1]], [swB[0], B.hBruestung + 0.005, swB[1]], H.b - 0.01, 0.01);
  box(3, "Winkel Schwelle an den Eckbalken", "stahl", eckA[0] - 0.02, eckA[0] + 0.02, swUK, swOK, eckA[1], eckA[1] + 0.003);
  box(3, "Winkel Schwelle an den Wandpfosten", "stahl", xw1, xw1 + 0.003, swUK, swOK + 0.02, wz0 + 0.01, wz0 + 0.05);

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
  pfette("Wandpfette oben (an die Wand geklebt)", xF0, xF1, wpUK + H.b, wpOK, true);
  if (p.ohneMittelpfosten) {                                                  // doppelt, Stöße versetzt an den Eckpfosten
    pfette("Traufpfette unten", xg0, xg1, tpUK, tpUK + H.b, false);
    pfette("Traufpfette oben", xg0, xg1, tpUK + H.b, tpOK, true);
  } else pfette(`Traufpfette (${p.ecke === "riegel" ? "kragt rechts über den Eckpfosten aus" : "liegt rechts auf dem Kopfholz"})`, xg0, xg1, tpUK, tpOK, false);
  // Sparren je Element: außen sitzen sie innerhalb der 3-m-Querbalken, die Platte steht seitlich über
  const sparrenZ = (i) => {
    const z0 = zP0 + i * PL.breite, z1 = z0 + PL.breite, r = H.a / 2 + 0.003;
    return [i === 0 ? zPf0 + r : z0 + r, i === PL.anzahl - 1 ? zPf1 - r : z1 - r];
  };
  const zr = sparrenZ(0)[0];                                                 // linker Sparren des linken Elements

  // --- 5 Kopfbänder ------------------------------------------------------------------------------
  const kd = 0.30;
  const KL = 0.02;                                                           // Klemmleiste 20×20 fürs Netz, außen bündig
  const KBD = 0.035;                                                         // Kopfband 35×55 (70×55 längs halbiert): innen bündig, das Netz läuft außen vorbei
  const kb = (name, A, Bp, step, eA, eB) => {
    schnittStab(step, name, "holz", A, Bp, KBD, H.a, eA, eB, { ...holz, ...wk(45, "beide Enden, Schnitte parallel"), schnitt: "aus einem 70×55 längs halbiert (35×55), innen bündig: aus einem Stück werden zwei Kopfbänder" });
    winkelLabels.push({ t: "45°", p: [(A[0] + Bp[0]) / 2 - 0.04, (A[1] + Bp[1]) / 2, (A[2] + Bp[2]) / 2], ab: step, bis: step });
  };
  const kbVorne = [[zEL[1], 1, "Ecke links"], [zMitte - H.b / 2, -1, "Mitte 1"], [zMitte + H.b / 2, 1, "Mitte 2"], [zEck[0], -1, "Ecke Mauer"]];
  for (const [z, s, nm] of kbVorne.filter((k) => !p.ohneMittelpfosten || !k[2].startsWith("Mitte")))
    kb(`Kopfband vorne ${nm}`, [xg0 + KBD / 2, tpUK - kd, z], [xg0 + KBD / 2, tpUK, z + s * kd], 5, ebZ(z), ebY(tpUK));
  kb("Kopfband Hauswand", [xF1 - KBD / 2, wpUK - kd, zh1], [xF1 - KBD / 2, wpUK, zh1 + kd], 5, ebZ(zh1), ebY(wpUK));
  for (const [x, s, nm] of [[xF0 + H.b, 1, "Hauswand"], [xg0, -1, "Ecke"]])
    kb(`Kopfband links ${nm} (an den linken Sparren)`, [x, spU(x + s * kd) - kd, zEL[1] - KBD / 2], [x + s * kd, spU(x + s * kd), zEL[1] - KBD / 2], 8, ebX(x), ebSparren(x + s * kd));

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
    const [zsl, zsr] = sparrenZ(i);
    for (const [zc, seite] of [[zsl, "links"], [zsr, "rechts"]])
    { const xk = (xF0 + 0.01 + xF1 + 0.035) / 2;
      schnittStab(8, `${name}: Klotz unter dem Sparrenende ${seite} (${cm(SK)} cm)`, "holz", [xk, wpOK, zc], [xk, spU(xk), zc], H.a, xF1 + 0.025 - xF0, null, ebSparren(xk), { ...holz, laenge: xF1 + 0.025 - xF0, kurzeKante: undefined, ...wk(p.neigung, "oben schräg, liegt satt am Sparren an"), schnitt: "auf den Böcken von der Seite an den Sparren schrauben", ...e });
      prisma(8, `${name}: Sparren ${seite}`, "holz", [[xSp0, spU(xSp0), zc - H.a / 2], [xg0, spU(xg0), zc - H.a / 2], [xg0, tpOK, zc - H.a / 2], [xg1, tpOK, zc - H.a / 2], [xSp1, spU(xSp1), zc - H.a / 2], [xSp1, yU(xSp1), zc - H.a / 2], [xSp0, yU(xSp0), zc - H.a / 2]], [0, 0, H.a], { laenge: (xSp1 - xSp0) / cos, ...holz, ...wk(p.neigung, "beide Enden, parallel"), schnitt: `Kerbe über der Traufpfette: ${cm(xg1 - xg0)} cm breit, hinten ${Math.round((spU(xg0) - tpOK) * 1000)} mm tief, vorne 0`, ...e });
      if (i === 0 && seite === "links") winkelLabels.push({ t: `${p.neigung}°`, p: [xSp1 + 0.02, cS(xSp1) + 0.1, zc], ab: 7, bis: 8 });
    }
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
    const [zsl, zsr] = sparrenZ(i);
    const za = zsl + H.a / 2, zb = zsr - H.a / 2;
    if (zb > za + 0.05) box(8, "Füllholz über der Traufpfette", "holz", xg0, xg1, tpOK, yU(xG) - 0.003, za, zb, { ...holz, laenge: zb - za });
  }

  // --- 9 Katzennetz: Feld für Feld zwischen den Hölzern, wie eine Fensterscheibe -------------------------
  // Netz 2 cm hinter der Außenkante, Rand auf die Seitenflächen getackert, Leiste 20×20 außen bündig drüber.
  // Die Innenseiten von Pfosten und Balken bleiben frei für spätere Wandelemente.
  const leiste = (name, x0, x1, y0, y1, z0, z1) => box(9, name, "holz", x0, x1, y0, y1, z0, z1, { laenge: Math.max(x1 - x0, y1 - y0, z1 - z0) });
  const xN = xg1 - KL;                                                        // Netzebene Gartenseite
  const felder = p.ohneMittelpfosten ? [[zEL[1], zEck[0]]] : [[zEL[1], zMitte - H.b / 2], [zMitte + H.b / 2, zEck[0]]];
  felder.forEach(([za, zb], i) => {
    const nm = felder.length > 1 ? ` Feld ${i + 1}` : "";
    poly(9, `Netz Gartenseite${nm} (zwischen den Pfosten)`, "netz", [[xN - 0.001, hB, za], [xN - 0.001, hB, zb], [xN - 0.001, tpUK, zb], [xN - 0.001, tpUK, za]]);
    leiste(`Klemmleiste Gartenseite${nm} unten`, xN, xg1, hB, hB + KL, za, zb);
    leiste(`Klemmleiste Gartenseite${nm} oben`, xN, xg1, tpUK - KL, tpUK, za, zb);
    leiste(`Klemmleiste Gartenseite${nm} links`, xN, xg1, hB + KL, tpUK - KL, za, za + KL);
    leiste(`Klemmleiste Gartenseite${nm} rechts`, xN, xg1, hB + KL, tpUK - KL, zb - KL, zb);
  });
  const yNu = B.hBruestung;
  stab(9, "Klemmleiste über Eck unten (auf der Schwelle)", "holz", [eckA[0], swOK + KL / 2, eckA[1]], [eckB[0], swOK + KL / 2, eckB[1]], KL, KL);
  poly(9, "Netz über Eck (Eckpfosten bis Wandpfosten)", "netz", [[eckA[0] - 0.003, swOK, eckA[1]], [eckB[0] - 0.003, swOK, eckB[1]], [eckB[0] - 0.003, netzOben[1], eckB[1]], [eckA[0] - 0.003, netzOben[0], eckA[1]]]);
  // links: Feld zwischen Pfosten an der Hauswand und Eckpfosten, außen bündig an deinem Balken, oben am linken Sparren
  const zN = zl1 + 0.002, xHw = xF0 + H.b;                                    // Netzebene = Außenseite der linken Pfosten
  poly(9, "Netz links (zwischen den linken Pfosten)", "netz", [[xHw, hB, zN], [xg0, hB, zN], [xg0, spU(xg0), zN], [xHw, spU(xHw), zN]]);
  leiste("Klemmleiste links unten (auf deinem Balken, innen bündig)", xHw, xg0, hB, hB + KL, zl1 - KL, zl1);
  // Fensternische hinter dem Pfosten an der Hauswand: kein Holz fürs Netz, deshalb komplett zu mit einer Platte
  {
    const xa = B.xGlas + 0.01, xb = xF0 + H.b, d = 0.018, yo = B.hSturzUK;
    box(9, "Seitenwand in der Fensternische (Platte 18 mm, z. B. Siebdruck, OSB oder Bretter)", "holz", xa, xb, hB, yo, zl1 - d, zl1, { laenge: xb - xa, schnitt: `ca. ${cm(xb - xa)} × ${cm(yo - hB)} cm, steht auf deinem Balken, vorne außen am Pfosten an der Hauswand` });
    box(9, "Leiste 20×40 unter dem Sturz (mit Fix ALL geklebt)", "holz", xa, xF0, yo - 0.04, yo, zl1, zl1 + 0.02, { laenge: xF0 - xa });
    box(9, "Leiste 20×40 an der Fensterlaibung (mit Fix ALL geklebt)", "holz", xa, xa + 0.04, hB, yo - 0.04, zl1, zl1 + 0.02, { laenge: yo - 0.04 - hB });
  }
  stab(9, "Klemmleiste links oben (unter dem linken Sparren)", "holz", [xHw + KL, spU(xHw + KL) - KL / 2, zN + KL / 2], [xg0 - KL, spU(xg0 - KL) - KL / 2, zN + KL / 2], KL, KL);
  leiste("Klemmleiste links vorne (am Eckpfosten)", xg0 - KL, xg0, hB + KL, spU(xg0) - KL, zN, zN + KL);
  leiste("Klemmleiste links hinten (am Pfosten an der Hauswand)", xHw, xHw + KL, hB + KL, wpUK, zN, zN + KL);
  leiste("Klemmleiste links hinten oben (an der Wandpfette)", xHw, xHw + KL, wpUK, spU(xHw + KL) - KL, zN, zN + KL);
  // Ecke an der Mauer: der Eckpfosten steht 5,5 cm innen, das Netz läuft außen bis ans Balkenende und wird dort mit dem Netz über Eck verbunden
  {
    const za = zEck[1], zb = zw1;
    poly(9, "Netz Eckstreifen an der Mauer (außen am Eckpfosten vorbei bis zum Balkenende)", "netz", [[xN - 0.001, hB, za], [xN - 0.001, hB, zb], [xN - 0.001, tpUK, zb], [xN - 0.001, tpUK, za]]);
    leiste("Klemmleiste Eckstreifen an der Mauer unten", xN, xg1, hB, hB + KL, za, zb);
    leiste("Klemmleiste Eckstreifen an der Mauer oben", xN, xg1, tpUK - KL, tpUK, za, zb);
  }
  // Streifen über der Mauerkrone: von der Krone bis zur Unterkante des rechten Sparrens (unten Klemmleiste an die Mauer geklebt)
  const zs = B.zWand - 0.003;
  poly(9, "Netzstreifen über der Mauerkrone (bis zum rechten Sparren)", "netz", [[xF1, kUK, zs], [B.xWandEnde, kUK, zs], [B.xWandEnde, spU(B.xWandEnde), zs], [xF1, spU(xF1), zs]]);

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
  hinweise.push({ stufe: "ok", text: `Alle Querbalken sind genau ${cm(B.querbalken)} cm lang, ohne Stoß, und liegen rechts ${cm(zPf1 - B.zWand)} cm auf der Mauer. Deine 3 Platten ${PL.label} decken ${cm(zP1 - zP0)} cm ab, ohne Zuschnitt: Sie stehen links und rechts je ${cm(zPf0 - zP0)} cm über die äußeren Dachbalken (mit Randprofil kein Problem). Rechts reicht die Platte ${cm(zP1 - B.zWand)} cm auf die Mauer, links ${Math.abs(zP0 - B.zLinksAussen) < 0.01 ? "bis zur Außenkante der Brüstung" : `${cm(Math.abs(zP0 - B.zLinksAussen))} cm ${zP0 < B.zLinksAussen ? "über" : "vor"} die Außenkante der Brüstung`}.` });
  hinweise.push({ stufe: "ok", text: `Rechts stehen die Platten ${cm(zP1 - B.zWand)} cm über die Betonmauer, das Regenwasser läuft außen auf die Mauer. Der rechte Dachbalken liegt nicht auf der Mauer, er wird wie alle anderen von den beiden Querbalken getragen. Zwischen deinem Balken auf der Mauer und dem Dachbalken bleibt eine Lücke von ${cm(spU(B.xWandEnde) - kUK)} cm (vorne) bis ${cm(spU(xF1) - kUK)} cm (hinten). Die schließt das Netz, gegen Schlagregen von der Seite zusätzlich ein Brett innen an den Dachbalken schrauben. Nur die Wandpfette liegt hinten auf deinem flachen Balken auf der Krone.` });
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
  {
    const lageOK = wpOK;                                                       // beide Lagen werden geklebt
    hinweise.push(lageOK <= B.hSturzOK + 0.005
      ? { stufe: "ok", text: `Wandpfette ${cm(wpUK)}–${cm(wpOK)} cm: Beide Lagen liegen komplett an der glatten Betonfläche (bis ${cm(B.hSturzOK)} cm) und können dort geklebt werden. Die Dachbalken liegen mit ihren ${cm(SK)} cm hohen Klötzen darauf. Rechts liegt sie auf deinem flachen Balken auf der Mauerkrone (oben ${cm(B.hMauerkrone + B.mauerBalken)} cm), links auf dem Pfosten.` }
      : { stufe: "warn", text: `Wandpfette ${cm(wpUK)}–${cm(wpOK)} cm: Die geklebten Lagen ragen ${cm(lageOK - B.hSturzOK)} cm über die glatte Betonfläche (bis ${cm(B.hSturzOK)} cm) in den vorstehenden Ziegel. Dachunterkante vorne tiefer oder weniger Neigung wählen.` });
  }
  if (lPf > LAGER) hinweise.push({ stufe: "info", text: `Die Wandpfette ist ${cm(lPf)} cm lang. Jede Lage wird einmal gestoßen, die Stöße liegen versetzt an den beiden Auflagern. Verklebt und verschraubt trägt das wie ein Balken.` });
  hinweise.push({ stufe: "ok", text: `Das Netz sitzt Feld für Feld zwischen den Hölzern, 2 cm hinter der Außenkante, nie an den Platten. Die Innenseiten von Pfosten und Balken bleiben frei für Wandelemente. Über der Traufpfette schließen Füllhölzer die Lücken zwischen den Sparren. Befestigt wird von innen: tackern, Leiste 20×20 außen bündig drüber.` });
  hinweise.push({ stufe: "ok", text: `Ecke an der Mauer: ${cm(B.zWand - zw1)} × ${cm(B.tiefeEcke)} cm Betonstreifen, die Mauer endet ${cm(B.xBrAussen - B.xWandEnde)} cm vor der Balkonkante. ${`Der Wandpfosten wird bündig am Mauerende flach an die Mauer geklebt (${cm(xg0 - xw1)} cm hinter dem Eckpfosten). ` + (p.ecke === "riegel"
    ? `Oben liegt der Eckriegel genau auf der Netzlinie: vorne mit einem Winkel an der Traufpfette, hinten mit einem Winkel seitlich am Wandpfosten, direkt unter dem rechten Sparren. Das Netz über Eck (${cm(eckL)} cm breit) hat so an allen vier Seiten Holz bzw. Beton. Ein Füllholz auf dem Eckriegel schließt bis unter die Platte.`
    : `Oben verbindet ihn das Kopfholz mit der Traufpfette. Achtung: Das Kopfholz liegt an der Mauer, nicht auf der Netzlinie. Die Oberkante des Netzes über Eck (${cm(eckL)} cm) hat so keine Leiste, darüber bleibt ein Spalt bis zum Dach.`)}` });
  {
    // Durchbiegung Traufpfette grob: 1,0 kN/m² (Schnee + Dach) auf die halbe Dachtiefe, E = 11 000 N/mm²
    const q = 1.0 * (xG - xF) / 2, L = p.ohneMittelpfosten ? (zEck[0] + zEck[1]) / 2 - (zEL[0] + zEL[1]) / 2 : Math.max(zMitte - (zEL[0] + zEL[1]) / 2, (zEck[0] + zEck[1]) / 2 - zMitte);
    const I = (H.a * Math.pow(tpLagen * H.b, 3)) / 12, f = (5 * q * 1000 * Math.pow(L, 4)) / (384 * 11e9 * I);
    const sigma = ((q * L * L) / 8) / ((H.a * Math.pow(tpLagen * H.b, 2)) / 6) / 1000;   // N/mm²
    hinweise.push({ stufe: f > L / 200 ? "warn" : "ok", text: p.ohneMittelpfosten
      ? `Ohne Mittelpfosten spannt die doppelte Traufpfette (55×140, verklebt und verschraubt) ${cm(L)} cm frei. Grob gerechnet biegt sie sich unter Schnee ${(f * 1000).toFixed(0)} mm durch (${sigma.toFixed(0)} N/mm²). Dafür ist vorne die Kopffreiheit ${cm(H.b)} cm niedriger und es braucht mehr Holz.`
      : `Mit dem Mittelpfosten spannt die einfache Traufpfette nur ${cm(L)} cm. Grob gerechnet biegt sie sich unter Schnee ${(f * 1000).toFixed(0)} mm durch (${sigma.toFixed(0)} N/mm²). Der Querbalken ist ein Stück ohne Stoß.` });
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
  masse.push(...winkelLabels);

  const schritte = SCHRITTE.map((st) => ({ ...st, text: (VARIANTE_TEXT[st.n] ?? ((t) => t))(st.text, p) }));
  return { param: p, platte: PL, parts, schritte, masse, kennwerte, hinweise, einkauf: einkauf(parts, kennwerte, p) };
}

const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; },
};
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
    { status: "bestellen", teil: "MS-/Hybrid-Polymer-Kleber, außen, UV-fest (z. B. dein Soudal Fix ALL X-Treme Power)", menge: "ca. 5 Kartuschen", hinweis: "nur punktuell oder in Raupen: Unterlegplatten, Wandpfosten, Wandpfette an der Hauswand, Wandprofil. Für die sichtbare Dichtfuge besser ein elastischer Dichtstoff" },
    { status: "bestellen", teil: "Kunststoff-Unterlegplatten (Terrassenpads) 10 mm", menge: "1 Pack (mind. 6)", hinweis: "unter den Klötzen auf der Mauer und dem Wandpfosten, Wasser läuft darunter ab" },
    { status: "bestellen", teil: "U-Bügel (Rundstahlbügel M8) mit Gegenplatte, passend zum Geländerrohr", menge: `${parts.filter((q) => q.name.endsWith("U-Bügel ans Geländer")).length}`, hinweis: "je tragender Pfosten einer, Rohrdurchmesser messen; hast du sie schon, nur prüfen" },
    { status: "bestellen", teil: "Dachrinne (z. B. Kunststoff halbrund 100) mit 2 Endstücken + Ablaufstutzen", menge: `1 × ${cm(L + 0.05)} cm`, hinweis: "Ablauf rechts an der Betonmauer, Fallrohr später" },
    { status: "bestellen", teil: "Rinnenhalter zum Anschrauben an den Sparren", menge: `${2 * PLATTE.anzahl}`, hinweis: "auf den Böcken vormontieren" },
    { status: "bestellen", teil: "Platte für die Fensternische, 15–18 mm (Siebdruck, OSB oder Bretter)", menge: "1 Stück, ca. 30 × 175 cm", hinweis: "schließt die Nische hinter dem Pfosten an der Hauswand" },
    { status: "bestellen", teil: "Leisten 20×40 für die Platte in der Nische", menge: "ca. 2 × 1,8 m", hinweis: "mit Fix ALL an Sturz und Fensterlaibung kleben" },
    { status: "bestellen", teil: "Holzleisten 20×20 als Klemmleisten fürs Netz (außen bündig in den Feldern)", menge: `ca. ${Math.ceil(rand * 1.1)} m`, hinweis: "von innen über den Netzrand schrauben" },
    { status: "bestellen", teil: "Edelstahlschrauben 4×40 für die Klemmleisten", menge: `${Math.ceil(rand / 0.25)}`, hinweis: "alle 25 cm" },
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt ${cm(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PLATTE.label}`, menge: `3 von 3`, hinweis: "Stege in Gefällerichtung (zum Garten)" },
    { status: "vorhanden", teil: "Randprofile, Tropfprofil", menge: `2 × ${cm(PLATTE.laenge)} cm, ${cm(L)} cm`, hinweis: "Seitenkanten links und rechts, vordere Kante" },
    { status: "vorhanden", teil: "Winkelverbinder mit Sicke, ca. 60×60×40", menge: "ca. 30", hinweis: "je Pfosten zwei auf gegenüberliegenden Seiten, Eckriegel, Klötze an der Mauer" },
    { status: "vorhanden", teil: "Sparrenpfettenanker", menge: `${k.sparrenAnzahl * 2}`, hinweis: "je Sparren einer an jeder Pfette, von unten" },
    { status: "vorhanden", teil: "Holzschrauben 6×120", menge: "ca. 60", hinweis: "Wandpfette alle 20 cm (dazu dein Fix ALL statt Holzleim), Kopfbänder" },
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
