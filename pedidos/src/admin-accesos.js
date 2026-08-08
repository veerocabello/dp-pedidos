// ── IMPRIMIR TODOS + MARCA DE IMPRESO ────────────────────────────────────────
const _printedOrders = new Set(); // IDs de pedidos ya impresos en esta sesión

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

function _markAsImpreso(orderNum) {
  _printedOrders.add(orderNum);
  // Parar sonido al imprimir — equivale a haber visto el pedido
  _alertPendingOrders = Math.max(0, (_alertPendingOrders || 1) - 1);
  if (_alertPendingOrders === 0) stopAlertLoop();
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
  logActivity('🔐 Expiración de sesión configurada: ' + days + ' días');
  alert('✅ Guardado. Se aplicará en el próximo inicio de sesión.');
}


// ── ACCESO A EMPLEADOS DESDE RUEDA ───────────────────────────────────────────
function openEmpleadosWithBimba() {
  // Usar el mismo modal bimba pero redirigir a empleados al confirmar
  window._bimbaTargetEmpleados = true;
  secureLockTap();
}

// ── DISPOSITIVO DE CONFIANZA ──
// SEGURIDAD: el flag local es solo una preferencia de UX (saltar la pantalla de login).

// ── Compartir pedido por WhatsApp ────────────────────────
function shareOrderWhatsApp(orderNum, name, slotTime, items, total) {
  let msg = '*Dulce Patata Food* — Pedido ' + orderNum + '\n';
  msg += 'Nombre: ' + name + '\n';
  if (slotTime) msg += 'Recogida a las: ' + slotTime + 'h\n';
  msg += '\n*Productos:*\n';
  if (items && items.length) {
    items.forEach(function(it) { msg += '  ' + it.qty + 'x ' + it.name + ' — ' + it.price.toFixed(2).replace('.', ',') + ' €\n'; });
  }
  msg += '\n*Total: ' + total.toFixed(2).replace('.', ',') + ' €*';
  msg += '\n\nVen a recogerlo y paga en caja';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// ── DISPOSITIVO DE CONFIANZA ─────────────────────────────────────────────────
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

// Audio context — needs user gesture to unlock
let _audioCtxUnlocked = false;
const AUDIO_PREF_KEY = 'dpf_audio_enabled';

// ── ACTIVAR AUDIO DESDE PANEL ────────────────────────────────────────────────
function activarAudioDesdePanel() {
  unlockAudioContext();
  localStorage.setItem(AUDIO_PREF_KEY, '1');
  setTimeout(function() {
    testNotificationSound();
    _updateAudioBannerState();
  }, 100);
}

function _updateAudioBannerState() {
  const banner = document.getElementById('audio-unlock-banner');
  const text = document.getElementById('audio-banner-text');
  const btn = document.getElementById('audio-banner-btn');
  if (!banner) return;
  if (_audioCtxUnlocked) {
    banner.style.background = '#FBEFD6';
    banner.style.borderColor = '#F4C430';
    if (text) { text.textContent = '🔊 Audio activado — recibirás alertas de nuevos pedidos'; text.style.color = '#3D1F0D'; }
    if (btn) {
      btn.textContent = '🔇 Desactivar';
      btn.style.background = '#3D1F0D';
      btn.style.color = '#F4C430';
      btn.onclick = function() {
        localStorage.removeItem(AUDIO_PREF_KEY);
        _audioCtxUnlocked = false;
        _updateAudioBannerState();
      };
    }
  } else {
    banner.style.background = '#fff3cd';
    banner.style.borderColor = '#3D1F0D';
    if (text) { text.textContent = '🔇 Audio desactivado — toca para activar las alertas sonoras'; text.style.color = '#5a3e1b'; }
    if (btn) {
      btn.textContent = '🔊 Activar audio';
      btn.style.background = '#3D1F0D';
      btn.onclick = activarAudioDesdePanel;
    }
  }
}

function unlockAudioContext() {
  if (_audioCtxUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume().then(() => {
      _audioCtxUnlocked = true;
      localStorage.setItem(AUDIO_PREF_KEY, '1');
    });
  } catch (e) {}
}
async function openAdmin() {
  // Cargar el HTML del admin de forma diferida si aún no está cargado
  if (typeof loadAdminShell === 'function' && !window._adminShellLoaded) {
    await new Promise(function(resolve) { loadAdminShell(resolve); });
  }
  // Asegurar que pointer-events está restaurado (por si stock lo dejó bloqueado)
  const adminOverlay = document.getElementById('admin-overlay');
  if (adminOverlay) adminOverlay.style.pointerEvents = '';
  window._secretKeyBuf = '';
  // Always reset to default section (Carta) so bimba config never bleeds through
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const defaultSection = document.getElementById('admin-productos');
  const defaultTab = document.querySelector('.admin-tab[onclick*="productos"]');
  if (defaultSection) defaultSection.classList.add('active');
  if (defaultTab) defaultTab.classList.add('active');
  unlockAudioContext(); // desbloquear audio con el gesto del usuario
  document.getElementById('admin-overlay').classList.add('open');
  document.getElementById('admin-error').textContent = '';
  document.getElementById('admin-pwd-input').value = '';
  // Si el dispositivo es de confianza, saltar el login directamente
  if (await isTrustedDevice()) {
    _adminLoggedIn = true; window._adminLoggedIn = true;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso automático — dispositivo de confianza');
  } else {
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
  }
  // Mostrar banner de audio solo si no está desbloqueado
  if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
  const audioBanner = document.getElementById('audio-unlock-banner');
  if (audioBanner) _updateAudioBannerState();
  // Registrar sesión activa en Firebase
  try {
    if (window.fb_registerSession) {
      const ua = navigator.userAgent;
      let device = 'Dispositivo desconocido';
      if (/iPhone/.test(ua)) device = 'iPhone · ' + (/Safari/.test(ua) ? 'Safari' : 'App');
      else if (/iPad/.test(ua)) device = 'iPad · ' + (/Safari/.test(ua) ? 'Safari' : 'App');
      else if (/Android/.test(ua)) device = 'Android · ' + (/Chrome/.test(ua) ? 'Chrome' : 'Navegador');
      else if (/Mac/.test(ua)) device = 'Mac · ' + (/Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : 'Safari');
      else if (/Windows/.test(ua)) device = 'Windows · ' + (/Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : 'Edge');
      window._mySessionId = _SESSION_ID;
      await window.fb_registerSession({
        sid: _SESSION_ID,
        deviceId: getDeviceId(),
        device: device,
        time: new Date().toLocaleString('es-ES'),
        ts: Date.now(),
        killed: false
      });
      // Si otro dispositivo nos expulsa desde "Sesiones activas", cerrar
      // el panel aquí mismo en tiempo real, no solo cosméticamente en la lista.
      if (window._myKillListenerUnsub) window._myKillListenerUnsub();
      window._myKillListenerUnsub = firebase.database().ref('activeSessions/' + _SESSION_ID + '/killed').on('value', function (snap) {
        if (snap.exists() && snap.val() === true) {
          showAlert('Esta sesión ha sido cerrada desde otro dispositivo.');
          setTimeout(async function () {
            await setTrustedDevice(false);
            closeAdmin();
            location.reload();
          }, 600);
        }
      });
    }
  } catch(e) {}
}

// ── ACCESO AL PANEL — TRIPLE TOQUE/CLICK EN LOGO ──
(function () {
  function initLogoTap() {
    var tapCount = 0,
      tapTimer = null,
      lastTap = 0;
    var logo = document.getElementById('logo-secret');
    if (!logo) return;
    function registerTap() {
      var now = Date.now();
      if (now - lastTap < 80) return;
      lastTap = now;
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () {
        tapCount = 0;
      }, 1400);
      if (tapCount >= 3) {
        tapCount = 0;
        clearTimeout(tapTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso por triple toque en logo');
        openAdmin();
      }
    }
    logo.addEventListener('touchstart', function (e) {
      e.preventDefault();
      registerTap();
    }, {
      passive: false
    });
    logo.addEventListener('click', function (e) {
      registerTap();
    });
    logo.addEventListener('touchend', function (e) {
      e.preventDefault();
    }, {
      passive: false
    });
    logo.addEventListener('click', function (e) {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      registerTap();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoTap);
  } else {
    initLogoTap();
  }
})();

// ── ACCESO AL PANEL — 5 TOQUES EN "PANEL DE ADMINISTRACIÓN" ──
(function () {
  let bimbaCount = 0,
    bimbaTimer = null;
  function attachBimbaTitle() {
    const el = document.getElementById('admin-title-secret');
    if (!el) return;
    function handleTap(e) {
      e.preventDefault();
      bimbaCount++;
      clearTimeout(bimbaTimer);
      bimbaTimer = setTimeout(() => {
        bimbaCount = 0;
      }, 1500);
      if (bimbaCount >= 5) {
        bimbaCount = 0;
        clearTimeout(bimbaTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso bimba por título');
        secureLockTap();
      }
    }
    el.addEventListener('touchend', handleTap, {
      passive: false
    });
    el.addEventListener('click', function (e) {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      handleTap(e);
    });
  }

  // Intentar al cargar; si el panel aún no existe, esperar al DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBimbaTitle);
  } else {
    attachBimbaTitle();
  }
})();

// ── ACCESO AL PANEL — ESQUINAS ──
// Esquina inferior DERECHA: 5 toques → admin
// Esquina inferior IZQUIERDA: 5 toques → bimba
(function () {
  let adminCount = 0,
    adminTimer = null;
  let bimbaCount = 0,
    bimbaTimer = null;

  // Zona de toque generosa: 80x80px en cada esquina
  const ZONE = 80;
  function handleCornerTouch(e) {
    const t = e.changedTouches[0];
    const fromRight = window.innerWidth - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    const fromLeft = t.clientX;

    // Esquina inferior DERECHA → admin
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
      adminCount++;
      clearTimeout(adminTimer);
      adminTimer = setTimeout(() => {
        adminCount = 0;
      }, 1500);
      if (adminCount >= 5) {
        adminCount = 0;
        clearTimeout(adminTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso por esquina secreta');
        openAdmin();
      }
      return;
    }

    // Esquina inferior IZQUIERDA → ya no se usa para bimba
  }

  // passive:false para poder hacer preventDefault y evitar gestos del sistema iOS
  // También cancelamos touchstart en las esquinas para evitar que iOS salte al inicio
  document.addEventListener('touchstart', function (e) {
    const t = e.touches[0];
    const fromRight = window.innerWidth - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    // Solo esquina inferior derecha (admin) — solo cancela el toque si es exactamente en la zona
    // passive:true para no bloquear el scroll en todo el documento
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
    }
  }, {
    passive: true
  });
  document.addEventListener('touchend', handleCornerTouch, {
    passive: false
  });

  // PC: 5 clicks en esquina inferior derecha → admin
  document.addEventListener('click', function (e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    const fromRight = window.innerWidth - e.clientX;
    const fromBottom = window.innerHeight - e.clientY;
    if (fromRight > ZONE || fromBottom > ZONE) return;
    adminCount++;
    clearTimeout(adminTimer);
    adminTimer = setTimeout(() => {
      adminCount = 0;
    }, 1500);
    if (adminCount >= 5) {
      adminCount = 0;
      openAdmin();
    }
  });
})();

// ── ACCESO BIMBA POR CANDADO ────────────────────────────────────────────────
// El PIN se comprueba en el servidor (bimba-verify.php), nunca en el
// navegador — así no queda ningún hash extraíble en el JS público y el
// límite de intentos es real (no se puede probar offline sin límite).
function secureLockTap() {
  document.getElementById('secure-pin-input').value = '';
  document.getElementById('secure-pin-error').style.display = 'none';
  document.getElementById('secure-pin-modal').style.display = 'block';
  setTimeout(() => document.getElementById('secure-pin-input').focus(), 100);
}
function secureLockCerrar() {
  document.getElementById('secure-pin-modal').style.display = 'none';
}
async function secureLockConfirm() {
  const val = document.getElementById('secure-pin-input').value;
  let ok = false, errMsg = 'Contraseña incorrecta';
  try {
    const res = await fetch('bimba-verify.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: val })
    });
    const data = await res.json();
    ok = !!data.success;
    if (data.error) errMsg = data.error;
  } catch (e) {
    errMsg = 'Error de conexión. Inténtalo de nuevo.';
  }
  if (ok) {
    document.getElementById('secure-pin-modal').style.display = 'none';
    setTimeout(_updateAudioBannerState, 200);
    _adminLoggedIn = true; window._adminLoggedIn = true;
    _cargarDatosEmpleadosPrivados();
    if (window._bimbaTargetEmpleados) {
      window._bimbaTargetEmpleados = false;
      logActivity('👥 Acceso a empleados por bimba');
      // Mostrar sección bimba-empleados directamente
      document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      const _bimbaEmpSec = document.getElementById('admin-bimba-empleados');
      if (_bimbaEmpSec) { _bimbaEmpSec.style.setProperty('display','block','important'); _bimbaEmpSec.classList.add('active'); }
      setTimeout(function(){
        if(typeof bimbaRenderEmpleados==='function') bimbaRenderEmpleados();
      }, 100);
    } else {
      logActivity('🔒 Acceso bimba por candado');
      openStockConfigSecret();
      setTimeout(dcCargar, 300);
      setTimeout(function(){ if(typeof loadVacacionesStatus==='function') loadVacacionesStatus(); }, 400);
    }
    document.getElementById('admin-overlay').classList.add('open');
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
  } else {
    document.getElementById('secure-pin-error').textContent = errMsg;
    document.getElementById('secure-pin-error').style.display = 'block';
    document.getElementById('secure-pin-input').value = '';
    document.getElementById('secure-pin-input').focus();
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

