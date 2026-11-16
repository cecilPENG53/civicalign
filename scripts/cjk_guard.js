// Guard: no Chinese text may reach the English (or any non-Chinese) interface.
// Text is written as L(zh,en) or {zh,en}. Chinese is allowed only on the Chinese side of those:
// the first argument of L(...) / I18N_L(...), or a zh: field. Any other string literal, or plain text inside a
// template literal, that contains CJK characters or Chinese punctuation (。，；：＋ and so on) would show
// in every language, so the build fails. Example of a past leak: unit:"人 / people" showed "120–240 人 / people".
// It also checks the translation tables: English keys and non-Chinese translations must not contain CJK.
// Usage: require("./cjk_guard").checkScript(js, name) from build_variants.js, or
//        node scripts/cjk_guard.js [dist/variants/a-studio.html ...] to check built pages.
const fs = require("fs");
const path = require("path");

const CJK = /[　-〿㐀-䶿一-鿿豈-﫿＀-￯]/;
// strings that are meant to stay in Chinese whatever the interface language
const ALLOW = [
  s => s === "简体中文" || s === "繁體中文",          // the language picker shows each language in its own script
  s => s.includes("OpenCC"),                         // the Traditional Chinese banner, shown only in 繁體中文
];

// Lexes the script and calls visit(text, start, inZh) for every string literal and every plain-text chunk of a
// template literal. start is where the literal begins; inZh is true inside ${...} of a literal that isZh(start) accepted,
// so L(`…${a?"不满足":"削弱了"}…`, en) counts as Chinese side throughout.
function lex(s, visit, isZh) {
  let zh = 0;
  let i = 0;
  const n = s.length;
  let prev = ""; // last significant character outside strings/comments, to tell a regex from a division
  function readQuoted(q) { // i at the opening quote
    const start = i; i++;
    let out = "";
    while (i < n && s[i] !== q) { if (s[i] === "\\") { out += s[i] + s[i + 1]; i += 2; } else out += s[i++]; }
    i++;
    visit(out, start, zh > 0);
  }
  function readTemplate() { // i at the backtick
    const start = i; i++;
    const z = isZh(start);
    let chunk = "";
    while (i < n && s[i] !== "`") {
      if (s[i] === "\\") { chunk += s[i] + s[i + 1]; i += 2; continue; }
      if (s[i] === "$" && s[i + 1] === "{") {
        visit(chunk, start, zh > 0); chunk = "";
        i += 2; if (z) zh++; readCode(true); if (z) zh--; continue;
      }
      chunk += s[i++];
    }
    i++;
    visit(chunk, start, zh > 0);
  }
  function readRegex() { // i at the opening slash
    i++; let cls = false;
    while (i < n) {
      const c = s[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "[") cls = true; else if (c === "]") cls = false;
      else if (c === "/" && !cls) break;
      else if (c === "\n") break;
      i++;
    }
    i++;
    while (/[a-z]/i.test(s[i] || "")) i++;
  }
  function readCode(inExpr) { // stops after the matching } when inExpr
    let depth = 0;
    while (i < n) {
      const c = s[i];
      if (c === '"' || c === "'") { readQuoted(c); prev = "a"; continue; }
      if (c === "`") { readTemplate(); prev = "a"; continue; }
      if (c === "/" && s[i + 1] === "/") { while (i < n && s[i] !== "\n") i++; continue; }
      if (c === "/" && s[i + 1] === "*") { const e = s.indexOf("*/", i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === "/") {
        const before = s.slice(Math.max(0, i - 8), i);
        if (!prev || "(,=:[!&|?{};+-*%<>~^".includes(prev) || /\breturn\s*$/.test(before)) { readRegex(); prev = "a"; continue; }
      }
      if (inExpr) {
        if (c === "{") depth++;
        else if (c === "}") { if (depth === 0) { i++; return; } depth--; }
      }
      if (!/\s/.test(c)) prev = c;
      i++;
    }
  }
  readCode(false);
}

// true when the literal starting at `start` is Chinese by design: the first argument of L()/I18N_L(), or a zh: field
function zhSide(s, start) {
  const before = s.slice(Math.max(0, start - 40), start);
  return /(^|[^A-Za-z0-9_$.])(I18N_)?L\(\s*$/.test(before) || /(^|[^A-Za-z0-9_$])zh\s*:\s*$/.test(before);
}

function checkScript(js, name) {
  const src = js.replace(/const I18N_DICT=[^\n]*\n/, "\n"); // the translation tables are checked separately
  const bad = [];
  lex(src, (text, start, inZh) => {
    if (!CJK.test(text) || inZh || zhSide(src, start) || ALLOW.some(f => f(text))) return;
    const line = src.slice(0, start).split("\n").length;
    bad.push(`${name}: script line ${line}: Chinese text outside L(zh,en)/zh: "${text.replace(/\s+/g, " ").trim().slice(0, 90)}"`);
  }, start => zhSide(src, start));
  return bad;
}

function checkTables(dir) {
  const bad = [];
  for (const f of fs.readdirSync(dir).filter(f => /^[a-z]{2}\.json$/.test(f))) {
    const t = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const [en, tr] of Object.entries(t)) {
      if (CJK.test(en)) bad.push(`variants/i18n/${f}: English key contains CJK: "${en.slice(0, 80)}"`);
      if (CJK.test(tr)) bad.push(`variants/i18n/${f}: translation contains CJK: "${en.slice(0, 50)}" → "${tr.slice(0, 50)}"`);
    }
  }
  return bad;
}

module.exports = { checkScript, checkTables, CJK };

if (require.main === module) {
  const root = path.join(__dirname, "..");
  const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["dist/variants/a-studio.html", "dist/variants/b-scroll.html", "dist/variants/c-map.html", "dist/variants/index.html"];
  let bad = checkTables(path.join(root, "variants", "i18n"));
  for (const p of pages) {
    const html = fs.readFileSync(path.join(root, p), "utf8");
    if (!html.includes("<script>")) continue;
    bad = bad.concat(checkScript(html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>")), p));
  }
  bad.forEach(b => console.log(b));
  console.log(bad.length ? `${bad.length} problem(s)` : "no Chinese text outside the Chinese side of L(zh,en)");
  process.exit(bad.length ? 1 : 0);
}
