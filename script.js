/* ============================================
   BOGUSTO — Salse fatte bene · Bordeaux Ginko
   Cart + Menu + Form
   ============================================ */

/* ---------- RUPTURES DE STOCK ----------
   Le gérant met des éléments « en sommeil » depuis /dash.
   Le site lit /api/dispo au chargement ; en cas de pépin, tout reste
   disponible — on ne bloque jamais une commande à cause de l'API. */
let SOMMEIL = new Set();
const estEnSommeil = (id) => Boolean(id) && SOMMEIL.has(id);

async function loadDispo() {
  try {
    const res = await fetch("/api/dispo", { headers: { Accept: "application/json" } });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.sommeil)) SOMMEIL = new Set(data.sommeil);
  } catch (e) {
    /* hors ligne ou API absente : on laisse tout disponible */
  }
}

/* ---------- RENDU DES CHIPS ---------- */
const priceTag = (n) => (n > 0 ? ` <em>+${eur(n).replace(",00", "")}</em>` : "");

function chipList(items, priceKey) {
  return items.map(i => {
    const ex = i[priceKey] || 0;
    const img = photoDe(i.id);
    const vignette = img ? `<img class="chip__img" src="${img}" alt="" loading="lazy" />` : "";
    const classe = img ? "chip chip--photo" : "chip";
    if (estEnSommeil(i.id)) {
      return `<button class="${classe} chip--out" disabled aria-disabled="true" title="Épuisé pour ce soir">${vignette}<span>${i.label} <em>épuisé</em></span></button>`;
    }
    return `<button class="${classe}" data-value="${i.val}" data-val="${i.val}" data-extra="${ex}">${vignette}<span>${i.label}${priceTag(ex)}</span></button>`;
  }).join("");
}

/* ---------- CATEGORY ICONS (SVG) ---------- */
const CAT_ICON = {
  pates:       '<svg viewBox="0 0 32 32" fill="currentColor"><ellipse cx="16" cy="20" rx="13" ry="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 18 Q16 14 27 18" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 15 Q12 11 14 15 M16 14 Q18 10 20 14 M22 15 Q24 11 26 15" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
  viande:      '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M4 26 L26 6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M22 4 L28 10" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="18" rx="4.4" ry="3.4" transform="rotate(-45 12 18)" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="19" cy="11" rx="4.4" ry="3.4" transform="rotate(-45 19 11)" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
  fraicheur:   '<svg viewBox="0 0 32 32" fill="currentColor"><circle cx="16" cy="18" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M16 12 Q13 7 8 7 Q9 12 14 13" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M17 12 Q20 7 25 8 Q23 12 18 13" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
  dessert:     '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M8 12 Q8 6 16 6 Q24 6 24 12 L24 14 L8 14 Z"/><rect x="10" y="14" width="12" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 18 L21 18 M11 21 L21 21" stroke="currentColor" stroke-width="1.5"/></svg>',
  boisson:     '<svg viewBox="0 0 32 32" fill="currentColor"><rect x="10" y="6" width="12" height="20" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="10" y="9" width="12" height="2"/><path d="M12 14 L20 14 M12 18 L20 18" stroke="currentColor" stroke-width="1.2"/></svg>',
};

/* ---------- HELPERS ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const eur = (n) => n.toFixed(2).replace(".", ",") + "€";
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- CART STATE ---------- */
let CART = [];

function saveCart() {
  try { localStorage.setItem("bogusto-cart", JSON.stringify(CART)); } catch (e) {}
}
function loadCart() {
  try {
    const raw = localStorage.getItem("bogusto-cart");
    if (raw) CART = JSON.parse(raw);
  } catch (e) {}
}

function addToCart(item) {
  CART.push({ ...item, lineId: uid() });
  saveCart();
  renderCart();
  flashCart();
  bumpStickyCTA();
  showToast(`${item.name} ajouté !`);
}

/* ---------- TOAST ---------- */
let toastTimer = null;
function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  $(".toast__msg", t).textContent = msg;
  t.hidden = false;
  // re-flow to retrigger animation
  void t.offsetWidth;
  t.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("is-visible");
    setTimeout(() => { t.hidden = true; }, 300);
  }, 2200);
}
function removeFromCart(lineId) {
  CART = CART.filter(i => i.lineId !== lineId);
  saveCart();
  renderCart();
}
function updateQty(lineId, delta) {
  const item = CART.find(i => i.lineId === lineId);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart();
  renderCart();
}

function cartTotal() {
  return CART.reduce((s, it) => s + (it.unitPrice * (it.qty || 1)), 0);
}

function flashCart() {
  $$(".cart-badge").forEach(b => {
    b.style.transform = "scale(1.4)";
    setTimeout(() => { b.style.transform = ""; }, 250);
  });
}

/* ---------- RENDER MENU ---------- */
function renderMenu(filter = "all") {
  const grid = $("#menuGrid");
  grid.innerHTML = "";
  const items = filter === "all" ? MENU : MENU.filter(m => m.cat === filter);

  items.forEach(prod => {
    const out = estEnSommeil(prod.id);
    const card = document.createElement("article");
    card.className = "product reveal" + (out ? " product--out" : "");
    card.dataset.cat = prod.cat;

    const img = photoDe(prod.photo || prod.id);
    const photoHtml = img ? `<div class="product__photo"><img src="${img}" alt="${prod.name}" loading="lazy" /></div>` : "";
    const priceHtml = `<div class="product__price">${eur(prod.price)}${prod.customizable && !out ? '<small>personnalisable</small>' : ''}</div>`;
    const tagClass = out ? "product__tag product__tag--out" : `product__tag product__tag--${prod.tagStyle || 'yellow'}`;
    const tagText = out ? "Épuisé" : prod.tag;
    const picto = CAT_ICON[prod.cat] || '';
    const bouton = out
      ? '<button class="product__add product__add--out" disabled aria-disabled="true">Épuisé</button>'
      : `<button class="product__add" data-id="${prod.id}">Ajouter</button>`;

    card.innerHTML = `
      ${photoHtml}
      <div class="product__head">
        <div class="product__picto" aria-hidden="true">${picto}</div>
        <span class="${tagClass}">${tagText}</span>
      </div>
      <h3 class="product__name">${prod.name}</h3>
      <p class="product__desc">${prod.desc}</p>
      <div class="product__footer">
        ${priceHtml}
        ${bouton}
      </div>
    `;
    grid.appendChild(card);
  });

  $$(".product__add", grid).forEach(btn => {
    btn.addEventListener("click", () => onAddProduct(btn.dataset.id));
  });

  observeReveal();
}

/* ---------- ADD PRODUCT ---------- */
function onAddProduct(id) {
  const prod = MENU.find(m => m.id === id);
  if (!prod) return;

  // Plat à composer (pâtes fraîches)
  if (prod.id === "compose") {
    openModal(composeModal(prod));
    return;
  }

  // Menu viande → accompagnement + sauce + suppléments
  if (prod.cat === "viande") {
    openModal(viandeModal(prod));
    return;
  }

  // Tiramisu → choix du parfum
  if (prod.id === "tiramisu") {
    openModal(tiramisuModal(prod));
    return;
  }

  // Canette → ajout direct
  addToCart({
    productId: prod.id,
    name: prod.name,
    meta: "",
    qty: 1,
    unitPrice: prod.price,
  });
}

/* ---------- MODALS ---------- */
function openModal(html) {
  const modal = $("#modal");
  $("#modalContent").innerHTML = html;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#modal").hidden = true;
  document.body.style.overflow = "";
}

const optLabel = (txt) => `<small style="font-weight:400;color:var(--c-grey);">${txt}</small>`;

/* --- Plat à composer (pâtes fraîches) --- */
function composeModal(prod) {
  return `
    <h3>${prod.name} — ${eur(PLAT_PRICE)}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>1. Ta sauce</h5>
      <div class="chips chips--wrap" id="mSauce">${chipList(SAUCES, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>2. Ta garniture ${optLabel("comprise")}</h5>
      <div class="chips chips--wrap" id="mGarniture">${chipList(GARNITURES, "first")}</div>
    </div>

    <div class="modal__field">
      <h5>3. Garniture en + ${optLabel("facultatif")}</h5>
      <div class="chips chips--wrap" id="mGarnitureExtra">${chipList(GARNITURES, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>4. Suppléments ${optLabel("facultatif")}</h5>
      <div class="chips chips--wrap" id="mSupp">${chipList(SUPPLEMENTS, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>5. Une précision ?</h5>
      <textarea class="textarea" id="mNote" placeholder="Allergies, sans tel ingrédient..."></textarea>
    </div>

    <button class="btn btn--primary btn--full" id="confirmCompose" data-base-price="${PLAT_PRICE}">Ajouter — ${eur(PLAT_PRICE)}</button>
    <p class="modal__foot">La canette est à part : ${eur(CANETTE_PRICE)} 🥤</p>
  `;
}

/* --- Menu viande --- */
function viandeModal(prod) {
  const saucesEnPlus = SAUCES_VIANDE.map(s => ({ ...s, extra: SAUCE_SUP_PRICE }));
  return `
    <h3>${prod.name} — ${eur(prod.price)}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>1. La sauce de tes pâtes</h5>
      <p class="acc__hint">Servi avec ${ACCOMPAGNEMENT.toLowerCase()} — choisis la sauce.</p>
      <div class="chips chips--wrap" id="mPastaSauce">${chipList(SAUCES, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>2. Ta sauce d'accompagnement</h5>
      <div class="chips chips--wrap" id="mSauceViande">${chipList(SAUCES_VIANDE, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>3. Sauce en + ${optLabel("facultatif")}</h5>
      <div class="chips chips--wrap" id="mSauceExtra">${chipList(saucesEnPlus, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>4. Une précision ?</h5>
      <textarea class="textarea" id="mNote" placeholder="Cuisson, allergies, sans tel ingrédient..."></textarea>
    </div>

    <button class="btn btn--primary btn--full" id="confirmViande" data-base-price="${prod.price}" data-name="${prod.name}">Ajouter — ${eur(prod.price)}</button>
    <p class="modal__foot">La canette est à part : ${eur(CANETTE_PRICE)} 🥤</p>
  `;
}

function tiramisuModal(prod) {
  return `
    <h3>${prod.name} — ${eur(prod.price)}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>Choisis ton parfum</h5>
      <div class="chips chips--wrap" id="mTiramisu">
        ${TIRAMISU_PARFUMS.map(p => `<button class="chip" data-val="${p}">${p}</button>`).join("")}
      </div>
    </div>

    <button class="btn btn--primary btn--full" id="confirmTiramisu" data-base="${prod.price}">Ajouter — ${eur(prod.price)}</button>
  `;
}

/* ---------- POPUP « ET AVEC ÇA ? » (proposé après un plat) ---------- */
const EXTRAS_POPUP = [
  { id: "canette",  nom: "Canette 33cl",     detail: "Bien fraîche",            prix: CANETTE_PRICE },
  { id: "eau",      nom: "Bouteille d'eau",  detail: "",                        prix: EAU_PRICE },
  { id: "tiramisu", nom: "Tiramisu",         detail: "Parfum au choix",         prix: TIRAMISU_PRICE },
];

function drinkPopupModal(forProduct) {
  return `
    <h3>Et avec ça ?</h3>
    <p class="modal__desc">Ton plat <strong>${forProduct}</strong> est dans le panier. Boissons et desserts sont servis à part.</p>

    <div class="extras">
      ${EXTRAS_POPUP.map(e => {
        const img = photoDe(e.id);
        return `
        <button class="extra" data-extra-id="${e.id}" data-nom="${e.nom}" data-prix="${e.prix}">
          ${img ? `<img class="extra__img" src="${img}" alt="" loading="lazy" />` : '<span class="extra__img extra__img--vide" aria-hidden="true"></span>'}
          <span class="extra__txt">
            <span class="extra__nom">${e.nom}</span>
            ${e.detail ? `<span class="extra__detail">${e.detail}</span>` : ""}
          </span>
          <span class="extra__prix">${eur(e.prix)}</span>
        </button>`;
      }).join("")}
    </div>

    <button class="btn btn--ghost btn--full" id="skipDrinkPopup" style="margin-top:14px;">Non merci, continuer</button>
  `;
}

/* ---------- PRIX LIVE DANS LES MODALES ---------- */
const chipExtra = (el) => parseFloat(el.dataset.extra || 0);
const chipLabel = (el) => {
  const ex = chipExtra(el);
  return ex > 0 ? `${el.dataset.val} (+${eur(ex).replace(",00", "")})` : el.dataset.val;
};

function modalPrice() {
  const btn = $("#modalContent [data-base-price]");
  if (!btn) return 0;
  let total = parseFloat(btn.dataset.basePrice);
  $$("#modalContent .chip.is-active").forEach(c => { total += chipExtra(c); });
  return total;
}
function refreshModalPrice() {
  const btn = $("#modalContent [data-base-price]");
  if (btn) btn.textContent = `Ajouter — ${eur(modalPrice())}`;
}

/* ---------- MODAL BEHAVIOR ---------- */
const MODAL_SINGLE = ["#mSauce", "#mGarniture", "#mTiramisu", "#mPastaSauce", "#mSauceViande"];
const MODAL_MULTI  = ["#mGarnitureExtra", "#mSupp", "#mSauceExtra"];

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal();

  // Une chip contient une vignette et un libellé : le clic atterrit sur un
  // enfant, pas sur le bouton. On remonte au bouton avec closest(), sans quoi
  // la sélection ne se fait jamais.
  const chip = e.target.closest(".modal .chip");
  if (chip && !chip.disabled) {
    // Choix unique
    MODAL_SINGLE.forEach(id => {
      if (chip.matches(`${id} .chip`)) {
        $$(`${id} .chip`).forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");
      }
    });

    // Choix multiples
    MODAL_MULTI.forEach(id => {
      if (chip.matches(`${id} .chip`)) chip.classList.toggle("is-active");
    });

    refreshModalPrice();
  }

  // CONFIRM PLAT À COMPOSER (pâtes fraîches)
  if (e.target.id === "confirmCompose") {
    const sauce = $("#mSauce .chip.is-active");
    const garniture = $("#mGarniture .chip.is-active");
    if (!sauce) { alert("Choisis ta sauce."); return; }
    if (!garniture) { alert("Choisis ta garniture."); return; }

    const extras = $$("#mGarnitureExtra .chip.is-active");
    const supps  = $$("#mSupp .chip.is-active");
    const note   = $("#mNote")?.value.trim();

    const metaParts = ["Pâtes fraîches", chipLabel(sauce), chipLabel(garniture)];
    if (extras.length) metaParts.push(`En + : ${extras.map(chipLabel).join(", ")}`);
    if (supps.length)  metaParts.push(`Sup. : ${supps.map(chipLabel).join(", ")}`);
    if (note) metaParts.push(note);

    const platName = `Pâtes — ${sauce.dataset.val}`;

    addToCart({
      productId: "compose",
      name: platName,
      meta: metaParts.join(" · "),
      qty: 1,
      unitPrice: modalPrice(),
    });
    closeModal();
    setTimeout(() => openModal(drinkPopupModal(platName)), 250);
  }

  // CONFIRM MENU VIANDE
  if (e.target.id === "confirmViande") {
    const pastaSauce = $("#mPastaSauce .chip.is-active");
    const sauce = $("#mSauceViande .chip.is-active");
    if (!pastaSauce) { alert("Choisis la sauce de tes pâtes."); return; }
    if (!sauce) { alert("Choisis ta sauce d'accompagnement."); return; }

    const saucesEnPlus = $$("#mSauceExtra .chip.is-active");
    const note = $("#mNote")?.value.trim();
    const name = e.target.dataset.name;

    const metaParts = [`${ACCOMPAGNEMENT} · ${chipLabel(pastaSauce)}`, `Sauce : ${sauce.dataset.val}`];
    if (saucesEnPlus.length) metaParts.push(`Sauce en + : ${saucesEnPlus.map(chipLabel).join(", ")}`);
    if (note) metaParts.push(note);

    addToCart({
      productId: "viande",
      name: name,
      meta: metaParts.join(" · "),
      qty: 1,
      unitPrice: modalPrice(),
    });
    closeModal();
    setTimeout(() => openModal(drinkPopupModal(name)), 250);
  }

  // CONFIRM TIRAMISU
  if (e.target.id === "confirmTiramisu") {
    const sel = $("#mTiramisu .chip.is-active");
    if (!sel) { alert("Choisis ton parfum."); return; }
    addToCart({
      productId: "tiramisu",
      name: "Tiramisu",
      meta: sel.dataset.val,
      qty: 1,
      unitPrice: parseFloat(e.target.dataset.base),
    });
    closeModal();
  }

  // AJOUT D'UN EXTRA depuis le pop-up
  const extraBtn = e.target.closest("[data-extra-id]");
  if (extraBtn) {
    const id = extraBtn.dataset.extraId;
    closeModal();
    // le tiramisu a des parfums : on repasse par sa modale
    if (id === "tiramisu") {
      const prod = MENU.find(m => m.id === "tiramisu");
      if (prod) { setTimeout(() => openModal(tiramisuModal(prod)), 200); return; }
    }
    addToCart({
      productId: id,
      name: extraBtn.dataset.nom,
      meta: "Avec un plat",
      qty: 1,
      unitPrice: parseFloat(extraBtn.dataset.prix),
    });
  }
  if (e.target.id === "skipDrinkPopup") {
    closeModal();
  }
});

/* ---------- COMPOSE TON PLAT (section builder — pâtes fraîches) ---------- */
function initCompose() {
  const elSauce  = $("#composeSauce");
  const elGarn   = $("#composeGarniture");
  const elExtras = $("#composeGarnitureExtra");
  const elSupp   = $("#composeSupp");
  if (!elSauce || !elGarn || !elExtras || !elSupp) return;

  elSauce.innerHTML  = chipList(SAUCES, "extra");
  elGarn.innerHTML   = chipList(GARNITURES, "first");
  elExtras.innerHTML = chipList(GARNITURES, "extra");
  elSupp.innerHTML   = chipList(SUPPLEMENTS, "extra");

  let selectedSauce = null;          // { val, extra }
  let selectedGarniture = null;      // { val, extra }
  const selectedExtras = new Map();  // val → prix
  const selectedSupp   = new Map();  // val → prix

  const sumMap = (m) => Array.from(m.values()).reduce((s, v) => s + v, 0);
  const money  = (p) => eur(p).replace(",00", "");
  const labelMap = (m) => Array.from(m.entries()).map(([v, p]) => (p > 0 ? `${v} (+${money(p)})` : v));
  const labelOne = (sel) => (sel && sel.extra > 0 ? `${sel.val} (+${money(sel.extra)})` : (sel ? sel.val : ""));

  function currentPrice() {
    return PLAT_PRICE
      + (selectedSauce ? selectedSauce.extra : 0)
      + (selectedGarniture ? selectedGarniture.extra : 0)
      + sumMap(selectedExtras)
      + sumMap(selectedSupp);
  }

  function updateLivePrice() {
    const el = $("#composeLivePrice");
    if (el) el.textContent = eur(currentPrice());
  }

  function updatePreview(containerId, text) {
    const p = document.querySelector(`[data-preview-for="${containerId.replace('#', '')}"]`);
    if (!p) return;
    const placeholder = p.dataset.placeholder || "Choisir";
    p.textContent = text || placeholder;
    p.classList.toggle("acc__preview--filled", !!text);
  }

  // Ouvre automatiquement l'étape suivante
  function openNextStep(currentDetails) {
    const all = $$(".acc");
    const idx = all.indexOf(currentDetails);
    if (idx === -1 || idx === all.length - 1) return;
    setTimeout(() => {
      currentDetails.removeAttribute("open");
      const next = all[idx + 1];
      const nextPreview = next.querySelector(".acc__preview");
      if (next && (!nextPreview || !nextPreview.classList.contains("acc__preview--filled"))) {
        next.setAttribute("open", "");
      }
    }, 250);
  }

  function getDetails(containerId) {
    const el = document.querySelector(containerId);
    return el ? el.closest("details.acc") : null;
  }

  function pickSingle(containerId, onPick) {
    $$(`${containerId} .chip`).forEach(c => {
      c.addEventListener("click", () => {
        $$(`${containerId} .chip`).forEach(x => x.classList.remove("is-active"));
        c.classList.add("is-active");
        const sel = { val: c.dataset.value, extra: chipExtra(c) };
        onPick(sel);
        updatePreview(containerId, labelOne(sel));
        updateLivePrice();
        openNextStep(getDetails(containerId));
      });
    });
  }

  function pickMulti(containerId, store) {
    $$(`${containerId} .chip`).forEach(c => {
      c.addEventListener("click", () => {
        const val = c.dataset.value;
        if (store.has(val)) {
          store.delete(val);
          c.classList.remove("is-active");
        } else {
          store.set(val, chipExtra(c));
          c.classList.add("is-active");
        }
        updatePreview(containerId, labelMap(store).join(", "));
        updateLivePrice();
      });
    });
  }

  pickSingle("#composeSauce", (sel) => { selectedSauce = sel; });
  pickSingle("#composeGarniture", (sel) => { selectedGarniture = sel; });
  pickMulti("#composeGarnitureExtra", selectedExtras);
  pickMulti("#composeSupp", selectedSupp);

  // Aperçu de la note
  const noteEl = $("#composeNote");
  if (noteEl) {
    noteEl.addEventListener("input", () => {
      const v = noteEl.value.trim();
      const p = $("#composeNotePreview");
      if (p) {
        p.textContent = v ? (v.length > 25 ? v.slice(0, 25) + "…" : v) : (p.dataset.placeholder || "Facultatif");
        p.classList.toggle("acc__preview--filled", !!v);
      }
    });
  }

  $("#composeAdd").addEventListener("click", () => {
    if (!selectedSauce) { alert("Choisis ta sauce."); return; }
    if (!selectedGarniture) { alert("Choisis ta garniture."); return; }

    const price = currentPrice();
    const platName = `Pâtes — ${selectedSauce.val}`;

    const parts = ["Pâtes fraîches", labelOne(selectedSauce), labelOne(selectedGarniture)];
    if (selectedExtras.size) parts.push(`En + : ${labelMap(selectedExtras).join(", ")}`);
    if (selectedSupp.size)   parts.push(`Sup. : ${labelMap(selectedSupp).join(", ")}`);
    const note = noteEl ? noteEl.value.trim() : "";
    if (note) parts.push(note);

    addToCart({
      productId: "compose",
      name: platName,
      meta: parts.join(" · "),
      qty: 1,
      unitPrice: price,
    });

    // Reset
    $$(".builder .chip").forEach(c => c.classList.remove("is-active"));
    selectedSauce = null;
    selectedGarniture = null;
    selectedExtras.clear();
    selectedSupp.clear();
    if (noteEl) noteEl.value = "";
    updateLivePrice();

    $$(".acc__preview").forEach(p => {
      p.classList.remove("acc__preview--filled");
      p.textContent = p.dataset.placeholder || "Choisir";
    });
    $$(".acc").forEach((d, i) => {
      if (i === 0) d.setAttribute("open", "");
      else d.removeAttribute("open");
    });

    setTimeout(() => openModal(drinkPopupModal(platName)), 250);
  });

  updateLivePrice();
}

/* ---------- SECTION DESSERTS ---------- */
function initDesserts() {
  const zone = $("#dessertsParfums");
  const bouton = $("#dessertAdd");
  if (!zone || !bouton) return;

  const prod = MENU.find(m => m.id === "tiramisu");
  const epuise = estEnSommeil("tiramisu");

  zone.innerHTML = TIRAMISU_PARFUMS
    .map((p, i) => `<button class="chip${i === 0 ? " is-active" : ""}" data-parfum="${p}"${epuise ? " disabled" : ""}>${p}</button>`)
    .join("");

  if (epuise) {
    bouton.disabled = true;
    bouton.textContent = "Épuisé pour ce soir";
    return;
  }

  zone.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-parfum]");
    if (!chip) return;
    $$("#dessertsParfums .chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
  });

  bouton.addEventListener("click", () => {
    const choisi = $("#dessertsParfums .chip.is-active");
    addToCart({
      productId: "tiramisu",
      name: "Tiramisu",
      meta: choisi ? choisi.dataset.parfum : TIRAMISU_PARFUMS[0],
      qty: 1,
      unitPrice: prod ? prod.price : TIRAMISU_PRICE,
    });
  });
}

/* ---------- FEATURED COUP DE CŒUR ---------- */
function initFeatured() {
  const btn = document.querySelector("[data-add-featured]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    onAddProduct(btn.dataset.addFeatured);
  });
}

/* ---------- CART RENDER ---------- */
function renderCart() {
  const list = $("#cartItems");
  const totalEl = $("#cartTotal");
  const count = CART.reduce((s, i) => s + (i.qty || 1), 0);

  $$(".cart-badge").forEach(b => b.textContent = count);
  const stickyTotal = $("#stickyTotal");
  if (stickyTotal) stickyTotal.textContent = eur(cartTotal());

  if (CART.length === 0) {
    list.innerHTML = `
      <div class="cart__empty">
        <p>🍝 Ton panier est vide.</p>
        <p>Ajoute des plats depuis le menu pour commencer ta commande.</p>
        <a href="#menu" class="btn btn--ghost btn--small">Voir le menu</a>
      </div>
    `;
    totalEl.textContent = "0,00€";
    return;
  }

  list.innerHTML = CART.map(it => `
    <div class="cart-item">
      <div class="cart-item__top">
        <span class="cart-item__name">${it.name}</span>
        <span class="cart-item__price">${eur(it.unitPrice * (it.qty || 1))}</span>
      </div>
      ${it.meta ? `<div class="cart-item__meta">${it.meta}</div>` : ""}
      <div class="cart-item__controls">
        <div class="qty">
          <button data-act="minus" data-id="${it.lineId}">−</button>
          <span>${it.qty || 1}</span>
          <button data-act="plus" data-id="${it.lineId}">+</button>
        </div>
        <button class="cart-remove" data-act="remove" data-id="${it.lineId}">Retirer</button>
      </div>
    </div>
  `).join("");

  totalEl.textContent = eur(cartTotal());

  list.querySelectorAll("[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (btn.dataset.act === "minus") updateQty(id, -1);
      if (btn.dataset.act === "plus") updateQty(id, 1);
      if (btn.dataset.act === "remove") removeFromCart(id);
    });
  });
}

/* ---------- CRÉNEAUX DE RETRAIT ----------
   Service du mercredi au dimanche, 19h → minuit. On propose les jours
   ouverts des trois prochaines semaines, et pour aujourd'hui seulement
   les créneaux encore atteignables. */
const JOURS_SERVICE = [3, 4, 5, 6, 0];   // mercredi → dimanche (0 = dimanche)
const OUVERTURE_H = 19;
const DERNIER_CRENEAU = "23:45";
const DELAI_PREPA_MIN = 20;              // marge avant le premier créneau du soir

const NOMS_JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin",
                   "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const isoDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function libelleJour(d, aujourdhui) {
  const base = `${NOMS_JOURS[d.getDay()]} ${d.getDate()} ${NOMS_MOIS[d.getMonth()]}`;
  return aujourdhui ? `aujourd'hui, ${base}` : base;
}

/** Les jours de service des 3 prochaines semaines, aujourd'hui compris si le service n'est pas fini. */
function joursDisponibles() {
  const out = [];
  const maintenant = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + i);
    if (!JOURS_SERVICE.includes(d.getDay())) continue;
    if (i === 0 && !creneauxDuJour(d).length) continue;  // trop tard ce soir
    out.push({ iso: isoDe(d), libelle: libelleJour(d, i === 0) });
  }
  return out;
}

/** Créneaux de 15 min entre 19h et 23h45 ; pour aujourd'hui, uniquement ceux à venir. */
function creneauxDuJour(d) {
  const estAujourdhui = isoDe(d) === isoDe(new Date());
  let minimum = OUVERTURE_H * 60;
  if (estAujourdhui) {
    const maintenant = new Date();
    const depuisMinuit = maintenant.getHours() * 60 + maintenant.getMinutes() + DELAI_PREPA_MIN;
    minimum = Math.max(minimum, Math.ceil(depuisMinuit / 15) * 15);
  }
  const [hFin, mFin] = DERNIER_CRENEAU.split(":").map(Number);
  const maximum = hFin * 60 + mFin;

  const out = [];
  for (let t = minimum; t <= maximum; t += 15) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

function initCreneaux() {
  const jour = $("#champJour");
  const heure = $("#champHeure");
  if (!jour || !heure) return;

  const jours = joursDisponibles();
  jour.innerHTML = '<option value="">Choisis...</option>' +
    jours.map(j => `<option value="${j.iso}">${j.libelle}</option>`).join("");

  function majHeures() {
    if (!jour.value) {
      heure.innerHTML = '<option value="">Choisis le jour d\'abord</option>';
      return;
    }
    const [a, m, d] = jour.value.split("-").map(Number);
    const creneaux = creneauxDuJour(new Date(a, m - 1, d));
    heure.innerHTML = '<option value="">Choisis...</option>' +
      creneaux.map(c => `<option value="${c}">${c.replace(":", "h")}</option>`).join("");
  }

  jour.addEventListener("change", majHeures);
  majHeures();
}

/* ---------- FORM SUBMIT ---------- */
function initForm() {
  const form = $("#orderForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (CART.length === 0) {
      alert("Ton panier est vide. Ajoute au moins un plat.");
      return;
    }

    const champs = new FormData(form);
    const jourSelect = $("#champJour");
    const jourLisible = jourSelect && jourSelect.selectedIndex > 0
      ? jourSelect.options[jourSelect.selectedIndex].text
      : "";
    const commande = {
      nom:         champs.get("nom") || "",
      telephone:   champs.get("telephone") || "",
      mode:        champs.get("mode") || "",
      date:        jourLisible,
      dateIso:     champs.get("dateIso") || "",
      heure:       champs.get("heure") || "",
      paiement:    champs.get("paiement") || "",
      commentaire: champs.get("commentaire") || "",
      botcheck:    champs.get("botcheck") ? 1 : 0,
      lignes: CART.map(it => ({
        qte:  it.qty || 1,
        nom:  it.name,
        meta: it.meta || "",
        prix: it.unitPrice,
      })),
      total: cartTotal(),
    };

    const submitBtn = $("#submitBtn");
    const libelle = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commande),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Erreur d'envoi");

      const num = $("#orderNumero");
      if (num) num.textContent = json.numero || "—";
      form.querySelectorAll("input, select, textarea, button, label, .orderform__row, .orderform__legal")
        .forEach(el => el.style.display = "none");
      $("#orderSuccess").hidden = false;
      $("#orderSuccess").style.display = "block";
      CART = [];
      saveCart();
      renderCart();
      window.scrollTo({ top: $("#commander").offsetTop - 80, behavior: "smooth" });
    } catch (err) {
      alert(err.message || "Une erreur est survenue lors de l'envoi.");
      submitBtn.disabled = false;
      submitBtn.textContent = libelle;
    }
  });
}

/* ---------- FILTERS ---------- */
function initFilters() {
  $$(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMenu(btn.dataset.filter);
    });
  });
}

/* ---------- BURGER MENU ---------- */
function initBurger() {
  const burger = $("#burger");
  const nav = $("#nav");
  burger.addEventListener("click", () => {
    burger.classList.toggle("is-open");
    nav.classList.toggle("nav--open");
  });
  $$(".nav__link").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("is-open");
    nav.classList.remove("nav--open");
  }));
}

/* ---------- REVEAL ON SCROLL (staggered) ---------- */
let revealObserver;
function observeReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      const groups = new Map();
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const parent = en.target.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(en.target);
      });

      groups.forEach(items => {
        items.forEach((el, i) => {
          setTimeout(() => el.classList.add("is-visible"), i * 80);
          revealObserver.unobserve(el);
        });
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  }
  $$(".reveal:not(.is-visible)").forEach(el => revealObserver.observe(el));
}

/* ---------- COUNT UP ---------- */
function initCountUp() {
  const counters = $$("[data-count-to]");
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseFloat(el.dataset.countTo);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ---------- HEADER SHRINK ---------- */
function initHeaderShrink() {
  const header = $("#header");
  if (!header) return;
  let ticking = false;
  function update() {
    if (window.scrollY > 30) header.classList.add("is-shrunk");
    else header.classList.remove("is-shrunk");
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ---------- STICKY CTA BUMP ---------- */
function bumpStickyCTA() {
  const total = $("#stickyTotal");
  if (!total) return;
  total.classList.remove("is-bumping");
  void total.offsetWidth;
  total.classList.add("is-bumping");
  setTimeout(() => total.classList.remove("is-bumping"), 600);
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  loadCart();
  await loadDispo();
  renderMenu();
  renderCart();
  initCompose();
  initDesserts();
  initCreneaux();
  initFilters();
  initForm();
  initBurger();
  initCountUp();
  initHeaderShrink();

  $("#year").textContent = new Date().getFullYear();

  $$(".delivery__steps, .menu__head, .compose__head, .order__head, .builder").forEach(el => {
    el.classList.add("reveal");
  });
  observeReveal();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
