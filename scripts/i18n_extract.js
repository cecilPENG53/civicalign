// Lists every English UI string the published demo can show, so it can be translated.
// Reads the built page (dist/variants/a-studio.html), so only strings that actually ship are listed.
// Each L(zh,en) call and each {zh,en} object gives one key: the English text, with every ${...} turned into {0}, {1}...
// Usage: node scripts/build_variants.js && node scripts/i18n_extract.js  → variants/i18n/_keys.json
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const page = process.argv[2] || "dist/variants/a-studio.html";
const html = fs.readFileSync(path.join(root, page), "utf8");
const src = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"))
  .replace(/const I18N_DICT=.*\n/, "\n"); // skip the translation tables themselves

// read a JS string literal starting at i; returns {text, n, end} with ${...} replaced by {k}
function readStr(s, i) {
  const q = s[i];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  let j = i + 1, chunks = [], cur = "", n = 0;
  while (j < s.length) {
    const c = s[j];
    if (c === "\\") { cur += s.slice(j, j + 2); j += 2; continue; }
    if (c === q) break;
    if (q === "`" && c === "$" && s[j + 1] === "{") {
      chunks.push(cur); cur = ""; j = skipExpr(s, j + 2); chunks.push({ ph: n++ }); continue;
    }
    cur += c; j++;
  }
  chunks.push(cur);
  const un = t => Function('"use strict";return `' + t.replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`")();
  const text = chunks.map(c => typeof c === "string" ? (q === "`" ? un(c) : Function('"use strict";return ' + q + c + q)()) : `{${c.ph}}`).join("");
  return { text, n, end: j + 1 };
}
// skip a ${ ... } expression, honouring nested braces and strings; returns index after the closing }
function skipExpr(s, j) {
  let depth = 1;
  while (j < s.length && depth) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") { j = readStr(s, j).end; continue; }
    if (c === "{") depth++; else if (c === "}") depth--;
    j++;
  }
  return j;
}
const ws = (s, i) => { while (/\s/.test(s[i])) i++; return i; };

const keys = new Map(); // en -> {zh, n}
function add(en, zh, n) {
  if (!/[A-Za-z]{2}/.test(en.replace(/\{\d+\}/g, "").replace(/<[^>]+>/g, ""))) return; // nothing to translate
  if (!keys.has(en)) keys.set(en, { zh: zh || "", n });
}
// L(zh, en)
const reL = /(^|[^A-Za-z0-9_$.])L\(/g; let m;
while ((m = reL.exec(src))) {
  let i = ws(src, m.index + m[0].length);
  const a = readStr(src, i); if (!a) continue;
  i = ws(src, a.end); if (src[i] !== ",") continue;
  i = ws(src, i + 1);
  const b = readStr(src, i); if (!b) continue;
  add(b.text, a.text, b.n);
}
// {zh:"…", en:"…"} fields (also s:{zh,en})
const reE = /(^|[^A-Za-z0-9_$])en:\s*(?=["'`])/g;
while ((m = reE.exec(src))) {
  const b = readStr(src, m.index + m[0].length); if (!b) continue;
  // the zh sibling, if it sits just before in the same object
  const back = src.slice(Math.max(0, m.index - 600), m.index);
  const zi = back.lastIndexOf("zh:");
  let zh = "";
  if (zi >= 0) { const z = readStr(back, ws(back, zi + 3)); if (z) zh = z.text; }
  add(b.text, zh, b.n);
}
// strings that live in variants/i18n.js itself (the picker and the AI-translation banner)
add("AI translation, not yet reviewed by a native speaker.", "AI 翻译，尚未经母语者审核。", 0);
add("Language", "语言", 0);
// built by an expression the scan above cannot read: L("票", n===1?"vote":"votes") in variants/vote.js
add("vote", "票", 0);
add("votes", "票", 0);
add("English shown where a translation is missing. Council quotes stay in their original English.", "缺翻译的地方显示英文。Council 原文保持英文。", 0);
const out = [...keys].map(([en, v]) => ({ en, zh: v.zh }));
fs.mkdirSync(path.join(root, "variants/i18n"), { recursive: true });
fs.writeFileSync(path.join(root, "variants/i18n/_keys.json"), JSON.stringify(out, null, 1));
console.log(out.length + " keys, " + out.reduce((t, k) => t + k.en.length, 0) + " chars → variants/i18n/_keys.json");
