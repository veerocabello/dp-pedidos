// ══════════════════════════════════════════════
//  ACCESO AL PANEL — TOKENS GUARDADOS (para mostrarlos/copiarlos en Ajustes)
// ══════════════════════════════════════════════
const URL_TOKEN_KEY = 'dpf_url_token';
const BIMBA_TOKEN_KEY = 'dpf_bimba_token';
function getUrlToken() {
  return localStorage.getItem(URL_TOKEN_KEY) || '';
}
function getBimbaToken() {
  return localStorage.getItem(BIMBA_TOKEN_KEY) || '';
}

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
//  LOG DE ACTIVIDAD — VISTA DE ADMIN
// ══════════════════════════════════════════════
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

// ══════════════════════════════════════════════
//  ALERTAS (subconjunto del registro de actividad: fallos silenciosos
//  al guardar pedidos/sellos y precios que no cuadran con la carta)
// ══════════════════════════════════════════════
const ALERTAS_SEEN_KEY = 'dpf_alertas_last_seen_ts';
function isAlertEntry(action) {
  // 🎁 también cuenta como alerta: aviso de "cliente completó sus 10
  // sellos" (fidelizacion.php) — no es un fallo, pero igual necesita que
  // caja se entere y lo marque como visto/entregado.
  return typeof action === 'string' && (action.indexOf('⚠️') === 0 || action.indexOf('🚨') === 0 || action.indexOf('🎁') === 0);
}
function getAlertEntries() {
  return getActivityLog().filter(e => isAlertEntry(e.action) && !e.resolved);
}
function updateAlertBadge() {
  const badge = document.getElementById('alertas-tab-badge');
  if (!badge) return;
  const lastSeen = localStorage.getItem(ALERTAS_SEEN_KEY) || '';
  const unseen = getAlertEntries().filter(e => (e.ts || '') > lastSeen).length;
  const incidenciasNuevas = (typeof _incidenciasNuevasCount === 'function') ? _incidenciasNuevasCount() : 0;
  const total = unseen + incidenciasNuevas;
  if (total > 0) {
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// ══════════════════════════════════════════════
//  INCIDENCIAS DE CLIENTES (formulario Tally "¿Algún problema con tu
//  pedido?", enlazado en el pie de la web — webhook-incidencia.php las
//  guarda en Firebase en el nodo "incidencias")
// ══════════════════════════════════════════════
window._incidenciasCache = window._incidenciasCache || {};
function _incidenciasNuevasCount() {
  return Object.values(window._incidenciasCache).filter(i => (i.estado || 'nueva') === 'nueva').length;
}
function _formatearFechaIncidencia(fecha) {
  if (!fecha) return '';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return escapeHtml(String(fecha));
    return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return escapeHtml(String(fecha)); }
}
function toggleIncidenciasPanel() {
  const body = document.getElementById('incidencias-panel-body');
  const chevron = document.getElementById('incidencias-chevron');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (chevron) chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
function renderIncidencias() {
  const countEl = document.getElementById('incidencias-count-header');
  if (countEl) {
    const n = _incidenciasNuevasCount();
    countEl.textContent = n > 0 ? ' (' + n + ')' : '';
  }
  const el = document.getElementById('incidencias-list');
  if (!el) return;
  function _tarjetaIncidencia([key, inc]) {
    const nueva = (inc.estado || 'nueva') === 'nueva';
    const bg = nueva ? '#FBEAE7' : '#F7F3EC';
    const border = nueva ? '#F0CFC8' : '#EEE3D0';
    const fecha = _formatearFechaIncidencia(inc.fecha);
    const camposHtml = Object.entries(inc.respuestas || {}).map(([label, valor]) =>
      '<div style="margin-bottom:4px"><span style="font-size:11px;color:#8A6A4E;font-weight:700">' + escapeHtml(label) + ':</span> <span style="font-size:13px;color:#2A1506">' + escapeHtml(String(valor)) + '</span></div>'
    ).join('');
    return '<div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:' + bg + ';border:1px solid ' + border + '">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<span style="font-size:11px;font-weight:700;color:' + (nueva ? '#c0392b' : '#8A6A4E') + '">' + (nueva ? '🚩 NUEVA' : '✅ Resuelta') + '</span>'
      + '<span style="font-size:10.5px;color:#8A6A4E">' + fecha + '</span>'
      + '</div>'
      + (camposHtml || '<div style="font-size:12px;color:#8A6A4E">Sin detalle</div>')
      + (nueva ? '<div style="display:flex;justify-content:flex-end"><button onclick="marcarIncidenciaResuelta(\'' + escapeAttr(key) + '\')" style="padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Marcar resuelta</button></div>' : '')
      + '</div>';
  }
  const entries = Object.entries(window._incidenciasCache)
    .sort((a, b) => (b[1].fecha || '').localeCompare(a[1].fecha || ''));
  const nuevas = entries.filter(([, inc]) => (inc.estado || 'nueva') === 'nueva');
  const resueltas = entries.filter(([, inc]) => (inc.estado || 'nueva') !== 'nueva');
  if (!entries.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin incidencias</div>';
  } else {
    // Las resueltas van plegadas detrás de un botón, igual que "Ver
    // pedidos entregados" en Pedidos en vivo — solo las nuevas se ven de
    // primeras.
    const nuevasHtml = nuevas.map(_tarjetaIncidencia).join('');
    const resueltasHtml = resueltas.length
      ? '<button onclick="var d=this.nextElementSibling;d.style.display=d.style.display===\'none\'?\'flex\':\'none\';this.textContent=d.style.display===\'none\'?\'Ver incidencias resueltas (' + resueltas.length + ')\':\'Ocultar resueltas\'" style="width:100%;background:none;border:0.5px solid #e0e0e0;border-radius:8px;padding:8px 16px;font-size:13px;color:#8A6A4E;cursor:pointer;font-family:\'DM Sans\',sans-serif;margin-top:6px">Ver incidencias resueltas (' + resueltas.length + ')</button><div style="display:none;flex-direction:column;gap:10px;margin-top:10px">' + resueltas.map(_tarjetaIncidencia).join('') + '</div>'
      : '';
    el.innerHTML = (nuevasHtml || (resueltas.length ? '' : '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin incidencias nuevas</div>')) + resueltasHtml;
  }
  updateAlertBadge();
}
async function marcarIncidenciaResuelta(key) {
  if (window._incidenciasCache[key]) window._incidenciasCache[key].estado = 'resuelta';
  renderIncidencias();
  if (window.fb_setIncidenciaEstado) {
    try { await window.fb_setIncidenciaEstado(key, 'resuelta'); }
    catch (e) { console.warn('[incidencias] error al marcar resuelta', e); }
  }
}
// Persiste el log completo (local + Firebase si hay sesión) — usado tanto
// por logActivity() (nucleo-compartido.js) como por resolverAlerta() al
// marcar una entrada.
function _persistActivityLog(log) {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(log).catch(() => {});
  }
}
// Marca una alerta como resuelta (desaparece de la lista y del badge, pero
// sigue existiendo en el registro de actividad completo). Se usa tanto al
// pulsar "Descartar" como automáticamente tras un "Reintentar" con éxito.
function resolverAlerta(ts) {
  const log = getActivityLog();
  const entry = log.find(e => e.ts === ts);
  if (!entry) return;
  entry.resolved = true;
  _persistActivityLog(log);
  renderAlertas();
}
function _alertaDomId(ts) {
  return 'alerta-' + String(ts).replace(/[^a-zA-Z0-9]/g, '');
}
async function reintentarGuardadoPedido(ts, orderNum, fecha) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    const res = await fetch('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reintentarStats', orderNum, fecha })
    });
    const data = await res.json();
    if (data.success) {
      resolverAlerta(ts); // vuelve a pintar la lista sin esta tarjeta
    } else {
      if (btn) { btn.disabled = false; btn.textContent = '🔧 Reintentar guardado'; }
      if (statusEl) { statusEl.textContent = '❌ ' + (data.error || 'No se pudo recuperar.'); statusEl.style.display = 'block'; }
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🔧 Reintentar guardado'; }
    if (statusEl) { statusEl.textContent = '❌ Error de conexión, inténtalo de nuevo.'; statusEl.style.display = 'block'; }
  }
}
// Reimprime un ticket que falló al enviarse a la térmica — recupera los
// datos del pedido de las estadísticas de hoy (ya en localStorage/Firebase,
// no hace falta pedirlos otra vez) y vuelve a intentar el envío por USB.
async function reintentarImpresionTicket(ts, orderNum, fecha) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    let stats;
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch (e) { stats = {}; }
    const order = (stats && stats.date === fecha && Array.isArray(stats.orders)) ? stats.orders.find(o => o.num === orderNum) : null;
    if (!order) throw new Error('No se encontró el pedido (¿es de otro día? solo se guarda el de hoy)');
    const ticketData = {
      orderNum: order.num,
      name: order.name,
      phone: order.phone || '',
      notes: order.notes || '',
      slotTime: order.slot || null,
      items: order.items || [],
      total: order.total,
      time: order.time
    };
    // Pasa por _ptEnFila() igual que cualquier otro ticket — si no, este
    // reintento manual podía intercalarse con un pedido nuevo
    // auto-imprimiéndose justo en ese instante (ver el porqué en
    // _autoImprimirPedido más abajo).
    const _ptEjecutarReintento = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
    await _ptEjecutarReintento(() => imprimirTicketTermico(ticketData));
    if (typeof _markAsImpreso === 'function') _markAsImpreso(order.num);
    if (typeof _registrarEnvioTicket === 'function') _registrarEnvioTicket(order.num, true);
    resolverAlerta(ts);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🖨️ Reintentar impresión'; }
    if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'No se pudo imprimir.'); statusEl.style.display = 'block'; }
  }
}
// Reintenta sumar un sello de fidelización que falló (p.ej. por el límite
// de intentos, que se resuelve solo pasados unos minutos). No se conserva
// si el pedido original consumía un premio — eso es poco frecuente y, si
// pasara, se ajusta a mano desde el panel de Fidelización.
async function reintentarSelloFidelizacion(ts, orderNum, telefono, nombre) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'registrarSello', telefono, orderNum, tienePatata: true, consumioPremio: false, nombre: nombre || '' })
    });
    const data = await res.json();
    if (data.success || data.skipped) {
      resolverAlerta(ts);
    } else {
      throw new Error(data.error || 'El servidor rechazó el sello');
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🎁 Reintentar sello'; }
    if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'Error de conexión'); statusEl.style.display = 'block'; }
  }
}
// ── ESTADO DEL SISTEMA ── Chequeo rápido de las 3 piezas de las que
// depende un pedido: Firebase, el servidor (guardar-pedido.php) y la
// impresora de este dispositivo — para enterarse de un problema mirando
// el panel, en vez de solo cuando ya ha fallado un pedido real.
let _estadoSistemaUltimoCheck = 0;
async function comprobarEstadoSistema(forzar) {
  const el = document.getElementById('estado-sistema-list');
  if (!el) return;
  // Throttle: si ya se comprobó hace menos de un minuto y no se ha pedido
  // a la fuerza (botón "Comprobar ahora"), no repetir en cada re-render.
  if (!forzar && Date.now() - _estadoSistemaUltimoCheck < 60000) return;
  _estadoSistemaUltimoCheck = Date.now();
  el.innerHTML = '<div style="font-size:12px;color:var(--muted)">Comprobando…</div>';

  let fbOk = false;
  try {
    if (window.fb_checkConnection) fbOk = await window.fb_checkConnection();
  } catch (e) {}

  let servidorOk = false;
  try {
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' })
    }, 6000);
    const data = await res.json();
    servidorOk = !!data.success;
  } catch (e) {}

  // La impresora es "opcional" (ok:null) si esta pantalla nunca ha llegado
  // a intentar conectar con ninguna — no es un fallo, solo no aplica aquí.
  const impresoraConectada = typeof _ptIsConnected === 'function' ? _ptIsConnected() : null;

  // Copia de seguridad: la escribe backup-firebase.php (cron nocturno,
  // fuera de public_html) tras cada intento, éxito o fallo. Si el cron
  // dejara de ejecutarse del todo (Hostinger lo desactiva, se borra...) no
  // habría ningún error que reportar — por eso además de mirar "ok" se
  // comprueba que no lleve demasiado tiempo sin actualizarse. Backup diario
  // + margen de sobra para que un cron un poco tarde no dispare una alerta
  // falsa.
  let backupOk = null, backupTexto = 'Sin datos todavía';
  try {
    const bs = window.fb_loadBackupStatus ? await window.fb_loadBackupStatus() : null;
    if (bs && bs.ts) {
      const horasDesde = (Date.now() - bs.ts) / 3600000;
      if (!bs.ok) {
        backupOk = false;
        backupTexto = 'Falló: ' + (bs.error || 'error desconocido');
      } else if (horasDesde > 26) {
        backupOk = false;
        backupTexto = 'Sin copia reciente (última hace ' + Math.round(horasDesde) + ' horas)';
      } else {
        backupOk = true;
        backupTexto = 'Hace ' + (horasDesde < 1 ? 'menos de 1 hora' : Math.round(horasDesde) + ' horas');
      }
    }
  } catch (e) {}

  const resultados = [
    { nombre: 'Firebase (base de datos)', ok: fbOk },
    { nombre: 'Servidor de pedidos', ok: servidorOk },
    { nombre: 'Impresora térmica (este dispositivo)', ok: impresoraConectada }
  ];
  // "Último pedido recibido" no es un ✅/❌ (no siempre tiene por qué haber
  // pedidos recientes, p.ej. fuera de horario) — es solo informativo, para
  // ver de un vistazo si la web sigue "viva" de verdad. window._ultimoPedidoTs
  // lo actualiza _renderLiveOrders() cada vez que llega la lista de pedidos
  // del día por el listener en tiempo real.
  let ultimoPedidoTexto = 'Sin pedidos recibidos hoy en este dispositivo';
  if (window._ultimoPedidoTs) {
    const minsAtras = Math.max(0, Math.round((Date.now() - window._ultimoPedidoTs) / 60000));
    ultimoPedidoTexto = minsAtras < 1 ? 'Hace menos de 1 minuto' : minsAtras === 1 ? 'Hace 1 minuto' : 'Hace ' + minsAtras + ' minutos';
  }
  el.innerHTML = resultados.map(r => {
    const icono = r.ok === null ? '⚪' : r.ok ? '✅' : '❌';
    const color = r.ok === null ? 'var(--muted)' : r.ok ? '#166534' : '#c0392b';
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0"><span style="color:var(--text)">' + r.nombre + '</span><span style="font-weight:700;color:' + color + '">' + icono + '</span></div>';
  }).join('')
    + '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0"><span style="color:var(--text)">🕓 Último pedido recibido</span><span style="font-weight:700;color:var(--muted)">' + ultimoPedidoTexto + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0;gap:8px"><span style="color:var(--text)">💾 Copia de seguridad</span><span style="font-weight:700;color:' + (backupOk === null ? 'var(--muted)' : backupOk ? '#166534' : '#c0392b') + ';text-align:right">' + (backupOk === false ? '❌ ' : backupOk ? '✅ ' : '') + escapeHtml(backupTexto) + '</span></div>'
    + '<div style="font-size:10.5px;color:var(--muted);margin-top:8px">Última comprobación: ' + new Date().toLocaleTimeString('es-ES') + '</div>';
}

// Botón "🖨️ Probar todo" del panel de Alertas — pensado para pasarlo antes
// de abrir el local: comprueba Firebase/servidor/impresora (como
// comprobarEstadoSistema) y, si la impresora está conectada, imprime además
// un ticket de prueba de verdad, para saber que todo funciona antes de que
// llegue el primer pedido real del día.
async function comprobarTodoAntesDeAbrir() {
  const btn = document.getElementById('btn-comprobar-todo');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Comprobando…'; }
  try {
    await comprobarEstadoSistema(true);
    const impresoraConectada = typeof _ptIsConnected === 'function' && _ptIsConnected();
    if (impresoraConectada && typeof imprimirTicketPrueba === 'function') {
      await imprimirTicketPrueba();
      alert('✅ Comprobación completa. Revisa el panel de estado del sistema — y si ha salido un ticket de prueba de la impresora, todo listo para abrir.');
    } else {
      alert('✅ Firebase y servidor comprobados (mira el panel de arriba). ⚠️ La impresora no está conectada ahora mismo — conéctala primero para poder probarla también.');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🖨️ Probar todo'; }
  }
}
function renderAlertas() {
  const entries = getAlertEntries();
  const el = document.getElementById('alertas-list');
  if (!el) return;
  if (!entries.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin avisos pendientes</div>';
  } else {
    el.innerHTML = entries.map(e => {
      const critico = e.action.indexOf('🚨') === 0;
      const bg = critico ? '#FBEAE7' : '#FDECD5';
      const border = critico ? '#F0CFC8' : '#EFD6A9';
      let retryBtn = '';
      if (e.tipo === 'pedido_no_guardado' && e.orderNum && e.fecha) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarGuardadoPedido('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.fecha), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🔧 Reintentar guardado</button>");
      } else if (e.tipo === 'ticket_no_impreso' && e.orderNum && e.fecha) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarImpresionTicket('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.fecha), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🖨️ Reintentar impresión</button>");
      } else if (e.tipo === 'sello_no_registrado' && e.orderNum && e.telefono) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarSelloFidelizacion('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.telefono), "','").concat(escapeAttr(e.nombre || ''), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🎁 Reintentar sello</button>");
      }
      return "\n      <div id=\"".concat(_alertaDomId(e.ts), "\" style=\"display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:").concat(bg, ";border:1px solid ").concat(border, "\">\n        <div style=\"display:flex;gap:10px;align-items:flex-start\">\n          <span style=\"font-size:13px;color:#2A1506;flex:1\">").concat(escapeHtml(e.action), "</span>\n          <span style=\"font-size:10.5px;color:#8A6A4E;white-space:nowrap\">").concat(escapeHtml(e.time), "</span>\n        </div>\n        <div class=\"alerta-retry-status\" style=\"display:none;font-size:11.5px;color:#c0392b;font-weight:600\"></div>\n        <div style=\"display:flex;gap:8px;justify-content:flex-end\">\n          ").concat(retryBtn, "\n          <button onclick=\"resolverAlerta('").concat(escapeAttr(e.ts), "')\" style=\"padding:6px 12px;background:transparent;color:#8A6A4E;border:1.5px solid #D8C6AE;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">✕ Descartar</button>\n        </div>\n      </div>");
    }).join('');
  }
  // Marcar como vistos: la próxima vez que se recalcule el badge, estos
  // avisos ya no cuentan como nuevos.
  if (entries.length) localStorage.setItem(ALERTAS_SEEN_KEY, entries[0].ts || new Date().toISOString());
  updateAlertBadge();
  if (typeof comprobarEstadoSistema === 'function') comprobarEstadoSistema();
}
function clearActivityLog() {
  if (!confirm('¿Borrar todo el log de actividad?')) return;
  localStorage.removeItem(ACTIVITY_LOG_KEY);
  if (window.fb_saveActivityLog) window.fb_saveActivityLog([]).catch(() => {});
  renderActivityLog();
}

// ══════════════════════════════════════════════
//  AUTO-BORRADO DEL HISTORIAL — UI DE ADMIN
// ══════════════════════════════════════════════
function saveAutoDelete() {
  const sel = document.getElementById('autodelete-days');
  if (!sel) return;
  const days = parseInt(sel.value, 10);
  localStorage.setItem(AUTODELETE_KEY, days);
  if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(days).catch(() => {});
  applyAutoDelete();
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "✅ Se borrar\xE1n entradas con m\xE1s de ".concat(days, " d\xEDas");
  logActivity("⚙️ Auto-borrado historial configurado: ".concat(days === 0 ? 'desactivado' : days + ' días'));
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
  // Antes el mínimo eran 4 caracteres — con AES-GCM + PBKDF2 (100.000
  // iteraciones, ver más abajo) una contraseña tan corta se prueba entera
  // por fuerza bruta en poco tiempo si el archivo cifrado cae en malas
  // manos. 8 caracteres no la hace irrompible, pero sí mucho más cara de
  // atacar sin ser incómoda de recordar para un backup ocasional.
  if (!pwd || pwd.length < 8) {
    errEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
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
// El nombre del cliente es texto libre sin restricción de caracteres — una
// comilla suelta dentro de un campo entrecomillado corta el campo antes de
// tiempo y desplaza el resto de comas de esa fila a las columnas
// equivocadas al abrirlo en Excel/Sheets. Se duplica cada comilla interna,
// que es como CSV espera que se escapen ("" dentro de un campo "...").
function _csvEscape(str) {
  let s = String(str == null ? '' : str);
  // Antes de escapar comillas: si el campo empieza por un carácter que
  // Excel/Sheets interpreta como inicio de fórmula (=, +, -, @), se le
  // antepone una comilla simple para que se trate como texto literal, no
  // como fórmula — sin esto, un nombre de cliente como "=HYPERLINK(...)" o
  // "=cmd|'/C calc'!A0" se ejecuta como fórmula real al abrir el CSV
  // exportado (inyección de fórmulas CSV: puede robar datos o ejecutar
  // comandos desde la hoja de cálculo de quien lo abra).
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.replace(/"/g, '""');
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
      rows.push("".concat(day.date, ",").concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
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
    rows.push("".concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
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
  // Los nombres de producto/extras vienen de lo que el navegador mandó a
  // guardar-pedido.php — pueden manipularse con una petición directa al
  // servidor (sin pasar por la web), así que hay que escaparlos igual que
  // nombre/teléfono/notas de abajo, no son más de fiar que esos.
  let itemsHTML = items.map(_ref21 => {
    let n = escapeHtml(_ref21.name),
      qty = _ref21.qty,
      subtotal = _ref21.subtotal,
      extras = _ref21.extras;
    const right = subtotal.toFixed(2) + ' €';
    const label = qty + 'x ' + n;
    if (extras && extras.length > 0) {
      const extrasList = extras.map(function(e) {
        const extraName = escapeHtml((e && e.name) ? e.name : e);
        const extraPrice = (e && e.price) ? '+' + parseFloat(e.price).toFixed(2).replace('.', ',') + ' €' : '';
        return '<div style="display:flex;justify-content:space-between"><span>&nbsp;&nbsp;&nbsp;\xB7 ' + extraName + '</span>' + (extraPrice ? '<span style="color:#aaa">' + extraPrice + '</span>' : '') + '</div>';
      }).join('');
      return '<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div><div style="font-size:10px;color:#333;line-height:1.8;margin-top:1px">' + extrasList + '</div></div>';
    } else if (label.length <= 26) {
      return '<div style="display:flex;justify-content:space-between"><span style="flex:1">' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div>';
    } else {
      return '<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">' + label + '</div><div style="text-align:right;font-weight:bold">' + right + '</div></div>';
    }
  }).join('');

  // El nombre/teléfono/notas los escribe el propio cliente en el checkout
  // (solo se les limita la longitud, no los caracteres) y este HTML se
  // inyecta luego con innerHTML en el panel de admin al ver/imprimir el
  // ticket — sin escapar, un nombre o nota con <script> o <img onerror=...>
  // se ejecutaría en el navegador de quien lo abra con su sesión de admin.
  const nameSafe = escapeHtml(name || '');
  const notesSafe = escapeHtml(notes || '');
  const phoneSafe = escapeHtml(phone || '');

  const headerRow = slotTime
    ? '<div style="display:flex;align-items:stretch;margin:4px 0"><div style="flex:1;padding-right:10px;text-align:center"><div style="font-size:9px;color:#555;letter-spacing:1px;text-transform:uppercase">Hora recogida</div><div style="font-size:22px;font-weight:bold">' + slotTime + 'h</div></div><div style="width:1px;background:#000;margin:2px 0"></div><div style="flex:1;padding-left:10px;display:flex;align-items:center;justify-content:center"><div style="font-size:18px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:1px">' + nameSafe.toUpperCase().replace(' ', '<br>') + '</div></div></div>'
    : '<div style="font-size:22px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:4px 0">' + nameSafe.toUpperCase() + '</div>';

  return "\n    <div style=\"text-align:center;margin-bottom:6px\">\n      <div style=\"font-size:15px;font-weight:bold;letter-spacing:1px\">" + tc.nombre + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.direccion + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.telefono + "</div>\n      " + (tc.nif ? '<div style="font-size:10px;color:#555">NIF ' + tc.nif + '</div>' : '') + "\n    </div>\n    <div style=\"border-top:2px solid #000;margin:6px 0\"></div>\n    " + headerRow + "\n    " + (phoneSafe ? '<div style="font-size:11px;color:#555;text-align:center;margin-bottom:2px">Tlfno. ' + phoneSafe + '</div>' : '') + "\n    <div style=\"border-top:1.5px solid #000;margin:6px 0 4px\"></div>\n    <div style=\"font-size:18px;font-weight:bold;text-align:center;letter-spacing:3px\">PEDIDO ".concat(orderNum, "</div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-bottom:4px\">").concat(time, "</div>\n    <div style=\"border-top:1.5px solid #000;margin:4px 0 6px\"></div>\n    <div style=\"font-size:11px\">").concat(itemsHTML, "</div>\n    <div style=\"border-top:1px dashed #000;margin:6px 0\"></div>\n    <div style=\"display:flex;justify-content:space-between;font-size:13px;font-weight:bold\">\n      <span>TOTAL</span><span>").concat(total.toFixed(2), " €</span>\n    </div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-top:2px\">").concat(tc.textoPago, "</div>\n    ").concat(notesSafe ? "<div style=\"border-top:1px dashed #000;margin:6px 0\"></div><div style=\"font-size:10px\"><b>NOTAS:</b> ".concat(notesSafe, "</div>") : '', "\n    <div style=\"border-top:1px dashed #000;margin:8px 0\"></div>\n    <div style=\"text-align:center;font-size:10px;color:#555\">").concat(tc.despedida, "</div>\n    <div style=\"margin-bottom:16px\"></div>\n  ");
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
// Reintenta imprimir varias veces con un pequeño margen entre intentos antes
// de darse por vencido — un corte momentáneo de USB (la impresora a veces se
// desconecta sola) ya no genera una alerta a la primera; solo si de verdad
// fallan todos los intentos se avisa.
function _imprimirConReintentos(ticketData, intentosRestantes, esperaMs) {
  return imprimirTicketTermico(ticketData).catch(e => {
    if (intentosRestantes <= 1) throw e;
    return new Promise(resolve => setTimeout(resolve, esperaMs))
      .then(() => _imprimirConReintentos(ticketData, intentosRestantes - 1, esperaMs));
  });
}
function doPrint() {
  if (!currentTicketData) return;
  const orderNum = currentTicketData.orderNum;
  const ticketData = currentTicketData;

  // Imprimir de verdad en la térmica (WebUSB) — el registro de abajo refleja
  // este resultado (si de verdad salió por la impresora), no el guardado en Firebase.
  // Pasa por _ptEnFila() para no intercalarse con otro ticket que se esté
  // imprimiendo a la vez (auto-imprimir de un pedido nuevo, la cola
  // pendiente...) — ver el porqué en impresora-termica.js.
  const _ptEjecutarImpresion = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  _ptEjecutarImpresion(() => _imprimirConReintentos(ticketData, 3, 1500)).then(() => {
    _markAsImpreso(orderNum);
    _registrarEnvioTicket(orderNum, true);
  }).catch(e => {
    console.warn('[Impresora] error al imprimir tras varios intentos', e);
    _registrarEnvioTicket(orderNum, false);
    _avisarFalloEnvioTicket(orderNum);
    if (typeof _ptColaAgregar === 'function') _ptColaAgregar(ticketData);
    alert('⚠️ No se pudo imprimir en la térmica (' + e.message + '). Se abrirá el diálogo de impresión del navegador como alternativa. En cuanto la impresora vuelva a conectar, este ticket se reimprimirá solo.');
    window.print();
  });

  // Guardar también en Firebase (histórico de reimpresiones, usado también por fidelización)
  if (window.fb_saveTicket) {
    const reimprKey = 'R' + Date.now();
    const ticketParaImpresora = Object.assign({}, ticketData, { _reimprimir: true });
    window.fb_saveTicket(reimprKey, ticketParaImpresora).catch(() => {});
  }
  closePrintModal();
}
function printLastTicket() {
  if (_lastTicketData) openPrintModal(_lastTicketData);
}
// Envía un pedido nuevo directo a la impresora térmica sin pasar por el
// modal de vista previa — lo dispara el listener de fb_listenStats cuando
// getTicketConfig().autoImprimir está activo. Sin el flag _reimprimir de
// doPrint(): este es el print "original" del sistema, no una reimpresión
// manual desde el panel.
function _autoImprimirPedido(order) {
  const ticketData = {
    orderNum: order.num,
    name: order.name,
    phone: order.phone || '',
    notes: order.notes || '',
    slotTime: order.slot || null,
    items: order.items || [],
    total: order.total,
    time: order.time,
    esPedidoLocal: order.esPedidoLocal || false,
    esEstudianteJubilado: order.esEstudianteJubilado || false,
    fidelizacionElegible: order.fidelizacionElegible || false
  };

  // Imprimir de verdad en la térmica (WebUSB) en esta tablet — con
  // reintentos automáticos antes de avisar (ver _imprimirConReintentos).
  // Pasa por _ptEnFila() porque si llegan varios pedidos casi a la vez
  // (varios clientes pidiendo en el mismo minuto), _nuevosPedidos.forEach()
  // más abajo llama a esta función varias veces seguidas SIN esperar a que
  // termine la anterior — sin esta fila, los bytes de dos tickets distintos
  // podían intercalarse a mitad de envío por Bluetooth/USB y la impresora
  // se quedaba sin imprimir ninguno de los dos ("se volvía loca").
  const _ptEjecutarImpresionAuto = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  _ptEjecutarImpresionAuto(() => _imprimirConReintentos(ticketData, 3, 1500))
    .then(() => {
      _markAsImpreso(order.num);
      _registrarEnvioTicket(order.num, true);
      // Al imprimirse solo (auto-imprimir), pasa a "En preparación" — igual
      // que ya hacía el botón de imprimir manual, pero esto faltaba aquí.
      if (typeof getOrderStatus === 'function' && getOrderStatus(order.num) === 'nuevo') {
        setOrderStatus(order.num, 'recibido').catch(() => {});
      }
    })
    .catch(e => {
      console.warn('[Impresora] auto-imprimir falló para ' + order.num + ' tras varios intentos', e);
      _registrarEnvioTicket(order.num, false);
      _avisarFalloEnvioTicket(order.num);
      if (typeof _ptColaAgregar === 'function') _ptColaAgregar(ticketData);
    });

  // Guardar también en Firebase (histórico, usado por fidelización)
  if (window.fb_saveTicket) {
    const key = 'A' + Date.now() + '_' + order.num;
    window.fb_saveTicket(key, ticketData).catch(() => {});
  }
}
// Aviso real cuando el envío del ticket a Firebase falla (offline, permisos...).
// No sabemos si la impresora física llegó a sacar el papel — de eso se encarga
// el programa que la conecta, fuera de esta web — pero al menos esto ya no se
// queda callado como antes.
function _avisarFalloEnvioTicket(orderNum) {
  logActivity('⚠️ Fallo al enviar el ticket del pedido #' + orderNum + ' a la impresora — revisa la conexión', {
    tipo: 'ticket_no_impreso',
    orderNum,
    fecha: new Date().toISOString().slice(0, 10)
  });
}
const TICKET_SEND_LOG_KEY = 'dpf_ticket_send_log';
function _registrarEnvioTicket(orderNum, ok) {
  let log = [];
  try { log = JSON.parse(localStorage.getItem(TICKET_SEND_LOG_KEY) || '[]'); } catch (e) {}
  const todayKey = new Date().toISOString().slice(0, 10);
  log.unshift({ num: orderNum, date: todayKey, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), ok });
  // Guarda hasta 300 entradas (varios días de margen) — el panel solo
  // enseña las de hoy, esto es solo para no dejar crecer localStorage sin límite.
  localStorage.setItem(TICKET_SEND_LOG_KEY, JSON.stringify(log.slice(0, 300)));
  if (typeof _renderTicketSendLog === 'function') _renderTicketSendLog();
}
// Panel de "trabajos de impresión de hoy": antes solo se veían los últimos
// 15 tickets enviados (de cualquier día mezclados) — ahora se ven TODOS los
// de hoy en este dispositivo, con un resumen de cuántos salieron bien/mal.
function _renderTicketSendLog() {
  const el = document.getElementById('tc-envios-log');
  if (!el) return;
  let log = [];
  try { log = JSON.parse(localStorage.getItem(TICKET_SEND_LOG_KEY) || '[]'); } catch (e) {}
  const todayKey = new Date().toISOString().slice(0, 10);
  const logHoy = log.filter(e => (e.date || todayKey) === todayKey);
  const resumenEl = document.getElementById('tc-envios-resumen');
  if (resumenEl) {
    if (logHoy.length) {
      const ok = logHoy.filter(e => e.ok).length;
      const fallos = logHoy.length - ok;
      resumenEl.textContent = logHoy.length + ' hoy · ✅ ' + ok + (fallos ? ' · ❌ ' + fallos : '');
    } else {
      resumenEl.textContent = '';
    }
  }
  el.innerHTML = logHoy.length ? logHoy.map(e =>
    '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--white);border:1.5px solid var(--warm);border-radius:8px;padding:7px 10px;font-size:12px">'
    + '<span>Pedido #' + escapeHtml(String(e.num)) + '</span>'
    + '<span style="color:' + (e.ok ? '#27855a' : '#c0392b') + ';font-weight:700">' + (e.ok ? '✅ Enviado · ' : '❌ Falló · ') + e.time + '</span>'
    + '</div>'
  ).join('') : '<div style="font-size:12px;color:var(--muted)">Todavía no se ha enviado ningún ticket hoy en este dispositivo</div>';
}
// _lastTicketData vive en nucleo-compartido.js (bundle de cliente) — lo
// asigna carrito-checkout.js en cada pedido y lo lee tanto recordOrderStats
// (cliente) como printLastTicket/aquí abajo (admin).
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
