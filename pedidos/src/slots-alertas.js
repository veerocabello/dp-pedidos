// ── Alerta de slot casi lleno ─────────────────────────────
const _slotAlertSent = {};
async function _checkSlotAlmostFull(slotTime, count, max) {
  if (!slotTime || !max) return;
  const pct = Math.round((count / max) * 100);
  if (pct < 80) return;
  const key = slotTime + '_' + count;
  if (_slotAlertSent[key]) return;
  _slotAlertSent[key] = true;
  try {
    if (typeof emailjs === 'undefined') return;
    emailjs.init('Euum_k_XJdrejjnKj');
    await emailjs.send('service_bil4ri5', 'template_ee4f7sp', {
      slot:  slotTime,
      count: count,
      max:   max,
      pct:   pct
    });
  } catch(e) {}
}

async function closeAdmin() {
  _adminLoggedIn = false; window._adminLoggedIn = false;
  try { if (window.fb_unregisterSession) window.fb_unregisterSession(_SESSION_ID); } catch(e) {}
  // Solo cerrar sesión Firebase si el dispositivo NO es de confianza.
  // Si es de confianza, mantener la sesión activa para no pedir contraseña al reabrir.
  // Comprobar dispositivo de confianza con timeout para no bloquear el cierre
  let trusted = false;
  try {
    trusted = await Promise.race([
      isTrustedDevice(),
      new Promise(resolve => setTimeout(() => resolve(false), 1000))
    ]);
  } catch(e) {}
  if (!trusted && window.fb_adminLogout) window.fb_adminLogout();
  // Reset eye icon to closed state when closing panel
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen = document.querySelector('#admin-login .eye-open');
  const eyeClosed = document.querySelector('#admin-login .eye-closed');
  if (input) input.type = 'password';
  if (eyeOpen) eyeOpen.style.display = 'block';
  if (eyeClosed) eyeClosed.style.display = 'none';
  stopAlertLoop();
  _alertPendingOrders = 0;
  document.getElementById('admin-overlay').classList.remove('open');
  // Resetear estado login/panel para la próxima apertura
  document.getElementById('admin-login').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-error').textContent = '';
  document.getElementById('admin-pwd-input').value = '';
}
// admin-overlay se carga de forma diferida — esperar a que exista
document.addEventListener('adminShellLoaded', function() {
  var overlay = document.getElementById('admin-overlay');
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === this) closeAdmin();
  });
});
async function removeTrustedDevice() {
  const name = getTrustedDeviceName();
  await setTrustedDevice(false);
  const banner = document.getElementById('trusted-device-banner');
  if (banner) banner.style.display = 'none';
  logActivity("\uD83D\uDDD1\uFE0F Dispositivo de confianza eliminado: \"".concat(name, "\""));
}
async function showTrustedBannerIfNeeded() {
  const banner = document.getElementById('trusted-device-banner');
  if (!banner) return;
  if (await isTrustedDevice()) {
    banner.style.display = 'flex';
    const nameEl = document.getElementById('trusted-device-name-display');
    if (nameEl) nameEl.textContent = getTrustedDeviceName();
  } else {
    banner.style.display = 'none';
  }
}
function bimbaGenAdminToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(URL_TOKEN_KEY, token);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken(token).catch(() => {});
  loadUrlTokenUI();
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token admin generado';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaCopyAdminUrl() {
  const token = getUrlToken();
  if (!token) {
    bimbaGenAdminToken();
    return;
  }
  const url = location.origin + location.pathname + '?key=' + token;
  navigator.clipboard.writeText(url).catch(() => {
    const a = document.createElement('textarea');
    a.value = url;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    document.body.removeChild(a);
  });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL admin copiada';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaGenBimbaToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(BIMBA_TOKEN_KEY, token);
  if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(token).catch(() => {});
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token bimba generado';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaCopyBimbaUrl() {
  const token = getBimbaToken();
  if (!token) {
    bimbaGenBimbaToken();
    return;
  }
  const url = location.origin + location.pathname + '?bimba=' + token;
  navigator.clipboard.writeText(url).catch(() => {
    const a = document.createElement('textarea');
    a.value = url;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    document.body.removeChild(a);
  });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL bimba copiada';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function generateUrlToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(18))).map(b => b.toString(36)).join('').slice(0, 24);
  localStorage.setItem(URL_TOKEN_KEY, token);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken(token).catch(() => {});
  loadUrlTokenUI();
  logActivity('🔗 Token URL generado/regenerado');
}
function clearUrlToken() {
  if (!confirm('¿Eliminar el token? Ya no se podrá acceder por URL.')) return;
  localStorage.removeItem(URL_TOKEN_KEY);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken('').catch(() => {});
  loadUrlTokenUI();
  logActivity('🔗 Token URL eliminado');
}
function copyUrlWithToken() {
  const token = getUrlToken();
  if (!token) {
    alert('Primero genera un token');
    return;
  }
  const url = "".concat(location.origin).concat(location.pathname, "?key=").concat(token);
  navigator.clipboard.writeText(url).then(() => {
    const t = document.getElementById('url-token-toast');
    if (t) {
      t.style.display = 'block';
      setTimeout(() => t.style.display = 'none', 2500);
    }
  }).catch(() => {
    prompt('Copia esta URL:', url);
  });
}

// ── EXPORTAR / IMPORTAR CONFIGURACIÓN ──────────────────────────────
function exportarConfig() {
  const backup = {
    version: 1,
    fecha: new Date().toISOString(),
    config: _lsGet(CONFIG_KEY, {}),
    soundConfig: _lsGet(SOUND_KEY, {}),
    autoDelete: localStorage.getItem(AUTODELETE_KEY) || '0',
    ordersOpen: localStorage.getItem(ORDERS_KEY) || 'true',
    ordersMsg: localStorage.getItem(ORDERS_MSG_KEY) || '',
    openLocal: localStorage.getItem(OPEN_KEY) || 'true',
    urlToken: localStorage.getItem(URL_TOKEN_KEY) || '',
    bimbaToken: localStorage.getItem(BIMBA_TOKEN_KEY) || '',
    stockPwd: localStorage.getItem(STOCK_PWD_KEY) || '',
    slotTurnos: _lsGet(SLOT_TURNOS_KEY, null),
    slotMax: localStorage.getItem(SLOT_MAX_KEY) || '4',
    blockedCats: _lsGet(CAT_BLOCK_KEY, []),
    adminPwd: localStorage.getItem(ADMIN_PWD_KEY) || '',
    empresa: localStorage.getItem(EMP_EMPRESA_KEY) || '',
    stockData: _lsGet(STOCK_DATA_KEY, null),
    cif: localStorage.getItem(EMP_CIF_KEY) || ''
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dulcepatata-config-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  logActivity('💾 Configuración exportada');
}
function _lsGet(key, def) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
  } catch {
    return def;
  }
}
function importarConfig(input) {
  const file = input.files[0];
  const errEl = document.getElementById('backup-error');
  if (errEl) errEl.textContent = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.version) throw new Error('Archivo no válido');
      if (backup.config) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(backup.config));
        Object.assign(CONFIG, backup.config);
        if (window.fb_saveConfig) window.fb_saveConfig(backup.config).catch(() => {});
      }
      if (backup.soundConfig) {
        localStorage.setItem(SOUND_KEY, JSON.stringify(backup.soundConfig));
        if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(backup.soundConfig).catch(() => {});
      }
      if (backup.autoDelete !== undefined) {
        localStorage.setItem(AUTODELETE_KEY, backup.autoDelete);
        if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(parseInt(backup.autoDelete) || 0).catch(() => {});
      }
      if (backup.ordersOpen !== undefined) {
        localStorage.setItem(ORDERS_KEY, backup.ordersOpen);
        if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(backup.ordersOpen === 'true' || backup.ordersOpen === true).catch(() => {});
      }
      if (backup.ordersMsg) {
        localStorage.setItem(ORDERS_MSG_KEY, backup.ordersMsg);
        if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(backup.ordersMsg).catch(() => {});
      }
      if (backup.openLocal !== undefined) {
        localStorage.setItem(OPEN_KEY, backup.openLocal);
        if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(backup.openLocal === 'true' || backup.openLocal === true).catch(() => {});
      }
      if (backup.urlToken) {
        localStorage.setItem(URL_TOKEN_KEY, backup.urlToken);
        if (window.fb_saveUrlToken) window.fb_saveUrlToken(backup.urlToken).catch(() => {});
      }
      if (backup.bimbaToken) {
        localStorage.setItem(BIMBA_TOKEN_KEY, backup.bimbaToken);
        if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(backup.bimbaToken).catch(() => {});
      }
      if (backup.stockPwd) {
        localStorage.setItem(STOCK_PWD_KEY, backup.stockPwd);
        if (window.fb_saveStockPwd) window.fb_saveStockPwd(backup.stockPwd).catch(() => {});
      }
      if (backup.slotTurnos) {
        localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(backup.slotTurnos));
        if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(backup.slotTurnos, backup.slotMax || '4').catch(() => {});
      }
      if (backup.slotMax) {
        localStorage.setItem(SLOT_MAX_KEY, backup.slotMax);
        SLOT_MAX = parseInt(backup.slotMax, 10);
      }
      if (backup.blockedCats) {
        localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(backup.blockedCats));
        if (window.fb_saveBlockedCats) window.fb_saveBlockedCats(backup.blockedCats).catch(() => {});
      }
      if (backup.stockData) {
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(backup.stockData));
        if (window.fb_saveStockData) window.fb_saveStockData(backup.stockData).catch(() => {});
      }
      if (backup.empresa !== undefined) {
        localStorage.setItem(EMP_EMPRESA_KEY, backup.empresa);
        if (window.fb_saveEmpresa) window.fb_saveEmpresa(backup.empresa, backup.cif || '').catch(() => {});
      }
      if (backup.cif !== undefined) {
        localStorage.setItem(EMP_CIF_KEY, backup.cif);
      }
      if (backup.adminPwd && isHex64(backup.adminPwd)) {
        localStorage.setItem(ADMIN_PWD_KEY, backup.adminPwd);
        if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(backup.adminPwd).catch(() => {});
      }

      // Refrescar UI
      loadAdminConfig();
      loadUrlTokenUI();
      loadOrdersStatus();
      loadOpenStatus();
      renderMenu();
      showToast('backup-toast');
      logActivity('📥 Configuración importada desde archivo');
    } catch (err) {
      if (errEl) errEl.textContent = '❌ Error al importar: ' + err.message;
    }
    input.value = '';
  };
  reader.readAsText(file);
}
// ───────────────────────────────────────────────────────────────────

function loadUrlTokenUI() {
  const token = getUrlToken();
  const inp = document.getElementById('url-token-display');
  const full = document.getElementById('url-token-full');
  if (!inp) return;
  inp.value = token || '';
  if (full) {
    if (token) {
      const url = "".concat(location.origin).concat(location.pathname, "?key=").concat(token);
      full.textContent = '🔗 ' + url;
    } else {
      full.textContent = 'Sin token activo';
    }
  }
}
let _adminFailedAttempts = 0;
let _adminLockedUntil = 0;
async function checkAdminPwd() {
  var _document$getElementB5;
  const email = (((_document$getElementB5 = document.getElementById('admin-email-input')) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.value) || '').trim();
  const pwd = document.getElementById('admin-pwd-input').value;
  if (!email) {
    document.getElementById('admin-error').textContent = 'Introduce tu email.';
    return;
  }
  if (!pwd) {
    document.getElementById('admin-error').textContent = 'Introduce la contraseña.';
    return;
  }

  // Mostrar estado de carga
  const btn = document.querySelector('.admin-login-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Entrando...';
  }
  document.getElementById('admin-error').textContent = '';
  if (!window.fb_adminLogin) {
    console.log('[fb] checkAdminPwd: fb_adminLogin missing, ready=', window._firebaseAuthReady, 'readyPromise=', !!window._firebaseAuthReadyPromise, 'ensureReady=', !!(window.fb && window.fb.ensureReady));
    if (window.fb && typeof window.fb.ensureReady === 'function') {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      try {
        await Promise.race([window.fb.ensureReady(), new Promise(function (resolve) {
          setTimeout(resolve, 6000);
        })]);
      } catch (err) {
        console.warn('[fb] checkAdminPwd: ensureReady rejected', err);
      }
    } else if (window._firebaseAuthReadyPromise) {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      await Promise.race([window._firebaseAuthReadyPromise, new Promise(function (resolve) {
        setTimeout(resolve, 6000);
      })]);
    }
    if (window.fb_adminLogin) {
      console.log('[fb] checkAdminPwd: fb_adminLogin became available after wait');
      // Reintentar ahora que auth pudo haberse inicializado.
    } else if (window._firebaseAuthReady === false) {
      document.getElementById('admin-error').textContent = 'Firebase Auth aún se está inicializando. Espera unos segundos y vuelve a intentarlo.';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
      return;
    } else {
      document.getElementById('admin-error').textContent = 'Firebase no se ha inicializado correctamente. Recarga la página y revisa la consola.';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
      return;
    }
  }
  // Delay progresivo por intentos fallidos
  const _delays = [0, 0, 5, 15, 30, 60, 180]; // segundos por intento
  const _delaySeconds = _delays[Math.min(_adminFailedAttempts, _delays.length - 1)];
  if (_delaySeconds > 0) {
    const errEl = document.getElementById('admin-error');
    let remaining = _delaySeconds;
    const interval = setInterval(() => {
      remaining--;
      if (errEl) errEl.textContent = '⏳ Demasiados intentos fallidos. Espera ' + remaining + ' segundos...';
      if (remaining <= 0) {
        clearInterval(interval);
        if (errEl) errEl.textContent = '';
      }
    }, 1000);
    if (errEl) errEl.textContent = '⏳ Demasiados intentos fallidos. Espera ' + _delaySeconds + ' segundos...';
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    await new Promise(r => setTimeout(r, _delaySeconds * 1000));
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
  }
  const result = await window.fb_adminLogin(email, pwd);

  // Registrar intento en Firebase con IP
  (async function () {
    var ip = 'desconocida';
    try {
      var ipRes = await Promise.race([fetch('https://api.ipify.org?format=json'), new Promise(function (_, rej) {
        setTimeout(function () {
          rej(new Error('timeout'));
        }, 3000);
      })]);
      var ipData = await ipRes.json();
      ip = ipData.ip || 'desconocida';
    } catch (e) {}
    try {
      if (window.fb_saveLoginLog) {
        await window.fb_saveLoginLog({
          ts: Date.now(),
          fecha: new Date().toLocaleString('es-ES'),
          email: email,
          resultado: result.ok ? '✅ Acceso correcto' : '⛔ Fallo: ' + (result.msg || 'Error'),
          ip: ip,
          dispositivo: navigator.userAgent.slice(0, 120)
        });
        console.log('[loginLog] guardado OK, ip:', ip);
      } else {
        console.warn('[loginLog] fb_saveLoginLog no disponible');
      }
    } catch (e) {
      console.error('[loginLog] error al guardar:', e);
    }
  })();
  if (result.ok) {
    var _document$getElementB6, _document$getElementB7;
    _adminFailedAttempts = 0;
    const trustedChecked = (_document$getElementB6 = document.getElementById('trusted-device-check')) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.checked;
    const trustedName = ((_document$getElementB7 = document.getElementById('trusted-device-name')) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.value.trim()) || 'Sin nombre';
    if (trustedChecked) await setTrustedDevice(true, trustedName);
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
    const audioBanner = document.getElementById('audio-unlock-banner');
    if (audioBanner) audioBanner.style.display = _audioCtxUnlocked ? 'none' : 'block';
    setTimeout(_updateAudioBannerState, 200);
    logActivity('🔑 Acceso con Firebase Auth (' + email + ')' + (trustedChecked ? " \u2014 dispositivo registrado como \"".concat(trustedName, "\"") : ''));
  } else {
    _adminFailedAttempts++;
    const errMsg = result.msg || 'Error al iniciar sesión';
    let errDisplay = errMsg;
    if (_adminFailedAttempts >= 3) {
      const nextDelay = [0,0,0,15,30,60,180][Math.min(_adminFailedAttempts, 6)];
      errDisplay = errMsg + (_adminFailedAttempts >= 3 ? ' (' + _adminFailedAttempts + ' intentos fallidos' + (nextDelay > 0 ? ' — próximo intento bloqueado ' + nextDelay + 's' : '') + ')' : '');
    }
    document.getElementById('admin-error').textContent = errDisplay;
    console.error('[login] Fallo de autenticación:', errMsg, result);
    logActivity('⛔ Intento de acceso fallido (' + email + '): ' + errMsg + ' [intento ' + _adminFailedAttempts + ']');
  }
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

// showAdminSection is defined later with full support

