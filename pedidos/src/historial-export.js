// ── HISTORIAL (últimos 30 días) ──
const HISTORIAL_KEY = 'dpf_historial';
function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveToHistorial(dayStats) {
  if (!dayStats || !dayStats.date || !dayStats.count) return;
  let hist = getHistorial();
  // Actualiza o inserta el día
  const idx = hist.findIndex(d => d.date === dayStats.date);
  if (idx >= 0) hist[idx] = dayStats; else hist.unshift(dayStats);
  // Máximo 30 días
  hist = hist.slice(0, 30);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
  // Subir también a Firebase para que no quede solo en este dispositivo.
  // fb_saveStats escribe en stats/{fecha} — el mismo path que lee fb_loadHistorial.
  // Solo necesario en el fallback (sin transacción atómica) pero es idempotente.
  if (window.fb_saveStats) {
    window.fb_saveStats(dayStats).catch(e =>
      console.warn('[historial] No se pudo subir a Firebase:', e)
    );
  }
}

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — URL TOKEN
// ══════════════════════════════════════════════
const URL_TOKEN_KEY = 'dpf_url_token';
const BIMBA_TOKEN_KEY = 'dpf_bimba_token';
function getUrlToken() {
  return localStorage.getItem(URL_TOKEN_KEY) || '';
}
function getBimbaToken() {
  return localStorage.getItem(BIMBA_TOKEN_KEY) || '';
}
(function checkUrlToken() {
  const params = new URLSearchParams(window.location.search);

  // Token admin normal
  const key = params.get('key');
  if (key) {
    const saved = getUrlToken();
    if (saved && key === saved) {
      setTimeout(() => {
        setTimeout(_updateAudioBannerState, 200);
    logActivity('🔗 Acceso por URL token');
        openAdmin();
      }, 300);
    }
  }

  // Token bimba — abre directamente el panel sin contraseña.
  // AVISO: este acceso NO inicia sesión real en Firebase (sigue anónimo),
  // así que con las reglas de seguridad actuales no podrá leer/escribir
  // tickets, gastos, fichajes, etc. Solo sirve para ver la interfaz.
  const bimbaKey = params.get('bimba');
  if (bimbaKey) {
    const saved = getBimbaToken();
    if (saved && bimbaKey === saved) {
      setTimeout(() => {
        logActivity('🔗 Acceso bimba por URL token');
        _adminLoggedIn = true; window._adminLoggedIn = true;
        openStockConfigSecret();
        document.getElementById('admin-overlay').classList.add('open');
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
      }, 300);
    }
  }
})();

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — SECUENCIA DE TECLADO (DESACTIVADO)
//  Se desactivó a propósito: el panel ahora exige siempre
//  email + contraseña real para entrar (login contra Firebase).
//  Si en el futuro se quiere reactivar un atajo, no debe omitir
//  el login real — debe disparar fb_adminLogin(email, pwd).
// ══════════════════════════════════════════════
/*
(function setupKeySequence() {
  // Hash SHA-256 (con sal) de la palabra secreta — no queda en texto plano en el código
  const _SALT = 'dpf_2026_x7q';
  const SECRET_HASH = '87969d534baccdc20b664e7b6522f4aa6bec237677b8a046cd1658045ee10345';
  const SECRET_LEN = 4; // longitud de la palabra secreta original
  let buffer = '';
  let bufTimer = null;
  async function _sha256(str) {
    const enc = new TextEncoder().encode(str + _SALT);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  document.addEventListener('keypress', function (e) {
    const _ao = document.getElementById('admin-overlay');
    if (_ao && _ao.classList.contains('open')) return;
    // No activar si el usuario está escribiendo en un campo de texto
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    buffer += e.key.toLowerCase();
    if (buffer.length > SECRET_LEN) buffer = buffer.slice(-SECRET_LEN);
    clearTimeout(bufTimer);
    bufTimer = setTimeout(() => {
      buffer = '';
    }, 1200);
    if (buffer.length === SECRET_LEN) {
      _sha256(buffer).then(h => {
        if (h === SECRET_HASH) {
          buffer = '';
          logActivity('⌨️ Acceso por secuencia de teclado');
          openAdmin();
        }
      });
    }
  });
})();
*/
window._secretKeyBuf = '';
document.addEventListener('keydown', function (e) {
  var _document$getElementB8;
  if (((_document$getElementB8 = document.getElementById('stock-overlay')) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.style.display) === 'block') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key.length === 1) {
    var _document$getElementB9;
    window._secretKeyBuf += e.key.toLowerCase();
    if (window._secretKeyBuf.length > 30) window._secretKeyBuf = window._secretKeyBuf.slice(-30);
    // Nota: el atajo de teclado que abría el panel bimba escribiendo el PIN
    // en cualquier parte de la página se ha quitado — comprobaba el hash en
    // el cliente (inseguro) y no se puede pasar a bimba-verify.php sin
    // disparar una petición por cada tecla. Usa el candado (secureLockTap).
    if ((_document$getElementB9 = document.getElementById('admin-overlay')) !== null && _document$getElementB9 !== void 0 && _document$getElementB9.classList.contains('open')) {
      const inp = document.getElementById('log-secret-input');
      if (inp) {
        inp.value = window._secretKeyBuf.slice(-10);
        checkLogSecret(inp.value);
      }
    }
  } else if (e.key === 'Backspace') {
    window._secretKeyBuf = window._secretKeyBuf.slice(0, -1);
  } else {
    window._secretKeyBuf = '';
  }
});

// ══════════════════════════════════════════════
//  LOG DE ACTIVIDAD
// ══════════════════════════════════════════════
const ACTIVITY_LOG_KEY = 'dpf_activity_log';
function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}
function logActivity(action) {
  const log = getActivityLog();
  const now = new Date();
  const entry = {
    ts: now.toISOString(),
    time: now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    action
  };
  log.unshift(entry);
  const trimmed = log.slice(0, 200);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmed));
  // Solo guardar en Firebase si hay sesión activa (evita permission_denied en intentos de login)
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(trimmed).catch(() => {});
  }
}
function renderActivityLog() {
  const log = getActivityLog();
  const el = document.getElementById('activity-log-list');
  if (!el) return;
  if (!log.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin actividad registrada</div>';
    return;
  }
  // e.action pasa por logActivity() desde toda la app y a menudo lleva
  // texto libre interpolado (nombres de ingredientes, proveedores,
  // empleados, categorías...) — hay que escapar aquí, en el único sitio
  // donde se renderiza, en vez de perseguir cada origen por separado.
  el.innerHTML = log.map(e => "\n    <div style=\"display:flex;align-items:flex-start;padding:8px 10px;background:#FFFFFF;border:1px solid #F5E6C8;border-radius:8px\">\n      <span style=\"font-size:11px;color:#8A6A4E;white-space:nowrap;min-width:130px\">".concat(escapeHtml(e.time), "</span>\n      <span style=\"font-size:13px;color:#2A1506;flex:1\">").concat(escapeHtml(e.action), "</span>\n    </div>")).join('');
}
function clearActivityLog() {
  if (!confirm('¿Borrar todo el log de actividad?')) return;
  localStorage.removeItem(ACTIVITY_LOG_KEY);
  if (window.fb_saveActivityLog) window.fb_saveActivityLog([]).catch(() => {});
  renderActivityLog();
}

// ══════════════════════════════════════════════
//  AUTO-BORRADO DEL HISTORIAL
// ══════════════════════════════════════════════
const AUTODELETE_KEY = 'dpf_autodelete_days';
function getAutoDeleteDays() {
  return parseInt(localStorage.getItem(AUTODELETE_KEY) || '0', 10);
}
function saveAutoDelete() {
  const sel = document.getElementById('autodelete-days');
  if (!sel) return;
  const days = parseInt(sel.value, 10);
  localStorage.setItem(AUTODELETE_KEY, days);
  if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(days).catch(() => {});
  applyAutoDelete();
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "\u2705 Se borrar\xE1n entradas con m\xE1s de ".concat(days, " d\xEDas");
  logActivity("\u2699\uFE0F Auto-borrado historial configurado: ".concat(days === 0 ? 'desactivado' : days + ' días'));
}
function applyAutoDelete() {
  const days = getAutoDeleteDays();
  if (!days) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  let hist = getHistorial();
  const before = hist.length;
  // Cap de seguridad: nunca más de 365 entradas independientemente del filtro de fecha
  hist = hist.filter(d => d.date >= cutoffStr).slice(0, 365);
  if (hist.length !== before) {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
    // Borrar también los días eliminados de Firebase (stats/{fecha})
    if (typeof firebase !== 'undefined' && firebase.database) {
      const deletedDates = getHistorial()
        .filter(d => d.date < cutoffStr)
        .map(d => d.date);
      deletedDates.forEach(date => {
        firebase.database().ref('stats/' + date).remove().catch(() => {});
      });
    }
  }
}
function loadAutoDeleteUI() {
  const days = getAutoDeleteDays();
  const sel = document.getElementById('autodelete-days');
  if (sel) sel.value = days;
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "Se borran entradas con m\xE1s de ".concat(days, " d\xEDas");
}

// ══════════════════════════════════════════════
//  EXPORTAR HISTORIAL CIFRADO (AES-256 via Web Crypto)
// ══════════════════════════════════════════════
function exportHistorialEncrypted() {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial para exportar');
    return;
  }
  document.getElementById('encrypt-pwd').value = '';
  document.getElementById('encrypt-pwd2').value = '';
  document.getElementById('encrypt-error').style.display = 'none';
  document.getElementById('encrypt-modal').style.display = 'block';
}
async function doEncryptExport() {
  const pwd = document.getElementById('encrypt-pwd').value;
  const pwd2 = document.getElementById('encrypt-pwd2').value;
  const errEl = document.getElementById('encrypt-error');
  if (!pwd || pwd.length < 4) {
    errEl.textContent = 'La contraseña debe tener al menos 4 caracteres';
    errEl.style.display = 'block';
    return;
  }
  if (pwd !== pwd2) {
    errEl.textContent = 'Las contraseñas no coinciden';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  try {
    const hist = getHistorial();
    const json = JSON.stringify(hist);
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMat = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    }, keyMat, {
      name: 'AES-GCM',
      length: 256
    }, false, ['encrypt']);
    const cipher = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, key, enc.encode(json));
    // Empaquetar: "DPF1" + salt(16) + iv(12) + ciphertext
    const header = enc.encode('DPF1');
    const out = new Uint8Array(4 + 16 + 12 + cipher.byteLength);
    out.set(header, 0);
    out.set(salt, 4);
    out.set(iv, 20);
    out.set(new Uint8Array(cipher), 32);
    const b64 = btoa(String.fromCharCode(...out));
    const blob = new Blob([b64], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "historial_cifrado_".concat(fecha, ".dpf");
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('encrypt-modal').style.display = 'none';
    logActivity('🔐 Historial exportado cifrado');
  } catch (e) {
    errEl.textContent = 'Error al cifrar: ' + e.message;
    errEl.style.display = 'block';
  }
}

// ── EXPORTAR CSV ──
function exportTodayCSV() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (!stats.orders || !stats.orders.length) {
    alert('No hay pedidos hoy');
    return;
  }
  downloadCSV(stats, "pedidos_".concat(todayKey, ".csv"));
}
function exportHistorialCSV() {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial');
    return;
  }
  let rows = ['Fecha,Num Pedido,Cliente,Hora,Turno,Total (€)'];
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      rows.push("".concat(day.date, ",").concat(o.num, ",\"").concat(o.name, "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
    });
  });
  const blob = new Blob([rows.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historial_pedidos.csv';
  a.click();
  URL.revokeObjectURL(url);
}
function downloadCSV(stats, filename) {
  let rows = ['Num Pedido,Cliente,Hora,Turno,Total (€)'];
  stats.orders.forEach(o => {
    rows.push("".concat(o.num, ",\"").concat(o.name, "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
  });
  const blob = new Blob([rows.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── MODO IMPRESIÓN TÉRMICA 80mm ──
let currentTicketData = null;

// Genera HTML del ticket optimizado para 80mm
function buildTicketHTML(data) {
  const orderNum = data.orderNum,
    name = data.name,
    phone = data.phone,
    notes = data.notes,
    slotTime = data.slotTime,
    items = data.items,
    total = data.total,
    time = data.time;
  const tc = getTicketConfig();
  const sep = '─'.repeat(32);
  const sep2 = '═'.repeat(32);
  let itemsHTML = items.map(_ref21 => {
    let n = _ref21.name,
      qty = _ref21.qty,
      subtotal = _ref21.subtotal,
      extras = _ref21.extras;
    const right = subtotal.toFixed(2) + ' \u20AC';
    const label = qty + 'x ' + n;
    if (extras && extras.length > 0) {
      const extrasList = extras.map(function(e) {
        const extraName = (e && e.name) ? e.name : e;
        const extraPrice = (e && e.price) ? '+' + parseFloat(e.price).toFixed(2).replace('.', ',') + ' \u20AC' : '';
        return '<div style="display:flex;justify-content:space-between"><span>&nbsp;&nbsp;&nbsp;\xB7 ' + extraName + '</span>' + (extraPrice ? '<span style="color:#aaa">' + extraPrice + '</span>' : '') + '</div>';
      }).join('');
      return '<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div><div style="font-size:10px;color:#333;line-height:1.8;margin-top:1px">' + extrasList + '</div></div>';
    } else if (label.length <= 26) {
      return '<div style="display:flex;justify-content:space-between"><span style="flex:1">' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div>';
    } else {
      return '<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">' + label + '</div><div style="text-align:right;font-weight:bold">' + right + '</div></div>';
    }
  }).join('');

  // El nombre/tel\u00E9fono/notas los escribe el propio cliente en el checkout
  // (solo se les limita la longitud, no los caracteres) y este HTML se
  // inyecta luego con innerHTML en el panel de admin al ver/imprimir el
  // ticket \u2014 sin escapar, un nombre o nota con <script> o <img onerror=...>
  // se ejecutar\u00EDa en el navegador de quien lo abra con su sesi\u00F3n de admin.
  const nameSafe = escapeHtml(name || '');
  const notesSafe = escapeHtml(notes || '');
  const phoneSafe = escapeHtml(phone || '');

  const headerRow = slotTime
    ? '<div style="display:flex;align-items:stretch;margin:4px 0"><div style="flex:1;padding-right:10px;text-align:center"><div style="font-size:9px;color:#555;letter-spacing:1px;text-transform:uppercase">Hora recogida</div><div style="font-size:22px;font-weight:bold">' + slotTime + 'h</div></div><div style="width:1px;background:#000;margin:2px 0"></div><div style="flex:1;padding-left:10px;display:flex;align-items:center;justify-content:center"><div style="font-size:18px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:1px">' + nameSafe.toUpperCase().replace(' ', '<br>') + '</div></div></div>'
    : '<div style="font-size:22px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:4px 0">' + nameSafe.toUpperCase() + '</div>';

  return "\n    <div style=\"text-align:center;margin-bottom:6px\">\n      <div style=\"font-size:15px;font-weight:bold;letter-spacing:1px\">" + tc.nombre + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.direccion + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.telefono + "</div>\n    </div>\n    <div style=\"border-top:2px solid #000;margin:6px 0\"></div>\n    " + headerRow + "\n    " + (phoneSafe ? '<div style="font-size:11px;color:#555;text-align:center;margin-bottom:2px">Tlfno. ' + phoneSafe + '</div>' : '') + "\n    <div style=\"border-top:1.5px solid #000;margin:6px 0 4px\"></div>\n    <div style=\"font-size:18px;font-weight:bold;text-align:center;letter-spacing:3px\">PEDIDO ".concat(orderNum, "</div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-bottom:4px\">").concat(time, "</div>\n    <div style=\"border-top:1.5px solid #000;margin:4px 0 6px\"></div>\n    <div style=\"font-size:11px\">").concat(itemsHTML, "</div>\n    <div style=\"border-top:1px dashed #000;margin:6px 0\"></div>\n    <div style=\"display:flex;justify-content:space-between;font-size:13px;font-weight:bold\">\n      <span>TOTAL</span><span>").concat(total.toFixed(2), " \u20AC</span>\n    </div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-top:2px\">").concat(tc.textoPago, "</div>\n    ").concat(notesSafe ? "<div style=\"border-top:1px dashed #000;margin:6px 0\"></div><div style=\"font-size:10px\"><b>NOTAS:</b> ".concat(notesSafe, "</div>") : '', "\n    <div style=\"border-top:1px dashed #000;margin:8px 0\"></div>\n    <div style=\"text-align:center;font-size:10px;color:#555\">").concat(tc.despedida, "</div>\n    <div style=\"margin-bottom:16px\"></div>\n  ");
}
function openPrintModal(ticketData) {
  currentTicketData = ticketData;
  const html = buildTicketHTML(ticketData);
  document.getElementById('ticket-html-preview').innerHTML = html;
  document.getElementById('print-modal').style.display = 'block';
}
function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}
function doPrint() {
  if (!currentTicketData) return;

  // Mandar a impresora térmica via Firebase
  if (window.fb_saveTicket) {
    const reimprKey = 'R' + Date.now();
    const ticketParaImpresora = Object.assign({}, currentTicketData, { _reimprimir: true });
    window.fb_saveTicket(reimprKey, ticketParaImpresora)
      .then(() => { closePrintModal(); })
      .catch(() => { closePrintModal(); });
  } else {
    closePrintModal();
  }
}
function printLastTicket() {
  if (_lastTicketData) openPrintModal(_lastTicketData);
}
let _lastTicketData = null;
async function printOrderFromStats(num, name, time, total, slot) {
  // Try to get items from Firebase stats, fall back to localStorage
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch (e) {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  const order = stats && stats.orders ? stats.orders.find(o => o.num === num) : null;
  const items = order && order.items ? order.items : [];
  const phone = order && order.phone ? order.phone : '';
  const notes = order && order.notes ? order.notes : '';
  openPrintModal({
    orderNum: num,
    name,
    phone,
    notes,
    slotTime: slot || null,
    items,
    total: parseFloat(total),
    time
  });
}
async function exportTicketPDFFromStats(num, name, time, total, slot) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  const order = stats && stats.orders ? stats.orders.find(o => o.num === num) : null;
  const items = order && order.items ? order.items : [];
  const phone = order && order.phone ? order.phone : '';
  const notes = order && order.notes ? order.notes : '';
  exportTicketPDF(num, name, time, total, slot, items, phone, notes);
}
function scheduleSlotMidnightReset() {
  const now = new Date();
  const msSinceMidnight = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const msToMidnight = 86400000 - msSinceMidnight;
  setTimeout(() => {
    // Comprobar si los datos de slots son de un día anterior; si no, limpiar
    const data = getSlotsData();
    const todayKey = new Date().toISOString().slice(0, 10);
    if (data.date !== todayKey) {
      localStorage.removeItem(SLOTS_KEY);
    }
    // Limpiar estados de cocina del día anterior
    window._orderStatusCache = {};
    localStorage.removeItem(ORDER_STATUS_KEY);
    if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
    // Resetear flags de apertura para que el nuevo día empiece sin bloqueos del fin de noche
    localStorage.removeItem(OPEN_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem('dpf_open_manual_override');
    const _esAdminAutenticadoReset = !!(window.fb_getAdminUser && window.fb_getAdminUser());
    if (_esAdminAutenticadoReset) {
      firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
      if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
      if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    }
    // También archivar el día anterior en historial
    try {
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (stats.date && stats.date !== todayKey && stats.count > 0) {
        saveToHistorial(stats);
      }
    } catch {}
    // Salida automática: registrar salida a los empleados que olvidaron fichar
    try {
      const ayerKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // ayer (resta 1 día completo)
      const fich = fichajesLoad();
      const emps = empLoadAll();
      let modified = false;
      emps.forEach(emp => {
        const suyosAyer = fich.filter(f => f.empId === emp.id && f.fecha === ayerKey).sort((a, b) => a.hora.localeCompare(b.hora));
        // Si el último fichaje del día es una entrada, registrar salida automática a las 00:00
        if (suyosAyer.length > 0 && suyosAyer[suyosAyer.length - 1].tipo === 'entrada') {
          fich.push({
            empId: emp.id,
            fecha: ayerKey,
            hora: '00:00',
            tipo: 'salida',
            auto: true
          });
          modified = true;
        }
      });
      if (modified && _esAdminAutenticadoReset) fichajesSave(fich);
    } catch (e) {
      console.warn('Auto-checkout error', e);
    }
    scheduleSlotMidnightReset(); // reprogramar para la siguiente medianoche
  }, msToMidnight);
}

// ══════════════════════════════════════════
//  FIREBASE REALTIME LISTENERS
// ══════════════════════════════════════════
function initFirebaseListeners() {
  const todayKey = new Date().toISOString().slice(0, 10);
  console.log('[fee] initFirebaseListeners START, _firebaseReady=', window._firebaseReady);

  // Tarjeta de sellos: si ya conocemos el teléfono de este cliente (pedido
  // anterior), comprobamos sus sellos sin que tenga que escribir nada.
  try {
    const savedPhone = localStorage.getItem('dpf_customer_phone');
    if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
  } catch {}

  // Cargar config de gastos de gestión desde Firebase
  loadFeeFromFirebase();
  // Cargar configuración del ticket desde Firebase
  loadTicketConfigFromFirebase();

  // 1. Slots — sync counter across all devices in real time
  if (window.fb_listenSlots) {
    window.fb_listenSlots(slots => {
      // Re-render slot picker si está visible (cliente eligiendo)
      const picker = document.getElementById('slot-picker');
      if (picker && picker.offsetParent !== null) {
        renderSlotPicker();
        // Si el slot seleccionado se llenó, avisar al cliente
        if (selectedSlot) {
          const slotCount = slots[selectedSlot] || 0;
          const slotMax = getSlotMax();
          if (slotCount >= slotMax) {
            selectedSlot = null;
            document.querySelectorAll('.slot-btn').forEach(b => {
              b.classList.remove('slot-selected');
              b.style.background = '';
              b.style.borderColor = '';
              b.style.color = '';
            });
            const err = document.getElementById('slot-error');
            if (err) { err.textContent = '⚠️ El turno que habías elegido se ha llenado. Por favor elige otro horario.'; err.style.display = 'block'; err.style.color = '#c0392b'; }
          }
        }
      }
      // Comprobar si algún slot está casi lleno
      const slotMax = getSlotMax();
      Object.entries(slots || {}).forEach(([slot, count]) => {
        _checkSlotAlmostFull(slot, count, slotMax);
      });
      var _document$getElementB0;
      _slotsCache = slots || {};
      // Forzar que getSlotsData use _slotsCache en vez de stats locales
      // invalidando la fecha de stats para que no se use como fuente
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (stats && stats.date === todayKey) {
          // Sobrescribir los slots de stats con los de Firebase (fuente de verdad)
          stats._slotsOverride = slots || {};
          localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
      } catch (e) {}
      // Re-render slot picker if visible
      renderSlotPicker();
      // Re-render live orders slots if admin open
      if ((_document$getElementB0 = document.getElementById('admin-overlay')) !== null && _document$getElementB0 !== void 0 && _document$getElementB0.classList.contains('open')) {
        loadLiveOrders();
      }
    });
  }

  // 2. Stats / pedidos — sync orders across all devices
  if (window.fb_listenStats) {
    let _fbLastCount = null;
    window.fb_listenStats(todayKey, stats => {
      var _document$getElementB11, _document$getElementB12, _document$getElementB13, _document$getElementB14;
      if (!stats) return;
      const newCount = stats.count || 0;
      // Update localStorage cache
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      // First call — set baseline, don't alert, but refresh UI
      if (_fbLastCount === null) {
        var _document$getElementB1, _document$getElementB10;
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        if ((_document$getElementB1 = document.getElementById('admin-pedidos')) !== null && _document$getElementB1 !== void 0 && _document$getElementB1.classList.contains('active')) loadLiveOrders();
        if ((_document$getElementB10 = document.getElementById('admin-stats')) !== null && _document$getElementB10 !== void 0 && _document$getElementB10.classList.contains('active')) loadDayStats();
        return;
      }
      // New order arrived
      if (newCount > _fbLastCount) {
        const diff = newCount - _fbLastCount;
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        _unseenOrders += diff;
        updateTabTitle(_unseenOrders);
        console.log('[DPF] NEW ORDER via Firebase! diff=' + diff + ' adminLoggedIn=' + _adminLoggedIn);
        // Si el panel está abierto pero _adminLoggedIn no se puso, forzarlo
        if (!_adminLoggedIn) {
          var adminPanel = document.getElementById('admin-panel');
          if (adminPanel && adminPanel.style.display !== 'none') {
            _adminLoggedIn = true; window._adminLoggedIn = true;
          }
        }
        if (_adminLoggedIn) {
          _alertPendingOrders = diff;
          startAlertLoop();
          const toast = document.getElementById('new-order-toast');
          if (toast) {
            toast.style.display = 'block';
            setTimeout(() => {
              toast.style.display = 'none';
            }, 4000);
          }
        }
      } else {
        _fbLastCount = newCount;
      }
      // Refresh UI
      if ((_document$getElementB11 = document.getElementById('admin-pedidos')) !== null && _document$getElementB11 !== void 0 && _document$getElementB11.classList.contains('active')) loadLiveOrders();
      if ((_document$getElementB12 = document.getElementById('admin-stats')) !== null && _document$getElementB12 !== void 0 && _document$getElementB12.classList.contains('active')) loadDayStats();
      if ((_document$getElementB13 = document.getElementById('admin-pedidos')) !== null && _document$getElementB13 !== void 0 && _document$getElementB13.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB14 = document.getElementById('admin-stats')) !== null && _document$getElementB14 !== void 0 && _document$getElementB14.classList.contains('active')) {
        loadDayStats();
      }
    });
  }

  // 3. Order statuses — sync kitchen status across devices
  if (window.fb_listenOrderStatuses) {
    window.fb_listenOrderStatuses(statuses => {
      var _document$getElementB15, _document$getElementB16;
      window._orderStatusCache = statuses || {};
      localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
      if ((_document$getElementB15 = document.getElementById('admin-pedidos')) !== null && _document$getElementB15 !== void 0 && _document$getElementB15.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB16 = document.getElementById('kitchen-mode')) !== null && _document$getElementB16 !== void 0 && _document$getElementB16.classList.contains('open')) {
        refreshKitchenGrid();
      }
    });
  }

  // Load initial order statuses from Firebase
  if (window.fb_getOrderStatuses) {
    window.fb_getOrderStatuses().then(s => {
      window._orderStatusCache = s || {};
    }).catch(() => {
      try {
        window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
      } catch {}
    });
  } else {
    try {
      window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
    } catch {}
  }

  // Load initial slots: use localStorage immediately, then update from Firebase
  try {
    const lsData = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (lsData.date === todayKey && lsData.slots) {
      _slotsCache = lsData.slots;
      renderSlotPicker(); // render immediately with cached data
    }
  } catch {}
  // Then fetch from Firebase (authoritative)
  if (window.fb_getAllSlots) {
    window.fb_getAllSlots().then(s => {
      _slotsCache = s || {};
      renderSlotPicker();
    }).catch(() => {}); // Si falla, el cache local es suficiente
  }

  // Horario sync — sincronizar horario con todos los dispositivos y cuentas
  if (window.fb_listenHorario) {
    window.fb_listenHorario(hFb => {
      if (!hFb) return;
      localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
      loadOrdersStatus();
      updateFooterHorario(hFb);
    });
  }

  // Empleados sync — sincronizar lista de empleados en tiempo real
  if (window.fb_listenEmpleados) {
    window.fb_listenEmpleados(arr => {
      var _document$getElementB17;
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_empleados', JSON.stringify(arr));
      if ((_document$getElementB17 = document.getElementById('admin-empleados')) !== null && _document$getElementB17 !== void 0 && _document$getElementB17.classList.contains('active')) empRenderAdmin();
    });
  }

  // Fichajes sync — cargar fichajes desde Firebase al iniciar
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        var _document$getElementB18;
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if ((_document$getElementB18 = document.getElementById('admin-empleados')) !== null && _document$getElementB18 !== void 0 && _document$getElementB18.classList.contains('active')) empRenderAdmin();
      }
    }).catch(() => {});
  }

  // Fichajes listener — refrescar cajón de empleados bimba en tiempo real
  if (window.fb_listenFichajes) {
    window.fb_listenFichajes(function(arr) {
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
      if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      if (typeof bimbaRenderFichajeLista === 'function') bimbaRenderFichajeLista();
      if (typeof bimbaActualizarContadorAlertas === 'function') bimbaActualizarContadorAlertas();
    });
  }

  // Promos sync
  if (window.fb_loadPromos) {
    window.fb_loadPromos().then(function(arr) {
      if (arr) { localStorage.setItem('dpf_promos', JSON.stringify(arr)); renderPromos(); }
    }).catch(function() {});
  }
  if (window.fb_listenPromos) {
    window.fb_listenPromos(function(arr) {
      if (!arr) return;
      localStorage.setItem('dpf_promos', JSON.stringify(arr));
      renderPromos();
      if (typeof bimbaRenderPromos === 'function') bimbaRenderPromos();
    });
  }

  // Categorías bloqueadas sync — sincronizar en tiempo real
  if (window.fb_listenBlockedCats) {
    window.fb_listenBlockedCats(cats => {
      var _document$getElementB19;
      if (!cats) return;
      localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
      // Resetear hidden en todos los items antes de reaplicar categorías bloqueadas
      MENU.forEach(item => {
        item.hidden = false;
      });
      initCatBlocks();
      renderMenu();
      if ((_document$getElementB19 = document.getElementById('admin-pedidos')) !== null && _document$getElementB19 !== void 0 && _document$getElementB19.classList.contains('active')) loadCatBlockUI();
    });
  }

  // Slot config sync — sincronizar turnos y max pedidos en tiempo real
  if (window.fb_listenSlotConfig) {
    window.fb_listenSlotConfig(cfg => {
      var _document$getElementB20;
      if (!cfg) return;
      if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
      if (cfg.max) {
        localStorage.setItem(SLOT_MAX_KEY, cfg.max);
        SLOT_MAX = parseInt(cfg.max, 10);
      }
      renderSlotPicker();
      if ((_document$getElementB20 = document.getElementById('admin-local')) !== null && _document$getElementB20 !== void 0 && _document$getElementB20.classList.contains('active')) loadSlotTurnosUI();
      loadOrdersStatus();
      checkAutoCloseWarning();
    });
  }

  // Menu prices/names sync across devices
  if (window.fb_listenMenu) {
    window.fb_listenMenu(data => {
      // data can be {items, ts} or plain array (legacy)
      const savedMenu = Array.isArray(data) ? data : data && data.items ? data.items : null;
      const fbTs = data && data.ts ? data.ts : 0;
      const localTs = parseInt(localStorage.getItem(MENU_KEY + '_ts') || '0', 10);
      // Only apply Firebase version if it's newer than local
      if (!savedMenu || !savedMenu.length) return;
      if (fbTs > 0 && fbTs < localTs) return; // local is newer, skip
      // Primero resetear hidden para no acumular flags de runs anteriores
      MENU.forEach(item => {
        item.hidden = false;
      });
      savedMenu.forEach(saved => {
        const item = MENU.find(m => m.id == saved.id);
        if (item) {
          if (saved.price !== undefined) item.price = saved.price;
          if (saved.name) item.name = saved.name;
          if (saved.desc !== undefined) item.desc = saved.desc;
          item.hidden = saved.hidden || false;
          item.soldout = saved.soldout || false;
        } else {
          // Producto nuevo que no existía en este dispositivo todavía — lo insertamos
          // junto a los de su misma categoría, no suelto al final
          const nuevo = Object.assign({}, saved);
          let lastIdx = -1;
          for (let i = 0; i < MENU.length; i++) {
            if (MENU[i].cat === nuevo.cat) lastIdx = i;
          }
          if (lastIdx === -1) {
            MENU.push(nuevo);
          } else {
            MENU.splice(lastIdx + 1, 0, nuevo);
          }
        }
      });
      // Reaplicar categorías bloqueadas encima de los datos de Firebase
      initCatBlocks();
      // Protección: si Firebase ocultaría más del 80% de la carta, ignorar hidden flags
      const hiddenCount = MENU.filter(m => m.hidden).length;
      if (hiddenCount > MENU.length * 0.8) {
        console.warn('[DPF] Firebase menu: demasiados items ocultos, reseteando');
        MENU.forEach(m => {
          m.hidden = false;
        });
        localStorage.removeItem(CAT_BLOCK_KEY);
      }
      localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
      if (fbTs > 0) localStorage.setItem(MENU_KEY + '_ts', fbTs);
      renderMenu();
    });
  }
}

// Wait for Firebase to be ready, then init listeners
if (window._firebaseReady) {
  initFirebaseListeners();
} else {
  document.addEventListener('firebaseReady', initFirebaseListeners);
}

