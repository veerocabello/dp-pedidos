"use strict";

function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
/* ═══════════════════════════════════════════════════
   Sistema de fichaje y empleados
   ═══════════════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  SISTEMA DE EMPLEADOS Y FICHAJE
// ══════════════════════════════════════════════
const EMP_KEY = 'dpf_empleados';
const FICHAJE_KEY = 'dpf_fichajes';
const EMP_FICHAR_KEY = 'dpf_fichar_token';
const EMP_EMPRESA_KEY = 'dpf_empresa';
const EMP_CIF_KEY = 'dpf_cif';
// Razón social y CIF se leen desde localStorage (editables desde el panel de administración)
function getEmpEmpresa() {
  return localStorage.getItem(EMP_EMPRESA_KEY) || '';
}
function getEmpCIF() {
  return localStorage.getItem(EMP_CIF_KEY) || '';
}

// ⚠️ SEGURIDAD: Los datos de empleados se cargan desde Firebase (config/empleados).
// EMP_DEFAULT es solo el arranque inicial en un dispositivo nuevo sin datos en Firebase.
// Los nombres y PINs reales se gestionan SIEMPRE desde el panel de administración.
// Este array no contiene datos personales — edita los empleados desde el panel.
const EMP_DEFAULT = [{
  id: 'emp1',
  nombre: 'Empleado 1',
  dni: '',
  pin: '',
  dias: [2, 4, 5, 6, 0],
  manIn: '',
  manOut: '',
  tarIn: '16:00',
  tarOut: '00:00'
}, {
  id: 'emp2',
  nombre: 'Empleado 2',
  dni: '',
  pin: '',
  dias: [4, 5, 6, 0],
  manIn: '',
  manOut: '',
  tarIn: '19:00',
  tarOut: '00:00'
}, {
  id: 'emp3',
  nombre: 'Empleado 3',
  dni: '',
  pin: '',
  dias: [4, 5, 6, 0],
  manIn: '',
  manOut: '',
  tarIn: '19:00',
  tarOut: '00:00'
}, {
  id: 'emp4',
  nombre: 'Empleado 4',
  dni: '',
  pin: '',
  dias: [3, 4, 5, 6, 0],
  manIn: '',
  manOut: '',
  tarIn: '20:00',
  tarOut: '00:00'
}, {
  id: 'emp5',
  nombre: 'Empleado 5',
  dni: '',
  pin: '',
  dias: [3, 4, 5, 6, 0],
  manIn: '10:00',
  manOut: '14:00',
  tarIn: '20:00',
  tarOut: '00:00'
}, {
  id: 'emp6',
  nombre: 'Empleado 6',
  dni: '',
  pin: '',
  dias: [3, 4, 5, 6, 0],
  manIn: '10:00',
  manOut: '14:00',
  tarIn: '',
  tarOut: ''
}];
function empLoadAll() {
  try {
    const d = JSON.parse(localStorage.getItem(EMP_KEY) || 'null');
    if (d && d.length) return d;
  } catch {}
  // Si no hay en localStorage, devolver default — Firebase actualizará async
  return JSON.parse(JSON.stringify(EMP_DEFAULT));
}
function empSaveAll(arr) {
  localStorage.setItem(EMP_KEY, JSON.stringify(arr));
  if (window.fb_saveEmpleados) window.fb_saveEmpleados(arr).catch(e => console.warn('Firebase empleados error', e));
}
function fichajesLoad() {
  try {
    return JSON.parse(localStorage.getItem(FICHAJE_KEY) || '[]');
  } catch {
    return [];
  }
}
function fichajesSave(a) {
  localStorage.setItem(FICHAJE_KEY, JSON.stringify(a));
  if (window.fb_saveFichajes) window.fb_saveFichajes(a).catch(e => console.warn('Firebase fichajes error', e));
}
function getFicharToken() {
  return localStorage.getItem(EMP_FICHAR_KEY) || '';
}
function empGenFicharToken() {
  const t = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(EMP_FICHAR_KEY, t);
  if (window.fb_saveFicharToken) window.fb_saveFicharToken(t).catch(() => {});
  empMostrarFicharUrl();
  const toast = document.getElementById('emp-fichar-toast');
  if (toast) { toast.textContent = '✅ Token generado'; toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 2000); }
}
// TEMPORAL mientras la web está cerrada con Basic Auth: los enlaces de
// fichar apuntan a fichar-publico.html (copia de index.html, accesible sin
// contraseña) en vez de a la página normal. BORRAR esta función y volver a
// usar location.pathname directamente el día de la reapertura.
function _ficharBaseUrl() {
  return location.origin + location.pathname.replace(/[^/]*$/, '') + 'fichar-standalone.html';
}
function empCopyFicharUrl() {
  let t = getFicharToken();
  if (!t) {
    empGenFicharToken();
    t = getFicharToken();
  }
  const url = _ficharBaseUrl() + '?fichar=' + t;
  navigator.clipboard.writeText(url).catch(() => {
    const a = document.createElement('textarea');
    a.value = url;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    document.body.removeChild(a);
  });
  const toast = document.getElementById('emp-fichar-toast');
  if (toast) { toast.textContent = '📋 URL copiada'; toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 2000); }
}
function empMostrarFicharUrl() {
  const t = getFicharToken();
  const text = t ? '🔗 ' + _ficharBaseUrl() + '?fichar=' + t : 'Sin token generado';
  // Actualizar ambos elementos (paneles de fichaje y empleados)
  ['emp-fichar-url-display', 'bimba-fichar-url-display'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}
function empRenderAdmin() {
  empMostrarFicharUrl();
  empRenderLista();
  empRenderTrabajandoAhora();
  empRenderSelectHistorial();
  const mesEl = document.getElementById('emp-hist-mes');
  if (mesEl && !mesEl.value) mesEl.value = new Date().toISOString().slice(0, 7);
}
function empRenderLista() {
  const emps = empLoadAll();
  const el = document.getElementById('emp-lista');
  if (!el) return;
  const DN = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  el.innerHTML = emps.map(e => "\n    <div style=\"background:".concat(e.deBaja ? '#FDECD5' : 'var(--white)', ";border:1.5px solid ").concat(e.deBaja ? '#E8943A' : 'var(--warm)', ";border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap\">\n      <div style=\"flex:1;min-width:160px\">\n        <div style=\"font-size:14px;font-weight:700;color:var(--brown)\">").concat(e.nombre).concat(e.deBaja ? ' <span style="font-size:11px;font-weight:700;color:#C2711A">🛌 DE BAJA</span>' : '', "</div>\n        <div style=\"font-size:11px;color:var(--muted);margin-top:2px\">DNI: ").concat(e.dni ? e.dni.replace(/./g, (c, i, s) => i < 3 || i >= s.length - 2 ? c : '*') : '—', " \xB7 PIN: \u2022\u2022\u2022\u2022</div>\n        <div style=\"font-size:11px;color:var(--muted)\">").concat((e.dias || []).map(d => DN[d]).join(', ') || '—').concat(e.tarIn ? ' · Tarde: ' + e.tarIn + '–' + e.tarOut : '').concat(e.manIn ? ' · Mañana: ' + e.manIn + '–' + e.manOut : '', "</div>\n      </div>\n      <div style=\"display:flex;gap:6px\">\n        <button onclick=\"empToggleBaja('").concat(e.id, "')\" title=\"").concat(e.deBaja ? 'Reactivar' : 'Poner de baja temporal', "\" style=\"padding:6px 12px;background:").concat(e.deBaja ? '#166534' : '#FDECD5', ";color:").concat(e.deBaja ? '#fff' : '#C2711A', ";border:1.5px solid ").concat(e.deBaja ? '#166534' : '#E8943A', ";border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">").concat(e.deBaja ? '✅' : '🛌', "</button>\n        <button onclick=\"empEditarModal('").concat(e.id, "')\" style=\"padding:6px 12px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\u270F\uFE0F</button>\n        <button onclick=\"empEliminar('").concat(e.id, "')\" style=\"padding:6px 12px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\uD83D\uDDD1\uFE0F</button>\n      </div>\n    </div>")).join('');
}
function empToggleBaja(id) {
  const all = empLoadAll();
  const idx = all.findIndex(e => e.id === id);
  if (idx < 0) return;
  all[idx].deBaja = !all[idx].deBaja;
  empSaveAll(all);
  empRenderLista();
  if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
  if (typeof bimbaActualizarContadorAlertas === 'function') bimbaActualizarContadorAlertas();
  if (typeof empRenderAdmin === 'function') empRenderAdmin();
}

// ── FICHAJES IMPORTADOS ────────────────────────────────────────────────────
// Los fichajes históricos ya fueron migrados a Firebase/localStorage.
// Este array está vacío: la inyección automática solo se ejecuta una vez
// (controlada por la clave dpf_fichajes_importados_v6 en localStorage).
const EMP_FICHAJES_IMPORTADOS = [];

// Inyectar fichajes importados en localStorage la primera vez
(function empInyectarImportados() {
  const KEY = 'dpf_fichajes_importados_v6';
  if (localStorage.getItem(KEY)) return;
  const fich = fichajesLoad();
  const existentes = new Set(fich.map(f => f.empId + '|' + f.fecha + '|' + f.hora + '|' + f.tipo));
  const nuevos = EMP_FICHAJES_IMPORTADOS.filter(f => !existentes.has(f.empId + '|' + f.fecha + '|' + f.hora + '|' + f.tipo));
  fichajesSave([...fich, ...nuevos]);
  localStorage.setItem(KEY, '1');
})();

// ── REGISTRO DE FICHAJES POR MES/EMPLEADO ─────
const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function empRenderRegistroMeses() {
  const el = document.getElementById('emp-registro-meses');
  if (!el) return;
  const fich = fichajesLoad();
  const emps = empLoadAll();
  // Obtener todos los meses con datos
  const meses = [...new Set(fich.map(f => f.fecha.slice(0, 7)))].sort().reverse();
  if (!meses.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--muted)">Sin fichajes registrados</p>';
    return;
  }
  el.innerHTML = meses.map(mes => {
    const _mes$split$map = mes.split('-').map(Number),
      _mes$split$map2 = _slicedToArray(_mes$split$map, 2),
      anio = _mes$split$map2[0],
      mesN = _mes$split$map2[1];
    const mesLabel = MESES_ES[mesN - 1] + ' ' + anio;
    const fichMes = fich.filter(f => f.fecha.startsWith(mes));
    // Empleados con fichajes ese mes
    const empIds = [...new Set(fichMes.map(f => f.empId))];
    const subcarpetas = empIds.map(eid => {
      const emp = emps.find(e => e.id === eid) || {
        nombre: eid,
        id: eid
      };
      const suyos = fichMes.filter(f => f.empId === eid);
      // Calcular horas y días — solo cuentan días con entrada Y salida completas
      const porDia = {};
      suyos.forEach(f => {
        if (!porDia[f.fecha]) porDia[f.fecha] = {
          e: [],
          s: []
        };
        if (f.tipo === 'entrada') porDia[f.fecha].e.push(f.hora);else porDia[f.fecha].s.push(f.hora);
      });
      let totalMin = 0;
      let dias = 0;
      Object.values(porDia).forEach(_ref => {
        let e = _ref.e,
          s = _ref.s;
        if (e.length && s.length) {
          const _e$0$split$map = e[0].split(':').map(Number),
            _e$0$split$map2 = _slicedToArray(_e$0$split$map, 2),
            eh = _e$0$split$map2[0],
            em = _e$0$split$map2[1],
            _s$split$map = s[s.length - 1].split(':').map(Number),
            _s$split$map2 = _slicedToArray(_s$split$map, 2),
            sh = _s$split$map2[0],
            sm = _s$split$map2[1];
          let d = sh * 60 + sm - (eh * 60 + em);
          if (d < 0) d += 24 * 60;
          totalMin += d;
          dias++;
        }
      });
      const th = Math.floor(totalMin / 60),
        tm = totalMin % 60;
      return "<div style=\"display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--warm)\">\n        <span style=\"font-size:13px;font-weight:600;color:var(--text);flex:1\">".concat(emp.nombre.split(' ')[0], " ").concat(emp.nombre.split(' ')[1] || '', "</span>\n        <span style=\"font-size:11px;color:var(--muted)\">").concat(dias, " d\xEDas \xB7 ").concat(th, "h").concat(tm > 0 ? ' ' + tm + 'min' : '', "</span>\n        <button onclick=\"empDescargarMesEmpleado('").concat(eid, "','").concat(mes, "')\" style=\"padding:4px 10px;background:var(--brown);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\uD83D\uDCC4 Doc</button>\n        <button onclick=\"empVerDetalleRegistro('").concat(eid, "','").concat(mes, "')\" style=\"padding:4px 10px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\uD83D\uDC41\uFE0F Ver</button>\n      </div>");
    }).join('');
    return "<details style=\"background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:0;overflow:hidden\">\n      <summary style=\"padding:12px 14px;cursor:pointer;font-size:14px;font-weight:700;color:var(--brown);list-style:none;display:flex;align-items:center;justify-content:space-between\">\n        <span>\uD83D\uDCC1 ".concat(mesLabel, "</span>\n        <span style=\"font-size:11px;font-weight:500;color:var(--muted)\">").concat(empIds.length, " empleado").concat(empIds.length !== 1 ? 's' : '', "</span>\n      </summary>\n      <div style=\"padding:0 14px 12px\">").concat(subcarpetas, "</div>\n    </details>");
  }).join('');
}
function empDescargarMesEmpleado(empId, mes) {
  // Reutiliza empGenerarDocumento pero con parámetros directos
  document.getElementById('emp-hist-select').value = empId;
  document.getElementById('emp-hist-mes').value = mes;
  empGenerarDocumento();
}
function empVerDetalleRegistro(empId, mes) {
  document.getElementById('emp-hist-select').value = empId;
  document.getElementById('emp-hist-mes').value = mes;
  empVerHistorial();
  // Scroll al historial
  const el = document.getElementById('emp-hist-resultado');
  if (el) el.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Llamar al cargar la sección
const _origEmpRenderAdmin = empRenderAdmin;
empRenderAdmin = function () {
  _origEmpRenderAdmin();
  empRenderRegistroMeses();
};
let _empManualTipo = 'entrada';
function empFichajeManualModal() {
  const emps = empLoadAll();
  const sel = document.getElementById('emp-manual-emp');
  sel.innerHTML = emps.map(e => "<option value=\"".concat(e.id, "\">").concat(e.nombre, "</option>")).join('');
  // Fecha y hora actuales por defecto
  const ahora = new Date();
  document.getElementById('emp-manual-fecha').value = ahora.toISOString().slice(0, 10);
  document.getElementById('emp-manual-hora').value = ahora.toTimeString().slice(0, 5);
  empManualTipo('entrada');
  document.getElementById('emp-manual-modal').style.display = 'flex';
}
function empManualTipo(tipo) {
  _empManualTipo = tipo;
  const btnE = document.getElementById('emp-manual-btn-entrada');
  const btnS = document.getElementById('emp-manual-btn-salida');
  btnE.style.background = tipo === 'entrada' ? '#eafaf1' : 'var(--white)';
  btnE.style.borderColor = tipo === 'entrada' ? '#27855a' : 'var(--warm)';
  btnE.style.color = tipo === 'entrada' ? '#27855a' : 'var(--muted)';
  btnS.style.background = tipo === 'salida' ? '#fdf0ee' : 'var(--white)';
  btnS.style.borderColor = tipo === 'salida' ? '#c0392b' : 'var(--warm)';
  btnS.style.color = tipo === 'salida' ? '#c0392b' : 'var(--muted)';
}
function empManualGuardar() {
  const empId = document.getElementById('emp-manual-emp').value;
  const fecha = document.getElementById('emp-manual-fecha').value;
  const hora = document.getElementById('emp-manual-hora').value;
  if (!empId || !fecha || !hora) {
    alert('Rellena todos los campos');
    return;
  }
  const fich = fichajesLoad();
  fich.push({
    empId,
    fecha,
    hora,
    tipo: _empManualTipo,
    manual: true
  });
  fichajesSave(fich);
  document.getElementById('emp-manual-modal').style.display = 'none';
  empRenderTrabajandoAhora();
  // Refrescar historial si está visible
  const res = document.getElementById('emp-hist-resultado');
  if (res && res.innerHTML) empVerHistorial();
}

// ── AUTO-REFRESCO ─────────────────────────────
let _empAutoRefreshTimer = null;
function empSetAutoRefresh(segundos) {
  clearInterval(_empAutoRefreshTimer);
  _empAutoRefreshTimer = null;
  const status = document.getElementById('emp-autorefresh-status');
  if (!segundos || segundos === '0') {
    if (status) status.textContent = '';
    return;
  }
  const seg = parseInt(segundos);
  if (status) status.textContent = 'Próximo en ' + seg + 's';
  let cuenta = seg;
  _empAutoRefreshTimer = setInterval(() => {
    cuenta--;
    if (status) status.textContent = 'Próximo en ' + cuenta + 's';
    if (cuenta <= 0) {
      empRenderTrabajandoAhora();
      cuenta = seg;
      if (status) status.textContent = 'Actualizado · próximo en ' + seg + 's';
    }
  }, 1000);
}
function empRefrescar() {
  const btn = document.getElementById('emp-refresh-btn');
  if (btn) {
    btn.textContent = '✅ Actualizado';
    setTimeout(() => btn.textContent = '🔄 Refrescar', 1500);
  }
  empRenderTrabajandoAhora();
}
function empRenderTrabajandoAhora() {
  const el = document.getElementById('emp-trabajando-ahora');
  if (!el) return;
  const fichajes = fichajesLoad();
  const emps = empLoadAll();
  const hoy = new Date().toISOString().slice(0, 10);
  const dentro = emps.filter(e => {
    const s = fichajes.filter(f => f.empId === e.id && f.fecha === hoy).sort((a, b) => a.hora.localeCompare(b.hora));
    return s.length > 0 && s[s.length - 1].tipo === 'entrada';
  });
  if (!dentro.length) {
    el.textContent = 'Nadie trabajando ahora mismo';
    return;
  }
  el.innerHTML = dentro.map(e => {
    const ult = fichajes.filter(f => f.empId === e.id && f.fecha === hoy && f.tipo === 'entrada').sort((a, b) => b.hora.localeCompare(a.hora))[0];
    return "<div style=\"display:flex;align-items:center;gap:8px;padding:4px 0\"><span style=\"color:#27855a;font-size:16px\">\u25CF</span><span style=\"font-size:13px;font-weight:600;color:var(--brown)\">".concat(e.nombre.split(' ')[0], "</span><span style=\"font-size:12px;color:var(--muted)\">desde las ").concat(ult.hora, "</span></div>");
  }).join('');
}
function empRenderSelectHistorial() {
  const sel = document.getElementById('emp-hist-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Todos —</option>' + empLoadAll().map(e => "<option value=\"".concat(e.id, "\">").concat(e.nombre, "</option>")).join('');
}
function empNuevoModal() {
  document.getElementById('emp-modal-titulo').textContent = 'Nuevo empleado';
  ['emp-edit-id', 'emp-nombre', 'emp-dni', 'emp-pin', 'emp-tel', 'emp-man-in', 'emp-man-out', 'emp-tar-in', 'emp-tar-out'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('emp-de-baja').checked = false;
  document.querySelectorAll('.emp-dia-btn').forEach(b => b.classList.remove('activo'));
  document.getElementById('emp-modal').style.display = 'flex';
}
function empEditarModal(id) {
  const e = empLoadAll().find(x => x.id === id);
  if (!e) return;
  document.getElementById('emp-modal-titulo').textContent = 'Editar empleado';
  document.getElementById('emp-edit-id').value = e.id;
  document.getElementById('emp-nombre').value = e.nombre;
  document.getElementById('emp-dni').value = e.dni;
  document.getElementById('emp-pin').value = e.pin;
  document.getElementById('emp-tel').value = e.tel || '';
  document.getElementById('emp-man-in').value = e.manIn || '';
  document.getElementById('emp-man-out').value = e.manOut || '';
  document.getElementById('emp-tar-in').value = e.tarIn || '';
  document.getElementById('emp-tar-out').value = e.tarOut || '';
  document.getElementById('emp-de-baja').checked = !!e.deBaja;
  document.querySelectorAll('.emp-dia-btn').forEach(b => b.classList.toggle('activo', (e.dias || []).includes(parseInt(b.dataset.d))));
  document.getElementById('emp-modal').style.display = 'flex';
}
function empToggleDia(btn) {
  btn.classList.toggle('activo');
}
function empModalGuardar() {
  const nombre = document.getElementById('emp-nombre').value.trim();
  const pin = document.getElementById('emp-pin').value.trim();
  if (!nombre || pin.length !== 4) {
    alert('Nombre y PIN de 4 dígitos son obligatorios');
    return;
  }
  const dias = [];
  document.querySelectorAll('.emp-dia-btn.activo').forEach(b => dias.push(parseInt(b.dataset.d)));
  const emp = {
    id: document.getElementById('emp-edit-id').value || 'emp_' + Date.now(),
    nombre,
    dni: document.getElementById('emp-dni').value.trim(),
    pin,
    tel: document.getElementById('emp-tel').value.trim(),
    dias,
    manIn: document.getElementById('emp-man-in').value,
    manOut: document.getElementById('emp-man-out').value,
    tarIn: document.getElementById('emp-tar-in').value,
    tarOut: document.getElementById('emp-tar-out').value,
    deBaja: document.getElementById('emp-de-baja').checked
  };
  const all = empLoadAll();
  if (all.some(e => e.pin === pin && e.id !== emp.id)) {
    alert('PIN ya en uso');
    return;
  }
  const idx = all.findIndex(e => e.id === emp.id);
  if (idx >= 0) all[idx] = emp;else all.push(emp);
  empSaveAll(all);
  document.getElementById('emp-modal').style.display = 'none';
  empRenderLista();
  if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
  empRenderAdmin();
}
function empEliminar(id) {
  const e = empLoadAll().find(x => x.id === id);
  if (!e || !confirm('¿Eliminar a ' + e.nombre + '?')) return;
  empSaveAll(empLoadAll().filter(x => x.id !== id));
  fichajesSave(fichajesLoad().filter(f => f.empId !== id));
  empRenderLista();
  if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
  empRenderAdmin();
}
function empVerHistorial() {
  const empId = document.getElementById('emp-hist-select').value;
  const mes = document.getElementById('emp-hist-mes').value;
  const el = document.getElementById('emp-hist-resultado');
  const emps = empLoadAll();
  let fich = fichajesLoad();
  if (empId) fich = fich.filter(f => f.empId === empId);
  if (mes) fich = fich.filter(f => f.fecha.startsWith(mes));
  fich.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  if (!fich.length) {
    el.innerHTML = '<p style="font-size:13px;color:#8A6A4E;padding:8px 0">Sin fichajes para ese período</p>';
    return;
  }
  const byEmp = {};
  fich.forEach(f => {
    if (!byEmp[f.empId]) byEmp[f.empId] = {};
    if (!byEmp[f.empId][f.fecha]) byEmp[f.empId][f.fecha] = [];
    byEmp[f.empId][f.fecha].push(f);
  });
  let html = '';
  Object.keys(byEmp).forEach(eid => {
    const emp = emps.find(e => e.id === eid) || { nombre: eid };
    let totalMin = 0;
    html += `<div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px">${emp.nombre}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="border-bottom:1.5px solid #F5E6C8">
            <th style="text-align:left;padding:7px 8px;font-weight:500;color:#8A6A4E;font-size:12px">Día</th>
            <th style="text-align:center;padding:7px 8px;font-weight:500;color:#1D9E75;font-size:12px">Entrada</th>
            <th style="text-align:center;padding:7px 8px;font-weight:500;color:#c0392b;font-size:12px">Salida</th>
            <th style="text-align:right;padding:7px 8px;font-weight:500;color:#8A6A4E;font-size:12px">Horas</th>
            <th style="padding:7px 4px;font-size:12px"></th>
          </tr>
        </thead>
        <tbody>`;
    Object.keys(byEmp[eid]).sort().reverse().forEach(fecha => {
      const ff = byEmp[eid][fecha];
      const ent = ff.filter(f => f.tipo === 'entrada');
      const sal = ff.filter(f => f.tipo === 'salida');
      const entHora = ent.length ? ent[0].hora : '—';
      const salHora = sal.length ? sal[sal.length-1].hora : '—';
      let horas = '—';
      if (ent.length && sal.length) {
        const [eh, em] = ent[0].hora.split(':').map(Number);
        const [sh, sm] = sal[sal.length-1].hora.split(':').map(Number);
        let min = sh * 60 + sm - (eh * 60 + em);
        if (min < 0) min += 24 * 60;
        totalMin += min;
        horas = Math.floor(min/60) + 'h' + (min%60 > 0 ? ' ' + min%60 + 'min' : '');
      }
      const fechaLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'numeric'});
      const allFich = fichajesLoad();
      const idxEnt = ent.length ? allFich.findIndex(x => x.empId === eid && x.fecha === fecha && x.hora === ent[0].hora && x.tipo === 'entrada') : -1;
      const idxSal = sal.length ? allFich.findIndex(x => x.empId === eid && x.fecha === fecha && x.hora === sal[sal.length-1].hora && x.tipo === 'salida') : -1;
      html += `<tr style="border-bottom:1px solid #F5E6C8">
        <td style="padding:8px;color:#8A6A4E;font-size:12px">${fechaLabel}</td>
        <td style="padding:8px;text-align:center;font-weight:500;color:#2A1506">${entHora}</td>
        <td style="padding:8px;text-align:center;font-weight:500;color:#2A1506">${salHora}</td>
        <td style="padding:8px;text-align:right;font-weight:500;color:#C2711A">${horas}</td>
        <td style="padding:8px 4px;text-align:right;white-space:nowrap">
          ${idxEnt >= 0 ? `<button onclick="empEditarFichaje(${idxEnt})" style="padding:2px 7px;background:#FDECD5;color:#C2711A;border:1px solid #E8943A;border-radius:5px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif">✏️E</button>` : ''}
          ${idxSal >= 0 ? `<button onclick="empEditarFichaje(${idxSal})" style="padding:2px 7px;background:#fdf0ee;color:#c0392b;border:1px solid #c0392b;border-radius:5px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif">✏️S</button>` : ''}
        </td>
      </tr>`;
    });
    const th = Math.floor(totalMin/60), tm = totalMin%60;
    html += `</tbody></table>
      <div style="text-align:right;font-size:12px;font-weight:700;color:#3D1F0D;padding:6px 8px 0">Total: ${th}h${tm > 0 ? ' ' + tm + 'min' : ''}</div>
    </div>`;
  });
  el.innerHTML = html;
}
function empEditarFichaje(idx) {
  const fich = fichajesLoad();
  if (!fich[idx]) return;
  const f = fich[idx];
  const nuevaHora = prompt("Editar hora de ".concat(f.tipo, " del ").concat(f.fecha, ":\nHora actual: ").concat(f.hora, "\n\nNueva hora (formato HH:MM):"), f.hora);
  if (!nuevaHora || !nuevaHora.match(/^\d{2}:\d{2}$/)) {
    if (nuevaHora !== null) alert('Formato incorrecto. Usa HH:MM');
    return;
  }
  fich[idx].hora = nuevaHora;
  fichajesSave(fich);
  empVerHistorial();
}
function empEliminarFichaje(idx) {
  const fich = fichajesLoad();
  if (!fich[idx]) return;
  const f = fich[idx];
  if (!confirm("\xBFEliminar fichaje?\n".concat(f.tipo, " \u2014 ").concat(f.fecha, " ").concat(f.hora))) return;
  fich.splice(idx, 1);
  fichajesSave(fich);
  empVerHistorial();
}
async function empGenerarDocumento() {
  const empId = document.getElementById('emp-hist-select').value;
  const mes = document.getElementById('emp-hist-mes').value;
  if (!empId) {
    alert('Selecciona un empleado');
    return;
  }
  if (!mes) {
    alert('Selecciona el mes');
    return;
  }
  const emp = empLoadAll().find(e => e.id === empId);
  if (!emp) return;
  const _mes$split$map3 = mes.split('-').map(Number),
    _mes$split$map4 = _slicedToArray(_mes$split$map3, 2),
    anio = _mes$split$map4[0],
    mesN = _mes$split$map4[1];
  const diasEnMes = new Date(anio, mesN, 0).getDate();
  const mesNombre = new Date(anio, mesN - 1, 1).toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric'
  }).toUpperCase();
  const porDia = {};
  fichajesLoad().filter(f => f.empId === empId && f.fecha.startsWith(mes)).forEach(f => {
    const d = parseInt(f.fecha.slice(8));
    if (!porDia[d]) porDia[d] = {
      e: [],
      s: [],
      firma: null
    };
    if (f.tipo === 'entrada') porDia[d].e.push(f.hora);else porDia[d].s.push(f.hora);
    if (f.firma) porDia[d].firma = f.firma;
  });
  let totalMin = 0,
    filas = '';
  for (let d = 1; d <= diasEnMes; d++) {
    const dd = porDia[d];
    let manIn = '',
      manOut = '',
      tarIn = '',
      tarOut = '',
      horas = '';
    if (dd) {
      dd.e.forEach(h => {
        const hh = parseInt(h);
        if (hh < 15) manIn = h;else tarIn = h;
      });
      dd.s.forEach(h => {
        const hh = parseInt(h);
        if (hh < 15 && hh > 6) manOut = h;else tarOut = h;
      });
      let min = 0;
      [[manIn, manOut], [tarIn, tarOut]].forEach(_ref2 => {
        let _ref3 = _slicedToArray(_ref2, 2),
          ei = _ref3[0],
          si = _ref3[1];
        if (ei && si) {
          const _ei$split$map = ei.split(':').map(Number),
            _ei$split$map2 = _slicedToArray(_ei$split$map, 2),
            eh = _ei$split$map2[0],
            em = _ei$split$map2[1],
            _si$split$map = si.split(':').map(Number),
            _si$split$map2 = _slicedToArray(_si$split$map, 2),
            sh = _si$split$map2[0],
            sm = _si$split$map2[1];
          let diff = sh * 60 + sm - (eh * 60 + em);
          if (diff < 0) diff += 24 * 60;
          min += diff;
        }
      });
      if (min > 0) {
        totalMin += min;
        horas = Math.floor(min / 60) + (min % 60 > 0 ? '.' + min % 60 : '');
      }
    }
    const firmaCelda = dd && dd.firma
      ? "<img src=\"".concat(dd.firma, "\" style=\"max-height:22px;max-width:100%;display:block;margin:0 auto\">")
      : '';
    filas += "<tr><td style=\"text-align:center;border:1px solid #000;padding:3px\">".concat(d, "</td><td style=\"text-align:center;border:1px solid #000;padding:3px\">").concat(manIn, "</td><td style=\"text-align:center;border:1px solid #000;padding:3px\">").concat(tarIn, "</td><td style=\"text-align:center;border:1px solid #000;padding:3px\">").concat(manOut, "</td><td style=\"text-align:center;border:1px solid #000;padding:3px\">").concat(tarOut, "</td><td style=\"text-align:center;border:1px solid #000;padding:3px\">").concat(horas, "</td><td style=\"border:1px solid #000;padding:3px;text-align:center\">").concat(firmaCelda, "</td></tr>");
  }
  const html = "<html><head><meta charset=\"UTF-8\"><style>body{font-family:Arial,sans-serif;font-size:9pt;margin:10mm}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:3px;font-size:8pt}.titulo td{background:#BFBFBF;text-align:center;font-weight:bold;font-size:12pt;padding:5px}.cab2 td{background:#D9D9D9;text-align:center;font-weight:bold}.datos td{text-align:left}.colcab th{background:#D9D9D9;text-align:center;font-weight:bold;font-size:7.5pt}.diaCell{text-align:center}.totalmes td{font-weight:bold}</style></head><body>\n    <table>\n    <tr class=\"titulo\"><td colspan=\"8\">REGISTRO DIARIO DE JORNADA DE TRABAJO</td></tr>\n    <tr class=\"cab2\"><td colspan=\"4\">EMPRESA</td><td colspan=\"4\">TRABAJADOR</td></tr>\n    <tr class=\"datos\"><td colspan=\"4\"><b>Razón social</b>: ".concat(getEmpEmpresa(), "</td><td colspan=\"4\"><b>Nombre</b>: ").concat(emp.nombre, "</td></tr>\n    <tr class=\"datos\"><td colspan=\"4\"><b>CIF</b>: ").concat(getEmpCIF(), "</td><td colspan=\"4\"><b>DNI</b>: ").concat(emp.dni || '', "</td></tr>\n    <tr class=\"datos\"><td colspan=\"4\"></td><td colspan=\"4\"><b>Fecha</b>: ").concat(mesNombre, "</td></tr>\n    </table>\n    <table class=\"colcab\">\n    <tr class=\"cab2\"><td style=\"width:11%\"></td><td colspan=\"2\" style=\"width:23%\">Hora de entrada</td><td colspan=\"2\" style=\"width:23%\">Hora de Salida</td><td style=\"width:15%\"></td><td style=\"width:28%\"></td></tr>\n    <tr><th style=\"width:11%\">Día</th><th style=\"width:11.5%\">Mañana</th><th style=\"width:11.5%\">Tarde</th><th style=\"width:11.5%\">Mañana</th><th style=\"width:11.5%\">Tarde</th><th style=\"width:15%\">Total Horas</th><th style=\"width:28%\">Firma del trabajador</th></tr>\n    ").concat(filas, "\n    <tfoot><tr class=\"totalmes\"><td style=\"width:11%\">TOTAL MES</td><td colspan=\"4\"></td><td class=\"diaCell\">").concat(Math.floor(totalMin / 60), "</td><td></td></tr></tfoot></table>\n    </body></html>");
  const blob = new Blob([html], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = emp.nombre.split(' ')[0].toUpperCase() + '_' + mes.replace('-', '_') + '.doc';
  a.click();
  URL.revokeObjectURL(url);
}

// ── PANTALLA FICHAJE ──────────────────────────
let _ficharPin = '',
  _ficharEmpActivo = null;
function ficharMostrarOverlay() {
  document.getElementById('fichar-overlay').classList.add('open');
  ficharIrVistaPIN();
}
function ficharIrVistaPIN() {
  _ficharPin = '';
  _ficharEmpActivo = null;
  ficharActualizarDots();
  document.getElementById('fichar-pin-view').style.display = 'block';
  document.getElementById('fichar-emp-view').style.display = 'none';
  document.getElementById('fichar-ok-view').style.display = 'none';
  document.getElementById('fichar-pin-error').style.display = 'none';
}
function ficharPin(d) {
  if (_ficharPin.length >= 4) return;
  _ficharPin += d;
  ficharActualizarDots();
  if (_ficharPin.length === 4) setTimeout(ficharPinOk, 100);
}
function ficharPinBorrar() {
  _ficharPin = _ficharPin.slice(0, -1);
  ficharActualizarDots();
}
function ficharActualizarDots() {
  document.querySelectorAll('.pin-dot').forEach((d, i) => d.classList.toggle('filled', i < _ficharPin.length));
}
function ficharPinOk() {
  const emp = empLoadAll().find(e => e.pin === _ficharPin);
  if (!emp) {
    document.getElementById('fichar-pin-error').style.display = 'block';
    _ficharPin = '';
    ficharActualizarDots();
    return;
  }
  _ficharEmpActivo = emp;
  ficharMostrarVista(emp);
}
function ficharMostrarVista(emp) {
  document.getElementById('fichar-pin-view').style.display = 'none';
  document.getElementById('fichar-emp-view').style.display = 'block';
  document.getElementById('fichar-ok-view').style.display = 'none';

  // Saludo y fecha
  document.getElementById('fichar-emp-saludo').textContent = 'Hola, ' + emp.nombre.split(' ')[0] + ' 👋';
  const hoy = new Date();
  const hoyStr = hoy.toISOString().slice(0, 10);
  const hoyLabel = hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  document.getElementById('fichar-fecha-hoy').textContent = hoyLabel.charAt(0).toUpperCase() + hoyLabel.slice(1);

  // Estado: ¿dentro o fuera?
  const fich = fichajesLoad();
  const suyosHoy = fich.filter(f => f.empId === emp.id && f.fecha === hoyStr).sort((a, b) => a.hora.localeCompare(b.hora));
  const dentro = suyosHoy.length > 0 && suyosHoy[suyosHoy.length - 1].tipo === 'entrada';
  document.getElementById('fichar-emp-estado').textContent = dentro ? '🟢 Estás trabajando' : '⚪ No has fichado entrada hoy';

  // Botones siempre activos, solo cambia el estilo visual
  const btnE = document.getElementById('fichar-btn-entrada');
  const btnS = document.getElementById('fichar-btn-salida');
  btnE.style.opacity = dentro ? '0.5' : '1';
  btnS.style.opacity = dentro ? '1' : '0.5';
  btnE.style.pointerEvents = 'auto';
  btnS.style.pointerEvents = 'auto';

  // Resumen del mes
  const mes = hoy.toISOString().slice(0, 7);
  const porDia = {};
  fich.filter(f => f.empId === emp.id && f.fecha.startsWith(mes)).forEach(f => {
    if (!porDia[f.fecha]) porDia[f.fecha] = {
      e: [],
      s: []
    };
    if (f.tipo === 'entrada') porDia[f.fecha].e.push(f.hora);else porDia[f.fecha].s.push(f.hora);
  });
  let totalMin = 0,
    dias = new Set();
  Object.keys(porDia).forEach(fecha => {
    const _porDia$fecha = porDia[fecha],
      e = _porDia$fecha.e,
      s = _porDia$fecha.s;
    if (e.length && s.length) {
      dias.add(fecha);
      const _e$0$split$map3 = e[0].split(':').map(Number),
        _e$0$split$map4 = _slicedToArray(_e$0$split$map3, 2),
        eh = _e$0$split$map4[0],
        em = _e$0$split$map4[1],
        _s$split$map3 = s[s.length - 1].split(':').map(Number),
        _s$split$map4 = _slicedToArray(_s$split$map3, 2),
        sh = _s$split$map4[0],
        sm = _s$split$map4[1];
      let diff = sh * 60 + sm - (eh * 60 + em);
      if (diff < 0) diff += 24 * 60;
      totalMin += diff;
    }
  });
  const th = Math.floor(totalMin / 60),
    tm = totalMin % 60;
  const mesN = hoy.toLocaleString('es-ES', {
    month: 'long'
  });
  document.getElementById('fichar-resumen-mes').innerHTML = '<b>' + mesN.charAt(0).toUpperCase() + mesN.slice(1) + ':</b><br>' + 'Días trabajados: <b>' + dias.size + '</b><br>' + 'Horas totales: <b>' + th + 'h' + (tm > 0 ? ' ' + tm + 'min' : '') + '</b>';

  // Últimos fichajes
  const rec = fich.filter(f => f.empId === emp.id).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 8);
  document.getElementById('fichar-historial-reciente').innerHTML = rec.length ? rec.map(f => '<div>' + f.fecha.slice(5).replace('-', '/') + ' ' + f.hora + ' — ' + (f.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Salida') + (f.auto ? ' <span style="font-size:10px;color:var(--muted)">(auto)</span>' : '') + '</div>').join('') : '<span style="color:var(--muted)">Sin fichajes recientes</span>';
}
// ── FICHAJE: firma con el dedo (una vez al día, antes de la primera entrada) ──
let _ficharFirmaCtx = null;
let _ficharFirmaDibujando = false;
let _ficharFirmaTieneTrazo = false;
let _ficharTipoPendienteFirma = null;
function _ficharYaFirmoHoy(empId) {
  const hoyStr = new Date().toISOString().slice(0, 10);
  const fich = fichajesLoad();
  return fich.some(f => f.empId === empId && f.fecha === hoyStr && f.firma);
}
function _ficharFirmaInitCanvas() {
  const canvas = document.getElementById('fichar-firma-canvas');
  if (!canvas) return;
  // Ajustar resolución interna al tamaño real en pantalla, para que el trazo no se vea pixelado
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.strokeStyle = '#3D1F0D';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  _ficharFirmaCtx = ctx;
  _ficharFirmaTieneTrazo = false;

  const getPos = e => {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };
  const start = e => {
    e.preventDefault();
    _ficharFirmaDibujando = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const move = e => {
    if (!_ficharFirmaDibujando) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    _ficharFirmaTieneTrazo = true;
  };
  const end = () => { _ficharFirmaDibujando = false; };

  // Evitar duplicar listeners si se vuelve a entrar a la pantalla
  canvas.onpointerdown = start;
  canvas.onpointermove = move;
  canvas.onpointerup = end;
  canvas.onpointerleave = end;
}
function ficharFirmaBorrar() {
  const canvas = document.getElementById('fichar-firma-canvas');
  if (!canvas || !_ficharFirmaCtx) return;
  _ficharFirmaCtx.clearRect(0, 0, canvas.width, canvas.height);
  _ficharFirmaTieneTrazo = false;
  document.getElementById('fichar-firma-error').style.display = 'none';
}
function ficharFirmaConfirmar() {
  if (!_ficharFirmaTieneTrazo) {
    document.getElementById('fichar-firma-error').style.display = 'block';
    return;
  }
  const canvas = document.getElementById('fichar-firma-canvas');
  const firmaDataUrl = canvas.toDataURL('image/png');
  const tipo = _ficharTipoPendienteFirma;
  _ficharTipoPendienteFirma = null;
  document.getElementById('fichar-firma-view').style.display = 'none';
  document.getElementById('fichar-emp-view').style.display = 'block';
  ficharRegistrar(tipo, firmaDataUrl);
}
function ficharMostrarFirmaSiHaceFalta(tipo) {
  if (!_ficharEmpActivo) return false;
  if (tipo !== 'entrada') return false; // solo se pide al fichar la primera entrada del día
  if (_ficharYaFirmoHoy(_ficharEmpActivo.id)) return false;
  _ficharTipoPendienteFirma = tipo;
  document.getElementById('fichar-emp-view').style.display = 'none';
  document.getElementById('fichar-firma-view').style.display = 'block';
  document.getElementById('fichar-firma-saludo').textContent = 'Hola, ' + _ficharEmpActivo.nombre.split(' ')[0];
  document.getElementById('fichar-firma-error').style.display = 'none';
  setTimeout(_ficharFirmaInitCanvas, 50); // pequeño delay para que el canvas ya tenga su tamaño real en pantalla
  return true;
}
function ficharRegistrar(tipo, firmaDataUrl) {
  if (!_ficharEmpActivo) {
    alert('Error: no hay empleado activo');
    return;
  }
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10);
  const hora = ahora.toTimeString().slice(0, 5);
  const fich = fichajesLoad();
  // Guardia: evitar doble entrada o doble salida consecutiva
  const suyosHoy = fich.filter(f => f.empId === _ficharEmpActivo.id && f.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora));
  const ultimoTipo = suyosHoy.length > 0 ? suyosHoy[suyosHoy.length - 1].tipo : null;
  if (tipo === 'entrada' && ultimoTipo === 'entrada') {
    alert('Ya tienes una entrada registrada. Registra primero la salida.');
    return;
  }
  if (tipo === 'salida' && ultimoTipo !== 'entrada') {
    alert('No tienes una entrada activa. Registra primero la entrada.');
    return;
  }
  // Calcular horaOficial según contrato del empleado
  const horaReal = hora;
  let horaOficial = hora;
  const empActivo = _ficharEmpActivo;
  if (empActivo) {
    if (tipo === 'entrada') {
      // Usar hora de entrada del turno correspondiente
      if (empActivo.manIn && empActivo.tarIn) {
        // Tiene ambos turnos — elegir el más cercano a la hora real
        const [mh, mm] = empActivo.manIn.split(':').map(Number);
        const [th, tm] = empActivo.tarIn.split(':').map(Number);
        const realMin = ahora.getHours() * 60 + ahora.getMinutes();
        const diffMan = Math.abs(realMin - (mh * 60 + mm));
        const diffTar = Math.abs(realMin - (th * 60 + tm));
        horaOficial = diffMan <= diffTar ? empActivo.manIn : empActivo.tarIn;
      } else if (empActivo.tarIn) {
        horaOficial = empActivo.tarIn;
      } else if (empActivo.manIn) {
        horaOficial = empActivo.manIn;
      }
    } else {
      // Salida
      if (empActivo.manOut && empActivo.tarOut) {
        const [mh, mm] = empActivo.manOut.split(':').map(Number);
        const [th, tm] = empActivo.tarOut.split(':').map(Number);
        const realMin = ahora.getHours() * 60 + ahora.getMinutes();
        const diffMan = Math.abs(realMin - (mh * 60 + mm));
        const diffTar = Math.abs(realMin - (th * 60 + tm));
        horaOficial = diffMan <= diffTar ? empActivo.manOut : empActivo.tarOut;
      } else if (empActivo.tarOut) {
        horaOficial = empActivo.tarOut;
      } else if (empActivo.manOut) {
        horaOficial = empActivo.manOut;
      }
    }
  }

  fich.push({
    empId: _ficharEmpActivo.id,
    fecha,
    hora: horaOficial,
    horaReal,
    tipo,
    ...(firmaDataUrl ? { firma: firmaDataUrl } : {})
  });
  fichajesSave(fich);

  // Mostrar confirmación
  document.getElementById('fichar-emp-view').style.display = 'none';
  document.getElementById('fichar-ok-view').style.display = 'block';
  document.getElementById('fichar-ok-icon').textContent = tipo === 'entrada' ? '🟢' : '🔴';
  document.getElementById('fichar-ok-msg').textContent = tipo === 'entrada' ? '¡Entrada registrada!' : '¡Salida registrada!';
  const fechaLabel = ahora.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  document.getElementById('fichar-ok-hora').textContent = fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1) + ' · ' + hora;
}
function ficharVolverEmp() {
  ficharMostrarVista(_ficharEmpActivo);
}
function ficharCerrarSesion() {
  _ficharEmpActivo = null;
  ficharIrVistaPIN();
}

// ── Datos empresa ───────────────────────────────────────────────────────────
function empCargarEmpresaUI() {
  const eEl = document.getElementById('emp-empresa-input');
  const cEl = document.getElementById('emp-cif-input');
  if (eEl) eEl.value = getEmpEmpresa();
  if (cEl) cEl.value = getEmpCIF();
}
function empGuardarEmpresa() {
  const empresa = document.getElementById('emp-empresa-input').value.trim();
  const cif = document.getElementById('emp-cif-input').value.trim();
  localStorage.setItem(EMP_EMPRESA_KEY, empresa);
  localStorage.setItem(EMP_CIF_KEY, cif);
  if (window.fb_saveEmpresa) window.fb_saveEmpresa(empresa, cif).catch(() => {});
  const ok = document.getElementById('emp-empresa-ok');
  if (ok) {
    ok.style.display = 'block';
    setTimeout(() => ok.style.display = 'none', 2000);
  }
  logActivity('🏢 Datos empresa actualizados');
}

// ── Borrar fichajes por fecha ────────────────────────────────────────────────
function empBorrarFechaModal() {
  // Rellenar select de empleados
  const sel = document.getElementById('emp-borrar-emp-sel');
  sel.innerHTML = '<option value="">— Todos los empleados —</option>' + empLoadAll().map(e => "<option value=\"".concat(e.id, "\">").concat(e.nombre.split(' ')[0], " ").concat(e.nombre.split(' ')[1] || '', "</option>")).join('');
  // Fecha por defecto: hoy
  document.getElementById('emp-borrar-fecha-input').value = new Date().toISOString().slice(0, 10);
  document.getElementById('emp-borrar-preview').textContent = '';
  document.getElementById('emp-borrar-fecha-modal').style.display = 'flex';
  // Preview en tiempo real
  const update = () => empBorrarFechaPreview();
  document.getElementById('emp-borrar-fecha-input').oninput = update;
  document.getElementById('emp-borrar-emp-sel').onchange = update;
  empBorrarFechaPreview();
}
function empBorrarFechaPreview() {
  const fecha = document.getElementById('emp-borrar-fecha-input').value;
  const empId = document.getElementById('emp-borrar-emp-sel').value;
  const prev = document.getElementById('emp-borrar-preview');
  if (!fecha) {
    prev.textContent = '';
    return;
  }
  const fich = fichajesLoad();
  const cuenta = fich.filter(f => f.fecha === fecha && (!empId || f.empId === empId)).length;
  prev.textContent = cuenta > 0 ? "\u26A0\uFE0F Se borrar\xE1n ".concat(cuenta, " fichaje").concat(cuenta !== 1 ? 's' : '', " de esa fecha.") : '✅ No hay fichajes en esa fecha.';
  prev.style.color = cuenta > 0 ? '#c0392b' : '#27855a';
}
function empBorrarFechaConfirmar() {
  var _empLoadAll$find;
  const fecha = document.getElementById('emp-borrar-fecha-input').value;
  const empId = document.getElementById('emp-borrar-emp-sel').value;
  if (!fecha) {
    alert('Selecciona una fecha');
    return;
  }
  const fich = fichajesLoad();
  const borrar = fich.filter(f => f.fecha === fecha && (!empId || f.empId === empId)).length;
  if (borrar === 0) {
    alert('No hay fichajes en esa fecha.');
    return;
  }
  const quien = empId ? (_empLoadAll$find = empLoadAll().find(e => e.id === empId)) === null || _empLoadAll$find === void 0 ? void 0 : _empLoadAll$find.nombre.split(' ')[0] : 'todos los empleados';
  if (!confirm("\xBFBorrar ".concat(borrar, " fichaje").concat(borrar !== 1 ? 's' : '', " del ").concat(fecha, " de ").concat(quien, "?"))) return;
  const nuevos = fich.filter(f => !(f.fecha === fecha && (!empId || f.empId === empId)));
  fichajesSave(nuevos);
  document.getElementById('emp-borrar-fecha-modal').style.display = 'none';
  empRenderAdmin();
  logActivity("\uD83D\uDDD1\uFE0F Borrados ".concat(borrar, " fichaje").concat(borrar !== 1 ? 's' : '', " del ").concat(fecha).concat(empId ? ' (' + quien + ')' : ''));
}

// ── Migración / comprobación Firebase ──────────────────────────────────────
async function empCheckFirebaseBanner() {
  const banner = document.getElementById('emp-firebase-banner');
  if (!banner) return;
  // Si Firebase no está listo todavía, escondemos el banner y esperamos
  if (!window.fb_loadEmpleados) {
    banner.style.display = 'none';
    return;
  }
  try {
    const fbData = await window.fb_loadEmpleados();
    const localData = empLoadAll();
    // Mostrar banner solo si hay empleados en local pero Firebase está vacío
    if ((!fbData || fbData.length === 0) && localData.length > 0) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  } catch (e) {
    banner.style.display = 'none';
  }
}

// ── Migración PP2 + Stock a Firebase ──
async function pp2MigrarAFirebase() {
  const btn = document.querySelector('#pp2-firebase-banner button');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Subiendo…';
  }
  try {
    const keys = {
      state: 'dpf_pedidos_prov_list',
      custom: 'dpf_pp_custom_items',
      hidden: 'dpf_pp_hidden_items',
      provHab: 'dpf_pp_prov_habitual',
      minimos: 'dpf_pp_minimos',
      historial: 'dpf_pp_historial',
      customProvs: 'dpf_pp_custom_provs',
      order: 'dpf_pp_order'
    };
    const promises = Object.entries(keys).map(_ref4 => {
      let _ref5 = _slicedToArray(_ref4, 2),
        fbKey = _ref5[0],
        lsKey = _ref5[1];
      try {
        const val = JSON.parse(localStorage.getItem(lsKey) || 'null');
        if (val !== null && window.fb_savePP2) return window.fb_savePP2(fbKey, val);
      } catch (e) {}
      return Promise.resolve();
    });
    // También subir historial de stock
    try {
      const stockHist = JSON.parse(localStorage.getItem('dpf_stock_historial') || 'null');
      if (stockHist && window.fb_saveStockHistorial) promises.push(window.fb_saveStockHistorial(stockHist));
    } catch (e) {}
    await Promise.all(promises);
    document.getElementById('pp2-firebase-banner').style.display = 'none';
    alert('✅ Stock y pedidos subidos a Firebase. Ahora tu socio los verá en todos los dispositivos.');
  } catch (e) {
    alert('❌ Error al subir a Firebase: ' + e.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '☁️ Subir a Firebase ahora';
    }
  }
}
async function pp2CheckFirebaseBanner() {
  const banner = document.getElementById('pp2-firebase-banner');
  if (!banner || !window.fb_loadPP2) return;
  try {
    // Comprobar si hay datos en local pero no en Firebase
    const localState = localStorage.getItem('dpf_pedidos_prov_list');
    const localStock = localStorage.getItem('dpf_stock_historial');
    const hasLocal = localState && localState !== '{}' || localStock && localStock !== '[]';
    if (!hasLocal) return; // nada que migrar
    const fbState = await window.fb_loadPP2('state');
    const fbEmpty = !fbState || typeof fbState === 'object' && Object.keys(fbState).length === 0;
    banner.style.display = fbEmpty ? 'block' : 'none';
  } catch (e) {}
}
async function pp2SincronizarStock() {
  const btn = document.getElementById('pp2-sync-stock-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Sincronizando…';
  }
  try {
    if (window.fb_syncPP2toLocal) {
      await window.fb_syncPP2toLocal();
    }
    pp2Render();
    if (btn) {
      btn.textContent = '✅ Sincronizado';
      btn.style.color = '#fff';
      btn.style.background = '#1a7a4a';
      btn.style.border = '2px solid #1a7a4a';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = '📦 Sincronizar stock';
        btn.style.color = '#1a7a4a';
        btn.style.background = 'var(--white)';
        btn.style.border = '2px solid #1a7a4a';
      }, 2000);
    }
  } catch (e) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '📦 Sincronizar stock';
      btn.style.color = '#1a7a4a';
      btn.style.background = 'var(--white)';
    }
    alert('❌ Error al sincronizar: ' + e.message);
  }
}
async function empMigrarAFirebase() {
  const btn = document.querySelector('#emp-firebase-banner button');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Guardando…';
  }
  try {
    const localData = empLoadAll();
    if (!localData.length) {
      alert('No hay empleados en este dispositivo para guardar.');
      return;
    }
    await window.fb_saveEmpleados(localData);
    document.getElementById('emp-firebase-banner').style.display = 'none';
    alert('✅ Empleados guardados en Firebase correctamente. Ya están disponibles en todos los dispositivos.');
  } catch (e) {
    alert('❌ Error al guardar en Firebase: ' + e.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '☁️ Guardar en Firebase ahora';
    }
  }
}

// Cargar sección empleados al activar la pestaña
document.addEventListener('DOMContentLoaded', () => {
  const orig = window.showAdminSection;
  if (orig) window.showAdminSection = function (id, btn) {
    orig(id, btn);
    if (id === 'empleados') {
      setTimeout(empRenderAdmin, 50);
      setTimeout(empCheckFirebaseBanner, 300);
      setTimeout(empCargarEmpresaUI, 50);
    }
  };
});

// Comprobar token fichaje en URL
(function () {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('fichar');
  if (!key) return;
  function abrirFichar() {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => setTimeout(ficharMostrarOverlay, 300));
    } else {
      setTimeout(ficharMostrarOverlay, 300);
    }
  }

  // Primero comprobar localStorage (rápido)
  const saved = getFicharToken();
  if (saved && key === saved) {
    abrirFichar();
    return;
  }

  // Si no está en localStorage, consultar Firebase
  function checkFirebase() {
    if (window._ficharTokenChecked) return;
    if (!window.fb_loadFicharToken) return; // no marcar como checked si aún no está listo
    window._ficharTokenChecked = true;
    window.fb_loadFicharToken().then(function(fbToken) {
      if (fbToken && key === fbToken) {
        localStorage.setItem(EMP_FICHAR_KEY, fbToken); // cachear para futuras visitas
        abrirFichar();
      }
    }).catch(function() {});
  }
  if (window._firebaseReady) {
    checkFirebase();
  } else {
    document.addEventListener('firebaseReady', checkFirebase);
    // Fallback: reintentar varias veces por si firebaseReady ya pasó (especialmente en móvil)
    [1000, 2000, 3000, 5000].forEach(function(ms) {
      setTimeout(function() {
        if (window._firebaseReady && !window._ficharTokenChecked) checkFirebase();
      }, ms);
    });
  }
})();


// ── PANEL BIMBA: EMPLEADOS ─────────────────────────────────────────────────

function bimbaRenderEmpleados() {
  const emps = empLoadAll();

  // Quién trabaja ahora
  const ahoraEl = document.getElementById('bimba-trabajando-ahora');
  if (ahoraEl) {
    const fich = fichajesLoad();
    const hoy = new Date().toISOString().slice(0,10);
    const activos = emps.filter(e => {
      const suyos = fich.filter(f => f.empId === e.id && f.fecha === hoy)
                        .sort((a,b) => (a.horaReal||a.hora).localeCompare(b.horaReal||b.hora));
      return suyos.length && suyos[suyos.length-1].tipo === 'entrada';
    });
    ahoraEl.innerHTML = activos.length
      ? activos.map(e => `<span style="display:inline-block;background:#e8f8ed;color:#27855a;border:1px solid #5ECC76;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:700;margin:2px">${e.nombre.split(' ')[0]}</span>`).join('')
      : '<span style="color:#8A6A4E;font-size:13px">Nadie trabajando ahora mismo</span>';
  }

  // Lista empleados en bimba
  const listaEl = document.getElementById('bimba-emp-lista');
  if (listaEl) {
    const DN = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    listaEl.innerHTML = emps.map(e => `
      <div style="background:${e.deBaja ? '#FDECD5' : '#fff'};border:1.5px solid ${e.deBaja ? '#E8943A' : '#F5E6C8'};border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:160px">
          <div style="font-size:14px;font-weight:700;color:#3D1F0D">${e.nombre}${e.deBaja ? ' <span style="font-size:11px;font-weight:700;color:#C2711A">🛌 DE BAJA</span>' : ''}</div>
          <div style="font-size:11px;color:#8A6A4E;margin-top:2px">DNI: ${e.dni ? e.dni.replace(/./g,(c,i,s)=>i<3||i>=s.length-2?c:'*') : '—'} · PIN: ••••</div>
          <div style="font-size:11px;color:#8A6A4E">${(e.dias||[]).map(d=>DN[d]).join(', ')||'—'}${e.tarIn?' · Tarde: '+e.tarIn+'–'+e.tarOut:''}${e.manIn?' · Mañana: '+e.manIn+'–'+e.manOut:''}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="empToggleBaja('${e.id}')" title="${e.deBaja ? 'Reactivar' : 'Poner de baja temporal'}" style="padding:6px 12px;background:${e.deBaja ? '#166534' : '#FDECD5'};color:${e.deBaja ? '#fff' : '#C2711A'};border:1.5px solid ${e.deBaja ? '#166534' : '#E8943A'};border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">${e.deBaja ? '✅' : '🛌'}</button>
          <button onclick="empEditarModal('${e.id}')" style="padding:6px 12px;background:#FDECD5;color:#C2711A;border:1.5px solid #E8943A;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">✏️</button>
          <button onclick="empEliminar('${e.id}')" style="padding:6px 12px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">🗑️</button>
        </div>
      </div>`).join('');
  }

  // URL fichaje
  const urlEl = document.getElementById('bimba-fichar-url-display');
  if (urlEl) {
    const t = getFicharToken();
    urlEl.textContent = t ? '🔗 ' + _ficharBaseUrl() + '?fichar=' + t : 'Sin token generado';
  }

  // Select historial
  const histSel = document.getElementById('emp-hist-select');
  if (histSel) {
    histSel.innerHTML = '<option value="">— Todos los empleados —</option>' +
      emps.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  }

  // Select TR
  const trSel = document.getElementById('bimba-tr-emp');
  if (trSel) {
    trSel.innerHTML = '<option value="">— Todos —</option>' +
      emps.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  }
  const mesEl = document.getElementById('bimba-tr-mes');
  if (mesEl && !mesEl.value) mesEl.value = new Date().toISOString().slice(0, 7);

  // Registro por meses en bimba
  const regEl = document.getElementById('bimba-registro-meses');
  if (regEl) {
    const fich = fichajesLoad();
    const meses = [...new Set(fich.map(f => f.fecha.slice(0,7)))].sort().reverse();
    regEl.innerHTML = meses.length ? meses.map(mes => {
      const [anio, mesN] = mes.split('-').map(Number);
      const mesLabel = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mesN-1] + ' ' + anio;
      const empIds = [...new Set(fich.filter(f=>f.fecha.startsWith(mes)).map(f=>f.empId))];
      return `<details style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;overflow:hidden">
        <summary style="padding:10px 14px;cursor:pointer;font-size:13px;font-weight:700;color:#3D1F0D;list-style:none;display:flex;justify-content:space-between">
          <span>📁 ${mesLabel}</span><span style="font-size:11px;color:#8A6A4E">${empIds.length} empleado${empIds.length!==1?'s':''}</span>
        </summary>
        <div style="padding:0 14px 12px">${empIds.map(eid => {
          const emp = emps.find(e=>e.id===eid)||{nombre:eid,id:eid};
          return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #F5E6C8">
            <span style="font-size:13px;font-weight:600;color:#2A1506;flex:1">${emp.nombre.split(' ')[0]} ${emp.nombre.split(' ')[1]||''}</span>
            <button onclick="empDescargarMesEmpleado('${eid}','${mes}')" style="padding:4px 10px;background:#3D1F0D;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">📄 Doc</button>
            <button onclick="empVerDetalleRegistro('${eid}','${mes}')" style="padding:4px 10px;background:#FDECD5;color:#C2711A;border:1.5px solid #E8943A;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">👁️ Ver</button>
          </div>`;
        }).join('')}</div>
      </details>`;
    }).join('') : '<p style="font-size:13px;color:#8A6A4E">Sin fichajes registrados</p>';
  }
}

function bimbaRenderTR() {
  const el = document.getElementById('bimba-tr-resultado');
  if (!el) return;
  const fich = fichajesLoad();
  const emps = empLoadAll();
  const empId = document.getElementById('bimba-tr-emp')?.value || '';
  const mes = document.getElementById('bimba-tr-mes')?.value || new Date().toISOString().slice(0, 7);

  let datos = fich.filter(f => f.fecha.startsWith(mes));
  if (empId) datos = datos.filter(f => f.empId === empId);

  if (!datos.length) {
    el.innerHTML = '<p style="color:#8A6A4E;font-size:13px">Sin fichajes en este periodo.</p>';
    return;
  }

  const grupos = {};
  datos.forEach(f => {
    const emp = emps.find(e => e.id === f.empId);
    const nombre = emp ? emp.nombre : f.empId;
    if (!grupos[nombre]) grupos[nombre] = {};
    if (!grupos[nombre][f.fecha]) grupos[nombre][f.fecha] = [];
    grupos[nombre][f.fecha].push(f);
  });

  let html = '';
  Object.entries(grupos).sort(([a],[b]) => a.localeCompare(b)).forEach(([nombre, dias]) => {
    let totalMin = 0;
    html += `<div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px">${nombre}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="border-bottom:1.5px solid #F5E6C8">
            <th style="text-align:left;padding:7px 8px;font-weight:500;color:#8A6A4E;font-size:12px">Día</th>
            <th style="text-align:center;padding:7px 8px;font-weight:500;color:#1D9E75;font-size:12px">Entrada</th>
            <th style="text-align:center;padding:7px 8px;font-weight:500;color:#c0392b;font-size:12px">Salida</th>
            <th style="text-align:right;padding:7px 8px;font-weight:500;color:#8A6A4E;font-size:12px">Horas</th>
          </tr>
        </thead>
        <tbody>`;
    Object.entries(dias).sort(([a],[b]) => a.localeCompare(b)).reverse().forEach(([fecha, fichs]) => {
      const ent = fichs.filter(f => f.tipo === 'entrada');
      const sal = fichs.filter(f => f.tipo === 'salida');
      const entHora = ent.length ? (ent[0].horaReal || ent[0].hora) : '—';
      const salHora = sal.length ? (sal[sal.length-1].horaReal || sal[sal.length-1].hora) : '—';
      let horas = '—';
      if (ent.length && sal.length) {
        const entR = ent[0].horaReal || ent[0].hora;
        const salR = sal[sal.length-1].horaReal || sal[sal.length-1].hora;
        const [eh, em] = entR.split(':').map(Number);
        const [sh, sm] = salR.split(':').map(Number);
        let min = sh * 60 + sm - (eh * 60 + em);
        if (min < 0) min += 24 * 60;
        totalMin += min;
        horas = Math.floor(min/60) + 'h' + (min%60 > 0 ? ' ' + min%60 + 'min' : '');
      }
      const fechaLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'numeric'});
      const manualBadge = fichs.some(f => f.manual) ? '<span style="font-size:10px;background:#e8943a;color:#fff;padding:1px 5px;border-radius:4px;margin-left:4px">manual</span>' : '';
      html += `<tr style="border-bottom:1px solid #F5E6C8">
        <td style="padding:8px;color:#8A6A4E;font-size:12px">${fechaLabel}${manualBadge}</td>
        <td style="padding:8px;text-align:center;font-weight:500;color:#2A1506">${entHora}</td>
        <td style="padding:8px;text-align:center;font-weight:500;color:#2A1506">${salHora}</td>
        <td style="padding:8px;text-align:right;font-weight:500;color:#C2711A">${horas}</td>
      </tr>`;
    });
    const th = Math.floor(totalMin/60), tm = totalMin%60;
    html += `</tbody></table>
      <div style="text-align:right;font-size:12px;font-weight:700;color:#3D1F0D;padding:6px 8px 0">Total: ${th}h${tm > 0 ? ' ' + tm + 'min' : ''}</div>
    </div>`;
  });
  el.innerHTML = html;
}

// Sobrescribir showAdminSection para inicializar bimba-empleados al abrirlo
const _origShowAdminSection = window.showAdminSection;
if (_origShowAdminSection) {
  window.showAdminSection = function(id, btn) {
    _origShowAdminSection(id, btn);
    if (id === 'bimba-empleados') {
      setTimeout(bimbaRenderEmpleados, 50);
    }
    if (id === 'empleados') {
      setTimeout(function(){
        empRenderTrabajandoAhora();
        pepaIniciarHistorial();
      }, 100);
    }
  };
}


// ── PANEL PEPA: HISTORIAL OFICIAL ─────────────────────────────────────────

function pepaIniciarHistorial() {
  const emps = empLoadAll();
  const sel = document.getElementById('pepa-hist-emp');
  if (sel && sel.options.length <= 1) {
    sel.innerHTML = '<option value="">&#8212; Todos &#8212;</option>' +
      emps.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  }
  const mesEl = document.getElementById('pepa-hist-mes');
  if (mesEl && !mesEl.value) mesEl.value = new Date().toISOString().slice(0, 7);
}

function pepaVerHistorial() {
  const el = document.getElementById('pepa-hist-resultado');
  if (!el) return;
  const fich = fichajesLoad();
  const emps = empLoadAll();
  const empId = document.getElementById('pepa-hist-emp')?.value || '';
  const mes = document.getElementById('pepa-hist-mes')?.value || new Date().toISOString().slice(0, 7);

  let datos = fich.filter(f => f.fecha.startsWith(mes));
  if (empId) datos = datos.filter(f => f.empId === empId);
  if (!datos.length) { el.innerHTML = '<p style="font-size:13px;color:#8A6A4E">Sin fichajes en este periodo.</p>'; return; }

  // Agrupar por empleado y día usando horaOficial (campo hora)
  const grupos = {};
  datos.forEach(f => {
    const emp = emps.find(e => e.id === f.empId);
    const nombre = emp ? emp.nombre : f.empId;
    if (!grupos[nombre]) grupos[nombre] = {};
    if (!grupos[nombre][f.fecha]) grupos[nombre][f.fecha] = [];
    grupos[nombre][f.fecha].push(f);
  });

  let html = '';
  Object.entries(grupos).sort(([a],[b]) => a.localeCompare(b)).forEach(([nombre, dias]) => {
    html += `<div style="margin-bottom:14px">
      <div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:6px">${nombre}</div>`;
    let totalMin = 0;
    Object.entries(dias).sort(([a],[b]) => a.localeCompare(b)).forEach(([fecha, fichs]) => {
      const fechaLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'short'});
      const entradas = fichs.filter(f => f.tipo === 'entrada').map(f => f.hora);
      const salidas  = fichs.filter(f => f.tipo === 'salida').map(f => f.hora);
      let horasLabel = '';
      if (entradas.length && salidas.length) {
        const [eh, em] = entradas[0].split(':').map(Number);
        const [sh, sm] = salidas[salidas.length-1].split(':').map(Number);
        let d = (sh * 60 + sm) - (eh * 60 + em);
        if (d < 0) d += 1440;
        totalMin += d;
        horasLabel = `${Math.floor(d/60)}h${d%60>0?' '+d%60+'min':''}`;
      }
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#fff;border:1px solid #F5E6C8;border-radius:6px;margin-bottom:4px;font-size:12px">
        <span style="color:#8A6A4E;min-width:80px">${fechaLabel}</span>
        <span style="color:#27855a">${entradas[0] || '—'}</span>
        <span style="color:#8A6A4E">→</span>
        <span style="color:#c0392b">${salidas[salidas.length-1] || '—'}</span>
        ${horasLabel ? `<span style="margin-left:auto;font-weight:700;color:#3D1F0D">${horasLabel}</span>` : ''}
      </div>`;
    });
    const th = Math.floor(totalMin/60), tm = totalMin%60;
    html += `<div style="font-size:11px;color:#8A6A4E;text-align:right;margin-top:2px">Total: ${th}h${tm>0?' '+tm+'min':''}</div></div>`;
  });
  el.innerHTML = html;
}

function pepaGenerarDocumento() {
  // Reutilizar la función de bimba — apuntar los selects al mismo empleado/mes
  const empId = document.getElementById('pepa-hist-emp')?.value || '';
  const mes   = document.getElementById('pepa-hist-mes')?.value || new Date().toISOString().slice(0, 7);
  const histSel = document.getElementById('emp-hist-select');
  const histMes = document.getElementById('emp-hist-mes');
  if (histSel) histSel.value = empId;
  if (histMes) histMes.value = mes;
  if (typeof empGenerarDocumento === 'function') empGenerarDocumento();
}

function bimbaIrAEmail() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById('admin-config');
  if (s) { s.style.setProperty('display','block','important'); s.classList.add('active'); }
  if (typeof loadAdminConfig === 'function') loadAdminConfig();
}

function bimbaIrAContrasena() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById('admin-pwd');
  if (s) { s.style.setProperty('display','block','important'); s.classList.add('active'); }
}

function bimbaIrAAccesos() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById('admin-accesos');
  if (s) { s.style.setProperty('display','block','important'); s.classList.add('active'); }
  if (typeof renderActiveSessionsList === 'function') renderActiveSessionsList();
}

function switchAccesosTab(tab) {
  const tabs = { sesiones: 'atab-sesiones', intentos: 'atab-intentos', actividad: 'atab-actividad' };
  const panels = { sesiones: 'accesos-tab-sesiones', intentos: 'accesos-tab-intentos', actividad: 'accesos-tab-actividad' };
  Object.keys(tabs).forEach(function(k) {
    const btn = document.getElementById(tabs[k]);
    const panel = document.getElementById(panels[k]);
    if (!btn || !panel) return;
    if (k === tab) {
      btn.style.borderBottomColor = '#3D1F0D';
      btn.style.color = '#3D1F0D';
      btn.style.fontWeight = '700';
      panel.style.display = 'block';
    } else {
      btn.style.borderBottomColor = 'transparent';
      btn.style.color = '#8A6A4E';
      btn.style.fontWeight = '600';
      panel.style.display = 'none';
    }
  });
  if (tab === 'sesiones' && typeof renderActiveSessionsList === 'function') renderActiveSessionsList();
  if (tab === 'intentos' && typeof renderAccesosLog === 'function') renderAccesosLog();
  if (tab === 'actividad' && typeof renderActivityLog === 'function') renderActivityLog();
}

function bimbaIrAEmpleados() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById('admin-bimba-empleados');
  if (s) { s.style.setProperty('display','block','important'); s.classList.add('active'); }
  bimbaRenderEmpleados();
}

function bimbaVolverAlPanel() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById('admin-stock-config');
  if (s) { s.style.setProperty('display','block','important'); s.classList.add('active'); }
  setTimeout(function(){ if(typeof dcCargar==='function') dcCargar(); }, 100);
}

// ── PROMOS BIMBA ──
function bimbaRenderPromos() {
  var el = document.getElementById('bimba-promos-lista');
  if (!el) return;
  var promos = JSON.parse(localStorage.getItem('dpf_promos') || '[]');
  if (!promos.length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E;padding:8px 0">No hay promociones. Crea una.</div>';
    return;
  }
  el.innerHTML = promos.map(function(p) {
    return '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px">' +
      '<div style="flex:1">' +
      '<div style="font-size:13px;font-weight:700;color:#3D1F0D">' + p.nombre + '</div>' +
      '<div style="font-size:11px;color:#8A6A4E">' + (p.descripcion || '') + ' · ' + parseFloat(p.precio).toFixed(2) + ' €</div>' +
      '</div>' +
      '<button onclick="bimbaTogglePromo(\'' + p.id + '\')" style="padding:4px 10px;background:' + (p.visible ? '#f0fdf4' : '#fff1f2') + ';color:' + (p.visible ? '#166534' : '#991b1b') + ';border:1.5px solid ' + (p.visible ? '#bbf7d0' : '#fecdd3') + ';border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">' + (p.visible ? 'Visible' : 'Oculta') + '</button>' +
      '<button onclick="bimbaEditarPromo(\'' + p.id + '\')" style="padding:4px 8px;background:#FDECD5;color:#C2711A;border:1.5px solid #E8943A;border-radius:8px;font-size:11px;cursor:pointer">✏️</button>' +
      '<button onclick="bimbaEliminarPromo(\'' + p.id + '\')" style="padding:4px 8px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:11px;cursor:pointer">🗑️</button>' +
      '</div>';
  }).join('');
}

function bimbaTogglePromo(id) {
  var promos = JSON.parse(localStorage.getItem('dpf_promos') || '[]');
  var p = promos.find(function(x) { return x.id === id; });
  if (p) { p.visible = !p.visible; if(typeof promosSave === 'function') promosSave(promos); bimbaRenderPromos(); }
}

function bimbaEliminarPromo(id) {
  if (!confirm('¿Eliminar esta promoción?')) return;
  var promos = JSON.parse(localStorage.getItem('dpf_promos') || '[]').filter(function(p) { return p.id !== id; });
  if(typeof promosSave === 'function') promosSave(promos);
  bimbaRenderPromos();
}

function bimbaEditarPromo(id) {
  var promos = JSON.parse(localStorage.getItem('dpf_promos') || '[]');
  var p = promos.find(function(x) { return x.id === id; });
  if (!p) return;
  document.getElementById('bimba-promo-edit-id').value = p.id;
  document.getElementById('bimba-promo-nombre').value = p.nombre;
  document.getElementById('bimba-promo-desc').value = p.descripcion || '';
  document.getElementById('bimba-promo-precio').value = p.precio;
  document.getElementById('bimba-promo-antes').value = p.precioAntes || '';
  document.getElementById('bimba-promo-queso').checked = p.opcionQueso || false;
  document.getElementById('bimba-promo-gratinado').checked = p.opcionGratinado || false;
  document.getElementById('bimba-promo-nota').checked = p.opcionNota || false;
  document.getElementById('bimba-promo-form').style.display = 'block';
}

function bimbaPromoNueva() {
  document.getElementById('bimba-promo-edit-id').value = '';
  document.getElementById('bimba-promo-nombre').value = '';
  document.getElementById('bimba-promo-desc').value = '';
  document.getElementById('bimba-promo-precio').value = '';
  document.getElementById('bimba-promo-antes').value = '';
  ['bimba-promo-queso','bimba-promo-gratinado','bimba-promo-nota'].forEach(function(id) {
    document.getElementById(id).checked = false;
  });
  document.getElementById('bimba-promo-form').style.display = 'block';
}

function bimbaGuardarPromo() {
  var nombre = document.getElementById('bimba-promo-nombre').value.trim();
  var precio = parseFloat(document.getElementById('bimba-promo-precio').value);
  if (!nombre || isNaN(precio)) { alert('Nombre y precio son obligatorios'); return; }
  var promos = JSON.parse(localStorage.getItem('dpf_promos') || '[]');
  var editId = document.getElementById('bimba-promo-edit-id').value;
  var promo = {
    id: editId || 'promo_' + Date.now(),
    nombre: nombre,
    descripcion: document.getElementById('bimba-promo-desc').value.trim(),
    precio: precio,
    precioAntes: document.getElementById('bimba-promo-antes').value ? parseFloat(document.getElementById('bimba-promo-antes').value) : null,
    opcionQueso: document.getElementById('bimba-promo-queso').checked,
    opcionGratinado: document.getElementById('bimba-promo-gratinado').checked,
    opcionNota: document.getElementById('bimba-promo-nota').checked,
    visible: true
  };
  if (editId) {
    var idx = promos.findIndex(function(p) { return p.id === editId; });
    if (idx >= 0) promos[idx] = promo; else promos.push(promo);
  } else {
    promos.push(promo);
  }
  if(typeof promosSave === 'function') promosSave(promos);
  document.getElementById('bimba-promo-form').style.display = 'none';
  bimbaRenderPromos();
}



function ficharManualRegistrar(tipo) {
  const fecha = document.getElementById('fichar-manual-fecha').value;
  const hora  = document.getElementById('fichar-manual-hora').value;
  const msg   = document.getElementById('fichar-manual-msg');
  if (!fecha || !hora) { msg.textContent = '⚠️ Pon fecha y hora'; msg.style.color='#c0392b'; msg.style.display='block'; return; }
  if (!_ficharEmpActivo) return;
  const fich = fichajesLoad();
  fich.push({ empId: _ficharEmpActivo.id, fecha, hora, tipo, manual: true });
  fichajesSave(fich);
  msg.textContent = '✅ ' + (tipo==='entrada'?'Entrada':'Salida') + ' registrada el ' + fecha + ' a las ' + hora;
  msg.style.color = '#27855a';
  msg.style.display = 'block';
  // Limpiar campos
  document.getElementById('fichar-manual-fecha').value = '';
  document.getElementById('fichar-manual-hora').value = '';
  // Refrescar vista
  setTimeout(() => { ficharMostrarVista(_ficharEmpActivo); }, 500);
}
