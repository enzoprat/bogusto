# Bogusto — Design System & Spec

> Document à fournir à Claude Code dans une nouvelle conversation pour reproduire ce design system sur un autre projet restaurant.

---

## 1. Philosophie

**Vibe** : trattoria italienne authentique, lumineuse, populaire — chaleureuse mais pro. Style "kitsch propre" assumé. PAS de premium gastronomique, PAS de minimaliste froid.

**Mots-clés** : généreux, fait maison, rouge brique italien, parchemin, hand-made, comfort food, click & collect rapide.

**Principe directeur** : le site doit donner faim et donner envie de commander en moins de 10 secondes, surtout sur mobile.

---

## 2. Palette CSS (variables `:root`)

```css
:root {
  --c-night:      #6b1f1f;  /* rouge brique foncé — titres bandeaux */
  --c-deep:       #3a2818;  /* brun cacao — fond header / footer */
  --c-cream:      #f5e8c8;  /* crème parchemin — fond hero / story / menu */
  --c-cream-alt:  #ecdcae;  /* crème un cran plus marqué — cards */
  --c-orange:     #a02828;  /* rouge italien BOGUSTO — accent principal */
  --c-yellow:     #d4a84b;  /* doré moutarde — accent secondaire */
  --c-olive:      #6e8c3a;  /* vert basilic */
  --c-grey:       #6e4a2c;  /* brun chaud — texte secondaire */
  --c-grey-light: #e2cfa3;  /* beige doux — bordures */
  --c-success:    #6e8c3a;
}
```

**Règles d'usage** :
- Hero = fond crème + accents rouges. **Jamais** sombre.
- Section livraison / Compose = fond rouge brique → texte **toujours en crème** (jamais noir, jamais deep).
- Footer = brun cacao + texte crème + titres jaune doré.
- Boutons primaires = rouge `--c-orange` + ombre `0 6px 0 #6b1414`.
- Badges variés : `--tagStyle: 'yellow' | 'green' | 'maison' | 'hot'` (cf. section composants).

---

## 3. Typographie

```html
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Bungee&family=Poppins:wght@400;500;600;700;800&family=Caveat:wght@500;700&display=swap" rel="stylesheet" />
```

```css
--font-display: "Bowlby One", "Bungee", sans-serif;   /* titres massifs food-truck */
--font-hand:    "Caveat", cursive;                    /* eyebrows manuscrits, légendes polaroid */
--font-body:    "Poppins", "Inter", system-ui, sans-serif; /* texte courant, lisible */
```

**Hiérarchie** :
- `h1` géant : Bowlby One `clamp(4rem, 12vw, 8rem)` couleur orange + ombre 4px 4px 0 rgba(160,40,40,0.12)
- `h2.section-title` : Bowlby One `clamp(2rem, 5vw, 3.4rem)` couleur deep
- `.eyebrow` : Caveat 1.6rem rotation -2°, couleur orange (ou yellow sur fond rouge)
- Corps : Poppins 1rem, line-height 1.5

---

## 4. Structure obligatoire du site (13 sections)

```
Header fixed (shrink au scroll > 30px)
├─ Hero (logo central + 2 badges + titre massif + 2 CTA + 3 stats count-up + 2 bulles + 2 stamps tournants + wave SVG)
├─ Marquee défilante (orange, texte food-truck répété en boucle infinie 38s)
├─ Story (eyebrow + titre + 3 mini-cards icônes : Maison / Rapide / 10€ le plat)
├─ Compose ton plat (section rouge brique — builder accordéon + photo devanture polaroid)
├─ Menu filtrable (filtres horizontaux + cards avec picto SVG cartouche + tag varié + bouton Ajouter)
├─ Section livraison (rouge brique : adresse + horaires + paiements + réseaux + bouton Maps + encart blanc "Comment ça marche")
├─ Formulaire commande (2 colonnes desktop : panier sticky + form Web3Forms ; 1 colonne mobile)
├─ Galerie photo (4 tuiles 2×2 mobile / 4 colonnes desktop — vraies photos boutique / cuisine / plats / équipe)
├─ Footer (4 colonnes : logo + adresse + horaires + suivre)
├─ Sticky CTA mobile (label + total badge jaune + compteur)
├─ Toast feedback "✓ ajouté"
└─ Modales d'options (backdrop blur + panel arrondi crème)
```

---

## 5. Tunnel d'achat (CRITIQUE)

**Plat à composer 10€ HORS boisson** — la canette est servie à part (2€).

```
Clic sur "+ Ajouter" sur un plat
  → Modale plat (Base + Garniture + Garniture en + + Suppléments + Précision)
  → Prix du bouton recalculé en live à chaque clic
  → Confirmation → plat ajouté au panier
  → POPUP CANETTE qui s'ouvre 250ms après
    → "Ajouter une canette — 2,00€" ou "Continuer sans boisson"
    → canette ajoutée au panier en LIGNE SÉPARÉE
```

**Panier** : chaque ligne est un produit indépendant. Plat 10€ + Canette 2€ = 2 lignes (≠ 1 ligne 12€).

---

## 6. Composants clés

### 6.1 Header fixed avec shrink
```css
.header { height: 72px; transition: height 0.3s ease, background 0.3s ease; }
.header.is-shrunk { height: 56px; background: rgba(58,40,24,0.98); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.header.is-shrunk .logo__img { height: 38px; }
```
JS : `window.addEventListener('scroll', …)` qui toggle `is-shrunk` au-delà de 30px.

### 6.2 Hero stats count-up
```html
<strong data-count-to="6" data-suffix="">0</strong>
<strong data-count-to="10" data-suffix="€">0€</strong>
<strong data-count-to="5" data-prefix="< " data-suffix="'">0'</strong>
```
JS : `IntersectionObserver` qui anime avec easeOutCubic sur 1.2s quand l'élément entre dans le viewport.

### 6.3 Stamps tournants
```css
.stamp--frais { background: var(--c-orange); border: 3px dashed var(--c-cream); animation: stampPop 0.6s + stampSpin1 26s linear infinite; }
.stamp--bdx   { background: var(--c-yellow); border: 3px solid var(--c-deep); animation: stampPop 0.6s + stampSpin2 32s linear infinite; }
@keyframes stampSpin1 { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(-6deg); } }
```

### 6.4 Marquee défilante
```html
<div class="marquee"><div class="marquee__track">
  <span class="marquee__item">SALSE FATTE BENE</span><span class="marquee__sep">★</span>
  …répété 10× pour boucle infinie…
</div></div>
```
```css
.marquee { background: var(--c-orange); padding: 14px 0; overflow: hidden; }
.marquee__track { animation: marqueeScroll 38s linear infinite; font-family: var(--font-display); letter-spacing: 2px; }
@keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none; } }
```

### 6.5 Compose accordéon
HTML natif `<details>` avec `<summary>` custom :
```html
<details class="acc" open>
  <summary class="acc__head">
    <span class="acc__num">1</span>
    <span class="acc__title">Ta base</span>
    <span class="acc__preview" data-preview-for="composeBase" data-placeholder="Choisir">Choisir</span>
    <span class="acc__chevron">▾</span>
  </summary>
  <div class="acc__body">
    <div class="chips chips--wrap" id="composeBase"></div>
    <!-- les chips sont générées par chipList() depuis BASES / GARNITURES / SUPPLEMENTS -->
  </div>
</details>
```

**Comportements obligatoires** :
- Numéro rond noir → orange `✓` quand l'étape est validée (via `.acc__preview--filled`)
- Tag preview passe de "Choisir" / "Facultatif" en beige → la sélection en orange
- **Auto-pass à l'étape suivante** (timeout 250ms) après chaque clic
- Chevron qui pivote 180° à l'ouverture
- Encart sticky bottom avec total estimatif live + bouton "Ajouter à ma commande"

### 6.6 Photo devanture en polaroid (section Compose)
```css
.compose__devanture {
  background: var(--c-cream);
  padding: 12px 12px 50px;
  transform: rotate(-3deg);
  box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 6px 15px rgba(0,0,0,0.2);
  animation: floatyV2 8s ease-in-out infinite;
  max-width: 460px;
}
.compose__devanture:hover { transform: rotate(0) scale(1.02); }
.compose__devanture-caption {
  position: absolute; bottom: 14px; left: 0; right: 0;
  text-align: center;
  font-family: var(--font-hand); font-size: 1.5rem;
  color: var(--c-orange);
}
```
Sticker "MANGIA BENE" jaune doré qui dépasse en haut à gauche.

### 6.7 Cards menu
```html
<article class="product reveal">
  <div class="product__head">
    <div class="product__picto">[svg picto catégorie]</div>
    <span class="product__tag product__tag--hot">Signature</span>
  </div>
  <h3 class="product__name">Plat à composer</h3>
  <p class="product__desc">…</p>
  <div class="product__footer">
    <div class="product__price">10,00€<small>personnalisable</small></div>
    <button class="product__add" data-id="compose">Ajouter</button>
  </div>
</article>
```

**Variantes tag** :
- `product__tag--yellow` : doré
- `product__tag--green`  : vert basilic
- `product__tag--maison` : crème + bordure dashed orange
- `product__tag--hot`    : orange + animation pulse 2s infinite

**Hover desktop** : `translateY(-6px) rotate(-0.3deg)` + picto bounce 0.5s + couleur picto orange.

### 6.8 Sticky CTA mobile
```html
<a href="#commander" class="sticky-cta">
  <span class="sticky-cta__label">Commander maintenant</span>
  <span class="sticky-cta__total" id="stickyTotal">0,00€</span>
  <span class="cart-badge" id="cartBadgeSticky">0</span>
</a>
```
**Bump animation** au moindre `addToCart()` :
```css
.sticky-cta__total.is-bumping { animation: bumpPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes bumpPulse {
  0%   { transform: scale(1);    background: var(--c-yellow); }
  30%  { transform: scale(1.25); background: #ffd470; box-shadow: 0 0 20px rgba(242,183,68,0.6); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1);    background: var(--c-yellow); }
}
```

### 6.9 Toast feedback
Apparaît 2.2s après chaque ajout : `"✓ [Nom du plat] ajouté !"`. Position fixed bottom au-dessus du sticky CTA.

### 6.10 Popup canette (modale dédiée)
Déclenchée automatiquement 250ms après `confirmCompose`, `composeAdd` ou l'ajout d'un plat de la carte :
- Titre rouge brique "Et avec ça, une canette ?"
- Rappel que la canette est servie à part : 2,00€
- 2 boutons : "Ajouter une canette — 2,00€" (primary) + "Continuer sans boisson" (ghost)

---

## 7. Animations (catalogue complet)

| Animation | Trigger | Durée |
|---|---|---|
| Hero title fade-up + scale | Page load | 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) |
| Hero badges slide-in séquentiel | Page load | 0.5s, délai 0.7s / 0.85s |
| Hero CTA + stats fade-in | Page load | 0.6s, délai 1s / 1.2s |
| Visuel hero floaty | Loop | 7s infini, 3 keyframes |
| Stamps oscillation | Loop | 26-32s infini |
| Marquee scroll | Loop | 38s infini (28s mobile) |
| Count-up stats | IntersectionObserver | 1.2s easeOutCubic |
| Cards reveal **staggered** | IntersectionObserver | 0.55s + délai 80ms par item |
| Header shrink | Scroll > 30px | 0.3s ease |
| Card menu hover | Hover desktop | translateY(-6px) + rotate(-0.3deg) + picto bounce |
| Chip active | Click | scale(1.04) + shadow orange |
| Sticky CTA bump | addToCart | 0.6s scale + glow jaune |
| Toast slide-up | addToCart | 0.25s |
| Accordion expand | Click summary | 0.28s ease-out |
| Modal pop | Open | 0.25s scale + fade |
| Polaroid devanture floaty | Loop | 8s infini |

**Tout doit respecter** `@media (prefers-reduced-motion: reduce)`.

---

## 8. Logique panier (script.js)

```js
// Persistance localStorage
const CART_KEY = "bogusto-cart"; // ou {brand}-cart
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(CART)); }
function loadCart() { try { CART = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { CART = []; } }

// Chaque item :
{
  lineId:    uid(),                    // identifiant unique pour les actions
  productId: "compose",
  name:      "Plat Bogusto — Crème de truffe",
  meta:      "Crème de truffe (+4€) · Magret (+3€) · Sup. : Burrata 100g (+5€)",
  qty:       1,
  unitPrice: 22
}

// Actions
addToCart(item)        // → save + render + flash badge + bump sticky + toast
removeFromCart(lineId)
updateQty(lineId, +/- 1)  // min 1

// Render synchronise : badge header, badge sticky, sticky total, panier formulaire
```

---

## 9. Web3Forms

```html
<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="REMPLACER_PAR_LA_CLE_WEB3FORMS">
  <input type="hidden" name="subject" value="Nouvelle commande [BRAND]">
  <input type="hidden" name="commande_resume" id="commandeResume" value="">
  <input type="hidden" name="total_estimatif" id="totalEstimatif" value="0,00€">
  <input type="checkbox" name="botcheck" class="hidden" style="display:none;">
  …
</form>
```
**Soumission AJAX** : `fetch('https://api.web3forms.com/submit', { method: 'POST', body: FormData })`.
Au succès → cacher form, afficher encart vert ✓, vider panier.

**Mode de récupération (dropdown)** :
```html
<option value="Manger sur place">🍽️ Manger sur place</option>
<option value="Click & Collect">📦 Click & Collect — à récupérer</option>
<option value="À emporter">🥡 À emporter</option>
```
⚠️ Pas de "Livraison" si le resto ne livre pas.

---

## 10. Responsive (mobile-first strict)

```
< 480px  : 1 colonne, cards compactes, sticky CTA en bas
480-720  : 1 colonne avec un peu plus d'espace
720-960  : transitions vers desktop
> 960px  : 2-3 colonnes, hover desktop activé
> 1280px : container max 1200px centré
```

**Touch targets** minimum 44×44px. **Pas de hover seul** (toujours doublé d'un état active mobile).

---

## 11. Assets recommandés (dossier `/assets/`)

| Fichier | Usage |
|---|---|
| `logo.svg` ou `logo.webp` | Logo principal (header + footer) |
| `bog-1.jpg` à `bog-N.jpg` | Photos vraies (devanture / cuisine / plats / équipe) — compressées 1200-1400px width JPEG q80 |
| `devanture.jpg` | Photo polaroid section Compose |
| `google-maps.png` | Pin officiel Google Maps (icône) |
| `snapchat.png` / `instagram.svg` / `tiktok.webp` | Logos sociaux selon présence du resto |

**Compression** : `sips --resampleWidth 1200 -s format jpeg -s formatOptions 80 source.jpg --out dest.jpg` (macOS). Cible : < 400 ko par image, < 200 ko si possible.

---

## 12. Contraintes techniques NON-NÉGOCIABLES

- HTML / CSS / JS **vanilla** — pas de React/Vue/Svelte
- 3 fichiers principaux : `index.html` + `style.css` + `script.js` + dossier `/assets/`
- Pas de build step. Drag & drop sur Vercel ou Netlify suffit
- Toutes les couleurs en variables CSS dans `:root`
- Toute la carte en haut de `script.js` : `BASES`, `GARNITURES`, `SUPPLEMENTS`, `TIRAMISU_PARFUMS`, `MENU` — une seule source de vérité (les chips du builder et des modales en sont générées)
- Clé Web3Forms remplaçable en 1 endroit
- Pas de Google Analytics par défaut
- HTML sémantique (header / main / section / nav / footer)
- Aria-labels sur tous les boutons icônes
- Alt text sur toutes les images
- `loading="lazy"` sur images sous le pli
- Aucune image > 400 ko
- Tester iOS Safari + Chrome Android

---

## 13. Anti-patterns (à éviter absolument)

- ❌ Photos de stock génériques sans rapport avec le resto
- ❌ Lorem ipsum
- ❌ Liens sociaux qui pointent vers des comptes inexistants ("on les ajoutera plus tard")
- ❌ Modales qui prennent tout l'écran mobile sans bouton close visible
- ❌ Animations qui rament sur mobile bas de gamme (toujours respecter `prefers-reduced-motion`)
- ❌ Hover desktop sans état active mobile équivalent
- ❌ Texte gris pâle sur fond pâle (contraste WCAG AA min)
- ❌ Texte noir / deep sur fond rouge brique (illisible — toujours crème)
- ❌ "Tagliatelles" si le resto a passé à "Pâtes" simples
- ❌ Suppléments fromage Parmesan/Emmental +0,50€ si retirés de la carte
- ❌ "Plat + boisson 10€" si le modèle est passé à "Plat 10€ + boisson séparée"
- ❌ Tracking par défaut (RGPD)

---

## 14. Workflow attendu pour reproduire ce design

1. **Demander à l'utilisateur** : nom resto, ville, adresse exacte, type cuisine, palette préférée (sinon proposer 3 options), logo (fichier ou à générer), menu complet, horaires, téléphone, réseaux sociaux disponibles, photos disponibles, modes de récupération supportés.
2. **Proposer 2-3 directions visuelles** si la palette n'est pas fixée.
3. **Générer les 3 fichiers** d'un coup, code commenté, structure claire.
4. **Lancer un preview live** (server local + screenshots) pour validation visuelle.
5. **Itérer** par touches intelligentes — ne pas tout refaire à chaque feedback.

---

## 15. Variantes selon le type de resto

| Type | Palette suggérée | Mots-clés |
|---|---|---|
| Pizzeria populaire | Bleu nuit + crème + orange pizza + jaune fromage | Généreux, populaire, livraison, nocturne |
| Pasta bar italien | Kaki foncé + crème + terre cuite + moutarde | Frais, sauces caractère, étudiant, comfort |
| Trattoria italienne (Bogusto) | Rouge brique + parchemin + brun cacao + doré | Authentique, fatte bene, mangia bene, soir |
| Burger joint US | Noir + rouge ketchup + jaune moutarde + crème | Massif, kitsch, double cheese, fast |
| Kebab moderne | Vert olive + ivoire + rouge brique | Frais, fait main, oriental, généreux |
| Sushi to-go | Noir mat + corail saumon + bambou | Précis, frais, omakase, premium accessible |

---

## 16. Checklist de livraison

- [ ] Toutes les couleurs en variables CSS
- [ ] Menu modifiable en éditant uniquement les tableaux du haut de `script.js`
- [ ] Clé Web3Forms remplaçable en 1 endroit
- [ ] Favicon présent
- [ ] Open Graph meta (image partage WhatsApp / Insta)
- [ ] `prefers-reduced-motion` respecté
- [ ] HTML sémantique
- [ ] Aria-labels + alt text partout
- [ ] Aucune image > 400 ko
- [ ] `loading="lazy"` sur images sous le pli
- [ ] Test mobile Safari + Chrome Android
- [ ] Test slow 3G (preview doit être instantané)
- [ ] Lien `tel:` pour appel direct mobile (si numéro fourni)
- [ ] Mentions légales / liens RGPD si présent

---

**Ce document décrit la V6 du site Bogusto au 1er juin 2026.** Reproduisible tel quel pour un autre resto en suivant la section 14 et en remplaçant la palette + le menu + les photos. Le code source est sur https://github.com/enzoprat/bogusto.
