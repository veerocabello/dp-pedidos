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
const CATEGORY_ICONS = {"Todos":"🍽️","Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
function initTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = categories.map(c => {
    const icon = CATEGORY_ICONS[c] || '🍽️';
    return "<button class=\"tab ".concat(c === activeCategory ? 'active' : '', "\" onclick=\"setCategory('").concat(c, "')\"><span class=\"tab-icon\">").concat(icon, "</span><span>").concat(c, "</span></button>");
  }).join('');
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
// Toast genérico reutilizable — mismo patrón que showClosedToast(), para
// confirmar visualmente acciones rápidas (copiar algo al portapapeles, etc.)
// que antes no daban ningún feedback.
function showCopyToast(msg) {
  var t = document.getElementById("copy-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "copy-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    document.body.appendChild(t);
  }
  t.innerHTML = msg;
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 1800);
}
function copiarTexto(text, mensajeExito) {
  function onOk() { showCopyToast(mensajeExito || "✅ Copiado"); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onOk).catch(function () {
      _copiarConExecCommand(text);
      onOk();
    });
  } else {
    _copiarConExecCommand(text);
    onOk();
  }
}
function _copiarConExecCommand(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}
// Contador de caracteres restantes para el campo de notas — antes solo se
// sabía que se había llegado al límite de 300 cuando el textarea dejaba de
// aceptar más texto, sin ningún aviso previo.
function _actualizarContadorNotas(textareaId, counterId) {
  const ta = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!ta || !counter) return;
  const max = parseInt(ta.getAttribute('maxlength'), 10) || 300;
  const restantes = max - ta.value.length;
  counter.textContent = restantes + ' caracteres restantes';
  counter.style.color = restantes <= 20 ? '#c0392b' : 'var(--muted, #8A6A4E)';
}
// Muestra el aviso de dato que falta/es inválido Y desplaza hasta el campo
// correspondiente, resaltándolo un instante — antes solo salía la alerta,
// sin llevar al cliente hasta dónde está el problema (con el formulario
// largo, tocaba buscarlo a ojo). Detecta si el cliente está en el drawer
// móvil (donde los campos visibles son drawer-customer-*, no los del
// formulario de escritorio que solo se sincronizan por debajo) para
// desplazarse al campo que de verdad se ve en pantalla.
function _alertaConFoco(msg, fieldIdBase) {
  showAlert(msg);
  const drawer = document.getElementById('cart-drawer');
  const enDrawer = drawer && drawer.classList.contains('open');
  const fieldId = enDrawer ? ('drawer-' + fieldIdBase) : fieldIdBase;
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.classList.add('campo-con-error');
  setTimeout(() => field.classList.remove('campo-con-error'), 2000);
  setTimeout(() => { if (typeof field.focus === 'function') field.focus(); }, 350);
}
// Un único "ding" suave al confirmar el pedido — mismo patrón (Web Audio,
// sin archivos externos) que ya usa _sonidoCelebracion() en la ruleta, pero
// una sola nota discreta en vez del arpegio de premio.
function _sonidoConfirmacionPedido() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880; // La5
    const start = ctx.currentTime;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.55);
    setTimeout(() => ctx.close(), 900);
  } catch (e) { /* si el navegador bloquea el audio, no pasa nada — solo se pierde el sonido */ }
}
function isShopBlocked() {
  var _document$getElementB;
  // 1. Si el banner de cerrado está visible
  const banner = document.getElementById('orders-closed-banner');
  if (banner && banner.style.display === 'block') return true;
  // 2. Si los pedidos están pausados manualmente (incluye la auto-pausa por
  // saturación, que reutiliza este mismo candado — ver _aplicarAutoPausa en
  // admin-config.js)
  if (!getOrdersOpen()) return true;
  // 3. Si hoy es día cerrado
  if (!isTodayOpen()) return true;
  // 4. Si estamos fuera del horario de apertura
  if (isOutsideHours()) return true;
  // 5. Pausa exprés activa (independiente de ordersOpen, con su propia
  // cuenta atrás — ver pausarExpres() en admin-config.js)
  try {
    const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
    if (hasta && Date.now() < hasta) return true;
  } catch (e) {}
  // 6. Fallback: texto del estado
  const statusText = ((_document$getElementB = document.getElementById('hero-status-text')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.textContent) || '';
  if (statusText.startsWith('Abrimos a las') || statusText === 'Cerrado ahora' || statusText === 'Cerrado hoy') return true;
  return false;
}
// Refresca la UI de "pedidos cerrados" cuando cambia pausaExpresHasta (por
// activarla o por llegar su hora de reapertura) — sin tocar ordersOpen/
// ordersMsg de verdad (eso es cosa de la pausa manual/auto-pausa, no de
// esta), pero SÍ hay que reflejar en el candado que ahora mismo está
// bloqueado por la pausa exprés aunque ordersOpen siga en true, o el
// cliente vería el formulario normal y solo se enteraría del bloqueo al
// intentar confirmar (isShopBlocked()/el servidor sí lo rechazan, pero la
// pantalla no lo estaba avisando de antemano).
function _actualizarBloqueoPorPausaExpres() {
  if (typeof updateOrdersUI !== 'function') return;
  const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
  if (hasta && Date.now() < hasta) {
    updateOrdersUI(false, 'Pausados temporalmente, volvemos enseguida.');
  } else {
    updateOrdersUI(getOrdersOpen());
  }
}
// Se reabre sola al pasar el tiempo sin depender de que llegue ningún aviso
// nuevo de Firebase (un timestamp que ya pasó no dispara ningún listener
// por sí solo) — comprobación ligera cada 30s, solo hace algo si hay una
// pausa exprés activa de verdad.
setInterval(() => {
  const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
  if (hasta && Date.now() >= hasta) {
    localStorage.setItem('dpf_pausa_expres_hasta', '0');
    _actualizarBloqueoPorPausaExpres();
  }
}, 30000);
// Banner suave de saturación (no bloquea pedidos) — dirigido por
// config/avisoSaturacionEstado, que solo puede publicar una sesión de
// admin/cocina de verdad (ver _actualizarAvisoSaturacion en
// pedidos-vivo-cocina.js). "busy-mode-banner" es un elemento estático
// aparte con texto fijo, no se toca aquí.
function _renderAvisoSaturacionBanner(estado) {
  const el = document.getElementById('aviso-saturacion-banner');
  if (!el) return;
  if (estado && estado.activo && estado.msg) {
    el.textContent = estado.msg;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
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
  // Defensa en profundidad: renderMenu() ya oculta los controles +/- de un
  // producto agotado/oculto, así que hoy esto no es alcanzable desde la UI
  // normal — pero changeQty() en sí no comprobaba nada, así que cualquier
  // otra vía de llamarla (consola, un botón que quede con el id viejo tras
  // marcar el producto agotado mientras la página ya estaba abierta, un
  // futuro caller) podía seguir añadiendo un producto agotado al carrito.
  if (delta > 0) {
    const _item = typeof MENU !== 'undefined' ? MENU.find(m => m.id == id) : null;
    if (_item && (_item.hidden || _item.soldout)) return;
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
      // Confirmación visual más clara que solo el rebote: el botón muestra
      // un ✓ un instante y una miniatura "vuela" hasta el carrito/FAB.
      btn.classList.add('add-check');
      btn.textContent = '✓';
      clearTimeout(btn._addCheckTimer);
      btn._addCheckTimer = setTimeout(() => {
        btn.classList.remove('add-check');
        btn.textContent = '+';
      }, 550);
      _lanzarFlyGhost(btn);
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
// Crea una miniatura que "vuela" desde el botón pulsado hasta el carrito
// (el FAB en móvil, o el contador de "Tu pedido" en escritorio, donde no
// hay FAB) — refuerzo visual de que el producto se ha añadido, más allá
// del rebote del propio botón.
function _lanzarFlyGhost(btn) {
  const fab = document.getElementById('cart-fab');
  const target = (fab && !fab.classList.contains('hidden')) ? fab : document.getElementById('cart-count');
  if (!target) return;
  const btnRect = btn.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!btnRect.width || !targetRect.width) return;
  const ghost = document.createElement('div');
  ghost.className = 'fly-ghost';
  ghost.textContent = '🥔';
  const size = 26;
  ghost.style.left = (btnRect.left + btnRect.width / 2 - size / 2) + 'px';
  ghost.style.top = (btnRect.top + btnRect.height / 2 - size / 2) + 'px';
  const dx = (targetRect.left + targetRect.width / 2) - (btnRect.left + btnRect.width / 2);
  const dy = (targetRect.top + targetRect.height / 2) - (btnRect.top + btnRect.height / 2);
  ghost.style.setProperty('--fly-target', 'translate(' + dx + 'px,' + dy + 'px)');
  document.body.appendChild(ghost);
  requestAnimationFrame(() => ghost.classList.add('flying'));
  setTimeout(() => ghost.remove(), 650);
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
// Solo bebidas individuales sin alcohol para el upsell — nada de cerveza
// (la web no verifica la edad de quien pide) ni de garrafas de 1,5-2L, que
// no pegan como "añade algo de beber" de un solo trago.
const UPSELL_BEBIDA_IDS = [41, 43, 44, 46]; // Refresco lata, Agua pequeña, Refresco 500ml, Monster/Red Bull

// "No, gracias" ahora solo vale para ESTE pedido (antes se guardaba en
// sessionStorage y se recordaba para toda la visita a la web, aunque el
// cliente hiciera otro pedido justo después) — se guarda por tipo
// (dulce/bebida) para no descartar los dos a la vez si solo dice que no a
// uno. Se resetea al confirmar/cancelar el pedido (ver antifraude.js).
window._upsellDismissed = window._upsellDismissed || { dulce: false, bebida: false };
function dismissUpsellDulce(tipo) {
  window._upsellDismissed[tipo || 'dulce'] = true;
  renderCart();
}

// Devuelve { tipo, pregunta, opciones: [{id, name, price, emoji}, ...] } o
// null si no toca mostrar ninguna sugerencia. Primero comprueba el postre;
// si ya no aplica (porque ya hay uno en el carrito, o el cliente lo
// descartó), pasa a comprobar la bebida — así solo se ve una tarjeta cada
// vez, no las dos a la vez.
function getUpsellCarrito() {
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

  if (papasQty === 0) return null; // sin patatas/boniato, no aplica ningún upsell
  const esPlural = papasQty >= 2;

  // ── 1. ¿Postre? ──
  const yaHayDulce = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Tartas' || item.cat === 'Cookies') && cart[id] > 0;
  });
  if (!yaHayDulce && !window._upsellDismissed.dulce) {
    const pregunta = esPlural ? '¿Le metéis algo dulce de postre?' : '¿Le metes algo dulce de postre?';

    // ¿Algún producto del carrito (cart o extrasCart) tiene sabor con tarta a juego?
    const nombresCart = papasIdsCart.map(([id]) => (MENU.find(m => m.id == id) || {}).name || '');
    const nombresExtras = extrasPatatas.map(c => (MENU.find(m => m.id == c.menuId) || {}).name || '');
    const nombresEnCarrito = [...nombresCart, ...nombresExtras].join(' ').toLowerCase();
    let tartaSaborId = null;
    for (const sabor in UPSELL_SABOR_TARTA) {
      if (nombresEnCarrito.includes(sabor)) {
        tartaSaborId = UPSELL_SABOR_TARTA[sabor];
        break;
      }
    }

    // Se eligen 2-3 opciones (tarta con sabor a juego primero, si aplica) y
    // se guardan en caché para no volver a sortear otras al repintar el
    // carrito (p.ej. tras comprobar fidelización mientras el cliente sigue
    // escribiendo) — eso daba la sensación de que las tarjetas "parpadeaban".
    // Si cambia de singular a plural (añade una segunda patata) sí se
    // recalcula, porque el fondo de opciones a elegir es distinto.
    window._upsellOpcionesElegidas = window._upsellOpcionesElegidas || {};
    const cacheDulce = window._upsellOpcionesElegidas.dulce;
    if (!cacheDulce || cacheDulce.esPlural !== esPlural) {
      const elegidos = [];
      if (tartaSaborId) elegidos.push(tartaSaborId);
      const pool = (esPlural ? Object.keys(UPSELL_TARTA_IDS).map(Number) : UPSELL_GALLETA_IDS)
        .filter(id => !elegidos.includes(id));
      // Barajar el resto del fondo y completar hasta 3 opciones en total
      const barajado = pool.slice().sort(() => Math.random() - 0.5);
      for (const id of barajado) {
        if (elegidos.length >= 3) break;
        elegidos.push(id);
      }
      window._upsellOpcionesElegidas.dulce = { esPlural, ids: elegidos.slice(0, 3) };
    }

    const opciones = window._upsellOpcionesElegidas.dulce.ids
      .map(id => MENU.find(m => m.id === id))
      .filter(Boolean)
      .map(it => ({ id: it.id, name: it.name, price: it.price, emoji: it.cat === 'Tartas' ? '🎂' : '🍪' }));
    if (opciones.length) {
      // Se usa en submitOrder() para saber si el aviso llegó a mostrarse de
      // verdad (para las estadísticas de "mostrado vs añadido").
      window._upsellFueMostrado = true;
      return { tipo: 'dulce', pregunta, opciones };
    }
  }

  // ── 2. ¿Bebida? (solo si el postre ya no toca, para no amontonar dos tarjetas a la vez) ──
  const yaHayBebida = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && item.cat === 'Bebidas' && cart[id] > 0;
  });
  if (!yaHayBebida && !window._upsellDismissed.bebida) {
    const pregunta = esPlural ? '¿Le añadís algo de beber?' : '¿Le añades algo de beber?';

    window._upsellOpcionesElegidas = window._upsellOpcionesElegidas || {};
    if (!window._upsellOpcionesElegidas.bebida) {
      const barajado = UPSELL_BEBIDA_IDS.slice().sort(() => Math.random() - 0.5);
      window._upsellOpcionesElegidas.bebida = { ids: barajado.slice(0, 3) };
    }

    const opciones = window._upsellOpcionesElegidas.bebida.ids
      .map(id => MENU.find(m => m.id === id))
      .filter(Boolean)
      .map(it => ({ id: it.id, name: it.name, price: it.price, emoji: '🥤' }));
    if (opciones.length) {
      window._upsellFueMostrado = true;
      return { tipo: 'bebida', pregunta, opciones };
    }
  }

  return null;
}

function renderUpsellDulce() {
  const sug = getUpsellCarrito();
  if (!sug) return '';
  const opcionesHtml = sug.opciones.map(op =>
    '<div class="upsell-dulce-opcion">'
    + '<span class="upsell-dulce-opcion-name">' + escapeHtml(op.name) + '</span>'
    + '<span class="upsell-dulce-opcion-price">' + op.price.toFixed(2).replace('.', ',') + ' €</span>'
    + '<button class="upsell-dulce-opcion-add" onclick="changeQty(' + op.id + ',1)">+ Añadir</button>'
    + '</div>'
  ).join('');
  // La tarjeta lleva una animación de entrada (CSS), pero el carrito entero
  // se repinta muchas veces mientras el cliente escribe (teléfono, notas...)
  // — como renderCart() reconstruye el HTML entero cada vez, sin esto la
  // tarjeta se recreaba como un elemento nuevo en cada repintado y la
  // animación volvía a arrancar desde cero, dando la sensación de que
  // "parpadeaba" sola mientras escribía. Solo se anima la primera vez que
  // se muestra en este pedido; se resetea al confirmar/cancelar el pedido.
  const primeraVez = !window._upsellYaAnimado;
  window._upsellYaAnimado = true;
  return '<div class="upsell-dulce' + (primeraVez ? '' : ' upsell-dulce-sin-animar') + '">'
    + '<div class="upsell-dulce-row1">'
    + '<div class="upsell-dulce-icon">' + sug.opciones[0].emoji + '</div>'
    + '<div class="upsell-dulce-question">' + sug.pregunta + '</div>'
    + '<button class="upsell-dulce-dismiss" onclick="dismissUpsellDulce(\'' + sug.tipo + '\')" title="No, gracias">&#10005;</button>'
    + '</div>'
    + '<div class="upsell-dulce-opciones">' + opcionesHtml + '</div>'
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
    bodyEl.innerHTML = "<div class=\"cart-empty\"><div class=\"cart-empty-icon\">\uD83D\uDED2</div><div class=\"cart-empty-title\">Tu carrito est\xE1 en ayunas</div><div class=\"cart-empty-sub\">dale algo de comer, anda...</div></div>" + _bimbaTarjetaRepetirPedido();
    totalRowEl.style.display = "none";
    if (formEl) formEl.style.display = "none";
    _updateCartFab(0, 0);
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
    const details = [...c.sauces.map(s => 'Extra salsa ' + s), ...c.ingredients.map(i => 'Extra ' + i)].join(', ');
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
    if (c.queso) extras.push('+ Extra Queso +1,00€');
    (c.ingredientesExtra || []).forEach(ing => {
      const _precioIng = (typeof EXTRAS_ING_PRECIO1 !== 'undefined' && EXTRAS_ING_PRECIO1.includes(ing)) ? '1,00' : '0,70';
      extras.push('+ Extra ' + ing + ' +' + _precioIng + '€');
    });
    (c.salsasExtra || []).forEach(salsa => extras.push('+ Extra salsa ' + salsa + ' +0,90€'));
    // El gratinado siempre va el último de la lista, sea cual sea el
    // resto de extras que tenga el pedido.
    if (c.gratinado) extras.push('+ Gratinado +0,50€');
    return '<div class="cart-line" style="flex-wrap:wrap">' + '<span class="cart-line-name" style="width:100%">' + itemName + (extras.length ? '<span style="font-size:11px;color:#8A6A4E;font-weight:400;display:block">' + extras.join(' · ') + '</span>' : '') + '</span>' + '<span class="cart-line-qty">x' + c.qty + '</span>' + '<span class="cart-line-price">' + subtotal.toFixed(2) + ' €</span>' + '<button class="cart-remove" onclick="removeExtrasItem(\'' + c.key.replace(/'/g, "\\'") + '\')" title="Quitar">&#128465;</button>' + '</div>';
  }).join('');
  const cartHtml = linesHtml + custLinesHtml + extLinesHtml + renderUpsellDulce();
  bodyEl.innerHTML = cartHtml;

  // Mostrar línea de gastos de gestión si está activa — salvo que el
  // cliente haya metido el código de "pedido desde el local" (para cuando
  // hay cola y se pide desde el móvil sin cargo, solo ese pedido)
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  // El código local exime SIEMPRE al gasto fijo que sea "de gestión" —
  // puede ser el 1º o el 2º según cómo estén configurados ahora mismo, así
  // que se identifica por su etiqueta, no por su posición. Si ninguno de
  // los dos menciona "gestión" (p.ej. se renombraron del todo), se exime
  // el primero por defecto para no perder la exención.
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2LabelParaExencion = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(_fee2LabelParaExencion);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
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
  // El enlace de "código del local" solo tiene sentido si hay algún gasto
  // de gestión activo que quitar (con el código puesto o sin él) — puede
  // ser el 1º o el 2º gasto fijo, según cuál esté etiquetado como gestión.
  const localCodeRowEl = document.getElementById('local-fee-code-row');
  const _hayGestionQueQuitar = getFeeEnabled() || ((typeof getFee2Enabled === 'function') && getFee2Enabled());
  if (localCodeRowEl) localCodeRowEl.style.display = (_hayGestionQueQuitar && getLocalFeeCode()) ? 'block' : 'none';
  // Segundo gasto fijo, independiente del anterior (su propio interruptor) —
  // también se exime con el código local si es este el que está etiquetado
  // como "de gestión" (ver arriba).
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const fee2El = document.getElementById('cart-fee2-row');
  if (fee2El) {
    if (fee2Enabled) {
      fee2El.style.display = 'flex';
      document.getElementById('cart-fee2-label').textContent = fee2Label;
      document.getElementById('cart-fee2-amount').textContent = fee2Amount.toFixed(2).replace('.', ',') + ' €';
    } else {
      fee2El.style.display = 'none';
    }
  }
  // Descuentos que pueden aplicar a la vez: código de descuento (manual o
  // ganado en la ruleta/rasca) y estudiante/jubilado. A petición expresa,
  // estos dos NO se combinan entre sí — si ambos aplicarían, se queda solo
  // el mayor de los dos, nunca la suma. La fidelización (patata gratis) es
  // aparte y SÍ se sigue sumando siempre, sin entrar en este conflicto.
  const discountAmtRaw = (typeof getDiscountAmount === 'function') ? getDiscountAmount(total) : 0;
  const discountCode = (typeof _activeDiscount !== 'undefined' && _activeDiscount) ? _activeDiscount.code : null;
  const studentDiscountEnabledCfg = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled();
  const studentDiscountChecked = studentDiscountEnabledCfg && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const studentDiscountPctCfg = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  const studentDiscountAmtRaw = studentDiscountChecked ? Math.round(total * studentDiscountPctCfg) / 100 : 0;

  let discountAmt = discountAmtRaw;
  let studentDiscountAmt = studentDiscountAmtRaw;
  let conflictoDescuentosNota = '';
  if (discountAmtRaw > 0 && studentDiscountAmtRaw > 0) {
    if (discountAmtRaw >= studentDiscountAmtRaw) {
      studentDiscountAmt = 0;
      conflictoDescuentosNota = 'ℹ️ El descuento de estudiante/jubilado no se combina con el código de descuento — se aplica el código "' + discountCode + '" por ser mayor.';
    } else {
      discountAmt = 0;
      conflictoDescuentosNota = 'ℹ️ El código de descuento no se combina con el de estudiante/jubilado — se aplica este último por ser mayor.';
    }
  }
  const conflictoEl = document.getElementById('discount-conflict-notice');
  if (conflictoEl) {
    conflictoEl.textContent = conflictoDescuentosNota;
    conflictoEl.style.display = conflictoDescuentosNota ? 'block' : 'none';
  }

  // Mostrar línea de descuento si hay un código aplicado (y no ha perdido
  // el conflicto de arriba) — antes el total mostrado en el carrito nunca
  // reflejaba el descuento (solo se calculaba al confirmar el pedido), así
  // que aunque el código sí se aplicaba de verdad, la clienta no veía
  // ningún cambio en el número y parecía que no había pasado nada.
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
  // Premio de fidelización (patata gratis) — mismo cálculo que usa
  // submitOrder() al confirmar (getFidelizacionDescuento en
  // carrito-checkout.js), para que el total mostrado mientras se compra
  // ya lo refleje en vez de solo cambiar al confirmar el pedido.
  const _fidTelInput = document.getElementById('customer-phone');
  const _fidPhoneClean = _fidTelInput ? _fidTelInput.value.replace(/\D/g, '').slice(0, 9) : '';
  const fidelizacionAmt = (typeof getFidelizacionDescuento === 'function') ? getFidelizacionDescuento(_fidPhoneClean) : 0;
  const fidelizacionEl = document.getElementById('cart-fidelizacion-row');
  if (fidelizacionEl) {
    if (fidelizacionAmt > 0) {
      fidelizacionEl.style.display = 'flex';
      document.getElementById('cart-fidelizacion-amount').textContent = '-' + fidelizacionAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      fidelizacionEl.style.display = 'none';
    }
  }
  // Descuento estudiante/jubilado — el cliente lo marca él mismo (se
  // comprueba el carné al cobrar en caja, ver comentario junto a la
  // casilla en index.html).
  const studentDiscountRowEl = document.getElementById('student-discount-row');
  if (studentDiscountRowEl) studentDiscountRowEl.style.display = studentDiscountEnabledCfg ? 'block' : 'none';
  // El aviso de "se comprobará el carné" solo se despliega dentro de la
  // misma caja al marcar la casilla — compacto (una sola línea) mientras
  // nadie la usa, en vez de mostrarlo siempre para todo el mundo.
  const studentDiscountBoxEl = document.getElementById('student-discount-box');
  const studentDiscountWarnEl = document.getElementById('student-discount-warn');
  if (studentDiscountBoxEl) studentDiscountBoxEl.style.borderColor = studentDiscountChecked ? 'var(--amber)' : 'var(--warm)';
  if (studentDiscountWarnEl) studentDiscountWarnEl.style.display = studentDiscountChecked ? 'block' : 'none';
  const studentDiscountEl = document.getElementById('cart-student-discount-row');
  if (studentDiscountEl) {
    if (studentDiscountAmt > 0) {
      studentDiscountEl.style.display = 'flex';
      document.getElementById('cart-student-discount-label').textContent = '🪪 Estudiante/jubilado (-' + studentDiscountPctCfg + '%)';
      document.getElementById('cart-student-discount-amount').textContent = '-' + studentDiscountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      studentDiscountEl.style.display = 'none';
    }
  }
  const grandTotal = Math.max(0, total + (feeEnabled ? feeAmount : 0) + (fee2Enabled ? fee2Amount : 0) - discountAmt - fidelizacionAmt - studentDiscountAmt);
  document.getElementById("cart-total").textContent = grandTotal.toFixed(2).replace('.', ',') + " €";
  // Etiqueta de ahorro total (código de descuento + fidelización juntos) —
  // la línea verde de cada uno ya existía, pero un badge aparte resalta
  // más el ahorro real que solo ver un número distinto en el total.
  const totalAhorro = discountAmt + fidelizacionAmt + studentDiscountAmt;
  const savingsEl = document.getElementById('cart-savings-badge');
  if (savingsEl) {
    if (totalAhorro > 0) {
      savingsEl.style.display = 'block';
      document.getElementById('cart-savings-amount').textContent = '¡Ahorras ' + totalAhorro.toFixed(2).replace('.', ',') + ' €!';
    } else {
      savingsEl.style.display = 'none';
    }
  }

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
  _syncCartDrawer(cartHtml, grandTotal, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg, conflictoDescuentosNota);

  // Repintar la tarjeta de sellos DESPUÉS de sincronizar el cajón móvil —
  // _syncCartDrawer() reconstruye todo el HTML del carrito (incluido el
  // campo de teléfono), lo que borra la tarjeta si se hubiera pintado antes
  // (se insertó con appendChild, fuera de esa plantilla). Repintarla aquí,
  // en cada renderCart(), hace que sobreviva a todos los repintados en vez
  // de desaparecer en el primero que llega después de mostrarse.
  if (typeof _pintarTarjetaSellos === 'function') {
    if (window._fidelizacionClienteCache && window._fidelizacionClienteCache.phone === _fidPhoneClean) {
      _pintarTarjetaSellos(_fidPhoneClean, window._fidelizacionClienteCache.cliente);
    } else {
      document.querySelectorAll('.tarjeta-sellos-cliente').forEach(e => e.remove());
    }
  }
}

// ── REPETIR ÚLTIMO PEDIDO ──
// dpf_ultimo_pedido lo guarda antifraude.js justo después de confirmar un
// pedido (a diferencia de dpf_active_order, este no caduca) — si existe y
// el carrito está vacío, se ofrece repetirlo con un toque en vez de
// obligar a repasar toda la carta otra vez.
function _bimbaTarjetaRepetirPedido() {
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return '';
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items) || !data.items.length) return '';
    const lineas = data.items.map(i => '<b>' + i.qty + '×</b> ' + i.name).join('<br>');
    return '<div class="repeat-card">' +
      '<div class="repeat-card__label">🔁 Pediste esto la última vez</div>' +
      '<div class="repeat-card__items">' + lineas + '</div>' +
      '<button type="button" class="repeat-card__btn" onclick="repetirUltimoPedido()">Repetir pedido — ' + (data.total || 0).toFixed(2).replace('.', ',') + ' €</button>' +
      '</div>';
  } catch (e) { return ''; }
}
function repetirUltimoPedido() {
  if (isShopBlocked()) { showClosedToast(); return; }
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return;
    const data = JSON.parse(raw);
    let algoOmitido = false;
    const disponible = id => {
      const item = MENU.find(m => m.id == id);
      return item && !item.hidden && !item.soldout;
    };
    Object.entries(data.cart || {}).forEach(([id, qty]) => {
      if (!disponible(id)) { algoOmitido = true; return; }
      cart[id] = (cart[id] || 0) + qty;
    });
    Object.entries(data.custCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      custCart[key] = c;
    });
    Object.entries(data.extrasCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      extrasCart[key] = c;
    });
    renderMenu();
    renderCart();
    showCopyToast(algoOmitido ? '⚠️ Algún producto ya no está disponible y se omitió' : '✅ Pedido anterior añadido al carrito');
  } catch (e) {}
}

