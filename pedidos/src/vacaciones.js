// ── MODO VACACIONES: parte de admin (activar/desactivar desde el panel) ──
// checkVacationMode() (comprobación que ve cualquier visitante) vive ahora
// en nucleo-compartido.js — ver el porqué ahí.
window.toggleVacacionesMode = function(on) {
  return firebase.database().ref('config/vacacionesActivo').set(on).then(() => {
    const screen = document.getElementById('vacation-screen');
    if (screen) screen.style.display = on ? 'flex' : 'none';
  });
};
function _renderVacacionesBtn(activo) {
  const btn = document.getElementById('vacaciones-toggle-btn');
  if (!btn) return;
  window._vacacionesActivo = activo;
  btn.textContent = activo ? '🌴 Activado' : 'Desactivado';
  btn.style.background = activo ? '#c0392b' : '#F5E6C8';
  btn.style.color = activo ? '#fff' : '#8A6A4E';
}
function loadVacacionesStatus() {
  const btn = document.getElementById('vacaciones-toggle-btn');
  if (!btn) return;
  firebase.database().ref('config/vacacionesActivo').once('value').then(sn => {
    _renderVacacionesBtn(sn.val() === true);
  }).catch(() => { btn.textContent = '⚠️ Error'; });
}
function toggleVacacionesModeAdmin() {
  const nuevoEstado = !window._vacacionesActivo;
  // Activar vacaciones bloquea el 100% de los pedidos entrantes al
  // instante — a diferencia de otras acciones destructivas del mismo
  // panel (borrar el registro de actividad, cerrar todas las sesiones),
  // esto no pedía confirmación antes: un click sin querer no tenía ningún
  // aviso previo, solo un mensaje informativo después de que ya estaba hecho.
  if (nuevoEstado && !confirm('¿Activar el modo vacaciones? Se bloquean TODOS los pedidos entrantes al instante.')) return;
  const btn = document.getElementById('vacaciones-toggle-btn');
  if (btn) btn.textContent = 'Cargando…';
  window.toggleVacacionesMode(nuevoEstado).then(() => {
    _renderVacacionesBtn(nuevoEstado);
    if (typeof logActivity === 'function') {
      logActivity(nuevoEstado ? '🌴 Modo vacaciones activado' : '🌴 Modo vacaciones desactivado');
    }
    if (nuevoEstado) {
      // El bloqueo real de vacaciones ya lo hace el servidor en cada
      // pedido (comprobarTiendaAbierta en guardar-pedido.php), pero
      // "Pedidos"/"Abierto" pueden seguir mostrando su estado normal en el
      // panel — dando a entender que la tienda sigue operativa cuando en
      // realidad las vacaciones lo bloquean todo por detrás.
      if (typeof showAlert === 'function') {
        showAlert('Se bloquean todos los pedidos aunque "Pedidos"/"Abierto" sigan marcados como activos en el panel — no hace falta tocarlos aparte.', '🌴 Vacaciones activadas');
      }
    } else {
      // Si "Pedidos" y/o "Abierto" ya estaban pausados por otro motivo
      // antes de entrar en vacaciones (pausa manual o auto-pausa), eso no
      // se restaura solo al desactivar vacaciones — antes solo se
      // revisaba "Pedidos"; si el que se había pausado era "Abierto", el
      // admin no recibía ningún aviso de que seguía apagado.
      const pedidosPausados = typeof getOrdersOpen === 'function' && !getOrdersOpen();
      const abiertoApagado = typeof OPEN_KEY !== 'undefined' && localStorage.getItem(OPEN_KEY) === 'false';
      if ((pedidosPausados || abiertoApagado) && typeof showAlert === 'function') {
        const cuales = [pedidosPausados ? '"Pedidos"' : null, abiertoApagado ? '"Abierto"' : null].filter(Boolean).join(' y ');
        const verbo = pedidosPausados && abiertoApagado ? 'seguían' : 'seguía';
        showAlert(cuales + ' ' + verbo + ' marcado como PAUSADO/CERRADO desde antes de las vacaciones. Revísalo en su pestaña si quieres volver a aceptar pedidos.', '🌴 Vacaciones desactivadas');
      }
    }
  }).catch(() => { if (btn) btn.textContent = '⚠️ Error'; });
}

"use strict";
const _SESSION_ID = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// Declaraciones globales para compatibilidad Safari 12 (estado del panel de stock)
var _stockSelections = {};
var _stockUnits = {};
var _stockChecks = {};
var _stockNotas = {};
var _stockLimpieza = {};

/* ═══════════════════════════════════════════════════
   DULCE PATATA — Lógica de administración
   ═══════════════════════════════════════════════════ */

/* ── MANEJADOR DE ERRORES (desactivado en producción) ── */
// window.onerror y unhandledrejection desactivados
