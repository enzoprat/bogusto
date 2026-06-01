/* ============================================
   BOGUSTO — Salse fatte bene · Bordeaux Ginko
   Cart + Menu + Form
   ============================================ */

/* ---------- MENU DATA ---------- */
const MENU = [
  // --- PLATS — 10€ (boisson à part) ---
  { id: "funghetto",   cat: "plat", tag: "Champignons",  tagStyle: "green",  name: "Poulet Funghetto",  desc: "Champignons poêlés, oignons, poulet sauté.", price: 10, customizable: true },
  { id: "cremoso",     cat: "plat", tag: "Crémeux",      tagStyle: "yellow", name: "Cremoso Pollo",     desc: "Crème, poulet grillé. Simple, onctueux, efficace !", price: 10, customizable: true },
  { id: "ladonna",     cat: "plat", tag: "Signature",    tagStyle: "hot",    name: "Ladonna",           desc: "Lardons fumés, crème onctueuse, ail, poivre noir. La version Bogusto, généreuse et gourmande.", price: 10, customizable: true, popular: true },
  { id: "salmone",     cat: "plat", tag: "Raffiné",      tagStyle: "maison", name: "Salmone Cremoso",   desc: "Épices italiennes, crème, saumon émietté, tomates. Raffiné et puissant.", price: 10, customizable: true },
  { id: "fuego",       cat: "plat", tag: "Épicé 🌶️",     tagStyle: "hot",    name: "Salsa Fuego",       desc: "Sauce tomate, paprika, saucisses grillées. Relevé et puissant.", price: 10, customizable: true },
  { id: "moment",      cat: "plat", tag: "Nouveau ✨",   tagStyle: "hot",    name: "Sauce du moment",   desc: "La création éphémère du chef. À demander sur place ou découvrir à la livraison.", price: 10, customizable: true },

  // --- SALADE BURRATA 250g ---
  { id: "burrata250",  cat: "plat", tag: "Frais",       tagStyle: "green",  name: "Burrata 250g + Salade", desc: "Burrata 250g, tomates cerises, salade, parmesan, vinaigrette maison.", price: 10 },

  // --- MENU ENFANT –12 ans ---
  { id: "enfant",      cat: "enfant",  tag: "–12 ans",   tagStyle: "yellow", name: "Menu Enfant",       desc: "Base + sauce + boisson enfant (Caprisun ou eau). Portion enfant, à prix doux.", price: 5 },

  // --- DESSERTS ---
  { id: "tiramisu",    cat: "dessert", tag: "Maison",    tagStyle: "maison", name: "Tiramisu maison",   desc: "Tiramisu préparé sur place, à l'italienne.", price: 5 },

  // --- BOISSONS ---
  { id: "canette",     cat: "boisson", tag: "Canette",   tagStyle: "yellow", name: "Canette",           desc: "Coca, Coca Zero, Fanta, Sprite ou Oasis. 33cl bien fraîche.", price: 2 },
  { id: "eau",         cat: "boisson", tag: "Eau",       tagStyle: "yellow", name: "Eau",               desc: "Plate ou pétillante.", price: 1 },
  { id: "bissap",      cat: "boisson", tag: "Maison 🌺",  tagStyle: "maison", name: "Bissap",            desc: "Infusion d'hibiscus, fraîcheur florale. Maison.", price: 4 },
  { id: "gingembre",   cat: "boisson", tag: "Maison 🫚",  tagStyle: "maison", name: "Gingembre",         desc: "Infusion gingembre, tonique et désaltérante. Maison.", price: 4 },
];

/* ---------- DRINK POPUP ----------
   Depuis avril 2026 : plat 10€ HORS boisson.
   Ajout d'un plat → popup boisson obligatoire (Caprisun uniquement menu enfant). */
const DRINK_OPTIONS = [
  { val: "Canette",         label: "Canette",         price: 2 },
  { val: "Eau plate",       label: "Eau plate",       price: 1 },
  { val: "Eau pétillante",  label: "Eau pétillante",  price: 1 },
  { val: "Bissap maison",   label: "Bissap 🌺",       price: 4 },
  { val: "Gingembre maison",label: "Gingembre 🫚",    price: 4 },
];
const KID_DRINK_OPTIONS = [
  { val: "Caprisun",        label: "Caprisun 🧃",     price: 1.5 },
  { val: "Eau plate",       label: "Eau plate",       price: 1 },
  { val: "Eau pétillante",  label: "Eau pétillante",  price: 1 },
];

/* ---------- CATEGORY ICONS (SVG) ---------- */
const CAT_ICON = {
  plat:        '<svg viewBox="0 0 32 32" fill="currentColor"><ellipse cx="16" cy="20" rx="13" ry="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 18 Q16 14 27 18" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 15 Q12 11 14 15 M16 14 Q18 10 20 14 M22 15 Q24 11 26 15" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
  enfant:      '<svg viewBox="0 0 32 32" fill="currentColor"><circle cx="16" cy="11" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 26 Q9 18 16 18 Q23 18 23 26" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="14" cy="11" r="1"/><circle cx="18" cy="11" r="1"/></svg>',
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

  // Plat Bogusto personnalisable → builder modal (base + boisson + fromage + topping)
  if (prod.customizable) {
    openModal(bogustoModal(prod));
    return;
  }

  // Menu enfant → base + sauce + boisson
  if (prod.id === "enfant") {
    openModal(enfantModal(prod));
    return;
  }

  // Canette → choix de la saveur
  if (prod.id === "canette") {
    openModal(canetteModal(prod));
    return;
  }

  // Eau → plate ou pétillante
  if (prod.id === "eau") {
    openModal(waterModal(prod));
    return;
  }

  // Simple add (tiramisu)
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

function bogustoModal(prod) {
  return `
    <h3>${prod.name}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>1. Ta base</h5>
      <div class="chips" id="mBase">
        <button class="chip" data-val="Pâtes">Pâtes</button>
        <button class="chip" data-val="Riz Jasmin">Riz</button>
      </div>
    </div>

    <div class="modal__field">
      <h5>2. Suppléments <small style="font-weight:400;color:var(--c-grey);">facultatif</small></h5>
      <div class="chips chips--wrap" id="mTopping">
        <button class="chip" data-val="Burrata 100g" data-extra="3">Burrata 100g (+3€)</button>
        <button class="chip" data-val="Noix à la truffe" data-extra="5">Noix à la truffe (+5€)</button>
        <button class="chip" data-val="Oignons frits" data-extra="0">Oignons frits (offert)</button>
        <button class="chip" data-val="Piment" data-extra="0">Piment (offert)</button>
      </div>
    </div>

    <div class="modal__field">
      <h5>3. Une précision ?</h5>
      <textarea class="textarea" id="mNote" placeholder="Allergies, sans tel ingrédient..."></textarea>
    </div>

    <button class="btn btn--primary btn--full" id="confirmBogusto" data-base="${prod.price}" data-name="${prod.name}">Ajouter — ${eur(prod.price)}</button>
    <p style="font-size:0.78rem;color:var(--c-grey);font-style:italic;margin-top:10px;text-align:center;">À l'étape suivante, choisis ta boisson 🍷</p>
  `;
}

function enfantModal(prod) {
  const sauces = MENU.filter(m => m.cat === "plat" && m.customizable).map(p => `<button class="chip" data-val="${p.name}">${p.name}</button>`).join("");
  return `
    <h3>${prod.name}</h3>
    <p class="modal__desc">${prod.desc}</p>

    <div class="modal__field">
      <h5>1. Ta base</h5>
      <div class="chips" id="mBase">
        <button class="chip" data-val="Pâtes">Pâtes</button>
        <button class="chip" data-val="Riz Jasmin">Riz</button>
      </div>
    </div>

    <div class="modal__field">
      <h5>2. Ta sauce</h5>
      <div class="chips chips--wrap" id="mSauceEnfant">${sauces}</div>
    </div>

    <div class="modal__field">
      <h5>3. Ta boisson <small style="font-weight:400;color:var(--c-grey);">spécial enfant</small></h5>
      <div class="chips chips--wrap" id="mDrink">
        ${KID_DRINK_OPTIONS.map(d => `<button class="chip" data-val="${d.val}">${d.label}</button>`).join("")}
      </div>
    </div>

    <button class="btn btn--primary btn--full" id="confirmEnfant" data-base="${prod.price}">Ajouter — ${eur(prod.price)}</button>
  `;
}

/* ---------- DRINK POPUP (obligatoire après ajout plat) ---------- */
function drinkPopupModal(forProduct) {
  return `
    <h3>Et avec ça, une boisson ?</h3>
    <p class="modal__desc">Ton plat <strong>${forProduct}</strong> est presque dans le panier. Choisis ta boisson pour finaliser.</p>

    <div class="modal__field">
      <h5>Choisis ta boisson</h5>
      <div class="chips chips--wrap" id="mDrinkPopup">
        ${DRINK_OPTIONS.map(d => `<button class="chip" data-val="${d.val}" data-price="${d.price}">${d.label} · ${eur(d.price)}</button>`).join("")}
      </div>
    </div>

    <button class="btn btn--primary btn--full" id="confirmDrinkPopup">Ajouter la boisson au panier</button>
    <button class="btn btn--ghost btn--full" id="skipDrinkPopup" style="margin-top:10px;">Continuer sans boisson</button>
  `;
}

function canetteModal(prod) {
  return `
    <h3>${prod.name}</h3>
    <p class="modal__desc">${prod.desc}</p>
    <div class="modal__field">
      <h5>Choisis ta saveur</h5>
      <div class="chips chips--wrap" id="mCan">
        <button class="chip" data-val="Coca-Cola">Coca-Cola</button>
        <button class="chip" data-val="Coca Zero">Coca Zero</button>
        <button class="chip" data-val="Fanta Orange">Fanta</button>
        <button class="chip" data-val="Sprite">Sprite</button>
        <button class="chip" data-val="Oasis Tropical">Oasis</button>
      </div>
    </div>
    <button class="btn btn--primary btn--full" id="confirmCanette" data-base="${prod.price}">Ajouter — ${eur(prod.price)}</button>
  `;
}

function waterModal(prod) {
  return `
    <h3>${prod.name}</h3>
    <p class="modal__desc">${prod.desc}</p>
    <div class="modal__field">
      <h5>Plate ou pétillante ?</h5>
      <div class="chips" id="mWater">
        <button class="chip" data-val="Plate">Plate</button>
        <button class="chip" data-val="Pétillante">Pétillante</button>
      </div>
    </div>
    <button class="btn btn--primary btn--full" id="confirmWater" data-base="${prod.price}">Ajouter — ${eur(prod.price)}</button>
  `;
}

/* ---------- MODAL BEHAVIOR ---------- */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal();

  // Single-select chips (Bogusto)
  ["#mBase", "#mDrink", "#mWater", "#mCan", "#mSauceEnfant", "#mDrinkPopup"].forEach(id => {
    if (e.target.matches(`${id} .chip`)) {
      $$(`${id} .chip`).forEach(c => c.classList.remove("is-active"));
      e.target.classList.add("is-active");
    }
  });

  // Multi-select pour suppléments/toppings
  if (e.target.matches("#mTopping .chip")) {
    e.target.classList.toggle("is-active");
  }

  // CONFIRM BOGUSTO (plat customizable : base + suppléments + note → popup boisson)
  if (e.target.id === "confirmBogusto") {
    const basePrice = parseFloat(e.target.dataset.base);
    const name = e.target.dataset.name || $("#modalContent h3").textContent;
    const base = $("#mBase .chip.is-active")?.dataset.val;
    const toppingEls = $$("#mTopping .chip.is-active");
    const note = $("#mNote")?.value.trim();

    if (!base) { alert("Choisis ta base (Pâtes ou Riz)."); return; }

    let extra = 0;
    let toppingsPaid = [];
    let toppingsFree = [];
    toppingEls.forEach(el => {
      const v = el.dataset.val;
      const ex = parseFloat(el.dataset.extra || 0);
      extra += ex;
      if (ex > 0) toppingsPaid.push(`${v} (+${ex}€)`);
      else toppingsFree.push(v);
    });

    let metaParts = [base];
    if (toppingsPaid.length) metaParts.push(`Sup. : ${toppingsPaid.join(", ")}`);
    if (toppingsFree.length) metaParts.push(`Toppings : ${toppingsFree.join(", ")}`);
    if (note) metaParts.push(note);

    addToCart({
      productId: name,
      name: name,
      meta: metaParts.join(" · "),
      qty: 1,
      unitPrice: basePrice + extra,
    });
    closeModal();
    // Popup boisson obligatoire ensuite
    setTimeout(() => openModal(drinkPopupModal(name)), 250);
  }

  // CONFIRM ENFANT (boisson incluse Caprisun/eau, pas de popup)
  if (e.target.id === "confirmEnfant") {
    const base = $("#mBase .chip.is-active")?.dataset.val;
    const sauce = $("#mSauceEnfant .chip.is-active")?.dataset.val;
    const drink = $("#mDrink .chip.is-active")?.dataset.val;
    if (!base) { alert("Choisis la base."); return; }
    if (!sauce) { alert("Choisis la sauce."); return; }
    if (!drink) { alert("Choisis la boisson."); return; }
    addToCart({
      productId: "enfant",
      name: "Menu Enfant",
      meta: `${base} · ${sauce} · Boisson : ${drink}`,
      qty: 1,
      unitPrice: parseFloat(e.target.dataset.base),
    });
    closeModal();
  }

  // CONFIRM DRINK POPUP (après ajout plat adulte)
  if (e.target.id === "confirmDrinkPopup") {
    const sel = $("#mDrinkPopup .chip.is-active");
    if (!sel) { alert("Choisis une boisson, ou clique sur 'Continuer sans boisson'."); return; }
    addToCart({
      productId: "drink-" + sel.dataset.val,
      name: sel.dataset.val,
      meta: "Avec un plat",
      qty: 1,
      unitPrice: parseFloat(sel.dataset.price),
    });
    closeModal();
  }
  if (e.target.id === "skipDrinkPopup") {
    closeModal();
  }

  // CONFIRM CANETTE
  if (e.target.id === "confirmCanette") {
    const sel = $("#mCan .chip.is-active");
    if (!sel) { alert("Choisis ta saveur."); return; }
    addToCart({
      productId: "canette",
      name: `Canette ${sel.dataset.val}`,
      meta: "",
      qty: 1,
      unitPrice: parseFloat(e.target.dataset.base),
    });
    closeModal();
  }

  // CONFIRM WATER
  if (e.target.id === "confirmWater") {
    const sel = $("#mWater .chip.is-active");
    if (!sel) { alert("Choisis plate ou pétillante."); return; }
    addToCart({
      productId: "eau",
      name: "Eau",
      meta: sel.dataset.val,
      qty: 1,
      unitPrice: parseFloat(e.target.dataset.base),
    });
    closeModal();
  }
});

/* ---------- COMPOSE TON PLAT (Bogusto) ---------- */
function initCompose() {
  let selectedBase = null;       // Pâtes ou Riz
  let selectedSauce = null;      // 6 sauces (Funghetto, Cremoso, Ladonna, Salmone, Fuego, Sauce du moment)
  const selectedTopping = new Map(); // val → extra€

  function getSuppExtra() {
    let total = 0;
    selectedTopping.forEach(v => { total += v; });
    return total;
  }

  function updateLivePrice() {
    const el = $("#composeLivePrice");
    if (el) el.textContent = eur(10 + getSuppExtra());
  }

  function updatePreview(containerId, text) {
    const p = document.querySelector(`[data-preview-for="${containerId.replace('#','')}"]`);
    if (p) {
      p.textContent = text;
      p.classList.add("acc__preview--filled");
    }
  }

  // Auto-open next accordion step
  function openNextStep(currentDetails) {
    const all = $$(".acc");
    const idx = all.indexOf(currentDetails);
    if (idx === -1 || idx === all.length - 1) return;
    // close current, open next (only if next is still on placeholder)
    setTimeout(() => {
      currentDetails.removeAttribute("open");
      // open next only if it's not yet filled
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

  // Helper to single-select
  function pickSingle(containerId, onPick, autoNext = true) {
    $$(`${containerId} .chip`).forEach(c => {
      c.addEventListener("click", () => {
        $$(`${containerId} .chip`).forEach(x => x.classList.remove("is-active"));
        c.classList.add("is-active");
        onPick(c);
        updatePreview(containerId, c.dataset.value);
        updateLivePrice();
        if (autoNext) openNextStep(getDetails(containerId));
      });
    });
  }

  pickSingle("#composeSize",  (c) => { selectedBase = c.dataset.value; });
  pickSingle("#composeBase",  (c) => { selectedSauce = c.dataset.value; });

  // Suppléments multi-select avec prix variables
  $$("#composeTopping .chip").forEach(c => {
    c.addEventListener("click", () => {
      const val = c.dataset.value;
      const extra = parseFloat(c.dataset.extra || 0);
      if (selectedTopping.has(val)) {
        selectedTopping.delete(val);
        c.classList.remove("is-active");
      } else {
        selectedTopping.set(val, extra);
        c.classList.add("is-active");
      }
      const labels = Array.from(selectedTopping.entries()).map(([v, p]) => p > 0 ? `${v} (+${p}€)` : v);
      updatePreview("#composeTopping", labels.length ? labels.join(", ") : "—");
      updateLivePrice();
    });
  });

  // Note preview
  const noteEl = $("#composeNote");
  if (noteEl) {
    noteEl.addEventListener("input", () => {
      const v = noteEl.value.trim();
      const p = $("#composeNotePreview");
      if (p) {
        p.textContent = v ? (v.length > 25 ? v.slice(0, 25) + "…" : v) : "Facultatif";
        p.classList.toggle("acc__preview--filled", !!v);
      }
    });
  }

  $("#composeAdd").addEventListener("click", () => {
    if (!selectedBase) { alert("Choisis ta base (Pâtes ou Riz)."); return; }
    if (!selectedSauce) { alert("Choisis ta sauce."); return; }

    const price = 10 + getSuppExtra();
    const platName = `Plat Bogusto — ${selectedSauce}`;

    let parts = [selectedBase, selectedSauce];
    const labels = Array.from(selectedTopping.entries()).map(([v, p]) => p > 0 ? `${v} (+${p}€)` : v);
    if (labels.length) parts.push(`Sup. : ${labels.join(", ")}`);
    const note = $("#composeNote").value.trim();
    if (note) parts.push(note);

    addToCart({
      productId: "compose-bogusto",
      name: platName,
      meta: parts.join(" · "),
      qty: 1,
      unitPrice: price,
    });

    // Reset
    $$("#composeSize .chip, #composeBase .chip, #composeTopping .chip").forEach(c => c.classList.remove("is-active"));
    selectedBase = null; selectedSauce = null;
    selectedTopping.clear();
    $("#composeNote").value = "";
    updateLivePrice();

    // Reset previews + close all accordions, reopen first
    $$(".acc__preview").forEach((p, i) => {
      p.classList.remove("acc__preview--filled");
      p.textContent = (i < 2) ? "Choisir" : (i === 2 ? "—" : "Facultatif");
    });
    $$(".acc").forEach((d, i) => {
      if (i === 0) d.setAttribute("open", "");
      else d.removeAttribute("open");
    });

    // Popup boisson obligatoire (séparée du plat)
    setTimeout(() => openModal(drinkPopupModal(platName)), 250);
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
