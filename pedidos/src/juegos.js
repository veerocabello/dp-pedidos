// ═══════════════════════════════════════════════════════════
//  RULETA DE PREMIOS / RASCA Y GANA — PANEL DE ADMIN
//
//  El juego en sí (jugar, dibujar la ruleta/rasca, aplicar el premio)
//  vive en nucleo-compartido.js (bundle de cliente). Aquí solo queda la
//  configuración de premios/activación que usa el panel de admin.
// ═══════════════════════════════════════════════════════════

// ── ADMIN: PANEL DE CONFIGURACIÓN ──────────────────────────────────────
let _ruletaAdminPremios = [];
let _rascaAdminPremios = [];

function _premioId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function _renderPremiosAdmin(listaId, premios) {
  const cont = document.getElementById(listaId);
  if (!cont) return;
  cont.innerHTML = premios.map((p, i) => (
    '<div id="premio-row-' + p.id + '" style="display:flex;gap:6px;align-items:center;background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:8px">' +
      '<input value="' + (p.emoji || '').replace(/"/g, '&quot;') + '" data-i="' + i + '" data-f="emoji" style="width:38px;text-align:center;padding:6px 4px;border:1px solid var(--warm);border-radius:6px;font-size:16px" maxlength="4">' +
      '<input value="' + (p.nombre || '').replace(/"/g, '&quot;') + '" data-i="' + i + '" data-f="nombre" placeholder="Nombre (ej. 10% descuento)" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--warm);border-radius:6px;font-size:12px">' +
      '<input value="' + (p.pct != null ? p.pct : 0) + '" data-i="' + i + '" data-f="pct" type="number" min="0" max="100" title="% de descuento (0 = sin premio)" style="width:52px;padding:6px 4px;border:1px solid var(--warm);border-radius:6px;font-size:12px">' +
      '<input value="' + (p.peso != null ? p.peso : 1) + '" data-i="' + i + '" data-f="peso" type="number" min="0" title="Peso (probabilidad relativa)" style="width:48px;padding:6px 4px;border:1px solid var(--warm);border-radius:6px;font-size:12px">' +
      '<button data-i="' + i + '" class="premio-del-btn" title="Eliminar" style="background:#fdecea;color:#c0392b;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:13px">✕</button>' +
    '</div>'
  )).join('') || '<div style="font-size:12px;color:var(--muted);text-align:center;padding:10px">Sin premios todavía — añade el primero.</div>';

  cont.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = parseInt(inp.dataset.i, 10), f = inp.dataset.f;
      const arr = listaId === 'ruleta-admin-lista' ? _ruletaAdminPremios : _rascaAdminPremios;
      if (!arr[i]) return;
      arr[i][f] = (f === 'pct' || f === 'peso') ? parseFloat(inp.value) || 0 : inp.value;
    });
  });
  cont.querySelectorAll('.premio-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      if (listaId === 'ruleta-admin-lista') { _ruletaAdminPremios.splice(i, 1); _renderPremiosAdmin(listaId, _ruletaAdminPremios); }
      else { _rascaAdminPremios.splice(i, 1); _renderPremiosAdmin(listaId, _rascaAdminPremios); }
    });
  });
}

// Resume los giros/rascados de hoy: total, cuántos tuvieron descuento de
// verdad (lo que cuenta contra el tope diario) y un desglose por premio —
// para que el admin vea de un vistazo cuánta gente juega y qué se lleva,
// sin tener que ir a mirar Firebase directamente.
function _resumenGirosHoy(giros) {
  const lista = Object.values(giros || {}).filter(g => g && g.premio);
  const total = lista.length;
  let conDescuento = 0;
  const porPremio = {};
  lista.forEach(g => {
    const nombre = g.premio.nombre || '?';
    porPremio[nombre] = (porPremio[nombre] || 0) + 1;
    if ((g.premio.pct || 0) > 0) conDescuento++;
  });
  return { total, conDescuento, porPremio };
}
function _pintarResumenHoy(elId, resumen, tope) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (resumen.total === 0) {
    el.innerHTML = 'Todavía nadie ha jugado hoy.';
    return;
  }
  const desglose = Object.entries(resumen.porPremio)
    .map(([nombre, n]) => n + '× ' + nombre)
    .join(' · ');
  const topeTxt = tope > 0
    ? '<br><b>' + resumen.conDescuento + ' / ' + tope + '</b> premios con descuento entregados hoy' + (resumen.conDescuento >= tope ? ' — <span style="color:#c0392b;font-weight:700">tope alcanzado, solo queda "sin premio" hasta mañana</span>' : '')
    : '';
  el.innerHTML = '<b>' + resumen.total + '</b> jugada' + (resumen.total === 1 ? '' : 's') + ' hoy: ' + desglose + topeTxt;
}

async function renderRuletaAdmin() {
  const cfg = window.fb_loadRuletaConfig ? await window.fb_loadRuletaConfig().catch(() => null) : null;
  _ruletaAdminPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios.map(p => Object.assign({}, p)) : [];
  document.getElementById('ruleta-admin-activa').checked = !!(cfg && cfg.activa);
  _actualizarTrack('ruleta-admin-toggle-track', !!(cfg && cfg.activa));
  document.getElementById('ruleta-admin-tope').value = (cfg && cfg.topeDiario) || '';
  _renderPremiosAdmin('ruleta-admin-lista', _ruletaAdminPremios);
  document.getElementById('ruleta-admin-stats').textContent = (_ruletaAdminPremios.length) + ' premio' + (_ruletaAdminPremios.length === 1 ? '' : 's') + ' configurado' + (_ruletaAdminPremios.length === 1 ? '' : 's');
  if (window.fb_loadRuletaGiros) {
    const todayKey = new Date().toISOString().slice(0, 10);
    window.fb_loadRuletaGiros(todayKey).then(giros => {
      _pintarResumenHoy('ruleta-admin-hoy', _resumenGirosHoy(giros), (cfg && cfg.topeDiario) || 0);
    }).catch(() => {});
  }
}
function ruletaAdminAddPremio() {
  _ruletaAdminPremios.push({ id: _premioId(), emoji: '🎁', nombre: '', pct: 10, peso: 1 });
  _renderPremiosAdmin('ruleta-admin-lista', _ruletaAdminPremios);
}
function _ruletaTopeActual() {
  const inp = document.getElementById('ruleta-admin-tope');
  const v = inp ? parseInt(inp.value, 10) : 0;
  return (v > 0) ? v : 0;
}
async function ruletaAdminGuardar() {
  const activa = document.getElementById('ruleta-admin-activa').checked;
  const premios = _ruletaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  const topeDiario = _ruletaTopeActual();
  if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa, premios, topeDiario });
  logActivity('🎡 Configuración de la ruleta actualizada (' + premios.length + ' premios' + (topeDiario ? ', tope ' + topeDiario + '/día' : '') + ')');
  showToast('ruleta-config-toast');
}
async function ruletaAdminToggleActiva(checked) {
  _actualizarTrack('ruleta-admin-toggle-track', checked);
  const premios = _ruletaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa: checked, premios, topeDiario: _ruletaTopeActual() });
  logActivity(checked ? '🎡 Ruleta activada' : '🎡 Ruleta desactivada');
}

async function renderRascaAdmin() {
  const cfg = window.fb_loadRascaConfig ? await window.fb_loadRascaConfig().catch(() => null) : null;
  _rascaAdminPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios.map(p => Object.assign({}, p)) : [];
  document.getElementById('rasca-admin-activa').checked = !!(cfg && cfg.activa);
  _actualizarTrack('rasca-admin-toggle-track', !!(cfg && cfg.activa));
  document.getElementById('rasca-admin-tope').value = (cfg && cfg.topeDiario) || '';
  _renderPremiosAdmin('rasca-admin-lista', _rascaAdminPremios);
  document.getElementById('rasca-admin-stats').textContent = (_rascaAdminPremios.length) + ' premio' + (_rascaAdminPremios.length === 1 ? '' : 's') + ' configurado' + (_rascaAdminPremios.length === 1 ? '' : 's');
  if (window.fb_loadRascaGiros) {
    const todayKey = new Date().toISOString().slice(0, 10);
    window.fb_loadRascaGiros(todayKey).then(giros => {
      _pintarResumenHoy('rasca-admin-hoy', _resumenGirosHoy(giros), (cfg && cfg.topeDiario) || 0);
    }).catch(() => {});
  }
}
function rascaAdminAddPremio() {
  _rascaAdminPremios.push({ id: _premioId(), emoji: '🎁', nombre: '', pct: 10, peso: 1 });
  _renderPremiosAdmin('rasca-admin-lista', _rascaAdminPremios);
}
function _rascaTopeActual() {
  const inp = document.getElementById('rasca-admin-tope');
  const v = inp ? parseInt(inp.value, 10) : 0;
  return (v > 0) ? v : 0;
}
async function rascaAdminGuardar() {
  const activa = document.getElementById('rasca-admin-activa').checked;
  const premios = _rascaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  const topeDiario = _rascaTopeActual();
  if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa, premios, topeDiario });
  logActivity('🎫 Configuración del rasca actualizada (' + premios.length + ' premios' + (topeDiario ? ', tope ' + topeDiario + '/día' : '') + ')');
  showToast('rasca-config-toast');
}
async function rascaAdminToggleActiva(checked) {
  _actualizarTrack('rasca-admin-toggle-track', checked);
  const premios = _rascaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa: checked, premios, topeDiario: _rascaTopeActual() });
  logActivity(checked ? '🎫 Rasca y gana activado' : '🎫 Rasca y gana desactivado');
}

function _actualizarTrack(id, activo) {
  const el = document.getElementById(id);
  if (el) el.style.background = activo ? 'var(--brown)' : '#ccc';
}

async function guardarJuegoActivo(juego) {
  if (window.fb_saveJuegoActivo) await window.fb_saveJuegoActivo(juego);
  window._juegoActivoActual = juego;
  _actualizarJuegoFab(juego);
  const nombres = { ruleta: 'Ruleta de premios', rasca: 'Rasca y gana', ninguno: 'Ninguno' };
  logActivity('🎮 Juego activo para clientes: ' + (nombres[juego] || juego));
}
