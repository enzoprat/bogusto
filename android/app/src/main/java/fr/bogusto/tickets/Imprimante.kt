package fr.bogusto.tickets

import android.content.Context
import com.sunmi.peripheral.printer.InnerPrinterCallback
import com.sunmi.peripheral.printer.InnerPrinterManager
import com.sunmi.peripheral.printer.SunmiPrinterService

/**
 * Enveloppe le service d'impression interne Sunmi.
 * La liaison est asynchrone : tant que [pret] est faux, on ne tente rien.
 */
class Imprimante(private val ctx: Context) {

    @Volatile
    var service: SunmiPrinterService? = null
        private set

    @Volatile
    var derniereErreur: String = ""
        private set

    val pret: Boolean get() = service != null

    private val rappel = object : InnerPrinterCallback() {
        override fun onConnected(s: SunmiPrinterService?) {
            service = s
            derniereErreur = ""
            try {
                s?.printerInit(null)
            } catch (e: Exception) {
                derniereErreur = "Initialisation : ${e.message}"
            }
        }

        override fun onDisconnected() {
            service = null
        }
    }

    fun connecter() {
        try {
            val ok = InnerPrinterManager.getInstance().bindService(ctx, rappel)
            if (!ok) derniereErreur = "Service d'impression introuvable sur cet appareil"
        } catch (e: Exception) {
            derniereErreur = "Liaison impossible : ${e.message}"
        }
    }

    fun deconnecter() {
        try {
            InnerPrinterManager.getInstance().unBindService(ctx, rappel)
        } catch (e: Exception) {
            // rien a faire : on ferme
        }
        service = null
    }

    /**
     * Imprime un bloc de texte deja mis en page.
     * Renvoie null si tout va bien, sinon le message d'erreur.
     */
    fun imprimer(texte: String): String? {
        val s = service ?: return "Imprimante non connectee"
        return try {
            // enterPrinterBuffer/exit : le ticket part d'un seul tenant,
            // sinon deux commandes simultanees peuvent s'entremeler.
            s.enterPrinterBuffer(true)
            s.setAlignment(0, null)
            s.setFontSize(24f, null)
            s.printText(texte, null)
            s.lineWrap(4, null)
            s.exitPrinterBuffer(true)
            null
        } catch (e: Exception) {
            try { s.exitPrinterBuffer(false) } catch (ignore: Exception) {}
            "Impression : ${e.message}"
        }
    }

    /** Etat lisible de l'imprimante, pour l'ecran d'accueil. */
    fun etat(): String {
        val s = service ?: return derniereErreur.ifEmpty { "Connexion en cours…" }
        return try {
            when (s.updatePrinterState()) {
                1 -> "Prete"
                2 -> "En cours de preparation"
                3 -> "Communication anormale"
                4 -> "Plus de papier"
                5 -> "Prechauffage"
                6 -> "Surchauffe"
                7 -> "Capot ouvert"
                8 -> "Massicot anormal"
                9 -> "Massicot revenu a la normale"
                505 -> "Imprimante non detectee"
                else -> "Prete"
            }
        } catch (e: Exception) {
            "Etat inconnu"
        }
    }
}
