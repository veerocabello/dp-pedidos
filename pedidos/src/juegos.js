// ═══════════════════════════════════════════════════════════
//  RULETA DE PREMIOS / RASCA Y GANA
//
//  El premio lo decide juegos.php (cuenta de servicio) — este archivo
//  solo pide "quiero girar/rascar" y dibuja/anima lo que el servidor
//  devuelve. Nunca decide él mismo qué premio toca (por eso no hay
//  ningún Math.random() de premios aquí, solo de estética: colores,
//  vueltas extra de la ruleta, radio de cada rasca del cursor...).
// ═══════════════════════════════════════════════════════════

const JUEGO_COLORES = ['#3D1F0D', '#C0392B', '#D9A441', '#27855a', '#8A6A4E', '#1f6f8b', '#a5471f', '#6b4226'];

window._juegoActivoActual = 'ninguno';
window._juegoState = { juego: null, premio: null, code: null };

function _juegosInit() {
  if (window.fb_listenJuegoActivo) {
    window.fb_listenJuegoActivo(function (juego) {
      window._juegoActivoActual = juego || 'ninguno';
      _actualizarJuegoFab(window._juegoActivoActual);
    });
  }
}
if (window._firebaseReady) _juegosInit();
document.addEventListener('firebaseReady', _juegosInit);

// El banner de cookies (#cookies-banner, ver index.html) tapa toda la
// franja de abajo de la pantalla en móvil hasta que se acepta/rechaza, con
// un z-index mucho más alto que cualquier botón flotante — sin esto el
// botón del juego queda escondido debajo la primera vez que alguien entra.
// Se vigila con un observer en vez de tocar cookiesAceptar() directamente,
// así funciona pase lo que pase cómo se cierre el banner.
function _juegoFabVigilarBannerCookies() {
  const banner = document.getElementById('cookies-banner');
  const fab = document.getElementById('juego-fab');
  if (!banner || !fab) return;
  const actualizar = () => {
    const visible = getComputedStyle(banner).display !== 'none';
    fab.classList.toggle('sobre-banner-cookies', visible);
  };
  actualizar();
  new MutationObserver(actualizar).observe(banner, { attributes: true, attributeFilter: ['style'] });
}
document.addEventListener('DOMContentLoaded', _juegoFabVigilarBannerCookies);
if (document.readyState !== 'loading') _juegoFabVigilarBannerCookies();

function _actualizarJuegoFab(juego) {
  const fab = document.getElementById('juego-fab');
  if (fab) {
    if (juego === 'ruleta') { fab.textContent = '🎡'; fab.classList.remove('hidden'); }
    else if (juego === 'rasca') { fab.textContent = '🎫'; fab.classList.remove('hidden'); }
    else { fab.classList.add('hidden'); }
  }
  document.querySelectorAll('#juego-activo-selector button').forEach(btn => {
    const on = btn.dataset.juego === juego;
    btn.style.background = on ? 'var(--brown)' : 'var(--white)';
    btn.style.color = on ? 'var(--gold)' : 'var(--brown)';
  });
}

function abrirJuegoActivo() {
  if (window._juegoActivoActual === 'ruleta') openRuleta();
  else if (window._juegoActivoActual === 'rasca') openRasca();
}

// Teléfono guardado de un pedido anterior (mismo patrón que usa el resto
// de la web para no pedirlo dos veces si ya lo tenemos).
function _juegoTelefonoGuardado() {
  try { return localStorage.getItem('dpf_customer_phone') || ''; } catch (e) { return ''; }
}

async function _juegoGirar(juego, telefono) {
  const res = await fetch('juegos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'girar', juego, telefono })
  });
  return res.json();
}

function _aplicarPremioComun(juego) {
  const st = window._juegoState;
  if (juego === 'ruleta') closeRuleta(); else closeRasca();
  if (st && st.code) {
    const input = document.getElementById('discount-input');
    if (input) input.value = st.code;
    if (typeof dcAplicar === 'function') dcAplicar(st.code);
    showAlert('🎉 ¡Código ' + st.code + ' aplicado! El descuento ya está en tu pedido.', '¡Premio aplicado!');
  }
  if (typeof openCartDrawer === 'function' && window.innerWidth <= 700) openCartDrawer();
  else { const panel = document.querySelector('.order-panel'); if (panel) panel.scrollIntoView({ behavior: 'smooth' }); }
}

// ── RULETA ──────────────────────────────────────────────────────────────
let _ruletaPremios = [];
let _ruletaEjecutando = false;

function openRuleta() {
  document.getElementById('ruleta-modal').classList.add('open');
  document.getElementById('ruleta-intro').style.display = 'block';
  document.getElementById('ruleta-resultado').style.display = 'none';
  document.getElementById('ruleta-ya-jugaste').style.display = 'none';
  const btn = document.getElementById('ruleta-spin-btn');
  btn.disabled = false;
  btn.textContent = 'Girar la ruleta';
  const tel = document.getElementById('ruleta-telefono');
  if (tel) { tel.value = _juegoTelefonoGuardado(); if (tel.value) formatPhone(tel); }
  document.getElementById('ruleta-tel-error').style.display = 'none';
  const canvas = document.getElementById('ruleta-canvas');
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0deg)';
  requestAnimationFrame(() => { canvas.style.transition = ''; });
  (window.fb_loadRuletaConfig ? window.fb_loadRuletaConfig() : Promise.resolve(null)).then(cfg => {
    _ruletaPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios : [];
    _dibujarRuletaWheel(_ruletaPremios);
  }).catch(() => { _ruletaPremios = []; });
}
function closeRuleta() {
  document.getElementById('ruleta-modal').classList.remove('open');
}

function _dibujarRuletaWheel(premios) {
  const canvas = document.getElementById('ruleta-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, r = w / 2;
  ctx.clearRect(0, 0, w, h);
  if (!premios.length) {
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8A6A4E'; ctx.font = '13px DM Sans, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Sin premios configurados', cx, cy);
    return;
  }
  const seg = (Math.PI * 2) / premios.length;
  const n = premios.length;
  const emojiSize = n > 8 ? 13 : n > 6 ? 15 : n > 4 ? 17 : 20;
  const EMOJI_FONTS = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  // Ancho disponible para el texto: la cuerda del arco a la altura donde
  // se dibuja, con un margen — así el ajuste se basa en el hueco real de
  // cada porción (más estrecho cuantos más premios haya) y no en un
  // recuento de caracteres a ojo.
  const radialPos = r * 0.6;
  const maxTextWidth = Math.max(30, 2 * radialPos * Math.sin(seg / 2) * 0.82);

  // Reparte "nombre" en 1-2 líneas que quepan en maxTextWidth, reduciendo
  // el tamaño de letra si hace falta (hasta un mínimo legible). Devuelve
  // las líneas ya recortadas con "…" si ni así caben.
  function _ajustarTexto(nombre) {
    for (let size = 9; size >= 6; size--) {
      ctx.font = '600 ' + size + 'px DM Sans, sans-serif';
      if (ctx.measureText(nombre).width <= maxTextWidth) return { size, lineas: [nombre] };
      const palabras = nombre.split(' ');
      if (palabras.length > 1) {
        // Envuelve en 2 líneas por el espacio más cercano a la mitad.
        let mejor = 1, mejorDiff = Infinity;
        let acumulado = 0;
        for (let k = 0; k < palabras.length - 1; k++) {
          acumulado += palabras[k].length + 1;
          const diff = Math.abs(acumulado - nombre.length / 2);
          if (diff < mejorDiff) { mejorDiff = diff; mejor = k + 1; }
        }
        const l1 = palabras.slice(0, mejor).join(' ');
        const l2 = palabras.slice(mejor).join(' ');
        if (ctx.measureText(l1).width <= maxTextWidth && ctx.measureText(l2).width <= maxTextWidth) {
          return { size, lineas: [l1, l2] };
        }
      }
    }
    // Ni a tamaño mínimo cabe entero: recortar con "…"
    ctx.font = '600 6px DM Sans, sans-serif';
    let corto = nombre;
    while (corto.length > 1 && ctx.measureText(corto + '…').width > maxTextWidth) {
      corto = corto.slice(0, -1);
    }
    return { size: 6, lineas: [corto + '…'] };
  }

  premios.forEach((p, i) => {
    // Ángulo 0 = arriba (donde está el puntero), sentido horario.
    // En coordenadas de canvas eso equivale a restar 90°.
    const start = i * seg - Math.PI / 2;
    const end = start + seg;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = JUEGO_COLORES[i % JUEGO_COLORES.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.stroke();

    const { size, lineas } = _ajustarTexto(p.nombre || '');

    ctx.save();
    // Recortar el dibujo del texto a la propia porción — así, sea cual
    // sea el tamaño del nombre del premio, nunca puede "pintarse" por
    // encima del color de la porción de al lado (antes se veía cortado
    // a medias entre dos colores cuando el texto no cabía).
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF8EE';
    ctx.font = emojiSize + 'px ' + EMOJI_FONTS;
    ctx.fillText(p.emoji || '🎁', radialPos, lineas.length > 1 ? -12 : -8);
    ctx.font = '600 ' + size + 'px DM Sans, sans-serif';
    lineas.forEach((linea, li) => {
      ctx.fillText(linea, radialPos, 8 + li * (size + 2));
    });
    ctx.restore();
  });
}

async function girarRuleta() {
  if (_ruletaEjecutando) return;
  const tel = document.getElementById('ruleta-telefono');
  const digits = (tel.value || '').replace(/\D/g, '');
  if (digits.length !== 9) {
    document.getElementById('ruleta-tel-error').style.display = 'block';
    return;
  }
  document.getElementById('ruleta-tel-error').style.display = 'none';
  _ruletaEjecutando = true;
  const btn = document.getElementById('ruleta-spin-btn');
  btn.disabled = true;
  btn.textContent = 'Girando…';
  try {
    const data = await _juegoGirar('ruleta', digits);
    if (!data.success) {
      showAlert(data.message || 'No se pudo girar la ruleta ahora mismo. Inténtalo más tarde.', 'Vaya…');
      btn.disabled = false; btn.textContent = 'Girar la ruleta';
      _ruletaEjecutando = false;
      return;
    }
    if (data.yaJugaste) {
      document.getElementById('ruleta-intro').style.display = 'none';
      document.getElementById('ruleta-ya-jugaste').style.display = 'block';
      window._juegoState = { juego: 'ruleta', premio: data.premio, code: data.code };
      _ruletaEjecutando = false;
      return;
    }
    const idx = Math.max(0, _ruletaPremios.findIndex(p => p.id === (data.premio && data.premio.id)));
    const seg = 360 / (_ruletaPremios.length || 1);
    const mid = idx * seg + seg / 2;
    const vueltas = 5 + Math.floor(Math.random() * 3);
    const deg = 360 * vueltas - mid;
    const canvas = document.getElementById('ruleta-canvas');
    canvas.style.transform = 'rotate(' + deg + 'deg)';
    window._juegoState = { juego: 'ruleta', premio: data.premio, code: data.code };
    setTimeout(() => {
      document.getElementById('ruleta-intro').style.display = 'none';
      document.getElementById('ruleta-resultado').style.display = 'block';
      const premio = data.premio || {};
      document.getElementById('ruleta-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('ruleta-resultado-desc').textContent = premio.pct > 0
        ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
        : (premio.nombre || 'Suerte la próxima vez');
      document.getElementById('ruleta-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      _ruletaEjecutando = false;
    }, 4700);
  } catch (e) {
    showAlert('Error de conexión. Inténtalo de nuevo.', 'Vaya…');
    btn.disabled = false; btn.textContent = 'Girar la ruleta';
    _ruletaEjecutando = false;
  }
}
function aplicarPremioRuleta() { _aplicarPremioComun('ruleta'); }

// ── RASCA Y GANA ────────────────────────────────────────────────────────
let _rascaEjecutando = false;
let _rascaScratching = false;
let _rascaRevelado = false;

function openRasca() {
  document.getElementById('rasca-modal').classList.add('open');
  document.getElementById('rasca-intro').style.display = 'block';
  document.getElementById('rasca-resultado').style.display = 'none';
  document.getElementById('rasca-ya-jugaste').style.display = 'none';
  document.getElementById('rasca-tel-paso').style.display = 'block';
  document.getElementById('rasca-tarjeta-paso').style.display = 'none';
  const tel = document.getElementById('rasca-telefono');
  if (tel) { tel.value = _juegoTelefonoGuardado(); if (tel.value) formatPhone(tel); }
  document.getElementById('rasca-tel-error').style.display = 'none';
  _rascaRevelado = false;
}
function closeRasca() {
  document.getElementById('rasca-modal').classList.remove('open');
}

async function empezarRasca() {
  if (_rascaEjecutando) return;
  const tel = document.getElementById('rasca-telefono');
  const digits = (tel.value || '').replace(/\D/g, '');
  if (digits.length !== 9) {
    document.getElementById('rasca-tel-error').style.display = 'block';
    return;
  }
  document.getElementById('rasca-tel-error').style.display = 'none';
  _rascaEjecutando = true;
  const btn = document.getElementById('rasca-empezar-btn');
  btn.disabled = true;
  btn.textContent = 'Cargando…';
  try {
    const data = await _juegoGirar('rasca', digits);
    btn.disabled = false; btn.textContent = 'Destapar mi tarjeta';
    if (!data.success) {
      showAlert(data.message || 'No se pudo cargar la tarjeta ahora mismo. Inténtalo más tarde.', 'Vaya…');
      _rascaEjecutando = false;
      return;
    }
    window._juegoState = { juego: 'rasca', premio: data.premio, code: data.code };
    if (data.yaJugaste) {
      document.getElementById('rasca-intro').style.display = 'none';
      document.getElementById('rasca-ya-jugaste').style.display = 'block';
      _rascaEjecutando = false;
      return;
    }
    const premio = data.premio || {};
    document.getElementById('rasca-premio-emoji').textContent = premio.emoji || '🎁';
    document.getElementById('rasca-premio-texto').textContent = premio.nombre || '';
    document.getElementById('rasca-tel-paso').style.display = 'none';
    document.getElementById('rasca-tarjeta-paso').style.display = 'block';
    _dibujarRascaFoil();
    _rascaEjecutando = false;
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Destapar mi tarjeta';
    showAlert('Error de conexión. Inténtalo de nuevo.', 'Vaya…');
    _rascaEjecutando = false;
  }
}

function _dibujarRascaFoil() {
  const canvas = document.getElementById('rasca-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.globalCompositeOperation = 'source-over';
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#C9A25A'); grad.addColorStop(1, '#8A6A4E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.font = '600 15px DM Sans, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🎫 Rasca aquí', w / 2, h / 2);

  let drawing = false;
  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - rect.left) * (w / rect.width), y: (p.clientY - rect.top) * (h / rect.height) };
  }
  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  function checkRevealed() {
    if (_rascaRevelado) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    let transparent = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 8) { // muestreo cada 8 píxeles, suficiente para estimar el %
      total++;
      if (data[i] === 0) transparent++;
    }
    if (total > 0 && transparent / total >= 0.5) {
      _rascaRevelado = true;
      ctx.clearRect(0, 0, w, h);
      setTimeout(_mostrarResultadoRasca, 350);
    }
  }
  function onDown(e) { drawing = true; const p = pos(e); scratchAt(p.x, p.y); e.preventDefault(); }
  function onMove(e) { if (!drawing) return; const p = pos(e); scratchAt(p.x, p.y); checkRevealed(); e.preventDefault(); }
  function onUp() { drawing = false; checkRevealed(); }

  canvas.onpointerdown = onDown;
  canvas.onpointermove = onMove;
  canvas.onpointerup = onUp;
  canvas.onpointerleave = onUp;
}

function _mostrarResultadoRasca() {
  document.getElementById('rasca-tarjeta-paso').style.display = 'none';
  document.getElementById('rasca-resultado').style.display = 'block';
  const premio = (window._juegoState && window._juegoState.premio) || {};
  document.getElementById('rasca-resultado-emoji').textContent = premio.emoji || '🎉';
  document.getElementById('rasca-resultado-desc').textContent = premio.pct > 0
    ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
    : (premio.nombre || 'Suerte la próxima vez');
  document.getElementById('rasca-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
}
function aplicarPremioRasca() { _aplicarPremioComun('rasca'); }

// ── ADMIN: PANEL DE CONFIGURACIÓN ──────────────────────────────────────
let _ruletaAdminPremios = [];
let _rascaAdminPremios = [];

function _premioId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function _renderPremiosAdmin(listaId, premios) {
  const cont = document.getElementById(listaId);
  if (!cont) return;
  cont.innerHTML = premios.map((p, i) => (
    '<div style="display:flex;gap:6px;align-items:center;background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:8px">' +
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

async function renderRuletaAdmin() {
  const cfg = window.fb_loadRuletaConfig ? await window.fb_loadRuletaConfig().catch(() => null) : null;
  _ruletaAdminPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios.map(p => Object.assign({}, p)) : [];
  document.getElementById('ruleta-admin-activa').checked = !!(cfg && cfg.activa);
  _actualizarTrack('ruleta-admin-toggle-track', !!(cfg && cfg.activa));
  _renderPremiosAdmin('ruleta-admin-lista', _ruletaAdminPremios);
  const giros = window.fb_loadRuletaGiros ? null : null; // el recuento en vivo requeriría un nuevo endpoint; se omite por ahora
  document.getElementById('ruleta-admin-stats').textContent = (_ruletaAdminPremios.length) + ' premio' + (_ruletaAdminPremios.length === 1 ? '' : 's') + ' configurado' + (_ruletaAdminPremios.length === 1 ? '' : 's');
}
function ruletaAdminAddPremio() {
  _ruletaAdminPremios.push({ id: _premioId(), emoji: '🎁', nombre: '', pct: 10, peso: 1 });
  _renderPremiosAdmin('ruleta-admin-lista', _ruletaAdminPremios);
}
async function ruletaAdminGuardar() {
  const activa = document.getElementById('ruleta-admin-activa').checked;
  const premios = _ruletaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa, premios });
  logActivity('🎡 Configuración de la ruleta actualizada (' + premios.length + ' premios)');
  showToast('ruleta-config-toast');
}
async function ruletaAdminToggleActiva(checked) {
  _actualizarTrack('ruleta-admin-toggle-track', checked);
  const premios = _ruletaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa: checked, premios });
  logActivity(checked ? '🎡 Ruleta activada' : '🎡 Ruleta desactivada');
}

async function renderRascaAdmin() {
  const cfg = window.fb_loadRascaConfig ? await window.fb_loadRascaConfig().catch(() => null) : null;
  _rascaAdminPremios = (cfg && Array.isArray(cfg.premios)) ? cfg.premios.map(p => Object.assign({}, p)) : [];
  document.getElementById('rasca-admin-activa').checked = !!(cfg && cfg.activa);
  _actualizarTrack('rasca-admin-toggle-track', !!(cfg && cfg.activa));
  _renderPremiosAdmin('rasca-admin-lista', _rascaAdminPremios);
  document.getElementById('rasca-admin-stats').textContent = (_rascaAdminPremios.length) + ' premio' + (_rascaAdminPremios.length === 1 ? '' : 's') + ' configurado' + (_rascaAdminPremios.length === 1 ? '' : 's');
}
function rascaAdminAddPremio() {
  _rascaAdminPremios.push({ id: _premioId(), emoji: '🎁', nombre: '', pct: 10, peso: 1 });
  _renderPremiosAdmin('rasca-admin-lista', _rascaAdminPremios);
}
async function rascaAdminGuardar() {
  const activa = document.getElementById('rasca-admin-activa').checked;
  const premios = _rascaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa, premios });
  logActivity('🎫 Configuración del rasca actualizada (' + premios.length + ' premios)');
  showToast('rasca-config-toast');
}
async function rascaAdminToggleActiva(checked) {
  _actualizarTrack('rasca-admin-toggle-track', checked);
  const premios = _rascaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa: checked, premios });
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
