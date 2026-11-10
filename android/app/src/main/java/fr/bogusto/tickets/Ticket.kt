package fr.bogusto.tickets

/**
 * Mise en page du ticket, calibree pour un rouleau 80 mm :
 * 48 caracteres par ligne en police normale.
 */
object Ticket {

    const val LARGEUR = 48

    fun composer(c: Commande): String {
        val b = StringBuilder()

        b.appendLine("=".repeat(LARGEUR))
        b.appendLine(centre("BOGUSTO"))
        b.appendLine(centre("7 Cours de Quebec - Ginko, Bordeaux"))
        b.appendLine("=".repeat(LARGEUR))
        b.appendLine()

        b.appendLine(centre("COMMANDE  ${c.id}"))
        if (c.heureRecue.isNotEmpty()) b.appendLine(centre("recue a ${c.heureRecue}"))
        b.appendLine()
        b.appendLine("-".repeat(LARGEUR))

        b.appendLine(c.nom)
        if (c.telephone.isNotEmpty()) b.appendLine(c.telephone)
        val infos = listOf(c.mode, c.date, c.heure, c.paiement).filter { it.isNotEmpty() }
        if (infos.isNotEmpty()) {
            replier(infos.joinToString(" - "), LARGEUR).forEach { b.appendLine(it) }
        }
        b.appendLine("-".repeat(LARGEUR))

        for (l in c.lignes) {
            val gauche = "${l.qte}x ${l.nom}"
            val droite = prix(l.prix * l.qte)
            b.appendLine(deuxColonnes(gauche, droite))
            if (l.meta.isNotEmpty()) {
                replier(l.meta, LARGEUR - 3).forEach { b.appendLine("   $it") }
            }
        }

        b.appendLine("-".repeat(LARGEUR))
        if (c.commentaire.isNotEmpty()) {
            b.appendLine("NOTE :")
            replier(c.commentaire, LARGEUR - 2).forEach { b.appendLine("  $it") }
            b.appendLine("-".repeat(LARGEUR))
        }
        b.appendLine(deuxColonnes("TOTAL", prix(c.total)))
        b.appendLine("=".repeat(LARGEUR))

        return b.toString()
    }

    fun ticketDeTest(): String {
        val b = StringBuilder()
        b.appendLine("=".repeat(LARGEUR))
        b.appendLine(centre("BOGUSTO"))
        b.appendLine(centre("TICKET DE TEST"))
        b.appendLine("=".repeat(LARGEUR))
        b.appendLine()
        b.appendLine("Si tu lis ceci, l'imprimante repond.")
        b.appendLine()
        b.appendLine("Regle de largeur (48 caracteres) :")
        b.appendLine("123456789012345678901234567890123456789012345678")
        b.appendLine("La derniere colonne doit tomber pile au bord.")
        b.appendLine()
        b.appendLine("Accents : eeaaiouc  EEAAIOUC  oe  EUR")
        b.appendLine()
        b.appendLine(deuxColonnes("TOTAL", prix(33.0)))
        b.appendLine("=".repeat(LARGEUR))
        return b.toString()
    }

    /* ---------- helpers de mise en page ---------- */

    private fun centre(t: String): String {
        if (t.length >= LARGEUR) return t
        val marge = (LARGEUR - t.length) / 2
        return " ".repeat(marge) + t
    }

    /**
     * Libelle a gauche, prix colle a droite. Si le libelle deborde, il passe
     * a la ligne et la suite est indentee sous le nom ; le prix reste sur la
     * derniere ligne, toujours cale a droite.
     */
    private fun deuxColonnes(gauche: String, droite: String): String {
        val place = LARGEUR - droite.length - 1
        if (gauche.length <= place) {
            return gauche + " ".repeat(LARGEUR - gauche.length - droite.length) + droite
        }
        // On replie un peu plus court pour que les lignes suivantes, indentees
        // de 3 espaces, tiennent encore avec le prix.
        val lignes = replier(gauche, place - INDENT.length)
        val corps = lignes.mapIndexed { i, l -> if (i == 0) l else INDENT + l }
        val derniere = corps.last()
        val tete = corps.dropLast(1).joinToString("\n")
        val fin = derniere + " ".repeat(maxOf(1, LARGEUR - derniere.length - droite.length)) + droite
        return if (tete.isEmpty()) fin else "$tete\n$fin"
    }

    private const val INDENT = "   "

    /** Coupe un texte en lignes de `largeur` au plus, sans casser les mots. */
    fun replier(texte: String, largeur: Int): List<String> {
        if (largeur <= 0) return listOf(texte)
        val out = mutableListOf<String>()
        var courante = StringBuilder()
        for (mot in texte.split(" ").filter { it.isNotEmpty() }) {
            val candidat = if (courante.isEmpty()) mot else "$courante $mot"
            when {
                candidat.length <= largeur -> {
                    courante = StringBuilder(candidat)
                }
                mot.length > largeur -> {
                    // mot plus long que la ligne : on le coupe
                    if (courante.isNotEmpty()) { out.add(courante.toString()); courante = StringBuilder() }
                    var reste = mot
                    while (reste.length > largeur) {
                        out.add(reste.take(largeur))
                        reste = reste.drop(largeur)
                    }
                    courante = StringBuilder(reste)
                }
                else -> {
                    out.add(courante.toString())
                    courante = StringBuilder(mot)
                }
            }
        }
        if (courante.isNotEmpty()) out.add(courante.toString())
        return if (out.isEmpty()) listOf("") else out
    }

    private fun prix(v: Double): String {
        val arrondi = Math.round(v * 100.0) / 100.0
        return String.format("%.2f", arrondi).replace('.', ',') + " EUR"
    }
}
