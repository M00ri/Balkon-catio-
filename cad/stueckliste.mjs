// Schreibt docs/stueckliste.md aus dem Modell (mit Standardwerten oder eigenen Werten).
// Aufruf: node cad/stueckliste.mjs [neigung=6] [platte=2x2] [plattenStaerke=0.016]
import { writeFileSync, mkdirSync } from "node:fs";
import { baueModell, cm, HOLZ, LAGER } from "./modell.js";

const param = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")).map(([k, v]) => [k, isNaN(+v) ? v : +v]));
const m = baueModell(param);
const k = m.kennwerte;
const z = [];
z.push("# Stückliste Balkon-Catio", "");
z.push("Automatisch erzeugt mit `node cad/stueckliste.mjs` aus `cad/modell.js`.");
z.push("Die Maße stammen aus dem LiDAR-Scan (±2 cm). **Vor dem Zuschnitt am Balkon nachmessen.**", "");
z.push("## Planungswerte", "", "| Wert | |", "|---|---|");
z.push(`| Dachneigung | ${m.param.neigung}° (${k.gefaelleCmProM.toFixed(0)} cm/m) |`);
z.push(`| Platten | ${k.plattenAnzahl} × ${m.platte.label}, ${Math.round(m.param.plattenStaerke * 1000)} mm |`);
z.push(`| Oberkante Dach an der Betonmauer / links | ${cm(k.hoeheMauer)} / ${cm(k.hoeheLinks)} cm |`);
z.push(`| Fuge an der Hauswand links | ${cm(k.fugeLinks)} cm |`);
z.push(`| Kopffreiheit vor der Tür / links | ${cm(k.kopfTuer)} / ${cm(k.kopfLinks)} cm |`);
z.push(`| Sparrenlinien | ${k.sparrenAnzahl} Stück, max. Abstand ${cm(k.sparrenAbstand)} cm |`, "");
z.push("## Prüfungen", "");
for (const h of m.hinweise) z.push(`- ${{ warn: "⚠️", ok: "✔", info: "ℹ️" }[h.stufe]} ${h.text}`);
for (const [status, titel] of [["bestellen", "Noch bestellen"], ["vorhanden", "Hast du schon (nur prüfen)"]]) {
  z.push("", `## ${titel}`, "", "| Teil | Menge | Hinweis |", "|---|---|---|");
  for (const e of m.einkauf.zeilen.filter((e) => e.status === status)) z.push(`| ${e.teil} | ${e.menge} | ${e.hinweis} |`);
}
z.push("", `## Zuschnitt ${HOLZ} aus ${cm(LAGER)}-cm-Stangen`, "", "| Stange | Zuschnitt (cm) | Rest (cm) |", "|---|---|---|");
m.einkauf.stangen.forEach((s, i) => z.push(`| ${i + 1} | ${s.teile.map((q) => `${cm(q.laenge)} ${q.name}${q.schnitt ? ` (${q.schnitt})` : ""}`).join(" · ")} | ${cm(Math.max(0, s.rest))} |`));
z.push("");
mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
writeFileSync(new URL("../docs/stueckliste.md", import.meta.url), z.join("\n"));
console.log(`${m.parts.length} Bauteile · ${m.einkauf.stangen.length} Stangen`);
for (const h of m.hinweise) console.log(`${h.stufe}: ${h.text}`);
