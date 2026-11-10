# Bogusto — Site de commande (Click & Collect) · Bordeaux Ginko

Site vitrine + commande pour Bogusto, 7 Cours de Québec, 33300 Bordeaux.
HTML / CSS / JS vanilla — pas de framework, prêt à déployer sur Vercel.

## Structure

- `index.html` — Toute la structure du site (hero, story, compose, menu, adresse, formulaire, footer)
- `style.css` — Tous les styles. Variables CSS centralisées en haut du fichier (`:root`)
- `carte.js` — **La carte** : sauces, garnitures, suppléments, viandes, desserts. Source unique, lue par le site et par le dash
- `assets/plats/` — Photos des plats, découpées dans les deux flyers. Convention : `<id>.webp`, l'identifiant d'un élément suffit à retrouver sa photo
- `script.js` — Panier, formulaire, modales, rendu de la carte
- `dash/index.html` — Dash de gestion des stocks (mise en sommeil)
- `api/` — Fonctions serverless Vercel (`dispo`, `login`)
- `DESIGN.md` — Spécification complète du design system

## Le dash (`/dash`)

Deux onglets, protégés par le même mot de passe.

### Commandes

La file des commandes reçues du site : numéro, heure, client, téléphone cliquable,
créneau, lignes détaillées, commentaire et total. La liste se rafraîchit toutes les
20 secondes et un bip signale une nouvelle commande. « Fait » retire la commande
de la file.

### Stocks

Le gérant met en sommeil ce qui est en rupture : les
8 plats, les 7 sauces, les 9 garnitures et les 3 suppléments. Côté client, l'élément
s'affiche « épuisé », barré, et n'est plus commandable.

### Mise en service (2 étapes, une seule fois)

1. **Stockage** — dans le projet Vercel, onglet *Storage* → *Marketplace* →
   installer une base **Redis (Upstash)**, plan gratuit, région Frankfurt.
   L'intégration injecte les variables toute seule. Selon le mode de connexion
   elles s'appellent `KV_REST_API_URL` / `KV_REST_API_TOKEN` ou
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` : `api/_store.js`
   accepte les deux jeux de noms.
2. **Mot de passe** — *Settings* → *Environment Variables* → ajouter
   `DASH_PASSWORD` avec le mot de passe du gérant.
3. **Jeton du terminal** (pour l'impression automatique) — ajouter
   `TERMINAL_TOKEN`, une chaîne aléatoire longue, que l'app du terminal Sunmi
   enverra en `Authorization: Bearer`. Tant qu'il n'existe pas, seul le dash
   peut lire la file.

Puis redéployer. Tant que ces variables n'existent pas, le site fonctionne
normalement (tout est disponible) et le dash affiche un avertissement.

### Comment ça marche

| Route | Rôle |
|---|---|
| `POST /api/commande` | Reçoit une commande du formulaire du site. Public. Valide les champs, attribue un numéro court (`B` + heure + 2 chiffres) et empile dans Redis. Pot de miel anti-robot. |
| `GET /api/commandes` | La file d'attente. Accepte soit le cookie du dash, soit `Authorization: Bearer <TERMINAL_TOKEN>` pour le terminal d'impression. Jamais en cache. |
| `POST /api/commandes` | `{ imprimees: [...] }` retire des commandes de la file. Mêmes accès. |
| `GET /api/dispo` | Liste publique des identifiants en sommeil. Ne renvoie jamais d'erreur bloquante : en cas de pépin, la liste est vide et tout reste commandable. |
| `POST /api/dispo` | Met à jour la liste. Exige le cookie de session du dash. |
| `GET /api/login` | État de la session. |
| `POST /api/login` | Vérifie `DASH_PASSWORD` et pose un cookie `HttpOnly` de 12 h. |

Les identifiants (`sauce-truffe`, `garn-saumon`, `supp-burrata-100`…) sont définis
dans `carte.js`. **Ne pas les renommer** : ce sont les clés enregistrées côté Redis.
Ajouter un plat ou une garniture, en revanche, suffit — il apparaît tout seul dans
le dash.

La disponibilité est mise en cache 10 s côté CDN : compte jusqu'à une minute pour
qu'une mise en sommeil touche tous les visiteurs.

## Configuration Web3Forms

1. Crée un compte sur [web3forms.com](https://web3forms.com)
2. Récupère ta clé d'accès
3. Dans `index.html`, remplace la valeur :
   ```html
   <input type="hidden" name="access_key" value="REMPLACER_PAR_LA_CLE_WEB3FORMS" />
   ```
   par ta clé réelle.

## Modifier la carte

Toute la carte est en haut de `script.js`. Les chips du builder « Compose ton plat » **et**
celles des modales sont générées à partir de ces tableaux — on ne touche pas au HTML.

| Tableau | Rôle |
|---|---|
| `SAUCES` | Les 7 sauces du menu pâtes. `extra` = supplément (truffe 4€, fromagère 2€) |
| `GARNITURES` | Les 9 garnitures. `first` = supplément sur la garniture comprise · `extra` = prix d'une garniture en plus |
| `SUPPLEMENTS` | Stracciatella / burrata 100g / version XXL |
| `VIANDES` | Les 4 viandes et leur prix |
| `ACCOMPAGNEMENT` | Libellé de l'accompagnement unique (pâtes fraîches fusili) |
| `SAUCES_VIANDE` | Sauce verte / poivre |
| `TIRAMISU_PARFUMS` | Les parfums de tiramisu |
| `MENU` | Les cards de la section carte (`cat` : `pates`, `viande`, `dessert`, `boisson`) |

Prix globaux : `PLAT_PRICE` (10€), `TIRAMISU_PRICE` (5€), `CANETTE_PRICE` (2€), `SAUCE_SUP_PRICE` (0,50€).

### La carte actuelle

**🍝 Menu pâtes fraîches — plat à composer 10€** (1 sauce + 1 garniture)
- Sauces (7) : crème de champignons · base crème classique · base tomate · La Spéciale (crème + tomate) · sauce poivre · crème de truffe **+4€** · sauce fromagère **+2€**
- Garnitures (9), une comprise : poulet, poulet effiloché, merguez, kebab, viande hachée, jambon blanc, lardon de volaille · saumon fumé ou bœuf effiloché **+1€**
- Garniture en + : saumon fumé ou bœuf effiloché **3€** · autres garnitures **2€**
- Suppléments : stracciatella **3€** · burrata 100g **5€** · version XXL **5€**

**🔥 Menu viandes** (pâtes fraîches fusili + 1 sauce comprises)
- Cuisse de poulet sans os — **15€**
- Magret entier · Gigot d'agneau en tranches — **20€**
- Entrecôte Black Angus 300g — **25€**
- Accompagnement unique : pâtes fraîches fusili, avec une des 7 sauces du menu pâtes
- Sauces : sauce verte · poivre — sauce en + **0,50€**

**🥗 Et aussi**
- Salade de Burrata 100g **10€**
- Tiramisu **5€** (M&M's, Spéculos, Oreo, classique cacao) — section dédiée sur le site
- Canette **2€** · Bouteille d'eau **1€**, servies à part

Après l'ajout d'un plat, un pop-up « Et avec ça ? » propose la canette, la
bouteille d'eau et le tiramisu. Choisir le tiramisu rouvre la modale des parfums.

**Commandes** : Click & Collect uniquement. Paiement sur place en espèces, carte
ou Apple/Google Pay — plus de ticket restaurant.

**Horaires** : du mercredi au dimanche, 19h00 – 00h00.

## Couleurs

Modifiables dans `style.css`, section `:root` :
```css
--c-night: #6b1f1f;
--c-deep: #3a2818;
--c-cream: #f5e8c8;
--c-orange: #a02828;
--c-yellow: #d4a84b;
```

## Déploiement Vercel

1. Push les fichiers (`index.html`, `style.css`, `script.js`, `assets/`) sur un repo Git
2. Connecte le repo à Vercel
3. Deploy — pas de configuration nécessaire (site statique)

Ou en ligne de commande :
```bash
npx vercel --prod
```

## Fonctionnalités

- Hero impactant avec logo animé et stats count-up
- Section « Compose ton plat » en accordéon (sauce → garniture → garniture en + → suppléments → précision) avec total live
- Modale menu viande (accompagnement → sauce → sauce en + → suppléments), avec choix de sauce imbriqué quand l'accompagnement est « pâtes fraîches »
- Carte filtrable par catégorie
- Panier persistant (localStorage)
- Modales d'options (plat à composer, viandes, tiramisu) avec prix recalculé en direct
- Popup canette après chaque plat (elle est servie à part)
- Formulaire de commande relié à Web3Forms
- Résumé de commande envoyé automatiquement
- Anti-spam (botcheck)
- Responsive mobile-first
- CTA sticky sur mobile
- Animations légères au scroll
