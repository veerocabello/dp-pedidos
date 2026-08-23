// ── IMPRIMIR TODOS + MARCA DE IMPRESO ────────────────────────────────────────
// Antes _printedOrders vivía solo en memoria de ESTE bundle cargado en ESTA
// pestaña — recargar la página, o simplemente abrir una segunda pestaña/
// tablet, hacía que todo volviera a mostrar "🖨️ Imprimir" aunque ya se
// hubiera impreso, invitando a reimprimir de más. Ahora se guarda también
// en localStorage (con fecha, para no arrastrar el número de un pedido de
// ayer al de hoy con el mismo T####) y se sincroniza vía Firebase
// (fb_setPrinted/fb_listenPrintedOrders, el listener vive en
// nucleo-compartido.js porque este bundle admin puede no estar cargado
// todavía cuando llega el primer snapshot) para que lo que imprime una
// tablet lo vea también el resto.
const PRINTED_ORDERS_KEY = 'dpf_printed_orders';
const _printedOrders = new Set(); // IDs de pedidos ya impresos hoy
(function _cargarPrintedOrdersLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRINTED_ORDERS_KEY) || 'null');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (saved && saved.date === todayKey && Array.isArray(saved.nums)) {
      saved.nums.forEach(n => _printedOrders.add(n));
    }
  } catch (e) {}
})();
function _guardarPrintedOrdersLocal() {
  try {
    localStorage.setItem(PRINTED_ORDERS_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), nums: [..._printedOrders] }));
  } catch (e) {}
}

async function imprimirTodosLosActivos() {
  const activos = (window._activosCache || []);
  if (!activos.length) { alert('No hay pedidos activos para imprimir'); return; }
  const sinImprimir = activos.filter(o => !_printedOrders.has(o.num));
  if (!sinImprimir.length) {
    if (!confirm('Todos los pedidos ya están marcados como impresos. ¿Imprimir de nuevo?')) return;
    activos.forEach(o => _printedOrders.delete(o.num));
    sinImprimir.push(...activos);
  }
  for (const o of sinImprimir) {
    await printOrderFromStats(o.num, o.name, o.time, o.total, o.slot || '');
    _markAsImpreso(o.num);
    // Auto-marcar como recibido si estaba en "nuevo"
    if (getOrderStatus(o.num) === 'nuevo') {
      await setOrderStatus(o.num, 'recibido');
    }
    await new Promise(r => setTimeout(r, 800));
  }
  // Refrescar la vista solo si el panel admin está abierto
  const _ao1 = document.getElementById('admin-overlay');
  if (_ao1 && _ao1.classList.contains('open')) {
    loadLiveOrders && loadLiveOrders();
  }
}

function _markAsImpreso(orderNum, _remoto) {
  _printedOrders.add(orderNum);
  _guardarPrintedOrdersLocal();
  // _remoto=true significa que esta marca ya viene de Firebase (otra
  // tablet lo imprimió) — no hace falta volver a escribirlo allí.
  if (!_remoto && window.fb_setPrinted) window.fb_setPrinted(orderNum).catch(() => {});
  // Parar sonido al imprimir — equivale a haber visto el pedido. Antes esto
  // restaba 1 a mano de _alertPendingOrders, el contador suelto que ya se
  // dejó de usar en pedidos-vivo-cocina.js (ver el comentario junto a
  // _alertPendingOrderNumsSet ahí: un mismo pedido podía restar dos veces,
  // o dos avisos casi seguidos podían pisarse el contador) — esta función
  // se quedó sin actualizar en aquel cambio, así que reimprimir el MISMO
  // pedido varias veces (el botón "🖨️ Impreso" se deja pulsable a
  // propósito) seguía restando cada vez, pudiendo silenciar la alarma con
  // pedidos reales aún sin atender. _marcarPedidoAtendido() usa el mismo
  // Set por número de pedido que el resto de sitios que paran la alarma
  // (setLiveStatus, markAllKitchenReady, cancelarPedidoAdmin) — no hace
  // nada si ese pedido concreto ya no estaba pendiente, así que reimprimir
  // de más deja de tener ningún efecto sobre el resto de la cola.
  if (typeof _marcarPedidoAtendido === 'function') _marcarPedidoAtendido(orderNum);
  const btn = document.querySelector('[data-print-num="' + CSS.escape(orderNum) + '"]');
  if (btn) {
    btn.textContent = '🖨️ Impreso';
    btn.style.background = '#e8f8ed';
    btn.style.color = '#27855a';
    btn.style.border = '1.5px solid #a9dfbf';
    btn.disabled = false; // sigue siendo pulsable por si quieren reimprimir
    btn.onclick = function() {
      _printedOrders.delete(orderNum);
      printOrderFromStats(orderNum, btn.dataset.name, btn.dataset.time, parseFloat(btn.dataset.total), btn.dataset.slot||'');
      _markAsImpreso(orderNum);
    };
  }
}


// ── GUARDAR DÍAS DE EXPIRACIÓN ────────────────────────────────────────────────
function saveTrustedExpiry() {
  const days = parseInt(document.getElementById('trusted-expiry-days')?.value || '30');
  if (isNaN(days) || days < 1) { alert('Introduce un número válido de días'); return; }
  localStorage.setItem(TRUSTED_DAYS_KEY, String(days));
  // Antes esto solo vivía en localStorage de ESTE dispositivo — cambiarlo
  // desde el móvil no se reflejaba al marcar de confianza el ordenador del
  // local (cada uno usaba su propio valor, o el de por defecto), aunque el
  // mensaje diera a entender que era un ajuste global. Ahora se sincroniza.
  if (window.fb_saveTrustedDays) window.fb_saveTrustedDays(days).catch(function () {});
  logActivity('🔐 Expiración de sesión configurada: ' + days + ' días (todos los dispositivos)');
  alert('✅ Guardado. Se aplicará en el próximo inicio de sesión, en cualquier dispositivo.');
}


// ── ACCESO A EMPLEADOS DESDE RUEDA ───────────────────────────────────────────
function openEmpleadosWithBimba() {
  // Usar el mismo modal bimba pero redirigir a empleados al confirmar
  window._bimbaTargetEmpleados = true;
  secureLockTap();
}

// ── DISPOSITIVO DE CONFIANZA ──────────────────────────────────────────────────
// El token de confianza es un secreto ALEATORIO generado en el momento de
// marcar el dispositivo (no una fórmula a partir de datos que ya son
// públicos o casi — antes era sha256(uid + hash de la contraseña), y el uid
// y el hash por defecto están en el JS que se manda al navegador, así que
// cualquiera que supiera el uid del admin podía calcular un token válido
// sin haber iniciado sesión nunca). Solo se guarda su HASH en Firebase
// (config/trustedDevices/<deviceId>), y la comprobación la hace el
// servidor (bimba-verify.php) — así "Expulsar" desde el panel puede borrar
// ese registro y el dispositivo pierde el acceso de verdad, no solo hasta
// que recargue la página.
const TRUSTED_KEY = 'dpf_trusted_device';
const TRUSTED_NAME_KEY = 'dpf_trusted_device_name';
const TRUSTED_TOKEN_KEY = 'dpf_trusted_token'; // secreto aleatorio, no derivado de nada público
const TRUSTED_EXPIRY_KEY = 'dpf_trusted_expiry'; // timestamp de expiración
const TRUSTED_DAYS_KEY = 'dpf_trusted_days'; // días configurados
const DEVICE_ID_KEY = 'dpf_device_id'; // identificador estable de este dispositivo (no es secreto)

// Trae el valor real desde Firebase al abrir el panel en un dispositivo
// nuevo (o que no lo tenía sincronizado todavía) — ver saveTrustedExpiry().
function _cargarTrustedDaysDesdeFirebase() {
  if (!window.fb_loadTrustedDays) return;
  window.fb_loadTrustedDays().then(function (days) {
    if (!days) return;
    localStorage.setItem(TRUSTED_DAYS_KEY, String(days));
    const input = document.getElementById('trusted-expiry-days');
    if (input) input.value = String(days);
  }).catch(function () {});
}
if (window._firebaseReady) _cargarTrustedDaysDesdeFirebase();
else document.addEventListener('firebaseReady', _cargarTrustedDaysDesdeFirebase);

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2));
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
async function _sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getTrustedExpiryDays() {
  return parseInt(localStorage.getItem(TRUSTED_DAYS_KEY) || '30');
}

async function isTrustedDevice() {
  if (localStorage.getItem(TRUSTED_KEY) !== 'yes') return false;
  // Comprobar expiración local primero (evita una llamada de red inútil)
  const expiry = parseInt(localStorage.getItem(TRUSTED_EXPIRY_KEY) || '0');
  if (expiry && Date.now() > expiry) {
    await setTrustedDevice(false);
    console.log('[trusted] sesión expirada');
    return false;
  }
  const token = localStorage.getItem(TRUSTED_TOKEN_KEY);
  if (!token) return false;
  // Comprobación real en el servidor: si el admin ha "expulsado" este
  // dispositivo desde el panel, su registro ya no existe en Firebase y
  // esto falla aunque el token siga guardado en este navegador.
  try {
    const res = await fetch('bimba-verify.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkTrustedDevice', deviceId: getDeviceId(), token })
    });
    const data = await res.json();
    if (!data.success) { await setTrustedDevice(false); return false; }
    return true;
  } catch (e) {
    return false; // red caída: por seguridad, pedir login en vez de asumir confianza
  }
}

function getTrustedDeviceName() {
  return localStorage.getItem(TRUSTED_NAME_KEY) || 'Sin nombre';
}

async function setTrustedDevice(val, name) {
  if (val) {
    const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
    if (!user || !user.uid) return; // no guardar si no hay sesión real
    const token = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '_' + Math.random().toString(36).slice(2));
    const tokenHash = await _sha256Hex(token);
    const deviceId = getDeviceId();
    const days = getTrustedExpiryDays();
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    // Escritura autenticada (ya hay sesión real de admin en este momento) —
    // el servidor solo guarda el HASH, nunca el token en sí.
    await firebase.database().ref('config/trustedDevices/' + deviceId).set({
      tokenHash: tokenHash,
      name: name || 'Sin nombre',
      createdAt: Date.now(),
    });
    localStorage.setItem(TRUSTED_KEY, 'yes');
    localStorage.setItem(TRUSTED_NAME_KEY, name || 'Sin nombre');
    localStorage.setItem(TRUSTED_TOKEN_KEY, token);
    localStorage.setItem(TRUSTED_EXPIRY_KEY, String(expiry));
  } else {
    // Si hay sesión real, limpiar también el registro en Firebase — igual
    // que arriba, si no hay sesión (p.ej. venimos de una comprobación
    // fallida sin login) esta escritura fallará en silencio y no pasa nada,
    // el registro se queda pero el token local ya no sirve para nada.
    try {
      const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
      if (user && user.uid) await firebase.database().ref('config/trustedDevices/' + getDeviceId()).remove();
    } catch (e) {}
    localStorage.removeItem(TRUSTED_KEY);
    localStorage.removeItem(TRUSTED_NAME_KEY);
    localStorage.removeItem(TRUSTED_TOKEN_KEY);
    localStorage.removeItem(TRUSTED_EXPIRY_KEY);
  }
}

function toggleAdminPwdVisibility(btn) {
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
    btn.setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
  }
  input.focus();
}
