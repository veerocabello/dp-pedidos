// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
// BLACKLIST_KEY, ANTISPAM_KEY, PHONE_LOG_KEY, getBlacklist,
// saveBlacklistLocal y getAntiSpamCfg viven en nucleo-compartido.js —
// el checkout (carrito-checkout.js) los necesita para bloquear pedidos de
// números en la lista negra o que superen el límite anti-spam. La UI de
// admin para editar esa lista/configuración vive en admin-antispam-stats.js,
// igual que loadDayStats/resetSlots/confirmClearDay/resetDayStats/
// cancelarPedidoAdmin (panel de estadísticas del día).
async function showSuccess(orderNum, slotTime, discountCode) {
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

  // ── Mostrar la confirmación YA, antes de nada más ──────────────────
  // _finalizarPedido() (carrito-checkout.js) ya mandó el guardado real
  // del pedido al servidor ANTES de llamar aquí, sin esperar a que esta
  // función termine — así que en cuanto se llega a este punto el pedido
  // ya está en camino de guardarse bien, pase lo que pase después. Todo
  // lo de abajo (estadísticas, lista de productos para el resumen, datos
  // para WhatsApp...) es secundario: antes, si CUALQUIERA de esos pasos
  // lanzaba una excepción sin capturar, se perdía la función entera A
  // MITAD, sin haber llegado nunca a la línea que hace visible la
  // pantalla de éxito — el cliente se quedaba viendo el formulario de
  // siempre, sin ningún aviso ni error visible, pensando que el pedido no
  // se había hecho... aunque el ticket ya estuviera imprimiéndose en
  // cocina. Mostrar esto lo primero, fuera del try de más abajo,
  // garantiza que el cliente vea la confirmación siempre, incluso si algo
  // secundario falla.
  const _panel = document.querySelector('.order-panel');
  if (_panel) _panel.style.display = 'none';
  const _successScreenEl = document.getElementById('success-screen');
  if (_successScreenEl) _successScreenEl.style.display = 'block';
  const _orderNumDisplayEl = document.getElementById('order-num-display');
  if (_orderNumDisplayEl) _orderNumDisplayEl.textContent = orderNum;
  setTimeout(() => {
    const el = document.getElementById('success-screen');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);

  try {

  // Mismo motivo que el bloque de arriba: si el pedido anterior en esta
  // visita se llegó a cancelar, cancelarPedido() dejó los botones de
  // Modificar/Cancelar deshabilitados (para evitar un segundo click
  // mientras esperaba al servidor) y ocultó el de WhatsApp (para que no
  // generara un mensaje de un pedido ya eliminado) — sin resetear esto
  // aquí, el pedido SIGUIENTE se confirmaba bien pero se quedaba sin poder
  // modificarlo/cancelarlo ni compartirlo por WhatsApp.
  if (typeof _setBotonEsperaServidor === 'function') {
    _setBotonEsperaServidor(document.getElementById('btn-modificar-pedido'), false);
    _setBotonEsperaServidor(document.getElementById('btn-cancelar-pedido'), false);
    _setBotonEsperaServidor(document.getElementById('btn-hacer-otro-pedido'), false);
  }
  const _btnWspReset = document.getElementById('btn-whatsapp-share');
  if (_btnWspReset) _btnWspReset.style.display = '';
  // Exponer datos del pedido para el botón de WhatsApp
  window.currentOrderNum = orderNum;
  window.currentOrderSlot = slotTime || null;
  window.currentOrderName = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
  // El botón "💬 Compartir por WhatsApp" (index.php) llama a
  // shareOrderWhatsApp(currentOrderNum,...,currentOrderItems,currentOrderTotal)
  // — currentOrderItems/currentOrderTotal nunca se llegaron a exponer aquí
  // (solo los otros tres), así que ese botón lanzaba un ReferenceError sin
  // llegar a abrir WhatsApp. shareOrderWhatsApp espera cada item con
  // {qty,name,price}, así que se mapea desde _lastTicketData.items (que
  // trae {name,qty,subtotal,...}) — y se dejan fuera los gastos de gestión
  // y las líneas de descuento (isFee / subtotal negativo), que no son
  // "productos" y solo añadirían ruido a un mensaje pensado para
  // compartir con un amigo lo que se ha pedido.
  window.currentOrderItems = (_lastTicketData && Array.isArray(_lastTicketData.items))
    ? _lastTicketData.items.filter(function (it) { return !it.isFee && it.subtotal > 0; })
      .map(function (it) { return { qty: it.qty, name: it.name, price: it.subtotal }; })
    : [];
  window.currentOrderTotal = _lastTicketData ? _lastTicketData.total : 0;
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
    promosCart: JSON.parse(JSON.stringify(promosCart)),
    // El código de descuento aplicado a ESTE pedido — antes no se guardaba
    // aquí, y para cuando se llega a este punto _activeDiscount ya se ha
    // puesto a null (ver el comentario junto a esa línea en
    // _finalizarPedido, carrito-checkout.js). Sin esto, modificarPedido()
    // no tenía forma de volver a aplicarlo: el cliente podía acabar
    // confirmando el pedido "modificado" pagando de más, sin descuento y
    // sin ningún aviso de que se había perdido.
    discountCode: discountCode || null,
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
        // Faltaba promosCart — si el último pedido llevaba una promo,
        // "Repetir pedido" (carta.js) nunca podía devolverla al carrito
        // (ni siquiera intentaba omitirla con aviso: simplemente no existía
        // este dato), aunque la propia tarjeta la listara y mostrara el
        // total original con la promo incluida.
        promosCart: JSON.parse(JSON.stringify(promosCart)),
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

  // El turno ya se reservó de verdad ANTES de llegar aquí (ver
  // incrementSlot() dentro de submitOrder(), en carrito-checkout.js) —
  // reservarlo aquí, con el pedido ya confirmado en pantalla, era
  // justo lo que permitía sobrevender un turno de verdad si varios
  // clientes pedían casi a la vez para el mismo turno.

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

  } catch (e) {
    // La confirmación YA se mostró (bloque de arriba, antes de este try) —
    // esto solo deja constancia de qué falló en lo secundario (resumen de
    // productos, WhatsApp, estadísticas...) para poder investigarlo, sin
    // que el cliente se quede sin saber si su pedido se hizo.
    console.error('[showSuccess] Error en lo secundario tras confirmar el pedido ' + orderNum + ' (el pedido en sí ya se guardó/mostró bien):', e);
    if (typeof logActivity === 'function') {
      logActivity('⚠️ Pedido ' + orderNum + ' confirmado, pero falló algo secundario al mostrar la pantalla de éxito (revisar consola/Sentry): ' + (e && e.message || e));
    }
  }
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
  Object.keys(promosCart).forEach(k => delete promosCart[k]);
  if (typeof _borrarCarritoDeStorage === 'function') _borrarCarritoDeStorage();
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
// NOTA (hallazgo de auditoría, Alto, revisado con la dueña y ACEPTADO por
// ahora a propósito): este contador solo esconde los botones al llegar a
// 0 — ni aquí ni en el servidor (guardar-pedido.php, action
// 'cancelarPedido') se comprueba de verdad la antigüedad del pedido antes
// de ejecutar modificar/cancelar. No se cierra porque el servidor no tiene
// forma de distinguir esta acción del propio botón "✕" del panel de
// admin (misma action, sin sesión de admin que comprobar) — un límite de
// tiempo ahí bloquearía también a la dueña cancelando un pedido antiguo
// desde el panel. Ver el comentario largo junto a 'cancelarPedido' en
// guardar-pedido.php para el detalle completo.
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
// Pequeño helper para deshabilitar/rehabilitar un botón mientras se espera
// al servidor (modificarPedido/cancelarPedido) — además de el.disabled,
// atenúa el botón para que se note que está "procesando" (ninguno de los
// dos tenía antes ningún estilo :disabled propio ni de CSS global).
function _setBotonEsperaServidor(el, disabled) {
  if (!el) return;
  el.disabled = disabled;
  el.style.opacity = disabled ? '.6' : '';
  el.style.cursor = disabled ? 'not-allowed' : 'pointer';
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

  // Deshabilitar los botones mientras se espera al servidor — sin esto, un
  // segundo click (o pulsar "Cancelar pedido" a la vez) durante el await
  // disparaba una segunda llamada concurrente para el mismo pedido: el
  // servidor liberaba el turno y revertía las ventas del producto una
  // segunda vez (ver el fix de idempotencia en la acción 'cancelarPedido',
  // guardar-pedido.php). "Hacer otro pedido" también se deshabilita — si el
  // cliente lo pulsaba en este hueco y empezaba el carrito del pedido
  // siguiente, esta función seguía con los datos capturados al principio y
  // lo sobreescribía en silencio al terminar (ver la comprobación de más
  // abajo, que además cubre cualquier otro camino que pudiera colarse).
  const _btnMod = document.getElementById('btn-modificar-pedido');
  const _btnCan = document.getElementById('btn-cancelar-pedido');
  const _btnNuevo = document.getElementById('btn-hacer-otro-pedido');
  _setBotonEsperaServidor(_btnMod, true);
  _setBotonEsperaServidor(_btnCan, true);
  _setBotonEsperaServidor(_btnNuevo, true);

  // Borrar pedido actual de Firebase y stats — si el servidor no llega a
  // confirmarlo (red caída justo al pulsar), NO se sigue adelante: hacerlo
  // de todas formas dejaría el pedido viejo vivo en cocina Y crearía uno
  // nuevo con otro número al reenviar el formulario — cocina terminaría
  // preparando dos, uno de los cuales nadie recoge.
  const _borrado = await _borrarPedidoDeFirebase(data.num, data.phone);
  if (!_borrado) {
    _setBotonEsperaServidor(_btnMod, false);
    _setBotonEsperaServidor(_btnCan, false);
    _setBotonEsperaServidor(_btnNuevo, false);
    showAlert('No se pudo modificar el pedido ' + data.num + ' — parece que se ha perdido la conexión. Tu pedido original sigue activo tal cual estaba; inténtalo de nuevo en unos segundos.');
    return;
  }

  // El pedido YA estaba cancelado de antes (normalmente, la dueña lo
  // canceló desde el panel/tablet mientras este móvil seguía mostrando el
  // aviso de "pedido activo", sin enterarse) — seguir adelante como si se
  // estuviera editando un pedido vivo restauraría el carrito y marcaría el
  // turno de entonces como "elegido" en el selector, aunque no hubiera
  // nada real detrás: el cliente veía un turno oscuro/"seleccionado" sin
  // haberlo tocado, con "X libres" real al lado — confuso, parecía un
  // fallo aunque el aforo en sí fuera correcto. Mejor avisar claro y
  // empezar un pedido limpio de cero.
  if (_borrado === 'ya-cancelado') {
    if (window._lastOrderData !== data) return;
    window._lastOrderData = null;
    try { localStorage.removeItem('dpf_active_order'); } catch (e) {}
    if (window._modifyTimerInterval) {
      clearInterval(window._modifyTimerInterval);
      window._modifyTimerInterval = null;
    }
    resetOrder();
    showAlert('Tu pedido ' + data.num + ' ya había sido cancelado antes de que pudieras modificarlo. Puedes hacer un pedido nuevo cuando quieras.', 'Pedido ya cancelado');
    return;
  }

  // Si en el rato que hemos esperado al servidor el cliente ya pulsó
  // "Hacer otro pedido" (resetOrder() ya vació el carrito y puso
  // window._lastOrderData a null para el pedido NUEVO que está
  // empezando), no seguimos: continuar aquí sobreescribiría en silencio
  // ese carrito/nombre/teléfono/turno nuevos con los del pedido antiguo
  // que se acaba de anular. El pedido antiguo ya quedó anulado en el
  // servidor de todas formas — eso no se deshace ni hace falta deshacerlo.
  if (window._lastOrderData !== data) return;

  // Restaurar carrito con los productos anteriores
  Object.assign(cart, data.cart);
  Object.keys(data.custCart).forEach(k => {
    custCart[k] = data.custCart[k];
  });
  Object.keys(data.extrasCart).forEach(k => {
    extrasCart[k] = data.extrasCart[k];
  });
  // (data.promosCart || {}): pedidos ya guardados en localStorage antes de
  // este cambio no llevan este campo — sin la guarda, Object.keys(undefined)
  // rompería modificarPedido() para cualquiera con un pedido activo
  // guardado justo en el momento del despliegue.
  Object.keys(data.promosCart || {}).forEach(k => {
    promosCart[k] = data.promosCart[k];
  });

  // Restaurar datos del cliente
  document.getElementById("customer-name").value = data.name || '';
  document.getElementById("customer-phone").value = data.phone || '';
  document.getElementById("customer-notes").value = data.notes || '';

  // Volver a aplicar el código de descuento que tenía este pedido — para
  // cuando se llega aquí, _finalizarPedido() ya lo había limpiado del todo
  // (ver el comentario junto a discountCode en el snapshot, showSuccess()),
  // así que sin esto el total se recalculaba SIN el descuento y el cliente
  // podía acabar confirmando de nuevo pagando más de lo que había aceptado,
  // sin ningún aviso. Se reaplica con dcAplicar() (no a mano) para que
  // vuelva a comprobarse contra el servidor — si el código ya caducó o
  // se agotó justo en este rato, se avisa igual que la primera vez, en
  // vez de dar por hecho que sigue siendo válido.
  if (data.discountCode) {
    document.querySelectorAll('#discount-input, #drawer-discount-input').forEach(el => { el.value = data.discountCode; });
    if (typeof dcAplicar === 'function') await dcAplicar(data.discountCode);
  }

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
  // El turno se restaura DESPUÉS de renderCart() (que ya deja pintados los
  // botones de turno vía renderSlotPicker) para poder usar selectSlot(),
  // la única función que además de fijar la variable también marca la
  // casilla como seleccionada — antes se asignaba solo la variable interna
  // (selectedSlot = data.slot), correcta para el envío pero sin ningún
  // turno resaltado en pantalla: el cliente volvía al formulario y parecía
  // que se había perdido la hora de recogida aunque no fuera así.
  if (data.slot) selectSlot(data.slot);
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

  // Deshabilitar los botones mientras se espera al servidor — mismo motivo
  // que en modificarPedido(): sin esto, un segundo click (o pulsar
  // "Modificar pedido" a la vez) durante el await disparaba una segunda
  // llamada concurrente para el mismo pedido, y el servidor liberaba el
  // turno y revertía las ventas del producto una segunda vez.
  const _btnMod2 = document.getElementById('btn-modificar-pedido');
  const _btnCan2 = document.getElementById('btn-cancelar-pedido');
  _setBotonEsperaServidor(_btnMod2, true);
  _setBotonEsperaServidor(_btnCan2, true);

  // Si el servidor no confirma la cancelación (red caída justo al pulsar),
  // no se muestra "Pedido cancelado" — el pedido sigue vivo de verdad en
  // cocina, así que decírselo al cliente como si ya estuviera anulado solo
  // lo dejaría sin recogerlo ni avisar a nadie.
  const _borrado = await _borrarPedidoDeFirebase(data.num, data.phone);
  if (!_borrado) {
    _setBotonEsperaServidor(_btnMod2, false);
    _setBotonEsperaServidor(_btnCan2, false);
    showAlert('No se pudo cancelar el pedido ' + data.num + ' — parece que se ha perdido la conexión. Tu pedido sigue activo; inténtalo de nuevo en unos segundos.');
    return;
  }

  // Igual que en modificarPedido(): si mientras esperábamos al servidor el
  // cliente ya pulsó "Hacer otro pedido" y empezó uno nuevo, no pisamos esa
  // pantalla con el aviso de "cancelado" del pedido antiguo — ese ya quedó
  // anulado en el servidor de todas formas.
  if (window._lastOrderData !== data) return;

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
  // El botón de WhatsApp vive fuera de order-modify-zone (no se oculta con
  // lo de arriba) y seguía visible justo debajo de "❌ Pedido cancelado",
  // generando un mensaje de "Ven a recogerlo y paga en caja" para un
  // pedido que ya no existe — se oculta aquí; showSuccess() lo vuelve a
  // mostrar en cuanto haya un pedido nuevo de verdad confirmado.
  const btnWsp = document.getElementById('btn-whatsapp-share');
  if (btnWsp) btnWsp.style.display = 'none';
}
// Devuelve true solo si el servidor confirmó de verdad que anuló el
// pedido — antes esta función no devolvía nada, así que cancelarPedido()/
// modificarPedido() seguían adelante igual (mostrando "cancelado" o
// reabriendo el carrito para un pedido nuevo) aunque la petición hubiera
// fallado por completo (red caída justo al pulsar). El pedido seguía vivo
// en cocina/estadísticas mientras el cliente creía que estaba anulado, o
// —peor— se creaba un pedido nuevo con el viejo todavía activo, y cocina
// terminaba preparando dos.
// Fecha de "hoy" en Europe/Madrid, no en UTC — new Date().toISOString()
// devuelve la fecha UTC pase lo que pase (da igual la zona horaria
// configurada en el dispositivo del cliente): entre las 00:00 y la
// 01:00-02:00 hora de Madrid (según horario de verano/invierno),
// toISOString() todavía da el día ANTERIOR. El servidor (guardar-pedido.php)
// fija explícitamente Europe/Madrid para todo lo que usa esta misma clave de
// fecha (slots/, stats/, tickets/, usedOrderNums/) — sin esto, cancelar un
// pedido hecho justo pasada la medianoche podía apuntar a la clave de fecha
// equivocada.
function _todayKeyMadrid() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
async function _borrarPedidoDeFirebase(orderNum, phone, comoAdmin) {
  const todayKey = _todayKeyMadrid();

  // 0. Si este pedido tenía un ticket esperando en la cola de impresión
  // pendiente (porque falló al imprimir mientras la impresora estaba
  // desconectada), quitarlo — si no, en cuanto la impresora reconecte se
  // imprimiría igualmente el ticket de un pedido ya cancelado/modificado,
  // sin ningún aviso de que ya no es válido.
  if (typeof _ptColaQuitar === 'function') _ptColaQuitar(orderNum);

  // 1. Marcar como cancelado en memoria y localStorage — inmediato, para que
  // este mismo dispositivo lo refleje al instante sin esperar al servidor.
  // Es optimista a propósito (para que se note en cocina sin retraso) — si
  // el servidor termina rechazando la cancelación (paso 2), se deshace más
  // abajo para no dejar este dispositivo con un estado que ya no es real.
  const _estadoAnterior = window._orderStatusCache[_normOrderKey(orderNum)];
  window._orderStatusCache[_normOrderKey(orderNum)] = 'cancelado';
  try { localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache)); } catch {}

  let telefonoParaRevertirSello = null;
  let slotToFree = null;
  let cancelConfirmado = false;
  let yaEstabaCanceladoAntes = false;

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
    // Cancelando desde el panel de Admin (cancelarPedidoAdmin en
    // admin-antispam-stats.js pasa comoAdmin=true): se manda también el
    // deviceId+token de dispositivo de confianza, para que el servidor
    // pueda cancelar el pedido aunque no tenga teléfono guardado (o no
    // coincida) — ver $cEsAdminConfianza en guardar-pedido.php. El cliente
    // cancelando su propio pedido (comoAdmin=false/undefined) sigue
    // demostrando que es suyo solo con el teléfono, como siempre.
    const credencialesAdmin = comoAdmin ? {
      deviceId: typeof getDeviceId === 'function' ? getDeviceId() : localStorage.getItem('dpf_device_id'),
      token: localStorage.getItem('dpf_trusted_token')
    } : {};
    const resp = await fetch('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancelarPedido', orderNum, fecha: todayKey, phone: phone || '', ...credencialesAdmin })
    });
    const data = await resp.json();
    if (data && data.success) {
      cancelConfirmado = true;
      telefonoParaRevertirSello = data.phone || phone || null;
      if (data.slot) slotToFree = data.slot;
      yaEstabaCanceladoAntes = !!data.yaEstabaCancelado;
    } else {
      console.warn('[cancelarPedido] el servidor no pudo anular el pedido:', data && data.error);
    }
  } catch (e) {
    console.warn('[cancelarPedido] fallo de red al anular el pedido:', e);
  }

  if (!cancelConfirmado) {
    // Deshacer el marcado optimista del paso 1: el pedido sigue activo de
    // verdad, así que este dispositivo no debe mostrarlo como cancelado.
    if (_estadoAnterior === undefined) delete window._orderStatusCache[_normOrderKey(orderNum)];
    else window._orderStatusCache[_normOrderKey(orderNum)] = _estadoAnterior;
    try { localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache)); } catch {}
    return false;
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
      // Antes esto se disparaba "por su cuenta" (sin esperar) para no
      // retrasar la cancelación — pero eso dejaba la pantalla con el
      // aviso de "patata gratis" desactualizado: si el cliente hacía otro
      // pedido justo después con el mismo teléfono ya escrito (sin volver
      // a teclearlo, que es lo único que dispara _comprobarPremioFidelizacion),
      // no se enteraba de que ya tenía premio disponible otra vez aunque el
      // servidor sí lo hubiera revertido bien. Ahora se espera a que
      // termine y se vuelve a comprobar el teléfono para refrescar el
      // aviso solo, sin que haga falta borrar y reescribir el número.
      try {
        await fetch('fidelizacion.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'revertirSello', telefono: _telLimpio, orderNum })
        });
      } catch (e) {
        console.warn('[fidelizacion] no se pudo revertir el sello al cancelar el pedido:', e);
      }
      if (typeof _comprobarPremioFidelizacion === 'function') {
        try { await _comprobarPremioFidelizacion(_telLimpio); } catch (e) {}
      }
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

  // 'ya-cancelado' (en vez de true a secas) cuando el pedido YA estaba
  // cancelado de antes (típicamente, la dueña lo canceló desde el panel/
  // tablet y este dispositivo no se había enterado) — sigue siendo un
  // valor "truthy" para no romper los `if (!_borrado)` que ya comprueban
  // fallos de red, pero modificarPedido() lo distingue para no restaurar
  // el carrito/turno como si estuviera editando un pedido que sigue vivo.
  return yaEstabaCanceladoAntes ? 'ya-cancelado' : true;
}

// ══════════════════════════════════════════
//  CUSTOMIZER — PATATA AL GUSTO & BOMBA
// ══════════════════════════════════════════

// custCart holds custom items: key → { menuId, qty, sauces, ingredients, key }
const custCart = {};
const CUSTOMIZER_CONFIG = {
  algusto: {
    name: 'Patata Al Gusto',
    price: 7.90,
    maxSauces: 1,
    maxIngredients: 6,
    maxTotal: null,
    subtitle: 'Hasta 1 salsa y hasta 6 ingredientes a elegir'
  },
  bomba: {
    name: 'Patata Bomba 🆕',
    price: 9.40,
    maxSauces: null,
    maxIngredients: null,
    maxTotal: 9,
    subtitle: 'Hasta 9 ingredientes y/o salsas a elegir'
  }
};
const CUST_SAUCES = ['Aceite', 'Alioli', 'BBQ', 'Brava', 'Ketchup', 'Mantequilla', 'Mayonesa', 'Queso Philadelphia', 'Ranchera', 'Roquefort', 'Salsa de Yogur', 'Salsa Rosa', 'Tomate Frito'];
// "Sin salsa" es una salsa más de cara al cupo (maxSauces/maxTotal) y a la
// validación de "elige al menos 1 salsa o ingrediente" — así un cliente que
// no quiere ninguna salsa puede decirlo explícito en vez de tener que
// rellenar el hueco con una salsa/ingrediente que no quiere solo para poder
// confirmar. Se guarda como texto plano (CUST_SIN_SALSA), sin el emoji —
// el 🚫 es solo para la chapa del selector; en el ticket/carrito se ve
// "Sin salsa" a secas, igual que el resto de extras de esta web.
const CUST_SIN_SALSA = 'Sin salsa';
const CUST_INGREDIENTS = ['4 Quesos', 'Aceitunas', 'Atún', 'Bacon', 'Carne Kebab', 'Carne Picada', 'Cebolla', 'Champiñón', 'Gambas', 'Huevo', 'Jamón York', 'Maíz', 'Piña', 'Pollo', 'Queso Mozzarella', 'Remolacha', 'Tomate Natural', 'Tronquitos de Mar', 'Zanahoria'];
let custType = null;
let custSelSauces = [];
let custSelIngredients = [];
let custExtraQueso = false;
let custExtraGratinado = false;
// Cuando el modal se abre para EDITAR una línea ya existente del carrito
// (duplicarCustItem) en vez de para añadir una desde cero, aquí se guarda
// la clave de esa línea — confirmCustomizer() la usa para SUSTITUIRLA en
// vez de dejarla tal cual y sumar una línea nueva al lado.
let _custEditandoKey = null;
function openCustomizer(itemId) {
  // Se abre "desde cero" (no para editar) salvo que duplicarCustItem() lo
  // marque justo después de esta llamada.
  _custEditandoKey = null;
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
  _custEditandoKey = null;
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
// Si ya se eligió "Queso Mozzarella" o "4 Quesos" como ingrediente (gratis,
// dentro del cupo), el gratinado ya tiene con qué gratinar — sin esto,
// marcar "🔥 Gratinado" volvía a marcar también "🧀 Queso mozzarella
// +1,00€" aunque el cliente ya tuviera queso puesto, como si no lo tuviera.
function custTieneQuesoIngrediente() {
  return custSelIngredients.includes('Queso Mozzarella') || custSelIngredients.includes('4 Quesos');
}
// "🧀 Queso mozzarella" (extra de pago) y "Queso Mozzarella"/"4 Quesos" de
// INGREDIENTES son el mismo queso — igual que en el modal de extras
// normal (ver _actualizarDisponibilidadQuesoToggle en nucleo-compartido.js).
// Si ya está puesto como ingrediente (dentro o fuera del cupo, da igual),
// el botón de pago se oculta del todo en vez de dejar marcar los dos —
// nunca debe poder cobrarse el queso dos veces ni por accidente.
function _actualizarDisponibilidadQuesoToggleCust() {
  const tiene = custTieneQuesoIngrediente();
  if (tiene && custExtraQueso) {
    custExtraQueso = false;
    updateCustExtraUI('queso', false);
  }
  const label = document.getElementById('cust-queso-label');
  if (label) label.style.display = tiene ? 'none' : 'flex';
}
function toggleCustExtra(type) {
  if (type === 'queso') {
    // El botón "Queso mozzarella" es un atajo para marcarlo como
    // INGREDIENTE — así se beneficia del mismo cupo gratis que el resto
    // (o se cobra como extra solo si ya no quedan huecos libres) en vez
    // de cobrar siempre 1,20€ fijos aunque sobren huecos sin usar
    // ("si aún no han llegado a los ingredientes no tiene sentido que se
    // cobre"). Solo AÑADE — una vez puesto, el botón se oculta (ver
    // _actualizarDisponibilidadQuesoToggleCust) y se gestiona desde el
    // propio chip de ingredientes, incluido quitarlo.
    if (!custTieneQuesoIngrediente()) {
      custSelIngredients.push('Queso Mozzarella');
      // Por si esta línea se abrió para editar una ya guardada de antes
      // de este cambio, con el extra de pago marcado a la vez — se limpia
      // para que no se cobren los dos.
      custExtraQueso = false;
    }
    renderCustChips();
    updateCustProgress();
    updateCustTotalPrice();
    return;
  }
  custExtraGratinado = !custExtraGratinado;
  // Si activa gratinado y no lleva queso de ninguna forma, añade Queso
  // Mozzarella como ingrediente (mismo criterio que el botón de arriba)
  // para que el gratinado tenga con qué gratinar, respetando el cupo
  // gratis en vez de cobrar siempre el extra de pago.
  if (custExtraGratinado && !custTieneQuesoIngrediente()) {
    custSelIngredients.push('Queso Mozzarella');
  }
  updateCustExtraUI('gratinado', custExtraGratinado);
  renderCustChips();
  updateCustProgress();
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
  if (custExtraQueso) price += 1.20;
  if (custExtraGratinado) price += 0.50;
  price += precioExtraIngredientesCust(custSelIngredients, custType === 'algusto' ? 15 : 16, custSelSauces.length);
  price += precioExtraSalsasCust(custSelSauces, custType === 'algusto' ? 15 : 16);
  document.getElementById('cust-price').textContent = price.toFixed(2).replace('.', ',') + ' €';
}
function renderCustChips() {
  if (!custType) return;
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  const saucesEl = document.getElementById('cust-sauces');
  const ingsEl = document.getElementById('cust-ingredients');
  // "Sin salsa" siempre se puede pulsar (nunca "disabled") — elegirla
  // sustituye cualquier salsa ya puesta (ver toggleCustSauce), así que no
  // tiene sentido bloquearla por haber llegado ya al máximo de salsas.
  const sinSalsaSel = custSelSauces.includes(CUST_SIN_SALSA);
  const sinSalsaChip = "<button class=\"chip ".concat(sinSalsaSel ? 'selected' : '', "\"\n      onclick=\"toggleCustSauce(this,'").concat(CUST_SIN_SALSA, "')\">🚫 Sin salsa</button>");
  // Salsas: ya NO se bloquean al llegar al cupo — se puede seguir marcando,
  // pero lo que pase del cupo se cobra como un extra normal (ver
  // precioExtraSalsasCust en nucleo-compartido.js), igual que los
  // ingredientes. El cupo se reparte en el orden en que se fueron marcando.
  const libreSal = _libreSalsasCust(custType === 'algusto' ? 15 : 16);
  saucesEl.innerHTML = sinSalsaChip + CUST_SAUCES.map(s => {
    const idx = custSelSauces.indexOf(s);
    const sel = idx >= 0;
    const esExtra = sel && idx >= libreSal;
    const cls = 'chip' + (sel ? ' selected' : '') + (esExtra ? ' extra' : '');
    return "<button class=\"".concat(cls, "\"\n      onclick=\"toggleCustSauce(this,'").concat(s.replace(/'/g, "&#39;"), "')\">").concat(s).concat(esExtra ? ' · extra' : '', "</button>");
  }).join('');
  // Ingredientes: ya NO se bloquean al llegar al cupo — se puede seguir
  // marcando, pero lo que pase del cupo se cobra como un extra normal (ver
  // precioExtraIngredientesCust en nucleo-compartido.js). El cupo se
  // reparte en el orden en que se fueron marcando, así que aquí se cuenta
  // cuántas unidades de CADA ingrediente caen ya en la parte "extra".
  const libreIng = _libreIngredientesCust(custType === 'algusto' ? 15 : 16, custSelSauces.length);
  const extraPorNombre = {};
  custSelIngredients.forEach((nombre, idx) => {
    if (idx >= libreIng) extraPorNombre[nombre] = (extraPorNombre[nombre] || 0) + 1;
  });
  ingsEl.innerHTML = CUST_INGREDIENTS.map(i => {
    const qty = custSelIngredients.filter(n => n === i).length;
    const sel = qty > 0;
    const extraCount = extraPorNombre[i] || 0;
    const esExtra = extraCount > 0;
    const badge = qty >= 2 ? ' ×' + qty : '';
    const etiquetaExtra = esExtra ? (extraCount === qty ? ' · extra' : ' · ' + extraCount + ' extra') : '';
    const cls = 'chip' + (sel ? ' selected' : '') + (esExtra ? ' extra' : '');
    return "<button class=\"".concat(cls, "\"\n      onclick=\"_custIngTap('").concat(i.replace(/'/g, "&#39;"), "')\">").concat(i).concat(badge).concat(etiquetaExtra, "</button>");
  }).join('');
  _actualizarDisponibilidadQuesoToggleCust();
  _actualizarAvisoExtraCust();
}
// Aviso dorado (no rojo — no es un error, es un extra que se paga a
// mayores) cuando algún ingrediente y/o salsa ha pasado del cupo incluido
// en el precio de Al Gusto/Bomba.
function _actualizarAvisoExtraCust() {
  const el = document.getElementById('cust-ing-extra-aviso');
  if (!el) return;
  const menuId = custType === 'algusto' ? 15 : 16;
  const extraIng = precioExtraIngredientesCust(custSelIngredients, menuId, custSelSauces.length);
  const extraSal = precioExtraSalsasCust(custSelSauces, menuId);
  const totalExtra = extraIng + extraSal;
  if (totalExtra <= 0) {
    el.style.display = 'none';
    return;
  }
  const que = extraIng > 0 && extraSal > 0 ? 'ingredientes y salsas' : (extraSal > 0 ? 'salsas' : 'ingredientes');
  el.style.display = 'block';
  el.innerHTML = '🧾 Ya usaste los ' + que + ' incluidos en el precio — lo que marques ahora (en <span style="font-weight:800">dorado</span>) se cobra aparte, como un extra normal: +' + totalExtra.toFixed(2).replace('.', ',') + ' €';
}
function _custIngTap(name) {
  const qty = custSelIngredients.filter(n => n === name).length;
  const esQuesoIng = name === 'Queso Mozzarella' || name === '4 Quesos';
  let seQuito = false;
  if (qty >= MAX_UNIDADES_ING_EXTRA) {
    // Al tope — un toque más lo quita del todo.
    custSelIngredients = custSelIngredients.filter(n => n !== name);
    seQuito = true;
  } else {
    custSelIngredients.push(name);
  }
  // Si se quita "Queso Mozzarella"/"4 Quesos" del todo y el gratinado
  // dependía solo de ese ingrediente (sin el queso extra de pago), se
  // desactiva el gratinado — NO se activa el queso extra de pago en su
  // lugar, aunque "arreglaría" el gratinado: eso cobraba +1,20€ que el
  // cliente nunca pidió, solo por tocar un chip de ingredientes (hallazgo
  // en producción — "me lo cobra como extra" sin haber marcado esa
  // casilla a propósito).
  if (esQuesoIng && seQuito && custExtraGratinado && !custExtraQueso && !custTieneQuesoIngrediente()) {
    custExtraGratinado = false;
    updateCustExtraUI('gratinado', false);
  }
  renderCustChips();
  updateCustProgress();
  updateCustTotalPrice();
}
function toggleCustSauce(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelSauces.indexOf(name);
  if (idx >= 0) {
    custSelSauces.splice(idx, 1);
  } else if (name === CUST_SIN_SALSA) {
    // "Sin salsa" no se combina con ninguna otra — elegirla sustituye
    // cualquier salsa que ya estuviera puesta.
    custSelSauces = [CUST_SIN_SALSA];
  } else {
    // Elegir una salsa real quita "Sin salsa" si estaba puesta — no tiene
    // sentido llevar las dos a la vez.
    const sinIdx = custSelSauces.indexOf(CUST_SIN_SALSA);
    if (sinIdx >= 0) custSelSauces.splice(sinIdx, 1);
    custSelSauces.push(name);
  }
  renderCustChips();
  updateCustProgress();
  // En Bomba, el cupo de ingredientes gratis depende de cuántas salsas hay
  // elegidas (cupo compartido) — cambiar las salsas puede mover la
  // frontera de qué ingredientes cuentan ya como extra.
  updateCustTotalPrice();
}
function updateCustProgress() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const ns = custSelSauces.length,
    ni = custSelIngredients.length,
    total = ns + ni;
  const sauceProg = document.getElementById('cust-sauce-progress');
  // Ingredientes por encima del cupo incluido ya NO se bloquean (se cobran
  // como extra, ver renderCustChips/_actualizarAvisoExtraCust) — las
  // barras y contadores se acotan a 100% del cupo, y aparte se indica
  // cuántos van ya "de extra".
  const menuIdProg = custType === 'algusto' ? 15 : 16;
  const libreIng = _libreIngredientesCust(menuIdProg, ns);
  const libreSal = _libreSalsasCust(menuIdProg);
  const niExtra = Math.max(0, ni - libreIng);
  const nsExtra = Math.max(0, ns - libreSal);
  const extraTxt = niExtra > 0 ? ' (+' + niExtra + ' extra)' : '';
  if (cfg.maxTotal !== null) {
    // Bomba: una barra de progreso total combinada, ocultar barra de salsas separada
    const totalCupo = Math.min(total, cfg.maxTotal);
    const pct = Math.min(100, Math.round(totalCupo / cfg.maxTotal * 100));
    const cls = pct >= 100 ? 'full' : '';
    if (sauceProg) sauceProg.style.display = 'none';
    document.getElementById('cust-sauce-badge').textContent = ns;
    document.getElementById('cust-ing-label').textContent = 'Total: ' + totalCupo + '/' + cfg.maxTotal + extraTxt + ' (salsas: ' + ns + ' · ing: ' + ni + ')';
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pct / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill ' + cls;
    document.getElementById('cust-ing-badge').textContent = totalCupo + '/' + cfg.maxTotal;
  } else {
    // Al Gusto: dos barras independientes
    if (sauceProg) sauceProg.style.display = 'flex';
    const niCupo = Math.min(ni, cfg.maxIngredients);
    const nsCupo = Math.min(ns, cfg.maxSauces);
    const extraSalTxt = nsExtra > 0 ? ' (+' + nsExtra + ' extra)' : '';
    const pctS = Math.min(100, Math.round(nsCupo / cfg.maxSauces * 100));
    const pctI = Math.min(100, Math.round(niCupo / cfg.maxIngredients * 100));
    document.getElementById('cust-sauce-label').textContent = 'Salsas: ' + nsCupo + '/' + cfg.maxSauces + extraSalTxt;
    document.getElementById('cust-sauce-bar').style.setProperty('--pct', pctS / 100);
    document.getElementById('cust-sauce-bar').className = 'progress-bar-fill' + (pctS >= 100 ? ' full' : '');
    document.getElementById('cust-sauce-badge').textContent = nsCupo + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-label').textContent = 'Ingredientes: ' + niCupo + '/' + cfg.maxIngredients + extraTxt;
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pctI / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill' + (pctI >= 100 ? ' full' : '');
    document.getElementById('cust-ing-badge').textContent = niCupo + '/' + cfg.maxIngredients;
  }
}
function removeCustItem(key) {
  const snapshot = custCart[key] ? Object.assign({}, custCart[key]) : null;
  delete custCart[key];
  renderMenu();
  renderCart();
  // Aviso con "Deshacer" — antes se borraba al instante sin poder
  // arrepentirse, y una Al Gusto/Bomba con varios ingredientes elegidos a
  // mano se perdía entera con un toque sin querer.
  if (snapshot && typeof showUndoToast === 'function') {
    showUndoToast('Eliminado', function () {
      if (!custCart[key]) {
        custCart[key] = snapshot;
        renderMenu();
        renderCart();
      }
    });
  }
}
// Abre el personalizador YA relleno con las salsas/ingredientes/extras de
// una línea que ya está en el carrito — para pedir una segunda patata
// parecida pero no idéntica sin tener que volver a elegir todo desde cero.
// No toca la línea original: si el cliente confirma sin cambiar nada, se
// suma 1 a esa misma línea (mismo comportamiento que pedir dos iguales);
// si cambia algo, confirmCustomizer() la guarda como línea nueva porque su
// "huella" de salsas/ingredientes ya no coincide con la original.
function duplicarCustItem(key) {
  const item = custCart[key];
  if (!item) return;
  openCustomizer(item.menuId);
  _custEditandoKey = key;
  custSelSauces = [...item.sauces];
  custSelIngredients = [...item.ingredients];
  custExtraQueso = !!item.extraQueso;
  custExtraGratinado = !!item.extraGratinado;
  updateCustExtraUI('queso', custExtraQueso);
  updateCustExtraUI('gratinado', custExtraGratinado);
  renderCustChips();
  updateCustProgress();
  updateCustTotalPrice();
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

  // Antes solo se validaban máximos — se podía confirmar una Patata Al
  // Gusto/Bomba completamente vacía (0 ingredientes y 0 salsas) al precio
  // completo, sin aviso al cliente ni ninguna indicación útil para cocina
  // de qué preparar.
  if (custSelTotal() === 0) {
    errEl.textContent = 'Elige al menos 1 salsa o ingrediente';
    errEl.style.display = 'block';
    return;
  }

  // Ni las salsas ni los ingredientes tienen ya tope duro — pasar del cupo
  // incluido en el precio se permite y se cobra como extra (ver
  // precioExtraIngredientesCust/precioExtraSalsasCust en
  // nucleo-compartido.js, calculado más abajo al guardar la línea).
  const itemId = custType === 'algusto' ? 15 : 16;
  // Huella independiente del orden en que se fueron marcando (agrupa por
  // nombre+cantidad) — así "pedir lo mismo otra vez" siempre junta con la
  // misma línea del carrito, aunque esta vez se haya marcado en otro orden.
  const ingKeysFingerprint = Object.entries(
    custSelIngredients.reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {})
  ).map(([k, v]) => k + 'x' + v).sort().join('|');
  const fingerprint = [...custSelSauces].sort().join(',') + '|' + ingKeysFingerprint + '|' + (custExtraQueso ? 'Q' : '') + (custExtraGratinado ? 'G' : '');
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
  // Si se abrió para EDITAR una línea ya existente (duplicarCustItem) y el
  // resultado es distinto de la línea original, se resta 1 de la original
  // en vez de dejarla tal cual — así "editar" sustituye la línea en vez de
  // sumar una nueva al lado sin tocar la vieja. Si no ha cambiado nada
  // (misma huella), cartKey === _custEditandoKey y no hay nada que restar:
  // es sencillamente "pedir una más igual".
  if (_custEditandoKey && _custEditandoKey !== cartKey && custCart[_custEditandoKey]) {
    custCart[_custEditandoKey].qty--;
    if (custCart[_custEditandoKey].qty <= 0) delete custCart[_custEditandoKey];
  }
  closeCustomizer();
  renderMenu();
  renderCart();
}
