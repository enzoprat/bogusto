/* ============================================
   POST /api/commande
   Reçoit une commande depuis le formulaire du site, la met dans la file
   d'impression et renvoie son numéro. Endpoint public : c'est le client
   qui l'appelle depuis son navigateur.
   ============================================ */

const store = require("./_store");

const MAX_LIGNES = 40;
const MAX_TXT = 400;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});

  // pot de miel : les robots remplissent ce champ, pas les humains
  if (body.botcheck) return res.status(200).json({ ok: true, numero: "—" });

  const nom = txt(body.nom);
  const telephone = txt(body.telephone);
  const lignes = Array.isArray(body.lignes) ? body.lignes.slice(0, MAX_LIGNES) : [];

  if (!nom || !telephone) {
    return res.status(400).json({ error: "Nom et téléphone sont obligatoires." });
  }
  if (!lignes.length) {
    return res.status(400).json({ error: "La commande est vide." });
  }

  const commande = {
    id: numero(),
    recue: new Date().toISOString(),
    nom,
    telephone,
    mode: txt(body.mode),
    date: txt(body.date),
    heure: txt(body.heure),
    paiement: txt(body.paiement),
    commentaire: txt(body.commentaire),
    lignes: lignes.map(l => ({
      qte: Math.min(Math.max(parseInt(l.qte, 10) || 1, 1), 99),
      nom: txt(l.nom),
      meta: txt(l.meta),
      prix: arrondi(l.prix),
    })),
    total: arrondi(body.total),
  };

  if (!store.isConfigured()) {
    // Sans stockage, on ne peut rien garantir : on le dit franchement
    // plutôt que de faire croire au client que c'est passé.
    return res.status(503).json({
      error: "La prise de commande en ligne est momentanément indisponible. " +
             "Appelle la boutique ou passe directement sur place.",
    });
  }

  try {
    await store.pushCommande(commande);
  } catch (e) {
    return res.status(502).json({
      error: "La commande n'a pas pu être enregistrée. Réessaie dans un instant.",
    });
  }

  return res.status(200).json({ ok: true, numero: commande.id });
};

/* ---------- helpers ---------- */

function txt(v) {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, MAX_TXT);
}

function arrondi(v) {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

/** Numéro court et lisible à voix haute : B + heure + 2 chiffres. */
function numero() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const r = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `B${hh}${mm}${r}`;
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
