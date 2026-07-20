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
          if (lineName === itemName || itemName.includes(lineName) || lineName.includes(itemName)) {
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
      if (lineName === itemName || itemName.includes(lineName) || lineName.includes(itemName)) {
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
      if (lineName === itemName2 || itemName2.includes(lineName) || lineName.includes(itemName2)) {
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
    if (!s.qty || s.qty <= 0 || !s.prov) return;
    if (!byProv[s.prov]) byProv[s.prov] = [];
    byProv[s.prov].push(item);
  });
  if (!Object.keys(byProv).length) return null;
  const sortedProvs = Object.keys(byProv).sort((a, b) => {
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
    const provLabel = (allProvs.find(p => p.id === provId) || {
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
    alert('No hay productos con cantidad y proveedor asignado');
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
    alert('No hay productos con cantidad y proveedor asignado');
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

