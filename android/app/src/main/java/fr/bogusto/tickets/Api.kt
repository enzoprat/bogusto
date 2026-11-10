package fr.bogusto.tickets

import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class Ligne(val qte: Int, val nom: String, val meta: String, val prix: Double)

data class Commande(
    val id: String,
    val heureRecue: String,
    val nom: String,
    val telephone: String,
    val mode: String,
    val date: String,
    val heure: String,
    val paiement: String,
    val commentaire: String,
    val lignes: List<Ligne>,
    val total: Double,
)

class ApiErreur(message: String) : Exception(message)

/**
 * Parle a /api/commandes du site. Pas de bibliotheque HTTP : HttpURLConnection
 * suffit largement pour deux appels, et ca garde l'APK leger.
 */
class Api(private val base: String, private val jeton: String) {

    fun listeCommandes(): List<Commande> {
        val corps = appel("GET", "/api/commandes", null)
        val racine = JSONObject(corps)
        val arr = racine.optJSONArray("commandes") ?: JSONArray()
        val out = mutableListOf<Commande>()
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            out.add(versCommande(o))
        }
        return out
    }

    fun confirmerImpression(ids: List<String>) {
        if (ids.isEmpty()) return
        val body = JSONObject().put("imprimees", JSONArray(ids))
        appel("POST", "/api/commandes", body.toString())
    }

    /* ---------- interne ---------- */

    private fun appel(methode: String, chemin: String, corps: String?): String {
        val url = URL(base.trimEnd('/') + chemin)
        val co = url.openConnection() as HttpURLConnection
        try {
            co.requestMethod = methode
            co.connectTimeout = 10_000
            co.readTimeout = 15_000
            co.setRequestProperty("Authorization", "Bearer $jeton")
            co.setRequestProperty("Accept", "application/json")
            if (corps != null) {
                co.doOutput = true
                co.setRequestProperty("Content-Type", "application/json")
                co.outputStream.use { it.write(corps.toByteArray(Charsets.UTF_8)) }
            }
            val code = co.responseCode
            val flux = if (code in 200..299) co.inputStream else co.errorStream
            val texte = flux?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: ""
            if (code !in 200..299) {
                val msg = try { JSONObject(texte).optString("error") } catch (e: Exception) { "" }
                throw ApiErreur(
                    when (code) {
                        401 -> "Jeton refuse par le serveur"
                        503 -> if (msg.isNotEmpty()) msg else "Service indisponible"
                        else -> if (msg.isNotEmpty()) msg else "Erreur HTTP $code"
                    }
                )
            }
            return texte
        } finally {
            co.disconnect()
        }
    }

    private fun versCommande(o: JSONObject): Commande {
        val lignesArr = o.optJSONArray("lignes") ?: JSONArray()
        val lignes = mutableListOf<Ligne>()
        for (i in 0 until lignesArr.length()) {
            val l = lignesArr.optJSONObject(i) ?: continue
            lignes.add(
                Ligne(
                    qte = l.optInt("qte", 1),
                    nom = l.optString("nom", ""),
                    meta = l.optString("meta", ""),
                    prix = l.optDouble("prix", 0.0),
                )
            )
        }
        return Commande(
            id = o.optString("id", "?"),
            heureRecue = heureDe(o.optString("recue", "")),
            nom = o.optString("nom", ""),
            telephone = o.optString("telephone", ""),
            mode = o.optString("mode", ""),
            date = o.optString("date", ""),
            heure = o.optString("heure", ""),
            paiement = o.optString("paiement", ""),
            commentaire = o.optString("commentaire", ""),
            lignes = lignes,
            total = o.optDouble("total", 0.0),
        )
    }

    /** "2026-11-10T19:42:06.794Z" -> "20:42" (heure locale de l'appareil). */
    private fun heureDe(iso: String): String {
        if (iso.isEmpty()) return ""
        return try {
            val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.FRANCE)
            fmt.timeZone = java.util.TimeZone.getTimeZone("UTC")
            val d = fmt.parse(iso.substringBefore('.').removeSuffix("Z")) ?: return ""
            java.text.SimpleDateFormat("HH:mm", java.util.Locale.FRANCE).format(d)
        } catch (e: Exception) {
            ""
        }
    }
}
