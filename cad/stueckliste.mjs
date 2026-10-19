// Schreibt docs/stueckliste.md aus dem Modell (mit Standardwerten oder eigenen Werten).
// Aufruf: node cad/stueckliste.mjs [neigung=8] [hoeheFassade=2.5] [ueberstand=0.15] ...
import { writeFileSync, mkdirSync } from "node:fs";
import { baueModell, cm } from "./modell.js";

const param = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")).map(([k, v]) => [k, Number(v)]));
const m = baueModell(param);
const k = m.kennwerte;
const z = [];
z.push("# Stückliste Balkon-Catio", "");
z.push("Automatisch erzeugt mit `node cad/stueckliste.mjs` aus `cad/modell.js`.");
z.push("Die Maße stammen aus dem LiDAR-Scan (±2 cm). **Vor dem Zuschnitt am Balkon nachmessen.**", "");
z.push("## Planungswerte", "", "| Wert | |", "|---|---|");
z.push(`| Dachneigung | ${m.param.neigung}° (${k.gefaelleCmProM.toFixed(0)} cm/m) |`);
z.push(`| Oberkante Dach an der Fassade | ${cm(k.hoeheFassade)} cm |`);
z.push(`| Oberkante Dach an der Traufe | ${cm(k.hoeheTraufe)} cm |`);
z.push(`| Kopffreiheit unter der Traufpfette | ${cm(k.lichteGarten)} cm |`);
z.push(`| Stegplatten | ${k.plattenAnzahl} Stück, ${cm(k.plattenLaenge)} cm lang |`);
z.push(`| Sparren | ${k.sparrenAnzahl} Stück, max. Abstand ${cm(k.sparrenAbstand)} cm |`, "");
z.push("## Prüfungen", "");
for (const h of m.hinweise) z.push(`- ${{ warn: "⚠️", ok: "✔", info: "ℹ️" }[h.stufe]} ${h.text}`);
z.push("", "## Einkaufsliste", "", "| Gruppe | Teil | Menge | Hinweis |", "|---|---|---|---|");
for (const e of m.einkauf.zeilen) z.push(`| ${e.gruppe} | ${e.teil} | ${e.menge} | ${e.hinweis} |`);
z.push("", "## Zuschnitt Holz", "");
for (const { profil, lager, stangen } of m.einkauf.zuschnitt) {
  z.push(`### ${profil}: ${stangen.length} × ${cm(lager)} cm`, "", "| Stange | Zuschnitt (cm) | Rest (cm) |", "|---|---|---|");
  stangen.forEach((s, i) => z.push(`| ${i + 1} | ${s.teile.map((q) => `${cm(q.laenge)} ${q.name}`).join(" · ")} | ${cm(Math.max(0, s.rest))} |`));
  z.push("");
}
mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
writeFileSync(new URL("../docs/stueckliste.md", import.meta.url), z.join("\n"));
console.log(`${m.parts.length} Bauteile · ${m.einkauf.zeilen.length} Einkaufspositionen`);
for (const h of m.hinweise) console.log(`${h.stufe}: ${h.text}`);
