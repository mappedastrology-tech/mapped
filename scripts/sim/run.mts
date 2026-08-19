/**
 * 12-persona simulation — runs every persona through the app's REAL engines
 * (astrology → numerology → Human Design → Resonance ×4 libraries) exactly as
 * the profile page does, twice each for determinism, and emits a JSON report.
 *
 * Run: npx tsx scripts/sim/run.mts
 */
import { writeFileSync } from "node:fs";
import { calculateChart } from "../../src/lib/astro/calculateChart.ts";
import { computeNumerology } from "../../src/lib/numerology.ts";
import { computeHumanDesign } from "../../src/lib/humanDesign/engine.ts";
import { computeResonance } from "../../src/lib/resonance/engine.ts";
import { computeAnimalGuide } from "../../src/lib/resonance/animals.ts";
import { computeDeity } from "../../src/lib/resonance/deities.ts";
import { computeCharacter } from "../../src/lib/resonance/characters.ts";

// Persona roster (matches the Personas sheet). lat/lon = birthplace.
const PERSONAS = [
  { id:"P01", name:"Ava Chen",          date:"1990-07-15", time:"14:30", place:"New York, USA",      lat:40.7128,  lon:-74.0060 },
  { id:"P02", name:"Mateo Rossi",       date:"1985-10-27", time:"02:30", place:"Rome, Italy",        lat:41.9028,  lon:12.4964 },
  { id:"P03", name:"Zainab Al-Farsi",   date:"1993-02-18", time:"23:50", place:"Dubai, UAE",         lat:25.2048,  lon:55.2708 },
  { id:"P04", name:"Freya Þórsdóttir",  date:"1998-12-21", time:"03:10", place:"Reykjavík, Iceland", lat:64.1466,  lon:-21.9426 },
  { id:"P05", name:"Kwame Mensah",      date:"1979-12-31", time:"23:55", place:"Accra, Ghana",       lat:5.6037,   lon:-0.1870 },
  { id:"P06", name:"Mia Nakamura",      date:"2000-02-29", time:"12:00", place:"Tokyo, Japan",       lat:35.6762,  lon:139.6503 },
  { id:"P07", name:"Lucas Silva",       date:"1988-02-05", time:"21:40", place:"São Paulo, Brazil",  lat:-23.5505, lon:-46.6333 },
  { id:"P08", name:"Priya Nair",        date:"1995-09-05", time:"18:20", place:"Mumbai, India",      lat:19.0760,  lon:72.8777 },
  { id:"P09", name:"Sam Rivers",        date:"1992-04-04", time:"12:00", place:"Denver, USA",        lat:39.7392,  lon:-104.9903, unknownTime:true },
  { id:"P10", name:"Noor Haddad",       date:"1990-06-13", time:"08:15", place:"Beirut, Lebanon",    lat:33.8938,  lon:35.5018 },
  { id:"P11", name:"Elena Petrova",     date:"1970-06-13", time:"10:05", place:"Moscow, USSR",       lat:55.7558,  lon:37.6173 },
  { id:"P12", name:"Diego Torres-Vega", date:"1996-04-19", time:"05:50", place:"Mexico City, Mexico",lat:19.4326,  lon:-99.1332 },
];

// The app stores signs ABBREVIATED (e.g. "Gem"); the resonance engine's tables
// are keyed by FULL names. Model both so we measure the live impact.
const FULL: Record<string,string> = { Ari:"Aries",Tau:"Taurus",Gem:"Gemini",Can:"Cancer",Leo:"Leo",Vir:"Virgo",Lib:"Libra",Sco:"Scorpio",Sag:"Sagittarius",Cap:"Capricorn",Aqu:"Aquarius",Pis:"Pisces" };
const full = (s?: string|null) => (s ? (FULL[s] ?? s) : s);

function runOne(p: typeof PERSONAS[number], expandSigns: boolean) {
  const chart: any = calculateChart({ name:p.name, birthDate:p.date, birthTime:p.time, latitude:p.lat, longitude:p.lon, cityName:p.place, unknownTime:!!p.unknownTime });
  const num: any = computeNumerology(p.name, p.date);
  const hd: any = p.unknownTime ? null : computeHumanDesign({ birthDate:p.date, birthTime:p.time, latitude:p.lat, longitude:p.lon });
  const sx = expandSigns ? full : (s: any) => s;
  const bodies = [...chart.planets, ...chart.specialPoints];
  const placements = bodies.map((b: any) => ({ name:b.name, sign:sx(b.sign), house: p.unknownTime ? null : b.house }));
  const nums = [num?.lifePath, num?.expression, num?.soulUrge, num?.personality, num?.maturity, num?.birthday];
  const masters: number[] = []; const karmics: number[] = [];
  for (const n of nums) { if (!n) continue; if ([11,22,33].includes(n.value) && !masters.includes(n.value)) masters.push(n.value); const kd=(n as any).karmicDebt; if (kd && !karmics.includes(kd)) karmics.push(kd); }
  const r: any = computeResonance({
    sun: sx(chart.bigThree.sun), moon: sx(chart.bigThree.moon), rising: p.unknownTime ? null : sx(chart.bigThree.rising),
    lifePath:num?.lifePath.value, expression:num?.expression.value, soulUrge:num?.soulUrge.value,
    hdType:hd?.type, hdAuthority:hd?.authority, hdLines:hd?.profileLines, hdDefinition:hd?.definitionName,
    masters, karmics, placements,
  });
  const animal = r ? computeAnimalGuide(r.traits) : null;
  const deity = r ? computeDeity(r.traits) : null;
  const character = r ? computeCharacter(r.traits) : null;
  return {
    bigThree: chart.bigThree,
    risingCusp: chart.risingCusp ?? null,
    placements: bodies.map((b: any) => ({ name:b.name, sign:b.sign, deg:+b.position.toFixed(2), house:b.house, retro:!!b.retrograde })),
    houses: (chart.houses||[]).map((h: any) => ({ n:h.number, sign:h.sign, deg:+h.position.toFixed(2) })),
    mc: chart.midheaven ? { sign:chart.midheaven.sign, deg:+chart.midheaven.position.toFixed(2) } : null,
    numerology: num ? { lifePath:num.lifePath.value, expression:num.expression.value, soulUrge:num.soulUrge.value, personality:num.personality.value, birthday:num.birthday.value, maturity:num.maturity?.value, masters, karmics } : null,
    hd: hd ? { type:hd.type, authority:hd.authorityName?.split(" — ")[0], profile:hd.profile, definition:hd.definitionName, centers:hd.definedCenters, channels:hd.definedChannels?.map((c:any)=>c.gates.join("-")), cross:hd.incarnationCross?.name ?? hd.incarnationCross?.label } : null,
    resonance: r ? { archetype:r.primary.name, secondary:r.secondary?.name, score:r.primary.score, evidence:r.evidence.map((e:any)=>e.feature), topTraits:Object.entries(r.traits).sort((a:any,b:any)=>b[1]-a[1]).slice(0,4).map(([t,v])=>`${t}:${v}`), animal:animal?.guide.name, animalTier:animal?.guide.tier, deity:deity?.guide.name, deityTier:deity?.guide.tier, character:character?.guide.name, signature:r.signature } : null,
  };
}

const report: any[] = [];
for (const p of PERSONAS) {
  const live1 = runOne(p, false), live2 = runOne(p, false);   // what the app actually feeds today
  const fixed  = runOne(p, true);                              // with sign names expanded
  report.push({
    ...p,
    deterministic: JSON.stringify(live1) === JSON.stringify(live2),
    live: live1,
    fixedResonance: fixed.resonance,
    resonanceChangesWhenSignsFixed: JSON.stringify(live1.resonance) !== JSON.stringify(fixed.resonance),
  });
}
writeFileSync("scripts/sim/report.json", JSON.stringify(report, null, 2));

// Console summary
for (const r of report) {
  const l = r.live;
  console.log(`\n${r.id} ${r.name} (${r.place}) det=${r.deterministic}`);
  console.log(`  Big3: ${l.bigThree.sun}/${l.bigThree.moon}/${l.bigThree.rising}${l.risingCusp ? "  [RISING-CUSP WARN]" : ""}`);
  console.log(`  Num : LP ${l.numerology?.lifePath} Ex ${l.numerology?.expression} SU ${l.numerology?.soulUrge} Pe ${l.numerology?.personality} Bd ${l.numerology?.birthday} | masters ${JSON.stringify(l.numerology?.masters)} karmic ${JSON.stringify(l.numerology?.karmics)}`);
  console.log(`  HD  : ${l.hd ? `${l.hd.type} / ${l.hd.authority} / ${l.hd.profile} / ${l.hd.definition}` : "WITHHELD (unknown time)"}`);
  console.log(`  LIVE resonance : ${l.resonance?.archetype} | ${l.resonance?.animal} | ${l.resonance?.deity} | ${l.resonance?.character}   evidence=[${l.resonance?.evidence.join(", ")}]`);
  console.log(`  FIXED resonance: ${r.fixedResonance?.archetype} | ${r.fixedResonance?.animal} | ${r.fixedResonance?.deity} | ${r.fixedResonance?.character}   evidence=[${r.fixedResonance?.evidence.join(", ")}]  ${r.resonanceChangesWhenSignsFixed ? "<< CHANGES" : ""}`);
}
console.log(`\nWrote scripts/sim/report.json (${report.length} personas)`);
