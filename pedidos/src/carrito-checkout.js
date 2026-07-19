// ── FAB y DRAWER (solo móvil) ──────────────────────────────────────────────
function _updateCartFab(count, total) {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  // No mostrar FAB si estamos en la pantalla de éxito
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  if (count === 0 || successVisible) {
    fab.classList.add('hidden');
  } else {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = count;
    document.getElementById('cart-fab-total').textContent = total.toFixed(2).replace('.', ',') + ' €';
  }
}
function _syncCartDrawer(cartHtml, total) {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  const ordersOpen = getOrdersOpen();
  const feeEnabled = getFeeEnabled();
  const feeAmount = getFeeAmount();
  const feeLabel = getFeeLabel();
  let html = cartHtml;
  if (feeEnabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(feeLabel, "</span><span>").concat(feeAmount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  html += "<div class=\"cart-total\" style=\"display:flex;margin-top:12px\"><span>Total</span><span>".concat(total.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  if (ordersOpen) {
    // Si ya sabemos (en memoria) que hay premio activo para el teléfono actual,
    // lo incluimos directamente en el HTML generado para que sobreviva a
    // cualquier repintado del drawer (renderCart se llama muy a menudo: cada
    // minuto, al volver de segundo plano, al cambiar el carrito, etc.)
    const _telActualDrawer = (document.getElementById('drawer-customer-phone') || {}).value || '';
    const _digitsActualDrawer = _telActualDrawer.replace(/\D/g, '').slice(0, 9);
    const _premioHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div id=\"fidelizacion-premio-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF81 \xA1Tienes una patata gratis disponible! A\xF1ade cualquier patata del men\xFA y se aplicar\xE1 el descuento autom\xE1ticamente al confirmar.</div>"
      : (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === _digitsActualDrawer
        ? "<div id=\"fidelizacion-proximo-sello-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF89 \xA1Este es tu pedido n\xFAmero 10! Al confirmarlo, tu patata gratis estar\xE1 disponible en tu pr\xF3ximo pedido.</div>"
        : '');
    const _recordatorioConfirmarHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div style=\"border-radius:10px;padding:8px 12px;background:#FFF3CD;border:1.5px solid #D9A441;margin-top:14px;margin-bottom:-6px;font-size:11.5px;font-weight:700;color:#5a3e1b\">\uD83C\uDF81 No olvides tu patata gratis antes de confirmar</div>"
      : '';
    html += "\n    <div style=\"margin-top:16px\">\n      <div class=\"form-group\">\n        <label>Tu nombre y apellido *</label>\n        <input type=\"text\" id=\"drawer-customer-name\" placeholder=\"\" maxlength=\"60\" oninput=\"document.getElementById('customer-name').value=this.value\">\n      </div>\n      <div class=\"form-group\">\n        <label>Tel\xE9fono</label>\n        <input type=\"tel\" id=\"drawer-customer-phone\" placeholder=\"\" maxlength=\"11\" value=\"".concat(_telActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"formatPhone(this);document.getElementById('customer-phone').value=this.value\">\n        ").concat(_premioHtml, "\n        <div style=\"border:1.5px solid #F5E6C8;background:#FFF8EE;border-radius:10px;padding:10px 12px;margin-top:8px\">\n          <div style=\"display:flex;align-items:center;gap:8px;margin-bottom:4px\">\n            <span>\uD83D\uDCF1</span>\n            <p style=\"font-size:12px;font-weight:700;color:#3D1F0D;margin:0\">Se verificar\xE1 tu n\xFAmero por SMS</p>\n          </div>\n          <p style=\"font-size:12px;color:#8A6A4E;margin:0 0 4px 4px\">Solo para confirmar el pedido</p>\n          <div style=\"display:flex;align-items:center;gap:6px\">\n            <span>\uD83D\uDD12</span>\n            <p style=\"font-size:12px;color:#8A6A4E;margin:0\">No lo compartimos con nadie</p>\n          </div>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <label>Notas del pedido</label>\n        <textarea id=\"drawer-customer-notes\" placeholder=\"\" maxlength=\"300\" oninput=\"document.getElementById('customer-notes').value=this.value\"></textarea>\n      </div>\n      <div id=\"drawer-slot-picker-group\" style=\"display:none;margin-top:14px\">\n        <label style=\"display:block;font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px\">\uD83D\uDD50 Hora de recogida *</label>\n        <p style=\"font-size:12px;color:#8A6A4E;margin-bottom:10px\">Los pedidos se preparan por turnos. Elige tu hora de recogida:</p>\n        <div id=\"drawer-slot-grid\" style=\"display:grid;grid-template-columns:1fr 1fr\"></div>\n        <div id=\"drawer-slot-error\" style=\"display:none;font-size:12px;color:#c0392b;margin-top:6px;font-weight:600\">\u26A0\uFE0F Por favor elige una hora de recogida</div>\n      </div>\n      ").concat(_recordatorioConfirmarHtml, "\n      <button class=\"submit-btn\" onclick=\"submitOrderFromDrawer()\" style=\"margin-top:8px\">\n        Confirmar pedido \u2192\n      </button>\n    </div>");
  } else {
    const lockedMsg = document.getElementById('cart-locked-detail');
    html += "\n    <div style=\"margin-top:16px;background:#3D1F0D;border-radius:12px;padding:20px 16px;text-align:center\">\n      <div style=\"font-size:32px;margin-bottom:8px\">\uD83D\uDD12</div>\n      <div style=\"font-family:'Playfair Display',serif;font-size:17px;font-weight:900;color:#FFF8EE;margin-bottom:6px\">Pedidos cerrados</div>\n      <div style=\"font-size:13px;color:rgba(255,248,238,0.7);line-height:1.5\">".concat(lockedMsg ? lockedMsg.textContent : '', "</div>\n    </div>");
  }
  drawerBody.innerHTML = html;

  // Sincronizar slot picker en el drawer
  if (ordersOpen) _syncDrawerSlotPicker();

  // Re-pintar aviso de fidelización: innerHTML acaba de destruirlo si existía.
  // Si el teléfono ya está completo (9 dígitos), volvemos a comprobar el premio.
  const drawerPhoneEl = document.getElementById('drawer-customer-phone');
  if (drawerPhoneEl) {
    const digitsNow = drawerPhoneEl.value.replace(/\D/g, '').slice(0, 9);
    if (digitsNow.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
      _comprobarPremioFidelizacion(digitsNow);
    }
  }
}
function openCartDrawer() {
  window._drawerScrollY = window.scrollY;
  document.getElementById('cart-drawer-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Pre-rellenar con datos guardados si los campos están vacíos
  // Pre-rellenar campos del drawer con lo que ya haya en el formulario principal.
  // Así el usuario siempre ve sus datos aunque abra/cierre el drawer varias veces.
  // Se hace con requestAnimationFrame para esperar a que renderCart() genere el DOM.
  requestAnimationFrame(function() {
    var mainName  = document.getElementById('customer-name');
    var mainPhone = document.getElementById('customer-phone');
    var mainNotes = document.getElementById('customer-notes');
    var drawerName  = document.getElementById('drawer-customer-name');
    var drawerPhone = document.getElementById('drawer-customer-phone');
    var drawerNotes = document.getElementById('drawer-customer-notes');
    if (drawerName  && mainName)  drawerName.value  = mainName.value;
    if (drawerPhone && mainPhone) {
      drawerPhone.value = mainPhone.value;
      // Re-comprobar premio de fidelización: el HTML del drawer se reconstruye
      // cada vez que se abre, así que el aviso insertado por formatPhone() se
      // pierde aunque el valor del teléfono se mantenga. Lo regeneramos aquí.
      var digitsSync = drawerPhone.value.replace(/\D/g, '').slice(0, 9);
      if (digitsSync.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
        _comprobarPremioFidelizacion(digitsSync);
      } else {
        try {
          var savedPhone = localStorage.getItem('dpf_customer_phone');
          if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
        } catch {}
      }
    }
    if (drawerNotes && mainNotes) drawerNotes.value = mainNotes.value;
  });
  // Recargar config de slots desde Firebase y luego sincronizar
  if (window.fb_loadSlotConfig) {
    window.fb_loadSlotConfig().then(function (cfg) {
      if (cfg) {
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max) localStorage.setItem(SLOT_MAX_KEY, String(cfg.max));
      }
      renderSlotPicker();
      _syncDrawerSlotPicker();
      loadOrdersStatus();
      checkAutoCloseWarning();
    }).catch(function () {
      renderSlotPicker();
      _syncDrawerSlotPicker();
    });
  } else {
    renderSlotPicker();
    _syncDrawerSlotPicker();
  }
}
function _syncDrawerSlotPicker() {
  const srcGroup = document.getElementById('slot-picker-group');
  const dstGroup = document.getElementById('drawer-slot-picker-group');
  const dstGrid = document.getElementById('drawer-slot-grid');
  if (!srcGroup || !dstGroup || !dstGrid) return;
  const needsSlot = srcGroup.style.display !== 'none';
  dstGroup.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) return;

  // Copiar el grid de slots
  const srcGrid = document.getElementById('slot-grid');
  if (srcGrid) dstGrid.innerHTML = srcGrid.innerHTML;

  // Resaltar el slot seleccionado si ya hay uno
  if (selectedSlot) {
    const btn = dstGrid.querySelector('#slotbtn-' + selectedSlot.replace(':', '-'));
    if (btn) {
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
    }
  }

  // Los botones del drawer llaman a selectSlot igual que los del panel principal
  dstGrid.querySelectorAll('.slot-btn:not([disabled])').forEach(btn => {
    btn.onclick = function () {
      const slot = btn.querySelector('span').textContent;
      selectSlot(slot);
      // Sincronizar selección visual en drawer
      dstGrid.querySelectorAll('.slot-btn').forEach(b => {
        b.classList.remove('slot-selected');
        b.style.background = '';
        b.style.borderColor = '';
        b.style.color = '';
      });
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
      if (document.getElementById('drawer-slot-error')) {
        document.getElementById('drawer-slot-error').style.display = 'none';
      }
    };
  });
}
function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
  window.scrollTo(0, window._drawerScrollY || 0);
  // Si el usuario cierra el drawer sin confirmar, los campos del formulario
  // principal pueden tener valores del drawer que el usuario no ve.
  // Los limpiamos SOLO si el formulario principal está vacío visualmente
  // (es decir, el usuario no había escrito nada en él directamente).
  // La heurística: si el campo principal tiene valor pero el drawer YA NO
  // existe en DOM (se regenera al abrir), sincronizar hacia el principal
  // no tiene sentido — lo más seguro es NO limpiar para no perder lo que
  // el usuario escribió en el drawer antes de cerrarlo.
  // Lo que SÍ hacemos: al ABRIR el drawer, pre-rellenar sus campos con
  // lo que haya en el formulario principal (ver openCartDrawer patch).
}
function submitOrderFromDrawer() {
  var n = document.getElementById('drawer-customer-name');
  var p = document.getElementById('drawer-customer-phone');
  var t = document.getElementById('drawer-customer-notes');
  if (n) document.getElementById('customer-name').value = n.value;
  if (p) document.getElementById('customer-phone').value = p.value;
  if (t) document.getElementById('customer-notes').value = t.value;
  // Guardar slot antes de cerrar
  var slotActual = selectedSlot;
  closeCartDrawer();
  // Restaurar slot por si closeCartDrawer lo resetea
  if (slotActual) selectedSlot = slotActual;
  submitOrder();
}
function removeItem(id) {
  delete cart[id];
  renderMenu();
  renderCart();
}


// ── Seguridad: escapar datos de usuario antes de insertar en innerHTML ──
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Escapa un string para usarlo de forma segura dentro de un atributo onclick="f('VALOR')"
function escapeAttr(str) {
  return escapeHtml(String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

// Si el nombre del producto lleva el emoji 🆕, lo quita y pone en su lugar
// una insignia "Nuevo" en rojo, integrada con la marca (en vez del icono azul de móvil).
function formatNombreConBadgeNuevo(nombre) {
  if (!nombre) return '';
  if (nombre.indexOf('🆕') === -1) return escapeHtml(nombre);
  const limpio = nombre.replace('🆕', '').trim();
  return escapeHtml(limpio) + ' <span style="display:inline-block;font-family:\'Oswald\',sans-serif;font-weight:700;font-size:9px;color:#fff;background:#C0392B;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle">Nuevo</span>';
}

// Genera número de pedido usando contador atómico en Firebase.
// El contador se resetea cada día (clave = fecha de hoy).
// Fallback a aleatorio solo si Firebase no está disponible.
async function generateOrderNumber() {
  // Transacción atómica: reserva el número en Firebase antes de devolverlo.
  // Si dos pedidos llegan a la vez, Firebase garantiza que obtienen números distintos.
  const todayKey = new Date().toISOString().slice(0, 10);
  if (typeof firebase !== 'undefined' && firebase.database) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const rnd = Math.floor(Math.random() * 9000) + 1000;
      const ref = firebase.database().ref('usedOrderNums/' + todayKey + '/' + rnd);
      let reserved = false;
      try {
        await ref.transaction(function(current) {
          if (current === null) { reserved = true; return true; }
          return undefined; // ya existe, abortar
        });
        if (reserved) return 'T' + rnd;
      } catch (e) {
        console.warn('[orderNum] transaction error:', e);
      }
    }
  }
  return 'T' + (Math.floor(Math.random() * 9000) + 1000);
}
function buildTicketText(orderNum, name, phone, notes, slotTime) {
  const tc = getTicketConfig();
  const lines = Object.entries(cart).map(_ref5 => {
    let _ref6 = _slicedToArray(_ref5, 2),
      id = _ref6[0],
      qty = _ref6[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('buildTicketText: producto no encontrado id=' + id);
      return '';
    }
    return "".concat(qty, "x ").concat(item.name, " \u2014 ").concat((item.price * qty).toFixed(2), " \u20AC");
  });
  const custLines = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('buildTicketText: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const details = [...c.sauces, ...c.ingredients].join(', ');
    const extrasStr = [c.extraQueso ? 'Queso' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(' + ');
    return c.qty + 'x ' + item.name + ' [' + details + (extrasStr ? ' + ' + extrasStr : '') + '] — ' + (unitPrice * c.qty).toFixed(2) + ' €';
  });
  const extLines2 = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return "".concat(c.qty, "x ").concat(getExtrasItemLabel(c), " \u2014 ").concat((getExtrasItemPrice(c) * c.qty).toFixed(2), " \u20AC");
  });
  const allLines = [...lines, ...custLines, ...extLines2];
  const total = Object.entries(cart).reduce((s, _ref7) => {
    let _ref8 = _slicedToArray(_ref7, 2),
      id = _ref8[0],
      q = _ref8[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? it.price * q : 0);
  }, 0) + Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it) return s;
    const up = it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + up * c.qty;
  }, 0) + Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const now = new Date().toLocaleString('es-ES');
  const phoneCleanTxt = (phone || '').replace(/\D/g, '');
  const avisoSelloTxt = (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneCleanTxt)
    ? "\n>>> 10\u00BA SELLO COMPLETADO. Avisar: premio disponible pr\u00F3ximo pedido <<<\n"
    : "";
  return "\n============================\n   ".concat(tc.nombre, "\n============================\nPEDIDO: ").concat(orderNum, "\nFecha: ").concat(now, "\n----------------------------\nCLIENTE: ").concat(name, "\n").concat(phone ? "Tel: " + phone : "", "\n----------------------------\nPRODUCTOS:\n").concat(allLines.join('\n'), "\n----------------------------\nTOTAL: ").concat(total.toFixed(2), " \u20AC\n  (").concat(tc.textoPago, ")\n----------------------------\n").concat(slotTime ? "RECOGIDA PATATA: " + slotTime + "h" : "", "\n").concat(notes ? "NOTAS: " + notes : "Sin notas", "\n").concat(avisoSelloTxt, "============================\n  ").trim();
}

// ══════════════════════════════════════════
//  SISTEMA DE TURNOS DE RECOGIDA (DINÁMICO)
// ══════════════════════════════════════════
const SLOT_TURNOS_KEY = 'dpf_slot_turnos';
const SLOT_MAX_KEY = 'dpf_slot_max';

// Turnos por defecto si no hay nada guardado
const DEFAULT_TURNOS = [{
  start: '19:30',
  end: '23:30',
  interval: 30
}];
function getSlotTurnos() {
  try {
    const t = JSON.parse(localStorage.getItem(SLOT_TURNOS_KEY));
    if (Array.isArray(t) && t.length > 0) return t;
  } catch {}
  return DEFAULT_TURNOS;
}
function getSlotMax() {
  return parseInt(localStorage.getItem(SLOT_MAX_KEY) || '4', 10);
}

// Para compatibilidad con código legacy que usa SLOT_MAX directamente
function getSlotMaxVal() {
  return getSlotMax();
}

// Genera lista de todos los slots de todos los turnos activos
function getSlots() {
  const turnos = getSlotTurnos();
  const slots = [];
  turnos.forEach(turno => {
    const _turno$start$split$ma = turno.start.split(':').map(Number),
      _turno$start$split$ma2 = _slicedToArray(_turno$start$split$ma, 2),
      sh = _turno$start$split$ma2[0],
      sm = _turno$start$split$ma2[1];
    let _turno$end$split$map = turno.end.split(':').map(Number),
      _turno$end$split$map2 = _slicedToArray(_turno$end$split$map, 2),
      eh = _turno$end$split$map2[0],
      em = _turno$end$split$map2[1];
    const interval = turno.interval || 30;
    // Si el cierre cruza la medianoche (end <= start), sumar 24h al end
    let endMins = eh * 60 + em;
    const startMins = sh * 60 + sm;
    if (endMins <= startMins) endMins += 1440;
    // Guardia anti-bucle infinito: máximo 96 slots por turno (24h / 15min)
    let count = 0;
    let curMins = startMins;
    while (curMins <= endMins && count < 96) {
      const hh = Math.floor(curMins / 60) % 24;
      const mm = curMins % 60;
      const slot = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      if (!slots.includes(slot)) slots.push(slot);
      curMins += interval;
      count++;
    }
  });
  slots.sort();
  return slots;
}

// Alias para compatibilidad — ahora SLOT_MAX es dinámico
const SLOT_START_H = 19,
  SLOT_START_M = 30; // solo para referencia legacy
const SLOT_END_H = 23,
  SLOT_END_M = 30;
let SLOT_MAX = getSlotMax(); // sincronizado con localStorage

// Lee ocupación de slots guardada en localStorage (por día)
// ── Slots: in-memory cache synced from Firebase ──
let _slotsCache = {}; // { slotTime: count }

function getSlotsData() {
  const todayKey = new Date().toISOString().slice(0, 10);
  // Contar siempre desde pedidos reales (fuente de verdad)
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  const realSlots = {};
  if (stats && stats.date === todayKey) {
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) realSlots[s] = (realSlots[s] || 0) + 1;
    });
  }
  // Usar el máximo entre Firebase y pedidos reales
  // para que un slot nunca quede liberado aunque se cancele un pedido
  if (Object.keys(_slotsCache).length > 0) {
    const merged = Object.assign({}, _slotsCache);
    Object.entries(realSlots).forEach(([slot, count]) => {
      merged[slot] = Math.max(merged[slot] || 0, count);
    });
    return { date: todayKey, slots: merged };
  }
  return { date: todayKey, slots: realSlots };
}
function saveSlotsData(data) {
  _slotsCache = data.slots || {};
  localStorage.setItem(SLOTS_KEY, JSON.stringify(data)); // fallback
}
function getSlotCount(slotTime) {
  // Count from actual orders for accuracy
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (!stats || stats.date !== todayKey) return _slotsCache[slotTime] || 0;
  const slot = slotTime ? slotTime.trim() : slotTime;
  return (stats.orders || []).filter(o => o.slot && o.slot.trim() === slot).length;
}
async function incrementSlot(slotTime) {
  // Update local cache immediately for UI responsiveness
  _slotsCache[slotTime] = (_slotsCache[slotTime] || 0) + 1;
  // Persist to Firebase (atomic increment)
  if (window.fb_incrementSlot) {
    try {
      await window.fb_incrementSlot(slotTime);
    } catch (e) {
      console.warn('Firebase slot error', e);
    }
  } else {
    saveSlotsData(getSlotsData());
  }
}
async function decrementSlot(slotTime) {
  if (!slotTime) return;
  // Update local cache immediately
  _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
  // Persist to Firebase (atomic decrement)
  if (window.fb_decrementSlot) {
    try {
      await window.fb_decrementSlot(slotTime);
    } catch (e) {
      console.warn('Firebase slot decrement error', e);
    }
  } else {
    saveSlotsData(getSlotsData());
  }
}

// ¿El carrito tiene patatas?
function cartHasPatatas() {
  const reg = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && item.cat === 'Patatas';
  });
  const cust = Object.values(custCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  // extrasCart también puede contener patatas completas (con queso/gratinado/
  // ingredientes extra personalizados), no solo complementos sueltos.
  const extras = Object.values(extrasCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  return reg || cust || extras;
}

// ¿El carrito tiene algún producto?
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
}

// ¿Estamos en horario de turnos? Siempre activo — los slots pasados se deshabilitan solos
function isSlotHour() {
  return true;
}

// ¿El slot ya pasó?
// Compara minutos dentro del mismo "día de servicio" (hasta las 06:00 del día siguiente)
// para manejar correctamente turnos que cruzan la medianoche.
function slotIsPast(slotTime) {
  const now = new Date();
  const _slotTime$split$map = slotTime.split(':').map(Number),
    _slotTime$split$map2 = _slicedToArray(_slotTime$split$map, 2),
    sh = _slotTime$split$map2[0],
    sm = _slotTime$split$map2[1];
  // Normalizar al "día de servicio": horas 0-5 se tratan como 24-29
  const SERVICE_DAY_CUTOFF = 6 * 60; // 06:00
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const slotMins = sh * 60 + sm;
  const nowAdj = nowMins < SERVICE_DAY_CUTOFF ? nowMins + 1440 : nowMins;
  const slotAdj = slotMins < SERVICE_DAY_CUTOFF ? slotMins + 1440 : slotMins;
  return nowAdj > slotAdj;
}

// Renderiza el selector de slots en el formulario
function renderSlotPicker() {
  const group = document.getElementById('slot-picker-group');
  if (!group) return;
  const needsSlot = cartHasAnyItem() && isSlotHour();
  group.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) {
    return;
  }
  const slots = getSlots();
  const slotsData = getSlotsData();
  const slotMax = getSlotMax();
  let html = '';
  // Calcular plazas extra absorbidas: SOLO del slot inmediatamente anterior
  const extraPlazas = {};
  slots.forEach((slot, i) => {
    if (i === 0) return;
    const prevSlot = slots[i - 1];
    const prevCount = slotsData.slots[prevSlot] || 0;
    const prevPast = slotIsPast(prevSlot);
    const currPast = slotIsPast(slot);
    // Solo transferir si: el anterior ya pasó Y el actual aún no ha pasado
    if (prevPast && !currPast) {
      const sobrantes = Math.max(0, slotMax - prevCount);
      if (sobrantes > 0) extraPlazas[slot] = sobrantes;
    }
  });
  slots.forEach(slot => {
    const count = slotsData.slots[slot] || 0;
    const extra = extraPlazas[slot] || 0;
    const effectiveMax = slotMax + extra;
    const full = count >= effectiveMax;
    const almostFull = !full && count === effectiveMax - 1;
    const past = slotIsPast(slot);
    const disabled = full || past;
    const pct = Math.min(100, Math.round(count / effectiveMax * 100));
    const color = full ? '#e74c3c' : almostFull ? '#e74c3c' : pct >= 50 ? '#3D1F0D' : '#5ECC76';
    const libres = effectiveMax - count;
    const availableLabel = full ? '❌ Completo' : past ? 'Pasado' : almostFull ? '⚠️ ¡Solo queda 1!' : libres + ' libre' + (libres !== 1 ? 's' : '') + (extra > 0 ? ' (+' + extra + ')' : '');
    const nowMs = new Date();
    const nowMinsSlot = nowMs.getHours() * 60 + nowMs.getMinutes();
    const _slot$split$map = slot.split(':').map(Number),
      _slot$split$map2 = _slicedToArray(_slot$split$map, 2),
      slotH = _slot$split$map2[0],
      slotM = _slot$split$map2[1];
    const slotTotalMins = slotH * 60 + slotM;
    const isLateSlot = !disabled && slotTotalMins - nowMinsSlot <= 5;
    const btnBg = disabled ? 'background:#f5f5f5;border-color:#ccc;' : isLateSlot ? 'background:#fffbe6;border-color:#f0c040;' : full ? 'background:#fff0f0;border-color:#e74c3c;' : pct >= 75 ? 'background:rgba(244,196,48,0.08);border-color:#3D1F0D;' : 'background:#FFF8EE;border-color:#E8D5B0;';
    html += '<button type="button"' + ' class="slot-btn ' + (disabled ? 'slot-disabled' : '') + '"' + ' id="slotbtn-' + slot.replace(':', '-') + '"' + ' onclick="' + (disabled ? '' : 'selectSlot(\'' + slot + '\')') + '"' + (disabled ? ' disabled' : '') + ' style="' + btnBg + '"' + ' title="' + (full ? 'Turno completo' : past ? 'Hora pasada' : count + '/' + slotMax + ' plazas') + '">' + '<span style="font-size:17px;font-weight:900">' + slot + '</span>' + (isLateSlot ? '<span style="font-size:10px;font-weight:700;color:#b45a00">⚠️ cierre del turno</span>' : '') + '<span style="font-size:13px;color:' + (disabled ? '#aaa' : color) + ';font-weight:600">' + availableLabel + '</span>' + (almostFull ? '<span style="font-size:10px;color:#c0392b;font-weight:700;margin-top:2px">¡Solo queda 1 pedido disponible en esta franja!</span>' : '') + '<div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">' + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:99px;transition:width .3s"></div></div>' + '</button>';
  });
  document.getElementById('slot-grid').innerHTML = html;
}
let selectedSlot = null;
function selectSlot(slot) {
  selectedSlot = slot;
  document.getElementById('slot-error').style.display = 'none';
  document.querySelectorAll('.slot-btn').forEach(b => {
    b.classList.remove('slot-selected');
    b.style.background = '';
    b.style.borderColor = '';
    b.style.color = '';
  });
  const btn = document.getElementById('slotbtn-' + slot.replace(':', '-'));
  if (btn) {
    btn.classList.add('slot-selected');
    btn.style.background = '#3D1F0D';
    btn.style.borderColor = '#3D1F0D';
    btn.style.color = '#fff';
  }

  // Aviso franja poco margen ahora es inline en el botón
}
async function submitOrder() {
  const name = document.getElementById("customer-name").value.trim();
  if (!name) {
    showAlert("Por favor escribe tu nombre");
    return;
  }
  if (name.length > 60) {
    showAlert("El nombre es demasiado largo (máximo 60 caracteres)");
    return;
  }
  if (Object.keys(cart).length === 0 && Object.values(custCart).filter(c => c.qty > 0).length === 0 && Object.values(extrasCart).filter(c => c.qty > 0).length === 0) {
    showAlert("El pedido está vacío");
    return;
  }

  // Validar teléfono
  const phone = document.getElementById("customer-phone").value.trim();
  const phoneClean = phone.replace(/[\s\-().+]/g, '');
  if (!phone) {
    showAlert("Por favor escribe tu teléfono");
    return;
  }
  if (!/^\d{9}$/.test(phoneClean)) {
    showAlert("El teléfono debe tener exactamente 9 dígitos");
    return;
  }
  // Prefijo válido español: móviles 6/7, fijos 8/9 — excluye 800/900/901/902 y similares
  if (!/^[6789]/.test(phoneClean)) {
    showAlert("El teléfono no parece válido. Debe empezar por 6, 7, 8 o 9");
    return;
  }
  // Excluir numeración especial: 800, 900, 901, 902, 803, 806, 807
  if (/^(800|900|901|902|803|806|807)/.test(phoneClean)) {
    showAlert("No se admiten números de tarificación especial");
    return;
  }
  // Detectar números absurdos: todos iguales, secuencias obvias
  const _absurdos = ['000000000', '111111111', '222222222', '333333333', '444444444', '555555555', '666666666', '777777777', '888888888', '999999999', '123456789', '987654321', '600000000', '700000000', '612345678'];
  if (_absurdos.includes(phoneClean)) {
    showAlert("El teléfono introducido no parece real. Por favor usa tu número real");
    return;
  }
  // Detectar repetición: 7+ dígitos iguales consecutivos (ej. 611111111, 699999999)
  if (/(\d)\1{6,}/.test(phoneClean)) {
    showAlert("El teléfono introducido no parece real. Por favor usa tu número real");
    return;
  }

  // ── Honeypot anti-bots: si el campo oculto está relleno, es un bot
  const hp = document.getElementById('hp-website');
  if (hp && hp.value.trim()) {
    btn.disabled = true;
    btn.textContent = 'Enviando pedido…';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Confirmar pedido';
    }, 2000);
    return;
  }

  // ── Blacklist: teléfono bloqueado (local + Firebase)
  const blacklist = getBlacklist();
  if (blacklist.includes(phoneClean)) {
    showAlert('No es posible realizar pedidos desde este número de teléfono.');
    return;
  }
  // Verificar blacklist en Firebase (fuente de verdad — no bypasseable desde localStorage)
  if (window.fb_loadBlacklist) {
    try {
      const fbBlacklist = await window.fb_loadBlacklist();
      if (fbBlacklist && fbBlacklist.includes(phoneClean)) {
        // Sincronizar también al localStorage para futuras consultas offline
        saveBlacklistLocal(fbBlacklist);
        showAlert('No es posible realizar pedidos desde este número de teléfono.');
        return;
      }
    } catch (e) {
      // Si Firebase falla, continúa con la comprobación local ya hecha arriba
      console.warn('[antispam] Firebase blacklist check failed, usando caché local:', e);
    }
  }

  // ── Cooldown + límite diario (verificación contra Firebase — no bypasseable)
  if (window.fb_getPhoneLog) {
    try {
      const cfg = getAntiSpamCfg();
      const log = await window.fb_getPhoneLog(phoneClean);
      if (log) {
        // Límite diario
        if (cfg.dailyLimit > 0 && (log.count || 0) >= cfg.dailyLimit) {
          showAlert('Has alcanzado el límite de pedidos para hoy. Inténtalo mañana.');
          return;
        }
        // Cooldown: comprobar el último timestamp
        const now = Date.now();
        const cooldownMs = cfg.cooldown * 60 * 1000;
        const lastTs = log.timestamps && log.timestamps.length
          ? Math.max(...log.timestamps)
          : 0;
        if (lastTs && now - lastTs < cooldownMs) {
          const remaining = Math.ceil((cooldownMs - (now - lastTs)) / 60000);
          showAlert('Debes esperar ' + remaining + ' minuto' + (remaining !== 1 ? 's' : '') + ' antes de hacer otro pedido.');
          return;
        }
      }
    } catch (e) {
      console.warn('[antispam] Firebase phone log check failed:', e);
    }
  }

  // Validar slot si aplica
  const needsSlot = cartHasAnyItem() && isSlotHour();
  if (needsSlot && !selectedSlot) {
    document.getElementById('slot-error').style.display = 'block';
    document.getElementById('slot-picker-group').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    return;
  }
  // Revalidar capacidad usando Firebase para evitar race condition entre dispositivos
  if (needsSlot) {
    let liveCount = getSlotCount(selectedSlot); // valor local como fallback
    if (window.fb_getSlotCount) {
      try {
        liveCount = await window.fb_getSlotCount(selectedSlot);
      } catch (e) {
        console.warn('Firebase slot check error', e);
      }
    }
    if (liveCount >= getSlotMax()) {
      showAlert("El turno de las ".concat(selectedSlot, " se ha llenado justo ahora. Por favor elige otro."));
      selectedSlot = null;
      renderSlotPicker();
      return;
    }
  }
  const notes = document.getElementById("customer-notes").value.trim();
  if (notes.length > 300) {
    showAlert("La nota del pedido es demasiado larga (máximo 300 caracteres)");
    return;
  }
  const orderNum = await generateOrderNumber();
  const regularTotal = Object.entries(cart).reduce((s, _ref9) => {
    let _ref0 = _slicedToArray(_ref9, 2),
      id = _ref0[0],
      q = _ref0[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? it.price * q : 0);
  }, 0);
  const custTotal = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return s;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + unitPrice * c.qty;
  }, 0);
  const extTotal = Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const subTotal = regularTotal + custTotal + extTotal;
  const feeEnabled = getFeeEnabled();
  const feeAmount = feeEnabled ? getFeeAmount() : 0;
  const feeLabel = getFeeLabel();
  const _discountAmt = getDiscountAmount(subTotal);
  // Premio de fidelización: si hay premio activo para este teléfono y el
  // carrito incluye al menos 1 patata, se descuenta el precio de la patata
  // más cara del carrito (la de mayor valor, en beneficio del cliente).
  let _fidelizacionDescuento = 0;
  if (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean) {
    const preciosPatatasRegular = Object.entries(cart).map(([id, q]) => {
      const it = MENU.find(m => m.id == id);
      return it && typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata') && q > 0 ? it.price : 0;
    });
    const preciosPatatasCustom = Object.values(custCart).map(c => {
      const it = MENU.find(m => m.id == c.menuId);
      if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
      return it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    });
    const preciosPatatasExtras = Object.values(extrasCart).map(c => {
      const it = MENU.find(m => m.id == c.menuId);
      if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
      return getExtrasItemPrice(c);
    });
    const todosLosPrecios = [...preciosPatatasRegular, ...preciosPatatasCustom, ...preciosPatatasExtras];
    _fidelizacionDescuento = todosLosPrecios.length ? Math.max(...todosLosPrecios) : 0;
  }
  const orderTotal = Math.max(0, subTotal + feeAmount - _discountAmt - _fidelizacionDescuento);
  const regularItems = Object.entries(cart).map(_ref1 => {
    let _ref10 = _slicedToArray(_ref1, 2),
      id = _ref10[0],
      qty = _ref10[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('submitOrder: producto no encontrado id=' + id);
      return null;
    }
    return {
      name: item.name,
      qty,
      subtotal: item.price * qty
    };
  }).filter(Boolean);
  const custItems = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return null;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    // Queso Mozzarella siempre al final (puede venir de ingredientes o como extra)
    const ingsWithoutQueso = c.ingredients.filter(i => i !== 'Queso Mozzarella' && i !== '4 Quesos');
    const quesosFromIng = c.ingredients.filter(i => i === 'Queso Mozzarella' || i === '4 Quesos');
    const extras = [...c.sauces, ...ingsWithoutQueso];
    // Añadir quesos al final
    quesosFromIng.forEach(q => extras.push(q));
    if (c.extraQueso) extras.push('Queso Mozzarella +1€');
    if (c.extraGratinado) extras.push('Gratinado +0,50€');
    return {
      name: item.name,
      qty: c.qty,
      subtotal: unitPrice * c.qty,
      extras
    };
  }).filter(Boolean);
  const extItems = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return {
      name: getExtrasItemLabel(c),
      qty: c.qty,
      subtotal: getExtrasItemPrice(c) * c.qty
    };
  });
  const feeItems = feeEnabled ? [{
    name: feeLabel,
    qty: 1,
    subtotal: feeAmount,
    isFee: true
  }] : [];
  const fidelizacionItems = _fidelizacionDescuento > 0 ? [{
    name: '🎁 Premio fidelización (patata gratis)',
    qty: 1,
    subtotal: -_fidelizacionDescuento
  }] : [];
  // Si este pedido es el que completa el ciclo de 10 sellos, añadimos una
  // línea informativa en el ticket (sin afectar al precio) para que se
  // imprima y se vea en cocina/caja que hay que avisar al cliente.
  const _completaSelloEsteTicket = !!(window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneClean);
  const fidelizacionAvisoItems = _completaSelloEsteTicket ? [{
    name: '🎉 ¡10º SELLO COMPLETADO! Avisar: premio disponible próximo pedido',
    qty: 1,
    subtotal: 0
  }] : [];
  const orderItems = [...regularItems, ...custItems, ...extItems, ...feeItems, ...fidelizacionItems, ...fidelizacionAvisoItems];
  const now = new Date().toLocaleString('es-ES');

  // Datos estructurados del ticket (para impresión HTML)
  const ticketData = {
    orderNum,
    name,
    phone,
    notes,
    slotTime: selectedSlot || null,
    items: orderItems,
    total: orderTotal,
    time: now
  };
  _lastTicketData = ticketData;
  window._pendingTicketData = ticketData;

  // Texto plano para el email (se mantiene igual)
  const ticketText = buildTicketText(orderNum, name, phone, notes, selectedSlot);
  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Enviando pedido…";

  // ── Enviar por EmailJS ── (fallo no bloquea el pedido)
  if (typeof emailjs !== "undefined") {
    emailjs.init(CONFIG.emailjs_public_key);
    try {
      await emailjs.send(CONFIG.emailjs_service_id, CONFIG.emailjs_template_id, {
        to_email: CONFIG.store_email,
        order_num: orderNum,
        customer: name,
        phone: phone || "–",
        notes: notes || "–",
        ticket: ticketText,
        pickup_time: needsSlot ? selectedSlot : "–",
        total: orderTotal.toFixed(2) + " €"
      });
    } catch (err) {
      console.error("EmailJS error:", err);
      logActivity("⚠️ Email de confirmación NO enviado — pedido " + orderNum + " — " + (err && err.text || err && err.message || "error desconocido"));
    }
  } else {
    console.warn("EmailJS no cargado — email omitido");
  }
  // Registrar uso del código de descuento
  if (_activeDiscount && window.fb_incrementDiscountUse) {
    window.fb_incrementDiscountUse(_activeDiscount.code).catch(() => {});
    _activeDiscount = null;
    const dcInput = document.getElementById('discount-input');
    const dcFeedback = document.getElementById('discount-feedback');
    if (dcInput) dcInput.value = '';
    if (dcFeedback) dcFeedback.textContent = '';
  }
  // ── Verificación SMS ──────────────────────────────────────
  // Guardar datos del pedido pendiente hasta que se verifique el teléfono
  window._pendingOrderData = {
    orderNum,
    slotTime: needsSlot ? selectedSlot : null,
    phone,
    phoneClean,
    ticketData: ticketData
  };

  // Teléfonos de prueba que saltan la verificación SMS
  const TEST_PHONES = ['635353724'];
  if (window._skipSmsVerification || TEST_PHONES.includes(phoneClean)) {
    btn.disabled = false;
    btn.textContent = 'Confirmar pedido →';
    await _finalizarPedido();
    return;
  }

  // Intentar enviar SMS de verificación
  let smsOk = false;
  try {
    const smsRes = await fetch('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + phoneClean })
    });
    const smsData = await smsRes.json();
    if (smsData.success) {
      smsOk = true;
    } else {
      console.warn('[SMS] send-code error:', smsData.error);
    }
  } catch (e) {
    console.warn('[SMS] fetch error:', e);
  }

  btn.disabled = false;
  btn.textContent = 'Confirmar pedido →';

  if (smsOk) {
    // Mostrar modal de verificación SMS
    const modal = document.getElementById('sms-verify-modal');
    const txt = document.getElementById('sms-verify-text');
    if (modal) {
      if (txt) txt.textContent = 'Te hemos enviado un código de 4 dígitos al ' + phone + '.';
      // Limpiar inputs anteriores
      ['sms-code-1','sms-code-2','sms-code-3','sms-code-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      modal.style.display = 'flex';
      const firstInput = document.getElementById('sms-code-1');
      if (firstInput) firstInput.focus();
    }
  } else {
    // Si falla el SMS, dejar pasar el pedido igualmente (fallback)
    console.warn('[SMS] No se pudo enviar SMS, completando pedido sin verificación');
    await _finalizarPedido();
  }
  return; // El pedido se finaliza desde smsVerifyCode()
}

// ── Finalizar pedido tras verificación SMS ──────────────────
async function _finalizarPedido() {
  if (!window._pendingOrderData) return;
  const { orderNum, slotTime, phone, phoneClean, ticketData: _ticketDataParaFidelizacion } = window._pendingOrderData;
  try { if (phoneClean) localStorage.setItem('dpf_customer_phone', phoneClean); } catch {}
  window._pendingOrderData = null;

  // Cerrar modal SMS si está abierto
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';

  // Guardar ticket completo en Firebase para impresión
  if (window.fb_saveTicket && window._pendingTicketData) {
    console.log('💾 Guardando ticket en Firebase:', orderNum);
    window.fb_saveTicket(orderNum, window._pendingTicketData)
      .then(() => { console.log('✅ Ticket guardado'); window._pendingTicketData = null; })
      .catch((e) => {
        console.error('❌ Error guardando ticket:', e);
        logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó en Firebase — ' + (e && e.message || 'error desconocido'));
      });
  } else {
    console.warn('⚠️ fb_saveTicket no disponible o _pendingTicketData vacío', !!window.fb_saveTicket, !!window._pendingTicketData);
  }

  await showSuccess(orderNum, slotTime);
  // Registrar teléfono en Firebase para cooldown/límite diario server-side
  if (window.fb_logPhoneOrder && phone) {
    window.fb_logPhoneOrder(phoneClean, Date.now()).catch(() => {});
  }
  // Programa de fidelización: sumar sello si el pedido incluye al menos 1 patata
  const _consumioPremioFidelizacion = window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean;
  _procesarSelloFidelizacion(phoneClean, _ticketDataParaFidelizacion, _consumioPremioFidelizacion).catch(e => console.warn('[fidelizacion] error:', e));
  window._fidelizacionPremioActivo = null;
  _ocultarAvisoPremioFidelizacion();
}

// ── PROGRAMA DE FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META = 10;
function _ticketTienePatata(ticketData) {
  if (!ticketData || !Array.isArray(ticketData.items)) return false;
  return ticketData.items.some(it => typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata'));
}
async function _procesarSelloFidelizacion(phoneClean, ticketData, consumioPremio) {
  if (!phoneClean || !_ticketTienePatata(ticketData)) return;
  // El cálculo del sello (sumar, resetear a los 10, descontar premio
  // canjeado) se hace en el servidor (fidelizacion.php): el navegador ya
  // no lee ni escribe fidelizacion/<telefono> directamente, para que nadie
  // pueda regalarse sellos/premios abriendo las devtools.
  try {
    await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'registrarSello',
        telefono: phoneClean,
        orderNum: (ticketData && ticketData.orderNum) || '',
        tienePatata: true,
        consumioPremio: !!consumioPremio,
        nombre: (ticketData && ticketData.name) || ''
      })
    });
  } catch (e) { /* no crítico: si falla, el cliente simplemente no suma sello esta vez */ }
  // Nota: el aviso de "completaste tus 10 pedidos" ya se mostró ANTES de
  // confirmar (ver _comprobarPremioFidelizacion / _mostrarAvisoProximoSelloFidelizacion),
  // así que aquí no se repite para no duplicar el mensaje.
}
function _mostrarAvisoFidelizacionCompletada() {
  // Aviso simple superpuesto a la pantalla de éxito; no bloquea el flujo.
  try {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:16px 22px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:9999;max-width:90vw;text-align:center;font-family:\'DM Sans\',sans-serif;font-size:14.5px;font-weight:600';
    el.innerHTML = '🎉 ¡Has completado tus 10 pedidos! Tu patata gratis estará disponible en tu próximo pedido.';
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 6000);
  } catch (e) {}
}

// ── Tiempo de modificación de pedido ──
function saveModifyWindow() {
  var _document$getElementB2;
  const v = parseInt(((_document$getElementB2 = document.getElementById('modify-window-input')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || '5');
  const valid = isNaN(v) || v < 1 || v > 60 ? 5 : v;
  localStorage.setItem('dpf_modify_window_mins', valid);
  if (window.fb_saveConfig) {
    try {
      // IMPORTANTE: usar la misma clave (CONFIG_KEY) que saveConfig(), no
      // 'dpf_local_config'. Antes esto leía/escribía una clave distinta y
      // sobreescribía en Firebase toda la config (incluidas las claves de
      // EmailJS) con un objeto que solo tenía modifyWindowMins, borrando
      // sin querer el resto de ajustes guardados.
      const cfg = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
      cfg.modifyWindowMins = valid;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      Object.assign(CONFIG, cfg);
      window.fb_saveConfig(cfg).catch(() => {});
    } catch (e) {}
  }
  showToast('modify-window-toast');
}
function loadModifyWindowInput() {
  const v = localStorage.getItem('dpf_modify_window_mins') || '5';
  const el = document.getElementById('modify-window-input');
  if (el) el.value = v;
}

