// ── ANTI-SPAM / BLACKLIST — PANEL DE ADMIN ───────────────────────────────
// BLACKLIST_KEY, ANTISPAM_KEY, getBlacklist, saveBlacklistLocal y
// getAntiSpamCfg viven en nucleo-compartido.js (bundle de cliente): el
// propio checkout (carrito-checkout.js) los usa para bloquear pedidos de
// números en la lista negra o que superen el límite anti-spam. Aquí solo
// queda la UI de admin para gestionar esa lista y esa configuración.

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
    list.innerHTML = stats.orders.map(o => "\n      <div style=\"display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n        <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n        <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n        ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">🕐 ".concat(escapeHtml(o.slot), "</span>") : '', "\n        <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(o.total.toFixed(2).replace('.', ','), " €</span>\n        <button onclick=\"printOrderFromStats('").concat(escapeAttr(o.num), "','").concat(escapeAttr(o.name), "','").concat(escapeAttr(o.time), "',").concat(parseFloat(o.total), ",'").concat(escapeAttr(o.slot || ''), "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#3D1F0D\">🖨️</button>\n      </div>")).join('');
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
async function cancelarPedidoAdmin(orderNum, phone) {
  if (!confirm("\xBFCancelar el pedido ".concat(orderNum, "? Se eliminar\xE1 de estad\xEDsticas y cocina."))) return;
  const ok = await _borrarPedidoDeFirebase(orderNum, phone);
  if (!ok) {
    alert('No se pudo cancelar el pedido ' + orderNum + ' en el servidor (revisa la conexión) — sigue activo, inténtalo de nuevo.');
    return;
  }
  // Igual que marcar "Entregado"/"Listo" (ver setLiveStatus en
  // pedidos-vivo-cocina.js), cancelar debe contar como "ya visto" para la
  // alarma de "pedido nuevo" — si no, cancelar un pedido que aún no se
  // había atendido dejaba la alarma sonando para siempre, sin nada
  // pendiente real que la pare.
  if (typeof _marcarPedidoAtendido === 'function') _marcarPedidoAtendido(orderNum);
  logActivity("❌ Pedido ".concat(orderNum, " cancelado manualmente desde el panel"));
}
