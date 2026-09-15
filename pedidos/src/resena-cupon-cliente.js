// ══════════════════════════════════════════════
//  CUPÓN POR RESEÑA — flujo del cliente
// ══════════════════════════════════════════════
// El servidor (resena-cupon.php) es quien decide de verdad qué pantalla
// toca: aquí solo se pinta lo que consultarEstado()/solicitar() devuelven.
// Sin verificación SMS (OTP) al pedirlo — el aviso de aprobación se manda
// por SMS real al número que se escriba aquí (ver enviarSmsAvisoCuponAprobado
// en resena-cupon.php), así que pedir otro SMS solo para "demostrar" el
// número antes de eso sería un envío de más sin necesidad.

let _resenaPhone = '';
let _resenaCapturaBase64 = null;

// Comprime la captura en el propio móvil antes de mandarla (canvas, sin
// depender de ninguna librería nueva): una foto de pantalla normal pesa
// varios MB, y en base64 dentro del JSON eso son varios MB más — se
// reescala a un ancho máximo razonable y se recomprime a JPEG para que el
// POST sea ligero y rápido incluso con datos móviles flojos, sin perder
// legibilidad del texto de la reseña.
function _resenaComprimirImagen(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type.indexOf('image/') !== 0) {
      reject(new Error('Elige un archivo de imagen (foto o captura de pantalla)'));
      return;
    }
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer la imagen'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        const ANCHO_MAX = 1000;
        const escala = Math.min(1, ANCHO_MAX / img.width);
        const w = Math.max(1, Math.round(img.width * escala));
        const h = Math.max(1, Math.round(img.height * escala));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}

async function resenaPreviewCaptura(input) {
  const errorEl = document.getElementById('resena-captura-error');
  const previewEl = document.getElementById('resena-captura-preview');
  if (errorEl) errorEl.style.display = 'none';
  const file = input.files && input.files[0];
  if (!file) { _resenaCapturaBase64 = null; if (previewEl) previewEl.style.display = 'none'; return; }
  try {
    _resenaCapturaBase64 = await _resenaComprimirImagen(file);
    if (previewEl) { previewEl.src = _resenaCapturaBase64; previewEl.style.display = 'block'; }
  } catch (e) {
    _resenaCapturaBase64 = null;
    if (previewEl) previewEl.style.display = 'none';
    if (errorEl) { errorEl.textContent = e.message; errorEl.style.display = 'block'; }
    input.value = '';
  }
}

function _resenaMostrarPaso(paso) {
  ['telefono', 'formulario', 'pendiente', 'exito', 'error'].forEach(p => {
    const el = document.getElementById('resena-paso-' + p);
    if (el) el.style.display = p === paso ? 'block' : 'none';
  });
}

function abrirResenaCupon() {
  const modal = document.getElementById('resena-modal');
  if (!modal) return;
  const telGuardado = localStorage.getItem('dpf_customer_phone') || '';
  const inputTel = document.getElementById('resena-tel-input');
  if (inputTel) inputTel.value = telGuardado;
  // Se limpia la captura de un intento anterior (p.ej. si canceló y volvió
  // a abrir el modal más tarde) — sin esto se podría mandar sin querer la
  // imagen de una sesión vieja junto a un nombre distinto.
  _resenaCapturaBase64 = null;
  const capturaInput = document.getElementById('resena-captura-input');
  if (capturaInput) capturaInput.value = '';
  const capturaPreview = document.getElementById('resena-captura-preview');
  if (capturaPreview) capturaPreview.style.display = 'none';
  const capturaError = document.getElementById('resena-captura-error');
  if (capturaError) capturaError.style.display = 'none';
  _resenaMostrarPaso('telefono');
  modal.style.display = 'flex';
}

function cerrarResenaCupon() {
  const modal = document.getElementById('resena-modal');
  if (modal) modal.style.display = 'none';
}

function _resenaFormatearTel(tel) {
  return tel.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}

async function resenaComprobarTelefono() {
  const inputTel = document.getElementById('resena-tel-input');
  const telefono = (inputTel ? inputTel.value : '').replace(/[^0-9]/g, '');
  if (!/^\d{9}$/.test(telefono)) {
    showAlert('Introduce un número de móvil español válido (9 dígitos)');
    return;
  }
  _resenaPhone = telefono;
  const btn = document.getElementById('resena-btn-continuar');
  if (btn) { btn.disabled = true; btn.textContent = 'Comprobando…'; }
  try {
    await resenaConsultarEstado();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Continuar'; }
  }
}

async function resenaConsultarEstado() {
  try {
    const res = await _fetchConTimeout('resena-cupon.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'consultarEstado', phone: _resenaPhone })
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
      const telPendiente = document.getElementById('resena-tel-pendiente');
      if (telPendiente) telPendiente.textContent = _resenaFormatearTel(_resenaPhone);
      _resenaMostrarPaso('pendiente');
    } else {
      // 'ninguno' — nunca pidió el cupón, o la solicitud anterior se descartó
      const nombreEl = document.getElementById('resena-nombre-input');
      const comentEl = document.getElementById('resena-comentario-input');
      if (nombreEl) nombreEl.value = '';
      if (comentEl) comentEl.value = '';
      const telFormulario = document.getElementById('resena-tel-formulario');
      if (telFormulario) telFormulario.textContent = _resenaFormatearTel(_resenaPhone);
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
  if (!_resenaCapturaBase64) {
    showAlert('Sube una captura de pantalla de tu reseña para poder confirmarla');
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
        phone: _resenaPhone,
        nombreGoogle,
        comentario: (comentEl ? comentEl.value : '').trim(),
        captura: _resenaCapturaBase64
      })
    }, 15000);
    const data = await res.json();
    if (!data.success) {
      showAlert(data.error || 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
      return;
    }
    if (data.estado === 'aprobado') {
      document.getElementById('resena-codigo-mostrado').textContent = data.codigo;
      _resenaMostrarPaso('exito');
    } else {
      const telPendiente = document.getElementById('resena-tel-pendiente');
      if (telPendiente) telPendiente.textContent = _resenaFormatearTel(_resenaPhone);
      _resenaMostrarPaso('pendiente');
    }
  } catch (e) {
    showAlert('Error de conexión. Inténtalo de nuevo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar para comprobar'; }
  }
}
