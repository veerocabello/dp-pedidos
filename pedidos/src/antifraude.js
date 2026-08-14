// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
// BLACKLIST_KEY, ANTISPAM_KEY, PHONE_LOG_KEY, getBlacklist,
// saveBlacklistLocal y getAntiSpamCfg viven en nucleo-compartido.js —
// el checkout (carrito-checkout.js) los necesita para bloquear pedidos de
// números en la lista negra o que superen el límite anti-spam. La UI de
// admin para editar esa lista/configuración vive en admin-antispam-stats.js,
// igual que loadDayStats/resetSlots/confirmClearDay/resetDayStats/
// cancelarPedidoAdmin (panel de estadísticas del día) y
// toggleForceSlots/updateForceSlotsBtn (ajuste de "forzar turnos").
async function showSuccess(orderNum, slotTime) {
  // Pedido confirmado con éxito: si el drawer móvil seguía abierto, ya
  // podemos cerrarlo (antes se cerraba nada más pulsar "Confirmar", lo
  // que rompía el resaltado de campos con error en submitOrderFromDrawer).
  if (typeof closeCartDrawer === 'function') closeCartDrawer();

  // Restaurar el texto normal de "pedido confirmado" — si el cliente había
  // cancelado un pedido antes en esta misma visita, cancelarPedido() dejó
  // este mismo bloque con el texto de "❌ Pedido cancelado" puesto, y sin
  // esto se quedaba así para siempre aunque el pedido SIGUIENTE sí se
  // confirmara bien (confundía al cliente, que creía que había fallado y
  // podía llegar a repetir el pedido).
  const _icon = document.querySelector('#success-screen .success-icon');
  const _title = document.querySelector('#success-screen .success-title');
  const _sub = document.querySelector('#success-screen .success-sub');
  if (_icon) _icon.textContent = '🥔';
  if (_title) _title.textContent = '¡Pedido confirmado!';
  if (_sub) _sub.textContent = 'Te esperamos en el local';
  // Exponer datos del pedido para el botón de WhatsApp
  window.currentOrderNum = orderNum;
  window.currentOrderSlot = slotTime || null;
  window.currentOrderName = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
  const orderTotal = _lastTicketData ? _lastTicketData.total : 0;
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.replace(/[\s\-().+]/g, '').trim();
  const notes = document.getElementById("customer-notes").value.trim();
  // Await so ticket data is saved before admin can print
  await recordOrderStats(orderNum, name, orderTotal, slotTime);

  // Guardar snapshot del pedido para poder modificarlo/cancelarlo
  window._lastOrderData = {
    num: orderNum,
    name,
    phone,
    notes,
    total: orderTotal,
    items: _lastTicketData ? [...(_lastTicketData.items || [])] : [],
    slot: slotTime || null,
    cart: JSON.parse(JSON.stringify(cart)),
    custCart: JSON.parse(JSON.stringify(custCart)),
    extrasCart: JSON.parse(JSON.stringify(extrasCart)),
    ts: Date.now()
  };

  // Guardar en localStorage para recuperar si se cierra la pestaña
  try {
    localStorage.setItem('dpf_active_order', JSON.stringify(window._lastOrderData));
  } catch (e) {}

  // Guardar aparte, sin caducar, para "Repetir mi último pedido" en una
  // visita futura — a diferencia de dpf_active_order (que se borra en
  // cuanto se cierra la ventana de modificar/cancelar), esto se queda.
  // Solo líneas de producto real: sin gastos de gestión (isFee) ni el
  // descuento/aviso de fidelización (subtotal <= 0).
  try {
    const _itemsRepetibles = (_lastTicketData ? _lastTicketData.items || [] : []).filter(i => !i.isFee && i.subtotal > 0);
    if (_itemsRepetibles.length) {
      localStorage.setItem('dpf_ultimo_pedido', JSON.stringify({
        items: _itemsRepetibles,
        total: orderTotal,
        cart: JSON.parse(JSON.stringify(cart)),
        custCart: JSON.parse(JSON.stringify(custCart)),
        extrasCart: JSON.parse(JSON.stringify(extrasCart)),
        ts: Date.now()
      }));
    }
  } catch (e) {}

  // Recordar nombre y teléfono para prellenarlos en la próxima visita (ver
  // _rellenarDatosClienteGuardados en init.js) — se guarda sin caducar,
  // igual que "dpf_ultimo_pedido"; el cliente puede editarlos igualmente.
  try {
    if (name) localStorage.setItem('dpf_cliente_nombre', name);
    if (phone) localStorage.setItem('dpf_cliente_telefono', phone);
  } catch (e) {}

  // Registrar el slot
  if (slotTime) incrementSlot(slotTime);

  // Nombre del cliente
  const customerInfoEl = document.getElementById('success-customer-info');
  const customerNameEl = document.getElementById('success-customer-name');
  if (customerNameEl) customerNameEl.textContent = name;

  // Mostrar hora de recogida en pantalla de éxito
  const slotInfo = document.getElementById('success-slot-info');
  const slotTimeEl = document.getElementById('success-slot-time');
  if (slotTime && slotInfo && slotTimeEl) {
    slotTimeEl.textContent = slotTime;
    slotInfo.style.display = 'flex';
  } else if (slotInfo) {
    slotInfo.style.display = 'none';
  }

  // Estimación de espera según la cola actual — un cliente anónimo no puede
  // leer stats/ ni orderStatus/ (son de solo-admin, ver las reglas de
  // Firebase), así que aquí NO se calcula nada localmente — solo se oculta
  // por defecto. El valor real llega un poco después, ya calculado por el
  // servidor (guardar-pedido.php, que sí tiene acceso completo) en la misma
  // respuesta del pedido — ver _actualizarTiempoEstimadoTrasGuardar() en
  // carrito-checkout.js, que rellena este mismo bloque en cuanto responde.
  const tiempoEstEl = document.getElementById('success-tiempo-estimado');
  if (tiempoEstEl) {
    tiempoEstEl.style.display = 'none';
  }

  // Resumen de ítems
  const itemsContainer = document.getElementById('success-items-list');
  if (itemsContainer && _lastTicketData && _lastTicketData.items.length) {
    const itemsHTML = _lastTicketData.items.map(it => "\n      <div class=\"success-item-row\">\n        <span class=\"success-item-name\">".concat(it.name, "</span>\n        <span class=\"success-item-qty\">\xD7").concat(it.qty, "</span>\n        <span class=\"success-item-price\">").concat(it.subtotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>")).join('');
    itemsContainer.innerHTML = "\n      <div class=\"success-summary-title\">\uD83E\uDDFE Resumen del pedido</div>\n      ".concat(itemsHTML, "\n      <div class=\"success-total-row\">\n        <span>Total a pagar</span>\n        <span>").concat(orderTotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>");
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
  }
  document.querySelector('.order-panel').style.display = "none";
  document.getElementById("success-screen").style.display = "block";
  document.getElementById("order-num-display").textContent = orderNum;
  // Se muestra si falla el guardado en el servidor (ver _finalizarPedido) —
  // hay que resetearlo aquí para que no se quede pegado de un pedido anterior.
  const saveWarning = document.getElementById('success-save-warning');
  if (saveWarning) saveWarning.style.display = 'none';
  if (typeof _sonidoConfirmacionPedido === 'function') _sonidoConfirmacionPedido();
  // Pequeño golpe táctil al confirmar, en móviles que lo soporten — refuerza
  // la sensación de "hecho" sin tener que mirar la pantalla.
  if (navigator.vibrate) { try { navigator.vibrate([80, 40, 80]); } catch (e) {} }
  // Ocultar FAB en pantalla de éxito
  const fab = document.getElementById('cart-fab');
  if (fab) fab.classList.add('hidden');
  // Arrancar temporizador de modificación (5 minutos)
  _startModifyTimer();
  setTimeout(() => {
    document.getElementById("success-screen").scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 50);
}
// Rellena el aviso de "tiempo estimado" de la pantalla de éxito una vez
// responde guardar-pedido.php — se hace aparte de showSuccess() (que ya
// mostró la pantalla, optimista, antes de que el servidor conteste) porque
// es el único sitio con acceso real a cuántos pedidos hay pendientes ahora
// mismo (stats/ y orderStatus/ son de solo-admin, un cliente anónimo no
// puede calcularlo por su cuenta).
function _actualizarTiempoEstimadoTrasGuardar(data) {
  const tiempoEstEl = document.getElementById('success-tiempo-estimado');
  if (!tiempoEstEl) return;
  const minutos = Number(data && data.minutosEsperaExtra) || 0;
  const pendientes = Number(data && data.pendientesHoy) || 0;
  if (minutos > 0) {
    tiempoEstEl.textContent = '⏳ Ahora mismo hay ' + pendientes + ' pedidos en cola — puede tardar unos ' + minutos + ' min más de lo habitual.';
    tiempoEstEl.style.display = 'block';
  } else {
    tiempoEstEl.style.display = 'none';
  }
}
function resetOrder() {
  cart = {};
  Object.keys(custCart).forEach(k => delete custCart[k]);
  Object.keys(extrasCart).forEach(k => delete extrasCart[k]);
  selectedSlot = null;
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
  document.getElementById("customer-notes").value = "";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  window._lastOrderData = null;
  // Para que la sugerencia "¿algo dulce de postre?" se pueda volver a
  // mostrar (con opciones nuevas) en el pedido siguiente, en vez de
  // arrastrar el "ya se mostró"/las mismas opciones del pedido anterior.
  window._upsellFueMostrado = false;
  window._upsellOpcionesElegidas = null;
  window._upsellYaAnimado = false;
  window._upsellDismissed = { dulce: false, bebida: false };
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
}

// ── MODIFICAR / CANCELAR PEDIDO ──────────────────────────────────────────────
// dpf_modify_window_mins vuelve a contarse en MINUTOS (como su propio
// nombre siempre dijo) — a petición expresa, después de haber estado un
// tiempo en segundos.
const MODIFY_WINDOW_DEFAULT_MS = 1 * 60 * 1000;
function getModifyWindowMs() {
  try {
    const v = parseInt(localStorage.getItem('dpf_modify_window_mins') || '1');
    return (isNaN(v) || v < 1 || v > 30 ? 1 : v) * 60 * 1000;
  } catch (e) {
    return MODIFY_WINDOW_DEFAULT_MS;
  }
}
function _startModifyTimer() {
  if (window._modifyTimerInterval) clearInterval(window._modifyTimerInterval);
  const zone = document.getElementById('order-modify-zone');
  const timerEl = document.getElementById('order-modify-timer');
  const btnMod = document.getElementById('btn-modificar-pedido');
  const btnCan = document.getElementById('btn-cancelar-pedido');
  if (!zone || !timerEl) return;
  function _tick() {
    if (!window._lastOrderData) {
      clearInterval(window._modifyTimerInterval);
      return;
    }
    const elapsed = Date.now() - window._lastOrderData.ts;
    const remaining = getModifyWindowMs() - elapsed;
    if (remaining <= 0) {
      clearInterval(window._modifyTimerInterval);
      zone.style.display = 'none';
      return;
    }
    const totalSecs = Math.ceil(remaining / 1000);
    const tiempoTxt = totalSecs < 60
      ? totalSecs + ' s'
      : Math.floor(totalSecs / 60) + ':' + String(totalSecs % 60).padStart(2, '0') + ' min';
    timerEl.textContent = "\u23F1\uFE0F Puedes modificar o cancelar tu pedido durante ".concat(tiempoTxt);
    if (btnMod) btnMod.style.display = '';
    if (btnCan) btnCan.style.display = '';
    zone.style.display = 'block';
  }
  _tick();
  window._modifyTimerInterval = setInterval(_tick, 1000);
}
async function modificarPedido() {
  const data = window._lastOrderData;
  if (!data) return;
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u270F\uFE0F</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFModificar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">Se borrar\xE1 el pedido actual y podr\xE1s rehacerlo con los mismos productos.</div>\n        <div style=\"display:flex\">\n          <button id=\"_mod-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Cancelar</button>\n          <button id=\"_mod-yes\" style=\"flex:1;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, modificar</button>\n        </div>\n      </div>";
    document.body.appendChild(modal);
    document.getElementById('_mod-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_mod-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;

  // Borrar pedido actual de Firebase y stats
  await _borrarPedidoDeFirebase(data.num, data.phone);

  // Restaurar carrito con los productos anteriores
  Object.assign(cart, data.cart);
  Object.keys(data.custCart).forEach(k => {
    custCart[k] = data.custCart[k];
  });
  Object.keys(data.extrasCart).forEach(k => {
    extrasCart[k] = data.extrasCart[k];
  });
  selectedSlot = data.slot;

  // Restaurar datos del cliente
  document.getElementById("customer-name").value = data.name || '';
  document.getElementById("customer-phone").value = data.phone || '';
  document.getElementById("customer-notes").value = data.notes || '';

  // Volver al formulario
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
  document.querySelector('.order-panel').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}
async function cancelarPedido() {
  const data = window._lastOrderData;
  if (!data) return;

  // iOS Safari bloquea confirm() silenciosamente — usamos modal propio
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u274C</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFCancelar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">El pedido ".concat(data.num, " se eliminar\xE1. Esta acci\xF3n no se puede deshacer.</div>\n        <div style=\"display:flex\">\n          <button id=\"_cancel-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">No, mantener</button>\n          <button id=\"_cancel-yes\" style=\"flex:1;padding:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, cancelar</button>\n        </div>\n      </div>");
    document.body.appendChild(modal);
    document.getElementById('_cancel-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_cancel-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;
  await _borrarPedidoDeFirebase(data.num, data.phone);
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  const icon = document.querySelector('#success-screen .success-icon');
  const title = document.querySelector('#success-screen .success-title');
  const sub = document.querySelector('#success-screen .success-sub');
  if (icon) icon.textContent = '❌';
  if (title) title.textContent = 'Pedido cancelado';
  if (sub) sub.textContent = 'Tu pedido ha sido eliminado';
  document.getElementById('order-modify-zone').style.display = 'none';
  document.getElementById('success-items-list').innerHTML = '';
}
async function _borrarPedidoDeFirebase(orderNum, phone) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // 0. Si este pedido tenía un ticket esperando en la cola de impresión
  // pendiente (porque falló al imprimir mientras la impresora estaba
  // desconectada), quitarlo — si no, en cuanto la impresora reconecte se
  // imprimiría igualmente el ticket de un pedido ya cancelado/modificado,
  // sin ningún aviso de que ya no es válido.
  if (typeof _ptColaQuitar === 'function') _ptColaQuitar(orderNum);

  // 1. Marcar como cancelado en memoria y localStorage — inmediato, para que
  // este mismo dispositivo lo refleje al instante sin esperar al servidor.
  window._orderStatusCache[_normOrderKey(orderNum)] = 'cancelado';
  try { localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache)); } catch {}

  let telefonoParaRevertirSello = phone || null;
  let slotToFree = null;

  // 2. Marcar como cancelado y quitar de stats en Firebase — a través del
  // servidor (guardar-pedido.php, acción "cancelarPedido"), NO con una
  // escritura directa del navegador. orderStatus/ y stats/ exigen el UID
  // exacto del admin en las reglas de seguridad (igual que tickets/, slots/
  // y usedOrderNums/, ver comentarios en guardar-pedido.php): cuando esta
  // función la llamaba el propio cliente (auth anónima, p.ej. al pulsar
  // "Modificar pedido"), la escritura directa fallaba en silencio y el
  // pedido se quedaba activo para siempre en cocina/estadísticas del resto
  // de dispositivos, aunque el ticket viejo nunca llegara a anularse allí.
  try {
    const resp = await fetch('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancelarPedido', orderNum, fecha: todayKey, phone: phone || '' })
    });
    const data = await resp.json();
    if (data && data.success) {
      if (data.phone) telefonoParaRevertirSello = data.phone;
      if (data.slot) slotToFree = data.slot;
    } else {
      console.warn('[cancelarPedido] el servidor no pudo anular el pedido:', data && data.error);
    }
  } catch (e) {
    console.warn('[cancelarPedido] fallo de red al anular el pedido:', e);
  }

  // 3. Borrar también de localStorage (caché local de este dispositivo)
  try {
    const local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    if (local.orders) {
      const pedido = local.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
      if (pedido && pedido.slot && !slotToFree) slotToFree = pedido.slot;
      if (pedido && pedido.phone && !telefonoParaRevertirSello) telefonoParaRevertirSello = pedido.phone;
      local.orders = local.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
      local.count = Math.max(0, (local.count || 1) - 1);
      local.total = local.orders.reduce((acc, o) => acc + (o.total || 0), 0);
      localStorage.setItem(STATS_KEY, JSON.stringify(local));
    }
  } catch {}

  // Deshacer el sello de fidelización (y el canje del premio, si lo había
  // consumido) si este pedido cancelado/modificado había llegado a
  // sumarlo — si no, se quedaba dado para siempre aunque el pedido nunca
  // llegara a ser real. Se hace en el servidor (fidelizacion.php), que
  // valida contra el ticket real antes de tocar nada.
  if (telefonoParaRevertirSello) {
    const _telLimpio = telefonoParaRevertirSello.replace(/\D/g, '');
    if (_telLimpio.length === 9) {
      // Si el cliente pulsó "Modificar"/"Cancelar" justo después de
      // confirmar, es posible que la petición que suma el sello de ESTE
      // mismo pedido todavía esté de camino (se lanza sin esperar, para no
      // retrasar la pantalla de "pedido confirmado") — si se pide la
      // reversión antes de que ese sello exista de verdad en el servidor,
      // no hay nada que revertir, y cuando el registro original llega
      // justo después, el sello se queda puesto para un pedido ya
      // cancelado. Esperar aquí a que termine (si la hay) antes de pedir
      // la reversión evita esa carrera.
      const _selloPendiente = window._selloEnCursoPorPedido && window._selloEnCursoPorPedido[orderNum];
      if (_selloPendiente) { try { await _selloPendiente; } catch (e) {} }
      fetch('fidelizacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revertirSello', telefono: _telLimpio, orderNum })
      }).catch(e => console.warn('[fidelizacion] no se pudo revertir el sello al cancelar el pedido:', e));
    }
  }

  // 4. Liberar el turno reservado — el servidor (guardar-pedido.php, misma
  // llamada "cancelarPedido" del paso 2) ya decrementó slots/<fecha>/<turno>
  // de verdad; esto solo refresca la caché local (_slotsCache/localStorage)
  // para que ESTE dispositivo vea el hueco libre al instante, sin esperar a
  // que llegue por el listener de Firebase. Antes esto no se hacía nunca (ni
  // aquí ni en el servidor), así que cada cancelación/modificación dejaba el
  // turno ocupado para siempre.
  if (slotToFree && typeof decrementSlot === 'function') {
    try { await decrementSlot(slotToFree); } catch (e) { console.warn('[slot] no se pudo liberar localmente', e); }
  }

  // 5. Refrescar cocina y pedidos en vivo inmediatamente — solo existen si
  // el bundle de admin está cargado (un cliente cancelando su propio
  // pedido nunca lo tiene, y no le hace falta).
  if (typeof refreshKitchenGrid === 'function') refreshKitchenGrid();
  if (typeof loadLiveOrders === 'function') loadLiveOrders();
}

// ══════════════════════════════════════════
//  CUSTOMIZER — PATATA AL GUSTO & BOMBA
// ══════════════════════════════════════════

// custCart holds custom items: key → { menuId, qty, sauces, ingredients, key }
const custCart = {};
const CUSTOMIZER_CONFIG = {
  algusto: {
    name: 'Patata Al Gusto',
    price: 6.90,
    maxSauces: 1,
    maxIngredients: 6,
    maxTotal: null,
    subtitle: 'Hasta 1 salsa y hasta 6 ingredientes a elegir'
  },
  bomba: {
    name: 'Patata Bomba 🆕',
    price: 8.40,
    maxSauces: null,
    maxIngredients: null,
    maxTotal: 9,
    subtitle: 'Hasta 9 ingredientes y/o salsas a elegir'
  }
};
const CUST_SAUCES = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa Rosa', 'Salsa de Yogur', 'Tomate Frito', 'Queso Philadelphia', 'Roquefort'];
const CUST_INGREDIENTS = ['Jamón York', 'Carne Picada', 'Pollo', 'Carne Kebab', 'Atún', 'Gambas', 'Tronquitos de Mar', 'Huevo', 'Bacon', 'Queso Mozzarella', '4 Quesos', 'Tomate Natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
let custType = null;
let custSelSauces = [];
let custSelIngredients = [];
let custExtraQueso = false;
let custExtraGratinado = false;
function openCustomizer(itemId) {
  const cm = document.getElementById('customizer-modal');
  if (cm && cm.parentElement !== document.body) document.body.appendChild(cm);
  custType = itemId === 15 ? 'algusto' : 'bomba';
  custSelSauces = [];
  custSelIngredients = [];
  custExtraQueso = false;
  custExtraGratinado = false;
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-price').textContent = cfg.price.toFixed(2).replace('.', ',') + ' €';
  document.getElementById('cust-error').style.display = 'none';
  // Reset extras UI
  updateCustExtraUI('queso', false);
  updateCustExtraUI('gratinado', false);
  // Restaurar visibilidad de barra de salsas (puede haber quedado oculta de bomba anterior)
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (sauceProg) sauceProg.style.display = 'flex';
  renderCustChips();
  updateCustProgress();
  // Guardar posición de scroll antes de bloquear — evita salto al cerrar en móvil
  window._custScrollY = window.scrollY;
  document.getElementById('customizer-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCustomizer() {
  document.getElementById('customizer-modal').classList.remove('open');
  document.body.style.overflow = '';
  // Restaurar posición de scroll — Safari no soporta behavior:'instant', usar scrollTo directamente
  if (window._custScrollY !== undefined) {
    window.scrollTo(0, window._custScrollY);
    window._custScrollY = undefined;
  }
  custType = null;
}
function custSelTotal() {
  return custSelSauces.length + custSelIngredients.length;
}
function toggleCustExtra(type) {
  if (type === 'queso') {
    custExtraQueso = !custExtraQueso;
    // Si quita queso y no es solo gratinado, quitar también gratinado
    if (!custExtraQueso && custExtraGratinado) {
      custExtraGratinado = false;
      updateCustExtraUI('gratinado', false);
    }
  } else {
    custExtraGratinado = !custExtraGratinado;
    // Si activa gratinado, activar queso también
    if (custExtraGratinado && !custExtraQueso) {
      custExtraQueso = true;
      updateCustExtraUI('queso', true);
    }
  }
  updateCustExtraUI(type, type === 'queso' ? custExtraQueso : custExtraGratinado);
  updateCustTotalPrice();
}
function updateCustExtraUI(type, active) {
  const check = document.getElementById('cust-extra-check-' + type);
  const label = document.getElementById('cust-' + type + '-label');
  if (!check) return;
  if (active) {
    check.style.background = '#3D1F0D';
    check.style.borderColor = '#3D1F0D';
    check.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) {
      label.style.borderColor = '#3D1F0D';
      label.style.background = 'rgba(244,196,48,0.08)';
    }
  } else {
    check.style.background = '#fff';
    check.style.borderColor = '#F5E6C8';
    check.innerHTML = '';
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  }
}
function updateCustTotalPrice() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  let price = cfg.price;
  if (custExtraQueso) price += 1.00;
  if (custExtraGratinado) price += 0.50;
  document.getElementById('cust-price').textContent = price.toFixed(2).replace('.', ',') + ' €';
}
function renderCustChips() {
  if (!custType) return;
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  const saucesEl = document.getElementById('cust-sauces');
  const ingsEl = document.getElementById('cust-ingredients');
  saucesEl.innerHTML = CUST_SAUCES.map(s => {
    const sel = custSelSauces.includes(s);
    // Salsas: bloqueadas por maxSauces (algusto) o por maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustSauce(this,'").concat(s.replace(/'/g, "&#39;"), "')\">").concat(s, "</button>");
  }).join('');
  ingsEl.innerHTML = CUST_INGREDIENTS.map(i => {
    const sel = custSelIngredients.includes(i);
    // Ingredientes: bloqueados por maxIngredients (algusto) o maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustIng(this,'").concat(i.replace(/'/g, "&#39;"), "')\">").concat(i, "</button>");
  }).join('');
}
function toggleCustSauce(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelSauces.indexOf(name);
  if (idx >= 0) custSelSauces.splice(idx, 1);else custSelSauces.push(name);
  renderCustChips();
  updateCustProgress();
}
function toggleCustIng(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelIngredients.indexOf(name);
  if (idx >= 0) custSelIngredients.splice(idx, 1);else custSelIngredients.push(name);
  renderCustChips();
  updateCustProgress();
}
function updateCustProgress() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const ns = custSelSauces.length,
    ni = custSelIngredients.length,
    total = ns + ni;
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (cfg.maxTotal !== null) {
    // Bomba: una barra de progreso total combinada, ocultar barra de salsas separada
    const pct = Math.min(100, Math.round(total / cfg.maxTotal * 100));
    const cls = pct >= 100 ? 'full' : '';
    if (sauceProg) sauceProg.style.display = 'none';
    document.getElementById('cust-sauce-badge').textContent = ns;
    document.getElementById('cust-ing-label').textContent = 'Total: ' + total + '/' + cfg.maxTotal + ' (salsas: ' + ns + ' · ing: ' + ni + ')';
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pct / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill ' + cls;
    document.getElementById('cust-ing-badge').textContent = total + '/' + cfg.maxTotal;
  } else {
    // Al Gusto: dos barras independientes
    if (sauceProg) sauceProg.style.display = 'flex';
    const pctS = Math.min(100, Math.round(ns / cfg.maxSauces * 100));
    const pctI = Math.min(100, Math.round(ni / cfg.maxIngredients * 100));
    document.getElementById('cust-sauce-label').textContent = 'Salsas: ' + ns + '/' + cfg.maxSauces;
    document.getElementById('cust-sauce-bar').style.setProperty('--pct', pctS / 100);
    document.getElementById('cust-sauce-bar').className = 'progress-bar-fill' + (pctS >= 100 ? ' full' : '');
    document.getElementById('cust-sauce-badge').textContent = ns + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-label').textContent = 'Ingredientes: ' + ni + '/' + cfg.maxIngredients;
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pctI / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill' + (pctI >= 100 ? ' full' : '');
    document.getElementById('cust-ing-badge').textContent = ni + '/' + cfg.maxIngredients;
  }
}
function removeCustItem(key) {
  delete custCart[key];
  renderMenu();
  renderCart();
}
function confirmCustomizer() {
  if (isShopBlocked()) {
    showClosedToast();
    closeCustomizer();
    return;
  }
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';

  // Validar máximos
  if (cfg.maxTotal !== null && custSelTotal() > cfg.maxTotal) {
    errEl.textContent = 'Máximo ' + cfg.maxTotal + ' ingredientes y/o salsas en total';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxSauces !== null && custSelSauces.length > cfg.maxSauces) {
    errEl.textContent = 'Máximo ' + cfg.maxSauces + ' salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxIngredients !== null && custSelIngredients.length > cfg.maxIngredients) {
    errEl.textContent = 'Máximo ' + cfg.maxIngredients + ' ingredientes';
    errEl.style.display = 'block';
    return;
  }
  const itemId = custType === 'algusto' ? 15 : 16;
  const fingerprint = [...custSelSauces, '|', ...custSelIngredients, '|', custExtraQueso ? 'Q' : '', custExtraGratinado ? 'G' : ''].join(',');
  const cartKey = itemId + '::' + fingerprint;
  if (!custCart[cartKey]) {
    custCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      sauces: [...custSelSauces],
      ingredients: [...custSelIngredients],
      extraQueso: custExtraQueso,
      extraGratinado: custExtraGratinado,
      key: cartKey
    };
  }
  custCart[cartKey].qty++;
  closeCustomizer();
  renderMenu();
  renderCart();
}
