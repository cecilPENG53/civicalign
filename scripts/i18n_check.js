// Checks a translation table against variants/i18n/_keys.json.
// Every key must be present, and each translation must keep the same {n} placeholders, HTML tags,
// source IDs (S1–S5, D1) and page numbers (p.23) as the English.
// Usage: node scripts/i18n_check.js hi   (or no argument for every table)
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "variants", "i18n");
const keys = JSON.parse(fs.readFileSync(path.join(dir, "_keys.json"), "utf8")).map(k => k.en);
const langs = process.argv[2] ? [process.argv[2]] : fs.readdirSync(dir).filter(f => /^[a-z]{2}\.json$/.test(f)).map(f => f.slice(0, 2));
const sig = s => ({
  ph: (s.match(/\{\d+\}/g) || []).sort().join(" "),
  tags: (s.match(/<\/?[a-z][^>]*>/gi) || []).map(t => t.replace(/\s.*$/, "").toLowerCase()).sort().join(" "),
  ids: (s.match(/\b(S[1-5]|D1|p\.\d+(–\d+)?)\b/g) || []).sort().join(" ")
});
let bad = 0;
for (const l of langs) {
  let t;
  try { t = JSON.parse(fs.readFileSync(path.join(dir, l + ".json"), "utf8")); }
  catch (e) { console.log(`${l}: cannot read: ${e.message}`); bad++; continue; }
  const miss = keys.filter(k => typeof t[k] !== "string" || !t[k].trim());
  const extra = Object.keys(t).filter(k => !keys.includes(k));
  const wrong = [];
  for (const k of keys) {
    if (typeof t[k] !== "string") continue;
    const a = sig(k), b = sig(t[k]);
    for (const f of ["ph", "tags", "ids"]) if (a[f] !== b[f]) wrong.push(`[${f}] ${k.slice(0, 70)} → want "${a[f]}", got "${b[f]}"`);
  }
  console.log(`${l}: ${keys.length - miss.length}/${keys.length} translated, ${miss.length} missing, ${extra.length} unknown keys, ${wrong.length} mismatches`);
  miss.slice(0, 10).forEach(k => console.log("  missing: " + k.slice(0, 90)));
  wrong.slice(0, 15).forEach(w => console.log("  " + w));
  if (miss.length || wrong.length) bad++;
}
process.exit(bad ? 1 : 0);
