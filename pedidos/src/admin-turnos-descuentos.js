// ── GESTIÓN DE TURNOS ADMIN ──
function loadSlotTurnosUI() {
  const turnos = getSlotTurnos();
  const maxVal = getSlotMax();
  // Hay dos campos con el mismo valor en dos sitios distintos del panel
  // (Turnos y Configuración) — los dos se sincronizan aquí para que
  // ninguno se quede mostrando un número antiguo.
  const inp = document.getElementById('slot-max-input');
  if (inp) inp.value = maxVal;
  const inpCfg = document.getElementById('slot-max-input-cfg');
  if (inpCfg) inpCfg.value = maxVal;
  renderSlotTurnosList(turnos);
}
function renderSlotTurnosList(turnos) {
  const list = document.getElementById('slot-turnos-list');
  if (!list) return;
  if (turnos.length === 0) {
    list.innerHTML = '<div style="font-size:13px;color:#8A6A4E;text-align:center;padding:10px">Sin turnos configurados</div>';
    return;
  }
  list.innerHTML = turnos.map((t, i) => "\n    <div style=\"display:flex;align-items:center;flex-wrap:wrap;background:#F4F2EE;border-radius:8px;padding:10px 12px;margin-bottom:8px\">\n      <span style=\"font-size:12px;font-weight:700;color:#8A6A4E;min-width:20px\">".concat(i + 1, ".</span>\n      <label style=\"font-size:12px;color:#8A6A4E\">Desde</label>\n      <input type=\"time\" value=\"").concat(t.start, "\" onchange=\"updateSlotTurno(").concat(i, ",'start',this.value)\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n      <label style=\"font-size:12px;color:#8A6A4E\">Hasta</label>\n      <input type=\"time\" value=\"").concat(t.end, "\" onchange=\"updateSlotTurno(").concat(i, ",'end',this.value)\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n      <label style=\"font-size:12px;color:#8A6A4E\">Cada</label>\n      <select onchange=\"updateSlotTurno(").concat(i, ",'interval',parseInt(this.value))\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n        <option value=\"15\" ").concat(t.interval === 15 ? 'selected' : '', ">15 min</option>\n        <option value=\"20\" ").concat(t.interval === 20 ? 'selected' : '', ">20 min</option>\n        <option value=\"30\" ").concat(!t.interval || t.interval === 30 ? 'selected' : '', ">30 min</option>\n        <option value=\"45\" ").concat(t.interval === 45 ? 'selected' : '', ">45 min</option>\n        <option value=\"60\" ").concat(t.interval === 60 ? 'selected' : '', ">60 min</option>\n      </select>\n      <button onclick=\"removeSlotTurno(").concat(i, ")\"\n        style=\"margin-left:auto;background:#fff;border:1.5px solid #e74c3c;color:#c0392b;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">&#128465;</button>\n    </div>")).join('');
}
// mutatorFn recibe el array de turnos actual (local o el más reciente de
// Firebase, según el intento) y lo modifica in-place. Evita que dos
// ediciones de turnos casi simultáneas (dos dispositivos) se pisen entre
// sí — igual que el resto de escrituras "leer todo, modificar, guardar
// todo" arregladas en esta misma pasada.
function _mutateSlotTurnos(mutatorFn) {
  const turnos = getSlotTurnos();
  mutatorFn(turnos);
  localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(turnos));
  if (window.fb_transactJsonString) {
    window.fb_transactJsonString('config/slotConfig', function (current) {
      const t = current && Array.isArray(current.turnos) ? current.turnos.slice() : [];
      mutatorFn(t);
      return { turnos: t, max: (current && current.max) || getSlotMax() };
    }).catch(e => console.warn('Firebase slotConfig error', e));
  } else if (window.fb_saveSlotConfig) {
    window.fb_saveSlotConfig(turnos, getSlotMax()).catch(e => console.warn('Firebase slotConfig error', e));
  }
  return turnos;
}
function addSlotTurno() {
  const turnos = _mutateSlotTurnos(function (t) {
    t.push({ start: '19:30', end: '23:30', interval: 30 });
  });
  renderSlotTurnosList(turnos);
}
function removeSlotTurno(idx) {
  const turnos = _mutateSlotTurnos(function (t) {
    if (idx < t.length) t.splice(idx, 1);
  });
  renderSlotTurnosList(turnos);
}
function updateSlotTurno(idx, field, value) {
  const localTurnos = getSlotTurnos();
  const original = localTurnos[idx];
  if (original) {
    const next = Object.assign({}, original, { [field]: value });
    // Un turno con inicio y fin iguales queda vacío (0 min) sin avisar — no
    // es el cruce de medianoche normal (end <= start), que sí es válido y
    // ya está contemplado donde se aplican los turnos (carrito-checkout.js).
    if ((field === 'start' || field === 'end') && next.start === next.end) {
      alert('La hora de inicio y la de fin de un turno no pueden ser iguales.');
      renderSlotTurnosList(localTurnos); // revertir el <input> visualmente
      return;
    }
  }
  _mutateSlotTurnos(function (t) {
    // Si la lista que ve esta llamada (tras un posible reintento de la
    // transacción, con la más reciente de otro dispositivo) ya no tiene
    // este turno en la misma posición porque alguien añadió/quitó/reordenó
    // turnos justo antes, se busca por su contenido exacto capturado al
    // pulsar, en vez de fiarse ciegamente del índice — evita modificar en
    // silencio un turno distinto al que el admin tenía delante.
    let target = idx;
    if (original && !(t[idx] && t[idx].start === original.start && t[idx].end === original.end && t[idx].interval === original.interval)) {
      const found = t.findIndex(x => x.start === original.start && x.end === original.end && x.interval === original.interval);
      if (found >= 0) target = found;
    }
    if (t[target]) t[target][field] = value;
  });
}
function saveSlotConfig(inputId) {
  // El panel de Configuración tiene su propio campo (slot-max-input-cfg),
  // aparte del de Turnos (slot-max-input) — antes esto SIEMPRE leía
  // slot-max-input pasara lo que pasara, así que cambiar el número desde
  // Configuración y pulsar Guardar no hacía nada (guardaba el valor del
  // OTRO campo, que ni se molestaba en mostrar el número real). Ahora cada
  // botón dice qué campo es el suyo.
  const maxInp = document.getElementById(inputId || 'slot-max-input');
  const max = parseInt(maxInp ? maxInp.value : '4', 10);
  if (isNaN(max) || max < 1) {
    alert('El número de pedidos por turno debe ser al menos 1');
    return;
  }
  localStorage.setItem(SLOT_MAX_KEY, max);
  SLOT_MAX = max;
  // Refleja el nuevo valor también en el otro campo, para que no se quede
  // mostrando el número antiguo si el admin va a esa otra sección después.
  ['slot-max-input', 'slot-max-input-cfg'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = max;
  });
  const turnosLocal = getSlotTurnos();
  // Transacción real en vez de leer-modificar-guardar sin más — antes, si
  // otro dispositivo acababa de añadir/quitar un turno justo antes de este
  // guardado (que solo cambia el número máximo por turno), se escribía
  // encima con la copia de turnos que este dispositivo tenía en caché,
  // revirtiendo ese cambio ajeno. _mutateSlotTurnos() ya usa este mismo
  // patrón para las demás ediciones de turnos.
  if (window.fb_transactJsonString) {
    window.fb_transactJsonString('config/slotConfig', function (current) {
      const t = current && Array.isArray(current.turnos) ? current.turnos : turnosLocal;
      return { turnos: t, max: max };
    }).catch(e => console.warn('Firebase slotConfig error', e));
  } else if (window.fb_saveSlotConfig) {
    window.fb_saveSlotConfig(turnosLocal, max).catch(e => console.warn('Firebase slotConfig error', e));
  }
  showToast('slot-config-toast');
  logActivity('🕐 Turnos actualizados — ' + turnosLocal.length + ' franjas · max ' + max + ' pedidos/turno');
  renderSlotPicker();
}

// ══════════════════════════════════════════
//  BLOQUEAR CATEGORÍAS — parte de admin (elegir qué se bloquea). Aplicar
//  el bloqueo guardado al cargar la página (getBlockedCats/initCatBlocks)
//  vive en nucleo-compartido.js, porque eso lo necesita cualquier visitante.
// ══════════════════════════════════════════
function saveBlockedCats(cats) {
  localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
  if (window.fb_saveBlockedCats) window.fb_saveBlockedCats(cats).catch(e => console.warn('Firebase blockedCats error', e));
}
function getCatsFromMenu() {
  return [...new Set(MENU.map(i => i.cat))];
}
function loadCatBlockUI() {
  const grid = document.getElementById('cat-block-grid');
  if (!grid) return;
  const blocked = getBlockedCats();
  const cats = getCatsFromMenu();
  grid.innerHTML = cats.map(cat => {
    const isBlocked = blocked.includes(cat);
    return "<button onclick=\"toggleCatBlock('".concat(cat, "')\"\n      style=\"padding:8px 14px;border-radius:99px;border:1.5px solid ").concat(isBlocked ? '#c0392b' : '#F5E6C8', ";\n      background:").concat(isBlocked ? '#fef0f0' : '#FFFFFF', ";color:").concat(isBlocked ? '#c0392b' : '#2A1506', ";\n      font-size:13px;font-weight:").concat(isBlocked ? '700' : '500', ";cursor:pointer;font-family:'DM Sans',sans-serif\">\n      ").concat(isBlocked ? '🚫' : '✅', " ").concat(cat, "\n    </button>");
  }).join('');
}
async function toggleCatBlock(cat) {
  const blocked = getBlockedCats();
  const idx = blocked.indexOf(cat);
  const willBlock = idx < 0;
  if (willBlock) blocked.push(cat); else blocked.splice(idx, 1);
  saveBlockedCats(blocked);

  // Antes esto igualaba item.hidden al estado de la categoría para TODOS
  // sus productos en los dos sentidos — al desbloquear, eso revivía en
  // Firebase productos que el admin había ocultado a mano dentro de esa
  // categoría (ej. "Patatas Trufadas" fuera de temporada): el siguiente
  // guardado de cualquier otro producto detectaba ese hidden:false como
  // un cambio legítimo y lo publicaba. Ahora se recuerda (sincronizado
  // entre dispositivos con la misma transacción atómica que ya usa este
  // archivo para turnos/promos) qué productos de la categoría ya estaban
  // ocultos ANTES de bloquearla, para devolverles su estado real al
  // desbloquear en vez de mostrarlos a todos sin más.
  if (willBlock) {
    const yaOcultosIds = MENU.filter(item => item.cat === cat && item.hidden).map(item => item.id);
    if (window.fb_transactJsonString) {
      window.fb_transactJsonString('config/catBlockPrevHidden', current => {
        const mapa = (current && typeof current === 'object') ? current : {};
        mapa[cat] = yaOcultosIds;
        return mapa;
      }).catch(e => console.warn('[catBlock] no se pudo guardar el estado previo', e));
    }
    MENU.forEach(item => { if (item.cat === cat) item.hidden = true; });
  } else {
    let prevHiddenIds = [];
    if (window.fb_transactJsonString) {
      try {
        await window.fb_transactJsonString('config/catBlockPrevHidden', current => {
          const mapa = (current && typeof current === 'object') ? current : {};
          prevHiddenIds = Array.isArray(mapa[cat]) ? mapa[cat] : [];
          delete mapa[cat];
          return mapa;
        });
      } catch (e) { console.warn('[catBlock] no se pudo leer el estado previo', e); }
    }
    const prevHiddenSet = new Set(prevHiddenIds);
    MENU.forEach(item => { if (item.cat === cat) item.hidden = prevHiddenSet.has(item.id); });
  }

  loadCatBlockUI();
  renderMenu();
  logActivity((willBlock ? '🚫' : '✅') + ' Categoría ' + (willBlock ? 'bloqueada' : 'desbloqueada') + ': ' + cat);
}

// ══════════════════════════════════════════
//  MODO FIN DE NOCHE
// ══════════════════════════════════════════
async function activarFinDeNoche() {
  var _stats, _stats2;
  if (!confirm('¿Cerrar el día? Esto pausará los pedidos, mostrará el resumen y reseteará los turnos.')) return;

  // 1. Pausar pedidos — local + Firebase para que todos los dispositivos se enteren
  localStorage.setItem(OPEN_KEY, 'false');
  localStorage.setItem(ORDERS_KEY, 'false');
  if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
  // Esta pausa es por cierre del día, no por saturación — que la auto-pausa
  // no la "reabra sola" pensando que fue ella quien la puso.
  if (typeof _setAutoPausaEstado === 'function') _setAutoPausaEstado(false, Date.now() + 12 * 60 * 60 * 1000);
  updateOrdersUI(false);

  // 2. Recoger estadísticas del día
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
  const pedidos = ((_stats = stats) === null || _stats === void 0 ? void 0 : _stats.count) || 0;
  const total = ((_stats2 = stats) === null || _stats2 === void 0 || (_stats2 = _stats2.total) === null || _stats2 === void 0 ? void 0 : _stats2.toFixed(2)) || '0.00';
  // Antes esto se quedaba siempre vacío — el HTML de abajo ya estaba
  // preparado para pintar el top 3 con medallas, pero nadie lo rellenaba.
  const topSorted = [];
  if (stats && Array.isArray(stats.orders)) {
    const conteoProductos = {};
    stats.orders.forEach(o => {
      (o.items || []).forEach(it => {
        if (it.isFee || !it.name) return;
        conteoProductos[it.name] = (conteoProductos[it.name] || 0) + (it.qty || 0);
      });
    });
    topSorted.push(...Object.entries(conteoProductos).sort((a, b) => b[1] - a[1]).slice(0, 3));
  }

  // 3. Resetear turnos
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});

  // 3b. Limpiar estados de cocina (nuevo/preparando) para que no persistan al día siguiente
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});

  // 4. Archivar stats en historial y borrar del día activo en Firebase
  if (stats && stats.count > 0) saveToHistorial(stats);
  if (window.fb_saveStats) {
    window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  localStorage.removeItem(STATS_KEY);

  // 4b. Marcar todos los pedidos activos como entregados
  try {
    const _liveOrders = getLiveOrders ? getLiveOrders() : [];
    for (const o of _liveOrders) {
      if (window.fb_setOrderStatus) await window.fb_setOrderStatus(o.num, 'entregado').catch(() => {});
    }
    window._liveOrdersCache = [];
    localStorage.removeItem('dpf_live_orders');
  } catch(e) {}

  // 4c. Limpiar log de actividad
  try {
    const _actKey = typeof ACTIVITY_KEY !== 'undefined' ? ACTIVITY_KEY : 'dpf_activityLog';
    localStorage.removeItem(_actKey);
    if (window.fb_saveActivityLog) await window.fb_saveActivityLog([]).catch(() => {});
  } catch(e) {}

  // 4d. Resetear contador de pedidos del día
  if (window.fb_resetDayCounter) window.fb_resetDayCounter().catch(() => {});

  // 5. Mostrar resumen
  const resumenEl = document.getElementById('fin-noche-resumen');
  if (resumenEl) {
    resumenEl.style.display = 'block';
    resumenEl.innerHTML = '<div style="font-size:15px;font-weight:900;margin-bottom:8px">📊 Resumen del día ' + todayKey + '</div>' + '<div>🧾 Pedidos: <strong>' + pedidos + '</strong></div>' + '<div>💶 Total recaudado: <strong>' + total + ' €</strong></div>' + (topSorted.length ? '<div style="margin-top:6px">🏆 Top productos:<br>' + topSorted.map((e, i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') + ' ' + e[0] + ' (' + e[1] + ')').join('<br>') + '</div>' : '') + '<div style="margin-top:8px;font-size:11px;opacity:.7">Turnos reseteados · Pedidos pausados · Datos archivados ✅</div>';
  }
  logActivity('🌙 Fin de noche activado — ' + pedidos + ' pedidos · ' + total + ' €');
  showToast('local-toast');
}
// Acceso por teclado bimba desactivado — usar URL ?bimba=TOKEN

// (Antes había aquí un sistema de "contraseña de administración" propio,
// con su hash en localStorage/Firebase y un botón "Cambiar contraseña" en
// el panel — se ha quitado por completo: no protegía nada de verdad desde
// que el acceso admin real pasó a Firebase Auth (checkAdminPwd() en
// slots-alertas.js, vía window.fb_adminLogin), así que "cambiar" esa
// contraseña le daba al admin una confirmación falsa de que había
// cambiado algo, sin tocar su credencial real. Ver también admin-config.js
// (changePwd) y admin-shell.html (sección #admin-pwd).)

// ── CÓDIGOS DE DESCUENTO — crear/eliminar/buscar (solo admin). Aplicar un
// código al pedir (dcAplicar/getDiscountAmount/_activeDiscount) vive en
// nucleo-compartido.js, porque eso lo hace cualquier cliente. ──
async function dcCargar() {
  const el = document.getElementById('dc-list');
  if (!el) return;
  if (!window.fb_loadDiscounts) { el.innerHTML = 'Firebase no disponible'; return; }
  const discounts = await window.fb_loadDiscounts().catch(() => ({}));
  // Los códigos RAS-/RUL- los genera juegos.php para cada premio ganado en
  // la Ruleta o el Rasca (origen: 'ruleta'|'rasca') — de un solo uso y
  // caducan solos a las 48h. No son códigos que el admin haya creado a
  // mano, así que no se listan aquí para no ahogar la lista.
  const keys = Object.keys(discounts || {}).filter(code => !discounts[code].origen);
  if (!keys.length) { el.innerHTML = '<span style="color:#8A6A4E">Sin códigos creados</span>'; return; }
  const ahoraMs = Date.now();
  el.innerHTML = keys.map(code => {
    const d = discounts[code];
    const remaining = d.maxUses - (d.uses || 0);
    const caducidadTxt = d.expiraEn
      ? (d.expiraEn < ahoraMs ? ' · <span style="color:#c0392b;font-weight:700">caducado</span>' : ' · caduca ' + new Date(d.expiraEn).toLocaleDateString('es-ES'))
      : '';
    return '<div id="dc-row-' + escapeAttr(code) + '" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap;gap:6px">'
      + '<div><strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;color:#8A6A4E">' + (d.uses||0) + '/' + d.maxUses + ' usos · ' + remaining + ' restantes' + caducidadTxt + '</span></div>'
      + '<button data-code="' + escapeAttr(code) + '" onclick="dcEliminar(this.dataset.code)" style="padding:4px 10px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Eliminar</button>'
      + '</div>';
  }).join('');
}

// Los premios de la Ruleta/Rasca (RAS-/RUL-) no aparecen en la lista de
// arriba, pero siguen guardados en discounts/ con el teléfono con el que
// jugó el cliente — esto permite encontrarlos si el cliente pierde su
// código y llama pidiéndolo.
async function dcBuscarPorTelefono() {
  const el = document.getElementById('dc-buscar-resultado');
  if (!el) return;
  const tel = (document.getElementById('dc-buscar-tel').value || '').replace(/\D/g, '');
  if (!/^\d{9}$/.test(tel)) { el.innerHTML = '<span style="color:#c0392b">Introduce un teléfono válido (9 dígitos)</span>'; return; }
  if (!window.fb_loadDiscounts) { el.innerHTML = 'Firebase no disponible'; return; }
  el.innerHTML = 'Buscando…';
  const discounts = await window.fb_loadDiscounts().catch(() => ({}));
  const ahoraMs = Date.now();
  const codigos = Object.keys(discounts || {}).filter(code => discounts[code].telefono === tel);
  if (!codigos.length) { el.innerHTML = '<span style="color:#8A6A4E">No se encontró ningún código de premio para ese teléfono</span>'; return; }
  el.innerHTML = codigos.map(code => {
    const d = discounts[code];
    const usado = (d.uses || 0) >= d.maxUses;
    const caducado = d.expiraEn && ahoraMs > d.expiraEn;
    let estado = 'disponible', color = '#2e7d32';
    if (usado) { estado = 'ya usado'; color = '#c0392b'; }
    else if (caducado) { estado = 'caducado'; color = '#c0392b'; }
    return '<div style="padding:6px 0;border-bottom:1px solid #F5E6C8">'
      + '<strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;font-weight:700;color:' + color + '">' + estado + '</span>'
      + (d.origen ? ' <span style="font-size:11px;color:#8A6A4E">(' + escapeHtml(d.origen) + ')</span>' : '')
      + '</div>';
  }).join('');
}

async function dcCrear() {
  const code = (document.getElementById('dc-code').value || '').trim().toUpperCase();
  const pct = parseInt(document.getElementById('dc-pct').value);
  const maxUses = parseInt(document.getElementById('dc-uses').value);
  const diasEl = document.getElementById('dc-dias');
  const dias = diasEl && diasEl.value ? parseInt(diasEl.value) : null;
  if (!code) { alert('Introduce un código'); return; }
  if (!pct || pct < 1 || pct > 100) { alert('Introduce un % válido (1-100)'); return; }
  if (!maxUses || maxUses < 1) { alert('Introduce un número de usos'); return; }
  if (dias !== null && (isNaN(dias) || dias < 1)) { alert('Los días de caducidad deben ser 1 o más (o déjalo en blanco)'); return; }
  if (!window.fb_transactNative) { alert('Firebase no disponible'); return; }
  // Aviso previo, no atómico — solo UX para que el admin vea de un vistazo
  // que el código ya existe y pueda cancelar sin más. La protección real
  // pasa por la transacción de abajo, así que da igual si esto queda
  // desfasado entre el aviso y el guardado.
  if (window.fb_loadDiscounts) {
    const existentes = await window.fb_loadDiscounts().catch(() => ({}));
    if (existentes && existentes[code]) {
      const yaExiste = existentes[code];
      if (yaExiste.origen) {
        alert('Ese código ya existe como premio de la Ruleta/Rasca de un cliente — no se puede reutilizar.');
        return;
      }
      if (!confirm('Ya existe un código "' + code + '" (' + (yaExiste.uses || 0) + '/' + yaExiste.maxUses + ' usos). Crearlo de nuevo lo sobrescribe y resetea el contador de usos a 0. ¿Continuar?')) {
        return;
      }
    }
  }
  const datos = { pct, maxUses, uses: 0, createdAt: Date.now() };
  if (dias !== null) datos.expiraEn = Date.now() + dias * 24 * 60 * 60 * 1000;
  // Comprobación real y escritura en UNA sola transacción atómica de
  // Firebase sobre discounts/<code> — antes se leía por separado con
  // fb_loadDiscounts y se escribía después con un jset() plano (fb_saveDiscount),
  // sin nada que impidiera que dos admins creando casi a la vez el mismo
  // código, o un código que justo se generó como premio de la Ruleta/Rasca
  // de un cliente, se pisaran: ninguna de las dos escrituras veía la otra.
  // El mutator de abajo corre dentro de la transacción (Firebase lo
  // reintenta con el valor más reciente del servidor si hace falta) y
  // nunca sobrescribe un premio real de cliente, pase lo que pase con el
  // aviso de arriba.
  const result = await window.fb_transactNative('discounts/' + code, function (current) {
    if (current && current.origen) return; // aborta la transacción: es un premio real, nunca se pisa
    return datos;
  });
  if (!result) {
    alert('No se pudo crear: justo se ha generado ese código como premio de un cliente. Prueba con otro código.');
    return;
  }
  document.getElementById('dc-code').value = '';
  document.getElementById('dc-pct').value = '';
  document.getElementById('dc-uses').value = '';
  if (diasEl) diasEl.value = '';
  logActivity('🎁 Código de descuento creado: ' + code + ' (' + pct + '%, ' + maxUses + ' usos' + (dias !== null ? ', caduca en ' + dias + ' días' : '') + ')');
  dcCargar();
}

async function dcEliminar(code) {
  if (!confirm('¿Eliminar el código ' + code + '?')) return;
  if (window.fb_deleteDiscount) await window.fb_deleteDiscount(code);
  logActivity('🗑️ Código de descuento eliminado: ' + code);
  dcCargar();
}

// ── PROMOCIONES — panel admin (crear/editar/borrar/ocultar). El cliente
// las ve y las añade al carrito desde la carta (promosLoad/renderPromos/
// promoAddToCart, en nucleo-compartido.js — PROMOS_KEY/promosLoad/promosSave
// también viven ahí, se reutilizan aquí tal cual). Igual que la carta y los
// empleados, config/promos se guarda con fb_transactJsonString en vez de un
// set() a pelo, para que dos admins editando promos casi a la vez no se
// pisen el cambio entero.
function bimbaRenderPromos() {
  const el = document.getElementById('bimba-promos-lista');
  if (!el) return;
  const promos = promosLoad();
  if (!promos.length) { el.innerHTML = '<span style="color:#8A6A4E;font-size:13px">Sin promociones creadas todavía</span>'; return; }
  el.innerHTML = promos.map(function(p) {
    const precioTachado = p.precioAntes ? '<span style="text-decoration:line-through;color:#8A6A4E;margin-right:4px">' + parseFloat(p.precioAntes).toFixed(2) + ' €</span>' : '';
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:140px"><strong style="color:#3D1F0D">' + escapeHtml(p.nombre) + '</strong>'
      + ' <span style="font-size:12px;color:#8A6A4E">' + precioTachado + parseFloat(p.precio).toFixed(2) + ' €</span>'
      + (p.visible === false ? ' <span style="font-size:11px;color:#c0392b;font-weight:700">(oculta)</span>' : '') + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoToggleVisible(this.dataset.id)" style="padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;background:' + (p.visible === false ? '#aaa' : '#5ECC76') + ';color:#fff">' + (p.visible === false ? 'Oculta' : 'Visible') + '</button>'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoEditar(this.dataset.id)" style="padding:4px 10px;background:rgba(244,196,48,0.08);color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">✏️ Editar</button>'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoEliminar(this.dataset.id)" style="padding:4px 10px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">🗑️</button>'
      + '</div></div>';
  }).join('');
}

function bimbaPromoNueva() {
  document.getElementById('bimba-promo-edit-id').value = '';
  document.getElementById('bimba-promo-nombre').value = '';
  document.getElementById('bimba-promo-desc').value = '';
  document.getElementById('bimba-promo-precio').value = '';
  document.getElementById('bimba-promo-antes').value = '';
  document.getElementById('bimba-promo-queso').checked = false;
  document.getElementById('bimba-promo-gratinado').checked = false;
  document.getElementById('bimba-promo-nota').checked = false;
  const activaEl = document.getElementById('bimba-promo-activa');
  if (activaEl) activaEl.checked = true;
  document.getElementById('bimba-promo-form').style.display = 'block';
}

function bimbaPromoEditar(id) {
  const p = promosLoad().find(function(x) { return x.id === id; });
  if (!p) return;
  document.getElementById('bimba-promo-edit-id').value = p.id;
  document.getElementById('bimba-promo-nombre').value = p.nombre;
  document.getElementById('bimba-promo-desc').value = p.descripcion || '';
  document.getElementById('bimba-promo-precio').value = p.precio;
  document.getElementById('bimba-promo-antes').value = p.precioAntes || '';
  document.getElementById('bimba-promo-queso').checked = !!p.opcionQueso;
  document.getElementById('bimba-promo-gratinado').checked = !!p.opcionGratinado;
  document.getElementById('bimba-promo-nota').checked = !!p.permiteNota;
  const activaEl = document.getElementById('bimba-promo-activa');
  if (activaEl) activaEl.checked = p.visible !== false;
  document.getElementById('bimba-promo-form').style.display = 'block';
}

async function bimbaGuardarPromo() {
  const idEl = document.getElementById('bimba-promo-edit-id');
  const nombre = (document.getElementById('bimba-promo-nombre').value || '').trim();
  const descripcion = (document.getElementById('bimba-promo-desc').value || '').trim();
  const precio = parseFloat(document.getElementById('bimba-promo-precio').value);
  const antesEl = document.getElementById('bimba-promo-antes');
  const precioAntes = antesEl && antesEl.value !== '' ? parseFloat(antesEl.value) : null;
  const opcionQueso = document.getElementById('bimba-promo-queso').checked;
  const opcionGratinado = document.getElementById('bimba-promo-gratinado').checked;
  const permiteNota = document.getElementById('bimba-promo-nota').checked;
  const activaEl = document.getElementById('bimba-promo-activa');
  const visible = activaEl ? activaEl.checked : true;
  if (!nombre) { alert('Introduce un nombre para la promoción'); return; }
  if (isNaN(precio) || precio < 0) { alert('Introduce un precio válido (0 o más)'); return; }
  if (precioAntes !== null && (isNaN(precioAntes) || precioAntes <= precio)) { alert('El precio tachado debe ser mayor que el precio de la promoción'); return; }
  if (!window.fb_transactJsonString) { alert('Firebase no disponible — no se puede guardar'); return; }
  const id = idEl.value || ('promo_' + Date.now());
  const esNueva = !idEl.value;
  const datosPromo = { id, nombre, descripcion, precio, precioAntes, opcionQueso, opcionGratinado, permiteNota, visible };
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      const idx = arr.findIndex(function(x) { return x.id === id; });
      if (idx >= 0) arr[idx] = datosPromo; else arr.push(datosPromo);
      return arr;
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || [datosPromo]));
    renderPromos();
    bimbaRenderPromos();
    document.getElementById('bimba-promo-form').style.display = 'none';
    logActivity((esNueva ? '🔥 Promoción creada: ' : '✏️ Promoción editada: ') + nombre);
  } catch (e) {
    console.warn('[bimbaGuardarPromo] fallo al guardar en Firebase:', e);
    alert('No se ha podido guardar la promoción (revisa la conexión). Vuelve a intentarlo.');
  }
}

async function bimbaPromoEliminar(id) {
  const p = promosLoad().find(function(x) { return x.id === id; });
  if (!p) return;
  if (!confirm('¿Eliminar la promoción "' + p.nombre + '"? Esto no afecta a los pedidos ya hechos con ella.')) return;
  if (!window.fb_transactJsonString) { alert('Firebase no disponible'); return; }
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      return arr.filter(function(x) { return x.id !== id; });
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || []));
    renderPromos();
    bimbaRenderPromos();
    logActivity('🗑️ Promoción eliminada: ' + p.nombre);
  } catch (e) {
    console.warn('[bimbaPromoEliminar] fallo al eliminar en Firebase:', e);
    alert('No se ha podido eliminar (revisa la conexión).');
  }
}

async function bimbaPromoToggleVisible(id) {
  if (!window.fb_transactJsonString) { alert('Firebase no disponible'); return; }
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      const idx = arr.findIndex(function(x) { return x.id === id; });
      if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], { visible: arr[idx].visible === false });
      return arr;
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || []));
    renderPromos();
    bimbaRenderPromos();
  } catch (e) {
    console.warn('[bimbaPromoToggleVisible] fallo al guardar en Firebase:', e);
    alert('No se ha podido cambiar la visibilidad (revisa la conexión).');
  }
}

// ── OFERTA RELÁMPAGO — panel admin (lanzar/cancelar/ver estado). El
// listener que hace que el cliente vea el banner/precio rebajado en vivo
// (loadOfertaRelampagoFromFirebase) vive en nucleo-compartido.js — ver el
// comentario ahí para el porqué. No hay campo "activa" separado: está
// vigente mientras Date.now() < fin, igual en el cliente (ver
// _actualizarOfertaRelampago en carta.js) y en el servidor
// (comprobarTotalSospechoso en guardar-pedido.php, con su propio reloj) —
// así que cancelarla es simplemente borrar el nodo entero de Firebase, sin
// riesgo de que quede un "activa:true" residual desincronizado del "fin".
let _orTickInterval = null;

function orPoblarSelectorProductos() {
  const cont = document.getElementById('or-producto-lista');
  if (!cont || cont.children.length > 0) return; // ya poblado
  // Solo productos "simples" (cantidad directa en el carrito) — las
  // Patatas Al Gusto/Bomba y los extras se gestionan aparte (custCart/
  // extrasCart) y no pasan por el precio base de MENU al calcular el
  // carrito, así que un descuento aquí no llegaría a reflejarse en ellos.
  const productos = MENU.filter(function (i) {
    return i.id !== 15 && i.id !== 16 && !(typeof ALL_EXTRAS_IDS !== 'undefined' && ALL_EXTRAS_IDS.has(i.id)) && !(typeof CHEDDAR_ID !== 'undefined' && i.id === CHEDDAR_ID) && !(typeof BONIATO_BACON_ID !== 'undefined' && i.id === BONIATO_BACON_ID);
  });
  // Agrupados por categoría (mismo orden en que aparecen en la carta), con
  // una casilla por producto — se puede marcar más de uno a la vez.
  let html = '';
  let lastCat = null;
  productos.forEach(function (p) {
    if (p.cat !== lastCat) {
      lastCat = p.cat;
      html += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin:' + (html ? '10px' : '0') + ' 0 4px">' + p.cat + '</div>';
    }
    html += '<label style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px;color:var(--text);cursor:pointer">'
      + '<input type="checkbox" class="or-producto-check" value="' + p.id + '" style="width:16px;height:16px;flex-shrink:0;accent-color:var(--brown)">'
      + p.name + '</label>';
  });
  cont.innerHTML = html;
}

function orCambiarAlcance() {
  const alcance = document.getElementById('or-alcance').value;
  const prodGroup = document.getElementById('or-producto-group');
  if (prodGroup) prodGroup.style.display = alcance === 'producto' ? 'block' : 'none';
}

function orCambiarDuracion() {
  const sel = document.getElementById('or-duracion').value;
  const custom = document.getElementById('or-duracion-custom');
  if (custom) custom.style.display = sel === 'custom' ? 'inline-block' : 'none';
}

async function orLanzar() {
  const alcance = document.getElementById('or-alcance').value; // 'total' | 'producto'
  const pct = parseInt(document.getElementById('or-pct').value, 10);
  const duracionSel = document.getElementById('or-duracion').value;
  const minutos = duracionSel === 'custom' ? parseInt(document.getElementById('or-duracion-custom').value, 10) : parseInt(duracionSel, 10);
  if (!pct || pct < 1 || pct > 90) { alert('Introduce un % válido (1-90)'); return; }
  if (!minutos || minutos < 1) { alert('Introduce una duración válida (minutos)'); return; }
  let productoIds = null;
  if (alcance === 'producto') {
    productoIds = Array.from(document.querySelectorAll('.or-producto-check:checked')).map(function (c) { return parseInt(c.value, 10); });
    if (!productoIds.length) { alert('Elige al menos un producto'); return; }
  }
  if (!window.fb_saveOfertaRelampago) { alert('Firebase no disponible'); return; }
  // Antes esto sobrescribía sin más una oferta que ya estuviera en marcha
  // (fb_saveOfertaRelampago es un set() del nodo entero) — si esta pestaña
  // u otra sesión de admin (la dueña + un empleado, por ejemplo) lanza una
  // oferta mientras otra sigue corriendo, la primera se descartaba en
  // silencio junto con el tiempo que le quedaba.
  const activaAhora = window._ofertaRelampagoActiva;
  if (activaAhora && typeof _ofertaRelampagoVigente === 'function' && _ofertaRelampagoVigente(activaAhora)) {
    const restante = Math.max(0, Math.round((activaAhora.fin - (typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now())) / 60000));
    if (!confirm('Ya hay una oferta relámpago activa (le quedan ' + restante + ' min). Lanzar esta la reemplaza y pierde el tiempo restante. ¿Continuar?')) return;
  }
  const fin = Date.now() + minutos * 60000;
  const oferta = { tipo: alcance, productoIds, pct, fin };
  await window.fb_saveOfertaRelampago(oferta);
  const destino = alcance === 'producto' ? _orNombresProductos(productoIds) : 'todo el pedido';
  logActivity('⚡ Oferta relámpago lanzada: -' + pct + '% en ' + destino + ' durante ' + minutos + ' min');
  orRenderEstado(oferta);
}

// Nombres legibles de una lista de ids de producto, para el log de
// actividad, el estado del panel admin y el banner del cliente.
function _orNombresProductos(productoIds) {
  const nombres = (productoIds || []).map(function (id) { return (MENU.find(function (m) { return m.id === id; }) || {}).name || '?'; });
  return nombres.join(', ');
}

async function orCancelar() {
  if (!confirm('¿Cancelar la oferta relámpago activa?')) return;
  if (window.fb_saveOfertaRelampago) await window.fb_saveOfertaRelampago(null);
  logActivity('⚡ Oferta relámpago cancelada a mano');
  orRenderEstado(null);
}

// Pinta el propio panel admin (formulario para lanzar una nueva, o el
// estado + cuenta atrás de la que esté activa). Aparte de esto,
// _actualizarOfertaRelampago() en carta.js pinta el banner que ve el
// cliente — ambas se disparan desde el mismo listener de Firebase, ver
// loadOfertaRelampagoFromFirebase() en nucleo-compartido.js.
function orRenderEstado(oferta) {
  const form = document.getElementById('or-form');
  const estadoEl = document.getElementById('or-estado');
  if (!form || !estadoEl) return;
  if (_orTickInterval) { clearInterval(_orTickInterval); _orTickInterval = null; }
  const _ahoraSrv = typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now();
  const vigente = !!(oferta && oferta.fin && _ahoraSrv < oferta.fin);
  if (!vigente) {
    form.style.display = 'block';
    estadoEl.style.display = 'none';
    return;
  }
  form.style.display = 'none';
  estadoEl.style.display = 'block';
  const destino = oferta.tipo === 'producto' ? _orNombresProductos(oferta.productoIds) : 'todo el pedido';
  const pintar = function () {
    const restante = oferta.fin - (typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now());
    if (restante <= 0) { orRenderEstado(null); return; }
    const m = Math.floor(restante / 60000);
    const s = Math.floor((restante % 60000) / 1000);
    const txt = document.getElementById('or-estado-texto');
    if (txt) txt.textContent = '⚡ -' + oferta.pct + '% en ' + destino + ' — acaba en ' + m + ':' + String(s).padStart(2, '0');
  };
  pintar();
  _orTickInterval = setInterval(pintar, 1000);
}
