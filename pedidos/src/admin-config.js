// Antes, cada guardado hacia Firebase de este archivo (precio, config,
// gastos, ticket, pausa exprés...) hacía fb_save*(...).catch(() => {}) —
// si la escritura remota fallaba (wifi caído justo al pulsar), el fallo
// se tragaba en silencio: el admin ya había visto "✅ Guardado" antes
// siquiera de intentar la escritura real, así que un cambio podía quedarse
// sin aplicar indefinidamente sin que nadie se enterara (ni otros
// dispositivos ni, más importante, el propio servidor de guardar-pedido.php,
// que relee Firebase en cada pedido). Este helper deja rastro real: log en
// consola (para depurar) + un aviso visible que dice qué no se guardó.
function _avisarSiFalloGuardado(e, etiqueta) {
  console.warn('[admin-config] fallo al guardar "' + etiqueta + '" en Firebase:', e);
  if (typeof showAlert === 'function') {
    showAlert('No se ha podido sincronizar "' + etiqueta + '" con el servidor (revisa la conexión) — el cambio se ha quedado solo en este dispositivo por ahora. Vuelve a intentarlo.', 'Aviso de guardado');
  }
}

// ── PRODUCTOS (edición desde el panel) — leer/renderizar el menú para
// cualquier visitante (getSavedMenu, loadSavedMenu, renderMenu) vive ahora
// en nucleo-compartido.js. ──
// ── Botón "🔓 Marcar alérgenos quitables" de la cabecera de Patatas ──
// Marca item.ingredientesQuitables=true en TODAS las patatas de la carta
// EXCEPTO la Carbonara y la Boloñesa (nombre de excepción decidido por la
// dueña: en esas dos el alérgeno va mezclado en la propia salsa y no se
// puede sacar). Se puede pulsar de nuevo siempre que se añada una patata
// nueva o cambie algún nombre — vuelve a aplicar la regla entera de golpe,
// no hace falta ir producto por producto.
function marcarPatatasAlergenosQuitables() {
  const EXCEPCIONES = ['carbonara', 'boloñesa', 'bolognesa'];
  let cambiados = 0;
  const excluidas = [];
  MENU.forEach(item => {
    if (item.cat !== 'Patatas') return;
    const nombreLower = item.name.toLowerCase();
    const esExcepcion = EXCEPCIONES.some(ex => nombreLower.indexOf(ex) !== -1);
    if (esExcepcion) excluidas.push(item.name);
    const nuevoValor = !esExcepcion;
    if (!!item.ingredientesQuitables !== nuevoValor) {
      item.ingredientesQuitables = nuevoValor;
      cambiados++;
    }
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Actualizado — ' + cambiados + ' patata(s) cambiadas.' + (excluidas.length ? ' Sin marcar (no se pueden quitar sus alérgenos): ' + excluidas.join(', ') + '.' : '')
    : 'Ya estaba todo así — ninguna patata ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Alérgenos de las patatas');
}
// NOTA: se consideró un botón masivo "🔓 Marcar alérgenos quitables" para
// Boniato igual que el de Patatas de arriba, pero se descartó — a
// diferencia de las patatas (donde la mayoría SÍ admite quitar el queso),
// en Boniato el queso no se puede quitar en NINGÚN producto: Lotus y Bacon
// lo llevan mezclado igual que Carbonara/Boloñesa, Pistacchio tiene una
// segunda fuente de lácteos aparte del queso (la crema de pistacho, que
// también lleva leche) así que "sin queso" seguiría sin ser cierto, y
// G.O.A.T. lleva el queso de cabra en el propio nombre. Las notas de cada
// alérgeno se escriben a mano por producto desde el panel de edición en
// vez de con un botón de "aplicar a toda la categoría".
// Antes esto sobreescribía TODO config/menu con la copia local completa
// (fb_saveMenu = un set() sin más, y encima sin comprobar si la escritura
// llegaba a cuajar). Si dos pestañas de admin editaban productos distintos
// casi a la vez, la que guardaba último borraba en silencio los cambios de
// la otra — mismo patrón que ya se arregló para la lista de stock. Ahora
// usa una transacción real: si el servidor tiene algo más reciente que lo
// que este dispositivo tenía sincronizado, se combinan los dos cambios
// producto a producto (por id) en vez de que uno pise al otro entero, y si
// la escritura real falla del todo, se avisa con un mensaje claro en vez
// de dar el guardado por bueno sin más.
function saveMenu() {
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', Date.now());
  if (!window.fb_transactJsonString) {
    if (window.fb_saveMenu) window.fb_saveMenu({ items: MENU, ts: Date.now() }).catch(function (e) { _avisarSiFalloGuardado(e, 'la carta'); });
    return Promise.resolve(true);
  }
  const antesPorId = {};
  (window._menuSyncedSnapshot || []).forEach(function (i) { antesPorId[i.id] = i; });
  const localPorId = {};
  MENU.forEach(function (i) { localPorId[i.id] = i; });
  return window.fb_transactJsonString('config/menu', function (remoto) {
    const remotoItems = (remoto && Array.isArray(remoto.items)) ? remoto.items : (Array.isArray(remoto) ? remoto : []);
    const merged = {};
    const ordenIds = [];
    remotoItems.forEach(function (ri) {
      const tocadoAqui = JSON.stringify(localPorId[ri.id] || null) !== JSON.stringify(antesPorId[ri.id] || null);
      if (localPorId.hasOwnProperty(ri.id)) {
        merged[ri.id] = tocadoAqui ? localPorId[ri.id] : ri;
        ordenIds.push(ri.id);
      } else if (antesPorId.hasOwnProperty(ri.id)) {
        // Este dispositivo lo tenía y ya no lo tiene: lo borró — se respeta
        // el borrado en vez de resucitarlo con lo que traiga el servidor.
      } else {
        // Producto que otro dispositivo añadió después de la última
        // sincronización de este — se conserva.
        merged[ri.id] = ri;
        ordenIds.push(ri.id);
      }
    });
    // Productos que este dispositivo añadió y el servidor todavía no tenía.
    MENU.forEach(function (li) {
      if (!merged.hasOwnProperty(li.id)) {
        merged[li.id] = li;
        ordenIds.push(li.id);
      }
    });
    return { items: ordenIds.map(function (id) { return merged[id]; }), ts: Date.now() };
  }).then(function (finalData) {
    if (finalData && Array.isArray(finalData.items)) window._menuSyncedSnapshot = finalData.items;
    return true;
  }).catch(function (e) {
    console.warn('[saveMenu] fallo al guardar en Firebase:', e);
    if (typeof showAlert === 'function') {
      showAlert('No se ha podido guardar en el servidor (revisa la conexión). El cambio se ha quedado solo en este dispositivo por ahora — vuelve a intentarlo en unos segundos.', 'Aviso de guardado');
    }
    return false;
  });
}
// Botón temporal "💰 Aplicar precios nuevos" — subida de precios pactada
// con la dueña (agosto 2026), aplicada de una vez a los productos ya
// existentes en vez de editar 23 productos uno a uno a mano en el panel.
// Igual que marcarPatatasAlergenosQuitables(): SOLO toca el campo price
// de los productos listados (por id) y deja todo lo demás intacto — nombre,
// descripción, oculto/agotado, orden, etiquetas... — así no hay riesgo de
// deshacer alguna personalización ya hecha desde el panel. Al Gusto/Bomba
// (ids 15/16) sí están en esta lista — es el precio que se ve en su
// tarjeta de la carta antes de abrir el personalizador — pero el precio
// que de verdad se cobra al construirlas vive aparte, en CUSTOMIZER_CONFIG
// (ver src/antifraude.js), ya actualizado a mano ahí.
function aplicarPreciosNuevosAgosto2026() {
  const NUEVOS_PRECIOS = {
    2: 6.40, 3: 6.40, 4: 6.80, 5: 6.80, 6: 6.80, 7: 6.90, 8: 6.90,
    9: 7.20, 10: 7.40, 12: 7.50, 13: 7.50, 14: 7.50, 15: 7.90, 16: 9.40,
    41: 1.30, 42: 1.40, 44: 2.00, 45: 2.00, 46: 2.00, 47: 1.50, 48: 2.40, 49: 2.70,
  };
  let cambiados = 0;
  const sinCambio = [];
  MENU.forEach(item => {
    if (!Object.prototype.hasOwnProperty.call(NUEVOS_PRECIOS, item.id)) return;
    if (item.price === NUEVOS_PRECIOS[item.id]) { sinCambio.push(item.name); return; }
    item.price = NUEVOS_PRECIOS[item.id];
    cambiados++;
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Precios actualizados: ' + cambiados + ' producto(s) cambiados.' + (sinCambio.length ? ' Ya estaban al día: ' + sinCambio.join(', ') + '.' : '')
    : 'Ya estaba todo al día — ningún precio ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Precios nuevos');
}
// Subida de precio de las 7 Cookies (+1€, de 2,99€ a 3,99€) — mismo patrón
// que aplicarPreciosNuevosAgosto2026() de arriba: un botón de un solo uso
// en vez de editar 7 productos a mano, solo toca price, deja todo lo demás
// (nombre, descripción, orden...) intacto.
function aplicarPrecioCookiesNuevo() {
  const NUEVOS_PRECIOS = { 27: 3.99, 28: 3.99, 29: 3.99, 30: 3.99, 31: 3.99, 32: 3.99, 33: 3.99 };
  let cambiados = 0;
  const sinCambio = [];
  MENU.forEach(item => {
    if (!Object.prototype.hasOwnProperty.call(NUEVOS_PRECIOS, item.id)) return;
    if (item.price === NUEVOS_PRECIOS[item.id]) { sinCambio.push(item.name); return; }
    item.price = NUEVOS_PRECIOS[item.id];
    cambiados++;
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Precios actualizados: ' + cambiados + ' cookie(s) a 3,99€.' + (sinCambio.length ? ' Ya estaban al día: ' + sinCambio.join(', ') + '.' : '')
    : 'Ya estaba todo al día — ningún precio ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Precio de Cookies');
}
function renderAdminProducts() {
  const cats = [...new Set(MENU.map(i => i.cat))];
  const emojiMapAdmin = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  let html = '';
  cats.forEach(cat => {
    const catEmoji = emojiMapAdmin[cat] || '';
    // Botón masivo solo en "Patatas" — ver marcarPatatasAlergenosQuitables:
    // en vez de tener que marcar el interruptor "se pueden quitar" patata
    // por patata, este botón lo activa de golpe para toda la categoría
    // excepto la Carbonara y la Boloñesa (regla que dio la dueña: en esas
    // dos el alérgeno viene ya mezclado en la salsa, no se puede sacar).
    // NO hay botón equivalente en "Boniato": ahí ningún producto tiene el
    // queso realmente quitable (ver nota junto a marcarPatatasAlergenosQuitables
    // más arriba), así que un botón "de golpe" ahí solo invitaría a marcar
    // algo mal — las notas de Boniato se escriben a mano, producto a producto.
    const catBulkBtn = (cat === 'Patatas')
      ? '<button onclick="marcarPatatasAlergenosQuitables()" style="background:var(--gold);color:#3D1F0D;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🔓 Marcar alérgenos quitables</button>'
      : '';
    html += "<p style=\"display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:Anton,sans-serif;font-size:19px;font-weight:400;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;margin:16px 0 8px;padding:8px 14px;border-radius:8px\"><span>".concat(catEmoji ? catEmoji + ' ' : '', cat, "</span>").concat(catBulkBtn, "</p>");
    let lastTartaSub = null;
    MENU.filter(i => i.cat === cat).forEach(item => {
      const visible = item.hidden ? 'off' : 'on';
      const soldout = item.soldout ? true : false;
      let tartaSep = '';
      if (cat === 'Tartas') {
        const isClasica = item.desc && item.desc.toLowerCase().indexOf('clásica') !== -1;
        const isEspecial = item.desc && item.desc.toLowerCase().indexOf('especial') !== -1;
        if (isClasica && lastTartaSub !== 'clasica') {
          lastTartaSub = 'clasica';
          tartaSep = '<div class="tarta-subsep tarta-subsep-clasica">CLÁSICAS</div>';
        } else if (isEspecial && lastTartaSub !== 'especial') {
          lastTartaSub = 'especial';
          tartaSep = '<div class="tarta-subsep tarta-subsep-especial">ESPECIALES</div>';
        }
      }
      html += tartaSep + "\n      <div class=\"admin-product-row\" id=\"arow-".concat(item.id, "\"\n        ondragover=\"dragOver(event)\" ondrop=\"dragDrop(event,").concat(item.id, ")\" ondragleave=\"dragLeave(event)\">\n        <span class=\"drag-handle\" draggable=\"true\" title=\"Arrastrar para reordenar\"\n          ondragstart=\"dragStart(event,").concat(item.id, ")\">⠿</span>\n        <div class=\"aprod-info\">\n          <div class=\"aprod-name\" style=\"").concat(soldout ? 'text-decoration:line-through;color:#8A6A4E' : '', "\">").concat(formatNombreConBadgeNuevo(item.name), dietaryTagsHtml(item), "</div>\n          <div class=\"aprod-desc\">").concat(item.desc, "</div>\n          ").concat(soldout ? '<span class="soldout-badge">AGOTADO</span>' : '', "\n        \n        </div>\n        <span class=\"aprod-price\">").concat(item.price.toFixed(2), " €</span>\n        <div class=\"btn-row\">\n        <button class=\"admin-edit-btn\" onclick=\"toggleEditPanel(").concat(item.id, ")\">✏️ Editar</button>\n        <button class=\"aprod-toggle-text ").concat(soldout ? 'off' : 'on', "\" id=\"sold-").concat(item.id, "\" onclick=\"toggleSoldout(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(soldout ? '#c0392b' : '#5ECC76', ";color:#fff\">").concat(soldout ? 'Agotado' : 'Disponible', "</button>\n        <button class=\"aprod-toggle-text ").concat(visible, "\" id=\"tog-").concat(item.id, "\" onclick=\"toggleProduct(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(visible === 'on' ? '#5ECC76' : '#aaa', ";color:#fff\">").concat(visible === 'on' ? 'Visible' : 'Oculto', "</button>\n        </div>\n      </div>\n      <div id=\"edit-").concat(item.id, "\" style=\"display:none;flex-direction:column;background:rgba(244,196,48,0.08);border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;margin:-4px 0 8px\">\n        <input type=\"text\" value=\"").concat(item.name.replace(/"/g, '&quot;'), "\" id=\"edit-name-").concat(item.id, "\" placeholder=\"Nombre\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"text\" value=\"").concat(item.desc.replace(/"/g, '&quot;'), "\" id=\"edit-desc-").concat(item.id, "\" placeholder=\"Descripci\xF3n\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"number\" value=\"").concat(item.price.toFixed(2), "\" id=\"edit-price-").concat(item.id, "\" step=\"0.10\" min=\"0\" placeholder=\"Precio (€)\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        ").concat(_tagCheckboxesHtml(item), "\n        <div style=\"display:flex\">\n          <button class=\"admin-save-btn\" onclick=\"saveProductEdit(").concat(item.id, ")\" style=\"flex:1\">✅ Guardar</button>\n          <button class=\"admin-save-btn\" onclick=\"confirmDeleteProduct(").concat(item.id, ",'").concat(item.name.replace(/'/g, "\\'"), "')\" style=\"background:#c0392b;flex:1\">🗑️ Eliminar</button>\n        </div>\n      </div>");
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
}
// ── Alérgenos del producto (los 14 de declaración obligatoria — ver
// DIETARY_TAGS en carta.js). Marca los que el producto SÍ contiene, y
// opcionalmente añade una nota (ej. "por el queso, se puede quitar") para
// cuando ese alérgeno concreto viene de un ingrediente que no es fijo —
// sale al pasar el ratón por encima de la insignia en la carta real, en
// vez de dar a entender que el producto SIEMPRE lo lleva.
function _tagCheckboxesHtml(item) {
  const seleccionadas = Array.isArray(item.tags) ? item.tags : [];
  const notas = (item.tagNotes && typeof item.tagNotes === 'object') ? item.tagNotes : {};
  const quitables = !!item.ingredientesQuitables;
  const checkboxes = DIETARY_TAGS.map(t => {
    const checked = seleccionadas.indexOf(t.id) !== -1;
    const icono = t.img
      ? '<img class="allergen-icon-img" src="' + t.img + '" alt="" onerror="_alergenoImgFallback(this,\'' + t.id + '\')">'
      : _alergenoEmojiSpan(t);
    return '<label style="display:flex;align-items:center;gap:5px;font-size:12px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:5px 9px;cursor:pointer">'
      + '<input type="checkbox" id="edit-tag-' + t.id + '-' + item.id + '"' + (checked ? ' checked' : '') + ' onchange="_toggleTagNotaVisible(' + item.id + ',\'' + t.id + '\')" style="margin:0">'
      + icono
      + t.label
      + '</label>';
  }).join('');
  const notasInputs = DIETARY_TAGS.map(t => {
    const checked = seleccionadas.indexOf(t.id) !== -1;
    const val = (notas[t.id] || '').replace(/"/g, '&quot;');
    return '<input type="text" id="edit-tagnota-' + t.id + '-' + item.id + '" value="' + val + '"'
      + ' placeholder="Nota sobre ' + t.label + ' (solo si es distinto del resto — ej: no se puede quitar aunque los demás sí)"'
      + ' style="display:' + (checked ? 'block' : 'none') + ';width:100%;box-sizing:border-box;padding:6px 9px;margin-bottom:4px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:11.5px;font-family:\'DM Sans\',sans-serif;background:#fff;color:#2A1506">';
  }).join('');
  // Interruptor general del producto: si está activado, TODOS los
  // alérgenos marcados arriba avisan de que se pueden pedir sin ellos
  // (mensaje genérico automático) — sin tener que escribir la misma nota
  // en cada uno. El cuadro de texto de arriba solo hace falta para la
  // excepción contraria (un alérgeno que NO se pueda quitar aunque el
  // resto del producto sí lo permita, p.ej. si viniera ya mezclado en la salsa).
  const quitableToggle = '<label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#2A1506;background:#FDECD5;border:1.5px solid #F4C430;border-radius:8px;padding:7px 10px;margin:2px 0 8px;cursor:pointer">'
    + '<input type="checkbox" id="edit-quitables-' + item.id + '"' + (quitables ? ' checked' : '') + ' style="margin:0">'
    + '🔓 Los ingredientes con alérgeno de este producto se pueden pedir sin ellos'
    + '</label>';
  return '<div style="font-size:11px;font-weight:700;color:#8A6A4E;margin:2px 0 4px">Contiene (alérgenos):</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px">' + checkboxes + '</div>'
    + quitableToggle
    + '<div>' + notasInputs + '</div>';
}
function _toggleTagNotaVisible(itemId, tagId) {
  const cb = document.getElementById('edit-tag-' + tagId + '-' + itemId);
  const nota = document.getElementById('edit-tagnota-' + tagId + '-' + itemId);
  if (cb && nota) nota.style.display = cb.checked ? 'block' : 'none';
}
function toggleEditPanel(id) {
  const panel = document.getElementById('edit-' + id);
  if (!panel) return;
  const isOpen = panel.style.display === 'flex';
  // Cerrar todos los paneles abiertos
  document.querySelectorAll('[id^="edit-"]').forEach(p => {
    if (p.tagName === 'DIV') p.style.display = 'none';
  });
  if (!isOpen) {
    panel.style.display = 'flex';
    const firstInput = panel.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
}
function saveProductEdit(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  const nameEl = document.getElementById('edit-name-' + id);
  const descEl = document.getElementById('edit-desc-' + id);
  const priceEl = document.getElementById('edit-price-' + id);
  if (nameEl && nameEl.value.trim()) {
    const nuevoNombre = nameEl.value.trim();
    const nombreLower = nuevoNombre.toLowerCase();
    if (MENU.some(m => m.id != id && m.name.trim().toLowerCase() === nombreLower)) {
      alert('Ya existe otro producto con ese nombre — el servidor valida el precio de un pedido buscando por nombre exacto, así que dos productos no pueden compartirlo.');
      return;
    }
    item.name = nuevoNombre;
  }
  if (descEl) item.desc = descEl.value.trim();
  if (priceEl) {
    // parseFloat(val) || item.price solo protegía contra NaN/0 (0 es
    // falsy) — un precio negativo como -5 es truthy en JS y se colaba tal
    // cual, aunque el input tenga min="0" (el HTML no bloquea nada si el
    // JS lee .value directamente sin comprobar el propio valor).
    const nuevoPrecio = parseFloat(priceEl.value);
    if (!isNaN(nuevoPrecio) && nuevoPrecio >= 0) item.price = nuevoPrecio;
  }
  item.tags = DIETARY_TAGS.filter(t => {
    const cb = document.getElementById('edit-tag-' + t.id + '-' + id);
    return cb && cb.checked;
  }).map(t => t.id);
  const tagNotes = {};
  DIETARY_TAGS.forEach(t => {
    if (item.tags.indexOf(t.id) === -1) return;
    const notaEl = document.getElementById('edit-tagnota-' + t.id + '-' + id);
    const val = notaEl ? notaEl.value.trim() : '';
    if (val) tagNotes[t.id] = val;
  });
  item.tagNotes = Object.keys(tagNotes).length ? tagNotes : undefined;
  const quitablesEl = document.getElementById('edit-quitables-' + id);
  item.ingredientesQuitables = !!(quitablesEl && quitablesEl.checked);
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("✏️ Producto editado: \"".concat(item.name, "\" — ").concat(item.price.toFixed(2), " €"));
}
function toggleProduct(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.hidden = !item.hidden;
  const btn = document.getElementById('tog-' + id);
  if (btn) {
    btn.style.background = item.hidden ? '#aaa' : '#5ECC76';
    btn.textContent = item.hidden ? 'Oculto' : 'Visible';
  }
  saveMenu();
  renderMenu();
  showToast('prod-toast');
  logActivity("👁️ Producto ".concat(item.hidden ? 'ocultado' : 'mostrado', ": \"").concat(item.name, "\""));
}
function toggleSoldout(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.soldout = !item.soldout;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("🚫 Producto ".concat(item.soldout ? 'marcado agotado' : 'disponible de nuevo', ": \"").concat(item.name, "\""));
}

// ── CONFIRM MODAL ──
let _confirmCallback = null;
function showConfirm(title, msg, okLabel, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const okBtn = document.getElementById('confirm-ok-btn');
  okBtn.textContent = okLabel || 'Confirmar';
  _confirmCallback = cb;
  okBtn.onclick = () => {
    closeConfirm();
    if (_confirmCallback) _confirmCallback();
  };
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('open');
}
function confirmDeleteProduct(id, name) {
  showConfirm('¿Eliminar producto?', "\"".concat(name, "\" se eliminar\xE1 de la carta permanentemente."), '🗑️ Eliminar', () => {
    const idx = MENU.findIndex(m => m.id == id);
    if (idx >= 0) MENU.splice(idx, 1);
    saveMenu();
    initTabs();
    renderMenu();
    renderAdminProducts();
    showToast('prod-toast');
  });
}

// ── DRAG & DROP REORDER ──
let _dragId = null;
function dragStart(event, id) {
  _dragId = id;
  event.dataTransfer.effectAllowed = 'move';
  event.stopPropagation();
  const row = document.getElementById('arow-' + id);
  if (row) setTimeout(() => row.classList.add('dragging'), 0);
}
function dragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const row = event.currentTarget;
  if (row) row.style.background = 'rgba(244,196,48,0.08)';
}
function dragLeave(event) {
  const row = event.currentTarget;
  if (row) row.style.background = '';
}
function dragDrop(event, targetId) {
  event.preventDefault();
  const row = event.currentTarget;
  if (row) row.style.background = '';
  if (_dragId === targetId) {
    _dragId = null;
    return;
  }
  const fromIdx = MENU.findIndex(m => m.id == _dragId);
  const toIdx = MENU.findIndex(m => m.id == targetId);
  if (fromIdx < 0 || toIdx < 0) {
    _dragId = null;
    return;
  }
  const _MENU$splice = MENU.splice(fromIdx, 1),
    _MENU$splice2 = _slicedToArray(_MENU$splice, 1),
    moved = _MENU$splice2[0];
  MENU.splice(toIdx, 0, moved);
  _dragId = null;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
}

// ── BACKUP / RESTORE JSON ──
function exportMenuJSON() {
  const blob = new Blob([JSON.stringify(MENU, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'carta_dulce_patata.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importMenuJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      var _data$;
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data) || !((_data$ = data[0]) !== null && _data$ !== void 0 && _data$.name)) {
        alert('Archivo inválido');
        return;
      }
      showConfirm('¿Importar carta?', "Se reemplazar\xE1 la carta actual con ".concat(data.length, " productos del archivo."), '⬆️ Importar', () => {
        MENU.length = 0;
        data.forEach(i => MENU.push(i));
        saveMenu();
        initTabs();
        renderMenu();
        renderAdminProducts();
        showToast('prod-toast');
      });
    } catch {
      alert('Error al leer el archivo JSON');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
async function addSection() {
  const input = document.getElementById('new-section-name');
  const cat = input ? input.value.trim() : '';
  if (!cat) { alert('Escribe el nombre de la categoría'); return; }
  // Comparación sin distinguir mayúsculas/minúsculas — "Bebidas" y
  // "bebidas" antes se trataban como categorías distintas, generando dos
  // secciones que en la carta pueden confundirse como si fueran la misma
  // mal escrita.
  const catLower = cat.toLowerCase();
  if (MENU.some(i => i.cat.toLowerCase() === catLower)) { alert('Esa categoría ya existe'); return; }
  // Añadir producto placeholder oculto para crear la categoría — el ID se
  // reserva dentro de la misma transacción que lo escribe (ver
  // _menuAgregarItemTransaccion), no calculado antes a partir de la copia
  // local: dos pestañas de admin creando una categoría casi a la vez antes
  // podían calcular el mismo ID nuevo y acabar con dos productos distintos
  // compartiendo id (uno "desaparecía" al guardar el segundo).
  const nuevo = await _menuAgregarItemTransaccion(function (id) {
    return { id, cat, name: '(producto de ejemplo)', desc: '', price: 0, hidden: true };
  }, cat);
  if (!nuevo) return; // fallo de guardado, ya avisado dentro
  initTabs();
  renderMenu();
  renderAdminProducts();
  if (input) input.value = '';
  showToast('section-toast');
  logActivity('📂 Nueva categoría creada: ' + cat);
}
// Añade un producto nuevo con su id reservado de forma atómica: el
// callback `build(id)` recibe el próximo id ya calculado a partir del
// estado MÁS FRESCO del servidor (no de la copia local, que puede estar
// desactualizada) y devuelve el item completo. Si Firebase no está
// disponible, cae al cálculo local de toda la vida (mismo comportamiento
// que antes). Devuelve el item ya insertado en MENU, o null si falló el
// guardado (con el aviso ya mostrado).
async function _menuAgregarItemTransaccion(build, cat) {
  let nuevoItem = null;
  if (window.fb_transactJsonString) {
    try {
      const finalData = await window.fb_transactJsonString('config/menu', function (remoto) {
        const remotoItems = (remoto && Array.isArray(remoto.items)) ? remoto.items : (Array.isArray(remoto) ? remoto : []);
        const idsRemotos = remotoItems.map(function (i) { return i.id; });
        const idsLocales = MENU.map(function (i) { return i.id; });
        const nuevoId = Math.max(0, ...idsRemotos, ...idsLocales) + 1;
        nuevoItem = build(nuevoId);
        const arr = remotoItems.slice();
        let lastIdx = -1;
        for (let i = 0; i < arr.length; i++) { if (arr[i].cat === cat) lastIdx = i; }
        if (lastIdx === -1) arr.push(nuevoItem); else arr.splice(lastIdx + 1, 0, nuevoItem);
        return { items: arr, ts: Date.now() };
      });
      if (finalData && Array.isArray(finalData.items)) window._menuSyncedSnapshot = finalData.items;
    } catch (e) {
      console.warn('[addProduct] fallo al guardar en Firebase:', e);
      if (typeof showAlert === 'function') showAlert('No se ha podido crear en el servidor (revisa la conexión) — inténtalo de nuevo.', 'Aviso de guardado');
      return null;
    }
  } else {
    const newId = Math.max(0, ...MENU.map(function (i) { return i.id; })) + 1;
    nuevoItem = build(newId);
  }
  let lastIdx = -1;
  for (let i = 0; i < MENU.length; i++) { if (MENU[i].cat === cat) lastIdx = i; }
  if (lastIdx === -1) MENU.push(nuevoItem); else MENU.splice(lastIdx + 1, 0, nuevoItem);
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', Date.now());
  return nuevoItem;
}
function newCatSelectChange(sel) {
  const input = document.getElementById('new-cat-nombre');
  if (!input) return;
  if (sel.value === '__nueva__') {
    input.style.display = 'block';
    setTimeout(() => input.focus(), 100);
  } else {
    input.style.display = 'none';
    input.value = '';
  }
}
async function addProduct() {
  const name = document.getElementById('new-name').value.trim();
  const desc = document.getElementById('new-desc').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  let cat = document.getElementById('new-cat').value;
  if (cat === '__nueva__') {
    const inputNueva = document.getElementById('new-cat-nombre');
    cat = inputNueva ? inputNueva.value.trim() : '';
    if (!cat) { alert('Escribe el nombre de la nueva categoría'); return; }
  }
  if (!name || !cat || isNaN(price) || price < 0) {
    alert('Rellena nombre, categoría y precio (0 o mayor)');
    return;
  }
  // El servidor valida el precio de un pedido buscando el producto por
  // NOMBRE exacto (corregirPreciosCatalogo) — dos productos con el mismo
  // nombre harían que esa comprobación mirara el precio equivocado.
  if (MENU.some(i => i.name.trim().toLowerCase() === name.toLowerCase())) {
    alert('Ya existe un producto con ese nombre — usa uno distinto (aunque sea con un matiz) para que el servidor pueda identificarlo bien al validar el precio.');
    return;
  }
  const nuevoItem = await _menuAgregarItemTransaccion(function (id) {
    return { id, cat, name, desc, price };
  }, cat);
  if (!nuevoItem) return; // fallo de guardado, ya avisado dentro
  initTabs();
  renderMenu();
  renderAdminProducts();
  document.getElementById('new-name').value = '';
  document.getElementById('new-desc').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-cat').value = '';
  const nci = document.getElementById('new-cat-nombre');
  if (nci) { nci.value = ''; nci.style.display = 'none'; }
  showToast('prod-toast');
  logActivity("➕ Producto nuevo: \"".concat(name, "\" — ").concat(price.toFixed(2), " €"));
}

// ── CONFIG (email del local) — el envío de aviso por EmailJS que usaba
// esto se quitó a petición de la dueña (plantilla caducada/borrada en
// EmailJS, fallando en cada pedido; "Pedidos en vivo" + el panel ya avisan
// de sobra sin depender de un tercero externo). Se deja el campo del email
// del local por si sirve para algo más adelante, pero ya no dispara nada.
function loadAdminConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
  } catch {}
  if (window.fb_loadConfig) {
    window.fb_loadConfig().then(c => {
      if (!c) return;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
      Object.assign(CONFIG, c);
      try {
        document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
      } catch {}
    }).catch(() => {});
  }
}
function saveConfig() {
  // Fusionar con lo ya guardado (en vez de sobreescribir todo el objeto)
  // para no perder otros ajustes guardados bajo la misma clave, como
  // modifyWindowMins.
  let c = {};
  try { c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch {}
  c.store_email = document.getElementById('cfg-email').value.trim();
  localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  Object.assign(CONFIG, c);
  if (window.fb_saveConfig) window.fb_saveConfig(c).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración general'); });
  showToast('cfg-toast');
}

// ── HORARIO (edición desde el panel) — updateFooterHorario/diasLabel/
// DIAS_RANGES viven en nucleo-compartido.js porque también los usa el
// flujo de cliente (footer, aviso de cierre). ──
const DIAS_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function toggleDia(btn) {
  btn.classList.toggle('activo');
}
function verDiasGuardados() {
  const NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const raw = localStorage.getItem('dpf_horario');
  const el = document.getElementById('dias-diagnostico');
  if (!el) return;
  let html = '';
  if (!raw) {
    html = '⚠️ Sin configuración guardada — se usan valores por defecto (Mar–Dom)<br>';
  } else {
    try {
      const h = JSON.parse(raw);
      const dias = h.diasAbiertos;
      const hoy = new Date().getDay();
      if (!dias || !dias.length) {
        html += '⚠️ diasAbiertos vacío → cerrado todos los días<br>';
      } else {
        html += '✅ Días: ' + dias.map(d => NOMBRES[d] + '(' + d + ')').join(', ') + '<br>';
        html += (dias.includes(hoy) ? '✅' : '❌') + ' Hoy es ' + NOMBRES[hoy] + '(' + hoy + ') → ' + (dias.includes(hoy) ? 'día abierto' : 'día CERRADO') + '<br>';
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const sessions = [{
        label: 'Mañanas',
        open: h.manOpen,
        close: h.manClose
      }, {
        label: 'Tardes',
        open: h.tarOpen,
        close: h.tarClose
      }].filter(s => s.open && s.close);
      if (!sessions.length) {
        html += '⚠️ Sin horario configurado<br>';
      } else {
        sessions.forEach(s => {
          const _s$open$split$map = s.open.split(':').map(Number),
            _s$open$split$map2 = _slicedToArray(_s$open$split$map, 2),
            oh = _s$open$split$map2[0],
            om = _s$open$split$map2[1];
          const _s$close$split$map = s.close.split(':').map(Number),
            _s$close$split$map2 = _slicedToArray(_s$close$split$map, 2),
            ch = _s$close$split$map2[0],
            cm = _s$close$split$map2[1];
          const oMin = oh * 60 + om,
            cMin = ch * 60 + cm;
          const dentro = nowMin >= oMin && nowMin < cMin;
          html += (dentro ? '✅' : '⏰') + ' ' + s.label + ': ' + s.open + '–' + s.close + (dentro ? ' ← AHORA ABIERTO' : '') + '<br>';
        });
        html += '🕐 Hora actual: ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      }
    } catch (e) {
      html = '❌ Error: ' + e.message;
    }
  }
  el.innerHTML = html;
}
function resetDiasMartDom() {
  if (!confirm('¿Resetear los días abiertos a Martes–Domingo y guardar?')) return;
  const raw = localStorage.getItem('dpf_horario');
  let h = {};
  try {
    h = JSON.parse(raw || '{}');
  } catch {}
  h.diasAbiertos = [2, 3, 4, 5, 6, 0]; // Mar, Mié, Jue, Vie, Sáb, Dom
  localStorage.setItem('dpf_horario', JSON.stringify(h));
  if (window.fb_saveHorario) {
    window.fb_saveHorario(h).catch(e => console.warn('Error guardando horario en Firebase:', e));
  }
  loadAdminHorario();
  verDiasGuardados();
  showToast('local-toast');
  logActivity('🕐 Días reseteados a Martes–Domingo');
}
function _applyHorarioToUI(h) {
  if (!h) return;
  if (h.manOpen) document.getElementById('h-man-open').value = h.manOpen;
  if (h.manClose) document.getElementById('h-man-close').value = h.manClose;
  if (h.tarOpen) document.getElementById('h-tar-open').value = h.tarOpen;
  if (h.tarClose) document.getElementById('h-tar-close').value = h.tarClose;
  const closedMsgMidEl = document.getElementById('h-closed-msg-mid');
  const closedMsgNightEl = document.getElementById('h-closed-msg-night');
  const closedMsgDayEl = document.getElementById('h-closed-msg-day');
  if (closedMsgMidEl && h.closedMsgMid) closedMsgMidEl.value = h.closedMsgMid;
  if (closedMsgNightEl && h.closedMsgNight) closedMsgNightEl.value = h.closedMsgNight;
  if (closedMsgDayEl && h.closedMsgDay) closedMsgDayEl.value = h.closedMsgDay;
  const diasActivos = h.diasAbiertos && h.diasAbiertos.length ? h.diasAbiertos : [2, 3, 4, 5, 6, 0];
  const marcarDias = () => {
    document.querySelectorAll('.dia-btn').forEach(btn => {
      btn.classList.toggle('activo', diasActivos.includes(parseInt(btn.dataset.day)));
    });
  };
  marcarDias();
  setTimeout(marcarDias, 100);
}
function loadAdminHorario() {
  // Cargar inmediatamente desde localStorage (respuesta rápida)
  try {
    const hLocal = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    _applyHorarioToUI(hLocal);
  } catch (e) {}
  // Luego cargar desde Firebase (fuente de verdad) y sobreescribir si hay datos
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
        _applyHorarioToUI(hFb);
        loadOrdersStatus(); // re-evaluar apertura con el horario correcto
        updateFooterHorario(hFb);
      }
    }).catch(e => console.warn('Error cargando horario de Firebase:', e));
  }
  loadSlotTurnosUI();
  verDiasGuardados();
}
function saveHorario() {
  let diasAbiertos = [];
  document.querySelectorAll('.dia-btn.activo').forEach(btn => {
    diasAbiertos.push(parseInt(btn.dataset.day));
  });
  // Si no hay ningún día marcado, conservar los guardados anteriormente o usar Mar-Dom
  if (!diasAbiertos.length) {
    try {
      const prev = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
      diasAbiertos = prev.diasAbiertos && prev.diasAbiertos.length ? prev.diasAbiertos : [2, 3, 4, 5, 6, 0];
    } catch {
      diasAbiertos = [2, 3, 4, 5, 6, 0];
    }
  }
  const manOpen = document.getElementById('h-man-open') ? document.getElementById('h-man-open').value : '';
  const manClose = document.getElementById('h-man-close') ? document.getElementById('h-man-close').value : '';
  const tarOpen = document.getElementById('h-tar-open') ? document.getElementById('h-tar-open').value : '';
  const tarClose = document.getElementById('h-tar-close') ? document.getElementById('h-tar-close').value : '';
  const closedMsgMid = document.getElementById('h-closed-msg-mid') ? document.getElementById('h-closed-msg-mid').value.trim() : '';
  const closedMsgNight = document.getElementById('h-closed-msg-night') ? document.getElementById('h-closed-msg-night').value.trim() : '';
  const closedMsgDay = document.getElementById('h-closed-msg-day') ? document.getElementById('h-closed-msg-day').value.trim() : '';
  const h = {
    manOpen,
    manClose,
    tarOpen,
    tarClose,
    diasAbiertos,
    closedMsgMid,
    closedMsgNight,
    closedMsgDay
  };
  localStorage.setItem(HORARIO_KEY, JSON.stringify(h));
  // Guardar también en Firebase para sincronizar con otros dispositivos y cuentas
  if (window.fb_saveHorario) {
    window.fb_saveHorario(h).catch(e => console.warn("Error guardando horario en Firebase:", e));
  }
  updateFooterHorario(h);
  showToast('local-toast');
  verDiasGuardados();
  logActivity('🕐 Horario actualizado — Días: ' + diasAbiertos.map(d => DIAS_NAMES[d]).join(', '));
}

// ── ABIERTO/CERRADO (acción manual de admin; updateOpenBtn/updateHeroDot
// viven en nucleo-compartido.js porque también los usa el flujo de
// cliente) ──
function loadOpenStatus() {
  const open = localStorage.getItem(OPEN_KEY) !== 'false';
  updateOpenBtn(open);
  if (window.fb_loadOpenLocal) {
    window.fb_loadOpenLocal().then(val => {
      if (val === null || val === undefined) return;
      localStorage.setItem(OPEN_KEY, String(val));
      const openBool = val === true || val === 'true';
      updateOpenBtn(openBool);
      updateHeroDot(openBool);
    }).catch(() => {});
  }
}
function toggleOrdersAccepting() {
  const next = !getOrdersOpen();
  localStorage.setItem(ORDERS_KEY, next);
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
  // Toggle manual → la auto-pausa se aparta 30 min y no reabre/cierra por su
  // cuenta encima de esta decisión (mismo mecanismo que activarFinDeNoche,
  // con un cooldown más corto porque esto es una pausa del día a día, no un
  // cierre de jornada).
  if (typeof _setAutoPausaEstado === 'function') _setAutoPausaEstado(false, Date.now() + 30 * 60 * 1000);
  updateOrdersUI(next);
  logActivity("🚦 Pedidos: ".concat(next ? 'ACTIVADOS' : 'PAUSADOS'));
}
function toggleOpenStatus() {
  const current = localStorage.getItem(OPEN_KEY) !== 'false';
  const next = !current;
  localStorage.setItem(OPEN_KEY, String(next));
  if (!next) {
    localStorage.setItem('dpf_open_manual_override', '1');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(function (e) { _avisarSiFalloGuardado(e, 'estado abierto/cerrado'); });
    firebase.database().ref('config/openManualOverride').set(true).catch(() => {});
  } else {
    localStorage.removeItem('dpf_open_manual_override');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(function (e) { _avisarSiFalloGuardado(e, 'estado abierto/cerrado'); });
    firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
  }
  updateOpenBtn(next);
  updateHeroDot(next);
  logActivity("🏪 Local marcado como: ".concat(next ? 'ABIERTO' : 'CERRADO'));
}

// ── GASTOS DE GESTIÓN (guardar desde el panel) ──
function saveFeeConfig(enabled, amount, label) {
  localStorage.setItem(FEE_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE_LABEL_KEY, label);
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function (e) { _avisarSiFalloGuardado(e, 'gastos de gestión'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Gastos de gestión ' + (enabled ? 'activados' : 'desactivados') + ' — ' + amount.toFixed(2) + '€');
}

// ── SEGUNDO GASTO FIJO (guardar desde el panel) ──
function saveFee2Config(enabled, amount, label) {
  localStorage.setItem(FEE2_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE2_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE2_LABEL_KEY, label);
  if (window.fb_saveFee2Config) window.fb_saveFee2Config(enabled, amount, label).catch(function (e) { _avisarSiFalloGuardado(e, 'segundo gasto de gestión'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Otro gasto fijo ' + (enabled ? 'activado' : 'desactivado') + ' — ' + amount.toFixed(2) + '€');
}

// ── DESCUENTO ESTUDIANTE/JUBILADO (guardar desde el panel) ──
function saveStudentDiscountConfig(enabled, pct) {
  localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(pct));
  if (window.fb_saveStudentDiscountConfig) window.fb_saveStudentDiscountConfig(enabled, pct).catch(function (e) { _avisarSiFalloGuardado(e, 'descuento estudiante/jubilado'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Descuento estudiante/jubilado ' + (enabled ? 'activado' : 'desactivado') + ' — ' + pct + '%');
}

// ── CÓDIGO "PEDIDO DESDE EL LOCAL" (guardar/generar desde el panel) ──
function saveLocalFeeCode(code) {
  const clean = (code || '').trim().toUpperCase();
  localStorage.setItem(LOCAL_FEE_CODE_KEY, clean);
  if (window.fb_saveLocalFeeCode) window.fb_saveLocalFeeCode(clean).catch(function (e) { _avisarSiFalloGuardado(e, 'código de pedido desde el local'); });
  logActivity(clean ? ('🏪 Código "pedido desde el local" actualizado: ' + clean) : '🏪 Código "pedido desde el local" desactivado');
}
function generarCodigoLocalNuevo() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const input = document.getElementById('tc-local-fee-code');
  if (input) input.value = code;
  return code;
}

// ── TIEMPO DE ESPERA ENTRE TICKETS DEL LOCAL (guardar desde el panel) ──
function saveTiendaEsperaMinutos(min) {
  const val = parseInt(min, 10) || 0;
  localStorage.setItem(TIENDA_ESPERA_KEY, String(val));
  if (window.fb_saveTiendaEsperaMinutos) window.fb_saveTiendaEsperaMinutos(val).catch(function (e) { _avisarSiFalloGuardado(e, 'tiempo de espera en tienda'); });
  logActivity('⏱️ Tiempo de espera entre tickets del local: ' + (val ? (val + ' min') : 'desactivado'));
}

// ═══════════════════════════════════════════════════════════
//  AUTO-PAUSA POR SATURACIÓN Y AVISO PREVIO — configuración y evaluación,
//  todo cosa de admin/cocina (ver comentario largo original: quien decide
//  esto es siempre una sesión de admin). El estado PÚBLICO que sí lee
//  cualquier cliente (avisoSaturacionEstado, vía loadAvisoSaturacionFromFirebase)
//  vive en nucleo-compartido.js.
// ═══════════════════════════════════════════════════════════
const AUTO_PAUSA_CONFIG_KEY = 'dpf_auto_pausa_config';
function getAutoPausaConfig() {
  try { return JSON.parse(localStorage.getItem(AUTO_PAUSA_CONFIG_KEY) || '{}'); } catch { return {}; }
}
function saveAutoPausaConfig(enabled, umbral, msg) {
  const cfg = { enabled: !!enabled, umbral: Math.max(1, parseInt(umbral, 10) || 15), msg: msg || '🔥 Estamos a tope ahora mismo. Vuelve a intentarlo en unos minutos.' };
  localStorage.setItem(AUTO_PAUSA_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveAutoPausaConfig) window.fb_saveAutoPausaConfig(cfg.enabled, cfg.umbral, cfg.msg).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración de auto-pausa'); });
  logActivity((cfg.enabled ? '✅' : '⛔') + ' Auto-pausa por saturación ' + (cfg.enabled ? 'activada' : 'desactivada') + ' — a partir de ' + cfg.umbral + ' pedidos pendientes');
}
function loadAutoPausaConfigFromFirebase() {
  if (!window.fb_listenAutoPausaConfig) return;
  window.fb_listenAutoPausaConfig(function (cfg) {
    localStorage.setItem(AUTO_PAUSA_CONFIG_KEY, JSON.stringify(cfg || {}));
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  });
}

const AUTO_PAUSA_ESTADO_KEY = 'dpf_auto_pausa_estado';
function getAutoPausaEstado() {
  try { return JSON.parse(localStorage.getItem(AUTO_PAUSA_ESTADO_KEY) || '{}'); } catch { return {}; }
}
function _setAutoPausaEstado(activa, cooldownUntil) {
  const estado = { activa: !!activa, cooldownUntil: cooldownUntil || 0 };
  localStorage.setItem(AUTO_PAUSA_ESTADO_KEY, JSON.stringify(estado));
  if (window.fb_saveAutoPausaEstado) window.fb_saveAutoPausaEstado(estado.activa, estado.cooldownUntil).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de auto-pausa'); });
}
function loadAutoPausaEstadoFromFirebase() {
  if (!window.fb_listenAutoPausaEstado) return;
  window.fb_listenAutoPausaEstado(function (estado) {
    localStorage.setItem(AUTO_PAUSA_ESTADO_KEY, JSON.stringify(estado || {}));
  });
}

function _aplicarAutoPausa(activar) {
  const cfg = getAutoPausaConfig();
  const estado = getAutoPausaEstado();
  const ahora = Date.now();
  if (estado.cooldownUntil && ahora < estado.cooldownUntil) return; // el admin tiene el control, no tocar nada
  if (activar) {
    if (!getOrdersOpen()) return; // ya está pausado (por lo que sea) — no hay nada que activar
    localStorage.setItem(ORDERS_KEY, 'false');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(cfg.msg || '').catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
    localStorage.setItem(ORDERS_MSG_KEY, cfg.msg || '');
    _setAutoPausaEstado(true, 0);
    updateOrdersUI(false, cfg.msg);
    logActivity('🔥 Auto-pausa activada por saturación (' + cfg.umbral + '+ pedidos pendientes)');
  } else {
    if (!estado.activa) return; // el cierre actual no lo puso la auto-pausa — no reabrir solo
    localStorage.setItem(ORDERS_KEY, 'true');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
    _setAutoPausaEstado(false, 0);
    updateOrdersUI(true);
    logActivity('✅ Auto-pausa desactivada — la cola ha bajado, pedidos reactivados solos');
  }
}

function _renderAutoPausaUI() {
  const cfg = getAutoPausaConfig();
  const estado = getAutoPausaEstado();
  const btn = document.getElementById('auto-pausa-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '✅ Activada' : '⛔ Desactivada';
  }
  const umbralInp = document.getElementById('auto-pausa-umbral');
  if (umbralInp && document.activeElement !== umbralInp) umbralInp.value = cfg.umbral || 15;
  const msgInp = document.getElementById('auto-pausa-msg');
  if (msgInp && document.activeElement !== msgInp) msgInp.value = cfg.msg || '';
  const estadoTxt = document.getElementById('auto-pausa-estado-texto');
  if (estadoTxt) estadoTxt.textContent = estado.activa ? '🔥 Pausada AHORA por saturación — se reactivará sola en cuanto baje la cola.' : '';
}
function toggleAutoPausaEnabled() {
  const cfg = getAutoPausaConfig();
  saveAutoPausaConfig(!cfg.enabled, cfg.umbral, cfg.msg);
  _renderAutoPausaUI();
}
function guardarAutoPausaConfig() {
  const umbral = document.getElementById('auto-pausa-umbral').value;
  const msg = document.getElementById('auto-pausa-msg').value.trim();
  saveAutoPausaConfig(getAutoPausaConfig().enabled, umbral, msg);
  _renderAutoPausaUI();
  showToast('auto-pausa-toast');
}

// getAvisoSaturacionConfig/AVISO_SAT_CONFIG_KEY viven en nucleo-compartido.js
// (los necesita saveAvisoSaturacionConfig de aquí abajo).
function saveAvisoSaturacionConfig(enabled, umbral, msg, minutosSalto, minPorPedido) {
  const cfg = {
    enabled: !!enabled,
    umbral: Math.max(1, parseInt(umbral, 10) || 8),
    msg: msg || '⏳ Hay bastante ambiente ahora mismo, tu pedido tardará más de lo habitual.',
    minutosSalto: Math.max(0, parseInt(minutosSalto, 10) || 30),
    minPorPedido: Math.max(0, parseInt(minPorPedido, 10) || 3)
  };
  localStorage.setItem(AVISO_SAT_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveAvisoSaturacionConfig) window.fb_saveAvisoSaturacionConfig(cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido).catch(function (e) { _avisarSiFalloGuardado(e, 'aviso de saturación'); });
  logActivity((cfg.enabled ? '✅' : '⛔') + ' Aviso previo de saturación ' + (cfg.enabled ? 'activado' : 'desactivado') + ' — a partir de ' + cfg.umbral + ' pedidos pendientes');
}
function _renderAvisoSaturacionUI() {
  const cfg = getAvisoSaturacionConfig();
  const btn = document.getElementById('aviso-sat-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '✅ Activado' : '⛔ Desactivado';
  }
  const setIfNotFocused = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val;
  };
  setIfNotFocused('aviso-sat-umbral', cfg.umbral || 8);
  setIfNotFocused('aviso-sat-salto', cfg.minutosSalto || 30);
  setIfNotFocused('aviso-sat-minpp', cfg.minPorPedido || 3);
  setIfNotFocused('aviso-sat-msg', cfg.msg || '');
}
function toggleAvisoSaturacionEnabled() {
  const cfg = getAvisoSaturacionConfig();
  saveAvisoSaturacionConfig(!cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido);
  _renderAvisoSaturacionUI();
}
function guardarAvisoSaturacionConfig() {
  const umbral = document.getElementById('aviso-sat-umbral').value;
  const salto = document.getElementById('aviso-sat-salto').value;
  const minpp = document.getElementById('aviso-sat-minpp').value;
  const msg = document.getElementById('aviso-sat-msg').value.trim();
  saveAvisoSaturacionConfig(getAvisoSaturacionConfig().enabled, umbral, msg, salto, minpp);
  _renderAvisoSaturacionUI();
  showToast('aviso-sat-toast');
}

// ── PAUSA EXPRÉS (botones del panel; la cuenta atrás que ve el cliente
// vive en nucleo-compartido.js) ──
function pausarExpres(minutos) {
  const hasta = Date.now() + Math.max(1, parseInt(minutos, 10) || 15) * 60000;
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(hasta).catch(function (e) { _avisarSiFalloGuardado(e, 'pausa exprés'); });
  localStorage.setItem('dpf_pausa_expres_hasta', String(hasta));
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(hasta);
  logActivity('⏸️ Pausa exprés activada (' + minutos + ' min)');
}
function cancelarPausaExpres() {
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(0).catch(function (e) { _avisarSiFalloGuardado(e, 'pausa exprés'); });
  localStorage.setItem('dpf_pausa_expres_hasta', '0');
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(0);
  logActivity('▶️ Pausa exprés cancelada a mano');
}

// SLOTS_KEY vive en nucleo-compartido.js (bundle de cliente) — lo usa el
// propio checkout (carrito-checkout.js) y el reseteo de medianoche.

// ── VERIFICACIÓN SMS OBLIGATORIA (interruptor de emergencia, ej. Twilio
// caído) — desactivarla hace que cualquiera pueda confirmar un pedido sin
// demostrar que el teléfono es suyo, así que solo debería usarse el tiempo
// justo hasta que el SMS vuelva a funcionar. Mismo patrón visual que el
// botón de "Modo vacaciones" (vacaciones.js) — texto Activado/Desactivado
// en vez de un simple interruptor, para que el estado real se lea de un
// vistazo sin depender del color solo. ──
function _renderSmsVerifBtn(activa) {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  if (!btn) return;
  window._smsVerificacionActivaAdmin = activa;
  btn.textContent = activa ? 'Activado' : '🚨 Desactivado';
  btn.style.background = activa ? '#F5E6C8' : '#c0392b';
  btn.style.color = activa ? '#8A6A4E' : '#fff';
}
function loadSmsVerificacionStatus() {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  if (!btn) return;
  (window.fb_loadSmsVerificacionActiva ? window.fb_loadSmsVerificacionActiva() : Promise.resolve(getSmsVerificacionActiva()))
    .then(activa => _renderSmsVerifBtn(activa !== false))
    .catch(() => { btn.textContent = '⚠️ Error'; });
}
async function toggleSmsVerificacionActivaAdmin() {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  const nuevoEstado = !window._smsVerificacionActivaAdmin;
  if (btn) btn.textContent = 'Cargando…';
  try {
    if (window.fb_saveSmsVerificacionActiva) await window.fb_saveSmsVerificacionActiva(nuevoEstado);
    localStorage.setItem(SMS_VERIFICACION_ACTIVA_KEY, nuevoEstado ? 'true' : 'false');
    _renderSmsVerifBtn(nuevoEstado);
    logActivity(nuevoEstado ? '📵 Verificación SMS obligatoria reactivada' : '🚨 Verificación SMS DESACTIVADA — cualquiera puede pedir sin confirmar su móvil');
  } catch (e) {
    if (btn) btn.textContent = '⚠️ Error';
  }
}

// ── CONFIGURACIÓN DEL TICKET (guardar desde el panel) ──
function saveTicketConfig(cfg) {
  localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveTicketConfig) window.fb_saveTicketConfig(cfg).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración del ticket'); });
  logActivity('🧾 Configuración del ticket actualizada');
}

// Movidas aquí desde finanzas.js (que ya no entra en el bundle admin, ver
// build.js) — estas dos no tienen nada que ver con Finanzas, solo vivían en
// el mismo archivo por casualidad.
function openIngredientesStockOverlay() {
  document.getElementById('ingredientes-stock-overlay').classList.add('open');
  if (typeof loadStockAdminList === 'function') loadStockAdminList();
  if (typeof renderStockHistorial === 'function') renderStockHistorial();
}
function closeIngredientesStockOverlay() {
  document.getElementById('ingredientes-stock-overlay').classList.remove('open');
}

function bimbaPintarTicketConfig() {
  const tc = getTicketConfig();
  const nombreEl = document.getElementById('tc-nombre');
  if (!nombreEl) return;
  nombreEl.value = tc.nombre;
  document.getElementById('tc-direccion').value = tc.direccion;
  document.getElementById('tc-telefono').value = tc.telefono;
  document.getElementById('tc-nif').value = tc.nif;
  document.getElementById('tc-despedida').value = tc.despedida;
  document.getElementById('tc-texto-pago').value = tc.textoPago;
  document.getElementById('tc-ancho-papel').value = String(tc.anchoPapel || 80);
  document.getElementById('tc-copias').value = tc.copias || 1;
  const autoEl = document.getElementById('tc-auto-imprimir');
  autoEl.checked = tc.autoImprimir !== false;
  document.getElementById('tc-auto-row').style.background = autoEl.checked ? '#fff' : 'rgba(192,57,43,0.06)';

  // Segundo gasto fijo, descuento estudiante/jubilado, código del local y
  // tiempo de espera — igual patrón que arriba, pero cada uno con su propio
  // getter (ver admin-config.js) en vez de vivir dentro de getTicketConfig().
  const fee2EnabledEl = document.getElementById('tc-fee2-enabled');
  if (fee2EnabledEl) fee2EnabledEl.checked = getFee2Enabled();
  const fee2AmountEl = document.getElementById('tc-fee2-amount');
  if (fee2AmountEl) fee2AmountEl.value = getFee2Amount().toFixed(2);
  const fee2LabelEl = document.getElementById('tc-fee2-label');
  if (fee2LabelEl) fee2LabelEl.value = getFee2Label();

  const studentEnabledEl = document.getElementById('tc-student-discount-enabled');
  if (studentEnabledEl) studentEnabledEl.checked = getStudentDiscountEnabled();
  const studentPctEl = document.getElementById('tc-student-discount-pct');
  if (studentPctEl) studentPctEl.value = getStudentDiscountPct();

  const localCodeEl = document.getElementById('tc-local-fee-code');
  if (localCodeEl) localCodeEl.value = getLocalFeeCode();

  const esperaEl = document.getElementById('tc-tienda-espera');
  if (esperaEl) esperaEl.value = String(getTiendaEsperaMinutos());
}
function openTicketConfigOverlay() {
  document.getElementById('ticket-config-overlay').classList.add('open');
  bimbaPintarTicketConfig();
}
function closeTicketConfigOverlay() {
  document.getElementById('ticket-config-overlay').classList.remove('open');
}
function bimbaGuardarTicketConfig() {
  const msgEl = document.getElementById('tc-msg');
  const cfg = {
    nombre: document.getElementById('tc-nombre').value.trim() || TICKET_CONFIG_DEFAULTS.nombre,
    direccion: document.getElementById('tc-direccion').value.trim() || TICKET_CONFIG_DEFAULTS.direccion,
    telefono: document.getElementById('tc-telefono').value.trim() || TICKET_CONFIG_DEFAULTS.telefono,
    nif: document.getElementById('tc-nif').value.trim() || TICKET_CONFIG_DEFAULTS.nif,
    despedida: document.getElementById('tc-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    textoPago: document.getElementById('tc-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    anchoPapel: parseInt(document.getElementById('tc-ancho-papel').value, 10) || 80,
    copias: Math.max(1, parseInt(document.getElementById('tc-copias').value, 10) || 1),
    autoImprimir: document.getElementById('tc-auto-imprimir').checked
  };
  saveTicketConfig(cfg);

  // Segundo gasto fijo y descuento estudiante/jubilado se guardan con el
  // mismo botón "Guardar" de este panel — cada uno con su propia función
  // (ver admin-config.js), porque no forman parte de getTicketConfig()/
  // saveTicketConfig() (esas dos solo gestionan el aspecto del ticket).
  const fee2EnabledEl = document.getElementById('tc-fee2-enabled');
  const fee2AmountEl = document.getElementById('tc-fee2-amount');
  const fee2LabelEl = document.getElementById('tc-fee2-label');
  if (fee2EnabledEl && fee2AmountEl && fee2LabelEl) {
    saveFee2Config(
      fee2EnabledEl.checked,
      // Math.max(0, ...) porque un negativo es "truthy" en JS y se colaba
      // sin el aviso pensado solo para NaN/0 — un importe negativo aquí se
      // resta directo del total de cada pedido (carta.js/carrito-checkout.js).
      Math.max(0, parseFloat(fee2AmountEl.value) || 0.50),
      fee2LabelEl.value.trim() || 'Otro gasto fijo'
    );
  }

  const studentEnabledEl = document.getElementById('tc-student-discount-enabled');
  const studentPctEl = document.getElementById('tc-student-discount-pct');
  if (studentEnabledEl && studentPctEl) {
    saveStudentDiscountConfig(
      studentEnabledEl.checked,
      Math.max(0, Math.min(100, parseFloat(studentPctEl.value) || 0))
    );
  }

  if (msgEl) {
    msgEl.style.color = '#27855a';
    msgEl.textContent = '✅ Guardado';
    setTimeout(() => { msgEl.textContent = ''; }, 2500);
  }
}

function savePauseMsg() {
  const msg = document.getElementById('orders-pause-msg').value.trim();
  if (msg) {
    localStorage.setItem(ORDERS_MSG_KEY, msg);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
  } else {
    localStorage.removeItem(ORDERS_MSG_KEY);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg('').catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
  }
  updateOrdersUI(getOrdersOpen());
  showToast('local-toast');
}
