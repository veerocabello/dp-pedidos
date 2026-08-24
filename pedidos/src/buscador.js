// ── BUSCADOR del panel admin y del panel bimba ──
// Busca en secciones (navegación estática) y en contenido real: productos
// de la carta, ingredientes de stock, empleados, códigos de descuento y
// premios de ruleta/rasca. Al hacer clic navega de verdad a la sección y,
// si el resultado es contenido concreto, hace scroll + resalta la fila.

let _buscadorLastAdmin = [];
let _buscadorLastBimba = [];
let _buscadorDiscountsCache = null;
let _buscadorPremiosCache = null; // { ruleta: [...], rasca: [...] }

function _buscadorNorm(s) {
  // La coma decimal ("5,90") se normaliza a punto para que encuentre
  // precios como "5.90 €", que es como los formatea el resto de la app.
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/,/g, '.');
}

function _buscadorHighlight(text, q) {
  const t = String(text == null ? '' : text);
  if (!q) return escapeHtml(t);
  const i = _buscadorNorm(t).indexOf(_buscadorNorm(q));
  if (i === -1) return escapeHtml(t);
  return escapeHtml(t.slice(0, i)) + '<mark>' + escapeHtml(t.slice(i, i + q.length)) + '</mark>' + escapeHtml(t.slice(i + q.length));
}

function _buscadorItemMatches(item, q) {
  if (!q) return true;
  const nq = _buscadorNorm(q);
  if (_buscadorNorm(item.nombre).includes(nq)) return true;
  return (item.meta || []).some(m => _buscadorNorm(m.valor).includes(nq));
}

// El panel que se acaba de abrir se rellena de forma asíncrona (lectura a
// Firebase) — con una red lenta, el elemento buscado podía no existir
// todavía cuando pasaba el "delay" fijo de antes, y esto se quedaba
// callado sin más (el panel se abría igual, pero la fila buscada nunca se
// resaltaba ni se desplazaba a la vista). Ahora, si al primer intento no
// está, se reintenta cada 150ms hasta 3s en total antes de rendirse — de
// sobra para una lectura normal a Firebase, incluso en una red lenta.
function _buscadorScrollFlash(id, delay, _intentos) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) {
      const intentosHechos = (_intentos || 0) + 1;
      if (intentosHechos * 150 < 3000) _buscadorScrollFlash(id, 150, intentosHechos);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('buscador-flash');
    setTimeout(() => el.classList.remove('buscador-flash'), 1500);
  }, delay || 300);
}

// Abre el acordeón bimba `panelId` simulando un clic en su fila `rowId`
// (reutiliza el toggle ya existente) solo si está cerrado.
function _buscadorAbrirBimbaAcordeon(panelId, rowId) {
  const panel = document.getElementById(panelId);
  const row = document.getElementById(rowId);
  if (panel && row && panel.style.display === 'none') row.click();
}

// ── SECCIONES (navegación estática) ──────────────────────────────────────
function _buscadorSeccionesAdmin() {
  const tab = id => document.querySelector('.admin-tab[data-section="' + id + '"]');
  return [
    { icon: '🍽️', badge: 'section', tipo: 'Sección', nombre: 'Carta', ruta: 'Panel admin', meta: [], go: () => showAdminSection('productos', tab('productos')) },
    { icon: '🏪', badge: 'section', tipo: 'Sección', nombre: 'Local', ruta: 'Panel admin', meta: [], go: () => showAdminSection('local', tab('local')) },
    { icon: '🔴', badge: 'section', tipo: 'Sección', nombre: 'En vivo', ruta: 'Panel admin · pedidos', meta: [], go: () => showAdminSection('pedidos', tab('pedidos')) },
    { icon: '📊', badge: 'section', tipo: 'Sección', nombre: 'Hoy', ruta: 'Panel admin · estadísticas', meta: [], go: () => showAdminSection('stats', tab('stats')) },
    { icon: '📅', badge: 'section', tipo: 'Sección', nombre: 'Historial', ruta: 'Panel admin', meta: [], go: () => showAdminSection('historial', tab('historial')) },
    { icon: '📦', badge: 'section', tipo: 'Sección', nombre: 'Stock', ruta: 'Panel admin', meta: [], go: () => { document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active')); if (typeof openStockInline === 'function') openStockInline(); } },
    { icon: '🎁', badge: 'section', tipo: 'Sección', nombre: 'Fidelización', ruta: 'Panel admin', meta: [], go: () => { showAdminSection('fidelizacion', tab('fidelizacion')); if (typeof renderFidelizacionList === 'function') renderFidelizacionList(); } },
    { icon: '🔔', badge: 'section', tipo: 'Sección', nombre: 'Alertas', ruta: 'Panel admin', meta: [], go: () => showAdminSection('alertas', tab('alertas')) },
    { icon: '🛡️', badge: 'section', tipo: 'Sección', nombre: 'Configuración de pedidos', ruta: 'Panel admin · ⚙️ Ajustes', meta: [], go: () => showAdminSection('pedidos-config', null) },
  ];
}

function _buscadorSeccionesBimba() {
  const volverYAbrir = (panelId, rowId) => () => {
    if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
    setTimeout(() => _buscadorAbrirBimbaAcordeon(panelId, rowId), 200);
  };
  return [
    { icon: '🔥', badge: 'section', tipo: 'Sección', nombre: 'Promociones', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('bimba-promos-body', 'mkt-row-promos') },
    { icon: '🎁', badge: 'section', tipo: 'Sección', nombre: 'Códigos de descuento', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('dc-panel', 'mkt-row-codigos') },
    { icon: '🎡', badge: 'section', tipo: 'Sección', nombre: 'Ruleta de premios', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('ruleta-admin-panel', 'mkt-row-ruleta') },
    { icon: '🎫', badge: 'section', tipo: 'Sección', nombre: 'Rasca y gana', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('rasca-admin-panel', 'mkt-row-rasca') },
    {
      icon: '👥', badge: 'section', tipo: 'Sección', nombre: 'Lista de empleados', ruta: 'bimba · Empleados', meta: [],
      go: () => { if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados(); setTimeout(() => _buscadorAbrirBimbaAcordeon('bimba-emp-body', 'emp-row-lista'), 100); }
    },
    {
      icon: '📋', badge: 'section', tipo: 'Sección', nombre: 'Historial de fichajes', ruta: 'bimba · Empleados', meta: [],
      go: () => { if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados(); setTimeout(() => _buscadorAbrirBimbaAcordeon('bimba-hist-body', 'emp-row-hist'), 100); }
    },
  ];
}

// ── CONTENIDO REAL ────────────────────────────────────────────────────────
function _buscadorContenidoAdmin() {
  const items = [];
  if (typeof MENU !== 'undefined') {
    MENU.forEach(p => {
      // p.price puede llegar no numérico o ausente (p.ej. sincronizado
      // directo desde Firebase sin pasar por el formulario que valida) —
      // antes p.price.toFixed(2) lanzaba una excepción sin capturar aquí
      // (a diferencia del bloque de ingredientes justo abajo, que sí está
      // protegido), y como esta función se llama en cada tecla del
      // buscador, un único producto así dejaba de mostrar resultados por
      // completo, sin ningún aviso.
      const priceNum = Number(p.price);
      const priceOk = isFinite(priceNum);
      const precioTxt = priceOk ? priceNum.toFixed(2) + ' €' : 'precio no válido';
      items.push({
        icon: '🍽️', badge: 'prod', tipo: 'Producto', nombre: p.name,
        ruta: 'Carta · ' + p.cat + ' · ' + precioTxt,
        meta: [{ etiqueta: 'categoría', valor: p.cat }, { etiqueta: 'precio', valor: priceOk ? priceNum.toFixed(2) : '—' }],
        go: () => {
          showAdminSection('productos', document.querySelector('.admin-tab[data-section="productos"]'));
          _buscadorScrollFlash('arow-' + p.id, 150);
        }
      });
    });
  }
  if (typeof pp2AllItems === 'function') {
    try {
      pp2AllItems().forEach(ing => {
        items.push({
          icon: '📦', badge: 'prod', tipo: 'Ingrediente', nombre: ing.nombre,
          ruta: 'Pedidos proveedores' + (ing.cat ? ' · ' + ing.cat : ''),
          meta: [{ etiqueta: 'grupo', valor: ing.cat || '' }],
          go: () => {
            if (typeof openPedidosProvOverlay === 'function') openPedidosProvOverlay();
            _pp2SearchQuery = ing.nombre;
            const sb = document.getElementById('pp2-search');
            if (sb) sb.value = ing.nombre;
            setTimeout(() => {
              if (typeof pp2Render === 'function') pp2Render();
              _buscadorScrollFlash('pp2-row-' + ing.id, 80);
            }, 450);
          }
        });
      });
    } catch (e) {}
  }
  return items;
}

function _buscadorContenidoBimba() {
  const items = [];
  if (typeof empLoadAll === 'function') {
    try {
      empLoadAll().forEach(e => {
        items.push({
          icon: '👤', badge: 'emp', tipo: 'Empleado', nombre: e.nombre,
          ruta: 'bimba · Empleados' + (e.deBaja ? ' · de baja' : ''),
          meta: [{ etiqueta: 'DNI', valor: e.dni || '' }, { etiqueta: 'tel', valor: e.tel || '' }],
          go: () => {
            if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados();
            setTimeout(() => {
              _buscadorAbrirBimbaAcordeon('bimba-emp-body', 'emp-row-lista');
              _buscadorScrollFlash('emp-row-' + e.id, 200);
            }, 100);
          }
        });
      });
    } catch (e) {}
  }
  // Solo códigos creados a mano — los RAS-/RUL- de premios no se listan
  // aquí tampoco (mismo criterio que dcCargar, ver admin-turnos-descuentos.js)
  if (_buscadorDiscountsCache) {
    Object.keys(_buscadorDiscountsCache).filter(code => !_buscadorDiscountsCache[code].origen).forEach(code => {
      const d = _buscadorDiscountsCache[code];
      items.push({
        icon: '🏷️', badge: 'code', tipo: 'Código', nombre: code,
        ruta: 'bimba · Códigos · ' + d.pct + '% · ' + (d.uses || 0) + '/' + d.maxUses + ' usos',
        meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('dc-panel', 'mkt-row-codigos');
            _buscadorScrollFlash('dc-row-' + code, 200);
          }, 300);
        }
      });
    });
  }
  if (_buscadorPremiosCache) {
    (_buscadorPremiosCache.ruleta || []).filter(p => p.nombre).forEach(p => {
      items.push({
        icon: '🎡', badge: 'premio', tipo: 'Premio', nombre: p.nombre, ruta: 'bimba · Ruleta de premios', meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('ruleta-admin-panel', 'mkt-row-ruleta');
            _buscadorScrollFlash('premio-row-' + p.id, 350);
          }, 300);
        }
      });
    });
    (_buscadorPremiosCache.rasca || []).filter(p => p.nombre).forEach(p => {
      items.push({
        icon: '🎫', badge: 'premio', tipo: 'Premio', nombre: p.nombre, ruta: 'bimba · Rasca y gana', meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('rasca-admin-panel', 'mkt-row-rasca');
            _buscadorScrollFlash('premio-row-' + p.id, 350);
          }, 300);
        }
      });
    });
  }
  return items;
}

// ── RENDER + WIRING ────────────────────────────────────────────────────────
function _buscadorRenderRow(item, q) {
  let nombreHtml, rutaHtml;
  if (!q || _buscadorNorm(item.nombre).includes(_buscadorNorm(q))) {
    nombreHtml = _buscadorHighlight(item.nombre, q);
    rutaHtml = escapeHtml(item.ruta);
  } else {
    const hit = (item.meta || []).find(m => _buscadorNorm(m.valor).includes(_buscadorNorm(q)));
    nombreHtml = escapeHtml(item.nombre);
    rutaHtml = escapeHtml(item.ruta) + (hit ? ' · coincide en ' + escapeHtml(hit.etiqueta) + ': ' + _buscadorHighlight(hit.valor, q) : '');
  }
  return '<button type="button" class="buscador-row" data-idx="' + item._idx + '">'
    + '<span class="buscador-row-icon">' + item.icon + '</span>'
    + '<span class="buscador-row-text">'
    + '<span class="buscador-row-top">'
    + '<span class="buscador-row-name">' + nombreHtml + '</span>'
    + '<span class="buscador-badge buscador-badge--' + item.badge + '">' + escapeHtml(item.tipo) + '</span>'
    + '</span>'
    + '<span class="buscador-row-path">' + rutaHtml + '</span>'
    + '</span>'
    + '</button>';
}

function _buscadorRenderizar(inputEl, resultsEl, seccionesFn, contenidoFn, tipoPanel) {
  const q = inputEl.value.trim();
  const items = q ? seccionesFn().concat(contenidoFn()) : seccionesFn();
  const found = (q ? items.filter(it => _buscadorItemMatches(it, q)) : items).slice(0, 24);
  if (tipoPanel === 'admin') _buscadorLastAdmin = found; else _buscadorLastBimba = found;
  resultsEl.innerHTML = found.length
    ? found.map((it, i) => _buscadorRenderRow(Object.assign({}, it, { _idx: i }), q)).join('')
    : '<div class="buscador-empty">Sin resultados' + (q ? ' para "' + escapeHtml(q) + '"' : '') + '</div>';
  resultsEl.classList.add('open');
}

function _buscadorWireResultsClick(resultsEl, tipoPanel, inputEl) {
  resultsEl.addEventListener('click', e => {
    const row = e.target.closest('.buscador-row');
    if (!row) return;
    const idx = parseInt(row.dataset.idx, 10);
    const item = (tipoPanel === 'admin' ? _buscadorLastAdmin : _buscadorLastBimba)[idx];
    if (!item) return;
    resultsEl.classList.remove('open');
    inputEl.blur();
    try { item.go(); } catch (err) { console.error('[buscador] error al navegar:', err); }
  });
}

function _buscadorRefreshBimbaCache(inputEl, resultsEl) {
  const rerenderSiHayTexto = () => { if (inputEl.value.trim()) _buscadorRenderizar(inputEl, resultsEl, _buscadorSeccionesBimba, _buscadorContenidoBimba, 'bimba'); };
  if (window.fb_loadDiscounts) {
    window.fb_loadDiscounts().then(d => { _buscadorDiscountsCache = d || {}; rerenderSiHayTexto(); }).catch(() => {});
  }
  if (window.fb_loadRuletaConfig) {
    window.fb_loadRuletaConfig().then(c => {
      _buscadorPremiosCache = _buscadorPremiosCache || {};
      _buscadorPremiosCache.ruleta = (c && c.premios) || [];
      rerenderSiHayTexto();
    }).catch(() => {});
  }
  if (window.fb_loadRascaConfig) {
    window.fb_loadRascaConfig().then(c => {
      _buscadorPremiosCache = _buscadorPremiosCache || {};
      _buscadorPremiosCache.rasca = (c && c.premios) || [];
      rerenderSiHayTexto();
    }).catch(() => {});
  }
}

function _buscadorInit() {
  const ai = document.getElementById('buscador-admin-input');
  const ar = document.getElementById('buscador-admin-results');
  if (ai && ar) {
    const renderAdmin = () => _buscadorRenderizar(ai, ar, _buscadorSeccionesAdmin, _buscadorContenidoAdmin, 'admin');
    ai.addEventListener('input', renderAdmin);
    ai.addEventListener('focus', renderAdmin);
    ai.addEventListener('keydown', e => { if (e.key === 'Escape') { ar.classList.remove('open'); ai.blur(); } });
    document.addEventListener('click', e => { if (!ai.contains(e.target) && !ar.contains(e.target)) ar.classList.remove('open'); });
    _buscadorWireResultsClick(ar, 'admin', ai);
  }
  const bi = document.getElementById('buscador-bimba-input');
  const br = document.getElementById('buscador-bimba-results');
  if (bi && br) {
    const renderBimba = () => _buscadorRenderizar(bi, br, _buscadorSeccionesBimba, _buscadorContenidoBimba, 'bimba');
    bi.addEventListener('input', renderBimba);
    bi.addEventListener('focus', () => { _buscadorRefreshBimbaCache(bi, br); renderBimba(); });
    bi.addEventListener('keydown', e => { if (e.key === 'Escape') { br.classList.remove('open'); bi.blur(); } });
    document.addEventListener('click', e => { if (!bi.contains(e.target) && !br.contains(e.target)) br.classList.remove('open'); });
    _buscadorWireResultsClick(br, 'bimba', bi);
  }
}
document.addEventListener('adminShellLoaded', _buscadorInit);
