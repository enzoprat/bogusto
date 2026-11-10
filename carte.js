/* ============================================
   BOGUSTO — LA CARTE
   Source de vérité unique, partagée par le site (script.js)
   et par le dash de gestion des stocks (/dash).
   Les `id` servent de clés pour les ruptures : ne pas les renommer.
   ============================================ */

/* ---------- CARTE BOGUSTO — 2 menus ----------
   1) MENU PÂTES FRAÎCHES — plat à composer 10€ (sauce + garniture)
   2) MENU VIANDE — 15€ / 20€ (viande + accompagnement + sauce)
   Toute la carte se modifie ici ; le reste du site s'adapte tout seul. */

const PLAT_PRICE     = 10;   // plat à composer (pâtes fraîches)
const TIRAMISU_PRICE = 5;    // tiramisu, parfum au choix
const CANETTE_PRICE  = 2;    // canette, à part
const SAUCE_SUP_PRICE = 0.5; // supplément sauce (menu viande)

/* ===== MENU PÂTES FRAÎCHES ===== */

/* 1 — LES SAUCES (une seule au choix) */
const SAUCES = [
  { id: "sauce-champignons", val: "Crème de champignons", label: "Crème de champignons",         extra: 0 },
  { id: "sauce-creme",       val: "Base crème classique", label: "Base crème classique",         extra: 0 },
  { id: "sauce-tomate",      val: "Base tomate",          label: "Base tomate",                  extra: 0 },
  { id: "sauce-speciale",    val: "La Spéciale",          label: "La Spéciale · crème + tomate", extra: 0 },
  { id: "sauce-truffe",      val: "Crème de truffe",      label: "Crème de truffe",              extra: 4 },
  { id: "sauce-italiana",    val: "L'Italiana",           label: "L'Italiana",                   extra: 0 },
];

/* 2 — LES GARNITURES
   first = supplément sur la garniture comprise dans le plat
   extra = prix d'une garniture supplémentaire */
const GARNITURES = [
  { id: "garn-saumon",     val: "Saumon fumé",         label: "Saumon fumé",         first: 1, extra: 3 },
  { id: "garn-poulet",     val: "Poulet",              label: "Poulet",              first: 0, extra: 2 },
  { id: "garn-poulet-eff", val: "Poulet effiloché",    label: "Poulet effiloché",    first: 0, extra: 2 },
  { id: "garn-legumes",    val: "Légumes",             label: "Légumes",             first: 0, extra: 2 },
  { id: "garn-kebab",      val: "Kebab",               label: "Kebab",               first: 1, extra: 2 },
  { id: "garn-hachee",     val: "Viande hachée",       label: "Viande hachée",       first: 0, extra: 2 },
  { id: "garn-lardons",    val: "Lardons de volaille", label: "Lardons de volaille", first: 0, extra: 2 },
  { id: "garn-boeuf-eff",  val: "Bœuf effiloché",      label: "Bœuf effiloché",      first: 1, extra: 3 },
];

/* 3 — LES SUPPLÉMENTS */
const SUPPLEMENTS = [
  { id: "supp-burrata-50",  val: "Burrata 50g",  label: "Burrata 50g",  extra: 3 },
  { id: "supp-burrata-100", val: "Burrata 100g", label: "Burrata 100g", extra: 5 },
];

/* ===== MENU VIANDE ===== */

/* Les viandes (chaque plat = viande + 1 accompagnement + 1 sauce) */
const VIANDES = [
  { id: "ailes",       name: "Ailes de poulet x4",      desc: "",                       price: 15 },
  { id: "brochettes",  name: "Brochettes de poulet x3", desc: "",                       price: 15 },
  { id: "magret",      name: "Magret entier",           desc: "",                       price: 20 },
  { id: "faux-filet",  name: "Faux-filet",              desc: "",                       price: 20 },
  { id: "gigot",       name: "Gigot d'agneau",          desc: "",                       price: 20 },
  { id: "assiette",    name: "Assiette Bog",            desc: "brochettes x2 + 2 ailes", price: 20 },
];

/* Un accompagnement au choix */
const ACCOMPAGNEMENTS = [
  { val: "Riz sauce yassa",     label: "Riz sauce yassa",     extra: 0 },
  { val: "Riz sauce mafé",      label: "Riz sauce mafé",      extra: 0 },
  { val: "Riz haricots rouges", label: "Riz haricots rouges", extra: 0 },
  { val: "Pâtes fraîches",      label: "Pâtes fraîches · sauce au choix", extra: 0, needsSauce: true },
];

/* Une sauce au choix (supplément sauce : +0,50€) */
const SAUCES_VIANDE = [
  { val: "Sauce verte", label: "Sauce verte", extra: 0 },
  { val: "Poivre",      label: "Poivre",      extra: 0 },
];

/* Suppléments du menu viande */
const SUPPLEMENTS_VIANDE = [
  { val: "Brochettes x2", label: "Brochettes x2", extra: 5 },
];

/* ===== DESSERTS ===== */
const TIRAMISU_PARFUMS = ["M&M's", "Spéculos", "Oreo", "Classique cacao"];

/* ---------- CARDS DE LA SECTION CARTE ---------- */
const MENU = [
  { id: "compose",  cat: "pates",   tag: "À composer", tagStyle: "hot",    name: "Plat à composer",
    desc: "Pâtes fraîches : ta sauce, ta garniture, tes suppléments. Six sauces maison, huit garnitures.",
    price: PLAT_PRICE, customizable: true, popular: true },

  ...VIANDES.map(v => ({
    id: "viande-" + v.id,
    cat: "viande",
    tag: v.price === 15 ? "Poulet" : "Signature",
    tagStyle: v.price === 15 ? "green" : "maison",
    name: v.name,
    desc: (v.desc ? v.desc.charAt(0).toUpperCase() + v.desc.slice(1) + ". " : "") +
          "Servi avec un accompagnement et une sauce au choix.",
    price: v.price,
    customizable: true,
    viandeId: v.id,
  })),

  { id: "tiramisu", cat: "dessert", tag: "Maison",     tagStyle: "maison", name: "Tiramisu",
    desc: "Préparé sur place, parfum au choix : M&M's, Spéculos, Oreo ou classique cacao.",
    price: TIRAMISU_PRICE },

  { id: "canette",  cat: "boisson", tag: "33cl",       tagStyle: "yellow", name: "Canette",
    desc: "Bien fraîche, servie à part.",
    price: CANETTE_PRICE },
];
