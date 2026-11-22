/* Local preview with the API: serves dist/variants like Vercel does (clean URLs, / -> /a-studio) and runs api/summarise.js.
   Usage: node scripts/dev_server.js [port]   Reads .env.local for the AI settings. */
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), dir = path.join(root, "dist/variants"), port = +process.argv[2] || 8771;
const envFile = path.join(root, ".env.local");
if (fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) { const i = l.indexOf("="); if (i > 0 && !l.startsWith("#") && !process.env[l.slice(0, i)]) process.env[l.slice(0, i)] = l.slice(i + 1); }
const api = require("../api/summarise.js");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/api/summarise") return api(req, res);
  let f = path.join(dir, u === "/" ? "a-studio.html" : u);
  if (!f.startsWith(dir)) { res.statusCode = 403; return res.end(); }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f += ".html";
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("content-type", TYPES[path.extname(f)] || "application/octet-stream"); res.setHeader("cache-control", "no-store"); fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log("CivicAlign dev server on http://localhost:" + port));
