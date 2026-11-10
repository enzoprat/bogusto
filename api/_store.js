/* ============================================
   Stockage des ruptures de stock — Upstash Redis (REST)
   Aucune dépendance npm : on tape l'API REST au fetch.
   Variables fournies par l'intégration Redis du Marketplace Vercel :
     UPSTASH_REDIS_REST_URL
     UPSTASH_REDIS_REST_TOKEN
   ============================================ */

const KEY = "bogusto:sommeil";

function isConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function cmd(args) {
  if (!isConfigured()) throw new Error("STORE_NOT_CONFIGURED");
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
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

module.exports = { isConfigured, readSommeil, writeSommeil };
