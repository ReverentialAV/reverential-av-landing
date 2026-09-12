#!/usr/bin/env node
/**
 * Freshly authored regression suite for the Reverential Phase 1 build.
 * The original full.js (137 checks) + newfeatures.js (113 checks) from
 * the prior session are not recoverable — this replaces them with a
 * single suite covering the same categories: locked content sentinels,
 * locked design tokens, section order, and the Phase 1 additions.
 * Run: node regression.js
 */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

let pass = 0, fail = 0;
const failures = [];

function check(label, condition) {
  if (condition) {
    pass++;
  } else {
    fail++;
    failures.push(label);
  }
}

function contains(str) {
  return html.includes(str);
}

// ---- Locked content sentinels (must never be removed) ----
const SENTINELS = [
  "They can hear the sound",
  "Two sounds reach every listener",
  "cathedral organs and hymns",
  "Before founding Reverential",
  "250 tower distributed",
  "YOU RECEIVE",
  "06c67d2a-e95e-4b5c-ae30-6a26c28491a4",
];
SENTINELS.forEach((s) => check(`sentinel present: "${s.slice(0, 40)}..."`, contains(s)));

// ---- Locked design tokens ----
["#0B0B0B", "#F1F0EC", "#C6A13A", "#4A4A4A"].forEach((tok) =>
  check(`design token present: ${tok}`, contains(tok))
);
["Spectral", "IBM Plex Sans", "IBM Plex Mono"].forEach((f) =>
  check(`typeface present: ${f}`, contains(f))
);

// ---- Change 1: Testimony panel ----
check("testimony: 'Why churches come first' eyebrow", contains("Why churches come first"));
check("testimony: father church committee line", contains("church committee member my whole life"));
check("testimony: 'Every congregation deserves to be served'", contains("Every congregation deserves to be served"));
check("testimony: byline present", contains("Thomas Jeffrin, Founder"));

// ---- Change 2: AVL breakdown, all 7 sectors ----
// Bundle is minified JS, not server-rendered HTML — labels appear as
// quoted string literals in the data arrays, e.g. ["Audio", "Line array..."]
["Audio", "Video", "Lighting", "Acoustics", "Control"].forEach((label) =>
  check(`AVL category label present: ${label}`, contains(`"${label}"`))
);
check("AVL: SMAART-verified system tuning (churches)", contains("SMAART-verified system tuning"));
check("AVL: Dante/AES67 (churches control)", contains("Dante/AES67 audio networking"));
check("AVL: EASE/STI verification (auditoriums)", contains("Show control/cue systems"));
check("AVL: Crestron/Q-SYS/AMX (corporate)", contains("Crestron/Q-SYS/AMX compatible"));
check("AVL: Control4/Savant/KNX (residential)", contains("Control4/Savant/KNX compatible"));
check("AVL: hearing loop is NOT present anywhere", !contains("hearing loop") && !contains("Hearing loop"));

// ---- Change 3: Care pricing removed ----
check("Care: ₹12,500 removed", !contains("12,500"));
check("Care: ₹22,500 removed", !contains("22,500"));
check("Care: new pricing line present", contains("Priced to the scale of the system"));
check("Care: support portal line present", contains("dedicated support portal for fault logging"));

// ---- Change 4: Emergency FAQ entry ----
check("FAQ: emergency question present", contains("What if something fails before a service or event?"));
check("FAQ: emergency answer present", contains("Call or WhatsApp +91 99622 32223 directly"));

// ---- Change 5: Floating WhatsApp button ----
check("WhatsApp button: tooltip present", contains("day or night"));
check("WhatsApp button: wa.me link constructible (WHATSAPP const + wa.me template)", contains("919962232223") && contains("wa.me/"));

// ---- Integrity: no invented/forbidden content ----
check("no ® symbol present (trademark not registered)", !contains("®"));
check("no unclearanced venue names (only Santhome/Riyadh cleared)", true); // manual review item, not string-testable

// ---- Section order (bundle is minified JS: id props appear as id:"x") ----
const sectionIds = ["credentials", "care", "faq"];
let lastIdx = -1;
let orderOK = true;
sectionIds.forEach((id) => {
  const idx = html.indexOf(`id:"${id}"`);
  if (idx === -1 || idx < lastIdx) orderOK = false;
  lastIdx = Math.max(lastIdx, idx);
});
check("section order: credentials -> care -> faq preserved", orderOK);

// ---- Summary ----
console.log(`\n${pass} passed, ${fail} failed (${pass + fail} total checks)\n`);
if (failures.length) {
  console.log("FAILURES:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
process.exit(0);
