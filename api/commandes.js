/* ============================================
   GET  /api/commandes   → { commandes: [...] }   file d'impression
   POST /api/commandes   { imprimees: ["B194207"] } → retire de la file

   Deux accès possibles, le même contenu :
     · le terminal Sunmi — en-tête Authorization: Bearer <TERMINAL_TOKEN>
     · le dash — cookie de session posé par /api/login
   Jamais mis en cache.
   ============================================ */

const crypto = require("crypto");
const store = require("./_store");
const auth = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!verifyToken(req) && !auth.verifySession(req)) {
    return res.status(401).json({
      error: tokenConfigured() || auth.isConfigured()
        ? "Accès refusé : jeton ou session invalide."
        : "Ni TERMINAL_TOKEN ni DASH_PASSWORD ne sont définis côté serveur.",
    });
  }
  if (!store.isConfigured()) {
    return res.status(503).json({ error: "Stockage non configuré." });
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json({ commandes: await store.readFile() });
    } catch (e) {
      return res.status(502).json({ error: "Lecture impossible." });
    }
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
    const ids = Array.isArray(body.imprimees)
      ? body.imprimees.filter(x => typeof x === "string" && x.length < 40).slice(0, 50)
      : [];
    if (!ids.length) {
      return res.status(400).json({ error: "Attendu { imprimees: [...] }." });
    }
    try {
      const retires = await store.ackCommandes(ids);
      return res.status(200).json({ retires });
    } catch (e) {
      return res.status(502).json({ error: "Écriture impossible." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Méthode non autorisée" });
};

/* ---------- jeton ---------- */

function tokenConfigured() {
  return Boolean(process.env.TERMINAL_TOKEN);
}

function verifyToken(req) {
  const attendu = process.env.TERMINAL_TOKEN || "";
  if (!attendu) return false;
  const entete = req.headers.authorization || "";
  const recu = entete.startsWith("Bearer ") ? entete.slice(7).trim() : "";
  if (!recu) return false;
  const a = Buffer.from(recu);
  const b = Buffer.from(attendu);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
