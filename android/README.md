# Bogusto Tickets — impression automatique sur terminal Sunmi

App Android minimale pour le **Sunmi V3 PLUS** (rouleau 80 mm). Elle interroge
`/api/commandes` du site, imprime chaque commande sur l'imprimante interne, puis
confirme l'impression pour vider la file.

## Pourquoi la bibliothèque et pas l'AIDL

On dépend de `com.sunmi:printerlibrary` (Maven Central). Elle détecte le modèle
de l'appareil toute seule. La voie AIDL brute demande un fichier différent par
modèle et, si on se trompe, les appels partent sur de mauvais identifiants de
transaction : ça échoue en silence ou ça imprime n'importe quoi.

## Réglages, sur l'appareil

Le jeton **ne figure pas dans ce dépôt** (qui est public). Il se saisit une fois
dans l'app, bouton *Réglages* :

| Champ | Valeur |
|---|---|
| Adresse du site | `https://bogusto-two.vercel.app` |
| Jeton | la valeur de `TERMINAL_TOKEN` côté Vercel |
| Intervalle | 15 secondes par défaut (5 à 300) |

## Fabriquer l'APK

Aucune installation nécessaire sur le poste : GitHub Actions compile à chaque
push touchant `android/`. Récupération de l'APK :

1. onglet **Actions** du dépôt → dernier run *APK Bogusto Tickets*
2. section **Artifacts** → `bogusto-tickets-apk`
3. à télécharger **depuis le navigateur du terminal**, puis installer en
   autorisant les sources inconnues

Pour compiler en local (il faut un JDK 17 et le SDK Android) :

```bash
cd android && gradle assembleDebug
```

## Fonctionnement

- L'écran reste allumé tant que l'app est au premier plan — le terminal est posé
  sur le comptoir et branché pendant le service.
- Si l'imprimante refuse une commande, la boucle s'arrête là : la commande reste
  dans la file et ressortira au tour suivant, plutôt que d'enchaîner dans le vide.
- Une commande peut ressortir deux fois si le terminal coupe entre l'impression
  et la confirmation. C'est assumé : un double vaut mieux qu'une commande perdue.
- *Ticket de test* imprime une règle de 48 caractères pour vérifier la largeur.
