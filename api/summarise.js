/* POST /api/summarise  {comments:[{id,text}], themes:[{id,en}]}  ->  {assign:{id:[themeId]}, model}
   Groups a small batch of real written comments into the existing themes. The key stays on the server (AI_API_KEY).
   Limits keep this cheap and hard to misuse: 30 comments, 600 characters each, same-site requests only, 6 calls a minute per instance. */
const { summarise } = require("./_ai.js");
const hits = [];
module.exports = async (req, res) => {
  const send = (code, body) => { res.statusCode = code; res.setHeader("content-type", "application/json"); res.setHeader("cache-control", "no-store"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return send(405, { code: "METHOD" });
  const origin = req.headers.origin || "", host = req.headers.host || "";
  if (origin && origin.replace(/^https?:\/\//, "") !== host) return send(403, { code: "ORIGIN" });
  const now = Date.now(); while (hits.length && now - hits[0] > 60000) hits.shift();
  if (hits.length >= 6) return send(429, { code: "RATE" }); hits.push(now);
  let body = req.body;
  if (!body || typeof body === "string") { try { body = JSON.parse(body || await new Promise((ok, no) => { let d = ""; req.on("data", c => { d += c; if (d.length > 200000) no(new Error("big")); }); req.on("end", () => ok(d)); req.on("error", no); })); } catch (e) { return send(400, { code: "BODY" }); } }
  const comments = (Array.isArray(body.comments) ? body.comments : []).slice(0, 30).map(c => ({ id: String(c.id).slice(0, 40), text: String(c.text || "").slice(0, 600) })).filter(c => c.text.trim());
  const themes = (Array.isArray(body.themes) ? body.themes : []).slice(0, 12).map(t => ({ id: String(t.id).slice(0, 12), en: String(t.en || "").slice(0, 300) }));
  if (!comments.length || !themes.length) return send(400, { code: "EMPTY" });
  try { const r = await summarise(comments, themes, { fixed: true, timeout: 50000 }); send(200, { assign: r.assign, model: process.env.AI_MODEL }); }
  catch (e) { send(e.code === "NO_CONFIG" ? 503 : 502, { code: e.code === "NO_CONFIG" ? "NO_CONFIG" : "AI" }); }
};
