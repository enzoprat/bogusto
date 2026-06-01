# Soso Pizza — Site de commande / livraison Bordeaux

Site vitrine + commande pour la pizzeria Soso Pizza (Bordeaux).
HTML / CSS / JS vanilla — pas de framework, prêt à déployer sur Vercel.

## Structure

- `index.html` — Toute la structure du site (hero, story, compose, menu, livraison, formulaire, footer)
- `style.css` — Tous les styles. Variables CSS centralisées en haut du fichier (`:root`)
- `script.js` — Données du menu, panier, formulaire, modales

## Configuration Web3Forms

1. Crée un compte sur [web3forms.com](https://web3forms.com)
2. Récupère ta clé d'accès
3. Dans `index.html`, remplace la valeur :
   ```html
   <input type="hidden" name="access_key" value="REMPLACER_PAR_LA_CLE_WEB3FORMS" />
   ```
   par ta clé réelle.

## Modifier le menu

Toutes les données du menu sont dans `script.js`, dans le tableau `MENU` au début du fichier.

Pour chaque plat :
- `id` — identifiant unique
- `cat` — catégorie (pizza-tomate, pizza-creme, burger, wrap, tacos, etc.)
- `tag` — label affiché en haut de la carte
- `name` — nom du plat
- `desc` — description
- `price` — prix simple (pour les plats sans taille)
- `sizes: { M, G }` — pour les pizzas avec 2 tailles

## Couleurs

Modifiables dans `style.css`, section `:root` :
```css
--c-night: #252942;
--c-deep: #1C2038;
--c-cream: #FFFDF3;
--c-orange: #C45A32;
--c-yellow: #F2B744;
```

## Déploiement Vercel

1. Push les 3 fichiers (`index.html`, `style.css`, `script.js`) sur un repo Git
2. Connecte le repo à Vercel
3. Deploy — pas de configuration nécessaire (site statique)

Ou en ligne de commande :
```bash
npx vercel --prod
```

## Fonctionnalités

- Hero impactant avec animation pizza
- Section "Compose ta pizza" (taille + base + 3 ingrédients)
- Menu filtrable par catégorie
- Panier persistant (localStorage)
- Modales pour pizzas (taille), tacos (viandes/sauce/supp), kebab (sauce)
- Formulaire de commande relié à Web3Forms
- Résumé de commande envoyé automatiquement
- Anti-spam (botcheck)
- Responsive mobile-first
- CTA sticky sur mobile
- Animations légères au scroll
