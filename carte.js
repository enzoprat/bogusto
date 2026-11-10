/* ============================================
   BOGUSTO — LA CARTE
   Source de vérité unique, partagée par le site (script.js)
   et par le dash de gestion des stocks (/dash).
   Les `id` servent de clés pour les ruptures : ne pas les renommer.
   ============================================ */

/* ---------- CARTE BOGUSTO — 2 menus ----------
   1) MENU PÂTES FRAÎCHES — plat à composer 10€ (sauce + garniture)
   2) MENU VIANDES — 15€ à 25€ (viande + pâtes fraîches fusili + sauce)
   Toute la carte se modifie ici ; le reste du site s'adapte tout seul. */

const PLAT_PRICE      = 10;   // plat à composer (pâtes fraîches)
const SALADE_PRICE    = 10;   // salade de burrata 100g
const TIRAMISU_PRICE  = 5;    // tiramisu, parfum au choix
const CANETTE_PRICE   = 2;    // canette, à part
const SAUCE_SUP_PRICE = 0.5;  // supplément sauce (menu viandes)

/* ===== MENU PÂTES FRAÎCHES ===== */

/* 1 — LES SAUCES (une seule au choix) */
const SAUCES = [
  { id: "sauce-champignons", val: "Crème de champignons", label: "Crème de champignons",         extra: 0 },
  { id: "sauce-creme",       val: "Base crème classique", label: "Base crème classique",         extra: 0 },
  { id: "sauce-tomate",      val: "Base tomate",          label: "Base tomate",                  extra: 0 },
  { id: "sauce-speciale",    val: "La Spéciale",          label: "La Spéciale · crème + tomate", extra: 0 },
  { id: "sauce-truffe",      val: "Crème de truffe",      label: "Crème de truffe",              extra: 4 },
  { id: "sauce-poivre",      val: "Sauce poivre",         label: "Sauce poivre",                 extra: 0 },
  { id: "sauce-fromagere",   val: "Sauce fromagère",      label: "Sauce fromagère",              extra: 2 },
];

/* 2 — LES GARNITURES
   first = supplément sur la garniture comprise dans le plat
   extra = prix d'une garniture supplémentaire */
const GARNITURES = [
  { id: "garn-saumon",     val: "Saumon fumé",        label: "Saumon fumé",        first: 1, extra: 3 },
  { id: "garn-poulet",     val: "Poulet",             label: "Poulet",             first: 0, extra: 2 },
  { id: "garn-poulet-eff", val: "Poulet effiloché",   label: "Poulet effiloché",   first: 0, extra: 2 },
  { id: "garn-merguez",    val: "Merguez",            label: "Merguez",            first: 0, extra: 2 },
  { id: "garn-kebab",      val: "Kebab",              label: "Kebab",              first: 0, extra: 2 },
  { id: "garn-hachee",     val: "Viande hachée",      label: "Viande hachée",      first: 0, extra: 2 },
  { id: "garn-jambon",     val: "Jambon blanc",       label: "Jambon blanc",       first: 0, extra: 2 },
  { id: "garn-lardons",    val: "Lardon de volaille", label: "Lardon de volaille", first: 0, extra: 2 },
  { id: "garn-boeuf-eff",  val: "Bœuf effiloché",     label: "Bœuf effiloché",     first: 1, extra: 3 },
];

/* 3 — LES SUPPLÉMENTS */
const SUPPLEMENTS = [
  { id: "supp-stracciatella", val: "Stracciatella", label: "Stracciatella", extra: 3 },
  { id: "supp-burrata-100",   val: "Burrata 100g",  label: "Burrata 100g",  extra: 5 },
  { id: "supp-xxl",           val: "Version XXL",   label: "Version XXL · portion généreuse", extra: 5 },
];

/* ===== MENU VIANDES ===== */

/* Les viandes — servies avec des pâtes fraîches fusili (sauce au choix)
   et une sauce d'accompagnement. */
const VIANDES = [
  { id: "entrecote", name: "Entrecôte Black Angus 300g",      desc: "",             price: 25 },
  { id: "poulet",    name: "Cuisse de poulet sans os",         desc: "",            price: 15 },
  { id: "magret",    name: "Magret entier",                   desc: "",             price: 20 },
  { id: "gigot",     name: "Gigot d'agneau",                  desc: "en tranches",  price: 20 },
];

/* L'accompagnement est unique : pâtes fraîches fusili, sauce au choix
   parmi les sauces du menu pâtes ci-dessus. */
const ACCOMPAGNEMENT = "Pâtes fraîches fusili";

/* Une sauce au choix (sauce en plus : +0,50€) */
const SAUCES_VIANDE = [
  { id: "sv-verte",  val: "Sauce verte", label: "Sauce verte", extra: 0 },
  { id: "sv-poivre", val: "Poivre",      label: "Poivre",      extra: 0 },
];

/* ===== DESSERTS ===== */
const TIRAMISU_PARFUMS = ["M&M's", "Spéculos", "Oreo", "Classique cacao"];

/* ---------- CARDS DE LA SECTION CARTE ---------- */
const MENU = [
  { id: "compose",  cat: "pates",   tag: "À composer", tagStyle: "hot",    name: "Plat à composer",
    desc: "Pâtes fraîches : ta sauce, ta garniture, tes suppléments. Sept sauces maison, neuf garnitures.",
    price: PLAT_PRICE, customizable: true, popular: true },

  ...VIANDES.map(v => ({
    id: "viande-" + v.id,
    cat: "viande",
    tag: v.price >= 25 ? "Black Angus" : (v.price === 15 ? "Poulet" : "Signature"),
    tagStyle: v.price >= 25 ? "hot" : (v.price === 15 ? "green" : "maison"),
    name: v.name,
    desc: (v.desc ? v.desc.charAt(0).toUpperCase() + v.desc.slice(1) + ". " : "") +
          "Servi avec des pâtes fraîches fusili, sauce au choix, et une sauce d'accompagnement.",
    price: v.price,
    customizable: true,
    viandeId: v.id,
  })),

  { id: "salade",   cat: "fraicheur", tag: "Fraîcheur", tagStyle: "green",  name: "Salade de Burrata 100g",
    desc: "Burrata crémeuse, roquette, tomates cerises, crème de balsamique. Fraîche et généreuse.",
    price: SALADE_PRICE },

  { id: "tiramisu", cat: "dessert", tag: "Maison",     tagStyle: "maison", name: "Tiramisu",
    desc: "Préparé sur place, parfum au choix : M&M's, Spéculos, Oreo ou classique cacao.",
    price: TIRAMISU_PRICE },

  { id: "canette",  cat: "boisson", tag: "33cl",       tagStyle: "yellow", name: "Canette",
    desc: "Bien fraîche, servie à part.",
    price: CANETTE_PRICE },
];
