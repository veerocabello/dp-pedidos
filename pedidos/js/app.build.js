
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


/* ── PEDIDOS PROVEEDORES v2 ── */
// ── PEDIDOS PROVEEDORES v2 ──
const PP_KEY = 'dpf_pp2';
const PP_PROVS = [{
  id: 'ali',
  label: 'Ali'
}, {
  id: 'apolo',
  label: 'Apolo'
}, {
  id: 'cocacola',
  label: 'Coca-Cola'
}, {
  id: 'cookies',
  label: 'Cookies'
}, {
  id: 'diplo',
  label: 'Diplo'
}, {
  id: 'disconfa',
  label: 'Disconfa'
}, {
  id: 'elpozo',
  label: 'El Pozo'
}, {
  id: 'esteban',
  label: 'Esteban'
}, {
  id: 'euromozza',
  label: 'Euromozza'
}, {
  id: 'interbread',
  label: 'Interbread'
}, {
  id: 'makro',
  label: 'Makro'
}, {
  id: 'manolo',
  label: 'Manolo'
}, {
  id: 'matutano',
  label: 'Matutano'
}, {
  id: 'mercadona',
  label: 'Mercadona'
}, {
  id: 'otro',
  label: 'Otro'
}, {
  id: 'plata',
  label: 'Plata'
}, {
  id: 'queseria',
  label: 'Quesería Fuente'
}, {
  id: 'sandi',
  label: 'Sandi'
}, {
  id: 'tgt',
  label: 'TGT'
}, {
  id: 'vadis',
  label: 'Vadis'
}, {
  id: 'valleaguirre',
  label: 'Valle Aguirre'
}];
const PP_ITEMS = [
// ❄️ Congelados
{
  cat: '❄️ Congelados',
  id: 'i_kebab',
  nombre: 'Kebab',
  qty: ''
}, {
  cat: '❄️ Congelados',
  id: 'i_carnepicada',
  nombre: 'Carne picada',
  qty: ''
}, {
  cat: '❄️ Congelados',
  id: 'i_tronquitos',
  nombre: 'Tronquitos de mar',
  qty: '1 caja'
}, {
  cat: '❄️ Congelados',
  id: 'i_gambas',
  nombre: 'Gambas',
  qty: '1 caja'
}, {
  cat: '❄️ Congelados',
  id: 'i_york',
  nombre: 'York',
  qty: ''
}, {
  cat: '❄️ Congelados',
  id: 'i_pulledpork',
  nombre: 'Pulled pork',
  qty: '1 caja'
}, {
  cat: '❄️ Congelados',
  id: 'i_bacon',
  nombre: 'Bacon',
  qty: ''
},
// 🥫 Latas / Conservas / Salsas
{
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_tomate',
  nombre: 'Tomate frito',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_aceitunas',
  nombre: 'Aceitunas',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_maiz',
  nombre: 'Maíz',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_zanahoria',
  nombre: 'Zanahoria',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_remolacha',
  nombre: 'Remolacha',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_champinon',
  nombre: 'Champiñones',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_pina',
  nombre: 'Piña',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_alioli',
  nombre: 'Alioli',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_mayo',
  nombre: 'Mayonesa',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_rosa',
  nombre: 'Salsa rosa',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_yogur',
  nombre: 'Salsa de yogur',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_bbq',
  nombre: 'Salsa barbacoa',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_brava',
  nombre: 'Salsa brava',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_ketchup',
  nombre: 'Salsa ketchup',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_roquefort',
  nombre: 'Salsa roquefort',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_mielmostaza',
  nombre: 'Salsa miel mostaza',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 'i_cebolla',
  nombre: 'Cebolla crujiente',
  qty: ''
}, {
  cat: '🥫 Latas / Conservas / Salsas',
  id: 's_natavegcrem',
  nombre: 'Nata Vegecrem',
  qty: ''
},
// 📦 Estantería (Almacén)
{
  cat: '📦 Estantería (Almacén)',
  id: 'i_atun',
  nombre: 'Atún',
  qty: ''
}, {
  cat: '📦 Estantería (Almacén)',
  id: 'p_pistacho',
  nombre: 'Crema de pistacho',
  qty: ''
}, {
  cat: '📦 Estantería (Almacén)',
  id: 'p_kinder',
  nombre: 'Crema Kinder',
  qty: ''
}, {
  cat: '📦 Estantería (Almacén)',
  id: 'p_lotus',
  nombre: 'Crema Lotus',
  qty: ''
},
// 🧊 Frío
{
  cat: '🧊 Frío',
  id: 's_philtartas',
  nombre: 'Philadelphia tarta',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 's_philpapas',
  nombre: 'Philadelphia patatas',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 'p_mantequilla',
  nombre: 'Mantequilla',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 'i_huevo',
  nombre: 'Huevo cocido',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 'p_mascarpone',
  nombre: 'Queso mascarpone',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 'i_4quesos',
  nombre: 'Cuatro quesos',
  qty: ''
}, {
  cat: '🧊 Frío',
  id: 's_rulocabra',
  nombre: 'Rulo de cabra',
  qty: ''
},
// 🎂 Estantería Tartas
{
  cat: '🎂 Estantería Tartas',
  id: 'p_lotus_gal',
  nombre: 'Galleta Lotus',
  qty: ''
}, {
  cat: '🎂 Estantería Tartas',
  id: 'p_dino',
  nombre: 'Galleta Dino',
  qty: ''
}, {
  cat: '🎂 Estantería Tartas',
  id: 'p_mariagal',
  nombre: 'Galleta María Oro',
  qty: ''
}, {
  cat: '🎂 Estantería Tartas',
  id: 'p_filipinos',
  nombre: 'Filipinos blancos',
  qty: ''
}, {
  cat: '🎂 Estantería Tartas',
  id: 'p_donuts',
  nombre: 'Donuts',
  qty: ''
}, {
  cat: '🎂 Estantería Tartas',
  id: 'p_leche',
  nombre: 'Leche Puleva',
  qty: ''
},
// 🥔 Patatas y Verdura
{
  cat: '🥔 Patatas y Verdura',
  id: 'i_patata',
  nombre: 'Sacos de patatas',
  qty: '',
  unit: 'sacos'
}, {
  cat: '🥔 Patatas y Verdura',
  id: 'i_cebollasaco',
  nombre: 'Sacos de cebollas',
  qty: '',
  unit: 'sacos'
}, {
  cat: '🥔 Patatas y Verdura',
  id: 'i_boniato',
  nombre: 'Bolsas boniato pelado',
  qty: ''
},
// 🍪 Masas
{
  cat: '🍪 Masas',
  id: 'p_masacookies',
  nombre: 'Masa cookies',
  qty: ''
},
// 🧀 Quesería
{
  cat: '🧀 Quesería',
  id: 'i_mozzarella',
  nombre: 'Queso mozzarella',
  qty: ''
},
// 📋 Envases / Packaging
{
  cat: '📋 Envases / Packaging',
  id: 'm_bolal',
  nombre: 'Bol de pollo',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_bolpequeno',
  nombre: 'Bol pequeño boniato',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_redondel',
  nombre: 'Redondel tartas plateadas',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_aluminio',
  nombre: 'Papel de aluminio',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_film',
  nombre: 'Papel film',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_bolsasura',
  nombre: 'Cajas de bolsas',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cajpasta12',
  nombre: 'Caja pasta 1/2',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cajpasta14',
  nombre: 'Caja pasta 1/4',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cajpizza',
  nombre: 'Caja pizza',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_termico57',
  nombre: 'Papel térmico 57×35 mm',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_termico80',
  nombre: 'Papel térmico 80 mm',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cucharas',
  nombre: 'Caja cucharas',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cocina',
  nombre: 'Rollo papel cocina / horno',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_horno',
  nombre: 'Caja papel horno',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cacharrillos',
  nombre: 'Cacharrillos salsas pequeños',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_marron',
  nombre: 'Papeles marrones',
  qty: ''
}, {
  cat: '📋 Envases / Packaging',
  id: 'm_cajtartas',
  nombre: 'Caja tartas completas',
  qty: ''
},
// 🍞 Pan
{
  cat: '🍞 Pan',
  id: 'p_panleña',
  nombre: 'Pan de leña',
  qty: ''
}, {
  cat: '🍞 Pan',
  id: 'p_paninis',
  nombre: 'Paninis XXL',
  qty: ''
},
// 🛒 Referencias ALI
{
  cat: '🛒 Referencias ALI',
  id: 'a_aceitunasrod',
  nombre: 'Aceitunas rodajas',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_aceite',
  nombre: 'Aceite de oliva virgen',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_cuajada',
  nombre: 'Cuajada tomates',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_sal',
  nombre: 'Sal',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_azucar',
  nombre: 'Azúcar',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_pimienta',
  nombre: 'Pimienta',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_oregano',
  nombre: 'Orégano',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_eneldo',
  nombre: 'Eneldo',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_hierbas',
  nombre: 'Hierbas provenzales',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_ajo',
  nombre: 'Ajo en polvo',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_nuez',
  nombre: 'Nuez moscada',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'a_pistachos',
  nombre: 'Pistachos',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_nanas',
  nombre: 'Nanas limpieza',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_guantesL',
  nombre: 'Guantes talla L',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_guantesM',
  nombre: 'Guantes talla M',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_fregonas',
  nombre: 'Fregonas',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_cepillos',
  nombre: 'Cepillos',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_recogedor',
  nombre: 'Recogedor',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_trapos',
  nombre: 'Trapos',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_lejia',
  nombre: 'Lejía',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_desengrasante',
  nombre: 'Desengrasante',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_friegasuelos',
  nombre: 'Friegasuelos',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_papel',
  nombre: 'Papel higiénico',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_estropajos',
  nombre: 'Estropajos',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_ambientador',
  nombre: 'Ambientador',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_limpiacristales',
  nombre: 'Limpia cristales',
  qty: ''
}, {
  cat: '🛒 Referencias ALI',
  id: 'l_servilletas',
  nombre: 'Servilletas',
  qty: ''
},
// 🍫 Chocolates y Galletas
{
  cat: '🍫 Chocolates y Galletas',
  id: 'c_chocnegro',
  nombre: 'Chocolate negro',
  qty: ''
}, {
  cat: '🍫 Chocolates y Galletas',
  id: 'c_chocblanco',
  nombre: 'Chocolate blanco',
  qty: ''
}, {
  cat: '🍫 Chocolates y Galletas',
  id: 'c_chocleche',
  nombre: 'Chocolate con leche',
  qty: ''
}, {
  cat: '🍫 Chocolates y Galletas',
  id: 'c_digestive',
  nombre: 'Galleta Digestive',
  qty: ''
}];
let _ppCurrentItem = null; // kept for legacy localStorage compat

document.addEventListener('DOMContentLoaded', () => {
  if (typeof migrateAdminPwdIfNeeded === 'function') migrateAdminPwdIfNeeded();else window._pendingMigrateAdmin = true;
});
document.addEventListener('firebaseReady', () => {
  if (typeof migrateAdminPwdIfNeeded === 'function') migrateAdminPwdIfNeeded();
});
const _origOpenStock = window.openStockConfigSecret;
window.openStockConfigSecret = function () {
  if (_origOpenStock) _origOpenStock();
};

/* ── PEDIDOS PROVEEDORES v3 ── */
// ── PEDIDOS PROVEEDORES v3 (nuevo overlay) ──
const PP2_KEY = 'dpf_pedidos_prov_list';
const PP2_CUSTOM_KEY = 'dpf_pp_custom_items';
const PP2_HIDDEN_KEY = 'dpf_pp_hidden_items';
const PP2_PROV_HAB_KEY = 'dpf_pp_prov_habitual'; // {itemId: provId}
const PP2_MIN_KEY = 'dpf_pp_minimos'; // {itemId: number}
const PP2_HISTORIAL_KEY = 'dpf_pp_historial'; // [{fecha, nota}]
const PP2_CUSTOM_PROV_KEY = 'dpf_pp_custom_provs'; // [{id, label}]

let _pp2DeleteMode = false;
let _pp2DeleteSel = new Set();
let _pp2CurrentItem = null;
let _pp2SearchQuery = '';

// ── helpers ──────────────────────────────────────────────
function pp2LoadState() {
  try {
    return JSON.parse(localStorage.getItem(PP2_KEY) || '{}');
  } catch {
    return {};
  }
}
// Aplica mutatorFn (que modifica el objeto de estado in-place) de forma
// atómica: actualiza localStorage al instante para que la UI responda sin
// esperar, y por separado aplica la MISMA mutación contra el valor más
// reciente de Firebase con una transacción — si dos dispositivos tocan
// cantidades/proveedores a la vez, Firebase reintenta con el dato fresco
// en vez de que uno pise el cambio del otro.
function pp2MutateState(mutatorFn) {
  const s = pp2LoadState();
  mutatorFn(s);
  localStorage.setItem(PP2_KEY, JSON.stringify(s));
  if (window.fb_transactNative) {
    window._pp2LocalWrite = Date.now();
    window.fb_transactNative('pp2/state', function (current) {
      const base = current || {};
      mutatorFn(base);
      return base;
    }).catch(() => {});
  } else if (window.fb_savePP2) {
    window._pp2LocalWrite = Date.now();
    window.fb_savePP2('state', s).catch(() => {});
  }
  return s;
}
function pp2LoadCustom() {
  try {
    return JSON.parse(localStorage.getItem(PP2_CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}
function pp2SaveCustom(a) {
  localStorage.setItem(PP2_CUSTOM_KEY, JSON.stringify(a));
  if (window.fb_savePP2) window.fb_savePP2('custom', a).catch(() => {});
}
function pp2LoadHidden() {
  try {
    return JSON.parse(localStorage.getItem(PP2_HIDDEN_KEY) || '[]');
  } catch {
    return [];
  }
}
function pp2SaveHidden(a) {
  localStorage.setItem(PP2_HIDDEN_KEY, JSON.stringify(a));
  if (window.fb_savePP2) window.fb_savePP2('hidden', a).catch(() => {});
}
function pp2LoadProvHab() {
  try {
    return JSON.parse(localStorage.getItem(PP2_PROV_HAB_KEY) || '{}');
  } catch {
    return {};
  }
}
function pp2SaveProvHab(o) {
  localStorage.setItem(PP2_PROV_HAB_KEY, JSON.stringify(o));
  if (window.fb_savePP2) window.fb_savePP2('provHab', o).catch(() => {});
}
function pp2LoadMinimos() {
  try {
    return JSON.parse(localStorage.getItem(PP2_MIN_KEY) || '{}');
  } catch {
    return {};
  }
}
function pp2SaveMinimos(o) {
  localStorage.setItem(PP2_MIN_KEY, JSON.stringify(o));
  if (window.fb_savePP2) window.fb_savePP2('minimos', o).catch(() => {});
}
function pp2LoadHistorial() {
  try {
    return JSON.parse(localStorage.getItem(PP2_HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function pp2LoadCustomProvs() {
  try {
    return JSON.parse(localStorage.getItem(PP2_CUSTOM_PROV_KEY) || '[]');
  } catch {
    return [];
  }
}
function pp2SaveCustomProvs(a) {
  localStorage.setItem(PP2_CUSTOM_PROV_KEY, JSON.stringify(a));
  if (window.fb_savePP2) window.fb_savePP2('customProvs', a).catch(() => {});
}
function pp2AllProvs() {
  const custom = pp2LoadCustomProvs();
  return [...PP_PROVS, ...custom].sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
function pp2AllItems() {
  return pp2AllItemsOrdered();
}
// Compara el nombre de un ingrediente con la línea del historial de stock
// que le corresponde — antes se usaba un .includes() sin límite de
// palabra en ambos sentidos, así que "Sal" coincidía con cualquier línea
// que contuviera "sal" en medio de otra palabra (p. ej. "Salsa Ketchup"),
// mostrando el stock de un producto distinto en la tarjeta equivocada.
function _stockNombreCoincide(a, b) {
  if (a === b) return true;
  const corto = a.length <= b.length ? a : b;
  const largo = a.length <= b.length ? b : a;
  if (!corto) return false;
  const escapado = corto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(^|[^a-zà-ÿ0-9])' + escapado + '($|[^a-zà-ÿ0-9])', 'i');
  return re.test(largo);
}
function pp2GetStockBadge(itemId, nombre) {
  const minimos = pp2LoadMinimos();
  const min = minimos[itemId] !== undefined ? parseInt(minimos[itemId]) : null;
  try {
    const hist = JSON.parse(localStorage.getItem('dpf_stock_historial') || '[]');
    if (hist.length) {
      const last = hist[hist.length - 1];
      if (last.lines && last.lines.length) {
        for (const line of last.lines) {
          const text = typeof line === 'string' ? line : line.label || line.name || line.ing || '';
          const colonIdx = text.indexOf(':');
          if (colonIdx < 0) continue;
          const lineName = text.slice(0, colonIdx).trim().toLowerCase();
          const lineVal = text.slice(colonIdx + 1).trim();
          const itemName = nombre.toLowerCase();
          if (_stockNombreCoincide(lineName, itemName)) {
            const m = lineVal.match(/^(\d+)\s*(.*)/);
            const qty = m ? parseInt(m[1]) : null;
            const unit = m ? m[2] || '' : lineVal;
            const bajo = min !== null && qty !== null ? qty <= min : qty !== null && qty <= 2;
            return {
              qty: qty !== null ? String(qty) : lineVal,
              unit,
              bajo,
              min
            };
          }
        }
      }
    }
  } catch (e) {}
  // No hay dato de stock pero puede haber mínimo configurado
  return null;
}

// ── overlay open/close ────────────────────────────────────
function openPedidosProvOverlay() {
  _pp2DeleteMode = false;
  _pp2DeleteSel = new Set();
  _pp2SearchQuery = '';
  const _ov = document.getElementById('pedidos-prov-overlay');
  _ov.style.display = 'block';
  _ov.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  // Guardado automático en Firebase cada 10 segundos
  if (window._pp2AutoSaveInterval) clearInterval(window._pp2AutoSaveInterval);
  window._pp2AutoSaveInterval = setInterval(function() {
    const s = pp2LoadState();
    if (Object.keys(s).length > 0 && window.fb_savePP2) {
      window.fb_savePP2('state', s).catch(() => {});
    }
  }, 10000);
  document.getElementById('pp2-delete-confirm-area').style.display = 'none';
  document.getElementById('pp2-delete-btn').textContent = '🗑️ Eliminar producto';
  const sb = document.getElementById('pp2-search');
  if (sb) sb.value = '';
  // Renderizar en el siguiente frame para que el overlay se pinte antes de bloquear el hilo
  requestAnimationFrame(() => {
    let _stockLoaded = false;

    // 🔥 Sincronizar historial de stock desde Firebase ANTES del primer render
    // onValue dispara inmediatamente con los datos actuales — esperamos eso antes de pintar
    if (window.fb_listenStockHistorial) {
      if (window._pp2StockUnsubscribe) {
        try {
          window._pp2StockUnsubscribe();
        } catch (e) {}
      }
      window._pp2StockUnsubscribe = window.fb_listenStockHistorial(data => {
        // fb_listenStockHistorial ya guarda en localStorage antes de llamar aquí
        if (!_stockLoaded) {
          // Primera llamada: datos de stock ya en localStorage, render inmediato
          _stockLoaded = true;
          pp2Render();
        } else if (document.getElementById('pedidos-prov-overlay').style.display !== 'none') {
          // Cambios posteriores: throttle para no interrumpir scroll
          clearTimeout(window._pp2StockRenderTO);
          window._pp2StockRenderTO = setTimeout(() => pp2Render(), 1000);
        }
      });
    } else {
      // Sin Firebase: render directo con localStorage
      pp2Render();
    }

    // 🔥 Listener en tiempo real de cambios de otro dispositivo (pedidos)
    if (window.fb_listenPP2) {
      if (window._pp2Unsubscribe) {
        try {
          window._pp2Unsubscribe();
        } catch (e) {}
      }
      window._pp2Unsubscribe = window.fb_listenPP2(() => {
        if (document.getElementById('pedidos-prov-overlay').style.display !== 'none') {
          if (window._pp2LocalWrite && Date.now() - window._pp2LocalWrite < 2000) return;
          clearTimeout(window._pp2FirebaseRenderTO);
          window._pp2FirebaseRenderTO = setTimeout(() => pp2Render(), 1000);
        }
      });
    }
  });
}
function closePedidosProvOverlay() {
  document.getElementById('pedidos-prov-overlay').style.display = 'none';
  document.body.style.overflow = '';
  if (window._pp2AutoSaveInterval) { clearInterval(window._pp2AutoSaveInterval); window._pp2AutoSaveInterval = null; }
  // Desactivar listeners en tiempo real al cerrar
  if (window._pp2Unsubscribe) {
    try {
      window._pp2Unsubscribe();
    } catch (e) {}
    window._pp2Unsubscribe = null;
  }
  if (window._pp2StockUnsubscribe) {
    try {
      window._pp2StockUnsubscribe();
    } catch (e) {}
    window._pp2StockUnsubscribe = null;
  }
  document.getElementById('pp2-picker').style.display = 'none';
  document.getElementById('pp2-add-modal').style.display = 'none';
  document.getElementById('pp2-pad-modal').style.display = 'none';
  document.getElementById('pp2-hist-modal').style.display = 'none';
  document.getElementById('pp2-min-modal').style.display = 'none';
  _pp2SearchQuery = '';
}

// ── render ───────────────────────────────────────────────
function pp2Render() {
  const state = pp2LoadState();
  const provHab = pp2LoadProvHab();
  let items = pp2AllItems();
  const el = document.getElementById('pp2-items-list');
  if (!el) return;

  // Hoist expensive calls outside the loop — una vez para todos los items
  const allProvs = pp2AllProvs();
  const minimos = pp2LoadMinimos();
  // Parsear historial de stock una sola vez
  let stockLastLines = [];
  try {
    const hist = JSON.parse(localStorage.getItem('dpf_stock_historial') || '[]');
    if (hist.length) {
      const last = hist[hist.length - 1];
      if (last && last.lines) stockLastLines = last.lines;
    }
  } catch (e) {}

  // Función de badge con datos ya cargados (sin tocar localStorage)
  function _stockBadge(itemId, nombre) {
    const min = minimos[itemId] !== undefined ? parseInt(minimos[itemId]) : null;
    for (const line of stockLastLines) {
      const text = typeof line === 'string' ? line : line.label || line.name || line.ing || '';
      const colonIdx = text.indexOf(':');
      if (colonIdx < 0) continue;
      const lineName = text.slice(0, colonIdx).trim().toLowerCase();
      const lineVal = text.slice(colonIdx + 1).trim();
      const itemName = nombre.toLowerCase();
      if (_stockNombreCoincide(lineName, itemName)) {
        const m = lineVal.match(/^(\d+)\s*(.*)/);
        const qty = m ? parseInt(m[1]) : null;
        const unit = m ? m[2] || '' : lineVal;
        const bajo = min !== null && qty !== null ? qty <= min : qty !== null && qty <= 2;
        return {
          qty: qty !== null ? String(qty) : lineVal,
          unit,
          bajo,
          min
        };
      }
    }
    return null;
  }

  // Filtro de búsqueda
  const q = _pp2SearchQuery.trim().toLowerCase();
  if (q) items = items.filter(i => i.nombre.toLowerCase().includes(q));
  if (!items.length) {
    el.innerHTML = '<div style="text-align:center;color:#8A6A4E;padding:24px;font-size:14px">Sin resultados para "' + _pp2SearchQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '"</div>';
    return;
  }
  const visibleCats = [...new Set(items.map(i => i.cat))];
  function _buildCatHTML(cat) {
    const catItems = items.filter(i => i.cat === cat);
    const rows = catItems.map(item => {
      const s = state[item.id] || {};
      const qty = s.qty !== undefined ? s.qty : 0;
      // Si el item tiene unidad fija (ej. sacos), usarla siempre
      const fixedUnit = item.unit || null;
      const unit = fixedUnit || (s.unit !== undefined ? s.unit : 'cajas');
      // Proveedor: usar el del estado, o el habitual si no hay ninguno asignado aún
      const prov = s.prov || provHab[item.id] || '';
      const provObj = allProvs.find(p => p.id === prov);
      const provLabel = provObj ? provObj.label : '';
      const isHabitual = !s.prov && !!provHab[item.id]; // viene del habitual, no del estado actual
      const stock = _stockBadge(item.id, item.nombre);
      const hasQty = qty > 0;
      const bg = '#FFFFFF';
      const border = '#F5E6C8';
      const delCb = _pp2DeleteMode ? "<input type=\"checkbox\" ".concat(_pp2DeleteSel.has(item.id) ? 'checked' : '', " onchange=\"pp2DelToggle('").concat(item.id, "',this.checked)\"\n                   style=\"width:18px;height:18px;accent-color:#c0392b;flex-shrink:0;cursor:pointer;margin-right:2px\">") : '';

      // Badge stock con color según mínimo
      const stockBadge = stock !== null ? "<span data-stock-badge style=\"font-size:13px;font-weight:700;color:".concat(stock.bajo ? '#c0392b' : '#27855a', ";background:").concat(stock.bajo ? '#fdf0ee' : '#eafaf1', ";border:1.5px solid ").concat(stock.bajo ? '#e74c3c' : '#a9dfbf', ";border-radius:8px;padding:2px 10px;white-space:nowrap;flex-shrink:0\">\n                  ").concat(stock.bajo ? '⚠️ ' : '', "En tienda: ").concat(escapeHtml(stock.qty)).concat(stock.unit ? ' ' + escapeHtml(stock.unit) : '').concat(stock.min !== null ? ' (mín. ' + escapeHtml(String(stock.min)) + ')' : '', "\n                 </span>") : '';

      // Botón proveedor: si es habitual lo distinguimos visualmente
      const provBtnStyle = prov ? isHabitual ? "border:1.5px dashed #3D1F0D;background:rgba(244,196,48,0.08);color:#3D1F0D" : "border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D" : "border:1.5px solid #F5E6C8;background:#FFFFFF;color:#8A6A4E";
      return "<div class=\"pp2-row\" id=\"pp2-row-".concat(item.id, "\" data-id=\"").concat(item.id, "\" data-cat=\"").concat(cat.replace(/"/g, '&quot;'), "\"\n                draggable=\"true\"\n                ondragstart=\"pp2DragStart(event)\"\n                ondragover=\"pp2DragOver(event)\"\n                ondrop=\"pp2Drop(event)\"\n                ondragend=\"pp2DragEnd(event)\"\n                ondragleave=\"this.style.background=''\"\n                style=\"display:flex;align-items:center;background:").concat(bg, ";border:2px solid ").concat(border, ";border-radius:12px;padding:11px 14px;margin-bottom:8px;cursor:default\">\n              ").concat(delCb, "\n              <span style=\"font-size:18px;color:#8A6A4E;cursor:grab;padding:0 2px;flex-shrink:0;user-select:none;touch-action:none\" title=\"Arrastrar\">\u283F</span>\n              <div style=\"flex:1;min-width:0\">\n                <div style=\"display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap\">\n                  <span style=\"font-size:15px;font-weight:600;color:#3D1F0D\">").concat(escapeHtml(item.nombre), "</span>\n                  ").concat(stockBadge, "\n                </div>\n                <div style=\"display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap\">\n                  ").concat(fixedUnit ? "<span style=\"padding:3px 9px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif\">".concat(fixedUnit.charAt(0).toUpperCase() + fixedUnit.slice(1), "</span>") : "<button data-unit=\"cajas\" onclick=\"pp2SetUnit('".concat(item.id, "','cajas')\"\n                        style=\"padding:3px 9px;border-radius:6px;border:1.5px solid ").concat(unit === 'cajas' ? '#3D1F0D' : '#F5E6C8', ";background:").concat(unit === 'cajas' ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(unit === 'cajas' ? '#3D1F0D' : '#8A6A4E', ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n                        &#x1F4E6; Cajas\n                      </button>\n                      <button data-unit=\"unidades\" onclick=\"pp2SetUnit('").concat(item.id, "','unidades')\"\n                        style=\"padding:3px 9px;border-radius:6px;border:1.5px solid ").concat(unit === 'unidades' ? '#3D1F0D' : '#F5E6C8', ";background:").concat(unit === 'unidades' ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(unit === 'unidades' ? '#3D1F0D' : '#8A6A4E', ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n                        &#x1F522; Unidades\n                      </button>"), "\n                </div>\n              </div>\n              <div style=\"display:flex;align-items:center;gap:4px;flex-shrink:0\">\n                <button onclick=\"pp2Qty('").concat(item.id, "',-1)\" style=\"width:34px;height:34px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:20px;font-weight:700;cursor:pointer;color:#3D1F0D\">&#x2212;</button>\n                <span data-qty style=\"font-size:18px;font-weight:900;color:#3D1F0D;min-width:24px;text-align:center\">").concat(qty || '', "</span>\n                <button onclick=\"pp2Qty('").concat(item.id, "',1)\" style=\"width:34px;height:34px;border-radius:50%;border:none;background:#3D1F0D;font-size:20px;font-weight:700;cursor:pointer;color:#fff\">+</button>\n              </div>\n              <button data-prov-btn onclick=\"pp2PickerOpen('").concat(item.id, "')\"\n                style=\"flex-shrink:0;padding:5px 10px;border-radius:8px;").concat(provBtnStyle, ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis\">\n                ").concat(prov ? escapeHtml(provLabel) : '+ Prov.', "\n              </button>\n            </div>");
    }).join('');
    return "<div style=\"margin-bottom:4px\">\n            <div style=\"font-family:'Anton',sans-serif;font-size:18px;color:#3D1F0D;margin:14px 0 8px;padding-bottom:6px;border-bottom:2px solid rgba(244,196,48,0.4);display:flex;align-items:center;gap:8px;letter-spacing:0.03em\">".concat(escapeHtml(cat), "</div>\n            ").concat(rows, "\n          </div>");
  }

  // Renderizar por chunks usando requestAnimationFrame para no bloquear el hilo principal
  // con catálogos grandes (muchos productos custom)
  const CHUNK_SIZE = 4; // categorías por frame
  el.innerHTML = '';
  let catIndex = 0;
  function _renderChunk() {
    const fragment = document.createDocumentFragment();
    const end = Math.min(catIndex + CHUNK_SIZE, visibleCats.length);
    for (let i = catIndex; i < end; i++) {
      const div = document.createElement('div');
      div.innerHTML = _buildCatHTML(visibleCats[i]);
      while (div.firstChild) fragment.appendChild(div.firstChild);
    }
    el.appendChild(fragment);
    catIndex = end;
    if (catIndex < visibleCats.length) requestAnimationFrame(_renderChunk);
  }
  requestAnimationFrame(_renderChunk);
}

// ── render de una sola fila (sin redibujar toda la lista) ──
function pp2RenderRow(id) {
  const row = document.getElementById('pp2-row-' + id);
  if (!row) {
    pp2Render();
    return;
  } // fallback si no existe
  const state = pp2LoadState();
  const provHab = pp2LoadProvHab();
  const items = pp2AllItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  const s = state[id] || {};
  const qty = s.qty !== undefined ? s.qty : 0;
  const fixedUnit = item.unit || null;
  const unit = fixedUnit || (s.unit !== undefined ? s.unit : 'cajas');
  const prov = s.prov || provHab[id] || '';
  const allProvs = pp2AllProvs();
  const provObj = allProvs.find(p => p.id === prov);
  const provLabel = provObj ? provObj.label : '';
  const isHabitual = !s.prov && !!provHab[id];
  // Usar datos de stock cacheados para no leer localStorage en cada toque
  let stockLastLinesRow = [];
  try {
    const histRow = JSON.parse(localStorage.getItem('dpf_stock_historial') || '[]');
    if (histRow.length && histRow[histRow.length - 1] && histRow[histRow.length - 1].lines) stockLastLinesRow = histRow[histRow.length - 1].lines;
  } catch (e) {}
  const minimosCached = pp2LoadMinimos();
  function _stockBadgeRow(itemId2, nombre2) {
    const min2 = minimosCached[itemId2] !== undefined ? parseInt(minimosCached[itemId2]) : null;
    for (const line of stockLastLinesRow) {
      const text = typeof line === 'string' ? line : line.label || line.name || line.ing || '';
      const colonIdx = text.indexOf(':');
      if (colonIdx < 0) continue;
      const lineName = text.slice(0, colonIdx).trim().toLowerCase();
      const lineVal = text.slice(colonIdx + 1).trim();
      const itemName2 = nombre2.toLowerCase();
      if (_stockNombreCoincide(lineName, itemName2)) {
        const m = lineVal.match(/^(\d+)\s*(.*)/);
        const qty2 = m ? parseInt(m[1]) : null;
        const unit2 = m ? m[2] || '' : lineVal;
        const bajo2 = min2 !== null && qty2 !== null ? qty2 <= min2 : qty2 !== null && qty2 <= 2;
        return {
          qty: qty2 !== null ? String(qty2) : lineVal,
          unit: unit2,
          bajo: bajo2,
          min: min2
        };
      }
    }
    return null;
  }
  const stock = _stockBadgeRow(id, item.nombre);
  const hasQty = qty > 0;

  // Actualizar fondo y borde
  row.style.background = hasQty ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
  row.style.border = '2px solid ' + (hasQty ? '#3D1F0D' : '#F5E6C8');

  // Actualizar contador qty
  const qtyEl = row.querySelector('[data-qty]');
  if (qtyEl) qtyEl.textContent = qty || '';

  // Actualizar badge stock
  const stockEl = row.querySelector('[data-stock-badge]');
  if (stockEl) {
    if (stock !== null) {
      stockEl.style.color = stock.bajo ? '#c0392b' : '#27855a';
      stockEl.style.background = stock.bajo ? '#fdf0ee' : '#eafaf1';
      stockEl.style.border = '1.5px solid ' + (stock.bajo ? '#e74c3c' : '#a9dfbf');
      stockEl.textContent = (stock.bajo ? '⚠️ ' : '') + 'En tienda: ' + stock.qty + (stock.unit ? ' ' + stock.unit : '') + (stock.min !== null ? ' (mín. ' + stock.min + ')' : '');
      stockEl.style.display = '';
    } else {
      stockEl.style.display = 'none';
    }
  }

  // Actualizar botones de unidad
  if (!fixedUnit) {
    const cajasBtn = row.querySelector('[data-unit="cajas"]');
    const unidBtn = row.querySelector('[data-unit="unidades"]');
    if (cajasBtn) {
      cajasBtn.style.border = '1.5px solid ' + (unit === 'cajas' ? '#3D1F0D' : '#F5E6C8');
      cajasBtn.style.background = unit === 'cajas' ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
      cajasBtn.style.color = unit === 'cajas' ? '#3D1F0D' : '#8A6A4E';
    }
    if (unidBtn) {
      unidBtn.style.border = '1.5px solid ' + (unit === 'unidades' ? '#3D1F0D' : '#F5E6C8');
      unidBtn.style.background = unit === 'unidades' ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
      unidBtn.style.color = unit === 'unidades' ? '#3D1F0D' : '#8A6A4E';
    }
  }

  // Actualizar botón proveedor
  const provBtn = row.querySelector('[data-prov-btn]');
  if (provBtn) {
    if (prov) {
      provBtn.style.border = isHabitual ? '1.5px dashed #3D1F0D' : '1.5px solid #3D1F0D';
      provBtn.style.background = 'rgba(244,196,48,0.08)';
      provBtn.style.color = '#3D1F0D';
      provBtn.textContent = provLabel;
    } else {
      provBtn.style.border = '1.5px solid #F5E6C8';
      provBtn.style.background = '#FFFFFF';
      provBtn.style.color = '#8A6A4E';
      provBtn.textContent = '+ Prov.';
    }
  }
}

// ── quantity & unit ──────────────────────────────────────
function pp2Qty(id, delta) {
  pp2MutateState(function (s) {
    if (!s[id]) s[id] = {};
    s[id].qty = Math.max(0, (s[id].qty || 0) + delta);
  });
  pp2RenderRow(id);
}
function pp2SetUnit(id, unit) {
  pp2MutateState(function (s) {
    if (!s[id]) s[id] = {};
    s[id].unit = unit;
  });
  pp2RenderRow(id);
}

// ── proveedor picker ──────────────────────────────────────
function pp2PickerOpen(itemId) {
  _pp2CurrentItem = itemId;
  const items = pp2AllItems();
  const item = items.find(i => i.id === itemId);
  document.getElementById('pp2-picker-title').textContent = '¿Quién te sirve: ' + (item ? item.nombre : '') + '?';
  const state = pp2LoadState();
  const provHab = pp2LoadProvHab();
  const current = (state[itemId] || {}).prov || provHab[itemId] || '';
  const habitual = provHab[itemId] || '';
  const btns = document.getElementById('pp2-picker-btns');
  btns.innerHTML = pp2AllProvs().map(p => {
    const isSelected = current === p.id;
    const isHab = habitual === p.id && !isSelected;
    return "<button onclick=\"pp2PickerSelect('".concat(p.id, "')\"\n            style=\"padding:8px 14px;border-radius:10px;border:2px solid ").concat(isSelected ? '#3D1F0D' : isHab ? '#3D1F0D' : '#F5E6C8', ";background:").concat(isSelected ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(isSelected ? '#3D1F0D' : '#2A1506', ";font-size:13px;font-weight:").concat(isSelected ? '700' : '500', ";cursor:pointer;font-family:'DM Sans',sans-serif;position:relative\">\n            ").concat(escapeHtml(p.label)).concat(isHab ? ' <span style="font-size:9px;vertical-align:super;color:#3D1F0D">habitual</span>' : '', "\n          </button>");
  }).join('') + "<button onclick=\"pp2NuevoProveedorModal()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #27855a;background:#eafaf1;color:#27855a;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x2795; Nuevo proveedor\n        </button>\n        <button onclick=\"pp2EliminarProveedorModal()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #c0392b;background:#fdf0ee;color:#c0392b;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x1F5D1; Eliminar proveedor\n        </button>" + "<button onclick=\"pp2PickerClose()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #ccc;background:#f5f5f5;color:#888;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x2715; Salir\n        </button>";
  const picker = document.getElementById('pp2-picker');
  picker.style.display = 'flex';
}
function pp2PickerSelect(provId) {
  pp2MutateState(function (s) {
    if (!s[_pp2CurrentItem]) s[_pp2CurrentItem] = {};
    s[_pp2CurrentItem].prov = provId;
  });
  // Guardar como habitual si se asigna uno (no si se quita)
  if (provId) {
    const hab = pp2LoadProvHab();
    hab[_pp2CurrentItem] = provId;
    pp2SaveProvHab(hab);
  }
  const _itemToUpdate = _pp2CurrentItem;
  pp2PickerClose();
  pp2RenderRow(_itemToUpdate);
}
function pp2PickerClose() {
  document.getElementById('pp2-picker').style.display = 'none';
  _pp2CurrentItem = null;
}
function pp2NuevoProveedorModal() {
  const nombre = prompt('Nombre del nuevo proveedor:');
  if (!nombre || !nombre.trim()) return;
  const label = nombre.trim();
  const id = 'cprov_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  const custom = pp2LoadCustomProvs();
  if ([...PP_PROVS, ...custom].some(p => p.label.toLowerCase() === label.toLowerCase())) {
    alert('Ya existe un proveedor con ese nombre');
    return;
  }
  custom.push({
    id,
    label
  });
  pp2SaveCustomProvs(custom);
  pp2PickerSelect(id);
}
function pp2EliminarProveedorModal() {
  const custom = pp2LoadCustomProvs();
  if (!custom.length) {
    alert('No hay proveedores personalizados que eliminar.\nLos proveedores predefinidos no se pueden borrar.');
    return;
  }
  const lista = custom.map((p, i) => "".concat(i + 1, ". ").concat(p.label)).join('\n');
  const input = prompt('Proveedores personalizados:\n' + lista + '\n\nEscribe el nombre exacto del que quieres eliminar:');
  if (!input || !input.trim()) return;
  const idx = custom.findIndex(p => p.label.toLowerCase() === input.trim().toLowerCase());
  if (idx < 0) {
    alert('No encontrado. Escribe el nombre exacto.');
    return;
  }
  if (!confirm('¿Eliminar el proveedor "' + custom[idx].label + '"?')) return;
  custom.splice(idx, 1);
  pp2SaveCustomProvs(custom);
  pp2PickerClose();
  pp2PickerOpen(_pp2CurrentItem);
}

// ── add product ───────────────────────────────────────────
function pp2AddProductModal() {
  document.getElementById('pp2-add-name').value = '';
  document.getElementById('pp2-add-cat-nueva').style.display = 'none';
  document.getElementById('pp2-add-cat-nueva').value = '';
  // Añadir categorías custom al select si las hay
  const sel = document.getElementById('pp2-add-cat');
  const customCats = [...new Set(pp2LoadCustom().map(i => i.cat))].filter(c => !Array.from(sel.options).some(o => o.value === c) && c !== '__nueva__');
  customCats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.insertBefore(opt, sel.querySelector('[value="__nueva__"]'));
  });
  sel.value = sel.options[0].value;
  document.getElementById('pp2-add-modal').style.display = 'block';
  setTimeout(() => document.getElementById('pp2-add-name').focus(), 100);
}
function pp2CatSelectChange(sel) {
  const input = document.getElementById('pp2-add-cat-nueva');
  if (sel.value === '__nueva__') {
    input.style.display = 'block';
    setTimeout(() => input.focus(), 100);
  } else {
    input.style.display = 'none';
    input.value = '';
  }
}
function pp2AddProductModalClose() {
  document.getElementById('pp2-add-modal').style.display = 'none';
}
function pp2AddProductConfirm() {
  const nombre = document.getElementById('pp2-add-name').value.trim();
  let cat = document.getElementById('pp2-add-cat').value;
  if (cat === '__nueva__') {
    cat = document.getElementById('pp2-add-cat-nueva').value.trim();
    if (!cat) {
      alert('Escribe el nombre de la nueva sección');
      return;
    }
  }
  if (!nombre) {
    alert('Escribe el nombre del producto');
    return;
  }
  const custom = pp2LoadCustom();
  const id = 'custom_' + Date.now();
  custom.push({
    cat,
    id,
    nombre,
    qty: ''
  });
  pp2SaveCustom(custom);
  pp2AddProductModalClose();
  pp2Render();
}

// ── delete mode ───────────────────────────────────────────
function pp2ToggleDeleteMode() {
  _pp2DeleteMode = !_pp2DeleteMode;
  _pp2DeleteSel = new Set();
  const btn = document.getElementById('pp2-delete-btn');
  const confirm = document.getElementById('pp2-delete-confirm-area');
  btn.textContent = _pp2DeleteMode ? '❌ Cancelar eliminación' : '🗑️ Eliminar producto';
  confirm.style.display = _pp2DeleteMode ? 'block' : 'none';
  pp2Render();
}
function pp2DelToggle(id, checked) {
  if (checked) _pp2DeleteSel.add(id);else _pp2DeleteSel.delete(id);
}
function pp2ConfirmDelete() {
  if (!_pp2DeleteSel.size) {
    alert('Selecciona al menos un producto');
    return;
  }
  if (!confirm('¿Eliminar los productos seleccionados? Los predefinidos se ocultarán.')) return;

  // Custom items: remove fully
  let custom = pp2LoadCustom();
  custom = custom.filter(i => !_pp2DeleteSel.has(i.id));
  pp2SaveCustom(custom);

  // Built-in items: add to hidden list
  const hidden = pp2LoadHidden();
  const builtinIds = PP_ITEMS.map(i => i.id);
  _pp2DeleteSel.forEach(id => {
    if (builtinIds.includes(id) && !hidden.includes(id)) hidden.push(id);
  });
  pp2SaveHidden(hidden);
  _pp2DeleteMode = false;
  _pp2DeleteSel = new Set();
  document.getElementById('pp2-delete-btn').textContent = '🗑️ Eliminar producto';
  document.getElementById('pp2-delete-confirm-area').style.display = 'none';
  pp2Render();
}

// ── nueva semana ─────────────────────────────────────────
function pp2NuevaSemana() {
  if (!confirm('¿Nueva semana? Se borran todas las cantidades. Los proveedores habituales se mantienen y se precargarán automáticamente.')) return;
  // Limpiar cantidades y proveedores del estado; los habituales se aplican en render
  pp2MutateState(function (s) {
    Object.keys(s).forEach(id => {
      s[id].qty = 0;
      s[id].prov = '';
      s[id].unit = s[id].unit || 'cajas';
    });
  });
  pp2Render();
  const t = document.getElementById('pp2-toast');
  t.textContent = '🔄 ¡Nueva semana! Proveedores habituales precargados.';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2500);
}

// ── historial de pedidos ──────────────────────────────────
function pp2GuardarEnHistorial(nota) {
  const fecha = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
  const entrada = { fecha, nota };
  // Añadir la entrada localmente al instante (UI responde ya)...
  const histLocal = pp2LoadHistorial();
  histLocal.push(entrada);
  if (histLocal.length > 50) histLocal.shift();
  localStorage.setItem(PP2_HISTORIAL_KEY, JSON.stringify(histLocal));
  // ...y de forma atómica contra Firebase, para no perder el pedido que
  // otro dispositivo acaba de guardar en el historial casi al mismo tiempo.
  if (window.fb_transactNative) {
    window.fb_transactNative('pp2/historial', function (current) {
      const hist = Array.isArray(current) ? current.slice() : [];
      hist.push(entrada);
      if (hist.length > 50) hist.shift();
      return hist;
    }).catch(() => {});
  } else if (window.fb_savePP2) {
    window.fb_savePP2('historial', histLocal).catch(() => {});
  }
}
function pp2VerHistorial() {
  const hist = pp2LoadHistorial();
  const modal = document.getElementById('pp2-hist-modal');
  const list = document.getElementById('pp2-hist-list');
  if (!hist.length) {
    list.innerHTML = '<p style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin historial aún. Los pedidos enviados por WhatsApp se guardan aquí automáticamente.</p>';
  } else {
    // Mostrar de más antiguo (índice 0) a más reciente (último)
    list.innerHTML = hist.map((h, i) => "\n            <div style=\"border:1.5px solid #F5E6C8;border-radius:10px;padding:12px;margin-bottom:10px;background:#FFFFFF\">\n              <div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap\">\n                <span style=\"font-size:17px;font-weight:900;color:#3D1F0D\">\uD83D\uDCE6 ".concat(escapeHtml(h.fecha), "</span>\n                <div style=\"display:flex\">\n                  <button onclick=\"pp2HistDescargar(").concat(i, ")\" style=\"font-size:11px;padding:3px 8px;background:#FFFFFF;color:#3D1F0D;border:1.5px solid #F5E6C8;border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif\">\uD83D\uDCBE</button>\n                  <button onclick=\"pp2HistRecargar(").concat(i, ")\" style=\"font-size:11px;padding:3px 10px;background:rgba(244,196,48,0.08);color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif\">Usar de base</button>\n                </div>\n              </div>\n              <pre style=\"font-size:12px;color:#2A1506;white-space:pre-wrap;margin:0;line-height:1.5;font-family:'DM Sans',sans-serif\">").concat(escapeHtml(h.nota), "</pre>\n            </div>")).join('');
  }
  modal.style.display = 'block';
}
function pp2HistDescargar(i) {
  const hist = pp2LoadHistorial();
  if (!hist[i]) return;
  const h = hist[i];
  const nombreFecha = h.fecha.replace(/[/:, ]/g, '-').replace(/-+/g, '-');
  const blob = new Blob([h.nota], {
    type: 'text/plain;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedido_' + nombreFecha + '.txt';
  a.click();
  URL.revokeObjectURL(url);
}
function pp2HistExportarTodo() {
  const hist = pp2LoadHistorial();
  if (!hist.length) {
    alert('Sin historial todavía');
    return;
  }
  // Construir un único .txt con todos los pedidos de más antiguo a más reciente
  const texto = hist.map((h, i) => '═══════════════════════════════\n' + '  PEDIDO #' + (i + 1) + ' — ' + h.fecha + '\n' + '═══════════════════════════════\n' + h.nota).join('\n\n');
  const blob = new Blob([texto], {
    type: 'text/plain;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historial_pedidos_proveedores.txt';
  a.click();
  URL.revokeObjectURL(url);
}
function pp2HistRecargar(i) {
  // Muestra la nota del historial en el pad para reusarla
  const hist = pp2LoadHistorial();
  if (!hist[i]) return;
  document.getElementById('pp2-pad-text').value = hist[i].nota;
  document.getElementById('pp2-pad-copy-ok').style.display = 'none';
  document.getElementById('pp2-hist-modal').style.display = 'none';
  document.getElementById('pp2-pad-modal').style.display = 'block';
}

// ── mínimos de stock ──────────────────────────────────────
function pp2VerMinimos() {
  const minimos = pp2LoadMinimos();
  const items = pp2AllItems();
  const modal = document.getElementById('pp2-min-modal');
  const list = document.getElementById('pp2-min-list');
  list.innerHTML = items.map(item => {
    const val = minimos[item.id] !== undefined ? minimos[item.id] : '';
    return "<div style=\"display:flex;align-items:center;padding:7px 0;border-bottom:1px solid #F5E6C8\">\n            <span style=\"flex:1;font-size:13px;font-weight:600;color:#3D1F0D\">".concat(escapeHtml(item.nombre), "</span>\n            <input type=\"number\" min=\"0\" value=\"").concat(val, "\" placeholder=\"\u2014\"\n              onchange=\"pp2SetMinimo('").concat(item.id, "',this.value)\"\n              style=\"width:64px;padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-align:center;outline:none;background:#FFFFFF\">\n          </div>");
  }).join('');
  modal.style.display = 'block';
}
function pp2SetMinimo(id, val) {
  const minimos = pp2LoadMinimos();
  const n = parseInt(val);
  if (isNaN(n) || n < 0) delete minimos[id];else minimos[id] = n;
  pp2SaveMinimos(minimos);
}

// ── guardar ───────────────────────────────────────────────
function pp2Save() {
  // Construir nota con lo que haya (con o sin proveedor asignado)
  const state = pp2LoadState();
  const items = pp2AllItems();
  const conQty = items.filter(item => {
    const s = state[item.id] || {};
    return s.qty && s.qty > 0;
  });
  if (!conQty.length) {
    const t = document.getElementById('pp2-toast');
    t.textContent = '⚠️ No hay cantidades para guardar';
    t.style.display = 'block';
    clearTimeout(t._to);
    t._to = setTimeout(() => t.style.display = 'none', 2000);
    return;
  }
  // Agrupar por proveedor (o "Sin asignar")
  const allProvs = pp2AllProvs();
  const byProv = {};
  conQty.forEach(item => {
    const s = state[item.id] || {};
    const prov = s.prov || '__sin__';
    if (!byProv[prov]) byProv[prov] = [];
    byProv[prov].push(item);
  });
  const sortedProvs = Object.keys(byProv).sort((a, b) => {
    if (a === '__sin__') return 1;
    if (b === '__sin__') return -1;
    const la = (allProvs.find(p => p.id === a) || {
      label: a
    }).label;
    const lb = (allProvs.find(p => p.id === b) || {
      label: b
    }).label;
    return la.localeCompare(lb, 'es');
  });
  let txt = '🛒 PEDIDO\n';
  sortedProvs.forEach(provId => {
    const provLabel = provId === '__sin__' ? 'SIN PROVEEDOR' : (allProvs.find(p => p.id === provId) || {
      label: provId
    }).label.toUpperCase();
    txt += '\n' + provLabel + ':\n';
    byProv[provId].forEach(item => {
      const s = state[item.id] || {};
      const fixedUnit = item.unit || null;
      const unit = fixedUnit || (s.unit === 'unidades' ? 'ud' : s.qty > 1 ? 'cajas' : 'caja');
      txt += '  ' + item.nombre + ' — ' + s.qty + ' ' + unit + '\n';
    });
  });
  pp2GuardarEnHistorial(txt.trim());
  const t = document.getElementById('pp2-toast');
  t.textContent = '✅ Guardado en historial';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 1800);
}

// ── nota del pedido (agrupada por proveedor) ──────────────
function pp2BuildNota() {
  const state = pp2LoadState();
  const items = pp2AllItems();
  const byProv = {};
  items.forEach(item => {
    const s = state[item.id] || {};
    if (!s.qty || s.qty <= 0) return;
    // Antes, si se ponía cantidad pero se olvidaba asignar proveedor, el
    // ingrediente se omitía en silencio del pedido (aquí y en el enviado
    // por WhatsApp) sin ningún aviso. Ahora se agrupa bajo "SIN
    // PROVEEDOR", igual que ya hacía pp2Save() al guardar en el historial.
    const prov = s.prov || '__sin__';
    if (!byProv[prov]) byProv[prov] = [];
    byProv[prov].push(item);
  });
  if (!Object.keys(byProv).length) return null;
  const sortedProvs = Object.keys(byProv).sort((a, b) => {
    if (a === '__sin__') return 1;
    if (b === '__sin__') return -1;
    const la = (PP_PROVS.find(p => p.id === a) || {
      label: a
    }).label;
    const lb = (PP_PROVS.find(p => p.id === b) || {
      label: b
    }).label;
    return la.localeCompare(lb, 'es');
  });
  let txt = '🛒 PEDIDO\n';
  sortedProvs.forEach(provId => {
    const allProvs = pp2AllProvs();
    const provLabel = provId === '__sin__' ? 'SIN PROVEEDOR' : (allProvs.find(p => p.id === provId) || {
      label: provId
    }).label.toUpperCase();
    txt += '\n' + provLabel + ':\n';
    byProv[provId].forEach(item => {
      const s = state[item.id] || {};
      const fixedUnit = item.unit || null;
      const unit = fixedUnit || (s.unit === 'unidades' ? 'ud' : s.qty > 1 ? 'cajas' : 'caja');
      txt += '  ' + item.nombre + ' — ' + s.qty + ' ' + unit + '\n';
    });
  });
  return txt.trim();
}
function pp2SaveToPad() {
  const txt = pp2BuildNota();
  if (!txt) {
    alert('No hay productos con cantidad puesta');
    return;
  }
  document.getElementById('pp2-pad-text').value = txt;
  document.getElementById('pp2-pad-copy-ok').style.display = 'none';
  document.getElementById('pp2-pad-modal').style.display = 'block';
}
function pp2PadCopy() {
  const ta = document.getElementById('pp2-pad-text');
  ta.select();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).catch(() => {
        document.execCommand('copy');
      });
    } else {
      document.execCommand('copy');
    }
  } catch {
    document.execCommand('copy');
  }
  const ok = document.getElementById('pp2-pad-copy-ok');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2000);
}
function pp2PadWA() {
  const txt = document.getElementById('pp2-pad-text').value;
  if (!txt) return;
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

// ── WhatsApp export ───────────────────────────────────────
function pp2ExportWA() {
  const txt = pp2BuildNota();
  if (!txt) {
    alert('No hay productos con cantidad puesta');
    return;
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

// ── order persistence ─────────────────────────────────────
const PP2_ORDER_KEY = 'dpf_pp_order';
function pp2LoadOrder() {
  try {
    return JSON.parse(localStorage.getItem(PP2_ORDER_KEY) || 'null');
  } catch {
    return null;
  }
}
function pp2SaveOrder(ids) {
  localStorage.setItem(PP2_ORDER_KEY, JSON.stringify(ids));
  if (window.fb_savePP2) window.fb_savePP2('order', ids).catch(() => {});
}

// Returns all items in persisted order, patching in any new items at the end
function pp2AllItemsOrdered() {
  const hidden = pp2LoadHidden();
  const custom = pp2LoadCustom();
  const builtin = PP_ITEMS.filter(i => !hidden.includes(i.id));
  const all = [...builtin, ...custom];
  const savedOrder = pp2LoadOrder();
  if (!savedOrder) return all;
  // Build map for quick lookup
  const byId = {};
  all.forEach(i => byId[i.id] = i);
  // Apply saved order, skipping deleted/hidden items
  const ordered = savedOrder.filter(id => byId[id]).map(id => byId[id]);
  // Append any new items not yet in savedOrder
  all.forEach(i => {
    if (!savedOrder.includes(i.id)) ordered.push(i);
  });
  return ordered;
}

// ── drag & drop ────────────────────────────────────────────
let _pp2DragSrc = null;
function pp2DragStart(e) {
  _pp2DragSrc = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    if (_pp2DragSrc) _pp2DragSrc.style.opacity = '0.4';
  }, 0);
}
function pp2DragEnd(e) {
  // Siempre restaurar opacidad al soltar, haya caído donde haya caído
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('.pp2-row').forEach(r => {
    r.style.opacity = '1';
    r.style.background = '';
  });
  _pp2DragSrc = null;
}
function pp2DragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const row = e.currentTarget;
  if (row && row !== _pp2DragSrc) row.style.background = 'rgba(244,196,48,0.08)';
}
function pp2Drop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target) target.style.background = '';
  if (!_pp2DragSrc || _pp2DragSrc === target) {
    _pp2DragSrc = null;
    return;
  }
  if (_pp2DragSrc) _pp2DragSrc.style.opacity = '';
  const srcId = _pp2DragSrc.dataset.id;
  const tgtId = target.dataset.id;
  _pp2DragSrc = null;
  _pp2ReorderItems(srcId, tgtId);
}

// ── touch drag ────────────────────────────────────────────
// Los listeners van al overlay, no al document, para no interferir con el scroll
let _pp2TouchDragEl = null,
  _pp2TouchClone = null,
  _pp2TouchStartY2 = 0;
function _pp2TouchStartHandler(e) {
  const handle = e.target.closest('[title="Arrastrar"]');
  if (!handle) return;
  const row = handle.closest('.pp2-row');
  if (!row) return;
  _pp2TouchDragEl = row;
  _pp2TouchStartY2 = e.touches[0].clientY;
  _pp2TouchClone = row.cloneNode(true);
  _pp2TouchClone.style.cssText = 'position:fixed;left:' + row.getBoundingClientRect().left + 'px;top:' + row.getBoundingClientRect().top + 'px;width:' + row.offsetWidth + 'px;' + 'opacity:0.75;z-index:9999;pointer-events:none;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.18);transition:none';
  document.body.appendChild(_pp2TouchClone);
  row.style.opacity = '0.3';
  // Bloquear scroll del overlay solo mientras hay drag activo
  const ov = document.getElementById('pedidos-prov-overlay');
  if (ov) ov.style.overflow = 'hidden';
}
function _pp2TouchMoveHandler(e) {
  if (!_pp2TouchDragEl || !_pp2TouchClone) return;
  e.preventDefault(); // solo cuando hay drag activo
  const dy = e.touches[0].clientY - _pp2TouchStartY2;
  const orig = _pp2TouchDragEl.getBoundingClientRect();
  _pp2TouchClone.style.top = orig.top + dy + 'px';
}
function _pp2TouchEndHandler(e) {
  if (!_pp2TouchDragEl || !_pp2TouchClone) return;
  const y = e.changedTouches[0].clientY;
  document.body.removeChild(_pp2TouchClone);
  _pp2TouchClone = null;
  _pp2TouchDragEl.style.opacity = '';
  // Restaurar scroll del overlay
  const ov = document.getElementById('pedidos-prov-overlay');
  if (ov) ov.style.overflow = 'scroll';
  const cat = _pp2TouchDragEl.dataset.cat;
  const siblings = [...document.querySelectorAll('.pp2-row')].filter(s => s.dataset.cat === cat);
  let best = null,
    bestDist = Infinity;
  siblings.forEach(s => {
    if (s === _pp2TouchDragEl) return;
    const r = s.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (Math.abs(mid - y) < bestDist) {
      bestDist = Math.abs(mid - y);
      best = {
        el: s,
        above: y < mid
      };
    }
  });
  const srcId = _pp2TouchDragEl.dataset.id;
  _pp2TouchDragEl = null;
  if (best) _pp2ReorderItems(srcId, best.el.dataset.id);
}

// Adjuntar al overlay en vez de document — así no toca el scroll del resto de la página
const _pp2Overlay = document.getElementById('pedidos-prov-overlay');
if (_pp2Overlay) {
  _pp2Overlay.addEventListener('touchstart', _pp2TouchStartHandler, {
    passive: true
  });
  // touchmove necesita passive:false para poder llamar preventDefault durante drag
  _pp2Overlay.addEventListener('touchmove', _pp2TouchMoveHandler, {
    passive: false
  });
  _pp2Overlay.addEventListener('touchend', _pp2TouchEndHandler, {
    passive: true
  });
}
function _pp2ReorderItems(srcId, targetId) {
  const items = pp2AllItemsOrdered();
  const ids = items.map(i => i.id);
  const srcIdx = ids.indexOf(srcId);
  const targetIdx = ids.indexOf(targetId);
  if (srcIdx < 0 || targetIdx < 0) return;
  ids.splice(srcIdx, 1);
  ids.splice(targetIdx, 0, srcId);
  pp2SaveOrder(ids);
  pp2Render();
}


/* ── LÓGICA PRINCIPAL ── */
// ─────────────────────────────────────────
//  CONFIGURACIÓN — rellena estos valores
// ─────────────────────────────────────────
const CONFIG = {
  emailjs_public_key: "Euum_k_XJdrejjnKj",
  // de emailjs.com
  emailjs_service_id: "service_bil4ri5",
  emailjs_template_id: "template_ee4f7sp",
  store_email: "dulcepatata.admin@gmail.com" // tu email de tienda
};
// ─────────────────────────────────────────

const MENU = [
// ── PATATAS ──
{
  id: 1,
  cat: "Patatas",
  name: "Patata Simple",
  desc: "Aceite de oliva o mantequilla, sal y pimienta",
  price: 3.00
}, {
  id: 2,
  cat: "Patatas",
  name: "Patata Vegetal",
  desc: "Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural",
  price: 5.60
}, {
  id: 3,
  cat: "Patatas",
  name: "Patata Picante",
  desc: "Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas",
  price: 5.60
}, {
  id: 4,
  cat: "Patatas",
  name: "Patata Carbonara",
  desc: "Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 5,
  cat: "Patatas",
  name: "Patata Boloñesa",
  desc: "Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario",
  price: 5.80
}, {
  id: 6,
  cat: "Patatas",
  name: "Patata Hawaiana",
  desc: "Mayonesa, york, aceitunas, maíz, piña y queso mozzarella",
  price: 5.80
}, {
  id: 7,
  cat: "Patatas",
  name: "Patata Kebab",
  desc: "Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla",
  price: 5.90
}, {
  id: 8,
  cat: "Patatas",
  name: "Patata 4 Quesos",
  desc: "Salsa roquefort, emmental, gouda y mozzarella",
  price: 5.90
}, {
  id: 9,
  cat: "Patatas",
  name: "Patata Completa",
  desc: "Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón",
  price: 6.20
}, {
  id: 10,
  cat: "Patatas",
  name: "Patata Carnívora",
  desc: "Alioli, york, bacon, kebab y carne picada",
  price: 6.40
}, {
  id: 11,
  cat: "Patatas",
  name: "Patata Philadelphia",
  desc: "Salsa philadelphia, york, huevo, pollo, queso mozzarella",
  price: 6.40
}, {
  id: 12,
  cat: "Patatas",
  name: "Patata Ranchera",
  desc: "Salsa ranchera, pollo, bacon y queso mozzarella",
  price: 6.50
}, {
  id: 13,
  cat: "Patatas",
  name: "Patata Granollers",
  desc: "Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria",
  price: 6.50
}, {
  id: 14,
  cat: "Patatas",
  name: "Patata Pulled Pork 🆕",
  desc: "Salsa barbacoa, cebolla, carne pulled pork y mozzarella",
  price: 6.50
}, {
  id: 50,
  cat: "Patatas",
  name: "Patata Cheddar-Bacon 🆕",
  desc: "Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado",
  price: 8.50
}, {
  id: 15,
  cat: "Patatas",
  name: "Patata Al Gusto",
  desc: "1 salsa a elegir y 6 ingredientes",
  price: 6.90
}, {
  id: 16,
  cat: "Patatas",
  name: "Patata Bomba 🆕",
  desc: "9 ingredientes y/o salsas al gusto ¡sin límite!",
  price: 8.40
},
// ── BONIATO FRIES ──
{
  id: 17,
  cat: "Boniato",
  name: "Boniato Fries",
  desc: "Tarrina de boniato fries",
  price: 4.50
}, {
  id: 18,
  cat: "Boniato",
  name: "Boniato Lotus",
  desc: "Salsa Lotus + bacon + queso mozzarella + galletas Lotus",
  price: 5.50
}, {
  id: 19,
  cat: "Boniato",
  name: "Boniato Bacon",
  desc: "Salsa a elegir + bacon + queso mozzarella",
  price: 5.50
}, {
  id: 20,
  cat: "Boniato",
  name: "Boniato G.O.A.T.",
  desc: "Salsa miel mostaza + cebolla crujiente + queso de cabra",
  price: 5.50
}, {
  id: 21,
  cat: "Boniato",
  name: "Boniato Pistacchio 🆕",
  desc: "Crema de pistacho + queso mozzarella + pistacho crujiente",
  price: 5.50
},
// ── PANINIS ──
{
  id: 22,
  cat: "Paninis",
  name: "Panini Jamón York y Queso",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 23,
  cat: "Paninis",
  name: "Panini Carbonara",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 24,
  cat: "Paninis",
  name: "Panini Barbacoa",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 25,
  cat: "Paninis",
  name: "Panini Kebab",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
}, {
  id: 26,
  cat: "Paninis",
  name: "Panini 4 Quesos",
  desc: "Pan de leña crujiente · medio metro",
  price: 5.50
},
// ── COOKIES ──
{
  id: 27,
  cat: "Cookies",
  name: "Crumbl Cookie Pistacho",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 28,
  cat: "Cookies",
  name: "Crumbl Cookie Lotus",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 29,
  cat: "Cookies",
  name: "Crumbl Cookie Oreo",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 30,
  cat: "Cookies",
  name: "Crumbl Cookie Kit Kat",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 31,
  cat: "Cookies",
  name: "Crumbl Cookie Nutella",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 32,
  cat: "Cookies",
  name: "Crumbl Cookie Kinder",
  desc: "Recién horneada",
  price: 2.99
}, {
  id: 33,
  cat: "Cookies",
  name: "Crumbl Cookie Huesitos Blanco",
  desc: "Recién horneada",
  price: 2.99
},
// ── TARTAS ──
{
  id: 34,
  cat: "Tartas",
  name: "Tarta de Queso La Viña",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 35,
  cat: "Tartas",
  name: "Tarta Tres Chocolates",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 36,
  cat: "Tartas",
  name: "Tarta de la Abuela",
  desc: "Clásica · elaboración propia",
  price: 3.40
}, {
  id: 37,
  cat: "Tartas",
  name: "Tarta de Queso Lotus",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 38,
  cat: "Tartas",
  name: "Tarta de Queso Pistacho",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 39,
  cat: "Tartas",
  name: "Tarta de Queso Dinosaurio",
  desc: "Especial · elaboración propia",
  price: 3.90
}, {
  id: 40,
  cat: "Tartas",
  name: "Tarta de Queso Kinder",
  desc: "Especial · elaboración propia",
  price: 3.90
},
// ── BEBIDAS ──
{
  id: 41,
  cat: "Bebidas",
  name: "Refresco lata",
  desc: "",
  price: 1.10
}, {
  id: 42,
  cat: "Bebidas",
  name: "Cerveza lata",
  desc: "",
  price: 1.20
}, {
  id: 43,
  cat: "Bebidas",
  name: "Agua pequeña",
  desc: "",
  price: 0.80
}, {
  id: 44,
  cat: "Bebidas",
  name: "Refresco 500 ml",
  desc: "",
  price: 1.80
}, {
  id: 45,
  cat: "Bebidas",
  name: "Cerveza 1 litro",
  desc: "",
  price: 1.80
}, {
  id: 46,
  cat: "Bebidas",
  name: "Monster o Red Bull",
  desc: "",
  price: 1.80
}, {
  id: 47,
  cat: "Bebidas",
  name: "Agua 1,5 litros",
  desc: "",
  price: 1.30
}, {
  id: 48,
  cat: "Bebidas",
  name: "Nestea / Aquarius 1,5 l",
  desc: "",
  price: 2.20
}, {
  id: 49,
  cat: "Bebidas",
  name: "Refresco 2 litros",
  desc: "",
  price: 2.50
}];
let cart = {};
window._adminLoggedIn = false;
let _adminLoggedIn = false; // true solo cuando hay sesión de admin activa
let activeCategory = "Todos";
const categories = ["Todos", ...new Set(MENU.map(i => i.cat))];
function initTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = categories.map(c => "<button class=\"tab ".concat(c === activeCategory ? 'active' : '', "\" onclick=\"setCategory('").concat(c, "')\">").concat(c, "</button>")).join('');
}
function setCategory(cat) {
  activeCategory = cat;
  initTabs();
  renderMenu();
}

// renderMenu definida más abajo con soporte completo (soldout, hidden, custom, extras)

function showClosedToast() {
  var t = document.getElementById("closed-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "closed-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    t.innerHTML = "🔒 Estamos cerrados · Puedes consultar la carta";
    document.body.appendChild(t);
  }
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 2800);
}
// Toast genérico reutilizable — mismo patrón que showClosedToast(), para
// confirmar visualmente acciones rápidas (copiar algo al portapapeles, etc.)
// que antes no daban ningún feedback.
function showCopyToast(msg) {
  var t = document.getElementById("copy-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "copy-toast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    document.body.appendChild(t);
  }
  t.innerHTML = msg;
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 1800);
}
function copiarTexto(text, mensajeExito) {
  function onOk() { showCopyToast(mensajeExito || "✅ Copiado"); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onOk).catch(function () {
      _copiarConExecCommand(text);
      onOk();
    });
  } else {
    _copiarConExecCommand(text);
    onOk();
  }
}
function _copiarConExecCommand(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}
// Contador de caracteres restantes para el campo de notas — antes solo se
// sabía que se había llegado al límite de 300 cuando el textarea dejaba de
// aceptar más texto, sin ningún aviso previo.
function _actualizarContadorNotas(textareaId, counterId) {
  const ta = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!ta || !counter) return;
  const max = parseInt(ta.getAttribute('maxlength'), 10) || 300;
  const restantes = max - ta.value.length;
  counter.textContent = restantes + ' caracteres restantes';
  counter.style.color = restantes <= 20 ? '#c0392b' : 'var(--muted, #8A6A4E)';
}
// Muestra el aviso de dato que falta/es inválido Y desplaza hasta el campo
// correspondiente, resaltándolo un instante — antes solo salía la alerta,
// sin llevar al cliente hasta dónde está el problema (con el formulario
// largo, tocaba buscarlo a ojo). Detecta si el cliente está en el drawer
// móvil (donde los campos visibles son drawer-customer-*, no los del
// formulario de escritorio que solo se sincronizan por debajo) para
// desplazarse al campo que de verdad se ve en pantalla.
function _alertaConFoco(msg, fieldIdBase) {
  showAlert(msg);
  const drawer = document.getElementById('cart-drawer');
  const enDrawer = drawer && drawer.classList.contains('open');
  const fieldId = enDrawer ? ('drawer-' + fieldIdBase) : fieldIdBase;
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.classList.add('campo-con-error');
  setTimeout(() => field.classList.remove('campo-con-error'), 2000);
  setTimeout(() => { if (typeof field.focus === 'function') field.focus(); }, 350);
}
// Un único "ding" suave al confirmar el pedido — mismo patrón (Web Audio,
// sin archivos externos) que ya usa _sonidoCelebracion() en la ruleta, pero
// una sola nota discreta en vez del arpegio de premio.
function _sonidoConfirmacionPedido() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880; // La5
    const start = ctx.currentTime;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.55);
    setTimeout(() => ctx.close(), 900);
  } catch (e) { /* si el navegador bloquea el audio, no pasa nada — solo se pierde el sonido */ }
}
function isShopBlocked() {
  var _document$getElementB;
  // 1. Si el banner de cerrado está visible
  const banner = document.getElementById('orders-closed-banner');
  if (banner && banner.style.display === 'block') return true;
  // 2. Si los pedidos están pausados manualmente
  if (!getOrdersOpen()) return true;
  // 3. Si hoy es día cerrado
  if (!isTodayOpen()) return true;
  // 4. Si estamos fuera del horario de apertura
  if (isOutsideHours()) return true;
  // 5. Fallback: texto del estado
  const statusText = ((_document$getElementB = document.getElementById('hero-status-text')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.textContent) || '';
  if (statusText.startsWith('Abrimos a las') || statusText === 'Cerrado ahora' || statusText === 'Cerrado hoy') return true;
  return false;
}
function changeQty(id, delta) {
  // Bloquear añadir al carrito si hoy es día cerrado o pedidos pausados
  if (delta > 0 && isShopBlocked()) {
    showClosedToast();
    return;
  }
  if ((id === 15 || id === 16) && delta > 0) {
    openCustomizer(id);
    return;
  }
  if (id === CHEDDAR_ID && delta > 0) {
    openCheddarModal();
    return;
  }
  if (ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(id) && delta > 0) {
    openExtrasModal(id);
    return;
  }
  const current = cart[id] || 0;
  const next = current + delta;
  if (next <= 0) delete cart[id];else cart[id] = next;
  renderMenu();
  renderCart();
  if (delta > 0) _animateAddToCart(id);
}
function _animateAddToCart(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    const btn = card.querySelector('.add-btn, .qty-btn:last-child');
    if (btn) {
      btn.classList.remove('popping');
      void btn.offsetWidth;
      btn.classList.add('popping');
      btn.addEventListener('animationend', () => btn.classList.remove('popping'), {
        once: true
      });
      // Confirmación visual más clara que solo el rebote: el botón muestra
      // un ✓ un instante y una miniatura "vuela" hasta el carrito/FAB.
      btn.classList.add('add-check');
      btn.textContent = '✓';
      clearTimeout(btn._addCheckTimer);
      btn._addCheckTimer = setTimeout(() => {
        btn.classList.remove('add-check');
        btn.textContent = '+';
      }, 550);
      _lanzarFlyGhost(btn);
    }
    card.classList.remove('flashing');
    void card.offsetWidth;
    card.classList.add('flashing');
    card.addEventListener('animationend', () => card.classList.remove('flashing'), {
      once: true
    });
  }
  const fab = document.getElementById('cart-fab');
  if (fab && !fab.classList.contains('hidden')) {
    fab.classList.remove('bumping');
    void fab.offsetWidth;
    fab.classList.add('bumping');
    fab.addEventListener('animationend', () => fab.classList.remove('bumping'), {
      once: true
    });
  }
  const count = document.getElementById('cart-fab-count');
  if (count) {
    count.classList.remove('popping');
    void count.offsetWidth;
    count.classList.add('popping');
    count.addEventListener('animationend', () => count.classList.remove('popping'), {
      once: true
    });
  }
}
// Crea una miniatura que "vuela" desde el botón pulsado hasta el carrito
// (el FAB en móvil, o el contador de "Tu pedido" en escritorio, donde no
// hay FAB) — refuerzo visual de que el producto se ha añadido, más allá
// del rebote del propio botón.
function _lanzarFlyGhost(btn) {
  const fab = document.getElementById('cart-fab');
  const target = (fab && !fab.classList.contains('hidden')) ? fab : document.getElementById('cart-count');
  if (!target) return;
  const btnRect = btn.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!btnRect.width || !targetRect.width) return;
  const ghost = document.createElement('div');
  ghost.className = 'fly-ghost';
  ghost.textContent = '🥔';
  const size = 26;
  ghost.style.left = (btnRect.left + btnRect.width / 2 - size / 2) + 'px';
  ghost.style.top = (btnRect.top + btnRect.height / 2 - size / 2) + 'px';
  const dx = (targetRect.left + targetRect.width / 2) - (btnRect.left + btnRect.width / 2);
  const dy = (targetRect.top + targetRect.height / 2) - (btnRect.top + btnRect.height / 2);
  ghost.style.setProperty('--fly-target', 'translate(' + dx + 'px,' + dy + 'px)');
  document.body.appendChild(ghost);
  requestAnimationFrame(() => ghost.classList.add('flying'));
  setTimeout(() => ghost.remove(), 650);
}
// ── 🍰 Venta sugerida: dulce de postre ──────────────────────────────────────
// Siempre sugiere tarta o galleta (nunca bebida). Varía según lo que ya
// lleve el pedido: cantidad de patatas/boniatos (singular/plural) y, si
// detecta un sabor con tarta a juego (Lotus, Pistacho, Kinder, Dinosaurio),
// sugiere esa tarta en concreto en vez de la genérica.

const UPSELL_TARTA_IDS = { 34: 'La Viña', 35: 'Tres Chocolates', 36: 'de la Abuela', 37: 'Lotus', 38: 'Pistacho', 39: 'Dinosaurio', 40: 'Kinder' };
const UPSELL_GALLETA_IDS = [27, 28, 29, 30, 31, 32, 33]; // Pistacho, Lotus, Oreo, Kit Kat, Nutella, Kinder, Huesitos
const UPSELL_SABOR_TARTA = { 'lotus': 37, 'pistacho': 38, 'dinosaurio': 39, 'kinder': 40 };
const UPSELL_PESADAS = ['cheddar-bacon', 'carnívora', '4 quesos'];

function _upsellDismissedThisSession() {
  try { return sessionStorage.getItem('upsell_dulce_dismissed') === '1'; } catch (e) { return false; }
}
function dismissUpsellDulce() {
  try { sessionStorage.setItem('upsell_dulce_dismissed', '1'); } catch (e) {}
  renderCart();
}

// Devuelve { pregunta, opciones: [{id, name, price, emoji}, ...] } o null si no toca mostrar sugerencia
function getUpsellDulce() {
  if (_upsellDismissedThisSession()) return null;

  // Cantidad de patatas/boniatos en el pedido: cart normal + custCart (Al Gusto/Bomba)
  // + extrasCart (patatas con queso/gratinado, como Philadelphia, Carbonara, Carnívora, etc.)
  const papasIdsCart = Object.entries(cart).filter(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato') && qty > 0;
  });
  const papasCartQty = papasIdsCart.reduce((s, [, q]) => s + q, 0);

  const papasCustQty = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => s + c.qty, 0);

  const extrasPatatas = Object.values(extrasCart).filter(c => {
    if (c.qty <= 0) return false;
    const item = MENU.find(m => m.id == c.menuId);
    return item && (item.cat === 'Patatas' || item.cat === 'Boniato');
  });
  const papasExtrasQty = extrasPatatas.reduce((s, c) => s + c.qty, 0);

  const papasQty = papasCartQty + papasCustQty + papasExtrasQty;

  if (papasQty === 0) return null; // sin patatas/boniato, no aplica

  // Si ya hay tarta o galleta en el carrito, ya está "vendido" → no mostrar
  const yaHayDulce = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && (item.cat === 'Tartas' || item.cat === 'Cookies') && cart[id] > 0;
  });
  if (yaHayDulce) return null;

  const esPlural = papasQty >= 2;
  const pregunta = esPlural ? '¿Le metéis algo dulce de postre?' : '¿Le metes algo dulce de postre?';

  // ¿Algún producto del carrito (cart o extrasCart) tiene sabor con tarta a juego?
  const nombresCart = papasIdsCart.map(([id]) => (MENU.find(m => m.id == id) || {}).name || '');
  const nombresExtras = extrasPatatas.map(c => (MENU.find(m => m.id == c.menuId) || {}).name || '');
  const nombresEnCarrito = [...nombresCart, ...nombresExtras].join(' ').toLowerCase();
  let tartaSaborId = null;
  for (const sabor in UPSELL_SABOR_TARTA) {
    if (nombresEnCarrito.includes(sabor)) {
      tartaSaborId = UPSELL_SABOR_TARTA[sabor];
      break;
    }
  }

  // Se eligen 2-3 opciones (tarta con sabor a juego primero, si aplica) y se
  // guardan en caché por sesión para no volver a sortear otras al repintar
  // el carrito (p.ej. tras comprobar fidelización mientras el cliente sigue
  // escribiendo) — eso daba la sensación de que las tarjetas "parpadeaban".
  // Si cambia de singular a plural (añade una segunda patata) sí se
  // recalcula, porque el fondo de opciones a elegir es distinto.
  if (!window._upsellOpcionesElegidas || window._upsellOpcionesElegidas.esPlural !== esPlural) {
    const elegidos = [];
    if (tartaSaborId) elegidos.push(tartaSaborId);
    const pool = (esPlural ? Object.keys(UPSELL_TARTA_IDS).map(Number) : UPSELL_GALLETA_IDS)
      .filter(id => !elegidos.includes(id));
    // Barajar el resto del fondo y completar hasta 3 opciones en total
    const barajado = pool.slice().sort(() => Math.random() - 0.5);
    for (const id of barajado) {
      if (elegidos.length >= 3) break;
      elegidos.push(id);
    }
    window._upsellOpcionesElegidas = { esPlural, ids: elegidos.slice(0, 3) };
  }

  const opciones = window._upsellOpcionesElegidas.ids
    .map(id => MENU.find(m => m.id === id))
    .filter(Boolean)
    .map(it => ({ id: it.id, name: it.name, price: it.price, emoji: it.cat === 'Tartas' ? '🎂' : '🍪' }));
  if (!opciones.length) return null;

  // Se usa en submitOrder() para saber si el aviso llegó a mostrarse de
  // verdad (para las estadísticas de "mostrado vs añadido").
  window._upsellFueMostrado = true;

  return { pregunta, opciones };
}

function renderUpsellDulce() {
  const sug = getUpsellDulce();
  if (!sug) return '';
  const opcionesHtml = sug.opciones.map(op =>
    '<div class="upsell-dulce-opcion">'
    + '<span class="upsell-dulce-opcion-name">' + escapeHtml(op.name) + '</span>'
    + '<span class="upsell-dulce-opcion-price">' + op.price.toFixed(2).replace('.', ',') + ' €</span>'
    + '<button class="upsell-dulce-opcion-add" onclick="changeQty(' + op.id + ',1)">+ Añadir</button>'
    + '</div>'
  ).join('');
  return '<div class="upsell-dulce">'
    + '<div class="upsell-dulce-row1">'
    + '<div class="upsell-dulce-icon">' + sug.opciones[0].emoji + '</div>'
    + '<div class="upsell-dulce-question">' + sug.pregunta + '</div>'
    + '<button class="upsell-dulce-dismiss" onclick="dismissUpsellDulce()" title="No, gracias">&#10005;</button>'
    + '</div>'
    + '<div class="upsell-dulce-opciones">' + opcionesHtml + '</div>'
    + '</div>';
}

function renderCart() {
  const lines = Object.entries(cart);
  const custLines = Object.values(custCart).filter(c => c.qty > 0);
  const countEl = document.getElementById("cart-count");
  const bodyEl = document.getElementById("cart-body");
  const totalRowEl = document.getElementById("cart-total-row");
  const formEl = document.getElementById("order-form");
  const extLines = Object.values(extrasCart).filter(c => c.qty > 0);
  const totalItems = lines.reduce((s, _ref) => {
    let _ref2 = _slicedToArray(_ref, 2),
      q = _ref2[1];
    return s + q;
  }, 0) + custLines.reduce((s, c) => s + c.qty, 0) + extLines.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = totalItems;
  if (lines.length === 0 && custLines.length === 0 && extLines.length === 0) {
    bodyEl.innerHTML = "<div class=\"cart-empty\"><div class=\"cart-empty-icon\">\uD83D\uDED2</div><div class=\"cart-empty-title\">Tu carrito est\xE1 en ayunas</div><div class=\"cart-empty-sub\">dale algo de comer, anda...</div></div>" + _bimbaTarjetaRepetirPedido();
    totalRowEl.style.display = "none";
    if (formEl) formEl.style.display = "none";
    _updateCartFab(0, 0);
    return;
  }
  let total = 0;
  const linesHtml = lines.map(_ref3 => {
    let _ref4 = _slicedToArray(_ref3, 2),
      id = _ref4[0],
      qty = _ref4[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('renderCart: producto no encontrado id=' + id);
      return '';
    }
    const subtotal = item.price * qty;
    total += subtotal;
    return "\n    <div class=\"cart-line\">\n      <span class=\"cart-line-name\">".concat(item.name, "</span>\n      <span class=\"cart-line-qty\">x").concat(qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"removeItem(").concat(id, ")\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const custLinesHtml = custLines.map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('renderCart: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients].join(', ');
    return "\n    <div class=\"cart-line\" style=\"flex-wrap:wrap\">\n      <span class=\"cart-line-name\" style=\"width:100%\">".concat(item.name, "\n        <span style=\"font-size:11px;color:#8A6A4E;font-weight:400;display:block\">").concat(details, "</span>\n      </span>\n      <span class=\"cart-line-qty\">x").concat(c.qty, "</span>\n      <span class=\"cart-line-price\">").concat(subtotal.toFixed(2), " \u20AC</span>\n      <button class=\"cart-remove\" onclick=\"removeCustItem('").concat(c.key.replace(/'/g, "\\'"), "')\" title=\"Quitar\">&#128465;</button>\n    </div>");
  }).join('');
  const extLinesHtml = extLines.map(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const _extItem = MENU.find(m => m.id == c.menuId);
    if (!_extItem) {
      console.error('renderCart: extras item no encontrado menuId=' + c.menuId);
      return '';
    }
    const itemName = _extItem.name;
    const extras = [];
    if (c.queso) extras.push('+ Queso +1,00€');
    if (c.gratinado) extras.push('+ Gratinado +0,50€');
    (c.salsasExtra || []).forEach(salsa => extras.push('+ ' + salsa + ' +0,90€'));
    return '<div class="cart-line" style="flex-wrap:wrap">' + '<span class="cart-line-name" style="width:100%">' + itemName + (extras.length ? '<span style="font-size:11px;color:#8A6A4E;font-weight:400;display:block">' + extras.join(' · ') + '</span>' : '') + '</span>' + '<span class="cart-line-qty">x' + c.qty + '</span>' + '<span class="cart-line-price">' + subtotal.toFixed(2) + ' €</span>' + '<button class="cart-remove" onclick="removeExtrasItem(\'' + c.key.replace(/'/g, "\\'") + '\')" title="Quitar">&#128465;</button>' + '</div>';
  }).join('');
  const cartHtml = linesHtml + custLinesHtml + extLinesHtml + renderUpsellDulce();
  bodyEl.innerHTML = cartHtml;

  // Mostrar línea de gastos de gestión si está activa — salvo que el
  // cliente haya metido el código de "pedido desde el local" (para cuando
  // hay cola y se pide desde el móvil sin cargo, solo ese pedido)
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  // El código local exime SIEMPRE al gasto fijo que sea "de gestión" —
  // puede ser el 1º o el 2º según cómo estén configurados ahora mismo, así
  // que se identifica por su etiqueta, no por su posición. Si ninguno de
  // los dos menciona "gestión" (p.ej. se renombraron del todo), se exime
  // el primero por defecto para no perder la exención.
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2LabelParaExencion = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(_fee2LabelParaExencion);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
  const feeEl = document.getElementById('cart-fee-row');
  if (feeEl) {
    if (feeEnabled) {
      feeEl.style.display = 'flex';
      document.getElementById('cart-fee-label').textContent = feeLabel;
      document.getElementById('cart-fee-amount').textContent = feeAmount.toFixed(2).replace('.', ',') + ' €';
    } else {
      feeEl.style.display = 'none';
    }
  }
  // El enlace de "código del local" solo tiene sentido si hay algún gasto
  // de gestión activo que quitar (con el código puesto o sin él) — puede
  // ser el 1º o el 2º gasto fijo, según cuál esté etiquetado como gestión.
  const localCodeRowEl = document.getElementById('local-fee-code-row');
  const _hayGestionQueQuitar = getFeeEnabled() || ((typeof getFee2Enabled === 'function') && getFee2Enabled());
  if (localCodeRowEl) localCodeRowEl.style.display = (_hayGestionQueQuitar && getLocalFeeCode()) ? 'block' : 'none';
  // Segundo gasto fijo, independiente del anterior (su propio interruptor) —
  // también se exime con el código local si es este el que está etiquetado
  // como "de gestión" (ver arriba).
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  const fee2El = document.getElementById('cart-fee2-row');
  if (fee2El) {
    if (fee2Enabled) {
      fee2El.style.display = 'flex';
      document.getElementById('cart-fee2-label').textContent = fee2Label;
      document.getElementById('cart-fee2-amount').textContent = fee2Amount.toFixed(2).replace('.', ',') + ' €';
    } else {
      fee2El.style.display = 'none';
    }
  }
  // Mostrar línea de descuento si hay un código aplicado (manual o ganado
  // en la ruleta/rasca) — antes el total mostrado en el carrito nunca
  // reflejaba el descuento (solo se calculaba al confirmar el pedido), así
  // que aunque el código sí se aplicaba de verdad, la clienta no veía
  // ningún cambio en el número y parecía que no había pasado nada.
  const discountAmt = (typeof getDiscountAmount === 'function') ? getDiscountAmount(total) : 0;
  const discountCode = (typeof _activeDiscount !== 'undefined' && _activeDiscount) ? _activeDiscount.code : null;
  const discountEl = document.getElementById('cart-discount-row');
  if (discountEl) {
    if (discountAmt > 0 && discountCode) {
      discountEl.style.display = 'flex';
      document.getElementById('cart-discount-label').textContent = 'Descuento (' + discountCode + ')';
      document.getElementById('cart-discount-amount').textContent = '-' + discountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      discountEl.style.display = 'none';
    }
  }
  // Premio de fidelización (patata gratis) — mismo cálculo que usa
  // submitOrder() al confirmar (getFidelizacionDescuento en
  // carrito-checkout.js), para que el total mostrado mientras se compra
  // ya lo refleje en vez de solo cambiar al confirmar el pedido.
  const _fidTelInput = document.getElementById('customer-phone');
  const _fidPhoneClean = _fidTelInput ? _fidTelInput.value.replace(/\D/g, '').slice(0, 9) : '';
  const fidelizacionAmt = (typeof getFidelizacionDescuento === 'function') ? getFidelizacionDescuento(_fidPhoneClean) : 0;
  const fidelizacionEl = document.getElementById('cart-fidelizacion-row');
  if (fidelizacionEl) {
    if (fidelizacionAmt > 0) {
      fidelizacionEl.style.display = 'flex';
      document.getElementById('cart-fidelizacion-amount').textContent = '-' + fidelizacionAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      fidelizacionEl.style.display = 'none';
    }
  }
  // Descuento estudiante/jubilado — el cliente lo marca él mismo (se
  // comprueba el carné al cobrar en caja, ver comentario junto a la
  // casilla en index.html) y se suma al resto de descuentos, igual que ya
  // se suman el código promocional y el premio de fidelización.
  const studentDiscountRowEl = document.getElementById('student-discount-row');
  const studentDiscountEnabledCfg = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled();
  if (studentDiscountRowEl) studentDiscountRowEl.style.display = studentDiscountEnabledCfg ? 'block' : 'none';
  const studentDiscountChecked = studentDiscountEnabledCfg && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const studentDiscountPctCfg = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  const studentDiscountAmt = studentDiscountChecked ? Math.round(total * studentDiscountPctCfg) / 100 : 0;
  const studentDiscountEl = document.getElementById('cart-student-discount-row');
  if (studentDiscountEl) {
    if (studentDiscountAmt > 0) {
      studentDiscountEl.style.display = 'flex';
      document.getElementById('cart-student-discount-label').textContent = '🪪 Estudiante/jubilado (-' + studentDiscountPctCfg + '%)';
      document.getElementById('cart-student-discount-amount').textContent = '-' + studentDiscountAmt.toFixed(2).replace('.', ',') + ' €';
    } else {
      studentDiscountEl.style.display = 'none';
    }
  }
  const grandTotal = Math.max(0, total + (feeEnabled ? feeAmount : 0) + (fee2Enabled ? fee2Amount : 0) - discountAmt - fidelizacionAmt - studentDiscountAmt);
  document.getElementById("cart-total").textContent = grandTotal.toFixed(2).replace('.', ',') + " €";
  // Etiqueta de ahorro total (código de descuento + fidelización juntos) —
  // la línea verde de cada uno ya existía, pero un badge aparte resalta
  // más el ahorro real que solo ver un número distinto en el total.
  const totalAhorro = discountAmt + fidelizacionAmt + studentDiscountAmt;
  const savingsEl = document.getElementById('cart-savings-badge');
  if (savingsEl) {
    if (totalAhorro > 0) {
      savingsEl.style.display = 'block';
      document.getElementById('cart-savings-amount').textContent = '¡Ahorras ' + totalAhorro.toFixed(2).replace('.', ',') + ' €!';
    } else {
      savingsEl.style.display = 'none';
    }
  }

  // Only show total and form if orders are open
  // IMPORTANTE: renderSlotPicker() debe ejecutarse ANTES de _syncCartDrawer(),
  // porque _syncCartDrawer() (a través de _syncDrawerSlotPicker()) copia el
  // estado visible de #slot-picker-group al drawer móvil. Si se sincroniza
  // primero, el drawer copia el estado del render ANTERIOR (desactualizado),
  // provocando que "Hora de recogida" no aparezca en el drawer justo tras
  // el primer cambio de carrito (bug intermitente en móvil).
  if (getOrdersOpen()) {
    totalRowEl.style.display = "flex";
    formEl.style.display = "block";
    renderSlotPicker();
  } else {
    totalRowEl.style.display = "none";
    formEl.style.display = "none";
  }

  // Sync mobile FAB and drawer (debe ir DESPUÉS de renderSlotPicker)
  _updateCartFab(totalItems, grandTotal);
  _syncCartDrawer(cartHtml, grandTotal, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg);
}

// ── REPETIR ÚLTIMO PEDIDO ──
// dpf_ultimo_pedido lo guarda antifraude.js justo después de confirmar un
// pedido (a diferencia de dpf_active_order, este no caduca) — si existe y
// el carrito está vacío, se ofrece repetirlo con un toque en vez de
// obligar a repasar toda la carta otra vez.
function _bimbaTarjetaRepetirPedido() {
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return '';
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items) || !data.items.length) return '';
    const lineas = data.items.map(i => '<b>' + i.qty + '×</b> ' + i.name).join('<br>');
    return '<div class="repeat-card">' +
      '<div class="repeat-card__label">🔁 Pediste esto la última vez</div>' +
      '<div class="repeat-card__items">' + lineas + '</div>' +
      '<button type="button" class="repeat-card__btn" onclick="repetirUltimoPedido()">Repetir pedido — ' + (data.total || 0).toFixed(2).replace('.', ',') + ' €</button>' +
      '</div>';
  } catch (e) { return ''; }
}
function repetirUltimoPedido() {
  if (isShopBlocked()) { showClosedToast(); return; }
  try {
    const raw = localStorage.getItem('dpf_ultimo_pedido');
    if (!raw) return;
    const data = JSON.parse(raw);
    let algoOmitido = false;
    const disponible = id => {
      const item = MENU.find(m => m.id == id);
      return item && !item.hidden && !item.soldout;
    };
    Object.entries(data.cart || {}).forEach(([id, qty]) => {
      if (!disponible(id)) { algoOmitido = true; return; }
      cart[id] = (cart[id] || 0) + qty;
    });
    Object.entries(data.custCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      custCart[key] = c;
    });
    Object.entries(data.extrasCart || {}).forEach(([key, c]) => {
      if (!disponible(c.menuId)) { algoOmitido = true; return; }
      extrasCart[key] = c;
    });
    renderMenu();
    renderCart();
    showCopyToast(algoOmitido ? '⚠️ Algún producto ya no está disponible y se omitió' : '✅ Pedido anterior añadido al carrito');
  } catch (e) {}
}


// Fetch con límite de tiempo — sin esto, si el servidor va lento o la
// petición se queda "colgada" (no falla, simplemente nunca responde), el
// cliente podía quedarse esperando indefinidamente en pantallas como
// "Enviando pedido…" o "Verificando…" sin ningún mensaje ni forma de saber
// si va a llegar respuesta alguna vez. Se usa en las peticiones que el
// cliente ve/espera directamente (guardar pedido, SMS, fidelización).
function _fetchConTimeout(url, opciones, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms || 12000);
  return fetch(url, Object.assign({}, opciones, { signal: controller.signal }))
    .finally(() => clearTimeout(timeoutId));
}

// ── FAB y DRAWER (solo móvil) ──────────────────────────────────────────────
function _updateCartFab(count, total) {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  // No mostrar FAB si estamos en la pantalla de éxito
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  if (count === 0 || successVisible) {
    fab.classList.add('hidden');
  } else {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = count;
    document.getElementById('cart-fab-total').textContent = total.toFixed(2).replace('.', ',') + ' €';
  }
  // Botón "repetir último pedido" (solo móvil): ocupa el mismo hueco que
  // el FAB del carrito cuando este está vacío — nunca se muestran los dos
  // a la vez porque uno solo aparece cuando el otro está oculto.
  const repeatFab = document.getElementById('repeat-order-fab');
  if (repeatFab) {
    let hayUltimoPedido = false;
    try { hayUltimoPedido = !!localStorage.getItem('dpf_ultimo_pedido'); } catch (e) {}
    repeatFab.classList.toggle('hidden', count !== 0 || successVisible || !hayUltimoPedido);
  }
}
function _syncCartDrawer(cartHtml, total, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg) {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  const ordersOpen = getOrdersOpen();
  // Fuente de verdad de la casilla estudiante/jubilado: la del formulario
  // de escritorio, igual que el código local — así el drawer siempre
  // refleja el valor real aunque se marcara desde el otro formulario.
  const _estudianteCheckedDrawer = !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // El código local exime al gasto fijo etiquetado como "de gestión", sea
  // el 1º o el 2º — ver el comentario largo en carta.js/renderCart() para
  // el porqué (identificarlo por posición se rompía si se configuraban al
  // revés de lo esperado).
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  discountAmt = discountAmt || 0;
  fidelizacionAmt = fidelizacionAmt || 0;
  let html = cartHtml;
  if (feeEnabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(feeLabel, "</span><span>").concat(feeAmount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (fee2Enabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(fee2Label, "</span><span>").concat(fee2Amount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  // Enlace para meter el c\u00F3digo de "pedido desde el local" \u2014 se lee el valor
  // actual del campo (si ya exist\u00EDa) para no borrarlo en cada repintado.
  if (getFeeEnabled() && (typeof getLocalFeeCode === 'function') && getLocalFeeCode()) {
    // Se lee del campo de escritorio (fuente de verdad para _modoLocalActivo,
    // incluso cuando el código llega por la URL del QR, no solo al escribirlo
    // aquí en el drawer) para que el móvil siempre refleje el valor real.
    const _codigoLocalActual = (document.getElementById('local-fee-code-input') || {}).value || '';
    const _cajaAbierta = !!_codigoLocalActual || (document.getElementById('drawer-local-fee-code-box') && document.getElementById('drawer-local-fee-code-box').style.display !== 'none');
    html += "<div style=\"padding:4px 0 8px\">"
      + "<a href=\"#\" onclick=\"event.preventDefault();var b=document.getElementById('drawer-local-fee-code-box');b.style.display=b.style.display==='none'?'flex':'none';\" style=\"font-size:11.5px;color:#8A6A4E;text-decoration:underline\">\u00BFEst\u00E1s pidiendo desde el local?</a>"
      + "<div id=\"drawer-local-fee-code-box\" style=\"display:".concat(_cajaAbierta ? 'flex' : 'none', ";gap:6px;margin-top:6px;align-items:center\">")
      + "<input id=\"drawer-local-fee-code-input\" type=\"text\" maxlength=\"8\" placeholder=\"C\u00F3digo\" value=\"".concat(escapeHtml(_codigoLocalActual), "\" oninput=\"this.value=this.value.toUpperCase();document.getElementById('local-fee-code-input').value=this.value;comprobarCodigoLocal()\" style=\"flex:1;padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-transform:uppercase;outline:none\">")
      + "</div><div id=\"drawer-local-fee-code-feedback\" style=\"font-size:11.5px;margin-top:4px\"></div>"
      + "</div>";
  }
  // L\u00EDnea de descuento \u2014 mismo dato que ya calcul\u00F3 renderCart() para el
  // panel de escritorio (#cart-discount-row), para que el drawer m\u00F3vil
  // tambi\u00E9n deje claro por qu\u00E9 el total baj\u00F3 (c\u00F3digo manual o premio
  // ganado en la ruleta/rasca).
  if (discountAmt > 0 && discountCode) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>".concat('Descuento (' + discountCode + ')', "</span><span>-").concat(discountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (fidelizacionAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83C\uDF81 Patata gratis (fidelizaci\u00F3n)</span><span>-".concat(fidelizacionAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  studentDiscountAmt = studentDiscountAmt || 0;
  if (studentDiscountAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83E\uDEAA Estudiante/jubilado (-".concat(studentDiscountPctCfg, "%)</span><span>-").concat(studentDiscountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  const _ahorroDrawer = discountAmt + fidelizacionAmt + studentDiscountAmt;
  if (_ahorroDrawer > 0) {
    html += "<div style=\"margin:2px 0 4px\"><span class=\"cart-savings-pill\">\uD83C\uDF89 \u00A1Ahorras ".concat(_ahorroDrawer.toFixed(2).replace('.', ','), " \u20AC!</span></div>");
  }
  html += "<div class=\"cart-total\" style=\"display:flex;margin-top:12px\"><span>Total</span><span>".concat(total.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  if (ordersOpen) {
    // Si ya sabemos (en memoria) que hay premio activo para el teléfono actual,
    // lo incluimos directamente en el HTML generado para que sobreviva a
    // cualquier repintado del drawer (renderCart se llama muy a menudo: cada
    // minuto, al volver de segundo plano, al cambiar el carrito, etc.)
    // Igual que ya se hacía con el teléfono: leer el valor actual del campo
    // del nombre ANTES de reconstruir el drawer, para que sobreviva al
    // repintado (si no, cualquier actualización de fondo mientras el
    // cliente estaba escribiendo su nombre lo dejaba vacío sin que se
    // notara, y al confirmar el pedido se borraba y saltaba "escribe tu
    // nombre" aunque ya lo hubiera escrito).
    const _nombreActualDrawer = (document.getElementById('drawer-customer-name') || {}).value || '';
    const _telActualDrawer = (document.getElementById('drawer-customer-phone') || {}).value || '';
    const _digitsActualDrawer = _telActualDrawer.replace(/\D/g, '').slice(0, 9);
    const _premioHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div id=\"fidelizacion-premio-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF81 \xA1Tienes una patata gratis disponible! A\xF1ade cualquier patata del men\xFA y se aplicar\xE1 el descuento autom\xE1ticamente al confirmar.</div>"
      : (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === _digitsActualDrawer
        ? "<div id=\"fidelizacion-proximo-sello-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF89 \xA1Este es tu pedido n\xFAmero 10! Al confirmarlo, tu patata gratis estar\xE1 disponible en tu pr\xF3ximo pedido.</div>"
        : '');
    const _studentDiscountHtmlDrawer = studentDiscountEnabledCfg
      ? "<div style=\"margin-top:14px\"><label style=\"display:flex;align-items:center;gap:10px;background:#FFF8EE;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 12px;cursor:pointer\"><input type=\"checkbox\" id=\"drawer-student-discount-checkbox\" ".concat(_estudianteCheckedDrawer ? 'checked' : '', " onchange=\"document.getElementById('student-discount-checkbox').checked=this.checked;renderCart()\" style=\"width:18px;height:18px;flex-shrink:0;accent-color:#3D1F0D\"><span style=\"font-size:13px;color:#3D1F0D;font-weight:600\">\uD83E\uDEAA Soy estudiante o jubilado</span></label><div style=\"display:flex;gap:8px;align-items:flex-start;background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:10px 12px;margin-top:8px\"><span style=\"font-size:16px;line-height:1.3\">\u26A0\uFE0F</span><span style=\"font-size:12.5px;color:#5a3e1b;font-weight:600;line-height:1.4\">Se te pedir\xE1 el carn\xE9 de estudiante o jubilado en el mostrador. <u>Si no lo presentas, el descuento no se aplicar\xE1</u> y se cobrar\xE1 el precio normal.</span></div></div>")
      : '';
    const _recordatorioConfirmarHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div style=\"border-radius:10px;padding:8px 12px;background:#FFF3CD;border:1.5px solid #D9A441;margin-top:14px;margin-bottom:-6px;font-size:11.5px;font-weight:700;color:#5a3e1b\">\uD83C\uDF81 No olvides tu patata gratis antes de confirmar</div>"
      : '';
    html += "\n    <div style=\"margin-top:16px\">\n      <div class=\"form-group\">\n        <label>Tu nombre y apellido *</label>\n        <input type=\"text\" id=\"drawer-customer-name\" placeholder=\"\" maxlength=\"60\" value=\"".concat(_nombreActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"document.getElementById('customer-name').value=this.value\">\n      </div>\n      <div class=\"form-group\">\n        <label>Tel\xE9fono</label>\n        <input type=\"tel\" id=\"drawer-customer-phone\" placeholder=\"\" maxlength=\"11\" value=\"").concat(_telActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"formatPhone(this);document.getElementById('customer-phone').value=this.value\">\n        ").concat(_premioHtml, "\n        <div style=\"border:1.5px solid #F5E6C8;background:#FFF8EE;border-radius:10px;padding:10px 12px;margin-top:8px\">\n          <div style=\"display:flex;align-items:center;gap:8px;margin-bottom:4px\">\n            <span>\uD83D\uDCF1</span>\n            <p style=\"font-size:12px;font-weight:700;color:#3D1F0D;margin:0\">Se verificar\xE1 tu n\xFAmero por SMS</p>\n          </div>\n          <p style=\"font-size:12px;color:#8A6A4E;margin:0 0 4px 4px\">Solo para confirmar el pedido</p>\n          <div style=\"display:flex;align-items:center;gap:6px\">\n            <span>\uD83D\uDD12</span>\n            <p style=\"font-size:12px;color:#8A6A4E;margin:0\">No lo compartimos con nadie</p>\n          </div>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <label>Notas del pedido</label>\n        <textarea id=\"drawer-customer-notes\" placeholder=\"\" maxlength=\"300\" oninput=\"document.getElementById('customer-notes').value=this.value;_actualizarContadorNotas('drawer-customer-notes','drawer-notes-char-count')\"></textarea>\n        <div id=\"drawer-notes-char-count\" style=\"text-align:right;font-size:11px;color:#8A6A4E;margin-top:2px\">300 caracteres restantes</div>\n      </div>\n      <div id=\"drawer-slot-picker-group\" style=\"display:none;margin-top:14px\">\n        <label style=\"display:block;font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px\">\uD83D\uDD50 Hora de recogida *</label>\n        <p style=\"font-size:12px;color:#8A6A4E;margin-bottom:10px\">Los pedidos se preparan por turnos. Elige tu hora de recogida:</p>\n        <div id=\"drawer-slot-grid\" style=\"display:grid;grid-template-columns:1fr 1fr\"></div>\n        <div id=\"drawer-slot-error\" style=\"display:none;font-size:12px;color:#c0392b;margin-top:6px;font-weight:600\">\u26A0\uFE0F Por favor elige una hora de recogida</div>\n      </div>\n      ").concat(_studentDiscountHtmlDrawer, "\n      ").concat(_recordatorioConfirmarHtml, "\n      <button class=\"submit-btn\" onclick=\"submitOrderFromDrawer()\" style=\"margin-top:8px\">\n        Confirmar pedido \u2192\n      </button>\n    </div>");
  } else {
    const lockedMsg = document.getElementById('cart-locked-detail');
    html += "\n    <div style=\"margin-top:16px;background:#3D1F0D;border-radius:12px;padding:20px 16px;text-align:center\">\n      <div style=\"font-size:32px;margin-bottom:8px\">\uD83D\uDD12</div>\n      <div style=\"font-family:'Playfair Display',serif;font-size:17px;font-weight:900;color:#FFF8EE;margin-bottom:6px\">Pedidos cerrados</div>\n      <div style=\"font-size:13px;color:rgba(255,248,238,0.7);line-height:1.5\">".concat(lockedMsg ? lockedMsg.textContent : '', "</div>\n    </div>");
  }
  // El campo de código local (drawer-local-fee-code-input) llama a
  // comprobarCodigoLocal() en cada tecla para actualizar el desglose de
  // gastos al momento — pero como innerHTML sustituye TODO el cuerpo del
  // drawer de golpe, el input con el foco se destruye y se crea uno nuevo
  // en su lugar, así que el teclado del móvil se cerraba a cada dígito.
  // Se guarda qué campo tenía el foco (y la posición del cursor) para
  // devolvérselo al nuevo input justo después de repintar.
  const _focoPrevioEl = document.activeElement;
  const _focoPrevioId = (_focoPrevioEl && drawerBody.contains(_focoPrevioEl)) ? _focoPrevioEl.id : null;
  const _focoPrevioSelStart = (_focoPrevioId && typeof _focoPrevioEl.selectionStart === 'number') ? _focoPrevioEl.selectionStart : null;
  const _focoPrevioSelEnd = (_focoPrevioId && typeof _focoPrevioEl.selectionEnd === 'number') ? _focoPrevioEl.selectionEnd : null;

  drawerBody.innerHTML = html;

  if (_focoPrevioId) {
    const _nuevoFoco = document.getElementById(_focoPrevioId);
    if (_nuevoFoco) {
      _nuevoFoco.focus();
      if (_focoPrevioSelStart !== null && typeof _nuevoFoco.setSelectionRange === 'function') {
        try { _nuevoFoco.setSelectionRange(_focoPrevioSelStart, _focoPrevioSelEnd); } catch (e) {}
      }
    }
  }

  // Sincronizar slot picker en el drawer
  if (ordersOpen) _syncDrawerSlotPicker();

  // Re-pintar aviso de fidelización: innerHTML acaba de destruirlo si existía.
  // Si el teléfono ya está completo (9 dígitos), volvemos a comprobar el premio.
  const drawerPhoneEl = document.getElementById('drawer-customer-phone');
  if (drawerPhoneEl) {
    const digitsNow = drawerPhoneEl.value.replace(/\D/g, '').slice(0, 9);
    if (digitsNow.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
      _comprobarPremioFidelizacion(digitsNow);
    }
  }
}
function openCartDrawer() {
  window._drawerScrollY = window.scrollY;
  document.getElementById('cart-drawer-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Pre-rellenar con datos guardados si los campos están vacíos
  // Pre-rellenar campos del drawer con lo que ya haya en el formulario principal.
  // Así el usuario siempre ve sus datos aunque abra/cierre el drawer varias veces.
  // Se hace con requestAnimationFrame para esperar a que renderCart() genere el DOM.
  requestAnimationFrame(function() {
    var mainName  = document.getElementById('customer-name');
    var mainPhone = document.getElementById('customer-phone');
    var mainNotes = document.getElementById('customer-notes');
    var drawerName  = document.getElementById('drawer-customer-name');
    var drawerPhone = document.getElementById('drawer-customer-phone');
    var drawerNotes = document.getElementById('drawer-customer-notes');
    if (drawerName  && mainName)  drawerName.value  = mainName.value;
    if (drawerPhone && mainPhone) {
      drawerPhone.value = mainPhone.value;
      // Re-comprobar premio de fidelización: el HTML del drawer se reconstruye
      // cada vez que se abre, así que el aviso insertado por formatPhone() se
      // pierde aunque el valor del teléfono se mantenga. Lo regeneramos aquí.
      var digitsSync = drawerPhone.value.replace(/\D/g, '').slice(0, 9);
      if (digitsSync.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
        _comprobarPremioFidelizacion(digitsSync);
      } else {
        try {
          var savedPhone = localStorage.getItem('dpf_customer_phone');
          if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
        } catch {}
      }
    }
    if (drawerNotes && mainNotes) drawerNotes.value = mainNotes.value;
  });
  // Recargar config de slots desde Firebase y luego sincronizar
  if (window.fb_loadSlotConfig) {
    window.fb_loadSlotConfig().then(function (cfg) {
      if (cfg) {
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max) localStorage.setItem(SLOT_MAX_KEY, String(cfg.max));
      }
      renderSlotPicker();
      _syncDrawerSlotPicker();
      loadOrdersStatus();
      checkAutoCloseWarning();
    }).catch(function () {
      renderSlotPicker();
      _syncDrawerSlotPicker();
    });
  } else {
    renderSlotPicker();
    _syncDrawerSlotPicker();
  }
}
function _syncDrawerSlotPicker() {
  const srcGroup = document.getElementById('slot-picker-group');
  const dstGroup = document.getElementById('drawer-slot-picker-group');
  const dstGrid = document.getElementById('drawer-slot-grid');
  if (!srcGroup || !dstGroup || !dstGrid) return;
  const needsSlot = srcGroup.style.display !== 'none';
  dstGroup.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) return;

  // Copiar el grid de slots
  const srcGrid = document.getElementById('slot-grid');
  if (srcGrid) dstGrid.innerHTML = srcGrid.innerHTML;

  // Resaltar el slot seleccionado si ya hay uno
  if (selectedSlot) {
    const btn = dstGrid.querySelector('#slotbtn-' + selectedSlot.replace(':', '-'));
    if (btn) {
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
    }
  }

  // Los botones del drawer llaman a selectSlot igual que los del panel principal
  dstGrid.querySelectorAll('.slot-btn:not([disabled])').forEach(btn => {
    btn.onclick = function () {
      const slot = btn.querySelector('span').textContent;
      selectSlot(slot);
      // Sincronizar selección visual en drawer
      dstGrid.querySelectorAll('.slot-btn').forEach(b => {
        b.classList.remove('slot-selected');
        b.style.background = '';
        b.style.borderColor = '';
        b.style.color = '';
      });
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
      if (document.getElementById('drawer-slot-error')) {
        document.getElementById('drawer-slot-error').style.display = 'none';
      }
    };
  });
}
function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
  window.scrollTo(0, window._drawerScrollY || 0);
  // Si el usuario cierra el drawer sin confirmar, los campos del formulario
  // principal pueden tener valores del drawer que el usuario no ve.
  // Los limpiamos SOLO si el formulario principal está vacío visualmente
  // (es decir, el usuario no había escrito nada en él directamente).
  // La heurística: si el campo principal tiene valor pero el drawer YA NO
  // existe en DOM (se regenera al abrir), sincronizar hacia el principal
  // no tiene sentido — lo más seguro es NO limpiar para no perder lo que
  // el usuario escribió en el drawer antes de cerrarlo.
  // Lo que SÍ hacemos: al ABRIR el drawer, pre-rellenar sus campos con
  // lo que haya en el formulario principal (ver openCartDrawer patch).
}
function submitOrderFromDrawer() {
  var n = document.getElementById('drawer-customer-name');
  var p = document.getElementById('drawer-customer-phone');
  var t = document.getElementById('drawer-customer-notes');
  if (n) document.getElementById('customer-name').value = n.value;
  if (p) document.getElementById('customer-phone').value = p.value;
  if (t) document.getElementById('customer-notes').value = t.value;
  // No cerramos el drawer aquí: si falta un dato, _alertaConFoco necesita
  // que siga abierto para resaltar el campo correcto (drawer-customer-*).
  // Se cierra solo al confirmar con éxito, desde showSuccess().
  submitOrder();
}
function removeItem(id) {
  delete cart[id];
  renderMenu();
  renderCart();
}

// Quita del carrito cualquier producto que ya no exista en MENU (borrado o
// con el id cambiado desde el panel de admin mientras el cliente lo tenía
// añadido) — devuelve cuántos se han quitado, para que submitOrder() pueda
// avisar en vez de enviarlos igualmente.
function _limpiarItemsCarritoInvalidos() {
  let quitados = 0;
  Object.keys(cart).forEach(id => {
    if (!MENU.find(m => m.id == id)) { delete cart[id]; quitados++; }
  });
  Object.keys(custCart).forEach(key => {
    const c = custCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete custCart[key]; quitados++; }
  });
  Object.keys(extrasCart).forEach(key => {
    const c = extrasCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete extrasCart[key]; quitados++; }
  });
  return quitados;
}

// ── Recuperar un pedido que se quedó a medio enviar ──────────────────────
// Si el cliente cierra la pestaña, pierde la conexión o el navegador se
// bloquea justo después de confirmar (antes de que llegara la respuesta de
// guardar-pedido.php), el pedido podía perderse sin más rastro que un
// aviso interno. Ahora, al volver a abrir la web, se comprueba si quedó
// un pedido a medias y se reenvía solo — es seguro reenviarlo aunque el
// primer intento sí hubiera llegado a guardarse, porque el servidor
// responde éxito (no error) si el ticket ya existe con el mismo teléfono.
async function _recuperarPedidoEnCurso() {
  let raw;
  try { raw = localStorage.getItem('dpf_pedido_en_curso'); } catch (e) { return; }
  if (!raw) return;
  let marcador;
  try { marcador = JSON.parse(raw); } catch (e) { try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e2) {} return; }
  // Margen de seguridad: pasadas 2 horas ya no tiene sentido reintentar
  // (el cliente hace tiempo que se fue) — se descarta para no reenviar
  // pedidos viejísimos que ya nadie espera.
  if (!marcador || !marcador.payload || !marcador.ts || (Date.now() - marcador.ts) > 2 * 60 * 60 * 1000) {
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    return;
  }
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marcador.payload)
    }, 10000);
    const data = await res.json();
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    if (data.success) {
      console.log('[recuperación] Pedido ' + marcador.orderNum + ' recuperado tras un cierre inesperado');
    } else {
      console.warn('[recuperación] Pedido ' + marcador.orderNum + ' rechazado al reintentar:', data.error);
    }
  } catch (e) {
    // Sigue sin red — se deja el marcador para reintentar la próxima vez
    // que se abra la web.
    console.warn('[recuperación] sin conexión, se reintentará más tarde', e);
  }
}
document.addEventListener('DOMContentLoaded', () => { setTimeout(_recuperarPedidoEnCurso, 1500); });


// ── Seguridad: escapar datos de usuario antes de insertar en innerHTML ──
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Escapa un string para usarlo de forma segura dentro de un atributo onclick="f('VALOR')"
function escapeAttr(str) {
  return escapeHtml(String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

// Si el nombre del producto lleva el emoji 🆕, lo quita y pone en su lugar
// una insignia "Nuevo" en rojo, integrada con la marca (en vez del icono azul de móvil).
function formatNombreConBadgeNuevo(nombre) {
  if (!nombre) return '';
  if (nombre.indexOf('🆕') === -1) return escapeHtml(nombre);
  const limpio = nombre.replace('🆕', '').trim();
  return escapeHtml(limpio) + ' <span style="display:inline-block;font-family:\'Oswald\',sans-serif;font-weight:700;font-size:9px;color:#fff;background:#C0392B;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle">Nuevo</span>';
}

// Genera número de pedido reservándolo en el servidor (guardar-pedido.php,
// cuenta de servicio) para evitar colisiones entre pedidos simultáneos.
// Antes el propio navegador escribía directo en usedOrderNums/ vía la SDK
// de Firebase, lo que exigía dejar esa escritura abierta a cualquier
// visitante anónimo en las reglas — cualquiera podía rellenar
// usedOrderNums/<fecha>/ sin llegar a pedir nada.
// Fallback a aleatorio solo si el servidor no responde.
async function generateOrderNumber() {
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarNumeroPedido' })
    }, 8000);
    const data = await res.json();
    if (data.success && data.orderNum) return data.orderNum;
    console.warn('[orderNum] reserva en servidor falló:', data.error);
  } catch (e) {
    console.warn('[orderNum] fetch error:', e);
  }
  return 'T' + (Math.floor(Math.random() * 9000) + 1000);
}
function buildTicketText(orderNum, name, phone, notes, slotTime, orderTotal, feeAmount, discountAmt, discountCode, fidelizacionDescuento) {
  const tc = getTicketConfig();
  const lines = Object.entries(cart).map(_ref5 => {
    let _ref6 = _slicedToArray(_ref5, 2),
      id = _ref6[0],
      qty = _ref6[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('buildTicketText: producto no encontrado id=' + id);
      return '';
    }
    return "".concat(qty, "x ").concat(item.name, " \u2014 ").concat((item.price * qty).toFixed(2), " \u20AC");
  });
  const custLines = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('buildTicketText: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const details = [...c.sauces, ...c.ingredients].join(', ');
    const extrasStr = [c.extraQueso ? 'Queso' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(' + ');
    return c.qty + 'x ' + item.name + ' [' + details + (extrasStr ? ' + ' + extrasStr : '') + '] — ' + (unitPrice * c.qty).toFixed(2) + ' €';
  });
  const extLines2 = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return "".concat(c.qty, "x ").concat(getExtrasItemLabel(c), " \u2014 ").concat((getExtrasItemPrice(c) * c.qty).toFixed(2), " \u20AC");
  });
  const allLines = [...lines, ...custLines, ...extLines2];
  // El total final se recibe ya calculado desde submitOrder() (orderTotal)
  // en vez de recalcularse aqu\u00ED desde cero \u2014 antes este texto sumaba solo
  // los productos, sin aplicar gastos de gesti\u00F3n, c\u00F3digo de descuento ni
  // premio de fidelizaci\u00F3n, as\u00ED que el "TOTAL:" del ticket enviado por
  // email pod\u00EDa no coincidir con lo que de verdad se cobra.
  const itemsSubtotal = Object.entries(cart).reduce((s, _ref7) => {
    let _ref8 = _slicedToArray(_ref7, 2),
      id = _ref8[0],
      q = _ref8[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? it.price * q : 0);
  }, 0) + Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it) return s;
    const up = it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + up * c.qty;
  }, 0) + Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const total = typeof orderTotal === 'number' ? orderTotal : itemsSubtotal;
  const extraLineas = [];
  if (feeAmount > 0) extraLineas.push('Gastos de gesti\u00F3n: +' + feeAmount.toFixed(2) + ' \u20AC');
  if (discountAmt > 0) extraLineas.push('Descuento' + (discountCode ? ' (' + discountCode + ')' : '') + ': -' + discountAmt.toFixed(2) + ' \u20AC');
  if (fidelizacionDescuento > 0) extraLineas.push('Patata gratis (fidelizaci\u00F3n): -' + fidelizacionDescuento.toFixed(2) + ' \u20AC');
  const extraLineasTxt = extraLineas.length ? extraLineas.join('\n') + '\n' : '';
  const now = new Date().toLocaleString('es-ES');
  const phoneCleanTxt = (phone || '').replace(/\D/g, '');
  const avisoSelloTxt = (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneCleanTxt)
    ? "\n>>> 10\u00BA SELLO COMPLETADO. Avisar: premio disponible pr\u00F3ximo pedido <<<\n"
    : "";
  return "\n============================\n   ".concat(tc.nombre, "\n============================\nPEDIDO: ").concat(orderNum, "\nFecha: ").concat(now, "\n----------------------------\nCLIENTE: ").concat(name, "\n").concat(phone ? "Tel: " + phone : "", "\n----------------------------\nPRODUCTOS:\n").concat(allLines.join('\n'), "\n----------------------------\n").concat(extraLineasTxt, "TOTAL: ").concat(total.toFixed(2), " \u20AC\n  (").concat(tc.textoPago, ")\n----------------------------\n").concat(slotTime ? "RECOGIDA PATATA: " + slotTime + "h" : "", "\n").concat(notes ? "NOTAS: " + notes : "Sin notas", "\n").concat(avisoSelloTxt, "============================\n  ").trim();
}

// ══════════════════════════════════════════
//  SISTEMA DE TURNOS DE RECOGIDA (DINÁMICO)
// ══════════════════════════════════════════
const SLOT_TURNOS_KEY = 'dpf_slot_turnos';
const SLOT_MAX_KEY = 'dpf_slot_max';

// Turnos por defecto si no hay nada guardado
const DEFAULT_TURNOS = [{
  start: '19:30',
  end: '23:30',
  interval: 30
}];
function getSlotTurnos() {
  try {
    const t = JSON.parse(localStorage.getItem(SLOT_TURNOS_KEY));
    if (Array.isArray(t) && t.length > 0) return t;
  } catch {}
  return DEFAULT_TURNOS;
}
function getSlotMax() {
  return parseInt(localStorage.getItem(SLOT_MAX_KEY) || '4', 10);
}

// Para compatibilidad con código legacy que usa SLOT_MAX directamente
function getSlotMaxVal() {
  return getSlotMax();
}

// Genera lista de todos los slots de todos los turnos activos
function getSlots() {
  const turnos = getSlotTurnos();
  const slots = [];
  turnos.forEach(turno => {
    const _turno$start$split$ma = turno.start.split(':').map(Number),
      _turno$start$split$ma2 = _slicedToArray(_turno$start$split$ma, 2),
      sh = _turno$start$split$ma2[0],
      sm = _turno$start$split$ma2[1];
    let _turno$end$split$map = turno.end.split(':').map(Number),
      _turno$end$split$map2 = _slicedToArray(_turno$end$split$map, 2),
      eh = _turno$end$split$map2[0],
      em = _turno$end$split$map2[1];
    const interval = turno.interval || 30;
    // Si el cierre cruza la medianoche (end <= start), sumar 24h al end
    let endMins = eh * 60 + em;
    const startMins = sh * 60 + sm;
    if (endMins <= startMins) endMins += 1440;
    // Guardia anti-bucle infinito: máximo 96 slots por turno (24h / 15min)
    let count = 0;
    let curMins = startMins;
    while (curMins <= endMins && count < 96) {
      const hh = Math.floor(curMins / 60) % 24;
      const mm = curMins % 60;
      const slot = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      if (!slots.includes(slot)) slots.push(slot);
      curMins += interval;
      count++;
    }
  });
  slots.sort();
  return slots;
}

// Alias para compatibilidad — ahora SLOT_MAX es dinámico
const SLOT_START_H = 19,
  SLOT_START_M = 30; // solo para referencia legacy
const SLOT_END_H = 23,
  SLOT_END_M = 30;
let SLOT_MAX = getSlotMax(); // sincronizado con localStorage

// Lee ocupación de slots guardada en localStorage (por día)
// ── Slots: in-memory cache synced from Firebase ──
let _slotsCache = {}; // { slotTime: count }

function getSlotsData() {
  const todayKey = new Date().toISOString().slice(0, 10);
  // Contar siempre desde pedidos reales (fuente de verdad)
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  const realSlots = {};
  if (stats && stats.date === todayKey) {
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) realSlots[s] = (realSlots[s] || 0) + 1;
    });
  }
  // Usar el máximo entre Firebase y pedidos reales
  // para que un slot nunca quede liberado aunque se cancele un pedido
  if (Object.keys(_slotsCache).length > 0) {
    const merged = Object.assign({}, _slotsCache);
    Object.entries(realSlots).forEach(([slot, count]) => {
      merged[slot] = Math.max(merged[slot] || 0, count);
    });
    return { date: todayKey, slots: merged };
  }
  return { date: todayKey, slots: realSlots };
}
function saveSlotsData(data) {
  _slotsCache = data.slots || {};
  localStorage.setItem(SLOTS_KEY, JSON.stringify(data)); // fallback
}
function getSlotCount(slotTime) {
  // Count from actual orders for accuracy
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (!stats || stats.date !== todayKey) return _slotsCache[slotTime] || 0;
  const slot = slotTime ? slotTime.trim() : slotTime;
  return (stats.orders || []).filter(o => o.slot && o.slot.trim() === slot).length;
}
async function incrementSlot(slotTime) {
  // Update local cache immediately for UI responsiveness
  _slotsCache[slotTime] = (_slotsCache[slotTime] || 0) + 1;
  // Reservar en el servidor (guardar-pedido.php, cuenta de servicio) — antes
  // se escribía directo en Firebase (fb_incrementSlot), lo que exigía dejar
  // slots/ abierto a escritura anónima en las reglas.
  try {
    await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarSlot', slotTime })
    }, 8000);
  } catch (e) {
    console.warn('Slot reserve error', e);
    saveSlotsData(getSlotsData());
  }
}
async function decrementSlot(slotTime) {
  if (!slotTime) return;
  // Update local cache immediately
  _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
  // Persist to Firebase (atomic decrement)
  if (window.fb_decrementSlot) {
    try {
      await window.fb_decrementSlot(slotTime);
    } catch (e) {
      console.warn('Firebase slot decrement error', e);
    }
  } else {
    saveSlotsData(getSlotsData());
  }
}

// ¿El carrito tiene patatas?
function cartHasPatatas() {
  const reg = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && item.cat === 'Patatas';
  });
  const cust = Object.values(custCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  // extrasCart también puede contener patatas completas (con queso/gratinado/
  // ingredientes extra personalizados), no solo complementos sueltos.
  const extras = Object.values(extrasCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  return reg || cust || extras;
}

// ¿El carrito tiene algún producto?
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
}

// ¿Estamos en horario de turnos? Siempre activo — los slots pasados se deshabilitan solos
function isSlotHour() {
  return true;
}

// ¿El slot ya pasó?
// Compara minutos dentro del mismo "día de servicio" (hasta las 06:00 del día siguiente)
// para manejar correctamente turnos que cruzan la medianoche.
function slotIsPast(slotTime) {
  const now = new Date();
  const _slotTime$split$map = slotTime.split(':').map(Number),
    _slotTime$split$map2 = _slicedToArray(_slotTime$split$map, 2),
    sh = _slotTime$split$map2[0],
    sm = _slotTime$split$map2[1];
  // Normalizar al "día de servicio": horas 0-5 se tratan como 24-29
  const SERVICE_DAY_CUTOFF = 6 * 60; // 06:00
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const slotMins = sh * 60 + sm;
  const nowAdj = nowMins < SERVICE_DAY_CUTOFF ? nowMins + 1440 : nowMins;
  const slotAdj = slotMins < SERVICE_DAY_CUTOFF ? slotMins + 1440 : slotMins;
  return nowAdj > slotAdj;
}

// Renderiza el selector de slots en el formulario
function renderSlotPicker() {
  const group = document.getElementById('slot-picker-group');
  if (!group) return;
  const needsSlot = cartHasAnyItem() && isSlotHour();
  group.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) {
    return;
  }
  const slots = getSlots();
  const slotsData = getSlotsData();
  const slotMax = getSlotMax();
  let html = '';
  // Calcular plazas extra absorbidas: SOLO del slot inmediatamente anterior
  const extraPlazas = {};
  slots.forEach((slot, i) => {
    if (i === 0) return;
    const prevSlot = slots[i - 1];
    const prevCount = slotsData.slots[prevSlot] || 0;
    const prevPast = slotIsPast(prevSlot);
    const currPast = slotIsPast(slot);
    // Solo transferir si: el anterior ya pasó Y el actual aún no ha pasado
    if (prevPast && !currPast) {
      const sobrantes = Math.max(0, slotMax - prevCount);
      if (sobrantes > 0) extraPlazas[slot] = sobrantes;
    }
  });
  // Aviso de saturación moderada activo: empuja la selección hacia turnos
  // más tarde (en vez de amontonar todo en el más próximo) tratando como
  // "saturados" los que caen dentro de los próximos X minutos — pero solo
  // si queda al menos un turno libre más allá de ese margen, para no dejar
  // a nadie sin ningún turno donde poder elegir.
  const _nowMinsGlobal = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
  const _avisoCfg = (typeof getAvisoSaturacionConfig === 'function') ? getAvisoSaturacionConfig() : null;
  let _saturacionSlotsActiva = !!(window._saturacionAvisoActiva && _avisoCfg && _avisoCfg.minutosSalto > 0);
  if (_saturacionSlotsActiva) {
    const hayTurnoLibreTrasSalto = slots.some(slot => {
      const m = slot.split(':').map(Number);
      const slotMins = m[0] * 60 + m[1];
      if (slotMins - _nowMinsGlobal < _avisoCfg.minutosSalto) return false;
      return !slotIsPast(slot) && (slotsData.slots[slot] || 0) < slotMax;
    });
    if (!hayTurnoLibreTrasSalto) _saturacionSlotsActiva = false;
  }
  slots.forEach(slot => {
    const count = slotsData.slots[slot] || 0;
    const extra = extraPlazas[slot] || 0;
    const effectiveMax = slotMax + extra;
    const full = count >= effectiveMax;
    const almostFull = !full && count === effectiveMax - 1;
    const past = slotIsPast(slot);
    const nowMs = new Date();
    const nowMinsSlot = nowMs.getHours() * 60 + nowMs.getMinutes();
    const _slot$split$map = slot.split(':').map(Number),
      _slot$split$map2 = _slicedToArray(_slot$split$map, 2),
      slotH = _slot$split$map2[0],
      slotM = _slot$split$map2[1];
    const slotTotalMins = slotH * 60 + slotM;
    const saturado = !full && !past && _saturacionSlotsActiva && (slotTotalMins - nowMinsSlot) < _avisoCfg.minutosSalto;
    const disabled = full || past || saturado;
    const pct = Math.min(100, Math.round(count / effectiveMax * 100));
    const color = full ? '#e74c3c' : almostFull ? '#e74c3c' : pct >= 50 ? '#3D1F0D' : '#5ECC76';
    const libres = effectiveMax - count;
    const availableLabel = full ? '❌ Completo' : past ? 'Pasado' : saturado ? '⏳ Elige más tarde' : almostFull ? '⚠️ ¡Solo queda 1!' : libres + ' libre' + (libres !== 1 ? 's' : '') + (extra > 0 ? ' (+' + extra + ')' : '');
    const isLateSlot = !disabled && slotTotalMins - nowMinsSlot <= 5;
    const btnBg = disabled ? 'background:#f5f5f5;border-color:#ccc;' : isLateSlot ? 'background:#fffbe6;border-color:#f0c040;' : full ? 'background:#fff0f0;border-color:#e74c3c;' : pct >= 75 ? 'background:rgba(244,196,48,0.08);border-color:#3D1F0D;' : 'background:#FFF8EE;border-color:#E8D5B0;';
    html += '<button type="button"' + ' class="slot-btn ' + (disabled ? 'slot-disabled' : '') + '"' + ' id="slotbtn-' + slot.replace(':', '-') + '"' + ' onclick="' + (disabled ? '' : 'selectSlot(\'' + slot + '\')') + '"' + (disabled ? ' disabled' : '') + ' style="' + btnBg + '"' + ' title="' + (full ? 'Turno completo' : past ? 'Hora pasada' : saturado ? 'Hay bastante ambiente ahora mismo, elige un turno más tarde' : count + '/' + slotMax + ' plazas') + '">' + '<span style="font-size:17px;font-weight:900">' + slot + '</span>' + (isLateSlot ? '<span style="font-size:10px;font-weight:700;color:#b45a00">⚠️ cierre del turno</span>' : '') + '<span style="font-size:13px;color:' + (disabled ? '#aaa' : color) + ';font-weight:600">' + availableLabel + '</span>' + (almostFull ? '<span style="font-size:10px;color:#c0392b;font-weight:700;margin-top:2px">¡Solo queda 1 pedido disponible en esta franja!</span>' : '') + '<div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">' + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:99px;transition:width .3s"></div></div>' + '</button>';
  });
  document.getElementById('slot-grid').innerHTML = html;
}
let selectedSlot = null;
function selectSlot(slot) {
  selectedSlot = slot;
  document.getElementById('slot-error').style.display = 'none';
  document.querySelectorAll('.slot-btn').forEach(b => {
    b.classList.remove('slot-selected');
    b.style.background = '';
    b.style.borderColor = '';
    b.style.color = '';
  });
  const btn = document.getElementById('slotbtn-' + slot.replace(':', '-'));
  if (btn) {
    btn.classList.add('slot-selected');
    btn.style.background = '#3D1F0D';
    btn.style.borderColor = '#3D1F0D';
    btn.style.color = '#fff';
  }

  // Aviso franja poco margen ahora es inline en el botón
}

// Precio a descontar por el premio de fidelización activo (patata gratis) —
// la patata más cara del carrito, en beneficio del cliente. Compartida entre
// el total mostrado mientras se compra (renderCart(), en carta.js) y el del
// pedido final (submitOrder(), aquí abajo) para que nunca puedan mostrar
// cifras distintas — antes solo se calculaba aquí, así que el total del
// carrito no bajaba hasta confirmar el pedido, igual que pasaba con los
// códigos de descuento manuales antes de arreglarlo.
function getFidelizacionDescuento(phoneClean) {
  if (!window._fidelizacionPremioActivo || window._fidelizacionPremioActivo !== phoneClean) return 0;
  const preciosPatatasRegular = Object.entries(cart).map(([id, q]) => {
    const it = MENU.find(m => m.id == id);
    return it && typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata') && q > 0 ? it.price : 0;
  });
  const preciosPatatasCustom = Object.values(custCart).map(c => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
    return it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
  });
  const preciosPatatasExtras = Object.values(extrasCart).map(c => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
    return getExtrasItemPrice(c);
  });
  const todosLosPrecios = [...preciosPatatasRegular, ...preciosPatatasCustom, ...preciosPatatasExtras];
  return todosLosPrecios.length ? Math.max(...todosLosPrecios) : 0;
}
// Guarda contra doble envío — antes el botón "Confirmar pedido" no se
// deshabilitaba hasta después de varias llamadas de red seguidas (lista
// negra, cooldown, turnos, número de pedido), así que un doble-toque en
// una conexión lenta podía lanzar dos submitOrder() a la vez: dos números
// de pedido reservados, dos emails de confirmación, y _pendingOrderData/
// _pendingTicketData del segundo pisando los del primero en mitad del
// proceso, todo para lo que el cliente vivió como un único clic.
let _submitOrderEnCurso = false;
async function submitOrder() {
  if (_submitOrderEnCurso) return;
  _submitOrderEnCurso = true;
  try {
    await _submitOrderInner();
  } finally {
    _submitOrderEnCurso = false;
  }
}
async function _submitOrderInner() {
  // Gate de config crítica (gastos de gestión, bolsa, código local) — ver
  // comentario junto a esperarConfigCriticaLista() en admin-config.js. En
  // el caso normal esta espera ya está resuelta y esto no tarda nada; solo
  // se nota (y se avisa en el botón) en una visita nueva/muy rápida.
  if (typeof esperarConfigCriticaLista === 'function' && !(window._feeConfigListo && window._fee2ConfigListo && window._localCodeListo && window._studentDiscountConfigListo)) {
    const btnGate = document.getElementById('submit-btn');
    const prevGateText = btnGate ? btnGate.textContent : null;
    const prevGateDisabled = btnGate ? btnGate.disabled : false;
    if (btnGate) { btnGate.disabled = true; btnGate.textContent = 'Comprobando datos…'; }
    await esperarConfigCriticaLista(4000);
    if (btnGate && prevGateText !== null) { btnGate.disabled = prevGateDisabled; btnGate.textContent = prevGateText; }
  }
  // Si el admin borra o renombra un producto justo mientras un cliente lo
  // tiene en el carrito, antes se descartaba en silencio al enviar el
  // pedido (solo quedaba un console.error) — el cliente no se enteraba de
  // que su pedido había cambiado hasta recogerlo. Ahora se detecta antes
  // de seguir, se quita del carrito y se avisa claramente, dejando el
  // carrito abierto para que pueda revisar/completar el pedido en vez de
  // confirmarlo tal cual con algo menos sin saberlo.
  if (typeof _limpiarItemsCarritoInvalidos === 'function') {
    const _quitados = _limpiarItemsCarritoInvalidos();
    if (_quitados > 0) {
      renderMenu();
      renderCart();
      showAlert('Uno de los productos de tu pedido ya no está disponible y se ha quitado del carrito. Revisa tu pedido antes de confirmar.');
      if (typeof openCartDrawer === 'function') openCartDrawer();
      return;
    }
  }
  // Igual que ya hace changeQty() al añadir al carrito — antes esta función
  // nunca comprobaba el horario/vacaciones/pausa al confirmar, así que si
  // el formulario ya estaba abierto cuando la tienda cerraba, el pedido se
  // enviaba igual (el servidor ahora también lo rechaza, esto es solo para
  // avisar al momento sin esperar la respuesta).
  if (isShopBlocked()) {
    showClosedToast();
    return;
  }
  const name = document.getElementById("customer-name").value.trim();
  if (!name) {
    _alertaConFoco("Por favor escribe tu nombre", "customer-name");
    return;
  }
  if (name.length > 60) {
    _alertaConFoco("El nombre es demasiado largo (máximo 60 caracteres)", "customer-name");
    return;
  }
  if (Object.keys(cart).length === 0 && Object.values(custCart).filter(c => c.qty > 0).length === 0 && Object.values(extrasCart).filter(c => c.qty > 0).length === 0) {
    showAlert("El pedido está vacío");
    return;
  }

  // Validar teléfono
  const phone = document.getElementById("customer-phone").value.trim();
  const phoneClean = phone.replace(/[\s\-().+]/g, '');
  if (!phone) {
    _alertaConFoco("Por favor escribe tu teléfono", "customer-phone");
    return;
  }
  if (!/^\d{9}$/.test(phoneClean)) {
    _alertaConFoco("El teléfono debe tener exactamente 9 dígitos", "customer-phone");
    return;
  }
  // Prefijo válido español: móviles 6/7, fijos 8/9 — excluye 800/900/901/902 y similares
  if (!/^[6789]/.test(phoneClean)) {
    _alertaConFoco("El teléfono no parece válido. Debe empezar por 6, 7, 8 o 9", "customer-phone");
    return;
  }
  // Excluir numeración especial: 800, 900, 901, 902, 803, 806, 807
  if (/^(800|900|901|902|803|806|807)/.test(phoneClean)) {
    _alertaConFoco("No se admiten números de tarificación especial", "customer-phone");
    return;
  }
  // Detectar números absurdos: todos iguales, secuencias obvias
  const _absurdos = ['000000000', '111111111', '222222222', '333333333', '444444444', '555555555', '666666666', '777777777', '888888888', '999999999', '123456789', '987654321', '600000000', '700000000', '612345678'];
  if (_absurdos.includes(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }
  // Detectar repetición: 7+ dígitos iguales consecutivos (ej. 611111111, 699999999)
  if (/(\d)\1{6,}/.test(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }

  // ── Honeypot anti-bots: si el campo oculto está relleno, es un bot
  const hp = document.getElementById('hp-website');
  if (hp && hp.value.trim()) {
    // `btn` (más abajo, para el resto de la función) todavía no existe en
    // este punto — usarlo aquí lanzaba un ReferenceError ("Cannot access
    // 'btn' before initialization") por ser un `const` del mismo scope
    // referenciado antes de su declaración, así que se busca el elemento
    // aparte en vez de depender de esa variable.
    const hpBtn = document.getElementById('submit-btn');
    if (hpBtn) {
      hpBtn.disabled = true;
      hpBtn.textContent = 'Enviando pedido…';
      setTimeout(() => {
        hpBtn.disabled = false;
        hpBtn.textContent = 'Confirmar pedido';
      }, 2000);
    }
    return;
  }

  // ── Blacklist: teléfono bloqueado (local + Firebase)
  const blacklist = getBlacklist();
  if (blacklist.includes(phoneClean)) {
    showAlert('No es posible realizar pedidos desde este número de teléfono.');
    return;
  }
  // Verificar blacklist en Firebase (fuente de verdad — no bypasseable desde localStorage)
  if (window.fb_loadBlacklist) {
    try {
      const fbBlacklist = await window.fb_loadBlacklist();
      if (fbBlacklist && fbBlacklist.includes(phoneClean)) {
        // Sincronizar también al localStorage para futuras consultas offline
        saveBlacklistLocal(fbBlacklist);
        showAlert('No es posible realizar pedidos desde este número de teléfono.');
        return;
      }
    } catch (e) {
      // Si Firebase falla, continúa con la comprobación local ya hecha arriba
      console.warn('[antispam] Firebase blacklist check failed, usando caché local:', e);
    }
  }

  // ── Cooldown + límite diario (verificación contra Firebase — no bypasseable)
  if (window.fb_getPhoneLog) {
    try {
      const cfg = getAntiSpamCfg();
      const log = await window.fb_getPhoneLog(phoneClean);
      if (log) {
        // Límite diario
        if (cfg.dailyLimit > 0 && (log.count || 0) >= cfg.dailyLimit) {
          showAlert('Has alcanzado el límite de pedidos para hoy. Inténtalo mañana.');
          return;
        }
        // Cooldown: comprobar el último timestamp
        const now = Date.now();
        const cooldownMs = cfg.cooldown * 60 * 1000;
        const lastTs = log.timestamps && log.timestamps.length
          ? Math.max(...log.timestamps)
          : 0;
        if (lastTs && now - lastTs < cooldownMs) {
          const remaining = Math.ceil((cooldownMs - (now - lastTs)) / 60000);
          showAlert('Debes esperar ' + remaining + ' minuto' + (remaining !== 1 ? 's' : '') + ' antes de hacer otro pedido.');
          return;
        }
      }
    } catch (e) {
      console.warn('[antispam] Firebase phone log check failed:', e);
    }
  }

  // Validar slot si aplica
  const needsSlot = cartHasAnyItem() && isSlotHour();
  if (needsSlot && !selectedSlot) {
    document.getElementById('slot-error').style.display = 'block';
    document.getElementById('slot-picker-group').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    return;
  }
  // Revalidar capacidad usando Firebase para evitar race condition entre dispositivos
  if (needsSlot) {
    let liveCount = getSlotCount(selectedSlot); // valor local como fallback
    if (window.fb_getSlotCount) {
      try {
        liveCount = await window.fb_getSlotCount(selectedSlot);
      } catch (e) {
        console.warn('Firebase slot check error', e);
      }
    }
    if (liveCount >= getSlotMax()) {
      showAlert("El turno de las ".concat(selectedSlot, " se ha llenado justo ahora. Por favor elige otro."));
      selectedSlot = null;
      renderSlotPicker();
      return;
    }
  }
  const notes = document.getElementById("customer-notes").value.trim();
  if (notes.length > 300) {
    _alertaConFoco("La nota del pedido es demasiado larga (máximo 300 caracteres)", "customer-notes");
    return;
  }
  const orderNum = await generateOrderNumber();
  const regularTotal = Object.entries(cart).reduce((s, _ref9) => {
    let _ref0 = _slicedToArray(_ref9, 2),
      id = _ref0[0],
      q = _ref0[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? it.price * q : 0);
  }, 0);
  const custTotal = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return s;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + unitPrice * c.qty;
  }, 0);
  const extTotal = Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const subTotal = regularTotal + custTotal + extTotal;
  const _sinGastosPorCodigoLocalSubmit = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // Ver comentario largo en carta.js/renderCart(): el código local exime
  // al gasto etiquetado como "de gestión", sea el 1º o el 2º.
  const _fee1EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestionSubmit = !_fee1EsGestionSubmit && !_fee2EsGestionSubmit;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocalSubmit && (_fee1EsGestionSubmit || _ningunaEsGestionSubmit));
  const feeAmount = feeEnabled ? getFeeAmount() : 0;
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocalSubmit && _fee2EsGestionSubmit);
  const fee2Amount = fee2Enabled && typeof getFee2Amount === 'function' ? getFee2Amount() : 0;
  const _discountAmt = getDiscountAmount(subTotal);
  const _fidelizacionDescuento = getFidelizacionDescuento(phoneClean);
  // Descuento estudiante/jubilado — autodeclarado por el cliente, se suma
  // al resto de descuentos (código + fidelización); la verificación real
  // del carné se hace en caja al cobrar, avisado en el ticket/cocina.
  const _esEstudianteJubiladoSubmit = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled()
    && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _studentDiscountPctSubmit = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  const _studentDiscountAmt = _esEstudianteJubiladoSubmit ? Math.round(subTotal * _studentDiscountPctSubmit) / 100 : 0;
  const orderTotal = Math.max(0, subTotal + feeAmount + fee2Amount - _discountAmt - _fidelizacionDescuento - _studentDiscountAmt);
  const regularItems = Object.entries(cart).map(_ref1 => {
    let _ref10 = _slicedToArray(_ref1, 2),
      id = _ref10[0],
      qty = _ref10[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('submitOrder: producto no encontrado id=' + id);
      return null;
    }
    return {
      name: item.name,
      qty,
      subtotal: item.price * qty
    };
  }).filter(Boolean);
  const custItems = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return null;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    // Queso Mozzarella siempre al final (puede venir de ingredientes o como extra)
    const ingsWithoutQueso = c.ingredients.filter(i => i !== 'Queso Mozzarella' && i !== '4 Quesos');
    const quesosFromIng = c.ingredients.filter(i => i === 'Queso Mozzarella' || i === '4 Quesos');
    const extras = [...c.sauces, ...ingsWithoutQueso];
    // Añadir quesos al final
    quesosFromIng.forEach(q => extras.push(q));
    if (c.extraQueso) extras.push('Queso Mozzarella +1€');
    if (c.extraGratinado) extras.push('Gratinado +0,50€');
    return {
      name: item.name,
      qty: c.qty,
      subtotal: unitPrice * c.qty,
      extras
    };
  }).filter(Boolean);
  // Cada patata con extras (queso/gratinado/ingredientes) se desglosa en
  // el ticket: la línea principal muestra solo el precio de la patata
  // sola, y cada extra sale debajo con un guión y su propio precio — igual
  // que ya hacían las Patatas Al Gusto/Bomba (ver "extras" en custItems
  // más arriba). Antes salía todo junto en una sola línea con el precio ya
  // sumado ("Patata Carbonara + Gratinado" a 6,30€), sin ver cuánto era la
  // patata y cuánto el extra.
  const extItems = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return null;
    const extras = [];
    if (c.queso) extras.push({ name: 'Queso', price: 1.00 });
    if (c.gratinado) extras.push({ name: 'Gratinado', price: 0.50 });
    (c.ingredientesExtra || []).forEach(ing => {
      const precioIng = EXTRAS_ING_PRECIO1.includes(ing) ? 1.00 : EXTRAS_ING_PRECIO07.includes(ing) ? 0.70 : 0;
      extras.push({ name: ing, price: precioIng });
    });
    (c.salsasExtra || []).forEach(salsa => {
      extras.push({ name: salsa, price: EXTRAS_SALSA_PRECIO });
    });
    return {
      name: item.name,
      qty: c.qty,
      subtotal: c.basePrice * c.qty,
      extras: extras.length ? extras : undefined
    };
  }).filter(Boolean);
  const feeItems = feeEnabled ? [{
    name: feeLabel,
    qty: 1,
    subtotal: feeAmount,
    isFee: true
  }] : [];
  const fee2Items = fee2Enabled ? [{
    name: fee2Label,
    qty: 1,
    subtotal: fee2Amount,
    isFee: true
  }] : [];
  const fidelizacionItems = _fidelizacionDescuento > 0 ? [{
    name: '🎁 Premio fidelización (patata gratis)',
    qty: 1,
    subtotal: -_fidelizacionDescuento
  }] : [];
  const studentDiscountItems = _studentDiscountAmt > 0 ? [{
    name: '🪪 Descuento estudiante/jubilado (-' + _studentDiscountPctSubmit + '%)',
    qty: 1,
    subtotal: -_studentDiscountAmt
  }] : [];
  // Si este pedido es el que completa el ciclo de 10 sellos, añadimos una
  // línea informativa en el ticket (sin afectar al precio) para que se
  // imprima y se vea en cocina/caja que hay que avisar al cliente.
  const _completaSelloEsteTicket = !!(window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneClean);
  const fidelizacionAvisoItems = _completaSelloEsteTicket ? [{
    name: '🎉 ¡10º SELLO COMPLETADO! Avisar: premio disponible próximo pedido',
    qty: 1,
    subtotal: 0
  }] : [];
  const orderItems = [...regularItems, ...custItems, ...extItems, ...feeItems, ...fee2Items, ...fidelizacionItems, ...studentDiscountItems, ...fidelizacionAvisoItems];
  const now = new Date().toLocaleString('es-ES');

  // Estadística "¿le metes algo dulce?": si se llegó a mostrar la sugerencia
  // (window._upsellFueMostrado, marcado por getUpsellDulce() al ofrecerla) y
  // si el cliente acabó añadiendo alguna de las opciones ofrecidas.
  const upsellMostrado = !!window._upsellFueMostrado;
  const upsellAnadido = !!(window._upsellOpcionesElegidas && window._upsellOpcionesElegidas.ids
    && window._upsellOpcionesElegidas.ids.some(id => (cart[id] || 0) > 0));

  // Datos estructurados del ticket (para impresión HTML)
  const ticketData = {
    orderNum,
    name,
    phone,
    notes,
    slotTime: selectedSlot || null,
    items: orderItems,
    total: orderTotal,
    time: now,
    upsellMostrado,
    upsellAnadido,
    // Pedido "desde el local" (código de cola aplicado): para que en cocina
    // pueda mostrarse primero, ya que ese cliente está esperando físicamente
    // en el mostrador y no se puede ir a pedir a otro sitio.
    esPedidoLocal: _sinGastosPorCodigoLocalSubmit,
    // Descuento estudiante/jubilado autodeclarado — se imprime destacado en
    // el ticket y se marca en cocina para que se compruebe el carné al cobrar.
    esEstudianteJubilado: _esEstudianteJubiladoSubmit
  };
  _lastTicketData = ticketData;
  window._pendingTicketData = ticketData;

  // Texto plano para el email (se mantiene igual)
  const ticketText = buildTicketText(orderNum, name, phone, notes, selectedSlot, orderTotal, feeAmount, _discountAmt, (_activeDiscount ? _activeDiscount.code : null), _fidelizacionDescuento);
  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Enviando pedido…";

  // ── Enviar por EmailJS ── (fallo no bloquea el pedido)
  if (typeof emailjs !== "undefined") {
    emailjs.init(CONFIG.emailjs_public_key);
    try {
      await emailjs.send(CONFIG.emailjs_service_id, CONFIG.emailjs_template_id, {
        to_email: CONFIG.store_email,
        order_num: orderNum,
        customer: name,
        phone: phone || "–",
        notes: notes || "–",
        ticket: ticketText,
        pickup_time: needsSlot ? selectedSlot : "–",
        total: orderTotal.toFixed(2) + " €"
      });
    } catch (err) {
      console.error("EmailJS error:", err);
      logActivity("⚠️ Email de confirmación NO enviado — pedido " + orderNum + " — " + (err && err.text || err && err.message || "error desconocido"));
    }
  } else {
    console.warn("EmailJS no cargado — email omitido");
  }
  // El uso del código de descuento se registra en el servidor al
  // finalizar el pedido (ver guardar-pedido.php) — incrementar
  // discounts/<code>/uses exige el UID de admin en las reglas, así que
  // el navegador ya no puede hacerlo directamente.
  const _discountCodeUsado = _activeDiscount ? _activeDiscount.code : null;
  _activeDiscount = null;
  const dcInput = document.getElementById('discount-input');
  const dcFeedback = document.getElementById('discount-feedback');
  if (dcInput) dcInput.value = '';
  if (dcFeedback) dcFeedback.textContent = '';
  // Desmarcar la casilla estudiante/jubilado para el siguiente pedido — no
  // debe quedar marcada por defecto sin que el cliente vuelva a elegirlo.
  const _studentCb = document.getElementById('student-discount-checkbox');
  if (_studentCb) _studentCb.checked = false;
  const _studentCbDrawer = document.getElementById('drawer-student-discount-checkbox');
  if (_studentCbDrawer) _studentCbDrawer.checked = false;
  // ── Verificación SMS ──────────────────────────────────────
  // Guardar datos del pedido pendiente hasta que se verifique el teléfono
  window._pendingOrderData = {
    orderNum,
    slotTime: needsSlot ? selectedSlot : null,
    phone,
    phoneClean,
    ticketData: ticketData,
    discountCode: _discountCodeUsado
  };

  // Teléfonos de prueba que saltan la verificación SMS
  const TEST_PHONES = ['635353724'];
  if (window._skipSmsVerification || TEST_PHONES.includes(phoneClean)) {
    btn.disabled = false;
    btn.textContent = 'Confirmar pedido →';
    await _finalizarPedido();
    return;
  }

  // Intentar enviar SMS de verificación
  let smsOk = false;
  try {
    const smsRes = await _fetchConTimeout('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + phoneClean })
    }, 8000);
    const smsData = await smsRes.json();
    if (smsData.success) {
      smsOk = true;
    } else {
      console.warn('[SMS] send-code error:', smsData.error);
    }
  } catch (e) {
    console.warn('[SMS] fetch error:', e);
  }

  btn.disabled = false;
  btn.textContent = 'Confirmar pedido →';

  if (smsOk) {
    // Mostrar modal de verificación SMS
    const modal = document.getElementById('sms-verify-modal');
    const txt = document.getElementById('sms-verify-text');
    if (modal) {
      if (txt) txt.textContent = 'Te hemos enviado un código de 4 dígitos al ' + phone + '.';
      // Limpiar inputs anteriores
      ['sms-code-1','sms-code-2','sms-code-3','sms-code-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      modal.style.display = 'flex';
      const firstInput = document.getElementById('sms-code-1');
      if (firstInput) firstInput.focus();
    }
  } else {
    // Si falla el SMS, dejar pasar el pedido igualmente (fallback)
    console.warn('[SMS] No se pudo enviar SMS, completando pedido sin verificación');
    await _finalizarPedido();
  }
  return; // El pedido se finaliza desde smsVerifyCode()
}

// ── Finalizar pedido tras verificación SMS ──────────────────
async function _finalizarPedido() {
  if (!window._pendingOrderData) return;
  const { orderNum, slotTime, phone, phoneClean, ticketData: _ticketDataParaFidelizacion, discountCode } = window._pendingOrderData;
  try { if (phoneClean) localStorage.setItem('dpf_customer_phone', phoneClean); } catch {}
  window._pendingOrderData = null;

  // Cerrar modal SMS si está abierto
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';

  // Guardar el pedido en el servidor: ticket completo + estadísticas del
  // día + uso del código de descuento (si lo hubo). tickets/ y stats/
  // exigen el UID de admin en las reglas de Firebase, así que un cliente
  // anónimo (cualquiera que pida sin haber iniciado sesión de admin) no
  // puede escribir ahí directamente — lo hace guardar-pedido.php con la
  // cuenta de servicio.
  // No se espera aquí (para que la pantalla de éxito aparezca al instante),
  // pero SÍ hay que esperar a que termine antes de pedir el sello de
  // fidelización más abajo — fidelizacion.php ahora comprueba contra el
  // ticket ya guardado en Firebase (tickets/<fecha>/<num>), así que si se
  // llamara antes de que este guardado termine, el sello se rechazaría por
  // "pedido no encontrado" en pedidos completamente legítimos.
  let _pedidoGuardadoPromise = Promise.resolve();
  if (window._pendingTicketData) {
    const _pedidoPayload = {
      orderNum,
      name: window._pendingTicketData.name,
      phone: window._pendingTicketData.phone,
      notes: window._pendingTicketData.notes,
      slotTime: window._pendingTicketData.slotTime,
      items: window._pendingTicketData.items,
      total: window._pendingTicketData.total,
      discountCode: discountCode || null,
      upsellMostrado: window._pendingTicketData.upsellMostrado || false,
      upsellAnadido: window._pendingTicketData.upsellAnadido || false,
      esPedidoLocal: window._pendingTicketData.esPedidoLocal || false,
      esEstudianteJubilado: window._pendingTicketData.esEstudianteJubilado || false
    };
    // Se guarda un marcador ANTES de mandar la petición — si la pestaña se
    // cierra o se pierde la conexión justo después de confirmar (antes de
    // recibir la respuesta), _recuperarPedidoEnCurso() lo reenvía solo al
    // volver a abrir la web. Reenviar el mismo pedido es seguro aunque el
    // primer intento sí hubiera llegado a guardarse: guardar-pedido.php
    // responde éxito (no error) si el ticket ya existe con el mismo
    // teléfono, en vez de duplicarlo.
    try { localStorage.setItem('dpf_pedido_en_curso', JSON.stringify({ orderNum, payload: _pedidoPayload, ts: Date.now() })); } catch (e) {}
    console.log('💾 Guardando pedido en el servidor:', orderNum);
    _pedidoGuardadoPromise = _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_pedidoPayload)
    }, 12000)
      .then(res => res.json())
      .then(data => {
        try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
        if (data.success) { console.log('✅ Pedido guardado'); window._pendingTicketData = null; }
        else { console.error('❌ Error guardando pedido:', data.error); logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (data.error || 'error desconocido')); _avisarClienteFalloGuardado(orderNum); }
      })
      .catch((e) => {
        // No se borra el marcador aquí: no hubo respuesta del servidor (fallo
        // de red/pestaña cerrada), así que no se sabe si el pedido llegó a
        // guardarse — se deja para que _recuperarPedidoEnCurso() lo reintente
        // en la próxima visita.
        console.error('❌ Error guardando pedido:', e);
        logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (e && e.message || 'error de conexión'));
        _avisarClienteFalloGuardado(orderNum);
      });
  } else {
    console.warn('⚠️ _pendingTicketData vacío, no se pudo guardar el pedido');
  }

  await showSuccess(orderNum, slotTime);
  // El registro en phoneLog (para el cooldown/límite diario) ya lo hace
  // guardar-pedido.php al guardar el pedido — hacerlo también aquí
  // contaría cada pedido dos veces.
  // Programa de fidelización: sumar sello si el pedido incluye al menos 1 patata
  const _consumioPremioFidelizacion = window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean;
  await _pedidoGuardadoPromise;
  _procesarSelloFidelizacion(phoneClean, _ticketDataParaFidelizacion, _consumioPremioFidelizacion).catch(e => console.warn('[fidelizacion] error:', e));
  window._fidelizacionPremioActivo = null;
  _ocultarAvisoPremioFidelizacion();
}
// Antes, si guardar-pedido.php fallaba, el cliente veía "pedido confirmado"
// igual y solo quedaba un aviso en el log de actividad que ve el admin —
// nadie en cocina se enteraba de que el pedido no había llegado. Ahora, si
// el cliente sigue en la pantalla de éxito de ESE pedido, se lo decimos.
function _avisarClienteFalloGuardado(orderNum) {
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  const mismoNum = document.getElementById('order-num-display')?.textContent === String(orderNum);
  if (!successVisible || !mismoNum) return;
  const warning = document.getElementById('success-save-warning');
  if (warning) warning.style.display = 'block';
}

// ── PROGRAMA DE FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META = 10;
function _ticketTienePatata(ticketData) {
  if (!ticketData || !Array.isArray(ticketData.items)) return false;
  return ticketData.items.some(it => typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata'));
}
async function _procesarSelloFidelizacion(phoneClean, ticketData, consumioPremio) {
  if (!phoneClean || !_ticketTienePatata(ticketData)) return;
  // El cálculo del sello (sumar, resetear a los 10, descontar premio
  // canjeado) se hace en el servidor (fidelizacion.php): el navegador ya
  // no lee ni escribe fidelizacion/<telefono> directamente, para que nadie
  // pueda regalarse sellos/premios abriendo las devtools.
  try {
    const res = await _fetchConTimeout('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'registrarSello',
        telefono: phoneClean,
        orderNum: (ticketData && ticketData.orderNum) || '',
        tienePatata: true,
        consumioPremio: !!consumioPremio,
        nombre: (ticketData && ticketData.name) || ''
      })
    }, 10000);
    // Si el servidor rechaza el sello (success:false, no "skipped"), ya lo
    // registra fidelizacion.php por su cuenta con la cuenta de servicio
    // (fbAgregarActivityLog) — hacerlo también aquí en el navegador del
    // cliente no servía de nada en producción (un cliente anónimo real no
    // tiene permiso para escribir en config/activityLog) y solo duplicaba
    // el aviso cuando quien probaba era la propia admin con el panel
    // abierto en el mismo navegador.
  } catch (e) { /* no crítico: si falla, el cliente simplemente no suma sello esta vez */ }
  // Nota: el aviso de "completaste tus 10 pedidos" ya se mostró ANTES de
  // confirmar (ver _comprobarPremioFidelizacion / _mostrarAvisoProximoSelloFidelizacion),
  // así que aquí no se repite para no duplicar el mensaje.
}
function _mostrarAvisoFidelizacionCompletada() {
  // Aviso simple superpuesto a la pantalla de éxito; no bloquea el flujo.
  try {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:16px 22px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:9999;max-width:90vw;text-align:center;font-family:\'DM Sans\',sans-serif;font-size:14.5px;font-weight:600';
    el.innerHTML = '🎉 ¡Has completado tus 10 pedidos! Tu patata gratis estará disponible en tu próximo pedido.';
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 6000);
  } catch (e) {}
}

// ── Tiempo de modificación de pedido ──
function saveModifyWindow() {
  var _document$getElementB2;
  const v = parseInt(((_document$getElementB2 = document.getElementById('modify-window-input')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || '10');
  const valid = isNaN(v) || v < 1 || v > 300 ? 10 : v;
  localStorage.setItem('dpf_modify_window_mins', valid);
  if (window.fb_saveConfig) {
    try {
      // IMPORTANTE: usar la misma clave (CONFIG_KEY) que saveConfig(), no
      // 'dpf_local_config'. Antes esto leía/escribía una clave distinta y
      // sobreescribía en Firebase toda la config (incluidas las claves de
      // EmailJS) con un objeto que solo tenía modifyWindowMins, borrando
      // sin querer el resto de ajustes guardados.
      const cfg = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
      cfg.modifyWindowMins = valid;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      Object.assign(CONFIG, cfg);
      window.fb_saveConfig(cfg).catch(() => {});
    } catch (e) {}
  }
  showToast('modify-window-toast');
}
function loadModifyWindowInput() {
  const v = localStorage.getItem('dpf_modify_window_mins') || '10';
  const el = document.getElementById('modify-window-input');
  if (el) el.value = v;
}


// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
const BLACKLIST_KEY = 'dpf_blacklist';
const ANTISPAM_KEY = 'dpf_antispam_cfg';
const PHONE_LOG_KEY = 'dpf_phone_log'; // registro de pedidos por teléfono (Firebase)

function getBlacklist() {
  try {
    return JSON.parse(localStorage.getItem(BLACKLIST_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveBlacklistLocal(list) {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}
function getAntiSpamCfg() {
  try {
    var _c$cooldown, _c$dailyLimit;
    const c = JSON.parse(localStorage.getItem(ANTISPAM_KEY) || '{}');
    return {
      cooldown: (_c$cooldown = c.cooldown) !== null && _c$cooldown !== void 0 ? _c$cooldown : 0,
      dailyLimit: (_c$dailyLimit = c.dailyLimit) !== null && _c$dailyLimit !== void 0 ? _c$dailyLimit : 3
    };
  } catch {
    return {
      cooldown: 45,
      dailyLimit: 3
    };
  }
}

// Cargar blacklist y config desde Firebase al iniciar el panel admin
async function loadAntiSpamFromFirebase() {
  if (!window.fb_loadBlacklist) return;
  try {
    const bl = await window.fb_loadBlacklist();
    if (bl) saveBlacklistLocal(bl);
    const cfg = await window.fb_loadAntiSpamCfg();
    if (cfg) localStorage.setItem(ANTISPAM_KEY, JSON.stringify(cfg));
  } catch {}
  renderBlacklist();
  const cfg = getAntiSpamCfg();
  const cdEl = document.getElementById('cfg-cooldown');
  const dlEl = document.getElementById('cfg-daily-limit');
  if (cdEl) cdEl.value = cfg.cooldown;
  if (dlEl) dlEl.value = cfg.dailyLimit;
}

// Guardar límites anti-spam
async function saveAntiSpamConfig() {
  var _document$getElementB3, _document$getElementB4;
  const cooldown = parseInt(((_document$getElementB3 = document.getElementById('cfg-cooldown')) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value) || '45');
  const dailyLimit = parseInt(((_document$getElementB4 = document.getElementById('cfg-daily-limit')) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.value) || '3');
  const cfg = {
    cooldown,
    dailyLimit
  };
  localStorage.setItem(ANTISPAM_KEY, JSON.stringify(cfg));
  if (window.fb_saveAntiSpamCfg) await window.fb_saveAntiSpamCfg(cfg).catch(() => {});
  showToast('antispam-toast');
}

// Añadir teléfono a la blacklist
async function addToBlacklist() {
  const input = document.getElementById('blacklist-input');
  if (!input) return;
  const phone = input.value.replace(/[\s\-().+]/g, '').trim();
  if (!/^\d{9}$/.test(phone)) {
    alert('Introduce un teléfono válido de 9 dígitos');
    return;
  }
  const list = getBlacklist();
  if (list.includes(phone)) {
    alert('Este número ya está bloqueado');
    return;
  }
  list.push(phone);
  saveBlacklistLocal(list);
  if (window.fb_saveBlacklist) await window.fb_saveBlacklist(list).catch(() => {});
  input.value = '';
  renderBlacklist();
  showToast('blacklist-toast');
}

// Quitar teléfono de la blacklist
async function removeFromBlacklist(phone) {
  const list = getBlacklist().filter(p => p !== phone);
  saveBlacklistLocal(list);
  if (window.fb_saveBlacklist) await window.fb_saveBlacklist(list).catch(() => {});
  renderBlacklist();
  showToast('blacklist-toast');
}

// Renderizar lista de bloqueados en el panel
function renderBlacklist() {
  const el = document.getElementById('blacklist-list');
  if (!el) return;
  const list = getBlacklist();
  if (!list.length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E;padding:8px 0">Ningún número bloqueado</div>';
    return;
  }
  el.innerHTML = list.map(phone => "<div style=\"display:flex;align-items:center;justify-content:space-between;background:#FFF8EE;border:1.5px solid #e74c3c;border-radius:8px;padding:8px 12px\">\n      <span style=\"font-size:14px;font-weight:700;color:#3D1F0D;letter-spacing:.05em\">".concat(phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), "</span>\n      <button onclick=\"removeFromBlacklist('").concat(phone, "')\" style=\"background:#c0392b;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Desbloquear</button>\n    </div>")).join('');
}

// Verificar si un teléfono puede pedir (cooldown + daily limit) — consulta Firebase
function recordOrderStats_BASE(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) {
    // Archivar día anterior en historial antes de resetear
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  stats.orders.unshift({
    num: orderNum,
    name,
    total,
    time: new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    slot: slotTime || null
  });
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
function loadDayStats() {
  const todayKey = new Date().toISOString().slice(0, 10);
  // Intentar cargar desde Firebase primero (fuente de verdad entre dispositivos)
  if (window.fb_getStats) {
    window.fb_getStats(todayKey).then(fbStats => {
      if (fbStats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(fbStats));
        _renderDayStats(fbStats, todayKey);
      } else {
        _renderDayStats(null, todayKey);
      }
    }).catch(() => _renderDayStats(null, todayKey));
    // Mostrar lo que haya en localStorage mientras espera Firebase
    let statsLocal;
    try {
      statsLocal = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      statsLocal = {};
    }
    if (statsLocal.date === todayKey && statsLocal.count > 0) _renderDayStats(statsLocal, todayKey);
    return;
  }
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  _renderDayStats(stats, todayKey);
}
function _renderDayStats(stats, todayKey) {
  if (!stats || stats.date !== todayKey) stats = {
    date: todayKey,
    count: 0,
    total: 0,
    orders: []
  };
  document.getElementById('stat-count').textContent = stats.count;
  document.getElementById('stat-total').textContent = stats.total.toFixed(2).replace('.', ',') + ' €';
  const list = document.getElementById('stat-orders-list');
  if (!stats.orders || stats.orders.length === 0) {
    list.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:16px 0">Sin pedidos por ahora</div>';
  } else {
    list.innerHTML = stats.orders.map(o => "\n      <div style=\"display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n        <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n        <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n        ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">\uD83D\uDD50 ".concat(escapeHtml(o.slot), "</span>") : '', "\n        <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(o.total.toFixed(2).replace('.', ','), " \u20AC</span>\n        <button onclick=\"printOrderFromStats('").concat(escapeAttr(o.num), "','").concat(escapeAttr(o.name), "','").concat(escapeAttr(o.time), "',").concat(parseFloat(o.total), ",'").concat(escapeAttr(o.slot || ''), "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#3D1F0D\">\uD83D\uDDA8\uFE0F</button>\n      </div>")).join('');
  }

  // Render admin slot grid
  const adminGrid = document.getElementById('admin-slots-grid');
  if (adminGrid) {
    const slotsData = getSlotsData();
    const slots = getSlots();
    adminGrid.innerHTML = slots.map(slot => {
      const count = slotsData.slots[slot] || 0;
      const full = count >= getSlotMax();
      const color = full ? '#c0392b' : count > 0 ? '#3D1F0D' : '#5ECC76';
      return "\n      <div style=\"border:1.5px solid ".concat(color, "22;border-radius:8px;padding:8px 10px;text-align:center\">\n        <div style=\"font-size:14px;font-weight:700;color:#3D1F0D\">").concat(slot, "</div>\n        <div style=\"font-size:20px;font-weight:900;color:").concat(color, "\">").concat(count, "/").concat(getSlotMax(), "</div>\n        <div style=\"height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden\">\n          <div style=\"height:100%;width:").concat(Math.round(count / getSlotMax() * 100), "%;background:").concat(color, ";border-radius:99px\"></div>\n        </div>\n      </div>");
    }).join('');
  }
}
function resetSlots() {
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});
  loadDayStats();
}
async function confirmClearDay() {
  if (!confirm('¿Limpiar todos los pedidos del día?\nEsta acción no se puede deshacer.')) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  // Borrar pedidos y stats del día — local primero
  localStorage.removeItem(STATS_KEY);
  // Borrar en Firebase (fuente de verdad) para que loadLiveOrders no los restaure
  if (window.fb_saveStats) {
    await window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  // Limpiar slots
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});
  // Refrescar vista — await para que Firebase haya confirmado el borrado antes de leer
  await loadLiveOrders();
  logActivity('🗑️ Pedidos del día eliminados manualmente');
  showToast('live-clear-toast');
}
async function resetDayStats() {
  const todayKey = new Date().toISOString().slice(0, 10);
  localStorage.removeItem(STATS_KEY);
  // Borrar en Firebase para que no restaure los datos al recargar
  if (window.fb_saveStats) {
    await window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  loadDayStats();
}
async function showSuccess(orderNum, slotTime) {
  // Pedido confirmado con éxito: si el drawer móvil seguía abierto, ya
  // podemos cerrarlo (antes se cerraba nada más pulsar "Confirmar", lo
  // que rompía el resaltado de campos con error en submitOrderFromDrawer).
  if (typeof closeCartDrawer === 'function') closeCartDrawer();

  // Restaurar el texto normal de "pedido confirmado" — si el cliente había
  // cancelado un pedido antes en esta misma visita, cancelarPedido() dejó
  // este mismo bloque con el texto de "❌ Pedido cancelado" puesto, y sin
  // esto se quedaba así para siempre aunque el pedido SIGUIENTE sí se
  // confirmara bien (confundía al cliente, que creía que había fallado y
  // podía llegar a repetir el pedido).
  const _icon = document.querySelector('#success-screen .success-icon');
  const _title = document.querySelector('#success-screen .success-title');
  const _sub = document.querySelector('#success-screen .success-sub');
  if (_icon) _icon.textContent = '🥔';
  if (_title) _title.textContent = '¡Pedido confirmado!';
  if (_sub) _sub.textContent = 'Te esperamos en el local';
  // Exponer datos del pedido para el botón de WhatsApp
  window.currentOrderNum = orderNum;
  window.currentOrderSlot = slotTime || null;
  window.currentOrderName = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
  window.currentOrderTotal = 0;
  window.currentOrderItems = [];
  try {
    // Antes solo se leía `cart` (productos normales del menú) — los
    // personalizados (Patata Al Gusto, Patata Bomba, vía custCart) y los
    // complementos sueltos (extrasCart) se quedaban fuera, así que nunca
    // se contaban en ventasProductos/{fecha}, la analítica que usa
    // finanzas.js para "Estrellas y perdedores". Si el admin les asigna
    // coste ahí, aparecían siempre con 0 ventas por mucho que se vendieran.
    const itemsNormales = Object.entries(cart).map(([id, qty]) => {
      const item = MENU.find(m => m.id == id);
      if (!item) return null;
      return { id: item.id, qty, name: item.name, price: item.price * qty };
    }).filter(Boolean);
    const itemsCustom = Object.values(custCart).filter(c => c.qty > 0).map(c => {
      const item = MENU.find(m => m.id == c.menuId);
      if (!item) return null;
      const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
      return { id: item.id, qty: c.qty, name: item.name, price: unitPrice * c.qty };
    }).filter(Boolean);
    const itemsExtras = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
      const item = MENU.find(m => m.id == c.menuId);
      if (!item) return null;
      const unitPrice = typeof getExtrasItemPrice === 'function' ? getExtrasItemPrice(c) : item.price;
      return { id: item.id, qty: c.qty, name: item.name, price: unitPrice * c.qty };
    }).filter(Boolean);
    window.currentOrderItems = [...itemsNormales, ...itemsCustom, ...itemsExtras];
    window.currentOrderTotal = window.currentOrderItems.reduce((s, i) => s + i.price, 0);
  } catch(e) {}
  recordProductSales(window.currentOrderItems);
  const orderTotal = _lastTicketData ? _lastTicketData.total : 0;
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.replace(/[\s\-().+]/g, '').trim();
  const notes = document.getElementById("customer-notes").value.trim();
  // Await so ticket data is saved before admin can print
  await recordOrderStats(orderNum, name, orderTotal, slotTime);

  // Guardar snapshot del pedido para poder modificarlo/cancelarlo
  window._lastOrderData = {
    num: orderNum,
    name,
    phone,
    notes,
    total: orderTotal,
    items: _lastTicketData ? [...(_lastTicketData.items || [])] : [],
    slot: slotTime || null,
    cart: JSON.parse(JSON.stringify(cart)),
    custCart: JSON.parse(JSON.stringify(custCart)),
    extrasCart: JSON.parse(JSON.stringify(extrasCart)),
    ts: Date.now()
  };

  // Guardar en localStorage para recuperar si se cierra la pestaña
  try {
    localStorage.setItem('dpf_active_order', JSON.stringify(window._lastOrderData));
  } catch (e) {}

  // Guardar aparte, sin caducar, para "Repetir mi último pedido" en una
  // visita futura — a diferencia de dpf_active_order (que se borra en
  // cuanto se cierra la ventana de modificar/cancelar), esto se queda.
  // Solo líneas de producto real: sin gastos de gestión (isFee) ni el
  // descuento/aviso de fidelización (subtotal <= 0).
  try {
    const _itemsRepetibles = (_lastTicketData ? _lastTicketData.items || [] : []).filter(i => !i.isFee && i.subtotal > 0);
    if (_itemsRepetibles.length) {
      localStorage.setItem('dpf_ultimo_pedido', JSON.stringify({
        items: _itemsRepetibles,
        total: orderTotal,
        cart: JSON.parse(JSON.stringify(cart)),
        custCart: JSON.parse(JSON.stringify(custCart)),
        extrasCart: JSON.parse(JSON.stringify(extrasCart)),
        ts: Date.now()
      }));
    }
  } catch (e) {}

  // Registrar el slot
  if (slotTime) incrementSlot(slotTime);

  // Nombre del cliente
  const customerInfoEl = document.getElementById('success-customer-info');
  const customerNameEl = document.getElementById('success-customer-name');
  if (customerNameEl) customerNameEl.textContent = name;

  // Mostrar hora de recogida en pantalla de éxito
  const slotInfo = document.getElementById('success-slot-info');
  const slotTimeEl = document.getElementById('success-slot-time');
  if (slotTime && slotInfo && slotTimeEl) {
    slotTimeEl.textContent = slotTime;
    slotInfo.style.display = 'flex';
  } else if (slotInfo) {
    slotInfo.style.display = 'none';
  }

  // Estimación de espera según la cola actual — solo si hay bastante
  // ambiente (mismo umbral que el aviso previo de saturación), para no
  // asustar al cliente en un día tranquilo con un aviso que no aplica.
  const tiempoEstEl = document.getElementById('success-tiempo-estimado');
  if (tiempoEstEl) {
    let _pendientesAhora = 0;
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (stats && stats.date === todayKey && Array.isArray(stats.orders)) {
        _pendientesAhora = stats.orders.filter(o => {
          const s = (typeof getOrderStatus === 'function') ? getOrderStatus(o.num) : 'nuevo';
          return s !== 'entregado' && s !== 'listo' && s !== 'cancelado';
        }).length;
      }
    } catch (e) {}
    const minutosExtra = (typeof _estimarMinutosEspera === 'function') ? _estimarMinutosEspera(_pendientesAhora) : 0;
    if (minutosExtra > 0) {
      tiempoEstEl.textContent = '⏳ Ahora mismo hay ' + _pendientesAhora + ' pedidos en cola — puede tardar unos ' + minutosExtra + ' min más de lo habitual.';
      tiempoEstEl.style.display = 'block';
    } else {
      tiempoEstEl.style.display = 'none';
    }
  }

  // Resumen de ítems
  const itemsContainer = document.getElementById('success-items-list');
  if (itemsContainer && _lastTicketData && _lastTicketData.items.length) {
    const itemsHTML = _lastTicketData.items.map(it => "\n      <div class=\"success-item-row\">\n        <span class=\"success-item-name\">".concat(it.name, "</span>\n        <span class=\"success-item-qty\">\xD7").concat(it.qty, "</span>\n        <span class=\"success-item-price\">").concat(it.subtotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>")).join('');
    itemsContainer.innerHTML = "\n      <div class=\"success-summary-title\">\uD83E\uDDFE Resumen del pedido</div>\n      ".concat(itemsHTML, "\n      <div class=\"success-total-row\">\n        <span>Total a pagar</span>\n        <span>").concat(orderTotal.toFixed(2).replace('.', ','), " \u20AC</span>\n      </div>");
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
  }
  document.querySelector('.order-panel').style.display = "none";
  document.getElementById("success-screen").style.display = "block";
  document.getElementById("order-num-display").textContent = orderNum;
  // Se muestra si falla el guardado en el servidor (ver _finalizarPedido) —
  // hay que resetearlo aquí para que no se quede pegado de un pedido anterior.
  const saveWarning = document.getElementById('success-save-warning');
  if (saveWarning) saveWarning.style.display = 'none';
  if (typeof _sonidoConfirmacionPedido === 'function') _sonidoConfirmacionPedido();
  // Ocultar FAB en pantalla de éxito
  const fab = document.getElementById('cart-fab');
  if (fab) fab.classList.add('hidden');
  // Arrancar temporizador de modificación (5 minutos)
  _startModifyTimer();
  setTimeout(() => {
    document.getElementById("success-screen").scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 50);
}
function resetOrder() {
  cart = {};
  Object.keys(custCart).forEach(k => delete custCart[k]);
  Object.keys(extrasCart).forEach(k => delete extrasCart[k]);
  selectedSlot = null;
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
  document.getElementById("customer-notes").value = "";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  window._lastOrderData = null;
  // Para que la sugerencia "¿algo dulce de postre?" se pueda volver a
  // mostrar (con opciones nuevas) en el pedido siguiente, en vez de
  // arrastrar el "ya se mostró"/las mismas opciones del pedido anterior.
  window._upsellFueMostrado = false;
  window._upsellOpcionesElegidas = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
}

// ── MODIFICAR / CANCELAR PEDIDO ──────────────────────────────────────────────
// dpf_modify_window_mins (el nombre de la clave se mantiene por
// compatibilidad con lo ya guardado) ahora se cuenta en SEGUNDOS, no
// minutos — a petición expresa: 10 segundos, no 10 minutos.
const MODIFY_WINDOW_DEFAULT_MS = 10 * 1000;
function getModifyWindowMs() {
  try {
    const v = parseInt(localStorage.getItem('dpf_modify_window_mins') || '10');
    return (isNaN(v) || v < 1 || v > 300 ? 10 : v) * 1000;
  } catch (e) {
    return MODIFY_WINDOW_DEFAULT_MS;
  }
}
async function cancelarPedidoAdmin(orderNum) {
  if (!confirm("\xBFCancelar el pedido ".concat(orderNum, "? Se eliminar\xE1 de estad\xEDsticas y cocina."))) return;
  await _borrarPedidoDeFirebase(orderNum);
  logActivity("\u274C Pedido ".concat(orderNum, " cancelado manualmente desde el panel"));
}
function _startModifyTimer() {
  if (window._modifyTimerInterval) clearInterval(window._modifyTimerInterval);
  const zone = document.getElementById('order-modify-zone');
  const timerEl = document.getElementById('order-modify-timer');
  const btnMod = document.getElementById('btn-modificar-pedido');
  const btnCan = document.getElementById('btn-cancelar-pedido');
  if (!zone || !timerEl) return;
  function _tick() {
    if (!window._lastOrderData) {
      clearInterval(window._modifyTimerInterval);
      return;
    }
    const elapsed = Date.now() - window._lastOrderData.ts;
    const remaining = getModifyWindowMs() - elapsed;
    if (remaining <= 0) {
      clearInterval(window._modifyTimerInterval);
      zone.style.display = 'none';
      return;
    }
    const totalSecs = Math.ceil(remaining / 1000);
    const tiempoTxt = totalSecs < 60
      ? totalSecs + ' s'
      : Math.floor(totalSecs / 60) + ':' + String(totalSecs % 60).padStart(2, '0') + ' min';
    timerEl.textContent = "\u23F1\uFE0F Puedes modificar o cancelar tu pedido durante ".concat(tiempoTxt);
    if (btnMod) btnMod.style.display = '';
    if (btnCan) btnCan.style.display = '';
    zone.style.display = 'block';
  }
  _tick();
  window._modifyTimerInterval = setInterval(_tick, 1000);
}
async function modificarPedido() {
  const data = window._lastOrderData;
  if (!data) return;
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u270F\uFE0F</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFModificar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">Se borrar\xE1 el pedido actual y podr\xE1s rehacerlo con los mismos productos.</div>\n        <div style=\"display:flex\">\n          <button id=\"_mod-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Cancelar</button>\n          <button id=\"_mod-yes\" style=\"flex:1;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, modificar</button>\n        </div>\n      </div>";
    document.body.appendChild(modal);
    document.getElementById('_mod-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_mod-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;

  // Borrar pedido actual de Firebase y stats
  await _borrarPedidoDeFirebase(data.num);

  // Restaurar carrito con los productos anteriores
  Object.assign(cart, data.cart);
  Object.keys(data.custCart).forEach(k => {
    custCart[k] = data.custCart[k];
  });
  Object.keys(data.extrasCart).forEach(k => {
    extrasCart[k] = data.extrasCart[k];
  });
  selectedSlot = data.slot;

  // Restaurar datos del cliente
  document.getElementById("customer-name").value = data.name || '';
  document.getElementById("customer-phone").value = data.phone || '';
  document.getElementById("customer-notes").value = data.notes || '';

  // Volver al formulario
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  renderMenu();
  renderCart();
  document.querySelector('.order-panel').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}
async function cancelarPedido() {
  const data = window._lastOrderData;
  if (!data) return;

  // iOS Safari bloquea confirm() silenciosamente — usamos modal propio
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = "\n      <div style=\"background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center\">\n        <div style=\"font-size:32px;margin-bottom:12px\">\u274C</div>\n        <div style=\"font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px\">\xBFCancelar pedido?</div>\n        <div style=\"font-size:14px;color:#8A6A4E;margin-bottom:20px\">El pedido ".concat(data.num, " se eliminar\xE1. Esta acci\xF3n no se puede deshacer.</div>\n        <div style=\"display:flex\">\n          <button id=\"_cancel-no\"  style=\"flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">No, mantener</button>\n          <button id=\"_cancel-yes\" style=\"flex:1;padding:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">S\xED, cancelar</button>\n        </div>\n      </div>");
    document.body.appendChild(modal);
    document.getElementById('_cancel-no').onclick = () => {
      modal.remove();
      resolve(false);
    };
    document.getElementById('_cancel-yes').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
  if (!confirmado) return;
  await _borrarPedidoDeFirebase(data.num);
  window._lastOrderData = null;
  try {
    localStorage.removeItem('dpf_active_order');
  } catch (e) {}
  if (window._modifyTimerInterval) {
    clearInterval(window._modifyTimerInterval);
    window._modifyTimerInterval = null;
  }
  const icon = document.querySelector('#success-screen .success-icon');
  const title = document.querySelector('#success-screen .success-title');
  const sub = document.querySelector('#success-screen .success-sub');
  if (icon) icon.textContent = '❌';
  if (title) title.textContent = 'Pedido cancelado';
  if (sub) sub.textContent = 'Tu pedido ha sido eliminado';
  document.getElementById('order-modify-zone').style.display = 'none';
  document.getElementById('success-items-list').innerHTML = '';
}
// Resta de ventasProductos/{fecha} lo que sumó recordProductSales() para
// este pedido — antes, cancelar un pedido (admin) o que el cliente lo
// modificara (que primero lo borra y luego reenvía uno nuevo) dejaba sus
// productos contados para siempre en la analítica de "Estrellas y
// perdedores", aunque el pedido ya no existiera o se hubiera duplicado.
// pedido.items no lleva el id del producto (solo name/qty/subtotal, tal
// como lo guarda guardar-pedido.php), así que se busca por nombre.
async function _revertirVentasProductos(items) {
  if (!items || !items.length || typeof firebase === 'undefined' || !firebase.database) return;
  const fecha = new Date().toISOString().slice(0, 10);
  const mutator = function (current) {
    const actual = current || {};
    items.forEach(it => {
      if (it.isFee || !it.name) return;
      const menuItem = typeof MENU !== 'undefined' ? MENU.find(m => m.name === it.name) : null;
      if (!menuItem) return;
      const id = String(menuItem.id);
      if (actual[id] == null) return;
      actual[id] = Math.max(0, actual[id] - (it.qty || 0));
      if (actual[id] === 0) delete actual[id];
    });
    return actual;
  };
  try {
    // Transacción: este mismo nodo lo escribe también cada pedido real de
    // un cliente al llegar (recordProductSales) — un .set() plano aquí
    // podía perder esa cuenta si un pedido nuevo llegaba justo mientras se
    // revertía otro cancelado.
    if (window.fb_transactNative) {
      await window.fb_transactNative('ventasProductos/' + fecha, mutator);
    } else {
      const ref = firebase.database().ref('ventasProductos/' + fecha);
      const sn = await ref.once('value');
      if (!sn.exists()) return;
      await ref.set(mutator(sn.val()));
    }
  } catch (e) {
    console.warn('[ventasProductos] no se pudo revertir', e);
  }
}
async function _borrarPedidoDeFirebase(orderNum) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // 1. Marcar como cancelado en memoria, localStorage y Firebase — inmediato
  await setOrderStatus(orderNum, 'cancelado');

  let itemsParaRevertir = null;

  // 2. Borrar de Firebase stats y liberar slot si tenía uno
  let slotToFree = null;
  // Transacción: stats/<fecha> también lo escribe guardar-pedido.php cada
  // vez que entra un pedido nuevo (con su propia protección de condición de
  // carrera) — un .set() plano aquí (leer, filtrar en memoria, sobreescribir
  // el nodo entero) podía perder en silencio un pedido real que llegara
  // justo mientras se cancelaba otro distinto desde el panel.
  const mutatorStats = function (current) {
    const stats = current || { orders: [] };
    if (!Array.isArray(stats.orders)) stats.orders = [];
    const pedido = stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
    if (pedido && pedido.slot) slotToFree = pedido.slot;
    if (pedido && pedido.items) itemsParaRevertir = pedido.items;
    stats.orders = stats.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
    stats.count = Math.max(0, stats.orders.length);
    stats.total = stats.orders.reduce((acc, o) => acc + (o.total || 0), 0);
    return stats;
  };
  if (window.fb_transactNative) {
    try { await window.fb_transactNative('stats/' + todayKey, mutatorStats); } catch {}
  } else if (window.fb_getStats && window.fb_saveStats) {
    try {
      const stats = await window.fb_getStats(todayKey);
      if (stats) await window.fb_saveStats(mutatorStats(stats));
    } catch {}
  }

  // 3. Borrar también de localStorage y liberar slot si no lo encontramos en Firebase
  try {
    const local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    if (local.orders) {
      const pedido = local.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
      if (pedido && pedido.slot && !slotToFree) slotToFree = pedido.slot;
      if (pedido && pedido.items && !itemsParaRevertir) itemsParaRevertir = pedido.items;
      local.orders = local.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
      local.count = Math.max(0, (local.count || 1) - 1);
      local.total = local.orders.reduce((acc, o) => acc + (o.total || 0), 0);
      localStorage.setItem(STATS_KEY, JSON.stringify(local));
    }
  } catch {}

  if (itemsParaRevertir) _revertirVentasProductos(itemsParaRevertir);

  // 4. El slot NO se libera al cancelar — el turno quedó ocupado

  // 5. Refrescar cocina y pedidos en vivo inmediatamente
  refreshKitchenGrid();
  loadLiveOrders();
}

// ══════════════════════════════════════════
//  CUSTOMIZER — PATATA AL GUSTO & BOMBA
// ══════════════════════════════════════════

// custCart holds custom items: key → { menuId, qty, sauces, ingredients, key }
const custCart = {};
const CUSTOMIZER_CONFIG = {
  algusto: {
    name: 'Patata Al Gusto',
    price: 6.90,
    maxSauces: 1,
    maxIngredients: 6,
    maxTotal: null,
    subtitle: 'Hasta 1 salsa y hasta 6 ingredientes a elegir'
  },
  bomba: {
    name: 'Patata Bomba 🆕',
    price: 8.40,
    maxSauces: null,
    maxIngredients: null,
    maxTotal: 9,
    subtitle: 'Hasta 9 ingredientes y/o salsas a elegir'
  }
};
const CUST_SAUCES = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa Rosa', 'Salsa de Yogur', 'Tomate Frito', 'Queso Philadelphia', 'Roquefort'];
const CUST_INGREDIENTS = ['Jamón York', 'Carne Picada', 'Pollo', 'Carne Kebab', 'Atún', 'Gambas', 'Tronquitos de Mar', 'Huevo', 'Bacon', 'Queso Mozzarella', '4 Quesos', 'Tomate Natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
let custType = null;
let custSelSauces = [];
let custSelIngredients = [];
let custExtraQueso = false;
let custExtraGratinado = false;
function openCustomizer(itemId) {
  const cm = document.getElementById('customizer-modal');
  if (cm && cm.parentElement !== document.body) document.body.appendChild(cm);
  custType = itemId === 15 ? 'algusto' : 'bomba';
  custSelSauces = [];
  custSelIngredients = [];
  custExtraQueso = false;
  custExtraGratinado = false;
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-price').textContent = cfg.price.toFixed(2).replace('.', ',') + ' €';
  document.getElementById('cust-error').style.display = 'none';
  // Reset extras UI
  updateCustExtraUI('queso', false);
  updateCustExtraUI('gratinado', false);
  // Restaurar visibilidad de barra de salsas (puede haber quedado oculta de bomba anterior)
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (sauceProg) sauceProg.style.display = 'flex';
  renderCustChips();
  updateCustProgress();
  // Guardar posición de scroll antes de bloquear — evita salto al cerrar en móvil
  window._custScrollY = window.scrollY;
  document.getElementById('customizer-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCustomizer() {
  document.getElementById('customizer-modal').classList.remove('open');
  document.body.style.overflow = '';
  // Restaurar posición de scroll — Safari no soporta behavior:'instant', usar scrollTo directamente
  if (window._custScrollY !== undefined) {
    window.scrollTo(0, window._custScrollY);
    window._custScrollY = undefined;
  }
  custType = null;
}
function custSelTotal() {
  return custSelSauces.length + custSelIngredients.length;
}
function toggleCustExtra(type) {
  if (type === 'queso') {
    custExtraQueso = !custExtraQueso;
    // Si quita queso y no es solo gratinado, quitar también gratinado
    if (!custExtraQueso && custExtraGratinado) {
      custExtraGratinado = false;
      updateCustExtraUI('gratinado', false);
    }
  } else {
    custExtraGratinado = !custExtraGratinado;
    // Si activa gratinado, activar queso también
    if (custExtraGratinado && !custExtraQueso) {
      custExtraQueso = true;
      updateCustExtraUI('queso', true);
    }
  }
  updateCustExtraUI(type, type === 'queso' ? custExtraQueso : custExtraGratinado);
  updateCustTotalPrice();
}
function updateCustExtraUI(type, active) {
  const check = document.getElementById('cust-extra-check-' + type);
  const label = document.getElementById('cust-' + type + '-label');
  if (!check) return;
  if (active) {
    check.style.background = '#3D1F0D';
    check.style.borderColor = '#3D1F0D';
    check.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) {
      label.style.borderColor = '#3D1F0D';
      label.style.background = 'rgba(244,196,48,0.08)';
    }
  } else {
    check.style.background = '#fff';
    check.style.borderColor = '#F5E6C8';
    check.innerHTML = '';
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  }
}
function updateCustTotalPrice() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  let price = cfg.price;
  if (custExtraQueso) price += 1.00;
  if (custExtraGratinado) price += 0.50;
  document.getElementById('cust-price').textContent = price.toFixed(2).replace('.', ',') + ' €';
}
function renderCustChips() {
  if (!custType) return;
  const cfg = CUSTOMIZER_CONFIG[custType];
  if (!cfg) return;
  const saucesEl = document.getElementById('cust-sauces');
  const ingsEl = document.getElementById('cust-ingredients');
  saucesEl.innerHTML = CUST_SAUCES.map(s => {
    const sel = custSelSauces.includes(s);
    // Salsas: bloqueadas por maxSauces (algusto) o por maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustSauce(this,'").concat(s.replace(/'/g, "&#39;"), "')\">").concat(s, "</button>");
  }).join('');
  ingsEl.innerHTML = CUST_INGREDIENTS.map(i => {
    const sel = custSelIngredients.includes(i);
    // Ingredientes: bloqueados por maxIngredients (algusto) o maxTotal combinado (bomba)
    let disabled = !sel && (cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients || cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal);
    return "<button class=\"chip ".concat(sel ? 'selected' : '', " ").concat(disabled ? 'disabled' : '', "\"\n      onclick=\"toggleCustIng(this,'").concat(i.replace(/'/g, "&#39;"), "')\">").concat(i, "</button>");
  }).join('');
}
function toggleCustSauce(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelSauces.indexOf(name);
  if (idx >= 0) custSelSauces.splice(idx, 1);else custSelSauces.push(name);
  renderCustChips();
  updateCustProgress();
}
function toggleCustIng(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelIngredients.indexOf(name);
  if (idx >= 0) custSelIngredients.splice(idx, 1);else custSelIngredients.push(name);
  renderCustChips();
  updateCustProgress();
}
function updateCustProgress() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const ns = custSelSauces.length,
    ni = custSelIngredients.length,
    total = ns + ni;
  const sauceProg = document.getElementById('cust-sauce-progress');
  if (cfg.maxTotal !== null) {
    // Bomba: una barra de progreso total combinada, ocultar barra de salsas separada
    const pct = Math.min(100, Math.round(total / cfg.maxTotal * 100));
    const cls = pct >= 100 ? 'full' : '';
    if (sauceProg) sauceProg.style.display = 'none';
    document.getElementById('cust-sauce-badge').textContent = ns;
    document.getElementById('cust-ing-label').textContent = 'Total: ' + total + '/' + cfg.maxTotal + ' (salsas: ' + ns + ' · ing: ' + ni + ')';
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pct / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill ' + cls;
    document.getElementById('cust-ing-badge').textContent = total + '/' + cfg.maxTotal;
  } else {
    // Al Gusto: dos barras independientes
    if (sauceProg) sauceProg.style.display = 'flex';
    const pctS = Math.min(100, Math.round(ns / cfg.maxSauces * 100));
    const pctI = Math.min(100, Math.round(ni / cfg.maxIngredients * 100));
    document.getElementById('cust-sauce-label').textContent = 'Salsas: ' + ns + '/' + cfg.maxSauces;
    document.getElementById('cust-sauce-bar').style.setProperty('--pct', pctS / 100);
    document.getElementById('cust-sauce-bar').className = 'progress-bar-fill' + (pctS >= 100 ? ' full' : '');
    document.getElementById('cust-sauce-badge').textContent = ns + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-label').textContent = 'Ingredientes: ' + ni + '/' + cfg.maxIngredients;
    document.getElementById('cust-ing-bar').style.setProperty('--pct', pctI / 100);
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill' + (pctI >= 100 ? ' full' : '');
    document.getElementById('cust-ing-badge').textContent = ni + '/' + cfg.maxIngredients;
  }
}
function removeCustItem(key) {
  delete custCart[key];
  renderMenu();
  renderCart();
}
function confirmCustomizer() {
  if (isShopBlocked()) {
    showClosedToast();
    closeCustomizer();
    return;
  }
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';

  // Validar máximos
  if (cfg.maxTotal !== null && custSelTotal() > cfg.maxTotal) {
    errEl.textContent = 'Máximo ' + cfg.maxTotal + ' ingredientes y/o salsas en total';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxSauces !== null && custSelSauces.length > cfg.maxSauces) {
    errEl.textContent = 'Máximo ' + cfg.maxSauces + ' salsa';
    errEl.style.display = 'block';
    return;
  }
  if (cfg.maxIngredients !== null && custSelIngredients.length > cfg.maxIngredients) {
    errEl.textContent = 'Máximo ' + cfg.maxIngredients + ' ingredientes';
    errEl.style.display = 'block';
    return;
  }
  const itemId = custType === 'algusto' ? 15 : 16;
  const fingerprint = [...custSelSauces, '|', ...custSelIngredients, '|', custExtraQueso ? 'Q' : '', custExtraGratinado ? 'G' : ''].join(',');
  const cartKey = itemId + '::' + fingerprint;
  if (!custCart[cartKey]) {
    custCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      sauces: [...custSelSauces],
      ingredients: [...custSelIngredients],
      extraQueso: custExtraQueso,
      extraGratinado: custExtraGratinado,
      key: cartKey
    };
  }
  custCart[cartKey].qty++;
  closeCustomizer();
  renderMenu();
  renderCart();
}
function toggleForceSlots() {
  const active = localStorage.getItem('dpf_force_slots') === '1';
  localStorage.setItem('dpf_force_slots', active ? '0' : '1');
  updateForceSlotsBtn();
  renderSlotPicker();
}
function updateForceSlotsBtn() {
  const btn = document.getElementById('force-slots-btn');
  if (!btn) return;
  const active = localStorage.getItem('dpf_force_slots') === '1';
  btn.textContent = active ? '✅ Activado' : '⚪ Desactivado';
  btn.style.background = active ? '#e8f8ed' : '#fafafa';
  btn.style.borderColor = active ? '#5ECC76' : '#ddd';
  btn.style.color = active ? '#27855a' : '#888';
}


// ── GESTIÓN DE TURNOS ADMIN ──
function loadSlotTurnosUI() {
  const turnos = getSlotTurnos();
  const maxVal = getSlotMax();
  const inp = document.getElementById('slot-max-input');
  if (inp) inp.value = maxVal;
  renderSlotTurnosList(turnos);
}
function renderSlotTurnosList(turnos) {
  const list = document.getElementById('slot-turnos-list');
  if (!list) return;
  if (turnos.length === 0) {
    list.innerHTML = '<div style="font-size:13px;color:#8A6A4E;text-align:center;padding:10px">Sin turnos configurados</div>';
    return;
  }
  list.innerHTML = turnos.map((t, i) => "\n    <div style=\"display:flex;align-items:center;flex-wrap:wrap;background:#F4F2EE;border-radius:8px;padding:10px 12px;margin-bottom:8px\">\n      <span style=\"font-size:12px;font-weight:700;color:#8A6A4E;min-width:20px\">".concat(i + 1, ".</span>\n      <label style=\"font-size:12px;color:#8A6A4E\">Desde</label>\n      <input type=\"time\" value=\"").concat(t.start, "\" onchange=\"updateSlotTurno(").concat(i, ",'start',this.value)\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n      <label style=\"font-size:12px;color:#8A6A4E\">Hasta</label>\n      <input type=\"time\" value=\"").concat(t.end, "\" onchange=\"updateSlotTurno(").concat(i, ",'end',this.value)\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n      <label style=\"font-size:12px;color:#8A6A4E\">Cada</label>\n      <select onchange=\"updateSlotTurno(").concat(i, ",'interval',parseInt(this.value))\"\n        style=\"padding:5px 8px;border:1.5px solid #E2DED7;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2A1506;background:#fff;outline:none\">\n        <option value=\"15\" ").concat(t.interval === 15 ? 'selected' : '', ">15 min</option>\n        <option value=\"20\" ").concat(t.interval === 20 ? 'selected' : '', ">20 min</option>\n        <option value=\"30\" ").concat(!t.interval || t.interval === 30 ? 'selected' : '', ">30 min</option>\n        <option value=\"45\" ").concat(t.interval === 45 ? 'selected' : '', ">45 min</option>\n        <option value=\"60\" ").concat(t.interval === 60 ? 'selected' : '', ">60 min</option>\n      </select>\n      <button onclick=\"removeSlotTurno(").concat(i, ")\"\n        style=\"margin-left:auto;background:#fff;border:1.5px solid #e74c3c;color:#c0392b;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">&#128465;</button>\n    </div>")).join('');
}
// mutatorFn recibe el array de turnos actual (local o el más reciente de
// Firebase, según el intento) y lo modifica in-place. Evita que dos
// ediciones de turnos casi simultáneas (dos dispositivos) se pisen entre
// sí — igual que el resto de escrituras "leer todo, modificar, guardar
// todo" arregladas en esta misma pasada.
function _mutateSlotTurnos(mutatorFn) {
  const turnos = getSlotTurnos();
  mutatorFn(turnos);
  localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(turnos));
  if (window.fb_transactJsonString) {
    window.fb_transactJsonString('config/slotConfig', function (current) {
      const t = current && Array.isArray(current.turnos) ? current.turnos.slice() : [];
      mutatorFn(t);
      return { turnos: t, max: (current && current.max) || getSlotMax() };
    }).catch(e => console.warn('Firebase slotConfig error', e));
  } else if (window.fb_saveSlotConfig) {
    window.fb_saveSlotConfig(turnos, getSlotMax()).catch(e => console.warn('Firebase slotConfig error', e));
  }
  return turnos;
}
function addSlotTurno() {
  const turnos = _mutateSlotTurnos(function (t) {
    t.push({ start: '19:30', end: '23:30', interval: 30 });
  });
  renderSlotTurnosList(turnos);
}
function removeSlotTurno(idx) {
  const turnos = _mutateSlotTurnos(function (t) {
    if (idx < t.length) t.splice(idx, 1);
  });
  renderSlotTurnosList(turnos);
}
function updateSlotTurno(idx, field, value) {
  _mutateSlotTurnos(function (t) {
    if (t[idx]) t[idx][field] = value;
  });
}
function saveSlotConfig() {
  const maxInp = document.getElementById('slot-max-input');
  const max = parseInt(maxInp ? maxInp.value : '4', 10);
  if (isNaN(max) || max < 1) {
    alert('El número de pedidos por turno debe ser al menos 1');
    return;
  }
  localStorage.setItem(SLOT_MAX_KEY, max);
  SLOT_MAX = max;
  const turnosLocal = getSlotTurnos();
  // Transacción real en vez de leer-modificar-guardar sin más — antes, si
  // otro dispositivo acababa de añadir/quitar un turno justo antes de este
  // guardado (que solo cambia el número máximo por turno), se escribía
  // encima con la copia de turnos que este dispositivo tenía en caché,
  // revirtiendo ese cambio ajeno. _mutateSlotTurnos() ya usa este mismo
  // patrón para las demás ediciones de turnos.
  if (window.fb_transactJsonString) {
    window.fb_transactJsonString('config/slotConfig', function (current) {
      const t = current && Array.isArray(current.turnos) ? current.turnos : turnosLocal;
      return { turnos: t, max: max };
    }).catch(e => console.warn('Firebase slotConfig error', e));
  } else if (window.fb_saveSlotConfig) {
    window.fb_saveSlotConfig(turnosLocal, max).catch(e => console.warn('Firebase slotConfig error', e));
  }
  showToast('slot-config-toast');
  logActivity('🕐 Turnos actualizados — ' + turnosLocal.length + ' franjas · max ' + max + ' pedidos/turno');
  renderSlotPicker();
}

// ══════════════════════════════════════════
//  EXTRAS — QUESO Y GRATINADO EN PATATAS
// ══════════════════════════════════════════

// IDs que tienen queso YA incluido → solo ofrecen gratinado (+0,50€)
const EXTRAS_SOLO_GRATINADO = new Set([4, 5, 6, 8, 11, 12, 14]);
// IDs que pueden añadir queso (+1€) y/o gratinado (+0,50€)
const EXTRAS_QUESO_Y_GRATINADO = new Set([1, 2, 3, 7, 9, 10, 13]);
// IDs al gusto / bomba tienen su propio modal — excluir de extras
const ALL_EXTRAS_IDS = new Set([...EXTRAS_SOLO_GRATINADO, ...EXTRAS_QUESO_Y_GRATINADO]);

// extrasCart: key → { menuId, qty, queso, gratinado, key }
const extrasCart = {};
let _extrasCurrentId = null;
let _extrasQueso = false;
let _extrasGratinado = false;
let _extrasIngredientes = {}; // { name: true/false }

const EXTRAS_ING_PRECIO1 = ['Jamón York', 'Carne Picada', 'Pollo', 'Carne Kebab', 'Atún', 'Gambas', 'Tronquitos de Mar', 'Huevo', 'Bacon', 'Queso Mozzarella', '4 Quesos'];
const EXTRAS_ING_PRECIO07 = ['Tomate Natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
const EXTRAS_SALSAS = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa rosa', 'Salsa de yogur', 'Tomate frito', 'Queso Philadelphia', 'Roquefort'];
const EXTRAS_SALSA_PRECIO = 0.90;
let _extrasSalsas = {}; // { nombre: true/false }
function openExtrasModal(itemId) {
  // Asegurar que el modal está en el body directamente
  const em = document.getElementById('extras-modal');
  if (em && em.parentElement !== document.body) document.body.appendChild(em);
  _extrasCurrentId = itemId;
  _extrasQueso = false;
  _extrasGratinado = false;
  _extrasIngredientes = {};
  _extrasSalsas = {};
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;
  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + item.price.toFixed(2).replace('.', ',') + ' €';
  const onlySoloGratinado = EXTRAS_SOLO_GRATINADO.has(itemId);
  let optionsHtml = '';
  if (!onlySoloGratinado) {
    optionsHtml += "\n      <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('queso')\">\n        <div>\n          <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F9C0; A\xF1adir queso mozzarella</div>\n          <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+1,00 \u20AC</div>\n        </div>\n        <div id=\"extra-check-queso\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n      </label>";
  }
  optionsHtml += "\n    <label style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:12px 14px;cursor:pointer\" onclick=\"toggleExtra('gratinado')\">\n      <div>\n        <div style=\"font-weight:700;font-size:15px;color:#2A1506\">&#x1F525; Gratinar".concat(onlySoloGratinado ? '' : ' (con queso)', "</div>\n        <div style=\"font-size:12px;color:#8A6A4E;margin-top:2px\">+0,50 \u20AC").concat(onlySoloGratinado ? '' : ' · incluye gratinado del queso', "</div>\n      </div>\n      <div id=\"extra-check-gratinado\" style=\"width:24px;height:24px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s\"></div>\n    </label>");

  // Ingredientes extra +1€
  optionsHtml += "<div style=\"margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:#3D1F0D;letter-spacing:.5px\">INGREDIENTES EXTRA</div>";
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO1.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+1,00 \u20AC</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  // Ingredientes extra +0,70€
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_ING_PRECIO07.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraIng('").concat(ing.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(ing, "</div><div style=\"font-size:11px;color:#8A6A4E\">+0,70 \u20AC</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  // Salsas extra +0,90€
  optionsHtml += "<div style=\"margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:#3D1F0D;letter-spacing:.5px\">SALSAS EXTRA</div>";
  optionsHtml += "<div style=\"display:grid;grid-template-columns:1fr 1fr;margin-bottom:4px\">";
  EXTRAS_SALSAS.forEach(salsa => {
    const eid = 'extra-salsa-' + salsa.replace(/[^a-z0-9]/gi, '_');
    optionsHtml += "<label id=\"lbl-".concat(eid, "\" style=\"display:flex;align-items:center;background:#fff;border:1.5px solid #F5E6C8;border-radius:9px;padding:9px 10px;cursor:pointer\" onclick=\"toggleExtraSalsa('").concat(salsa.replace(/'/g, "\'"), "')\" >\n      <div id=\"").concat(eid, "\" style=\"width:20px;height:20px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s\"></div>\n      <div><div style=\"font-size:13px;font-weight:600;color:#2A1506\">").concat(salsa, "</div><div style=\"font-size:11px;color:#8A6A4E\">+").concat(EXTRAS_SALSA_PRECIO.toFixed(2).replace('.', ','), " €</div></div>\n    </label>");
  });
  optionsHtml += "</div>";
  document.getElementById('extras-options').innerHTML = optionsHtml;
  updateExtrasTotal();
  document.getElementById('extras-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function toggleExtra(type) {
  if (type === 'queso') {
    _extrasQueso = !_extrasQueso;
    // Si quita queso, quitar también gratinado si solo gratinado no aplica
    if (!_extrasQueso && !EXTRAS_SOLO_GRATINADO.has(_extrasCurrentId)) {
      // Keep gratinado independent — user can still want it without queso? No: gratinado requiere queso
      _extrasGratinado = false;
      updateExtraCheckUI('gratinado', false);
    }
  } else {
    _extrasGratinado = !_extrasGratinado;
    // Si activa gratinado y no es solo-gratinado, activar queso también automáticamente
    if (_extrasGratinado && !EXTRAS_SOLO_GRATINADO.has(_extrasCurrentId) && !_extrasQueso) {
      _extrasQueso = true;
      updateExtraCheckUI('queso', true);
    }
  }
  updateExtraCheckUI(type, type === 'queso' ? _extrasQueso : _extrasGratinado);
  updateExtrasTotal();
}
function toggleExtraIng(ing) {
  _extrasIngredientes[ing] = !_extrasIngredientes[ing];
  const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi, '_');
  const el = document.getElementById(eid);
  const lbl = document.getElementById('lbl-' + eid);
  const active = _extrasIngredientes[ing];
  if (el) {
    el.style.background = active ? '#3D1F0D' : '#fff';
    el.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    el.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  }
  if (lbl) {
    lbl.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    lbl.style.background = active ? 'rgba(244,196,48,0.08)' : '#fff';
  }
  updateExtrasTotal();
}
function toggleExtraSalsa(salsa) {
  _extrasSalsas[salsa] = !_extrasSalsas[salsa];
  const eid = 'extra-salsa-' + salsa.replace(/[^a-z0-9]/gi, '_');
  const el = document.getElementById(eid);
  const lbl = document.getElementById('lbl-' + eid);
  const active = _extrasSalsas[salsa];
  if (el) {
    el.style.background = active ? '#3D1F0D' : '#fff';
    el.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    el.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  }
  if (lbl) {
    lbl.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
    lbl.style.background = active ? 'rgba(244,196,48,0.08)' : '#fff';
  }
  updateExtrasTotal();
}
function updateExtraCheckUI(type, active) {
  const el = document.getElementById('extra-check-' + type);
  if (!el) return;
  const label = el.closest('label');
  if (active) {
    el.style.background = '#3D1F0D';
    el.style.borderColor = '#3D1F0D';
    el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) {
      label.style.borderColor = '#3D1F0D';
      label.style.background = 'rgba(244,196,48,0.08)';
    }
  } else {
    el.style.background = '#fff';
    el.style.borderColor = '#F5E6C8';
    el.innerHTML = '';
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  }
}
function updateExtrasTotal() {
  const item = MENU.find(m => m.id == _extrasCurrentId);
  if (!item) return;
  let total = item.price;
  if (_extrasQueso) total += 1.00;
  if (_extrasGratinado) total += 0.50;
  Object.entries(_extrasIngredientes).forEach(_ref11 => {
    let _ref12 = _slicedToArray(_ref11, 2),
      ing = _ref12[0],
      active = _ref12[1];
    if (!active) return;
    if (EXTRAS_ING_PRECIO1.includes(ing)) total += 1.00;else if (EXTRAS_ING_PRECIO07.includes(ing)) total += 0.70;
  });
  Object.values(_extrasSalsas).forEach(active => { if (active) total += EXTRAS_SALSA_PRECIO; });
  document.getElementById('extras-total-price').textContent = total.toFixed(2).replace('.', ',') + ' €';
}
function closeExtrasModal() {
  document.getElementById('extras-modal').style.display = 'none';
  document.body.style.overflow = '';
  _extrasCurrentId = null;
}
function confirmExtras() {
  if (isShopBlocked()) {
    showClosedToast();
    closeExtrasModal();
    return;
  }
  const itemId = _extrasCurrentId;
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;
  const ingKeys = Object.entries(_extrasIngredientes).filter(_ref13 => {
    let _ref14 = _slicedToArray(_ref13, 2),
      v = _ref14[1];
    return v;
  }).map(_ref15 => {
    let _ref16 = _slicedToArray(_ref15, 1),
      k = _ref16[0];
    return k;
  }).sort().join('|');
  const salsaKeys = Object.entries(_extrasSalsas).filter(_ref17s => {
    let _ref18s = _slicedToArray(_ref17s, 2),
      v = _ref18s[1];
    return v;
  }).map(_ref19s => {
    let _ref20s = _slicedToArray(_ref19s, 1),
      k = _ref20s[0];
    return k;
  }).sort().join('|');
  const fingerprint = (_extrasQueso ? 'Q' : '') + (_extrasGratinado ? 'G' : '') + (ingKeys ? 'I' + ingKeys : '') + (salsaKeys ? 'S' + salsaKeys : '') || 'BASE';
  const cartKey = 'ext:' + itemId + ':' + fingerprint;
  if (!extrasCart[cartKey]) {
    extrasCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      queso: _extrasQueso,
      gratinado: _extrasGratinado,
      ingredientesExtra: Object.entries(_extrasIngredientes).filter(_ref17 => {
        let _ref18 = _slicedToArray(_ref17, 2),
          v = _ref18[1];
        return v;
      }).map(_ref19 => {
        let _ref20 = _slicedToArray(_ref19, 1),
          k = _ref20[0];
        return k;
      }),
      salsasExtra: Object.entries(_extrasSalsas).filter(_ref17b => {
        let _ref18b = _slicedToArray(_ref17b, 2),
          v = _ref18b[1];
        return v;
      }).map(_ref19b => {
        let _ref20b = _slicedToArray(_ref19b, 1),
          k = _ref20b[0];
        return k;
      }),
      key: cartKey,
      basePrice: item.price
    };
  }
  extrasCart[cartKey].qty++;
  closeExtrasModal();
  renderMenu();
  renderCart();
}
function removeExtrasItem(key) {
  if (extrasCart[key]) {
    extrasCart[key].qty--;
    if (extrasCart[key].qty <= 0) delete extrasCart[key];
  }
  renderMenu();
  renderCart();
}
function getExtrasItemPrice(c) {
  let p = c.basePrice + (c.queso ? 1.00 : 0) + (c.gratinado ? 0.50 : 0);
  (c.ingredientesExtra || []).forEach(ing => {
    if (EXTRAS_ING_PRECIO1.includes(ing)) p += 1.00;else if (EXTRAS_ING_PRECIO07.includes(ing)) p += 0.70;
  });
  (c.salsasExtra || []).forEach(() => { p += EXTRAS_SALSA_PRECIO; });
  return p;
}
function getExtrasItemLabel(c) {
  const item = MENU.find(m => m.id == c.menuId);
  if (!item) {
    console.error('getExtrasItemLabel: producto no encontrado menuId=' + c.menuId);
    return 'Producto desconocido';
  }
  if (c.cheddarCarne) return item.name + ' (' + c.cheddarCarne + ')';
  const extras = [];
  if (c.queso) extras.push('Queso');
  if (c.gratinado) extras.push('Gratinado');
  (c.ingredientesExtra || []).forEach(ing => extras.push(ing));
  (c.salsasExtra || []).forEach(salsa => extras.push(salsa));
  return item.name + (extras.length ? ' + ' + extras.join(' + ') : '');
}

// ══════════════════════════════════════════
//  PATATA CHEDDAR-BACON — SELECTOR DE CARNE
// ══════════════════════════════════════════
const CHEDDAR_ID = 50;
let _cheddarCarne = null; // 'picada' | 'kebab'

function openCheddarModal() {
  _cheddarCarne = null;
  // Reset UI
  ['picada', 'kebab'].forEach(opt => {
    const check = document.getElementById('cheddar-check-' + opt);
    const label = document.getElementById('cheddar-opt-' + opt);
    if (check) {
      check.style.background = '#fff';
      check.style.borderColor = '#F5E6C8';
      check.innerHTML = '';
    }
    if (label) {
      label.style.borderColor = '#F5E6C8';
      label.style.background = '#fff';
    }
  });
  document.getElementById('cheddar-error').style.display = 'none';
  document.getElementById('cheddar-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeCheddarModal() {
  document.getElementById('cheddar-modal').style.display = 'none';
  document.body.style.overflow = '';
  _cheddarCarne = null;
}
function selectCheddarCarne(opt) {
  _cheddarCarne = opt;
  document.getElementById('cheddar-error').style.display = 'none';
  ['picada', 'kebab'].forEach(o => {
    const check = document.getElementById('cheddar-check-' + o);
    const label = document.getElementById('cheddar-opt-' + o);
    const active = o === opt;
    if (check) {
      check.style.background = active ? '#3D1F0D' : '#fff';
      check.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
      check.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
    }
    if (label) {
      label.style.borderColor = active ? '#3D1F0D' : '#F5E6C8';
      label.style.background = active ? 'rgba(244,196,48,0.08)' : '#fff';
    }
  });
}
function confirmCheddar() {
  if (isShopBlocked()) {
    showClosedToast();
    closeCheddarModal();
    return;
  }
  if (!_cheddarCarne) {
    document.getElementById('cheddar-error').style.display = 'block';
    return;
  }
  const carneLabel = _cheddarCarne === 'picada' ? 'Carne Picada' : 'Carne Kebab';
  const key = 'cheddar:' + _cheddarCarne;
  if (!extrasCart[key]) {
    extrasCart[key] = {
      menuId: CHEDDAR_ID,
      qty: 0,
      queso: false,
      gratinado: false,
      key,
      basePrice: 8.50,
      cheddarCarne: carneLabel
    };
  }
  extrasCart[key].qty++;
  closeCheddarModal();
  renderMenu();
  renderCart();
}

// ══════════════════════════════════════════
//  BLOQUEAR CATEGORÍAS
// ══════════════════════════════════════════
const CAT_BLOCK_KEY = 'dpf_blocked_cats';
function getBlockedCats() {
  try {
    return JSON.parse(localStorage.getItem(CAT_BLOCK_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveBlockedCats(cats) {
  localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
  if (window.fb_saveBlockedCats) window.fb_saveBlockedCats(cats).catch(e => console.warn('Firebase blockedCats error', e));
}
function getCatsFromMenu() {
  return [...new Set(MENU.map(i => i.cat))];
}
function loadCatBlockUI() {
  const grid = document.getElementById('cat-block-grid');
  if (!grid) return;
  const blocked = getBlockedCats();
  const cats = getCatsFromMenu();
  grid.innerHTML = cats.map(cat => {
    const isBlocked = blocked.includes(cat);
    return "<button onclick=\"toggleCatBlock('".concat(cat, "')\"\n      style=\"padding:8px 14px;border-radius:99px;border:1.5px solid ").concat(isBlocked ? '#c0392b' : '#F5E6C8', ";\n      background:").concat(isBlocked ? '#fef0f0' : '#FFFFFF', ";color:").concat(isBlocked ? '#c0392b' : '#2A1506', ";\n      font-size:13px;font-weight:").concat(isBlocked ? '700' : '500', ";cursor:pointer;font-family:'DM Sans',sans-serif\">\n      ").concat(isBlocked ? '🚫' : '✅', " ").concat(cat, "\n    </button>");
  }).join('');
}
function toggleCatBlock(cat) {
  const blocked = getBlockedCats();
  const idx = blocked.indexOf(cat);
  if (idx >= 0) blocked.splice(idx, 1);else blocked.push(cat);
  saveBlockedCats(blocked);
  // Hide/show all items in that category
  MENU.forEach(item => {
    if (item.cat === cat) item.hidden = blocked.includes(cat);
  });
  loadCatBlockUI();
  renderMenu();
  logActivity((blocked.includes(cat) ? '🚫' : '✅') + ' Categoría ' + (blocked.includes(cat) ? 'bloqueada' : 'desbloqueada') + ': ' + cat);
}
function initCatBlocks() {
  // Apply saved blocked cats on load
  const blocked = getBlockedCats();
  MENU.forEach(item => {
    if (blocked.includes(item.cat)) item.hidden = true;
  });
}

// ══════════════════════════════════════════
//  MODO FIN DE NOCHE
// ══════════════════════════════════════════
async function activarFinDeNoche() {
  var _stats, _stats2;
  if (!confirm('¿Cerrar el día? Esto pausará los pedidos, mostrará el resumen y reseteará los turnos.')) return;

  // 1. Pausar pedidos — local + Firebase para que todos los dispositivos se enteren
  localStorage.setItem(OPEN_KEY, 'false');
  localStorage.setItem(ORDERS_KEY, 'false');
  if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
  // Esta pausa es por cierre del día, no por saturación — que la auto-pausa
  // no la "reabra sola" pensando que fue ella quien la puso.
  if (typeof _setAutoPausaEstado === 'function') _setAutoPausaEstado(false, Date.now() + 12 * 60 * 60 * 1000);
  updateOrdersUI(false);

  // 2. Recoger estadísticas del día
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  const pedidos = ((_stats = stats) === null || _stats === void 0 ? void 0 : _stats.count) || 0;
  const total = ((_stats2 = stats) === null || _stats2 === void 0 || (_stats2 = _stats2.total) === null || _stats2 === void 0 ? void 0 : _stats2.toFixed(2)) || '0.00';
  // Antes esto se quedaba siempre vacío — el HTML de abajo ya estaba
  // preparado para pintar el top 3 con medallas, pero nadie lo rellenaba.
  const topSorted = [];
  if (stats && Array.isArray(stats.orders)) {
    const conteoProductos = {};
    stats.orders.forEach(o => {
      (o.items || []).forEach(it => {
        if (it.isFee || !it.name) return;
        conteoProductos[it.name] = (conteoProductos[it.name] || 0) + (it.qty || 0);
      });
    });
    topSorted.push(...Object.entries(conteoProductos).sort((a, b) => b[1] - a[1]).slice(0, 3));
  }

  // 3. Resetear turnos
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(() => {});

  // 3b. Limpiar estados de cocina (nuevo/preparando) para que no persistan al día siguiente
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});

  // 4. Archivar stats en historial y borrar del día activo en Firebase
  if (stats && stats.count > 0) saveToHistorial(stats);
  if (window.fb_saveStats) {
    window.fb_saveStats({
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    }).catch(() => {});
  }
  localStorage.removeItem(STATS_KEY);

  // 4b. Marcar todos los pedidos activos como entregados
  try {
    const _liveOrders = getLiveOrders ? getLiveOrders() : [];
    for (const o of _liveOrders) {
      if (window.fb_setOrderStatus) await window.fb_setOrderStatus(o.num, 'entregado').catch(() => {});
    }
    window._liveOrdersCache = [];
    localStorage.removeItem('dpf_live_orders');
  } catch(e) {}

  // 4c. Limpiar log de actividad
  try {
    const _actKey = typeof ACTIVITY_KEY !== 'undefined' ? ACTIVITY_KEY : 'dpf_activityLog';
    localStorage.removeItem(_actKey);
    if (window.fb_saveActivityLog) await window.fb_saveActivityLog([]).catch(() => {});
  } catch(e) {}

  // 4d. Resetear contador de pedidos del día
  if (window.fb_resetDayCounter) window.fb_resetDayCounter().catch(() => {});

  // 5. Mostrar resumen
  const resumenEl = document.getElementById('fin-noche-resumen');
  if (resumenEl) {
    resumenEl.style.display = 'block';
    resumenEl.innerHTML = '<div style="font-size:15px;font-weight:900;margin-bottom:8px">📊 Resumen del día ' + todayKey + '</div>' + '<div>🧾 Pedidos: <strong>' + pedidos + '</strong></div>' + '<div>💶 Total recaudado: <strong>' + total + ' €</strong></div>' + (topSorted.length ? '<div style="margin-top:6px">🏆 Top productos:<br>' + topSorted.map((e, i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') + ' ' + e[0] + ' (' + e[1] + ')').join('<br>') + '</div>' : '') + '<div style="margin-top:8px;font-size:11px;opacity:.7">Turnos reseteados · Pedidos pausados · Datos archivados ✅</div>';
  }
  logActivity('🌙 Fin de noche activado — ' + pedidos + ' pedidos · ' + total + ' €');
  showToast('local-toast');
}
function checkLogSecret(val) {
  if (val.toLowerCase() === 'log') {
    document.getElementById('log-secret-input').value = '';
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const logSection = document.getElementById('admin-log');
    if (logSection) {
      logSection.classList.add('active');
      renderActivityLog();
    }
  }
}
// Single unified secret key buffer
window._secretKeyBuf = '';
// Acceso por teclado bimba desactivado — usar URL ?bimba=TOKEN
// INIT
initCatBlocks();
initTabs();
renderMenu();
renderPromos();
renderCart();

// ═══════════════════════════════════════
//  PANEL DE ADMINISTRACIÓN
// ═══════════════════════════════════════

const ADMIN_PWD_KEY = 'dpf_admin_pwd';
const MENU_KEY = 'dpf_menu';
const CONFIG_KEY = 'dpf_config';
const OPEN_KEY = 'dpf_open';
const HORARIO_KEY = 'dpf_horario';

// Hash SHA-256 de la contraseña por defecto: "dulcepatata2024"
// Para generar el hash de otra contraseña, ejecuta en la consola del navegador:
//   hashAdminPwd('TuNuevaContraseña').then(h => console.log(h))
// y pega el resultado en ADMIN_PWD_DEFAULT_HASH
const ADMIN_PWD_DEFAULT_HASH = '53e3e30b4ba11c28d4c0729bcacbd343a0bef168947da71f90a7c0b06322c277';
async function hashAdminPwd(pwd) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pwd));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function isHex64(s) {
  return typeof s === 'string' && s.length === 64 && /^[0-9a-f]+$/.test(s);
}
function getAdminPwd() {
  // Devuelve el hash guardado en localStorage, o el hash por defecto si no hay ninguno.
  // NUNCA devuelve null → elimina el flujo de "primera vez" que era el agujero de seguridad.
  return localStorage.getItem(ADMIN_PWD_KEY) || ADMIN_PWD_DEFAULT_HASH;
}

// Migración: si hay una contraseña en texto plano de la versión anterior, la hashea al vuelo.
async function migrateAdminPwdIfNeeded() {
  const stored = localStorage.getItem(ADMIN_PWD_KEY);
  if (stored && !isHex64(stored)) {
    const h = await hashAdminPwd(stored);
    localStorage.setItem(ADMIN_PWD_KEY, h);
    if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(h).catch(() => {});
  } else if (!stored && window.fb_loadAdminPwd) {
    // No hay nada en local → intentar cargar desde Firebase
    try {
      const fbHash = await window.fb_loadAdminPwd();
      if (fbHash && isHex64(fbHash)) localStorage.setItem(ADMIN_PWD_KEY, fbHash);
    } catch {}
  }
}

// Flush pending migration if DOMContentLoaded fired before this script ran
if (window._pendingMigrateAdmin) {
  window._pendingMigrateAdmin = false;
  migrateAdminPwdIfNeeded();
}


// ── Búsqueda en la carta ──────────────────────────────────
function filterMenuBySearch(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.item-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const desc = (card.dataset.desc || '').toLowerCase();
    card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
  // category sections not used, skip
  if(false) document.querySelectorAll('.menu-category-section').forEach(sec => {
    const visible = Array.from(sec.querySelectorAll('.menu-item-card')).some(c => c.style.display !== 'none');
    sec.style.display = visible ? '' : 'none';
  });
}



// ── CÓDIGOS DE DESCUENTO ──────────────────────────────────────────────────────
let _activeDiscount = null; // { code, pct }

async function dcCargar() {
  const el = document.getElementById('dc-list');
  if (!el) return;
  if (!window.fb_loadDiscounts) { el.innerHTML = 'Firebase no disponible'; return; }
  const discounts = await window.fb_loadDiscounts().catch(() => ({}));
  // Los códigos RAS-/RUL- los genera juegos.php para cada premio ganado en
  // la Ruleta o el Rasca (origen: 'ruleta'|'rasca') — de un solo uso y
  // caducan solos a las 48h. No son códigos que el admin haya creado a
  // mano, así que no se listan aquí para no ahogar la lista.
  const keys = Object.keys(discounts || {}).filter(code => !discounts[code].origen);
  if (!keys.length) { el.innerHTML = '<span style="color:#8A6A4E">Sin códigos creados</span>'; return; }
  el.innerHTML = keys.map(code => {
    const d = discounts[code];
    const remaining = d.maxUses - (d.uses || 0);
    return '<div id="dc-row-' + escapeAttr(code) + '" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap;gap:6px">'
      + '<div><strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;color:#8A6A4E">' + (d.uses||0) + '/' + d.maxUses + ' usos · ' + remaining + ' restantes</span></div>'
      + '<button data-code="' + escapeAttr(code) + '" onclick="dcEliminar(this.dataset.code)" style="padding:4px 10px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Eliminar</button>'
      + '</div>';
  }).join('');
}

// Los premios de la Ruleta/Rasca (RAS-/RUL-) no aparecen en la lista de
// arriba, pero siguen guardados en discounts/ con el teléfono con el que
// jugó el cliente — esto permite encontrarlos si el cliente pierde su
// código y llama pidiéndolo.
async function dcBuscarPorTelefono() {
  const el = document.getElementById('dc-buscar-resultado');
  if (!el) return;
  const tel = (document.getElementById('dc-buscar-tel').value || '').replace(/\D/g, '');
  if (!/^\d{9}$/.test(tel)) { el.innerHTML = '<span style="color:#c0392b">Introduce un teléfono válido (9 dígitos)</span>'; return; }
  if (!window.fb_loadDiscounts) { el.innerHTML = 'Firebase no disponible'; return; }
  el.innerHTML = 'Buscando…';
  const discounts = await window.fb_loadDiscounts().catch(() => ({}));
  const ahoraMs = Date.now();
  const codigos = Object.keys(discounts || {}).filter(code => discounts[code].telefono === tel);
  if (!codigos.length) { el.innerHTML = '<span style="color:#8A6A4E">No se encontró ningún código de premio para ese teléfono</span>'; return; }
  el.innerHTML = codigos.map(code => {
    const d = discounts[code];
    const usado = (d.uses || 0) >= d.maxUses;
    const caducado = d.expiraEn && ahoraMs > d.expiraEn;
    let estado = 'disponible', color = '#2e7d32';
    if (usado) { estado = 'ya usado'; color = '#c0392b'; }
    else if (caducado) { estado = 'caducado'; color = '#c0392b'; }
    return '<div style="padding:6px 0;border-bottom:1px solid #F5E6C8">'
      + '<strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;font-weight:700;color:' + color + '">' + estado + '</span>'
      + (d.origen ? ' <span style="font-size:11px;color:#8A6A4E">(' + escapeHtml(d.origen) + ')</span>' : '')
      + '</div>';
  }).join('');
}

async function dcCrear() {
  const code = (document.getElementById('dc-code').value || '').trim().toUpperCase();
  const pct = parseInt(document.getElementById('dc-pct').value);
  const maxUses = parseInt(document.getElementById('dc-uses').value);
  if (!code) { alert('Introduce un código'); return; }
  if (!pct || pct < 1 || pct > 100) { alert('Introduce un % válido (1-100)'); return; }
  if (!maxUses || maxUses < 1) { alert('Introduce un número de usos'); return; }
  if (!window.fb_saveDiscount) { alert('Firebase no disponible'); return; }
  await window.fb_saveDiscount(code, { pct, maxUses, uses: 0, createdAt: Date.now() });
  document.getElementById('dc-code').value = '';
  document.getElementById('dc-pct').value = '';
  document.getElementById('dc-uses').value = '';
  logActivity('🎁 Código de descuento creado: ' + code + ' (' + pct + '%, ' + maxUses + ' usos)');
  dcCargar();
}

async function dcEliminar(code) {
  if (!confirm('¿Eliminar el código ' + code + '?')) return;
  if (window.fb_deleteDiscount) await window.fb_deleteDiscount(code);
  logActivity('🗑️ Código de descuento eliminado: ' + code);
  dcCargar();
}

async function dcAplicar(code) {
  if (!code) { _activeDiscount = null; renderCart(); return; }
  code = code.trim().toUpperCase();
  if (!window.fb_getDiscount) { showDiscountError('Firebase no disponible'); return; }
  const d = await window.fb_getDiscount(code).catch(() => null);
  if (!d) { showDiscountError('Código no válido'); return; }
  // Los premios de la ruleta/rasca caducan a las 48h (expiraEn) — los
  // códigos creados a mano desde el panel no llevan ese campo, así que
  // esta comprobación no les afecta.
  if (d.expiraEn && Date.now() > d.expiraEn) { showDiscountError('Este código ha caducado'); return; }
  if ((d.uses || 0) >= d.maxUses) { showDiscountError('Este código ya no tiene usos disponibles'); return; }
  _activeDiscount = { code, pct: d.pct };
  showDiscountOk(code, d.pct);
  renderCart();
}

function showDiscountError(msg) {
  const el = document.getElementById('discount-feedback');
  if (el) { el.style.color = '#c0392b'; el.textContent = '❌ ' + msg; }
  _activeDiscount = null;
  renderCart();
}

function showDiscountOk(code, pct) {
  const el = document.getElementById('discount-feedback');
  if (el) { el.style.color = '#27855a'; el.textContent = '✅ Código ' + code + ' aplicado — ' + pct + '% de descuento'; }
}

function getDiscountAmount(subtotal) {
  if (!_activeDiscount) return 0;
  return Math.round(subtotal * _activeDiscount.pct) / 100;
}


// ── FINANZAS: VENTANAS INDEPENDIENTES (mismo patrón que el resto del panel bimba) ──
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
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F5E6C8' + (bajo ? ';background:rgba(192,57,43,0.05)' : '') + '">'
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:700;color:#3D1F0D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + formatNombreConBadgeNuevo(item.name) + '</div>'
        + '<div style="font-size:11px;color:#8A6A4E">venta ' + item.price.toFixed(2) + ' €</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0">'
        + '<input type="number" step="0.01" min="0" placeholder="0.00" value="' + (conMargen ? item.coste : '') + '" data-id="' + item.id + '" onchange="bimbaActualizarCoste(this)" style="width:60px;padding:5px 6px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif">'
        + '<span style="font-size:11px;color:#8A6A4E">€</span>'
      + '</div>'
      + '<div style="text-align:right;min-width:60px;flex-shrink:0">'
        + (conMargen
            ? '<div style="font-size:13px;font-weight:800;color:' + colorMargen + '">' + (item._margenEur >= 0 ? '+' : '') + item._margenEur.toFixed(2) + ' €</div><div style="font-size:11px;color:' + colorMargen + '">' + item._margenPct.toFixed(0) + '%</div>'
            : '<div style="font-size:11px;color:#8A6A4E">añade coste ↑</div>')
      + '</div>'
    + '</div>';
  }
  function catHeaderHtml(cat) {
    const emoji = emojiCat[cat] || '';
    return '<div style="font-family:\'Oswald\',sans-serif;font-size:12px;font-weight:700;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;padding:7px 12px;border-radius:8px;margin:14px 0 6px">' + (emoji ? emoji + ' ' : '') + escapeHtml(cat) + '</div>';
  }

  let html = '';
  catOrder.forEach(cat => {
    const lista = porCat[cat];
    if (!lista || !lista.length) return;
    lista.sort(comparar);
    html += catHeaderHtml(cat);
    html += lista.map(filaHtml).join('');
  });
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
            + '<div style="display:flex;align-items:center;gap:8px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Horas de contrato / semana</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="0.5" min="0" placeholder="0" value="' + (cfg.horasSemana != null ? cfg.horasSemana : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'horasSemana\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">h/sem</span></div></div>'
          : '<div style="display:flex;align-items:center;gap:8px"><label style="font-size:11.5px;color:#8A6A4E;flex:1">Sueldo mensual</label><div style="display:flex;align-items:center;gap:4px"><input type="number" step="10" min="0" placeholder="0" value="' + (cfg.sueldoMensual != null ? cfg.sueldoMensual : '') + '" onchange="bimbaActualizarPago(\'' + idAttr + '\',\'sueldoMensual\',this.value)" style="width:64px;padding:5px 7px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:12px;text-align:right;font-family:\'DM Sans\',sans-serif"><span style="font-size:11px;color:#8A6A4E">€</span></div></div>'
        )
      + '</div>';
  }).join('');
}
function bimbaSetTipoPago(empId, tipo) {
  if (!_equipoPagoConfig[empId]) _equipoPagoConfig[empId] = {};
  _equipoPagoConfig[empId].tipoPago = tipo;
  _bimbaGuardarPagoConfig(function (cfg) {
    if (!cfg[empId]) cfg[empId] = {};
    cfg[empId].tipoPago = tipo;
  });
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarConfigEquipo(empleados);
  _bimbaPintarCalcEquipo(empleados);
}
function bimbaActualizarPago(empId, campo, valor) {
  if (!_equipoPagoConfig[empId]) _equipoPagoConfig[empId] = { tipoPago: 'hora' };
  const val = parseFloat(valor);
  const valorGuardado = isNaN(val) ? null : val;
  _equipoPagoConfig[empId][campo] = valorGuardado;
  _bimbaGuardarPagoConfig(function (cfg) {
    if (!cfg[empId]) cfg[empId] = { tipoPago: 'hora' };
    cfg[empId][campo] = valorGuardado;
  });
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarCalcEquipo(empleados);
}
// mutatorFn modifica in-place la config de pago de UN empleado. Se aplica
// contra el valor más reciente de Firebase (transacción), no contra la
// copia en memoria de _equipoPagoConfig, que solo se cargó una vez al abrir
// el overlay — así dos personas editando el pago de dos empleados distintos
// a la vez no se pisan la una a la otra.
function _bimbaGuardarPagoConfig(mutatorFn) {
  if (window.fb_transactNative) {
    window.fb_transactNative('config/empleadosPago', function (current) {
      const cfg = current || {};
      mutatorFn(cfg);
      return cfg;
    }).catch(() => {});
    return;
  }
  firebase.database().ref('config/empleadosPago').set(_equipoPagoConfig).catch(() => {});
}
function _bimbaCosteEmpleado(emp) {
  const cfg = _equipoPagoConfig[emp.id] || { tipoPago: 'hora' };
  const { inicio, fin } = _equipoRangoPeriodo();
  const dias = Math.round((new Date(fin) - new Date(inicio)) / 86400000) + 1;
  if (cfg.tipoPago === 'sueldo') {
    const factor = dias / 30;
    const sueldo = cfg.sueldoMensual || 0;
    return { total: sueldo * factor, horas: null };
  }
  const horasContratoSemana = cfg.horasSemana || 0;
  const horasAuto = horasContratoSemana * (dias / 7);
  const manual = _equipoHorasManual[emp.id];
  const horas = (manual != null) ? manual : horasAuto;
  const tarifa = cfg.tarifaHora || 0;
  return { total: horas * tarifa, horas: horas, tarifa: tarifa };
}
function _bimbaPintarCalcEquipo(empleados) {
  const el = document.getElementById('calc-empleados');
  if (!el) return;
  let total = 0;
  if (!empleados.length) {
    el.innerHTML = '';
  } else {
    el.innerHTML = empleados.map(emp => {
      const c = _bimbaCosteEmpleado(emp);
      total += c.total;
      const idAttr = escapeAttr(String(emp.id));
      const esSueldo = c.horas === null;
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
        + '<div style="font-size:13px;font-weight:800;color:#3D1F0D">' + c.total.toFixed(2) + ' €</div>'
        + '</div>'
        + segundaLinea
        + '</div>';
    }).join('');
  }
  _equipoUltimoTotalPersonal = total;
  const costeTotalEl = document.getElementById('equipo-coste-total');
  if (costeTotalEl) costeTotalEl.textContent = total.toFixed(2) + ' €';
  _bimbaPintarResultadoEquipo(total);
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
function bimbaEquipoPeriodoChange() {
  const modo = document.getElementById('equipo-periodo').value;
  const customDiv = document.getElementById('equipo-fechas-custom');
  if (customDiv) customDiv.style.display = (modo === 'personalizado') ? 'flex' : 'none';
  _equipoHorasManual = {};
  const empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  _bimbaPintarRangoTexto();
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
async function _estrellasObtenerUpsellPostre(inicio, fin) {
  let mostrado = 0, anadido = 0;
  try {
    const snap = await firebase.database().ref('upsellPostre').orderByKey().startAt(inicio).endAt(fin).once('value');
    if (snap.exists()) {
      snap.forEach(diaSnap => {
        const dia = diaSnap.val() || {};
        mostrado += Number(dia.mostrado) || 0;
        anadido += Number(dia.anadido) || 0;
      });
    }
  } catch (e) {
    console.warn('[estrellas] error leyendo upsellPostre', e);
  }
  return { mostrado, anadido };
}
function _renderUpsellPostreStats(mostrado, anadido) {
  const el = document.getElementById('upsell-postre-contenido');
  if (!el) return;
  if (mostrado === 0) {
    el.innerHTML = '<div style="font-size:12px;color:#8A6A4E">Todavía no se ha mostrado la sugerencia "¿algo dulce de postre?" en este periodo.</div>';
    return;
  }
  const tasa = mostrado > 0 ? (anadido / mostrado) * 100 : 0;
  el.innerHTML = '<div style="display:flex;gap:8px">'
    + '<div style="flex:1;background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 12px;text-align:center">'
    + '<div style="font-size:20px;font-weight:800;color:#3D1F0D">' + mostrado + '</div>'
    + '<div style="font-size:11px;color:#8A6A4E">veces mostrada</div>'
    + '</div>'
    + '<div style="flex:1;background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 12px;text-align:center">'
    + '<div style="font-size:20px;font-weight:800;color:#166534">' + anadido + '</div>'
    + '<div style="font-size:11px;color:#8A6A4E">veces añadida</div>'
    + '</div>'
    + '<div style="flex:1;background:#fff;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 12px;text-align:center">'
    + '<div style="font-size:20px;font-weight:800;color:#B5862C">' + tasa.toFixed(0) + '%</div>'
    + '<div style="font-size:11px;color:#8A6A4E">tasa de éxito</div>'
    + '</div>'
    + '</div>';
}
async function bimbaRenderEstrellas() {
  const el = document.getElementById('estrellas-contenido');
  const rangoEl = document.getElementById('estrellas-rango-texto');
  if (!el) return;
  el.innerHTML = '<div style="color:#8A6A4E;font-size:13px">Cargando...</div>';
  const { inicio, fin } = _estrellasRangoPeriodo();
  if (rangoEl) rangoEl.textContent = 'Periodo: ' + _fechaCorta(inicio) + ' — ' + _fechaCorta(fin);

  _estrellasObtenerUpsellPostre(inicio, fin).then(({ mostrado, anadido }) => _renderUpsellPostreStats(mostrado, anadido));

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
    // Transacción: ventasProductos/<fecha> también lo escribe cada pedido
    // real de un cliente (recordProductSales, en antifraude.js) mientras se
    // puede estar guardando una venta manual aquí — con un .set() plano
    // (leer, sumar en memoria, sobreescribir todo el nodo) una venta real
    // que llegara justo en medio se podía perder sin ningún aviso.
    const mutator = function (current) {
      const actual = current || {};
      inputs.forEach(i => {
        const id = i.dataset.id;
        const cantidad = parseInt(i.value, 10);
        actual[id] = (actual[id] || 0) + cantidad;
      });
      return actual;
    };
    if (window.fb_transactNative) {
      await window.fb_transactNative('ventasProductos/' + fecha, mutator);
    } else {
      const ref = firebase.database().ref('ventasProductos/' + fecha);
      const sn = await ref.once('value');
      await ref.set(mutator(sn.exists() ? sn.val() : null));
    }
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
function openIngredientesStockOverlay() {
  document.getElementById('ingredientes-stock-overlay').classList.add('open');
  if (typeof loadStockAdminList === 'function') loadStockAdminList();
  if (typeof renderStockHistorial === 'function') renderStockHistorial();
}
function closeIngredientesStockOverlay() {
  document.getElementById('ingredientes-stock-overlay').classList.remove('open');
}

function bimbaPintarTicketConfig() {
  const tc = getTicketConfig();
  const nombreEl = document.getElementById('tc-nombre');
  if (!nombreEl) return;
  nombreEl.value = tc.nombre;
  document.getElementById('tc-direccion').value = tc.direccion;
  document.getElementById('tc-telefono').value = tc.telefono;
  document.getElementById('tc-despedida').value = tc.despedida;
  document.getElementById('tc-texto-pago').value = tc.textoPago;
  document.getElementById('tc-ancho-papel').value = String(tc.anchoPapel || 80);
  document.getElementById('tc-copias').value = tc.copias || 1;
  const autoEl = document.getElementById('tc-auto-imprimir');
  autoEl.checked = tc.autoImprimir !== false;
  document.getElementById('tc-auto-row').style.background = autoEl.checked ? '#fff' : 'rgba(192,57,43,0.06)';
  const letraEl = document.getElementById('tc-letra-grande');
  if (letraEl) letraEl.checked = !!tc.letraGrande;
  const qrEl = document.getElementById('tc-qr-habilitado');
  if (qrEl) qrEl.checked = !!tc.qrHabilitado;
  const qrContenidoEl = document.getElementById('tc-qr-contenido');
  if (qrContenidoEl) qrContenidoEl.value = tc.qrContenido || '';

  // Gastos fijos (se guardan aparte, no dentro de TICKET_CONFIG_KEY)
  const tcFeeEnabled = document.getElementById('tc-fee-enabled');
  if (tcFeeEnabled) {
    tcFeeEnabled.checked = getFeeEnabled();
    document.getElementById('tc-fee-amount').value = getFeeAmount();
    document.getElementById('tc-fee-label').value = getFeeLabel();
  }
  const tcFee2Enabled = document.getElementById('tc-fee2-enabled');
  if (tcFee2Enabled && typeof getFee2Enabled === 'function') {
    tcFee2Enabled.checked = getFee2Enabled();
    document.getElementById('tc-fee2-amount').value = getFee2Amount();
    document.getElementById('tc-fee2-label').value = getFee2Label();
  }
  const tcLocalCode = document.getElementById('tc-local-fee-code');
  if (tcLocalCode && typeof getLocalFeeCode === 'function') tcLocalCode.value = getLocalFeeCode();
}
function openTicketConfigOverlay() {
  document.getElementById('ticket-config-overlay').classList.add('open');
  bimbaPintarTicketConfig();
  if (typeof _renderTicketSendLog === 'function') _renderTicketSendLog();
}
function closeTicketConfigOverlay() {
  document.getElementById('ticket-config-overlay').classList.remove('open');
}
function bimbaGuardarTicketConfig() {
  const msgEl = document.getElementById('tc-msg');
  const cfg = {
    nombre: document.getElementById('tc-nombre').value.trim() || TICKET_CONFIG_DEFAULTS.nombre,
    direccion: document.getElementById('tc-direccion').value.trim() || TICKET_CONFIG_DEFAULTS.direccion,
    telefono: document.getElementById('tc-telefono').value.trim() || TICKET_CONFIG_DEFAULTS.telefono,
    despedida: document.getElementById('tc-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    textoPago: document.getElementById('tc-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    anchoPapel: parseInt(document.getElementById('tc-ancho-papel').value, 10) || 80,
    copias: Math.max(1, parseInt(document.getElementById('tc-copias').value, 10) || 1),
    autoImprimir: document.getElementById('tc-auto-imprimir').checked,
    letraGrande: document.getElementById('tc-letra-grande') ? document.getElementById('tc-letra-grande').checked : false,
    qrHabilitado: document.getElementById('tc-qr-habilitado') ? document.getElementById('tc-qr-habilitado').checked : false,
    qrContenido: document.getElementById('tc-qr-contenido') ? document.getElementById('tc-qr-contenido').value.trim() : ''
  };
  saveTicketConfig(cfg);

  // Gastos fijos — cada uno con su propio guardado/interruptor
  const tcFeeEnabled = document.getElementById('tc-fee-enabled');
  if (tcFeeEnabled) {
    const amt = parseFloat(document.getElementById('tc-fee-amount').value) || 0;
    const lbl = document.getElementById('tc-fee-label').value.trim() || 'Gastos de gestión online';
    saveFeeConfig(tcFeeEnabled.checked, amt, lbl);
  }
  const tcFee2Enabled = document.getElementById('tc-fee2-enabled');
  if (tcFee2Enabled && typeof saveFee2Config === 'function') {
    const amt2 = parseFloat(document.getElementById('tc-fee2-amount').value) || 0;
    const lbl2 = document.getElementById('tc-fee2-label').value.trim() || 'Otro gasto fijo';
    saveFee2Config(tcFee2Enabled.checked, amt2, lbl2);
  }
  const tcLocalCode = document.getElementById('tc-local-fee-code');
  if (tcLocalCode && typeof saveLocalFeeCode === 'function') saveLocalFeeCode(tcLocalCode.value);

  if (msgEl) {
    msgEl.style.color = '#27855a';
    msgEl.textContent = '✅ Guardado';
    setTimeout(() => { msgEl.textContent = ''; }, 2500);
  }
}

function toggleIngredientesPanel(btn) {
  const panel = document.getElementById('ingredientes-panel');
  if (!panel) return;
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '✏️ Editar' : '✕ Cerrar';
  btn.style.background = open ? '#3D1F0D' : '#F5E6C8';
  btn.style.color = open ? '#FFF8EE' : '#3D1F0D';
}


// ── IMPRIMIR TODOS + MARCA DE IMPRESO ────────────────────────────────────────
const _printedOrders = new Set(); // IDs de pedidos ya impresos en esta sesión

async function imprimirTodosLosActivos() {
  const activos = (window._activosCache || []);
  if (!activos.length) { alert('No hay pedidos activos para imprimir'); return; }
  const sinImprimir = activos.filter(o => !_printedOrders.has(o.num));
  if (!sinImprimir.length) {
    if (!confirm('Todos los pedidos ya están marcados como impresos. ¿Imprimir de nuevo?')) return;
    activos.forEach(o => _printedOrders.delete(o.num));
    sinImprimir.push(...activos);
  }
  for (const o of sinImprimir) {
    await printOrderFromStats(o.num, o.name, o.time, o.total, o.slot || '');
    _markAsImpreso(o.num);
    // Auto-marcar como recibido si estaba en "nuevo"
    if (getOrderStatus(o.num) === 'nuevo') {
      await setOrderStatus(o.num, 'recibido');
    }
    await new Promise(r => setTimeout(r, 800));
  }
  // Refrescar la vista solo si el panel admin está abierto
  const _ao1 = document.getElementById('admin-overlay');
  if (_ao1 && _ao1.classList.contains('open')) {
    loadLiveOrders && loadLiveOrders();
  }
}

function _markAsImpreso(orderNum) {
  _printedOrders.add(orderNum);
  // Parar sonido al imprimir — equivale a haber visto el pedido. Idempotente:
  // reimprimir el mismo pedido no vuelve a restar del contador.
  _marcarPedidoAtendido(orderNum);
  const btn = document.querySelector('[data-print-num="' + CSS.escape(orderNum) + '"]');
  if (btn) {
    btn.textContent = '🖨️ Impreso';
    btn.style.background = '#e8f8ed';
    btn.style.color = '#27855a';
    btn.style.border = '1.5px solid #a9dfbf';
    btn.disabled = false; // sigue siendo pulsable por si quieren reimprimir
    btn.onclick = function() {
      _printedOrders.delete(orderNum);
      printOrderFromStats(orderNum, btn.dataset.name, btn.dataset.time, parseFloat(btn.dataset.total), btn.dataset.slot||'');
      _markAsImpreso(orderNum);
    };
  }
}


// ── GUARDAR DÍAS DE EXPIRACIÓN ────────────────────────────────────────────────
function saveTrustedExpiry() {
  const days = parseInt(document.getElementById('trusted-expiry-days')?.value || '30');
  if (isNaN(days) || days < 1) { alert('Introduce un número válido de días'); return; }
  localStorage.setItem(TRUSTED_DAYS_KEY, String(days));
  logActivity('🔐 Expiración de sesión configurada: ' + days + ' días');
  alert('✅ Guardado. Se aplicará en el próximo inicio de sesión.');
}


// ── ACCESO A EMPLEADOS DESDE RUEDA ───────────────────────────────────────────
function openEmpleadosWithBimba() {
  // Usar el mismo modal bimba pero redirigir a empleados al confirmar
  window._bimbaTargetEmpleados = true;
  secureLockTap();
}

// ── DISPOSITIVO DE CONFIANZA ──
// SEGURIDAD: el flag local es solo una preferencia de UX (saltar la pantalla de login).

// ── Compartir pedido por WhatsApp ────────────────────────
function shareOrderWhatsApp(orderNum, name, slotTime, items, total) {
  let msg = '*Dulce Patata Food* — Pedido ' + orderNum + '\n';
  msg += 'Nombre: ' + name + '\n';
  if (slotTime) msg += 'Recogida a las: ' + slotTime + 'h\n';
  msg += '\n*Productos:*\n';
  if (items && items.length) {
    items.forEach(function(it) { msg += '  ' + it.qty + 'x ' + it.name + ' — ' + it.price.toFixed(2).replace('.', ',') + ' €\n'; });
  }
  msg += '\n*Total: ' + total.toFixed(2).replace('.', ',') + ' €*';
  msg += '\n\nVen a recogerlo y paga en caja';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// ── DISPOSITIVO DE CONFIANZA ─────────────────────────────────────────────────
// El token de confianza es un secreto ALEATORIO generado en el momento de
// marcar el dispositivo (no una fórmula a partir de datos que ya son
// públicos o casi — antes era sha256(uid + hash de la contraseña), y el uid
// y el hash por defecto están en el JS que se manda al navegador, así que
// cualquiera que supiera el uid del admin podía calcular un token válido
// sin haber iniciado sesión nunca). Solo se guarda su HASH en Firebase
// (config/trustedDevices/<deviceId>), y la comprobación la hace el
// servidor (bimba-verify.php) — así "Expulsar" desde el panel puede borrar
// ese registro y el dispositivo pierde el acceso de verdad, no solo hasta
// que recargue la página.
const TRUSTED_KEY = 'dpf_trusted_device';
const TRUSTED_NAME_KEY = 'dpf_trusted_device_name';
const TRUSTED_TOKEN_KEY = 'dpf_trusted_token'; // secreto aleatorio, no derivado de nada público
const TRUSTED_EXPIRY_KEY = 'dpf_trusted_expiry'; // timestamp de expiración
const TRUSTED_DAYS_KEY = 'dpf_trusted_days'; // días configurados
const DEVICE_ID_KEY = 'dpf_device_id'; // identificador estable de este dispositivo (no es secreto)

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2));
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
async function _sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getTrustedExpiryDays() {
  return parseInt(localStorage.getItem(TRUSTED_DAYS_KEY) || '30');
}

async function isTrustedDevice() {
  if (localStorage.getItem(TRUSTED_KEY) !== 'yes') return false;
  // Comprobar expiración local primero (evita una llamada de red inútil)
  const expiry = parseInt(localStorage.getItem(TRUSTED_EXPIRY_KEY) || '0');
  if (expiry && Date.now() > expiry) {
    await setTrustedDevice(false);
    console.log('[trusted] sesión expirada');
    return false;
  }
  const token = localStorage.getItem(TRUSTED_TOKEN_KEY);
  if (!token) return false;
  // Comprobación real en el servidor: si el admin ha "expulsado" este
  // dispositivo desde el panel, su registro ya no existe en Firebase y
  // esto falla aunque el token siga guardado en este navegador.
  try {
    const res = await fetch('bimba-verify.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkTrustedDevice', deviceId: getDeviceId(), token })
    });
    const data = await res.json();
    if (!data.success) { await setTrustedDevice(false); return false; }
    return true;
  } catch (e) {
    return false; // red caída: por seguridad, pedir login en vez de asumir confianza
  }
}

function getTrustedDeviceName() {
  return localStorage.getItem(TRUSTED_NAME_KEY) || 'Sin nombre';
}

async function setTrustedDevice(val, name) {
  if (val) {
    const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
    if (!user || !user.uid) return; // no guardar si no hay sesión real
    const token = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '_' + Math.random().toString(36).slice(2));
    const tokenHash = await _sha256Hex(token);
    const deviceId = getDeviceId();
    const days = getTrustedExpiryDays();
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    // Escritura autenticada (ya hay sesión real de admin en este momento) —
    // el servidor solo guarda el HASH, nunca el token en sí.
    await firebase.database().ref('config/trustedDevices/' + deviceId).set({
      tokenHash: tokenHash,
      name: name || 'Sin nombre',
      createdAt: Date.now(),
    });
    localStorage.setItem(TRUSTED_KEY, 'yes');
    localStorage.setItem(TRUSTED_NAME_KEY, name || 'Sin nombre');
    localStorage.setItem(TRUSTED_TOKEN_KEY, token);
    localStorage.setItem(TRUSTED_EXPIRY_KEY, String(expiry));
  } else {
    // Si hay sesión real, limpiar también el registro en Firebase — igual
    // que arriba, si no hay sesión (p.ej. venimos de una comprobación
    // fallida sin login) esta escritura fallará en silencio y no pasa nada,
    // el registro se queda pero el token local ya no sirve para nada.
    try {
      const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
      if (user && user.uid) await firebase.database().ref('config/trustedDevices/' + getDeviceId()).remove();
    } catch (e) {}
    localStorage.removeItem(TRUSTED_KEY);
    localStorage.removeItem(TRUSTED_NAME_KEY);
    localStorage.removeItem(TRUSTED_TOKEN_KEY);
    localStorage.removeItem(TRUSTED_EXPIRY_KEY);
  }
}

// Audio context — needs user gesture to unlock
let _audioCtxUnlocked = false;
const AUDIO_PREF_KEY = 'dpf_audio_enabled';

// ── ACTIVAR AUDIO DESDE PANEL ────────────────────────────────────────────────
function activarAudioDesdePanel() {
  unlockAudioContext();
  localStorage.setItem(AUDIO_PREF_KEY, '1');
  setTimeout(function() {
    testNotificationSound();
    _updateAudioBannerState();
  }, 100);
}

function _updateAudioBannerState() {
  const banner = document.getElementById('audio-unlock-banner');
  const text = document.getElementById('audio-banner-text');
  const btn = document.getElementById('audio-banner-btn');
  if (!banner) return;
  if (_audioCtxUnlocked) {
    banner.style.background = '#FBEFD6';
    banner.style.borderColor = '#F4C430';
    if (text) { text.textContent = '🔊 Audio activado — recibirás alertas de nuevos pedidos'; text.style.color = '#3D1F0D'; }
    if (btn) {
      btn.textContent = '🔇 Desactivar';
      btn.style.background = '#3D1F0D';
      btn.style.color = '#F4C430';
      btn.onclick = function() {
        localStorage.removeItem(AUDIO_PREF_KEY);
        _audioCtxUnlocked = false;
        _updateAudioBannerState();
      };
    }
  } else {
    banner.style.background = '#fff3cd';
    banner.style.borderColor = '#3D1F0D';
    if (text) { text.textContent = '🔇 Audio desactivado — toca para activar las alertas sonoras'; text.style.color = '#5a3e1b'; }
    if (btn) {
      btn.textContent = '🔊 Activar audio';
      btn.style.background = '#3D1F0D';
      btn.onclick = activarAudioDesdePanel;
    }
  }
}

function unlockAudioContext() {
  if (_audioCtxUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume().then(() => {
      _audioCtxUnlocked = true;
      localStorage.setItem(AUDIO_PREF_KEY, '1');
    });
  } catch (e) {}
}
async function openAdmin() {
  // Cargar el HTML del admin de forma diferida si aún no está cargado
  if (typeof loadAdminShell === 'function' && !window._adminShellLoaded) {
    await new Promise(function(resolve) { loadAdminShell(resolve); });
  }
  // Asegurar que pointer-events está restaurado (por si stock lo dejó bloqueado)
  const adminOverlay = document.getElementById('admin-overlay');
  if (adminOverlay) adminOverlay.style.pointerEvents = '';
  window._secretKeyBuf = '';
  // Always reset to default section (Carta) so bimba config never bleeds through
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const defaultSection = document.getElementById('admin-productos');
  const defaultTab = document.querySelector('.admin-tab[onclick*="productos"]');
  if (defaultSection) defaultSection.classList.add('active');
  if (defaultTab) defaultTab.classList.add('active');
  unlockAudioContext(); // desbloquear audio con el gesto del usuario
  document.getElementById('admin-overlay').classList.add('open');
  document.getElementById('admin-error').textContent = '';
  document.getElementById('admin-pwd-input').value = '';
  // Si el dispositivo es de confianza, saltar el login directamente
  if (await isTrustedDevice()) {
    _adminLoggedIn = true; window._adminLoggedIn = true;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso automático — dispositivo de confianza');
  } else {
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
  }
  // Mostrar banner de audio solo si no está desbloqueado
  if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
  const audioBanner = document.getElementById('audio-unlock-banner');
  if (audioBanner) _updateAudioBannerState();
  // Registrar sesión activa en Firebase
  try {
    if (window.fb_registerSession) {
      const ua = navigator.userAgent;
      let device = 'Dispositivo desconocido';
      if (/iPhone/.test(ua)) device = 'iPhone · ' + (/Safari/.test(ua) ? 'Safari' : 'App');
      else if (/iPad/.test(ua)) device = 'iPad · ' + (/Safari/.test(ua) ? 'Safari' : 'App');
      else if (/Android/.test(ua)) device = 'Android · ' + (/Chrome/.test(ua) ? 'Chrome' : 'Navegador');
      else if (/Mac/.test(ua)) device = 'Mac · ' + (/Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : 'Safari');
      else if (/Windows/.test(ua)) device = 'Windows · ' + (/Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : 'Edge');
      window._mySessionId = _SESSION_ID;
      await window.fb_registerSession({
        sid: _SESSION_ID,
        deviceId: getDeviceId(),
        device: device,
        time: new Date().toLocaleString('es-ES'),
        ts: Date.now(),
        killed: false
      });
      // Si otro dispositivo nos expulsa desde "Sesiones activas", cerrar
      // el panel aquí mismo en tiempo real, no solo cosméticamente en la lista.
      if (window._myKillListenerUnsub) window._myKillListenerUnsub();
      window._myKillListenerUnsub = firebase.database().ref('activeSessions/' + _SESSION_ID + '/killed').on('value', function (snap) {
        if (snap.exists() && snap.val() === true) {
          showAlert('Esta sesión ha sido cerrada desde otro dispositivo.');
          setTimeout(async function () {
            await setTrustedDevice(false);
            closeAdmin();
            location.reload();
          }, 600);
        }
      });
    }
  } catch(e) {}
}

// ── ACCESO AL PANEL — TRIPLE TOQUE/CLICK EN LOGO ──
(function () {
  function initLogoTap() {
    var tapCount = 0,
      tapTimer = null,
      lastTap = 0;
    var logo = document.getElementById('logo-secret');
    if (!logo) return;
    function registerTap() {
      var now = Date.now();
      if (now - lastTap < 80) return;
      lastTap = now;
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () {
        tapCount = 0;
      }, 1400);
      if (tapCount >= 3) {
        tapCount = 0;
        clearTimeout(tapTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso por triple toque en logo');
        openAdmin();
      }
    }
    logo.addEventListener('touchstart', function (e) {
      e.preventDefault();
      registerTap();
    }, {
      passive: false
    });
    logo.addEventListener('click', function (e) {
      registerTap();
    });
    logo.addEventListener('touchend', function (e) {
      e.preventDefault();
    }, {
      passive: false
    });
    logo.addEventListener('click', function (e) {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      registerTap();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoTap);
  } else {
    initLogoTap();
  }
})();

// ── ACCESO AL PANEL — 5 TOQUES EN "PANEL DE ADMINISTRACIÓN" ──
(function () {
  let bimbaCount = 0,
    bimbaTimer = null;
  function attachBimbaTitle() {
    const el = document.getElementById('admin-title-secret');
    if (!el) return;
    function handleTap(e) {
      e.preventDefault();
      bimbaCount++;
      clearTimeout(bimbaTimer);
      bimbaTimer = setTimeout(() => {
        bimbaCount = 0;
      }, 1500);
      if (bimbaCount >= 5) {
        bimbaCount = 0;
        clearTimeout(bimbaTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso bimba por título');
        secureLockTap();
      }
    }
    el.addEventListener('touchend', handleTap, {
      passive: false
    });
    el.addEventListener('click', function (e) {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      handleTap(e);
    });
  }

  // Intentar al cargar; si el panel aún no existe, esperar al DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBimbaTitle);
  } else {
    attachBimbaTitle();
  }
})();

// ── ACCESO AL PANEL — ESQUINAS ──
// Esquina inferior DERECHA: 5 toques → admin
// Esquina inferior IZQUIERDA: 5 toques → bimba
(function () {
  let adminCount = 0,
    adminTimer = null;
  let bimbaCount = 0,
    bimbaTimer = null;

  // Zona de toque generosa: 80x80px en cada esquina
  const ZONE = 80;
  function handleCornerTouch(e) {
    const t = e.changedTouches[0];
    const fromRight = window.innerWidth - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    const fromLeft = t.clientX;

    // Esquina inferior DERECHA → admin
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
      adminCount++;
      clearTimeout(adminTimer);
      adminTimer = setTimeout(() => {
        adminCount = 0;
      }, 1500);
      if (adminCount >= 5) {
        adminCount = 0;
        clearTimeout(adminTimer);
        setTimeout(_updateAudioBannerState, 200);
    logActivity('📱 Acceso por esquina secreta');
        openAdmin();
      }
      return;
    }

    // Esquina inferior IZQUIERDA → ya no se usa para bimba
  }

  // passive:false para poder hacer preventDefault y evitar gestos del sistema iOS
  // También cancelamos touchstart en las esquinas para evitar que iOS salte al inicio
  document.addEventListener('touchstart', function (e) {
    const t = e.touches[0];
    const fromRight = window.innerWidth - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    // Solo esquina inferior derecha (admin) — solo cancela el toque si es exactamente en la zona
    // passive:true para no bloquear el scroll en todo el documento
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
    }
  }, {
    passive: true
  });
  document.addEventListener('touchend', handleCornerTouch, {
    passive: false
  });

  // PC: 5 clicks en esquina inferior derecha → admin
  document.addEventListener('click', function (e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    const fromRight = window.innerWidth - e.clientX;
    const fromBottom = window.innerHeight - e.clientY;
    if (fromRight > ZONE || fromBottom > ZONE) return;
    adminCount++;
    clearTimeout(adminTimer);
    adminTimer = setTimeout(() => {
      adminCount = 0;
    }, 1500);
    if (adminCount >= 5) {
      adminCount = 0;
      openAdmin();
    }
  });
})();

// ── ACCESO BIMBA POR CANDADO ────────────────────────────────────────────────
// El PIN se comprueba en el servidor (bimba-verify.php), nunca en el
// navegador — así no queda ningún hash extraíble en el JS público y el
// límite de intentos es real (no se puede probar offline sin límite).
function secureLockTap() {
  document.getElementById('secure-pin-input').value = '';
  document.getElementById('secure-pin-error').style.display = 'none';
  document.getElementById('secure-pin-modal').style.display = 'block';
  setTimeout(() => document.getElementById('secure-pin-input').focus(), 100);
}
function secureLockCerrar() {
  document.getElementById('secure-pin-modal').style.display = 'none';
}
async function secureLockConfirm() {
  const val = document.getElementById('secure-pin-input').value;
  let ok = false, errMsg = 'Contraseña incorrecta';
  try {
    const res = await fetch('bimba-verify.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: val })
    });
    const data = await res.json();
    ok = !!data.success;
    if (data.error) errMsg = data.error;
  } catch (e) {
    errMsg = 'Error de conexión. Inténtalo de nuevo.';
  }
  if (ok) {
    document.getElementById('secure-pin-modal').style.display = 'none';
    setTimeout(_updateAudioBannerState, 200);
    _adminLoggedIn = true; window._adminLoggedIn = true;
    _cargarDatosEmpleadosPrivados();
    if (window._bimbaTargetEmpleados) {
      window._bimbaTargetEmpleados = false;
      logActivity('👥 Acceso a empleados por bimba');
      // Mostrar sección bimba-empleados directamente
      document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      const _bimbaEmpSec = document.getElementById('admin-bimba-empleados');
      if (_bimbaEmpSec) { _bimbaEmpSec.style.setProperty('display','block','important'); _bimbaEmpSec.classList.add('active'); }
      setTimeout(function(){
        if(typeof bimbaRenderEmpleados==='function') bimbaRenderEmpleados();
      }, 100);
    } else {
      logActivity('🔒 Acceso bimba por candado');
      openStockConfigSecret();
      setTimeout(dcCargar, 300);
      setTimeout(function(){ if(typeof loadVacacionesStatus==='function') loadVacacionesStatus(); }, 400);
    }
    document.getElementById('admin-overlay').classList.add('open');
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
  } else {
    document.getElementById('secure-pin-error').textContent = errMsg;
    document.getElementById('secure-pin-error').style.display = 'block';
    document.getElementById('secure-pin-input').value = '';
    document.getElementById('secure-pin-input').focus();
  }
}
function toggleAdminPwdVisibility(btn) {
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
    btn.setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
  }
  input.focus();
}


// ── Alerta de slot casi lleno ─────────────────────────────
const _slotAlertSent = {};
async function _checkSlotAlmostFull(slotTime, count, max) {
  if (!slotTime || !max) return;
  const pct = Math.round((count / max) * 100);
  if (pct < 80) return;
  // La fecha va incluida en la clave para que la alerta pueda volver a
  // dispararse cada día — antes, si la pantalla de cocina se quedaba
  // abierta pasada la medianoche (uso normal en una pantalla siempre
  // encendida), un slot que llegara otra vez a ese mismo recuento al día
  // siguiente no volvía a avisar hasta recargar la página.
  const key = new Date().toISOString().slice(0, 10) + '_' + slotTime + '_' + count;
  if (_slotAlertSent[key]) return;
  _slotAlertSent[key] = true;
  try {
    if (typeof emailjs === 'undefined') return;
    emailjs.init('Euum_k_XJdrejjnKj');
    await emailjs.send('service_bil4ri5', 'template_ee4f7sp', {
      slot:  slotTime,
      count: count,
      max:   max,
      pct:   pct
    });
  } catch(e) {}
}

async function closeAdmin() {
  _adminLoggedIn = false; window._adminLoggedIn = false;
  try { if (window.fb_unregisterSession) window.fb_unregisterSession(_SESSION_ID); } catch(e) {}
  // Solo cerrar sesión Firebase si el dispositivo NO es de confianza.
  // Si es de confianza, mantener la sesión activa para no pedir contraseña al reabrir.
  // Comprobar dispositivo de confianza con timeout para no bloquear el cierre
  let trusted = false;
  try {
    trusted = await Promise.race([
      isTrustedDevice(),
      new Promise(resolve => setTimeout(() => resolve(false), 1000))
    ]);
  } catch(e) {}
  if (!trusted && window.fb_adminLogout) window.fb_adminLogout();
  // Reset eye icon to closed state when closing panel
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen = document.querySelector('#admin-login .eye-open');
  const eyeClosed = document.querySelector('#admin-login .eye-closed');
  if (input) input.type = 'password';
  if (eyeOpen) eyeOpen.style.display = 'block';
  if (eyeClosed) eyeClosed.style.display = 'none';
  stopAlertLoop();
  _resetPedidosPendientesAlerta();
  document.getElementById('admin-overlay').classList.remove('open');
  // Resetear estado login/panel para la próxima apertura
  document.getElementById('admin-login').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-error').textContent = '';
  document.getElementById('admin-pwd-input').value = '';
}
// admin-overlay se carga de forma diferida — esperar a que exista
document.addEventListener('adminShellLoaded', function() {
  var overlay = document.getElementById('admin-overlay');
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === this) closeAdmin();
  });
});
async function removeTrustedDevice() {
  const name = getTrustedDeviceName();
  await setTrustedDevice(false);
  const banner = document.getElementById('trusted-device-banner');
  if (banner) banner.style.display = 'none';
  logActivity("\uD83D\uDDD1\uFE0F Dispositivo de confianza eliminado: \"".concat(name, "\""));
}
async function showTrustedBannerIfNeeded() {
  const banner = document.getElementById('trusted-device-banner');
  if (!banner) return;
  if (await isTrustedDevice()) {
    banner.style.display = 'flex';
    const nameEl = document.getElementById('trusted-device-name-display');
    if (nameEl) nameEl.textContent = getTrustedDeviceName();
  } else {
    banner.style.display = 'none';
  }
}
function bimbaGenAdminToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(URL_TOKEN_KEY, token);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken(token).catch(() => {});
  loadUrlTokenUI();
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token admin generado';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaCopyAdminUrl() {
  const token = getUrlToken();
  if (!token) {
    bimbaGenAdminToken();
    return;
  }
  const url = location.origin + location.pathname + '?key=' + token;
  navigator.clipboard.writeText(url).catch(() => {
    const a = document.createElement('textarea');
    a.value = url;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    document.body.removeChild(a);
  });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL admin copiada';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaGenBimbaToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(BIMBA_TOKEN_KEY, token);
  if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(token).catch(() => {});
  // El enlace bimba antes no caducaba nunca — una vez compartido (por
  // WhatsApp, etc.) quedaba válido para siempre sin forma de revocarlo sin
  // romperlo también para quien lo necesitaba de verdad. Ahora caduca a
  // los 90 días; regenerarlo (este mismo botón) también renueva el plazo.
  if (window.fb_saveBimbaTokenExpiry) window.fb_saveBimbaTokenExpiry(Date.now() + 90 * 24 * 60 * 60 * 1000).catch(() => {});
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token bimba generado (válido 90 días)';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function bimbaCopyBimbaUrl() {
  const token = getBimbaToken();
  if (!token) {
    bimbaGenBimbaToken();
    return;
  }
  const url = location.origin + location.pathname + '?bimba=' + token;
  navigator.clipboard.writeText(url).catch(() => {
    const a = document.createElement('textarea');
    a.value = url;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    document.body.removeChild(a);
  });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL bimba copiada';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function generateUrlToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(18))).map(b => b.toString(36)).join('').slice(0, 24);
  localStorage.setItem(URL_TOKEN_KEY, token);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken(token).catch(() => {});
  loadUrlTokenUI();
  logActivity('🔗 Token URL generado/regenerado');
}
function clearUrlToken() {
  if (!confirm('¿Eliminar el token? Ya no se podrá acceder por URL.')) return;
  localStorage.removeItem(URL_TOKEN_KEY);
  if (window.fb_saveUrlToken) window.fb_saveUrlToken('').catch(() => {});
  loadUrlTokenUI();
  logActivity('🔗 Token URL eliminado');
}
function copyUrlWithToken() {
  const token = getUrlToken();
  if (!token) {
    alert('Primero genera un token');
    return;
  }
  const url = "".concat(location.origin).concat(location.pathname, "?key=").concat(token);
  navigator.clipboard.writeText(url).then(() => {
    const t = document.getElementById('url-token-toast');
    if (t) {
      t.style.display = 'block';
      setTimeout(() => t.style.display = 'none', 2500);
    }
  }).catch(() => {
    prompt('Copia esta URL:', url);
  });
}

// ── EXPORTAR / IMPORTAR CONFIGURACIÓN ──────────────────────────────
function exportarConfig() {
  // NOTA DE SEGURIDAD: este backup se descarga como JSON en plano y suele
  // acabar compartido sin pensarlo mucho (WhatsApp, email, carpeta
  // sincronizada...). urlToken/bimbaToken dan acceso directo al panel sin
  // contraseña (?key=/?bimba=) y adminPwd es el hash de la contraseña real
  // — antes se incluían aquí. Si hace falta restaurarlos, se regeneran
  // desde sus botones correspondientes en Ajustes, no hace falta que vivan
  // en un fichero de backup.
  const backup = {
    version: 1,
    fecha: new Date().toISOString(),
    config: _lsGet(CONFIG_KEY, {}),
    soundConfig: _lsGet(SOUND_KEY, {}),
    autoDelete: localStorage.getItem(AUTODELETE_KEY) || '0',
    ordersOpen: localStorage.getItem(ORDERS_KEY) || 'true',
    ordersMsg: localStorage.getItem(ORDERS_MSG_KEY) || '',
    openLocal: localStorage.getItem(OPEN_KEY) || 'true',
    slotTurnos: _lsGet(SLOT_TURNOS_KEY, null),
    slotMax: localStorage.getItem(SLOT_MAX_KEY) || '4',
    blockedCats: _lsGet(CAT_BLOCK_KEY, []),
    empresa: localStorage.getItem(EMP_EMPRESA_KEY) || '',
    stockData: _lsGet(STOCK_DATA_KEY, null),
    cif: localStorage.getItem(EMP_CIF_KEY) || ''
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dulcepatata-config-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  logActivity('💾 Configuración exportada');
}
function _lsGet(key, def) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
  } catch {
    return def;
  }
}
function importarConfig(input) {
  const file = input.files[0];
  const errEl = document.getElementById('backup-error');
  if (errEl) errEl.textContent = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.version) throw new Error('Archivo no válido');
      if (backup.config) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(backup.config));
        Object.assign(CONFIG, backup.config);
        if (window.fb_saveConfig) window.fb_saveConfig(backup.config).catch(() => {});
      }
      if (backup.soundConfig) {
        localStorage.setItem(SOUND_KEY, JSON.stringify(backup.soundConfig));
        if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(backup.soundConfig).catch(() => {});
      }
      if (backup.autoDelete !== undefined) {
        localStorage.setItem(AUTODELETE_KEY, backup.autoDelete);
        if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(parseInt(backup.autoDelete) || 0).catch(() => {});
      }
      if (backup.ordersOpen !== undefined) {
        localStorage.setItem(ORDERS_KEY, backup.ordersOpen);
        if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(backup.ordersOpen === 'true' || backup.ordersOpen === true).catch(() => {});
      }
      if (backup.ordersMsg) {
        localStorage.setItem(ORDERS_MSG_KEY, backup.ordersMsg);
        if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(backup.ordersMsg).catch(() => {});
      }
      if (backup.openLocal !== undefined) {
        localStorage.setItem(OPEN_KEY, backup.openLocal);
        if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(backup.openLocal === 'true' || backup.openLocal === true).catch(() => {});
      }
      // urlToken/bimbaToken/stockPwd/adminPwd ya NO se exportan (ver
      // exportarConfig) y tampoco se restauran aquí aunque un backup
      // antiguo (o un fichero manipulado a propósito) los incluya — así
      // nadie puede colar un token de acceso propio haciendo pasar un
      // "backup" por uno legítimo. Se regeneran desde sus botones en Ajustes.
      if (backup.slotTurnos) {
        localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(backup.slotTurnos));
        if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(backup.slotTurnos, backup.slotMax || '4').catch(() => {});
      }
      if (backup.slotMax) {
        localStorage.setItem(SLOT_MAX_KEY, backup.slotMax);
        SLOT_MAX = parseInt(backup.slotMax, 10);
      }
      if (backup.blockedCats) {
        localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(backup.blockedCats));
        if (window.fb_saveBlockedCats) window.fb_saveBlockedCats(backup.blockedCats).catch(() => {});
      }
      if (backup.stockData) {
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(backup.stockData));
        if (window.fb_saveStockData) window.fb_saveStockData(backup.stockData).catch(() => {});
      }
      if (backup.empresa !== undefined) {
        localStorage.setItem(EMP_EMPRESA_KEY, backup.empresa);
        if (window.fb_saveEmpresa) window.fb_saveEmpresa(backup.empresa, backup.cif || '').catch(() => {});
      }
      if (backup.cif !== undefined) {
        localStorage.setItem(EMP_CIF_KEY, backup.cif);
      }
      if (backup.adminPwd && isHex64(backup.adminPwd)) {
        localStorage.setItem(ADMIN_PWD_KEY, backup.adminPwd);
        if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(backup.adminPwd).catch(() => {});
      }

      // Refrescar UI
      loadAdminConfig();
      loadUrlTokenUI();
      loadOrdersStatus();
      loadOpenStatus();
      renderMenu();
      showToast('backup-toast');
      logActivity('📥 Configuración importada desde archivo');
    } catch (err) {
      if (errEl) errEl.textContent = '❌ Error al importar: ' + err.message;
    }
    input.value = '';
  };
  reader.readAsText(file);
}
// ───────────────────────────────────────────────────────────────────

function loadUrlTokenUI() {
  const token = getUrlToken();
  const inp = document.getElementById('url-token-display');
  const full = document.getElementById('url-token-full');
  if (!inp) return;
  inp.value = token || '';
  if (full) {
    if (token) {
      const url = "".concat(location.origin).concat(location.pathname, "?key=").concat(token);
      full.textContent = '🔗 ' + url;
    } else {
      full.textContent = 'Sin token activo';
    }
  }
}
// Antes _adminFailedAttempts solo vivía en memoria: recargar la pantalla de
// login (F5) lo volvía a poner a 0 y se saltaba el retraso progresivo
// entero. Se persiste en localStorage (con la hora del último fallo, para
// que 30 minutos sin ningún fallo lo reseteen solos y no penalice a un
// admin de verdad que vuelve más tarde).
const ADMIN_FAILED_KEY = 'dpf_admin_failed_attempts';
const ADMIN_FAILED_RESET_MS = 30 * 60 * 1000;
function _cargarIntentosFallidosAdmin() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_FAILED_KEY) || 'null');
    if (raw && typeof raw.count === 'number' && typeof raw.ts === 'number' && (Date.now() - raw.ts) < ADMIN_FAILED_RESET_MS) {
      return raw.count;
    }
  } catch (e) {}
  return 0;
}
function _guardarIntentosFallidosAdmin(count) {
  try {
    if (count > 0) localStorage.setItem(ADMIN_FAILED_KEY, JSON.stringify({ count, ts: Date.now() }));
    else localStorage.removeItem(ADMIN_FAILED_KEY);
  } catch (e) {}
}
let _adminFailedAttempts = _cargarIntentosFallidosAdmin();
let _adminLockedUntil = 0;
async function checkAdminPwd() {
  var _document$getElementB5;
  const email = (((_document$getElementB5 = document.getElementById('admin-email-input')) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.value) || '').trim();
  const pwd = document.getElementById('admin-pwd-input').value;
  if (!email) {
    document.getElementById('admin-error').textContent = 'Introduce tu email.';
    return;
  }
  if (!pwd) {
    document.getElementById('admin-error').textContent = 'Introduce la contraseña.';
    return;
  }

  // Mostrar estado de carga
  const btn = document.querySelector('.admin-login-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Entrando...';
  }
  document.getElementById('admin-error').textContent = '';
  if (!window.fb_adminLogin) {
    console.log('[fb] checkAdminPwd: fb_adminLogin missing, ready=', window._firebaseAuthReady, 'readyPromise=', !!window._firebaseAuthReadyPromise, 'ensureReady=', !!(window.fb && window.fb.ensureReady));
    if (window.fb && typeof window.fb.ensureReady === 'function') {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      try {
        await Promise.race([window.fb.ensureReady(), new Promise(function (resolve) {
          setTimeout(resolve, 6000);
        })]);
      } catch (err) {
        console.warn('[fb] checkAdminPwd: ensureReady rejected', err);
      }
    } else if (window._firebaseAuthReadyPromise) {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      await Promise.race([window._firebaseAuthReadyPromise, new Promise(function (resolve) {
        setTimeout(resolve, 6000);
      })]);
    }
    if (window.fb_adminLogin) {
      console.log('[fb] checkAdminPwd: fb_adminLogin became available after wait');
      // Reintentar ahora que auth pudo haberse inicializado.
    } else if (window._firebaseAuthReady === false) {
      document.getElementById('admin-error').textContent = 'Firebase Auth aún se está inicializando. Espera unos segundos y vuelve a intentarlo.';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
      return;
    } else {
      document.getElementById('admin-error').textContent = 'Firebase no se ha inicializado correctamente. Recarga la página y revisa la consola.';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
      return;
    }
  }
  // Delay progresivo por intentos fallidos
  const _delays = [0, 0, 5, 15, 30, 60, 180]; // segundos por intento
  const _delaySeconds = _delays[Math.min(_adminFailedAttempts, _delays.length - 1)];
  if (_delaySeconds > 0) {
    const errEl = document.getElementById('admin-error');
    let remaining = _delaySeconds;
    const interval = setInterval(() => {
      remaining--;
      if (errEl) errEl.textContent = '⏳ Demasiados intentos fallidos. Espera ' + remaining + ' segundos...';
      if (remaining <= 0) {
        clearInterval(interval);
        if (errEl) errEl.textContent = '';
      }
    }, 1000);
    if (errEl) errEl.textContent = '⏳ Demasiados intentos fallidos. Espera ' + _delaySeconds + ' segundos...';
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    await new Promise(r => setTimeout(r, _delaySeconds * 1000));
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
  }
  const result = await window.fb_adminLogin(email, pwd);

  // Registrar intento en Firebase con IP
  (async function () {
    var ip = 'desconocida';
    try {
      var ipRes = await Promise.race([fetch('https://api.ipify.org?format=json'), new Promise(function (_, rej) {
        setTimeout(function () {
          rej(new Error('timeout'));
        }, 3000);
      })]);
      var ipData = await ipRes.json();
      ip = ipData.ip || 'desconocida';
    } catch (e) {}
    try {
      if (window.fb_saveLoginLog) {
        await window.fb_saveLoginLog({
          ts: Date.now(),
          fecha: new Date().toLocaleString('es-ES'),
          email: email,
          resultado: result.ok ? '✅ Acceso correcto' : '⛔ Fallo: ' + (result.msg || 'Error'),
          ip: ip,
          dispositivo: navigator.userAgent.slice(0, 120)
        });
        console.log('[loginLog] guardado OK, ip:', ip);
      } else {
        console.warn('[loginLog] fb_saveLoginLog no disponible');
      }
    } catch (e) {
      console.error('[loginLog] error al guardar:', e);
    }
  })();
  if (result.ok) {
    var _document$getElementB6, _document$getElementB7;
    _adminFailedAttempts = 0;
    _guardarIntentosFallidosAdmin(0);
    const trustedChecked = (_document$getElementB6 = document.getElementById('trusted-device-check')) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.checked;
    const trustedName = ((_document$getElementB7 = document.getElementById('trusted-device-name')) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.value.trim()) || 'Sin nombre';
    if (trustedChecked) await setTrustedDevice(true, trustedName);
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    _cargarDatosEmpleadosPrivados();
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
    const audioBanner = document.getElementById('audio-unlock-banner');
    if (audioBanner) audioBanner.style.display = _audioCtxUnlocked ? 'none' : 'block';
    setTimeout(_updateAudioBannerState, 200);
    logActivity('🔑 Acceso con Firebase Auth (' + email + ')' + (trustedChecked ? " \u2014 dispositivo registrado como \"".concat(trustedName, "\"") : ''));
  } else {
    _adminFailedAttempts++;
    _guardarIntentosFallidosAdmin(_adminFailedAttempts);
    const errMsg = result.msg || 'Error al iniciar sesión';
    let errDisplay = errMsg;
    if (_adminFailedAttempts >= 3) {
      const nextDelay = [0,0,0,15,30,60,180][Math.min(_adminFailedAttempts, 6)];
      errDisplay = errMsg + (_adminFailedAttempts >= 3 ? ' (' + _adminFailedAttempts + ' intentos fallidos' + (nextDelay > 0 ? ' — próximo intento bloqueado ' + nextDelay + 's' : '') + ')' : '');
    }
    document.getElementById('admin-error').textContent = errDisplay;
    console.error('[login] Fallo de autenticación:', errMsg, result);
    logActivity('⛔ Intento de acceso fallido (' + email + '): ' + errMsg + ' [intento ' + _adminFailedAttempts + ']');
  }
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

// showAdminSection is defined later with full support


// ── PRODUCTOS ──
function getSavedMenu() {
  try {
    return JSON.parse(localStorage.getItem(MENU_KEY)) || null;
  } catch {
    return null;
  }
}
function saveMenu() {
  const data = {
    items: MENU,
    ts: Date.now()
  };
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', data.ts);
  // Sync to Firebase so all devices get updated prices
  if (window.fb_saveMenu) window.fb_saveMenu(data).catch(() => {});
}
function loadSavedMenu() {
  const saved = getSavedMenu();
  if (saved) {
    MENU.length = 0;
    saved.forEach(i => MENU.push(i));
  }
}
function renderAdminProducts() {
  const cats = [...new Set(MENU.map(i => i.cat))];
  const emojiMapAdmin = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  let html = '';
  cats.forEach(cat => {
    const catEmoji = emojiMapAdmin[cat] || '';
    html += "<p style=\"font-family:Anton,sans-serif;font-size:19px;font-weight:400;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;margin:16px 0 8px;padding:8px 14px;border-radius:8px\">".concat(catEmoji ? catEmoji + ' ' : '', cat, "</p>");
    let lastTartaSub = null;
    MENU.filter(i => i.cat === cat).forEach(item => {
      const visible = item.hidden ? 'off' : 'on';
      const soldout = item.soldout ? true : false;
      let tartaSep = '';
      if (cat === 'Tartas') {
        const isClasica = item.desc && item.desc.toLowerCase().indexOf('clásica') !== -1;
        const isEspecial = item.desc && item.desc.toLowerCase().indexOf('especial') !== -1;
        if (isClasica && lastTartaSub !== 'clasica') {
          lastTartaSub = 'clasica';
          tartaSep = '<div class="tarta-subsep tarta-subsep-clasica">CLÁSICAS</div>';
        } else if (isEspecial && lastTartaSub !== 'especial') {
          lastTartaSub = 'especial';
          tartaSep = '<div class="tarta-subsep tarta-subsep-especial">ESPECIALES</div>';
        }
      }
      html += tartaSep + "\n      <div class=\"admin-product-row\" id=\"arow-".concat(item.id, "\"\n        ondragover=\"dragOver(event)\" ondrop=\"dragDrop(event,").concat(item.id, ")\" ondragleave=\"dragLeave(event)\">\n        <span class=\"drag-handle\" draggable=\"true\" title=\"Arrastrar para reordenar\"\n          ondragstart=\"dragStart(event,").concat(item.id, ")\">\u283F</span>\n        <div class=\"aprod-info\">\n          <div class=\"aprod-name\" style=\"").concat(soldout ? 'text-decoration:line-through;color:#8A6A4E' : '', "\">").concat(formatNombreConBadgeNuevo(item.name), "</div>\n          <div class=\"aprod-desc\">").concat(item.desc, "</div>\n          ").concat(soldout ? '<span class="soldout-badge">AGOTADO</span>' : '', "\n        \n        </div>\n        <span class=\"aprod-price\">").concat(item.price.toFixed(2), " \u20AC</span>\n        <div class=\"btn-row\">\n        <button class=\"admin-edit-btn\" onclick=\"toggleEditPanel(").concat(item.id, ")\">\u270F\uFE0F Editar</button>\n        <button class=\"aprod-toggle-text ").concat(soldout ? 'off' : 'on', "\" id=\"sold-").concat(item.id, "\" onclick=\"toggleSoldout(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(soldout ? '#c0392b' : '#5ECC76', ";color:#fff\">").concat(soldout ? 'Agotado' : 'Disponible', "</button>\n        <button class=\"aprod-toggle-text ").concat(visible, "\" id=\"tog-").concat(item.id, "\" onclick=\"toggleProduct(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(visible === 'on' ? '#5ECC76' : '#aaa', ";color:#fff\">").concat(visible === 'on' ? 'Visible' : 'Oculto', "</button>\n        </div>\n      </div>\n      <div id=\"edit-").concat(item.id, "\" style=\"display:none;flex-direction:column;background:rgba(244,196,48,0.08);border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;margin:-4px 0 8px\">\n        <input type=\"text\" value=\"").concat(item.name.replace(/"/g, '&quot;'), "\" id=\"edit-name-").concat(item.id, "\" placeholder=\"Nombre\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"text\" value=\"").concat(item.desc.replace(/"/g, '&quot;'), "\" id=\"edit-desc-").concat(item.id, "\" placeholder=\"Descripci\xF3n\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"number\" value=\"").concat(item.price.toFixed(2), "\" id=\"edit-price-").concat(item.id, "\" step=\"0.10\" min=\"0\" placeholder=\"Precio (\u20AC)\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <div style=\"display:flex\">\n          <button class=\"admin-save-btn\" onclick=\"saveProductEdit(").concat(item.id, ")\" style=\"flex:1\">\u2705 Guardar</button>\n          <button class=\"admin-save-btn\" onclick=\"confirmDeleteProduct(").concat(item.id, ",'").concat(item.name.replace(/'/g, "\\'"), "')\" style=\"background:#c0392b;flex:1\">\uD83D\uDDD1\uFE0F Eliminar</button>\n        </div>\n      </div>");
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
}
function toggleEditPanel(id) {
  const panel = document.getElementById('edit-' + id);
  if (!panel) return;
  const isOpen = panel.style.display === 'flex';
  // Cerrar todos los paneles abiertos
  document.querySelectorAll('[id^="edit-"]').forEach(p => {
    if (p.tagName === 'DIV') p.style.display = 'none';
  });
  if (!isOpen) {
    panel.style.display = 'flex';
    const firstInput = panel.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
}
function saveProductEdit(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  const nameEl = document.getElementById('edit-name-' + id);
  const descEl = document.getElementById('edit-desc-' + id);
  const priceEl = document.getElementById('edit-price-' + id);
  if (nameEl && nameEl.value.trim()) item.name = nameEl.value.trim();
  if (descEl) item.desc = descEl.value.trim();
  if (priceEl) item.price = parseFloat(priceEl.value) || item.price;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("\u270F\uFE0F Producto editado: \"".concat(item.name, "\" \u2014 ").concat(item.price.toFixed(2), " \u20AC"));
}
function updatePrice(id, val) {
  const item = MENU.find(m => m.id == id);
  if (item) {
    item.price = parseFloat(val) || item.price;
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("\uD83D\uDCB0 Precio actualizado: \"".concat(item.name, "\" \u2192 ").concat(item.price.toFixed(2), " \u20AC"));
  }
}
function updateName(id, val) {
  const item = MENU.find(m => m.id == id);
  if (val.trim() && item) {
    item.name = val.trim();
    saveMenu();
    renderMenu();
    showToast('prod-toast');
    logActivity("\u270F\uFE0F Nombre actualizado: \"".concat(item.name, "\""));
  }
}
function toggleProduct(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.hidden = !item.hidden;
  const btn = document.getElementById('tog-' + id);
  if (btn) {
    btn.style.background = item.hidden ? '#aaa' : '#5ECC76';
    btn.textContent = item.hidden ? 'Oculto' : 'Visible';
  }
  saveMenu();
  renderMenu();
  showToast('prod-toast');
  logActivity("\uD83D\uDC41\uFE0F Producto ".concat(item.hidden ? 'ocultado' : 'mostrado', ": \"").concat(item.name, "\""));
}
function toggleSoldout(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.soldout = !item.soldout;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("\uD83D\uDEAB Producto ".concat(item.soldout ? 'marcado agotado' : 'disponible de nuevo', ": \"").concat(item.name, "\""));
}

// ── CONFIRM MODAL ──
let _confirmCallback = null;
function showConfirm(title, msg, okLabel, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const okBtn = document.getElementById('confirm-ok-btn');
  okBtn.textContent = okLabel || 'Confirmar';
  _confirmCallback = cb;
  okBtn.onclick = () => {
    closeConfirm();
    if (_confirmCallback) _confirmCallback();
  };
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('open');
}
function confirmDeleteProduct(id, name) {
  showConfirm('¿Eliminar producto?', "\"".concat(name, "\" se eliminar\xE1 de la carta permanentemente."), '🗑️ Eliminar', () => {
    const idx = MENU.findIndex(m => m.id == id);
    if (idx >= 0) MENU.splice(idx, 1);
    saveMenu();
    initTabs();
    renderMenu();
    renderAdminProducts();
    showToast('prod-toast');
  });
}

// ── DRAG & DROP REORDER ──
let _dragId = null;
function dragStart(event, id) {
  _dragId = id;
  event.dataTransfer.effectAllowed = 'move';
  event.stopPropagation();
  const row = document.getElementById('arow-' + id);
  if (row) setTimeout(() => row.classList.add('dragging'), 0);
}
function dragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const row = event.currentTarget;
  if (row) row.style.background = 'rgba(244,196,48,0.08)';
}
function dragLeave(event) {
  const row = event.currentTarget;
  if (row) row.style.background = '';
}
function dragDrop(event, targetId) {
  event.preventDefault();
  const row = event.currentTarget;
  if (row) row.style.background = '';
  if (_dragId === targetId) {
    _dragId = null;
    return;
  }
  const fromIdx = MENU.findIndex(m => m.id == _dragId);
  const toIdx = MENU.findIndex(m => m.id == targetId);
  if (fromIdx < 0 || toIdx < 0) {
    _dragId = null;
    return;
  }
  const _MENU$splice = MENU.splice(fromIdx, 1),
    _MENU$splice2 = _slicedToArray(_MENU$splice, 1),
    moved = _MENU$splice2[0];
  MENU.splice(toIdx, 0, moved);
  _dragId = null;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
}

// ── BACKUP / RESTORE JSON ──
function exportMenuJSON() {
  const blob = new Blob([JSON.stringify(MENU, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'carta_dulce_patata.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importMenuJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      var _data$;
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data) || !((_data$ = data[0]) !== null && _data$ !== void 0 && _data$.name)) {
        alert('Archivo inválido');
        return;
      }
      showConfirm('¿Importar carta?', "Se reemplazar\xE1 la carta actual con ".concat(data.length, " productos del archivo."), '⬆️ Importar', () => {
        MENU.length = 0;
        data.forEach(i => MENU.push(i));
        saveMenu();
        initTabs();
        renderMenu();
        renderAdminProducts();
        showToast('prod-toast');
      });
    } catch {
      alert('Error al leer el archivo JSON');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
function addSection() {
  const input = document.getElementById('new-section-name');
  const cat = input ? input.value.trim() : '';
  if (!cat) { alert('Escribe el nombre de la categoría'); return; }
  if (MENU.some(i => i.cat === cat)) { alert('Esa categoría ya existe'); return; }
  // Añadir producto placeholder oculto para crear la categoría
  const newId = Math.max(0, ...MENU.map(i => i.id)) + 1;
  MENU.push({ id: newId, cat, name: '(producto de ejemplo)', desc: '', price: 0, hidden: true });
  saveMenu();
  initTabs();
  renderMenu();
  renderAdminProducts();
  if (input) input.value = '';
  showToast('section-toast');
  logActivity('📂 Nueva categoría creada: ' + cat);
}
function newCatSelectChange(sel) {
  const input = document.getElementById('new-cat-nombre');
  if (!input) return;
  if (sel.value === '__nueva__') {
    input.style.display = 'block';
    setTimeout(() => input.focus(), 100);
  } else {
    input.style.display = 'none';
    input.value = '';
  }
}
function addProduct() {
  const name = document.getElementById('new-name').value.trim();
  const desc = document.getElementById('new-desc').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  let cat = document.getElementById('new-cat').value;
  if (cat === '__nueva__') {
    const inputNueva = document.getElementById('new-cat-nombre');
    cat = inputNueva ? inputNueva.value.trim() : '';
    if (!cat) { alert('Escribe el nombre de la nueva categoría'); return; }
  }
  if (!name || !cat || isNaN(price)) {
    alert('Rellena nombre, categoría y precio');
    return;
  }
  const newId = Math.max(0, ...MENU.map(i => i.id)) + 1;
  const newItem = { id: newId, cat, name, desc, price };
  // Insertar justo después del último producto de la misma categoría,
  // para que no aparezca suelto fuera de su sección en la carta
  let lastIdx = -1;
  for (let i = 0; i < MENU.length; i++) {
    if (MENU[i].cat === cat) lastIdx = i;
  }
  if (lastIdx === -1) {
    MENU.push(newItem);
  } else {
    MENU.splice(lastIdx + 1, 0, newItem);
  }
  saveMenu();
  initTabs();
  renderMenu();
  renderAdminProducts();
  document.getElementById('new-name').value = '';
  document.getElementById('new-desc').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-cat').value = '';
  const nci = document.getElementById('new-cat-nombre');
  if (nci) { nci.value = ''; nci.style.display = 'none'; }
  showToast('prod-toast');
}

// Override renderMenu to respect hidden and soldout flags
// Override renderMenu to respect hidden and soldout flags
// ── PROMOS ──
var PROMOS_KEY = 'dpf_promos';

function promosLoad() {
  try { return JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]'); } catch { return []; }
}
function promosSave(arr) {
  localStorage.setItem(PROMOS_KEY, JSON.stringify(arr));
  if (window.fb_savePromos) window.fb_savePromos(arr).catch(() => {});
}

function renderPromos() {
  var container = document.getElementById('promos-container');
  if (!container) return;
  var promos = promosLoad().filter(function(p) { return p.visible; });
  if (!promos.length) { container.innerHTML = ''; return; }
  container.innerHTML = promos.map(function(p) {
    var precioTachado = p.precioAntes ? '<span style="text-decoration:line-through;font-size:11px;color:#8A6A4E;margin-right:4px">' + parseFloat(p.precioAntes).toFixed(2) + ' €</span>' : '';
    return '<div style="position:relative;padding-top:14px;margin-bottom:8px">' +
      '<span style="position:absolute;top:0;left:12px;background:#3D1F0D;color:#FFF8EE;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px">🔥 Promo</span>' +
      '<div style="background:#fdecd5;border:1.5px solid #3D1F0D;border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      '<div style="flex:1">' +
      '<div style="font-size:14px;font-weight:700;color:#3D1F0D;margin-bottom:2px">' + escapeHtml(p.nombre) + '</div>' +
      '<div style="font-size:12px;color:#8A6A4E;margin-bottom:6px">' + escapeHtml(p.descripcion || '') + '</div>' +
      '<div>' + precioTachado + '<span style="font-size:14px;font-weight:700;color:#3D1F0D">' + parseFloat(p.precio).toFixed(2) + ' €</span></div>' +
      '</div>' +
      '<button onclick="promoAnadir(\'' + escapeAttr(p.id) + '\')" style="padding:8px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;flex-shrink:0">+ Añadir</button>' +
      '</div></div>';
  }).join('');
}

function promoAnadir(id) {
  var promos = promosLoad();
  var p = promos.find(function(x) { return x.id === id; });
  if (!p) return;
  if (p.opcionQueso || p.opcionGratinado) {
    promoAbrirModal(p);
  } else {
    promoAddToCart(p, {});
  }
}





function promoSelectOpc(el, grupo) {
  var parent = el.parentElement;
  parent.querySelectorAll('span').forEach(function(s) {
    s.style.background = '#fff';
    s.style.color = '#3D1F0D';
    s.style.border = '1.5px solid #F5E6C8';
  });
  el.style.background = '#3D1F0D';
  el.style.color = '#FFF8EE';
  el.style.border = '1.5px solid #3D1F0D';
}


function promoAbrirModal(p) {
  var existing = document.getElementById('promo-modal-overlay');
  if (existing) existing.remove();

  var qId = 'pcheck-queso';
  var gId = 'pcheck-gratinado';
  var checkStyle = 'width:22px;height:22px;border-radius:50%;border:2px solid #F5E6C8;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;color:transparent;font-weight:700;transition:all .15s';

  function makeCheck(id, emoji, label, sub) {
    return '<label style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;cursor:pointer;margin-bottom:8px" onclick="var c=document.getElementById(\''+id+'\');var on=c.dataset.on===\'1\';c.dataset.on=on?\'0\':\'1\';c.style.background=on?\'#fff\':\'#3D1F0D\';c.style.borderColor=on?\'#F5E6C8\':\'#3D1F0D\';c.style.color=on?\'transparent\':\'#fff\';">' +
      '<div><div style="font-weight:700;font-size:14px;color:#2A1506">' + emoji + ' ' + label + '</div><div style="font-size:12px;color:#8A6A4E">' + sub + '</div></div>' +
      '<div id="' + id + '" data-on="0" style="' + checkStyle + '">✓</div>' +
      '</label>';
  }

  var extrasHtml = '';
  if (p.opcionQueso || p.opcionGratinado) {
    extrasHtml += '<div style="border-top:1px solid #F5E6C8;margin-top:14px;padding-top:14px">';
    extrasHtml += '<div style="font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Extras opcionales</div>';
    if (p.opcionQueso) extrasHtml += makeCheck(qId, '🧀', 'Añadir queso mozzarella', '+1,00 €');
    if (p.opcionGratinado) extrasHtml += makeCheck(gId, '🔥', 'Gratinar (con queso)', '+0,50 € · incluye gratinado del queso');
    extrasHtml += '</div>';
  }

  extrasHtml += '<div style="margin-top:12px">' +
    '<div style="font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Nota</div>' +
    '<textarea id="promo-nota" placeholder="Instrucciones especiales..." style="width:100%;padding:10px 14px;border:1.5px solid #F5E6C8;border-radius:10px;font-size:13px;font-family:DM Sans,sans-serif;resize:none;box-sizing:border-box;background:#fff;outline:none;color:#2A1506" rows="2"></textarea>' +
    '</div>';

  var div = document.createElement('div');
  div.id = 'promo-modal-overlay';
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(61,31,13,0.5);z-index:9999;display:flex;align-items:flex-end;justify-content:center';

  var inner = document.createElement('div');
  inner.style.cssText = 'background:#FFF8EE;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 32px;max-height:85vh;overflow-y:auto';

  var titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px';
  titleRow.innerHTML = '<div style="font-size:20px;font-weight:800;color:#3D1F0D;font-family:Playfair Display,serif">' + escapeHtml(p.nombre) + '</div>';
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = 'background:none;border:none;font-size:22px;color:#8A6A4E;cursor:pointer;padding:0;line-height:1';
  closeBtn.onclick = function() { div.remove(); };
  titleRow.appendChild(closeBtn);

  var descEl = document.createElement('div');
  descEl.style.cssText = 'font-size:13px;color:#8A6A4E;margin-bottom:2px';
  descEl.textContent = p.descripcion || '';

  var extrasEl = document.createElement('div');
  extrasEl.innerHTML = extrasHtml;

  var confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Añadir al carrito · ' + parseFloat(p.precio).toFixed(2).replace('.', ',') + ' €';
  confirmBtn.style.cssText = 'width:100%;padding:14px;background:#3D1F0D;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif;margin-top:16px';
  confirmBtn.onclick = function() { promoConfirmarModal(p.id); };

  inner.appendChild(titleRow);
  inner.appendChild(descEl);
  inner.appendChild(extrasEl);
  inner.appendChild(confirmBtn);
  div.appendChild(inner);
  document.body.appendChild(div);
}

function promoConfirmarModal(id) {
  var promos = promosLoad();
  var p = promos.find(function(x) { return x.id === id; });
  if (!p) return;
  var opts = {};
  var quesoEl = document.getElementById('promo-check-queso');
  var gratinadoEl = document.getElementById('promo-check-gratinado');
  if (quesoEl) opts.extraQueso = quesoEl.dataset.active === '1';
  if (gratinadoEl) opts.extraGratinado = gratinadoEl.dataset.active === '1';
  promoAddToCart(p, opts);
  document.getElementById('promo-modal-overlay').remove();
}

function promoAddToCart(p, opts) {
  if (!window.promoCart) window.promoCart = {};
  var key = 'promo_' + p.id + '_' + Date.now();
  window.promoCart[key] = { promo: p, opts: opts, qty: 1 };
  updateCart();
  showToast('cart-toast', '🔥 ' + p.nombre + ' añadida');
}

function renderMenu() {
  window._tartaLastSub = null;
  var rawFiltered = (activeCategory === "Todos" ? MENU : MENU.filter(i => i.cat === activeCategory)).filter(i => !i.hidden);
  // Ordenar tartas: clásicas primero, especiales después
  var tartasClasicas = rawFiltered.filter(i => i.cat === 'Tartas' && i.desc && i.desc.toLowerCase().indexOf('clásica') !== -1);
  var tartasEspeciales = rawFiltered.filter(i => i.cat === 'Tartas' && i.desc && i.desc.toLowerCase().indexOf('especial') !== -1);
  var tartasOtras = rawFiltered.filter(i => i.cat === 'Tartas' && (!i.desc || (i.desc.toLowerCase().indexOf('clásica') === -1 && i.desc.toLowerCase().indexOf('especial') === -1)));
  var noTartas = rawFiltered.filter(i => i.cat !== 'Tartas');
  // Reconstruir en orden: todo lo que no es tartas con tartas reordenadas en su posición
  var tartasOrdenadas = [...tartasClasicas, ...tartasOtras, ...tartasEspeciales];
  var firstTartaIdx = rawFiltered.findIndex(i => i.cat === 'Tartas');
  var filtered = firstTartaIdx === -1 ? rawFiltered : [
    ...rawFiltered.slice(0, firstTartaIdx).filter(i => i.cat !== 'Tartas'),
    ...tartasOrdenadas,
    ...rawFiltered.slice(firstTartaIdx).filter(i => i.cat !== 'Tartas')
  ];
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  const showSeparators = activeCategory === "Todos";
  var emojiMap2 = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  const catSubtitles = {
    "Patatas": "recién asadas a partir de las 19:30h",
    "Boniato": "el toque dulce y crujiente · elige tu tarrina",
    "Paninis": "pan de leña crujiente · ¡medio metro!",
    "Cookies": "Crumbl Cookies · horneadas cada día",
    "Tartas": "todas caseras y de elaboración propia",
    "Bebidas": "para acompañar tu pedido"
  };
  const catCounts = {};
  if (showSeparators) {
    MENU.filter(i => !i.hidden).forEach(i => { catCounts[i.cat] = (catCounts[i.cat] || 0) + 1; });
  }
  let lastCat = null;
  const html = filtered.map(item => {
    const isCustom = item.id === 15 || item.id === 16;
    const isExtras = ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(item.id) || item.id === CHEDDAR_ID;
    const qty = isCustom ? Object.values(custCart).filter(c => c.menuId === item.id).reduce((s,c) => s+c.qty, 0)
              : isExtras ? Object.values(extrasCart).filter(c => c.menuId === item.id).reduce((s,c) => s+c.qty, 0)
              : cart[item.id] || 0;
    const soldout = item.soldout;
    let sep = '';
    if (showSeparators && item.cat !== lastCat) {
      lastCat = item.cat;
      const sub = catSubtitles[item.cat] || '';
      const count = catCounts[item.cat] || '';
      const emoji = emojiMap2[item.cat] || '';
      sep = '<div class="menu-cat-sep">'
          + (emoji ? '<div class="menu-cat-icon">' + emoji + '</div>' : '')
          + '<div class="menu-cat-left">'
          + '<div class="menu-cat-name">' + item.cat.toUpperCase() + '</div>'
          + (sub ? '<div class="menu-cat-sub">' + sub + '</div>' : '')
          + '</div>'
          + (count ? '<div class="menu-cat-badge">' + count + ' opciones</div>' : '')
          + '</div>';
    }

    // Subsecciones de Tartas: Clásicas / Especiales
    var tartaSep = '';
    if (item.cat === 'Tartas') {
      var isTartaClassic = item.desc && item.desc.toLowerCase().indexOf('clásica') !== -1;
      var isTartaSpecial = item.desc && item.desc.toLowerCase().indexOf('especial') !== -1;
      if (isTartaClassic && !window._tartaLastSub || window._tartaLastSub === 'especial' && isTartaClassic) {
        window._tartaLastSub = 'clasica';
        tartaSep = '<div class="tarta-subsep tarta-subsep-clasica">'
          + '<span>CLÁSICAS · 3,40€</span>'
          + '</div>';
      } else if (isTartaSpecial && window._tartaLastSub !== 'especial') {
        window._tartaLastSub = 'especial';
        tartaSep = '<div class="tarta-subsep tarta-subsep-especial">'
          + '<span>ESPECIALES · 3,90€</span>'
          + '</div>';
      }
    } else {
      window._tartaLastSub = null;
    }
    sep = sep + tartaSep;
    let controls;
    if (soldout) {
      controls = '<span style="font-size:12px;color:#c0392b;font-weight:700">AGOTADO</span>';
    } else if (qty > 0) {
      controls = '<button class="qty-btn" onclick="changeQty(' + item.id + ',-1)">−</button>'
               + '<span class="qty-num">' + qty + '</span>'
               + '<button class="qty-btn" onclick="changeQty(' + item.id + ',+1)">+</button>';
    } else {
      controls = '<button class="add-btn" onclick="changeQty(' + item.id + ',+1)" title="Añadir">+</button>';
    }
    const esTopVentas = item.name && item.name.indexOf('🔥') !== -1;
    const nombreParaBadge = esTopVentas ? item.name.replace('🔥', '').trim() : item.name;
    return sep
      + '<div class="item-card ' + (qty > 0 ? 'in-cart' : '') + ' ' + (soldout ? 'soldout-card' : '') + '"'
      + ' id="card-' + item.id + '"'
      + ' data-name="' + escapeAttr(item.name) + '"'
      + ' data-desc="' + escapeAttr(item.desc||'') + '"'
      + ' style="' + (soldout ? 'opacity:.6' : '') + '">'
      + (esTopVentas ? '<span class="tag-top-ventas">Top ventas</span>' : '')
      + '<div class="item-info">'
      + '<div class="item-name" style="' + (soldout ? 'text-decoration:line-through' : '') + '">' + formatNombreConBadgeNuevo(nombreParaBadge) + '</div>'
      + '<div class="item-desc">' + (soldout ? '❌ Agotado hoy' : item.desc) + '</div>'
      + '</div>'
      + '<div class="item-price">' + item.price.toFixed(2) + ' €</div>'
      + '<div class="item-controls">' + controls + '</div>'
      + '</div>';
  }).join('');
  grid.innerHTML = html;
}
// ── CONFIG ──
function loadAdminConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
    document.getElementById('cfg-pk').value = c.emailjs_public_key || CONFIG.emailjs_public_key;
    document.getElementById('cfg-svc').value = c.emailjs_service_id || CONFIG.emailjs_service_id;
    document.getElementById('cfg-tpl').value = c.emailjs_template_id || CONFIG.emailjs_template_id;
  } catch {}
  if (window.fb_loadConfig) {
    window.fb_loadConfig().then(c => {
      if (!c) return;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
      Object.assign(CONFIG, c);
      try {
        document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
        document.getElementById('cfg-pk').value = c.emailjs_public_key || CONFIG.emailjs_public_key;
        document.getElementById('cfg-svc').value = c.emailjs_service_id || CONFIG.emailjs_service_id;
        document.getElementById('cfg-tpl').value = c.emailjs_template_id || CONFIG.emailjs_template_id;
      } catch {}
    }).catch(() => {});
  }
}
function saveConfig() {
  // Fusionar con lo ya guardado (en vez de sobreescribir todo el objeto)
  // para no perder otros ajustes guardados bajo la misma clave, como
  // modifyWindowMins.
  let c = {};
  try { c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch {}
  c.store_email = document.getElementById('cfg-email').value.trim();
  c.emailjs_public_key = document.getElementById('cfg-pk').value.trim();
  c.emailjs_service_id = document.getElementById('cfg-svc').value.trim();
  c.emailjs_template_id = document.getElementById('cfg-tpl').value.trim();
  localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  Object.assign(CONFIG, c);
  if (window.fb_saveConfig) window.fb_saveConfig(c).catch(() => {});
  showToast('cfg-toast');
}
function loadConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    if (c.store_email) Object.assign(CONFIG, c);
  } catch {}
}

// ── HORARIO ──
const DIAS_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function toggleDia(btn) {
  btn.classList.toggle('activo');
}
function verDiasGuardados() {
  const NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const raw = localStorage.getItem('dpf_horario');
  const el = document.getElementById('dias-diagnostico');
  let html = '';
  if (!raw) {
    html = '⚠️ Sin configuración guardada — se usan valores por defecto (Mar–Dom)<br>';
  } else {
    try {
      const h = JSON.parse(raw);
      const dias = h.diasAbiertos;
      const hoy = new Date().getDay();
      if (!dias || !dias.length) {
        html += '⚠️ diasAbiertos vacío → cerrado todos los días<br>';
      } else {
        html += '✅ Días: ' + dias.map(d => NOMBRES[d] + '(' + d + ')').join(', ') + '<br>';
        html += (dias.includes(hoy) ? '✅' : '❌') + ' Hoy es ' + NOMBRES[hoy] + '(' + hoy + ') → ' + (dias.includes(hoy) ? 'día abierto' : 'día CERRADO') + '<br>';
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const sessions = [{
        label: 'Mañanas',
        open: h.manOpen,
        close: h.manClose
      }, {
        label: 'Tardes',
        open: h.tarOpen,
        close: h.tarClose
      }].filter(s => s.open && s.close);
      if (!sessions.length) {
        html += '⚠️ Sin horario configurado<br>';
      } else {
        sessions.forEach(s => {
          const _s$open$split$map = s.open.split(':').map(Number),
            _s$open$split$map2 = _slicedToArray(_s$open$split$map, 2),
            oh = _s$open$split$map2[0],
            om = _s$open$split$map2[1];
          const _s$close$split$map = s.close.split(':').map(Number),
            _s$close$split$map2 = _slicedToArray(_s$close$split$map, 2),
            ch = _s$close$split$map2[0],
            cm = _s$close$split$map2[1];
          const oMin = oh * 60 + om,
            cMin = ch * 60 + cm;
          const dentro = nowMin >= oMin && nowMin < cMin;
          html += (dentro ? '✅' : '⏰') + ' ' + s.label + ': ' + s.open + '–' + s.close + (dentro ? ' ← AHORA ABIERTO' : '') + '<br>';
        });
        html += '🕐 Hora actual: ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      }
    } catch (e) {
      html = '❌ Error: ' + e.message;
    }
  }
  el.innerHTML = html;
}
function resetDiasMartDom() {
  if (!confirm('¿Resetear los días abiertos a Martes–Domingo y guardar?')) return;
  const raw = localStorage.getItem('dpf_horario');
  let h = {};
  try {
    h = JSON.parse(raw || '{}');
  } catch {}
  h.diasAbiertos = [2, 3, 4, 5, 6, 0]; // Mar, Mié, Jue, Vie, Sáb, Dom
  localStorage.setItem('dpf_horario', JSON.stringify(h));
  if (window.fb_saveHorario) {
    window.fb_saveHorario(h).catch(e => console.warn('Error guardando horario en Firebase:', e));
  }
  loadAdminHorario();
  verDiasGuardados();
  showToast('local-toast');
  logActivity('🕐 Días reseteados a Martes–Domingo');
}
function _applyHorarioToUI(h) {
  if (!h) return;
  if (h.manOpen) document.getElementById('h-man-open').value = h.manOpen;
  if (h.manClose) document.getElementById('h-man-close').value = h.manClose;
  if (h.tarOpen) document.getElementById('h-tar-open').value = h.tarOpen;
  if (h.tarClose) document.getElementById('h-tar-close').value = h.tarClose;
  const closedMsgMidEl = document.getElementById('h-closed-msg-mid');
  const closedMsgNightEl = document.getElementById('h-closed-msg-night');
  const closedMsgDayEl = document.getElementById('h-closed-msg-day');
  if (closedMsgMidEl && h.closedMsgMid) closedMsgMidEl.value = h.closedMsgMid;
  if (closedMsgNightEl && h.closedMsgNight) closedMsgNightEl.value = h.closedMsgNight;
  if (closedMsgDayEl && h.closedMsgDay) closedMsgDayEl.value = h.closedMsgDay;
  const diasActivos = h.diasAbiertos && h.diasAbiertos.length ? h.diasAbiertos : [2, 3, 4, 5, 6, 0];
  const marcarDias = () => {
    document.querySelectorAll('.dia-btn').forEach(btn => {
      btn.classList.toggle('activo', diasActivos.includes(parseInt(btn.dataset.day)));
    });
  };
  marcarDias();
  setTimeout(marcarDias, 100);
}
function loadAdminHorario() {
  // Cargar inmediatamente desde localStorage (respuesta rápida)
  try {
    const hLocal = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    _applyHorarioToUI(hLocal);
  } catch (e) {}
  // Luego cargar desde Firebase (fuente de verdad) y sobreescribir si hay datos
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
        _applyHorarioToUI(hFb);
        loadOrdersStatus(); // re-evaluar apertura con el horario correcto
        updateFooterHorario(hFb);
      }
    }).catch(e => console.warn('Error cargando horario de Firebase:', e));
  }
  loadSlotTurnosUI();
}
function saveHorario() {
  let diasAbiertos = [];
  document.querySelectorAll('.dia-btn.activo').forEach(btn => {
    diasAbiertos.push(parseInt(btn.dataset.day));
  });
  // Si no hay ningún día marcado, conservar los guardados anteriormente o usar Mar-Dom
  if (!diasAbiertos.length) {
    try {
      const prev = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
      diasAbiertos = prev.diasAbiertos && prev.diasAbiertos.length ? prev.diasAbiertos : [2, 3, 4, 5, 6, 0];
    } catch {
      diasAbiertos = [2, 3, 4, 5, 6, 0];
    }
  }
  const manOpen = document.getElementById('h-man-open') ? document.getElementById('h-man-open').value : '';
  const manClose = document.getElementById('h-man-close') ? document.getElementById('h-man-close').value : '';
  const tarOpen = document.getElementById('h-tar-open') ? document.getElementById('h-tar-open').value : '';
  const tarClose = document.getElementById('h-tar-close') ? document.getElementById('h-tar-close').value : '';
  // Estos 3 campos no tienen valor por defecto en el HTML (solo
  // placeholder) y solo se rellenan cuando termina de cargar el horario
  // desde Firebase (loadAdminHorario). Si se guarda en un dispositivo/
  // sesión nueva antes de que esa carga termine, los campos están vacíos
  // en pantalla sin que el admin haya tocado nada — así que si están
  // vacíos aquí, se conserva el mensaje personalizado que ya hubiera
  // guardado antes, en vez de borrarlo sin querer.
  let _hPrev = {};
  try { _hPrev = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}'); } catch {}
  const closedMsgMidRaw = document.getElementById('h-closed-msg-mid') ? document.getElementById('h-closed-msg-mid').value.trim() : '';
  const closedMsgNightRaw = document.getElementById('h-closed-msg-night') ? document.getElementById('h-closed-msg-night').value.trim() : '';
  const closedMsgDayRaw = document.getElementById('h-closed-msg-day') ? document.getElementById('h-closed-msg-day').value.trim() : '';
  const closedMsgMid = closedMsgMidRaw || _hPrev.closedMsgMid || '';
  const closedMsgNight = closedMsgNightRaw || _hPrev.closedMsgNight || '';
  const closedMsgDay = closedMsgDayRaw || _hPrev.closedMsgDay || '';
  const h = {
    manOpen,
    manClose,
    tarOpen,
    tarClose,
    diasAbiertos,
    closedMsgMid,
    closedMsgNight,
    closedMsgDay
  };
  localStorage.setItem(HORARIO_KEY, JSON.stringify(h));
  // Guardar también en Firebase para sincronizar con otros dispositivos y cuentas
  if (window.fb_saveHorario) {
    window.fb_saveHorario(h).catch(e => console.warn("Error guardando horario en Firebase:", e));
  }
  updateFooterHorario(h);
  showToast('local-toast');
  logActivity('🕐 Horario actualizado — Días: ' + diasAbiertos.map(d => DIAS_NAMES[d]).join(', '));
}
const DIAS_RANGES = [{
  dias: [1, 2, 3, 4, 5, 6, 0],
  label: 'Lunes a Domingo'
}, {
  dias: [2, 3, 4, 5, 6, 0],
  label: 'Martes a Domingo'
}, {
  dias: [1, 2, 3, 4, 5, 6],
  label: 'Lunes a Sábado'
}, {
  dias: [2, 3, 4, 5, 6],
  label: 'Martes a Sábado'
}, {
  dias: [1, 2, 3, 4, 5],
  label: 'Lunes a Viernes'
}, {
  dias: [6, 0],
  label: 'Sábado y Domingo'
}];
function diasLabel(diasAbiertos) {
  const sorted = [...diasAbiertos].sort((a, b) => a - b);
  const match = DIAS_RANGES.find(r => r.dias.length === sorted.length && r.dias.every(d => sorted.includes(d)));
  if (match) return match.label;
  const DIAS_FULL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return diasAbiertos.map(d => DIAS_FULL[d]).join(', ');
}
function updateFooterHorario(h) {
  const footer = document.getElementById('footer-horario');
  if (footer) {
    var _h$diasAbiertos;
    const diasAbiertos = (_h$diasAbiertos = h.diasAbiertos) !== null && _h$diasAbiertos !== void 0 ? _h$diasAbiertos : [2, 3, 4, 5, 6, 0];
    footer.textContent = '🕐 ' + diasLabel(diasAbiertos) + ' · Mañanas ' + h.manOpen + '–' + h.manClose + ' · Tardes ' + h.tarOpen + '–' + h.tarClose;
  }
  const patatas = document.getElementById('footer-patatas');
  if (patatas) patatas.textContent = '🥔 Patatas asadas a partir de las 19:30h';
}

// ── ABIERTO/CERRADO ──
function loadOpenStatus() {
  const open = localStorage.getItem(OPEN_KEY) !== 'false';
  updateOpenBtn(open);
  if (window.fb_loadOpenLocal) {
    window.fb_loadOpenLocal().then(val => {
      if (val === null || val === undefined) return;
      localStorage.setItem(OPEN_KEY, String(val));
      const openBool = val === true || val === 'true';
      updateOpenBtn(openBool);
      updateHeroDot(openBool);
    }).catch(() => {});
  }
}
function toggleOpenStatus() {
  const current = localStorage.getItem(OPEN_KEY) !== 'false';
  const next = !current;
  localStorage.setItem(OPEN_KEY, String(next));
  if (!next) {
    localStorage.setItem('dpf_open_manual_override', '1');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
    firebase.database().ref('config/openManualOverride').set(true).catch(() => {});
  } else {
    localStorage.removeItem('dpf_open_manual_override');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
    firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
  }
  updateOpenBtn(next);
  updateHeroDot(next);
  logActivity("\uD83C\uDFEA Local marcado como: ".concat(next ? 'ABIERTO' : 'CERRADO'));
}
function updateOpenBtn(open) {
  const btn = document.getElementById('open-toggle-btn');
  if (!btn) return;
  btn.className = 'open-toggle ' + (open ? 'abierto' : 'cerrado');
  btn.textContent = open ? '✅ Abierto ahora' : '❌ Cerrado ahora';
}
function updateHeroDot(open) {
  const dot = document.querySelector('.dot');
  const pill = document.querySelector('.hero-pill');
  if (!dot || !pill) return;
  dot.style.background = open ? '#5ECC76' : '#e74c3c';
  pill.querySelector('span') && (pill.querySelector('span').textContent = open ? 'Abierto ahora' : 'Cerrado ahora');
}

// ── AVISO DE CIERRE AUTOMÁTICO ──
function getMinutes(timeStr, isClose) {
  if (!timeStr) return null;
  const _timeStr$split$map = timeStr.split(':').map(Number),
    _timeStr$split$map2 = _slicedToArray(_timeStr$split$map, 2),
    h = _timeStr$split$map2[0],
    m = _timeStr$split$map2[1];
  if (isNaN(h)) return null;
  const mins = h * 60 + m;
  // 00:00 como hora de cierre significa medianoche = fin del día (1440 min)
  return isClose && mins === 0 ? 1440 : mins;
}
function checkAutoCloseWarning() {
  var _h$diasAbiertos2;
  const manualOpen = localStorage.getItem('dpf_open') !== 'false';
  let h;
  try {
    h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
  } catch {
    return;
  }
  const now = new Date();
  // Mismo criterio de "día de servicio" que isOutsideHours()/isTodayOpen():
  // antes de las 06:00 se trata como parte del día anterior (y su minuto se
  // extiende +1440) — sin esto, un cierre después de medianoche (ej. 00:30)
  // hacía que este punto verde/rojo dijera "cerrado" o "día cerrado"
  // contradiciendo al formulario de pedido, que con isOutsideHours() ya
  // corregido seguía activo debajo.
  const nowMin = (now.getHours() < 6) ? (now.getHours() * 60 + now.getMinutes() + 1440) : (now.getHours() * 60 + now.getMinutes());

  // Bloquear pedidos si hoy es día cerrado (independientemente del toggle manual)
  const todayDay = (now.getHours() < 6) ? (now.getDay() + 6) % 7 : now.getDay();
  const diasAbiertos = (_h$diasAbiertos2 = h.diasAbiertos) !== null && _h$diasAbiertos2 !== void 0 ? _h$diasAbiertos2 : [2, 3, 4, 5, 6, 0];
  if (!diasAbiertos.includes(todayDay)) {
    const dot2 = document.querySelector('.dot');
    const statusEl2 = document.getElementById('hero-status-text');
    const existingBanner2 = document.getElementById('closing-soon-banner');
    if (dot2) dot2.style.background = '#e74c3c';
    if (statusEl2) statusEl2.textContent = 'Cerrado hoy';
    if (existingBanner2) existingBanner2.remove();
    // Calcular próximo día abierto con su hora de apertura
    const sessions = [{
      open: h.manOpen,
      close: h.manClose
    }, {
      open: h.tarOpen,
      close: h.tarClose
    }].filter(s => s.open && s.close).sort((a, b) => {
      const _a$open$split$map = a.open.split(':').map(Number),
        _a$open$split$map2 = _slicedToArray(_a$open$split$map, 2),
        ah = _a$open$split$map2[0],
        am = _a$open$split$map2[1];
      const _b$open$split$map = b.open.split(':').map(Number),
        _b$open$split$map2 = _slicedToArray(_b$open$split$map, 2),
        bh = _b$open$split$map2[0],
        bm = _b$open$split$map2[1];
      return ah * 60 + am - (bh * 60 + bm);
    });
    const firstSession = sessions[0];
    let nextDayLabel = 'mañana';
    if (diasAbiertos.length) {
      for (let i = 1; i <= 7; i++) {
        const candidate = (todayDay + i) % 7;
        if (diasAbiertos.includes(candidate)) {
          if (i === 1) nextDayLabel = 'mañana';else {
            const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            nextDayLabel = 'el ' + nombres[candidate];
          }
          break;
        }
      }
    }
    const closedDayMsg = h.closedMsgDay || (firstSession ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + ' a las ' + firstSession.open + '!' : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + '!');
    // Cerrar formulario de pedidos como si estuviera pausado
    const banner = document.getElementById('orders-closed-banner');
    const bannerMsg = document.getElementById('orders-closed-msg');
    const orderForm = document.getElementById('order-form');
    const totalRow = document.getElementById('cart-total-row');
    const lockedMsg = document.getElementById('cart-locked-msg');
    const lockedDetail = document.getElementById('cart-locked-detail');
    if (banner) {
      banner.style.display = 'block';
    }
    if (bannerMsg) bannerMsg.textContent = closedDayMsg;
    if (orderForm) orderForm.style.display = 'none';
    if (totalRow) totalRow.style.display = 'none';
    if (lockedMsg) lockedMsg.style.display = 'block';
    if (lockedDetail) lockedDetail.textContent = closedDayMsg;
    return;
  }

  // Si el toggle manual está cerrado, no seguir con la lógica de horario
  if (!manualOpen) return;
  // Franja continua: igual que en isOutsideHours, el negocio está abierto
  // de forma ininterrumpida desde manOpen hasta tarClose (sin hueco a
  // mediodía). manOpen/tarClose siguen editándose por separado en el panel,
  // pero aquí solo se usan los extremos.
  const openStartMin = getMinutes(h.manOpen) ?? getMinutes(h.tarOpen);
  let closeEndMin = getMinutes(h.tarClose, true) ?? getMinutes(h.manClose, true);
  // Si cierra después de medianoche, expresarlo en el mismo espacio
  // extendido que nowMin (ver más arriba) para poder comparar de forma
  // continua — mismo arreglo que en isOutsideHours().
  if (openStartMin !== null && closeEndMin !== null && closeEndMin < openStartMin) {
    closeEndMin += 1440;
  }
  const sessions = (openStartMin !== null && closeEndMin !== null)
    ? [{ open: openStartMin, close: closeEndMin }]
    : [];
  const dot = document.querySelector('.dot');
  const statusEl = document.getElementById('hero-status-text');
  if (!dot || !statusEl) return;
  const existingBanner = document.getElementById('closing-soon-banner');
  const activeSession = sessions.find(s => nowMin >= s.open && nowMin < s.close);
  if (activeSession) {
    const minsLeft = activeSession.close - nowMin;
    if (minsLeft <= 30) {
      dot.style.background = '#F5A623';
      statusEl.textContent = minsLeft <= 1 ? 'Cerramos ahora' : "Cerramos en ".concat(minsLeft, " min");
      if (!existingBanner) {
        const banner = document.createElement('div');
        banner.id = 'closing-soon-banner';
        banner.style.cssText = 'background:#FFF3CD;border-bottom:2px solid #3D1F0D;color:#7A4A00;text-align:center;padding:12px 24px;font-size:14px;font-weight:600;font-family:\'DM Sans\',sans-serif;display:flex;align-items:center;justify-content:center';
        banner.innerHTML = '<span style="font-size:18px">⏰</span><span id="closing-banner-text"></span>';
        const ref = document.getElementById('orders-closed-banner');
        ref.parentNode.insertBefore(banner, ref);
      }
      const bt = document.getElementById('closing-banner-text');
      if (bt) bt.textContent = minsLeft <= 1 ? '¡Cerramos ahora! Último momento para hacer tu pedido.' : "Cerramos en ".concat(minsLeft, " minuto").concat(minsLeft !== 1 ? 's' : '', ". \xA1Date prisa!");
    } else {
      // Respetar cierre manual del admin
      if (localStorage.getItem('dpf_open_manual_override')) {
        dot.style.background = '#e74c3c';
        statusEl.textContent = 'Cerrado ahora';
      } else {
        dot.style.background = '#5ECC76';
        statusEl.textContent = 'Abierto ahora';
        if (existingBanner) existingBanner.remove();
      }
    }
  } else {
    const nextOpen = sessions.filter(s => s.open > nowMin).sort((a, b) => a.open - b.open)[0];
    dot.style.background = '#e74c3c';
    if (nextOpen) {
      const hh = Math.floor(nextOpen.open / 60).toString().padStart(2, '0');
      const mm = (nextOpen.open % 60).toString().padStart(2, '0');
      statusEl.textContent = "Abrimos a las ".concat(hh, ":").concat(mm);
    } else {
      statusEl.textContent = 'Cerrado ahora';
    }
    if (existingBanner) existingBanner.remove();
  }
}
checkAutoCloseWarning();
// El intervalo de re-chequeo automático se registra en aplicarEstadoInicial (initConHorarioFirebase)
// para evitar duplicados. No registrar otro aquí.

// ── CONTRASEÑA ──
async function changePwd() {
  const old = document.getElementById('pwd-old').value;
  const n1 = document.getElementById('pwd-new').value;
  const n2 = document.getElementById('pwd-rep').value;
  const err = document.getElementById('pwd-error');
  err.textContent = '';
  const oldHash = await hashAdminPwd(old);
  if (oldHash !== getAdminPwd()) {
    err.textContent = 'La contraseña actual es incorrecta';
    return;
  }
  if (n1.length < 6) {
    err.textContent = 'La nueva contraseña debe tener al menos 6 caracteres';
    return;
  }
  if (n1 !== n2) {
    err.textContent = 'Las contraseñas no coinciden';
    return;
  }
  const newHash = await hashAdminPwd(n1);
  localStorage.setItem(ADMIN_PWD_KEY, newHash);
  if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(newHash).catch(() => {});
  document.getElementById('pwd-old').value = '';
  document.getElementById('pwd-new').value = '';
  document.getElementById('pwd-rep').value = '';
  showToast('pwd-toast');
  logActivity('🔑 Contraseña de administración cambiada');
}
const ORDERS_KEY = 'dpf_orders_open';
const ORDERS_MSG_KEY = 'dpf_orders_msg';
const STATS_KEY = 'dpf_day_stats';
// ── GASTOS DE GESTIÓN ──
const FEE_ENABLED_KEY = 'dpf_fee_enabled';
const FEE_AMOUNT_KEY = 'dpf_fee_amount';
const FEE_LABEL_KEY = 'dpf_fee_label';
function getFeeEnabled() {
  return localStorage.getItem(FEE_ENABLED_KEY) === 'true';
}
function getFeeAmount() {
  return parseFloat(localStorage.getItem(FEE_AMOUNT_KEY) || '0.50');
}
function getFeeLabel() {
  return localStorage.getItem(FEE_LABEL_KEY) || 'Gastos de gestión online';
}
// El código de "pedido desde el local" debe librar SIEMPRE del gasto que
// sea de gestión — pero cuál de los dos gastos fijos (el primero o el
// segundo) es "el de gestión" depende de cómo los haya nombrado el admin
// desde el panel, no de en qué orden se crearon. Por eso se identifica por
// el texto de su etiqueta ("gestión"/"gestion"), no por ser fee1 o fee2 —
// así funciona bien aunque se hayan configurado al revés de lo esperado.
function _esEtiquetaDeGestion(label) {
  const l = (label || '').toLowerCase();
  return l.includes('gestión') || l.includes('gestion');
}
function saveFeeConfig(enabled, amount, label) {
  localStorage.setItem(FEE_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE_LABEL_KEY, label);
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function () {});
  renderCart();
  logActivity((enabled ? '\u2705' : '\u26d4') + ' Gastos de gesti\u00f3n ' + (enabled ? 'activados' : 'desactivados') + ' \u2014 ' + amount.toFixed(2) + '\u20ac');
}
function loadFeeFromFirebase() {
  // Lectura directa de una sola vez, además del listener en tiempo real de
  // abajo — si no, en una visita nueva getFeeEnabled() podía devolver
  // "desactivado" (el valor por defecto) durante los primeros segundos,
  // hasta que el listener recibiera su primer valor real; si el cliente
  // confirmaba el pedido en ese hueco, se quedaba sin cobrar el gasto fijo
  // aunque estuviera activado de verdad.
  if (window.fb_loadFeeConfig) {
    window.fb_loadFeeConfig().then(cfg => {
      if (!cfg) return;
      if (cfg.enabled !== undefined) localStorage.setItem(FEE_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
      if (cfg.amount !== undefined) localStorage.setItem(FEE_AMOUNT_KEY, String(cfg.amount));
      if (cfg.label !== undefined) localStorage.setItem(FEE_LABEL_KEY, cfg.label);
      renderCart();
    }).catch(() => {}).then(() => { window._feeConfigListo = true; });
  } else {
    window._feeConfigListo = true;
  }
  if (!window.fb_listenFeeConfig) return;
  window.fb_listenFeeConfig(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(FEE_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.amount !== undefined) localStorage.setItem(FEE_AMOUNT_KEY, String(cfg.amount));
    if (cfg.label !== undefined) localStorage.setItem(FEE_LABEL_KEY, cfg.label);
    renderCart();
  });
}
// ── SEGUNDO GASTO FIJO (independiente del anterior, con su propio interruptor) ──
const FEE2_ENABLED_KEY = 'dpf_fee2_enabled';
const FEE2_AMOUNT_KEY = 'dpf_fee2_amount';
const FEE2_LABEL_KEY = 'dpf_fee2_label';
function getFee2Enabled() {
  return localStorage.getItem(FEE2_ENABLED_KEY) === 'true';
}
function getFee2Amount() {
  return parseFloat(localStorage.getItem(FEE2_AMOUNT_KEY) || '0.50');
}
function getFee2Label() {
  return localStorage.getItem(FEE2_LABEL_KEY) || 'Otro gasto fijo';
}
function saveFee2Config(enabled, amount, label) {
  localStorage.setItem(FEE2_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE2_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE2_LABEL_KEY, label);
  if (window.fb_saveFee2Config) window.fb_saveFee2Config(enabled, amount, label).catch(function () {});
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' ' + label + ' ' + (enabled ? 'activado' : 'desactivado') + ' — ' + amount.toFixed(2) + '€');
}
function loadFee2FromFirebase() {
  // Lectura directa de una sola vez — mismo motivo que loadFeeFromFirebase():
  // sin esto, un cliente que confirmara el pedido muy rápido en una visita
  // nueva podía quedarse sin cobrar la bolsa (getFee2Enabled() devolvía
  // "desactivado" por defecto hasta que el listener recibiera el valor real).
  if (window.fb_loadFee2Config) {
    window.fb_loadFee2Config().then(cfg => {
      if (!cfg) return;
      if (cfg.enabled !== undefined) localStorage.setItem(FEE2_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
      if (cfg.amount !== undefined) localStorage.setItem(FEE2_AMOUNT_KEY, String(cfg.amount));
      if (cfg.label !== undefined) localStorage.setItem(FEE2_LABEL_KEY, cfg.label);
      renderCart();
    }).catch(() => {}).then(() => { window._fee2ConfigListo = true; });
  } else {
    window._fee2ConfigListo = true;
  }
  if (!window.fb_listenFee2Config) return;
  window.fb_listenFee2Config(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(FEE2_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.amount !== undefined) localStorage.setItem(FEE2_AMOUNT_KEY, String(cfg.amount));
    if (cfg.label !== undefined) localStorage.setItem(FEE2_LABEL_KEY, cfg.label);
    renderCart();
  });
}

// ── DESCUENTO ESTUDIANTE/JUBILADO (autodeclarado, se comprueba el carné al cobrar) ──
const STUDENT_DISCOUNT_ENABLED_KEY = 'dpf_student_discount_enabled';
const STUDENT_DISCOUNT_PCT_KEY = 'dpf_student_discount_pct';
function getStudentDiscountEnabled() {
  return localStorage.getItem(STUDENT_DISCOUNT_ENABLED_KEY) === 'true';
}
function getStudentDiscountPct() {
  return parseFloat(localStorage.getItem(STUDENT_DISCOUNT_PCT_KEY) || '10');
}
function saveStudentDiscountConfig(enabled, pct) {
  localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(pct));
  if (window.fb_saveStudentDiscountConfig) window.fb_saveStudentDiscountConfig(enabled, pct).catch(function () {});
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Descuento estudiante/jubilado ' + (enabled ? 'activado' : 'desactivado') + ' — ' + pct + '%');
}
function loadStudentDiscountFromFirebase() {
  // Mismo motivo que loadFeeFromFirebase()/loadFee2FromFirebase(): lectura
  // directa de una sola vez además del listener, para que en una visita
  // nueva la casilla no aparezca oculta/desactivada solo porque el
  // listener todavía no ha recibido su primer valor.
  if (window.fb_loadStudentDiscountConfig) {
    window.fb_loadStudentDiscountConfig().then(cfg => {
      if (!cfg) return;
      if (cfg.enabled !== undefined) localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
      if (cfg.pct !== undefined) localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(cfg.pct));
      renderCart();
    }).catch(() => {}).then(() => { window._studentDiscountConfigListo = true; });
  } else {
    window._studentDiscountConfigListo = true;
  }
  if (!window.fb_listenStudentDiscountConfig) return;
  window.fb_listenStudentDiscountConfig(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.pct !== undefined) localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(cfg.pct));
    renderCart();
  });
}

// ── CÓDIGO "PEDIDO DESDE EL LOCAL" (quita los gastos de gestión, no el otro gasto fijo) ──
// Para cuando hay cola y quieres que la gente pida desde el móvil sin que
// les cobre los gastos de gestión online — cambiable desde el panel en
// cualquier momento, para que no valga para siempre si alguien lo comparte.
const LOCAL_FEE_CODE_KEY = 'dpf_local_fee_code';
function getLocalFeeCode() {
  return (localStorage.getItem(LOCAL_FEE_CODE_KEY) || '').toUpperCase();
}
function saveLocalFeeCode(code) {
  const c = (code || '').trim().toUpperCase();
  localStorage.setItem(LOCAL_FEE_CODE_KEY, c);
  if (window.fb_saveLocalFeeCode) window.fb_saveLocalFeeCode(c).catch(function () {});
  logActivity('🏪 Código "pedido desde el local" actualizado: ' + (c || '(vacío)'));
}
function loadLocalFeeCodeFromFirebase() {
  if (!window.fb_listenLocalFeeCode) return;
  window.fb_listenLocalFeeCode(function (code) {
    localStorage.setItem(LOCAL_FEE_CODE_KEY, (code || '').toUpperCase());
    // El código real puede tardar en llegar de Firebase más de lo que
    // tarda en dispararse _aplicarCodigoLocalDesdeURL() (600ms fijos tras
    // cargar la página) — con conexión lenta en el local al escanear el
    // QR, la comprobación llegaba a hacerse ANTES de tener el código real
    // guardado, así que _modoLocalActivo() la daba por incorrecta y
    // cobraba de más el resto del pedido sin que el cliente lo notara.
    // Repetir la comprobación aquí, ahora que ya hay valor real, lo arregla
    // aunque haya llegado tarde.
    if (typeof _aplicarCodigoLocalDesdeURL === 'function') _aplicarCodigoLocalDesdeURL();
  });
}
function generarCodigoLocalNuevo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I, para no confundir al leerlo en voz alta
  let c = '';
  for (let i = 0; i < 4; i++) c += letras[Math.floor(Math.random() * letras.length)];
  const el = document.getElementById('tc-local-fee-code');
  if (el) el.value = c;
}
// Comprueba el código que escribió el cliente — sin distinguir mayúsculas/minúsculas
function _modoLocalActivo() {
  const input = document.getElementById('local-fee-code-input');
  const escrito = input ? input.value.trim().toUpperCase() : '';
  const real = getLocalFeeCode();
  return !!(real && escrito && escrito === real);
}
function comprobarCodigoLocal() {
  const activo = _modoLocalActivo();
  const input = document.getElementById('local-fee-code-input');
  const escrito = input ? input.value.trim() : '';
  ['local-fee-code-feedback', 'drawer-local-fee-code-feedback'].forEach(id => {
    const feedback = document.getElementById(id);
    if (!feedback) return;
    if (!escrito) {
      feedback.textContent = '';
    } else {
      feedback.textContent = activo ? '✅ Sin gastos de gestión aplicado' : '❌ Código incorrecto';
      feedback.style.color = activo ? '#27855a' : '#c0392b';
    }
  });
  renderCart();
}
// Si se llega con ?local=CODIGO en la URL (el cartel con QR del mostrador
// lleva a un enlace así), se rellena y se comprueba solo, sin que el
// cliente tenga que escribir nada — para eso sirve el QR.
async function _aplicarCodigoLocalDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get('local');
  if (!codigo) { window._localCodeListo = true; return; }
  try {
    // Esta función se puede volver a llamar sola (cuando el código real
    // llega de Firebase con retraso) — si para entonces el cliente ya está
    // escribiendo su nombre/teléfono, no le repintamos el carrito debajo
    // de los dedos; se reintenta en un momento en vez de perder el aviso
    // para siempre.
    const activo = document.activeElement;
    if (activo && (activo.tagName === 'INPUT' || activo.tagName === 'TEXTAREA') && activo.id !== 'local-fee-code-input' && activo.id !== 'drawer-local-fee-code-input') {
      setTimeout(_aplicarCodigoLocalDesdeURL, 2000);
      return; // window._localCodeListo sigue en false: se reintenta en 2s
    }
    const upper = codigo.trim().toUpperCase();
    const input = document.getElementById('local-fee-code-input');
    if (input) input.value = upper;
    // Lectura directa a Firebase (no fiarse solo de localStorage/del
    // listener en tiempo real) — en una visita nueva o en incógnito,
    // localStorage está vacío y el listener puede tardar más en recibir su
    // primer valor de lo que tarda el cliente en rellenar el formulario y
    // pulsar "Confirmar". Con esta lectura directa el dato real está listo
    // antes de seguir, en vez de esperar a que llegue por su cuenta.
    if (window.fb_loadLocalFeeCode) {
      try {
        const real = await window.fb_loadLocalFeeCode();
        localStorage.setItem(LOCAL_FEE_CODE_KEY, (real || '').toUpperCase());
      } catch (e) {
        console.warn('[local] no se pudo leer el código real de Firebase', e);
      }
    }
    console.log('[local] código desde URL:', upper, '| código guardado:', getLocalFeeCode(), '| ¿coinciden?', upper === getLocalFeeCode());
    comprobarCodigoLocal();
  } catch (e) {
    console.warn('[local] error aplicando código desde URL', e);
  }
  window._localCodeListo = true;
}
document.addEventListener('DOMContentLoaded', () => {
  if (new URLSearchParams(window.location.search).get('local')) window._localCodeListo = false;
  // Con margen, para dar tiempo a que renderCart() haya pintado ya el
  // carrito al menos una vez (si no, el interruptor de gastos de gestión
  // podría no estar listo todavía y no se mostraría el aviso de aplicado).
  setTimeout(_aplicarCodigoLocalDesdeURL, 600);
});

// ── Gate de config crítica antes de confirmar un pedido ──
// Antes, cada ajuste que dependía de Firebase (gastos de gestión, bolsa,
// código local...) se iba parcheando por separado cada vez que aparecía un
// caso de "a veces no se aplica a tiempo" (ver comentarios de arriba). En
// vez de seguir cazando estos casos uno a uno, submitOrder() espera a este
// punto de control único antes de calcular fees/total definitivos. En el
// caso normal (config ya cargada mucho antes de que el cliente termine de
// rellenar el formulario) esto no añade ninguna espera perceptible — solo
// entra en juego en una visita nueva/muy rápida, y como mucho espera
// maxMs antes de continuar igualmente con los valores que haya, para no
// dejar al cliente colgado si Firebase estuviera caído de verdad (para eso
// ya existe el aviso de "Firebase no disponible").
window._feeConfigListo = window._feeConfigListo || false;
window._fee2ConfigListo = window._fee2ConfigListo || false;
window._localCodeListo = window._localCodeListo === undefined ? true : window._localCodeListo;
window._studentDiscountConfigListo = window._studentDiscountConfigListo || false;
function esperarConfigCriticaLista(maxMs) {
  return new Promise(resolve => {
    const start = Date.now();
    (function chk() {
      const listo = window._feeConfigListo && window._fee2ConfigListo && window._localCodeListo && window._studentDiscountConfigListo;
      if (listo || Date.now() - start > maxMs) { resolve(); return; }
      setTimeout(chk, 80);
    })();
  });
}
const SLOTS_KEY = 'dpf_slots';
// ── CONFIGURACIÓN DEL TICKET ──
const TICKET_CONFIG_KEY = 'dpf_ticket_config';
const TICKET_CONFIG_DEFAULTS = {
  nombre: 'DULCE PATATA FOOD',
  direccion: 'Carretera de Málaga 111, Granada',
  telefono: '604 82 31 80',
  despedida: '¡Gracias por tu pedido! 🥔',
  textoPago: 'Pagar en caja',
  anchoPapel: 80,
  copias: 1,
  autoImprimir: true,
  letraGrande: false,
  qrHabilitado: false,
  qrContenido: ''
};
function getTicketConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(TICKET_CONFIG_KEY) || '{}');
    return Object.assign({}, TICKET_CONFIG_DEFAULTS, saved);
  } catch (e) {
    return Object.assign({}, TICKET_CONFIG_DEFAULTS);
  }
}
function saveTicketConfig(cfg) {
  localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveTicketConfig) window.fb_saveTicketConfig(cfg).catch(() => {});
  logActivity('🧾 Configuración del ticket actualizada');
}
function loadTicketConfigFromFirebase() {
  if (!window.fb_listenTicketConfig) return;
  window.fb_listenTicketConfig(function (cfg) {
    localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
    if (typeof bimbaPintarTicketConfig === 'function') bimbaPintarTicketConfig();
  });
}
function getOrdersOpen() {
  // Si estamos fuera de horario o hoy es día cerrado, siempre devolver false
  if (isOutsideHours() || !isTodayOpen()) return false;
  const val = localStorage.getItem(ORDERS_KEY);
  if (val === null || val === undefined) return true; // abierto por defecto
  return val !== 'false';
}
function toggleOrdersAccepting() {
  const next = !getOrdersOpen();
  localStorage.setItem(ORDERS_KEY, next);
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(() => {});
  // Un toggle manual gana siempre sobre la auto-pausa: se marca que este
  // estado ya NO lo puso el sistema (para que no lo "corrija" solo) y se le
  // da un margen antes de que la auto-pausa pueda volver a tocar nada \u2014 si
  // no, un reabrir manual con la cola todav\u00EDa alta se auto-pausar\u00EDa de
  // nuevo en cuanto entrara el siguiente pedido.
  _setAutoPausaEstado(false, Date.now() + AUTO_PAUSA_COOLDOWN_MS);
  // Un toggle manual tambi\u00E9n cancela cualquier pausa expr\u00E9s pendiente \u2014
  // si no, esta podr\u00EDa reabrir sola pasado su tiempo aunque el admin ya
  // haya decidido otra cosa en medio.
  if (_getPausaExpresHasta()) {
    localStorage.removeItem(PAUSA_EXPRES_HASTA_KEY);
    if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(0).catch(() => {});
    if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI();
  }
  updateOrdersUI(next);
  logActivity("\uD83D\uDEA6 Pedidos: ".concat(next ? 'ACTIVADOS' : 'PAUSADOS'));
}
function savePauseMsg() {
  const msg = document.getElementById('orders-pause-msg').value.trim();
  if (msg) {
    localStorage.setItem(ORDERS_MSG_KEY, msg);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(() => {});
  } else {
    localStorage.removeItem(ORDERS_MSG_KEY);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg('').catch(() => {});
  }
  updateOrdersUI(getOrdersOpen());
  showToast('local-toast');
}

// \u2500\u2500 AUTO-PAUSA POR SATURACI\u00D3N \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Si se acumulan demasiados pedidos pendientes (sin marcar "listo"), la web
// se pausa sola \u2014reutilizando el mismo mecanismo de "Pedidos pausados" de
// arriba, banner y candado en el carrito incluidos\u2014 y se reactiva sola en
// cuanto la cola baja, para que en hora punta no haga falta estar pendiente
// de pausar/reabrir a mano.
const AUTO_PAUSA_ENABLED_KEY = 'dpf_auto_pausa_enabled';
const AUTO_PAUSA_UMBRAL_KEY = 'dpf_auto_pausa_umbral';
const AUTO_PAUSA_MSG_KEY = 'dpf_auto_pausa_msg';
const AUTO_PAUSA_DEFAULT_MSG = '\uD83D\uDD25 Estamos a tope ahora mismo. Vuelve a intentarlo en unos minutos.';
const AUTO_PAUSA_DEFAULT_UMBRAL = 15;
// Para reabrir hace falta bajar del umbral con margen (no solo tocarlo
// justo) \u2014 si no, con la cola oscilando alrededor del umbral se abrir\u00EDa y
// cerrar\u00EDa sola una y otra vez.
const AUTO_PAUSA_HISTERESIS = 3;
const AUTO_PAUSA_ACTIVA_KEY = 'dpf_auto_pausa_activa'; // \u00BFla pausa actual la puso el sistema (no el admin)?
const AUTO_PAUSA_COOLDOWN_KEY = 'dpf_auto_pausa_cooldown';
const AUTO_PAUSA_COOLDOWN_MS = 3 * 60 * 1000;

function getAutoPausaConfig() {
  return {
    enabled: localStorage.getItem(AUTO_PAUSA_ENABLED_KEY) === 'true',
    umbral: parseInt(localStorage.getItem(AUTO_PAUSA_UMBRAL_KEY) || '', 10) || AUTO_PAUSA_DEFAULT_UMBRAL,
    msg: localStorage.getItem(AUTO_PAUSA_MSG_KEY) || AUTO_PAUSA_DEFAULT_MSG
  };
}
function saveAutoPausaConfig(enabled, umbral, msg) {
  localStorage.setItem(AUTO_PAUSA_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(AUTO_PAUSA_UMBRAL_KEY, String(umbral));
  localStorage.setItem(AUTO_PAUSA_MSG_KEY, msg);
  if (window.fb_saveAutoPausaConfig) window.fb_saveAutoPausaConfig(enabled, umbral, msg).catch(() => {});
  logActivity((enabled ? '\u2705' : '\u26D4') + ' Auto-pausa por saturaci\u00F3n ' + (enabled ? 'activada \u2014 a partir de ' + umbral + ' pedidos pendientes' : 'desactivada'));
  if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
}
function loadAutoPausaConfigFromFirebase() {
  if (!window.fb_listenAutoPausaConfig) return;
  window.fb_listenAutoPausaConfig(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(AUTO_PAUSA_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.umbral !== undefined) localStorage.setItem(AUTO_PAUSA_UMBRAL_KEY, String(cfg.umbral));
    if (cfg.msg !== undefined) localStorage.setItem(AUTO_PAUSA_MSG_KEY, cfg.msg);
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  });
}
function _getAutoPausaEstado() {
  return {
    activa: localStorage.getItem(AUTO_PAUSA_ACTIVA_KEY) === 'true',
    cooldownUntil: parseInt(localStorage.getItem(AUTO_PAUSA_COOLDOWN_KEY) || '', 10) || 0
  };
}
function _setAutoPausaEstado(activa, cooldownUntil) {
  localStorage.setItem(AUTO_PAUSA_ACTIVA_KEY, activa ? 'true' : 'false');
  localStorage.setItem(AUTO_PAUSA_COOLDOWN_KEY, String(cooldownUntil || 0));
  if (window.fb_saveAutoPausaEstado) window.fb_saveAutoPausaEstado(activa, cooldownUntil || 0).catch(() => {});
}
function loadAutoPausaEstadoFromFirebase() {
  if (!window.fb_listenAutoPausaEstado) return;
  window.fb_listenAutoPausaEstado(function (estado) {
    if (estado.activa !== undefined) localStorage.setItem(AUTO_PAUSA_ACTIVA_KEY, estado.activa ? 'true' : 'false');
    if (estado.cooldownUntil !== undefined) localStorage.setItem(AUTO_PAUSA_COOLDOWN_KEY, String(estado.cooldownUntil || 0));
  });
}
// Se llama cada vez que se repinta "Pedidos en vivo" con el n\u00BA de pedidos
// pendientes (sin marcar "listo"/"entregado"/"cancelado"). Solo pausa o
// reactiva pedidos \u2014 nunca toca el horario ni el estado "Local abierto".
function _comprobarAutoPausaSaturacion(pendientes) {
  const cfg = getAutoPausaConfig();
  if (!cfg.enabled) return;
  // Fuera de horario/d\u00EDa cerrado: eso ya cierra los pedidos por su cuenta
  // (getOrdersOpen), no hay saturaci\u00F3n que gestionar.
  if (isOutsideHours() || !isTodayOpen()) return;
  const estado = _getAutoPausaEstado();
  if (Date.now() < estado.cooldownUntil) return; // toggle manual reciente, no lo pisamos todav\u00EDa

  const open = getOrdersOpen();
  if (open && pendientes >= cfg.umbral) {
    localStorage.setItem(ORDERS_KEY, 'false');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
    localStorage.setItem(ORDERS_MSG_KEY, cfg.msg);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(cfg.msg).catch(() => {});
    _setAutoPausaEstado(true, 0);
    updateOrdersUI(false, cfg.msg);
    logActivity('\uD83D\uDD25 Pedidos pausados autom\u00E1ticamente \u2014 ' + pendientes + ' pedidos pendientes (umbral: ' + cfg.umbral + ')');
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  } else if (!open && estado.activa && pendientes <= Math.max(0, cfg.umbral - AUTO_PAUSA_HISTERESIS)) {
    localStorage.setItem(ORDERS_KEY, 'true');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    _setAutoPausaEstado(false, 0);
    updateOrdersUI(true);
    logActivity('\u2705 Pedidos reactivados autom\u00E1ticamente \u2014 ' + pendientes + ' pedidos pendientes');
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  } else if (typeof _renderAutoPausaUI === 'function') {
    _renderAutoPausaUI(pendientes);
  }
}
function toggleAutoPausaEnabled() {
  const cfg = getAutoPausaConfig();
  saveAutoPausaConfig(!cfg.enabled, cfg.umbral, cfg.msg);
}
function guardarAutoPausaConfig() {
  const umbralInput = document.getElementById('auto-pausa-umbral');
  const msgInput = document.getElementById('auto-pausa-msg');
  const parsedUmbral = parseInt(umbralInput && umbralInput.value, 10);
  const umbral = (isNaN(parsedUmbral) || parsedUmbral < 1) ? AUTO_PAUSA_DEFAULT_UMBRAL : parsedUmbral;
  const msg = (msgInput && msgInput.value.trim()) || AUTO_PAUSA_DEFAULT_MSG;
  saveAutoPausaConfig(getAutoPausaConfig().enabled, umbral, msg);
  showToast('local-toast');
}
function _renderAutoPausaUI(pendientesActuales) {
  const cfg = getAutoPausaConfig();
  const btn = document.getElementById('auto-pausa-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '\u2705 Activada' : '\u26D4 Desactivada';
  }
  const umbralInput = document.getElementById('auto-pausa-umbral');
  if (umbralInput && document.activeElement !== umbralInput) umbralInput.value = cfg.umbral;
  const msgInput = document.getElementById('auto-pausa-msg');
  if (msgInput && document.activeElement !== msgInput) msgInput.value = cfg.msg;
  const estadoEl = document.getElementById('auto-pausa-estado-texto');
  if (estadoEl) {
    if (!cfg.enabled) {
      estadoEl.textContent = '';
    } else {
      const estado = _getAutoPausaEstado();
      const pendientes = pendientesActuales !== undefined ? pendientesActuales : (window._activosCache || []).length;
      estadoEl.textContent = estado.activa
        ? '\uD83D\uDD25 Pausado autom\u00E1ticamente ahora mismo (' + pendientes + ' pedidos pendientes)'
        : 'Ahora mismo: ' + pendientes + ' / ' + cfg.umbral + ' pedidos pendientes';
    }
  }
}

// \u2500\u2500 PAUSA EXPR\u00C9S (pausa temporal con cuenta atr\u00E1s) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Para cuando sabes que el pico va a durar poco y no quieres tener que
// acordarte de reactivar los pedidos t\u00FA misma \u2014 se reabre sola pasado el
// tiempo, sin depender de que baje la cola (a diferencia de la auto-pausa
// por saturaci\u00F3n, que solo mira el n\u00BA de pedidos pendientes).
const PAUSA_EXPRES_HASTA_KEY = 'dpf_pausa_expres_hasta';
function _getPausaExpresHasta() {
  return parseInt(localStorage.getItem(PAUSA_EXPRES_HASTA_KEY) || '', 10) || 0;
}
function pausarExpres(minutos) {
  const hasta = Date.now() + minutos * 60 * 1000;
  localStorage.setItem(ORDERS_KEY, 'false');
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
  localStorage.setItem(PAUSA_EXPRES_HASTA_KEY, String(hasta));
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(hasta).catch(() => {});
  // No debe considerarse una auto-pausa (para que la auto-pausa por
  // saturaci\u00F3n no la reabra antes de tiempo ni la vuelva a tocar).
  _setAutoPausaEstado(false, hasta);
  const horaReapertura = new Date(hasta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const msg = '\u23F1\uFE0F Pausado temporalmente. Volvemos sobre las ' + horaReapertura + '.';
  localStorage.setItem(ORDERS_MSG_KEY, msg);
  if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(() => {});
  updateOrdersUI(false, msg);
  logActivity('\u23F1\uFE0F Pausa expr\u00E9s activada: ' + minutos + ' min (reabre a las ' + horaReapertura + ')');
  _renderPausaExpresUI();
}
function _comprobarPausaExpres() {
  const hasta = _getPausaExpresHasta();
  if (!hasta) return;
  if (Date.now() >= hasta) {
    localStorage.removeItem(PAUSA_EXPRES_HASTA_KEY);
    if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(0).catch(() => {});
    // Solo reabre si nadie ha vuelto a tocar el toggle manual mientras tanto
    // (toggleOrdersAccepting ya limpia esta clave al pulsarlo).
    if (localStorage.getItem(ORDERS_KEY) === 'false') {
      localStorage.setItem(ORDERS_KEY, 'true');
      if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
      updateOrdersUI(true);
      logActivity('\u2705 Pausa expr\u00E9s terminada \u2014 pedidos reactivados');
    }
    _renderPausaExpresUI();
  }
}
function loadPausaExpresFromFirebase() {
  if (!window.fb_listenPausaExpresHasta) return;
  window.fb_listenPausaExpresHasta(function (hasta) {
    localStorage.setItem(PAUSA_EXPRES_HASTA_KEY, String(hasta || 0));
    _renderPausaExpresUI();
  });
}
function _renderPausaExpresUI() {
  const el = document.getElementById('pausa-expres-estado-texto');
  if (!el) return;
  const hasta = _getPausaExpresHasta();
  if (!hasta || Date.now() >= hasta) {
    el.textContent = '';
    return;
  }
  const horaReapertura = new Date(hasta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const minutosRestantes = Math.max(1, Math.round((hasta - Date.now()) / 60000));
  el.textContent = '\u23F1\uFE0F Pausa expr\u00E9s activa \u2014 reabre a las ' + horaReapertura + ' (~' + minutosRestantes + ' min)';
}
// Comprobaci\u00F3n peri\u00F3dica: nada m\u00E1s dispara esto si no llega ning\u00FAn pedido
// nuevo mientras dura la pausa.
setInterval(() => {
  if (typeof _comprobarPausaExpres === 'function') _comprobarPausaExpres();
}, 15000);

// \u2500\u2500 AVISO SUAVE DE SATURACI\u00D3N (previo a la auto-pausa) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Antes de llegar al punto de cerrar los pedidos del todo, avisa (sin
// bloquear) tanto al cliente ("va a tardar m\u00E1s de lo normal") como a cocina
// (sonido distinto) y empuja el selector de turno hacia horas m\u00E1s tarde \u2014
// para repartir mejor la carga en vez de amontonarla toda en el turno m\u00E1s
// pr\u00F3ximo.
const AVISO_SAT_ENABLED_KEY = 'dpf_aviso_sat_enabled';
const AVISO_SAT_UMBRAL_KEY = 'dpf_aviso_sat_umbral';
const AVISO_SAT_MSG_KEY = 'dpf_aviso_sat_msg';
const AVISO_SAT_SALTO_KEY = 'dpf_aviso_sat_salto_min';
const AVISO_SAT_MINPP_KEY = 'dpf_aviso_sat_minpp';
const AVISO_SAT_DEFAULT_MSG = '\u23F3 Hay bastante ambiente ahora mismo, tu pedido tardar\u00E1 m\u00E1s de lo habitual.';
const AVISO_SAT_DEFAULT_UMBRAL = 8;
const AVISO_SAT_DEFAULT_SALTO_MIN = 30;
const AVISO_SAT_DEFAULT_MINPP = 3;
function getAvisoSaturacionConfig() {
  return {
    enabled: localStorage.getItem(AVISO_SAT_ENABLED_KEY) === 'true',
    umbral: parseInt(localStorage.getItem(AVISO_SAT_UMBRAL_KEY) || '', 10) || AVISO_SAT_DEFAULT_UMBRAL,
    msg: localStorage.getItem(AVISO_SAT_MSG_KEY) || AVISO_SAT_DEFAULT_MSG,
    minutosSalto: parseInt(localStorage.getItem(AVISO_SAT_SALTO_KEY) || '', 10) || AVISO_SAT_DEFAULT_SALTO_MIN,
    minPorPedido: parseInt(localStorage.getItem(AVISO_SAT_MINPP_KEY) || '', 10) || AVISO_SAT_DEFAULT_MINPP
  };
}
function saveAvisoSaturacionConfig(enabled, umbral, msg, minutosSalto, minPorPedido) {
  localStorage.setItem(AVISO_SAT_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(AVISO_SAT_UMBRAL_KEY, String(umbral));
  localStorage.setItem(AVISO_SAT_MSG_KEY, msg);
  localStorage.setItem(AVISO_SAT_SALTO_KEY, String(minutosSalto));
  localStorage.setItem(AVISO_SAT_MINPP_KEY, String(minPorPedido));
  if (window.fb_saveAvisoSaturacionConfig) window.fb_saveAvisoSaturacionConfig(enabled, umbral, msg, minutosSalto, minPorPedido).catch(() => {});
  logActivity((enabled ? '\u2705' : '\u26D4') + ' Aviso previo de saturaci\u00F3n ' + (enabled ? 'activado \u2014 a partir de ' + umbral + ' pedidos pendientes' : 'desactivado'));
  _renderAvisoSaturacionUI();
}
function loadAvisoSaturacionFromFirebase() {
  if (!window.fb_listenAvisoSaturacionConfig) return;
  window.fb_listenAvisoSaturacionConfig(function (cfg) {
    if (cfg.enabled !== undefined) localStorage.setItem(AVISO_SAT_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.umbral !== undefined) localStorage.setItem(AVISO_SAT_UMBRAL_KEY, String(cfg.umbral));
    if (cfg.msg !== undefined) localStorage.setItem(AVISO_SAT_MSG_KEY, cfg.msg);
    if (cfg.minutosSalto !== undefined) localStorage.setItem(AVISO_SAT_SALTO_KEY, String(cfg.minutosSalto));
    if (cfg.minPorPedido !== undefined) localStorage.setItem(AVISO_SAT_MINPP_KEY, String(cfg.minPorPedido));
    _renderAvisoSaturacionUI();
  });
}
function toggleAvisoSaturacionEnabled() {
  const cfg = getAvisoSaturacionConfig();
  saveAvisoSaturacionConfig(!cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido);
}
function guardarAvisoSaturacionConfig() {
  const umbralInput = document.getElementById('aviso-sat-umbral');
  const msgInput = document.getElementById('aviso-sat-msg');
  const saltoInput = document.getElementById('aviso-sat-salto');
  const minppInput = document.getElementById('aviso-sat-minpp');
  const parsedUmbral = parseInt(umbralInput && umbralInput.value, 10);
  const umbral = (isNaN(parsedUmbral) || parsedUmbral < 1) ? AVISO_SAT_DEFAULT_UMBRAL : parsedUmbral;
  const parsedSalto = parseInt(saltoInput && saltoInput.value, 10);
  const minutosSalto = (isNaN(parsedSalto) || parsedSalto < 0) ? AVISO_SAT_DEFAULT_SALTO_MIN : parsedSalto;
  const parsedMinpp = parseInt(minppInput && minppInput.value, 10);
  const minPorPedido = (isNaN(parsedMinpp) || parsedMinpp < 0) ? AVISO_SAT_DEFAULT_MINPP : parsedMinpp;
  const msg = (msgInput && msgInput.value.trim()) || AVISO_SAT_DEFAULT_MSG;
  saveAvisoSaturacionConfig(getAvisoSaturacionConfig().enabled, umbral, msg, minutosSalto, minPorPedido);
  showToast('local-toast');
}
// Estimaci\u00F3n de espera para la pantalla de \u00E9xito: pendientes \u00D7 minutos/pedido
function _estimarMinutosEspera(pendientes) {
  const cfg = getAvisoSaturacionConfig();
  if (!cfg.enabled || pendientes < cfg.umbral) return 0;
  return pendientes * cfg.minPorPedido;
}
function _renderAvisoSaturacionUI() {
  const cfg = getAvisoSaturacionConfig();
  const btn = document.getElementById('aviso-sat-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '\u2705 Activado' : '\u26D4 Desactivado';
  }
  const umbralInput = document.getElementById('aviso-sat-umbral');
  if (umbralInput && document.activeElement !== umbralInput) umbralInput.value = cfg.umbral;
  const msgInput = document.getElementById('aviso-sat-msg');
  if (msgInput && document.activeElement !== msgInput) msgInput.value = cfg.msg;
  const saltoInput = document.getElementById('aviso-sat-salto');
  if (saltoInput && document.activeElement !== saltoInput) saltoInput.value = cfg.minutosSalto;
  const minppInput = document.getElementById('aviso-sat-minpp');
  if (minppInput && document.activeElement !== minppInput) minppInput.value = cfg.minPorPedido;
}
// \u00BFEst\u00E1 el nivel de "aviso" activo ahora mismo? (por debajo del umbral de
// auto-pausa \u2014si ya est\u00E1 pausado del todo, el banner de cerrado manda\u2014)
window._saturacionAvisoActiva = false;
function _actualizarAvisoSaturacion(pendientes) {
  const cfg = getAvisoSaturacionConfig();
  const banner = document.getElementById('aviso-saturacion-banner');
  const pausaCfg = getAutoPausaConfig();
  const yaPausado = pausaCfg.enabled && !getOrdersOpen();
  const activa = cfg.enabled && !yaPausado && pendientes >= cfg.umbral;
  const eraActiva = window._saturacionAvisoActiva;
  window._saturacionAvisoActiva = activa;
  if (banner) {
    banner.style.display = activa ? 'block' : 'none';
    banner.textContent = activa ? cfg.msg : '';
  }
  if (activa && !eraActiva && _adminLoggedIn && typeof playNotificationSound === 'function') {
    playNotificationSound('bip');
  }
  if (typeof renderSlotPicker === 'function') {
    const group = document.getElementById('slot-picker-group');
    if (group && group.style.display !== 'none') renderSlotPicker();
  }
}
function loadFeeUI() {
  const btn = document.getElementById('fee-toggle-btn');
  const amountInput = document.getElementById('fee-amount-input');
  const labelInput = document.getElementById('fee-label-input');
  if (!btn) return;
  const enabled = getFeeEnabled();
  btn.className = 'open-toggle ' + (enabled ? 'abierto' : 'cerrado');
  btn.textContent = enabled ? '✅ Gastos activados' : '⛔ Gastos desactivados';
  if (amountInput) amountInput.value = getFeeAmount().toFixed(2);
  if (labelInput) labelInput.value = getFeeLabel();
}
function toggleFeeEnabled() {
  const enabled = !getFeeEnabled();
  saveFeeConfig(enabled, getFeeAmount(), getFeeLabel());
  loadFeeUI();
  showToast('fee-toast');
}
function saveFeeFromPanel() {
  // Antes "|| 0.50" trataba un 0 escrito a propósito como si no se hubiera
  // escrito nada (0 es falsy en JS) y lo sustituía por 0,50€ sin avisar.
  const parsedAmount = parseFloat(document.getElementById('fee-amount-input').value);
  const amount = (isNaN(parsedAmount) || parsedAmount < 0) ? 0.50 : parsedAmount;
  const label = document.getElementById('fee-label-input').value.trim() || 'Gastos de gestión online';
  saveFeeConfig(getFeeEnabled(), amount, label);
  loadFeeUI();
  showToast('fee-toast');
}
function updateOrdersUI(open, customMsg) {
  const btn = document.getElementById('orders-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (open ? 'abierto' : 'cerrado');
    btn.textContent = open ? '✅ Aceptando pedidos' : '⏸️ Pedidos pausados';
  }
  const msg = customMsg || localStorage.getItem(ORDERS_MSG_KEY) || 'Estamos al límite de capacidad. Vuelve en unos minutos.';
  const banner = document.getElementById('orders-closed-banner');
  const bannerMsg = document.getElementById('orders-closed-msg');
  const orderForm = document.getElementById('order-form');
  const totalRow = document.getElementById('cart-total-row');
  const lockedMsg = document.getElementById('cart-locked-msg');
  const lockedDetail = document.getElementById('cart-locked-detail');
  if (banner) banner.style.display = open ? 'none' : 'block';
  if (bannerMsg) bannerMsg.textContent = msg;
  if (!open) {
    // Cerrado: ocultar formulario y total, mostrar candado
    if (orderForm) orderForm.style.display = 'none';
    if (totalRow) totalRow.style.display = 'none';
    if (lockedMsg) lockedMsg.style.display = 'block';
    if (lockedDetail) lockedDetail.textContent = msg;
  } else {
    // Abierto: ocultar candado, dejar que renderCart decida el resto
    if (lockedMsg) lockedMsg.style.display = 'none';
    renderCart();
  }
}
function isTodayOpen() {
  try {
    var _h$diasAbiertos3;
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    // Si no hay horario en localStorage aún (cuenta nueva / otro dispositivo),
    // asumir abierto — Firebase actualizará en cuanto responda
    const diasAbiertos = (_h$diasAbiertos3 = h.diasAbiertos) !== null && _h$diasAbiertos3 !== void 0 ? _h$diasAbiertos3 : [2, 3, 4, 5, 6, 0];
    // Día de servicio: antes de las 06:00 pertenece al día anterior
    const now = new Date();
    const serviceDay = (now.getHours() < 6)
      ? (now.getDay() + 6) % 7  // día anterior
      : now.getDay();
    return diasAbiertos.includes(serviceDay);
  } catch {
    return true;
  } // en caso de error, asumir abierto
}
function isOutsideHours() {
  try {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    if (!h.manOpen && !h.tarOpen) return false;
    const now = new Date();
    // Día de servicio: antes de las 06:00 tratamos la hora como 24h+ (ej: 00:30 → 1470 min)
    const rawMin = now.getHours() * 60 + now.getMinutes();
    const nowMin = (now.getHours() < 6) ? rawMin + 1440 : rawMin;

    // El negocio acepta pedidos de forma continua desde el inicio de la
    // sesión de mañana (manOpen) hasta el cierre de la sesión de noche
    // (tarClose), SIN tener en cuenta el hueco entre manClose y tarOpen
    // (ej: 13:45–18:00 sigue contando como "abierto" para pedidos, aunque
    // ese tramo no se muestre como sesión activa en el panel admin).
    // Los campos manOpen/manClose/tarOpen/tarClose se mantienen igual en
    // el panel para que sigan editándose por separado, pero a efectos de
    // "Abierto/Cerrado" solo importan los extremos: manOpen y tarClose.
    const openStart = getMinutes(h.manOpen) ?? getMinutes(h.tarOpen);
    const closeEnd = getMinutes(h.tarClose, true) ?? getMinutes(h.manClose, true);
    if (openStart === null || closeEnd === null) return false;

    // Si cierra después de medianoche (closeEnd < openStart), hay que expresar
    // closeEnd en el mismo "espacio extendido" que nowMin (que ya suma 1440
    // antes de las 06:00) para poder comparar de forma continua — antes
    // comparaba nowMin extendido contra closeEnd sin extender, así que entre
    // el cierre real (ej. 00:30) y las 06:00 nunca detectaba que ya había
    // cerrado (nowMin >= openStart seguía siendo cierto igual).
    const inSession = (closeEnd < openStart)
      ? (nowMin >= openStart && nowMin < closeEnd + 1440)
      : (nowMin >= openStart && nowMin < closeEnd);
    if (inSession) return false;
    // Fuera de la franja continua (ej: antes de manOpen o después de tarClose) → cerrado
    return true;
  } catch {
    return false;
  }
}
function loadOrdersStatus() {
  // Ejecutar inmediatamente con lo que hay en local (puede ser vacío)
  _ejecutarLoadOrdersStatus();
  // Siempre intentar cargar de Firebase en segundo plano y actualizar si hay cambios
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        const localRaw = localStorage.getItem(HORARIO_KEY);
        const localStr = localRaw ? JSON.stringify(JSON.parse(localRaw)) : '';
        const fbStr = JSON.stringify(hFb);
        if (fbStr !== localStr) {
          // Hay cambios — actualizar local y re-evaluar
          localStorage.setItem(HORARIO_KEY, fbStr);
          updateFooterHorario(hFb);
          _ejecutarLoadOrdersStatus();
        }
      }
    }).catch(() => {});
  }
}
function _ejecutarLoadOrdersStatus() {
  // Si hoy es día cerrado, bloquear pedidos con mensaje de próxima apertura
  if (!isTodayOpen()) {
    var _h2$diasAbiertos;
    const h2 = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const diasAbiertos2 = (_h2$diasAbiertos = h2.diasAbiertos) !== null && _h2$diasAbiertos !== void 0 ? _h2$diasAbiertos : [2, 3, 4, 5, 6, 0];
    const sessions2 = [{
      open: h2.manOpen,
      close: h2.manClose
    }, {
      open: h2.tarOpen,
      close: h2.tarClose
    }].filter(s => s.open && s.close).sort((a, b) => {
      const _a$open$split$map3 = a.open.split(':').map(Number),
        _a$open$split$map4 = _slicedToArray(_a$open$split$map3, 2),
        ah = _a$open$split$map4[0],
        am = _a$open$split$map4[1];
      const _b$open$split$map3 = b.open.split(':').map(Number),
        _b$open$split$map4 = _slicedToArray(_b$open$split$map3, 2),
        bh = _b$open$split$map4[0],
        bm = _b$open$split$map4[1];
      return ah * 60 + am - (bh * 60 + bm);
    });
    const firstSession2 = sessions2[0];
    const todayIdx2 = new Date().getDay();
    let nextDayLabel2 = 'mañana';
    for (let i = 1; i <= 7; i++) {
      const candidate = (todayIdx2 + i) % 7;
      if (diasAbiertos2.includes(candidate)) {
        if (i === 1) nextDayLabel2 = 'mañana';else {
          const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
          nextDayLabel2 = 'el ' + nombres[candidate];
        }
        break;
      }
    }
    const closedMsg2 = h2.closedMsgDay || (firstSession2 ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + ' a las ' + firstSession2.open + '!' : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + '!');
    updateOrdersUI(false, closedMsg2);
    return;
  }
  // Si estamos fuera del horario, mostrar cerrado con próxima apertura
  if (isOutsideHours()) {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    // La franja de apertura ahora es continua desde manOpen hasta tarClose
    // (sin hueco a mediodía), así que la única "próxima apertura" real es
    // manOpen — tarOpen ya no representa un segundo arranque independiente.
    const openStart = h.manOpen || h.tarOpen;
    var _hDias; const diasAbiertos = (_hDias = h.diasAbiertos) !== null && _hDias !== void 0 ? _hDias : [2, 3, 4, 5, 6, 0];
    let nextOpen = null;
    if (nowMins >= 360 && openStart) {
      const [sh, sm] = openStart.split(':').map(Number);
      const openMins = sh * 60 + sm;
      if (openMins > nowMins) nextOpen = openStart;
    }
    // Usar mensaje personalizado: hoy mismo más tarde (madrugada→manOpen) o cierre nocturno (ya pasó tarClose)
    let msg;
    if (nextOpen) {
      // Aún no ha llegado la apertura de hoy (estamos de madrugada)
      msg = h.closedMsgMid || 'Ahora estamos cerrados. ¡Volvemos a las ' + nextOpen + '!';
    } else {
      // Ya pasó el cierre de hoy (tarClose) → cierre nocturno, próxima apertura es otro día
      let nextDayLabel = 'mañana';
      if (diasAbiertos.length) {
        const todayIdx = now.getDay();
        for (let i = 1; i <= 7; i++) {
          const candidate = (todayIdx + i) % 7;
          if (diasAbiertos.includes(candidate)) {
            if (i === 1) nextDayLabel = 'mañana';else {
              const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
              nextDayLabel = 'el ' + nombres[candidate];
            }
            break;
          }
        }
      }
      msg = h.closedMsgNight || (openStart ? 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + ' a las ' + openStart + '!' : 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + '!');
    }
    updateOrdersUI(false, msg);
    return;
  }
  // Estamos en día y hora de apertura — respetar cierre manual si existe
  checkVacationMode();
  // Solo el admin autenticado necesita sincronizar este estado hacia Firebase;
  // un cliente anónimo mirando la carta no tiene permiso de escritura en
  // config/ (por diseño, en las Firebase Rules) y antes lo intentaba igual,
  // generando avisos de "permission_denied" en la consola sin ningún efecto.
  const _esAdminAutenticado = !!(window.fb_getAdminUser && window.fb_getAdminUser());
  firebase.database().ref('config/openManualOverride').once('value').then(sn => {
    const manualClosed = sn.exists() && sn.val() === true;
    if (manualClosed || localStorage.getItem('dpf_open_manual_override')) {
      localStorage.setItem(OPEN_KEY, 'false');
      localStorage.setItem('dpf_open_manual_override', '1');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(() => {});
      updateOpenBtn(false);
      updateHeroDot(false);
    } else {
      localStorage.setItem(OPEN_KEY, 'true');
      localStorage.setItem(ORDERS_KEY, 'true');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
      if (_esAdminAutenticado && window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    }
  }).catch(() => {
    if (!localStorage.getItem('dpf_open_manual_override')) {
      localStorage.setItem(OPEN_KEY, 'true');
      if (_esAdminAutenticado && window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
    }
  });
  const open = getOrdersOpen(); // getOrdersOpen ya respeta el horario
  updateOrdersUI(open);
  const savedMsg = localStorage.getItem(ORDERS_MSG_KEY);
  const msgInput = document.getElementById('orders-pause-msg');
  if (msgInput && savedMsg) msgInput.value = savedMsg;
}
function showToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2500);
}

// ── FORMATO TELÉFONO ──
function formatPhone(input) {
  // Solo dígitos, max 9
  let digits = input.value.replace(/\D/g, '').slice(0, 9);
  // Formato XXX XXX XXX
  let formatted = digits;
  if (digits.length > 6) formatted = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);else if (digits.length > 3) formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
  input.value = formatted;
  // Comprobar premio de fidelización cuando el número está completo (9 dígitos)
  if (digits.length === 9) {
    clearTimeout(window._fidelizacionCheckTimer);
    window._fidelizacionCheckTimer = setTimeout(() => _comprobarPremioFidelizacion(digits), 400);
  } else {
    _ocultarAvisoPremioFidelizacion();
  }
}

// ── FIDELIZACIÓN: comprobación de premio disponible al introducir teléfono ──
async function _comprobarPremioFidelizacion(phoneClean) {
  // Consulta server-side (fidelizacion.php) en vez de leer Firebase
  // directamente — así solo se ve lo mínimo (sellos/premios de ESTE
  // teléfono) y nadie puede fisgonear el nombre/historial de otro cliente.
  try {
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'consultar', telefono: phoneClean })
    });
    const data = await res.json();
    if (!data.success) return;
    const cliente = { sellos: data.sellos, premiosPendientes: data.premiosPendientes, vecesCompletado: data.vecesCompletado };
    const premiosPendientes = cliente.premiosPendientes;
    _pintarTarjetaSellos(phoneClean, cliente);
    if (cliente && premiosPendientes > 0) {
      window._fidelizacionPremioActivo = phoneClean;
      window._fidelizacionProximoSelloActivo = null;
      _ocultarAvisoProximoSelloFidelizacion();
      _mostrarAvisoPremioFidelizacion(phoneClean);
    } else if (cliente && cliente.sellos === FIDELIZACION_META - 1 && _carritoTienePatata()) {
      // El cliente está a 1 sello del premio (9/10) y este pedido ya incluye
      // patata: este sería el pedido que completa el sello. Avisamos antes
      // de confirmar, no después.
      window._fidelizacionPremioActivo = null;
      window._fidelizacionProximoSelloActivo = phoneClean;
      _ocultarAvisoPremioFidelizacion();
      _mostrarAvisoProximoSelloFidelizacion(phoneClean);
    } else {
      window._fidelizacionPremioActivo = null;
      window._fidelizacionProximoSelloActivo = null;
      _ocultarAvisoPremioFidelizacion();
      _ocultarAvisoProximoSelloFidelizacion();
    }
    // Repintar el carrito para que el total ya refleje el premio (o deje
    // de hacerlo) en cuanto se sabe, sin esperar a que el cliente toque
    // el carrito para que se note el cambio. PERO no si el cliente está
    // escribiendo en ese momento (nombre/teléfono/notas) — renderCart()
    // reconstruye esos campos desde cero y le borraría lo que ha escrito.
    // El descuento se calcula igualmente bien al confirmar el pedido
    // aunque el carrito no se repinte al instante.
    const _campoActivo = document.activeElement ? document.activeElement.tagName : '';
    const _escribiendoAhora = _campoActivo === 'INPUT' || _campoActivo === 'TEXTAREA';
    if (typeof renderCart === 'function' && !_escribiendoAhora) renderCart();
  } catch (e) { console.warn('[fidelizacion] error comprobando premio:', e); }
}
function _carritoTienePatata() {
  try {
    // Usar la función oficial del proyecto, que ya comprueba tanto el
    // carrito normal (cart) como el de productos personalizados (custCart) —
    // por ejemplo "Patata Al Gusto" vive en custCart, no en cart.
    return typeof cartHasPatatas === 'function' ? cartHasPatatas() : false;
  } catch (e) { return false; }
}
function _campoTelefonoVisible(phoneCleanEsperado) {
  // En escritorio el formulario vive en la página principal (customer-phone);
  // en el drawer/carrito lateral es drawer-customer-phone. Ambos pueden
  // existir en el DOM a la vez (con offsetParent válido) aunque solo uno
  // esté realmente en el viewport. Para evitar elegir el equivocado,
  // preferimos el campo cuyo valor coincide con el teléfono que se está
  // comprobando; si ninguno coincide, usamos visibilidad por tamaño real.
  const drawer = document.getElementById('drawer-customer-phone');
  const main = document.getElementById('customer-phone');
  if (phoneCleanEsperado) {
    const drawerDigits = drawer ? drawer.value.replace(/\D/g, '') : '';
    const mainDigits = main ? main.value.replace(/\D/g, '') : '';
    if (drawerDigits === phoneCleanEsperado && _tieneAreaVisible(drawer)) return drawer;
    if (mainDigits === phoneCleanEsperado && _tieneAreaVisible(main)) return main;
  }
  if (drawer && _tieneAreaVisible(drawer)) return drawer;
  if (main && _tieneAreaVisible(main)) return main;
  return drawer || main || null;
}
function _tieneAreaVisible(el) {
  if (!el || el.offsetParent === null) return false;
  const r = el.getBoundingClientRect();
  // Considerar "realmente visible" si está dentro de la ventana actual,
  // no solo presente en el flujo del documento (que puede estar muy
  // abajo, fuera del viewport, como un drawer cerrado).
  return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
}
function _mostrarAvisoPremioFidelizacion(phoneClean) {
  // Quitar cualquier aviso previo en el otro campo, por si se cambió de vista
  document.querySelectorAll('#fidelizacion-premio-aviso').forEach(e => e.remove());
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;
  const el = document.createElement('div');
  el.id = 'fidelizacion-premio-aviso';
  el.style.cssText = 'background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600';
  el.innerHTML = '🎁 ¡Tienes una patata gratis disponible! Añade cualquier patata del menú y se aplicará el descuento automáticamente al confirmar.';
  phoneInput.parentNode.appendChild(el);
}
function _ocultarAvisoPremioFidelizacion() {
  document.querySelectorAll('#fidelizacion-premio-aviso').forEach(e => e.remove());
  const rec = document.getElementById('submit-btn-reminder');
  if (rec) rec.style.display = 'none';
}
function _mostrarAvisoProximoSelloFidelizacion(phoneClean) {
  document.querySelectorAll('#fidelizacion-proximo-sello-aviso').forEach(e => e.remove());
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;
  const el = document.createElement('div');
  el.id = 'fidelizacion-proximo-sello-aviso';
  el.style.cssText = 'background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600';
  el.innerHTML = '🎉 ¡Este es tu pedido número 10! Al confirmarlo, tu patata gratis estará disponible en tu próximo pedido.';
  phoneInput.parentNode.appendChild(el);
}
function _ocultarAvisoProximoSelloFidelizacion() {
  document.querySelectorAll('#fidelizacion-proximo-sello-aviso').forEach(e => e.remove());
}

// ── TARJETA VISUAL DE SELLOS (progreso + premio + veces completado) ──
function _pintarTarjetaSellos(phoneClean, cliente) {
  document.querySelectorAll('.tarjeta-sellos-cliente').forEach(e => e.remove());
  if (!cliente) return;
  const phoneInput = _campoTelefonoVisible(phoneClean);
  if (!phoneInput || !phoneInput.parentNode) return;

  const sellos = typeof cliente.sellos === 'number' ? cliente.sellos : 0;
  const premios = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  const veces = typeof cliente.vecesCompletado === 'number' ? cliente.vecesCompletado : 0;

  let dots = '';
  for (let i = 0; i < 10; i++) {
    dots += i < sellos
      ? '<span style="display:inline-block;font-size:19px;margin-right:1px;animation:selloPop .35s ease ' + (i * 0.05) + 's both">🥔</span>'
      : '<span style="display:inline-block;width:15px;height:15px;border-radius:50%;border:2px solid #E8D5B0;margin:0 5px 0 2px;vertical-align:middle"></span>';
  }

  const card = document.createElement('div');
  card.className = 'tarjeta-sellos-cliente';
  card.style.cssText = 'border-radius:12px;padding:12px 14px;margin-top:10px;font-family:\'DM Sans\',sans-serif;' +
    (premios > 0 ? 'background:#3D1F0D;color:#FFF8EE' : 'background:#FBEFD6;border:1.5px solid #F4C430;color:#3D1F0D');

  if (premios > 0) {
    card.innerHTML = '<div style="font-size:14px;font-weight:800;margin-bottom:2px">🎉 ¡Tienes ' + premios + ' patata' + (premios > 1 ? 's' : '') + ' gratis para canjear!</div>' +
      '<div style="font-size:12px;color:#F4C430">Añádela al carrito y se descontará sola al confirmar.</div>';
  } else {
    card.innerHTML = '<div style="font-size:12px;font-weight:700;margin-bottom:6px">🎁 Tus sellos: ' + sellos + '/10</div>' +
      '<div>' + dots + '</div>' +
      (veces > 0 ? '<div style="font-size:11px;color:#8A6A4E;margin-top:6px">🏅 Ya van ' + veces + ' patata' + (veces > 1 ? 's' : '') + ' gratis conseguidas</div>' : '');
  }
  phoneInput.parentNode.appendChild(card);

  const rec = document.getElementById('submit-btn-reminder');
  if (rec) rec.style.display = premios > 0 ? 'block' : 'none';

  // Confeti solo la primera vez que se detecta cada premio/ciclo nuevo (no en cada visita)
  try {
    const key = 'dpf_loyalty_seen_' + phoneClean;
    const prev = JSON.parse(localStorage.getItem(key) || 'null');
    const esNuevoLogro = (premios > 0 && (!prev || prev.premios < premios)) || (veces > 0 && (!prev || prev.veces < veces));
    if (esNuevoLogro) _lanzarConfetiSellos();
    localStorage.setItem(key, JSON.stringify({ premios, veces }));
  } catch {}
}

function _lanzarConfetiSellos() {
  try {
    const emojis = ['🎉', '🥔', '✨', '🎊'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden';
    for (let i = 0; i < 18; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:-24px;font-size:' + (16 + Math.random() * 10) + 'px;animation:confettiFall ' + (1.4 + Math.random() * 1.2) + 's ease-in ' + (Math.random() * 0.4) + 's forwards';
      container.appendChild(span);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3200);
  } catch {}
}


// ── IMPRESORA TÉRMICA (WebUSB) ──
// Imprime directamente desde el navegador a la impresora térmica UNYKAch POS5 (USB, ESC/POS),
// sin depender de un PC intermedio: funciona igual en Chrome de escritorio (para probar) que en
// Chrome de la tablet Android de la tienda (con la impresora conectada por USB-OTG).
// Requiere Chrome/Edge — Safari y Firefox no soportan WebUSB.

const PRINTER_LOGO_W = 384;
const PRINTER_LOGO_H = 384;
const PRINTER_LOGO_DATA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 128, 0, 0, 31, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 128, 0, 0, 127, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 254, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 254, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 252, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 248, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 248, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 240, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 240, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 224, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 224, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 192, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 192, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 192, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 128, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 128, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 128, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 254, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 254, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 254, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 254, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 254, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 252, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 252, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 1, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 31, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 199, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 159, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 127, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 248, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 128, 1, 255, 252, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 254, 0, 0, 127, 224, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 248, 0, 0, 63, 128, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 240, 31, 192, 15, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 225, 255, 248, 4, 3, 255, 192, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 199, 255, 255, 0, 31, 255, 248, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 159, 255, 255, 128, 127, 255, 254, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 127, 255, 255, 225, 255, 255, 255, 143, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 243, 255, 255, 255, 207, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 247, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 231, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 227, 255, 255, 255, 191, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 129, 255, 255, 255, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 127, 255, 252, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 252, 0, 63, 255, 240, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 240, 0, 7, 255, 192, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 128, 0, 0, 120, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 7, 255, 131, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 254, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 1, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 7, 252, 0, 0, 0, 0, 0, 3, 248, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 15, 254, 0, 0, 0, 0, 0, 7, 254, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 31, 255, 0, 0, 0, 0, 0, 15, 255, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 224, 0, 31, 255, 0, 0, 0, 0, 0, 31, 255, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 224, 0, 63, 255, 128, 0, 0, 0, 0, 31, 255, 128, 0, 0, 0, 7, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 63, 255, 128, 0, 0, 0, 0, 63, 255, 128, 0, 0, 0, 3, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 63, 255, 128, 0, 0, 0, 0, 63, 255, 192, 0, 0, 0, 3, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 63, 255, 192, 0, 0, 0, 0, 63, 255, 192, 0, 0, 0, 3, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 127, 255, 192, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 3, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 127, 255, 192, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 3, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 192, 0, 127, 255, 192, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 7, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 192, 0, 127, 255, 192, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 7, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 192, 0, 127, 255, 192, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 7, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 192, 0, 127, 255, 128, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 7, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 192, 0, 63, 255, 128, 0, 0, 0, 0, 127, 255, 192, 0, 0, 0, 7, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 63, 255, 128, 0, 0, 0, 0, 63, 255, 192, 0, 0, 0, 7, 255, 255, 224, 31, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 63, 255, 128, 0, 0, 0, 0, 63, 255, 128, 0, 0, 0, 7, 255, 255, 128, 7, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 31, 255, 0, 0, 0, 0, 0, 63, 255, 128, 0, 0, 0, 7, 255, 255, 0, 3, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 31, 254, 0, 0, 0, 0, 0, 63, 255, 128, 0, 0, 0, 7, 255, 254, 0, 1, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 15, 254, 0, 0, 0, 0, 0, 31, 255, 0, 0, 0, 0, 7, 255, 252, 0, 1, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 7, 252, 0, 0, 0, 0, 0, 15, 254, 0, 0, 0, 0, 15, 255, 248, 0, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 1, 240, 0, 0, 0, 0, 0, 7, 252, 0, 0, 0, 0, 15, 255, 240, 0, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 3, 248, 0, 0, 0, 0, 15, 255, 240, 0, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 240, 0, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 224, 0, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 224, 0, 0, 127, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 224, 0, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 192, 0, 0, 127, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 192, 56, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 192, 126, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 192, 254, 0, 127, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 0, 127, 224, 0, 63, 252, 0, 0, 0, 0, 0, 0, 31, 255, 128, 255, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 3, 255, 248, 1, 255, 255, 0, 0, 0, 0, 0, 0, 31, 255, 129, 255, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 15, 255, 254, 3, 255, 255, 192, 0, 0, 0, 0, 0, 31, 255, 129, 255, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 63, 255, 255, 15, 255, 255, 240, 0, 0, 0, 0, 0, 63, 255, 129, 255, 0, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 0, 127, 255, 255, 159, 255, 255, 252, 0, 0, 0, 0, 0, 63, 255, 129, 255, 1, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 1, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 63, 255, 129, 255, 1, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 63, 255, 128, 254, 1, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 63, 255, 128, 254, 3, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 127, 255, 0, 124, 3, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 15, 0, 127, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 127, 255, 0, 0, 7, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 31, 195, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 24, 0, 0, 127, 255, 0, 0, 7, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 252, 0, 0, 127, 255, 0, 0, 15, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 127, 255, 0, 0, 31, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 254, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 255, 255, 0, 0, 63, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 254, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 255, 255, 0, 0, 127, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 254, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 255, 255, 0, 0, 127, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 254, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 255, 255, 0, 1, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 1, 255, 254, 0, 3, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 1, 255, 254, 0, 7, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 1, 255, 254, 0, 31, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 1, 255, 255, 129, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 1, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 3, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 128, 0, 3, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 3, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 7, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 7, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 7, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 15, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 15, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 15, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 7, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 31, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 7, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 31, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 7, 255, 255, 255, 255, 255, 255, 251, 248, 0, 0, 0, 31, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 7, 255, 247, 255, 255, 255, 255, 187, 248, 0, 0, 0, 63, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 128, 0, 3, 255, 255, 252, 253, 255, 255, 251, 248, 0, 0, 0, 63, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 128, 0, 3, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 63, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 3, 255, 255, 255, 251, 255, 255, 255, 240, 0, 0, 0, 127, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 1, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 127, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 1, 255, 255, 254, 247, 255, 255, 239, 224, 0, 0, 0, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 192, 0, 0, 255, 223, 254, 255, 255, 255, 255, 192, 0, 0, 0, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 0, 255, 255, 254, 239, 255, 255, 255, 192, 0, 0, 1, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 0, 127, 255, 254, 223, 255, 255, 255, 128, 0, 0, 1, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 224, 0, 0, 127, 255, 255, 255, 255, 255, 255, 0, 0, 0, 3, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 240, 0, 0, 63, 239, 255, 255, 255, 255, 255, 0, 0, 0, 3, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 0, 31, 255, 255, 255, 255, 255, 254, 0, 0, 0, 7, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 240, 0, 0, 15, 255, 255, 255, 255, 255, 252, 0, 0, 0, 7, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 15, 255, 255, 255, 255, 255, 248, 0, 0, 0, 15, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 248, 0, 0, 7, 255, 255, 255, 255, 223, 240, 0, 0, 0, 31, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 252, 0, 0, 3, 255, 63, 255, 255, 127, 224, 0, 0, 0, 31, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 252, 0, 0, 1, 255, 239, 255, 253, 255, 192, 0, 0, 0, 63, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 254, 0, 0, 0, 255, 251, 255, 207, 255, 128, 0, 0, 0, 127, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 0, 0, 0, 127, 255, 193, 255, 255, 0, 0, 0, 0, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 0, 0, 0, 63, 255, 255, 255, 252, 0, 0, 0, 0, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 128, 0, 0, 15, 255, 255, 255, 248, 0, 0, 0, 1, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 192, 0, 0, 7, 255, 255, 255, 224, 0, 0, 0, 3, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 192, 0, 0, 1, 255, 255, 255, 128, 0, 0, 0, 7, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 224, 0, 0, 0, 63, 255, 254, 0, 0, 0, 0, 15, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 240, 0, 0, 0, 7, 255, 224, 0, 0, 0, 0, 31, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 252, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 254, 0, 0, 7, 0, 0, 8, 0, 0, 0, 1, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 0, 0, 7, 240, 0, 56, 0, 0, 0, 3, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 192, 0, 7, 255, 255, 248, 0, 0, 0, 7, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 224, 0, 7, 255, 255, 240, 0, 0, 0, 31, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 248, 0, 7, 255, 255, 240, 0, 0, 0, 63, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 252, 0, 7, 255, 255, 240, 0, 0, 0, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 0, 7, 255, 255, 224, 0, 0, 3, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 192, 7, 255, 255, 224, 0, 0, 15, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 240, 3, 255, 255, 192, 0, 0, 63, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 254, 3, 255, 255, 192, 0, 0, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 195, 255, 255, 128, 0, 7, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 0, 0, 63, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 254, 0, 7, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 254, 3, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 255, 255, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 255, 255, 255, 255, 255, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 255, 255, 255, 255, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Sustituye acentos/ñ por su equivalente ASCII — la mayoría de estas impresoras
// clon no traen bien configurada la página de códigos y los acentos salen mal;
// es más fiable no depender de ninguna tabla de códigos.
function _ptEncodeStr(str) {
  const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','ñ':'n','Ñ':'N','ü':'u','Ü':'U','¡':'!','¿':'?' };
  return (str || '').split('').map(c => map[c] || c).join('');
}

// Construye los bytes ESC/POS de un ticket (mismo formato que usaba el bridge Node.js
// en pedidos/js/index.js, incluyendo el logo). Devuelve un Uint8Array listo para USB.
function _ptBuildTicketBytes(ticket) {
  const tc = getTicketConfig();
  const ESC = 0x1B, GS = 0x1D;
  const d = [];
  const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
  const center = () => d.push(ESC, 0x61, 0x01);
  const left = () => d.push(ESC, 0x61, 0x00);
  const big = () => d.push(ESC, 0x21, 0x30);
  // Altura doble opcional (ajustable en Configuración del ticket) — 0x00
  // tamaño normal 1x1, 0x10 altura doble/ancho normal. No afecta al ajuste
  // de columnas de los productos (el ancho del carácter no cambia).
  const normal = () => d.push(ESC, 0x21, tc.letraGrande ? 0x10 : 0x00);
  const bold = on => d.push(ESC, 0x45, on ? 0x01 : 0x00);

  // Inicializar
  d.push(ESC, 0x40);

  // Logo centrado
  center();
  const bpr = (PRINTER_LOGO_W + 7) >> 3;
  d.push(GS, 0x76, 0x30, 0x00, bpr & 0xFF, (bpr >> 8) & 0xFF, PRINTER_LOGO_H & 0xFF, (PRINTER_LOGO_H >> 8) & 0xFF);
  PRINTER_LOGO_DATA.forEach(b => d.push(b));

  // Nombre del negocio
  center();
  big();
  push(tc.nombre + '\n');
  normal();
  push(tc.direccion + '\n');
  push(tc.telefono + '\n');
  push('------------------------------------------------\n');

  // Hora de recogida, si tiene turno
  if (ticket.slotTime) {
    center();
    push('HORA RECOGIDA\n');
    big();
    push(ticket.slotTime + '\n');
    normal();
  }

  // Nombre del cliente
  center();
  big();
  push((ticket.name || '').toUpperCase() + '\n');
  normal();
  if (ticket.phone) push('Tlfno. ' + ticket.phone + '\n');
  push('------------------------------------------------\n');

  // Número de pedido
  center();
  big();
  push('PEDIDO ' + ticket.orderNum + '\n');
  normal();
  push((ticket.time || '') + '\n');
  push('------------------------------------------------\n');

  // Productos
  left();
  (ticket.items || []).forEach(item => {
    const partes = _ptEncodeStr(item.name || '').split(' + ');
    const nombrePrincipal = partes[0].toUpperCase();
    const extrasNombre = partes.slice(1);
    const extrasArr = item.extras || [];
    const precio = (item.subtotal || 0).toFixed(2) + ' EUR';
    const W = tc.anchoPapel === 58 ? 32 : 48;
    const prefix = item.qty + 'x ';
    const spaces = W - prefix.length - nombrePrincipal.length - precio.length;
    if (spaces >= 0) {
      push(prefix + nombrePrincipal + ' '.repeat(spaces) + precio + '\n');
    } else {
      push(prefix + nombrePrincipal.substring(0, W - prefix.length) + '\n');
      push(' '.repeat(Math.max(0, W - precio.length)) + precio + '\n');
    }
    extrasNombre.forEach(extra => {
      const conParentesis = extra.replace(/\s*\+\s*([\d]+[,.]?[\d]*)\s*€/, ' (+$1 EUR)').trim();
      push('     - ' + _ptEncodeStr(conParentesis).toUpperCase() + '\n');
    });
    if (Array.isArray(extrasArr)) {
      extrasArr.forEach(extra => {
        const nombreExtra = _ptEncodeStr(((extra && extra.name) ? extra.name : extra) + '').toUpperCase();
        const precioExtraTxt = (extra && extra.price) ? '+' + parseFloat(extra.price).toFixed(2) + ' EUR' : '';
        const prefixExtra = '  - ';
        if (!precioExtraTxt) {
          push(prefixExtra + nombreExtra + '\n');
          return;
        }
        // Precio del extra alineado a la misma columna derecha que el
        // precio de la línea principal (misma W), no pegado al nombre.
        const spacesExtra = W - prefixExtra.length - nombreExtra.length - precioExtraTxt.length;
        if (spacesExtra >= 1) {
          push(prefixExtra + nombreExtra + ' '.repeat(spacesExtra) + precioExtraTxt + '\n');
        } else {
          push(prefixExtra + nombreExtra + '\n');
          push(' '.repeat(Math.max(0, W - precioExtraTxt.length)) + precioExtraTxt + '\n');
        }
      });
    }
  });

  push('------------------------------------------------\n');

  // Descuento estudiante/jubilado autodeclarado — aviso destacado justo
  // antes del total, para que se compruebe el carné en el momento de cobrar.
  if (ticket.esEstudianteJubilado) {
    center();
    bold(true);
    big();
    push('*** VERIFICAR CARNET ***\n');
    normal();
    push('ESTUDIANTE / JUBILADO\n');
    bold(false);
    push('------------------------------------------------\n');
  }

  // Total
  center();
  big();
  push((ticket.total || 0).toFixed(2) + ' EUR\n');
  normal();
  push(tc.textoPago + '\n');

  if (ticket.notes) {
    left();
    push('------------------------------------------------\n');
    bold(true); push('NOTAS: '); bold(false);
    push(ticket.notes + '\n');
  }

  center();
  push('------------------------------------------------\n');
  push(tc.despedida + '\n');

  // Código QR opcional (configurable en Configuración del ticket) — lo genera
  // la propia impresora a partir del texto/URL, no hace falta ninguna imagen.
  if (tc.qrHabilitado && tc.qrContenido) {
    push('\n');
    _ptPushQR(d, GS, tc.qrContenido, 6);
  }

  push('\n\n\n');

  // Cortar papel
  d.push(GS, 0x56, 0x42, 0x00);

  return new Uint8Array(d);
}

// Manda a la impresora el comando ESC/POS estándar de código QR (GS ( k,
// "Modelo 2") — la impresora lo dibuja ella sola a partir del texto, sin
// necesidad de generar ninguna imagen desde el navegador.
function _ptPushQR(d, GS, contenido, tamañoModulo) {
  const tam = tamañoModulo || 6; // 1-16; 6-8 suele leerse bien en 80mm
  const bytes = Array.from(new TextEncoder().encode(contenido));
  const storeLen = bytes.length + 3;
  const pL = storeLen & 0xFF, pH = (storeLen >> 8) & 0xFF;
  // Seleccionar modelo 2
  d.push(GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
  // Tamaño del módulo
  d.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, tam);
  // Nivel de corrección de errores (48=L 49=M 50=Q 51=H)
  d.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 48);
  // Guardar los datos del QR
  d.push(GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);
  bytes.forEach(b => d.push(b));
  // Imprimir el QR guardado
  d.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
}

// ── CONEXIÓN USB ──
let _ptDevice = null;
let _ptEndpointOut = null;
let _ptEndpointIn = null;
let _ptUltimoTicket = null; // último ticket normal enviado (para "Reimprimir último")

// Puede haber varias copias del indicador de estado en distintas pantallas
// (Configuración del ticket, Pedidos en vivo, Panel bimba) — se actualizan todas
// a la vez porque comparten la misma conexión USB (misma pestaña del navegador).
function _ptStatusUI(connected, msg) {
  const texto = msg || (connected ? '🟢 Impresora conectada' : '🔴 Impresora no conectada');
  document.querySelectorAll('.pt-conn-status').forEach(el => {
    el.textContent = texto;
    el.style.color = connected ? '#166534' : '#991B1B';
  });
}

function _ptIsConnected() {
  return !!(_ptDevice && _ptEndpointOut !== null);
}

// Indicador visible en la pantalla de pedidos en vivo/cocina, sin necesitar consola,
// para diagnosticar por qué no imprime sola: si el admin no está "activo" en este
// dispositivo, o el auto-imprimir está apagado, aquí sale sin tener que adivinar.
function _ptUpdateDebugStatus() {
  const el = document.getElementById('pt-debug-status');
  const elKitchen = document.getElementById('pt-debug-status-kitchen');
  if (!el && !elKitchen) return;
  const admin = window._adminLoggedIn ? '🟢 Admin activo' : '🔴 Admin NO activo';
  const auto = (typeof getTicketConfig === 'function' && getTicketConfig().autoImprimir) ? '🟢 Auto-imprimir ON' : '🔴 Auto-imprimir OFF';
  const usb = _ptIsConnected() ? '🟢 USB conectada' : '🔴 USB no conectada';
  const texto = admin + ' · ' + auto + ' · ' + usb;
  if (el) el.textContent = texto;
  if (elKitchen) elKitchen.textContent = texto;
}

// Busca en el dispositivo USB la interfaz que tenga endpoints de salida (bulk OUT,
// para imprimir) y de entrada (bulk IN, para leer el estado de papel) y la reclama.
// Es genérico: no depende de conocer de antemano el vendor/product ID.
async function _ptClaimInterface(device) {
  await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);
  let ifaceNumber = null, epOut = null, epIn = null;
  for (const iface of device.configuration.interfaces) {
    const alt = iface.alternates[0];
    const out = alt.endpoints.find(e => e.direction === 'out');
    if (out) {
      ifaceNumber = iface.interfaceNumber;
      epOut = out.endpointNumber;
      const inEp = alt.endpoints.find(e => e.direction === 'in');
      epIn = inEp ? inEp.endpointNumber : null;
      break;
    }
  }
  if (ifaceNumber === null) throw new Error('No se encontró un endpoint de salida USB en este dispositivo');
  await device.claimInterface(ifaceNumber);
  return { epOut, epIn };
}

// Pide permiso al navegador para acceder a la impresora — debe llamarse desde
// un click (gesto del usuario), el navegador no deja hacerlo en segundo plano.
async function conectarImpresoraTermica() {
  if (!navigator.usb) {
    alert('Este navegador no soporta impresión USB. Usa Chrome o Edge (no funciona en Safari ni Firefox).');
    return false;
  }
  try {
    // Sin filtros: no sabemos con certeza el vendor/product ID de esta impresora,
    // así que mostramos todos los dispositivos USB conectados y que el usuario
    // elija el suyo de la lista (evita listas vacías por un filtro equivocado).
    const device = await navigator.usb.requestDevice({ filters: [] });
    const { epOut, epIn } = await _ptClaimInterface(device);
    _ptDevice = device;
    _ptEndpointOut = epOut;
    _ptEndpointIn = epIn;
    _ptStatusUI(true);
    return true;
  } catch (e) {
    console.warn('[Impresora] conexión cancelada o fallida', e);
    if (e && e.name !== 'NotFoundError') alert('No se pudo conectar con la impresora: ' + e.message);
    return false;
  }
}

// Reconecta en silencio (sin pedir permiso) a un dispositivo ya autorizado antes —
// se llama sola al cargar la página, y también sola cada pocos segundos si se
// pierde la conexión (cable desenchufado, tablet que se durmió...), para no
// tener que ir a pulsar "Conectar impresora" a mano cada vez.
// Hay hasta 4 disparadores distintos que pueden llamar a esta función casi a
// la vez (al cargar la página, el evento "connect" de WebUSB, el intervalo
// de 8s, y el aviso al volver a la pestaña/pantalla) — sin este candado,
// dos llamadas simultáneas podían pasar ambas la comprobación de "no
// conectada" antes de que ninguna terminara, e intentar reclamar la
// interfaz USB a la vez: la segunda fallaba con "Unable to claim interface"
// aunque la primera sí lo hubiera conseguido bien.
let _ptReconectando = false;
async function _ptReconectar() {
  if (!navigator.usb) return false;
  if (_ptIsConnected()) return true;
  if (_ptReconectando) return false;
  _ptReconectando = true;
  try {
    const devices = await navigator.usb.getDevices();
    if (!devices.length) { _ptStatusUI(false); return false; }
    const device = devices[0];
    const { epOut, epIn } = await _ptClaimInterface(device);
    _ptDevice = device;
    _ptEndpointOut = epOut;
    _ptEndpointIn = epIn;
    _ptStatusUI(true);
    return true;
  } catch (e) {
    console.warn('[Impresora] reconexión fallida', e);
    _ptStatusUI(false);
    return false;
  } finally {
    _ptReconectando = false;
  }
}

async function _ptEnviarBytesUnaVez(bytes) {
  if (!_ptDevice || !_ptEndpointOut) {
    const ok = await _ptReconectar();
    if (!ok) throw new Error('Impresora no conectada — pulsa "Conectar impresora" en Configuración del ticket');
  }
  await _ptDevice.transferOut(_ptEndpointOut, bytes);
}

// Reintenta un par de veces (con reconexión de por medio) antes de rendirse —
// un fallo puntual (impresora ocupada, un instante de corte USB) ya no se
// queda directamente como "Falló" sin que nadie lo intente de nuevo.
async function _ptEnviarBytes(bytes, intentos) {
  intentos = intentos || 3;
  let ultimoError = null;
  for (let i = 0; i < intentos; i++) {
    try {
      await _ptEnviarBytesUnaVez(bytes);
      return;
    } catch (e) {
      ultimoError = e;
      console.warn('[Impresora] intento ' + (i + 1) + '/' + intentos + ' falló', e);
      if (i < intentos - 1) {
        _ptDevice = null; _ptEndpointOut = null; // forzar reconexión limpia en el siguiente intento
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }
  throw ultimoError;
}

// Imprime un ticket, repitiendo tantas copias como esté configurado.
async function imprimirTicketTermico(ticket) {
  const tc = getTicketConfig();
  const bytes = _ptBuildTicketBytes(ticket);
  _ptUltimoTicket = ticket;
  const copias = Math.max(1, parseInt(tc.copias, 10) || 1);
  for (let i = 0; i < copias; i++) {
    await _ptEnviarBytes(bytes);
    if (i < copias - 1) await new Promise(r => setTimeout(r, 300));
  }
}

// Ticket corto de aviso cuando un pedido se cancela o se modifica (se borra
// y se vuelve a mandar como uno nuevo) — el papel ya impreso no se puede
// borrar, así que se imprime este aviso para que en cocina sepan que ese
// número de pedido ya NO es válido y hay que tirar el ticket anterior.
function _ptBuildAnulacionBytes(orderNum) {
  const ESC = 0x1B, GS = 0x1D;
  const d = [];
  const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
  const center = () => d.push(ESC, 0x61, 0x01);
  const big = () => d.push(ESC, 0x21, 0x30);
  const normal = () => d.push(ESC, 0x21, 0x00);
  d.push(ESC, 0x40);
  center();
  push('\n');
  big();
  push('X X X X X\n');
  push('ANULADO\n');
  normal();
  push('------------------------------------------------\n');
  big();
  push('PEDIDO ' + orderNum + '\n');
  normal();
  push('Tira el ticket anterior\n');
  push('de este pedido\n');
  push('\n\n\n');
  d.push(GS, 0x56, 0x42, 0x00);
  return new Uint8Array(d);
}

async function imprimirAnulacion(orderNum) {
  await _ptEnviarBytes(_ptBuildAnulacionBytes(orderNum));
}

async function imprimirTicketPrueba() {
  try {
    await imprimirTicketTermico({
      orderNum: 'PRUEBA',
      name: 'Ticket de prueba',
      phone: '',
      notes: '',
      slotTime: null,
      items: [{ name: 'Impresora configurada correctamente', qty: 1, subtotal: 0 }],
      total: 0,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (e) {
    alert('⚠️ ' + e.message);
  }
}

// Reimprime el último ticket normal enviado (no el de prueba, ni una
// anulación) — para el caso de que se atasque el papel a mitad de
// impresión, sin tener que ir a buscar el pedido en la lista.
async function reimprimirUltimoTicketTermico() {
  if (!_ptUltimoTicket) {
    alert('Todavía no se ha impreso ningún ticket en este dispositivo.');
    return;
  }
  try {
    await imprimirTicketTermico(_ptUltimoTicket);
  } catch (e) {
    alert('⚠️ No se pudo reimprimir: ' + e.message);
  }
}

// Cartel con QR para el mostrador: al escanearlo se abre la web ya con el
// código de "pedido desde el local" puesto (sin gastos de gestión), sin que
// el cliente tenga que escribir nada — para pegar en el mostrador cuando
// hay cola. Se imprime tal cual, en un ticket corto aparte.
async function imprimirCartelQRLocal() {
  const code = (typeof getLocalFeeCode === 'function') ? getLocalFeeCode() : '';
  if (!code) {
    alert('Primero pon y guarda un código en "Código pedido desde el local".');
    return;
  }
  const url = window.location.origin + '/?local=' + encodeURIComponent(code);
  const ESC = 0x1B, GS = 0x1D;
  const d = [];
  const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
  const center = () => d.push(ESC, 0x61, 0x01);
  const big = () => d.push(ESC, 0x21, 0x30);
  const normal = () => d.push(ESC, 0x21, 0x00);
  d.push(ESC, 0x40);
  center();
  push('\n');
  big();
  push('PIDE DESDE\n');
  push('EL MOVIL\n');
  normal();
  push('sin gastos de gestion\n');
  push('\n');
  _ptPushQR(d, GS, url, 8);
  push('\n');
  push('Escanea el codigo\n');
  push('o escribe el codigo:\n');
  big();
  push(code + '\n');
  normal();
  push('\n');
  push(window.location.origin + '/\n');
  push('\n\n\n');
  d.push(GS, 0x56, 0x42, 0x00);
  try {
    await _ptEnviarBytes(new Uint8Array(d));
  } catch (e) {
    alert('⚠️ No se pudo imprimir el cartel: ' + e.message);
  }
}

// ── AVISO DE PAPEL ──
// Comando ESC/POS "DLE EOT 4" (transmisión de estado en tiempo real, sensor
// de papel). La interpretación exacta de los bits varía algo según el
// fabricante — esta es la más habitual en clones compatibles con Epson.
// Si en esta impresora en concreto no coincidiera al probarlo con el rollo
// realmente vacío, hay que ajustar las máscaras (0x0C / 0x60) de aquí abajo.
async function _ptComprobarPapel() {
  if (!_ptIsConnected() || _ptEndpointIn === null) return;
  try {
    await _ptDevice.transferOut(_ptEndpointOut, new Uint8Array([0x10, 0x04, 0x04]));
    const res = await _ptDevice.transferIn(_ptEndpointIn, 8);
    if (!res.data || res.data.byteLength === 0) return;
    const status = res.data.getUint8(0);
    const sinPapel = (status & 0x60) !== 0;
    _ptPapelUI(sinPapel);
  } catch (e) {
    // No pasa nada si esta impresora no responde a este comando — simplemente
    // no se muestra el aviso de papel, el resto sigue funcionando igual.
  }
}
function _ptPapelUI(sinPapel) {
  document.querySelectorAll('.pt-papel-aviso').forEach(el => {
    // El banner grande de la pantalla de cocina necesita "flex" (para
    // colocar el texto centrado verticalmente como el de "activa el
    // audio"); los avisos pequeños del panel de admin usan "block" por
    // defecto — cada elemento indica el suyo con data-show-display.
    el.style.display = sinPapel ? (el.dataset.showDisplay || 'block') : 'none';
  });
}

if (navigator.usb) {
  document.addEventListener('DOMContentLoaded', () => { _ptReconectar(); });
  navigator.usb.addEventListener('disconnect', (e) => {
    if (_ptDevice && e.device === _ptDevice) { _ptDevice = null; _ptEndpointOut = null; _ptEndpointIn = null; _ptStatusUI(false); }
  });
  // Si Chrome detecta que se ha enchufado algún dispositivo USB, probamos a
  // reconectar por si es la impresora (p.ej. se desenchufó el cable y se
  // volvió a meter) — sin esto había que pulsar "Conectar impresora" a mano.
  navigator.usb.addEventListener('connect', () => {
    if (!_ptIsConnected()) _ptReconectar();
  });
  // Reintento periódico de reconexión mientras no esté conectada — cubre el
  // caso de que la tablet se haya quedado en reposo o Chrome no dispare el
  // evento "connect" a tiempo.
  setInterval(() => {
    if (!_ptIsConnected()) _ptReconectar();
    else _ptComprobarPapel();
  }, 8000);
  // Los navegadores ralentizan o pausan setInterval en pestañas/pantallas en
  // segundo plano — si la tablet se queda con la pantalla apagada un rato
  // (algo habitual entre pedido y pedido) el reintento de arriba puede no
  // llegar a ejecutarse a tiempo. En cuanto la pantalla se enciende o se
  // vuelve a esta pestaña, se reintenta al momento en vez de esperar al
  // siguiente tick de los 8s.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !_ptIsConnected()) _ptReconectar();
  });
}

// ── HISTORIAL (últimos 30 días) ──
const HISTORIAL_KEY = 'dpf_historial';
function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveToHistorial(dayStats) {
  if (!dayStats || !dayStats.date || !dayStats.count) return;
  let hist = getHistorial();
  // Actualiza o inserta el día
  const idx = hist.findIndex(d => d.date === dayStats.date);
  if (idx >= 0) hist[idx] = dayStats; else hist.unshift(dayStats);
  // Máximo 30 días
  hist = hist.slice(0, 30);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
  // Subir también a Firebase para que no quede solo en este dispositivo.
  // fb_saveStats escribe en stats/{fecha} — el mismo path que lee fb_loadHistorial.
  // Solo necesario en el fallback (sin transacción atómica) pero es idempotente.
  if (window.fb_saveStats) {
    window.fb_saveStats(dayStats).catch(e =>
      console.warn('[historial] No se pudo subir a Firebase:', e)
    );
  }
}

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — URL TOKEN
// ══════════════════════════════════════════════
const URL_TOKEN_KEY = 'dpf_url_token';
const BIMBA_TOKEN_KEY = 'dpf_bimba_token';
function getUrlToken() {
  return localStorage.getItem(URL_TOKEN_KEY) || '';
}
function getBimbaToken() {
  return localStorage.getItem(BIMBA_TOKEN_KEY) || '';
}
(async function checkUrlToken() {
  const params = new URLSearchParams(window.location.search);

  // Ambos tokens (?key= y ?bimba=) se comprueban en el servidor
  // (bimba-verify.php) con límite de intentos — antes se comparaban aquí
  // contra un valor precargado en localStorage para TODO visitante, lo
  // que permitía a cualquier cliente leer su propio localStorage y
  // auto-concederse acceso sin conocer el token real.

  // Token admin normal
  const key = params.get('key');
  if (key) {
    try {
      const res = await fetch('bimba-verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkAdminUrlToken', token: key })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setTimeout(_updateAudioBannerState, 200);
          logActivity('🔗 Acceso por URL token');
          openAdmin();
        }, 300);
      }
    } catch (e) { /* red caída: simplemente no se concede acceso */ }
  }

  // Token bimba — abre directamente el panel sin contraseña.
  // AVISO: este acceso NO inicia sesión real en Firebase (sigue anónimo),
  // así que con las reglas de seguridad actuales no podrá leer/escribir
  // tickets, gastos, fichajes, etc. Solo sirve para ver la interfaz.
  const bimbaKey = params.get('bimba');
  if (bimbaKey) {
    try {
      const res = await fetch('bimba-verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkBimbaToken', token: bimbaKey })
      });
      const data = await res.json();
      if (data.success) {
        // admin-shell.html se inyecta de forma diferida (carga eager a los
        // 2s, o al vuelo desde openAdmin()) — este acceso directo por URL
        // puede llegar antes de que exista, así que hay que esperar a que
        // esté listo antes de tocar sus elementos (si no, "#admin-overlay"
        // aún no existe y todo esto revienta con un error silencioso).
        if (typeof loadAdminShell === 'function' && !window._adminShellLoaded) {
          await new Promise(resolve => loadAdminShell(resolve));
        }
        setTimeout(() => {
          logActivity('🔗 Acceso bimba por URL token');
          _adminLoggedIn = true; window._adminLoggedIn = true;
          openStockConfigSecret();
          document.getElementById('admin-overlay').classList.add('open');
          document.getElementById('admin-login').style.display = 'none';
          document.getElementById('admin-panel').style.display = 'block';
        }, 300);
      }
    } catch (e) { /* red caída: simplemente no se concede acceso */ }
  }
})();

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — SECUENCIA DE TECLADO (DESACTIVADO)
//  Se desactivó a propósito: el panel ahora exige siempre
//  email + contraseña real para entrar (login contra Firebase).
//  Si en el futuro se quiere reactivar un atajo, no debe omitir
//  el login real — debe disparar fb_adminLogin(email, pwd).
// ══════════════════════════════════════════════
/*
(function setupKeySequence() {
  // Hash SHA-256 (con sal) de la palabra secreta — no queda en texto plano en el código
  const _SALT = 'dpf_2026_x7q';
  const SECRET_HASH = '87969d534baccdc20b664e7b6522f4aa6bec237677b8a046cd1658045ee10345';
  const SECRET_LEN = 4; // longitud de la palabra secreta original
  let buffer = '';
  let bufTimer = null;
  async function _sha256(str) {
    const enc = new TextEncoder().encode(str + _SALT);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  document.addEventListener('keypress', function (e) {
    const _ao = document.getElementById('admin-overlay');
    if (_ao && _ao.classList.contains('open')) return;
    // No activar si el usuario está escribiendo en un campo de texto
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    buffer += e.key.toLowerCase();
    if (buffer.length > SECRET_LEN) buffer = buffer.slice(-SECRET_LEN);
    clearTimeout(bufTimer);
    bufTimer = setTimeout(() => {
      buffer = '';
    }, 1200);
    if (buffer.length === SECRET_LEN) {
      _sha256(buffer).then(h => {
        if (h === SECRET_HASH) {
          buffer = '';
          logActivity('⌨️ Acceso por secuencia de teclado');
          openAdmin();
        }
      });
    }
  });
})();
*/
window._secretKeyBuf = '';
document.addEventListener('keydown', function (e) {
  var _document$getElementB8;
  if (((_document$getElementB8 = document.getElementById('stock-overlay')) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.style.display) === 'block') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key.length === 1) {
    var _document$getElementB9;
    window._secretKeyBuf += e.key.toLowerCase();
    if (window._secretKeyBuf.length > 30) window._secretKeyBuf = window._secretKeyBuf.slice(-30);
    // Nota: el atajo de teclado que abría el panel bimba escribiendo el PIN
    // en cualquier parte de la página se ha quitado — comprobaba el hash en
    // el cliente (inseguro) y no se puede pasar a bimba-verify.php sin
    // disparar una petición por cada tecla. Usa el candado (secureLockTap).
    if ((_document$getElementB9 = document.getElementById('admin-overlay')) !== null && _document$getElementB9 !== void 0 && _document$getElementB9.classList.contains('open')) {
      const inp = document.getElementById('log-secret-input');
      if (inp) {
        inp.value = window._secretKeyBuf.slice(-10);
        checkLogSecret(inp.value);
      }
    }
  } else if (e.key === 'Backspace') {
    window._secretKeyBuf = window._secretKeyBuf.slice(0, -1);
  } else {
    window._secretKeyBuf = '';
  }
});

// ══════════════════════════════════════════════
//  LOG DE ACTIVIDAD
// ══════════════════════════════════════════════
const ACTIVITY_LOG_KEY = 'dpf_activity_log';
function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}
function logActivity(action, extra) {
  const log = getActivityLog();
  const now = new Date();
  // "extra" permite adjuntar datos estructurados (tipo, orderNum, fecha...)
  // a una alerta, para que renderAlertas() pueda ofrecer un botón de
  // "reintentar" en vez de solo "descartar" — igual que ya hacía
  // fbAgregarActivityLog() en el servidor para "pedido_no_guardado".
  const entry = Object.assign({}, extra, {
    ts: now.toISOString(),
    time: now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    action
  });
  log.unshift(entry);
  const trimmed = log.slice(0, 200);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmed));
  // Solo guardar en Firebase si hay sesión activa (evita permission_denied en intentos de login)
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(trimmed).catch(() => {});
  }
  if (typeof updateAlertBadge === 'function') updateAlertBadge();
}
function renderActivityLog() {
  const log = getActivityLog();
  const el = document.getElementById('activity-log-list');
  if (!el) return;
  if (!log.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin actividad registrada</div>';
    return;
  }
  // e.action pasa por logActivity() desde toda la app y a menudo lleva
  // texto libre interpolado (nombres de ingredientes, proveedores,
  // empleados, categorías...) — hay que escapar aquí, en el único sitio
  // donde se renderiza, en vez de perseguir cada origen por separado.
  el.innerHTML = log.map(e => "\n    <div style=\"display:flex;align-items:flex-start;padding:8px 10px;background:#FFFFFF;border:1px solid #F5E6C8;border-radius:8px\">\n      <span style=\"font-size:11px;color:#8A6A4E;white-space:nowrap;min-width:130px\">".concat(escapeHtml(e.time), "</span>\n      <span style=\"font-size:13px;color:#2A1506;flex:1\">").concat(escapeHtml(e.action), "</span>\n    </div>")).join('');
}

// ══════════════════════════════════════════════
//  ALERTAS (subconjunto del registro de actividad: fallos silenciosos
//  al guardar pedidos/sellos y precios que no cuadran con la carta)
// ══════════════════════════════════════════════
const ALERTAS_SEEN_KEY = 'dpf_alertas_last_seen_ts';
function isAlertEntry(action) {
  return typeof action === 'string' && (action.indexOf('⚠️') === 0 || action.indexOf('🚨') === 0);
}
function getAlertEntries() {
  return getActivityLog().filter(e => isAlertEntry(e.action) && !e.resolved);
}
function updateAlertBadge() {
  const badge = document.getElementById('alertas-tab-badge');
  if (!badge) return;
  const lastSeen = localStorage.getItem(ALERTAS_SEEN_KEY) || '';
  const unseen = getAlertEntries().filter(e => (e.ts || '') > lastSeen).length;
  const incidenciasNuevas = (typeof _incidenciasNuevasCount === 'function') ? _incidenciasNuevasCount() : 0;
  const total = unseen + incidenciasNuevas;
  if (total > 0) {
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// ══════════════════════════════════════════════
//  INCIDENCIAS DE CLIENTES (formulario Tally "¿Algún problema con tu
//  pedido?", enlazado en el pie de la web — webhook-incidencia.php las
//  guarda en Firebase en el nodo "incidencias")
// ══════════════════════════════════════════════
window._incidenciasCache = window._incidenciasCache || {};
function _incidenciasNuevasCount() {
  return Object.values(window._incidenciasCache).filter(i => (i.estado || 'nueva') === 'nueva').length;
}
function _formatearFechaIncidencia(fecha) {
  if (!fecha) return '';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return escapeHtml(String(fecha));
    return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return escapeHtml(String(fecha)); }
}
function toggleIncidenciasPanel() {
  const body = document.getElementById('incidencias-panel-body');
  const chevron = document.getElementById('incidencias-chevron');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (chevron) chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
function renderIncidencias() {
  const countEl = document.getElementById('incidencias-count-header');
  if (countEl) {
    const n = _incidenciasNuevasCount();
    countEl.textContent = n > 0 ? ' (' + n + ')' : '';
  }
  const el = document.getElementById('incidencias-list');
  if (!el) return;
  function _tarjetaIncidencia([key, inc]) {
    const nueva = (inc.estado || 'nueva') === 'nueva';
    const bg = nueva ? '#FBEAE7' : '#F7F3EC';
    const border = nueva ? '#F0CFC8' : '#EEE3D0';
    const fecha = _formatearFechaIncidencia(inc.fecha);
    const camposHtml = Object.entries(inc.respuestas || {}).map(([label, valor]) =>
      '<div style="margin-bottom:4px"><span style="font-size:11px;color:#8A6A4E;font-weight:700">' + escapeHtml(label) + ':</span> <span style="font-size:13px;color:#2A1506">' + escapeHtml(String(valor)) + '</span></div>'
    ).join('');
    return '<div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:' + bg + ';border:1px solid ' + border + '">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<span style="font-size:11px;font-weight:700;color:' + (nueva ? '#c0392b' : '#8A6A4E') + '">' + (nueva ? '🚩 NUEVA' : '✅ Resuelta') + '</span>'
      + '<span style="font-size:10.5px;color:#8A6A4E">' + fecha + '</span>'
      + '</div>'
      + (camposHtml || '<div style="font-size:12px;color:#8A6A4E">Sin detalle</div>')
      + (nueva ? '<div style="display:flex;justify-content:flex-end"><button onclick="marcarIncidenciaResuelta(\'' + escapeAttr(key) + '\')" style="padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Marcar resuelta</button></div>' : '')
      + '</div>';
  }
  const entries = Object.entries(window._incidenciasCache)
    .sort((a, b) => (b[1].fecha || '').localeCompare(a[1].fecha || ''));
  const nuevas = entries.filter(([, inc]) => (inc.estado || 'nueva') === 'nueva');
  const resueltas = entries.filter(([, inc]) => (inc.estado || 'nueva') !== 'nueva');
  if (!entries.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin incidencias</div>';
  } else {
    // Las resueltas van plegadas detrás de un botón, igual que "Ver
    // pedidos entregados" en Pedidos en vivo — solo las nuevas se ven de
    // primeras.
    const nuevasHtml = nuevas.map(_tarjetaIncidencia).join('');
    const resueltasHtml = resueltas.length
      ? '<button onclick="var d=this.nextElementSibling;d.style.display=d.style.display===\'none\'?\'flex\':\'none\';this.textContent=d.style.display===\'none\'?\'Ver incidencias resueltas (' + resueltas.length + ')\':\'Ocultar resueltas\'" style="width:100%;background:none;border:0.5px solid #e0e0e0;border-radius:8px;padding:8px 16px;font-size:13px;color:#8A6A4E;cursor:pointer;font-family:\'DM Sans\',sans-serif;margin-top:6px">Ver incidencias resueltas (' + resueltas.length + ')</button><div style="display:none;flex-direction:column;gap:10px;margin-top:10px">' + resueltas.map(_tarjetaIncidencia).join('') + '</div>'
      : '';
    el.innerHTML = (nuevasHtml || (resueltas.length ? '' : '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin incidencias nuevas</div>')) + resueltasHtml;
  }
  updateAlertBadge();
}
async function marcarIncidenciaResuelta(key) {
  if (window._incidenciasCache[key]) window._incidenciasCache[key].estado = 'resuelta';
  renderIncidencias();
  if (window.fb_setIncidenciaEstado) {
    try { await window.fb_setIncidenciaEstado(key, 'resuelta'); }
    catch (e) { console.warn('[incidencias] error al marcar resuelta', e); }
  }
}
// Persiste el log completo (local + Firebase si hay sesión) — usado tanto
// por logActivity() como por resolverAlerta() al marcar una entrada.
function _persistActivityLog(log) {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(log).catch(() => {});
  }
}
// Marca una alerta como resuelta (desaparece de la lista y del badge, pero
// sigue existiendo en el registro de actividad completo). Se usa tanto al
// pulsar "Descartar" como automáticamente tras un "Reintentar" con éxito.
function resolverAlerta(ts) {
  const log = getActivityLog();
  const entry = log.find(e => e.ts === ts);
  if (!entry) return;
  entry.resolved = true;
  _persistActivityLog(log);
  renderAlertas();
}
function _alertaDomId(ts) {
  return 'alerta-' + String(ts).replace(/[^a-zA-Z0-9]/g, '');
}
async function reintentarGuardadoPedido(ts, orderNum, fecha) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    const res = await fetch('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reintentarStats', orderNum, fecha })
    });
    const data = await res.json();
    if (data.success) {
      resolverAlerta(ts); // vuelve a pintar la lista sin esta tarjeta
    } else {
      if (btn) { btn.disabled = false; btn.textContent = '🔧 Reintentar guardado'; }
      if (statusEl) { statusEl.textContent = '❌ ' + (data.error || 'No se pudo recuperar.'); statusEl.style.display = 'block'; }
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🔧 Reintentar guardado'; }
    if (statusEl) { statusEl.textContent = '❌ Error de conexión, inténtalo de nuevo.'; statusEl.style.display = 'block'; }
  }
}
// Reimprime un ticket que falló al enviarse a la térmica — recupera los
// datos del pedido de las estadísticas de hoy (ya en localStorage/Firebase,
// no hace falta pedirlos otra vez) y vuelve a intentar el envío por USB.
async function reintentarImpresionTicket(ts, orderNum, fecha) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    let stats;
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch (e) { stats = {}; }
    const order = (stats && stats.date === fecha && Array.isArray(stats.orders)) ? stats.orders.find(o => o.num === orderNum) : null;
    if (!order) throw new Error('No se encontró el pedido (¿es de otro día? solo se guarda el de hoy)');
    const ticketData = {
      orderNum: order.num,
      name: order.name,
      phone: order.phone || '',
      notes: order.notes || '',
      slotTime: order.slot || null,
      items: order.items || [],
      total: order.total,
      time: order.time
    };
    await imprimirTicketTermico(ticketData);
    if (typeof _markAsImpreso === 'function') _markAsImpreso(order.num);
    if (typeof _registrarEnvioTicket === 'function') _registrarEnvioTicket(order.num, true);
    resolverAlerta(ts);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🖨️ Reintentar impresión'; }
    if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'No se pudo imprimir.'); statusEl.style.display = 'block'; }
  }
}
// Reintenta sumar un sello de fidelización que falló (p.ej. por el límite
// de intentos, que se resuelve solo pasados unos minutos). No se conserva
// si el pedido original consumía un premio — eso es poco frecuente y, si
// pasara, se ajusta a mano desde el panel de Fidelización.
async function reintentarSelloFidelizacion(ts, orderNum, telefono, nombre) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'registrarSello', telefono, orderNum, tienePatata: true, consumioPremio: false, nombre: nombre || '' })
    });
    const data = await res.json();
    if (data.success || data.skipped) {
      resolverAlerta(ts);
    } else {
      throw new Error(data.error || 'El servidor rechazó el sello');
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🎁 Reintentar sello'; }
    if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'Error de conexión'); statusEl.style.display = 'block'; }
  }
}
// ── ESTADO DEL SISTEMA ── Chequeo rápido de las 3 piezas de las que
// depende un pedido: Firebase, el servidor (guardar-pedido.php) y la
// impresora de este dispositivo — para enterarse de un problema mirando
// el panel, en vez de solo cuando ya ha fallado un pedido real.
let _estadoSistemaUltimoCheck = 0;
async function comprobarEstadoSistema(forzar) {
  const el = document.getElementById('estado-sistema-list');
  if (!el) return;
  // Throttle: si ya se comprobó hace menos de un minuto y no se ha pedido
  // a la fuerza (botón "Comprobar ahora"), no repetir en cada re-render.
  if (!forzar && Date.now() - _estadoSistemaUltimoCheck < 60000) return;
  _estadoSistemaUltimoCheck = Date.now();
  el.innerHTML = '<div style="font-size:12px;color:var(--muted)">Comprobando…</div>';

  let fbOk = false;
  try {
    if (window.fb_checkConnection) fbOk = await window.fb_checkConnection();
  } catch (e) {}

  let servidorOk = false;
  try {
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' })
    }, 6000);
    const data = await res.json();
    servidorOk = !!data.success;
  } catch (e) {}

  // La impresora es "opcional" (ok:null) si esta pantalla nunca ha llegado
  // a intentar conectar con ninguna — no es un fallo, solo no aplica aquí.
  const impresoraConectada = typeof _ptIsConnected === 'function' ? _ptIsConnected() : null;

  const resultados = [
    { nombre: 'Firebase (base de datos)', ok: fbOk },
    { nombre: 'Servidor de pedidos', ok: servidorOk },
    { nombre: 'Impresora térmica (este dispositivo)', ok: impresoraConectada }
  ];
  el.innerHTML = resultados.map(r => {
    const icono = r.ok === null ? '⚪' : r.ok ? '✅' : '❌';
    const color = r.ok === null ? 'var(--muted)' : r.ok ? '#166534' : '#c0392b';
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0"><span style="color:var(--text)">' + r.nombre + '</span><span style="font-weight:700;color:' + color + '">' + icono + '</span></div>';
  }).join('') + '<div style="font-size:10.5px;color:var(--muted);margin-top:8px">Última comprobación: ' + new Date().toLocaleTimeString('es-ES') + '</div>';
}
function renderAlertas() {
  const entries = getAlertEntries();
  const el = document.getElementById('alertas-list');
  if (!el) return;
  if (!entries.length) {
    el.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">✅ Sin avisos pendientes</div>';
  } else {
    el.innerHTML = entries.map(e => {
      const critico = e.action.indexOf('🚨') === 0;
      const bg = critico ? '#FBEAE7' : '#FDECD5';
      const border = critico ? '#F0CFC8' : '#EFD6A9';
      let retryBtn = '';
      if (e.tipo === 'pedido_no_guardado' && e.orderNum && e.fecha) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarGuardadoPedido('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.fecha), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🔧 Reintentar guardado</button>");
      } else if (e.tipo === 'ticket_no_impreso' && e.orderNum && e.fecha) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarImpresionTicket('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.fecha), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🖨️ Reintentar impresión</button>");
      } else if (e.tipo === 'sello_no_registrado' && e.orderNum && e.telefono) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarSelloFidelizacion('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.telefono), "','").concat(escapeAttr(e.nombre || ''), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🎁 Reintentar sello</button>");
      }
      return "\n      <div id=\"".concat(_alertaDomId(e.ts), "\" style=\"display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:").concat(bg, ";border:1px solid ").concat(border, "\">\n        <div style=\"display:flex;gap:10px;align-items:flex-start\">\n          <span style=\"font-size:13px;color:#2A1506;flex:1\">").concat(escapeHtml(e.action), "</span>\n          <span style=\"font-size:10.5px;color:#8A6A4E;white-space:nowrap\">").concat(escapeHtml(e.time), "</span>\n        </div>\n        <div class=\"alerta-retry-status\" style=\"display:none;font-size:11.5px;color:#c0392b;font-weight:600\"></div>\n        <div style=\"display:flex;gap:8px;justify-content:flex-end\">\n          ").concat(retryBtn, "\n          <button onclick=\"resolverAlerta('").concat(escapeAttr(e.ts), "')\" style=\"padding:6px 12px;background:transparent;color:#8A6A4E;border:1.5px solid #D8C6AE;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">✕ Descartar</button>\n        </div>\n      </div>");
    }).join('');
  }
  // Marcar como vistos: la próxima vez que se recalcule el badge, estos
  // avisos ya no cuentan como nuevos.
  if (entries.length) localStorage.setItem(ALERTAS_SEEN_KEY, entries[0].ts || new Date().toISOString());
  updateAlertBadge();
  if (typeof comprobarEstadoSistema === 'function') comprobarEstadoSistema();
}
function clearActivityLog() {
  if (!confirm('¿Borrar todo el log de actividad?')) return;
  localStorage.removeItem(ACTIVITY_LOG_KEY);
  if (window.fb_saveActivityLog) window.fb_saveActivityLog([]).catch(() => {});
  renderActivityLog();
}

// ══════════════════════════════════════════════
//  AUTO-BORRADO DEL HISTORIAL
// ══════════════════════════════════════════════
const AUTODELETE_KEY = 'dpf_autodelete_days';
function getAutoDeleteDays() {
  return parseInt(localStorage.getItem(AUTODELETE_KEY) || '0', 10);
}
function saveAutoDelete() {
  const sel = document.getElementById('autodelete-days');
  if (!sel) return;
  const days = parseInt(sel.value, 10);
  localStorage.setItem(AUTODELETE_KEY, days);
  if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(days).catch(() => {});
  applyAutoDelete();
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "\u2705 Se borrar\xE1n entradas con m\xE1s de ".concat(days, " d\xEDas");
  logActivity("\u2699\uFE0F Auto-borrado historial configurado: ".concat(days === 0 ? 'desactivado' : days + ' días'));
}
function applyAutoDelete() {
  const days = getAutoDeleteDays();
  if (!days) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const original = getHistorial();
  const before = original.length;
  // Cap de seguridad: nunca más de 365 entradas independientemente del filtro de fecha
  const hist = original.filter(d => d.date >= cutoffStr).slice(0, 365);
  if (hist.length !== before) {
    // Las fechas borradas se calculan ANTES de sobrescribir localStorage —
    // antes se recalculaban leyendo getHistorial() DESPUÉS del
    // localStorage.setItem() de abajo, así que siempre salía una lista
    // vacía (ya no quedaba ninguna fecha antigua que leer) y stats/{fecha}
    // nunca llegaba a borrarse de Firebase, solo de localStorage.
    const deletedDates = original
      .filter(d => d.date < cutoffStr)
      .map(d => d.date);
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
    // Borrar también los días eliminados de Firebase (stats/{fecha})
    if (typeof firebase !== 'undefined' && firebase.database) {
      deletedDates.forEach(date => {
        firebase.database().ref('stats/' + date).remove().catch(() => {});
      });
    }
  }
}
function loadAutoDeleteUI() {
  const days = getAutoDeleteDays();
  const sel = document.getElementById('autodelete-days');
  if (sel) sel.value = days;
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "Se borran entradas con m\xE1s de ".concat(days, " d\xEDas");
}

// ══════════════════════════════════════════════
//  EXPORTAR HISTORIAL CIFRADO (AES-256 via Web Crypto)
// ══════════════════════════════════════════════
function exportHistorialEncrypted() {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial para exportar');
    return;
  }
  document.getElementById('encrypt-pwd').value = '';
  document.getElementById('encrypt-pwd2').value = '';
  document.getElementById('encrypt-error').style.display = 'none';
  document.getElementById('encrypt-modal').style.display = 'block';
}
async function doEncryptExport() {
  const pwd = document.getElementById('encrypt-pwd').value;
  const pwd2 = document.getElementById('encrypt-pwd2').value;
  const errEl = document.getElementById('encrypt-error');
  if (!pwd || pwd.length < 4) {
    errEl.textContent = 'La contraseña debe tener al menos 4 caracteres';
    errEl.style.display = 'block';
    return;
  }
  if (pwd !== pwd2) {
    errEl.textContent = 'Las contraseñas no coinciden';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  try {
    const hist = getHistorial();
    const json = JSON.stringify(hist);
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMat = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    }, keyMat, {
      name: 'AES-GCM',
      length: 256
    }, false, ['encrypt']);
    const cipher = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, key, enc.encode(json));
    // Empaquetar: "DPF1" + salt(16) + iv(12) + ciphertext
    const header = enc.encode('DPF1');
    const out = new Uint8Array(4 + 16 + 12 + cipher.byteLength);
    out.set(header, 0);
    out.set(salt, 4);
    out.set(iv, 20);
    out.set(new Uint8Array(cipher), 32);
    const b64 = btoa(String.fromCharCode(...out));
    const blob = new Blob([b64], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "historial_cifrado_".concat(fecha, ".dpf");
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('encrypt-modal').style.display = 'none';
    logActivity('🔐 Historial exportado cifrado');
  } catch (e) {
    errEl.textContent = 'Error al cifrar: ' + e.message;
    errEl.style.display = 'block';
  }
}

// ── EXPORTAR CSV ──
function exportTodayCSV() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (!stats.orders || !stats.orders.length) {
    alert('No hay pedidos hoy');
    return;
  }
  downloadCSV(stats, "pedidos_".concat(todayKey, ".csv"));
}
// El nombre del cliente es texto libre sin restricción de caracteres — una
// comilla suelta dentro de un campo entrecomillado corta el campo antes de
// tiempo y desplaza el resto de comas de esa fila a las columnas
// equivocadas al abrirlo en Excel/Sheets. Se duplica cada comilla interna,
// que es como CSV espera que se escapen ("" dentro de un campo "...").
function _csvEscape(str) {
  return String(str == null ? '' : str).replace(/"/g, '""');
}
function exportHistorialCSV() {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial');
    return;
  }
  let rows = ['Fecha,Num Pedido,Cliente,Hora,Turno,Total (€)'];
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      rows.push("".concat(day.date, ",").concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
    });
  });
  const blob = new Blob([rows.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historial_pedidos.csv';
  a.click();
  URL.revokeObjectURL(url);
}
function downloadCSV(stats, filename) {
  let rows = ['Num Pedido,Cliente,Hora,Turno,Total (€)'];
  stats.orders.forEach(o => {
    rows.push("".concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat(o.total.toFixed(2)));
  });
  const blob = new Blob([rows.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── MODO IMPRESIÓN TÉRMICA 80mm ──
let currentTicketData = null;

// Genera HTML del ticket optimizado para 80mm
function buildTicketHTML(data) {
  const orderNum = data.orderNum,
    name = data.name,
    phone = data.phone,
    notes = data.notes,
    slotTime = data.slotTime,
    items = data.items,
    total = data.total,
    time = data.time;
  const tc = getTicketConfig();
  const sep = '─'.repeat(32);
  const sep2 = '═'.repeat(32);
  // Los nombres de producto/extras vienen de lo que el navegador mand\u00F3 a
  // guardar-pedido.php \u2014 pueden manipularse con una petici\u00F3n directa al
  // servidor (sin pasar por la web), as\u00ED que hay que escaparlos igual que
  // nombre/tel\u00E9fono/notas de abajo, no son m\u00E1s de fiar que esos.
  let itemsHTML = items.map(_ref21 => {
    let n = escapeHtml(_ref21.name),
      qty = _ref21.qty,
      subtotal = _ref21.subtotal,
      extras = _ref21.extras;
    const right = subtotal.toFixed(2) + ' \u20AC';
    const label = qty + 'x ' + n;
    if (extras && extras.length > 0) {
      const extrasList = extras.map(function(e) {
        const extraName = escapeHtml((e && e.name) ? e.name : e);
        const extraPrice = (e && e.price) ? '+' + parseFloat(e.price).toFixed(2).replace('.', ',') + ' \u20AC' : '';
        return '<div style="display:flex;justify-content:space-between"><span>&nbsp;&nbsp;&nbsp;\xB7 ' + extraName + '</span>' + (extraPrice ? '<span style="color:#aaa">' + extraPrice + '</span>' : '') + '</div>';
      }).join('');
      return '<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div><div style="font-size:10px;color:#333;line-height:1.8;margin-top:1px">' + extrasList + '</div></div>';
    } else if (label.length <= 26) {
      return '<div style="display:flex;justify-content:space-between"><span style="flex:1">' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div>';
    } else {
      return '<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">' + label + '</div><div style="text-align:right;font-weight:bold">' + right + '</div></div>';
    }
  }).join('');

  // El nombre/tel\u00E9fono/notas los escribe el propio cliente en el checkout
  // (solo se les limita la longitud, no los caracteres) y este HTML se
  // inyecta luego con innerHTML en el panel de admin al ver/imprimir el
  // ticket \u2014 sin escapar, un nombre o nota con <script> o <img onerror=...>
  // se ejecutar\u00EDa en el navegador de quien lo abra con su sesi\u00F3n de admin.
  const nameSafe = escapeHtml(name || '');
  const notesSafe = escapeHtml(notes || '');
  const phoneSafe = escapeHtml(phone || '');

  const headerRow = slotTime
    ? '<div style="display:flex;align-items:stretch;margin:4px 0"><div style="flex:1;padding-right:10px;text-align:center"><div style="font-size:9px;color:#555;letter-spacing:1px;text-transform:uppercase">Hora recogida</div><div style="font-size:22px;font-weight:bold">' + slotTime + 'h</div></div><div style="width:1px;background:#000;margin:2px 0"></div><div style="flex:1;padding-left:10px;display:flex;align-items:center;justify-content:center"><div style="font-size:18px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:1px">' + nameSafe.toUpperCase().replace(' ', '<br>') + '</div></div></div>'
    : '<div style="font-size:22px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:4px 0">' + nameSafe.toUpperCase() + '</div>';

  return "\n    <div style=\"text-align:center;margin-bottom:6px\">\n      <div style=\"font-size:15px;font-weight:bold;letter-spacing:1px\">" + tc.nombre + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.direccion + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.telefono + "</div>\n    </div>\n    <div style=\"border-top:2px solid #000;margin:6px 0\"></div>\n    " + headerRow + "\n    " + (phoneSafe ? '<div style="font-size:11px;color:#555;text-align:center;margin-bottom:2px">Tlfno. ' + phoneSafe + '</div>' : '') + "\n    <div style=\"border-top:1.5px solid #000;margin:6px 0 4px\"></div>\n    <div style=\"font-size:18px;font-weight:bold;text-align:center;letter-spacing:3px\">PEDIDO ".concat(orderNum, "</div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-bottom:4px\">").concat(time, "</div>\n    <div style=\"border-top:1.5px solid #000;margin:4px 0 6px\"></div>\n    <div style=\"font-size:11px\">").concat(itemsHTML, "</div>\n    <div style=\"border-top:1px dashed #000;margin:6px 0\"></div>\n    <div style=\"display:flex;justify-content:space-between;font-size:13px;font-weight:bold\">\n      <span>TOTAL</span><span>").concat(total.toFixed(2), " \u20AC</span>\n    </div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-top:2px\">").concat(tc.textoPago, "</div>\n    ").concat(notesSafe ? "<div style=\"border-top:1px dashed #000;margin:6px 0\"></div><div style=\"font-size:10px\"><b>NOTAS:</b> ".concat(notesSafe, "</div>") : '', "\n    <div style=\"border-top:1px dashed #000;margin:8px 0\"></div>\n    <div style=\"text-align:center;font-size:10px;color:#555\">").concat(tc.despedida, "</div>\n    <div style=\"margin-bottom:16px\"></div>\n  ");
}
function openPrintModal(ticketData) {
  currentTicketData = ticketData;
  const html = buildTicketHTML(ticketData);
  document.getElementById('ticket-html-preview').innerHTML = html;
  document.getElementById('print-modal').style.display = 'block';
}
function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}
// Reintenta imprimir varias veces con un pequeño margen entre intentos antes
// de darse por vencido — un corte momentáneo de USB (la impresora a veces se
// desconecta sola) ya no genera una alerta a la primera; solo si de verdad
// fallan todos los intentos se avisa.
function _imprimirConReintentos(ticketData, intentosRestantes, esperaMs) {
  return imprimirTicketTermico(ticketData).catch(e => {
    if (intentosRestantes <= 1) throw e;
    return new Promise(resolve => setTimeout(resolve, esperaMs))
      .then(() => _imprimirConReintentos(ticketData, intentosRestantes - 1, esperaMs));
  });
}
function doPrint() {
  if (!currentTicketData) return;
  const orderNum = currentTicketData.orderNum;
  const ticketData = currentTicketData;

  // Imprimir de verdad en la térmica (WebUSB) — el registro de abajo refleja
  // este resultado (si de verdad salió por la impresora), no el guardado en Firebase.
  _imprimirConReintentos(ticketData, 3, 1500).then(() => {
    _markAsImpreso(orderNum);
    _registrarEnvioTicket(orderNum, true);
  }).catch(e => {
    console.warn('[Impresora] error al imprimir tras varios intentos', e);
    _registrarEnvioTicket(orderNum, false);
    _avisarFalloEnvioTicket(orderNum);
    alert('⚠️ No se pudo imprimir en la térmica (' + e.message + '). Se abrirá el diálogo de impresión del navegador como alternativa.');
    window.print();
  });

  // Guardar también en Firebase (histórico de reimpresiones, usado también por fidelización)
  if (window.fb_saveTicket) {
    const reimprKey = 'R' + Date.now();
    const ticketParaImpresora = Object.assign({}, ticketData, { _reimprimir: true });
    window.fb_saveTicket(reimprKey, ticketParaImpresora).catch(() => {});
  }
  closePrintModal();
}
function printLastTicket() {
  if (_lastTicketData) openPrintModal(_lastTicketData);
}
// Envía un pedido nuevo directo a la impresora térmica sin pasar por el
// modal de vista previa — lo dispara el listener de fb_listenStats cuando
// getTicketConfig().autoImprimir está activo. Sin el flag _reimprimir de
// doPrint(): este es el print "original" del sistema, no una reimpresión
// manual desde el panel.
function _autoImprimirPedido(order) {
  const ticketData = {
    orderNum: order.num,
    name: order.name,
    phone: order.phone || '',
    notes: order.notes || '',
    slotTime: order.slot || null,
    items: order.items || [],
    total: order.total,
    time: order.time,
    esEstudianteJubilado: order.esEstudianteJubilado || false
  };

  // Imprimir de verdad en la térmica (WebUSB) en esta tablet — con
  // reintentos automáticos antes de avisar (ver _imprimirConReintentos).
  _imprimirConReintentos(ticketData, 3, 1500)
    .then(() => { _markAsImpreso(order.num); _registrarEnvioTicket(order.num, true); })
    .catch(e => {
      console.warn('[Impresora] auto-imprimir falló para ' + order.num + ' tras varios intentos', e);
      _registrarEnvioTicket(order.num, false);
      _avisarFalloEnvioTicket(order.num);
    });

  // Guardar también en Firebase (histórico, usado por fidelización)
  if (window.fb_saveTicket) {
    const key = 'A' + Date.now() + '_' + order.num;
    window.fb_saveTicket(key, ticketData).catch(() => {});
  }
}
// Aviso real cuando el envío del ticket a Firebase falla (offline, permisos...).
// No sabemos si la impresora física llegó a sacar el papel — de eso se encarga
// el programa que la conecta, fuera de esta web — pero al menos esto ya no se
// queda callado como antes.
function _avisarFalloEnvioTicket(orderNum) {
  logActivity('⚠️ Fallo al enviar el ticket del pedido #' + orderNum + ' a la impresora — revisa la conexión', {
    tipo: 'ticket_no_impreso',
    orderNum,
    fecha: new Date().toISOString().slice(0, 10)
  });
}
const TICKET_SEND_LOG_KEY = 'dpf_ticket_send_log';
function _registrarEnvioTicket(orderNum, ok) {
  let log = [];
  try { log = JSON.parse(localStorage.getItem(TICKET_SEND_LOG_KEY) || '[]'); } catch (e) {}
  const todayKey = new Date().toISOString().slice(0, 10);
  log.unshift({ num: orderNum, date: todayKey, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), ok });
  // Guarda hasta 300 entradas (varios días de margen) — el panel solo
  // enseña las de hoy, esto es solo para no dejar crecer localStorage sin límite.
  localStorage.setItem(TICKET_SEND_LOG_KEY, JSON.stringify(log.slice(0, 300)));
  if (typeof _renderTicketSendLog === 'function') _renderTicketSendLog();
}
// Panel de "trabajos de impresión de hoy": antes solo se veían los últimos
// 15 tickets enviados (de cualquier día mezclados) — ahora se ven TODOS los
// de hoy en este dispositivo, con un resumen de cuántos salieron bien/mal.
function _renderTicketSendLog() {
  const el = document.getElementById('tc-envios-log');
  if (!el) return;
  let log = [];
  try { log = JSON.parse(localStorage.getItem(TICKET_SEND_LOG_KEY) || '[]'); } catch (e) {}
  const todayKey = new Date().toISOString().slice(0, 10);
  const logHoy = log.filter(e => (e.date || todayKey) === todayKey);
  const resumenEl = document.getElementById('tc-envios-resumen');
  if (resumenEl) {
    if (logHoy.length) {
      const ok = logHoy.filter(e => e.ok).length;
      const fallos = logHoy.length - ok;
      resumenEl.textContent = logHoy.length + ' hoy · ✅ ' + ok + (fallos ? ' · ❌ ' + fallos : '');
    } else {
      resumenEl.textContent = '';
    }
  }
  el.innerHTML = logHoy.length ? logHoy.map(e =>
    '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--white);border:1.5px solid var(--warm);border-radius:8px;padding:7px 10px;font-size:12px">'
    + '<span>Pedido #' + escapeHtml(String(e.num)) + '</span>'
    + '<span style="color:' + (e.ok ? '#27855a' : '#c0392b') + ';font-weight:700">' + (e.ok ? '✅ Enviado · ' : '❌ Falló · ') + e.time + '</span>'
    + '</div>'
  ).join('') : '<div style="font-size:12px;color:var(--muted)">Todavía no se ha enviado ningún ticket hoy en este dispositivo</div>';
}
let _lastTicketData = null;
async function printOrderFromStats(num, name, time, total, slot) {
  // Try to get items from Firebase stats, fall back to localStorage
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch (e) {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  const order = stats && stats.orders ? stats.orders.find(o => o.num === num) : null;
  const items = order && order.items ? order.items : [];
  const phone = order && order.phone ? order.phone : '';
  const notes = order && order.notes ? order.notes : '';
  openPrintModal({
    orderNum: num,
    name,
    phone,
    notes,
    slotTime: slot || null,
    items,
    total: parseFloat(total),
    time
  });
}
async function exportTicketPDFFromStats(num, name, time, total, slot) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  const order = stats && stats.orders ? stats.orders.find(o => o.num === num) : null;
  const items = order && order.items ? order.items : [];
  const phone = order && order.phone ? order.phone : '';
  const notes = order && order.notes ? order.notes : '';
  exportTicketPDF(num, name, time, total, slot, items, phone, notes);
}
function scheduleSlotMidnightReset() {
  const now = new Date();
  const msSinceMidnight = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const msToMidnight = 86400000 - msSinceMidnight;
  setTimeout(() => {
    // Comprobar si los datos de slots son de un día anterior; si no, limpiar
    const data = getSlotsData();
    const todayKey = new Date().toISOString().slice(0, 10);
    if (data.date !== todayKey) {
      localStorage.removeItem(SLOTS_KEY);
    }
    // Limpiar estados de cocina del día anterior
    window._orderStatusCache = {};
    localStorage.removeItem(ORDER_STATUS_KEY);
    if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
    // Resetear flags de apertura para que el nuevo día empiece sin bloqueos del fin de noche
    localStorage.removeItem(OPEN_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem('dpf_open_manual_override');
    const _esAdminAutenticadoReset = !!(window.fb_getAdminUser && window.fb_getAdminUser());
    if (_esAdminAutenticadoReset) {
      firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
      if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(() => {});
      if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {});
    }
    // También archivar el día anterior en historial
    try {
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (stats.date && stats.date !== todayKey && stats.count > 0) {
        saveToHistorial(stats);
      }
    } catch {}
    // Salida automática: registrar salida a los empleados que olvidaron fichar
    try {
      const ayerKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // ayer (resta 1 día completo)
      const fich = fichajesLoad();
      const emps = empLoadAll();
      let modified = false;
      emps.forEach(emp => {
        const suyosAyer = fich.filter(f => f.empId === emp.id && f.fecha === ayerKey).sort((a, b) => a.hora.localeCompare(b.hora));
        // Si el último fichaje del día es una entrada, registrar salida automática a las 00:00
        if (suyosAyer.length > 0 && suyosAyer[suyosAyer.length - 1].tipo === 'entrada') {
          fich.push({
            empId: emp.id,
            fecha: ayerKey,
            hora: '00:00',
            tipo: 'salida',
            auto: true
          });
          modified = true;
        }
      });
      if (modified && _esAdminAutenticadoReset) fichajesSave(fich);
    } catch (e) {
      console.warn('Auto-checkout error', e);
    }
    scheduleSlotMidnightReset(); // reprogramar para la siguiente medianoche
  }, msToMidnight);
}

// ══════════════════════════════════════════
//  FIREBASE REALTIME LISTENERS
// ══════════════════════════════════════════
function initFirebaseListeners() {
  const todayKey = new Date().toISOString().slice(0, 10);
  console.log('[fee] initFirebaseListeners START, _firebaseReady=', window._firebaseReady);

  // Tarjeta de sellos: si ya conocemos el teléfono de este cliente (pedido
  // anterior), comprobamos sus sellos sin que tenga que escribir nada.
  try {
    const savedPhone = localStorage.getItem('dpf_customer_phone');
    if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
  } catch {}

  // Cargar config de gastos de gestión desde Firebase
  loadFeeFromFirebase();
  if (typeof loadFee2FromFirebase === 'function') loadFee2FromFirebase();
  if (typeof loadLocalFeeCodeFromFirebase === 'function') loadLocalFeeCodeFromFirebase();
  if (typeof loadStudentDiscountFromFirebase === 'function') loadStudentDiscountFromFirebase();
  // Cargar configuración del ticket desde Firebase
  loadTicketConfigFromFirebase();
  // Auto-pausa por saturación: configuración (umbral/mensaje/on-off) y
  // estado compartido entre dispositivos (¿está pausado por el sistema?)
  if (typeof loadAutoPausaConfigFromFirebase === 'function') loadAutoPausaConfigFromFirebase();
  if (typeof loadAutoPausaEstadoFromFirebase === 'function') loadAutoPausaEstadoFromFirebase();
  // Pausa exprés (cuenta atrás) y aviso suave previo a la auto-pausa
  if (typeof loadPausaExpresFromFirebase === 'function') loadPausaExpresFromFirebase();
  if (typeof loadAvisoSaturacionFromFirebase === 'function') loadAvisoSaturacionFromFirebase();

  // Aviso de "sin conexión" en la pantalla de cocina — la lista de pedidos
  // ya sigue mostrando lo último que se vio (localStorage/último render) si
  // se corta el wifi, pero sin este aviso nadie en cocina se entera de que
  // los pedidos nuevos podrían no estar llegando. Mismo margen de 6s que el
  // banner del cliente, para no alarmar por un corte breve al cambiar de red.
  if (window.fb_listenConnectionState) {
    let _kitchenOfflineTimeout = null;
    window.fb_listenConnectionState(connected => {
      const badge = document.getElementById('kitchen-offline-badge');
      if (!badge) return;
      if (connected) {
        if (_kitchenOfflineTimeout) { clearTimeout(_kitchenOfflineTimeout); _kitchenOfflineTimeout = null; }
        badge.style.display = 'none';
      } else if (!_kitchenOfflineTimeout) {
        _kitchenOfflineTimeout = setTimeout(() => {
          _kitchenOfflineTimeout = null;
          badge.style.display = 'block';
        }, 6000);
      }
    });
  }

  // Incidencias de clientes (formulario Tally) — en tiempo real, para que
  // el badge de la pestaña Alertas se actualice sin recargar.
  if (window.fb_listenIncidencias) {
    window.fb_listenIncidencias(incidencias => {
      window._incidenciasCache = incidencias || {};
      var _alertasSection = document.getElementById('admin-alertas');
      if (_alertasSection && _alertasSection.classList.contains('active')) renderIncidencias();
      updateAlertBadge();
    });
  }

  // Pedidos abiertos/cerrados y su mensaje, en tiempo real — antes solo se
  // cargaban una vez al abrir la página (init.js). Si la auto-pausa por
  // saturación cierra o reabre los pedidos mientras un cliente ya tiene la
  // web abierta, esto hace que vea el cambio al momento sin recargar.
  if (window.fb_listenOrdersOpen) {
    window.fb_listenOrdersOpen(val => {
      localStorage.setItem(ORDERS_KEY, val);
      updateOrdersUI(getOrdersOpen());
      if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
    });
  }
  if (window.fb_listenOrdersMsg) {
    window.fb_listenOrdersMsg(msg => {
      localStorage.setItem(ORDERS_MSG_KEY, msg);
      const inp = document.getElementById('orders-pause-msg');
      if (inp) inp.value = msg;
      updateOrdersUI(getOrdersOpen());
    });
  }

  // 1. Slots — sync counter across all devices in real time
  if (window.fb_listenSlots) {
    window.fb_listenSlots(slots => {
      // Re-render slot picker si está visible (cliente eligiendo)
      const picker = document.getElementById('slot-picker');
      if (picker && picker.offsetParent !== null) {
        renderSlotPicker();
        // Si el slot seleccionado se llenó, avisar al cliente
        if (selectedSlot) {
          const slotCount = slots[selectedSlot] || 0;
          const slotMax = getSlotMax();
          if (slotCount >= slotMax) {
            selectedSlot = null;
            document.querySelectorAll('.slot-btn').forEach(b => {
              b.classList.remove('slot-selected');
              b.style.background = '';
              b.style.borderColor = '';
              b.style.color = '';
            });
            const err = document.getElementById('slot-error');
            if (err) { err.textContent = '⚠️ El turno que habías elegido se ha llenado. Por favor elige otro horario.'; err.style.display = 'block'; err.style.color = '#c0392b'; }
          }
        }
      }
      // Comprobar si algún slot está casi lleno
      const slotMax = getSlotMax();
      Object.entries(slots || {}).forEach(([slot, count]) => {
        _checkSlotAlmostFull(slot, count, slotMax);
      });
      var _document$getElementB0;
      _slotsCache = slots || {};
      // Forzar que getSlotsData use _slotsCache en vez de stats locales
      // invalidando la fecha de stats para que no se use como fuente
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (stats && stats.date === todayKey) {
          // Sobrescribir los slots de stats con los de Firebase (fuente de verdad)
          stats._slotsOverride = slots || {};
          localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
      } catch (e) {}
      // Re-render slot picker if visible
      renderSlotPicker();
      // Re-render live orders slots if admin open
      if ((_document$getElementB0 = document.getElementById('admin-overlay')) !== null && _document$getElementB0 !== void 0 && _document$getElementB0.classList.contains('open')) {
        loadLiveOrders();
      }
    });
  }

  // 2. Stats / pedidos — sync orders across all devices
  if (window.fb_listenStats) {
    let _fbLastCount = null;
    window.fb_listenStats(todayKey, stats => {
      var _document$getElementB11, _document$getElementB12, _document$getElementB13, _document$getElementB14;
      if (!stats) return;
      const newCount = stats.count || 0;
      // Update localStorage cache
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));

      // Auto-pausa por saturación: se comprueba aquí (no solo dentro de
      // _renderLiveOrders) para que funcione siempre que este dispositivo
      // esté conectado como admin, sin depender de que la pestaña "Pedidos
      // en vivo" esté abierta en pantalla — en "Modo cocina" también debe
      // poder pausar/reactivar sola.
      if (typeof getOrderStatus === 'function') {
        const _pendientes = (stats.orders || []).filter(o => {
          const s = getOrderStatus(o.num);
          return s !== 'entregado' && s !== 'listo' && s !== 'cancelado';
        }).length;
        if (_adminLoggedIn && typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(_pendientes);
        // El aviso suave (banner + sonido previo) se calcula en cualquier
        // dispositivo — incluidos los clientes pidiendo, que necesitan ver
        // el aviso aunque no estén logueados como admin.
        if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(_pendientes);
      }

      // First call — set baseline, don't alert, but refresh UI
      if (_fbLastCount === null) {
        var _document$getElementB1, _document$getElementB10;
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        if ((_document$getElementB1 = document.getElementById('admin-pedidos')) !== null && _document$getElementB1 !== void 0 && _document$getElementB1.classList.contains('active')) loadLiveOrders();
        if ((_document$getElementB10 = document.getElementById('admin-stats')) !== null && _document$getElementB10 !== void 0 && _document$getElementB10.classList.contains('active')) loadDayStats();
        return;
      }
      // New order arrived
      if (newCount > _fbLastCount) {
        const diff = newCount - _fbLastCount;
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        _unseenOrders += diff;
        updateTabTitle(_unseenOrders);
        console.log('[DPF] NEW ORDER via Firebase! diff=' + diff + ' adminLoggedIn=' + _adminLoggedIn);
        // Si el panel está abierto pero _adminLoggedIn no se puso, forzarlo
        if (!_adminLoggedIn) {
          var adminPanel = document.getElementById('admin-panel');
          if (adminPanel && adminPanel.style.display !== 'none') {
            _adminLoggedIn = true; window._adminLoggedIn = true;
          }
        }
        if (_adminLoggedIn) {
          // guardar-pedido.php inserta los pedidos nuevos al PRINCIPIO del array
          // (array_unshift), no al final — por eso se cogen los primeros "diff"
          // elementos, no los últimos (si no, siempre se coge el pedido más viejo).
          const _nuevosPedidos = (stats.orders || []).slice(0, diff);
          if (getTicketConfig().autoImprimir) {
            _nuevosPedidos.forEach(_autoImprimirPedido);
          }
          // Se SUMA cada pedido nuevo al contador (por número, no se puede
          // duplicar) en vez de sobreescribirlo — antes, si llegaban dos
          // avisos de "pedido nuevo" seguidos antes de atender el primero,
          // el segundo pisaba el contador entero en vez de sumarse.
          _nuevosPedidos.forEach(o => _marcarPedidoPendienteAlerta(o.num));
          startAlertLoop();
          const toast = document.getElementById('new-order-toast');
          if (toast) {
            toast.style.display = 'block';
            setTimeout(() => {
              toast.style.display = 'none';
            }, 4000);
          }
        }
      } else {
        _fbLastCount = newCount;
      }
      // Refresh UI
      if ((_document$getElementB11 = document.getElementById('admin-pedidos')) !== null && _document$getElementB11 !== void 0 && _document$getElementB11.classList.contains('active')) loadLiveOrders();
      if ((_document$getElementB12 = document.getElementById('admin-stats')) !== null && _document$getElementB12 !== void 0 && _document$getElementB12.classList.contains('active')) loadDayStats();
      if ((_document$getElementB13 = document.getElementById('admin-pedidos')) !== null && _document$getElementB13 !== void 0 && _document$getElementB13.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB14 = document.getElementById('admin-stats')) !== null && _document$getElementB14 !== void 0 && _document$getElementB14.classList.contains('active')) {
        loadDayStats();
      }
    });
  }

  // 3. Order statuses — sync kitchen status across devices
  if (window.fb_listenOrderStatuses) {
    let _prevOrderStatuses = null; // null hasta el primer snapshot: evita avisar de cancelaciones ya existentes al abrir
    window.fb_listenOrderStatuses(statuses => {
      var _document$getElementB15, _document$getElementB16;
      const nuevos = statuses || {};

      // Aviso de cancelación/modificación: sonido distinto + ticket de anulación
      // en esta tablet, para pedidos que ACABAN de pasar a "cancelado"
      // (cancelarPedidoAdmin, y también cuando el cliente cancela o modifica
      // su propio pedido — todo pasa por el mismo _borrarPedidoDeFirebase).
      if (_prevOrderStatuses === null) {
        _prevOrderStatuses = nuevos;
      } else {
        Object.keys(nuevos).forEach(num => {
          if (nuevos[num] === 'cancelado' && _prevOrderStatuses[num] !== 'cancelado') {
            if (_adminLoggedIn) {
              playNotificationSound('urgente');
              if (getTicketConfig().autoImprimir) {
                imprimirAnulacion(num).catch(e => console.warn('[Impresora] fallo al imprimir anulación', e));
              }
            }
          }
        });
        _prevOrderStatuses = nuevos;
      }

      window._orderStatusCache = nuevos;
      localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
      // Un cambio de estado (p.ej. marcar "listo") también puede bajar el
      // nº de pendientes sin que cambie el nº total de pedidos — recalcular
      // la auto-pausa/aviso aquí también, no solo cuando llega un pedido nuevo.
      try {
        const _statsAhora = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (_statsAhora && Array.isArray(_statsAhora.orders)) {
          const _pendientesAhora = _statsAhora.orders.filter(o => {
            const s = getOrderStatus(o.num);
            return s !== 'entregado' && s !== 'listo' && s !== 'cancelado';
          }).length;
          if (_adminLoggedIn && typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(_pendientesAhora);
          if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(_pendientesAhora);
        }
      } catch (e) {}
      if ((_document$getElementB15 = document.getElementById('admin-pedidos')) !== null && _document$getElementB15 !== void 0 && _document$getElementB15.classList.contains('active')) {
        loadLiveOrders();
      }
      if ((_document$getElementB16 = document.getElementById('kitchen-mode')) !== null && _document$getElementB16 !== void 0 && _document$getElementB16.classList.contains('open')) {
        refreshKitchenGrid();
      }
    });
  }

  // Load initial order statuses from Firebase
  if (window.fb_getOrderStatuses) {
    window.fb_getOrderStatuses().then(s => {
      window._orderStatusCache = s || {};
    }).catch(() => {
      try {
        window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
      } catch {}
    });
  } else {
    try {
      window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}');
    } catch {}
  }

  // Load initial slots: use localStorage immediately, then update from Firebase
  try {
    const lsData = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (lsData.date === todayKey && lsData.slots) {
      _slotsCache = lsData.slots;
      renderSlotPicker(); // render immediately with cached data
    }
  } catch {}
  // Then fetch from Firebase (authoritative)
  if (window.fb_getAllSlots) {
    window.fb_getAllSlots().then(s => {
      _slotsCache = s || {};
      renderSlotPicker();
    }).catch(() => {}); // Si falla, el cache local es suficiente
  }

  // Horario sync — sincronizar horario con todos los dispositivos y cuentas
  if (window.fb_listenHorario) {
    window.fb_listenHorario(hFb => {
      if (!hFb) return;
      localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
      loadOrdersStatus();
      updateFooterHorario(hFb);
    });
  }

  // Empleados sync — sincronizar lista de empleados en tiempo real
  if (window.fb_listenEmpleados) {
    window.fb_listenEmpleados(arr => {
      var _document$getElementB17;
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_empleados', JSON.stringify(arr));
      if ((_document$getElementB17 = document.getElementById('admin-empleados')) !== null && _document$getElementB17 !== void 0 && _document$getElementB17.classList.contains('active')) empRenderAdmin();
    });
  }

  // Fichajes sync — cargar fichajes desde Firebase al iniciar
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        var _document$getElementB18;
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if ((_document$getElementB18 = document.getElementById('admin-empleados')) !== null && _document$getElementB18 !== void 0 && _document$getElementB18.classList.contains('active')) empRenderAdmin();
      }
    }).catch(() => {});
  }

  // Fichajes listener — refrescar cajón de empleados bimba en tiempo real
  if (window.fb_listenFichajes) {
    window.fb_listenFichajes(function(arr) {
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
      if (typeof bimbaRenderEmpleados === 'function') bimbaRenderEmpleados();
      if (typeof bimbaRenderFichajeLista === 'function') bimbaRenderFichajeLista();
      if (typeof bimbaActualizarContadorAlertas === 'function') bimbaActualizarContadorAlertas();
    });
  }

  // Promos sync
  if (window.fb_loadPromos) {
    window.fb_loadPromos().then(function(arr) {
      if (arr) { localStorage.setItem('dpf_promos', JSON.stringify(arr)); renderPromos(); }
    }).catch(function() {});
  }
  if (window.fb_listenPromos) {
    window.fb_listenPromos(function(arr) {
      if (!arr) return;
      localStorage.setItem('dpf_promos', JSON.stringify(arr));
      renderPromos();
      if (typeof bimbaRenderPromos === 'function') bimbaRenderPromos();
    });
  }

  // Categorías bloqueadas sync — sincronizar en tiempo real
  if (window.fb_listenBlockedCats) {
    window.fb_listenBlockedCats(cats => {
      var _document$getElementB19;
      if (!cats) return;
      localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
      // Resetear hidden en todos los items antes de reaplicar categorías bloqueadas
      MENU.forEach(item => {
        item.hidden = false;
      });
      initCatBlocks();
      renderMenu();
      if ((_document$getElementB19 = document.getElementById('admin-pedidos')) !== null && _document$getElementB19 !== void 0 && _document$getElementB19.classList.contains('active')) loadCatBlockUI();
    });
  }

  // Slot config sync — sincronizar turnos y max pedidos en tiempo real
  if (window.fb_listenSlotConfig) {
    window.fb_listenSlotConfig(cfg => {
      var _document$getElementB20;
      if (!cfg) return;
      if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
      if (cfg.max) {
        localStorage.setItem(SLOT_MAX_KEY, cfg.max);
        SLOT_MAX = parseInt(cfg.max, 10);
      }
      renderSlotPicker();
      if ((_document$getElementB20 = document.getElementById('admin-local')) !== null && _document$getElementB20 !== void 0 && _document$getElementB20.classList.contains('active')) loadSlotTurnosUI();
      loadOrdersStatus();
      checkAutoCloseWarning();
    });
  }

  // Menu prices/names sync across devices
  if (window.fb_listenMenu) {
    window.fb_listenMenu(_aplicarMenuDesdeFirebase);
  }
  // Refresco periódico de la carta, además del listener en tiempo real de
  // arriba — si un cliente deja la pestaña abierta mucho rato (o el
  // navegador móvil suspende la conexión en segundo plano y no la
  // restablece del todo al volver), el listener podría no haber recibido
  // el último cambio de precio/producto. Cada 10 minutos, y también en
  // cuanto se vuelve a esta pestaña tras tenerla en segundo plano, se
  // vuelve a comprobar contra Firebase directamente para no dejar pedir
  // nunca con una carta desactualizada.
  if (window.fb_loadMenu) {
    const _refrescarMenu = () => { window.fb_loadMenu().then(data => { if (data) _aplicarMenuDesdeFirebase(data); }).catch(() => {}); };
    setInterval(_refrescarMenu, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') _refrescarMenu();
    });
  }
}
function _aplicarMenuDesdeFirebase(data) {
  // data can be {items, ts} or plain array (legacy)
  const savedMenu = Array.isArray(data) ? data : data && data.items ? data.items : null;
  const fbTs = data && data.ts ? data.ts : 0;
  const localTs = parseInt(localStorage.getItem(MENU_KEY + '_ts') || '0', 10);
  // Only apply Firebase version if it's newer than local
  if (!savedMenu || !savedMenu.length) return;
  if (fbTs > 0 && fbTs < localTs) return; // local is newer, skip
  // Primero resetear hidden para no acumular flags de runs anteriores
  MENU.forEach(item => {
    item.hidden = false;
  });
  savedMenu.forEach(saved => {
    const item = MENU.find(m => m.id == saved.id);
    if (item) {
      if (saved.price !== undefined) item.price = saved.price;
      if (saved.name) item.name = saved.name;
      if (saved.desc !== undefined) item.desc = saved.desc;
      item.hidden = saved.hidden || false;
      item.soldout = saved.soldout || false;
    } else {
      // Producto nuevo que no existía en este dispositivo todavía — lo insertamos
      // junto a los de su misma categoría, no suelto al final
      const nuevo = Object.assign({}, saved);
      let lastIdx = -1;
      for (let i = 0; i < MENU.length; i++) {
        if (MENU[i].cat === nuevo.cat) lastIdx = i;
      }
      if (lastIdx === -1) {
        MENU.push(nuevo);
      } else {
        MENU.splice(lastIdx + 1, 0, nuevo);
      }
    }
  });
  // Reaplicar categorías bloqueadas encima de los datos de Firebase
  initCatBlocks();
  // Protección: si Firebase ocultaría más del 80% de la carta, ignorar hidden flags
  const hiddenCount = MENU.filter(m => m.hidden).length;
  if (hiddenCount > MENU.length * 0.8) {
    console.warn('[DPF] Firebase menu: demasiados items ocultos, reseteando');
    MENU.forEach(m => {
      m.hidden = false;
    });
    localStorage.removeItem(CAT_BLOCK_KEY);
  }
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  if (fbTs > 0) localStorage.setItem(MENU_KEY + '_ts', fbTs);
  renderMenu();
}

// Wait for Firebase to be ready, then init listeners
if (window._firebaseReady) {
  initFirebaseListeners();
} else {
  document.addEventListener('firebaseReady', initFirebaseListeners);
}


// ── PEDIDOS EN VIVO ──
const ORDER_STATUS_KEY = 'dpf_order_status';

// In-memory cache for order statuses, synced from Firebase — global para acceso entre funciones
window._orderStatusCache = window._orderStatusCache || {};

// Normaliza la clave del pedido igual que hace Firebase: quita '#' y 'T' (con regex global para prefijos dobles)
// Ej: '#T42' → '42', '##T42' → '42', '#42' → '42', 'T42' → '42', '42' → '42'
function _normOrderKey(num) {
  return String(num).replace(/#/g, '').replace(/^T/, '');
}
function getOrderStatuses() {
  return window._orderStatusCache;
}

// Wrapper para leer el estado de un pedido usando clave normalizada
function getOrderStatus(num) {
  return window._orderStatusCache[_normOrderKey(num)] || 'nuevo';
}
async function setOrderStatus(num, status) {
  const key = _normOrderKey(num);
  window._orderStatusCache[key] = status;
  // Save to localStorage as fallback
  localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
  // Sync to Firebase (fb_setOrderStatus ya normaliza internamente, pasamos clave original)
  if (window.fb_setOrderStatus) {
    try {
      await window.fb_setOrderStatus(num, status);
    } catch (e) {
      console.warn('Firebase status error', e);
    }
  }
}

// Carga y renderiza los pedidos en vivo.
// Render instantáneo con localStorage, luego actualiza desde Firebase (fuente de verdad).
async function loadLiveOrdersWithLocalFirst() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let localStats;
  try {
    localStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    localStats = {};
  }
  // Render inmediato con lo que haya en local
  if (localStats && localStats.date === todayKey) {
    _renderLiveOrders(localStats, todayKey);
  }
  // Luego ir a Firebase (fuente de verdad) y re-renderizar
  await loadLiveOrders();
}
async function loadLiveOrders() {
  // No tocar el overflow del body al recargar pedidos en vivo
  const _savedOverflow = document.body.style.overflow;
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  // Firebase es la fuente de verdad (tiene todos los pedidos de todos los dispositivos)
  if (window.fb_getStats) {
    try {
      // Si no hay conexión de verdad (wifi del local caído), fb_getStats()
      // puede quedarse esperando indefinidamente en vez de fallar rápido —
      // sin este límite, recargar la pantalla de cocina sin internet se
      // quedaba cargando para siempre en vez de caer en el respaldo de
      // localStorage de abajo con los últimos pedidos vistos.
      stats = await Promise.race([
        window.fb_getStats(todayKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout esperando a Firebase')), 4000))
      ]);
    } catch (e) {
      console.error('[DPF] fb_getStats error', e);
    }
    console.log('[DPF] loadLiveOrders: todayKey=', todayKey, 'firebase stats=', stats ? JSON.stringify({
      date: stats.date,
      count: stats.count,
      orders: (stats.orders || []).length
    }) : null);
    if (stats) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  // Fallback a localStorage si Firebase falla o no está disponible
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
    console.log('[DPF] loadLiveOrders: usando localStorage, stats=', stats ? JSON.stringify({
      date: stats.date,
      count: stats.count,
      orders: (stats.orders || []).length
    }) : null);
  }
  if (!stats || stats.date !== todayKey) {
    console.warn('[DPF] loadLiveOrders: stats.date=', stats && stats.date, 'todayKey=', todayKey, '-> reseteando a vacío');
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  console.log('[DPF] _renderLiveOrders: orders a pintar=', (stats.orders || []).length);
  _renderLiveOrders(stats, todayKey);
}
function _renderLiveOrders(stats, todayKey) {
  if (typeof _ptUpdateDebugStatus === 'function') _ptUpdateDebugStatus();
  // Los pedidos "desde el local" (código de cola aplicado) van primero,
  // porque ese cliente ya está esperando físicamente en el mostrador y no
  // se puede ir a pedir a otro sitio — luego por turno, y por hora dentro
  // del mismo turno.
  const orders = (stats.orders || []).slice().sort((a, b) => {
    const localA = a.esPedidoLocal ? 0 : 1;
    const localB = b.esPedidoLocal ? 0 : 1;
    if (localA !== localB) return localA - localB;
    const slotA = a.slot || '99:99';
    const slotB = b.slot || '99:99';
    if (slotA !== slotB) return slotA.localeCompare(slotB);
    return (a.time || '').localeCompare(b.time || '');
  });
  const statuses = getOrderStatuses();
  const container = document.getElementById('live-orders-list');
  if (!container) return;

  // Slots en vivo
  const liveSlotsGrid = document.getElementById('live-slots-grid');
  if (liveSlotsGrid) {
    // Count from actual orders for accuracy
    const liveSlotCounts = {};
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) liveSlotCounts[s] = (liveSlotCounts[s] || 0) + 1;
    });
    const slots = getSlots();
    liveSlotsGrid.innerHTML = slots.map(slot => {
      const count = liveSlotCounts[slot] || 0;
      const max = getSlotMax();
      const pct = Math.min(100, Math.round(count / max * 100));
      const isFull = count >= max;
      const isMid = count > 0 && pct >= 50 && !isFull;
      const hasAny = count > 0 && !isMid && !isFull;
      const bg = isFull ? '#FEF2F2' : isMid ? '#FFF7ED' : hasAny ? '#F0FDF4' : '#FFFFFF';
      const border = isFull ? '#FCA5A5' : isMid ? '#FCD34D' : hasAny ? '#86EFAC' : '#F5E6C8';
      const countColor = isFull ? '#991B1B' : isMid ? '#92400e' : hasAny ? '#166534' : '#C2B5A8';
      const barColor = isFull ? '#ef4444' : isMid ? '#f59e0b' : '#22c55e';
      return '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:10px;padding:10px 8px;text-align:center">'
        + '<div style="font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:4px">' + slot + '</div>'
        + '<div style="font-size:17px;font-weight:900;color:' + countColor + ';margin-bottom:5px">' + count + '/' + max + '</div>'
        + '<div style="height:4px;border-radius:99px;background:#e5e7eb;overflow:hidden">'
          + (count > 0 ? '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:99px"></div>' : '')
        + '</div>'
      + '</div>';
    }).join('');
  }
  if (!orders.length) {
    container.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin pedidos hoy</div>';
    return;
  }
  const activos = orders.filter(o => getOrderStatus(o.num) !== 'entregado' && getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado');
  if (!orders.length) {
    container.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin pedidos hoy</div>';
    return;
  }

  const nuevos = orders.filter(o => getOrderStatus(o.num) === 'nuevo');
  const enPrep = orders.filter(o => getOrderStatus(o.num) === 'recibido');
  const entregados = orders.filter(o => ['entregado','listo','cancelado'].includes(getOrderStatus(o.num)));
  window._activosCache = [...nuevos, ...enPrep];
  if (typeof _comprobarAutoPausaSaturacion === 'function') _comprobarAutoPausaSaturacion(activos.length);
  if (typeof _actualizarAvisoSaturacion === 'function') _actualizarAvisoSaturacion(activos.length);

  function _buildCard(o, isNuevo) {
    const slotBadge = o.slot ? '<span style="background:rgba(244,196,48,0.08);color:#3D1F0D;border:0.5px solid #3D1F0D;border-radius:99px;padding:2px 8px;font-size:12px">' + escapeHtml(o.slot) + '</span>' : '';
    const localBadge = o.esPedidoLocal ? '<span style="background:#166534;color:#fff;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700">🏪 En el local</span>' : '';
    const estudianteBadge = o.esEstudianteJubilado ? '<span style="background:#c2711a;color:#fff;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700">🪪 Verificar carné</span>' : '';
    const border = o.esPedidoLocal ? '#166534' : o.esEstudianteJubilado ? '#c2711a' : isNuevo ? '#3D1F0D' : '#3B82F6';
    const btns = isNuevo
      ? '<button class="kbtn kbtn-delete" data-print-num="' + escapeAttr(o.num) + '" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot);_markAsImpreso(this.dataset.num);if(getOrderStatus(this.dataset.num)===&quot;nuevo&quot;){setOrderStatus(this.dataset.num,&quot;recibido&quot;).catch(()=>{})}">' + (_printedOrders.has(o.num) ? '🖨️ Impreso' : '🖨️ Imprimir') + '</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="setLiveStatus(this.dataset.num,\'recibido\')" style="background:#EFF6FF;color:#1D4ED8;border:0.5px solid #93C5FD">🔵 Recibido</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="cancelarPedidoAdmin(this.dataset.num)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>'
      : '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="setLiveStatus(this.dataset.num,\'entregado\')" style="background:#F0FDF4;color:#166534;border:0.5px solid #86EFAC">✅ Entregado</button>'
        + '<button class="kbtn kbtn-delete" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot)">🖨️</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="cancelarPedidoAdmin(this.dataset.num)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>';
    return '<div class="live-order-card" id="live-card-' + escapeAttr(o.num.replace('#','')) + '" style="border-left:3px solid ' + border + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">'
        + '<div><span style="font-size:22px;font-weight:700;font-family:Georgia,serif;color:#3D1F0D">' + escapeHtml(o.num) + '</span>'
        + '<span style="font-size:13px;color:#2A1506;margin-left:6px">' + escapeHtml(o.name) + '</span></div>'
        + '<div style="display:flex;gap:4px;align-items:center">' + localBadge + estudianteBadge + slotBadge + '</div>'
      + '</div>'
      + '<div style="font-size:11px;color:#8A6A4E;margin-top:4px">' + escapeHtml(o.time) + ' · <span id="total-display-' + escapeAttr(o.num.replace('#','')) + '" data-num="' + escapeAttr(o.num) + '" onclick="startEditOrderTotal(this.dataset.num)" style="cursor:pointer;text-decoration:underline dotted">' + o.total.toFixed(2).replace('.',',') + ' €</span></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">' + btns + '</div>'
    + '</div>';
  }

  const colHeader = (color, label) =>
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:0.5px solid #F5E6C8">'
    + '<span style="width:10px;height:10px;background:' + color + ';border-radius:50%;display:inline-block;flex-shrink:0"></span>'
    + '<span style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#8A6A4E">' + label + '</span>'
    + '</div>';

  const nuevosHtml = nuevos.length ? nuevos.map(o => _buildCard(o, true)).join('') : '<div style="color:#8A6A4E;font-size:12px;padding:8px">Sin pedidos nuevos</div>';
  const enPrepHtml = enPrep.length ? enPrep.map(o => _buildCard(o, false)).join('') : '<div style="color:#8A6A4E;font-size:12px;padding:8px">Sin pedidos en preparación</div>';
  const entregadosHtml = entregados.map(o =>
    '<div style="background:#f9fafb;border:0.5px solid #e5e7eb;border-radius:8px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px">'
    + '<div style="display:flex;align-items:center;gap:6px">'
      + '<span style="font-size:13px;font-weight:500;color:#27855a">' + escapeHtml(o.num) + '</span>'
      + '<span style="font-size:12px;color:#2A1506">' + escapeHtml(o.name) + '</span>'
      + '<span style="font-size:11px;color:#8A6A4E">' + escapeHtml(o.time) + ' · ' + o.total.toFixed(2).replace('.',',') + ' €</span>'
    + '</div>'
    + '<button class="kbtn kbtn-delete" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot)" style="font-size:11px;padding:4px 10px">🖨️</button>'
    + '</div>'
  ).join('');

  container.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:16px">'
      + '<div>' + colHeader('#3D1F0D', 'Nuevos (' + nuevos.length + ')') + nuevosHtml + '</div>'
      + '<div>' + colHeader('#3B82F6', 'En preparación (' + enPrep.length + ')') + enPrepHtml + '</div>'
    + '</div>'
    + (entregados.length
      ? '<button onclick="var d=this.nextElementSibling;d.style.display=d.style.display===\'none\'?\'block\':\'none\';this.textContent=d.style.display===\'none\'?\'Ver pedidos entregados (' + entregados.length + ')\':\'Ocultar entregados\'" style="width:100%;background:none;border:0.5px solid #e0e0e0;border-radius:8px;padding:8px 16px;font-size:13px;color:#8A6A4E;cursor:pointer;font-family:\'DM Sans\',sans-serif;margin-bottom:6px">Ver pedidos entregados (' + entregados.length + ')</button><div style="display:none">' + entregadosHtml + '</div>'
      : '');
}
// Sube los pedidos del localStorage de ESTE dispositivo a Firebase fusionando con los que ya existen
async function emergencySyncFromLocal() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let local;
  try {
    local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    local = {};
  }
  if (!local || local.date !== todayKey || !(local.orders || []).length) {
    alert('Este dispositivo no tiene pedidos de hoy para subir.');
    return;
  }
  if (!confirm('\xc2\xbfSubir ' + local.orders.length + ' pedido(s) de este dispositivo a Firebase?\n\nSe fusionar\xc3\xa1n con los que ya existan, sin borrar nada.')) return;
  try {
    await firebase.database().ref('stats/' + todayKey).transaction(function (current) {
      if (!current || current.date !== todayKey) return local;
      const existingNums = new Set((current.orders || []).map(o => _normOrderKey(o.num)));
      const nuevos = (local.orders || []).filter(o => !existingNums.has(_normOrderKey(o.num)));
      current.orders = [...(current.orders || []), ...nuevos];
      current.count = current.orders.length;
      current.total = parseFloat(current.orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2));
      return current;
    });
    const snap = await firebase.database().ref('stats/' + todayKey).once('value');
    if (snap.exists()) localStorage.setItem(STATS_KEY, JSON.stringify(snap.val()));
    alert('\xe2\x9c\x85 Pedidos subidos. Total en Firebase: ' + (snap.val().count || 0));
    loadLiveOrders();
  } catch (e) {
    alert('\xe2\x9d\x8c Error al subir: ' + e.message);
  }
}
function setLiveStatus(num, status) {
  // Parar el sonido al momento cuando se marca cualquier pedido
  if (status === 'entregado' || status === 'recibido' || status === 'listo') {
    stopAlertLoop();
  }
  setOrderStatus(num, status);
  // Cualquiera de estos estados cuenta como "ya visto" — se marca una sola
  // vez por pedido (_marcarPedidoAtendido no hace nada si ya estaba
  // marcado), así que da igual si pasa antes por "preparando" y luego por
  // "listo": solo resta del contador la primera vez.
  if (status === 'entregado' || status === 'recibido' || status === 'listo' || status === 'preparando') {
    _marcarPedidoAtendido(num);
  }
  if (_alertPendingOrders > 0) startAlertLoop();
  loadLiveOrders();
  refreshKitchenGrid();
}

// ── KITCHEN MODE ──
let _kitchenInterval = null;
function activarAudioCocina() {
  unlockAudioContext();
  _adminLoggedIn = true;
  playNotificationSound();
  document.getElementById('kitchen-audio-banner').style.display = 'none';
}
function openKitchenMode() {
  // Ocultar el overlay de admin sin cerrarlo, para poder volver al salir
  document.getElementById('admin-overlay').style.display = 'none';
  document.getElementById('kitchen-mode').classList.add('open');
  // Si ya activó el audio antes, desbloquearlo automáticamente con este click
  if (localStorage.getItem(AUDIO_PREF_KEY) === '1') {
    unlockAudioContext();
  }
  // Mostrar banner solo si audio no desbloqueado
  const banner = document.getElementById('kitchen-audio-banner');
  if (banner) banner.style.display = _audioCtxUnlocked ? 'none' : 'flex';
  _adminLoggedIn = true; // cocina siempre en modo admin
  clearUnseenOrders();
  refreshKitchenGrid();
  updateKitchenClock();
  _kitchenInterval = setInterval(() => {
    refreshKitchenGrid();
    updateKitchenClock();
  }, 15000);
}
let _kitchenDark = true;
function toggleKitchenTheme() {
  _kitchenDark = !_kitchenDark;
  const km = document.getElementById('kitchen-mode');
  const btn = document.getElementById('kitchen-theme-btn');
  if (_kitchenDark) {
    km.classList.remove('kitchen-light');
    if (btn) btn.textContent = '🌙';
  } else {
    km.classList.add('kitchen-light');
    if (btn) btn.textContent = '☀️';
  }
}
function closeKitchenMode() {
  document.getElementById('kitchen-mode').classList.remove('open');
  clearInterval(_kitchenInterval);
  _kitchenInterval = null;
  // _adminLoggedIn permanece true — alertas siguen activas en cualquier pantalla
  document.getElementById('admin-overlay').style.display = '';
}
function updateKitchenClock() {
  const el = document.getElementById('kitchen-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
function refreshKitchenGrid() {
  if (typeof _ptUpdateDebugStatus === 'function') _ptUpdateDebugStatus();
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) stats = {
    date: todayKey,
    count: 0,
    total: 0,
    orders: []
  };
  const orders = (stats.orders || []).filter(o => getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado' && getOrderStatus(o.num) !== 'entregado').slice().sort((a, b) => {
    // Pedidos "desde el local" primero (ese cliente ya está esperando en el
    // mostrador), luego por cercanía al turno de recogida.
    const localA = a.esPedidoLocal ? 0 : 1;
    const localB = b.esPedidoLocal ? 0 : 1;
    if (localA !== localB) return localA - localB;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const toMins = s => {
      if (!s) return 9999;
      const p = s.split(':');
      return parseInt(p[0]) * 60 + parseInt(p[1]);
    };
    const diffA = Math.abs(toMins(a.slot) - nowMins);
    const diffB = Math.abs(toMins(b.slot) - nowMins);
    if (diffA !== diffB) return diffA - diffB;
    return (a.slot || '99:99').localeCompare(b.slot || '99:99');
  });
  const statuses = getOrderStatuses();
  const grid = document.getElementById('kitchen-grid');
  if (!grid) return;

  // Slots in kitchen header
  const kSlots = document.getElementById('kitchen-slots');
  if (kSlots) {
    // Count slots directly from active orders (reliable, no Firebase dependency)
    const allOrders = stats.orders || [];
    const slotCounts = {};
    allOrders.forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) slotCounts[s] = (slotCounts[s] || 0) + 1;
    });
    const slots = getSlots();
    // Also include slots from orders that don't appear in getSlots() yet
    const allSlots = [...new Set([...slots, ...Object.keys(slotCounts)])].sort();
    const nowH = new Date().getHours(), nowM = new Date().getMinutes();
    const nowTotalMin = nowH * 60 + nowM;
    let closestSlot = null, closestDiff = Infinity;
    allSlots.forEach(slot => {
      const sp = slot.split(':');
      const slotMin = parseInt(sp[0]) * 60 + parseInt(sp[1]);
      const diff = slotMin - nowTotalMin;
      if (diff >= 0 && diff < closestDiff) { closestDiff = diff; closestSlot = slot; }
    });
    const isLightMode = document.getElementById('kitchen-mode').classList.contains('kitchen-light');
    kSlots.innerHTML = allSlots.filter(slot => (slotCounts[slot] || 0) > 0 || slots.includes(slot)).map(slot => {
      const count = slotCounts[slot] || 0;
      const isNow = slot === closestSlot;
      if (isNow) {
        const bg = isLightMode ? '#3D1F0D' : '#F4C430';
        const txt = isLightMode ? '#F4C430' : '#1a1a1a';
        return '<span style="background:' + bg + ';border:1.5px solid ' + bg + ';border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;color:' + txt + '">' + slot + ' · ' + count + '/' + getSlotMax() + '</span>';
      }
      const color = count >= getSlotMax() ? '#c0392b' : count > 0 ? '#3D1F0D' : '#555';
      return '<span style="background:#2a2a2a;border:1.5px solid ' + color + ';border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;color:' + color + '">' + slot + ' · ' + count + '/' + getSlotMax() + '</span>';
    }).join('');
  }
  const countEl = document.getElementById('kitchen-active-count');
  if (countEl) countEl.textContent = orders.length ? orders.length + ' activo' + (orders.length > 1 ? 's' : '') : '';
  if (!orders.length) {
    grid.innerHTML = '<div style="color:#666;font-size:14px;text-align:center;padding:40px;grid-column:1/-1">Sin pedidos activos</div>';
    return;
  }
  const nowMs = new Date();
  grid.innerHTML = orders.map(o => {
    const status = getOrderStatus(o.num);
    // Urgencia basada en minutos que faltan para el slot de recogida
    let minsToSlot = null;
    if (o.slot) {
      const parts = o.slot.split(':');
      const slotTime = new Date();
      slotTime.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      minsToSlot = Math.floor((slotTime - nowMs) / 60000);
    }
    const isUrgent = minsToSlot !== null && minsToSlot <= 5 && minsToSlot >= -10;
    const isWarning = minsToSlot !== null && minsToSlot > 5 && minsToSlot <= 10;
    const slotLabel = o.slot ? minsToSlot <= 0 ? 'Recogida: ya!' : 'Recogida en ' + minsToSlot + ' min' : '';
    const timeColor = isUrgent ? '#e74c3c' : isWarning ? '#3D1F0D' : '#888';
    const cardStyle = isUrgent ? 'animation:pulse-red 1.2s infinite;' : '';
    const itemsHtml = o.items ? o.items.filter(function(it) {
      if (it.isFee) return false;
      const n = (it.name || '').toLowerCase();
      return !n.includes('gesti\xF3n') && !n.includes('gestion') && !n.includes('fee') && !n.includes('cargo');
    }).map(function (it) {
      if (it.extras && it.extras.length > 0) {
        return '<div style="border-left:3px solid #3D1F0D;padding-left:8px;margin:5px 0">' + '<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:4px">' + it.qty + 'x ' + escapeHtml(it.name || '') + '</div>' + '<div style="display:flex;flex-wrap:wrap">' + it.extras.map(function (e) {
          return '<span style="background:#333;border:1px solid #555;border-radius:4px;padding:3px 8px;font-size:13px;color:#eee">' + escapeHtml(e) + '</span>';
        }).join('') + '</div></div>';
      }
      return '<div class="kitchen-item-row">' + it.qty + 'x ' + escapeHtml(it.name || '') + '</div>';
    }).join('') : '<div style="font-size:13px;color:#999">Sin detalle</div>';
    const isJustArrived = o.ts && Date.now() - o.ts < 30000;
    const newClass = status === 'nuevo' && isJustArrived ? ' is-new' : '';
    const localBadgeK = o.esPedidoLocal ? '<span style="background:#166534;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px;margin-left:6px">🏪 EN EL LOCAL</span>' : '';
    const estudianteBadgeK = o.esEstudianteJubilado ? '<span style="background:#c2711a;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px;margin-left:6px">🪪 VERIFICAR CARNÉ</span>' : '';
    const cardStyleFinal = o.esPedidoLocal ? cardStyle + 'border-left:4px solid #166534;' : o.esEstudianteJubilado ? cardStyle + 'border-left:4px solid #c2711a;' : cardStyle;
    const btnsHtml = '<div style="display:flex;gap:8px;margin-top:4px">' + '<button onclick="setLiveStatus(\'' + escapeAttr(o.num) + '\',\'entregado\')" style="flex:1;padding:14px;background:#27855a;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:900;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Entregado</button>' + '<button onclick="cancelarPedidoAdmin(\'' + escapeAttr(o.num) + '\')" style="width:52px;background:#666;color:#e74c3c;border:none;border-radius:10px;font-size:22px;font-weight:900;cursor:pointer">✕</button>' + '</div>';
    return '<div class="kitchen-card status-' + status + newClass + '" style="' + cardStyleFinal + '">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' + '<div class="kitchen-card-num">' + escapeHtml(o.num) + (isUrgent ? ' 🔴' : '') + localBadgeK + estudianteBadgeK + '</div>' + (o.slot ? '<span style="background:#3D1F0D33;color:#3D1F0D;font-size:20px;font-weight:900;padding:5px 14px;border-radius:99px;border:1.5px solid #3D1F0D44">🕐 ' + escapeHtml(o.slot) + '</span>' : '') + '</div>' + '<div class="kitchen-card-name">' + escapeHtml(o.name) + '</div>' + '<div style="font-size:12px;color:' + timeColor + ';font-weight:700;margin-bottom:6px">' + (o.time ? 'Pedido: ' + escapeHtml(o.time) : '') + (isUrgent ? ' — URGENTE!' : '') + '</div>' + '<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;margin-bottom:4px">' + '<div style="font-size:10px;color:#555;font-weight:700;text-transform:uppercase;margin-bottom:6px">PRODUCTOS:</div>' + itemsHtml + '</div>' + '<div class="kitchen-status-btns">' + btnsHtml + '</div>' + '</div>';
  }).join('');
}

// ── SONIDO CONFIGURABLE ──
const SOUND_KEY = 'dpf_sound_config';
function getSoundConfig() {
  try {
    return JSON.parse(localStorage.getItem(SOUND_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveSoundConfig() {
  var _document$getElementB21, _document$getElementB22;
  const type = ((_document$getElementB21 = document.getElementById('sound-type')) === null || _document$getElementB21 === void 0 ? void 0 : _document$getElementB21.value) || 'ding';
  const volume = parseInt(((_document$getElementB22 = document.getElementById('sound-volume')) === null || _document$getElementB22 === void 0 ? void 0 : _document$getElementB22.value) || '60', 10);
  const cfg = {
    type,
    volume
  };
  localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
  if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(cfg).catch(() => {});
  showToast('local-toast');
  logActivity("\uD83D\uDD14 Sonido configurado: ".concat(type, ", volumen ").concat(volume, "%"));
}
function loadSoundConfigUI() {
  const cfg = getSoundConfig();
  const sel = document.getElementById('sound-type');
  const vol = document.getElementById('sound-volume');
  const lbl = document.getElementById('sound-volume-label');
  if (sel && cfg.type) sel.value = cfg.type;
  if (vol) {
    var _cfg$volume, _cfg$volume2;
    vol.value = (_cfg$volume = cfg.volume) !== null && _cfg$volume !== void 0 ? _cfg$volume : 60;
    if (lbl) lbl.textContent = ((_cfg$volume2 = cfg.volume) !== null && _cfg$volume2 !== void 0 ? _cfg$volume2 : 60) + '%';
  }
  if (vol) vol.addEventListener('input', () => {
    if (lbl) lbl.textContent = vol.value + '%';
  });
}
function playNotificationSound(typeOverride) {
  var _cfg$volume3;
  const cfg = getSoundConfig();
  const type = typeOverride || cfg.type || 'ding';
  const vol = ((_cfg$volume3 = cfg.volume) !== null && _cfg$volume3 !== void 0 ? _cfg$volume3 : 90) / 100;
  if (type === 'none') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const patterns = {
      ding: [{
        f: 1046,
        t: 0,
        d: 0.25,
        v: vol
      }, {
        f: 1046,
        t: 0.3,
        d: 0.25,
        v: vol * 0.8
      }],
      campana: [{
        f: 880,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 1108,
        t: 0.18,
        d: 0.15,
        v: vol
      }, {
        f: 1320,
        t: 0.36,
        d: 0.15,
        v: vol
      }, {
        f: 880,
        t: 0.54,
        d: 0.2,
        v: vol * 0.9
      }],
      caja: [{
        f: 1318,
        t: 0,
        d: 0.1,
        v: vol
      }, {
        f: 1046,
        t: 0.12,
        d: 0.1,
        v: vol
      }, {
        f: 1318,
        t: 0.24,
        d: 0.1,
        v: vol
      }, {
        f: 1046,
        t: 0.36,
        d: 0.1,
        v: vol
      }, {
        f: 1318,
        t: 0.48,
        d: 0.15,
        v: vol
      }],
      chime: [{
        f: 784,
        t: 0,
        d: 0.2,
        v: vol
      }, {
        f: 988,
        t: 0.22,
        d: 0.2,
        v: vol
      }, {
        f: 1175,
        t: 0.44,
        d: 0.2,
        v: vol
      }, {
        f: 1568,
        t: 0.66,
        d: 0.3,
        v: vol
      }],
      bip: [{
        f: 1600,
        t: 0,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.1,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.2,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.3,
        d: 0.07,
        v: vol
      }, {
        f: 1600,
        t: 0.4,
        d: 0.1,
        v: vol
      }],
      doble: [{
        f: 1100,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 1100,
        t: 0.2,
        d: 0.15,
        v: vol
      }, {
        f: 1100,
        t: 0.4,
        d: 0.15,
        v: vol
      }],
      coffeeshop: [{
        f: 698,
        t: 0,
        d: 0.15,
        v: vol
      }, {
        f: 880,
        t: 0.18,
        d: 0.15,
        v: vol
      }, {
        f: 1046,
        t: 0.36,
        d: 0.15,
        v: vol
      }, {
        f: 1318,
        t: 0.54,
        d: 0.2,
        v: vol
      }, {
        f: 1046,
        t: 0.78,
        d: 0.2,
        v: vol
      }],
      urgente: [{
        f: 1400,
        t: 0,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.12,
        d: 0.1,
        v: vol
      }, {
        f: 1400,
        t: 0.24,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.36,
        d: 0.1,
        v: vol
      }, {
        f: 1400,
        t: 0.48,
        d: 0.1,
        v: vol
      }, {
        f: 800,
        t: 0.6,
        d: 0.15,
        v: vol
      }]
    };
    const waveType = 'square';
    const pattern = patterns[type] || patterns.ding;
    // Calcular duración total del patrón para repetirlo 3 veces con pausa entre repeticiones
    const patternDuration = Math.max(...pattern.map(n => n.t + n.d)) + 0.15;
    const REPEATS = 3;
    for (let rep = 0; rep < REPEATS; rep++) {
      const offset = rep * patternDuration;
      pattern.forEach(_ref22 => {
        let f = _ref22.f,
          t = _ref22.t,
          d = _ref22.d,
          v = _ref22.v;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = f;
        osc.type = waveType;
        gain.gain.setValueAtTime(v, ctx.currentTime + offset + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + t + d);
        osc.start(ctx.currentTime + offset + t);
        osc.stop(ctx.currentTime + offset + t + d + 0.05);
      });
    }
  } catch (e) {}
}
function testNotificationSound() {
  var _document$getElementB23, _document$getElementB24;
  const type = ((_document$getElementB23 = document.getElementById('sound-type')) === null || _document$getElementB23 === void 0 ? void 0 : _document$getElementB23.value) || 'ding';
  const vol = parseInt(((_document$getElementB24 = document.getElementById('sound-volume')) === null || _document$getElementB24 === void 0 ? void 0 : _document$getElementB24.value) || '60', 10);
  // Guardar temporalmente para que playNotificationSound lo use
  const prev = getSoundConfig();
  localStorage.setItem(SOUND_KEY, JSON.stringify({
    type,
    volume: vol
  }));
  playNotificationSound(type);
  // Restaurar el anterior si no se ha guardado
  setTimeout(() => {
    const cur = getSoundConfig();
    if (cur.type === type && cur.volume === vol) {} // ya guardado con saveSoundConfig
  }, 100);
}

// ── CONTADOR DE PEDIDOS EN EL TÍTULO ──
let _titleBase = document.title;
let _unseenOrders = 0;
function updateTabTitle(newOrderCount) {
  if (newOrderCount > 0) {
    document.title = "(".concat(newOrderCount, ") ").concat(_titleBase);
  } else {
    document.title = _titleBase;
  }
}

// ── ALERTA NUEVO PEDIDO ──
let _lastKnownOrderCount = null;
function checkForNewOrders(statsOverride) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = statsOverride || null;
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
  }
  if (!stats || stats.date !== todayKey) return;
  const count = stats.count || 0;
  if (_lastKnownOrderCount === null) {
    _lastKnownOrderCount = count;
    return;
  }
  console.log('[DPF] checkForNewOrders: count=' + count + ' lastKnown=' + _lastKnownOrderCount + ' adminLoggedIn=' + _adminLoggedIn);
  if (count > _lastKnownOrderCount) {
    const diff = count - _lastKnownOrderCount;
    _lastKnownOrderCount = count;
    _unseenOrders += diff;
    updateTabTitle(_unseenOrders);
    console.log('[DPF] NEW ORDER — calling showNewOrderNotification, diff=' + diff);
    // guardar-pedido.php inserta los pedidos nuevos al principio del array (unshift)
    showNewOrderNotification((stats.orders || []).slice(0, diff).map(o => o.num));
  }
}

// Limpiar contador cuando se abre la sección de pedidos
function clearUnseenOrders() {
  _unseenOrders = 0;
  updateTabTitle(0);
}

// Alert loop state
let _alertLoopInterval = null;
let _alertPendingOrders = 0;
// Antes _alertPendingOrders era un contador suelto que varios sitios subían
// o bajaban a mano (sobreescribiéndolo entero al detectar pedidos nuevos, o
// restándole 1 desde tres sitios distintos: imprimir, marcar listo, marcar
// entregado) — un mismo pedido marcado "listo" restaba dos veces porque
// 'listo' entraba en dos condiciones distintas seguidas, y dos avisos de
// "pedido nuevo" casi seguidos podían pisarse el contador en vez de sumar.
// Ahora se lleva la cuenta por número de pedido concreto: añadir/quitar el
// mismo pedido dos veces no hace nada la segunda vez.
let _alertPendingOrderNumsSet = new Set();
function _marcarPedidoPendienteAlerta(num) {
  if (!num || _alertPendingOrderNumsSet.has(num)) return;
  _alertPendingOrderNumsSet.add(num);
  _alertPendingOrders = _alertPendingOrderNumsSet.size;
}
function _marcarPedidoAtendido(num) {
  if (!num || !_alertPendingOrderNumsSet.has(num)) return;
  _alertPendingOrderNumsSet.delete(num);
  _alertPendingOrders = _alertPendingOrderNumsSet.size;
  if (_alertPendingOrders === 0) stopAlertLoop();
}
function _resetPedidosPendientesAlerta() {
  _alertPendingOrderNumsSet.clear();
  _alertPendingOrders = 0;
}
function startAlertLoop() {
  if (_alertLoopInterval) return; // ya está sonando
  playNotificationSound();
  // Calcular duración del patrón × 3 repeticiones + pausa
  const cfg = getSoundConfig();
  const type = cfg.type || 'ding';
  const patterns = {
    ding: 0.7,
    campana: 0.9,
    caja: 0.8,
    chime: 1.1,
    bip: 0.65,
    doble: 0.7,
    coffeeshop: 1.1,
    urgente: 0.9
  };
  const loopDelay = ((patterns[type] || 0.8) * 3 + 0.5) * 1000;
  _alertLoopInterval = setInterval(() => {
    if (_alertPendingOrders > 0) playNotificationSound();else stopAlertLoop();
  }, loopDelay);
}
function stopAlertLoop() {
  if (_alertLoopInterval) {
    clearInterval(_alertLoopInterval);
    _alertLoopInterval = null;
  }
}
function showNewOrderNotification(nums) {
  console.log('[DPF] showNewOrderNotification: nums=' + JSON.stringify(nums) + ' adminLoggedIn=' + _adminLoggedIn + ' audioUnlocked=' + _audioCtxUnlocked);
  // Solo sonar si hay sesión de admin activa (no al cliente que hace el pedido)
  if (_adminLoggedIn) {
    (nums || []).forEach(_marcarPedidoPendienteAlerta);
    startAlertLoop();
    const toast = document.getElementById('new-order-toast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  }
}

// ── MARCAR TODOS COMO LISTOS (COCINA) ──
function confirmarTodosListos() {
  if (!confirm("Marcar TODOS los pedidos activos como listos?")) return;
  markAllKitchenReady();
}
function markAllKitchenReady() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) return;
  const orders = stats.orders || [];
  if (!orders.length) return;
  const statuses = getOrderStatuses();
  const aCambiar = orders.filter(o => {
    const key = _normOrderKey(o.num);
    return (statuses[key] || 'nuevo') !== 'listo' && statuses[key] !== 'cancelado' && statuses[key] !== 'entregado';
  });
  if (!aCambiar.length) return;
  // setOrderStatus() actualiza localStorage Y Firebase (fb_setOrderStatus)
  // por pedido \u2014 antes este bot\u00f3n solo tocaba localStorage directamente,
  // as\u00ed que un pedido marcado "listo" aqu\u00ed pod\u00eda volver a aparecer como
  // pendiente en cuanto llegara cualquier otro cambio de estado: el
  // listener en tiempo real (fb_listenOrderStatuses) sobrescribe
  // window._orderStatusCache entero con lo que haya en Firebase, que nunca
  // se hab\u00eda enterado de este cambio.
  aCambiar.forEach(o => { setOrderStatus(o.num, 'listo'); });
  refreshKitchenGrid();
  loadLiveOrders();
  logActivity("\u2705 ".concat(aCambiar.length, " pedido").concat(aCambiar.length !== 1 ? 's' : '', " marcado").concat(aCambiar.length !== 1 ? 's' : '', " como listo desde cocina"));
}

// Polling de fallback: solo actúa si Firebase no está disponible
// Con Firebase activo los listeners se encargan de todo en tiempo real
setInterval(() => {
  var _document$getElementB25;
  if (window._firebaseReady) return; // Firebase activo → los listeners ya cubren esto
  const _ao2 = document.getElementById('admin-overlay');
  const _km = document.getElementById('kitchen-mode');
  const adminOpen = _ao2 ? _ao2.classList.contains('open') : false;
  const kitchenOpen = _km ? _km.classList.contains('open') : false;
  if (!adminOpen && !kitchenOpen) return;
  checkForNewOrders();
  if ((_document$getElementB25 = document.getElementById('admin-pedidos')) !== null && _document$getElementB25 !== void 0 && _document$getElementB25.classList.contains('active')) loadLiveOrders();
  if (kitchenOpen) refreshKitchenGrid();
}, 10000);


// ── HISTORIAL MEJORADO ──
// ── BANNER DEL DÍA ───────────────────────────────────────────────────────────
const BANNER_KEY = 'dpf_banner_dia';
function getBannerDia() {
  try {
    return JSON.parse(localStorage.getItem(BANNER_KEY) || '{}');
  } catch {
    return {};
  }
}
const BANNER_TIPOS = {
  promo: {
    bg: '#FFF8EE',
    border: '#3D1F0D',
    iconBg: '#3D1F0D',
    labelColor: '#3D1F0D',
    titleColor: '#3D1F0D',
    subColor: '#8A6A4E',
    label: 'Oferta del día',
    emoji: '🎉'
  },
  aviso: {
    bg: '#fff3cd',
    border: '#3D1F0D',
    iconBg: '#3D1F0D',
    labelColor: '#b36a00',
    titleColor: '#5a3e1b',
    subColor: '#8a6530',
    label: 'Aviso importante',
    emoji: '⚠️'
  },
  urgente: {
    bg: '#fdf0ee',
    border: '#c0392b',
    iconBg: '#c0392b',
    labelColor: '#c0392b',
    titleColor: '#7a1a0e',
    subColor: '#a03020',
    label: 'Urgente',
    emoji: '🔴'
  },
  info: {
    bg: '#e8f4fd',
    border: '#2980b9',
    iconBg: '#2980b9',
    labelColor: '#2980b9',
    titleColor: '#1a3a52',
    subColor: '#2c5f7a',
    label: 'Novedad',
    emoji: '📢'
  }
};
function _applyBannerDia(data) {
  const el = document.getElementById('banner-dia');
  const inner = document.getElementById('banner-dia-inner');
  const iconEl = document.getElementById('banner-dia-icon');
  const labelEl = document.getElementById('banner-dia-label');
  const textEl = document.getElementById('banner-dia-text');
  const subEl = document.getElementById('banner-dia-sub');
  if (!el) return;
  if (data && data.active && data.text) {
    const tipo = BANNER_TIPOS[data.tipo || 'promo'];
    el.style.display = 'block';
    inner.style.background = tipo.bg;
    inner.style.border = '2px solid ' + tipo.border;
    iconEl.style.background = tipo.iconBg;
    iconEl.textContent = tipo.emoji;
    labelEl.textContent = tipo.label;
    labelEl.style.color = tipo.labelColor;
    textEl.textContent = data.text;
    textEl.style.color = tipo.titleColor;
    if (subEl) {
      subEl.textContent = data.sub || '';
      subEl.style.color = tipo.subColor;
      subEl.style.display = data.sub ? 'block' : 'none';
    }
  } else {
    el.style.display = 'none';
  }
}
function _updateBannerToggleBtn(active) {
  const btn = document.getElementById('banner-toggle-btn');
  if (!btn) return;
  btn.textContent = active ? '🟢 Banner activo' : '🔴 Banner inactivo';
  btn.style.background = active ? '#27855a' : '#c0392b';
  btn.style.color = '#fff';
  btn.style.border = 'none';
}
async function toggleBannerDia() {
  const data = getBannerDia();
  data.active = !data.active;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(() => {});
  _updateBannerToggleBtn(data.active);
  _applyBannerDia(data);
}
async function saveBannerDia() {
  var _document$getElementB26, _document$getElementB27, _document$getElementB28;
  const text = ((_document$getElementB26 = document.getElementById('banner-dia-input')) === null || _document$getElementB26 === void 0 ? void 0 : _document$getElementB26.value.trim()) || '';
  const sub = ((_document$getElementB27 = document.getElementById('banner-dia-sub-input')) === null || _document$getElementB27 === void 0 ? void 0 : _document$getElementB27.value.trim()) || '';
  const tipo = ((_document$getElementB28 = document.getElementById('banner-dia-tipo')) === null || _document$getElementB28 === void 0 ? void 0 : _document$getElementB28.value) || 'promo';
  const data = getBannerDia();
  data.text = text;
  data.sub = sub;
  data.tipo = tipo;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(() => {});
  _applyBannerDia(data);
  showToast('banner-toast');
}
function loadBannerDia() {
  // Mostrar estado local inmediatamente mientras carga Firebase
  const localBanner = getBannerDia();
  _updateBannerToggleBtn(localBanner.active);
  if (window.fb_listenBannerDia) {
    window.fb_listenBannerDia(data => {
      if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
      const d = data || getBannerDia();
      _applyBannerDia(d);
      _updateBannerToggleBtn(d.active);
      const input = document.getElementById('banner-dia-input');
      const subIn = document.getElementById('banner-dia-sub-input');
      const tipoIn = document.getElementById('banner-dia-tipo');
      if (input && d.text) input.value = d.text;
      if (subIn && d.sub) subIn.value = d.sub;
      if (tipoIn && d.tipo) tipoIn.value = d.tipo;
    });
    return;
  }
  // Fallback: leer directamente de Firebase si el listener no está listo aún
  if (window.firebase && window.firebase.database) {
    try {
      window.firebase.database().ref('config/bannerDia').once('value').then(sn => {
        let data = null;
        if (sn.exists()) {
          try {
            data = typeof sn.val() === 'string' ? JSON.parse(sn.val()) : sn.val();
          } catch {}
        }
        if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
        _applyBannerDia(data || getBannerDia());
      }).catch(() => _applyBannerDia(getBannerDia()));
    } catch (e) {
      _applyBannerDia(getBannerDia());
    }
    return;
  }
  // Último fallback: localStorage
  _applyBannerDia(getBannerDia());
  _updateBannerToggleBtn(getBannerDia().active);
}

// ── EXPORTAR PDF ─────────────────────────────────────────────────────────────

function _pdfStyles() {
  return "\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body { font-family: Arial, sans-serif; color: #2A1506; background: #fff; }\n    .header { background: #3D1F0D; color: #FFF8EE; padding: 20px 28px; }\n    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 2px; }\n    .header p  { font-size: 12px; opacity: .7; }\n    .content { padding: 24px 28px; }\n    .order-card { border: 1.5px solid #F5E6C8; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; page-break-inside: avoid; }\n    .order-num  { font-size: 18px; font-weight: 900; color: #3D1F0D; }\n    .order-meta { font-size: 12px; color: #8A6A4E; margin: 4px 0 10px; }\n    .order-items { font-size: 13px; color: #2A1506; border-top: 1px solid #F5E6C8; padding-top: 8px; }\n    .order-item { display: flex; justify-content: space-between; padding: 3px 0; }\n    .order-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #3D1F0D; border-top: 1.5px solid #F5E6C8; margin-top: 8px; padding-top: 8px; }\n    .summary { background: #FFF8EE; border: 1.5px solid #3D1F0D; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 24px; flex-wrap: wrap; }\n    .summary-item { text-align: center; }\n    .summary-item .val { font-size: 24px; font-weight: 900; color: #3D1F0D; }\n    .summary-item .lbl { font-size: 11px; color: #8A6A4E; text-transform: uppercase; letter-spacing: .05em; }\n    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }\n  ";
}
function exportTicketPDF(num, name, time, total, slot, items, phone, notes) {
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const itemsHtml = (items || []).map(it => "<div class=\"order-item\"><span>".concat(it.qty, "x ").concat(escapeHtml(it.name || ''), "</span><span>").concat((it.subtotal || 0).toFixed(2).replace('.', ','), " \u20AC</span></div>")).join('');
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Ticket ".concat(escapeHtml(num || ''), "</title>\n  <style>").concat(_pdfStyles(), "\n    body { max-width: 400px; margin: 0 auto; }\n    .ticket-box { border: 2px solid #3D1F0D; border-radius: 14px; padding: 24px; margin: 24px; }\n    .ticket-title { font-size: 13px; color: #8A6A4E; text-align:center; margin-bottom: 4px; }\n    .ticket-num { font-size: 36px; font-weight: 900; color: #3D1F0D; text-align:center; margin-bottom: 16px; }\n  </style></head><body>\n  <div class=\"header\" style=\"text-align:center\">\n    <h1>\uD83E\uDD54 Dulce Patata Food</h1>\n    <p>").concat(fecha, "</p>\n  </div>\n  <div class=\"ticket-box\">\n    <div class=\"ticket-title\">N\xFAmero de pedido</div>\n    <div class=\"ticket-num\">").concat(escapeHtml(num || ''), "</div>\n    <div class=\"order-meta\" style=\"text-align:center;margin-bottom:14px\">\n      \uD83D\uDC64 ").concat(escapeHtml(name || '—'), "\n      ").concat(phone ? "&nbsp;\xB7&nbsp; \uD83D\uDCDE ".concat(escapeHtml(phone)) : '', "\n      ").concat(time ? "&nbsp;\xB7&nbsp; \uD83D\uDD50 ".concat(escapeHtml(time)) : '', "\n      ").concat(slot ? "<br>\uD83D\uDCE6 Recogida de patata a las ".concat(escapeHtml(slot), "h") : '', "\n    </div>\n    ").concat(itemsHtml ? "<div class=\"order-items\">".concat(itemsHtml, "<div class=\"order-total\"><span>Total a pagar</span><span>").concat(parseFloat(total).toFixed(2).replace('.', ','), " \u20AC</span></div></div>") : '', "\n    ").concat(notes ? "<div style=\"font-size:12px;color:#8A6A4E;margin-top:10px;font-style:italic\">\uD83D\uDCDD ".concat(escapeHtml(notes), "</div>") : '', "\n    <div style=\"text-align:center;margin-top:16px;font-size:12px;color:#8A6A4E\">Paga en caja cuando recojas \uD83D\uDC9B</div>\n  </div>\n  </body></html>");
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }
}
function switchHistorialTab(tab) {
  const diasBtn = document.getElementById('htab-dias');
  const clientesBtn = document.getElementById('htab-clientes');
  const diasView = document.getElementById('historial-tab-dias');
  const clientesView = document.getElementById('historial-tab-clientes');
  if (!diasBtn) return;
  if (tab === 'dias') {
    diasBtn.style.borderBottomColor = '#3D1F0D';
    diasBtn.style.color = '#3D1F0D';
    diasBtn.style.fontWeight = '700';
    clientesBtn.style.borderBottomColor = 'transparent';
    clientesBtn.style.color = '#8A6A4E';
    clientesBtn.style.fontWeight = '600';
    diasView.style.display = 'block';
    clientesView.style.display = 'none';
  } else {
    clientesBtn.style.borderBottomColor = '#3D1F0D';
    clientesBtn.style.color = '#3D1F0D';
    clientesBtn.style.fontWeight = '700';
    diasBtn.style.borderBottomColor = 'transparent';
    diasBtn.style.color = '#8A6A4E';
    diasBtn.style.fontWeight = '600';
    diasView.style.display = 'none';
    clientesView.style.display = 'block';
    renderClientes();
  }
}
function _buildClientesMap() {
  const hist = getHistorial();
  const map = {}; // phone → { phone, names, count, total, lastDate, lastOrder, orders[] }
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      const phone = (o.phone || '').replace(/[\s\-().+]/g, '') || '—';
      const name = o.name || '—';
      if (!map[phone]) map[phone] = {
        phone,
        names: new Set(),
        count: 0,
        total: 0,
        lastDate: '',
        lastOrder: null,
        orders: []
      };
      map[phone].names.add(name);
      map[phone].count++;
      map[phone].total = parseFloat((map[phone].total + (o.total || 0)).toFixed(2));
      if (!map[phone].lastDate || day.date > map[phone].lastDate) {
        map[phone].lastDate = day.date;
        map[phone].lastOrder = o;
      }
      map[phone].orders.push({
        ...o,
        date: day.date
      });
    });
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}
var _clientesSort = 'az';
function setClientesSort(modo) {
  _clientesSort = modo;
  ['az','pedidos','gasto','reciente'].forEach(function(m) {
    var btn = document.getElementById('csort-btn-' + m);
    if (!btn) return;
    if (m === modo) {
      btn.style.background = '#3D1F0D';
      btn.style.color = '#FFF8EE';
      btn.style.borderColor = '#3D1F0D';
    } else {
      btn.style.background = '#FFFFFF';
      btn.style.color = '#8A6A4E';
      btn.style.borderColor = '#F5E6C8';
    }
  });
  renderClientes();
}
function _nombreCanonico(c) {
  const names = [...c.names].filter(n => n !== '\u2014');
  if (!names.length) return '\u2014';
  return names.reduce((a, b) => b.length > a.length ? b : a);
}
function renderClientes() {
  var _document$getElementB29;
  const clientes = _buildClientesMap();
  const q = (((_document$getElementB29 = document.getElementById('clientes-search')) === null || _document$getElementB29 === void 0 ? void 0 : _document$getElementB29.value) || '').trim().toLowerCase();
  let filtered = q ? clientes.filter(c => c.phone.includes(q) || [...c.names].some(n => n.toLowerCase().includes(q))) : clientes.slice();

  if (_clientesSort === 'gasto') {
    filtered.sort((a, b) => b.total - a.total);
  } else if (_clientesSort === 'reciente') {
    filtered.sort((a, b) => (b.lastDate || '').localeCompare(a.lastDate || ''));
  } else if (_clientesSort === 'az') {
    filtered.sort((a, b) => _nombreCanonico(a).localeCompare(_nombreCanonico(b), 'es', { sensitivity: 'base' }));
  } else {
    filtered.sort((a, b) => b.count - a.count);
  }

  const summaryEl = document.getElementById('clientes-summary');
  if (summaryEl) {
    const totalClientes = clientes.length;
    const totalPedidos = clientes.reduce((a, c) => a + c.count, 0);
    const ticketMedio = totalPedidos ? (clientes.reduce((a, c) => a + c.total, 0) / totalPedidos).toFixed(2) : '0.00';
    summaryEl.innerHTML =
      '<div class="stat-card">'
      + '<div class="stat-num">' + totalClientes + '</div>'
      + '<div class="stat-label">Clientes \u00FAnicos</div>'
      + '</div>'
      + '<div class="stat-card">'
      + '<div class="stat-num">' + totalPedidos + '</div>'
      + '<div class="stat-label">Pedidos totales</div>'
      + '</div>'
      + '<div class="stat-card stat-card--gold">'
      + '<div class="stat-num">' + ticketMedio.replace('.', ',') + ' \u20AC</div>'
      + '<div class="stat-label">Ticket medio</div>'
      + '</div>';
  }

  const listEl = document.getElementById('clientes-list');
  if (!listEl) return;
  if (!filtered.length) {
    listEl.innerHTML = '<div style="text-align:center;color:#8A6A4E;padding:24px;font-size:13px">Sin resultados</div>';
    return;
  }

  let _lastLetter = null;
  listEl.innerHTML = filtered.map(c => {
    const canonName = _nombreCanonico(c);
    const otherNames = [...c.names].filter(n => n !== '\u2014' && n !== canonName);
    const aliasBadge = otherNames.length
      ? '<span style="display:inline-block;background:#F5E6C8;color:#8A6A4E;border-radius:99px;font-size:10.5px;font-weight:700;padding:1px 8px;margin-left:6px">+' + otherNames.length + ' alias</span>'
      : '';
    const aliasFull = otherNames.length
      ? '<div style="font-size:12px;color:#8A6A4E;margin-bottom:10px">Tambi\u00E9n guardado como: ' + escapeHtml(otherNames.join(', ')) + '</div>'
      : '';
    let letterHead = '';
    if (_clientesSort === 'az') {
      const letra = (canonName[0] || '#').toUpperCase();
      if (letra !== _lastLetter) {
        _lastLetter = letra;
        letterHead = '<div class="client-letter-head">' + letra + '</div>';
      }
    }
    const isFrequent = c.count >= 7;
    const frecBadge = isFrequent
      ? '<span style="display:inline-block;background:#FAEEDA;color:#854F0B;border:1.5px solid #F5C4B3;border-radius:99px;font-size:11px;font-weight:700;padding:2px 9px;margin-left:6px">\u2B50 Frecuente</span>'
      : '';
    const isBlocked = c.phone !== '\u2014' && getBlacklist().includes(c.phone.replace(/\D/g, ''));
    const blockedBadge = isBlocked
      ? '<span style="display:inline-block;background:#fdf0ee;color:#c0392b;border:1.5px solid #e74c3c;border-radius:99px;font-size:11px;font-weight:700;padding:2px 9px;margin-left:6px">\u26D4 Bloqueado</span>'
      : '';
    const phoneDisplay = c.phone !== '\u2014' ? c.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : '\u2014';
    const phoneClean = c.phone !== '\u2014' ? c.phone.replace(/\D/g, '') : '';
    const callBtn = phoneClean
      ? '<a href="tel:+34' + phoneClean + '" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #B5D4F4;background:#E6F1FB;color:#185FA5;text-decoration:none;font-family:\'DM Sans\',sans-serif">\uD83D\uDCDE ' + phoneDisplay + '</a>'
      : '';
    const waBtn = phoneClean
      ? '<a href="https://wa.me/34' + phoneClean + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #9FE1CB;background:#E6FAF0;color:#1a7a4a;text-decoration:none;font-family:\'DM Sans\',sans-serif">\uD83D\uDCAC WhatsApp</a>'
      : '';
    const actionBtns = (callBtn || waBtn)
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" onclick="event.stopPropagation()">' + callBtn + waBtn + '</div>'
      : '';
    const phoneId = phoneClean || c.phone.replace(/\W/g, '');

    if (!window._dpfPedidosMap) window._dpfPedidosMap = {};
    const ordersHtml = c.orders.slice().reverse().slice(0, 20).map((o) => {
      const mapKey = 'pm_' + phoneId + '_' + (o.num || '').replace(/\W/g, '');
      window._dpfPedidosMap[mapKey] = o;
      return '<div style="border-bottom:1px dashed #F5E6C8;display:flex;justify-content:space-between;align-items:center;padding:7px 0;flex-wrap:wrap;gap:4px">'
        + '<span style="color:#3D1F0D;font-weight:700;font-size:12px;cursor:pointer" onclick="event.stopPropagation();openPedidoModal(window._dpfPedidosMap[\'' + mapKey + '\'])">' + escapeHtml(o.num) + '</span>'
        + '<span style="color:#8A6A4E;font-size:12px">' + escapeHtml(o.date || '') + ' ' + escapeHtml(o.time || '') + '</span>'
        + '<span style="font-weight:700;color:#3D1F0D;font-size:12px">' + (o.total || 0).toFixed(2).replace('.', ',') + ' \u20AC</span>'
        + '</div>';
    }).join('');

    return letterHead + '<div style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:16px;padding:14px;margin-bottom:8px;cursor:pointer" onclick="toggleClienteDetalle(\'' + phoneId + '\')">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">'
        + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:4px">'
            + '<span style="font-size:15px;font-weight:700;color:#3D1F0D">' + escapeHtml(canonName) + '</span>'
            + aliasBadge
            + frecBadge
            + blockedBadge
            + '<span id="fid-badge-' + phoneId + '" style="display:none"></span>'
          + '</div>'
          + '<div style="font-size:12px;color:#8A6A4E">' + phoneDisplay + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
          + '<div style="font-size:18px;font-weight:900;font-family:\'Anton\',sans-serif;color:#3D1F0D">' + c.total.toFixed(2).replace('.', ',') + ' \u20AC</div>'
          + '<div style="font-size:11px;color:#8A6A4E">' + c.count + ' pedido' + (c.count !== 1 ? 's' : '') + ' \u00B7 \u00FAltimo ' + (c.lastDate || '') + '</div>'
        + '</div>'
      + '</div>'
      + actionBtns
      + '<div id="cliente-detalle-' + phoneId + '" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid #F5E6C8">'
        + aliasFull
        + '<div style="font-size:11px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Historial de pedidos</div>'
        + ordersHtml
        + (c.orders.length > 20 ? '<div style="font-size:11px;color:#8A6A4E;margin-top:6px">...y ' + (c.orders.length - 20) + ' m\u00E1s</div>' : '')
      + '</div>'
    + '</div>';
  }).join('');

  // Cargar sellos de fidelización en segundo plano, sin bloquear el render de la lista
  if (window.fb_loadFidelizacionCliente) {
    filtered.forEach(c => {
      const phoneClean = c.phone !== '\u2014' ? c.phone.replace(/\D/g, '') : '';
      if (!phoneClean) return;
      const phoneId = phoneClean;
      window.fb_loadFidelizacionCliente(phoneClean).then(cliente => {
        if (!cliente) return;
        const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
        if (!cliente.sellos && !premiosPendientes) return;
        const badge = document.getElementById('fid-badge-' + phoneId);
        if (!badge) return;
        const meta = (typeof FIDELIZACION_META !== 'undefined') ? FIDELIZACION_META : 10;
        const texto = premiosPendientes > 0
          ? '\uD83C\uDF81 ' + premiosPendientes + (premiosPendientes > 1 ? ' premios' : ' premio') + ' pendiente' + (premiosPendientes > 1 ? 's' : '')
          : '\uD83C\uDF96\uFE0F ' + cliente.sellos + '/' + meta + ' sellos';
        const bg = premiosPendientes > 0 ? '#FAEEDA' : '#E6F1FB';
        const color = premiosPendientes > 0 ? '#854F0B' : '#185FA5';
        const border = premiosPendientes > 0 ? '#F5C4B3' : '#B5D4F4';
        badge.style.display = 'inline-block';
        badge.style.background = bg;
        badge.style.color = color;
        badge.style.border = '1.5px solid ' + border;
        badge.style.borderRadius = '99px';
        badge.style.fontSize = '11px';
        badge.style.fontWeight = '700';
        badge.style.padding = '2px 9px';
        badge.style.marginLeft = '6px';
        badge.textContent = texto;
      }).catch(() => {});
    });
  }
}
function toggleClienteDetalle(phoneId) {
  const id = 'cliente-detalle-' + phoneId;
  const el = document.getElementById(id);
  if (!el) return;
  const card = el.parentElement;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if (card) card.style.borderColor = isOpen ? '#F5E6C8' : '#3D1F0D';
}
function openPedidoModal(o) {
  // Crear modal si no existe
  var modal = document.getElementById('pedido-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pedido-modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(61,31,13,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
    modal.innerHTML = '<div id="pedido-modal-box" style="background:#FFF8EE;border-radius:18px;padding:22px 20px;width:100%;max-width:340px;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
      + '<button onclick="document.getElementById(\'pedido-modal-overlay\').style.display=\'none\'" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;color:#8A6A4E;line-height:1">✕</button>'
      + '<div id="pedido-modal-content"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });
    document.body.appendChild(modal);
  }
  var hasItems = o.items && o.items.length;
  var itemsHtml = hasItems
    ? o.items.filter(function(it) { return it.name && !it.isFee; }).map(function(it) {
        var extras = it.extras && it.extras.length
          ? '<span style="color:#8A6A4E;font-size:11px;display:block">' + it.extras.map(function(e){return escapeHtml(e);}).join(' · ') + '</span>'
          : '';
        return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px dashed #F5E6C8;font-size:13px">'
          + '<div style="flex:1;color:#2A1506">' + escapeHtml((it.qty || 1) + '\u00D7 ' + it.name) + extras + '</div>'
          + '<div style="font-weight:600;white-space:nowrap;margin-left:10px;color:#3D1F0D">' + (it.subtotal || 0).toFixed(2).replace('.', ',') + ' \u20AC</div>'
          + '</div>';
      }).join('')
    : '<div style="font-size:12px;color:#8A6A4E;font-style:italic;padding:8px 0">Sin detalle de productos</div>';
  var slotLine = o.slot ? ' \u00B7 recogida ' + escapeHtml(o.slot) + 'h' : '';
  document.getElementById('pedido-modal-content').innerHTML =
    '<div style="font-size:22px;font-weight:900;color:#3D1F0D;font-family:Georgia,serif;margin-bottom:2px">' + escapeHtml(o.num) + '</div>'
    + '<div style="font-size:12px;color:#8A6A4E;margin-bottom:14px">' + escapeHtml(o.date || '') + ' \u00B7 ' + escapeHtml(o.time || '') + slotLine + '</div>'
    + itemsHtml
    + '<div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:#3D1F0D;margin-top:10px;padding-top:10px;border-top:1.5px solid #F5E6C8">'
      + '<span>Total</span><span style="color:#3D1F0D">' + (o.total || 0).toFixed(2).replace('.', ',') + ' \u20AC</span>'
    + '</div>';
  modal.style.display = 'flex';
}
function exportClientesCSV() {
  const clientes = _buildClientesMap();
  const rows = [['Teléfono', 'Nombre', 'Pedidos', 'Total (€)', 'Último pedido']];
  clientes.forEach(c => {
    rows.push([c.phone, [...c.names].join(' / '), c.count, c.total.toFixed(2).replace('.', ','), c.lastDate]);
  });
  // _csvEscape (historial-export.js) dobla las comillas internas — sin
  // esto, un nombre de cliente con una " cortaba la fila antes de tiempo y
  // desplazaba las columnas siguientes al abrir el CSV en Excel/Sheets.
  const csv = rows.map(r => r.map(v => "\"".concat(_csvEscape(v), "\"")).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes_dulce_patata.csv';
  a.click();
  URL.revokeObjectURL(url);
}
function loadHistorial() {
  // Cargar historial completo desde Firebase (fuente de verdad entre dispositivos)
  if (window.fb_loadHistorial) {
    window.fb_loadHistorial(30).then(fbHist => {
      if (fbHist && fbHist.length > 0) {
        // Guardar en localStorage para acceso rápido futuro
        fbHist.forEach(d => saveToHistorial(d));
      }
      _renderHistorial();
    }).catch(() => _renderHistorial());
    // Mostrar localStorage mientras llega Firebase
    if (getHistorial().length > 0) _renderHistorial();
    return;
  }
  _renderHistorial();
}
function _renderHistorial() {
  const hist = getHistorial();
  const summary = document.getElementById('historial-summary');
  const list = document.getElementById('historial-list');
  const chartEl = document.getElementById('historial-chart');
  if (!summary || !list) return;
  if (!hist.length) {
    summary.innerHTML = '';
    if (chartEl) chartEl.innerHTML = '';
    list.innerHTML = '<div style="color:#8A6A4E;font-size:13px;text-align:center;padding:20px">Sin historial todavía</div>';
    return;
  }
  const totalDays = hist.length;
  const totalOrders = hist.reduce((s, d) => s + d.count, 0);
  const totalMoney = hist.reduce((s, d) => s + d.total, 0);
  const avgPerDay = totalOrders / totalDays;
  const ticketMedio = totalOrders > 0 ? totalMoney / totalOrders : 0;
  summary.innerHTML = "\n    <div class=\"stat-card\">\n      <div class=\"stat-num\">".concat(totalOrders, "</div>\n      <div class=\"stat-label\">Pedidos totales</div>\n    </div>\n    <div class=\"stat-card stat-card--gold\">\n      <div class=\"stat-num\">").concat(totalMoney.toFixed(2).replace('.', ','), " \u20AC</div>\n      <div class=\"stat-label\">Ingresos totales</div>\n    </div>\n    <div class=\"stat-card\">\n      <div class=\"stat-num\">").concat(ticketMedio.toFixed(2).replace('.', ','), " \u20AC</div>\n      <div class=\"stat-label\">Ticket medio</div>\n    </div>");

  // Gráfico de barras (últimos 14 días)
  if (chartEl) {
    const recent = hist.slice(0, 14).reverse();
    const maxCount = Math.max(...recent.map(d => d.count), 1);
    chartEl.innerHTML = recent.map(d => {
      const pct = Math.round(d.count / maxCount * 100);
      const label = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
      return "<div class=\"hist-bar-wrap\" title=\"".concat(label, ": ").concat(d.count, " pedidos \xB7 ").concat(d.total.toFixed(2), " \u20AC\" onclick=\"expandHistorialDay('").concat(d.date, "')\">\n        <div class=\"hist-bar\" style=\"height:").concat(Math.max(pct, 4), "%\"></div>\n        <div class=\"hist-bar-label\">").concat(label, "</div>\n      </div>");
    }).join('');
  }
  list.innerHTML = hist.map(d => {
    const dateLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    return "\n    <div style=\"display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap\">\n      <span style=\"font-weight:600;color:#2A1506;font-size:13px;min-width:110px\">".concat(dateLabel, "</span>\n      <span style=\"font-size:13px;color:#8A6A4E\">").concat(d.count, " pedido").concat(d.count !== 1 ? 's' : '', "</span>\n      <span style=\"font-weight:700;color:#3D1F0D;font-size:14px\">").concat(d.total.toFixed(2).replace('.', ','), " \u20AC</span>\n      <button onclick=\"expandHistorialDay('").concat(d.date, "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;color:#3D1F0D;font-weight:600\">Ver detalle</button>\n      <button onclick=\"exportDayPDFFromHistorial('").concat(d.date, "')\" style=\"background:#3D1F0D;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif\">\uD83D\uDCC4 PDF</button>\n    </div>");
  }).join('');
}
function exportDayPDFFromHistorial(date) {
  const hist = getHistorial();
  const day = hist.find(d => d.date === date);
  if (!day || !day.orders || !day.orders.length) {
    alert('No hay pedidos para este día');
    return;
  }
  const fecha = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  _exportDayDataPDF(day.orders, day.total, fecha, date);
}
async function exportDayPDF() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try {
      stats = await window.fb_getStats(todayKey);
    } catch {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {}
  }
  if (!stats || !stats.orders || !stats.orders.length) {
    alert('No hay pedidos hoy para exportar');
    return;
  }
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  _exportDayDataPDF(stats.orders, stats.total, fecha, todayKey);
}
function _exportDayDataPDF(orders, total, fecha, dateKey) {
  const t = total || orders.reduce((a, o) => a + (o.total || 0), 0);
  const ordersHtml = orders.map(o => {
    const itemsHtml = (o.items || []).map(it => "<div class=\"order-item\"><span>".concat(it.qty, "x ").concat(escapeHtml(it.name || ''), "</span><span>").concat((it.subtotal || 0).toFixed(2).replace('.', ','), " \u20AC</span></div>")).join('');
    return "<div class=\"order-card\">\n      <div style=\"display:flex;justify-content:space-between;align-items:flex-start\">\n        <div>\n          <div class=\"order-num\">".concat(escapeHtml(o.num || ''), "</div>\n          <div class=\"order-meta\">\uD83D\uDC64 ").concat(escapeHtml(o.name || '—'), " &nbsp;\xB7&nbsp; \uD83D\uDD50 ").concat(escapeHtml(o.time || '—')).concat(o.slot ? " &nbsp;\xB7&nbsp; \uD83D\uDCE6 ".concat(escapeHtml(o.slot)) : '').concat(o.phone ? " &nbsp;\xB7&nbsp; \uD83D\uDCDE ".concat(escapeHtml(o.phone)) : '', "</div>\n        </div>\n        <div style=\"font-size:18px;font-weight:900;color:#3D1F0D\">").concat((o.total || 0).toFixed(2).replace('.', ','), " \u20AC</div>\n      </div>\n      ").concat(itemsHtml ? "<div class=\"order-items\">".concat(itemsHtml, "</div>") : '', "\n      ").concat(o.notes ? "<div style=\"font-size:12px;color:#8A6A4E;margin-top:6px;font-style:italic\">\uD83D\uDCDD ".concat(escapeHtml(o.notes), "</div>") : '', "\n    </div>");
  }).join('');
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Pedidos ".concat(dateKey, "</title>\n  <style>").concat(_pdfStyles(), "</style></head><body>\n  <div class=\"header\"><h1>\uD83E\uDD54 Dulce Patata Food</h1><p>Resumen de pedidos \xB7 ").concat(fecha, "</p></div>\n  <div class=\"content\">\n    <div class=\"summary\">\n      <div class=\"summary-item\"><div class=\"val\">").concat(orders.length, "</div><div class=\"lbl\">Pedidos</div></div>\n      <div class=\"summary-item\"><div class=\"val\">").concat(t.toFixed(2).replace('.', ','), " \u20AC</div><div class=\"lbl\">Total</div></div>\n      <div class=\"summary-item\"><div class=\"val\">").concat((t / orders.length).toFixed(2).replace('.', ','), " \u20AC</div><div class=\"lbl\">Ticket medio</div></div>\n    </div>\n    ").concat(ordersHtml, "\n  </div></body></html>");
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }
}
function exportHistorialPDF() {
  const hist = getHistorial();
  if (!hist.length) {
    alert('No hay historial para exportar');
    return;
  }
  const totalOrders = hist.reduce((s, d) => s + d.count, 0);
  const totalMoney = hist.reduce((s, d) => s + d.total, 0);
  const daysHtml = hist.slice().reverse().map(d => {
    const fecha = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const ordersHtml = (d.orders || []).map(o => "<div class=\"order-item\" style=\"font-size:12px\"><span>".concat(escapeHtml(o.num || ''), " \xB7 ").concat(escapeHtml(o.name || '—'), " ").concat(o.time ? '· ' + escapeHtml(o.time) : '', "</span><span>").concat((o.total || 0).toFixed(2).replace('.', ','), " \u20AC</span></div>")).join('');
    return "<div class=\"order-card\">\n      <div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px\">\n        <div class=\"order-num\" style=\"font-size:15px\">".concat(fecha, "</div>\n        <div style=\"font-size:14px;font-weight:700;color:#3D1F0D\">").concat(d.count, " pedidos \xB7 ").concat(d.total.toFixed(2).replace('.', ','), " \u20AC</div>\n      </div>\n      ").concat(ordersHtml, "\n    </div>");
  }).join('');
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Historial Dulce Patata</title>\n  <style>".concat(_pdfStyles(), "</style></head><body>\n  <div class=\"header\"><h1>\uD83E\uDD54 Dulce Patata Food</h1><p>Historial completo \xB7 ").concat(hist.length, " d\xEDas</p></div>\n  <div class=\"content\">\n    <div class=\"summary\">\n      <div class=\"summary-item\"><div class=\"val\">").concat(hist.length, "</div><div class=\"lbl\">D\xEDas</div></div>\n      <div class=\"summary-item\"><div class=\"val\">").concat(totalOrders, "</div><div class=\"lbl\">Pedidos</div></div>\n      <div class=\"summary-item\"><div class=\"val\">").concat(totalMoney.toFixed(2).replace('.', ','), " \u20AC</div><div class=\"lbl\">Total</div></div>\n      <div class=\"summary-item\"><div class=\"val\">").concat(totalOrders ? (totalMoney / totalOrders).toFixed(2).replace('.', ',') : '0,00', " \u20AC</div><div class=\"lbl\">Ticket medio</div></div>\n    </div>\n    ").concat(daysHtml, "\n  </div></body></html>");
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }
}
function expandHistorialDay(date) {
  const hist = getHistorial();
  const day = hist.find(d => d.date === date);
  if (!day) return;
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Productos del día
  const prodCounts = {};
  (day.orders || []).forEach(o => {
    (o.items || []).forEach(it => {
      prodCounts[it.name] = (prodCounts[it.name] || 0) + it.qty;
    });
  });
  const topDay = Object.entries(prodCounts).sort((a, b) => b[1] - a[1]);
  let html = "\n    <h3 style=\"font-family:'Playfair Display',serif;color:#3D1F0D;margin-bottom:4px;font-size:18px\">".concat(dateLabel, "</h3>\n    <div style=\"display:grid;grid-template-columns:1fr 1fr;margin:14px 0\">\n      <div style=\"background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:8px;padding:12px;text-align:center\">\n        <div style=\"font-size:22px;font-weight:900;color:#3D1F0D\">").concat(day.count, "</div>\n        <div style=\"font-size:11px;color:#8A6A4E;font-weight:600;text-transform:uppercase\">Pedidos</div>\n      </div>\n      <div style=\"background:#FFFFFF;border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;text-align:center\">\n        <div style=\"font-size:22px;font-weight:900;color:#3D1F0D\">").concat(day.total.toFixed(2).replace('.', ','), " \u20AC</div>\n        <div style=\"font-size:11px;color:#8A6A4E;font-weight:600;text-transform:uppercase\">Total</div>\n      </div>\n    </div>");
  if (topDay.length) {
    html += "<div style=\"font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px\">\uD83C\uDFC6 M\xE1s vendido este d\xEDa</div>";
    html += topDay.slice(0, 4).map(_ref23 => {
      let _ref24 = _slicedToArray(_ref23, 2),
        name = _ref24[0],
        qty = _ref24[1];
      return "<div style=\"display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F5E6C8;font-size:13px\">\n        <span style=\"color:#2A1506;font-weight:500\">".concat(escapeHtml(name), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(qty, " uds</span>\n      </div>");
    }).join('');
  }
  html += "<div style=\"font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px\">\uD83E\uDDFE Pedidos</div>";
  (day.orders || []).forEach(o => {
    html += "<div style=\"display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n      <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n      <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n      ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">\uD83D\uDD50 ".concat(escapeHtml(o.slot), "</span>") : '', "\n      <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n      <span style=\"font-weight:700;color:#3D1F0D\">").concat(o.total.toFixed(2).replace('.', ','), " \u20AC</span>\n    </div>");
  });
  html += "<div style=\"text-align:right;margin-top:12px\"><button onclick=\"closeHistorialDayModal()\" style=\"background:#F5E6C8;border:none;border-radius:8px;padding:8px 20px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;color:#3D1F0D\">Cerrar</button></div>";
  const modal = document.getElementById('historial-day-modal');
  document.getElementById('historial-day-modal-content').innerHTML = html;
  modal.style.display = 'block';
}
function closeHistorialDayModal() {
  document.getElementById('historial-day-modal').style.display = 'none';
}

// Update showAdminSection to also load live orders
let _lastAdminSection = 'productos';
function adminGoBack() {
  showAdminSection(_lastAdminSection, null);
  // reactivar tab correspondiente
  document.querySelectorAll('.admin-tab').forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + _lastAdminSection + "'")) {
      t.classList.add('active');
    }
  });
  document.getElementById('admin-back-btn').style.display = 'none';
}
function toggleSettingsDropdown() {
  const d = document.getElementById('settings-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
  if (d.style.display === 'block') {
    setTimeout(() => document.addEventListener('click', _closeSettingsOnClickOutside), 0);
  }
}
function closeSettingsDropdown() {
  document.getElementById('settings-dropdown').style.display = 'none';
  document.removeEventListener('click', _closeSettingsOnClickOutside);
}
function _closeSettingsOnClickOutside(e) {
  const d = document.getElementById('settings-dropdown');
  if (!d.contains(e.target) && !e.target.closest('[onclick="toggleSettingsDropdown()"]')) {
    closeSettingsDropdown();
  }
}
function showAdminSection(id, btn) {
  // Guardar sección anterior para el botón volver (solo si venimos de una tab normal)
  const settingsSections = ['config', 'pwd', 'pedidos-config'];
  const currentActive = document.querySelector('.admin-section.active');
  if (currentActive) {
    const currentId = currentActive.id.replace('admin-', '');
    if (!settingsSections.includes(currentId)) _lastAdminSection = currentId;
  }
  // Mostrar/ocultar flecha volver
  const backBtn = document.getElementById('admin-back-btn');
  if (backBtn) backBtn.style.display = settingsSections.includes(id) ? 'inline-block' : 'none';
  document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const _sec = document.getElementById('admin-' + id);
  if (!_sec) { console.error('showAdminSection: section not found: admin-' + id); return; }
  _sec.classList.add('active');
  _sec.style.display = 'block';
  if (btn) btn.classList.add('active');
  if (id === 'stats') loadDayStats();
  if (id === 'historial') {
    loadHistorial();
    loadAutoDeleteUI();
    applyAutoDelete();
  }
  if (id === 'pedidos') {
    _adminLoggedIn = true; window._adminLoggedIn = true;
    stopAlertLoop();
    _resetPedidosPendientesAlerta();
    loadLiveOrdersWithLocalFirst();
    _lastKnownOrderCount = null;
    checkForNewOrders();
    clearUnseenOrders();
    loadCatBlockUI();
  }
  if (id === 'log') renderActivityLog();
  if (id === 'alertas') {
    renderAlertas();
    if (typeof renderIncidencias === 'function') renderIncidencias();
  }
  if (id === 'pwd') loadUrlTokenUI();
  if (id === 'stock-config') {
    loadStockAdminList();
    setTimeout(pp2CheckFirebaseBanner, 500);
  }
  if (id === 'local') {
    loadSoundConfigUI();
    updateForceSlotsBtn();
    loadSlotTurnosUI();
    loadFeeUI();
    loadModifyWindowInput();
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
    if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI();
    if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
  }
  if (id === 'accesos') {
    renderAccesosLog();
    renderActivityLog();
  }
  if (id === 'empleados') {
    setTimeout(empRenderAdmin, 50);
  }
  if (id === 'local') {
    loadBannerDia();
  }
  if (id === 'config') {
    loadAntiSpamFromFirebase();
  }
  if (id === 'pedidos-config') {
    loadAntiSpamFromFirebase();
    // Inicializar cooldown y daily limit
    var cfg = getAntiSpamCfg();
    var cdEl = document.getElementById('cfg-cooldown');
    var dlEl = document.getElementById('cfg-daily-limit');
    if (cdEl) cdEl.value = cfg.cooldown;
    if (dlEl) dlEl.value = cfg.dailyLimit;
    // Inicializar fee
    var feeEn = getFeeEnabled();
    var feeAmt = getFeeAmount();
    var feeLbl = getFeeLabel();
    var feeAmtEl = document.getElementById('cfg-fee-amount');
    var feeLblEl = document.getElementById('cfg-fee-label');
    var feeToggle = document.getElementById('fee-toggle');
    var feeToggleDot = document.getElementById('fee-toggle-dot');
    if (feeAmtEl) feeAmtEl.value = feeAmt.toFixed(2);
    if (feeLblEl) feeLblEl.value = feeLbl;
    if (feeToggle) feeToggle.style.background = feeEn ? '#27855a' : '#ccc';
    if (feeToggleDot) feeToggleDot.style.transform = feeEn ? 'translateX(20px)' : 'translateX(0)';
    // Inicializar slot max
    var slotMaxEl = document.getElementById('slot-max-input-cfg') || document.getElementById('slot-max-input');
    if (slotMaxEl) slotMaxEl.value = getSlotMax();
    // Inicializar descuento estudiante/jubilado
    if (typeof getStudentDiscountEnabled === 'function') {
      var sdEn = getStudentDiscountEnabled();
      var sdPct = getStudentDiscountPct();
      var sdPctEl = document.getElementById('cfg-student-discount-pct');
      var sdToggle = document.getElementById('student-discount-toggle');
      var sdToggleDot = document.getElementById('student-discount-toggle-dot');
      if (sdPctEl) sdPctEl.value = sdPct;
      if (sdToggle) sdToggle.style.background = sdEn ? '#27855a' : '#ccc';
      if (sdToggleDot) sdToggleDot.style.transform = sdEn ? 'translateX(20px)' : 'translateX(0)';
    }
  }
}
async function renderActiveSessionsList() {
  const container = document.getElementById('active-sessions-list');
  if (!container) return;
  container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">Cargando...</div>';
  try {
    const snap = await firebase.database().ref('activeSessions').get();
    const data = snap.val();
    if (!data) {
      container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">No hay sesiones activas ahora mismo.</div>';
      return;
    }
    const sessions = Object.values(data).filter(s => !s.killed).sort((a, b) => b.ts - a.ts);
    if (!sessions.length) {
      container.innerHTML = '<div style="color:#8A6A4E;font-size:13px">No hay sesiones activas ahora mismo.</div>';
      return;
    }
    container.innerHTML = sessions.map(s => {
      const isMe = s.sid === window._mySessionId;
      return '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
        '<div>' +
          '<div style="font-size:13px;font-weight:700;color:#3D1F0D">' + (s.device || 'Dispositivo desconocido') + (isMe ? ' <span style="background:#27855a;color:#fff;font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600">Tú</span>' : '') + '</div>' +
          '<div style="font-size:11px;color:#8A6A4E;margin-top:2px">Desde: ' + (s.time || '–') + '</div>' +
        '</div>' +
        '<button onclick="killSession(&quot;' + s.sid + '&quot;)" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:sans-serif">' + (isMe ? 'Cerrar mi sesión' : 'Expulsar') + '</button>' +
      '</div>';
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="color:#c0392b;font-size:13px">Error al cargar sesiones: ' + e.message + '</div>';
  }
}

async function killSession(sid) {
  try {
    await firebase.database().ref('activeSessions/' + sid + '/killed').set(true);
    // Si esa sesión ya no está conectada para pillar el aviso en directo,
    // "killed" por sí solo no basta: el dispositivo seguiría entrando sin
    // pedir contraseña la próxima vez gracias a "dispositivo de confianza".
    // Por eso también se borra aquí su registro de confianza — así deja
    // de valer de verdad, lo esté escuchando en ese momento o no.
    try {
      const snap = await firebase.database().ref('activeSessions/' + sid + '/deviceId').get();
      const deviceId = snap.val();
      if (deviceId) await firebase.database().ref('config/trustedDevices/' + deviceId).remove();
    } catch (e) {}
    renderActiveSessionsList();
  } catch(e) {
    alert('Error al expulsar la sesión: ' + e.message);
  }
}

async function killAllSessions() {
  try {
    const todas = (await firebase.database().ref('activeSessions').get()).val();
    if (!todas) { showAlert('No hay sesiones activas ahora mismo.'); return; }
    const otras = Object.values(todas).filter(s => !s.killed && s.sid !== window._mySessionId);
    if (!otras.length) { showAlert('No hay otras sesiones activas para expulsar.'); return; }
    const ok = await showConfirmAsync(
      '¿Expulsar todas?',
      'Se cerrará el panel en ' + otras.length + ' dispositivo' + (otras.length !== 1 ? 's' : '') + ' (menos el tuyo). Tendrán que volver a iniciar sesión.',
      'Expulsar todas'
    );
    if (!ok) return;
    const updates = {};
    otras.forEach(s => {
      updates['activeSessions/' + s.sid + '/killed'] = true;
      if (s.deviceId) updates['config/trustedDevices/' + s.deviceId] = null; // revoca también la confianza, no solo la sesión en directo
    });
    await firebase.database().ref().update(updates);
    logActivity('🚫 Expulsadas ' + otras.length + ' sesión' + (otras.length !== 1 ? 'es' : '') + ' a la vez');
    renderActiveSessionsList();
  } catch (e) {
    showAlert('Error al expulsar las sesiones: ' + e.message);
  }
}


// ── PANEL ADMIN: FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META_ADMIN = 10;
// Umbral para marcar ritmo sospechoso: 2+ sellos separados por menos de
// esto se considera posible abuso (pedidos reales no suelen ir tan seguidos).
const FIDELIZACION_MINUTOS_SOSPECHOSO = 10;
let _fidelizacionDataCache = null;

// Devuelve true si el cliente tiene 2 o más sellos consecutivos separados
// por menos de FIDELIZACION_MINUTOS_SOSPECHOSO minutos.
function _clienteConRitmoSospechoso(historialSellos) {
  if (!historialSellos || historialSellos.length < 2) return false;
  const umbralMs = FIDELIZACION_MINUTOS_SOSPECHOSO * 60 * 1000;
  for (let i = 1; i < historialSellos.length; i++) {
    const prev = historialSellos[i - 1] && historialSellos[i - 1].ts;
    const curr = historialSellos[i] && historialSellos[i].ts;
    if (prev && curr && (curr - prev) < umbralMs) return true;
  }
  return false;
}
async function renderFidelizacionList() {
  const el = document.getElementById('fidelizacion-list');
  const resumenEl = document.getElementById('fidelizacion-resumen');
  if (!el) return;
  if (resumenEl) resumenEl.innerHTML = '';
  try {
    if (!window.fb_loadFidelizacionAll) {
      el.innerHTML = '<div style="font-size:13px;color:#c0392b">Firebase no disponible.</div>';
      return;
    }
    _fidelizacionDataCache = await window.fb_loadFidelizacionAll();
    _filtrarYPintarFidelizacion();
  } catch (e) {
    el.innerHTML = '<div style="font-size:13px;color:#c0392b">Error al cargar: ' + e.message + '</div>';
  }
}
function filtrarFidelizacionPorTipo(tipo) {
  window._fidelizacionFiltroTipo = tipo;
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (listEl) listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Limpiar la búsqueda de texto para que el filtro por tipo se vea claro
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';
  _filtrarYPintarFidelizacion();
}
function mostrarFidelizacionCanjes() {
  const data = _fidelizacionDataCache;
  if (!data) return;
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!listEl) return;
  listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Quitar cualquier filtro de tipo/búsqueda activo, esta es una vista distinta
  window._fidelizacionFiltroTipo = null;
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';

  let eventos = [];
  Object.entries(data).forEach(([telefono, c]) => {
    (c.historialCanjes || []).forEach(canje => {
      eventos.push({ telefono, nombre: c.nombre || 'Sin nombre', fecha: canje.fecha || '-', ticket: canje.ticket || null });
    });
  });
  if (!eventos.length) {
    listEl.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin premios canjeados todavía.</div>';
    return;
  }
  eventos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  listEl.innerHTML = '<div style="font-weight:700;color:#3D1F0D;margin-bottom:8px;font-size:13px">🎁 Historial de premios canjeados (' + eventos.length + ')</div>' +
    eventos.map(ev => {
      const nombreMostrar = escapeHtml(ev.nombre);
      const telMostrar = escapeHtml(ev.telefono);
      let h = '<div style="background:#fff;border:1.5px solid #F5E6C8;border-radius:10px;padding:10px 14px;font-size:13px">';
      h += '<span style="font-weight:700;color:#3D1F0D">' + nombreMostrar + '</span> <span style="color:#8A6A4E">(' + telMostrar + ')</span>';
      h += '<div style="color:#5a3e1b;font-size:12px;margin-top:2px">' + escapeHtml(ev.fecha) + (ev.ticket ? ' — Ticket ' + escapeHtml(ev.ticket) : '') + '</div>';
      h += '</div>';
      return h;
    }).join('<div style="height:6px"></div>');
}
function switchFidelizacionTab(tab) {
  const clientesBtn = document.getElementById('ftab-clientes');
  const editarBtn = document.getElementById('ftab-editar');
  const clientesView = document.getElementById('fidelizacion-tab-clientes');
  const editarView = document.getElementById('fidelizacion-tab-editar');
  if (!clientesBtn) return;
  if (tab === 'clientes') {
    clientesBtn.style.borderBottomColor = '#3D1F0D';
    clientesBtn.style.color = '#3D1F0D';
    clientesBtn.style.fontWeight = '700';
    editarBtn.style.borderBottomColor = 'transparent';
    editarBtn.style.color = '#8A6A4E';
    editarBtn.style.fontWeight = '600';
    clientesView.style.display = 'block';
    editarView.style.display = 'none';
  } else {
    editarBtn.style.borderBottomColor = '#3D1F0D';
    editarBtn.style.color = '#3D1F0D';
    editarBtn.style.fontWeight = '700';
    clientesBtn.style.borderBottomColor = 'transparent';
    clientesBtn.style.color = '#8A6A4E';
    clientesBtn.style.fontWeight = '600';
    clientesView.style.display = 'none';
    editarView.style.display = 'block';
  }
}
function toggleFidelizacionListaClientes() {
  const el = document.getElementById('fidelizacion-list');
  const icon = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!el) return;
  const abierta = el.style.display === 'flex';
  el.style.display = abierta ? 'none' : 'flex';
  if (icon) icon.textContent = abierta ? '▶' : '▼';
}
function _filtrarYPintarFidelizacion() {
  // Si el usuario escribe en el buscador, desplegamos la lista automáticamente
  // y quitamos cualquier filtro por tipo activo (chips), para que no se mezclen
  const searchElAuto = document.getElementById('fidelizacion-search');
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (searchElAuto && searchElAuto.value.trim()) {
    window._fidelizacionFiltroTipo = null;
    if (listEl && listEl.style.display === 'none') {
      listEl.style.display = 'flex';
      if (iconEl) iconEl.textContent = '▼';
    }
  }
  // Solo filtra y pinta con los datos ya cargados en memoria — instantáneo,
  // sin volver a leer Firebase en cada tecla del buscador (eso era lo que
  // provocaba el "salto" de página al escribir).
  const el = document.getElementById('fidelizacion-list');
  const resumenEl = document.getElementById('fidelizacion-resumen');
  if (!el) return;
  const data = _fidelizacionDataCache;
  if (!data || !Object.keys(data).length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Aún no hay clientes en el programa de fidelización.</div>';
    if (resumenEl) resumenEl.innerHTML = '';
    return;
  }
  let clientes = Object.entries(data).map(([telefono, c]) => ({
    telefono,
    nombre: c.nombre || '',
    sellos: typeof c.sellos === 'number' ? c.sellos : 0,
    premiosPendientes: typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0),
    vecesCompletado: typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0,
    historialCanjes: c.historialCanjes || [],
    sospechoso: _clienteConRitmoSospechoso(c.historialSellos)
  }));

  // Filtro de búsqueda por nombre o teléfono
  const searchEl = document.getElementById('fidelizacion-search');
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
  if (q) {
    clientes = clientes.filter(c => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q));
  }
  // Filtro por tipo, activado al hacer click en los chips de resumen
  if (window._fidelizacionFiltroTipo === 'premio') {
    clientes = clientes.filter(c => c.premiosPendientes > 0);
  } else if (window._fidelizacionFiltroTipo === 'sospechoso') {
    clientes = clientes.filter(c => c.sospechoso);
  }

  // Resumen: total clientes, con premio pendiente, total canjes, sospechosos
  const totalClientes = Object.keys(data).length;
  const conPremio = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) > 0).length;
  const totalCanjes = Object.values(data).reduce((s, c) => s + ((c.historialCanjes || []).length), 0);
  const totalSospechosos = Object.values(data).filter(c => _clienteConRitmoSospechoso(c.historialSellos)).length;
  if (resumenEl) {
    const chip = (label, val, color, onclickAttr) => "<div onclick=\"".concat(onclickAttr, "\" style=\"flex:1;min-width:110px;cursor:pointer;background:#fff;border:1.5px solid ").concat(color, ";border-radius:10px;padding:10px 16px;font-size:12px;color:#3D1F0D;text-align:center\"><div style=\"font-weight:900;font-size:18px\">").concat(val, "</div><div style=\"color:#8A6A4E\">").concat(label, "</div></div>");
    resumenEl.innerHTML = chip('Clientes en el programa', totalClientes, '#F5E6C8', "filtrarFidelizacionPorTipo('todos')")
      + chip('Con premio pendiente', conPremio, '#D9A441', "filtrarFidelizacionPorTipo('premio')")
      + chip('Premios canjeados', totalCanjes, '#F5E6C8', "mostrarFidelizacionCanjes()")
      + (totalSospechosos > 0 ? chip('🚨 Ritmo sospechoso', totalSospechosos, '#c0392b', "filtrarFidelizacionPorTipo('sospechoso')") : '');
  }

  // Ordenar: primero los que tienen premio pendiente, luego por sellos descendente
  clientes.sort((a, b) => {
    if (!!a.premiosPendientes !== !!b.premiosPendientes) return a.premiosPendientes ? -1 : 1;
    return b.sellos - a.sellos;
  });

  if (!clientes.length) {
    el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin resultados para esa búsqueda.</div>';
    return;
  }

  el.innerHTML = clientes.map(c => {
    const destacado = c.premiosPendientes > 0;
    const bg = c.sospechoso ? '#FDEDEC' : (destacado ? '#FFF3CD' : '#fff');
    const border = c.sospechoso ? '#c0392b' : (destacado ? '#D9A441' : '#F5E6C8');
    const sellosTexto = c.sellos + '/' + FIDELIZACION_META_ADMIN;
    const premioTexto = destacado
      ? '🎁 ' + c.premiosPendientes + (c.premiosPendientes > 1 ? ' premios pendientes' : ' premio pendiente')
      : (c.sellos === FIDELIZACION_META_ADMIN - 1 ? '🎉 1 sello para el premio' : '');
    const vecesTexto = c.vecesCompletado > 0 ? ' · 🏅 ha completado el ciclo ' + c.vecesCompletado + (c.vecesCompletado > 1 ? ' veces' : ' vez') : '';
    const sospechosoTexto = c.sospechoso ? ' · 🚨 ritmo sospechoso (sellos muy seguidos)' : '';
    const nombreMostrar = escapeHtml(c.nombre || 'Sin nombre');
    const telMostrar = escapeHtml(c.telefono);
    // escapeHtml no basta dentro de un onclick="fn('...')": el navegador
    // decodifica las entidades HTML (incluida &#39;) ANTES de ejecutar el
    // JS del atributo, así que una comilla simple sobrevivía y rompía la
    // llamada — escapeAttr la escapa también para el propio string de JS.
    const telAttr = escapeAttr(c.telefono);
    let h = '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    h += '<div>';
    h += '<div style="font-weight:700;color:#3D1F0D;font-size:14px">' + nombreMostrar + ' <span style="color:#8A6A4E;font-weight:500">(' + telMostrar + ')</span></div>';
    h += '<div style="font-size:13px;color:#5a3e1b;margin-top:2px">' + sellosTexto + ' sellos' + (premioTexto ? ' · ' + premioTexto : '') + vecesTexto + sospechosoTexto + '</div>';
    h += '</div>';
    h += '<button onclick="cargarFidelizacionParaEditar(\'' + telAttr + '\')" style="padding:7px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✏️ Editar</button>';
    h += '</div>';
    h += '<div onclick="toggleFidelizacionDetalle(\'' + telAttr + '\')" style="cursor:pointer;font-size:12px;color:#8A6A4E;padding:4px 16px 8px;border-bottom:1.5px solid ' + border + '">👇 Ver canjes y pedidos</div>';
    h += '<div id="fidel-detalle-' + telMostrar + '" style="display:none;padding:10px 16px;border-bottom:1.5px solid ' + border + ';font-size:12px;background:#FFFDF8"></div>';
    return h;
  }).join('<div style="height:2px"></div>');
}
function toggleFidelizacionDetalle(telefono) {
  const el = document.getElementById('fidel-detalle-' + telefono);
  if (!el) return;
  const yaAbierto = el.style.display === 'block';
  // Cerrar cualquier otro detalle abierto, para no acumular varios a la vez
  document.querySelectorAll('[id^="fidel-detalle-"]').forEach(d => d.style.display = 'none');
  if (yaAbierto) return; // si ya estaba abierto, lo dejamos cerrado (toggle)
  el.style.display = 'block';
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const canjes = cliente.historialCanjes || [];
  const telAttr = escapeAttr(telefono);
  let h = '';
  if (canjes.length) {
    h += '<div style="font-weight:700;color:#3D1F0D;margin-bottom:6px">🎁 Premios canjeados (' + canjes.length + ')</div>';
    h += canjes.map((c, i) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;color:#5a3e1b;margin-bottom:3px"><span>· ' + escapeHtml(c.fecha || '-') + (c.ticket ? ' — Ticket ' + escapeHtml(c.ticket) : '') + '</span><span onclick="anularCanjeFidelizacion(\'' + telAttr + '\',' + i + ')" style="cursor:pointer;color:#c0392b;font-size:11px;font-weight:700;white-space:nowrap">↩️ Anular</span></div>').join('');
  } else {
    h += '<div style="color:#8A6A4E;margin-bottom:8px">Sin premios canjeados todavía.</div>';
  }
  h += '<button onclick="cargarPedidosClienteFidelizacion(\'' + telAttr + '\')" style="margin-top:8px;padding:6px 14px;background:#fff;border:1.5px solid #3D1F0D;color:#3D1F0D;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">📋 Ver todos sus pedidos</button>';
  h += '<div id="fidel-pedidos-' + telefono + '" style="margin-top:8px"></div>';
  h += '<button onclick="borrarClienteFidelizacion(\'' + telAttr + '\')" style="margin-top:10px;padding:6px 14px;background:#fff;border:1.5px solid #c0392b;color:#c0392b;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑️ Eliminar del programa</button>';
  el.innerHTML = h;
}
async function anularCanjeFidelizacion(telefono, indice) {
  if (!confirm('¿Anular este canje?\n\nSe quitará del historial y se le devolverá el premio como pendiente de entregar (por si se marcó por error).')) return;
  try {
    const cliente = await window.fb_loadFidelizacionCliente(telefono);
    if (!cliente || !cliente.historialCanjes || !cliente.historialCanjes[indice]) {
      alert('No se ha encontrado ese canje (puede que la lista esté desactualizada). Pulsa Actualizar e inténtalo de nuevo.');
      return;
    }
    // Transacción: fidelizacion/<telefono> también lo escribe fidelizacion.php
    // cada vez que ese cliente gana un sello o canjea un premio de verdad —
    // un .set() plano aquí podía perder ese cambio si pasaba justo mientras
    // el admin anulaba este canje.
    const mutator = function (current) {
      const c = current || {};
      if (Array.isArray(c.historialCanjes) && c.historialCanjes[indice]) {
        c.historialCanjes.splice(indice, 1);
      }
      c.premiosPendientes = (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : 0) + 1;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert('Error al anular el canje: ' + e.message);
  }
}
async function borrarClienteFidelizacion(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const nombre = cliente.nombre || 'este cliente';
  const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  let aviso = '¿Seguro que quieres eliminar a ' + nombre + ' (' + telefono + ') del programa de fidelización?\n\nEsto borra sus sellos actuales y todo su historial de canjes. No se puede deshacer.';
  if (premiosPendientes > 0) {
    aviso += '\n\n⚠️ Atención: este cliente tiene ' + premiosPendientes + ' premio(s) pendiente(s) de entregar todavía.';
  }
  if (!confirm(aviso)) return;
  try {
    if (!window.fb_deleteFidelizacionCliente) {
      alert('Esta función necesita fb_deleteFidelizacionCliente en config.js.');
      return;
    }
    await window.fb_deleteFidelizacionCliente(telefono);
    renderFidelizacionList();
  } catch (e) {
    alert('Error al eliminar el cliente: ' + e.message);
  }
}
async function cargarPedidosClienteFidelizacion(telefono) {
  const el = document.getElementById('fidel-pedidos-' + telefono);
  if (!el) return;
  // Toggle: si ya hay contenido cargado (no vacío), lo cerramos sin recargar
  if (el.innerHTML.trim() !== '') {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = '<div style="color:#8A6A4E">Buscando pedidos… esto puede tardar unos segundos.</div>';
  try {
    if (!window.fb_loadAllTicketDates || !window.fb_loadTicketsByDate) {
      el.innerHTML = '<div style="color:#c0392b">Esta función necesita fb_loadAllTicketDates y fb_loadTicketsByDate en config.js.</div>';
      return;
    }
    const fechas = await window.fb_loadAllTicketDates();
    let pedidosCliente = [];
    for (const fecha of fechas) {
      const ticketsDelDia = await window.fb_loadTicketsByDate(fecha);
      if (!ticketsDelDia) continue;
      Object.entries(ticketsDelDia).forEach(([num, t]) => {
        const telTicket = (t.phone || '').replace(/\D/g, '');
        if (telTicket === telefono) {
          pedidosCliente.push({ numero: t.orderNum || num, fecha: fecha, hora: t.slotTime || t.time || '', total: t.total });
        }
      });
    }
    if (!pedidosCliente.length) {
      el.innerHTML = '<div style="color:#8A6A4E">No se encontraron pedidos para este teléfono.</div>';
      return;
    }
    pedidosCliente.sort((a, b) => b.fecha.localeCompare(a.fecha));
    el.innerHTML = '<div style="font-weight:700;color:#3D1F0D;margin-bottom:6px">📋 Pedidos (' + pedidosCliente.length + ')</div>' +
      pedidosCliente.map(p => '<div style="color:#5a3e1b;margin-bottom:3px">· #' + escapeHtml(String(p.numero)) + ' — ' + escapeHtml(p.fecha) + (p.hora ? ' ' + escapeHtml(p.hora) : '') + (p.total ? ' — ' + p.total + '€' : '') + '</div>').join('');
  } catch (e) {
    el.innerHTML = '<div style="color:#c0392b">Error al buscar pedidos: ' + e.message + '</div>';
  }
}
function cargarFidelizacionParaEditar(telefono) {
  if (typeof switchFidelizacionTab === 'function') switchFidelizacionTab('editar');
  window.fb_loadFidelizacionCliente(telefono).then(c => {
    document.getElementById('fidel-edit-phone').value = telefono;
    document.getElementById('fidel-edit-nombre').value = (c && c.nombre) || '';
    document.getElementById('fidel-edit-sellos').value = (c && typeof c.sellos === 'number') ? c.sellos : 0;
    document.getElementById('fidel-edit-premios-pendientes').value = (c && typeof c.premiosPendientes === 'number') ? c.premiosPendientes : ((c && c.premioDisponible) ? 1 : 0);
    document.getElementById('fidel-edit-veces-completado').value = (c && typeof c.vecesCompletado === 'number') ? c.vecesCompletado : 0;
    document.getElementById('fidel-edit-phone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
async function guardarFidelizacionManual() {
  const telInput = document.getElementById('fidel-edit-phone');
  const telefono = telInput.value.replace(/\D/g, '');
  if (telefono.length !== 9) {
    alert('Introduce un teléfono válido de 9 dígitos.');
    return;
  }
  const nombre = document.getElementById('fidel-edit-nombre').value.trim();
  let sellos = parseInt(document.getElementById('fidel-edit-sellos').value, 10);
  if (isNaN(sellos) || sellos < 0) sellos = 0;
  if (sellos >= FIDELIZACION_META_ADMIN) sellos = FIDELIZACION_META_ADMIN - 1;
  let premiosPendientes = parseInt(document.getElementById('fidel-edit-premios-pendientes').value, 10);
  if (isNaN(premiosPendientes) || premiosPendientes < 0) premiosPendientes = 0;
  let vecesCompletado = parseInt(document.getElementById('fidel-edit-veces-completado').value, 10);
  if (isNaN(vecesCompletado) || vecesCompletado < 0) vecesCompletado = 0;

  // Transacción: nombre/sellos/premiosPendientes/vecesCompletado son lo que
  // el admin ha editado a propósito en el formulario, pero historialCanjes/
  // historialSellos deben venir siempre de lo último de verdad en Firebase
  // (no de una lectura que pudo quedarse desfasada mientras el admin
  // rellenaba el formulario) — si no, un sello o canje real de ese cliente
  // llegado justo en medio se perdía sin aviso al guardar.
  const mutator = function (current) {
    const existente = current || {};
    return {
      nombre: nombre || existente.nombre || '',
      sellos,
      premiosPendientes,
      vecesCompletado,
      historialCanjes: existente.historialCanjes || [],
      historialSellos: existente.historialSellos || []
    };
  };
  if (window.fb_transactJsonString) {
    await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
  } else {
    let existente = null;
    try { existente = await window.fb_loadFidelizacionCliente(telefono); } catch (e) {}
    await window.fb_saveFidelizacionCliente(telefono, mutator(existente));
  }
  showToast('fidel-toast');
  renderFidelizacionList();
}

async function renderAccesosLog() {
  const el = document.getElementById('accesos-log-list');
  if (!el) return;
  el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Cargando...</div>';
  try {
    if (!window.fb_loadLoginLog) {
      el.innerHTML = '<div style="font-size:13px;color:#c0392b">Firebase no disponible.</div>';
      return;
    }
    const user = window.fb_getAdminUser ? window.fb_getAdminUser() : null;
    console.log('[accesos] usuario activo:', user ? user.email : 'ninguno');
    const logs = await window.fb_loadLoginLog();
    console.log('[accesos] logs recibidos:', logs ? logs.length : 'null');
    if (!logs || !logs.length) {
      el.innerHTML = '<div style="font-size:13px;color:#8A6A4E">Sin registros aún.</div>';
      return;
    }
    el.innerHTML = logs.slice(0, 100).map(function (l) {
      var esOk = l.resultado && l.resultado.indexOf('Acceso correcto') !== -1;
      var color = esOk ? '#eafaf1' : '#fdf0ee';
      var border = esOk ? '#27855a' : '#c0392b';
      var h = '<div style="background:' + color + ';border:1.5px solid ' + border + ';border-radius:10px;padding:12px;font-size:12px;margin-bottom:4px">';
      h += '<div style="font-weight:700;color:#3D1F0D;margin-bottom:4px">' + escapeHtml(l.resultado || '-') + '</div>';
      h += '<div style="color:#2A1506;margin-bottom:2px">Email: ' + escapeHtml(l.email || '-') + '</div>';
      h += '<div style="color:#8A6A4E;margin-bottom:2px">Fecha: ' + escapeHtml(l.fecha || '-') + '</div>';
      h += '<div style="color:#8A6A4E;margin-bottom:2px">IP: ' + escapeHtml(l.ip || '-') + '</div>';
      h += '<div style="color:#8A6A4E;font-size:11px;word-break:break-all">Dispositivo: ' + escapeHtml(l.dispositivo || '-') + '</div>';
      h += '</div>';
      return h;
    }).join('');
  } catch (e) {
    el.innerHTML = '<div style="font-size:13px;color:#c0392b">Error al cargar: ' + e.message + '</div>';
  }
}

// Patch recordOrderStats to include items for kitchen display + Firebase sync
// Usa transacción Firebase para evitar sobreescribir pedidos de otros dispositivos
// Guarda cuántas unidades de cada producto se vendieron hoy, para "Estrellas y perdedores".
// Se guarda en ventasProductos/{fecha} = { [productId]: cantidad }
async function recordProductSales(items) {
  if (!items || !items.length) return;
  const fecha = new Date().toISOString().slice(0, 10);
  const mutator = function (current) {
    const actual = current || {};
    items.forEach(it => {
      if (it.id == null) return;
      const id = String(it.id);
      actual[id] = (actual[id] || 0) + (it.qty || 0);
    });
    return actual;
  };
  try {
    // Transacción: igual que recordOrderStats justo debajo (que ya lo hace
    // por el mismo motivo) — dos pedidos completándose casi a la vez podían
    // pisarse el conteo de ventas por producto con un .set() plano.
    if (window.fb_transactNative) {
      await window.fb_transactNative('ventasProductos/' + fecha, mutator);
    } else {
      const ref = firebase.database().ref('ventasProductos/' + fecha);
      const sn = await ref.once('value');
      await ref.set(mutator(sn.exists() ? sn.val() : null));
    }
  } catch (e) {
    console.warn('[ventasProductos] no se pudo guardar', e);
  }
}
async function recordOrderStats(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const items = _lastTicketData ? _lastTicketData.items : [];
  const phone = _lastTicketData ? _lastTicketData.phone || '' : '';
  const notes = _lastTicketData ? _lastTicketData.notes || '' : '';
  const newOrder = {
    num: orderNum,
    name,
    phone,
    notes,
    total,
    items,
    time: new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    slot: slotTime || null,
    ts: Date.now()
  };

  // Intentar transacción atómica en Firebase para no perder pedidos de otros dispositivos
  if (typeof firebase !== 'undefined' && firebase.database) {
    try {
      await firebase.database().ref('stats/' + todayKey).transaction(function (current) {
        if (!current || current.date !== todayKey) {
          return {
            date: todayKey,
            count: 1,
            total: parseFloat(total.toFixed(2)),
            orders: [newOrder]
          };
        }
        current.count = (current.count || 0) + 1;
        current.total = parseFloat(((current.total || 0) + total).toFixed(2));
        if (!current.orders) current.orders = [];
        // Evitar duplicados si el pedido ya existe (reintento) — comparar con clave normalizada
        if (!current.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum))) {
          current.orders.unshift(newOrder);
        }
        return current;
      });
      // Leer resultado final y actualizar localStorage
      const snap = await firebase.database().ref('stats/' + todayKey).once('value');
      if (snap.exists()) localStorage.setItem(STATS_KEY, JSON.stringify(snap.val()));
      return;
    } catch (e) {
      console.warn('[DPF] Firebase transaction failed, usando fallback:', e);
    }
  }

  // Fallback sin Firebase: solo localStorage
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (stats.date !== todayKey) {
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = {
      date: todayKey,
      count: 0,
      total: 0,
      orders: []
    };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  if (!stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum))) stats.orders.unshift(newOrder);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try {
      await window.fb_saveStats(stats);
    } catch (e) {
      console.warn('Firebase stats error', e);
    }
  }
}
scheduleSlotMidnightReset();


// ── STOCK SYSTEM ──
const STOCK_PWD_KEY = 'dpf_stock_pwd';
const STOCK_DATA_KEY = 'dpf_stock_data';
const STOCK_DEFAULTS = {
  congelados: ['Kebab', 'Carne picada', 'Tronquitos de mar', 'Gambas', 'York', 'Pulled pork', 'Bacon'],
  latas_salsas: ['Tomate frito', 'Aceitunas', 'Maíz', 'Zanahoria', 'Remolacha', 'Champiñones', 'Piña', 'Alioli', 'Mayonesa', 'Salsa rosa', 'Salsa de yogur', 'Salsa barbacoa', 'Salsa brava', 'Salsa ketchup', 'Salsa roquefort', 'Salsa miel mostaza', 'Cebolla crujiente', 'Nata Vegecrem'],
  estanteria_almacen: ['Atún', 'Crema de pistacho', 'Crema Kinder', 'Crema Lotus'],
  frio: ['Philadelphia tarta', 'Philadelphia patatas', 'Mantequilla', 'Huevo cocido', 'Queso mascarpone', 'Cuatro quesos', 'Rulo de cabra'],
  estanteria_tartas: ['Galleta Lotus', 'Galleta Dino', 'Galleta María Oro', 'Filipinos blancos', 'Donuts', 'Leche Puleva'],
  patatas_verdura: ['Uds. sacos de patatas', 'Uds. sacos de cebollas', 'Bolsas boniato pelado'],
  masas: ['Masa cookies'],
  queseria: ['Queso mozzarella'],
  envases: ['Bol de pollo', 'Bol pequeño boniato', 'Redondel tartas plateadas', 'Papel de aluminio', 'Papel film', 'Cajas de bolsas', 'Caja pasta 1/2', 'Caja pasta 1/4', 'Caja pizza', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm', 'Caja cucharas', 'Rollo papel cocina / horno', 'Caja papel horno', 'Cacharrillos salsas pequeños', 'Papeles marrones', 'Caja tartas completas'],
  pan: ['Pan de leña', 'Paninis XXL'],
  referencias_ali: ['Aceitunas rodajas', 'Aceite de oliva virgen extra', 'Cuajada tomates', 'Sal', 'Azúcar', 'Pimienta', 'Orégano', 'Eneldo', 'Hierbas provenzales', 'Ajo en polvo', 'Nuez moscada', 'Pistachos', 'Piña', 'Nanas limpieza', 'Guantes talla L', 'Guantes talla M', 'Fregonas', 'Cepillos', 'Recogedor', 'Trapos', 'Lejía', 'Desengrasante', 'Friegasuelos', 'Papel higiénico', 'Estropajos', 'Ambientador', 'Limpia cristales', 'Servilletas'],
  chocolates_galletas: ['Chocolate negro', 'Chocolate blanco', 'Chocolate con leche', 'Galleta Digestive']
};
const STOCK_GROUP_LABELS = {
  congelados: '❄️ Congelados',
  latas_salsas: '🥫 Latas / Conservas / Salsas',
  estanteria_almacen: '📦 Estantería (Almacén)',
  frio: '🧊 Frío',
  estanteria_tartas: '🎂 Estantería Tartas',
  patatas_verdura: '🥔 Patatas y Verdura',
  masas: '🍪 Masas',
  queseria: '🧀 Quesería',
  envases: '📋 Envases / Packaging',
  pan: '🍞 Pan',
  referencias_ali: '🛒 Referencias ALI',
  chocolates_galletas: '🍫 Chocolates y Galletas'
};
// Migración: 'Cuajada tomates' -> 'Cuajada' + 'Tomates'
(function () {
  try {
    const raw = localStorage.getItem('dpf_stock_data');
    if (!raw) return;
    let changed = false;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(group => {
      const items = data[group];
      const idx = items.indexOf('Cuajada tomates');
      if (idx !== -1) {
        items.splice(idx, 1, 'Cuajada', 'Tomates');
        changed = true;
      }
    });
    if (changed) localStorage.setItem('dpf_stock_data', JSON.stringify(data));
  } catch (e) {}
})();
function getStockPwd() {
  return localStorage.getItem(STOCK_PWD_KEY) || '';
}
function changeStockPwd() {
  const n1 = document.getElementById('stock-pwd-new').value;
  const n2 = document.getElementById('stock-pwd-rep').value;
  const err = document.getElementById('stock-pwd-error');
  err.textContent = '';
  if (n1.length < 4) {
    err.textContent = 'La clave debe tener al menos 4 caracteres';
    return;
  }
  if (n1 !== n2) {
    err.textContent = 'Las claves no coinciden';
    return;
  }
  localStorage.setItem(STOCK_PWD_KEY, n1);
  if (window.fb_saveStockPwd) window.fb_saveStockPwd(n1).catch(() => {});
  document.getElementById('stock-pwd-new').value = '';
  document.getElementById('stock-pwd-rep').value = '';
  showToast('stock-pwd-toast');
  logActivity('\uD83D\uDCE6 Clave de stock actualizada');
}
function getStockData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STOCK_DATA_KEY) || 'null');
    if (saved) return saved;
  } catch {}
  // First time: preload defaults
  const data = JSON.parse(JSON.stringify(STOCK_DEFAULTS));
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  return data;
}
// Aplica mutatorFn (que modifica el objeto de ingredientes in-place) de
// forma atómica: actualiza localStorage al instante para que la UI
// responda, y por separado aplica la MISMA mutación contra el valor más
// reciente de Firebase con una transacción — si dos dispositivos añaden,
// borran o reordenan ingredientes casi a la vez, Firebase reintenta con
// el dato fresco en vez de que uno pise el cambio del otro.
function stockMutateData(mutatorFn) {
  const data = getStockData();
  mutatorFn(data);
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  if (window.fb_transactJsonString) {
    window._stockDataLocalWrite = Date.now();
    window.fb_transactJsonString('config/stockData', function (current) {
      const base = current || {};
      mutatorFn(base);
      return base;
    }).catch(() => {});
  } else if (window.fb_saveStockData) {
    window._stockDataLocalWrite = Date.now();
    window.fb_saveStockData(data).catch(() => {});
  }
  return data;
}

// ── ADMIN: ingredient management ──
function loadStockAdminList() {
  const data = getStockData();
  const el = document.getElementById('stock-ingredients-admin-list');
  if (!el) return;
  el.innerHTML = Object.entries(data).map(_ref25 => {
    let _ref26 = _slicedToArray(_ref25, 2),
      group = _ref26[0],
      items = _ref26[1];
    return "\n    <div style=\"margin-bottom:18px\">\n      <div style=\"font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #F5E6C8\">".concat(STOCK_GROUP_LABELS[group] || group, "</div>\n      <div id=\"stock-drag-group-").concat(group, "\" data-group=\"").concat(group, "\" style=\"display:flex;flex-direction:column\">\n        ").concat(items.map((ing, i) => "\n          <div draggable=\"true\" data-group=\"".concat(group, "\" data-index=\"").concat(i, "\"\n               style=\"display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:8px;padding:7px 12px;cursor:grab\"\n               ondragstart=\"stockDragStart(event)\" ondragover=\"stockDragOver(event)\" ondrop=\"stockDrop(event)\" ondragend=\"stockDragEnd(event)\">\n            <span style=\"color:#8A6A4E;font-size:16px;cursor:grab;user-select:none\">\u2630</span>\n            <span style=\"font-size:14px;color:#2A1506;flex:1\">").concat(escapeHtml(ing), "</span>\n            <button onclick=\"removeStockItem('").concat(group, "',").concat(i, ")\" style=\"background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer;font-weight:700\">&#128465;</button>\n          </div>")).join(''), "\n      </div>\n    </div>");
  }).join('');
  _initStockDrag();
}
let _stockDragSrc = null;
function stockDragStart(e) {
  _stockDragSrc = e.currentTarget;
  e.currentTarget.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function stockDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.background = 'var(--amber-light, #fef3e2)';
}
function stockDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('#stock-ingredients-admin-list [draggable]').forEach(el => {
    el.style.background = '#FFFFFF';
  });
}
function stockDrop(e) {
  e.preventDefault();
  if (!_stockDragSrc || _stockDragSrc === e.currentTarget) return;
  const srcGroup = _stockDragSrc.dataset.group;
  const dstGroup = e.currentTarget.dataset.group;
  if (srcGroup !== dstGroup) return; // solo dentro del mismo grupo
  const srcIdx = parseInt(_stockDragSrc.dataset.index);
  const dstIdx = parseInt(e.currentTarget.dataset.index);
  stockMutateData(function (data) {
    const arr = data[srcGroup];
    if (!arr || !arr[srcIdx]) return;
    const moved = arr.splice(srcIdx, 1)[0];
    arr.splice(dstIdx, 0, moved);
  });
  loadStockAdminList();
  showToast('stock-config-toast');
}
function _initStockDrag() {
  // Touch drag for mobile using touchstart/touchmove/touchend
  document.querySelectorAll('#stock-ingredients-admin-list [draggable]').forEach(el => {
    el.addEventListener('touchstart', _stockTouchStart, {
      passive: true
    });
    el.addEventListener('touchmove', _stockTouchMove, {
      passive: false
    });
    el.addEventListener('touchend', _stockTouchEnd, {
      passive: true
    });
  });
}
let _stockTouchItem = null,
  _stockTouchStartY = 0;
function _stockTouchStart(e) {
  _stockTouchItem = e.currentTarget;
  _stockTouchStartY = e.touches[0].clientY;
  _stockTouchItem.style.opacity = '0.5';
}
function _stockTouchMove(e) {
  e.preventDefault();
}
function _stockTouchEnd(e) {
  if (!_stockTouchItem) return;
  _stockTouchItem.style.opacity = '1';
  const endY = e.changedTouches[0].clientY;
  const group = _stockTouchItem.dataset.group;
  const srcIdx = parseInt(_stockTouchItem.dataset.index);
  const container = document.getElementById('stock-drag-group-' + group);
  if (!container) {
    _stockTouchItem = null;
    return;
  }
  const items = Array.from(container.querySelectorAll('[draggable]'));
  let targetIdx = srcIdx;
  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (endY > rect.top && endY < rect.bottom) targetIdx = i;
  });
  if (targetIdx !== srcIdx) {
    stockMutateData(function (data) {
      const arr = data[group];
      if (!arr || !arr[srcIdx]) return;
      const moved = arr.splice(srcIdx, 1)[0];
      arr.splice(targetIdx, 0, moved);
    });
    loadStockAdminList();
    showToast('stock-config-toast');
  }
  _stockTouchItem = null;
}
function addStockIngredient() {
  const input = document.getElementById('new-ingredient-input');
  const groupSel = document.getElementById('new-ingredient-group');
  const name = input.value.trim();
  const group = groupSel ? groupSel.value : 'ingredientes';
  if (!name) return;
  const data = getStockData();
  if (data[group] && data[group].includes(name)) {
    alert('Ya existe en ese grupo');
    return;
  }
  stockMutateData(function (d) {
    if (!d[group]) d[group] = [];
    if (!d[group].includes(name)) d[group].push(name);
  });
  input.value = '';
  loadStockAdminList();
  showToast('stock-config-toast');
}
function removeStockItem(group, i) {
  const data = getStockData();
  const ing = data[group] && data[group][i];
  if (!ing) return;
  stockMutateData(function (d) {
    if (!d[group]) return;
    const idx = d[group].indexOf(ing);
    if (idx !== -1) d[group].splice(idx, 1);
  });
  loadStockAdminList();
}

// ── EMPLOYEE OVERLAY ──
let _stockEditMode = false;
function toggleStockEditMode() {
  _stockEditMode = !_stockEditMode;
  const btn = document.getElementById('stock-edit-btn');
  const addPanel = document.getElementById('stock-edit-add');
  if (btn) btn.textContent = _stockEditMode ? '✅ Listo' : '✏️ Editar';
  if (btn) btn.style.background = _stockEditMode ? '#3D1F0D' : '#FFFFFF';
  if (btn) btn.style.color = _stockEditMode ? '#fff' : '#3D1F0D';
  if (addPanel) addPanel.style.display = _stockEditMode ? 'block' : 'none';
  renderStockItems();
}
function stockOverlayAddItem() {
  const group = document.getElementById('stock-edit-group').value;
  const name = document.getElementById('stock-edit-name').value.trim();
  if (!name) return;
  const data = getStockData();
  if (data[group] && data[group].includes(name)) {
    alert('Ya existe en esa categoría');
    return;
  }
  stockMutateData(function (d) {
    if (!d[group]) d[group] = [];
    if (!d[group].includes(name)) d[group].push(name);
  });
  document.getElementById('stock-edit-name').value = '';
  renderStockItems();
}
function stockOverlayRemoveItem(group, ing) {
  if (!confirm('¿Eliminar "' + ing + '"?')) return;
  stockMutateData(function (d) {
    if (!d[group]) return;
    d[group] = d[group].filter(i => i !== ing);
  });
  renderStockItems();
}
let _stockOverlayDragSrc = null;
function stockOverlayDragStart(e) {
  _stockOverlayDragSrc = e.currentTarget;
  e.currentTarget.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function stockOverlayDragOver(e) {
  e.preventDefault();
  e.currentTarget.style.background = 'var(--amber-light, #fef3e2)';
}
function stockOverlayDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('#stock-items-list [draggable]').forEach(el => {
    el.style.background = '';
  });
}
function stockOverlayDrop(e) {
  e.preventDefault();
  if (!_stockOverlayDragSrc || _stockOverlayDragSrc === e.currentTarget) return;
  const srcGroup = _stockOverlayDragSrc.dataset.group;
  const dstGroup = e.currentTarget.dataset.group;
  if (srcGroup !== dstGroup) return;
  const srcIng = _stockOverlayDragSrc.dataset.ing;
  const dstIng = e.currentTarget.dataset.ing;
  stockMutateData(function (data) {
    const arr = data[srcGroup];
    if (!arr) return;
    const srcIdx = arr.indexOf(srcIng);
    const dstIdx = arr.indexOf(dstIng);
    if (srcIdx === -1 || dstIdx === -1) return;
    arr.splice(srcIdx, 1);
    arr.splice(dstIdx, 0, srcIng);
  });
  renderStockItems();
}
function openStockFromAdmin() {
  document.body.style.overflow = '';
  window._stockFromAdmin = true;
  window._adminWasLoggedIn = _adminLoggedIn;
  document.getElementById('admin-overlay').classList.add('hidden-for-stock');
  openStockOverlay();
}
function openStockInline() {
  // Guardar sección activa para restaurarla al cerrar
  const activeSection = document.querySelector('.admin-section.active');
  window._stockPrevSection = activeSection ? activeSection.id.replace('admin-', '') : 'productos';
  window._stockFromAdmin = true;
  window._adminWasLoggedIn = _adminLoggedIn;
  openStockOverlay();
}
function openStockConfigSecret() {
  // Open stock config (bimba secret)
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('admin-stock-config').classList.add('active');
  if (!document.getElementById('admin-overlay').classList.contains('open')) {
    document.getElementById('admin-overlay').classList.add('open');
  }
  loadStockAdminList();
  renderStockHistorial();
  setTimeout(function(){ if(typeof dcCargar==='function') dcCargar(); }, 300);
}
function openStockOverlay() {
  _stockSelections = {};
  _stockUnits = {};
  _stockChecks = {};
  _stockNotas = {};
  _stockLimpieza = {};
  document.body.style.overflow = 'hidden';
  var _so = document.getElementById('stock-overlay');
  _so.style.display = 'block';
  _so.style.position = 'fixed';
  _so.style.top = '0';
  _so.style.right = '0';
  _so.style.bottom = '0';
  _so.style.left = '0';
  _so.style.zIndex = '9999';
  _so.style.background = '#FFF8EE';
  _so.style.overflowY = 'scroll';
  _so.style.webkitOverflowScrolling = 'touch';
  _so.style.pointerEvents = 'auto';
  _so.style.visibility = 'visible';
  _so.style.opacity = '1';
  _so.style.webkitTransform = 'translateZ(0)';
  document.getElementById('stock-result-modal').style.display = 'none';

  // 🔥 Cargar historial de Firebase primero (para que el otro dispositivo vea el último stock)
  // luego activar listener de cambios en tiempo real
  requestAnimationFrame(() => {
    let _stockFirstLoad = false;
    if (window.fb_listenStockHistorial) {
      if (window._stockUnsubscribe) {
        try {
          window._stockUnsubscribe();
        } catch (e) {}
      }
      window._stockUnsubscribe = window.fb_listenStockHistorial(data => {
        // fb_listenStockHistorial ya guarda en localStorage antes de llamar aquí
        if (!_stockFirstLoad) {
          _stockFirstLoad = true;
          renderStockItems();
        } else if (document.getElementById('stock-overlay').style.display !== 'none') {
          if (window._stockLocalWrite && Date.now() - window._stockLocalWrite < 2000) return;
          renderStockItems();
        }
      });
    } else {
      renderStockItems();
    }
  });
}
function closeStockOverlay() {
  document.getElementById('stock-overlay').style.display = 'none';
  document.body.style.overflow = '';
  // Desactivar listener en tiempo real al cerrar
  if (window._stockUnsubscribe) {
    try {
      window._stockUnsubscribe();
    } catch (e) {}
    window._stockUnsubscribe = null;
  }
  if (window._stockFromAdmin) {
    window._stockFromAdmin = false;
    _adminLoggedIn = window._adminWasLoggedIn || true;
    // Simplemente reabrir el panel admin desde cero
    openAdmin();
  }
}

// Productos que usan check ✅/❌ (boles, papel térmico, etc.)
const STOCK_TEXTO_LIBRE = new Set(['Bol de pollo', 'Redondel tartas plateadas', 'Cajas de bolsas', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm', 'Rollo papel cocina / horno']);

// Productos tipo "bote" (cremas)
const STOCK_BOTE = new Set(['Crema de pistacho', 'Crema Kinder']);

// Productos con unidad fija
const STOCK_FIXED_UNIT = {
  'Guantes talla L': 'caja',
  'Guantes talla M': 'caja',
  'Cebolla crujiente': 'bolsa',
  'Orégano': 'bote',
  'Eneldo': 'bote',
  'Pimienta': 'bote',
  'Nuez moscada': 'bote',
  'Hierbas provenzales': 'bote'
};

// Productos que admiten ½
const STOCK_ADMITE_MEDIO = new Set(['Rulo de cabra', 'Uds. sacos de cebollas', 'Cebolla crujiente', 'Caja pizza', 'Caja cucharas', 'Aceite de oliva virgen extra', 'Papel térmico 57×35 mm', 'Papel térmico 80 mm']);

// Productos con ½ solo en cajas
const STOCK_ADMITE_MEDIO_CAJAS = new Set(['Galleta Lotus', 'Filipinos blancos']);

// Productos de limpieza: ✅ hay / ❌ no hay
const STOCK_LIMPIEZA = new Set(['Nanas limpieza', 'Fregonas', 'Cepillos', 'Recogedor', 'Trapos', 'Lejía', 'Desengrasante', 'Friegasuelos', 'Papel higiénico', 'Estropajos', 'Ambientador', 'Limpia cristales', 'Servilletas', 'Chocolate negro', 'Chocolate blanco', 'Chocolate con leche']);

// Labels visuales con nota foto
const STOCK_DISPLAY_LABEL = {
  'Bol de pollo': 'Bol de pollo <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Redondel tartas plateadas': 'Redondel tartas plateadas <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Cajas de bolsas': 'Cajas de bolsas <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Papel térmico 57×35 mm': 'Papel térmico 57×35 mm <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Papel térmico 80 mm': 'Papel térmico 80 mm <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>',
  'Rollo papel cocina / horno': 'Rollo papel cocina / horno <span style="font-size:11px;color:#8A6A4E;font-weight:400">(hacer foto estantería almacén)</span>'
};

// Papel térmico admite ½ paquete en check
const STOCK_CHECK_MEDIO = new Set(['Papel térmico 57×35 mm', 'Papel térmico 80 mm']);
function renderStockItems() {
  const data = getStockData();
  const container = document.getElementById('stock-items-list');
  // Build flat index for callbacks
  window._stockItemIndex = {};
  let idx = 0;
  Object.entries(data).forEach(_ref27 => {
    let _ref28 = _slicedToArray(_ref27, 2),
      group = _ref28[0],
      items = _ref28[1];
    return items.forEach(ing => {
      window._stockItemIndex[idx++] = ing;
    });
  });
  container.innerHTML = Object.entries(data).map(_ref29 => {
    let _ref30 = _slicedToArray(_ref29, 2),
      group = _ref30[0],
      items = _ref30[1];
    if (!items.length) return '';
    const isExtras = group === 'extras';
    return '<div style="margin-bottom:4px">' + '<div style="font-family:\'Anton\',sans-serif;font-size:18px;color:#3D1F0D;margin:14px 0 8px;padding-bottom:6px;border-bottom:2px solid rgba(244,196,48,0.4);display:flex;align-items:center;gap:8px;letter-spacing:0.03em">' + (STOCK_GROUP_LABELS[group] || group) + '</div>' + items.map(ing => {
      if (_stockEditMode) {
        return '<div draggable="true" data-group="' + group + '" data-ing="' + ing.replace(/"/g, '&quot;') + '"' + ' style="display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:6px;cursor:grab"' + ' ondragstart="stockOverlayDragStart(event)" ondragover="stockOverlayDragOver(event)" ondrop="stockOverlayDrop(event)" ondragend="stockOverlayDragEnd(event)">' + '<span style="color:#8A6A4E;font-size:18px;user-select:none">☰</span>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<button onclick="stockOverlayRemoveItem(\'' + group + '\',\'' + ing.replace(/'/g, "\\'") + '\')" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer">✕</button>' + '</div>';
      }
      const i = Object.values(window._stockItemIndex).indexOf(ing);
      if (isExtras) {
        const eid = 'extra_' + ing.replace(/[^a-z0-9]/gi, '_');
        return '<div style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:8px">' + '<div style="font-size:14px;font-weight:600;color:#3D1F0D;margin-bottom:6px">' + escapeHtml(ing) + '</div>' + '<textarea id="' + eid + '" placeholder="Escribe aqu\u00ED..." rows="2" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 10px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;resize:none;box-sizing:border-box"></textarea>' + '</div>';
      }
      // ── LIMPIEZA (✅ Hay / ❌ No hay) ──
      if (STOCK_LIMPIEZA.has(ing)) {
        const safeIngL = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const state = window._stockLimpieza && window._stockLimpieza[ing] || 0;
        const bgL = state === 1 ? '#eafaf1' : state === -1 ? '#fdf0ee' : '#FFFFFF';
        const borderL = state === 1 ? '#a9dfbf' : state === -1 ? '#e74c3c' : '#F5E6C8';
        const btnBaseL = 'width:42px;height:42px;border-radius:50%;font-size:18px;cursor:pointer;border:2px solid ';
        const btnHay = state === 1 ? btnBaseL + '#27855a;background:#eafaf1' : btnBaseL + '#F5E6C8;background:#FFFFFF';
        const btnNo = state === -1 ? btnBaseL + '#c0392b;background:#fdf0ee' : btnBaseL + '#F5E6C8;background:#FFFFFF';
        return '<div style="background:' + bgL + ';border:2px solid ' + borderL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;flex-shrink:0">' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',1)" style="' + btnHay + '">✅</button>' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',-1)" style="' + btnNo + '">❌</button>' + '</div></div></div>';
      }

      // ── CHECK + NOTA OPCIONAL (boles, papel térmico, etc.) ──
      if (STOCK_TEXTO_LIBRE.has(ing)) {
        const safeIngTL = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const checked = !!(window._stockChecks && window._stockChecks[ing]);
        const nota = window._stockNotas && window._stockNotas[ing] || '';
        const notaId = 'stk-nota-' + ing.replace(/[^a-z0-9]/gi, '_');
        const bgTL = checked ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
        const borderTL = checked ? '#3D1F0D' : '#F5E6C8';
        const btnBorderTL = checked ? '#3D1F0D' : '#F5E6C8';
        const btnBgTL = checked ? '#3D1F0D' : '#FFFFFF';
        return '<div style="background:' + bgTL + ';border:2px solid ' + borderTL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<button onclick="stockCheckToggle(\'' + safeIngTL + '\')" style="width:36px;height:36px;flex-shrink:0;border-radius:50%;border:2px solid ' + btnBorderTL + ';background:' + btnBgTL + ';font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">' + (checked ? '\u2705' : '') + '</button>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(STOCK_DISPLAY_LABEL[ing] || ing) + '</span>' + '</div>' + (checked ? '<div style="margin-top:10px;display:flex;flex-direction:column">' + (STOCK_CHECK_MEDIO.has(ing) ? '<button onclick="stockNotaSetMedio(\'' + safeIngTL + '\')" style="align-self:flex-start;padding:5px 12px;border-radius:7px;border:1.5px solid #3D1F0D;background:' + (nota === '\u00bd paquete' ? 'rgba(244,196,48,0.08)' : '#FFFFFF') + ';color:' + (nota === '\u00bd paquete' ? '#3D1F0D' : '#8A6A4E') + ';font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">\u00bd paquete</button>' : '') + '<input type="text" id="' + notaId + '" value="' + nota.replace(/"/g, '&quot;') + '" placeholder="Nota opcional\u2026" oninput="stockNotaChange(\'' + safeIngTL + '\',this.value)" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 12px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;box-sizing:border-box">' + '</div>' : '') + '</div>';
      }

      // ── BOTE (cremas) ──
      if (STOCK_BOTE.has(ing)) {
        const boteVal = _stockSelections[ing] || 0;
        const safeIngB = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const bgB = boteVal > 0 ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
        const borderB = boteVal > 0 ? '#3D1F0D' : '#F5E6C8';
        const boteStr = boteVal > 0 ? boteVal % 1 === 0.5 ? Math.floor(boteVal) > 0 ? Math.floor(boteVal) + '\u00bd' : '\u00bd' : boteVal : '\u2013';
        return '<div style="background:' + bgB + ';border:2px solid ' + borderB + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockSetBote(\'' + safeIngB + '\',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + '<button onclick="stockBoteMedio(\'' + safeIngB + '\')" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:13px;font-weight:900;cursor:pointer;color:#3D1F0D">\u00bd</button>' + '<span style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center">' + boteStr + '</span>' + '<button onclick="stockSetBote(\'' + safeIngB + '\',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="margin-top:8px"><span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">Bote</span></div>' + '</div>';
      }

      // ── CONTABLE ──
      const qty = _stockSelections[ing] !== undefined ? _stockSelections[ing] : null;
      const fixedUnit = STOCK_FIXED_UNIT[ing] || null;
      const unit = fixedUnit || _stockUnits && _stockUnits[ing] || 'unidades';
      const sel = qty !== null && qty > 0;
      const bg = sel ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
      const border = sel ? '#3D1F0D' : '#F5E6C8';
      const safeIng = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const unitBtnBase = 'padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;border:1.5px solid ';
      const unitCajas = unit === 'cajas' ? unitBtnBase + 'rgba(61,31,13,0.2);background:rgba(61,31,13,0.08);color:#3D1F0D' : unitBtnBase + 'rgba(61,31,13,0.15);background:#FFFFFF;color:#3D1F0D';
      const unitUds = unit === 'unidades' ? unitBtnBase + 'rgba(61,31,13,0.2);background:rgba(61,31,13,0.08);color:#3D1F0D' : unitBtnBase + 'rgba(61,31,13,0.15);background:#FFFFFF;color:#3D1F0D';
      const qtyId = 'stk-qty-' + i;
      const showMedio = STOCK_ADMITE_MEDIO.has(ing) || STOCK_ADMITE_MEDIO_CAJAS.has(ing) && unit === 'cajas';
      const medioBtn = showMedio ? '<button onclick="stockQtyMedio(\'' + safeIng + '\')" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:13px;font-weight:900;cursor:pointer;color:#3D1F0D">\u00bd</button>' : '';
      return '<div style="background:' + bg + ';border:2px solid ' + border + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span onclick="stockToggle(' + i + ')" style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1;cursor:pointer">' + escapeHtml(ing) + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockQty(' + i + ',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + medioBtn + '<span id="' + qtyId + '" onclick="stockActivateInput(' + i + ')" title="Pulsa para escribir" style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center;cursor:text;border-radius:6px;padding:2px 4px' + (qty > 0 ? ';background:rgba(0,0,0,0.05)' : '') + '">' + (qty !== null ? qty : '\u2013') + '</span>' + '<button onclick="stockQty(' + i + ',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="display:flex;margin-top:8px;align-items:center">' + (fixedUnit ? '<span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">' + fixedUnit.charAt(0).toUpperCase() + fixedUnit.slice(1) + '</span>' : '<button onclick="stockSetUnit(\'' + safeIng + '\',\'cajas\')" style="' + unitCajas + '">📦 Cajas</button>' + '<button onclick="stockSetUnit(\'' + safeIng + '\',\'unidades\')" style="' + unitUds + '">🔢 Unidades</button>') + '</div></div>';
    }).join('') + '</div>';
  }).join('');
}
function stockToggle(i) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  _stockSelections[ing] = _stockSelections[ing] ? 0 : 1;
  if (!_stockSelections[ing]) delete _stockSelections[ing];
  renderStockItems();
}
function stockQty(i, delta) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  const current = _stockSelections[ing];
  if (current === undefined) {
    if (delta > 0) { _stockSelections[ing] = 0; }
    renderStockItems();
    return;
  }
  const next = current + delta;
  if (next < 0) { delete _stockSelections[ing]; } else { _stockSelections[ing] = next; }
  renderStockItems();
}
function toggleStockItem(ing) {
  _stockSelections[ing] = _stockSelections[ing] ? 0 : 1;
  if (!_stockSelections[ing]) delete _stockSelections[ing];
  renderStockItems();
}
function changeStockQty(ing, delta) {
  const next = Math.max(0, (_stockSelections[ing] || 0) + delta);
  if (next === 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Unidad por ingrediente ──
function stockSetUnit(ing, unit) {
  if (!window._stockUnits) window._stockUnits = {};
  _stockUnits[ing] = unit;
  renderStockItems();
}

// ── Input numérico inline ──
function stockActivateInput(i) {
  const ing = window._stockItemIndex[i];
  if (!ing) return;
  const qtyId = 'stk-qty-' + i;
  const span = document.getElementById(qtyId);
  if (!span) return;
  const currentQty = _stockSelections[ing] || 0;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = currentQty || '';
  input.placeholder = '0';
  input.style.cssText = 'width:52px;height:32px;font-size:18px;font-weight:900;text-align:center;border:2px solid #3D1F0D;border-radius:8px;outline:none;color:#3D1F0D;font-family:\'DM Sans\',sans-serif;-moz-appearance:textfield';
  span.replaceWith(input);
  input.focus();
  input.select();
  function applyInput() {
    const v = parseInt(input.value, 10);
    if (!isNaN(v) && v > 0) _stockSelections[ing] = v;else delete _stockSelections[ing];
    renderStockItems();
  }
  input.addEventListener('blur', applyInput);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') renderStockItems();
  });
}

// ── Botón ½ para contables ──
function stockQtyMedio(ing) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = cur % 1 === 0.5 ? Math.floor(cur) : cur + 0.5;
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Bote: +1 / -1 / ½ ──
function stockSetBote(ing, delta) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = Math.max(0, cur + delta);
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}
function stockBoteMedio(ing) {
  if (!window._stockSelections) window._stockSelections = {};
  const cur = _stockSelections[ing] || 0;
  const next = cur % 1 === 0.5 ? Math.floor(cur) : cur + 0.5;
  if (next <= 0) delete _stockSelections[ing];else _stockSelections[ing] = next;
  renderStockItems();
}

// ── Check toggle (boles, papel térmico) ──
function stockCheckToggle(ing) {
  if (!window._stockChecks) window._stockChecks = {};
  _stockChecks[ing] = !_stockChecks[ing];
  if (!_stockChecks[ing]) {
    delete _stockChecks[ing];
    if (window._stockNotas) delete _stockNotas[ing];
  }
  renderStockItems();
}
function stockNotaChange(ing, val) {
  if (!window._stockNotas) window._stockNotas = {};
  if (val.trim()) _stockNotas[ing] = val;else delete _stockNotas[ing];
}
function stockNotaSetMedio(ing) {
  if (!window._stockNotas) window._stockNotas = {};
  if (_stockNotas[ing] === '½ paquete') delete _stockNotas[ing];else _stockNotas[ing] = '½ paquete';
  renderStockItems();
}

// ── Limpieza: ✅ hay / ❌ no hay ──
function stockLimpiezaSet(ing, state) {
  if (!window._stockLimpieza) window._stockLimpieza = {};
  if (_stockLimpieza[ing] === state) delete _stockLimpieza[ing];else _stockLimpieza[ing] = state;
  renderStockItems();
}
const STOCK_HISTORIAL_KEY = 'dpf_stock_historial';
function getStockHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STOCK_HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveToStockHistorial(ts, lines) {
  const entrada = { ts, lines };
  // Local al instante...
  const histLocal = getStockHistorial();
  histLocal.push(entrada);
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(histLocal));

  // ...y de forma atómica contra Firebase — reintenta si aún no está listo,
  // y usa una transacción para no perder la reposición de otro dispositivo
  // guardada casi al mismo tiempo.
  function subirAFirebase(intentos) {
    if (window.fb_transactNative) {
      window._stockLocalWrite = Date.now();
      window.fb_transactNative('stock/historial', function (current) {
        const hist = Array.isArray(current) ? current.slice() : [];
        hist.push(entrada);
        return hist;
      }).catch(e => console.warn('Firebase stock historial error:', e));
    } else if (window.fb_saveStockHistorial) {
      window._stockLocalWrite = Date.now();
      window.fb_saveStockHistorial(histLocal).catch(e => console.warn('Firebase stock historial error:', e));
    } else if (intentos > 0) {
      setTimeout(() => subirAFirebase(intentos - 1), 500);
    } else {
      console.warn('fb_saveStockHistorial no disponible tras varios intentos');
    }
  }
  subirAFirebase(10); // hasta 5 segundos de espera
}
function deleteStockHistorialEntry(i) {
  const hist = getStockHistorial();
  hist.splice(i, 1);
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(hist));
  renderStockHistorial();
}
function clearOldStockLists() {
  const hist = getStockHistorial();
  if (hist.length <= 1) {
    alert('Solo hay una lista, no hay antiguas que borrar');
    return;
  }
  if (!confirm('¿Borrar todas las listas excepto la más reciente?')) return;
  const last = hist[hist.length - 1];
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify([last]));
  renderStockHistorial();
}
function renderStockHistorial() {
  const el = document.getElementById('stock-historial-list');
  if (!el) return;
  const hist = getStockHistorial();
  if (!hist.length) {
    el.innerHTML = '<p style="font-size:13px;color:#8A6A4E">Sin listas guardadas aún.</p>';
    return;
  }
  // Most recent at top, shown separately; rest in "carpeta" collapsed
  const sorted = [...hist]; // oldest first, newest last
  const latest = sorted[sorted.length - 1];
  const older = sorted.slice(0, sorted.length - 1);
  let html = '';

  // Latest entry (always visible)
  // Cada línea es texto libre que cualquier empleado puede escribir al
  // añadir un ingrediente/nota — sin escapar aquí se ejecutaba en cuanto un
  // admin abriera este historial (renderStockItems, la lista en vivo, ya
  // escapaba esto; aquí se había quedado fuera).
  html += '<div style="background:rgba(244,196,48,0.08);border:2px solid #3D1F0D;border-radius:12px;padding:14px;margin-bottom:12px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' + '<span style="font-size:13px;font-weight:700;color:#3D1F0D">&#x1F4CC; Última lista — ' + escapeHtml(latest.ts) + '</span>' + '<button onclick="deleteStockHistorialEntry(' + (hist.length - 1) + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + latest.lines.map(l => '<div style="font-size:13px;color:#2A1506">&#x2022; ' + escapeHtml(l) + '</div>').join('') + '</div>';

  // Older entries in a collapsible folder
  if (older.length) {
    html += '<details style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:12px;margin-bottom:8px">' + '<summary style="font-size:13px;font-weight:700;color:#3D1F0D;cursor:pointer">&#x1F4C2; Listas anteriores (' + older.length + ')</summary>' + '<div style="margin-top:12px;display:flex;flex-direction:column">' + older.map((entry, i) => '<div style="background:#FFF8EE;border:1px solid #F5E6C8;border-radius:8px;padding:10px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' + '<span style="font-size:12px;font-weight:600;color:#8A6A4E">' + escapeHtml(entry.ts) + '</span>' + '<button onclick="deleteStockHistorialEntry(' + i + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:2px 7px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + entry.lines.map(l => '<div style="font-size:12px;color:#2A1506">&#x2022; ' + escapeHtml(l) + '</div>').join('') + '</div>').join('') + '</div></details>';
  }
  el.innerHTML = html;
}
function exportStockPDF() {
  const lines = window._lastStockLines || [];
  const ts = window._lastStockTs || '';
  if (!lines.length) return;
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n  <style>\n    body { font-family: Arial, sans-serif; padding: 30px; color: #2A1506; }\n    h2 { color: #3D1F0D; margin-bottom: 4px; }\n    p.ts { font-size: 12px; color: #8A6A4E; margin-bottom: 20px; }\n    ul { list-style: none; padding: 0; }\n    li { padding: 6px 0; border-bottom: 1px solid #F5E6C8; font-size: 14px; }\n    li:before { content: \"\u2022 \"; color: #3D1F0D; font-weight: bold; }\n  </style></head><body>\n  <h2>\uD83D\uDCE6 Lista de reposici\xF3n</h2>\n  <p class=\"ts\">".concat(escapeHtml(ts), "</p>\n  <ul>").concat(lines.map(l => '<li>' + escapeHtml(l) + '</li>').join(''), "</ul>\n  </body></html>");
  const blob = new Blob([html], {
    type: 'text/html'
  });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    setTimeout(() => {
      w.print();
    }, 600);
  }
}
function closeStockResultModal() {
  document.getElementById('stock-result-modal').style.display = 'none';
  _stockSelections = {};
  _stockUnits = {};
  _stockChecks = {};
  _stockNotas = {};
  _stockLimpieza = {};
  renderStockItems();
}
function ultimoStockDebug() {
  const dbg = document.getElementById('ultimo-stock-debug');
  dbg.style.display = 'block';
  dbg.innerHTML = 'Comprobando...';

  // Info local — inmediata
  const local = localStorage.getItem('dpf_stock_historial');
  let localInfo = 'LOCAL: ' + (local ? 'SI (' + local.length + ' chars)' : 'VACIO');
  try {
    const parsed = JSON.parse(local || '[]');
    const arr = Array.isArray(parsed) ? parsed : Object.values(parsed);
    localInfo += ' | ' + arr.length + ' entradas';
    if (arr.length) localInfo += ' | ultima ts: ' + (arr[arr.length - 1].ts || '?');
  } catch (e) {
    localInfo += ' | ERROR parse';
  }
  dbg.innerHTML = localInfo + '<br>FIREBASE: comprobando...';

  // Info Firebase — con reintentos si aún no está listo
  function checkFb(intentos) {
    const fbReady = window._firebaseReady ? 'SI' : 'NO';
    const fbLoad = window.fb_loadStockHistorial ? 'SI' : 'NO';
    const fbSave = window.fb_saveStockHistorial ? 'SI' : 'NO';
    dbg.innerHTML = localInfo + '<br>Firebase listo: ' + fbReady + ' | fb_load: ' + fbLoad + ' | fb_save: ' + fbSave + (intentos < 25 ? ' | intentos: ' + (25 - intentos) : '');
    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial().then(fbRaw => {
        let fbInfo = 'FIREBASE: ';
        if (!fbRaw) {
          fbInfo += 'VACIO/NULL';
        } else {
          const arr = Array.isArray(fbRaw) ? fbRaw : Object.values(fbRaw);
          fbInfo += 'SI | ' + arr.length + ' entradas';
          if (arr.length) fbInfo += ' | ultima ts: ' + (arr[arr.length - 1].ts || '?');
        }
        dbg.innerHTML = [localInfo, fbInfo, 'fb_save: ' + (window.fb_saveStockHistorial ? 'DISPONIBLE' : 'NO DISPONIBLE')].join('<br>');
      }).catch(e => {
        dbg.innerHTML = localInfo + '<br>FIREBASE ERROR: ' + e.message;
      });
    } else if (intentos > 0) {
      setTimeout(() => checkFb(intentos - 1), 400);
    } else {
      dbg.innerHTML = localInfo + '<br>FIREBASE: NO DISPONIBLE tras 10s' + '<br>_firebaseReady: ' + fbReady + '<br>Módulo cargado: ' + (window._firebaseModuleLoaded ? 'SI' : 'NO') + (window._firebaseError ? '<br>Error: ' + window._firebaseError : '');
    }
  }
  checkFb(25); // hasta 10 segundos
}
function mostrarUltimoStock() {
  const modal = document.getElementById('ultimo-stock-modal');
  const linesEl = document.getElementById('ultimo-stock-lines');
  const tsEl = document.getElementById('ultimo-stock-ts');
  modal.style.display = 'block';
  linesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#8A6A4E;font-size:13px">&#x1F504; Cargando \u00FAltimo stock\u2026</div>';
  tsEl.textContent = '';
  function normalizeHist(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'object') return Object.values(raw).filter(Boolean);
    return [];
  }
  function renderUltimo(raw) {
    const arr = normalizeHist(raw);
    if (!arr.length) {
      linesEl.innerHTML = '<p style="color:#8A6A4E;font-size:13px">A\u00FAn no hay ning\u00FAn stock guardado.</p>';
      tsEl.textContent = '';
      return;
    }
    const last = arr[arr.length - 1];
    tsEl.textContent = '\uD83D\uDCC5 ' + (last.ts || '');
    const lines = normalizeHist(last.lines);
    linesEl.innerHTML = lines.map(l => '<div style="padding:2px 0">\u2022 ' + escapeHtml(l) + '</div>').join('') || '<p style="color:#8A6A4E;font-size:13px">Lista vac\u00EDa.</p>';
  }
  function tryLoad(intentos) {
    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial().then(fbRaw => {
        const fbHist = normalizeHist(fbRaw);
        if (fbHist.length) {
          localStorage.setItem('dpf_stock_historial', JSON.stringify(fbHist));
          renderUltimo(fbHist);
        } else {
          renderUltimo(getStockHistorial());
        }
      }).catch(() => renderUltimo(getStockHistorial()));
    } else if (intentos > 0) {
      // Firebase aún no listo — reintenta cada 400ms hasta 10 veces (4 segundos)
      setTimeout(() => tryLoad(intentos - 1), 400);
    } else {
      renderUltimo(getStockHistorial());
    }
  }
  tryLoad(10);
}
function saveStockList() {
  const data = getStockData();
  const lines = [];
  // Normal groups: +/- quantities
  Object.entries(_stockSelections).filter(_ref31 => {
    let _ref32 = _slicedToArray(_ref31, 2),
      v = _ref32[1];
    return v > 0;
  }).forEach(_ref33 => {
    let _ref34 = _slicedToArray(_ref33, 2),
      name = _ref34[0],
      qty = _ref34[1];
    if (STOCK_BOTE.has(name)) {
      const boteStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      lines.push(name + ': ' + boteStr + ' ' + (qty <= 1 ? 'bote' : 'botes'));
    } else {
      const fixedU = STOCK_FIXED_UNIT[name] || null;
      const unit = fixedU || _stockUnits && _stockUnits[name] || 'unidades';
      const qtyStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      const unitLabel = fixedU ? qty <= 1 ? fixedU : fixedU + 's' : unit === 'cajas' ? qty <= 1 ? 'caja' : 'cajas' : qty <= 1 ? 'ud' : 'uds';
      lines.push(name + ': ' + qtyStr + ' ' + unitLabel);
    }
  });
  // Checks (boles, papel térmico)
  Object.entries(window._stockChecks || {}).filter(_ref35 => {
    let _ref36 = _slicedToArray(_ref35, 2),
      v = _ref36[1];
    return v;
  }).forEach(_ref37 => {
    let _ref38 = _slicedToArray(_ref37, 1),
      ing = _ref38[0];
    const nota = window._stockNotas && window._stockNotas[ing] ? ' — ' + window._stockNotas[ing] : '';
    lines.push('✅ ' + ing + nota);
  });
  // Limpieza
  Object.entries(window._stockLimpieza || {}).forEach(_ref39 => {
    let _ref40 = _slicedToArray(_ref39, 2),
      ing = _ref40[0],
      state = _ref40[1];
    if (state === 1) lines.push('✅ ' + ing + ': HAY');else if (state === -1) lines.push('❌ ' + ing + ': NO HAY');
  });
  // Extras: text fields
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi, '_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) {
    alert('Selecciona al menos un ingrediente con cantidad mayor a 0');
    return;
  }
  const ts = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  try {
    logActivity('\uD83D\uDCE6 Reposici\u00F3n (' + ts + '): ' + lines.join(' | '));
  } catch (e) {}
  saveToStockHistorial(ts, lines);
  const waText = encodeURIComponent('\uD83D\uDCE6 Stock (' + ts + '):\n' + lines.map(l => '\u2022 ' + l).join('\n'));
  const waUrl = 'https://wa.me/34638292510?text=' + waText;
  const resLines = document.getElementById('stock-result-lines');
  if (resLines) resLines.innerHTML = lines.map(l => '\u2022 ' + l).join('<br>');
  const waBtn = document.getElementById('stock-wa-btn');
  if (waBtn) waBtn.href = waUrl;
  window._lastStockLines = lines;
  window._lastStockTs = ts;
  const modal = document.getElementById('stock-result-modal');
  if (modal) modal.style.display = 'block';
}
function sendStockWhatsApp() {
  const data = getStockData();
  const lines = [];
  Object.entries(_stockSelections).filter(_ref41 => {
    let _ref42 = _slicedToArray(_ref41, 2),
      v = _ref42[1];
    return v > 0;
  }).forEach(_ref43 => {
    let _ref44 = _slicedToArray(_ref43, 2),
      name = _ref44[0],
      qty = _ref44[1];
    if (STOCK_BOTE.has(name)) {
      const boteStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      lines.push(name + ': ' + boteStr + ' ' + (qty <= 1 ? 'bote' : 'botes'));
    } else {
      const fixedU = STOCK_FIXED_UNIT[name] || null;
      const unit = fixedU || _stockUnits && _stockUnits[name] || 'unidades';
      const qtyStr = qty % 1 === 0.5 ? Math.floor(qty) > 0 ? Math.floor(qty) + '½' : '½' : qty;
      const unitLabel = fixedU ? qty <= 1 ? fixedU : fixedU + 's' : unit === 'cajas' ? qty <= 1 ? 'caja' : 'cajas' : qty <= 1 ? 'ud' : 'uds';
      lines.push(name + ': ' + qtyStr + ' ' + unitLabel);
    }
  });
  // Checks (boles, papel térmico)
  Object.entries(window._stockChecks || {}).filter(_ref45 => {
    let _ref46 = _slicedToArray(_ref45, 2),
      v = _ref46[1];
    return v;
  }).forEach(_ref47 => {
    let _ref48 = _slicedToArray(_ref47, 1),
      ing = _ref48[0];
    const nota = window._stockNotas && window._stockNotas[ing] ? ' — ' + window._stockNotas[ing] : '';
    lines.push('✅ ' + ing + nota);
  });
  // Limpieza
  Object.entries(window._stockLimpieza || {}).forEach(_ref49 => {
    let _ref50 = _slicedToArray(_ref49, 2),
      ing = _ref50[0],
      state = _ref50[1];
    if (state === 1) lines.push('✅ ' + ing + ': HAY');else if (state === -1) lines.push('❌ ' + ing + ': NO HAY');
  });
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi, '_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) {
    alert('Selecciona al menos un ingrediente con cantidad mayor a 0');
    return;
  }
  const ts = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const waText = encodeURIComponent('\uD83D\uDCE6 Stock (' + ts + '):\n' + lines.map(l => '\u2022 ' + l).join('\n'));
  window.open('https://wa.me/34638292510?text=' + waText, '_blank');
}

// bimba secret handled in unified keydown listener above

// ── EDITAR TOTAL DE PEDIDO ──
function startEditOrderTotal(orderNum) {
  const safeId = orderNum.replace('#', '');
  const displayEl = document.getElementById('total-display-' + safeId);
  if (!displayEl) return;
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  const order = (stats.orders || []).find(o => o.num === orderNum);
  if (!order) return;
  const currentTotal = order.total;
  const inputEl = document.createElement('input');
  inputEl.type = 'number';
  inputEl.step = '0.01';
  inputEl.min = '0';
  inputEl.value = currentTotal.toFixed(2);
  inputEl.id = 'total-input-' + safeId;
  inputEl.style.cssText = 'width:90px;font-size:13px;font-weight:700;color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;padding:2px 6px;text-align:right;background:rgba(244,196,48,0.08);outline:none';
  displayEl.replaceWith(inputEl);
  inputEl.focus();
  inputEl.select();
  function doSave() {
    saveOrderTotal(orderNum, inputEl.value);
  }
  inputEl.addEventListener('blur', doSave);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSave();
    }
    if (e.key === 'Escape') {
      loadLiveOrders();
    }
  });
}
async function saveOrderTotal(orderNum, rawValue) {
  var _document$getElementB30;
  const newTotal = parseFloat(rawValue);
  if (isNaN(newTotal) || newTotal < 0) {
    loadLiveOrders();
    return;
  }
  const todayKey = new Date().toISOString().slice(0, 10);
  // Transacción: stats/<fecha> también lo escribe guardar-pedido.php cada
  // vez que entra un pedido nuevo — un .set() plano aquí (leer, cambiar el
  // total de un pedido en memoria, sobreescribir el nodo entero) podía
  // perder un pedido real llegado justo mientras se editaba este total.
  let ordenNoEncontrada = false;
  let oldTotal = null;
  const mutator = function (current) {
    const stats = current || {};
    if (!stats.orders) { ordenNoEncontrada = true; return stats; }
    const order = stats.orders.find(o => o.num === orderNum);
    if (!order) { ordenNoEncontrada = true; return stats; }
    oldTotal = order.total;
    order.total = newTotal;
    stats.total = parseFloat((stats.orders.reduce((s, o) => s + (o.total || 0), 0)).toFixed(2));
    return stats;
  };
  let statsFinal = null;
  if (window.fb_transactNative) {
    try { statsFinal = await window.fb_transactNative('stats/' + todayKey, mutator); } catch (e) { console.warn('Firebase stats error', e); }
  } else if (window.fb_getStats) {
    try {
      const fb = await window.fb_getStats(todayKey);
      if (fb) {
        statsFinal = mutator(fb);
        if (window.fb_saveStats) await window.fb_saveStats(statsFinal);
      }
    } catch (e) { console.warn('Firebase stats error', e); }
  }
  if (ordenNoEncontrada || !statsFinal) {
    loadLiveOrders();
    return;
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(statsFinal));
  logActivity('\u270f\ufe0f Precio editado: pedido ' + orderNum + ' \u2014 ' + oldTotal.toFixed(2) + ' \u20ac \u2192 ' + newTotal.toFixed(2) + ' \u20ac');
  loadLiveOrders();
  if ((_document$getElementB30 = document.getElementById('admin-stats')) !== null && _document$getElementB30 !== void 0 && _document$getElementB30.classList.contains('active')) loadDayStats();
}


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
const CONFETI_COLORES = ['#D9A441', '#C0392B', '#27855a', '#3D1F0D', '#FFF8EE', '#1f6f8b'];

window._juegoActivoActual = 'ninguno';
window._juegoState = { juego: null, premio: null, code: null };

// Confeti + sonido al ganar un premio de verdad (pct>0) — solo estética,
// no afecta a nada del cálculo/aplicación del premio. El sonido se
// sintetiza con Web Audio (sin archivo de audio que subir); si el
// navegador bloquea el audio por lo que sea, sigue mostrándose el confeti
// igualmente.
function _celebrarPremio() {
  _lanzarConfeti();
  _sonidoCelebracion();
}
function _lanzarConfeti() {
  const cont = document.createElement('div');
  cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden';
  document.body.appendChild(cont);
  const N = 60;
  for (let i = 0; i < N; i++) {
    const piece = document.createElement('div');
    const color = CONFETI_COLORES[i % CONFETI_COLORES.length];
    const left = Math.random() * 100;
    const size = 6 + Math.random() * 6;
    const duration = 2200 + Math.random() * 1400;
    const delay = Math.random() * 300;
    const rot = Math.random() * 360;
    piece.style.cssText = 'position:absolute;top:-20px;left:' + left + 'vw;width:' + size + 'px;height:' + (size * 0.4) + 'px;background:' + color + ';opacity:.9;transform:rotate(' + rot + 'deg);border-radius:2px;' +
      'animation:juegoConfetiCae ' + duration + 'ms ease-in ' + delay + 'ms forwards';
    cont.appendChild(piece);
  }
  setTimeout(() => cont.remove(), 4200);
}
function _sonidoCelebracion() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notas = [523.25, 659.25, 783.99, 1046.5]; // Do-Mi-Sol-Do, un arpegio alegre
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (e) { /* si el navegador bloquea el audio, no pasa nada — solo se pierde el sonido */ }
}

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
  const icon = document.getElementById('juego-fab-icon');
  if (fab) {
    if (juego === 'ruleta') {
      if (icon) icon.textContent = '🎡';
      fab.classList.remove('hidden');
    } else if (juego === 'rasca') {
      if (icon) icon.textContent = '🎫';
      fab.classList.remove('hidden');
    } else {
      fab.classList.add('hidden');
    }
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

// El teléfono no demuestra que quien pregunta jugó de verdad (sin
// verificación SMS aquí) — juegos.php ahora exige también este token para
// devolver el premio/código al "recuperar" una jugada de hoy, para que no
// baste con probar un teléfono ajeno para robarle su código de descuento.
function _juegoTokenKey(juego) {
  return 'dpf_juego_token_' + juego;
}
async function _juegoGirar(juego, telefono) {
  let token = '';
  try { token = localStorage.getItem(_juegoTokenKey(juego)) || ''; } catch (e) {}
  const res = await fetch('juegos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'girar', juego, telefono, token })
  });
  const data = await res.json();
  if (data && data.token) {
    try { localStorage.setItem(_juegoTokenKey(juego), data.token); } catch (e) {}
  }
  return data;
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
      // Ya jugó hoy — en vez de la pantalla genérica "vuelve mañana", se
      // reutiliza la de resultado con lo que ganó de verdad: si tenía un
      // código sin aplicar (cerró el modal, cambió de dispositivo...) aquí
      // puede recuperarlo, en vez de quedarse sin ninguna forma de verlo.
      const premio = data.premio || {};
      document.getElementById('ruleta-intro').style.display = 'none';
      document.getElementById('ruleta-resultado').style.display = 'block';
      document.getElementById('ruleta-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('ruleta-resultado-titulo').textContent = 'Ya has girado hoy';
      document.getElementById('ruleta-resultado-desc').textContent = premio.pct > 0
        ? 'Tu premio de hoy fue "' + premio.nombre + '" — aquí tienes tu código otra vez, por si no lo llegaste a usar.'
        : (premio.nombre || 'Suerte la próxima vez') + '. Vuelve mañana para otra oportunidad.';
      document.getElementById('ruleta-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      window._juegoState = { juego: 'ruleta', premio, code: data.code };
      _ruletaEjecutando = false;
      return;
    }
    let idx = _ruletaPremios.findIndex(p => p.id === (data.premio && data.premio.id));
    if (idx === -1) {
      // La lista de premios cambió entre abrir la ruleta y girar (el admin
      // la editó justo en medio) — el premio real que se ha ganado (texto,
      // emoji y código) sigue siendo correcto porque viene del servidor,
      // pero la ruleta dibujada localmente ya no tiene ese premio en
      // ninguno de sus segmentos. Se recarga y redibuja con la lista
      // actual antes de animar, para no parar visualmente en un segmento
      // que no es el premio ganado de verdad.
      try {
        const cfgFresco = window.fb_loadRuletaConfig ? await window.fb_loadRuletaConfig() : null;
        if (cfgFresco && Array.isArray(cfgFresco.premios)) {
          _ruletaPremios = cfgFresco.premios;
          _dibujarRuletaWheel(_ruletaPremios);
        }
      } catch (e) {}
      idx = _ruletaPremios.findIndex(p => p.id === (data.premio && data.premio.id));
    }
    if (idx === -1) idx = 0;
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
      document.getElementById('ruleta-resultado-titulo').textContent = '¡Enhorabuena!';
      document.getElementById('ruleta-resultado-desc').textContent = premio.pct > 0
        ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
        : (premio.nombre || 'Suerte la próxima vez');
      document.getElementById('ruleta-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
      if (premio.pct > 0) _celebrarPremio();
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
      // Igual que en la ruleta: si ya rascó hoy, se le enseña directamente
      // el resultado (con el botón de aplicar si aún tiene código sin usar)
      // en vez de un "vuelve mañana" sin ninguna forma de recuperarlo.
      const premio = data.premio || {};
      document.getElementById('rasca-tel-paso').style.display = 'none';
      document.getElementById('rasca-resultado').style.display = 'block';
      document.getElementById('rasca-resultado-emoji').textContent = premio.emoji || '🎉';
      document.getElementById('rasca-resultado-titulo').textContent = 'Ya rascaste hoy';
      document.getElementById('rasca-resultado-desc').textContent = premio.pct > 0
        ? 'Tu premio de hoy fue "' + premio.nombre + '" — aquí tienes tu código otra vez, por si no lo llegaste a usar.'
        : (premio.nombre || 'Suerte la próxima vez') + '. Vuelve mañana para otra tarjeta.';
      document.getElementById('rasca-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
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
  document.getElementById('rasca-resultado-titulo').textContent = '¡Enhorabuena!';
  document.getElementById('rasca-resultado-desc').textContent = premio.pct > 0
    ? '¡Has ganado ' + premio.nombre + '! Tu código de descuento ya está listo.'
    : (premio.nombre || 'Suerte la próxima vez');
  document.getElementById('rasca-aplicar-btn').style.display = premio.pct > 0 ? 'block' : 'none';
  if (premio.pct > 0) _celebrarPremio();
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
  // premio.nombre lo escribe el admin en texto libre al configurar los
  // premios — sin escapar aquí, un nombre con HTML se ejecutaba en cuanto
  // cualquier admin abriera este resumen.
  const desglose = Object.entries(resumen.porPremio)
    .map(([nombre, n]) => n + '× ' + escapeHtml(nombre))
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

// ── DATOS PRIVADOS DE EMPLEADOS ──────────────────────────────────────
// Empleados y fichajes (PIN, DNI, teléfono, firmas) son datos sensibles.
// Solo se cargan tras un login real (Firebase Auth admin o PIN bimba
// verificado en el servidor) — nunca al abrir la página como visitante.
// Llamar desde checkAdminPwd() (slots-alertas.js) y secureLockConfirm()
// (admin-accesos.js) justo después de confirmar el acceso.
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

// ── INIT ADMIN DATA ──
loadSavedMenu();
initTabs(); // re-renderizar pestañas con el menú guardado
renderMenu(); // re-renderizar carta con los datos de localStorage
loadConfig();
applyAutoDelete(); // auto-borrado del historial al cargar

// ── INIT: cargar horario desde Firebase antes de evaluar apertura ──
// Esto evita que cuentas/dispositivos nuevos vean "cerrado" por tener localStorage vacío
(function initConHorarioFirebase() {
  function aplicarEstadoInicial() {
    // Horario footer
    try {
      const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
      if (h.manOpen) updateFooterHorario(h);
    } catch {}
    // Dot y estado visual
    if (!isTodayOpen()) {
      updateHeroDot(false);
    } else {
      const open = localStorage.getItem(OPEN_KEY) !== 'false';
      updateHeroDot(open);
    }
    checkAutoCloseWarning();
    loadOrdersStatus();
    // Aplicar banner desde localStorage inmediatamente (antes de Firebase)
    _applyBannerDia(getBannerDia());
    // Cargar banner desde Firebase con delay como seguro para Safari iOS
    // donde firebaseReady puede dispararse tarde o no dispararse
    setTimeout(() => loadBannerDia(), 1500);
    setTimeout(() => loadBannerDia(), 4000);

    // Re-chequeo automático cada minuto: apertura y cierre sin necesidad de refrescar
    // Usa visibilitychange para recrear el intervalo si la PWA volvió de segundo plano
    function _startAutoStatusInterval() {
      if (window._autoStatusInterval) clearInterval(window._autoStatusInterval);
      window._autoStatusInterval = setInterval(() => {
        checkAutoCloseWarning();
        loadOrdersStatus();
      }, 60000);
    }
    if (!window._autoStatusInterval) {
      _startAutoStatusInterval();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // La página volvió a primer plano — re-evaluar estado inmediatamente y reiniciar intervalo
          checkAutoCloseWarning();
          loadOrdersStatus();
          _startAutoStatusInterval();
        }
      });
    }
  }

  // Si ya hay horario en localStorage, aplicar inmediatamente
  // y luego actualizar desde Firebase en segundo plano
  const horarioLocal = localStorage.getItem(HORARIO_KEY);
  if (horarioLocal) {
    aplicarEstadoInicial();
  }

  // Siempre intentar cargar desde Firebase (fuente de verdad)
  if (window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
        updateFooterHorario(hFb);
      }
      // Si no había horario local, este es el primer arranque: aplicar ahora
      if (!horarioLocal) {
        aplicarEstadoInicial();
      } else {
        // Si había horario local, re-evaluar con el horario de Firebase (puede haber cambiado)
        aplicarEstadoInicial();
        checkAutoCloseWarning();
        loadOrdersStatus();
        // Reintento con delay por si el primer render fue antes de que Firebase respondiera
        setTimeout(() => loadOrdersStatus(), 1000);
        setTimeout(() => loadOrdersStatus(), 3000);
      }
    }).catch(() => {
      // Firebase no disponible: usar lo que haya en localStorage
      if (!horarioLocal) aplicarEstadoInicial();
    });
  } else {
    // Firebase no cargado aún: esperar al evento y mientras usar localStorage
    if (!horarioLocal) aplicarEstadoInicial();
    document.addEventListener('firebaseReady', function () {
      // Suprimir warnings de Firebase para no mostrarlos a clientes
      if (window.firebase && window.firebase.database) {
        try {
          window.firebase.database.enableLogging(false);
        } catch (e) {}
      }
      loadBannerDia();
      if (window.fb_loadHorario) {
        window.fb_loadHorario().then(hFb => {
          if (hFb) {
            localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
            updateFooterHorario(hFb);
            checkAutoCloseWarning();
            loadOrdersStatus();
          }
        }).catch(() => {});
      }
      _cargarCriticosDesdeFirebase();
    });
  }

  // Carga inicial de datos críticos desde Firebase (cats, slots, etc.)
  // NOTA DE SEGURIDAD: empleados y fichajes NO se cargan aquí — esta
  // función corre para cualquier visitante. Ver _cargarDatosEmpleadosPrivados().
  function _cargarCriticosDesdeFirebase() {
    if (window.fb_loadBlockedCats) {
      window.fb_loadBlockedCats().then(cats => {
        if (cats) {
          var _document$getElementB33;
          localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
          renderMenu();
          if ((_document$getElementB33 = document.getElementById('admin-pedidos')) !== null && _document$getElementB33 !== void 0 && _document$getElementB33.classList.contains('active')) loadCatBlockUI();
        }
      }).catch(() => {});
    }
    if (window.fb_loadSlotConfig) {
      window.fb_loadSlotConfig().then(cfg => {
        var _document$getElementB34;
        if (!cfg) return;
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max) {
          localStorage.setItem(SLOT_MAX_KEY, cfg.max);
          SLOT_MAX = parseInt(cfg.max, 10);
        }
        renderSlotPicker();
        if ((_document$getElementB34 = document.getElementById('admin-local')) !== null && _document$getElementB34 !== void 0 && _document$getElementB34.classList.contains('active')) loadSlotTurnosUI();
      }).catch(() => {});
    }
    if (window.fb_loadActivityLog) {
      window.fb_loadActivityLog().then(log => {
        if (log && log.length) {
          var _document$getElementB35;
          localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
          if ((_document$getElementB35 = document.getElementById('admin-log')) !== null && _document$getElementB35 !== void 0 && _document$getElementB35.classList.contains('active')) renderActivityLog();
        }
      }).catch(() => {});
    }
    if (window.fb_loadAutoDelete) {
      window.fb_loadAutoDelete().then(days => {
        if (days !== null && days !== undefined) {
          localStorage.setItem(AUTODELETE_KEY, days);
          applyAutoDelete();
          const sel = document.getElementById('autodelete-days');
          if (sel) sel.value = days;
        }
      }).catch(() => {});
    }
    if (window.fb_loadSoundConfig) {
      window.fb_loadSoundConfig().then(cfg => {
        var _document$getElementB36;
        if (!cfg) return;
        localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
        if ((_document$getElementB36 = document.getElementById('admin-local')) !== null && _document$getElementB36 !== void 0 && _document$getElementB36.classList.contains('active')) loadSoundConfigUI();
      }).catch(() => {});
    }
    // CONFIG DEL LOCAL
    if (window.fb_loadConfig) {
      window.fb_loadConfig().then(c => {
        var _document$getElementB37;
        if (!c) return;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
        Object.assign(CONFIG, c);
        if ((_document$getElementB37 = document.getElementById('admin-local')) !== null && _document$getElementB37 !== void 0 && _document$getElementB37.classList.contains('active')) loadAdminConfig();
      }).catch(() => {});
    }
    // ESTADO ABIERTO/CERRADO
    if (window.fb_loadOpenLocal) {
      window.fb_loadOpenLocal().then(val => {
        if (val === null || val === undefined) return;
        localStorage.setItem(OPEN_KEY, String(val));
        updateOpenBtn(val === true || val === 'true');
        updateHeroDot(val === true || val === 'true');
      }).catch(() => {});
    }
    // PEDIDOS ABIERTOS + MENSAJE
    if (window.fb_loadOrdersOpen) {
      window.fb_loadOrdersOpen().then(val => {
        if (val === null) return;
        localStorage.setItem(ORDERS_KEY, val);
        // Solo actualizar UI si el horario no dice que estamos cerrados
        if (!isOutsideHours() && isTodayOpen()) updateOrdersUI(val);
      }).catch(() => {});
    }
    if (window.fb_loadOrdersMsg) {
      window.fb_loadOrdersMsg().then(msg => {
        if (!msg) return;
        localStorage.setItem(ORDERS_MSG_KEY, msg);
        const inp = document.getElementById('orders-pause-msg');
        if (inp) inp.value = msg;
      }).catch(() => {});
    }
    // NOTA DE SEGURIDAD: los tokens de acceso (config/urlToken,
    // config/bimbaToken) y la clave de stock (config/stockPwd) NO se
    // cargan aquí — esta función corre para cualquier visitante, y antes
    // se descargaban a localStorage aunque nadie hubiera iniciado sesión,
    // lo que permitía a cualquier cliente leer su propio localStorage y
    // auto-concederse acceso por ?bimba=/?key=. Ver
    // _cargarDatosEmpleadosPrivados() — la comprobación real de esos
    // tokens ahora la hace el servidor (bimba-verify.php).
    // LISTA DE INGREDIENTES DE STOCK — listener en tiempo real
    if (window.fb_listenStockData) {
      window.fb_listenStockData(data => {
        var _document$getElementB38, _document$getElementB39;
        if (!data) return;
        // Ignorar eco de nuestro propio guardado (menos de 2s)
        if (window._stockDataLocalWrite && Date.now() - window._stockDataLocalWrite < 2000) return;
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
        if ((_document$getElementB38 = document.getElementById('admin-stock-config')) !== null && _document$getElementB38 !== void 0 && _document$getElementB38.classList.contains('active')) loadStockAdminList();
        // Si el overlay de stock está abierto, actualizar la lista también
        if (((_document$getElementB39 = document.getElementById('stock-overlay')) === null || _document$getElementB39 === void 0 ? void 0 : _document$getElementB39.style.display) === 'block') renderStockItems();
      });
    }
    // DATOS EMPRESA (razón social + CIF)
    if (window.fb_loadEmpresa) {
      window.fb_loadEmpresa().then(d => {
        if (!d) return;
        if (d.empresa) localStorage.setItem(EMP_EMPRESA_KEY, d.empresa);
        if (d.cif) localStorage.setItem(EMP_CIF_KEY, d.cif);
        empCargarEmpresaUI();
      }).catch(() => {});
    }
    // CONTRASEÑA ADMIN (sincronizar hash entre dispositivos)
    if (window.fb_loadAdminPwd) {
      window.fb_loadAdminPwd().then(hash => {
        if (hash && isHex64(hash)) localStorage.setItem(ADMIN_PWD_KEY, hash);
      }).catch(() => {});
    }
  }
  if (window._firebaseReady) {
    _cargarCriticosDesdeFirebase();
  } else {
    document.addEventListener('firebaseReady', _cargarCriticosDesdeFirebase);
  }
})();

// ── AVISO DE PROBLEMA DE CONEXIÓN ────────────────────────────────────────────
// _firebaseReady solo confirma que el SDK cargó al principio — si después
// se cae la conexión real (wifi del local, Firebase caído, etc.), la web
// seguía pareciendo normal pero con datos parados (turnos, config de
// gastos, pedidos abiertos/cerrados...) sin ningún aviso. ".info/connected"
// es la señal fiable de la conexión real en cada momento.
(function _iniciarAvisoConexionFirebase() {
  let _conexionPerdidaTimeout = null;
  let _bannerConexionMostrado = false;
  function _mostrarBannerConexion(mostrar) {
    const banner = document.getElementById('firebase-conexion-banner');
    if (!banner) return;
    banner.style.display = mostrar ? 'block' : 'none';
    _bannerConexionMostrado = mostrar;
  }
  function _iniciar() {
    if (!window.fb_listenConnectionState) return;
    window.fb_listenConnectionState(connected => {
      if (connected) {
        if (_conexionPerdidaTimeout) {
          clearTimeout(_conexionPerdidaTimeout);
          _conexionPerdidaTimeout = null;
        }
        if (_bannerConexionMostrado) _mostrarBannerConexion(false);
      } else if (!_conexionPerdidaTimeout) {
        // Margen de unos segundos antes de avisar — un corte breve al
        // cambiar de wifi a datos móviles es normal y no debe alarmar.
        _conexionPerdidaTimeout = setTimeout(() => {
          _conexionPerdidaTimeout = null;
          _mostrarBannerConexion(true);
        }, 6000);
      }
    });
  }
  if (window._firebaseReady) {
    _iniciar();
  } else {
    document.addEventListener('firebaseReady', _iniciar);
  }
})();

// ── BANNER PEDIDO ACTIVO ──────────────────────────────────────────────────────
const ACTIVE_ORDER_KEY = 'dpf_active_order';
function _checkActivePedido() {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !data.ts || !data.num) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    const elapsed = Date.now() - data.ts;
    if (elapsed >= getModifyWindowMs()) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    window._lastOrderData = data;
    _showActivePedidoBanner(data, elapsed);
  } catch (e) {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
  }
}
function _showActivePedidoBanner(data, elapsed) {
  if (document.getElementById('_active-order-banner')) return;
  const remaining = Math.max(0, getModifyWindowMs() - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor(remaining % 60000 / 1000);
  const slot = data.slot ? ' - recogida a las ' + data.slot : '';
  const banner = document.createElement('div');
  banner.id = '_active-order-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2000;background:#3D1F0D;color:#FFF8EE;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-family:\'DM Sans\',sans-serif;box-shadow:0 -4px 24px rgba(61,31,13,0.25)';
  banner.innerHTML = '<div style="flex:1;min-width:0">' + '<div style="font-size:13px;font-weight:700">Tienes un pedido activo: ' + data.num + slot + '</div>' + '<div id="_active-order-timer" style="font-size:11px;opacity:0.7;margin-top:2px">Puedes modificarlo durante ' + mins + ':' + String(secs).padStart(2, '0') + ' min</div>' + '</div>' + '<button onclick="modificarPedidoFromBanner()" style="flex-shrink:0;background:#3D1F0D;color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">Modificar</button>' + '<button onclick="_dismissActiveBanner()" style="flex-shrink:0;background:none;border:none;color:rgba(255,248,238,0.6);font-size:22px;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>';
  document.body.appendChild(banner);
  window._activeBannerInterval = setInterval(function () {
    const rem = Math.max(0, getModifyWindowMs() - (Date.now() - data.ts));
    if (rem <= 0) {
      _dismissActiveBanner();
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return;
    }
    const m = Math.floor(rem / 60000);
    const s = Math.floor(rem % 60000 / 1000);
    const el = document.getElementById('_active-order-timer');
    if (el) el.textContent = 'Puedes modificarlo durante ' + m + ':' + String(s).padStart(2, '0') + ' min';
  }, 1000);
}
function _dismissActiveBanner() {
  const b = document.getElementById('_active-order-banner');
  if (b) b.remove();
  if (window._activeBannerInterval) {
    clearInterval(window._activeBannerInterval);
    window._activeBannerInterval = null;
  }
}
function modificarPedidoFromBanner() {
  _dismissActiveBanner();
  const successScreen = document.getElementById('success-screen');
  if (successScreen && successScreen.style.display !== 'block' && window._lastOrderData) {
    const data = window._lastOrderData;
    document.getElementById('order-num-display').textContent = data.num;
    successScreen.style.display = 'block';
    document.querySelector('.order-panel').style.display = 'none';
    _startModifyTimer();
    setTimeout(function () {
      successScreen.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
    return;
  }
  modificarPedido();
}
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(_checkActivePedido, 800);
});

// ── Funciones del modal SMS ─────────────────────────────────
function smsCodeInput(el, n) {
  el.value = el.value.replace(/[^0-9]/g, '');
  if (el.value.length === 1 && n < 4) {
    const next = document.getElementById('sms-code-' + (n + 1));
    if (next) next.focus();
  }
  if (n === 4) {
    // Auto-verificar cuando se rellena el último dígito
    const code = ['1','2','3','4'].map(i => {
      const el2 = document.getElementById('sms-code-' + i);
      return el2 ? el2.value : '';
    }).join('');
    if (code.length === 4) smsVerifyCode();
  }
}

function smsCodeKey(event, n) {
  if (event.key === 'Backspace') {
    const el = document.getElementById('sms-code-' + n);
    if (el && el.value === '' && n > 1) {
      const prev = document.getElementById('sms-code-' + (n - 1));
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }
}

async function smsVerifyCode() {
  const code = ['1','2','3','4'].map(i => {
    const el = document.getElementById('sms-code-' + i);
    return el ? el.value : '';
  }).join('');

  if (code.length < 4) {
    const errEl = document.getElementById('sms-error-msg');
    if (errEl) { errEl.textContent = 'Introduce los 4 dígitos del código.'; errEl.style.display = 'block'; }
    return;
  }

  const btn = document.getElementById('sms-verify-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

  const pendingPhone = window._pendingOrderData ? '+34' + window._pendingOrderData.phoneClean : null;
  if (!pendingPhone) {
    if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    return;
  }

  try {
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('/verify-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone, code })
    }, 8000);
    const data = await res.json();
    if (data.verified) {
      await _finalizarPedido();
    } else {
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.textContent = '❌ Código incorrecto. Inténtalo de nuevo.'; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = '✅ Verificar'; }
    }
  } catch (e) {
    console.warn('[SMS] verify error:', e);
    // Fallback: si falla la verificación, dejar pasar igualmente
    await _finalizarPedido();
  }
}

async function smsResendCode() {
  if (!window._pendingOrderData) return;
  const phone = '+34' + window._pendingOrderData.phoneClean;
  try {
    const res = await (typeof _fetchConTimeout === 'function' ? _fetchConTimeout : fetch)('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }, 8000);
    const data = await res.json();
    const errEl = document.getElementById('sms-error-msg');
    if (data.success) {
      if (errEl) { errEl.style.color = '#27855a'; errEl.textContent = '✅ Código reenviado.'; errEl.style.display = 'block'; }
      setTimeout(() => { if (errEl) errEl.style.display = 'none'; }, 3000);
    } else {
      if (errEl) { errEl.style.color = '#c0392b'; errEl.textContent = data.error || 'No se pudo reenviar.'; errEl.style.display = 'block'; }
    }
  } catch (e) {
    console.warn('[SMS] resend error:', e);
  }
}

function smsCancelVerify() {
  window._pendingOrderData = null;
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';
  const btn = document.getElementById('submit-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar pedido →'; }
}


// ── ALERTAS FICHAJE BIMBA ──────────────────────────────────

// ── "TRABAJANDO AHORA" — tarjeta resumen en sección Empleados ──
function _empEstadosFichajeHoy() {
  var empleados = JSON.parse(localStorage.getItem('dpf_empleados') || '[]');
  var today = new Date().toISOString().slice(0, 10);
  var ahora = new Date();
  var ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });

  return empleados.map(function(emp) {
    var suyos = fichajesHoy.filter(function(f) { return f.empId === emp.id; })
      .sort(function(a, b) { return (a.horaReal || a.hora).localeCompare(b.horaReal || b.hora); });
    var entradas = suyos.filter(function(f) { return f.tipo === 'entrada'; });
    var salidas = suyos.filter(function(f) { return f.tipo === 'salida'; });
    var ultimaEntrada = entradas.length ? entradas[entradas.length - 1] : null;
    var ultimaSalida = salidas.length ? salidas[salidas.length - 1] : null;

    var estado;
    if (!entradas.length) {
      estado = 'nada';
    } else if (salidas.length) {
      estado = 'salida';
    } else {
      var horaContratoSalida = emp.tarOut || emp.manOut || null;
      if (horaContratoSalida) {
        var parts = horaContratoSalida.split(':').map(Number);
        var salidaMin = parts[0] * 60 + parts[1];
        var diff = ahoraMin - salidaMin;
        if (diff < -12 * 60) diff += 24 * 60;
        estado = diff >= 60 ? 'olvido' : 'entrada';
      } else {
        estado = 'entrada';
      }
    }
    return { emp: emp, estado: estado, entrada: ultimaEntrada, salida: ultimaSalida };
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
    olvido: { icon: '⚠️', color: '#9a3412', texto: function(r) { return 'Se olvidó fichar salida (entró ' + (r.entrada ? (r.entrada.horaReal || r.entrada.hora) : '—') + ')'; } },
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
  var ahora = new Date();
  var ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  var fichajes = JSON.parse(localStorage.getItem('dpf_fichajes') || '[]');
  if (!Array.isArray(fichajes)) fichajes = [];
  var fichajesHoy = fichajes.filter(function(f) { return f.fecha === today; });

  var html = '';
  empleados.forEach(function(emp) {
    var suyos = fichajesHoy.filter(function(f) { return f.empId === emp.id; })
      .sort(function(a,b) { return (a.horaReal||a.hora).localeCompare(b.horaReal||b.hora); });
    var entradas = suyos.filter(function(f) { return f.tipo === 'entrada'; });
    var salidas  = suyos.filter(function(f) { return f.tipo === 'salida'; });
    var ultimo   = suyos.length ? suyos[suyos.length-1] : null;

    var estado; // 'entrada' | 'salida' | 'olvido' | 'nada'

    if (!entradas.length) {
      estado = 'nada';
    } else if (salidas.length) {
      estado = 'salida';
    } else {
      // Tiene entrada pero no salida — ¿lleva más de 1h desde hora de salida del contrato?
      var horaContratoSalida = emp.tarOut || emp.manOut || null;
      if (horaContratoSalida) {
        var parts = horaContratoSalida.split(':').map(Number);
        var salidaMin = parts[0] * 60 + parts[1];
        // Manejar turno nocturno (salida al día siguiente)
        var diff = ahoraMin - salidaMin;
        if (diff < -12*60) diff += 24*60; // ajuste nocturno
        estado = diff >= 60 ? 'olvido' : 'entrada';
      } else {
        estado = 'entrada';
      }
    }

    var estilos = {
      entrada: { bg:'#f0fdf4', border:'#1D9E75', icon:'🟢', textColor:'#166534', label:'Fichó entrada',     boton:false },
      salida:  { bg:'#eff6ff', border:'#378ADD', icon:'🔵', textColor:'#0C447C', label:'Fichó salida',      boton:false },
      olvido:  { bg:'#fff7ed', border:'#f97316', icon:'⚠️', textColor:'#9a3412', label:'Se olvidó fichar salida', boton:true },
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

// ── Botón flotante "subir arriba" ── aparece solo tras un scroll notable
// (con tantas categorías en la carta, bajar hasta el final y no tener
// forma rápida de volver arriba era incómodo).
(function () {
  var btn = document.getElementById('back-to-top-fab');
  if (!btn) return;
  var ticking = false;
  function actualizar() {
    if (window.scrollY > 600) btn.classList.add('visible');
    else btn.classList.remove('visible');
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(actualizar);
  }, { passive: true });
})();

// ── BUSCADOR del panel admin y del panel bimba ──
// Busca en secciones (navegación estática) y en contenido real: productos
// de la carta, ingredientes de stock, empleados, códigos de descuento y
// premios de ruleta/rasca. Al hacer clic navega de verdad a la sección y,
// si el resultado es contenido concreto, hace scroll + resalta la fila.

let _buscadorLastAdmin = [];
let _buscadorLastBimba = [];
let _buscadorDiscountsCache = null;
let _buscadorPremiosCache = null; // { ruleta: [...], rasca: [...] }

function _buscadorNorm(s) {
  // La coma decimal ("5,90") se normaliza a punto para que encuentre
  // precios como "5.90 €", que es como los formatea el resto de la app.
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/,/g, '.');
}

function _buscadorHighlight(text, q) {
  const t = String(text == null ? '' : text);
  if (!q) return escapeHtml(t);
  const i = _buscadorNorm(t).indexOf(_buscadorNorm(q));
  if (i === -1) return escapeHtml(t);
  return escapeHtml(t.slice(0, i)) + '<mark>' + escapeHtml(t.slice(i, i + q.length)) + '</mark>' + escapeHtml(t.slice(i + q.length));
}

function _buscadorItemMatches(item, q) {
  if (!q) return true;
  const nq = _buscadorNorm(q);
  if (_buscadorNorm(item.nombre).includes(nq)) return true;
  return (item.meta || []).some(m => _buscadorNorm(m.valor).includes(nq));
}

function _buscadorScrollFlash(id, delay) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('buscador-flash');
    setTimeout(() => el.classList.remove('buscador-flash'), 1500);
  }, delay || 300);
}

// Abre el acordeón bimba `panelId` simulando un clic en su fila `rowId`
// (reutiliza el toggle ya existente) solo si está cerrado.
function _buscadorAbrirBimbaAcordeon(panelId, rowId) {
  const panel = document.getElementById(panelId);
  const row = document.getElementById(rowId);
  if (panel && row && panel.style.display === 'none') row.click();
}

// ── SECCIONES (navegación estática) ──────────────────────────────────────
function _buscadorSeccionesAdmin() {
  const tab = id => document.querySelector('.admin-tab[data-section="' + id + '"]');
  return [
    { icon: '🍽️', badge: 'section', tipo: 'Sección', nombre: 'Carta', ruta: 'Panel admin', meta: [], go: () => showAdminSection('productos', tab('productos')) },
    { icon: '🏪', badge: 'section', tipo: 'Sección', nombre: 'Local', ruta: 'Panel admin', meta: [], go: () => showAdminSection('local', tab('local')) },
    { icon: '🔴', badge: 'section', tipo: 'Sección', nombre: 'En vivo', ruta: 'Panel admin · pedidos', meta: [], go: () => showAdminSection('pedidos', tab('pedidos')) },
    { icon: '📊', badge: 'section', tipo: 'Sección', nombre: 'Hoy', ruta: 'Panel admin · estadísticas', meta: [], go: () => showAdminSection('stats', tab('stats')) },
    { icon: '📅', badge: 'section', tipo: 'Sección', nombre: 'Historial', ruta: 'Panel admin', meta: [], go: () => showAdminSection('historial', tab('historial')) },
    { icon: '📦', badge: 'section', tipo: 'Sección', nombre: 'Stock', ruta: 'Panel admin', meta: [], go: () => { document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active')); if (typeof openStockInline === 'function') openStockInline(); } },
    { icon: '🎁', badge: 'section', tipo: 'Sección', nombre: 'Fidelización', ruta: 'Panel admin', meta: [], go: () => { showAdminSection('fidelizacion', tab('fidelizacion')); if (typeof renderFidelizacionList === 'function') renderFidelizacionList(); } },
    { icon: '🔔', badge: 'section', tipo: 'Sección', nombre: 'Alertas', ruta: 'Panel admin', meta: [], go: () => showAdminSection('alertas', tab('alertas')) },
    { icon: '🛡️', badge: 'section', tipo: 'Sección', nombre: 'Configuración de pedidos', ruta: 'Panel admin · ⚙️ Ajustes', meta: [], go: () => showAdminSection('pedidos-config', null) },
  ];
}

function _buscadorSeccionesBimba() {
  const volverYAbrir = (panelId, rowId) => () => {
    if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
    setTimeout(() => _buscadorAbrirBimbaAcordeon(panelId, rowId), 200);
  };
  return [
    { icon: '🔥', badge: 'section', tipo: 'Sección', nombre: 'Promociones', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('bimba-promos-body', 'mkt-row-promos') },
    { icon: '🎁', badge: 'section', tipo: 'Sección', nombre: 'Códigos de descuento', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('dc-panel', 'mkt-row-codigos') },
    { icon: '🎡', badge: 'section', tipo: 'Sección', nombre: 'Ruleta de premios', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('ruleta-admin-panel', 'mkt-row-ruleta') },
    { icon: '🎫', badge: 'section', tipo: 'Sección', nombre: 'Rasca y gana', ruta: 'bimba · Marketing', meta: [], go: volverYAbrir('rasca-admin-panel', 'mkt-row-rasca') },
    {
      icon: '👥', badge: 'section', tipo: 'Sección', nombre: 'Lista de empleados', ruta: 'bimba · Empleados', meta: [],
      go: () => { if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados(); setTimeout(() => _buscadorAbrirBimbaAcordeon('bimba-emp-body', 'emp-row-lista'), 100); }
    },
    {
      icon: '📋', badge: 'section', tipo: 'Sección', nombre: 'Historial de fichajes', ruta: 'bimba · Empleados', meta: [],
      go: () => { if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados(); setTimeout(() => _buscadorAbrirBimbaAcordeon('bimba-hist-body', 'emp-row-hist'), 100); }
    },
  ];
}

// ── CONTENIDO REAL ────────────────────────────────────────────────────────
function _buscadorContenidoAdmin() {
  const items = [];
  if (typeof MENU !== 'undefined') {
    MENU.forEach(p => {
      items.push({
        icon: '🍽️', badge: 'prod', tipo: 'Producto', nombre: p.name,
        ruta: 'Carta · ' + p.cat + ' · ' + p.price.toFixed(2) + ' €',
        meta: [{ etiqueta: 'categoría', valor: p.cat }, { etiqueta: 'precio', valor: p.price.toFixed(2) }],
        go: () => {
          showAdminSection('productos', document.querySelector('.admin-tab[data-section="productos"]'));
          _buscadorScrollFlash('arow-' + p.id, 150);
        }
      });
    });
  }
  if (typeof pp2AllItems === 'function') {
    try {
      pp2AllItems().forEach(ing => {
        items.push({
          icon: '📦', badge: 'prod', tipo: 'Ingrediente', nombre: ing.nombre,
          ruta: 'Pedidos proveedores' + (ing.cat ? ' · ' + ing.cat : ''),
          meta: [{ etiqueta: 'grupo', valor: ing.cat || '' }],
          go: () => {
            if (typeof openPedidosProvOverlay === 'function') openPedidosProvOverlay();
            _pp2SearchQuery = ing.nombre;
            const sb = document.getElementById('pp2-search');
            if (sb) sb.value = ing.nombre;
            setTimeout(() => {
              if (typeof pp2Render === 'function') pp2Render();
              _buscadorScrollFlash('pp2-row-' + ing.id, 80);
            }, 450);
          }
        });
      });
    } catch (e) {}
  }
  return items;
}

function _buscadorContenidoBimba() {
  const items = [];
  if (typeof empLoadAll === 'function') {
    try {
      empLoadAll().forEach(e => {
        items.push({
          icon: '👤', badge: 'emp', tipo: 'Empleado', nombre: e.nombre,
          ruta: 'bimba · Empleados' + (e.deBaja ? ' · de baja' : ''),
          meta: [{ etiqueta: 'DNI', valor: e.dni || '' }, { etiqueta: 'tel', valor: e.tel || '' }],
          go: () => {
            if (typeof bimbaIrAEmpleados === 'function') bimbaIrAEmpleados();
            setTimeout(() => {
              _buscadorAbrirBimbaAcordeon('bimba-emp-body', 'emp-row-lista');
              _buscadorScrollFlash('emp-row-' + e.id, 200);
            }, 100);
          }
        });
      });
    } catch (e) {}
  }
  // Solo códigos creados a mano — los RAS-/RUL- de premios no se listan
  // aquí tampoco (mismo criterio que dcCargar, ver admin-turnos-descuentos.js)
  if (_buscadorDiscountsCache) {
    Object.keys(_buscadorDiscountsCache).filter(code => !_buscadorDiscountsCache[code].origen).forEach(code => {
      const d = _buscadorDiscountsCache[code];
      items.push({
        icon: '🏷️', badge: 'code', tipo: 'Código', nombre: code,
        ruta: 'bimba · Códigos · ' + d.pct + '% · ' + (d.uses || 0) + '/' + d.maxUses + ' usos',
        meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('dc-panel', 'mkt-row-codigos');
            _buscadorScrollFlash('dc-row-' + code, 200);
          }, 300);
        }
      });
    });
  }
  if (_buscadorPremiosCache) {
    (_buscadorPremiosCache.ruleta || []).filter(p => p.nombre).forEach(p => {
      items.push({
        icon: '🎡', badge: 'premio', tipo: 'Premio', nombre: p.nombre, ruta: 'bimba · Ruleta de premios', meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('ruleta-admin-panel', 'mkt-row-ruleta');
            _buscadorScrollFlash('premio-row-' + p.id, 350);
          }, 300);
        }
      });
    });
    (_buscadorPremiosCache.rasca || []).filter(p => p.nombre).forEach(p => {
      items.push({
        icon: '🎫', badge: 'premio', tipo: 'Premio', nombre: p.nombre, ruta: 'bimba · Rasca y gana', meta: [],
        go: () => {
          if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
          setTimeout(() => {
            _buscadorAbrirBimbaAcordeon('rasca-admin-panel', 'mkt-row-rasca');
            _buscadorScrollFlash('premio-row-' + p.id, 350);
          }, 300);
        }
      });
    });
  }
  return items;
}

// ── RENDER + WIRING ────────────────────────────────────────────────────────
function _buscadorRenderRow(item, q) {
  let nombreHtml, rutaHtml;
  if (!q || _buscadorNorm(item.nombre).includes(_buscadorNorm(q))) {
    nombreHtml = _buscadorHighlight(item.nombre, q);
    rutaHtml = escapeHtml(item.ruta);
  } else {
    const hit = (item.meta || []).find(m => _buscadorNorm(m.valor).includes(_buscadorNorm(q)));
    nombreHtml = escapeHtml(item.nombre);
    rutaHtml = escapeHtml(item.ruta) + (hit ? ' · coincide en ' + escapeHtml(hit.etiqueta) + ': ' + _buscadorHighlight(hit.valor, q) : '');
  }
  return '<button type="button" class="buscador-row" data-idx="' + item._idx + '">'
    + '<span class="buscador-row-icon">' + item.icon + '</span>'
    + '<span class="buscador-row-text">'
    + '<span class="buscador-row-top">'
    + '<span class="buscador-row-name">' + nombreHtml + '</span>'
    + '<span class="buscador-badge buscador-badge--' + item.badge + '">' + escapeHtml(item.tipo) + '</span>'
    + '</span>'
    + '<span class="buscador-row-path">' + rutaHtml + '</span>'
    + '</span>'
    + '</button>';
}

function _buscadorRenderizar(inputEl, resultsEl, seccionesFn, contenidoFn, tipoPanel) {
  const q = inputEl.value.trim();
  const items = q ? seccionesFn().concat(contenidoFn()) : seccionesFn();
  const found = (q ? items.filter(it => _buscadorItemMatches(it, q)) : items).slice(0, 24);
  if (tipoPanel === 'admin') _buscadorLastAdmin = found; else _buscadorLastBimba = found;
  resultsEl.innerHTML = found.length
    ? found.map((it, i) => _buscadorRenderRow(Object.assign({}, it, { _idx: i }), q)).join('')
    : '<div class="buscador-empty">Sin resultados' + (q ? ' para "' + escapeHtml(q) + '"' : '') + '</div>';
  resultsEl.classList.add('open');
}

function _buscadorWireResultsClick(resultsEl, tipoPanel, inputEl) {
  resultsEl.addEventListener('click', e => {
    const row = e.target.closest('.buscador-row');
    if (!row) return;
    const idx = parseInt(row.dataset.idx, 10);
    const item = (tipoPanel === 'admin' ? _buscadorLastAdmin : _buscadorLastBimba)[idx];
    if (!item) return;
    resultsEl.classList.remove('open');
    inputEl.blur();
    try { item.go(); } catch (err) { console.error('[buscador] error al navegar:', err); }
  });
}

function _buscadorRefreshBimbaCache(inputEl, resultsEl) {
  const rerenderSiHayTexto = () => { if (inputEl.value.trim()) _buscadorRenderizar(inputEl, resultsEl, _buscadorSeccionesBimba, _buscadorContenidoBimba, 'bimba'); };
  if (window.fb_loadDiscounts) {
    window.fb_loadDiscounts().then(d => { _buscadorDiscountsCache = d || {}; rerenderSiHayTexto(); }).catch(() => {});
  }
  if (window.fb_loadRuletaConfig) {
    window.fb_loadRuletaConfig().then(c => {
      _buscadorPremiosCache = _buscadorPremiosCache || {};
      _buscadorPremiosCache.ruleta = (c && c.premios) || [];
      rerenderSiHayTexto();
    }).catch(() => {});
  }
  if (window.fb_loadRascaConfig) {
    window.fb_loadRascaConfig().then(c => {
      _buscadorPremiosCache = _buscadorPremiosCache || {};
      _buscadorPremiosCache.rasca = (c && c.premios) || [];
      rerenderSiHayTexto();
    }).catch(() => {});
  }
}

function _buscadorInit() {
  const ai = document.getElementById('buscador-admin-input');
  const ar = document.getElementById('buscador-admin-results');
  if (ai && ar) {
    const renderAdmin = () => _buscadorRenderizar(ai, ar, _buscadorSeccionesAdmin, _buscadorContenidoAdmin, 'admin');
    ai.addEventListener('input', renderAdmin);
    ai.addEventListener('focus', renderAdmin);
    ai.addEventListener('keydown', e => { if (e.key === 'Escape') { ar.classList.remove('open'); ai.blur(); } });
    document.addEventListener('click', e => { if (!ai.contains(e.target) && !ar.contains(e.target)) ar.classList.remove('open'); });
    _buscadorWireResultsClick(ar, 'admin', ai);
  }
  const bi = document.getElementById('buscador-bimba-input');
  const br = document.getElementById('buscador-bimba-results');
  if (bi && br) {
    const renderBimba = () => _buscadorRenderizar(bi, br, _buscadorSeccionesBimba, _buscadorContenidoBimba, 'bimba');
    bi.addEventListener('input', renderBimba);
    bi.addEventListener('focus', () => { _buscadorRefreshBimbaCache(bi, br); renderBimba(); });
    bi.addEventListener('keydown', e => { if (e.key === 'Escape') { br.classList.remove('open'); bi.blur(); } });
    document.addEventListener('click', e => { if (!bi.contains(e.target) && !br.contains(e.target)) br.classList.remove('open'); });
    _buscadorWireResultsClick(br, 'bimba', bi);
  }
}
document.addEventListener('adminShellLoaded', _buscadorInit);
