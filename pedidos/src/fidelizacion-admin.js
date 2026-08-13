// ── PANEL ADMIN: FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META_ADMIN = 10;
// Umbral para marcar ritmo sospechoso: 2+ sellos separados por menos de
// esto se considera posible abuso (pedidos reales no suelen ir tan seguidos).
const FIDELIZACION_MINUTOS_SOSPECHOSO = 10;
// Con 3 o más premios pendientes sin canjear, algo raro pasa (lo normal es
// canjear pronto) — merece revisarse antes de que se acumule más.
const FIDELIZACION_TOPE_PREMIOS_PENDIENTES = 3;
// Con 3 o más nombres distintos usados por el mismo teléfono, puede que se
// esté compartiendo/reutilizando el número entre varias personas para
// sumar sellos más rápido de lo normal.
const FIDELIZACION_TOPE_NOMBRES_DISTINTOS = 3;
let _fidelizacionDataCache = null;

// Comprueba que "veces que ha completado el ciclo" cuadra con "premios ya
// canjeados + premios todavía pendientes de entregar" — si no cuadra, es
// señal de que se ha tocado algo a mano de forma rara (o hay un fallo),
// no solo de un ritmo de pedidos sospechoso.
function _clienteConNumerosQueNoCuadran(c) {
  const vecesCompletado = typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0;
  const canjes = Array.isArray(c.historialCanjes) ? c.historialCanjes.length : 0;
  const premiosPendientes = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
  return (canjes + premiosPendientes) !== vecesCompletado;
}

// Devuelve true si el cliente tiene 2 o más sellos consecutivos separados
// por menos de FIDELIZACION_MINUTOS_SOSPECHOSO minutos. Si el admin ya
// revisó y descartó un ritmo sospechoso (marcarRitmoRevisado), solo se
// tienen en cuenta los sellos posteriores a esa revisión — así un patrón
// ya comprobado como legítimo no se queda marcado en rojo para siempre,
// pero si vuelve a pasar algo raro DESPUÉS, sí se vuelve a avisar.
function _clienteConRitmoSospechoso(historialSellos, revisadoHastaTs) {
  if (!historialSellos || historialSellos.length < 2) return false;
  const umbralMs = FIDELIZACION_MINUTOS_SOSPECHOSO * 60 * 1000;
  const desde = revisadoHastaTs || 0;
  const relevantes = historialSellos.filter(h => h && h.ts > desde);
  if (relevantes.length < 2) return false;
  for (let i = 1; i < relevantes.length; i++) {
    const prev = relevantes[i - 1] && relevantes[i - 1].ts;
    const curr = relevantes[i] && relevantes[i].ts;
    if (prev && curr && (curr - prev) < umbralMs) return true;
  }
  return false;
}
async function marcarRitmoRevisado(telefono) {
  try {
    const mutator = function (current) {
      const c = current || {};
      const historialSellos = Array.isArray(c.historialSellos) ? c.historialSellos : [];
      const ultimoTs = historialSellos.length ? historialSellos[historialSellos.length - 1].ts : Date.now();
      c.sospechosoRevisadoHastaTs = ultimoTs;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert('Error al marcar como revisado: ' + e.message);
  }
}
async function sumarSelloFidelizacionRapido(telefono) {
  try {
    const mutator = function (current) {
      const c = current || {};
      let sellos = typeof c.sellos === 'number' ? c.sellos : 0;
      let premiosPendientes = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
      let vecesCompletado = typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0;
      sellos += 1;
      if (sellos >= FIDELIZACION_META_ADMIN) {
        sellos = 0;
        premiosPendientes += 1;
        vecesCompletado += 1;
      }
      c.sellos = sellos;
      c.premiosPendientes = premiosPendientes;
      c.vecesCompletado = vecesCompletado;
      delete c.premioDisponible;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert('Error al sumar el sello: ' + e.message);
  }
}
async function entregarPremioFidelizacionRapido(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  if (premiosPendientes <= 0) {
    alert('Este cliente no tiene premios pendientes.');
    return;
  }
  if (!confirm('¿Marcar 1 premio como entregado a ' + (cliente.nombre || telefono) + '?')) return;
  try {
    const mutator = function (current) {
      const c = current || {};
      let premios = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
      if (premios > 0) {
        premios -= 1;
        const historialCanjes = Array.isArray(c.historialCanjes) ? c.historialCanjes : [];
        historialCanjes.push({ fecha: new Date().toISOString(), ticket: null });
        c.historialCanjes = historialCanjes;
      }
      c.premiosPendientes = premios;
      delete c.premioDisponible;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente2 = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente2));
    }
    renderFidelizacionList();
  } catch (e) {
    alert('Error al marcar el premio como entregado: ' + e.message);
  }
}
async function renderFidelizacionList() {
  const el = document.getElementById('fidelizacion-list');
  const resumenEl = document.getElementById('fidelizacion-resumen');
  if (!el) return;
  if (resumenEl) resumenEl.innerHTML = '';
  try {
    if (!window.fb_loadFidelizacionAll) {
      el.innerHTML = '<div style="font-size:13px;color:#c0392b">Firebase no disponible.</div>';
      return;
    }
    _fidelizacionDataCache = await window.fb_loadFidelizacionAll();
    _filtrarYPintarFidelizacion();
  } catch (e) {
    el.innerHTML = '<div style="font-size:13px;color:#c0392b">Error al cargar: ' + e.message + '</div>';
  }
}
function filtrarFidelizacionPorTipo(tipo) {
  window._fidelizacionFiltroTipo = tipo;
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (listEl) listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Limpiar la búsqueda de texto para que el filtro por tipo se vea claro
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';
  _filtrarYPintarFidelizacion();
}
function mostrarFidelizacionCanjes() {
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!listEl) return;
  listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Quitar cualquier filtro de tipo/búsqueda activo, esta es una vista distinta
  window._fidelizacionFiltroTipo = null;
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';
  window._fidelizacionCanjesDesde = '';
  window._fidelizacionCanjesHasta = '';
  _pintarFidelizacionCanjes();
}
function _pintarFidelizacionCanjes() {
  const data = _fidelizacionDataCache;
  const listEl = document.getElementById('fidelizacion-list');
  if (!data || !listEl) return;

  let eventos = [];
  Object.entries(data).forEach(([telefono, c]) => {
    (c.historialCanjes || []).forEach(canje => {
      eventos.push({ telefono, nombre: c.nombre || 'Sin nombre', fecha: canje.fecha || '-', ticket: canje.ticket || null });
    });
  });

  const desde = window._fidelizacionCanjesDesde || '';
  const hasta = window._fidelizacionCanjesHasta || '';
  if (desde) eventos = eventos.filter(ev => (ev.fecha || '').slice(0, 10) >= desde);
  if (hasta) eventos = eventos.filter(ev => (ev.fecha || '').slice(0, 10) <= hasta);
  eventos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  const filtroHtml = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;font-size:12px;color:#8A6A4E">'
    + '<span>Desde</span><input type="date" value="' + escapeAttr(desde) + '" onchange="window._fidelizacionCanjesDesde=this.value;_pintarFidelizacionCanjes()" style="padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:12px">'
    + '<span>Hasta</span><input type="date" value="' + escapeAttr(hasta) + '" onchange="window._fidelizacionCanjesHasta=this.value;_pintarFidelizacionCanjes()" style="padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:12px">'
    + ((desde || hasta) ? '<span onclick="window._fidelizacionCanjesDesde=\'\';window._fidelizacionCanjesHasta=\'\';_pintarFidelizacionCanjes()" style="cursor:pointer;color:#c0392b;font-weight:700">✕ Quitar filtro</span>' : '')
    + '</div>';

  if (!eventos.length) {
    listEl.innerHTML = filtroHtml + '<div style="font-size:13px;color:#8A6A4E">Sin premios canjeados' + ((desde || hasta) ? ' en ese rango de fechas.' : ' todavía.') + '</div>';
    return;
  }
  listEl.innerHTML = filtroHtml + '<div style="font-weight:700;color:#3D1F0D;margin-bottom:8px;font-size:13px">🎁 Historial de premios canjeados (' + eventos.length + ')</div>' +
    eventos.map(ev => {
      const nombreMostrar = escapeHtml(ev.nombre);
      const telMostrar = escapeHtml(ev.telefono);
      let h = '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;font-size:13px">';
      h += '<span style="font-weight:700;color:#3D1F0D">' + nombreMostrar + '</span> <span style="color:#8A6A4E">(' + telMostrar + ')</span>';
      h += '<div style="color:#5a3e1b;font-size:12px;margin-top:2px">' + escapeHtml(ev.fecha) + (ev.ticket ? ' — Ticket ' + escapeHtml(ev.ticket) : '') + '</div>';
      h += '</div>';
      return h;
    }).join('<div style="height:6px"></div>');
}
function switchFidelizacionTab(tab) {
  const clientesBtn = document.getElementById('ftab-clientes');
  const editarBtn = document.getElementById('ftab-editar');
  const clientesView = document.getElementById('fidelizacion-tab-clientes');
  const editarView = document.getElementById('fidelizacion-tab-editar');
  if (!clientesBtn) return;
  if (tab === 'clientes') {
    clientesBtn.style.borderBottomColor = '#3D1F0D';
    clientesBtn.style.color = '#3D1F0D';
    clientesBtn.style.fontWeight = '700';
    editarBtn.style.borderBottomColor = 'transparent';
    editarBtn.style.color = '#8A6A4E';
    editarBtn.style.fontWeight = '600';
    clientesView.style.display = 'block';
    editarView.style.display = 'none';
  } else {
    editarBtn.style.borderBottomColor = '#3D1F0D';
    editarBtn.style.color = '#3D1F0D';
    editarBtn.style.fontWeight = '700';
    clientesBtn.style.borderBottomColor = 'transparent';
    clientesBtn.style.color = '#8A6A4E';
    clientesBtn.style.fontWeight = '600';
    clientesView.style.display = 'none';
    editarView.style.display = 'block';
  }
}
function toggleFidelizacionListaClientes() {
  const el = document.getElementById('fidelizacion-list');
  const icon = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!el) return;
  const abierta = el.style.display === 'flex';
  el.style.display = abierta ? 'none' : 'flex';
  if (icon) icon.textContent = abierta ? '▶' : '▼';
}
function _filtrarYPintarFidelizacion() {
  // Si el usuario escribe en el buscador, desplegamos la lista automáticamente
  // y quitamos cualquier filtro por tipo activo (chips), para que no se mezclen
  const searchElAuto = document.getElementById('fidelizacion-search');
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (searchElAuto && searchElAuto.value.trim()) {
    window._fidelizacionFiltroTipo = null;
    if (listEl && listEl.style.display === 'none') {
      listEl.style.display = 'flex';
      if (iconEl) iconEl.textContent = '▼';
    }
  }
  // Solo filtra y pinta con los datos ya cargados en memoria — instantáneo,
  // sin volver a leer Firebase en cada tecla del buscador (eso era lo que
  // provocaba el "salto" de página al escribir).
  const el = document.getElementById('fidelizacion-list');
  const resumenEl = document.getElementById('fidelizacion-resumen');
  if (!el) return;
  const data = _fidelizacionDataCache;
  if (!data || !Object.keys(data).length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Aún no hay clientes en el programa de fidelización.</div>';
    if (resumenEl) resumenEl.innerHTML = '';
    return;
  }
  let clientes = Object.entries(data).map(([telefono, c]) => ({
    telefono,
    nombre: c.nombre || '',
    sellos: typeof c.sellos === 'number' ? c.sellos : 0,
    premiosPendientes: typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0),
    vecesCompletado: typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0,
    historialCanjes: c.historialCanjes || [],
    historialNombres: Array.isArray(c.historialNombres) ? c.historialNombres : [],
    sospechoso: _clienteConRitmoSospechoso(c.historialSellos, c.sospechosoRevisadoHastaTs),
    noCuadra: _clienteConNumerosQueNoCuadran(c)
  }));

  // Filtro de búsqueda por nombre o teléfono
  const searchEl = document.getElementById('fidelizacion-search');
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
  if (q) {
    clientes = clientes.filter(c => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q));
  }
  // Filtro por tipo, activado al hacer click en los chips de resumen
  if (window._fidelizacionFiltroTipo === 'premio') {
    clientes = clientes.filter(c => c.premiosPendientes > 0);
  } else if (window._fidelizacionFiltroTipo === 'sospechoso') {
    clientes = clientes.filter(c => c.sospechoso);
  } else if (window._fidelizacionFiltroTipo === 'noCuadra') {
    clientes = clientes.filter(c => c.noCuadra);
  } else if (window._fidelizacionFiltroTipo === 'topePremios') {
    clientes = clientes.filter(c => c.premiosPendientes >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES);
  } else if (window._fidelizacionFiltroTipo === 'nombresDistintos') {
    clientes = clientes.filter(c => c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS);
  }

  // Resumen: total clientes, con premio pendiente, total canjes, sospechosos...
  const totalClientes = Object.keys(data).length;
  const conPremio = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) > 0).length;
  const totalCanjes = Object.values(data).reduce((s, c) => s + ((c.historialCanjes || []).length), 0);
  const totalSospechosos = Object.values(data).filter(c => _clienteConRitmoSospechoso(c.historialSellos, c.sospechosoRevisadoHastaTs)).length;
  const totalNoCuadran = Object.values(data).filter(c => _clienteConNumerosQueNoCuadran(c)).length;
  const totalTopePremios = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES).length;
  const totalNombresDistintos = Object.values(data).filter(c => Array.isArray(c.historialNombres) && c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS).length;
  if (resumenEl) {
    const chip = (label, val, color, onclickAttr) => "<div onclick=\"".concat(onclickAttr, "\" style=\"flex:1;min-width:110px;cursor:pointer;background:#fff;border:1.5px solid ").concat(color, ";border-radius:10px;padding:10px 16px;font-size:12px;color:#3D1F0D;text-align:center\"><div style=\"font-weight:900;font-size:18px\">").concat(val, "</div><div style=\"color:#8A6A4E\">").concat(label, "</div></div>");
    resumenEl.innerHTML = chip('Clientes en el programa', totalClientes, '#F5E6C8', "filtrarFidelizacionPorTipo('todos')")
      + chip('Con premio pendiente', conPremio, '#D9A441', "filtrarFidelizacionPorTipo('premio')")
      + chip('Premios canjeados', totalCanjes, '#F5E6C8', "mostrarFidelizacionCanjes()")
      + (totalSospechosos > 0 ? chip('🚨 Ritmo sospechoso', totalSospechosos, '#c0392b', "filtrarFidelizacionPorTipo('sospechoso')") : '')
      + (totalNoCuadran > 0 ? chip('🔍 Números que no cuadran', totalNoCuadran, '#8e44ad', "filtrarFidelizacionPorTipo('noCuadra')") : '')
      + (totalTopePremios > 0 ? chip('📦 Muchos premios sin canjear', totalTopePremios, '#c0392b', "filtrarFidelizacionPorTipo('topePremios')") : '')
      + (totalNombresDistintos > 0 ? chip('👥 Varios nombres, mismo tel.', totalNombresDistintos, '#c0392b', "filtrarFidelizacionPorTipo('nombresDistintos')") : '');
  }

  // Ordenar: primero los que tienen premio pendiente, luego por sellos descendente
  clientes.sort((a, b) => {
    if (!!a.premiosPendientes !== !!b.premiosPendientes) return a.premiosPendientes ? -1 : 1;
    return b.sellos - a.sellos;
  });

  if (!clientes.length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin resultados para esa búsqueda.</div>';
    return;
  }

  el.innerHTML = clientes.map(c => {
    const destacado = c.premiosPendientes > 0;
    const tienePremiosDeSobra = c.premiosPendientes >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES;
    const tieneNombresDistintos = c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS;
    const conAviso = c.sospechoso || c.noCuadra || tienePremiosDeSobra || tieneNombresDistintos;
    const bg = conAviso ? '#FDEDEC' : (destacado ? '#FFF3CD' : '#fff');
    const border = conAviso ? '#c0392b' : (destacado ? '#D9A441' : '#F5E6C8');
    const sellosTexto = c.sellos + '/' + FIDELIZACION_META_ADMIN;
    const premioTexto = destacado
      ? '🎁 ' + c.premiosPendientes + (c.premiosPendientes > 1 ? ' premios pendientes' : ' premio pendiente')
      : (c.sellos === FIDELIZACION_META_ADMIN - 1 ? '🎉 1 sello para el premio' : '');
    const vecesTexto = c.vecesCompletado > 0 ? ' · 🏅 ha completado el ciclo ' + c.vecesCompletado + (c.vecesCompletado > 1 ? ' veces' : ' vez') : '';
    const sospechosoTexto = c.sospechoso ? ' · 🚨 ritmo sospechoso (sellos muy seguidos)' : '';
    const noCuadraTexto = c.noCuadra ? ' · 🔍 números que no cuadran' : '';
    const topePremiosTexto = tienePremiosDeSobra ? ' · 📦 muchos premios sin canjear' : '';
    const nombresDistintosTexto = tieneNombresDistintos ? ' · 👥 ' + c.historialNombres.length + ' nombres distintos' : '';
    const nombreMostrar = escapeHtml(c.nombre || 'Sin nombre');
    const telMostrar = escapeHtml(c.telefono);
    // escapeHtml no basta dentro de un onclick="fn('...')": el navegador
    // decodifica las entidades HTML (incluida &#39;) ANTES de ejecutar el
    // JS del atributo, así que una comilla simple sobrevivía y rompía la
    // llamada — escapeAttr la escapa también para el propio string de JS.
    const telAttr = escapeAttr(c.telefono);
    let h = '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    // Tocar el nombre/sellos del cliente despliega directamente sus canjes Y
    // sus pedidos (fecha + número) — antes había que abrir el detalle y
    // encima pulsar otro botón aparte para ver los pedidos, dos pasos para
    // algo que se usa sobre todo para comprobar ritmos sospechosos.
    h += '<div onclick="toggleFidelizacionDetalle(\'' + telAttr + '\')" style="cursor:pointer;flex:1;min-width:160px">';
    h += '<div style="font-weight:700;color:#3D1F0D;font-size:14px">' + nombreMostrar + ' <span style="color:#8A6A4E;font-weight:500">(' + telMostrar + ')</span></div>';
    h += '<div style="font-size:13px;color:#5a3e1b;margin-top:2px">' + sellosTexto + ' sellos' + (premioTexto ? ' · ' + premioTexto : '') + vecesTexto + sospechosoTexto + noCuadraTexto + topePremiosTexto + nombresDistintosTexto + '</div>';
    h += '<div style="font-size:11px;color:#8A6A4E;margin-top:2px">👇 Toca para ver sus pedidos y canjes</div>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">';
    h += '<button onclick="event.stopPropagation();sumarSelloFidelizacionRapido(\'' + telAttr + '\')" style="padding:7px 12px;background:#fff;color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">➕ Sello</button>';
    if (destacado) {
      h += '<button onclick="event.stopPropagation();entregarPremioFidelizacionRapido(\'' + telAttr + '\')" style="padding:7px 12px;background:#D9A441;color:#3D1F0D;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🎁 Entregar premio</button>';
    }
    if (c.sospechoso) {
      h += '<button onclick="event.stopPropagation();marcarRitmoRevisado(\'' + telAttr + '\')" style="padding:7px 12px;background:#fff;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Ya lo revisé</button>';
    }
    h += '<button onclick="event.stopPropagation();abrirFidelizacionAjustesModal(\'' + telAttr + '\')" style="padding:7px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">⚙️ Ajustes</button>';
    h += '</div>';
    h += '</div>';
    h += '<div id="fidel-detalle-' + telMostrar + '" style="display:none;padding:10px 16px;border-bottom:1.5px solid ' + border + ';font-size:12px;background:#FFFDF8"></div>';
    return h;
  }).join('<div style="height:2px"></div>');
}
function toggleFidelizacionDetalle(telefono) {
  const el = document.getElementById('fidel-detalle-' + telefono);
  if (!el) return;
  const yaAbierto = el.style.display === 'block';
  // Cerrar cualquier otro detalle abierto, para no acumular varios a la vez
  document.querySelectorAll('[id^="fidel-detalle-"]').forEach(d => d.style.display = 'none');
  if (yaAbierto) return; // si ya estaba abierto, lo dejamos cerrado (toggle)
  el.style.display = 'block';
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const canjes = cliente.historialCanjes || [];
  const telAttr = escapeAttr(telefono);
  let h = '';
  if (canjes.length) {
    h += '<div style="font-weight:700;color:#3D1F0D;margin-bottom:6px">🎁 Premios canjeados (' + canjes.length + ')</div>';
    h += canjes.map((c, i) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;color:#5a3e1b;margin-bottom:3px"><span>· ' + escapeHtml(c.fecha || '-') + (c.ticket ? ' — Ticket ' + escapeHtml(c.ticket) : '') + '</span><span onclick="anularCanjeFidelizacion(\'' + telAttr + '\',' + i + ')" style="cursor:pointer;color:#c0392b;font-size:11px;font-weight:700;white-space:nowrap">↩️ Anular</span></div>').join('');
  } else {
    h += '<div style="color:#8A6A4E;margin-bottom:8px">Sin premios canjeados todavía.</div>';
  }
  h += '<div id="fidel-pedidos-' + telefono + '" style="margin-top:8px"></div>';
  h += '<button onclick="borrarClienteFidelizacion(\'' + telAttr + '\')" style="margin-top:10px;padding:6px 14px;background:#fff;border:1.5px solid #c0392b;color:#c0392b;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑️ Eliminar del programa</button>';
  el.innerHTML = h;
  // Se cargan solos al desplegar, sin necesitar un botón aparte — para
  // comprobar rápido si un ritmo de sellos "sospechoso" se corresponde con
  // pedidos reales o no.
  cargarPedidosClienteFidelizacion(telefono);
}
async function anularCanjeFidelizacion(telefono, indice) {
  if (!confirm('¿Anular este canje?\n\nSe quitará del historial y se le devolverá el premio como pendiente de entregar (por si se marcó por error).')) return;
  try {
    const cliente = await window.fb_loadFidelizacionCliente(telefono);
    if (!cliente || !cliente.historialCanjes || !cliente.historialCanjes[indice]) {
      alert('No se ha encontrado ese canje (puede que la lista esté desactualizada). Pulsa Actualizar e inténtalo de nuevo.');
      return;
    }
    // Transacción: fidelizacion/<telefono> también lo escribe fidelizacion.php
    // cada vez que ese cliente gana un sello o canjea un premio de verdad —
    // un .set() plano aquí podía perder ese cambio si pasaba justo mientras
    // el admin anulaba este canje.
    const mutator = function (current) {
      const c = current || {};
      if (Array.isArray(c.historialCanjes) && c.historialCanjes[indice]) {
        c.historialCanjes.splice(indice, 1);
      }
      c.premiosPendientes = (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : 0) + 1;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert('Error al anular el canje: ' + e.message);
  }
}
async function borrarClienteFidelizacion(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const nombre = cliente.nombre || 'este cliente';
  const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  let aviso = '¿Seguro que quieres eliminar a ' + nombre + ' (' + telefono + ') del programa de fidelización?\n\nEsto borra sus sellos actuales y todo su historial de canjes. No se puede deshacer.';
  if (premiosPendientes > 0) {
    aviso += '\n\n⚠️ Atención: este cliente tiene ' + premiosPendientes + ' premio(s) pendiente(s) de entregar todavía.';
  }
  if (!confirm(aviso)) return;
  try {
    if (!window.fb_deleteFidelizacionCliente) {
      alert('Esta función necesita fb_deleteFidelizacionCliente en config.js.');
      return;
    }
    await window.fb_deleteFidelizacionCliente(telefono);
    renderFidelizacionList();
  } catch (e) {
    alert('Error al eliminar el cliente: ' + e.message);
  }
}
async function cargarPedidosClienteFidelizacion(telefono) {
  const el = document.getElementById('fidel-pedidos-' + telefono);
  if (!el) return;
  // Toggle: si ya hay contenido cargado (no vacío), lo cerramos sin recargar
  if (el.innerHTML.trim() !== '') {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = '<div style="color:#8A6A4E">Buscando pedidos… esto puede tardar unos segundos.</div>';
  try {
    if (!window.fb_loadAllTicketDates || !window.fb_loadTicketsByDate) {
      el.innerHTML = '<div style="color:#c0392b">Esta función necesita fb_loadAllTicketDates y fb_loadTicketsByDate en config.js.</div>';
      return;
    }
    const fechas = await window.fb_loadAllTicketDates();
    let pedidosCliente = [];
    for (const fecha of fechas) {
      const ticketsDelDia = await window.fb_loadTicketsByDate(fecha);
      if (!ticketsDelDia) continue;
      Object.entries(ticketsDelDia).forEach(([num, t]) => {
        const telTicket = (t.phone || '').replace(/\D/g, '');
        if (telTicket === telefono) {
          pedidosCliente.push({ numero: t.orderNum || num, fecha: fecha, hora: t.slotTime || t.time || '', total: t.total });
        }
      });
    }
    if (!pedidosCliente.length) {
      el.innerHTML = '<div style="color:#8A6A4E">No se encontraron pedidos para este teléfono.</div>';
      return;
    }
    pedidosCliente.sort((a, b) => b.fecha.localeCompare(a.fecha));
    el.innerHTML = '<div style="font-weight:700;color:#3D1F0D;margin-bottom:6px">📋 Pedidos (' + pedidosCliente.length + ')</div>' +
      pedidosCliente.map(p => '<div style="color:#5a3e1b;margin-bottom:3px">· #' + escapeHtml(String(p.numero)) + ' — ' + escapeHtml(p.fecha) + (p.hora ? ' ' + escapeHtml(p.hora) : '') + (p.total ? ' — ' + p.total + '€' : '') + '</div>').join('');
  } catch (e) {
    el.innerHTML = '<div style="color:#c0392b">Error al buscar pedidos: ' + e.message + '</div>';
  }
}
function cargarFidelizacionParaEditar(telefono) {
  if (typeof switchFidelizacionTab === 'function') switchFidelizacionTab('editar');
  window.fb_loadFidelizacionCliente(telefono).then(c => {
    document.getElementById('fidel-edit-phone').value = telefono;
    document.getElementById('fidel-edit-nombre').value = (c && c.nombre) || '';
    document.getElementById('fidel-edit-sellos').value = (c && typeof c.sellos === 'number') ? c.sellos : 0;
    document.getElementById('fidel-edit-premios-pendientes').value = (c && typeof c.premiosPendientes === 'number') ? c.premiosPendientes : ((c && c.premioDisponible) ? 1 : 0);
    document.getElementById('fidel-edit-veces-completado').value = (c && typeof c.vecesCompletado === 'number') ? c.vecesCompletado : 0;
    document.getElementById('fidel-edit-phone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
// Escritura compartida por el formulario de la pestaña "Editar manualmente"
// y por el modal de ajustes rápidos (⚙️) de cada tarjeta — los dos ajustan
// los mismos 4 campos (nombre/sellos/premiosPendientes/vecesCompletado) de
// la misma forma, así que viven en un único sitio para que no se
// desincronicen si mañana hay que cambiar algo de esta lógica.
// Transacción: nombre/sellos/premiosPendientes/vecesCompletado son lo que
// el admin ha editado a propósito en el formulario, pero historialCanjes/
// historialSellos deben venir siempre de lo último de verdad en Firebase
// (no de una lectura que pudo quedarse desfasada mientras el admin
// rellenaba el formulario) — si no, un sello o canje real de ese cliente
// llegado justo en medio se perdía sin aviso al guardar.
async function _guardarFidelizacionValores(telefono, nombre, sellos, premiosPendientes, vecesCompletado) {
  const mutator = function (current) {
    const existente = current || {};
    return {
      nombre: nombre || existente.nombre || '',
      sellos,
      premiosPendientes,
      vecesCompletado,
      historialCanjes: existente.historialCanjes || [],
      historialSellos: existente.historialSellos || [],
      // No pisar esto al editar a mano — si no, se borraba en silencio el
      // "ya lo revisé" de ritmo sospechoso y el historial de nombres
      // distintos usados con este teléfono.
      sospechosoRevisadoHastaTs: existente.sospechosoRevisadoHastaTs,
      historialNombres: existente.historialNombres || []
    };
  };
  if (window.fb_transactJsonString) {
    await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
  } else {
    let existente = null;
    try { existente = await window.fb_loadFidelizacionCliente(telefono); } catch (e) {}
    await window.fb_saveFidelizacionCliente(telefono, mutator(existente));
  }
}
function _leerValoresFormularioFidelizacion(prefijo) {
  const telefono = document.getElementById(prefijo + '-phone').value.replace(/\D/g, '');
  const nombre = document.getElementById(prefijo + '-nombre').value.trim();
  let sellos = parseInt(document.getElementById(prefijo + '-sellos').value, 10);
  if (isNaN(sellos) || sellos < 0) sellos = 0;
  if (sellos >= FIDELIZACION_META_ADMIN) sellos = FIDELIZACION_META_ADMIN - 1;
  let premiosPendientes = parseInt(document.getElementById(prefijo + '-premios-pendientes').value, 10);
  if (isNaN(premiosPendientes) || premiosPendientes < 0) premiosPendientes = 0;
  let vecesCompletado = parseInt(document.getElementById(prefijo + '-veces-completado').value, 10);
  if (isNaN(vecesCompletado) || vecesCompletado < 0) vecesCompletado = 0;
  return { telefono, nombre, sellos, premiosPendientes, vecesCompletado };
}
async function guardarFidelizacionManual() {
  const v = _leerValoresFormularioFidelizacion('fidel-edit');
  if (v.telefono.length !== 9) {
    alert('Introduce un teléfono válido de 9 dígitos.');
    return;
  }
  await _guardarFidelizacionValores(v.telefono, v.nombre, v.sellos, v.premiosPendientes, v.vecesCompletado);
  showToast('fidel-toast');
  renderFidelizacionList();
}

// ── MODAL DE AJUSTES RÁPIDOS (⚙️ desde cada tarjeta de la lista) ──
// Mismo formulario que "Editar manualmente", pero como ventana emergente
// sobre la propia lista, ya rellena con los datos del cliente — para
// corregir algo puntual (o simplemente comprobar qué hay guardado de
// verdad, como "veces completado", sin confundirlo con un fallo) sin
// perder de vista la lista ni tener que volver a escribir el teléfono.
function abrirFidelizacionAjustesModal(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || null;
  document.getElementById('fidel-ajustes-phone').value = telefono;
  document.getElementById('fidel-ajustes-nombre').value = (cliente && cliente.nombre) || '';
  document.getElementById('fidel-ajustes-sellos').value = (cliente && typeof cliente.sellos === 'number') ? cliente.sellos : 0;
  document.getElementById('fidel-ajustes-premios-pendientes').value = (cliente && typeof cliente.premiosPendientes === 'number') ? cliente.premiosPendientes : ((cliente && cliente.premioDisponible) ? 1 : 0);
  document.getElementById('fidel-ajustes-veces-completado').value = (cliente && typeof cliente.vecesCompletado === 'number') ? cliente.vecesCompletado : 0;
  const infoEl = document.getElementById('fidel-ajustes-cliente-info');
  if (infoEl) infoEl.textContent = ((cliente && cliente.nombre) ? cliente.nombre + ' — ' : '') + telefono;
  const modal = document.getElementById('fidel-ajustes-modal');
  if (modal) modal.style.display = 'flex';
}
function cerrarFidelizacionAjustesModal() {
  const modal = document.getElementById('fidel-ajustes-modal');
  if (modal) modal.style.display = 'none';
}
async function guardarFidelizacionAjustesModal() {
  const v = _leerValoresFormularioFidelizacion('fidel-ajustes');
  if (v.telefono.length !== 9) {
    alert('Teléfono inválido — ciérralo y ábrelo de nuevo desde la tarjeta del cliente.');
    return;
  }
  await _guardarFidelizacionValores(v.telefono, v.nombre, v.sellos, v.premiosPendientes, v.vecesCompletado);
  cerrarFidelizacionAjustesModal();
  renderFidelizacionList();
}

async function renderAccesosLog() {
  const el = document.getElementById('accesos-log-list');
  if (!el) return;
  el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Cargando...</div>';
  try {
    if (!window.fb_loadLoginLog) {
      el.innerHTML = '<div style="font-size:13px;color:#c0392b">Firebase no disponible.</div>';
      return;
    }
    const user = window.fb_getAdminUser ? window.fb_getAdminUser() : null;
    console.log('[accesos] usuario activo:', user ? user.email : 'ninguno');
    const logs = await window.fb_loadLoginLog();
    console.log('[accesos] logs recibidos:', logs ? logs.length : 'null');
    if (!logs || !logs.length) {
      el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin registros aún.</div>';
      return;
    }
    el.innerHTML = logs.slice(0, 100).map(function (l) {
      var esOk = l.resultado && l.resultado.indexOf('Acceso correcto') !== -1;
      var color = esOk ? '#eafaf1' : '#fdf0ee';
      var border = esOk ? '#27855a' : '#c0392b';
      var h = '<div style="background:' + color + ';border:1.5px solid ' + border + ';border-radius:10px;padding:12px;font-size:12px;margin-bottom:4px">';
      h += '<div style="font-weight:700;color:#3D1F0D;margin-bottom:4px">' + escapeHtml(l.resultado || '-') + '</div>';
      h += '<div style="color:#2A1506;margin-bottom:2px">Email: ' + escapeHtml(l.email || '-') + '</div>';
      h += '<div style="color:#8A6A4E;margin-bottom:2px">Fecha: ' + escapeHtml(l.fecha || '-') + '</div>';
      h += '<div style="color:#8A6A4E;margin-bottom:2px">IP: ' + escapeHtml(l.ip || '-') + '</div>';
      h += '<div style="color:#8A6A4E;font-size:11px;word-break:break-all">Dispositivo: ' + escapeHtml(l.dispositivo || '-') + '</div>';
      h += '</div>';
      return h;
    }).join('');
  } catch (e) {
    el.innerHTML = '<div style="font-size:13px;color:#c0392b">Error al cargar: ' + e.message + '</div>';
  }
}

// recordOrderStats vive en nucleo-compartido.js (bundle de cliente) — es la
// función que registra cada pedido nuevo, se llama desde antifraude.js al
// confirmar el checkout de cualquier visitante, no solo de admin.
// El arranque de scheduleSlotMidnightReset() también se movió allí.

