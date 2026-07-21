/* ── LÓGICA PRINCIPAL ── */
// ─────────────────────────────────────────
//  CONFIGURACIÓN — rellena estos valores
// ─────────────────────────────────────────
const CONFIG = {
  emailjs_public_key: "Euum_k_XJdrejjnKj",
  // de emailjs.com
  emailjs_service_id: "service_bil4ri5",
  emailjs_template_id: "template_ee4f7sp",
  store_email: "dulcepatata.admin@gmail.com" // tu email de tienda
};
// ─────────────────────────────────────────

const MENU = [
// ── PATATAS ──
{
  id: 1,
  cat: "Patatas",
  name: "Patata Simple",
  desc: "Aceite de oliva o mantequilla, sal y pimienta",
  price: 3.00
}, {
  id: 2,
  cat: "Patatas",
  name: "Patata Vegetal",
  desc: "Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural",
  price: 5.60
}, {
  id: 3,
  cat: "Patatas",
  name: "Patata Picante",
  desc: "Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas",
  price: 5.60
}, {
  id: 4,
  cat: "Patatas",
  name: "Patata Carbonara",
  desc: "Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 5,
  cat: "Patatas",
  name: "Patata Boloñesa",
  desc: "Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 6,
  cat: "Patatas",
  name: "Patata Hawaiana",
  desc: "Mayonesa, york, aceitunas, maíz, piña y queso mozzarella",
  price: 5.80
}, {
  id: 7,
  cat: "Patatas",
  name: "Patata Kebab",
  desc: "Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla",
  price: 5.90
}, {
  id: 8,
  cat: "Patatas",
  name: "Patata 4 Quesos",
  desc: "Salsa roquefort, emmental, gouda y mozzarella",
  price: 5.90
}, {
  id: 9,
  cat: "Patatas",
  name: "Patata Completa",
  desc: "Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón",
  price: 6.20
}, {
  id: 10,
  cat: "Patatas",
  name: "Patata Carnívora",
  desc: "Alioli, york, bacon, kebab y carne picada",
  price: 6.40
}, {
  id: 11,
  cat: "Patatas",
  name: "Patata Philadelphia",
  desc: "Salsa philadelphia, york, huevo, pollo, queso mozzarella",
  price: 6.40
}, {
  id: 12,
  cat: "Patatas",
  name: "Patata Ranchera",
  desc: "Salsa ranchera, pollo, bacon y queso mozzarella",
  price: 6.50
}, {
  id: 13,
  cat: "Patatas",
  name: "Patata Granollers",
  desc: "Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria",
  price: 6.50
}, {
  id: 14,
  cat: "Patatas",
  name: "Patata Pulled Pork 🆕",
  desc: "Salsa barbacoa, cebolla, carne pulled pork y mozzarella",
  price: 6.50
}, {
  id: 50,
  cat: "Patatas",
  name: "Patata Cheddar-Bacon 🆕",
  desc: "Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado",
  price: 8.50
}, {
  id: 15,
  cat: "Patatas",
  name: "Patata Al Gusto",
  desc: "1 salsa a elegir y 6 ingredientes",
  price: 6.90
}, {
  id: 16,
  cat: "Patatas",
  name: "Patata Bomba 🆕",
  desc: "9 ingredientes y/o salsas al gusto ¡sin límite!",
  price: 8.40
},
// ── BONIATO FRIES ──
{
  id: 17,
  cat: "Boniato",
  name: "Boniato Fries",
  desc: "Tarrina de boniato fries",
  price: 4.50
}, {
  id: 18,
  cat: "Boniato",
  name: "Boniato Lotus",
  desc: "Salsa Lotus + bacon + queso mozzarella + galletas Lotus",
  price: 5.50
}, {
  id: 19,
  cat: "Boniato",
  name: "Boniato Bacon",
  desc: "Salsa a elegir + bacon + queso mozzarella",
  price: 5.50
}, {
  id: 20,
  cat: "Boniato",
  name: "Boniato G.O.A.T.",
  desc: "Salsa miel mostaza + cebolla crujiente + queso de cabra",
  price: 5.50
}, {
  id: 21,
  cat: "Boniato",
  name: "Boniato Pistacchio 🆕",
  desc: "Crema de pistacho + queso mozzarella + pistacho crujiente",
  price: 5.50
},
// ── PANINIS ──
{
  id: 22,
  cat: "Paninis",
  name: "Panini Jamón York y Queso",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 23,
  cat: "Paninis",
  name: "Panini Carbonara",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 24,
  cat: "Paninis",
  name: "Panini Barbacoa",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 25,
  cat: "Paninis",
  name: "Panini Kebab",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 26,
  cat: "Paninis",
  name: "Panini 4 Quesos",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
},
// ── COOKIES ──
{
  id: 27,
  cat: "Cookies",
  name: "Crumbl Cookie Pistacho",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 28,
  cat: "Cookies",
  name: "Crumbl Cookie Lotus",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 29,
  cat: "Cookies",
  name: "Crumbl Cookie Oreo",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 30,
  cat: "Cookies",
  name: "Crumbl Cookie Kit Kat",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 31,
  cat: "Cookies",
  name: "Crumbl Cookie Nutella",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 32,
  cat: "Cookies",
  name: "Crumbl Cookie Kinder",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 33,
  cat: "Cookies",
  name: "Crumbl Cookie Huesitos Blanco",
  desc: "Recién horneada",
  price: 2.99
},
// ── TARTAS ──
{
  id: 34,
  cat: "Tartas",
  name: "Tarta de Queso La Viña",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 35,
  cat: "Tartas",
  name: "Tarta Tres Chocolates",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 36,
  cat: "Tartas",
  name: "Tarta de la Abuela",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 37,
  cat: "Tartas",
  name: "Tarta de Queso Lotus",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 38,
  cat: "Tartas",
  name: "Tarta de Queso Pistacho",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 39,
  cat: "Tartas",
  name: "Tarta de Queso Dinosaurio",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 40,
  cat: "Tartas",
  name: "Tarta de Queso Kinder",
  desc: "Especial · elaboración propia",
  price: 3.90
},
// ── BEBIDAS ──
{
  id: 41,
  cat: "Bebidas",
  name: "Refresco lata",
  desc: "",
  price: 1.10
}, {
  id: 42,
  cat: "Bebidas",
  name: "Cerveza lata",
  desc: "",
  price: 1.20
}, {
  id: 43,
  cat: "Bebidas",
  name: "Agua pequeña",
  desc: "",
  price: 0.80
}, {
  id: 44,
  cat: "Bebidas",
  name: "Refresco 500 ml",
  desc: "",
  price: 1.80
}, {
  id: 45,
  cat: "Bebidas",
  name: "Cerveza 1 litro",
  desc: "",
  price: 1.80
}, {
  id: 46,
  cat: "Bebidas",
  name: "Monster o Red Bull",
  desc: "",
  price: 1.80
}, {
  id: 47,
  cat: "Bebidas",
  name: "Agua 1,5 litros",
  desc: "",
  price: 1.30
}, {
  id: 48,
  cat: "Bebidas",
  name: "Nestea / Aquarius 1,5 l",
  desc: "",
  price: 2.20
}, {
  id: 49,
  cat: "Bebidas",
  name: "Refresco 2 litros",
  desc: "",
  price: 2.50
}];
let cart = {};
window._adminLoggedIn = false;
let _adminLoggedIn = false; // true solo cuando hay sesión de admin activa
let activeCategory = "Todos";
const categories = ["Todos", ...new Set(MENU.map(i => i.cat))];
function initTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = categories.map(c => "<button class=\"tab ".concat(c === activeCategory ? 'active' : '', "\" onclick=\"setCategory('").concat(c, "')\">").concat(c, "</button>")).join('');
}
function setCategory(cat) {
  activeCategory = cat;
  initTabs();
  renderMenu();
}

// renderMenu definida más abajo con soporte completo (soldout, hidden, custom, extras)

function showClosedToast() {
  var t = document.getElementById("closed-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "closed-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    t.innerHTML = "🔒 Estamos cerrados · Puedes consultar la carta";
    document.body.appendChild(t);
  }
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 2800);
}
function isShopBlocked() {
  var _document$getElementB;
  // 1. Si el banner de cerrado está visible
  const banner = document.getElementById('orders-closed-banner');
  if (banner && banner.style.display === 'block') return true;
  // 2. Si los pedidos están pausados manualmente
  if (!getOrdersOpen()) return true;
  // 3. Si hoy es día cerrado
  if (!isTodayOpen()) return true;
  // 4. Si estamos fuera del horario de apertura
  if (isOutsideHours()) return true;
  // 5. Fallback: texto del estado
  const statusText = ((_document$getElementB = document.getElementById('hero-status-text')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.textContent) || '';
  if (statusText.startsWith('Abrimos a las') || statusText === 'Cerrado ahora' || statusText === 'Cerrado hoy') return true;
  return false;
}
function changeQty(id, delta) {
  // Bloquear añadir al carrito si hoy es día cerrado o pedidos pausados
  if (delta > 0 && isShopBlocked()) {
    showClosedToast();
    return;
  }
  if ((id === 15 || id === 16) && delta > 0) {
    openCustomizer(id);
    return;
  }
  if (id === CHEDDAR_ID && delta > 0) {
    openCheddarModal();
    return;
  }
  if (ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(id) && delta > 0) {
    openExtrasModal(id);
    return;
  }
  const current = cart[id] || 0;
  const next = current + delta;
  if (next <= 0) delete cart[id];else cart[id] = next;
  renderMenu();
  renderCart();
  if (delta > 0) _animateAddToCart(id);
}
function _animateAddToCart(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    const btn = card.querySelector('.add-btn, .qty-btn:last-child');
    if (btn) {
      btn.classList.remove('popping');
      void btn.offsetWidth;
      btn.classList.add('popping');
      btn.addEventListener('animationend', () => btn.classList.remove('popping'), {
        once: true
      });
    }
    card.classList.remove('flashing');
    void card.offsetWidth;
    card.classList.add('flashing');
    card.addEventListener('animationend', () => card.classList.remove('flashing'), {
      once: true
    });
  }
  const fab = document.getElementById('cart-fab');
  if (fab && !fab.classList.contains('hidden')) {
    fab.classList.remove('bumping');
    void fab.offsetWidth;
    fab.classList.add('bumping');
    fab.addEventListener('animationend', () => fab.classList.remove('bumping'), {
      once: true
    });
  }
  const count = document.getElementById('cart-fab-count');
  if (count) {
    count.classList.remove('popping');
    void count.offsetWidth;
    count.classList.add('popping');
    count.addEventListener('animationend', () => count.classList.remove('popping'), {
      once: true
    });
  }
}
// ── 🍰 Venta sugerida: dulce de postre ──────────────────────────────────────
// Siempre sugiere tarta o galleta (nunca bebida). Varía según lo que ya
// lleve el pedido: cantidad de patatas/boniatos (singular/plural) y, si
// detecta un sabor con tarta a juego (Lotus, Pistacho, Kinder, Dinosaurio),
// sugiere esa tarta en concreto en vez de la genérica.

const UPSELL_TARTA_IDS = { 34: 'La Viña', 35: 'Tres Chocolates', 36: 'de la Abuela', 37: 'Lotus', 38: 'Pistacho', 39: 'Dinosaurio', 40: 'Kinder' };
const UPSELL_GALLETA_IDS = [27, 28, 29, 30, 31, 32, 33]; // Pistacho, Lotus, Oreo, Kit Kat, Nutella, Kinder, Huesitos
const UPSELL_SABOR_TARTA = { 'lotus': 37, 'pistacho': 38, 'dinosaurio': 39, 'kinder': 40 };
const UPSELL_PESADAS = ['cheddar-bacon', 'carnívora', '4 quesos'];

function _upsellDismissedThisSession() {
  try { return sessionStorage.getItem('upsell_dulce_dismissed') === '1'; } catch (e) { return false; }
}
function dismissUpsellDulce() {
  try { sessionStorage.setItem('upsell_dulce_dismissed', '1'); } catch (e) {}
  renderCart();
}

// Devuelve { id, name, price, copy } o null si no toca mostrar sugerencia
function getUpsellDulce() {
  if (_upsellDismissedThisSession()) return null;

  // Cantidad de patatas/boniatos en el pedido: cart normal + custCart (Al Gusto/Bomba)
  // + extrasCart (patatas con queso/gratinado, como Philadelphia, Carbonara, Carnívora, etc.)
  const papasIdsCart = Object.entries(cart).filter(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato') && qty > 0;
  });
  const papasCartQty = papasIdsCart.reduce((s, [, q]) => s + q, 0);

  const papasCustQty = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => s + c.qty, 0);

  const extrasPatatas = Object.values(extrasCart).filter(c => {
    if (c.qty <= 0) return false;
    const item = MENU.find(m => m.id == c.menuId);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato');
  });
  const papasExtrasQty = extrasPatatas.reduce((s, c) => s + c.qty, 0);

  const papasQty = papasCartQty + papasCustQty + papasExtrasQty;

  if (papasQty === 0) return null; // sin patatas/boniato, no aplica

  // Si ya hay tarta o galleta en el carrito, ya está "vendido" → no mostrar
  const yaHayDulce = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Tartas' || item.cat === 'Cookies') && cart[id] > 0;
  });
  if (yaHayDulce) return null;

  const esPlural = papasQty >= 2;
  const pregunta = esPlural ? '¿Le metéis algo dulce de postre?' : '¿Le metes algo dulce de postre?';

  // ¿Algún producto del carrito (cart o extrasCart) tiene sabor con tarta a juego?
  const nombresCart = papasIdsCart.map(([id]) => (MENU.find(m => m.id == id) || {}).name || '');
  const nombresExtras = extrasPatatas.map(c => (MENU.find(m => m.id == c.menuId) || {}).name || '');
  const nombresEnCarrito = [...nombresCart, ...nombresExtras].join(' ').toLowerCase();
  let sugerido = null;
  for (const sabor in UPSELL_SABOR_TARTA) {
    if (nombresEnCarrito.includes(sabor)) {
      const tartaId = UPSELL_SABOR_TARTA[sabor];
      sugerido = MENU.find(m => m.id === tartaId);
      break;
    }
  }

  // Sin sabor a juego: galleta si es 1 unidad, tarta clásica si son 2+
  if (!sugerido) {
    if (esPlural) {
      sugerido = MENU.find(m => m.id === 34); // Tarta de Queso La Viña, clásica
    } else {
      const galletaId = UPSELL_GALLETA_IDS[Math.floor(Math.random() * UPSELL_GALLETA_IDS.length)];
      sugerido = MENU.find(m => m.id === galletaId);
    }
  }
  if (!sugerido) return null;

  const esTarta = sugerido.cat === 'Tartas';
  const emoji = esTarta ? '🎂' : '🍪';
  return { id: sugerido.id, name: sugerido.name, price: sugerido.price, pregunta, emoji };
}

function renderUpsellDulce() {
  const sug = getUpsellDulce();
  if (!sug) return '';
  return '<div class="upsell-dulce">'
    + '<div class="upsell-dulce-row1">'
    + '<div class="upsell-dulce-icon">' + sug.emoji + '</div>'
    + '<div class="upsell-dulce-question">' + sug.pregunta + '</div>'
    + '<button class="upsell-dulce-dismiss" onclick="dismissUpsellDulce()" title="No, gracias">&#10005;</button>'
    + '</div>'
    + '<div class="upsell-dulce-product">' + escapeHtml(sug.name) + ' · ' + sug.price.toFixed(2).replace('.', ',') + ' €</div>'
    + '<button class="upsell-dulce-add" onclick="changeQty(' + sug.id + ',1)">+ Añadir</button>'
    + '</div>';
}

function renderCart() {
  const lines = Object.entries(cart);
  const custLines = Object.values(custCart).filter(c => c.qty > 0);
  const countEl = document.getElementById("cart-count");
  const bodyEl = document.getElementById("cart-body");
  const totalRowEl = document.getElementById("cart-total-row");
  const formEl = document.getElementById("order-form");
  const extLines = Object.values(extrasCart).filter(c => c.qty > 0);
  const totalItems = lines.reduce((s, _ref) => {
    let _ref2 = _slicedToArray(_ref, 2),
      q = _ref2[1];
    return s + q;
  }, 0) + custLines.reduce((s, c) => s + c.qty, 0) + extLines.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = totalItems;
  if (lines.length === 0 && custLines.length === 0 && extLines.length === 0) {
    bodyEl.innerHTML = "<div class=\"cart-empty\"><div class=\"cart-empty-icon\">\uD83D\uDED2</div>A\xF1ade productos de la carta</div>";
    totalRowEl.style.display = "none";
    if (formEl) formEl.style.display = "none";
    return;
  }
  let total = 0;
  const linesHtml = lines.map(_ref3 => {
    let _ref4 = _slicedToArray(_ref3, 2),
      id = _ref4[0],
      qty = _ref4[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('renderCart: producto no encontrado id=' + id);
      return '';
    }
    const subtotal = item.price * qty;
    total += subtotal;
    return "\n    <div class=\"cart-line\">\n      <span class=\"cart-line-name\">".concat(item.name, "</span>\n      <span class=\"cart-line-qty\">x").concat(qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"removeItem(").concat(id, ")\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const custLinesHtml = custLines.map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('renderCart: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients].join(', ');
    return "\n    <div class=\"cart-line\" style=\"flex-wrap:wrap\">\n      <span class=\"cart-line-name\" style=\"width:100%\">".concat(item.name, "\n        <span style=\"font-size:11px;color:#8A6A4E;font-weight:400;display:block\">").concat(details, "</span>\n      </span>\n      <span class=\"cart-line-qty\">x").concat(c.qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"removeCustItem('").concat(c.key.replace(/'/g, "\\'"), "')\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const extLinesHtml = extLines.map(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const _extItem = MENU.find(m => m.id == c.menuId);
    if (!_extItem) {
      console.error('renderCart: extras item no encontrado menuId=' + c.menuId);
      return '';
    }
    const itemName = _extItem.name;
    const extras = [];
    if (c.queso) extras.push('+ Queso +1,00€');
    if (c.gratinado) extras.push('+ Gratinado +0,50€');
    return '<div class="cart-line" style="flex-wrap:wrap">' + '<span class="cart-line-name" style="width:100%">' + itemName + (extras.length ? '<span style="font-size:11px;color:#8A6A4E;font-weight:400;display:block">' + extras.join(' · ') + '</span>' : '') + '</span>' + '<span class="cart-line-qty">x' + c.qty + '</span>' + '<span class="cart-line-price">' + subtotal.toFixed(2) + ' €</span>' + '<button class="cart-remove" onclick="removeExtrasItem(\'' + c.key.replace(/'/g, "\\'") + '\')" title="Quitar">&#128465;</button>' + '</div>';
  }).join('');
  const cartHtml = linesHtml + custLinesHtml + extLinesHtml + renderUpsellDulce();
  bodyEl.innerHTML = cartHtml;

  // Mostrar línea de gastos de gestión si está activa
  const feeEnabled = getFeeEnabled();
  const feeAmount = getFeeAmount();
  const feeLabel = getFeeLabel();
  const feeEl = document.getElementById('cart-fee-row');
  if (feeEl) {
    if (feeEnabled) {
      feeEl.style.display = 'flex';
      document.getElementById('cart-fee-label').textContent = feeLabel;
      document.getElementById('cart-fee-amount').textContent = feeAmount.toFixed(2).replace('.', ',') + ' €';
    } else {
      feeEl.style.display = 'none';
    }
  }
  // Mostrar línea de descuento si hay un código aplicado (manual o ganado
  // en la ruleta/rasca) — antes el total mostrado en el carrito nunca
  // reflejaba el descuento (solo se calculaba al confirmar el pedido), así
  // que aunque el código sí se aplicaba de verdad, la clienta no veía
  // ningún cambio en el número y parecía que no había pasado nada.
  const discountAmt = (typeof getDiscountAmount === 'function') ? getDiscountAmount(total) : 0;
  const discountCode = (typeof _activeDiscount !== 'undefined' && _activeDiscount) ? _activeDiscount.code : null;
  const discountEl = document.getElementById('cart-discount-row');
  if (discountEl) {
    if (discountAmt > 0 && discountCode) {
      discountEl.style.display = 'flex';
      document.getElementById('cart-discount-label').textContent = 'Descuento (' + discountCode + ')';
      document.getElementById('cart-discount-amount').textContent = '-' + discountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      discountEl.style.display = 'none';
    }
  }
  const grandTotal = Math.max(0, (feeEnabled ? total + feeAmount : total) - discountAmt);
  document.getElementById("cart-total").textContent = grandTotal.toFixed(2).replace('.', ',') + " €";

  // Only show total and form if orders are open
  // IMPORTANTE: renderSlotPicker() debe ejecutarse ANTES de _syncCartDrawer(),
  // porque _syncCartDrawer() (a través de _syncDrawerSlotPicker()) copia el
  // estado visible de #slot-picker-group al drawer móvil. Si se sincroniza
  // primero, el drawer copia el estado del render ANTERIOR (desactualizado),
  // provocando que "Hora de recogida" no aparezca en el drawer justo tras
  // el primer cambio de carrito (bug intermitente en móvil).
  if (getOrdersOpen()) {
    totalRowEl.style.display = "flex";
    formEl.style.display = "block";
    renderSlotPicker();
  } else {
    totalRowEl.style.display = "none";
    formEl.style.display = "none";
  }

  // Sync mobile FAB and drawer (debe ir DESPUÉS de renderSlotPicker)
  _updateCartFab(totalItems, grandTotal);
  _syncCartDrawer(cartHtml, grandTotal, discountAmt, discountCode);
}

