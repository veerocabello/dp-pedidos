// ── DATOS PRIVADOS DE EMPLEADOS ──────────────────────────────────────
// Empleados y fichajes (PIN, DNI, teléfono, firmas) son datos sensibles.
// Solo se cargan tras un login real (Firebase Auth admin o PIN bimba
// verificado en el servidor) — nunca al abrir la página como visitante.
// Llamar desde checkAdminPwd() (slots-alertas.js) y secureLockConfirm()
// (admin-accesos.js) justo después de confirmar el acceso.
function _cargarDatosEmpleadosPrivados() {
  if (window.fb_loadEmpleados) {
    window.fb_loadEmpleados().then(arr => {
      if (arr && arr.length) {
        localStorage.setItem('dpf_empleados', JSON.stringify(arr));
        if (typeof empRenderAdmin === 'function') empRenderAdmin();
        if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      }
    }).catch(() => {});
  }
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if (typeof empRenderAdmin === 'function') empRenderAdmin();
        if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      }
    }).catch(() => {});
  }
  // El badge de 🔔 Alertas necesita datos frescos del log nada más
  // entrar al panel, sin esperar a que se abra esa pestaña en concreto.
  if (window.fb_loadActivityLog) {
    window.fb_loadActivityLog().then(log => {
      if (log && log.length) localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
      if (typeof updateAlertBadge === 'function') updateAlertBadge();
    }).catch(() => {
      if (typeof updateAlertBadge === 'function') updateAlertBadge();
    });
  } else if (typeof updateAlertBadge === 'function') {
    updateAlertBadge();
  }
  // Tokens de acceso (?bimba=/?key=) y clave de stock: solo se cargan al
  // panel de ajustes DESPUÉS de un login real, para no exponerlos a
  // cualquier visitante. La comprobación de ?bimba=/?key= en sí la hace
  // el servidor (bimba-verify.php), este valor cacheado solo sirve para
  // que la propia admin pueda ver/copiar el enlace desde Ajustes.
  if (window.fb_loadUrlToken) {
    window.fb_loadUrlToken().then(t => {
      if (t) {
        localStorage.setItem(URL_TOKEN_KEY, t);
        if (typeof loadUrlTokenUI === 'function') loadUrlTokenUI();
      }
    }).catch(() => {});
  }
  if (window.fb_loadBimbaToken) {
    window.fb_loadBimbaToken().then(t => {
      if (t) localStorage.setItem(BIMBA_TOKEN_KEY, t);
    }).catch(() => {});
  }
  if (window.fb_loadStockPwd) {
    window.fb_loadStockPwd().then(pwd => {
      if (pwd) localStorage.setItem(STOCK_PWD_KEY, pwd);
    }).catch(() => {});
  }
}

// ── INIT ADMIN DATA ──
loadSavedMenu();
initTabs(); // re-renderizar pestañas con el menú guardado
renderMenu(); // re-renderizar carta con los datos de localStorage
loadConfig();
applyAutoDelete(); // auto-borrado del historial al cargar

// ── INIT: cargar horario desde Firebase antes de evaluar apertura ──
// Esto evita que cuentas/dispositivos nuevos vean "cerrado" por tener localStorage vacío
(function initConHorarioFirebase() {
  function aplicarEstadoInicial() {
    // Horario footer
    try {
      const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
      if (h.manOpen) updateFooterHorario(h);
    } catch {}
    // Dot y estado visual
    if (!isTodayOpen()) {
      updateHeroDot(false);
    } else {
      const open = localStorage.getItem(OPEN_KEY) !== 'false';
      updateHeroDot(open);
    }
    checkAutoCloseWarning();
    loadOrdersStatus();
    // Aplicar banner desde localStorage inmediatamente (antes de Firebase)
    _applyBannerDia(getBannerDia());
    // Cargar banner desde Firebase con delay como seguro para Safari iOS
    // donde firebaseReady puede dispararse tarde o no dispararse
    setTimeout(() => loadBannerDia(), 1500);
    setTimeout(() => loadBannerDia(), 4000);

    // Re-chequeo automático cada minuto: apertura y cierre sin necesidad de refrescar
    // Usa visibilitychange para recrear el intervalo si la PWA volvió de segundo plano
    function _startAutoStatusInterval() {
      if (window._autoStatusInterval) clearInterval(window._autoStatusInterval);
      window._autoStatusInterval = setInterval(() => {
        checkAutoCloseWarning();
        loadOrdersStatus();
        if (typeof renderMenu === 'function') renderMenu();
      }, 60000);
    }
    if (!window._autoStatusInterval) {
      _startAutoStatusInterval();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // La página volvió a primer plano — re-evaluar estado inmediatamente y reiniciar intervalo
          checkAutoCloseWarning();
          loadOrdersStatus();
          if (typeof renderMenu === 'function') renderMenu();
          _startAutoStatusInterval();
        }
      });
    }
  }

  // Si ya hay horario en localStorage, aplicar inmediatamente
  // y luego actualizar desde Firebase en segundo plano
  const horarioLocal = localStorage.getItem(HORARIO_KEY);
  if (horarioLocal) {
    aplicarEstadoInicial();
  }

  // Siempre intentar cargar desde Firebase (fuente de verdad)
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
        updateFooterHorario(hFb);
      }
      // Si no había horario local, este es el primer arranque: aplicar ahora
      if (!horarioLocal) {
        aplicarEstadoInicial();
      } else {
        // Si había horario local, re-evaluar con el horario de Firebase (puede haber cambiado)
        aplicarEstadoInicial();
        checkAutoCloseWarning();
        loadOrdersStatus();
        // Reintento con delay por si el primer render fue antes de que Firebase respondiera
        setTimeout(() => loadOrdersStatus(), 1000);
        setTimeout(() => loadOrdersStatus(), 3000);
      }
    }).catch(() => {
      // Firebase no disponible: usar lo que haya en localStorage
      if (!horarioLocal) aplicarEstadoInicial();
    });
  } else {
    // Firebase no cargado aún: esperar al evento y mientras usar localStorage
    if (!horarioLocal) aplicarEstadoInicial();
    document.addEventListener('firebaseReady', function () {
      // Suprimir warnings de Firebase para no mostrarlos a clientes
      if (window.firebase && window.firebase.database) {
        try {
          window.firebase.database.enableLogging(false);
        } catch (e) {}
      }
      loadBannerDia();
      if (window.fb_loadHorario) {
        window.fb_loadHorario().then(hFb => {
          if (hFb) {
            localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
            updateFooterHorario(hFb);
            checkAutoCloseWarning();
            loadOrdersStatus();
          }
        }).catch(() => {});
      }
      _cargarCriticosDesdeFirebase();
    });
  }

  // Carga inicial de datos críticos desde Firebase (cats, slots, etc.)
  // NOTA DE SEGURIDAD: empleados y fichajes NO se cargan aquí — esta
  // función corre para cualquier visitante. Ver _cargarDatosEmpleadosPrivados().
  function _cargarCriticosDesdeFirebase() {
    if (window.fb_loadBlockedCats) {
      window.fb_loadBlockedCats().then(cats => {
        if (cats) {
          var _document$getElementB33;
          localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
          renderMenu();
          if ((_document$getElementB33 = document.getElementById('admin-pedidos')) !== null && _document$getElementB33 !== void 0 && _document$getElementB33.classList.contains('active')) loadCatBlockUI();
        }
      }).catch(() => {});
    }
    if (window.fb_loadSlotConfig) {
      window.fb_loadSlotConfig().then(cfg => {
        var _document$getElementB34;
        if (!cfg) return;
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max) {
          localStorage.setItem(SLOT_MAX_KEY, cfg.max);
          SLOT_MAX = parseInt(cfg.max, 10);
        }
        renderSlotPicker();
        if ((_document$getElementB34 = document.getElementById('admin-local')) !== null && _document$getElementB34 !== void 0 && _document$getElementB34.classList.contains('active')) loadSlotTurnosUI();
      }).catch(() => {});
    }
    if (window.fb_loadActivityLog) {
      window.fb_loadActivityLog().then(log => {
        if (log && log.length) {
          var _document$getElementB35;
          localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
          if ((_document$getElementB35 = document.getElementById('admin-log')) !== null && _document$getElementB35 !== void 0 && _document$getElementB35.classList.contains('active')) renderActivityLog();
        }
      }).catch(() => {});
    }
    if (window.fb_loadAutoDelete) {
      window.fb_loadAutoDelete().then(days => {
        if (days !== null && days !== undefined) {
          localStorage.setItem(AUTODELETE_KEY, days);
          applyAutoDelete();
          const sel = document.getElementById('autodelete-days');
          if (sel) sel.value = days;
        }
      }).catch(() => {});
    }
    if (window.fb_loadSoundConfig) {
      window.fb_loadSoundConfig().then(cfg => {
        var _document$getElementB36;
        if (!cfg) return;
        localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
        if ((_document$getElementB36 = document.getElementById('admin-local')) !== null && _document$getElementB36 !== void 0 && _document$getElementB36.classList.contains('active')) loadSoundConfigUI();
      }).catch(() => {});
    }
    // CONFIG DEL LOCAL
    if (window.fb_loadConfig) {
      window.fb_loadConfig().then(c => {
        var _document$getElementB37;
        if (!c) return;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
        Object.assign(CONFIG, c);
        if ((_document$getElementB37 = document.getElementById('admin-local')) !== null && _document$getElementB37 !== void 0 && _document$getElementB37.classList.contains('active')) loadAdminConfig();
      }).catch(() => {});
    }
    // ESTADO ABIERTO/CERRADO
    if (window.fb_loadOpenLocal) {
      window.fb_loadOpenLocal().then(val => {
        if (val === null || val === undefined) return;
        localStorage.setItem(OPEN_KEY, String(val));
        updateOpenBtn(val === true || val === 'true');
        updateHeroDot(val === true || val === 'true');
      }).catch(() => {});
    }
    // PEDIDOS ABIERTOS + MENSAJE
    if (window.fb_loadOrdersOpen) {
      window.fb_loadOrdersOpen().then(val => {
        if (val === null) return;
        localStorage.setItem(ORDERS_KEY, val);
        // Solo actualizar UI si el horario no dice que estamos cerrados
        if (!isOutsideHours() && isTodayOpen()) updateOrdersUI(val);
      }).catch(() => {});
    }
    if (window.fb_loadOrdersMsg) {
      window.fb_loadOrdersMsg().then(msg => {
        if (!msg) return;
        localStorage.setItem(ORDERS_MSG_KEY, msg);
        const inp = document.getElementById('orders-pause-msg');
        if (inp) inp.value = msg;
      }).catch(() => {});
    }
    // NOTA DE SEGURIDAD: los tokens de acceso (config/urlToken,
    // config/bimbaToken) y la clave de stock (config/stockPwd) NO se
    // cargan aquí — esta función corre para cualquier visitante, y antes
    // se descargaban a localStorage aunque nadie hubiera iniciado sesión,
    // lo que permitía a cualquier cliente leer su propio localStorage y
    // auto-concederse acceso por ?bimba=/?key=. Ver
    // _cargarDatosEmpleadosPrivados() — la comprobación real de esos
    // tokens ahora la hace el servidor (bimba-verify.php).
    // LISTA DE INGREDIENTES DE STOCK — listener en tiempo real
    if (window.fb_listenStockData) {
      window.fb_listenStockData(data => {
        var _document$getElementB38, _document$getElementB39;
        if (!data) return;
        // Ignorar eco de nuestro propio guardado (menos de 2s)
        if (window._stockDataLocalWrite && Date.now() - window._stockDataLocalWrite < 2000) return;
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
        if ((_document$getElementB38 = document.getElementById('admin-stock-config')) !== null && _document$getElementB38 !== void 0 && _document$getElementB38.classList.contains('active')) loadStockAdminList();
        // Si el overlay de stock está abierto, actualizar la lista también
        if (((_document$getElementB39 = document.getElementById('stock-overlay')) === null || _document$getElementB39 === void 0 ? void 0 : _document$getElementB39.style.display) === 'block') renderStockItems();
      });
    }
    // DATOS EMPRESA (razón social + CIF)
    if (window.fb_loadEmpresa) {
      window.fb_loadEmpresa().then(d => {
        if (!d) return;
        if (d.empresa) localStorage.setItem(EMP_EMPRESA_KEY, d.empresa);
        if (d.cif) localStorage.setItem(EMP_CIF_KEY, d.cif);
        empCargarEmpresaUI();
      }).catch(() => {});
    }
    // CONTRASEÑA ADMIN (sincronizar hash entre dispositivos)
    if (window.fb_loadAdminPwd) {
      window.fb_loadAdminPwd().then(hash => {
        if (hash && isHex64(hash)) localStorage.setItem(ADMIN_PWD_KEY, hash);
      }).catch(() => {});
    }
  }
  if (window._firebaseReady) {
    _cargarCriticosDesdeFirebase();
  } else {
    document.addEventListener('firebaseReady', _cargarCriticosDesdeFirebase);
  }
})();

// ── BANNER PEDIDO ACTIVO ──────────────────────────────────────────────────────
const ACTIVE_ORDER_KEY = 'dpf_active_order';
function _checkActivePedido() {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !data.ts || !data.num) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    const elapsed = Date.now() - data.ts;
    if (elapsed >= getModifyWindowMs()) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    window._lastOrderData = data;
    _showActivePedidoBanner(data, elapsed);
  } catch (e) {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
  }
}
function _showActivePedidoBanner(data, elapsed) {
  if (document.getElementById('_active-order-banner')) return;
  const remaining = Math.max(0, getModifyWindowMs() - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor(remaining % 60000 / 1000);
  const slot = data.slot ? ' - recogida a las ' + data.slot : '';
  const banner = document.createElement('div');
  banner.id = '_active-order-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2000;background:#3D1F0D;color:#FFF8EE;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-family:\'DM Sans\',sans-serif;box-shadow:0 -4px 24px rgba(61,31,13,0.25)';
  banner.innerHTML = '<div style="flex:1;min-width:0">' + '<div style="font-size:13px;font-weight:700">Tienes un pedido activo: ' + data.num + slot + '</div>' + '<div id="_active-order-timer" style="font-size:11px;opacity:0.7;margin-top:2px">Puedes modificarlo durante ' + mins + ':' + String(secs).padStart(2, '0') + ' min</div>' + '</div>' + '<button onclick="modificarPedidoFromBanner()" style="flex-shrink:0;background:#3D1F0D;color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">Modificar</button>' + '<button onclick="_dismissActiveBanner()" style="flex-shrink:0;background:none;border:none;color:rgba(255,248,238,0.6);font-size:22px;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>';
  document.body.appendChild(banner);
  window._activeBannerInterval = setInterval(function () {
    const rem = Math.max(0, getModifyWindowMs() - (Date.now() - data.ts));
    if (rem <= 0) {
      _dismissActiveBanner();
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    const m = Math.floor(rem / 60000);
    const s = Math.floor(rem % 60000 / 1000);
    const el = document.getElementById('_active-order-timer');
    if (el) el.textContent = 'Puedes modificarlo durante ' + m + ':' + String(s).padStart(2, '0') + ' min';
  }, 1000);
}
function _dismissActiveBanner() {
  const b = document.getElementById('_active-order-banner');
  if (b) b.remove();
  if (window._activeBannerInterval) {
    clearInterval(window._activeBannerInterval);
    window._activeBannerInterval = null;
  }
}
function modificarPedidoFromBanner() {
  _dismissActiveBanner();
  const successScreen = document.getElementById('success-screen');
  if (successScreen && successScreen.style.display !== 'block' && window._lastOrderData) {
    const data = window._lastOrderData;
    document.getElementById('order-num-display').textContent = data.num;
    successScreen.style.display = 'block';
    document.querySelector('.order-panel').style.display = 'none';
    _startModifyTimer();
    setTimeout(function () {
      successScreen.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
    return;
  }
  modificarPedido();
}
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(_checkActivePedido, 800);
});

// ── Funciones del modal SMS ─────────────────────────────────
function smsCodeInput(el, n) {
  el.value = el.value.replace(/[^0-9]/g, '');
  if (el.value.length === 1 && n < 4) {
    const next = document.getElementById('sms-code-' + (n + 1));
    if (next) next.focus();
  }
  if (n === 4) {
    // Auto-verificar cuando se rellena el último dígito
    const code = ['1','2','3','4'].map(i => {
      const el2 = document.getElementById('sms-code-' + i);
      return el2 ? el2.value : '';
    }).join('');
    if (code.length === 4) smsVerifyCode();
  }
}

function smsCodeKey(event, n) {
  if (event.key === 'Backspace') {
    const el = document.getElementById('sms-code-' + n);
    if (el && el.value === '' && n > 1) {
      const prev = document.getElementById('sms-code-' + (n - 1));
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }
}

async function smsVerifyCode() {
  const code = ['1','2','3','4'].map(i => {
    const el = document.getElementById('sms-code-' + i);
    return el ? el.value : '';
  }).join('');

  if (code.length < 4) {
    const errEl = document.getElementById('sms-error-msg');
    if (errEl) { errEl.textContent = 'Introduce los 4 dígitos del código.'; errEl.style.display = 'block'; }
    return;
  }

  const btn = document.getElementById('sms-verify-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

  const pendingPhone = window._pendingOrderData ? '+34' + window._pendingOrderData.phoneClean : null;
  if (!pendingPhone) {
    if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    return;
  }

  try {
    const res = await fetch('/verify-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone, code })
    });
    const data = await res.json();
    if (data.verified) {
      await _finalizarPedido();
    } else {
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.textContent = '❌ Código incorrecto. Inténtalo de nuevo.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    }
  } catch (e) {
    console.warn('[SMS] verify error:', e);
    // Fallback: si falla la verificación, dejar pasar igualmente
    await _finalizarPedido();
  }
}

async function smsResendCode() {
  if (!window._pendingOrderData) return;
  const phone = '+34' + window._pendingOrderData.phoneClean;
  try {
    const res = await fetch('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    const errEl = document.getElementById('sms-error-msg');
    if (data.success) {
      if (errEl) { errEl.style.color = '#27855a'; errEl.textContent = '✅ Código reenviado.'; errEl.style.display = 'block'; }
      setTimeout(() => { if (errEl) errEl.style.display = 'none'; }, 3000);
    } else {
      if (errEl) { errEl.style.color = '#c0392b'; errEl.textContent = data.error || 'No se pudo reenviar.'; errEl.style.display = 'block'; }
    }
  } catch (e) {
    console.warn('[SMS] resend error:', e);
  }
}

function smsCancelVerify() {
  window._pendingOrderData = null;
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';
  const btn = document.getElementById('submit-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar pedido →'; }
}


// ── ALERTAS FICHAJE BIMBA ──────────────────────────────────

// ── "TRABAJANDO AHORA" — tarjeta resumen en sección Empleados ──
function _empEstadosFichajeHoy() {
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var ahora = new Date();
  var ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });

  return empleados.map(function(emp) {
    var suyos = fichajesHoy.filter(function(f) { return f.empId === emp.id; })
      .sort(function(a, b) { return (a.horaReal || a.hora).localeCompare(b.horaReal || b.hora); });
    var entradas = suyos.filter(function(f) { return f.tipo === 'entrada'; });
    var salidas = suyos.filter(function(f) { return f.tipo === 'salida'; });
    var ultimaEntrada = entradas.length ? entradas[entradas.length - 1] : null;
    var ultimaSalida = salidas.length ? salidas[salidas.length - 1] : null;

    var estado;
    if (!entradas.length) {
      estado = 'nada';
    } else if (salidas.length) {
      estado = 'salida';
    } else {
      var horaContratoSalida = emp.tarOut || emp.manOut || null;
      if (horaContratoSalida) {
        var parts = horaContratoSalida.split(':').map(Number);
        var salidaMin = parts[0] * 60 + parts[1];
        var diff = ahoraMin - salidaMin;
        if (diff < -12 * 60) diff += 24 * 60;
        estado = diff >= 60 ? 'olvido' : 'entrada';
      } else {
        estado = 'entrada';
      }
    }
    return { emp: emp, estado: estado, entrada: ultimaEntrada, salida: ultimaSalida };
  });
}
function empRenderAdmin() {
  var el = document.getElementById('emp-trabajando-ahora');
  if (!el) return;
  var estados = _empEstadosFichajeHoy();
  if (!estados.length) {
    el.innerHTML = '<div style="color:#8A6A4E">No hay empleados registrados</div>';
    return;
  }
  var labels = {
    entrada: { icon: '🟢', color: '#166534', texto: function(r) { return 'Trabajando desde las ' + (r.entrada ? (r.entrada.horaReal || r.entrada.hora) : '—'); } },
    salida: { icon: '🔵', color: '#0C447C', texto: function(r) { return 'Fichó salida a las ' + (r.salida ? (r.salida.horaReal || r.salida.hora) : '—'); } },
    olvido: { icon: '⚠️', color: '#9a3412', texto: function(r) { return 'Se olvidó fichar salida (entró ' + (r.entrada ? (r.entrada.horaReal || r.entrada.hora) : '—') + ')'; } },
    nada: { icon: '❌', color: '#991b1b', texto: function() { return 'Todavía no ha fichado'; } }
  };
  el.innerHTML = estados.map(function(r) {
    var l = labels[r.estado];
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F5E6C8">'
      + '<span style="font-size:18px">' + l.icon + '</span>'
      + '<div><div style="font-weight:700;color:#2A1506;font-size:13px">' + r.emp.nombre + '</div>'
      + '<div style="font-size:12px;color:' + l.color + '">' + l.texto(r) + '</div></div>'
      + '</div>';
  }).join('');
}
function empRefrescar() {
  var el = document.getElementById('emp-trabajando-ahora');
  if (el) el.innerHTML = '<div style="color:#8A6A4E">Cargando...</div>';
  var p1 = window.fb_loadEmpleados ? window.fb_loadEmpleados().then(function(arr) { if (arr) localStorage.setItem('dpf_empleados', JSON.stringify(arr)); }).catch(function() {}) : Promise.resolve();
  var p2 = window.fb_loadFichajes ? window.fb_loadFichajes().then(function(arr) { if (arr) localStorage.setItem('dpf_fichajes', JSON.stringify(arr)); }).catch(function() {}) : Promise.resolve();
  Promise.all([p1, p2]).then(empRenderAdmin);
}
function bimbaIrAFichajes() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  var sec = document.getElementById('admin-bimba-fichajes');
  if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
  var bf = document.getElementById('bimba-footer-btns');
  if (bf) bf.style.display = 'none';

  // Siempre pedir datos frescos de Firebase antes de renderizar
  var lista = document.getElementById('bimba-fichaje-lista');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:#8A6A4E;text-align:center;padding:16px">⏳ Cargando fichajes...</div>';

  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(function(arr) {
      if (arr && arr.length) localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
      bimbaRenderFichajeLista();
    }).catch(function() {
      bimbaRenderFichajeLista(); // Si falla Firebase, usa localStorage como fallback
    });
  } else {
    bimbaRenderFichajeLista();
  }
}

function bimbaActualizarContadorAlertas() {
  var btn = document.getElementById('bimba-btn-alertas-fichaje');
  if (!btn) return;
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });
  var n = sinFichar.length;
  var desc = document.getElementById('bimba-alertas-desc');
  if (desc) desc.textContent = n > 0 ? n + ' sin fichar todavía' : 'Todo el equipo ha fichado';
}

function bimbaRenderFichajeLista() {
  var lista = document.getElementById('bimba-fichaje-lista');
  if (!lista) return;
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  if (!empleados.length) { lista.innerHTML = '<div style="font-size:13px;color:#8A6A4E">No hay empleados registrados</div>'; return; }

  var today = new Date().toISOString().slice(0, 10);
  var ahora = new Date();
  var ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });

  var html = '';
  empleados.forEach(function(emp) {
    var suyos = fichajesHoy.filter(function(f) { return f.empId === emp.id; })
      .sort(function(a,b) { return (a.horaReal||a.hora).localeCompare(b.horaReal||b.hora); });
    var entradas = suyos.filter(function(f) { return f.tipo === 'entrada'; });
    var salidas  = suyos.filter(function(f) { return f.tipo === 'salida'; });
    var ultimo   = suyos.length ? suyos[suyos.length-1] : null;

    var estado; // 'entrada' | 'salida' | 'olvido' | 'nada'

    if (!entradas.length) {
      estado = 'nada';
    } else if (salidas.length) {
      estado = 'salida';
    } else {
      // Tiene entrada pero no salida — ¿lleva más de 1h desde hora de salida del contrato?
      var horaContratoSalida = emp.tarOut || emp.manOut || null;
      if (horaContratoSalida) {
        var parts = horaContratoSalida.split(':').map(Number);
        var salidaMin = parts[0] * 60 + parts[1];
        // Manejar turno nocturno (salida al día siguiente)
        var diff = ahoraMin - salidaMin;
        if (diff < -12*60) diff += 24*60; // ajuste nocturno
        estado = diff >= 60 ? 'olvido' : 'entrada';
      } else {
        estado = 'entrada';
      }
    }

    var estilos = {
      entrada: { bg:'#f0fdf4', border:'#1D9E75', icon:'🟢', textColor:'#166534', label:'Fichó entrada',     boton:false },
      salida:  { bg:'#eff6ff', border:'#378ADD', icon:'🔵', textColor:'#0C447C', label:'Fichó salida',      boton:false },
      olvido:  { bg:'#fff7ed', border:'#f97316', icon:'⚠️', textColor:'#9a3412', label:'Se olvidó fichar salida', boton:true },
      nada:    { bg:'#fff1f2', border:'#E24B4A', icon:'❌', textColor:'#991b1b', label:'No ha fichado',     boton:true  }
    };
    var s = estilos[estado];

    html += '<div style="background:' + s.bg + ';border-left:4px solid ' + s.border + ';border-radius:0 10px 10px 0;padding:10px 14px;display:flex;align-items:center;justify-content:space-between">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<span style="font-size:22px">' + s.icon + '</span>' +
      '<div><div style="font-size:14px;font-weight:600;color:' + s.textColor + '">' + emp.nombre + '</div>' +
      '<div style="font-size:12px;color:' + s.textColor + ';opacity:0.75">' + s.label + '</div></div></div>';
    if (s.boton) {
      html += '<button onclick="bimbaAvisarEmpleado(\'' + emp.id + '\',\'' + emp.nombre + '\',\'' + (emp.tel || '') + '\',\'' + estado + '\')" style="padding:5px 10px;background:transparent;color:' + s.textColor + ';border:1px solid ' + s.border + ';border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">📱 WhatsApp</button>';
    }
    html += '</div>';
  });
  lista.innerHTML = html;
  bimbaActualizarContadorAlertas();
}

function bimbaAvisarEmpleado(id, nombre, tel, estado) {
  var nombre1 = nombre.split(' ')[0];
  if (tel) {
    var telLimpio = tel.replace(/\D/g, '');
    if (telLimpio.length === 9) telLimpio = '34' + telLimpio;
    var msg = estado === 'olvido'
      ? encodeURIComponent('Hola ' + nombre1 + ', no te olvides de fichar!')
      : encodeURIComponent('Hola ' + nombre1 + ', recuerda fichar!');
    window.open('https://wa.me/' + telLimpio + '?text=' + msg, '_blank');
  } else {
    showToast('bimba-fichaje-toast', '⚠️ ' + nombre1 + ' no tiene teléfono guardado');
  }
}

function bimbaAvisarTodos() {
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });
  if (!sinFichar.length) { showToast('bimba-fichaje-toast', '✅ Todos han fichado'); return; }
  bimbaAlertarTablet();
  showToast('bimba-fichaje-toast', '🔔 Alerta enviada — ' + sinFichar.length + ' sin fichar');
}

function bimbaProbarAlertaTablet() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 150, 300].forEach(function(delay) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay/1000);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay/1000 + 0.3);
      osc.start(ctx.currentTime + delay/1000);
      osc.stop(ctx.currentTime + delay/1000 + 0.3);
    });
  } catch(e) {}
}

function bimbaAlertarTablet() {
  // Guardar alerta en Firebase para que la tablet la detecte
  bimbaProbarAlertaTablet();
  if (firebase && firebase.database) {
    firebase.database().ref('config/tabletAlert').set({ ts: Date.now(), tipo: 'fichaje' }).catch(function() {});
  }
}

function bimbaGuardarFichajeMins() {
  var mins = document.getElementById('bimba-fichaje-mins');
  if (mins) {
    localStorage.setItem('dpf_fichaje_alert_mins', mins.value);
    showToast('bimba-fichaje-toast', '✅ Guardado: avisar a los ' + mins.value + ' min');
  }
}


// ── LISTENER ALERTA TABLET ────────────────────────────────
(function initTabletAlertListener() {
  if (!window.firebase || !firebase.database) return;
  var lastTs = 0;
  firebase.database().ref('config/tabletAlert').on('value', function(sn) {
    if (!sn.exists()) return;
    var data = sn.val();
    var ts = data.ts || 0;
    if (ts <= lastTs) return;
    lastTs = ts;
    // Solo mostrar si llevamos más de 3 segundos en la página (evitar al cargar)
    if (performance.now() < 3000) return;
    // Solo mostrar si el admin está logueado
    if (!window._adminLoggedIn) return;
    // Solo mostrar si el admin está abierto pero NO en panel bimba
    var _ao = document.getElementById('admin-overlay');
    if (!_ao || !_ao.classList.contains('open')) return;
    var _sc = document.getElementById('admin-stock-config');
    if (_sc && _sc.classList.contains('active')) return;
    _mostrarAlertaTablet(data);
  });
})();

function _mostrarAlertaTablet(data) {
  // Sonido
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 200, 400, 600].forEach(function(delay) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime + delay/1000);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay/1000 + 0.4);
      osc.start(ctx.currentTime + delay/1000);
      osc.stop(ctx.currentTime + delay/1000 + 0.4);
    });
  } catch(e) {}

  // Construir lista de no fichados
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });

  var listaHtml = sinFichar.length
    ? sinFichar.map(function(e) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff1f2;border-radius:10px;border:1.5px solid #fecdd3">' +
          '<span style="font-size:16px">❌</span>' +
          '<span style="font-size:14px;font-weight:600;color:#991b1b">' + e.nombre + '</span></div>';
      }).join('')
    : '<div style="font-size:13px;color:#8A6A4E">Sin datos de empleados en este dispositivo</div>';

  // Crear overlay
  var overlay = document.createElement('div');
  overlay.id = 'tablet-alert-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:16px;padding:2rem 2.5rem;text-align:center;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.3)">' +
    '<div style="width:56px;height:56px;background:#fff1f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:28px">🔔</div>' +
    '<div style="font-size:20px;font-weight:700;color:#3D1F0D;margin-bottom:8px">Alerta de fichaje</div>' +
    '<div style="font-size:14px;color:#8A6A4E;margin-bottom:1.5rem">Hay empleados que no han fichado todavía</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:1.5rem">' + listaHtml + '</div>' +
    '<button onclick="var o=document.getElementById(&quot;tablet-alert-overlay&quot;);if(o)o.remove()" style="width:100%;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Entendido</button>' +
    '</div>';

  document.body.appendChild(overlay);
}
