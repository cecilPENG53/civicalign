// Generates variants/i18n/zh-Hant.json: Simplified → Traditional Chinese for every Chinese run in the demo.
// Conversion is OpenCC's cn→twp profile (opencc-js), so it is a rule-based script conversion, not a translation.
// It stores whole runs (so OpenCC can use phrase context) plus a per-character fallback for runs that are
// assembled at runtime. Only entries that actually change are stored.
// opencc-js is not a dependency of this repo. Install it anywhere and point at it:
//   npm install --prefix /tmp/occ opencc-js@1.0.5
//   OPENCC=/tmp/occ/node_modules/opencc-js node scripts/i18n_zh_hant.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const OpenCC = require(process.env.OPENCC || "opencc-js");
const occ = OpenCC.Converter({ from: "cn", to: "twp" }); // Taiwan characters and vocabulary
const conv = s => occ(s).replace(/臺/g, "台"); // 台 is the everyday form (後台, 平台)

const html = fs.readFileSync(path.join(root, "dist/variants/a-studio.html"), "utf8");
const src = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"))
  .replace(/const I18N_DICT=.*\n/, "\n"); // skip the translation tables themselves
const RUN = /[　-〿㐀-䶿一-鿿＀-￯]+/g;
// runs[r] = converted text, or 1 when OpenCC leaves the run as is (so the per-character fallback is not used on it)
const runs = {}, chars = {}, keep = new Set();
for (const r of new Set(src.match(RUN) || [])) {
  const t = conv(r);
  runs[r] = t === r ? 1 : t;
  for (const c of r) { const tc = conv(c); if (tc !== c) chars[c] = tc; }
  // a character OpenCC keeps in some context (准 in 批准, 后 in 皇后) is ambiguous: no per-character fallback for it
  if (t.length === r.length) [...r].forEach((c, i) => { if ([...t][i] === c) keep.add(c); });
}
for (const c of keep) delete chars[c];
fs.writeFileSync(path.join(root, "variants/i18n/zh-Hant.json"), JSON.stringify({ runs, chars }));
console.log(`zh-Hant: ${Object.keys(runs).length} runs, ${Object.keys(chars).length} characters`);
