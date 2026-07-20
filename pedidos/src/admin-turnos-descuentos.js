// ── GESTIÓN DE TURNOS ADMIN ──
function loadSlotTurnosUI() {
  const turnos = getSlotTurnos();
  const maxVal = getSlotMax();
  const inp = document.getElementById('slot-max-input');
  if (inp) inp.value = maxVal;
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
  _mutateSlotTurnos(function (t) {
    if (t[idx]) t[idx][field] = value;
  });
}
function saveSlotConfig() {
  const maxInp = document.getElementById('slot-max-input');
  const max = parseInt(maxInp ? maxInp.value : '4', 10);
  if (isNaN(max) || max < 1) {
    alert('El número de pedidos por turno debe ser al menos 1');
    return;
  }
  localStorage.setItem(SLOT_MAX_KEY, max);
  SLOT_MAX = max;
  const turnos = getSlotTurnos();
  if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(turnos, max).catch(e => console.warn('Firebase slotConfig error', e));
  showToast('slot-config-toast');
  logActivity('🕐 Turnos actualizados — ' + turnos.length + ' franjas · max ' + max + ' pedidos/turno');
  renderSlotPicker();
}

// ══════════════════════════════════════════
//  EXTRAS — QUESO Y GRATINADO EN PATATAS
// ══════════════════════════════════════════

// IDs que tienen queso YA incluido → solo ofrecen gratinado (+0,50€)
const EXTRAS_SOLO_GRATINADO = new Set([4, 5, 6, 8, 11, 12, 14]);
// IDs que pueden añadir queso (+1€) y/o gratinado (+0,50€)
const EXTRAS_QUESO_Y_GRATINADO = new Set([1, 2, 3, 7, 9, 10, 13]);
// IDs al gusto / bomba tienen su propio modal — excluir de extras
const ALL_EXTRAS_IDS = new Set([...EXTRAS_SOLO_GRATINADO, ...EXTRAS_QUESO_Y_GRATINADO]);

// extrasCart: key → { menuId, qty, queso, gratinado, key }
const extrasCart = {};
let _extrasCurrentId = null;
let _extrasQueso = false;
let _extrasGratinado = false;
let _extrasIngredientes = {}; // { name: true/false }

const EXTRAS_ING_PRECIO1 = ['Jamón York', 'Carne Picada', 'Pollo', 'Carne Kebab', 'Atún', 'Gambas', 'Tronquitos de Mar', 'Huevo', 'Bacon', 'Queso Mozzarella', '4 Quesos'];
const EXTRAS_ING_PRECIO07 = ['Tomate Natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
function openExtrasModal(itemId) {
  // Asegurar que el modal está en el body directamente
  const em = document.getElementById('extras-modal');
  if (em && em.parentElement !== document.body) document.body.appendChild(em);
  _extrasCurrentId = itemId;
  _extrasQueso = false;
  _extrasGratinado = false;
  _extrasIngredientes = {};
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;
  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + item.price.toFixed(2).replace('.', ',') + ' €';
  const onlySoloGratinado = EXTRAS_SOLO_GRATINADO.has(itemId);
  let optionsHtml = '';
  if (!onlySoloGratinado) {
    optionsHtml += "\n      <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('queso')\">\n        <div>\n          <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F9C0; A\xF1adir queso mozzarella</div>\n          <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+1,00 \u20AC</div>\n        </div>\n        <div id=\"extra-check-queso\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n      </label>";
  }
  optionsHtml += "\n    <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('gratinado')\">\n      <div>\n        <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F525; Gratinar".concat(onlySoloGratinado ? '' : ' (con queso)', "</div>\n        <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+0,50 \u20AC").concat(onlySoloGratinado ? '' : ' · incluye gratinado del queso', "</div>\n      </div>\n      <div id=\"extra-check-gratinado\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n    </label>");

  // Ingredientes extra +1€
  optionsHtml += "<div style=\"margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:#3D1F0D;letter-spacing:.5px\">INGREDIENTES EXTRA</div>";
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO1.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+1,00 \u20AC</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  // Ingredientes extra +0,70€
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO07.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+0,70 \u20AC</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  document.getElementById('extras-options').innerHTML = optionsHtml;
  updateExtrasTotal();
  document.getElementById('extras-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function toggleExtra(type) {
  if (type === 'queso') {
    _extrasQueso = !_extrasQueso;
    // Si quita queso, quitar también gratinado si solo gratinado no aplica
    if (!_extrasQueso && !EXTRAS_SOLO_GRATINADO.has(_extrasCurrentId)) {
      // Keep gratinado independent — user can still want it without queso? No: gratinado requiere queso
      _extrasGratinado = false;
      updateExtraCheckUI('gratinado', false);
    }
  } else {
    _extrasGratinado = !_extrasGratinado;
    // Si activa gratinado y no es solo-gratinado, activar queso también automáticamente
    if (_extrasGratinado && !EXTRAS_SOLO_GRATINADO.has(_extrasCurrentId) && !_extrasQueso) {
      _extrasQueso = true;
      updateExtraCheckUI('queso', true);
    }
  }
  updateExtraCheckUI(type, type === 'queso' ? _extrasQueso : _extrasGratinado);
  updateExtrasTotal();
}
function toggleExtraIng(ing) {
  _extrasIngredientes[ing] = !_extrasIngredientes[ing];
  const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
  const el = document.getElementById(eid);
  const lbl = document.getElementById('lbl-' + eid);
  const active = _extrasIngredientes[ing];
  if (el) {
    el.style.background = active ? '#3D1F0D' : '#fff';
    el.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    el.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  }
  if (lbl) {
    lbl.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    lbl.style.background = active ? 'rgba(244,196,48,0.08)' : '#fff';
  }
  updateExtrasTotal();
}
function updateExtraCheckUI(type, active) {
  const el = document.getElementById('extra-check-' + type);
  if (!el) return;
  const label = el.closest('label');
  if (active) {
    el.style.background = '#3D1F0D';
    el.style.borderColor = '#3D1F0D';
    el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) {
      label.style.borderColor = '#3D1F0D';
      label.style.background = 'rgba(244,196,48,0.08)';
    }
  } else {
    el.style.background = '#fff';
    el.style.borderColor = '#F5E6C8';
    el.innerHTML = '';
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  }
}
function updateExtrasTotal() {
  const item = MENU.find(m => m.id == _extrasCurrentId);
  if (!item) return;
  let total = item.price;
  if (_extrasQueso) total += 1.00;
  if (_extrasGratinado) total += 0.50;
  Object.entries(_extrasIngredientes).forEach(_ref11 => {
    let _ref12 = _slicedToArray(_ref11, 2),
      ing = _ref12[0],
      active = _ref12[1];
    if (!active) return;
    if (EXTRAS_ING_PRECIO1.includes(ing)) total += 1.00;else if (EXTRAS_ING_PRECIO07.includes(ing)) total += 0.70;
  });
  document.getElementById('extras-total-price').textContent = total.toFixed(2).replace('.', ',') + ' €';
}
function closeExtrasModal() {
  document.getElementById('extras-modal').style.display = 'none';
  document.body.style.overflow = '';
  _extrasCurrentId = null;
}
function confirmExtras() {
  if (isShopBlocked()) {
    showClosedToast();
    closeExtrasModal();
    return;
  }
  const itemId = _extrasCurrentId;
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;
  const ingKeys = Object.entries(_extrasIngredientes).filter(_ref13 => {
    let _ref14 = _slicedToArray(_ref13, 2),
      v = _ref14[1];
    return v;
  }).map(_ref15 => {
    let _ref16 = _slicedToArray(_ref15, 1),
      k = _ref16[0];
    return k;
  }).sort().join('|');
  const fingerprint = (_extrasQueso ? 'Q' : '') + (_extrasGratinado ? 'G' : '') + (ingKeys ? 'I' + ingKeys : '') || 'BASE';
  const cartKey = 'ext:' + itemId + ':' + fingerprint;
  if (!extrasCart[cartKey]) {
    extrasCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      queso: _extrasQueso,
      gratinado: _extrasGratinado,
      ingredientesExtra: Object.entries(_extrasIngredientes).filter(_ref17 => {
        let _ref18 = _slicedToArray(_ref17, 2),
          v = _ref18[1];
        return v;
      }).map(_ref19 => {
        let _ref20 = _slicedToArray(_ref19, 1),
          k = _ref20[0];
        return k;
      }),
      key: cartKey,
      basePrice: item.price
    };
  }
  extrasCart[cartKey].qty++;
  closeExtrasModal();
  renderMenu();
  renderCart();
}
function removeExtrasItem(key) {
  if (extrasCart[key]) {
    extrasCart[key].qty--;
    if (extrasCart[key].qty <= 0) delete extrasCart[key];
  }
  renderMenu();
  renderCart();
}
function getExtrasItemPrice(c) {
  let p = c.basePrice + (c.queso ? 1.00 : 0) + (c.gratinado ? 0.50 : 0);
  (c.ingredientesExtra || []).forEach(ing => {
    if (EXTRAS_ING_PRECIO1.includes(ing)) p += 1.00;else if (EXTRAS_ING_PRECIO07.includes(ing)) p += 0.70;
  });
  return p;
}
function getExtrasItemLabel(c) {
  const item = MENU.find(m => m.id == c.menuId);
  if (!item) {
    console.error('getExtrasItemLabel: producto no encontrado menuId=' + c.menuId);
    return 'Producto desconocido';
  }
  if (c.cheddarCarne) return item.name + ' (' + c.cheddarCarne + ')';
  const extras = [];
  if (c.queso) extras.push('Queso');
  if (c.gratinado) extras.push('Gratinado');
  (c.ingredientesExtra || []).forEach(ing => extras.push(ing));
  return item.name + (extras.length ? ' + ' + extras.join(' + ') : '');
}

// ══════════════════════════════════════════
//  PATATA CHEDDAR-BACON — SELECTOR DE CARNE
// ══════════════════════════════════════════
const CHEDDAR_ID = 50;
let _cheddarCarne = null; // 'picada' | 'kebab'

function openCheddarModal() {
  _cheddarCarne = null;
  // Reset UI
  ['picada', 'kebab'].forEach(opt => {
    const check = document.getElementById('cheddar-check-' + opt);
    const label = document.getElementById('cheddar-opt-' + opt);
    if (check) {
      check.style.background = '#fff';
      check.style.borderColor = '#F5E6C8';
      check.innerHTML = '';
    }
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  });
  document.getElementById('cheddar-error').style.display = 'none';
  document.getElementById('cheddar-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeCheddarModal() {
  document.getElementById('cheddar-modal').style.display = 'none';
  document.body.style.overflow = '';
  _cheddarCarne = null;
}
function selectCheddarCarne(opt) {
  _cheddarCarne = opt;
  document.getElementById('cheddar-error').style.display = 'none';
  ['picada', 'kebab'].forEach(o => {
    const check = document.getElementById('cheddar-check-' + o);
    const label = document.getElementById('cheddar-opt-' + o);
    const active = o === opt;
    if (check) {
      check.style.background = active ? '#3D1F0D' : '#fff';
      check.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
      check.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
    }
    if (label) {
      label.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
      label.style.background = active ? 'rgba(244,196,48,0.08)' : '#fff';
    }
  });
}
function confirmCheddar() {
  if (isShopBlocked()) {
    showClosedToast();
    closeCheddarModal();
    return;
  }
  if (!_cheddarCarne) {
    document.getElementById('cheddar-error').style.display = 'block';
    return;
  }
  const carneLabel = _cheddarCarne === 'picada' ? 'Carne Picada' : 'Carne Kebab';
  const key = 'cheddar:' + _cheddarCarne;
  if (!extrasCart[key]) {
    extrasCart[key] = {
      menuId: CHEDDAR_ID,
      qty: 0,
      queso: false,
      gratinado: false,
      key,
      basePrice: 8.50,
      cheddarCarne: carneLabel
    };
  }
  extrasCart[key].qty++;
  closeCheddarModal();
  renderMenu();
  renderCart();
}

// ══════════════════════════════════════════
//  BLOQUEAR CATEGORÍAS
// ══════════════════════════════════════════
const CAT_BLOCK_KEY = 'dpf_blocked_cats';
function getBlockedCats() {
  try {
    return JSON.parse(localStorage.getItem(CAT_BLOCK_KEY) || '[]');
  } catch {
    return [];
  }
}
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
function toggleCatBlock(cat) {
  const blocked = getBlockedCats();
  const idx = blocked.indexOf(cat);
  if (idx >= 0) blocked.splice(idx, 1);else blocked.push(cat);
  saveBlockedCats(blocked);
  // Hide/show all items in that category
  MENU.forEach(item => {
    if (item.cat === cat) item.hidden = blocked.includes(cat);
  });
  loadCatBlockUI();
  renderMenu();
  logActivity((blocked.includes(cat) ? '🚫' : '✅') + ' Categoría ' + (blocked.includes(cat) ? 'bloqueada' : 'desbloqueada') + ': ' + cat);
}
function initCatBlocks() {
  // Apply saved blocked cats on load
  const blocked = getBlockedCats();
  MENU.forEach(item => {
    if (blocked.includes(item.cat)) item.hidden = true;
  });
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
  const topSorted = [];

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
function checkLogSecret(val) {
  if (val.toLowerCase() === 'log') {
    document.getElementById('log-secret-input').value = '';
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const logSection = document.getElementById('admin-log');
    if (logSection) {
      logSection.classList.add('active');
      renderActivityLog();
    }
  }
}
// Single unified secret key buffer
window._secretKeyBuf = '';
// Acceso por teclado bimba desactivado — usar URL ?bimba=TOKEN
// INIT
initCatBlocks();
initTabs();
renderMenu();
renderPromos();
renderCart();

// ═══════════════════════════════════════
//  PANEL DE ADMINISTRACIÓN
// ═══════════════════════════════════════

const ADMIN_PWD_KEY = 'dpf_admin_pwd';
const MENU_KEY = 'dpf_menu';
const CONFIG_KEY = 'dpf_config';
const OPEN_KEY = 'dpf_open';
const HORARIO_KEY = 'dpf_horario';

// Hash SHA-256 de la contraseña por defecto: "dulcepatata2024"
// Para generar el hash de otra contraseña, ejecuta en la consola del navegador:
//   hashAdminPwd('TuNuevaContraseña').then(h => console.log(h))
// y pega el resultado en ADMIN_PWD_DEFAULT_HASH
const ADMIN_PWD_DEFAULT_HASH = '53e3e30b4ba11c28d4c0729bcacbd343a0bef168947da71f90a7c0b06322c277';
async function hashAdminPwd(pwd) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pwd));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function isHex64(s) {
  return typeof s === 'string' && s.length === 64 && /^[0-9a-f]+$/.test(s);
}
function getAdminPwd() {
  // Devuelve el hash guardado en localStorage, o el hash por defecto si no hay ninguno.
  // NUNCA devuelve null → elimina el flujo de "primera vez" que era el agujero de seguridad.
  return localStorage.getItem(ADMIN_PWD_KEY) || ADMIN_PWD_DEFAULT_HASH;
}

// Migración: si hay una contraseña en texto plano de la versión anterior, la hashea al vuelo.
async function migrateAdminPwdIfNeeded() {
  const stored = localStorage.getItem(ADMIN_PWD_KEY);
  if (stored && !isHex64(stored)) {
    const h = await hashAdminPwd(stored);
    localStorage.setItem(ADMIN_PWD_KEY, h);
    if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(h).catch(() => {});
  } else if (!stored && window.fb_loadAdminPwd) {
    // No hay nada en local → intentar cargar desde Firebase
    try {
      const fbHash = await window.fb_loadAdminPwd();
      if (fbHash && isHex64(fbHash)) localStorage.setItem(ADMIN_PWD_KEY, fbHash);
    } catch {}
  }
}

// Flush pending migration if DOMContentLoaded fired before this script ran
if (window._pendingMigrateAdmin) {
  window._pendingMigrateAdmin = false;
  migrateAdminPwdIfNeeded();
}


// ── Búsqueda en la carta ──────────────────────────────────
function filterMenuBySearch(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.item-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const desc = (card.dataset.desc || '').toLowerCase();
    card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
  // category sections not used, skip
  if(false) document.querySelectorAll('.menu-category-section').forEach(sec => {
    const visible = Array.from(sec.querySelectorAll('.menu-item-card')).some(c => c.style.display !== 'none');
    sec.style.display = visible ? '' : 'none';
  });
}



// ── CÓDIGOS DE DESCUENTO ──────────────────────────────────────────────────────
let _activeDiscount = null; // { code, pct }

async function dcCargar() {
  const el = document.getElementById('dc-list');
  if (!el) return;
  if (!window.fb_loadDiscounts) { el.innerHTML = 'Firebase no disponible'; return; }
  const discounts = await window.fb_loadDiscounts().catch(() => ({}));
  const keys = Object.keys(discounts || {});
  if (!keys.length) { el.innerHTML = '<span style="color:#8A6A4E">Sin códigos creados</span>'; return; }
  el.innerHTML = keys.map(code => {
    const d = discounts[code];
    const remaining = d.maxUses - (d.uses || 0);
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap;gap:6px">'
      + '<div><strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;color:#8A6A4E">' + (d.uses||0) + '/' + d.maxUses + ' usos · ' + remaining + ' restantes</span></div>'
      + '<button data-code="' + escapeAttr(code) + '" onclick="dcEliminar(this.dataset.code)" style="padding:4px 10px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Eliminar</button>'
      + '</div>';
  }).join('');
}

async function dcCrear() {
  const code = (document.getElementById('dc-code').value || '').trim().toUpperCase();
  const pct = parseInt(document.getElementById('dc-pct').value);
  const maxUses = parseInt(document.getElementById('dc-uses').value);
  if (!code) { alert('Introduce un código'); return; }
  if (!pct || pct < 1 || pct > 100) { alert('Introduce un % válido (1-100)'); return; }
  if (!maxUses || maxUses < 1) { alert('Introduce un número de usos'); return; }
  if (!window.fb_saveDiscount) { alert('Firebase no disponible'); return; }
  await window.fb_saveDiscount(code, { pct, maxUses, uses: 0, createdAt: Date.now() });
  document.getElementById('dc-code').value = '';
  document.getElementById('dc-pct').value = '';
  document.getElementById('dc-uses').value = '';
  logActivity('🎁 Código de descuento creado: ' + code + ' (' + pct + '%, ' + maxUses + ' usos)');
  dcCargar();
}

async function dcEliminar(code) {
  if (!confirm('¿Eliminar el código ' + code + '?')) return;
  if (window.fb_deleteDiscount) await window.fb_deleteDiscount(code);
  logActivity('🗑️ Código de descuento eliminado: ' + code);
  dcCargar();
}

async function dcAplicar(code) {
  if (!code) { _activeDiscount = null; renderCart(); return; }
  code = code.trim().toUpperCase();
  if (!window.fb_getDiscount) { showDiscountError('Firebase no disponible'); return; }
  const d = await window.fb_getDiscount(code).catch(() => null);
  if (!d) { showDiscountError('Código no válido'); return; }
  if ((d.uses || 0) >= d.maxUses) { showDiscountError('Este código ya no tiene usos disponibles'); return; }
  _activeDiscount = { code, pct: d.pct };
  showDiscountOk(code, d.pct);
  renderCart();
}

function showDiscountError(msg) {
  const el = document.getElementById('discount-feedback');
  if (el) { el.style.color = '#c0392b'; el.textContent = '❌ ' + msg; }
  _activeDiscount = null;
  renderCart();
}

function showDiscountOk(code, pct) {
  const el = document.getElementById('discount-feedback');
  if (el) { el.style.color = '#27855a'; el.textContent = '✅ Código ' + code + ' aplicado — ' + pct + '% de descuento'; }
}

function getDiscountAmount(subtotal) {
  if (!_activeDiscount) return 0;
  return Math.round(subtotal * _activeDiscount.pct) / 100;
}

