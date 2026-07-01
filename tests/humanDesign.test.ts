import { test } from "node:test";
import assert from "node:assert/strict";

import { longitudeToGate, computeHumanDesign } from "@/lib/humanDesign/engine";
import { CENTER_GATES, CHANNELS, GATE_TO_CENTER, GATE_WHEEL, CENTER_ORDER } from "@/lib/humanDesign/data";

test("gate wheel maps known validation longitudes", () => {
  // Anchor: Gate 41 begins at 302° (2° Aquarius).
  assert.equal(longitudeToGate(302).gate, 41);
  assert.equal(longitudeToGate(302).line, 1);
  // Published chart (hdkit): Personality Sun 182.3706° → Gate 46 Line 5.
  const p = longitudeToGate(182.3706);
  assert.equal(p.gate, 46, "Personality Sun gate 46");
  assert.equal(p.line, 5, "Personality Sun line 5");
  // Design Sun 94.3306° → Gate 52 Line 1.
  const d = longitudeToGate(94.3306);
  assert.equal(d.gate, 52, "Design Sun gate 52");
  assert.equal(d.line, 1, "Design Sun line 1");
  // Cross-check: 12° Aries → Gate 21 Line 3.
  assert.equal(longitudeToGate(12).gate, 21);
  assert.equal(longitudeToGate(12).line, 3);
});

test("gate wheel and center maps are complete and consistent", () => {
  assert.equal(GATE_WHEEL.length, 64, "64 gates on the wheel");
  assert.equal(new Set(GATE_WHEEL).size, 64, "no duplicate gates");
  // All 64 gates assigned to exactly one center.
  const assigned = CENTER_ORDER.flatMap((c) => CENTER_GATES[c]);
  assert.equal(assigned.length, 64, "64 gate→center assignments");
  assert.equal(new Set(assigned).size, 64, "each gate assigned once");
  for (let g = 1; g <= 64; g++) assert.ok(GATE_TO_CENTER[g], `gate ${g} has a center`);
});

test("all 36 channels connect gates whose centers match the declared centers", () => {
  assert.equal(CHANNELS.length, 36, "36 channels");
  for (const ch of CHANNELS) {
    assert.equal(GATE_TO_CENTER[ch.gates[0]], ch.centers[0], `channel ${ch.gates.join("-")} gate A center`);
    assert.equal(GATE_TO_CENTER[ch.gates[1]], ch.centers[1], `channel ${ch.gates.join("-")} gate B center`);
  }
});

test("full pipeline reproduces the published Jonah Dempcy chart", () => {
  // Sep 25 1983, 20:48 local (EDT), Malden, MA (~42.4251, -71.0662).
  const hd = computeHumanDesign({
    birthDate: "1983-09-25",
    birthTime: "20:48",
    latitude: 42.4251,
    longitude: -71.0662,
  })!;
  assert.ok(hd, "chart computed");
  const persSun = hd.personality.find((a) => a.body === "Sun")!;
  const desSun = hd.design.find((a) => a.body === "Sun")!;
  assert.equal(persSun.gate, 46, "Personality Sun gate 46");
  assert.equal(persSun.line, 5, "Personality Sun line 5");
  assert.equal(desSun.gate, 52, "Design Sun gate 52");
  assert.equal(desSun.line, 1, "Design Sun line 1");
  // Earth is always the wheel-opposite of the Sun.
  const persEarth = hd.personality.find((a) => a.body === "Earth")!;
  assert.equal(Math.round((((persEarth.longitude - persSun.longitude) % 360) + 360) % 360), 180);
  // Profile first number = Personality Sun line.
  assert.equal(hd.profileLines[0], 5);
});

test("design moment is ~88–89 days before birth", () => {
  const hd = computeHumanDesign({
    birthDate: "1990-07-04",
    birthTime: "14:30",
    latitude: 29.76,
    longitude: -95.37,
  })!;
  const gap = hd.birthJd - hd.designJd;
  assert.ok(gap > 86 && gap < 92, `design gap ${gap} days is ~88`);
});

test("derivations are internally consistent", () => {
  const hd = computeHumanDesign({
    birthDate: "1990-07-04",
    birthTime: "14:30",
    latitude: 29.76,
    longitude: -95.37,
  })!;
  // Every defined center appears because a defined channel touches it.
  const touched = new Set<string>();
  for (const ch of hd.definedChannels) {
    touched.add(ch.centers[0]);
    touched.add(ch.centers[1]);
  }
  assert.deepEqual([...hd.definedCenters].sort(), [...touched].sort());
  // Definition count equals reported definition.
  assert.ok(hd.definition >= 0 && hd.definition <= 4);
  // Type is one of the five.
  assert.ok(["Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector"].includes(hd.type));
  // Reflector iff no centers defined.
  assert.equal(hd.type === "Reflector", hd.definedCenters.length === 0);
});
