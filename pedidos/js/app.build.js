// ═══════════════════════════════════════════════════════════
//  NÚCLEO COMPARTIDO — funciones/constantes de las que depende el
//  flujo normal de un cliente (ver la carta, pedir, jugar a la ruleta,
//  entrar como admin...) pero que antes vivían mezcladas dentro de
//  archivos que son, en su mayoría, del panel de administración.
//
//  Por qué existe: todo el JavaScript se subía en un único bundle
//  (js/app.js) que descargaba y ejecutaba TODO EL MUNDO — un cliente
//  que solo quiere pedir una patata se bajaba también el código de
//  cocina en vivo, finanzas, impresora térmica, fichaje de
//  empleados... Ahora hay dos bundles: js/app.js (este, siempre, para
//  cualquier visitante) y js/app-admin.js (solo cuando se abre el
//  panel — ver loadAdminBundle() en admin-accesos.js e index.php).
//
//  Este archivo va PRIMERO en el bundle de cliente (ver
//  scripts/build.js), así que cualquier función que dependa de algo
//  de aquí (carta.js, carrito-checkout.js...) ya lo encuentra
//  definido. Dentro de este archivo, el orden de los bloques importa
//  por el mismo motivo — cada bloque solo depende de los anteriores.
// ═══════════════════════════════════════════════════════════

// ── MODO VACACIONES (ver vacaciones.js para el toggle admin) ──
function checkVacationMode() {
  firebase.database().ref('config/vacacionesActivo').once('value').then(sn => {
    const activo = sn.val() === true;
    const screen = document.getElementById('vacation-screen');
    if (screen) {
      screen.style.display = activo ? 'flex' : 'none';
    }
  }).catch(() => {});
}

// Declaraciones globales para compatibilidad Safari 12
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

/* ── MODAL DE AVISO (reemplazo de alert() nativo) ──
   Uso: showAlert('Mensaje aquí') en vez de alert('Mensaje aquí')
   Opcionalmente: showAlert('Mensaje', 'Título personalizado') */
function showAlert(msg, title) {
  const modal = document.getElementById('alert-modal');
  if (!modal) { window.alert(msg); return; }
  document.getElementById('alert-title').textContent = title || 'Aviso';
  document.getElementById('alert-msg').textContent = msg;
  modal.classList.add('open');
}
function closeAlert() {
  const modal = document.getElementById('alert-modal');
  if (modal) modal.classList.remove('open');
}

// ── Claves de localStorage compartidas — se declaran aquí (no en
// admin-config.js/admin-turnos-descuentos.js, que ahora son solo admin)
// porque funciones de este mismo archivo (getSavedMenu vía renderMenu,
// getBlockedCats...) las usan en el arranque, antes de que el bundle
// admin exista siquiera. ──
const MENU_KEY = 'dpf_menu';
const CONFIG_KEY = 'dpf_config';
const OPEN_KEY = 'dpf_open';
const HORARIO_KEY = 'dpf_horario';

// ══════════════════════════════════════════
//  EXTRAS — QUESO Y GRATINADO EN PATATAS (el cliente las añade al pedir)
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
const EXTRAS_SALSAS = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa rosa', 'Salsa de yogur', 'Tomate frito', 'Queso Philadelphia', 'Roquefort'];
const EXTRAS_SALSA_PRECIO = 0.90;
let _extrasSalsas = {}; // { nombre: true/false }
function openExtrasModal(itemId) {
  // Asegurar que el modal está en el body directamente
  const em = document.getElementById('extras-modal');
  if (em && em.parentElement !== document.body) document.body.appendChild(em);
  _extrasCurrentId = itemId;
  _extrasQueso = false;
  _extrasGratinado = false;
  _extrasIngredientes = {};
  _extrasSalsas = {};
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;
  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + item.price.toFixed(2).replace('.', ',') + ' €';
  const onlySoloGratinado = EXTRAS_SOLO_GRATINADO.has(itemId);
  let optionsHtml = '';
  if (!onlySoloGratinado) {
    optionsHtml += "\n      <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('queso')\">\n        <div>\n          <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F9C0; A\xF1adir queso mozzarella</div>\n          <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+1,00 €</div>\n        </div>\n        <div id=\"extra-check-queso\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n      </label>";
  }
  optionsHtml += "\n    <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('gratinado')\">\n      <div>\n        <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F525; Gratinar".concat(onlySoloGratinado ? '' : ' (con queso)', "</div>\n        <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+0,50 €").concat(onlySoloGratinado ? '' : ' · incluye gratinado del queso', "</div>\n      </div>\n      <div id=\"extra-check-gratinado\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n    </label>");

  // Ingredientes extra +1€
  optionsHtml += "<div style=\"margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:#3D1F0D;letter-spacing:.5px\">INGREDIENTES EXTRA</div>";
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO1.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+1,00 €</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  // Ingredientes extra +0,70€
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO07.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+0,70 €</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  // Salsas extra +0,90€
  optionsHtml += "<div style=\"margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:#3D1F0D;letter-spacing:.5px\">SALSAS EXTRA</div>";
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_SALSAS.forEach(salsa => {
    const eid = 'extra-salsa-' + salsa.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraSalsa('").concat(salsa.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(salsa, "</div><div style=\"font-size:11px;color:#8A6A4E\">+").concat(EXTRAS_SALSA_PRECIO.toFixed(2).replace('.', ','), " €</div></div>\n    </label>");
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
function toggleExtraSalsa(salsa) {
  _extrasSalsas[salsa] = !_extrasSalsas[salsa];
  const eid = 'extra-salsa-' + salsa.replace(/[^a-z0-9]/gi, '_');
  const el = document.getElementById(eid);
  const lbl = document.getElementById('lbl-' + eid);
  const active = _extrasSalsas[salsa];
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
  Object.values(_extrasSalsas).forEach(active => { if (active) total += EXTRAS_SALSA_PRECIO; });
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
  const salsaKeys = Object.entries(_extrasSalsas).filter(_ref17s => {
    let _ref18s = _slicedToArray(_ref17s, 2),
      v = _ref18s[1];
    return v;
  }).map(_ref19s => {
    let _ref20s = _slicedToArray(_ref19s, 1),
      k = _ref20s[0];
    return k;
  }).sort().join('|');
  const fingerprint = (_extrasQueso ? 'Q' : '') + (_extrasGratinado ? 'G' : '') + (ingKeys ? 'I' + ingKeys : '') + (salsaKeys ? 'S' + salsaKeys : '') || 'BASE';
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
      salsasExtra: Object.entries(_extrasSalsas).filter(_ref17b => {
        let _ref18b = _slicedToArray(_ref17b, 2),
          v = _ref18b[1];
        return v;
      }).map(_ref19b => {
        let _ref20b = _slicedToArray(_ref19b, 1),
          k = _ref20b[0];
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
  (c.salsasExtra || []).forEach(() => { p += EXTRAS_SALSA_PRECIO; });
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
  if (c.queso) extras.push('Extra Queso');
  (c.ingredientesExtra || []).forEach(ing => extras.push('Extra ' + ing));
  (c.salsasExtra || []).forEach(salsa => extras.push('Extra salsa ' + salsa));
  // El gratinado siempre va el último, sea cual sea el resto de extras.
  if (c.gratinado) extras.push('Gratinado');
  return item.name + (extras.length ? ' + ' + extras.join(' + ') : '');
}

// ══════════════════════════════════════════
//  PATATA CHEDDAR-BACON — SELECTOR DE CARNE (el cliente la añade al pedir)
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
//  BLOQUEAR CATEGORÍAS — solo la parte que se aplica siempre al cargar;
//  editar qué categorías están bloqueadas sigue siendo cosa del panel
//  admin (loadCatBlockUI/toggleCatBlock/saveBlockedCats/getCatsFromMenu,
//  en admin-turnos-descuentos.js).
// ══════════════════════════════════════════
const CAT_BLOCK_KEY = 'dpf_blocked_cats';
function getBlockedCats() {
  try {
    return JSON.parse(localStorage.getItem(CAT_BLOCK_KEY) || '[]');
  } catch {
    return [];
  }
}
function initCatBlocks() {
  // Apply saved blocked cats on load
  const blocked = getBlockedCats();
  MENU.forEach(item => {
    if (blocked.includes(item.cat)) item.hidden = true;
  });
}

// ── Búsqueda en la carta ──────────────────────────────────
function filterMenuBySearch(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.item-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const desc = (card.dataset.desc || '').toLowerCase();
    card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
}

// ── CÓDIGOS DE DESCUENTO — el cliente los aplica al pedir. Crear/borrar
// códigos (dcCargar/dcCrear/dcEliminar/dcBuscarPorTelefono) sigue siendo
// cosa del panel admin, en admin-turnos-descuentos.js. ──
let _activeDiscount = null; // { code, pct }

async function dcAplicar(code) {
  if (!code) { _activeDiscount = null; renderCart(); return; }
  code = code.trim().toUpperCase();
  if (!window.fb_getDiscount) { showDiscountError('Firebase no disponible'); return; }
  const d = await window.fb_getDiscount(code).catch(() => null);
  if (!d) { showDiscountError('Código no válido'); return; }
  // Los premios de la ruleta/rasca caducan a las 48h (expiraEn) — los
  // códigos creados a mano desde el panel no llevan ese campo, así que
  // esta comprobación no les afecta.
  if (d.expiraEn && Date.now() > d.expiraEn) { showDiscountError('Este código ha caducado'); return; }
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

// ── OFERTA RELÁMPAGO: solo el listener que hace que el cliente vea el
// banner/precio rebajado en directo. Lanzarla/cancelarla y el resto del
// panel siguen en admin-turnos-descuentos.js (orLanzar, orCancelar,
// orRenderEstado...) — orRenderEstado se llama con guard porque esa
// función solo existe si el bundle admin está cargado (si un cliente
// normal tiene la web abierta cuando se lanza una oferta, no está). ──
function loadOfertaRelampagoFromFirebase() {
  if (!window.fb_listenOfertaRelampago) return;
  window.fb_listenOfertaRelampago(function (oferta) {
    if (typeof orRenderEstado === 'function') orRenderEstado(oferta);
    if (typeof _actualizarOfertaRelampago === 'function') _actualizarOfertaRelampago(oferta);
  });
}

// ── Compartir pedido por WhatsApp (botón en la pantalla de éxito) ──
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

// ── ACCESO AL PANEL — todo esto tiene que ser "de cliente" (aunque solo
// lo use la dueña/empleados) porque es el ÚNICO camino para llegar a
// abrir el panel — si viviera en el bundle de admin, nadie podría
// cargarlo nunca. openAdmin() ya esperaba a que se cargase el HTML del
// panel (loadAdminShell, definido en index.php); ahora esa misma espera
// también cubre el bundle de JavaScript del admin (ver loadAdminBundle()
// en index.php) — así el resto de funciones "de admin de verdad" que se
// llaman aquí dentro (isTrustedDevice, dcCargar, loadVacacionesStatus...)
// ya están definidas cuando les toca ejecutarse. ──

// Audio context — needs user gesture to unlock
let _audioCtxUnlocked = false;
const AUDIO_PREF_KEY = 'dpf_audio_enabled';

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
  // Cargar el HTML y el JavaScript del admin de forma diferida si aún no
  // están cargados (ver loadAdminShell en index.php).
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
    // El PIN se ha verificado en el servidor sin depender del bundle admin,
    // así que si alguien llega aquí sin haber pasado por openAdmin() antes
    // (no debería, ver el candado de arriba), nos aseguramos aquí también.
    if (typeof loadAdminShell === 'function' && !window._adminShellLoaded) {
      await new Promise(function(resolve) { loadAdminShell(resolve); });
    }
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

// ── PRODUCTOS: leer/renderizar el menú (editarlo es cosa de admin, ver
// admin-config.js) ──
function getSavedMenu() {
  try {
    return JSON.parse(localStorage.getItem(MENU_KEY)) || null;
  } catch {
    return null;
  }
}
function loadSavedMenu() {
  const saved = getSavedMenu();
  if (saved) {
    MENU.length = 0;
    saved.forEach(i => MENU.push(i));
  }
}
function renderMenu() {
  window._tartaLastSub = null;
  // El aviso de "toca un icono de alérgeno" solo tiene sentido si ALGÚN
  // producto lleva alguno marcado — si la dueña todavía no ha etiquetado
  // nada, no tiene sentido mostrarlo (ver dietaryTagsHtml en carta.js).
  var allergenHintEl = document.getElementById('allergen-hint');
  if (allergenHintEl) {
    var hayAlergenos = MENU.some(function (i) { return Array.isArray(i.tags) && i.tags.length; });
    allergenHintEl.style.display = hayAlergenos ? 'block' : 'none';
  }
  var rawFiltered = (activeCategory === "Todos" ? MENU : MENU.filter(i => i.cat === activeCategory)).filter(i => !i.hidden);
  // Ordenar tartas: clásicas primero, especiales después
  var tartasClasicas = rawFiltered.filter(i => i.cat === 'Tartas' && i.desc && i.desc.toLowerCase().indexOf('clásica') !== -1);
  var tartasEspeciales = rawFiltered.filter(i => i.cat === 'Tartas' && i.desc && i.desc.toLowerCase().indexOf('especial') !== -1);
  var tartasOtras = rawFiltered.filter(i => i.cat === 'Tartas' && (!i.desc || (i.desc.toLowerCase().indexOf('clásica') === -1 && i.desc.toLowerCase().indexOf('especial') === -1)));
  var noTartas = rawFiltered.filter(i => i.cat !== 'Tartas');
  // Reconstruir en orden: todo lo que no es tartas con tartas reordenadas en su posición
  var tartasOrdenadas = [...tartasClasicas, ...tartasOtras, ...tartasEspeciales];
  var firstTartaIdx = rawFiltered.findIndex(i => i.cat === 'Tartas');
  var filtered = firstTartaIdx === -1 ? rawFiltered : [
    ...rawFiltered.slice(0, firstTartaIdx).filter(i => i.cat !== 'Tartas'),
    ...tartasOrdenadas,
    ...rawFiltered.slice(firstTartaIdx).filter(i => i.cat !== 'Tartas')
  ];
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  const showSeparators = activeCategory === "Todos";
  var emojiMap2 = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  const catSubtitles = {
    "Patatas": "recién asadas a partir de las 19:30h",
    "Boniato": "el toque dulce y crujiente · elige tu tarrina",
    "Paninis": "pan de leña crujiente · ¡medio metro!",
    "Cookies": "Crumbl Cookies · horneadas cada día",
    "Tartas": "todas caseras y de elaboración propia",
    "Bebidas": "para acompañar tu pedido"
  };
  const catCounts = {};
  if (showSeparators) {
    MENU.filter(i => !i.hidden).forEach(i => { catCounts[i.cat] = (catCounts[i.cat] || 0) + 1; });
  }
  let lastCat = null;
  const html = filtered.map(item => {
    const isCustom = item.id === 15 || item.id === 16;
    const isExtras = ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(item.id) || item.id === CHEDDAR_ID;
    const qty = isCustom ? Object.values(custCart).filter(c => c.menuId === item.id).reduce((s,c) => s+c.qty, 0)
              : isExtras ? Object.values(extrasCart).filter(c => c.menuId === item.id).reduce((s,c) => s+c.qty, 0)
              : cart[item.id] || 0;
    const soldout = item.soldout;
    let sep = '';
    if (showSeparators && item.cat !== lastCat) {
      lastCat = item.cat;
      const sub = catSubtitles[item.cat] || '';
      const count = catCounts[item.cat] || '';
      const emoji = emojiMap2[item.cat] || '';
      sep = '<div class="menu-cat-sep">'
          + '<div class="menu-cat-left">'
          + '<h3 class="menu-cat-name">' + (emoji ? emoji + ' ' : '') + item.cat.toUpperCase() + '</h3>'
          + (sub ? '<div class="menu-cat-sub">' + sub + '</div>' : '')
          + '</div>'
          + (count ? '<div class="menu-cat-badge">' + count + ' opciones</div>' : '')
          + '</div>';
    }

    // Subsecciones de Tartas: Clásicas / Especiales
    var tartaSep = '';
    if (item.cat === 'Tartas') {
      var isTartaClassic = item.desc && item.desc.toLowerCase().indexOf('clásica') !== -1;
      var isTartaSpecial = item.desc && item.desc.toLowerCase().indexOf('especial') !== -1;
      if (isTartaClassic && !window._tartaLastSub || window._tartaLastSub === 'especial' && isTartaClassic) {
        window._tartaLastSub = 'clasica';
        tartaSep = '<div class="tarta-subsep tarta-subsep-clasica">'
          + '<span>CLÁSICAS · 3,40€</span>'
          + '</div>';
      } else if (isTartaSpecial && window._tartaLastSub !== 'especial') {
        window._tartaLastSub = 'especial';
        tartaSep = '<div class="tarta-subsep tarta-subsep-especial">'
          + '<span>ESPECIALES · 3,90€</span>'
          + '</div>';
      }
    } else {
      window._tartaLastSub = null;
    }
    sep = sep + tartaSep;
    let controls;
    if (soldout) {
      controls = '<span style="font-size:12px;color:#c0392b;font-weight:700">AGOTADO</span>';
    } else if (qty > 0) {
      controls = '<button class="qty-btn" onclick="changeQty(' + item.id + ',-1)">−</button>'
               + '<span class="qty-num">' + qty + '</span>'
               + '<button class="qty-btn" onclick="changeQty(' + item.id + ',+1)">+</button>';
    } else {
      controls = '<button class="add-btn" onclick="changeQty(' + item.id + ',+1)" title="Añadir">+</button>';
    }
    // Precio rebajado por una oferta relámpago activa en este producto en
    // concreto (ver _precioConOferta en carta.js) — se muestra el original
    // tachado junto al rebajado, para que se note el "chollo" de un vistazo.
    const _precioOferta = (typeof _precioConOferta === 'function') ? _precioConOferta(item) : item.price;
    const priceHtml = _precioOferta < item.price
      ? '<span style="text-decoration:line-through;opacity:.55;font-size:12px;margin-right:4px">' + item.price.toFixed(2) + ' €</span><span style="color:#c0392b">' + _precioOferta.toFixed(2) + ' € ⚡</span>'
      : item.price.toFixed(2) + ' €';
    const tagsHtml = dietaryTagsHtml(item);
    return sep
      + '<div class="item-card ' + (qty > 0 ? 'in-cart' : '') + ' ' + (soldout ? 'soldout-card' : '') + '"'
      + ' id="card-' + item.id + '"'
      + ' data-name="' + escapeAttr(item.name) + '"'
      + ' data-desc="' + escapeAttr(item.desc||'') + '"'
      + ' style="' + (soldout ? 'opacity:.6' : '') + '">'
      + '<div class="item-info">'
      + '<div class="item-name" style="' + (soldout ? 'text-decoration:line-through' : '') + '">' + formatNombreConBadgeNuevo(item.name) + tagsHtml + '</div>'
      + '<div class="item-desc">' + (soldout ? '❌ Agotado hoy' : item.desc) + '</div>'
      + '</div>'
      + '<div class="item-price">' + priceHtml + '</div>'
      + '<div class="item-controls">' + controls + '</div>'
      + '</div>';
  }).join('');
  grid.innerHTML = html;
}

// ── PROMOS (el cliente las añade al carrito desde la carta) ──
var PROMOS_KEY = 'dpf_promos';

function promosLoad() {
  try { return JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]'); } catch { return []; }
}
function promosSave(arr) {
  localStorage.setItem(PROMOS_KEY, JSON.stringify(arr));
  if (window.fb_savePromos) window.fb_savePromos(arr).catch(() => {});
}

function renderPromos() {
  var container = document.getElementById('promos-container');
  if (!container) return;
  var promos = promosLoad().filter(function(p) { return p.visible; });
  if (!promos.length) { container.innerHTML = ''; return; }
  container.innerHTML = promos.map(function(p) {
    var precioTachado = p.precioAntes ? '<span style="text-decoration:line-through;font-size:11px;color:#8A6A4E;margin-right:4px">' + parseFloat(p.precioAntes).toFixed(2) + ' €</span>' : '';
    return '<div style="position:relative;padding-top:14px;margin-bottom:8px">' +
      '<span style="position:absolute;top:0;left:12px;background:#3D1F0D;color:#FFF8EE;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px">🔥 Promo</span>' +
      '<div style="background:#fdecd5;border:1.5px solid #3D1F0D;border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      '<div style="flex:1">' +
      '<div style="font-size:14px;font-weight:700;color:#3D1F0D;margin-bottom:2px">' + escapeHtml(p.nombre) + '</div>' +
      '<div style="font-size:12px;color:#8A6A4E;margin-bottom:6px">' + escapeHtml(p.descripcion || '') + '</div>' +
      '<div>' + precioTachado + '<span style="font-size:14px;font-weight:700;color:#3D1F0D">' + parseFloat(p.precio).toFixed(2) + ' €</span></div>' +
      '</div>' +
      '<button onclick="promoAnadir(\'' + escapeAttr(p.id) + '\')" style="padding:8px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;flex-shrink:0">+ Añadir</button>' +
      '</div></div>';
  }).join('');
}

function promoAnadir(id) {
  var promos = promosLoad();
  var p = promos.find(function(x) { return x.id === id; });
  if (!p) return;
  if (p.opcionQueso || p.opcionGratinado) {
    promoAbrirModal(p);
  } else {
    promoAddToCart(p, {});
  }
}

function promoSelectOpc(el, grupo) {
  var parent = el.parentElement;
  parent.querySelectorAll('span').forEach(function(s) {
    s.style.background = '#fff';
    s.style.color = '#3D1F0D';
    s.style.border = '1.5px solid #F5E6C8';
  });
  el.style.background = '#3D1F0D';
  el.style.color = '#FFF8EE';
  el.style.border = '1.5px solid #3D1F0D';
}

function promoAbrirModal(p) {
  var existing = document.getElementById('promo-modal-overlay');
  if (existing) existing.remove();

  var qId = 'pcheck-queso';
  var gId = 'pcheck-gratinado';
  var checkStyle = 'width:22px;height:22px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;color:transparent;font-weight:700;transition:all .15s';

  function makeCheck(id, emoji, label, sub) {
    return '<label style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;cursor:pointer;margin-bottom:8px" onclick="var c=document.getElementById(\''+id+'\');var on=c.dataset.on===\'1\';c.dataset.on=on?\'0\':\'1\';c.style.background=on?\'#fff\':\'#3D1F0D\';c.style.borderColor=on?\'#F5E6C8\':\'#3D1F0D\';c.style.color=on?\'transparent\':\'#fff\';">' +
      '<div><div style="font-weight:700;font-size:14px;color:#2A1506">' + emoji + ' ' + label + '</div><div style="font-size:12px;color:#8A6A4E">' + sub + '</div></div>' +
      '<div id="' + id + '" data-on="0" style="' + checkStyle + '">✓</div>' +
      '</label>';
  }

  var extrasHtml = '';
  if (p.opcionQueso || p.opcionGratinado) {
    extrasHtml += '<div style="border-top:1px solid #F5E6C8;margin-top:14px;padding-top:14px">';
    extrasHtml += '<div style="font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Extras opcionales</div>';
    if (p.opcionQueso) extrasHtml += makeCheck(qId, '🧀', 'Añadir queso mozzarella', '+1,00 €');
    if (p.opcionGratinado) extrasHtml += makeCheck(gId, '🔥', 'Gratinar (con queso)', '+0,50 € · incluye gratinado del queso');
    extrasHtml += '</div>';
  }

  extrasHtml += '<div style="margin-top:12px">' +
    '<div style="font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Nota</div>' +
    '<textarea id="promo-nota" placeholder="Instrucciones especiales..." style="width:100%;padding:10px 14px;border:1.5px solid #F5E6C8;border-radius:10px;font-size:13px;font-family:DM Sans,sans-serif;resize:none;box-sizing:border-box;background:#fff;outline:none;color:#2A1506" rows="2"></textarea>' +
    '</div>';

  var div = document.createElement('div');
  div.id = 'promo-modal-overlay';
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(61,31,13,0.5);z-index:9999;display:flex;align-items:flex-end;justify-content:center';

  var inner = document.createElement('div');
  inner.style.cssText = 'background:#FFF8EE;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 32px;max-height:85vh;overflow-y:auto';

  var titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px';
  titleRow.innerHTML = '<div style="font-size:20px;font-weight:800;color:#3D1F0D;font-family:Playfair Display,serif">' + escapeHtml(p.nombre) + '</div>';
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = 'background:none;border:none;font-size:22px;color:#8A6A4E;cursor:pointer;padding:0;line-height:1';
  closeBtn.onclick = function() { div.remove(); };
  titleRow.appendChild(closeBtn);

  var descEl = document.createElement('div');
  descEl.style.cssText = 'font-size:13px;color:#8A6A4E;margin-bottom:2px';
  descEl.textContent = p.descripcion || '';

  var extrasEl = document.createElement('div');
  extrasEl.innerHTML = extrasHtml;

  var confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Añadir al carrito · ' + parseFloat(p.precio).toFixed(2).replace('.', ',') + ' €';
  confirmBtn.style.cssText = 'width:100%;padding:14px;background:#3D1F0D;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif;margin-top:16px';
  confirmBtn.onclick = function() { promoConfirmarModal(p.id); };

  inner.appendChild(titleRow);
  inner.appendChild(descEl);
  inner.appendChild(extrasEl);
  inner.appendChild(confirmBtn);
  div.appendChild(inner);
  document.body.appendChild(div);
}

function promoConfirmarModal(id) {
  var promos = promosLoad();
  var p = promos.find(function(x) { return x.id === id; });
  if (!p) return;
  var opts = {};
  var quesoEl = document.getElementById('promo-check-queso');
  var gratinadoEl = document.getElementById('promo-check-gratinado');
  if (quesoEl) opts.extraQueso = quesoEl.dataset.active === '1';
  if (gratinadoEl) opts.extraGratinado = gratinadoEl.dataset.active === '1';
  promoAddToCart(p, opts);
  document.getElementById('promo-modal-overlay').remove();
}

function promoAddToCart(p, opts) {
  if (!window.promoCart) window.promoCart = {};
  var key = 'promo_' + p.id + '_' + Date.now();
  window.promoCart[key] = { promo: p, opts: opts, qty: 1 };
  updateCart();
  showToast('cart-toast', '🔥 ' + p.nombre + ' añadida');
}

// ── CONFIG (lectura) ──
function loadConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    if (c.store_email) Object.assign(CONFIG, c);
  } catch {}
}

// ── HORARIO: solo lo que necesita cualquier visitante (pintar el footer,
// evaluar si hoy está abierto). Editarlo es cosa de admin, ver
// admin-config.js. ──
const DIAS_RANGES = [{
  dias: [1, 2, 3, 4, 5, 6, 0],
  label: 'Lunes a Domingo'
}, {
  dias: [2, 3, 4, 5, 6, 0],
  label: 'Martes a Domingo'
}, {
  dias: [1, 2, 3, 4, 5, 6],
  label: 'Lunes a Sábado'
}, {
  dias: [2, 3, 4, 5, 6],
  label: 'Martes a Sábado'
}, {
  dias: [1, 2, 3, 4, 5],
  label: 'Lunes a Viernes'
}, {
  dias: [6, 0],
  label: 'Sábado y Domingo'
}];
function diasLabel(diasAbiertos) {
  const sorted = [...diasAbiertos].sort((a, b) => a - b);
  const match = DIAS_RANGES.find(r => r.dias.length === sorted.length && r.dias.every(d => sorted.includes(d)));
  if (match) return match.label;
  const DIAS_FULL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return diasAbiertos.map(d => DIAS_FULL[d]).join(', ');
}
function updateFooterHorario(h) {
  const footer = document.getElementById('footer-horario');
  if (footer) {
    var _h$diasAbiertos;
    const diasAbiertos = (_h$diasAbiertos = h.diasAbiertos) !== null && _h$diasAbiertos !== void 0 ? _h$diasAbiertos : [2, 3, 4, 5, 6, 0];
    footer.textContent = '🕐 ' + diasLabel(diasAbiertos) + ' · Mañanas ' + h.manOpen + '–' + h.manClose + ' · Tardes ' + h.tarOpen + '–' + h.tarClose;
  }
  const patatas = document.getElementById('footer-patatas');
  if (patatas) patatas.textContent = '🥔 Patatas asadas a partir de las 19:30h';
}

function updateOpenBtn(open) {
  const btn = document.getElementById('open-toggle-btn');
  if (!btn) return;
  btn.className = 'open-toggle ' + (open ? 'abierto' : 'cerrado');
  btn.textContent = open ? '✅ Abierto ahora' : '❌ Cerrado ahora';
}
function updateHeroDot(open) {
  const dot = document.querySelector('.dot');
  const pill = document.querySelector('.hero-pill');
  if (!dot || !pill) return;
  dot.style.background = open ? '#5ECC76' : '#e74c3c';
  pill.querySelector('span') && (pill.querySelector('span').textContent = open ? 'Abierto ahora' : 'Cerrado ahora');
}

// ── AVISO DE CIERRE AUTOMÁTICO ──
function getMinutes(timeStr, isClose) {
  if (!timeStr) return null;
  const _timeStr$split$map = timeStr.split(':').map(Number),
    _timeStr$split$map2 = _slicedToArray(_timeStr$split$map, 2),
    h = _timeStr$split$map2[0],
    m = _timeStr$split$map2[1];
  if (isNaN(h)) return null;
  const mins = h * 60 + m;
  // 00:00 como hora de cierre significa medianoche = fin del día (1440 min)
  return isClose && mins === 0 ? 1440 : mins;
}
function checkAutoCloseWarning() {
  var _h$diasAbiertos2;
  const manualOpen = localStorage.getItem('dpf_open') !== 'false';
  let h;
  try {
    h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
  } catch {
    return;
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Bloquear pedidos si hoy es día cerrado (independientemente del toggle manual)
  const todayDay = now.getDay();
  const diasAbiertos = (_h$diasAbiertos2 = h.diasAbiertos) !== null && _h$diasAbiertos2 !== void 0 ? _h$diasAbiertos2 : [2, 3, 4, 5, 6, 0];
  if (!diasAbiertos.includes(todayDay)) {
    const dot2 = document.querySelector('.dot');
    const statusEl2 = document.getElementById('hero-status-text');
    const existingBanner2 = document.getElementById('closing-soon-banner');
    if (dot2) dot2.style.background = '#e74c3c';
    if (statusEl2) statusEl2.textContent = 'Cerrado hoy';
    if (existingBanner2) existingBanner2.remove();
    // Calcular próximo día abierto con su hora de apertura
    const sessions = [{
      open: h.manOpen,
      close: h.manClose
    }, {
      open: h.tarOpen,
      close: h.tarClose
    }].filter(s => s.open && s.close).sort((a, b) => {
      const _a$open$split$map = a.open.split(':').map(Number),
        _a$open$split$map2 = _slicedToArray(_a$open$split$map, 2),
        ah = _a$open$split$map2[0],
        am = _a$open$split$map2[1];
      const _b$open$split$map = b.open.split(':').map(Number),
        _b$open$split$map2 = _slicedToArray(_b$open$split$map, 2),
        bh = _b$open$split$map2[0],
        bm = _b$open$split$map2[1];
      return ah * 60 + am - (bh * 60 + bm);
    });
    const firstSession = sessions[0];
    let nextDayLabel = 'mañana';
    if (diasAbiertos.length) {
      for (let i = 1; i <= 7; i++) {
        const candidate = (todayDay + i) % 7;
        if (diasAbiertos.includes(candidate)) {
          if (i === 1) nextDayLabel = 'mañana';else {
            const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            nextDayLabel = 'el ' + nombres[candidate];
          }
          break;
        }
      }
    }
    const closedDayMsg = h.closedMsgDay || (firstSession ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + ' a las ' + firstSession.open + '!' : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + '!');
    // Cerrar formulario de pedidos como si estuviera pausado
    const banner = document.getElementById('orders-closed-banner');
    const bannerMsg = document.getElementById('orders-closed-msg');
    const orderForm = document.getElementById('order-form');
    const totalRow = document.getElementById('cart-total-row');
    const lockedMsg = document.getElementById('cart-locked-msg');
    const lockedDetail = document.getElementById('cart-locked-detail');
    if (banner) {
      banner.style.display = 'block';
    }
    if (bannerMsg) bannerMsg.textContent = closedDayMsg;
    if (orderForm) orderForm.style.display = 'none';
    if (totalRow) totalRow.style.display = 'none';
    if (lockedMsg) lockedMsg.style.display = 'block';
    if (lockedDetail) lockedDetail.textContent = closedDayMsg;
    return;
  }

  // Si el toggle manual está cerrado, no seguir con la lógica de horario
  if (!manualOpen) return;
  // Franja continua: igual que en isOutsideHours, el negocio está abierto
  // de forma ininterrumpida desde manOpen hasta tarClose (sin hueco a
  // mediodía). manOpen/tarClose siguen editándose por separado en el panel,
  // pero aquí solo se usan los extremos.
  const openStartMin = getMinutes(h.manOpen) ?? getMinutes(h.tarOpen);
  const closeEndMin = getMinutes(h.tarClose, true) ?? getMinutes(h.manClose, true);
  const sessions = (openStartMin !== null && closeEndMin !== null)
    ? [{ open: openStartMin, close: closeEndMin }]
    : [];
  const dot = document.querySelector('.dot');
  const statusEl = document.getElementById('hero-status-text');
  if (!dot || !statusEl) return;
  const existingBanner = document.getElementById('closing-soon-banner');
  const activeSession = sessions.find(s => nowMin >= s.open && nowMin < s.close);
  if (activeSession) {
    const minsLeft = activeSession.close - nowMin;
    if (minsLeft <= 30) {
      dot.style.background = '#F5A623';
      statusEl.textContent = minsLeft <= 1 ? 'Cerramos ahora' : "Cerramos en ".concat(minsLeft, " min");
      if (!existingBanner) {
        const banner = document.createElement('div');
        banner.id = 'closing-soon-banner';
        banner.style.cssText = 'background:#FFF3CD;border-bottom:2px solid #3D1F0D;color:#7A4A00;text-align:center;padding:12px 24px;font-size:14px;font-weight:600;font-family:\'DM Sans\',sans-serif;display:flex;align-items:center;justify-content:center';
        banner.innerHTML = '<span style="font-size:18px">⏰</span><span id="closing-banner-text"></span>';
        const ref = document.getElementById('orders-closed-banner');
        ref.parentNode.insertBefore(banner, ref);
      }
      const bt = document.getElementById('closing-banner-text');
      if (bt) bt.textContent = minsLeft <= 1 ? '¡Cerramos ahora! Último momento para hacer tu pedido.' : "Cerramos en ".concat(minsLeft, " minuto").concat(minsLeft !== 1 ? 's' : '', ". \xA1Date prisa!");
    } else {
      // Respetar cierre manual del admin
      if (localStorage.getItem('dpf_open_manual_override')) {
        dot.style.background = '#e74c3c';
        statusEl.textContent = 'Cerrado ahora';
      } else {
        dot.style.background = '#5ECC76';
        statusEl.textContent = 'Abierto ahora';
        if (existingBanner) existingBanner.remove();
      }
    }
  } else {
    const nextOpen = sessions.filter(s => s.open > nowMin).sort((a, b) => a.open - b.open)[0];
    dot.style.background = '#e74c3c';
    if (nextOpen) {
      const hh = Math.floor(nextOpen.open / 60).toString().padStart(2, '0');
      const mm = (nextOpen.open % 60).toString().padStart(2, '0');
      statusEl.textContent = "Abrimos a las ".concat(hh, ":").concat(mm);
    } else {
      statusEl.textContent = 'Cerrado ahora';
    }
    if (existingBanner) existingBanner.remove();
  }
}
checkAutoCloseWarning();
// El intervalo de re-chequeo automático se registra en aplicarEstadoInicial (initConHorarioFirebase)
// para evitar duplicados. No registrar otro aquí.

const ORDERS_KEY = 'dpf_orders_open';
const ORDERS_MSG_KEY = 'dpf_orders_msg';
const STATS_KEY = 'dpf_day_stats';

// ── GASTOS DE GESTIÓN (lectura — guardarlos es cosa de admin) ──
const FEE_ENABLED_KEY = 'dpf_fee_enabled';
const FEE_AMOUNT_KEY = 'dpf_fee_amount';
const FEE_LABEL_KEY = 'dpf_fee_label';
function getFeeEnabled() {
  return localStorage.getItem(FEE_ENABLED_KEY) === 'true';
}
function getFeeAmount() {
  return parseFloat(localStorage.getItem(FEE_AMOUNT_KEY) || '0.50');
}
function getFeeLabel() {
  return localStorage.getItem(FEE_LABEL_KEY) || 'Gastos de gestión online';
}
function loadFeeFromFirebase() {
  console.log('[fee] loadFeeFromFirebase called, fb_listenFeeConfig=', typeof window.fb_listenFeeConfig);
  // Carga directa de una sola vez, antes de suscribirse al listener en
  // tiempo real — el listener puede tardar en entregar su primer valor más
  // de lo que tarda un cliente rápido en confirmar el pedido (ver
  // esperarConfigCriticaLista() más abajo, que espera a este flag).
  if (window.fb_loadFeeConfig) {
    window.fb_loadFeeConfig().then(function (cfg) {
      if (cfg) {
        if (cfg.enabled !== undefined) localStorage.setItem(FEE_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
        if (cfg.amount !== undefined) localStorage.setItem(FEE_AMOUNT_KEY, String(cfg.amount));
        if (cfg.label !== undefined) localStorage.setItem(FEE_LABEL_KEY, cfg.label);
        renderCart();
      }
    }).catch(function () {}).finally(function () { window._feeConfigListo = true; });
  } else {
    window._feeConfigListo = true;
  }
  if (!window.fb_listenFeeConfig) {
    console.warn('[fee] fb_listenFeeConfig no disponible');
    return;
  }
  window.fb_listenFeeConfig(function (cfg) {
    console.log('[fee] listener fired, cfg=', JSON.stringify(cfg));
    if (cfg.enabled !== undefined) localStorage.setItem(FEE_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.amount !== undefined) localStorage.setItem(FEE_AMOUNT_KEY, String(cfg.amount));
    if (cfg.label !== undefined) localStorage.setItem(FEE_LABEL_KEY, cfg.label);
    console.log('[fee] after update: enabled=', localStorage.getItem(FEE_ENABLED_KEY));
    renderCart();
  });
}

// Etiqueta que cuenta como "gastos de GESTIÓN" (a efectos de qué gasto fijo
// exime el código de "pedido desde el local") — igual que
// _esEtiquetaDeGestionPHP() en guardar-pedido.php, para que cliente y
// servidor decidan siempre lo mismo.
function _esEtiquetaDeGestion(label) {
  const l = (label || '').toLowerCase();
  return l.indexOf('gestión') !== -1 || l.indexOf('gestion') !== -1;
}

// ── SEGUNDO GASTO FIJO (lectura) ──
const FEE2_ENABLED_KEY = 'dpf_fee2_enabled';
const FEE2_AMOUNT_KEY = 'dpf_fee2_amount';
const FEE2_LABEL_KEY = 'dpf_fee2_label';
function getFee2Enabled() {
  return localStorage.getItem(FEE2_ENABLED_KEY) === 'true';
}
function getFee2Amount() {
  return parseFloat(localStorage.getItem(FEE2_AMOUNT_KEY) || '0.50');
}
function getFee2Label() {
  return localStorage.getItem(FEE2_LABEL_KEY) || 'Otro gasto fijo';
}
function loadFee2FromFirebase() {
  if (window.fb_loadFee2Config) {
    window.fb_loadFee2Config().then(function (cfg) {
      if (cfg) {
        if (cfg.enabled !== undefined) localStorage.setItem(FEE2_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
        if (cfg.amount !== undefined) localStorage.setItem(FEE2_AMOUNT_KEY, String(cfg.amount));
        if (cfg.label !== undefined) localStorage.setItem(FEE2_LABEL_KEY, cfg.label);
        renderCart();
      }
    }).catch(function () {}).finally(function () { window._fee2ConfigListo = true; });
  } else {
    window._fee2ConfigListo = true;
  }
  if (!window.fb_listenFee2Config) return;
  window.fb_listenFee2Config(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(FEE2_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.amount !== undefined) localStorage.setItem(FEE2_AMOUNT_KEY, String(cfg.amount));
    if (cfg.label !== undefined) localStorage.setItem(FEE2_LABEL_KEY, cfg.label);
    renderCart();
  });
}

// ── DESCUENTO ESTUDIANTE/JUBILADO (lectura — el cliente marca la casilla) ──
// ── VERIFICACIÓN SMS OBLIGATORIA (interruptor de emergencia) ── — por
// defecto activada (si nunca se ha guardado nada, se trata como 'true'
// para no cambiar el comportamiento de siempre en ninguna instalación).
const SMS_VERIFICACION_ACTIVA_KEY = 'dpf_sms_verificacion_activa';
function getSmsVerificacionActiva() {
  const v = localStorage.getItem(SMS_VERIFICACION_ACTIVA_KEY);
  return v === null ? true : v === 'true';
}

const STUDENT_DISCOUNT_ENABLED_KEY = 'dpf_student_discount_enabled';
const STUDENT_DISCOUNT_PCT_KEY = 'dpf_student_discount_pct';
function getStudentDiscountEnabled() {
  return localStorage.getItem(STUDENT_DISCOUNT_ENABLED_KEY) === 'true';
}
function getStudentDiscountPct() {
  return parseFloat(localStorage.getItem(STUDENT_DISCOUNT_PCT_KEY) || '10');
}
function loadStudentDiscountFromFirebase() {
  if (window.fb_loadStudentDiscountConfig) {
    window.fb_loadStudentDiscountConfig().then(function (cfg) {
      if (cfg) {
        if (cfg.enabled !== undefined) localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
        if (cfg.pct !== undefined) localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(cfg.pct));
        renderCart();
      }
    }).catch(function () {}).finally(function () { window._studentDiscountConfigListo = true; });
  } else {
    window._studentDiscountConfigListo = true;
  }
  if (!window.fb_listenStudentDiscountConfig) return;
  window.fb_listenStudentDiscountConfig(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.pct !== undefined) localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(cfg.pct));
    renderCart();
  });
}

// ── CÓDIGO "PEDIDO DESDE EL LOCAL" (comprobación — crearlo es cosa de admin) ──
// Desde que este código también salta el SMS de verificación (no solo quita
// los gastos de gestión), caduca cada día: se guarda junto a su fecha
// (LOCAL_FEE_CODE_KEY guarda el JSON {code,fecha}) y solo cuenta como válido
// si esa fecha es la de hoy — así un cartel QR olvidado en el mostrador deja
// de servir solo, sin tener que acordarse de borrarlo, y generar uno nuevo
// de urgencia invalida el anterior al instante (solo se guarda uno a la vez).
// guardar-pedido.php vuelve a comprobar lo mismo por su cuenta antes de
// aceptar un pedido sin SMS, así que esta validación de aquí es solo para la
// experiencia del cliente (feedback al instante) — no hace falta ir al
// servidor para saberlo.
const LOCAL_FEE_CODE_KEY = 'dpf_local_fee_code';
let _codigoLocalValidado = false;
function _todayKeyLocal() {
  return new Date().toISOString().slice(0, 10);
}
function _localFeeCodeObj() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_FEE_CODE_KEY) || 'null');
    if (raw && typeof raw === 'object') return { code: raw.code || '', fecha: raw.fecha || '' };
  } catch (e) {}
  return { code: '', fecha: '' };
}
function getLocalFeeCode() {
  return _localFeeCodeObj().code;
}
function _modoLocalActivo() {
  return _codigoLocalValidado;
}
// Se llama en cada tecla del campo de código (input visible del carrito y
// el equivalente del drawer móvil, que se mantienen sincronizados entre
// sí) — compara contra el código real ya cargado en localStorage, nunca
// hace falta ir al servidor: es un código de un solo nivel (como una
// contraseña de wifi de cara al público), no un secreto que proteja nada
// más allá de quitar un par de euros de gasto de gestión y el SMS, y el
// propio panel deja cambiarlo cuando se quiera para que deje de valer.
function comprobarCodigoLocal() {
  const input = document.getElementById('local-fee-code-input');
  const feedback = document.getElementById('local-fee-code-feedback');
  const code = ((input && input.value) || '').trim().toUpperCase();
  const real = _localFeeCodeObj();
  _codigoLocalValidado = !!code && !!real.code && code === real.code && real.fecha === _todayKeyLocal();
  if (feedback) {
    if (!code) {
      feedback.textContent = '';
    } else if (_codigoLocalValidado) {
      feedback.textContent = '✅ Código válido — gastos de gestión y SMS anulados para este pedido';
      feedback.style.color = '#27855a';
    } else {
      feedback.textContent = '❌ Código incorrecto o caducado (el código cambia cada día)';
      feedback.style.color = 'var(--error)';
    }
  }
  renderCart();
}
// Si la visita llega con ?local=CODIGO en la URL (el QR impreso desde el
// panel, ver imprimirCartelQRLocal en impresora-termica.js), se valida
// solo con lo que haya en localStorage — se reintenta también nada más
// terminar de cargar el código real desde Firebase (loadLocalFeeCodeFromFirebase),
// por si esta visita es tan nueva que localStorage todavía estaba vacío.
function _comprobarCodigoLocalDesdeUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = (params.get('local') || '').trim().toUpperCase();
    if (!fromUrl) return;
    const real = _localFeeCodeObj();
    if (real.code && fromUrl === real.code && real.fecha === _todayKeyLocal()) {
      _codigoLocalValidado = true;
      const input = document.getElementById('local-fee-code-input');
      if (input) input.value = fromUrl;
      const box = document.getElementById('local-fee-code-box');
      if (box) box.style.display = 'flex';
      const feedback = document.getElementById('local-fee-code-feedback');
      if (feedback) { feedback.textContent = '✅ Código válido — gastos de gestión y SMS anulados para este pedido'; feedback.style.color = '#27855a'; }
      renderCart();
    }
  } catch (e) {}
}
function loadLocalFeeCodeFromFirebase() {
  if (window.fb_loadLocalFeeCode) {
    window.fb_loadLocalFeeCode().then(function (obj) {
      localStorage.setItem(LOCAL_FEE_CODE_KEY, JSON.stringify(obj || { code: '', fecha: '' }));
      _comprobarCodigoLocalDesdeUrl();
      renderCart();
    }).catch(function () {}).finally(function () { window._localCodeListo = true; });
  } else {
    window._localCodeListo = true;
  }
  if (!window.fb_listenLocalFeeCode) return;
  window.fb_listenLocalFeeCode(function (obj) {
    localStorage.setItem(LOCAL_FEE_CODE_KEY, JSON.stringify(obj || { code: '', fecha: '' }));
    renderCart();
  });
}

// ── TIEMPO DE ESPERA ENTRE TICKETS DEL LOCAL (lectura) ──
const TIENDA_ESPERA_KEY = 'dpf_tienda_espera_minutos';
function getTiendaEsperaMinutos() {
  return parseInt(localStorage.getItem(TIENDA_ESPERA_KEY) || '0', 10);
}
function loadTiendaEsperaMinutosFromFirebase() {
  if (!window.fb_listenTiendaEsperaMinutos) return;
  window.fb_listenTiendaEsperaMinutos(function (min) {
    localStorage.setItem(TIENDA_ESPERA_KEY, String(min || 0));
    const sel = document.getElementById('tc-tienda-espera');
    if (sel) sel.value = String(min || 0);
  });
}
function _asignarHoraTiendaQR() {
  const minutos = getTiendaEsperaMinutos();
  if (minutos <= 0) return null;
  const hora = new Date(Date.now() + minutos * 60000);
  return String(hora.getHours()).padStart(2, '0') + ':' + String(hora.getMinutes()).padStart(2, '0');
}

function esperarConfigCriticaLista(timeoutMs) {
  return new Promise(function (resolve) {
    const yaListo = function () {
      return !!(window._feeConfigListo && window._fee2ConfigListo && window._localCodeListo && window._studentDiscountConfigListo);
    };
    if (yaListo()) { resolve(); return; }
    const inicio = Date.now();
    const intervalo = setInterval(function () {
      if (yaListo() || (Date.now() - inicio) >= timeoutMs) {
        clearInterval(intervalo);
        resolve();
      }
    }, 100);
  });
}

// ── AVISO PREVIO DE SATURACIÓN — solo el estado PÚBLICO que ve cualquier
// cliente. La config de umbrales/mensaje (solo admin) vive en
// admin-config.js. ──
const AVISO_SAT_CONFIG_KEY = 'dpf_aviso_sat_config';
function getAvisoSaturacionConfig() {
  try { return JSON.parse(localStorage.getItem(AVISO_SAT_CONFIG_KEY) || '{}'); } catch { return {}; }
}
function loadAvisoSaturacionFromFirebase() {
  // Config (umbrales/mensaje) — solo tiene datos reales para una sesión de
  // admin (config/avisoSaturacionConfig es de solo-admin); para cualquier
  // otro visitante este listener simplemente no llega a disparar nunca,
  // sin error visible.
  if (window.fb_listenAvisoSaturacionConfig) {
    window.fb_listenAvisoSaturacionConfig(function (cfg) {
      localStorage.setItem(AVISO_SAT_CONFIG_KEY, JSON.stringify(cfg || {}));
      if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
    });
  }
  // Estado público (activo/mensaje) — este SÍ lo recibe cualquier cliente,
  // es el que de verdad pinta el banner de "hay bastante ambiente" en la web.
  if (window.fb_listenAvisoSaturacionEstado) {
    window.fb_listenAvisoSaturacionEstado(function (estado) {
      if (typeof _renderAvisoSaturacionBanner === 'function') _renderAvisoSaturacionBanner(estado || { activo: false, msg: '' });
    });
  }
}
function _setAvisoSaturacionEstado(activo, msg) {
  if (window.fb_saveAvisoSaturacionEstado) window.fb_saveAvisoSaturacionEstado(!!activo, msg || '').catch(() => {});
}

// ── PAUSA EXPRÉS — la cuenta atrás que ve el cliente en el candado
// (lanzarla/cancelarla es cosa de admin, ver admin-config.js) ──
function _renderPausaExpresUI(hasta) {
  const el = document.getElementById('pausa-expres-estado-texto');
  if (!el) return;
  const restante = (hasta || 0) - Date.now();
  if (restante > 0) {
    const min = Math.ceil(restante / 60000);
    el.innerHTML = '⏸️ Pausado ' + min + ' min más — <a href="#" onclick="event.preventDefault();cancelarPausaExpres()" style="color:var(--brown);text-decoration:underline">cancelar</a>';
  } else {
    el.textContent = '';
  }
}
function loadPausaExpresFromFirebase() {
  if (!window.fb_listenPausaExpresHasta) return;
  window.fb_listenPausaExpresHasta(function (hasta) {
    localStorage.setItem('dpf_pausa_expres_hasta', String(hasta || 0));
    if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(hasta || 0);
    if (typeof _actualizarBloqueoPorPausaExpres === 'function') _actualizarBloqueoPorPausaExpres();
  });
}

// ── CONFIGURACIÓN DEL TICKET (lectura — usada al construir el ticket del
// pedido en carrito-checkout.js) ──
const TICKET_CONFIG_KEY = 'dpf_ticket_config';
const TICKET_CONFIG_DEFAULTS = {
  nombre: 'DULCE PATATA FOOD',
  direccion: 'Carretera de Málaga 111, Granada',
  telefono: '604 82 31 80',
  despedida: '¡Gracias por tu pedido! 🥔',
  textoPago: 'Pagar en caja',
  anchoPapel: 80,
  copias: 1,
  autoImprimir: true
};
function getTicketConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(TICKET_CONFIG_KEY) || '{}');
    return Object.assign({}, TICKET_CONFIG_DEFAULTS, saved);
  } catch (e) {
    return Object.assign({}, TICKET_CONFIG_DEFAULTS);
  }
}
function loadTicketConfigFromFirebase() {
  if (!window.fb_listenTicketConfig) return;
  window.fb_listenTicketConfig(function (cfg) {
    localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
    if (typeof bimbaPintarTicketConfig === 'function') bimbaPintarTicketConfig();
  });
}

// ── ABIERTO/CERRADO — evaluación real para cualquier visitante (activar/
// desactivar a mano es cosa de admin, ver admin-config.js) ──
function getOrdersOpen() {
  // Si estamos fuera de horario o hoy es día cerrado, siempre devolver false
  if (isOutsideHours() || !isTodayOpen()) return false;
  const val = localStorage.getItem(ORDERS_KEY);
  if (val === null || val === undefined) return true; // abierto por defecto
  return val !== 'false';
}
function updateOrdersUI(open, customMsg) {
  const btn = document.getElementById('orders-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (open ? 'abierto' : 'cerrado');
    btn.textContent = open ? '✅ Aceptando pedidos' : '⏸️ Pedidos pausados';
  }
  const msg = customMsg || localStorage.getItem(ORDERS_MSG_KEY) || 'Estamos al límite de capacidad. Vuelve en unos minutos.';
  const banner = document.getElementById('orders-closed-banner');
  const bannerMsg = document.getElementById('orders-closed-msg');
  const orderForm = document.getElementById('order-form');
  const totalRow = document.getElementById('cart-total-row');
  const lockedMsg = document.getElementById('cart-locked-msg');
  const lockedDetail = document.getElementById('cart-locked-detail');
  if (banner) banner.style.display = open ? 'none' : 'block';
  if (bannerMsg) bannerMsg.textContent = msg;
  if (!open) {
    // Cerrado: ocultar formulario y total, mostrar candado
    if (orderForm) orderForm.style.display = 'none';
    if (totalRow) totalRow.style.display = 'none';
    if (lockedMsg) lockedMsg.style.display = 'block';
    if (lockedDetail) lockedDetail.textContent = msg;
  } else {
    // Abierto: ocultar candado, dejar que renderCart decida el resto
    if (lockedMsg) lockedMsg.style.display = 'none';
    renderCart();
  }
}
function isTodayOpen() {
  try {
    var _h$diasAbiertos3;
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    // Si no hay horario en localStorage aún (cuenta nueva / otro dispositivo),
    // asumir abierto — Firebase actualizará en cuanto responda
    const diasAbiertos = (_h$diasAbiertos3 = h.diasAbiertos) !== null && _h$diasAbiertos3 !== void 0 ? _h$diasAbiertos3 : [2, 3, 4, 5, 6, 0];
    // Día de servicio: antes de las 06:00 pertenece al día anterior
    const now = new Date();
    const serviceDay = (now.getHours() < 6)
      ? (now.getDay() + 6) % 7  // día anterior
      : now.getDay();
    return diasAbiertos.includes(serviceDay);
  } catch {
    return true;
  } // en caso de error, asumir abierto
}
function isOutsideHours() {
  try {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    if (!h.manOpen && !h.tarOpen) return false;
    const now = new Date();
    // Día de servicio: antes de las 06:00 tratamos la hora como 24h+ (ej: 00:30 → 1470 min)
    const rawMin = now.getHours() * 60 + now.getMinutes();
    const nowMin = (now.getHours() < 6) ? rawMin + 1440 : rawMin;

    // El negocio acepta pedidos de forma continua desde el inicio de la
    // sesión de mañana (manOpen) hasta el cierre de la sesión de noche
    // (tarClose), SIN tener en cuenta el hueco entre manClose y tarOpen
    // (ej: 13:45–18:00 sigue contando como "abierto" para pedidos, aunque
    // ese tramo no se muestre como sesión activa en el panel admin).
    // Los campos manOpen/manClose/tarOpen/tarClose se mantienen igual en
    // el panel para que sigan editándose por separado, pero a efectos de
    // "Abierto/Cerrado" solo importan los extremos: manOpen y tarClose.
    const openStart = getMinutes(h.manOpen) ?? getMinutes(h.tarOpen);
    const closeEnd = getMinutes(h.tarClose, true) ?? getMinutes(h.manClose, true);
    if (openStart === null || closeEnd === null) return false;

    const inSession = (closeEnd < openStart)
      ? (nowMin >= openStart || nowMin < closeEnd)
      : (nowMin >= openStart && nowMin < closeEnd);
    if (inSession) return false;
    // Fuera de la franja continua (ej: antes de manOpen o después de tarClose) → cerrado
    return true;
  } catch {
    return false;
  }
}
function loadOrdersStatus() {
  // Ejecutar inmediatamente con lo que hay en local (puede ser vacío)
  _ejecutarLoadOrdersStatus();
  // Siempre intentar cargar de Firebase en segundo plano y actualizar si hay cambios
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        const localRaw = localStorage.getItem(HORARIO_KEY);
        const localStr = localRaw ? JSON.stringify(JSON.parse(localRaw)) : '';
        const fbStr = JSON.stringify(hFb);
        if (fbStr !== localStr) {
          // Hay cambios — actualizar local y re-evaluar
          localStorage.setItem(HORARIO_KEY, fbStr);
          updateFooterHorario(hFb);
          _ejecutarLoadOrdersStatus();
        }
      }
    }).catch(() => {});
  }
}
function _ejecutarLoadOrdersStatus() {
  // Si hoy es día cerrado, bloquear pedidos con mensaje de próxima apertura
  if (!isTodayOpen()) {
    var _h2$diasAbiertos;
    const h2 = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const diasAbiertos2 = (_h2$diasAbiertos = h2.diasAbiertos) !== null && _h2$diasAbiertos !== void 0 ? _h2$diasAbiertos : [2, 3, 4, 5, 6, 0];
    const sessions2 = [{
      open: h2.manOpen,
      close: h2.manClose
    }, {
      open: h2.tarOpen,
      close: h2.tarClose
    }].filter(s => s.open && s.close).sort((a, b) => {
      const _a$open$split$map3 = a.open.split(':').map(Number),
        _a$open$split$map4 = _slicedToArray(_a$open$split$map3, 2),
        ah = _a$open$split$map4[0],
        am = _a$open$split$map4[1];
      const _b$open$split$map3 = b.open.split(':').map(Number),
        _b$open$split$map4 = _slicedToArray(_b$open$split$map3, 2),
        bh = _b$open$split$map4[0],
        bm = _b$open$split$map4[1];
      return ah * 60 + am - (bh * 60 + bm);
    });
    const firstSession2 = sessions2[0];
    const todayIdx2 = new Date().getDay();
    let nextDayLabel2 = 'mañana';
    for (let i = 1; i <= 7; i++) {
      const candidate = (todayIdx2 + i) % 7;
      if (diasAbiertos2.includes(candidate)) {
        if (i === 1) nextDayLabel2 = 'mañana';else {
          const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
          nextDayLabel2 = 'el ' + nombres[candidate];
        }
        break;
      }
    }
    const closedMsg2 = h2.closedMsgDay || (firstSession2 ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + ' a las ' + firstSession2.open + '!' : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + '!');
    updateOrdersUI(false, closedMsg2);
    return;
  }
  // Si estamos fuera del horario, mostrar cerrado con próxima apertura
  if (isOutsideHours()) {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    // La franja de apertura ahora es continua desde manOpen hasta tarClose
    // (sin hueco a mediodía), así que la única "próxima apertura" real es
    // manOpen — tarOpen ya no representa un segundo arranque independiente.
    const openStart = h.manOpen || h.tarOpen;
    var _hDias; const diasAbiertos = (_hDias = h.diasAbiertos) !== null && _hDias !== void 0 ? _hDias : [2, 3, 4, 5, 6, 0];
    let nextOpen = null;
    if (nowMins >= 360 && openStart) {
      const [sh, sm] = openStart.split(':').map(Number);
      const openMins = sh * 60 + sm;
      if (openMins > nowMins) nextOpen = openStart;
    }
    // Usar mensaje personalizado: hoy mismo más tarde (madrugada→manOpen) o cierre nocturno (ya pasó tarClose)
    let msg;
    if (nextOpen) {
      // Aún no ha llegado la apertura de hoy (estamos de madrugada)
      msg = h.closedMsgMid || 'Ahora estamos cerrados. ¡Volvemos a las ' + nextOpen + '!';
    } else {
      // Ya pasó el cierre de hoy (tarClose) → cierre nocturno, próxima apertura es otro día
      let nextDayLabel = 'mañana';
      if (diasAbiertos.length) {
        const todayIdx = now.getDay();
        for (let i = 1; i <= 7; i++) {
          const candidate = (todayIdx + i) % 7;
          if (diasAbiertos.includes(candidate)) {
            if (i === 1) nextDayLabel = 'mañana';else {
              const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
              nextDayLabel = 'el ' + nombres[candidate];
            }
            break;
          }
        }
      }
      msg = h.closedMsgNight || (openStart ? 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + ' a las ' + openStart + '!' : 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + '!');
    }
    updateOrdersUI(false, msg);
    return;
  }
  // Estamos en día y hora de apertura — respetar cierre manual si existe
  checkVacationMode();
  // Solo el admin autenticado necesita sincronizar este estado hacia Firebase;
  // un cliente anónimo mirando la carta no tiene permiso de escritura en
  // config/ (por diseño, en las Firebase Rules) y antes lo intentaba igual,
  // generando avisos de "permission_denied" en la consola sin ningún efecto.
  const _esAdminAutenticado = !!(window.fb_getAdminUser && window.fb_getAdminUser());
  firebase.database().ref('config/openManualOverride').once('value').then(sn => {
    const manualClosed = sn.exists() && sn.val() === true;
    if (manualClosed || localStorage.getItem('dpf_open_manual_override')) {
      localStorage.setItem(OPEN_KEY, 'false');
      localStorage.setItem('dpf_open_manual_override', '1');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
      updateOpenBtn(false);
      updateHeroDot(false);
    } else {
      localStorage.setItem(OPEN_KEY, 'true');
      localStorage.setItem(ORDERS_KEY, 'true');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
      if (_esAdminAutenticado && window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    }
  }).catch(() => {
    if (!localStorage.getItem('dpf_open_manual_override')) {
      localStorage.setItem(OPEN_KEY, 'true');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
    }
  });
  const open = getOrdersOpen(); // getOrdersOpen ya respeta el horario
  updateOrdersUI(open);
  const savedMsg = localStorage.getItem(ORDERS_MSG_KEY);
  const msgInput = document.getElementById('orders-pause-msg');
  if (msgInput && savedMsg) msgInput.value = savedMsg;
}
function showToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2500);
}

// ── FORMATO TELÉFONO ──
function formatPhone(input) {
  // Solo dígitos, max 9
  let digits = input.value.replace(/\D/g, '').slice(0, 9);
  // Formato XXX XXX XXX
  let formatted = digits;
  if (digits.length > 6) formatted = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);else if (digits.length > 3) formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
  input.value = formatted;
  _validarTelefonoEnVivo(input, digits);
  // Comprobar premio de fidelización cuando el número está completo (9 dígitos)
  if (digits.length === 9) {
    clearTimeout(window._fidelizacionCheckTimer);
    window._fidelizacionCheckTimer = setTimeout(() => _comprobarPremioFidelizacion(digits), 400);
  } else {
    _ocultarAvisoPremioFidelizacion();
  }
}

// Aviso en vivo bajo el campo de teléfono, sin esperar a confirmar el
// pedido — antes el cliente solo se enteraba de un número mal escrito al
// llegar al paso del SMS, un viaje de ida y vuelta que se evita avisando
// ya mientras escribe. Busca el div "<id-del-input>-feedback" junto al
// input (desktop y drawer móvil llevan cada uno el suyo, mismo patrón).
function _validarTelefonoEnVivo(input, digits) {
  const feedback = document.getElementById(input.id + '-feedback');
  if (!feedback) return;
  if (!digits.length) {
    feedback.style.display = 'none';
    input.style.borderColor = '';
    return;
  }
  const prefijoValido = digits[0] === '6' || digits[0] === '7';
  if (!prefijoValido) {
    feedback.style.display = 'block';
    feedback.style.color = 'var(--error)';
    feedback.textContent = '❌ Los móviles españoles empiezan por 6 o 7 — revisa el número';
    input.style.borderColor = 'var(--error)';
  } else if (digits.length < 9) {
    feedback.style.display = 'none';
    input.style.borderColor = '';
  } else {
    feedback.style.display = 'block';
    feedback.style.color = '#27855a';
    feedback.textContent = '✅ Número válido';
    input.style.borderColor = '#27855a';
  }
}

// ── FIDELIZACIÓN: comprobación de premio disponible al introducir teléfono ──
async function _comprobarPremioFidelizacion(phoneClean) {
  // Consulta server-side (fidelizacion.php) en vez de leer Firebase
  // directamente — así solo se ve lo mínimo (sellos/premios de ESTE
  // teléfono) y nadie puede fisgonear el nombre/historial de otro cliente.
  try {
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'consultar', telefono: phoneClean })
    });
    const data = await res.json();
    if (!data.success) return;
    const cliente = { sellos: data.sellos, premiosPendientes: data.premiosPendientes, vecesCompletado: data.vecesCompletado };
    const premiosPendientes = cliente.premiosPendientes;
    _pintarTarjetaSellos(phoneClean, cliente);
    if (cliente && premiosPendientes > 0) {
      window._fidelizacionPremioActivo = phoneClean;
      window._fidelizacionProximoSelloActivo = null;
      _ocultarAvisoProximoSelloFidelizacion();
      _mostrarAvisoPremioFidelizacion(phoneClean);
    } else if (cliente && cliente.sellos === FIDELIZACION_META - 1 && _carritoTienePatata()) {
      // El cliente está a 1 sello del premio (9/10) y este pedido ya incluye
      // patata: este sería el pedido que completa el sello. Avisamos antes
      // de confirmar, no después.
      window._fidelizacionPremioActivo = null;
      window._fidelizacionProximoSelloActivo = phoneClean;
      _ocultarAvisoPremioFidelizacion();
      _mostrarAvisoProximoSelloFidelizacion(phoneClean);
    } else {
      window._fidelizacionPremioActivo = null;
      window._fidelizacionProximoSelloActivo = null;
      _ocultarAvisoPremioFidelizacion();
      _ocultarAvisoProximoSelloFidelizacion();
    }
  } catch (e) { console.warn('[fidelizacion] error comprobando premio:', e); }
}
function _carritoTienePatata() {
  try {
    // Usar la función oficial del proyecto, que ya comprueba tanto el
    // carrito normal (cart) como el de productos personalizados (custCart) —
    // por ejemplo "Patata Al Gusto" vive en custCart, no en cart.
    return typeof cartHasPatatas === 'function' ? cartHasPatatas() : false;
  } catch (e) { return false; }
}
function _campoTelefonoVisible(phoneCleanEsperado) {
  // En escritorio el formulario vive en la página principal (customer-phone);
  // en el drawer/carrito lateral es drawer-customer-phone. Ambos pueden
  // existir en el DOM a la vez (con offsetParent válido) aunque solo uno
  // esté realmente en el viewport. Para evitar elegir el equivocado,
  // preferimos el campo cuyo valor coincide con el teléfono que se está
  // comprobando; si ninguno coincide, usamos visibilidad por tamaño real.
  const drawer = document.getElementById('drawer-customer-phone');
  const main = document.getElementById('customer-phone');
  if (phoneCleanEsperado) {
    const drawerDigits = drawer ? drawer.value.replace(/\D/g, '') : '';
    const mainDigits = main ? main.value.replace(/\D/g, '') : '';
    if (drawerDigits === phoneCleanEsperado && _tieneAreaVisible(drawer)) return drawer;
    if (mainDigits === phoneCleanEsperado && _tieneAreaVisible(main)) return main;
  }
  if (drawer && _tieneAreaVisible(drawer)) return drawer;
  if (main && _tieneAreaVisible(main)) return main;
  return drawer || main || null;
}
function _tieneAreaVisible(el) {
  if (!el || el.offsetParent === null) return false;
  const r = el.getBoundingClientRect();
  // Considerar "realmente visible" si está dentro de la ventana actual,
  // no solo presente en el flujo del documento (que puede estar muy
  // abajo, fuera del viewport, como un drawer cerrado).
  return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
}
function _mostrarAvisoPremioFidelizacion(phoneClean) {
  // Quitar cualquier aviso previo en el otro campo, por si se cambió de vista
  document.querySelectorAll('#fidelizacion-premio-aviso').forEach(e => e.remove());
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;
  const el = document.createElement('div');
  el.id = 'fidelizacion-premio-aviso';
  el.style.cssText = 'background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600';
  el.innerHTML = '🎁 ¡Tienes una patata gratis disponible! Añade cualquier patata del menú y se aplicará el descuento automáticamente al confirmar.';
  phoneInput.parentNode.appendChild(el);
}
function _ocultarAvisoPremioFidelizacion() {
  document.querySelectorAll('#fidelizacion-premio-aviso').forEach(e => e.remove());
  const rec = document.getElementById('submit-btn-reminder');
  if (rec) rec.style.display = 'none';
}
function _mostrarAvisoProximoSelloFidelizacion(phoneClean) {
  document.querySelectorAll('#fidelizacion-proximo-sello-aviso').forEach(e => e.remove());
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;
  const el = document.createElement('div');
  el.id = 'fidelizacion-proximo-sello-aviso';
  el.style.cssText = 'background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600';
  el.innerHTML = '🎉 ¡Este es tu pedido número 10! Al confirmarlo, tu patata gratis estará disponible en tu próximo pedido.';
  phoneInput.parentNode.appendChild(el);
}
function _ocultarAvisoProximoSelloFidelizacion() {
  document.querySelectorAll('#fidelizacion-proximo-sello-aviso').forEach(e => e.remove());
}

// ── TARJETA VISUAL DE SELLOS (progreso + premio + veces completado) ──
function _pintarTarjetaSellos(phoneClean, cliente) {
  document.querySelectorAll('.tarjeta-sellos-cliente').forEach(e => e.remove());
  if (!cliente) return;
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;

  const sellos = typeof cliente.sellos === 'number' ? cliente.sellos : 0;
  const premios = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  const veces = typeof cliente.vecesCompletado === 'number' ? cliente.vecesCompletado : 0;

  let dots = '';
  for (let i = 0; i < 10; i++) {
    dots += i < sellos
      ? '<span style="display:inline-block;font-size:19px;margin-right:1px;animation:selloPop .35s ease ' + (i * 0.05) + 's both">🥔</span>'
      : '<span style="display:inline-block;width:15px;height:15px;border-radius:50%;border:2px solid #E8D5B0;margin:0 5px 0 2px;vertical-align:middle"></span>';
  }

  const card = document.createElement('div');
  card.className = 'tarjeta-sellos-cliente';
  card.style.cssText = 'border-radius:12px;padding:12px 14px;margin-top:10px;font-family:\'DM Sans\',sans-serif;' +
    (premios > 0 ? 'background:#3D1F0D;color:#FFF8EE' : 'background:#FBEFD6;border:1.5px solid #F4C430;color:#3D1F0D');

  if (premios > 0) {
    card.innerHTML = '<div style="font-size:14px;font-weight:800;margin-bottom:2px">🎉 ¡Tienes ' + premios + ' patata' + (premios > 1 ? 's' : '') + ' gratis para canjear!</div>' +
      '<div style="font-size:12px;color:#F4C430">Añádela al carrito y se descontará sola al confirmar.</div>';
  } else {
    card.innerHTML = '<div style="font-size:12px;font-weight:700;margin-bottom:6px">🎁 Tus sellos: ' + sellos + '/10</div>' +
      '<div>' + dots + '</div>' +
      (veces > 0 ? '<div style="font-size:11px;color:#8A6A4E;margin-top:6px">🏅 Ya van ' + veces + ' patata' + (veces > 1 ? 's' : '') + ' gratis conseguidas</div>' : '');
  }
  phoneInput.parentNode.appendChild(card);

  const rec = document.getElementById('submit-btn-reminder');
  if (rec) rec.style.display = premios > 0 ? 'block' : 'none';

  // Confeti solo la primera vez que se detecta cada premio/ciclo nuevo (no en cada visita)
  try {
    const key = 'dpf_loyalty_seen_' + phoneClean;
    const prev = JSON.parse(localStorage.getItem(key) || 'null');
    const esNuevoLogro = (premios > 0 && (!prev || prev.premios < premios)) || (veces > 0 && (!prev || prev.veces < veces));
    if (esNuevoLogro) _lanzarConfetiSellos();
    localStorage.setItem(key, JSON.stringify({ premios, veces }));
  } catch {}
}

function _lanzarConfetiSellos() {
  try {
    const emojis = ['🎉', '🥔', '✨', '🎊'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden';
    for (let i = 0; i < 18; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:-24px;font-size:' + (16 + Math.random() * 10) + 'px;animation:confettiFall ' + (1.4 + Math.random() * 1.2) + 's ease-in ' + (Math.random() * 0.4) + 's forwards';
      container.appendChild(span);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3200);
  } catch {}
}

// ═══════════════════════════════════════════════════════════
//  RULETA DE PREMIOS / RASCA Y GANA
//
//  El premio lo decide juegos.php (cuenta de servicio) — este archivo
//  solo pide "quiero girar/rascar" y dibuja/anima lo que el servidor
//  devuelve. Nunca decide él mismo qué premio toca (por eso no hay
//  ningún Math.random() de premios aquí, solo de estética: colores,
//  vueltas extra de la ruleta, radio de cada rasca del cursor...).
//  El panel de admin para configurar los premios vive en juegos.js.
// ═══════════════════════════════════════════════════════════

const JUEGO_COLORES = ['#3D1F0D', '#C0392B', '#D9A441', '#27855a', '#8A6A4E', '#1f6f8b', '#a5471f', '#6b4226'];
const CONFETI_COLORES = ['#D9A441', '#C0392B', '#27855a', '#3D1F0D', '#FFF8EE', '#1f6f8b'];

window._juegoActivoActual = 'ninguno';
window._juegoState = { juego: null, premio: null, code: null };

// Confeti + sonido al ganar un premio de verdad (pct>0) — solo estética,
// no afecta a nada del cálculo/aplicación del premio. El sonido se
// sintetiza con Web Audio (sin archivo de audio que subir); si el
// navegador bloquea el audio por lo que sea, sigue mostrándose el confeti
// igualmente.
function _celebrarPremio() {
  _lanzarConfeti();
  _sonidoCelebracion();
}
function _lanzarConfeti() {
  const cont = document.createElement('div');
  cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden';
  document.body.appendChild(cont);
  const N = 60;
  for (let i = 0; i < N; i++) {
    const piece = document.createElement('div');
    const color = CONFETI_COLORES[i % CONFETI_COLORES.length];
    const left = Math.random() * 100;
    const size = 6 + Math.random() * 6;
    const duration = 2200 + Math.random() * 1400;
    const delay = Math.random() * 300;
    const rot = Math.random() * 360;
    piece.style.cssText = 'position:absolute;top:-20px;left:' + left + 'vw;width:' + size + 'px;height:' + (size * 0.4) + 'px;background:' + color + ';opacity:.9;transform:rotate(' + rot + 'deg);border-radius:2px;' +
      'animation:juegoConfetiCae ' + duration + 'ms ease-in ' + delay + 'ms forwards';
    cont.appendChild(piece);
  }
  setTimeout(() => cont.remove(), 4200);
}
function _sonidoCelebracion() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notas = [523.25, 659.25, 783.99, 1046.5]; // Do-Mi-Sol-Do, un arpegio alegre
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (e) { /* si el navegador bloquea el audio, no pasa nada — solo se pierde el sonido */ }
}

function _juegosInit() {
  if (window.fb_listenJuegoActivo) {
    window.fb_listenJuegoActivo(function (juego) {
      window._juegoActivoActual = juego || 'ninguno';
      _actualizarJuegoFab(window._juegoActivoActual);
    });
  }
}
if (window._firebaseReady) _juegosInit();
document.addEventListener('firebaseReady', _juegosInit);

// El banner de cookies (#cookies-banner, ver index.html) tapa toda la
// franja de abajo de la pantalla en móvil hasta que se acepta/rechaza, con
// un z-index mucho más alto que cualquier botón flotante — sin esto el
// botón del juego queda escondido debajo la primera vez que alguien entra.
// Se vigila con un observer en vez de tocar cookiesAceptar() directamente,
// así funciona pase lo que pase cómo se cierre el banner.
function _juegoFabVigilarBannerCookies() {
  const banner = document.getElementById('cookies-banner');
  const fab = document.getElementById('juego-fab');
  if (!banner || !fab) return;
  const actualizar = () => {
    const visible = getComputedStyle(banner).display !== 'none';
    fab.classList.toggle('sobre-banner-cookies', visible);
  };
  actualizar();
  new MutationObserver(actualizar).observe(banner, { attributes: true, attributeFilter: ['style'] });
}
document.addEventListener('DOMContentLoaded', _juegoFabVigilarBannerCookies);
if (document.readyState !== 'loading') _juegoFabVigilarBannerCookies();

function _actualizarJuegoFab(juego) {
  const fab = document.getElementById('juego-fab');
  const icon = document.getElementById('juego-fab-icon');
  if (fab) {
    if (juego === 'ruleta') {
      if (icon) icon.textContent = '🎡';
      fab.classList.remove('hidden');
    } else if (juego === 'rasca') {
      if (icon) icon.textContent = '🎫';
      fab.classList.remove('hidden');
    } else {
      fab.classList.add('hidden');
    }
  }
  document.querySelectorAll('#juego-activo-selector button').forEach(btn => {
    const on = btn.dataset.juego === juego;
    btn.style.background = on ? 'var(--brown)' : 'var(--white)';
    btn.style.color = on ? 'var(--gold)' : 'var(--brown)';
  });
}

function abrirJuegoActivo() {
  if (window._juegoActivoActual === 'ruleta') openRuleta();
  else if (window._juegoActivoActual === 'rasca') openRasca();
}

// Teléfono guardado de un pedido anterior (mismo patrón que usa el resto
// de la web para no pedirlo dos veces si ya lo tenemos).
function _juegoTelefonoGuardado() {
  try { return localStorage.getItem('dpf_customer_phone') || ''; } catch (e) { return ''; }
}

// El token que demuestra "quien pregunta es quien jugó" (ver juegos.php,
// necesario para poder recuperar un premio/código ya ganado hoy sin que
// cualquiera pueda robarlo solo probando teléfonos ajenos) se guarda aquí
// y se reenvía en cada giro — antes NUNCA se guardaba ni se mandaba de
// vuelta, así que el servidor jamás reconocía al dueño real al reabrir el
// juego: devolvía premio/code como null aunque el premio sí tuviera
// descuento, y quien cerraba el modal sin pulsar "aplicar" (o volvía a
// abrir el juego después) se quedaba sin ninguna forma real de recuperar
// su código el resto del día.
function _juegoTokenKey(juego) { return 'dpf_juego_token_' + juego; }
function _juegoTokenGuardado(juego) {
  try { return localStorage.getItem(_juegoTokenKey(juego)) || ''; } catch (e) { return ''; }
}
function _juegoGuardarToken(juego, token) {
  try { if (token) localStorage.setItem(_juegoTokenKey(juego), token); } catch (e) {}
}

async function _juegoGirar(juego, telefono) {
  const res = await fetch('juegos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'girar', juego, telefono, token: _juegoTokenGuardado(juego) })
  });
  return res.json();
}

function _aplicarPremioComun(juego) {
  const st = window._juegoState;
  if (juego === 'ruleta') closeRuleta(); else closeRasca();
  if (st && st.code) {
    const input = document.getElementById('discount-input');
    if (input) input.value = st.code;
    if (typeof dcAplicar === 'function') dcAplicar(st.code);
    showAlert('🎉 ¡Código ' + st.code + ' aplicado! El descuento ya está en tu pedido.', '¡Premio aplicado!');
  }
  if (typeof openCartDrawer === 'function' && window.innerWidth <= 700) openCartDrawer();
  else { const panel = document.querySelector('.order-panel'); if (panel) panel.scrollIntoView({ behavior: 'smooth' }); }
}

// ── RULETA ──────────────────────────────────────────────────────────────
let _ruletaPremios = [];
let _ruletaEjecutando = false;

function openRuleta() {
  document.getElementById('ruleta-modal').classList.add('open');
  document.getElementById('ruleta-intro').style.display = 'block';
  document.getElementById('ruleta-resultado').style.display = 'none';
  document.getElementById('ruleta-ya-jugaste').style.display = 'none';
  const btn = document.getElementById('ruleta-spin-btn');
  btn.disabled = false;
  btn.textContent = 'Girar la ruleta';
  const tel = document.getElementById('ruleta-telefono');
  if (tel) { tel.value = _juegoTelefonoGuardado(); if (tel.value) formatPhone(tel); }
  document.getElementById('ruleta-tel-error').style.display = 'none';
  const canvas = document.getElementById('ruleta-canvas');
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0deg)';
  requestAnimationFrame(() => { canvas.style.transition = ''; });
  (window.fb_loadRuletaConfig ? window.fb_loadRuletaConfig() : Promise.resolve(null)).then(cfg => {
    _ruletaPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios : [];
    _dibujarRuletaWheel(_ruletaPremios);
  }).catch(() => { _ruletaPremios = []; });
}
function closeRuleta() {
  document.getElementById('ruleta-modal').classList.remove('open');
}

function _dibujarRuletaWheel(premios) {
  const canvas = document.getElementById('ruleta-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, r = w / 2;
  ctx.clearRect(0, 0, w, h);
  if (!premios.length) {
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8A6A4E'; ctx.font = '13px DM Sans, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Sin premios configurados', cx, cy);
    return;
  }
  const seg = (Math.PI * 2) / premios.length;
  const n = premios.length;
  const emojiSize = n > 8 ? 13 : n > 6 ? 15 : n > 4 ? 17 : 20;
  const EMOJI_FONTS = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  // Ancho disponible para el texto: la cuerda del arco a la altura donde
  // se dibuja, con un margen — así el ajuste se basa en el hueco real de
  // cada porción (más estrecho cuantos más premios haya) y no en un
  // recuento de caracteres a ojo.
  const radialPos = r * 0.6;
  const maxTextWidth = Math.max(30, 2 * radialPos * Math.sin(seg / 2) * 0.82);

  // Reparte "nombre" en 1-2 líneas que quepan en maxTextWidth, reduciendo
  // el tamaño de letra si hace falta (hasta un mínimo legible). Devuelve
  // las líneas ya recortadas con "…" si ni así caben.
  function _ajustarTexto(nombre) {
    for (let size = 9; size >= 6; size--) {
      ctx.font = '600 ' + size + 'px DM Sans, sans-serif';
      if (ctx.measureText(nombre).width <= maxTextWidth) return { size, lineas: [nombre] };
      const palabras = nombre.split(' ');
      if (palabras.length > 1) {
        // Envuelve en 2 líneas por el espacio más cercano a la mitad.
        let mejor = 1, mejorDiff = Infinity;
        let acumulado = 0;
        for (let k = 0; k < palabras.length - 1; k++) {
          acumulado += palabras[k].length + 1;
          const diff = Math.abs(acumulado - nombre.length / 2);
          if (diff < mejorDiff) { mejorDiff = diff; mejor = k + 1; }
        }
        const l1 = palabras.slice(0, mejor).join(' ');
        const l2 = palabras.slice(mejor).join(' ');
        if (ctx.measureText(l1).width <= maxTextWidth && ctx.measureText(l2).width <= maxTextWidth) {
          return { size, lineas: [l1, l2] };
        }
      }
    }
    // Ni a tamaño mínimo cabe entero: recortar con "…"
    ctx.font = '600 6px DM Sans, sans-serif';
    let corto = nombre;
    while (corto.length > 1 && ctx.measureText(corto + '…').width > maxTextWidth) {
      corto = corto.slice(0, -1);
    }
    return { size: 6, lineas: [corto + '…'] };
  }

  premios.forEach((p, i) => {
    // Ángulo 0 = arriba (donde está el puntero), sentido horario.
    // En coordenadas de canvas eso equivale a restar 90°.
    const start = i * seg - Math.PI / 2;
    const end = start + seg;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = JUEGO_COLORES[i % JUEGO_COLORES.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.stroke();

    const { size, lineas } = _ajustarTexto(p.nombre || '');

    ctx.save();
    // Recortar el dibujo del texto a la propia porción — así, sea cual
    // sea el tamaño del nombre del premio, nunca puede "pintarse" por
    // encima del color de la porción de al lado (antes se veía cortado
    // a medias entre dos colores cuando el texto no cabía).
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF8EE';
    ctx.font = emojiSize + 'px ' + EMOJI_FONTS;
    ctx.fillText(p.emoji || '🎁', radialPos, lineas.length > 1 ? -12 : -8);
    ctx.font = '600 ' + size + 'px DM Sans, sans-serif';
    lineas.forEach((linea, li) => {
      ctx.fillText(linea, radialPos, 8 + li * (size + 2));
    });
    ctx.restore();
  });
}

async function girarRuleta() {
  if (_ruletaEjecutando) return;
  const tel = document.getElementById('ruleta-telefono');
  const digits = (tel.value || '').replace(/\D/g, '');
  if (digits.length !== 9) {
    document.getElementById('ruleta-tel-error').style.display = 'block';
    return;
  }
  document.getElementById('ruleta-tel-error').style.display = 'none';
  _ruletaEjecutando = true;
  const btn = document.getElementById('ruleta-spin-btn');
  btn.disabled = true;
  btn.textContent = 'Girando…';
  try {
    const data = await _juegoGirar('ruleta', digits);
    if (!data.success) {
      showAlert(data.message || 'No se pudo girar la ruleta ahora mismo. Inténtalo más tarde.', 'Vaya…');
      btn.disabled = false; btn.textContent = 'Girar la ruleta';
      _ruletaEjecutando = false;
      return;
    }
    if (data.yaJugaste) {
      // Ya jugó hoy — en vez de la pantalla genérica "vuelve mañana", se
      // reutiliza la de resultado con lo que ganó de verdad: si tenía un
      // código sin aplicar (cerró el modal, cambió de dispositivo...) aquí
      // puede recuperarlo, en vez de quedarse sin ninguna forma de verlo.
      const premio = data.premio || {};
      document.getElementById('ruleta-intro').style.display = 'none';
      document.getElementById('ruleta-resultado').style.display = 'block';
      document.getElementById('ruleta-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('ruleta-resultado-titulo').textContent = 'Ya has girado hoy';
      document.getElementById('ruleta-resultado-desc').textContent = premio.pct > 0
        ? 'Tu premio de hoy fue "' + premio.nombre + '" — aquí tienes tu código otra vez, por si no lo llegaste a usar.'
        : (premio.nombre || 'Suerte la próxima vez') + '. Vuelve mañana para otra oportunidad.';
      document.getElementById('ruleta-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      window._juegoState = { juego: 'ruleta', premio, code: data.code };
      _ruletaEjecutando = false;
      return;
    }
    let idx = _ruletaPremios.findIndex(p => p.id === (data.premio && data.premio.id));
    if (idx === -1) {
      // La lista de premios cambió entre abrir la ruleta y girar (el admin
      // la editó justo en medio) — el premio real que se ha ganado (texto,
      // emoji y código) sigue siendo correcto porque viene del servidor,
      // pero la ruleta dibujada localmente ya no tiene ese premio en
      // ninguno de sus segmentos. Se recarga y redibuja con la lista
      // actual antes de animar, para no parar visualmente en un segmento
      // que no es el premio ganado de verdad.
      try {
        const cfgFresco = window.fb_loadRuletaConfig ? await window.fb_loadRuletaConfig() : null;
        if (cfgFresco && Array.isArray(cfgFresco.premios)) {
          _ruletaPremios = cfgFresco.premios;
          _dibujarRuletaWheel(_ruletaPremios);
        }
      } catch (e) {}
      idx = _ruletaPremios.findIndex(p => p.id === (data.premio && data.premio.id));
    }
    if (idx === -1) idx = 0;
    const seg = 360 / (_ruletaPremios.length || 1);
    const mid = idx * seg + seg / 2;
    const vueltas = 5 + Math.floor(Math.random() * 3);
    const deg = 360 * vueltas - mid;
    const canvas = document.getElementById('ruleta-canvas');
    canvas.style.transform = 'rotate(' + deg + 'deg)';
    window._juegoState = { juego: 'ruleta', premio: data.premio, code: data.code };
    _juegoGuardarToken('ruleta', data.token);
    setTimeout(() => {
      document.getElementById('ruleta-intro').style.display = 'none';
      document.getElementById('ruleta-resultado').style.display = 'block';
      const premio = data.premio || {};
      document.getElementById('ruleta-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('ruleta-resultado-titulo').textContent = '¡Enhorabuena!';
      document.getElementById('ruleta-resultado-desc').textContent = premio.pct > 0
        ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
        : (premio.nombre || 'Suerte la próxima vez');
      document.getElementById('ruleta-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      if (premio.pct > 0) _celebrarPremio();
      _ruletaEjecutando = false;
    }, 4700);
  } catch (e) {
    showAlert('Error de conexión. Inténtalo de nuevo.', 'Vaya…');
    btn.disabled = false; btn.textContent = 'Girar la ruleta';
    _ruletaEjecutando = false;
  }
}
function aplicarPremioRuleta() { _aplicarPremioComun('ruleta'); }

// ── RASCA Y GANA ────────────────────────────────────────────────────────
let _rascaEjecutando = false;
let _rascaScratching = false;
let _rascaRevelado = false;

function openRasca() {
  document.getElementById('rasca-modal').classList.add('open');
  document.getElementById('rasca-intro').style.display = 'block';
  document.getElementById('rasca-resultado').style.display = 'none';
  document.getElementById('rasca-ya-jugaste').style.display = 'none';
  document.getElementById('rasca-tel-paso').style.display = 'block';
  document.getElementById('rasca-tarjeta-paso').style.display = 'none';
  const tel = document.getElementById('rasca-telefono');
  if (tel) { tel.value = _juegoTelefonoGuardado(); if (tel.value) formatPhone(tel); }
  document.getElementById('rasca-tel-error').style.display = 'none';
  _rascaRevelado = false;
}
function closeRasca() {
  document.getElementById('rasca-modal').classList.remove('open');
}

async function empezarRasca() {
  if (_rascaEjecutando) return;
  const tel = document.getElementById('rasca-telefono');
  const digits = (tel.value || '').replace(/\D/g, '');
  if (digits.length !== 9) {
    document.getElementById('rasca-tel-error').style.display = 'block';
    return;
  }
  document.getElementById('rasca-tel-error').style.display = 'none';
  _rascaEjecutando = true;
  const btn = document.getElementById('rasca-empezar-btn');
  btn.disabled = true;
  btn.textContent = 'Cargando…';
  try {
    const data = await _juegoGirar('rasca', digits);
    btn.disabled = false; btn.textContent = 'Destapar mi tarjeta';
    if (!data.success) {
      showAlert(data.message || 'No se pudo cargar la tarjeta ahora mismo. Inténtalo más tarde.', 'Vaya…');
      _rascaEjecutando = false;
      return;
    }
    window._juegoState = { juego: 'rasca', premio: data.premio, code: data.code };
    if (data.yaJugaste) {
      // Igual que en la ruleta: si ya rascó hoy, se le enseña directamente
      // el resultado (con el botón de aplicar si aún tiene código sin usar)
      // en vez de un "vuelve mañana" sin ninguna forma de recuperarlo.
      const premio = data.premio || {};
      document.getElementById('rasca-intro').style.display = 'none';
      document.getElementById('rasca-tel-paso').style.display = 'none';
      document.getElementById('rasca-resultado').style.display = 'block';
      document.getElementById('rasca-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('rasca-resultado-titulo').textContent = 'Ya rascaste hoy';
      document.getElementById('rasca-resultado-desc').textContent = premio.pct > 0
        ? 'Tu premio de hoy fue "' + premio.nombre + '" — aquí tienes tu código otra vez, por si no lo llegaste a usar.'
        : (premio.nombre || 'Suerte la próxima vez') + '. Vuelve mañana para otra tarjeta.';
      document.getElementById('rasca-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      _rascaEjecutando = false;
      return;
    }
    const premio = data.premio || {};
    _juegoGuardarToken('rasca', data.token);
    document.getElementById('rasca-premio-emoji').textContent = premio.emoji || '🎁';
    document.getElementById('rasca-premio-texto').textContent = premio.nombre || '';
    document.getElementById('rasca-tel-paso').style.display = 'none';
    document.getElementById('rasca-tarjeta-paso').style.display = 'block';
    _dibujarRascaFoil();
    _rascaEjecutando = false;
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Destapar mi tarjeta';
    showAlert('Error de conexión. Inténtalo de nuevo.', 'Vaya…');
    _rascaEjecutando = false;
  }
}

function _dibujarRascaFoil() {
  const canvas = document.getElementById('rasca-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.globalCompositeOperation = 'source-over';
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#C9A25A'); grad.addColorStop(1, '#8A6A4E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.font = '600 15px DM Sans, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🎫 Rasca aquí', w / 2, h / 2);

  let drawing = false;
  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - rect.left) * (w / rect.width), y: (p.clientY - rect.top) * (h / rect.height) };
  }
  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  function checkRevealed() {
    if (_rascaRevelado) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    let transparent = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 8) { // muestreo cada 8 píxeles, suficiente para estimar el %
      total++;
      if (data[i] === 0) transparent++;
    }
    if (total > 0 && transparent / total >= 0.5) {
      _rascaRevelado = true;
      ctx.clearRect(0, 0, w, h);
      setTimeout(_mostrarResultadoRasca, 350);
    }
  }
  function onDown(e) { drawing = true; const p = pos(e); scratchAt(p.x, p.y); e.preventDefault(); }
  function onMove(e) { if (!drawing) return; const p = pos(e); scratchAt(p.x, p.y); checkRevealed(); e.preventDefault(); }
  function onUp() { drawing = false; checkRevealed(); }

  canvas.onpointerdown = onDown;
  canvas.onpointermove = onMove;
  canvas.onpointerup = onUp;
  canvas.onpointerleave = onUp;
}

function _mostrarResultadoRasca() {
  document.getElementById('rasca-intro').style.display = 'none';
  document.getElementById('rasca-tarjeta-paso').style.display = 'none';
  document.getElementById('rasca-resultado').style.display = 'block';
  const premio = (window._juegoState && window._juegoState.premio) || {};
  document.getElementById('rasca-resultado-emoji').textContent = premio.emoji || '🎉';
  document.getElementById('rasca-resultado-titulo').textContent = '¡Enhorabuena!';
  document.getElementById('rasca-resultado-desc').textContent = premio.pct > 0
    ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
    : (premio.nombre || 'Suerte la próxima vez');
  document.getElementById('rasca-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
  if (premio.pct > 0) _celebrarPremio();
}
function aplicarPremioRasca() { _aplicarPremioComun('rasca'); }

// ── BANNER DEL DÍA ───────────────────────────────────────────────────────────
const BANNER_KEY = 'dpf_banner_dia';
function getBannerDia() {
  try {
    return JSON.parse(localStorage.getItem(BANNER_KEY) || '{}');
  } catch {
    return {};
  }
}
const BANNER_TIPOS = {
  promo: {
    bg: '#FFF8EE',
    border: '#3D1F0D',
    iconBg: '#3D1F0D',
    labelColor: '#3D1F0D',
    titleColor: '#3D1F0D',
    subColor: '#8A6A4E',
    label: 'Oferta del día',
    emoji: '🎉'
  },
  aviso: {
    bg: '#fff3cd',
    border: '#3D1F0D',
    iconBg: '#3D1F0D',
    labelColor: '#b36a00',
    titleColor: '#5a3e1b',
    subColor: '#8a6530',
    label: 'Aviso importante',
    emoji: '⚠️'
  },
  urgente: {
    bg: '#fdf0ee',
    border: '#c0392b',
    iconBg: '#c0392b',
    labelColor: '#c0392b',
    titleColor: '#7a1a0e',
    subColor: '#a03020',
    label: 'Urgente',
    emoji: '🔴'
  },
  info: {
    bg: '#e8f4fd',
    border: '#2980b9',
    iconBg: '#2980b9',
    labelColor: '#2980b9',
    titleColor: '#1a3a52',
    subColor: '#2c5f7a',
    label: 'Novedad',
    emoji: '📢'
  }
};
function _applyBannerDia(data) {
  const el = document.getElementById('banner-dia');
  const inner = document.getElementById('banner-dia-inner');
  const iconEl = document.getElementById('banner-dia-icon');
  const labelEl = document.getElementById('banner-dia-label');
  const textEl = document.getElementById('banner-dia-text');
  const subEl = document.getElementById('banner-dia-sub');
  if (!el) return;
  if (data && data.active && data.text) {
    const tipo = BANNER_TIPOS[data.tipo || 'promo'];
    el.style.display = 'block';
    inner.style.background = tipo.bg;
    inner.style.border = '2px solid ' + tipo.border;
    iconEl.style.background = tipo.iconBg;
    iconEl.textContent = tipo.emoji;
    labelEl.textContent = tipo.label;
    labelEl.style.color = tipo.labelColor;
    textEl.textContent = data.text;
    textEl.style.color = tipo.titleColor;
    if (subEl) {
      subEl.textContent = data.sub || '';
      subEl.style.color = tipo.subColor;
      subEl.style.display = data.sub ? 'block' : 'none';
    }
  } else {
    el.style.display = 'none';
  }
}
function _updateBannerToggleBtn(active) {
  const btn = document.getElementById('banner-toggle-btn');
  if (!btn) return;
  btn.textContent = active ? '🟢 Banner activo' : '🔴 Banner inactivo';
  btn.style.background = active ? '#27855a' : '#c0392b';
  btn.style.color = '#fff';
  btn.style.border = 'none';
}
function loadBannerDia() {
  // Mostrar estado local inmediatamente mientras carga Firebase
  const localBanner = getBannerDia();
  _updateBannerToggleBtn(localBanner.active);
  if (window.fb_listenBannerDia) {
    window.fb_listenBannerDia(data => {
      if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
      const d = data || getBannerDia();
      _applyBannerDia(d);
      _updateBannerToggleBtn(d.active);
      const input = document.getElementById('banner-dia-input');
      const subIn = document.getElementById('banner-dia-sub-input');
      const tipoIn = document.getElementById('banner-dia-tipo');
      if (input && d.text) input.value = d.text;
      if (subIn && d.sub) subIn.value = d.sub;
      if (tipoIn && d.tipo) tipoIn.value = d.tipo;
    });
    return;
  }
  // Fallback: leer directamente de Firebase si el listener no está listo aún
  if (window.firebase && window.firebase.database) {
    try {
      window.firebase.database().ref('config/bannerDia').once('value').then(sn => {
        let data = null;
        if (sn.exists()) {
          try {
            data = typeof sn.val() === 'string' ? JSON.parse(sn.val()) : sn.val();
          } catch {}
        }
        if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
        _applyBannerDia(data || getBannerDia());
      }).catch(() => _applyBannerDia(getBannerDia()));
    } catch (e) {
      _applyBannerDia(getBannerDia());
    }
    return;
  }
  // Último fallback: localStorage
  _applyBannerDia(getBannerDia());
  _updateBannerToggleBtn(getBannerDia().active);
}

// ── PEDIDOS EN VIVO — estado de cocina (leído por el aviso de saturación,
//    que corre para cualquier visitante, no solo para admin) ──
const ORDER_STATUS_KEY = 'dpf_order_status';
window._orderStatusCache = window._orderStatusCache || {};
// Normaliza la clave del pedido igual que hace Firebase: quita '#' y 'T' (con regex global para prefijos dobles)
// Ej: '#T42' → '42', '##T42' → '42', '#42' → '42', 'T42' → '42', '42' → '42'
function _normOrderKey(num) {
  return String(num).replace(/#/g, '').replace(/^T/, '');
}
function getOrderStatuses() {
  return window._orderStatusCache;
}
// Wrapper para leer el estado de un pedido usando clave normalizada
function getOrderStatus(num) {
  return window._orderStatusCache[_normOrderKey(num)] || 'nuevo';
}

// ── ANTI-SPAM / BLACKLIST — lectura, la usa el checkout de cualquier
//    visitante (carrito-checkout.js). La UI de admin para editarlas vive
//    en admin-antispam-stats.js. ──
const BLACKLIST_KEY = 'dpf_blacklist';
const ANTISPAM_KEY = 'dpf_antispam_cfg';
const PHONE_LOG_KEY = 'dpf_phone_log'; // registro de pedidos por teléfono (Firebase)
function getBlacklist() {
  try {
    return JSON.parse(localStorage.getItem(BLACKLIST_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveBlacklistLocal(list) {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}
function getAntiSpamCfg() {
  try {
    var _c$cooldown, _c$dailyLimit;
    const c = JSON.parse(localStorage.getItem(ANTISPAM_KEY) || '{}');
    return {
      cooldown: (_c$cooldown = c.cooldown) !== null && _c$cooldown !== void 0 ? _c$cooldown : 0,
      dailyLimit: (_c$dailyLimit = c.dailyLimit) !== null && _c$dailyLimit !== void 0 ? _c$dailyLimit : 3
    };
  } catch {
    return {
      cooldown: 45,
      dailyLimit: 3
    };
  }
}

const SLOTS_KEY = 'dpf_slots';
const SOUND_KEY = 'dpf_sound_config';
const STOCK_DATA_KEY = 'dpf_stock_data';

// ── HISTORIAL (últimos 30 días) ──
const HISTORIAL_KEY = 'dpf_historial';
function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveToHistorial(dayStats) {
  if (!dayStats || !dayStats.date || !dayStats.count) return;
  let hist = getHistorial();
  // Actualiza o inserta el día
  const idx = hist.findIndex(d => d.date === dayStats.date);
  if (idx >= 0) hist[idx] = dayStats; else hist.unshift(dayStats);
  // Máximo 30 días
  hist = hist.slice(0, 30);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
  // Subir también a Firebase para que no quede solo en este dispositivo.
  // fb_saveStats escribe en stats/{fecha} — el mismo path que lee fb_loadHistorial.
  // Solo necesario en el fallback (sin transacción atómica) pero es idempotente.
  if (window.fb_saveStats) {
    window.fb_saveStats(dayStats).catch(e =>
      console.warn('[historial] No se pudo subir a Firebase:', e)
    );
  }
}

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — URL TOKEN
// ══════════════════════════════════════════════
(async function checkUrlToken() {
  const params = new URLSearchParams(window.location.search);

  // Ambos tokens (?key= y ?bimba=) se comprueban en el servidor
  // (bimba-verify.php) con límite de intentos — antes se comparaban aquí
  // contra un valor precargado en localStorage para TODO visitante, lo
  // que permitía a cualquier cliente leer su propio localStorage y
  // auto-concederse acceso sin conocer el token real.

  // Token admin normal
  const key = params.get('key');
  if (key) {
    try {
      const res = await fetch('bimba-verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkAdminUrlToken', token: key })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setTimeout(_updateAudioBannerState, 200);
          logActivity('🔗 Acceso por URL token');
          openAdmin();
        }, 300);
      }
    } catch (e) { /* red caída: simplemente no se concede acceso */ }
  }

  // Token bimba — abre directamente el panel sin contraseña.
  // AVISO: este acceso NO inicia sesión real en Firebase (sigue anónimo),
  // así que con las reglas de seguridad actuales no podrá leer/escribir
  // tickets, gastos, fichajes, etc. Solo sirve para ver la interfaz.
  const bimbaKey = params.get('bimba');
  if (bimbaKey) {
    try {
      const res = await fetch('bimba-verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkBimbaToken', token: bimbaKey })
      });
      const data = await res.json();
      if (data.success) {
        // admin-shell.html se inyecta de forma diferida (carga eager a los
        // 2s, o al vuelo desde openAdmin()) — este acceso directo por URL
        // puede llegar antes de que exista, así que hay que esperar a que
        // esté listo antes de tocar sus elementos (si no, "#admin-overlay"
        // aún no existe y todo esto revienta con un error silencioso).
        if (typeof loadAdminShell === 'function' && !window._adminShellLoaded) {
          await new Promise(resolve => loadAdminShell(resolve));
        }
        setTimeout(() => {
          logActivity('🔗 Acceso bimba por URL token');
          _adminLoggedIn = true; window._adminLoggedIn = true;
          openStockConfigSecret();
          document.getElementById('admin-overlay').classList.add('open');
          document.getElementById('admin-login').style.display = 'none';
          document.getElementById('admin-panel').style.display = 'block';
        }, 300);
      }
    } catch (e) { /* red caída: simplemente no se concede acceso */ }
  }
})();

// ══════════════════════════════════════════════
//  LOG DE ACTIVIDAD
// ══════════════════════════════════════════════
const ACTIVITY_LOG_KEY = 'dpf_activity_log';
function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}
function logActivity(action, extra) {
  const log = getActivityLog();
  const now = new Date();
  // "extra" permite adjuntar datos estructurados (tipo, orderNum, fecha...)
  // a una alerta, para que renderAlertas() pueda ofrecer un botón de
  // "reintentar" en vez de solo "descartar" — igual que ya hacía
  // fbAgregarActivityLog() en el servidor para "pedido_no_guardado".
  const entry = Object.assign({}, extra, {
    ts: now.toISOString(),
    time: now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    action
  });
  log.unshift(entry);
  const trimmed = log.slice(0, 200);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmed));
  // Solo guardar en Firebase si hay sesión activa (evita permission_denied en intentos de login)
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(trimmed).catch(() => {});
  }
  if (typeof updateAlertBadge === 'function') updateAlertBadge();
}

// ══════════════════════════════════════════════
//  AUTO-BORRADO DEL HISTORIAL
// ══════════════════════════════════════════════
const AUTODELETE_KEY = 'dpf_autodelete_days';
function getAutoDeleteDays() {
  return parseInt(localStorage.getItem(AUTODELETE_KEY) || '0', 10);
}
function applyAutoDelete() {
  const days = getAutoDeleteDays();
  if (!days) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const original = getHistorial();
  const before = original.length;
  // Cap de seguridad: nunca más de 365 entradas independientemente del filtro de fecha
  const hist = original.filter(d => d.date >= cutoffStr).slice(0, 365);
  if (hist.length !== before) {
    // Las fechas borradas se calculan ANTES de sobrescribir localStorage —
    // antes se recalculaban leyendo getHistorial() DESPUÉS del
    // localStorage.setItem() de abajo, así que siempre salía una lista
    // vacía (ya no quedaba ninguna fecha antigua que leer) y stats/{fecha}
    // nunca llegaba a borrarse de Firebase, solo de localStorage.
    const deletedDates = original
      .filter(d => d.date < cutoffStr)
      .map(d => d.date);
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
    // Borrar también los días eliminados de Firebase (stats/{fecha})
    if (typeof firebase !== 'undefined' && firebase.database) {
      deletedDates.forEach(date => {
        firebase.database().ref('stats/' + date).remove().catch(() => {});
      });
    }
  }
}

// ══════════════════════════════════════════
//  RESET DE MEDIANOCHE (slots, estados de cocina, apertura, archivar historial)
// ══════════════════════════════════════════
function scheduleSlotMidnightReset() {
  const now = new Date();
  const msSinceMidnight = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const msToMidnight = 86400000 - msSinceMidnight;
  setTimeout(() => {
    // Comprobar si los datos de slots son de un día anterior; si no, limpiar
    const data = getSlotsData();
    const todayKey = new Date().toISOString().slice(0, 10);
    if (data.date !== todayKey) {
      localStorage.removeItem(SLOTS_KEY);
    }
    // Limpiar estados de cocina del día anterior
    window._orderStatusCache = {};
    localStorage.removeItem(ORDER_STATUS_KEY);
    if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
    // Resetear flags de apertura para que el nuevo día empiece sin bloqueos del fin de noche
    localStorage.removeItem(OPEN_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem('dpf_open_manual_override');
    const _esAdminAutenticadoReset = !!(window.fb_getAdminUser && window.fb_getAdminUser());
    if (_esAdminAutenticadoReset) {
      firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
      if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
      if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    }
    // También archivar el día anterior en historial
    try {
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (stats.date && stats.date !== todayKey && stats.count > 0) {
        saveToHistorial(stats);
      }
    } catch {}
    // Salida automática: registrar salida a los empleados que olvidaron fichar
    try {
      const ayerKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // ayer (resta 1 día completo)
      const fich = fichajesLoad();
      const emps = empLoadAll();
      let modified = false;
      emps.forEach(emp => {
        const suyosAyer = fich.filter(f => f.empId === emp.id && f.fecha === ayerKey).sort((a, b) => a.hora.localeCompare(b.hora));
        // Si el último fichaje del día es una entrada, registrar salida automática a las 00:00
        if (suyosAyer.length > 0 && suyosAyer[suyosAyer.length - 1].tipo === 'entrada') {
          fich.push({
            empId: emp.id,
            fecha: ayerKey,
            hora: '00:00',
            tipo: 'salida',
            auto: true
          });
          modified = true;
        }
      });
      if (modified && _esAdminAutenticadoReset) fichajesSave(fich);
    } catch (e) {
      console.warn('Auto-checkout error', e);
    }
    scheduleSlotMidnightReset(); // reprogramar para la siguiente medianoche
  }, msToMidnight);
}

// ══════════════════════════════════════════
//  FIREBASE REALTIME LISTENERS
// ══════════════════════════════════════════
function initFirebaseListeners() {
  const todayKey = new Date().toISOString().slice(0, 10);
  console.log('[fee] initFirebaseListeners START, _firebaseReady=', window._firebaseReady);

  // Tarjeta de sellos: si ya conocemos el teléfono de este cliente (pedido
  // anterior), comprobamos sus sellos sin que tenga que escribir nada.
  try {
    const savedPhone = localStorage.getItem('dpf_customer_phone');
    if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
  } catch {}

  // Cargar config de gastos de gestión desde Firebase
  loadFeeFromFirebase();
  if (typeof loadFee2FromFirebase === 'function') loadFee2FromFirebase();
  if (typeof loadLocalFeeCodeFromFirebase === 'function') loadLocalFeeCodeFromFirebase();
  if (typeof loadTiendaEsperaMinutosFromFirebase === 'function') loadTiendaEsperaMinutosFromFirebase();
  if (typeof loadStudentDiscountFromFirebase === 'function') loadStudentDiscountFromFirebase();
  // Cargar configuración del ticket desde Firebase
  loadTicketConfigFromFirebase();
  // Auto-pausa por saturación: configuración (umbral/mensaje/on-off) y
  // estado compartido entre dispositivos (¿está pausado por el sistema?)
  if (typeof loadAutoPausaConfigFromFirebase === 'function') loadAutoPausaConfigFromFirebase();
  if (typeof loadAutoPausaEstadoFromFirebase === 'function') loadAutoPausaEstadoFromFirebase();
  // Pausa exprés (cuenta atrás) y aviso suave previo a la auto-pausa
  if (typeof loadPausaExpresFromFirebase === 'function') loadPausaExpresFromFirebase();
  if (typeof loadAvisoSaturacionFromFirebase === 'function') loadAvisoSaturacionFromFirebase();
  // Oferta relámpago (descuento por tiempo limitado) — mismo listener sirve
  // para pintar el banner del cliente y, si el panel admin está abierto, su
  // propio estado con cuenta atrás (ver loadOfertaRelampagoFromFirebase en
  // admin-turnos-descuentos.js).
  if (typeof loadOfertaRelampagoFromFirebase === 'function') loadOfertaRelampagoFromFirebase();

  // Aviso de "sin conexión" en la pantalla de cocina — la lista de pedidos
  // ya sigue mostrando lo último que se vio (localStorage/último render) si
  // se corta el wifi, pero sin este aviso nadie en cocina se entera de que
  // los pedidos nuevos podrían no estar llegando. Mismo margen de 6s que el
  // banner del cliente, para no alarmar por un corte breve al cambiar de red.
  if (window.fb_listenConnectionState) {
    let _kitchenOfflineTimeout = null;
    window.fb_listenConnectionState(connected => {
      const badge = document.getElementById('kitchen-offline-badge');
      if (!badge) return;
      if (connected) {
        if (_kitchenOfflineTimeout) { clearTimeout(_kitchenOfflineTimeout); _kitchenOfflineTimeout = null; }
        badge.style.display = 'none';
      } else if (!_kitchenOfflineTimeout) {
        _kitchenOfflineTimeout = setTimeout(() => {
          _kitchenOfflineTimeout = null;
          badge.style.display = 'block';
        }, 6000);
      }
    });
  }

  // Incidencias de clientes (formulario Tally) — en tiempo real, para que
  // el badge de la pestaña Alertas se actualice sin recargar.
  if (window.fb_listenIncidencias) {
    window.fb_listenIncidencias(incidencias => {
      window._incidenciasCache = incidencias || {};
      var _alertasSection = document.getElementById('admin-alertas');
      if (_alertasSection && _alertasSection.classList.contains('active')) renderIncidencias();
      if (typeof updateAlertBadge === 'function') updateAlertBadge();
    });
  }

  // Pedidos abiertos/cerrados y su mensaje, en tiempo real — antes solo se
  // cargaban una vez al abrir la página (init.js). Si la auto-pausa por
  // saturación cierra o reabre los pedidos mientras un cliente ya tiene la
  // web abierta, esto hace que vea el cambio al momento sin recargar.
  if (window.fb_listenOrdersOpen) {
    window.fb_listenOrdersOpen(val => {
      localStorage.setItem(ORDERS_KEY, val);
      updateOrdersUI(getOrdersOpen());
      if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
    });
  }
  if (window.fb_listenOrdersMsg) {
    window.fb_listenOrdersMsg(msg => {
      localStorage.setItem(ORDERS_MSG_KEY, msg);
      const inp = document.getElementById('orders-pause-msg');
      if (inp) inp.value = msg;
      updateOrdersUI(getOrdersOpen());
    });
  }

  // 1. Slots — sync counter across all devices in real time
  if (window.fb_listenSlots) {
    window.fb_listenSlots(slots => {
      // Re-render slot picker si está visible (cliente eligiendo)
      const picker = document.getElementById('slot-picker');
      if (picker && picker.offsetParent !== null) {
        renderSlotPicker();
        // Si el slot seleccionado se llenó, avisar al cliente
        if (selectedSlot) {
          const slotCount = slots[selectedSlot] || 0;
          const slotMax = getSlotMax();
          if (slotCount >= slotMax) {
            selectedSlot = null;
            document.querySelectorAll('.slot-btn').forEach(b => {
              b.classList.remove('slot-selected');
              b.style.background = '';
              b.style.borderColor = '';
              b.style.color = '';
            });
            const err = document.getElementById('slot-error');
            if (err) { err.textContent = '⚠️ El turno que habías elegido se ha llenado. Por favor elige otro horario.'; err.style.display = 'block'; err.style.color = '#c0392b'; }
          }
        }
      }
      var _document$getElementB0;
      _slotsCache = slots || {};
      // Forzar que getSlotsData use _slotsCache en vez de stats locales
      // invalidando la fecha de stats para que no se use como fuente
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (stats && stats.date === todayKey) {
          // Sobrescribir los slots de stats con los de Firebase (fuente de verdad)
          stats._slotsOverride = slots || {};
          localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
      } catch (e) {}
      // Re-render slot picker if visible
      renderSlotPicker();
      // Re-render live orders slots if admin open
      if ((_document$getElementB0 = document.getElementById('admin-overlay')) !== null && _document$getElementB0 !== void 0 && _document$getElementB0.classList.contains('open')) {
        loadLiveOrders();
      }
    });
  }

  // 2. Stats / pedidos — sync orders across all devices
  if (window.fb_listenStats) {
    // Semilla del contador con el último valor que esta misma tablet ya
    // tenía guardado en localStorage para hoy, o 0 si no hay nada —
    // NUNCA null. Antes, la primera lectura de Firebase de cada carga de
    // página se trataba como "arranque en frío" y fijaba el contador en
    // silencio sin comparar con nada — eso significaba que el pedido
    // realmente NUEVO que disparaba esa primera lectura (incluido el
    // primerísimo pedido del día, cuando antes de él no hay nada que
    // escuchar) nunca sonaba ni se imprimía, solo el siguiente. Al partir
    // siempre de un número real (0, o lo último visto antes de recargar)
    // no hace falta ningún caso especial: cualquier subida de verdad se
    // trata igual, sea la primera lectura o la número cien.
    let _fbLastCount = 0;
    try {
      const _statsCacheInicial = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (_statsCacheInicial && _statsCacheInicial.date === todayKey && typeof _statsCacheInicial.count === 'number') {
        _fbLastCount = _statsCacheInicial.count;
      }
    } catch (e) {}
    window.fb_listenStats(todayKey, stats => {
      var _document$getElementB11, _document$getElementB12, _document$getElementB13, _document$getElementB14;
      if (!stats) return;
      const newCount = stats.count || 0;
      // Update localStorage cache
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));

      // Auto-pausa por saturación: se comprueba aquí (no solo dentro de
      // _renderLiveOrders) para que funcione siempre que este dispositivo
      // esté conectado como admin, sin depender de que la pestaña "Pedidos
      // en vivo" esté abierta en pantalla — en "Modo cocina" también debe
      // poder pausar/reactivar sola.
      if (typeof getOrderStatus === 'function') {
        const _pendientes = (stats.orders || []).filter(o => {
          const s = getOrderStatus(o.num);
          return s !== 'entregado' && s !== 'listo' && s !== 'cancelado';
        }).length;
        if (_adminLoggedIn && typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(_pendientes);
        // El aviso suave (banner + sonido previo) se calcula en cualquier
        // dispositivo — incluidos los clientes pidiendo, que necesitan ver
        // el aviso aunque no estén logueados como admin.
        if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(_pendientes);
      }

      // New order arrived
      if (newCount > _fbLastCount) {
        const diff = newCount - _fbLastCount;
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        _unseenOrders += diff;
        if (typeof updateTabTitle === 'function') updateTabTitle(_unseenOrders);
        console.log('[DPF] NEW ORDER via Firebase! diff=' + diff + ' adminLoggedIn=' + _adminLoggedIn);
        // Si el panel está abierto pero _adminLoggedIn no se puso, forzarlo.
        // Antes solo se comprobaba si #admin-panel estaba visible — si el
        // pedido llegaba mientras la tablet estaba en "Modo cocina" (una
        // pantalla distinta, #kitchen-mode) o justo durante el auto-login
        // por "dispositivo de confianza" (que tarda un momento en
        // confirmarse tras cargar la página), esta comprobación no lo
        // detectaba y ese pedido se perdía entero — sin imprimir Y sin
        // sonido, porque los dos dependen de _adminLoggedIn. Ahora también
        // se comprueba #kitchen-mode y si ya hay sesión real de Firebase
        // Auth (la señal más fiable, vale para cualquier pantalla).
        if (!_adminLoggedIn) {
          var adminPanel = document.getElementById('admin-panel');
          var kitchenMode = document.getElementById('kitchen-mode');
          var yaAutenticado = window.fb && window.fb.getAdminUser && window.fb.getAdminUser();
          if ((adminPanel && adminPanel.style.display !== 'none')
            || (kitchenMode && kitchenMode.classList.contains('open'))
            || yaAutenticado) {
            _adminLoggedIn = true; window._adminLoggedIn = true;
          }
        }
        if (_adminLoggedIn) {
          // guardar-pedido.php inserta los pedidos nuevos al PRINCIPIO del array
          // (array_unshift), no al final — por eso se cogen los primeros "diff"
          // elementos, no los últimos (si no, siempre se coge el pedido más viejo).
          const _nuevosPedidos = (stats.orders || []).slice(0, diff);
          if (getTicketConfig().autoImprimir) {
            _nuevosPedidos.forEach(_autoImprimirPedido);
          }
          // Se SUMA cada pedido nuevo al contador (por número, no se puede
          // duplicar) en vez de sobreescribirlo — antes, si llegaban dos
          // avisos de "pedido nuevo" seguidos antes de atender el primero,
          // el segundo pisaba el contador entero en vez de sumarse.
          _nuevosPedidos.forEach(o => _marcarPedidoPendienteAlerta(o.num));
          startAlertLoop();
          const toast = document.getElementById('new-order-toast');
          if (toast) {
            toast.style.display = 'block';
            setTimeout(() => {
              toast.style.display = 'none';
            }, 4000);
          }
        }
      } else {
        _fbLastCount = newCount;
      }
      // Refresh UI
      if ((_document$getElementB11 = document.getElementById('admin-pedidos')) !== null && _document$getElementB11 !== void 0 && _document$getElementB11.classList.contains('active')) loadLiveOrders();
      if ((_document$getElementB12 = document.getElementById('admin-stats')) !== null && _document$getElementB12 !== void 0 && _document$getElementB12.classList.contains('active')) loadDayStats();
      if ((_document$getElementB13 = document.getElementById('admin-pedidos')) !== null && _document$getElementB13 !== void 0 && _document$getElementB13.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB14 = document.getElementById('admin-stats')) !== null && _document$getElementB14 !== void 0 && _document$getElementB14.classList.contains('active')) {
        loadDayStats();
      }
      // Modo cocina (pantalla completa #kitchen-mode) — antes solo se
      // refrescaba con este listener si la pestaña "Pedidos en vivo" del
      // panel admin estaba abierta, así que un pedido nuevo o uno quitado
      // (cancelado/modificado) podía tardar hasta 15s en aparecer/
      // desaparecer aquí (el intervalo de refresco periódico de
      // openKitchenMode), en vez de al instante como en las otras pestañas.
      var _kitchenModeEl = document.getElementById('kitchen-mode');
      if (_kitchenModeEl && _kitchenModeEl.classList.contains('open')) {
        refreshKitchenGrid();
      }
    });
  }

  // 3. Order statuses — sync kitchen status across devices
  if (window.fb_listenOrderStatuses) {
    let _prevOrderStatuses = null; // null hasta el primer snapshot: evita avisar de cancelaciones ya existentes al abrir
    window.fb_listenOrderStatuses(statuses => {
      var _document$getElementB15, _document$getElementB16;
      const nuevos = statuses || {};

      // Aviso de cancelación/modificación: sonido distinto + ticket de anulación
      // en esta tablet, para pedidos que ACABAN de pasar a "cancelado"
      // (cancelarPedidoAdmin, y también cuando el cliente cancela o modifica
      // su propio pedido — todo pasa por el mismo _borrarPedidoDeFirebase).
      if (_prevOrderStatuses === null) {
        _prevOrderStatuses = nuevos;
      } else {
        Object.keys(nuevos).forEach(num => {
          if (nuevos[num] === 'cancelado' && _prevOrderStatuses[num] !== 'cancelado') {
            if (_adminLoggedIn) {
              playNotificationSound('urgente');
              if (getTicketConfig().autoImprimir) {
                imprimirAnulacion(num).catch(e => console.warn('[Impresora] fallo al imprimir anulación', e));
              }
            }
          }
        });
        _prevOrderStatuses = nuevos;
      }

      window._orderStatusCache = nuevos;
      localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
      // Un cambio de estado (p.ej. marcar "listo") también puede bajar el
      // nº de pendientes sin que cambie el nº total de pedidos — recalcular
      // la auto-pausa/aviso aquí también, no solo cuando llega un pedido nuevo.
      try {
        const _statsAhora = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (_statsAhora && Array.isArray(_statsAhora.orders)) {
          const _pendientesAhora = _statsAhora.orders.filter(o => {
            const s = getOrderStatus(o.num);
            return s !== 'entregado' && s !== 'listo' && s !== 'cancelado';
          }).length;
          if (_adminLoggedIn && typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(_pendientesAhora);
          if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(_pendientesAhora);
        }
      } catch (e) {}
      if ((_document$getElementB15 = document.getElementById('admin-pedidos')) !== null && _document$getElementB15 !== void 0 && _document$getElementB15.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB16 = document.getElementById('kitchen-mode')) !== null && _document$getElementB16 !== void 0 && _document$getElementB16.classList.contains('open')) {
        refreshKitchenGrid();
      }
    });
  }

  // Load initial order statuses from Firebase
  if (window.fb_getOrderStatuses) {
    window.fb_getOrderStatuses().then(s => {
      window._orderStatusCache = s || {};
    }).catch(() => {
      try {
        window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
      } catch {}
    });
  } else {
    try {
      window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
    } catch {}
  }

  // Load initial slots: use localStorage immediately, then update from Firebase
  try {
    const lsData = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (lsData.date === todayKey && lsData.slots) {
      _slotsCache = lsData.slots;
      renderSlotPicker(); // render immediately with cached data
    }
  } catch {}
  // Then fetch from Firebase (authoritative)
  if (window.fb_getAllSlots) {
    window.fb_getAllSlots().then(s => {
      _slotsCache = s || {};
      renderSlotPicker();
    }).catch(() => {}); // Si falla, el cache local es suficiente
  }

  // Horario sync — sincronizar horario con todos los dispositivos y cuentas
  if (window.fb_listenHorario) {
    window.fb_listenHorario(hFb => {
      if (!hFb) return;
      localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
      loadOrdersStatus();
      updateFooterHorario(hFb);
    });
  }

  // Empleados sync — sincronizar lista de empleados en tiempo real
  if (window.fb_listenEmpleados) {
    window.fb_listenEmpleados(arr => {
      var _document$getElementB17;
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_empleados', JSON.stringify(arr));
      if ((_document$getElementB17 = document.getElementById('admin-empleados')) !== null && _document$getElementB17 !== void 0 && _document$getElementB17.classList.contains('active')) empRenderAdmin();
    });
  }

  // Fichajes sync — cargar fichajes desde Firebase al iniciar
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        var _document$getElementB18;
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if ((_document$getElementB18 = document.getElementById('admin-empleados')) !== null && _document$getElementB18 !== void 0 && _document$getElementB18.classList.contains('active')) empRenderAdmin();
      }
    }).catch(() => {});
  }

  // Fichajes listener — refrescar cajón de empleados bimba en tiempo real
  if (window.fb_listenFichajes) {
    window.fb_listenFichajes(function(arr) {
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
      if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      if (typeof bimbaRenderFichajeLista === 'function') bimbaRenderFichajeLista();
      if (typeof bimbaActualizarContadorAlertas === 'function') bimbaActualizarContadorAlertas();
    });
  }

  // Verificación SMS obligatoria — sync en tiempo real, para que un cambio
  // desde el panel (o desde otro dispositivo) se refleje aquí sin recargar.
  if (window.fb_listenSmsVerificacionActiva) {
    window.fb_listenSmsVerificacionActiva(function (activa) {
      localStorage.setItem(SMS_VERIFICACION_ACTIVA_KEY, activa ? 'true' : 'false');
      if (typeof _renderSmsVerifBtn === 'function') _renderSmsVerifBtn(activa);
    });
  }

  // Promos sync
  if (window.fb_loadPromos) {
    window.fb_loadPromos().then(function(arr) {
      if (arr) { localStorage.setItem('dpf_promos', JSON.stringify(arr)); renderPromos(); }
    }).catch(function() {});
  }
  if (window.fb_listenPromos) {
    window.fb_listenPromos(function(arr) {
      if (!arr) return;
      localStorage.setItem('dpf_promos', JSON.stringify(arr));
      renderPromos();
      if (typeof bimbaRenderPromos === 'function') bimbaRenderPromos();
    });
  }

  // Categorías bloqueadas sync — sincronizar en tiempo real
  if (window.fb_listenBlockedCats) {
    window.fb_listenBlockedCats(cats => {
      var _document$getElementB19;
      if (!cats) return;
      localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
      // Resetear hidden en todos los items antes de reaplicar categorías bloqueadas
      MENU.forEach(item => {
        item.hidden = false;
      });
      initCatBlocks();
      renderMenu();
      if ((_document$getElementB19 = document.getElementById('admin-pedidos')) !== null && _document$getElementB19 !== void 0 && _document$getElementB19.classList.contains('active')) loadCatBlockUI();
    });
  }

  // Slot config sync — sincronizar turnos y max pedidos en tiempo real
  if (window.fb_listenSlotConfig) {
    window.fb_listenSlotConfig(cfg => {
      var _document$getElementB20;
      if (!cfg) return;
      if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
      if (cfg.max) {
        localStorage.setItem(SLOT_MAX_KEY, cfg.max);
        SLOT_MAX = parseInt(cfg.max, 10);
      }
      renderSlotPicker();
      if ((_document$getElementB20 = document.getElementById('admin-local')) !== null && _document$getElementB20 !== void 0 && _document$getElementB20.classList.contains('active')) loadSlotTurnosUI();
      loadOrdersStatus();
      checkAutoCloseWarning();
    });
  }

  // Menu prices/names sync across devices
  if (window.fb_listenMenu) {
    window.fb_listenMenu(_aplicarMenuDesdeFirebase);
  }
  // Refresco periódico de la carta, además del listener en tiempo real de
  // arriba — si un cliente deja la pestaña abierta mucho rato (o el
  // navegador móvil suspende la conexión en segundo plano y no la
  // restablece del todo al volver), el listener podría no haber recibido
  // el último cambio de precio/producto. Cada 10 minutos, y también en
  // cuanto se vuelve a esta pestaña tras tenerla en segundo plano, se
  // vuelve a comprobar contra Firebase directamente para no dejar pedir
  // nunca con una carta desactualizada.
  if (window.fb_loadMenu) {
    const _refrescarMenu = () => { window.fb_loadMenu().then(data => { if (data) _aplicarMenuDesdeFirebase(data); }).catch(() => {}); };
    setInterval(_refrescarMenu, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') _refrescarMenu();
    });
  }
}
function _aplicarMenuDesdeFirebase(data) {
  // data can be {items, ts} or plain array (legacy)
  const savedMenu = Array.isArray(data) ? data : data && data.items ? data.items : null;
  const fbTs = data && data.ts ? data.ts : 0;
  const localTs = parseInt(localStorage.getItem(MENU_KEY + '_ts') || '0', 10);
  // Only apply Firebase version if it's newer than local
  if (!savedMenu || !savedMenu.length) return;
  if (fbTs > 0 && fbTs < localTs) return; // local is newer, skip
  // Primero resetear hidden para no acumular flags de runs anteriores
  MENU.forEach(item => {
    item.hidden = false;
  });
  savedMenu.forEach(saved => {
    const item = MENU.find(m => m.id == saved.id);
    if (item) {
      if (saved.price !== undefined) item.price = saved.price;
      if (saved.name) item.name = saved.name;
      if (saved.desc !== undefined) item.desc = saved.desc;
      item.hidden = saved.hidden || false;
      item.soldout = saved.soldout || false;
      item.tags = Array.isArray(saved.tags) ? saved.tags : [];
    } else {
      // Producto nuevo que no existía en este dispositivo todavía — lo insertamos
      // junto a los de su misma categoría, no suelto al final
      const nuevo = Object.assign({}, saved);
      let lastIdx = -1;
      for (let i = 0; i < MENU.length; i++) {
        if (MENU[i].cat === nuevo.cat) lastIdx = i;
      }
      if (lastIdx === -1) {
        MENU.push(nuevo);
      } else {
        MENU.splice(lastIdx + 1, 0, nuevo);
      }
    }
  });
  // Reaplicar categorías bloqueadas encima de los datos de Firebase
  initCatBlocks();
  // Protección: si Firebase ocultaría más del 80% de la carta, ignorar hidden flags
  const hiddenCount = MENU.filter(m => m.hidden).length;
  if (hiddenCount > MENU.length * 0.8) {
    console.warn('[DPF] Firebase menu: demasiados items ocultos, reseteando');
    MENU.forEach(m => {
      m.hidden = false;
    });
    localStorage.removeItem(CAT_BLOCK_KEY);
  }
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  if (fbTs > 0) localStorage.setItem(MENU_KEY + '_ts', fbTs);
  renderMenu();
}

let _lastKnownOrderCount = null;

// Wait for Firebase to be ready, then init listeners
if (window._firebaseReady) {
  initFirebaseListeners();
} else {
  document.addEventListener('firebaseReady', initFirebaseListeners);
}

// ── REGISTRO DE ESTADÍSTICAS DE PEDIDO ──
// _lastTicketData lo asigna carrito-checkout.js en cada pedido — lo lee
// tanto recordOrderStats (aquí) como printLastTicket (admin, historial-export.js).
let _lastTicketData = null;
async function recordOrderStats(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const items = _lastTicketData ? _lastTicketData.items : [];
  const phone = _lastTicketData ? _lastTicketData.phone || '' : '';
  const notes = _lastTicketData ? _lastTicketData.notes || '' : '';
  const newOrder = {
    num: orderNum,
    name,
    phone,
    notes,
    total,
    items,
    time: new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    slot: slotTime || null,
    ts: Date.now()
  };

  // Intentar transacción atómica en Firebase para no perder pedidos de otros dispositivos
  if (typeof firebase !== 'undefined' && firebase.database) {
    try {
      await firebase.database().ref('stats/' + todayKey).transaction(function (current) {
        if (!current || current.date !== todayKey) {
          return {
            date: todayKey,
            count: 1,
            total: parseFloat(total.toFixed(2)),
            orders: [newOrder]
          };
        }
        current.count = (current.count || 0) + 1;
        current.total = parseFloat(((current.total || 0) + total).toFixed(2));
        if (!current.orders) current.orders = [];
        // Evitar duplicados si el pedido ya existe (reintento) — comparar con clave normalizada
        if (!current.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum))) {
          current.orders.unshift(newOrder);
        }
        return current;
      });
      // Leer resultado final y actualizar localStorage
      const snap = await firebase.database().ref('stats/' + todayKey).once('value');
      if (snap.exists()) localStorage.setItem(STATS_KEY, JSON.stringify(snap.val()));
      return;
    } catch (e) {
      console.warn('[DPF] Firebase transaction failed, usando fallback:', e);
    }
  }

  // Fallback sin Firebase: solo localStorage
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) {
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  if (!stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum))) stats.orders.unshift(newOrder);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try {
      await window.fb_saveStats(stats);
    } catch (e) {
      console.warn('Firebase stats error', e);
    }
  }
}
scheduleSlotMidnightReset();

/* ── LÓGICA PRINCIPAL ── */
// ─────────────────────────────────────────
//  CONFIGURACIÓN — rellena estos valores
// ─────────────────────────────────────────
const CONFIG = {
  emailjs_public_key: "Euum_k_XJdrejjnKj",
  // de emailjs.com
  emailjs_service_id: "service_bil4ri5",
  emailjs_template_id: "template_ee4f7sp",
  store_email: "dulcepatata.admin@gmail.com" // tu email de tienda
};
// ─────────────────────────────────────────

const MENU = [
// ── PATATAS ──
{
  id: 1,
  cat: "Patatas",
  name: "Patata Simple",
  desc: "Aceite de oliva o mantequilla, sal y pimienta",
  price: 3.00
}, {
  id: 2,
  cat: "Patatas",
  name: "Patata Vegetal",
  desc: "Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural",
  price: 5.60
}, {
  id: 3,
  cat: "Patatas",
  name: "Patata Picante",
  desc: "Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas",
  price: 5.60
}, {
  id: 4,
  cat: "Patatas",
  name: "Patata Carbonara",
  desc: "Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 5,
  cat: "Patatas",
  name: "Patata Boloñesa",
  desc: "Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 6,
  cat: "Patatas",
  name: "Patata Hawaiana",
  desc: "Mayonesa, york, aceitunas, maíz, piña y queso mozzarella",
  price: 5.80
}, {
  id: 7,
  cat: "Patatas",
  name: "Patata Kebab",
  desc: "Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla",
  price: 5.90
}, {
  id: 8,
  cat: "Patatas",
  name: "Patata 4 Quesos",
  desc: "Salsa roquefort, emmental, gouda y mozzarella",
  price: 5.90
}, {
  id: 9,
  cat: "Patatas",
  name: "Patata Completa",
  desc: "Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón",
  price: 6.20
}, {
  id: 10,
  cat: "Patatas",
  name: "Patata Carnívora",
  desc: "Alioli, york, bacon, kebab y carne picada",
  price: 6.40
}, {
  id: 11,
  cat: "Patatas",
  name: "Patata Philadelphia",
  desc: "Salsa philadelphia, york, huevo, pollo, queso mozzarella",
  price: 6.40
}, {
  id: 12,
  cat: "Patatas",
  name: "Patata Ranchera",
  desc: "Salsa ranchera, pollo, bacon y queso mozzarella",
  price: 6.50
}, {
  id: 13,
  cat: "Patatas",
  name: "Patata Granollers",
  desc: "Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria",
  price: 6.50
}, {
  id: 14,
  cat: "Patatas",
  name: "Patata Pulled Pork 🆕",
  desc: "Salsa barbacoa, cebolla, carne pulled pork y mozzarella",
  price: 6.50
}, {
  id: 50,
  cat: "Patatas",
  name: "Patata Cheddar-Bacon 🆕",
  desc: "Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado",
  price: 8.50
}, {
  id: 15,
  cat: "Patatas",
  name: "Patata Al Gusto",
  desc: "1 salsa a elegir y 6 ingredientes",
  price: 6.90
}, {
  id: 16,
  cat: "Patatas",
  name: "Patata Bomba 🆕",
  desc: "9 ingredientes y/o salsas al gusto ¡sin límite!",
  price: 8.40
},
// ── BONIATO FRIES ──
{
  id: 17,
  cat: "Boniato",
  name: "Boniato Fries",
  desc: "Tarrina de boniato fries",
  price: 4.50
}, {
  id: 18,
  cat: "Boniato",
  name: "Boniato Lotus",
  desc: "Salsa Lotus + bacon + queso mozzarella + galletas Lotus",
  price: 5.50
}, {
  id: 19,
  cat: "Boniato",
  name: "Boniato Bacon",
  desc: "Salsa a elegir + bacon + queso mozzarella",
  price: 5.50
}, {
  id: 20,
  cat: "Boniato",
  name: "Boniato G.O.A.T.",
  desc: "Salsa miel mostaza + cebolla crujiente + queso de cabra",
  price: 5.50
}, {
  id: 21,
  cat: "Boniato",
  name: "Boniato Pistacchio 🆕",
  desc: "Crema de pistacho + queso mozzarella + pistacho crujiente",
  price: 5.50
},
// ── PANINIS ──
{
  id: 22,
  cat: "Paninis",
  name: "Panini Jamón York y Queso",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 23,
  cat: "Paninis",
  name: "Panini Carbonara",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 24,
  cat: "Paninis",
  name: "Panini Barbacoa",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 25,
  cat: "Paninis",
  name: "Panini Kebab",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 26,
  cat: "Paninis",
  name: "Panini 4 Quesos",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
},
// ── COOKIES ──
{
  id: 27,
  cat: "Cookies",
  name: "Crumbl Cookie Pistacho",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 28,
  cat: "Cookies",
  name: "Crumbl Cookie Lotus",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 29,
  cat: "Cookies",
  name: "Crumbl Cookie Oreo",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 30,
  cat: "Cookies",
  name: "Crumbl Cookie Kit Kat",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 31,
  cat: "Cookies",
  name: "Crumbl Cookie Nutella",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 32,
  cat: "Cookies",
  name: "Crumbl Cookie Kinder",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 33,
  cat: "Cookies",
  name: "Crumbl Cookie Huesitos Blanco",
  desc: "Recién horneada",
  price: 2.99
},
// ── TARTAS ──
{
  id: 34,
  cat: "Tartas",
  name: "Tarta de Queso La Viña",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 35,
  cat: "Tartas",
  name: "Tarta Tres Chocolates",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 36,
  cat: "Tartas",
  name: "Tarta de la Abuela",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 37,
  cat: "Tartas",
  name: "Tarta de Queso Lotus",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 38,
  cat: "Tartas",
  name: "Tarta de Queso Pistacho",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 39,
  cat: "Tartas",
  name: "Tarta de Queso Dinosaurio",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 40,
  cat: "Tartas",
  name: "Tarta de Queso Kinder",
  desc: "Especial · elaboración propia",
  price: 3.90
},
// ── BEBIDAS ──
{
  id: 41,
  cat: "Bebidas",
  name: "Refresco lata",
  desc: "",
  price: 1.10
}, {
  id: 42,
  cat: "Bebidas",
  name: "Cerveza lata",
  desc: "",
  price: 1.20
}, {
  id: 43,
  cat: "Bebidas",
  name: "Agua pequeña",
  desc: "",
  price: 0.80
}, {
  id: 44,
  cat: "Bebidas",
  name: "Refresco 500 ml",
  desc: "",
  price: 1.80
}, {
  id: 45,
  cat: "Bebidas",
  name: "Cerveza 1 litro",
  desc: "",
  price: 1.80
}, {
  id: 46,
  cat: "Bebidas",
  name: "Monster o Red Bull",
  desc: "",
  price: 1.80
}, {
  id: 47,
  cat: "Bebidas",
  name: "Agua 1,5 litros",
  desc: "",
  price: 1.30
}, {
  id: 48,
  cat: "Bebidas",
  name: "Nestea / Aquarius 1,5 l",
  desc: "",
  price: 2.20
}, {
  id: 49,
  cat: "Bebidas",
  name: "Refresco 2 litros",
  desc: "",
  price: 2.50
}];
// El JSON-LD del menú (schema.org Menu) y el listado de productos ya no se
// generan aquí por JavaScript — los genera el servidor en el propio HTML
// (ver menu-render.php / index.php), para que un buscador los vea sin
// depender de que se ejecute ningún script. renderMenu() (admin-config.js)
// simplemente sustituye ese contenido inicial por la versión interactiva
// en cuanto carga la página, como ya hacía antes.
let cart = {};
window._adminLoggedIn = false;
let _adminLoggedIn = false; // true solo cuando hay sesión de admin activa
let activeCategory = "Todos";
const categories = ["Todos", ...new Set(MENU.map(i => i.cat))];
const CATEGORY_ICONS = {"Todos":"🍽️","Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};

// ── Alérgenos por producto (los 14 de declaración obligatoria en la UE) ──
// Antes esa información solo estaba en el cartel físico del local — quien
// miraba la carta desde casa antes de decidir no tenía forma de saberlo
// sin llamar o venir a preguntar. item.tags (array de estos ids, opcional)
// se guarda junto al resto de datos del producto en config/menu — marca
// los alérgenos que el producto SÍ contiene (no es una etiqueta positiva
// tipo "vegano", es la lista de qué evitar).
// Cada uno lleva su icono real (pictograma en círculo de color, subidos
// por la dueña — img/alergenos/<id>.webp) y, de refuerzo, un color+emoji
// por si esa imagen no llegara a cargar (sin conexión, archivo borrado sin
// querer...) — en algo de seguridad alimentaria no vale arriesgarse a que
// el aviso desaparezca sin más porque falló una imagen.
const DIETARY_TAGS = [
  { id: 'gluten', emoji: '🌾', label: 'Gluten', color: '#E67E22', img: 'img/alergenos/gluten.webp' },
  { id: 'crustaceos', emoji: '🦐', label: 'Crustáceos', color: '#2980B9', img: 'img/alergenos/crustaceos.webp' },
  { id: 'huevo', emoji: '🥚', label: 'Huevo', color: '#F1A208', img: 'img/alergenos/huevo.webp' },
  { id: 'pescado', emoji: '🐟', label: 'Pescado', color: '#1B4F72', img: 'img/alergenos/pescado.webp' },
  { id: 'cacahuetes', emoji: '🥜', label: 'Cacahuetes', color: '#8B5A2B', img: 'img/alergenos/cacahuetes.webp' },
  { id: 'soja', emoji: '🫘', label: 'Soja', color: '#27632A', img: 'img/alergenos/soja.webp' },
  { id: 'leche', emoji: '🥛', label: 'Leche', color: '#5DADE2', img: 'img/alergenos/leche.webp' },
  { id: 'frutos_cascara', emoji: '🌰', label: 'Frutos de cáscara', color: '#C0392B', img: 'img/alergenos/frutos_cascara.webp' },
  { id: 'apio', emoji: '🥬', label: 'Apio', color: '#58B368', img: 'img/alergenos/apio.webp' },
  { id: 'mostaza', emoji: '🟡', label: 'Mostaza', color: '#D4AC0D', img: 'img/alergenos/mostaza.webp' },
  { id: 'sesamo', emoji: '⚪', label: 'Sésamo', color: '#95A5A6', img: 'img/alergenos/sesamo.webp' },
  { id: 'sulfitos', emoji: '🍷', label: 'Sulfitos', color: '#7D3C98', img: 'img/alergenos/sulfitos.webp' },
  { id: 'altramuces', emoji: '🌱', label: 'Altramuces', color: '#B7950B', img: 'img/alergenos/altramuces.webp' },
  { id: 'moluscos', emoji: '🐚', label: 'Moluscos', color: '#17A589', img: 'img/alergenos/moluscos.webp' }
];
// Genera el HTML de las insignias de alérgenos de un producto (solo el
// icono, sin texto — el nombre completo sale al pasar el ratón por
// encima, con el title), para ponerlas justo al lado del nombre del
// producto — se usa tanto en la carta real (nucleo-compartido.js) como en
// la lista del panel de admin (admin-config.js), así se ven de un vistazo
// en los dos sitios sin tener que abrir nada.
function _alergenoTitulo(t, nota) {
  return 'Contiene ' + t.label + (nota ? ' — ' + nota : '');
}
function _alergenoEmojiSpan(t, nota) {
  return '<span class="allergen-icon" style="background:' + t.color + '" title="' + _alergenoTitulo(t, nota).replace(/"/g, '&quot;') + '">' + t.emoji + '</span>';
}
// Si el icono real no llega a cargar (sin conexión, archivo movido/borrado
// sin querer...) se cae al círculo de color + emoji en vez de dejar un
// hueco roto — el aviso del alérgeno no debe desaparecer sin más. La nota
// concreta del producto (si tenía) no se conserva en este caso — es un
// fallback para un fallo raro, no merece la pena complicar el onerror por eso.
function _alergenoImgFallback(img, tid) {
  const t = DIETARY_TAGS.find(d => d.id === tid);
  if (t) img.outerHTML = _alergenoEmojiSpan(t);
}
// Texto para meter dentro de un atributo onclick="..." de doble comilla:
// escapa barras invertidas y comillas simples (para la cadena de JS) y
// luego las comillas dobles (para que no corten el atributo HTML).
function _jsAttrEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
// item.tagNotes = { <idAlergeno>: 'texto libre' } (opcional) — nota
// concreta para UN alérgeno de UN producto, cuando hace falta algo más
// específico que el mensaje genérico de abajo (siempre gana si está).
//
// item.ingredientesQuitables (opcional, true/false) — para cuando TODOS
// los ingredientes con alérgeno de un producto se pueden pedir sin ellos
// (p.ej. todas las patatas menos la Carbonara y la Boloñesa, que llevan
// el alérgeno en la propia salsa y no se puede sacar). Se marca por
// producto desde el panel (o de golpe para toda la categoría "Patatas"
// con el botón de arriba de esa sección — ver marcarPatatasAlergenosQuitables
// en admin-config.js), así no hace falta escribir la misma nota en cada
// alérgeno de cada patata una por una.
//
// El icono no lleva texto ni nota a la vista (se decidió que ocupara sitio
// de más en cada producto) — en vez de eso, TOCAR el icono abre el mismo
// aviso emergente que ya usa el resto de la web (showAlert). Un aviso
// arriba de la carta (ver #allergen-hint en index.php) explica una sola
// vez que se puede tocar.
function dietaryTagsHtml(item) {
  if (!Array.isArray(item.tags) || !item.tags.length) return '';
  const notas = (item.tagNotes && typeof item.tagNotes === 'object') ? item.tagNotes : {};
  return '<span class="item-tags">' + item.tags.map(tid => {
    const t = DIETARY_TAGS.find(d => d.id === tid);
    if (!t) return '';
    const nota = notas[tid] || '';
    const mensaje = nota
      || (item.ingredientesQuitables ? ('Puedes pedir este producto sin ' + t.label.toLowerCase() + ' si lo prefieres.') : ('Este producto contiene ' + t.label.toLowerCase() + '.'));
    const onclick = "if(typeof showAlert==='function')showAlert('" + _jsAttrEscape(mensaje) + "','" + _jsAttrEscape(t.label) + "')";
    if (t.img) return '<img class="allergen-icon-img" src="' + t.img + '" alt="" title="' + _alergenoTitulo(t, nota).replace(/"/g, '&quot;') + '" onclick="' + onclick + '" onerror="_alergenoImgFallback(this,\'' + t.id + '\')">';
    return '<span class="allergen-icon" style="background:' + t.color + '" title="' + _alergenoTitulo(t, nota).replace(/"/g, '&quot;') + '" onclick="' + onclick + '">' + t.emoji + '</span>';
  }).join('') + '</span>';
}
function initTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = categories.map(c => {
    const icon = CATEGORY_ICONS[c] || '🍽️';
    return "<button class=\"tab ".concat(c === activeCategory ? 'active' : '', "\" onclick=\"setCategory('").concat(c, "')\"><span class=\"tab-icon\">").concat(icon, "</span><span>").concat(c, "</span></button>");
  }).join('');
}
function setCategory(cat) {
  activeCategory = cat;
  initTabs();
  renderMenu();
}

// renderMenu definida más abajo con soporte completo (soldout, hidden, custom, extras)

function showClosedToast() {
  var t = document.getElementById("closed-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "closed-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    t.innerHTML = "🔒 Estamos cerrados · Puedes consultar la carta";
    document.body.appendChild(t);
  }
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 2800);
}
// Toast genérico reutilizable — mismo patrón que showClosedToast(), para
// confirmar visualmente acciones rápidas (copiar algo al portapapeles, etc.)
// que antes no daban ningún feedback.
function showCopyToast(msg) {
  var t = document.getElementById("copy-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "copy-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    document.body.appendChild(t);
  }
  t.innerHTML = msg;
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 1800);
}
function copiarTexto(text, mensajeExito) {
  function onOk() { showCopyToast(mensajeExito || "✅ Copiado"); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onOk).catch(function () {
      _copiarConExecCommand(text);
      onOk();
    });
  } else {
    _copiarConExecCommand(text);
    onOk();
  }
}
function _copiarConExecCommand(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}
// Contador de caracteres restantes para el campo de notas — antes solo se
// sabía que se había llegado al límite de 300 cuando el textarea dejaba de
// aceptar más texto, sin ningún aviso previo.
function _actualizarContadorNotas(textareaId, counterId) {
  const ta = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!ta || !counter) return;
  const max = parseInt(ta.getAttribute('maxlength'), 10) || 300;
  const restantes = max - ta.value.length;
  counter.textContent = restantes + ' caracteres restantes';
  counter.style.color = restantes <= 20 ? '#c0392b' : 'var(--muted, #8A6A4E)';
}
// Muestra el aviso de dato que falta/es inválido Y desplaza hasta el campo
// correspondiente, resaltándolo un instante — antes solo salía la alerta,
// sin llevar al cliente hasta dónde está el problema (con el formulario
// largo, tocaba buscarlo a ojo). Detecta si el cliente está en el drawer
// móvil (donde los campos visibles son drawer-customer-*, no los del
// formulario de escritorio que solo se sincronizan por debajo) para
// desplazarse al campo que de verdad se ve en pantalla.
function _alertaConFoco(msg, fieldIdBase) {
  showAlert(msg);
  const drawer = document.getElementById('cart-drawer');
  const enDrawer = drawer && drawer.classList.contains('open');
  const fieldId = enDrawer ? ('drawer-' + fieldIdBase) : fieldIdBase;
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.classList.add('campo-con-error');
  setTimeout(() => field.classList.remove('campo-con-error'), 2000);
  setTimeout(() => { if (typeof field.focus === 'function') field.focus(); }, 350);
}
// Un único "ding" suave al confirmar el pedido — mismo patrón (Web Audio,
// sin archivos externos) que ya usa _sonidoCelebracion() en la ruleta, pero
// una sola nota discreta en vez del arpegio de premio.
function _sonidoConfirmacionPedido() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880; // La5
    const start = ctx.currentTime;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.55);
    setTimeout(() => ctx.close(), 900);
  } catch (e) { /* si el navegador bloquea el audio, no pasa nada — solo se pierde el sonido */ }
}
function isShopBlocked() {
  var _document$getElementB;
  // 1. Si el banner de cerrado está visible
  const banner = document.getElementById('orders-closed-banner');
  if (banner && banner.style.display === 'block') return true;
  // 2. Si los pedidos están pausados manualmente (incluye la auto-pausa por
  // saturación, que reutiliza este mismo candado — ver _aplicarAutoPausa en
  // admin-config.js)
  if (!getOrdersOpen()) return true;
  // 3. Si hoy es día cerrado
  if (!isTodayOpen()) return true;
  // 4. Si estamos fuera del horario de apertura
  if (isOutsideHours()) return true;
  // 5. Pausa exprés activa (independiente de ordersOpen, con su propia
  // cuenta atrás — ver pausarExpres() en admin-config.js)
  try {
    const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
    if (hasta && Date.now() < hasta) return true;
  } catch (e) {}
  // 6. Fallback: texto del estado
  const statusText = ((_document$getElementB = document.getElementById('hero-status-text')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.textContent) || '';
  if (statusText.startsWith('Abrimos a las') || statusText === 'Cerrado ahora' || statusText === 'Cerrado hoy') return true;
  return false;
}
// Refresca la UI de "pedidos cerrados" cuando cambia pausaExpresHasta (por
// activarla o por llegar su hora de reapertura) — sin tocar ordersOpen/
// ordersMsg de verdad (eso es cosa de la pausa manual/auto-pausa, no de
// esta), pero SÍ hay que reflejar en el candado que ahora mismo está
// bloqueado por la pausa exprés aunque ordersOpen siga en true, o el
// cliente vería el formulario normal y solo se enteraría del bloqueo al
// intentar confirmar (isShopBlocked()/el servidor sí lo rechazan, pero la
// pantalla no lo estaba avisando de antemano).
function _actualizarBloqueoPorPausaExpres() {
  if (typeof updateOrdersUI !== 'function') return;
  const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
  if (hasta && Date.now() < hasta) {
    updateOrdersUI(false, 'Pausados temporalmente, volvemos enseguida.');
  } else {
    updateOrdersUI(getOrdersOpen());
  }
}
// Se reabre sola al pasar el tiempo sin depender de que llegue ningún aviso
// nuevo de Firebase (un timestamp que ya pasó no dispara ningún listener
// por sí solo) — comprobación ligera cada 30s, solo hace algo si hay una
// pausa exprés activa de verdad.
setInterval(() => {
  const hasta = parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10);
  if (hasta && Date.now() >= hasta) {
    localStorage.setItem('dpf_pausa_expres_hasta', '0');
    _actualizarBloqueoPorPausaExpres();
  }
}, 30000);
// Banner suave de saturación (no bloquea pedidos) — dirigido por
// config/avisoSaturacionEstado, que solo puede publicar una sesión de
// admin/cocina de verdad (ver _actualizarAvisoSaturacion en
// pedidos-vivo-cocina.js). "busy-mode-banner" es un elemento estático
// aparte con texto fijo, no se toca aquí.
function _renderAvisoSaturacionBanner(estado) {
  const el = document.getElementById('aviso-saturacion-banner');
  if (!el) return;
  if (estado && estado.activo && estado.msg) {
    el.textContent = estado.msg;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}
// ── OFERTA RELÁMPAGO (descuento por tiempo limitado, ver admin-turnos-
// descuentos.js para quien la lanza/cancela) ── window._ofertaRelampagoActiva
// guarda { tipo:'total'|'producto', productoId, pct, fin } o null. "Vigente"
// se decide comparando fin contra la hora actual en cada sitio que lo usa,
// nunca con un booleano guardado — así una pestaña abierta desde antes de
// que acabara la oferta la deja de aplicar sola, sin depender de que llegue
// ningún aviso nuevo de Firebase justo en ese instante.
window._ofertaRelampagoActiva = null;
let _ofertaRelampagoTickInterval = null;
function _ofertaRelampagoVigente(o) {
  return !!(o && o.fin && o.pct > 0 && Date.now() < o.fin);
}
// Precio real de un producto del menú, aplicando la oferta relámpago si está
// vigente y es justo ese producto. Todo lo que calcula un total a partir de
// MENU (renderMenu en admin-config.js, renderCart de aquí abajo, y el envío
// del pedido en carrito-checkout.js) pasa por aquí en vez de leer item.price
// directamente — así el descuento se refleja en todos lados con un único
// cambio, sin mutar el propio array MENU (que también lo usa finanzas.js
// para calcular márgenes, y no debe ver precios rebajados temporalmente).
function _precioConOferta(item) {
  const o = window._ofertaRelampagoActiva;
  if (o && o.tipo === 'producto' && Array.isArray(o.productoIds) && o.productoIds.includes(item.id) && _ofertaRelampagoVigente(o)) {
    return Math.round(item.price * (1 - o.pct / 100) * 100) / 100;
  }
  return item.price;
}
function _renderOfertaRelampagoBanner() {
  const el = document.getElementById('oferta-relampago-banner');
  const o = window._ofertaRelampagoActiva;
  if (!el) return;
  if (!_ofertaRelampagoVigente(o)) {
    el.style.display = 'none';
    return;
  }
  const restante = Math.max(0, o.fin - Date.now());
  const m = Math.floor(restante / 60000);
  const s = Math.floor((restante % 60000) / 1000);
  let destino = 'todo el pedido';
  if (o.tipo === 'producto' && Array.isArray(o.productoIds)) {
    const nombres = o.productoIds.map(id => (MENU.find(mi => mi.id === id) || {}).name).filter(Boolean);
    destino = nombres.length ? nombres.join(', ') : 'este producto';
  }
  el.textContent = '⚡ Oferta relámpago: -' + o.pct + '% en ' + destino + ' · acaba en ' + m + ':' + String(s).padStart(2, '0');
  el.style.display = 'block';
}
// Se llama al recibir cada cambio desde Firebase (ver loadOfertaRelampagoFromFirebase
// en admin-turnos-descuentos.js) y también cada segundo mientras esté
// vigente, para que la cuenta atrás avance y el precio se restaure solo en
// cuanto expire, sin recargar la página.
function _actualizarOfertaRelampago(oferta) {
  const eraVigente = _ofertaRelampagoVigente(window._ofertaRelampagoActiva);
  window._ofertaRelampagoActiva = oferta;
  const esVigente = _ofertaRelampagoVigente(oferta);
  _renderOfertaRelampagoBanner();
  if (eraVigente !== esVigente || (eraVigente && esVigente)) {
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof renderCart === 'function') renderCart();
  }
  if (_ofertaRelampagoTickInterval) { clearInterval(_ofertaRelampagoTickInterval); _ofertaRelampagoTickInterval = null; }
  if (esVigente) {
    _ofertaRelampagoTickInterval = setInterval(function () {
      if (!_ofertaRelampagoVigente(window._ofertaRelampagoActiva)) {
        _actualizarOfertaRelampago(null);
        return;
      }
      _renderOfertaRelampagoBanner();
    }, 1000);
  }
}
function changeQty(id, delta) {
  // Bloquear añadir al carrito si hoy es día cerrado o pedidos pausados
  if (delta > 0 && isShopBlocked()) {
    showClosedToast();
    return;
  }
  if ((id === 15 || id === 16) && delta > 0) {
    openCustomizer(id);
    return;
  }
  if (id === CHEDDAR_ID && delta > 0) {
    openCheddarModal();
    return;
  }
  if (ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(id) && delta > 0) {
    openExtrasModal(id);
    return;
  }
  // Defensa en profundidad: renderMenu() ya oculta los controles +/- de un
  // producto agotado/oculto, así que hoy esto no es alcanzable desde la UI
  // normal — pero changeQty() en sí no comprobaba nada, así que cualquier
  // otra vía de llamarla (consola, un botón que quede con el id viejo tras
  // marcar el producto agotado mientras la página ya estaba abierta, un
  // futuro caller) podía seguir añadiendo un producto agotado al carrito.
  if (delta > 0) {
    const _item = typeof MENU !== 'undefined' ? MENU.find(m => m.id == id) : null;
    if (_item && (_item.hidden || _item.soldout)) return;
  }
  const current = cart[id] || 0;
  const next = current + delta;
  if (next <= 0) delete cart[id];else cart[id] = next;
  renderMenu();
  renderCart();
  if (delta > 0) _animateAddToCart(id);
}
function _animateAddToCart(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    const btn = card.querySelector('.add-btn, .qty-btn:last-child');
    if (btn) {
      btn.classList.remove('popping');
      void btn.offsetWidth;
      btn.classList.add('popping');
      btn.addEventListener('animationend', () => btn.classList.remove('popping'), {
        once: true
      });
      // Confirmación visual más clara que solo el rebote: el botón muestra
      // un ✓ un instante y una miniatura "vuela" hasta el carrito/FAB.
      btn.classList.add('add-check');
      btn.textContent = '✓';
      clearTimeout(btn._addCheckTimer);
      btn._addCheckTimer = setTimeout(() => {
        btn.classList.remove('add-check');
        btn.textContent = '+';
      }, 550);
      _lanzarFlyGhost(btn);
    }
    card.classList.remove('flashing');
    void card.offsetWidth;
    card.classList.add('flashing');
    card.addEventListener('animationend', () => card.classList.remove('flashing'), {
      once: true
    });
  }
  const fab = document.getElementById('cart-fab');
  if (fab && !fab.classList.contains('hidden')) {
    fab.classList.remove('bumping');
    void fab.offsetWidth;
    fab.classList.add('bumping');
    fab.addEventListener('animationend', () => fab.classList.remove('bumping'), {
      once: true
    });
  }
  const count = document.getElementById('cart-fab-count');
  if (count) {
    count.classList.remove('popping');
    void count.offsetWidth;
    count.classList.add('popping');
    count.addEventListener('animationend', () => count.classList.remove('popping'), {
      once: true
    });
  }
}
// Crea una miniatura que "vuela" desde el botón pulsado hasta el carrito
// (el FAB en móvil, o el contador de "Tu pedido" en escritorio, donde no
// hay FAB) — refuerzo visual de que el producto se ha añadido, más allá
// del rebote del propio botón.
function _lanzarFlyGhost(btn) {
  const fab = document.getElementById('cart-fab');
  const target = (fab && !fab.classList.contains('hidden')) ? fab : document.getElementById('cart-count');
  if (!target) return;
  const btnRect = btn.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!btnRect.width || !targetRect.width) return;
  const ghost = document.createElement('div');
  ghost.className = 'fly-ghost';
  ghost.textContent = '🥔';
  const size = 26;
  ghost.style.left = (btnRect.left + btnRect.width / 2 - size / 2) + 'px';
  ghost.style.top = (btnRect.top + btnRect.height / 2 - size / 2) + 'px';
  const dx = (targetRect.left + targetRect.width / 2) - (btnRect.left + btnRect.width / 2);
  const dy = (targetRect.top + targetRect.height / 2) - (btnRect.top + btnRect.height / 2);
  ghost.style.setProperty('--fly-target', 'translate(' + dx + 'px,' + dy + 'px)');
  document.body.appendChild(ghost);
  requestAnimationFrame(() => ghost.classList.add('flying'));
  setTimeout(() => ghost.remove(), 650);
}
// ── 🍰 Venta sugerida: dulce de postre ──────────────────────────────────────
// Siempre sugiere tarta o galleta (nunca bebida). Varía según lo que ya
// lleve el pedido: cantidad de patatas/boniatos (singular/plural) y, si
// detecta un sabor con tarta a juego (Lotus, Pistacho, Kinder, Dinosaurio),
// sugiere esa tarta en concreto en vez de la genérica.

const UPSELL_TARTA_IDS = { 34: 'La Viña', 35: 'Tres Chocolates', 36: 'de la Abuela', 37: 'Lotus', 38: 'Pistacho', 39: 'Dinosaurio', 40: 'Kinder' };
const UPSELL_GALLETA_IDS = [27, 28, 29, 30, 31, 32, 33]; // Pistacho, Lotus, Oreo, Kit Kat, Nutella, Kinder, Huesitos
const UPSELL_SABOR_TARTA = { 'lotus': 37, 'pistacho': 38, 'dinosaurio': 39, 'kinder': 40 };
const UPSELL_PESADAS = ['cheddar-bacon', 'carnívora', '4 quesos'];
// Solo bebidas individuales sin alcohol para el upsell — nada de cerveza
// (la web no verifica la edad de quien pide) ni de garrafas de 1,5-2L, que
// no pegan como "añade algo de beber" de un solo trago.
const UPSELL_BEBIDA_IDS = [41, 43, 44, 46]; // Refresco lata, Agua pequeña, Refresco 500ml, Monster/Red Bull

// "No, gracias" ahora solo vale para ESTE pedido (antes se guardaba en
// sessionStorage y se recordaba para toda la visita a la web, aunque el
// cliente hiciera otro pedido justo después) — se guarda por tipo
// (dulce/bebida) para no descartar los dos a la vez si solo dice que no a
// uno. Se resetea al confirmar/cancelar el pedido (ver antifraude.js).
window._upsellDismissed = window._upsellDismissed || { dulce: false, bebida: false };
function dismissUpsellDulce(tipo) {
  window._upsellDismissed[tipo || 'dulce'] = true;
  renderCart();
}

// Devuelve { tipo, pregunta, opciones: [{id, name, price, emoji}, ...] } o
// null si no toca mostrar ninguna sugerencia. Primero comprueba el postre;
// si ya no aplica (porque ya hay uno en el carrito, o el cliente lo
// descartó), pasa a comprobar la bebida — así solo se ve una tarjeta cada
// vez, no las dos a la vez.
function getUpsellCarrito() {
  // Cantidad de patatas/boniatos en el pedido: cart normal + custCart (Al Gusto/Bomba)
  // + extrasCart (patatas con queso/gratinado, como Philadelphia, Carbonara, Carnívora, etc.)
  const papasIdsCart = Object.entries(cart).filter(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato') && qty > 0;
  });
  const papasCartQty = papasIdsCart.reduce((s, [, q]) => s + q, 0);

  const papasCustQty = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => s + c.qty, 0);

  const extrasPatatas = Object.values(extrasCart).filter(c => {
    if (c.qty <= 0) return false;
    const item = MENU.find(m => m.id == c.menuId);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato');
  });
  const papasExtrasQty = extrasPatatas.reduce((s, c) => s + c.qty, 0);

  const papasQty = papasCartQty + papasCustQty + papasExtrasQty;

  if (papasQty === 0) return null; // sin patatas/boniato, no aplica ningún upsell
  const esPlural = papasQty >= 2;

  // ── 1. ¿Postre? ──
  const yaHayDulce = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Tartas' || item.cat === 'Cookies') && cart[id] > 0;
  });
  if (!yaHayDulce && !window._upsellDismissed.dulce) {
    const pregunta = esPlural ? '¿Le metéis algo dulce de postre?' : '¿Le metes algo dulce de postre?';

    // ¿Algún producto del carrito (cart o extrasCart) tiene sabor con tarta a juego?
    const nombresCart = papasIdsCart.map(([id]) => (MENU.find(m => m.id == id) || {}).name || '');
    const nombresExtras = extrasPatatas.map(c => (MENU.find(m => m.id == c.menuId) || {}).name || '');
    const nombresEnCarrito = [...nombresCart, ...nombresExtras].join(' ').toLowerCase();
    let tartaSaborId = null;
    for (const sabor in UPSELL_SABOR_TARTA) {
      if (nombresEnCarrito.includes(sabor)) {
        tartaSaborId = UPSELL_SABOR_TARTA[sabor];
        break;
      }
    }

    // Se eligen 2-3 opciones (tarta con sabor a juego primero, si aplica) y
    // se guardan en caché para no volver a sortear otras al repintar el
    // carrito (p.ej. tras comprobar fidelización mientras el cliente sigue
    // escribiendo) — eso daba la sensación de que las tarjetas "parpadeaban".
    // Si cambia de singular a plural (añade una segunda patata) sí se
    // recalcula, porque el fondo de opciones a elegir es distinto.
    window._upsellOpcionesElegidas = window._upsellOpcionesElegidas || {};
    const cacheDulce = window._upsellOpcionesElegidas.dulce;
    if (!cacheDulce || cacheDulce.esPlural !== esPlural) {
      const elegidos = [];
      if (tartaSaborId) elegidos.push(tartaSaborId);
      const pool = (esPlural ? Object.keys(UPSELL_TARTA_IDS).map(Number) : UPSELL_GALLETA_IDS)
        .filter(id => !elegidos.includes(id));
      // Barajar el resto del fondo y completar hasta 3 opciones en total
      const barajado = pool.slice().sort(() => Math.random() - 0.5);
      for (const id of barajado) {
        if (elegidos.length >= 3) break;
        elegidos.push(id);
      }
      window._upsellOpcionesElegidas.dulce = { esPlural, ids: elegidos.slice(0, 3) };
    }

    const opciones = window._upsellOpcionesElegidas.dulce.ids
      .map(id => MENU.find(m => m.id === id))
      .filter(Boolean)
      .map(it => ({ id: it.id, name: it.name, price: it.price, emoji: it.cat === 'Tartas' ? '🎂' : '🍪' }));
    if (opciones.length) {
      // Se usa en submitOrder() para saber si el aviso llegó a mostrarse de
      // verdad (para las estadísticas de "mostrado vs añadido").
      window._upsellFueMostrado = true;
      return { tipo: 'dulce', pregunta, opciones };
    }
  }

  // ── 2. ¿Bebida? (solo si el postre ya no toca, para no amontonar dos tarjetas a la vez) ──
  const yaHayBebida = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && item.cat === 'Bebidas' && cart[id] > 0;
  });
  if (!yaHayBebida && !window._upsellDismissed.bebida) {
    const pregunta = esPlural ? '¿Le añadís algo de beber?' : '¿Le añades algo de beber?';

    window._upsellOpcionesElegidas = window._upsellOpcionesElegidas || {};
    if (!window._upsellOpcionesElegidas.bebida) {
      const barajado = UPSELL_BEBIDA_IDS.slice().sort(() => Math.random() - 0.5);
      window._upsellOpcionesElegidas.bebida = { ids: barajado.slice(0, 3) };
    }

    const opciones = window._upsellOpcionesElegidas.bebida.ids
      .map(id => MENU.find(m => m.id === id))
      .filter(Boolean)
      .map(it => ({ id: it.id, name: it.name, price: it.price, emoji: '🥤' }));
    if (opciones.length) {
      window._upsellFueMostrado = true;
      return { tipo: 'bebida', pregunta, opciones };
    }
  }

  return null;
}

function renderUpsellDulce() {
  const sug = getUpsellCarrito();
  if (!sug) return '';
  const opcionesHtml = sug.opciones.map(op =>
    '<div class="upsell-dulce-opcion">'
    + '<span class="upsell-dulce-opcion-name">' + escapeHtml(op.name) + '</span>'
    + '<span class="upsell-dulce-opcion-price">' + op.price.toFixed(2).replace('.', ',') + ' €</span>'
    + '<button class="upsell-dulce-opcion-add" onclick="changeQty(' + op.id + ',1)">+ Añadir</button>'
    + '</div>'
  ).join('');
  // La tarjeta lleva una animación de entrada (CSS), pero el carrito entero
  // se repinta muchas veces mientras el cliente escribe (teléfono, notas...)
  // — como renderCart() reconstruye el HTML entero cada vez, sin esto la
  // tarjeta se recreaba como un elemento nuevo en cada repintado y la
  // animación volvía a arrancar desde cero, dando la sensación de que
  // "parpadeaba" sola mientras escribía. Solo se anima la primera vez que
  // se muestra en este pedido; se resetea al confirmar/cancelar el pedido.
  const primeraVez = !window._upsellYaAnimado;
  window._upsellYaAnimado = true;
  return '<div class="upsell-dulce' + (primeraVez ? '' : ' upsell-dulce-sin-animar') + '">'
    + '<div class="upsell-dulce-row1">'
    + '<div class="upsell-dulce-icon">' + sug.opciones[0].emoji + '</div>'
    + '<div class="upsell-dulce-question">' + sug.pregunta + '</div>'
    + '<button class="upsell-dulce-dismiss" onclick="dismissUpsellDulce(\'' + sug.tipo + '\')" title="No, gracias">&#10005;</button>'
    + '</div>'
    + '<div class="upsell-dulce-opciones">' + opcionesHtml + '</div>'
    + '</div>';
}

function renderCart() {
  const lines = Object.entries(cart);
  const custLines = Object.values(custCart).filter(c => c.qty > 0);
  const countEl = document.getElementById("cart-count");
  const bodyEl = document.getElementById("cart-body");
  const totalRowEl = document.getElementById("cart-total-row");
  const formEl = document.getElementById("order-form");
  const extLines = Object.values(extrasCart).filter(c => c.qty > 0);
  const totalItems = lines.reduce((s, _ref) => {
    let _ref2 = _slicedToArray(_ref, 2),
      q = _ref2[1];
    return s + q;
  }, 0) + custLines.reduce((s, c) => s + c.qty, 0) + extLines.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = totalItems;
  if (lines.length === 0 && custLines.length === 0 && extLines.length === 0) {
    bodyEl.innerHTML = "<div class=\"cart-empty\"><div class=\"cart-empty-icon\">\uD83D\uDED2</div><div class=\"cart-empty-title\">Tu carrito est\xE1 en ayunas</div><div class=\"cart-empty-sub\">dale algo de comer, anda...</div></div>" + _bimbaTarjetaRepetirPedido();
    totalRowEl.style.display = "none";
    if (formEl) formEl.style.display = "none";
    _updateCartFab(0, 0);
    return;
  }
  let total = 0;
  const linesHtml = lines.map(_ref3 => {
    let _ref4 = _slicedToArray(_ref3, 2),
      id = _ref4[0],
      qty = _ref4[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('renderCart: producto no encontrado id=' + id);
      return '';
    }
    const subtotal = _precioConOferta(item) * qty;
    total += subtotal;
    return "\n    <div class=\"cart-line\">\n      <span class=\"cart-line-name\">".concat(item.name, "</span>\n      <span class=\"cart-line-qty\">x").concat(qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"removeItem(").concat(id, ")\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const custLinesHtml = custLines.map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('renderCart: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces.map(s => 'Extra salsa ' + s), ...c.ingredients.map(i => 'Extra ' + i)].join(', ');
    return "\n    <div class=\"cart-line\" style=\"flex-wrap:wrap\">\n      <span class=\"cart-line-name\" style=\"width:100%\">".concat(item.name, "\n        <span style=\"font-size:11px;color:#8A6A4E;font-weight:400;display:block\">").concat(details, "</span>\n      </span>\n      <span class=\"cart-line-qty\">x").concat(c.qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"duplicarCustItem('").concat(c.key.replace(/'/g, "\\'"), "')\" title=\"Duplicar para pedir otra con distintas salsas/ingredientes\" style=\"color:#8A6A4E\">&#128203;</button>\n      <button class=\"cart-remove\" onclick=\"removeCustItem('").concat(c.key.replace(/'/g, "\\'"), "')\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const extLinesHtml = extLines.map(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const _extItem = MENU.find(m => m.id == c.menuId);
    if (!_extItem) {
      console.error('renderCart: extras item no encontrado menuId=' + c.menuId);
      return '';
    }
    const itemName = _extItem.name;
    const extras = [];
    if (c.queso) extras.push('+ Extra Queso +1,00€');
    (c.ingredientesExtra || []).forEach(ing => {
      const _precioIng = (typeof EXTRAS_ING_PRECIO1 !== 'undefined' && EXTRAS_ING_PRECIO1.includes(ing)) ? '1,00' : '0,70';
      extras.push('+ Extra ' + ing + ' +' + _precioIng + '€');
    });
    (c.salsasExtra || []).forEach(salsa => extras.push('+ Extra salsa ' + salsa + ' +0,90€'));
    // El gratinado siempre va el último de la lista, sea cual sea el
    // resto de extras que tenga el pedido.
    if (c.gratinado) extras.push('+ Gratinado +0,50€');
    return '<div class="cart-line" style="flex-wrap:wrap">' + '<span class="cart-line-name" style="width:100%">' + itemName + (extras.length ? '<span style="font-size:11px;color:#8A6A4E;font-weight:400;display:block">' + extras.join(' · ') + '</span>' : '') + '</span>' + '<span class="cart-line-qty">x' + c.qty + '</span>' + '<span class="cart-line-price">' + subtotal.toFixed(2) + ' €</span>' + '<button class="cart-remove" onclick="removeExtrasItem(\'' + c.key.replace(/'/g, "\\'") + '\')" title="Quitar">&#128465;</button>' + '</div>';
  }).join('');
  const cartHtml = linesHtml + custLinesHtml + extLinesHtml + renderUpsellDulce();
  bodyEl.innerHTML = cartHtml;

  // Mostrar línea de gastos de gestión si está activa — salvo que el
  // cliente haya metido el código de "pedido desde el local" (para cuando
  // hay cola y se pide desde el móvil sin cargo, solo ese pedido)
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  // El código local exime SIEMPRE al gasto fijo que sea "de gestión" —
  // puede ser el 1º o el 2º según cómo estén configurados ahora mismo, así
  // que se identifica por su etiqueta, no por su posición. Si ninguno de
  // los dos menciona "gestión" (p.ej. se renombraron del todo), se exime
  // el primero por defecto para no perder la exención.
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2LabelParaExencion = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(_fee2LabelParaExencion);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
  const feeEl = document.getElementById('cart-fee-row');
  if (feeEl) {
    if (feeEnabled) {
      feeEl.style.display = 'flex';
      document.getElementById('cart-fee-label').textContent = feeLabel;
      document.getElementById('cart-fee-amount').textContent = feeAmount.toFixed(2).replace('.', ',') + ' €';
    } else {
      feeEl.style.display = 'none';
    }
  }
  // El enlace de "código del local" solo tiene sentido si hay algún gasto
  // de gestión activo que quitar (con el código puesto o sin él) — puede
  // ser el 1º o el 2º gasto fijo, según cuál esté etiquetado como gestión.
  const localCodeRowEl = document.getElementById('local-fee-code-row');
  const _hayGestionQueQuitar = getFeeEnabled() || ((typeof getFee2Enabled === 'function') && getFee2Enabled());
  if (localCodeRowEl) localCodeRowEl.style.display = (_hayGestionQueQuitar && getLocalFeeCode()) ? 'block' : 'none';
  // Segundo gasto fijo, independiente del anterior (su propio interruptor) —
  // también se exime con el código local si es este el que está etiquetado
  // como "de gestión" (ver arriba).
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const fee2El = document.getElementById('cart-fee2-row');
  if (fee2El) {
    if (fee2Enabled) {
      fee2El.style.display = 'flex';
      document.getElementById('cart-fee2-label').textContent = fee2Label;
      document.getElementById('cart-fee2-amount').textContent = fee2Amount.toFixed(2).replace('.', ',') + ' €';
    } else {
      fee2El.style.display = 'none';
    }
  }
  // Descuentos que pueden aplicar a la vez: código de descuento (manual o
  // ganado en la ruleta/rasca) y estudiante/jubilado. A petición expresa,
  // estos dos NO se combinan entre sí — si ambos aplicarían, se queda solo
  // el mayor de los dos, nunca la suma. La fidelización (patata gratis) es
  // aparte y SÍ se sigue sumando siempre, sin entrar en este conflicto.
  const discountAmtRaw = (typeof getDiscountAmount === 'function') ? getDiscountAmount(total) : 0;
  const discountCode = (typeof _activeDiscount !== 'undefined' && _activeDiscount) ? _activeDiscount.code : null;
  const studentDiscountEnabledCfg = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled();
  const studentDiscountChecked = studentDiscountEnabledCfg && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const studentDiscountPctCfg = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  const studentDiscountAmtRaw = studentDiscountChecked ? Math.round(total * studentDiscountPctCfg) / 100 : 0;
  // Oferta relámpago sobre el pedido entero (ver window._ofertaRelampagoActiva
  // en carta.js) — entra en el mismo "no se combinan, gana el mayor" que ya
  // tenían código de descuento y estudiante/jubilado. La de tipo "producto"
  // no entra aquí: ya va incluida en `total` porque _precioConOferta() la
  // aplicó al calcular cada línea, más arriba.
  const _ofertaTotal = window._ofertaRelampagoActiva;
  const ofertaTotalPct = (_ofertaTotal && _ofertaTotal.tipo === 'total' && _ofertaRelampagoVigente(_ofertaTotal)) ? _ofertaTotal.pct : 0;
  const ofertaTotalAmtRaw = ofertaTotalPct > 0 ? Math.round(total * ofertaTotalPct) / 100 : 0;

  let discountAmt = discountAmtRaw;
  let studentDiscountAmt = studentDiscountAmtRaw;
  let ofertaTotalAmt = ofertaTotalAmtRaw;
  let conflictoDescuentosNota = '';
  const _candidatosDescuento = [
    { tipo: 'codigo', amt: discountAmtRaw, label: 'el código "' + discountCode + '"' },
    { tipo: 'estudiante', amt: studentDiscountAmtRaw, label: 'el descuento de estudiante/jubilado' },
    { tipo: 'oferta', amt: ofertaTotalAmtRaw, label: 'la oferta relámpago' }
  ].filter(c => c.amt > 0);
  if (_candidatosDescuento.length > 1) {
    _candidatosDescuento.sort((a, b) => b.amt - a.amt);
    const ganador = _candidatosDescuento[0];
    if (ganador.tipo !== 'codigo') discountAmt = 0;
    if (ganador.tipo !== 'estudiante') studentDiscountAmt = 0;
    if (ganador.tipo !== 'oferta') ofertaTotalAmt = 0;
    conflictoDescuentosNota = 'ℹ️ Los descuentos no se combinan entre sí — se aplica ' + ganador.label + ' por ser el mayor.';
  }
  const conflictoEl = document.getElementById('discount-conflict-notice');
  if (conflictoEl) {
    conflictoEl.textContent = conflictoDescuentosNota;
    conflictoEl.style.display = conflictoDescuentosNota ? 'block' : 'none';
  }

  // Mostrar línea de descuento si hay un código aplicado (y no ha perdido
  // el conflicto de arriba) — antes el total mostrado en el carrito nunca
  // reflejaba el descuento (solo se calculaba al confirmar el pedido), así
  // que aunque el código sí se aplicaba de verdad, la clienta no veía
  // ningún cambio en el número y parecía que no había pasado nada.
  const discountEl = document.getElementById('cart-discount-row');
  if (discountEl) {
    if (discountAmt > 0 && discountCode) {
      discountEl.style.display = 'flex';
      document.getElementById('cart-discount-label').textContent = 'Descuento (' + discountCode + ')';
      document.getElementById('cart-discount-amount').textContent = '-' + discountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      discountEl.style.display = 'none';
    }
  }
  // Oferta relámpago sobre el pedido entero (fila propia, separada del
  // código de descuento — pueden coexistir en el tiempo aunque solo uno de
  // los dos gane el conflicto de arriba, y así queda claro cuál fue).
  const ofertaTotalEl = document.getElementById('cart-oferta-relampago-row');
  if (ofertaTotalEl) {
    if (ofertaTotalAmt > 0) {
      ofertaTotalEl.style.display = 'flex';
      document.getElementById('cart-oferta-relampago-label').textContent = '⚡ Oferta relámpago (-' + ofertaTotalPct + '%)';
      document.getElementById('cart-oferta-relampago-amount').textContent = '-' + ofertaTotalAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      ofertaTotalEl.style.display = 'none';
    }
  }
  // Premio de fidelización (patata gratis) — mismo cálculo que usa
  // submitOrder() al confirmar (getFidelizacionDescuento en
  // carrito-checkout.js), para que el total mostrado mientras se compra
  // ya lo refleje en vez de solo cambiar al confirmar el pedido.
  const _fidTelInput = document.getElementById('customer-phone');
  const _fidPhoneClean = _fidTelInput ? _fidTelInput.value.replace(/\D/g, '').slice(0, 9) : '';
  const fidelizacionAmt = (typeof getFidelizacionDescuento === 'function') ? getFidelizacionDescuento(_fidPhoneClean) : 0;
  const fidelizacionEl = document.getElementById('cart-fidelizacion-row');
  if (fidelizacionEl) {
    if (fidelizacionAmt > 0) {
      fidelizacionEl.style.display = 'flex';
      document.getElementById('cart-fidelizacion-amount').textContent = '-' + fidelizacionAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      fidelizacionEl.style.display = 'none';
    }
  }
  // Descuento estudiante/jubilado — el cliente lo marca él mismo (se
  // comprueba el carné al cobrar en caja, ver comentario junto a la
  // casilla en index.html).
  const studentDiscountRowEl = document.getElementById('student-discount-row');
  if (studentDiscountRowEl) studentDiscountRowEl.style.display = studentDiscountEnabledCfg ? 'block' : 'none';
  // El aviso de "se comprobará el carné" solo se despliega dentro de la
  // misma caja al marcar la casilla — compacto (una sola línea) mientras
  // nadie la usa, en vez de mostrarlo siempre para todo el mundo.
  const studentDiscountBoxEl = document.getElementById('student-discount-box');
  const studentDiscountWarnEl = document.getElementById('student-discount-warn');
  if (studentDiscountBoxEl) studentDiscountBoxEl.style.borderColor = studentDiscountChecked ? 'var(--amber)' : 'var(--warm)';
  if (studentDiscountWarnEl) studentDiscountWarnEl.style.display = studentDiscountChecked ? 'block' : 'none';
  const studentDiscountEl = document.getElementById('cart-student-discount-row');
  if (studentDiscountEl) {
    if (studentDiscountAmt > 0) {
      studentDiscountEl.style.display = 'flex';
      document.getElementById('cart-student-discount-label').textContent = '🪪 Estudiante/jubilado (-' + studentDiscountPctCfg + '%)';
      document.getElementById('cart-student-discount-amount').textContent = '-' + studentDiscountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      studentDiscountEl.style.display = 'none';
    }
  }
  const grandTotal = Math.max(0, total + (feeEnabled ? feeAmount : 0) + (fee2Enabled ? fee2Amount : 0) - discountAmt - fidelizacionAmt - studentDiscountAmt - ofertaTotalAmt);
  document.getElementById("cart-total").textContent = grandTotal.toFixed(2).replace('.', ',') + " €";
  // Etiqueta de ahorro total (código de descuento + fidelización juntos) —
  // la línea verde de cada uno ya existía, pero un badge aparte resalta
  // más el ahorro real que solo ver un número distinto en el total.
  const totalAhorro = discountAmt + fidelizacionAmt + studentDiscountAmt + ofertaTotalAmt;
  const savingsEl = document.getElementById('cart-savings-badge');
  if (savingsEl) {
    if (totalAhorro > 0) {
      savingsEl.style.display = 'block';
      document.getElementById('cart-savings-amount').textContent = '¡Ahorras ' + totalAhorro.toFixed(2).replace('.', ',') + ' €!';
    } else {
      savingsEl.style.display = 'none';
    }
  }

  // Only show total and form if orders are open
  // IMPORTANTE: renderSlotPicker() debe ejecutarse ANTES de _syncCartDrawer(),
  // porque _syncCartDrawer() (a través de _syncDrawerSlotPicker()) copia el
  // estado visible de #slot-picker-group al drawer móvil. Si se sincroniza
  // primero, el drawer copia el estado del render ANTERIOR (desactualizado),
  // provocando que "Hora de recogida" no aparezca en el drawer justo tras
  // el primer cambio de carrito (bug intermitente en móvil).
  if (getOrdersOpen()) {
    totalRowEl.style.display = "flex";
    formEl.style.display = "block";
    renderSlotPicker();
  } else {
    totalRowEl.style.display = "none";
    formEl.style.display = "none";
  }

  // Sync mobile FAB and drawer (debe ir DESPUÉS de renderSlotPicker)
  _updateCartFab(totalItems, grandTotal);
  _syncCartDrawer(cartHtml, grandTotal, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg, conflictoDescuentosNota, ofertaTotalAmt, ofertaTotalPct);

  // Repintar la tarjeta de sellos DESPUÉS de sincronizar el cajón móvil —
  // _syncCartDrawer() reconstruye todo el HTML del carrito (incluido el
  // campo de teléfono), lo que borra la tarjeta si se hubiera pintado antes
  // (se insertó con appendChild, fuera de esa plantilla). Repintarla aquí,
  // en cada renderCart(), hace que sobreviva a todos los repintados en vez
  // de desaparecer en el primero que llega después de mostrarse.
  if (typeof _pintarTarjetaSellos === 'function') {
    if (window._fidelizacionClienteCache && window._fidelizacionClienteCache.phone === _fidPhoneClean) {
      _pintarTarjetaSellos(_fidPhoneClean, window._fidelizacionClienteCache.cliente);
    } else {
      document.querySelectorAll('.tarjeta-sellos-cliente').forEach(e => e.remove());
    }
  }
}

// ── REPETIR ÚLTIMO PEDIDO ──
// dpf_ultimo_pedido lo guarda antifraude.js justo después de confirmar un
// pedido (a diferencia de dpf_active_order, este no caduca) — si existe y
// el carrito está vacío, se ofrece repetirlo con un toque en vez de
// obligar a repasar toda la carta otra vez.
function _bimbaTarjetaRepetirPedido() {
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return '';
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items) || !data.items.length) return '';
    const lineas = data.items.map(i => '<b>' + i.qty + '×</b> ' + i.name).join('<br>');
    return '<div class="repeat-card">' +
      '<div class="repeat-card__label">🔁 Pediste esto la última vez</div>' +
      '<div class="repeat-card__items">' + lineas + '</div>' +
      '<button type="button" class="repeat-card__btn" onclick="repetirUltimoPedido()">Repetir pedido — ' + (data.total || 0).toFixed(2).replace('.', ',') + ' €</button>' +
      '</div>';
  } catch (e) { return ''; }
}
function repetirUltimoPedido() {
  if (isShopBlocked()) { showClosedToast(); return; }
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return;
    const data = JSON.parse(raw);
    let algoOmitido = false;
    const disponible = id => {
      const item = MENU.find(m => m.id == id);
      return item && !item.hidden && !item.soldout;
    };
    Object.entries(data.cart || {}).forEach(([id, qty]) => {
      if (!disponible(id)) { algoOmitido = true; return; }
      cart[id] = (cart[id] || 0) + qty;
    });
    Object.entries(data.custCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      custCart[key] = c;
    });
    Object.entries(data.extrasCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      extrasCart[key] = c;
    });
    renderMenu();
    renderCart();
    showCopyToast(algoOmitido ? '⚠️ Algún producto ya no está disponible y se omitió' : '✅ Pedido anterior añadido al carrito');
  } catch (e) {}
}


// Orden fijo en el que deben salir las categorías en el ticket impreso —
// lo que no esté en esta lista (o no se encuentre en MENU) se queda al
// final, en el orden en que ya estaba.
const TICKET_CATEGORIA_ORDEN = ['Patatas', 'Boniato', 'Paninis', 'Cookies', 'Tartas', 'Bebidas'];
function _ticketCategoriaRank(itemName) {
  const item = MENU.find(m => m.name === itemName);
  const idx = item ? TICKET_CATEGORIA_ORDEN.indexOf(item.cat) : -1;
  return idx === -1 ? TICKET_CATEGORIA_ORDEN.length : idx;
}

// Fetch con límite de tiempo — sin esto, si el servidor va lento o la
// petición se queda "colgada" (no falla, simplemente nunca responde), el
// cliente podía quedarse esperando indefinidamente en pantallas como
// "Enviando pedido…" o "Verificando…" sin ningún mensaje ni forma de saber
// si va a llegar respuesta alguna vez. Se usa en las peticiones que el
// cliente ve/espera directamente (guardar pedido, SMS, fidelización).
function _fetchConTimeout(url, opciones, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms || 12000);
  return fetch(url, Object.assign({}, opciones, { signal: controller.signal }))
    .finally(() => clearTimeout(timeoutId));
}

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
  // Botón "repetir último pedido" (solo móvil): ocupa el mismo hueco que
  // el FAB del carrito cuando este está vacío — nunca se muestran los dos
  // a la vez porque uno solo aparece cuando el otro está oculto.
  const repeatFab = document.getElementById('repeat-order-fab');
  if (repeatFab) {
    let hayUltimoPedido = false;
    try { hayUltimoPedido = !!localStorage.getItem('dpf_ultimo_pedido'); } catch (e) {}
    repeatFab.classList.toggle('hidden', count !== 0 || successVisible || !hayUltimoPedido);
  }
}
function _syncCartDrawer(cartHtml, total, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg, conflictoDescuentosNota, ofertaTotalAmt, ofertaTotalPct) {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  const ordersOpen = getOrdersOpen();
  // Fuente de verdad de la casilla estudiante/jubilado: la del formulario
  // de escritorio, igual que el código local — así el drawer siempre
  // refleja el valor real aunque se marcara desde el otro formulario.
  const _estudianteCheckedDrawer = !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // El código local exime al gasto fijo etiquetado como "de gestión", sea
  // el 1º o el 2º — ver el comentario largo en carta.js/renderCart() para
  // el porqué (identificarlo por posición se rompía si se configuraban al
  // revés de lo esperado).
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  discountAmt = discountAmt || 0;
  fidelizacionAmt = fidelizacionAmt || 0;
  let html = cartHtml;
  if (feeEnabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(feeLabel, "</span><span>").concat(feeAmount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (fee2Enabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(fee2Label, "</span><span>").concat(fee2Amount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  // Enlace para meter el c\u00F3digo de "pedido desde el local" \u2014 se lee el valor
  // actual del campo (si ya exist\u00EDa) para no borrarlo en cada repintado.
  if (getFeeEnabled() && (typeof getLocalFeeCode === 'function') && getLocalFeeCode()) {
    // Se lee del campo de escritorio (fuente de verdad para _modoLocalActivo,
    // incluso cuando el código llega por la URL del QR, no solo al escribirlo
    // aquí en el drawer) para que el móvil siempre refleje el valor real.
    const _codigoLocalActual = (document.getElementById('local-fee-code-input') || {}).value || '';
    const _cajaAbierta = !!_codigoLocalActual || (document.getElementById('drawer-local-fee-code-box') && document.getElementById('drawer-local-fee-code-box').style.display !== 'none');
    html += "<div style=\"padding:4px 0 8px\">"
      + "<a href=\"#\" onclick=\"event.preventDefault();var b=document.getElementById('drawer-local-fee-code-box');b.style.display=b.style.display==='none'?'flex':'none';\" style=\"font-size:11.5px;color:#8A6A4E;text-decoration:underline\">\u00BFEst\u00E1s pidiendo desde el local?</a>"
      + "<div id=\"drawer-local-fee-code-box\" style=\"display:".concat(_cajaAbierta ? 'flex' : 'none', ";gap:6px;margin-top:6px;align-items:center\">")
      + "<input id=\"drawer-local-fee-code-input\" type=\"text\" maxlength=\"8\" placeholder=\"C\u00F3digo\" value=\"".concat(escapeHtml(_codigoLocalActual), "\" oninput=\"this.value=this.value.toUpperCase();document.getElementById('local-fee-code-input').value=this.value;comprobarCodigoLocal()\" style=\"flex:1;padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-transform:uppercase;outline:none\">")
      + "</div><div id=\"drawer-local-fee-code-feedback\" style=\"font-size:11.5px;margin-top:4px\"></div>"
      + "</div>";
  }
  // L\u00EDnea de descuento \u2014 mismo dato que ya calcul\u00F3 renderCart() para el
  // panel de escritorio (#cart-discount-row), para que el drawer m\u00F3vil
  // tambi\u00E9n deje claro por qu\u00E9 el total baj\u00F3 (c\u00F3digo manual o premio
  // ganado en la ruleta/rasca).
  if (discountAmt > 0 && discountCode) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>".concat('Descuento (' + discountCode + ')', "</span><span>-").concat(discountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (conflictoDescuentosNota) {
    html += "<div style=\"font-size:11px;color:#8A6A4E;font-style:italic;padding:2px 0 4px\">".concat(escapeHtml(conflictoDescuentosNota), "</div>");
  }
  if (fidelizacionAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83C\uDF81 Patata gratis (fidelizaci\u00F3n)</span><span>-".concat(fidelizacionAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  studentDiscountAmt = studentDiscountAmt || 0;
  if (studentDiscountAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83E\uDEAA Estudiante/jubilado (-".concat(studentDiscountPctCfg, "%)</span><span>-").concat(studentDiscountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  ofertaTotalAmt = ofertaTotalAmt || 0;
  if (ofertaTotalAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\u26A1 Oferta rel\u00E1mpago (-".concat(ofertaTotalPct, "%)</span><span>-").concat(ofertaTotalAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  const _ahorroDrawer = discountAmt + fidelizacionAmt + studentDiscountAmt + ofertaTotalAmt;
  if (_ahorroDrawer > 0) {
    html += "<div style=\"margin:2px 0 4px\"><span class=\"cart-savings-pill\">\uD83C\uDF89 \u00A1Ahorras ".concat(_ahorroDrawer.toFixed(2).replace('.', ','), " \u20AC!</span></div>");
  }
  html += "<div class=\"cart-total\" style=\"display:flex;margin-top:12px\"><span>Total</span><span>".concat(total.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  if (ordersOpen) {
    // Si ya sabemos (en memoria) que hay premio activo para el teléfono actual,
    // lo incluimos directamente en el HTML generado para que sobreviva a
    // cualquier repintado del drawer (renderCart se llama muy a menudo: cada
    // minuto, al volver de segundo plano, al cambiar el carrito, etc.)
    // Igual que ya se hacía con el teléfono: leer el valor actual del campo
    // del nombre ANTES de reconstruir el drawer, para que sobreviva al
    // repintado (si no, cualquier actualización de fondo mientras el
    // cliente estaba escribiendo su nombre lo dejaba vacío sin que se
    // notara, y al confirmar el pedido se borraba y saltaba "escribe tu
    // nombre" aunque ya lo hubiera escrito).
    // Si el campo del cajón todavía no existe/está vacío (primer pintado),
    // se cae al valor del formulario de escritorio — así, si se rellenó
    // solo con el nombre/teléfono guardados de una visita anterior (ver
    // init.js), el cajón móvil también sale ya relleno en vez de vacío.
    const _nombreActualDrawer = (document.getElementById('drawer-customer-name') || {}).value || (document.getElementById('customer-name') || {}).value || '';
    const _telActualDrawer = (document.getElementById('drawer-customer-phone') || {}).value || (document.getElementById('customer-phone') || {}).value || '';
    // Mismo motivo que nombre/teléfono arriba — sin esto, la nota escrita
    // se perdía en silencio en cuanto el carrito se volvía a pintar (p.ej.
    // al añadir otro producto o cambiar una cantidad DESPUÉS de escribirla):
    // este textarea se reconstruye entero cada vez, y al no rellenarlo con
    // lo ya escrito, salía vacío otra vez aunque el cliente no lo notara y
    // confirmara el pedido creyendo que la nota seguía puesta.
    const _notasActualDrawer = (document.getElementById('drawer-customer-notes') || {}).value || (document.getElementById('customer-notes') || {}).value || '';
    const _digitsActualDrawer = _telActualDrawer.replace(/\D/g, '').slice(0, 9);
    const _premioHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div id=\"fidelizacion-premio-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF81 \xA1Tienes una patata gratis disponible! A\xF1ade cualquier patata del men\xFA y se aplicar\xE1 el descuento autom\xE1ticamente al confirmar.</div>"
      : (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === _digitsActualDrawer
        ? "<div id=\"fidelizacion-proximo-sello-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF89 \xA1Este es tu pedido n\xFAmero 10! Al confirmarlo, tu patata gratis estar\xE1 disponible en tu pr\xF3ximo pedido.</div>"
        : '');
    const _studentDiscountHtmlDrawer = studentDiscountEnabledCfg
      ? "<div style=\"margin-top:14px\"><div id=\"drawer-student-discount-box\" style=\"background:#fff;border:1.5px solid ".concat(_estudianteCheckedDrawer ? '#E8943A' : '#F5E6C8', ";border-radius:12px;padding:11px 14px\"><label style=\"display:flex;align-items:center;gap:10px;cursor:pointer\"><input type=\"checkbox\" id=\"drawer-student-discount-checkbox\" ").concat(_estudianteCheckedDrawer ? 'checked' : '', " onchange=\"document.getElementById('student-discount-checkbox').checked=this.checked;renderCart()\" style=\"width:18px;height:18px;flex-shrink:0;accent-color:#3D1F0D\"><span style=\"font-size:13px;color:#3D1F0D;font-weight:600\">\uD83E\uDEAA Soy estudiante o jubilado</span></label><div style=\"display:").concat(_estudianteCheckedDrawer ? 'block' : 'none', ";font-size:12px;color:#8A6A4E;line-height:1.45;margin-top:8px;padding-left:28px\">\u26A0\uFE0F Se pedir\xE1 el carn\xE9 en el mostrador.<br><b style=\"color:#C2711A\">Si no se presenta, el descuento no se aplicar\xE1</b> y se cobrar\xE1 el precio normal.</div></div></div>")
      : '';
    const _recordatorioConfirmarHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div style=\"border-radius:10px;padding:8px 12px;background:#FFF3CD;border:1.5px solid #D9A441;margin-top:14px;margin-bottom:-6px;font-size:11.5px;font-weight:700;color:#5a3e1b\">\uD83C\uDF81 No olvides tu patata gratis antes de confirmar</div>"
      : '';
    html += "\n    <div style=\"margin-top:16px\">\n      <div class=\"form-group\">\n        <label>Tu nombre y apellido *</label>\n        <input type=\"text\" id=\"drawer-customer-name\" placeholder=\"\" maxlength=\"60\" autocomplete=\"name\" value=\"".concat(_nombreActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"document.getElementById('customer-name').value=this.value\">\n      </div>\n      <div class=\"form-group\">\n        <label>Tel\xE9fono</label>\n        <input type=\"tel\" id=\"drawer-customer-phone\" placeholder=\"\" maxlength=\"11\" autocomplete=\"tel\" inputmode=\"tel\" value=\"").concat(_telActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"formatPhone(this);document.getElementById('customer-phone').value=this.value\">\n        <div id=\"drawer-customer-phone-feedback\" style=\"font-size:11.5px;margin-top:4px;display:none\"></div>\n        ").concat(_premioHtml, "\n        <div style=\"background:#fff;border:1px solid rgba(61,31,13,.10);border-radius:12px;padding:11px 13px 11px 44px;position:relative;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-top:8px\">\n          <div style=\"position:absolute;left:11px;top:11px;width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:#F5E6C8\">\uD83D\uDCF1</div>\n          <p style=\"font-size:12px;font-weight:700;color:#3D1F0D;margin:0\">Se verificar\xE1 tu n\xFAmero por SMS</p>\n          <p style=\"font-size:11.5px;color:#8A6A4E;margin:2px 0 0\">Solo para confirmar el pedido</p>\n          <p style=\"font-size:11.5px;color:#8A6A4E;margin:1px 0 0\">\uD83D\uDD12 No lo compartimos con nadie</p>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <label>Notas del pedido</label>\n        <textarea id=\"drawer-customer-notes\" placeholder=\"\" maxlength=\"300\" oninput=\"document.getElementById('customer-notes').value=this.value;_actualizarContadorNotas('drawer-customer-notes','drawer-notes-char-count')\">").concat(escapeHtml(_notasActualDrawer), "</textarea>\n        <div id=\"drawer-notes-char-count\" style=\"text-align:right;font-size:11px;color:#8A6A4E;margin-top:2px\">300 caracteres restantes</div>\n      </div>\n      <div id=\"drawer-slot-picker-group\" style=\"display:none;margin-top:14px\">\n        <label style=\"display:block;font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px\">\uD83D\uDD50 Hora de recogida *</label>\n        <p style=\"font-size:12px;color:#8A6A4E;margin-bottom:10px\">Los pedidos se preparan por turnos. Elige tu hora de recogida:</p>\n        <div id=\"drawer-slot-grid\" style=\"display:grid;grid-template-columns:1fr 1fr\"></div>\n        <div id=\"drawer-slot-error\" style=\"display:none;font-size:12px;color:#c0392b;margin-top:6px;font-weight:600\">\u26A0\uFE0F Por favor elige una hora de recogida</div>\n      </div>\n      ").concat(_studentDiscountHtmlDrawer, "\n      ").concat(_recordatorioConfirmarHtml, "\n      <button class=\"submit-btn\" onclick=\"submitOrderFromDrawer()\" style=\"margin-top:8px\">\n        Confirmar pedido \u2192\n      </button>\n    </div>");
  } else {
    const lockedMsg = document.getElementById('cart-locked-detail');
    html += "\n    <div style=\"margin-top:16px;background:#3D1F0D;border-radius:12px;padding:20px 16px;text-align:center\">\n      <div style=\"font-size:32px;margin-bottom:8px\">\uD83D\uDD12</div>\n      <div style=\"font-family:'Playfair Display',serif;font-size:17px;font-weight:900;color:#FFF8EE;margin-bottom:6px\">Pedidos cerrados</div>\n      <div style=\"font-size:13px;color:rgba(255,248,238,0.7);line-height:1.5\">".concat(lockedMsg ? lockedMsg.textContent : '', "</div>\n    </div>");
  }
  // El campo de código local (drawer-local-fee-code-input) llama a
  // comprobarCodigoLocal() en cada tecla para actualizar el desglose de
  // gastos al momento — pero como innerHTML sustituye TODO el cuerpo del
  // drawer de golpe, el input con el foco se destruye y se crea uno nuevo
  // en su lugar, así que el teclado del móvil se cerraba a cada dígito.
  // Se guarda qué campo tenía el foco (y la posición del cursor) para
  // devolvérselo al nuevo input justo después de repintar.
  const _focoPrevioEl = document.activeElement;
  const _focoPrevioId = (_focoPrevioEl && drawerBody.contains(_focoPrevioEl)) ? _focoPrevioEl.id : null;
  const _focoPrevioSelStart = (_focoPrevioId && typeof _focoPrevioEl.selectionStart === 'number') ? _focoPrevioEl.selectionStart : null;
  const _focoPrevioSelEnd = (_focoPrevioId && typeof _focoPrevioEl.selectionEnd === 'number') ? _focoPrevioEl.selectionEnd : null;

  drawerBody.innerHTML = html;

  if (_focoPrevioId) {
    const _nuevoFoco = document.getElementById(_focoPrevioId);
    if (_nuevoFoco) {
      _nuevoFoco.focus();
      if (_focoPrevioSelStart !== null && typeof _nuevoFoco.setSelectionRange === 'function') {
        try { _nuevoFoco.setSelectionRange(_focoPrevioSelStart, _focoPrevioSelEnd); } catch (e) {}
      }
    }
  }

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
  // No cerramos el drawer aquí: si falta un dato, _alertaConFoco necesita
  // que siga abierto para resaltar el campo correcto (drawer-customer-*).
  // Se cierra solo al confirmar con éxito, desde showSuccess().
  submitOrder();
}
function removeItem(id) {
  delete cart[id];
  renderMenu();
  renderCart();
}

// Quita del carrito cualquier producto que ya no exista en MENU (borrado o
// con el id cambiado desde el panel de admin mientras el cliente lo tenía
// añadido) — devuelve cuántos se han quitado, para que submitOrder() pueda
// avisar en vez de enviarlos igualmente.
function _limpiarItemsCarritoInvalidos() {
  let quitados = 0;
  Object.keys(cart).forEach(id => {
    if (!MENU.find(m => m.id == id)) { delete cart[id]; quitados++; }
  });
  Object.keys(custCart).forEach(key => {
    const c = custCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete custCart[key]; quitados++; }
  });
  Object.keys(extrasCart).forEach(key => {
    const c = extrasCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete extrasCart[key]; quitados++; }
  });
  return quitados;
}

// ── Recuperar un pedido que se quedó a medio enviar ──────────────────────
// Si el cliente cierra la pestaña, pierde la conexión o el navegador se
// bloquea justo después de confirmar (antes de que llegara la respuesta de
// guardar-pedido.php), el pedido podía perderse sin más rastro que un
// aviso interno. Ahora, al volver a abrir la web, se comprueba si quedó
// un pedido a medias y se reenvía solo — es seguro reenviarlo aunque el
// primer intento sí hubiera llegado a guardarse, porque el servidor
// responde éxito (no error) si el ticket ya existe con el mismo teléfono.
async function _recuperarPedidoEnCurso() {
  let raw;
  try { raw = localStorage.getItem('dpf_pedido_en_curso'); } catch (e) { return; }
  if (!raw) return;
  let marcador;
  try { marcador = JSON.parse(raw); } catch (e) { try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e2) {} return; }
  // Margen de seguridad: pasadas 2 horas ya no tiene sentido reintentar
  // (el cliente hace tiempo que se fue) — se descarta para no reenviar
  // pedidos viejísimos que ya nadie espera.
  if (!marcador || !marcador.payload || !marcador.ts || (Date.now() - marcador.ts) > 2 * 60 * 60 * 1000) {
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    return;
  }
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marcador.payload)
    }, 10000);
    const data = await res.json();
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    if (data.success) {
      console.log('[recuperación] Pedido ' + marcador.orderNum + ' recuperado tras un cierre inesperado');
      _ocultarAvisoFalloGuardado(marcador.orderNum);
    } else {
      console.warn('[recuperación] Pedido ' + marcador.orderNum + ' rechazado al reintentar:', data.error);
    }
  } catch (e) {
    // Sigue sin red — se deja el marcador para reintentar la próxima vez
    // que se abra la web (o en cuanto vuelva la conexión, ver más abajo).
    console.warn('[recuperación] sin conexión, se reintentará más tarde', e);
  }
}
// Si el pedido no se pudo guardar por falta de conexión (no porque se
// cerrara la pestaña) y el cliente se queda esperando en la misma pantalla
// de éxito, antes había que recargar la página para que se reintentara
// solo. Ahora se reintenta en cuanto el navegador detecta que ha vuelto la
// conexión — y también cada 20s por si acaso, porque en redes con
// cobertura intermitente a veces no llega a dispararse el evento 'online'
// (el navegador nunca se considera del todo "offline", solo dan timeout
// las peticiones una a una).
window.addEventListener('online', () => { _recuperarPedidoEnCurso(); });
setInterval(() => {
  let hayPendiente;
  try { hayPendiente = !!localStorage.getItem('dpf_pedido_en_curso'); } catch (e) { return; }
  if (hayPendiente) _recuperarPedidoEnCurso();
}, 20000);
// Complementa a _avisarClienteFalloGuardado (que muestra el aviso) — al
// recuperarse solo el pedido, si el cliente sigue viendo la pantalla de
// éxito de ESE mismo pedido, se le quita el aviso de que algo falló.
function _ocultarAvisoFalloGuardado(orderNum) {
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  const mismoNum = document.getElementById('order-num-display')?.textContent === String(orderNum);
  if (!successVisible || !mismoNum) return;
  const warning = document.getElementById('success-save-warning');
  if (warning) warning.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => { setTimeout(_recuperarPedidoEnCurso, 1500); });


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

// Genera número de pedido reservándolo en el servidor (guardar-pedido.php,
// cuenta de servicio) para evitar colisiones entre pedidos simultáneos.
// Antes el propio navegador escribía directo en usedOrderNums/ vía la SDK
// de Firebase, lo que exigía dejar esa escritura abierta a cualquier
// visitante anónimo en las reglas — cualquiera podía rellenar
// usedOrderNums/<fecha>/ sin llegar a pedir nada.
// Fallback a aleatorio solo si el servidor no responde.
async function generateOrderNumber() {
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarNumeroPedido' })
    }, 8000);
    const data = await res.json();
    if (data.success && data.orderNum) return data.orderNum;
    console.warn('[orderNum] reserva en servidor falló:', data.error);
  } catch (e) {
    console.warn('[orderNum] fetch error:', e);
  }
  return 'T' + (Math.floor(Math.random() * 9000) + 1000);
}
function buildTicketText(orderNum, name, phone, notes, slotTime, orderTotal, feeAmount, discountAmt, discountCode, fidelizacionDescuento, ofertaTotalAmt, ofertaTotalPct) {
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
    return "".concat(qty, "x ").concat(item.name, " \u2014 ").concat((_precioConOferta(item) * qty).toFixed(2), " \u20AC");
  });
  const custLines = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('buildTicketText: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const details = [...c.sauces.map(s => 'Extra salsa ' + s), ...c.ingredients.map(i => 'Extra ' + i)].join(', ');
    const extrasStr = [c.extraQueso ? 'Extra Queso' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(' + ');
    return c.qty + 'x ' + item.name + ' [' + details + (extrasStr ? ' + ' + extrasStr : '') + '] — ' + (unitPrice * c.qty).toFixed(2) + ' €';
  });
  const extLines2 = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return "".concat(c.qty, "x ").concat(getExtrasItemLabel(c), " \u2014 ").concat((getExtrasItemPrice(c) * c.qty).toFixed(2), " \u20AC");
  });
  const allLines = [...lines, ...custLines, ...extLines2];
  // El total final se recibe ya calculado desde submitOrder() (orderTotal)
  // en vez de recalcularse aqu\u00ED desde cero \u2014 antes este texto sumaba solo
  // los productos, sin aplicar gastos de gesti\u00F3n, c\u00F3digo de descuento ni
  // premio de fidelizaci\u00F3n, as\u00ED que el "TOTAL:" del ticket enviado por
  // email pod\u00EDa no coincidir con lo que de verdad se cobra.
  const itemsSubtotal = Object.entries(cart).reduce((s, _ref7) => {
    let _ref8 = _slicedToArray(_ref7, 2),
      id = _ref8[0],
      q = _ref8[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? _precioConOferta(it) * q : 0);
  }, 0) + Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it) return s;
    const up = it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + up * c.qty;
  }, 0) + Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const total = typeof orderTotal === 'number' ? orderTotal : itemsSubtotal;
  const extraLineas = [];
  if (feeAmount > 0) extraLineas.push('Gastos de gesti\u00F3n: +' + feeAmount.toFixed(2) + ' \u20AC');
  if (discountAmt > 0) extraLineas.push('Descuento' + (discountCode ? ' (' + discountCode + ')' : '') + ': -' + discountAmt.toFixed(2) + ' \u20AC');
  if (ofertaTotalAmt > 0) extraLineas.push('Oferta rel\u00E1mpago (-' + ofertaTotalPct + '%): -' + ofertaTotalAmt.toFixed(2) + ' \u20AC');
  if (fidelizacionDescuento > 0) extraLineas.push('Patata gratis (fidelizaci\u00F3n): -' + fidelizacionDescuento.toFixed(2) + ' \u20AC');
  const extraLineasTxt = extraLineas.length ? extraLineas.join('\n') + '\n' : '';
  const now = new Date().toLocaleString('es-ES');
  const phoneCleanTxt = (phone || '').replace(/\D/g, '');
  const avisoSelloTxt = (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneCleanTxt)
    ? "\n>>> 10\u00BA SELLO COMPLETADO. Avisar: premio disponible pr\u00F3ximo pedido <<<\n"
    : "";
  return "\n============================\n   ".concat(tc.nombre, "\n============================\nPEDIDO: ").concat(orderNum, "\nFecha: ").concat(now, "\n----------------------------\nCLIENTE: ").concat(name, "\n").concat(phone ? "Tel: " + phone : "", "\n----------------------------\nPRODUCTOS:\n").concat(allLines.join('\n'), "\n----------------------------\n").concat(extraLineasTxt, "TOTAL: ").concat(total.toFixed(2), " \u20AC\n  (").concat(tc.textoPago, ")\n----------------------------\n").concat(slotTime ? "RECOGIDA PATATA: " + slotTime + "h" : "", "\n").concat(notes ? "NOTAS: " + notes : "Sin notas", "\n").concat(avisoSelloTxt, "============================\n  ").trim();
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
  // Reservar en el servidor (guardar-pedido.php, cuenta de servicio) — antes
  // se escribía directo en Firebase (fb_incrementSlot), lo que exigía dejar
  // slots/ abierto a escritura anónima en las reglas.
  try {
    const resp = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarSlot', slotTime })
    }, 8000);
    // Antes solo se comprobaba que la petición no lanzara una excepción de
    // red — si el servidor respondía 200 con {"success":false} (turno
    // lleno, fallo al escribir tras los reintentos...) no se detectaba, y
    // el incremento optimista de arriba se quedaba puesto para siempre en
    // este dispositivo aunque la reserva real nunca hubiera cuajado en
    // Firebase, mostrando el turno más ocupado de lo que está de verdad.
    const data = await resp.json().catch(() => null);
    if (!data || !data.success) {
      _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
      saveSlotsData(getSlotsData());
      console.warn('Slot reserve rejected by server', data && data.error);
    }
  } catch (e) {
    // Fallo de red/timeout: deshacer el incremento optimista en vez de
    // dejarlo inflado — no sabemos si la reserva llegó a cuajar en el
    // servidor, pero es más seguro infravalorar la ocupación local (el
    // máximo con los pedidos reales en getSlotsData() sigue protegiendo de
    // mostrar menos ocupación de la real) que sobrevalorarla para siempre.
    _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
    saveSlotsData(getSlotsData());
    console.warn('Slot reserve error', e);
  }
}
async function decrementSlot(slotTime) {
  if (!slotTime) return;
  // Solo actualiza la caché local (_slotsCache/localStorage) para que este
  // mismo dispositivo vea el turno libre al instante. La liberación real en
  // Firebase la hace el servidor (guardar-pedido.php, acción
  // "cancelarPedido") con la cuenta de servicio — el navegador nunca tuvo
  // permiso de escritura directa sobre slots/ (por eso ya no existe
  // fb_decrementSlot: se quitó junto con fb_incrementSlot al mover la
  // reserva de turnos al servidor, ver incrementSlot() arriba).
  _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
  saveSlotsData(getSlotsData());
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
  // Con el código local activo (cliente en tienda, llegó por el QR del
  // mostrador) el pedido se prepara para ahora mismo — no tiene sentido
  // hacerle elegir un turno futuro, así que se salta el selector entero.
  const enTienda = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const needsSlot = cartHasAnyItem() && isSlotHour() && !enTienda;
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
  // Aviso de saturación moderada activo: empuja la selección hacia turnos
  // más tarde (en vez de amontonar todo en el más próximo) tratando como
  // "saturados" los que caen dentro de los próximos X minutos — pero solo
  // si queda al menos un turno libre más allá de ese margen, para no dejar
  // a nadie sin ningún turno donde poder elegir.
  const _nowMinsGlobal = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
  const _avisoCfg = (typeof getAvisoSaturacionConfig === 'function') ? getAvisoSaturacionConfig() : null;
  let _saturacionSlotsActiva = !!(window._saturacionAvisoActiva && _avisoCfg && _avisoCfg.minutosSalto > 0);
  if (_saturacionSlotsActiva) {
    const hayTurnoLibreTrasSalto = slots.some(slot => {
      const m = slot.split(':').map(Number);
      const slotMins = m[0] * 60 + m[1];
      if (slotMins - _nowMinsGlobal < _avisoCfg.minutosSalto) return false;
      return !slotIsPast(slot) && (slotsData.slots[slot] || 0) < slotMax;
    });
    if (!hayTurnoLibreTrasSalto) _saturacionSlotsActiva = false;
  }
  slots.forEach(slot => {
    const count = slotsData.slots[slot] || 0;
    const extra = extraPlazas[slot] || 0;
    const effectiveMax = slotMax + extra;
    const full = count >= effectiveMax;
    const almostFull = !full && count === effectiveMax - 1;
    const past = slotIsPast(slot);
    const nowMs = new Date();
    const nowMinsSlot = nowMs.getHours() * 60 + nowMs.getMinutes();
    const _slot$split$map = slot.split(':').map(Number),
      _slot$split$map2 = _slicedToArray(_slot$split$map, 2),
      slotH = _slot$split$map2[0],
      slotM = _slot$split$map2[1];
    const slotTotalMins = slotH * 60 + slotM;
    const saturado = !full && !past && _saturacionSlotsActiva && (slotTotalMins - nowMinsSlot) < _avisoCfg.minutosSalto;
    const disabled = full || past || saturado;
    const pct = Math.min(100, Math.round(count / effectiveMax * 100));
    const color = full ? '#e74c3c' : almostFull ? '#e74c3c' : pct >= 50 ? '#3D1F0D' : '#5ECC76';
    const libres = effectiveMax - count;
    const availableLabel = full ? '❌ Completo' : past ? 'Pasado' : saturado ? '⏳ Elige más tarde' : almostFull ? '⚠️ ¡Solo queda 1!' : libres + ' libre' + (libres !== 1 ? 's' : '') + (extra > 0 ? ' (+' + extra + ')' : '');
    const isLateSlot = !disabled && slotTotalMins - nowMinsSlot <= 5;
    const btnBg = disabled ? 'background:#f5f5f5;border-color:#ccc;' : isLateSlot ? 'background:#fffbe6;border-color:#f0c040;' : full ? 'background:#fff0f0;border-color:#e74c3c;' : pct >= 75 ? 'background:rgba(244,196,48,0.08);border-color:#3D1F0D;' : 'background:#FFF8EE;border-color:#E8D5B0;';
    html += '<button type="button"' + ' class="slot-btn ' + (disabled ? 'slot-disabled' : '') + '"' + ' id="slotbtn-' + slot.replace(':', '-') + '"' + ' onclick="' + (disabled ? '' : 'selectSlot(\'' + slot + '\')') + '"' + (disabled ? ' disabled' : '') + ' style="' + btnBg + '"' + ' title="' + (full ? 'Turno completo' : past ? 'Hora pasada' : saturado ? 'Hay bastante ambiente ahora mismo, elige un turno más tarde' : count + '/' + slotMax + ' plazas') + '">' + '<span style="font-size:17px;font-weight:900">' + slot + '</span>' + (isLateSlot ? '<span style="font-size:10px;font-weight:700;color:#b45a00">⚠️ cierre del turno</span>' : '') + '<span style="font-size:13px;color:' + (disabled ? '#aaa' : color) + ';font-weight:600">' + availableLabel + '</span>' + (almostFull ? '<span style="font-size:10px;color:#c0392b;font-weight:700;margin-top:2px">¡Solo queda 1 pedido disponible en esta franja!</span>' : '') + '<div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">' + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:99px;transition:width .3s"></div></div>' + '</button>';
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

// Precio a descontar por el premio de fidelización activo (patata gratis) —
// la patata más cara del carrito, en beneficio del cliente. Compartida entre
// el total mostrado mientras se compra (renderCart(), en carta.js) y el del
// pedido final (submitOrder(), aquí abajo) para que nunca puedan mostrar
// cifras distintas — antes solo se calculaba aquí, así que el total del
// carrito no bajaba hasta confirmar el pedido, igual que pasaba con los
// códigos de descuento manuales antes de arreglarlo.
function getFidelizacionDescuento(phoneClean) {
  if (!window._fidelizacionPremioActivo || window._fidelizacionPremioActivo !== phoneClean) return 0;
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
  return todosLosPrecios.length ? Math.max(...todosLosPrecios) : 0;
}
// Guarda contra doble envío — antes el botón "Confirmar pedido" no se
// deshabilitaba hasta después de varias llamadas de red seguidas (lista
// negra, cooldown, turnos, número de pedido), así que un doble-toque en
// una conexión lenta podía lanzar dos submitOrder() a la vez: dos números
// de pedido reservados, dos emails de confirmación, y _pendingOrderData/
// _pendingTicketData del segundo pisando los del primero en mitad del
// proceso, todo para lo que el cliente vivió como un único clic.
let _submitOrderEnCurso = false;
async function submitOrder() {
  if (_submitOrderEnCurso) return;
  _submitOrderEnCurso = true;
  try {
    await _submitOrderInner();
  } finally {
    _submitOrderEnCurso = false;
  }
}
async function _submitOrderInner() {
  // Gate de config crítica (gastos de gestión, bolsa, código local) — ver
  // comentario junto a esperarConfigCriticaLista() en admin-config.js. En
  // el caso normal esta espera ya está resuelta y esto no tarda nada; solo
  // se nota (y se avisa en el botón) en una visita nueva/muy rápida.
  if (typeof esperarConfigCriticaLista === 'function' && !(window._feeConfigListo && window._fee2ConfigListo && window._localCodeListo && window._studentDiscountConfigListo)) {
    const btnGate = document.getElementById('submit-btn');
    const prevGateText = btnGate ? btnGate.textContent : null;
    const prevGateDisabled = btnGate ? btnGate.disabled : false;
    if (btnGate) { btnGate.disabled = true; btnGate.textContent = 'Comprobando datos…'; }
    await esperarConfigCriticaLista(4000);
    if (btnGate && prevGateText !== null) { btnGate.disabled = prevGateDisabled; btnGate.textContent = prevGateText; }
  }
  // Si el admin borra o renombra un producto justo mientras un cliente lo
  // tiene en el carrito, antes se descartaba en silencio al enviar el
  // pedido (solo quedaba un console.error) — el cliente no se enteraba de
  // que su pedido había cambiado hasta recogerlo. Ahora se detecta antes
  // de seguir, se quita del carrito y se avisa claramente, dejando el
  // carrito abierto para que pueda revisar/completar el pedido en vez de
  // confirmarlo tal cual con algo menos sin saberlo.
  if (typeof _limpiarItemsCarritoInvalidos === 'function') {
    const _quitados = _limpiarItemsCarritoInvalidos();
    if (_quitados > 0) {
      renderMenu();
      renderCart();
      showAlert('Uno de los productos de tu pedido ya no está disponible y se ha quitado del carrito. Revisa tu pedido antes de confirmar.');
      if (typeof openCartDrawer === 'function') openCartDrawer();
      return;
    }
  }
  // Igual que ya hace changeQty() al añadir al carrito — antes esta función
  // nunca comprobaba el horario/vacaciones/pausa al confirmar, así que si
  // el formulario ya estaba abierto cuando la tienda cerraba, el pedido se
  // enviaba igual (el servidor ahora también lo rechaza, esto es solo para
  // avisar al momento sin esperar la respuesta).
  if (isShopBlocked()) {
    showClosedToast();
    return;
  }
  const name = document.getElementById("customer-name").value.trim();
  if (!name) {
    _alertaConFoco("Por favor escribe tu nombre", "customer-name");
    return;
  }
  if (name.length > 60) {
    _alertaConFoco("El nombre es demasiado largo (máximo 60 caracteres)", "customer-name");
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
    _alertaConFoco("Por favor escribe tu teléfono", "customer-phone");
    return;
  }
  if (!/^\d{9}$/.test(phoneClean)) {
    _alertaConFoco("El teléfono debe tener exactamente 9 dígitos", "customer-phone");
    return;
  }
  // Prefijo válido español: móviles 6/7, fijos 8/9 — excluye 800/900/901/902 y similares
  if (!/^[6789]/.test(phoneClean)) {
    _alertaConFoco("El teléfono no parece válido. Debe empezar por 6, 7, 8 o 9", "customer-phone");
    return;
  }
  // Excluir numeración especial: 800, 900, 901, 902, 803, 806, 807
  if (/^(800|900|901|902|803|806|807)/.test(phoneClean)) {
    _alertaConFoco("No se admiten números de tarificación especial", "customer-phone");
    return;
  }
  // Detectar números absurdos: todos iguales, secuencias obvias
  const _absurdos = ['000000000', '111111111', '222222222', '333333333', '444444444', '555555555', '666666666', '777777777', '888888888', '999999999', '123456789', '987654321', '600000000', '700000000', '612345678'];
  if (_absurdos.includes(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }
  // Detectar repetición: 7+ dígitos iguales consecutivos (ej. 611111111, 699999999)
  if (/(\d)\1{6,}/.test(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }

  // ── Honeypot anti-bots: si el campo oculto está relleno, es un bot
  const hp = document.getElementById('hp-website');
  if (hp && hp.value.trim()) {
    // `btn` (más abajo, para el resto de la función) todavía no existe en
    // este punto — usarlo aquí lanzaba un ReferenceError ("Cannot access
    // 'btn' before initialization") por ser un `const` del mismo scope
    // referenciado antes de su declaración, así que se busca el elemento
    // aparte en vez de depender de esa variable.
    const hpBtn = document.getElementById('submit-btn');
    if (hpBtn) {
      hpBtn.disabled = true;
      hpBtn.textContent = 'Enviando pedido…';
      setTimeout(() => {
        hpBtn.disabled = false;
        hpBtn.textContent = 'Confirmar pedido';
      }, 2000);
    }
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

  // Validar slot si aplica — igual que en renderSlotPicker(), un pedido con
  // el código local activo (cliente en tienda) no necesita turno.
  const _enTiendaSubmit = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const needsSlot = cartHasAnyItem() && isSlotHour() && !_enTiendaSubmit;
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
    _alertaConFoco("La nota del pedido es demasiado larga (máximo 300 caracteres)", "customer-notes");
    return;
  }
  const orderNum = await generateOrderNumber();
  // Si hay un tiempo de espera configurado para los pedidos "desde el
  // local" (panel > Configuración impresora), aquí se reparte la hora que
  // saldrá en el ticket para este pedido, en vez de "ahora mismo" — ver
  // _asignarHoraTiendaQR() en admin-config.js. Se hace aquí (con el número
  // de pedido ya reservado) y no antes, para no gastar un hueco de la cola
  // si el pedido se corta por una validación anterior.
  const _horaTiendaAsignadaSubmit = _enTiendaSubmit && typeof _asignarHoraTiendaQR === 'function'
    ? await _asignarHoraTiendaQR()
    : null;
  const regularTotal = Object.entries(cart).reduce((s, _ref9) => {
    let _ref0 = _slicedToArray(_ref9, 2),
      id = _ref0[0],
      q = _ref0[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? _precioConOferta(it) * q : 0);
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
  const _sinGastosPorCodigoLocalSubmit = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // Ver comentario largo en carta.js/renderCart(): el código local exime
  // al gasto etiquetado como "de gestión", sea el 1º o el 2º.
  const _fee1EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestionSubmit = !_fee1EsGestionSubmit && !_fee2EsGestionSubmit;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocalSubmit && (_fee1EsGestionSubmit || _ningunaEsGestionSubmit));
  const feeAmount = feeEnabled ? getFeeAmount() : 0;
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocalSubmit && _fee2EsGestionSubmit);
  const fee2Amount = fee2Enabled && typeof getFee2Amount === 'function' ? getFee2Amount() : 0;
  // _comprobarPremioFidelizacion() se dispara sola en segundo plano al
  // terminar de escribir el teléfono (con un pequeño margen + una llamada
  // al servidor) — si el cliente confirma el pedido muy rápido justo
  // después, esa comprobación puede no haber terminado todavía, y
  // getFidelizacionDescuento() de abajo mira window._fidelizacionPremioActivo
  // tal cual esté en ese momento. Sin esperarla aquí, un cliente con premio
  // de verdad disponible podía confirmar el pedido sin que se le aplicara,
  // porque el aviso "aún no había llegado" a tiempo aunque en el servidor
  // sí lo tuviera. Se vuelve a comprobar (y esperar) justo antes de
  // calcular el descuento, para no depender de si la comprobación de fondo
  // llegó a tiempo o no.
  if (typeof _comprobarPremioFidelizacion === 'function') {
    await _comprobarPremioFidelizacion(phoneClean);
  }
  const _fidelizacionDescuento = getFidelizacionDescuento(phoneClean);
  // Descuento estudiante/jubilado — autodeclarado por el cliente; la
  // verificación real del carné se hace en caja al cobrar, avisado en el
  // ticket/cocina.
  const _esEstudianteJubiladoRaw = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled()
    && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _studentDiscountPctSubmit = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  // No se combinan entre sí el código de descuento (manual o de ruleta/
  // rasca), el de estudiante/jubilado ni la oferta relámpago sobre el
  // pedido entero — se aplica solo el mayor de los tres, nunca la suma,
  // igual que ya decide el carrito en renderCart() (carta.js). La
  // fidelización no entra en este conflicto: se sigue sumando siempre, sin
  // condición. La oferta relámpago de tipo "producto" tampoco entra aquí:
  // ya va incluida en subTotal, porque regularTotal (más arriba) se calculó
  // con _precioConOferta().
  const _ofertaTotalSubmit = window._ofertaRelampagoActiva;
  const _ofertaTotalPctSubmit = (_ofertaTotalSubmit && _ofertaTotalSubmit.tipo === 'total' && _ofertaRelampagoVigente(_ofertaTotalSubmit)) ? _ofertaTotalSubmit.pct : 0;
  let _discountAmt = getDiscountAmount(subTotal);
  let _studentDiscountAmt = _esEstudianteJubiladoRaw ? Math.round(subTotal * _studentDiscountPctSubmit) / 100 : 0;
  let _ofertaTotalAmt = _ofertaTotalPctSubmit > 0 ? Math.round(subTotal * _ofertaTotalPctSubmit) / 100 : 0;
  let _esEstudianteJubiladoSubmit = _esEstudianteJubiladoRaw;
  const _candidatosSubmit = [
    { tipo: 'codigo', amt: _discountAmt },
    { tipo: 'estudiante', amt: _studentDiscountAmt },
    { tipo: 'oferta', amt: _ofertaTotalAmt }
  ].filter(c => c.amt > 0);
  if (_candidatosSubmit.length > 1) {
    _candidatosSubmit.sort((a, b) => b.amt - a.amt);
    const _ganadorSubmit = _candidatosSubmit[0].tipo;
    if (_ganadorSubmit !== 'codigo') _discountAmt = 0;
    if (_ganadorSubmit !== 'estudiante') { _studentDiscountAmt = 0; _esEstudianteJubiladoSubmit = false; } // no se aplicó de verdad: no se marca el pedido ni se avisa de verificar carné
    if (_ganadorSubmit !== 'oferta') _ofertaTotalAmt = 0;
  }
  const orderTotal = Math.max(0, subTotal + feeAmount + fee2Amount - _discountAmt - _fidelizacionDescuento - _studentDiscountAmt - _ofertaTotalAmt);
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
      subtotal: _precioConOferta(item) * qty
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
    const extras = [...c.sauces.map(s => 'Extra salsa ' + s), ...ingsWithoutQueso.map(i => 'Extra ' + i)];
    // Añadir quesos al final
    quesosFromIng.forEach(q => extras.push('Extra ' + q));
    if (c.extraQueso) extras.push('Extra Queso Mozzarella +1€');
    // El gratinado siempre va el último, sea cual sea el resto de extras.
    if (c.extraGratinado) extras.push('Gratinado +0,50€');
    return {
      name: item.name,
      qty: c.qty,
      subtotal: unitPrice * c.qty,
      extras
    };
  }).filter(Boolean);
  // Cada patata con extras (queso/gratinado/ingredientes) se desglosa en
  // el ticket: la línea principal muestra solo el precio de la patata
  // sola, y cada extra sale debajo con un guión y su propio precio — igual
  // que ya hacían las Patatas Al Gusto/Bomba (ver "extras" en custItems
  // más arriba). Antes salía todo junto en una sola línea con el precio ya
  // sumado ("Patata Carbonara + Gratinado" a 6,30€), sin ver cuánto era la
  // patata y cuánto el extra.
  const extItems = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return null;
    const extras = [];
    if (c.queso) extras.push({ name: 'Extra Queso', price: 1.00 });
    (c.ingredientesExtra || []).forEach(ing => {
      const precioIng = EXTRAS_ING_PRECIO1.includes(ing) ? 1.00 : EXTRAS_ING_PRECIO07.includes(ing) ? 0.70 : 0;
      extras.push({ name: 'Extra ' + ing, price: precioIng });
    });
    (c.salsasExtra || []).forEach(salsa => {
      extras.push({ name: 'Extra salsa ' + salsa, price: EXTRAS_SALSA_PRECIO });
    });
    // El gratinado siempre va el último, sea cual sea el resto de extras.
    if (c.gratinado) extras.push({ name: 'Gratinado', price: 0.50 });
    return {
      name: item.name,
      qty: c.qty,
      subtotal: c.basePrice * c.qty,
      extras: extras.length ? extras : undefined
    };
  }).filter(Boolean);
  const feeItems = feeEnabled ? [{
    name: feeLabel,
    qty: 1,
    subtotal: feeAmount,
    isFee: true
  }] : [];
  const fee2Items = fee2Enabled ? [{
    name: fee2Label,
    qty: 1,
    subtotal: fee2Amount,
    isFee: true
  }] : [];
  const fidelizacionItems = _fidelizacionDescuento > 0 ? [{
    name: '🎁 Premio fidelización (patata gratis)',
    qty: 1,
    subtotal: -_fidelizacionDescuento
  }] : [];
  const studentDiscountItems = _studentDiscountAmt > 0 ? [{
    // Aclaración breve de que el % es solo sobre productos (no sobre bolsa
    // ni gastos de gestión) — así se ve en el propio ticket sin tener que
    // explicarlo aparte si alguien pregunta por qué no baja más el total.
    name: '🪪 Descuento estudiante/jubilado (-' + _studentDiscountPctSubmit + '% en productos)',
    qty: 1,
    subtotal: -_studentDiscountAmt
  }] : [];
  // La oferta relámpago de tipo "producto" no necesita línea aparte: ya se
  // ve reflejada en el precio de esa línea de comida (_precioConOferta).
  const ofertaRelampagoItems = _ofertaTotalAmt > 0 ? [{
    name: '⚡ Oferta relámpago (-' + _ofertaTotalPctSubmit + '%)',
    qty: 1,
    subtotal: -_ofertaTotalAmt
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
  // El ticket siempre imprime la comida en este orden fijo (patatas primero,
  // bebidas al final), sin importar en qué orden se fueron añadiendo al
  // carrito — más fácil de montar en cocina. Los gastos/descuentos/avisos
  // van siempre después, tal cual ya estaban.
  const foodItems = [...regularItems, ...custItems, ...extItems];
  foodItems.sort((a, b) => _ticketCategoriaRank(a.name) - _ticketCategoriaRank(b.name));
  const orderItems = [...foodItems, ...feeItems, ...fee2Items, ...fidelizacionItems, ...studentDiscountItems, ...ofertaRelampagoItems, ...fidelizacionAvisoItems];
  const now = new Date().toLocaleString('es-ES');

  // Estadística "¿le metes algo dulce/de beber?": si se llegó a mostrar
  // alguna sugerencia (window._upsellFueMostrado, marcado por
  // getUpsellCarrito() al ofrecerla, sea de postre o de bebida) y si el
  // cliente acabó añadiendo alguna de las opciones ofrecidas de cualquiera
  // de los dos tipos.
  const upsellMostrado = !!window._upsellFueMostrado;
  const _upsellIdsOfrecidos = window._upsellOpcionesElegidas
    ? [].concat((window._upsellOpcionesElegidas.dulce || {}).ids || [], (window._upsellOpcionesElegidas.bebida || {}).ids || [])
    : [];
  const upsellAnadido = _upsellIdsOfrecidos.some(id => (cart[id] || 0) > 0);

  // Aviso destacado en el ticket para que no se olvide entregar/descontar
  // el premio — solo cuando el cliente YA tenía una patata gratis
  // pendiente de canjear ANTES de este pedido (window._fidelizacionPremioActivo,
  // calculado al escribir el teléfono en _comprobarPremioFidelizacion). No
  // es lo mismo que "este pedido es elegible para sumar sello" (eso pasaba
  // casi en cada ticket, con patata + 5€ de mínimo, y hacía el aviso inútil
  // por repetirse siempre). El caso de "este pedido completa el 10º sello
  // ahora mismo" ya tiene su propio aviso separado más abajo
  // (fidelizacionAvisoItems, "¡10º SELLO COMPLETADO!").
  const _fidelizacionElegibleSubmit = !!(window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean);

  // Datos estructurados del ticket (para impresión HTML)
  const ticketData = {
    orderNum,
    name,
    phone,
    notes,
    // Si el pedido es "desde el local" (QR) y hay un tiempo de espera entre
    // tickets configurado, _horaTiendaAsignadaSubmit reparte la hora que
    // sale en el ticket en vez de "ahora mismo" (ver más arriba).
    slotTime: selectedSlot || _horaTiendaAsignadaSubmit || null,
    items: orderItems,
    total: orderTotal,
    time: now,
    upsellMostrado,
    upsellAnadido,
    // Pedido "desde el local" (código de cola aplicado): para que en cocina
    // pueda mostrarse primero, ya que ese cliente está esperando físicamente
    // en el mostrador y no se puede ir a pedir a otro sitio.
    esPedidoLocal: _sinGastosPorCodigoLocalSubmit,
    // Descuento estudiante/jubilado autodeclarado — se imprime destacado en
    // el ticket y se marca en cocina para que se compruebe el carné al cobrar.
    esEstudianteJubilado: _esEstudianteJubiladoSubmit,
    fidelizacionElegible: _fidelizacionElegibleSubmit
  };
  _lastTicketData = ticketData;
  window._pendingTicketData = ticketData;

  // Texto plano para el email (se mantiene igual)
  const ticketText = buildTicketText(orderNum, name, phone, notes, selectedSlot, orderTotal, feeAmount, _discountAmt, (_activeDiscount ? _activeDiscount.code : null), _fidelizacionDescuento, _ofertaTotalAmt, _ofertaTotalPctSubmit);
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
        pickup_time: needsSlot ? selectedSlot : (_horaTiendaAsignadaSubmit || "–"),
        total: orderTotal.toFixed(2) + " €"
      });
    } catch (err) {
      console.error("EmailJS error:", err);
      logActivity("⚠️ Email de confirmación NO enviado — pedido " + orderNum + " — " + (err && err.text || err && err.message || "error desconocido"));
    }
  } else {
    console.warn("EmailJS no cargado — email omitido");
  }
  // El uso del código de descuento se registra en el servidor al
  // finalizar el pedido (ver guardar-pedido.php) — incrementar
  // discounts/<code>/uses exige el UID de admin en las reglas, así que
  // el navegador ya no puede hacerlo directamente. Si el código perdió el
  // conflicto con el descuento de estudiante/jubilado (_discountAmt quedó
  // en 0 más arriba), no se envía — no se ha llegado a usar de verdad, así
  // que no debe consumir ningún uso del cupón.
  const _discountCodeUsado = (_activeDiscount && _discountAmt > 0) ? _activeDiscount.code : null;
  _activeDiscount = null;
  const dcInput = document.getElementById('discount-input');
  const dcFeedback = document.getElementById('discount-feedback');
  if (dcInput) dcInput.value = '';
  if (dcFeedback) dcFeedback.textContent = '';
  // Desmarcar la casilla estudiante/jubilado para el siguiente pedido — no
  // debe quedar marcada por defecto sin que el cliente vuelva a elegirlo.
  const _studentCb = document.getElementById('student-discount-checkbox');
  if (_studentCb) _studentCb.checked = false;
  const _studentCbDrawer = document.getElementById('drawer-student-discount-checkbox');
  if (_studentCbDrawer) _studentCbDrawer.checked = false;
  // ── Verificación SMS ──────────────────────────────────────
  // Guardar datos del pedido pendiente hasta que se verifique el teléfono
  window._pendingOrderData = {
    orderNum,
    slotTime: needsSlot ? selectedSlot : (_horaTiendaAsignadaSubmit || null),
    phone,
    phoneClean,
    ticketData: ticketData,
    discountCode: _discountCodeUsado
  };

  // Pedido "desde el local" (código del QR del mostrador validado y de
  // hoy): el cliente lo tiene el personal delante, así que no tiene
  // sentido pedirle un SMS — se salta el modal y se finaliza directo. Ojo:
  // esto NO basta por sí solo, guardar-pedido.php vuelve a comprobar el
  // código y su fecha de verdad contra Firebase (ver localCodeValido allí)
  // antes de aceptar un pedido sin smsToken, así que un pedido con
  // esPedidoLocal falseado a mano sin el código real seguiría rechazándose.
  // Interruptor de emergencia del panel (Twilio caído, etc.) — mientras
  // esté desactivado, ningún pedido pide SMS, no solo los del QR local.
  // guardar-pedido.php vuelve a comprobar config/smsVerificacionActiva de
  // verdad contra Firebase antes de aceptar un pedido sin smsToken, así
  // que esto tampoco basta por sí solo si alguien lo falsea a mano.
  const _smsDesactivadaSubmit = (typeof getSmsVerificacionActiva === 'function') && !getSmsVerificacionActiva();
  if (_sinGastosPorCodigoLocalSubmit || _smsDesactivadaSubmit) {
    const _codigoLocalUsado = ((document.getElementById('local-fee-code-input') || {}).value || '').trim().toUpperCase();
    window._pendingOrderData.localCode = _codigoLocalUsado;
    btn.disabled = false;
    btn.textContent = 'Confirmar pedido →';
    await _finalizarPedido();
    return;
  }

  // Intentar enviar SMS de verificación — ya no hay atajo que se la salte
  // (ni el antiguo _skipSmsVerification del navegador, ni dejar pasar el
  // pedido si el envío falla): guardar-pedido.php ahora exige de verdad un
  // comprobante firmado de que este teléfono verificó su código con
  // Twilio (ver validarSmsToken), así que sin verificación real el pedido
  // se rechazaría de todas formas más adelante — mejor decirlo claro aquí
  // que dejar avanzar algo que va a fallar solo.
  let smsOk = false;
  let smsError = null;
  try {
    const smsRes = await _fetchConTimeout('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + phoneClean })
    }, 8000);
    const smsData = await smsRes.json();
    if (smsData.success) {
      smsOk = true;
    } else {
      smsError = smsData.error;
      console.warn('[SMS] send-code error:', smsData.error);
    }
  } catch (e) {
    smsError = e.message;
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
    showAlert('No se pudo enviar el código de verificación por SMS (' + (smsError || 'error desconocido') + '). Inténtalo de nuevo en unos minutos.');
    window._pendingOrderData = null;
  }
  return; // El pedido se finaliza desde smsVerifyCode()
}

// ── Finalizar pedido tras verificación SMS ──────────────────
async function _finalizarPedido() {
  if (!window._pendingOrderData) return;
  const { orderNum, slotTime, phone, phoneClean, ticketData: _ticketDataParaFidelizacion, discountCode, smsToken, localCode } = window._pendingOrderData;
  try { if (phoneClean) localStorage.setItem('dpf_customer_phone', phoneClean); } catch {}
  window._pendingOrderData = null;

  // Cerrar modal SMS si está abierto
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';

  // Guardar el pedido en el servidor: ticket completo + estadísticas del
  // día + uso del código de descuento (si lo hubo). tickets/ y stats/
  // exigen el UID de admin en las reglas de Firebase, así que un cliente
  // anónimo (cualquiera que pida sin haber iniciado sesión de admin) no
  // puede escribir ahí directamente — lo hace guardar-pedido.php con la
  // cuenta de servicio.
  // No se espera aquí (para que la pantalla de éxito aparezca al instante),
  // pero SÍ hay que esperar a que termine antes de pedir el sello de
  // fidelización más abajo — fidelizacion.php ahora comprueba contra el
  // ticket ya guardado en Firebase (tickets/<fecha>/<num>), así que si se
  // llamara antes de que este guardado termine, el sello se rechazaría por
  // "pedido no encontrado" en pedidos completamente legítimos.
  let _pedidoGuardadoPromise = Promise.resolve();
  if (window._pendingTicketData) {
    const _pedidoPayload = {
      orderNum,
      name: window._pendingTicketData.name,
      phone: window._pendingTicketData.phone,
      notes: window._pendingTicketData.notes,
      slotTime: window._pendingTicketData.slotTime,
      items: window._pendingTicketData.items,
      total: window._pendingTicketData.total,
      discountCode: discountCode || null,
      // Comprobante de verificación SMS que exige guardar-pedido.php ahora
      // (ver validarSmsToken allí) — lo genera verify-code.php tras
      // confirmar el código de verdad con Twilio.
      smsToken: smsToken || null,
      // Código "pedido desde el local" tal cual lo escribió/trajo el
      // cliente — junto con esPedidoLocal, es lo que guardar-pedido.php
      // revalida de verdad contra Firebase para decidir si puede aceptar
      // el pedido sin smsToken (ver localCodeValido allí).
      localCode: localCode || null,
      upsellMostrado: window._pendingTicketData.upsellMostrado || false,
      upsellAnadido: window._pendingTicketData.upsellAnadido || false,
      esPedidoLocal: window._pendingTicketData.esPedidoLocal || false,
      esEstudianteJubilado: window._pendingTicketData.esEstudianteJubilado || false,
      fidelizacionElegible: window._pendingTicketData.fidelizacionElegible || false
    };
    // Se guarda un marcador ANTES de mandar la petición — si la pestaña se
    // cierra o se pierde la conexión justo después de confirmar (antes de
    // recibir la respuesta), _recuperarPedidoEnCurso() lo reenvía solo al
    // volver a abrir la web. Reenviar el mismo pedido es seguro aunque el
    // primer intento sí hubiera llegado a guardarse: guardar-pedido.php
    // responde éxito (no error) si el ticket ya existe con el mismo
    // teléfono, en vez de duplicarlo.
    try { localStorage.setItem('dpf_pedido_en_curso', JSON.stringify({ orderNum, payload: _pedidoPayload, ts: Date.now() })); } catch (e) {}
    console.log('💾 Guardando pedido en el servidor:', orderNum);
    _pedidoGuardadoPromise = _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_pedidoPayload)
    }, 12000)
      .then(res => res.json())
      .then(data => {
        try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
        if (data.success) {
          console.log('✅ Pedido guardado');
          window._pendingTicketData = null;
          if (typeof _actualizarTiempoEstimadoTrasGuardar === 'function') _actualizarTiempoEstimadoTrasGuardar(data);
        }
        else { console.error('❌ Error guardando pedido:', data.error); logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (data.error || 'error desconocido')); _avisarClienteFalloGuardado(orderNum); }
      })
      .catch((e) => {
        // No se borra el marcador aquí: no hubo respuesta del servidor (fallo
        // de red/pestaña cerrada), así que no se sabe si el pedido llegó a
        // guardarse — se deja para que _recuperarPedidoEnCurso() lo reintente
        // en la próxima visita.
        console.error('❌ Error guardando pedido:', e);
        logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (e && e.message || 'error de conexión'));
        _avisarClienteFalloGuardado(orderNum);
      });
  } else {
    console.warn('⚠️ _pendingTicketData vacío, no se pudo guardar el pedido');
  }

  // Programa de fidelización: sumar sello si el pedido incluye al menos 1
  // patata. Se encadena a partir de que termine el guardado (fidelizacion.php
  // comprueba contra el ticket ya guardado) y se publica esa promesa YA en
  // window._selloEnCursoPorPedido — antes incluso de mostrar la pantalla de
  // éxito, que es cuando los botones "Modificar"/"Cancelar pedido" se
  // activan. Publicarla más tarde (como antes) dejaba un hueco real: un
  // cliente que pulsara "Modificar" muy rápido nada más confirmar podía
  // cancelar el pedido justo en ese hueco — _borrarPedidoDeFirebase()
  // (antifraude.js) no encontraba ninguna promesa que esperar todavía, así
  // que pedía revertir el sello antes de que el sello llegara siquiera a
  // registrarse (no había nada que deshacer), y cuando el registro real
  // llegaba justo después, se quedaba puesto un sello para un pedido ya
  // cancelado — el cliente se llevaba un sello de más que no le tocaba.
  const _consumioPremioFidelizacion = window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean;
  const _selloPromise = _pedidoGuardadoPromise
    .catch(() => {})
    .then(() => _procesarSelloFidelizacion(phoneClean, _ticketDataParaFidelizacion, _consumioPremioFidelizacion))
    .catch(e => console.warn('[fidelizacion] error:', e));
  if (orderNum) {
    window._selloEnCursoPorPedido[orderNum] = _selloPromise;
    _selloPromise.then(() => {
      if (window._selloEnCursoPorPedido[orderNum] === _selloPromise) delete window._selloEnCursoPorPedido[orderNum];
    });
  }

  await showSuccess(orderNum, slotTime);
  // El registro en phoneLog (para el cooldown/límite diario) ya lo hace
  // guardar-pedido.php al guardar el pedido — hacerlo también aquí
  // contaría cada pedido dos veces.
  window._fidelizacionPremioActivo = null;
  _ocultarAvisoPremioFidelizacion();
}
// Antes, si guardar-pedido.php fallaba, el cliente veía "pedido confirmado"
// igual y solo quedaba un aviso en el log de actividad que ve el admin —
// nadie en cocina se enteraba de que el pedido no había llegado. Ahora, si
// el cliente sigue en la pantalla de éxito de ESE pedido, se lo decimos.
function _avisarClienteFalloGuardado(orderNum) {
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  const mismoNum = document.getElementById('order-num-display')?.textContent === String(orderNum);
  if (!successVisible || !mismoNum) return;
  const warning = document.getElementById('success-save-warning');
  if (warning) warning.style.display = 'block';
}

// ── PROGRAMA DE FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META = 10;
// Pedido mínimo para sumar sello — evita que un pedido mínimo (p.ej. 1
// patata suelta de 2€) valga igual que uno grande a efectos de fidelización.
const FIDELIZACION_PEDIDO_MINIMO = 5;
function _ticketTienePatata(ticketData) {
  if (!ticketData || !Array.isArray(ticketData.items)) return false;
  return ticketData.items.some(it => typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata'));
}
// El mínimo de 5€ lo decide SIEMPRE el servidor, contra el total real del
// ticket ya guardado (fidelizacion.php, con FIDELIZACION_PEDIDO_MINIMO) —
// aquí solo se filtra por "lleva patata" antes de llamar, para no gastar
// una petición en pedidos que claramente no cuentan. Antes este filtro
// también comprobaba el total en el propio navegador (con el mismo umbral
// de 5€ duplicado en dos sitios): si por lo que fuera ese cálculo del
// cliente no coincidía exactamente con el total ya guardado en el
// servidor, el pedido ni siquiera llegaba a pedir el sello — y como el
// filtro corta ANTES de la llamada a fidelizacion.php, no queda ningún
// aviso en el registro de actividad de ese fallo (a diferencia de un
// rechazo del servidor, que sí se registra y aparece en Alertas con botón
// "Reintentar sello"). Quitar la comprobación de aquí cierra ese punto
// ciego sin cambiar el resultado final, porque el servidor igualmente
// rechaza (en silencio, sin alerta, es el caso normal y esperado) los
// pedidos por debajo del mínimo.
function _pedidoElegibleFidelizacion(ticketData) {
  return _ticketTienePatata(ticketData);
}
// Pedido → promesa de "todo lo que le falta a este pedido para terminar de
// asentarse (guardado + intento de sumar sello)" — la publica
// _finalizarPedido() nada más conocer el orderNum, y _borrarPedidoDeFirebase()
// (antifraude.js) la espera antes de pedir que se revierta el sello, si el
// cliente cancela/modifica el pedido justo después de confirmarlo. Ver el
// comentario en _finalizarPedido de por qué hace falta.
window._selloEnCursoPorPedido = window._selloEnCursoPorPedido || {};
async function _procesarSelloFidelizacion(phoneClean, ticketData, consumioPremio) {
  if (!phoneClean || !_pedidoElegibleFidelizacion(ticketData)) return;
  // El cálculo del sello (sumar, resetear a los 10, descontar premio
  // canjeado) se hace en el servidor (fidelizacion.php): el navegador ya
  // no lee ni escribe fidelizacion/<telefono> directamente, para que nadie
  // pueda regalarse sellos/premios abriendo las devtools.
  try {
    const res = await _fetchConTimeout('fidelizacion.php', {
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
    }, 10000);
    // Si el servidor rechaza el sello (success:false, no "skipped"), ya lo
    // registra fidelizacion.php por su cuenta con la cuenta de servicio
    // (fbAgregarActivityLog) — hacerlo también aquí en el navegador del
    // cliente no servía de nada en producción (un cliente anónimo real no
    // tiene permiso para escribir en config/activityLog) y solo duplicaba
    // el aviso cuando quien probaba era la propia admin con el panel
    // abierto en el mismo navegador.
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

// ── Tiempo de modificación de pedido (en minutos) ──
function saveModifyWindow() {
  var _document$getElementB2;
  const v = parseInt(((_document$getElementB2 = document.getElementById('modify-window-input')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || '1');
  const valid = isNaN(v) || v < 1 || v > 30 ? 1 : v;
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
  const v = localStorage.getItem('dpf_modify_window_mins') || '1';
  const el = document.getElementById('modify-window-input');
  if (el) el.value = v;
}


// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
// BLACKLIST_KEY, ANTISPAM_KEY, PHONE_LOG_KEY, getBlacklist,
// saveBlacklistLocal y getAntiSpamCfg viven en nucleo-compartido.js —
// el checkout (carrito-checkout.js) los necesita para bloquear pedidos de
// números en la lista negra o que superen el límite anti-spam. La UI de
// admin para editar esa lista/configuración vive en admin-antispam-stats.js,
// igual que loadDayStats/resetSlots/confirmClearDay/resetDayStats/
// cancelarPedidoAdmin (panel de estadísticas del día) y
// toggleForceSlots/updateForceSlotsBtn (ajuste de "forzar turnos").
async function showSuccess(orderNum, slotTime) {
  // Pedido confirmado con éxito: si el drawer móvil seguía abierto, ya
  // podemos cerrarlo (antes se cerraba nada más pulsar "Confirmar", lo
  // que rompía el resaltado de campos con error en submitOrderFromDrawer).
  if (typeof closeCartDrawer === 'function') closeCartDrawer();

  // Restaurar el texto normal de "pedido confirmado" — si el cliente había
  // cancelado un pedido antes en esta misma visita, cancelarPedido() dejó
  // este mismo bloque con el texto de "❌ Pedido cancelado" puesto, y sin
  // esto se quedaba así para siempre aunque el pedido SIGUIENTE sí se
  // confirmara bien (confundía al cliente, que creía que había fallado y
  // podía llegar a repetir el pedido).
  const _icon = document.querySelector('#success-screen .success-icon');
  const _title = document.querySelector('#success-screen .success-title');
  const _sub = document.querySelector('#success-screen .success-sub');
  if (_icon) _icon.textContent = '🥔';
  if (_title) _title.textContent = '¡Pedido confirmado!';
  if (_sub) _sub.textContent = 'Te esperamos en el local';
  // Exponer datos del pedido para el botón de WhatsApp
  window.currentOrderNum = orderNum;
  window.currentOrderSlot = slotTime || null;
  window.currentOrderName = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
  const orderTotal = _lastTicketData ? _lastTicketData.total : 0;
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.replace(/[\s\-().+]/g, '').trim();
  const notes = document.getElementById("customer-notes").value.trim();
  // Await so ticket data is saved before admin can print
  await recordOrderStats(orderNum, name, orderTotal, slotTime);

  // Guardar snapshot del pedido para poder modificarlo/cancelarlo
  window._lastOrderData = {
    num: orderNum,
    name,
    phone,
    notes,
    total: orderTotal,
    items: _lastTicketData ? [...(_lastTicketData.items || [])] : [],
    slot: slotTime || null,
    cart: JSON.parse(JSON.stringify(cart)),
    custCart: JSON.parse(JSON.stringify(custCart)),
    extrasCart: JSON.parse(JSON.stringify(extrasCart)),
    ts: Date.now()
  };

  // Guardar en localStorage para recuperar si se cierra la pestaña
  try {
    localStorage.setItem('dpf_active_order', JSON.stringify(window._lastOrderData));
  } catch (e) {}

  // Guardar aparte, sin caducar, para "Repetir mi último pedido" en una
  // visita futura — a diferencia de dpf_active_order (que se borra en
  // cuanto se cierra la ventana de modificar/cancelar), esto se queda.
  // Solo líneas de producto real: sin gastos de gestión (isFee) ni el
  // descuento/aviso de fidelización (subtotal <= 0).
  try {
    const _itemsRepetibles = (_lastTicketData ? _lastTicketData.items || [] : []).filter(i => !i.isFee && i.subtotal > 0);
    if (_itemsRepetibles.length) {
      localStorage.setItem('dpf_ultimo_pedido', JSON.stringify({
        items: _itemsRepetibles,
        total: orderTotal,
        cart: JSON.parse(JSON.stringify(cart)),
        custCart: JSON.parse(JSON.stringify(custCart)),
        extrasCart: JSON.parse(JSON.stringify(extrasCart)),
        ts: Date.now()
      }));
    }
  } catch (e) {}

  // Recordar nombre y teléfono para prellenarlos en la próxima visita (ver
  // _rellenarDatosClienteGuardados en init.js) — se guarda sin caducar,
  // igual que "dpf_ultimo_pedido"; el cliente puede editarlos igualmente.
  try {
    if (name) localStorage.setItem('dpf_cliente_nombre', name);
    if (phone) localStorage.setItem('dpf_cliente_telefono', phone);
  } catch (e) {}

  // Registrar el slot
  if (slotTime) incrementSlot(slotTime);

  // Nombre del cliente
  const customerInfoEl = document.getElementById('success-customer-info');
  const customerNameEl = document.getElementById('success-customer-name');
  if (customerNameEl) customerNameEl.textContent = name;

  // Mostrar hora de recogida en pantalla de éxito
  const slotInfo = document.getElementById('success-slot-info');
  const slotTimeEl = document.getElementById('success-slot-time');
  if (slotTime && slotInfo && slotTimeEl) {
    slotTimeEl.textContent = slotTime;
    slotInfo.style.display = 'flex';
  } else if (slotInfo) {
    slotInfo.style.display = 'none';
  }

  // Estimación de espera según la cola actual — un cliente anónimo no puede
  // leer stats/ ni orderStatus/ (son de solo-admin, ver las reglas de
  // Firebase), así que aquí NO se calcula nada localmente — solo se oculta
  // por defecto. El valor real llega un poco después, ya calculado por el
  // servidor (guardar-pedido.php, que sí tiene acceso completo) en la misma
  // respuesta del pedido — ver _actualizarTiempoEstimadoTrasGuardar() en
  // carrito-checkout.js, que rellena este mismo bloque en cuanto responde.
  const tiempoEstEl = document.getElementById('success-tiempo-estimado');
  if (tiempoEstEl) {
    tiempoEstEl.style.display = 'none';
  }

  // Resumen de ítems
  const itemsContainer = document.getElementById('success-items-list');
  if (itemsContainer && _lastTicketData && _lastTicketData.items.length) {
    const itemsHTML = _lastTicketData.items.map(it => "\n      <div class=\"success-item-row\">\n        <span class=\"success-item-name\">".concat(it.name, "</span>\n        <span class=\"success-item-qty\">\xD7").concat(it.qty, "</span>\n        <span class=\"success-item-price\">").concat(it.subtotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>")).join('');
    itemsContainer.innerHTML = "\n      <div class=\"success-summary-title\">\uD83E\uDDFE Resumen del pedido</div>\n      ".concat(itemsHTML, "\n      <div class=\"success-total-row\">\n        <span>Total a pagar</span>\n        <span>").concat(orderTotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>");
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
  }
  document.querySelector('.order-panel').style.display = "none";
  document.getElementById("success-screen").style.display = "block";
  document.getElementById("order-num-display").textContent = orderNum;
  // Se muestra si falla el guardado en el servidor (ver _finalizarPedido) —
  // hay que resetearlo aquí para que no se quede pegado de un pedido anterior.
  const saveWarning = document.getElementById('success-save-warning');
  if (saveWarning) saveWarning.style.display = 'none';
  if (typeof _sonidoConfirmacionPedido === 'function') _sonidoConfirmacionPedido();
  // Pequeño golpe táctil al confirmar, en móviles que lo soporten — refuerza
  // la sensación de "hecho" sin tener que mirar la pantalla.
  if (navigator.vibrate) { try { navigator.vibrate([80, 40, 80]); } catch (e) {} }
  // Ocultar FAB en pantalla de éxito
  const fab = document.getElementById('cart-fab');
  if (fab) fab.classList.add('hidden');
  // Arrancar temporizador de modificación (5 minutos)
  _startModifyTimer();
  setTimeout(() => {
    document.getElementById("success-screen").scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 50);
}
// Rellena el aviso de "tiempo estimado" de la pantalla de éxito una vez
// responde guardar-pedido.php — se hace aparte de showSuccess() (que ya
// mostró la pantalla, optimista, antes de que el servidor conteste) porque
// es el único sitio con acceso real a cuántos pedidos hay pendientes ahora
// mismo (stats/ y orderStatus/ son de solo-admin, un cliente anónimo no
// puede calcularlo por su cuenta).
function _actualizarTiempoEstimadoTrasGuardar(data) {
  const tiempoEstEl = document.getElementById('success-tiempo-estimado');
  if (!tiempoEstEl) return;
  const minutos = Number(data && data.minutosEsperaExtra) || 0;
  const pendientes = Number(data && data.pendientesHoy) || 0;
  if (minutos > 0) {
    tiempoEstEl.textContent = '⏳ Ahora mismo hay ' + pendientes + ' pedidos en cola — puede tardar unos ' + minutos + ' min más de lo habitual.';
    tiempoEstEl.style.display = 'block';
  } else {
    tiempoEstEl.style.display = 'none';
  }
}
function resetOrder() {
  cart = {};
  Object.keys(custCart).forEach(k => delete custCart[k]);
  Object.keys(extrasCart).forEach(k => delete extrasCart[k]);
  selectedSlot = null;
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
  document.getElementById("customer-notes").value = "";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  window._lastOrderData = null;
  // Para que la sugerencia "¿algo dulce de postre?" se pueda volver a
  // mostrar (con opciones nuevas) en el pedido siguiente, en vez de
  // arrastrar el "ya se mostró"/las mismas opciones del pedido anterior.
  window._upsellFueMostrado = false;
  window._upsellOpcionesElegidas = null;
  window._upsellYaAnimado = false;
  window._upsellDismissed = { dulce: false, bebida: false };
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
}

// ── MODIFICAR / CANCELAR PEDIDO ──────────────────────────────────────────────
// dpf_modify_window_mins vuelve a contarse en MINUTOS (como su propio
// nombre siempre dijo) — a petición expresa, después de haber estado un
// tiempo en segundos.
const MODIFY_WINDOW_DEFAULT_MS = 1 * 60 * 1000;
function getModifyWindowMs() {
  try {
    const v = parseInt(localStorage.getItem('dpf_modify_window_mins') || '1');
    return (isNaN(v) || v < 1 || v > 30 ? 1 : v) * 60 * 1000;
  } catch (e) {
    return MODIFY_WINDOW_DEFAULT_MS;
  }
}
function _startModifyTimer() {
  if (window._modifyTimerInterval) clearInterval(window._modifyTimerInterval);
  const zone = document.getElementById('order-modify-zone');
  const timerEl = document.getElementById('order-modify-timer');
  const btnMod = document.getElementById('btn-modificar-pedido');
  const btnCan = document.getElementById('btn-cancelar-pedido');
  if (!zone || !timerEl) return;
  function _tick() {
    if (!window._lastOrderData) {
      clearInterval(window._modifyTimerInterval);
      return;
    }
    const elapsed = Date.now() - window._lastOrderData.ts;
    const remaining = getModifyWindowMs() - elapsed;
    if (remaining <= 0) {
      clearInterval(window._modifyTimerInterval);
      zone.style.display = 'none';
      return;
    }
    const totalSecs = Math.ceil(remaining / 1000);
    const tiempoTxt = totalSecs < 60
      ? totalSecs + ' s'
      : Math.floor(totalSecs / 60) + ':' + String(totalSecs % 60).padStart(2, '0') + ' min';
    timerEl.textContent = "\u23F1\uFE0F Puedes modificar o cancelar tu pedido durante ".concat(tiempoTxt);
    if (btnMod) btnMod.style.display = '';
    if (btnCan) btnCan.style.display = '';
    zone.style.display = 'block';
  }
  _tick();
  window._modifyTimerInterval = setInterval(_tick, 1000);
}
async function modificarPedido() {
  const data = window._lastOrderData;
  if (!data) return;
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u270F\uFE0F</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFModificar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">Se borrar\xE1 el pedido actual y podr\xE1s rehacerlo con los mismos productos.</div>\n        <div style=\"display:flex\">\n          <button id=\"_mod-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Cancelar</button>\n          <button id=\"_mod-yes\" style=\"flex:1;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, modificar</button>\n        </div>\n      </div>";
    document.body.appendChild(modal);
    document.getElementById('_mod-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_mod-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;

  // Borrar pedido actual de Firebase y stats
  await _borrarPedidoDeFirebase(data.num, data.phone);

  // Restaurar carrito con los productos anteriores
  Object.assign(cart, data.cart);
  Object.keys(data.custCart).forEach(k => {
    custCart[k] = data.custCart[k];
  });
  Object.keys(data.extrasCart).forEach(k => {
    extrasCart[k] = data.extrasCart[k];
  });
  selectedSlot = data.slot;

  // Restaurar datos del cliente
  document.getElementById("customer-name").value = data.name || '';
  document.getElementById("customer-phone").value = data.phone || '';
  document.getElementById("customer-notes").value = data.notes || '';

  // Volver al formulario
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
  document.querySelector('.order-panel').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}
async function cancelarPedido() {
  const data = window._lastOrderData;
  if (!data) return;

  // iOS Safari bloquea confirm() silenciosamente — usamos modal propio
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u274C</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFCancelar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">El pedido ".concat(data.num, " se eliminar\xE1. Esta acci\xF3n no se puede deshacer.</div>\n        <div style=\"display:flex\">\n          <button id=\"_cancel-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">No, mantener</button>\n          <button id=\"_cancel-yes\" style=\"flex:1;padding:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, cancelar</button>\n        </div>\n      </div>");
    document.body.appendChild(modal);
    document.getElementById('_cancel-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_cancel-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;
  await _borrarPedidoDeFirebase(data.num, data.phone);
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  const icon = document.querySelector('#success-screen .success-icon');
  const title = document.querySelector('#success-screen .success-title');
  const sub = document.querySelector('#success-screen .success-sub');
  if (icon) icon.textContent = '❌';
  if (title) title.textContent = 'Pedido cancelado';
  if (sub) sub.textContent = 'Tu pedido ha sido eliminado';
  document.getElementById('order-modify-zone').style.display = 'none';
  document.getElementById('success-items-list').innerHTML = '';
}
async function _borrarPedidoDeFirebase(orderNum, phone) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // 0. Si este pedido tenía un ticket esperando en la cola de impresión
  // pendiente (porque falló al imprimir mientras la impresora estaba
  // desconectada), quitarlo — si no, en cuanto la impresora reconecte se
  // imprimiría igualmente el ticket de un pedido ya cancelado/modificado,
  // sin ningún aviso de que ya no es válido.
  if (typeof _ptColaQuitar === 'function') _ptColaQuitar(orderNum);

  // 1. Marcar como cancelado en memoria y localStorage — inmediato, para que
  // este mismo dispositivo lo refleje al instante sin esperar al servidor.
  window._orderStatusCache[_normOrderKey(orderNum)] = 'cancelado';
  try { localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache)); } catch {}

  let telefonoParaRevertirSello = phone || null;
  let slotToFree = null;

  // 2. Marcar como cancelado y quitar de stats en Firebase — a través del
  // servidor (guardar-pedido.php, acción "cancelarPedido"), NO con una
  // escritura directa del navegador. orderStatus/ y stats/ exigen el UID
  // exacto del admin en las reglas de seguridad (igual que tickets/, slots/
  // y usedOrderNums/, ver comentarios en guardar-pedido.php): cuando esta
  // función la llamaba el propio cliente (auth anónima, p.ej. al pulsar
  // "Modificar pedido"), la escritura directa fallaba en silencio y el
  // pedido se quedaba activo para siempre en cocina/estadísticas del resto
  // de dispositivos, aunque el ticket viejo nunca llegara a anularse allí.
  try {
    const resp = await fetch('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancelarPedido', orderNum, fecha: todayKey, phone: phone || '' })
    });
    const data = await resp.json();
    if (data && data.success) {
      if (data.phone) telefonoParaRevertirSello = data.phone;
      if (data.slot) slotToFree = data.slot;
    } else {
      console.warn('[cancelarPedido] el servidor no pudo anular el pedido:', data && data.error);
    }
  } catch (e) {
    console.warn('[cancelarPedido] fallo de red al anular el pedido:', e);
  }

  // 3. Borrar también de localStorage (caché local de este dispositivo)
  try {
    const local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    if (local.orders) {
      const pedido = local.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
      if (pedido && pedido.slot && !slotToFree) slotToFree = pedido.slot;
      if (pedido && pedido.phone && !telefonoParaRevertirSello) telefonoParaRevertirSello = pedido.phone;
      local.orders = local.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
      local.count = Math.max(0, (local.count || 1) - 1);
      local.total = local.orders.reduce((acc, o) => acc + (o.total || 0), 0);
      localStorage.setItem(STATS_KEY, JSON.stringify(local));
    }
  } catch {}

  // Deshacer el sello de fidelización (y el canje del premio, si lo había
  // consumido) si este pedido cancelado/modificado había llegado a
  // sumarlo — si no, se quedaba dado para siempre aunque el pedido nunca
  // llegara a ser real. Se hace en el servidor (fidelizacion.php), que
  // valida contra el ticket real antes de tocar nada.
  if (telefonoParaRevertirSello) {
    const _telLimpio = telefonoParaRevertirSello.replace(/\D/g, '');
    if (_telLimpio.length === 9) {
      // Si el cliente pulsó "Modificar"/"Cancelar" justo después de
      // confirmar, es posible que la petición que suma el sello de ESTE
      // mismo pedido todavía esté de camino (se lanza sin esperar, para no
      // retrasar la pantalla de "pedido confirmado") — si se pide la
      // reversión antes de que ese sello exista de verdad en el servidor,
      // no hay nada que revertir, y cuando el registro original llega
      // justo después, el sello se queda puesto para un pedido ya
      // cancelado. Esperar aquí a que termine (si la hay) antes de pedir
      // la reversión evita esa carrera.
      const _selloPendiente = window._selloEnCursoPorPedido && window._selloEnCursoPorPedido[orderNum];
      if (_selloPendiente) { try { await _selloPendiente; } catch (e) {} }
      fetch('fidelizacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revertirSello', telefono: _telLimpio, orderNum })
      }).catch(e => console.warn('[fidelizacion] no se pudo revertir el sello al cancelar el pedido:', e));
    }
  }

  // 4. Liberar el turno reservado — el servidor (guardar-pedido.php, misma
  // llamada "cancelarPedido" del paso 2) ya decrementó slots/<fecha>/<turno>
  // de verdad; esto solo refresca la caché local (_slotsCache/localStorage)
  // para que ESTE dispositivo vea el hueco libre al instante, sin esperar a
  // que llegue por el listener de Firebase. Antes esto no se hacía nunca (ni
  // aquí ni en el servidor), así que cada cancelación/modificación dejaba el
  // turno ocupado para siempre.
  if (slotToFree && typeof decrementSlot === 'function') {
    try { await decrementSlot(slotToFree); } catch (e) { console.warn('[slot] no se pudo liberar localmente', e); }
  }

  // 5. Refrescar cocina y pedidos en vivo inmediatamente — solo existen si
  // el bundle de admin está cargado (un cliente cancelando su propio
  // pedido nunca lo tiene, y no le hace falta).
  if (typeof refreshKitchenGrid === 'function') refreshKitchenGrid();
  if (typeof loadLiveOrders === 'function') loadLiveOrders();
}

// ══════════════════════════════════════════
//  CUSTOMIZER — PATATA AL GUSTO & BOMBA
// ══════════════════════════════════════════

// custCart holds custom items: key → { menuId, qty, sauces, ingredients, key }
const custCart = {};
const CUSTOMIZER_CONFIG = {
  algusto: {
    name: 'Patata Al Gusto',
    price: 6.90,
    maxSauces: 1,
    maxIngredients: 6,
    maxTotal: null,
    subtitle: 'Hasta 1 salsa y hasta 6 ingredientes a elegir'
  },
  bomba: {
    name: 'Patata Bomba 🆕',
    price: 8.40,
    maxSauces: null,
    maxIngredients: null,
    maxTotal: 9,
    subtitle: 'Hasta 9 ingredientes y/o salsas a elegir'
  }
};
const CUST_SAUCES = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa Rosa', 'Salsa de Yogur', 'Tomate Frito', 'Queso Philadelphia', 'Roquefort'];
const CUST_INGREDIENTS = ['Jamón York', 'Carne Picada', 'Pollo', 'Carne Kebab', 'Atún', 'Gambas', 'Tronquitos de Mar', 'Huevo', 'Bacon', 'Queso Mozzarella', '4 Quesos', 'Tomate Natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
let custType = null;
let custSelSauces = [];
let custSelIngredients = [];
let custExtraQueso = false;
let custExtraGratinado = false;
function openCustomizer(itemId) {
  const cm = document.getElementById('customizer-modal');
  if (cm && cm.parentElement !== document.body) document.body.appendChild(cm);
  custType = itemId === 15 ? 'algusto' : 'bomba';
  custSelSauces = [];
  custSelIngredients = [];
  custExtraQueso = false;
  custExtraGratinado = false;
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-price').textContent = cfg.price.toFixed(2).replace('.', ',') + ' €';
  document.getElementById('cust-error').style.display = 'none';
  // Reset extras UI
  updateCustExtraUI('queso', false);
  updateCustExtraUI('gratinado', false);
  // Restaurar visibilidad de barra de salsas (puede haber quedado oculta de bomba anterior)
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (sauceProg) sauceProg.style.display = 'flex';
  renderCustChips();
  updateCustProgress();
  // Guardar posición de scroll antes de bloquear — evita salto al cerrar en móvil
  window._custScrollY = window.scrollY;
  document.getElementById('customizer-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCustomizer() {
  document.getElementById('customizer-modal').classList.remove('open');
  document.body.style.overflow = '';
  // Restaurar posición de scroll — Safari no soporta behavior:'instant', usar scrollTo directamente
  if (window._custScrollY !== undefined) {
    window.scrollTo(0, window._custScrollY);
    window._custScrollY = undefined;
  }
  custType = null;
}
function custSelTotal() {
  return custSelSauces.length + custSelIngredients.length;
}
function toggleCustExtra(type) {
  if (type === 'queso') {
    custExtraQueso = !custExtraQueso;
    // Si quita queso y no es solo gratinado, quitar también gratinado
    if (!custExtraQueso && custExtraGratinado) {
      custExtraGratinado = false;
      updateCustExtraUI('gratinado', false);
    }
  } else {
    custExtraGratinado = !custExtraGratinado;
    // Si activa gratinado, activar queso también
    if (custExtraGratinado && !custExtraQueso) {
      custExtraQueso = true;
      updateCustExtraUI('queso', true);
    }
  }
  updateCustExtraUI(type, type === 'queso' ? custExtraQueso : custExtraGratinado);
  updateCustTotalPrice();
}
function updateCustExtraUI(type, active) {
  const check = document.getElementById('cust-extra-check-' + type);
  const label = document.getElementById('cust-' + type + '-label');
  if (!check) return;
  if (active) {
    check.style.background = '#3D1F0D';
    check.style.borderColor = '#3D1F0D';
    check.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) {
      label.style.borderColor = '#3D1F0D';
      label.style.background = 'rgba(244,196,48,0.08)';
    }
  } else {
    check.style.background = '#fff';
    check.style.borderColor = '#F5E6C8';
    check.innerHTML = '';
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  }
}
function updateCustTotalPrice() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  let price = cfg.price;
  if (custExtraQueso) price += 1.00;
  if (custExtraGratinado) price += 0.50;
  document.getElementById('cust-price').textContent = price.toFixed(2).replace('.', ',') + ' €';
}
function renderCustChips() {
  if (!custType) return;
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  const saucesEl = document.getElementById('cust-sauces');
  const ingsEl = document.getElementById('cust-ingredients');
  saucesEl.innerHTML = CUST_SAUCES.map(s => {
    const sel = custSelSauces.includes(s);
    // Salsas: bloqueadas por maxSauces (algusto) o por maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustSauce(this,'").concat(s.replace(/'/g, "&#39;"), "')\">").concat(s, "</button>");
  }).join('');
  ingsEl.innerHTML = CUST_INGREDIENTS.map(i => {
    const sel = custSelIngredients.includes(i);
    // Ingredientes: bloqueados por maxIngredients (algusto) o maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustIng(this,'").concat(i.replace(/'/g, "&#39;"), "')\">").concat(i, "</button>");
  }).join('');
}
function toggleCustSauce(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelSauces.indexOf(name);
  if (idx >= 0) custSelSauces.splice(idx, 1);else custSelSauces.push(name);
  renderCustChips();
  updateCustProgress();
}
function toggleCustIng(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelIngredients.indexOf(name);
  if (idx >= 0) custSelIngredients.splice(idx, 1);else custSelIngredients.push(name);
  renderCustChips();
  updateCustProgress();
}
function updateCustProgress() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const ns = custSelSauces.length,
    ni = custSelIngredients.length,
    total = ns + ni;
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (cfg.maxTotal !== null) {
    // Bomba: una barra de progreso total combinada, ocultar barra de salsas separada
    const pct = Math.min(100, Math.round(total / cfg.maxTotal * 100));
    const cls = pct >= 100 ? 'full' : '';
    if (sauceProg) sauceProg.style.display = 'none';
    document.getElementById('cust-sauce-badge').textContent = ns;
    document.getElementById('cust-ing-label').textContent = 'Total: ' + total + '/' + cfg.maxTotal + ' (salsas: ' + ns + ' · ing: ' + ni + ')';
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pct / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill ' + cls;
    document.getElementById('cust-ing-badge').textContent = total + '/' + cfg.maxTotal;
  } else {
    // Al Gusto: dos barras independientes
    if (sauceProg) sauceProg.style.display = 'flex';
    const pctS = Math.min(100, Math.round(ns / cfg.maxSauces * 100));
    const pctI = Math.min(100, Math.round(ni / cfg.maxIngredients * 100));
    document.getElementById('cust-sauce-label').textContent = 'Salsas: ' + ns + '/' + cfg.maxSauces;
    document.getElementById('cust-sauce-bar').style.setProperty('--pct', pctS / 100);
    document.getElementById('cust-sauce-bar').className = 'progress-bar-fill' + (pctS >= 100 ? ' full' : '');
    document.getElementById('cust-sauce-badge').textContent = ns + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-label').textContent = 'Ingredientes: ' + ni + '/' + cfg.maxIngredients;
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pctI / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill' + (pctI >= 100 ? ' full' : '');
    document.getElementById('cust-ing-badge').textContent = ni + '/' + cfg.maxIngredients;
  }
}
function removeCustItem(key) {
  delete custCart[key];
  renderMenu();
  renderCart();
}
// Abre el personalizador YA relleno con las salsas/ingredientes/extras de
// una línea que ya está en el carrito — para pedir una segunda patata
// parecida pero no idéntica sin tener que volver a elegir todo desde cero.
// No toca la línea original: si el cliente confirma sin cambiar nada, se
// suma 1 a esa misma línea (mismo comportamiento que pedir dos iguales);
// si cambia algo, confirmCustomizer() la guarda como línea nueva porque su
// "huella" de salsas/ingredientes ya no coincide con la original.
function duplicarCustItem(key) {
  const item = custCart[key];
  if (!item) return;
  openCustomizer(item.menuId);
  custSelSauces = [...item.sauces];
  custSelIngredients = [...item.ingredients];
  custExtraQueso = !!item.extraQueso;
  custExtraGratinado = !!item.extraGratinado;
  updateCustExtraUI('queso', custExtraQueso);
  updateCustExtraUI('gratinado', custExtraGratinado);
  renderCustChips();
  updateCustProgress();
  updateCustTotalPrice();
}
function confirmCustomizer() {
  if (isShopBlocked()) {
    showClosedToast();
    closeCustomizer();
    return;
  }
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';

  // Validar máximos
  if (cfg.maxTotal !== null && custSelTotal() > cfg.maxTotal) {
    errEl.textContent = 'Máximo ' + cfg.maxTotal + ' ingredientes y/o salsas en total';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxSauces !== null && custSelSauces.length > cfg.maxSauces) {
    errEl.textContent = 'Máximo ' + cfg.maxSauces + ' salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxIngredients !== null && custSelIngredients.length > cfg.maxIngredients) {
    errEl.textContent = 'Máximo ' + cfg.maxIngredients + ' ingredientes';
    errEl.style.display = 'block';
    return;
  }
  const itemId = custType === 'algusto' ? 15 : 16;
  const fingerprint = [...custSelSauces, '|', ...custSelIngredients, '|', custExtraQueso ? 'Q' : '', custExtraGratinado ? 'G' : ''].join(',');
  const cartKey = itemId + '::' + fingerprint;
  if (!custCart[cartKey]) {
    custCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      sauces: [...custSelSauces],
      ingredients: [...custSelIngredients],
      extraQueso: custExtraQueso,
      extraGratinado: custExtraGratinado,
      key: cartKey
    };
  }
  custCart[cartKey].qty++;
  closeCustomizer();
  renderMenu();
  renderCart();
}

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

// ── Ocultar el carrito/"repetir pedido" flotante al llegar al pie ──
// Los dos son position:fixed pegados abajo del todo — en una web tan
// corta como esta, al llegar al final de la página (FAQ, horario,
// dirección...) no queda sitio debajo donde "flotar" sin tapar contenido
// real, y el bloque fijo se quedaba encima del pie tapando lo último de
// la página. Se desvanecen (opacity, no display — así no interfieren con
// la lógica que ya decide cuál de los dos mostrar) en cuanto el pie entra
// en la pantalla, y vuelven en cuanto se sube de nuevo.
(function () {
  var footer = document.querySelector('footer');
  var cartFab = document.getElementById('cart-fab');
  var repeatFab = document.getElementById('repeat-order-fab');
  if (!footer || !window.IntersectionObserver || (!cartFab && !repeatFab)) return;
  var obs = new IntersectionObserver(function (entries) {
    var cerca = entries[0].isIntersecting;
    if (cartFab) cartFab.classList.toggle('near-footer', cerca);
    if (repeatFab) repeatFab.classList.toggle('near-footer', cerca);
  });
  obs.observe(footer);
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
