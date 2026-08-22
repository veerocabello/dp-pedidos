// ── DATOS PRIVADOS DE EMPLEADOS ──────────────────────────────────────
// Empleados y fichajes (PIN, DNI, teléfono, firmas) son datos sensibles.
// Solo se cargan tras un login real (Firebase Auth admin o PIN bimba
// verificado en el servidor) — nunca al abrir la página como visitante.
// Llamar desde checkAdminPwd() (slots-alertas.js) y secureLockConfirm()
// (nucleo-compartido.js) justo después de confirmar el acceso.
function _cargarDatosEmpleadosPrivados() {
  if (window.fb_loadEmpleados) {
    window.fb_loadEmpleados().then(arr => {
      if (arr && arr.length) {
        localStorage.setItem('dpf_empleados', JSON.stringify(arr));
        if (typeof empRenderAdmin === 'function') empRenderAdmin();
        if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      }
    }).catch(() => {});
  }
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if (typeof empRenderAdmin === 'function') empRenderAdmin();
        if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      }
    }).catch(() => {});
  }
  // El badge de 🔔 Alertas necesita datos frescos del log nada más
  // entrar al panel, sin esperar a que se abra esa pestaña en concreto.
  if (window.fb_loadActivityLog) {
    window.fb_loadActivityLog().then(log => {
      if (log && log.length) localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
      if (typeof updateAlertBadge === 'function') updateAlertBadge();
    }).catch(() => {
      if (typeof updateAlertBadge === 'function') updateAlertBadge();
    });
  } else if (typeof updateAlertBadge === 'function') {
    updateAlertBadge();
  }
  // Tokens de acceso (?bimba=/?key=) y clave de stock: solo se cargan al
  // panel de ajustes DESPUÉS de un login real, para no exponerlos a
  // cualquier visitante. La comprobación de ?bimba=/?key= en sí la hace
  // el servidor (bimba-verify.php), este valor cacheado solo sirve para
  // que la propia admin pueda ver/copiar el enlace desde Ajustes.
  if (window.fb_loadUrlToken) {
    window.fb_loadUrlToken().then(t => {
      if (t) {
        localStorage.setItem(URL_TOKEN_KEY, t);
        if (typeof loadUrlTokenUI === 'function') loadUrlTokenUI();
      }
    }).catch(() => {});
  }
  if (window.fb_loadBimbaToken) {
    window.fb_loadBimbaToken().then(t => {
      if (t) localStorage.setItem(BIMBA_TOKEN_KEY, t);
    }).catch(() => {});
  }
  if (window.fb_loadStockPwd) {
    window.fb_loadStockPwd().then(pwd => {
      if (pwd) localStorage.setItem(STOCK_PWD_KEY, pwd);
    }).catch(() => {});
  }
}

// ── ALERTAS FICHAJE BIMBA ──────────────────────────────────

function _empMinFromHora(hora) {
  var p = (hora || '').split(':').map(Number);
  return p[0] * 60 + (p[1] || 0);
}
// El turno partido típico de este negocio (mañana + tarde) tiene DOS
// horas de salida distintas — antes el aviso de "olvido" comparaba
// SIEMPRE contra la de la tarde (tarOut||manOut), da igual cuál de las
// dos entradas se hubiera quedado sin cerrar. Si lo que se olvidó fue la
// salida de la MAÑANA, eso no se detectaba hasta pasada la hora de salida
// de la TARDE, horas después de que hiciera falta el aviso. Aquí se
// adivina a qué turno pertenece la entrada abierta (comparando su hora
// contra las dos horas de entrada del contrato) para usar la salida de
// ESE turno.
function _empHoraSalidaEsperada(emp, horaEntradaAbierta) {
  if (emp.manOut && emp.tarOut && emp.manIn && emp.tarIn && horaEntradaAbierta) {
    var eMin = _empMinFromHora(horaEntradaAbierta);
    var distMan = Math.abs(eMin - _empMinFromHora(emp.manIn));
    var distTar = Math.abs(eMin - _empMinFromHora(emp.tarIn));
    return distMan <= distTar ? emp.manOut : emp.tarOut;
  }
  return emp.tarOut || emp.manOut || null;
}
// Estado real de un empleado ahora mismo, mirando TODO su historial (no
// solo los fichajes de HOY) — antes, una entrada huérfana de un día
// anterior (turno olvidado, móvil sin batería...) dejaba de avisar en
// cuanto pasaba la medianoche: ese día no había fichajes de hoy, así que
// volvía a aparecer como "no ha fichado" en vez de seguir señalando el
// olvido real, que se quedaba invisible salvo por un aviso puntual (en el
// registro de actividad) el día que ese empleado volviera a fichar.
function _empEstadoActual(emp, fichajes, today) {
  var suyos = fichajes.filter(function (f) { return f.empId === emp.id; })
    .sort(function (a, b) { return (a.fecha + (a.horaReal || a.hora)).localeCompare(b.fecha + (b.horaReal || b.hora)); });
  var suyosHoy = suyos.filter(function (f) { return f.fecha === today; });
  var entradasHoy = suyosHoy.filter(function (f) { return f.tipo === 'entrada'; });
  var salidasHoy = suyosHoy.filter(function (f) { return f.tipo === 'salida'; });
  var ultimaEntradaHoy = entradasHoy.length ? entradasHoy[entradasHoy.length - 1] : null;
  var ultimaSalidaHoy = salidasHoy.length ? salidasHoy[salidasHoy.length - 1] : null;
  var ultimo = suyos.length ? suyos[suyos.length - 1] : null;

  if (!ultimo || ultimo.tipo === 'salida') {
    return ultimaSalidaHoy
      ? { estado: 'salida', entrada: ultimaEntradaHoy, salida: ultimaSalidaHoy }
      : { estado: 'nada' };
  }
  // El último fichaje de siempre es una entrada sin cerrar.
  if (ultimo.fecha !== today) {
    // De un día anterior: es un huérfano de verdad, sin importar la hora.
    return { estado: 'olvido', entrada: ultimo, deOtroDia: true };
  }
  var horaAbierta = ultimo.horaReal || ultimo.hora;
  var horaSalidaEsperada = _empHoraSalidaEsperada(emp, horaAbierta);
  var estado = 'entrada';
  if (horaSalidaEsperada) {
    var ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
    var salidaMin = _empMinFromHora(horaSalidaEsperada);
    var diff = ahoraMin - salidaMin;
    if (diff < -12 * 60) diff += 24 * 60;
    if (diff >= 60) estado = 'olvido';
  }
  return { estado: estado, entrada: ultimo };
}

// ── "TRABAJANDO AHORA" — tarjeta resumen en sección Empleados ──
function _empEstadosFichajeHoy() {
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];

  return empleados.map(function(emp) {
    var r = _empEstadoActual(emp, fichajes, today);
    return { emp: emp, estado: r.estado, entrada: r.entrada || null, salida: r.salida || null, deOtroDia: r.deOtroDia || false };
  });
}
function empRenderAdmin() {
  var el = document.getElementById('emp-trabajando-ahora');
  if (!el) return;
  var estados = _empEstadosFichajeHoy();
  if (!estados.length) {
    el.innerHTML = '<div style="color:#8A6A4E">No hay empleados registrados</div>';
    return;
  }
  var labels = {
    entrada: { icon: '🟢', color: '#166534', texto: function(r) { return 'Trabajando desde las ' + (r.entrada ? (r.entrada.horaReal || r.entrada.hora) : '—'); } },
    salida: { icon: '🔵', color: '#0C447C', texto: function(r) { return 'Fichó salida a las ' + (r.salida ? (r.salida.horaReal || r.salida.hora) : '—'); } },
    olvido: { icon: '⚠️', color: '#9a3412', texto: function(r) {
      if (r.deOtroDia && r.entrada) return 'Se olvidó fichar salida del ' + r.entrada.fecha.slice(5).replace('-', '/') + ' (entró ' + (r.entrada.horaReal || r.entrada.hora) + ')';
      return 'Se olvidó fichar salida (entró ' + (r.entrada ? (r.entrada.horaReal || r.entrada.hora) : '—') + ')';
    } },
    nada: { icon: '❌', color: '#991b1b', texto: function() { return 'Todavía no ha fichado'; } }
  };
  el.innerHTML = estados.map(function(r) {
    var l = labels[r.estado];
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F5E6C8">'
      + '<span style="font-size:18px">' + l.icon + '</span>'
      + '<div><div style="font-weight:700;color:#2A1506;font-size:13px">' + r.emp.nombre + '</div>'
      + '<div style="font-size:12px;color:' + l.color + '">' + l.texto(r) + '</div></div>'
      + '</div>';
  }).join('');
}
function empRefrescar() {
  var el = document.getElementById('emp-trabajando-ahora');
  if (el) el.innerHTML = '<div style="color:#8A6A4E">Cargando...</div>';
  var p1 = window.fb_loadEmpleados ? window.fb_loadEmpleados().then(function(arr) { if (arr) localStorage.setItem('dpf_empleados', JSON.stringify(arr)); }).catch(function() {}) : Promise.resolve();
  var p2 = window.fb_loadFichajes ? window.fb_loadFichajes().then(function(arr) { if (arr) localStorage.setItem('dpf_fichajes', JSON.stringify(arr)); }).catch(function() {}) : Promise.resolve();
  Promise.all([p1, p2]).then(empRenderAdmin);
}
function bimbaIrAFichajes() {
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  var sec = document.getElementById('admin-bimba-fichajes');
  if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
  var bf = document.getElementById('bimba-footer-btns');
  if (bf) bf.style.display = 'none';

  // Siempre pedir datos frescos de Firebase antes de renderizar
  var lista = document.getElementById('bimba-fichaje-lista');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:#8A6A4E;text-align:center;padding:16px">⏳ Cargando fichajes...</div>';

  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(function(arr) {
      if (arr && arr.length) localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
      bimbaRenderFichajeLista();
    }).catch(function() {
      bimbaRenderFichajeLista(); // Si falla Firebase, usa localStorage como fallback
    });
  } else {
    bimbaRenderFichajeLista();
  }
}

function bimbaActualizarContadorAlertas() {
  var btn = document.getElementById('bimba-btn-alertas-fichaje');
  if (!btn) return;
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });
  var n = sinFichar.length;
  var desc = document.getElementById('bimba-alertas-desc');
  if (desc) desc.textContent = n > 0 ? n + ' sin fichar todavía' : 'Todo el equipo ha fichado';
}

function bimbaRenderFichajeLista() {
  var lista = document.getElementById('bimba-fichaje-lista');
  if (!lista) return;
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  if (!empleados.length) { lista.innerHTML = '<div style="font-size:13px;color:#8A6A4E">No hay empleados registrados</div>'; return; }

  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];

  var html = '';
  empleados.forEach(function(emp) {
    // Mismo cálculo que "Trabajando ahora" (_empEstadoActual) — mira TODO
    // el historial, no solo hoy (para no perder de vista un olvido de un
    // día anterior), y adivina a qué turno pertenece la entrada abierta
    // para comparar contra la hora de salida de ESE turno, no siempre la
    // de la tarde.
    var r = _empEstadoActual(emp, fichajes, today);
    var estado = r.estado; // 'entrada' | 'salida' | 'olvido' | 'nada'

    var estilos = {
      entrada: { bg:'#f0fdf4', border:'#1D9E75', icon:'🟢', textColor:'#166534', label:'Fichó entrada',     boton:false },
      salida:  { bg:'#eff6ff', border:'#378ADD', icon:'🔵', textColor:'#0C447C', label:'Fichó salida',      boton:false },
      olvido:  { bg:'#fff7ed', border:'#f97316', icon:'⚠️', textColor:'#9a3412', label: r.deOtroDia && r.entrada ? 'Se olvidó fichar salida del ' + r.entrada.fecha.slice(5).replace('-', '/') : 'Se olvidó fichar salida', boton:true },
      nada:    { bg:'#fff1f2', border:'#E24B4A', icon:'❌', textColor:'#991b1b', label:'No ha fichado',     boton:true  }
    };
    var s = estilos[estado];

    html += '<div style="background:' + s.bg + ';border-left:4px solid ' + s.border + ';border-radius:0 10px 10px 0;padding:10px 14px;display:flex;align-items:center;justify-content:space-between">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<span style="font-size:22px">' + s.icon + '</span>' +
      '<div><div style="font-size:14px;font-weight:600;color:' + s.textColor + '">' + emp.nombre + '</div>' +
      '<div style="font-size:12px;color:' + s.textColor + ';opacity:0.75">' + s.label + '</div></div></div>';
    if (s.boton) {
      html += '<button onclick="bimbaAvisarEmpleado(\'' + emp.id + '\',\'' + emp.nombre + '\',\'' + (emp.tel || '') + '\',\'' + estado + '\')" style="padding:5px 10px;background:transparent;color:' + s.textColor + ';border:1px solid ' + s.border + ';border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">📱 WhatsApp</button>';
    }
    html += '</div>';
  });
  lista.innerHTML = html;
  bimbaActualizarContadorAlertas();
}

function bimbaAvisarEmpleado(id, nombre, tel, estado) {
  var nombre1 = nombre.split(' ')[0];
  if (tel) {
    var telLimpio = tel.replace(/\D/g, '');
    if (telLimpio.length === 9) telLimpio = '34' + telLimpio;
    var msg = estado === 'olvido'
      ? encodeURIComponent('Hola ' + nombre1 + ', no te olvides de fichar!')
      : encodeURIComponent('Hola ' + nombre1 + ', recuerda fichar!');
    window.open('https://wa.me/' + telLimpio + '?text=' + msg, '_blank');
  } else {
    showToast('bimba-fichaje-toast', '⚠️ ' + nombre1 + ' no tiene teléfono guardado');
  }
}

function bimbaAvisarTodos() {
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });
  if (!sinFichar.length) { showToast('bimba-fichaje-toast', '✅ Todos han fichado'); return; }
  bimbaAlertarTablet();
  showToast('bimba-fichaje-toast', '🔔 Alerta enviada — ' + sinFichar.length + ' sin fichar');
}

function bimbaProbarAlertaTablet() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 150, 300].forEach(function(delay) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay/1000);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay/1000 + 0.3);
      osc.start(ctx.currentTime + delay/1000);
      osc.stop(ctx.currentTime + delay/1000 + 0.3);
    });
  } catch(e) {}
}

function bimbaAlertarTablet() {
  // Guardar alerta en Firebase para que la tablet la detecte
  bimbaProbarAlertaTablet();
  if (firebase && firebase.database) {
    firebase.database().ref('config/tabletAlert').set({ ts: Date.now(), tipo: 'fichaje' }).catch(function() {});
  }
}

function bimbaGuardarFichajeMins() {
  var mins = document.getElementById('bimba-fichaje-mins');
  if (mins) {
    localStorage.setItem('dpf_fichaje_alert_mins', mins.value);
    showToast('bimba-fichaje-toast', '✅ Guardado: avisar a los ' + mins.value + ' min');
  }
}


// ── LISTENER ALERTA TABLET ────────────────────────────────
// Se registra al cargar el bundle admin (no antes) — solo importa a un
// dispositivo que ya esté logueado como admin (ver el filtro
// window._adminLoggedIn dentro del callback), así que no hace falta
// escuchar este nodo de Firebase desde antes de que exista sesión.
(function initTabletAlertListener() {
  if (!window.firebase || !firebase.database) return;
  var lastTs = 0;
  firebase.database().ref('config/tabletAlert').on('value', function(sn) {
    if (!sn.exists()) return;
    var data = sn.val();
    var ts = data.ts || 0;
    if (ts <= lastTs) return;
    lastTs = ts;
    // Solo mostrar si llevamos más de 3 segundos en la página (evitar al cargar)
    if (performance.now() < 3000) return;
    // Solo mostrar si el admin está logueado
    if (!window._adminLoggedIn) return;
    // Solo mostrar si el admin está abierto pero NO en panel bimba
    var _ao = document.getElementById('admin-overlay');
    if (!_ao || !_ao.classList.contains('open')) return;
    var _sc = document.getElementById('admin-stock-config');
    if (_sc && _sc.classList.contains('active')) return;
    _mostrarAlertaTablet(data);
  });
})();

function _mostrarAlertaTablet(data) {
  // Sonido
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 200, 400, 600].forEach(function(delay) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime + delay/1000);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay/1000 + 0.4);
      osc.start(ctx.currentTime + delay/1000);
      osc.stop(ctx.currentTime + delay/1000 + 0.4);
    });
  } catch(e) {}

  // Construir lista de no fichados
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });
  var sinFichar = empleados.filter(function(e) {
    return !fichajesHoy.some(function(f) { return f.empId === e.id && f.tipo === 'entrada'; });
  });

  var listaHtml = sinFichar.length
    ? sinFichar.map(function(e) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff1f2;border-radius:10px;border:1.5px solid #fecdd3">' +
          '<span style="font-size:16px">❌</span>' +
          '<span style="font-size:14px;font-weight:600;color:#991b1b">' + e.nombre + '</span></div>';
      }).join('')
    : '<div style="font-size:13px;color:#8A6A4E">Sin datos de empleados en este dispositivo</div>';

  // Crear overlay
  var overlay = document.createElement('div');
  overlay.id = 'tablet-alert-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:16px;padding:2rem 2.5rem;text-align:center;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.3)">' +
    '<div style="width:56px;height:56px;background:#fff1f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:28px">🔔</div>' +
    '<div style="font-size:20px;font-weight:700;color:#3D1F0D;margin-bottom:8px">Alerta de fichaje</div>' +
    '<div style="font-size:14px;color:#8A6A4E;margin-bottom:1.5rem">Hay empleados que no han fichado todavía</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:1.5rem">' + listaHtml + '</div>' +
    '<button onclick="var o=document.getElementById(&quot;tablet-alert-overlay&quot;);if(o)o.remove()" style="width:100%;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Entendido</button>' +
    '</div>';

  document.body.appendChild(overlay);
}
