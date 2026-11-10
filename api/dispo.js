/* ============================================
   GET  /api/dispo  → { sommeil: [...] }   public, lu par le site
   POST /api/dispo  → met à jour la liste   réservé au dash (cookie de session)

   Le GET ne doit JAMAIS casser : si le stockage n'est pas configuré ou
   tombe, on renvoie une liste vide — le site reste commandable.
   ============================================ */

const store = require("./_store");
const auth = require("./_auth");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
    if (!store.isConfigured()) {
      return res.status(200).json({ sommeil: [], configured: false });
    }
    try {
      return res.status(200).json({ sommeil: await store.readSommeil(), configured: true });
    } catch (e) {
      return res.status(200).json({ sommeil: [], configured: true, error: "lecture impossible" });
    }
  }

  if (req.method === "POST") {
    if (!auth.verifySession(req)) {
      return res.status(401).json({ error: "Session expirée, reconnecte-toi." });
    }
    if (!store.isConfigured()) {
      return res.status(503).json({ error: "Stockage non configuré (intégration Redis manquante sur Vercel)." });
    }

    const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});

    try {
      let liste;
      if (Array.isArray(body.sommeil)) {
        // remplacement complet de la liste
        liste = await store.writeSommeil(body.sommeil);
      } else if (typeof body.id === "string") {
        // bascule d'un seul élément
        const courant = new Set(await store.readSommeil());
        if (body.sommeil === true || body.asleep === true) courant.add(body.id);
        else courant.delete(body.id);
        liste = await store.writeSommeil([...courant]);
      } else {
        return res.status(400).json({ error: "Requête invalide : attendu { sommeil: [...] } ou { id, asleep }." });
      }
      return res.status(200).json({ sommeil: liste });
    } catch (e) {
      return res.status(502).json({ error: "Écriture impossible : " + e.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Méthode non autorisée" });
};

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
