// Arranque que antes vivía en admin-turnos-descuentos.js — reubicado aquí
// (bundle de cliente) al separar el bundle de admin, para que se siga
// ejecutando para cualquier visitante, no solo cuando se abre el panel.
// initCatBlocks() está en nucleo-compartido.js; renderPromos() en la
// parte de admin-config.js que también se quedó ahí.
initCatBlocks();
initTabs();
renderMenu();
renderPromos();
renderCart();

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
      }, 60000);
    }
    if (!window._autoStatusInterval) {
      _startAutoStatusInterval();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // La página volvió a primer plano — re-evaluar estado inmediatamente y reiniciar intervalo
          checkAutoCloseWarning();
          loadOrdersStatus();
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
        // getModifyWindowMs() (antifraude.js) lee su propia clave suelta
        // dpf_modify_window_mins, no CONFIG.modifyWindowMins — sin esto, el
        // tiempo para modificar pedido que se guarda desde el panel admin
        // (Configuración de pedidos) nunca llegaba a los dispositivos de
        // los clientes: cada uno seguía usando el valor por defecto de su
        // propio localStorage, aunque el ajuste sí se hubiera guardado bien
        // en Firebase.
        if (typeof c.modifyWindowMins === 'number' && c.modifyWindowMins >= 1 && c.modifyWindowMins <= 30) {
          localStorage.setItem('dpf_modify_window_mins', c.modifyWindowMins);
        }
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
  }
  if (window._firebaseReady) {
    _cargarCriticosDesdeFirebase();
  } else {
    document.addEventListener('firebaseReady', _cargarCriticosDesdeFirebase);
  }
})();

// ── AVISO DE PROBLEMA DE CONEXIÓN ────────────────────────────────────────────
// _firebaseReady solo confirma que el SDK cargó al principio — si después
// se cae la conexión real (wifi del local, Firebase caído, etc.), la web
// seguía pareciendo normal pero con datos parados (turnos, config de
// gastos, pedidos abiertos/cerrados...) sin ningún aviso. ".info/connected"
// es la señal fiable de la conexión real en cada momento.
(function _iniciarAvisoConexionFirebase() {
  let _conexionPerdidaTimeout = null;
  let _bannerConexionMostrado = false;
  function _mostrarBannerConexion(mostrar) {
    const banner = document.getElementById('firebase-conexion-banner');
    if (!banner) return;
    banner.style.display = mostrar ? 'block' : 'none';
    _bannerConexionMostrado = mostrar;
  }
  function _iniciar() {
    if (!window.fb_listenConnectionState) return;
    window.fb_listenConnectionState(connected => {
      if (connected) {
        if (_conexionPerdidaTimeout) {
          clearTimeout(_conexionPerdidaTimeout);
          _conexionPerdidaTimeout = null;
        }
        if (_bannerConexionMostrado) _mostrarBannerConexion(false);
      } else if (!_conexionPerdidaTimeout) {
        // Margen de unos segundos antes de avisar — un corte breve al
        // cambiar de wifi a datos móviles es normal y no debe alarmar.
        _conexionPerdidaTimeout = setTimeout(() => {
          _conexionPerdidaTimeout = null;
          _mostrarBannerConexion(true);
        }, 6000);
      }
    });
  }
  if (window._firebaseReady) {
    _iniciar();
  } else {
    document.addEventListener('firebaseReady', _iniciar);
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
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('/verify-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone, code })
    }, 8000);
    const data = await res.json();
    // El servidor ahora exige smsToken para aceptar el pedido (ver
    // validarSmsToken en guardar-pedido.php) — sin guardarlo aquí,
    // _finalizarPedido() lo mandaría vacío y el pedido se rechazaría
    // aunque el código fuera correcto.
    if (data.verified && data.smsToken && window._pendingOrderData) {
      window._pendingOrderData.smsToken = data.smsToken;
      await _finalizarPedido();
    } else if (data.verified) {
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.textContent = '❌ Error verificando el teléfono. Inténtalo de nuevo.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    } else {
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.textContent = '❌ ' + (data.error || 'Código incorrecto') + '. Inténtalo de nuevo.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    }
  } catch (e) {
    // Ya no se deja pasar el pedido si esto falla (antes sí, "por si
    // acaso") — el servidor ahora exige el comprobante de verdad, así que
    // dejarlo pasar aquí solo terminaría en un pedido rechazado más
    // adelante con un mensaje más confuso. Mejor decirlo claro ya.
    console.warn('[SMS] verify error:', e);
    const errEl = document.getElementById('sms-error-msg');
    if (errEl) { errEl.textContent = '❌ No se pudo verificar el código (fallo de conexión). Inténtalo de nuevo.'; errEl.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
  }
}

async function smsResendCode() {
  if (!window._pendingOrderData) return;
  const phone = '+34' + window._pendingOrderData.phoneClean;
  try {
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }, 8000);
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


// ── Botón flotante "subir arriba" ── aparece solo tras un scroll notable
// (con tantas categorías en la carta, bajar hasta el final y no tener
// forma rápida de volver arriba era incómodo).
(function () {
  var btn = document.getElementById('back-to-top-fab');
  if (!btn) return;
  var ticking = false;
  function actualizar() {
    if (window.scrollY > 600) btn.classList.add('visible');
    else btn.classList.remove('visible');
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(actualizar);
  }, { passive: true });
})();

// ── Recordar nombre y teléfono entre visitas ──────────────────────
// Se guardan (antifraude.js, justo tras confirmar un pedido) sin caducar,
// y se rellenan solos aquí en la próxima visita — el cliente puede
// editarlos igual si ha cambiado de número o quiere pedir para otra
// persona. Solo se prellena el campo de escritorio: el del cajón móvil
// lo recoge él solo la primera vez que se pinta (ver _syncCartDrawer en
// carrito-checkout.js, que cae al valor de escritorio si el suyo propio
// está vacío).
document.addEventListener('DOMContentLoaded', function () {
  try {
    const nombreGuardado = localStorage.getItem('dpf_cliente_nombre');
    const telGuardado = localStorage.getItem('dpf_cliente_telefono');
    const nameEl = document.getElementById('customer-name');
    const phoneEl = document.getElementById('customer-phone');
    if (nombreGuardado && nameEl && !nameEl.value) nameEl.value = nombreGuardado;
    if (telGuardado && phoneEl && !phoneEl.value) {
      phoneEl.value = telGuardado;
      if (typeof formatPhone === 'function') formatPhone(phoneEl);
    }
  } catch (e) {}
});

// ── Service Worker (PWA) ──────────────────────────────────────────
// Habilita "Añadir a pantalla de inicio" y sirve css/js/img desde caché
// para que cargue más rápido con conexión floja. Ver sw.js para el
// detalle de qué se cachea (nunca HTML, PHP ni Firebase).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('[SW] No se pudo registrar:', err);
    });
  });
}
