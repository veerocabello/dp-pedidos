// ── PRODUCTOS (edición desde el panel) — leer/renderizar el menú para
// cualquier visitante (getSavedMenu, loadSavedMenu, renderMenu) vive ahora
// en nucleo-compartido.js. ──
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
      html += tartaSep + "\n      <div class=\"admin-product-row\" id=\"arow-".concat(item.id, "\"\n        ondragover=\"dragOver(event)\" ondrop=\"dragDrop(event,").concat(item.id, ")\" ondragleave=\"dragLeave(event)\">\n        <span class=\"drag-handle\" draggable=\"true\" title=\"Arrastrar para reordenar\"\n          ondragstart=\"dragStart(event,").concat(item.id, ")\">⠿</span>\n        <div class=\"aprod-info\">\n          <div class=\"aprod-name\" style=\"").concat(soldout ? 'text-decoration:line-through;color:#8A6A4E' : '', "\">").concat(formatNombreConBadgeNuevo(item.name), "</div>\n          <div class=\"aprod-desc\">").concat(item.desc, "</div>\n          ").concat(soldout ? '<span class="soldout-badge">AGOTADO</span>' : '', "\n        \n        </div>\n        <span class=\"aprod-price\">").concat(item.price.toFixed(2), " €</span>\n        <div class=\"btn-row\">\n        <button class=\"admin-edit-btn\" onclick=\"toggleEditPanel(").concat(item.id, ")\">✏️ Editar</button>\n        <button class=\"aprod-toggle-text ").concat(soldout ? 'off' : 'on', "\" id=\"sold-").concat(item.id, "\" onclick=\"toggleSoldout(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(soldout ? '#c0392b' : '#5ECC76', ";color:#fff\">").concat(soldout ? 'Agotado' : 'Disponible', "</button>\n        <button class=\"aprod-toggle-text ").concat(visible, "\" id=\"tog-").concat(item.id, "\" onclick=\"toggleProduct(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(visible === 'on' ? '#5ECC76' : '#aaa', ";color:#fff\">").concat(visible === 'on' ? 'Visible' : 'Oculto', "</button>\n        </div>\n      </div>\n      <div id=\"edit-").concat(item.id, "\" style=\"display:none;flex-direction:column;background:rgba(244,196,48,0.08);border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;margin:-4px 0 8px\">\n        <input type=\"text\" value=\"").concat(item.name.replace(/"/g, '&quot;'), "\" id=\"edit-name-").concat(item.id, "\" placeholder=\"Nombre\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"text\" value=\"").concat(item.desc.replace(/"/g, '&quot;'), "\" id=\"edit-desc-").concat(item.id, "\" placeholder=\"Descripci\xF3n\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"number\" value=\"").concat(item.price.toFixed(2), "\" id=\"edit-price-").concat(item.id, "\" step=\"0.10\" min=\"0\" placeholder=\"Precio (€)\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        ").concat(_tagCheckboxesHtml(item), "\n        <div style=\"display:flex\">\n          <button class=\"admin-save-btn\" onclick=\"saveProductEdit(").concat(item.id, ")\" style=\"flex:1\">✅ Guardar</button>\n          <button class=\"admin-save-btn\" onclick=\"confirmDeleteProduct(").concat(item.id, ",'").concat(item.name.replace(/'/g, "\\'"), "')\" style=\"background:#c0392b;flex:1\">🗑️ Eliminar</button>\n        </div>\n      </div>");
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
}
// ── Alérgenos del producto (los 14 de declaración obligatoria — ver
// DIETARY_TAGS en carta.js). Marca los que el producto SÍ contiene. ──
function _tagCheckboxesHtml(item) {
  const seleccionadas = Array.isArray(item.tags) ? item.tags : [];
  return '<div style="font-size:11px;font-weight:700;color:#8A6A4E;margin:2px 0 4px">Contiene (alérgenos):</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px">' + DIETARY_TAGS.map(t => {
    const checked = seleccionadas.indexOf(t.id) !== -1;
    return '<label style="display:flex;align-items:center;gap:5px;font-size:12px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:5px 9px;cursor:pointer">'
      + '<input type="checkbox" id="edit-tag-' + t.id + '-' + item.id + '"' + (checked ? ' checked' : '') + ' style="margin:0">'
      + '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:' + t.color + ';font-size:11px;line-height:1">' + t.emoji + '</span>'
      + t.label
      + '</label>';
  }).join('') + '</div>';
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
  item.tags = DIETARY_TAGS.filter(t => {
    const cb = document.getElementById('edit-tag-' + t.id + '-' + id);
    return cb && cb.checked;
  }).map(t => t.id);
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("✏️ Producto editado: \"".concat(item.name, "\" — ").concat(item.price.toFixed(2), " €"));
}
function updatePrice(id, val) {
  const item = MENU.find(m => m.id == id);
  if (item) {
    item.price = parseFloat(val) || item.price;
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("💰 Precio actualizado: \"".concat(item.name, "\" → ").concat(item.price.toFixed(2), " €"));
  }
}
function updateName(id, val) {
  const item = MENU.find(m => m.id == id);
  if (val.trim() && item) {
    item.name = val.trim();
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("✏️ Nombre actualizado: \"".concat(item.name, "\""));
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

// ── CONFIG (email/API keys de EmailJS) ──
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
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(() => {});
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
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
    firebase.database().ref('config/openManualOverride').set(true).catch(() => {});
  } else {
    localStorage.removeItem('dpf_open_manual_override');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
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
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function () {});
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Gastos de gestión ' + (enabled ? 'activados' : 'desactivados') + ' — ' + amount.toFixed(2) + '€');
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

// ── SEGUNDO GASTO FIJO (guardar desde el panel) ──
function saveFee2Config(enabled, amount, label) {
  localStorage.setItem(FEE2_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE2_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE2_LABEL_KEY, label);
  if (window.fb_saveFee2Config) window.fb_saveFee2Config(enabled, amount, label).catch(function () {});
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Otro gasto fijo ' + (enabled ? 'activado' : 'desactivado') + ' — ' + amount.toFixed(2) + '€');
}

// ── DESCUENTO ESTUDIANTE/JUBILADO (guardar desde el panel) ──
function saveStudentDiscountConfig(enabled, pct) {
  localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(pct));
  if (window.fb_saveStudentDiscountConfig) window.fb_saveStudentDiscountConfig(enabled, pct).catch(function () {});
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Descuento estudiante/jubilado ' + (enabled ? 'activado' : 'desactivado') + ' — ' + pct + '%');
}

// ── CÓDIGO "PEDIDO DESDE EL LOCAL" (guardar/generar desde el panel) ──
function saveLocalFeeCode(code) {
  const clean = (code || '').trim().toUpperCase();
  localStorage.setItem(LOCAL_FEE_CODE_KEY, clean);
  if (window.fb_saveLocalFeeCode) window.fb_saveLocalFeeCode(clean).catch(function () {});
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
  if (window.fb_saveTiendaEsperaMinutos) window.fb_saveTiendaEsperaMinutos(val).catch(function () {});
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
  if (window.fb_saveAutoPausaConfig) window.fb_saveAutoPausaConfig(cfg.enabled, cfg.umbral, cfg.msg).catch(() => {});
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
  if (window.fb_saveAutoPausaEstado) window.fb_saveAutoPausaEstado(estado.activa, estado.cooldownUntil).catch(() => {});
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
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(cfg.msg || '').catch(() => {});
    localStorage.setItem(ORDERS_MSG_KEY, cfg.msg || '');
    _setAutoPausaEstado(true, 0);
    updateOrdersUI(false, cfg.msg);
    logActivity('🔥 Auto-pausa activada por saturación (' + cfg.umbral + '+ pedidos pendientes)');
  } else {
    if (!estado.activa) return; // el cierre actual no lo puso la auto-pausa — no reabrir solo
    localStorage.setItem(ORDERS_KEY, 'true');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
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
  if (window.fb_saveAvisoSaturacionConfig) window.fb_saveAvisoSaturacionConfig(cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido).catch(() => {});
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
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(hasta).catch(() => {});
  localStorage.setItem('dpf_pausa_expres_hasta', String(hasta));
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(hasta);
  logActivity('⏸️ Pausa exprés activada (' + minutos + ' min)');
}
function cancelarPausaExpres() {
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(0).catch(() => {});
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
  if (window.fb_saveTicketConfig) window.fb_saveTicketConfig(cfg).catch(() => {});
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
      parseFloat(fee2AmountEl.value) || 0.50,
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

function toggleIngredientesPanel(btn) {
  const panel = document.getElementById('ingredientes-panel');
  if (!panel) return;
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '✏️ Editar' : '✕ Cerrar';
  btn.style.background = open ? '#3D1F0D' : '#F5E6C8';
  btn.style.color = open ? '#FFF8EE' : '#3D1F0D';
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
