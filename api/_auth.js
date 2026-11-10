/* ============================================
   Session du dash — mot de passe unique en variable d'environnement
   DASH_PASSWORD : à définir dans les réglages Vercel du projet.
   ============================================ */

const crypto = require("crypto");

const COOKIE = "bogusto_dash";
const MAX_AGE = 60 * 60 * 12; // 12 h

function password() {
  return process.env.DASH_PASSWORD || "";
}

function isConfigured() {
  return password().length > 0;
}

/** Jeton déterministe dérivé du mot de passe : change si le mot de passe change. */
function sessionToken() {
  return crypto.createHmac("sha256", password()).update("bogusto-dash-v1").digest("hex");
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function checkPassword(candidate) {
  if (!isConfigured()) return false;
  return safeEqual(candidate, password());
}

function readCookie(req) {
  const header = req.headers.cookie || "";
  const hit = header.split(/;\s*/).find(c => c.startsWith(COOKIE + "="));
  return hit ? hit.slice(COOKIE.length + 1) : null;
}

function verifySession(req) {
  if (!isConfigured()) return false;
  const got = readCookie(req);
  if (!got) return false;
  return safeEqual(got, sessionToken());
}

function sessionCookie() {
  return `${COOKIE}=${sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

module.exports = { isConfigured, checkPassword, verifySession, sessionCookie, clearCookie };
