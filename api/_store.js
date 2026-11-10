/* ============================================
   Stockage Bogusto — Upstash Redis (REST)
     · les ruptures de stock (une cle JSON)
     · la file des commandes a imprimer (une liste)
   Aucune dépendance npm : on tape l'API REST au fetch.
   Variables injectées par l'intégration Redis du Marketplace Vercel.
   Selon la façon dont la base a été connectée, elles s'appellent
   KV_REST_API_URL / KV_REST_API_TOKEN (cas actuel) ou
   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. On accepte les deux.
   ============================================ */

const KEY = "bogusto:sommeil";
const KEY_FILE = "bogusto:file";          // commandes en attente d'impression
const TTL_HISTO = 7 * 24 * 3600;          // historique d'une commande : 7 jours

const restUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const restToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

function isConfigured() {
  return Boolean(restUrl() && restToken());
}

async function cmd(args) {
  if (!isConfigured()) throw new Error("STORE_NOT_CONFIGURED");
  const res = await fetch(restUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${restToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`UPSTASH_HTTP_${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

/** Liste des identifiants en sommeil. Toujours un tableau. */
async function readSommeil() {
  const raw = await cmd(["GET", KEY]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === "string") : [];
  } catch (e) {
    return [];
  }
}

async function writeSommeil(list) {
  const clean = [...new Set(list.filter(x => typeof x === "string" && x.length && x.length < 80))];
  await cmd(["SET", KEY, JSON.stringify(clean)]);
  return clean;
}

/* ---------- FILE DES COMMANDES ----------
   Le site empile ici ; le terminal depile apres impression.
   En cas de coupure au mauvais moment, une commande peut ressortir
   deux fois : c'est voulu, un ticket en double vaut mieux qu'un perdu. */

async function pushCommande(commande) {
  await cmd(["LPUSH", KEY_FILE, JSON.stringify(commande)]);
  // garde-fou : la file ne depasse jamais 200 entrees
  await cmd(["LTRIM", KEY_FILE, 0, 199]);
  // copie horodatee, purgee au bout de 7 jours (donnees clients)
  await cmd(["SETEX", "bogusto:cmd:" + commande.id, TTL_HISTO, JSON.stringify(commande)]);
  return commande;
}

/** Les commandes en attente, de la plus ancienne a la plus recente. */
async function readFile() {
  const rows = await cmd(["LRANGE", KEY_FILE, 0, -1]);
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const raw of rows) {
    try { out.push(JSON.parse(raw)); } catch (e) { /* entree illisible : on ignore */ }
  }
  return out.reverse();
}

/** Retire de la file les commandes que le terminal dit avoir imprimees. */
async function ackCommandes(ids) {
  const vus = new Set(ids);
  const rows = await cmd(["LRANGE", KEY_FILE, 0, -1]);
  if (!Array.isArray(rows)) return 0;
  let retires = 0;
  for (const raw of rows) {
    let id = null;
    try { id = JSON.parse(raw).id; } catch (e) { id = null; }
    if (id && vus.has(id)) {
      await cmd(["LREM", KEY_FILE, 1, raw]);
      retires++;
    }
  }
  return retires;
}

module.exports = {
  isConfigured, readSommeil, writeSommeil,
  pushCommande, readFile, ackCommandes,
};
