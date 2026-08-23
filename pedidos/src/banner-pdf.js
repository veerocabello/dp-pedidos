// ── HISTORIAL MEJORADO ──
// BANNER_KEY, BANNER_TIPOS, getBannerDia, _applyBannerDia,
// _updateBannerToggleBtn y loadBannerDia viven en nucleo-compartido.js
// (bundle de cliente) — el banner se pinta para cualquier visitante, no
// solo para admin.
async function toggleBannerDia() {
  const data = getBannerDia();
  data.active = !data.active;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(() => {});
  _updateBannerToggleBtn(data.active);
  _applyBannerDia(data);
}
async function saveBannerDia() {
  var _document$getElementB26, _document$getElementB27, _document$getElementB28;
  const text = ((_document$getElementB26 = document.getElementById('banner-dia-input')) === null || _document$getElementB26 === void 0 ? void 0 : _document$getElementB26.value.trim()) || '';
  const sub = ((_document$getElementB27 = document.getElementById('banner-dia-sub-input')) === null || _document$getElementB27 === void 0 ? void 0 : _document$getElementB27.value.trim()) || '';
  const tipo = ((_document$getElementB28 = document.getElementById('banner-dia-tipo')) === null || _document$getElementB28 === void 0 ? void 0 : _document$getElementB28.value) || 'promo';
  const data = getBannerDia();
  data.text = text;
  data.sub = sub;
  data.tipo = tipo;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(() => {});
  _applyBannerDia(data);
  showToast('banner-toast');
}
// ── EXPORTAR PDF ─────────────────────────────────────────────────────────────

function _pdfStyles() {
  return "\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body { font-family: Arial, sans-serif; color: #2A1506; background: #fff; }\n    .header { background: #3D1F0D; color: #FFF8EE; padding: 20px 28px; }\n    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 2px; }\n    .header p  { font-size: 12px; opacity: .7; }\n    .content { padding: 24px 28px; }\n    .order-card { border: 1.5px solid #F5E6C8; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; page-break-inside: avoid; }\n    .order-num  { font-size: 18px; font-weight: 900; color: #3D1F0D; }\n    .order-meta { font-size: 12px; color: #8A6A4E; margin: 4px 0 10px; }\n    .order-items { font-size: 13px; color: #2A1506; border-top: 1px solid #F5E6C8; padding-top: 8px; }\n    .order-item { display: flex; justify-content: space-between; padding: 3px 0; }\n    .order-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #3D1F0D; border-top: 1.5px solid #F5E6C8; margin-top: 8px; padding-top: 8px; }\n    .summary { background: #FFF8EE; border: 1.5px solid #3D1F0D; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 24px; flex-wrap: wrap; }\n    .summary-item { text-align: center; }\n    .summary-item .val { font-size: 24px; font-weight: 900; color: #3D1F0D; }\n    .summary-item .lbl { font-size: 11px; color: #8A6A4E; text-transform: uppercase; letter-spacing: .05em; }\n    .ticket-box { border: 2px solid #3D1F0D; border-radius: 14px; padding: 24px; margin: 24px; }\n    .ticket-title { font-size: 13px; color: #8A6A4E; text-align:center; margin-bottom: 4px; }\n    .ticket-num { font-size: 36px; font-weight: 900; color: #3D1F0D; text-align:center; margin-bottom: 16px; }\n    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }\n  ";
}
// Convierte un fragmento de HTML en un PDF de verdad que se descarga solo
// — antes, tanto exportTicketPDF() como exportHistorialPDF() abrian una
// ventana nueva y llamaban a window.print(), que abre el dialogo de
// impresion del navegador (habia que elegir "Guardar como PDF" a mano, y a
// veces se manda directo a una impresora fisica en vez de guardarlo).
// html2pdf.js (cargado por CDN en index.html/fichar-publico.html) genera
// el archivo .pdf directamente, sin pasar por ningun dialogo de impresion.
function _descargarHtmlComoPDF(bodyHtml, filename, btn) {
  if (typeof html2pdf === 'undefined') {
    alert('No se pudo generar el PDF (no cargó la librería). Comprueba tu conexión y recarga la página.');
    return;
  }
  // Con el historial completo la captura puede tardar varios segundos —
  // antes ningún botón se desactivaba ni avisaba "generando…" mientras
  // tanto, así que un doble clic disparaba dos generaciones a la vez,
  // insertando el contenido duplicado en la página (dos contenedores
  // clonados a la vez, uno por cada llamada).
  if (btn) {
    if (btn.disabled) return;
    btn.dataset.pdfTextoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Generando…';
  }
  const restaurarBtn = () => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.pdfTextoOriginal;
      delete btn.dataset.pdfTextoOriginal;
    }
  };
  const styleEl = document.createElement('style');
  styleEl.textContent = _pdfStyles();
  document.head.appendChild(styleEl);
  // OJO — causa real del PDF en blanco, confirmada probándolo en un
  // navegador real: si el contenedor lleva position:fixed o
  // position:absolute, html2canvas (la parte de html2pdf.js que "fotografía"
  // el HTML) le calcula 0px de alto al clonar el documento para capturarlo,
  // aunque el navegador normal sí lo mida bien — y un lienzo de 0px de alto
  // es un PDF en blanco. Quitando el position por completo (queda como un
  // bloque normal, al final de la página) html2canvas lo mide y lo captura
  // bien, comprobado con varias pruebas. Como ya no se puede tapar con
  // z-index/posición, se añade y se quita tan rápido que en la práctica no
  // se llega a ver.
  const container = document.createElement('div');
  container.style.cssText = 'background:#fff;width:210mm';
  container.innerHTML = bodyHtml;
  document.body.appendChild(container);
  const limpiar = () => {
    container.remove();
    styleEl.remove();
  };
  // Un frame de margen para que el navegador termine de pintar el
  // contenedor recién insertado antes de que html2canvas lo capture.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    html2pdf().from(container).set({
      margin: 0,
      filename,
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save().then(() => { limpiar(); restaurarBtn(); }).catch((err) => {
      limpiar();
      restaurarBtn();
      alert('⚠️ No se pudo generar el PDF: ' + (err && err.message || 'error desconocido'));
    });
  }));
}
function exportTicketPDF(num, name, time, total, slot, items, phone, notes, btn) {
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const itemsHtml = (items || []).map(it => `<div class="order-item"><span>${it.qty}x ${escapeHtml(it.name || '')}</span><span>${(it.subtotal || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
  const body = `
    <div class="header" style="text-align:center">
      <h1>🥔 Dulce Patata Food</h1>
      <p>${fecha}</p>
    </div>
    <div class="ticket-box">
      <div class="ticket-title">Número de pedido</div>
      <div class="ticket-num">${escapeHtml(num || '')}</div>
      <div class="order-meta" style="text-align:center;margin-bottom:14px">
        👤 ${escapeHtml(name || '—')}
        ${phone ? `&nbsp;·&nbsp; 📞 ${escapeHtml(phone)}` : ''}
        ${time ? `&nbsp;·&nbsp; 🕐 ${escapeHtml(time)}` : ''}
        ${slot ? `<br>📦 Recogida de patata a las ${escapeHtml(slot)}h` : ''}
      </div>
      ${itemsHtml ? `<div class="order-items">${itemsHtml}<div class="order-total"><span>Total a pagar</span><span>${parseFloat(total).toFixed(2).replace('.', ',')} €</span></div></div>` : ''}
      ${notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:10px;font-style:italic">📝 ${escapeHtml(notes)}</div>` : ''}
      <div style="text-align:center;margin-top:16px;font-size:12px;color:#8A6A4E">Paga en caja cuando recojas 💛</div>
    </div>`;
  _descargarHtmlComoPDF(body, 'ticket-' + (num || 'pedido') + '.pdf', btn);
}
function _buildClientesMap() {
  const hist = getHistorial();
  const map = {}; // phone → { phone, names, count, total, lastDate, lastOrder, orders[] }
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      const phone = (o.phone || '').replace(/[\s\-().+]/g, '') || '—';
      const name = o.name || '—';
      if (!map[phone]) map[phone] = {
        phone,
        names: new Set(),
        count: 0,
        total: 0,
        lastDate: '',
        lastOrder: null,
        orders: []
      };
      map[phone].names.add(name);
      map[phone].count++;
      map[phone].total = parseFloat((map[phone].total + (o.total || 0)).toFixed(2));
      if (!map[phone].lastDate || day.date > map[phone].lastDate) {
        map[phone].lastDate = day.date;
        map[phone].lastOrder = o;
      }
      map[phone].orders.push({
        ...o,
        date: day.date
      });
    });
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}
var _clientesSort = 'az';
function setClientesSort(modo) {
  _clientesSort = modo;
  ['az','pedidos','gasto','reciente'].forEach(function(m) {
    var btn = document.getElementById('csort-btn-' + m);
    if (!btn) return;
    if (m === modo) {
      btn.style.background = '#3D1F0D';
      btn.style.color = '#FFF8EE';
      btn.style.borderColor = '#3D1F0D';
    } else {
      btn.style.background = '#FFFFFF';
      btn.style.color = '#8A6A4E';
      btn.style.borderColor = '#F5E6C8';
    }
  });
  renderClientes();
}
function _nombreCanonico(c) {
  const names = [...c.names].filter(n => n !== '\u2014');
  if (!names.length) return '\u2014';
  return names.reduce((a, b) => b.length > a.length ? b : a);
}
function renderClientes() {
  var _document$getElementB29;
  const clientes = _buildClientesMap();
  const q = (((_document$getElementB29 = document.getElementById('clientes-search')) === null || _document$getElementB29 === void 0 ? void 0 : _document$getElementB29.value) || '').trim().toLowerCase();
  let filtered = q ? clientes.filter(c => c.phone.includes(q) || [...c.names].some(n => n.toLowerCase().includes(q))) : clientes.slice();

  if (_clientesSort === 'gasto') {
    filtered.sort((a, b) => b.total - a.total);
  } else if (_clientesSort === 'reciente') {
    filtered.sort((a, b) => (b.lastDate || '').localeCompare(a.lastDate || ''));
  } else if (_clientesSort === 'az') {
    filtered.sort((a, b) => _nombreCanonico(a).localeCompare(_nombreCanonico(b), 'es', { sensitivity: 'base' }));
  } else {
    filtered.sort((a, b) => b.count - a.count);
  }

  const summaryEl = document.getElementById('clientes-summary');
  if (summaryEl) {
    const totalClientes = clientes.length;
    const totalPedidos = clientes.reduce((a, c) => a + c.count, 0);
    const ticketMedio = totalPedidos ? (clientes.reduce((a, c) => a + c.total, 0) / totalPedidos).toFixed(2) : '0.00';
    summaryEl.innerHTML =
      '<div class="stat-card">'
      + '<div class="stat-num">' + totalClientes + '</div>'
      + '<div class="stat-label">Clientes \u00FAnicos</div>'
      + '</div>'
      + '<div class="stat-card">'
      + '<div class="stat-num">' + totalPedidos + '</div>'
      + '<div class="stat-label">Pedidos totales</div>'
      + '</div>'
      + '<div class="stat-card stat-card--gold">'
      + '<div class="stat-num">' + ticketMedio.replace('.', ',') + ' \u20AC</div>'
      + '<div class="stat-label">Ticket medio</div>'
      + '</div>';
  }

  const listEl = document.getElementById('clientes-list');
  if (!listEl) return;
  if (!filtered.length) {
    listEl.innerHTML = '<div style="text-align:center;color:#8A6A4E;padding:24px;font-size:13px">Sin resultados</div>';
    return;
  }

  // Se reinicia en cada render (no solo la primera vez) — antes se iba
  // guardando cada pedido visto en este objeto global sin limpiarlo nunca,
  // así que en una sesión larga de mostrador (muchas búsquedas, cambios de
  // orden) iba acumulando entradas indefinidamente. Solo hace falta que
  // contenga los pedidos de LA lista que se acaba de pintar — cualquier
  // fila anterior ya no tiene su elemento en el DOM, así que tampoco puede
  // llegar a usar una entrada vieja.
  window._dpfPedidosMap = {};
  let _lastLetter = null;
  listEl.innerHTML = filtered.map(c => {
    const canonName = _nombreCanonico(c);
    const otherNames = [...c.names].filter(n => n !== '\u2014' && n !== canonName);
    const aliasBadge = otherNames.length
      ? '<span style="display:inline-block;background:#F5E6C8;color:#8A6A4E;border-radius:99px;font-size:10.5px;font-weight:700;padding:1px 8px;margin-left:6px">+' + otherNames.length + ' alias</span>'
      : '';
    const aliasFull = otherNames.length
      ? '<div style="font-size:12px;color:#8A6A4E;margin-bottom:10px">Tambi\u00E9n guardado como: ' + escapeHtml(otherNames.join(', ')) + '</div>'
      : '';
    let letterHead = '';
    if (_clientesSort === 'az') {
      const letra = (canonName[0] || '#').toUpperCase();
      if (letra !== _lastLetter) {
        _lastLetter = letra;
        letterHead = '<div class="client-letter-head">' + letra + '</div>';
      }
    }
    const isFrequent = c.count >= 7;
    const frecBadge = isFrequent
      ? '<span style="display:inline-block;background:#FAEEDA;color:#854F0B;border:1.5px solid #F5C4B3;border-radius:99px;font-size:11px;font-weight:700;padding:2px 9px;margin-left:6px">\u2B50 Frecuente</span>'
      : '';
    const isBlocked = c.phone !== '\u2014' && getBlacklist().includes(c.phone.replace(/\D/g, ''));
    const blockedBadge = isBlocked
      ? '<span style="display:inline-block;background:#fdf0ee;color:#c0392b;border:1.5px solid #e74c3c;border-radius:99px;font-size:11px;font-weight:700;padding:2px 9px;margin-left:6px">\u26D4 Bloqueado</span>'
      : '';
    const phoneDisplay = c.phone !== '\u2014' ? c.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : '\u2014';
    const phoneClean = c.phone !== '\u2014' ? c.phone.replace(/\D/g, '') : '';
    const callBtn = phoneClean
      ? '<a href="tel:+34' + phoneClean + '" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #B5D4F4;background:#E6F1FB;color:#185FA5;text-decoration:none;font-family:\'DM Sans\',sans-serif">\uD83D\uDCDE ' + phoneDisplay + '</a>'
      : '';
    const waBtn = phoneClean
      ? '<a href="https://wa.me/34' + phoneClean + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #9FE1CB;background:#E6FAF0;color:#1a7a4a;text-decoration:none;font-family:\'DM Sans\',sans-serif">\uD83D\uDCAC WhatsApp</a>'
      : '';
    const actionBtns = (callBtn || waBtn)
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" onclick="event.stopPropagation()">' + callBtn + waBtn + '</div>'
      : '';
    const phoneId = phoneClean || c.phone.replace(/\W/g, '');

    const ordersHtml = c.orders.slice().reverse().slice(0, 20).map((o) => {
      const mapKey = 'pm_' + phoneId + '_' + (o.num || '').replace(/\W/g, '');
      window._dpfPedidosMap[mapKey] = o;
      return '<div style="border-bottom:1px dashed #F5E6C8;display:flex;justify-content:space-between;align-items:center;padding:7px 0;flex-wrap:wrap;gap:4px">'
        + '<span style="color:#3D1F0D;font-weight:700;font-size:12px;cursor:pointer" onclick="event.stopPropagation();openPedidoModal(window._dpfPedidosMap[\'' + mapKey + '\'])">' + escapeHtml(o.num) + '</span>'
        + '<span style="color:#8A6A4E;font-size:12px">' + escapeHtml(o.date || '') + ' ' + escapeHtml(o.time || '') + '</span>'
        + '<span style="font-weight:700;color:#3D1F0D;font-size:12px">' + (o.total || 0).toFixed(2).replace('.', ',') + ' \u20AC</span>'
        + '</div>';
    }).join('');

    return letterHead + '<div style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:16px;padding:14px;margin-bottom:8px;cursor:pointer" onclick="toggleClienteDetalle(\'' + phoneId + '\')">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">'
        + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:4px">'
            + '<span style="font-size:15px;font-weight:700;color:#3D1F0D">' + escapeHtml(canonName) + '</span>'
            + aliasBadge
            + frecBadge
            + blockedBadge
            + '<span id="fid-badge-' + phoneId + '" style="display:none"></span>'
          + '</div>'
          + '<div style="font-size:12px;color:#8A6A4E">' + phoneDisplay + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
          + '<div style="font-size:18px;font-weight:900;font-family:\'Anton\',sans-serif;color:#3D1F0D">' + c.total.toFixed(2).replace('.', ',') + ' \u20AC</div>'
          + '<div style="font-size:11px;color:#8A6A4E">' + c.count + ' pedido' + (c.count !== 1 ? 's' : '') + ' \u00B7 \u00FAltimo ' + (c.lastDate || '') + '</div>'
        + '</div>'
      + '</div>'
      + actionBtns
      + '<div id="cliente-detalle-' + phoneId + '" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid #F5E6C8">'
        + aliasFull
        + '<div style="font-size:11px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Historial de pedidos</div>'
        + ordersHtml
        + (c.orders.length > 20 ? '<div style="font-size:11px;color:#8A6A4E;margin-top:6px">...y ' + (c.orders.length - 20) + ' m\u00E1s</div>' : '')
      + '</div>'
    + '</div>';
  }).join('');

  // Cargar sellos de fidelización en segundo plano, sin bloquear el render de la lista
  if (window.fb_loadFidelizacionCliente) {
    filtered.forEach(c => {
      const phoneClean = c.phone !== '\u2014' ? c.phone.replace(/\D/g, '') : '';
      if (!phoneClean) return;
      const phoneId = phoneClean;
      window.fb_loadFidelizacionCliente(phoneClean).then(cliente => {
        if (!cliente) return;
        const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
        if (!cliente.sellos && !premiosPendientes) return;
        const badge = document.getElementById('fid-badge-' + phoneId);
        if (!badge) return;
        const meta = (typeof FIDELIZACION_META !== 'undefined') ? FIDELIZACION_META : 10;
        const texto = premiosPendientes > 0
          ? '\uD83C\uDF81 ' + premiosPendientes + (premiosPendientes > 1 ? ' premios' : ' premio') + ' pendiente' + (premiosPendientes > 1 ? 's' : '')
          : '\uD83C\uDF96\uFE0F ' + cliente.sellos + '/' + meta + ' sellos';
        const bg = premiosPendientes > 0 ? '#FAEEDA' : '#E6F1FB';
        const color = premiosPendientes > 0 ? '#854F0B' : '#185FA5';
        const border = premiosPendientes > 0 ? '#F5C4B3' : '#B5D4F4';
        badge.style.display = 'inline-block';
        badge.style.background = bg;
        badge.style.color = color;
        badge.style.border = '1.5px solid ' + border;
        badge.style.borderRadius = '99px';
        badge.style.fontSize = '11px';
        badge.style.fontWeight = '700';
        badge.style.padding = '2px 9px';
        badge.style.marginLeft = '6px';
        badge.textContent = texto;
      }).catch(() => {});
    });
  }
}
function toggleClienteDetalle(phoneId) {
  const id = 'cliente-detalle-' + phoneId;
  const el = document.getElementById(id);
  if (!el) return;
  const card = el.parentElement;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if (card) card.style.borderColor = isOpen ? '#F5E6C8' : '#3D1F0D';
}
function openPedidoModal(o) {
  // Crear modal si no existe
  var modal = document.getElementById('pedido-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pedido-modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(61,31,13,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
    modal.innerHTML = '<div id="pedido-modal-box" style="background:#FFF8EE;border-radius:18px;padding:22px 20px;width:100%;max-width:340px;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
      + '<button onclick="document.getElementById(\'pedido-modal-overlay\').style.display=\'none\'" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;color:#8A6A4E;line-height:1">✕</button>'
      + '<div id="pedido-modal-content"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });
    document.body.appendChild(modal);
  }
  var hasItems = o.items && o.items.length;
  var itemsHtml = hasItems
    ? o.items.filter(function(it) { return it.name && !it.isFee; }).map(function(it) {
        var extras = it.extras && it.extras.length
          ? '<span style="color:#8A6A4E;font-size:11px;display:block">' + it.extras.map(function(e){return escapeHtml(e);}).join(' · ') + '</span>'
          : '';
        return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px dashed #F5E6C8;font-size:13px">'
          + '<div style="flex:1;color:#2A1506">' + escapeHtml((it.qty || 1) + '\u00D7 ' + it.name) + extras + '</div>'
          + '<div style="font-weight:600;white-space:nowrap;margin-left:10px;color:#3D1F0D">' + (it.subtotal || 0).toFixed(2).replace('.', ',') + ' \u20AC</div>'
          + '</div>';
      }).join('')
    : '<div style="font-size:12px;color:#8A6A4E;font-style:italic;padding:8px 0">Sin detalle de productos</div>';
  var slotLine = o.slot ? ' \u00B7 recogida ' + escapeHtml(o.slot) + 'h' : '';
  document.getElementById('pedido-modal-content').innerHTML =
    '<div style="font-size:22px;font-weight:900;color:#3D1F0D;font-family:Georgia,serif;margin-bottom:2px">' + escapeHtml(o.num) + '</div>'
    + '<div style="font-size:12px;color:#8A6A4E;margin-bottom:14px">' + escapeHtml(o.date || '') + ' \u00B7 ' + escapeHtml(o.time || '') + slotLine + '</div>'
    + itemsHtml
    + '<div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:#3D1F0D;margin-top:10px;padding-top:10px;border-top:1.5px solid #F5E6C8">'
      + '<span>Total</span><span style="color:#3D1F0D">' + (o.total || 0).toFixed(2).replace('.', ',') + ' \u20AC</span>'
    + '</div>';
  modal.style.display = 'flex';
}
function exportClientesCSV() {
  const clientes = _buildClientesMap();
  const rows = [['Teléfono', 'Nombre', 'Pedidos', 'Total (€)', 'Último pedido']];
  clientes.forEach(c => {
    rows.push([c.phone, [...c.names].join(' / '), c.count, c.total.toFixed(2).replace('.', ','), c.lastDate]);
  });
  // _csvEscape (historial-export.js) dobla las comillas internas — sin
  // esto, un nombre de cliente con una " cortaba la fila antes de tiempo y
  // desplazaba las columnas siguientes al abrir el CSV en Excel/Sheets.
  const csv = rows.map(r => r.map(v => "\"".concat(_csvEscape(v), "\"")).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes_dulce_patata.csv';
  a.click();
  URL.revokeObjectURL(url);
}
function loadHistorial(despues) {
  // Cargar historial completo desde Firebase (fuente de verdad entre
  // dispositivos) — sin esto, un dispositivo que nunca lo haya sincronizado
  // antes (p.ej. la tablet de cocina, si solo se usó para pedidos en vivo)
  // solo tiene lo que haya en su propio localStorage, que puede estar vacío
  // aunque en otro dispositivo (el PC donde sí se ha abierto esta vista)
  // haya historial de sobra — tanto la vista "Por días" como la lista de
  // Clientes dependen de esto, por eso admite un callback opcional para
  // repintar lo que corresponda en cada caso.
  if (window.fb_loadHistorial) {
    window.fb_loadHistorial(30).then(fbHist => {
      if (fbHist && fbHist.length > 0) {
        // Guardar en localStorage para acceso rápido futuro
        fbHist.forEach(d => saveToHistorial(d));
      }
      _renderHistorial();
      if (despues) despues();
    }).catch(() => { _renderHistorial(); if (despues) despues(); });
    // Mostrar localStorage mientras llega Firebase
    if (getHistorial().length > 0) { _renderHistorial(); if (despues) despues(); }
    return;
  }
  _renderHistorial();
  if (despues) despues();
}
function _renderHistorial() {
  const hist = getHistorial();
  const summary = document.getElementById('historial-summary');
  const list = document.getElementById('historial-list');
  const chartEl = document.getElementById('historial-chart');
  if (!summary || !list) return;
  if (!hist.length) {
    summary.innerHTML = '';
    if (chartEl) chartEl.innerHTML = '';
    list.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin historial todavía</div>';
    return;
  }
  const totalDays = hist.length;
  const totalOrders = hist.reduce((s, d) => s + d.count, 0);
  const totalMoney = hist.reduce((s, d) => s + d.total, 0);
  const avgPerDay = totalOrders / totalDays;
  const ticketMedio = totalOrders > 0 ? totalMoney / totalOrders : 0;
  summary.innerHTML = "\n    <div class=\"stat-card\">\n      <div class=\"stat-num\">".concat(totalOrders, "</div>\n      <div class=\"stat-label\">Pedidos totales</div>\n    </div>\n    <div class=\"stat-card stat-card--gold\">\n      <div class=\"stat-num\">").concat(totalMoney.toFixed(2).replace('.', ','), " \u20AC</div>\n      <div class=\"stat-label\">Ingresos totales</div>\n    </div>\n    <div class=\"stat-card\">\n      <div class=\"stat-num\">").concat(ticketMedio.toFixed(2).replace('.', ','), " \u20AC</div>\n      <div class=\"stat-label\">Ticket medio</div>\n    </div>");

  // Gráfico de barras (últimos 14 días)
  if (chartEl) {
    const recent = hist.slice(0, 14).reverse();
    const maxCount = Math.max(...recent.map(d => d.count), 1);
    chartEl.innerHTML = recent.map(d => {
      const pct = Math.round(d.count / maxCount * 100);
      const label = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
      return "<div class=\"hist-bar-wrap\" title=\"".concat(label, ": ").concat(d.count, " pedidos \xB7 ").concat(d.total.toFixed(2), " \u20AC\" onclick=\"expandHistorialDay('").concat(d.date, "')\">\n        <div class=\"hist-bar\" style=\"height:").concat(Math.max(pct, 4), "%\"></div>\n        <div class=\"hist-bar-label\">").concat(label, "</div>\n      </div>");
    }).join('');
  }
  list.innerHTML = hist.map(d => {
    const dateLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    return "\n    <div style=\"display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap\">\n      <span style=\"font-weight:600;color:#2A1506;font-size:13px;min-width:110px\">".concat(dateLabel, "</span>\n      <span style=\"font-size:13px;color:#8A6A4E\">").concat(d.count, " pedido").concat(d.count !== 1 ? 's' : '', "</span>\n      <span style=\"font-weight:700;color:#3D1F0D;font-size:14px\">").concat(d.total.toFixed(2).replace('.', ','), " \u20AC</span>\n      <button onclick=\"expandHistorialDay('").concat(d.date, "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;color:#3D1F0D;font-weight:600\">Ver detalle</button>\n      <button onclick=\"exportDayPDFFromHistorial('").concat(d.date, "',this)\" style=\"background:#3D1F0D;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif\">\uD83D\uDCC4 PDF</button>\n    </div>");
  }).join('');
}
function exportDayPDFFromHistorial(date, btn) {
  const hist = getHistorial();
  const day = hist.find(d => d.date === date);
  if (!day || !day.orders || !day.orders.length) {
    alert('No hay pedidos para este día');
    return;
  }
  const fecha = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  _exportDayDataPDF(day.orders, day.total, fecha, date, btn);
}
function _exportDayDataPDF(orders, total, fecha, dateKey, btn) {
  const t = total || orders.reduce((a, o) => a + (o.total || 0), 0);
  const ordersHtml = orders.map(o => {
    const itemsHtml = (o.items || []).map(it => `<div class="order-item"><span>${it.qty}x ${escapeHtml(it.name || '')}</span><span>${(it.subtotal || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="order-num">${escapeHtml(o.num || '')}</div>
          <div class="order-meta">👤 ${escapeHtml(o.name || '—')} &nbsp;·&nbsp; 🕐 ${escapeHtml(o.time || '—')}${o.slot ? ` &nbsp;·&nbsp; 📦 ${escapeHtml(o.slot)}` : ''}${o.phone ? ` &nbsp;·&nbsp; 📞 ${escapeHtml(o.phone)}` : ''}</div>
        </div>
        <div style="font-size:18px;font-weight:900;color:#3D1F0D">${(o.total || 0).toFixed(2).replace('.', ',')} €</div>
      </div>
      ${itemsHtml ? `<div class="order-items">${itemsHtml}</div>` : ''}
      ${o.notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:6px;font-style:italic">📝 ${escapeHtml(o.notes)}</div>` : ''}
    </div>`;
  }).join('');
  const body = `
    <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Resumen de pedidos · ${fecha}</p></div>
    <div class="content">
      <div class="summary">
        <div class="summary-item"><div class="val">${orders.length}</div><div class="lbl">Pedidos</div></div>
        <div class="summary-item"><div class="val">${t.toFixed(2).replace('.', ',')} €</div><div class="lbl">Total</div></div>
        <div class="summary-item"><div class="val">${(t / orders.length).toFixed(2).replace('.', ',')} €</div><div class="lbl">Ticket medio</div></div>
      </div>
      ${ordersHtml}
    </div>`;
  _descargarHtmlComoPDF(body, 'pedidos-' + dateKey + '.pdf', btn);
}
function exportHistorialPDF(btn) {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial para exportar');
    return;
  }
  const totalOrders = hist.reduce((s, d) => s + d.count, 0);
  const totalMoney = hist.reduce((s, d) => s + d.total, 0);
  const daysHtml = hist.slice().reverse().map(d => {
    const fecha = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const ordersHtml = (d.orders || []).map(o => `<div class="order-item" style="font-size:12px"><span>${escapeHtml(o.num || '')} · ${escapeHtml(o.name || '—')} ${o.time ? '· ' + escapeHtml(o.time) : ''}</span><span>${(o.total || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div class="order-num" style="font-size:15px">${fecha}</div>
        <div style="font-size:14px;font-weight:700;color:#3D1F0D">${d.count} pedidos · ${d.total.toFixed(2).replace('.', ',')} €</div>
      </div>
      ${ordersHtml}
    </div>`;
  }).join('');
  const body = `
    <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Historial completo · ${hist.length} días</p></div>
    <div class="content">
      <div class="summary">
        <div class="summary-item"><div class="val">${hist.length}</div><div class="lbl">Días</div></div>
        <div class="summary-item"><div class="val">${totalOrders}</div><div class="lbl">Pedidos</div></div>
        <div class="summary-item"><div class="val">${totalMoney.toFixed(2).replace('.', ',')} €</div><div class="lbl">Total</div></div>
        <div class="summary-item"><div class="val">${totalOrders ? (totalMoney / totalOrders).toFixed(2).replace('.', ',') : '0,00'} €</div><div class="lbl">Ticket medio</div></div>
      </div>
      ${daysHtml}
    </div>`;
  _descargarHtmlComoPDF(body, 'historial-dulce-patata.pdf', btn);
}
function expandHistorialDay(date) {
  const hist = getHistorial();
  const day = hist.find(d => d.date === date);
  if (!day) return;
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Productos del día
  const prodCounts = {};
  (day.orders || []).forEach(o => {
    (o.items || []).forEach(it => {
      prodCounts[it.name] = (prodCounts[it.name] || 0) + it.qty;
    });
  });
  const topDay = Object.entries(prodCounts).sort((a, b) => b[1] - a[1]);
  let html = "\n    <h3 style=\"font-family:'Playfair Display',serif;color:#3D1F0D;margin-bottom:4px;font-size:18px\">".concat(dateLabel, "</h3>\n    <div style=\"display:grid;grid-template-columns:1fr 1fr;margin:14px 0\">\n      <div style=\"background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:8px;padding:12px;text-align:center\">\n        <div style=\"font-size:22px;font-weight:900;color:#3D1F0D\">").concat(day.count, "</div>\n        <div style=\"font-size:11px;color:#8A6A4E;font-weight:600;text-transform:uppercase\">Pedidos</div>\n      </div>\n      <div style=\"background:#FFFFFF;border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;text-align:center\">\n        <div style=\"font-size:22px;font-weight:900;color:#3D1F0D\">").concat(day.total.toFixed(2).replace('.', ','), " \u20AC</div>\n        <div style=\"font-size:11px;color:#8A6A4E;font-weight:600;text-transform:uppercase\">Total</div>\n      </div>\n    </div>");
  if (topDay.length) {
    html += "<div style=\"font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px\">\uD83C\uDFC6 M\xE1s vendido este d\xEDa</div>";
    html += topDay.slice(0, 4).map(_ref23 => {
      let _ref24 = _slicedToArray(_ref23, 2),
        name = _ref24[0],
        qty = _ref24[1];
      return "<div style=\"display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F5E6C8;font-size:13px\">\n        <span style=\"color:#2A1506;font-weight:500\">".concat(escapeHtml(name), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(qty, " uds</span>\n      </div>");
    }).join('');
  }
  html += "<div style=\"font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px\">\uD83E\uDDFE Pedidos</div>";
  (day.orders || []).forEach(o => {
    html += "<div style=\"display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n      <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n      <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n      ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">\uD83D\uDD50 ".concat(escapeHtml(o.slot), "</span>") : '', "\n      <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n      <span style=\"font-weight:700;color:#3D1F0D\">").concat((o.total || 0).toFixed(2).replace('.', ','), " \u20AC</span>\n    </div>");
  });
  html += "<div style=\"text-align:right;margin-top:12px\"><button onclick=\"closeHistorialDayModal()\" style=\"background:#F5E6C8;border:none;border-radius:8px;padding:8px 20px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;color:#3D1F0D\">Cerrar</button></div>";
  const modal = document.getElementById('historial-day-modal');
  document.getElementById('historial-day-modal-content').innerHTML = html;
  modal.style.display = 'block';
}
function closeHistorialDayModal() {
  document.getElementById('historial-day-modal').style.display = 'none';
}

// Update showAdminSection to also load live orders
let _lastAdminSection = 'productos';
function adminGoBack() {
  showAdminSection(_lastAdminSection, null);
  // reactivar tab correspondiente
  document.querySelectorAll('.admin-tab').forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + _lastAdminSection + "'")) {
      t.classList.add('active');
    }
  });
  document.getElementById('admin-back-btn').style.display = 'none';
}
function toggleSettingsDropdown() {
  const d = document.getElementById('settings-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
  if (d.style.display === 'block') {
    setTimeout(() => document.addEventListener('click', _closeSettingsOnClickOutside), 0);
  }
}
function closeSettingsDropdown() {
  document.getElementById('settings-dropdown').style.display = 'none';
  document.removeEventListener('click', _closeSettingsOnClickOutside);
}
function _closeSettingsOnClickOutside(e) {
  const d = document.getElementById('settings-dropdown');
  if (!d.contains(e.target) && !e.target.closest('[onclick="toggleSettingsDropdown()"]')) {
    closeSettingsDropdown();
  }
}
function showAdminSection(id, btn) {
  // Guardar sección anterior para el botón volver (solo si venimos de una tab normal)
  const settingsSections = ['config', 'pwd', 'pedidos-config'];
  const currentActive = document.querySelector('.admin-section.active');
  if (currentActive) {
    const currentId = currentActive.id.replace('admin-', '');
    if (!settingsSections.includes(currentId)) _lastAdminSection = currentId;
  }
  // Mostrar/ocultar flecha volver
  const backBtn = document.getElementById('admin-back-btn');
  if (backBtn) backBtn.style.display = settingsSections.includes(id) ? 'inline-block' : 'none';
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const _sec = document.getElementById('admin-' + id);
  if (!_sec) { console.error('showAdminSection: section not found: admin-' + id); return; }
  _sec.classList.add('active');
  _sec.style.display = 'block';
  if (btn) btn.classList.add('active');
  if (id === 'stats') loadDayStats();
  // La pestaña "Historial" del panel normal solo muestra la lista de
  // clientes ahora — el resumen por días (con la facturación) se movió al
  // acceso restringido (ver abrirHistorialDiasBimba en admin-accesos.js),
  // porque no es algo que necesite ver el personal.
  // loadHistorial() sincroniza primero con Firebase (ver comentario en su
  // definición) — sin esto, un dispositivo que nunca haya abierto el
  // historial por días (p.ej. una tablet usada solo para pedidos en vivo)
  // mostraría la lista de Clientes vacía, con solo lo que hubiera quedado
  // en su localStorage local.
  if (id === 'historial') loadHistorial(renderClientes);
  if (id === 'pedidos') {
    _adminLoggedIn = true; window._adminLoggedIn = true;
    stopAlertLoop();
    _resetPedidosPendientesAlerta();
    loadLiveOrdersWithLocalFirst();
    _lastKnownOrderCount = null;
    checkForNewOrders();
    clearUnseenOrders();
    loadCatBlockUI();
  }
  if (id === 'alertas') {
    renderAlertas();
    if (typeof renderIncidencias === 'function') renderIncidencias();
  }
  if (id === 'local') {
    loadSoundConfigUI();
    loadSoundDesconexionConfigUI();
    loadSlotTurnosUI();
    loadModifyWindowInput();
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
    if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI();
    if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
    loadBannerDia();
  }
  // Nota: 'pwd', 'stock-config', 'accesos' y 'empleados' NO se abren nunca
  // a través de showAdminSection() — son secciones del acceso restringido
  // "bimba" y cada una tiene hoy su propia función dedicada, que además ya
  // hace su propia inicialización: bimbaIrAContrasena(), bimbaVolverAlPanel()
  // (que además apunta a "stock-config", no "admin-empleados" — ese id ni
  // siquiera existe ya, es "admin-bimba-empleados"), bimbaIrAAccesos() y
  // bimbaIrAEmpleados() (todas en js/auth.js). El gesto secreto "log" (que
  // sí usaba esta función, vía checkLogSecret) se quitó por completo:
  // apuntaba a un id ("admin-log") que ya no existía, y la misma vista de
  // actividad ya está disponible sin trucos en la pestaña "📋 Actividad"
  // de Accesos. Si alguna vez hace falta reintroducir estos ids aquí, que
  // sea a propósito, no por accidente.
  if (id === 'pedidos-config') {
    loadAntiSpamFromFirebase();
    // Inicializar cooldown y daily limit
    var cfg = getAntiSpamCfg();
    var cdEl = document.getElementById('cfg-cooldown');
    var dlEl = document.getElementById('cfg-daily-limit');
    if (cdEl) cdEl.value = cfg.cooldown;
    if (dlEl) dlEl.value = cfg.dailyLimit;
    // Inicializar fee
    var feeEn = getFeeEnabled();
    var feeAmt = getFeeAmount();
    var feeLbl = getFeeLabel();
    var feeAmtEl = document.getElementById('cfg-fee-amount');
    var feeLblEl = document.getElementById('cfg-fee-label');
    var feeToggle = document.getElementById('fee-toggle');
    var feeToggleDot = document.getElementById('fee-toggle-dot');
    if (feeAmtEl) feeAmtEl.value = feeAmt.toFixed(2);
    if (feeLblEl) feeLblEl.value = feeLbl;
    if (feeToggle) feeToggle.style.background = feeEn ? '#27855a' : '#ccc';
    if (feeToggleDot) feeToggleDot.style.transform = feeEn ? 'translateX(20px)' : 'translateX(0)';
    // Inicializar slot max
    var slotMaxEl = document.getElementById('slot-max-input-cfg') || document.getElementById('slot-max-input');
    if (slotMaxEl) slotMaxEl.value = getSlotMax();
    // Inicializar tiempo para modificar pedido
    if (typeof loadModifyWindowInput === 'function') loadModifyWindowInput();
    // Inicializar descuento estudiante/jubilado
    if (typeof getStudentDiscountEnabled === 'function') {
      var sdEn = getStudentDiscountEnabled();
      var sdPct = getStudentDiscountPct();
      var sdPctEl = document.getElementById('cfg-student-discount-pct');
      var sdToggle = document.getElementById('student-discount-toggle');
      var sdToggleDot = document.getElementById('student-discount-toggle-dot');
      if (sdPctEl) sdPctEl.value = sdPct;
      if (sdToggle) sdToggle.style.background = sdEn ? '#27855a' : '#ccc';
      if (sdToggleDot) sdToggleDot.style.transform = sdEn ? 'translateX(20px)' : 'translateX(0)';
    }
  }
}
async function renderActiveSessionsList() {
  const container = document.getElementById('active-sessions-list');
  if (!container) return;
  container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">Cargando...</div>';
  try {
    const snap = await firebase.database().ref('activeSessions').get();
    const data = snap.val();
    if (!data) {
      container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">No hay sesiones activas ahora mismo.</div>';
      return;
    }
    const sessions = Object.values(data).filter(s => !s.killed).sort((a, b) => b.ts - a.ts);
    if (!sessions.length) {
      container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">No hay sesiones activas ahora mismo.</div>';
      return;
    }
    container.innerHTML = sessions.map(s => {
      const isMe = s.sid === window._mySessionId;
      return '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
        '<div>' +
          '<div style="font-size:13px;font-weight:700;color:#3D1F0D">' + (s.device || 'Dispositivo desconocido') + (isMe ? ' <span style="background:#27855a;color:#fff;font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600">Tú</span>' : '') + '</div>' +
          '<div style="font-size:11px;color:#8A6A4E;margin-top:2px">Desde: ' + (s.time || '–') + '</div>' +
        '</div>' +
        '<button onclick="killSession(&quot;' + s.sid + '&quot;)" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:sans-serif">' + (isMe ? 'Cerrar mi sesión' : 'Expulsar') + '</button>' +
      '</div>';
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="color:#c0392b;font-size:13px">Error al cargar sesiones: ' + e.message + '</div>';
  }
}

async function killSession(sid) {
  try {
    await firebase.database().ref('activeSessions/' + sid + '/killed').set(true);
    // Si esa sesión ya no está conectada para pillar el aviso en directo,
    // "killed" por sí solo no basta: el dispositivo seguiría entrando sin
    // pedir contraseña la próxima vez gracias a "dispositivo de confianza".
    // Por eso también se borra aquí su registro de confianza — así deja
    // de valer de verdad, lo esté escuchando en ese momento o no.
    try {
      const snap = await firebase.database().ref('activeSessions/' + sid + '/deviceId').get();
      const deviceId = snap.val();
      if (deviceId) await firebase.database().ref('config/trustedDevices/' + deviceId).remove();
    } catch (e) {}
    renderActiveSessionsList();
  } catch(e) {
    alert('Error al expulsar la sesión: ' + e.message);
  }
}

async function killAllSessions() {
  try {
    const todas = (await firebase.database().ref('activeSessions').get()).val();
    if (!todas) { showAlert('No hay sesiones activas ahora mismo.'); return; }
    const otras = Object.values(todas).filter(s => !s.killed && s.sid !== window._mySessionId);
    if (!otras.length) { showAlert('No hay otras sesiones activas para expulsar.'); return; }
    const ok = await showConfirmAsync(
      '¿Expulsar todas?',
      'Se cerrará el panel en ' + otras.length + ' dispositivo' + (otras.length !== 1 ? 's' : '') + ' (menos el tuyo). Tendrán que volver a iniciar sesión.',
      'Expulsar todas'
    );
    if (!ok) return;
    const updates = {};
    otras.forEach(s => {
      updates['activeSessions/' + s.sid + '/killed'] = true;
      if (s.deviceId) updates['config/trustedDevices/' + s.deviceId] = null; // revoca también la confianza, no solo la sesión en directo
    });
    await firebase.database().ref().update(updates);
    logActivity('🚫 Expulsadas ' + otras.length + ' sesión' + (otras.length !== 1 ? 'es' : '') + ' a la vez');
    renderActiveSessionsList();
  } catch (e) {
    showAlert('Error al expulsar las sesiones: ' + e.message);
  }
}

