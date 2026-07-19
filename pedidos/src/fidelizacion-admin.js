// ── PANEL ADMIN: FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META_ADMIN = 10;
// Umbral para marcar ritmo sospechoso: 2+ sellos separados por menos de
// esto se considera posible abuso (pedidos reales no suelen ir tan seguidos).
const FIDELIZACION_MINUTOS_SOSPECHOSO = 10;
let _fidelizacionDataCache = null;

// Devuelve true si el cliente tiene 2 o más sellos consecutivos separados
// por menos de FIDELIZACION_MINUTOS_SOSPECHOSO minutos.
function _clienteConRitmoSospechoso(historialSellos) {
  if (!historialSellos || historialSellos.length < 2) return false;
  const umbralMs = FIDELIZACION_MINUTOS_SOSPECHOSO * 60 * 1000;
  for (let i = 1; i < historialSellos.length; i++) {
    const prev = historialSellos[i - 1] && historialSellos[i - 1].ts;
    const curr = historialSellos[i] && historialSellos[i].ts;
    if (prev && curr && (curr - prev) < umbralMs) return true;
  }
  return false;
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
  const data = _fidelizacionDataCache;
  if (!data) return;
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!listEl) return;
  listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Quitar cualquier filtro de tipo/búsqueda activo, esta es una vista distinta
  window._fidelizacionFiltroTipo = null;
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';

  let eventos = [];
  Object.entries(data).forEach(([telefono, c]) => {
    (c.historialCanjes || []).forEach(canje => {
      eventos.push({ telefono, nombre: c.nombre || 'Sin nombre', fecha: canje.fecha || '-', ticket: canje.ticket || null });
    });
  });
  if (!eventos.length) {
    listEl.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin premios canjeados todavía.</div>';
    return;
  }
  eventos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  listEl.innerHTML = '<div style="font-weight:700;color:#3D1F0D;margin-bottom:8px;font-size:13px">🎁 Historial de premios canjeados (' + eventos.length + ')</div>' +
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
    sospechoso: _clienteConRitmoSospechoso(c.historialSellos)
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
  }

  // Resumen: total clientes, con premio pendiente, total canjes, sospechosos
  const totalClientes = Object.keys(data).length;
  const conPremio = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) > 0).length;
  const totalCanjes = Object.values(data).reduce((s, c) => s + ((c.historialCanjes || []).length), 0);
  const totalSospechosos = Object.values(data).filter(c => _clienteConRitmoSospechoso(c.historialSellos)).length;
  if (resumenEl) {
    const chip = (label, val, color, onclickAttr) => "<div onclick=\"".concat(onclickAttr, "\" style=\"flex:1;min-width:110px;cursor:pointer;background:#fff;border:1.5px solid ").concat(color, ";border-radius:10px;padding:10px 16px;font-size:12px;color:#3D1F0D;text-align:center\"><div style=\"font-weight:900;font-size:18px\">").concat(val, "</div><div style=\"color:#8A6A4E\">").concat(label, "</div></div>");
    resumenEl.innerHTML = chip('Clientes en el programa', totalClientes, '#F5E6C8', "filtrarFidelizacionPorTipo('todos')")
      + chip('Con premio pendiente', conPremio, '#D9A441', "filtrarFidelizacionPorTipo('premio')")
      + chip('Premios canjeados', totalCanjes, '#F5E6C8', "mostrarFidelizacionCanjes()")
      + (totalSospechosos > 0 ? chip('🚨 Ritmo sospechoso', totalSospechosos, '#c0392b', "filtrarFidelizacionPorTipo('sospechoso')") : '');
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
    const bg = c.sospechoso ? '#FDEDEC' : (destacado ? '#FFF3CD' : '#fff');
    const border = c.sospechoso ? '#c0392b' : (destacado ? '#D9A441' : '#F5E6C8');
    const sellosTexto = c.sellos + '/' + FIDELIZACION_META_ADMIN;
    const premioTexto = destacado
      ? '🎁 ' + c.premiosPendientes + (c.premiosPendientes > 1 ? ' premios pendientes' : ' premio pendiente')
      : (c.sellos === FIDELIZACION_META_ADMIN - 1 ? '🎉 1 sello para el premio' : '');
    const vecesTexto = c.vecesCompletado > 0 ? ' · 🏅 ha completado el ciclo ' + c.vecesCompletado + (c.vecesCompletado > 1 ? ' veces' : ' vez') : '';
    const sospechosoTexto = c.sospechoso ? ' · 🚨 ritmo sospechoso (sellos muy seguidos)' : '';
    const nombreMostrar = escapeHtml(c.nombre || 'Sin nombre');
    const telMostrar = escapeHtml(c.telefono);
    let h = '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    h += '<div>';
    h += '<div style="font-weight:700;color:#3D1F0D;font-size:14px">' + nombreMostrar + ' <span style="color:#8A6A4E;font-weight:500">(' + telMostrar + ')</span></div>';
    h += '<div style="font-size:13px;color:#5a3e1b;margin-top:2px">' + sellosTexto + ' sellos' + (premioTexto ? ' · ' + premioTexto : '') + vecesTexto + sospechosoTexto + '</div>';
    h += '</div>';
    h += '<button onclick="cargarFidelizacionParaEditar(\'' + telMostrar + '\')" style="padding:7px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✏️ Editar</button>';
    h += '</div>';
    h += '<div onclick="toggleFidelizacionDetalle(\'' + telMostrar + '\')" style="cursor:pointer;font-size:12px;color:#8A6A4E;padding:4px 16px 8px;border-bottom:1.5px solid ' + border + '">👇 Ver canjes y pedidos</div>';
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
  let h = '';
  if (canjes.length) {
    h += '<div style="font-weight:700;color:#3D1F0D;margin-bottom:6px">🎁 Premios canjeados (' + canjes.length + ')</div>';
    h += canjes.map((c, i) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;color:#5a3e1b;margin-bottom:3px"><span>· ' + escapeHtml(c.fecha || '-') + (c.ticket ? ' — Ticket ' + escapeHtml(c.ticket) : '') + '</span><span onclick="anularCanjeFidelizacion(\'' + telefono + '\',' + i + ')" style="cursor:pointer;color:#c0392b;font-size:11px;font-weight:700;white-space:nowrap">↩️ Anular</span></div>').join('');
  } else {
    h += '<div style="color:#8A6A4E;margin-bottom:8px">Sin premios canjeados todavía.</div>';
  }
  h += '<button onclick="cargarPedidosClienteFidelizacion(\'' + telefono + '\')" style="margin-top:8px;padding:6px 14px;background:#fff;border:1.5px solid #3D1F0D;color:#3D1F0D;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">📋 Ver todos sus pedidos</button>';
  h += '<div id="fidel-pedidos-' + telefono + '" style="margin-top:8px"></div>';
  h += '<button onclick="borrarClienteFidelizacion(\'' + telefono + '\')" style="margin-top:10px;padding:6px 14px;background:#fff;border:1.5px solid #c0392b;color:#c0392b;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑️ Eliminar del programa</button>';
  el.innerHTML = h;
}
async function anularCanjeFidelizacion(telefono, indice) {
  if (!confirm('¿Anular este canje?\n\nSe quitará del historial y se le devolverá el premio como pendiente de entregar (por si se marcó por error).')) return;
  try {
    const cliente = await window.fb_loadFidelizacionCliente(telefono);
    if (!cliente || !cliente.historialCanjes || !cliente.historialCanjes[indice]) {
      alert('No se ha encontrado ese canje (puede que la lista esté desactualizada). Pulsa Actualizar e inténtalo de nuevo.');
      return;
    }
    cliente.historialCanjes.splice(indice, 1);
    cliente.premiosPendientes = (typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : 0) + 1;
    await window.fb_saveFidelizacionCliente(telefono, cliente);
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
async function guardarFidelizacionManual() {
  const telInput = document.getElementById('fidel-edit-phone');
  const telefono = telInput.value.replace(/\D/g, '');
  if (telefono.length !== 9) {
    alert('Introduce un teléfono válido de 9 dígitos.');
    return;
  }
  const nombre = document.getElementById('fidel-edit-nombre').value.trim();
  let sellos = parseInt(document.getElementById('fidel-edit-sellos').value, 10);
  if (isNaN(sellos) || sellos < 0) sellos = 0;
  if (sellos >= FIDELIZACION_META_ADMIN) sellos = FIDELIZACION_META_ADMIN - 1;
  let premiosPendientes = parseInt(document.getElementById('fidel-edit-premios-pendientes').value, 10);
  if (isNaN(premiosPendientes) || premiosPendientes < 0) premiosPendientes = 0;
  let vecesCompletado = parseInt(document.getElementById('fidel-edit-veces-completado').value, 10);
  if (isNaN(vecesCompletado) || vecesCompletado < 0) vecesCompletado = 0;

  let existente = null;
  try { existente = await window.fb_loadFidelizacionCliente(telefono); } catch (e) {}
  const cliente = {
    nombre: nombre || (existente && existente.nombre) || '',
    sellos,
    premiosPendientes,
    vecesCompletado,
    historialCanjes: (existente && existente.historialCanjes) || []
  };
  await window.fb_saveFidelizacionCliente(telefono, cliente);
  showToast('fidel-toast');
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

// Patch recordOrderStats to include items for kitchen display + Firebase sync
// Usa transacción Firebase para evitar sobreescribir pedidos de otros dispositivos
// Guarda cuántas unidades de cada producto se vendieron hoy, para "Estrellas y perdedores".
// Se guarda en ventasProductos/{fecha} = { [productId]: cantidad }
async function recordProductSales(items) {
  if (!items || !items.length) return;
  const fecha = new Date().toISOString().slice(0, 10);
  try {
    const ref = firebase.database().ref('ventasProductos/' + fecha);
    const sn = await ref.once('value');
    const actual = sn.exists() ? sn.val() : {};
    items.forEach(it => {
      if (it.id == null) return;
      const id = String(it.id);
      actual[id] = (actual[id] || 0) + (it.qty || 0);
    });
    await ref.set(actual);
  } catch (e) {
    console.warn('[ventasProductos] no se pudo guardar', e);
  }
}
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

