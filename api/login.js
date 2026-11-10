/* ============================================
   POST /api/login   { motdepasse }  → pose le cookie de session
   GET  /api/login                   → { connecte: bool, configured: bool }
   POST /api/login?logout=1          → efface le cookie
   ============================================ */

const auth = require("./_auth");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      connecte: auth.verifySession(req),
      configured: auth.isConfigured(),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (req.query && req.query.logout) {
    res.setHeader("Set-Cookie", auth.clearCookie());
    return res.status(200).json({ connecte: false });
  }

  if (!auth.isConfigured()) {
    return res.status(503).json({ error: "DASH_PASSWORD n'est pas défini dans les variables Vercel." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const candidat = typeof body.motdepasse === "string" ? body.motdepasse : "";

  if (!auth.checkPassword(candidat)) {
    // petit délai : rend le bruteforce pénible sans gêner l'usage normal
    await new Promise(r => setTimeout(r, 600));
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  res.setHeader("Set-Cookie", auth.sessionCookie());
  return res.status(200).json({ connecte: true });
};

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
