# Bogusto — Site de commande (Click & Collect) · Bordeaux Ginko

Site vitrine + commande pour Bogusto, 7 Cours de Québec, 33300 Bordeaux.
HTML / CSS / JS vanilla — pas de framework, prêt à déployer sur Vercel.

## Structure

- `index.html` — Toute la structure du site (hero, story, compose, menu, adresse, formulaire, footer)
- `style.css` — Tous les styles. Variables CSS centralisées en haut du fichier (`:root`)
- `script.js` — Carte, panier, formulaire, modales
- `DESIGN.md` — Spécification complète du design system

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
| `BASES` | Les 6 bases. `extra` = supplément (crème de truffe : 4€) |
| `GARNITURES` | Les 7 garnitures. `first` = supplément sur la garniture comprise · `extra` = prix d'une garniture en plus |
| `SUPPLEMENTS` | Burrata 50g / 100g |
| `TIRAMISU_PARFUMS` | Les parfums de tiramisu |
| `MENU` | Les cards affichées dans la section carte (`cat` : `plat`, `dessert`, `boisson`) |

Prix globaux : `PLAT_PRICE` (10€), `SALADE_PRICE` (10€), `TIRAMISU_PRICE` (5€), `CANETTE_PRICE` (2€).

### La carte actuelle

- **Plat à composer — 10€** : 1 base + 1 garniture
  - Bases : crème de champignons · base crème classique · base tomate · La Spéciale (crème + tomate) · crème de truffe **+4€** · L'Italiana
  - Garniture comprise : poulet, légumes, viande hachée, lardons de volaille · saumon fumé ou bœuf effiloché **+1€** · magret **+3€**
  - Garniture en + : saumon fumé ou bœuf effiloché **3€** · magret **3€** · autres **2€**
  - Suppléments : burrata 50g **3€** · burrata 100g **5€**
- **Salade Burrata — 10€**
- **Tiramisu — 5€** (M&M's, Spéculos, Oreo, classique cacao)
- **Canette — 2€**, servie à part

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
- Section « Compose ton plat » en accordéon (base → garniture → garniture en + → suppléments → précision) avec total live
- Carte filtrable par catégorie
- Panier persistant (localStorage)
- Modales d'options (plat à composer, tiramisu) avec prix recalculé en direct
- Popup canette après chaque plat (elle est servie à part)
- Formulaire de commande relié à Web3Forms
- Résumé de commande envoyé automatiquement
- Anti-spam (botcheck)
- Responsive mobile-first
- CTA sticky sur mobile
- Animations légères au scroll
