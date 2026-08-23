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
// Igual que duplicarCustItem() (antifraude.js) pero para una patata normal
// con extras de pago (Philadelphia, Carbonara, Carnívora...) — antes solo
// existía el botón de quitar en esta línea del carrito, así que pedir una
// segunda parecida pero no idéntica obligaba a rehacer todo el
// personalizador desde cero. No toca la línea original: se reabre el
// modal con las mismas casillas ya activadas (reutilizando toggleExtra/
// toggleExtraIng/toggleExtraSalsa, que ya se encargan de la UI y del
// precio) — si el cliente confirma sin cambiar nada, se suma 1 a esa misma
// línea, igual que pedir dos iguales.
function duplicarExtrasItem(key) {
  const item = extrasCart[key];
  if (!item) return;
  // Cheddar-Bacon usa su propio modal de elegir carne (openCheddarModal),
  // no este — solo tiene 2 opciones sin más extras, así que reabrirlo
  // limpio ya cubre el mismo caso de uso.
  if (item.cheddarCarne) {
    openCheddarModal();
    return;
  }
  openExtrasModal(item.menuId);
  if (item.queso) toggleExtra('queso');
  if (item.gratinado) toggleExtra('gratinado');
  (item.ingredientesExtra || []).forEach(function (ing) { toggleExtraIng(ing); });
  (item.salsasExtra || []).forEach(function (salsa) { toggleExtraSalsa(salsa); });
}
// Antes usaba siempre c.basePrice, fijado UNA sola vez al añadir el
// producto al carrito (confirmExtras()/confirmCheddar()) — a diferencia de
// `cart` (precio en vivo vía _precioConOferta) y `custCart` (recalcula
// item.price en cada render), estas líneas nunca se refrescaban. Si el
// precio de una patata cambiaba desde el panel mientras el cliente la
// tenía ya en el carrito (antes de confirmar), el carrito y la pantalla de
// confirmación seguían mostrando el precio viejo. Ahora se busca el precio
// en vivo del mismo MENU que usa el resto — c.basePrice se queda solo como
// respaldo por si el producto ya no está en el catálogo (p.ej. lo borró el
// admin mientras estaba en el carrito; ver _limpiarItemsCarritoInvalidos).
function getExtrasItemPrice(c) {
  const _itemMenu = typeof MENU !== 'undefined' ? MENU.find(m => m.id == c.menuId) : null;
  const _base = _itemMenu ? _itemMenu.price : c.basePrice;
  let p = _base + (c.queso ? 1.00 : 0) + (c.gratinado ? 0.50 : 0);
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
  const item = MENU.find(m => m.id == CHEDDAR_ID);
  if (!item) return;
  const carneLabel = _cheddarCarne === 'picada' ? 'Carne Picada' : 'Carne Kebab';
  const key = 'cheddar:' + _cheddarCarne;
  if (!extrasCart[key]) {
    extrasCart[key] = {
      menuId: CHEDDAR_ID,
      qty: 0,
      queso: false,
      gratinado: false,
      key,
      basePrice: item.price,
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

// Antes esto leía discounts/<código> directamente de Firebase
// (fb_getDiscount), lo que exigía dejar ese nodo abierto a lectura pública
// para cualquiera — no solo para quien escribiera el código en la web, sino
// para cualquiera que supiera la URL de la API REST de Firebase, código a
// código, incluyendo el teléfono que ganó cada código en la ruleta/rasca
// (hallazgo de la auditoría de seguridad pre-apertura). Ahora se valida en
// el servidor (guardar-pedido.php, acción "consultarDescuento"), que solo
// devuelve el % de descuento si el código es válido.
async function dcAplicar(code) {
  if (!code) { _activeDiscount = null; renderCart(); return; }
  code = code.trim().toUpperCase();
  let data;
  try {
    // A diferencia de guardar el pedido, el SMS o pedir turno (que ya usan
    // _fetchConTimeout), esto usaba un fetch() sin límite de tiempo — si el
    // servidor se quedaba colgado sin responder (p.ej. contención del
    // límite por IP bajo carga), el campo de código se quedaba en
    // "comprobando…" para siempre, sin error ni forma de reintentar salvo
    // recargar la página entera.
    const res = await (typeof _fetchConTimeout === 'function'
      ? _fetchConTimeout('guardar-pedido.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'consultarDescuento', code })
        }, 10000)
      : fetch('guardar-pedido.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'consultarDescuento', code })
        }));
    data = await res.json();
  } catch (e) {
    showDiscountError('No se pudo comprobar el código, inténtalo de nuevo');
    return;
  }
  if (!data || !data.success) { showDiscountError((data && data.error) || 'Código no válido'); return; }
  _activeDiscount = { code, pct: data.pct };
  showDiscountOk(code, data.pct);
  renderCart();
}

function showDiscountError(msg) {
  // El cajón móvil tiene su propio campo de código (antes solo existía en
  // el panel de escritorio, oculto por CSS en móvil — ver _syncCartDrawer
  // en carrito-checkout.js) — se actualizan los dos, exista o no cada uno
  // en el DOM en este momento.
  document.querySelectorAll('#discount-feedback, #drawer-discount-feedback').forEach(el => {
    el.style.color = '#c0392b';
    el.textContent = '❌ ' + msg;
  });
  _activeDiscount = null;
  renderCart();
}

function showDiscountOk(code, pct) {
  document.querySelectorAll('#discount-feedback, #drawer-discount-feedback').forEach(el => {
    el.style.color = '#27855a';
    el.textContent = '✅ Código ' + code + ' aplicado — ' + pct + '% de descuento';
  });
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
    // Si sigue sin estar cargado (falló la descarga del HTML o del bundle
    // de ~370KB — wifi floja, subida a Hostinger a medias...), no seguir
    // abriendo un panel a medio construir con funciones que no existen
    // todavía: mejor avisar claramente y dejar que se reintente pulsando
    // otra vez, ahora que loadAdminShell() vuelve a intentar la descarga
    // en cada llamada tras un fallo (antes se quedaba roto para siempre
    // en esa sesión, sin ningún aviso).
    if (!window._adminShellLoaded) {
      showAlert('No se ha podido cargar el panel de administración (parece un problema de conexión). Vuelve a intentarlo en unos segundos.');
      return;
    }
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

// promosCart: key → { promoId, qty, extraQueso, extraGratinado, nota, key } —
// línea propia del carrito, hermana de cart/custCart/extrasCart. Se guarda
// solo el id de la promo (no una copia de nombre/precio) y se busca en
// promosLoad() en cada render/envío, igual que custCart/extrasCart buscan
// en MENU — así si el admin cambia el precio de una promo a medio pedido,
// el carrito lo refleja en vivo en vez de quedarse con un precio viejo.
const promosCart = {};
function getPromoItemPrice(c) {
  const p = promosLoad().find(function (x) { return x.id === c.promoId; });
  if (!p) return 0;
  return parseFloat(p.precio) + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
}
function removePromoItem(key) {
  delete promosCart[key];
  renderCart();
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
  if (p.opcionQueso || p.opcionGratinado || p.permiteNota) {
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

  if (p.permiteNota) {
    extrasHtml += '<div style="margin-top:12px">' +
      '<div style="font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Nota</div>' +
      '<textarea id="promo-nota" placeholder="Instrucciones especiales..." style="width:100%;padding:10px 14px;border:1.5px solid #F5E6C8;border-radius:10px;font-size:13px;font-family:DM Sans,sans-serif;resize:none;box-sizing:border-box;background:#fff;outline:none;color:#2A1506" rows="2"></textarea>' +
      '</div>';
  }

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
  // Los checkboxes de queso/gratinado los pinta promoAbrirModal() con ids
  // 'pcheck-queso'/'pcheck-gratinado' (no 'promo-check-*') y guardan su
  // estado en data-on (no data-active) — antes este desajuste hacía que
  // extraQueso/extraGratinado fueran siempre undefined, por mucho que el
  // cliente marcara las casillas.
  var quesoEl = document.getElementById('pcheck-queso');
  var gratinadoEl = document.getElementById('pcheck-gratinado');
  if (quesoEl) opts.extraQueso = quesoEl.dataset.on === '1';
  if (gratinadoEl) opts.extraGratinado = gratinadoEl.dataset.on === '1';
  var notaEl = document.getElementById('promo-nota');
  // No hay (ni conviene inventar aquí) un sistema de nota POR LÍNEA que
  // llegue al ticket/cocina — el único campo de nota que de verdad se
  // imprime es el general del pedido (#customer-notes). Para que la nota
  // de la promo no se pierda silenciosamente, se añade ahí, igual que si
  // el cliente la hubiera escrito directamente en el campo general.
  if (notaEl && notaEl.value.trim()) {
    opts.nota = notaEl.value.trim();
    var notesInput = document.getElementById('customer-notes');
    if (notesInput) {
      var prefix = p.nombre + ': ';
      notesInput.value = (notesInput.value ? notesInput.value.trim() + '\n' : '') + prefix + opts.nota;
    }
  }
  promoAddToCart(p, opts);
  document.getElementById('promo-modal-overlay').remove();
}

function promoAddToCart(p, opts) {
  var key = 'promo_' + p.id + '_' + Date.now();
  promosCart[key] = {
    promoId: p.id,
    qty: 1,
    extraQueso: !!opts.extraQueso,
    extraGratinado: !!opts.extraGratinado,
    nota: opts.nota || '',
    key: key
  };
  // (No existe ninguna función updateCart() en todo el proyecto — la
  // llamada que había aquí antes de renderCart() lanzaba un
  // ReferenceError y cortaba la ejecución antes de llegar siquiera al
  // showToast de abajo, así que "+ Añadir" nunca llegaba a confirmar nada
  // visible, aparte de escribir en el window.promoCart muerto.)
  renderCart();
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
  nif: '77558832A',
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
  // Antes esto era un fetch() sin límite de tiempo — a diferencia del
  // código de descuento manual (dcAplicar), que se blindó explícitamente
  // contra este mismo problema. Si el servidor tardaba en responder, el
  // botón se quedaba en "Girando…"/"Destapando…" para siempre, sin error
  // ni forma de reintentar salvo recargar la página entera.
  const res = await (typeof _fetchConTimeout === 'function'
    ? _fetchConTimeout('juegos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'girar', juego, telefono, token: _juegoTokenGuardado(juego) })
      }, 10000)
    : fetch('juegos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'girar', juego, telefono, token: _juegoTokenGuardado(juego) })
      }));
  return res.json();
}

function _aplicarPremioComun(juego) {
  const st = window._juegoState;
  if (juego === 'ruleta') closeRuleta(); else closeRasca();
  if (st && st.code) {
    // Antes esto aplicaba el código del premio sin comprobar si ya había
    // uno manual metido a mano — como solo hay una casilla de código a la
    // vez, si el manual tenía un % mayor se perdía en silencio (el
    // mensaje de "¡Premio aplicado!" no avisaba de que había reemplazado
    // otro código distinto). Ahora, si el que ya estaba aplicado era
    // mejor, se avisa y se deja tal cual en vez de pisarlo.
    if (_activeDiscount && _activeDiscount.code !== st.code && _activeDiscount.pct >= (st.pct || 0)) {
      showAlert('Ya tienes aplicado el código ' + _activeDiscount.code + ' (-' + _activeDiscount.pct + '%), que es igual o mejor que el premio ganado — se mantiene el que ya tenías. Tu premio de "' + st.code + '" sigue disponible: quítalo del carrito el código actual si prefieres usar el del premio.', '¡Premio ganado!');
      if (typeof openCartDrawer === 'function' && window.innerWidth <= 700) openCartDrawer();
      else { const panel = document.querySelector('.order-panel'); if (panel) panel.scrollIntoView({ behavior: 'smooth' }); }
      return;
    }
    document.querySelectorAll('#discount-input, #drawer-discount-input').forEach(input => { input.value = st.code; });
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

  // Aviso urgente si un pedido no llegó a "Pedidos en vivo" (guardar-pedido.php
  // no pudo actualizar stats/<fecha> tras varios intentos, aunque el ticket sí
  // se guardó bien) — antes esto solo subía un numerito discreto en la
  // pestaña Alertas, fácil de no ver en mitad del ajetreo de apertura. Ahora
  // suena y aparece el mismo tipo de banner grande que el de impresora
  // desconectada, hasta que se resuelva desde Alertas. Se guarda qué
  // números de pedido ya sonaron para no repetir el aviso en cada snapshot
  // (Firebase reenvía el nodo entero cada vez que cambia algo, no solo lo
  // nuevo).
  if (window.fb_listenActivityLog) {
    let _pedidosPerdidosAvisados = [];
    try { _pedidosPerdidosAvisados = JSON.parse(localStorage.getItem('dpf_pedidos_perdidos_avisados') || '[]'); } catch (e) {}
    window.fb_listenActivityLog(log => {
      if (!Array.isArray(log)) return;
      const pendientes = log.filter(e => e && e.tipo === 'pedido_no_guardado' && !e.resolved);
      const nuevos = pendientes.filter(e => e.orderNum && !_pedidosPerdidosAvisados.includes(e.orderNum));
      if (nuevos.length) {
        _pedidosPerdidosAvisados = _pedidosPerdidosAvisados.concat(nuevos.map(e => e.orderNum)).slice(-200);
        try { localStorage.setItem('dpf_pedidos_perdidos_avisados', JSON.stringify(_pedidosPerdidosAvisados)); } catch (e) {}
        if (typeof playNotificationSound === 'function') playNotificationSound('urgente');
      }
      const textoEl = document.querySelector('.pedido-perdido-aviso-texto');
      if (textoEl) {
        textoEl.textContent = pendientes.length === 1
          ? '⚠️ 1 pedido no apareció aquí — revisa la pestaña Alertas'
          : '⚠️ ' + pendientes.length + ' pedidos no aparecieron aquí — revisa la pestaña Alertas';
      }
      document.querySelectorAll('.pedido-perdido-aviso').forEach(el => {
        el.style.display = pendientes.length ? (el.dataset.showDisplay || 'block') : 'none';
      });
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
      var _document$getElementB11, _document$getElementB12;
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
            // Cada pedido se reclama por su cuenta (ver _reclamarImpresionAuto
            // en historial-export.js) — evita que dos dispositivos con
            // auto-imprimir activado impriman el mismo pedido dos veces.
            _nuevosPedidos.forEach(async o => {
              if (typeof _reclamarImpresionAuto !== 'function' || await _reclamarImpresionAuto(o.num)) {
                _autoImprimirPedido(o);
              }
            });
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

  // Estado "🖨️ Impreso" — solo lo consume el bundle admin (admin-accesos.js,
  // _markAsImpreso/_printedOrders), que puede no estar cargado todavía
  // cuando este listener se registra (se abre bajo demanda al abrir el
  // panel) — de ahí el "typeof ... === 'function'" antes de usarlo, mismo
  // patrón que el resto de listeners de este bloque.
  if (window.fb_listenPrintedOrders) {
    window.fb_listenPrintedOrders(printed => {
      if (typeof _markAsImpreso !== 'function') return;
      // El nodo se guarda con la clave normalizada (sin "T"/"#", igual que
      // orderStatus/) — todo lo demás (_printedOrders, el botón
      // data-print-num) usa el número tal cual ("T1234"), así que se
      // reconstruye anteponiendo la "T" antes de comparar/marcar.
      Object.keys(printed || {}).forEach(num => {
        const orderNum = 'T' + num;
        if (typeof _printedOrders !== 'undefined' && _printedOrders.has(orderNum)) return;
        _markAsImpreso(orderNum, true);
      });
    });
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

  // Diferencia de reloj con el servidor — ver _ahoraServidor() en carta.js.
  // Sin esto, la cuenta atrás y el precio rebajado de la oferta relámpago
  // se decidían con Date.now() del propio móvil: con el reloj mal puesto,
  // un cliente podía ver la oferta acabar antes de tiempo (perdiendo
  // minutos reales) o seguir viéndola después de que ya hubiera expirado
  // de verdad — y al confirmar, el servidor (que sí tiene la hora
  // correcta) recalculaba el precio al alza, dando una sorpresa en el
  // total frente a lo que se vio en pantalla.
  if (window.fb_listenServerTimeOffset) {
    window.fb_listenServerTimeOffset(function (offsetMs) {
      window._dpfServerTimeOffsetMs = offsetMs;
    });
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
  // Última copia confirmada por el servidor que este dispositivo ha visto
  // — saveMenu() (admin-config.js) la usa como base para saber qué
  // productos ha tocado de verdad este dispositivo desde la última
  // sincronización, al combinar con lo que haya en el servidor en ese
  // momento (evita que dos pestañas de admin editando productos distintos
  // a la vez se pisen el trabajo — mismo patrón que ya se usa para stock).
  window._menuSyncedSnapshot = JSON.parse(JSON.stringify(MENU));
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
