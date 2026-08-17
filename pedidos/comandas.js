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
  { id: 2, cat: "Patatas", name: "Patata Vegetal", desc: "Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural", price: 5.60 },
  { id: 3, cat: "Patatas", name: "Patata Picante", desc: "Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas", price: 5.60 },
  { id: 4, cat: "Patatas", name: "Patata Carbonara", desc: "Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario", price: 5.80 },
  { id: 5, cat: "Patatas", name: "Patata Boloñesa", desc: "Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario", price: 5.80 },
  { id: 6, cat: "Patatas", name: "Patata Hawaiana", desc: "Mayonesa, york, aceitunas, maíz, piña y queso mozzarella", price: 5.80 },
  { id: 7, cat: "Patatas", name: "Patata Kebab", desc: "Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla", price: 5.90 },
  { id: 8, cat: "Patatas", name: "Patata 4 Quesos", desc: "Salsa roquefort, emmental, gouda y mozzarella", price: 5.90 },
  { id: 9, cat: "Patatas", name: "Patata Completa", desc: "Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón", price: 6.20 },
  { id: 10, cat: "Patatas", name: "Patata Carnívora", desc: "Alioli, york, bacon, kebab y carne picada", price: 6.40 },
  { id: 11, cat: "Patatas", name: "Patata Philadelphia", desc: "Salsa philadelphia, york, huevo, pollo, queso mozzarella", price: 6.40 },
  { id: 12, cat: "Patatas", name: "Patata Ranchera", desc: "Salsa ranchera, pollo, bacon y queso mozzarella", price: 6.50 },
  { id: 13, cat: "Patatas", name: "Patata Granollers", desc: "Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria", price: 6.50 },
  { id: 14, cat: "Patatas", name: "Patata Pulled Pork", desc: "Salsa barbacoa, cebolla, carne pulled pork y mozzarella", price: 6.50, nuevo: true },
  { id: 50, cat: "Patatas", name: "Patata Cheddar-Bacon", desc: "Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado", price: 8.50, nuevo: true },
  { id: 15, cat: "Patatas", name: "Patata Al Gusto", desc: "1 salsa a elegir y 6 ingredientes", price: 6.90 },
  { id: 16, cat: "Patatas", name: "Patata Bomba", desc: "9 ingredientes y/o salsas al gusto ¡sin límite!", price: 8.40, nuevo: true },

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

  { id: 41, cat: "Bebidas", name: "Refresco lata", desc: "", price: 1.10 },
  { id: 42, cat: "Bebidas", name: "Cerveza lata", desc: "", price: 1.20 },
  { id: 43, cat: "Bebidas", name: "Agua pequeña", desc: "", price: 0.80 },
  { id: 44, cat: "Bebidas", name: "Refresco 500 ml", desc: "", price: 1.80 },
  { id: 45, cat: "Bebidas", name: "Cerveza 1 litro", desc: "", price: 1.80 },
  { id: 46, cat: "Bebidas", name: "Monster o Red Bull", desc: "", price: 1.80 },
  { id: 47, cat: "Bebidas", name: "Agua 1,5 litros", desc: "", price: 1.30 },
  { id: 48, cat: "Bebidas", name: "Nestea / Aquarius 1,5 l", desc: "", price: 2.20 },
  { id: 49, cat: "Bebidas", name: "Refresco 2 litros", desc: "", price: 2.50 },

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
const EXTRAS_ING_PRECIO1 = ["4 Quesos", "Atún", "Bacon", "Carne Kebab", "Carne Picada", "Gambas", "Huevo", "Jamón York", "Pollo", "Queso Mozzarella", "Tronquitos de Mar"];
const EXTRAS_ING_PRECIO07 = ["Aceitunas", "Cebolla", "Champiñón", "Maíz", "Piña", "Remolacha", "Tomate Natural", "Zanahoria"];
const EXTRAS_SALSA_PRECIO = 0.90;

const CUSTOMIZER_CONFIG = {
  algusto: { name: "Patata Al Gusto", price: 6.90, maxSauces: 1, maxIngredients: 6, maxTotal: null, subtitle: "Hasta 1 salsa y hasta 6 ingredientes a elegir" },
  bomba: { name: "Patata Bomba 🆕", price: 8.40, maxSauces: null, maxIngredients: null, maxTotal: 9, subtitle: "Hasta 9 ingredientes y/o salsas a elegir" },
};
const CUST_SAUCES = ["Alioli", "Ketchup", "Mayonesa", "Queso Philadelphia", "Salsa BBQ", "Salsa Brava", "Salsa de Yogur", "Salsa Ranchera", "Salsa Roquefort", "Salsa Rosa", "Tomate Frito"];
const CUST_INGREDIENTS = ["4 Quesos", "Aceitunas", "Atún", "Bacon", "Carne Kebab", "Carne Picada", "Cebolla", "Champiñón", "Gambas", "Huevo", "Jamón York", "Maíz", "Piña", "Pollo", "Queso Mozzarella", "Remolacha", "Tomate Natural", "Tronquitos de Mar", "Zanahoria"];

const BOLSA_ID = 52;
// Orden fijo de categorías en la barra lateral y en "Todos" (siempre igual,
// sin importar el orden en que estén los productos en MENU).
const CATEGORY_ORDER = ["Patatas", "Boniato", "Paninis", "Tartas", "Cookies", "Bebidas"];
const menuCatsSet = new Set(MENU.filter(i => i.id !== BOLSA_ID).map(i => i.cat));
const extraCats = [...menuCatsSet].filter(c => !CATEGORY_ORDER.includes(c));
const categories = ["Todos", ...CATEGORY_ORDER.filter(c => menuCatsSet.has(c)), ...extraCats];
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
function setOrderPaid(v) {
  orderPaid = v;
  document.getElementById('paid-btn-no').classList.toggle('active', !orderPaid);
  document.getElementById('paid-btn-yes').classList.toggle('active', orderPaid);
  document.getElementById('payment-method-row').style.display = orderPaid ? 'flex' : 'none';
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
const CATEGORY_ICONS = { Todos: '🍽️', Patatas: '🥔', Boniato: '🍠', Paninis: '🍕', Cookies: '🍪', Tartas: '🍰', Bebidas: '🥤', Extras: '🛍️' };

function initTabs() {
  const catTabs = categories.map(c =>
    `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')"><span class="tab-icon">${CATEGORY_ICONS[c] || '🍽️'}</span>${c}</button>`
  ).join('');
  document.getElementById('tabs').innerHTML = catTabs
    + `<button class="tab" onclick="addBolsaDirect()"><span class="tab-icon">${CATEGORY_ICONS.Extras}</span>Bolsa +${fmt(0.10)}€</button>`
    + `<button class="tab" onclick="openStockModal()"><span class="tab-icon">📦</span>Stock limitado</button>`;
}
function setCategory(cat) { activeCategory = cat; initTabs(); renderMenu(); }
function addBolsaDirect() {
  changeQty(BOLSA_ID, 1);
  toast('🛍️ Bolsa añadida (+0,10 €)');
}

function renderItemRow(item) {
  const qty = cart[item.id] || 0;
  const isSpecial = item.id === 15 || item.id === 16 || item.id === CHEDDAR_ID || ALL_EXTRAS_IDS.has(item.id) || BONIATO_IDS.has(item.id);
  const nameHtml = escapeHtml(item.name) + (item.nuevo ? '<span class="item-badge-new">Nuevo</span>' : '');
  const control = isSpecial
    ? `<button class="add-btn" id="addbtn-${item.id}" onclick="onAddClick(${item.id})">+ Añadir</button>`
    : (qty > 0
      ? `<div class="qty-stepper"><button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button><span class="qty-value">${qty}</span><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button></div>`
      : `<button class="add-btn" onclick="changeQty(${item.id},1)">+ Añadir</button>`);
  const showBlockedWarn = isQuitarBlocked(item.id) && parseBaseComponents(item).length > 0;
  return `<div class="item-row" id="card-${item.id}">
    <div class="item-info">
      <div class="item-name">${nameHtml}</div>
      ${item.desc ? `<div class="item-desc">${escapeHtml(item.desc)}</div>` : ''}
      ${showBlockedWarn ? `<div class="item-warn">⚠️ NO se pueden quitar ingredientes</div>` : ''}
    </div>
    <div class="item-controls">
      <div class="item-price">${fmt(item.price)} €</div>
      ${control}
    </div>
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
  const btn = document.querySelector(`#card-${id} .add-btn`);
  if (btn) {
    btn.classList.remove('popping');
    void btn.offsetWidth;
    btn.classList.add('popping');
  }
}

function onAddClick(id) {
  if (id === 15 || id === 16) { openCustomizer(id); return; }
  if (id === CHEDDAR_ID) { openCheddarModal(); return; }
  if (ALL_EXTRAS_IDS.has(id) || BONIATO_IDS.has(id)) { openExtrasModal(id); return; }
}

function changeQty(id, delta) {
  const current = cart[id] || 0;
  const next = current + delta;
  if (next <= 0) delete cart[id]; else cart[id] = next;
  renderMenu();
  renderCart();
  if (delta > 0) animateAdd(id);
}
function removeItem(id) { delete cart[id]; renderMenu(); renderCart(); }
function removeCustItem(key) { delete custCart[key]; renderCart(); }
function removeExtrasItem(key) { delete extrasCart[key]; renderCart(); }

function changeCustQty(key, delta) {
  const c = custCart[key];
  if (!c) return;
  c.qty += delta;
  if (c.qty <= 0) delete custCart[key];
  renderCart();
}
function changeExtrasQty(key, delta) {
  const c = extrasCart[key];
  if (!c) return;
  c.qty += delta;
  if (c.qty <= 0) delete extrasCart[key];
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

/* ══════════════════════════════════════════════════════════════
   CARRITO
   ══════════════════════════════════════════════════════════════ */
// Si se acumulan tantos ingredientes/salsas extra como una Al Gusto o una
// Bomba, se cobra el precio plano de esa patata en vez de sumar cada
// extra por separado (evita cobrar de más por construir, ingrediente a
// ingrediente, lo mismo que ya sale más barato como Al Gusto/Bomba).
function priceOfPick(p) { return p.type === 'salsa' ? EXTRAS_SALSA_PRECIO : (EXTRAS_ING_PRECIO1.includes(p.name) ? 1 : 0.7); }

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
    (ingredientesExtra || []).forEach(i => { core += EXTRAS_ING_PRECIO1.includes(i) ? 1 : 0.7; });
    core += salsaCount * EXTRAS_SALSA_PRECIO;
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
  (e.salsasExtra || []).forEach(s => out.push('+ ' + s + ' (salsa extra +' + fmt(EXTRAS_SALSA_PRECIO) + '€)'));
  return out;
}
// Igual que getExtrasItemDetails() pero como {name, price} — así el
// ticket puede alinear el precio de cada extra a la derecha, igual que
// en un ticket real impreso (ej. "  - QUESO           +1.00 EUR").
function getExtrasItemTicketExtras(e) {
  const out = [];
  (e.quitados || []).forEach(q => out.push({ name: 'Sin ' + q }));
  (e.cambios || []).forEach(c => out.push({ name: c.from + ' por ' + c.to }));
  // Orden fijo en el ticket: primero salsas, luego ingredientes, y el
  // queso/gratinado siempre al final, sin importar cuándo se eligieron.
  const upgraded = extrasIsAutoUpgraded(e.ingredientesExtra, e.salsasExtra);
  const free = upgraded ? 0 : computeFreeSwapPasses((e.quitados || []).length, (e.cambios || []).length);
  const freeSet = freeSwapPickSet(e.pickOrder, free);
  (e.salsasExtra || []).forEach(s => out.push({ name: s, price: (upgraded || freeSet.has('salsa:' + s)) ? null : EXTRAS_SALSA_PRECIO }));
  quesoLastKeepOrder(e.ingredientesExtra || []).forEach(i => out.push({ name: i, price: (upgraded || freeSet.has('ing:' + i)) ? null : (EXTRAS_ING_PRECIO1.includes(i) ? 1 : 0.7) }));
  if (e.queso) out.push({ name: 'Queso', price: 1 });
  if (e.gratinado) out.push({ name: 'Gratinado', price: 0.5 });
  return out;
}
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
}

/* ══════════════════════════════════════════════════════════════
   DESCUENTO / OFERTA — se aplica como una línea más del pedido
   (con importe negativo), igual que hace la web con la fidelización.
   ══════════════════════════════════════════════════════════════ */
let orderDiscount = null; // {type:'percent'|'fixed', value, label}

function openDiscountModal() {
  document.getElementById('discount-type').value = orderDiscount ? orderDiscount.type : 'percent';
  document.getElementById('discount-value').value = orderDiscount ? orderDiscount.value : '';
  document.getElementById('discount-label').value = orderDiscount ? (orderDiscount.label || '') : '';
  document.getElementById('discount-error').style.display = 'none';
  document.getElementById('discount-remove-btn').style.display = orderDiscount ? 'inline-block' : 'none';
  document.getElementById('discount-modal').classList.add('open');
}
function closeDiscountModal() { document.getElementById('discount-modal').classList.remove('open'); }
function applyPresetDiscount() {
  orderDiscount = { type: 'percent', value: 10, label: 'ESTUDIANTE/JUBILADO' };
  closeDiscountModal();
  renderCart();
  toast('✅ Descuento aplicado');
}
function applyDiscount() {
  const type = document.getElementById('discount-type').value;
  const value = parseFloat(document.getElementById('discount-value').value);
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
  orderDiscount = { type, value, label };
  closeDiscountModal();
  renderCart();
  toast('✅ Descuento aplicado');
}
function removeDiscount() {
  orderDiscount = null;
  closeDiscountModal();
  renderCart();
  toast('Descuento eliminado');
}
function discountLineLabel(forTicket) {
  const label = (orderDiscount.label && orderDiscount.label.trim()) || 'Descuento';
  const suffix = orderDiscount.type === 'percent' ? ' (-' + orderDiscount.value + '%)' : '';
  return (forTicket ? '' : '🏷️ ') + label + suffix;
}
function computeDiscountAmount(subtotal) {
  if (!orderDiscount || subtotal <= 0) return 0;
  let amt = orderDiscount.type === 'percent' ? subtotal * orderDiscount.value / 100 : orderDiscount.value;
  return Math.max(0, Math.min(amt, subtotal));
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
    document.getElementById('paid-toggle-row').style.display = 'none';
    document.getElementById('print-btn').disabled = true;
    syncCashTotal(0);
    clearCartDraft();
    return;
  }
  document.getElementById('paid-toggle-row').style.display = 'flex';

  let total = 0;
  const rows = []; // { rank, html } — se ordenan por categoría antes de pintar

  lines.forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    const subtotal = item.price * qty;
    total += subtotal;
    rows.push({ rank: categoryRank(item.cat), html: `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(item.name)}</span>
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeQty(${item.id},-1)">−</button>
        <span>${qty}</span>
        <button class="qty-btn-sm" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-remove" onclick="removeItem(${item.id})" title="Quitar">🗑️</button>
    </div>` });
  });

  custLines.forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + (c.extraSauces || []).length * EXTRAS_SALSA_PRECIO;
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients, c.extraQueso ? 'Queso mozzarella' : '', c.extraGratinado ? 'Gratinado' : '', ...(c.extraSauces || []).map(s => s + ' (salsa extra +' + fmt(EXTRAS_SALSA_PRECIO) + '€)')].filter(Boolean).join(', ');
    rows.push({ rank: categoryRank(item.cat), html: `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(item.name)}</span>
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeCustQty('${c.key}',-1)">−</button>
        <span>${c.qty}</span>
        <button class="qty-btn-sm" onclick="changeCustQty('${c.key}',1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-edit" onclick="editCustItem('${c.key}')" title="Editar">✏️</button>
      <button class="cart-remove" onclick="removeCustItem('${c.key}')" title="Quitar">🗑️</button>
      <div class="cart-line-extra">${escapeHtml(details)}</div>
    </div>` });
  });

  extLines.forEach(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const details = getExtrasItemDetails(c).join(' · ');
    const baseItem = MENU.find(m => m.id == c.menuId);
    rows.push({ rank: categoryRank(baseItem ? baseItem.cat : ''), html: `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(getExtrasItemLabel(c))}</span>
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeExtrasQty('${c.key}',-1)">−</button>
        <span>${c.qty}</span>
        <button class="qty-btn-sm" onclick="changeExtrasQty('${c.key}',1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-edit" onclick="editExtrasItem('${c.key}')" title="Editar">✏️</button>
      <button class="cart-remove" onclick="removeExtrasItem('${c.key}')" title="Quitar">🗑️</button>
      ${details ? `<div class="cart-line-extra">${escapeHtml(details)}</div>` : ''}
    </div>` });
  });

  rows.sort((a, b) => a.rank - b.rank);
  let html = rows.map(r => r.html).join('');

  const discountAmount = computeDiscountAmount(total);
  if (discountAmount > 0) {
    html += `<div class="cart-line cart-line-discount">
      <span class="cart-line-name">${escapeHtml(discountLineLabel())}</span>
      <span class="cart-line-price">-${fmt(discountAmount)} €</span>
      <button class="cart-edit" onclick="openDiscountModal()" title="Editar">✏️</button>
      <button class="cart-remove" onclick="removeDiscount()" title="Quitar">🗑️</button>
    </div>`;
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
      name: (document.getElementById('order-name') || {}).value || '',
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
  const nameEl = document.getElementById('order-name');
  if (nameEl) nameEl.value = draft.name || '';
  setOrderPaid(!!draft.paid);
  setPaymentMethod(draft.paymentMethod || 'efectivo');
  renderMenu();
  renderCart();
  toast('🔄 Se ha recuperado una comanda sin terminar de antes');
}

/* ══════════════════════════════════════════════════════════════
   CALCULADORA DE CAMBIO (pago en efectivo) — siempre visible, debajo
   de la comanda; el total se rellena solo desde el carrito pero se
   puede editar a mano para calcular un cobro suelto.
   ══════════════════════════════════════════════════════════════ */
let cashTotalEdited = false;
// El teclado táctil (type="tel") no valida el formato como type="number",
// así que aquí se admite tanto coma como punto decimal.
function parseCashNum(str) { return parseFloat(String(str || '').replace(',', '.')) || 0; }
function syncCashTotal(orderTotal) {
  if (!cashTotalEdited) document.getElementById('cash-total').value = orderTotal > 0 ? orderTotal.toFixed(2) : '';
  updateChange();
}
// Al abrir el desplegable "Cobrar", refresca siempre el total con el de
// la comanda actual (por si se había escrito un importe suelto antes).
function onCashCalcToggle() {
  if (document.getElementById('cash-calc').open) {
    cashTotalEdited = false;
    syncCashTotal(currentOrderTotal());
  }
}
function addCashAmount(v) {
  const el = document.getElementById('cash-received');
  el.value = (parseCashNum(el.value) + v).toFixed(2);
  updateChange();
}
function clearCashReceived() {
  document.getElementById('cash-received').value = '';
  cashTotalEdited = false;
  syncCashTotal(currentOrderTotal());
}
function currentOrderTotal() {
  const el = document.getElementById('cart-total');
  return el ? parseFloat(el.textContent.replace(',', '.')) || 0 : 0;
}
function updateChange() {
  const total = parseCashNum(document.getElementById('cash-total').value);
  const received = parseCashNum(document.getElementById('cash-received').value);
  const row = document.getElementById('cash-change-row');
  const label = document.getElementById('cash-change-label');
  const amountEl = document.getElementById('cash-change-amount');
  if (received <= 0) { row.style.display = 'none'; return; }
  row.style.display = 'flex';
  const change = received - total;
  if (change < -0.001) {
    label.textContent = 'Faltan';
    amountEl.textContent = fmt(-change) + ' €';
    row.className = 'cash-change-row short';
  } else {
    label.textContent = 'Cambio a devolver';
    amountEl.textContent = fmt(Math.max(0, change)) + ' €';
    row.className = 'cash-change-row ok';
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
      name: document.getElementById('order-name').value,
      paid: orderPaid,
      paymentMethod,
    };
  }
  cart = {}; custCart = {}; extrasCart = {}; orderDiscount = null;
  document.getElementById('order-name').value = '';
  document.getElementById('cash-received').value = '';
  cashTotalEdited = false;
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
  document.getElementById('order-name').value = clearedOrderSnapshot.name || '';
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
let custType = null, custSelSauces = [], custSelIngredients = [], custExtraQueso = false, custExtraGratinado = false, custSelExtraSauces = [], custEditKey = null;

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
  } else {
    custSelSauces = []; custSelIngredients = []; custExtraQueso = false; custExtraGratinado = false; custSelExtraSauces = [];
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
function custHasQuesoIngredient() { return custSelIngredients.some(isQuesoIngredient); }
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
    const label = extra ? n + ' +' + fmt(EXTRAS_SALSA_PRECIO) + '€' : n;
    return `<button class="chip ${sel ? 'selected' : ''} ${extra ? 'extra' : ''}" onclick="toggleCustSauce('${n.replace(/'/g, "\\'")}')">${label}</button>`;
  }).join('');
  iEl.innerHTML = sortIngredientsQuesoLast(CUST_INGREDIENTS).map(n => {
    const sel = custSelIngredients.includes(n);
    const disabled = !sel && ((cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal));
    return `<button class="chip ${sel ? 'selected' : ''} ${disabled ? 'disabled' : ''}" onclick="toggleCustIng('${n.replace(/'/g, "\\'")}')">${n}</button>`;
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
function toggleCustIng(n) {
  const i = custSelIngredients.indexOf(n);
  if (i >= 0) custSelIngredients.splice(i, 1);
  else {
    const cfg = CUSTOMIZER_CONFIG[custType];
    if ((cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal)) return;
    custSelIngredients.push(n);
  }
  if (custHasQuesoIngredient() && custExtraQueso) {
    custExtraQueso = false;
    updateCustExtraUI('queso', false);
  }
  renderCustChips(); renderCustExtrasSection(); updateCustBadges(); updateCustTotalPrice();
}
function updateCustBadges() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const extraNote = custSelExtraSauces.length ? ' (+' + custSelExtraSauces.length + ' salsa extra)' : '';
  if (cfg.maxTotal !== null) {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length + extraNote;
    document.getElementById('cust-ing-badge').textContent = custSelTotal() + '/' + cfg.maxTotal;
  } else {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length + '/' + cfg.maxSauces + extraNote;
    document.getElementById('cust-ing-badge').textContent = custSelIngredients.length + '/' + cfg.maxIngredients;
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
  p += custSelExtraSauces.length * EXTRAS_SALSA_PRECIO;
  document.getElementById('cust-price').textContent = fmt(p) + ' €';
}
function confirmCustomizer() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';
  if (cfg.maxTotal !== null && custSelTotal() === 0 && custSelExtraSauces.length === 0) {
    errEl.textContent = 'Elige al menos 1 ingrediente o salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxTotal === null && custSelIngredients.length === 0 && custSelSauces.length === 0 && custSelExtraSauces.length === 0) {
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
      <div><div class="option-title" style="font-size:13px">${s}</div><div class="option-sub">+${fmt(EXTRAS_SALSA_PRECIO)} €</div></div>
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
  const n = Object.values(cheddarSalsasExtra).filter(Boolean).length;
  document.getElementById('cheddar-price').textContent = fmt(item.price + n * EXTRAS_SALSA_PRECIO) + ' €';
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
function closeExtrasModal() { document.getElementById('extras-modal').classList.remove('open'); extrasCurrentId = null; extrasEditKey = null; }

// La salsa de cada patata es siempre el primer ingrediente de la
// descripción (p.ej. "Salsa philadelphia, york, huevo..."), pero no
// siempre lleva la palabra "salsa" en el nombre (Nata, Tomate frito,
// Mayonesa, Alioli, Aceite de oliva) — de ahí la lista aparte.
const SALSA_EXTRA_NAMES = new Set(['nata', 'tomate frito', 'mayonesa', 'alioli', 'aceite de oliva']);
function esComponenteSalsa(comp) {
  const c = comp.trim().toLowerCase();
  return c.includes('salsa') || SALSA_EXTRA_NAMES.has(c);
}
function renderExtrasBody(item) {
  const isBoniato = BONIATO_IDS.has(item.id);
  const soloGratinado = EXTRAS_SOLO_GRATINADO.has(item.id);
  const baseComponents = parseBaseComponents(item);
  const canQuitar = !isQuitarBlocked(item.id) && baseComponents.length > 0;
  const salsaComponents = baseComponents.filter(esComponenteSalsa);
  const ingComponents = baseComponents.filter(c => !esComponenteSalsa(c));
  let html = '';
  if (canQuitar) {
    html += `<div class="section-label" style="margin-top:0">Quitar ingredientes</div><div class="chip-grid">`;
    baseComponents.forEach(comp => {
      const on = !!extrasQuitados[comp];
      html += `<button class="chip ${on ? 'quitado' : ''}" onclick="toggleExtraQuitar('${comp.replace(/'/g, "\\'")}')">${on ? '🚫 ' : ''}${escapeHtml(comp)}</button>`;
    });
    html += `</div>`;
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
  } else if (isQuitarBlocked(item.id)) {
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
        const precio = EXTRAS_ING_PRECIO1.includes(ing) ? 1 : 0.7;
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
          <div><div class="option-title" style="font-size:13px">${s}</div><div class="option-sub">+${fmt(EXTRAS_SALSA_PRECIO)} €</div></div>
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
  copias: 1,
  autoImprimir: true,
  modoImpresion: 'auto',
};
function getTicketConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(TICKET_CONFIG_KEY) || '{}');
    return Object.assign({}, TICKET_CONFIG_DEFAULTS, saved);
  } catch (e) { return Object.assign({}, TICKET_CONFIG_DEFAULTS); }
}
function saveTicketConfig(cfg) { localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg)); }

function getPaperWidthChars() { return getTicketConfig().anchoPapel == 58 ? 32 : 48; }

function buildOrderObject(preview) {
  const items = [];
  Object.entries(cart).forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    items.push({ name: item.name, qty, subtotal: item.price * qty, extras: [], _rank: categoryRank(item.cat) });
  });
  Object.values(custCart).filter(c => c.qty > 0).forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + (c.extraSauces || []).length * EXTRAS_SALSA_PRECIO;
    // En el ticket el orden es siempre fijo, sin importar en qué momento
    // se eligió cada cosa: primero todas las salsas (incluidas y extra),
    // luego los ingredientes, y el queso/gratinado siempre al final.
    const extras = [
      ...c.sauces.map(n => ({ name: n })),
      ...(c.extraSauces || []).map(s => ({ name: s, price: EXTRAS_SALSA_PRECIO })),
      ...quesoLastKeepOrder(c.ingredients).map(n => ({ name: n })),
    ];
    if (c.extraQueso) extras.push({ name: 'Queso', price: 1 });
    if (c.extraGratinado) extras.push({ name: 'Gratinado', price: 0.5 });
    // La línea principal muestra solo el precio de la Al Gusto/Bomba en sí
    // (sus salsas/ingredientes ya van incluidos); queso/gratinado/salsa
    // extra van cada uno en su línea con su propio precio.
    items.push({ name: item.name, qty: c.qty, subtotal: unitPrice * c.qty, displaySubtotal: item.price * c.qty, extras, _rank: categoryRank(item.cat) });
  });
  Object.values(extrasCart).filter(c => c.qty > 0).forEach(c => {
    const baseItem = MENU.find(m => m.id == c.menuId);
    items.push({
      name: getExtrasItemLabel(c), qty: c.qty,
      subtotal: getExtrasItemPrice(c) * c.qty,
      displaySubtotal: getExtrasItemBaseSubtotal(c) * c.qty,
      extras: getExtrasItemTicketExtras(c),
      _rank: categoryRank(baseItem ? baseItem.cat : ''),
    });
  });
  items.sort((a, b) => a._rank - b._rank);
  items.forEach(it => delete it._rank);
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const discountAmount = computeDiscountAmount(subtotal);
  if (discountAmount > 0) {
    items.push({ name: discountLineLabel(true), qty: 1, subtotal: -discountAmount, extras: [] });
  }
  const total = items.reduce((s, it) => s + it.subtotal, 0);
  return {
    num: preview ? peekNextOrderNum() : getNextOrderNum(),
    time: new Date().toLocaleString('es-ES'),
    name: document.getElementById('order-name').value.trim(),
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
const TICKET_DIVIDER = '-'.repeat(48);
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
  const lines = twoCol(prefix + nombre, precio, width);
  (item.extras || []).forEach(ex => {
    const label = '  - ' + foldAccents(ex.name).toUpperCase();
    if (ex.price) lines.push(...twoCol(label, '+' + fmtEur(ex.price), width));
    else lines.push(label.substring(0, width));
  });
  return lines;
}

// Construye el ticket como una lista de bloques en el mismo orden que
// imprimirUnaCopia(): {logo:true} o {text, align, big, bold, notesLabel}.
function buildTicketBlocks(order) {
  const cfg = getTicketConfig();
  const width = getPaperWidthChars();
  const B = [];
  B.push({ logo: true });
  B.push({ text: foldAccents(cfg.nombre), align: 'center', big: true });
  B.push({ text: foldAccents(cfg.direccion), align: 'center' });
  B.push({ text: foldAccents(cfg.telefono), align: 'center' });
  B.push({ text: 'NIF: ' + foldAccents(cfg.nif), align: 'center' });
  B.push({ text: TICKET_DIVIDER, align: 'center' });
  B.push({ text: foldAccents((order.name || '').toUpperCase()), align: 'center', big: true });
  B.push({ text: TICKET_DIVIDER, align: 'center' });
  B.push({ text: foldAccents('PEDIDO ' + order.num), align: 'center', big: true });
  B.push({ text: foldAccents(order.time), align: 'center' });
  B.push({ text: TICKET_DIVIDER, align: 'center' });
  order.items.forEach(it => {
    formatItemLines(it, width).forEach(text => B.push({ text, align: 'left' }));
  });
  B.push({ text: TICKET_DIVIDER, align: 'left' });
  B.push({ text: fmtEur(order.total || 0), align: 'center', big: true });
  B.push({ text: order.paid ? 'PAGADO' : 'NO PAGADO', align: 'center', big: true, paidStatus: order.paid ? 'yes' : 'no' });
  if (order.paid) {
    B.push({ text: '(' + (order.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo') + ')', align: 'center' });
  }
  B.push({ text: foldAccents(cfg.textoPago), align: 'center' });
  if (order.notes) {
    B.push({ text: TICKET_DIVIDER, align: 'left' });
    B.push({ text: 'NOTAS: ' + foldAccents(order.notes), align: 'left', notesLabel: true });
  }
  B.push({ text: TICKET_DIVIDER, align: 'center' });
  B.push({ text: foldAccents(cfg.despedida), align: 'center' });
  B.push({ text: 'IVA incluido 10%', align: 'center' });
  return B;
}

/* ── Vista previa en pantalla / diálogo de impresión (HTML) ── */
function buildTicketPreviewHTML(order) {
  const blocks = buildTicketBlocks(order);
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
    html += '<div style="' + style + '">' + (escapeHtml(b.text) || '&nbsp;') + '</div>';
  });
  return html;
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
function buildEscPosBytes(order) {
  const blocks = buildTicketBlocks(order);
  const b = new EscPosBuilder();
  b.init();
  blocks.forEach(blk => {
    if (blk.logo) { b.logo(); return; }
    blk.align === 'center' ? b.center() : b.left();
    blk.big ? b.big() : b.normal();
    if (blk.notesLabel) {
      const idx = blk.text.indexOf(': ') + 2;
      b.bold(true); b.text(blk.text.slice(0, idx)); b.bold(false); b.text(blk.text.slice(idx));
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
function getHistorialKey(fecha) { return 'dpf_comandas_historial_' + (fecha || todayISO()); }
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
  renderHistorial();
  document.getElementById('historial-modal').classList.add('open');
}
function closeHistorial() { document.getElementById('historial-modal').classList.remove('open'); }
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
  document.getElementById('order-name').value = order.name || '';
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
  document.getElementById('caja-summary').innerHTML = avisoBackup
    + `<div class="section-label" style="margin-top:4px">Pedidos: ${nPedidos}</div>`
    + row('💵 Cobrado en efectivo', efectivo)
    + row('💳 Cobrado con tarjeta', tarjeta)
    + `<div style="border-top:1px solid var(--warm);margin:8px 0"></div>`
    + row('Total facturado', facturado, true)
    + row('💰 Efectivo esperado en caja', esperadoCajon, true);
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
function exportarCopiaHoyJSON() {
  const fecha = cajaFechaSel || todayISO();
  const copia = {
    fecha,
    generadoEn: new Date().toLocaleString('es-ES'),
    fondoCaja: loadCajaFondo(fecha),
    totales: loadCajaTotales(fecha),
    pedidos: getHistorial(fecha),
  };
  _descargarArchivo('dulce-patata-copia-' + fecha + '.json', JSON.stringify(copia, null, 2), 'application/json');
  marcarBackupHecho(fecha);
  renderCaja();
  toast('📥 Copia descargada');
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

function updatePrinterStatusUI() {
  const el = document.getElementById('printer-status');
  if (printerDevice) {
    el.textContent = '🖨️ Impresora conectada';
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
    if (list.length) await openAndClaim(list[0]);
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
    if (!list.length) throw new Error('No hay impresora emparejada');
    await openAndClaim(list[0]);
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
    if (printerDevice && e.device === printerDevice) { printerDevice = null; printerEndpoint = null; updatePrinterStatusUI(); }
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
  let printedViaUsb = false;
  let usbFailed = false;
  if (cfg.modoImpresion !== 'dialog') {
    try {
      const bytes = buildEscPosBytes(order);
      const copies = Math.max(1, parseInt(cfg.copias, 10) || 1);
      for (let i = 0; i < copies; i++) await sendToPrinter(bytes);
      printedViaUsb = true;
    } catch (e) {
      console.warn('[comandas] impresión directa falló, usando diálogo:', e);
      usbFailed = true;
    }
  }
  if (!printedViaUsb) window.print();
  updatePrinterStatusUI();
  playPrintSound(!usbFailed);
  return printedViaUsb;
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
  };
  // Se guarda en "Pedidos de hoy" ANTES de intentar imprimir — si el envío
  // a la impresora se queda colgado o falla del todo, la comanda ya está a
  // salvo (y su número ya no queda "hueco") y se puede reimprimir después
  // desde ahí, en vez de perderse por completo si hay que recargar la
  // página para desatascarse.
  saveToHistorial(order);
  let printedViaUsb = false;
  try {
    printedViaUsb = await printOrder(order);
  } finally {
    btn.disabled = false;
  }
  if (getTicketConfig().autoImprimir !== false) clearOrder(true);
  toast(printedViaUsb ? '✅ Comanda ' + order.num + ' impresa' : '🖨️ Comanda ' + order.num + ' — abriendo diálogo de impresión…');
  openCopyConfirm(order);
}

/* ── ¿Imprimir copia? — aparece justo después de imprimir la comanda ── */
let copyConfirmOrder = null;
function openCopyConfirm(order) {
  copyConfirmOrder = order;
  document.getElementById('copy-confirm-sub').textContent = 'Comanda ' + order.num;
  document.getElementById('copy-confirm-modal').classList.add('open');
}
function closeCopyConfirm() { document.getElementById('copy-confirm-modal').classList.remove('open'); copyConfirmOrder = null; }
async function printCopyConfirmed() {
  if (!copyConfirmOrder) return;
  await printOrder(copyConfirmOrder);
  toast('🖨️ Copia de la comanda ' + copyConfirmOrder.num + ' impresa');
  closeCopyConfirm();
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
  document.getElementById('set-copias').value = String(cfg.copias);
  document.getElementById('set-auto-imprimir').checked = cfg.autoImprimir !== false;
  document.getElementById('set-modo-impresion').value = cfg.modoImpresion;
  document.getElementById('settings-modal').classList.add('open');
}
function closeSettings() { document.getElementById('settings-modal').classList.remove('open'); }
function saveSettingsForm() {
  const cfg = {
    nombre: document.getElementById('set-nombre').value.trim() || TICKET_CONFIG_DEFAULTS.nombre,
    direccion: document.getElementById('set-direccion').value.trim() || TICKET_CONFIG_DEFAULTS.direccion,
    telefono: document.getElementById('set-telefono').value.trim() || TICKET_CONFIG_DEFAULTS.telefono,
    nif: document.getElementById('set-nif').value.trim() || TICKET_CONFIG_DEFAULTS.nif,
    despedida: document.getElementById('set-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    textoPago: document.getElementById('set-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    anchoPapel: parseInt(document.getElementById('set-ancho-papel').value, 10),
    copias: Math.max(1, parseInt(document.getElementById('set-copias').value, 10) || 1),
    autoImprimir: document.getElementById('set-auto-imprimir').checked,
    modoImpresion: document.getElementById('set-modo-impresion').value,
  };
  saveTicketConfig(cfg);
  closeSettings();
  toast('✅ Ajustes guardados');
}

/* ── Gestionar carta: añadir/quitar productos sencillos y poner/quitar
   la etiqueta NUEVO, todo guardado en este ordenador (localStorage). ── */
function openCartaAdmin() {
  const catSelect = document.getElementById('carta-new-cat');
  catSelect.innerHTML = categories.filter(c => c !== 'Todos').map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  document.getElementById('carta-new-name').value = '';
  document.getElementById('carta-new-price').value = '';
  document.getElementById('carta-new-desc').value = '';
  document.getElementById('carta-new-nuevo').checked = false;
  renderCartaAdminList();
  document.getElementById('carta-modal').classList.add('open');
}
function closeCartaAdmin() { document.getElementById('carta-modal').classList.remove('open'); }
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
  const cat = document.getElementById('carta-new-cat').value;
  const price = parseFloat(document.getElementById('carta-new-price').value);
  const desc = document.getElementById('carta-new-desc').value.trim();
  const nuevo = document.getElementById('carta-new-nuevo').checked;
  if (!name || !cat || !(price >= 0)) { toast('⚠️ Rellena nombre, categoría y precio'); return; }
  const nextId = Math.max(0, ...MENU.map(m => m.id)) + 1;
  const item = { id: nextId, cat, name, desc, price };
  if (nuevo) item.nuevo = true;
  const custom = loadMenuCustom();
  custom.push(item);
  localStorage.setItem(MENU_CUSTOM_KEY, JSON.stringify(custom));
  MENU.push(item);
  renderMenu();
  renderCartaAdminList();
  document.getElementById('carta-new-name').value = '';
  document.getElementById('carta-new-price').value = '';
  document.getElementById('carta-new-desc').value = '';
  document.getElementById('carta-new-nuevo').checked = false;
  toast('✅ Producto añadido');
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
   único que lleva un ingrediente distinto, queso de cabra). Es manual
   — no se engancha a lo que se vende — así vale igual si algo se hace
   fuera de una comanda normal. Se reinicia solo cada día (clave con
   fecha), igual que el resto de contadores de la app. ── */
function getPaniniCountsKey() { return 'dpf_comandas_panini_counts_' + todayISO(); }
function loadPaniniCounts() {
  try { return JSON.parse(localStorage.getItem(getPaniniCountsKey()) || '{}'); } catch (e) { return {}; }
}
function savePaniniCounts(counts) { localStorage.setItem(getPaniniCountsKey(), JSON.stringify(counts)); }
function loadPaniniItemCount(id) { return loadPaniniCounts()[id] || 0; }
function changePaniniItemCount(id, delta) {
  const counts = loadPaniniCounts();
  counts[id] = Math.max(0, (counts[id] || 0) + delta);
  savePaniniCounts(counts);
  renderStockModal();
}
function resetPaniniItemCount(id) {
  if (!loadPaniniItemCount(id)) return;
  if (!confirm('¿Reiniciar este contador a 0?')) return;
  const counts = loadPaniniCounts();
  counts[id] = 0;
  savePaniniCounts(counts);
  renderStockModal();
}

const BONIATO_STOCK_TIPOS = { normal: 'Boniato normal', goat: 'Boniato G.O.A.T.' };
function getBoniatoCountsKey() { return 'dpf_comandas_boniato_counts_' + todayISO(); }
function loadBoniatoCounts() {
  try {
    const c = JSON.parse(localStorage.getItem(getBoniatoCountsKey()) || '{}');
    return { normal: c.normal || 0, goat: c.goat || 0 };
  } catch (e) { return { normal: 0, goat: 0 }; }
}
function saveBoniatoCounts(counts) { localStorage.setItem(getBoniatoCountsKey(), JSON.stringify(counts)); }
function changeBoniatoCount(tipo, delta) {
  const counts = loadBoniatoCounts();
  counts[tipo] = Math.max(0, (counts[tipo] || 0) + delta);
  saveBoniatoCounts(counts);
  renderStockModal();
}
function resetBoniatoCount(tipo) {
  const counts = loadBoniatoCounts();
  if (!counts[tipo]) return;
  if (!confirm('¿Reiniciar este contador a 0?')) return;
  counts[tipo] = 0;
  saveBoniatoCounts(counts);
  renderStockModal();
}

function stockCounterRow(label, value, onMinus, onPlus, onReset) {
  return `<div class="stock-row">
    <span class="stock-row-label">${escapeHtml(label)}</span>
    <div class="stock-row-controls">
      <button class="stock-btn" onclick="${onMinus}">−</button>
      <span class="stock-value">${value}</span>
      <button class="stock-btn" onclick="${onPlus}">+</button>
      <button class="stock-reset" title="Reiniciar" onclick="${onReset}">↺</button>
    </div>
  </div>`;
}
function renderStockModal() {
  const paninis = MENU.filter(m => m.cat === 'Paninis');
  document.getElementById('stock-paninis-rows').innerHTML = paninis.map(item => stockCounterRow(
    item.name, loadPaniniItemCount(item.id),
    `changePaniniItemCount(${item.id},-1)`, `changePaniniItemCount(${item.id},1)`, `resetPaniniItemCount(${item.id})`
  )).join('');
  const boniato = loadBoniatoCounts();
  document.getElementById('stock-boniato-rows').innerHTML = Object.entries(BONIATO_STOCK_TIPOS).map(([tipo, label]) => stockCounterRow(
    label, boniato[tipo],
    `changeBoniatoCount('${tipo}',-1)`, `changeBoniatoCount('${tipo}',1)`, `resetBoniatoCount('${tipo}')`
  )).join('');
}
function openStockModal() {
  renderStockModal();
  document.getElementById('stock-modal').classList.add('open');
}
function closeStockModal() { document.getElementById('stock-modal').classList.remove('open'); }

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyFontChoice(loadFontChoice());
  initTabs();
  renderMenu();
  restoreCartDraftIfAny();
  renderCart();
  trySilentReconnect();
});
