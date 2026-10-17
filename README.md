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
| `SAUCES` | Les 6 sauces du menu pâtes. `extra` = supplément (crème de truffe : 4€) |
| `GARNITURES` | Les 8 garnitures. `first` = supplément sur la garniture comprise · `extra` = prix d'une garniture en plus |
| `SUPPLEMENTS` | Burrata 50g / 100g |
| `VIANDES` | Les 6 plats du menu viande et leur prix |
| `ACCOMPAGNEMENTS` | Riz yassa / mafé / haricots rouges / pâtes fraîches (`needsSauce` ouvre le choix de la sauce) |
| `SAUCES_VIANDE` | Sauce verte / poivre |
| `SUPPLEMENTS_VIANDE` | Brochettes x2 |
| `TIRAMISU_PARFUMS` | Les parfums de tiramisu |
| `MENU` | Les cards de la section carte (`cat` : `pates`, `viande`, `dessert`, `boisson`) |

Prix globaux : `PLAT_PRICE` (10€), `TIRAMISU_PRICE` (5€), `CANETTE_PRICE` (2€), `SAUCE_SUP_PRICE` (0,50€).

### La carte actuelle

**🍝 Menu pâtes fraîches — plat à composer 10€** (1 sauce + 1 garniture)
- Sauces : crème de champignons · base crème classique · base tomate · La Spéciale (crème + tomate) · crème de truffe **+4€** · L'Italiana
- Garniture comprise : poulet, poulet effiloché, légumes, viande hachée, lardons de volaille · saumon fumé, kebab ou bœuf effiloché **+1€**
- Garniture en + : saumon fumé ou bœuf effiloché **3€** · autres garnitures **2€**
- Suppléments : burrata 50g **3€** · burrata 100g **5€**

**🔥 Menu viande** (1 accompagnement + 1 sauce compris)
- Ailes de poulet x4 · Brochettes de poulet x3 — **15€**
- Magret entier · Faux-filet · Gigot d'agneau · Assiette Bog (brochettes x2 + 2 ailes) — **20€**
- Accompagnements : riz sauce yassa · riz sauce mafé · riz haricots rouges · pâtes fraîches sauce au choix
- Sauces : sauce verte · poivre — sauce en + **0,50€**
- Supplément : brochettes x2 **5€**

**🍮 Et aussi**
- Tiramisu **5€** (M&M's, Spéculos, Oreo, classique cacao)
- Canette **2€**, servie à part

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
