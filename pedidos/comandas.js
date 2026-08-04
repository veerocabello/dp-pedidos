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
const EXTRAS_SALSA_PRECIO = 0.90;

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
let custCart = {};    // key -> {menuId, qty, sauces[], ingredients[], extraQueso, extraGratinado, extraSauces[]}
let extrasCart = {};  // key -> {menuId, qty, queso, gratinado, ingredientesExtra[], salsasExtra[], basePrice, cheddarCarne?}

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
const CATEGORY_ICONS = { Todos: '🍽️', Patatas: '🥔', Boniato: '🍠', Paninis: '🥪', Cookies: '🍪', Tartas: '🍰', Bebidas: '🥤' };

function initTabs() {
  document.getElementById('tabs').innerHTML = categories.map(c =>
    `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')"><span class="tab-icon">${CATEGORY_ICONS[c] || '🍽️'}</span>${c}</button>`
  ).join('');
}
function setCategory(cat) { activeCategory = cat; initTabs(); renderMenu(); }

function renderItemRow(item) {
  const qty = cart[item.id] || 0;
  const isSpecial = item.id === 15 || item.id === 16 || item.id === CHEDDAR_ID || ALL_EXTRAS_IDS.has(item.id);
  const nameHtml = escapeHtml(item.name) + (item.nuevo ? '<span class="item-badge-new">Nuevo</span>' : '');
  const control = isSpecial
    ? `<button class="add-btn" id="addbtn-${item.id}" onclick="onAddClick(${item.id})">+ Añadir</button>`
    : (qty > 0
      ? `<div class="qty-stepper"><button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button><span class="qty-value">${qty}</span><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button></div>`
      : `<button class="add-btn" onclick="changeQty(${item.id},1)">+ Añadir</button>`);
  return `<div class="item-row" id="card-${item.id}">
    <div class="item-info">
      <div class="item-name">${nameHtml}</div>
      ${item.desc ? `<div class="item-desc">${escapeHtml(item.desc)}</div>` : ''}
    </div>
    <div class="item-controls">
      <div class="item-price">${fmt(item.price)} €</div>
      ${control}
    </div>
  </div>`;
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (activeCategory === 'Todos') {
    grid.innerHTML = categories.filter(c => c !== 'Todos').map(cat => {
      const items = MENU.filter(m => m.cat === cat);
      return `<div class="menu-cat-sep"><span class="cat-emoji">${CATEGORY_ICONS[cat] || ''}</span><span class="cat-name">${cat.toUpperCase()}</span></div>`
        + items.map(renderItemRow).join('');
    }).join('');
  } else {
    grid.innerHTML = MENU.filter(m => m.cat === activeCategory).map(renderItemRow).join('');
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
function computeExtrasCorePrice(basePrice, ingredientesExtra, salsasExtra, pickOrder) {
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
  (ingredientesExtra || []).forEach(i => { core += EXTRAS_ING_PRECIO1.includes(i) ? 1 : 0.7; });
  core += salsaCount * EXTRAS_SALSA_PRECIO;
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
function getExtrasItemPrice(e) {
  const core = computeExtrasCorePrice(e.basePrice, e.ingredientesExtra, e.salsasExtra, e.pickOrder);
  return core + (e.queso ? 1 : 0) + (e.gratinado ? 0.5 : 0);
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
function discountLineLabel() {
  const label = (orderDiscount.label && orderDiscount.label.trim()) || 'Descuento';
  const suffix = orderDiscount.type === 'percent' ? ' (-' + orderDiscount.value + '%)' : '';
  return '🏷️ ' + label + suffix;
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
      <div class="cart-qty-mini">
        <button class="qty-btn-sm" onclick="changeQty(${item.id},-1)">−</button>
        <span>${qty}</span>
        <button class="qty-btn-sm" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <span class="cart-line-price">${fmt(subtotal)} €</span>
      <button class="cart-remove" onclick="removeItem(${item.id})" title="Quitar">🗑️</button>
    </div>`;
  });

  custLines.forEach(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return;
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + (c.extraSauces || []).length * EXTRAS_SALSA_PRECIO;
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients, c.extraQueso ? 'Queso mozzarella' : '', c.extraGratinado ? 'Gratinado' : '', ...(c.extraSauces || []).map(s => s + ' (salsa extra +' + fmt(EXTRAS_SALSA_PRECIO) + '€)')].filter(Boolean).join(', ');
    html += `<div class="cart-line">
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
    </div>`;
  });

  extLines.forEach(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const details = getExtrasItemDetails(c).join(' · ');
    html += `<div class="cart-line">
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
    </div>`;
  });

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
  document.getElementById('cart-total').textContent = fmt(total - discountAmount) + ' €';
  document.getElementById('print-btn').disabled = false;
}

function clearOrder(silent) {
  cart = {}; custCart = {}; extrasCart = {}; orderDiscount = null;
  document.getElementById('order-name').value = '';
  document.getElementById('order-notes').value = '';
  renderMenu();
  renderCart();
  if (!silent) toast('Comanda vaciada');
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
  updateCustBadges();
  updateCustTotalPrice();
  document.getElementById('customizer-modal').classList.add('open');
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
  iEl.innerHTML = CUST_INGREDIENTS.map(n => {
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
  renderCustChips(); updateCustBadges();
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
const NO_QUITAR_IDS = new Set([4, 5]); // Carbonara y Boloñesa: salsa cocinada a diario, no se pueden quitar ingredientes
function parseBaseComponents(item) {
  if (!item.desc) return [];
  let clean = item.desc.split(' · ')[0]; // quita coletillas tipo "· Salsa cocinada a diario"
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

function renderExtrasBody(item) {
  const soloGratinado = EXTRAS_SOLO_GRATINADO.has(item.id);
  const baseComponents = parseBaseComponents(item);
  const canQuitar = !NO_QUITAR_IDS.has(item.id) && baseComponents.length > 0;
  let html = '';
  if (canQuitar) {
    html += `<div class="section-label" style="margin-top:0">Quitar ingredientes</div><div class="chip-grid">`;
    baseComponents.forEach(comp => {
      const on = !!extrasQuitados[comp];
      html += `<button class="chip ${on ? 'quitado' : ''}" onclick="toggleExtraQuitar('${comp.replace(/'/g, "\\'")}')">${on ? '🚫 ' : ''}${escapeHtml(comp)}</button>`;
    });
    html += `</div>`;
    html += `<div class="section-label">Cambiar un ingrediente</div>`;
    html += `<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
      <select id="cambio-from" style="flex:1;min-width:100px">${baseComponents.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
      <span style="font-size:12px;color:var(--muted)">por</span>
      <select id="cambio-to" style="flex:1;min-width:100px">${[...CUST_INGREDIENTS, ...CUST_SAUCES].map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
      <button class="btn-secondary" style="padding:8px 12px" onclick="addExtraCambio()">+ Añadir</button>
    </div>`;
    if (extrasCambios.length) {
      html += extrasCambios.map((c, i) =>
        `<div class="option-row" style="padding:8px 12px;margin-bottom:6px"><span style="font-size:13px">🔄 ${escapeHtml(c.from)} → ${escapeHtml(c.to)}</span><button class="cart-remove" onclick="removeExtraCambio(${i})" title="Quitar cambio">🗑️</button></div>`
      ).join('');
    }
  } else if (NO_QUITAR_IDS.has(item.id)) {
    html += `<div class="settings-help" style="margin-top:0">⚠️ Salsa cocinada a diario · no se pueden quitar ni cambiar ingredientes.</div>`;
  }
  if (!soloGratinado) {
    html += `<label class="option-row" onclick="toggleExtra('queso')">
      <div><div class="option-title">🧀 Añadir queso mozzarella</div><div class="option-sub">+1,00 €</div></div>
      <div class="option-check ${extrasQueso ? 'on' : ''}"></div>
    </label>`;
  }
  html += `<label class="option-row" onclick="toggleExtra('gratinado')">
    <div><div class="option-title">🔥 Gratinar${soloGratinado ? '' : ' (con queso)'}</div><div class="option-sub">+0,50 €${soloGratinado ? '' : ' · incluye gratinado del queso'}</div></div>
    <div class="option-check ${extrasGratinado ? 'on' : ''}"></div>
  </label>`;
  html += `<div class="section-label">Salsas extra</div><div class="ing-grid">`;
  CUST_SAUCES.forEach(s => {
    const on = !!extrasSalsas[s];
    html += `<label class="option-row ${on ? 'on' : ''}" style="margin-bottom:0;padding:9px 10px" onclick="toggleExtraSalsa('${s.replace(/'/g, "\\'")}')">
      <div><div class="option-title" style="font-size:13px">${s}</div><div class="option-sub">+${fmt(EXTRAS_SALSA_PRECIO)} €</div></div>
      <div class="option-check ${on ? 'on' : ''}" style="width:20px;height:20px"></div>
    </label>`;
  });
  html += `</div>`;
  html += `<div class="section-label">Ingredientes extra</div><div class="ing-grid">`;
  [...EXTRAS_ING_PRECIO1, ...EXTRAS_ING_PRECIO07].forEach(ing => {
    const precio = EXTRAS_ING_PRECIO1.includes(ing) ? 1 : 0.7;
    const on = !!extrasIngredientes[ing];
    html += `<label class="option-row ${on ? 'on' : ''}" style="margin-bottom:0;padding:9px 10px" onclick="toggleExtraIng('${ing.replace(/'/g, "\\'")}')">
      <div><div class="option-title" style="font-size:13px">${ing}</div><div class="option-sub">+${fmt(precio)} €</div></div>
      <div class="option-check ${on ? 'on' : ''}" style="width:20px;height:20px"></div>
    </label>`;
  });
  html += `</div>`;
  document.getElementById('extras-options').innerHTML = html;
}
function toggleExtraQuitar(comp) {
  extrasQuitados[comp] = !extrasQuitados[comp];
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function addExtraCambio() {
  const from = document.getElementById('cambio-from').value;
  const to = document.getElementById('cambio-to').value;
  if (!from || !to || from === to) return;
  if (extrasCambios.some(c => c.from === from)) return; // ya hay un cambio para ese ingrediente
  extrasCambios.push({ from, to });
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function removeExtraCambio(i) {
  extrasCambios.splice(i, 1);
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function toggleExtra(which) {
  if (which === 'queso') extrasQueso = !extrasQueso; else extrasGratinado = !extrasGratinado;
  renderExtrasBody(MENU.find(m => m.id == extrasCurrentId));
  updateExtrasTotalPrice();
}
function toggleExtraIng(ing) {
  const on = !extrasIngredientes[ing];
  extrasIngredientes[ing] = on;
  if (on) { extrasPickSeq++; extrasIngOrder[ing] = extrasPickSeq; } else { delete extrasIngOrder[ing]; }
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
  const core = computeExtrasCorePrice(item.price, ingList, salsaList, getOrderedExtrasPicks());
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
    const unitPrice = item.price + (c.extraQueso ? 1 : 0) + (c.extraGratinado ? 0.5 : 0) + (c.extraSauces || []).length * EXTRAS_SALSA_PRECIO;
    const extras = [...c.sauces, ...c.ingredients];
    if (c.extraQueso) extras.push('Queso mozzarella');
    if (c.extraGratinado) extras.push('Gratinado');
    (c.extraSauces || []).forEach(s => extras.push(s + ' (salsa extra +' + fmt(EXTRAS_SALSA_PRECIO) + '€)'));
    items.push({ name: item.name, qty: c.qty, subtotal: unitPrice * c.qty, extras });
  });
  Object.values(extrasCart).filter(c => c.qty > 0).forEach(c => {
    items.push({ name: getExtrasItemLabel(c), qty: c.qty, subtotal: getExtrasItemPrice(c) * c.qty, extras: getExtrasItemDetails(c) });
  });
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const discountAmount = computeDiscountAmount(subtotal);
  if (discountAmount > 0) {
    items.push({ name: discountLineLabel(), qty: 1, subtotal: -discountAmount, extras: [] });
  }
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

/* ── Ticket en HTML — mismo maquetado que buildTicketHTML() de la web
   de pedidos (pedidos/src/historial-export.js), para que el ticket
   impreso sea igual que el de un pedido online. ── */
function buildTicketItemHTML(it) {
  const right = fmt(it.subtotal) + ' €';
  const label = it.qty + 'x ' + it.name;
  if (it.extras && it.extras.length > 0) {
    const extrasList = it.extras.map(ex =>
      `<div style="display:flex;justify-content:space-between"><span>&nbsp;&nbsp;&nbsp;· ${escapeHtml(ex)}</span></div>`
    ).join('');
    return `<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>${escapeHtml(label)}</span><span style="white-space:nowrap;padding-left:4px">${right}</span></div><div style="font-size:10px;color:#333;line-height:1.8;margin-top:1px">${extrasList}</div></div>`;
  } else if (label.length <= 26) {
    return `<div style="display:flex;justify-content:space-between"><span style="flex:1">${escapeHtml(label)}</span><span style="white-space:nowrap;padding-left:4px">${right}</span></div>`;
  } else {
    return `<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">${escapeHtml(label)}</div><div style="text-align:right;font-weight:bold">${right}</div></div>`;
  }
}
function buildTicketHTML(order) {
  const tc = getTicketConfig();
  const itemsHTML = order.items.map(buildTicketItemHTML).join('');
  const headerRow = order.name
    ? `<div style="font-size:22px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:4px 0">${escapeHtml(order.name.toUpperCase())}</div>`
    : '';
  return `
    <div style="text-align:center;margin-bottom:6px">
      <div style="font-size:15px;font-weight:bold;letter-spacing:1px">${escapeHtml(tc.nombre)}</div>
      <div style="font-size:10px;color:#555">${escapeHtml(tc.direccion)}</div>
      <div style="font-size:10px;color:#555">${escapeHtml(tc.telefono)}</div>
    </div>
    <div style="border-top:2px solid #000;margin:6px 0"></div>
    ${headerRow}
    <div style="border-top:1.5px solid #000;margin:6px 0 4px"></div>
    <div style="font-size:18px;font-weight:bold;text-align:center;letter-spacing:3px">PEDIDO ${escapeHtml(order.num)}</div>
    <div style="font-size:10px;text-align:center;color:#555;margin-bottom:4px">${escapeHtml(order.time)}</div>
    <div style="border-top:1.5px solid #000;margin:4px 0 6px"></div>
    <div style="font-size:11px">${itemsHTML}</div>
    <div style="border-top:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold">
      <span>TOTAL</span><span>${fmt(order.total)} €</span>
    </div>
    <div style="font-size:10px;text-align:center;color:#555;margin-top:2px">${escapeHtml(tc.textoPago)}</div>
    ${order.notes ? `<div style="border-top:1px dashed #000;margin:6px 0"></div><div style="font-size:10px"><b>NOTAS:</b> ${escapeHtml(order.notes)}</div>` : ''}
    <div style="border-top:1px dashed #000;margin:8px 0"></div>
    <div style="text-align:center;font-size:10px;color:#555">${escapeHtml(tc.despedida)}</div>
    <div style="margin-bottom:16px"></div>
  `;
}
function renderTicketPreview(order) {
  const container = document.getElementById('ticket-html-content');
  container.innerHTML = buildTicketHTML(order);
  container.classList.toggle('w58', getTicketConfig().anchoPapel == 58);
}

/* ── Texto plano — mismo contenido que el ticket HTML, para la
   impresora térmica ESC/POS (no puede renderizar HTML/CSS). ── */
function buildTicketLines(order) {
  const width = getPaperWidthChars();
  const cfg = getTicketConfig();
  const L = [];
  L.push({ text: padCenter(cfg.nombre, width), bold: true });
  wrapText(cfg.direccion, width).forEach(l => L.push({ text: padCenter(l, width) }));
  L.push({ text: padCenter(cfg.telefono, width) });
  L.push({ text: '='.repeat(width) });
  if (order.name) {
    L.push({ text: padCenter(order.name.toUpperCase(), width), bold: true });
    L.push({ text: '='.repeat(width) });
  }
  L.push({ text: padCenter('PEDIDO ' + order.num, width), bold: true });
  L.push({ text: padCenter(order.time, width) });
  L.push({ text: '='.repeat(width) });
  order.items.forEach(it => {
    twoColLines(it.qty + 'x ' + it.name, fmt(it.subtotal) + '€', width).forEach(l => L.push({ text: l }));
    (it.extras || []).forEach(ex => wrapIndented('   · ', ex, width).forEach(l => L.push({ text: l })));
  });
  L.push({ text: '-'.repeat(width) });
  twoColLines('TOTAL', fmt(order.total) + ' €', width).forEach(l => L.push({ text: l, bold: true }));
  L.push({ text: padCenter(cfg.textoPago, width) });
  if (order.notes) {
    L.push({ text: '-'.repeat(width) });
    L.push({ text: 'NOTAS:', bold: true });
    wrapText(order.notes, width).forEach(l => L.push({ text: l }));
  }
  L.push({ text: '-'.repeat(width) });
  L.push({ text: padCenter(cfg.despedida, width) });
  return L;
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
  renderTicketPreview(order);
  const cfg = getTicketConfig();
  let printedViaUsb = false;
  if (cfg.modoImpresion !== 'dialog') {
    try {
      const lines = buildTicketLines(order);
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
  if (getTicketConfig().autoImprimir !== false) clearOrder(true);
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

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderMenu();
  renderCart();
  trySilentReconnect();
});
