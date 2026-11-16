// Builds the CivicAlign v2 prototype: inlines data/precinct.json into app/template.html.
// Usage: node scripts/build_app.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const tpl = fs.readFileSync(path.join(root, "app", "template.html"), "utf8");
const data = fs.readFileSync(path.join(root, "data", "precinct.json"), "utf8").trim();
if (!tpl.includes("__DATA__")) throw new Error("template has no __DATA__ placeholder");
const out = tpl.replace("__DATA__", () => data);
// fail if Chinese text sits outside the Chinese side of L(zh,en) / {zh,en}: it would show in the English interface
const bad = require("./cjk_guard").checkScript(out.slice(out.lastIndexOf("<script>") + 8, out.lastIndexOf("</script>")), "civicalign");
if (bad.length) throw new Error("Chinese text would show in the English interface (wrap it in L(zh,en)):\n" + bad.join("\n"));
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "civicalign.html"), out);
console.log("wrote dist/civicalign.html", (out.length / 1024).toFixed(0) + " KB");
