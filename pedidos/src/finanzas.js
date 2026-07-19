// ── FINANZAS: VENTANAS INDEPENDIENTES (mismo patrón que el resto del panel bimba) ──
function openMargenesOverlay() {
  document.getElementById('margenes-overlay').classList.add('open');
  bimbaRenderMargenes();
}
function closeMargenesOverlay() {
  document.getElementById('margenes-overlay').classList.remove('open');
}
function openCalculadoraOverlay() {
  document.getElementById('calculadora-overlay').classList.add('open');
  bimbaPoblarSelectorProductosCalc();
  bimbaCalcularPrecio();
}
function closeCalculadoraOverlay() {
  document.getElementById('calculadora-overlay').classList.remove('open');
}
function openEquipoOverlay() {
  document.getElementById('equipo-overlay').classList.add('open');
  bimbaRenderEquipoFacturacion();
}
function closeEquipoOverlay() {
  document.getElementById('equipo-overlay').classList.remove('open');
}

// ── FINANZAS: MÁRGENES POR PRODUCTO ──
function bimbaRenderMargenes() {
  const el = document.getElementById('bimba-margenes-lista');
  if (!el) return;
  const ordenSel = document.getElementById('margenes-orden');
  const orden = ordenSel ? ordenSel.value : 'margenPct';
  const items = MENU.filter(i => !i.hidden);
  const emojiCat = { "Patatas": "🥔", "Boniato": "🍠", "Paninis": "🍕", "Cookies": "🍪", "Tartas": "🍰", "Bebidas": "🥤" };

  items.forEach(i => {
    const tieneCoste = !(i.coste === undefined || i.coste === null || i.coste === '');
    i._tieneCoste = tieneCoste;
    i._margenEur = tieneCoste ? (i.price - i.coste) : null;
    i._margenPct = tieneCoste && i.price > 0 ? (i._margenEur / i.price) * 100 : null;
  });

  // Orden real de categorías: el mismo en que aparecen en la carta (MENU), no alfabético
  const catOrder = [];
  MENU.forEach(i => { if (!catOrder.includes(i.cat)) catOrder.push(i.cat); });

  const porCat = {};
  items.forEach(i => { (porCat[i.cat] = porCat[i.cat] || []).push(i); });

  function comparar(a, b) {
    if (orden === 'margenPct') {
      if (a._tieneCoste && b._tieneCoste) return a._margenPct - b._margenPct;
      if (a._tieneCoste !== b._tieneCoste) return a._tieneCoste ? 1 : -1; // sin coste primero, para que no se olviden
      return a.name.localeCompare(b.name);
    }
    if (orden === 'margenEur') {
      if (a._tieneCoste && b._tieneCoste) return a._margenEur - b._margenEur;
      if (a._tieneCoste !== b._tieneCoste) return a._tieneCoste ? 1 : -1;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  }

  function filaHtml(item) {
    const conMargen = item._tieneCoste;
    const bajo = conMargen && item._margenPct < 50;
    const colorMargen = !conMargen ? '#8A6A4E' : (bajo ? '#c0392b' : '#27855a');
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F5E6C8' + (bajo ? ';background:rgba(192,57,43,0.05)' : '') + '">'
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:700;color:#3D1F0D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + formatNombreConBadgeNuevo(item.name) + '</div>'
        + '<div style="font-size:11px;color:#8A6A4E">venta ' + item.price.toFixed(2) + ' €</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0">'
        + '<input type="number" step="0.01" min="0" placeholder="0.00" value="' + (conMargen ? item.coste : '') + '" data-id="' + item.id + '" onchange="bimbaActualizarCoste(this)" style="width:60px;padding:5px 6px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif">'
        + '<span style="font-size:11px;color:#8A6A4E">€</span>'
      + '</div>'
      + '<div style="text-align:right;min-width:60px;flex-shrink:0">'
        + (conMargen
            ? '<div style="font-size:13px;font-weight:800;color:' + colorMargen + '">' + (item._margenEur >= 0 ? '+' : '') + item._margenEur.toFixed(2) + ' €</div><div style="font-size:11px;color:' + colorMargen + '">' + item._margenPct.toFixed(0) + '%</div>'
            : '<div style="font-size:11px;color:#8A6A4E">añade coste ↑</div>')
      + '</div>'
    + '</div>';
  }
  function catHeaderHtml(cat) {
    const emoji = emojiCat[cat] || '';
    return '<div style="font-family:\'Oswald\',sans-serif;font-size:12px;font-weight:700;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;padding:7px 12px;border-radius:8px;margin:14px 0 6px">' + (emoji ? emoji + ' ' : '') + escapeHtml(cat) + '</div>';
  }

  let html = '';
  catOrder.forEach(cat => {
    const lista = porCat[cat];
    if (!lista || !lista.length) return;
    lista.sort(comparar);
    html += catHeaderHtml(cat);
    html += lista.map(filaHtml).join('');
  });
  if (!items.length) {
    html = '<div style="color:#8A6A4E;font-size:13px">No hay productos visibles</div>';
  }
  el.innerHTML = html;
}
function bimbaActualizarCoste(inputEl) {
  const id = parseInt(inputEl.dataset.id, 10);
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  const val = parseFloat(inputEl.value);
  item.coste = (isNaN(val) || val < 0) ? undefined : val;
  saveMenu();
  bimbaRenderMargenes();
}

// ── FINANZAS: CALCULADORA DE PRECIOS ──
// ── FINANZAS: CALCULADORA DE PRECIOS ──
function bimbaPoblarSelectorProductosCalc() {
  const sel = document.getElementById('calc-producto');
  if (!sel) return;
  const valorActual = sel.value;
  const items = MENU.filter(i => !i.hidden).slice().sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));
  const porCat = {};
  items.forEach(i => { (porCat[i.cat] = porCat[i.cat] || []).push(i); });
  let html = '<option value="">— Elige un producto —</option>';
  Object.keys(porCat).forEach(cat => {
    html += '<optgroup label="' + escapeAttr(cat) + '">';
    porCat[cat].forEach(i => {
      html += '<option value="' + i.id + '">' + escapeHtml(i.name.replace('🆕', '').trim()) + (i.coste != null ? ' (coste ' + i.coste.toFixed(2) + '€)' : '') + '</option>';
    });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
  sel.value = valorActual;
}
function bimbaCalcSeleccionarProducto() {
  const sel = document.getElementById('calc-producto');
  const costeEl = document.getElementById('calc-coste');
  if (!sel || !costeEl || !sel.value) return;
  const item = MENU.find(i => i.id === parseInt(sel.value, 10));
  if (item && item.coste != null) {
    costeEl.value = item.coste;
    bimbaCalcularPrecio();
  }
}
function bimbaCalcularPrecio() {
  const costeEl = document.getElementById('calc-coste');
  const margenEl = document.getElementById('calc-margen');
  const precioEl = document.getElementById('calc-precio');
  const subEl = document.getElementById('calc-sub');
  const redondeosEl = document.getElementById('calc-redondeos');
  if (!costeEl || !margenEl || !precioEl) return;
  const coste = parseFloat(costeEl.value);
  const margen = parseFloat(margenEl.value);
  if (isNaN(coste) || coste < 0 || isNaN(margen) || margen < 0 || margen >= 100) {
    precioEl.textContent = '—';
    subEl.textContent = 'Pon coste y margen';
    redondeosEl.innerHTML = '';
    return;
  }
  const precio = coste / (1 - margen / 100);
  precioEl.textContent = precio.toFixed(2) + ' €';
  subEl.textContent = 'Margen real: ' + (precio - coste).toFixed(2) + ' € (' + margen.toFixed(0) + '%)';
  const bajada = Math.floor(precio * 10) / 10;
  const subida = Math.ceil(precio * 10) / 10;
  const opciones = bajada === subida ? [bajada] : [bajada, subida];
  redondeosEl.innerHTML = opciones.map(p => {
    const margenReal = p > 0 ? ((p - coste) / p) * 100 : 0;
    return '<div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      + '<div style="font-size:15px;font-weight:800;color:#3D1F0D">' + p.toFixed(2) + ' €</div>'
      + '<div style="font-size:11px;color:#8A6A4E;text-align:right">margen real: ' + margenReal.toFixed(0) + '%</div>'
      + '</div>';
  }).join('');
}

// ── FINANZAS: EQUIPO VS FACTURACIÓN ──
function _parseHM(str) {
  if (!str) return null;
  const p = str.split(':').map(Number);
  return p[0] * 60 + (p[1] || 0);
}
function _empHorasEnPeriodo(empId, fechaInicio, fechaFin) {
  let fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  const suyos = fichajes.filter(f => f.empId === empId && f.fecha >= fechaInicio && f.fecha <= fechaFin);
  const porFecha = {};
  suyos.forEach(f => { (porFecha[f.fecha] = porFecha[f.fecha] || []).push(f); });
  let totalMin = 0;
  Object.keys(porFecha).forEach(fecha => {
    const dia = porFecha[fecha].slice().sort((a, b) => (a.horaReal || a.hora).localeCompare(b.horaReal || b.hora));
    let entradaPendiente = null;
    dia.forEach(f => {
      const min = _parseHM(f.horaReal || f.hora);
      if (f.tipo === 'entrada') {
        entradaPendiente = min;
      } else if (f.tipo === 'salida' && entradaPendiente !== null) {
        totalMin += Math.max(0, min - entradaPendiente);
        entradaPendiente = null;
      }
    });
  });
  return totalMin / 60;
}
function _equipoRangoPeriodo() {
  const sel = document.getElementById('equipo-periodo');
  const modo = sel ? sel.value : 'mes';
  const hoy = new Date();
  const fin = hoy.toISOString().slice(0, 10);
  let inicio;
  if (modo === 'semana') {
    const diaSemana = (hoy.getDay() + 6) % 7; // lunes = 0
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana);
    inicio = lunes.toISOString().slice(0, 10);
  } else if (modo === 'mes') {
    inicio = fin.slice(0, 8) + '01';
  } else if (modo === 'trimestre') {
    const mesInicioTrim = Math.floor(hoy.getMonth() / 3) * 3;
    inicio = new Date(hoy.getFullYear(), mesInicioTrim, 1).toISOString().slice(0, 10);
  } else if (modo === 'anio') {
    inicio = hoy.getFullYear() + '-01-01';
  } else if (modo === '3meses') {
    const d = new Date(hoy);
    d.setMonth(d.getMonth() - 3);
    inicio = d.toISOString().slice(0, 10);
  } else if (modo === '6meses') {
    const d = new Date(hoy);
    d.setMonth(d.getMonth() - 6);
    inicio = d.toISOString().slice(0, 10);
  } else if (modo === 'personalizado') {
    const iniEl = document.getElementById('equipo-fecha-inicio');
    const finEl = document.getElementById('equipo-fecha-fin');
    const iniVal = (iniEl && iniEl.value) ? iniEl.value : fin;
    const finVal = (finEl && finEl.value) ? finEl.value : fin;
    return { inicio: iniVal, fin: finVal };
  } else {
    inicio = fin.slice(0, 8) + '01';
  }
  return { inicio, fin };
}
function _fechaCorta(iso) {
  const p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0].slice(2);
}
function _bimbaPintarRangoTexto() {
  const el = document.getElementById('equipo-rango-texto');
  if (!el) return;
  const { inicio, fin } = _equipoRangoPeriodo();
  const dias = Math.round((new Date(fin) - new Date(inicio)) / 86400000) + 1;
  el.textContent = 'Periodo: ' + _fechaCorta(inicio) + ' — ' + _fechaCorta(fin) + ' (' + dias + ' días)';
}
let _equipoPagoConfig = {};
let _equipoHorasManual = {};
let _equipoUltimoTotalPersonal = 0;
async function bimbaRenderEquipoFacturacion() {
  _equipoHorasManual = {};
  const customDiv = document.getElementById('equipo-fechas-custom');
  if (customDiv) customDiv.style.display = 'none';
  let empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  // No fiarse del caché local: si está vacío (o por si acaso está desactualizado),
  // ir a buscar los empleados directamente a Firebase.
  try {
    if (window.fb_loadEmpleados) {
      const arr = await window.fb_loadEmpleados();
      if (arr && arr.length) {
        empleados = arr;
        localStorage.setItem('dpf_empleados', JSON.stringify(arr));
      }
    }
  } catch (e) { /* si falla, seguimos con lo que hubiera en localStorage */ }
  try {
    const sn = await firebase.database().ref('config/empleadosPago').once('value');
    _equipoPagoConfig = sn.exists() ? sn.val() : {};
  } catch (e) { /* deja la config que ya hubiera en memoria */ }
  _bimbaPintarConfigEquipo(empleados);
  _bimbaPintarRangoTexto();
  _bimbaPintarCalcEquipo(empleados);
}
function _bimbaPintarConfigEquipo(empleados) {
  const el = document.getElementById('config-empleados');
  if (!el) return;
  if (!empleados.length) { el.innerHTML = '<div style="color:#8A6A4E;font-size:13px">No hay empleados registrados</div>'; return; }
  el.innerHTML = empleados.map(emp => {
    const cfg = _equipoPagoConfig[emp.id] || {};
    const esHora = cfg.tipoPago !== 'sueldo';
    const idAttr = escapeAttr(String(emp.id));
    return '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:12px;margin-bottom:10px">'
      + '<div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px">' + escapeHtml(emp.nombre) + '</div>'
      + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<div onclick="bimbaSetTipoPago(\'' + idAttr + '\',\'hora\')" style="flex:1;text-align:center;padding:7px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #F5E6C8;cursor:pointer;background:' + (esHora ? '#3D1F0D' : '#fff') + ';color:' + (esHora ? '#FFF8EE' : '#8A6A4E') + '">Por hora</div>'
        + '<div onclick="bimbaSetTipoPago(\'' + idAttr + '\',\'sueldo\')" style="flex:1;text-align:center;padding:7px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #F5E6C8;cursor:pointer;background:' + (!esHora ? '#3D1F0D' : '#fff') + ';color:' + (!esHora ? '#FFF8EE' : '#8A6A4E') + '">Sueldo fijo</div>'
      + '</div>'
      + (esHora
          ? '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Tarifa por hora</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="0.1" min="0" placeholder="0.00" value="' + (cfg.tarifaHora != null ? cfg.tarifaHora : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'tarifaHora\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">€/h</span></div></div>'
            + '<div style="display:flex;align-items:center;gap:8px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Horas de contrato / semana</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="0.5" min="0" placeholder="0" value="' + (cfg.horasSemana != null ? cfg.horasSemana : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'horasSemana\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">h/sem</span></div></div>'
          : '<div style="display:flex;align-items:center;gap:8px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Sueldo mensual</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="10" min="0" placeholder="0" value="' + (cfg.sueldoMensual != null ? cfg.sueldoMensual : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'sueldoMensual\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">€</span></div></div>'
        )
      + '</div>';
  }).join('');
}
function bimbaSetTipoPago(empId, tipo) {
  if (!_equipoPagoConfig[empId]) _equipoPagoConfig[empId] = {};
  _equipoPagoConfig[empId].tipoPago = tipo;
  _bimbaGuardarPagoConfig();
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarConfigEquipo(empleados);
  _bimbaPintarCalcEquipo(empleados);
}
function bimbaActualizarPago(empId, campo, valor) {
  if (!_equipoPagoConfig[empId]) _equipoPagoConfig[empId] = { tipoPago: 'hora' };
  const val = parseFloat(valor);
  _equipoPagoConfig[empId][campo] = isNaN(val) ? null : val;
  _bimbaGuardarPagoConfig();
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarCalcEquipo(empleados);
}
function _bimbaGuardarPagoConfig() {
  firebase.database().ref('config/empleadosPago').set(_equipoPagoConfig).catch(() => {});
}
function _bimbaCosteEmpleado(emp) {
  const cfg = _equipoPagoConfig[emp.id] || { tipoPago: 'hora' };
  const { inicio, fin } = _equipoRangoPeriodo();
  const dias = Math.round((new Date(fin) - new Date(inicio)) / 86400000) + 1;
  if (cfg.tipoPago === 'sueldo') {
    const factor = dias / 30;
    const sueldo = cfg.sueldoMensual || 0;
    return { total: sueldo * factor, horas: null };
  }
  const horasContratoSemana = cfg.horasSemana || 0;
  const horasAuto = horasContratoSemana * (dias / 7);
  const manual = _equipoHorasManual[emp.id];
  const horas = (manual != null) ? manual : horasAuto;
  const tarifa = cfg.tarifaHora || 0;
  return { total: horas * tarifa, horas: horas, tarifa: tarifa };
}
function _bimbaPintarCalcEquipo(empleados) {
  const el = document.getElementById('calc-empleados');
  if (!el) return;
  let total = 0;
  if (!empleados.length) {
    el.innerHTML = '';
  } else {
    el.innerHTML = empleados.map(emp => {
      const c = _bimbaCosteEmpleado(emp);
      total += c.total;
      const idAttr = escapeAttr(String(emp.id));
      const esSueldo = c.horas === null;
      const segundaLinea = esSueldo
        ? '<div style="font-size:11px;color:#8A6A4E;margin-top:2px">sueldo prorrateado a este periodo</div>'
        : '<div style="display:flex;align-items:center;gap:6px;margin-top:6px">'
          + '<label style="font-size:11px;color:#8A6A4E;white-space:nowrap">Horas en el periodo:</label>'
          + '<input type="number" step="0.5" min="0" value="' + c.horas.toFixed(1) + '" onchange="bimbaEquipoHorasManual(\'' + idAttr + '\',this.value)" style="width:56px;padding:4px 6px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif">'
          + '<span style="font-size:11px;color:#8A6A4E">h × ' + c.tarifa.toFixed(2) + ' €/h</span>'
          + '</div>';
      return '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 12px;margin-bottom:8px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:13px;font-weight:700;color:#3D1F0D">' + escapeHtml(emp.nombre) + '</div>'
        + '<div style="font-size:13px;font-weight:800;color:#3D1F0D">' + c.total.toFixed(2) + ' €</div>'
        + '</div>'
        + segundaLinea
        + '</div>';
    }).join('');
  }
  _equipoUltimoTotalPersonal = total;
  const costeTotalEl = document.getElementById('equipo-coste-total');
  if (costeTotalEl) costeTotalEl.textContent = total.toFixed(2) + ' €';
  _bimbaPintarResultadoEquipo(total);
}
function bimbaEquipoHorasManual(empId, valor) {
  const val = parseFloat(valor);
  _equipoHorasManual[empId] = (isNaN(val) || val < 0) ? null : val;
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarCalcEquipo(empleados);
}
function _bimbaPintarResultadoEquipo(totalPersonal) {
  const facturacionEl = document.getElementById('equipo-facturacion');
  const gastosEl = document.getElementById('equipo-gastos');
  const pctEl = document.getElementById('equipo-resultado-pct');
  const estadoEl = document.getElementById('equipo-resultado-estado');
  const subEl = document.getElementById('equipo-resultado-sub');
  const facturacionTotalEl = document.getElementById('equipo-facturacion-total');
  const gastosTotalEl = document.getElementById('equipo-gastos-total');
  const beneficioEl = document.getElementById('equipo-beneficio-neto');
  const beneficioSubEl = document.getElementById('equipo-beneficio-sub');
  if (!facturacionEl || !pctEl) return;
  const facturacion = parseFloat(facturacionEl.value) || 0;
  const gastos = parseFloat(gastosEl && gastosEl.value) || 0;
  if (facturacionTotalEl) facturacionTotalEl.textContent = facturacion > 0 ? facturacion.toFixed(2) + ' €' : '—';
  if (gastosTotalEl) gastosTotalEl.textContent = gastos > 0 ? gastos.toFixed(2) + ' €' : '—';

  if (beneficioEl) {
    const beneficio = facturacion - gastos - totalPersonal;
    beneficioEl.textContent = (beneficio >= 0 ? '+' : '') + beneficio.toFixed(2) + ' €';
    beneficioEl.style.color = beneficio >= 0 ? '#4ADE80' : '#e74c3c';
    if (beneficioSubEl) {
      beneficioSubEl.textContent = facturacion > 0
        ? facturacion.toFixed(2) + ' € − ' + gastos.toFixed(2) + ' € gastos − ' + totalPersonal.toFixed(2) + ' € personal'
        : 'Pon la facturación y los gastos del periodo';
    }
  }

  if (facturacion <= 0) {
    pctEl.textContent = '—';
    estadoEl.textContent = '';
    subEl.textContent = 'Pon la facturación del periodo';
    return;
  }
  const pct = (totalPersonal / facturacion) * 100;
  pctEl.textContent = pct.toFixed(1) + '%';
  let estado, color;
  if (pct > 30) { estado = 'Alto · revisa turnos'; color = '#e74c3c'; }
  else if (pct < 22) { estado = 'Bajo · ¿vas corto de gente?'; color = '#F4C430'; }
  else { estado = 'Sano'; color = '#4ADE80'; }
  estadoEl.textContent = estado;
  estadoEl.style.color = color;
  subEl.textContent = 'Coste de personal: ' + totalPersonal.toFixed(2) + ' € sobre ' + facturacion.toFixed(2) + ' € facturados. Rango sano en comida rápida: 22-30%.';
}
function bimbaEquipoPeriodoChange() {
  const modo = document.getElementById('equipo-periodo').value;
  const customDiv = document.getElementById('equipo-fechas-custom');
  if (customDiv) customDiv.style.display = (modo === 'personalizado') ? 'flex' : 'none';
  _equipoHorasManual = {};
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarRangoTexto();
  _bimbaPintarCalcEquipo(empleados);
}
function bimbaEquipoFacturacionChange() {
  _bimbaPintarResultadoEquipo(_equipoUltimoTotalPersonal);
}

// ── FINANZAS: ESTRELLAS Y PERDEDORES ──
function _estrellasRangoPeriodo() {
  const sel = document.getElementById('estrellas-periodo');
  const modo = sel ? sel.value : 'mes';
  const hoy = new Date();
  const fin = hoy.toISOString().slice(0, 10);
  let inicio;
  if (modo === 'semana') {
    const diaSemana = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana);
    inicio = lunes.toISOString().slice(0, 10);
  } else if (modo === 'trimestre') {
    const mesInicioTrim = Math.floor(hoy.getMonth() / 3) * 3;
    inicio = new Date(hoy.getFullYear(), mesInicioTrim, 1).toISOString().slice(0, 10);
  } else if (modo === 'anio') {
    inicio = hoy.getFullYear() + '-01-01';
  } else {
    inicio = fin.slice(0, 8) + '01';
  }
  return { inicio, fin };
}
async function _estrellasObtenerVentas(inicio, fin) {
  const totales = {};
  try {
    const snap = await firebase.database().ref('ventasProductos').orderByKey().startAt(inicio).endAt(fin).once('value');
    if (snap.exists()) {
      snap.forEach(diaSnap => {
        const dia = diaSnap.val() || {};
        Object.keys(dia).forEach(pid => {
          totales[pid] = (totales[pid] || 0) + dia[pid];
        });
      });
    }
  } catch (e) {
    console.warn('[estrellas] error leyendo ventas', e);
  }
  return totales;
}
async function bimbaRenderEstrellas() {
  const el = document.getElementById('estrellas-contenido');
  const rangoEl = document.getElementById('estrellas-rango-texto');
  if (!el) return;
  el.innerHTML = '<div style="color:#8A6A4E;font-size:13px">Cargando...</div>';
  const { inicio, fin } = _estrellasRangoPeriodo();
  if (rangoEl) rangoEl.textContent = 'Periodo: ' + _fechaCorta(inicio) + ' — ' + _fechaCorta(fin);

  const ventas = await _estrellasObtenerVentas(inicio, fin);
  const totalVentas = Object.values(ventas).reduce((s, v) => s + v, 0);

  const items = MENU.filter(i => !i.hidden);
  const conCoste = items.filter(i => !(i.coste === undefined || i.coste === null || i.coste === ''));
  const sinCosteCount = items.length - conCoste.length;

  if (totalVentas < 20) {
    el.innerHTML = '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:16px;text-align:center;color:#8A6A4E;font-size:13px;line-height:1.5">Todavía no hay suficientes pedidos registrados en este periodo para sacar conclusiones fiables.<br><br>El recuento de ventas por producto empezó a guardarse a partir de ahora — vuelve en unas semanas, cuando se hayan acumulado más pedidos.</div>';
    return;
  }

  let avisoHtml = '';
  if (sinCosteCount > 0) {
    avisoHtml = '<div style="font-size:12px;color:#c0392b;margin-bottom:12px">⚠️ ' + sinCosteCount + ' producto(s) sin coste asignado — no se pueden clasificar. Ponles coste en "Márgenes por producto".</div>';
  }

  const candidatos = conCoste.map(i => {
    const v = ventas[String(i.id)] || 0;
    const margenPct = i.price > 0 ? ((i.price - i.coste) / i.price) * 100 : 0;
    return { item: i, ventas: v, margenPct };
  }).filter(c => c.ventas > 0);

  if (!candidatos.length) {
    el.innerHTML = avisoHtml + '<div style="color:#8A6A4E;font-size:13px">Ninguno de los productos con coste asignado tiene ventas registradas en este periodo todavía.</div>';
    return;
  }

  const ventasOrdenadas = candidatos.map(c => c.ventas).slice().sort((a, b) => a - b);
  const mediana = ventasOrdenadas[Math.floor(ventasOrdenadas.length / 2)];

  const grupos = { estrella: [], caballo: [], joya: [], perdedor: [] };
  candidatos.forEach(c => {
    const altoMargen = c.margenPct >= 50;
    const altaVenta = c.ventas >= mediana;
    if (altoMargen && altaVenta) grupos.estrella.push(c);
    else if (!altoMargen && altaVenta) grupos.caballo.push(c);
    else if (altoMargen && !altaVenta) grupos.joya.push(c);
    else grupos.perdedor.push(c);
  });

  function tarjeta(c) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 12px;margin-bottom:6px">'
      + '<div><div style="font-size:13px;font-weight:700;color:#3D1F0D">' + formatNombreConBadgeNuevo(c.item.name) + '</div><div style="font-size:11px;color:#8A6A4E;margin-top:2px">' + c.ventas + ' vendidas</div></div>'
      + '<div style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:99px;white-space:nowrap;margin-left:8px;' + c.colorEstilo + '">' + c.margenPct.toFixed(0) + '% margen</div>'
      + '</div>';
  }
  function seccion(titulo, icono, desc, lista, colorTitulo, colorBadgeBg, colorBadgeTxt) {
    if (!lista.length) return '';
    lista.forEach(c => { c.colorEstilo = 'background:' + colorBadgeBg + ';color:' + colorBadgeTxt; });
    return '<div style="margin-bottom:16px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-size:17px">' + icono + '</span><span style="font-family:\'Oswald\',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:' + colorTitulo + '">' + titulo + '</span></div>'
      + '<div style="font-size:11px;color:#8A6A4E;margin-bottom:8px;margin-left:25px">' + desc + '</div>'
      + lista.sort((a, b) => b.ventas - a.ventas).map(tarjeta).join('')
    + '</div>';
  }

  el.innerHTML = avisoHtml
    + seccion('Estrellas — mantener y destacar', '⭐', 'Margen alto y se venden mucho. Lo mejor de tu carta.', grupos.estrella, '#166534', 'rgba(22,101,52,0.12)', '#166534')
    + seccion('Caballos de batalla', '🐴', 'Se piden mucho pero dejan poco. Sube precio o bájales el coste.', grupos.caballo, '#B5862C', 'rgba(181,134,44,0.12)', '#B5862C')
    + seccion('Joyas ocultas', '💎', 'Margen estupendo pero casi nadie las pide. Promociónalas más.', grupos.joya, '#0C5C8A', 'rgba(12,92,138,0.12)', '#0C5C8A')
    + seccion('Perdedores', '🗑️', 'Margen bajo y casi no se venden. Candidatas a quitar de la carta.', grupos.perdedor, '#c0392b', 'rgba(192,57,43,0.10)', '#c0392b');
}
function bimbaToggleVentaManualForm() {
  const form = document.getElementById('venta-manual-form');
  const chev = document.getElementById('venta-manual-chevron');
  if (!form) return;
  const open = form.style.display !== 'none';
  form.style.display = open ? 'none' : 'block';
  if (chev) chev.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
  if (!open) {
    bimbaRenderVentaManualCarta();
    const fechaEl = document.getElementById('venta-manual-fecha');
    if (fechaEl && !fechaEl.value) fechaEl.value = new Date().toISOString().slice(0, 10);
  }
}
function bimbaRenderVentaManualCarta() {
  const el = document.getElementById('venta-manual-lista');
  if (!el) return;
  const emojiCat = { "Patatas": "🥔", "Boniato": "🍠", "Paninis": "🍕", "Cookies": "🍪", "Tartas": "🍰", "Bebidas": "🥤" };
  const items = MENU.filter(i => !i.hidden && i.name.trim() !== 'Boniato Fries');
  const catOrder = [];
  MENU.forEach(i => { if (!catOrder.includes(i.cat)) catOrder.push(i.cat); });
  const porCat = {};
  items.forEach(i => { (porCat[i.cat] = porCat[i.cat] || []).push(i); });

  let html = '';
  catOrder.forEach(cat => {
    const lista = porCat[cat];
    if (!lista || !lista.length) return;
    const emoji = emojiCat[cat] || '';
    html += '<div style="font-family:\'Oswald\',sans-serif;font-size:12px;font-weight:700;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;padding:7px 12px;border-radius:8px;margin:14px 0 6px">' + (emoji ? emoji + ' ' : '') + escapeHtml(cat) + '</div>';
    html += lista.map(p => {
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F5E6C8">'
        + '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;color:#3D1F0D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + formatNombreConBadgeNuevo(p.name) + '</div><div style="font-size:11px;color:#8A6A4E">venta ' + p.price.toFixed(2) + ' €</div></div>'
        + '<input type="number" min="0" step="1" placeholder="0" data-id="' + p.id + '" oninput="bimbaVentaManualInputChange(this)" style="width:50px;padding:6px 4px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:14px;font-weight:700;text-align:center;font-family:\'DM Sans\',sans-serif;color:#3D1F0D;flex-shrink:0">'
      + '</div>';
    }).join('');
  });
  el.innerHTML = html || '<div style="color:#8A6A4E;font-size:13px">No hay productos visibles</div>';
}
function bimbaVentaManualInputChange(input) {
  const val = parseInt(input.value, 10);
  const conValor = val > 0;
  input.style.background = conValor ? 'rgba(22,101,52,0.08)' : '';
  input.style.borderColor = conValor ? '#166534' : '#F5E6C8';
  input.style.color = conValor ? '#166534' : '#3D1F0D';
  const inputs = document.querySelectorAll('#venta-manual-lista input');
  let count = 0;
  inputs.forEach(i => { if (parseInt(i.value, 10) > 0) count++; });
  const btn = document.getElementById('venta-manual-guardar-btn');
  if (btn) {
    btn.textContent = 'Guardar (' + count + ' producto' + (count === 1 ? '' : 's') + ')';
    btn.disabled = count === 0;
    btn.style.opacity = count === 0 ? '0.4' : '1';
  }
}
function bimbaLimpiarVentaManual() {
  document.querySelectorAll('#venta-manual-lista input').forEach(i => {
    i.value = '';
    i.style.background = '';
    i.style.borderColor = '#F5E6C8';
    i.style.color = '#3D1F0D';
  });
  const btn = document.getElementById('venta-manual-guardar-btn');
  if (btn) { btn.textContent = 'Guardar (0 productos)'; btn.disabled = true; btn.style.opacity = '0.4'; }
  const msgEl = document.getElementById('venta-manual-msg');
  if (msgEl) msgEl.textContent = '';
}
async function bimbaGuardarVentasManualesCarta() {
  const fechaEl = document.getElementById('venta-manual-fecha');
  const msgEl = document.getElementById('venta-manual-msg');
  const fecha = (fechaEl && fechaEl.value) || new Date().toISOString().slice(0, 10);
  const inputs = Array.from(document.querySelectorAll('#venta-manual-lista input')).filter(i => parseInt(i.value, 10) > 0);
  if (!inputs.length) return;
  msgEl.textContent = 'Guardando...';
  msgEl.style.color = '#8A6A4E';
  try {
    const ref = firebase.database().ref('ventasProductos/' + fecha);
    const sn = await ref.once('value');
    const actual = sn.exists() ? sn.val() : {};
    inputs.forEach(i => {
      const id = i.dataset.id;
      const cantidad = parseInt(i.value, 10);
      actual[id] = (actual[id] || 0) + cantidad;
    });
    await ref.set(actual);
    msgEl.textContent = '✅ Guardado: ' + inputs.length + ' producto(s) el ' + _fechaCorta(fecha);
    msgEl.style.color = '#27855a';
    bimbaLimpiarVentaManual();
    bimbaRenderEstrellas();
  } catch (e) {
    msgEl.textContent = 'Error al guardar';
    msgEl.style.color = '#c0392b';
  }
}
function openEstrellasOverlay() {
  document.getElementById('estrellas-overlay').classList.add('open');
  bimbaRenderEstrellas();
}
function closeEstrellasOverlay() {
  document.getElementById('estrellas-overlay').classList.remove('open');
}
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

