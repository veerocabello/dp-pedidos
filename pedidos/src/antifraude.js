// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
const BLACKLIST_KEY = 'dpf_blacklist';
const ANTISPAM_KEY = 'dpf_antispam_cfg';
const PHONE_LOG_KEY = 'dpf_phone_log'; // registro de pedidos por teléfono (Firebase)

function getBlacklist() {
  try {
    return JSON.parse(localStorage.getItem(BLACKLIST_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveBlacklistLocal(list) {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}
function getAntiSpamCfg() {
  try {
    var _c$cooldown, _c$dailyLimit;
    const c = JSON.parse(localStorage.getItem(ANTISPAM_KEY) || '{}');
    return {
      cooldown: (_c$cooldown = c.cooldown) !== null && _c$cooldown !== void 0 ? _c$cooldown : 0,
      dailyLimit: (_c$dailyLimit = c.dailyLimit) !== null && _c$dailyLimit !== void 0 ? _c$dailyLimit : 3
    };
  } catch {
    return {
      cooldown: 45,
      dailyLimit: 3
    };
  }
}

// Cargar blacklist y config desde Firebase al iniciar el panel admin
async function loadAntiSpamFromFirebase() {
  if (!window.fb_loadBlacklist) return;
  try {
    const bl = await window.fb_loadBlacklist();
    if (bl) saveBlacklistLocal(bl);
    const cfg = await window.fb_loadAntiSpamCfg();
    if (cfg) localStorage.setItem(ANTISPAM_KEY, JSON.stringify(cfg));
  } catch {}
  renderBlacklist();
  const cfg = getAntiSpamCfg();
  const cdEl = document.getElementById('cfg-cooldown');
  const dlEl = document.getElementById('cfg-daily-limit');
  if (cdEl) cdEl.value = cfg.cooldown;
  if (dlEl) dlEl.value = cfg.dailyLimit;
}

// Guardar límites anti-spam
async function saveAntiSpamConfig() {
  var _document$getElementB3, _document$getElementB4;
  const cooldown = parseInt(((_document$getElementB3 = document.getElementById('cfg-cooldown')) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value) || '45');
  const dailyLimit = parseInt(((_document$getElementB4 = document.getElementById('cfg-daily-limit')) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.value) || '3');
  const cfg = {
    cooldown,
    dailyLimit
  };
  localStorage.setItem(ANTISPAM_KEY, JSON.stringify(cfg));
  if (window.fb_saveAntiSpamCfg) await window.fb_saveAntiSpamCfg(cfg).catch(() => {});
  showToast('antispam-toast');
}

// Añadir teléfono a la blacklist
async function addToBlacklist() {
  const input = document.getElementById('blacklist-input');
  if (!input) return;
  const phone = input.value.replace(/[\s\-().+]/g, '').trim();
  if (!/^\d{9}$/.test(phone)) {
    alert('Introduce un teléfono válido de 9 dígitos');
    return;
  }
  const list = getBlacklist();
  if (list.includes(phone)) {
    alert('Este número ya está bloqueado');
    return;
  }
  list.push(phone);
  saveBlacklistLocal(list);
  if (window.fb_saveBlacklist) await window.fb_saveBlacklist(list).catch(() => {});
  input.value = '';
  renderBlacklist();
  showToast('blacklist-toast');
}

// Quitar teléfono de la blacklist
async function removeFromBlacklist(phone) {
  const list = getBlacklist().filter(p => p !== phone);
  saveBlacklistLocal(list);
  if (window.fb_saveBlacklist) await window.fb_saveBlacklist(list).catch(() => {});
  renderBlacklist();
  showToast('blacklist-toast');
}

// Renderizar lista de bloqueados en el panel
function renderBlacklist() {
  const el = document.getElementById('blacklist-list');
  if (!el) return;
  const list = getBlacklist();
  if (!list.length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E;padding:8px 0">Ningún número bloqueado</div>';
    return;
  }
  el.innerHTML = list.map(phone => "<div style=\"display:flex;align-items:center;justify-content:space-between;background:#FFF8EE;border:1.5px solid #e74c3c;border-radius:8px;padding:8px 12px\">\n      <span style=\"font-size:14px;font-weight:700;color:#3D1F0D;letter-spacing:.05em\">".concat(phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), "</span>\n      <button onclick=\"removeFromBlacklist('").concat(phone, "')\" style=\"background:#c0392b;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Desbloquear</button>\n    </div>")).join('');
}

// Verificar si un teléfono puede pedir (cooldown + daily limit) — consulta Firebase
function recordOrderStats_BASE(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) {
    // Archivar día anterior en historial antes de resetear
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  stats.orders.unshift({
    num: orderNum,
    name,
    total,
    time: new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    slot: slotTime || null
  });
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
function loadDayStats() {
  const todayKey = new Date().toISOString().slice(0, 10);
  // Intentar cargar desde Firebase primero (fuente de verdad entre dispositivos)
  if (window.fb_getStats) {
    window.fb_getStats(todayKey).then(fbStats => {
      if (fbStats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(fbStats));
        _renderDayStats(fbStats, todayKey);
      } else {
        _renderDayStats(null, todayKey);
      }
    }).catch(() => _renderDayStats(null, todayKey));
    // Mostrar lo que haya en localStorage mientras espera Firebase
    let statsLocal;
    try {
      statsLocal = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      statsLocal = {};
    }
    if (statsLocal.date === todayKey && statsLocal.count > 0) _renderDayStats(statsLocal, todayKey);
    return;
  }
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  _renderDayStats(stats, todayKey);
}
function _renderDayStats(stats, todayKey) {
  if (!stats || stats.date !== todayKey) stats = {
    date: todayKey,
    count: 0,
    total: 0,
    orders: []
  };
  document.getElementById('stat-count').textContent = stats.count;
  document.getElementById('stat-total').textContent = stats.total.toFixed(2).replace('.', ',') + ' €';
  const list = document.getElementById('stat-orders-list');
  if (!stats.orders || stats.orders.length === 0) {
    list.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:16px 0">Sin pedidos por ahora</div>';
  } else {
    list.innerHTML = stats.orders.map(o => "\n      <div style=\"display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n        <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n        <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n        ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">\uD83D\uDD50 ".concat(escapeHtml(o.slot), "</span>") : '', "\n        <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(o.total.toFixed(2).replace('.', ','), " \u20AC</span>\n        <button onclick=\"printOrderFromStats('").concat(escapeAttr(o.num), "','").concat(escapeAttr(o.name), "','").concat(escapeAttr(o.time), "',").concat(parseFloat(o.total), ",'").concat(escapeAttr(o.slot || ''), "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#3D1F0D\">\uD83D\uDDA8\uFE0F</button>\n      </div>")).join('');
  }

  // Render admin slot grid
  const adminGrid = document.getElementById('admin-slots-grid');
  if (adminGrid) {
    const slotsData = getSlotsData();
    const slots = getSlots();
    adminGrid.innerHTML = slots.map(slot => {
      const count = slotsData.slots[slot] || 0;
      const full = count >= getSlotMax();
      const color = full ? '#c0392b' : count > 0 ? '#3D1F0D' : '#5ECC76';
      return "\n      <div style=\"border:1.5px solid ".concat(color, "22;border-radius:8px;padding:8px 10px;text-align:center\">\n        <div style=\"font-size:14px;font-weight:700;color:#3D1F0D\">").concat(slot, "</div>\n        <div style=\"font-size:20px;font-weight:900;color:").concat(color, "\">").concat(count, "/").concat(getSlotMax(), "</div>\n        <div style=\"height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden\">\n          <div style=\"height:100%;width:").concat(Math.round(count / getSlotMax() * 100), "%;background:").concat(color, ";border-radius:99px\"></div>\n        </div>\n      </div>");
    }).join('');
  }
}
function resetSlots() {
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});
  loadDayStats();
}
async function confirmClearDay() {
  if (!confirm('¿Limpiar todos los pedidos del día?\nEsta acción no se puede deshacer.')) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  // Borrar pedidos y stats del día — local primero
  localStorage.removeItem(STATS_KEY);
  // Borrar en Firebase (fuente de verdad) para que loadLiveOrders no los restaure
  if (window.fb_saveStats) {
    await window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  // Limpiar slots
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});
  // Refrescar vista — await para que Firebase haya confirmado el borrado antes de leer
  await loadLiveOrders();
  logActivity('🗑️ Pedidos del día eliminados manualmente');
  showToast('live-clear-toast');
}
async function resetDayStats() {
  const todayKey = new Date().toISOString().slice(0, 10);
  localStorage.removeItem(STATS_KEY);
  // Borrar en Firebase para que no restaure los datos al recargar
  if (window.fb_saveStats) {
    await window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  loadDayStats();
}
async function showSuccess(orderNum, slotTime) {
  // Exponer datos del pedido para el botón de WhatsApp
  window.currentOrderNum = orderNum;
  window.currentOrderSlot = slotTime || null;
  window.currentOrderName = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
  window.currentOrderTotal = 0;
  window.currentOrderItems = [];
  try {
    window.currentOrderItems = Object.entries(cart).map(([id, qty]) => {
      const item = MENU.find(m => m.id == id);
      if (!item) return null;
      return { id: item.id, qty, name: item.name, price: item.price * qty };
    }).filter(Boolean);
    window.currentOrderTotal = window.currentOrderItems.reduce((s, i) => s + i.price, 0);
  } catch(e) {}
  recordProductSales(window.currentOrderItems);
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
const MODIFY_WINDOW_DEFAULT_MS = 5 * 60 * 1000;
function getModifyWindowMs() {
  try {
    const v = parseInt(localStorage.getItem('dpf_modify_window_mins') || '5');
    return (isNaN(v) || v < 1 || v > 60 ? 5 : v) * 60 * 1000;
  } catch (e) {
    return MODIFY_WINDOW_DEFAULT_MS;
  }
}
async function cancelarPedidoAdmin(orderNum) {
  if (!confirm("\xBFCancelar el pedido ".concat(orderNum, "? Se eliminar\xE1 de estad\xEDsticas y cocina."))) return;
  await _borrarPedidoDeFirebase(orderNum);
  logActivity("\u274C Pedido ".concat(orderNum, " cancelado manualmente desde el panel"));
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
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor(remaining % 60000 / 1000);
    timerEl.textContent = "\u23F1\uFE0F Puedes modificar o cancelar tu pedido durante ".concat(mins, ":").concat(String(secs).padStart(2, '0'), " min");
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
  await _borrarPedidoDeFirebase(data.num);

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
  await _borrarPedidoDeFirebase(data.num);
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
async function _borrarPedidoDeFirebase(orderNum) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // 1. Marcar como cancelado en memoria, localStorage y Firebase — inmediato
  await setOrderStatus(orderNum, 'cancelado');

  // 2. Borrar de Firebase stats y liberar slot si tenía uno
  let slotToFree = null;
  if (window.fb_getStats && window.fb_saveStats) {
    try {
      const stats = await window.fb_getStats(todayKey);
      if (stats && stats.orders) {
        const pedido = stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
        if (pedido && pedido.slot) slotToFree = pedido.slot;
        stats.orders = stats.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
        stats.count = Math.max(0, (stats.count || 1) - 1);
        stats.total = stats.orders.reduce((acc, o) => acc + (o.total || 0), 0);
        await window.fb_saveStats(stats);
      }
    } catch {}
  }

  // 3. Borrar también de localStorage y liberar slot si no lo encontramos en Firebase
  try {
    const local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    if (local.orders) {
      const pedido = local.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
      if (pedido && pedido.slot && !slotToFree) slotToFree = pedido.slot;
      local.orders = local.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
      local.count = Math.max(0, (local.count || 1) - 1);
      local.total = local.orders.reduce((acc, o) => acc + (o.total || 0), 0);
      localStorage.setItem(STATS_KEY, JSON.stringify(local));
    }
  } catch {}

  // 4. El slot NO se libera al cancelar — el turno quedó ocupado

  // 5. Refrescar cocina y pedidos en vivo inmediatamente
  refreshKitchenGrid();
  loadLiveOrders();
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
function toggleForceSlots() {
  const active = localStorage.getItem('dpf_force_slots') === '1';
  localStorage.setItem('dpf_force_slots', active ? '0' : '1');
  updateForceSlotsBtn();
  renderSlotPicker();
}
function updateForceSlotsBtn() {
  const btn = document.getElementById('force-slots-btn');
  if (!btn) return;
  const active = localStorage.getItem('dpf_force_slots') === '1';
  btn.textContent = active ? '✅ Activado' : '⚪ Desactivado';
  btn.style.background = active ? '#e8f8ed' : '#fafafa';
  btn.style.borderColor = active ? '#5ECC76' : '#ddd';
  btn.style.color = active ? '#27855a' : '#888';
}

