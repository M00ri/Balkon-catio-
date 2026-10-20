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
  balken: { b: 0.07, h: 0.055 },   // deine Balken liegen flach auf der Brüstung: 7 cm breit, 5,5 cm hoch
  eckEinzug: 0.055,       // die vorderen Eckpfosten stehen 5,5 cm von der Balkenecke nach innen (U-Bügel ans Geländer)
  xBalkenGarten: 0.945,   // Innenkante Gartenbalken
  zBalkenLinks: -0.275,   // Innenkante linker Balken = Außenseite der linken Pfosten (von dort bis Mauer-Innenseite 2,945 m)
  querbalken: 3.00,       // alle Querbalken genau 3 m: von der Außenseite der linken Pfosten bis 5,5 cm auf die Mauer (gemessen)
  zBalkenWand: 2.41,      // Innenkante Eckbalken vor der Mauer (19 cm Beton bis zur Mauer, gemessen)
  tiefeEcke: 0.51,        // Brüstungsstück vor der Mauer: 51 cm tief (von der Außenkante nach innen)
};

// ---------------------------------------------------------------------------
// Planungswerte – im Viewer unter „Planen“ veränderbar
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  neigung: 7.42,          // Dachneigung in Grad, Gefälle nach vorne zum Garten (7,4°: passt zu den schon gesägten Pfosten mit flacher Traufpfette)
  hoeheVorne: 2.6763,       // Unterkante Platte über der vorderen Pfette (so liegt die Wandpfette hinten auf Pfosten und Mauerbalken, 261,9 cm)
  plattenStaerke: 0.010,   // deine Platten: 10 mm
  ohneMittelpfosten: false, // Variante: kein Pfosten vorne in der Mitte, dafür Traufpfette doppelt
  ecke: "riegel",           // Ecke an der Mauer: "riegel" (Netz über Eck mit Eckriegel) oder "kopfholz" (alt)
};

export const PLATTE = { laenge: 2.0, breite: 1.05, label: "2,00 × 1,05 m", anzahl: 3 };

export const GRENZEN = {
  neigung: [5, 12, 0.1],
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
  { n: 4, titel: "Pfetten und Auflager auf der Mauer", text: "Hinten die Wandpfette: zwei 70×55 hochkant übereinander: zwei Raupen Fix ALL dazwischen und sofort alle 20 cm mit 6×120 verschrauben, versetzt. 24 Stunden aushärten lassen. Sie liegt links auf dem Pfosten und rechts direkt auf der Mauerkrone. Beide Lagen liegen an der glatten Betonfläche der Hauswand und werden dort zusätzlich punktuell angeklebt. An der Hauswand wird also nichts über der glatten Betonfläche befestigt, außer später dem schmalen Dichtprofil über der Platte. Vorne die Traufpfette flach auf die Gartenpfosten (7 cm breit, innen und außen bündig mit den Pfosten), rechts bis zum späteren rechten Sparren. Einen Stirnriegel links braucht es nicht: Dort liegt der linke Sparren des linken Elements genau über deinem Balken. In der Ecke an der Mauer kommt der Eckriegel dazu: ein 70×55, das genau auf der Netzlinie vom Ende der Traufpfette schräg zum Wandpfosten läuft. Vorne mit einem Winkel an die Traufpfette, hinten stumpf vorne an den Wandpfosten gestoßen und mit einem Winkel seitlich daran geschraubt. Der Wandpfosten selbst ist oben am Balken auf der Mauer festgeschraubt, das Netz über Eck bekommt am Eckriegel oben eine Leiste." },
  { n: 5, titel: "Kopfbänder", text: "Kopfbänder aus Resten steifen vorne und an der Hauswand aus. Die zwei Kopfbänder links kommen nach dem Einbau der Elemente an den linken Sparren. Ab hier steht das Gerüst stabil, auch für Kratzbaum und Liegebretter später." },
  { n: 6, titel: "Wandprofil vorab kleben", text: "Solange oben noch offen ist, kommst du von innen an die Hauswand. Das Wandanschlussprofil auf {DACH_L} cm kürzen. Die Linie für die Oberkante des Profils auf {WP_OK} cm mit Laser oder Schnur waagerecht anzeichnen. Zuerst das Kompriband an die Wand kleben, oben bündig mit der Linie. Dann das Profil mit Fix ALL in Raupen ankleben und gegen das Kompriband drücken, die Gummilippe zeigt schräg nach unten zum Garten. Zum Schluss oben über Profil und Kompriband eine Fuge mit Fix ALL ziehen und mit Spüliwasser glätten. Nach dem Dach kommst du da nicht mehr hin." },
  { n: 7, titel: "Dachelemente auf Böcken bauen", text: "Jede deiner drei Platten wird auf zwei Böcken zu einem Element: zwei Sparren 70×55 darunter, Platte mit Abstandshaltern und Dichtschrauben drauf. Unter das hintere Ende jedes Sparrens kommt ein 7 cm hoher Klotz (Reststück 70×55, ca. 9 cm lang), mit zwei Schrauben von der Seite angeschraubt. Mit diesem Klotz liegt das Element später auf der Wandpfette. So bekommt das Dach seine {NEIGUNG}° Gefälle, ohne dass an der Hauswand ein dritter Balken nötig ist. Reihenfolge auf den Böcken: 1. Kanten: oben das geschlossene Antidust-Band, unten das gelochte, jeweils mittig auf die Kante legen und oben und unten umklappen. Über das untere Band das Tropfprofil stecken, Nase nach unten. Außen kommen die Randprofile auf die Seitenkanten. Bei den Elementen Mitte und rechts kommt an die linke Kante das H-Verbindungsprofil. 2. Platte auf die Sparren legen: Stege zum Garten, bedruckte Seite nach oben. Über jedem Sparren alle 36 cm ein 12-mm-Loch bohren, das erste 12 cm vom oberen Rand (davor liegt später die Dichtlippe). In jedes Loch eine Distanzhülse, dann die Schraube 4,5 × 45 mit Dichtscheibe durch, nur bis die Scheibe anliegt, und die Kappe drauf. Über dem Sparren an der Fuge gehen die Schrauben 1,5 cm neben der Mitte durch das H-Profil. 3. Vorne an jedes Sparrenende einen Rinnenhalter schrauben. Wie tief er sitzt, steht beim Antippen am Halter, so bekommt die Rinne ihr Gefälle." },
  { n: 8, titel: "Elemente einbauen, Rinne einhängen", text: "Ein Element wiegt etwa 12 kg. Längs gedreht flach durch die Öffnung heben, oben um 90° drehen und ablegen: zuerst links, dann die Mitte, die seitlich ins H-Profil geschoben wird. Das rechte kommt zuletzt leicht gekippt durch die Restöffnung. Jedes Element 5 cm vor der Wand absetzen und unter die Dichtlippe schieben. Dann jeden Sparren mit zwei Sparrenpfettenankern festmachen: vorne an der Traufpfette und hinten am Klotz auf der Wandpfette, abwechselnd links und rechts am Sparren, je 4 SPAX 5 × 40 in jedes Holz. Danach die zwei Kopfbänder links an den linken Sparren und die Füllhölzer über der Traufpfette. Zum Schluss die Rinne: zwei 2-m-Rinnen, die rechte so kürzen, dass beide zusammen {RINNE_L} cm lang sind. In die rechte das Loch für den Stutzen sägen, den Stutzen aufschieben, beide Stücke mit dem Rinnenverbinder verbinden, die Endstücke aufstecken, die Rinne von innen in die Halter legen und vorne einklipsen." },
  { n: 9, titel: "Katzennetz von innen", text: "Das Netz kommt nicht innen vor die Hölzer, sondern Feld für Feld zwischen sie, wie eine Fensterscheibe. Pro Feld ein Netzstück mit 5 cm Rand zuschneiden. Den Rand auf die Seitenflächen der Pfosten, die Unterseite des Querbalkens und die Oberseite deines Balkens tackern, möglichst weit außen, dann eine Leiste 20×20 außen bündig drüberschrauben. Das Netz sitzt so nur 2 cm hinter der Außenkante, und alle Innenseiten bleiben frei für spätere Wandelemente. Links genauso zwischen den beiden linken Pfosten, unten an deinem Balken, oben am linken Dachbalken. In der Fensternische hinter dem Pfosten an der Hauswand ist kein Holz fürs Netz, dort kommt eine Platte hin: zwei Leisten 20×40 mit Fix ALL unter den Sturz und an die Fensterlaibung kleben, die Platte auf deinen Balken stellen und von innen durch den Pfosten und die Leisten festschrauben. In der Nische selbst ist unten kein Balken, dort geht die Platte bis auf den Boden, mit einer dritten geklebten Leiste unten. Fugen mit Fix ALL dicht machen. in der Ecke über Eck vom Eckpfosten zum Wandpfosten, oben am Eckriegel, rechts ein Streifen von der Mauerkrone bis zum rechten Dachbalken. Links sitzt das Netz zwischen dem Pfosten an der Hauswand und dem Eckpfosten, außen bündig mit deinem Balken. Vorne an der Mauer läuft es außen am Eckpfosten vorbei bis ans Balkenende, dort mit dem Netz über Eck mit Kabelbindern oder Netzklammern verbinden und oben und unten klemmen. Nie an die Platten. Alles ist von innen erreichbar." },
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
    if (p.ohneMittelpfosten) s = s.replace("Vorne die Traufpfette auf den Gartenpfosten,", "Vorne die Traufpfette, ebenfalls doppelt (2 × 70×55 flach übereinander, verklebt und verschraubt, Stöße versetzt), weil sie ohne Mittelpfosten von Ecke zu Ecke spannt,");
    if (p.ecke === "kopfholz") s = s.replace(/ In der Ecke an der Mauer kommt der Eckriegel dazu:.*$/, "");
    return s;
  },
  5: (t, p) => p.ohneMittelpfosten ? t.replace("steifen vorne und an der Hauswand", "steifen die vorderen Ecken und die Hauswand") : t,
  9: (t, p) => p.ecke === "kopfholz" ? t.replace(", oben am Eckriegel", "") : t,
};

// ---------------------------------------------------------------------------
const grad = (w) => String(Math.round(w * 10) / 10).replace(".", ",");

export function baueModell(param = {}) {
  const p = { ...DEFAULTS, ...param };
  const B = BESTAND;
  const PL = PLATTE;
  const a = (p.neigung * Math.PI) / 180;
  const tan = Math.tan(a), cos = Math.cos(a);
  const t = p.plattenStaerke;
  const d70 = H.b / cos;                                        // Sparrenhöhe lotrecht

  // Balken auf der Brüstung
  const xg0 = B.xBalkenGarten, xgB = xg0 + B.balken.b;                     // dein Gartenbalken, 7 cm breit
  const xg1 = xg0 + H.b, xG = (xg0 + xg1) / 2;                                // vordere Pfette flach, 7 cm breit wie die Pfosten (innen und außen bündig)
  const zl1 = B.zBalkenLinks, zl0 = zl1 - B.balken.b;
  const zw0 = B.zBalkenWand, zw1 = zw0 + B.balken.b;
  const hB = B.hBruestung + B.balken.h, hBalken = hB;

  // Dachfläche: drei Platten nebeneinander, so gelegt, dass der rechte Sparren auf der Mauerkrone liegt
  const zPf0 = zl1, zPf1 = zPf0 + B.querbalken;                              // Querbalken: genau 3 m, rechts 5,5 cm auf der Mauer
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
    const a1 = [zl1, zl1 + H.a];                                                           // = Pfosten links (5,5 breit)
    const a2 = [zw1 - B.eckEinzug - H.a, zw1 - B.eckEinzug];                                // = Pfosten an der Mauer (5,5 breit)
    for (const [z0, z1] of [[zl1, a1[0]], [a1[1], a2[0]], [a2[1], zw1]].filter(([z0, z1]) => z1 - z0 > 0.002)) box(1, "Bestandsbalken Garten", "bestand", xg0, xgB, B.hBruestung, hB, z0, z1);
  }
  box(1, "Bestandsbalken links (von der Hauswand bis vorne an die Ecke)", "bestand", B.xFassade, xgB, B.hBruestung, hB, zl0, zl1);
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
  const tpOK = yU(xg1) - d70, tpUK = tpOK - tpLagen * H.a;                 // Traufpfette flach (5,5 cm hoch): der Sparren liegt an ihrer Vorderkante auf, dahinter ist er eingekerbt
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
  const zEL = [zl1, zl1 + H.a];                                                               // Eckpfosten links/Garten, in einer Linie mit dem Pfosten an der Hauswand
  pfosten("Eckpfosten links/Garten", xg0, xgB, zEL[0], zEL[1], tpUK, ["+z", "-z"], "garten", B.balken.h);
  if (!p.ohneMittelpfosten) pfosten("Pfosten Garten Mitte", xg0, xgB, zMitte - H.a / 2, zMitte + H.a / 2, tpUK, ["+z", "-z"], "garten");
  const zEck = [zw1 - B.eckEinzug - H.a, zw1 - B.eckEinzug];                // Eckpfosten Garten/Mauer, 5,5 cm vom Balkenende nach innen
  pfosten("Eckpfosten Garten/Mauer", xg0, xgB, zEck[0], zEck[1], tpUK, ["-z", "+z"], "garten", B.balken.h);
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
  const wk = (w, wie) => ({ winkel: `${grad(w)}°${wie ? ", " + wie : ""} (Kappsäge auf ${grad(w)}°)` });
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
  const kq = en[0] - (ed[0] * en[1]) / ed[1], swO = (xgB - eckA[0]) / kq - H.b / 2;   // Versatz der Schwellenmitte zur Netzlinie
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
    pfette("Traufpfette unten", xg0, xg1, tpUK, tpUK + H.a, false);
    pfette("Traufpfette oben", xg0, xg1, tpUK + H.a, tpOK, true);
  } else pfette(`Traufpfette (${p.ecke === "riegel" ? "kragt rechts über den Eckpfosten aus" : "liegt rechts auf dem Kopfholz"})`, xg0, xg1, tpUK, tpOK, false);
  // Sparren je Element: außen sitzen sie innerhalb der 3-m-Querbalken, die Platte steht seitlich über
  // Bei dünnen Platten (10 mm) dürfen die Sparren höchstens ca. 80 cm auseinander liegen: dann ein dritter in der Mitte
  const maxAbstand = t >= 0.016 ? 1.05 : t >= 0.010 ? 0.80 : 0.60;
  // Keine doppelten Sparren an den Fugen: jedes Element hat einen Sparren an der linken Kante (bei den inneren genau unter der Fuge)
  // und je nach Plattenstärke einen in der Mitte; nur das rechte Element hat zusätzlich einen an der rechten Kante.
  // Die rechte Plattenkante liegt auf dem Fugensparren des Nachbarn und wird vom H-Profil gehalten.
  const sparrenZ = (i) => {
    const z0 = zP0 + i * PL.breite, z1 = z0 + PL.breite, r = H.a / 2 + 0.003, letztes = i === PL.anzahl - 1;
    const l = i === 0 ? zPf0 + r : z0, rr = letztes ? zPf1 - r : z1;      // rr: rechter Sparren bzw. Fuge zum Nachbarn
    const liste = rr - l - H.a > maxAbstand ? [l, (l + rr) / 2] : [l];
    return letztes ? [...liste, rr] : liste;
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
  const kbVorne = [[zEL[1], 1, "Ecke links"], [zMitte - H.a / 2, -1, "Mitte 1"], [zMitte + H.a / 2, 1, "Mitte 2"], [zEck[0], -1, "Ecke Mauer"]];
  for (const [z, s, nm] of kbVorne.filter((k) => !p.ohneMittelpfosten || !k[2].startsWith("Mitte")))
    kb(`Kopfband vorne ${nm}`, [xg0 + KBD / 2, tpUK - kd, z], [xg0 + KBD / 2, tpUK, z + s * kd], 5, ebZ(z), ebY(tpUK));
  kb("Kopfband Hauswand", [xF1 - KBD / 2, wpUK - kd, zh1], [xF1 - KBD / 2, wpUK, zh1 + kd], 5, ebZ(zh1), ebY(wpUK));
  for (const [x, s, nm] of [[xF0 + H.b, 1, "Hauswand"], [xg0, -1, "Ecke"]])
    kb(`Kopfband links ${nm} (an den linken Sparren)`, [x, spU(x + s * kd) - kd, zr + H.a / 2 - KBD / 2], [x + s * kd, spU(x + s * kd), zr + H.a / 2 - KBD / 2], 8, ebX(x), ebSparren(x + s * kd));

  // --- 6 Wandanschluss vorab (waagerecht) -----------------------------------------------------
  // Querschnitt: Schenkel an der Wand, oben Knick, schräger Schenkel mit Gummilippe bis auf die Platte
  const wpX = B.xFassade + 0.004, wpK = yTop(xP0) + 0.03, wlX = B.xFassade + 0.075, wlY = yTop(wlX) + 0.012;
  const dachL = zP1 - zP0, ebene = (pts, z) => pts.map(([x, y]) => [x, y, z]);
  box(6, "Kompriband 15/3–7 (oben hinter dem Wandprofil)", "dicht", B.xFassade, wpX, wpK - 0.015, wpK, zP0, zP1, { laenge: dachL, info: "Zuerst an die Wand kleben, bündig mit der Linie für die Oberkante des Profils. Es geht danach langsam auf und dichtet die Lücke zwischen Wand und Profil." });
  prisma(6, "Wandanschlussprofil Alu mit Dichtlippe (vorab geklebt)", "profil", ebene([[wpX, wpK - 0.045], [wpX, wpK], [wlX, wlY], [wlX, wlY - 0.002], [wpX + 0.002, wpK - 0.003], [wpX + 0.002, wpK - 0.045]], zP0), [0, 0, dachL], { laenge: dachL, info: `Auf ${cm(dachL)} cm kürzen. Oberkante auf ${cm(wpK)} cm (Linie mit Laser oder Schnur), mit Fix ALL in Raupen waagerecht an die Wand kleben, gegen das Kompriband drücken. Die Lippe zeigt schräg nach unten zum Garten.` });
  box(6, "Dichtlippe (Gummi, liegt später auf der Platte)", "dicht", wlX - 0.004, wlX, yTop(wlX) + 0.0005, wlY, zP0, zP1, { laenge: dachL, info: "Ist beim Profil dabei. Beim Einbau schiebst du die Platte darunter, die Lippe drückt dann von oben auf die Platte." });
  box(6, "Dichtfuge oben am Wandprofil (Fix ALL)", "dicht", B.xFassade, wpX + 0.004, wpK, wpK + 0.005, zP0, zP1, { laenge: dachL, info: "Eine Raupe Fix ALL oben über Profil und Kompriband ziehen und mit dem Finger glätten (Spüliwasser). So läuft kein Wasser hinter das Profil." });

  // --- 7/8 Dachelemente -----------------------------------------------------------------------------
  const xSp0 = xP0, xSp1 = xP1 - 0.03;                                      // Platte steht 3 cm über das Sparrenende
  const cS = (x) => yU(x) - d70 / 2;
  // Querschnitte senkrecht zur Platte: u längs der Neigung (nach vorne), nP senkrecht dazu nach oben
  const uP = [cos, -Math.sin(a), 0], nP = [Math.sin(a), cos, 0], eZ = [0, 0, 1];
  const quer = (O, e1, e2, pts) => pts.map(([s, h]) => v3.add(O, v3.add(v3.scale(e1, s), v3.scale(e2, h))));
  const ht = t / 2, bd = 0.0006, ws = 0.0015;                                 // halbe Plattenstärke, Klebeband, Wandstärke Profil
  const band = (L) => [[-L, ht + bd], [bd, ht + bd], [bd, -ht - bd], [-L, -ht - bd], [-L, -ht], [0, -ht], [0, ht], [-L, ht]];
  const schraubAbst = Array.from({ length: 6 }, (_, j) => 0.12 + (j * (1.93 - 0.12)) / 5);   // längs der Platte, 36 cm Abstand
  // Rinne: Marley halbrund RG 100, außen am Sparrenende, Oberkante 2,5 cm unter der Platte, 3 mm pro Meter Gefälle nach rechts
  const RA = 0.0535, RI = RA - 0.0025, xRc = xSp1 + 0.008 + RA;
  const zR0 = zP0 - 0.025, zR1 = zP1 + 0.025, rGef = 0.003;
  const yRand = (z) => yU(xSp1) - 0.025 - rGef * (z - zR0);
  const halbring = (r1, r2, n = 14) => [
    ...Array.from({ length: n + 1 }, (_, k) => { const w = (-Math.PI * k) / n; return [r2 * Math.cos(w), r2 * Math.sin(w)]; }),
    ...Array.from({ length: n + 1 }, (_, k) => { const w = -Math.PI + (Math.PI * k) / n; return [r1 * Math.cos(w), r1 * Math.sin(w)]; }),
  ];
  const elementNamen = ["Element links", "Element Mitte", "Element rechts"];
  const elemente = [];
  for (let i = 0; i < PL.anzahl; i++) {
    const z0 = zP0 + i * PL.breite, z1 = z0 + PL.breite;
    const name = elementNamen[i] ?? `Element ${i + 1}`;
    const minY = cS(xSp1) - d70 / 2;
    const e = { vor: { step: 7, dy: 0.85 - minY }, element: name };
    elemente.push(name);
    const sz = sparrenZ(i);
    for (const [zc, seite] of sz.map((z, k) => [z, k === 0 ? "links" : i === PL.anzahl - 1 && k === sz.length - 1 ? "rechts" : "Mitte"]))
    { const xk = (xF0 + 0.01 + xF1 + 0.035) / 2;
      schnittStab(8, `${name}: Klotz unter dem Sparrenende ${seite} (${cm(SK)} cm)`, "holz", [xk, wpOK, zc], [xk, spU(xk), zc], H.a, xF1 + 0.025 - xF0, null, ebSparren(xk), { ...holz, laenge: xF1 + 0.025 - xF0, kurzeKante: undefined, ...wk(p.neigung, "oben schräg, liegt satt am Sparren an"), schnitt: "auf den Böcken von der Seite an den Sparren schrauben", ...e });
      prisma(8, `${name}: Sparren ${seite}`, "holz", [[xSp0, spU(xSp0), zc - H.a / 2], [xg0, spU(xg0), zc - H.a / 2], [xg0, tpOK, zc - H.a / 2], [xg1, tpOK, zc - H.a / 2], [xSp1, spU(xSp1), zc - H.a / 2], [xSp1, yU(xSp1), zc - H.a / 2], [xSp0, yU(xSp0), zc - H.a / 2]], [0, 0, H.a], { laenge: (xSp1 - xSp0) / cos, ...holz, ...wk(p.neigung, "beide Enden, parallel"), schnitt: `Kerbe über der Traufpfette: ${cm(xg1 - xg0)} cm breit, hinten ${Math.round((spU(xg0) - tpOK) * 1000)} mm tief, vorne 0`, ...e });
      if (i === 0 && seite === "links") winkelLabels.push({ t: `${grad(p.neigung)}°`, p: [xSp1 + 0.02, cS(xSp1) + 0.1, zc], ab: 7, bis: 8 });
      // Plattenschrauben: alle ca. 36 cm, die erste 12 cm vom oberen Rand (davor liegt später die Dichtlippe)
      const fuge = i > 0 && seite === "links", zS = fuge ? zc + 0.014 : zc, auf = fuge ? ws : 0;
      for (const s of schraubAbst) {
        const O = quer([xP0, yTop(xP0) - t / cos / 2, zS], uP, nP, [[s, ht]])[0];
        const T = v3.add(O, v3.scale(nP, auf));
        stab(8, `${name}: Dichtscheibe mit Kappe`, "dicht", T, v3.add(T, v3.scale(nP, 0.007)), 0.019, 0.019, { info: "Gehört zur Schraube. Nur so fest anziehen, dass die Dichtscheibe satt aufliegt, die Distanzhülse darunter verhindert, dass du die Platte zerdrückst. Danach die Kappe aufklipsen.", ...e });
        stab(8, `${name}: Distanzhülse 10 mm (im 12-mm-Loch der Platte)`, "dicht", O, v3.sub(O, v3.scale(nP, t)), 0.010, 0.010, { info: "Erst ein 12-mm-Loch in die Platte bohren (Holzbohrer oder Stufenbohrer, langsam, ohne Schlag), dann die Hülse hineinstecken. Das Loch ist größer als die Hülse, damit die Platte sich bei Wärme ausdehnen kann.", ...e });
        stab(8, `${name}: Schraube 4,5 × 45 Edelstahl mit Dichtscheibe`, "stahl", v3.add(T, v3.scale(nP, 0.002)), v3.sub(O, v3.scale(nP, 0.043)), 0.0045, 0.0045, { info: `Durch die Hülse senkrecht zur Platte in den Sparren, ${fuge ? "an der Fuge 1,5 cm neben der Mitte durch das H-Profil und die eigene Platte, " : "mittig über dem Sparren, "}PH-Bit. Pro Sparren ${schraubAbst.length} Stück.`, ...e });
      }
      // Rinnenhalter: vorne an jedes Sparrenende geschraubt (auf den Böcken vormontiert)
      const yR = yRand(zc), xs = xSp1, Ro = RA + 0.004;
      const q0 = Math.acos((xs + 0.006 - xRc) / Ro);                       // dort trifft der Bügel die Rückenplatte
      const halter = [[xs, yR + 0.005], [xs + 0.008, yR + 0.005], [xs + 0.008, yR],
        ...Array.from({ length: 13 }, (_, k) => { const w = Math.PI + (Math.PI * (k + 1)) / 14; return [xRc + RA * Math.cos(w), yR + RA * Math.sin(w)]; }),
        [xRc + RA, yR], [xRc + Ro, yR],
        ...Array.from({ length: 13 }, (_, k) => { const w = 2 * Math.PI - (q0 * (k + 1)) / 14; return [xRc + Ro * Math.cos(w), yR + Ro * Math.sin(w)]; }),
        [xs + 0.006, yR - Ro * Math.sin(q0)], [xs + 0.006, yR - 0.04], [xs, yR - 0.04]];
      prisma(8, `${name}: Rinnenhalter für Stirnbrett (vorne ans Sparrenende)`, "rinne", ebene(halter, zc - 0.0125), [0, 0, 0.025], { info: `Mit 2 Edelstahlschrauben mittig an das senkrechte Sparrenende schrauben. Oberkante ${Math.round((yU(xSp1) - yR - 0.005) * 1000)} mm unter der Oberkante des Sparrens: so hat die Rinne 3 mm pro Meter Gefälle nach rechts zur Mauer. Marley RG 100, ein Halter pro Sparren (Abstand unter 70 cm).`, ...e });
    }
    const yc = (x) => yTop(x) - t / cos / 2;
    stab(8, `${name}: Platte ${PL.label}`, "platte", [xP0, yc(xP0), (z0 + z1) / 2], [xP1, yc(xP1), (z0 + z1) / 2], PL.breite - 0.006, t, { breite: PL.breite, info: "Stege zeigen in Gefällerichtung (zum Garten). Schutzfolie oben (bedruckt) erst nach dem Einbau abziehen, die bedruckte Seite ist die UV-Seite und kommt nach oben.", ...e });
    const zA = z0 + 0.003, zB = z1 - 0.003;                                   // Plattenkanten
    const Mo = (z) => [xP0, yc(xP0), z], Mu = (z) => [xP1, yc(xP1), z];
    prisma(8, `${name}: Antidust-Band geschlossen (obere Kante)`, "dicht", quer(Mo(zA), v3.scale(uP, -1), nP, band(0.012)), [0, 0, zB - zA], { laenge: zB - zA, info: "Kante sauber und trocken machen, Band mittig auf die Kante legen und oben und unten umklappen, fest andrücken. Das geschlossene Band hält Wasser und Dreck aus den Kammern.", ...e });
    prisma(8, `${name}: Antidust-Band gelocht (untere Kante)`, "dicht", quer(Mu(zA), uP, nP, band(0.012)), [0, 0, zB - zA], { laenge: zB - zA, info: "Wie oben, aber das gelochte Band: Kondenswasser kann unten raus, Staub und Insekten nicht rein.", ...e });
    const T2 = ht + bd, F = 0.02;
    prisma(8, `${name}: Tropfprofil (U-Profil mit Tropfnase) vorne`, "profil", quer(Mu(zA), uP, nP, [[-F, T2 + ws], [bd + ws, T2 + ws], [bd + ws, -T2 - 0.012], [bd, -T2 - 0.012], [bd, -T2 - ws], [-F, -T2 - ws], [-F, -T2], [bd, -T2], [bd, T2], [-F, T2]]), [0, 0, zB - zA], { laenge: zB - zA, info: "Über das gelochte Band auf die untere Kante stecken, Nase nach unten. Von ihr tropft das Wasser in die Rinne.", ...e });
    const lPl = PL.laenge;
    const uProfil = (z, r) => quer(Mo(z), nP, eZ, [[T2 + ws, -r * ws], [T2 + ws, r * F], [T2, r * F], [T2, 0], [-T2, 0], [-T2, r * F], [-T2 - ws, r * F], [-T2 - ws, -r * ws]]);
    if (i === 0) prisma(8, `${name}: Randprofil links (U-Profil)`, "profil", uProfil(zA, 1), v3.scale(uP, lPl), { laenge: lPl, info: "Auf die linke Seitenkante stecken. Schließt die Kammern seitlich.", ...e });
    if (i === PL.anzahl - 1) prisma(8, `${name}: Randprofil rechts (U-Profil)`, "profil", uProfil(zB, -1), v3.scale(uP, lPl), { laenge: lPl, info: "Auf die rechte Seitenkante stecken.", ...e });
    if (i > 0) {
      const W = 0.025, w = ws;
      prisma(8, `${name}: H-Verbindungsprofil an der linken Kante (vormontiert, hält auch die Platte des Nachbarn)`, "profil", quer(Mo(z0), nP, eZ, [[T2 + ws, -W], [T2 + ws, W], [T2, W], [T2, w], [-T2, w], [-T2, W], [-T2 - ws, W], [-T2 - ws, -W], [-T2, -W], [-T2, -w], [T2, -w], [T2, -W]]), v3.scale(uP, lPl), { laenge: lPl, info: "Auf den Böcken auf die linke Kante dieser Platte stecken. Die Schrauben über dem Fugensparren gehen durch das Profil. Beim Einbau schiebst du die rechte Kante des Nachbarelements in die freie Seite.", ...e });
    }
  }
  // Rinne: Marley halbrund RG 100 in einem Stück (4-m-Rinne auf 3,20 m gekürzt), von innen in die Halter eingeklipst
  const rL = zR1 - zR0, rExt = [0, -rGef * rL, rL], rE2 = v3.norm([0, 1, rGef]);
  const zRs = zR0 + 2.0, rStk = [[zR0, zRs, "links, 2 m ganz"], [zRs, zR1, `rechts, auf ${cm(zR1 - zRs)} cm gekürzt`]];
  for (const [za, zb, wo] of rStk)
    prisma(8, `Dachrinne halbrund RG 100 ${wo}`, "rinne", quer([xRc, yRand(za), za], [1, 0, 0], rE2, halbring(RI, RA)), [0, -rGef * (zb - za), zb - za], { laenge: zb - za, info: `Zwei 2-m-Rinnen, zusammen ${cm(rL)} cm. Die rechte mit feiner Säge kürzen und dort das Loch für den Stutzen sägen. Von innen in die Halter legen und vorne einklipsen. Die Rinne fällt 3 mm pro Meter nach rechts.` });
  prisma(8, "Rinnenverbinder halbrund RG 100", "rinne", quer([xRc, yRand(zRs - 0.06), zRs - 0.06], [1, 0, 0], rE2, halbring(RA, RA + 0.004)), [0, -rGef * 0.12, 0.12], { info: "Verbindet die beiden Rinnenstücke: beide Enden bis zur Markierung einstecken (Einstecktiefe beachten, Spiel für die Wärmeausdehnung), dann einrasten. Die Dichtung ist schon drin." });
  const halbscheibe = (r, n = 14) => Array.from({ length: n + 1 }, (_, k) => { const w = (-Math.PI * k) / n; return [r * Math.cos(w), r * Math.sin(w)]; });
  prisma(8, "Rinnenendstück halbrund RG 100", "rinne", quer([xRc, yRand(zR0), zR0 - 0.006], [1, 0, 0], [0, 1, 0], halbscheibe(RA + 0.003)), [0, 0, 0.006], { info: "Links und rechts gleich: auf das Rinnenende stecken, bis es einrastet. Die Gummidichtung ist schon drin." });
  prisma(8, "Rinnenendstück halbrund RG 100", "rinne", quer([xRc, yRand(zR1), zR1], [1, 0, 0], [0, 1, 0], halbscheibe(RA + 0.003)), [0, 0, 0.006], { info: "Links und rechts gleich: auf das Rinnenende stecken, bis es einrastet. Die Gummidichtung ist schon drin." });
  // Stutzen zwischen den beiden rechten Sparren: die Rinne läuft ungeteilt hindurch, unten ein Loch in die Rinne
  const rechts = sparrenZ(PL.anzahl - 1), zSt = (rechts[rechts.length - 1] + rechts[rechts.length - 2]) / 2 + 0.10;
  prisma(8, "Rinnenstutzen 100/75 (die Rinne läuft hindurch)", "rinne", quer([xRc, yRand(zSt - 0.09), zSt - 0.09], [1, 0, 0], rE2, halbring(RA, RA + 0.004)), [0, -rGef * 0.18, 0.18], { info: `Sitzt ${cm(zR1 - zSt)} cm vor dem rechten Rinnenende. Rinne durch den Stutzen schieben, unten in die Rinne ein Loch von ca. 7 cm sägen oder mit der Lochsäge bohren, Kanten entgraten. Das Fallrohr DN 75 steckst du später unten an.` });
  stab(8, "Rinnenstutzen: Ablauf nach unten (Fallrohr DN 75 später)", "rinne", [xRc, yRand(zSt) - RA + 0.004, zSt], [xRc, yRand(zSt) - RA - 0.09, zSt], 0.075, 0.075, { info: "Bis das Fallrohr dran ist, einen Eimer drunter stellen oder einen kurzen Bogen aufstecken." });
  // Sparrenpfettenanker: an jedem Sparren vorne und hinten einer, abwechselnd links und rechts (am Rand jeweils innen)
  {
    const alle = Array.from({ length: PL.anzahl }, (_, i) => sparrenZ(i)).flat().sort((u, w) => u - w);
    const anker = (nm, xf, dx, yj, zs, sz) => prisma(8, nm, "stahl",
      [[xf, yj - 0.105, zs], [xf + dx * 0.032, yj - 0.105, zs], [xf + dx * 0.032, yj - 0.105, zs + sz * 0.002], [xf + dx * 0.002, yj - 0.105, zs + sz * 0.002], [xf + dx * 0.002, yj - 0.105, zs + sz * 0.032], [xf, yj - 0.105, zs + sz * 0.032]],
      [0, 0.17, 0], { laenge: 0.17, info: `Sparrenpfettenanker 170 mm. Von innen in die Ecke zwischen ${nm.includes("vorne") ? "Sparren und Traufpfette" : "Klotz unter dem Sparren und Wandpfette"} halten: ein Schenkel liegt seitlich am ${nm.includes("vorne") ? "Sparren" : "Klotz"}, der andere an der Pfette. Je 4 SPAX 5 × 40 in beide Hölzer (T20-Bit). Ob es ein „linker“ oder „rechter“ Anker ist, siehst du beim Anhalten. Erst setzen, wenn das Element richtig liegt.` });
    alle.forEach((zc, k) => {
      const vorneSeite = k === 0 ? 1 : k === alle.length - 1 ? -1 : k % 2 ? -1 : 1;
      const hintenSeite = k === 0 || k === alle.length - 1 ? vorneSeite : -vorneSeite;
      anker(`Sparrenpfettenanker vorne, ${vorneSeite > 0 ? "rechts" : "links"} am Sparren`, xg0, -1, tpOK, zc + (vorneSeite * H.a) / 2, vorneSeite);
      anker(`Sparrenpfettenanker hinten, ${hintenSeite > 0 ? "rechts" : "links"} am Klotz`, xF1, 1, wpOK, zc + (hintenSeite * H.a) / 2, hintenSeite);
    });
  }
  // Füllhölzer zwischen den Sparren über der Traufpfette
  {
    const alle = Array.from({ length: PL.anzahl }, (_, i) => sparrenZ(i)).flat().sort((u, w) => u - w);
    for (let k = 0; k + 1 < alle.length; k++) {
      const za = alle[k] + H.a / 2, zb = alle[k + 1] - H.a / 2;
      if (zb > za + 0.05) box(8, "Füllholz über der Traufpfette", "holz", xg0, xg1, tpOK, yU(xG) - 0.003, za, zb, { ...holz, laenge: zb - za });
    }
  }

  // --- 9 Katzennetz: Feld für Feld zwischen den Hölzern, wie eine Fensterscheibe -------------------------
  // Netz 2 cm hinter der Außenkante, Rand auf die Seitenflächen getackert, Leiste 20×20 außen bündig drüber.
  // Die Innenseiten von Pfosten und Balken bleiben frei für spätere Wandelemente.
  const leiste = (name, x0, x1, y0, y1, z0, z1) => box(9, name, "holz", x0, x1, y0, y1, z0, z1, { laenge: Math.max(x1 - x0, y1 - y0, z1 - z0) });
  const xN = xg1 - KL;                                                        // Netzebene Gartenseite
  const felder = p.ohneMittelpfosten ? [[zEL[1], zEck[0]]] : [[zEL[1], zMitte - H.a / 2], [zMitte + H.a / 2, zEck[0]]];
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
  // Fensternische hinter dem Pfosten an der Hauswand: kein Holz fürs Netz, deshalb komplett zu mit einer Platte (vom Boden bis unter den Sturz)
  {
    const xa = B.xGlas + 0.01, xb = xF0 + H.b, d = 0.018, yo = B.hSturzUK;
    box(9, "Seitenwand in der Fensternische (Platte 18 mm, vom Boden bis unter den Sturz)", "holz", xa, xF0, 0.005, yo, zl1 - d, zl1, { laenge: yo, schnitt: `ca. ${cm(xF0 - xa)} × ${cm(yo - 0.005)} cm, z. B. Siebdruck, OSB oder Bretter` });
    box(9, "Seitenwand neben dem Pfosten (gleiche Platte, auf deinem Balken)", "holz", xF0, xb, hB, yo, zl1 - d, zl1, { laenge: yo - hB, schnitt: "vorne außen am Pfosten an der Hauswand" });
    box(9, "Leiste 20×40 unter dem Sturz (mit Fix ALL geklebt)", "holz", xa, xF0, yo - 0.04, yo, zl1, zl1 + 0.02, { laenge: xF0 - xa });
    box(9, "Leiste 20×40 an der Fensterlaibung (mit Fix ALL geklebt, bis zum Boden)", "holz", xa, xa + 0.04, 0, yo - 0.04, zl1, zl1 + 0.02, { laenge: yo - 0.04 });
    box(9, "Leiste 20×40 unten auf dem Boden (mit Fix ALL geklebt)", "holz", xa + 0.04, xF0, 0, 0.04, zl1, zl1 + 0.02, { laenge: xF0 - xa - 0.04 });
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
  leiste("Klemmleiste Mauerstreifen unten (auf deinem Balken auf der Mauer)", xF1, B.xWandEnde, kUK, kUK + KL, zs - KL, zs);
  stab(9, "Klemmleiste Mauerstreifen oben (unter dem rechten Sparren)", "holz", [xF1, spU(xF1) - KL / 2, zs - KL / 2], [B.xWandEnde, spU(B.xWandEnde) - KL / 2, zs - KL / 2], KL, KL);

  // --- Kennwerte & Prüfungen -----------------------------------------------------------------------
  const alleSparren = Array.from({ length: PL.anzahl }, (_, i) => sparrenZ(i));
  const sortiert = alleSparren.flat().sort((u, w) => u - w);
  const sparrenAbstand = Math.max(...sortiert.slice(1).map((z, k) => z - sortiert[k] - H.a));
  const sproElement = Math.max(...alleSparren.map((sz) => sz.length)), sparrenAnzahl = sortiert.length;
  const elementKg = Math.round(sproElement * 4.0 + 170 * t * PL.laenge * PL.breite + 1);   // Douglasie ca. 4 kg pro Sparren
  const kennwerte = {
    neigung: p.neigung, gefaelleCmProM: tan * 100,
    hoeheWand: yTop(xP0), hoeheVorne: yTop(xP1), fugeWand: wpK + 0.005,
    ueberstand, kopfWand: wpUK, kopfVorne: tpUK, ueberKrone: p.hoeheVorne - B.hMauerkrone,
    plattenAnzahl: PL.anzahl, sparrenAnzahl, sparrenAbstand, elementKg,
    dachLaenge: zP1 - zP0, dachTiefe: xP1 - xP0, elemente: elemente.length,
  };
  const hinweise = [];
  hinweise.push(p.neigung < 7
    ? { stufe: "warn", text: `Unter 7° bleibt auf Stegplatten leicht Wasser und Laub liegen. Die meisten Hersteller verlangen mindestens 5°.` }
    : { stufe: "ok", text: `${grad(p.neigung)}° Neigung nach vorne: ${cm(yTop(xP0) - yTop(xP1))} cm Höhenunterschied auf 2 m Platte.` });
  hinweise.push({ stufe: "ok", text: `Alle Querbalken sind genau ${cm(B.querbalken)} cm lang, ohne Stoß, und liegen rechts ${cm(zPf1 - B.zWand)} cm auf der Mauer. Deine 3 Platten ${PL.label} decken ${cm(zP1 - zP0)} cm ab, ohne Zuschnitt: Sie stehen links und rechts je ${cm(zPf0 - zP0)} cm über die äußeren Dachbalken (mit Randprofil kein Problem). Rechts reicht die Platte ${cm(zP1 - B.zWand)} cm auf die Mauer, links ${Math.abs(zP0 - B.zLinksAussen) < 0.01 ? "bis zur Außenkante der Brüstung" : `${cm(Math.abs(zP0 - B.zLinksAussen))} cm ${zP0 < B.zLinksAussen ? "über" : "vor"} die Außenkante der Brüstung`}.` });
  hinweise.push({ stufe: "ok", text: `Rechts stehen die Platten ${cm(zP1 - B.zWand)} cm über die Betonmauer, das Regenwasser läuft außen auf die Mauer. Der rechte Dachbalken liegt nicht auf der Mauer, er wird wie alle anderen von den beiden Querbalken getragen. Zwischen deinem Balken auf der Mauer und dem Dachbalken bleibt eine Lücke von ${cm(spU(B.xWandEnde) - kUK)} cm (vorne) bis ${cm(spU(xF1) - kUK)} cm (hinten). Die schließt das Netz, gegen Schlagregen von der Seite zusätzlich ein Brett innen an den Dachbalken schrauben. Nur die Wandpfette liegt hinten auf deinem flachen Balken auf der Krone.` });
  hinweise.push(ueberstand < 0.05
    ? { stufe: "warn", text: `Vorne stehen die Platten nur ${cm(ueberstand)} cm über die Brüstung. Die Rinne braucht etwas Platz, weniger Neigung wählen.` }
    : { stufe: "ok", text: `Vorne stehen die Platten ${cm(ueberstand)} cm über die Brüstung. Die Rinne fängt das Wasser auf, damit nichts auf dein späteres unteres Catio tropft. Der Ablauf sitzt an der Betonmauer.` });
  hinweise.push(sparrenAbstand > maxAbstand + 0.001
    ? { stufe: "warn", text: `Sparrenabstand ${cm(sparrenAbstand)} cm ist für ${Math.round(t * 1000)} mm Platten zu weit. Pro Element einen dritten Sparren einplanen.` }
    : { stufe: "ok", text: `Insgesamt ${sparrenAnzahl} Sparren, an den Plattenfugen nur einer (die Nachbarplatte liegt mit auf und wird vom H-Profil gehalten)${alleSparren[0].length > 1 ? ", dazu je einer in der Mitte, weil die Platten nur " + Math.round(t * 1000) + " mm dick sind" : ""}. Lichter Abstand höchstens ${cm(sparrenAbstand)} cm (Richtwert bis ${cm(maxAbstand)} cm bei ${Math.round(t * 1000)} mm).` });
  hinweise.push({ stufe: "ok", text: `Die Fuge an der Hauswand ist waagerecht auf ${cm(yTop(xP0))} cm, ${yTop(xP0) > B.hSturzOK ? "auf dem Ziegel über dem Betonsturz. Mörtelfugen hinter dem Profil satt mit MS-Polymer füllen." : "auf dem glatten Betonsturz."}` });
  const profilOK = wpK + 0.005;
  hinweise.push(profilOK > B.hWandFrei
    ? { stufe: "warn", text: `Das Wandprofil reicht bis ${cm(profilOK)} cm, die Hauswand ist aber nur bis ${cm(B.hWandFrei)} cm frei. Dach vorne tiefer oder flacher bauen.` }
    : { stufe: "ok", text: `Das Wandprofil endet bei ${cm(profilOK)} cm, die Hauswand ist bis ${cm(B.hWandFrei)} cm frei (${cm(B.hWandFrei - profilOK)} cm Reserve).` });
  hinweise.push({ stufe: "ok", text: `Die Rinne fällt 3 mm pro Meter zur Betonmauer. Kurz davor sitzt der Rinnenstutzen, das Fallrohr kann später an der Mauerecke runter.` });
  hinweise.push({ stufe: tpUK < 1.95 ? "warn" : "ok", text: `Kopffreiheit: ${cm(wpUK)} cm unter der Wandpfette, ${cm(tpUK)} cm unter der Traufpfette vorne.` });
  hinweise.push({ stufe: "ok", text: `Elemente: je ca. ${elementKg} kg, 2,0 m × 1,05 m. Die Öffnung im Rahmen ist ${cm(xg0 - xF1)} cm tief und 3 m breit. Längs gedreht passen die ersten beiden flach durch und werden oben gedreht, das letzte geht leicht gekippt (ca. 35°) durch die Restöffnung.` });
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
    const I = (H.b * Math.pow(tpLagen * H.a, 3)) / 12, f = (5 * q * 1000 * Math.pow(L, 4)) / (384 * 11e9 * I);
    const sigma = ((q * L * L) / 8) / ((H.b * Math.pow(tpLagen * H.a, 2)) / 6) / 1000;   // N/mm²
    hinweise.push({ stufe: f > L / 200 ? "warn" : "ok", text: p.ohneMittelpfosten
      ? `Ohne Mittelpfosten spannt die doppelte Traufpfette (2 × 70×55 flach, verklebt und verschraubt) ${cm(L)} cm frei. Grob gerechnet biegt sie sich unter Schnee ${(f * 1000).toFixed(0)} mm durch (${sigma.toFixed(0)} N/mm²). Dafür ist vorne die Kopffreiheit ${cm(H.b)} cm niedriger und es braucht mehr Holz.`
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
    { t: `${grad(p.neigung)}° nach vorne`, p: [0.2, yTop(0.2) + 0.12, 0.4], ab: 8, bis: 9 },
    { t: `Rinne`, p: [xP1 + 0.08, yTop(xP1) - 0.18, 2.3], ab: 8, bis: 9 },
  ];
  masse.push(...winkelLabels);

  const schritte = SCHRITTE.map((st) => ({ ...st, text: (VARIANTE_TEXT[st.n] ?? ((t) => t))(st.text, p).replace("etwa 12 kg", `etwa ${elementKg} kg`).replace("{DACH_L}", cm(dachL)).replace("{NEIGUNG}", grad(p.neigung)).replace("{WP_OK}", cm(wpK)).replace("{RINNE_L}", cm(rL)).replace("zwei Sparren 70×55 darunter, Platte mit Abstandshaltern und Dichtschrauben drauf.", `${alleSparren.map((sz, i) => `${["links", "Mitte", "rechts"][i] ?? i + 1} ${sz.length}`).join(", ")} Sparren 70×55 darunter: einer an der linken Kante${alleSparren[0].length > 1 ? ", einer in der Mitte" : ""}, nur das rechte Element hat auch an der rechten Kante einen. An den Plattenfugen liegt so kein doppelter Sparren, die rechte Kante liegt später auf dem Sparren des Nachbarn. Dann die Platte mit Abstandshaltern und Dichtschrauben drauf.`) }));
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
  const L = k.dachLaenge;
  const rand = netzRand(parts);
  const anz = (n) => parts.filter((q) => q.name.includes(n)).length;
  const zeilen = [
    { status: "bestellen", teil: "Edelstahlschrauben 4,5 × 45 mit Dichtscheibe und Kappe (z. B. Gutta V2A)", menge: `${anz("Schraube 4,5")}`, hinweis: "durch die Platte in die Sparren, alle 36 cm, PH-Bit" },
    { status: "bestellen", teil: `Distanzhülsen für M5, ${mm} mm lang (Kunststoff)`, menge: `${anz("Distanzhülse")}`, hinweis: "in die 12-mm-Löcher der Platte, damit du sie beim Schrauben nicht zerdrückst" },
    { status: "bestellen", teil: "Antidust-Set für 6–10 mm Stegplatten (Band geschlossen + Band gelocht)", menge: `je ${cm(L + 0.2)} cm`, hinweis: "geschlossen oben an der Hauswand, gelocht unten vorne" },
    { status: "bestellen", teil: `H-Verbindungsprofil Polycarbonat ${mm} mm`, menge: `${PLATTE.anzahl - 1} × ${cm(PLATTE.laenge)} cm`, hinweis: "verbindet die Elemente ohne Schrauben von oben" },
    { status: "bestellen", teil: "Wandanschlussprofil Alu mit Dichtlippe", menge: `${cm(L)} cm`, hinweis: "waagerecht an die Hauswand" },
    { status: "bestellen", teil: "Kompriband 15/3–7 mm", menge: `${cm(L + 0.2)} cm`, hinweis: "hinter dem Wandprofil" },
    { status: "bestellen", teil: "MS-/Hybrid-Polymer-Kleber, außen, UV-fest (z. B. dein Soudal Fix ALL X-Treme Power)", menge: "ca. 5 Kartuschen", hinweis: "nur punktuell oder in Raupen: Unterlegplatten, Wandpfosten, Wandpfette an der Hauswand, Wandprofil. Für die sichtbare Dichtfuge besser ein elastischer Dichtstoff" },
    { status: "bestellen", teil: "Kunststoff-Unterlegplatten (Terrassenpads) 10 mm", menge: "1 Pack (mind. 6)", hinweis: "unter den Klötzen auf der Mauer und dem Wandpfosten, Wasser läuft darunter ab" },
    { status: "bestellen", teil: "U-Bügel (Rundstahlbügel M8) mit Gegenplatte, passend zum Geländerrohr", menge: `${parts.filter((q) => q.name.endsWith("U-Bügel ans Geländer")).length}`, hinweis: "je tragender Pfosten einer, Rohrdurchmesser messen; hast du sie schon, nur prüfen" },
    { status: "bestellen", teil: "Marley Dachrinne halbrund RG 100, 2 m", menge: "2", hinweis: `zusammen ${cm(L + 0.05)} cm, das rechte Stück kürzen` },
    { status: "bestellen", teil: "Marley Rinnenverbinder halbrund RG 100", menge: "1", hinweis: "verbindet die beiden Rinnenstücke" },
    { status: "bestellen", teil: "Marley Endstück halbrund RG 100 (links und rechts gleich)", menge: "2", hinweis: "gleiche Farbe wie die Rinne" },
    { status: "bestellen", teil: "Marley Rinnenstutzen 100/75", menge: "1", hinweis: "die Rinne läuft hindurch, unten ein Loch sägen; Fallrohr DN 75 später" },
    { status: "bestellen", teil: "Marley Kunststoff-Rinnenhalter RG 100 für Stirnbrett", menge: `${anz("Rinnenhalter")}`, hinweis: "einer an jedes Sparrenende, auf den Böcken vormontieren" },
    { status: "bestellen", teil: "Platte für die Fensternische, 15–18 mm (Siebdruck, OSB oder Bretter)", menge: "ca. 40 × 240 cm", hinweis: "schließt die Nische hinter dem Pfosten an der Hauswand, vom Boden bis unter den Sturz" },
    { status: "bestellen", teil: "Leisten 20×40 für die Platte in der Nische", menge: "ca. 3,5 m", hinweis: "mit Fix ALL an Sturz, Fensterlaibung und Boden kleben" },
    { status: "bestellen", teil: "Holzleisten 20×20 als Klemmleisten fürs Netz (außen bündig in den Feldern)", menge: `ca. ${Math.ceil(rand * 1.1)} m`, hinweis: "von innen über den Netzrand schrauben" },
    { status: "bestellen", teil: "Edelstahlschrauben 4×40 für die Klemmleisten", menge: `${Math.ceil(rand / 0.25)}`, hinweis: "alle 25 cm" },
    { status: "vorhanden", teil: `${HOLZ}, 3,00 m`, menge: `${stangen.length} Stangen`, hinweis: `Verschnitt ${cm(stangen.reduce((s, x) => s + Math.max(0, x.rest), 0))} cm` },
    { status: "vorhanden", teil: `Polycarbonat-Stegplatten ${PLATTE.label}`, menge: `3 von 3`, hinweis: "Stege in Gefällerichtung (zum Garten)" },
    { status: "vorhanden", teil: "Randprofile, Tropfprofil", menge: `2 × ${cm(PLATTE.laenge)} cm, ${cm(L)} cm`, hinweis: "Seitenkanten links und rechts, vordere Kante" },
    { status: "vorhanden", teil: "Winkelverbinder mit Sicke, ca. 60×60×40", menge: "ca. 30", hinweis: "je Pfosten zwei auf gegenüberliegenden Seiten, Eckriegel, Klötze an der Mauer" },
    { status: "bestellen", teil: "Sparrenpfettenanker 170 mm, halb links, halb rechts", menge: `${anz("Sparrenpfettenanker")}`, hinweis: "je Sparrenende einer, abwechselnd links und rechts (hinten am Klotz)" },
    { status: "bestellen", teil: "SPAX Holzverbinderschrauben 5 × 40 (T20)", menge: `${anz("Sparrenpfettenanker") * 8}`, hinweis: "8 je Anker: 4 in den Sparren bzw. Klotz, 4 in die Pfette" },
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
