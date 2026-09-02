/* ============================================
   BOGUSTO — Salse fatte bene · Bordeaux Ginko
   Cart + Menu + Form
   ============================================ */

/* ---------- CARTE BOGUSTO — "Plat à composer 10€" ----------
   Toute la carte se modifie ici : bases, garnitures, suppléments,
   desserts et boisson. Le reste du site s'adapte automatiquement. */

const PLAT_PRICE    = 10;  // plat à composer : 1 base + 1 garniture
const SALADE_PRICE  = 10;  // salade burrata
const TIRAMISU_PRICE = 5;  // tiramisu (parfum au choix)
const CANETTE_PRICE = 2;   // canette, à part

/* 1 — LES BASES (une seule au choix) */
const BASES = [
  { val: "Crème de champignons", label: "Crème de champignons",         extra: 0 },
  { val: "Base crème classique", label: "Base crème classique",         extra: 0 },
  { val: "Base tomate",          label: "Base tomate",                  extra: 0 },
  { val: "La Spéciale",          label: "La Spéciale · crème + tomate", extra: 0 },
  { val: "Crème de truffe",      label: "Crème de truffe",              extra: 4 },
  { val: "L'Italiana",           label: "L'Italiana",                   extra: 0 },
];

/* 2 — LES GARNITURES
   first = supplément sur la garniture comprise dans le plat
   extra = prix d'une garniture supplémentaire */
const GARNITURES = [
  { val: "Saumon fumé",         label: "Saumon fumé",         first: 1, extra: 3 },
  { val: "Poulet",              label: "Poulet",              first: 0, extra: 2 },
  { val: "Légumes",             label: "Légumes",             first: 0, extra: 2 },
  { val: "Viande hachée",       label: "Viande hachée",       first: 0, extra: 2 },
  { val: "Lardons de volaille", label: "Lardons de volaille", first: 0, extra: 2 },
  { val: "Bœuf effiloché",      label: "Bœuf effiloché",      first: 1, extra: 3 },
  { val: "Magret",              label: "Magret",              first: 3, extra: 3 },
];

/* 3 — LES SUPPLÉMENTS */
const SUPPLEMENTS = [
  { val: "Burrata 50g",  label: "Burrata 50g",  extra: 3 },
  { val: "Burrata 100g", label: "Burrata 100g", extra: 5 },
];

/* 5 — LES PARFUMS DE TIRAMISU */
const TIRAMISU_PARFUMS = ["M&M's", "Spéculos", "Oreo", "Classique cacao"];

/* ---------- CARDS DE LA SECTION CARTE ---------- */
const MENU = [
  { id: "compose",  cat: "plat",    tag: "À composer", tagStyle: "hot",    name: "Plat à composer",
    desc: "Ta base, ta garniture, tes suppléments. Six bases maison, sept garnitures — tu composes, on cuisine.",
    price: PLAT_PRICE, customizable: true, popular: true },

  { id: "salade",   cat: "plat",    tag: "Fraîche",    tagStyle: "green",  name: "Salade Burrata",
    desc: "Burrata crémeuse, roquette, tomates cerises, copeaux de parmesan, crème de balsamique. Fraîche, généreuse, italienne.",
    price: SALADE_PRICE },

  { id: "tiramisu", cat: "dessert", tag: "Maison",     tagStyle: "maison", name: "Tiramisu",
    desc: "Préparé sur place, parfum au choix : M&M's, Spéculos, Oreo ou classique cacao.",
    price: TIRAMISU_PRICE },

  { id: "canette",  cat: "boisson", tag: "33cl",       tagStyle: "yellow", name: "Canette",
    desc: "Bien fraîche, servie à part.",
    price: CANETTE_PRICE },
];

/* ---------- RENDU DES CHIPS (base / garniture / suppléments) ---------- */
const priceTag = (n) => (n > 0 ? ` <em>+${n}€</em>` : "");

function chipList(items, priceKey) {
  return items.map(i => {
    const ex = i[priceKey] || 0;
    return `<button class="chip" data-value="${i.val}" data-val="${i.val}" data-extra="${ex}">${i.label}${priceTag(ex)}</button>`;
  }).join("");
}

/* ---------- CATEGORY ICONS (SVG) ---------- */
const CAT_ICON = {
  plat:        '<svg viewBox="0 0 32 32" fill="currentColor"><ellipse cx="16" cy="20" rx="13" ry="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 18 Q16 14 27 18" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 15 Q12 11 14 15 M16 14 Q18 10 20 14 M22 15 Q24 11 26 15" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
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
    const card = document.createElement("article");
    card.className = "product reveal";
    card.dataset.cat = prod.cat;

    const priceHtml = `<div class="product__price">${eur(prod.price)}${prod.customizable ? '<small>personnalisable</small>' : ''}</div>`;
    const tagClass = `product__tag product__tag--${prod.tagStyle || 'yellow'}`;
    const picto = CAT_ICON[prod.cat] || '';

    card.innerHTML = `
      <div class="product__head">
        <div class="product__picto" aria-hidden="true">${picto}</div>
        <span class="${tagClass}">${prod.tag}</span>
      </div>
      <h3 class="product__name">${prod.name}</h3>
      <p class="product__desc">${prod.desc}</p>
      <div class="product__footer">
        ${priceHtml}
        <button class="product__add" data-id="${prod.id}">Ajouter</button>
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

  // Plat à composer → builder (base + garniture + garnitures en + + suppléments)
  if (prod.id === "compose") {
    openModal(composeModal(prod));
    return;
  }

  // Tiramisu → choix du parfum
  if (prod.id === "tiramisu") {
    openModal(tiramisuModal(prod));
    return;
  }

  // Salade burrata, canette → ajout direct
  addToCart({
    productId: prod.id,
    name: prod.name,
    meta: "",
    qty: 1,
    unitPrice: prod.price,
  });

  // Canette proposée après un plat (elle est à part)
  if (prod.cat === "plat") {
    setTimeout(() => openModal(drinkPopupModal(prod.name)), 250);
  }
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

function composeModal(prod) {
  return `
    <h3>${prod.name} — ${eur(PLAT_PRICE)}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>1. Ta base</h5>
      <div class="chips chips--wrap" id="mBase">${chipList(BASES, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>2. Ta garniture <small style="font-weight:400;color:var(--c-grey);">comprise</small></h5>
      <div class="chips chips--wrap" id="mGarniture">${chipList(GARNITURES, "first")}</div>
    </div>

    <div class="modal__field">
      <h5>3. Garniture en + <small style="font-weight:400;color:var(--c-grey);">facultatif</small></h5>
      <div class="chips chips--wrap" id="mGarnitureExtra">${chipList(GARNITURES, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>4. Suppléments <small style="font-weight:400;color:var(--c-grey);">facultatif</small></h5>
      <div class="chips chips--wrap" id="mSupp">${chipList(SUPPLEMENTS, "extra")}</div>
    </div>

    <div class="modal__field">
      <h5>5. Une précision ?</h5>
      <textarea class="textarea" id="mNote" placeholder="Allergies, sans tel ingrédient..."></textarea>
    </div>

    <button class="btn btn--primary btn--full" id="confirmCompose">Ajouter — ${eur(PLAT_PRICE)}</button>
    <p style="font-size:0.78rem;color:var(--c-grey);font-style:italic;margin-top:10px;text-align:center;">La canette est à part : ${eur(CANETTE_PRICE)} 🥤</p>
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

/* ---------- POPUP CANETTE (proposée après un plat) ---------- */
function drinkPopupModal(forProduct) {
  return `
    <h3>Et avec ça, une canette ?</h3>
    <p class="modal__desc">Ton plat <strong>${forProduct}</strong> est dans le panier. La canette est servie à part : ${eur(CANETTE_PRICE)}.</p>

    <button class="btn btn--primary btn--full" id="confirmDrinkPopup">Ajouter une canette — ${eur(CANETTE_PRICE)}</button>
    <button class="btn btn--ghost btn--full" id="skipDrinkPopup" style="margin-top:10px;">Continuer sans boisson</button>
  `;
}

/* ---------- PRIX DU PLAT DANS LA MODALE ---------- */
const chipExtra = (el) => parseFloat(el.dataset.extra || 0);
const chipLabel = (el) => {
  const ex = chipExtra(el);
  return ex > 0 ? `${el.dataset.val} (+${ex}€)` : el.dataset.val;
};

function modalPlatPrice() {
  let total = PLAT_PRICE;
  $$("#mBase .chip.is-active, #mGarniture .chip.is-active, #mGarnitureExtra .chip.is-active, #mSupp .chip.is-active")
    .forEach(c => { total += chipExtra(c); });
  return total;
}
function refreshModalPrice() {
  const btn = $("#confirmCompose");
  if (btn) btn.textContent = `Ajouter — ${eur(modalPlatPrice())}`;
}

/* ---------- MODAL BEHAVIOR ---------- */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal();

  // Choix unique
  ["#mBase", "#mGarniture", "#mTiramisu"].forEach(id => {
    if (e.target.matches(`${id} .chip`)) {
      $$(`${id} .chip`).forEach(c => c.classList.remove("is-active"));
      e.target.classList.add("is-active");
    }
  });

  // Choix multiples : garnitures en + et suppléments
  if (e.target.matches("#mGarnitureExtra .chip") || e.target.matches("#mSupp .chip")) {
    e.target.classList.toggle("is-active");
  }

  if (e.target.matches(".modal .chip")) refreshModalPrice();

  // CONFIRM PLAT À COMPOSER
  if (e.target.id === "confirmCompose") {
    const base = $("#mBase .chip.is-active");
    const garniture = $("#mGarniture .chip.is-active");
    if (!base) { alert("Choisis ta base."); return; }
    if (!garniture) { alert("Choisis ta garniture."); return; }

    const extras = $$("#mGarnitureExtra .chip.is-active");
    const supps  = $$("#mSupp .chip.is-active");
    const note   = $("#mNote")?.value.trim();

    const metaParts = [chipLabel(base), chipLabel(garniture)];
    if (extras.length) metaParts.push(`En + : ${extras.map(chipLabel).join(", ")}`);
    if (supps.length)  metaParts.push(`Sup. : ${supps.map(chipLabel).join(", ")}`);
    if (note) metaParts.push(note);

    const platName = `Plat Bogusto — ${base.dataset.val}`;

    addToCart({
      productId: "compose",
      name: platName,
      meta: metaParts.join(" · "),
      qty: 1,
      unitPrice: modalPlatPrice(),
    });
    closeModal();
    setTimeout(() => openModal(drinkPopupModal(platName)), 250);
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

  // CONFIRM CANETTE (popup après un plat)
  if (e.target.id === "confirmDrinkPopup") {
    addToCart({
      productId: "canette",
      name: "Canette",
      meta: "Avec un plat",
      qty: 1,
      unitPrice: CANETTE_PRICE,
    });
    closeModal();
  }
  if (e.target.id === "skipDrinkPopup") {
    closeModal();
  }
});

/* ---------- COMPOSE TON PLAT (section builder) ---------- */
function initCompose() {
  const elBase   = $("#composeBase");
  const elGarn   = $("#composeGarniture");
  const elExtras = $("#composeGarnitureExtra");
  const elSupp   = $("#composeSupp");
  if (!elBase || !elGarn || !elExtras || !elSupp) return;

  elBase.innerHTML   = chipList(BASES, "extra");
  elGarn.innerHTML   = chipList(GARNITURES, "first");
  elExtras.innerHTML = chipList(GARNITURES, "extra");
  elSupp.innerHTML   = chipList(SUPPLEMENTS, "extra");

  let selectedBase = null;       // { val, extra }
  let selectedGarniture = null;  // { val, extra }
  const selectedExtras = new Map();  // val → prix
  const selectedSupp   = new Map();  // val → prix

  const sumMap = (m) => Array.from(m.values()).reduce((s, v) => s + v, 0);
  const labelMap = (m) => Array.from(m.entries()).map(([v, p]) => (p > 0 ? `${v} (+${p}€)` : v));
  const labelOne = (sel) => (sel && sel.extra > 0 ? `${sel.val} (+${sel.extra}€)` : (sel ? sel.val : ""));

  function currentPrice() {
    return PLAT_PRICE
      + (selectedBase ? selectedBase.extra : 0)
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

  // Choix unique
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

  // Choix multiples
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

  pickSingle("#composeBase", (sel) => { selectedBase = sel; });
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
    if (!selectedBase) { alert("Choisis ta base."); return; }
    if (!selectedGarniture) { alert("Choisis ta garniture."); return; }

    const price = currentPrice();
    const platName = `Plat Bogusto — ${selectedBase.val}`;

    const parts = [labelOne(selectedBase), labelOne(selectedGarniture)];
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
    selectedBase = null;
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

    // Canette proposée juste après (elle est à part)
    setTimeout(() => openModal(drinkPopupModal(platName)), 250);
  });

  updateLivePrice();
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

/* ---------- FORM SUBMIT ---------- */
function initForm() {
  const form = $("#orderForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (CART.length === 0) {
      alert("Ton panier est vide. Ajoute au moins un plat.");
      return;
    }

    const lines = CART.map(it => {
      const subtotal = eur(it.unitPrice * (it.qty || 1));
      const meta = it.meta ? ` (${it.meta})` : "";
      return `${it.qty || 1}x ${it.name}${meta} — ${subtotal}`;
    }).join("\n");

    const total = eur(cartTotal());
    const summary = `${lines}\n\n— TOTAL ESTIMATIF : ${total}`;

    $("#commandeResume").value = summary;
    $("#totalEstimatif").value = total;

    const submitBtn = $("#submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    try {
      const data = new FormData(form);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (json.success) {
        form.querySelectorAll("input, select, textarea, button").forEach(el => el.style.display = "none");
        $("#orderSuccess").hidden = false;
        $("#orderSuccess").style.display = "block";
        CART = [];
        saveCart();
        renderCart();
        window.scrollTo({ top: $("#commander").offsetTop - 80, behavior: "smooth" });
      } else {
        throw new Error(json.message || "Erreur d'envoi");
      }
    } catch (err) {
      alert("Une erreur est survenue lors de l'envoi. Vérifie que la clé Web3Forms est bien configurée dans le code.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer ma commande";
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
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  renderMenu();
  renderCart();
  initCompose();
  initFilters();
  initForm();
  initBurger();
  initCountUp();
  initHeaderShrink();

  $("#year").textContent = new Date().getFullYear();

  $$(".story-card, .delivery__steps, .menu__head, .compose__head, .order__head, .builder").forEach(el => {
    el.classList.add("reveal");
  });
  observeReveal();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
