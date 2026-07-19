// ── STOCK SYSTEM ──
const STOCK_PWD_KEY = 'dpf_stock_pwd';
const STOCK_DATA_KEY = 'dpf_stock_data';
const STOCK_DEFAULTS = {
  congelados: ['Kebab', 'Carne picada', 'Tronquitos de mar', 'Gambas', 'York', 'Pulled pork', 'Bacon'],
  latas_salsas: ['Tomate frito', 'Aceitunas', 'Maíz', 'Zanahoria', 'Remolacha', 'Champiñones', 'Piña', 'Alioli', 'Mayonesa', 'Salsa rosa', 'Salsa de yogur', 'Salsa barbacoa', 'Salsa brava', 'Salsa ketchup', 'Salsa roquefort', 'Salsa miel mostaza', 'Cebolla crujiente', 'Nata Vegecrem'],
  estanteria_almacen: ['Atún', 'Crema de pistacho', 'Crema Kinder', 'Crema Lotus'],
  frio: ['Philadelphia tarta', 'Philadelphia patatas', 'Mantequilla', 'Huevo cocido', 'Queso mascarpone', 'Cuatro quesos', 'Rulo de cabra'],
  estanteria_tartas: ['Galleta Lotus', 'Galleta Dino', 'Galleta María Oro', 'Filipinos blancos', 'Donuts', 'Leche Puleva'],
  patatas_verdura: ['Uds. sacos de patatas', 'Uds. sacos de cebollas', 'Bolsas boniato pelado'],
  masas: ['Masa cookies'],
  queseria: ['Queso mozzarella'],
  envases: ['Bol de pollo', 'Bol pequeño boniato', 'Redondel tartas plateadas', 'Papel de aluminio', 'Papel film', 'Cajas de bolsas', 'Caja pasta 1/2', 'Caja pasta 1/4', 'Caja pizza', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm', 'Caja cucharas', 'Rollo papel cocina / horno', 'Caja papel horno', 'Cacharrillos salsas pequeños', 'Papeles marrones', 'Caja tartas completas'],
  pan: ['Pan de leña', 'Paninis XXL'],
  referencias_ali: ['Aceitunas rodajas', 'Aceite de oliva virgen extra', 'Cuajada tomates', 'Sal', 'Azúcar', 'Pimienta', 'Orégano', 'Eneldo', 'Hierbas provenzales', 'Ajo en polvo', 'Nuez moscada', 'Pistachos', 'Piña', 'Nanas limpieza', 'Guantes talla L', 'Guantes talla M', 'Fregonas', 'Cepillos', 'Recogedor', 'Trapos', 'Lejía', 'Desengrasante', 'Friegasuelos', 'Papel higiénico', 'Estropajos', 'Ambientador', 'Limpia cristales', 'Servilletas'],
  chocolates_galletas: ['Chocolate negro', 'Chocolate blanco', 'Chocolate con leche', 'Galleta Digestive']
};
const STOCK_GROUP_LABELS = {
  congelados: '❄️ Congelados',
  latas_salsas: '🥫 Latas / Conservas / Salsas',
  estanteria_almacen: '📦 Estantería (Almacén)',
  frio: '🧊 Frío',
  estanteria_tartas: '🎂 Estantería Tartas',
  patatas_verdura: '🥔 Patatas y Verdura',
  masas: '🍪 Masas',
  queseria: '🧀 Quesería',
  envases: '📋 Envases / Packaging',
  pan: '🍞 Pan',
  referencias_ali: '🛒 Referencias ALI',
  chocolates_galletas: '🍫 Chocolates y Galletas'
};
// Migración: 'Cuajada tomates' -> 'Cuajada' + 'Tomates'
(function () {
  try {
    const raw = localStorage.getItem('dpf_stock_data');
    if (!raw) return;
    let changed = false;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(group => {
      const items = data[group];
      const idx = items.indexOf('Cuajada tomates');
      if (idx !== -1) {
        items.splice(idx, 1, 'Cuajada', 'Tomates');
        changed = true;
      }
    });
    if (changed) localStorage.setItem('dpf_stock_data', JSON.stringify(data));
  } catch (e) {}
})();
function getStockPwd() {
  return localStorage.getItem(STOCK_PWD_KEY) || '';
}
function changeStockPwd() {
  const n1 = document.getElementById('stock-pwd-new').value;
  const n2 = document.getElementById('stock-pwd-rep').value;
  const err = document.getElementById('stock-pwd-error');
  err.textContent = '';
  if (n1.length < 4) {
    err.textContent = 'La clave debe tener al menos 4 caracteres';
    return;
  }
  if (n1 !== n2) {
    err.textContent = 'Las claves no coinciden';
    return;
  }
  localStorage.setItem(STOCK_PWD_KEY, n1);
  if (window.fb_saveStockPwd) window.fb_saveStockPwd(n1).catch(() => {});
  document.getElementById('stock-pwd-new').value = '';
  document.getElementById('stock-pwd-rep').value = '';
  showToast('stock-pwd-toast');
  logActivity('\uD83D\uDCE6 Clave de stock actualizada');
}
function getStockData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STOCK_DATA_KEY) || 'null');
    if (saved) return saved;
  } catch {}
  // First time: preload defaults
  const data = JSON.parse(JSON.stringify(STOCK_DEFAULTS));
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  return data;
}
function saveStockData(data) {
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  if (window.fb_saveStockData) {
    window._stockDataLocalWrite = Date.now();
    window.fb_saveStockData(data).catch(() => {});
  }
}

// ── ADMIN: ingredient management ──
function loadStockAdminList() {
  const data = getStockData();
  const el = document.getElementById('stock-ingredients-admin-list');
  if (!el) return;
  el.innerHTML = Object.entries(data).map(_ref25 => {
    let _ref26 = _slicedToArray(_ref25, 2),
      group = _ref26[0],
      items = _ref26[1];
    return "\n    <div style=\"margin-bottom:18px\">\n      <div style=\"font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #F5E6C8\">".concat(STOCK_GROUP_LABELS[group] || group, "</div>\n      <div id=\"stock-drag-group-").concat(group, "\" data-group=\"").concat(group, "\" style=\"display:flex;flex-direction:column\">\n        ").concat(items.map((ing, i) => "\n          <div draggable=\"true\" data-group=\"".concat(group, "\" data-index=\"").concat(i, "\"\n               style=\"display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:8px;padding:7px 12px;cursor:grab\"\n               ondragstart=\"stockDragStart(event)\" ondragover=\"stockDragOver(event)\" ondrop=\"stockDrop(event)\" ondragend=\"stockDragEnd(event)\">\n            <span style=\"color:#8A6A4E;font-size:16px;cursor:grab;user-select:none\">\u2630</span>\n            <span style=\"font-size:14px;color:#2A1506;flex:1\">").concat(escapeHtml(ing), "</span>\n            <button onclick=\"removeStockItem('").concat(group, "',").concat(i, ")\" style=\"background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer;font-weight:700\">&#128465;</button>\n          </div>")).join(''), "\n      </div>\n    </div>");
  }).join('');
  _initStockDrag();
}
let _stockDragSrc = null;
function stockDragStart(e) {
  _stockDragSrc = e.currentTarget;
  e.currentTarget.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function stockDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.background = 'var(--amber-light, #fef3e2)';
}
function stockDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('#stock-ingredients-admin-list [draggable]').forEach(el => {
    el.style.background = '#FFFFFF';
  });
}
function stockDrop(e) {
  e.preventDefault();
  if (!_stockDragSrc || _stockDragSrc === e.currentTarget) return;
  const srcGroup = _stockDragSrc.dataset.group;
  const dstGroup = e.currentTarget.dataset.group;
  if (srcGroup !== dstGroup) return; // solo dentro del mismo grupo
  const srcIdx = parseInt(_stockDragSrc.dataset.index);
  const dstIdx = parseInt(e.currentTarget.dataset.index);
  const data = getStockData();
  const arr = data[srcGroup];
  const _arr$splice = arr.splice(srcIdx, 1),
    _arr$splice2 = _slicedToArray(_arr$splice, 1),
    moved = _arr$splice2[0];
  arr.splice(dstIdx, 0, moved);
  saveStockData(data);
  loadStockAdminList();
  showToast('stock-config-toast');
}
function _initStockDrag() {
  // Touch drag for mobile using touchstart/touchmove/touchend
  document.querySelectorAll('#stock-ingredients-admin-list [draggable]').forEach(el => {
    el.addEventListener('touchstart', _stockTouchStart, {
      passive: true
    });
    el.addEventListener('touchmove', _stockTouchMove, {
      passive: false
    });
    el.addEventListener('touchend', _stockTouchEnd, {
      passive: true
    });
  });
}
let _stockTouchItem = null,
  _stockTouchStartY = 0;
function _stockTouchStart(e) {
  _stockTouchItem = e.currentTarget;
  _stockTouchStartY = e.touches[0].clientY;
  _stockTouchItem.style.opacity = '0.5';
}
function _stockTouchMove(e) {
  e.preventDefault();
}
function _stockTouchEnd(e) {
  if (!_stockTouchItem) return;
  _stockTouchItem.style.opacity = '1';
  const endY = e.changedTouches[0].clientY;
  const group = _stockTouchItem.dataset.group;
  const srcIdx = parseInt(_stockTouchItem.dataset.index);
  const container = document.getElementById('stock-drag-group-' + group);
  if (!container) {
    _stockTouchItem = null;
    return;
  }
  const items = Array.from(container.querySelectorAll('[draggable]'));
  let targetIdx = srcIdx;
  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (endY > rect.top && endY < rect.bottom) targetIdx = i;
  });
  if (targetIdx !== srcIdx) {
    const data = getStockData();
    const arr = data[group];
    const _arr$splice3 = arr.splice(srcIdx, 1),
      _arr$splice4 = _slicedToArray(_arr$splice3, 1),
      moved = _arr$splice4[0];
    arr.splice(targetIdx, 0, moved);
    saveStockData(data);
    loadStockAdminList();
    showToast('stock-config-toast');
  }
  _stockTouchItem = null;
}
function addStockIngredient() {
  const input = document.getElementById('new-ingredient-input');
  const groupSel = document.getElementById('new-ingredient-group');
  const name = input.value.trim();
  const group = groupSel ? groupSel.value : 'ingredientes';
  if (!name) return;
  const data = getStockData();
  if (!data[group]) data[group] = [];
  if (data[group].includes(name)) {
    alert('Ya existe en ese grupo');
    return;
  }
  data[group].push(name);
  saveStockData(data);
  input.value = '';
  loadStockAdminList();
  showToast('stock-config-toast');
}
function removeStockItem(group, i) {
  const data = getStockData();
  if (!data[group]) return;
  data[group].splice(i, 1);
  saveStockData(data);
  loadStockAdminList();
}

// ── EMPLOYEE OVERLAY ──
let _stockEditMode = false;
function toggleStockEditMode() {
  _stockEditMode = !_stockEditMode;
  const btn = document.getElementById('stock-edit-btn');
  const addPanel = document.getElementById('stock-edit-add');
  if (btn) btn.textContent = _stockEditMode ? '✅ Listo' : '✏️ Editar';
  if (btn) btn.style.background = _stockEditMode ? '#3D1F0D' : '#FFFFFF';
  if (btn) btn.style.color = _stockEditMode ? '#fff' : '#3D1F0D';
  if (addPanel) addPanel.style.display = _stockEditMode ? 'block' : 'none';
  renderStockItems();
}
function stockOverlayAddItem() {
  const group = document.getElementById('stock-edit-group').value;
  const name = document.getElementById('stock-edit-name').value.trim();
  if (!name) return;
  const data = getStockData();
  if (!data[group]) data[group] = [];
  if (data[group].includes(name)) {
    alert('Ya existe en esa categoría');
    return;
  }
  data[group].push(name);
  saveStockData(data);
  document.getElementById('stock-edit-name').value = '';
  renderStockItems();
}
function stockOverlayRemoveItem(group, ing) {
  if (!confirm('¿Eliminar "' + ing + '"?')) return;
  const data = getStockData();
  data[group] = data[group].filter(i => i !== ing);
  saveStockData(data);
  renderStockItems();
}
let _stockOverlayDragSrc = null;
function stockOverlayDragStart(e) {
  _stockOverlayDragSrc = e.currentTarget;
  e.currentTarget.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function stockOverlayDragOver(e) {
  e.preventDefault();
  e.currentTarget.style.background = 'var(--amber-light, #fef3e2)';
}
function stockOverlayDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('#stock-items-list [draggable]').forEach(el => {
    el.style.background = '';
  });
}
function stockOverlayDrop(e) {
  e.preventDefault();
  if (!_stockOverlayDragSrc || _stockOverlayDragSrc === e.currentTarget) return;
  const srcGroup = _stockOverlayDragSrc.dataset.group;
  const dstGroup = e.currentTarget.dataset.group;
  if (srcGroup !== dstGroup) return;
  const srcIng = _stockOverlayDragSrc.dataset.ing;
  const dstIng = e.currentTarget.dataset.ing;
  const data = getStockData();
  const arr = data[srcGroup];
  const srcIdx = arr.indexOf(srcIng);
  const dstIdx = arr.indexOf(dstIng);
  if (srcIdx === -1 || dstIdx === -1) return;
  arr.splice(srcIdx, 1);
  arr.splice(dstIdx, 0, srcIng);
  saveStockData(data);
  renderStockItems();
}
function openStockFromAdmin() {
  document.body.style.overflow = '';
  window._stockFromAdmin = true;
  window._adminWasLoggedIn = _adminLoggedIn;
  document.getElementById('admin-overlay').classList.add('hidden-for-stock');
  openStockOverlay();
}
function openStockInline() {
  // Guardar sección activa para restaurarla al cerrar
  const activeSection = document.querySelector('.admin-section.active');
  window._stockPrevSection = activeSection ? activeSection.id.replace('admin-', '') : 'productos';
  window._stockFromAdmin = true;
  window._adminWasLoggedIn = _adminLoggedIn;
  openStockOverlay();
}
function openStockConfigSecret() {
  // Open stock config (bimba secret)
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('admin-stock-config').classList.add('active');
  if (!document.getElementById('admin-overlay').classList.contains('open')) {
    document.getElementById('admin-overlay').classList.add('open');
  }
  loadStockAdminList();
  renderStockHistorial();
  setTimeout(function(){ if(typeof dcCargar==='function') dcCargar(); }, 300);
}
function openStockOverlay() {
  _stockSelections = {};
  _stockUnits = {};
  _stockChecks = {};
  _stockNotas = {};
  _stockLimpieza = {};
  document.body.style.overflow = 'hidden';
  var _so = document.getElementById('stock-overlay');
  _so.style.display = 'block';
  _so.style.position = 'fixed';
  _so.style.top = '0';
  _so.style.right = '0';
  _so.style.bottom = '0';
  _so.style.left = '0';
  _so.style.zIndex = '9999';
  _so.style.background = '#FFF8EE';
  _so.style.overflowY = 'scroll';
  _so.style.webkitOverflowScrolling = 'touch';
  _so.style.pointerEvents = 'auto';
  _so.style.visibility = 'visible';
  _so.style.opacity = '1';
  _so.style.webkitTransform = 'translateZ(0)';
  document.getElementById('stock-result-modal').style.display = 'none';

  // 🔥 Cargar historial de Firebase primero (para que el otro dispositivo vea el último stock)
  // luego activar listener de cambios en tiempo real
  requestAnimationFrame(() => {
    let _stockFirstLoad = false;
    if (window.fb_listenStockHistorial) {
      if (window._stockUnsubscribe) {
        try {
          window._stockUnsubscribe();
        } catch (e) {}
      }
      window._stockUnsubscribe = window.fb_listenStockHistorial(data => {
        // fb_listenStockHistorial ya guarda en localStorage antes de llamar aquí
        if (!_stockFirstLoad) {
          _stockFirstLoad = true;
          renderStockItems();
        } else if (document.getElementById('stock-overlay').style.display !== 'none') {
          if (window._stockLocalWrite && Date.now() - window._stockLocalWrite < 2000) return;
          renderStockItems();
        }
      });
    } else {
      renderStockItems();
    }
  });
}
function closeStockOverlay() {
  document.getElementById('stock-overlay').style.display = 'none';
  document.body.style.overflow = '';
  // Desactivar listener en tiempo real al cerrar
  if (window._stockUnsubscribe) {
    try {
      window._stockUnsubscribe();
    } catch (e) {}
    window._stockUnsubscribe = null;
  }
  if (window._stockFromAdmin) {
    window._stockFromAdmin = false;
    _adminLoggedIn = window._adminWasLoggedIn || true;
    // Simplemente reabrir el panel admin desde cero
    openAdmin();
  }
}

// Productos que usan check ✅/❌ (boles, papel térmico, etc.)
const STOCK_TEXTO_LIBRE = new Set(['Bol de pollo', 'Redondel tartas plateadas', 'Cajas de bolsas', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm', 'Rollo papel cocina / horno']);

// Productos tipo "bote" (cremas)
const STOCK_BOTE = new Set(['Crema de pistacho', 'Crema Kinder']);

// Productos con unidad fija
const STOCK_FIXED_UNIT = {
  'Guantes talla L': 'caja',
  'Guantes talla M': 'caja',
  'Cebolla crujiente': 'bolsa',
  'Orégano': 'bote',
  'Eneldo': 'bote',
  'Pimienta': 'bote',
  'Nuez moscada': 'bote',
  'Hierbas provenzales': 'bote'
};

// Productos que admiten ½
const STOCK_ADMITE_MEDIO = new Set(['Rulo de cabra', 'Uds. sacos de cebollas', 'Cebolla crujiente', 'Caja pizza', 'Caja cucharas', 'Aceite de oliva virgen extra', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm']);

// Productos con ½ solo en cajas
const STOCK_ADMITE_MEDIO_CAJAS = new Set(['Galleta Lotus', 'Filipinos blancos']);

// Productos de limpieza: ✅ hay / ❌ no hay
const STOCK_LIMPIEZA = new Set(['Nanas limpieza', 'Fregonas', 'Cepillos', 'Recogedor', 'Trapos', 'Lejía', 'Desengrasante', 'Friegasuelos', 'Papel higiénico', 'Estropajos', 'Ambientador', 'Limpia cristales', 'Servilletas', 'Chocolate negro', 'Chocolate blanco', 'Chocolate con leche']);

// Labels visuales con nota foto
const STOCK_DISPLAY_LABEL = {
  'Bol de pollo': 'Bol de pollo <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Redondel tartas plateadas': 'Redondel tartas plateadas <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Cajas de bolsas': 'Cajas de bolsas <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Papel térmico 57×35 mm': 'Papel térmico 57×35 mm <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Papel térmico 80 mm': 'Papel térmico 80 mm <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Rollo papel cocina / horno': 'Rollo papel cocina / horno <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>'
};

// Papel térmico admite ½ paquete en check
const STOCK_CHECK_MEDIO = new Set(['Papel térmico 57×35 mm', 'Papel térmico 80 mm']);
function renderStockItems() {
  const data = getStockData();
  const container = document.getElementById('stock-items-list');
  // Build flat index for callbacks
  window._stockItemIndex = {};
  let idx = 0;
  Object.entries(data).forEach(_ref27 => {
    let _ref28 = _slicedToArray(_ref27, 2),
      group = _ref28[0],
      items = _ref28[1];
    return items.forEach(ing => {
      window._stockItemIndex[idx++] = ing;
    });
  });
  container.innerHTML = Object.entries(data).map(_ref29 => {
    let _ref30 = _slicedToArray(_ref29, 2),
      group = _ref30[0],
      items = _ref30[1];
    if (!items.length) return '';
    const isExtras = group === 'extras';
    return '<div style="margin-bottom:4px">' + '<div style="font-family:\'Anton\',sans-serif;font-size:18px;color:#3D1F0D;margin:14px 0 8px;padding-bottom:6px;border-bottom:2px solid rgba(244,196,48,0.4);display:flex;align-items:center;gap:8px;letter-spacing:0.03em">' + (STOCK_GROUP_LABELS[group] || group) + '</div>' + items.map(ing => {
      if (_stockEditMode) {
        return '<div draggable="true" data-group="' + group + '" data-ing="' + ing.replace(/"/g, '&quot;') + '"' + ' style="display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:6px;cursor:grab"' + ' ondragstart="stockOverlayDragStart(event)" ondragover="stockOverlayDragOver(event)" ondrop="stockOverlayDrop(event)" ondragend="stockOverlayDragEnd(event)">' + '<span style="color:#8A6A4E;font-size:18px;user-select:none">☰</span>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<button onclick="stockOverlayRemoveItem(\'' + group + '\',\'' + ing.replace(/'/g, "\\'") + '\')" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer">✕</button>' + '</div>';
      }
      const i = Object.values(window._stockItemIndex).indexOf(ing);
      if (isExtras) {
        const eid = 'extra_' + ing.replace(/[^a-z0-9]/gi, '_');
        return '<div style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:8px">' + '<div style="font-size:14px;font-weight:600;color:#3D1F0D;margin-bottom:6px">' + escapeHtml(ing) + '</div>' + '<textarea id="' + eid + '" placeholder="Escribe aqu\u00ED..." rows="2" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 10px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;resize:none;box-sizing:border-box"></textarea>' + '</div>';
      }
      // ── LIMPIEZA (✅ Hay / ❌ No hay) ──
      if (STOCK_LIMPIEZA.has(ing)) {
        const safeIngL = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const state = window._stockLimpieza && window._stockLimpieza[ing] || 0;
        const bgL = state === 1 ? '#eafaf1' : state === -1 ? '#fdf0ee' : '#FFFFFF';
        const borderL = state === 1 ? '#a9dfbf' : state === -1 ? '#e74c3c' : '#F5E6C8';
        const btnBaseL = 'width:42px;height:42px;border-radius:50%;font-size:18px;cursor:pointer;border:2px solid ';
        const btnHay = state === 1 ? btnBaseL + '#27855a;background:#eafaf1' : btnBaseL + '#F5E6C8;background:#FFFFFF';
        const btnNo = state === -1 ? btnBaseL + '#c0392b;background:#fdf0ee' : btnBaseL + '#F5E6C8;background:#FFFFFF';
        return '<div style="background:' + bgL + ';border:2px solid ' + borderL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;flex-shrink:0">' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',1)" style="' + btnHay + '">✅</button>' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',-1)" style="' + btnNo + '">❌</button>' + '</div></div></div>';
      }

      // ── CHECK + NOTA OPCIONAL (boles, papel térmico, etc.) ──
      if (STOCK_TEXTO_LIBRE.has(ing)) {
        const safeIngTL = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const checked = !!(window._stockChecks && window._stockChecks[ing]);
        const nota = window._stockNotas && window._stockNotas[ing] || '';
        const notaId = 'stk-nota-' + ing.replace(/[^a-z0-9]/gi, '_');
        const bgTL = checked ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
        const borderTL = checked ? '#3D1F0D' : '#F5E6C8';
        const btnBorderTL = checked ? '#3D1F0D' : '#F5E6C8';
        const btnBgTL = checked ? '#3D1F0D' : '#FFFFFF';
        return '<div style="background:' + bgTL + ';border:2px solid ' + borderTL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<button onclick="stockCheckToggle(\'' + safeIngTL + '\')" style="width:36px;height:36px;flex-shrink:0;border-radius:50%;border:2px solid ' + btnBorderTL + ';background:' + btnBgTL + ';font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">' + (checked ? '\u2705' : '') + '</button>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(STOCK_DISPLAY_LABEL[ing] || ing) + '</span>' + '</div>' + (checked ? '<div style="margin-top:10px;display:flex;flex-direction:column">' + (STOCK_CHECK_MEDIO.has(ing) ? '<button onclick="stockNotaSetMedio(\'' + safeIngTL + '\')" style="align-self:flex-start;padding:5px 12px;border-radius:7px;border:1.5px solid #3D1F0D;background:' + (nota === '\u00bd paquete' ? 'rgba(244,196,48,0.08)' : '#FFFFFF') + ';color:' + (nota === '\u00bd paquete' ? '#3D1F0D' : '#8A6A4E') + ';font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">\u00bd paquete</button>' : '') + '<input type="text" id="' + notaId + '" value="' + nota.replace(/"/g, '&quot;') + '" placeholder="Nota opcional\u2026" oninput="stockNotaChange(\'' + safeIngTL + '\',this.value)" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 12px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;box-sizing:border-box">' + '</div>' : '') + '</div>';
      }

      // ── BOTE (cremas) ──
      if (STOCK_BOTE.has(ing)) {
        const boteVal = _stockSelections[ing] || 0;
        const safeIngB = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const bgB = boteVal > 0 ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
        const borderB = boteVal > 0 ? '#3D1F0D' : '#F5E6C8';
        const boteStr = boteVal > 0 ? boteVal % 1 === 0.5 ? Math.floor(boteVal) > 0 ? Math.floor(boteVal) + '\u00bd' : '\u00bd' : boteVal : '\u2013';
        return '<div style="background:' + bgB + ';border:2px solid ' + borderB + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockSetBote(\'' + safeIngB + '\',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + '<button onclick="stockBoteMedio(\'' + safeIngB + '\')" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:13px;font-weight:900;cursor:pointer;color:#3D1F0D">\u00bd</button>' + '<span style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center">' + boteStr + '</span>' + '<button onclick="stockSetBote(\'' + safeIngB + '\',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="margin-top:8px"><span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">Bote</span></div>' + '</div>';
      }

      // ── CONTABLE ──
      const qty = _stockSelections[ing] !== undefined ? _stockSelections[ing] : null;
      const fixedUnit = STOCK_FIXED_UNIT[ing] || null;
      const unit = fixedUnit || _stockUnits && _stockUnits[ing] || 'unidades';
      const sel = qty !== null && qty > 0;
      const bg = sel ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
      const border = sel ? '#3D1F0D' : '#F5E6C8';
      const safeIng = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const unitBtnBase = 'padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;border:1.5px solid ';
      const unitCajas = unit === 'cajas' ? unitBtnBase + 'rgba(61,31,13,0.2);background:rgba(61,31,13,0.08);color:#3D1F0D' : unitBtnBase + 'rgba(61,31,13,0.15);background:#FFFFFF;color:#3D1F0D';
      const unitUds = unit === 'unidades' ? unitBtnBase + 'rgba(61,31,13,0.2);background:rgba(61,31,13,0.08);color:#3D1F0D' : unitBtnBase + 'rgba(61,31,13,0.15);background:#FFFFFF;color:#3D1F0D';
      const qtyId = 'stk-qty-' + i;
      const showMedio = STOCK_ADMITE_MEDIO.has(ing) || STOCK_ADMITE_MEDIO_CAJAS.has(ing) && unit === 'cajas';
      const medioBtn = showMedio ? '<button onclick="stockQtyMedio(\'' + safeIng + '\')" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:13px;font-weight:900;cursor:pointer;color:#3D1F0D">\u00bd</button>' : '';
      return '<div style="background:' + bg + ';border:2px solid ' + border + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span onclick="stockToggle(' + i + ')" style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1;cursor:pointer">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockQty(' + i + ',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + medioBtn + '<span id="' + qtyId + '" onclick="stockActivateInput(' + i + ')" title="Pulsa para escribir" style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center;cursor:text;border-radius:6px;padding:2px 4px' + (qty > 0 ? ';background:rgba(0,0,0,0.05)' : '') + '">' + (qty !== null ? qty : '\u2013') + '</span>' + '<button onclick="stockQty(' + i + ',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="display:flex;margin-top:8px;align-items:center">' + (fixedUnit ? '<span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">' + fixedUnit.charAt(0).toUpperCase() + fixedUnit.slice(1) + '</span>' : '<button onclick="stockSetUnit(\'' + safeIng + '\',\'cajas\')" style="' + unitCajas + '">📦 Cajas</button>' + '<button onclick="stockSetUnit(\'' + safeIng + '\',\'unidades\')" style="' + unitUds + '">🔢 Unidades</button>') + '</div></div>';
    }).join('') + '</div>';
  }).join('');
}
function stockToggle(i) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  _stockSelections[ing] = _stockSelections[ing] ? 0 : 1;
  if (!_stockSelections[ing]) delete _stockSelections[ing];
  renderStockItems();
}
function stockQty(i, delta) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  const current = _stockSelections[ing];
  if (current === undefined) {
    if (delta > 0) { _stockSelections[ing] = 0; }
    renderStockItems();
    return;
  }
  const next = current + delta;
  if (next < 0) { delete _stockSelections[ing]; } else { _stockSelections[ing] = next; }
  renderStockItems();
}
function toggleStockItem(ing) {
  _stockSelections[ing] = _stockSelections[ing] ? 0 : 1;
  if (!_stockSelections[ing]) delete _stockSelections[ing];
  renderStockItems();
}
function changeStockQty(ing, delta) {
  const next = Math.max(0, (_stockSelections[ing] || 0) + delta);
  if (next === 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Unidad por ingrediente ──
function stockSetUnit(ing, unit) {
  if (!window._stockUnits) window._stockUnits = {};
  _stockUnits[ing] = unit;
  renderStockItems();
}

// ── Input numérico inline ──
function stockActivateInput(i) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  const qtyId = 'stk-qty-' + i;
  const span = document.getElementById(qtyId);
  if (!span) return;
  const currentQty = _stockSelections[ing] || 0;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = currentQty || '';
  input.placeholder = '0';
  input.style.cssText = 'width:52px;height:32px;font-size:18px;font-weight:900;text-align:center;border:2px solid #3D1F0D;border-radius:8px;outline:none;color:#3D1F0D;font-family:\'DM Sans\',sans-serif;-moz-appearance:textfield';
  span.replaceWith(input);
  input.focus();
  input.select();
  function applyInput() {
    const v = parseInt(input.value, 10);
    if (!isNaN(v) && v > 0) _stockSelections[ing] = v;else delete _stockSelections[ing];
    renderStockItems();
  }
  input.addEventListener('blur', applyInput);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') renderStockItems();
  });
}

// ── Botón ½ para contables ──
function stockQtyMedio(ing) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = cur % 1 === 0.5 ? Math.floor(cur) : cur + 0.5;
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Bote: +1 / -1 / ½ ──
function stockSetBote(ing, delta) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = Math.max(0, cur + delta);
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}
function stockBoteMedio(ing) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = cur % 1 === 0.5 ? Math.floor(cur) : cur + 0.5;
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Check toggle (boles, papel térmico) ──
function stockCheckToggle(ing) {
  if (!window._stockChecks) window._stockChecks = {};
  _stockChecks[ing] = !_stockChecks[ing];
  if (!_stockChecks[ing]) {
    delete _stockChecks[ing];
    if (window._stockNotas) delete _stockNotas[ing];
  }
  renderStockItems();
}
function stockNotaChange(ing, val) {
  if (!window._stockNotas) window._stockNotas = {};
  if (val.trim()) _stockNotas[ing] = val;else delete _stockNotas[ing];
}
function stockNotaSetMedio(ing) {
  if (!window._stockNotas) window._stockNotas = {};
  if (_stockNotas[ing] === '½ paquete') delete _stockNotas[ing];else _stockNotas[ing] = '½ paquete';
  renderStockItems();
}

// ── Limpieza: ✅ hay / ❌ no hay ──
function stockLimpiezaSet(ing, state) {
  if (!window._stockLimpieza) window._stockLimpieza = {};
  if (_stockLimpieza[ing] === state) delete _stockLimpieza[ing];else _stockLimpieza[ing] = state;
  renderStockItems();
}
const STOCK_HISTORIAL_KEY = 'dpf_stock_historial';
function getStockHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STOCK_HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveToStockHistorial(ts, lines) {
  const hist = getStockHistorial();
  hist.push({
    ts,
    lines
  });
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(hist));

  // 🔥 Subir a Firebase — reintenta si aún no está listo
  function subirAFirebase(intentos) {
    if (window.fb_saveStockHistorial) {
      window._stockLocalWrite = Date.now();
      window.fb_saveStockHistorial(hist).catch(e => console.warn('Firebase stock historial error:', e));
    } else if (intentos > 0) {
      setTimeout(() => subirAFirebase(intentos - 1), 500);
    } else {
      console.warn('fb_saveStockHistorial no disponible tras varios intentos');
    }
  }
  subirAFirebase(10); // hasta 5 segundos de espera
}
function deleteStockHistorialEntry(i) {
  const hist = getStockHistorial();
  hist.splice(i, 1);
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(hist));
  renderStockHistorial();
}
function clearOldStockLists() {
  const hist = getStockHistorial();
  if (hist.length <= 1) {
    alert('Solo hay una lista, no hay antiguas que borrar');
    return;
  }
  if (!confirm('¿Borrar todas las listas excepto la más reciente?')) return;
  const last = hist[hist.length - 1];
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify([last]));
  renderStockHistorial();
}
function renderStockHistorial() {
  const el = document.getElementById('stock-historial-list');
  if (!el) return;
  const hist = getStockHistorial();
  if (!hist.length) {
    el.innerHTML = '<p style="font-size:13px;color:#8A6A4E">Sin listas guardadas aún.</p>';
    return;
  }
  // Most recent at top, shown separately; rest in "carpeta" collapsed
  const sorted = [...hist]; // oldest first, newest last
  const latest = sorted[sorted.length - 1];
  const older = sorted.slice(0, sorted.length - 1);
  let html = '';

  // Latest entry (always visible)
  html += '<div style="background:rgba(244,196,48,0.08);border:2px solid #3D1F0D;border-radius:12px;padding:14px;margin-bottom:12px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' + '<span style="font-size:13px;font-weight:700;color:#3D1F0D">&#x1F4CC; Última lista — ' + latest.ts + '</span>' + '<button onclick="deleteStockHistorialEntry(' + (hist.length - 1) + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + latest.lines.map(l => '<div style="font-size:13px;color:#2A1506">&#x2022; ' + l + '</div>').join('') + '</div>';

  // Older entries in a collapsible folder
  if (older.length) {
    html += '<details style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:12px;margin-bottom:8px">' + '<summary style="font-size:13px;font-weight:700;color:#3D1F0D;cursor:pointer">&#x1F4C2; Listas anteriores (' + older.length + ')</summary>' + '<div style="margin-top:12px;display:flex;flex-direction:column">' + older.map((entry, i) => '<div style="background:#FFF8EE;border:1px solid #F5E6C8;border-radius:8px;padding:10px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' + '<span style="font-size:12px;font-weight:600;color:#8A6A4E">' + entry.ts + '</span>' + '<button onclick="deleteStockHistorialEntry(' + i + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:2px 7px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + entry.lines.map(l => '<div style="font-size:12px;color:#2A1506">&#x2022; ' + l + '</div>').join('') + '</div>').join('') + '</div></details>';
  }
  el.innerHTML = html;
}
function exportStockPDF() {
  const lines = window._lastStockLines || [];
  const ts = window._lastStockTs || '';
  if (!lines.length) return;
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n  <style>\n    body { font-family: Arial, sans-serif; padding: 30px; color: #2A1506; }\n    h2 { color: #3D1F0D; margin-bottom: 4px; }\n    p.ts { font-size: 12px; color: #8A6A4E; margin-bottom: 20px; }\n    ul { list-style: none; padding: 0; }\n    li { padding: 6px 0; border-bottom: 1px solid #F5E6C8; font-size: 14px; }\n    li:before { content: \"\u2022 \"; color: #3D1F0D; font-weight: bold; }\n  </style></head><body>\n  <h2>\uD83D\uDCE6 Lista de reposici\xF3n</h2>\n  <p class=\"ts\">".concat(ts, "</p>\n  <ul>").concat(lines.map(l => '<li>' + l + '</li>').join(''), "</ul>\n  </body></html>");
  const blob = new Blob([html], {
    type: 'text/html'
  });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    setTimeout(() => {
      w.print();
    }, 600);
  }
}
function closeStockResultModal() {
  document.getElementById('stock-result-modal').style.display = 'none';
  _stockSelections = {};
  _stockUnits = {};
  _stockChecks = {};
  _stockNotas = {};
  _stockLimpieza = {};
  renderStockItems();
}
function ultimoStockDebug() {
  const dbg = document.getElementById('ultimo-stock-debug');
  dbg.style.display = 'block';
  dbg.innerHTML = 'Comprobando...';

  // Info local — inmediata
  const local = localStorage.getItem('dpf_stock_historial');
  let localInfo = 'LOCAL: ' + (local ? 'SI (' + local.length + ' chars)' : 'VACIO');
  try {
    const parsed = JSON.parse(local || '[]');
    const arr = Array.isArray(parsed) ? parsed : Object.values(parsed);
    localInfo += ' | ' + arr.length + ' entradas';
    if (arr.length) localInfo += ' | ultima ts: ' + (arr[arr.length - 1].ts || '?');
  } catch (e) {
    localInfo += ' | ERROR parse';
  }
  dbg.innerHTML = localInfo + '<br>FIREBASE: comprobando...';

  // Info Firebase — con reintentos si aún no está listo
  function checkFb(intentos) {
    const fbReady = window._firebaseReady ? 'SI' : 'NO';
    const fbLoad = window.fb_loadStockHistorial ? 'SI' : 'NO';
    const fbSave = window.fb_saveStockHistorial ? 'SI' : 'NO';
    dbg.innerHTML = localInfo + '<br>Firebase listo: ' + fbReady + ' | fb_load: ' + fbLoad + ' | fb_save: ' + fbSave + (intentos < 25 ? ' | intentos: ' + (25 - intentos) : '');
    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial().then(fbRaw => {
        let fbInfo = 'FIREBASE: ';
        if (!fbRaw) {
          fbInfo += 'VACIO/NULL';
        } else {
          const arr = Array.isArray(fbRaw) ? fbRaw : Object.values(fbRaw);
          fbInfo += 'SI | ' + arr.length + ' entradas';
          if (arr.length) fbInfo += ' | ultima ts: ' + (arr[arr.length - 1].ts || '?');
        }
        dbg.innerHTML = [localInfo, fbInfo, 'fb_save: ' + (window.fb_saveStockHistorial ? 'DISPONIBLE' : 'NO DISPONIBLE')].join('<br>');
      }).catch(e => {
        dbg.innerHTML = localInfo + '<br>FIREBASE ERROR: ' + e.message;
      });
    } else if (intentos > 0) {
      setTimeout(() => checkFb(intentos - 1), 400);
    } else {
      dbg.innerHTML = localInfo + '<br>FIREBASE: NO DISPONIBLE tras 10s' + '<br>_firebaseReady: ' + fbReady + '<br>Módulo cargado: ' + (window._firebaseModuleLoaded ? 'SI' : 'NO') + (window._firebaseError ? '<br>Error: ' + window._firebaseError : '');
    }
  }
  checkFb(25); // hasta 10 segundos
}
function mostrarUltimoStock() {
  const modal = document.getElementById('ultimo-stock-modal');
  const linesEl = document.getElementById('ultimo-stock-lines');
  const tsEl = document.getElementById('ultimo-stock-ts');
  modal.style.display = 'block';
  linesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#8A6A4E;font-size:13px">&#x1F504; Cargando \u00FAltimo stock\u2026</div>';
  tsEl.textContent = '';
  function normalizeHist(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'object') return Object.values(raw).filter(Boolean);
    return [];
  }
  function renderUltimo(raw) {
    const arr = normalizeHist(raw);
    if (!arr.length) {
      linesEl.innerHTML = '<p style="color:#8A6A4E;font-size:13px">A\u00FAn no hay ning\u00FAn stock guardado.</p>';
      tsEl.textContent = '';
      return;
    }
    const last = arr[arr.length - 1];
    tsEl.textContent = '\uD83D\uDCC5 ' + (last.ts || '');
    const lines = normalizeHist(last.lines);
    linesEl.innerHTML = lines.map(l => '<div style="padding:2px 0">\u2022 ' + l + '</div>').join('') || '<p style="color:#8A6A4E;font-size:13px">Lista vac\u00EDa.</p>';
  }
  function tryLoad(intentos) {
    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial().then(fbRaw => {
        const fbHist = normalizeHist(fbRaw);
        if (fbHist.length) {
          localStorage.setItem('dpf_stock_historial', JSON.stringify(fbHist));
          renderUltimo(fbHist);
        } else {
          renderUltimo(getStockHistorial());
        }
      }).catch(() => renderUltimo(getStockHistorial()));
    } else if (intentos > 0) {
      // Firebase aún no listo — reintenta cada 400ms hasta 10 veces (4 segundos)
      setTimeout(() => tryLoad(intentos - 1), 400);
    } else {
      renderUltimo(getStockHistorial());
    }
  }
  tryLoad(10);
}
function saveStockList() {
  const data = getStockData();
  const lines = [];
  // Normal groups: +/- quantities
  Object.entries(_stockSelections).filter(_ref31 => {
    let _ref32 = _slicedToArray(_ref31, 2),
      v = _ref32[1];
    return v > 0;
  }).forEach(_ref33 => {
    let _ref34 = _slicedToArray(_ref33, 2),
      name = _ref34[0],
      qty = _ref34[1];
    if (STOCK_BOTE.has(name)) {
      const boteStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      lines.push(name + ': ' + boteStr + ' ' + (qty <= 1 ? 'bote' : 'botes'));
    } else {
      const fixedU = STOCK_FIXED_UNIT[name] || null;
      const unit = fixedU || _stockUnits && _stockUnits[name] || 'unidades';
      const qtyStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      const unitLabel = fixedU ? qty <= 1 ? fixedU : fixedU + 's' : unit === 'cajas' ? qty <= 1 ? 'caja' : 'cajas' : qty <= 1 ? 'ud' : 'uds';
      lines.push(name + ': ' + qtyStr + ' ' + unitLabel);
    }
  });
  // Checks (boles, papel térmico)
  Object.entries(window._stockChecks || {}).filter(_ref35 => {
    let _ref36 = _slicedToArray(_ref35, 2),
      v = _ref36[1];
    return v;
  }).forEach(_ref37 => {
    let _ref38 = _slicedToArray(_ref37, 1),
      ing = _ref38[0];
    const nota = window._stockNotas && window._stockNotas[ing] ? ' — ' + window._stockNotas[ing] : '';
    lines.push('✅ ' + ing + nota);
  });
  // Limpieza
  Object.entries(window._stockLimpieza || {}).forEach(_ref39 => {
    let _ref40 = _slicedToArray(_ref39, 2),
      ing = _ref40[0],
      state = _ref40[1];
    if (state === 1) lines.push('✅ ' + ing + ': HAY');else if (state === -1) lines.push('❌ ' + ing + ': NO HAY');
  });
  // Extras: text fields
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi, '_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) {
    alert('Selecciona al menos un ingrediente con cantidad mayor a 0');
    return;
  }
  const ts = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  try {
    logActivity('\uD83D\uDCE6 Reposici\u00F3n (' + ts + '): ' + lines.join(' | '));
  } catch (e) {}
  saveToStockHistorial(ts, lines);
  const waText = encodeURIComponent('\uD83D\uDCE6 Stock (' + ts + '):\n' + lines.map(l => '\u2022 ' + l).join('\n'));
  const waUrl = 'https://wa.me/34638292510?text=' + waText;
  const resLines = document.getElementById('stock-result-lines');
  if (resLines) resLines.innerHTML = lines.map(l => '\u2022 ' + l).join('<br>');
  const waBtn = document.getElementById('stock-wa-btn');
  if (waBtn) waBtn.href = waUrl;
  window._lastStockLines = lines;
  window._lastStockTs = ts;
  const modal = document.getElementById('stock-result-modal');
  if (modal) modal.style.display = 'block';
}
function sendStockWhatsApp() {
  const data = getStockData();
  const lines = [];
  Object.entries(_stockSelections).filter(_ref41 => {
    let _ref42 = _slicedToArray(_ref41, 2),
      v = _ref42[1];
    return v > 0;
  }).forEach(_ref43 => {
    let _ref44 = _slicedToArray(_ref43, 2),
      name = _ref44[0],
      qty = _ref44[1];
    if (STOCK_BOTE.has(name)) {
      const boteStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      lines.push(name + ': ' + boteStr + ' ' + (qty <= 1 ? 'bote' : 'botes'));
    } else {
      const fixedU = STOCK_FIXED_UNIT[name] || null;
      const unit = fixedU || _stockUnits && _stockUnits[name] || 'unidades';
      const qtyStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      const unitLabel = fixedU ? qty <= 1 ? fixedU : fixedU + 's' : unit === 'cajas' ? qty <= 1 ? 'caja' : 'cajas' : qty <= 1 ? 'ud' : 'uds';
      lines.push(name + ': ' + qtyStr + ' ' + unitLabel);
    }
  });
  // Checks (boles, papel térmico)
  Object.entries(window._stockChecks || {}).filter(_ref45 => {
    let _ref46 = _slicedToArray(_ref45, 2),
      v = _ref46[1];
    return v;
  }).forEach(_ref47 => {
    let _ref48 = _slicedToArray(_ref47, 1),
      ing = _ref48[0];
    const nota = window._stockNotas && window._stockNotas[ing] ? ' — ' + window._stockNotas[ing] : '';
    lines.push('✅ ' + ing + nota);
  });
  // Limpieza
  Object.entries(window._stockLimpieza || {}).forEach(_ref49 => {
    let _ref50 = _slicedToArray(_ref49, 2),
      ing = _ref50[0],
      state = _ref50[1];
    if (state === 1) lines.push('✅ ' + ing + ': HAY');else if (state === -1) lines.push('❌ ' + ing + ': NO HAY');
  });
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi, '_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) {
    alert('Selecciona al menos un ingrediente con cantidad mayor a 0');
    return;
  }
  const ts = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const waText = encodeURIComponent('\uD83D\uDCE6 Stock (' + ts + '):\n' + lines.map(l => '\u2022 ' + l).join('\n'));
  window.open('https://wa.me/34638292510?text=' + waText, '_blank');
}

// bimba secret handled in unified keydown listener above

// ── EDITAR TOTAL DE PEDIDO ──
function startEditOrderTotal(orderNum) {
  const safeId = orderNum.replace('#', '');
  const displayEl = document.getElementById('total-display-' + safeId);
  if (!displayEl) return;
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  const order = (stats.orders || []).find(o => o.num === orderNum);
  if (!order) return;
  const currentTotal = order.total;
  const inputEl = document.createElement('input');
  inputEl.type = 'number';
  inputEl.step = '0.01';
  inputEl.min = '0';
  inputEl.value = currentTotal.toFixed(2);
  inputEl.id = 'total-input-' + safeId;
  inputEl.style.cssText = 'width:90px;font-size:13px;font-weight:700;color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;padding:2px 6px;text-align:right;background:rgba(244,196,48,0.08);outline:none';
  displayEl.replaceWith(inputEl);
  inputEl.focus();
  inputEl.select();
  function doSave() {
    saveOrderTotal(orderNum, inputEl.value);
  }
  inputEl.addEventListener('blur', doSave);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSave();
    }
    if (e.key === 'Escape') {
      loadLiveOrders();
    }
  });
}
async function saveOrderTotal(orderNum, rawValue) {
  var _document$getElementB30;
  const newTotal = parseFloat(rawValue);
  if (isNaN(newTotal) || newTotal < 0) {
    loadLiveOrders();
    return;
  }
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  if (window.fb_getStats) {
    try {
      const fb = await window.fb_getStats(todayKey);
      if (fb) stats = fb;
    } catch (e) {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
  }
  if (!stats || !stats.orders) {
    loadLiveOrders();
    return;
  }
  const order = stats.orders.find(o => o.num === orderNum);
  if (!order) {
    loadLiveOrders();
    return;
  }
  const oldTotal = order.total;
  stats.total = parseFloat((stats.total - oldTotal + newTotal).toFixed(2));
  order.total = newTotal;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try {
      await window.fb_saveStats(stats);
    } catch (e) {
      console.warn('Firebase stats error', e);
    }
  }
  logActivity('\u270f\ufe0f Precio editado: pedido ' + orderNum + ' \u2014 ' + oldTotal.toFixed(2) + ' \u20ac \u2192 ' + newTotal.toFixed(2) + ' \u20ac');
  loadLiveOrders();
  if ((_document$getElementB30 = document.getElementById('admin-stats')) !== null && _document$getElementB30 !== void 0 && _document$getElementB30.classList.contains('active')) loadDayStats();
}

