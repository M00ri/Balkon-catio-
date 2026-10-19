// Schreibt docs/stueckliste.md aus dem Modell (mit Standardwerten oder eigenen Werten).
// Aufruf: node cad/stueckliste.mjs [neigung=8] [hoeheVorne=2.71] [plattenStaerke=0.016] [ohneMittelpfosten=true] [ecke=gerade|riegel|kopfholz]
import { writeFileSync, mkdirSync } from "node:fs";
import { baueModell, cm, HOLZ, LAGER } from "./modell.js";

const param = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")).map(([k, v]) => [k, v === "true" ? true : v === "false" ? false : isNaN(+v) ? v : +v]));
const m = baueModell(param);
const k = m.kennwerte;
const z = [];
z.push("# Stückliste Balkon-Catio", "");
z.push("Automatisch erzeugt mit `node cad/stueckliste.mjs` aus `cad/modell.js`.");
z.push("Die Maße stammen aus Scan und Fotos (±2 cm). **Vor dem Zuschnitt am Balkon nachmessen.**", "");
z.push("## Planungswerte", "", "| Wert | |", "|---|---|");
z.push(`| Dachneigung | ${m.param.neigung}° nach vorne (${k.gefaelleCmProM.toFixed(0)} cm/m) |`);
z.push(`| Platten | ${k.plattenAnzahl} × ${m.platte.label}, ${Math.round(m.param.plattenStaerke * 1000)} mm |`);
z.push(`| Oberkante Dach an der Hauswand / vorne | ${cm(k.hoeheWand)} / ${cm(k.hoeheVorne)} cm |`);
z.push(`| Überstand vorne über die Brüstung | ${cm(k.ueberstand)} cm |`);
z.push(`| Kopffreiheit Wandpfette / Traufpfette | ${cm(k.kopfWand)} / ${cm(k.kopfVorne)} cm |`);
z.push(`| Dachelemente | ${k.elemente} Stück, je 2 Sparren |`, "");
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
