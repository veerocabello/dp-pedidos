// ── PEDIDOS EN VIVO ──
// ORDER_STATUS_KEY, _normOrderKey, getOrderStatus, getOrderStatuses viven en
// nucleo-compartido.js (bundle de cliente) — el aviso de saturación los
// necesita para cualquier visitante, no solo para admin.

// ── AUTO-PAUSA / AVISO DE SATURACIÓN — evaluación ──
// Se llama desde 3 sitios (fb_listenStats, fb_listenOrderStatuses,
// refreshKitchenGrid) cada vez que cambia el nº de pedidos pendientes de
// verdad (ni listo, ni cancelado, ni entregado) — ver admin-config.js para
// el resto de la lógica (_aplicarAutoPausa, _setAvisoSaturacionEstado).
function _comprobarAutoPausaSaturacion(pendientes) {
  if (typeof getAutoPausaConfig !== 'function' || typeof _aplicarAutoPausa !== 'function') return;
  const cfg = getAutoPausaConfig();
  if (!cfg.enabled) return;
  const umbral = cfg.umbral || 15;
  // Histéresis: se reactiva sola con bastante menos pendientes de los que
  // hicieron falta para pausar (no al primer pedido que baje de X) — si no,
  // con la cola justo en el umbral, pausaría y reabriría sin parar cada vez
  // que se marca/llega un pedido.
  const umbralReapertura = Math.max(1, Math.floor(umbral * 0.6));
  if (pendientes >= umbral) {
    _aplicarAutoPausa(true);
  } else if (pendientes <= umbralReapertura) {
    _aplicarAutoPausa(false);
  }
}
function _actualizarAvisoSaturacion(pendientes) {
  if (typeof getAvisoSaturacionConfig !== 'function' || typeof _setAvisoSaturacionEstado !== 'function') return;
  const cfg = getAvisoSaturacionConfig();
  const activo = !!(cfg.enabled && pendientes >= (cfg.umbral || 8));
  // Solo escribe de verdad si esta sesión tiene permiso de admin en Firebase
  // (cualquier otra llamada falla en silencio, ver el .catch en
  // _setAvisoSaturacionEstado) — no hace falta comprobarlo aquí a mano.
  _setAvisoSaturacionEstado(activo, activo ? cfg.msg : '');
}

// Antes, si esta escritura a Firebase fallaba (wifi floja un instante), solo
// quedaba un console.warn — esta misma tablet marcaba el pedido como
// gestionado en su propia pantalla/localStorage, pero el resto de
// dispositivos (fuente de verdad: Firebase) lo seguían viendo "nuevo".
// Riesgo real con dos tablets de cocina a la vez: se prepara por duplicado,
// o nadie lo entrega porque cada dispositivo cree que ya lo hizo otro.
// Ahora reintenta unas veces con espera creciente, y si aun así no consigue
// escribir, deja un aviso en Alertas (visible para el resto del personal,
// no solo en la consola de ESE dispositivo).
async function setOrderStatus(num, status) {
  const key = _normOrderKey(num);
  window._orderStatusCache[key] = status;
  // Save to localStorage as fallback
  localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
  // Sync to Firebase (fb_setOrderStatus ya normaliza internamente, pasamos clave original)
  if (!window.fb_setOrderStatus) return;
  const _esperas = [800, 2500, 6000];
  for (let intento = 0; intento <= _esperas.length; intento++) {
    try {
      await window.fb_setOrderStatus(num, status);
      return;
    } catch (e) {
      console.warn('Firebase status error (intento ' + (intento + 1) + ')', e);
      if (intento < _esperas.length) {
        await new Promise(r => setTimeout(r, _esperas[intento]));
      } else if (typeof logActivity === 'function') {
        logActivity('🚨 No se pudo sincronizar el estado "' + status + '" del pedido ' + num + ' con el resto de dispositivos — revísalo a mano en "Pedidos en vivo"');
      }
    }
  }
}

// Carga y renderiza los pedidos en vivo.
// Render instantáneo con localStorage, luego actualiza desde Firebase (fuente de verdad).
async function loadLiveOrdersWithLocalFirst() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let localStats;
  try {
    localStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    localStats = {};
  }
  // Render inmediato con lo que haya en local
  if (localStats && localStats.date === todayKey) {
    _renderLiveOrders(localStats, todayKey);
  }
  // Luego ir a Firebase (fuente de verdad) y re-renderizar
  await loadLiveOrders();
}
async function loadLiveOrders() {
  // Repintar los paneles de auto-pausa/aviso previo/pausa exprés con lo que
  // ya haya en caché — sus propios listeners de Firebase (registrados desde
  // el arranque de la página, antes de que admin-shell.html exista en el
  // DOM) pueden no volver a dispararse hasta que cambie algo, así que sin
  // esto se quedarían en "Cargando…" hasta el primer cambio real.
  if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10));
  // No tocar el overflow del body al recargar pedidos en vivo
  const _savedOverflow = document.body.style.overflow;
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  // Firebase es la fuente de verdad (tiene todos los pedidos de todos los dispositivos)
  if (window.fb_getStats) {
    try {
      // Si no hay conexión de verdad (wifi del local caído), fb_getStats()
      // puede quedarse esperando indefinidamente en vez de fallar rápido —
      // sin este límite, recargar la pantalla de cocina sin internet se
      // quedaba cargando para siempre en vez de caer en el respaldo de
      // localStorage de abajo con los últimos pedidos vistos.
      stats = await Promise.race([
        window.fb_getStats(todayKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout esperando a Firebase')), 4000))
      ]);
    } catch (e) {
      console.error('[DPF] fb_getStats error', e);
    }
    console.log('[DPF] loadLiveOrders: todayKey=', todayKey, 'firebase stats=', stats ? JSON.stringify({
      date: stats.date,
      count: stats.count,
      orders: (stats.orders || []).length
    }) : null);
    if (stats) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  // Fallback a localStorage si Firebase falla o no está disponible
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
    console.log('[DPF] loadLiveOrders: usando localStorage, stats=', stats ? JSON.stringify({
      date: stats.date,
      count: stats.count,
      orders: (stats.orders || []).length
    }) : null);
  }
  if (!stats || stats.date !== todayKey) {
    console.warn('[DPF] loadLiveOrders: stats.date=', stats && stats.date, 'todayKey=', todayKey, '-> reseteando a vacío');
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  console.log('[DPF] _renderLiveOrders: orders a pintar=', (stats.orders || []).length);
  _renderLiveOrders(stats, todayKey);
}
function _renderLiveOrders(stats, todayKey) {
  if (typeof _ptUpdateDebugStatus === 'function') _ptUpdateDebugStatus();
  // Guarda cuándo llegó el pedido más reciente — lo usa el panel "Estado
  // del sistema" para mostrar "Último pedido: hace X min" de un vistazo.
  (stats.orders || []).forEach(o => {
    if (typeof o.ts === 'number' && o.ts > (window._ultimoPedidoTs || 0)) window._ultimoPedidoTs = o.ts;
  });
  // Los pedidos "desde el local" (código de cola aplicado) van primero,
  // porque ese cliente ya está esperando físicamente en el mostrador y no
  // se puede ir a pedir a otro sitio — luego por turno, y por hora dentro
  // del mismo turno.
  const orders = (stats.orders || []).slice().sort((a, b) => {
    const localA = a.esPedidoLocal ? 0 : 1;
    const localB = b.esPedidoLocal ? 0 : 1;
    if (localA !== localB) return localA - localB;
    const slotA = a.slot || '99:99';
    const slotB = b.slot || '99:99';
    if (slotA !== slotB) return slotA.localeCompare(slotB);
    return (a.time || '').localeCompare(b.time || '');
  });
  const statuses = getOrderStatuses();
  const container = document.getElementById('live-orders-list');
  if (!container) return;

  // Slots en vivo
  const liveSlotsGrid = document.getElementById('live-slots-grid');
  if (liveSlotsGrid) {
    // Count from actual orders for accuracy
    const liveSlotCounts = {};
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) liveSlotCounts[s] = (liveSlotCounts[s] || 0) + 1;
    });
    const slots = getSlots();
    liveSlotsGrid.innerHTML = slots.map(slot => {
      const count = liveSlotCounts[slot] || 0;
      const max = getSlotMax();
      const pct = Math.min(100, Math.round(count / max * 100));
      const isFull = count >= max;
      const isMid = count > 0 && pct >= 50 && !isFull;
      const hasAny = count > 0 && !isMid && !isFull;
      const bg = isFull ? '#FEF2F2' : isMid ? '#FFF7ED' : hasAny ? '#F0FDF4' : '#FFFFFF';
      const border = isFull ? '#FCA5A5' : isMid ? '#FCD34D' : hasAny ? '#86EFAC' : '#F5E6C8';
      const countColor = isFull ? '#991B1B' : isMid ? '#92400e' : hasAny ? '#166534' : '#C2B5A8';
      const barColor = isFull ? '#ef4444' : isMid ? '#f59e0b' : '#22c55e';
      return '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:10px;padding:10px 8px;text-align:center">'
        + '<div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:4px">' + slot + '</div>'
        + '<div style="font-size:17px;font-weight:900;color:' + countColor + ';margin-bottom:5px">' + count + '/' + max + '</div>'
        + '<div style="height:4px;border-radius:99px;background:#e5e7eb;overflow:hidden">'
          + (count > 0 ? '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:99px"></div>' : '')
        + '</div>'
      + '</div>';
    }).join('');
  }
  if (!orders.length) {
    container.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin pedidos hoy</div>';
    return;
  }
  const activos = orders.filter(o => getOrderStatus(o.num) !== 'entregado' && getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado');

  const nuevos = orders.filter(o => getOrderStatus(o.num) === 'nuevo');
  const enPrep = orders.filter(o => getOrderStatus(o.num) === 'recibido');
  const entregados = orders.filter(o => ['entregado','listo','cancelado'].includes(getOrderStatus(o.num)));
  window._activosCache = [...nuevos, ...enPrep];
  if (typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(activos.length);
  if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(activos.length);

  function _buildCard(o, isNuevo) {
    const slotBadge = o.slot ? '<span style="background:rgba(244,196,48,0.08);color:#3D1F0D;border:0.5px solid #3D1F0D;border-radius:99px;padding:2px 8px;font-size:12px">' + escapeHtml(o.slot) + '</span>' : '';
    const localBadge = o.esPedidoLocal ? '<span style="background:#166534;color:#fff;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700">🏪 En el local</span>' : '';
    const estudianteBadge = o.esEstudianteJubilado ? '<span style="background:#c2711a;color:#fff;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700">🪪 Verificar carné</span>' : '';
    const border = o.esPedidoLocal ? '#166534' : o.esEstudianteJubilado ? '#c2711a' : isNuevo ? '#3D1F0D' : '#3B82F6';
    const btns = isNuevo
      ? '<button class="kbtn kbtn-delete" data-print-num="' + escapeAttr(o.num) + '" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot);_markAsImpreso(this.dataset.num);if(getOrderStatus(this.dataset.num)===&quot;nuevo&quot;){setOrderStatus(this.dataset.num,&quot;recibido&quot;).catch(()=>{})}">' + (_printedOrders.has(o.num) ? '🖨️ Impreso' : '🖨️ Imprimir') + '</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="setLiveStatus(this.dataset.num,\'recibido\')" style="background:#EFF6FF;color:#1D4ED8;border:0.5px solid #93C5FD">🔵 Recibido</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" data-phone="' + escapeAttr(o.phone||'') + '" onclick="cancelarPedidoAdmin(this.dataset.num,this.dataset.phone)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>'
      : '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="setLiveStatus(this.dataset.num,\'entregado\')" style="background:#F0FDF4;color:#166534;border:0.5px solid #86EFAC">✅ Entregado</button>'
        + '<button class="kbtn kbtn-delete" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot)">🖨️</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" data-phone="' + escapeAttr(o.phone||'') + '" onclick="cancelarPedidoAdmin(this.dataset.num,this.dataset.phone)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>';
    return '<div class="live-order-card" id="live-card-' + escapeAttr(o.num.replace('#','')) + '" style="border-left:3px solid ' + border + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">'
        + '<div><span style="font-size:22px;font-weight:700;font-family:Georgia,serif;color:#3D1F0D">' + escapeHtml(o.num) + '</span>'
        + '<span style="font-size:13px;color:#2A1506;margin-left:6px">' + escapeHtml(o.name) + '</span></div>'
        + '<div style="display:flex;gap:4px;align-items:center">' + localBadge + estudianteBadge + slotBadge + '</div>'
      + '</div>'
      + '<div style="font-size:11px;color:#8A6A4E;margin-top:4px">' + escapeHtml(o.time) + ' · <span id="total-display-' + escapeAttr(o.num.replace('#','')) + '" data-num="' + escapeAttr(o.num) + '" onclick="startEditOrderTotal(this.dataset.num)" style="cursor:pointer;text-decoration:underline dotted">' + o.total.toFixed(2).replace('.',',') + ' €</span></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">' + btns + '</div>'
    + '</div>';
  }

  const colHeader = (color, label) =>
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:0.5px solid #F5E6C8">'
    + '<span style="width:10px;height:10px;background:' + color + ';border-radius:50%;display:inline-block;flex-shrink:0"></span>'
    + '<span style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#8A6A4E">' + label + '</span>'
    + '</div>';

  const nuevosHtml = nuevos.length ? nuevos.map(o => _buildCard(o, true)).join('') : '<div style="color:#8A6A4E;font-size:12px;padding:8px">Sin pedidos nuevos</div>';
  const enPrepHtml = enPrep.length ? enPrep.map(o => _buildCard(o, false)).join('') : '<div style="color:#8A6A4E;font-size:12px;padding:8px">Sin pedidos en preparación</div>';
  const entregadosHtml = entregados.map(o =>
    '<div style="background:#f9fafb;border:0.5px solid #e5e7eb;border-radius:8px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px">'
    + '<div style="display:flex;align-items:center;gap:6px">'
      + '<span style="font-size:13px;font-weight:500;color:#27855a">' + escapeHtml(o.num) + '</span>'
      + '<span style="font-size:12px;color:#2A1506">' + escapeHtml(o.name) + '</span>'
      + '<span style="font-size:11px;color:#8A6A4E">' + escapeHtml(o.time) + ' · ' + o.total.toFixed(2).replace('.',',') + ' €</span>'
    + '</div>'
    + '<button class="kbtn kbtn-delete" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot)" style="font-size:11px;padding:4px 10px">🖨️</button>'
    + '</div>'
  ).join('');

  container.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:16px">'
      + '<div>' + colHeader('#3D1F0D', 'Nuevos (' + nuevos.length + ')') + nuevosHtml + '</div>'
      + '<div>' + colHeader('#3B82F6', 'En preparación (' + enPrep.length + ')') + enPrepHtml + '</div>'
    + '</div>'
    + (entregados.length
      ? '<button onclick="var d=this.nextElementSibling;d.style.display=d.style.display===\'none\'?\'block\':\'none\';this.textContent=d.style.display===\'none\'?\'Ver pedidos entregados (' + entregados.length + ')\':\'Ocultar entregados\'" style="width:100%;background:none;border:0.5px solid #e0e0e0;border-radius:8px;padding:8px 16px;font-size:13px;color:#8A6A4E;cursor:pointer;font-family:\'DM Sans\',sans-serif;margin-bottom:6px">Ver pedidos entregados (' + entregados.length + ')</button><div style="display:none">' + entregadosHtml + '</div>'
      : '');
}
// Sube los pedidos del localStorage de ESTE dispositivo a Firebase fusionando con los que ya existen
async function emergencySyncFromLocal() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let local;
  try {
    local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    local = {};
  }
  if (!local || local.date !== todayKey || !(local.orders || []).length) {
    alert('Este dispositivo no tiene pedidos de hoy para subir.');
    return;
  }
  if (!confirm('\xc2\xbfSubir ' + local.orders.length + ' pedido(s) de este dispositivo a Firebase?\n\nSe fusionar\xc3\xa1n con los que ya existan, sin borrar nada.')) return;
  try {
    await firebase.database().ref('stats/' + todayKey).transaction(function (current) {
      if (!current || current.date !== todayKey) return local;
      const existingNums = new Set((current.orders || []).map(o => _normOrderKey(o.num)));
      const nuevos = (local.orders || []).filter(o => !existingNums.has(_normOrderKey(o.num)));
      current.orders = [...(current.orders || []), ...nuevos];
      current.count = current.orders.length;
      current.total = parseFloat(current.orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2));
      return current;
    });
    const snap = await firebase.database().ref('stats/' + todayKey).once('value');
    if (snap.exists()) localStorage.setItem(STATS_KEY, JSON.stringify(snap.val()));
    alert('\xe2\x9c\x85 Pedidos subidos. Total en Firebase: ' + (snap.val().count || 0));
    loadLiveOrders();
  } catch (e) {
    alert('\xe2\x9d\x8c Error al subir: ' + e.message);
  }
}
function setLiveStatus(num, status) {
  // Parar el sonido al momento cuando se marca cualquier pedido
  if (status === 'entregado' || status === 'recibido' || status === 'listo') {
    stopAlertLoop();
  }
  setOrderStatus(num, status);
  // Cualquiera de estos estados cuenta como "ya visto" — se marca una sola
  // vez por pedido (_marcarPedidoAtendido no hace nada si ya estaba
  // marcado), así que da igual si pasa antes por "preparando" y luego por
  // "listo": solo resta del contador la primera vez.
  if (status === 'entregado' || status === 'recibido' || status === 'listo' || status === 'preparando') {
    _marcarPedidoAtendido(num);
  }
  if (_alertPendingOrders > 0) startAlertLoop();
  loadLiveOrders();
  refreshKitchenGrid();
}

// ── KITCHEN MODE ──
let _kitchenInterval = null;
// ── Wake Lock: evita que la tablet de cocina entre en reposo ─────────────
// Si la pantalla se apaga sola por inactividad, a veces corta la conexión
// USB/Bluetooth con la impresora sin avisar. Mientras la pantalla de cocina
// esté abierta, se le pide al navegador que mantenga la pantalla encendida.
// No lo soportan todos los navegadores/dispositivos — si falla, se ignora:
// solo se pierde este extra, no rompe nada más.
let _kitchenWakeLock = null;
async function _pedirWakeLockCocina() {
  if (!('wakeLock' in navigator)) return;
  try {
    _kitchenWakeLock = await navigator.wakeLock.request('screen');
    _kitchenWakeLock.addEventListener('release', () => { _kitchenWakeLock = null; });
  } catch (e) {
    // P.ej. si la pestaña no está visible justo en ese instante — se
    // reintenta solo en cuanto vuelva a estar visible (ver visibilitychange
    // más abajo).
  }
}
function _soltarWakeLockCocina() {
  if (_kitchenWakeLock) { _kitchenWakeLock.release().catch(() => {}); _kitchenWakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  const km = document.getElementById('kitchen-mode');
  if (document.visibilityState === 'visible' && km && km.classList.contains('open') && !_kitchenWakeLock) {
    _pedirWakeLockCocina();
  }
});

function activarAudioCocina() {
  unlockAudioContext();
  _adminLoggedIn = true;
  playNotificationSound();
  document.getElementById('kitchen-audio-banner').style.display = 'none';
}
function openKitchenMode() {
  // Ocultar el overlay de admin sin cerrarlo, para poder volver al salir
  document.getElementById('admin-overlay').style.display = 'none';
  document.getElementById('kitchen-mode').classList.add('open');
  // Si ya activó el audio antes, desbloquearlo automáticamente con este click
  if (localStorage.getItem(AUDIO_PREF_KEY) === '1') {
    unlockAudioContext();
  }
  // Mostrar banner solo si audio no desbloqueado
  const banner = document.getElementById('kitchen-audio-banner');
  if (banner) banner.style.display = _audioCtxUnlocked ? 'none' : 'flex';
  _adminLoggedIn = true; // cocina siempre en modo admin
  _pedirWakeLockCocina();
  clearUnseenOrders();
  refreshKitchenGrid();
  updateKitchenClock();
  _kitchenInterval = setInterval(() => {
    refreshKitchenGrid();
    updateKitchenClock();
  }, 15000);
}
let _kitchenDark = true;
function toggleKitchenTheme() {
  _kitchenDark = !_kitchenDark;
  const km = document.getElementById('kitchen-mode');
  const btn = document.getElementById('kitchen-theme-btn');
  if (_kitchenDark) {
    km.classList.remove('kitchen-light');
    if (btn) btn.textContent = '🌙';
  } else {
    km.classList.add('kitchen-light');
    if (btn) btn.textContent = '☀️';
  }
}
function closeKitchenMode() {
  document.getElementById('kitchen-mode').classList.remove('open');
  clearInterval(_kitchenInterval);
  _kitchenInterval = null;
  _soltarWakeLockCocina();
  // _adminLoggedIn permanece true — alertas siguen activas en cualquier pantalla
  document.getElementById('admin-overlay').style.display = '';
}
function updateKitchenClock() {
  const el = document.getElementById('kitchen-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
function refreshKitchenGrid() {
  if (typeof _ptUpdateDebugStatus === 'function') _ptUpdateDebugStatus();
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) stats = {
    date: todayKey,
    count: 0,
    total: 0,
    orders: []
  };
  const orders = (stats.orders || []).filter(o => getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado' && getOrderStatus(o.num) !== 'entregado').slice().sort((a, b) => {
    // Pedidos "desde el local" primero (ese cliente ya está esperando en el
    // mostrador), luego por cercanía al turno de recogida.
    const localA = a.esPedidoLocal ? 0 : 1;
    const localB = b.esPedidoLocal ? 0 : 1;
    if (localA !== localB) return localA - localB;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const toMins = s => {
      if (!s) return 9999;
      const p = s.split(':');
      return parseInt(p[0]) * 60 + parseInt(p[1]);
    };
    const diffA = Math.abs(toMins(a.slot) - nowMins);
    const diffB = Math.abs(toMins(b.slot) - nowMins);
    if (diffA !== diffB) return diffA - diffB;
    return (a.slot || '99:99').localeCompare(b.slot || '99:99');
  });
  const statuses = getOrderStatuses();
  const grid = document.getElementById('kitchen-grid');
  if (!grid) return;

  // Slots in kitchen header
  const kSlots = document.getElementById('kitchen-slots');
  if (kSlots) {
    // Count slots directly from active orders (reliable, no Firebase dependency)
    const allOrders = stats.orders || [];
    const slotCounts = {};
    allOrders.forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) slotCounts[s] = (slotCounts[s] || 0) + 1;
    });
    const slots = getSlots();
    // Also include slots from orders that don't appear in getSlots() yet
    const allSlots = [...new Set([...slots, ...Object.keys(slotCounts)])].sort();
    const nowH = new Date().getHours(), nowM = new Date().getMinutes();
    const nowTotalMin = nowH * 60 + nowM;
    let closestSlot = null, closestDiff = Infinity;
    allSlots.forEach(slot => {
      const sp = slot.split(':');
      const slotMin = parseInt(sp[0]) * 60 + parseInt(sp[1]);
      const diff = slotMin - nowTotalMin;
      if (diff >= 0 && diff < closestDiff) { closestDiff = diff; closestSlot = slot; }
    });
    const isLightMode = document.getElementById('kitchen-mode').classList.contains('kitchen-light');
    kSlots.innerHTML = allSlots.filter(slot => (slotCounts[slot] || 0) > 0 || slots.includes(slot)).map(slot => {
      const count = slotCounts[slot] || 0;
      const isNow = slot === closestSlot;
      if (isNow) {
        const bg = isLightMode ? '#3D1F0D' : '#F4C430';
        const txt = isLightMode ? '#F4C430' : '#1a1a1a';
        return '<span style="background:' + bg + ';border:1.5px solid ' + bg + ';border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;color:' + txt + '">' + slot + ' · ' + count + '/' + getSlotMax() + '</span>';
      }
      const color = count >= getSlotMax() ? '#c0392b' : count > 0 ? '#3D1F0D' : '#555';
      return '<span style="background:#2a2a2a;border:1.5px solid ' + color + ';border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;color:' + color + '">' + slot + ' · ' + count + '/' + getSlotMax() + '</span>';
    }).join('');
  }
  const countEl = document.getElementById('kitchen-active-count');
  if (countEl) countEl.textContent = orders.length ? orders.length + ' activo' + (orders.length > 1 ? 's' : '') : '';
  if (!orders.length) {
    grid.innerHTML = '<div style="color:#666;font-size:14px;text-align:center;padding:40px;grid-column:1/-1">Sin pedidos activos</div>';
    return;
  }
  const nowMs = new Date();
  grid.innerHTML = orders.map(o => {
    const status = getOrderStatus(o.num);
    // Urgencia basada en minutos que faltan para el slot de recogida
    let minsToSlot = null;
    if (o.slot) {
      const parts = o.slot.split(':');
      const slotTime = new Date();
      slotTime.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      minsToSlot = Math.floor((slotTime - nowMs) / 60000);
    }
    const isUrgent = minsToSlot !== null && minsToSlot <= 5 && minsToSlot >= -10;
    const isWarning = minsToSlot !== null && minsToSlot > 5 && minsToSlot <= 10;
    const slotLabel = o.slot ? minsToSlot <= 0 ? 'Recogida: ya!' : 'Recogida en ' + minsToSlot + ' min' : '';
    const timeColor = isUrgent ? '#e74c3c' : isWarning ? '#3D1F0D' : '#888';
    const cardStyle = isUrgent ? 'animation:pulse-red 1.2s infinite;' : '';
    const itemsHtml = o.items ? o.items.filter(function(it) {
      if (it.isFee) return false;
      const n = (it.name || '').toLowerCase();
      return !n.includes('gesti\xF3n') && !n.includes('gestion') && !n.includes('fee') && !n.includes('cargo');
    }).map(function (it) {
      if (it.extras && it.extras.length > 0) {
        return '<div style="border-left:3px solid #3D1F0D;padding-left:8px;margin:5px 0">' + '<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:4px">' + it.qty + 'x ' + escapeHtml(it.name || '') + '</div>' + '<div style="display:flex;flex-wrap:wrap">' + it.extras.map(function (e) {
          return '<span style="background:#333;border:1px solid #555;border-radius:4px;padding:3px 8px;font-size:13px;color:#eee">' + escapeHtml(e) + '</span>';
        }).join('') + '</div></div>';
      }
      return '<div class="kitchen-item-row">' + it.qty + 'x ' + escapeHtml(it.name || '') + '</div>';
    }).join('') : '<div style="font-size:13px;color:#999">Sin detalle</div>';
    const isJustArrived = o.ts && Date.now() - o.ts < 30000;
    const newClass = status === 'nuevo' && isJustArrived ? ' is-new' : '';
    const localBadgeK = o.esPedidoLocal ? '<span style="background:#166534;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px;margin-left:6px">🏪 EN EL LOCAL</span>' : '';
    const estudianteBadgeK = o.esEstudianteJubilado ? '<span style="background:#c2711a;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px;margin-left:6px">🪪 VERIFICAR CARNÉ</span>' : '';
    const cardStyleFinal = o.esPedidoLocal ? cardStyle + 'border-left:4px solid #166534;' : o.esEstudianteJubilado ? cardStyle + 'border-left:4px solid #c2711a;' : cardStyle;
    // Botón de (re)imprimir — Modo Cocina solo traía "Entregado"/"✕", así que
    // si autoImprimir estaba desactivado o un ticket fallaba, quien
    // trabajaba solo desde aquí no tenía forma de reimprimirlo sin salir al
    // panel normal (donde este mismo botón ya existía, ver _buildCard más
    // arriba). Mismo onclick que allí: imprime y, si el pedido seguía
    // "nuevo", lo pasa a "recibido" — _markAsImpreso() ya se ocupa de
    // marcarlo como visto para la alarma de "pedido nuevo".
    const printBtnK = '<button data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot);_markAsImpreso(this.dataset.num);if(getOrderStatus(this.dataset.num)===&quot;nuevo&quot;){setOrderStatus(this.dataset.num,&quot;recibido&quot;).catch(()=>{})}" style="width:52px;background:#3D1F0D;color:#F4C430;border:none;border-radius:10px;font-size:20px;cursor:pointer">🖨️</button>';
    const btnsHtml = '<div style="display:flex;gap:8px;margin-top:4px">' + '<button onclick="setLiveStatus(\'' + escapeAttr(o.num) + '\',\'entregado\')" style="flex:1;padding:14px;background:#27855a;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:900;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Entregado</button>' + printBtnK + '<button onclick="cancelarPedidoAdmin(\'' + escapeAttr(o.num) + '\',\'' + escapeAttr(o.phone||'') + '\')" style="width:52px;background:#666;color:#e74c3c;border:none;border-radius:10px;font-size:22px;font-weight:900;cursor:pointer">✕</button>' + '</div>';
    return '<div class="kitchen-card status-' + status + newClass + '" style="' + cardStyleFinal + '">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' + '<div class="kitchen-card-num">' + escapeHtml(o.num) + (isUrgent ? ' 🔴' : '') + localBadgeK + estudianteBadgeK + '</div>' + (o.slot ? '<span style="background:#3D1F0D33;color:#3D1F0D;font-size:20px;font-weight:900;padding:5px 14px;border-radius:99px;border:1.5px solid #3D1F0D44">🕐 ' + escapeHtml(o.slot) + '</span>' : '') + '</div>' + '<div class="kitchen-card-name">' + escapeHtml(o.name) + '</div>' + '<div style="font-size:12px;color:' + timeColor + ';font-weight:700;margin-bottom:6px">' + (o.time ? 'Pedido: ' + escapeHtml(o.time) : '') + (slotLabel ? (o.time ? ' · ' : '') + escapeHtml(slotLabel) : '') + (isUrgent ? ' — URGENTE!' : '') + '</div>' + '<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;margin-bottom:4px">' + '<div style="font-size:10px;color:#555;font-weight:700;text-transform:uppercase;margin-bottom:6px">PRODUCTOS:</div>' + itemsHtml + '</div>' + '<div class="kitchen-status-btns">' + btnsHtml + '</div>' + '</div>';
  }).join('');
}

// ── SONIDO CONFIGURABLE ──
// SOUND_KEY vive en nucleo-compartido.js (bundle de cliente) — init.js
// cachea la config de sonido para cualquier visitante nada más cargar,
// aunque solo la USE el panel de admin/cocina.
function getSoundConfig() {
  try {
    return JSON.parse(localStorage.getItem(SOUND_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveSoundConfig() {
  var _document$getElementB21, _document$getElementB22;
  const type = ((_document$getElementB21 = document.getElementById('sound-type')) === null || _document$getElementB21 === void 0 ? void 0 : _document$getElementB21.value) || 'ding';
  const volume = parseInt(((_document$getElementB22 = document.getElementById('sound-volume')) === null || _document$getElementB22 === void 0 ? void 0 : _document$getElementB22.value) || '60', 10);
  const cfg = {
    type,
    volume
  };
  localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
  if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(cfg).catch(() => {});
  showToast('local-toast');
  logActivity("\uD83D\uDD14 Sonido configurado: ".concat(type, ", volumen ").concat(volume, "%"));
}
// Sonido de "impresora desconectada" — aparte del de nuevo pedido, para
// que se puedan distinguir a oído. Solo el tipo (mismo volumen que el de
// nuevo pedido, no hace falta duplicar ese control).
const SOUND_DESCONEXION_KEY = 'dpf_sound_desconexion_config';
function getSoundDesconexionType() {
  try {
    const cfg = JSON.parse(localStorage.getItem(SOUND_DESCONEXION_KEY) || '{}');
    return cfg.type || 'urgente';
  } catch { return 'urgente'; }
}
function saveSoundDesconexionConfig() {
  const sel = document.getElementById('sound-desconexion-type');
  const type = (sel && sel.value) || 'urgente';
  localStorage.setItem(SOUND_DESCONEXION_KEY, JSON.stringify({ type }));
  showToast('local-toast');
  logActivity('🔌 Sonido de desconexión configurado: ' + type);
}
function loadSoundDesconexionConfigUI() {
  const sel = document.getElementById('sound-desconexion-type');
  if (sel) sel.value = getSoundDesconexionType();
}
function testSoundDesconexion() {
  const sel = document.getElementById('sound-desconexion-type');
  playNotificationSound((sel && sel.value) || 'urgente');
}
function loadSoundConfigUI() {
  const cfg = getSoundConfig();
  const sel = document.getElementById('sound-type');
  const vol = document.getElementById('sound-volume');
  const lbl = document.getElementById('sound-volume-label');
  if (sel && cfg.type) sel.value = cfg.type;
  if (vol) {
    var _cfg$volume, _cfg$volume2;
    vol.value = (_cfg$volume = cfg.volume) !== null && _cfg$volume !== void 0 ? _cfg$volume : 60;
    if (lbl) lbl.textContent = ((_cfg$volume2 = cfg.volume) !== null && _cfg$volume2 !== void 0 ? _cfg$volume2 : 60) + '%';
  }
  if (vol) vol.addEventListener('input', () => {
    if (lbl) lbl.textContent = vol.value + '%';
  });
}
function playNotificationSound(typeOverride) {
  var _cfg$volume3;
  const cfg = getSoundConfig();
  const type = typeOverride || cfg.type || 'ding';
  const vol = ((_cfg$volume3 = cfg.volume) !== null && _cfg$volume3 !== void 0 ? _cfg$volume3 : 90) / 100;
  if (type === 'none') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const patterns = {
      ding: [{
        f: 1046,
        t: 0,
        d: 0.25,
        v: vol
      }, {
        f: 1046,
        t: 0.3,
        d: 0.25,
        v: vol * 0.8
      }],
      campana: [{
        f: 880,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 1108,
        t: 0.18,
        d: 0.15,
        v: vol
      }, {
        f: 1320,
        t: 0.36,
        d: 0.15,
        v: vol
      }, {
        f: 880,
        t: 0.54,
        d: 0.2,
        v: vol * 0.9
      }],
      caja: [{
        f: 1318,
        t: 0,
        d: 0.1,
        v: vol
      }, {
        f: 1046,
        t: 0.12,
        d: 0.1,
        v: vol
      }, {
        f: 1318,
        t: 0.24,
        d: 0.1,
        v: vol
      }, {
        f: 1046,
        t: 0.36,
        d: 0.1,
        v: vol
      }, {
        f: 1318,
        t: 0.48,
        d: 0.15,
        v: vol
      }],
      chime: [{
        f: 784,
        t: 0,
        d: 0.2,
        v: vol
      }, {
        f: 988,
        t: 0.22,
        d: 0.2,
        v: vol
      }, {
        f: 1175,
        t: 0.44,
        d: 0.2,
        v: vol
      }, {
        f: 1568,
        t: 0.66,
        d: 0.3,
        v: vol
      }],
      bip: [{
        f: 1600,
        t: 0,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.1,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.2,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.3,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.4,
        d: 0.1,
        v: vol
      }],
      doble: [{
        f: 1100,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 1100,
        t: 0.2,
        d: 0.15,
        v: vol
      }, {
        f: 1100,
        t: 0.4,
        d: 0.15,
        v: vol
      }],
      coffeeshop: [{
        f: 698,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 880,
        t: 0.18,
        d: 0.15,
        v: vol
      }, {
        f: 1046,
        t: 0.36,
        d: 0.15,
        v: vol
      }, {
        f: 1318,
        t: 0.54,
        d: 0.2,
        v: vol
      }, {
        f: 1046,
        t: 0.78,
        d: 0.2,
        v: vol
      }],
      urgente: [{
        f: 1400,
        t: 0,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.12,
        d: 0.1,
        v: vol
      }, {
        f: 1400,
        t: 0.24,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.36,
        d: 0.1,
        v: vol
      }, {
        f: 1400,
        t: 0.48,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.6,
        d: 0.15,
        v: vol
      }]
    };
    const waveType = 'square';
    const pattern = patterns[type] || patterns.ding;
    // Calcular duración total del patrón para repetirlo 3 veces con pausa entre repeticiones
    const patternDuration = Math.max(...pattern.map(n => n.t + n.d)) + 0.15;
    const REPEATS = 3;
    for (let rep = 0; rep < REPEATS; rep++) {
      const offset = rep * patternDuration;
      pattern.forEach(_ref22 => {
        let f = _ref22.f,
          t = _ref22.t,
          d = _ref22.d,
          v = _ref22.v;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = f;
        osc.type = waveType;
        gain.gain.setValueAtTime(v, ctx.currentTime + offset + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + t + d);
        osc.start(ctx.currentTime + offset + t);
        osc.stop(ctx.currentTime + offset + t + d + 0.05);
      });
    }
  } catch (e) {}
}
function testNotificationSound() {
  var _document$getElementB23, _document$getElementB24;
  const type = ((_document$getElementB23 = document.getElementById('sound-type')) === null || _document$getElementB23 === void 0 ? void 0 : _document$getElementB23.value) || 'ding';
  const vol = parseInt(((_document$getElementB24 = document.getElementById('sound-volume')) === null || _document$getElementB24 === void 0 ? void 0 : _document$getElementB24.value) || '60', 10);
  // Guardar temporalmente para que playNotificationSound lo use
  const prev = getSoundConfig();
  localStorage.setItem(SOUND_KEY, JSON.stringify({
    type,
    volume: vol
  }));
  playNotificationSound(type);
  // Restaurar el anterior si no se ha guardado
  setTimeout(() => {
    const cur = getSoundConfig();
    if (cur.type === type && cur.volume === vol) {} // ya guardado con saveSoundConfig
  }, 100);
}

// ── CONTADOR DE PEDIDOS EN EL TÍTULO ──
let _titleBase = document.title;
let _unseenOrders = 0;
function updateTabTitle(newOrderCount) {
  if (newOrderCount > 0) {
    document.title = "(".concat(newOrderCount, ") ").concat(_titleBase);
  } else {
    document.title = _titleBase;
  }
}

// ── ALERTA NUEVO PEDIDO ──
// _lastKnownOrderCount vive en nucleo-compartido.js (bundle de cliente) —
// lo actualiza también el listener en tiempo real de Firebase para
// cualquier visitante (initFirebaseListeners), no solo este polling de
// respaldo cuando Firebase no está disponible.
function checkForNewOrders(statsOverride) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = statsOverride || null;
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
  }
  if (!stats || stats.date !== todayKey) return;
  const count = stats.count || 0;
  if (_lastKnownOrderCount === null) {
    _lastKnownOrderCount = count;
    return;
  }
  console.log('[DPF] checkForNewOrders: count=' + count + ' lastKnown=' + _lastKnownOrderCount + ' adminLoggedIn=' + _adminLoggedIn);
  if (count > _lastKnownOrderCount) {
    const diff = count - _lastKnownOrderCount;
    _lastKnownOrderCount = count;
    _unseenOrders += diff;
    updateTabTitle(_unseenOrders);
    console.log('[DPF] NEW ORDER — calling showNewOrderNotification, diff=' + diff);
    // guardar-pedido.php inserta los pedidos nuevos al principio del array (unshift)
    showNewOrderNotification((stats.orders || []).slice(0, diff).map(o => o.num));
  }
}

// Limpiar contador cuando se abre la sección de pedidos
function clearUnseenOrders() {
  _unseenOrders = 0;
  updateTabTitle(0);
}

// Alert loop state
let _alertLoopInterval = null;
let _alertPendingOrders = 0;
// Antes _alertPendingOrders era un contador suelto que varios sitios subían
// o bajaban a mano (sobreescribiéndolo entero al detectar pedidos nuevos, o
// restándole 1 desde tres sitios distintos: imprimir, marcar listo, marcar
// entregado) — un mismo pedido marcado "listo" restaba dos veces porque
// 'listo' entraba en dos condiciones distintas seguidas, y dos avisos de
// "pedido nuevo" casi seguidos podían pisarse el contador en vez de sumar.
// Ahora se lleva la cuenta por número de pedido concreto: añadir/quitar el
// mismo pedido dos veces no hace nada la segunda vez.
let _alertPendingOrderNumsSet = new Set();
function _marcarPedidoPendienteAlerta(num) {
  if (!num || _alertPendingOrderNumsSet.has(num)) return;
  _alertPendingOrderNumsSet.add(num);
  _alertPendingOrders = _alertPendingOrderNumsSet.size;
}
function _marcarPedidoAtendido(num) {
  if (!num || !_alertPendingOrderNumsSet.has(num)) return;
  _alertPendingOrderNumsSet.delete(num);
  _alertPendingOrders = _alertPendingOrderNumsSet.size;
  if (_alertPendingOrders === 0) stopAlertLoop();
}
function _resetPedidosPendientesAlerta() {
  _alertPendingOrderNumsSet.clear();
  _alertPendingOrders = 0;
}
function startAlertLoop() {
  if (_alertLoopInterval) return; // ya está sonando
  playNotificationSound();
  // Calcular duración del patrón × 3 repeticiones + pausa
  const cfg = getSoundConfig();
  const type = cfg.type || 'ding';
  const patterns = {
    ding: 0.7,
    campana: 0.9,
    caja: 0.8,
    chime: 1.1,
    bip: 0.65,
    doble: 0.7,
    coffeeshop: 1.1,
    urgente: 0.9
  };
  const loopDelay = ((patterns[type] || 0.8) * 3 + 0.5) * 1000;
  _alertLoopInterval = setInterval(() => {
    if (_alertPendingOrders > 0) playNotificationSound();else stopAlertLoop();
  }, loopDelay);
}
function stopAlertLoop() {
  if (_alertLoopInterval) {
    clearInterval(_alertLoopInterval);
    _alertLoopInterval = null;
  }
}
function showNewOrderNotification(nums) {
  console.log('[DPF] showNewOrderNotification: nums=' + JSON.stringify(nums) + ' adminLoggedIn=' + _adminLoggedIn + ' audioUnlocked=' + _audioCtxUnlocked);
  // Solo sonar si hay sesión de admin activa (no al cliente que hace el pedido)
  if (_adminLoggedIn) {
    (nums || []).forEach(_marcarPedidoPendienteAlerta);
    startAlertLoop();
    const toast = document.getElementById('new-order-toast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  }
}

// ── MARCAR TODOS COMO LISTOS (COCINA) ──
function confirmarTodosListos() {
  if (!confirm("Marcar TODOS los pedidos activos como listos?")) return;
  markAllKitchenReady();
}
function markAllKitchenReady() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) return;
  const orders = stats.orders || [];
  if (!orders.length) return;
  const statuses = getOrderStatuses();
  const aCambiar = orders.filter(o => {
    const key = _normOrderKey(o.num);
    return (statuses[key] || 'nuevo') !== 'listo' && statuses[key] !== 'cancelado' && statuses[key] !== 'entregado';
  });
  if (!aCambiar.length) return;
  // setOrderStatus() actualiza localStorage Y Firebase (fb_setOrderStatus)
  // por pedido \u2014 antes este bot\u00f3n solo tocaba localStorage directamente,
  // as\u00ed que un pedido marcado "listo" aqu\u00ed pod\u00eda volver a aparecer como
  // pendiente en cuanto llegara cualquier otro cambio de estado: el
  // listener en tiempo real (fb_listenOrderStatuses) sobrescribe
  // window._orderStatusCache entero con lo que haya en Firebase, que nunca
  // se hab\u00eda enterado de este cambio.
  // setOrderStatus() por sí sola NO toca el contador de la alarma de
  // "pedido nuevo" (eso solo lo hace _marcarPedidoAtendido, ver
  // setLiveStatus() más arriba) — sin esto, marcar todos como listos desde
  // aquí dejaba la alarma sonando para siempre, sin ninguna forma de
  // pararla salvo salir de Modo Cocina a otra pestaña del panel.
  aCambiar.forEach(o => { setOrderStatus(o.num, 'listo'); _marcarPedidoAtendido(o.num); });
  refreshKitchenGrid();
  loadLiveOrders();
  logActivity("\u2705 ".concat(aCambiar.length, " pedido").concat(aCambiar.length !== 1 ? 's' : '', " marcado").concat(aCambiar.length !== 1 ? 's' : '', " como listo desde cocina"));
}

// Polling de fallback: solo actúa si Firebase no está disponible
// Con Firebase activo los listeners se encargan de todo en tiempo real
setInterval(() => {
  var _document$getElementB25;
  if (window._firebaseReady) return; // Firebase activo → los listeners ya cubren esto
  const _ao2 = document.getElementById('admin-overlay');
  const _km = document.getElementById('kitchen-mode');
  const adminOpen = _ao2 ? _ao2.classList.contains('open') : false;
  const kitchenOpen = _km ? _km.classList.contains('open') : false;
  if (!adminOpen && !kitchenOpen) return;
  checkForNewOrders();
  if ((_document$getElementB25 = document.getElementById('admin-pedidos')) !== null && _document$getElementB25 !== void 0 && _document$getElementB25.classList.contains('active')) loadLiveOrders();
  if (kitchenOpen) refreshKitchenGrid();
}, 10000);

