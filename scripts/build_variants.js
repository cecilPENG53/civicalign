// Builds the three CivicAlign design variants into dist/variants/.
// Content and model logic are NOT copied by hand: they are cut out of app/template.html at build time,
// so the variants always show the same claims, sources, coefficients and compute() as the main prototype.
// Usage: node scripts/build_variants.js
const fs = require("fs");
const path = require("path");
const cjkGuard = require("./cjk_guard");
const root = path.join(__dirname, "..");
const rd = p => fs.readFileSync(path.join(root, p), "utf8");

const tpl = rd("app/template.html");
const js = tpl.slice(tpl.indexOf("<script>") + 8, tpl.lastIndexOf("</script>"));
function grab(start, end) {
  const i = js.indexOf(start);
  if (i < 0) throw new Error("marker not found in app/template.html: " + start);
  const j = js.indexOf(end, i + start.length);
  if (j < 0) throw new Error("end marker not found in app/template.html: " + end);
  return js.slice(i, j).trim();
}
let core = [
  "/* ===== Cut from app/template.html at build time (do not edit here) ===== */",
  grab("/* ---------- Sources", "/* ---------- State ---------- */"),   // SOURCES, CLAIMS, CARDS, MODULES, GROUPS, TOTAL, PRESETS, DIMS, CROWN, COEF, W, compute()
  grab("const L=(zh,en)", "/* ---------- Chrome"),                       // L, T, esc, fmt, sum, chip
  grab("const ROLES=", "\nfunction s1(){"),                               // ROLES, AGES
  grab("function kindLabel", "\nfunction s2(){"),
  grab("const GDESC=", "\nfunction s3(){"),                               // GDESC, r10, normalise, setModule, setGroup, gsum, pct
  grab("/* icons: tiny pictograms", "\nfunction plazaSVG(){"),            // ICON
  grab("function coefTable(){", "\n/* ---------- Screen 5"),
  grab("function openDrawer(", "\nfunction syncS3("),                     // openDrawer, closeDrawer
  "/* ===== End of cut ===== */"
].join("\n\n");
// L() and T() go through the language tables in variants/i18n.js
for (const [a, b] of [
  ['const L=(zh,en)=>S.lang==="zh"?zh:en;', "const L=(zh,en)=>I18N_L(zh,en);"],
  ['const T=o=>o?(S.lang==="zh"?o.zh:o.en):"";', 'const T=o=>o?I18N_L(o.zh,o.en):"";']]) {
  if (!core.includes(a)) throw new Error("L/T definition changed in app/template.html: " + a);
  core = core.replace(a, b);
}

const map = rd("data/precinct.json").trim();
const baseCss = rd("variants/base.css") + "\n" + rd("variants/council.css") + "\n" + rd("variants/i18n.css");
// translation tables: variants/i18n/<code>.json (AI translations, English text → target) and zh-Hant.json (OpenCC table)
const i18nDir = path.join(root, "variants", "i18n");
const dict = {};
for (const f of fs.readdirSync(i18nDir).sort()) {
  const m = /^([a-z]{2}|zh-Hant)\.json$/.exec(f);
  if (m) dict[m[1]] = JSON.parse(fs.readFileSync(path.join(i18nDir, f), "utf8"));
}
for (const rtl of ["ar", "fa"]) { // "next" arrows point the other way in right-to-left text
  const d = dict[rtl]; if (!d) continue;
  for (const k in d) d[k] = d[k].replace(/→/g, "←");
}
// no Chinese in the English keys or in the other languages' translations
const tableBad = cjkGuard.checkTables(i18nDir);
if (tableBad.length) throw new Error("Chinese text in a translation table:\n" + tableBad.join("\n"));
const i18nJs = rd("variants/i18n.js").replace("/*__I18N__*/{}", () => JSON.stringify(dict));
const shared = [i18nJs, rd("variants/shared.js"), rd("variants/iso.js"), rd("variants/vote.js"), rd("variants/council.js"), rd("variants/comments.js"), rd("variants/cm.js")].join(String.fromCharCode(10, 10));

const BANNED = ["+43", "43 sec", "19% shade", "18,400", "n=142", "Verified Data Layers", "-0.0°C", "−0.0°C", "Monash", "parramatta-logo", "City of Parramatta logo"];

const outDir = path.join(root, "dist", "variants");
fs.mkdirSync(outDir, { recursive: true });
for (const name of ["a-studio", "b-scroll", "c-map", "index", "about"]) {
  if (!fs.existsSync(path.join(root, `variants/${name}.html`))) { console.log("skip " + name); continue; }
  let src = rd(`variants/${name}.html`);
  const needsMap = src.includes("/*__MAP__*/");
  src = src
    .replace("/*__BASE_CSS__*/", () => baseCss)
    .replace("/*__CORE__*/", () => core + "\n\n" + shared)
    .replace("/*__MAP__*/", () => `const MAP = ${map};`);
  if (!needsMap) src = src.replace("/*__NOMAP__*/", "const MAP = null;");
  // English (Australia) is the default before any script runs; applyLang() updates it for the chosen language
  if (!/^\s*(<!doctype[^>]*>\s*)?<html/i.test(src)) src = '<html lang="en-AU">\n' + src;
  // published artifact links for the comparison page (variants/links.json, optional)
  const lp = path.join(root, "variants", "links.json");
  const links = fs.existsSync(lp) ? JSON.parse(fs.readFileSync(lp, "utf8")) : {};
  src = src.replace(/__URL_([ABC])__/g, (m, k) => links[k.toLowerCase()] || "");
  for (const b of BANNED) if (src.includes(b)) throw new Error(`${name}: banned string "${b}"`);
  if (/__(CORE|BASE_CSS|MAP)__/.test(src)) throw new Error(`${name}: unreplaced placeholder`);
  // fail the build if the page script does not parse (a stray quote once broke the whole page)
  if (src.includes("<script>")) { // about.html is static and has no script
    const js = src.slice(src.lastIndexOf("<script>") + 8, src.lastIndexOf("</script>"));
    try { new Function(js); } catch (e) { throw new Error(`${name}: page script does not parse: ${e.message}`); }
    // fail if Chinese text sits outside the Chinese side of L(zh,en) / {zh,en}: it would show in every language
    const bad = cjkGuard.checkScript(js, name);
    if (bad.length) throw new Error("Chinese text would show in the English interface (wrap it in L(zh,en)):\n" + bad.join("\n"));
  }
  fs.writeFileSync(path.join(outDir, name + ".html"), src);
  console.log(`wrote dist/variants/${name}.html`, (src.length / 1024).toFixed(0) + " KB");
}
