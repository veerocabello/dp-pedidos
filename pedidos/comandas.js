/* ==========================================================================
   Comandas — Dulce Patata Food
   Herramienta offline de mostrador: misma carta y formato que la web de
   pedidos, pero funciona sin internet (todo el código y los datos están en
   este archivo, no depende de Firebase ni de ningún servidor) e imprime en
   una impresora térmica conectada por cable.
   ========================================================================== */

/* ── CARTA ── (mismos productos y precios que pedidos/src/carta.js) */
const MENU = [
  { id: 1, cat: "Patatas", name: "Patata Simple", desc: "Aceite de oliva o mantequilla, sal y pimienta", price: 3.00 },
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
];

const CHEDDAR_ID = 50;
const EXTRAS_SOLO_GRATINADO = new Set([4, 5, 6, 8, 11, 12, 14]); // ya llevan mozzarella
const EXTRAS_QUESO_Y_GRATINADO = new Set([1, 2, 3, 7, 9, 10, 13]);
const ALL_EXTRAS_IDS = new Set([...EXTRAS_SOLO_GRATINADO, ...EXTRAS_QUESO_Y_GRATINADO]);
const EXTRAS_ING_PRECIO1 = ["Jamón York", "Carne Picada", "Pollo", "Carne Kebab", "Atún", "Gambas", "Tronquitos de Mar", "Huevo", "Bacon", "Queso Mozzarella", "4 Quesos"];
const EXTRAS_ING_PRECIO07 = ["Tomate Natural", "Maíz", "Aceitunas", "Zanahoria", "Remolacha", "Piña", "Cebolla", "Champiñón"];

const CUSTOMIZER_CONFIG = {
  algusto: { name: "Patata Al Gusto", price: 6.90, maxSauces: 1, maxIngredients: 6, maxTotal: null, subtitle: "Hasta 1 salsa y hasta 6 ingredientes a elegir" },
  bomba: { name: "Patata Bomba 🆕", price: 8.40, maxSauces: null, maxIngredients: null, maxTotal: 9, subtitle: "Hasta 9 ingredientes y/o salsas a elegir" },
};
const CUST_SAUCES = ["Ranchera", "Brava", "BBQ", "Ketchup", "Mayonesa", "Alioli", "Salsa Rosa", "Salsa de Yogur", "Tomate Frito", "Queso Philadelphia", "Roquefort"];
const CUST_INGREDIENTS = ["Jamón York", "Carne Picada", "Pollo", "Carne Kebab", "Atún", "Gambas", "Tronquitos de Mar", "Huevo", "Bacon", "Queso Mozzarella", "4 Quesos", "Tomate Natural", "Maíz", "Aceitunas", "Zanahoria", "Remolacha", "Piña", "Cebolla", "Champiñón"];

const categories = ["Todos", ...new Set(MENU.map(i => i.cat))];
let activeCategory = "Todos";

/* ── Estado del carrito (3 capas, igual que en la web) ── */
let cart = {};        // id -> qty (productos simples, sin personalizar)
let custCart = {};    // key -> {menuId, qty, sauces[], ingredients[], extraQueso, extraGratinado}
let extrasCart = {};  // key -> {menuId, qty, queso, gratinado, ingredientesExtra[], basePrice, cheddarCarne?}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmt(n) { return n.toFixed(2).replace('.', ','); }
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
function initTabs() {
  document.getElementById('tabs').innerHTML = categories.map(c =>
    `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')">${c}</button>`
  ).join('');
}
function setCategory(cat) { activeCategory = cat; initTabs(); renderMenu(); }

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const items = activeCategory === 'Todos' ? MENU : MENU.filter(m => m.cat === activeCategory);
  grid.innerHTML = items.map(item => {
    const qty = cart[item.id] || 0;
    const isSpecial = item.id === 15 || item.id === 16 || item.id === CHEDDAR_ID || ALL_EXTRAS_IDS.has(item.id);
    const nameHtml = escapeHtml(item.name) + (item.nuevo ? '<span class="product-badge-new">Nuevo</span>' : '');
    const control = isSpecial
      ? `<button class="add-btn" id="addbtn-${item.id}" onclick="onAddClick(${item.id})">+ Añadir</button>`
      : (qty > 0
        ? `<div class="qty-stepper"><button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button><span class="qty-value">${qty}</span><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button></div>`
        : `<button class="add-btn" onclick="changeQty(${item.id},1)">+ Añadir</button>`);
    return `<div class="product-card" id="card-${item.id}">
      <div class="product-name">${nameHtml}</div>
      <div class="product-desc">${escapeHtml(item.desc || '')}</div>
      <div class="product-footer">
        <div class="product-price">${fmt(item.price)} €</div>
        ${control}
      </div>
    </div>`;
  }).join('');
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
  if (ALL_EXTRAS_IDS.has(id)) { openExtrasModal(id); return; }
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

/* ══════════════════════════════════════════════════════════════
   CARRITO
   ══════════════════════════════════════════════════════════════ */
function getExtrasItemPrice(e) {
  let t = e.basePrice + (e.queso ? 1 : 0) + (e.gratinado ? 0.5 : 0);
  (e.ingredientesExtra || []).forEach(i => {
    if (EXTRAS_ING_PRECIO1.includes(i)) t += 1;
    else if (EXTRAS_ING_PRECIO07.includes(i)) t += 0.7;
  });
  return t;
}
function getExtrasItemLabel(e) {
  const item = MENU.find(m => m.id == e.menuId);
  if (!item) return 'Producto desconocido';
  if (e.cheddarCarne) return item.name + ' (' + e.cheddarCarne + ')';
  return item.name;
}
function getExtrasItemDetails(e) {
  const out = [];
  if (e.queso) out.push('+ Queso mozzarella');
  if (e.gratinado) out.push('+ Gratinado');
  (e.ingredientesExtra || []).forEach(i => out.push('+ ' + i));
  return out;
}
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
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
    document.getElementById('print-btn').disabled = true;
    return;
  }

  let total = 0;
  let html = '';

  lines.forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    const subtotal = item.price * qty;
    total += subtotal;
    html += `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(item.name)}</span>
      <span class="cart-line-qty">x${qty}</span>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-remove" onclick="removeItem(${item.id})" title="Quitar">🗑️</button>
    </div>`;
  });

  custLines.forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0);
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients, c.extraQueso ? 'Queso mozzarella' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(', ');
    html += `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(item.name)}</span>
      <span class="cart-line-qty">x${c.qty}</span>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-remove" onclick="removeCustItem('${c.key}')" title="Quitar">🗑️</button>
      <div class="cart-line-extra">${escapeHtml(details)}</div>
    </div>`;
  });

  extLines.forEach(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const details = getExtrasItemDetails(c).join(' · ');
    html += `<div class="cart-line">
      <span class="cart-line-name">${escapeHtml(getExtrasItemLabel(c))}</span>
      <span class="cart-line-qty">x${c.qty}</span>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-remove" onclick="removeExtrasItem('${c.key}')" title="Quitar">🗑️</button>
      ${details ? `<div class="cart-line-extra">${escapeHtml(details)}</div>` : ''}
    </div>`;
  });

  bodyEl.innerHTML = html;
  totalRowEl.style.display = 'flex';
  document.getElementById('cart-total').textContent = fmt(total) + ' €';
  document.getElementById('print-btn').disabled = false;
}

function clearOrder(silent) {
  cart = {}; custCart = {}; extrasCart = {};
  document.getElementById('order-name').value = '';
  document.getElementById('order-notes').value = '';
  renderMenu();
  renderCart();
  if (!silent) toast('Comanda vaciada');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CUSTOMIZER (Al Gusto / Bomba)
   ══════════════════════════════════════════════════════════════ */
let custType = null, custSelSauces = [], custSelIngredients = [], custExtraQueso = false, custExtraGratinado = false;

function openCustomizer(id) {
  custType = id === 15 ? 'algusto' : 'bomba';
  custSelSauces = []; custSelIngredients = []; custExtraQueso = false; custExtraGratinado = false;
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-price').textContent = fmt(cfg.price) + ' €';
  document.getElementById('cust-error').style.display = 'none';
  updateCustExtraUI('queso', false);
  updateCustExtraUI('gratinado', false);
  renderCustChips();
  updateCustBadges();
  document.getElementById('customizer-modal').classList.add('open');
}
function closeCustomizer() { document.getElementById('customizer-modal').classList.remove('open'); custType = null; }

function custSelTotal() { return custSelSauces.length + custSelIngredients.length; }

function renderCustChips() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const sEl = document.getElementById('cust-sauces');
  const iEl = document.getElementById('cust-ingredients');
  sEl.innerHTML = CUST_SAUCES.map(n => {
    const sel = custSelSauces.includes(n);
    const disabled = !sel && ((cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal));
    return `<button class="chip ${sel ? 'selected' : ''} ${disabled ? 'disabled' : ''}" onclick="toggleCustSauce('${n.replace(/'/g, "\\'")}')">${n}</button>`;
  }).join('');
  iEl.innerHTML = CUST_INGREDIENTS.map(n => {
    const sel = custSelIngredients.includes(n);
    const disabled = !sel && ((cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal));
    return `<button class="chip ${sel ? 'selected' : ''} ${disabled ? 'disabled' : ''}" onclick="toggleCustIng('${n.replace(/'/g, "\\'")}')">${n}</button>`;
  }).join('');
}
function toggleCustSauce(n) {
  const i = custSelSauces.indexOf(n);
  if (i >= 0) custSelSauces.splice(i, 1);
  else {
    const cfg = CUSTOMIZER_CONFIG[custType];
    if ((cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal)) return;
    custSelSauces.push(n);
  }
  renderCustChips(); updateCustBadges();
}
function toggleCustIng(n) {
  const i = custSelIngredients.indexOf(n);
  if (i >= 0) custSelIngredients.splice(i, 1);
  else {
    const cfg = CUSTOMIZER_CONFIG[custType];
    if ((cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients) || (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal)) return;
    custSelIngredients.push(n);
  }
  renderCustChips(); updateCustBadges();
}
function updateCustBadges() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (cfg.maxTotal !== null) {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length;
    document.getElementById('cust-ing-badge').textContent = custSelTotal() + '/' + cfg.maxTotal;
  } else {
    document.getElementById('cust-sauce-badge').textContent = custSelSauces.length + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-badge').textContent = custSelIngredients.length + '/' + cfg.maxIngredients;
  }
}
function toggleCustExtra(which) {
  if (which === 'queso') {
    custExtraQueso = !custExtraQueso;
    if (!custExtraQueso && custExtraGratinado) { custExtraGratinado = false; updateCustExtraUI('gratinado', false); }
  } else {
    custExtraGratinado = !custExtraGratinado;
    if (custExtraGratinado && !custExtraQueso) { custExtraQueso = true; updateCustExtraUI('queso', true); }
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
  document.getElementById('cust-price').textContent = fmt(p) + ' €';
}
function confirmCustomizer() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';
  if (cfg.maxTotal !== null && custSelTotal() === 0) {
    errEl.textContent = 'Elige al menos 1 ingrediente o salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxTotal === null && custSelIngredients.length === 0 && custSelSauces.length === 0) {
    errEl.textContent = 'Elige al menos 1 ingrediente';
    errEl.style.display = 'block';
    return;
  }
  const key = 'cust:' + custType + ':' + Date.now() + ':' + Math.random().toString(36).slice(2, 7);
  custCart[key] = {
    menuId: custType === 'algusto' ? 15 : 16,
    qty: 1,
    sauces: [...custSelSauces],
    ingredients: [...custSelIngredients],
    extraQueso: custExtraQueso,
    extraGratinado: custExtraGratinado,
    key,
  };
  closeCustomizer();
  renderCart();
  toast('✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CHEDDAR-BACON
   ══════════════════════════════════════════════════════════════ */
let cheddarCarne = null;
function openCheddarModal() {
  cheddarCarne = null;
  ['picada', 'kebab'].forEach(k => document.getElementById('cheddar-check-' + k).classList.remove('on'));
  document.getElementById('cheddar-error').style.display = 'none';
  document.getElementById('cheddar-modal').classList.add('open');
}
function closeCheddarModal() { document.getElementById('cheddar-modal').classList.remove('open'); }
function selectCheddarCarne(k) {
  cheddarCarne = k;
  ['picada', 'kebab'].forEach(x => document.getElementById('cheddar-check-' + x).classList.toggle('on', x === k));
  document.getElementById('cheddar-error').style.display = 'none';
}
function confirmCheddar() {
  if (!cheddarCarne) {
    document.getElementById('cheddar-error').style.display = 'block';
    return;
  }
  const item = MENU.find(m => m.id === CHEDDAR_ID);
  const key = 'ext:' + CHEDDAR_ID + ':' + cheddarCarne;
  if (extrasCart[key]) extrasCart[key].qty++;
  else extrasCart[key] = { menuId: CHEDDAR_ID, qty: 1, queso: false, gratinado: false, ingredientesExtra: [], basePrice: item.price, cheddarCarne, key };
  closeCheddarModal();
  renderCart();
  toast('✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — EXTRAS (patatas 1-14: queso/gratinado + ingredientes extra)
   ══════════════════════════════════════════════════════════════ */
let extrasCurrentId = null, extrasQueso = false, extrasGratinado = false, extrasIngredientes = {};

function openExtrasModal(id) {
  extrasCurrentId = id; extrasQueso = false; extrasGratinado = false; extrasIngredientes = {};
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + fmt(item.price) + ' €';
  const soloGratinado = EXTRAS_SOLO_GRATINADO.has(id);
  let html = '';
  if (!soloGratinado) {
    html += `<label class="option-row" onclick="toggleExtra('queso')">
      <div><div class="option-title">🧀 Añadir queso mozzarella</div><div class="option-sub">+1,00 €</div></div>
      <div class="option-check" id="extra-check-queso"></div>
    </label>`;
  }
  html += `<label class="option-row" onclick="toggleExtra('gratinado')">
    <div><div class="option-title">🔥 Gratinar${soloGratinado ? '' : ' (con queso)'}</div><div class="option-sub">+0,50 €${soloGratinado ? '' : ' · incluye gratinado del queso'}</div></div>
    <div class="option-check" id="extra-check-gratinado"></div>
  </label>`;
  html += `<div class="section-label">Ingredientes extra</div><div class="ing-grid">`;
  [...EXTRAS_ING_PRECIO1, ...EXTRAS_ING_PRECIO07].forEach(ing => {
    const precio = EXTRAS_ING_PRECIO1.includes(ing) ? 1 : 0.7;
    const slug = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    html += `<label id="lbl-${slug}" class="option-row" style="margin-bottom:0;padding:9px 10px" onclick="toggleExtraIng('${ing.replace(/'/g, "\\'")}')">
      <div><div class="option-title" style="font-size:13px">${ing}</div><div class="option-sub">+${fmt(precio)} €</div></div>
      <div class="option-check" id="${slug}" style="width:20px;height:20px"></div>
    </label>`;
  });
  html += `</div>`;
  document.getElementById('extras-options').innerHTML = html;
  updateExtrasTotalPrice();
  document.getElementById('extras-modal').classList.add('open');
}
function closeExtrasModal() { document.getElementById('extras-modal').classList.remove('open'); extrasCurrentId = null; }
function toggleExtra(which) {
  if (which === 'queso') extrasQueso = !extrasQueso; else extrasGratinado = !extrasGratinado;
  const el = document.getElementById('extra-check-' + which);
  if (el) el.classList.toggle('on', which === 'queso' ? extrasQueso : extrasGratinado);
  updateExtrasTotalPrice();
}
function toggleExtraIng(ing) {
  extrasIngredientes[ing] = !extrasIngredientes[ing];
  const slug = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
  const el = document.getElementById(slug);
  if (el) el.classList.toggle('on', !!extrasIngredientes[ing]);
  updateExtrasTotalPrice();
}
function updateExtrasTotalPrice() {
  const item = MENU.find(m => m.id == extrasCurrentId);
  if (!item) return;
  let p = item.price + (extrasQueso ? 1 : 0) + (extrasGratinado ? 0.5 : 0);
  Object.entries(extrasIngredientes).forEach(([ing, on]) => {
    if (!on) return;
    p += EXTRAS_ING_PRECIO1.includes(ing) ? 1 : 0.7;
  });
  document.getElementById('extras-total-price').textContent = fmt(p) + ' €';
}
function confirmExtras() {
  const id = extrasCurrentId;
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  const ingList = Object.entries(extrasIngredientes).filter(([, on]) => on).map(([ing]) => ing).sort();
  const sig = (extrasQueso ? 'Q' : '') + (extrasGratinado ? 'G' : '') + (ingList.length ? 'I' + ingList.join('|') : '') || 'BASE';
  const key = 'ext:' + id + ':' + sig;
  if (extrasCart[key]) extrasCart[key].qty++;
  else extrasCart[key] = { menuId: id, qty: 1, queso: extrasQueso, gratinado: extrasGratinado, ingredientesExtra: ingList, basePrice: item.price, key };
  closeExtrasModal();
  renderCart();
  toast('✅ Añadido al pedido');
}

/* ══════════════════════════════════════════════════════════════
   TICKET — construcción del documento (líneas ya formateadas)
   Se usa TANTO para la vista previa / diálogo de impresión (texto
   monoespaciado) COMO para los bytes ESC/POS de la impresora térmica,
   así lo que se ve en pantalla es exactamente lo que sale impreso.
   ══════════════════════════════════════════════════════════════ */
const TICKET_CONFIG_KEY = 'dpf_comandas_ticket_config';
const TICKET_CONFIG_DEFAULTS = {
  nombre: 'DULCE PATATA FOOD',
  direccion: 'Carretera de Málaga 111, Granada',
  telefono: '604 82 31 80',
  despedida: '¡Gracias por tu pedido! 🥔',
  textoPago: 'Pagar en caja',
  anchoPapel: 80,
  copias: 1,
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

function padCenter(s, width) {
  s = s.slice(0, width);
  const total = width - s.length;
  const left = Math.floor(total / 2), right = total - left;
  return ' '.repeat(Math.max(0, left)) + s + ' '.repeat(Math.max(0, right));
}
function padRight(s, width) { s = s.slice(0, width); return s + ' '.repeat(Math.max(0, width - s.length)); }
function padLeft(s, width) { s = s.slice(0, width); return ' '.repeat(Math.max(0, width - s.length)) + s; }
function wrapText(s, width) {
  const words = String(s).split(' ');
  const lines = []; let cur = '';
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > width) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}
function wrapIndented(prefix, text, width, contPrefix) {
  contPrefix = contPrefix !== undefined ? contPrefix : ' '.repeat(prefix.length);
  const avail = Math.max(1, width - prefix.length);
  const wrapped = wrapText(text, avail);
  return wrapped.map((l, i) => (i === 0 ? prefix : contPrefix) + l);
}
function twoColLines(left, right, width) {
  const combined = left + ' ' + right;
  if (combined.length <= width) return [padRight(left, width - right.length) + right];
  const leftLines = wrapText(left, width);
  const out = leftLines.slice();
  const lastIdx = out.length - 1;
  if ((out[lastIdx] + ' ' + right).length <= width) out[lastIdx] = padRight(out[lastIdx], width - right.length) + right;
  else out.push(padLeft(right, width));
  return out;
}

function buildOrderObject() {
  const items = [];
  Object.entries(cart).forEach(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) return;
    items.push({ name: item.name, qty, subtotal: item.price * qty, extras: [] });
  });
  Object.values(custCart).filter(c => c.qty > 0).forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0);
    const extras = [...c.sauces, ...c.ingredients];
    if (c.extraQueso) extras.push('Queso mozzarella');
    if (c.extraGratinado) extras.push('Gratinado');
    items.push({ name: item.name, qty: c.qty, subtotal: unitPrice * c.qty, extras });
  });
  Object.values(extrasCart).filter(c => c.qty > 0).forEach(c => {
    items.push({ name: getExtrasItemLabel(c), qty: c.qty, subtotal: getExtrasItemPrice(c) * c.qty, extras: getExtrasItemDetails(c) });
  });
  const total = items.reduce((s, it) => s + it.subtotal, 0);
  return {
    num: getNextOrderNum(),
    time: new Date().toLocaleString('es-ES'),
    name: document.getElementById('order-name').value.trim(),
    notes: document.getElementById('order-notes').value.trim(),
    items,
    total,
  };
}

function buildTicketLines(order) {
  const width = getPaperWidthChars();
  const cfg = getTicketConfig();
  const L = [];
  L.push({ text: padCenter(cfg.nombre, width), bold: true });
  wrapText(cfg.direccion, width).forEach(l => L.push({ text: padCenter(l, width) }));
  L.push({ text: padCenter(cfg.telefono, width) });
  L.push({ text: '-'.repeat(width) });
  L.push({ text: padCenter('COMANDA MOSTRADOR', width), bold: true });
  L.push({ text: padCenter('#' + order.num, width), bold: true });
  L.push({ text: padCenter(order.time, width) });
  if (order.name) L.push({ text: padCenter('Para: ' + order.name, width), bold: true });
  L.push({ text: '='.repeat(width) });
  order.items.forEach(it => {
    twoColLines(it.qty + 'x ' + it.name, fmt(it.subtotal) + '€', width).forEach(l => L.push({ text: l }));
    (it.extras || []).forEach(ex => wrapIndented('  · ', ex, width).forEach(l => L.push({ text: l })));
  });
  L.push({ text: '-'.repeat(width) });
  twoColLines('TOTAL', fmt(order.total) + ' €', width).forEach((l, i) => L.push({ text: l, bold: true }));
  L.push({ text: padCenter('(' + cfg.textoPago + ')', width) });
  if (order.notes) {
    L.push({ text: '' });
    L.push({ text: 'NOTAS:', bold: true });
    wrapText(order.notes, width).forEach(l => L.push({ text: l }));
  }
  L.push({ text: '' });
  L.push({ text: padCenter(cfg.despedida, width) });
  return L;
}

function renderTicketPreview(lines) {
  document.getElementById('ticket-pre-content').textContent = lines.map(l => l.text).join('\n');
}

/* ── Codificación CP850 para acentos/ñ en impresoras ESC/POS ── */
const CP850_MAP = {
  'á': 0xA0, 'í': 0xA1, 'ó': 0xA2, 'ú': 0xA3, 'ñ': 0xA4, 'Ñ': 0xA5, 'ª': 0xA6, 'º': 0xA7,
  '¿': 0xA8, '¡': 0xAD, '«': 0xAE, '»': 0xAF,
  'é': 0x82, 'â': 0x83, 'ä': 0x84, 'à': 0x85, 'å': 0x86, 'ç': 0x87, 'ê': 0x88, 'ë': 0x89,
  'è': 0x8A, 'ï': 0x8B, 'î': 0x8C, 'ì': 0x8D, 'Ä': 0x8E, 'Å': 0x8F,
  'É': 0x90, 'æ': 0x91, 'Æ': 0x92, 'ô': 0x93, 'ö': 0x94, 'ò': 0x95, 'û': 0x96, 'ù': 0x97,
  'ÿ': 0x98, 'Ö': 0x99, 'Ü': 0x9A, 'ü': 0x81,
  'Á': 0xB5, 'Í': 0xD6, 'Ó': 0xE0, 'Ú': 0xE9,
};
function textToCp850Bytes(str) {
  const bytes = [];
  for (const ch of String(str)) {
    const code = ch.codePointAt(0);
    if (code < 128) { bytes.push(code); continue; }
    if (ch === '€') { bytes.push(0x45, 0x55, 0x52); continue; } // "EUR" — € no existe en CP850
    const mapped = CP850_MAP[ch];
    bytes.push(mapped !== undefined ? mapped : 0x3F);
  }
  return bytes;
}
class EscPosBuilder {
  constructor() { this.bytes = []; }
  raw(arr) { for (const b of arr) this.bytes.push(b); return this; }
  init() { return this.raw([0x1B, 0x40]); }
  codepage850() { return this.raw([0x1B, 0x74, 2]); }
  bold(on) { return this.raw([0x1B, 0x45, on ? 1 : 0]); }
  text(str) { return this.raw(textToCp850Bytes(str)); }
  newline() { return this.raw([0x0A]); }
  feed(n) { return this.raw([0x1B, 0x64, n]); }
  cut() { return this.raw([0x1D, 0x56, 0x00]); }
  toBytes() { return new Uint8Array(this.bytes); }
}
function buildEscPosBytes(lines) {
  const b = new EscPosBuilder();
  b.init().codepage850();
  lines.forEach(l => { b.bold(!!l.bold); b.text(l.text); b.newline(); });
  b.bold(false);
  b.feed(4);
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

/* ── Historial de hoy (para reimprimir) ── */
function getHistorialKey() { return 'dpf_comandas_historial_' + new Date().toISOString().slice(0, 10); }
function saveToHistorial(order) {
  let list;
  try { list = JSON.parse(localStorage.getItem(getHistorialKey()) || '[]'); } catch (e) { list = []; }
  list.unshift(order);
  if (list.length > 100) list = list.slice(0, 100);
  localStorage.setItem(getHistorialKey(), JSON.stringify(list));
}
function getHistorial() {
  try { return JSON.parse(localStorage.getItem(getHistorialKey()) || '[]'); } catch (e) { return []; }
}
function openHistorial() {
  const list = getHistorial();
  const el = document.getElementById('historial-list');
  el.innerHTML = list.length === 0
    ? `<div class="historial-empty">Todavía no hay comandas impresas hoy.</div>`
    : list.map((o, i) => `<div class="historial-item">
        <div><div class="h-num">${o.num}</div><div class="h-meta">${escapeHtml(o.time)} · ${o.name ? escapeHtml(o.name) + ' · ' : ''}${fmt(o.total)} €</div></div>
        <button onclick="reprintOrder(${i})">🖨️ Reimprimir</button>
      </div>`).join('');
  document.getElementById('historial-modal').classList.add('open');
}
function closeHistorial() { document.getElementById('historial-modal').classList.remove('open'); }
async function reprintOrder(index) {
  const list = getHistorial();
  const order = list[index];
  if (!order) return;
  await printOrder(order);
  toast('🖨️ Reimprimiendo ' + order.num);
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

async function sendToPrinter(bytes) {
  if (!printerDevice) {
    if (!navigator.usb) throw new Error('WebUSB no disponible');
    const list = await navigator.usb.getDevices();
    if (!list.length) throw new Error('No hay impresora emparejada');
    await openAndClaim(list[0]);
  }
  await printerDevice.transferOut(printerEndpoint, bytes);
}

if (navigator.usb) {
  navigator.usb.addEventListener('disconnect', (e) => {
    if (printerDevice && e.device === printerDevice) { printerDevice = null; printerEndpoint = null; updatePrinterStatusUI(); }
  });
}

async function printOrder(order) {
  const lines = buildTicketLines(order);
  renderTicketPreview(lines);
  const cfg = getTicketConfig();
  let printedViaUsb = false;
  if (cfg.modoImpresion !== 'dialog') {
    try {
      const bytes = buildEscPosBytes(lines);
      const copies = Math.max(1, parseInt(cfg.copias, 10) || 1);
      for (let i = 0; i < copies; i++) await sendToPrinter(bytes);
      printedViaUsb = true;
    } catch (e) {
      console.warn('[comandas] impresión directa falló, usando diálogo:', e);
    }
  }
  if (!printedViaUsb) window.print();
  updatePrinterStatusUI();
  return printedViaUsb;
}

async function handlePrintOrder() {
  if (!cartHasAnyItem()) { toast('La comanda está vacía'); return; }
  const btn = document.getElementById('print-btn');
  btn.disabled = true;
  const order = buildOrderObject();
  let printedViaUsb = false;
  try {
    printedViaUsb = await printOrder(order);
  } finally {
    btn.disabled = false;
  }
  saveToHistorial(order);
  clearOrder(true);
  toast(printedViaUsb ? '✅ Comanda ' + order.num + ' impresa' : '🖨️ Comanda ' + order.num + ' — abriendo diálogo de impresión…');
}

/* ══════════════════════════════════════════════════════════════
   AJUSTES
   ══════════════════════════════════════════════════════════════ */
function openSettings() {
  const cfg = getTicketConfig();
  document.getElementById('set-nombre').value = cfg.nombre;
  document.getElementById('set-direccion').value = cfg.direccion;
  document.getElementById('set-telefono').value = cfg.telefono;
  document.getElementById('set-texto-pago').value = cfg.textoPago;
  document.getElementById('set-despedida').value = cfg.despedida;
  document.getElementById('set-ancho-papel').value = String(cfg.anchoPapel);
  document.getElementById('set-copias').value = String(cfg.copias);
  document.getElementById('set-modo-impresion').value = cfg.modoImpresion;
  document.getElementById('settings-modal').classList.add('open');
}
function closeSettings() { document.getElementById('settings-modal').classList.remove('open'); }
function saveSettingsForm() {
  const cfg = {
    nombre: document.getElementById('set-nombre').value.trim() || TICKET_CONFIG_DEFAULTS.nombre,
    direccion: document.getElementById('set-direccion').value.trim() || TICKET_CONFIG_DEFAULTS.direccion,
    telefono: document.getElementById('set-telefono').value.trim() || TICKET_CONFIG_DEFAULTS.telefono,
    textoPago: document.getElementById('set-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    despedida: document.getElementById('set-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    anchoPapel: parseInt(document.getElementById('set-ancho-papel').value, 10),
    copias: parseInt(document.getElementById('set-copias').value, 10),
    modoImpresion: document.getElementById('set-modo-impresion').value,
  };
  saveTicketConfig(cfg);
  closeSettings();
  toast('✅ Ajustes guardados');
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderMenu();
  renderCart();
  trySilentReconnect();
});
