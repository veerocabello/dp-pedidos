// ── PRODUCTOS ──
function getSavedMenu() {
  try {
    return JSON.parse(localStorage.getItem(MENU_KEY)) || null;
  } catch {
    return null;
  }
}
function saveMenu() {
  const data = {
    items: MENU,
    ts: Date.now()
  };
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', data.ts);
  // Sync to Firebase so all devices get updated prices
  if (window.fb_saveMenu) window.fb_saveMenu(data).catch(() => {});
}
function loadSavedMenu() {
  const saved = getSavedMenu();
  if (saved) {
    MENU.length = 0;
    saved.forEach(i => MENU.push(i));
  }
}
function renderAdminProducts() {
  const cats = [...new Set(MENU.map(i => i.cat))];
  const emojiMapAdmin = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  let html = '';
  cats.forEach(cat => {
    const catEmoji = emojiMapAdmin[cat] || '';
    html += "<p style=\"font-family:Anton,sans-serif;font-size:19px;font-weight:400;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;margin:16px 0 8px;padding:8px 14px;border-radius:8px\">".concat(catEmoji ? catEmoji + ' ' : '', cat, "</p>");
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
      html += tartaSep + "\n      <div class=\"admin-product-row\" id=\"arow-".concat(item.id, "\"\n        ondragover=\"dragOver(event)\" ondrop=\"dragDrop(event,").concat(item.id, ")\" ondragleave=\"dragLeave(event)\">\n        <span class=\"drag-handle\" draggable=\"true\" title=\"Arrastrar para reordenar\"\n          ondragstart=\"dragStart(event,").concat(item.id, ")\">\u283F</span>\n        <div class=\"aprod-info\">\n          <div class=\"aprod-name\" style=\"").concat(soldout ? 'text-decoration:line-through;color:#8A6A4E' : '', "\">").concat(formatNombreConBadgeNuevo(item.name), "</div>\n          <div class=\"aprod-desc\">").concat(item.desc, "</div>\n          ").concat(soldout ? '<span class="soldout-badge">AGOTADO</span>' : '', "\n        \n        </div>\n        <span class=\"aprod-price\">").concat(item.price.toFixed(2), " \u20AC</span>\n        <div class=\"btn-row\">\n        <button class=\"admin-edit-btn\" onclick=\"toggleEditPanel(").concat(item.id, ")\">\u270F\uFE0F Editar</button>\n        <button class=\"aprod-toggle-text ").concat(soldout ? 'off' : 'on', "\" id=\"sold-").concat(item.id, "\" onclick=\"toggleSoldout(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(soldout ? '#c0392b' : '#5ECC76', ";color:#fff\">").concat(soldout ? 'Agotado' : 'Disponible', "</button>\n        <button class=\"aprod-toggle-text ").concat(visible, "\" id=\"tog-").concat(item.id, "\" onclick=\"toggleProduct(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(visible === 'on' ? '#5ECC76' : '#aaa', ";color:#fff\">").concat(visible === 'on' ? 'Visible' : 'Oculto', "</button>\n        </div>\n      </div>\n      <div id=\"edit-").concat(item.id, "\" style=\"display:none;flex-direction:column;background:rgba(244,196,48,0.08);border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;margin:-4px 0 8px\">\n        <input type=\"text\" value=\"").concat(item.name.replace(/"/g, '&quot;'), "\" id=\"edit-name-").concat(item.id, "\" placeholder=\"Nombre\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"text\" value=\"").concat(item.desc.replace(/"/g, '&quot;'), "\" id=\"edit-desc-").concat(item.id, "\" placeholder=\"Descripci\xF3n\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"number\" value=\"").concat(item.price.toFixed(2), "\" id=\"edit-price-").concat(item.id, "\" step=\"0.10\" min=\"0\" placeholder=\"Precio (\u20AC)\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <div style=\"display:flex\">\n          <button class=\"admin-save-btn\" onclick=\"saveProductEdit(").concat(item.id, ")\" style=\"flex:1\">\u2705 Guardar</button>\n          <button class=\"admin-save-btn\" onclick=\"confirmDeleteProduct(").concat(item.id, ",'").concat(item.name.replace(/'/g, "\\'"), "')\" style=\"background:#c0392b;flex:1\">\uD83D\uDDD1\uFE0F Eliminar</button>\n        </div>\n      </div>");
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
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
  if (nameEl && nameEl.value.trim()) item.name = nameEl.value.trim();
  if (descEl) item.desc = descEl.value.trim();
  if (priceEl) item.price = parseFloat(priceEl.value) || item.price;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("\u270F\uFE0F Producto editado: \"".concat(item.name, "\" \u2014 ").concat(item.price.toFixed(2), " \u20AC"));
}
function updatePrice(id, val) {
  const item = MENU.find(m => m.id == id);
  if (item) {
    item.price = parseFloat(val) || item.price;
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("\uD83D\uDCB0 Precio actualizado: \"".concat(item.name, "\" \u2192 ").concat(item.price.toFixed(2), " \u20AC"));
  }
}
function updateName(id, val) {
  const item = MENU.find(m => m.id == id);
  if (val.trim() && item) {
    item.name = val.trim();
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("\u270F\uFE0F Nombre actualizado: \"".concat(item.name, "\""));
  }
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
  logActivity("\uD83D\uDC41\uFE0F Producto ".concat(item.hidden ? 'ocultado' : 'mostrado', ": \"").concat(item.name, "\""));
}
function toggleSoldout(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.soldout = !item.soldout;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("\uD83D\uDEAB Producto ".concat(item.soldout ? 'marcado agotado' : 'disponible de nuevo', ": \"").concat(item.name, "\""));
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
function addSection() {
  const input = document.getElementById('new-section-name');
  const cat = input ? input.value.trim() : '';
  if (!cat) { alert('Escribe el nombre de la categoría'); return; }
  if (MENU.some(i => i.cat === cat)) { alert('Esa categoría ya existe'); return; }
  // Añadir producto placeholder oculto para crear la categoría
  const newId = Math.max(0, ...MENU.map(i => i.id)) + 1;
  MENU.push({ id: newId, cat, name: '(producto de ejemplo)', desc: '', price: 0, hidden: true });
  saveMenu();
  initTabs();
  renderMenu();
  renderAdminProducts();
  if (input) input.value = '';
  showToast('section-toast');
  logActivity('📂 Nueva categoría creada: ' + cat);
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
function addProduct() {
  const name = document.getElementById('new-name').value.trim();
  const desc = document.getElementById('new-desc').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  let cat = document.getElementById('new-cat').value;
  if (cat === '__nueva__') {
    const inputNueva = document.getElementById('new-cat-nombre');
    cat = inputNueva ? inputNueva.value.trim() : '';
    if (!cat) { alert('Escribe el nombre de la nueva categoría'); return; }
  }
  if (!name || !cat || isNaN(price)) {
    alert('Rellena nombre, categoría y precio');
    return;
  }
  const newId = Math.max(0, ...MENU.map(i => i.id)) + 1;
  const newItem = { id: newId, cat, name, desc, price };
  // Insertar justo después del último producto de la misma categoría,
  // para que no aparezca suelto fuera de su sección en la carta
  let lastIdx = -1;
  for (let i = 0; i < MENU.length; i++) {
    if (MENU[i].cat === cat) lastIdx = i;
  }
  if (lastIdx === -1) {
    MENU.push(newItem);
  } else {
    MENU.splice(lastIdx + 1, 0, newItem);
  }
  saveMenu();
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
}

// Override renderMenu to respect hidden and soldout flags
// Override renderMenu to respect hidden and soldout flags
// ── PROMOS ──
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
      '<div style="font-size:14px;font-weight:700;color:#3D1F0D;margin-bottom:2px">' + p.nombre + '</div>' +
      '<div style="font-size:12px;color:#8A6A4E;margin-bottom:6px">' + (p.descripcion || '') + '</div>' +
      '<div>' + precioTachado + '<span style="font-size:14px;font-weight:700;color:#3D1F0D">' + parseFloat(p.precio).toFixed(2) + ' €</span></div>' +
      '</div>' +
      '<button onclick="promoAnadir(\'' + p.id + '\')" style="padding:8px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;flex-shrink:0">+ Añadir</button>' +
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
  titleRow.innerHTML = '<div style="font-size:20px;font-weight:800;color:#3D1F0D;font-family:Playfair Display,serif">' + p.nombre + '</div>';
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

function renderMenu() {
  window._tartaLastSub = null;
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
          + '<div class="menu-cat-name">' + (emoji ? emoji + ' ' : '') + item.cat.toUpperCase() + '</div>'
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
    return sep
      + '<div class="item-card ' + (qty > 0 ? 'in-cart' : '') + ' ' + (soldout ? 'soldout-card' : '') + '"'
      + ' id="card-' + item.id + '"'
      + ' data-name="' + escapeAttr(item.name) + '"'
      + ' data-desc="' + escapeAttr(item.desc||'') + '"'
      + ' style="' + (soldout ? 'opacity:.6' : '') + '">'
      + '<div class="item-info">'
      + '<div class="item-name" style="' + (soldout ? 'text-decoration:line-through' : '') + '">' + formatNombreConBadgeNuevo(item.name) + '</div>'
      + '<div class="item-desc">' + (soldout ? '❌ Agotado hoy' : item.desc) + '</div>'
      + '</div>'
      + '<div class="item-price">' + item.price.toFixed(2) + ' €</div>'
      + '<div class="item-controls">' + controls + '</div>'
      + '</div>';
  }).join('');
  grid.innerHTML = html;
}
// ── CONFIG ──
function loadAdminConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
    document.getElementById('cfg-pk').value = c.emailjs_public_key || CONFIG.emailjs_public_key;
    document.getElementById('cfg-svc').value = c.emailjs_service_id || CONFIG.emailjs_service_id;
    document.getElementById('cfg-tpl').value = c.emailjs_template_id || CONFIG.emailjs_template_id;
  } catch {}
  if (window.fb_loadConfig) {
    window.fb_loadConfig().then(c => {
      if (!c) return;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
      Object.assign(CONFIG, c);
      try {
        document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
        document.getElementById('cfg-pk').value = c.emailjs_public_key || CONFIG.emailjs_public_key;
        document.getElementById('cfg-svc').value = c.emailjs_service_id || CONFIG.emailjs_service_id;
        document.getElementById('cfg-tpl').value = c.emailjs_template_id || CONFIG.emailjs_template_id;
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
  c.emailjs_public_key = document.getElementById('cfg-pk').value.trim();
  c.emailjs_service_id = document.getElementById('cfg-svc').value.trim();
  c.emailjs_template_id = document.getElementById('cfg-tpl').value.trim();
  localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  Object.assign(CONFIG, c);
  if (window.fb_saveConfig) window.fb_saveConfig(c).catch(() => {});
  showToast('cfg-toast');
}
function loadConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    if (c.store_email) Object.assign(CONFIG, c);
  } catch {}
}

// ── HORARIO ──
const DIAS_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function toggleDia(btn) {
  btn.classList.toggle('activo');
}
function verDiasGuardados() {
  const NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const raw = localStorage.getItem('dpf_horario');
  const el = document.getElementById('dias-diagnostico');
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
  logActivity('🕐 Horario actualizado — Días: ' + diasAbiertos.map(d => DIAS_NAMES[d]).join(', '));
}
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

// ── ABIERTO/CERRADO ──
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
function toggleOpenStatus() {
  const current = localStorage.getItem(OPEN_KEY) !== 'false';
  const next = !current;
  localStorage.setItem(OPEN_KEY, String(next));
  if (!next) {
    localStorage.setItem('dpf_open_manual_override', '1');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
    firebase.database().ref('config/openManualOverride').set(true).catch(() => {});
  } else {
    localStorage.removeItem('dpf_open_manual_override');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
    firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
  }
  updateOpenBtn(next);
  updateHeroDot(next);
  logActivity("\uD83C\uDFEA Local marcado como: ".concat(next ? 'ABIERTO' : 'CERRADO'));
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

// ── CONTRASEÑA ──
async function changePwd() {
  const old = document.getElementById('pwd-old').value;
  const n1 = document.getElementById('pwd-new').value;
  const n2 = document.getElementById('pwd-rep').value;
  const err = document.getElementById('pwd-error');
  err.textContent = '';
  const oldHash = await hashAdminPwd(old);
  if (oldHash !== getAdminPwd()) {
    err.textContent = 'La contraseña actual es incorrecta';
    return;
  }
  if (n1.length < 6) {
    err.textContent = 'La nueva contraseña debe tener al menos 6 caracteres';
    return;
  }
  if (n1 !== n2) {
    err.textContent = 'Las contraseñas no coinciden';
    return;
  }
  const newHash = await hashAdminPwd(n1);
  localStorage.setItem(ADMIN_PWD_KEY, newHash);
  if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(newHash).catch(() => {});
  document.getElementById('pwd-old').value = '';
  document.getElementById('pwd-new').value = '';
  document.getElementById('pwd-rep').value = '';
  showToast('pwd-toast');
  logActivity('🔑 Contraseña de administración cambiada');
}
const ORDERS_KEY = 'dpf_orders_open';
const ORDERS_MSG_KEY = 'dpf_orders_msg';
const STATS_KEY = 'dpf_day_stats';
// ── GASTOS DE GESTIÓN ──
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
function saveFeeConfig(enabled, amount, label) {
  localStorage.setItem(FEE_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE_LABEL_KEY, label);
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function () {});
  renderCart();
  logActivity((enabled ? '\u2705' : '\u26d4') + ' Gastos de gesti\u00f3n ' + (enabled ? 'activados' : 'desactivados') + ' \u2014 ' + amount.toFixed(2) + '\u20ac');
}
function loadFeeFromFirebase() {
  console.log('[fee] loadFeeFromFirebase called, fb_listenFeeConfig=', typeof window.fb_listenFeeConfig);
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
const SLOTS_KEY = 'dpf_slots';
// ── CONFIGURACIÓN DEL TICKET ──
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
function saveTicketConfig(cfg) {
  localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveTicketConfig) window.fb_saveTicketConfig(cfg).catch(() => {});
  logActivity('🧾 Configuración del ticket actualizada');
}
function loadTicketConfigFromFirebase() {
  if (!window.fb_listenTicketConfig) return;
  window.fb_listenTicketConfig(function (cfg) {
    localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
    if (typeof bimbaPintarTicketConfig === 'function') bimbaPintarTicketConfig();
  });
}
function getOrdersOpen() {
  // Si estamos fuera de horario o hoy es día cerrado, siempre devolver false
  if (isOutsideHours() || !isTodayOpen()) return false;
  const val = localStorage.getItem(ORDERS_KEY);
  if (val === null || val === undefined) return true; // abierto por defecto
  return val !== 'false';
}
function toggleOrdersAccepting() {
  const next = !getOrdersOpen();
  localStorage.setItem(ORDERS_KEY, next);
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(() => {});
  updateOrdersUI(next);
  logActivity("\uD83D\uDEA6 Pedidos: ".concat(next ? 'ACTIVADOS' : 'PAUSADOS'));
}
function savePauseMsg() {
  const msg = document.getElementById('orders-pause-msg').value.trim();
  if (msg) {
    localStorage.setItem(ORDERS_MSG_KEY, msg);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(() => {});
  } else {
    localStorage.removeItem(ORDERS_MSG_KEY);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg('').catch(() => {});
  }
  updateOrdersUI(getOrdersOpen());
  showToast('local-toast');
}
function loadFeeUI() {
  const btn = document.getElementById('fee-toggle-btn');
  const amountInput = document.getElementById('fee-amount-input');
  const labelInput = document.getElementById('fee-label-input');
  if (!btn) return;
  const enabled = getFeeEnabled();
  btn.className = 'open-toggle ' + (enabled ? 'abierto' : 'cerrado');
  btn.textContent = enabled ? '✅ Gastos activados' : '⛔ Gastos desactivados';
  if (amountInput) amountInput.value = getFeeAmount().toFixed(2);
  if (labelInput) labelInput.value = getFeeLabel();
}
function toggleFeeEnabled() {
  const enabled = !getFeeEnabled();
  saveFeeConfig(enabled, getFeeAmount(), getFeeLabel());
  loadFeeUI();
  showToast('fee-toast');
}
function saveFeeFromPanel() {
  const amount = parseFloat(document.getElementById('fee-amount-input').value) || 0.50;
  const label = document.getElementById('fee-label-input').value.trim() || 'Gastos de gestión online';
  saveFeeConfig(getFeeEnabled(), amount, label);
  loadFeeUI();
  showToast('fee-toast');
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
  // Comprobar premio de fidelización cuando el número está completo (9 dígitos)
  if (digits.length === 9) {
    clearTimeout(window._fidelizacionCheckTimer);
    window._fidelizacionCheckTimer = setTimeout(() => _comprobarPremioFidelizacion(digits), 400);
  } else {
    _ocultarAvisoPremioFidelizacion();
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

