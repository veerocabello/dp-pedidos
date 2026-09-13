// ══════════════════════════════════════════════
//  CUPÓN POR RESEÑA — flujo del cliente
// ══════════════════════════════════════════════
// El servidor (resena-cupon.php) es quien decide de verdad qué pantalla
// toca: aquí solo se pinta lo que consultarEstado()/solicitar() devuelven.
// Sin aviso por SMS por ahora — el cliente vuelve a esta misma ventana y
// verifica su móvil otra vez para ver si ya se lo aprobaron (ver el
// comentario grande al principio de resena-cupon.php).

let _resenaPhone = '';
let _resenaSmsToken = '';

function _resenaMostrarPaso(paso) {
  ['telefono', 'otp', 'formulario', 'pendiente', 'exito', 'error'].forEach(p => {
    const el = document.getElementById('resena-paso-' + p);
    if (el) el.style.display = p === paso ? 'block' : 'none';
  });
}

function abrirResenaCupon() {
  const modal = document.getElementById('resena-modal');
  if (!modal) return;
  _resenaSmsToken = '';
  const telGuardado = localStorage.getItem('dpf_customer_phone') || '';
  const inputTel = document.getElementById('resena-tel-input');
  if (inputTel) inputTel.value = telGuardado;
  document.getElementById('resena-otp-error').style.display = 'none';
  ['resena-otp-1', 'resena-otp-2', 'resena-otp-3', 'resena-otp-4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _resenaMostrarPaso('telefono');
  modal.style.display = 'flex';
}

function cerrarResenaCupon() {
  const modal = document.getElementById('resena-modal');
  if (modal) modal.style.display = 'none';
}

async function resenaEnviarCodigo() {
  const inputTel = document.getElementById('resena-tel-input');
  const telefono = (inputTel ? inputTel.value : '').replace(/[^0-9]/g, '');
  if (!/^\d{9}$/.test(telefono)) {
    showAlert('Introduce un número de móvil español válido (9 dígitos)');
    return;
  }
  _resenaPhone = telefono;
  const btn = document.getElementById('resena-btn-enviar-codigo');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  try {
    const res = await _fetchConTimeout('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + telefono })
    }, 8000);
    const data = await res.json();
    if (!data.success) {
      showAlert(data.error || 'No se pudo enviar el código. Inténtalo de nuevo.');
      return;
    }
    document.getElementById('resena-tel-mostrado').textContent = telefono.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    _resenaMostrarPaso('otp');
    const first = document.getElementById('resena-otp-1');
    if (first) first.focus();
  } catch (e) {
    showAlert('No se pudo enviar el código (' + e.message + '). Inténtalo de nuevo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar código'; }
  }
}

async function resenaVerificarCodigo() {
  const codigo = ['resena-otp-1', 'resena-otp-2', 'resena-otp-3', 'resena-otp-4']
    .map(id => (document.getElementById(id) || {}).value || '')
    .join('');
  const errEl = document.getElementById('resena-otp-error');
  if (codigo.length !== 4) {
    if (errEl) { errEl.textContent = 'Introduce los 4 dígitos del código'; errEl.style.display = 'block'; }
    return;
  }
  const btn = document.getElementById('resena-btn-verificar');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }
  try {
    const res = await _fetchConTimeout('/verify-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + _resenaPhone, code: codigo })
    }, 8000);
    const data = await res.json();
    if (!data.verified) {
      if (errEl) { errEl.textContent = data.error || 'Código incorrecto'; errEl.style.display = 'block'; }
      return;
    }
    if (errEl) errEl.style.display = 'none';
    _resenaSmsToken = data.smsToken;
    await resenaConsultarEstado();
  } catch (e) {
    if (errEl) { errEl.textContent = 'Error de conexión. Inténtalo de nuevo.'; errEl.style.display = 'block'; }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Verificar'; }
  }
}

async function resenaConsultarEstado() {
  try {
    const res = await _fetchConTimeout('resena-cupon.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'consultarEstado', smsToken: _resenaSmsToken, phone: _resenaPhone })
    }, 8000);
    const data = await res.json();
    if (!data.success) {
      _resenaMostrarError(data.error || 'No se pudo comprobar el estado. Inténtalo de nuevo.');
      return;
    }
    if (data.estado === 'aprobado') {
      document.getElementById('resena-codigo-mostrado').textContent = data.codigo;
      _resenaMostrarPaso('exito');
    } else if (data.estado === 'pendiente') {
      _resenaMostrarPaso('pendiente');
    } else {
      // 'ninguno' — nunca pidió el cupón, o la solicitud anterior se descartó
      const nombreEl = document.getElementById('resena-nombre-input');
      const comentEl = document.getElementById('resena-comentario-input');
      if (nombreEl) nombreEl.value = '';
      if (comentEl) comentEl.value = '';
      _resenaMostrarPaso('formulario');
    }
  } catch (e) {
    _resenaMostrarError('Error de conexión. Inténtalo de nuevo.');
  }
}

function _resenaMostrarError(msg) {
  const el = document.getElementById('resena-error-msg');
  if (el) el.textContent = msg;
  _resenaMostrarPaso('error');
}

async function resenaEnviarSolicitud() {
  const nombreEl = document.getElementById('resena-nombre-input');
  const comentEl = document.getElementById('resena-comentario-input');
  const nombreGoogle = (nombreEl ? nombreEl.value : '').trim();
  if (!nombreGoogle) {
    showAlert('Escribe el nombre con el que dejaste la reseña en Google');
    return;
  }
  const btn = document.getElementById('resena-btn-enviar-solicitud');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  try {
    const res = await _fetchConTimeout('resena-cupon.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'solicitar',
        smsToken: _resenaSmsToken,
        phone: _resenaPhone,
        nombreGoogle,
        comentario: (comentEl ? comentEl.value : '').trim()
      })
    }, 8000);
    const data = await res.json();
    if (!data.success) {
      showAlert(data.error || 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
      return;
    }
    if (data.estado === 'aprobado') {
      document.getElementById('resena-codigo-mostrado').textContent = data.codigo;
      _resenaMostrarPaso('exito');
    } else {
      _resenaMostrarPaso('pendiente');
    }
  } catch (e) {
    showAlert('Error de conexión. Inténtalo de nuevo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar para comprobar'; }
  }
}

// Mismo comportamiento que smsCodeInput/smsCodeKey (init.js) para el modal
// de verificación del checkout — no se reutilizan tal cual porque esos
// están fijados a los ids "sms-code-N" del otro modal, que conviven en la
// misma página con estos.
function resenaOtpInput(el, n) {
  el.value = el.value.replace(/[^0-9]/g, '');
  if (el.value.length === 1 && n < 4) {
    const next = document.getElementById('resena-otp-' + (n + 1));
    if (next) next.focus();
  }
  if (n === 4 && el.value.length === 1) {
    const code = ['1', '2', '3', '4'].map(i => (document.getElementById('resena-otp-' + i) || {}).value || '').join('');
    if (code.length === 4) resenaVerificarCodigo();
  }
}
function resenaOtpKey(event, n) {
  if (event.key === 'Backspace') {
    const el = document.getElementById('resena-otp-' + n);
    if (el && el.value === '' && n > 1) {
      const prev = document.getElementById('resena-otp-' + (n - 1));
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }
}
