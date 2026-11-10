package fr.bogusto.tickets

import android.content.Context
import android.os.Bundle
import android.text.InputType
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Ecran unique : affiche l'etat, imprime les commandes qui arrivent.
 * L'ecran reste allume tant que l'app est au premier plan — le terminal
 * est pose sur le comptoir et branche pendant le service.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var vEtat: TextView
    private lateinit var vDetail: TextView
    private lateinit var vJournal: TextView

    private lateinit var imprimante: Imprimante
    private var boucle: Job? = null
    private var imprimees = 0
    private val journal = ArrayDeque<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_main)

        vEtat = findViewById(R.id.etat)
        vDetail = findViewById(R.id.detail)
        vJournal = findViewById(R.id.journal)

        findViewById<Button>(R.id.reglages).setOnClickListener { ouvrirReglages() }
        findViewById<Button>(R.id.test).setOnClickListener { imprimerTest() }

        imprimante = Imprimante(this)
        imprimante.connecter()

        if (Prefs.jeton(this).isEmpty() || Prefs.base(this).isEmpty()) {
            ajouteJournal("Renseigne l'adresse du site et le jeton.")
            ouvrirReglages()
        }
    }

    override fun onResume() {
        super.onResume()
        demarrerBoucle()
    }

    override fun onPause() {
        super.onPause()
        boucle?.cancel()
        boucle = null
    }

    override fun onDestroy() {
        super.onDestroy()
        imprimante.deconnecter()
    }

    /* ---------- boucle d'interrogation ---------- */

    private fun demarrerBoucle() {
        if (boucle != null) return
        boucle = lifecycleScope.launch {
            while (isActive) {
                tourDeBoucle()
                delay(Prefs.intervalleMs(this@MainActivity))
            }
        }
    }

    private suspend fun tourDeBoucle() {
        val base = Prefs.base(this)
        val jeton = Prefs.jeton(this)
        if (base.isEmpty() || jeton.isEmpty()) {
            majEtat("A configurer", "Adresse du site et jeton manquants")
            return
        }
        if (!imprimante.pret) {
            imprimante.connecter()
        }

        try {
            val commandes = withContext(Dispatchers.IO) { Api(base, jeton).listeCommandes() }
            if (commandes.isEmpty()) {
                majEtat("En service", "Aucune commande en attente")
                return
            }

            majEtat("Impression…", "${commandes.size} commande(s) a imprimer")
            val faites = mutableListOf<String>()
            for (c in commandes) {
                val erreur = imprimante.imprimer(Ticket.composer(c))
                if (erreur == null) {
                    faites.add(c.id)
                    imprimees++
                    ajouteJournal("${c.id} imprimee - ${c.nom}")
                } else {
                    ajouteJournal("${c.id} : $erreur")
                    break // on s'arrete : inutile d'enchainer si l'imprimante refuse
                }
            }
            if (faites.isNotEmpty()) {
                withContext(Dispatchers.IO) { Api(base, jeton).confirmerImpression(faites) }
            }
            majEtat("En service", "Aucune commande en attente")
        } catch (e: ApiErreur) {
            majEtat("Erreur", e.message ?: "Appel refuse")
            ajouteJournal(e.message ?: "Appel refuse")
        } catch (e: Exception) {
            majEtat("Hors ligne", "Le site est injoignable, nouvelle tentative…")
        }
    }

    /* ---------- actions ---------- */

    private fun imprimerTest() {
        if (!imprimante.pret) imprimante.connecter()
        val erreur = imprimante.imprimer(Ticket.ticketDeTest())
        ajouteJournal(erreur ?: "Ticket de test envoye")
    }

    private fun ouvrirReglages() {
        val marge = (16 * resources.displayMetrics.density).toInt()
        val boite = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(marge, marge, marge, 0)
        }
        val champBase = EditText(this).apply {
            hint = "https://bogusto-two.vercel.app"
            setText(Prefs.base(this@MainActivity))
            inputType = InputType.TYPE_TEXT_VARIATION_URI
        }
        val champJeton = EditText(this).apply {
            hint = "Jeton du terminal"
            setText(Prefs.jeton(this@MainActivity))
            inputType = InputType.TYPE_CLASS_TEXT
        }
        val champDelai = EditText(this).apply {
            hint = "Intervalle en secondes"
            setText(Prefs.intervalleS(this@MainActivity).toString())
            inputType = InputType.TYPE_CLASS_NUMBER
        }
        boite.addView(TextView(this).apply { text = "Adresse du site" })
        boite.addView(champBase)
        boite.addView(TextView(this).apply { text = "Jeton (TERMINAL_TOKEN)" })
        boite.addView(champJeton)
        boite.addView(TextView(this).apply { text = "Interrogation toutes les… (s)" })
        boite.addView(champDelai)

        AlertDialog.Builder(this)
            .setTitle("Reglages")
            .setView(boite)
            .setPositiveButton("Enregistrer") { _, _ ->
                Prefs.enregistrer(
                    this,
                    champBase.text.toString().trim(),
                    champJeton.text.toString().trim(),
                    champDelai.text.toString().trim().toIntOrNull() ?: 15,
                )
                ajouteJournal("Reglages enregistres")
            }
            .setNegativeButton("Annuler", null)
            .show()
    }

    /* ---------- affichage ---------- */

    private fun majEtat(titre: String, detail: String) {
        runOnUiThread {
            vEtat.text = titre
            vDetail.text = "$detail\n${imprimante.etat()} - $imprimees ticket(s) depuis l'ouverture"
        }
    }

    private fun ajouteJournal(ligne: String) {
        val h = SimpleDateFormat("HH:mm:ss", Locale.FRANCE).format(Date())
        journal.addFirst("$h  $ligne")
        while (journal.size > 12) journal.removeLast()
        runOnUiThread { vJournal.text = journal.joinToString("\n") }
    }
}

/** Reglages stockes sur l'appareil : le jeton ne transite jamais par le depot. */
object Prefs {
    private const val FICHIER = "bogusto"

    private fun p(c: Context) = c.getSharedPreferences(FICHIER, Context.MODE_PRIVATE)

    fun base(c: Context): String = p(c).getString("base", "https://bogusto-two.vercel.app") ?: ""
    fun jeton(c: Context): String = p(c).getString("jeton", "") ?: ""
    fun intervalleS(c: Context): Int = p(c).getInt("intervalle", 15).coerceIn(5, 300)
    fun intervalleMs(c: Context): Long = intervalleS(c) * 1000L

    fun enregistrer(c: Context, base: String, jeton: String, intervalle: Int) {
        p(c).edit()
            .putString("base", base)
            .putString("jeton", jeton)
            .putInt("intervalle", intervalle.coerceIn(5, 300))
            .apply()
    }
}
