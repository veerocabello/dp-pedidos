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

/* ── PEDIDOS PROVEEDORES v2 ── */
// ── PEDIDOS PROVEEDORES v2 ──
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

// ── Guardado con merge real (evita que dos dispositivos editando pedidos a
// proveedores casi a la vez se pisen el cambio entero) — antes cada
// pp2Save*() hacía fb_savePP2() = un jset()/set() directo con la copia
// local completa de ese nodo, sin transacción. Con el auto-guardado cada
// 10s mientras el overlay está abierto (ver openPedidosProvOverlay) la
// ventana de colisión era aún mayor: si dos personas tenían el overlay
// abierto a la vez, el último guardado ganaba entero, borrando en silencio
// los cambios del otro. Mismo patrón ya usado en saveStockData()
// (stock-empleados.js) y saveMenu() (admin-config.js): se compara contra
// la última copia sincronizada de ESTE dispositivo para saber qué se tocó
// aquí de verdad, y solo eso se impone sobre lo que haya en el servidor —
// el resto se respeta tal cual esté (puede traer cambios de otro
// dispositivo). window._pp2SyncedSnapshots se resetea al abrir el overlay
// (con lo que ya hay en localStorage) y se actualiza tras cada guardado y
// cada vez que llega un cambio remoto — ver openPedidosProvOverlay().
window._pp2SyncedSnapshots = window._pp2SyncedSnapshots || {};
function pp2TransactSave(key, data) {
  if (!window.fb_transactJsonString) {
    if (window.fb_savePP2) window.fb_savePP2(key, data).catch(function (e) {
      console.warn('[proveedores] fallo al guardar "' + key + '" en Firebase:', e);
      if (typeof logActivity === 'function' && (!window._pp2LastFailAlert || Date.now() - window._pp2LastFailAlert > 120000)) {
        window._pp2LastFailAlert = Date.now();
        logActivity('⚠️ No se pudo guardar el pedido a proveedores en Firebase (sin conexión o sin permisos) — puede que solo exista en este dispositivo', { tipo: 'pp2_no_guardado' });
      }
    });
    return;
  }
  const antes = window._pp2SyncedSnapshots[key];
  window.fb_transactJsonString('pp2/' + key, function (remoto) {
    // Objetos planos por id (state/provHab/minimos): se fusiona clave a
    // clave — cada itemId que este dispositivo tocó desde la última
    // sincronización gana con su valor local, el resto se respeta tal
    // cual esté en el servidor.
    if (data && typeof data === 'object' && !Array.isArray(data) && (!remoto || (typeof remoto === 'object' && !Array.isArray(remoto)))) {
      const base = remoto || {};
      const antesObj = antes || {};
      const claves = new Set([...Object.keys(base), ...Object.keys(data)]);
      const merged = {};
      claves.forEach(function (k) {
        const valorLocal = data[k] !== undefined ? data[k] : null;
        const valorAntes = antesObj[k] !== undefined ? antesObj[k] : null;
        const tocadaAqui = JSON.stringify(valorLocal) !== JSON.stringify(valorAntes);
        merged[k] = (tocadaAqui || !(k in base)) ? data[k] : base[k];
      });
      return merged;
    }
    // Arrays (custom/hidden/historial/customProvs/order): no hay una
    // "clave" con la que fusionar campo a campo, así que se aplica la
    // regla más simple que sigue siendo real — si este dispositivo no ha
    // cambiado nada desde la última sincronización, se respeta lo que
    // haya en el servidor (puede venir de otro dispositivo); si sí ha
    // cambiado, gana el cambio local.
    if (remoto !== undefined && remoto !== null && JSON.stringify(data) === JSON.stringify(antes)) {
      return remoto;
    }
    return data;
  }).then(function (finalData) {
    if (finalData !== null && finalData !== undefined) {
      window._pp2SyncedSnapshots[key] = finalData;
    }
  }).catch(function (e) {
    console.warn('[proveedores] fallo al guardar "' + key + '" en Firebase:', e);
    // Antes el fallo solo quedaba en la consola — la pantalla seguía
    // actuando como si se hubiera sincronizado entre dispositivos cuando
    // puede que el cambio solo exista en ese móvil/tablet. Se avisa en
    // Alertas, con un margen de 2min entre avisos para no inundar el log
    // si se cae la conexión mientras el auto-guardado sigue reintentando
    // cada 10s.
    if (typeof logActivity === 'function' && (!window._pp2LastFailAlert || Date.now() - window._pp2LastFailAlert > 120000)) {
      window._pp2LastFailAlert = Date.now();
      logActivity('⚠️ No se pudo guardar el pedido a proveedores en Firebase (sin conexión o sin permisos) — puede que solo exista en este dispositivo', { tipo: 'pp2_no_guardado' });
    }
  });
}

// ── helpers ──────────────────────────────────────────────
function pp2LoadState() {
  try {
    return JSON.parse(localStorage.getItem(PP2_KEY) || '{}');
  } catch {
    return {};
  }
}
function pp2SaveState(s) {
  localStorage.setItem(PP2_KEY, JSON.stringify(s));
  if (window.fb_savePP2) {
    window._pp2LocalWrite = Date.now();
    pp2TransactSave('state', s);
  }
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
  if (window.fb_savePP2) pp2TransactSave('custom', a);
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
  if (window.fb_savePP2) pp2TransactSave('hidden', a);
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
  if (window.fb_savePP2) pp2TransactSave('provHab', o);
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
  if (window.fb_savePP2) pp2TransactSave('minimos', o);
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
  if (window.fb_savePP2) pp2TransactSave('customProvs', a);
}
function pp2AllProvs() {
  const custom = pp2LoadCustomProvs();
  return [...PP_PROVS, ...custom].sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
function pp2AllItems() {
  return pp2AllItemsOrdered();
}
// Único punto de emparejamiento entre un producto de proveedores y una
// línea del stock (dpf_stock_historial) — antes estaba copiado 3 veces con
// la misma lógica (una de ellas, esta función, sin usar por nadie). El
// emparejamiento por substring podía mostrar un stock incompleto: un
// producto compuesto como "Cuajada tomates" empareja por substring tanto
// con la línea de stock "Cuajada" como con "Tomates" (dos entradas
// distintas del catálogo de stock), y antes se quedaba con la primera que
// encontrara, mostrando esa cantidad como si fuera el stock completo del
// producto — ignorando la otra mitad. Ahora: si hay una línea con nombre
// EXACTO se usa esa directamente (inequívoca aunque otra línea distinta
// también la contenga como substring); si no, se buscan coincidencias por
// substring y solo se usa si hay una única línea distinta que encaje —
// con más de una, es ambiguo y no se muestra ningún badge (mejor no
// mostrar nada que un número incompleto con pinta de dato fiable).
function pp2StockBadge(itemId, nombre, stockLastLines, minimos) {
  const min = minimos[itemId] !== undefined ? parseInt(minimos[itemId]) : null;
  const itemName = nombre.toLowerCase();
  let exacta = null;
  const parciales = [];
  for (const line of stockLastLines) {
    const text = typeof line === 'string' ? line : line.label || line.name || line.ing || '';
    const colonIdx = text.indexOf(':');
    if (colonIdx < 0) continue;
    const lineName = text.slice(0, colonIdx).trim().toLowerCase();
    const lineVal = text.slice(colonIdx + 1).trim();
    if (lineName === itemName) {
      exacta = lineVal;
      break;
    }
    if (itemName.includes(lineName) || lineName.includes(itemName)) {
      if (!parciales.some(p => p.lineName === lineName)) parciales.push({ lineName, lineVal });
    }
  }
  const lineVal = exacta !== null ? exacta : (parciales.length === 1 ? parciales[0].lineVal : null);
  if (lineVal === null) return null;
  // Ingredientes de limpieza (checklist, no por cantidad): el equipo los
  // marca como "✅ … : HAY" / "❌ … : NO HAY" (stock-empleados.js). El
  // regex de cantidad de abajo solo reconoce dígitos al principio del
  // valor — "NO HAY" no empieza por dígito, así que qty se quedaba "sin
  // dato" y el badge nunca se marcaba como bajo: un "Lejía → NO HAY" real
  // se mostraba en verde con el texto literal "En tienda: NO HAY", justo
  // lo contrario de lo que debía comunicar.
  const upperVal = lineVal.toUpperCase();
  if (upperVal === 'NO HAY' || upperVal === 'HAY') {
    return { qty: upperVal, unit: '', bajo: upperVal === 'NO HAY', min: null };
  }
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

// Adjunta los listeners de touch-drag (reordenar arrastrando en móvil) al
// overlay — antes esto se hacía en código de nivel superior, con
// document.getElementById('pedidos-prov-overlay') ejecutado en el instante
// en que el bundle admin (js/app-admin.js) terminaba de cargar. El HTML del
// panel (admin-shell.html, que contiene el propio overlay) y ese bundle se
// piden en paralelo (ver loadAdminShell() en index.php) sin garantía de
// cuál termina antes — si el bundle ganaba la carrera, el overlay todavía
// no existía en el DOM, getElementById devolvía null, y los listeners de
// touch-drag no se llegaban a adjuntar NUNCA en toda esa sesión (sin
// ningún aviso ni forma de reintentar salvo recargar la página). Ahora se
// adjuntan aquí, dentro de openPedidosProvOverlay(), que solo se puede
// llamar una vez el overlay ya existe de verdad — con una marca en el
// propio elemento para no duplicar los listeners si se abre más de una vez.
function _pp2WireTouchDrag(overlayEl) {
  if (!overlayEl || overlayEl.dataset.pp2TouchWired) return;
  overlayEl.dataset.pp2TouchWired = '1';
  overlayEl.addEventListener('touchstart', _pp2TouchStartHandler, {
    passive: true
  });
  // touchmove necesita passive:false para poder llamar preventDefault durante drag
  overlayEl.addEventListener('touchmove', _pp2TouchMoveHandler, {
    passive: false
  });
  overlayEl.addEventListener('touchend', _pp2TouchEndHandler, {
    passive: true
  });
}

// ── overlay open/close ────────────────────────────────────
function openPedidosProvOverlay() {
  _pp2DeleteMode = false;
  _pp2DeleteSel = new Set();
  _pp2SearchQuery = '';
  const _ov = document.getElementById('pedidos-prov-overlay');
  _ov.style.display = 'block';
  _ov.scrollTop = 0;
  _pp2WireTouchDrag(_ov);
  document.body.style.overflow = 'hidden';
  // Punto de partida para el merge de pp2TransactSave — lo que este
  // dispositivo ya tiene sincronizado al abrir el overlay. Se actualiza de
  // nuevo en cuanto llega el primer snapshot real del listener (más abajo)
  // y tras cada guardado, así que esto es solo el arranque.
  window._pp2SyncedSnapshots = {
    state: pp2LoadState(),
    custom: pp2LoadCustom(),
    hidden: pp2LoadHidden(),
    provHab: pp2LoadProvHab(),
    minimos: pp2LoadMinimos(),
    historial: pp2LoadHistorial(),
    customProvs: pp2LoadCustomProvs(),
    order: pp2LoadOrder()
  };
  // Guardado automático en Firebase cada 10 segundos
  if (window._pp2AutoSaveInterval) clearInterval(window._pp2AutoSaveInterval);
  window._pp2AutoSaveInterval = setInterval(function() {
    const s = pp2LoadState();
    if (Object.keys(s).length > 0 && window.fb_savePP2) {
      pp2TransactSave('state', s);
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
      window._pp2Unsubscribe = window.fb_listenPP2((d) => {
        // Refrescar el punto de partida del merge con lo último que
        // confirma el servidor — así el próximo guardado de este
        // dispositivo compara contra datos reales, no contra lo que había
        // al abrir el overlay hace rato.
        if (d && typeof d === 'object') Object.assign(window._pp2SyncedSnapshots, d);
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

  // Función de badge con datos ya cargados (sin tocar localStorage) —
  // usa el emparejamiento compartido pp2StockBadge() (ver arriba).
  function _stockBadge(itemId, nombre) {
    return pp2StockBadge(itemId, nombre, stockLastLines, minimos);
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
      const stockBadge = stock !== null ? "<span data-stock-badge style=\"font-size:13px;font-weight:700;color:".concat(stock.bajo ? '#c0392b' : '#27855a', ";background:").concat(stock.bajo ? '#fdf0ee' : '#eafaf1', ";border:1.5px solid ").concat(stock.bajo ? '#e74c3c' : '#a9dfbf', ";border-radius:8px;padding:2px 10px;white-space:nowrap;flex-shrink:0\">\n                  ").concat(stock.bajo ? '⚠️ ' : '', "En tienda: ").concat(stock.qty).concat(stock.unit ? ' ' + stock.unit : '').concat(stock.min !== null ? ' (mín. ' + stock.min + ')' : '', "\n                 </span>") : '';

      // Botón proveedor: si es habitual lo distinguimos visualmente
      const provBtnStyle = prov ? isHabitual ? "border:1.5px dashed #3D1F0D;background:rgba(244,196,48,0.08);color:#3D1F0D" : "border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D" : "border:1.5px solid #F5E6C8;background:#FFFFFF;color:#8A6A4E";
      return "<div class=\"pp2-row\" id=\"pp2-row-".concat(item.id, "\" data-id=\"").concat(item.id, "\" data-cat=\"").concat(cat.replace(/"/g, '&quot;'), "\"\n                draggable=\"true\"\n                ondragstart=\"pp2DragStart(event)\"\n                ondragover=\"pp2DragOver(event)\"\n                ondrop=\"pp2Drop(event)\"\n                ondragend=\"pp2DragEnd(event)\"\n                ondragleave=\"this.style.background=''\"\n                style=\"display:flex;align-items:center;background:").concat(bg, ";border:2px solid ").concat(border, ";border-radius:12px;padding:11px 14px;margin-bottom:8px;cursor:default\">\n              ").concat(delCb, "\n              <span style=\"font-size:18px;color:#8A6A4E;cursor:grab;padding:0 2px;flex-shrink:0;user-select:none;touch-action:none\" title=\"Arrastrar\">\u283F</span>\n              <div style=\"flex:1;min-width:0\">\n                <div style=\"display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap\">\n                  <span style=\"font-size:15px;font-weight:600;color:#3D1F0D\">").concat(item.nombre, "</span>\n                  ").concat(stockBadge, "\n                </div>\n                <div style=\"display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap\">\n                  ").concat(fixedUnit ? "<span style=\"padding:3px 9px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif\">".concat(fixedUnit.charAt(0).toUpperCase() + fixedUnit.slice(1), "</span>") : "<button data-unit=\"cajas\" onclick=\"pp2SetUnit('".concat(item.id, "','cajas')\"\n                        style=\"padding:3px 9px;border-radius:6px;border:1.5px solid ").concat(unit === 'cajas' ? '#3D1F0D' : '#F5E6C8', ";background:").concat(unit === 'cajas' ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(unit === 'cajas' ? '#3D1F0D' : '#8A6A4E', ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n                        &#x1F4E6; Cajas\n                      </button>\n                      <button data-unit=\"unidades\" onclick=\"pp2SetUnit('").concat(item.id, "','unidades')\"\n                        style=\"padding:3px 9px;border-radius:6px;border:1.5px solid ").concat(unit === 'unidades' ? '#3D1F0D' : '#F5E6C8', ";background:").concat(unit === 'unidades' ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(unit === 'unidades' ? '#3D1F0D' : '#8A6A4E', ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n                        &#x1F522; Unidades\n                      </button>"), "\n                </div>\n              </div>\n              <div style=\"display:flex;align-items:center;gap:4px;flex-shrink:0\">\n                <button onclick=\"pp2Qty('").concat(item.id, "',-1)\" style=\"width:34px;height:34px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:20px;font-weight:700;cursor:pointer;color:#3D1F0D\">&#x2212;</button>\n                <span data-qty style=\"font-size:18px;font-weight:900;color:#3D1F0D;min-width:24px;text-align:center\">").concat(qty || '', "</span>\n                <button onclick=\"pp2Qty('").concat(item.id, "',1)\" style=\"width:34px;height:34px;border-radius:50%;border:none;background:#3D1F0D;font-size:20px;font-weight:700;cursor:pointer;color:#fff\">+</button>\n              </div>\n              <button data-prov-btn onclick=\"pp2PickerOpen('").concat(item.id, "')\"\n                style=\"flex-shrink:0;padding:5px 10px;border-radius:8px;").concat(provBtnStyle, ";font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis\">\n                ").concat(prov ? provLabel : '+ Prov.', "\n              </button>\n            </div>");
    }).join('');
    return "<div style=\"margin-bottom:4px\">\n            <div style=\"font-family:'Anton',sans-serif;font-size:18px;color:#3D1F0D;margin:14px 0 8px;padding-bottom:6px;border-bottom:2px solid rgba(244,196,48,0.4);display:flex;align-items:center;gap:8px;letter-spacing:0.03em\">".concat(cat, "</div>\n            ").concat(rows, "\n          </div>");
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
  // Emparejamiento compartido pp2StockBadge() (ver arriba) — antes era una
  // tercera copia de la misma lógica.
  const stock = pp2StockBadge(id, item.nombre, stockLastLinesRow, minimosCached);
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
  const s = pp2LoadState();
  if (!s[id]) s[id] = {};
  s[id].qty = Math.max(0, (s[id].qty || 0) + delta);
  pp2SaveState(s);
  pp2RenderRow(id);
}
function pp2SetUnit(id, unit) {
  const s = pp2LoadState();
  if (!s[id]) s[id] = {};
  s[id].unit = unit;
  pp2SaveState(s);
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
    return "<button onclick=\"pp2PickerSelect('".concat(p.id, "')\"\n            style=\"padding:8px 14px;border-radius:10px;border:2px solid ").concat(isSelected ? '#3D1F0D' : isHab ? '#3D1F0D' : '#F5E6C8', ";background:").concat(isSelected ? 'rgba(244,196,48,0.08)' : '#FFFFFF', ";color:").concat(isSelected ? '#3D1F0D' : '#2A1506', ";font-size:13px;font-weight:").concat(isSelected ? '700' : '500', ";cursor:pointer;font-family:'DM Sans',sans-serif;position:relative\">\n            ").concat(p.label).concat(isHab ? ' <span style="font-size:9px;vertical-align:super;color:#3D1F0D">habitual</span>' : '', "\n          </button>");
  }).join('') + "<button onclick=\"pp2NuevoProveedorModal()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #27855a;background:#eafaf1;color:#27855a;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x2795; Nuevo proveedor\n        </button>\n        <button onclick=\"pp2EliminarProveedorModal()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #c0392b;background:#fdf0ee;color:#c0392b;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x1F5D1; Eliminar proveedor\n        </button>" + "<button onclick=\"pp2PickerClose()\"\n          style=\"padding:8px 14px;border-radius:10px;border:2px solid #ccc;background:#f5f5f5;color:#888;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif\">\n          &#x2715; Salir\n        </button>";
  const picker = document.getElementById('pp2-picker');
  picker.style.display = 'flex';
}
function pp2PickerSelect(provId) {
  const s = pp2LoadState();
  if (!s[_pp2CurrentItem]) s[_pp2CurrentItem] = {};
  s[_pp2CurrentItem].prov = provId;
  pp2SaveState(s);
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
  const s = pp2LoadState();
  const hab = pp2LoadProvHab();
  // Limpiar cantidades y proveedores del estado; los habituales se aplican en render
  Object.keys(s).forEach(id => {
    s[id].qty = 0;
    s[id].prov = '';
    s[id].unit = s[id].unit || 'cajas';
  });
  pp2SaveState(s);
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
  const hist = pp2LoadHistorial();
  hist.push(entrada); // más antiguo primero, más reciente al final
  if (hist.length > 50) hist.shift(); // máximo 50 entradas
  localStorage.setItem(PP2_HISTORIAL_KEY, JSON.stringify(hist));
  // El historial es un log — no vale el merge genérico de pp2TransactSave
  // (que solo sabe "gana el local o gana el remoto entero"): si dos
  // dispositivos guardan un pedido casi a la vez, con eso solo se quedaría
  // la entrada del que escriba último, perdiendo en silencio la del otro.
  // Aquí se añade la entrada nueva DENTRO de la propia transacción, sobre
  // el array más reciente que tenga el servidor en cada reintento — así
  // ambas entradas quedan, sea cual sea el orden real de guardado.
  if (window.fb_transactJsonString) {
    window.fb_transactJsonString('pp2/historial', function (remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      arr.push(entrada);
      if (arr.length > 50) arr.shift();
      return arr;
    }).then(function (finalData) {
      if (finalData) {
        window._pp2SyncedSnapshots.historial = finalData;
        localStorage.setItem(PP2_HISTORIAL_KEY, JSON.stringify(finalData));
      }
    }).catch(function (e) {
      console.warn('[proveedores] fallo al guardar "historial" en Firebase:', e);
      if (typeof logActivity === 'function' && (!window._pp2LastFailAlert || Date.now() - window._pp2LastFailAlert > 120000)) {
        window._pp2LastFailAlert = Date.now();
        logActivity('⚠️ No se pudo guardar el pedido a proveedores en Firebase (sin conexión o sin permisos) — puede que solo exista en este dispositivo', { tipo: 'pp2_no_guardado' });
      }
    });
  } else if (window.fb_savePP2) {
    window.fb_savePP2('historial', hist).catch(function (e) {
      console.warn('[proveedores] fallo al guardar "historial" en Firebase:', e);
      if (typeof logActivity === 'function' && (!window._pp2LastFailAlert || Date.now() - window._pp2LastFailAlert > 120000)) {
        window._pp2LastFailAlert = Date.now();
        logActivity('⚠️ No se pudo guardar el pedido a proveedores en Firebase (sin conexión o sin permisos) — puede que solo exista en este dispositivo', { tipo: 'pp2_no_guardado' });
      }
    });
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
    list.innerHTML = hist.map((h, i) => "\n            <div style=\"border:1.5px solid #F5E6C8;border-radius:10px;padding:12px;margin-bottom:10px;background:#FFFFFF\">\n              <div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap\">\n                <span style=\"font-size:17px;font-weight:900;color:#3D1F0D\">\uD83D\uDCE6 ".concat(h.fecha, "</span>\n                <div style=\"display:flex\">\n                  <button onclick=\"pp2HistDescargar(").concat(i, ")\" style=\"font-size:11px;padding:3px 8px;background:#FFFFFF;color:#3D1F0D;border:1.5px solid #F5E6C8;border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif\">\uD83D\uDCBE</button>\n                  <button onclick=\"pp2HistRecargar(").concat(i, ")\" style=\"font-size:11px;padding:3px 10px;background:rgba(244,196,48,0.08);color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif\">Usar de base</button>\n                </div>\n              </div>\n              <pre style=\"font-size:12px;color:#2A1506;white-space:pre-wrap;margin:0;line-height:1.5;font-family:'DM Sans',sans-serif\">").concat(h.nota, "</pre>\n            </div>")).join('');
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
    return "<div style=\"display:flex;align-items:center;padding:7px 0;border-bottom:1px solid #F5E6C8\">\n            <span style=\"flex:1;font-size:13px;font-weight:600;color:#3D1F0D\">".concat(item.nombre, "</span>\n            <input type=\"number\" min=\"0\" value=\"").concat(val, "\" placeholder=\"\u2014\"\n              onchange=\"pp2SetMinimo('").concat(item.id, "',this.value)\"\n              style=\"width:64px;padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-align:center;outline:none;background:#FFFFFF\">\n          </div>");
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
// Antes descartaba en silencio cualquier producto con cantidad pero sin
// proveedor asignado (if (!s.prov) return;) — un pedido a mitad de rellenar
// podía enviarse por WhatsApp incompleto sin que nadie se enterase. Ahora
// agrupa esos productos bajo "SIN PROVEEDOR", igual que ya hacía pp2Save()
// (el botón "💾 Guardar"), para que al menos se vean en la nota en vez de
// desaparecer.
function pp2BuildNota() {
  const state = pp2LoadState();
  const items = pp2AllItems();
  const allProvs = pp2AllProvs();
  const byProv = {};
  items.forEach(item => {
    const s = state[item.id] || {};
    if (!s.qty || s.qty <= 0) return;
    const prov = s.prov || '__sin__';
    if (!byProv[prov]) byProv[prov] = [];
    byProv[prov].push(item);
  });
  if (!Object.keys(byProv).length) return null;
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
  return txt.trim();
}
function pp2SaveToPad() {
  const txt = pp2BuildNota();
  if (!txt) {
    alert('No hay cantidades para enviar');
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
    alert('No hay cantidades para enviar');
    return;
  }
  // Antes solo el botón separado "💾 Guardar" (pp2Save) guardaba en el
  // historial — este botón, el que de verdad envía el pedido por WhatsApp,
  // nunca lo hacía. Si el flujo habitual era ir directo a WhatsApp sin
  // pasar por "Guardar", ningún pedido quedaba registrado para "usar de
  // base" en semanas futuras, aunque el propio historial vacío prometía
  // justo eso.
  pp2GuardarEnHistorial(txt);
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
  if (window.fb_savePP2) pp2TransactSave('order', ids);
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

// Adjuntar los listeners de touch-drag al overlay (ver _pp2WireTouchDrag(),
// llamado desde openPedidosProvOverlay() — no aquí arriba, ver el porqué en
// el comentario de esa función).
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


// ── ANTI-SPAM / BLACKLIST — PANEL DE ADMIN ───────────────────────────────
// BLACKLIST_KEY, ANTISPAM_KEY, getBlacklist, saveBlacklistLocal y
// getAntiSpamCfg viven en nucleo-compartido.js (bundle de cliente): el
// propio checkout (carrito-checkout.js) los usa para bloquear pedidos de
// números en la lista negra o que superen el límite anti-spam. Aquí solo
// queda la UI de admin para gestionar esa lista y esa configuración.

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
    list.innerHTML = stats.orders.map(o => "\n      <div style=\"display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n        <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n        <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n        ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">🕐 ".concat(escapeHtml(o.slot), "</span>") : '', "\n        <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n        <span style=\"font-weight:700;color:#3D1F0D\">").concat(o.total.toFixed(2).replace('.', ','), " €</span>\n        <button onclick=\"printOrderFromStats('").concat(escapeAttr(o.num), "','").concat(escapeAttr(o.name), "','").concat(escapeAttr(o.time), "',").concat(parseFloat(o.total), ",'").concat(escapeAttr(o.slot || ''), "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#3D1F0D\">🖨️</button>\n      </div>")).join('');
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
async function cancelarPedidoAdmin(orderNum, phone) {
  if (!confirm("\xBFCancelar el pedido ".concat(orderNum, "? Se eliminar\xE1 de estad\xEDsticas y cocina."))) return;
  const ok = await _borrarPedidoDeFirebase(orderNum, phone);
  if (!ok) {
    alert('No se pudo cancelar el pedido ' + orderNum + ' en el servidor (revisa la conexión) — sigue activo, inténtalo de nuevo.');
    return;
  }
  // Igual que marcar "Entregado"/"Listo" (ver setLiveStatus en
  // pedidos-vivo-cocina.js), cancelar debe contar como "ya visto" para la
  // alarma de "pedido nuevo" — si no, cancelar un pedido que aún no se
  // había atendido dejaba la alarma sonando para siempre, sin nada
  // pendiente real que la pare.
  if (typeof _marcarPedidoAtendido === 'function') _marcarPedidoAtendido(orderNum);
  logActivity("❌ Pedido ".concat(orderNum, " cancelado manualmente desde el panel"));
}

// ── GESTIÓN DE TURNOS ADMIN ──
function loadSlotTurnosUI() {
  const turnos = getSlotTurnos();
  const maxVal = getSlotMax();
  // Hay dos campos con el mismo valor en dos sitios distintos del panel
  // (Turnos y Configuración) — los dos se sincronizan aquí para que
  // ninguno se quede mostrando un número antiguo.
  const inp = document.getElementById('slot-max-input');
  if (inp) inp.value = maxVal;
  const inpCfg = document.getElementById('slot-max-input-cfg');
  if (inpCfg) inpCfg.value = maxVal;
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
  const localTurnos = getSlotTurnos();
  const original = localTurnos[idx];
  if (original) {
    const next = Object.assign({}, original, { [field]: value });
    // Un turno con inicio y fin iguales queda vacío (0 min) sin avisar — no
    // es el cruce de medianoche normal (end <= start), que sí es válido y
    // ya está contemplado donde se aplican los turnos (carrito-checkout.js).
    if ((field === 'start' || field === 'end') && next.start === next.end) {
      alert('La hora de inicio y la de fin de un turno no pueden ser iguales.');
      renderSlotTurnosList(localTurnos); // revertir el <input> visualmente
      return;
    }
  }
  _mutateSlotTurnos(function (t) {
    // Si la lista que ve esta llamada (tras un posible reintento de la
    // transacción, con la más reciente de otro dispositivo) ya no tiene
    // este turno en la misma posición porque alguien añadió/quitó/reordenó
    // turnos justo antes, se busca por su contenido exacto capturado al
    // pulsar, en vez de fiarse ciegamente del índice — evita modificar en
    // silencio un turno distinto al que el admin tenía delante.
    let target = idx;
    if (original && !(t[idx] && t[idx].start === original.start && t[idx].end === original.end && t[idx].interval === original.interval)) {
      const found = t.findIndex(x => x.start === original.start && x.end === original.end && x.interval === original.interval);
      if (found >= 0) target = found;
    }
    if (t[target]) t[target][field] = value;
  });
}
function saveSlotConfig(inputId) {
  // El panel de Configuración tiene su propio campo (slot-max-input-cfg),
  // aparte del de Turnos (slot-max-input) — antes esto SIEMPRE leía
  // slot-max-input pasara lo que pasara, así que cambiar el número desde
  // Configuración y pulsar Guardar no hacía nada (guardaba el valor del
  // OTRO campo, que ni se molestaba en mostrar el número real). Ahora cada
  // botón dice qué campo es el suyo.
  const maxInp = document.getElementById(inputId || 'slot-max-input');
  const max = parseInt(maxInp ? maxInp.value : '4', 10);
  if (isNaN(max) || max < 1) {
    alert('El número de pedidos por turno debe ser al menos 1');
    return;
  }
  localStorage.setItem(SLOT_MAX_KEY, max);
  SLOT_MAX = max;
  // Refleja el nuevo valor también en el otro campo, para que no se quede
  // mostrando el número antiguo si el admin va a esa otra sección después.
  ['slot-max-input', 'slot-max-input-cfg'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = max;
  });
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
//  BLOQUEAR CATEGORÍAS — parte de admin (elegir qué se bloquea). Aplicar
//  el bloqueo guardado al cargar la página (getBlockedCats/initCatBlocks)
//  vive en nucleo-compartido.js, porque eso lo necesita cualquier visitante.
// ══════════════════════════════════════════
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
async function toggleCatBlock(cat) {
  const blocked = getBlockedCats();
  const idx = blocked.indexOf(cat);
  const willBlock = idx < 0;
  if (willBlock) blocked.push(cat); else blocked.splice(idx, 1);
  saveBlockedCats(blocked);

  // Antes esto igualaba item.hidden al estado de la categoría para TODOS
  // sus productos en los dos sentidos — al desbloquear, eso revivía en
  // Firebase productos que el admin había ocultado a mano dentro de esa
  // categoría (ej. "Patatas Trufadas" fuera de temporada): el siguiente
  // guardado de cualquier otro producto detectaba ese hidden:false como
  // un cambio legítimo y lo publicaba. Ahora se recuerda (sincronizado
  // entre dispositivos con la misma transacción atómica que ya usa este
  // archivo para turnos/promos) qué productos de la categoría ya estaban
  // ocultos ANTES de bloquearla, para devolverles su estado real al
  // desbloquear en vez de mostrarlos a todos sin más.
  if (willBlock) {
    const yaOcultosIds = MENU.filter(item => item.cat === cat && item.hidden).map(item => item.id);
    if (window.fb_transactJsonString) {
      window.fb_transactJsonString('config/catBlockPrevHidden', current => {
        const mapa = (current && typeof current === 'object') ? current : {};
        mapa[cat] = yaOcultosIds;
        return mapa;
      }).catch(e => console.warn('[catBlock] no se pudo guardar el estado previo', e));
    }
    MENU.forEach(item => { if (item.cat === cat) item.hidden = true; });
  } else {
    let prevHiddenIds = [];
    if (window.fb_transactJsonString) {
      try {
        await window.fb_transactJsonString('config/catBlockPrevHidden', current => {
          const mapa = (current && typeof current === 'object') ? current : {};
          prevHiddenIds = Array.isArray(mapa[cat]) ? mapa[cat] : [];
          delete mapa[cat];
          return mapa;
        });
      } catch (e) { console.warn('[catBlock] no se pudo leer el estado previo', e); }
    }
    const prevHiddenSet = new Set(prevHiddenIds);
    MENU.forEach(item => { if (item.cat === cat) item.hidden = prevHiddenSet.has(item.id); });
  }

  loadCatBlockUI();
  renderMenu();
  logActivity((willBlock ? '🚫' : '✅') + ' Categoría ' + (willBlock ? 'bloqueada' : 'desbloqueada') + ': ' + cat);
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
  // window._ultimoResumenDia queda disponible para imprimirResumenDiaTermico()
  // (impresora-termica.js) — así el botón de imprimir no tiene que volver a
  // pedir las estadísticas ni escapar nombres de producto dentro de un
  // atributo onclick, solo lee esta misma copia que ya se pintó en pantalla.
  window._ultimoResumenDia = { fecha: todayKey, pedidos, total, topSorted };
  const resumenEl = document.getElementById('fin-noche-resumen');
  if (resumenEl) {
    resumenEl.style.display = 'block';
    resumenEl.innerHTML = '<div style="font-size:15px;font-weight:900;margin-bottom:8px">📊 Resumen del día ' + todayKey + '</div>' + '<div>🧾 Pedidos: <strong>' + pedidos + '</strong></div>' + '<div>💶 Total recaudado: <strong>' + total + ' €</strong></div>' + (topSorted.length ? '<div style="margin-top:6px">🏆 Top productos:<br>' + topSorted.map((e, i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') + ' ' + e[0] + ' (' + e[1] + ')').join('<br>') + '</div>' : '') + '<div style="margin-top:8px;font-size:11px;opacity:.7">Turnos reseteados · Pedidos pausados · Datos archivados ✅</div>' + '<button onclick="imprimirResumenDiaTermico()" style="margin-top:10px;width:100%;padding:9px;background:var(--brown);color:var(--cream);border:none;border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:13px;font-weight:700;cursor:pointer">🖨️ Imprimir resumen</button>';
  }
  logActivity('🌙 Fin de noche activado — ' + pedidos + ' pedidos · ' + total + ' €');
  showToast('local-toast');
}
// Acceso por teclado bimba desactivado — usar URL ?bimba=TOKEN

// (Antes había aquí un sistema de "contraseña de administración" propio,
// con su hash en localStorage/Firebase y un botón "Cambiar contraseña" en
// el panel — se ha quitado por completo: no protegía nada de verdad desde
// que el acceso admin real pasó a Firebase Auth (checkAdminPwd() en
// slots-alertas.js, vía window.fb_adminLogin), así que "cambiar" esa
// contraseña le daba al admin una confirmación falsa de que había
// cambiado algo, sin tocar su credencial real. Ver también admin-config.js
// (changePwd) y admin-shell.html (sección #admin-pwd).)

// ── CÓDIGOS DE DESCUENTO — crear/eliminar/buscar (solo admin). Aplicar un
// código al pedir (dcAplicar/getDiscountAmount/_activeDiscount) vive en
// nucleo-compartido.js, porque eso lo hace cualquier cliente. ──
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
  const ahoraMs = Date.now();
  el.innerHTML = keys.map(code => {
    const d = discounts[code];
    const remaining = d.maxUses - (d.uses || 0);
    const caducidadTxt = d.expiraEn
      ? (d.expiraEn < ahoraMs ? ' · <span style="color:#c0392b;font-weight:700">caducado</span>' : ' · caduca ' + new Date(d.expiraEn).toLocaleDateString('es-ES'))
      : '';
    return '<div id="dc-row-' + escapeAttr(code) + '" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap;gap:6px">'
      + '<div><strong style="color:#3D1F0D">' + escapeHtml(code) + '</strong>'
      + ' <span style="background:rgba(244,196,48,0.08);color:#3D1F0D;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">' + d.pct + '%</span>'
      + ' <span style="font-size:11px;color:#8A6A4E">' + (d.uses||0) + '/' + d.maxUses + ' usos · ' + remaining + ' restantes' + caducidadTxt + '</span></div>'
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
  const diasEl = document.getElementById('dc-dias');
  const dias = diasEl && diasEl.value ? parseInt(diasEl.value) : null;
  if (!code) { alert('Introduce un código'); return; }
  if (!pct || pct < 1 || pct > 100) { alert('Introduce un % válido (1-100)'); return; }
  if (!maxUses || maxUses < 1) { alert('Introduce un número de usos'); return; }
  if (dias !== null && (isNaN(dias) || dias < 1)) { alert('Los días de caducidad deben ser 1 o más (o déjalo en blanco)'); return; }
  if (!window.fb_transactNative) { alert('Firebase no disponible'); return; }
  // Aviso previo, no atómico — solo UX para que el admin vea de un vistazo
  // que el código ya existe y pueda cancelar sin más. La protección real
  // pasa por la transacción de abajo, así que da igual si esto queda
  // desfasado entre el aviso y el guardado.
  if (window.fb_loadDiscounts) {
    const existentes = await window.fb_loadDiscounts().catch(() => ({}));
    if (existentes && existentes[code]) {
      const yaExiste = existentes[code];
      if (yaExiste.origen) {
        alert('Ese código ya existe como premio de la Ruleta/Rasca de un cliente — no se puede reutilizar.');
        return;
      }
      if (!confirm('Ya existe un código "' + code + '" (' + (yaExiste.uses || 0) + '/' + yaExiste.maxUses + ' usos). Crearlo de nuevo lo sobrescribe y resetea el contador de usos a 0. ¿Continuar?')) {
        return;
      }
    }
  }
  const datos = { pct, maxUses, uses: 0, createdAt: Date.now() };
  if (dias !== null) datos.expiraEn = Date.now() + dias * 24 * 60 * 60 * 1000;
  // Comprobación real y escritura en UNA sola transacción atómica de
  // Firebase sobre discounts/<code> — antes se leía por separado con
  // fb_loadDiscounts y se escribía después con un jset() plano (fb_saveDiscount),
  // sin nada que impidiera que dos admins creando casi a la vez el mismo
  // código, o un código que justo se generó como premio de la Ruleta/Rasca
  // de un cliente, se pisaran: ninguna de las dos escrituras veía la otra.
  // El mutator de abajo corre dentro de la transacción (Firebase lo
  // reintenta con el valor más reciente del servidor si hace falta) y
  // nunca sobrescribe un premio real de cliente, pase lo que pase con el
  // aviso de arriba.
  const result = await window.fb_transactNative('discounts/' + code, function (current) {
    if (current && current.origen) return; // aborta la transacción: es un premio real, nunca se pisa
    return datos;
  });
  if (!result) {
    alert('No se pudo crear: justo se ha generado ese código como premio de un cliente. Prueba con otro código.');
    return;
  }
  document.getElementById('dc-code').value = '';
  document.getElementById('dc-pct').value = '';
  document.getElementById('dc-uses').value = '';
  if (diasEl) diasEl.value = '';
  logActivity('🎁 Código de descuento creado: ' + code + ' (' + pct + '%, ' + maxUses + ' usos' + (dias !== null ? ', caduca en ' + dias + ' días' : '') + ')');
  dcCargar();
}

async function dcEliminar(code) {
  if (!confirm('¿Eliminar el código ' + code + '?')) return;
  if (window.fb_deleteDiscount) await window.fb_deleteDiscount(code);
  logActivity('🗑️ Código de descuento eliminado: ' + code);
  dcCargar();
}

// ── PROMOCIONES — panel admin (crear/editar/borrar/ocultar). El cliente
// las ve y las añade al carrito desde la carta (promosLoad/renderPromos/
// promoAddToCart, en nucleo-compartido.js — PROMOS_KEY/promosLoad/promosSave
// también viven ahí, se reutilizan aquí tal cual). Igual que la carta y los
// empleados, config/promos se guarda con fb_transactJsonString en vez de un
// set() a pelo, para que dos admins editando promos casi a la vez no se
// pisen el cambio entero.
function bimbaRenderPromos() {
  const el = document.getElementById('bimba-promos-lista');
  if (!el) return;
  const promos = promosLoad();
  if (!promos.length) { el.innerHTML = '<span style="color:#8A6A4E;font-size:13px">Sin promociones creadas todavía</span>'; return; }
  el.innerHTML = promos.map(function(p) {
    const precioTachado = p.precioAntes ? '<span style="text-decoration:line-through;color:#8A6A4E;margin-right:4px">' + parseFloat(p.precioAntes).toFixed(2) + ' €</span>' : '';
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:140px"><strong style="color:#3D1F0D">' + escapeHtml(p.nombre) + '</strong>'
      + ' <span style="font-size:12px;color:#8A6A4E">' + precioTachado + parseFloat(p.precio).toFixed(2) + ' €</span>'
      + (p.visible === false ? ' <span style="font-size:11px;color:#c0392b;font-weight:700">(oculta)</span>' : '') + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoToggleVisible(this.dataset.id)" style="padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;background:' + (p.visible === false ? '#aaa' : '#5ECC76') + ';color:#fff">' + (p.visible === false ? 'Oculta' : 'Visible') + '</button>'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoEditar(this.dataset.id)" style="padding:4px 10px;background:rgba(244,196,48,0.08);color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">✏️ Editar</button>'
      + '<button data-id="' + escapeAttr(p.id) + '" onclick="bimbaPromoEliminar(this.dataset.id)" style="padding:4px 10px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">🗑️</button>'
      + '</div></div>';
  }).join('');
}

function bimbaPromoNueva() {
  document.getElementById('bimba-promo-edit-id').value = '';
  document.getElementById('bimba-promo-nombre').value = '';
  document.getElementById('bimba-promo-desc').value = '';
  document.getElementById('bimba-promo-precio').value = '';
  document.getElementById('bimba-promo-antes').value = '';
  document.getElementById('bimba-promo-queso').checked = false;
  document.getElementById('bimba-promo-gratinado').checked = false;
  document.getElementById('bimba-promo-nota').checked = false;
  const activaEl = document.getElementById('bimba-promo-activa');
  if (activaEl) activaEl.checked = true;
  document.getElementById('bimba-promo-form').style.display = 'block';
}

function bimbaPromoEditar(id) {
  const p = promosLoad().find(function(x) { return x.id === id; });
  if (!p) return;
  document.getElementById('bimba-promo-edit-id').value = p.id;
  document.getElementById('bimba-promo-nombre').value = p.nombre;
  document.getElementById('bimba-promo-desc').value = p.descripcion || '';
  document.getElementById('bimba-promo-precio').value = p.precio;
  document.getElementById('bimba-promo-antes').value = p.precioAntes || '';
  document.getElementById('bimba-promo-queso').checked = !!p.opcionQueso;
  document.getElementById('bimba-promo-gratinado').checked = !!p.opcionGratinado;
  document.getElementById('bimba-promo-nota').checked = !!p.permiteNota;
  const activaEl = document.getElementById('bimba-promo-activa');
  if (activaEl) activaEl.checked = p.visible !== false;
  document.getElementById('bimba-promo-form').style.display = 'block';
}

async function bimbaGuardarPromo() {
  const idEl = document.getElementById('bimba-promo-edit-id');
  const nombre = (document.getElementById('bimba-promo-nombre').value || '').trim();
  const descripcion = (document.getElementById('bimba-promo-desc').value || '').trim();
  const precio = parseFloat(document.getElementById('bimba-promo-precio').value);
  const antesEl = document.getElementById('bimba-promo-antes');
  const precioAntes = antesEl && antesEl.value !== '' ? parseFloat(antesEl.value) : null;
  const opcionQueso = document.getElementById('bimba-promo-queso').checked;
  const opcionGratinado = document.getElementById('bimba-promo-gratinado').checked;
  const permiteNota = document.getElementById('bimba-promo-nota').checked;
  const activaEl = document.getElementById('bimba-promo-activa');
  const visible = activaEl ? activaEl.checked : true;
  if (!nombre) { alert('Introduce un nombre para la promoción'); return; }
  if (isNaN(precio) || precio < 0) { alert('Introduce un precio válido (0 o más)'); return; }
  if (precioAntes !== null && (isNaN(precioAntes) || precioAntes <= precio)) { alert('El precio tachado debe ser mayor que el precio de la promoción'); return; }
  if (!window.fb_transactJsonString) { alert('Firebase no disponible — no se puede guardar'); return; }
  const id = idEl.value || ('promo_' + Date.now());
  const esNueva = !idEl.value;
  const datosPromo = { id, nombre, descripcion, precio, precioAntes, opcionQueso, opcionGratinado, permiteNota, visible };
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      const idx = arr.findIndex(function(x) { return x.id === id; });
      if (idx >= 0) arr[idx] = datosPromo; else arr.push(datosPromo);
      return arr;
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || [datosPromo]));
    renderPromos();
    bimbaRenderPromos();
    document.getElementById('bimba-promo-form').style.display = 'none';
    logActivity((esNueva ? '🔥 Promoción creada: ' : '✏️ Promoción editada: ') + nombre);
  } catch (e) {
    console.warn('[bimbaGuardarPromo] fallo al guardar en Firebase:', e);
    alert('No se ha podido guardar la promoción (revisa la conexión). Vuelve a intentarlo.');
  }
}

async function bimbaPromoEliminar(id) {
  const p = promosLoad().find(function(x) { return x.id === id; });
  if (!p) return;
  if (!confirm('¿Eliminar la promoción "' + p.nombre + '"? Esto no afecta a los pedidos ya hechos con ella.')) return;
  if (!window.fb_transactJsonString) { alert('Firebase no disponible'); return; }
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      return arr.filter(function(x) { return x.id !== id; });
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || []));
    renderPromos();
    bimbaRenderPromos();
    logActivity('🗑️ Promoción eliminada: ' + p.nombre);
  } catch (e) {
    console.warn('[bimbaPromoEliminar] fallo al eliminar en Firebase:', e);
    alert('No se ha podido eliminar (revisa la conexión).');
  }
}

async function bimbaPromoToggleVisible(id) {
  if (!window.fb_transactJsonString) { alert('Firebase no disponible'); return; }
  try {
    const finalArr = await window.fb_transactJsonString('config/promos', function(remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : [];
      const idx = arr.findIndex(function(x) { return x.id === id; });
      if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], { visible: arr[idx].visible === false });
      return arr;
    });
    localStorage.setItem(PROMOS_KEY, JSON.stringify(finalArr || []));
    renderPromos();
    bimbaRenderPromos();
  } catch (e) {
    console.warn('[bimbaPromoToggleVisible] fallo al guardar en Firebase:', e);
    alert('No se ha podido cambiar la visibilidad (revisa la conexión).');
  }
}

// ── OFERTA RELÁMPAGO — panel admin (lanzar/cancelar/ver estado). El
// listener que hace que el cliente vea el banner/precio rebajado en vivo
// (loadOfertaRelampagoFromFirebase) vive en nucleo-compartido.js — ver el
// comentario ahí para el porqué. No hay campo "activa" separado: está
// vigente mientras Date.now() < fin, igual en el cliente (ver
// _actualizarOfertaRelampago en carta.js) y en el servidor
// (comprobarTotalSospechoso en guardar-pedido.php, con su propio reloj) —
// así que cancelarla es simplemente borrar el nodo entero de Firebase, sin
// riesgo de que quede un "activa:true" residual desincronizado del "fin".
let _orTickInterval = null;

function orPoblarSelectorProductos() {
  const cont = document.getElementById('or-producto-lista');
  if (!cont || cont.children.length > 0) return; // ya poblado
  // Solo productos "simples" (cantidad directa en el carrito) — las
  // Patatas Al Gusto/Bomba y los extras se gestionan aparte (custCart/
  // extrasCart) y no pasan por el precio base de MENU al calcular el
  // carrito, así que un descuento aquí no llegaría a reflejarse en ellos.
  const productos = MENU.filter(function (i) {
    return i.id !== 15 && i.id !== 16 && !(typeof ALL_EXTRAS_IDS !== 'undefined' && ALL_EXTRAS_IDS.has(i.id)) && !(typeof CHEDDAR_ID !== 'undefined' && i.id === CHEDDAR_ID) && !(typeof BONIATO_BACON_ID !== 'undefined' && i.id === BONIATO_BACON_ID);
  });
  // Agrupados por categoría (mismo orden en que aparecen en la carta), con
  // una casilla por producto — se puede marcar más de uno a la vez.
  let html = '';
  let lastCat = null;
  productos.forEach(function (p) {
    if (p.cat !== lastCat) {
      lastCat = p.cat;
      html += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin:' + (html ? '10px' : '0') + ' 0 4px">' + p.cat + '</div>';
    }
    html += '<label style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px;color:var(--text);cursor:pointer">'
      + '<input type="checkbox" class="or-producto-check" value="' + p.id + '" style="width:16px;height:16px;flex-shrink:0;accent-color:var(--brown)">'
      + p.name + '</label>';
  });
  cont.innerHTML = html;
}

function orCambiarAlcance() {
  const alcance = document.getElementById('or-alcance').value;
  const prodGroup = document.getElementById('or-producto-group');
  if (prodGroup) prodGroup.style.display = alcance === 'producto' ? 'block' : 'none';
}

function orCambiarDuracion() {
  const sel = document.getElementById('or-duracion').value;
  const custom = document.getElementById('or-duracion-custom');
  if (custom) custom.style.display = sel === 'custom' ? 'inline-block' : 'none';
}

async function orLanzar() {
  const alcance = document.getElementById('or-alcance').value; // 'total' | 'producto'
  const pct = parseInt(document.getElementById('or-pct').value, 10);
  const duracionSel = document.getElementById('or-duracion').value;
  const minutos = duracionSel === 'custom' ? parseInt(document.getElementById('or-duracion-custom').value, 10) : parseInt(duracionSel, 10);
  if (!pct || pct < 1 || pct > 90) { alert('Introduce un % válido (1-90)'); return; }
  if (!minutos || minutos < 1) { alert('Introduce una duración válida (minutos)'); return; }
  let productoIds = null;
  if (alcance === 'producto') {
    productoIds = Array.from(document.querySelectorAll('.or-producto-check:checked')).map(function (c) { return parseInt(c.value, 10); });
    if (!productoIds.length) { alert('Elige al menos un producto'); return; }
  }
  if (!window.fb_saveOfertaRelampago) { alert('Firebase no disponible'); return; }
  // Antes esto sobrescribía sin más una oferta que ya estuviera en marcha
  // (fb_saveOfertaRelampago es un set() del nodo entero) — si esta pestaña
  // u otra sesión de admin (la dueña + un empleado, por ejemplo) lanza una
  // oferta mientras otra sigue corriendo, la primera se descartaba en
  // silencio junto con el tiempo que le quedaba.
  const activaAhora = window._ofertaRelampagoActiva;
  if (activaAhora && typeof _ofertaRelampagoVigente === 'function' && _ofertaRelampagoVigente(activaAhora)) {
    const restante = Math.max(0, Math.round((activaAhora.fin - (typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now())) / 60000));
    if (!confirm('Ya hay una oferta relámpago activa (le quedan ' + restante + ' min). Lanzar esta la reemplaza y pierde el tiempo restante. ¿Continuar?')) return;
  }
  const fin = Date.now() + minutos * 60000;
  const oferta = { tipo: alcance, productoIds, pct, fin };
  await window.fb_saveOfertaRelampago(oferta);
  const destino = alcance === 'producto' ? _orNombresProductos(productoIds) : 'todo el pedido';
  logActivity('⚡ Oferta relámpago lanzada: -' + pct + '% en ' + destino + ' durante ' + minutos + ' min');
  orRenderEstado(oferta);
}

// Nombres legibles de una lista de ids de producto, para el log de
// actividad, el estado del panel admin y el banner del cliente.
function _orNombresProductos(productoIds) {
  const nombres = (productoIds || []).map(function (id) { return (MENU.find(function (m) { return m.id === id; }) || {}).name || '?'; });
  return nombres.join(', ');
}

async function orCancelar() {
  if (!confirm('¿Cancelar la oferta relámpago activa?')) return;
  if (window.fb_saveOfertaRelampago) await window.fb_saveOfertaRelampago(null);
  logActivity('⚡ Oferta relámpago cancelada a mano');
  orRenderEstado(null);
}

// Pinta el propio panel admin (formulario para lanzar una nueva, o el
// estado + cuenta atrás de la que esté activa). Aparte de esto,
// _actualizarOfertaRelampago() en carta.js pinta el banner que ve el
// cliente — ambas se disparan desde el mismo listener de Firebase, ver
// loadOfertaRelampagoFromFirebase() en nucleo-compartido.js.
function orRenderEstado(oferta) {
  const form = document.getElementById('or-form');
  const estadoEl = document.getElementById('or-estado');
  if (!form || !estadoEl) return;
  if (_orTickInterval) { clearInterval(_orTickInterval); _orTickInterval = null; }
  const _ahoraSrv = typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now();
  const vigente = !!(oferta && oferta.fin && _ahoraSrv < oferta.fin);
  if (!vigente) {
    form.style.display = 'block';
    estadoEl.style.display = 'none';
    return;
  }
  form.style.display = 'none';
  estadoEl.style.display = 'block';
  const destino = oferta.tipo === 'producto' ? _orNombresProductos(oferta.productoIds) : 'todo el pedido';
  const pintar = function () {
    const restante = oferta.fin - (typeof _ahoraServidor === 'function' ? _ahoraServidor() : Date.now());
    if (restante <= 0) { orRenderEstado(null); return; }
    const m = Math.floor(restante / 60000);
    const s = Math.floor((restante % 60000) / 1000);
    const txt = document.getElementById('or-estado-texto');
    if (txt) txt.textContent = '⚡ -' + oferta.pct + '% en ' + destino + ' — acaba en ' + m + ':' + String(s).padStart(2, '0');
  };
  pintar();
  _orTickInterval = setInterval(pintar, 1000);
}

// ── IMPRIMIR TODOS + MARCA DE IMPRESO ────────────────────────────────────────
// Antes _printedOrders vivía solo en memoria de ESTE bundle cargado en ESTA
// pestaña — recargar la página, o simplemente abrir una segunda pestaña/
// tablet, hacía que todo volviera a mostrar "🖨️ Imprimir" aunque ya se
// hubiera impreso, invitando a reimprimir de más. Ahora se guarda también
// en localStorage (con fecha, para no arrastrar el número de un pedido de
// ayer al de hoy con el mismo T####) y se sincroniza vía Firebase
// (fb_setPrinted/fb_listenPrintedOrders, el listener vive en
// nucleo-compartido.js porque este bundle admin puede no estar cargado
// todavía cuando llega el primer snapshot) para que lo que imprime una
// tablet lo vea también el resto.
const PRINTED_ORDERS_KEY = 'dpf_printed_orders';
const _printedOrders = new Set(); // IDs de pedidos ya impresos hoy
(function _cargarPrintedOrdersLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRINTED_ORDERS_KEY) || 'null');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (saved && saved.date === todayKey && Array.isArray(saved.nums)) {
      saved.nums.forEach(n => _printedOrders.add(n));
    }
  } catch (e) {}
})();
function _guardarPrintedOrdersLocal() {
  try {
    localStorage.setItem(PRINTED_ORDERS_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), nums: [..._printedOrders] }));
  } catch (e) {}
}

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

function _markAsImpreso(orderNum, _remoto) {
  _printedOrders.add(orderNum);
  _guardarPrintedOrdersLocal();
  // _remoto=true significa que esta marca ya viene de Firebase (otra
  // tablet lo imprimió) — no hace falta volver a escribirlo allí.
  if (!_remoto && window.fb_setPrinted) window.fb_setPrinted(orderNum).catch(() => {});
  // Parar sonido al imprimir — equivale a haber visto el pedido. Antes esto
  // restaba 1 a mano de _alertPendingOrders, el contador suelto que ya se
  // dejó de usar en pedidos-vivo-cocina.js (ver el comentario junto a
  // _alertPendingOrderNumsSet ahí: un mismo pedido podía restar dos veces,
  // o dos avisos casi seguidos podían pisarse el contador) — esta función
  // se quedó sin actualizar en aquel cambio, así que reimprimir el MISMO
  // pedido varias veces (el botón "🖨️ Impreso" se deja pulsable a
  // propósito) seguía restando cada vez, pudiendo silenciar la alarma con
  // pedidos reales aún sin atender. _marcarPedidoAtendido() usa el mismo
  // Set por número de pedido que el resto de sitios que paran la alarma
  // (setLiveStatus, markAllKitchenReady, cancelarPedidoAdmin) — no hace
  // nada si ese pedido concreto ya no estaba pendiente, así que reimprimir
  // de más deja de tener ningún efecto sobre el resto de la cola.
  if (typeof _marcarPedidoAtendido === 'function') _marcarPedidoAtendido(orderNum);
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
  // Antes esto solo vivía en localStorage de ESTE dispositivo — cambiarlo
  // desde el móvil no se reflejaba al marcar de confianza el ordenador del
  // local (cada uno usaba su propio valor, o el de por defecto), aunque el
  // mensaje diera a entender que era un ajuste global. Ahora se sincroniza.
  if (window.fb_saveTrustedDays) window.fb_saveTrustedDays(days).catch(function () {});
  logActivity('🔐 Expiración de sesión configurada: ' + days + ' días (todos los dispositivos)');
  alert('✅ Guardado. Se aplicará en el próximo inicio de sesión, en cualquier dispositivo.');
}


// ── ACCESO A EMPLEADOS DESDE RUEDA ───────────────────────────────────────────
function openEmpleadosWithBimba() {
  // Usar el mismo modal bimba pero redirigir a empleados al confirmar
  window._bimbaTargetEmpleados = true;
  secureLockTap();
}

// ── DISPOSITIVO DE CONFIANZA ──────────────────────────────────────────────────
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

// Trae el valor real desde Firebase al abrir el panel en un dispositivo
// nuevo (o que no lo tenía sincronizado todavía) — ver saveTrustedExpiry().
function _cargarTrustedDaysDesdeFirebase() {
  if (!window.fb_loadTrustedDays) return;
  window.fb_loadTrustedDays().then(function (days) {
    if (!days) return;
    localStorage.setItem(TRUSTED_DAYS_KEY, String(days));
    const input = document.getElementById('trusted-expiry-days');
    if (input) input.value = String(days);
  }).catch(function () {});
}
if (window._firebaseReady) _cargarTrustedDaysDesdeFirebase();
else document.addEventListener('firebaseReady', _cargarTrustedDaysDesdeFirebase);

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
    // Si hay sesión real, limpiar también el registro en Firebase
    // directamente (más rápido, sin ir al servidor). Si NO hay sesión —el
    // caso más habitual con diferencia: isTrustedDevice() llama aquí
    // precisamente para decidir si hace falta pedir la contraseña, es
    // decir, ANTES de haber iniciado sesión— esa escritura fallaba en
    // silencio y el registro se quedaba huérfano en Firebase para
    // siempre (el token local ya no serviría de nada, pero si alguna vez
    // reaparece en localStorage — restaurado de una copia vieja, por
    // ejemplo— isTrustedDevice() lo seguiría validando contra ese
    // registro nunca borrado). Ahora, sin sesión, se pide el borrado a
    // bimba-verify.php con la cuenta de servicio — usa el mismo token
    // como prueba de propiedad que ya exige checkTrustedDevice, así que
    // nadie puede borrar el registro de otro dispositivo solo adivinando
    // su deviceId.
    try {
      const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
      const deviceId = getDeviceId();
      const token = localStorage.getItem(TRUSTED_TOKEN_KEY);
      if (user && user.uid) {
        await firebase.database().ref('config/trustedDevices/' + deviceId).remove();
      } else if (token) {
        await fetch('bimba-verify.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'removerDispositivoConfianza', deviceId, token })
        }).catch(() => {});
      }
    } catch (e) {}
    localStorage.removeItem(TRUSTED_KEY);
    localStorage.removeItem(TRUSTED_NAME_KEY);
    localStorage.removeItem(TRUSTED_TOKEN_KEY);
    localStorage.removeItem(TRUSTED_EXPIRY_KEY);
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
  _alertPendingOrders = 0;
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
function bimbaGenBimbaToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(BIMBA_TOKEN_KEY, token);
  if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(token).catch(() => {});
  // El enlace bimba antes no caducaba nunca — una vez compartido (por
  // WhatsApp, etc.) quedaba válido para siempre sin forma de revocarlo sin
  // romperlo también para quien lo necesitaba de verdad. Ahora caduca a
  // los 90 días; regenerarlo (este mismo botón) también renueva el plazo.
  if (window.fb_saveBimbaTokenExpiry) window.fb_saveBimbaTokenExpiry(Date.now() + 90 * 24 * 60 * 60 * 1000).catch(() => {});
  loadBimbaTokenUI();
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token bimba generado (válido 90 días)';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.display = 'none', 2000);
}
function clearBimbaToken() {
  if (!confirm('¿Eliminar el token bimba? El enlace ?bimba=TOKEN dejará de funcionar.')) return;
  localStorage.removeItem(BIMBA_TOKEN_KEY);
  if (window.fb_saveBimbaToken) window.fb_saveBimbaToken('').catch(() => {});
  loadBimbaTokenUI();
  logActivity('📱 Token bimba eliminado');
}
function loadBimbaTokenUI() {
  const token = getBimbaToken();
  const inp = document.getElementById('bimba-token-display');
  const full = document.getElementById('bimba-token-full');
  if (!inp) return;
  inp.value = token || '';
  if (full) {
    if (token) {
      const url = "".concat(location.origin).concat(location.pathname, "?bimba=").concat(token);
      full.textContent = '🔗 ' + url;
    } else {
      full.textContent = 'Sin token activo';
    }
  }
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
      // adminPwd de un backup antiguo se ignora a propósito — el comentario
      // de arriba ya decía que no se restauraba, y ahora además el sistema
      // de "contraseña de administración" propio se ha quitado del todo
      // (no protegía nada real, ver admin-turnos-descuentos.js).

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
let _adminFailedAttempts = 0;
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


// Antes, cada guardado hacia Firebase de este archivo (precio, config,
// gastos, ticket, pausa exprés...) hacía fb_save*(...).catch(() => {}) —
// si la escritura remota fallaba (wifi caído justo al pulsar), el fallo
// se tragaba en silencio: el admin ya había visto "✅ Guardado" antes
// siquiera de intentar la escritura real, así que un cambio podía quedarse
// sin aplicar indefinidamente sin que nadie se enterara (ni otros
// dispositivos ni, más importante, el propio servidor de guardar-pedido.php,
// que relee Firebase en cada pedido). Este helper deja rastro real: log en
// consola (para depurar) + un aviso visible que dice qué no se guardó.
function _avisarSiFalloGuardado(e, etiqueta) {
  console.warn('[admin-config] fallo al guardar "' + etiqueta + '" en Firebase:', e);
  if (typeof showAlert === 'function') {
    showAlert('No se ha podido sincronizar "' + etiqueta + '" con el servidor (revisa la conexión) — el cambio se ha quedado solo en este dispositivo por ahora. Vuelve a intentarlo.', 'Aviso de guardado');
  }
}

// ── PRODUCTOS (edición desde el panel) — leer/renderizar el menú para
// cualquier visitante (getSavedMenu, loadSavedMenu, renderMenu) vive ahora
// en nucleo-compartido.js. ──
// ── Botón "🔓 Marcar alérgenos quitables" de la cabecera de Patatas ──
// Marca item.ingredientesQuitables=true en TODAS las patatas de la carta
// EXCEPTO la Carbonara y la Boloñesa (nombre de excepción decidido por la
// dueña: en esas dos el alérgeno va mezclado en la propia salsa y no se
// puede sacar). Se puede pulsar de nuevo siempre que se añada una patata
// nueva o cambie algún nombre — vuelve a aplicar la regla entera de golpe,
// no hace falta ir producto por producto.
function marcarPatatasAlergenosQuitables() {
  const EXCEPCIONES = ['carbonara', 'boloñesa', 'bolognesa'];
  let cambiados = 0;
  const excluidas = [];
  MENU.forEach(item => {
    if (item.cat !== 'Patatas') return;
    const nombreLower = item.name.toLowerCase();
    const esExcepcion = EXCEPCIONES.some(ex => nombreLower.indexOf(ex) !== -1);
    if (esExcepcion) excluidas.push(item.name);
    const nuevoValor = !esExcepcion;
    if (!!item.ingredientesQuitables !== nuevoValor) {
      item.ingredientesQuitables = nuevoValor;
      cambiados++;
    }
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Actualizado — ' + cambiados + ' patata(s) cambiadas.' + (excluidas.length ? ' Sin marcar (no se pueden quitar sus alérgenos): ' + excluidas.join(', ') + '.' : '')
    : 'Ya estaba todo así — ninguna patata ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Alérgenos de las patatas');
}
// NOTA: se consideró un botón masivo "🔓 Marcar alérgenos quitables" para
// Boniato igual que el de Patatas de arriba, pero se descartó — a
// diferencia de las patatas (donde la mayoría SÍ admite quitar el queso),
// en Boniato el queso no se puede quitar en NINGÚN producto: Lotus y Bacon
// lo llevan mezclado igual que Carbonara/Boloñesa, Pistacchio tiene una
// segunda fuente de lácteos aparte del queso (la crema de pistacho, que
// también lleva leche) así que "sin queso" seguiría sin ser cierto, y
// G.O.A.T. lleva el queso de cabra en el propio nombre. Las notas de cada
// alérgeno se escriben a mano por producto desde el panel de edición en
// vez de con un botón de "aplicar a toda la categoría".
// Antes esto sobreescribía TODO config/menu con la copia local completa
// (fb_saveMenu = un set() sin más, y encima sin comprobar si la escritura
// llegaba a cuajar). Si dos pestañas de admin editaban productos distintos
// casi a la vez, la que guardaba último borraba en silencio los cambios de
// la otra — mismo patrón que ya se arregló para la lista de stock. Ahora
// usa una transacción real: si el servidor tiene algo más reciente que lo
// que este dispositivo tenía sincronizado, se combinan los dos cambios
// producto a producto (por id) en vez de que uno pise al otro entero, y si
// la escritura real falla del todo, se avisa con un mensaje claro en vez
// de dar el guardado por bueno sin más.
function saveMenu() {
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', Date.now());
  if (!window.fb_transactJsonString) {
    if (window.fb_saveMenu) window.fb_saveMenu({ items: MENU, ts: Date.now() }).catch(function (e) { _avisarSiFalloGuardado(e, 'la carta'); });
    return Promise.resolve(true);
  }
  const antesPorId = {};
  (window._menuSyncedSnapshot || []).forEach(function (i) { antesPorId[i.id] = i; });
  const localPorId = {};
  MENU.forEach(function (i) { localPorId[i.id] = i; });
  return window.fb_transactJsonString('config/menu', function (remoto) {
    const remotoItems = (remoto && Array.isArray(remoto.items)) ? remoto.items : (Array.isArray(remoto) ? remoto : []);
    const merged = {};
    const ordenIds = [];
    remotoItems.forEach(function (ri) {
      const tocadoAqui = JSON.stringify(localPorId[ri.id] || null) !== JSON.stringify(antesPorId[ri.id] || null);
      if (localPorId.hasOwnProperty(ri.id)) {
        merged[ri.id] = tocadoAqui ? localPorId[ri.id] : ri;
        ordenIds.push(ri.id);
      } else if (antesPorId.hasOwnProperty(ri.id)) {
        // Este dispositivo lo tenía y ya no lo tiene: lo borró — se respeta
        // el borrado en vez de resucitarlo con lo que traiga el servidor.
      } else {
        // Producto que otro dispositivo añadió después de la última
        // sincronización de este — se conserva.
        merged[ri.id] = ri;
        ordenIds.push(ri.id);
      }
    });
    // Productos que este dispositivo añadió y el servidor todavía no tenía.
    MENU.forEach(function (li) {
      if (!merged.hasOwnProperty(li.id)) {
        merged[li.id] = li;
        ordenIds.push(li.id);
      }
    });
    return { items: ordenIds.map(function (id) { return merged[id]; }), ts: Date.now() };
  }).then(function (finalData) {
    if (finalData && Array.isArray(finalData.items)) window._menuSyncedSnapshot = finalData.items;
    return true;
  }).catch(function (e) {
    console.warn('[saveMenu] fallo al guardar en Firebase:', e);
    if (typeof showAlert === 'function') {
      showAlert('No se ha podido guardar en el servidor (revisa la conexión). El cambio se ha quedado solo en este dispositivo por ahora — vuelve a intentarlo en unos segundos.', 'Aviso de guardado');
    }
    return false;
  });
}
// Botón temporal "💰 Aplicar precios nuevos" — subida de precios pactada
// con la dueña (agosto 2026), aplicada de una vez a los productos ya
// existentes en vez de editar 23 productos uno a uno a mano en el panel.
// Igual que marcarPatatasAlergenosQuitables(): SOLO toca el campo price
// de los productos listados (por id) y deja todo lo demás intacto — nombre,
// descripción, oculto/agotado, orden, etiquetas... — así no hay riesgo de
// deshacer alguna personalización ya hecha desde el panel. Al Gusto/Bomba
// (ids 15/16) sí están en esta lista — es el precio que se ve en su
// tarjeta de la carta antes de abrir el personalizador — pero el precio
// que de verdad se cobra al construirlas vive aparte, en CUSTOMIZER_CONFIG
// (ver src/antifraude.js), ya actualizado a mano ahí.
function aplicarPreciosNuevosAgosto2026() {
  const NUEVOS_PRECIOS = {
    2: 6.40, 3: 6.40, 4: 6.80, 5: 6.80, 6: 6.80, 7: 6.90, 8: 6.90,
    9: 7.20, 10: 7.40, 12: 7.50, 13: 7.50, 14: 7.50, 15: 7.90, 16: 9.40,
    41: 1.30, 42: 1.40, 44: 2.00, 45: 2.00, 46: 2.00, 47: 1.50, 48: 2.40, 49: 2.70,
  };
  let cambiados = 0;
  const sinCambio = [];
  MENU.forEach(item => {
    if (!Object.prototype.hasOwnProperty.call(NUEVOS_PRECIOS, item.id)) return;
    if (item.price === NUEVOS_PRECIOS[item.id]) { sinCambio.push(item.name); return; }
    item.price = NUEVOS_PRECIOS[item.id];
    cambiados++;
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Precios actualizados: ' + cambiados + ' producto(s) cambiados.' + (sinCambio.length ? ' Ya estaban al día: ' + sinCambio.join(', ') + '.' : '')
    : 'Ya estaba todo al día — ningún precio ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Precios nuevos');
}
// Subida de precio de las 7 Cookies (+1€, de 2,99€ a 3,99€) — mismo patrón
// que aplicarPreciosNuevosAgosto2026() de arriba: un botón de un solo uso
// en vez de editar 7 productos a mano, solo toca price, deja todo lo demás
// (nombre, descripción, orden...) intacto.
function aplicarPrecioCookiesNuevo() {
  const NUEVOS_PRECIOS = { 27: 3.99, 28: 3.99, 29: 3.99, 30: 3.99, 31: 3.99, 32: 3.99, 33: 3.99 };
  let cambiados = 0;
  const sinCambio = [];
  MENU.forEach(item => {
    if (!Object.prototype.hasOwnProperty.call(NUEVOS_PRECIOS, item.id)) return;
    if (item.price === NUEVOS_PRECIOS[item.id]) { sinCambio.push(item.name); return; }
    item.price = NUEVOS_PRECIOS[item.id];
    cambiados++;
  });
  saveMenu();
  renderMenu();
  renderAdminProducts();
  const msg = cambiados
    ? 'Precios actualizados: ' + cambiados + ' cookie(s) a 3,99€.' + (sinCambio.length ? ' Ya estaban al día: ' + sinCambio.join(', ') + '.' : '')
    : 'Ya estaba todo al día — ningún precio ha cambiado.';
  if (typeof showAlert === 'function') showAlert(msg, 'Precio de Cookies');
}
function renderAdminProducts() {
  const cats = [...new Set(MENU.map(i => i.cat))];
  const emojiMapAdmin = {"Patatas":"🥔","Boniato":"🍠","Paninis":"🍕","Cookies":"🍪","Tartas":"🍰","Bebidas":"🥤"};
  let html = '';
  cats.forEach(cat => {
    const catEmoji = emojiMapAdmin[cat] || '';
    // Botón masivo solo en "Patatas" — ver marcarPatatasAlergenosQuitables:
    // en vez de tener que marcar el interruptor "se pueden quitar" patata
    // por patata, este botón lo activa de golpe para toda la categoría
    // excepto la Carbonara y la Boloñesa (regla que dio la dueña: en esas
    // dos el alérgeno viene ya mezclado en la salsa, no se puede sacar).
    // NO hay botón equivalente en "Boniato": ahí ningún producto tiene el
    // queso realmente quitable (ver nota junto a marcarPatatasAlergenosQuitables
    // más arriba), así que un botón "de golpe" ahí solo invitaría a marcar
    // algo mal — las notas de Boniato se escriben a mano, producto a producto.
    const catBulkBtn = (cat === 'Patatas')
      ? '<button onclick="marcarPatatasAlergenosQuitables()" style="background:var(--gold);color:#3D1F0D;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🔓 Marcar alérgenos quitables</button>'
      : '';
    html += "<p style=\"display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:Anton,sans-serif;font-size:19px;font-weight:400;color:#FFF8EE;background:#3D1F0D;text-transform:uppercase;letter-spacing:0.06em;margin:16px 0 8px;padding:8px 14px;border-radius:8px\"><span>".concat(catEmoji ? catEmoji + ' ' : '', cat, "</span>").concat(catBulkBtn, "</p>");
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
      html += tartaSep + "\n      <div class=\"admin-product-row\" id=\"arow-".concat(item.id, "\"\n        ondragover=\"dragOver(event)\" ondrop=\"dragDrop(event,").concat(item.id, ")\" ondragleave=\"dragLeave(event)\">\n        <span class=\"drag-handle\" draggable=\"true\" title=\"Arrastrar para reordenar\"\n          ondragstart=\"dragStart(event,").concat(item.id, ")\">⠿</span>\n        <div class=\"aprod-info\">\n          <div class=\"aprod-name\" style=\"").concat(soldout ? 'text-decoration:line-through;color:#8A6A4E' : '', "\">").concat(formatNombreConBadgeNuevo(item.name), dietaryTagsHtml(item), "</div>\n          <div class=\"aprod-desc\">").concat(item.desc, "</div>\n          ").concat(soldout ? '<span class="soldout-badge">AGOTADO</span>' : '', "\n        \n        </div>\n        <span class=\"aprod-price\">").concat(item.price.toFixed(2), " €</span>\n        <div class=\"btn-row\">\n        <button class=\"admin-edit-btn\" onclick=\"toggleEditPanel(").concat(item.id, ")\">✏️ Editar</button>\n        <button class=\"aprod-toggle-text ").concat(soldout ? 'off' : 'on', "\" id=\"sold-").concat(item.id, "\" onclick=\"toggleSoldout(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(soldout ? '#c0392b' : '#5ECC76', ";color:#fff\">").concat(soldout ? 'Agotado' : 'Disponible', "</button>\n        <button class=\"aprod-toggle-text ").concat(visible, "\" id=\"tog-").concat(item.id, "\" onclick=\"toggleProduct(").concat(item.id, ")\" style=\"padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:").concat(visible === 'on' ? '#5ECC76' : '#aaa', ";color:#fff\">").concat(visible === 'on' ? 'Visible' : 'Oculto', "</button>\n        </div>\n      </div>\n      <div id=\"edit-").concat(item.id, "\" style=\"display:none;flex-direction:column;background:rgba(244,196,48,0.08);border:1.5px solid #3D1F0D;border-radius:8px;padding:12px;margin:-4px 0 8px\">\n        <input type=\"text\" value=\"").concat(item.name.replace(/"/g, '&quot;'), "\" id=\"edit-name-").concat(item.id, "\" placeholder=\"Nombre\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"text\" value=\"").concat(item.desc.replace(/"/g, '&quot;'), "\" id=\"edit-desc-").concat(item.id, "\" placeholder=\"Descripci\xF3n\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        <input type=\"number\" value=\"").concat(item.price.toFixed(2), "\" id=\"edit-price-").concat(item.id, "\" step=\"0.10\" min=\"0\" placeholder=\"Precio (€)\"\n          style=\"padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#2A1506;width:100%;box-sizing:border-box\">\n        ").concat(_tagCheckboxesHtml(item), "\n        <div style=\"display:flex\">\n          <button class=\"admin-save-btn\" onclick=\"saveProductEdit(").concat(item.id, ")\" style=\"flex:1\">✅ Guardar</button>\n          <button class=\"admin-save-btn\" onclick=\"confirmDeleteProduct(").concat(item.id, ",'").concat(item.name.replace(/'/g, "\\'"), "')\" style=\"background:#c0392b;flex:1\">🗑️ Eliminar</button>\n        </div>\n      </div>");
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
}
// ── Alérgenos del producto (los 14 de declaración obligatoria — ver
// DIETARY_TAGS en carta.js). Marca los que el producto SÍ contiene, y
// opcionalmente añade una nota (ej. "por el queso, se puede quitar") para
// cuando ese alérgeno concreto viene de un ingrediente que no es fijo —
// sale al pasar el ratón por encima de la insignia en la carta real, en
// vez de dar a entender que el producto SIEMPRE lo lleva.
function _tagCheckboxesHtml(item) {
  const seleccionadas = Array.isArray(item.tags) ? item.tags : [];
  const notas = (item.tagNotes && typeof item.tagNotes === 'object') ? item.tagNotes : {};
  const quitables = !!item.ingredientesQuitables;
  const checkboxes = DIETARY_TAGS.map(t => {
    const checked = seleccionadas.indexOf(t.id) !== -1;
    const icono = t.img
      ? '<img class="allergen-icon-img" src="' + t.img + '" alt="" onerror="_alergenoImgFallback(this,\'' + t.id + '\')">'
      : _alergenoEmojiSpan(t);
    return '<label style="display:flex;align-items:center;gap:5px;font-size:12px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#fff;border:1.5px solid #F5E6C8;border-radius:8px;padding:5px 9px;cursor:pointer">'
      + '<input type="checkbox" id="edit-tag-' + t.id + '-' + item.id + '"' + (checked ? ' checked' : '') + ' onchange="_toggleTagNotaVisible(' + item.id + ',\'' + t.id + '\')" style="margin:0">'
      + icono
      + t.label
      + '</label>';
  }).join('');
  const notasInputs = DIETARY_TAGS.map(t => {
    const checked = seleccionadas.indexOf(t.id) !== -1;
    const val = (notas[t.id] || '').replace(/"/g, '&quot;');
    return '<input type="text" id="edit-tagnota-' + t.id + '-' + item.id + '" value="' + val + '"'
      + ' placeholder="Nota sobre ' + t.label + ' (solo si es distinto del resto — ej: no se puede quitar aunque los demás sí)"'
      + ' style="display:' + (checked ? 'block' : 'none') + ';width:100%;box-sizing:border-box;padding:6px 9px;margin-bottom:4px;border:1.5px solid #F5E6C8;border-radius:6px;font-size:11.5px;font-family:\'DM Sans\',sans-serif;background:#fff;color:#2A1506">';
  }).join('');
  // Interruptor general del producto: si está activado, TODOS los
  // alérgenos marcados arriba avisan de que se pueden pedir sin ellos
  // (mensaje genérico automático) — sin tener que escribir la misma nota
  // en cada uno. El cuadro de texto de arriba solo hace falta para la
  // excepción contraria (un alérgeno que NO se pueda quitar aunque el
  // resto del producto sí lo permita, p.ej. si viniera ya mezclado en la salsa).
  const quitableToggle = '<label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#2A1506;background:#FDECD5;border:1.5px solid #F4C430;border-radius:8px;padding:7px 10px;margin:2px 0 8px;cursor:pointer">'
    + '<input type="checkbox" id="edit-quitables-' + item.id + '"' + (quitables ? ' checked' : '') + ' style="margin:0">'
    + '🔓 Los ingredientes con alérgeno de este producto se pueden pedir sin ellos'
    + '</label>';
  return '<div style="font-size:11px;font-weight:700;color:#8A6A4E;margin:2px 0 4px">Contiene (alérgenos):</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px">' + checkboxes + '</div>'
    + quitableToggle
    + '<div>' + notasInputs + '</div>';
}
function _toggleTagNotaVisible(itemId, tagId) {
  const cb = document.getElementById('edit-tag-' + tagId + '-' + itemId);
  const nota = document.getElementById('edit-tagnota-' + tagId + '-' + itemId);
  if (cb && nota) nota.style.display = cb.checked ? 'block' : 'none';
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
  if (nameEl && nameEl.value.trim()) {
    const nuevoNombre = nameEl.value.trim();
    const nombreLower = nuevoNombre.toLowerCase();
    if (MENU.some(m => m.id != id && m.name.trim().toLowerCase() === nombreLower)) {
      alert('Ya existe otro producto con ese nombre — el servidor valida el precio de un pedido buscando por nombre exacto, así que dos productos no pueden compartirlo.');
      return;
    }
    item.name = nuevoNombre;
  }
  if (descEl) item.desc = descEl.value.trim();
  if (priceEl) {
    // parseFloat(val) || item.price solo protegía contra NaN/0 (0 es
    // falsy) — un precio negativo como -5 es truthy en JS y se colaba tal
    // cual, aunque el input tenga min="0" (el HTML no bloquea nada si el
    // JS lee .value directamente sin comprobar el propio valor).
    const nuevoPrecio = parseFloat(priceEl.value);
    if (!isNaN(nuevoPrecio) && nuevoPrecio >= 0) item.price = nuevoPrecio;
  }
  item.tags = DIETARY_TAGS.filter(t => {
    const cb = document.getElementById('edit-tag-' + t.id + '-' + id);
    return cb && cb.checked;
  }).map(t => t.id);
  const tagNotes = {};
  DIETARY_TAGS.forEach(t => {
    if (item.tags.indexOf(t.id) === -1) return;
    const notaEl = document.getElementById('edit-tagnota-' + t.id + '-' + id);
    const val = notaEl ? notaEl.value.trim() : '';
    if (val) tagNotes[t.id] = val;
  });
  item.tagNotes = Object.keys(tagNotes).length ? tagNotes : undefined;
  const quitablesEl = document.getElementById('edit-quitables-' + id);
  item.ingredientesQuitables = !!(quitablesEl && quitablesEl.checked);
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("✏️ Producto editado: \"".concat(item.name, "\" — ").concat(item.price.toFixed(2), " €"));
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
  logActivity("👁️ Producto ".concat(item.hidden ? 'ocultado' : 'mostrado', ": \"").concat(item.name, "\""));
}
function toggleSoldout(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.soldout = !item.soldout;
  saveMenu();
  renderMenu();
  renderAdminProducts();
  showToast('prod-toast');
  logActivity("🚫 Producto ".concat(item.soldout ? 'marcado agotado' : 'disponible de nuevo', ": \"").concat(item.name, "\""));
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
async function addSection() {
  const input = document.getElementById('new-section-name');
  const cat = input ? input.value.trim() : '';
  if (!cat) { alert('Escribe el nombre de la categoría'); return; }
  // Comparación sin distinguir mayúsculas/minúsculas — "Bebidas" y
  // "bebidas" antes se trataban como categorías distintas, generando dos
  // secciones que en la carta pueden confundirse como si fueran la misma
  // mal escrita.
  const catLower = cat.toLowerCase();
  if (MENU.some(i => i.cat.toLowerCase() === catLower)) { alert('Esa categoría ya existe'); return; }
  // Añadir producto placeholder oculto para crear la categoría — el ID se
  // reserva dentro de la misma transacción que lo escribe (ver
  // _menuAgregarItemTransaccion), no calculado antes a partir de la copia
  // local: dos pestañas de admin creando una categoría casi a la vez antes
  // podían calcular el mismo ID nuevo y acabar con dos productos distintos
  // compartiendo id (uno "desaparecía" al guardar el segundo).
  const nuevo = await _menuAgregarItemTransaccion(function (id) {
    return { id, cat, name: '(producto de ejemplo)', desc: '', price: 0, hidden: true };
  }, cat);
  if (!nuevo) return; // fallo de guardado, ya avisado dentro
  initTabs();
  renderMenu();
  renderAdminProducts();
  if (input) input.value = '';
  showToast('section-toast');
  logActivity('📂 Nueva categoría creada: ' + cat);
}
// Añade un producto nuevo con su id reservado de forma atómica: el
// callback `build(id)` recibe el próximo id ya calculado a partir del
// estado MÁS FRESCO del servidor (no de la copia local, que puede estar
// desactualizada) y devuelve el item completo. Si Firebase no está
// disponible, cae al cálculo local de toda la vida (mismo comportamiento
// que antes). Devuelve el item ya insertado en MENU, o null si falló el
// guardado (con el aviso ya mostrado).
async function _menuAgregarItemTransaccion(build, cat) {
  let nuevoItem = null;
  if (window.fb_transactJsonString) {
    try {
      const finalData = await window.fb_transactJsonString('config/menu', function (remoto) {
        const remotoItems = (remoto && Array.isArray(remoto.items)) ? remoto.items : (Array.isArray(remoto) ? remoto : []);
        const idsRemotos = remotoItems.map(function (i) { return i.id; });
        const idsLocales = MENU.map(function (i) { return i.id; });
        const nuevoId = Math.max(0, ...idsRemotos, ...idsLocales) + 1;
        nuevoItem = build(nuevoId);
        const arr = remotoItems.slice();
        let lastIdx = -1;
        for (let i = 0; i < arr.length; i++) { if (arr[i].cat === cat) lastIdx = i; }
        if (lastIdx === -1) arr.push(nuevoItem); else arr.splice(lastIdx + 1, 0, nuevoItem);
        return { items: arr, ts: Date.now() };
      });
      if (finalData && Array.isArray(finalData.items)) window._menuSyncedSnapshot = finalData.items;
    } catch (e) {
      console.warn('[addProduct] fallo al guardar en Firebase:', e);
      if (typeof showAlert === 'function') showAlert('No se ha podido crear en el servidor (revisa la conexión) — inténtalo de nuevo.', 'Aviso de guardado');
      return null;
    }
  } else {
    const newId = Math.max(0, ...MENU.map(function (i) { return i.id; })) + 1;
    nuevoItem = build(newId);
  }
  let lastIdx = -1;
  for (let i = 0; i < MENU.length; i++) { if (MENU[i].cat === cat) lastIdx = i; }
  if (lastIdx === -1) MENU.push(nuevoItem); else MENU.splice(lastIdx + 1, 0, nuevoItem);
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', Date.now());
  return nuevoItem;
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
async function addProduct() {
  const name = document.getElementById('new-name').value.trim();
  const desc = document.getElementById('new-desc').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  let cat = document.getElementById('new-cat').value;
  if (cat === '__nueva__') {
    const inputNueva = document.getElementById('new-cat-nombre');
    cat = inputNueva ? inputNueva.value.trim() : '';
    if (!cat) { alert('Escribe el nombre de la nueva categoría'); return; }
  }
  if (!name || !cat || isNaN(price) || price < 0) {
    alert('Rellena nombre, categoría y precio (0 o mayor)');
    return;
  }
  // El servidor valida el precio de un pedido buscando el producto por
  // NOMBRE exacto (corregirPreciosCatalogo) — dos productos con el mismo
  // nombre harían que esa comprobación mirara el precio equivocado.
  if (MENU.some(i => i.name.trim().toLowerCase() === name.toLowerCase())) {
    alert('Ya existe un producto con ese nombre — usa uno distinto (aunque sea con un matiz) para que el servidor pueda identificarlo bien al validar el precio.');
    return;
  }
  const nuevoItem = await _menuAgregarItemTransaccion(function (id) {
    return { id, cat, name, desc, price };
  }, cat);
  if (!nuevoItem) return; // fallo de guardado, ya avisado dentro
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
  logActivity("➕ Producto nuevo: \"".concat(name, "\" — ").concat(price.toFixed(2), " €"));
}

// ── CONFIG (email del local) — el envío de aviso por EmailJS que usaba
// esto se quitó a petición de la dueña (plantilla caducada/borrada en
// EmailJS, fallando en cada pedido; "Pedidos en vivo" + el panel ya avisan
// de sobra sin depender de un tercero externo). Se deja el campo del email
// del local por si sirve para algo más adelante, pero ya no dispara nada.
function loadAdminConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
  } catch {}
  if (window.fb_loadConfig) {
    window.fb_loadConfig().then(c => {
      if (!c) return;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
      Object.assign(CONFIG, c);
      try {
        document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
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
  localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  Object.assign(CONFIG, c);
  if (window.fb_saveConfig) window.fb_saveConfig(c).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración general'); });
  showToast('cfg-toast');
}

// ── HORARIO (edición desde el panel) — updateFooterHorario/diasLabel/
// DIAS_RANGES viven en nucleo-compartido.js porque también los usa el
// flujo de cliente (footer, aviso de cierre). ──
const DIAS_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function toggleDia(btn) {
  btn.classList.toggle('activo');
}
function verDiasGuardados() {
  const NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const raw = localStorage.getItem('dpf_horario');
  const el = document.getElementById('dias-diagnostico');
  if (!el) return;
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
  verDiasGuardados();
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
  const closedMsgMid = document.getElementById('h-closed-msg-mid') ? document.getElementById('h-closed-msg-mid').value.trim() : '';
  const closedMsgNight = document.getElementById('h-closed-msg-night') ? document.getElementById('h-closed-msg-night').value.trim() : '';
  const closedMsgDay = document.getElementById('h-closed-msg-day') ? document.getElementById('h-closed-msg-day').value.trim() : '';
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
  verDiasGuardados();
  logActivity('🕐 Horario actualizado — Días: ' + diasAbiertos.map(d => DIAS_NAMES[d]).join(', '));
}

// ── ABIERTO/CERRADO (acción manual de admin; updateOpenBtn/updateHeroDot
// viven en nucleo-compartido.js porque también los usa el flujo de
// cliente) ──
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
function toggleOrdersAccepting() {
  const next = !getOrdersOpen();
  localStorage.setItem(ORDERS_KEY, next);
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
  // Toggle manual → la auto-pausa se aparta 30 min y no reabre/cierra por su
  // cuenta encima de esta decisión (mismo mecanismo que activarFinDeNoche,
  // con un cooldown más corto porque esto es una pausa del día a día, no un
  // cierre de jornada).
  if (typeof _setAutoPausaEstado === 'function') _setAutoPausaEstado(false, Date.now() + 30 * 60 * 1000);
  updateOrdersUI(next);
  logActivity("🚦 Pedidos: ".concat(next ? 'ACTIVADOS' : 'PAUSADOS'));
}
function toggleOpenStatus() {
  const current = localStorage.getItem(OPEN_KEY) !== 'false';
  const next = !current;
  localStorage.setItem(OPEN_KEY, String(next));
  if (!next) {
    localStorage.setItem('dpf_open_manual_override', '1');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(false).catch(function (e) { _avisarSiFalloGuardado(e, 'estado abierto/cerrado'); });
    firebase.database().ref('config/openManualOverride').set(true).catch(() => {});
  } else {
    localStorage.removeItem('dpf_open_manual_override');
    if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(true).catch(function (e) { _avisarSiFalloGuardado(e, 'estado abierto/cerrado'); });
    firebase.database().ref('config/openManualOverride').set(false).catch(() => {});
  }
  updateOpenBtn(next);
  updateHeroDot(next);
  logActivity("🏪 Local marcado como: ".concat(next ? 'ABIERTO' : 'CERRADO'));
}

// ── GASTOS DE GESTIÓN (guardar desde el panel) ──
function saveFeeConfig(enabled, amount, label) {
  localStorage.setItem(FEE_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE_LABEL_KEY, label);
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function (e) { _avisarSiFalloGuardado(e, 'gastos de gestión'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Gastos de gestión ' + (enabled ? 'activados' : 'desactivados') + ' — ' + amount.toFixed(2) + '€');
}

// ── SEGUNDO GASTO FIJO (guardar desde el panel) ──
function saveFee2Config(enabled, amount, label) {
  localStorage.setItem(FEE2_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE2_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE2_LABEL_KEY, label);
  if (window.fb_saveFee2Config) window.fb_saveFee2Config(enabled, amount, label).catch(function (e) { _avisarSiFalloGuardado(e, 'segundo gasto de gestión'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Otro gasto fijo ' + (enabled ? 'activado' : 'desactivado') + ' — ' + amount.toFixed(2) + '€');
}

// ── DESCUENTO ESTUDIANTE/JUBILADO (guardar desde el panel) ──
function saveStudentDiscountConfig(enabled, pct) {
  localStorage.setItem(STUDENT_DISCOUNT_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(STUDENT_DISCOUNT_PCT_KEY, String(pct));
  if (window.fb_saveStudentDiscountConfig) window.fb_saveStudentDiscountConfig(enabled, pct).catch(function (e) { _avisarSiFalloGuardado(e, 'descuento estudiante/jubilado'); });
  renderCart();
  logActivity((enabled ? '✅' : '⛔') + ' Descuento estudiante/jubilado ' + (enabled ? 'activado' : 'desactivado') + ' — ' + pct + '%');
}

// ── CÓDIGO "PEDIDO DESDE EL LOCAL" (guardar/generar desde el panel) ──
function saveLocalFeeCode(code) {
  const clean = (code || '').trim().toUpperCase();
  localStorage.setItem(LOCAL_FEE_CODE_KEY, clean);
  if (window.fb_saveLocalFeeCode) window.fb_saveLocalFeeCode(clean).catch(function (e) { _avisarSiFalloGuardado(e, 'código de pedido desde el local'); });
  logActivity(clean ? ('🏪 Código "pedido desde el local" actualizado: ' + clean) : '🏪 Código "pedido desde el local" desactivado');
}
function generarCodigoLocalNuevo() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const input = document.getElementById('tc-local-fee-code');
  if (input) input.value = code;
  return code;
}

// ── TIEMPO DE ESPERA ENTRE TICKETS DEL LOCAL (guardar desde el panel) ──
function saveTiendaEsperaMinutos(min) {
  const val = parseInt(min, 10) || 0;
  localStorage.setItem(TIENDA_ESPERA_KEY, String(val));
  if (window.fb_saveTiendaEsperaMinutos) window.fb_saveTiendaEsperaMinutos(val).catch(function (e) { _avisarSiFalloGuardado(e, 'tiempo de espera en tienda'); });
  logActivity('⏱️ Tiempo de espera entre tickets del local: ' + (val ? (val + ' min') : 'desactivado'));
}

// ═══════════════════════════════════════════════════════════
//  AUTO-PAUSA POR SATURACIÓN Y AVISO PREVIO — configuración y evaluación,
//  todo cosa de admin/cocina (ver comentario largo original: quien decide
//  esto es siempre una sesión de admin). El estado PÚBLICO que sí lee
//  cualquier cliente (avisoSaturacionEstado, vía loadAvisoSaturacionFromFirebase)
//  vive en nucleo-compartido.js.
// ═══════════════════════════════════════════════════════════
const AUTO_PAUSA_CONFIG_KEY = 'dpf_auto_pausa_config';
function getAutoPausaConfig() {
  try { return JSON.parse(localStorage.getItem(AUTO_PAUSA_CONFIG_KEY) || '{}'); } catch { return {}; }
}
function saveAutoPausaConfig(enabled, umbral, msg) {
  const cfg = { enabled: !!enabled, umbral: Math.max(1, parseInt(umbral, 10) || 15), msg: msg || '🔥 Estamos a tope ahora mismo. Vuelve a intentarlo en unos minutos.' };
  localStorage.setItem(AUTO_PAUSA_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveAutoPausaConfig) window.fb_saveAutoPausaConfig(cfg.enabled, cfg.umbral, cfg.msg).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración de auto-pausa'); });
  logActivity((cfg.enabled ? '✅' : '⛔') + ' Auto-pausa por saturación ' + (cfg.enabled ? 'activada' : 'desactivada') + ' — a partir de ' + cfg.umbral + ' pedidos pendientes');
}
function loadAutoPausaConfigFromFirebase() {
  if (!window.fb_listenAutoPausaConfig) return;
  window.fb_listenAutoPausaConfig(function (cfg) {
    localStorage.setItem(AUTO_PAUSA_CONFIG_KEY, JSON.stringify(cfg || {}));
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  });
}

const AUTO_PAUSA_ESTADO_KEY = 'dpf_auto_pausa_estado';
function getAutoPausaEstado() {
  try { return JSON.parse(localStorage.getItem(AUTO_PAUSA_ESTADO_KEY) || '{}'); } catch { return {}; }
}
function _setAutoPausaEstado(activa, cooldownUntil) {
  const estado = { activa: !!activa, cooldownUntil: cooldownUntil || 0 };
  localStorage.setItem(AUTO_PAUSA_ESTADO_KEY, JSON.stringify(estado));
  if (window.fb_saveAutoPausaEstado) window.fb_saveAutoPausaEstado(estado.activa, estado.cooldownUntil).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de auto-pausa'); });
}
function loadAutoPausaEstadoFromFirebase() {
  if (!window.fb_listenAutoPausaEstado) return;
  window.fb_listenAutoPausaEstado(function (estado) {
    localStorage.setItem(AUTO_PAUSA_ESTADO_KEY, JSON.stringify(estado || {}));
  });
}

function _aplicarAutoPausa(activar) {
  const cfg = getAutoPausaConfig();
  const estado = getAutoPausaEstado();
  const ahora = Date.now();
  if (estado.cooldownUntil && ahora < estado.cooldownUntil) return; // el admin tiene el control, no tocar nada
  if (activar) {
    if (!getOrdersOpen()) return; // ya está pausado (por lo que sea) — no hay nada que activar
    localStorage.setItem(ORDERS_KEY, 'false');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(cfg.msg || '').catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
    localStorage.setItem(ORDERS_MSG_KEY, cfg.msg || '');
    _setAutoPausaEstado(true, 0);
    updateOrdersUI(false, cfg.msg);
    logActivity('🔥 Auto-pausa activada por saturación (' + cfg.umbral + '+ pedidos pendientes)');
  } else {
    if (!estado.activa) return; // el cierre actual no lo puso la auto-pausa — no reabrir solo
    localStorage.setItem(ORDERS_KEY, 'true');
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(function (e) { _avisarSiFalloGuardado(e, 'estado de pedidos'); });
    _setAutoPausaEstado(false, 0);
    updateOrdersUI(true);
    logActivity('✅ Auto-pausa desactivada — la cola ha bajado, pedidos reactivados solos');
  }
}

function _renderAutoPausaUI() {
  const cfg = getAutoPausaConfig();
  const estado = getAutoPausaEstado();
  const btn = document.getElementById('auto-pausa-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '✅ Activada' : '⛔ Desactivada';
  }
  const umbralInp = document.getElementById('auto-pausa-umbral');
  if (umbralInp && document.activeElement !== umbralInp) umbralInp.value = cfg.umbral || 15;
  const msgInp = document.getElementById('auto-pausa-msg');
  if (msgInp && document.activeElement !== msgInp) msgInp.value = cfg.msg || '';
  const estadoTxt = document.getElementById('auto-pausa-estado-texto');
  if (estadoTxt) estadoTxt.textContent = estado.activa ? '🔥 Pausada AHORA por saturación — se reactivará sola en cuanto baje la cola.' : '';
}
function toggleAutoPausaEnabled() {
  const cfg = getAutoPausaConfig();
  saveAutoPausaConfig(!cfg.enabled, cfg.umbral, cfg.msg);
  _renderAutoPausaUI();
}
function guardarAutoPausaConfig() {
  const umbral = document.getElementById('auto-pausa-umbral').value;
  const msg = document.getElementById('auto-pausa-msg').value.trim();
  saveAutoPausaConfig(getAutoPausaConfig().enabled, umbral, msg);
  _renderAutoPausaUI();
  showToast('auto-pausa-toast');
}

// getAvisoSaturacionConfig/AVISO_SAT_CONFIG_KEY viven en nucleo-compartido.js
// (los necesita saveAvisoSaturacionConfig de aquí abajo).
function saveAvisoSaturacionConfig(enabled, umbral, msg, minutosSalto, minPorPedido) {
  const cfg = {
    enabled: !!enabled,
    umbral: Math.max(1, parseInt(umbral, 10) || 8),
    msg: msg || '⏳ Hay bastante ambiente ahora mismo, tu pedido tardará más de lo habitual.',
    minutosSalto: Math.max(0, parseInt(minutosSalto, 10) || 30),
    minPorPedido: Math.max(0, parseInt(minPorPedido, 10) || 3)
  };
  localStorage.setItem(AVISO_SAT_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveAvisoSaturacionConfig) window.fb_saveAvisoSaturacionConfig(cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido).catch(function (e) { _avisarSiFalloGuardado(e, 'aviso de saturación'); });
  logActivity((cfg.enabled ? '✅' : '⛔') + ' Aviso previo de saturación ' + (cfg.enabled ? 'activado' : 'desactivado') + ' — a partir de ' + cfg.umbral + ' pedidos pendientes');
}
function _renderAvisoSaturacionUI() {
  const cfg = getAvisoSaturacionConfig();
  const btn = document.getElementById('aviso-sat-toggle-btn');
  if (btn) {
    btn.className = 'open-toggle ' + (cfg.enabled ? 'abierto' : 'cerrado');
    btn.textContent = cfg.enabled ? '✅ Activado' : '⛔ Desactivado';
  }
  const setIfNotFocused = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val;
  };
  setIfNotFocused('aviso-sat-umbral', cfg.umbral || 8);
  setIfNotFocused('aviso-sat-salto', cfg.minutosSalto || 30);
  setIfNotFocused('aviso-sat-minpp', cfg.minPorPedido || 3);
  setIfNotFocused('aviso-sat-msg', cfg.msg || '');
}
function toggleAvisoSaturacionEnabled() {
  const cfg = getAvisoSaturacionConfig();
  saveAvisoSaturacionConfig(!cfg.enabled, cfg.umbral, cfg.msg, cfg.minutosSalto, cfg.minPorPedido);
  _renderAvisoSaturacionUI();
}
function guardarAvisoSaturacionConfig() {
  const umbral = document.getElementById('aviso-sat-umbral').value;
  const salto = document.getElementById('aviso-sat-salto').value;
  const minpp = document.getElementById('aviso-sat-minpp').value;
  const msg = document.getElementById('aviso-sat-msg').value.trim();
  saveAvisoSaturacionConfig(getAvisoSaturacionConfig().enabled, umbral, msg, salto, minpp);
  _renderAvisoSaturacionUI();
  showToast('aviso-sat-toast');
}

// ── PAUSA EXPRÉS (botones del panel; la cuenta atrás que ve el cliente
// vive en nucleo-compartido.js) ──
function pausarExpres(minutos) {
  const hasta = Date.now() + Math.max(1, parseInt(minutos, 10) || 15) * 60000;
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(hasta).catch(function (e) { _avisarSiFalloGuardado(e, 'pausa exprés'); });
  localStorage.setItem('dpf_pausa_expres_hasta', String(hasta));
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(hasta);
  logActivity('⏸️ Pausa exprés activada (' + minutos + ' min)');
}
function cancelarPausaExpres() {
  if (window.fb_savePausaExpresHasta) window.fb_savePausaExpresHasta(0).catch(function (e) { _avisarSiFalloGuardado(e, 'pausa exprés'); });
  localStorage.setItem('dpf_pausa_expres_hasta', '0');
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(0);
  logActivity('▶️ Pausa exprés cancelada a mano');
}

// SLOTS_KEY vive en nucleo-compartido.js (bundle de cliente) — lo usa el
// propio checkout (carrito-checkout.js) y el reseteo de medianoche.

// ── VERIFICACIÓN SMS OBLIGATORIA (interruptor de emergencia, ej. Twilio
// caído) — desactivarla hace que cualquiera pueda confirmar un pedido sin
// demostrar que el teléfono es suyo, así que solo debería usarse el tiempo
// justo hasta que el SMS vuelva a funcionar. Mismo patrón visual que el
// botón de "Modo vacaciones" (vacaciones.js) — texto Activado/Desactivado
// en vez de un simple interruptor, para que el estado real se lea de un
// vistazo sin depender del color solo. ──
function _renderSmsVerifBtn(activa) {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  if (!btn) return;
  window._smsVerificacionActivaAdmin = activa;
  btn.textContent = activa ? 'Activado' : '🚨 Desactivado';
  btn.style.background = activa ? '#F5E6C8' : '#c0392b';
  btn.style.color = activa ? '#8A6A4E' : '#fff';
}
function loadSmsVerificacionStatus() {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  if (!btn) return;
  (window.fb_loadSmsVerificacionActiva ? window.fb_loadSmsVerificacionActiva() : Promise.resolve(getSmsVerificacionActiva()))
    .then(activa => _renderSmsVerifBtn(activa !== false))
    .catch(() => { btn.textContent = '⚠️ Error'; });
}
async function toggleSmsVerificacionActivaAdmin() {
  const btn = document.getElementById('sms-verificacion-toggle-btn');
  const nuevoEstado = !window._smsVerificacionActivaAdmin;
  if (btn) btn.textContent = 'Cargando…';
  try {
    if (window.fb_saveSmsVerificacionActiva) await window.fb_saveSmsVerificacionActiva(nuevoEstado);
    localStorage.setItem(SMS_VERIFICACION_ACTIVA_KEY, nuevoEstado ? 'true' : 'false');
    _renderSmsVerifBtn(nuevoEstado);
    logActivity(nuevoEstado ? '📵 Verificación SMS obligatoria reactivada' : '🚨 Verificación SMS DESACTIVADA — cualquiera puede pedir sin confirmar su móvil');
  } catch (e) {
    if (btn) btn.textContent = '⚠️ Error';
  }
}

// ── CONFIGURACIÓN DEL TICKET (guardar desde el panel) ──
function saveTicketConfig(cfg) {
  localStorage.setItem(TICKET_CONFIG_KEY, JSON.stringify(cfg));
  if (window.fb_saveTicketConfig) window.fb_saveTicketConfig(cfg).catch(function (e) { _avisarSiFalloGuardado(e, 'configuración del ticket'); });
  logActivity('🧾 Configuración del ticket actualizada');
}

// Movidas aquí desde finanzas.js (que ya no entra en el bundle admin, ver
// build.js) — estas dos no tienen nada que ver con Finanzas, solo vivían en
// el mismo archivo por casualidad.
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
  document.getElementById('tc-nif').value = tc.nif;
  document.getElementById('tc-despedida').value = tc.despedida;
  document.getElementById('tc-texto-pago').value = tc.textoPago;
  document.getElementById('tc-ancho-papel').value = String(tc.anchoPapel || 80);
  document.getElementById('tc-copias').value = tc.copias || 1;
  const autoEl = document.getElementById('tc-auto-imprimir');
  autoEl.checked = tc.autoImprimir !== false;
  document.getElementById('tc-auto-row').style.background = autoEl.checked ? '#fff' : 'rgba(192,57,43,0.06)';

  // Segundo gasto fijo, descuento estudiante/jubilado, código del local y
  // tiempo de espera — igual patrón que arriba, pero cada uno con su propio
  // getter (ver admin-config.js) en vez de vivir dentro de getTicketConfig().
  const fee2EnabledEl = document.getElementById('tc-fee2-enabled');
  if (fee2EnabledEl) fee2EnabledEl.checked = getFee2Enabled();
  const fee2AmountEl = document.getElementById('tc-fee2-amount');
  if (fee2AmountEl) fee2AmountEl.value = getFee2Amount().toFixed(2);
  const fee2LabelEl = document.getElementById('tc-fee2-label');
  if (fee2LabelEl) fee2LabelEl.value = getFee2Label();

  const studentEnabledEl = document.getElementById('tc-student-discount-enabled');
  if (studentEnabledEl) studentEnabledEl.checked = getStudentDiscountEnabled();
  const studentPctEl = document.getElementById('tc-student-discount-pct');
  if (studentPctEl) studentPctEl.value = getStudentDiscountPct();

  const localCodeEl = document.getElementById('tc-local-fee-code');
  if (localCodeEl) localCodeEl.value = getLocalFeeCode();

  const esperaEl = document.getElementById('tc-tienda-espera');
  if (esperaEl) esperaEl.value = String(getTiendaEsperaMinutos());
}
function openTicketConfigOverlay() {
  document.getElementById('ticket-config-overlay').classList.add('open');
  bimbaPintarTicketConfig();
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
    nif: document.getElementById('tc-nif').value.trim() || TICKET_CONFIG_DEFAULTS.nif,
    despedida: document.getElementById('tc-despedida').value.trim() || TICKET_CONFIG_DEFAULTS.despedida,
    textoPago: document.getElementById('tc-texto-pago').value.trim() || TICKET_CONFIG_DEFAULTS.textoPago,
    anchoPapel: parseInt(document.getElementById('tc-ancho-papel').value, 10) || 80,
    copias: Math.max(1, parseInt(document.getElementById('tc-copias').value, 10) || 1),
    autoImprimir: document.getElementById('tc-auto-imprimir').checked
  };
  saveTicketConfig(cfg);

  // Segundo gasto fijo y descuento estudiante/jubilado se guardan con el
  // mismo botón "Guardar" de este panel — cada uno con su propia función
  // (ver admin-config.js), porque no forman parte de getTicketConfig()/
  // saveTicketConfig() (esas dos solo gestionan el aspecto del ticket).
  const fee2EnabledEl = document.getElementById('tc-fee2-enabled');
  const fee2AmountEl = document.getElementById('tc-fee2-amount');
  const fee2LabelEl = document.getElementById('tc-fee2-label');
  if (fee2EnabledEl && fee2AmountEl && fee2LabelEl) {
    saveFee2Config(
      fee2EnabledEl.checked,
      // Math.max(0, ...) porque un negativo es "truthy" en JS y se colaba
      // sin el aviso pensado solo para NaN/0 — un importe negativo aquí se
      // resta directo del total de cada pedido (carta.js/carrito-checkout.js).
      Math.max(0, parseFloat(fee2AmountEl.value) || 0.50),
      fee2LabelEl.value.trim() || 'Otro gasto fijo'
    );
  }

  const studentEnabledEl = document.getElementById('tc-student-discount-enabled');
  const studentPctEl = document.getElementById('tc-student-discount-pct');
  if (studentEnabledEl && studentPctEl) {
    saveStudentDiscountConfig(
      studentEnabledEl.checked,
      Math.max(0, Math.min(100, parseFloat(studentPctEl.value) || 0))
    );
  }

  if (msgEl) {
    msgEl.style.color = '#27855a';
    msgEl.textContent = '✅ Guardado';
    setTimeout(() => { msgEl.textContent = ''; }, 2500);
  }
}

function savePauseMsg() {
  const msg = document.getElementById('orders-pause-msg').value.trim();
  if (msg) {
    localStorage.setItem(ORDERS_MSG_KEY, msg);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
  } else {
    localStorage.removeItem(ORDERS_MSG_KEY);
    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg('').catch(function (e) { _avisarSiFalloGuardado(e, 'mensaje de pedidos pausados'); });
  }
  updateOrdersUI(getOrdersOpen());
  showToast('local-toast');
}

// ══════════════════════════════════════════════
//  ACCESO AL PANEL — TOKENS GUARDADOS (para mostrarlos/copiarlos en Ajustes)
// ══════════════════════════════════════════════
const URL_TOKEN_KEY = 'dpf_url_token';
const BIMBA_TOKEN_KEY = 'dpf_bimba_token';
function getUrlToken() {
  return localStorage.getItem(URL_TOKEN_KEY) || '';
}
function getBimbaToken() {
  return localStorage.getItem(BIMBA_TOKEN_KEY) || '';
}

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

// ══════════════════════════════════════════════
//  LOG DE ACTIVIDAD — VISTA DE ADMIN
// ══════════════════════════════════════════════
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
  // 🎁 también cuenta como alerta: aviso de "cliente completó sus 10
  // sellos" (fidelizacion.php) — no es un fallo, pero igual necesita que
  // caja se entere y lo marque como visto/entregado.
  return typeof action === 'string' && (action.indexOf('⚠️') === 0 || action.indexOf('🚨') === 0 || action.indexOf('🎁') === 0);
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
// por logActivity() (nucleo-compartido.js) como por resolverAlerta() al
// marcar una entrada.
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
    // Camino rápido: si el pedido está en el caché local de hoy (el caso más
    // común, mismo dispositivo/día), se usa sin ir al servidor. Si no —
    // otra tablet distinta a la que recibió el pedido, o al día siguiente—
    // se pide a guardar-pedido.php (acción 'obtenerTicket'), que sí lee
    // directamente el ticket real de Firebase en vez de depender de lo que
    // haya en localStorage de ESTE dispositivo.
    let ticketData;
    if (order) {
      ticketData = {
        orderNum: order.num,
        name: order.name,
        phone: order.phone || '',
        notes: order.notes || '',
        slotTime: order.slot || null,
        items: order.items || [],
        total: order.total,
        time: order.time
      };
    } else {
      const res = await fetch('guardar-pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'obtenerTicket', orderNum, fecha })
      });
      const data = await res.json();
      if (!data.success || !data.ticket) throw new Error(data.error || 'No se encontró el pedido');
      ticketData = {
        orderNum: data.ticket.orderNum,
        name: data.ticket.name,
        phone: data.ticket.phone || '',
        notes: data.ticket.notes || '',
        slotTime: data.ticket.slotTime || null,
        items: data.ticket.items || [],
        total: data.ticket.total,
        time: data.ticket.time
      };
    }
    // Pasa por _ptEnFila() igual que cualquier otro ticket — si no, este
    // reintento manual podía intercalarse con un pedido nuevo
    // auto-imprimiéndose justo en ese instante (ver el porqué en
    // _autoImprimirPedido más abajo).
    const _ptEjecutarReintento = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
    await _ptEjecutarReintento(() => imprimirTicketTermico(ticketData));
    // ticketData.orderNum, no order.num — order es null en el camino que
    // pide el ticket a guardar-pedido.php (pedido de otro dispositivo o de
    // un día anterior, justo el caso más típico de un reintento desde
    // Alertas). Usar order.num ahí reventaba con un TypeError DESPUÉS de
    // que el ticket ya hubiera salido bien por la térmica: el aviso
    // mostraba "no se pudo imprimir" con el pedido ya impreso, y ni se
    // marcaba como resuelto ni se quitaba de la cola pendiente.
    if (typeof _markAsImpreso === 'function') _markAsImpreso(ticketData.orderNum);
    if (typeof _registrarEnvioTicket === 'function') _registrarEnvioTicket(ticketData.orderNum, true);
    // Si este pedido seguía en la cola de impresión pendiente, sacarlo —
    // si no, se queda "pendiente" para siempre aunque ya se imprimió aquí,
    // y se podría volver a imprimir por duplicado al reconectar.
    if (typeof _ptColaQuitar === 'function') _ptColaQuitar(ticketData.orderNum);
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
async function reintentarSelloFidelizacion(ts, orderNum, telefono, nombre, fecha) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    // "fecha" es la fecha real del pedido (guardada en la propia alerta) —
    // antes no se mandaba y el servidor siempre buscaba el ticket en el día
    // de HOY, así que reintentar un día después de que ocurriera el fallo
    // fallaba siempre con "pedido no encontrado", aunque el ticket sí
    // existiera (bajo la fecha real, no la de hoy).
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'registrarSello', telefono, orderNum, tienePatata: true, consumioPremio: false, nombre: nombre || '', fecha: fecha || '' })
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
// Reintenta ANULAR un sello que falló al cancelar/modificar un pedido —
// mismo botón de Alertas que reintentarSelloFidelizacion pero en sentido
// contrario. Sin esto el cliente se quedaba con un sello (o una patata
// gratis ya canjeada) de un pedido que ya no existe, para siempre.
async function reintentarRevertirSelloFidelizacion(ts, orderNum, telefono) {
  const card = document.getElementById(_alertaDomId(ts));
  const statusEl = card && card.querySelector('.alerta-retry-status');
  const btn = card && card.querySelector('.alerta-retry-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Reintentando…'; }
  try {
    const res = await fetch('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revertirSello', telefono, orderNum })
    });
    const data = await res.json();
    if (data.success) {
      resolverAlerta(ts);
    } else {
      throw new Error(data.error || 'El servidor rechazó la reversión');
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '↩️ Reintentar anular'; }
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

  // Copia de seguridad: la escribe backup-firebase.php (cron nocturno,
  // fuera de public_html) tras cada intento, éxito o fallo. Si el cron
  // dejara de ejecutarse del todo (Hostinger lo desactiva, se borra...) no
  // habría ningún error que reportar — por eso además de mirar "ok" se
  // comprueba que no lleve demasiado tiempo sin actualizarse. Backup diario
  // + margen de sobra para que un cron un poco tarde no dispare una alerta
  // falsa.
  let backupOk = null, backupTexto = 'Sin datos todavía';
  try {
    const bs = window.fb_loadBackupStatus ? await window.fb_loadBackupStatus() : null;
    if (bs && bs.ts) {
      const horasDesde = (Date.now() - bs.ts) / 3600000;
      if (!bs.ok) {
        backupOk = false;
        backupTexto = 'Falló: ' + (bs.error || 'error desconocido');
      } else if (horasDesde > 26) {
        backupOk = false;
        backupTexto = 'Sin copia reciente (última hace ' + Math.round(horasDesde) + ' horas)';
      } else {
        backupOk = true;
        backupTexto = 'Hace ' + (horasDesde < 1 ? 'menos de 1 hora' : Math.round(horasDesde) + ' horas');
      }
    }
  } catch (e) {}

  const resultados = [
    { nombre: 'Firebase (base de datos)', ok: fbOk },
    { nombre: 'Servidor de pedidos', ok: servidorOk },
    { nombre: 'Impresora térmica (este dispositivo)', ok: impresoraConectada }
  ];
  // "Último pedido recibido" no es un ✅/❌ (no siempre tiene por qué haber
  // pedidos recientes, p.ej. fuera de horario) — es solo informativo, para
  // ver de un vistazo si la web sigue "viva" de verdad. window._ultimoPedidoTs
  // lo actualiza _renderLiveOrders() cada vez que llega la lista de pedidos
  // del día por el listener en tiempo real.
  let ultimoPedidoTexto = 'Sin pedidos recibidos hoy en este dispositivo';
  if (window._ultimoPedidoTs) {
    const minsAtras = Math.max(0, Math.round((Date.now() - window._ultimoPedidoTs) / 60000));
    ultimoPedidoTexto = minsAtras < 1 ? 'Hace menos de 1 minuto' : minsAtras === 1 ? 'Hace 1 minuto' : 'Hace ' + minsAtras + ' minutos';
  }
  el.innerHTML = resultados.map(r => {
    const icono = r.ok === null ? '⚪' : r.ok ? '✅' : '❌';
    const color = r.ok === null ? 'var(--muted)' : r.ok ? '#166534' : '#c0392b';
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0"><span style="color:var(--text)">' + r.nombre + '</span><span style="font-weight:700;color:' + color + '">' + icono + '</span></div>';
  }).join('')
    + '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0"><span style="color:var(--text)">🕓 Último pedido recibido</span><span style="font-weight:700;color:var(--muted)">' + ultimoPedidoTexto + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:2px 0;gap:8px"><span style="color:var(--text)">💾 Copia de seguridad</span><span style="font-weight:700;color:' + (backupOk === null ? 'var(--muted)' : backupOk ? '#166534' : '#c0392b') + ';text-align:right">' + (backupOk === false ? '❌ ' : backupOk ? '✅ ' : '') + escapeHtml(backupTexto) + '</span></div>'
    + '<div style="font-size:10.5px;color:var(--muted);margin-top:8px">Última comprobación: ' + new Date().toLocaleTimeString('es-ES') + '</div>';
}

// Botón "🖨️ Probar todo" del panel de Alertas — pensado para pasarlo antes
// de abrir el local: comprueba Firebase/servidor/impresora (como
// comprobarEstadoSistema) y, si la impresora está conectada, imprime además
// un ticket de prueba de verdad, para saber que todo funciona antes de que
// llegue el primer pedido real del día.
async function comprobarTodoAntesDeAbrir() {
  const btn = document.getElementById('btn-comprobar-todo');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Comprobando…'; }
  try {
    await comprobarEstadoSistema(true);
    const impresoraConectada = typeof _ptIsConnected === 'function' && _ptIsConnected();
    if (impresoraConectada && typeof imprimirTicketPrueba === 'function') {
      await imprimirTicketPrueba();
      alert('✅ Comprobación completa. Revisa el panel de estado del sistema — y si ha salido un ticket de prueba de la impresora, todo listo para abrir.');
    } else {
      alert('✅ Firebase y servidor comprobados (mira el panel de arriba). ⚠️ La impresora no está conectada ahora mismo — conéctala primero para poder probarla también.');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🖨️ Probar todo'; }
  }
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
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarSelloFidelizacion('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.telefono), "','").concat(escapeAttr(e.nombre || ''), "','").concat(escapeAttr(e.fecha || ''), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">🎁 Reintentar sello</button>");
      } else if (e.tipo === 'sello_no_revertido' && e.orderNum && e.telefono) {
        retryBtn = "<button class=\"alerta-retry-btn\" onclick=\"reintentarRevertirSelloFidelizacion('".concat(escapeAttr(e.ts), "','").concat(escapeAttr(e.orderNum), "','").concat(escapeAttr(e.telefono), "')\" style=\"padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">↩️ Reintentar anular</button>");
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
//  AUTO-BORRADO DEL HISTORIAL — UI DE ADMIN
// ══════════════════════════════════════════════
function saveAutoDelete() {
  const sel = document.getElementById('autodelete-days');
  if (!sel) return;
  const days = parseInt(sel.value, 10);
  localStorage.setItem(AUTODELETE_KEY, days);
  if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(days).catch(() => {});
  applyAutoDelete();
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : "✅ Se borrar\xE1n entradas con m\xE1s de ".concat(days, " d\xEDas");
  logActivity("⚙️ Auto-borrado historial configurado: ".concat(days === 0 ? 'desactivado' : days + ' días'));
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
  // Antes el mínimo eran 4 caracteres — con AES-GCM + PBKDF2 (100.000
  // iteraciones, ver más abajo) una contraseña tan corta se prueba entera
  // por fuerza bruta en poco tiempo si el archivo cifrado cae en malas
  // manos. 8 caracteres no la hace irrompible, pero sí mucho más cara de
  // atacar sin ser incómoda de recordar para un backup ocasional.
  if (!pwd || pwd.length < 8) {
    errEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
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
  let s = String(str == null ? '' : str);
  // Antes de escapar comillas: si el campo empieza por un carácter que
  // Excel/Sheets interpreta como inicio de fórmula (=, +, -, @), se le
  // antepone una comilla simple para que se trate como texto literal, no
  // como fórmula — sin esto, un nombre de cliente como "=HYPERLINK(...)" o
  // "=cmd|'/C calc'!A0" se ejecuta como fórmula real al abrir el CSV
  // exportado (inyección de fórmulas CSV: puede robar datos o ejecutar
  // comandos desde la hoja de cálculo de quien lo abra).
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.replace(/"/g, '""');
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
      rows.push("".concat(day.date, ",").concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat((o.total || 0).toFixed(2)));
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
    rows.push("".concat(o.num, ",\"").concat(_csvEscape(o.name), "\",").concat(o.time, ",").concat(o.slot || '', ",").concat((o.total || 0).toFixed(2)));
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
  // Los nombres de producto/extras vienen de lo que el navegador mandó a
  // guardar-pedido.php — pueden manipularse con una petición directa al
  // servidor (sin pasar por la web), así que hay que escaparlos igual que
  // nombre/teléfono/notas de abajo, no son más de fiar que esos.
  let itemsHTML = items.map(_ref21 => {
    let n = escapeHtml(_ref21.name),
      qty = _ref21.qty,
      subtotal = _ref21.subtotal,
      extras = _ref21.extras;
    const right = subtotal.toFixed(2) + ' €';
    const label = qty + 'x ' + n;
    if (extras && extras.length > 0) {
      const extrasList = extras.map(function(e) {
        const extraName = escapeHtml((e && e.name) ? e.name : e);
        const extraPrice = (e && e.price) ? '+' + parseFloat(e.price).toFixed(2).replace('.', ',') + ' €' : '';
        return '<div style="display:flex;justify-content:space-between"><span>&nbsp;&nbsp;&nbsp;\xB7 ' + extraName + '</span>' + (extraPrice ? '<span style="color:#aaa">' + extraPrice + '</span>' : '') + '</div>';
      }).join('');
      return '<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-weight:bold"><span>' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div><div style="font-size:10px;color:#333;line-height:1.8;margin-top:1px">' + extrasList + '</div></div>';
    } else if (label.length <= 26) {
      return '<div style="display:flex;justify-content:space-between"><span style="flex:1">' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div>';
    } else {
      return '<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">' + label + '</div><div style="text-align:right;font-weight:bold">' + right + '</div></div>';
    }
  }).join('');

  // El nombre/teléfono/notas los escribe el propio cliente en el checkout
  // (solo se les limita la longitud, no los caracteres) y este HTML se
  // inyecta luego con innerHTML en el panel de admin al ver/imprimir el
  // ticket — sin escapar, un nombre o nota con <script> o <img onerror=...>
  // se ejecutaría en el navegador de quien lo abra con su sesión de admin.
  const nameSafe = escapeHtml(name || '');
  const notesSafe = escapeHtml(notes || '');
  const phoneSafe = escapeHtml(phone || '');
  // slotTime también viene del pedido (falsificable con un POST directo a
  // guardar-pedido.php, igual que name/phone/notes de arriba) — se quedó
  // sin escapar aquí por descuido: banner-pdf.js sí escapa este mismo
  // campo (escapeHtml(slot)) en su propia exportación.
  const slotTimeSafe = escapeHtml(slotTime || '');

  const headerRow = slotTime
    ? '<div style="display:flex;align-items:stretch;margin:4px 0"><div style="flex:1;padding-right:10px;text-align:center"><div style="font-size:9px;color:#555;letter-spacing:1px;text-transform:uppercase">Hora recogida</div><div style="font-size:22px;font-weight:bold">' + slotTimeSafe + 'h</div></div><div style="width:1px;background:#000;margin:2px 0"></div><div style="flex:1;padding-left:10px;display:flex;align-items:center;justify-content:center"><div style="font-size:18px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:1px">' + nameSafe.toUpperCase().replace(' ', '<br>') + '</div></div></div>'
    : '<div style="font-size:22px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:4px 0">' + nameSafe.toUpperCase() + '</div>';

  return "\n    <div style=\"text-align:center;margin-bottom:6px\">\n      <div style=\"font-size:15px;font-weight:bold;letter-spacing:1px\">" + tc.nombre + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.direccion + "</div>\n      <div style=\"font-size:10px;color:#555\">" + tc.telefono + "</div>\n      " + (tc.nif ? '<div style="font-size:10px;color:#555">NIF ' + tc.nif + '</div>' : '') + "\n    </div>\n    <div style=\"border-top:2px solid #000;margin:6px 0\"></div>\n    " + headerRow + "\n    " + (phoneSafe ? '<div style="font-size:11px;color:#555;text-align:center;margin-bottom:2px">Tlfno. ' + phoneSafe + '</div>' : '') + "\n    <div style=\"border-top:1.5px solid #000;margin:6px 0 4px\"></div>\n    <div style=\"font-size:18px;font-weight:bold;text-align:center;letter-spacing:3px\">PEDIDO ".concat(orderNum, "</div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-bottom:4px\">").concat(time, "</div>\n    <div style=\"border-top:1.5px solid #000;margin:4px 0 6px\"></div>\n    <div style=\"font-size:11px\">").concat(itemsHTML, "</div>\n    <div style=\"border-top:1px dashed #000;margin:6px 0\"></div>\n    <div style=\"display:flex;justify-content:space-between;font-size:13px;font-weight:bold\">\n      <span>TOTAL</span><span>").concat(total.toFixed(2), " €</span>\n    </div>\n    <div style=\"font-size:10px;text-align:center;color:#555;margin-top:2px\">").concat(tc.textoPago, "</div>\n    ").concat(notesSafe ? "<div style=\"border-top:1px dashed #000;margin:6px 0\"></div><div style=\"font-size:10px\"><b>NOTAS:</b> ".concat(notesSafe, "</div>") : '', "\n    <div style=\"border-top:1px dashed #000;margin:8px 0\"></div>\n    <div style=\"text-align:center;font-size:10px;color:#555\">").concat(tc.despedida, "</div>\n    <div style=\"margin-bottom:16px\"></div>\n  ");
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
function _imprimirConReintentos(ticketData, intentosRestantes, esperaMs, desdeCopia) {
  return imprimirTicketTermico(ticketData, desdeCopia).catch(e => {
    if (intentosRestantes <= 1) throw e;
    // Reanudar desde la copia que falló (e.copiaFallidaDesde, marcada por
    // imprimirTicketTermico), no desde la 0 — si no, con más de 1 copia
    // configurada, un corte a mitad de imprimir hacía que el reintento
    // volviera a sacar por la impresora las copias anteriores que ya
    // habían salido bien.
    const siguienteDesde = typeof e.copiaFallidaDesde === 'number' ? e.copiaFallidaDesde : 0;
    return new Promise(resolve => setTimeout(resolve, esperaMs))
      .then(() => _imprimirConReintentos(ticketData, intentosRestantes - 1, esperaMs, siguienteDesde));
  });
}
function doPrint() {
  if (!currentTicketData) return;
  const orderNum = currentTicketData.orderNum;
  const ticketData = currentTicketData;

  // Imprimir de verdad en la térmica (WebUSB) — el registro de abajo refleja
  // este resultado (si de verdad salió por la impresora), no el guardado en Firebase.
  // Pasa por _ptEnFila() para no intercalarse con otro ticket que se esté
  // imprimiendo a la vez (auto-imprimir de un pedido nuevo, la cola
  // pendiente...) — ver el porqué en impresora-termica.js.
  const _ptEjecutarImpresion = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  _ptEjecutarImpresion(() => _imprimirConReintentos(ticketData, 3, 1500)).then(() => {
    _markAsImpreso(orderNum);
    _registrarEnvioTicket(orderNum, true);
    // Si este pedido ya estaba en la cola de pendientes (por un fallo
    // anterior) y ahora se ha impreso bien por esta vía, hay que sacarlo
    // de la cola — si no, se queda "pendiente" para siempre aunque ya
    // salió por la térmica, y encima se podría reimprimir por duplicado
    // al reconectar.
    if (typeof _ptColaQuitar === 'function') _ptColaQuitar(orderNum);
  }).catch(e => {
    console.warn('[Impresora] error al imprimir tras varios intentos', e);
    _registrarEnvioTicket(orderNum, false);
    _avisarFalloEnvioTicket(orderNum);
    if (typeof _ptColaAgregar === 'function') _ptColaAgregar(ticketData);
    alert('⚠️ No se pudo imprimir en la térmica (' + e.message + '). Se abrirá el diálogo de impresión del navegador como alternativa. En cuanto la impresora vuelva a conectar, este ticket se reimprimirá solo.');
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
// Antes, si había más de un dispositivo con sesión de admin y
// "auto-imprimir" activado (una tablet de repuesto, el móvil de un
// encargado...), cada uno detectaba el pedido nuevo por su cuenta y lo
// imprimía sin coordinarse con los demás — mismo pedido, varias copias en
// cocina. Usa una transacción real de Firebase (config/impresionesAutoClaim,
// vía fb_transactJsonString) para que solo el primer dispositivo que llegue
// "gane" ese pedido; si la propia reclamación falla por un problema de red
// (no porque ya esté reclamada), se imprime igual — es mejor arriesgarse a
// una copia de más por un fallo puntual que perder la impresión automática
// del todo.
async function _reclamarImpresionAuto(orderNum) {
  if (!orderNum || !window.fb_transactJsonString) return true;
  // Un nodo por día (igual que usedOrderNums/<fecha> y demás estructuras de
  // este estilo) — así no crece sin límite para siempre, cada día es un
  // mapa pequeño y aparte.
  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    const resultado = await window.fb_transactJsonString('config/impresionesAutoClaim/' + todayKey, current => {
      const mapa = (current && typeof current === 'object') ? current : {};
      if (mapa[orderNum]) return undefined; // ya reclamado por otro dispositivo: abortar sin escribir
      mapa[orderNum] = Date.now();
      return mapa;
    });
    return !!(resultado && resultado[orderNum]);
  } catch (e) {
    console.warn('[impresora] no se pudo reclamar la impresión automática, se imprime igual', e);
    return true;
  }
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
    esPedidoLocal: order.esPedidoLocal || false,
    esEstudianteJubilado: order.esEstudianteJubilado || false,
    fidelizacionElegible: order.fidelizacionElegible || false
  };

  // Imprimir de verdad en la térmica (WebUSB) en esta tablet — con
  // reintentos automáticos antes de avisar (ver _imprimirConReintentos).
  // Pasa por _ptEnFila() porque si llegan varios pedidos casi a la vez
  // (varios clientes pidiendo en el mismo minuto), _nuevosPedidos.forEach()
  // más abajo llama a esta función varias veces seguidas SIN esperar a que
  // termine la anterior — sin esta fila, los bytes de dos tickets distintos
  // podían intercalarse a mitad de envío por Bluetooth/USB y la impresora
  // se quedaba sin imprimir ninguno de los dos ("se volvía loca").
  const _ptEjecutarImpresionAuto = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  _ptEjecutarImpresionAuto(() => _imprimirConReintentos(ticketData, 3, 1500))
    .then(() => {
      _markAsImpreso(order.num);
      _registrarEnvioTicket(order.num, true);
      // Al imprimirse solo (auto-imprimir), pasa a "En preparación" — igual
      // que ya hacía el botón de imprimir manual, pero esto faltaba aquí.
      if (typeof getOrderStatus === 'function' && getOrderStatus(order.num) === 'nuevo') {
        setOrderStatus(order.num, 'recibido').catch(() => {});
      }
    })
    .catch(e => {
      console.warn('[Impresora] auto-imprimir falló para ' + order.num + ' tras varios intentos', e);
      _registrarEnvioTicket(order.num, false);
      _avisarFalloEnvioTicket(order.num);
      if (typeof _ptColaAgregar === 'function') _ptColaAgregar(ticketData);
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
// _lastTicketData vive en nucleo-compartido.js (bundle de cliente) — lo
// asigna carrito-checkout.js en cada pedido y lo lee tanto recordOrderStats
// (cliente) como printLastTicket/aquí abajo (admin).
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

// ── PEDIDOS EN VIVO ──
// ORDER_STATUS_KEY, _normOrderKey, getOrderStatus, getOrderStatuses viven en
// nucleo-compartido.js (bundle de cliente) — el aviso de saturación los
// necesita para cualquier visitante, no solo para admin.

// ── AUTO-PAUSA / AVISO DE SATURACIÓN — evaluación ──
// Se llama desde 3 sitios (fb_listenStats, fb_listenOrderStatuses,
// refreshKitchenGrid) cada vez que cambia el nº de pedidos pendientes de
// verdad (ni listo, ni cancelado, ni entregado) — ver admin-config.js para
// el resto de la lógica (_aplicarAutoPausa, _setAvisoSaturacionEstado).
function _comprobarAutoPausaSaturacion(pendientes) {
  if (typeof getAutoPausaConfig !== 'function' || typeof _aplicarAutoPausa !== 'function') return;
  const cfg = getAutoPausaConfig();
  if (!cfg.enabled) return;
  const umbral = cfg.umbral || 15;
  // Histéresis: se reactiva sola con bastante menos pendientes de los que
  // hicieron falta para pausar (no al primer pedido que baje de X) — si no,
  // con la cola justo en el umbral, pausaría y reabriría sin parar cada vez
  // que se marca/llega un pedido.
  const umbralReapertura = Math.max(1, Math.floor(umbral * 0.6));
  if (pendientes >= umbral) {
    _aplicarAutoPausa(true);
  } else if (pendientes <= umbralReapertura) {
    _aplicarAutoPausa(false);
  }
}
function _actualizarAvisoSaturacion(pendientes) {
  if (typeof getAvisoSaturacionConfig !== 'function' || typeof _setAvisoSaturacionEstado !== 'function') return;
  const cfg = getAvisoSaturacionConfig();
  const activo = !!(cfg.enabled && pendientes >= (cfg.umbral || 8));
  // Solo escribe de verdad si esta sesión tiene permiso de admin en Firebase
  // (cualquier otra llamada falla en silencio, ver el .catch en
  // _setAvisoSaturacionEstado) — no hace falta comprobarlo aquí a mano.
  _setAvisoSaturacionEstado(activo, activo ? cfg.msg : '');
}

// Antes, si esta escritura a Firebase fallaba (wifi floja un instante), solo
// quedaba un console.warn — esta misma tablet marcaba el pedido como
// gestionado en su propia pantalla/localStorage, pero el resto de
// dispositivos (fuente de verdad: Firebase) lo seguían viendo "nuevo".
// Riesgo real con dos tablets de cocina a la vez: se prepara por duplicado,
// o nadie lo entrega porque cada dispositivo cree que ya lo hizo otro.
// Ahora reintenta unas veces con espera creciente, y si aun así no consigue
// escribir, deja un aviso en Alertas (visible para el resto del personal,
// no solo en la consola de ESE dispositivo).
async function setOrderStatus(num, status) {
  const key = _normOrderKey(num);
  window._orderStatusCache[key] = status;
  // Save to localStorage as fallback
  localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
  // Sync to Firebase (fb_setOrderStatus ya normaliza internamente, pasamos clave original)
  if (!window.fb_setOrderStatus) return;
  const _esperas = [800, 2500, 6000];
  for (let intento = 0; intento <= _esperas.length; intento++) {
    try {
      await window.fb_setOrderStatus(num, status);
      return;
    } catch (e) {
      console.warn('Firebase status error (intento ' + (intento + 1) + ')', e);
      if (intento < _esperas.length) {
        await new Promise(r => setTimeout(r, _esperas[intento]));
      } else if (typeof logActivity === 'function') {
        logActivity('🚨 No se pudo sincronizar el estado "' + status + '" del pedido ' + num + ' con el resto de dispositivos — revísalo a mano en "Pedidos en vivo"');
      }
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
  // Repintar los paneles de auto-pausa/aviso previo/pausa exprés con lo que
  // ya haya en caché — sus propios listeners de Firebase (registrados desde
  // el arranque de la página, antes de que admin-shell.html exista en el
  // DOM) pueden no volver a dispararse hasta que cambie algo, así que sin
  // esto se quedarían en "Cargando…" hasta el primer cambio real.
  if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
  if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
  if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI(parseInt(localStorage.getItem('dpf_pausa_expres_hasta') || '0', 10));
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
  // Guarda cuándo llegó el pedido más reciente — lo usa el panel "Estado
  // del sistema" para mostrar "Último pedido: hace X min" de un vistazo.
  (stats.orders || []).forEach(o => {
    if (typeof o.ts === 'number' && o.ts > (window._ultimoPedidoTs || 0)) window._ultimoPedidoTs = o.ts;
  });
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
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" data-phone="' + escapeAttr(o.phone||'') + '" onclick="cancelarPedidoAdmin(this.dataset.num,this.dataset.phone)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>'
      : '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" onclick="setLiveStatus(this.dataset.num,\'entregado\')" style="background:#F0FDF4;color:#166534;border:0.5px solid #86EFAC">✅ Entregado</button>'
        + '<button class="kbtn kbtn-delete" data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot)">🖨️</button>'
        + '<button class="kbtn" data-num="' + escapeAttr(o.num) + '" data-phone="' + escapeAttr(o.phone||'') + '" onclick="cancelarPedidoAdmin(this.dataset.num,this.dataset.phone)" style="background:#FEF2F2;color:#991B1B;border:0.5px solid #FCA5A5">✕</button>';
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
// ── Wake Lock: evita que la tablet de cocina entre en reposo ─────────────
// Si la pantalla se apaga sola por inactividad, a veces corta la conexión
// USB/Bluetooth con la impresora sin avisar. Mientras la pantalla de cocina
// esté abierta, se le pide al navegador que mantenga la pantalla encendida.
// No lo soportan todos los navegadores/dispositivos — si falla, se ignora:
// solo se pierde este extra, no rompe nada más.
let _kitchenWakeLock = null;
async function _pedirWakeLockCocina() {
  if (!('wakeLock' in navigator)) return;
  try {
    _kitchenWakeLock = await navigator.wakeLock.request('screen');
    _kitchenWakeLock.addEventListener('release', () => { _kitchenWakeLock = null; });
  } catch (e) {
    // P.ej. si la pestaña no está visible justo en ese instante — se
    // reintenta solo en cuanto vuelva a estar visible (ver visibilitychange
    // más abajo).
  }
}
function _soltarWakeLockCocina() {
  if (_kitchenWakeLock) { _kitchenWakeLock.release().catch(() => {}); _kitchenWakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  const km = document.getElementById('kitchen-mode');
  if (document.visibilityState === 'visible' && km && km.classList.contains('open') && !_kitchenWakeLock) {
    _pedirWakeLockCocina();
  }
});

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
  _pedirWakeLockCocina();
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
  _soltarWakeLockCocina();
  // _adminLoggedIn permanece true — alertas siguen activas en cualquier pantalla
  document.getElementById('admin-overlay').style.display = '';
  // Mientras se estaba en Modo Cocina, la pestaña "Pedidos en tiempo real"
  // de detrás se quedó tal cual estaba al entrar — cocina refresca su
  // propia cuadrícula sola cada 15s (refreshKitchenGrid), pero eso no
  // repinta esta otra lista. Sin esto, al salir se veían pedidos nuevos o
  // cambios de estado (marcado como listo/entregado desde otro
  // dispositivo mientras tanto) solo cuando algo más disparara un refresco.
  if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadLiveOrders();
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
    // Botón de (re)imprimir — Modo Cocina solo traía "Entregado"/"✕", así que
    // si autoImprimir estaba desactivado o un ticket fallaba, quien
    // trabajaba solo desde aquí no tenía forma de reimprimirlo sin salir al
    // panel normal (donde este mismo botón ya existía, ver _buildCard más
    // arriba). Mismo onclick que allí: imprime y, si el pedido seguía
    // "nuevo", lo pasa a "recibido" — _markAsImpreso() ya se ocupa de
    // marcarlo como visto para la alarma de "pedido nuevo".
    const printBtnK = '<button data-num="' + escapeAttr(o.num) + '" data-name="' + escapeAttr(o.name) + '" data-time="' + escapeAttr(o.time) + '" data-total="' + parseFloat(o.total) + '" data-slot="' + escapeAttr(o.slot||'') + '" onclick="printOrderFromStats(this.dataset.num,this.dataset.name,this.dataset.time,this.dataset.total,this.dataset.slot);_markAsImpreso(this.dataset.num);if(getOrderStatus(this.dataset.num)===&quot;nuevo&quot;){setOrderStatus(this.dataset.num,&quot;recibido&quot;).catch(()=>{})}" style="width:52px;background:#3D1F0D;color:#F4C430;border:none;border-radius:10px;font-size:20px;cursor:pointer">🖨️</button>';
    const btnsHtml = '<div style="display:flex;gap:8px;margin-top:4px">' + '<button onclick="setLiveStatus(\'' + escapeAttr(o.num) + '\',\'entregado\')" style="flex:1;padding:14px;background:#27855a;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:900;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Entregado</button>' + printBtnK + '<button onclick="cancelarPedidoAdmin(\'' + escapeAttr(o.num) + '\',\'' + escapeAttr(o.phone||'') + '\')" style="width:52px;background:#666;color:#e74c3c;border:none;border-radius:10px;font-size:22px;font-weight:900;cursor:pointer">✕</button>' + '</div>';
    return '<div class="kitchen-card status-' + status + newClass + '" style="' + cardStyleFinal + '">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' + '<div class="kitchen-card-num">' + escapeHtml(o.num) + (isUrgent ? ' 🔴' : '') + localBadgeK + estudianteBadgeK + '</div>' + (o.slot ? '<span style="background:#3D1F0D33;color:#3D1F0D;font-size:20px;font-weight:900;padding:5px 14px;border-radius:99px;border:1.5px solid #3D1F0D44">🕐 ' + escapeHtml(o.slot) + '</span>' : '') + '</div>' + '<div class="kitchen-card-name">' + escapeHtml(o.name) + '</div>' + '<div style="font-size:12px;color:' + timeColor + ';font-weight:700;margin-bottom:6px">' + (o.time ? 'Pedido: ' + escapeHtml(o.time) : '') + (slotLabel ? (o.time ? ' · ' : '') + escapeHtml(slotLabel) : '') + (isUrgent ? ' — URGENTE!' : '') + '</div>' + '<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;margin-bottom:4px">' + '<div style="font-size:10px;color:#555;font-weight:700;text-transform:uppercase;margin-bottom:6px">PRODUCTOS:</div>' + itemsHtml + '</div>' + '<div class="kitchen-status-btns">' + btnsHtml + '</div>' + '</div>';
  }).join('');
}

// ── SONIDO CONFIGURABLE ──
// SOUND_KEY vive en nucleo-compartido.js (bundle de cliente) — init.js
// cachea la config de sonido para cualquier visitante nada más cargar,
// aunque solo la USE el panel de admin/cocina.
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
// Sonido de "impresora desconectada" — aparte del de nuevo pedido, para
// que se puedan distinguir a oído. Solo el tipo (mismo volumen que el de
// nuevo pedido, no hace falta duplicar ese control).
const SOUND_DESCONEXION_KEY = 'dpf_sound_desconexion_config';
function getSoundDesconexionType() {
  try {
    const cfg = JSON.parse(localStorage.getItem(SOUND_DESCONEXION_KEY) || '{}');
    return cfg.type || 'urgente';
  } catch { return 'urgente'; }
}
function saveSoundDesconexionConfig() {
  const sel = document.getElementById('sound-desconexion-type');
  const type = (sel && sel.value) || 'urgente';
  localStorage.setItem(SOUND_DESCONEXION_KEY, JSON.stringify({ type }));
  showToast('local-toast');
  logActivity('🔌 Sonido de desconexión configurado: ' + type);
}
function loadSoundDesconexionConfigUI() {
  const sel = document.getElementById('sound-desconexion-type');
  if (sel) sel.value = getSoundDesconexionType();
}
function testSoundDesconexion() {
  const sel = document.getElementById('sound-desconexion-type');
  playNotificationSound((sel && sel.value) || 'urgente');
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
// _lastKnownOrderCount vive en nucleo-compartido.js (bundle de cliente) —
// lo actualiza también el listener en tiempo real de Firebase para
// cualquier visitante (initFirebaseListeners), no solo este polling de
// respaldo cuando Firebase no está disponible.
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
  // setOrderStatus() por sí sola NO toca el contador de la alarma de
  // "pedido nuevo" (eso solo lo hace _marcarPedidoAtendido, ver
  // setLiveStatus() más arriba) — sin esto, marcar todos como listos desde
  // aquí dejaba la alarma sonando para siempre, sin ninguna forma de
  // pararla salvo salir de Modo Cocina a otra pestaña del panel.
  aCambiar.forEach(o => { setOrderStatus(o.num, 'listo'); _marcarPedidoAtendido(o.num); });
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
  // Quita bytes de control (incluyendo ESC 0x1B y GS 0x1D) antes de mapear
  // acentos — igual que dpf_limpiar_texto() en guardar-pedido.php, pero
  // aplicado también aquí en el navegador: esta función es el único punto
  // por el que pasa TODO texto libre del cliente (nombre, notas, nombres de
  // producto/extra) antes de convertirse en bytes ESC/POS reales. El
  // servidor ya limpia lo que guarda, pero reimprimirUltimoTicketTermico()
  // reconstruye el ticket desde localStorage sin volver a pasar por el
  // servidor, así que confiar solo en la limpieza de guardar-pedido.php no
  // cubre ese camino — sin este filtro, una secuencia ESC/GS colada en el
  // nombre o las notas se interpretaría como un comando real de la
  // impresora (cortar papel, abrir el cajón...) en vez de imprimirse como texto.
  const limpio = (str || '').replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return limpio.split('').map(c => map[c] || c).join('');
}

// El campo "time" del ticket normalmente ya viene como "HH:MM" (así lo
// guarda el servidor en stats/<fecha>), pero algún camino interno todavía
// puede traer la fecha completa (toLocaleString) — esto se queda solo con
// la hora corta en cualquiera de los dos casos, para imprimirla en grande.
function _ptHoraCorta(t) {
  if (!t) return '';
  const m = String(t).match(/(\d{1,2}):(\d{2})/);
  return m ? m[0] : String(t);
}

// Construye los bytes ESC/POS de un ticket (mismo formato que usaba el bridge Node.js
// en pedidos/js/index.js, incluyendo el logo). Devuelve un Uint8Array listo para USB.
function _ptBuildTicketBytes(ticket, omitirLogo) {
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

  // Logo centrado — son ~18 KB de datos, sin problema por USB pero
  // demasiado para Bluetooth (varios segundos de más, y más trozos con
  // los que se puede perder algo por el camino), así que se omite en esa
  // vía (ver imprimirTicketTermico, que decide omitirLogo según el
  // transporte activo).
  if (!omitirLogo) {
    center();
    const bpr = (PRINTER_LOGO_W + 7) >> 3;
    d.push(GS, 0x76, 0x30, 0x00, bpr & 0xFF, (bpr >> 8) & 0xFF, PRINTER_LOGO_H & 0xFF, (PRINTER_LOGO_H >> 8) & 0xFF);
    PRINTER_LOGO_DATA.forEach(b => d.push(b));
  }

  // Nombre del negocio
  center();
  big();
  push(tc.nombre + '\n');
  normal();
  push(tc.direccion + '\n');
  push(tc.telefono + '\n');
  if (tc.nif) push('NIF ' + tc.nif + '\n');
  push('------------------------------------------------\n');

  // Hora de recogida si tiene turno — si no lo tiene (pedido con código
  // local, sin turno porque es para ahora mismo desde el mostrador), se
  // imprime en su lugar la hora a la que se hizo el pedido, igual de
  // grande, para que en cocina quede claro en el propio papel sin depender
  // de la etiqueta "🏪 En el local" que solo se ve en pantalla. Si hay un
  // tiempo de espera configurado para pedidos de tienda (panel >
  // Configuración impresora), slotTime SÍ viene relleno también para estos
  // pedidos (con la hora ya repartida, ver _asignarHoraTiendaQR en
  // admin-config.js) — se etiqueta distinto ("HORA ESTIMADA") para no
  // confundirlo con un turno elegido de verdad por el cliente.
  if (ticket.slotTime) {
    center();
    push(ticket.esPedidoLocal ? 'HORA ESTIMADA\n' : 'HORA RECOGIDA\n');
    big();
    push(ticket.slotTime + '\n');
    normal();
    if (ticket.esPedidoLocal) push('(pedido hecho en tienda)\n');
  } else if (ticket.time) {
    center();
    push('HORA DEL PEDIDO\n');
    big();
    push(_ptHoraCorta(ticket.time) + '\n');
    normal();
    push('(pedido hecho en tienda)\n');
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
    // Extras y cambios (ingredientes añadidos/sustituidos) en negrita +
    // subrayado (estilo E, 2 puntos — el mismo que item.modText más abajo)
    // para que destaquen en cocina, igual que ya se hacía con las
    // modificaciones de producto.
    extrasNombre.forEach(extra => {
      // El subrayado marca solo el nombre del extra — ni el guion/espacios
      // del prefijo ni el precio entre paréntesis, si lo hay (confirmado en
      // papel real: antes salía como una raya continua desde el guion hasta
      // el precio, en vez de resaltar solo el nombre).
      const conParentesis = extra.replace(/\s*\+\s*([\d]+[,.]?[\d]*)\s*€/, ' (+$1 EUR)').trim();
      const _idxParen = conParentesis.indexOf(' (+');
      const _nombreExtraNombre = (_idxParen >= 0 ? conParentesis.slice(0, _idxParen) : conParentesis).toUpperCase();
      const _precioExtraParen = _idxParen >= 0 ? conParentesis.slice(_idxParen).toUpperCase() : '';
      bold(true);
      push('     - ');
      d.push(ESC, 0x2D, 0x02);
      push(_ptEncodeStr(_nombreExtraNombre));
      d.push(ESC, 0x2D, 0x00);
      push(_ptEncodeStr(_precioExtraParen) + '\n');
      bold(false);
    });
    if (Array.isArray(extrasArr)) {
      extrasArr.forEach(extra => {
        const nombreExtra = _ptEncodeStr(((extra && extra.name) ? extra.name : extra) + '').toUpperCase();
        const precioExtraTxt = (extra && extra.price) ? '+' + parseFloat(extra.price).toFixed(2) + ' EUR' : '';
        const prefixExtra = '  - ';
        // El subrayado marca solo el nombre del extra — ni el guion/espacios
        // del prefijo, ni los espacios de relleno ni el precio — antes
        // envolvía todo eso también, saliendo como una raya continua de
        // borde a borde del ticket en vez de resaltar solo el nombre.
        bold(true);
        if (!precioExtraTxt) {
          push(prefixExtra);
          d.push(ESC, 0x2D, 0x02);
          push(nombreExtra);
          d.push(ESC, 0x2D, 0x00);
          push('\n');
        } else {
          // Precio del extra alineado a la misma columna derecha que el
          // precio de la línea principal (misma W), no pegado al nombre.
          const spacesExtra = W - prefixExtra.length - nombreExtra.length - precioExtraTxt.length;
          if (spacesExtra >= 1) {
            push(prefixExtra);
            d.push(ESC, 0x2D, 0x02);
            push(nombreExtra);
            d.push(ESC, 0x2D, 0x00);
            push(' '.repeat(spacesExtra) + precioExtraTxt + '\n');
          } else {
            push(prefixExtra);
            d.push(ESC, 0x2D, 0x02);
            push(nombreExtra);
            d.push(ESC, 0x2D, 0x00);
            push('\n');
            push(' '.repeat(Math.max(0, W - precioExtraTxt.length)) + precioExtraTxt + '\n');
          }
        }
        bold(false);
      });
    }
    // item.modText (opcional, aún no lo rellena ningún pedido real — solo
    // se usa aquí, en la prueba del botón "✂️ Probar estilos de nota") —
    // modificación del producto en estilo E (negrita + subrayado), pegada
    // a su línea en vez de en las notas generales del final. Alineada a
    // la izquierda con la misma sangría que "1x " (donde empieza el
    // nombre del producto arriba), no centrada.
    if (item.modText) {
      push(' '.repeat(prefix.length));
      bold(true);
      d.push(ESC, 0x2D, 0x02); // subrayado 2 puntos — probado en papel real y es el que prefiere
      push(item.modText + '\n');
      d.push(ESC, 0x2D, 0x00);
      bold(false);
    }
  });

  push('------------------------------------------------\n');

  // Pedido que cumple los requisitos del sello de fidelización (patata +
  // pedido mínimo) — aviso destacado para que se compruebe/aplique el
  // sello al cobrar, igual que el de estudiante/jubilado justo debajo.
  if (ticket.fidelizacionElegible) {
    center();
    bold(true);
    big();
    push('*** COMPROBAR SELLOS ***\n');
    normal();
    bold(false);
    push('------------------------------------------------\n');
  }

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
    push('------------------------------------------------\n');
    center();
    bold(true);
    big();
    push('*** NOTA CLIENTE ***\n');
    normal();
    left();
    bold(true);
    push(ticket.notes + '\n');
    bold(false);
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
// Recuerda si estaba conectada la última vez que se llamó a _ptStatusUI,
// para poder distinguir "se acaba de desconectar ahora mismo" (dispara
// sonido + banner) de "sigue sin estar conectada" (cada reintento fallido
// vuelve a llamar con connected=false, y no queremos repetir la alerta
// cada 8 segundos mientras tanto).
let _ptEstabaConectada = false;
function _ptStatusUI(connected, msg) {
  if (_ptEstabaConectada && !connected) _ptAvisoDesconexionImpresora();
  if (!_ptEstabaConectada && connected) {
    // Se acaba de reconectar: vacía sola la cola de tickets que se quedaron
    // pendientes mientras estuvo desconectada (ver _ptColaProcesar). Un
    // pequeño margen antes de empezar a imprimir, para que la conexión
    // recién hecha se asiente (sobre todo por Bluetooth).
    setTimeout(_ptColaProcesar, 800);
  }
  if (connected) _ptOcultarAvisoDesconexion();
  _ptEstabaConectada = connected;
  const texto = msg || (connected ? '🟢 Impresora conectada' : '🔴 Impresora no conectada');
  document.querySelectorAll('.pt-conn-status').forEach(el => {
    el.textContent = texto;
    el.style.color = connected ? '#166534' : '#991B1B';
  });
}

// Aviso de que la impresora se acaba de desconectar — sonido distinto al
// de "nuevo pedido" (para no confundirlos) y un banner visible tanto en
// la pantalla de cocina como en el panel de admin. Vale igual para USB
// que para Bluetooth, ya que _ptStatusUI es la única función de estado
// que comparten ambos transportes.
//
// Si sigue sin reconectar pasado un rato, el aviso se repite solo — un
// sonido único al desconectarse es fácil de dar por "ya lo he visto" y
// olvidarlo de fondo mientras siguen llegando pedidos que no se imprimen.
let _ptAvisoEscaladoTimer = null;
const PT_AVISO_ESCALADO_MS = 3 * 60 * 1000;
function _ptAvisoDesconexionImpresora() {
  _ptSonarAvisoDesconexion();
  document.querySelectorAll('.pt-desconexion-aviso').forEach(el => {
    el.style.display = el.dataset.showDisplay || 'block';
  });
  if (_ptAvisoEscaladoTimer) clearInterval(_ptAvisoEscaladoTimer);
  _ptAvisoEscaladoTimer = setInterval(() => {
    if (_ptIsConnected()) { clearInterval(_ptAvisoEscaladoTimer); _ptAvisoEscaladoTimer = null; return; }
    _ptSonarAvisoDesconexion();
  }, PT_AVISO_ESCALADO_MS);
}
function _ptSonarAvisoDesconexion() {
  if (typeof playNotificationSound === 'function') {
    const tipo = (typeof getSoundDesconexionType === 'function') ? getSoundDesconexionType() : 'urgente';
    playNotificationSound(tipo);
  }
}
function _ptOcultarAvisoDesconexion() {
  document.querySelectorAll('.pt-desconexion-aviso').forEach(el => { el.style.display = 'none'; });
  if (_ptAvisoEscaladoTimer) { clearInterval(_ptAvisoEscaladoTimer); _ptAvisoEscaladoTimer = null; }
}

// ── FILA ÚNICA DE IMPRESIÓN ────────────────────────────────────────────
// Si llegan varios pedidos casi a la vez (varios clientes pidiendo en el
// mismo minuto), cada uno lanzaba su propio envío a la impresora por su
// cuenta — como JavaScript no bloquea entre cada "await", los bytes de dos
// tickets distintos podían intercalarse a mitad de envío en la misma
// conexión Bluetooth/USB, y la impresora sacaba basura o se quedaba
// colgada sin imprimir ninguno de los dos ("se volvía loca"). Ahora TODO
// lo que haya que imprimir (auto-imprimir, reimprimir a mano, la cola
// pendiente al reconectar) pasa por esta única fila — se imprimen de uno
// en uno, en el orden en que se pidieron, aunque hayan llegado casi a la
// vez.
let _ptColaEjecucion = Promise.resolve();
function _ptEnFila(fn) {
  const resultado = _ptColaEjecucion.then(fn, fn);
  // La cadena sigue aunque este envío falle — si no, un ticket atascado
  // dejaría a todos los siguientes esperando para siempre.
  _ptColaEjecucion = resultado.then(() => {}, () => {});
  return resultado;
}

// 'usb' | 'ble' | null — qué transporte está activo ahora mismo. Se decide
// solo con cuál de los dos consigue conectar primero (ver _ptReconectar).
let _ptTransporte = null;

function _ptIsConnected() {
  if (_ptTransporte === 'ble') return !!(_ptBleDevice && _ptBleDevice.gatt && _ptBleDevice.gatt.connected && _ptBleCharacteristic);
  if (_ptTransporte === 'usb') return !!(_ptDevice && _ptEndpointOut !== null);
  return false;
}

function _ptResetConexion() {
  _ptDevice = null; _ptEndpointOut = null; _ptEndpointIn = null;
  _ptBleDevice = null; _ptBleCharacteristic = null;
  _ptTransporte = null;
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
  const conexion = _ptIsConnected() ? '🟢 ' + (_ptTransporte === 'ble' ? 'Bluetooth' : 'USB') + ' conectada' : '🔴 Impresora no conectada';
  const texto = admin + ' · ' + auto + ' · ' + conexion;
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
    _ptTransporte = 'usb';
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
// Prueba USB primero (dispositivo ya autorizado antes) y, si no hay nada
// por ahí, prueba Bluetooth (también ya autorizado antes) — cualquiera de
// los 4 disparadores de siempre (carga de página, evento "connect" USB,
// intervalo de 8s, volver a la pestaña) sirve igual para las dos vías,
// así que basta con ampliar esta única función en vez de duplicar toda
// la maquinaria de candado/timeout para Bluetooth aparte.
async function _ptReconectar() {
  if (_ptIsConnected()) return true;
  if (_ptReconectando) return false;
  _ptReconectando = true;
  try {
    if (navigator.usb) {
      // Límite de tiempo de seguridad — si getDevices()/claimInterface() se
      // quedaran colgados sin resolver ni rechazar nunca (un fallo raro del
      // driver USB del sistema), sin esto el candado de arriba se quedaría
      // en true para siempre y ningún disparador podría volver a intentar
      // reconectar hasta recargar la página entera.
      const resultado = await Promise.race([
        (async () => {
          const devices = await navigator.usb.getDevices();
          if (!devices.length) return null;
          const device = devices[0];
          const { epOut, epIn } = await _ptClaimInterface(device);
          return { device, epOut, epIn };
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout reconectando con la impresora')), 6000))
      ]).catch((e) => { console.warn('[Impresora] reconexión USB fallida', e); return null; });
      if (resultado) {
        _ptDevice = resultado.device;
        _ptEndpointOut = resultado.epOut;
        _ptEndpointIn = resultado.epIn;
        _ptTransporte = 'usb';
        // Igual que en Bluetooth (ver _ptBleConectarDispositivo): justo
        // después de reconectar, algunas impresoras térmicas USB baratas
        // todavía no están listas para imprimir de verdad aunque el
        // sistema ya las dé por conectadas — el primer ticket de la cola
        // pendiente se perdía en silencio (el USB acepta el envío, pero
        // la impresora no llega a sacarlo, y sin ningún error de por
        // medio el ticket se marcaba como impreso y se quitaba de la
        // cola). Se manda primero un pulso inofensivo (consulta de estado
        // de papel, no imprime nada) y se espera un margen antes de
        // avisar de que ya está lista — así, si algo se pierde por este
        // motivo de arranque, se pierde ese pulso de prueba y no el
        // ticket real del cliente.
        try { await _ptComprobarPapel(); } catch (e) {}
        await new Promise(r => setTimeout(r, 800));
        _ptStatusUI(true);
        return true;
      }
    }
    const okBle = await _ptBleReconectar();
    if (okBle) return true;
    _ptStatusUI(false);
    return false;
  } finally {
    _ptReconectando = false;
  }
}

// Envuelve una promesa que no tiene por qué llegar a resolverse nunca
// (transferOut de WebUSB y writeValue/writeValueWithoutResponse de Web
// Bluetooth no traen ningún timeout de fábrica: si la impresora se queda
// en un estado raro a media escritura — atasco de papel, un USB que se
// desconecta sin disparar su evento, Bluetooth fuera de rango justo en
// ese instante — la promesa puede quedarse colgada para siempre). Sin
// esto, como TODOS los tickets pasan por la misma fila (_ptEnFila), un
// solo envío colgado dejaba bloqueados también todos los pedidos
// siguientes sin ningún aviso ni forma de recuperarse sola. La operación
// de bajo nivel que se abandona puede seguir viva de fondo, pero ya no
// bloquea nada: _ptResetConexion() olvida esa conexión y el siguiente
// intento abre una nueva de cero.
function _ptConTimeout(promise, ms, mensaje) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(mensaje || 'timeout de impresora')), ms))
  ]);
}
async function _ptEnviarBytesUnaVez(bytes) {
  if (!_ptIsConnected()) {
    const ok = await _ptReconectar();
    if (!ok) throw new Error('Impresora no conectada — pulsa "Conectar impresora" en Configuración del ticket');
  }
  if (_ptTransporte === 'ble') { await _ptBleEnviarBytes(bytes); return; }
  await _ptConTimeout(_ptDevice.transferOut(_ptEndpointOut, bytes), 8000, 'timeout enviando por USB — la impresora no respondió');
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
        _ptResetConexion(); // forzar reconexión limpia en el siguiente intento
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }
  throw ultimoError;
}

// ── IMPRESORA TÉRMICA — BLUETOOTH (BLE) ──────────────────────────────
// Vía alternativa a USB. Solo vale para impresoras Bluetooth de BAJO
// CONSUMO (BLE) — compruébalo antes con "Probar Bluetooth" en
// Configuración del ticket. La mayoría de impresoras térmicas baratas
// llevan Bluetooth "clásico" (SPP), que ningún navegador puede usar; eso
// no tiene arreglo por código.
//
// A diferencia de USB (donde pedimos la lista completa de dispositivos
// y el vendor ID no importa), en Bluetooth hay que declarar de antemano
// qué "servicios" GATT se van a usar. No hay un ID de fabricante fijo
// que buscar, así que se prueban los UUID de servicio más habituales
// entre impresoras térmicas ESC/POS BLE genéricas (muchas comparten el
// mismo firmware de fábrica aunque se vendan con marcas distintas), y se
// usa la primera característica que permita escribir que se encuentre.
const PT_BLE_SERVICIOS_CANDIDATOS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // el más habitual en clones ESC/POS BLE
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e'  // Nordic UART Service (otro habitual)
];

let _ptBleDevice = null;
let _ptBleCharacteristic = null;
// Referencia estable al handler de 'gattserverdisconnected' — ver el
// comentario junto a su addEventListener() más abajo (_ptBleConectarDispositivo).
let _ptBleDisconnectHandler = null;

async function _ptBleBuscarCaracteristicaEscritura(server) {
  for (const uuidServicio of PT_BLE_SERVICIOS_CANDIDATOS) {
    try {
      const servicio = await server.getPrimaryService(uuidServicio);
      const caracteristicas = await servicio.getCharacteristics();
      const escribible = caracteristicas.find(c => c.properties.write || c.properties.writeWithoutResponse);
      if (escribible) return escribible;
    } catch (e) {
      // Este servicio candidato no existe en el dispositivo — se prueba el siguiente.
    }
  }
  return null;
}

async function _ptBleConectarDispositivo(device) {
  const server = await device.gatt.connect();
  const characteristic = await _ptBleBuscarCaracteristicaEscritura(server);
  if (!characteristic) {
    server.disconnect();
    throw new Error('Se encontró la impresora por Bluetooth pero no un canal de escritura reconocido.');
  }
  _ptBleDevice = device;
  _ptBleCharacteristic = characteristic;
  _ptTransporte = 'ble';
  // Muchas impresoras Bluetooth baratas todavía no están listas para
  // recibir datos de verdad justo al terminar de conectar — el primer envío
  // en ese instante se puede perder en silencio (writeValueWithoutResponse
  // no avisa de ningún fallo), así que la web lo daba por impreso pero no
  // salía nada en papel. Antes solo había una espera fija de 0,5s, pero
  // seguía perdiéndose el primer ticket real en algunos módulos — ahora,
  // ANTES de esperar, se manda primero un "pulso" inofensivo (el mismo
  // comando de estado que ya se usa para mantener viva la conexión, no
  // imprime nada en el papel): si algo se pierde por este motivo de
  // arranque, se pierde ese envío de prueba y no el ticket real del
  // cliente. Después se espera un margen mayor (0,8s) antes de marcar la
  // impresora como lista.
  try { await _ptBlePulso(); } catch (e) {}
  await new Promise(r => setTimeout(r, 800));
  // navigator.bluetooth.getDevices() (usado por _ptBleReconectar) devuelve
  // el MISMO objeto BluetoothDevice en cada reconexión, no uno nuevo — sin
  // quitar antes el listener de la conexión anterior, cada reconexión
  // apilaba uno más sobre ese mismo objeto: un día con BLE inestable podía
  // acumular decenas, y cada desconexión real disparaba _ptResetConexion()/
  // _ptStatusUI(false)/_ptReconectar() una vez POR listener acumulado
  // (mitigado por el candado _ptReconectando en _ptReconectar, pero trabajo
  // redundante de todas formas).
  if (_ptBleDisconnectHandler) device.removeEventListener('gattserverdisconnected', _ptBleDisconnectHandler);
  _ptBleDisconnectHandler = () => {
    if (_ptTransporte === 'ble') _ptResetConexion();
    _ptStatusUI(false);
    _ptReconectar();
  };
  device.addEventListener('gattserverdisconnected', _ptBleDisconnectHandler);
  _ptStatusUI(true, '🟢 Impresora conectada (Bluetooth)');
}

// Pide permiso al navegador — debe llamarse desde un click (gesto del
// usuario), el navegador no deja hacerlo en segundo plano.
async function conectarImpresoraBluetooth() {
  if (!navigator.bluetooth) {
    alert('Este navegador no soporta impresión por Bluetooth. Usa Chrome o Edge (no funciona en Safari ni en iPhone/iPad).');
    return false;
  }
  try {
    // Si ya sabemos el nombre de la impresora de una conexión anterior, se
    // filtra la ventana de selección para que solo aparezca ella (en vez
    // de la lista completa de aparatos Bluetooth cercanos) — más rápido
    // de encontrar cada vez que haga falta reconectar a mano. Si por lo
    // que sea no aparece con ese filtro (nombre cambiado, etc.), se
    // reintenta mostrando la lista completa antes de rendirse.
    let nombreGuardado = null;
    try { nombreGuardado = localStorage.getItem('dpf_bt_printer_name') || null; } catch (e) {}
    let device;
    if (nombreGuardado) {
      try {
        device = await navigator.bluetooth.requestDevice({ filters: [{ name: nombreGuardado }], optionalServices: PT_BLE_SERVICIOS_CANDIDATOS });
      } catch (e) {
        device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: PT_BLE_SERVICIOS_CANDIDATOS });
      }
    } else {
      device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: PT_BLE_SERVICIOS_CANDIDATOS });
    }
    await _ptBleConectarDispositivo(device);
    try { localStorage.setItem('dpf_bt_printer_name', device.name || ''); } catch (e) {}
    // Diagnóstico: si este navegador no soporta navigator.bluetooth.getDevices()
    // (API de permisos Bluetooth persistentes), no hay forma de reconectar sola
    // tras recargar la página — habrá que pulsar este botón cada vez que se
    // recargue o se abra de nuevo. No es un fallo del código: es un límite de
    // seguridad del propio navegador/plataforma, sin alternativa posible.
    if (!navigator.bluetooth.getDevices) {
      console.warn('[Impresora BLE] Este navegador no soporta navigator.bluetooth.getDevices() — no podrá reconectar sola tras recargar la página, solo mientras esta pestaña siga abierta.');
    }
    return true;
  } catch (e) {
    console.warn('[Impresora BLE] conexión cancelada o fallida', e);
    if (e && e.name !== 'NotFoundError') alert('No se pudo conectar con la impresora por Bluetooth: ' + e.message);
    return false;
  }
}

// Reconecta en silencio a un dispositivo Bluetooth ya autorizado antes —
// espejo de la reconexión USB, usando navigator.bluetooth.getDevices()
// (API de permisos persistentes; no está en todas las versiones de Chrome,
// de ahí la comprobación).
async function _ptBleReconectar() {
  if (!navigator.bluetooth || !navigator.bluetooth.getDevices) return false;
  try {
    const dispositivos = await navigator.bluetooth.getDevices();
    if (!dispositivos.length) return false;
    await Promise.race([
      _ptBleConectarDispositivo(dispositivos[0]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout reconectando Bluetooth')), 6000))
    ]);
    return true;
  } catch (e) {
    console.warn('[Impresora BLE] reconexión fallida', e);
    return false;
  }
}

// Se prefiere "con respuesta" (writeValue): cada trozo espera la
// confirmación real de la impresora antes de mandar el siguiente, así que
// el ritmo lo marca la propia impresora en vez de un tiempo de espera fijo
// adivinado — no hace falta añadir ningún retraso extra encima. Solo si
// la característica no soporta escritura con respuesta se usa
// writeValueWithoutResponse con una pequeña espera manual de por medio.
async function _ptBleEnviarBytes(bytes) {
  const TAMANO_TROZO = 100;
  const conRespuesta = !!_ptBleCharacteristic.properties.write;
  for (let i = 0; i < bytes.length; i += TAMANO_TROZO) {
    const trozo = new Uint8Array(bytes.slice(i, i + TAMANO_TROZO));
    if (conRespuesta) {
      await _ptConTimeout(_ptBleCharacteristic.writeValue(trozo), 5000, 'timeout enviando por Bluetooth — la impresora no respondió');
    } else {
      await _ptConTimeout(_ptBleCharacteristic.writeValueWithoutResponse(trozo), 5000, 'timeout enviando por Bluetooth — la impresora no respondió');
      await new Promise(r => setTimeout(r, 45));
    }
  }
}

// "Pulso" de mantenimiento — un comando de estado en tiempo real (no
// imprime nada en el papel) para generar tráfico en la conexión Bluetooth
// mientras no hay ningún pedido que imprimir. Si falla, no pasa nada
// grave: el intervalo que lo llama ya comprueba _ptIsConnected() cada
// pocos segundos y dispara la reconexión si de verdad se ha caído.
async function _ptBlePulso() {
  if (_ptTransporte !== 'ble' || !_ptBleCharacteristic) return;
  try {
    const bytes = new Uint8Array([0x10, 0x04, 0x01]);
    if (_ptBleCharacteristic.properties.writeWithoutResponse) {
      await _ptBleCharacteristic.writeValueWithoutResponse(bytes);
    } else if (_ptBleCharacteristic.properties.write) {
      await _ptBleCharacteristic.writeValue(bytes);
    }
  } catch (e) {
    // Se ignora — si de verdad se cayó la conexión, el siguiente chequeo
    // de _ptIsConnected() lo detectará y disparará la reconexión.
  }
}

// Imprime un ticket, repitiendo tantas copias como esté configurado.
// desdeCopia (opcional) permite reanudar desde una copia concreta en vez de
// desde la 0 — lo usa _imprimirConReintentos() (historial-export.js) para
// que, si la copia N falla a mitad, el reintento del ticket entero no
// vuelva a imprimir las copias 1..N-1 que ya habían salido bien.
async function imprimirTicketTermico(ticket, desdeCopia) {
  const tc = getTicketConfig();
  const bytes = _ptBuildTicketBytes(ticket);
  _ptUltimoTicket = ticket;
  const copias = Math.max(1, parseInt(tc.copias, 10) || 1);
  for (let i = desdeCopia || 0; i < copias; i++) {
    try {
      await _ptEnviarBytes(bytes);
    } catch (e) {
      e.copiaFallidaDesde = i;
      throw e;
    }
    _ptPapelRegistrarTicketImpreso();
    if (i < copias - 1) await new Promise(r => setTimeout(r, 300));
  }
}

// ── Contador de papel restante estimado ──────────────────────────────
// Por Bluetooth no se puede leer el sensor de papel de la impresora (y por
// USB tampoco todos los modelos lo soportan), así que en vez de depender
// de eso se lleva la cuenta de cuántos tickets se han impreso desde el
// último cambio de rollo, y se compara contra una capacidad aproximada
// (cuántos tickets suele dar un rollo nuevo) que la usuaria calibra a ojo
// la primera vez y ajusta si hace falta — no es una medida exacta en
// milímetros, pero avisa con margen suficiente antes de quedarse sin papel.
const PT_PAPEL_TICKETS_KEY = 'dpf_papel_tickets_desde_rollo';
const PT_PAPEL_CAPACIDAD_KEY = 'dpf_papel_rollo_capacidad';
function _ptPapelTicketsUsados() {
  return parseInt(localStorage.getItem(PT_PAPEL_TICKETS_KEY) || '0', 10);
}
function _ptPapelCapacidad() {
  return parseInt(localStorage.getItem(PT_PAPEL_CAPACIDAD_KEY) || '150', 10);
}
function _ptPapelRegistrarTicketImpreso() {
  localStorage.setItem(PT_PAPEL_TICKETS_KEY, String(_ptPapelTicketsUsados() + 1));
  _ptPapelActualizarUI();
}
function _ptPapelNuevoRollo() {
  localStorage.setItem(PT_PAPEL_TICKETS_KEY, '0');
  _ptPapelActualizarUI();
  if (typeof logActivity === 'function') logActivity('🧻 Rollo de papel reiniciado (contador a 0)');
}
function guardarCapacidadRollo(valor) {
  const n = Math.max(1, parseInt(valor, 10) || 150);
  localStorage.setItem(PT_PAPEL_CAPACIDAD_KEY, String(n));
  _ptPapelActualizarUI();
}
function _ptPapelActualizarUI() {
  const usados = _ptPapelTicketsUsados();
  const capacidad = _ptPapelCapacidad();
  const restantes = Math.max(0, capacidad - usados);
  const pct = capacidad > 0 ? Math.max(0, Math.min(100, Math.round((restantes / capacidad) * 100))) : 100;
  document.querySelectorAll('.pt-papel-contador').forEach(el => {
    el.textContent = '🧻 ~' + pct + '% de papel restante (' + restantes + ' de ' + capacidad + ' tickets aprox.)';
    el.style.color = pct <= 15 ? '#c0392b' : '';
  });
  const inputCap = document.getElementById('tc-papel-capacidad');
  if (inputCap && document.activeElement !== inputCap) inputCap.value = capacidad;
}
document.addEventListener('DOMContentLoaded', () => { _ptPapelActualizarUI(); });

// ── Cola de impresión pendiente ──────────────────────────────────────
// Si un ticket no consigue imprimirse ni tras los reintentos normales
// (la impresora estaba desconectada en ese momento), antes se quedaba solo
// en un aviso que había que atender a mano ("🔧 Reintentar impresión" en
// Alertas). Ahora, además, se guarda aquí — y en cuanto la impresora
// vuelva a conectar (ver _ptStatusUI) se reimprime sola, en el mismo orden
// en que llegaron, sin que nadie tenga que darle a ese botón.
const PT_COLA_KEY = 'dpf_cola_impresion_pendiente';
function _ptColaCargar() {
  try { return JSON.parse(localStorage.getItem(PT_COLA_KEY) || '[]'); } catch (e) { return []; }
}
function _ptColaGuardar(cola) {
  try { localStorage.setItem(PT_COLA_KEY, JSON.stringify(cola)); } catch (e) {}
  _ptColaActualizarUI();
  // Respaldo en Firebase — antes esta cola vivía SOLO en el localStorage de
  // este dispositivo: si la pestaña se cerraba o el dispositivo se
  // reiniciaba con tickets pendientes de reimprimir (impresora sin papel o
  // desconectada), se perdían de la cola sin que nadie en cocina se
  // enterara — el pedido seguía existiendo, pero había que darse cuenta a
  // mano mirando "Nuevos". Solo si hay sesión de admin activa, igual que el
  // resto de guardados de este tipo (evita permission_denied en intentos
  // de login). Ver _ptColaRestaurarDesdeFirebase() más abajo, que recupera
  // esto al volver a cargar la página.
  if (window.fb_saveColaImpresion && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveColaImpresion(cola).catch(() => {});
  }
}
function _ptColaAgregar(ticket) {
  if (!ticket || !ticket.orderNum) return;
  const cola = _ptColaCargar();
  if (cola.some(t => t.orderNum === ticket.orderNum)) return;
  // Se marca con el día (Europe/Madrid) en que se encoló — así, si la
  // impresora sigue desconectada al día siguiente, _ptColaProcesar() sabe
  // que ese ticket ya NO es de hoy y no lo reimprime solo sin más (ver
  // el porqué justo ahí abajo).
  cola.push(Object.assign({}, ticket, {
    _colaFecha: typeof _todayKeyMadrid === 'function' ? _todayKeyMadrid() : null
  }));
  _ptColaGuardar(cola);
}
function _ptColaQuitar(orderNum) {
  _ptColaGuardar(_ptColaCargar().filter(t => t.orderNum !== orderNum));
}
function _ptColaActualizarUI() {
  const cola = _ptColaCargar();
  const hoy = typeof _todayKeyMadrid === 'function' ? _todayKeyMadrid() : null;
  const deOtroDia = cola.filter(t => !hoy || t._colaFecha !== hoy);
  const deHoy = cola.length - deOtroDia.length;
  const n = cola.length;
  document.querySelectorAll('.pt-cola-contador').forEach(el => {
    el.style.display = n > 0 ? (el.dataset.showDisplay || 'block') : 'none';
    el.textContent = deOtroDia.length
      ? '⚠️ ' + deOtroDia.length + (deOtroDia.length === 1 ? ' pedido pendiente es de OTRO DÍA' : ' pedidos pendientes son de OTRO DÍA') + ' — no se imprime' + (deOtroDia.length === 1 ? '' : 'n') + ' solo' + (deOtroDia.length === 1 ? '' : 's') + (deHoy ? ' (' + deHoy + ' de hoy sí, al reconectar)' : '') + '. Revísalos en Impresora térmica.'
      : '🕓 ' + n + (n === 1 ? ' ticket pendiente de imprimir' : ' tickets pendientes de imprimir') + ' — se imprimirá' + (n === 1 ? '' : 'n') + ' solo' + (n === 1 ? '' : 's') + ' al reconectar';
  });
  _ptColaAntiguaRenderUI(deOtroDia);
}
// Fila con "Imprimir igualmente"/"Descartar" para cada pedido pendiente
// que NO es de hoy — nunca se reimprimen solos al reconectar (ver
// _ptColaProcesar), así que aquí es donde se decide a mano qué hacer con
// cada uno en vez de que se queden invisibles en la cola para siempre.
// Hay varias .pt-cola-antigua-lista en la página (En vivo, Impresora
// térmica...) — se rellenan todas igual, para poder verlas y actuar desde
// donde sea que se vea el aviso, sin tener que ir a buscar otra pestaña.
function _ptColaAntiguaRenderUI(deOtroDia) {
  const els = document.querySelectorAll('.pt-cola-antigua-lista');
  if (!els.length) return;
  if (!deOtroDia.length) {
    els.forEach(el => { el.innerHTML = ''; el.style.display = 'none'; });
    return;
  }
  const html = '<div style="font-size:12px;font-weight:700;color:#c0392b;margin-bottom:8px">⚠️ Pendientes de otro día — no se imprimen solos, decide con cada uno:</div>' +
    deOtroDia.map(t => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fdf0ee;border:1.5px solid #c0392b;border-radius:8px;padding:8px 10px;margin-bottom:6px;flex-wrap:wrap">
        <span style="font-size:12.5px;font-weight:700;color:#7a1a0e">#${escapeHtml(t.orderNum)} · ${escapeHtml(t.name || '')} · ${escapeHtml(t._colaFecha || 'fecha desconocida')}</span>
        <div style="display:flex;gap:6px">
          <button onclick="_ptColaImprimirAntiguo('${escapeAttr(t.orderNum)}')" style="padding:5px 10px;background:#3D1F0D;color:#fff;border:none;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">🖨️ Imprimir igualmente</button>
          <button onclick="_ptColaDescartar('${escapeAttr(t.orderNum)}')" style="padding:5px 10px;background:none;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">🗑️ Descartar</button>
        </div>
      </div>`).join('');
  els.forEach(el => { el.style.display = 'block'; el.innerHTML = html; });
}
// Aviso corto y autocontenido (mismo estilo que _ptBuildAnulacionBytes) que
// se imprime justo antes del ticket real al forzar "Imprimir igualmente" —
// para que en cocina no lo confundan con un pedido de hoy recién llegado.
function _ptBuildAvisoOtroDiaBytes(orderNum, fecha) {
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
  push('OJO\n');
  push('PEDIDO DE OTRO DIA\n');
  normal();
  push('------------------------------------------------\n');
  push('Pedido ' + orderNum + '\n');
  push('Era del ' + (fecha || 'dia desconocido') + '\n');
  push('NO es un pedido de hoy.\n');
  push('Revisa si sigue haciendo\n');
  push('falta prepararlo.\n');
  push('\n\n\n');
  d.push(GS, 0x56, 0x42, 0x00);
  return new Uint8Array(d);
}
async function _ptColaImprimirAntiguo(orderNum) {
  const ticket = _ptColaCargar().find(t => t.orderNum === orderNum);
  if (!ticket) return;
  const _ptEjecutar = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  try {
    await _ptEjecutar(() => _ptEnviarBytes(_ptBuildAvisoOtroDiaBytes(orderNum, ticket._colaFecha)));
    await _ptEjecutar(() => imprimirTicketTermico(ticket));
    _ptColaQuitar(orderNum);
  } catch (e) {
    alert('⚠️ ' + e.message);
  }
}
function _ptColaDescartar(orderNum) {
  if (!confirm('¿Descartar este pedido pendiente sin imprimirlo? No se imprimirá ni ahora ni al reconectar.')) return;
  _ptColaQuitar(orderNum);
}
document.addEventListener('DOMContentLoaded', () => { _ptColaActualizarUI(); });
// Recupera, al cargar la página, los tickets que este (u otro) dispositivo
// dejó pendientes de reimprimir antes de cerrarse/reiniciarse — se fusiona
// con lo que ya haya en el localStorage local (por número de pedido, sin
// duplicar) en vez de reemplazarlo. Si no hay sesión de admin, la lectura
// simplemente no llega a nada (permission_denied silencioso). Este archivo
// vive en el bundle admin, que se carga bajo demanda (no en el arranque
// normal de la web) — para cuando este código se ejecuta, la página ya
// lleva rato cargada, así que se llama directamente en vez de esperar a
// DOMContentLoaded (ese evento ya habría pasado).
async function _ptColaRestaurarDesdeFirebase() {
  if (!window.fb_loadColaImpresion) return;
  try {
    const remota = await window.fb_loadColaImpresion();
    if (!Array.isArray(remota) || !remota.length) return;
    const local = _ptColaCargar();
    const localNums = new Set(local.map(t => t.orderNum));
    const faltantes = remota.filter(t => t && t.orderNum && !localNums.has(t.orderNum));
    if (faltantes.length) {
      _ptColaGuardar(local.concat(faltantes));
      if (_ptIsConnected()) _ptColaProcesar();
    }
  } catch (e) { console.warn('[impresora] no se pudo restaurar la cola de impresión pendiente', e); }
}
_ptColaActualizarUI();
_ptColaRestaurarDesdeFirebase();

// Vacía la cola cuando la impresora reconecta — de una en una y en orden;
// si alguna vuelve a fallar (se ha caído otra vez a media cola), se para
// ahí y se deja para el próximo reconectar, en vez de perder el orden o
// darlas por perdidas.
let _ptColaProcesando = false;
async function _ptColaProcesar() {
  if (_ptColaProcesando || !_ptIsConnected()) return;
  _ptColaProcesando = true;
  try {
    const cola = _ptColaCargar();
    const hoy = typeof _todayKeyMadrid === 'function' ? _todayKeyMadrid() : null;
    for (const ticket of cola) {
      // Pedidos de un día anterior (impresora desconectada desde ayer, por
      // ejemplo): NO se reimprimen solos al reconectar — en cocina los
      // verían salir por la térmica y los prepararían como si fueran de
      // hoy. Se quedan en la cola para decidir a mano en "Imprimir
      // térmica" (ver _ptColaAntiguaRenderUI / _ptColaImprimirAntiguo).
      if (!hoy || ticket._colaFecha !== hoy) continue;
      try {
        await _ptEnFila(() => imprimirTicketTermico(ticket));
        _ptColaQuitar(ticket.orderNum);
        if (typeof _markAsImpreso === 'function') _markAsImpreso(ticket.orderNum);
        if (typeof _registrarEnvioTicket === 'function') _registrarEnvioTicket(ticket.orderNum, true);
        if (typeof logActivity === 'function') logActivity('🖨️ Ticket #' + ticket.orderNum + ' impreso solo desde la cola pendiente, al reconectar la impresora');
        if (typeof getOrderStatus === 'function' && typeof setOrderStatus === 'function' && getOrderStatus(ticket.orderNum) === 'nuevo') {
          setOrderStatus(ticket.orderNum, 'recibido').catch(() => {});
        }
      } catch (e) {
        break;
      }
    }
  } finally {
    _ptColaProcesando = false;
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
  // Pasa por _ptEnFila() igual que cualquier otro ticket — si no, este
  // aviso podía intercalarse (o perderse sin más) con el ticket del pedido
  // nuevo si el cliente modificaba y volvía a mandar el pedido enseguida,
  // y cocina se quedaba sin enterarse de que tenía que tirar el anterior.
  const _ptEjecutarAnulacion = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  await _ptEjecutarAnulacion(() => _ptEnviarBytes(_ptBuildAnulacionBytes(orderNum)));
}

async function imprimirTicketPrueba() {
  // Pasa por _ptEnFila() igual que cualquier otro ticket — si no, pulsar
  // "Probar impresora" justo cuando un pedido nuevo se está auto-imprimiendo
  // podía intercalar los dos envíos a la vez (ver el porqué más arriba, en
  // _autoImprimirPedido de historial-export.js).
  const _ptEjecutarPrueba = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  try {
    await _ptEjecutarPrueba(() => imprimirTicketTermico({
      orderNum: 'PRUEBA',
      name: 'Ticket de prueba',
      phone: '',
      notes: '',
      slotTime: null,
      items: [{ name: 'Impresora configurada correctamente', qty: 1, subtotal: 0 }],
      total: 0,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }));
  } catch (e) {
    alert('⚠️ ' + e.message);
  }
}

// Ticket de prueba SOLO para comparar en papel real dos formas de
// resaltar una modificación de producto (p.ej. "sin queso") pegada a su
// línea — de cara a decidir cuál usar de verdad más adelante, nada de
// esto afecta todavía a los tickets reales. Autocontenido igual que
// _imprimirUnCartelQRLocal más abajo (bytes ESC/POS propios, no reutiliza
// los de _ptBuildTicketBytes) — se puede borrar entero sin tocar nada más
// el día que ya no haga falta.
async function imprimirPruebaModificaciones() {
  // Réplica del cabecero/pie REAL de _ptBuildTicketBytes (logo, nombre,
  // dirección, teléfono...) para que la prueba se vea dentro de un ticket
  // completo de verdad y no aislada — así se puede juzgar el estilo en su
  // sitio real, no en un papel suelto sin nada alrededor. Autocontenida a
  // propósito: no llama a _ptBuildTicketBytes ni la modifica, cero riesgo
  // para los tickets reales. Se puede borrar entera cuando ya no haga falta.
  const tc = getTicketConfig();
  const ESC = 0x1B, GS = 0x1D;
  const d = [];
  const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
  const center = () => d.push(ESC, 0x61, 0x01);
  const left = () => d.push(ESC, 0x61, 0x00);
  const bold = on => d.push(ESC, 0x45, on ? 0x01 : 0x00);
  // GS B n — modo "blanco sobre negro" (reverse/inverse). En esta
  // impresora en concreto SÍ se ve bien (estilo B).
  const invert = on => d.push(GS, 0x42, on ? 0x01 : 0x00);
  // Mismo comando que el nombre del negocio y el total en CADA ticket
  // real — en esta impresora también se ve bien (estilo C).
  const big = () => d.push(ESC, 0x21, 0x30);
  const normal = () => d.push(ESC, 0x21, 0x00);
  // ESC '-' n — subrayado (n=2: línea de 2 puntos — es el grosor que
  // prefiere, probado en papel real).
  const underline = on => d.push(ESC, 0x2D, on ? 0x02 : 0x00);

  d.push(ESC, 0x40);
  center();
  const bpr = (PRINTER_LOGO_W + 7) >> 3;
  d.push(GS, 0x76, 0x30, 0x00, bpr & 0xFF, (bpr >> 8) & 0xFF, PRINTER_LOGO_H & 0xFF, (PRINTER_LOGO_H >> 8) & 0xFF);
  PRINTER_LOGO_DATA.forEach(b => d.push(b));
  big(); push(tc.nombre + '\n'); normal();
  push(tc.direccion + '\n');
  push(tc.telefono + '\n');
  if (tc.nif) push('NIF ' + tc.nif + '\n');
  push('------------------------------------------------\n');
  big(); push('PEDIDO PRUEBA\n'); normal();
  push(new Date().toLocaleString('es-ES') + '\n');
  push('------------------------------------------------\n');

  left();
  push('1x Patata Ranchera             6,50 EUR\n');
  push('\n');
  push('1x Patata 4 Quesos             5,90 EUR\n');
  center();
  invert(true); push(' ESTILO B: SIN ROQUEFORT, DOBLE GOUDA \n'); invert(false);
  left();
  push('\n');
  push('1x Patata Bomba                7,90 EUR\n');
  center();
  big(); push('ESTILO C:\n'); push('SIN PICANTE\n'); normal();
  left();
  push('\n');
  push('1x Patata Carnivora            6,40 EUR\n');
  center();
  // Estilo D: negrita + grande a la vez — el mismo combo que ya usa el
  // ticket real para "COMPROBAR SELLOS"/"VERIFICAR CARNET" (ver
  // _ptBuildTicketBytes), así que sabemos que ya funciona en producción.
  bold(true); big(); push('ESTILO D:\n'); push('SIN QUESO\n'); normal(); bold(false);
  left();
  push('\n');
  push('1x Patata Granollers            6,50 EUR\n');
  center();
  bold(true); underline(true); push('ESTILO E: SIN GAMBAS\n'); underline(false); bold(false);
  left();
  push('\n');
  push('1x Patata Philadelphia          6,40 EUR\n');
  center();
  invert(true); big(); push('ESTILO H:\n'); push('SIN QUESO\n'); normal(); invert(false);
  left();

  push('------------------------------------------------\n');
  center();
  big(); push('39,60 EUR\n'); normal();
  push(tc.textoPago + '\n');
  push('------------------------------------------------\n');
  push(tc.despedida + '\n');
  push('(ticket de prueba, no es un pedido real)\n');
  push('\n\n\n');
  d.push(GS, 0x56, 0x42, 0x00);

  const _ptEjecutarPrueba = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  try {
    await _ptEjecutarPrueba(() => _ptEnviarBytes(new Uint8Array(d)));
  } catch (e) {
    alert('⚠️ ' + e.message);
  }
}

// Imprime 3 tickets cortos de prueba, uno por cada forma posible de
// resaltar la nota del cliente (arriba del pedido, abajo junto al total,
// y en negro invertido) — para decidir en papel real cuál queda mejor,
// sin necesidad de tocar el pipeline real (_ptBuildTicketBytes) todavía.
// Autocontenida igual que imprimirPruebaModificaciones de arriba: se
// puede borrar entera el día que ya se haya decidido el estilo definitivo.
async function imprimirPruebaEstiloNotaCliente() {
  const tc = getTicketConfig();
  const ESC = 0x1B, GS = 0x1D;
  const nota = 'Sin cebolla porfa, alergia a frutos secos';

  function buildBytes(variante, etiqueta) {
    const d = [];
    const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
    const center = () => d.push(ESC, 0x61, 0x01);
    const left = () => d.push(ESC, 0x61, 0x00);
    const bold = on => d.push(ESC, 0x45, on ? 0x01 : 0x00);
    const big = () => d.push(ESC, 0x21, 0x30);
    const normal = () => d.push(ESC, 0x21, 0x00);
    const invert = on => d.push(GS, 0x42, on ? 0x01 : 0x00);
    const linea = () => push('------------------------------------------------\n');

    const notaBlock = () => {
      if (variante === 'negro') invert(true);
      center(); bold(true); big();
      push('*** NOTA CLIENTE ***\n');
      normal(); left(); bold(true);
      push(nota + '\n');
      bold(false);
      if (variante === 'negro') invert(false);
    };

    d.push(ESC, 0x40);
    center();
    big(); push(tc.nombre + '\n'); normal();
    push('PRUEBA - NOTA ' + etiqueta + '\n');
    linea();
    left();
    if (variante === 'arriba') { notaBlock(); linea(); }
    push('1x Patata Kebab                7,50 EUR\n');
    push('1x Cookie Lotus                3,99 EUR\n');
    linea();
    center();
    big(); push('11,49 EUR\n'); normal();
    push(tc.textoPago + '\n');
    if (variante !== 'arriba') { linea(); notaBlock(); }
    linea();
    push(tc.despedida + '\n');
    push('(ticket de prueba, no es un pedido real)\n');
    push('\n\n');
    d.push(GS, 0x56, 0x42, 0x00);
    return new Uint8Array(d);
  }

  const variantes = [
    ['arriba', 'ARRIBA'],
    ['abajo', 'ABAJO'],
    ['negro', 'NEGRO INVERTIDO']
  ];
  const _ptEjecutarPrueba = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  try {
    for (const [variante, etiqueta] of variantes) {
      await _ptEjecutarPrueba(() => _ptEnviarBytes(buildBytes(variante, etiqueta)));
    }
  } catch (e) {
    alert('⚠️ ' + e.message);
  }
}

// Reimprime el último ticket normal enviado (no el de prueba, ni una
// anulación) — para el caso de que se atasque el papel a mitad de
// impresión, sin tener que ir a buscar el pedido en la lista. Pasa por
// _ptEnFila() por el mismo motivo que imprimirTicketPrueba() de arriba.
async function reimprimirUltimoTicketTermico() {
  if (!_ptUltimoTicket) {
    alert('Todavía no se ha impreso ningún ticket en este dispositivo.');
    return;
  }
  const _ptEjecutarReimpresion = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  try {
    await _ptEjecutarReimpresion(() => imprimirTicketTermico(_ptUltimoTicket));
  } catch (e) {
    alert('⚠️ No se pudo reimprimir: ' + e.message);
  }
}

// Cartel con QR para el mostrador: al escanearlo se abre la web ya con el
// código de "pedido desde el local" puesto (sin gastos de gestión ni SMS),
// sin que el cliente tenga que escribir nada — para pegar en el mostrador
// cuando hay cola. Se imprime tal cual, en un ticket corto aparte.
// "copias" deja sacar varios carteles del MISMO código de una vez (para
// varios puntos del local, o de repuesto) sin generar uno nuevo cada vez —
// pasa por _ptEnFila() para que no se atropellen entre sí ni con otros
// tickets que se estén imprimiendo a la vez.
async function imprimirCartelQRLocal(copias) {
  const code = (typeof getLocalFeeCode === 'function') ? getLocalFeeCode() : '';
  if (!code) {
    alert('Primero pon y guarda un código en "Código pedido desde el local".');
    return;
  }
  const n = Math.max(1, Math.min(10, parseInt(copias, 10) || 1));
  const _ptEjecutarCartel = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
  for (let i = 0; i < n; i++) {
    try {
      await _ptEjecutarCartel(() => _imprimirUnCartelQRLocal(code));
    } catch (e) {
      alert('⚠️ No se pudo imprimir el cartel: ' + e.message);
      return;
    }
  }
}
async function _imprimirUnCartelQRLocal(code) {
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
  push('(codigo valido solo hoy)\n');
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
  await _ptEnviarBytes(new Uint8Array(d));
}

// Imprime el "Resumen del día" que se ve en el panel tras pulsar "Cerrar
// el día" (activarFinDeNoche(), en admin-turnos-descuentos.js) — pedidos,
// total recaudado y top productos. Lee window._ultimoResumenDia, que ese
// mismo botón deja guardado justo antes de pintar el resumen en pantalla,
// así no hace falta volver a pedir las estadísticas ni escapar nombres de
// producto dentro de un atributo onclick.
// Helper común a los tres "resumen de pedidos" que se pueden imprimir
// (fin de noche, hoy en vivo, un día del historial) — mismo formato de
// ticket para los tres, solo cambian el subtítulo y los datos.
async function _ptImprimirResumenPedidos(subtitulo, fecha, pedidos, total, topSorted) {
  const ESC = 0x1B, GS = 0x1D;
  const d = [];
  const push = s => { for (const c of _ptEncodeStr(s)) d.push(c.charCodeAt(0) & 0xFF); };
  const center = () => d.push(ESC, 0x61, 0x01);
  const left = () => d.push(ESC, 0x61, 0x00);
  const big = () => d.push(ESC, 0x21, 0x30);
  const bold = on => d.push(ESC, 0x45, on ? 0x01 : 0x00);
  const normal = () => d.push(ESC, 0x21, 0x00);
  const linea = () => push('--------------------------------\n');
  d.push(ESC, 0x40);
  center();
  big();
  push('DULCE PATATA\n');
  normal();
  push(subtitulo + '\n');
  push(fecha + '\n');
  linea();
  left();
  bold(true);
  push('Pedidos: ' + pedidos + '\n');
  push('Total: ' + total + ' EUR\n');
  bold(false);
  if (topSorted && topSorted.length) {
    linea();
    push('Top productos:\n');
    topSorted.forEach((e, i) => {
      const medalla = i === 0 ? '1o' : i === 1 ? '2o' : '3o';
      push(medalla + ' ' + e[0] + ' (' + e[1] + ')\n');
    });
  }
  linea();
  center();
  push('\n\n');
  d.push(GS, 0x56, 0x42, 0x00);
  try {
    const ejecutar = typeof _ptEnFila === 'function' ? _ptEnFila : (fn => fn());
    await ejecutar(() => _ptEnviarBytes(new Uint8Array(d)));
  } catch (e) {
    alert('⚠️ No se pudo imprimir el resumen: ' + e.message);
  }
}
async function imprimirResumenDiaTermico() {
  const r = window._ultimoResumenDia;
  if (!r) {
    alert('Todavía no hay un resumen del día que imprimir — pulsa antes "Cerrar el día".');
    return;
  }
  await _ptImprimirResumenPedidos('Resumen del dia', r.fecha, r.pedidos, r.total, r.topSorted);
}

// Imprime el total generado y el nº de pedidos de HOY (pestaña "Hoy" del
// panel — stat-count/stat-total, misma fuente que loadDayStats() en
// admin-antispam-stats.js) en cualquier momento del día, sin depender de
// haber pulsado "Cerrar el día" — a diferencia de imprimirResumenDiaTermico()
// de arriba, que solo tiene datos después de cerrar.
async function imprimirResumenHoyTermico() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats = null;
  if (window.fb_getStats) {
    try { stats = await window.fb_getStats(todayKey); } catch (e) {}
  }
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch (e) {}
  }
  if (!stats || stats.date !== todayKey) stats = { date: todayKey, count: 0, total: 0 };
  const totalStr = (stats.total || 0).toFixed(2).replace('.', ',');
  await _ptImprimirResumenPedidos('Pedidos de hoy', todayKey, stats.count || 0, totalStr);
}

// Imprime el resumen de UN día concreto del historial (Historial por días,
// acceso bimba) — getHistorial() ya tiene la lista completa (ver
// nucleo-compartido.js), aquí solo se busca el día pedido y se reutiliza
// el mismo formato de ticket que arriba.
async function imprimirResumenHistorialDiaTermico(fecha) {
  const dia = getHistorial().find(d => d.date === fecha);
  if (!dia) {
    alert('No hay datos guardados de ese día.');
    return;
  }
  const dateLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const totalStr = (dia.total || 0).toFixed(2).replace('.', ',');
  await _ptImprimirResumenPedidos('Resumen del dia', dateLabel, dia.count || 0, totalStr);
}

// ── AVISO DE PAPEL ──
// Comando ESC/POS "DLE EOT 4" (transmisión de estado en tiempo real, sensor
// de papel). La interpretación exacta de los bits varía algo según el
// fabricante — esta es la más habitual en clones compatibles con Epson.
// Si en esta impresora en concreto no coincidiera al probarlo con el rollo
// realmente vacío, hay que ajustar las máscaras (0x0C / 0x60) de aquí abajo.
async function _ptComprobarPapel() {
  // Solo USB expone este comando de estado de papel de forma fiable — para
  // Bluetooth dependería de que cada modelo tenga su propia característica
  // de notificación, algo que varía demasiado entre clones como para
  // adivinarlo sin poder probarlo en la impresora real.
  if (_ptTransporte !== 'usb' || !_ptIsConnected() || _ptEndpointIn === null) return;
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
// Antes este aviso era solo visual, sin sonido — a diferencia del de
// impresora desconectada (sonido + banner + se repite solo si sigue sin
// arreglarse). En un día con mucho volumen, quedarse sin papel es más
// probable que un corte de conexión, y era justo el caso peor cubierto:
// el ticket se sigue dando por "impreso" (los bytes sí se mandan) aunque
// no salga papel de verdad, así que sin sonido es fácil no darse cuenta
// hasta que se acumulan varios pedidos sin imprimir. Mismo patrón que
// _ptAvisoDesconexionImpresora: solo suena al pasar de "con papel" a
// "sin papel" (no en cada sondeo de 8s mientras sigue sin papel), y se
// repite sola cada PT_AVISO_ESCALADO_MS si nadie lo soluciona.
let _ptTeniaPapel = true;
let _ptAvisoPapelEscaladoTimer = null;
function _ptPapelUI(sinPapel) {
  document.querySelectorAll('.pt-papel-aviso').forEach(el => {
    // El banner grande de la pantalla de cocina necesita "flex" (para
    // colocar el texto centrado verticalmente como el de "activa el
    // audio"); los avisos pequeños del panel de admin usan "block" por
    // defecto — cada elemento indica el suyo con data-show-display.
    el.style.display = sinPapel ? (el.dataset.showDisplay || 'block') : 'none';
  });
  if (_ptTeniaPapel && sinPapel) {
    _ptSonarAvisoPapel();
    if (_ptAvisoPapelEscaladoTimer) clearInterval(_ptAvisoPapelEscaladoTimer);
    _ptAvisoPapelEscaladoTimer = setInterval(() => {
      if (!_ptTeniaPapel) { _ptSonarAvisoPapel(); } else { clearInterval(_ptAvisoPapelEscaladoTimer); _ptAvisoPapelEscaladoTimer = null; }
    }, PT_AVISO_ESCALADO_MS);
  } else if (!sinPapel && _ptAvisoPapelEscaladoTimer) {
    clearInterval(_ptAvisoPapelEscaladoTimer);
    _ptAvisoPapelEscaladoTimer = null;
  }
  _ptTeniaPapel = !sinPapel;
}
function _ptSonarAvisoPapel() {
  if (typeof playNotificationSound === 'function') {
    const tipo = (typeof getSoundDesconexionType === 'function') ? getSoundDesconexionType() : 'urgente';
    playNotificationSound(tipo);
  }
}

if (navigator.usb) {
  document.addEventListener('DOMContentLoaded', () => { _ptReconectar(); });
  navigator.usb.addEventListener('disconnect', (e) => {
    if (_ptDevice && e.device === _ptDevice) { _ptResetConexion(); _ptStatusUI(false); }
  });
  // Si Chrome detecta que se ha enchufado algún dispositivo USB, probamos a
  // reconectar por si es la impresora (p.ej. se desenchufó el cable y se
  // volvió a meter) — sin esto había que pulsar "Conectar impresora" a mano.
  navigator.usb.addEventListener('connect', () => {
    if (!_ptIsConnected()) _ptReconectar();
  });
}

if (navigator.usb || navigator.bluetooth) {
  if (!navigator.usb) document.addEventListener('DOMContentLoaded', () => { _ptReconectar(); });
  // Reintento periódico de reconexión mientras no esté conectada — cubre el
  // caso de que la tablet se haya quedado en reposo o no se dispare ningún
  // evento de conexión a tiempo. Si SÍ está conectada por Bluetooth, se
  // manda además un "pulso" (comando de estado en tiempo real, no imprime
  // nada) para generar tráfico en la conexión — muchos módulos BLE baratos
  // se desconectan solos tras un rato sin ningún dato, aunque estén dentro
  // de alcance y con batería; este pulso evita que se les considere
  // "inactivos" entre pedido y pedido.
  //
  // Mientras está DESCONECTADA se reintenta cada 2s en vez de 8s — el hueco
  // más habitual es justo al abrir/recargar la web (la reconexión con un
  // dispositivo ya emparejado tarda unos segundos), y si un pedido llega
  // justo en ese hueco se queda en la cola pendiente hasta el siguiente
  // reintento con éxito. Con 8s de por medio, "el primer pedido no sale
  // solo" podía tardar bastante en corregirse sin tocar nada; con 2s el
  // hueco real se reduce mucho. Una vez conectada, vuelve al ritmo normal
  // de 8s (no hace falta ir más rápido, y así no se satura de tráfico la
  // conexión Bluetooth sin necesidad).
  function _ptBucleMantenimiento() {
    const conectada = _ptIsConnected();
    setTimeout(() => {
      if (!_ptIsConnected()) {
        _ptReconectar();
      } else if (_ptTransporte === 'ble') {
        _ptBlePulso();
      } else {
        _ptComprobarPapel();
      }
      // La cola pendiente normalmente se vacía sola al detectar una
      // reconexión real (ver _ptStatusUI), pero un ticket puede fallar por un
      // error puntual de escritura SIN que la impresora llegue a desconectarse
      // de verdad — en ese caso ese flanco nunca se dispara. Este intento
      // periódico (con la impresora ya conectada) cubre ese hueco; _ptColaProcesar
      // ya se protege solo contra solapes (_ptColaProcesando).
      if (typeof _ptColaCargar === 'function' && _ptColaCargar().length) _ptColaProcesar();
      _ptBucleMantenimiento();
    }, conectada ? 8000 : 2000);
  }
  _ptBucleMantenimiento();
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

// ── HISTORIAL MEJORADO ──
// BANNER_KEY, BANNER_TIPOS, getBannerDia, _applyBannerDia,
// _updateBannerToggleBtn y loadBannerDia viven en nucleo-compartido.js
// (bundle de cliente) — el banner se pinta para cualquier visitante, no
// solo para admin.
async function toggleBannerDia() {
  const data = getBannerDia();
  data.active = !data.active;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  // Antes el .catch() se quedaba vacío — si esta escritura fallaba, este
  // dispositivo seguía mostrando el banner como guardado/activo, pero
  // ningún otro dispositivo ni el sitio de cara al cliente (que lee de
  // Firebase) lo recibía nunca, sin ningún aviso visible.
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(e => _avisarSiFalloGuardado(e, 'banner del día'));
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
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(e => _avisarSiFalloGuardado(e, 'banner del día'));
  _applyBannerDia(data);
  showToast('banner-toast');
}
// ── EXPORTAR PDF ─────────────────────────────────────────────────────────────

function _pdfStyles() {
  return "\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body { font-family: Arial, sans-serif; color: #2A1506; background: #fff; }\n    .header { background: #3D1F0D; color: #FFF8EE; padding: 20px 28px; }\n    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 2px; }\n    .header p  { font-size: 12px; opacity: .7; }\n    .content { padding: 24px 28px; }\n    .order-card { border: 1.5px solid #F5E6C8; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; page-break-inside: avoid; }\n    .order-num  { font-size: 18px; font-weight: 900; color: #3D1F0D; }\n    .order-meta { font-size: 12px; color: #8A6A4E; margin: 4px 0 10px; }\n    .order-items { font-size: 13px; color: #2A1506; border-top: 1px solid #F5E6C8; padding-top: 8px; }\n    .order-item { display: flex; justify-content: space-between; padding: 3px 0; }\n    .order-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #3D1F0D; border-top: 1.5px solid #F5E6C8; margin-top: 8px; padding-top: 8px; }\n    .summary { background: #FFF8EE; border: 1.5px solid #3D1F0D; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 24px; flex-wrap: wrap; }\n    .summary-item { text-align: center; }\n    .summary-item .val { font-size: 24px; font-weight: 900; color: #3D1F0D; }\n    .summary-item .lbl { font-size: 11px; color: #8A6A4E; text-transform: uppercase; letter-spacing: .05em; }\n    .ticket-box { border: 2px solid #3D1F0D; border-radius: 14px; padding: 24px; margin: 24px; }\n    .ticket-title { font-size: 13px; color: #8A6A4E; text-align:center; margin-bottom: 4px; }\n    .ticket-num { font-size: 36px; font-weight: 900; color: #3D1F0D; text-align:center; margin-bottom: 16px; }\n    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }\n  ";
}
// Convierte un fragmento de HTML en un PDF de verdad que se descarga solo
// — antes, tanto exportTicketPDF() como exportHistorialPDF() abrian una
// ventana nueva y llamaban a window.print(), que abre el dialogo de
// impresion del navegador (habia que elegir "Guardar como PDF" a mano, y a
// veces se manda directo a una impresora fisica en vez de guardarlo).
// html2pdf.js (cargado por CDN en index.html/fichar-publico.html) genera
// el archivo .pdf directamente, sin pasar por ningun dialogo de impresion.
function _descargarHtmlComoPDF(bodyHtml, filename, btn) {
  if (typeof html2pdf === 'undefined') {
    alert('No se pudo generar el PDF (no cargó la librería). Comprueba tu conexión y recarga la página.');
    return;
  }
  // Con el historial completo la captura puede tardar varios segundos —
  // antes ningún botón se desactivaba ni avisaba "generando…" mientras
  // tanto, así que un doble clic disparaba dos generaciones a la vez,
  // insertando el contenido duplicado en la página (dos contenedores
  // clonados a la vez, uno por cada llamada).
  if (btn) {
    if (btn.disabled) return;
    btn.dataset.pdfTextoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Generando…';
  }
  const restaurarBtn = () => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.pdfTextoOriginal;
      delete btn.dataset.pdfTextoOriginal;
    }
  };
  const styleEl = document.createElement('style');
  styleEl.textContent = _pdfStyles();
  document.head.appendChild(styleEl);
  // OJO — causa real del PDF en blanco, confirmada probándolo en un
  // navegador real: si el contenedor lleva position:fixed o
  // position:absolute, html2canvas (la parte de html2pdf.js que "fotografía"
  // el HTML) le calcula 0px de alto al clonar el documento para capturarlo,
  // aunque el navegador normal sí lo mida bien — y un lienzo de 0px de alto
  // es un PDF en blanco. Quitando el position por completo (queda como un
  // bloque normal, al final de la página) html2canvas lo mide y lo captura
  // bien, comprobado con varias pruebas. Como ya no se puede tapar con
  // z-index/posición, se añade y se quita tan rápido que en la práctica no
  // se llega a ver.
  const container = document.createElement('div');
  container.style.cssText = 'background:#fff;width:210mm';
  container.innerHTML = bodyHtml;
  document.body.appendChild(container);
  const limpiar = () => {
    container.remove();
    styleEl.remove();
  };
  // Un frame de margen para que el navegador termine de pintar el
  // contenedor recién insertado antes de que html2canvas lo capture.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    html2pdf().from(container).set({
      margin: 0,
      filename,
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save().then(() => { limpiar(); restaurarBtn(); }).catch((err) => {
      limpiar();
      restaurarBtn();
      alert('⚠️ No se pudo generar el PDF: ' + (err && err.message || 'error desconocido'));
    });
  }));
}
function exportTicketPDF(num, name, time, total, slot, items, phone, notes, btn) {
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const itemsHtml = (items || []).map(it => `<div class="order-item"><span>${it.qty}x ${escapeHtml(it.name || '')}</span><span>${(it.subtotal || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
  const body = `
    <div class="header" style="text-align:center">
      <h1>🥔 Dulce Patata Food</h1>
      <p>${fecha}</p>
    </div>
    <div class="ticket-box">
      <div class="ticket-title">Número de pedido</div>
      <div class="ticket-num">${escapeHtml(num || '')}</div>
      <div class="order-meta" style="text-align:center;margin-bottom:14px">
        👤 ${escapeHtml(name || '—')}
        ${phone ? `&nbsp;·&nbsp; 📞 ${escapeHtml(phone)}` : ''}
        ${time ? `&nbsp;·&nbsp; 🕐 ${escapeHtml(time)}` : ''}
        ${slot ? `<br>📦 Recogida de patata a las ${escapeHtml(slot)}h` : ''}
      </div>
      ${itemsHtml ? `<div class="order-items">${itemsHtml}<div class="order-total"><span>Total a pagar</span><span>${parseFloat(total).toFixed(2).replace('.', ',')} €</span></div></div>` : ''}
      ${notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:10px;font-style:italic">📝 ${escapeHtml(notes)}</div>` : ''}
      <div style="text-align:center;margin-top:16px;font-size:12px;color:#8A6A4E">Paga en caja cuando recojas 💛</div>
    </div>`;
  _descargarHtmlComoPDF(body, 'ticket-' + (num || 'pedido') + '.pdf', btn);
}
function _buildClientesMap() {
  const hist = getHistorial();
  const map = {}; // phone → { phone, names, count, total, lastDate, lastOrder, orders[] }
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      // Mismo criterio de normalización que la comprobación de lista negra
      // más abajo (solo dígitos) — antes este agrupado quitaba solo
      // espacios/guiones/paréntesis/puntos/+, así que un teléfono con algún
      // otro carácter fuera de ese conjunto podía terminar en una clave
      // distinta aquí que en la lista negra, partiendo en silencio a un
      // mismo cliente real en varias filas.
      const phone = (o.phone || '').replace(/\D/g, '') || '—';
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
// Cargar clientes ocultos desde Firebase al abrir la pestaña Clientes —
// mismo patrón que loadAntiSpamFromFirebase() con la blacklist, para que
// ocultar un cliente en un dispositivo (p.ej. el PC) también se refleje en
// los demás (p.ej. la tablet), en vez de quedarse solo en su localStorage.
async function loadClientesOcultosFromFirebase() {
  if (window.fb_loadClientesOcultos) {
    try {
      const oc = await window.fb_loadClientesOcultos();
      if (oc) saveClientesOcultosLocal(oc);
    } catch {}
  }
  renderClientes();
}
let _clientesMostrarOcultos = false;
function toggleMostrarOcultosClientes() {
  _clientesMostrarOcultos = !_clientesMostrarOcultos;
  renderClientes();
}
// Ocultar un cliente de la lista "Clientes" — NO borra ningún pedido ni
// dato del historial, solo deja de aparecer aquí. Reversible con
// restaurarCliente().
async function ocultarCliente(phone) {
  if (!phone) return;
  if (!confirm('¿Ocultar este cliente de la lista de Clientes?\n\nNo se borra ningún pedido — solo deja de aparecer aquí. Puedes recuperarlo luego con el botón "🗑️ Ocultos".')) return;
  const list = getClientesOcultos();
  if (!list.includes(phone)) list.push(phone);
  saveClientesOcultosLocal(list);
  if (window.fb_saveClientesOcultos) await window.fb_saveClientesOcultos(list).catch(() => {});
  renderClientes();
}
async function restaurarCliente(phone) {
  const list = getClientesOcultos().filter(p => p !== phone);
  saveClientesOcultosLocal(list);
  if (window.fb_saveClientesOcultos) await window.fb_saveClientesOcultos(list).catch(() => {});
  renderClientes();
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
  const todos = _buildClientesMap();
  const ocultos = getClientesOcultos();
  const clientes = _clientesMostrarOcultos
    ? todos.filter(c => ocultos.includes(c.phone))
    : todos.filter(c => !ocultos.includes(c.phone));

  const toggleBtn = document.getElementById('cocultos-toggle-btn');
  if (toggleBtn) {
    if (_clientesMostrarOcultos) {
      toggleBtn.textContent = '👁️ Ver clientes (' + (todos.length - ocultos.length) + ')';
      toggleBtn.style.background = 'var(--brown)';
      toggleBtn.style.color = 'var(--cream)';
      toggleBtn.style.borderColor = 'var(--brown)';
    } else {
      toggleBtn.textContent = '🗑️ Ocultos (' + ocultos.length + ')';
      toggleBtn.style.background = 'var(--white)';
      toggleBtn.style.color = 'var(--muted)';
      toggleBtn.style.borderColor = 'var(--warm)';
    }
  }

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

  // Se reinicia en cada render (no solo la primera vez) — antes se iba
  // guardando cada pedido visto en este objeto global sin limpiarlo nunca,
  // así que en una sesión larga de mostrador (muchas búsquedas, cambios de
  // orden) iba acumulando entradas indefinidamente. Solo hace falta que
  // contenga los pedidos de LA lista que se acaba de pintar — cualquier
  // fila anterior ya no tiene su elemento en el DOM, así que tampoco puede
  // llegar a usar una entrada vieja.
  window._dpfPedidosMap = {};
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
    const phoneAttr = c.phone.replace(/'/g, "\\'");
    const hideBtn = _clientesMostrarOcultos
      ? '<button onclick="event.stopPropagation();restaurarCliente(\'' + phoneAttr + '\')" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #9FE1CB;background:#E6FAF0;color:#1a7a4a;cursor:pointer;font-family:\'DM Sans\',sans-serif">↩️ Restaurar</button>'
      : '<button onclick="event.stopPropagation();ocultarCliente(\'' + phoneAttr + '\')" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #e74c3c;background:#fdf0ee;color:#c0392b;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑️ Ocultar</button>';
    const actionBtns = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" onclick="event.stopPropagation()">' + callBtn + waBtn + hideBtn + '</div>';
    const phoneId = phoneClean || c.phone.replace(/\W/g, '');

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
function loadHistorial(despues) {
  // Cargar historial completo desde Firebase (fuente de verdad entre
  // dispositivos) — sin esto, un dispositivo que nunca lo haya sincronizado
  // antes (p.ej. la tablet de cocina, si solo se usó para pedidos en vivo)
  // solo tiene lo que haya en su propio localStorage, que puede estar vacío
  // aunque en otro dispositivo (el PC donde sí se ha abierto esta vista)
  // haya historial de sobra — tanto la vista "Por días" como la lista de
  // Clientes dependen de esto, por eso admite un callback opcional para
  // repintar lo que corresponda en cada caso.
  if (window.fb_loadHistorial) {
    window.fb_loadHistorial(30).then(fbHist => {
      if (fbHist && fbHist.length > 0) {
        // Guardar en localStorage para acceso rápido futuro
        fbHist.forEach(d => saveToHistorial(d));
      }
      _renderHistorial();
      if (despues) despues();
    }).catch(() => { _renderHistorial(); if (despues) despues(); });
    // Mostrar localStorage mientras llega Firebase
    if (getHistorial().length > 0) { _renderHistorial(); if (despues) despues(); }
    return;
  }
  _renderHistorial();
  if (despues) despues();
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
    return "\n    <div style=\"display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F5E6C8;flex-wrap:wrap\">\n      <span style=\"font-weight:600;color:#2A1506;font-size:13px;min-width:110px\">".concat(dateLabel, "</span>\n      <span style=\"font-size:13px;color:#8A6A4E\">").concat(d.count, " pedido").concat(d.count !== 1 ? 's' : '', "</span>\n      <span style=\"font-weight:700;color:#3D1F0D;font-size:14px\">").concat(d.total.toFixed(2).replace('.', ','), " \u20AC</span>\n      <button onclick=\"expandHistorialDay('").concat(d.date, "')\" style=\"background:#F5E6C8;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;color:#3D1F0D;font-weight:600\">Ver detalle</button>\n      <button onclick=\"exportDayPDFFromHistorial('").concat(d.date, "',this)\" style=\"background:#3D1F0D;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif\">\uD83D\uDCC4 PDF</button>\n      <button onclick=\"imprimirResumenHistorialDiaTermico('").concat(d.date, "')\" style=\"background:var(--brown);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif\">\uD83D\uDDA8\uFE0F Imprimir</button>\n    </div>");
  }).join('');
}
function exportDayPDFFromHistorial(date, btn) {
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
  _exportDayDataPDF(day.orders, day.total, fecha, date, btn);
}
function _exportDayDataPDF(orders, total, fecha, dateKey, btn) {
  const t = total || orders.reduce((a, o) => a + (o.total || 0), 0);
  const ordersHtml = orders.map(o => {
    const itemsHtml = (o.items || []).map(it => `<div class="order-item"><span>${it.qty}x ${escapeHtml(it.name || '')}</span><span>${(it.subtotal || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="order-num">${escapeHtml(o.num || '')}</div>
          <div class="order-meta">👤 ${escapeHtml(o.name || '—')} &nbsp;·&nbsp; 🕐 ${escapeHtml(o.time || '—')}${o.slot ? ` &nbsp;·&nbsp; 📦 ${escapeHtml(o.slot)}` : ''}${o.phone ? ` &nbsp;·&nbsp; 📞 ${escapeHtml(o.phone)}` : ''}</div>
        </div>
        <div style="font-size:18px;font-weight:900;color:#3D1F0D">${(o.total || 0).toFixed(2).replace('.', ',')} €</div>
      </div>
      ${itemsHtml ? `<div class="order-items">${itemsHtml}</div>` : ''}
      ${o.notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:6px;font-style:italic">📝 ${escapeHtml(o.notes)}</div>` : ''}
    </div>`;
  }).join('');
  const body = `
    <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Resumen de pedidos · ${fecha}</p></div>
    <div class="content">
      <div class="summary">
        <div class="summary-item"><div class="val">${orders.length}</div><div class="lbl">Pedidos</div></div>
        <div class="summary-item"><div class="val">${t.toFixed(2).replace('.', ',')} €</div><div class="lbl">Total</div></div>
        <div class="summary-item"><div class="val">${(t / orders.length).toFixed(2).replace('.', ',')} €</div><div class="lbl">Ticket medio</div></div>
      </div>
      ${ordersHtml}
    </div>`;
  _descargarHtmlComoPDF(body, 'pedidos-' + dateKey + '.pdf', btn);
}
function exportHistorialPDF(btn) {
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
    const ordersHtml = (d.orders || []).map(o => `<div class="order-item" style="font-size:12px"><span>${escapeHtml(o.num || '')} · ${escapeHtml(o.name || '—')} ${o.time ? '· ' + escapeHtml(o.time) : ''}</span><span>${(o.total || 0).toFixed(2).replace('.', ',')} €</span></div>`).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div class="order-num" style="font-size:15px">${fecha}</div>
        <div style="font-size:14px;font-weight:700;color:#3D1F0D">${d.count} pedidos · ${d.total.toFixed(2).replace('.', ',')} €</div>
      </div>
      ${ordersHtml}
    </div>`;
  }).join('');
  const body = `
    <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Historial completo · ${hist.length} días</p></div>
    <div class="content">
      <div class="summary">
        <div class="summary-item"><div class="val">${hist.length}</div><div class="lbl">Días</div></div>
        <div class="summary-item"><div class="val">${totalOrders}</div><div class="lbl">Pedidos</div></div>
        <div class="summary-item"><div class="val">${totalMoney.toFixed(2).replace('.', ',')} €</div><div class="lbl">Total</div></div>
        <div class="summary-item"><div class="val">${totalOrders ? (totalMoney / totalOrders).toFixed(2).replace('.', ',') : '0,00'} €</div><div class="lbl">Ticket medio</div></div>
      </div>
      ${daysHtml}
    </div>`;
  _descargarHtmlComoPDF(body, 'historial-dulce-patata.pdf', btn);
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
    html += "<div style=\"display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F5E6C8;font-size:13px;flex-wrap:wrap\">\n      <span style=\"font-weight:700;color:#3D1F0D\">".concat(escapeHtml(o.num), "</span>\n      <span style=\"flex:1;color:#2A1506\">").concat(escapeHtml(o.name), "</span>\n      ").concat(o.slot ? "<span style=\"background:rgba(244,196,48,0.08);color:#3D1F0D;font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px\">\uD83D\uDD50 ".concat(escapeHtml(o.slot), "</span>") : '', "\n      <span style=\"color:#8A6A4E;font-size:12px\">").concat(escapeHtml(o.time), "</span>\n      <span style=\"font-weight:700;color:#3D1F0D\">").concat((o.total || 0).toFixed(2).replace('.', ','), " \u20AC</span>\n    </div>");
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
  // La pestaña "Historial" del panel normal solo muestra la lista de
  // clientes ahora — el resumen por días (con la facturación) se movió al
  // acceso restringido (ver abrirHistorialDiasBimba en admin-accesos.js),
  // porque no es algo que necesite ver el personal.
  // loadHistorial() sincroniza primero con Firebase (ver comentario en su
  // definición) — sin esto, un dispositivo que nunca haya abierto el
  // historial por días (p.ej. una tablet usada solo para pedidos en vivo)
  // mostraría la lista de Clientes vacía, con solo lo que hubiera quedado
  // en su localStorage local.
  if (id === 'historial') { loadClientesOcultosFromFirebase(); loadHistorial(renderClientes); }
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
  if (id === 'alertas') {
    renderAlertas();
    if (typeof renderIncidencias === 'function') renderIncidencias();
  }
  if (id === 'local') {
    loadSoundConfigUI();
    loadSoundDesconexionConfigUI();
    loadSlotTurnosUI();
    loadModifyWindowInput();
    if (typeof _renderAutoPausaUI === 'function') _renderAutoPausaUI();
    if (typeof _renderPausaExpresUI === 'function') _renderPausaExpresUI();
    if (typeof _renderAvisoSaturacionUI === 'function') _renderAvisoSaturacionUI();
    loadBannerDia();
  }
  // Nota: 'pwd', 'stock-config', 'accesos' y 'empleados' NO se abren nunca
  // a través de showAdminSection() — son secciones del acceso restringido
  // "bimba" y cada una tiene hoy su propia función dedicada, que además ya
  // hace su propia inicialización: bimbaIrAContrasena(), bimbaVolverAlPanel()
  // (que además apunta a "stock-config", no "admin-empleados" — ese id ni
  // siquiera existe ya, es "admin-bimba-empleados"), bimbaIrAAccesos() y
  // bimbaIrAEmpleados() (todas en js/auth.js). El gesto secreto "log" (que
  // sí usaba esta función, vía checkLogSecret) se quitó por completo:
  // apuntaba a un id ("admin-log") que ya no existía, y la misma vista de
  // actividad ya está disponible sin trucos en la pestaña "📋 Actividad"
  // de Accesos. Si alguna vez hace falta reintroducir estos ids aquí, que
  // sea a propósito, no por accidente.
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
    // Inicializar tiempo para modificar pedido
    if (typeof loadModifyWindowInput === 'function') loadModifyWindowInput();
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
// Antes cada fallo de Firebase se mostraba tal cual (alert('Error al X: ' +
// e.message)) — texto técnico de Firebase, en inglés, sin decir qué hacer.
// Este helper deja el mensaje real en la consola (por si hace falta
// depurar) y le da a la dueña un texto claro y en español con la única
// acción que de verdad puede tomar: revisar la conexión y reintentar.
function _fidelizacionAvisoError(accion, e) {
  console.warn('[fidelizacion-admin] ' + accion + ':', e);
  return 'No se ha podido ' + accion + ' — parece un problema de conexión con el servidor. Comprueba tu wifi e inténtalo de nuevo en unos segundos.';
}
const FIDELIZACION_META_ADMIN = 10;
// Umbral para marcar ritmo sospechoso: 2+ sellos separados por menos de
// esto se considera posible abuso (pedidos reales no suelen ir tan seguidos).
const FIDELIZACION_MINUTOS_SOSPECHOSO = 10;
// Con 3 o más premios pendientes sin canjear, algo raro pasa (lo normal es
// canjear pronto) — merece revisarse antes de que se acumule más.
const FIDELIZACION_TOPE_PREMIOS_PENDIENTES = 3;
// Con 3 o más nombres distintos usados por el mismo teléfono, puede que se
// esté compartiendo/reutilizando el número entre varias personas para
// sumar sellos más rápido de lo normal.
const FIDELIZACION_TOPE_NOMBRES_DISTINTOS = 3;
let _fidelizacionDataCache = null;

// Comprueba que "veces que ha completado el ciclo" cuadra con "premios ya
// canjeados + premios todavía pendientes de entregar" — si no cuadra, es
// señal de que se ha tocado algo a mano de forma rara (o hay un fallo),
// no solo de un ritmo de pedidos sospechoso.
function _clienteConNumerosQueNoCuadran(c) {
  const vecesCompletado = typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0;
  const canjes = Array.isArray(c.historialCanjes) ? c.historialCanjes.length : 0;
  const premiosPendientes = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
  return (canjes + premiosPendientes) !== vecesCompletado;
}

// Devuelve true si el cliente tiene 2 o más sellos consecutivos separados
// por menos de FIDELIZACION_MINUTOS_SOSPECHOSO minutos. Si el admin ya
// revisó y descartó un ritmo sospechoso (marcarRitmoRevisado), solo se
// tienen en cuenta los sellos posteriores a esa revisión — así un patrón
// ya comprobado como legítimo no se queda marcado en rojo para siempre,
// pero si vuelve a pasar algo raro DESPUÉS, sí se vuelve a avisar.
function _clienteConRitmoSospechoso(historialSellos, revisadoHastaTs) {
  if (!historialSellos || historialSellos.length < 2) return false;
  const umbralMs = FIDELIZACION_MINUTOS_SOSPECHOSO * 60 * 1000;
  const desde = revisadoHastaTs || 0;
  const relevantes = historialSellos.filter(h => h && h.ts > desde);
  if (relevantes.length < 2) return false;
  for (let i = 1; i < relevantes.length; i++) {
    const prev = relevantes[i - 1] && relevantes[i - 1].ts;
    const curr = relevantes[i] && relevantes[i].ts;
    if (prev && curr && (curr - prev) < umbralMs) return true;
  }
  return false;
}
async function marcarRitmoRevisado(telefono) {
  try {
    const mutator = function (current) {
      const c = current || {};
      const historialSellos = Array.isArray(c.historialSellos) ? c.historialSellos : [];
      const ultimoTs = historialSellos.length ? historialSellos[historialSellos.length - 1].ts : Date.now();
      c.sospechosoRevisadoHastaTs = ultimoTs;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert(_fidelizacionAvisoError('marcar como revisado', e));
  }
}
async function sumarSelloFidelizacionRapido(telefono) {
  try {
    const mutator = function (current) {
      const c = current || {};
      let sellos = typeof c.sellos === 'number' ? c.sellos : 0;
      let premiosPendientes = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
      let vecesCompletado = typeof c.vecesCompletado === 'number' ? c.vecesCompletado : 0;
      sellos += 1;
      if (sellos >= FIDELIZACION_META_ADMIN) {
        // Mismo tope que aplica el registro de sello normal del servidor
        // (fidelizacion.php, FIDELIZACION_MAX_PREMIOS_PENDIENTES) — este
        // botón rápido del admin no lo comprobaba, así que usarlo varias
        // veces seguidas en un cliente que ya tenía 3 premios pendientes
        // (p. ej. para ponerlo al día) podía subir a 4, 5... rompiendo la
        // regla que el propio sistema impone al flujo normal.
        if (premiosPendientes < FIDELIZACION_TOPE_PREMIOS_PENDIENTES) {
          sellos = 0;
          premiosPendientes += 1;
          vecesCompletado += 1;
        } else {
          sellos = FIDELIZACION_META_ADMIN - 1;
        }
      }
      c.sellos = sellos;
      c.premiosPendientes = premiosPendientes;
      c.vecesCompletado = vecesCompletado;
      delete c.premioDisponible;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert(_fidelizacionAvisoError('sumar el sello', e));
  }
}
async function entregarPremioFidelizacionRapido(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || {};
  const premiosPendientes = typeof cliente.premiosPendientes === 'number' ? cliente.premiosPendientes : (cliente.premioDisponible ? 1 : 0);
  if (premiosPendientes <= 0) {
    alert('Este cliente no tiene premios pendientes.');
    return;
  }
  if (!confirm('¿Marcar 1 premio como entregado a ' + (cliente.nombre || telefono) + '?')) return;
  try {
    const mutator = function (current) {
      const c = current || {};
      let premios = typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0);
      if (premios > 0) {
        premios -= 1;
        const historialCanjes = Array.isArray(c.historialCanjes) ? c.historialCanjes : [];
        historialCanjes.push({ fecha: new Date().toISOString(), ticket: null });
        c.historialCanjes = historialCanjes;
      }
      c.premiosPendientes = premios;
      delete c.premioDisponible;
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      const cliente2 = await window.fb_loadFidelizacionCliente(telefono);
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente2));
    }
    renderFidelizacionList();
  } catch (e) {
    alert(_fidelizacionAvisoError('marcar el premio como entregado', e));
  }
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
  const listEl = document.getElementById('fidelizacion-list');
  const iconEl = document.getElementById('fidelizacion-lista-toggle-icon');
  if (!listEl) return;
  listEl.style.display = 'flex';
  if (iconEl) iconEl.textContent = '▼';
  // Quitar cualquier filtro de tipo/búsqueda activo, esta es una vista distinta
  window._fidelizacionFiltroTipo = null;
  const searchEl = document.getElementById('fidelizacion-search');
  if (searchEl) searchEl.value = '';
  window._fidelizacionCanjesDesde = '';
  window._fidelizacionCanjesHasta = '';
  _pintarFidelizacionCanjes();
}
function _pintarFidelizacionCanjes() {
  const data = _fidelizacionDataCache;
  const listEl = document.getElementById('fidelizacion-list');
  if (!data || !listEl) return;

  let eventos = [];
  Object.entries(data).forEach(([telefono, c]) => {
    (c.historialCanjes || []).forEach(canje => {
      eventos.push({ telefono, nombre: c.nombre || 'Sin nombre', fecha: canje.fecha || '-', ticket: canje.ticket || null });
    });
  });

  const desde = window._fidelizacionCanjesDesde || '';
  const hasta = window._fidelizacionCanjesHasta || '';
  if (desde) eventos = eventos.filter(ev => (ev.fecha || '').slice(0, 10) >= desde);
  if (hasta) eventos = eventos.filter(ev => (ev.fecha || '').slice(0, 10) <= hasta);
  eventos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  const filtroHtml = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;font-size:12px;color:#8A6A4E">'
    + '<span>Desde</span><input type="date" value="' + escapeAttr(desde) + '" onchange="window._fidelizacionCanjesDesde=this.value;_pintarFidelizacionCanjes()" style="padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:12px">'
    + '<span>Hasta</span><input type="date" value="' + escapeAttr(hasta) + '" onchange="window._fidelizacionCanjesHasta=this.value;_pintarFidelizacionCanjes()" style="padding:5px 8px;border:1.5px solid #F5E6C8;border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:12px">'
    + ((desde || hasta) ? '<span onclick="window._fidelizacionCanjesDesde=\'\';window._fidelizacionCanjesHasta=\'\';_pintarFidelizacionCanjes()" style="cursor:pointer;color:#c0392b;font-weight:700">✕ Quitar filtro</span>' : '')
    + '</div>';

  if (!eventos.length) {
    listEl.innerHTML = filtroHtml + '<div style="font-size:13px;color:#8A6A4E">Sin premios canjeados' + ((desde || hasta) ? ' en ese rango de fechas.' : ' todavía.') + '</div>';
    return;
  }
  listEl.innerHTML = filtroHtml + '<div style="font-weight:700;color:#3D1F0D;margin-bottom:8px;font-size:13px">🎁 Historial de premios canjeados (' + eventos.length + ')</div>' +
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
    historialNombres: Array.isArray(c.historialNombres) ? c.historialNombres : [],
    sospechoso: _clienteConRitmoSospechoso(c.historialSellos, c.sospechosoRevisadoHastaTs),
    noCuadra: _clienteConNumerosQueNoCuadran(c)
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
  } else if (window._fidelizacionFiltroTipo === 'noCuadra') {
    clientes = clientes.filter(c => c.noCuadra);
  } else if (window._fidelizacionFiltroTipo === 'topePremios') {
    clientes = clientes.filter(c => c.premiosPendientes >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES);
  } else if (window._fidelizacionFiltroTipo === 'nombresDistintos') {
    clientes = clientes.filter(c => c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS);
  }

  // Resumen: total clientes, con premio pendiente, total canjes, sospechosos...
  const totalClientes = Object.keys(data).length;
  const conPremio = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) > 0).length;
  const totalCanjes = Object.values(data).reduce((s, c) => s + ((c.historialCanjes || []).length), 0);
  const totalSospechosos = Object.values(data).filter(c => _clienteConRitmoSospechoso(c.historialSellos, c.sospechosoRevisadoHastaTs)).length;
  const totalNoCuadran = Object.values(data).filter(c => _clienteConNumerosQueNoCuadran(c)).length;
  const totalTopePremios = Object.values(data).filter(c => (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : (c.premioDisponible ? 1 : 0)) >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES).length;
  const totalNombresDistintos = Object.values(data).filter(c => Array.isArray(c.historialNombres) && c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS).length;
  if (resumenEl) {
    const chip = (label, val, color, onclickAttr) => "<div onclick=\"".concat(onclickAttr, "\" style=\"flex:1;min-width:110px;cursor:pointer;background:#fff;border:1.5px solid ").concat(color, ";border-radius:10px;padding:10px 16px;font-size:12px;color:#3D1F0D;text-align:center\"><div style=\"font-weight:900;font-size:18px\">").concat(val, "</div><div style=\"color:#8A6A4E\">").concat(label, "</div></div>");
    resumenEl.innerHTML = chip('Clientes en el programa', totalClientes, '#F5E6C8', "filtrarFidelizacionPorTipo('todos')")
      + chip('Con premio pendiente', conPremio, '#D9A441', "filtrarFidelizacionPorTipo('premio')")
      + chip('Premios canjeados', totalCanjes, '#F5E6C8', "mostrarFidelizacionCanjes()")
      + (totalSospechosos > 0 ? chip('🚨 Ritmo sospechoso', totalSospechosos, '#c0392b', "filtrarFidelizacionPorTipo('sospechoso')") : '')
      + (totalNoCuadran > 0 ? chip('🔍 Números que no cuadran', totalNoCuadran, '#8e44ad', "filtrarFidelizacionPorTipo('noCuadra')") : '')
      + (totalTopePremios > 0 ? chip('📦 Muchos premios sin canjear', totalTopePremios, '#c0392b', "filtrarFidelizacionPorTipo('topePremios')") : '')
      + (totalNombresDistintos > 0 ? chip('👥 Varios nombres, mismo tel.', totalNombresDistintos, '#c0392b', "filtrarFidelizacionPorTipo('nombresDistintos')") : '');
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
    const tienePremiosDeSobra = c.premiosPendientes >= FIDELIZACION_TOPE_PREMIOS_PENDIENTES;
    const tieneNombresDistintos = c.historialNombres.length >= FIDELIZACION_TOPE_NOMBRES_DISTINTOS;
    const conAviso = c.sospechoso || c.noCuadra || tienePremiosDeSobra || tieneNombresDistintos;
    const bg = conAviso ? '#FDEDEC' : (destacado ? '#FFF3CD' : '#fff');
    const border = conAviso ? '#c0392b' : (destacado ? '#D9A441' : '#F5E6C8');
    const sellosTexto = c.sellos + '/' + FIDELIZACION_META_ADMIN;
    const premioTexto = destacado
      ? '🎁 ' + c.premiosPendientes + (c.premiosPendientes > 1 ? ' premios pendientes' : ' premio pendiente')
      : (c.sellos === FIDELIZACION_META_ADMIN - 1 ? '🎉 1 sello para el premio' : '');
    const vecesTexto = c.vecesCompletado > 0 ? ' · 🏅 ha completado el ciclo ' + c.vecesCompletado + (c.vecesCompletado > 1 ? ' veces' : ' vez') : '';
    const sospechosoTexto = c.sospechoso ? ' · 🚨 ritmo sospechoso (sellos muy seguidos)' : '';
    const noCuadraTexto = c.noCuadra ? ' · 🔍 números que no cuadran' : '';
    const topePremiosTexto = tienePremiosDeSobra ? ' · 📦 muchos premios sin canjear' : '';
    const nombresDistintosTexto = tieneNombresDistintos ? ' · 👥 ' + c.historialNombres.length + ' nombres distintos' : '';
    const nombreMostrar = escapeHtml(c.nombre || 'Sin nombre');
    const telMostrar = escapeHtml(c.telefono);
    // escapeHtml no basta dentro de un onclick="fn('...')": el navegador
    // decodifica las entidades HTML (incluida &#39;) ANTES de ejecutar el
    // JS del atributo, así que una comilla simple sobrevivía y rompía la
    // llamada — escapeAttr la escapa también para el propio string de JS.
    const telAttr = escapeAttr(c.telefono);
    let h = '<div style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    // Tocar el nombre/sellos del cliente despliega directamente sus canjes Y
    // sus pedidos (fecha + número) — antes había que abrir el detalle y
    // encima pulsar otro botón aparte para ver los pedidos, dos pasos para
    // algo que se usa sobre todo para comprobar ritmos sospechosos.
    h += '<div onclick="toggleFidelizacionDetalle(\'' + telAttr + '\')" style="cursor:pointer;flex:1;min-width:160px">';
    h += '<div style="font-weight:700;color:#3D1F0D;font-size:14px">' + nombreMostrar + ' <span style="color:#8A6A4E;font-weight:500">(' + telMostrar + ')</span></div>';
    h += '<div style="font-size:13px;color:#5a3e1b;margin-top:2px">' + sellosTexto + ' sellos' + (premioTexto ? ' · ' + premioTexto : '') + vecesTexto + sospechosoTexto + noCuadraTexto + topePremiosTexto + nombresDistintosTexto + '</div>';
    h += '<div style="font-size:11px;color:#8A6A4E;margin-top:2px">👇 Toca para ver sus pedidos y canjes</div>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">';
    h += '<button onclick="event.stopPropagation();sumarSelloFidelizacionRapido(\'' + telAttr + '\')" style="padding:7px 12px;background:#fff;color:#3D1F0D;border:1.5px solid #3D1F0D;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">➕ Sello</button>';
    if (destacado) {
      h += '<button onclick="event.stopPropagation();entregarPremioFidelizacionRapido(\'' + telAttr + '\')" style="padding:7px 12px;background:#D9A441;color:#3D1F0D;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🎁 Entregar premio</button>';
    }
    if (c.sospechoso) {
      h += '<button onclick="event.stopPropagation();marcarRitmoRevisado(\'' + telAttr + '\')" style="padding:7px 12px;background:#fff;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Ya lo revisé</button>';
    }
    h += '<button onclick="event.stopPropagation();abrirFidelizacionAjustesModal(\'' + telAttr + '\')" style="padding:7px 14px;background:#3D1F0D;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">⚙️ Ajustes</button>';
    h += '</div>';
    h += '</div>';
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
  h += '<div id="fidel-pedidos-' + telefono + '" style="margin-top:8px"></div>';
  h += '<button onclick="borrarClienteFidelizacion(\'' + telAttr + '\')" style="margin-top:10px;padding:6px 14px;background:#fff;border:1.5px solid #c0392b;color:#c0392b;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑️ Eliminar del programa</button>';
  el.innerHTML = h;
  // Se cargan solos al desplegar, sin necesitar un botón aparte — para
  // comprobar rápido si un ritmo de sellos "sospechoso" se corresponde con
  // pedidos reales o no.
  cargarPedidosClienteFidelizacion(telefono);
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
      // El incremento de premiosPendientes vivía FUERA de este if, así que
      // se ejecutaba siempre — si la lista en pantalla estaba
      // desactualizada (otro admin ya había anulado/tocado este mismo
      // canje, o el índice ya no era válido contra el dato más fresco de
      // dentro de la transacción), anular una tarjeta obsoleta no borraba
      // nada del historial pero SÍ regalaba un premio pendiente de más.
      if (Array.isArray(c.historialCanjes) && c.historialCanjes[indice]) {
        c.historialCanjes.splice(indice, 1);
        c.premiosPendientes = (typeof c.premiosPendientes === 'number' ? c.premiosPendientes : 0) + 1;
      }
      return c;
    };
    if (window.fb_transactJsonString) {
      await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
    } else {
      await window.fb_saveFidelizacionCliente(telefono, mutator(cliente));
    }
    renderFidelizacionList();
  } catch (e) {
    alert(_fidelizacionAvisoError('anular el canje', e));
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
    alert(_fidelizacionAvisoError('eliminar el cliente', e));
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
// Escritura compartida por el formulario de la pestaña "Editar manualmente"
// y por el modal de ajustes rápidos (⚙️) de cada tarjeta — los dos ajustan
// los mismos 4 campos (nombre/sellos/premiosPendientes/vecesCompletado) de
// la misma forma, así que viven en un único sitio para que no se
// desincronicen si mañana hay que cambiar algo de esta lógica.
// Transacción: nombre/sellos/premiosPendientes/vecesCompletado son lo que
// el admin ha editado a propósito en el formulario, pero historialCanjes/
// historialSellos deben venir siempre de lo último de verdad en Firebase
// (no de una lectura que pudo quedarse desfasada mientras el admin
// rellenaba el formulario) — si no, un sello o canje real de ese cliente
// llegado justo en medio se perdía sin aviso al guardar.
async function _guardarFidelizacionValores(telefono, nombre, sellos, premiosPendientes, vecesCompletado) {
  const mutator = function (current) {
    const existente = current || {};
    return {
      nombre: nombre || existente.nombre || '',
      sellos,
      premiosPendientes,
      vecesCompletado,
      historialCanjes: existente.historialCanjes || [],
      historialSellos: existente.historialSellos || [],
      // No pisar esto al editar a mano — si no, se borraba en silencio el
      // "ya lo revisé" de ritmo sospechoso y el historial de nombres
      // distintos usados con este teléfono.
      sospechosoRevisadoHastaTs: existente.sospechosoRevisadoHastaTs,
      historialNombres: existente.historialNombres || []
    };
  };
  if (window.fb_transactJsonString) {
    await window.fb_transactJsonString('fidelizacion/' + telefono, mutator);
  } else {
    let existente = null;
    try { existente = await window.fb_loadFidelizacionCliente(telefono); } catch (e) {}
    await window.fb_saveFidelizacionCliente(telefono, mutator(existente));
  }
}
function _leerValoresFormularioFidelizacion(prefijo) {
  const telefono = document.getElementById(prefijo + '-phone').value.replace(/\D/g, '');
  const nombre = document.getElementById(prefijo + '-nombre').value.trim();
  let sellos = parseInt(document.getElementById(prefijo + '-sellos').value, 10);
  if (isNaN(sellos) || sellos < 0) sellos = 0;
  if (sellos >= FIDELIZACION_META_ADMIN) sellos = FIDELIZACION_META_ADMIN - 1;
  let premiosPendientes = parseInt(document.getElementById(prefijo + '-premios-pendientes').value, 10);
  if (isNaN(premiosPendientes) || premiosPendientes < 0) premiosPendientes = 0;
  let vecesCompletado = parseInt(document.getElementById(prefijo + '-veces-completado').value, 10);
  if (isNaN(vecesCompletado) || vecesCompletado < 0) vecesCompletado = 0;
  return { telefono, nombre, sellos, premiosPendientes, vecesCompletado };
}
async function guardarFidelizacionManual() {
  const v = _leerValoresFormularioFidelizacion('fidel-edit');
  if (v.telefono.length !== 9) {
    alert('Introduce un teléfono válido de 9 dígitos.');
    return;
  }
  await _guardarFidelizacionValores(v.telefono, v.nombre, v.sellos, v.premiosPendientes, v.vecesCompletado);
  showToast('fidel-toast');
  renderFidelizacionList();
}

// ── MODAL DE AJUSTES RÁPIDOS (⚙️ desde cada tarjeta de la lista) ──
// Mismo formulario que "Editar manualmente", pero como ventana emergente
// sobre la propia lista, ya rellena con los datos del cliente — para
// corregir algo puntual (o simplemente comprobar qué hay guardado de
// verdad, como "veces completado", sin confundirlo con un fallo) sin
// perder de vista la lista ni tener que volver a escribir el teléfono.
function abrirFidelizacionAjustesModal(telefono) {
  const cliente = (_fidelizacionDataCache && _fidelizacionDataCache[telefono]) || null;
  document.getElementById('fidel-ajustes-phone').value = telefono;
  document.getElementById('fidel-ajustes-nombre').value = (cliente && cliente.nombre) || '';
  document.getElementById('fidel-ajustes-sellos').value = (cliente && typeof cliente.sellos === 'number') ? cliente.sellos : 0;
  document.getElementById('fidel-ajustes-premios-pendientes').value = (cliente && typeof cliente.premiosPendientes === 'number') ? cliente.premiosPendientes : ((cliente && cliente.premioDisponible) ? 1 : 0);
  document.getElementById('fidel-ajustes-veces-completado').value = (cliente && typeof cliente.vecesCompletado === 'number') ? cliente.vecesCompletado : 0;
  const infoEl = document.getElementById('fidel-ajustes-cliente-info');
  if (infoEl) infoEl.textContent = ((cliente && cliente.nombre) ? cliente.nombre + ' — ' : '') + telefono;
  const modal = document.getElementById('fidel-ajustes-modal');
  if (modal) modal.style.display = 'flex';
}
function cerrarFidelizacionAjustesModal() {
  const modal = document.getElementById('fidel-ajustes-modal');
  if (modal) modal.style.display = 'none';
}
async function guardarFidelizacionAjustesModal() {
  const v = _leerValoresFormularioFidelizacion('fidel-ajustes');
  if (v.telefono.length !== 9) {
    alert('Teléfono inválido — ciérralo y ábrelo de nuevo desde la tarjeta del cliente.');
    return;
  }
  await _guardarFidelizacionValores(v.telefono, v.nombre, v.sellos, v.premiosPendientes, v.vecesCompletado);
  cerrarFidelizacionAjustesModal();
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

// recordOrderStats vive en nucleo-compartido.js (bundle de cliente) — es la
// función que registra cada pedido nuevo, se llama desde antifraude.js al
// confirmar el checkout de cualquier visitante, no solo de admin.
// El arranque de scheduleSlotMidnightReset() también se movió allí.


// ── STOCK SYSTEM ──
// STOCK_DATA_KEY vive en nucleo-compartido.js (bundle de cliente) — init.js
// cachea el listener de stock en tiempo real para cualquier visitante nada
// más cargar, aunque solo lo USE el panel de admin.
const STOCK_PWD_KEY = 'dpf_stock_pwd';
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
function getStockData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STOCK_DATA_KEY) || 'null');
    if (saved) {
      // Base de partida para saveStockData() hasta que llegue el primer
      // dato real del listener de Firebase (ver init.js) — mejor que nada
      // si se edita justo al abrir la página, antes de que dé tiempo a
      // sincronizar.
      if (!window._stockDataSyncedSnapshot) window._stockDataSyncedSnapshot = saved;
      return saved;
    }
  } catch {}
  // First time: preload defaults
  const data = JSON.parse(JSON.stringify(STOCK_DEFAULTS));
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  return data;
}
// Antes esto sobreescribía TODO config/stockData con la copia local
// completa (fb_saveStockData = un set() sin más). Si dos empleados editaban
// categorías distintas en tablets distintas casi a la vez, el que guardaba
// último borraba en silencio los cambios del otro (cada guardado partía de
// su propia copia local, que podía ya estar desactualizada). Ahora usa una
// transacción real de Firebase: si el servidor tiene algo más reciente que
// lo que este dispositivo tenía sincronizado, se combinan los dos cambios
// grupo a grupo en vez de que uno pise al otro entero — solo se sobreescribe
// de verdad el/los grupo(s) que este dispositivo tocó.
function saveStockData(data) {
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  if (window.fb_transactJsonString) {
    window._stockDataLocalWrite = Date.now();
    const _antesDeEsteGuardado = window._stockDataSyncedSnapshot || {};
    window.fb_transactJsonString('config/stockData', function (remoto) {
      const base = remoto || {};
      const grupos = new Set([...Object.keys(base), ...Object.keys(data)]);
      const merged = {};
      grupos.forEach(function (g) {
        const tocadoAqui = JSON.stringify(data[g] || null) !== JSON.stringify(_antesDeEsteGuardado[g] || null);
        merged[g] = tocadoAqui ? data[g] : base[g] !== undefined ? base[g] : data[g];
      });
      return merged;
    }).then(function (finalData) {
      if (finalData) {
        window._stockDataSyncedSnapshot = finalData;
        // Si el resultado final (combinado) trae algo de otro dispositivo
        // que este todavía no tenía, refrescar también la copia local.
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(finalData));
      }
    }).catch(function (e) { console.warn('[stock] fallo al guardar en Firebase:', e); });
  } else if (window.fb_saveStockData) {
    window._stockDataLocalWrite = Date.now();
    window.fb_saveStockData(data).catch(() => {});
  }
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
    return "\n    <div style=\"margin-bottom:18px\">\n      <div style=\"font-size:13px;font-weight:700;color:#3D1F0D;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #F5E6C8\">".concat(STOCK_GROUP_LABELS[group] || group, "</div>\n      <div id=\"stock-drag-group-").concat(group, "\" data-group=\"").concat(group, "\" style=\"display:flex;flex-direction:column\">\n        ").concat(items.map((ing, i) => "\n          <div draggable=\"true\" data-group=\"".concat(group, "\" data-index=\"").concat(i, "\"\n               style=\"display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:8px;padding:7px 12px;cursor:grab\"\n               ondragstart=\"stockDragStart(event)\" ondragover=\"stockDragOver(event)\" ondrop=\"stockDrop(event)\" ondragend=\"stockDragEnd(event)\">\n            <span style=\"color:#8A6A4E;font-size:16px;cursor:grab;user-select:none\">\u2630</span>\n            <span style=\"font-size:14px;color:#2A1506;flex:1\">").concat(ing, "</span>\n            <button onclick=\"removeStockItem('").concat(group, "',").concat(i, ")\" style=\"background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer;font-weight:700\">&#128465;</button>\n          </div>")).join(''), "\n      </div>\n    </div>");
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
  const data = getStockData();
  const arr = data[srcGroup];
  const _arr$splice = arr.splice(srcIdx, 1),
    _arr$splice2 = _slicedToArray(_arr$splice, 1),
    moved = _arr$splice2[0];
  arr.splice(dstIdx, 0, moved);
  saveStockData(data);
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
    const data = getStockData();
    const arr = data[group];
    const _arr$splice3 = arr.splice(srcIdx, 1),
      _arr$splice4 = _slicedToArray(_arr$splice3, 1),
      moved = _arr$splice4[0];
    arr.splice(targetIdx, 0, moved);
    saveStockData(data);
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
  if (!data[group]) data[group] = [];
  if (data[group].includes(name)) {
    alert('Ya existe en ese grupo');
    return;
  }
  data[group].push(name);
  saveStockData(data);
  input.value = '';
  loadStockAdminList();
  showToast('stock-config-toast');
}
function removeStockItem(group, i) {
  const data = getStockData();
  if (!data[group]) return;
  data[group].splice(i, 1);
  saveStockData(data);
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
  if (!data[group]) data[group] = [];
  if (data[group].includes(name)) {
    alert('Ya existe en esa categoría');
    return;
  }
  data[group].push(name);
  saveStockData(data);
  document.getElementById('stock-edit-name').value = '';
  renderStockItems();
}
function stockOverlayRemoveItem(group, ing) {
  if (!confirm('¿Eliminar "' + ing + '"?')) return;
  const data = getStockData();
  data[group] = data[group].filter(i => i !== ing);
  saveStockData(data);
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
  const data = getStockData();
  const arr = data[srcGroup];
  const srcIdx = arr.indexOf(srcIng);
  const dstIdx = arr.indexOf(dstIng);
  if (srcIdx === -1 || dstIdx === -1) return;
  arr.splice(srcIdx, 1);
  arr.splice(dstIdx, 0, srcIng);
  saveStockData(data);
  renderStockItems();
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
  if (window._stockFromBimba) {
    window._stockFromBimba = false;
    if (typeof bimbaVolverAlPanel === 'function') bimbaVolverAlPanel();
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
        return '<div draggable="true" data-group="' + group + '" data-ing="' + ing.replace(/"/g, '&quot;') + '"' + ' style="display:flex;align-items:center;background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:6px;cursor:grab"' + ' ondragstart="stockOverlayDragStart(event)" ondragover="stockOverlayDragOver(event)" ondrop="stockOverlayDrop(event)" ondragend="stockOverlayDragEnd(event)">' + '<span style="color:#8A6A4E;font-size:18px;user-select:none">☰</span>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + ing + '</span>' + '<button onclick="stockOverlayRemoveItem(\'' + group + '\',\'' + ing.replace(/'/g, "\\'") + '\')" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer">✕</button>' + '</div>';
      }
      const i = Object.values(window._stockItemIndex).indexOf(ing);
      if (isExtras) {
        const eid = 'extra_' + ing.replace(/[^a-z0-9]/gi, '_');
        return '<div style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:10px 14px;margin-bottom:8px">' + '<div style="font-size:14px;font-weight:600;color:#3D1F0D;margin-bottom:6px">' + ing + '</div>' + '<textarea id="' + eid + '" placeholder="Escribe aqu\u00ED..." rows="2" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 10px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;resize:none;box-sizing:border-box"></textarea>' + '</div>';
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
        return '<div style="background:' + bgL + ';border:2px solid ' + borderL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + ing + '</span>' + '<div style="display:flex;flex-shrink:0">' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',1)" style="' + btnHay + '">✅</button>' + '<button onclick="stockLimpiezaSet(\'' + safeIngL + '\',-1)" style="' + btnNo + '">❌</button>' + '</div></div></div>';
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
        return '<div style="background:' + bgTL + ';border:2px solid ' + borderTL + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center">' + '<button onclick="stockCheckToggle(\'' + safeIngTL + '\')" style="width:36px;height:36px;flex-shrink:0;border-radius:50%;border:2px solid ' + btnBorderTL + ';background:' + btnBgTL + ';font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">' + (checked ? '\u2705' : '') + '</button>' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + (STOCK_DISPLAY_LABEL[ing] || ing) + '</span>' + '</div>' + (checked ? '<div style="margin-top:10px;display:flex;flex-direction:column">' + (STOCK_CHECK_MEDIO.has(ing) ? '<button onclick="stockNotaSetMedio(\'' + safeIngTL + '\')" style="align-self:flex-start;padding:5px 12px;border-radius:7px;border:1.5px solid #3D1F0D;background:' + (nota === '\u00bd paquete' ? 'rgba(244,196,48,0.08)' : '#FFFFFF') + ';color:' + (nota === '\u00bd paquete' ? '#3D1F0D' : '#8A6A4E') + ';font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">\u00bd paquete</button>' : '') + '<input type="text" id="' + notaId + '" value="' + nota.replace(/"/g, '&quot;') + '" placeholder="Nota opcional\u2026" oninput="stockNotaChange(\'' + safeIngTL + '\',this.value)" style="width:100%;border:1.5px solid #F5E6C8;border-radius:8px;padding:8px 12px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:#2A1506;background:#FFF8EE;outline:none;box-sizing:border-box">' + '</div>' : '') + '</div>';
      }

      // ── BOTE (cremas) ──
      if (STOCK_BOTE.has(ing)) {
        const boteVal = _stockSelections[ing] || 0;
        const safeIngB = ing.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const bgB = boteVal > 0 ? 'rgba(244,196,48,0.08)' : '#FFFFFF';
        const borderB = boteVal > 0 ? '#3D1F0D' : '#F5E6C8';
        const boteStr = boteVal > 0 ? boteVal % 1 === 0.5 ? Math.floor(boteVal) > 0 ? Math.floor(boteVal) + '\u00bd' : '\u00bd' : boteVal : '\u2013';
        return '<div style="background:' + bgB + ';border:2px solid ' + borderB + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1">' + ing + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockSetBote(\'' + safeIngB + '\',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + '<button onclick="stockBoteMedio(\'' + safeIngB + '\')" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:13px;font-weight:900;cursor:pointer;color:#3D1F0D">\u00bd</button>' + '<span style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center">' + boteStr + '</span>' + '<button onclick="stockSetBote(\'' + safeIngB + '\',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="margin-top:8px"><span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">Bote</span></div>' + '</div>';
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
      return '<div style="background:' + bg + ';border:2px solid ' + border + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">' + '<div style="display:flex;align-items:center;justify-content:space-between">' + '<span onclick="stockToggle(' + i + ')" style="font-size:15px;font-weight:600;color:#3D1F0D;flex:1;cursor:pointer">' + ing + '</span>' + '<div style="display:flex;align-items:center;flex-shrink:0">' + '<button onclick="stockQty(' + i + ',-1)" style="width:38px;height:38px;border-radius:50%;border:2px solid #3D1F0D;background:#FFFFFF;font-size:22px;font-weight:700;cursor:pointer;color:#3D1F0D">&#x2212;</button>' + medioBtn + '<span id="' + qtyId + '" onclick="stockActivateInput(' + i + ')" title="Pulsa para escribir" style="font-size:20px;font-weight:900;color:#3D1F0D;min-width:32px;text-align:center;cursor:text;border-radius:6px;padding:2px 4px' + (qty > 0 ? ';background:rgba(0,0,0,0.05)' : '') + '">' + (qty !== null ? qty : '\u2013') + '</span>' + '<button onclick="stockQty(' + i + ',1)" style="width:38px;height:38px;border-radius:50%;border:none;background:#3D1F0D;font-size:22px;font-weight:700;cursor:pointer;color:#F4C430">+</button>' + '</div></div>' + '<div style="display:flex;margin-top:8px;align-items:center">' + (fixedUnit ? '<span style="padding:3px 10px;border-radius:6px;border:1.5px solid #3D1F0D;background:rgba(61,31,13,0.08);color:#3D1F0D;font-size:11px;font-weight:700;font-family:\'DM Sans\',sans-serif">' + fixedUnit.charAt(0).toUpperCase() + fixedUnit.slice(1) + '</span>' : '<button onclick="stockSetUnit(\'' + safeIng + '\',\'cajas\')" style="' + unitCajas + '">📦 Cajas</button>' + '<button onclick="stockSetUnit(\'' + safeIng + '\',\'unidades\')" style="' + unitUds + '">🔢 Unidades</button>') + '</div></div>';
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
    // Antes ponía 0 en el primer toque de "+" — visualmente cambiaba de
    // "–" a "0", pero al no ser >0 quedaba fuera del listado de reposición
    // y de WhatsApp (que filtran >0), así que hacía falta pulsar dos veces.
    // stockSetBote (abajo) ya hacía bien esto: primer toque = 1.
    if (delta > 0) { _stockSelections[ing] = delta; }
    renderStockItems();
    return;
  }
  const next = current + delta;
  if (next < 0) { delete _stockSelections[ing]; } else { _stockSelections[ing] = next; }
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
// Antes esto subía siempre el array LOCAL completo con un set() plano
// (fb_saveStockHistorial) — si dos tablets guardaban una reposición casi a
// la vez, el segundo guardado sobreescribía en Firebase la lista que
// acababa de subir el primero, perdiéndola entera (mismo patrón ya
// arreglado para stockData). Ahora se usa una transacción real que AÑADE
// esta entrada a la lista más fresca del servidor, en vez de sobreescribir
// con la copia local — stock/historial guarda el array nativo de Firebase
// (no como JSON-string), así que toca fb_transactNative, no
// fb_transactJsonString.
// Tope de listas guardadas — antes esto crecía para siempre (solo un
// botón manual de "Borrar listas antiguas" que hay que acordarse de
// pulsar), agravando con el tiempo el riesgo de la transacción de arriba
// (payload cada vez más grande que volver a subir). Se queda con las 100
// más recientes automáticamente; el botón manual sigue ahí para limpiar
// antes si se quiere.
const STOCK_HISTORIAL_MAX = 100;
function saveToStockHistorial(ts, lines) {
  const entrada = { ts, lines };
  if (window.fb_transactNative) {
    window._stockLocalWrite = Date.now();
    window.fb_transactNative('stock/historial', function (remoto) {
      const arr = Array.isArray(remoto) ? remoto.slice() : getStockHistorial();
      arr.push(entrada);
      return arr.length > STOCK_HISTORIAL_MAX ? arr.slice(arr.length - STOCK_HISTORIAL_MAX) : arr;
    }).then(function (finalArr) {
      localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(Array.isArray(finalArr) ? finalArr : [entrada]));
    }).catch(function (e) {
      console.warn('Firebase stock historial error:', e);
      const hist = getStockHistorial();
      hist.push(entrada);
      localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(hist));
    });
    return;
  }
  const hist = getStockHistorial();
  hist.push(entrada);
  localStorage.setItem(STOCK_HISTORIAL_KEY, JSON.stringify(hist));
  // 🔥 Subir a Firebase — reintenta si aún no está listo
  function subirAFirebase(intentos) {
    if (window.fb_saveStockHistorial) {
      window._stockLocalWrite = Date.now();
      window.fb_saveStockHistorial(hist).catch(e => console.warn('Firebase stock historial error:', e));
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
  html += '<div style="background:rgba(244,196,48,0.08);border:2px solid #3D1F0D;border-radius:12px;padding:14px;margin-bottom:12px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' + '<span style="font-size:13px;font-weight:700;color:#3D1F0D">&#x1F4CC; Última lista — ' + latest.ts + '</span>' + '<button onclick="deleteStockHistorialEntry(' + (hist.length - 1) + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + latest.lines.map(l => '<div style="font-size:13px;color:#2A1506">&#x2022; ' + l + '</div>').join('') + '</div>';

  // Older entries in a collapsible folder
  if (older.length) {
    html += '<details style="background:#FFFFFF;border:1.5px solid #F5E6C8;border-radius:12px;padding:12px;margin-bottom:8px">' + '<summary style="font-size:13px;font-weight:700;color:#3D1F0D;cursor:pointer">&#x1F4C2; Listas anteriores (' + older.length + ')</summary>' + '<div style="margin-top:12px;display:flex;flex-direction:column">' + older.map((entry, i) => '<div style="background:#FFF8EE;border:1px solid #F5E6C8;border-radius:8px;padding:10px">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' + '<span style="font-size:12px;font-weight:600;color:#8A6A4E">' + entry.ts + '</span>' + '<button onclick="deleteStockHistorialEntry(' + i + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:2px 7px;font-size:11px;cursor:pointer">&#128465;</button>' + '</div>' + entry.lines.map(l => '<div style="font-size:12px;color:#2A1506">&#x2022; ' + l + '</div>').join('') + '</div>').join('') + '</div></details>';
  }
  el.innerHTML = html;
}
function exportStockPDF() {
  const lines = window._lastStockLines || [];
  const ts = window._lastStockTs || '';
  if (!lines.length) return;
  const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n  <style>\n    body { font-family: Arial, sans-serif; padding: 30px; color: #2A1506; }\n    h2 { color: #3D1F0D; margin-bottom: 4px; }\n    p.ts { font-size: 12px; color: #8A6A4E; margin-bottom: 20px; }\n    ul { list-style: none; padding: 0; }\n    li { padding: 6px 0; border-bottom: 1px solid #F5E6C8; font-size: 14px; }\n    li:before { content: \"\u2022 \"; color: #3D1F0D; font-weight: bold; }\n  </style></head><body>\n  <h2>\uD83D\uDCE6 Lista de reposici\xF3n</h2>\n  <p class=\"ts\">".concat(ts, "</p>\n  <ul>").concat(lines.map(l => '<li>' + l + '</li>').join(''), "</ul>\n  </body></html>");
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
    linesEl.innerHTML = lines.map(l => '<div style="padding:2px 0">\u2022 ' + l + '</div>').join('') || '<p style="color:#8A6A4E;font-size:13px">Lista vac\u00EDa.</p>';
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
  let stats;
  if (window.fb_getStats) {
    try {
      const fb = await window.fb_getStats(todayKey);
      if (fb) stats = fb;
    } catch (e) {}
  }
  if (!stats) {
    try {
      stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    } catch {
      stats = {};
    }
  }
  if (!stats || !stats.orders) {
    loadLiveOrders();
    return;
  }
  const order = stats.orders.find(o => o.num === orderNum);
  if (!order) {
    loadLiveOrders();
    return;
  }
  const oldTotal = order.total;
  stats.total = parseFloat((stats.total - oldTotal + newTotal).toFixed(2));
  order.total = newTotal;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try {
      await window.fb_saveStats(stats);
    } catch (e) {
      console.warn('Firebase stats error', e);
    }
  }
  logActivity('\u270f\ufe0f Precio editado: pedido ' + orderNum + ' \u2014 ' + oldTotal.toFixed(2) + ' \u20ac \u2192 ' + newTotal.toFixed(2) + ' \u20ac');
  loadLiveOrders();
  if ((_document$getElementB30 = document.getElementById('admin-stats')) !== null && _document$getElementB30 !== void 0 && _document$getElementB30.classList.contains('active')) loadDayStats();
}


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
    // Fecha de Madrid, no la UTC del navegador del admin — cerca de la
    // medianoche podían no coincidir (mismo tipo de bug ya corregido en
    // otros sitios de esta web), mostrando "0 jugadas hoy" con giros
    // reales ya guardados, o al revés. Solo afecta a lo que se MUESTRA
    // aquí — el tope real de juegos por cliente lo sigue aplicando
    // juegos.php en el servidor.
    const todayKey = _todayKeyMadrid();
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
  try {
    if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa, premios, topeDiario });
    logActivity('🎡 Configuración de la ruleta actualizada (' + premios.length + ' premios' + (topeDiario ? ', tope ' + topeDiario + '/día' : '') + ')');
    showToast('ruleta-config-toast');
  } catch (e) {
    // Antes esto no tenía try/catch y los errores globales de JS están
    // desactivados a propósito en esta web, así que un fallo de guardado
    // no mostraba ningún aviso — el admin no se enteraba de que Firebase
    // seguía con la configuración vieja.
    _avisarSiFalloGuardado(e, 'configuración de la ruleta');
  }
}
async function ruletaAdminToggleActiva(checked) {
  _actualizarTrack('ruleta-admin-toggle-track', checked);
  const premios = _ruletaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  try {
    if (window.fb_saveRuletaConfig) await window.fb_saveRuletaConfig({ activa: checked, premios, topeDiario: _ruletaTopeActual() });
    logActivity(checked ? '🎡 Ruleta activada' : '🎡 Ruleta desactivada');
  } catch (e) {
    // Deshacer lo que ya se había pintado ANTES de saber si el guardado
    // iba a funcionar (el <input> ya había cambiado de estado por sí
    // solo, y _actualizarTrack pintó el color nuevo) — si no, el admin
    // podía estar mirando "Ruleta activada" en verde mientras Firebase
    // seguía con la configuración vieja, sin ningún aviso.
    const checkbox = document.getElementById('ruleta-admin-activa');
    if (checkbox) checkbox.checked = !checked;
    _actualizarTrack('ruleta-admin-toggle-track', !checked);
    _avisarSiFalloGuardado(e, 'estado de la ruleta');
  }
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
    // Ver el comentario equivalente en renderRuletaAdmin() más arriba.
    const todayKey = _todayKeyMadrid();
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
  try {
    if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa, premios, topeDiario });
    logActivity('🎫 Configuración del rasca actualizada (' + premios.length + ' premios' + (topeDiario ? ', tope ' + topeDiario + '/día' : '') + ')');
    showToast('rasca-config-toast');
  } catch (e) {
    // Ver el comentario equivalente en ruletaAdminGuardar() más arriba.
    _avisarSiFalloGuardado(e, 'configuración del rasca');
  }
}
async function rascaAdminToggleActiva(checked) {
  _actualizarTrack('rasca-admin-toggle-track', checked);
  const premios = _rascaAdminPremios.filter(p => p.nombre && p.nombre.trim());
  try {
    if (window.fb_saveRascaConfig) await window.fb_saveRascaConfig({ activa: checked, premios, topeDiario: _rascaTopeActual() });
    logActivity(checked ? '🎫 Rasca y gana activado' : '🎫 Rasca y gana desactivado');
  } catch (e) {
    // Ver el comentario equivalente en ruletaAdminToggleActiva() más arriba.
    const checkbox = document.getElementById('rasca-admin-activa');
    if (checkbox) checkbox.checked = !checked;
    _actualizarTrack('rasca-admin-toggle-track', !checked);
    _avisarSiFalloGuardado(e, 'estado del rasca');
  }
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

// El panel que se acaba de abrir se rellena de forma asíncrona (lectura a
// Firebase) — con una red lenta, el elemento buscado podía no existir
// todavía cuando pasaba el "delay" fijo de antes, y esto se quedaba
// callado sin más (el panel se abría igual, pero la fila buscada nunca se
// resaltaba ni se desplazaba a la vista). Ahora, si al primer intento no
// está, se reintenta cada 150ms hasta 3s en total antes de rendirse — de
// sobra para una lectura normal a Firebase, incluso en una red lenta.
function _buscadorScrollFlash(id, delay, _intentos) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) {
      const intentosHechos = (_intentos || 0) + 1;
      if (intentosHechos * 150 < 3000) _buscadorScrollFlash(id, 150, intentosHechos);
      return;
    }
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
    { icon: '🧾', badge: 'section', tipo: 'Sección', nombre: 'Comandas', ruta: 'Panel admin · mostrador (pestaña nueva)', meta: [], go: () => window.open('comandas.html', '_blank') },
    { icon: '📊', badge: 'section', tipo: 'Sección', nombre: 'Hoy', ruta: 'Panel admin · estadísticas', meta: [], go: () => showAdminSection('stats', tab('stats')) },
    { icon: '📅', badge: 'section', tipo: 'Sección', nombre: 'Historial', ruta: 'Panel admin', meta: [], go: () => showAdminSection('historial', tab('historial')) },
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
    { icon: '📦', badge: 'section', tipo: 'Sección', nombre: 'Stock', ruta: 'bimba · Pedidos y stock', meta: [], go: () => { if (typeof bimbaIrAStock === 'function') bimbaIrAStock(); } },
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
      // p.price puede llegar no numérico o ausente (p.ej. sincronizado
      // directo desde Firebase sin pasar por el formulario que valida) —
      // antes p.price.toFixed(2) lanzaba una excepción sin capturar aquí
      // (a diferencia del bloque de ingredientes justo abajo, que sí está
      // protegido), y como esta función se llama en cada tecla del
      // buscador, un único producto así dejaba de mostrar resultados por
      // completo, sin ningún aviso.
      const priceNum = Number(p.price);
      const priceOk = isFinite(priceNum);
      const precioTxt = priceOk ? priceNum.toFixed(2) + ' €' : 'precio no válido';
      items.push({
        icon: '🍽️', badge: 'prod', tipo: 'Producto', nombre: p.name,
        ruta: 'Carta · ' + p.cat + ' · ' + precioTxt,
        meta: [{ etiqueta: 'categoría', valor: p.cat }, { etiqueta: 'precio', valor: priceOk ? priceNum.toFixed(2) : '—' }],
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
      if (t) {
        localStorage.setItem(BIMBA_TOKEN_KEY, t);
        if (typeof loadBimbaTokenUI === 'function') loadBimbaTokenUI();
      }
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
// Empleados que necesitan un aviso: los que nunca ficharon hoy (estado
// 'nada') y los que se olvidaron de fichar la salida (estado 'olvido' —
// incluye una entrada abierta de un día anterior). El badge 🔔, "Avisar a
// todos" y la alerta de tablet recalculaban antes "quién falta por
// fichar" con un filtro simple (¿tiene entrada hoy?) que no veía el
// estado 'olvido' — sí usado ya en la lista individual
// (bimbaRenderFichajeLista) con su propio botón de WhatsApp — así que un
// empleado que fichó entrada pero lleva horas sin fichar la salida
// esperada no contaba en el badge, no recibía el aviso masivo ni
// aparecía en la alerta de tablet.
function _empSinFichar(empleados, fichajes, today) {
  return empleados.filter(function (e) {
    var r = _empEstadoActual(e, fichajes, today);
    return r.estado === 'nada' || r.estado === 'olvido';
  });
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
  var sinFichar = _empSinFichar(empleados, fichajes, today);
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
  var sinFichar = _empSinFichar(empleados, fichajes, today);
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
  var sinFichar = _empSinFichar(empleados, fichajes, today);

  var listaHtml = sinFichar.length
    ? sinFichar.map(function(e) {
        var r = _empEstadoActual(e, fichajes, today);
        var icon = r.estado === 'olvido' ? '⚠️' : '❌';
        var label = r.estado === 'olvido' ? 'Se olvidó fichar salida' : 'No ha fichado';
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff1f2;border-radius:10px;border:1.5px solid #fecdd3">' +
          '<span style="font-size:16px">' + icon + '</span>' +
          '<div><div style="font-size:14px;font-weight:600;color:#991b1b">' + e.nombre + '</div>' +
          '<div style="font-size:11px;color:#991b1b;opacity:0.75">' + label + '</div></div></div>';
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
    '<div style="font-size:14px;color:#8A6A4E;margin-bottom:1.5rem">Hay empleados pendientes de fichar</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:1.5rem">' + listaHtml + '</div>' +
    '<button onclick="var o=document.getElementById(&quot;tablet-alert-overlay&quot;);if(o)o.remove()" style="width:100%;padding:12px;background:#3D1F0D;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Entendido</button>' +
    '</div>';

  document.body.appendChild(overlay);
}
