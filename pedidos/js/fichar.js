"use strict";
/* ═══════════════════════════════════════════════════
   Pantalla de fichar — independiente del resto de la web.
   Habla con fichar-pin-check.php en vez de leer Firebase
   directamente, para no tener que exponer la lista completa
   de empleados (DNI, teléfono, PIN) al navegador.
   ═══════════════════════════════════════════════════ */

let _ficharPin = '';
let _ficharEmpActivo = null; // { empId, nombre, manIn, manOut, tarIn, tarOut }
let _ficharHistorialCache = [];

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

async function ficharPinOk() {
  try {
    const res = await fetch('fichar-pin-check.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', pin: _ficharPin })
    });
    const data = await res.json();
    if (!data.success) {
      document.getElementById('fichar-pin-error').style.display = 'block';
      _ficharPin = '';
      ficharActualizarDots();
      return;
    }
    _ficharEmpActivo = data;
    await ficharMostrarVista(data);
  } catch (e) {
    document.getElementById('fichar-pin-error').textContent = 'Error de conexión. Inténtalo de nuevo.';
    document.getElementById('fichar-pin-error').style.display = 'block';
    _ficharPin = '';
    ficharActualizarDots();
  }
}

async function ficharMostrarVista(emp) {
  document.getElementById('fichar-pin-view').style.display = 'none';
  document.getElementById('fichar-emp-view').style.display = 'block';
  document.getElementById('fichar-ok-view').style.display = 'none';

  document.getElementById('fichar-emp-saludo').textContent = 'Hola, ' + emp.nombre.split(' ')[0] + ' 👋';
  const hoy = new Date();
  const hoyStr = hoy.toISOString().slice(0, 10);
  const hoyLabel = hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('fichar-fecha-hoy').textContent = hoyLabel.charAt(0).toUpperCase() + hoyLabel.slice(1);

  // Pedir el historial de este empleado al servidor
  let fich = [];
  try {
    const res = await fetch('fichar-pin-check.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'historial', sessionToken: emp.sessionToken })
    });
    const data = await res.json();
    if (data.success) fich = data.fichajes || [];
  } catch (e) { /* si falla, mostramos con lo que haya */ }
  _ficharHistorialCache = fich;

  const suyosHoy = fich.filter(f => f.fecha === hoyStr).sort((a, b) => a.hora.localeCompare(b.hora));
  const dentro = suyosHoy.length > 0 && suyosHoy[suyosHoy.length - 1].tipo === 'entrada';
  document.getElementById('fichar-emp-estado').textContent = dentro ? '🟢 Estás trabajando' : '⚪ No has fichado entrada hoy';

  const btnE = document.getElementById('fichar-btn-entrada');
  const btnS = document.getElementById('fichar-btn-salida');
  btnE.style.opacity = dentro ? '0.5' : '1';
  btnS.style.opacity = dentro ? '1' : '0.5';

  const mes = hoy.toISOString().slice(0, 7);
  const porDia = {};
  fich.filter(f => f.fecha.startsWith(mes)).forEach(f => {
    if (!porDia[f.fecha]) porDia[f.fecha] = { e: [], s: [] };
    if (f.tipo === 'entrada') porDia[f.fecha].e.push(f.hora); else porDia[f.fecha].s.push(f.hora);
  });
  let totalMin = 0, dias = new Set();
  Object.keys(porDia).forEach(fecha => {
    const { e, s } = porDia[fecha];
    if (e.length && s.length) {
      dias.add(fecha);
      const [eh, em] = e[0].split(':').map(Number);
      const [sh, sm] = s[s.length - 1].split(':').map(Number);
      let diff = sh * 60 + sm - (eh * 60 + em);
      if (diff < 0) diff += 24 * 60;
      totalMin += diff;
    }
  });
  const th = Math.floor(totalMin / 60), tm = totalMin % 60;
  const mesN = hoy.toLocaleString('es-ES', { month: 'long' });
  document.getElementById('fichar-resumen-mes').innerHTML =
    '<b>' + mesN.charAt(0).toUpperCase() + mesN.slice(1) + ':</b><br>' +
    'Días trabajados: <b>' + dias.size + '</b><br>' +
    'Horas totales: <b>' + th + 'h' + (tm > 0 ? ' ' + tm + 'min' : '') + '</b>';

  const rec = [...fich].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 8);
  document.getElementById('fichar-historial-reciente').innerHTML = rec.length
    ? rec.map(f => '<div>' + f.fecha.slice(5).replace('-', '/') + ' ' + f.hora + ' — ' + (f.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Salida') + '</div>').join('')
    : '<span style="color:var(--muted)">Sin fichajes recientes</span>';
}

// ── Firma con el dedo (una vez al día, antes de la primera entrada) ──
let _ficharFirmaCtx = null;
let _ficharFirmaDibujando = false;
let _ficharFirmaTieneTrazo = false;
let _ficharTipoPendienteFirma = null;

function _ficharYaFirmoHoy() {
  const hoyStr = new Date().toISOString().slice(0, 10);
  return _ficharHistorialCache.some(f => f.fecha === hoyStr && f.firma);
}
function _ficharFirmaInitCanvas() {
  const canvas = document.getElementById('fichar-firma-canvas');
  if (!canvas) return;
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
  const start = e => { e.preventDefault(); _ficharFirmaDibujando = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
  const move = e => { if (!_ficharFirmaDibujando) return; e.preventDefault(); const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); _ficharFirmaTieneTrazo = true; };
  const end = () => { _ficharFirmaDibujando = false; };

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
  if (tipo !== 'entrada') return false;
  if (_ficharYaFirmoHoy()) return false;
  _ficharTipoPendienteFirma = tipo;
  document.getElementById('fichar-emp-view').style.display = 'none';
  document.getElementById('fichar-firma-view').style.display = 'block';
  document.getElementById('fichar-firma-saludo').textContent = 'Hola, ' + _ficharEmpActivo.nombre.split(' ')[0];
  document.getElementById('fichar-firma-error').style.display = 'none';
  setTimeout(_ficharFirmaInitCanvas, 50);
  return true;
}

async function ficharRegistrar(tipo, firmaDataUrl) {
  if (!_ficharEmpActivo) {
    alert('Error: no hay empleado activo');
    return;
  }
  try {
    const res = await fetch('fichar-pin-check.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'registrar', sessionToken: _ficharEmpActivo.sessionToken, tipo, firma: firmaDataUrl || undefined })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'No se pudo registrar el fichaje.');
      return;
    }
    document.getElementById('fichar-emp-view').style.display = 'none';
    document.getElementById('fichar-ok-view').style.display = 'block';
    document.getElementById('fichar-ok-icon').textContent = tipo === 'entrada' ? '🟢' : '🔴';
    document.getElementById('fichar-ok-msg').textContent = tipo === 'entrada' ? '¡Entrada registrada!' : '¡Salida registrada!';
    const ahora = new Date();
    const fechaLabel = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('fichar-ok-hora').textContent = fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1) + ' · ' + data.hora;
  } catch (e) {
    alert('Error de conexión. Inténtalo de nuevo.');
  }
}
function ficharVolverEmp() {
  ficharMostrarVista(_ficharEmpActivo);
}
function ficharCerrarSesion() {
  _ficharEmpActivo = null;
  ficharIrVistaPIN();
}

// ── Comprobar el token del enlace (?fichar=...) contra el servidor ──
(function () {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('fichar');
  if (!key) {
    document.getElementById('fichar-no-token').style.display = 'block';
    return;
  }
  fetch('fichar-pin-check.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkToken', token: key })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        ficharMostrarOverlay();
      } else {
        document.getElementById('fichar-no-token').style.display = 'block';
      }
    })
    .catch(() => {
      document.getElementById('fichar-no-token').style.display = 'block';
    });
})();
