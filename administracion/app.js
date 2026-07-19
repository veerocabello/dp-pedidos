// ════════════════════════════════════════════════════
// ADMINISTRACIÓN — DULCE PATATA FOOD (solo socios)
// ════════════════════════════════════════════════════

// ── FIREBASE ──
const firebaseConfig = {
  apiKey: "AIzaSyApnK2y64MiUVRMquh-jF2KjzTa6Bfjcvw",
  authDomain: "dulce-patata-e96c2.firebaseapp.com",
  databaseURL: "https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dulce-patata-e96c2",
  storageBucket: "dulce-patata-e96c2.firebasestorage.app",
  messagingSenderId: "750258999945",
  appId: "1:750258999945:web:e05ec45f9c65088495ec58"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ── LOGIN / LOGOUT ──
function hacerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-pwd').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  if (!email) { errEl.textContent = 'Introduce tu email.'; return; }
  if (!pwd) { errEl.textContent = 'Introduce la contraseña.'; return; }
  btn.disabled = true;
  btn.textContent = 'Entrando...';
  auth.signInWithEmailAndPassword(email, pwd).catch(function (e) {
    let msg = 'Error al iniciar sesión';
    if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      msg = 'Email o contraseña incorrectos';
    } else if (e.code === 'auth/too-many-requests') {
      msg = 'Demasiados intentos. Espera unos minutos.';
    } else if (e.code === 'auth/invalid-email') {
      msg = 'Email no válido';
    }
    errEl.textContent = msg;
    btn.disabled = false;
    btn.textContent = 'Entrar';
  });
}
function hacerLogout() {
  firebase.auth().signOut();
}

document.addEventListener('DOMContentLoaded', function () {
  ['login-email', 'login-pwd'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') hacerLogin(); });
  });
});

auth.onAuthStateChanged(function (user) {
  const loginScreen = document.getElementById('login-screen');
  const appScreen = document.getElementById('app-screen');
  const btn = document.getElementById('login-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  if (user) {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
    cargarDatosIniciales();
  } else {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
});

// ── DATOS: MENU ──
let MENU = [];

async function cargarDatosIniciales() {
  const loadingEl = document.getElementById('loading-msg');
  const contentEl = document.getElementById('app-content');
  loadingEl.style.display = 'block';
  contentEl.style.display = 'none';
  try {
    const sn = await firebase.database().ref('config/menu').once('value');
    if (sn.exists()) {
      const data = JSON.parse(sn.val());
      if (data && Array.isArray(data.items)) MENU = data.items;
    }
  } catch (e) {
    console.error('Error cargando el menú:', e);
  }
  await _gastosCargarCategorias();
  await _cargarIngredientesYRecetas();
  await _cargarNombresDeStock();
  loadingEl.style.display = 'none';
  contentEl.style.display = 'block';
}

function saveMenu() {
  if (window.fb_saveMenu) window.fb_saveMenu({ items: MENU, ts: Date.now() }).catch(function () {});
}
window.fb_saveMenu = async function (d) {
  await firebase.database().ref('config/menu').set(JSON.stringify(d));
};
window.fb_loadEmpleados = async function () {
  const sn = await firebase.database().ref('config/empleados').once('value');
  if (!sn.exists()) return null;
  try { return JSON.parse(sn.val()); } catch (e) { return null; }
};

// ── HELPERS ──
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(str) {
  return escapeHtml(String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}
function formatNombreConBadgeNuevo(nombre) {
  if (!nombre) return '';
  if (nombre.indexOf('🆕') === -1) return escapeHtml(nombre);
  const limpio = nombre.replace('🆕', '').trim();
  return escapeHtml(limpio) + ' <span style="display:inline-block;font-family:\'Oswald\',sans-serif;font-weight:700;font-size:9px;color:#fff;background:#C0392B;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle">Nuevo</span>';
}

// ════════════════════════════════════════════════════
// FINANZAS — extraído del panel de pedidos
// ════════════════════════════════════════════════════

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
    return '<tr>'
      + '<td class="nombre">' + formatNombreConBadgeNuevo(item.name) + '</td>'
      + '<td class="num">' + item.price.toFixed(2) + ' €</td>'
      + '<td class="num"><div style="display:flex;align-items:center;justify-content:flex-end;gap:3px"><input type="number" step="0.01" min="0" placeholder="0.00" value="' + (conMargen ? item.coste : '') + '" data-id="' + item.id + '" onchange="bimbaActualizarCoste(this)" class="coste-input"><button onclick="openRecetaOverlay(' + item.id + ')" title="Calcular coste por receta" style="background:#FBEFD6;border:1px solid #F4C430;border-radius:6px;width:22px;height:22px;font-size:11px;cursor:pointer;flex-shrink:0;line-height:1">🧮</button></div></td>'
      + '<td class="num" style="color:' + colorMargen + (bajo ? ';background:rgba(192,57,43,0.06)' : '') + '">'
        + (conMargen
            ? (item._margenEur >= 0 ? '+' : '') + item._margenEur.toFixed(2) + ' €<span class="pct">' + item._margenPct.toFixed(0) + '%</span>'
            : '<span style="font-size:10px">añade →</span>')
      + '</td>'
    + '</tr>';
  }
  function catHeaderHtml(cat) {
    const emoji = emojiCat[cat] || '';
    return '<tr class="cat-row"><td colspan="4">' + (emoji ? emoji + ' ' : '') + escapeHtml(cat) + '</td></tr>';
  }

  let html = '<table class="margenes-tabla"><tr><th>Producto</th><th class="num">Venta</th><th class="num">Coste</th><th class="num">Margen</th></tr>';
  catOrder.forEach(cat => {
    const lista = porCat[cat];
    if (!lista || !lista.length) return;
    lista.sort(comparar);
    html += catHeaderHtml(cat);
    html += lista.map(filaHtml).join('');
  });
  html += '</table>';
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
  // Rellenar facturación y gastos solo con lo que haya en Resumen del negocio / Registro de gastos para el mismo periodo
  try {
    const { inicio, fin } = _equipoRangoPeriodo();
    const totalGastos = await _gastosObtenerTotal(inicio, fin);
    const gastosEl = document.getElementById('equipo-gastos');
    if (gastosEl) gastosEl.value = totalGastos > 0 ? totalGastos.toFixed(2) : '';
    const totalFacturacion = await _facturacionObtenerTotal(inicio, fin);
    const facturacionEl = document.getElementById('equipo-facturacion');
    if (facturacionEl) facturacionEl.value = totalFacturacion > 0 ? totalFacturacion.toFixed(2) : '';
  } catch (e) { /* si falla, se deja como estaba */ }
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
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Horas de contrato / semana</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="0.5" min="0" placeholder="0" value="' + (cfg.horasSemana != null ? cfg.horasSemana : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'horasSemana\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">h/sem</span></div></div>'
          : '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Sueldo mensual</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="10" min="0" placeholder="0" value="' + (cfg.sueldoMensual != null ? cfg.sueldoMensual : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'sueldoMensual\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">€</span></div></div>'
        )
      + '<div style="display:flex;align-items:center;gap:8px;padding-top:6px;border-top:1px dashed #F5E6C8"><label style="font-size:11.5px;color:#854F0B;font-weight:700;flex:1">🛡️ Seguridad Social mensual</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="1" min="0" placeholder="0" value="' + (cfg.ssMensual != null ? cfg.ssMensual : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'ssMensual\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F4C430;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#854F0B">€/mes</span></div></div>'
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
  const ss = (cfg.ssMensual || 0) * (dias / 30);
  if (cfg.tipoPago === 'sueldo') {
    const factor = dias / 30;
    const sueldo = cfg.sueldoMensual || 0;
    const total = sueldo * factor;
    return { total: total, ss: ss, totalConSS: total + ss, horas: null };
  }
  const horasContratoSemana = cfg.horasSemana || 0;
  const horasAuto = horasContratoSemana * (dias / 7);
  const manual = _equipoHorasManual[emp.id];
  const horas = (manual != null) ? manual : horasAuto;
  const tarifa = cfg.tarifaHora || 0;
  const total = horas * tarifa;
  return { total: total, ss: ss, totalConSS: total + ss, horas: horas, tarifa: tarifa };
}
function _bimbaPintarCalcEquipo(empleados) {
  const el = document.getElementById('calc-empleados');
  if (!el) return;
  let total = 0;
  const costes = empleados.map(function (emp) {
    const c = _bimbaCosteEmpleado(emp);
    total += c.totalConSS;
    return { emp: emp, c: c };
  });
  if (!empleados.length) {
    el.innerHTML = '';
  } else {
    el.innerHTML = costes.map(function (item) {
      const emp = item.emp, c = item.c;
      const idAttr = escapeAttr(String(emp.id));
      const esSueldo = c.horas === null;
      const pctDelTotal = total > 0 ? (c.totalConSS / total) * 100 : 0;
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
        + '<div style="text-align:right">'
          + '<div style="font-size:13px;font-weight:800;color:#3D1F0D">' + c.totalConSS.toFixed(2) + ' €</div>'
          + '<div style="font-size:10px;color:#8A6A4E">' + pctDelTotal.toFixed(0) + '% del total</div>'
        + '</div>'
        + '</div>'
        + segundaLinea
        + '<div style="font-size:10.5px;color:#854F0B;margin-top:6px">bruto ' + c.total.toFixed(2) + ' € + SS ' + c.ss.toFixed(2) + ' €</div>'
        + '</div>';
    }).join('');
  }
  _equipoUltimoTotalPersonal = total;
  const costeTotalEl = document.getElementById('equipo-coste-total');
  if (costeTotalEl) costeTotalEl.textContent = total.toFixed(2) + ' €';
  _bimbaPintarResultadoEquipo(total);
  bimbaRenderSimulador();
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
async function bimbaEquipoPeriodoChange() {
  const modo = document.getElementById('equipo-periodo').value;
  const customDiv = document.getElementById('equipo-fechas-custom');
  if (customDiv) customDiv.style.display = (modo === 'personalizado') ? 'flex' : 'none';
  _equipoHorasManual = {};
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarRangoTexto();
  try {
    const { inicio, fin } = _equipoRangoPeriodo();
    const totalGastos = await _gastosObtenerTotal(inicio, fin);
    const gastosEl = document.getElementById('equipo-gastos');
    if (gastosEl) gastosEl.value = totalGastos > 0 ? totalGastos.toFixed(2) : '';
    const totalFacturacion = await _facturacionObtenerTotal(inicio, fin);
    const facturacionEl = document.getElementById('equipo-facturacion');
    if (facturacionEl) facturacionEl.value = totalFacturacion > 0 ? totalFacturacion.toFixed(2) : '';
  } catch (e) { /* si falla, se deja como estaba */ }
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

// ════════════════════════════════════════════════════
// REGISTRO DE GASTOS
// ════════════════════════════════════════════════════
const GASTOS_CATEGORIAS_DEFAULT = ['Proveedores', 'Alquiler', 'Suministros', 'Nóminas', 'Marketing', 'Otros'];
const INGRESOS_CATEGORIAS_DEFAULT = ['Tienda', 'Web', 'Uber Eats', 'Just Eat', 'Glovo', 'Otros ingresos'];
let _gastosCategorias = GASTOS_CATEGORIAS_DEFAULT.slice();
let _ingresosCategorias = INGRESOS_CATEGORIAS_DEFAULT.slice();
let _tipoMovimientoActual = 'ingreso';

async function _gastosCargarCategorias() {
  try {
    const sn = await firebase.database().ref('config/gastosCategorias').once('value');
    if (sn.exists() && Array.isArray(sn.val()) && sn.val().length) _gastosCategorias = sn.val();
  } catch (e) { /* nos quedamos con las categorías por defecto */ }
  try {
    const sn2 = await firebase.database().ref('config/ingresosCategorias').once('value');
    if (sn2.exists() && Array.isArray(sn2.val()) && sn2.val().length) _ingresosCategorias = sn2.val();
  } catch (e) { /* nos quedamos con las categorías por defecto */ }
}

function bimbaSetTipoMovimiento(tipo) {
  _tipoMovimientoActual = tipo;
  const btnIngreso = document.getElementById('tipo-btn-ingreso');
  const btnGasto = document.getElementById('tipo-btn-gasto');
  if (tipo === 'ingreso') {
    btnIngreso.style.background = '#3B6D11'; btnIngreso.style.color = '#fff'; btnIngreso.style.borderColor = '#639922';
    btnGasto.style.background = '#fff'; btnGasto.style.color = '#8A6A4E'; btnGasto.style.borderColor = '#F5E6C8';
  } else {
    btnGasto.style.background = '#A32D2D'; btnGasto.style.color = '#fff'; btnGasto.style.borderColor = '#E24B4A';
    btnIngreso.style.background = '#fff'; btnIngreso.style.color = '#8A6A4E'; btnIngreso.style.borderColor = '#F5E6C8';
  }
  bimbaPoblarCategoriasGasto();
}

function openGastosOverlay() {
  document.getElementById('gastos-overlay').classList.add('open');
  bimbaRenderGastos();
}
function closeGastosOverlay() {
  document.getElementById('gastos-overlay').classList.remove('open');
}

function _gastosRangoPeriodo() {
  const sel = document.getElementById('gastos-periodo');
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
  } else if (modo === 'personalizado') {
    const iniEl = document.getElementById('gastos-fecha-inicio');
    const finEl = document.getElementById('gastos-fecha-fin');
    const iniVal = (iniEl && iniEl.value) ? iniEl.value : fin;
    const finVal = (finEl && finEl.value) ? finEl.value : fin;
    return { inicio: iniVal, fin: finVal };
  } else {
    inicio = fin.slice(0, 8) + '01';
  }
  return { inicio: inicio, fin: fin };
}

function bimbaGastosPeriodoChange() {
  const sel = document.getElementById('gastos-periodo');
  const customDiv = document.getElementById('gastos-fechas-custom');
  customDiv.style.display = (sel.value === 'personalizado') ? 'flex' : 'none';
  bimbaRenderGastos();
}

async function _gastosObtenerLista(inicio, fin) {
  const sn = await firebase.database().ref('gastos').orderByKey().startAt(inicio).endAt(fin).once('value');
  const lista = [];
  if (sn.exists()) {
    sn.forEach(function (fechaSnap) {
      const fecha = fechaSnap.key;
      fechaSnap.forEach(function (gastoSnap) {
        const g = gastoSnap.val() || {};
        lista.push({ fecha: fecha, id: gastoSnap.key, tipo: g.tipo || 'gasto', categoria: g.categoria || 'Otros', importe: g.importe || 0, nota: g.nota || '' });
      });
    });
  }
  lista.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  return lista;
}

async function _gastosObtenerTotal(inicio, fin) {
  const lista = await _gastosObtenerLista(inicio, fin);
  return lista.filter(function (g) { return g.tipo === 'gasto'; }).reduce(function (s, g) { return s + g.importe; }, 0);
}

async function _ingresosObtenerTotal(inicio, fin) {
  const lista = await _gastosObtenerLista(inicio, fin);
  return lista.filter(function (g) { return g.tipo === 'ingreso'; }).reduce(function (s, g) { return s + g.importe; }, 0);
}
// Alias para mantener compatibilidad con Resumen del negocio / Equipo vs facturación
async function _facturacionObtenerTotal(inicio, fin) {
  return _ingresosObtenerTotal(inicio, fin);
}

function _ingresosPorCategoria(lista) {
  const porCat = {};
  lista.filter(function (g) { return g.tipo === 'ingreso'; }).forEach(function (g) {
    porCat[g.categoria] = (porCat[g.categoria] || 0) + g.importe;
  });
  return porCat;
}

async function bimbaRenderGastos() {
  const r = _gastosRangoPeriodo();
  document.getElementById('gastos-rango-texto').textContent = 'Del ' + _fechaCorta(r.inicio) + ' al ' + _fechaCorta(r.fin);

  const listaEl = document.getElementById('gastos-lista');
  listaEl.innerHTML = '<div style="color:#8A6A4E;font-size:12px;padding:14px;text-align:center">Cargando...</div>';

  const lista = await _gastosObtenerLista(r.inicio, r.fin);
  const totalIngresos = lista.filter(function (g) { return g.tipo === 'ingreso'; }).reduce(function (s, g) { return s + g.importe; }, 0);
  const totalGastos = lista.filter(function (g) { return g.tipo === 'gasto'; }).reduce(function (s, g) { return s + g.importe; }, 0);
  document.getElementById('ingresos-total').textContent = totalIngresos.toFixed(2) + ' €';
  document.getElementById('gastos-total').textContent = totalGastos.toFixed(2) + ' €';
  document.getElementById('movimientos-neto').textContent = (totalIngresos - totalGastos).toFixed(2) + ' €';

  const porCanal = _ingresosPorCategoria(lista);
  const canalEl = document.getElementById('ingresos-por-canal');
  const canales = Object.keys(porCanal);
  if (canales.length === 0) {
    canalEl.innerHTML = '';
  } else {
    canales.sort(function (a, b) { return porCanal[b] - porCanal[a]; });
    canalEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:#8A6A4E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Ingresos por canal</div>'
      + canales.map(function (c) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 12px;margin-bottom:5px">'
          + '<span style="font-size:12.5px;font-weight:600;color:#3D1F0D">' + escapeHtml(c) + '</span>'
          + '<span style="font-size:13px;font-weight:800;color:#3B6D11">' + porCanal[c].toFixed(2) + ' €</span>'
          + '</div>';
      }).join('');
  }

  if (lista.length === 0) {
    listaEl.innerHTML = '<div style="color:#8A6A4E;font-size:12px;padding:14px;text-align:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px">Sin movimientos registrados en este periodo</div>';
    return;
  }
  listaEl.innerHTML = lista.map(function (g) {
    const esIngreso = g.tipo === 'ingreso';
    const colorImporte = esIngreso ? '#3B6D11' : '#A32D2D';
    const colorTag = esIngreso ? '#639922' : '#E24B4A';
    const signo = esIngreso ? '+' : '−';
    return '<div style="display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 12px;margin-bottom:6px">'
      + '<div style="width:6px;height:30px;border-radius:4px;background:' + colorTag + ';flex-shrink:0"></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:700;color:#3D1F0D">' + escapeHtml(g.categoria) + '</div>'
      + '<div style="font-size:11px;color:#8A6A4E">' + _fechaCorta(g.fecha) + (g.nota ? ' · ' + escapeHtml(g.nota) : '') + '</div>'
      + '</div>'
      + '<div style="font-size:14px;font-weight:800;color:' + colorImporte + ';white-space:nowrap">' + signo + g.importe.toFixed(2) + ' €</div>'
      + '<button onclick="bimbaEliminarGasto(\'' + g.fecha + '\',\'' + g.id + '\')" style="background:none;border:none;color:#c0392b;font-size:17px;cursor:pointer;padding:2px 6px">✕</button>'
      + '</div>';
  }).join('');
}

function bimbaToggleGastoForm() {
  const form = document.getElementById('gasto-form');
  const chevron = document.getElementById('gasto-form-chevron');
  const estaAbierto = form.style.display !== 'none';
  form.style.display = estaAbierto ? 'none' : 'block';
  chevron.style.transform = estaAbierto ? 'rotate(0deg)' : 'rotate(180deg)';
  if (!estaAbierto) {
    document.getElementById('gasto-fecha').value = new Date().toISOString().slice(0, 10);
    document.getElementById('gasto-msg').textContent = '';
    bimbaSetTipoMovimiento('ingreso');
  }
}

function bimbaPoblarCategoriasGasto() {
  const sel = document.getElementById('gasto-categoria');
  const lista = (_tipoMovimientoActual === 'ingreso') ? _ingresosCategorias : _gastosCategorias;
  sel.innerHTML = lista.map(function (c) {
    return '<option value="' + escapeAttr(c) + '">' + escapeHtml(c) + '</option>';
  }).join('') + '<option value="__nueva__">➕ Nueva categoría...</option>';
}

function bimbaCategoriaGastoChange() {
  const sel = document.getElementById('gasto-categoria');
  if (sel.value !== '__nueva__') return;
  const nombre = prompt('Nombre de la nueva categoría:');
  const esIngreso = _tipoMovimientoActual === 'ingreso';
  const lista = esIngreso ? _ingresosCategorias : _gastosCategorias;
  const path = esIngreso ? 'config/ingresosCategorias' : 'config/gastosCategorias';
  if (nombre && nombre.trim()) {
    const limpio = nombre.trim();
    if (!lista.includes(limpio)) {
      lista.push(limpio);
      firebase.database().ref(path).set(lista).catch(function () {});
    }
    bimbaPoblarCategoriasGasto();
    sel.value = limpio;
  } else {
    sel.value = lista[0] || '';
  }
}

async function bimbaGuardarGasto() {
  const msgEl = document.getElementById('gasto-msg');
  const fecha = document.getElementById('gasto-fecha').value;
  const categoria = document.getElementById('gasto-categoria').value;
  const importe = parseFloat(document.getElementById('gasto-importe').value);
  const nota = document.getElementById('gasto-nota').value.trim();
  const tipo = _tipoMovimientoActual;

  if (!fecha) { msgEl.textContent = 'Pon una fecha'; msgEl.style.color = '#c0392b'; return; }
  if (!categoria || categoria === '__nueva__') { msgEl.textContent = 'Elige una categoría'; msgEl.style.color = '#c0392b'; return; }
  if (!importe || importe <= 0) { msgEl.textContent = 'Pon un importe válido'; msgEl.style.color = '#c0392b'; return; }

  try {
    await firebase.database().ref('gastos/' + fecha).push({ tipo: tipo, categoria: categoria, importe: importe, nota: nota, ts: Date.now() });
    msgEl.style.color = '#27855a';
    msgEl.textContent = '✅ Guardado';
    document.getElementById('gasto-importe').value = '';
    document.getElementById('gasto-nota').value = '';
    bimbaRenderGastos();
  } catch (e) {
    msgEl.style.color = '#c0392b';
    msgEl.textContent = 'Error al guardar';
  }
}

async function bimbaEliminarGasto(fecha, id) {
  if (!confirm('¿Borrar este gasto?')) return;
  try {
    await firebase.database().ref('gastos/' + fecha + '/' + id).remove();
    bimbaRenderGastos();
  } catch (e) {
    alert('No se pudo borrar');
  }
}

// ════════════════════════════════════════════════════
// RESUMEN DEL NEGOCIO
// ════════════════════════════════════════════════════
function openResumenOverlay() {
  document.getElementById('resumen-overlay').classList.add('open');
  bimbaRenderResumen();
}
function closeResumenOverlay() {
  document.getElementById('resumen-overlay').classList.remove('open');
}

function _resumenRangoPeriodo() {
  const sel = document.getElementById('resumen-periodo');
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
  } else if (modo === 'personalizado') {
    const iniEl = document.getElementById('resumen-fecha-inicio');
    const finEl = document.getElementById('resumen-fecha-fin');
    const iniVal = (iniEl && iniEl.value) ? iniEl.value : fin;
    const finVal = (finEl && finEl.value) ? finEl.value : fin;
    return { inicio: iniVal, fin: finVal };
  } else {
    inicio = fin.slice(0, 8) + '01';
  }
  return { inicio: inicio, fin: fin };
}

function bimbaResumenPeriodoChange() {
  const sel = document.getElementById('resumen-periodo');
  const customDiv = document.getElementById('resumen-fechas-custom');
  customDiv.style.display = (sel.value === 'personalizado') ? 'flex' : 'none';
  bimbaRenderResumen();
}

// Coste de personal genérico para un nº de días cualquiera (no depende de la pantalla de Equipo)
function _costePersonalParaDias(dias) {
  let empleados = [];
  try { empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]'); } catch (e) {}
  let total = 0;
  empleados.forEach(function (emp) {
    const cfg = _equipoPagoConfig[emp.id] || { tipoPago: 'hora' };
    let bruto;
    if (cfg.tipoPago === 'sueldo') {
      bruto = (cfg.sueldoMensual || 0) * (dias / 30);
    } else {
      bruto = (cfg.horasSemana || 0) * (dias / 7) * (cfg.tarifaHora || 0);
    }
    const ss = (cfg.ssMensual || 0) * (dias / 30);
    total += bruto + ss;
  });
  return total;
}

async function _resumenCargarConfigEquipo() {
  try {
    if (window.fb_loadEmpleados) {
      const arr = await window.fb_loadEmpleados();
      if (arr && arr.length) localStorage.setItem('dpf_empleados', JSON.stringify(arr));
    }
  } catch (e) {}
  try {
    const sn = await firebase.database().ref('config/empleadosPago').once('value');
    _equipoPagoConfig = sn.exists() ? sn.val() : {};
  } catch (e) {}
}

async function _resumenObtenerMargenPonderado(inicio, fin) {
  const ventas = await _estrellasObtenerVentas(inicio, fin);
  let margenEur = 0;
  let revenueConCoste = 0;
  Object.keys(ventas).forEach(function (pid) {
    const item = MENU.find(function (i) { return String(i.id) === String(pid); });
    if (!item || item.coste == null) return;
    const qty = ventas[pid] || 0;
    margenEur += qty * (item.price - item.coste);
    revenueConCoste += qty * item.price;
  });
  if (revenueConCoste <= 0) return null;
  return (margenEur / revenueConCoste) * 100;
}

async function bimbaRenderResumen() {
  const hoy = new Date().toISOString().slice(0, 10);
  await _resumenCargarConfigEquipo();

  // ── HOY ──
  const ventasHoy = await _ingresosObtenerTotal(hoy, hoy);
  document.getElementById('resumen-ventas-hoy-val').textContent = ventasHoy > 0 ? ventasHoy.toFixed(2) + ' €' : '—';

  const gastosHoyLista = await _gastosObtenerLista(hoy, hoy);
  const gastosHoy = gastosHoyLista.reduce(function (s, g) { return s + g.importe; }, 0);
  const personalHoy = _costePersonalParaDias(1);
  const beneficioHoy = ventasHoy - gastosHoy - personalHoy;
  document.getElementById('resumen-beneficio-hoy').textContent = beneficioHoy.toFixed(2) + ' €';
  document.getElementById('resumen-beneficio-hoy').style.color = beneficioHoy >= 0 ? '#3D1F0D' : '#c0392b';

  try {
    const statsSnap = await firebase.database().ref('stats/' + hoy).once('value');
    if (statsSnap.exists()) {
      const s = statsSnap.val();
      const count = s.count || 0;
      const total = s.total || 0;
      document.getElementById('resumen-num-pedidos').textContent = count;
      document.getElementById('resumen-ticket-medio').textContent = count > 0 ? (total / count).toFixed(2) + ' €' : '—';
      if (s.orders && s.orders.length) {
        const horas = {};
        s.orders.forEach(function (o) {
          if (!o.time) return;
          const h = o.time.split(':')[0];
          horas[h] = (horas[h] || 0) + 1;
        });
        let mejorHora = null, mejorCount = 0;
        Object.keys(horas).forEach(function (h) { if (horas[h] > mejorCount) { mejorCount = horas[h]; mejorHora = h; } });
        document.getElementById('resumen-hora-punta').textContent = mejorHora != null ? (mejorHora + ':00 – ' + (parseInt(mejorHora, 10) + 1) + ':00') : '—';
      } else {
        document.getElementById('resumen-hora-punta').textContent = '—';
      }
    } else {
      document.getElementById('resumen-num-pedidos').textContent = '0';
      document.getElementById('resumen-ticket-medio').textContent = '—';
      document.getElementById('resumen-hora-punta').textContent = '—';
    }
  } catch (e) {
    document.getElementById('resumen-num-pedidos').textContent = '—';
    document.getElementById('resumen-ticket-medio').textContent = '—';
    document.getElementById('resumen-hora-punta').textContent = '—';
  }

  try {
    const ventasHoyProd = await _estrellasObtenerVentas(hoy, hoy);
    let mejorId = null, mejorQty = 0;
    Object.keys(ventasHoyProd).forEach(function (pid) { if (ventasHoyProd[pid] > mejorQty) { mejorQty = ventasHoyProd[pid]; mejorId = pid; } });
    if (mejorId != null) {
      const item = MENU.find(function (i) { return String(i.id) === String(mejorId); });
      document.getElementById('resumen-producto-top').textContent = item ? item.name.replace('🆕', '').trim() : '—';
    } else {
      document.getElementById('resumen-producto-top').textContent = 'Sin datos aún';
    }
  } catch (e) {
    document.getElementById('resumen-producto-top').textContent = '—';
  }

  // ── PERIODO ──
  const r = _resumenRangoPeriodo();
  const dias = Math.round((new Date(r.fin) - new Date(r.inicio)) / 86400000) + 1;
  document.getElementById('resumen-rango-texto').textContent = 'Del ' + _fechaCorta(r.inicio) + ' al ' + _fechaCorta(r.fin);

  const facturacionPeriodo = await _facturacionObtenerTotal(r.inicio, r.fin);
  const gastosPeriodo = await _gastosObtenerTotal(r.inicio, r.fin);
  const personalPeriodo = _costePersonalParaDias(dias);
  const margenPonderado = await _resumenObtenerMargenPonderado(r.inicio, r.fin);
  const beneficioPeriodo = facturacionPeriodo - gastosPeriodo - personalPeriodo;
  const pctPersonal = facturacionPeriodo > 0 ? (personalPeriodo / facturacionPeriodo) * 100 : null;

  document.getElementById('resumen-facturacion-periodo').textContent = facturacionPeriodo > 0 ? facturacionPeriodo.toFixed(2) + ' €' : '—';
  document.getElementById('resumen-gastos-periodo').textContent = gastosPeriodo.toFixed(2) + ' €';
  document.getElementById('resumen-margen-medio').textContent = margenPonderado != null ? margenPonderado.toFixed(1) + ' %' : 'Sin datos';
  document.getElementById('resumen-coste-personal').textContent = personalPeriodo.toFixed(2) + ' €';
  document.getElementById('resumen-beneficio-periodo').textContent = beneficioPeriodo.toFixed(2) + ' €';
  document.getElementById('resumen-pct-personal').textContent = pctPersonal != null ? pctPersonal.toFixed(1) + ' %' : '—';
}

// ════════════════════════════════════════════════════
// COSTE POR RECETA (calculadora dentro de Márgenes)
// ════════════════════════════════════════════════════
let _ingredientesCoste = [];
let _recetasProducto = {};
let _recetaProductoActualId = null;
let _modoIngredienteActual = 'granel';
let _stockIngredientesNombres = [];

const STOCK_CATEGORIAS_NO_COMIDA = ['envases'];
const STOCK_NOMBRES_NO_COMIDA = ['Guantes talla L', 'Guantes talla M', 'Nanas limpieza', 'Fregonas', 'Cepillos', 'Recogedor', 'Trapos', 'Lejía', 'Desengrasante', 'Friegasuelos', 'Papel higiénico', 'Estropajos', 'Ambientador', 'Limpia cristales', 'Servilletas'];
const STOCK_GROUP_LABELS = {
  congelados: '❄️ Congelados',
  latas_salsas: '🥫 Latas / Conservas / Salsas',
  estanteria_almacen: '📦 Estantería (Almacén)',
  frio: '🧊 Frío',
  estanteria_tartas: '🎂 Estantería Tartas',
  patatas_verdura: '🥔 Patatas y Verdura',
  masas: '🍪 Masas',
  queseria: '🧀 Quesería',
  pan: '🍞 Pan',
  referencias_ali: '🧂 Especias y básicos',
  chocolates_galletas: '🍫 Chocolates y Galletas'
};
let _stockPorCategoria = {};

async function _cargarNombresDeStock() {
  try {
    const sn = await firebase.database().ref('config/stockData').once('value');
    if (sn.exists()) {
      const data = JSON.parse(sn.val());
      const nombres = [];
      const porCategoria = {};
      Object.entries(data).forEach(function (entry) {
        const grupo = entry[0], lista = entry[1];
        if (STOCK_CATEGORIAS_NO_COMIDA.includes(grupo)) return;
        const limpios = (lista || []).filter(function (n) { return !STOCK_NOMBRES_NO_COMIDA.includes(n); });
        if (!limpios.length) return;
        porCategoria[grupo] = limpios;
        limpios.forEach(function (n) { if (!nombres.includes(n)) nombres.push(n); });
      });
      nombres.sort(function (a, b) { return a.localeCompare(b); });
      _stockIngredientesNombres = nombres;
      _stockPorCategoria = porCategoria;
    }
  } catch (e) { /* si falla, se queda vacío y se puede escribir a mano */ }
}

async function _cargarIngredientesYRecetas() {
  try {
    const sn = await firebase.database().ref('config/ingredientesCoste').once('value');
    if (sn.exists() && Array.isArray(sn.val())) _ingredientesCoste = sn.val();
  } catch (e) {}
  try {
    const sn2 = await firebase.database().ref('config/recetasProducto').once('value');
    if (sn2.exists() && sn2.val()) _recetasProducto = sn2.val();
  } catch (e) {}
}

function _costeUnidadIngrediente(ing) {
  if (ing.modo === 'granel') return (ing.precioGranel || 0) / 1000;
  if (ing.modo === 'pack') return (ing.unidadesPack > 0) ? (ing.precioPack || 0) / ing.unidadesPack : 0;
  return ing.precioUnidad || 0;
}
function _unidadPequenaIngrediente(ing) {
  if (ing.modo === 'granel') return ing.unidadGranel === 'L' ? 'ml' : 'g';
  return 'ud';
}
function _resumenPrecioIngrediente(ing) {
  if (ing.modo === 'granel') return (ing.precioGranel || 0).toFixed(2) + ' €/' + ing.unidadGranel;
  if (ing.modo === 'pack') return (ing.precioPack || 0).toFixed(2) + ' € · ' + (ing.unidadesPack || 0) + ' ud';
  return (ing.precioUnidad || 0).toFixed(2) + ' €/ud';
}

function _calcularCosteReceta(productId) {
  const lineas = _recetasProducto[productId] || [];
  return lineas.reduce(function (total, linea) {
    const ing = _ingredientesCoste.find(function (i) { return i.id === linea.ingredienteId; });
    if (!ing) return total;
    return total + _costeUnidadIngrediente(ing) * (linea.cantidad || 0);
  }, 0);
}

function openRecetaOverlay(productId) {
  _recetaProductoActualId = productId;
  const item = MENU.find(function (i) { return String(i.id) === String(productId); });
  document.getElementById('receta-producto-nombre').textContent = item ? item.name.replace('🆕', '').trim() : '';
  document.getElementById('ingredientes-base-panel').style.display = 'none';
  document.getElementById('ingredientes-base-chevron').style.transform = 'rotate(0deg)';
  document.getElementById('nuevo-ingrediente-form').style.display = 'none';
  document.getElementById('receta-msg').textContent = '';
  bimbaRenderSugeridos(item);
  bimbaRenderIngredientesBase();
  bimbaPoblarSelectorIngredientesReceta();
  bimbaRenderRecetaLineas();
  document.getElementById('receta-overlay').classList.add('open');
}
function closeRecetaOverlay() {
  document.getElementById('receta-overlay').classList.remove('open');
}

function bimbaToggleIngredientesBase() {
  const panel = document.getElementById('ingredientes-base-panel');
  const chevron = document.getElementById('ingredientes-base-chevron');
  const abierto = panel.style.display !== 'none';
  panel.style.display = abierto ? 'none' : 'block';
  chevron.style.transform = abierto ? 'rotate(0deg)' : 'rotate(180deg)';
}

function bimbaRenderIngredientesBase() {
  const el = document.getElementById('ingredientes-base-lista');
  if (!_ingredientesCoste.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:11.5px;padding:6px 2px">Todavía no tienes ingredientes guardados.</div>';
    return;
  }
  el.innerHTML = _ingredientesCoste.map(function (ing) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:7px 10px;margin-bottom:5px">'
      + '<span style="font-size:12.5px;font-weight:700;color:#3D1F0D">' + escapeHtml(ing.nombre) + '</span>'
      + '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:11px;color:#8A6A4E">' + _resumenPrecioIngrediente(ing) + '</span>'
        + '<button onclick="bimbaEliminarIngrediente(\'' + ing.id + '\')" style="background:none;border:none;color:#c0392b;font-size:14px;cursor:pointer;padding:2px 4px">✕</button>'
      + '</div>'
    + '</div>';
  }).join('');
}

function bimbaMostrarNuevoIngrediente() {
  document.getElementById('nuevo-ingrediente-form').style.display = 'block';
  const yaUsados = _ingredientesCoste.map(function (i) { return i.nombre; });
  const sel = document.getElementById('ning-nombre-stock');
  let html = '';
  Object.keys(_stockPorCategoria).forEach(function (grupo) {
    const disponibles = _stockPorCategoria[grupo].filter(function (n) { return !yaUsados.includes(n); });
    if (!disponibles.length) return;
    html += '<optgroup label="' + escapeAttr(STOCK_GROUP_LABELS[grupo] || grupo) + '">'
      + disponibles.map(function (n) { return '<option value="' + escapeAttr(n) + '">' + escapeHtml(n) + '</option>'; }).join('')
      + '</optgroup>';
  });
  html += '<option value="__otro__">✏️ Otro (escribir nombre)</option>';
  sel.innerHTML = html;
  document.getElementById('ning-nombre').style.display = 'none';
  document.getElementById('ning-nombre').value = '';
  document.getElementById('ning-precio-granel').value = '';
  document.getElementById('ning-precio-pack').value = '';
  document.getElementById('ning-unidades-pack').value = '';
  document.getElementById('ning-precio-unidad').value = '';
  bimbaSetModoIngrediente('granel');
}
function bimbaNingNombreStockChange() {
  const esOtro = document.getElementById('ning-nombre-stock').value === '__otro__';
  document.getElementById('ning-nombre').style.display = esOtro ? 'block' : 'none';
}

function bimbaSetModoIngrediente(modo) {
  _modoIngredienteActual = modo;
  const botones = { granel: document.getElementById('ning-modo-granel'), pack: document.getElementById('ning-modo-pack'), unidad: document.getElementById('ning-modo-unidad') };
  Object.keys(botones).forEach(function (m) {
    const activo = m === modo;
    botones[m].style.background = activo ? '#3D1F0D' : '#fff';
    botones[m].style.color = activo ? '#fff' : '#8A6A4E';
    botones[m].style.borderColor = activo ? '#3D1F0D' : '#F5E6C8';
  });
  document.getElementById('ning-campos-granel').style.display = (modo === 'granel') ? 'flex' : 'none';
  document.getElementById('ning-campos-pack').style.display = (modo === 'pack') ? 'flex' : 'none';
  document.getElementById('ning-campos-unidad').style.display = (modo === 'unidad') ? 'flex' : 'none';
}

async function bimbaGuardarIngrediente() {
  const selValue = document.getElementById('ning-nombre-stock').value;
  const nombre = (selValue === '__otro__') ? document.getElementById('ning-nombre').value.trim() : selValue;
  if (!nombre) { alert('Ponle un nombre al ingrediente'); return; }
  const ing = { id: 'ing_' + Date.now(), nombre: nombre, modo: _modoIngredienteActual };
  if (_modoIngredienteActual === 'granel') {
    ing.precioGranel = parseFloat(document.getElementById('ning-precio-granel').value) || 0;
    ing.unidadGranel = document.getElementById('ning-unidad-granel').value;
  } else if (_modoIngredienteActual === 'pack') {
    ing.precioPack = parseFloat(document.getElementById('ning-precio-pack').value) || 0;
    ing.unidadesPack = parseInt(document.getElementById('ning-unidades-pack').value, 10) || 1;
  } else {
    ing.precioUnidad = parseFloat(document.getElementById('ning-precio-unidad').value) || 0;
  }
  _ingredientesCoste.push(ing);
  try {
    await firebase.database().ref('config/ingredientesCoste').set(_ingredientesCoste);
  } catch (e) { /* sigue en memoria aunque falle el guardado */ }
  document.getElementById('nuevo-ingrediente-form').style.display = 'none';
  bimbaRenderIngredientesBase();
  bimbaPoblarSelectorIngredientesReceta();

  // Aplicar este ingrediente solo a todos los productos cuya descripción lo mencione
  const afectados = [];
  MENU.forEach(function (mItem) {
    if (!mItem.desc) return;
    const candidatos = mItem.desc.split(/,| y |\u00b7/i).map(function (s) { return s.trim(); }).filter(Boolean);
    const coincide = candidatos.some(function (cand) { return _mejorCoincidenciaNombre(cand.toLowerCase(), [nombre]); });
    if (!coincide) return;
    if (!_recetasProducto[mItem.id]) _recetasProducto[mItem.id] = [];
    const yaEstaba = _recetasProducto[mItem.id].some(function (l) { return l.ingredienteId === ing.id; });
    if (yaEstaba) return;
    _recetasProducto[mItem.id].push({ ingredienteId: ing.id, cantidad: 0 });
    afectados.push(mItem.name.replace('🆕', '').trim());
  });
  if (afectados.length) {
    await _guardarRecetas();
    alert('"' + nombre + '" añadido también a la receta de: ' + afectados.join(', ') + ' (con cantidad en 0, hay que rellenarla en cada uno)');
    bimbaRenderRecetaLineas();
    const itemActual = MENU.find(function (i) { return String(i.id) === String(_recetaProductoActualId); });
    bimbaRenderSugeridos(itemActual);
  }
}

async function bimbaEliminarIngrediente(id) {
  if (!confirm('¿Borrar este ingrediente? (si lo usas en alguna receta, esa línea dejará de calcularse)')) return;
  _ingredientesCoste = _ingredientesCoste.filter(function (i) { return i.id !== id; });
  try {
    await firebase.database().ref('config/ingredientesCoste').set(_ingredientesCoste);
  } catch (e) {}
  bimbaRenderIngredientesBase();
  bimbaPoblarSelectorIngredientesReceta();
  bimbaRenderRecetaLineas();
}

function bimbaPoblarSelectorIngredientesReceta() {
  const sel = document.getElementById('receta-nuevo-ingrediente');
  if (!_ingredientesCoste.length) {
    sel.innerHTML = '<option value="">Añade un ingrediente primero ↑</option>';
    return;
  }
  sel.innerHTML = _ingredientesCoste.map(function (ing) {
    return '<option value="' + ing.id + '">' + escapeHtml(ing.nombre) + '</option>';
  }).join('');
}

function bimbaRenderRecetaLineas() {
  const el = document.getElementById('receta-lineas-lista');
  const lineas = _recetasProducto[_recetaProductoActualId] || [];
  if (!lineas.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:11.5px;padding:6px 2px">Sin ingredientes en esta receta todavía.</div>';
  } else {
    el.innerHTML = lineas.map(function (linea, idx) {
      const ing = _ingredientesCoste.find(function (i) { return i.id === linea.ingredienteId; });
      const nombre = ing ? ing.nombre : '(ingrediente borrado)';
      const unidad = ing ? _unidadPequenaIngrediente(ing) : '';
      const costeLinea = ing ? _costeUnidadIngrediente(ing) * (linea.cantidad || 0) : 0;
      return '<div style="display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:7px 10px;margin-bottom:5px">'
        + '<span style="flex:1;font-size:12.5px;font-weight:700;color:#3D1F0D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(nombre) + '</span>'
        + '<input type="number" step="1" min="0" value="' + (linea.cantidad || 0) + '" onchange="bimbaActualizarCantidadLinea(' + idx + ', this.value)" style="width:54px;padding:5px 6px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif">'
        + '<span style="font-size:11px;color:#8A6A4E;width:18px">' + unidad + '</span>'
        + '<span style="font-size:12.5px;font-weight:700;color:#3D1F0D;width:54px;text-align:right">' + costeLinea.toFixed(2) + ' €</span>'
        + '<button onclick="bimbaEliminarLineaReceta(' + idx + ')" style="background:none;border:none;color:#c0392b;font-size:15px;cursor:pointer;padding:2px 4px">✕</button>'
      + '</div>';
    }).join('');
  }
  document.getElementById('receta-total').textContent = _calcularCosteReceta(_recetaProductoActualId).toFixed(2) + ' €';
}

function _normalizarTexto(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca la mejor coincidencia de candLower dentro de una lista de nombres.
// 1) exacto, 2) palabra completa dentro del nombre, 3) substring (solo si candLower es largo).
// Si hay varias, se queda con el nombre más corto (suele ser el más genérico/correcto).
function _mejorCoincidenciaNombre(candLower, nombres) {
  const cand = _normalizarTexto(candLower);
  let candidatas = nombres.filter(function (n) { return _normalizarTexto(n) === cand; });
  if (!candidatas.length) {
    candidatas = nombres.filter(function (n) {
      const palabras = _normalizarTexto(n).split(/\s+/);
      return palabras.indexOf(cand) !== -1;
    });
  }
  if (!candidatas.length && cand.length >= 5) {
    candidatas = nombres.filter(function (n) { return _normalizarTexto(n).indexOf(cand) !== -1; });
  }
  if (!candidatas.length) return null;
  candidatas.sort(function (a, b) { return a.length - b.length; });
  return candidatas[0];
}

function bimbaRenderSugeridos(item) {
  const el = document.getElementById('receta-sugeridos');
  if (!item || !item.desc) { el.innerHTML = ''; return; }
  const candidatos = item.desc.split(/,| y |\u00b7/i).map(function (s) { return s.trim(); }).filter(Boolean);
  if (!candidatos.length) { el.innerHTML = ''; return; }

  const lineasActuales = _recetasProducto[_recetaProductoActualId] || [];
  const yaEnReceta = lineasActuales.map(function (l) { return l.ingredienteId; });

  const chips = candidatos.map(function (cand) {
    const candLower = cand.toLowerCase();
    const nombreConPrecio = _mejorCoincidenciaNombre(candLower, _ingredientesCoste.map(function (i) { return i.nombre; }));
    if (nombreConPrecio) {
      const conPrecio = _ingredientesCoste.find(function (i) { return i.nombre === nombreConPrecio; });
      if (yaEnReceta.includes(conPrecio.id)) return null;
      return '<span onclick="bimbaSugerirAnadirLinea(\'' + conPrecio.id + '\')" style="display:inline-block;background:#FBEFD6;border:1.5px solid #F4C430;border-radius:99px;padding:4px 10px;margin:0 4px 6px 0;font-size:11.5px;font-weight:700;color:#854F0B;cursor:pointer">+ ' + escapeHtml(conPrecio.nombre) + '</span>';
    }
    const enStock = _mejorCoincidenciaNombre(candLower, _stockIngredientesNombres);
    if (enStock) {
      return '<span style="display:inline-block;background:#F5F2EA;border:1.5px solid #E3DCC8;border-radius:99px;padding:4px 10px;margin:0 4px 6px 0;font-size:11.5px;color:#8A6A4E" title="Está en Stock pero todavía no le has puesto precio en Mis ingredientes base">' + escapeHtml(enStock) + ' (sin precio)</span>';
    }
    return null;
  }).filter(Boolean);

  if (!chips.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div style="font-size:10.5px;font-weight:700;color:#8A6A4E;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">Según tu carta lleva</div>' + chips.join('');
}

function bimbaSugerirAnadirLinea(ingId) {
  if (!_recetasProducto[_recetaProductoActualId]) _recetasProducto[_recetaProductoActualId] = [];
  _recetasProducto[_recetaProductoActualId].push({ ingredienteId: ingId, cantidad: 0 });
  _guardarRecetas();
  bimbaRenderRecetaLineas();
  const item = MENU.find(function (i) { return String(i.id) === String(_recetaProductoActualId); });
  bimbaRenderSugeridos(item);
}

async function _guardarRecetas() {
  try { await firebase.database().ref('config/recetasProducto').set(_recetasProducto); } catch (e) {}
}

function bimbaAnadirLineaReceta() {
  const ingId = document.getElementById('receta-nuevo-ingrediente').value;
  const cantidad = parseFloat(document.getElementById('receta-nueva-cantidad').value);
  if (!ingId) { alert('Elige un ingrediente'); return; }
  if (!cantidad || cantidad <= 0) { alert('Pon una cantidad válida'); return; }
  if (!_recetasProducto[_recetaProductoActualId]) _recetasProducto[_recetaProductoActualId] = [];
  _recetasProducto[_recetaProductoActualId].push({ ingredienteId: ingId, cantidad: cantidad });
  document.getElementById('receta-nueva-cantidad').value = '';
  _guardarRecetas();
  bimbaRenderRecetaLineas();
}

function bimbaActualizarCantidadLinea(idx, valor) {
  const lineas = _recetasProducto[_recetaProductoActualId];
  if (!lineas || !lineas[idx]) return;
  lineas[idx].cantidad = parseFloat(valor) || 0;
  _guardarRecetas();
  bimbaRenderRecetaLineas();
}

function bimbaEliminarLineaReceta(idx) {
  const lineas = _recetasProducto[_recetaProductoActualId];
  if (!lineas) return;
  lineas.splice(idx, 1);
  _guardarRecetas();
  bimbaRenderRecetaLineas();
}

function bimbaAplicarCosteReceta() {
  const item = MENU.find(function (i) { return String(i.id) === String(_recetaProductoActualId); });
  const msgEl = document.getElementById('receta-msg');
  if (!item) { msgEl.style.color = '#c0392b'; msgEl.textContent = 'No encuentro el producto'; return; }
  const total = _calcularCosteReceta(_recetaProductoActualId);
  item.coste = parseFloat(total.toFixed(2));
  saveMenu();
  msgEl.style.color = '#27855a';
  msgEl.textContent = '✅ Aplicado: ' + item.coste.toFixed(2) + ' € de coste';
  bimbaRenderMargenes();
  setTimeout(closeRecetaOverlay, 900);
}

// ════════════════════════════════════════════════════
// SIMULADOR "¿Y SI CONTRATO A ALGUIEN MÁS?"
// ════════════════════════════════════════════════════
let _modoSimuladorActual = 'hora';

function bimbaToggleSimulador() {
  const panel = document.getElementById('simulador-panel');
  const chevron = document.getElementById('simulador-chevron');
  const abierto = panel.style.display !== 'none';
  panel.style.display = abierto ? 'none' : 'block';
  chevron.style.transform = abierto ? 'rotate(0deg)' : 'rotate(180deg)';
  if (!abierto) bimbaRenderSimulador();
}

function bimbaSimSetTipo(tipo) {
  _modoSimuladorActual = tipo;
  const btnHora = document.getElementById('sim-tipo-hora');
  const btnSueldo = document.getElementById('sim-tipo-sueldo');
  const esHora = tipo === 'hora';
  btnHora.style.background = esHora ? '#3D1F0D' : '#fff';
  btnHora.style.color = esHora ? '#fff' : '#8A6A4E';
  btnHora.style.borderColor = esHora ? '#3D1F0D' : '#F5E6C8';
  btnSueldo.style.background = !esHora ? '#3D1F0D' : '#fff';
  btnSueldo.style.color = !esHora ? '#fff' : '#8A6A4E';
  btnSueldo.style.borderColor = !esHora ? '#3D1F0D' : '#F5E6C8';
  document.getElementById('sim-campos-hora').style.display = esHora ? 'flex' : 'none';
  document.getElementById('sim-campos-sueldo').style.display = esHora ? 'none' : 'block';
  bimbaRenderSimulador();
}

function bimbaRenderSimulador() {
  const resEl = document.getElementById('sim-resultado');
  if (!resEl) return;
  const panel = document.getElementById('simulador-panel');
  if (!panel || panel.style.display === 'none') return;

  const { inicio, fin } = _equipoRangoPeriodo();
  const dias = Math.round((new Date(fin) - new Date(inicio)) / 86400000) + 1;

  let brutoSim = 0;
  if (_modoSimuladorActual === 'hora') {
    const horasSemana = parseFloat(document.getElementById('sim-horas-semana').value) || 0;
    const tarifa = parseFloat(document.getElementById('sim-tarifa-hora').value) || 0;
    brutoSim = horasSemana * (dias / 7) * tarifa;
  } else {
    const sueldoMensual = parseFloat(document.getElementById('sim-sueldo-mensual').value) || 0;
    brutoSim = sueldoMensual * (dias / 30);
  }

  if (brutoSim <= 0) {
    resEl.innerHTML = '<span style="color:#8A6A4E">Rellena las horas/tarifa o el sueldo para ver la simulación.</span>';
    return;
  }

  const ssMensual = parseFloat(document.getElementById('sim-ss-mensual').value) || 0;
  const ssSim = ssMensual * (dias / 30);
  const totalSim = brutoSim + ssSim;

  const facturacionEl = document.getElementById('equipo-facturacion');
  const facturacion = parseFloat(facturacionEl && facturacionEl.value) || 0;
  const totalActual = _equipoUltimoTotalPersonal || 0;
  const totalConSimulado = totalActual + totalSim;

  let html = '<div style="background:#FBEFD6;border:1.5px solid #F4C430;border-radius:10px;padding:10px;margin-bottom:8px">'
    + '<div style="font-size:11px;color:#854F0B;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Esta persona costaría en el periodo</div>'
    + '<div style="font-size:16px;font-weight:800;color:#3D1F0D">' + totalSim.toFixed(2) + ' €</div>'
    + '<div style="font-size:10.5px;color:#854F0B">bruto ' + brutoSim.toFixed(2) + ' € + SS ' + ssSim.toFixed(2) + ' €</div>'
    + '</div>';

  if (facturacion > 0) {
    const pctActual = (totalActual / facturacion) * 100;
    const pctNuevo = (totalConSimulado / facturacion) * 100;
    html += '<div>El % de personal pasaría de <strong>' + pctActual.toFixed(1) + '%</strong> a <strong style="color:' + (pctNuevo > 30 ? '#c0392b' : '#27855a') + '">' + pctNuevo.toFixed(1) + '%</strong></div>';
  } else {
    html += '<div style="color:#8A6A4E">Pon la facturación del periodo arriba para ver cómo cambiaría el %.</div>';
  }
  resEl.innerHTML = html;
}
