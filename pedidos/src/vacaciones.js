
// ── MODO VACACIONES ──
function checkVacationMode() {
  firebase.database().ref('config/vacacionesActivo').once('value').then(sn => {
    const activo = sn.val() === true;
    const screen = document.getElementById('vacation-screen');
    if (screen) {
      screen.style.display = activo ? 'flex' : 'none';
    }
  }).catch(() => {});
}
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
  const btn = document.getElementById('vacaciones-toggle-btn');
  const nuevoEstado = !window._vacacionesActivo;
  if (btn) btn.textContent = 'Cargando…';
  window.toggleVacacionesMode(nuevoEstado).then(() => {
    _renderVacacionesBtn(nuevoEstado);
    if (typeof logActivity === 'function') {
      logActivity(nuevoEstado ? '🌴 Modo vacaciones activado' : '🌴 Modo vacaciones desactivado');
    }
  }).catch(() => { if (btn) btn.textContent = '⚠️ Error'; });
}

"use strict";
const _SESSION_ID = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// Declaraciones globales para compatibilidad Safari 12
var _stockSelections = {};
var _stockUnits = {};
var _stockChecks = {};
var _stockNotas = {};
var _stockLimpieza = {};
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

/* ── MODAL DE AVISO (reemplazo de alert() nativo) ──
   Uso: showAlert('Mensaje aquí') en vez de alert('Mensaje aquí')
   Opcionalmente: showAlert('Mensaje', 'Título personalizado') */
function showAlert(msg, title) {
  const modal = document.getElementById('alert-modal');
  if (!modal) { window.alert(msg); return; }
  document.getElementById('alert-title').textContent = title || 'Aviso';
  document.getElementById('alert-msg').textContent = msg;
  modal.classList.add('open');
}
function closeAlert() {
  const modal = document.getElementById('alert-modal');
  if (modal) modal.classList.remove('open');
}

/* ═══════════════════════════════════════════════════
   DULCE PATATA — Lógica principal
   ═══════════════════════════════════════════════════ */

/* ── MANEJADOR DE ERRORES (desactivado en producción) ── */
// window.onerror y unhandledrejection desactivados

