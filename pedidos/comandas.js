/* ==========================================================================
   Comandas — Dulce Patata Food
   Herramienta offline de mostrador: misma carta y formato que la web de
   pedidos, pero funciona sin internet (todo el código y los datos están en
   este archivo, no depende de Firebase ni de ningún servidor) e imprime en
   una impresora térmica conectada por cable.
   ========================================================================== */

/* ── CARTA ── (mismos productos y precios que pedidos/src/carta.js) */
const MENU = [
  { id: 1, cat: "Patatas", name: "Patata Simple", desc: "Aceite de oliva o mantequilla (una u otra, no las dos), sal y pimienta", price: 3.00, components: ["Aceite de oliva", "Mantequilla", "sal", "pimienta"] },
  { id: 2, cat: "Patatas", name: "Patata Vegetal", desc: "Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural", price: 6.40 },
  { id: 3, cat: "Patatas", name: "Patata Picante", desc: "Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas", price: 6.40 },
  { id: 4, cat: "Patatas", name: "Patata Carbonara", desc: "Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario", price: 6.80 },
  { id: 5, cat: "Patatas", name: "Patata Boloñesa", desc: "Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario", price: 6.80 },
  { id: 6, cat: "Patatas", name: "Patata Hawaiana", desc: "Mayonesa, york, aceitunas, maíz, piña y queso mozzarella", price: 6.80 },
  { id: 7, cat: "Patatas", name: "Patata Kebab", desc: "Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla", price: 6.90 },
  { id: 8, cat: "Patatas", name: "Patata 4 Quesos", desc: "Salsa roquefort, emmental, gouda y mozzarella", price: 6.90 },
  { id: 9, cat: "Patatas", name: "Patata Completa", desc: "Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón", price: 7.20 },
  { id: 10, cat: "Patatas", name: "Patata Carnívora", desc: "Alioli, york, bacon, kebab y carne picada", price: 7.40 },
  { id: 11, cat: "Patatas", name: "Patata Philadelphia", desc: "Salsa philadelphia, york, huevo, pollo, queso mozzarella", price: 6.40 },
  { id: 12, cat: "Patatas", name: "Patata Ranchera", desc: "Salsa ranchera, pollo, bacon y queso mozzarella", price: 7.50 },
  { id: 13, cat: "Patatas", name: "Patata Granollers", desc: "Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria", price: 7.50 },
  { id: 14, cat: "Patatas", name: "Patata Pulled Pork", desc: "Salsa barbacoa, cebolla, carne pulled pork y mozzarella", price: 7.50, nuevo: true },
  { id: 50, cat: "Patatas", name: "Patata Cheddar-Bacon", desc: "Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado", price: 8.50, nuevo: true },
  { id: 15, cat: "Patatas", name: "Patata Al Gusto", desc: "1 salsa a elegir y 6 ingredientes", price: 7.90 },
  { id: 16, cat: "Patatas", name: "Patata Bomba", desc: "9 ingredientes y/o salsas al gusto ¡sin límite!", price: 9.40, nuevo: true },

  { id: 17, cat: "Boniato", name: "Boniato Fries", desc: "Tarrina de boniato fries", price: 4.50 },
  { id: 18, cat: "Boniato", name: "Boniato Lotus", desc: "Salsa Lotus + bacon + queso mozzarella + galletas Lotus", price: 5.50 },
  { id: 19, cat: "Boniato", name: "Boniato Bacon", desc: "Salsa a elegir + bacon + queso mozzarella", price: 5.50 },
  { id: 20, cat: "Boniato", name: "Boniato G.O.A.T.", desc: "Salsa miel mostaza + cebolla crujiente + queso de cabra", price: 5.50 },
  { id: 21, cat: "Boniato", name: "Boniato Pistacchio", desc: "Crema de pistacho + queso mozzarella + pistacho crujiente", price: 5.50, nuevo: true },
  { id: 51, cat: "Boniato", name: "Boniato Pulled Pork", desc: "Salsa cheddar + salsa yogur + pulled pork BBQ + cebolla crujiente + caramelo de bacon", price: 5.50, nuevo: true },

  { id: 22, cat: "Paninis", name: "Panini Jamón York y Queso", desc: "Pan de leña crujiente · medio metro", price: 5.50 },
  { id: 23, cat: "Paninis", name: "Panini Carbonara", desc: "Pan de leña crujiente · medio metro", price: 5.50 },
  { id: 24, cat: "Paninis", name: "Panini Barbacoa", desc: "Pan de leña crujiente · medio metro", price: 5.50 },
  { id: 25, cat: "Paninis", name: "Panini Kebab", desc: "Pan de leña crujiente · medio metro", price: 5.50 },
  { id: 26, cat: "Paninis", name: "Panini 4 Quesos", desc: "Pan de leña crujiente · medio metro", price: 5.50 },

  { id: 27, cat: "Cookies", name: "Crumbl Cookie Pistacho", desc: "Recién horneada", price: 2.99 },
  { id: 28, cat: "Cookies", name: "Crumbl Cookie Lotus", desc: "Recién horneada", price: 2.99 },
  { id: 29, cat: "Cookies", name: "Crumbl Cookie Oreo", desc: "Recién horneada", price: 2.99 },
  { id: 30, cat: "Cookies", name: "Crumbl Cookie Kit Kat", desc: "Recién horneada", price: 2.99 },
  { id: 31, cat: "Cookies", name: "Crumbl Cookie Nutella", desc: "Recién horneada", price: 2.99 },
  { id: 32, cat: "Cookies", name: "Crumbl Cookie Kinder", desc: "Recién horneada", price: 2.99 },
  { id: 33, cat: "Cookies", name: "Crumbl Cookie Huesitos Blanco", desc: "Recién horneada", price: 2.99 },

  { id: 34, cat: "Tartas", name: "Tarta de Queso La Viña", desc: "Clásica · elaboración propia", price: 3.40 },
  { id: 35, cat: "Tartas", name: "Tarta Tres Chocolates", desc: "Clásica · elaboración propia", price: 3.40 },
  { id: 36, cat: "Tartas", name: "Tarta de la Abuela", desc: "Clásica · elaboración propia", price: 3.40 },
  { id: 37, cat: "Tartas", name: "Tarta de Queso Lotus", desc: "Especial · elaboración propia", price: 3.90 },
  { id: 38, cat: "Tartas", name: "Tarta de Queso Pistacho", desc: "Especial · elaboración propia", price: 3.90 },
  { id: 39, cat: "Tartas", name: "Tarta de Queso Dinosaurio", desc: "Especial · elaboración propia", price: 3.90 },
  { id: 40, cat: "Tartas", name: "Tarta de Queso Kinder", desc: "Especial · elaboración propia", price: 3.90 },

  { id: 41, cat: "Bebidas", name: "Refresco lata", desc: "", price: 1.30 },
  { id: 42, cat: "Bebidas", name: "Cerveza lata", desc: "", price: 1.40 },
  { id: 43, cat: "Bebidas", name: "Agua pequeña", desc: "", price: 0.80 },
  { id: 44, cat: "Bebidas", name: "Refresco 500 ml", desc: "", price: 2.00 },
  { id: 45, cat: "Bebidas", name: "Cerveza 1 litro", desc: "", price: 2.00 },
  { id: 46, cat: "Bebidas", name: "Monster o Red Bull", desc: "", price: 2.00 },
  { id: 47, cat: "Bebidas", name: "Agua 1,5 litros", desc: "", price: 1.50 },
  { id: 48, cat: "Bebidas", name: "Nestea / Aquarius 1,5 l", desc: "", price: 2.40 },
  { id: 49, cat: "Bebidas", name: "Refresco 2 litros", desc: "", price: 2.70 },

  { id: 53, cat: "Snacks", name: "Lays Campesinas", desc: "", price: 1.70 },
  { id: 54, cat: "Snacks", name: "Lays Clásicas", desc: "", price: 1.70 },
  { id: 55, cat: "Snacks", name: "Ruffles York Queso", desc: "", price: 1.70 },
  { id: 56, cat: "Snacks", name: "Ruffles Jamón", desc: "", price: 1.70 },
  { id: 57, cat: "Snacks", name: "Doritos Verdes", desc: "", price: 1.70 },
  { id: 58, cat: "Snacks", name: "Doritos Naranjas", desc: "", price: 1.70 },
  { id: 59, cat: "Snacks", name: "Cheetos Pandilla Fantasma", desc: "", price: 1.50 },
  { id: 60, cat: "Snacks", name: "Cheetos Pelotazos", desc: "", price: 1.50 },
  { id: 61, cat: "Snacks", name: "Cheetos Palitos Stick", desc: "", price: 1.50 },
  { id: 62, cat: "Snacks", name: "Mix Ups", desc: "", price: 1.50 },
  { id: 63, cat: "Snacks", name: "Cheetos Gustosines", desc: "", price: 1.50 },
  { id: 64, cat: "Snacks", name: "Cheetos Palomitas", desc: "", price: 1.50 },
  { id: 65, cat: "Snacks", name: "Bits Verdes Pequeños", desc: "", price: 0.50 },
  { id: 66, cat: "Snacks", name: "Bits Rojos Pequeños", desc: "", price: 0.50 },
  { id: 67, cat: "Snacks", name: "Bits Naranjas Pequeños", desc: "", price: 0.50 },
  { id: 68, cat: "Snacks", name: "Bits Rojos Grandes", desc: "", price: 1.00 },
  { id: 69, cat: "Snacks", name: "Bits Verdes Grandes", desc: "", price: 1.00 },
  { id: 70, cat: "Snacks", name: "Bits Naranjas Grandes", desc: "", price: 1.00 },
  { id: 71, cat: "Snacks", name: "Revoltillo", desc: "", price: 2.80 },
  { id: 72, cat: "Snacks", name: "Pipas", desc: "", price: 1.90 },

  { id: 52, cat: "Extras", name: "Bolsa", desc: "Para llevar", price: 0.10 },
];

/* ── Personalización de la carta guardada en este ordenador: productos
   sencillos añadidos/quitados a mano y etiqueta NUEVO puesta/quitada a
   mano, desde "🍽️ Carta". Se aplica una vez al cargar, mutando MENU
   directamente para que el resto del código (que ya usa MENU por todos
   lados) no tenga que cambiar. ── */
const MENU_REMOVED_KEY = 'comandas_menu_removed_v1';
const MENU_CUSTOM_KEY = 'comandas_menu_custom_v1';
const MENU_NUEVO_OVERRIDES_KEY = 'comandas_menu_nuevo_overrides_v1';
const MENU_HIDDEN_OVERRIDES_KEY = 'comandas_menu_hidden_overrides_v1';
const MENU_EDITS_KEY = 'comandas_menu_edits_v1';
const MENU_ORDER_KEY = 'comandas_menu_order_v1';
function loadMenuRemoved() { try { return JSON.parse(localStorage.getItem(MENU_REMOVED_KEY) || '[]'); } catch (e) { return []; } }
function loadMenuCustom() { try { return JSON.parse(localStorage.getItem(MENU_CUSTOM_KEY) || '[]'); } catch (e) { return []; } }
function loadMenuNuevoOverrides() { try { return JSON.parse(localStorage.getItem(MENU_NUEVO_OVERRIDES_KEY) || '{}'); } catch (e) { return {}; } }
function loadMenuHiddenOverrides() { try { return JSON.parse(localStorage.getItem(MENU_HIDDEN_OVERRIDES_KEY) || '{}'); } catch (e) { return {}; } }
function loadMenuEdits() { try { return JSON.parse(localStorage.getItem(MENU_EDITS_KEY) || '{}'); } catch (e) { return {}; } }
function loadMenuOrder() { try { return JSON.parse(localStorage.getItem(MENU_ORDER_KEY) || '[]'); } catch (e) { return []; } }
function saveMenuOrder() { localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(MENU.map(m => m.id))); }
(function applyMenuCustomizations() {
  const removedSet = new Set(loadMenuRemoved());
  for (let i = MENU.length - 1; i >= 0; i--) {
    if (removedSet.has(MENU[i].id)) MENU.splice(i, 1);
  }
  loadMenuCustom().forEach(item => MENU.push(item));
  const nuevoOverrides = loadMenuNuevoOverrides();
  const hiddenOverrides = loadMenuHiddenOverrides();
  const edits = loadMenuEdits();
  MENU.forEach(item => {
    if (Object.prototype.hasOwnProperty.call(nuevoOverrides, item.id)) item.nuevo = nuevoOverrides[item.id];
    if (Object.prototype.hasOwnProperty.call(hiddenOverrides, item.id)) item.hidden = hiddenOverrides[item.id];
    if (Object.prototype.hasOwnProperty.call(edits, item.id)) Object.assign(item, edits[item.id]);
  });
  const order = loadMenuOrder();
  if (order.length) {
    const pos = new Map(order.map((id, i) => [id, i]));
    MENU.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : Infinity) - (pos.has(b.id) ? pos.get(b.id) : Infinity));
  }
})();

const CHEDDAR_ID = 50;
const EXTRAS_SOLO_GRATINADO = new Set([4, 5, 6, 8, 11, 12, 14]); // ya llevan mozzarella
const EXTRAS_QUESO_Y_GRATINADO = new Set([1, 2, 3, 7, 9, 10, 13]);
const ALL_EXTRAS_IDS = new Set([...EXTRAS_SOLO_GRATINADO, ...EXTRAS_QUESO_Y_GRATINADO]);
// Todos los ingredientes extra cuestan lo mismo (antes había dos precios
// distintos, 1€/0,70€ según el ingrediente); estas dos listas se
// conservan solo para agrupar/ordenar el desplegable, ya no para el precio.
const EXTRAS_ING_PRECIO1 = ["4 Quesos", "Atún", "Bacon", "Carne Kebab", "Carne Picada", "Gambas", "Huevo", "Jamón York", "Pollo", "Queso Mozzarella", "Tronquitos de Mar"];
const EXTRAS_ING_PRECIO07 = ["Aceitunas", "Cebolla", "Champiñón", "Maíz", "Piña", "Remolacha", "Tomate Natural", "Zanahoria"];
const EXTRAS_ING_PRECIO = 1;
const EXTRAS_SALSA_PRECIO = 1;
const EXTRAS_PRECIO_ALTO = 1.20; // Philadelphia, Queso Mozzarella y 4 Quesos parten con este precio más alto
const EXTRAS_ING_PRECIO_ALTO_DEFAULT = new Set(['Queso Mozzarella', '4 Quesos']);
function defaultPriceOfIngExtra(name) { return EXTRAS_ING_PRECIO_ALTO_DEFAULT.has(name) ? EXTRAS_PRECIO_ALTO : EXTRAS_ING_PRECIO; }
function defaultPriceOfSalsaExtra(name) { return name === 'Philadelphia' ? EXTRAS_PRECIO_ALTO : EXTRAS_SALSA_PRECIO; }
// Precios de "extra" (salsas e ingredientes) editables desde 🍽️ Carta —
// así se pueden ajustar sin tocar código. Lo de arriba son solo los
// valores de fábrica con los que arranca cada uno la primera vez.
const EXTRAS_PRECIOS_KEY = 'comandas_extras_precios_v1';
function loadExtrasPrecios() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(EXTRAS_PRECIOS_KEY) || '{}'); } catch (e) { /* ignora datos corruptos */ }
  const ing = {}, salsa = {};
  CUST_INGREDIENTS.forEach(n => { ing[n] = (saved.ing && typeof saved.ing[n] === 'number') ? saved.ing[n] : defaultPriceOfIngExtra(n); });
  CUST_SAUCES.forEach(n => { salsa[n] = (saved.salsa && typeof saved.salsa[n] === 'number') ? saved.salsa[n] : defaultPriceOfSalsaExtra(n); });
  return { ing, salsa };
}
function saveExtraPrecio(tipo, name, value) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(EXTRAS_PRECIOS_KEY) || '{}'); } catch (e) { /* ignora datos corruptos */ }
  if (!saved.ing) saved.ing = {};
  if (!saved.salsa) saved.salsa = {};
  saved[tipo][name] = value;
  localStorage.setItem(EXTRAS_PRECIOS_KEY, JSON.stringify(saved));
}
function priceOfIngExtra(name) { return loadExtrasPrecios().ing[name]; }
function priceOfSalsaExtra(name) { return loadExtrasPrecios().salsa[name]; }

const CUSTOMIZER_CONFIG = {
  algusto: { name: "Patata Al Gusto", price: 7.90, maxSauces: 1, maxIngredients: 6, maxTotal: null, subtitle: "Hasta 1 salsa y hasta 6 ingredientes a elegir" },
  bomba: { name: "Patata Bomba 🆕", price: 9.40, maxSauces: null, maxIngredients: null, maxTotal: 9, subtitle: "Hasta 9 ingredientes y/o salsas a elegir" },
};
const CUST_SAUCES = ["Alioli", "Ketchup", "Mayonesa", "Philadelphia", "BBQ", "Brava", "Yogur", "Ranchera", "Roquefort", "Rosa", "Tomate Frito"];
const CUST_INGREDIENTS = ["4 Quesos", "Aceitunas", "Atún", "Bacon", "Carne Kebab", "Carne Picada", "Cebolla", "Champiñón", "Gambas", "Huevo", "Jamón York", "Maíz", "Piña", "Pollo", "Queso Mozzarella", "Remolacha", "Tomate Natural", "Tronquitos de Mar", "Zanahoria"];

const BOLSA_ID = 52;
// Orden fijo de categorías en la barra lateral y en "Todos" (siempre igual,
// sin importar el orden en que estén los productos en MENU).
const CATEGORY_ORDER = ["Patatas", "Boniato", "Paninis", "Tartas", "Cookies", "Bebidas", "Snacks"];
let menuCatsSet, extraCats, categories;
// Categorías nuevas creadas a mano desde "Gestionar carta" (ver
// addCartaProduct): no están en CATEGORY_ORDER, así que caen al final —
// esta función se vuelve a llamar cada vez que se añade un producto con una
// categoría distinta, para que la nueva pestaña aparezca sin recargar.
function refreshCategoriesFromMenu() {
  menuCatsSet = new Set(MENU.filter(i => i.id !== BOLSA_ID).map(i => i.cat));
  extraCats = [...menuCatsSet].filter(c => !CATEGORY_ORDER.includes(c));
  categories = ["Todos", ...CATEGORY_ORDER.filter(c => menuCatsSet.has(c)), ...extraCats];
}
refreshCategoriesFromMenu();
let activeCategory = "Todos";
// Mismo orden fijo para las líneas de la comanda y del ticket: patatas,
// boniato, paninis, tartas, cookies, bebidas y la bolsa siempre la última
// (su categoría "Extras" no está en CATEGORY_ORDER, así que cae al final).
function categoryRank(cat) {
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx === -1 ? CATEGORY_ORDER.length : idx;
}

/* ── Estado del carrito (3 capas, igual que en la web) ── */
let cart = {};        // id -> qty (productos simples, sin personalizar)
let custCart = {};    // key -> {menuId, qty, sauces[], ingredients[], extraQueso, extraGratinado, extraSauces[]}
let extrasCart = {};  // key -> {menuId, qty, queso, gratinado, ingredientesExtra[], salsasExtra[], basePrice, cheddarCarne?}
let orderPaid = false;
let paymentMethod = 'efectivo';
// Pedido por teléfono cargado desde "Pedidos no pagados" (ver
// payHistorialOrder): su comanda para cocina YA se imprimió cuando se hizo
// el pedido, así que al cobrarlo ahora no hay que volver a imprimir nada —
// solo marcarlo como pagado y que desaparezca de la lista de pendientes.
let pedidoACobrarSinImprimir = null;
function setOrderPaid(v) {
  orderPaid = v;
  document.getElementById('paid-btn-no').classList.toggle('active', !orderPaid);
  document.getElementById('paid-btn-yes').classList.toggle('active', orderPaid);
  document.getElementById('payment-method-row').style.display = orderPaid ? 'flex' : 'none';
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    if (pedidoACobrarSinImprimir) {
      // Ya impreso de antes: el botón solo registra el cobro, no imprime.
      printBtn.textContent = '✅ Marcar como cobrado';
    } else {
      // El botón de abajo del todo de Cobrar siempre imprime — solo cambia
      // el texto según si ya está marcado como pagado o no: "IMPRIMIR
      // COMANDA" antes de cobrar (para la cocina) y "Imprimir ticket" una
      // vez pagado.
      printBtn.textContent = orderPaid ? '🖨️ Imprimir ticket' : 'IMPRIMIR COMANDA';
    }
    printBtn.className = 'btn-print';
  }
}
// Botón de abajo del Cobrar: si el pedido ya estaba impreso (venía de
// "Pedidos no pagados"), solo se registra el cobro; si no, cierra e
// imprime siempre (el estado pagado/no pagado ya va grabado en el pedido,
// solo cambia el texto).
function cobrarBottomAction() {
  closeCobrarModal();
  if (pedidoACobrarSinImprimir) finalizarCobroSinImprimir();
  else handlePrintOrder();
}
function finalizarCobroSinImprimir() {
  const order = pedidoACobrarSinImprimir;
  if (!order) return;
  order.paid = true;
  order.paymentMethod = paymentMethod;
  saveToHistorial(order);
  pedidoACobrarSinImprimir = null;
  clearOrder(true);
  toast('✅ Pedido ' + order.num + ' cobrado');
}
function setPaymentMethod(m) {
  paymentMethod = m;
  document.getElementById('pay-method-cash').classList.toggle('active', m === 'efectivo');
  document.getElementById('pay-method-card').classList.toggle('active', m === 'tarjeta');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmt(n) { return n.toFixed(2).replace('.', ','); }
function sortEs(arr) { return [...arr].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })); }
// Alfabético, pero los quesos siempre van los últimos de la lista.
function isQuesoIngredient(name) { return /queso/i.test(name); }
function sortIngredientsQuesoLast(arr) {
  const normal = arr.filter(n => !isQuesoIngredient(n));
  const quesos = arr.filter(n => isQuesoIngredient(n));
  return [...sortEs(normal), ...sortEs(quesos)];
}
// Igual, pero sin reordenar alfabéticamente — para el ticket, donde solo
// importa que el queso (elegido como ingrediente normal) quede el último.
function quesoLastKeepOrder(arr) {
  return [...arr.filter(n => !isQuesoIngredient(n)), ...arr.filter(n => isQuesoIngredient(n))];
}
function toast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ══════════════════════════════════════════════════════════════
   RENDER — CARTA
   ══════════════════════════════════════════════════════════════ */
const CATEGORY_ICONS = { Todos: '🍽️', Patatas: '🥔', Boniato: '🍠', Paninis: '🍕', Cookies: '🍪', Tartas: '🍰', Bebidas: '🥤', Snacks: '🍿', Extras: '🛍️' };

function initTabs() {
  const catTabs = categories.map(c =>
    `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')"><span class="tab-icon">${CATEGORY_ICONS[c] || '🍽️'}</span>${c}</button>`
  ).join('');
  document.getElementById('tabs').innerHTML = catTabs
    + `<button class="tab" onclick="addBolsaDirect()"><span class="tab-icon">${CATEGORY_ICONS.Extras}</span>Bolsa +${fmt(0.10)}€</button>`
    + `<button class="tab" onclick="openStockModal()"><span class="tab-icon">📦</span>Stock</button>`;
}
function setCategory(cat) { activeCategory = cat; initTabs(); renderMenu(); }
function addBolsaDirect() {
  changeQty(BOLSA_ID, 1);
  toast('🛍️ Bolsa añadida (+0,10 €)');
}

// Carta en cuadrícula: toda la casilla es el botón de añadir (un toque =
// +1, igual que el antiguo "+ Añadir"), salvo que el toque caiga sobre el
// − de quitar una unidad o la casilla esté agotada. La descripción larga
// (ingredientes) y el aviso de "no se pueden quitar ingredientes" no caben
// en una casilla cuadrada — se reducen a un icono ⚠️ con title (tooltip);
// el detalle sigue disponible al personalizar (Al Gusto/Bomba/extras).
function renderItemRow(item) {
  const qty = cart[item.id] || 0;
  // Solo Al Gusto/Bomba/Cheddar necesitan pasar sí o sí por el modal (no
  // tienen un estado "base" sensato sin elegir nada). Todo lo demás
  // (patatas 1-14 y boniatos) se añade tal cual al tocar la casilla, igual
  // que cualquier otro producto simple; para personalizar (quitar
  // ingredientes, queso, gratinado...) se edita después desde el carrito
  // tocando el nombre — un botoncito ✏️ aparte en la casilla quedaba
  // demasiado cargado visualmente.
  // Boniato Bacon (y cualquier otro con "Salsa a elegir") tampoco puede
  // añadirse directo: sin pasar por el modal se quedaría sin salsa elegida.
  const isSpecial = item.id === 15 || item.id === 16 || item.id === CHEDDAR_ID
    || parseBaseComponents(item).some(isElegirSalsaComp);
  const agotado = isItemAgotado(item);
  const showBlockedWarn = isQuitarBlocked(item.id) && parseBaseComponents(item).length > 0;
  const tileAction = isSpecial ? `onAddClick(${item.id})` : `changeQty(${item.id},1)`;
  const tileOnclick = agotado ? '' : ` onclick="if(!event.target.closest('button')){${tileAction}}"`;
  return `<div class="item-row ${agotado ? 'agotado' : ''}" id="card-${item.id}"${tileOnclick}>
    ${item.nuevo && !qty ? `<span class="item-badge-new">Nuevo</span>` : ''}
    ${showBlockedWarn ? `<span class="item-warn-icon" title="No se pueden quitar ingredientes">⚠️</span>` : ''}
    ${qty > 0 && !isSpecial ? `<span class="item-qty-badge">${qty}</span>` : ''}
    <div class="item-name">${escapeHtml(item.name)}</div>
    <div class="item-price">${fmt(item.price)} €</div>
    ${qty > 0 && !isSpecial ? `<button class="item-minus-btn" onclick="changeQty(${item.id},-1)">−</button>` : ''}
    ${agotado ? `<div class="item-agotado-overlay">Agotado</div>` : ''}
  </div>`;
}

// Las tartas se dividen visualmente en Clásicas/Especiales (según el
// desc empiece por "Clásica"/"Especial", igual que en la web), con un
// separador sutil — no un bloque de color como en la web de pedidos.
function renderCategoryItems(cat, items) {
  if (cat !== 'Tartas') return items.map(renderItemRow).join('');
  const clasicas = items.filter(i => (i.desc || '').startsWith('Clásica'));
  const especiales = items.filter(i => (i.desc || '').startsWith('Especial'));
  const resto = items.filter(i => !clasicas.includes(i) && !especiales.includes(i));
  let html = '';
  if (clasicas.length) html += `<div class="menu-subcat-sep">Clásicas</div>` + clasicas.map(renderItemRow).join('');
  if (especiales.length) html += `<div class="menu-subcat-sep">Especiales</div>` + especiales.map(renderItemRow).join('');
  html += resto.map(renderItemRow).join('');
  return html;
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (activeCategory === 'Todos') {
    grid.innerHTML = categories.filter(c => c !== 'Todos').map(cat => {
      const items = MENU.filter(m => m.cat === cat && !m.hidden);
      if (!items.length) return '';
      return `<div class="menu-cat-sep"><span class="cat-emoji">${CATEGORY_ICONS[cat] || ''}</span><span class="cat-name">${cat.toUpperCase()}</span></div>`
        + renderCategoryItems(cat, items);
    }).join('');
  } else {
    grid.innerHTML = renderCategoryItems(activeCategory, MENU.filter(m => m.cat === activeCategory && !m.hidden));
  }
}

function animateAdd(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    card.classList.remove('flashing');
    void card.offsetWidth;
    card.classList.add('flashing');
  }
}

function onAddClick(id) {
  const item = MENU.find(m => m.id == id);
  if (item && isItemAgotado(item)) { toast('🚫 ' + item.name + ' está agotado'); return; }
  if (id === 15 || id === 16) { openCustomizer(id); return; }
  if (id === CHEDDAR_ID) { openCheddarModal(); return; }
  if (ALL_EXTRAS_IDS.has(id) || BONIATO_IDS.has(id)) { openExtrasModal(id); return; }
}

function changeQty(id, delta) {
  if (delta > 0) {
    const item = MENU.find(m => m.id == id);
    if (item && isItemAgotado(item)) { toast('🚫 ' + item.name + ' está agotado'); return; }
  }
  const current = cart[id] || 0;
  const next = current + delta;
  if (next <= 0) { delete cart[id]; clearLineDiscount(simpleLineKey(id)); } else cart[id] = next;
  renderMenu();
  renderCart();
  if (delta > 0) animateAdd(id);
}
function removeItem(id) { delete cart[id]; clearLineDiscount(simpleLineKey(id)); renderMenu(); renderCart(); }
function removeCustItem(key) { delete custCart[key]; clearLineDiscount(key); renderCart(); }
function removeExtrasItem(key) { delete extrasCart[key]; clearLineDiscount(key); renderCart(); }

function changeCustQty(key, delta) {
  const c = custCart[key];
  if (!c) return;
  c.qty += delta;
  if (c.qty <= 0) { delete custCart[key]; clearLineDiscount(key); }
  renderCart();
}
function changeExtrasQty(key, delta) {
  const c = extrasCart[key];
  if (!c) return;
  if (delta > 0) {
    const item = MENU.find(m => m.id == c.menuId);
    if (item && isItemAgotado(item)) { toast('🚫 ' + item.name + ' está agotado'); return; }
  }
  c.qty += delta;
  if (c.qty <= 0) { delete extrasCart[key]; clearLineDiscount(key); }
  renderCart();
}
function editCustItem(key) {
  const c = custCart[key];
  if (!c) return;
  openCustomizer(c.menuId, key);
}
function editExtrasItem(key) {
  const c = extrasCart[key];
  if (!c) return;
  if (c.menuId === CHEDDAR_ID) openCheddarModal(key);
  else openExtrasModal(c.menuId, key);
}
// Una patata/boniato del carrito SIMPLE (añadido tal cual, tocando la
// casilla) no tiene ninguna personalización todavía que "editar" — al
// tocar su nombre se abre el modal de personalizar en modo "añadir"
// (como si se tocara desde la carta) y, solo si de verdad se confirma
// algo, se retira una unidad del carrito simple para no duplicarla (ver
// confirmExtras). Si se cierra sin confirmar, no cambia nada.
let convertingSimpleId = null;
function editSimpleItem(id) {
  convertingSimpleId = id;
  onAddClick(id);
}

/* ══════════════════════════════════════════════════════════════
   CARRITO
   ══════════════════════════════════════════════════════════════ */
// Si se acumulan tantos ingredientes/salsas extra como una Al Gusto o una
// Bomba, se cobra el precio plano de esa patata en vez de sumar cada
// extra por separado (evita cobrar de más por construir, ingrediente a
// ingrediente, lo mismo que ya sale más barato como Al Gusto/Bomba).
function priceOfPick(p) { return p.type === 'salsa' ? priceOfSalsaExtra(p.name) : priceOfIngExtra(p.name); }

// Umbrales EXACTOS de Al Gusto (1 salsa + 6 ingredientes) y Bomba (9 en
// total, mezclando salsas e ingredientes). Al alcanzarlos se cobra el
// precio plano de esa patata; lo que se elija POR ENCIMA del umbral se
// sigue sumando aparte a precio normal (no se pierde, ni se regala).
// `freePasses`: cuántos de los ingredientes/salsas extra elegidos se
// consideran "cambios" gratis (quitaste uno de base y pusiste otro en su
// lugar, en vez de usar el selector de "Cambiar un ingrediente") — se
// aplica a los primeros picks por orden de selección, tope 2 en total
// entre esto y los cambios explícitos (ver confirmExtras/updateExtrasTotalPrice).
function computeExtrasCorePrice(basePrice, ingredientesExtra, salsasExtra, pickOrder, freePasses) {
  const ingCount = (ingredientesExtra || []).length;
  const salsaCount = (salsasExtra || []).length;
  const totalPicks = ingCount + salsaCount;
  const order = pickOrder && pickOrder.length === totalPicks ? pickOrder : null;

  if (totalPicks >= CUSTOMIZER_CONFIG.bomba.maxTotal) {
    let core = CUSTOMIZER_CONFIG.bomba.price;
    if (order) order.slice(CUSTOMIZER_CONFIG.bomba.maxTotal).forEach(p => { core += priceOfPick(p); });
    return core;
  }
  if (salsaCount >= CUSTOMIZER_CONFIG.algusto.maxSauces && ingCount >= CUSTOMIZER_CONFIG.algusto.maxIngredients) {
    let core = CUSTOMIZER_CONFIG.algusto.price;
    if (order) {
      order.filter(p => p.type === 'salsa').slice(CUSTOMIZER_CONFIG.algusto.maxSauces).forEach(p => { core += priceOfPick(p); });
      order.filter(p => p.type === 'ing').slice(CUSTOMIZER_CONFIG.algusto.maxIngredients).forEach(p => { core += priceOfPick(p); });
    }
    return core;
  }
  let core = basePrice;
  let freeLeft = Math.max(0, freePasses || 0);
  if (freeLeft > 0 && order) {
    order.forEach(p => { if (freeLeft > 0) freeLeft--; else core += priceOfPick(p); });
  } else {
    core += (ingredientesExtra || []).reduce((s, name) => s + priceOfIngExtra(name), 0);
    core += (salsasExtra || []).reduce((s, name) => s + priceOfSalsaExtra(name), 0);
  }
  return core;
}
function extrasAutoUpgradeLabel(ingredientesExtra, salsasExtra) {
  const ingCount = (ingredientesExtra || []).length;
  const salsaCount = (salsasExtra || []).length;
  const totalPicks = ingCount + salsaCount;
  if (totalPicks >= CUSTOMIZER_CONFIG.bomba.maxTotal) return 'Precio Bomba aplicado (lo que se pase de 9 se cobra aparte)';
  if (salsaCount >= CUSTOMIZER_CONFIG.algusto.maxSauces && ingCount >= CUSTOMIZER_CONFIG.algusto.maxIngredients) return 'Precio Al Gusto aplicado (lo que se pase de 1 salsa / 6 ingredientes se cobra aparte)';
  return '';
}
// Tope 2 cambios "gratis" en total (quitar uno + añadir otro cuenta como
// cambio igual que usar el selector dedicado), compartido entre ambos.
function computeFreeSwapPasses(quitadosCount, cambiosCount) {
  return Math.max(0, Math.min(quitadosCount || 0, 2 - (cambiosCount || 0)));
}
// Mismo criterio que computeExtrasCorePrice: los primeros `freePasses`
// picks por orden de selección van gratis — así el ticket muestra sin
// precio justo los mismos que no se cobraron en el total.
function freeSwapPickSet(pickOrder, freePasses) {
  const set = new Set();
  let freeLeft = Math.max(0, freePasses || 0);
  (pickOrder || []).forEach(p => { if (freeLeft > 0) { set.add(p.type + ':' + p.name); freeLeft--; } });
  return set;
}
function getExtrasItemPrice(e) {
  const free = computeFreeSwapPasses((e.quitados || []).length, (e.cambios || []).length);
  const core = computeExtrasCorePrice(e.basePrice, e.ingredientesExtra, e.salsasExtra, e.pickOrder, free);
  return core + (e.queso ? 1 : 0) + (e.gratinado ? 0.5 : 0);
}
function extrasIsAutoUpgraded(ingredientesExtra, salsasExtra) {
  const ingCount = (ingredientesExtra || []).length;
  const salsaCount = (salsasExtra || []).length;
  return (ingCount + salsaCount) >= CUSTOMIZER_CONFIG.bomba.maxTotal
    || (salsaCount >= CUSTOMIZER_CONFIG.algusto.maxSauces && ingCount >= CUSTOMIZER_CONFIG.algusto.maxIngredients);
}
// Precio "base" para la línea principal del ticket (sin queso/gratinado,
// que se listan aparte). Si se aplicó el precio plano Al Gusto/Bomba, es
// ese precio (más lo que se haya pasado del límite); si no, es el precio
// base normal de la patata — así cada extra puede llevar su propio precio
// en su línea sin que la suma deje de cuadrar con el total.
function getExtrasItemBaseSubtotal(e) {
  if (extrasIsAutoUpgraded(e.ingredientesExtra, e.salsasExtra)) {
    // El precio plano ya incluye los ingredientes/salsas cubiertos; lo que
    // se pase del límite se cobra aparte dentro de computeExtrasCorePrice.
    return computeExtrasCorePrice(e.basePrice, e.ingredientesExtra, e.salsasExtra, e.pickOrder);
  }
  return e.basePrice; // los ingredientes/salsas van cada uno en su propia línea, con su propio precio
}
function getExtrasItemLabel(e) {
  const item = MENU.find(m => m.id == e.menuId);
  if (!item) return 'Producto desconocido';
  if (e.cheddarCarne) return item.name + ' (' + e.cheddarCarne + ')';
  return item.name;
}
function getExtrasItemDetails(e) {
  const out = [];
  (e.quitados || []).forEach(q => out.push('🚫 Sin ' + q));
  (e.cambios || []).forEach(c => out.push('🔄 ' + c.from + ' → ' + c.to));
  if (e.queso) out.push('+ Queso mozzarella');
  if (e.gratinado) out.push('+ Gratinado');
  (e.ingredientesExtra || []).forEach(i => out.push('+ ' + i));
  (e.salsasExtra || []).forEach(s => out.push('+ ' + s + ' (salsa extra +' + fmt(priceOfSalsaExtra(s)) + '€)'));
  return out;
}
// Igual que getExtrasItemDetails() pero como {name, price} — así el
// ticket puede alinear el precio de cada extra a la derecha, igual que
// en un ticket real impreso (ej. "  - QUESO           +1.00 EUR").
// Todas las líneas de aquí representan una desviación de la receta base de
// un producto estándar (quitar/cambiar un ingrediente, o añadir algo de
// más), así que TODAS se marcan `underline: true` para que salgan
// subrayadas en el ticket — igual que en la web de pedidos.
function getExtrasItemTicketExtras(e) {
  const out = [];
  (e.quitados || []).forEach(q => out.push({ name: 'Sin ' + q, underline: true }));
  (e.cambios || []).forEach(c => out.push({ name: c.from + ' por ' + c.to, underline: true }));
  // Orden fijo en el ticket: primero salsas, luego ingredientes, y el
  // queso/gratinado siempre al final, sin importar cuándo se eligieron.
  const upgraded = extrasIsAutoUpgraded(e.ingredientesExtra, e.salsasExtra);
  const free = upgraded ? 0 : computeFreeSwapPasses((e.quitados || []).length, (e.cambios || []).length);
  const freeSet = freeSwapPickSet(e.pickOrder, free);
  (e.salsasExtra || []).forEach(s => out.push({ name: s, price: (upgraded || freeSet.has('salsa:' + s)) ? null : priceOfSalsaExtra(s), underline: true }));
  quesoLastKeepOrder(e.ingredientesExtra || []).forEach(i => out.push({ name: i, price: (upgraded || freeSet.has('ing:' + i)) ? null : priceOfIngExtra(i), underline: true }));
  if (e.queso) out.push({ name: 'Queso', price: 1, underline: true });
  if (e.gratinado) out.push({ name: 'Gratinado', price: 0.5, underline: true });
  return out;
}
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
}

/* ══════════════════════════════════════════════════════════════
   DESCUENTO / OFERTA — se aplica como una línea más del pedido
   (con importe negativo), igual que hace la web con la fidelización.
   Puede ser de TODO el pedido (orderDiscount, botón "🏷️ Descuento" de
   la cabecera) o de UN SOLO PRODUCTO (lineDiscounts, botón 🏷️ en cada
   línea de la comanda) — el mismo modal sirve para los dos casos según
   discountTargetKey: null = pedido completo, si no, la key de esa línea
   (mismo formato de key que usa el carrito: 'simple:<id>' para
   productos sencillos, o la key ya existente de custCart/extrasCart). ── */
let orderDiscount = null; // {type:'percent'|'fixed', value, label} — todo el pedido
let lineDiscounts = {};   // key de línea -> {type,value,label} — un solo producto
let discountTargetKey = null; // objetivo del modal abierto ahora mismo

function simpleLineKey(id) { return 'simple:' + id; }
// Quita el descuento de una línea que ya no existe en el carrito (se ha
// borrado del todo o su cantidad ha llegado a 0) — sin esto quedaría un
// descuento "huérfano" guardado que reaparecería si se vuelve a añadir
// ese mismo producto más tarde en la misma comanda.
function clearLineDiscount(key) { delete lineDiscounts[key]; }

function getActiveDiscount() { return discountTargetKey ? (lineDiscounts[discountTargetKey] || null) : orderDiscount; }
function setActiveDiscount(d) {
  if (discountTargetKey) { if (d) lineDiscounts[discountTargetKey] = d; else delete lineDiscounts[discountTargetKey]; }
  else orderDiscount = d;
}
// Nombre del producto de esa línea, para el subtítulo del modal cuando el
// descuento es de un solo producto (y no de todo el pedido).
function getLineDiscountContextLabel(key) {
  if (!key) return null;
  if (key.indexOf('simple:') === 0) {
    const item = MENU.find(m => m.id == key.slice('simple:'.length));
    return item ? item.name : null;
  }
  if (custCart[key]) { const item = MENU.find(m => m.id == custCart[key].menuId); return item ? item.name : null; }
  if (extrasCart[key]) return getExtrasItemLabel(extrasCart[key]);
  return null;
}

// Teclado numérico táctil genérico para campos tipo "Valor" (ej. importe
// del descuento) — igual que el de Cobrar, pero escribe directo en el
// input de destino en vez de sumar a un total.
let numpadTargetId = null;
let numpadBuffer = '';
function openNumpad(inputId, title) {
  numpadTargetId = inputId;
  const el = document.getElementById(inputId);
  numpadBuffer = el && el.value ? String(el.value).replace('.', ',') : '';
  document.getElementById('numpad-title').textContent = title || 'Valor';
  updateNumpadDisplay();
  document.getElementById('numpad-modal').classList.add('open');
}
function closeNumpad() {
  document.getElementById('numpad-modal').classList.remove('open');
  numpadTargetId = null;
}
function numpadDigit(d) {
  if (d === ',' && numpadBuffer.includes(',')) return;
  if (numpadBuffer.replace(',', '').length >= 6) return;
  numpadBuffer += d;
  updateNumpadDisplay();
}
function numpadClear() { numpadBuffer = ''; updateNumpadDisplay(); }
function updateNumpadDisplay() {
  const el = document.getElementById('numpad-display');
  if (el) el.textContent = numpadBuffer || '0';
}
function numpadConfirm() {
  if (numpadTargetId) {
    const el = document.getElementById(numpadTargetId);
    el.value = numpadBuffer;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  closeNumpad();
}

// Teclado alfabético táctil para "Nombre para avisar" — el mostrador no
// tiene teclado físico, así que este campo también necesitaba su propio
// teclado en pantalla (igual que el numérico de arriba, pero de letras).
let nameKbBuffer = '';
let nameKbShiftOn = true;
const NAMEKB_ACCENTS = new Set(['á', 'é', 'í', 'ó', 'ú', 'ñ']);
function openNameKeyboard() {
  nameKbBuffer = document.getElementById('order-name').value || '';
  nameKbShiftOn = nameKbBuffer.length === 0;
  nameKbRenderCase();
  nameKbUpdateDisplay();
  document.getElementById('namekb-overlay').classList.add('open');
  document.getElementById('order-name').classList.add('kb-active');
}
function closeNameKeyboard() {
  document.getElementById('namekb-overlay').classList.remove('open');
  document.getElementById('order-name').classList.remove('kb-active');
}
function nameKbLetter(l) {
  if (nameKbBuffer.length >= 40) return;
  nameKbBuffer += nameKbShiftOn ? l.toUpperCase() : l;
  if (nameKbShiftOn && !NAMEKB_ACCENTS.has(l)) { nameKbShiftOn = false; nameKbRenderCase(); }
  nameKbUpdateDisplay();
}
function nameKbShift() { nameKbShiftOn = !nameKbShiftOn; nameKbRenderCase(); }
function nameKbBackspace() { nameKbBuffer = nameKbBuffer.slice(0, -1); nameKbUpdateDisplay(); }
function nameKbSpace() {
  if (nameKbBuffer.length >= 40) return;
  nameKbBuffer += ' ';
  nameKbUpdateDisplay();
}
function nameKbRenderCase() {
  const shiftBtn = document.getElementById('namekb-shift-btn');
  if (shiftBtn) shiftBtn.classList.toggle('on', nameKbShiftOn);
  document.querySelectorAll('.namekb-letter-key').forEach(btn => {
    const l = btn.dataset.letter;
    btn.textContent = nameKbShiftOn ? l.toUpperCase() : l;
  });
}
function nameKbUpdateDisplay() {
  const el = document.getElementById('namekb-display');
  el.textContent = nameKbBuffer || 'Ej. Ana';
  el.classList.toggle('placeholder', !nameKbBuffer);
  const input = document.getElementById('order-name');
  input.value = nameKbBuffer;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
function nameKbConfirm() { closeNameKeyboard(); }

// Teclado numérico para "Hora de recogida" — se escribe de izquierda a
// derecha, primero la hora y luego los minutos (como rellenar dos huecos),
// y lo que falta por escribir se ve como "--:--".
let pickupBuffer = '';
function formatPickupBuffer(buf) {
  const chars = (buf + '----').slice(0, 4).split('');
  return chars[0] + chars[1] + ':' + chars[2] + chars[3];
}
function openPickupTimeKeypad() {
  pickupBuffer = (document.getElementById('pickup-time').value || '').replace(/[^0-9]/g, '');
  updatePickupDisplay();
  document.getElementById('pickup-modal').classList.add('open');
}
function closePickupTimeKeypad() { document.getElementById('pickup-modal').classList.remove('open'); }
function pickupDigit(d) {
  if (pickupBuffer.length >= 4) return;
  pickupBuffer += d;
  updatePickupDisplay();
}
function pickupBackspace() { pickupBuffer = pickupBuffer.slice(0, -1); updatePickupDisplay(); }
function pickupClear() { pickupBuffer = ''; updatePickupDisplay(); }
function updatePickupDisplay() {
  document.getElementById('pickup-display').textContent = pickupBuffer ? formatPickupBuffer(pickupBuffer) : '--:--';
}
function pickupConfirm() {
  const input = document.getElementById('pickup-time');
  if (!pickupBuffer) {
    input.value = '';
  } else {
    const hh = Math.min(23, parseInt(pickupBuffer.slice(0, 2).padEnd(2, '0'), 10));
    const mm = Math.min(59, parseInt(pickupBuffer.slice(2, 4).padEnd(2, '0'), 10));
    input.value = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
  closePickupTimeKeypad();
}

function openDiscountModal(lineKey) {
  discountTargetKey = lineKey || null;
  const current = getActiveDiscount();
  document.getElementById('discount-type').value = current ? current.type : 'percent';
  document.getElementById('discount-value').value = current ? current.value : '';
  document.getElementById('discount-label').value = current ? (current.label || '') : '';
  document.getElementById('discount-error').style.display = 'none';
  document.getElementById('discount-remove-btn').style.display = current ? 'inline-block' : 'none';
  const contextLabel = discountTargetKey ? getLineDiscountContextLabel(discountTargetKey) : null;
  document.getElementById('discount-modal-subtitle').textContent = contextLabel
    ? 'Se aplica solo a: ' + contextLabel
    : 'Se aplica al total de esta comanda.';
  document.getElementById('discount-modal').classList.add('open');
}
function closeDiscountModal() { document.getElementById('discount-modal').classList.remove('open'); discountTargetKey = null; }
function applyPresetDiscount() {
  setActiveDiscount({ type: 'percent', value: 10, label: 'ESTUDIANTE/JUBILADO' });
  closeDiscountModal();
  renderCart();
  toast('✅ Descuento aplicado');
}
function applyDiscount() {
  const type = document.getElementById('discount-type').value;
  const value = parseCashNum(document.getElementById('discount-value').value);
  const label = document.getElementById('discount-label').value.trim();
  const errEl = document.getElementById('discount-error');
  if (!value || value <= 0) {
    errEl.textContent = 'Introduce un valor mayor que 0';
    errEl.style.display = 'block';
    return;
  }
  if (type === 'percent' && value > 100) {
    errEl.textContent = 'El porcentaje no puede superar 100';
    errEl.style.display = 'block';
    return;
  }
  setActiveDiscount({ type, value, label });
  closeDiscountModal();
  renderCart();
  toast('✅ Descuento aplicado');
}
function removeDiscount() {
  setActiveDiscount(null);
  closeDiscountModal();
  renderCart();
  toast('Descuento eliminado');
}
function discountLineLabel(discount, forTicket) {
  const label = (discount.label && discount.label.trim()) || 'Descuento';
  const suffix = discount.type === 'percent' ? ' (-' + discount.value + '%)' : '';
  return (forTicket ? '' : '🏷️ ') + label + suffix;
}
function computeDiscountAmount(subtotal, discount) {
  if (!discount || subtotal <= 0) return 0;
  let amt = discount.type === 'percent' ? subtotal * discount.value / 100 : discount.value;
  return Math.max(0, Math.min(amt, subtotal));
}

/* ══════════════════════════════════════════════════════════════
   DESLIZAR PARA BORRAR (gesto táctil) — alternativa al icono 🗑️
   pequeño, más fácil de acertar con el dedo en hora punta. Cada línea
   del carrito se envuelve en un .cart-line-swipe-wrap con un fondo rojo
   "🗑️ Quitar" debajo; al deslizar la línea hacia la izquierda más de
   SWIPE_UMBRAL_BORRAR px se suelta y se borra, igual que si se hubiera
   tocado el icono. Usa Pointer Events (mismo código para dedo y ratón) y
   delegación de eventos sobre #cart-body en vez de un listener por línea,
   porque renderCart() reconstruye todo el HTML del carrito en cada
   cambio — con delegación no hace falta re-engancharlos cada vez. ── */
function wrapSwipe(type, key, lineHtml) {
  return `<div class="cart-line-swipe-wrap" data-swipe-type="${escapeHtml(type)}" data-swipe-key="${escapeHtml(String(key))}">
    <div class="cart-line-delete-bg">🗑️ Quitar</div>
    ${lineHtml}
  </div>`;
}
const SWIPE_UMBRAL_BORRAR = 76; // px que hay que deslizar para que se suelte y borre
const SWIPE_MAX = 120;
let swipeState = null;
function initCartSwipeToDelete() {
  const body = document.getElementById('cart-body');
  if (!body) return;
  body.addEventListener('pointerdown', onSwipePointerDown);
  body.addEventListener('pointermove', onSwipePointerMove);
  body.addEventListener('pointerup', onSwipePointerUp);
  body.addEventListener('pointercancel', onSwipePointerUp);
}
function onSwipePointerDown(e) {
  if (e.target.closest('button')) return; // no robarle el toque a +/-, ✏️, 🏷️ o 🗑️
  const wrap = e.target.closest('.cart-line-swipe-wrap');
  if (!wrap) return;
  const line = wrap.querySelector('.cart-line');
  if (!line) return;
  swipeState = { wrap, line, startX: e.clientX, startY: e.clientY, dx: 0, dragging: false, pointerId: e.pointerId };
}
function onSwipePointerMove(e) {
  if (!swipeState || e.pointerId !== swipeState.pointerId) return;
  const dx = e.clientX - swipeState.startX;
  const dy = e.clientY - swipeState.startY;
  if (!swipeState.dragging) {
    // Todavía no está claro si es un swipe horizontal o solo scroll
    // vertical / un toque que tiembla un poco — hasta que el movimiento
    // horizontal sea claramente mayor que el vertical no se "roba" el
    // gesto, para no romper el scroll normal de la lista de la comanda.
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    swipeState.dragging = true;
    swipeState.line.style.transition = 'none';
    try { swipeState.line.setPointerCapture(swipeState.pointerId); } catch (err) {}
  }
  e.preventDefault();
  swipeState.dx = Math.max(-SWIPE_MAX, Math.min(0, dx)); // solo se desliza hacia la izquierda
  swipeState.line.style.transform = 'translateX(' + swipeState.dx + 'px)';
  swipeState.wrap.classList.toggle('swipe-armed', swipeState.dx <= -SWIPE_UMBRAL_BORRAR);
}
function onSwipePointerUp(e) {
  if (!swipeState || e.pointerId !== swipeState.pointerId) return;
  const { wrap, line, dx, dragging } = swipeState;
  swipeState = null;
  line.style.transition = 'transform .18s ease';
  if (dragging && dx <= -SWIPE_UMBRAL_BORRAR) {
    line.style.transform = 'translateX(-100%)';
    setTimeout(() => swipeRemoveByKey(wrap.dataset.swipeType, wrap.dataset.swipeKey), 170);
  } else {
    line.style.transform = 'translateX(0)';
    wrap.classList.remove('swipe-armed');
  }
}
function swipeRemoveByKey(type, key) {
  if (type === 'simple') removeItem(parseInt(key, 10));
  else if (type === 'cust') removeCustItem(key);
  else if (type === 'extras') removeExtrasItem(key);
  else if (type === 'discount') removeDiscount();
}

function renderCart() {
  const bodyEl = document.getElementById('cart-body');
  const totalRowEl = document.getElementById('cart-total-row');
  const lines = Object.entries(cart);
  const custLines = Object.values(custCart).filter(c => c.qty > 0);
  const extLines = Object.values(extrasCart).filter(c => c.qty > 0);

  if (lines.length === 0 && custLines.length === 0 && extLines.length === 0) {
    bodyEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div>Añade productos de la carta</div>`;
    totalRowEl.style.display = 'none';
    // "0,00 €" también en el texto (no solo ocultando la fila) para que
    // currentOrderTotal() no se quede leyendo el importe del pedido
    // anterior si se abre Cobrar con la comanda vacía.
    document.getElementById('cart-total').textContent = '0,00 €';
    // El botón de Cobrar se queda siempre a la vista aunque la comanda esté
    // vacía (pedidos por teléfono que se cobran después, sin haber tocado
    // aún el carrito).
    document.getElementById('print-btn').disabled = true;
    syncCashTotal(0);
    clearCartDraft();
    return;
  }

  let total = 0;
  const rows = []; // { rank, html } — se ordenan por categoría antes de pintar

  lines.forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    const key = simpleLineKey(item.id);
    const raw = item.price * qty;
    const discAmt = computeDiscountAmount(raw, lineDiscounts[key]);
    const subtotal = raw - discAmt;
    total += subtotal;
    const simpleCanEdit = ALL_EXTRAS_IDS.has(item.id) || BONIATO_IDS.has(item.id);
    const simpleNameHtml = simpleCanEdit
      ? `<button type="button" class="cart-line-name cart-line-name-btn" onclick="editSimpleItem(${item.id})" title="Personalizar (quitar ingredientes, queso, gratinado...)">${escapeHtml(item.name)}</button>`
      : `<span class="cart-line-name">${escapeHtml(item.name)}</span>`;
    rows.push({ rank: categoryRank(item.cat), html: wrapSwipe('simple', item.id, `<div class="cart-line">
      ${simpleNameHtml}
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeQty(${item.id},-1)">−</button>
        <span>${qty}</span>
        <button class="qty-btn-sm" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-edit" onclick="openDiscountModal('${key}')" title="Descuento en este producto">🏷️</button>
      <button class="cart-remove" onclick="removeItem(${item.id})" title="Quitar">🗑️</button>
      ${discAmt > 0 ? `<div class="cart-line-extra">${escapeHtml(discountLineLabel(lineDiscounts[key]))} (-${fmt(discAmt)} €)</div>` : ''}
    </div>`) });
  });

  custLines.forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const extraIngPrice = (c.extraIngredients || []).reduce((s, n) => s + priceOfPick({ type: 'ing', name: n }), 0);
    const extraSaucePrice = (c.extraSauces || []).reduce((s, name) => s + priceOfSalsaExtra(name), 0);
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + extraSaucePrice + extraIngPrice;
    const raw = unitPrice * c.qty;
    const discAmt = computeDiscountAmount(raw, lineDiscounts[c.key]);
    const subtotal = raw - discAmt;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients, c.extraQueso ? 'Queso mozzarella' : '', c.extraGratinado ? 'Gratinado' : '',
      ...(c.extraSauces || []).map(s => s + ' (salsa extra +' + fmt(priceOfSalsaExtra(s)) + '€)'),
      ...(c.extraIngredients || []).map(n => n + ' (extra +' + fmt(priceOfPick({ type: 'ing', name: n })) + '€)'),
    ].filter(Boolean).join(', ');
    rows.push({ rank: categoryRank(item.cat), html: wrapSwipe('cust', c.key, `<div class="cart-line">
      <button type="button" class="cart-line-name cart-line-name-btn" onclick="editCustItem('${c.key}')" title="Editar">${escapeHtml(item.name)}</button>
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeCustQty('${c.key}',-1)">−</button>
        <span>${c.qty}</span>
        <button class="qty-btn-sm" onclick="changeCustQty('${c.key}',1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-edit" onclick="openDiscountModal('${c.key}')" title="Descuento en este producto">🏷️</button>
      <button class="cart-remove" onclick="removeCustItem('${c.key}')" title="Quitar">🗑️</button>
      <div class="cart-line-extra">${escapeHtml(details)}</div>
      ${discAmt > 0 ? `<div class="cart-line-extra">${escapeHtml(discountLineLabel(lineDiscounts[c.key]))} (-${fmt(discAmt)} €)</div>` : ''}
    </div>`) });
  });

  extLines.forEach(c => {
    const price = getExtrasItemPrice(c);
    const raw = price * c.qty;
    const discAmt = computeDiscountAmount(raw, lineDiscounts[c.key]);
    const subtotal = raw - discAmt;
    total += subtotal;
    const details = getExtrasItemDetails(c).join(' · ');
    const baseItem = MENU.find(m => m.id == c.menuId);
    rows.push({ rank: categoryRank(baseItem ? baseItem.cat : ''), html: wrapSwipe('extras', c.key, `<div class="cart-line">
      <button type="button" class="cart-line-name cart-line-name-btn" onclick="editExtrasItem('${c.key}')" title="Editar">${escapeHtml(getExtrasItemLabel(c))}</button>
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeExtrasQty('${c.key}',-1)">−</button>
        <span>${c.qty}</span>
        <button class="qty-btn-sm" onclick="changeExtrasQty('${c.key}',1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-edit" onclick="openDiscountModal('${c.key}')" title="Descuento en este producto">🏷️</button>
      <button class="cart-remove" onclick="removeExtrasItem('${c.key}')" title="Quitar">🗑️</button>
      ${details ? `<div class="cart-line-extra">${escapeHtml(details)}</div>` : ''}
      ${discAmt > 0 ? `<div class="cart-line-extra">${escapeHtml(discountLineLabel(lineDiscounts[c.key]))} (-${fmt(discAmt)} €)</div>` : ''}
    </div>`) });
  });

  rows.sort((a, b) => a.rank - b.rank);
  let html = rows.map(r => r.html).join('');

  const discountAmount = computeDiscountAmount(total, orderDiscount);
  if (discountAmount > 0) {
    html += wrapSwipe('discount', '', `<div class="cart-line cart-line-discount">
      <span class="cart-line-name">${escapeHtml(discountLineLabel(orderDiscount))}</span>
      <span class="cart-line-price">-${fmt(discountAmount)} €</span>
      <button class="cart-edit" onclick="openDiscountModal()" title="Editar">✏️</button>
      <button class="cart-remove" onclick="removeDiscount()" title="Quitar">🗑️</button>
    </div>`);
  }

  bodyEl.innerHTML = html;
  totalRowEl.style.display = 'flex';
  const orderTotal = total - discountAmount;
  document.getElementById('cart-total').textContent = fmt(orderTotal) + ' €';
  document.getElementById('print-btn').disabled = false;
  syncCashTotal(orderTotal);
  saveCartDraft();
}

/* ── Recuperación automática ante corte de luz/cierre accidental: la
   comanda en curso (sin imprimir todavía) se guarda sola en este
   ordenador y se recupera sola al volver a abrir la página. ── */
const CART_DRAFT_KEY = 'dpf_comandas_draft';
function saveCartDraft() {
  try {
    const draft = {
      cart: { ...cart },
      custCart: JSON.parse(JSON.stringify(custCart)),
      extrasCart: JSON.parse(JSON.stringify(extrasCart)),
      orderDiscount: orderDiscount ? { ...orderDiscount } : null,
      lineDiscounts: JSON.parse(JSON.stringify(lineDiscounts)),
      name: (document.getElementById('order-name') || {}).value || '',
      pickupTime: (document.getElementById('pickup-time') || {}).value || '',
      paid: orderPaid,
      paymentMethod,
    };
    localStorage.setItem(CART_DRAFT_KEY, JSON.stringify(draft));
  } catch (e) { /* si falla el guardado no debe romper la comanda */ }
}
function clearCartDraft() { localStorage.removeItem(CART_DRAFT_KEY); }
function restoreCartDraftIfAny() {
  let draft;
  try { draft = JSON.parse(localStorage.getItem(CART_DRAFT_KEY) || 'null'); } catch (e) { return; }
  if (!draft) return;
  const hasContent = Object.keys(draft.cart || {}).length || Object.keys(draft.custCart || {}).length || Object.keys(draft.extrasCart || {}).length;
  if (!hasContent) return;
  cart = draft.cart || {};
  custCart = draft.custCart || {};
  extrasCart = draft.extrasCart || {};
  orderDiscount = draft.orderDiscount || null;
  lineDiscounts = draft.lineDiscounts || {};
  const nameEl = document.getElementById('order-name');
  if (nameEl) nameEl.value = draft.name || '';
  const pickupEl = document.getElementById('pickup-time');
  if (pickupEl) pickupEl.value = draft.pickupTime || '';
  setOrderPaid(!!draft.paid);
  setPaymentMethod(draft.paymentMethod || 'efectivo');
  renderMenu();
  renderCart();
  toast('🔄 Se ha recuperado una comanda sin terminar de antes');
}

/* ══════════════════════════════════════════════════════════════
   CALCULADORA DE CAMBIO (pago en efectivo) — estilo uniCenta: Total,
   Entregado y Cambio en una sola casilla, siempre visibles; el dinero
   entregado se suma tocando billetes/monedas o escribiéndolo con el
   teclado numérico (con "=" para sumarlo del todo).
   ══════════════════════════════════════════════════════════════ */
function parseCashNum(str) { return parseFloat(String(str || '').replace(',', '.')) || 0; }
let cashOrderTotal = 0;
// Con la comanda vacía (repasar un ticket, un cobro suelto que no es un
// pedido de la carta...) se puede escribir el total a mano — en cuanto hay
// algún producto en la comanda, ese importe manual se descarta sin más: el
// total vuelve a seguir siempre al pedido, como toda la vida.
let cobrarTotalManual = null;
function syncCashTotal(orderTotal) {
  if (orderTotal > 0) cobrarTotalManual = null;
  cashOrderTotal = (orderTotal <= 0 && cobrarTotalManual != null) ? cobrarTotalManual : orderTotal;
  document.getElementById('cobrar-modal-total').textContent = fmt(cashOrderTotal) + ' €';
  const totalRow = document.getElementById('cobrar-total-row');
  if (totalRow) totalRow.classList.toggle('editable', !cartHasAnyItem());
  updateChange();
}
// El "Cobrar" ya no vive encajado en la barra lateral (se quedaba corto
// de alto y no se podía bajar más para ver el teclado) — ahora es un
// modal a pantalla completa, con la misma calculadora de uniCenta.
function openCobrarModal() {
  syncCashTotal(currentOrderTotal());
  document.getElementById('cobrar-modal').classList.add('open');
}
// Toca el Total para escribirlo a mano — solo tiene sentido sin comanda
// (si hay productos, el total es el del pedido, sin excepciones).
function editCobrarTotal() {
  if (cartHasAnyItem()) { toast('El total sigue al pedido mientras haya productos en la comanda'); return; }
  openNumpad('cobrar-total-manual-input', 'Total a cobrar');
}
function setCobrarTotalManual(v) {
  cobrarTotalManual = parseCashNum(v);
  syncCashTotal(currentOrderTotal());
}
function closeCobrarModal() {
  document.getElementById('cobrar-modal').classList.remove('open');
}

// Entregado se compone de lo entregado por billetes/monedas tocados
// (cashEntregado) más lo que se esté escribiendo en el teclado sin
// confirmar todavía (keypadBuffer) — este último solo se ve en vivo,
// hasta que se pulsa "=" y pasa a sumarse de verdad a cashEntregado.
let cashEntregado = 0;
function tapDenom(btn, v) {
  cashEntregado += v;
  const n = (parseInt(btn.dataset.count, 10) || 0) + 1;
  btn.dataset.count = n;
  btn.classList.add('tapped');
  let badge = btn.querySelector('.denom-count');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'denom-count';
    badge.title = 'Tocar para quitar uno';
    // El contador tiene su propio onclick (con stopPropagation) para poder
    // quitar UNA unidad sin afectar al resto ni tener que pulsar "Limpiar"
    // y volver a marcar todo desde cero.
    badge.onclick = (e) => { e.stopPropagation(); untapDenom(btn, v); };
    btn.appendChild(badge);
  }
  badge.textContent = '×' + n;
  updateChange(parseCashNum(keypadBuffer));
}
function untapDenom(btn, v) {
  const n = (parseInt(btn.dataset.count, 10) || 0) - 1;
  const badge = btn.querySelector('.denom-count');
  if (n <= 0) {
    btn.dataset.count = '0';
    btn.classList.remove('tapped');
    if (badge) badge.remove();
  } else {
    btn.dataset.count = n;
    if (badge) badge.textContent = '×' + n;
  }
  cashEntregado = Math.max(0, cashEntregado - v);
  updateChange(parseCashNum(keypadBuffer));
}

// Teclado numérico táctil (igual que el de "Pagos" de uniCenta) — en el
// mostrador no hay teclado físico, así que escribir un importe exacto
// necesita el teclado táctil. Se escribe aquí dentro y, al pulsar "=", se
// SUMA a lo ya entregado (igual que tocar un billete/moneda suelta).
let keypadBuffer = '';
function keypadDigit(d) {
  if (d === ',' && keypadBuffer.includes(',')) return;
  if (keypadBuffer.replace(',', '').length >= 6) return; // hasta 999999, de sobra
  keypadBuffer += d;
  updateKeypadDisplay();
}
function keypadClear() {
  keypadBuffer = '';
  updateKeypadDisplay();
}
function updateKeypadDisplay() {
  const el = document.getElementById('cash-keypad-display');
  if (el) el.textContent = keypadBuffer || '0';
  // El cambio (y el Entregado) se ven al momento mientras se escribe, sin
  // tener que pulsar "=" primero — "=" sigue haciendo falta solo para que
  // ese importe quede sumado de verdad a lo entregado (por si se van
  // metiendo más billetes sueltos después).
  updateChange(parseCashNum(keypadBuffer));
}
function keypadEquals() {
  const val = parseCashNum(keypadBuffer);
  keypadBuffer = '';
  if (val > 0) cashEntregado += val;
  updateKeypadDisplay();
}
function clearCashReceived() {
  cashEntregado = 0;
  keypadBuffer = '';
  cobrarTotalManual = null;
  document.querySelectorAll('#cobrar-modal .denom-btn').forEach(btn => {
    btn.dataset.count = '0';
    btn.classList.remove('tapped');
    const badge = btn.querySelector('.denom-count');
    if (badge) badge.remove();
  });
  updateKeypadDisplay();
  syncCashTotal(currentOrderTotal());
}
function currentOrderTotal() {
  const el = document.getElementById('cart-total');
  return el ? parseFloat(el.textContent.replace(',', '.')) || 0 : 0;
}
function updateChange(previewExtra) {
  const total = cashOrderTotal;
  const shown = cashEntregado + (previewExtra || 0);
  document.getElementById('cash-entregado').textContent = fmt(shown) + ' €';
  const row = document.getElementById('cash-change-row');
  const label = document.getElementById('cash-change-label');
  const amountEl = document.getElementById('cash-change-amount');
  if (shown <= 0) {
    row.className = 'summary-row cambio';
    label.textContent = 'Cambio a devolver';
    amountEl.textContent = '0,00 €';
    return;
  }
  const change = shown - total;
  if (change < -0.001) {
    label.textContent = 'Faltan';
    amountEl.textContent = fmt(-change) + ' €';
    row.className = 'summary-row cambio short';
  } else {
    label.textContent = 'Cambio a devolver';
    amountEl.textContent = fmt(Math.max(0, change)) + ' €';
    row.className = 'summary-row cambio ok';
    // En cuanto se ha metido efectivo suficiente para cubrir el total, el
    // pedido se da por cobrado solo — no tiene sentido obligar a tocar
    // "PAGADO" a mano si la propia calculadora ya ha sacado el cambio a
    // devolver (el botón "Imprimir ticket" aparece con esto).
    if (total > 0 && !orderPaid) setOrderPaid(true);
  }
}

let clearedOrderSnapshot = null;
function clearOrder(silent) {
  const hadItems = cartHasAnyItem();
  if (hadItems && !silent) {
    clearedOrderSnapshot = {
      cart: { ...cart },
      custCart: JSON.parse(JSON.stringify(custCart)),
      extrasCart: JSON.parse(JSON.stringify(extrasCart)),
      orderDiscount: orderDiscount ? { ...orderDiscount } : null,
      lineDiscounts: JSON.parse(JSON.stringify(lineDiscounts)),
      name: document.getElementById('order-name').value,
      pickupTime: document.getElementById('pickup-time').value,
      paid: orderPaid,
      paymentMethod,
    };
  }
  cart = {}; custCart = {}; extrasCart = {}; orderDiscount = null; lineDiscounts = {};
  document.getElementById('order-name').value = '';
  document.getElementById('pickup-time').value = '';
  clearCashReceived();
  pedidoACobrarSinImprimir = null;
  setOrderPaid(false);
  setPaymentMethod('efectivo');
  renderMenu();
  renderCart();
  if (!silent) {
    if (hadItems) showUndoClearBar();
    else toast('Comanda vaciada');
  }
}
function showUndoClearBar() {
  const bar = document.getElementById('undo-clear-bar');
  bar.classList.add('show');
  clearTimeout(bar._timer);
  bar._timer = setTimeout(() => { bar.classList.remove('show'); clearedOrderSnapshot = null; }, 6000);
}
function undoClearOrder() {
  if (!clearedOrderSnapshot) return;
  cart = clearedOrderSnapshot.cart;
  custCart = clearedOrderSnapshot.custCart;
  extrasCart = clearedOrderSnapshot.extrasCart;
  orderDiscount = clearedOrderSnapshot.orderDiscount;
  lineDiscounts = clearedOrderSnapshot.lineDiscounts || {};
  document.getElementById('order-name').value = clearedOrderSnapshot.name || '';
  document.getElementById('pickup-time').value = clearedOrderSnapshot.pickupTime || '';
  setOrderPaid(!!clearedOrderSnapshot.paid);
  setPaymentMethod(clearedOrderSnapshot.paymentMethod || 'efectivo');
  clearedOrderSnapshot = null;
  const bar = document.getElementById('undo-clear-bar');
  clearTimeout(bar._timer);
  bar.classList.remove('show');
  renderMenu();
  renderCart();
  toast('↩️ Comanda restaurada');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CUSTOMIZER (Al Gusto / Bomba)
   ══════════════════════════════════════════════════════════════ */
let custType = null, custSelSauces = [], custSelIngredients = [], custExtraQueso = false, custExtraGratinado = false, custSelExtraSauces = [], custSelExtraIngredients = [], custEditKey = null;

function openCustomizer(id, editKey) {
  custEditKey = editKey || null;
  custType = id === 15 ? 'algusto' : 'bomba';
  const existing = custEditKey ? custCart[custEditKey] : null;
  if (existing) {
    custSelSauces = [...existing.sauces];
    custSelIngredients = [...existing.ingredients];
    custExtraQueso = !!existing.extraQueso;
    custExtraGratinado = !!existing.extraGratinado;
    custSelExtraSauces = [...(existing.extraSauces || [])];
    custSelExtraIngredients = [...(existing.extraIngredients || [])];
  } else {
    custSelSauces = []; custSelIngredients = []; custExtraQueso = false; custExtraGratinado = false; custSelExtraSauces = []; custSelExtraIngredients = [];
  }
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-error').style.display = 'none';
  document.getElementById('cust-confirm-btn').textContent = existing ? '✓ Guardar cambios' : '→ Añadir al pedido';
  updateCustExtraUI('queso', custExtraQueso);
  updateCustExtraUI('gratinado', custExtraGratinado);
  renderCustChips();
  renderCustExtrasSection();
  updateCustBadges();
  updateCustTotalPrice();
  document.getElementById('customizer-modal').classList.add('open');
}
// Si "Queso Mozzarella" ya está entre los ingredientes elegidos, no tiene
// sentido cobrar aparte por añadir queso — solo queda la opción de
// gratinar (ya tiene queso, solo falta pasarlo por el horno).
function custHasQuesoIngredient() { return custSelIngredients.some(isQuesoIngredient) || custSelExtraIngredients.some(isQuesoIngredient); }
function renderCustExtrasSection() {
  const hasQueso = custHasQuesoIngredient();
  const quesoLabel = document.getElementById('cust-queso-label');
  const gratinadoSub = document.getElementById('cust-gratinado-label').querySelector('.option-sub');
  quesoLabel.style.display = hasQueso ? 'none' : '';
  gratinadoSub.textContent = hasQueso ? '+0,50 €' : '+0,50 € · incluye gratinado del queso';
}
function closeCustomizer() { document.getElementById('customizer-modal').classList.remove('open'); custType = null; custEditKey = null; }

function custSelTotal() { return custSelSauces.length + custSelIngredients.length; }

function renderCustChips() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const sEl = document.getElementById('cust-sauces');
  const iEl = document.getElementById('cust-ingredients');
  sEl.innerHTML = CUST_SAUCES.map(n => {
    const sel = custSelSauces.includes(n);
    const extra = custSelExtraSauces.includes(n);
    const label = extra ? n + ' +' + fmt(priceOfSalsaExtra(n)) + '€' : n;
    return `<button class="chip ${sel ? 'selected' : ''} ${extra ? 'extra' : ''}" onclick="toggleCustSauce('${n.replace(/'/g, "\\'")}')">${label}</button>`;
  }).join('');
  iEl.innerHTML = sortEs(CUST_INGREDIENTS).map(n => {
    const sel = custSelIngredients.includes(n);
    const extra = custSelExtraIngredients.includes(n);
    const label = extra ? n + ' +' + fmt(priceOfPick({ type: 'ing', name: n })) + '€' : n;
    return `<button class="chip ${sel ? 'selected' : ''} ${extra ? 'extra' : ''}" onclick="toggleCustIng('${n.replace(/'/g, "\\'")}')">${label}</button>`;
  }).join('');
}
function toggleCustSauce(n) {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const iN = custSelSauces.indexOf(n);
  const iE = custSelExtraSauces.indexOf(n);
  if (iN >= 0) custSelSauces.splice(iN, 1);
  else if (iE >= 0) custSelExtraSauces.splice(iE, 1);
  else {
    const roomInLimit = (cfg.maxSauces === null || custSelSauces.length < cfg.maxSauces) && (cfg.maxTotal === null || custSelTotal() < cfg.maxTotal);
    if (roomInLimit) custSelSauces.push(n);
    else custSelExtraSauces.push(n); // fuera del límite incluido → se cobra aparte
  }
  renderCustChips(); updateCustBadges(); updateCustTotalPrice();
}
// Igual que con las salsas: pasarse del límite incluido ya no bloquea la
// selección — el ingrediente de más se marca como "extra" y se cobra
// aparte (como si se hubiera añadido en la patata normal), en vez de
// dejar el chip deshabilitado sin forma de elegirlo.
function toggleCustIng(n) {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const i = custSelIngredients.indexOf(n);
  const iE = custSelExtraIngredients.indexOf(n);
  if (i >= 0) custSelIngredients.splice(i, 1);
  else if (iE >= 0) custSelExtraIngredients.splice(iE, 1);
  else {
    const roomInLimit = (cfg.maxIngredients === null || custSelIngredients.length < cfg.maxIngredients) && (cfg.maxTotal === null || custSelTotal() < cfg.maxTotal);
    if (roomInLimit) custSelIngredients.push(n);
    else custSelExtraIngredients.push(n); // fuera del límite incluido → se cobra aparte
  }
  if (custHasQuesoIngredient() && custExtraQueso) {
    custExtraQueso = false;
    updateCustExtraUI('queso', false);
  }
  renderCustChips(); renderCustExtrasSection(); updateCustBadges(); updateCustTotalPrice();
}
function updateCustBadges() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const sauceExtraNote = custSelExtraSauces.length ? ' (+' + custSelExtraSauces.length + ' salsa extra)' : '';
  const ingExtraNote = custSelExtraIngredients.length ? ' (+' + custSelExtraIngredients.length + ' ingrediente' + (custSelExtraIngredients.length > 1 ? 's' : '') + ' extra)' : '';
  if (cfg.maxTotal !== null) {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length + sauceExtraNote;
    document.getElementById('cust-ing-badge').textContent = custSelTotal() + '/' + cfg.maxTotal + ingExtraNote;
  } else {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length + '/' + cfg.maxSauces + sauceExtraNote;
    document.getElementById('cust-ing-badge').textContent = custSelIngredients.length + '/' + cfg.maxIngredients + ingExtraNote;
  }
}
function toggleCustExtra(which) {
  if (which === 'queso') {
    custExtraQueso = !custExtraQueso;
    if (!custExtraQueso && custExtraGratinado) { custExtraGratinado = false; updateCustExtraUI('gratinado', false); }
  } else {
    custExtraGratinado = !custExtraGratinado;
    if (custExtraGratinado && !custExtraQueso && !custHasQuesoIngredient()) { custExtraQueso = true; updateCustExtraUI('queso', true); }
  }
  updateCustExtraUI(which, which === 'queso' ? custExtraQueso : custExtraGratinado);
  updateCustTotalPrice();
}
function updateCustExtraUI(which, on) {
  const el = document.getElementById('cust-extra-check-' + which);
  if (el) el.classList.toggle('on', on);
}
function updateCustTotalPrice() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  let p = cfg.price;
  if (custExtraQueso) p += 1;
  if (custExtraGratinado) p += 0.5;
  p += custSelExtraSauces.reduce((s, name) => s + priceOfSalsaExtra(name), 0);
  p += custSelExtraIngredients.reduce((s, n) => s + priceOfPick({ type: 'ing', name: n }), 0);
  document.getElementById('cust-price').textContent = fmt(p) + ' €';
}
function confirmCustomizer() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';
  if (cfg.maxTotal !== null && custSelTotal() === 0 && custSelExtraSauces.length === 0 && custSelExtraIngredients.length === 0) {
    errEl.textContent = 'Elige al menos 1 ingrediente o salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxTotal === null && custSelIngredients.length === 0 && custSelSauces.length === 0 && custSelExtraSauces.length === 0 && custSelExtraIngredients.length === 0) {
    errEl.textContent = 'Elige al menos 1 ingrediente';
    errEl.style.display = 'block';
    return;
  }
  const entry = {
    menuId: custType === 'algusto' ? 15 : 16,
    qty: 1,
    sauces: [...custSelSauces],
    ingredients: [...custSelIngredients],
    extraQueso: custExtraQueso,
    extraGratinado: custExtraGratinado,
    extraSauces: [...custSelExtraSauces],
    extraIngredients: [...custSelExtraIngredients],
  };
  const wasEdit = !!custEditKey;
  if (custEditKey && custCart[custEditKey]) {
    entry.qty = custCart[custEditKey].qty;
    entry.key = custEditKey;
    custCart[custEditKey] = entry;
  } else {
    const key = 'cust:' + custType + ':' + Date.now() + ':' + Math.random().toString(36).slice(2, 7);
    entry.key = key;
    custCart[key] = entry;
  }
  closeCustomizer();
  renderCart();
  toast(wasEdit ? '✅ Cambios guardados' : '✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CHEDDAR-BACON
   ══════════════════════════════════════════════════════════════ */
let cheddarCarne = null, cheddarSalsasExtra = {}, cheddarEditKey = null;
function openCheddarModal(editKey) {
  cheddarEditKey = editKey || null;
  const existing = cheddarEditKey ? extrasCart[cheddarEditKey] : null;
  cheddarCarne = existing ? existing.cheddarCarne : null;
  cheddarSalsasExtra = {};
  if (existing) (existing.salsasExtra || []).forEach(s => cheddarSalsasExtra[s] = true);
  ['picada', 'kebab'].forEach(k => document.getElementById('cheddar-check-' + k).classList.toggle('on', cheddarCarne === k));
  document.getElementById('cheddar-error').style.display = 'none';
  document.getElementById('cheddar-confirm-btn').textContent = existing ? '✓ Guardar cambios' : '→ Añadir al pedido';
  renderCheddarSalsasExtra();
  updateCheddarPrice();
  document.getElementById('cheddar-modal').classList.add('open');
}
function closeCheddarModal() { document.getElementById('cheddar-modal').classList.remove('open'); cheddarEditKey = null; }
function selectCheddarCarne(k) {
  cheddarCarne = k;
  ['picada', 'kebab'].forEach(x => document.getElementById('cheddar-check-' + x).classList.toggle('on', x === k));
  document.getElementById('cheddar-error').style.display = 'none';
}
function renderCheddarSalsasExtra() {
  const el = document.getElementById('cheddar-salsas-list');
  if (!el) return;
  el.innerHTML = CUST_SAUCES.map(s => {
    const slug = 'cheddar-salsa-' + s.replace(/[^a-z0-9]/gi, '_');
    const on = !!cheddarSalsasExtra[s];
    return `<label id="lbl-${slug}" class="option-row ${on ? 'on' : ''}" style="margin-bottom:0;padding:9px 10px" onclick="toggleCheddarSalsa('${s.replace(/'/g, "\\'")}')">
      <div><div class="option-title" style="font-size:13px">${s}</div><div class="option-sub">+${fmt(priceOfSalsaExtra(s))} €</div></div>
      <div class="option-check ${on ? 'on' : ''}" id="${slug}" style="width:20px;height:20px"></div>
    </label>`;
  }).join('');
}
function toggleCheddarSalsa(s) {
  cheddarSalsasExtra[s] = !cheddarSalsasExtra[s];
  renderCheddarSalsasExtra();
  updateCheddarPrice();
}
function updateCheddarPrice() {
  const item = MENU.find(m => m.id === CHEDDAR_ID);
  const extra = Object.entries(cheddarSalsasExtra).filter(([, on]) => on).reduce((s, [name]) => s + priceOfSalsaExtra(name), 0);
  document.getElementById('cheddar-price').textContent = fmt(item.price + extra) + ' €';
}
function confirmCheddar() {
  if (!cheddarCarne) {
    document.getElementById('cheddar-error').style.display = 'block';
    return;
  }
  const item = MENU.find(m => m.id === CHEDDAR_ID);
  const salsaList = Object.entries(cheddarSalsasExtra).filter(([, on]) => on).map(([s]) => s).sort();
  const key = 'ext:' + CHEDDAR_ID + ':' + cheddarCarne + (salsaList.length ? '_S' + salsaList.join('|') : '');
  let qtyToSet = 1;
  if (cheddarEditKey && extrasCart[cheddarEditKey]) {
    qtyToSet = extrasCart[cheddarEditKey].qty;
    delete extrasCart[cheddarEditKey];
  }
  if (extrasCart[key]) extrasCart[key].qty += qtyToSet;
  else extrasCart[key] = { menuId: CHEDDAR_ID, qty: qtyToSet, queso: false, gratinado: false, ingredientesExtra: [], salsasExtra: salsaList, basePrice: item.price, cheddarCarne, key };
  const wasEdit = !!cheddarEditKey;
  closeCheddarModal();
  renderCart();
  toast(wasEdit ? '✅ Cambios guardados' : '✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — EXTRAS (patatas 1-14: queso/gratinado + ingredientes extra)
   ══════════════════════════════════════════════════════════════ */
const NO_QUITAR_IDS_BASE = new Set([4, 5, 8, 20]); // Carbonara, Boloñesa, 4 Quesos y Boniato G.O.A.T. (queso de cabra): no se pueden quitar ni cambiar ingredientes
const MENU_QUITAR_OVERRIDES_KEY = 'comandas_menu_quitar_overrides_v1';
function loadMenuQuitarOverrides() { try { return JSON.parse(localStorage.getItem(MENU_QUITAR_OVERRIDES_KEY) || '{}'); } catch (e) { return {}; } }
// true = bloqueado (no se puede quitar/cambiar). Se puede ajustar por producto desde "🍽️ Carta".
function isQuitarBlocked(id) {
  const overrides = loadMenuQuitarOverrides();
  if (Object.prototype.hasOwnProperty.call(overrides, id)) return !!overrides[id];
  return NO_QUITAR_IDS_BASE.has(id);
}
const BONIATO_IDS = new Set([17, 18, 19, 20, 21, 51]); // no llevan queso/gratinado como extra, solo quitar ingredientes
const BONIATO_GOAT_ID = 20; // Boniato G.O.A.T. — el único con queso de cabra, va aparte en el stock
function parseBaseComponents(item) {
  if (item.components) return item.components;
  if (!item.desc) return [];
  let clean = item.desc.split(' · ')[0]; // quita coletillas tipo "· Salsa cocinada a diario"
  if (clean.includes(' + ')) return clean.split(' + ').map(s => s.trim()).filter(Boolean);
  const lastY = clean.lastIndexOf(' y ');
  if (lastY !== -1) clean = clean.slice(0, lastY) + ', ' + clean.slice(lastY + 3);
  return clean.split(',').map(s => s.trim()).filter(Boolean);
}

let extrasCurrentId = null, extrasQueso = false, extrasGratinado = false, extrasIngredientes = {}, extrasSalsas = {}, extrasQuitados = {}, extrasCambios = [], extrasEditKey = null;
let extrasPickSeq = 0, extrasIngOrder = {}, extrasSalsaOrder = {};

function getOrderedExtrasPicks() {
  const picks = [];
  Object.entries(extrasIngredientes).forEach(([ing, on]) => { if (on) picks.push({ type: 'ing', name: ing, seq: extrasIngOrder[ing] || 0 }); });
  Object.entries(extrasSalsas).forEach(([s, on]) => { if (on) picks.push({ type: 'salsa', name: s, seq: extrasSalsaOrder[s] || 0 }); });
  picks.sort((a, b) => a.seq - b.seq);
  return picks.map(p => ({ type: p.type, name: p.name }));
}

function openExtrasModal(id, editKey) {
  extrasEditKey = editKey || null;
  extrasCurrentId = id;
  const existing = extrasEditKey ? extrasCart[extrasEditKey] : null;
  extrasQueso = existing ? !!existing.queso : false;
  extrasGratinado = existing ? !!existing.gratinado : false;
  extrasIngredientes = {};
  extrasSalsas = {};
  extrasQuitados = {};
  extrasCambios = existing ? existing.cambios ? existing.cambios.map(c => ({ from: c.from, to: c.to })) : [] : [];
  extrasPickSeq = 0; extrasIngOrder = {}; extrasSalsaOrder = {};
  if (existing) {
    (existing.ingredientesExtra || []).forEach(i => extrasIngredientes[i] = true);
    (existing.salsasExtra || []).forEach(s => extrasSalsas[s] = true);
    (existing.quitados || []).forEach(q => extrasQuitados[q] = true);
    // Reconstruye el orden de selección para saber qué se cobra "extra" si se edita.
    // Si el pedido no lo guardó (versiones anteriores), usa el orden de los arrays tal cual.
    const order = (existing.pickOrder && existing.pickOrder.length) ? existing.pickOrder : [
      ...(existing.ingredientesExtra || []).map(name => ({ type: 'ing', name })),
      ...(existing.salsasExtra || []).map(name => ({ type: 'salsa', name })),
    ];
    order.forEach(p => {
      extrasPickSeq++;
      if (p.type === 'ing') extrasIngOrder[p.name] = extrasPickSeq; else extrasSalsaOrder[p.name] = extrasPickSeq;
    });
  }
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + fmt(item.price) + ' €';
  document.getElementById('extras-confirm-btn').textContent = existing ? '✓ Guardar cambios' : '→ Añadir al pedido';
  renderExtrasBody(item);
  updateExtrasTotalPrice();
  document.getElementById('extras-modal').classList.add('open');
}
function closeExtrasModal() {
  document.getElementById('extras-modal').classList.remove('open');
  extrasCurrentId = null; extrasEditKey = null;
  convertingSimpleId = null; // cerrar sin confirmar no debe tocar el carrito simple
}

// La salsa de cada patata es siempre el primer ingrediente de la
// descripción (p.ej. "Salsa philadelphia, york, huevo..."), pero no
// siempre lleva la palabra "salsa" en el nombre (Nata, Tomate frito,
// Mayonesa, Alioli, Aceite de oliva) — de ahí la lista aparte.
const SALSA_EXTRA_NAMES = new Set(['nata', 'tomate frito', 'mayonesa', 'alioli', 'aceite de oliva']);
function esComponenteSalsa(comp) {
  const c = comp.trim().toLowerCase();
  return c.includes('salsa') || SALSA_EXTRA_NAMES.has(c);
}
// "Salsa a elegir" (ej. Boniato Bacon) no es un ingrediente que se pueda
// quitar como los demás — es un hueco que hay que rellenar sí o sí con
// una salsa concreta antes de añadir el producto al pedido.
function isElegirSalsaComp(comp) { return comp.trim().toLowerCase() === 'salsa a elegir'; }
// 4 Quesos lleva los quesos ya mezclados (no se pueden quitar ni cambiar),
// pero la salsa base sí es un ingrediente suelto que se puede cambiar.
const SALSA_CAMBIABLE_AUNQUE_BLOQUEADO_IDS = new Set([8]);
function renderExtrasBody(item) {
  const isBoniato = BONIATO_IDS.has(item.id);
  const soloGratinado = EXTRAS_SOLO_GRATINADO.has(item.id);
  const baseComponents = parseBaseComponents(item);
  const ingredientesBloqueados = isQuitarBlocked(item.id);
  const canQuitar = !ingredientesBloqueados && baseComponents.length > 0;
  const salsaComponents = baseComponents.filter(esComponenteSalsa);
  const ingComponents = baseComponents.filter(c => !esComponenteSalsa(c));
  const canCambiarSalsaBloqueado = ingredientesBloqueados && !isBoniato
    && salsaComponents.length > 0 && SALSA_CAMBIABLE_AUNQUE_BLOQUEADO_IDS.has(item.id);
  let html = '';
  const salsaAElegir = baseComponents.find(isElegirSalsaComp);
  if (salsaAElegir) {
    const elegida = extrasCambios.find(c => c.from === salsaAElegir);
    if (elegida) {
      html += `<div class="section-label" style="margin-top:0">Salsa elegida</div>
        <div class="swap-list"><div class="swap-chip"><span>${escapeHtml(elegida.to)}</span><button onclick="removeExtraCambio(${extrasCambios.indexOf(elegida)})" title="Cambiar de salsa">✕</button></div></div>`;
    } else {
      html += `<div class="section-label" style="margin-top:0">Elige la salsa</div>
        <div class="swap-card">
          <select id="cambio-salsa-from" class="swap-select" style="display:none">
            <option value="${escapeHtml(salsaAElegir)}" selected>${escapeHtml(salsaAElegir)}</option>
          </select>
          <select id="cambio-salsa-to" class="swap-select" style="width:100%">${CUST_SAUCES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
          <button class="swap-add-btn" onclick="addExtraCambio('salsa')">✓ Elegir salsa</button>
        </div>`;
    }
  }
  if (canQuitar) {
    const quitarComponents = baseComponents.filter(c => !isElegirSalsaComp(c));
    if (quitarComponents.length) {
      html += `<div class="section-label"${salsaAElegir ? '' : ' style="margin-top:0"'}>Quitar ingredientes</div><div class="chip-grid">`;
      quitarComponents.forEach(comp => {
        const on = !!extrasQuitados[comp];
        html += `<button class="chip ${on ? 'quitado' : ''}" onclick="toggleExtraQuitar('${comp.replace(/'/g, "\\'")}')">${on ? '🚫 ' : ''}${escapeHtml(comp)}</button>`;
      });
      html += `</div>`;
    }
    if (!isBoniato) {
      if (ingComponents.length) {
        html += `<div class="section-label">Cambiar un ingrediente</div>`;
        html += `<div class="swap-card">
          <div class="swap-row">
            <select id="cambio-ing-from" class="swap-select">${ingComponents.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
            <span class="swap-arrow">→</span>
            <select id="cambio-ing-to" class="swap-select">${sortIngredientsQuesoLast(CUST_INGREDIENTS).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
          </div>
          <button class="swap-add-btn" onclick="addExtraCambio('ing')">+ Añadir cambio</button>
        </div>`;
      }
      if (salsaComponents.length) {
        html += `<div class="section-label">Cambiar salsa</div>`;
        html += `<div class="swap-card">
          <div class="swap-row">
            <select id="cambio-salsa-from" class="swap-select">${salsaComponents.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
            <span class="swap-arrow">→</span>
            <select id="cambio-salsa-to" class="swap-select">${CUST_SAUCES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
          </div>
          <button class="swap-add-btn" onclick="addExtraCambio('salsa')">+ Añadir cambio</button>
        </div>`;
      }
      if (extrasCambios.length) {
        html += `<div class="swap-list">` + extrasCambios.map((c, i) =>
          `<div class="swap-chip"><span>${escapeHtml(c.from)}</span><span class="swap-chip-arrow">→</span><span>${escapeHtml(c.to)}</span><button onclick="removeExtraCambio(${i})" title="Quitar cambio">✕</button></div>`
        ).join('') + `</div>`;
      }
    }
  } else if (canCambiarSalsaBloqueado) {
    html += `<div class="settings-help" style="margin-top:0">⚠️ Este producto lleva los quesos ya preparados · solo se puede cambiar la salsa.</div>`;
    html += `<div class="section-label">Cambiar salsa</div>`;
    html += `<div class="swap-card">
      <div class="swap-row">
        <select id="cambio-salsa-from" class="swap-select">${salsaComponents.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
        <span class="swap-arrow">→</span>
        <select id="cambio-salsa-to" class="swap-select">${CUST_SAUCES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
      </div>
      <button class="swap-add-btn" onclick="addExtraCambio('salsa')">+ Añadir cambio</button>
    </div>`;
    if (extrasCambios.length) {
      html += `<div class="swap-list">` + extrasCambios.map((c, i) =>
        `<div class="swap-chip"><span>${escapeHtml(c.from)}</span><span class="swap-chip-arrow">→</span><span>${escapeHtml(c.to)}</span><button onclick="removeExtraCambio(${i})" title="Quitar cambio">✕</button></div>`
      ).join('') + `</div>`;
    }
  } else if (ingredientesBloqueados) {
    html += `<div class="settings-help" style="margin-top:0">⚠️ Este producto lleva la mezcla ya preparada · no se pueden quitar ni cambiar ingredientes.</div>`;
  }
  if (!isBoniato) {
    const yaLlevaQueso = soloGratinado || extrasHasQuesoIngredient();
    // Las patatas con la mezcla ya preparada (Carbonara, Boloñesa, 4 Quesos)
    // no admiten nada más que gratinarlas — no tiene sentido añadir
    // ingredientes o salsas sueltas encima de una receta ya cerrada.
    const soloGratinar = isQuitarBlocked(item.id) && soloGratinado;
    if (!yaLlevaQueso) {
      html += `<label class="option-row" onclick="toggleExtra('queso')">
        <div><div class="option-title">🧀 Añadir queso mozzarella</div><div class="option-sub">+1,00 €</div></div>
        <div class="option-check ${extrasQueso ? 'on' : ''}"></div>
      </label>`;
    }
    html += `<label class="option-row" onclick="toggleExtra('gratinado')">
      <div><div class="option-title">🔥 Gratinar${yaLlevaQueso ? '' : ' (con queso)'}</div><div class="option-sub">+0,50 €${yaLlevaQueso ? '' : ' · incluye gratinado del queso'}</div></div>
      <div class="option-check ${extrasGratinado ? 'on' : ''}"></div>
    </label>`;
    if (!soloGratinar) {
      html += `<div class="section-label">Ingredientes extra</div><div class="ing-grid">`;
      sortIngredientsQuesoLast([...EXTRAS_ING_PRECIO1, ...EXTRAS_ING_PRECIO07]).forEach(ing => {
        const precio = priceOfIngExtra(ing);
        const on = !!extrasIngredientes[ing];
        html += `<label class="option-row ${on ? 'on' : ''}" style="margin-bottom:0;padding:9px 10px" onclick="toggleExtraIng('${ing.replace(/'/g, "\\'")}')">
          <div><div class="option-title" style="font-size:13px">${ing}</div><div class="option-sub">+${fmt(precio)} €</div></div>
          <div class="option-check ${on ? 'on' : ''}" style="width:20px;height:20px"></div>
        </label>`;
      });
      html += `</div>`;
      html += `<div class="section-label">Salsas extra</div><div class="ing-grid">`;
      CUST_SAUCES.forEach(s => {
        const on = !!extrasSalsas[s];
        html += `<label class="option-row ${on ? 'on' : ''}" style="margin-bottom:0;padding:9px 10px" onclick="toggleExtraSalsa('${s.replace(/'/g, "\\'")}')">
          <div><div class="option-title" style="font-size:13px">${s}</div><div class="option-sub">+${fmt(priceOfSalsaExtra(s))} €</div></div>
          <div class="option-check ${on ? 'on' : ''}" style="width:20px;height:20px"></div>
        </label>`;
      });
      html += `</div>`;
    }
  }
  // Guarda y restaura el scroll del modal: sin esto, cada vez que se marca
  // algo en "Ingredientes extra" / "Salsas extra" (más abajo del todo) el
  // innerHTML se reconstruye entero y el scroll salta solo hacia arriba —
  // parece que el modal "se cuelga" porque cada toque te devuelve arriba
  // en vez de dejarte seguir marcando donde estabas.
  const modalBox = document.querySelector('#extras-modal .modal-box');
  const scrollPos = modalBox ? modalBox.scrollTop : 0;
  document.getElementById('extras-options').innerHTML = html;
  if (modalBox) modalBox.scrollTop = scrollPos;
}
function toggleExtraQuitar(comp) {
  extrasQuitados[comp] = !extrasQuitados[comp];
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function addExtraCambio(tipo) {
  const from = document.getElementById(tipo === 'salsa' ? 'cambio-salsa-from' : 'cambio-ing-from').value;
  const to = document.getElementById(tipo === 'salsa' ? 'cambio-salsa-to' : 'cambio-ing-to').value;
  if (!from || !to || from === to) return;
  if (extrasCambios.some(c => c.from === from)) return; // ya hay un cambio para ese ingrediente
  if (extrasCambios.length >= 2) { toast('⚠️ Máximo 2 cambios de ingrediente'); return; }
  extrasCambios.push({ from, to });
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function removeExtraCambio(i) {
  extrasCambios.splice(i, 1);
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function extrasHasQuesoIngredient() { return Object.entries(extrasIngredientes).some(([name, on]) => on && isQuesoIngredient(name)); }
function toggleExtra(which) {
  const yaLlevaQueso = EXTRAS_SOLO_GRATINADO.has(extrasCurrentId) || extrasHasQuesoIngredient(); // ya lleva queso incluido
  if (which === 'queso') {
    extrasQueso = !extrasQueso;
    // Sin queso no hay nada que gratinar (salvo que la patata ya lo lleve de base/ingrediente).
    if (!extrasQueso && !yaLlevaQueso && extrasGratinado) extrasGratinado = false;
  } else {
    extrasGratinado = !extrasGratinado;
    // Gratinar necesita queso: si la patata no lo lleva ya, se añade solo.
    if (extrasGratinado && !yaLlevaQueso && !extrasQueso) extrasQueso = true;
  }
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function toggleExtraIng(ing) {
  const on = !extrasIngredientes[ing];
  extrasIngredientes[ing] = on;
  if (on) { extrasPickSeq++; extrasIngOrder[ing] = extrasPickSeq; } else { delete extrasIngOrder[ing]; }
  if (isQuesoIngredient(ing) && on && extrasQueso) extrasQueso = false; // ya está incluido, no cobrar aparte
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function toggleExtraSalsa(s) {
  const on = !extrasSalsas[s];
  extrasSalsas[s] = on;
  if (on) { extrasPickSeq++; extrasSalsaOrder[s] = extrasPickSeq; } else { delete extrasSalsaOrder[s]; }
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function updateExtrasTotalPrice() {
  const item = MENU.find(m => m.id == extrasCurrentId);
  if (!item) return;
  const ingList = Object.entries(extrasIngredientes).filter(([, on]) => on).map(([ing]) => ing);
  const salsaList = Object.entries(extrasSalsas).filter(([, on]) => on).map(([s]) => s);
  const quitadosCount = Object.values(extrasQuitados).filter(Boolean).length;
  const free = computeFreeSwapPasses(quitadosCount, extrasCambios.length);
  const core = computeExtrasCorePrice(item.price, ingList, salsaList, getOrderedExtrasPicks(), free);
  const p = core + (extrasQueso ? 1 : 0) + (extrasGratinado ? 0.5 : 0);
  document.getElementById('extras-total-price').textContent = fmt(p) + ' €';
  const noteEl = document.getElementById('extras-price-note');
  if (noteEl) noteEl.textContent = extrasAutoUpgradeLabel(ingList, salsaList);
}
function confirmExtras() {
  const id = extrasCurrentId;
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  const salsaAElegir = parseBaseComponents(item).find(isElegirSalsaComp);
  if (salsaAElegir && !extrasCambios.some(c => c.from === salsaAElegir)) {
    toast('🚫 Elige una salsa antes de añadir ' + item.name);
    return;
  }
  const ingList = Object.entries(extrasIngredientes).filter(([, on]) => on).map(([ing]) => ing).sort();
  const salsaList = Object.entries(extrasSalsas).filter(([, on]) => on).map(([s]) => s).sort();
  const quitadosList = Object.entries(extrasQuitados).filter(([, on]) => on).map(([q]) => q).sort();
  const cambiosList = extrasCambios.map(c => ({ from: c.from, to: c.to }));
  const pickOrder = getOrderedExtrasPicks();
  const sig = (extrasQueso ? 'Q' : '') + (extrasGratinado ? 'G' : '')
    + (ingList.length ? 'I' + ingList.join('|') : '')
    + (salsaList.length ? 'S' + salsaList.join('|') : '')
    + (quitadosList.length ? 'X' + quitadosList.join('|') : '')
    + (cambiosList.length ? 'C' + cambiosList.map(c => c.from + '>' + c.to).join('|') : '') || 'BASE';
  const key = 'ext:' + id + ':' + sig;
  let qtyToSet = 1;
  if (extrasEditKey && extrasCart[extrasEditKey]) {
    qtyToSet = extrasCart[extrasEditKey].qty;
    delete extrasCart[extrasEditKey];
  }
  if (extrasCart[key]) extrasCart[key].qty += qtyToSet;
  else extrasCart[key] = { menuId: id, qty: qtyToSet, queso: extrasQueso, gratinado: extrasGratinado, ingredientesExtra: ingList, salsasExtra: salsaList, quitados: quitadosList, cambios: cambiosList, pickOrder, basePrice: item.price, key };
  // Se estaba personalizando una unidad que ya estaba en el carrito simple
  // (tocando su nombre) — se retira de ahí, ya está aquí personalizada.
  if (convertingSimpleId === id) {
    if (cart[id] > 1) cart[id] -= 1; else delete cart[id];
    convertingSimpleId = null;
  }
  const wasEdit = !!extrasEditKey;
  closeExtrasModal();
  renderCart();
  toast(wasEdit ? '✅ Cambios guardados' : '✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   TICKET — construcción del documento (líneas ya formateadas)
   Se usa TANTO para la vista previa / diálogo de impresión (texto
   monoespaciado) COMO para los bytes ESC/POS de la impresora térmica,
   así lo que se ve en pantalla es exactamente lo que sale impreso.
   ══════════════════════════════════════════════════════════════ */
// Misma clave y mismos campos que la configuración del ticket en el panel
// de administración de la web de pedidos (pedidos/src/admin-config.js),
// así que si esta página se abre alguna vez en el mismo navegador que el
// panel, comparten la configuración automáticamente. "modoImpresion" es
// el único campo propio de esta herramienta offline (no existe en la web,
// que siempre imprime a través de Firebase).
const TICKET_CONFIG_KEY = 'dpf_ticket_config';
const TICKET_CONFIG_DEFAULTS = {
  nombre: 'DULCE PATATA FOOD',
  direccion: 'Carretera de Málaga 111, Granada',
  telefono: '604 82 31 80',
  nif: '77558832A',
  despedida: '¡Gracias por tu pedido! 🥔',
  textoPago: 'Pagar en caja',
  anchoPapel: 80,
  // Ajuste fino (+/-) sobre las columnas de texto del ticket — cada
  // impresora/fuente cabe un pelín distinto en el mismo ancho de papel.
  // +4 de partida porque en la tienda, con 58mm/32 columnas "de libro", el
  // precio se quedaba corto del borde derecho (huelgo visible después del
  // importe) — se puede seguir afinando desde Ajustes sin reinstalar nada.
  columnasAjuste: 4,
  copias: 1,
  autoImprimir: true,
  modoImpresion: 'auto',
  printerDeviceName: '', // app de escritorio: qué impresora de Windows usar en impresión silenciosa ('' = la predeterminada)
  copiaAutoCadaDias: 1, // días entre copias automáticas; 0 = desactivada — ver "Copia automática" más abajo
};
function getTicketConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(TICKET_CONFIG_KEY) || '{}');
    return Object.assign({}, TICKET_CONFIG_DEFAULTS, saved);
  } catch (e) { return Object.assign({}, TICKET_CONFIG_DEFAULTS); }
}
function saveTicketConfig(cfg) { localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg)); }

function getPaperWidthChars() {
  const cfg = getTicketConfig();
  const base = cfg.anchoPapel == 58 ? 32 : 48;
  return Math.max(20, base + (parseInt(cfg.columnasAjuste, 10) || 0));
}

// El tamaño de página de impresión (@page) no estaba fijado por CSS — en
// el diálogo de impresión, Chrome recuerda el 58/80mm que elijas a mano la
// primera vez, pero la impresión SILENCIOSA (sin diálogo, ver printOrder)
// no pasa por ahí: sin este @page explícito, usa el tamaño por defecto del
// driver de Windows, que puede no ser el del rollo de la impresora y hacer
// que el trabajo llegue mal dimensionado (la impresora "hace clic" pero no
// saca nada). Se aplica al cargar la página y cada vez que se cambia el
// ancho de papel en Ajustes.
function applyPrintPageSize() {
  let styleEl = document.getElementById('dynamic-page-size');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-page-size';
    document.head.appendChild(styleEl);
  }
  const widthMm = getTicketConfig().anchoPapel == 58 ? 58 : 80;
  styleEl.textContent = `@media print { @page { size: ${widthMm}mm auto; } }`;
}

// Aplica el descuento de línea (si lo hay) de esa key al item ya
// construido: reduce su subtotal (y displaySubtotal, si lo tiene, para que
// el precio impreso sea coherente) y añade una línea de texto sin importe
// propio anotando el descuento — igual que se ve en el carrito.
function applyLineDiscountToTicketItem(item, key) {
  const discount = lineDiscounts[key];
  if (!discount) return item;
  const discAmt = computeDiscountAmount(item.subtotal, discount);
  if (discAmt <= 0) return item;
  item.subtotal -= discAmt;
  if (item.displaySubtotal !== undefined) item.displaySubtotal -= discAmt;
  item.extras = [...(item.extras || []), { name: discountLineLabel(discount, true) + ' (-' + fmt(discAmt) + '€)' }];
  return item;
}
function buildOrderObject(preview) {
  const items = [];
  Object.entries(cart).forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    items.push(applyLineDiscountToTicketItem(
      { name: item.name, qty, subtotal: item.price * qty, extras: [], _rank: categoryRank(item.cat), _menuId: item.id },
      simpleLineKey(item.id)));
  });
  Object.values(custCart).filter(c => c.qty > 0).forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const extraIngPrice = (c.extraIngredients || []).reduce((s, n) => s + priceOfPick({ type: 'ing', name: n }), 0);
    const extraSaucePrice = (c.extraSauces || []).reduce((s, name) => s + priceOfSalsaExtra(name), 0);
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + extraSaucePrice + extraIngPrice;
    // En el ticket el orden es siempre fijo, sin importar en qué momento
    // se eligió cada cosa: primero todas las salsas (incluidas y extra),
    // luego los ingredientes (incluidos y extra), y el queso/gratinado
    // siempre al final.
    const extras = [
      ...c.sauces.map(n => ({ name: n })),
      ...(c.extraSauces || []).map(s => ({ name: s, price: priceOfSalsaExtra(s), underline: true })),
      ...quesoLastKeepOrder(c.ingredients).map(n => ({ name: n })),
      ...quesoLastKeepOrder(c.extraIngredients || []).map(n => ({ name: n, price: priceOfPick({ type: 'ing', name: n }), underline: true })),
    ];
    if (c.extraQueso) extras.push({ name: 'Queso', price: 1, underline: true });
    if (c.extraGratinado) extras.push({ name: 'Gratinado', price: 0.5, underline: true });
    // La línea principal muestra solo el precio de la Al Gusto/Bomba en sí
    // (sus salsas/ingredientes ya van incluidos); queso/gratinado/salsa
    // extra van cada uno en su línea con su propio precio.
    items.push(applyLineDiscountToTicketItem(
      { name: item.name, qty: c.qty, subtotal: unitPrice * c.qty, displaySubtotal: item.price * c.qty, extras, _rank: categoryRank(item.cat), _menuId: item.id },
      c.key));
  });
  Object.values(extrasCart).filter(c => c.qty > 0).forEach(c => {
    const baseItem = MENU.find(m => m.id == c.menuId);
    items.push(applyLineDiscountToTicketItem({
      name: getExtrasItemLabel(c), qty: c.qty,
      subtotal: getExtrasItemPrice(c) * c.qty,
      displaySubtotal: getExtrasItemBaseSubtotal(c) * c.qty,
      extras: getExtrasItemTicketExtras(c),
      _rank: categoryRank(baseItem ? baseItem.cat : ''),
      _menuId: c.menuId,
    }, c.key));
  });
  items.sort((a, b) => a._rank - b._rank);
  items.forEach(it => delete it._rank);
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const discountAmount = computeDiscountAmount(subtotal, orderDiscount);
  if (discountAmount > 0) {
    items.push({ name: discountLineLabel(orderDiscount, true), qty: 1, subtotal: -discountAmount, extras: [] });
  }
  const total = items.reduce((s, it) => s + it.subtotal, 0);
  return {
    num: preview ? peekNextOrderNum() : getNextOrderNum(),
    time: new Date().toLocaleString('es-ES'),
    name: document.getElementById('order-name').value.trim(),
    pickupTime: document.getElementById('pickup-time').value.trim(),
    notes: '',
    paid: orderPaid,
    paymentMethod: orderPaid ? paymentMethod : null,
    items,
    total,
  };
}

/* ── Ticket — igual que el que imprime pedidos/js/index.js en la tienda
   (el programa que corre en el ordenador conectado a la impresora): mismo
   logo, mismos separadores de 48 guiones, mismo orden de bloques, mismo
   formato de líneas de producto y el mismo "doblado" de acentos a ASCII
   (esa impresora no usa codepage, solo entiende ASCII plano). Un único
   buildTicketBlocks() alimenta tanto la vista previa / diálogo de
   impresión como los bytes ESC/POS de la impresora térmica, así lo que
   se ve en pantalla es exactamente lo que sale impreso. ── */
// OJO: el separador tiene que medir EXACTAMENTE el ancho configurado
// (getPaperWidthChars()) — antes eran 48 guiones fijos, así que en 58mm (o
// en cualquier ajuste fino que no diera justo 48) la propia impresora
// partía la línea sola, dejando un trozo de guiones suelto en la línea de
// abajo (justo lo que se veía en un ticket real de la tienda).
// "€" nunca debe aparecer en un texto ya troceado/alineado: al convertirlo
// a "EUR" (3 caracteres) después de calcular el ancho, la línea se pasaba
// del ancho real de la impresora y esta partía "EUR" por la mitad al
// ajustar de línea sola. Por eso fmtEur() escribe "EUR" desde
// el principio, antes de ningún cálculo de columnas.
const ACCENT_FOLD = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','ñ':'n','Ñ':'N','ü':'u','Ü':'U','¡':'!','¿':'?' };
function foldAccents(str) {
  const out = [];
  for (const c of String(str)) {
    if (ACCENT_FOLD[c] !== undefined) { out.push(ACCENT_FOLD[c]); continue; }
    if (c.codePointAt(0) > 255) continue; // quita emojis y símbolos que la impresora no entiende
    out.push(c);
  }
  return out.join('');
}
function fmtEur(n) { return n.toFixed(2) + ' EUR'; }

// Coloca un texto y un precio en la misma línea si caben (precio a la
// derecha); si no caben, el texto se trunca y el precio baja a la línea
// siguiente — igual que hace la impresora física.
function twoCol(left, right, width) {
  const spaces = width - left.length - right.length;
  if (spaces >= 0) return [left + ' '.repeat(spaces) + right];
  return [left.substring(0, width), ' '.repeat(Math.max(0, width - right.length)) + right];
}

// Divide un producto (y sus extras) en líneas de texto, en mayúsculas,
// igual que sale en un ticket real: "1x PATATA SIMPLE      3.00 EUR" y
// cada extra con su propio precio alineado a la derecha, ej.
// "  - QUESO                     +1.00 EUR".
function formatItemLines(item, width) {
  const nombre = foldAccents(item.name || '').toUpperCase();
  const precio = fmtEur((item.displaySubtotal !== undefined ? item.displaySubtotal : item.subtotal) || 0);
  const prefix = item.qty + 'x ';
  const lines = twoCol(prefix + nombre, precio, width).map(text => ({ text, underlineStart: 0, underlineLen: 0 }));
  const exPrefix = '  - ';
  (item.extras || []).forEach(ex => {
    const exNombre = foldAccents(ex.name).toUpperCase();
    const label = exPrefix + exNombre;
    if (ex.price) {
      const extraLines = twoCol(label, '+' + fmtEur(ex.price), width);
      // Solo se subraya el nombre del producto en sí — ni el "  - " de
      // delante, ni los espacios de relleno, ni el precio, aunque vayan
      // pegados en el mismo string por la alineación a dos columnas.
      extraLines.forEach((text, i) => {
        const underlineLen = (ex.underline && i === 0) ? Math.max(0, Math.min(exNombre.length, text.length - exPrefix.length)) : 0;
        lines.push({ text, underlineStart: exPrefix.length, underlineLen });
      });
    } else {
      const text = label.substring(0, width);
      const underlineLen = ex.underline ? Math.max(0, Math.min(exNombre.length, text.length - exPrefix.length)) : 0;
      lines.push({ text, underlineStart: exPrefix.length, underlineLen });
    }
  });
  return lines;
}

// Construye el ticket como una lista de bloques en el mismo orden que
// imprimirUnaCopia(): {logo:true} o {text, align, big, bold, notesLabel}.
function buildTicketBlocks(order) {
  const cfg = getTicketConfig();
  const width = getPaperWidthChars();
  const divider = '-'.repeat(width);
  const B = [];
  B.push({ logo: true });
  B.push({ text: foldAccents(cfg.nombre), align: 'center', big: true });
  B.push({ text: foldAccents(cfg.direccion), align: 'center' });
  B.push({ text: foldAccents(cfg.telefono), align: 'center' });
  B.push({ text: 'NIF: ' + foldAccents(cfg.nif), align: 'center' });
  B.push({ text: divider, align: 'center' });
  B.push({ text: foldAccents((order.name || '').toUpperCase()), align: 'center', big: true });
  B.push({ text: divider, align: 'center' });
  B.push({ text: foldAccents('PEDIDO ' + order.num), align: 'center', big: true });
  B.push({ text: foldAccents(order.time), align: 'center' });
  if (order.pickupTime) B.push({ text: foldAccents('RECOGIDA: ' + order.pickupTime), align: 'center', big: true });
  B.push({ text: divider, align: 'center' });
  order.items.forEach(it => {
    formatItemLines(it, width).forEach(line => B.push({ text: line.text, align: 'left', underlineStart: line.underlineStart, underlineLen: line.underlineLen }));
  });
  B.push({ text: divider, align: 'left' });
  B.push({ text: fmtEur(order.total || 0), align: 'center', big: true });
  B.push({ text: order.paid ? 'PAGADO' : 'NO PAGADO', align: 'center', big: true, paidStatus: order.paid ? 'yes' : 'no' });
  if (order.paid) {
    B.push({ text: '(' + (order.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo') + ')', align: 'center' });
  }
  B.push({ text: foldAccents(cfg.textoPago), align: 'center' });
  if (order.notes) {
    B.push({ text: divider, align: 'left' });
    B.push({ text: 'NOTAS: ' + foldAccents(order.notes), align: 'left', notesLabel: true });
  }
  B.push({ text: divider, align: 'center' });
  B.push({ text: foldAccents(cfg.despedida), align: 'center' });
  B.push({ text: 'IVA incluido 10%', align: 'center' });
  return B;
}

/* ── Resumen de caja (fin de día) — usa el mismo formato de "blocks" que
   buildTicketBlocks(), así que reutiliza sin cambios toda la maquinaria de
   vista previa / ESC-POS / impresión de un pedido normal. No toca el
   historial ni la numeración de pedidos: es solo un ticket informativo. ── */
function buildCajaResumenBlocks(fecha) {
  const cfg = getTicketConfig();
  const width = getPaperWidthChars();
  const divider = '-'.repeat(width);
  const fondo = loadCajaFondo(fecha);
  const t = loadCajaTotales(fecha);
  const facturado = t.efectivo + t.tarjeta + t.pendiente;
  const esperadoCajon = fondo + t.efectivo;
  const fechaFmt = foldAccents(new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  const horaFmt = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const B = [];
  B.push({ logo: true });
  B.push({ text: foldAccents(cfg.nombre), align: 'center', big: true });
  B.push({ text: divider, align: 'center' });
  B.push({ text: 'RESUMEN DE CAJA', align: 'center', big: true });
  B.push({ text: fechaFmt, align: 'center' });
  B.push({ text: 'Impreso a las ' + horaFmt, align: 'center' });
  B.push({ text: divider, align: 'left' });
  B.push({ text: 'Pedidos: ' + t.count, align: 'left' });
  B.push({ text: 'Fondo inicial: ' + fmtEur(fondo), align: 'left' });
  B.push({ text: 'Efectivo cobrado: ' + fmtEur(t.efectivo), align: 'left' });
  B.push({ text: 'Tarjeta cobrada: ' + fmtEur(t.tarjeta), align: 'left' });
  if (t.pendiente > 0) {
    B.push({ text: 'PENDIENTE DE COBRO: ' + fmtEur(t.pendiente), align: 'left', paidStatus: 'no' });
  }
  B.push({ text: divider, align: 'left' });
  B.push({ text: 'TOTAL FACTURADO: ' + fmtEur(facturado), align: 'left', big: true });
  B.push({ text: 'EFECTIVO ESPERADO EN CAJA:', align: 'center' });
  B.push({ text: fmtEur(esperadoCajon), align: 'center', big: true });
  if (t.pendiente > 0) {
    B.push({ text: divider, align: 'center' });
    B.push({ text: 'Ojo: hay pedidos sin cobrar.', align: 'center' });
    B.push({ text: 'Si se cobraron a mano sin marcarlos', align: 'center' });
    B.push({ text: 'pagados aqui, la caja no cuadrara.', align: 'center' });
  }
  B.push({ text: divider, align: 'center' });
  return B;
}

/* ── Vista previa en pantalla / diálogo de impresión (HTML) ── */
function blocksToPreviewHTML(blocks) {
  let html = '';
  blocks.forEach(b => {
    if (b.logo) {
      html += '<div style="text-align:center;margin-bottom:2px"><img src="img/logo.png" alt="" style="width:110px;height:110px;object-fit:contain"></div>';
      return;
    }
    if (b.notesLabel) {
      const idx = b.text.indexOf(': ') + 2;
      html += '<div style="text-align:' + b.align + '"><b>' + escapeHtml(b.text.slice(0, idx)) + '</b>' + escapeHtml(b.text.slice(idx)) + '</div>';
      return;
    }
    let style = 'text-align:' + b.align + ';font-weight:' + (b.big ? 'bold' : 'normal') + ';font-size:' + (b.big ? '1.5em' : '1em') + ';white-space:pre';
    if (b.paidStatus) style += ';color:' + (b.paidStatus === 'yes' ? '#2e8b57' : '#c0392b');
    // El subrayado cubre solo el nombre del extra (underlineStart..+len)
    // — ni el "  - " de delante, ni los espacios de relleno, ni el precio.
    const uEnd = b.underlineStart + b.underlineLen;
    const content = b.underlineLen
      ? escapeHtml(b.text.slice(0, b.underlineStart)) + '<span style="text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:1px">' + escapeHtml(b.text.slice(b.underlineStart, uEnd)) + '</span>' + escapeHtml(b.text.slice(uEnd))
      : (escapeHtml(b.text) || '&nbsp;');
    html += '<div style="' + style + '">' + content + '</div>';
  });
  return html;
}
function buildTicketPreviewHTML(order) {
  return blocksToPreviewHTML(buildTicketBlocks(order));
}
function renderTicketPreview(order) {
  document.getElementById('ticket-html-content').innerHTML = buildTicketPreviewHTML(order);
}

/* ── Ver ticket sin imprimir (la impresión directa por USB no abre
   ningún diálogo, así que esta es la única forma de comprobar el
   ticket antes o después de imprimirlo). ── */
function peekNextOrderNum() {
  const today = new Date().toISOString().slice(0, 10);
  let data;
  try { data = JSON.parse(localStorage.getItem(ORDER_COUNTER_KEY) || '{}'); } catch (e) { data = {}; }
  if (data.date !== today) data = { date: today, n: 0 };
  return 'C' + String(data.n + 1).padStart(3, '0');
}
function previewTicket() {
  if (!cartHasAnyItem()) { toast('La comanda está vacía'); return; }
  openTicketView(buildOrderObject(true));
}
function openTicketView(order) {
  document.getElementById('ticket-view-content').innerHTML = buildTicketPreviewHTML(order);
  document.getElementById('ticket-view-modal').classList.add('open');
}
function closeTicketView() { document.getElementById('ticket-view-modal').classList.remove('open'); }

/* ── Bytes ESC/POS para la impresora térmica (mismo logo e idVendor/
   idProduct que pedidos/js/index.js — el propio programa de la tienda). ── */
const LOGO_W = 384, LOGO_H = 384;
const LOGO_B64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAH///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAf///////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////AAAD/////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///+AAAP/////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////+AAA///////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////8AAD///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////4AAP///////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////4AAf///////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////wAB/////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAD/////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////gAH/////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////gAf/////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////AA//////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////AB///////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////AD///////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////+AH///////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////+Af///////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////+Af///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////8A////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////8B/////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////8D/////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////4H/////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////4P/////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////////4P/////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////4f/////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////4//////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////////x//////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////////x//////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////z///////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////z///////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////3///////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////3///////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////////+AAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////////4B///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////////wf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////////D/////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////8f/////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////5//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////n///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAH////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAH////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAB///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////+B///////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////gAH//AB//////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///+AAB/4AAP/////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAA/gAAD/////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD////wH8APAAAB/////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAP////h//gEA//Af////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAf////H//8AH//4P////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAA////+f//+Af//+H////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAB////9////h////j////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////////z////z////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////////9////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAB///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAH////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAH////////n/////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAH////////j////v////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////+B////H////////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////8Af//8D////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////wAP//wB///////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////AAB//AA///////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////4AAAHgAAP//////////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAD/////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////wAAAAAAAAAAf/g//////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAAP////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAD////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAf//v////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//wAAAAAAAAAAAAAAAAOAP////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//wAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAP////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAP////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAP////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAH////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAH////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAAAAAAAAAAAAAAAAAH////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAfgAAAAAAAAAAAAAAD////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/wAAAAAAAP4AAAAAD////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAD/4AAAAAAAf+AAAAAB////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAH/8AAAAAAA//AAAAAB////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAH/8AAAAAAB//AAAAAA////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAP/+AAAAAAB//gAAAAAf///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAP/+AAAAAAD//gAAAAAP///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAP/+AAAAAAD//wAAAAAP///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAP//AAAAAAD//wAAAAAP///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAf//AAAAAAH//wAAAAAP///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAf//AAAAAAH//wAAAAAP///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAf//AAAAAAH//wAAAAAf///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAf//AAAAAAH//wAAAAAf///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAf//AAAAAAH//wAAAAAf///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAf/+AAAAAAH//wAAAAAf//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAP/+AAAAAAH//wAAAAAf//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAP/+AAAAAAD//wAAAAAf//+Af/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAP/+AAAAAAD//gAAAAAf//4AH/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAH/8AAAAAAD//gAAAAAf//wAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAH/4AAAAAAD//gAAAAAf//gAB//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAD/4AAAAAAB//AAAAAAf//AAB//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAB/wAAAAAAA/+AAAAAA//+AAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAAfAAAAAAAAf8AAAAAA//8AAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAAAAAAAAAAAP4AAAAAA//8AAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAAAAAAAAAAAAAAAAAAA//8AAAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAA//4AAAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAA//4AAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAA//4AAAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAB//wAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAB//wDgAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAB//wH4Af/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAB//wP4Af/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAB/4AA//AAAAAAAAB//gP8A//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAP/+AH//wAAAAAAAB//gf8A//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAA///gP//8AAAAAAAB//gf8A//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAD///w////AAAAAAAD//gf8A//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAH///5////wAAAAAAD//gf8B//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAf////////4AAAAAAD//gf8B/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAA/////////+AAAAAAD//gP4B/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAD//////////AAAAAAD//gP4D/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAAH//////////wAAAAAH//AHwD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/w8Af//////////8AAAAAH//AAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/x/D////////////ABgAAH//AAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/x//////////////4PwAAH//AAAP/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/x////////////////4AAH//AAAf/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/h////////////////4AAP//AAA//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/h////////////////4AAP//AAB//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/h////////////////wAAP//AAB//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/g////////////////wAAP//AAH//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/w////////////////wAAf/+AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/w////////////////gAAf/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wf///////////////AAAf/+AB//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wP///////////////AAAf//gf//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wP//////////////+AAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wH//////////////8AAA///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wD//////////////4AAA///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wB//////////////wAAA///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wA//////////////AAAB///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAP////////////+AAAB//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAD////////////4AAAB//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAf//////////+AAAAD//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAD//////////8AAAAD//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAD//////////8AAAAD/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAB//////////8AAAAH/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAB//////////8AAAAH////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAB/////////v4AAAAH///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAB//3/////7v4AAAAP///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAA////P3///v4AAAAP///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAA//////////wAAAAP///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAA/////v////wAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAAf/////////gAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAAf///vf//+/gAAAA////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAAP/f/v/////AAAAA////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAAP///u/////AAAAB////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAAH///t////+AAAAB////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAAH////////8AAAAD////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAD/v//////8AAAAD////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAB////////4AAAAH////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAA////////wAAAAH////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAA////////gAAAAP////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAf/////3/AAAAAf////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/wAAAP/P///f+AAAAAf////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAAAH/7//9/8AAAAA/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAD/+//P/4AAAAB/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAB//8H//wAAAAD////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAA//////AAAAAD////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAP////+AAAAAH////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//AAAAH////4AAAAAP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAB////gAAAAAf////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAAP//+AAAAAA/////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAB//gAAAAAB/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/4AAAAAAAAAAAAAD/////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/8AAAEAAAAAAAAAH/////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AAAHAAAIAAAAAf/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//AAAH8AA4AAAAA/////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAH///4AAAAB/////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//4AAH///wAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+AAH///wAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//AAH///wAAAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//wAH///gAAAD//////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//8AH///gAAAP//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AD///AAAA//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4D///AAAD//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////D//+AAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////8AAD///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////4AB////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////4D/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
let _logoBytesCache = null;
function getLogoBytes() {
  if (_logoBytesCache) return _logoBytesCache;
  const bin = atob(LOGO_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  _logoBytesCache = bytes;
  return bytes;
}
class EscPosBuilder {
  constructor() { this.bytes = []; }
  raw(arr) { for (const b of arr) this.bytes.push(b); return this; }
  init() { return this.raw([0x1B, 0x40]); }
  center() { return this.raw([0x1B, 0x61, 0x01]); }
  left() { return this.raw([0x1B, 0x61, 0x00]); }
  big() { return this.raw([0x1B, 0x21, 0x30]); }
  normal() { return this.raw([0x1B, 0x21, 0x00]); }
  bold(on) { return this.raw([0x1B, 0x45, on ? 1 : 0]); }
  underline(on) { return this.raw([0x1B, 0x2D, on ? 2 : 0]); }
  text(str) { const s = String(str); for (let i = 0; i < s.length; i++) this.bytes.push(s.charCodeAt(i) & 0xFF); return this; }
  newline() { return this.raw([0x0A]); }
  logo() {
    this.center();
    const bpr = (LOGO_W + 7) >> 3;
    this.raw([0x1D, 0x76, 0x30, 0x00, bpr & 0xFF, (bpr >> 8) & 0xFF, LOGO_H & 0xFF, (LOGO_H >> 8) & 0xFF]);
    const logoBytes = getLogoBytes();
    for (let i = 0; i < logoBytes.length; i++) this.bytes.push(logoBytes[i]);
    return this;
  }
  cut() { return this.raw([0x1D, 0x56, 0x42, 0x00]); }
  toBytes() { return new Uint8Array(this.bytes); }
}
// Uint8Array -> base64, para poder mandar los bytes ESC/POS a través de IPC
// (la impresión RAW de la app de escritorio) como un string normal. En
// trozos, para no reventar el límite de argumentos de String.fromCharCode
// con tickets largos.
function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
function blocksToEscPosBytes(blocks) {
  const b = new EscPosBuilder();
  b.init();
  blocks.forEach(blk => {
    if (blk.logo) { b.logo(); return; }
    blk.align === 'center' ? b.center() : b.left();
    blk.big ? b.big() : b.normal();
    if (blk.notesLabel) {
      const idx = blk.text.indexOf(': ') + 2;
      b.bold(true); b.text(blk.text.slice(0, idx)); b.bold(false); b.text(blk.text.slice(idx));
    } else if (blk.underlineLen) {
      // Solo se subraya el nombre del extra (underlineStart..+underlineLen)
      // — ni el "  - " de delante, ni los espacios de relleno, ni el
      // precio que va detrás.
      const uEnd = blk.underlineStart + blk.underlineLen;
      b.text(blk.text.slice(0, blk.underlineStart));
      b.underline(true); b.text(blk.text.slice(blk.underlineStart, uEnd)); b.underline(false);
      b.text(blk.text.slice(uEnd));
    } else {
      b.text(blk.text);
    }
    b.newline();
  });
  b.normal(); b.left();
  b.text('\n\n\n');
  b.cut();
  return b.toBytes();
}
function buildEscPosBytes(order) {
  return blocksToEscPosBytes(buildTicketBlocks(order));
}

/* ── Numeración diaria de comandas ── */
const ORDER_COUNTER_KEY = 'dpf_comandas_counter';
function getNextOrderNum() {
  const today = new Date().toISOString().slice(0, 10);
  let data;
  try { data = JSON.parse(localStorage.getItem(ORDER_COUNTER_KEY) || '{}'); } catch (e) { data = {}; }
  if (data.date !== today) data = { date: today, n: 0 };
  data.n++;
  localStorage.setItem(ORDER_COUNTER_KEY, JSON.stringify(data));
  return 'C' + String(data.n).padStart(3, '0');
}

/* ── Historial (para reimprimir/consultar, hoy y días anteriores) ── */
function todayISO() { return new Date().toISOString().slice(0, 10); }
// Cuántas comandas guarda como máximo cada día en "Pedidos de hoy" (para
// reimprimir/ver/buscar). Con mucho flujo de clientes 100 se quedaba
// corto; 1000/día da mucho margen y localStorage aguanta de sobra (unos
// pocos cientos de KB como mucho). Los totales de "Hacer caja" NUNCA
// dependen de este límite — salen de loadCajaTotales(), un acumulador
// aparte sin tope, así que aunque algún día se superase este número el
// arqueo de caja seguiría siendo exacto.
const HISTORIAL_MAX = 1000;
const HISTORIAL_KEY_PREFIX = 'dpf_comandas_historial_';
function getHistorialKey(fecha) { return HISTORIAL_KEY_PREFIX + (fecha || todayISO()); }

// Cuántos días se guarda el DETALLE de cada comanda (para reimprimir/ver/
// buscar en "Pedidos de hoy" de días anteriores). Pasado ese tiempo se
// borra solo ese detalle — no hace falta para el día a día y, con meses de
// uso, son cientos de comandas por día acumulándose sin límite en
// localStorage. Los totales de caja de ese día (loadCajaTotales) NUNCA se
// tocan aquí, así que "Resumen por fechas" sigue siendo exacto por
// siempre, aunque ya no se pueda reimprimir un ticket de hace medio año.
const HISTORIAL_DETALLE_RETENCION_DIAS = 90;
const HISTORIAL_ULTIMA_PURGA_KEY = 'dpf_comandas_historial_ultima_purga';
function purgarHistorialAntiguoSiToca() {
  const hoy = todayISO();
  if (localStorage.getItem(HISTORIAL_ULTIMA_PURGA_KEY) === hoy) return; // ya comprobado hoy, no repetir en cada carga de página
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORIAL_DETALLE_RETENCION_DIAS);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const aBorrar = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(HISTORIAL_KEY_PREFIX)) continue;
    const fecha = key.slice(HISTORIAL_KEY_PREFIX.length);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha < cutoffISO) aBorrar.push(key);
  }
  aBorrar.forEach(k => localStorage.removeItem(k));
  localStorage.setItem(HISTORIAL_ULTIMA_PURGA_KEY, hoy);
}
// Totales de caja del día, ACUMULADOS APARTE del historial de arriba, sin
// límite de cantidad. El historial de "Pedidos de hoy" solo guarda las
// últimas HISTORIAL_MAX comandas (las más viejas se descartan solas para
// no crecer sin límite) — si "Hacer caja" calculara sus totales a partir
// de ESE mismo historial recortado, un día muy movido daría un arqueo de
// caja más bajo que el real, sin ningún aviso de que faltaban.
// Se suma 1 vez por cada comanda guardada (saveToHistorial) y se resta al
// borrarla o recuperarla para modificarla (deleteHistorialOrder /
// modifyHistorialOrder), para que nunca se desincronice de lo que de
// verdad hay en el historial.
function getCajaTotalesKey(fecha) { return 'dpf_comandas_caja_totales_' + (fecha || todayISO()); }
// Suma el efecto de una comanda sobre un objeto de totales, en memoria (sin
// tocar localStorage) — lo usan tanto _cajaTotalesAplicar() para el ajuste
// incremental de cada comanda como loadCajaTotales() para reconstruir el
// acumulador desde cero cuando hace falta (ver más abajo). total se valida
// con isFinite además de typeof: un total NaN (p.ej. por un precio mal
// puesto en la carta) metido sin comprobar deja el acumulador entero en
// NaN para el resto del día, sin forma de arreglarlo salvo borrando el
// localStorage a mano.
function _acumularEnTotales(t, order, signo) {
  if (!order) return;
  const total = (typeof order.total === 'number' && isFinite(order.total)) ? order.total : 0;
  if (order.paid) {
    if (order.paymentMethod === 'tarjeta') t.tarjeta += signo * total; else t.efectivo += signo * total;
  } else {
    t.pendiente += signo * total;
  }
  t.count = Math.max(0, t.count + signo);
  t.efectivo = Math.max(0, t.efectivo);
  t.tarjeta = Math.max(0, t.tarjeta);
  t.pendiente = Math.max(0, t.pendiente);
}
function loadCajaTotales(fecha) {
  try {
    const raw = localStorage.getItem(getCajaTotalesKey(fecha));
    if (raw !== null) {
      const t = JSON.parse(raw);
      if (t && typeof t === 'object' && [t.efectivo, t.tarjeta, t.pendiente, t.count].every(n => typeof n === 'number' && isFinite(n))) {
        return { efectivo: t.efectivo, tarjeta: t.tarjeta, pendiente: t.pendiente, count: t.count };
      }
    }
  } catch (e) {}
  // No hay acumulador guardado todavía para ese día (primer pedido del
  // día, o se acaba de actualizar la app a mitad de turno con comandas que
  // ya estaban en el historial guardadas por una versión anterior que no
  // escribía aquí) o quedó corrupto (algún NaN colado). En los dos casos
  // se reconstruye sumando el historial de ese día en vez de arrancar de 0
  // y perder de vista lo que ya se ha cobrado.
  const inicial = { efectivo: 0, tarjeta: 0, pendiente: 0, count: 0 };
  const historialDia = getHistorial(fecha);
  historialDia.forEach(o => _acumularEnTotales(inicial, o, 1));
  // Solo se persiste si había algo que reconstruir o si ya existía un
  // valor (corrupto) que sustituir — así un resumen que recorre muchas
  // fechas no va dejando en localStorage una entrada vacía por cada día
  // sin ningún pedido.
  if (historialDia.length > 0 || localStorage.getItem(getCajaTotalesKey(fecha)) !== null) {
    saveCajaTotales(inicial, fecha);
  }
  return inicial;
}
function saveCajaTotales(t, fecha) { localStorage.setItem(getCajaTotalesKey(fecha), JSON.stringify(t)); }
function _cajaTotalesAplicar(order, signo, fecha) {
  if (!order) return;
  const t = loadCajaTotales(fecha);
  _acumularEnTotales(t, order, signo);
  saveCajaTotales(t, fecha);
}
function saveToHistorial(order) {
  let list;
  try { list = JSON.parse(localStorage.getItem(getHistorialKey()) || '[]'); } catch (e) { list = []; }
  list.unshift(order);
  if (list.length > HISTORIAL_MAX) list = list.slice(0, HISTORIAL_MAX);
  localStorage.setItem(getHistorialKey(), JSON.stringify(list));
  _cajaTotalesAplicar(order, 1);
  maybeAutoBackup(todayISO());
}
function getHistorial(fecha) {
  try { return JSON.parse(localStorage.getItem(getHistorialKey(fecha)) || '[]'); } catch (e) { return []; }
}

/* ── Modal "Pedidos" — hoy por defecto, pero con selector de fecha para
   consultar días anteriores, y buscador por nombre o número. ── */
let historialFechaSel = todayISO();
let historialBusqueda = '';
function openHistorial() {
  historialFechaSel = todayISO();
  historialBusqueda = '';
  const fechaInput = document.getElementById('historial-fecha');
  if (fechaInput) fechaInput.value = historialFechaSel;
  const buscarInput = document.getElementById('historial-search');
  if (buscarInput) buscarInput.value = '';
  document.getElementById('historial-unpaid-panel').classList.remove('open');
  document.getElementById('historial-unpaid-toggle').classList.remove('open');
  renderHistorial();
  document.getElementById('historial-modal').classList.add('open');
}
function closeHistorial() { document.getElementById('historial-modal').classList.remove('open'); }
function toggleHistorialUnpaid() {
  document.getElementById('historial-unpaid-panel').classList.toggle('open');
  document.getElementById('historial-unpaid-toggle').classList.toggle('open');
}
function setHistorialFecha(fecha) { historialFechaSel = fecha || todayISO(); renderHistorial(); }
function setHistorialBusqueda(v) { historialBusqueda = v || ''; renderHistorial(); }
function renderHistorial() {
  const list = getHistorial(historialFechaSel);
  const term = historialBusqueda.trim().toLowerCase();
  const filtrado = term
    ? list.map((o, i) => [o, i]).filter(([o]) => (o.num || '').toLowerCase().includes(term) || (o.name || '').toLowerCase().includes(term))
    : list.map((o, i) => [o, i]);
  const esHoy = historialFechaSel === todayISO();
  const label = document.getElementById('historial-modal-fecha');
  if (label) label.textContent = esHoy ? 'hoy' : new Date(historialFechaSel + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  // Pedidos por teléfono que se cobran cuando vienen a recogerlos: un
  // acceso directo con solo los que faltan por pagar de hoy, para no tener
  // que buscarlos entre todos los pedidos ya cobrados. Recogido dentro de
  // un botón desplegable (en vez de una fila de chips siempre a la vista)
  // para no ocupar sitio cuando no hace falta consultarlo.
  const unpaidSection = document.getElementById('historial-unpaid-section');
  const unpaidList = list.map((o, i) => [o, i]).filter(([o]) => !o.paid);
  if (unpaidSection) {
    if (esHoy && unpaidList.length > 0) {
      unpaidSection.style.display = 'block';
      document.getElementById('historial-unpaid-count').textContent = unpaidList.length;
      document.getElementById('historial-unpaid-sum').textContent = fmt(unpaidList.reduce((s, [o]) => s + o.total, 0)) + ' € pendientes';
      document.getElementById('historial-unpaid-list').innerHTML = unpaidList.map(([o, i]) => `
        <button class="unpaid-row" onclick="payHistorialOrder(${i})">
          <div>
            <span class="unpaid-row-num">${escapeHtml(o.num)}</span>
            ${o.name ? `<span class="unpaid-row-name"> · ${escapeHtml(o.name)}</span>` : ''}
          </div>
          <div class="unpaid-row-right">
            <span class="unpaid-row-price">${fmt(o.total)} €</span>
            <span class="unpaid-row-go">Cobrar →</span>
          </div>
        </button>
      `).join('');
    } else {
      unpaidSection.style.display = 'none';
    }
  }

  const el = document.getElementById('historial-list');
  el.innerHTML = filtrado.length === 0
    ? `<div class="historial-empty">${list.length === 0 ? 'No hay comandas guardadas ese día.' : 'Ningún pedido coincide con la búsqueda.'}</div>`
    : filtrado.map(([o, i]) => {
        const payBadge = o.paid ? (o.paymentMethod === 'tarjeta' ? '💳' : '💵') : '⚠️';
        return `<div class="historial-item">
        <div><div class="h-num">${escapeHtml(o.num)}</div><div class="h-meta">${escapeHtml(o.time)} · ${o.name ? escapeHtml(o.name) + ' · ' : ''}${fmt(o.total)} € · ${payBadge}</div></div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div style="display:flex;gap:6px">
            <button onclick="reprintOrder(${i})">🖨️ Reimprimir</button>
            ${o.rawState && esHoy ? `<button onclick="modifyHistorialOrder(${i})" title="Recuperar en la comanda para cambiar algo">✏️ Modificar</button>` : ''}
          </div>
          <div style="display:flex;gap:6px">
            <button onclick="viewHistorialOrder(${i})" title="Ver ticket">👁️</button>
            <button onclick="deleteHistorialOrder(${i})" title="Borrar del historial (pedido colgado/erróneo)">🗑️</button>
          </div>
        </div>
      </div>`;
      }).join('');
}
function deleteHistorialOrder(index) {
  const list = getHistorial(historialFechaSel);
  const order = list[index];
  if (!order) return;
  if (!confirm('¿Borrar el pedido ' + order.num + ' del historial? No se puede deshacer.')) return;
  list.splice(index, 1);
  localStorage.setItem(getHistorialKey(historialFechaSel), JSON.stringify(list));
  _cajaTotalesAplicar(order, -1, historialFechaSel);
  renderHistorial();
  toast('🗑️ Pedido borrado del historial');
}
// Recupera un pedido ya impreso de vuelta en la comanda en curso, para
// poder cambiar algo (el cliente pide añadir/quitar algo tras imprimir).
// Se quita del historial: al reimprimirlo se creará una comanda nueva.
// Solo disponible para el día de hoy (ver esHoy en renderHistorial): un
// pedido de un día anterior no tiene sentido "recuperarlo" en la comanda
// de hoy como si fuera uno sin terminar todavía.
function modifyHistorialOrder(index) {
  const list = getHistorial(historialFechaSel);
  const order = list[index];
  if (!order || !order.rawState) { toast('⚠️ Este pedido no se puede recuperar para modificar'); return; }
  if (historialFechaSel !== todayISO()) { toast('⚠️ Solo se puede modificar un pedido del día de hoy'); return; }
  if (cartHasAnyItem() && !confirm('Ya hay productos en la comanda actual. ¿Sustituirlos por el pedido ' + order.num + ' para modificarlo?')) return;
  else if (!cartHasAnyItem() && !confirm('¿Recuperar el pedido ' + order.num + ' para modificarlo? Se quitará de "Pedidos de hoy" y habrá que volver a imprimirlo.')) return;
  cart = order.rawState.cart || {};
  custCart = order.rawState.custCart || {};
  extrasCart = order.rawState.extrasCart || {};
  orderDiscount = order.rawState.orderDiscount || null;
  lineDiscounts = order.rawState.lineDiscounts || {};
  document.getElementById('order-name').value = order.name || '';
  document.getElementById('pickup-time').value = order.pickupTime || '';
  setOrderPaid(!!order.paid);
  setPaymentMethod(order.paymentMethod || 'efectivo');
  list.splice(index, 1);
  localStorage.setItem(getHistorialKey(historialFechaSel), JSON.stringify(list));
  _cajaTotalesAplicar(order, -1, historialFechaSel);
  closeHistorial();
  renderMenu();
  renderCart();
  toast('✏️ Pedido ' + order.num + ' recuperado — modifícalo y vuelve a imprimir');
}
// Pedido por teléfono que aún no se ha pagado: lo recupera en la comanda
// en curso (igual que "Modificar") pero abre directamente la pantalla de
// Cobrar, para no tener que ir a buscarlo manualmente en la carta.
function payHistorialOrder(index) {
  const list = getHistorial(historialFechaSel);
  const order = list[index];
  if (!order || !order.rawState) { toast('⚠️ Este pedido no se puede recuperar para cobrar'); return; }
  if (historialFechaSel !== todayISO()) { toast('⚠️ Solo se puede cobrar un pedido de hoy'); return; }
  if (cartHasAnyItem() && !confirm('Ya hay productos en la comanda actual. ¿Sustituirlos por el pedido ' + order.num + ' para cobrarlo?')) return;
  cart = order.rawState.cart || {};
  custCart = order.rawState.custCart || {};
  extrasCart = order.rawState.extrasCart || {};
  orderDiscount = order.rawState.orderDiscount || null;
  lineDiscounts = order.rawState.lineDiscounts || {};
  document.getElementById('order-name').value = order.name || '';
  document.getElementById('pickup-time').value = order.pickupTime || '';
  // Se guarda el pedido ORIGINAL entero (mismo número de ticket, ya
  // impreso) para poder cobrarlo sin generar uno nuevo ni volver a
  // imprimir — ver cobrarBottomAction/finalizarCobroSinImprimir.
  pedidoACobrarSinImprimir = order;
  setOrderPaid(false);
  setPaymentMethod(order.paymentMethod || 'efectivo');
  list.splice(index, 1);
  localStorage.setItem(getHistorialKey(historialFechaSel), JSON.stringify(list));
  _cajaTotalesAplicar(order, -1, historialFechaSel);
  closeHistorial();
  renderMenu();
  renderCart();
  openCobrarModal();
  toast('💰 Pedido ' + order.num + ' cargado para cobrar');
}
async function reprintOrder(index) {
  const list = getHistorial(historialFechaSel);
  const order = list[index];
  if (!order) return;
  await printOrder(order);
  toast('🖨️ Reimprimiendo ' + order.num);
}
function viewHistorialOrder(index) {
  const list = getHistorial(historialFechaSel);
  const order = list[index];
  if (!order) return;
  openTicketView(order);
}

/* ── Hacer caja: resumen de fin de día (efectivo/tarjeta/pendiente),
   igual que el arqueo de caja que hacía uniCenta. Usa los pedidos ya
   guardados en el historial, así que hay que marcar PAGADO/NO PAGADO y el
   método de cada comanda desde el panel antes de imprimir. Con selector
   de fecha, para poder cuadrar caja de un día anterior si hizo falta. ── */
function getCajaFondoKey(fecha) { return 'dpf_comandas_caja_fondo_' + (fecha || todayISO()); }
function loadCajaFondo(fecha) { const v = parseFloat(localStorage.getItem(getCajaFondoKey(fecha))); return isNaN(v) ? 0 : v; }
function saveCajaFondo() { localStorage.setItem(getCajaFondoKey(cajaFechaSel), document.getElementById('caja-fondo').value || '0'); }
const BACKUP_HECHO_PREFIX = 'dpf_comandas_backup_hecho_';
function marcarBackupHecho(fecha) { localStorage.setItem(BACKUP_HECHO_PREFIX + fecha, '1'); }
function hayBackupHecho(fecha) { return localStorage.getItem(BACKUP_HECHO_PREFIX + fecha) === '1'; }
let cajaFechaSel = todayISO();
function openCaja() {
  cajaFechaSel = todayISO();
  const fechaInput = document.getElementById('caja-fecha-input');
  if (fechaInput) fechaInput.value = cajaFechaSel;
  document.getElementById('caja-fondo').value = loadCajaFondo(cajaFechaSel) || '';
  const btnOrganizada = document.getElementById('btn-copia-organizada');
  if (btnOrganizada) btnOrganizada.style.display = isDesktopApp() ? '' : 'none';
  renderCaja();
  document.getElementById('caja-modal').classList.add('open');
}
function setCajaFecha(fecha) {
  cajaFechaSel = fecha || todayISO();
  document.getElementById('caja-fondo').value = loadCajaFondo(cajaFechaSel) || '';
  renderCaja();
}
function closeCaja() { document.getElementById('caja-modal').classList.remove('open'); }
function renderCaja() {
  // Los totales salen de loadCajaTotales() (acumulados aparte, sin límite
  // de cantidad) y NO de getHistorial() — el historial de cada día solo
  // guarda las últimas HISTORIAL_MAX comandas para reimprimir/ver/buscar,
  // así que calcular la caja a partir de ahí podría dar un total más bajo
  // que el real en un día muy movido.
  const fondo = loadCajaFondo(cajaFechaSel);
  const t = loadCajaTotales(cajaFechaSel);
  const efectivo = t.efectivo, tarjeta = t.tarjeta, pendiente = t.pendiente, nPedidos = t.count;
  const facturado = efectivo + tarjeta + pendiente;
  const esperadoCajon = fondo + efectivo;
  const esHoy = cajaFechaSel === todayISO();
  const labelEl = document.getElementById('caja-fecha-label');
  if (labelEl) labelEl.textContent = (esHoy ? 'Resumen de hoy · ' : 'Resumen del ') + new Date(cajaFechaSel + 'T00:00:00').toLocaleDateString('es-ES');
  const row = (label, value, big) => `<div class="cash-calc-total-row" style="margin-bottom:8px${big ? ';font-size:16px' : ''}"><label style="flex:1">${label}</label><b>${fmt(value)} €</b></div>`;
  const avisoBackup = (esHoy && nPedidos > 0 && !hayBackupHecho(cajaFechaSel))
    ? `<div style="background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12.5px;color:#5a3e1b;font-weight:600">⚠️ Todavía no has descargado la copia de hoy — pulsa "📥 Descargar copia" antes de cerrar, por si acaso.</div>`
    : '';
  // Antes "pendiente" solo entraba en el total facturado sin verse en
  // ningún sitio — si alguien marcaba un pedido como pagado a mano fuera de
  // la app (en vez de darle a "pedido no cobrado" desde el panel) la caja
  // se descuadraba sin que nada avisara de por qué. Esta fila lo hace
  // visible siempre que haya algo pendiente, en rojo, para que salte a la
  // vista antes de cerrar.
  const avisoPendiente = pendiente > 0
    ? `<div style="background:#FBE7E4;border:1.5px solid rgba(192,57,43,.4);border-radius:10px;padding:10px 12px;margin-bottom:10px">
        <div class="cash-calc-total-row" style="margin-bottom:0"><label style="flex:1;color:var(--error);font-weight:700">⚠️ Pendiente de cobro</label><b style="color:var(--error)">${fmt(pendiente)} €</b></div>
        <div style="font-size:11.5px;color:var(--error);margin-top:4px">Si alguno se cobró a mano sin marcarlo pagado en la app, la caja no cuadrará.</div>
      </div>`
    : '';
  document.getElementById('caja-summary').innerHTML = avisoBackup
    + `<div class="section-label" style="margin-top:4px">Pedidos: ${nPedidos}</div>`
    + row('💵 Cobrado en efectivo', efectivo)
    + row('💳 Cobrado con tarjeta', tarjeta)
    + avisoPendiente
    + `<div style="border-top:1px solid var(--warm);margin:8px 0"></div>`
    + row('Total facturado', facturado, true)
    + row('💰 Efectivo esperado en caja', esperadoCajon, true);
}

/* ── Imprimir resumen del día al cerrar caja — mismo "blocks" y mismo
   pipeline WebUSB → impresión silenciosa (app de escritorio) → diálogo que
   ya usa printOrder() para las comandas, pero sin guardar nada en el
   historial ni tocar la numeración: es solo un ticket informativo. ── */
async function imprimirResumenCaja() {
  const fecha = cajaFechaSel;
  const blocks = buildCajaResumenBlocks(fecha);
  document.getElementById('ticket-html-content').innerHTML = blocksToPreviewHTML(blocks);
  const cfg = getTicketConfig();
  let printedOk = false, anyFailure = false, failReason = '';

  if (cfg.modoImpresion === 'auto') {
    try {
      const bytes = blocksToEscPosBytes(blocks);
      await sendToPrinter(bytes);
      printedOk = true;
    } catch (e) {
      console.warn('[comandas] impresión directa del resumen falló:', e);
      anyFailure = true;
    }
  }

  if (!printedOk && cfg.modoImpresion !== 'dialog' && isDesktopApp() && window.comandasDesktop.printRaw) {
    try {
      const bytes = blocksToEscPosBytes(blocks);
      const bytesBase64 = bytesToBase64(bytes);
      const res = await _conTimeout(
        window.comandasDesktop.printRaw(bytesBase64, cfg.printerDeviceName || undefined),
        12000,
        'timeout en impresión silenciosa — el driver no respondió a tiempo'
      );
      if (res && res.success) printedOk = true;
      else { anyFailure = true; failReason = (res && res.reason) || 'motivo desconocido'; }
    } catch (e) {
      console.warn('[comandas] impresión silenciosa del resumen falló, usando diálogo:', e);
      anyFailure = true;
      failReason = e.message || 'motivo desconocido';
    }
  }

  if (!printedOk) window.print();
  playPrintSound(printedOk || !anyFailure);
  if (printedOk) toast('✅ Resumen del día impreso');
  else toast((failReason ? '⚠️ Impresión silenciosa falló: ' + failReason + '. ' : '') + '🖨️ Abriendo diálogo de impresión…', failReason ? 8000 : undefined);
}

/* ── Copia de seguridad / exportación (del día seleccionado en "Hacer
   caja") ── Todo lo de esta app vive solo en localStorage: si se borra la
   caché del navegador, se cambia de ordenador o Chrome hace limpieza, se
   pierde sin aviso. Estos botones dejan un archivo real fuera del
   navegador. Ojo: el historial de cada día solo guarda las últimas
   HISTORIAL_MAX comandas, así que en un día que las superase el detalle
   exportado no las incluiría todas — los totales de "Hacer caja" sí son
   exactos siempre, porque salen del acumulador aparte, no de este
   historial. ── */
function _descargarArchivo(nombre, contenido, tipoMime) {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function construirCopiaJSON(fecha) {
  return {
    fecha,
    generadoEn: new Date().toLocaleString('es-ES'),
    fondoCaja: loadCajaFondo(fecha),
    totales: loadCajaTotales(fecha),
    pedidos: getHistorial(fecha),
  };
}
async function exportarCopiaHoyJSON() {
  const fecha = cajaFechaSel || todayISO();
  _descargarArchivo('dulce-patata-copia-' + fecha + '.json', JSON.stringify(construirCopiaJSON(fecha), null, 2), 'application/json');
  marcarBackupHecho(fecha);
  // En la app de escritorio, además del descargable de arriba, se intenta
  // guardar sola una copia organizada por año/mes/semana si hay carpeta
  // configurada — sin bloquear ni avisar si no la hay, para eso ya está el
  // botón "📁 Guardar copia organizada" para hacerlo a mano.
  if (isDesktopApp()) {
    const res = await guardarCopiaOrganizada(fecha);
    if (res.ok) toast('📥 Copia descargada y guardada en la carpeta organizada');
    else { renderCaja(); toast('📥 Copia descargada'); }
    return;
  }
  renderCaja();
  toast('📥 Copia descargada');
}

/* ── Copia organizada por año/mes/semana (solo app de escritorio, ver
   comandas-app/main.js) — mismo contenido que "📥 Descargar copia" pero
   escrita de verdad en una carpeta elegida, en vez de depender de la
   carpeta de Descargas del navegador. ── */
const NO_BACKUP_FOLDER_ERROR = 'No hay ninguna carpeta de copias configurada.';
async function guardarCopiaOrganizada(fecha) {
  if (!isDesktopApp()) return { ok: false, error: 'Solo disponible en la app de escritorio' };
  const folder = await window.comandasDesktop.getBackupFolder();
  if (!folder) return { ok: false, error: NO_BACKUP_FOLDER_ERROR };
  const contenido = JSON.stringify(construirCopiaJSON(fecha), null, 2);
  const res = await window.comandasDesktop.saveOrganizedBackup(fecha, contenido);
  if (res.ok) marcarBackupHecho(fecha);
  return res;
}
async function guardarCopiaOrganizadaManual() {
  const res = await guardarCopiaOrganizada(cajaFechaSel);
  if (res.ok) { toast('📁 Copia guardada en la carpeta de copias'); renderCaja(); }
  else toast('⚠️ ' + res.error);
}

/* ── Copia automática: igual que el botón manual de arriba, pero se
   dispara sola por CALENDARIO (cada X días, X configurable en Ajustes,
   0 = desactivada) en vez de por cantidad de comandas — así un día flojo
   de ventas también queda protegido, y un día muy movido no genera un
   aluvión de descargas. Se comprueba con el primer pedido que se imprime
   cada día: si ya ha pasado X días desde la última copia automática, se
   dispara una copia del día actual (con lo que haya hasta ese momento) y
   no se repite hasta que toque de nuevo. Con la opción "cada día"
   (recomendada) cae siempre en el primer pedido de cada jornada. ── */
const AUTO_BACKUP_ULTIMA_FECHA_KEY = 'dpf_comandas_autobackup_ultima_fecha';
async function exportarCopiaAutomatica(fecha) {
  marcarBackupHecho(fecha);
  // En la app de escritorio, si hay carpeta de copias configurada, la
  // automática se guarda ahí directamente (organizada por año/mes/semana,
  // igual que "📁 Guardar copia organizada") en vez de en Descargas —así no
  // se pierde entre archivos sueltos ni hay que acordarse de nada. Si
  // todavía no hay carpeta configurada, se cae al descargable de siempre
  // para que la copia no falte igualmente, avisando de paso que conviene
  // configurar una carpeta en Ajustes.
  if (isDesktopApp()) {
    const res = await guardarCopiaOrganizada(fecha);
    if (res.ok) { toast('📥 Copia automática guardada', 3200); return; }
  }
  const horaCorta = new Date().toTimeString().slice(0, 5).replace(':', '');
  _descargarArchivo('dulce-patata-auto-' + fecha + '-' + horaCorta + '.json', JSON.stringify(construirCopiaJSON(fecha), null, 2), 'application/json');
  if (isDesktopApp()) {
    toast('📥 Copia automática guardada en Descargas — configura una carpeta de copias en Ajustes para que se guarde organizada sola', 5000);
  } else {
    toast('📥 Copia automática guardada en Descargas', 3200);
  }
}
function maybeAutoBackup(fecha) {
  const cadaDias = parseInt(getTicketConfig().copiaAutoCadaDias, 10) || 0;
  if (cadaDias <= 0) return; // desactivada
  const ultima = localStorage.getItem(AUTO_BACKUP_ULTIMA_FECHA_KEY);
  if (ultima) {
    const diasPasados = Math.round((new Date(fecha + 'T00:00:00') - new Date(ultima + 'T00:00:00')) / 86400000);
    if (diasPasados < cadaDias) return;
  }
  localStorage.setItem(AUTO_BACKUP_ULTIMA_FECHA_KEY, fecha);
  exportarCopiaAutomatica(fecha);
}

/* ── Importar copia: recupera un archivo generado por "Descargar copia" /
   la copia automática, para el caso de haber perdido este ordenador o su
   localStorage. Sustituye el historial/totales/fondo del día indicado
   DENTRO del archivo (no del día seleccionado en pantalla) — por eso pide
   confirmación explícita mostrando esa fecha antes de tocar nada. ── */
function importarCopiaJSON(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = ''; // permite volver a elegir el mismo archivo si hace falta reintentar
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); } catch (e) { toast('⚠️ El archivo no es una copia válida (JSON incorrecto)'); return; }
    if (!data || typeof data !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha || '') || !Array.isArray(data.pedidos)) {
      toast('⚠️ El archivo no tiene el formato de una copia de Comandas');
      return;
    }
    const fecha = data.fecha;
    const yaHabiaAlgo = getHistorial(fecha).length > 0 || localStorage.getItem(getCajaTotalesKey(fecha)) !== null;
    const aviso = yaHabiaAlgo
      ? '⚠️ Ya hay datos guardados para el ' + fecha + ' en este ordenador. Importar esta copia LOS SUSTITUIRÁ. ¿Continuar?'
      : '¿Importar la copia del ' + fecha + ' (' + data.pedidos.length + ' pedidos)?';
    if (!confirm(aviso)) return;
    localStorage.setItem(getHistorialKey(fecha), JSON.stringify(data.pedidos));
    if (data.totales && typeof data.totales === 'object') saveCajaTotales(data.totales, fecha);
    else localStorage.removeItem(getCajaTotalesKey(fecha)); // sin totales en el archivo: se recalculan solos desde los pedidos al leer la caja
    if (typeof data.fondoCaja === 'number') localStorage.setItem(getCajaFondoKey(fecha), String(data.fondoCaja));
    cajaFechaSel = fecha;
    const fechaInput = document.getElementById('caja-fecha-input');
    if (fechaInput) fechaInput.value = fecha;
    const fondoInput = document.getElementById('caja-fondo');
    if (fondoInput) fondoInput.value = loadCajaFondo(fecha) || '';
    renderCaja();
    toast('✅ Copia del ' + fecha + ' importada');
  };
  reader.onerror = () => toast('⚠️ No se pudo leer el archivo');
  reader.readAsText(file);
}
function _csvCelda(v) {
  const s = String(v == null ? '' : v);
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function exportarVentasHoyCSV() {
  const fecha = cajaFechaSel || todayISO();
  const cols = ['Nº pedido', 'Hora', 'Nombre', 'Pagado', 'Método', 'Total (€)', 'Productos'];
  // Punto y coma como separador (no coma): con la configuración regional
  // española de Excel, que usa la coma como separador decimal, un CSV con
  // comas se abre todo en una sola columna en vez de repartirse en celdas.
  const filas = [cols.join(';')];
  getHistorial(fecha).slice().reverse().forEach(o => {
    const productos = (o.items || []).map(it => it.qty + 'x ' + it.name).join(' · ');
    filas.push([
      _csvCelda(o.num), _csvCelda(o.time), _csvCelda(o.name || ''),
      _csvCelda(o.paid ? 'Sí' : 'No'), _csvCelda(o.paid ? (o.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo') : ''),
      _csvCelda(fmt(o.total)), _csvCelda(productos),
    ].join(';'));
  });
  // BOM al principio: sin esto, Excel interpreta el UTF-8 como Windows-1252
  // y las tildes/eñes salen como símbolos raros.
  _descargarArchivo('dulce-patata-ventas-' + fecha + '.csv', '﻿' + filas.join('\r\n'), 'text/csv;charset=utf-8');
  marcarBackupHecho(fecha);
  renderCaja();
  toast('📊 CSV descargado');
}

/* ── Resumen por rango de fechas (semanal/mensual): suma los totales de
   caja (loadCajaTotales, siempre exactos) de cada día del rango — no
   depende del historial recortado a HISTORIAL_MAX. ── */
function _rangoFechas(desde, hasta) {
  const out = [];
  let d = new Date(desde + 'T00:00:00');
  const fin = new Date(hasta + 'T00:00:00');
  let guard = 0;
  while (d <= fin && guard < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return out;
}
let resumenDesde = null, resumenHasta = null;
function openResumen() {
  resumenPreset(7);
  document.getElementById('resumen-modal').classList.add('open');
}
function closeResumen() { document.getElementById('resumen-modal').classList.remove('open'); }
function setResumenRango() {
  resumenDesde = document.getElementById('resumen-desde').value || resumenDesde;
  resumenHasta = document.getElementById('resumen-hasta').value || resumenHasta;
  renderResumen();
}
function resumenPreset(dias) {
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - (dias - 1));
  resumenDesde = desde.toISOString().slice(0, 10);
  resumenHasta = todayISO();
  document.getElementById('resumen-desde').value = resumenDesde;
  document.getElementById('resumen-hasta').value = resumenHasta;
  renderResumen();
}
function resumenPresetMesActual() {
  const hoy = new Date();
  resumenDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
  resumenHasta = todayISO();
  document.getElementById('resumen-desde').value = resumenDesde;
  document.getElementById('resumen-hasta').value = resumenHasta;
  renderResumen();
}
function renderResumen() {
  const body = document.getElementById('resumen-body');
  if (!resumenDesde || !resumenHasta || resumenDesde > resumenHasta) {
    body.innerHTML = `<div class="historial-empty">Elige un rango de fechas válido.</div>`;
    return;
  }
  const fechas = _rangoFechas(resumenDesde, resumenHasta);
  let efectivo = 0, tarjeta = 0, pendiente = 0, count = 0;
  const dias = fechas.map(f => {
    const t = loadCajaTotales(f);
    efectivo += t.efectivo; tarjeta += t.tarjeta; pendiente += t.pendiente; count += t.count;
    return { fecha: f, ...t };
  }).filter(d => d.count > 0).reverse();
  const facturado = efectivo + tarjeta + pendiente;
  const row = (label, value, big) => `<div class="cash-calc-total-row" style="margin-bottom:8px${big ? ';font-size:16px' : ''}"><label style="flex:1">${label}</label><b>${fmt(value)} €</b></div>`;
  const tablaDias = dias.length === 0
    ? `<div class="historial-empty">Sin pedidos en ese rango.</div>`
    : dias.map(d => `<div class="historial-item">
        <div><div class="h-num">${new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div><div class="h-meta">${d.count} pedido${d.count === 1 ? '' : 's'}</div></div>
        <div style="align-self:center"><b>${fmt(d.efectivo + d.tarjeta + d.pendiente)} €</b></div>
      </div>`).join('');
  body.innerHTML = `<div class="section-label" style="margin-top:4px">Pedidos en el rango: ${count}</div>`
    + row('💵 Cobrado en efectivo', efectivo)
    + row('💳 Cobrado con tarjeta', tarjeta)
    + row('⚠️ Pendiente de cobro', pendiente)
    + `<div style="border-top:1px solid var(--warm);margin:8px 0"></div>`
    + row('Total facturado', facturado, true)
    + `<div class="section-label">Por día</div>`
    + tablaDias;
}

/* ══════════════════════════════════════════════════════════════
   IMPRESIÓN — directa por USB (ESC/POS) con respaldo de diálogo
   ══════════════════════════════════════════════════════════════ */
let printerDevice = null, printerEndpoint = null;

/* ── Qué dispositivo USB coger cuando hay que reconectar (recarga de
   página, timeout, desconexión...): antes se cogía a ciegas el primero
   de navigator.usb.getDevices(), lo que en un mostrador con más de un
   USB emparejado (lector de códigos de barras, báscula, etc.) podía
   intentar imprimir en el dispositivo equivocado. Ahora se recuerda el
   vendorId/productId de la impresora la primera vez que se empareja con
   "🔌 Conectar impresora directa" y se busca por eso; solo si no hay nada
   guardado (primer uso de siempre) se cae a buscar un dispositivo con
   interfaz de clase impresora (7), y como último recurso al primero de
   la lista, igual que antes. ── */
const PRINTER_IDS_KEY = 'dpf_comandas_printer_ids';
function savePrinterIds(device) {
  try { localStorage.setItem(PRINTER_IDS_KEY, JSON.stringify({ vendorId: device.vendorId, productId: device.productId })); } catch (e) {}
}
function loadPrinterIds() {
  try { return JSON.parse(localStorage.getItem(PRINTER_IDS_KEY) || 'null'); } catch (e) { return null; }
}
function isPrinterClassDevice(device) {
  try {
    return (device.configurations || []).some(cfg =>
      (cfg.interfaces || []).some(iface => (iface.alternates || []).some(alt => alt.interfaceClass === 7)));
  } catch (e) { return false; }
}
function pickPrinterDevice(list) {
  if (!list.length) return null;
  const saved = loadPrinterIds();
  if (saved) {
    const exacto = list.find(d => d.vendorId === saved.vendorId && d.productId === saved.productId);
    if (exacto) return exacto;
  }
  const porClase = list.find(isPrinterClassDevice);
  if (porClase) return porClase;
  return list[0]; // último recurso, igual que antes, si no hay forma de distinguir
}

function updatePrinterStatusUI() {
  const el = document.getElementById('printer-status');
  if (printerDevice) {
    el.textContent = '🖨️ Impresora conectada';
    el.className = 'printer-status ok';
  } else if (isDesktopApp() && window.comandasDesktop.printRaw && getTicketConfig().modoImpresion !== 'dialog') {
    // La impresión RAW de la app de escritorio (PowerShell+WinSpool en
    // Windows, "lp -o raw" en Mac/Linux) no depende de emparejar nada por
    // USB — este aviso antes decía siempre "sin impresora" aquí también,
    // aunque la impresión directa sí estuviera funcionando de verdad.
    el.textContent = '🖨️ Impresión directa activa (app de escritorio)';
    el.className = 'printer-status ok';
  } else if (!navigator.usb) {
    el.textContent = '🖨️ Sin impresión directa (usa Chrome/Edge) — diálogo de impresión';
    el.className = 'printer-status warn';
  } else {
    el.textContent = '🖨️ Sin impresora directa — usará el diálogo de impresión';
    el.className = 'printer-status warn';
  }
}

async function openAndClaim(device) {
  await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);
  let iface = device.configuration.interfaces.find(i => i.alternates.some(a => a.interfaceClass === 7));
  if (!iface) iface = device.configuration.interfaces[0];
  const alt = iface.alternates.find(a => a.endpoints.some(e => e.direction === 'out')) || iface.alternates[0];
  await device.claimInterface(iface.interfaceNumber);
  const ep = alt.endpoints.find(e => e.direction === 'out');
  if (!ep) throw new Error('La impresora no tiene un endpoint de salida compatible');
  printerDevice = device;
  printerEndpoint = ep.endpointNumber;
}

async function pairPrinter() {
  if (!navigator.usb) { toast('Este navegador no soporta impresión directa. Usa Chrome o Edge, o deja el modo "diálogo".'); return; }
  try {
    const device = await navigator.usb.requestDevice({ filters: [] });
    await openAndClaim(device);
    savePrinterIds(device);
    toast('✅ Impresora conectada: ' + (device.productName || 'dispositivo USB'));
    updatePrinterStatusUI();
  } catch (e) {
    toast('No se pudo conectar por USB: ' + e.message + '. Se usará el diálogo de impresión.');
  }
}

async function trySilentReconnect() {
  if (!navigator.usb) { updatePrinterStatusUI(); return; }
  try {
    const list = await navigator.usb.getDevices();
    const elegido = pickPrinterDevice(list);
    if (elegido) await openAndClaim(elegido);
  } catch (e) { /* se usará el diálogo de impresión */ }
  updatePrinterStatusUI();
}

// transferOut() de WebUSB no trae ningún timeout de fábrica: si la
// impresora se queda en un estado raro a media escritura (atasco de
// papel, un USB flojo...), esa promesa puede no resolverse nunca — y como
// nada más espera a que termine, se quedaba todo colgado sin forma de
// recuperarse sola salvo recargar la página entera.
function _conTimeout(promise, ms, mensaje) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(mensaje || 'timeout de impresora')), ms); });
  // Sin el clearTimeout de aquí, cada impresión que sí sale a tiempo deja
  // igualmente el temporizador de 8s corriendo de fondo hasta que salta
  // solo — en un turno con muchas comandas se van acumulando temporizadores
  // colgados sin necesidad.
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
async function sendToPrinter(bytes) {
  if (!printerDevice) {
    if (!navigator.usb) throw new Error('WebUSB no disponible');
    const list = await navigator.usb.getDevices();
    const elegido = pickPrinterDevice(list);
    if (!elegido) throw new Error('No hay impresora emparejada');
    await openAndClaim(elegido);
  }
  try {
    // 15s de margen (no 8s): WebUSB no deja cancelar transferOut() una vez
    // lanzado, así que si saltamos el timeout con la impresora todavía
    // viva (solo lenta, no atascada) y cae window.print() como reserva,
    // corremos el riesgo de que el ticket físico salga dos veces cuando el
    // transferOut() original termine por su cuenta más tarde. Un margen
    // más generoso reduce ese falso positivo sin dejar de cortar los
    // atascos de verdad.
    await _conTimeout(printerDevice.transferOut(printerEndpoint, bytes), 15000, 'timeout enviando a la impresora — no respondió a tiempo');
  } catch (e) {
    // Si falla (incluido el timeout de arriba), se olvida esta conexión —
    // el próximo intento reclama la impresora de cero en vez de reintentar
    // sobre una conexión que puede haber quedado en mal estado.
    printerDevice = null;
    printerEndpoint = null;
    updatePrinterStatusUI();
    throw e;
  }
}

if (navigator.usb) {
  navigator.usb.addEventListener('disconnect', (e) => {
    // Sin este aviso, si la impresora se desconecta a media jornada (se
    // suelta el cable, se apaga sola...) lo único que cambiaba era el
    // textito "🖨️ Impresora conectada" de la cabecera — fácil de no ver
    // entre comanda y comanda, y la siguiente impresión fallaría sin
    // avisar hasta que ya fuera tarde (cliente esperando el ticket).
    if (printerDevice && e.device === printerDevice) {
      printerDevice = null;
      printerEndpoint = null;
      updatePrinterStatusUI();
      toast('⚠️ Se ha desconectado la impresora', 5000);
      playDisconnectAlert();
    }
  });
}

// Aviso sonoro al imprimir (o al fallar), generado con el propio
// navegador (Web Audio) — no necesita ningún archivo de sonido externo,
// así que funciona igual sin conexión. Si el navegador bloquea el audio
// por lo que sea, se ignora en silencio: nunca debe romper la impresión.
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, duration, delay, volume) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime + delay;
  osc.start(t);
  osc.stop(t + duration);
}
// Tres pitidos graves al desconectarse la impresora — distinto del pitido
// de imprimir, para que no se confunda con un ticket que sí ha salido.
function playDisconnectAlert() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    playTone(200, 0.18, 0, 0.22);
    playTone(200, 0.18, 0.25, 0.22);
    playTone(200, 0.18, 0.5, 0.22);
  } catch (e) { /* sin sonido, no pasa nada */ }
}
function playPrintSound(ok) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (ok) { playTone(880, 0.11, 0, 0.18); playTone(1320, 0.14, 0.1, 0.18); }
    else { playTone(220, 0.22, 0, 0.22); playTone(160, 0.28, 0.2, 0.22); }
  } catch (e) { /* sin sonido, no pasa nada */ }
}

async function printOrder(order) {
  renderTicketPreview(order);
  const cfg = getTicketConfig();
  let printedOk = false; // el ticket ya salió (o se mandó) sin tener que tocar nada más
  let anyFailure = false;
  let failReason = ''; // motivo del fallo silencioso, para poder verlo sin abrir la consola

  if (cfg.modoImpresion === 'auto') {
    try {
      const bytes = buildEscPosBytes(order);
      const copies = Math.max(1, parseInt(cfg.copias, 10) || 1);
      for (let i = 0; i < copies; i++) await sendToPrinter(bytes);
      printedOk = true;
    } catch (e) {
      console.warn('[comandas] impresión directa por USB falló:', e);
      anyFailure = true;
    }
  }

  // Impresión silenciosa (app de escritorio): manda los mismos bytes
  // ESC/POS que la impresión directa por USB de arriba, pero a través de la
  // cola de Windows en vez de WebUSB (ver comandas-app/main.js, print:raw).
  // Se probó primero renderizando la página con webContents.print() (tamaño
  // de página explícito, esperar al pintado...) pero en la tienda seguía
  // saliendo en blanco pase lo que pase — mandar los bytes RAW tal cual,
  // sin que Windows/Electron tengan que "dibujar" ninguna página, es la
  // técnica estándar de los programas de TPV y no depende de nada de eso.
  if (!printedOk && cfg.modoImpresion !== 'dialog' && isDesktopApp() && window.comandasDesktop.printRaw) {
    try {
      const bytes = buildEscPosBytes(order);
      const bytesBase64 = bytesToBase64(bytes);
      const res = await _conTimeout(
        window.comandasDesktop.printRaw(bytesBase64, cfg.printerDeviceName || undefined),
        12000,
        'timeout en impresión silenciosa — el driver no respondió a tiempo'
      );
      if (res && res.success) printedOk = true;
      else { anyFailure = true; failReason = (res && res.reason) || 'motivo desconocido'; }
    } catch (e) {
      console.warn('[comandas] impresión silenciosa falló, usando diálogo:', e);
      anyFailure = true;
      failReason = e.message || 'motivo desconocido';
    }
  }

  if (!printedOk) window.print();
  updatePrinterStatusUI();
  playPrintSound(printedOk || !anyFailure);
  return { printedOk, failReason };
}

async function handlePrintOrder() {
  if (!cartHasAnyItem()) { toast('La comanda está vacía'); return; }
  const btn = document.getElementById('print-btn');
  btn.disabled = true;
  const order = buildOrderObject();
  // Guarda el estado "editable" del pedido (no solo las líneas ya
  // formateadas para el ticket) para poder recuperarlo después con
  // "✏️ Modificar" desde Pedidos de hoy si hay que cambiar algo.
  order.rawState = {
    cart: { ...cart },
    custCart: JSON.parse(JSON.stringify(custCart)),
    extrasCart: JSON.parse(JSON.stringify(extrasCart)),
    orderDiscount: orderDiscount ? { ...orderDiscount } : null,
    lineDiscounts: JSON.parse(JSON.stringify(lineDiscounts)),
  };
  // Se guarda en "Pedidos de hoy" ANTES de intentar imprimir — si el envío
  // a la impresora se queda colgado o falla del todo, la comanda ya está a
  // salvo (y su número ya no queda "hueco") y se puede reimprimir después
  // desde ahí, en vez de perderse por completo si hay que recargar la
  // página para desatascarse.
  saveToHistorial(order);
  let printedOk = false, failReason = '';
  try {
    ({ printedOk, failReason } = await printOrder(order));
  } finally {
    btn.disabled = false;
  }
  if (getTicketConfig().autoImprimir !== false) clearOrder(true);
  if (printedOk) {
    toast('✅ Comanda ' + order.num + ' impresa');
  } else {
    // Se muestra el motivo exacto del fallo (viene de Electron) para poder
    // diagnosticar sin acceso a la consola del programa — solo pasa cuando
    // el modo NO es "diálogo" (ahí ir al diálogo es lo esperado, no un fallo).
    toast(
      (failReason ? '⚠️ Impresión silenciosa falló: ' + failReason + '. ' : '') +
      '🖨️ Comanda ' + order.num + ' — abriendo diálogo de impresión…',
      failReason ? 8000 : undefined
    );
  }
}

/* ══════════════════════════════════════════════════════════════
   AJUSTES
   ══════════════════════════════════════════════════════════════ */
// Tipografía de la app (solo la pantalla — el ticket impreso siempre sale
// en el tipo de letra fijo de la impresora térmica, esto no lo toca).
// Usa fuentes que ya trae cualquier Windows/Mac, así no hace falta
// descargar ni empaquetar ningún archivo de letra nuevo — la única
// excepción es "Actual", que sigue usando Oswald/DM Sans (los .woff2 que
// ya se cargan con la app).
const FONT_PRESETS = [
  { id: 'default', name: 'Actual', head: "'Oswald','Arial Narrow','Segoe UI Semibold',Arial,sans-serif", body: "'DM Sans','Segoe UI',Roboto,Arial,sans-serif" },
  { id: 'clasica', name: 'Clásica', head: "Georgia,'Times New Roman',serif", body: "Verdana,Geneva,sans-serif" },
  { id: 'moderna', name: 'Moderna y clara', head: "'Segoe UI',system-ui,'Helvetica Neue',Arial,sans-serif", body: "'Segoe UI',system-ui,'Helvetica Neue',Arial,sans-serif" },
  { id: 'grande', name: 'Grande y directa', head: "'Arial Black','Arial Bold',Arial,sans-serif", body: "Arial,'Helvetica Neue',sans-serif" },
];
const FONT_CHOICE_KEY = 'dpf_comandas_font_choice';
function loadFontChoice() { return localStorage.getItem(FONT_CHOICE_KEY) || 'grande'; }
function applyFontChoice(id) {
  const preset = FONT_PRESETS.find(f => f.id === id) || FONT_PRESETS[0];
  document.documentElement.style.setProperty('--font-head', preset.head);
  document.documentElement.style.setProperty('--font-body', preset.body);
}
function selectFont(id) {
  localStorage.setItem(FONT_CHOICE_KEY, id);
  applyFontChoice(id);
  renderFontOptions();
}
function renderFontOptions() {
  const el = document.getElementById('font-options');
  if (!el) return;
  const actual = loadFontChoice();
  el.innerHTML = FONT_PRESETS.map(f => `
    <div class="font-option-card ${f.id === actual ? 'selected' : ''}" onclick="selectFont('${f.id}')">
      <div class="font-option-check"></div>
      <div class="font-option-name">${escapeHtml(f.name)}</div>
      <div class="font-option-head" style="font-family:${f.head}">Patata Kebab</div>
      <div class="font-option-body" style="font-family:${f.body}">5,90 € · Salsa de yogur</div>
    </div>`).join('');
}
function openSettings() {
  renderFontOptions();
  const cfg = getTicketConfig();
  document.getElementById('set-nombre').value = cfg.nombre;
  document.getElementById('set-direccion').value = cfg.direccion;
  document.getElementById('set-telefono').value = cfg.telefono;
  document.getElementById('set-nif').value = cfg.nif;
  document.getElementById('set-despedida').value = cfg.despedida;
  document.getElementById('set-texto-pago').value = cfg.textoPago;
  document.getElementById('set-ancho-papel').value = String(cfg.anchoPapel);
  document.getElementById('set-columnas-ajuste').value = String(cfg.columnasAjuste || 0);
  document.getElementById('set-copias').value = String(cfg.copias);
  document.getElementById('set-auto-imprimir').checked = cfg.autoImprimir !== false;
  document.getElementById('set-modo-impresion').value = cfg.modoImpresion;
  document.getElementById('set-copia-auto-cada').value = String(cfg.copiaAutoCadaDias != null ? cfg.copiaAutoCadaDias : 1);
  // "Silenciosa" solo existe en la app de escritorio (necesita imprimir
  // directo al driver de Windows vía Electron) — en un navegador normal no
  // se puede, así que ni se ofrece como opción.
  document.getElementById('set-modo-impresion-silent-opt').disabled = !isDesktopApp();
  updatePrinterNameVisibility();
  initDesktopSettingsSection();
  document.getElementById('settings-modal').classList.add('open');
}
function updatePrinterNameVisibility() {
  const modo = document.getElementById('set-modo-impresion').value;
  document.getElementById('set-printer-name-group').style.display = (modo === 'silent' && isDesktopApp()) ? '' : 'none';
}
async function loadPrinterNameOptions() {
  if (!isDesktopApp() || !window.comandasDesktop.listPrinters) return;
  const cfg = getTicketConfig();
  try {
    const printers = await window.comandasDesktop.listPrinters();
    const sel = document.getElementById('set-printer-name');
    sel.innerHTML = '<option value="">La predeterminada de Windows</option>' +
      printers.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.displayName || p.name)}</option>`).join('');
    sel.value = cfg.printerDeviceName || '';
  } catch (e) { /* se queda solo con "la predeterminada" */ }
}
function closeSettings() { document.getElementById('settings-modal').classList.remove('open'); }

/* ══════════════════════════════════════════════════════════════
   APP DE ESCRITORIO (Electron) — arranque automático, modo kiosco y
   comprobación de actualizaciones. Todo esto solo existe si la página se
   abre dentro de comandas-app (ver comandas-app/preload.js) — si se abre
   en un navegador normal, window.comandasDesktop no existe y esta sección
   de Ajustes se queda oculta sin romper nada.
   ══════════════════════════════════════════════════════════════ */
function isDesktopApp() { return !!(window.comandasDesktop && window.comandasDesktop.isDesktopApp); }

async function initDesktopSettingsSection() {
  const section = document.getElementById('settings-desktop-section');
  if (!isDesktopApp()) { section.style.display = 'none'; return; }
  section.style.display = '';
  document.getElementById('update-check-result').style.display = 'none';
  const [version, autoLaunch, kiosk, updatePath, backupFolder] = await Promise.all([
    window.comandasDesktop.getAppVersion(),
    window.comandasDesktop.getAutoLaunch(),
    window.comandasDesktop.getKiosk(),
    window.comandasDesktop.getUpdatePath(),
    window.comandasDesktop.getBackupFolder(),
  ]);
  document.getElementById('set-app-version').textContent = version ? 'v' + version : '';
  document.getElementById('set-auto-launch').checked = !!autoLaunch;
  document.getElementById('set-kiosk').checked = !!kiosk;
  document.getElementById('set-update-path').value = updatePath || '';
  document.getElementById('set-backup-folder').value = backupFolder || '';
  updateBackupFolderHint(!!backupFolder);
  loadPrinterNameOptions();
}
// Resalta el aviso mientras no haya carpeta configurada — la copia
// automática diaria solo llega a Descargas hasta que se elija una.
function updateBackupFolderHint(configurada) {
  const hint = document.getElementById('set-backup-folder-hint');
  if (!hint) return;
  hint.textContent = configurada
    ? 'La copia automática diaria (y "📥 Descargar copia" en Hacer Caja) se guarda sola aquí, organizada en carpetas.'
    : '⚠️ Sin configurar: la copia automática diaria solo llega a Descargas, no queda organizada aparte. Recomendado elegir una carpeta.';
  hint.style.color = configurada ? '' : 'var(--error)';
  hint.style.fontWeight = configurada ? '' : '600';
}
async function chooseBackupFolder() {
  if (!isDesktopApp()) return;
  const res = await window.comandasDesktop.chooseBackupFolder();
  if (res && res.ok) {
    document.getElementById('set-backup-folder').value = res.folder;
    updateBackupFolderHint(true);
    toast('✅ Carpeta de copias configurada');
  }
}
async function toggleAutoLaunch(checked) {
  if (!isDesktopApp()) return;
  const result = await window.comandasDesktop.setAutoLaunch(checked);
  document.getElementById('set-auto-launch').checked = !!result;
  toast(result ? '✅ Se abrirá sola al encender el PC' : 'Arranque automático desactivado');
}
async function toggleKiosk(checked) {
  if (!isDesktopApp()) return;
  const result = await window.comandasDesktop.setKiosk(checked);
  document.getElementById('set-kiosk').checked = !!result;
  toast(result ? '✅ Modo kiosco activado (Esc para salir)' : 'Modo kiosco desactivado');
}
let updatePathDebounceTimer = null;
function saveUpdatePathDebounced() {
  if (!isDesktopApp()) return;
  clearTimeout(updatePathDebounceTimer);
  updatePathDebounceTimer = setTimeout(() => {
    window.comandasDesktop.setUpdatePath(document.getElementById('set-update-path').value);
  }, 500);
}
let pendingUpdateInstallerPath = null;
async function checkForAppUpdate() {
  if (!isDesktopApp()) return;
  const resultEl = document.getElementById('update-check-result');
  resultEl.style.display = 'block';
  resultEl.textContent = 'Buscando…';
  pendingUpdateInstallerPath = null;
  const res = await window.comandasDesktop.checkForUpdate();
  if (!res.ok) { resultEl.textContent = '⚠️ ' + res.error; return; }
  if (!res.hayNueva) { resultEl.textContent = '✅ Ya tienes la última versión (v' + res.actual + ').'; return; }
  if (!res.instaladorPath) {
    resultEl.textContent = '🆕 Hay una versión nueva (v' + res.disponible + ') pero no se encuentra su instalador en esa carpeta.';
    return;
  }
  pendingUpdateInstallerPath = res.instaladorPath;
  resultEl.innerHTML = '🆕 Versión ' + escapeHtml(res.disponible) + ' disponible (tienes v' + escapeHtml(res.actual) + ').'
    + (res.notas ? '<br>' + escapeHtml(res.notas) : '')
    + '<br><button class="btn-secondary" style="margin-top:8px" onclick="installAppUpdate()">⬇️ Instalar ahora</button>';
}
async function installAppUpdate() {
  if (!isDesktopApp() || !pendingUpdateInstallerPath) return;
  if (!confirm('La app se cerrará para instalar la actualización. ¿Continuar?')) return;
  await window.comandasDesktop.installUpdate(pendingUpdateInstallerPath);
}
function saveSettingsForm() {
  const cfg = {
    nombre: document.getElementById('set-nombre').value.trim() || TICKET_CONFIG_DEFAULTS.nombre,
    direccion: document.getElementById('set-direccion').value.trim() || TICKET_CONFIG_DEFAULTS.direccion,
    telefono: document.getElementById('set-telefono').value.trim() || TICKET_CONFIG_DEFAULTS.telefono,
    nif: document.getElementById('set-nif').value.trim() || TICKET_CONFIG_DEFAULTS.nif,
    despedida: document.getElementById('set-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    textoPago: document.getElementById('set-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    anchoPapel: parseInt(document.getElementById('set-ancho-papel').value, 10),
    columnasAjuste: parseInt(document.getElementById('set-columnas-ajuste').value, 10) || 0,
    copias: Math.max(1, parseInt(document.getElementById('set-copias').value, 10) || 1),
    autoImprimir: document.getElementById('set-auto-imprimir').checked,
    modoImpresion: document.getElementById('set-modo-impresion').value,
    printerDeviceName: document.getElementById('set-printer-name') ? document.getElementById('set-printer-name').value : '',
    copiaAutoCadaDias: parseInt(document.getElementById('set-copia-auto-cada').value, 10) || 0,
  };
  saveTicketConfig(cfg);
  applyPrintPageSize();
  closeSettings();
  toast('✅ Ajustes guardados');
}

/* ── Gestionar carta: añadir/quitar productos sencillos y poner/quitar
   la etiqueta NUEVO, todo guardado en este ordenador (localStorage). ── */
const CARTA_NEW_CAT_SENTINEL = '__nueva__';
function openCartaAdmin() {
  const catSelect = document.getElementById('carta-new-cat');
  catSelect.innerHTML = categories.filter(c => c !== 'Todos').map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    + `<option value="${CARTA_NEW_CAT_SENTINEL}">➕ Nueva categoría…</option>`;
  document.getElementById('carta-new-cat-custom-group').style.display = 'none';
  document.getElementById('carta-new-cat-custom').value = '';
  document.getElementById('carta-new-name').value = '';
  document.getElementById('carta-new-price').value = '';
  document.getElementById('carta-new-desc').value = '';
  document.getElementById('carta-new-nuevo').checked = false;
  renderCartaAdminList();
  renderCartaExtrasList();
  document.getElementById('carta-modal').classList.add('open');
}
function closeCartaAdmin() { document.getElementById('carta-modal').classList.remove('open'); }
// Al elegir "➕ Nueva categoría…" aparece un campo para escribir su nombre
// (hasta ahora solo se podía elegir una categoría ya existente).
function onCartaCatSelectChange() {
  const esNueva = document.getElementById('carta-new-cat').value === CARTA_NEW_CAT_SENTINEL;
  document.getElementById('carta-new-cat-custom-group').style.display = esNueva ? '' : 'none';
  if (esNueva) document.getElementById('carta-new-cat-custom').focus();
}
function cartaExtraPrecioRow(tipo, name, precio) {
  return `<div class="option-row" style="cursor:default">
    <div class="option-title" style="font-size:13.5px">${escapeHtml(name)}</div>
    <div style="display:flex;align-items:center;gap:5px;flex-shrink:0">
      <input type="number" min="0" step="0.01" value="${precio}" style="width:72px;padding:7px 9px;border:1.5px solid var(--warm);border-radius:8px;font-size:13px;text-align:right;font-family:inherit"
        onchange="setExtraPrecio('${tipo}','${name.replace(/'/g, "\\'")}',this.value)">
      <span style="font-size:12px;color:var(--muted)">€</span>
    </div>
  </div>`;
}
function renderCartaExtrasList() {
  const el = document.getElementById('carta-extras-list');
  if (!el) return;
  const precios = loadExtrasPrecios();
  let html = '<div class="section-label" style="margin-top:0;font-size:11px">Salsas</div>';
  html += CUST_SAUCES.map(s => cartaExtraPrecioRow('salsa', s, precios.salsa[s])).join('');
  html += '<div class="section-label" style="font-size:11px">Ingredientes</div>';
  html += sortEs(CUST_INGREDIENTS).map(i => cartaExtraPrecioRow('ing', i, precios.ing[i])).join('');
  el.innerHTML = html;
}
function setExtraPrecio(tipo, name, value) {
  const n = parseFloat(String(value).replace(',', '.'));
  if (!(n >= 0)) { toast('⚠️ Precio no válido'); renderCartaExtrasList(); return; }
  saveExtraPrecio(tipo, name, n);
  toast('✅ ' + name + ': ' + fmt(n) + ' €');
}
function renderCartaAdminList() {
  const html = categories.filter(c => c !== 'Todos').map(cat => {
    const items = MENU.filter(m => m.cat === cat);
    if (!items.length) return '';
    return `<div class="section-label" style="margin-top:10px">${escapeHtml(cat)}</div>` + items.map(item => `
      <div class="carta-admin-row ${item.hidden ? 'agotado' : ''}" draggable="true"
        ondragstart="onCartaDragStart(event, ${item.id})"
        ondragover="onCartaDragOver(event)"
        ondrop="onCartaDrop(event, ${item.id})"
        ondragend="onCartaDragEnd(event)">
        <span class="carta-drag-handle" title="Arrastrar para mover">⠿</span>
        <div class="carta-admin-info">
          <span class="carta-admin-name">${escapeHtml(item.name)}${item.hidden ? ' <span class="carta-agotado-tag">Agotado</span>' : ''}</span>
          <span class="carta-admin-price">${fmt(item.price)} €</span>
        </div>
        <div class="carta-admin-actions">
          <button class="carta-nuevo-btn ${item.hidden ? 'on' : ''}" onclick="toggleCartaHidden(${item.id})" title="Ocultar/mostrar (agotado)">${item.hidden ? '🙈' : '👁️'}</button>
          <button class="carta-nuevo-btn ${item.nuevo ? 'on' : ''}" onclick="toggleCartaNuevo(${item.id})" title="Poner/quitar etiqueta NUEVO">🆕</button>
          <button class="carta-remove-btn" onclick="openCartaEdit(${item.id})" title="Editar nombre/descripción">✏️</button>
          <button class="carta-remove-btn" onclick="removeCartaProduct(${item.id}, '${item.name.replace(/'/g, "\\'")}')" title="Quitar de la carta">🗑️</button>
        </div>
      </div>`).join('');
  }).join('');
  document.getElementById('carta-admin-list').innerHTML = html;
}
let cartaDragId = null;
function onCartaDragStart(e, id) {
  cartaDragId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(id));
  e.currentTarget.classList.add('dragging');
}
function onCartaDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}
function onCartaDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  cartaDragId = null;
}
function onCartaDrop(e, targetId) {
  e.preventDefault();
  const dragId = cartaDragId;
  cartaDragId = null;
  if (dragId == null || dragId === targetId) return;
  const dragItem = MENU.find(m => m.id === dragId);
  const targetItem = MENU.find(m => m.id === targetId);
  if (!dragItem || !targetItem || dragItem.cat !== targetItem.cat) return;
  MENU.splice(MENU.indexOf(dragItem), 1);
  MENU.splice(MENU.indexOf(targetItem), 0, dragItem);
  saveMenuOrder();
  renderMenu();
  renderCartaAdminList();
}
let cartaEditingId = null;
function openCartaEdit(id) {
  const item = MENU.find(m => m.id === id);
  if (!item) return;
  cartaEditingId = id;
  document.getElementById('carta-edit-name').value = item.name;
  document.getElementById('carta-edit-price').value = item.price;
  document.getElementById('carta-edit-desc').value = item.desc || '';
  document.getElementById('carta-edit-quitar').checked = !isQuitarBlocked(id);
  document.getElementById('carta-edit-modal').classList.add('open');
}
function closeCartaEdit() { document.getElementById('carta-edit-modal').classList.remove('open'); cartaEditingId = null; }
function saveCartaEdit() {
  if (cartaEditingId == null) return;
  const id = cartaEditingId;
  const item = MENU.find(m => m.id === id);
  if (!item) return;
  const name = document.getElementById('carta-edit-name').value.trim();
  const price = parseFloat(document.getElementById('carta-edit-price').value);
  const desc = document.getElementById('carta-edit-desc').value.trim();
  const permitirQuitar = document.getElementById('carta-edit-quitar').checked;
  if (!name) { toast('⚠️ El nombre no puede estar vacío'); return; }
  if (!(price >= 0)) { toast('⚠️ Introduce un precio válido'); return; }
  item.name = name;
  item.price = price;
  item.desc = desc;
  const edits = loadMenuEdits();
  edits[id] = { name, price, desc };
  localStorage.setItem(MENU_EDITS_KEY, JSON.stringify(edits));
  const custom = loadMenuCustom();
  const c = custom.find(i => i.id === id);
  if (c) { c.name = name; c.price = price; c.desc = desc; localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom)); }
  const quitarOverrides = loadMenuQuitarOverrides();
  quitarOverrides[id] = !permitirQuitar;
  localStorage.setItem(MENU_QUITAR_OVERRIDES_KEY, JSON.stringify(quitarOverrides));
  renderMenu();
  renderCartaAdminList();
  closeCartaEdit();
  toast('✅ Producto actualizado');
}
function addCartaProduct() {
  const name = document.getElementById('carta-new-name').value.trim();
  const catSelect = document.getElementById('carta-new-cat').value;
  const cat = catSelect === CARTA_NEW_CAT_SENTINEL
    ? document.getElementById('carta-new-cat-custom').value.trim()
    : catSelect;
  const price = parseFloat(document.getElementById('carta-new-price').value);
  const desc = document.getElementById('carta-new-desc').value.trim();
  const nuevo = document.getElementById('carta-new-nuevo').checked;
  if (!name || !cat || !(price >= 0)) {
    toast(catSelect === CARTA_NEW_CAT_SENTINEL && !cat ? '⚠️ Escribe el nombre de la categoría nueva' : '⚠️ Rellena nombre, categoría y precio');
    return;
  }
  const nextId = Math.max(0, ...MENU.map(m => m.id)) + 1;
  const item = { id: nextId, cat, name, desc, price };
  if (nuevo) item.nuevo = true;
  const custom = loadMenuCustom();
  custom.push(item);
  localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom));
  MENU.push(item);
  // Si la categoría es nueva de verdad, tiene que aparecer ya en la propia
  // lista desplegable (y seguir seleccionada) por si se añaden más
  // productos seguidos a esa misma categoría.
  refreshCategoriesFromMenu();
  const wasNewCat = catSelect === CARTA_NEW_CAT_SENTINEL;
  initTabs();
  renderMenu();
  renderCartaAdminList();
  document.getElementById('carta-new-name').value = '';
  document.getElementById('carta-new-price').value = '';
  document.getElementById('carta-new-desc').value = '';
  document.getElementById('carta-new-nuevo').checked = false;
  const newCatSelect = document.getElementById('carta-new-cat');
  newCatSelect.innerHTML = categories.filter(c => c !== 'Todos').map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    + `<option value="${CARTA_NEW_CAT_SENTINEL}">➕ Nueva categoría…</option>`;
  if (wasNewCat) newCatSelect.value = cat;
  document.getElementById('carta-new-cat-custom-group').style.display = 'none';
  document.getElementById('carta-new-cat-custom').value = '';
  toast(wasNewCat ? '✅ Categoría "' + cat + '" creada con este producto' : '✅ Producto añadido');
}
function removeCartaProduct(id, name) {
  if (!confirm('¿Quitar "' + name + '" de la carta?')) return;
  const idx = MENU.findIndex(m => m.id === id);
  if (idx !== -1) MENU.splice(idx, 1);
  // Si era un producto añadido a mano, se quita también de la lista guardada de añadidos.
  const custom = loadMenuCustom().filter(i => i.id !== id);
  localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom));
  // Si era un producto de fábrica, se guarda como quitado para que no reaparezca.
  const removed = loadMenuRemoved();
  if (!removed.includes(id)) { removed.push(id); localStorage.setItem(MENU_REMOVED_KEY, JSON.stringify(removed)); }
  renderMenu();
  renderCartaAdminList();
  toast('🗑️ Producto quitado');
}
function toggleCartaHidden(id) {
  const item = MENU.find(m => m.id === id);
  if (!item) return;
  item.hidden = !item.hidden;
  const overrides = loadMenuHiddenOverrides();
  overrides[id] = item.hidden;
  localStorage.setItem(MENU_HIDDEN_OVERRIDES_KEY, JSON.stringify(overrides));
  const custom = loadMenuCustom();
  const c = custom.find(i => i.id === id);
  if (c) { c.hidden = item.hidden; localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom)); }
  renderMenu();
  renderCartaAdminList();
  toast(item.hidden ? '🙈 Producto marcado como agotado' : '👁️ Producto visible de nuevo');
}
function toggleCartaNuevo(id) {
  const item = MENU.find(m => m.id === id);
  if (!item) return;
  item.nuevo = !item.nuevo;
  const overrides = loadMenuNuevoOverrides();
  overrides[id] = item.nuevo;
  localStorage.setItem(MENU_NUEVO_OVERRIDES_KEY, JSON.stringify(overrides));
  // Si es un producto añadido a mano, actualiza también su copia guardada.
  const custom = loadMenuCustom();
  const c = custom.find(i => i.id === id);
  if (c) { c.nuevo = item.nuevo; localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom)); }
  renderMenu();
  renderCartaAdminList();
}

/* ── "📦 Stock limitado": pestaña aparte (no dentro de cada producto)
   para llevar la cuenta de lo que se va gastando de pan de panini y de
   boniato — ambos limitados. Cada variedad de panini tiene su propio
   contador; el boniato solo se diferencia en normal vs G.O.A.T. (el
   único que lleva un ingrediente distinto, queso de cabra).
   Cada entrada guarda { inicial, usado }: "inicial" se pone a mano al
   empezar el turno (unidades de hoy). El consumo real se cuenta SOLO:
   sumando lo que ya se ha vendido hoy (unidadesVendidasHoyPorMenuId, a
   partir del historial de comandas ya impresas) más lo que hay ahora
   mismo en la comanda en curso sin imprimir todavía
   (unidadesEnCarritoPorMenuId) — así no hay que marcar nada a mano,
   se mueve solo según se van tomando comandas de verdad. "usado" queda
   como ajuste manual aparte (mermas, regalos fuera de una comanda...),
   que se suma encima de ese conteo automático. Mientras "inicial" sea 0
   (no se ha puesto), el producto no tiene límite y nunca sale agotado.
   En cuanto el total llega a inicial, el producto pasa a AGOTADO: no se
   puede añadir más al pedido. Se reinicia solo cada día (clave con
   fecha). ── */
// Unidades de un producto (por id de MENU) ya vendidas hoy de verdad, según
// el historial de comandas ya impresas — cuenta también las de un pedido
// ya borrado del historial (p.ej. tras "Modificar") como NO vendidas, ya
// que en ese momento ha vuelto a la comanda en curso (ver
// unidadesEnCarritoPorMenuId), evitando contar dos veces.
function unidadesVendidasHoyPorMenuId(id) {
  let sum = 0;
  getHistorial(todayISO()).forEach(order => {
    (order.items || []).forEach(it => { if (it._menuId === id) sum += it.qty; });
  });
  return sum;
}
// Unidades de ese producto en la comanda EN CURSO (todavía sin imprimir) —
// se suman también, para no poder marcar de golpe más paninis de los que
// quedan dentro de un mismo pedido grande.
function unidadesEnCarritoPorMenuId(id, esPanini) {
  if (esPanini) return cart[id] || 0;
  // Un boniato ahora puede estar en el carrito simple (tocando la casilla,
  // tal cual) o en extrasCart (personalizado desde el carrito) — hay que
  // sumar los dos sitios para que el stock no se quede corto.
  return (cart[id] || 0) + Object.values(extrasCart).reduce((s, c) => s + (c.menuId === id && c.qty > 0 ? c.qty : 0), 0);
}
function getPaniniCountsKey() { return 'dpf_comandas_panini_counts_' + todayISO(); }
function loadPaniniCounts() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(getPaniniCountsKey()) || '{}'); } catch (e) { raw = {}; }
  const out = {};
  Object.keys(raw).forEach(id => {
    const v = raw[id];
    out[id] = (v && typeof v === 'object') ? { inicial: v.inicial || 0, usado: v.usado || 0 } : { inicial: 0, usado: v || 0 };
  });
  return out;
}
function savePaniniCounts(counts) { localStorage.setItem(getPaniniCountsKey(), JSON.stringify(counts)); }
function getPaniniEntry(id) { return loadPaniniCounts()[id] || { inicial: 0, usado: 0 }; }
function paniniUsadoTotal(id) {
  const e = getPaniniEntry(id);
  return e.usado + unidadesVendidasHoyPorMenuId(id) + unidadesEnCarritoPorMenuId(id, true);
}
function paniniRestante(id) {
  const e = getPaniniEntry(id);
  if (!e.inicial) return null; // sin límite puesto hoy
  return Math.max(0, e.inicial - paniniUsadoTotal(id));
}
// El − / + de aquí abajo ajustan directamente "unidades hoy" (antes eran
// para un contador de mermas/regalos aparte que no se usaba, con las
// flechitas nativas del <input type=number> para poner "unidades hoy" —
// diminutas e imposibles de tocar bien en la pantalla táctil).
function changePaniniInicial(id, delta) {
  const counts = loadPaniniCounts();
  const entry = counts[id] || { inicial: 0, usado: 0 };
  entry.inicial = Math.max(0, entry.inicial + delta);
  counts[id] = entry;
  savePaniniCounts(counts);
  renderStockModal();
  renderMenu();
}
function setPaniniInicial(id, valor) {
  const counts = loadPaniniCounts();
  const entry = counts[id] || { inicial: 0, usado: 0 };
  entry.inicial = Math.max(0, parseInt(valor, 10) || 0);
  counts[id] = entry;
  savePaniniCounts(counts);
  renderStockModal();
  renderMenu();
}

const BONIATO_STOCK_TIPOS = { normal: 'Boniato normal', goat: 'Boniato G.O.A.T.' };
function getBoniatoCountsKey() { return 'dpf_comandas_boniato_counts_' + todayISO(); }
function loadBoniatoCounts() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(getBoniatoCountsKey()) || '{}'); } catch (e) { raw = {}; }
  const norm = (v) => (v && typeof v === 'object') ? { inicial: v.inicial || 0, usado: v.usado || 0 } : { inicial: 0, usado: v || 0 };
  return { normal: norm(raw.normal), goat: norm(raw.goat) };
}
function saveBoniatoCounts(counts) { localStorage.setItem(getBoniatoCountsKey(), JSON.stringify(counts)); }
// El "normal" agrupa varios platos de boniato distintos (todo BONIATO_IDS
// salvo el G.O.A.T., que va aparte) bajo un mismo cupo de stock.
function boniatoIdsForTipo(tipo) {
  return tipo === 'goat' ? [BONIATO_GOAT_ID] : [...BONIATO_IDS].filter(id => id !== BONIATO_GOAT_ID);
}
function boniatoUsadoTotal(tipo) {
  const e = loadBoniatoCounts()[tipo];
  const ids = boniatoIdsForTipo(tipo);
  const vendido = ids.reduce((s, id) => s + unidadesVendidasHoyPorMenuId(id), 0);
  const enCarrito = ids.reduce((s, id) => s + unidadesEnCarritoPorMenuId(id, false), 0);
  return e.usado + vendido + enCarrito;
}
function boniatoRestante(tipo) {
  const e = loadBoniatoCounts()[tipo];
  if (!e.inicial) return null;
  return Math.max(0, e.inicial - boniatoUsadoTotal(tipo));
}
function changeBoniatoInicial(tipo, delta) {
  const counts = loadBoniatoCounts();
  const entry = counts[tipo];
  entry.inicial = Math.max(0, entry.inicial + delta);
  saveBoniatoCounts(counts);
  renderStockModal();
  renderMenu();
}
function setBoniatoInicial(tipo, valor) {
  const counts = loadBoniatoCounts();
  counts[tipo].inicial = Math.max(0, parseInt(valor, 10) || 0);
  saveBoniatoCounts(counts);
  renderStockModal();
  renderMenu();
}

// Restante (unidades que quedan) de un producto de la carta: null = sin
// límite puesto hoy, nunca agotado. Se usa tanto en el modal de stock
// como al pintar la carta (para bloquear "+ Añadir" y mostrar AGOTADO).
function getStockRestanteForItem(item) {
  if (item.cat === 'Paninis') return paniniRestante(item.id);
  if (BONIATO_IDS.has(item.id)) return boniatoRestante(item.id === BONIATO_GOAT_ID ? 'goat' : 'normal');
  return null;
}
function isItemAgotado(item) {
  const r = getStockRestanteForItem(item);
  return r !== null && r <= 0;
}

// Antes: un <input type=number> con flechitas nativas diminutas para
// "unidades hoy", y aparte un − / 🛒 N / + / ↺ para un ajuste manual de
// mermas que no se usaba. Confirmado en la tienda que las flechitas no se
// pueden tocar bien en la pantalla táctil del mostrador — ahora el − / +
// (grandes, táctiles) ajustan "unidades hoy" directamente; el número
// sigue siendo editable a mano si hace falta poner uno exacto de golpe.
function stockCounterRow(label, entry, vendidoAuto, onInicial, onMinus, onPlus) {
  const restante = entry.inicial ? Math.max(0, entry.inicial - (entry.usado + vendidoAuto)) : null;
  const restanteHtml = restante === null
    ? `<span class="stock-restante sin-limite">Sin límite</span>`
    : `<span class="stock-restante ${restante <= 0 ? 'agotado' : restante <= 2 ? 'bajo' : 'ok'}">${restante <= 0 ? 'AGOTADO' : 'Quedan ' + restante}</span>`;
  return `<div class="stock-row">
    <div class="stock-row-head">
      <span class="stock-row-label">${escapeHtml(label)}</span>
      ${restanteHtml}
    </div>
    <div class="stock-row-body">
      <div class="stock-inicial-row">
        <button class="stock-btn" onclick="${onMinus}">−</button>
        <div class="stock-inicial-box">
          <input type="tel" inputmode="numeric" class="stock-inicial-input" value="${entry.inicial || 0}" onchange="${onInicial}this.value)">
          <label>Unidades hoy</label>
        </div>
        <button class="stock-btn" onclick="${onPlus}">+</button>
      </div>
      ${vendidoAuto > 0 ? `<div class="stock-auto-note" title="Vendidos hoy en comandas — se cuentan solos">🛒 ${vendidoAuto} vendidas hoy</div>` : ''}
    </div>
  </div>`;
}
function renderStockModal() {
  const paninis = MENU.filter(m => m.cat === 'Paninis');
  document.getElementById('stock-paninis-rows').innerHTML = paninis.map(item => stockCounterRow(
    item.name, getPaniniEntry(item.id),
    unidadesVendidasHoyPorMenuId(item.id) + unidadesEnCarritoPorMenuId(item.id, true),
    `setPaniniInicial(${item.id},`,
    `changePaniniInicial(${item.id},-1)`, `changePaniniInicial(${item.id},1)`
  )).join('');
  const boniato = loadBoniatoCounts();
  document.getElementById('stock-boniato-rows').innerHTML = Object.entries(BONIATO_STOCK_TIPOS).map(([tipo, label]) => {
    const ids = boniatoIdsForTipo(tipo);
    const vendidoAuto = ids.reduce((s, id) => s + unidadesVendidasHoyPorMenuId(id) + unidadesEnCarritoPorMenuId(id, false), 0);
    return stockCounterRow(
      label, boniato[tipo], vendidoAuto,
      `setBoniatoInicial('${tipo}',`,
      `changeBoniatoInicial('${tipo}',-1)`, `changeBoniatoInicial('${tipo}',1)`
    );
  }).join('');
}
function openStockModal() {
  renderStockModal();
  document.getElementById('stock-modal').classList.add('open');
}
function closeStockModal() { document.getElementById('stock-modal').classList.remove('open'); }

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
/* ── Elegir impresora USB (solo app de escritorio, cuando hay varios
   dispositivos conectados) — modal grande y táctil dentro de la propia
   página, en vez del diálogo nativo del sistema que main.js usaba antes
   (bloqueaba la app entera mientras esperaba, con botones diminutos). ── */
function showUsbDevicePickerModal(nombres) {
  const list = document.getElementById('usb-picker-list');
  list.innerHTML = nombres.map((nombre, i) =>
    `<button class="btn-secondary" style="width:100%;padding:16px;font-size:15px" onclick="chooseUsbDevicePicker(${i})">${escapeHtml(nombre)}</button>`
  ).join('');
  document.getElementById('usb-picker-modal').classList.add('open');
}
function chooseUsbDevicePicker(index) {
  document.getElementById('usb-picker-modal').classList.remove('open');
  if (isDesktopApp()) window.comandasDesktop.chooseUsbDevice(index);
}

document.addEventListener('DOMContentLoaded', () => {
  applyFontChoice(loadFontChoice());
  applyPrintPageSize();
  initTabs();
  renderMenu();
  initCartSwipeToDelete();
  restoreCartDraftIfAny();
  renderCart();
  trySilentReconnect();
  purgarHistorialAntiguoSiToca();
  if (isDesktopApp() && window.comandasDesktop.onUsbDevicePicker) {
    window.comandasDesktop.onUsbDevicePicker(showUsbDevicePickerModal);
  }
});
