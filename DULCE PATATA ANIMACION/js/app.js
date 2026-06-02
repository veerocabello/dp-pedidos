/* ═══════════════════════════════════════════════════
   DULCE PATATA — Lógica principal
   ═══════════════════════════════════════════════════ */

/* ── MANEJADOR DE ERRORES ── */
window.onerror = function(msg, src, line, col, err) {
  var b = document.getElementById('_err_banner');
  if (!b) return;
  b.style.display = 'block';
  b.innerHTML += '<div>❌ ' + msg + '<br>📄 ' + (src||'?').split('/').pop() + ':' + line + ':' + col + (err ? '<br>🔍 ' + (err.stack||'').slice(0,200) : '') + '</div><hr>';
};
window.addEventListener('unhandledrejection', function(e) {
  var b = document.getElementById('_err_banner');
  if (!b) return;
  b.style.display = 'block';
  b.innerHTML += '<div>⚠️ Promise: ' + (e.reason||'') + '</div><hr>';
});

/* ── PEDIDOS PROVEEDORES v2 ── */
      // ── PEDIDOS PROVEEDORES v2 ──
      const PP_KEY = 'dpf_pp2';

      const PP_PROVS = [
        {id:'ali',         label:'Ali'},
        {id:'apolo',       label:'Apolo'},
        {id:'cocacola',    label:'Coca-Cola'},
        {id:'cookies',     label:'Cookies'},
        {id:'diplo',       label:'Diplo'},
        {id:'disconfa',    label:'Disconfa'},
        {id:'elpozo',      label:'El Pozo'},
        {id:'esteban',     label:'Esteban'},
        {id:'euromozza',   label:'Euromozza'},
        {id:'interbread',  label:'Interbread'},
        {id:'makro',       label:'Makro'},
        {id:'manolo',      label:'Manolo'},
        {id:'matutano',    label:'Matutano'},
        {id:'mercadona',   label:'Mercadona'},
        {id:'otro',        label:'Otro'},
        {id:'plata',       label:'Plata'},
        {id:'queseria',    label:'Quesería Fuente'},
        {id:'sandi',       label:'Sandi'},
        {id:'tgt',         label:'TGT'},
        {id:'vadis',       label:'Vadis'},
        {id:'valleaguirre',label:'Valle Aguirre'},
      ];

      const PP_ITEMS = [
        // ❄️ Congelados
        {cat:'❄️ Congelados', id:'i_kebab',       nombre:'Kebab',              qty:''},
        {cat:'❄️ Congelados', id:'i_carnepicada',  nombre:'Carne picada',       qty:''},
        {cat:'❄️ Congelados', id:'i_tronquitos',   nombre:'Tronquitos de mar',  qty:'1 caja'},
        {cat:'❄️ Congelados', id:'i_gambas',       nombre:'Gambas',             qty:'1 caja'},
        {cat:'❄️ Congelados', id:'i_york',         nombre:'York',               qty:''},
        {cat:'❄️ Congelados', id:'i_pulledpork',   nombre:'Pulled pork',        qty:'1 caja'},
        {cat:'❄️ Congelados', id:'i_bacon',        nombre:'Bacon',              qty:''},
        // 🥫 Latas / Conservas / Salsas
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_tomate',      nombre:'Tomate frito',       qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_aceitunas',   nombre:'Aceitunas',          qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_maiz',        nombre:'Maíz',               qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_zanahoria',   nombre:'Zanahoria',          qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_remolacha',   nombre:'Remolacha',          qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_champinon',   nombre:'Champiñones',        qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_pina',        nombre:'Piña',               qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_alioli',      nombre:'Alioli',             qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_mayo',        nombre:'Mayonesa',           qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_rosa',        nombre:'Salsa rosa',         qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_yogur',       nombre:'Salsa de yogur',     qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_bbq',         nombre:'Salsa barbacoa',     qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_brava',       nombre:'Salsa brava',        qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_ketchup',     nombre:'Salsa ketchup',      qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_roquefort',   nombre:'Salsa roquefort',    qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_mielmostaza', nombre:'Salsa miel mostaza', qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'i_cebolla',     nombre:'Cebolla crujiente',  qty:''},
        {cat:'🥫 Latas / Conservas / Salsas', id:'s_natavegcrem', nombre:'Nata Vegecrem',      qty:''},
        // 📦 Estantería (Almacén)
        {cat:'📦 Estantería (Almacén)', id:'i_atun',        nombre:'Atún',               qty:''},
        {cat:'📦 Estantería (Almacén)', id:'p_pistacho',    nombre:'Crema de pistacho',  qty:''},
        {cat:'📦 Estantería (Almacén)', id:'p_kinder',      nombre:'Crema Kinder',       qty:''},
        {cat:'📦 Estantería (Almacén)', id:'p_lotus',       nombre:'Crema Lotus',        qty:''},
        // 🧊 Frío
        {cat:'🧊 Frío', id:'s_philtartas',  nombre:'Philadelphia tarta',  qty:''},
        {cat:'🧊 Frío', id:'s_philpapas',   nombre:'Philadelphia patatas', qty:''},
        {cat:'🧊 Frío', id:'p_mantequilla', nombre:'Mantequilla',          qty:''},
        {cat:'🧊 Frío', id:'i_huevo',       nombre:'Huevo cocido',         qty:''},
        {cat:'🧊 Frío', id:'p_mascarpone',  nombre:'Queso mascarpone',     qty:''},
        {cat:'🧊 Frío', id:'i_4quesos',     nombre:'Cuatro quesos',        qty:''},
        {cat:'🧊 Frío', id:'s_rulocabra',   nombre:'Rulo de cabra',        qty:''},
        // 🎂 Estantería Tartas
        {cat:'🎂 Estantería Tartas', id:'p_lotus_gal',  nombre:'Galleta Lotus',      qty:''},
        {cat:'🎂 Estantería Tartas', id:'p_dino',       nombre:'Galleta Dino',       qty:''},
        {cat:'🎂 Estantería Tartas', id:'p_mariagal',   nombre:'Galleta María Oro',  qty:''},
        {cat:'🎂 Estantería Tartas', id:'p_filipinos',  nombre:'Filipinos blancos',  qty:''},
        {cat:'🎂 Estantería Tartas', id:'p_donuts',     nombre:'Donuts',             qty:''},
        {cat:'🎂 Estantería Tartas', id:'p_leche',      nombre:'Leche Puleva',       qty:''},
        // 🥔 Patatas y Verdura
        {cat:'🥔 Patatas y Verdura', id:'i_patata',  nombre:'Sacos de patatas',      qty:'', unit:'sacos'},
        {cat:'🥔 Patatas y Verdura', id:'i_cebollasaco', nombre:'Sacos de cebollas', qty:'', unit:'sacos'},
        {cat:'🥔 Patatas y Verdura', id:'i_boniato', nombre:'Bolsas boniato pelado', qty:''},
        // 🍪 Masas
        {cat:'🍪 Masas', id:'p_masacookies', nombre:'Masa cookies', qty:''},
        // 🧀 Quesería
        {cat:'🧀 Quesería', id:'i_mozzarella', nombre:'Queso mozzarella', qty:''},
        // 📋 Envases / Packaging
        {cat:'📋 Envases / Packaging', id:'m_bolal',      nombre:'Bol de pollo',              qty:''},
        {cat:'📋 Envases / Packaging', id:'m_bolpequeno', nombre:'Bol pequeño boniato',       qty:''},
        {cat:'📋 Envases / Packaging', id:'m_redondel',   nombre:'Redondel tartas plateadas', qty:''},
        {cat:'📋 Envases / Packaging', id:'m_aluminio',   nombre:'Papel de aluminio',         qty:''},
        {cat:'📋 Envases / Packaging', id:'m_film',       nombre:'Papel film',                qty:''},
        {cat:'📋 Envases / Packaging', id:'m_bolsasura',  nombre:'Cajas de bolsas',           qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cajpasta12', nombre:'Caja pasta 1/2',            qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cajpasta14', nombre:'Caja pasta 1/4',            qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cajpizza',   nombre:'Caja pizza',                qty:''},
        {cat:'📋 Envases / Packaging', id:'m_termico57',  nombre:'Papel térmico 57×35 mm',    qty:''},
        {cat:'📋 Envases / Packaging', id:'m_termico80',  nombre:'Papel térmico 80 mm',       qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cucharas',   nombre:'Caja cucharas',             qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cocina',     nombre:'Rollo papel cocina / horno',qty:''},
        {cat:'📋 Envases / Packaging', id:'m_horno',      nombre:'Caja papel horno',          qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cacharrillos',nombre:'Cacharrillos salsas pequeños',qty:''},
        {cat:'📋 Envases / Packaging', id:'m_marron',     nombre:'Papeles marrones',          qty:''},
        {cat:'📋 Envases / Packaging', id:'m_cajtartas',  nombre:'Caja tartas completas',     qty:''},
        // 🍞 Pan
        {cat:'🍞 Pan', id:'p_panleña',  nombre:'Pan de leña',  qty:''},
        {cat:'🍞 Pan', id:'p_paninis',  nombre:'Paninis XXL',  qty:''},
        // 🛒 Referencias ALI
        {cat:'🛒 Referencias ALI', id:'a_aceitunasrod', nombre:'Aceitunas rodajas',        qty:''},
        {cat:'🛒 Referencias ALI', id:'a_aceite',       nombre:'Aceite de oliva virgen',   qty:''},
        {cat:'🛒 Referencias ALI', id:'a_cuajada',      nombre:'Cuajada tomates',          qty:''},
        {cat:'🛒 Referencias ALI', id:'a_sal',          nombre:'Sal',                      qty:''},
        {cat:'🛒 Referencias ALI', id:'a_azucar',       nombre:'Azúcar',                   qty:''},
        {cat:'🛒 Referencias ALI', id:'a_pimienta',     nombre:'Pimienta',                 qty:''},
        {cat:'🛒 Referencias ALI', id:'a_oregano',      nombre:'Orégano',                  qty:''},
        {cat:'🛒 Referencias ALI', id:'a_eneldo',       nombre:'Eneldo',                   qty:''},
        {cat:'🛒 Referencias ALI', id:'a_hierbas',      nombre:'Hierbas provenzales',      qty:''},
        {cat:'🛒 Referencias ALI', id:'a_ajo',          nombre:'Ajo en polvo',             qty:''},
        {cat:'🛒 Referencias ALI', id:'a_nuez',         nombre:'Nuez moscada',             qty:''},
        {cat:'🛒 Referencias ALI', id:'a_pistachos',    nombre:'Pistachos',                qty:''},
        {cat:'🛒 Referencias ALI', id:'l_nanas',        nombre:'Nanas limpieza',           qty:''},
        {cat:'🛒 Referencias ALI', id:'l_guantesL',     nombre:'Guantes talla L',          qty:''},
        {cat:'🛒 Referencias ALI', id:'l_guantesM',     nombre:'Guantes talla M',          qty:''},
        {cat:'🛒 Referencias ALI', id:'l_fregonas',     nombre:'Fregonas',                 qty:''},
        {cat:'🛒 Referencias ALI', id:'l_cepillos',     nombre:'Cepillos',                 qty:''},
        {cat:'🛒 Referencias ALI', id:'l_recogedor',    nombre:'Recogedor',                qty:''},
        {cat:'🛒 Referencias ALI', id:'l_trapos',       nombre:'Trapos',                   qty:''},
        {cat:'🛒 Referencias ALI', id:'l_lejia',        nombre:'Lejía',                    qty:''},
        {cat:'🛒 Referencias ALI', id:'l_desengrasante',nombre:'Desengrasante',            qty:''},
        {cat:'🛒 Referencias ALI', id:'l_friegasuelos', nombre:'Friegasuelos',             qty:''},
        {cat:'🛒 Referencias ALI', id:'l_papel',        nombre:'Papel higiénico',          qty:''},
        {cat:'🛒 Referencias ALI', id:'l_estropajos',   nombre:'Estropajos',               qty:''},
        {cat:'🛒 Referencias ALI', id:'l_ambientador',  nombre:'Ambientador',              qty:''},
        {cat:'🛒 Referencias ALI', id:'l_limpiacristales',nombre:'Limpia cristales',       qty:''},
        {cat:'🛒 Referencias ALI', id:'l_servilletas',  nombre:'Servilletas',              qty:''},
        // 🍫 Chocolates y Galletas
        {cat:'🍫 Chocolates y Galletas', id:'c_chocnegro',  nombre:'Chocolate negro',       qty:''},
        {cat:'🍫 Chocolates y Galletas', id:'c_chocblanco', nombre:'Chocolate blanco',      qty:''},
        {cat:'🍫 Chocolates y Galletas', id:'c_chocleche',  nombre:'Chocolate con leche',   qty:''},
        {cat:'🍫 Chocolates y Galletas', id:'c_digestive',  nombre:'Galleta Digestive',     qty:''},
      ];

      let _ppCurrentItem = null; // kept for legacy localStorage compat

      document.addEventListener('DOMContentLoaded', () => {
        if (typeof migrateAdminPwdIfNeeded === 'function') migrateAdminPwdIfNeeded();
        else window._pendingMigrateAdmin = true;
      });
      document.addEventListener('firebaseReady', () => {
        if (typeof migrateAdminPwdIfNeeded === 'function') migrateAdminPwdIfNeeded();
      });
      const _origOpenStock = window.openStockConfigSecret;
      window.openStockConfigSecret = function() {
        if (_origOpenStock) _origOpenStock();
      };

/* ── PEDIDOS PROVEEDORES v3 ── */
      // ── PEDIDOS PROVEEDORES v3 (nuevo overlay) ──
      const PP2_KEY        = 'dpf_pedidos_prov_list';
      const PP2_CUSTOM_KEY = 'dpf_pp_custom_items';
      const PP2_HIDDEN_KEY = 'dpf_pp_hidden_items';
      const PP2_PROV_HAB_KEY  = 'dpf_pp_prov_habitual';  // {itemId: provId}
      const PP2_MIN_KEY       = 'dpf_pp_minimos';        // {itemId: number}
      const PP2_HISTORIAL_KEY = 'dpf_pp_historial';      // [{fecha, nota}]
      const PP2_CUSTOM_PROV_KEY = 'dpf_pp_custom_provs'; // [{id, label}]

      let _pp2DeleteMode   = false;
      let _pp2DeleteSel    = new Set();
      let _pp2CurrentItem  = null;
      let _pp2SearchQuery  = '';

      // ── helpers ──────────────────────────────────────────────
      function pp2LoadState()    { try { return JSON.parse(localStorage.getItem(PP2_KEY)||'{}'); } catch { return {}; } }
      function pp2SaveState(s)   { localStorage.setItem(PP2_KEY, JSON.stringify(s)); if(window.fb_savePP2) { window._pp2LocalWrite = Date.now(); window.fb_savePP2('state', s).catch(()=>{}); } }
      function pp2LoadCustom()   { try { return JSON.parse(localStorage.getItem(PP2_CUSTOM_KEY)||'[]'); } catch { return []; } }
      function pp2SaveCustom(a)  { localStorage.setItem(PP2_CUSTOM_KEY, JSON.stringify(a)); if(window.fb_savePP2) window.fb_savePP2('custom', a).catch(()=>{}); }
      function pp2LoadHidden()   { try { return JSON.parse(localStorage.getItem(PP2_HIDDEN_KEY)||'[]'); } catch { return []; } }
      function pp2SaveHidden(a)  { localStorage.setItem(PP2_HIDDEN_KEY, JSON.stringify(a)); if(window.fb_savePP2) window.fb_savePP2('hidden', a).catch(()=>{}); }
      function pp2LoadProvHab()  { try { return JSON.parse(localStorage.getItem(PP2_PROV_HAB_KEY)||'{}'); } catch { return {}; } }
      function pp2SaveProvHab(o) { localStorage.setItem(PP2_PROV_HAB_KEY, JSON.stringify(o)); if(window.fb_savePP2) window.fb_savePP2('provHab', o).catch(()=>{}); }
      function pp2LoadMinimos()  { try { return JSON.parse(localStorage.getItem(PP2_MIN_KEY)||'{}'); } catch { return {}; } }
      function pp2SaveMinimos(o) { localStorage.setItem(PP2_MIN_KEY, JSON.stringify(o)); if(window.fb_savePP2) window.fb_savePP2('minimos', o).catch(()=>{}); }
      function pp2LoadHistorial(){ try { return JSON.parse(localStorage.getItem(PP2_HISTORIAL_KEY)||'[]'); } catch { return []; } }
      function pp2LoadCustomProvs() { try { return JSON.parse(localStorage.getItem(PP2_CUSTOM_PROV_KEY)||'[]'); } catch { return []; } }
      function pp2SaveCustomProvs(a){ localStorage.setItem(PP2_CUSTOM_PROV_KEY, JSON.stringify(a)); if(window.fb_savePP2) window.fb_savePP2('customProvs', a).catch(()=>{}); }
      function pp2AllProvs() {
        const custom = pp2LoadCustomProvs();
        return [...PP_PROVS, ...custom].sort((a,b) => a.label.localeCompare(b.label, 'es'));
      }

      function pp2AllItems() {
        return pp2AllItemsOrdered();
      }

      function pp2GetStockBadge(itemId, nombre) {
        const minimos = pp2LoadMinimos();
        const min = minimos[itemId] !== undefined ? parseInt(minimos[itemId]) : null;
        try {
          const hist = JSON.parse(localStorage.getItem('dpf_stock_historial')||'[]');
          if (hist.length) {
            const last = hist[hist.length-1];
            if (last.lines && last.lines.length) {
              for (const line of last.lines) {
                const text = typeof line === 'string' ? line : (line.label||line.name||line.ing||'');
                const colonIdx = text.indexOf(':');
                if (colonIdx < 0) continue;
                const lineName = text.slice(0, colonIdx).trim().toLowerCase();
                const lineVal  = text.slice(colonIdx + 1).trim();
                const itemName = nombre.toLowerCase();
                if (lineName === itemName || itemName.includes(lineName) || lineName.includes(itemName)) {
                  const m = lineVal.match(/^(\d+)\s*(.*)/);
                  const qty = m ? parseInt(m[1]) : null;
                  const unit = m ? (m[2]||'') : lineVal;
                  const bajo = (min !== null && qty !== null) ? qty <= min : (qty !== null && qty <= 2);
                  return { qty: qty !== null ? String(qty) : lineVal, unit, bajo, min };
                }
              }
            }
          }
        } catch(e){}
        // No hay dato de stock pero puede haber mínimo configurado
        return null;
      }

      // ── overlay open/close ────────────────────────────────────
      function openPedidosProvOverlay() {
        _pp2DeleteMode  = false;
        _pp2DeleteSel   = new Set();
        _pp2SearchQuery = '';
        const _ov = document.getElementById('pedidos-prov-overlay');
        _ov.style.display = 'block';
        _ov.scrollTop = 0;
        document.body.style.overflow = 'hidden';
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
            if (window._pp2StockUnsubscribe) { try { window._pp2StockUnsubscribe(); } catch(e) {} }
            window._pp2StockUnsubscribe = window.fb_listenStockHistorial((data) => {
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
            if (window._pp2Unsubscribe) { try { window._pp2Unsubscribe(); } catch(e) {} }
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
        // Desactivar listeners en tiempo real al cerrar
        if (window._pp2Unsubscribe) { try { window._pp2Unsubscribe(); } catch(e) {} window._pp2Unsubscribe = null; }
        if (window._pp2StockUnsubscribe) { try { window._pp2StockUnsubscribe(); } catch(e) {} window._pp2StockUnsubscribe = null; }
        document.getElementById('pp2-picker').style.display = 'none';
        document.getElementById('pp2-add-modal').style.display = 'none';
        document.getElementById('pp2-pad-modal').style.display = 'none';
        document.getElementById('pp2-hist-modal').style.display = 'none';
        document.getElementById('pp2-min-modal').style.display = 'none';
        _pp2SearchQuery = '';
      }

      // ── render ───────────────────────────────────────────────
      function pp2Render() {
        const state   = pp2LoadState();
        const provHab = pp2LoadProvHab();
        let items     = pp2AllItems();
        const el      = document.getElementById('pp2-items-list');
        if (!el) return;

        // Hoist expensive calls outside the loop — una vez para todos los items
        const allProvs   = pp2AllProvs();
        const minimos    = pp2LoadMinimos();
        // Parsear historial de stock una sola vez
        let stockLastLines = [];
        try {
          const hist = JSON.parse(localStorage.getItem('dpf_stock_historial')||'[]');
          if (hist.length) {
            const last = hist[hist.length - 1];
            if (last && last.lines) stockLastLines = last.lines;
          }
        } catch(e) {}

        // Función de badge con datos ya cargados (sin tocar localStorage)
        function _stockBadge(itemId, nombre) {
          const min = minimos[itemId] !== undefined ? parseInt(minimos[itemId]) : null;
          for (const line of stockLastLines) {
            const text = typeof line === 'string' ? line : (line.label||line.name||line.ing||'');
            const colonIdx = text.indexOf(':');
            if (colonIdx < 0) continue;
            const lineName = text.slice(0, colonIdx).trim().toLowerCase();
            const lineVal  = text.slice(colonIdx + 1).trim();
            const itemName = nombre.toLowerCase();
            if (lineName === itemName || itemName.includes(lineName) || lineName.includes(itemName)) {
              const m   = lineVal.match(/^(\d+)\s*(.*)/);
              const qty = m ? parseInt(m[1]) : null;
              const unit = m ? (m[2]||'') : lineVal;
              const bajo = (min !== null && qty !== null) ? qty <= min : (qty !== null && qty <= 2);
              return { qty: qty !== null ? String(qty) : lineVal, unit, bajo, min };
            }
          }
          return null;
        }

        // Filtro de búsqueda
        const q = _pp2SearchQuery.trim().toLowerCase();
        if (q) items = items.filter(i => i.nombre.toLowerCase().includes(q));

        if (!items.length) {
          el.innerHTML = '<div style="text-align:center;color:var(--muted);padding:24px;font-size:14px">Sin resultados para "' + _pp2SearchQuery.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') + '"</div>';
          return;
        }

        const visibleCats = [...new Set(items.map(i=>i.cat))];

        function _buildCatHTML(cat) {
          const catItems = items.filter(i=>i.cat===cat);
          const rows = catItems.map(item => {
            const s    = state[item.id] || {};
            const qty  = s.qty  !== undefined ? s.qty  : 0;
            // Si el item tiene unidad fija (ej. sacos), usarla siempre
            const fixedUnit = item.unit || null;
            const unit = fixedUnit || (s.unit !== undefined ? s.unit : 'cajas');
            // Proveedor: usar el del estado, o el habitual si no hay ninguno asignado aún
            const prov    = s.prov || provHab[item.id] || '';
            const provObj = allProvs.find(p=>p.id===prov);
            const provLabel = provObj ? provObj.label : '';
            const isHabitual = !s.prov && !!provHab[item.id];  // viene del habitual, no del estado actual
            const stock = _stockBadge(item.id, item.nombre);
            const hasQty = qty > 0;
            const bg     = hasQty ? 'var(--amber-light)' : 'var(--white)';
            const border = hasQty ? 'var(--amber)' : 'var(--warm)';
            const delCb = _pp2DeleteMode
              ? `<input type="checkbox" ${_pp2DeleteSel.has(item.id)?'checked':''} onchange="pp2DelToggle('${item.id}',this.checked)"
                   style="width:18px;height:18px;accent-color:#c0392b;flex-shrink:0;cursor:pointer;margin-right:2px">`
              : '';

            // Badge stock con color según mínimo
            const stockBadge = stock !== null
              ? `<span data-stock-badge style="font-size:13px;font-weight:700;color:${stock.bajo?'#c0392b':'#27855a'};background:${stock.bajo?'#fdf0ee':'#eafaf1'};border:1.5px solid ${stock.bajo?'#e74c3c':'#a9dfbf'};border-radius:8px;padding:2px 10px;white-space:nowrap;flex-shrink:0">
                  ${stock.bajo?'⚠️ ':''}En tienda: ${stock.qty}${stock.unit?' '+stock.unit:''}${stock.min!==null?' (mín. '+stock.min+')':''}
                 </span>`
              : '';

            // Botón proveedor: si es habitual lo distinguimos visualmente
            const provBtnStyle = prov
              ? (isHabitual
                  ? `border:1.5px dashed var(--amber-dark);background:var(--amber-light);color:var(--amber-dark)`
                  : `border:1.5px solid var(--amber-dark);background:var(--amber-light);color:var(--amber-dark)`)
              : `border:1.5px solid var(--warm);background:var(--white);color:var(--muted)`;

            return `<div class="pp2-row" id="pp2-row-${item.id}" data-id="${item.id}" data-cat="${cat.replace(/"/g,'&quot;')}"
                draggable="true"
                ondragstart="pp2DragStart(event)"
                ondragover="pp2DragOver(event)"
                ondrop="pp2Drop(event)"
                ondragend="pp2DragEnd(event)"
                ondragleave="this.style.background=''"
                style="display:flex;align-items:center;gap:7px;background:${bg};border:2px solid ${border};border-radius:12px;padding:11px 14px;margin-bottom:8px;cursor:default">
              ${delCb}
              <span style="font-size:18px;color:var(--muted);cursor:grab;padding:0 2px;flex-shrink:0;user-select:none;touch-action:none" title="Arrastrar">⠿</span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
                  <span style="font-size:16px;font-weight:700;color:var(--brown)">${item.nombre}</span>
                  ${stockBadge}
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
                  ${fixedUnit
                    ? `<span style="padding:3px 9px;border-radius:6px;border:1.5px solid var(--amber-dark);background:var(--amber-light);color:var(--amber-dark);font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif">${fixedUnit.charAt(0).toUpperCase()+fixedUnit.slice(1)}</span>`
                    : `<button data-unit="cajas" onclick="pp2SetUnit('${item.id}','cajas')"
                        style="padding:3px 9px;border-radius:6px;border:1.5px solid ${unit==='cajas'?'var(--amber-dark)':'var(--warm)'};background:${unit==='cajas'?'var(--amber-light)':'var(--white)'};color:${unit==='cajas'?'var(--amber-dark)':'var(--muted)'};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
                        &#x1F4E6; Cajas
                      </button>
                      <button data-unit="unidades" onclick="pp2SetUnit('${item.id}','unidades')"
                        style="padding:3px 9px;border-radius:6px;border:1.5px solid ${unit==='unidades'?'var(--amber-dark)':'var(--warm)'};background:${unit==='unidades'?'var(--amber-light)':'var(--white)'};color:${unit==='unidades'?'var(--amber-dark)':'var(--muted)'};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
                        &#x1F522; Unidades
                      </button>`
                  }
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                <button onclick="pp2Qty('${item.id}',-1)" style="width:34px;height:34px;border-radius:50%;border:2px solid var(--amber);background:var(--white);font-size:20px;font-weight:700;cursor:pointer;color:var(--amber-dark)">&#x2212;</button>
                <span data-qty style="font-size:18px;font-weight:900;color:var(--brown);min-width:24px;text-align:center">${qty||''}</span>
                <button onclick="pp2Qty('${item.id}',1)" style="width:34px;height:34px;border-radius:50%;border:none;background:var(--amber);font-size:20px;font-weight:700;cursor:pointer;color:#fff">+</button>
              </div>
              <button data-prov-btn onclick="pp2PickerOpen('${item.id}')"
                style="flex-shrink:0;padding:5px 10px;border-radius:8px;${provBtnStyle};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis">
                ${prov ? provLabel : '+ Prov.'}
              </button>
            </div>`;
          }).join('');

          return `<div style="margin-bottom:8px">
            <div style="font-size:20px;font-weight:900;color:var(--brown);padding:12px 0 8px;border-bottom:3px solid var(--amber);margin-bottom:10px;font-family:'Playfair Display',serif">${cat}</div>
            ${rows}
          </div>`;
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
        if (!row) { pp2Render(); return; } // fallback si no existe
        const state   = pp2LoadState();
        const provHab = pp2LoadProvHab();
        const items   = pp2AllItems();
        const item    = items.find(i => i.id === id);
        if (!item) return;

        const s     = state[id] || {};
        const qty   = s.qty !== undefined ? s.qty : 0;
        const fixedUnit = item.unit || null;
        const unit  = fixedUnit || (s.unit !== undefined ? s.unit : 'cajas');
        const prov  = s.prov || provHab[id] || '';
        const allProvs = pp2AllProvs();
        const provObj  = allProvs.find(p => p.id === prov);
        const provLabel = provObj ? provObj.label : '';
        const isHabitual = !s.prov && !!provHab[id];
        // Usar datos de stock cacheados para no leer localStorage en cada toque
        let stockLastLinesRow = [];
        try {
          const histRow = JSON.parse(localStorage.getItem('dpf_stock_historial')||'[]');
          if (histRow.length && histRow[histRow.length-1] && histRow[histRow.length-1].lines)
            stockLastLinesRow = histRow[histRow.length-1].lines;
        } catch(e) {}
        const minimosCached = pp2LoadMinimos();
        function _stockBadgeRow(itemId2, nombre2) {
          const min2 = minimosCached[itemId2] !== undefined ? parseInt(minimosCached[itemId2]) : null;
          for (const line of stockLastLinesRow) {
            const text = typeof line === 'string' ? line : (line.label||line.name||line.ing||'');
            const colonIdx = text.indexOf(':');
            if (colonIdx < 0) continue;
            const lineName = text.slice(0, colonIdx).trim().toLowerCase();
            const lineVal  = text.slice(colonIdx + 1).trim();
            const itemName2 = nombre2.toLowerCase();
            if (lineName === itemName2 || itemName2.includes(lineName) || lineName.includes(itemName2)) {
              const m = lineVal.match(/^(\d+)\s*(.*)/);
              const qty2 = m ? parseInt(m[1]) : null;
              const unit2 = m ? (m[2]||'') : lineVal;
              const bajo2 = (min2 !== null && qty2 !== null) ? qty2 <= min2 : (qty2 !== null && qty2 <= 2);
              return { qty: qty2 !== null ? String(qty2) : lineVal, unit: unit2, bajo: bajo2, min: min2 };
            }
          }
          return null;
        }
        const stock = _stockBadgeRow(id, item.nombre);
        const hasQty = qty > 0;

        // Actualizar fondo y borde
        row.style.background = hasQty ? 'var(--amber-light)' : 'var(--white)';
        row.style.border     = '2px solid ' + (hasQty ? 'var(--amber)' : 'var(--warm)');

        // Actualizar contador qty
        const qtyEl = row.querySelector('[data-qty]');
        if (qtyEl) qtyEl.textContent = qty || '';

        // Actualizar badge stock
        const stockEl = row.querySelector('[data-stock-badge]');
        if (stockEl) {
          if (stock !== null) {
            stockEl.style.color      = stock.bajo ? '#c0392b' : '#27855a';
            stockEl.style.background = stock.bajo ? '#fdf0ee' : '#eafaf1';
            stockEl.style.border     = '1.5px solid ' + (stock.bajo ? '#e74c3c' : '#a9dfbf');
            stockEl.textContent      = (stock.bajo ? '⚠️ ' : '') + 'En tienda: ' + stock.qty + (stock.unit ? ' ' + stock.unit : '') + (stock.min !== null ? ' (mín. ' + stock.min + ')' : '');
            stockEl.style.display    = '';
          } else {
            stockEl.style.display = 'none';
          }
        }

        // Actualizar botones de unidad
        if (!fixedUnit) {
          const cajasBtn = row.querySelector('[data-unit="cajas"]');
          const unidBtn  = row.querySelector('[data-unit="unidades"]');
          if (cajasBtn) {
            cajasBtn.style.border     = '1.5px solid ' + (unit === 'cajas' ? 'var(--amber-dark)' : 'var(--warm)');
            cajasBtn.style.background = unit === 'cajas' ? 'var(--amber-light)' : 'var(--white)';
            cajasBtn.style.color      = unit === 'cajas' ? 'var(--amber-dark)' : 'var(--muted)';
          }
          if (unidBtn) {
            unidBtn.style.border     = '1.5px solid ' + (unit === 'unidades' ? 'var(--amber-dark)' : 'var(--warm)');
            unidBtn.style.background = unit === 'unidades' ? 'var(--amber-light)' : 'var(--white)';
            unidBtn.style.color      = unit === 'unidades' ? 'var(--amber-dark)' : 'var(--muted)';
          }
        }

        // Actualizar botón proveedor
        const provBtn = row.querySelector('[data-prov-btn]');
        if (provBtn) {
          if (prov) {
            provBtn.style.border     = isHabitual ? '1.5px dashed var(--amber-dark)' : '1.5px solid var(--amber-dark)';
            provBtn.style.background = 'var(--amber-light)';
            provBtn.style.color      = 'var(--amber-dark)';
            provBtn.textContent      = provLabel;
          } else {
            provBtn.style.border     = '1.5px solid var(--warm)';
            provBtn.style.background = 'var(--white)';
            provBtn.style.color      = 'var(--muted)';
            provBtn.textContent      = '+ Prov.';
          }
        }
      }

      // ── quantity & unit ──────────────────────────────────────
      function pp2Qty(id, delta) {
        const s = pp2LoadState();
        if (!s[id]) s[id] = {};
        s[id].qty = Math.max(0, (s[id].qty||0) + delta);
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
        const items  = pp2AllItems();
        const item   = items.find(i=>i.id===itemId);
        document.getElementById('pp2-picker-title').textContent = '¿Quién te sirve: ' + (item?item.nombre:'')+'?';
        const state   = pp2LoadState();
        const provHab = pp2LoadProvHab();
        const current = (state[itemId]||{}).prov || provHab[itemId] || '';
        const habitual = provHab[itemId] || '';
        const btns    = document.getElementById('pp2-picker-btns');
        btns.innerHTML = pp2AllProvs().map(p => {
          const isSelected = current === p.id;
          const isHab = habitual === p.id && !isSelected;
          return `<button onclick="pp2PickerSelect('${p.id}')"
            style="padding:8px 14px;border-radius:10px;border:2px solid ${isSelected?'var(--amber-dark)':isHab?'var(--amber)':'var(--warm)'};background:${isSelected?'var(--amber-light)':'var(--white)'};color:${isSelected?'var(--amber-dark)':'var(--text)'};font-size:13px;font-weight:${isSelected?'700':'500'};cursor:pointer;font-family:'DM Sans',sans-serif;position:relative">
            ${p.label}${isHab?' <span style="font-size:9px;vertical-align:super;color:var(--amber-dark)">habitual</span>':''}
          </button>`;
        }).join('') +
        `<button onclick="pp2NuevoProveedorModal()"
          style="padding:8px 14px;border-radius:10px;border:2px solid #27855a;background:#eafaf1;color:#27855a;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
          &#x2795; Nuevo proveedor
        </button>
        <button onclick="pp2EliminarProveedorModal()"
          style="padding:8px 14px;border-radius:10px;border:2px solid #c0392b;background:#fdf0ee;color:#c0392b;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
          &#x1F5D1; Eliminar proveedor
        </button>` +
        `<button onclick="pp2PickerClose()"
          style="padding:8px 14px;border-radius:10px;border:2px solid #ccc;background:#f5f5f5;color:#888;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif">
          &#x2715; Salir
        </button>`;
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
        const id    = 'cprov_' + label.toLowerCase().replace(/[^a-z0-9]/g,'_') + '_' + Date.now();
        const custom = pp2LoadCustomProvs();
        if ([...PP_PROVS, ...custom].some(p => p.label.toLowerCase() === label.toLowerCase())) {
          alert('Ya existe un proveedor con ese nombre'); return;
        }
        custom.push({ id, label });
        pp2SaveCustomProvs(custom);
        pp2PickerSelect(id);
      }

      function pp2EliminarProveedorModal() {
        const custom = pp2LoadCustomProvs();
        if (!custom.length) { alert('No hay proveedores personalizados que eliminar.\nLos proveedores predefinidos no se pueden borrar.'); return; }
        const lista = custom.map((p, i) => `${i+1}. ${p.label}`).join('\n');
        const input = prompt('Proveedores personalizados:\n' + lista + '\n\nEscribe el nombre exacto del que quieres eliminar:');
        if (!input || !input.trim()) return;
        const idx = custom.findIndex(p => p.label.toLowerCase() === input.trim().toLowerCase());
        if (idx < 0) { alert('No encontrado. Escribe el nombre exacto.'); return; }
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
        const customCats = [...new Set(pp2LoadCustom().map(i => i.cat))].filter(c =>
          !Array.from(sel.options).some(o => o.value === c) && c !== '__nueva__'
        );
        customCats.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c; opt.textContent = c;
          sel.insertBefore(opt, sel.querySelector('[value="__nueva__"]'));
        });
        sel.value = sel.options[0].value;
        document.getElementById('pp2-add-modal').style.display = 'flex';
        setTimeout(()=>document.getElementById('pp2-add-name').focus(), 100);
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
          if (!cat) { alert('Escribe el nombre de la nueva sección'); return; }
        }
        if (!nombre) { alert('Escribe el nombre del producto'); return; }
        const custom = pp2LoadCustom();
        const id     = 'custom_' + Date.now();
        custom.push({ cat, id, nombre, qty: '' });
        pp2SaveCustom(custom);
        pp2AddProductModalClose();
        pp2Render();
      }

      // ── delete mode ───────────────────────────────────────────
      function pp2ToggleDeleteMode() {
        _pp2DeleteMode = !_pp2DeleteMode;
        _pp2DeleteSel  = new Set();
        const btn     = document.getElementById('pp2-delete-btn');
        const confirm = document.getElementById('pp2-delete-confirm-area');
        btn.textContent = _pp2DeleteMode ? '❌ Cancelar eliminación' : '🗑️ Eliminar producto';
        confirm.style.display = _pp2DeleteMode ? 'block' : 'none';
        pp2Render();
      }

      function pp2DelToggle(id, checked) {
        if (checked) _pp2DeleteSel.add(id);
        else         _pp2DeleteSel.delete(id);
      }

      function pp2ConfirmDelete() {
        if (!_pp2DeleteSel.size) { alert('Selecciona al menos un producto'); return; }
        if (!confirm('¿Eliminar los productos seleccionados? Los predefinidos se ocultarán.')) return;

        // Custom items: remove fully
        let custom  = pp2LoadCustom();
        custom = custom.filter(i => !_pp2DeleteSel.has(i.id));
        pp2SaveCustom(custom);

        // Built-in items: add to hidden list
        const hidden = pp2LoadHidden();
        const builtinIds = PP_ITEMS.map(i=>i.id);
        _pp2DeleteSel.forEach(id => {
          if (builtinIds.includes(id) && !hidden.includes(id)) hidden.push(id);
        });
        pp2SaveHidden(hidden);

        _pp2DeleteMode = false;
        _pp2DeleteSel  = new Set();
        document.getElementById('pp2-delete-btn').textContent = '🗑️ Eliminar producto';
        document.getElementById('pp2-delete-confirm-area').style.display = 'none';
        pp2Render();
      }

      // ── nueva semana ─────────────────────────────────────────
      function pp2NuevaSemana() {
        if (!confirm('¿Nueva semana? Se borran todas las cantidades. Los proveedores habituales se mantienen y se precargarán automáticamente.')) return;
        const s   = pp2LoadState();
        const hab = pp2LoadProvHab();
        // Limpiar cantidades y proveedores del estado; los habituales se aplican en render
        Object.keys(s).forEach(id => {
          s[id].qty  = 0;
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
        const hist = pp2LoadHistorial();
        const fecha = new Date().toLocaleString('es-ES', {day:'2-digit',month:'2-digit',year:'2-digit'});
        hist.push({ fecha, nota }); // más antiguo primero, más reciente al final
        if (hist.length > 50) hist.shift(); // máximo 50 entradas
        localStorage.setItem(PP2_HISTORIAL_KEY, JSON.stringify(hist));
        if(window.fb_savePP2) window.fb_savePP2('historial', hist).catch(()=>{});
      }

      function pp2VerHistorial() {
        const hist = pp2LoadHistorial();
        const modal = document.getElementById('pp2-hist-modal');
        const list  = document.getElementById('pp2-hist-list');
        if (!hist.length) {
          list.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Sin historial aún. Los pedidos enviados por WhatsApp se guardan aquí automáticamente.</p>';
        } else {
          // Mostrar de más antiguo (índice 0) a más reciente (último)
          list.innerHTML = hist.map((h, i) => `
            <div style="border:1.5px solid var(--warm);border-radius:10px;padding:12px;margin-bottom:10px;background:var(--white)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">
                <span style="font-size:17px;font-weight:900;color:var(--brown)">📦 ${h.fecha}</span>
                <div style="display:flex;gap:6px">
                  <button onclick="pp2HistDescargar(${i})" style="font-size:11px;padding:3px 8px;background:var(--white);color:var(--brown);border:1.5px solid var(--warm);border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif">💾</button>
                  <button onclick="pp2HistRecargar(${i})" style="font-size:11px;padding:3px 10px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:6px;cursor:pointer;font-weight:700;font-family:'DM Sans',sans-serif">Usar de base</button>
                </div>
              </div>
              <pre style="font-size:12px;color:var(--text);white-space:pre-wrap;margin:0;line-height:1.5;font-family:'DM Sans',sans-serif">${h.nota}</pre>
            </div>`).join('');
        }
        modal.style.display = 'flex';
      }

      function pp2HistDescargar(i) {
        const hist = pp2LoadHistorial();
        if (!hist[i]) return;
        const h = hist[i];
        const nombreFecha = h.fecha.replace(/[/:, ]/g,'-').replace(/-+/g,'-');
        const blob = new Blob([h.nota], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = 'pedido_' + nombreFecha + '.txt';
        a.click();
        URL.revokeObjectURL(url);
      }

      function pp2HistExportarTodo() {
        const hist = pp2LoadHistorial();
        if (!hist.length) { alert('Sin historial todavía'); return; }
        // Construir un único .txt con todos los pedidos de más antiguo a más reciente
        const texto = hist.map((h, i) =>
          '═══════════════════════════════\n' +
          '  PEDIDO #' + (i+1) + ' — ' + h.fecha + '\n' +
          '═══════════════════════════════\n' +
          h.nota
        ).join('\n\n');
        const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
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
        document.getElementById('pp2-pad-modal').style.display = 'flex';
      }

      // ── mínimos de stock ──────────────────────────────────────
      function pp2VerMinimos() {
        const minimos = pp2LoadMinimos();
        const items   = pp2AllItems();
        const modal   = document.getElementById('pp2-min-modal');
        const list    = document.getElementById('pp2-min-list');
        list.innerHTML = items.map(item => {
          const val = minimos[item.id] !== undefined ? minimos[item.id] : '';
          return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--warm)">
            <span style="flex:1;font-size:13px;font-weight:600;color:var(--brown)">${item.nombre}</span>
            <input type="number" min="0" value="${val}" placeholder="—"
              onchange="pp2SetMinimo('${item.id}',this.value)"
              style="width:64px;padding:5px 8px;border:1.5px solid var(--warm);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-align:center;outline:none;background:var(--white)">
          </div>`;
        }).join('');
        modal.style.display = 'flex';
      }

      function pp2SetMinimo(id, val) {
        const minimos = pp2LoadMinimos();
        const n = parseInt(val);
        if (isNaN(n) || n < 0) delete minimos[id];
        else minimos[id] = n;
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
          const la = (allProvs.find(p => p.id === a) || {label: a}).label;
          const lb = (allProvs.find(p => p.id === b) || {label: b}).label;
          return la.localeCompare(lb, 'es');
        });
        let txt = '🛒 PEDIDO\n';
        sortedProvs.forEach(provId => {
          const provLabel = provId === '__sin__' ? 'SIN PROVEEDOR' : (allProvs.find(p => p.id === provId) || {label: provId}).label.toUpperCase();
          txt += '\n' + provLabel + ':\n';
          byProv[provId].forEach(item => {
            const s = state[item.id] || {};
            const fixedUnit = item.unit || null;
            const unit = fixedUnit || (s.unit === 'unidades' ? 'ud' : (s.qty > 1 ? 'cajas' : 'caja'));
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
          const la = (PP_PROVS.find(p => p.id === a) || {label: a}).label;
          const lb = (PP_PROVS.find(p => p.id === b) || {label: b}).label;
          return la.localeCompare(lb, 'es');
        });
        let txt = '🛒 PEDIDO\n';
        sortedProvs.forEach(provId => {
          const allProvs = pp2AllProvs();
          const provLabel = (allProvs.find(p => p.id === provId) || {label: provId}).label.toUpperCase();
          txt += '\n' + provLabel + ':\n';
          byProv[provId].forEach(item => {
            const s = state[item.id] || {};
            const fixedUnit = item.unit || null;
            const unit = fixedUnit || (s.unit === 'unidades' ? 'ud' : (s.qty > 1 ? 'cajas' : 'caja'));
            txt += '  ' + item.nombre + ' — ' + s.qty + ' ' + unit + '\n';
          });
        });
        return txt.trim();
      }

      function pp2SaveToPad() {
        const txt = pp2BuildNota();
        if (!txt) { alert('No hay productos con cantidad y proveedor asignado'); return; }
        document.getElementById('pp2-pad-text').value = txt;
        document.getElementById('pp2-pad-copy-ok').style.display = 'none';
        document.getElementById('pp2-pad-modal').style.display = 'flex';
      }

      function pp2PadCopy() {
        const ta = document.getElementById('pp2-pad-text');
        ta.select();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ta.value).catch(() => { document.execCommand('copy'); });
          } else {
            document.execCommand('copy');
          }
        } catch { document.execCommand('copy'); }
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
        if (!txt) { alert('No hay productos con cantidad y proveedor asignado'); return; }
        window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
      }

      // ── order persistence ─────────────────────────────────────
      const PP2_ORDER_KEY = 'dpf_pp_order';

      function pp2LoadOrder() {
        try { return JSON.parse(localStorage.getItem(PP2_ORDER_KEY)||'null'); } catch { return null; }
      }
      function pp2SaveOrder(ids) {
        localStorage.setItem(PP2_ORDER_KEY, JSON.stringify(ids)); if(window.fb_savePP2) window.fb_savePP2('order', ids).catch(()=>{});
      }

      // Returns all items in persisted order, patching in any new items at the end
      function pp2AllItemsOrdered() {
        const hidden  = pp2LoadHidden();
        const custom  = pp2LoadCustom();
        const builtin = PP_ITEMS.filter(i => !hidden.includes(i.id));
        const all     = [...builtin, ...custom];
        const savedOrder = pp2LoadOrder();
        if (!savedOrder) return all;
        // Build map for quick lookup
        const byId = {};
        all.forEach(i => byId[i.id] = i);
        // Apply saved order, skipping deleted/hidden items
        const ordered = savedOrder.filter(id => byId[id]).map(id => byId[id]);
        // Append any new items not yet in savedOrder
        all.forEach(i => { if (!savedOrder.includes(i.id)) ordered.push(i); });
        return ordered;
      }

      // ── drag & drop ────────────────────────────────────────────
      let _pp2DragSrc = null;

      function pp2DragStart(e) {
        _pp2DragSrc = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { if (_pp2DragSrc) _pp2DragSrc.style.opacity = '0.4'; }, 0);
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
        if (row && row !== _pp2DragSrc) row.style.background = 'var(--amber-light)';
      }
      function pp2Drop(e) {
        e.preventDefault();
        const target = e.currentTarget;
        if (target) target.style.background = '';
        if (!_pp2DragSrc || _pp2DragSrc === target) { _pp2DragSrc = null; return; }
        if (_pp2DragSrc) _pp2DragSrc.style.opacity = '';
        const srcId = _pp2DragSrc.dataset.id;
        const tgtId = target.dataset.id;
        _pp2DragSrc = null;
        _pp2ReorderItems(srcId, tgtId);
      }

      // ── touch drag ────────────────────────────────────────────
      // Los listeners van al overlay, no al document, para no interferir con el scroll
      let _pp2TouchDragEl = null, _pp2TouchClone = null, _pp2TouchStartY2 = 0;

      function _pp2TouchStartHandler(e) {
        const handle = e.target.closest('[title="Arrastrar"]');
        if (!handle) return;
        const row = handle.closest('.pp2-row');
        if (!row) return;
        _pp2TouchDragEl  = row;
        _pp2TouchStartY2 = e.touches[0].clientY;
        _pp2TouchClone   = row.cloneNode(true);
        _pp2TouchClone.style.cssText = 'position:fixed;left:' + row.getBoundingClientRect().left + 'px;top:'
          + row.getBoundingClientRect().top + 'px;width:' + row.offsetWidth + 'px;'
          + 'opacity:0.75;z-index:9999;pointer-events:none;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.18);transition:none';
        document.body.appendChild(_pp2TouchClone);
        row.style.opacity = '0.3';
        // Bloquear scroll del overlay solo mientras hay drag activo
        const ov = document.getElementById('pedidos-prov-overlay');
        if (ov) ov.style.overflow = 'hidden';
      }

      function _pp2TouchMoveHandler(e) {
        if (!_pp2TouchDragEl || !_pp2TouchClone) return;
        e.preventDefault(); // solo cuando hay drag activo
        const dy   = e.touches[0].clientY - _pp2TouchStartY2;
        const orig = _pp2TouchDragEl.getBoundingClientRect();
        _pp2TouchClone.style.top = (orig.top + dy) + 'px';
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
        const cat      = _pp2TouchDragEl.dataset.cat;
        const siblings = [...document.querySelectorAll('.pp2-row')].filter(s => s.dataset.cat === cat);
        let best = null, bestDist = Infinity;
        siblings.forEach(s => {
          if (s === _pp2TouchDragEl) return;
          const r   = s.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          if (Math.abs(mid - y) < bestDist) { bestDist = Math.abs(mid - y); best = { el: s, above: y < mid }; }
        });
        const srcId = _pp2TouchDragEl.dataset.id;
        _pp2TouchDragEl = null;
        if (best) _pp2ReorderItems(srcId, best.el.dataset.id);
      }

      // Adjuntar al overlay en vez de document — así no toca el scroll del resto de la página
      const _pp2Overlay = document.getElementById('pedidos-prov-overlay');
      if (_pp2Overlay) {
        _pp2Overlay.addEventListener('touchstart', _pp2TouchStartHandler, { passive: true });
        // touchmove necesita passive:false para poder llamar preventDefault durante drag
        _pp2Overlay.addEventListener('touchmove', _pp2TouchMoveHandler, { passive: false });
        _pp2Overlay.addEventListener('touchend',  _pp2TouchEndHandler,  { passive: true });
      }

      function _pp2ReorderItems(srcId, targetId) {
        const items = pp2AllItemsOrdered();
        const ids   = items.map(i => i.id);
        const srcIdx    = ids.indexOf(srcId);
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
  emailjs_public_key:  "TU_PUBLIC_KEY",   // de emailjs.com
  emailjs_service_id:  "TU_SERVICE_ID",
  emailjs_template_id: "TU_TEMPLATE_ID",
  store_email: "tutienda@email.com",       // tu email de tienda
};
// ─────────────────────────────────────────

const MENU = [
  // ── PATATAS ──
  { id:1,  cat:"Patatas", name:"Patata Simple",        desc:"Aceite de oliva o mantequilla, sal y pimienta",                                          price:3.00 },
  { id:2,  cat:"Patatas", name:"Patata Vegetal",       desc:"Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural",       price:5.60 },
  { id:3,  cat:"Patatas", name:"Patata Picante",       desc:"Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas",                        price:5.60 },
  { id:4,  cat:"Patatas", name:"Patata Carbonara",     desc:"Nata, cebolla cocinada, bacon y queso mozzarella · Salsa cocinada a diario",              price:5.80 },
  { id:5,  cat:"Patatas", name:"Patata Boloñesa",      desc:"Tomate frito, carne picada, cebolla cocinada y queso mozzarella · Salsa cocinada a diario",price:5.80 },
  { id:6,  cat:"Patatas", name:"Patata Hawaiana",      desc:"Mayonesa, york, aceitunas, maíz, piña y queso mozzarella",                                price:5.80 },
  { id:7,  cat:"Patatas", name:"Patata Kebab",         desc:"Salsa de yogur, carne de kebab pollo, maíz, aceitunas y cebolla",                         price:5.90 },
  { id:8,  cat:"Patatas", name:"Patata 4 Quesos",      desc:"Salsa roquefort, emmental, gouda y mozzarella",                                           price:5.90 },
  { id:9,  cat:"Patatas", name:"Patata Completa",      desc:"Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón",                    price:6.20 },
  { id:10, cat:"Patatas", name:"Patata Carnívora",     desc:"Alioli, york, bacon, kebab y carne picada",                                               price:6.40 },
  { id:11, cat:"Patatas", name:"Patata Philadelphia",  desc:"Salsa philadelphia, york, huevo, pollo, queso mozzarella",                                price:6.40 },
  { id:12, cat:"Patatas", name:"Patata Ranchera",      desc:"Salsa ranchera, pollo, bacon y queso mozzarella",                                         price:6.50 },
  { id:13, cat:"Patatas", name:"Patata Granollers",    desc:"Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria",                        price:6.50 },
  { id:14, cat:"Patatas", name:"Patata Pulled Pork 🆕",desc:"Salsa barbacoa, cebolla, carne pulled pork y mozzarella",                                 price:6.50 },
  { id:50, cat:"Patatas", name:"Patata Cheddar-Bacon 🆕",desc:"Salsa queso cheddar, carne a elegir, caramelo de bacon y queso mozzarella gratinado",    price:8.50 },
  { id:15, cat:"Patatas", name:"Patata Al Gusto",      desc:"1 salsa a elegir y 6 ingredientes",                                                       price:6.90 },
  { id:16, cat:"Patatas", name:"Patata Bomba 🆕",      desc:"9 ingredientes y/o salsas al gusto ¡sin límite!",                                         price:8.40 },
  // ── BONIATO FRIES ──
  { id:17, cat:"Boniato", name:"Boniato Fries",        desc:"Tarrina de boniato fries",                                                                price:4.50 },
  { id:18, cat:"Boniato", name:"Boniato Lotus",        desc:"Salsa Lotus + bacon + queso mozzarella + galletas Lotus",                                 price:5.50 },
  { id:19, cat:"Boniato", name:"Boniato Bacon",        desc:"Salsa a elegir + bacon + queso mozzarella",                                               price:5.50 },
  { id:20, cat:"Boniato", name:"Boniato G.O.A.T.",     desc:"Salsa miel mostaza + cebolla crujiente + queso de cabra",                                 price:5.50 },
  { id:21, cat:"Boniato", name:"Boniato Pistacchio 🆕",desc:"Crema de pistacho + queso mozzarella + pistacho crujiente",                               price:5.50 },
  // ── PANINIS ──
  { id:22, cat:"Paninis", name:"Panini Jamón York y Queso", desc:"Pan de leña crujiente · medio metro",                                                price:5.50 },
  { id:23, cat:"Paninis", name:"Panini Carbonara",          desc:"Pan de leña crujiente · medio metro",                                                price:5.50 },
  { id:24, cat:"Paninis", name:"Panini Barbacoa",           desc:"Pan de leña crujiente · medio metro",                                                price:5.50 },
  { id:25, cat:"Paninis", name:"Panini Kebab",              desc:"Pan de leña crujiente · medio metro",                                                price:5.50 },
  { id:26, cat:"Paninis", name:"Panini 4 Quesos",           desc:"Pan de leña crujiente · medio metro",                                                price:5.50 },
  // ── COOKIES ──
  { id:27, cat:"Cookies", name:"Crumbl Cookie Pistacho",    desc:"Recién horneada",                                                                    price:2.99 },
  { id:28, cat:"Cookies", name:"Crumbl Cookie Lotus",       desc:"Recién horneada",                                                                    price:2.99 },
  { id:29, cat:"Cookies", name:"Crumbl Cookie Oreo",        desc:"Recién horneada",                                                                    price:2.99 },
  { id:30, cat:"Cookies", name:"Crumbl Cookie Kit Kat",     desc:"Recién horneada",                                                                    price:2.99 },
  { id:31, cat:"Cookies", name:"Crumbl Cookie Nutella",     desc:"Recién horneada",                                                                    price:2.99 },
  { id:32, cat:"Cookies", name:"Crumbl Cookie Kinder",      desc:"Recién horneada",                                                                    price:2.99 },
  { id:33, cat:"Cookies", name:"Crumbl Cookie Huesitos Blanco", desc:"Recién horneada",                                                                price:2.99 },
  // ── TARTAS ──
  { id:34, cat:"Tartas",  name:"Tarta de Queso La Viña",    desc:"Clásica · elaboración propia",                                                       price:3.40 },
  { id:35, cat:"Tartas",  name:"Tarta Tres Chocolates",     desc:"Clásica · elaboración propia",                                                       price:3.40 },
  { id:36, cat:"Tartas",  name:"Tarta de la Abuela",        desc:"Clásica · elaboración propia",                                                       price:3.40 },
  { id:37, cat:"Tartas",  name:"Tarta de Queso Lotus",      desc:"Especial · elaboración propia",                                                      price:3.90 },
  { id:38, cat:"Tartas",  name:"Tarta de Queso Pistacho",   desc:"Especial · elaboración propia",                                                      price:3.90 },
  { id:39, cat:"Tartas",  name:"Tarta de Queso Dinosaurio", desc:"Especial · elaboración propia",                                                      price:3.90 },
  { id:40, cat:"Tartas",  name:"Tarta de Queso Kinder",     desc:"Especial · elaboración propia",                                                      price:3.90 },
  // ── BEBIDAS ──
  { id:41, cat:"Bebidas", name:"Refresco lata",             desc:"",                                                                                   price:1.10 },
  { id:42, cat:"Bebidas", name:"Cerveza lata",              desc:"",                                                                                   price:1.20 },
  { id:43, cat:"Bebidas", name:"Agua pequeña",              desc:"",                                                                                   price:0.80 },
  { id:44, cat:"Bebidas", name:"Refresco 500 ml",           desc:"",                                                                                   price:1.80 },
  { id:45, cat:"Bebidas", name:"Cerveza 1 litro",           desc:"",                                                                                   price:1.80 },
  { id:46, cat:"Bebidas", name:"Monster o Red Bull",        desc:"",                                                                                   price:1.80 },
  { id:47, cat:"Bebidas", name:"Agua 1,5 litros",           desc:"",                                                                                   price:1.30 },
  { id:48, cat:"Bebidas", name:"Nestea / Aquarius 1,5 l",   desc:"",                                                                                   price:2.20 },
  { id:49, cat:"Bebidas", name:"Refresco 2 litros",         desc:"",                                                                                   price:2.50 },
];

let cart = {};
let _adminLoggedIn = false; // true solo cuando hay sesión de admin activa
let activeCategory = "Todos";

const categories = ["Todos", ...new Set(MENU.map(i => i.cat))];

function initTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = categories.map(c =>
    `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')">${c}</button>`
  ).join('');
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
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;gap:10px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .2s";
    t.innerHTML = "🔒 Estamos cerrados · Puedes consultar la carta";
    document.body.appendChild(t);
  }
  clearTimeout(t._timer);
  t.style.opacity = "1";
  t._timer = setTimeout(function(){ t.style.opacity = "0"; }, 2800);
}
function isShopBlocked() {
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
  const statusText = document.getElementById('hero-status-text')?.textContent || '';
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
  if (next <= 0) delete cart[id];
  else cart[id] = next;
  renderMenu();
  renderCart();
}

function renderCart() {
  const lines = Object.entries(cart);
  const custLines = Object.values(custCart).filter(c => c.qty > 0);
  const countEl = document.getElementById("cart-count");
  const bodyEl = document.getElementById("cart-body");
  const totalRowEl = document.getElementById("cart-total-row");
  const formEl = document.getElementById("order-form");

  const extLines = Object.values(extrasCart).filter(c => c.qty > 0);
  const totalItems = lines.reduce((s,[,q]) => s + q, 0) + custLines.reduce((s,c) => s + c.qty, 0) + extLines.reduce((s,c) => s + c.qty, 0);
  countEl.textContent = totalItems;

  if (lines.length === 0 && custLines.length === 0 && extLines.length === 0) {
    bodyEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div>Añade productos de la carta</div>`;
    totalRowEl.style.display = "none";
    formEl.style.display = "none";
    return;
  }

  let total = 0;
  const linesHtml = lines.map(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) { console.error('renderCart: producto no encontrado id='+id); return ''; }
    const subtotal = item.price * qty;
    total += subtotal;
    return `
    <div class="cart-line">
      <span class="cart-line-name">${item.name}</span>
      <span class="cart-line-qty">x${qty}</span>
      <span class="cart-line-price">${subtotal.toFixed(2)} €</span>
      <button class="cart-remove" onclick="removeItem(${id})" title="Quitar">✕</button>
    </div>`;
  }).join('');

  const custLinesHtml = custLines.map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) { console.error('renderCart: producto custom no encontrado menuId='+c.menuId); return ''; }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const subtotal = unitPrice * c.qty;
    total += subtotal;
    const details = [...c.sauces, ...c.ingredients].join(', ');
    return `
    <div class="cart-line" style="flex-wrap:wrap">
      <span class="cart-line-name" style="width:100%">${item.name}
        <span style="font-size:11px;color:var(--muted);font-weight:400;display:block">${details}</span>
      </span>
      <span class="cart-line-qty">x${c.qty}</span>
      <span class="cart-line-price">${subtotal.toFixed(2)} €</span>
      <button class="cart-remove" onclick="removeCustItem('${c.key.replace(/'/g, "\\'")}')" title="Quitar">✕</button>
    </div>`;
  }).join('');

  const extLinesHtml = extLines.map(c => {
    const price = getExtrasItemPrice(c);
    const subtotal = price * c.qty;
    total += subtotal;
    const _extItem = MENU.find(m => m.id == c.menuId);
    if (!_extItem) { console.error('renderCart: extras item no encontrado menuId='+c.menuId); return ''; }
    const itemName = _extItem.name;
    const extras = [];
    if (c.queso) extras.push('+ Queso +1,00€');
    if (c.gratinado) extras.push('+ Gratinado +0,50€');
    return '<div class="cart-line" style="flex-wrap:wrap">' +
      '<span class="cart-line-name" style="width:100%">' + itemName +
      (extras.length ? '<span style="font-size:11px;color:var(--muted);font-weight:400;display:block">' + extras.join(' · ') + '</span>' : '') +
      '</span>' +
      '<span class="cart-line-qty">x' + c.qty + '</span>' +
      '<span class="cart-line-price">' + subtotal.toFixed(2) + ' €</span>' +
      '<button class="cart-remove" onclick="removeExtrasItem(\'' + c.key.replace(/'/g, "\'") + '\')" title="Quitar">&#x2715;</button>' +
      '</div>';
  }).join('');

  const cartHtml = linesHtml + custLinesHtml + extLinesHtml;
  bodyEl.innerHTML = cartHtml;

  // Mostrar línea de gastos de gestión si está activa
  const feeEnabled = getFeeEnabled();
  const feeAmount  = getFeeAmount();
  const feeLabel   = getFeeLabel();
  const feeEl      = document.getElementById('cart-fee-row');
  if (feeEl) {
    if (feeEnabled) {
      feeEl.style.display = 'flex';
      document.getElementById('cart-fee-label').textContent = feeLabel;
      document.getElementById('cart-fee-amount').textContent = feeAmount.toFixed(2).replace('.', ',') + ' €';
    } else {
      feeEl.style.display = 'none';
    }
  }
  const grandTotal = feeEnabled ? total + feeAmount : total;
  document.getElementById("cart-total").textContent = grandTotal.toFixed(2).replace('.', ',') + " €";

  // Sync mobile FAB and drawer
  _updateCartFab(totalItems, grandTotal);
  _syncCartDrawer(cartHtml, grandTotal);
  // Only show total and form if orders are open
  if (getOrdersOpen()) {
    totalRowEl.style.display = "flex";
    formEl.style.display = "block";
    renderSlotPicker();
  } else {
    totalRowEl.style.display = "none";
    formEl.style.display = "none";
  }
}

// ── FAB y DRAWER (solo móvil) ──────────────────────────────────────────────
function _updateCartFab(count, total) {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  if (count === 0) {
    fab.classList.add('hidden');
  } else {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = count;
    document.getElementById('cart-fab-total').textContent = total.toFixed(2).replace('.', ',') + ' €';
  }
}

function _syncCartDrawer(cartHtml, total) {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  const ordersOpen = getOrdersOpen();
  const feeEnabled = getFeeEnabled();
  const feeAmount  = getFeeAmount();
  const feeLabel   = getFeeLabel();
  let html = cartHtml;
  if (feeEnabled) {
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:var(--muted);border-top:1px dashed var(--warm);margin-top:8px"><span>${feeLabel}</span><span>${feeAmount.toFixed(2).replace('.', ',')} €</span></div>`;
  }
  html += `<div class="cart-total" style="display:flex;margin-top:12px"><span>Total</span><span>${total.toFixed(2).replace('.', ',')} €</span></div>`;
  if (ordersOpen) {
    html += `
    <div style="margin-top:16px">
      <div class="form-group">
        <label>Tu nombre *</label>
        <input type="text" id="drawer-customer-name" placeholder="Nombre y apellido" oninput="document.getElementById('customer-name').value=this.value">
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input type="tel" id="drawer-customer-phone" placeholder="" maxlength="11" oninput="formatPhone(this);document.getElementById('customer-phone').value=this.value">
      </div>
      <div class="form-group">
        <label>Notas del pedido</label>
        <textarea id="drawer-customer-notes" placeholder="Alergias, intolerancias…" oninput="document.getElementById('customer-notes').value=this.value"></textarea>
      </div>
      <div id="drawer-slot-picker-group" style="display:none;margin-top:14px">
        <label style="display:block;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🕐 Hora de recogida *</label>
        <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Los pedidos se preparan por turnos. Elige tu hora de recogida:</p>
        <div id="drawer-slot-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div>
        <div id="drawer-slot-error" style="display:none;font-size:12px;color:#c0392b;margin-top:6px;font-weight:600">⚠️ Por favor elige una hora de recogida</div>
      </div>
      <button class="submit-btn" onclick="submitOrderFromDrawer()" style="margin-top:8px">
        Confirmar pedido →
      </button>
    </div>`;
  } else {
    const lockedMsg = document.getElementById('cart-locked-detail');
    html += `
    <div style="margin-top:16px;background:#3D1F0D;border-radius:12px;padding:20px 16px;text-align:center">
      <div style="font-size:32px;margin-bottom:8px">🔒</div>
      <div style="font-family:'Playfair Display',serif;font-size:17px;font-weight:900;color:#FFF8EE;margin-bottom:6px">Pedidos cerrados</div>
      <div style="font-size:13px;color:rgba(255,248,238,0.7);line-height:1.5">${lockedMsg ? lockedMsg.textContent : ''}</div>
    </div>`;
  }
  drawerBody.innerHTML = html;

  // Sincronizar slot picker en el drawer
  if (ordersOpen) _syncDrawerSlotPicker();
}

function openCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Recargar config de slots desde Firebase y luego sincronizar
  if (window.fb_loadSlotConfig) {
    window.fb_loadSlotConfig().then(function(cfg) {
      if (cfg) {
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max)    localStorage.setItem(SLOT_MAX_KEY, String(cfg.max));
      }
      renderSlotPicker();
      _syncDrawerSlotPicker();
    }).catch(function() {
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
  const dstGrid  = document.getElementById('drawer-slot-grid');
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
    if (btn) btn.classList.add('slot-selected');
  }

  // Los botones del drawer llaman a selectSlot igual que los del panel principal
  dstGrid.querySelectorAll('.slot-btn:not([disabled])').forEach(btn => {
    btn.onclick = function() {
      const slot = btn.querySelector('span').textContent;
      selectSlot(slot);
      // Sincronizar selección visual en drawer
      dstGrid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-selected'));
      btn.classList.add('slot-selected');
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
}

function submitOrderFromDrawer() {
  // Sincronizar campos del drawer al formulario principal antes de validar
  var n = document.getElementById('drawer-customer-name');
  var p = document.getElementById('drawer-customer-phone');
  var t = document.getElementById('drawer-customer-notes');
  if (n) document.getElementById('customer-name').value = n.value;
  if (p) document.getElementById('customer-phone').value = p.value;
  if (t) document.getElementById('customer-notes').value = t.value;
  closeCartDrawer();
  setTimeout(submitOrder, 150);
}

function removeItem(id) {
  delete cart[id];
  renderMenu();
  renderCart();
}

function generateOrderNumber() {
  // Formato #T + 4 dígitos aleatorios (1000-9999)
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return 'T' + rnd;
}
function buildTicketText(orderNum, name, phone, notes, slotTime) {
  const lines = Object.entries(cart).map(([id, qty]) => {
    const item = MENU.find(m => m.id == id);
    if (!item) { console.error('buildTicketText: producto no encontrado id='+id); return ''; }
    return `${qty}x ${item.name} — ${(item.price * qty).toFixed(2)} €`;
  });
  const custLines = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) { console.error('buildTicketText: producto custom no encontrado menuId='+c.menuId); return ''; }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const details = [...c.sauces, ...c.ingredients].join(', ');
    const extrasStr = [c.extraQueso ? 'Queso' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(' + ');
    return c.qty + 'x ' + item.name + ' [' + details + (extrasStr ? ' + ' + extrasStr : '') + '] — ' + (unitPrice * c.qty).toFixed(2) + ' €';
  });
  const extLines2 = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return `${c.qty}x ${getExtrasItemLabel(c)} — ${(getExtrasItemPrice(c) * c.qty).toFixed(2)} €`;
  });
  const allLines = [...lines, ...custLines, ...extLines2];
  const total = Object.entries(cart).reduce((s,[id,q]) => { const it=MENU.find(m=>m.id==id); return s + (it?it.price*q:0); }, 0)
    + Object.values(custCart).filter(c=>c.qty>0).reduce((s,c) => { const it=MENU.find(m=>m.id==c.menuId); if(!it) return s; const up=it.price+(c.extraQueso?1.00:0)+(c.extraGratinado?0.50:0); return s + up*c.qty; }, 0)
    + Object.values(extrasCart).filter(c=>c.qty>0).reduce((s,c) => s + getExtrasItemPrice(c)*c.qty, 0);
  const now = new Date().toLocaleString('es-ES');

  return `
============================
   DULCE PATATA FOOD
============================
PEDIDO: ${orderNum}
Fecha: ${now}
----------------------------
CLIENTE: ${name}
${phone ? "Tel: " + phone : ""}
----------------------------
PRODUCTOS:
${allLines.join('\n')}
----------------------------
TOTAL: ${total.toFixed(2)} €
  (Pagar en caja)
----------------------------
${slotTime ? "RECOGIDA PATATA: " + slotTime + "h" : ""}
${notes ? "NOTAS: " + notes : "Sin notas"}
============================
  `.trim();
}

// ══════════════════════════════════════════
//  SISTEMA DE TURNOS DE RECOGIDA (DINÁMICO)
// ══════════════════════════════════════════
const SLOT_TURNOS_KEY = 'dpf_slot_turnos';
const SLOT_MAX_KEY    = 'dpf_slot_max';

// Turnos por defecto si no hay nada guardado
const DEFAULT_TURNOS = [
  { start: '19:30', end: '23:30', interval: 30 }
];

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
function getSlotMaxVal() { return getSlotMax(); }

// Genera lista de todos los slots de todos los turnos activos
function getSlots() {
  const turnos = getSlotTurnos();
  const slots = [];
  turnos.forEach(turno => {
    const [sh, sm] = turno.start.split(':').map(Number);
    let [eh, em] = turno.end.split(':').map(Number);
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
      const slot = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
      if (!slots.includes(slot)) slots.push(slot);
      curMins += interval;
      count++;
    }
  });
  slots.sort();
  return slots;
}

// Alias para compatibilidad — ahora SLOT_MAX es dinámico
const SLOT_START_H = 19, SLOT_START_M = 30; // solo para referencia legacy
const SLOT_END_H   = 23, SLOT_END_M   = 30;
let SLOT_MAX = getSlotMax(); // sincronizado con localStorage

// Lee ocupación de slots guardada en localStorage (por día)
// ── Slots: in-memory cache synced from Firebase ──
let _slotsCache = {}; // { slotTime: count }

function getSlotsData() {
  const todayKey = new Date().toISOString().slice(0,10);
  // Si Firebase ha enviado datos de slots, úsalos como fuente de verdad
  if (Object.keys(_slotsCache).length > 0) {
    return { date: todayKey, slots: Object.assign({}, _slotsCache) };
  }
  // Fallback: contar desde pedidos locales
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  const slots = {};
  if (stats && stats.date === todayKey) {
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) slots[s] = (slots[s] || 0) + 1;
    });
  }
  return { date: todayKey, slots };
}

function saveSlotsData(data) {
  _slotsCache = data.slots || {};
  localStorage.setItem(SLOTS_KEY, JSON.stringify(data)); // fallback
}

function getSlotCount(slotTime) {
  // Count from actual orders for accuracy
  const todayKey = new Date().toISOString().slice(0,10);
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (!stats || stats.date !== todayKey) return _slotsCache[slotTime] || 0;
  const slot = slotTime ? slotTime.trim() : slotTime;
  return (stats.orders || []).filter(o => o.slot && o.slot.trim() === slot).length;
}

async function incrementSlot(slotTime) {
  // Update local cache immediately for UI responsiveness
  _slotsCache[slotTime] = (_slotsCache[slotTime] || 0) + 1;
  // Persist to Firebase (atomic increment)
  if (window.fb_incrementSlot) {
    try { await window.fb_incrementSlot(slotTime); } catch(e) { console.warn('Firebase slot error', e); }
  } else {
    saveSlotsData(getSlotsData());
  }
}

async function decrementSlot(slotTime) {
  if (!slotTime) return;
  // Update local cache immediately
  _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
  // Persist to Firebase (atomic decrement)
  if (window.fb_decrementSlot) {
    try { await window.fb_decrementSlot(slotTime); } catch(e) { console.warn('Firebase slot decrement error', e); }
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
  return reg || cust;
}

// ¿El carrito tiene algún producto?
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 ||
    Object.values(custCart).some(c => c.qty > 0) ||
    Object.values(extrasCart).some(c => c.qty > 0);
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
  const [sh, sm] = slotTime.split(':').map(Number);
  // Normalizar al "día de servicio": horas 0-5 se tratan como 24-29
  const SERVICE_DAY_CUTOFF = 6 * 60; // 06:00
  const nowMins  = now.getHours()  * 60 + now.getMinutes();
  const slotMins = sh * 60 + sm;
  const nowAdj  = nowMins  < SERVICE_DAY_CUTOFF ? nowMins  + 1440 : nowMins;
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
    const w = document.getElementById('late-slot-warning');
    if (w) w.style.display = 'none';
    return;
  }

  const slots = getSlots();
  const slotsData = getSlotsData();
  const slotMax = getSlotMax();
  let html = '';
  slots.forEach(slot => {
    const count = slotsData.slots[slot] || 0;
    const full      = count >= slotMax;
    const almostFull = !full && count === slotMax - 1;
    const past  = slotIsPast(slot);
    const disabled = full || past;
    const pct   = Math.min(100, Math.round(count / slotMax * 100));
    const color = full ? '#e74c3c' : almostFull ? '#e74c3c' : pct >= 50 ? '#E8943A' : '#5ECC76';
    const libres = slotMax - count;
    const availableLabel = full
      ? '❌ Completo'
      : past
        ? 'Pasado'
        : almostFull
          ? '⚠️ ¡Solo queda 1!'
          : libres + ' libre' + (libres !== 1 ? 's' : '');
    html += '<button type="button"' +
      ' class="slot-btn ' + (disabled ? 'slot-disabled' : '') + '"' +
      ' id="slotbtn-' + slot.replace(':','-') + '"' +
      ' onclick="' + (disabled ? '' : 'selectSlot(\'' + slot + '\')') + '"' +
      (disabled ? ' disabled' : '') +
      ' title="' + (full ? 'Turno completo' : past ? 'Hora pasada' : count + '/' + slotMax + ' plazas') + '">' +
      '<span style="font-size:15px;font-weight:700">' + slot + '</span>' +
      '<span style="font-size:11px;color:' + (disabled ? '#aaa' : color) + ';font-weight:600">' + availableLabel + '</span>' +
      (almostFull ? '<span style="font-size:10px;color:#c0392b;font-weight:700;margin-top:2px">¡Solo queda 1 pedido disponible en esta franja!</span>' : '') +
      '<div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">' +
      '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:99px;transition:width .3s"></div></div>' +
      '</button>';
  });
  document.getElementById('slot-grid').innerHTML = html;
}

let selectedSlot = null;
function selectSlot(slot) {
  selectedSlot = slot;
  document.getElementById('slot-error').style.display = 'none';
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-selected'));
  const btn = document.getElementById('slotbtn-' + slot.replace(':','-'));
  if (btn) btn.classList.add('slot-selected');

  // Mostrar aviso si el pedido se hace en los últimos 15 min de la franja
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = slot.split(':').map(Number);
  const slotMins = sh * 60 + sm;
  const warning = document.getElementById('late-slot-warning');
  if (warning) {
    warning.style.display = (slotMins - nowMins <= 15) ? 'block' : 'none';
  }
}

async function submitOrder() {
  const name = document.getElementById("customer-name").value.trim();
  if (!name) { alert("Por favor escribe tu nombre"); return; }
  if (Object.keys(cart).length === 0 && Object.values(custCart).filter(c=>c.qty>0).length === 0 && Object.values(extrasCart).filter(c=>c.qty>0).length === 0) { alert("El pedido está vacío"); return; }

  // Validar teléfono
  const phone = document.getElementById("customer-phone").value.trim();
  const phoneClean = phone.replace(/[\s\-().+]/g, '');
  if (!phone) { alert("Por favor escribe tu teléfono"); return; }
  if (!/^\d{9}$/.test(phoneClean)) { alert("El teléfono debe tener exactamente 9 dígitos"); return; }
  // Prefijo válido español: móviles 6/7, fijos 8/9 — excluye 800/900/901/902 y similares
  if (!/^[6789]/.test(phoneClean)) {
    alert("El teléfono no parece válido. Debe empezar por 6, 7, 8 o 9"); return;
  }
  // Excluir numeración especial: 800, 900, 901, 902, 803, 806, 807
  if (/^(800|900|901|902|803|806|807)/.test(phoneClean)) {
    alert("No se admiten números de tarificación especial"); return;
  }
  // Detectar números absurdos: todos iguales, secuencias obvias
  const _absurdos = [
    '000000000','111111111','222222222','333333333','444444444',
    '555555555','666666666','777777777','888888888','999999999',
    '123456789','987654321','600000000','700000000','612345678',
  ];
  if (_absurdos.includes(phoneClean)) {
    alert("El teléfono introducido no parece real. Por favor usa tu número real"); return;
  }
  // Detectar repetición: 7+ dígitos iguales consecutivos (ej. 611111111, 699999999)
  if (/(\d)\1{6,}/.test(phoneClean)) {
    alert("El teléfono introducido no parece real. Por favor usa tu número real"); return;
  }

  // ── Honeypot anti-bots: si el campo oculto está relleno, es un bot
  const hp = document.getElementById('hp-website');
  if (hp && hp.value.trim()) {
    btn.disabled = true;
    btn.textContent = 'Enviando pedido…';
    setTimeout(() => { btn.disabled = false; btn.textContent = 'Confirmar pedido'; }, 2000);
    return;
  }

  // ── Blacklist: teléfono bloqueado
  const blacklist = getBlacklist();
  if (blacklist.includes(phoneClean)) {
    alert('No es posible realizar pedidos desde este número de teléfono.');
    return;
  }

  // Validar slot si aplica
  const needsSlot = cartHasAnyItem() && isSlotHour();
  if (needsSlot && !selectedSlot) {
    document.getElementById('slot-error').style.display = 'block';
    document.getElementById('slot-picker-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  // Revalidar capacidad usando Firebase para evitar race condition entre dispositivos
  if (needsSlot) {
    let liveCount = getSlotCount(selectedSlot); // valor local como fallback
    if (window.fb_getSlotCount) {
      try { liveCount = await window.fb_getSlotCount(selectedSlot); } catch(e) { console.warn('Firebase slot check error', e); }
    }
    if (liveCount >= getSlotMax()) {
      alert(`El turno de las ${selectedSlot} se ha llenado justo ahora. Por favor elige otro.`);
      selectedSlot = null;
      renderSlotPicker();
      return;
    }
  }

  const notes = document.getElementById("customer-notes").value.trim();
  const orderNum = generateOrderNumber();
  const regularTotal = Object.entries(cart).reduce((s,[id,q]) => { const it=MENU.find(m=>m.id==id); return s + (it?it.price*q:0); }, 0);
  const custTotal = Object.values(custCart).filter(c=>c.qty>0).reduce((s,c) => {
    const item = MENU.find(m=>m.id==c.menuId);
    if (!item) { console.error('submitOrder: producto custom no encontrado menuId='+c.menuId); return s; }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + unitPrice * c.qty;
  }, 0);
  const extTotal = Object.values(extrasCart).filter(c=>c.qty>0).reduce((s,c) => s + getExtrasItemPrice(c)*c.qty, 0);
  const subTotal = regularTotal + custTotal + extTotal;
  const feeEnabled = getFeeEnabled();
  const feeAmount  = feeEnabled ? getFeeAmount() : 0;
  const feeLabel   = getFeeLabel();
  const orderTotal = subTotal + feeAmount;
  const regularItems = Object.entries(cart).map(([id,qty]) => {
    const item = MENU.find(m=>m.id==id);
    if (!item) { console.error('submitOrder: producto no encontrado id='+id); return null; }
    return { name: item.name, qty, subtotal: item.price * qty };
  }).filter(Boolean);
  const custItems = Object.values(custCart).filter(c=>c.qty>0).map(c => {
    const item = MENU.find(m=>m.id==c.menuId);
    if (!item) { console.error('submitOrder: producto custom no encontrado menuId='+c.menuId); return null; }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    // Queso Mozzarella siempre al final (puede venir de ingredientes o como extra)
    const ingsWithoutQueso = c.ingredients.filter(i => i !== 'Queso Mozzarella' && i !== '4 Quesos');
    const quesosFromIng = c.ingredients.filter(i => i === 'Queso Mozzarella' || i === '4 Quesos');
    const extras = [...c.sauces, ...ingsWithoutQueso];
    // Añadir quesos al final
    quesosFromIng.forEach(q => extras.push(q));
    if (c.extraQueso) extras.push('Queso Mozzarella +1€');
    if (c.extraGratinado) extras.push('Gratinado +0,50€');
    return { name: item.name, qty: c.qty, subtotal: unitPrice * c.qty, extras };
  }).filter(Boolean);
  const extItems = Object.values(extrasCart).filter(c=>c.qty>0).map(c => {
    return { name: getExtrasItemLabel(c), qty: c.qty, subtotal: getExtrasItemPrice(c) * c.qty };
  });
  const feeItems = feeEnabled ? [{ name: feeLabel, qty: 1, subtotal: feeAmount, isFee: true }] : [];
  const orderItems = [...regularItems, ...custItems, ...extItems, ...feeItems];
  const now = new Date().toLocaleString('es-ES');

  // Datos estructurados del ticket (para impresión HTML)
  const ticketData = {
    orderNum, name, phone, notes,
    slotTime: selectedSlot || null,
    items: orderItems,
    total: orderTotal,
    time: now,
  };
  _lastTicketData = ticketData;

  // Texto plano para el email (se mantiene igual)
  const ticketText = buildTicketText(orderNum, name, phone, notes, selectedSlot);

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Enviando pedido…";

  // ── Enviar por EmailJS ── (fallo no bloquea el pedido)
  if (typeof emailjs !== "undefined") {
    emailjs.init(CONFIG.emailjs_public_key);
    try {
      await emailjs.send(CONFIG.emailjs_service_id, CONFIG.emailjs_template_id, {
        to_email:    CONFIG.store_email,
        order_num:   orderNum,
        customer:    name,
        phone:       phone || "–",
        notes:       notes || "–",
        ticket:      ticketText,
        pickup_time: needsSlot ? selectedSlot : "–",
        total:       orderTotal.toFixed(2) + " €",
      });
    } catch(err) {
      console.error("EmailJS error:", err);
    }
  } else {
    console.warn("EmailJS no cargado — email omitido");
  }
  await showSuccess(orderNum, needsSlot ? selectedSlot : null);
}

// ── Tiempo de modificación de pedido ──
function saveModifyWindow() {
  const v = parseInt(document.getElementById('modify-window-input')?.value || '5');
  const valid = isNaN(v) || v < 1 || v > 60 ? 5 : v;
  localStorage.setItem('dpf_modify_window_mins', valid);
  if (window.fb_saveConfig) {
    try {
      const cfg = JSON.parse(localStorage.getItem('dpf_local_config') || '{}');
      cfg.modifyWindowMins = valid;
      localStorage.setItem('dpf_local_config', JSON.stringify(cfg));
      window.fb_saveConfig(cfg).catch(() => {});
    } catch(e) {}
  }
  showToast('modify-window-toast');
}

function loadModifyWindowInput() {
  const v = localStorage.getItem('dpf_modify_window_mins') || '5';
  const el = document.getElementById('modify-window-input');
  if (el) el.value = v;
}

// ── ANTI-SPAM / BLACKLIST ──────────────────────────────────────────────────
const BLACKLIST_KEY    = 'dpf_blacklist';
const ANTISPAM_KEY     = 'dpf_antispam_cfg';
const PHONE_LOG_KEY    = 'dpf_phone_log'; // registro de pedidos por teléfono (Firebase)

function getBlacklist() {
  try { return JSON.parse(localStorage.getItem(BLACKLIST_KEY) || '[]'); } catch { return []; }
}
function saveBlacklistLocal(list) {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}
function getAntiSpamCfg() {
  try {
    const c = JSON.parse(localStorage.getItem(ANTISPAM_KEY) || '{}');
    return { cooldown: c.cooldown ?? 45, dailyLimit: c.dailyLimit ?? 3 };
  } catch { return { cooldown: 45, dailyLimit: 3 }; }
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
  const cooldown   = parseInt(document.getElementById('cfg-cooldown')?.value  || '45');
  const dailyLimit = parseInt(document.getElementById('cfg-daily-limit')?.value || '3');
  const cfg = { cooldown, dailyLimit };
  localStorage.setItem(ANTISPAM_KEY, JSON.stringify(cfg));
  if (window.fb_saveAntiSpamCfg) await window.fb_saveAntiSpamCfg(cfg).catch(() => {});
  showToast('antispam-toast');
}

// Añadir teléfono a la blacklist
async function addToBlacklist() {
  const input = document.getElementById('blacklist-input');
  if (!input) return;
  const phone = input.value.replace(/[\s\-().+]/g, '').trim();
  if (!/^\d{9}$/.test(phone)) { alert('Introduce un teléfono válido de 9 dígitos'); return; }
  const list = getBlacklist();
  if (list.includes(phone)) { alert('Este número ya está bloqueado'); return; }
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
    el.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:8px 0">Ningún número bloqueado</div>';
    return;
  }
  el.innerHTML = list.map(phone =>
    `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--cream);border:1.5px solid #e74c3c;border-radius:8px;padding:8px 12px">
      <span style="font-size:14px;font-weight:700;color:var(--brown);letter-spacing:.05em">${phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</span>
      <button onclick="removeFromBlacklist('${phone}')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">Desbloquear</button>
    </div>`
  ).join('');
}

// Verificar si un teléfono puede pedir (cooldown + daily limit) — consulta Firebase
function recordOrderStats_BASE(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (stats.date !== todayKey) {
    // Archivar día anterior en historial antes de resetear
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = { date: todayKey, count: 0, total: 0, orders: [] };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  stats.orders.unshift({ num: orderNum, name, total, time: new Date().toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'}), slot: slotTime || null });
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
    try { statsLocal = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { statsLocal = {}; }
    if (statsLocal.date === todayKey && statsLocal.count > 0) _renderDayStats(statsLocal, todayKey);
    return;
  }
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  _renderDayStats(stats, todayKey);
}

function _renderDayStats(stats, todayKey) {
  if (!stats || stats.date !== todayKey) stats = { date: todayKey, count: 0, total: 0, orders: [] };

  document.getElementById('stat-count').textContent = stats.count;
  document.getElementById('stat-total').textContent = stats.total.toFixed(2).replace('.', ',') + ' €';

  const list = document.getElementById('stat-orders-list');
  if (!stats.orders || stats.orders.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px 0">Sin pedidos por ahora</div>';
  } else {
    list.innerHTML = stats.orders.map(o => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--warm);font-size:13px;gap:8px;flex-wrap:wrap">
        <span style="font-weight:700;color:var(--amber-dark)">${o.num}</span>
        <span style="flex:1;color:var(--text)">${o.name}</span>
        ${o.slot ? `<span style="background:var(--amber-light);color:var(--amber-dark);font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px">🕐 ${o.slot}</span>` : ''}
        <span style="color:var(--muted);font-size:12px">${o.time}</span>
        <span style="font-weight:700;color:var(--brown)">${o.total.toFixed(2).replace('.',',')} €</span>
        <button onclick="printOrderFromStats('${o.num}','${o.name}','${o.time}',${o.total},'${o.slot||''}')" style="background:var(--warm);border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:var(--brown)">🖨️</button>
      </div>`).join('');
  }

  // Render admin slot grid
  const adminGrid = document.getElementById('admin-slots-grid');
  if (adminGrid) {
    const slotsData = getSlotsData();
    const slots = getSlots();
    adminGrid.innerHTML = slots.map(slot => {
      const count = slotsData.slots[slot] || 0;
      const full = count >= getSlotMax();
      const color = full ? '#c0392b' : count > 0 ? '#E8943A' : '#5ECC76';
      return `
      <div style="border:1.5px solid ${color}22;border-radius:var(--radius-sm);padding:8px 10px;text-align:center">
        <div style="font-size:14px;font-weight:700;color:var(--brown)">${slot}</div>
        <div style="font-size:20px;font-weight:900;color:${color}">${count}/${getSlotMax()}</div>
        <div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round(count/getSlotMax()*100)}%;background:${color};border-radius:99px"></div>
        </div>
      </div>`;
    }).join('');
  }
}

function resetSlots() {
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(()=>{});
  loadDayStats();
}

async function confirmClearDay() {
  if (!confirm('¿Limpiar todos los pedidos del día?\nEsta acción no se puede deshacer.')) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  // Borrar pedidos y stats del día — local primero
  localStorage.removeItem(STATS_KEY);
  // Borrar en Firebase (fuente de verdad) para que loadLiveOrders no los restaure
  if (window.fb_saveStats) {
    await window.fb_saveStats({ date: todayKey, count: 0, total: 0, orders: [] }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  // Limpiar slots
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(()=>{});
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
    await window.fb_saveStats({ date: todayKey, count: 0, total: 0, orders: [] }).catch(() => {});
  }
  // Limpiar estados de cocina
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});
  loadDayStats();
}

async function showSuccess(orderNum, slotTime) {
  const orderTotal = _lastTicketData ? _lastTicketData.total : 0;
  const name  = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.replace(/[\s\-().+]/g,'').trim();
  const notes = document.getElementById("customer-notes").value.trim();
  // Await so ticket data is saved before admin can print
  await recordOrderStats(orderNum, name, orderTotal, slotTime);

  // Guardar snapshot del pedido para poder modificarlo/cancelarlo
  window._lastOrderData = {
    num: orderNum,
    name, phone, notes,
    total: orderTotal,
    items: _lastTicketData ? [...(_lastTicketData.items || [])] : [],
    slot: slotTime || null,
    cart: JSON.parse(JSON.stringify(cart)),
    custCart: JSON.parse(JSON.stringify(custCart)),
    extrasCart: JSON.parse(JSON.stringify(extrasCart)),
    ts: Date.now()
  };

  // Guardar en localStorage para recuperar si se cierra la pestaña
  try { localStorage.setItem('dpf_active_order', JSON.stringify(window._lastOrderData)); } catch(e) {}

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

  // Resumen de ítems
  const itemsContainer = document.getElementById('success-items-list');
  if (itemsContainer && _lastTicketData && _lastTicketData.items.length) {
    const itemsHTML = _lastTicketData.items.map(it => `
      <div class="success-item-row">
        <span class="success-item-name">${it.name}</span>
        <span class="success-item-qty">×${it.qty}</span>
        <span class="success-item-price">${it.subtotal.toFixed(2).replace('.',',')} €</span>
      </div>`).join('');
    itemsContainer.innerHTML = `
      <div class="success-summary-title">🧾 Resumen del pedido</div>
      ${itemsHTML}
      <div class="success-total-row">
        <span>Total a pagar</span>
        <span>${orderTotal.toFixed(2).replace('.',',')} €</span>
      </div>`;
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
  }

  document.querySelector('.order-panel').style.display = "none";
  document.getElementById("success-screen").style.display = "block";
  document.getElementById("order-num-display").textContent = orderNum;
  // Ocultar FAB en pantalla de éxito
  const fab = document.getElementById('cart-fab');
  if (fab) fab.classList.add('hidden');
  // Arrancar temporizador de modificación (5 minutos)
  _startModifyTimer();
  setTimeout(() => {
    document.getElementById("success-screen").scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  try { localStorage.removeItem('dpf_active_order'); } catch(e) {}
  if (window._modifyTimerInterval) { clearInterval(window._modifyTimerInterval); window._modifyTimerInterval = null; }
  renderMenu();
  renderCart();
}

// ── MODIFICAR / CANCELAR PEDIDO ──────────────────────────────────────────────
const MODIFY_WINDOW_DEFAULT_MS = 5 * 60 * 1000;
function getModifyWindowMs() {
  try {
    const v = parseInt(localStorage.getItem('dpf_modify_window_mins') || '5');
    return (isNaN(v) || v < 1 || v > 60 ? 5 : v) * 60 * 1000;
  } catch(e) { return MODIFY_WINDOW_DEFAULT_MS; }
}

async function cancelarPedidoAdmin(orderNum) {
  if (!confirm(`¿Cancelar el pedido ${orderNum}? Se eliminará de estadísticas y cocina.`)) return;
  await _borrarPedidoDeFirebase(orderNum);
  logActivity(`❌ Pedido ${orderNum} cancelado manualmente desde el panel`);
}

function _startModifyTimer() {
  if (window._modifyTimerInterval) clearInterval(window._modifyTimerInterval);
  const zone   = document.getElementById('order-modify-zone');
  const timerEl = document.getElementById('order-modify-timer');
  const btnMod  = document.getElementById('btn-modificar-pedido');
  const btnCan  = document.getElementById('btn-cancelar-pedido');
  if (!zone || !timerEl) return;

  function _tick() {
    if (!window._lastOrderData) { clearInterval(window._modifyTimerInterval); return; }
    const elapsed = Date.now() - window._lastOrderData.ts;
    const remaining = getModifyWindowMs() - elapsed;
    if (remaining <= 0) {
      clearInterval(window._modifyTimerInterval);
      zone.style.display = 'none';
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `⏱️ Puedes modificar o cancelar tu pedido durante ${mins}:${String(secs).padStart(2,'0')} min`;
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
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">✏️</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px">¿Modificar pedido?</div>
        <div style="font-size:14px;color:#8A6A4E;margin-bottom:20px">Se borrará el pedido actual y podrás rehacerlo con los mismos productos.</div>
        <div style="display:flex;gap:10px">
          <button id="_mod-no"  style="flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">Cancelar</button>
          <button id="_mod-yes" style="flex:1;padding:12px;background:#E8943A;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">Sí, modificar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('_mod-no').onclick  = () => { modal.remove(); resolve(false); };
    document.getElementById('_mod-yes').onclick = () => { modal.remove(); resolve(true); };
  });

  if (!confirmado) return;

  // Borrar pedido actual de Firebase y stats
  await _borrarPedidoDeFirebase(data.num);

  // Restaurar carrito con los productos anteriores
  Object.assign(cart, data.cart);
  Object.keys(data.custCart).forEach(k => { custCart[k] = data.custCart[k]; });
  Object.keys(data.extrasCart).forEach(k => { extrasCart[k] = data.extrasCart[k]; });
  selectedSlot = data.slot;

  // Restaurar datos del cliente
  document.getElementById("customer-name").value  = data.name  || '';
  document.getElementById("customer-phone").value = data.phone || '';
  document.getElementById("customer-notes").value = data.notes || '';

  // Volver al formulario
  document.querySelector('.order-panel').style.display = "block";
  document.getElementById("success-screen").style.display = "none";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Confirmar pedido →";
  window._lastOrderData = null;
  try { localStorage.removeItem('dpf_active_order'); } catch(e) {}
  if (window._modifyTimerInterval) { clearInterval(window._modifyTimerInterval); window._modifyTimerInterval = null; }

  renderMenu();
  renderCart();
  document.querySelector('.order-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function cancelarPedido() {
  const data = window._lastOrderData;
  if (!data) return;

  // iOS Safari bloquea confirm() silenciosamente — usamos modal propio
  const confirmado = await new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:320px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">❌</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#3D1F0D;margin-bottom:8px">¿Cancelar pedido?</div>
        <div style="font-size:14px;color:#8A6A4E;margin-bottom:20px">El pedido ${data.num} se eliminará. Esta acción no se puede deshacer.</div>
        <div style="display:flex;gap:10px">
          <button id="_cancel-no"  style="flex:1;padding:12px;background:#F5E6C8;color:#3D1F0D;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">No, mantener</button>
          <button id="_cancel-yes" style="flex:1;padding:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">Sí, cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('_cancel-no').onclick  = () => { modal.remove(); resolve(false); };
    document.getElementById('_cancel-yes').onclick = () => { modal.remove(); resolve(true); };
  });

  if (!confirmado) return;

  await _borrarPedidoDeFirebase(data.num);
  window._lastOrderData = null;
  try { localStorage.removeItem('dpf_active_order'); } catch(e) {}
  if (window._modifyTimerInterval) { clearInterval(window._modifyTimerInterval); window._modifyTimerInterval = null; }

  const icon  = document.querySelector('#success-screen .success-icon');
  const title = document.querySelector('#success-screen .success-title');
  const sub   = document.querySelector('#success-screen .success-sub');
  if (icon)  icon.textContent  = '❌';
  if (title) title.textContent = 'Pedido cancelado';
  if (sub)   sub.textContent   = 'Tu pedido ha sido eliminado';
  document.getElementById('order-modify-zone').style.display = 'none';
  document.getElementById('success-items-list').innerHTML = '';
}

async function _borrarPedidoDeFirebase(orderNum) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // 1. Marcar como cancelado en memoria, localStorage y Firebase — inmediato
  await setOrderStatus(orderNum, 'cancelado');

  // 2. Borrar de Firebase stats y liberar slot si tenía uno
  let slotToFree = null;
  if (window.fb_getStats && window.fb_saveStats) {
    try {
      const stats = await window.fb_getStats(todayKey);
      if (stats && stats.orders) {
        const pedido = stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
        if (pedido && pedido.slot) slotToFree = pedido.slot;
        stats.orders = stats.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
        stats.count  = Math.max(0, (stats.count || 1) - 1);
        stats.total  = stats.orders.reduce((acc, o) => acc + (o.total || 0), 0);
        await window.fb_saveStats(stats);
      }
    } catch {}
  }

  // 3. Borrar también de localStorage y liberar slot si no lo encontramos en Firebase
  try {
    const local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    if (local.orders) {
      const pedido = local.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum));
      if (pedido && pedido.slot && !slotToFree) slotToFree = pedido.slot;
      local.orders = local.orders.filter(o => _normOrderKey(o.num) !== _normOrderKey(orderNum));
      local.count  = Math.max(0, (local.count || 1) - 1);
      local.total  = local.orders.reduce((acc, o) => acc + (o.total || 0), 0);
      localStorage.setItem(STATS_KEY, JSON.stringify(local));
    }
  } catch {}

  // 4. Liberar el slot si el pedido tenía uno
  if (slotToFree) await decrementSlot(slotToFree);

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
  algusto: { name: 'Patata Al Gusto', price: 6.90, maxSauces: 1, maxIngredients: 6, maxTotal: null,
    subtitle: 'Hasta 1 salsa y hasta 6 ingredientes a elegir' },
  bomba:   { name: 'Patata Bomba 🆕', price: 8.40, maxSauces: null, maxIngredients: null, maxTotal: 9,
    subtitle: 'Hasta 9 ingredientes y/o salsas a elegir' }
};

const CUST_SAUCES = [
  'Ranchera','Brava','BBQ','Ketchup','Mayonesa','Alioli',
  'Salsa Rosa','Salsa de Yogur','Tomate Frito','Queso Philadelphia','Roquefort'
];
const CUST_INGREDIENTS = [
  'Jamón York','Carne Picada','Pollo','Carne Kebab','Atún',
  'Gambas','Tronquitos de Mar','Huevo','Bacon',
  'Queso Mozzarella','4 Quesos',
  'Tomate Natural','Maíz','Aceitunas','Zanahoria',
  'Remolacha','Piña','Cebolla','Champiñón'
];

let custType = null;
let custSelSauces = [];
let custSelIngredients = [];
let custExtraQueso = false;
let custExtraGratinado = false;

function openCustomizer(itemId) {
  custType = itemId === 15 ? 'algusto' : 'bomba';
  custSelSauces = [];
  custSelIngredients = [];
  custExtraQueso = false;
  custExtraGratinado = false;
  const cfg = CUSTOMIZER_CONFIG[custType];
  document.getElementById('cust-title').textContent = cfg.name;
  document.getElementById('cust-subtitle').textContent = cfg.subtitle;
  document.getElementById('cust-price').textContent = cfg.price.toFixed(2).replace('.',',') + ' €';
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

function custSelTotal() { return custSelSauces.length + custSelIngredients.length; }

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
    check.style.background = 'var(--amber)';
    check.style.borderColor = 'var(--amber)';
    check.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) { label.style.borderColor = 'var(--amber)'; label.style.background = 'var(--amber-light)'; }
  } else {
    check.style.background = '#fff';
    check.style.borderColor = 'var(--warm)';
    check.innerHTML = '';
    if (label) { label.style.borderColor = 'var(--warm)'; label.style.background = '#fff'; }
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
    let disabled = !sel && (
      (cfg.maxSauces !== null && custSelSauces.length >= cfg.maxSauces) ||
      (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal)
    );
    return `<button class="chip ${sel?'selected':''} ${disabled?'disabled':''}"
      onclick="toggleCustSauce(this,'${s.replace(/'/g,"&#39;")}')">${s}</button>`;
  }).join('');

  ingsEl.innerHTML = CUST_INGREDIENTS.map(i => {
    const sel = custSelIngredients.includes(i);
    // Ingredientes: bloqueados por maxIngredients (algusto) o maxTotal combinado (bomba)
    let disabled = !sel && (
      (cfg.maxIngredients !== null && custSelIngredients.length >= cfg.maxIngredients) ||
      (cfg.maxTotal !== null && custSelTotal() >= cfg.maxTotal)
    );
    return `<button class="chip ${sel?'selected':''} ${disabled?'disabled':''}"
      onclick="toggleCustIng(this,'${i.replace(/'/g,"&#39;")}')">${i}</button>`;
  }).join('');
}

function toggleCustSauce(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelSauces.indexOf(name);
  if (idx >= 0) custSelSauces.splice(idx, 1); else custSelSauces.push(name);
  renderCustChips(); updateCustProgress();
}

function toggleCustIng(el, name) {
  if (el.classList.contains('disabled')) return;
  const idx = custSelIngredients.indexOf(name);
  if (idx >= 0) custSelIngredients.splice(idx, 1); else custSelIngredients.push(name);
  renderCustChips(); updateCustProgress();
}

function updateCustProgress() {
  const cfg = CUSTOMIZER_CONFIG[custType];
  const ns = custSelSauces.length, ni = custSelIngredients.length, total = ns + ni;

  const sauceProg = document.getElementById('cust-sauce-progress');

  if (cfg.maxTotal !== null) {
    // Bomba: una barra de progreso total combinada, ocultar barra de salsas separada
    const pct = Math.min(100, Math.round(total / cfg.maxTotal * 100));
    const cls = pct >= 100 ? 'full' : '';
    if (sauceProg) sauceProg.style.display = 'none';
    document.getElementById('cust-sauce-badge').textContent = ns;
    document.getElementById('cust-ing-label').textContent = 'Total: ' + total + '/' + cfg.maxTotal + ' (salsas: ' + ns + ' · ing: ' + ni + ')';
    document.getElementById('cust-ing-bar').style.width = pct + '%';
    document.getElementById('cust-ing-bar').className = 'progress-bar-fill ' + cls;
    document.getElementById('cust-ing-badge').textContent = total + '/' + cfg.maxTotal;
  } else {
    // Al Gusto: dos barras independientes
    if (sauceProg) sauceProg.style.display = 'flex';
    const pctS = Math.min(100, Math.round(ns / cfg.maxSauces * 100));
    const pctI = Math.min(100, Math.round(ni / cfg.maxIngredients * 100));
    document.getElementById('cust-sauce-label').textContent = 'Salsas: ' + ns + '/' + cfg.maxSauces;
    document.getElementById('cust-sauce-bar').style.width = pctS + '%';
    document.getElementById('cust-sauce-bar').className = 'progress-bar-fill' + (pctS >= 100 ? ' full' : '');
    document.getElementById('cust-sauce-badge').textContent = ns + '/' + cfg.maxSauces;
    document.getElementById('cust-ing-label').textContent = 'Ingredientes: ' + ni + '/' + cfg.maxIngredients;
    document.getElementById('cust-ing-bar').style.width = pctI + '%';
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
  if (isShopBlocked()) { showClosedToast(); closeCustomizer(); return; }
  const cfg = CUSTOMIZER_CONFIG[custType];
  const errEl = document.getElementById('cust-error');
  errEl.style.display = 'none';

  // Validar máximos
  if (cfg.maxTotal !== null && custSelTotal() > cfg.maxTotal) {
    errEl.textContent = 'Máximo ' + cfg.maxTotal + ' ingredientes y/o salsas en total';
    errEl.style.display = 'block'; return;
  }
  if (cfg.maxSauces !== null && custSelSauces.length > cfg.maxSauces) {
    errEl.textContent = 'Máximo ' + cfg.maxSauces + ' salsa';
    errEl.style.display = 'block'; return;
  }
  if (cfg.maxIngredients !== null && custSelIngredients.length > cfg.maxIngredients) {
    errEl.textContent = 'Máximo ' + cfg.maxIngredients + ' ingredientes';
    errEl.style.display = 'block'; return;
  }

  const itemId = custType === 'algusto' ? 15 : 16;
  const fingerprint = [...custSelSauces, '|', ...custSelIngredients, '|', custExtraQueso?'Q':'', custExtraGratinado?'G':''].join(',');
  const cartKey = itemId + '::' + fingerprint;
  if (!custCart[cartKey]) {
    custCart[cartKey] = {
      menuId: itemId, qty: 0,
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
    list.innerHTML = '<div style="font-size:13px;color:var(--muted);text-align:center;padding:10px">Sin turnos configurados</div>';
    return;
  }
  list.innerHTML = turnos.map((t, i) => `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--cream);border:1.5px solid var(--warm);border-radius:var(--radius-sm);padding:10px 12px">
      <span style="font-size:12px;font-weight:700;color:var(--muted);min-width:20px">${i+1}.</span>
      <label style="font-size:12px;color:var(--muted)">Desde</label>
      <input type="time" value="${t.start}" onchange="updateSlotTurno(${i},'start',this.value)"
        style="padding:5px 8px;border:1.5px solid var(--warm);border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text);background:#fff;outline:none">
      <label style="font-size:12px;color:var(--muted)">Hasta</label>
      <input type="time" value="${t.end}" onchange="updateSlotTurno(${i},'end',this.value)"
        style="padding:5px 8px;border:1.5px solid var(--warm);border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text);background:#fff;outline:none">
      <label style="font-size:12px;color:var(--muted)">Cada</label>
      <select onchange="updateSlotTurno(${i},'interval',parseInt(this.value))"
        style="padding:5px 8px;border:1.5px solid var(--warm);border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text);background:#fff;outline:none">
        <option value="15" ${t.interval===15?'selected':''}>15 min</option>
        <option value="20" ${t.interval===20?'selected':''}>20 min</option>
        <option value="30" ${(!t.interval||t.interval===30)?'selected':''}>30 min</option>
        <option value="45" ${t.interval===45?'selected':''}>45 min</option>
        <option value="60" ${t.interval===60?'selected':''}>60 min</option>
      </select>
      <button onclick="removeSlotTurno(${i})"
        style="margin-left:auto;background:#fef0f0;border:1.5px solid #e74c3c;color:#c0392b;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">✕</button>
    </div>`).join('');
}

function _syncSlotTurnos(turnos) {
  localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(turnos));
  const max = getSlotMax();
  if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(turnos, max).catch(e => console.warn('Firebase slotConfig error', e));
}

function addSlotTurno() {
  const turnos = getSlotTurnos();
  turnos.push({ start: '19:30', end: '23:30', interval: 30 });
  _syncSlotTurnos(turnos);
  renderSlotTurnosList(turnos);
}

function removeSlotTurno(idx) {
  const turnos = getSlotTurnos();
  turnos.splice(idx, 1);
  _syncSlotTurnos(turnos);
  renderSlotTurnosList(turnos);
}

function updateSlotTurno(idx, field, value) {
  const turnos = getSlotTurnos();
  turnos[idx][field] = value;
  _syncSlotTurnos(turnos);
}

function saveSlotConfig() {
  const maxInp = document.getElementById('slot-max-input');
  const max = parseInt(maxInp ? maxInp.value : '4', 10);
  if (isNaN(max) || max < 1) { alert('El número de pedidos por turno debe ser al menos 1'); return; }
  localStorage.setItem(SLOT_MAX_KEY, max);
  SLOT_MAX = max;
  const turnos = getSlotTurnos();
  if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(turnos, max).catch(e => console.warn('Firebase slotConfig error', e));
  showToast('slot-config-toast');
  logActivity('🕐 Turnos actualizados — ' + turnos.length + ' franjas · max ' + max + ' pedidos/turno');
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

const EXTRAS_ING_PRECIO1 = [
  'Jamón York','Carne Picada','Pollo','Carne Kebab','Atún','Gambas',
  'Tronquitos de Mar','Huevo','Bacon','Queso Mozzarella','4 Quesos'
];
const EXTRAS_ING_PRECIO07 = [
  'Tomate Natural','Maíz','Aceitunas','Zanahoria','Remolacha',
  'Piña','Cebolla','Champiñón'
];

function openExtrasModal(itemId) {
  _extrasCurrentId = itemId;
  _extrasQueso = false;
  _extrasGratinado = false;
  _extrasIngredientes = {};
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;

  document.getElementById('extras-title').textContent = item.name;
  document.getElementById('extras-base-price').textContent = 'Base: ' + item.price.toFixed(2).replace('.', ',') + ' €';

  const onlySoloGratinado = EXTRAS_SOLO_GRATINADO.has(itemId);
  let optionsHtml = '';

  if (!onlySoloGratinado) {
    optionsHtml += `
      <label style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid var(--warm);border-radius:10px;padding:12px 14px;cursor:pointer;gap:12px" onclick="toggleExtra('queso')">
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--text)">&#x1F9C0; Añadir queso mozzarella</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">+1,00 €</div>
        </div>
        <div id="extra-check-queso" style="width:24px;height:24px;border-radius:50%;border:2px solid var(--warm);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s"></div>
      </label>`;
  }

  optionsHtml += `
    <label style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid var(--warm);border-radius:10px;padding:12px 14px;cursor:pointer;gap:12px" onclick="toggleExtra('gratinado')">
      <div>
        <div style="font-weight:700;font-size:15px;color:var(--text)">&#x1F525; Gratinar${onlySoloGratinado ? '' : ' (con queso)'}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">+0,50 €${onlySoloGratinado ? '' : ' · incluye gratinado del queso'}</div>
      </div>
      <div id="extra-check-gratinado" style="width:24px;height:24px;border-radius:50%;border:2px solid var(--warm);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s"></div>
    </label>`;

  // Ingredientes extra +1€
  optionsHtml += `<div style="margin-top:14px;margin-bottom:6px;font-size:12px;font-weight:700;color:var(--brown);letter-spacing:.5px">INGREDIENTES EXTRA</div>`;
  optionsHtml += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">`;
  EXTRAS_ING_PRECIO1.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi,'_');
    optionsHtml += `<label id="lbl-${eid}" style="display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--warm);border-radius:9px;padding:9px 10px;cursor:pointer" onclick="toggleExtraIng('${ing.replace(/'/g,"\'")}')" >
      <div id="${eid}" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--warm);background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s"></div>
      <div><div style="font-size:13px;font-weight:600;color:var(--text)">${ing}</div><div style="font-size:11px;color:var(--muted)">+1,00 €</div></div>
    </label>`;
  });
  optionsHtml += `</div>`;
  // Ingredientes extra +0,70€
  optionsHtml += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">`;
  EXTRAS_ING_PRECIO07.forEach(ing => {
    const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi,'_');
    optionsHtml += `<label id="lbl-${eid}" style="display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--warm);border-radius:9px;padding:9px 10px;cursor:pointer" onclick="toggleExtraIng('${ing.replace(/'/g,"\'")}')" >
      <div id="${eid}" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--warm);background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s"></div>
      <div><div style="font-size:13px;font-weight:600;color:var(--text)">${ing}</div><div style="font-size:11px;color:var(--muted)">+0,70 €</div></div>
    </label>`;
  });
  optionsHtml += `</div>`;

  document.getElementById('extras-options').innerHTML = optionsHtml;
  updateExtrasTotal();

  document.getElementById('extras-modal').style.display = 'flex';
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
  const eid = 'extra-ing-' + ing.replace(/[^a-z0-9]/gi,'_');
  const el = document.getElementById(eid);
  const lbl = document.getElementById('lbl-' + eid);
  const active = _extrasIngredientes[ing];
  if (el) {
    el.style.background = active ? 'var(--amber)' : '#fff';
    el.style.borderColor = active ? 'var(--amber)' : 'var(--warm)';
    el.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  }
  if (lbl) {
    lbl.style.borderColor = active ? 'var(--amber)' : 'var(--warm)';
    lbl.style.background = active ? 'var(--amber-light)' : '#fff';
  }
  updateExtrasTotal();
}

function updateExtraCheckUI(type, active) {
  const el = document.getElementById('extra-check-' + type);
  if (!el) return;
  const label = el.closest('label');
  if (active) {
    el.style.background = 'var(--amber)';
    el.style.borderColor = 'var(--amber)';
    el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (label) { label.style.borderColor = 'var(--amber)'; label.style.background = 'var(--amber-light)'; }
  } else {
    el.style.background = '#fff';
    el.style.borderColor = 'var(--warm)';
    el.innerHTML = '';
    if (label) { label.style.borderColor = 'var(--warm)'; label.style.background = '#fff'; }
  }
}

function updateExtrasTotal() {
  const item = MENU.find(m => m.id == _extrasCurrentId);
  if (!item) return;
  let total = item.price;
  if (_extrasQueso) total += 1.00;
  if (_extrasGratinado) total += 0.50;
  Object.entries(_extrasIngredientes).forEach(([ing, active]) => {
    if (!active) return;
    if (EXTRAS_ING_PRECIO1.includes(ing)) total += 1.00;
    else if (EXTRAS_ING_PRECIO07.includes(ing)) total += 0.70;
  });
  document.getElementById('extras-total-price').textContent = total.toFixed(2).replace('.', ',') + ' €';
}

function closeExtrasModal() {
  document.getElementById('extras-modal').style.display = 'none';
  document.body.style.overflow = '';
  _extrasCurrentId = null;
}

function confirmExtras() {
  if (isShopBlocked()) { showClosedToast(); closeExtrasModal(); return; }
  const itemId = _extrasCurrentId;
  const item = MENU.find(m => m.id == itemId);
  if (!item) return;

  const ingKeys = Object.entries(_extrasIngredientes).filter(([,v])=>v).map(([k])=>k).sort().join('|');
  const fingerprint = ((_extrasQueso ? 'Q' : '') + (_extrasGratinado ? 'G' : '') + (ingKeys ? 'I' + ingKeys : '')) || 'BASE';
  const cartKey = 'ext:' + itemId + ':' + fingerprint;

  if (!extrasCart[cartKey]) {
    extrasCart[cartKey] = {
      menuId: itemId,
      qty: 0,
      queso: _extrasQueso,
      gratinado: _extrasGratinado,
      ingredientesExtra: Object.entries(_extrasIngredientes).filter(([,v])=>v).map(([k])=>k),
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
    if (EXTRAS_ING_PRECIO1.includes(ing)) p += 1.00;
    else if (EXTRAS_ING_PRECIO07.includes(ing)) p += 0.70;
  });
  return p;
}

function getExtrasItemLabel(c) {
  const item = MENU.find(m => m.id == c.menuId);
  if (!item) { console.error('getExtrasItemLabel: producto no encontrado menuId='+c.menuId); return 'Producto desconocido'; }
  if (c.cheddarCarne) return item.name + ' (' + c.cheddarCarne + ')';
  const extras = [];
  if (c.queso) extras.push('Queso');
  if (c.gratinado) extras.push('Gratinado');
  (c.ingredientesExtra || []).forEach(ing => extras.push(ing));
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
  ['picada','kebab'].forEach(opt => {
    const check = document.getElementById('cheddar-check-' + opt);
    const label = document.getElementById('cheddar-opt-' + opt);
    if (check) { check.style.background='#fff'; check.style.borderColor='var(--warm)'; check.innerHTML=''; }
    if (label) { label.style.borderColor='var(--warm)'; label.style.background='#fff'; }
  });
  document.getElementById('cheddar-error').style.display = 'none';
  document.getElementById('cheddar-modal').style.display = 'flex';
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
  ['picada','kebab'].forEach(o => {
    const check = document.getElementById('cheddar-check-' + o);
    const label = document.getElementById('cheddar-opt-' + o);
    const active = o === opt;
    if (check) {
      check.style.background = active ? 'var(--amber)' : '#fff';
      check.style.borderColor = active ? 'var(--amber)' : 'var(--warm)';
      check.innerHTML = active ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
    }
    if (label) {
      label.style.borderColor = active ? 'var(--amber)' : 'var(--warm)';
      label.style.background = active ? 'var(--amber-light)' : '#fff';
    }
  });
}

function confirmCheddar() {
  if (isShopBlocked()) { showClosedToast(); closeCheddarModal(); return; }
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
  try { return JSON.parse(localStorage.getItem(CAT_BLOCK_KEY) || '[]'); } catch { return []; }
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
    return `<button onclick="toggleCatBlock('${cat}')"
      style="padding:8px 14px;border-radius:99px;border:1.5px solid ${isBlocked ? '#c0392b' : 'var(--warm)'};
      background:${isBlocked ? '#fef0f0' : 'var(--white)'};color:${isBlocked ? '#c0392b' : 'var(--text)'};
      font-size:13px;font-weight:${isBlocked ? '700' : '500'};cursor:pointer;font-family:'DM Sans',sans-serif">
      ${isBlocked ? '🚫' : '✅'} ${cat}
    </button>`;
  }).join('');
}

function toggleCatBlock(cat) {
  const blocked = getBlockedCats();
  const idx = blocked.indexOf(cat);
  if (idx >= 0) blocked.splice(idx, 1);
  else blocked.push(cat);
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
  if (!confirm('¿Cerrar el día? Esto pausará los pedidos, mostrará el resumen y reseteará los turnos.')) return;

  // 1. Pausar pedidos — local + Firebase para que todos los dispositivos se enteren
  localStorage.setItem(OPEN_KEY, 'false');
  localStorage.setItem(ORDERS_KEY, 'false');
  if (window.fb_saveOpenLocal)  window.fb_saveOpenLocal(false).catch(() => {});
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(false).catch(() => {});
  updateOrdersUI(false);

  // 2. Recoger estadísticas del día
  const todayKey = new Date().toISOString().slice(0,10);
  let stats = null;
  if (window.fb_getStats) {
    try { stats = await window.fb_getStats(todayKey); } catch {}
  }
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch {}
  }
  const pedidos = stats?.count || 0;
  const total   = stats?.total?.toFixed(2) || '0.00';
  const topSorted = [];

  // 3. Resetear turnos
  _slotsCache = {};
  localStorage.removeItem(SLOTS_KEY);
  if (window.fb_resetSlots) window.fb_resetSlots().catch(()=>{});

  // 3b. Limpiar estados de cocina (nuevo/preparando) para que no persistan al día siguiente
  window._orderStatusCache = {};
  localStorage.removeItem(ORDER_STATUS_KEY);
  if (window.fb_resetOrderStatuses) window.fb_resetOrderStatuses().catch(() => {});

  // 4. Archivar stats en historial y borrar del día activo en Firebase
  if (stats && stats.count > 0) saveToHistorial(stats);
  if (window.fb_saveStats) {
    window.fb_saveStats({ date: todayKey, count: 0, total: 0, orders: [] }).catch(() => {});
  }
  localStorage.removeItem(STATS_KEY);

  // 5. Mostrar resumen
  const resumenEl = document.getElementById('fin-noche-resumen');
  if (resumenEl) {
    resumenEl.style.display = 'block';
    resumenEl.innerHTML =
      '<div style="font-size:15px;font-weight:900;margin-bottom:8px">📊 Resumen del día ' + todayKey + '</div>' +
      '<div>🧾 Pedidos: <strong>' + pedidos + '</strong></div>' +
      '<div>💶 Total recaudado: <strong>' + total + ' €</strong></div>' +
      (topSorted.length ? '<div style="margin-top:6px">🏆 Top productos:<br>' +
        topSorted.map((e,i) => (i===0?'🥇':i===1?'🥈':'🥉') + ' ' + e[0] + ' (' + e[1] + ')').join('<br>') +
      '</div>' : '') +
      '<div style="margin-top:8px;font-size:11px;opacity:.7">Turnos reseteados · Pedidos pausados · Datos archivados ✅</div>';
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
    if (logSection) { logSection.classList.add('active'); renderActivityLog(); }
  }
}
// Single unified secret key buffer
window._secretKeyBuf = '';
// Acceso por teclado bimba desactivado — usar URL ?bimba=TOKEN
// INIT
initCatBlocks();
initTabs();
renderMenu();
renderCart();

// ═══════════════════════════════════════
//  PANEL DE ADMINISTRACIÓN
// ═══════════════════════════════════════

const ADMIN_PWD_KEY  = 'dpf_admin_pwd';
const MENU_KEY       = 'dpf_menu';
const CONFIG_KEY     = 'dpf_config';
const OPEN_KEY       = 'dpf_open';
const HORARIO_KEY    = 'dpf_horario';

// Hash SHA-256 de la contraseña por defecto: "dulcepatata2024"
// Para generar el hash de otra contraseña, ejecuta en la consola del navegador:
//   hashAdminPwd('TuNuevaContraseña').then(h => console.log(h))
// y pega el resultado en ADMIN_PWD_DEFAULT_HASH
const ADMIN_PWD_DEFAULT_HASH = '53e3e30b4ba11c28d4c0729bcacbd343a0bef168947da71f90a7c0b06322c277';

async function hashAdminPwd(pwd) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pwd));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
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
if (window._pendingMigrateAdmin) { window._pendingMigrateAdmin = false; migrateAdminPwdIfNeeded(); }

// ── DISPOSITIVO DE CONFIANZA ──
// SEGURIDAD: el flag local es solo una preferencia de UX (saltar la pantalla de login).
// La condición real para acceder sin contraseña es que Firebase Auth tenga sesión activa.
// Si alguien manipula localStorage pero no tiene sesión Firebase, no entra.
const TRUSTED_KEY = 'dpf_trusted_device';
const TRUSTED_NAME_KEY = 'dpf_trusted_device_name';
function isTrustedDevice() {
  if (localStorage.getItem(TRUSTED_KEY) !== 'yes') return false;
  // Requiere sesión Firebase activa — sin ella el flag local no sirve de nada
  const user = window.fb && window.fb.getAdminUser ? window.fb.getAdminUser() : null;
  return user !== null && user !== undefined;
}
function getTrustedDeviceName() {
  return localStorage.getItem(TRUSTED_NAME_KEY) || 'Sin nombre';
}
function setTrustedDevice(val, name) {
  if (val) {
    localStorage.setItem(TRUSTED_KEY, 'yes');
    localStorage.setItem(TRUSTED_NAME_KEY, name || 'Sin nombre');
  } else {
    localStorage.removeItem(TRUSTED_KEY);
    localStorage.removeItem(TRUSTED_NAME_KEY);
  }
}

// Audio context — needs user gesture to unlock
let _audioCtxUnlocked = false;
const AUDIO_PREF_KEY = 'dpf_audio_enabled';
function unlockAudioContext() {
  if (_audioCtxUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume().then(() => { _audioCtxUnlocked = true; localStorage.setItem(AUDIO_PREF_KEY, '1'); });
  } catch(e) {}
}

function openAdmin() {
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
  if (isTrustedDevice()) {
    _adminLoggedIn = true;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    logActivity('📱 Acceso automático — dispositivo de confianza');
  } else {
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
  }
  // Mostrar banner de audio solo si no está desbloqueado
  if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
  const audioBanner = document.getElementById('audio-unlock-banner');
  if (audioBanner) audioBanner.style.display = _audioCtxUnlocked ? 'none' : 'flex';
}

// ── ACCESO SECRETO — TRIPLE TOQUE/CLICK EN LOGO ──
(function() {
  let tapCount = 0;
  let tapTimer = null;
  const logo = document.getElementById('logo-secret');
  if (!logo) return;

  function registerTap() {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 900);
    if (tapCount >= 3) {
      tapCount = 0;
      clearTimeout(tapTimer);
      logActivity('📱 Acceso por triple toque en logo');
      openAdmin();
    }
  }

  // touchstart: preventDefault evita zoom Y garantiza que iOS registre el toque
  logo.addEventListener('touchstart', function(e) {
    e.preventDefault();
  }, { passive: false });

  // touchend: aquí contamos el toque
  logo.addEventListener('touchend', function(e) {
    e.preventDefault();
    registerTap();
  }, { passive: false });

  // click para PC
  logo.addEventListener('click', function(e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    registerTap();
  });
})();

// ── ACCESO SECRETO — 5 TOQUES EN "PANEL DE ADMINISTRACIÓN" → BIMBA ──
(function() {
  let bimbaCount = 0, bimbaTimer = null;

  function attachBimbaTitle() {
    const el = document.getElementById('admin-title-secret');
    if (!el) return;

    function handleTap(e) {
      e.preventDefault();
      bimbaCount++;
      clearTimeout(bimbaTimer);
      bimbaTimer = setTimeout(() => { bimbaCount = 0; }, 1500);
      if (bimbaCount >= 5) {
        bimbaCount = 0;
        clearTimeout(bimbaTimer);
        logActivity('📱 Acceso bimba por título');
        bimbaLockTap();
      }
    }

    el.addEventListener('touchend', handleTap, { passive: false });
    el.addEventListener('click', function(e) {
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

// ── ACCESO SECRETO — ESQUINAS ──
// Esquina inferior DERECHA: 5 toques → admin
// Esquina inferior IZQUIERDA: 5 toques → bimba
(function() {
  let adminCount = 0, adminTimer = null;
  let bimbaCount = 0, bimbaTimer = null;

  // Zona de toque generosa: 80x80px en cada esquina
  const ZONE = 80;

  function handleCornerTouch(e) {
    const t = e.changedTouches[0];
    const fromRight  = window.innerWidth  - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    const fromLeft   = t.clientX;

    // Esquina inferior DERECHA → admin
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
      adminCount++;
      clearTimeout(adminTimer);
      adminTimer = setTimeout(() => { adminCount = 0; }, 1500);
      if (adminCount >= 5) {
        adminCount = 0;
        clearTimeout(adminTimer);
        logActivity('📱 Acceso por esquina secreta');
        openAdmin();
      }
      return;
    }

    // Esquina inferior IZQUIERDA → ya no se usa para bimba
  }

  // passive:false para poder hacer preventDefault y evitar gestos del sistema iOS
  // También cancelamos touchstart en las esquinas para evitar que iOS salte al inicio
  document.addEventListener('touchstart', function(e) {
    const t = e.touches[0];
    const fromRight  = window.innerWidth  - t.clientX;
    const fromBottom = window.innerHeight - t.clientY;
    // Solo esquina inferior derecha (admin) — solo cancela el toque si es exactamente en la zona
    // passive:true para no bloquear el scroll en todo el documento
    if (fromRight <= ZONE && fromBottom <= ZONE) {
      e.preventDefault();
    }
  }, { passive: true });
  document.addEventListener('touchend', handleCornerTouch, { passive: false });

  // PC: 5 clicks en esquina inferior derecha → admin
  document.addEventListener('click', function(e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    const fromRight  = window.innerWidth  - e.clientX;
    const fromBottom = window.innerHeight - e.clientY;
    if (fromRight > ZONE || fromBottom > ZONE) return;
    adminCount++;
    clearTimeout(adminTimer);
    adminTimer = setTimeout(() => { adminCount = 0; }, 1500);
    if (adminCount >= 5) { adminCount = 0; openAdmin(); }
  });
})();


// ── ACCESO BIMBA POR CANDADO ────────────────────────────────────────────────
// Contraseña almacenada como hash SHA-256 — nunca en texto plano
const BIMBA_PWD_HASH = '84b3b06a9ad46e0cbde25d76822932275bdd7c523095911095a930c68b4dc3f3';

function bimbaLockTap() {
  document.getElementById('bimba-pin-input').value = '';
  document.getElementById('bimba-pin-error').style.display = 'none';
  document.getElementById('bimba-pin-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('bimba-pin-input').focus(), 100);
}

function bimbaLockCerrar() {
  document.getElementById('bimba-pin-modal').style.display = 'none';
}

async function bimbaLockConfirm() {
  const val = document.getElementById('bimba-pin-input').value;
  const hash = await hashAdminPwd(val);
  if (hash === BIMBA_PWD_HASH) {
    document.getElementById('bimba-pin-modal').style.display = 'none';
    logActivity('🔒 Acceso bimba por candado');
    _adminLoggedIn = true;
    openStockConfigSecret();
    document.getElementById('admin-overlay').classList.add('open');
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display  = 'block';
  } else {
    document.getElementById('bimba-pin-error').style.display = 'block';
    document.getElementById('bimba-pin-input').value = '';
    document.getElementById('bimba-pin-input').focus();
  }
}

function toggleAdminPwdVisibility(btn) {
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen   = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display   = 'none';
    eyeClosed.style.display = 'block';
    btn.setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    input.type = 'password';
    eyeOpen.style.display   = 'block';
    eyeClosed.style.display = 'none';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
  }
  input.focus();
}

function closeAdmin() {
  _adminLoggedIn = false;
  // Cerrar sesión Firebase Auth al salir del panel
  // Esto invalida isTrustedDevice() hasta el próximo login real
  if (window.fb_adminLogout) window.fb_adminLogout();
  // Reset eye icon to closed state when closing panel
  const input = document.getElementById('admin-pwd-input');
  const eyeOpen   = document.querySelector('#admin-login .eye-open');
  const eyeClosed = document.querySelector('#admin-login .eye-closed');
  if (input) input.type = 'password';
  if (eyeOpen)   eyeOpen.style.display   = 'block';
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
document.getElementById('admin-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeAdmin();
});

function removeTrustedDevice() {
  const name = getTrustedDeviceName();
  setTrustedDevice(false);
  const banner = document.getElementById('trusted-device-banner');
  if (banner) banner.style.display = 'none';
  logActivity(`🗑️ Dispositivo de confianza eliminado: "${name}"`);
}

function showTrustedBannerIfNeeded() {
  const banner = document.getElementById('trusted-device-banner');
  if (!banner) return;
  if (isTrustedDevice()) {
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
  t.style.display = 'block'; clearTimeout(t._to); t._to = setTimeout(()=>t.style.display='none', 2000);
}
function bimbaCopyAdminUrl() {
  const token = getUrlToken();
  if (!token) { bimbaGenAdminToken(); return; }
  const url = location.origin + location.pathname + '?key=' + token;
  navigator.clipboard.writeText(url).catch(() => { const a = document.createElement('textarea'); a.value = url; document.body.appendChild(a); a.select(); document.execCommand('copy'); document.body.removeChild(a); });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL admin copiada';
  t.style.display = 'block'; clearTimeout(t._to); t._to = setTimeout(()=>t.style.display='none', 2000);
}
function bimbaGenBimbaToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(BIMBA_TOKEN_KEY, token);
  if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(token).catch(() => {});
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '✅ Token bimba generado';
  t.style.display = 'block'; clearTimeout(t._to); t._to = setTimeout(()=>t.style.display='none', 2000);
}
function bimbaCopyBimbaUrl() {
  const token = getBimbaToken();
  if (!token) { bimbaGenBimbaToken(); return; }
  const url = location.origin + location.pathname + '?bimba=' + token;
  navigator.clipboard.writeText(url).catch(() => { const a = document.createElement('textarea'); a.value = url; document.body.appendChild(a); a.select(); document.execCommand('copy'); document.body.removeChild(a); });
  const t = document.getElementById('bimba-url-toast');
  t.textContent = '📋 URL bimba copiada';
  t.style.display = 'block'; clearTimeout(t._to); t._to = setTimeout(()=>t.style.display='none', 2000);
}

function generateUrlToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map(b => b.toString(36)).join('').slice(0, 24);
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
  if (!token) { alert('Primero genera un token'); return; }
  const url = `${location.origin}${location.pathname}?key=${token}`;
  navigator.clipboard.writeText(url).then(() => {
    const t = document.getElementById('url-token-toast');
    if (t) { t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2500); }
  }).catch(() => {
    prompt('Copia esta URL:', url);
  });
}

// ── EXPORTAR / IMPORTAR CONFIGURACIÓN ──────────────────────────────
function exportarConfig() {
  const backup = {
    version: 1,
    fecha: new Date().toISOString(),
    config:       _lsGet(CONFIG_KEY,       {}),
    soundConfig:  _lsGet(SOUND_KEY,        {}),
    autoDelete:   localStorage.getItem(AUTODELETE_KEY) || '0',
    ordersOpen:   localStorage.getItem(ORDERS_KEY)     || 'true',
    ordersMsg:    localStorage.getItem(ORDERS_MSG_KEY) || '',
    openLocal:    localStorage.getItem(OPEN_KEY)       || 'true',
    urlToken:     localStorage.getItem(URL_TOKEN_KEY)  || '',
    bimbaToken:   localStorage.getItem(BIMBA_TOKEN_KEY)|| '',
    stockPwd:     localStorage.getItem(STOCK_PWD_KEY)  || '',
    slotTurnos:   _lsGet(SLOT_TURNOS_KEY,  null),
    slotMax:      localStorage.getItem(SLOT_MAX_KEY)   || '4',
    blockedCats:  _lsGet(CAT_BLOCK_KEY,    []),
    adminPwd:     localStorage.getItem(ADMIN_PWD_KEY)  || '',
    empresa:      localStorage.getItem(EMP_EMPRESA_KEY) || '',
    stockData:    _lsGet(STOCK_DATA_KEY, null),
    cif:          localStorage.getItem(EMP_CIF_KEY)     || '',
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dulcepatata-config-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  logActivity('💾 Configuración exportada');
}

function _lsGet(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch { return def; }
}

function importarConfig(input) {
  const file = input.files[0];
  const errEl = document.getElementById('backup-error');
  if (errEl) errEl.textContent = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.version) throw new Error('Archivo no válido');

      if (backup.config)      { localStorage.setItem(CONFIG_KEY,      JSON.stringify(backup.config));      Object.assign(CONFIG, backup.config); if (window.fb_saveConfig) window.fb_saveConfig(backup.config).catch(()=>{}); }
      if (backup.soundConfig) { localStorage.setItem(SOUND_KEY,       JSON.stringify(backup.soundConfig));  if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(backup.soundConfig).catch(()=>{}); }
      if (backup.autoDelete !== undefined) { localStorage.setItem(AUTODELETE_KEY, backup.autoDelete);       if (window.fb_saveAutoDelete) window.fb_saveAutoDelete(parseInt(backup.autoDelete)||0).catch(()=>{}); }
      if (backup.ordersOpen !== undefined) { localStorage.setItem(ORDERS_KEY,     backup.ordersOpen);       if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(backup.ordersOpen === 'true' || backup.ordersOpen === true).catch(()=>{}); }
      if (backup.ordersMsg)   { localStorage.setItem(ORDERS_MSG_KEY,  backup.ordersMsg);                    if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(backup.ordersMsg).catch(()=>{}); }
      if (backup.openLocal !== undefined) { localStorage.setItem(OPEN_KEY,        backup.openLocal);        if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(backup.openLocal === 'true' || backup.openLocal === true).catch(()=>{}); }
      if (backup.urlToken)    { localStorage.setItem(URL_TOKEN_KEY,   backup.urlToken);                     if (window.fb_saveUrlToken) window.fb_saveUrlToken(backup.urlToken).catch(()=>{}); }
      if (backup.bimbaToken)  { localStorage.setItem(BIMBA_TOKEN_KEY, backup.bimbaToken);                   if (window.fb_saveBimbaToken) window.fb_saveBimbaToken(backup.bimbaToken).catch(()=>{}); }
      if (backup.stockPwd)    { localStorage.setItem(STOCK_PWD_KEY,   backup.stockPwd);                     if (window.fb_saveStockPwd) window.fb_saveStockPwd(backup.stockPwd).catch(()=>{}); }
      if (backup.slotTurnos)  { localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(backup.slotTurnos));   if (window.fb_saveSlotConfig) window.fb_saveSlotConfig(backup.slotTurnos, backup.slotMax||'4').catch(()=>{}); }
      if (backup.slotMax)     { localStorage.setItem(SLOT_MAX_KEY, backup.slotMax); SLOT_MAX = parseInt(backup.slotMax, 10); }
      if (backup.blockedCats) { localStorage.setItem(CAT_BLOCK_KEY,   JSON.stringify(backup.blockedCats));  if (window.fb_saveBlockedCats) window.fb_saveBlockedCats(backup.blockedCats).catch(()=>{}); }
      if (backup.stockData) { localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(backup.stockData)); if (window.fb_saveStockData) window.fb_saveStockData(backup.stockData).catch(()=>{}); }
      if (backup.empresa !== undefined) { localStorage.setItem(EMP_EMPRESA_KEY, backup.empresa); if (window.fb_saveEmpresa) window.fb_saveEmpresa(backup.empresa, backup.cif||'').catch(()=>{}); }
      if (backup.cif !== undefined)     { localStorage.setItem(EMP_CIF_KEY, backup.cif); }
      if (backup.adminPwd && isHex64(backup.adminPwd)) {
        localStorage.setItem(ADMIN_PWD_KEY, backup.adminPwd);
        if (window.fb_saveAdminPwd) window.fb_saveAdminPwd(backup.adminPwd).catch(()=>{});
      }

      // Refrescar UI
      loadAdminConfig();
      loadUrlTokenUI();
      loadOrdersStatus();
      loadOpenStatus();
      renderMenu();
      showToast('backup-toast');
      logActivity('📥 Configuración importada desde archivo');
    } catch(err) {
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
      const url = `${location.origin}${location.pathname}?key=${token}`;
      full.textContent = '🔗 ' + url;
    } else {
      full.textContent = 'Sin token activo';
    }
  }
}


let _adminFailedAttempts = 0;
let _adminLockedUntil = 0;

async function checkAdminPwd() {
  const email = (document.getElementById('admin-email-input')?.value || '').trim();
  const pwd   = document.getElementById('admin-pwd-input').value;

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
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
  document.getElementById('admin-error').textContent = '';

  if (!window.fb_adminLogin) {
    console.log('[fb] checkAdminPwd: fb_adminLogin missing, ready=', window._firebaseAuthReady, 'readyPromise=', !!window._firebaseAuthReadyPromise, 'ensureReady=', !!(window.fb && window.fb.ensureReady));
    if (window.fb && typeof window.fb.ensureReady === 'function') {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      try {
        await Promise.race([
          window.fb.ensureReady(),
          new Promise(function(resolve) { setTimeout(resolve, 6000); })
        ]);
      } catch (err) {
        console.warn('[fb] checkAdminPwd: ensureReady rejected', err);
      }
    } else if (window._firebaseAuthReadyPromise) {
      document.getElementById('admin-error').textContent = 'Firebase Auth está inicializándose. Por favor espera un momento...';
      await Promise.race([
        window._firebaseAuthReadyPromise,
        new Promise(function(resolve) { setTimeout(resolve, 6000); })
      ]);
    }
    if (window.fb_adminLogin) {
      console.log('[fb] checkAdminPwd: fb_adminLogin became available after wait');
      // Reintentar ahora que auth pudo haberse inicializado.
    } else if (window._firebaseAuthReady === false) {
      document.getElementById('admin-error').textContent = 'Firebase Auth aún se está inicializando. Espera unos segundos y vuelve a intentarlo.';
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
      return;
    } else {
      document.getElementById('admin-error').textContent = 'Firebase no se ha inicializado correctamente. Recarga la página y revisa la consola.';
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
      return;
    }
  }

  const result = await window.fb_adminLogin(email, pwd);

  // Registrar intento en Firebase con IP
  (async function() {
    var ip = 'desconocida';
    try {
      var ipRes = await Promise.race([
        fetch('https://api.ipify.org?format=json'),
        new Promise(function(_, rej) { setTimeout(function(){ rej(new Error('timeout')); }, 3000); })
      ]);
      var ipData = await ipRes.json();
      ip = ipData.ip || 'desconocida';
    } catch(e) {}
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
    } catch(e) {
      console.error('[loginLog] error al guardar:', e);
    }
  })();

  if (result.ok) {
    _adminFailedAttempts = 0;
    const trustedChecked = document.getElementById('trusted-device-check')?.checked;
    const trustedName = document.getElementById('trusted-device-name')?.value.trim() || 'Sin nombre';
    if (trustedChecked) setTrustedDevice(true, trustedName);
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderAdminProducts();
    loadAdminConfig();
    loadAdminHorario();
    loadOpenStatus();
    loadOrdersStatus();
    showTrustedBannerIfNeeded();
    if (localStorage.getItem(AUDIO_PREF_KEY) === '1') unlockAudioContext();
    const audioBanner = document.getElementById('audio-unlock-banner');
    if (audioBanner) audioBanner.style.display = _audioCtxUnlocked ? 'none' : 'flex';
    logActivity('🔑 Acceso con Firebase Auth (' + email + ')' + (trustedChecked ? ` — dispositivo registrado como "${trustedName}"` : ''));
  } else {
    _adminFailedAttempts++;
    const errMsg = result.msg || 'Error al iniciar sesión';
    document.getElementById('admin-error').textContent = errMsg;
    console.error('[login] Fallo de autenticación:', errMsg, result);
    logActivity('⛔ Intento de acceso fallido (' + email + '): ' + errMsg);
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
}

// showAdminSection is defined later with full support

// ── PRODUCTOS ──
function getSavedMenu() {
  try { return JSON.parse(localStorage.getItem(MENU_KEY)) || null; } catch { return null; }
}
function saveMenu() {
  const data = { items: MENU, ts: Date.now() };
  localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
  localStorage.setItem(MENU_KEY + '_ts', data.ts);
  // Sync to Firebase so all devices get updated prices
  if (window.fb_saveMenu) window.fb_saveMenu(data).catch(() => {});
}
function loadSavedMenu() {
  const saved = getSavedMenu();
  if (saved) { MENU.length = 0; saved.forEach(i => MENU.push(i)); }
}

function renderAdminProducts() {
  const cats = [...new Set(MENU.map(i => i.cat))];
  let html = '';
  cats.forEach(cat => {
    html += `<p style="font-size:11px;font-weight:700;color:var(--amber-dark);text-transform:uppercase;letter-spacing:1px;margin:16px 0 6px">${cat}</p>`;
    MENU.filter(i => i.cat === cat).forEach(item => {
      const visible = item.hidden ? 'off' : 'on';
      const soldout = item.soldout ? true : false;
      html += `
      <div class="admin-product-row" id="arow-${item.id}"
        ondragover="dragOver(event)" ondrop="dragDrop(event,${item.id})" ondragleave="dragLeave(event)">
        <span class="drag-handle" draggable="true" title="Arrastrar para reordenar"
          ondragstart="dragStart(event,${item.id})">⠿</span>
        <div>
          <div class="aprod-name" style="${soldout ? 'text-decoration:line-through;color:var(--muted)' : ''}">${item.name}</div>
          <div class="aprod-desc">${item.desc}</div>
          ${soldout ? '<span class="soldout-badge">AGOTADO</span>' : ''}
        </div>
        <span style="font-weight:700;color:var(--amber-dark);font-size:13px;white-space:nowrap">${item.price.toFixed(2)} €</span>
        <button class="admin-edit-btn" onclick="toggleEditPanel(${item.id})">✏️ Editar</button>
        <button class="aprod-toggle ${soldout ? 'off' : 'on'}" id="sold-${item.id}" onclick="toggleSoldout(${item.id})" title="${soldout ? 'Agotado' : 'Disponible'}" style="background:${soldout ? '#c0392b' : '#5ECC76'}"></button>
        <button class="aprod-toggle ${visible}" id="tog-${item.id}" onclick="toggleProduct(${item.id})" title="${visible==='on' ? 'Visible' : 'Oculto'}"></button>
      </div>
      <div id="edit-${item.id}" style="display:none;flex-direction:column;gap:8px;background:var(--amber-light);border:1.5px solid var(--amber);border-radius:var(--radius-sm);padding:12px;margin:-4px 0 8px">
        <input type="text" value="${item.name.replace(/"/g,'&quot;')}" id="edit-name-${item.id}" placeholder="Nombre"
          style="padding:8px 10px;border:1.5px solid var(--warm);border-radius:var(--radius-sm);font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:var(--text);width:100%;box-sizing:border-box">
        <input type="text" value="${item.desc.replace(/"/g,'&quot;')}" id="edit-desc-${item.id}" placeholder="Descripción"
          style="padding:8px 10px;border:1.5px solid var(--warm);border-radius:var(--radius-sm);font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:var(--text);width:100%;box-sizing:border-box">
        <input type="number" value="${item.price.toFixed(2)}" id="edit-price-${item.id}" step="0.10" min="0" placeholder="Precio (€)"
          style="padding:8px 10px;border:1.5px solid var(--warm);border-radius:var(--radius-sm);font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:var(--text);width:100%;box-sizing:border-box">
        <div style="display:flex;gap:8px">
          <button class="admin-save-btn" onclick="saveProductEdit(${item.id})" style="flex:1">✅ Guardar</button>
          <button class="admin-save-btn" onclick="confirmDeleteProduct(${item.id},'${item.name.replace(/'/g,"\\'")}')" style="background:#c0392b;flex:1">🗑️ Eliminar</button>
        </div>
      </div>`;
    });
  });
  document.getElementById('admin-product-list').innerHTML = html;
}

function toggleEditPanel(id) {
  const panel = document.getElementById('edit-' + id);
  if (!panel) return;
  const isOpen = panel.style.display === 'flex';
  // Cerrar todos los paneles abiertos
  document.querySelectorAll('[id^="edit-"]').forEach(p => { if (p.tagName === 'DIV') p.style.display = 'none'; });
  if (!isOpen) {
    panel.style.display = 'flex';
    const firstInput = panel.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
}

function saveProductEdit(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  const nameEl  = document.getElementById('edit-name-' + id);
  const descEl  = document.getElementById('edit-desc-' + id);
  const priceEl = document.getElementById('edit-price-' + id);
  if (nameEl && nameEl.value.trim())  item.name  = nameEl.value.trim();
  if (descEl)  item.desc  = descEl.value.trim();
  if (priceEl) item.price = parseFloat(priceEl.value) || item.price;
  saveMenu(); renderMenu(); renderAdminProducts(); showToast('prod-toast');
  logActivity(`✏️ Producto editado: "${item.name}" — ${item.price.toFixed(2)} €`);
}

function updatePrice(id, val) {
  const item = MENU.find(m => m.id == id);
  if (item) { item.price = parseFloat(val) || item.price; saveMenu(); renderMenu(); showToast('prod-toast'); logActivity(`💰 Precio actualizado: "${item.name}" → ${item.price.toFixed(2)} €`); }
}
function updateName(id, val) {
  const item = MENU.find(m => m.id == id);
  if (val.trim() && item) { item.name = val.trim(); saveMenu(); renderMenu(); showToast('prod-toast'); logActivity(`✏️ Nombre actualizado: "${item.name}"`); }
}
function toggleProduct(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.hidden = !item.hidden;
  const btn = document.getElementById('tog-' + id);
  btn.className = 'aprod-toggle ' + (item.hidden ? 'off' : 'on');
  saveMenu(); renderMenu(); showToast('prod-toast');
  logActivity(`👁️ Producto ${item.hidden ? 'ocultado' : 'mostrado'}: "${item.name}"`);
}

function toggleSoldout(id) {
  const item = MENU.find(m => m.id == id);
  if (!item) return;
  item.soldout = !item.soldout;
  saveMenu(); renderMenu(); renderAdminProducts(); showToast('prod-toast');
  logActivity(`🚫 Producto ${item.soldout ? 'marcado agotado' : 'disponible de nuevo'}: "${item.name}"`);
}

// ── CONFIRM MODAL ──
let _confirmCallback = null;
function showConfirm(title, msg, okLabel, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  const okBtn = document.getElementById('confirm-ok-btn');
  okBtn.textContent = okLabel || 'Confirmar';
  _confirmCallback = cb;
  okBtn.onclick = () => { closeConfirm(); if (_confirmCallback) _confirmCallback(); };
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('open');
}

function confirmDeleteProduct(id, name) {
  showConfirm('¿Eliminar producto?', `"${name}" se eliminará de la carta permanentemente.`, '🗑️ Eliminar', () => {
    const idx = MENU.findIndex(m => m.id == id);
    if (idx >= 0) MENU.splice(idx, 1);
    saveMenu(); initTabs(); renderMenu(); renderAdminProducts(); showToast('prod-toast');
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
  if (row) row.style.background = 'var(--amber-light)';
}
function dragLeave(event) {
  const row = event.currentTarget;
  if (row) row.style.background = '';
}
function dragDrop(event, targetId) {
  event.preventDefault();
  const row = event.currentTarget;
  if (row) row.style.background = '';
  if (_dragId === targetId) { _dragId = null; return; }
  const fromIdx = MENU.findIndex(m => m.id == _dragId);
  const toIdx   = MENU.findIndex(m => m.id == targetId);
  if (fromIdx < 0 || toIdx < 0) { _dragId = null; return; }
  const [moved] = MENU.splice(fromIdx, 1);
  MENU.splice(toIdx, 0, moved);
  _dragId = null;
  saveMenu(); renderMenu(); renderAdminProducts(); showToast('prod-toast');
}

// ── BACKUP / RESTORE JSON ──
function exportMenuJSON() {
  const blob = new Blob([JSON.stringify(MENU, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'carta_dulce_patata.json'; a.click();
  URL.revokeObjectURL(url);
}
function importMenuJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data) || !data[0]?.name) { alert('Archivo inválido'); return; }
      showConfirm('¿Importar carta?', `Se reemplazará la carta actual con ${data.length} productos del archivo.`, '⬆️ Importar', () => {
        MENU.length = 0; data.forEach(i => MENU.push(i));
        saveMenu(); initTabs(); renderMenu(); renderAdminProducts(); showToast('prod-toast');
      });
    } catch { alert('Error al leer el archivo JSON'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function addProduct() {
  const name  = document.getElementById('new-name').value.trim();
  const desc  = document.getElementById('new-desc').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  const cat   = document.getElementById('new-cat').value;
  if (!name || !cat || isNaN(price)) { alert('Rellena nombre, categoría y precio'); return; }
  const newId = Math.max(0, ...MENU.map(i => i.id)) + 1;
  MENU.push({ id: newId, cat, name, desc, price });
  saveMenu(); initTabs(); renderMenu(); renderAdminProducts();
  document.getElementById('new-name').value = '';
  document.getElementById('new-desc').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-cat').value = '';
  showToast('prod-toast');
}

// Override renderMenu to respect hidden and soldout flags
// Override renderMenu to respect hidden and soldout flags
function renderMenu() {
  const filtered = (activeCategory === "Todos" ? MENU : MENU.filter(i => i.cat === activeCategory))
    .filter(i => !i.hidden);
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  grid.innerHTML = filtered.map(item => {
    const isCustom = item.id === 15 || item.id === 16;
    const isExtras = (ALL_EXTRAS_IDS && ALL_EXTRAS_IDS.has(item.id)) || item.id === CHEDDAR_ID;
    const qty = isCustom
      ? Object.values(custCart).filter(c => c.menuId === item.id).reduce((s,c) => s + c.qty, 0)
      : isExtras
        ? Object.values(extrasCart).filter(c => c.menuId === item.id).reduce((s,c) => s + c.qty, 0)
        : (cart[item.id] || 0);
    const soldout = item.soldout;
    return `
    <div class="item-card ${qty > 0 ? 'in-cart' : ''} ${soldout ? 'soldout-card' : ''}" id="card-${item.id}" style="${soldout ? 'opacity:.6' : ''}">
      <div class="item-info">
        <div class="item-name" style="${soldout ? 'text-decoration:line-through' : ''}">${item.name}</div>
        <div class="item-desc">${soldout ? '❌ Agotado hoy' : item.desc}</div>
      </div>
      <div class="item-price">${item.price.toFixed(2)} €</div>
      <div class="item-controls">
        ${soldout
          ? `<span style="font-size:12px;color:#c0392b;font-weight:700">AGOTADO</span>`
          : isCustom
            ? `<button class="add-btn" onclick="changeQty(${item.id},+1)" title="Personalizar" style="width:auto;padding:0 12px;border-radius:8px;font-size:13px">✏️ Elegir</button>${qty > 0 ? `<span class="qty-num" style="margin-left:6px">${qty}</span>` : ''}`
            : isExtras
              ? `<button class="add-btn" onclick="changeQty(${item.id},+1)" title="Añadir" style="width:auto;padding:0 12px;border-radius:8px;font-size:13px">+ Añadir</button>${qty > 0 ? `<span class="qty-num" style="margin-left:6px">${qty}</span>` : ''}`
              : qty > 0
                ? `<button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button><span class="qty-num">${qty}</span><button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>`
                : `<button class="add-btn" onclick="changeQty(${item.id}, +1)" title="Añadir">+</button>`
        }
      </div>
    </div>`;
  }).join('');
}

// ── CONFIG ──
function loadAdminConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
    document.getElementById('cfg-pk').value    = c.emailjs_public_key || CONFIG.emailjs_public_key;
    document.getElementById('cfg-svc').value   = c.emailjs_service_id || CONFIG.emailjs_service_id;
    document.getElementById('cfg-tpl').value   = c.emailjs_template_id || CONFIG.emailjs_template_id;
  } catch {}
  if (window.fb_loadConfig) {
    window.fb_loadConfig().then(c => {
      if (!c) return;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
      Object.assign(CONFIG, c);
      try {
        document.getElementById('cfg-email').value = c.store_email || CONFIG.store_email;
        document.getElementById('cfg-pk').value    = c.emailjs_public_key || CONFIG.emailjs_public_key;
        document.getElementById('cfg-svc').value   = c.emailjs_service_id || CONFIG.emailjs_service_id;
        document.getElementById('cfg-tpl').value   = c.emailjs_template_id || CONFIG.emailjs_template_id;
      } catch {}
    }).catch(() => {});
  }
}
function saveConfig() {
  const c = {
    store_email:        document.getElementById('cfg-email').value.trim(),
    emailjs_public_key: document.getElementById('cfg-pk').value.trim(),
    emailjs_service_id: document.getElementById('cfg-svc').value.trim(),
    emailjs_template_id:document.getElementById('cfg-tpl').value.trim(),
  };
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
const DIAS_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
function toggleDia(btn) { btn.classList.toggle('activo'); }
function verDiasGuardados() {
  const NOMBRES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const raw = localStorage.getItem('dpf_horario');
  const el  = document.getElementById('dias-diagnostico');
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
        html += '✅ Días: ' + dias.map(d => NOMBRES[d]+'('+d+')').join(', ') + '<br>';
        html += (dias.includes(hoy) ? '✅' : '❌') + ' Hoy es ' + NOMBRES[hoy] + '(' + hoy + ') → ' + (dias.includes(hoy) ? 'día abierto' : 'día CERRADO') + '<br>';
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const sessions = [
        {label:'Mañanas', open:h.manOpen, close:h.manClose},
        {label:'Tardes',  open:h.tarOpen, close:h.tarClose},
      ].filter(s=>s.open&&s.close);
      if (!sessions.length) {
        html += '⚠️ Sin horario configurado<br>';
      } else {
        sessions.forEach(s => {
          const [oh,om] = s.open.split(':').map(Number);
          const [ch,cm] = s.close.split(':').map(Number);
          const oMin = oh*60+om, cMin = ch*60+cm;
          const dentro = nowMin>=oMin && nowMin<cMin;
          html += (dentro?'✅':'⏰') + ' ' + s.label + ': ' + s.open + '–' + s.close + (dentro?' ← AHORA ABIERTO':'') + '<br>';
        });
        html += '🕐 Hora actual: ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      }
    } catch(e) {
      html = '❌ Error: ' + e.message;
    }
  }
  el.innerHTML = html;
}

function resetDiasMartDom() {
  if (!confirm('¿Resetear los días abiertos a Martes–Domingo y guardar?')) return;
  const raw = localStorage.getItem('dpf_horario');
  let h = {};
  try { h = JSON.parse(raw || '{}'); } catch {}
  h.diasAbiertos = [2,3,4,5,6,0]; // Mar, Mié, Jue, Vie, Sáb, Dom
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
  if (h.manOpen)  document.getElementById('h-man-open').value  = h.manOpen;
  if (h.manClose) document.getElementById('h-man-close').value = h.manClose;
  if (h.tarOpen)  document.getElementById('h-tar-open').value  = h.tarOpen;
  if (h.tarClose) document.getElementById('h-tar-close').value = h.tarClose;
  const closedMsgMidEl   = document.getElementById('h-closed-msg-mid');
  const closedMsgNightEl = document.getElementById('h-closed-msg-night');
  const closedMsgDayEl   = document.getElementById('h-closed-msg-day');
  if (closedMsgMidEl   && h.closedMsgMid)   closedMsgMidEl.value   = h.closedMsgMid;
  if (closedMsgNightEl && h.closedMsgNight) closedMsgNightEl.value = h.closedMsgNight;
  if (closedMsgDayEl   && h.closedMsgDay)   closedMsgDayEl.value   = h.closedMsgDay;
  const diasActivos = h.diasAbiertos && h.diasAbiertos.length ? h.diasAbiertos : [2,3,4,5,6,0];
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
  } catch(e) {}
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
  document.querySelectorAll('.dia-btn.activo').forEach(btn => { diasAbiertos.push(parseInt(btn.dataset.day)); });
  // Si no hay ningún día marcado, conservar los guardados anteriormente o usar Mar-Dom
  if (!diasAbiertos.length) {
    try {
      const prev = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
      diasAbiertos = prev.diasAbiertos && prev.diasAbiertos.length ? prev.diasAbiertos : [2,3,4,5,6,0];
    } catch { diasAbiertos = [2,3,4,5,6,0]; }
  }
  const manOpen  = document.getElementById('h-man-open')  ? document.getElementById('h-man-open').value  : '';
  const manClose = document.getElementById('h-man-close') ? document.getElementById('h-man-close').value : '';
  const tarOpen  = document.getElementById('h-tar-open')  ? document.getElementById('h-tar-open').value  : '';
  const tarClose = document.getElementById('h-tar-close') ? document.getElementById('h-tar-close').value : '';
  const closedMsgMid   = document.getElementById('h-closed-msg-mid')   ? document.getElementById('h-closed-msg-mid').value.trim()   : '';
  const closedMsgNight = document.getElementById('h-closed-msg-night') ? document.getElementById('h-closed-msg-night').value.trim() : '';
  const closedMsgDay   = document.getElementById('h-closed-msg-day')   ? document.getElementById('h-closed-msg-day').value.trim()   : '';
  const h = { manOpen, manClose, tarOpen, tarClose, diasAbiertos, closedMsgMid, closedMsgNight, closedMsgDay };
  localStorage.setItem(HORARIO_KEY, JSON.stringify(h));
  // Guardar también en Firebase para sincronizar con otros dispositivos y cuentas
  if (window.fb_saveHorario) {
    window.fb_saveHorario(h).catch(e => console.warn("Error guardando horario en Firebase:", e));
  }
  updateFooterHorario(h);
  showToast('local-toast');
  logActivity('🕐 Horario actualizado — Días: ' + diasAbiertos.map(d => DIAS_NAMES[d]).join(', '));
}
const DIAS_RANGES = [
  { dias: [1,2,3,4,5,6,0], label: 'Lunes a Domingo' },
  { dias: [2,3,4,5,6,0],   label: 'Martes a Domingo' },
  { dias: [1,2,3,4,5,6],   label: 'Lunes a Sábado' },
  { dias: [2,3,4,5,6],     label: 'Martes a Sábado' },
  { dias: [1,2,3,4,5],     label: 'Lunes a Viernes' },
  { dias: [6,0],           label: 'Sábado y Domingo' },
];
function diasLabel(diasAbiertos) {
  const sorted = [...diasAbiertos].sort((a,b) => a-b);
  const match = DIAS_RANGES.find(r => r.dias.length === sorted.length && r.dias.every(d => sorted.includes(d)));
  if (match) return match.label;
  const DIAS_FULL = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  return diasAbiertos.map(d => DIAS_FULL[d]).join(', ');
}

function updateFooterHorario(h) {
  const footer = document.getElementById('footer-horario');
  if (footer) {
    const diasAbiertos = h.diasAbiertos ?? [2,3,4,5,6,0];
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
  localStorage.setItem(OPEN_KEY, next);
  if (window.fb_saveOpenLocal) window.fb_saveOpenLocal(next).catch(() => {});
  updateOpenBtn(next);
  updateHeroDot(next);
  logActivity(`🏪 Local marcado como: ${next ? 'ABIERTO' : 'CERRADO'}`);
}
function updateOpenBtn(open) {
  const btn = document.getElementById('open-toggle-btn');
  if (!btn) return;
  btn.className = 'open-toggle ' + (open ? 'abierto' : 'cerrado');
  btn.textContent = open ? '✅ Abierto ahora' : '❌ Cerrado ahora';
}
function updateHeroDot(open) {
  const dot  = document.querySelector('.dot');
  const pill = document.querySelector('.hero-pill');
  if (!dot || !pill) return;
  dot.style.background = open ? '#5ECC76' : '#e74c3c';
  pill.querySelector('span') && (pill.querySelector('span').textContent = open ? 'Abierto ahora' : 'Cerrado ahora');
}

// ── AVISO DE CIERRE AUTOMÁTICO ──
function getMinutes(timeStr, isClose) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return null;
  const mins = h * 60 + m;
  // 00:00 como hora de cierre significa medianoche = fin del día (1440 min)
  return (isClose && mins === 0) ? 1440 : mins;
}

function checkAutoCloseWarning() {
  const manualOpen = localStorage.getItem('dpf_open') !== 'false';

  let h;
  try { h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}'); } catch { return; }

  const now    = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Bloquear pedidos si hoy es día cerrado (independientemente del toggle manual)
  const todayDay = now.getDay();
  const diasAbiertos = h.diasAbiertos ?? [2,3,4,5,6,0];
  if (!diasAbiertos.includes(todayDay)) {
    const dot2 = document.querySelector('.dot');
    const statusEl2 = document.getElementById('hero-status-text');
    const existingBanner2 = document.getElementById('closing-soon-banner');
    if (dot2) dot2.style.background = '#e74c3c';
    if (statusEl2) statusEl2.textContent = 'Cerrado hoy';
    if (existingBanner2) existingBanner2.remove();
    // Calcular próximo día abierto con su hora de apertura
    const sessions = [
      { open: h.manOpen, close: h.manClose },
      { open: h.tarOpen, close: h.tarClose },
    ].filter(s => s.open && s.close).sort((a,b) => {
      const [ah,am] = a.open.split(':').map(Number);
      const [bh,bm] = b.open.split(':').map(Number);
      return (ah*60+am) - (bh*60+bm);
    });
    const firstSession = sessions[0];
    let nextDayLabel = 'mañana';
    if (diasAbiertos.length) {
      for (let i = 1; i <= 7; i++) {
        const candidate = (todayDay + i) % 7;
        if (diasAbiertos.includes(candidate)) {
          if (i === 1) nextDayLabel = 'mañana';
          else {
            const nombres = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
            nextDayLabel = 'el ' + nombres[candidate];
          }
          break;
        }
      }
    }
    const closedDayMsg = h.closedMsgDay ||
      (firstSession
        ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + ' a las ' + firstSession.open + '!'
        : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel + '!');
    // Cerrar formulario de pedidos como si estuviera pausado
    const banner = document.getElementById('orders-closed-banner');
    const bannerMsg = document.getElementById('orders-closed-msg');
    const orderForm = document.getElementById('order-form');
    const totalRow = document.getElementById('cart-total-row');
    const lockedMsg = document.getElementById('cart-locked-msg');
    const lockedDetail = document.getElementById('cart-locked-detail');
    if (banner) { banner.style.display = 'block'; }
    if (bannerMsg) bannerMsg.textContent = closedDayMsg;
    if (orderForm) orderForm.style.display = 'none';
    if (totalRow) totalRow.style.display = 'none';
    if (lockedMsg) lockedMsg.style.display = 'block';
    if (lockedDetail) lockedDetail.textContent = closedDayMsg;
    return;
  }

  // Si el toggle manual está cerrado, no seguir con la lógica de horario
  if (!manualOpen) return;

  const sessions = [
    { open: getMinutes(h.manOpen), close: getMinutes(h.manClose, true) },
    { open: getMinutes(h.tarOpen), close: getMinutes(h.tarClose, true) },
  ].filter(s => s.open !== null && s.close !== null);

  const dot      = document.querySelector('.dot');
  const statusEl = document.getElementById('hero-status-text');
  if (!dot || !statusEl) return;

  const existingBanner = document.getElementById('closing-soon-banner');
  const activeSession  = sessions.find(s => nowMin >= s.open && nowMin < s.close);

  if (activeSession) {
    const minsLeft = activeSession.close - nowMin;
    if (minsLeft <= 30) {
      dot.style.background = '#F5A623';
      statusEl.textContent = minsLeft <= 1 ? 'Cerramos ahora' : `Cerramos en ${minsLeft} min`;

      if (!existingBanner) {
        const banner = document.createElement('div');
        banner.id = 'closing-soon-banner';
        banner.style.cssText = 'background:#FFF3CD;border-bottom:2px solid #E8943A;color:#7A4A00;text-align:center;padding:12px 24px;font-size:14px;font-weight:600;font-family:\'DM Sans\',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px';
        banner.innerHTML = '<span style="font-size:18px">⏰</span><span id="closing-banner-text"></span>';
        const ref = document.getElementById('orders-closed-banner');
        ref.parentNode.insertBefore(banner, ref);
      }
      const bt = document.getElementById('closing-banner-text');
      if (bt) bt.textContent = minsLeft <= 1
        ? '¡Cerramos ahora! Último momento para hacer tu pedido.'
        : `Cerramos en ${minsLeft} minuto${minsLeft !== 1 ? 's' : ''}. ¡Date prisa!`;
    } else {
      dot.style.background = '#5ECC76';
      statusEl.textContent = 'Abierto ahora';
      if (existingBanner) existingBanner.remove();
    }
  } else {
    const nextOpen = sessions.filter(s => s.open > nowMin).sort((a,b) => a.open - b.open)[0];
    dot.style.background = '#e74c3c';
    if (nextOpen) {
      const hh = Math.floor(nextOpen.open / 60).toString().padStart(2,'0');
      const mm = (nextOpen.open % 60).toString().padStart(2,'0');
      statusEl.textContent = `Abrimos a las ${hh}:${mm}`;
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
  const n1  = document.getElementById('pwd-new').value;
  const n2  = document.getElementById('pwd-rep').value;
  const err = document.getElementById('pwd-error');
  err.textContent = '';
  const oldHash = await hashAdminPwd(old);
  if (oldHash !== getAdminPwd()) { err.textContent = 'La contraseña actual es incorrecta'; return; }
  if (n1.length < 6) { err.textContent = 'La nueva contraseña debe tener al menos 6 caracteres'; return; }
  if (n1 !== n2) { err.textContent = 'Las contraseñas no coinciden'; return; }
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
const FEE_AMOUNT_KEY  = 'dpf_fee_amount';
const FEE_LABEL_KEY   = 'dpf_fee_label';
function getFeeEnabled() { return localStorage.getItem(FEE_ENABLED_KEY) === 'true'; }
function getFeeAmount()  { return parseFloat(localStorage.getItem(FEE_AMOUNT_KEY) || '0.50'); }
function getFeeLabel()   { return localStorage.getItem(FEE_LABEL_KEY) || 'Gastos de gestión online'; }
function saveFeeConfig(enabled, amount, label) {
  localStorage.setItem(FEE_ENABLED_KEY, enabled ? 'true' : 'false');
  localStorage.setItem(FEE_AMOUNT_KEY, String(amount));
  localStorage.setItem(FEE_LABEL_KEY, label);
  if (window.fb_saveFeeConfig) window.fb_saveFeeConfig(enabled, amount, label).catch(function(){});
  renderCart();
  logActivity((enabled ? '\u2705' : '\u26d4') + ' Gastos de gesti\u00f3n ' + (enabled ? 'activados' : 'desactivados') + ' \u2014 ' + amount.toFixed(2) + '\u20ac');
}
function loadFeeFromFirebase() {
  console.log('[fee] loadFeeFromFirebase called, fb_listenFeeConfig=', typeof window.fb_listenFeeConfig);
  if (!window.fb_listenFeeConfig) { console.warn('[fee] fb_listenFeeConfig no disponible'); return; }
  window.fb_listenFeeConfig(function(cfg) {
    console.log('[fee] listener fired, cfg=', JSON.stringify(cfg));
    if (cfg.enabled !== undefined) localStorage.setItem(FEE_ENABLED_KEY, cfg.enabled ? 'true' : 'false');
    if (cfg.amount  !== undefined) localStorage.setItem(FEE_AMOUNT_KEY, String(cfg.amount));
    if (cfg.label   !== undefined) localStorage.setItem(FEE_LABEL_KEY, cfg.label);
    console.log('[fee] after update: enabled=', localStorage.getItem(FEE_ENABLED_KEY));
    renderCart();
  });
}
const SLOTS_KEY = 'dpf_slots';

function getOrdersOpen() {
  const val = localStorage.getItem(ORDERS_KEY);
  if (val === null || val === undefined) return true; // abierto por defecto
  return val !== 'false';
}

function toggleOrdersAccepting() {
  const next = !getOrdersOpen();
  localStorage.setItem(ORDERS_KEY, next);
  if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(next).catch(() => {});
  updateOrdersUI(next);
  logActivity(`🚦 Pedidos: ${next ? 'ACTIVADOS' : 'PAUSADOS'}`);
}

function savePauseMsg() {
  const msg = document.getElementById('orders-pause-msg').value.trim();
  if (msg) { localStorage.setItem(ORDERS_MSG_KEY, msg); if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg(msg).catch(() => {}); }
  else { localStorage.removeItem(ORDERS_MSG_KEY); if (window.fb_saveOrdersMsg) window.fb_saveOrdersMsg('').catch(() => {}); }
  updateOrdersUI(getOrdersOpen());
  showToast('local-toast');
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
  const amount = parseFloat(document.getElementById('fee-amount-input').value) || 0.50;
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
  const banner     = document.getElementById('orders-closed-banner');
  const bannerMsg  = document.getElementById('orders-closed-msg');
  const orderForm  = document.getElementById('order-form');
  const totalRow   = document.getElementById('cart-total-row');
  const lockedMsg  = document.getElementById('cart-locked-msg');
  const lockedDetail = document.getElementById('cart-locked-detail');

  if (banner)    banner.style.display = open ? 'none' : 'block';
  if (bannerMsg) bannerMsg.textContent = msg;

  if (!open) {
    // Cerrado: ocultar formulario y total, mostrar candado
    if (orderForm)  orderForm.style.display = 'none';
    if (totalRow)   totalRow.style.display  = 'none';
    if (lockedMsg)  lockedMsg.style.display  = 'block';
    if (lockedDetail) lockedDetail.textContent = msg;
  } else {
    // Abierto: ocultar candado, dejar que renderCart decida el resto
    if (lockedMsg) lockedMsg.style.display = 'none';
    renderCart();
  }
}

function isTodayOpen() {
  try {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    // Si no hay horario en localStorage aún (cuenta nueva / otro dispositivo),
    // asumir abierto — Firebase actualizará en cuanto responda
    const diasAbiertos = h.diasAbiertos ?? [2,3,4,5,6,0];
    return diasAbiertos.includes(new Date().getDay());
  } catch { return true; } // en caso de error, asumir abierto
}

function isOutsideHours() {
  try {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    if (!h.manOpen) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const sessions = [
      { open: getMinutes(h.manOpen), close: getMinutes(h.manClose, true) },
      { open: getMinutes(h.tarOpen), close: getMinutes(h.tarClose, true) },
    ].filter(s => s.open !== null && s.close !== null);
    if (!sessions.length) return false;
    return !sessions.some(s => nowMin >= s.open && nowMin < s.close);
  } catch { return false; }
}

function loadOrdersStatus() {
  // Si Firebase está disponible y no hay horario en localStorage, intentar cargarlo primero
  const horarioLocal = localStorage.getItem(HORARIO_KEY);
  if (!horarioLocal && window.fb_loadHorario) {
    window.fb_loadHorario().then(hFb => {
      if (hFb) {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(hFb));
        updateFooterHorario(hFb);
      }
      _ejecutarLoadOrdersStatus();
    }).catch(() => _ejecutarLoadOrdersStatus());
    return;
  }
  _ejecutarLoadOrdersStatus();
}

function _ejecutarLoadOrdersStatus() {
  // Si hoy es día cerrado, bloquear pedidos con mensaje de próxima apertura
  if (!isTodayOpen()) {
    const h2 = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const diasAbiertos2 = h2.diasAbiertos ?? [2,3,4,5,6,0];
    const sessions2 = [
      { open: h2.manOpen, close: h2.manClose },
      { open: h2.tarOpen, close: h2.tarClose },
    ].filter(s => s.open && s.close).sort((a,b) => {
      const [ah,am] = a.open.split(':').map(Number);
      const [bh,bm] = b.open.split(':').map(Number);
      return (ah*60+am) - (bh*60+bm);
    });
    const firstSession2 = sessions2[0];
    const todayIdx2 = new Date().getDay();
    let nextDayLabel2 = 'mañana';
    for (let i = 1; i <= 7; i++) {
      const candidate = (todayIdx2 + i) % 7;
      if (diasAbiertos2.includes(candidate)) {
        if (i === 1) nextDayLabel2 = 'mañana';
        else {
          const nombres = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
          nextDayLabel2 = 'el ' + nombres[candidate];
        }
        break;
      }
    }
    const closedMsg2 = h2.closedMsgDay ||
      (firstSession2
        ? 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + ' a las ' + firstSession2.open + '!'
        : 'Hoy estamos cerrados. ¡Volvemos ' + nextDayLabel2 + '!');
    updateOrdersUI(false, closedMsg2);
    return;
  }
  // Si estamos fuera del horario, mostrar cerrado con próxima apertura
  if (isOutsideHours()) {
    const h = JSON.parse(localStorage.getItem(HORARIO_KEY) || '{}');
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const sessions = [
      { open: h.manOpen, close: h.manClose },
      { open: h.tarOpen, close: h.tarClose },
    ].filter(s => s.open && s.close);
    // Buscar la próxima sesión que aún no ha empezado hoy
    let nextOpen = null;
    sessions.forEach(s => {
      const [sh, sm] = s.open.split(':').map(Number);
      const openMins = sh * 60 + sm;
      if (openMins > nowMins) {
        if (!nextOpen || openMins < nextOpen) nextOpen = s.open;
      }
    });
    // Usar mensaje personalizado según el tramo: mediodía (hay sesión más tarde) o nocturno (ya no hay más)
    let msg;
    if (nextOpen) {
      // Hay sesión más tarde hoy → tramo de mediodía
      msg = h.closedMsgMid || 'Ahora estamos cerrados. ¡Volvemos a las ' + nextOpen + '!';
    } else {
      // Ya pasaron todas las sesiones de hoy → cierre nocturno
      const firstSession = sessions.length ? sessions.slice().sort((a,b) => {
        const [ah,am] = a.open.split(':').map(Number);
        const [bh,bm] = b.open.split(':').map(Number);
        return (ah*60+am) - (bh*60+bm);
      })[0] : null;
      let nextDayLabel = 'mañana';
      if (diasAbiertos.length) {
        const todayIdx = now.getDay();
        for (let i = 1; i <= 7; i++) {
          const candidate = (todayIdx + i) % 7;
          if (diasAbiertos.includes(candidate)) {
            if (i === 1) nextDayLabel = 'mañana';
            else {
              const nombres = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
              nextDayLabel = 'el ' + nombres[candidate];
            }
            break;
          }
        }
      }
      msg = h.closedMsgNight ||
        (firstSession
          ? 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + ' a las ' + firstSession.open + '!'
          : 'Hoy ya hemos cerrado. ¡Volvemos ' + nextDayLabel + '!');
    }
    updateOrdersUI(false, msg);
    return;
  }
  // Estamos en día y hora de apertura — resetear el toggle manual automáticamente
  // para que "fin de noche" de ayer no bloquee hoy
  localStorage.setItem(OPEN_KEY, 'true');
  localStorage.setItem(ORDERS_KEY, 'true');
  const open = getOrdersOpen();
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
  if (digits.length > 6) formatted = digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6);
  else if (digits.length > 3) formatted = digits.slice(0,3) + ' ' + digits.slice(3);
  input.value = formatted;
}

// ── HISTORIAL (últimos 30 días) ──
const HISTORIAL_KEY = 'dpf_historial';

function getHistorial() {
  try { return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]'); } catch { return []; }
}

function saveToHistorial(dayStats) {
  if (!dayStats || !dayStats.date || !dayStats.count) return;
  let hist = getHistorial();
  // Actualiza o inserta el día
  const idx = hist.findIndex(d => d.date === dayStats.date);
  if (idx >= 0) hist[idx] = dayStats;
  else hist.unshift(dayStats);
  // Máximo 30 días
  hist = hist.slice(0, 30);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
}

// ══════════════════════════════════════════════
//  ACCESO SECRETO — URL TOKEN
// ══════════════════════════════════════════════
const URL_TOKEN_KEY   = 'dpf_url_token';
const BIMBA_TOKEN_KEY = 'dpf_bimba_token';

function getUrlToken()   { return localStorage.getItem(URL_TOKEN_KEY)   || ''; }
function getBimbaToken() { return localStorage.getItem(BIMBA_TOKEN_KEY) || ''; }

(function checkUrlToken() {
  const params = new URLSearchParams(window.location.search);

  // Token admin normal
  const key = params.get('key');
  if (key) {
    const saved = getUrlToken();
    if (saved && key === saved) {
      setTimeout(() => { logActivity('🔗 Acceso por URL token'); openAdmin(); }, 300);
    }
  }

  // Token bimba — abre directamente el panel secreto sin contraseña
  const bimbaKey = params.get('bimba');
  if (bimbaKey) {
    const saved = getBimbaToken();
    if (saved && bimbaKey === saved) {
      setTimeout(() => {
        logActivity('🔗 Acceso bimba por URL token');
        _adminLoggedIn = true;
        openStockConfigSecret();
        document.getElementById('admin-overlay').classList.add('open');
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display  = 'block';
      }, 300);
    }
  }
})();

// ══════════════════════════════════════════════
//  ACCESO SECRETO — SECUENCIA DE TECLADO
// ══════════════════════════════════════════════
(function setupKeySequence() {
  const SECRET = 'pepa';
  let buffer = '';
  let bufTimer = null;
  document.addEventListener('keypress', function(e) {
    if (document.getElementById('admin-overlay').classList.contains('open')) return;
    buffer += e.key.toLowerCase();
    if (buffer.length > SECRET.length) buffer = buffer.slice(-SECRET.length);
    clearTimeout(bufTimer);
    bufTimer = setTimeout(() => { buffer = ''; }, 1200);
    if (buffer === SECRET) {
      buffer = '';
      logActivity('⌨️ Acceso por secuencia de teclado');
      openAdmin();
    }
  });
})();

window._secretKeyBuf = '';
document.addEventListener('keydown', function(e) {
  if (document.getElementById('stock-overlay')?.style.display === 'block') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key.length === 1) {
    window._secretKeyBuf += e.key.toLowerCase();
    if (window._secretKeyBuf.length > 30) window._secretKeyBuf = window._secretKeyBuf.slice(-30);
    if (window._secretKeyBuf.endsWith('bimba')) { window._secretKeyBuf = ''; openStockConfigSecret(); return; }
    if (document.getElementById('admin-overlay')?.classList.contains('open')) {
      const inp = document.getElementById('log-secret-input');
      if (inp) { inp.value = window._secretKeyBuf.slice(-10); checkLogSecret(inp.value); }
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
  try { return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]'); } catch { return []; }
}

function logActivity(action) {
  const log = getActivityLog();
  const now = new Date();
  const entry = {
    ts: now.toISOString(),
    time: now.toLocaleString('es-ES', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}),
    action
  };
  log.unshift(entry);
  const trimmed = log.slice(0, 200);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmed));
  // Solo guardar en Firebase si hay sesión activa (evita permission_denied en intentos de login)
  if (window.fb_saveActivityLog && window.fb_getAdminUser && window.fb_getAdminUser()) {
    window.fb_saveActivityLog(trimmed).catch(() => {});
  }
}

function renderActivityLog() {
  const log = getActivityLog();
  const el = document.getElementById('activity-log-list');
  if (!el) return;
  if (!log.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Sin actividad registrada</div>';
    return;
  }
  el.innerHTML = log.map(e => `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 10px;background:var(--white);border:1px solid var(--warm);border-radius:var(--radius-sm)">
      <span style="font-size:11px;color:var(--muted);white-space:nowrap;min-width:130px">${e.time}</span>
      <span style="font-size:13px;color:var(--text);flex:1">${e.action}</span>
    </div>`).join('');
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
  if (info) info.textContent = days === 0 ? 'Desactivado' : `✅ Se borrarán entradas con más de ${days} días`;
  logActivity(`⚙️ Auto-borrado historial configurado: ${days === 0 ? 'desactivado' : days + ' días'}`);
}

function applyAutoDelete() {
  const days = getAutoDeleteDays();
  if (!days) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0,10);
  let hist = getHistorial();
  const before = hist.length;
  // Cap de seguridad: nunca más de 365 entradas independientemente del filtro de fecha
  hist = hist.filter(d => d.date >= cutoffStr).slice(0, 365);
  if (hist.length !== before) {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(hist));
  }
}

function loadAutoDeleteUI() {
  const days = getAutoDeleteDays();
  const sel = document.getElementById('autodelete-days');
  if (sel) sel.value = days;
  const info = document.getElementById('autodelete-info');
  if (info) info.textContent = days === 0 ? 'Desactivado' : `Se borran entradas con más de ${days} días`;
}

// ══════════════════════════════════════════════
//  EXPORTAR HISTORIAL CIFRADO (AES-256 via Web Crypto)
// ══════════════════════════════════════════════
function exportHistorialEncrypted() {
  const hist = getHistorial();
  if (!hist.length) { alert('No hay historial para exportar'); return; }
  document.getElementById('encrypt-pwd').value = '';
  document.getElementById('encrypt-pwd2').value = '';
  document.getElementById('encrypt-error').style.display = 'none';
  document.getElementById('encrypt-modal').style.display = 'flex';
}

async function doEncryptExport() {
  const pwd  = document.getElementById('encrypt-pwd').value;
  const pwd2 = document.getElementById('encrypt-pwd2').value;
  const errEl = document.getElementById('encrypt-error');

  if (!pwd || pwd.length < 4) {
    errEl.textContent = 'La contraseña debe tener al menos 4 caracteres'; errEl.style.display = 'block'; return;
  }
  if (pwd !== pwd2) {
    errEl.textContent = 'Las contraseñas no coinciden'; errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';

  try {
    const hist    = getHistorial();
    const json    = JSON.stringify(hist);
    const enc     = new TextEncoder();
    const salt    = crypto.getRandomValues(new Uint8Array(16));
    const iv      = crypto.getRandomValues(new Uint8Array(12));
    const keyMat  = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']);
    const key     = await crypto.subtle.deriveKey(
      { name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' },
      keyMat, { name:'AES-GCM', length:256 }, false, ['encrypt']
    );
    const cipher  = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(json));
    // Empaquetar: "DPF1" + salt(16) + iv(12) + ciphertext
    const header  = enc.encode('DPF1');
    const out     = new Uint8Array(4 + 16 + 12 + cipher.byteLength);
    out.set(header, 0); out.set(salt, 4); out.set(iv, 20); out.set(new Uint8Array(cipher), 32);
    const b64     = btoa(String.fromCharCode(...out));
    const blob    = new Blob([b64], { type:'text/plain' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    const fecha   = new Date().toISOString().slice(0,10);
    a.href = url; a.download = `historial_cifrado_${fecha}.dpf`; a.click();
    URL.revokeObjectURL(url);
    document.getElementById('encrypt-modal').style.display = 'none';
    logActivity('🔐 Historial exportado cifrado');
  } catch(e) {
    errEl.textContent = 'Error al cifrar: ' + e.message; errEl.style.display = 'block';
  }
}

// ── EXPORTAR CSV ──
function exportTodayCSV() {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (!stats.orders || !stats.orders.length) { alert('No hay pedidos hoy'); return; }
  downloadCSV(stats, `pedidos_${todayKey}.csv`);
}

function exportHistorialCSV() {
  const hist = getHistorial();
  if (!hist.length) { alert('No hay historial'); return; }
  let rows = ['Fecha,Num Pedido,Cliente,Hora,Turno,Total (€)'];
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      rows.push(`${day.date},${o.num},"${o.name}",${o.time},${o.slot || ''},${o.total.toFixed(2)}`);
    });
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'historial_pedidos.csv'; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(stats, filename) {
  let rows = ['Num Pedido,Cliente,Hora,Turno,Total (€)'];
  stats.orders.forEach(o => {
    rows.push(`${o.num},"${o.name}",${o.time},${o.slot || ''},${o.total.toFixed(2)}`);
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── MODO IMPRESIÓN TÉRMICA 80mm ──
let currentTicketData = null;

// Genera HTML del ticket optimizado para 80mm
function buildTicketHTML(data) {
  const { orderNum, name, phone, notes, slotTime, items, total, time } = data;
  const sep  = '─'.repeat(32);
  const sep2 = '═'.repeat(32);

  let itemsHTML = items.map(({ name: n, qty, subtotal, extras }) => {
    const right = subtotal.toFixed(2) + ' €';
    const label = qty + 'x ' + n;
    if (extras && extras.length > 0) {
      // Patata bomba / al gusto: nombre + precio en una línea, ingredientes en lista debajo
      const extrasList = extras.map(e => '&nbsp;&nbsp;· ' + e).join('<br>');
      return '<div style="margin-bottom:5px">' +
        '<div style="display:flex;justify-content:space-between;font-weight:bold">' +
          '<span>' + label + '</span>' +
          '<span style="white-space:nowrap;padding-left:4px">' + right + '</span>' +
        '</div>' +
        '<div style="font-size:10px;color:#333;line-height:1.6;margin-top:1px">' + extrasList + '</div>' +
      '</div>';
    } else if (label.length <= 26) {
      return '<div style="display:flex;justify-content:space-between;gap:4px"><span style="flex:1">' + label + '</span><span style="white-space:nowrap;padding-left:4px">' + right + '</span></div>';
    } else {
      return '<div style="margin-bottom:3px"><div style="word-break:break-word;white-space:normal;line-height:1.4">' + label + '</div><div style="text-align:right;font-weight:bold">' + right + '</div></div>';
    }
  }).join('');

  return `
    <div style="text-align:center;margin-bottom:6px">
      <div style="font-size:15px;font-weight:bold;letter-spacing:1px">DULCE PATATA FOOD</div>
      <div style="font-size:10px;color:#555">Carretera de Málaga 111, Granada</div>
      <div style="font-size:10px;color:#555">604 82 31 80</div>
    </div>
    <div style="border-top:1px dashed #000;margin:6px 0"></div>
    <div style="font-size:13px;font-weight:bold;text-align:center;letter-spacing:2px">PEDIDO ${orderNum}</div>
    <div style="font-size:10px;text-align:center;color:#555;margin-bottom:4px">${time}</div>
    <div style="border-top:1px dashed #000;margin:6px 0"></div>
    <div style="font-size:11px"><b>CLIENTE:</b> ${name}</div>
    ${phone ? `<div style="font-size:10px;color:#555">Tel: ${phone}</div>` : ''}
    ${slotTime ? `<div style="font-size:11px;font-weight:bold;margin-top:4px">🕐 RECOGIDA PATATA: ${slotTime}h</div>` : ''}
    <div style="border-top:1px dashed #000;margin:6px 0"></div>
    <div style="font-size:11px">${itemsHTML}</div>
    <div style="border-top:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold">
      <span>TOTAL</span><span>${total.toFixed(2)} \u20ac</span>
    </div>
    <div style="font-size:10px;text-align:center;color:#555;margin-top:2px">Pagar en caja</div>
    ${notes ? `<div style="border-top:1px dashed #000;margin:6px 0"></div><div style="font-size:10px"><b>NOTAS:</b> ${notes}</div>` : ''}
    <div style="border-top:1px dashed #000;margin:8px 0"></div>
    <div style="text-align:center;font-size:10px;color:#555">¡Gracias por tu pedido! 🥔</div>
    <div style="margin-bottom:16px"></div>
  `;
}

function openPrintModal(ticketData) {
  currentTicketData = ticketData;
  const html = buildTicketHTML(ticketData);
  document.getElementById('ticket-html-preview').innerHTML = html;
  document.getElementById('print-modal').style.display = 'flex';
}

function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}

function doPrint() {
  const area = document.getElementById('printable-area');
  if (!currentTicketData) return;
  area.innerHTML = buildTicketHTML(currentTicketData);
  window.print();
  setTimeout(() => { area.innerHTML = ''; }, 1500);
}

function printLastTicket() {
  if (_lastTicketData) openPrintModal(_lastTicketData);
}
let _lastTicketData = null;

async function printOrderFromStats(num, name, time, total, slot) {
  // Try to get items from Firebase stats, fall back to localStorage
  const todayKey = new Date().toISOString().slice(0,10);
  let stats = null;
  if (window.fb_getStats) {
    try { stats = await window.fb_getStats(todayKey); } catch(e) {}
  }
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch {}
  }
  const order = (stats && stats.orders) ? stats.orders.find(o => o.num === num) : null;
  const items = (order && order.items) ? order.items : [];
  const phone = (order && order.phone) ? order.phone : '';
  const notes = (order && order.notes) ? order.notes : '';
  openPrintModal({
    orderNum: num,
    name,
    phone,
    notes,
    slotTime: slot || null,
    items,
    total: parseFloat(total),
    time,
  });
}
async function exportTicketPDFFromStats(num, name, time, total, slot) {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats = null;
  if (window.fb_getStats) {
    try { stats = await window.fb_getStats(todayKey); } catch {}
  }
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch {}
  }
  const order = (stats && stats.orders) ? stats.orders.find(o => o.num === num) : null;
  const items = (order && order.items) ? order.items : [];
  const phone = (order && order.phone) ? order.phone : '';
  const notes = (order && order.notes) ? order.notes : '';
  exportTicketPDF(num, name, time, total, slot, items, phone, notes);
}

function scheduleSlotMidnightReset() {
  const now = new Date();
  const msSinceMidnight = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const msToMidnight = 86400000 - msSinceMidnight;
  setTimeout(() => {
    // Comprobar si los datos de slots son de un día anterior; si no, limpiar
    const data = getSlotsData();
    const todayKey = new Date().toISOString().slice(0,10);
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
    if (window.fb_saveOpenLocal)  window.fb_saveOpenLocal(true).catch(() => {});
    if (window.fb_saveOrdersOpen) window.fb_saveOrdersOpen(true).catch(() => {}); 
    // También archivar el día anterior en historial
    try {
      const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      if (stats.date && stats.date !== todayKey && stats.count > 0) {
        saveToHistorial(stats);
      }
    } catch {}
    // Salida automática: registrar salida a los empleados que olvidaron fichar
    try {
      const ayerKey = new Date(Date.now() - 86400000).toISOString().slice(0,10); // ayer (resta 1 día completo)
      const fich = fichajesLoad();
      const emps = empLoadAll();
      let modified = false;
      emps.forEach(emp => {
        const suyosAyer = fich
          .filter(f => f.empId === emp.id && f.fecha === ayerKey)
          .sort((a,b) => a.hora.localeCompare(b.hora));
        // Si el último fichaje del día es una entrada, registrar salida automática a las 00:00
        if (suyosAyer.length > 0 && suyosAyer[suyosAyer.length-1].tipo === 'entrada') {
          fich.push({ empId: emp.id, fecha: ayerKey, hora: '00:00', tipo: 'salida', auto: true });
          modified = true;
        }
      });
      if (modified) fichajesSave(fich);
    } catch(e) { console.warn('Auto-checkout error', e); }
    scheduleSlotMidnightReset(); // reprogramar para la siguiente medianoche
  }, msToMidnight);
}

// ══════════════════════════════════════════
//  FIREBASE REALTIME LISTENERS
// ══════════════════════════════════════════
function initFirebaseListeners() {
  const todayKey = new Date().toISOString().slice(0, 10);
  console.log('[fee] initFirebaseListeners START, _firebaseReady=', window._firebaseReady);

  // Cargar config de gastos de gestión desde Firebase
  loadFeeFromFirebase();

  // 1. Slots — sync counter across all devices in real time
  if (window.fb_listenSlots) {
    window.fb_listenSlots(slots => {
      _slotsCache = slots || {};
      // Forzar que getSlotsData use _slotsCache en vez de stats locales
      // invalidando la fecha de stats para que no se use como fuente
      try {
        const todayKey = new Date().toISOString().slice(0,10);
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        if (stats && stats.date === todayKey) {
          // Sobrescribir los slots de stats con los de Firebase (fuente de verdad)
          stats._slotsOverride = slots || {};
          localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
      } catch(e) {}
      // Re-render slot picker if visible
      renderSlotPicker();
      // Re-render live orders slots if admin open
      if (document.getElementById('admin-overlay')?.classList.contains('open')) {
        loadLiveOrders();
      }
    });
  }

  // 2. Stats / pedidos — sync orders across all devices
  if (window.fb_listenStats) {
    let _fbLastCount = null;
    window.fb_listenStats(todayKey, stats => {
      if (!stats) return;
      const newCount = stats.count || 0;
      // Update localStorage cache
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      // First call — set baseline, don't alert, but refresh UI
      if (_fbLastCount === null) {
        _fbLastCount = newCount;
        _lastKnownOrderCount = newCount;
        if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadLiveOrders();
        if (document.getElementById('admin-stats')?.classList.contains('active')) loadDayStats();
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
        if (_adminLoggedIn) {
          _alertPendingOrders = diff;
          startAlertLoop();
          const toast = document.getElementById('new-order-toast');
          if (toast) { toast.style.display = 'block'; setTimeout(() => { toast.style.display = 'none'; }, 4000); }
        }
      } else {
        _fbLastCount = newCount;
      }
      // Refresh UI
      if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadLiveOrders();
      if (document.getElementById('admin-stats')?.classList.contains('active')) loadDayStats();
      if (document.getElementById('admin-pedidos')?.classList.contains('active')) {
        loadLiveOrders();
      }
      if (document.getElementById('admin-stats')?.classList.contains('active')) {
        loadDayStats();
      }
    });
  }

  // 3. Order statuses — sync kitchen status across devices
  if (window.fb_listenOrderStatuses) {
    window.fb_listenOrderStatuses(statuses => {
      window._orderStatusCache = statuses || {};
      localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(window._orderStatusCache));
      if (document.getElementById('admin-pedidos')?.classList.contains('active')) {
        loadLiveOrders();
      }
      if (document.getElementById('kitchen-mode')?.classList.contains('open')) {
        refreshKitchenGrid();
      }
    });
  }

  // Load initial order statuses from Firebase
  if (window.fb_getOrderStatuses) {
    window.fb_getOrderStatuses().then(s => {
      window._orderStatusCache = s || {};
    }).catch(() => {
      try { window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}'); } catch {}
    });
  } else {
    try { window._orderStatusCache = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || '{}'); } catch {}
  }

  // Load initial slots: use localStorage immediately, then update from Firebase
  try {
    const lsData = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
    const todayKey = new Date().toISOString().slice(0,10);
    if (lsData.date === todayKey && lsData.slots) {
      _slotsCache = lsData.slots;
      renderSlotPicker(); // render immediately with cached data
    }
  } catch {}
  // Then fetch from Firebase (authoritative)
  if (window.fb_getAllSlots) {
    window.fb_getAllSlots()
      .then(s => {
        _slotsCache = s || {};
        renderSlotPicker();
      })
      .catch(() => {});  // Si falla, el cache local es suficiente
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
      if (!arr || !arr.length) return;
      localStorage.setItem('dpf_empleados', JSON.stringify(arr));
      if (document.getElementById('admin-empleados')?.classList.contains('active')) empRenderAdmin();
    });
  }

  // Fichajes sync — cargar fichajes desde Firebase al iniciar
  if (window.fb_loadFichajes) {
    window.fb_loadFichajes().then(arr => {
      if (arr && arr.length) {
        localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
        if (document.getElementById('admin-empleados')?.classList.contains('active')) empRenderAdmin();
      }
    }).catch(() => {});
  }

  // Categorías bloqueadas sync — sincronizar en tiempo real
  if (window.fb_listenBlockedCats) {
    window.fb_listenBlockedCats(cats => {
      if (!cats) return;
      localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
      // Resetear hidden en todos los items antes de reaplicar categorías bloqueadas
      MENU.forEach(item => { item.hidden = false; });
      initCatBlocks();
      renderMenu();
      if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadCatBlockUI();
    });
  }

  // Slot config sync — sincronizar turnos y max pedidos en tiempo real
  if (window.fb_listenSlotConfig) {
    window.fb_listenSlotConfig(cfg => {
      if (!cfg) return;
      if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
      if (cfg.max)    { localStorage.setItem(SLOT_MAX_KEY, cfg.max); SLOT_MAX = parseInt(cfg.max, 10); }
      renderSlotPicker();
      if (document.getElementById('admin-local')?.classList.contains('active')) loadSlotTurnosUI();
    });
  }

  // Menu prices/names sync across devices
  if (window.fb_listenMenu) {
    window.fb_listenMenu(data => {
      // data can be {items, ts} or plain array (legacy)
      const savedMenu = Array.isArray(data) ? data : (data && data.items ? data.items : null);
      const fbTs = (data && data.ts) ? data.ts : 0;
      const localTs = parseInt(localStorage.getItem(MENU_KEY + '_ts') || '0', 10);
      // Only apply Firebase version if it's newer than local
      if (!savedMenu || !savedMenu.length) return;
      if (fbTs > 0 && fbTs < localTs) return; // local is newer, skip
      // Primero resetear hidden para no acumular flags de runs anteriores
      MENU.forEach(item => { item.hidden = false; });
      savedMenu.forEach(saved => {
        const item = MENU.find(m => m.id == saved.id);
        if (item) {
          if (saved.price !== undefined) item.price = saved.price;
          if (saved.name) item.name = saved.name;
          if (saved.desc !== undefined) item.desc = saved.desc;
          item.hidden = saved.hidden || false;
          item.soldout = saved.soldout || false;
        }
      });
      // Reaplicar categorías bloqueadas encima de los datos de Firebase
      initCatBlocks();
      // Protección: si Firebase ocultaría más del 80% de la carta, ignorar hidden flags
      const hiddenCount = MENU.filter(m => m.hidden).length;
      if (hiddenCount > MENU.length * 0.8) {
        console.warn('[DPF] Firebase menu: demasiados items ocultos, reseteando');
        MENU.forEach(m => { m.hidden = false; });
        localStorage.removeItem(CAT_BLOCK_KEY);
      }
      localStorage.setItem(MENU_KEY, JSON.stringify(MENU));
      if (fbTs > 0) localStorage.setItem(MENU_KEY + '_ts', fbTs);
      renderMenu();
    });
  }
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
window.window._orderStatusCache = window.window._orderStatusCache || {};

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
    try { await window.fb_setOrderStatus(num, status); } catch(e) { console.warn('Firebase status error', e); }
  }
}

// Carga y renderiza los pedidos en vivo.
// Render instantáneo con localStorage, luego actualiza desde Firebase (fuente de verdad).
async function loadLiveOrdersWithLocalFirst() {
  const todayKey = new Date().toISOString().slice(0,10);
  let localStats;
  try { localStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { localStats = {}; }
  // Render inmediato con lo que haya en local
  if (localStats && localStats.date === todayKey) {
    _renderLiveOrders(localStats, todayKey);
  }
  // Luego ir a Firebase (fuente de verdad) y re-renderizar
  await loadLiveOrders();
}

async function loadLiveOrders() {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats;
  // Firebase es la fuente de verdad (tiene todos los pedidos de todos los dispositivos)
  if (window.fb_getStats) {
    try { stats = await window.fb_getStats(todayKey); } catch(e) { console.error('[DPF] fb_getStats error', e); }
    console.log('[DPF] loadLiveOrders: todayKey=', todayKey, 'firebase stats=', stats ? JSON.stringify({date:stats.date, count:stats.count, orders:(stats.orders||[]).length}) : null);
    if (stats) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  // Fallback a localStorage si Firebase falla o no está disponible
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
    console.log('[DPF] loadLiveOrders: usando localStorage, stats=', stats ? JSON.stringify({date:stats.date, count:stats.count, orders:(stats.orders||[]).length}) : null);
  }
  if (!stats || stats.date !== todayKey) {
    console.warn('[DPF] loadLiveOrders: stats.date=', stats && stats.date, 'todayKey=', todayKey, '-> reseteando a vacío');
    stats = { date: todayKey, count: 0, total: 0, orders: [] };
  }
  console.log('[DPF] _renderLiveOrders: orders a pintar=', (stats.orders||[]).length);
  _renderLiveOrders(stats, todayKey);
}

function _renderLiveOrders(stats, todayKey) {

  // Sort by slot time, then by order time for orders without slot
  const orders = (stats.orders || []).slice().sort((a, b) => {
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
    (stats.orders || []).forEach(o => { const s = o.slot ? o.slot.trim() : null; if (s) liveSlotCounts[s] = (liveSlotCounts[s] || 0) + 1; });
    const slots = getSlots();
    liveSlotsGrid.innerHTML = slots.map(slot => {
      const count = liveSlotCounts[slot] || 0;
      const pct   = Math.min(100, Math.round(count/getSlotMax()*100));
      const color = count >= getSlotMax() ? '#c0392b' : count > 0 ? '#E8943A' : '#5ECC76';
      return `<div style="border:1.5px solid ${color}33;border-radius:8px;padding:6px 8px;text-align:center;min-width:72px">
        <div style="font-size:13px;font-weight:700;color:var(--brown)">${slot}</div>
        <div style="font-size:16px;font-weight:900;color:${color}">${count}/${getSlotMax()}</div>
        <div style="height:3px;border-radius:99px;background:#eee;margin-top:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:99px"></div>
        </div>
      </div>`;
    }).join('');
  }

  if (!orders.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Sin pedidos hoy</div>';
    return;
  }

  const activos    = orders.filter(o => getOrderStatus(o.num) !== 'entregado' && getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado');
  const recogidos  = orders.filter(o => getOrderStatus(o.num) === 'entregado' || getOrderStatus(o.num) === 'listo');

  const activosHtml = activos.length ? activos.map(o => {
    const status = getOrderStatus(o.num);
    return `
    <div class="live-order-card" id="live-card-${o.num.replace('#','')}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap">
        <div>
          <span style="font-size:18px;font-weight:900;font-family:'Playfair Display',serif;color:var(--amber-dark)">${o.num}</span>
          <span style="font-size:14px;font-weight:600;color:var(--text);margin-left:8px">${o.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          ${o.slot ? `<span style="background:var(--amber-light);color:var(--brown);font-size:15px;font-weight:900;padding:4px 12px;border-radius:99px;border:1.5px solid var(--amber)">🕐 ${o.slot}</span>` : ''}
          <span style="font-size:12px;color:var(--muted)">${o.time}</span>
          <span id="total-display-${o.num.replace('#','')}" onclick="startEditOrderTotal('${o.num}')" title="Haz clic para editar el precio" style="font-weight:700;color:var(--brown);font-size:13px;cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px">${o.total.toFixed(2).replace('.',',')} €</span>
        </div>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="kbtn" onclick="setLiveStatus('${o.num}','entregado')" style="background:#27855a;color:#fff;border:none;font-weight:700">✅ Entregado</button>
        <button class="kbtn kbtn-delete" onclick="printOrderFromStats('${o.num}','${o.name}','${o.time}',${o.total},'${o.slot||''}')">🖨️ Imprimir</button>
        <button class="kbtn" onclick="cancelarPedidoAdmin('${o.num}')" style="background:#c0392b;color:#fff;border:none">❌ Cancelar</button>
      </div>
    </div>`;
  }).join('') : '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Sin pedidos activos</div>';

  const recogidosHtml = recogidos.length ? recogidos.map(o => `
    <div style="background:#eafaf1;border:1.5px solid #a9dfbf;border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:16px;font-weight:900;color:#27855a">${o.num}</span>
        <span style="font-size:14px;color:var(--text)">${o.name}</span>
        ${o.phone ? `<span style="font-size:12px;color:var(--muted)">📞 ${o.phone}</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:var(--muted)">🕐 ${o.time}</span>
        <span style="font-weight:700;color:#27855a;font-size:14px">${o.total.toFixed(2).replace('.',',')} €</span>
      </div>
    </div>`).join('') : '';

  container.innerHTML = `
    <div style="font-size:12px;font-weight:700;color:var(--brown);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">🔴 Pedidos activos (${activos.length})</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:${recogidos.length ? '20px' : '0'}">
      ${activosHtml}
    </div>
    ${recogidos.length ? `
    <div style="font-size:12px;font-weight:700;color:#27855a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;padding-top:16px;border-top:1.5px solid var(--warm)">✅ Pedidos recogidos (${recogidos.length})</div>
    <div style="display:flex;flex-direction:column;gap:8px">${recogidosHtml}</div>` : ''}
  `;
}

// Sube los pedidos del localStorage de ESTE dispositivo a Firebase fusionando con los que ya existen
async function emergencySyncFromLocal() {
  const todayKey = new Date().toISOString().slice(0,10);
  let local;
  try { local = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { local = {}; }
  if (!local || local.date !== todayKey || !(local.orders||[]).length) {
    alert('Este dispositivo no tiene pedidos de hoy para subir.');
    return;
  }
  if (!confirm('\xc2\xbfSubir ' + local.orders.length + ' pedido(s) de este dispositivo a Firebase?\n\nSe fusionar\xc3\xa1n con los que ya existan, sin borrar nada.')) return;
  try {
    await firebase.database().ref('stats/' + todayKey).transaction(function(current) {
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
  } catch(e) {
    alert('\xe2\x9d\x8c Error al subir: ' + e.message);
  }
}

function setLiveStatus(num, status) {
  setOrderStatus(num, status);
  // Si se acepta un pedido, reducir contador de pendientes
  if (status === 'preparando' || status === 'listo') {
    _alertPendingOrders = Math.max(0, (_alertPendingOrders || 0) - 1);
    if (_alertPendingOrders === 0) stopAlertLoop();
  }
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
  _kitchenInterval = setInterval(() => { refreshKitchenGrid(); updateKitchenClock(); }, 15000);
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
  if (el) el.textContent = new Date().toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'});
}
function refreshKitchenGrid() {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (stats.date !== todayKey) stats = { date: todayKey, count: 0, total: 0, orders: [] };

  const orders = (stats.orders || [])
    .filter(o => getOrderStatus(o.num) !== 'listo' && getOrderStatus(o.num) !== 'cancelado' && getOrderStatus(o.num) !== 'entregado')
    .slice()
    .sort((a, b) => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const toMins = s => { if (!s) return 9999; const p = s.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]); };
      const diffA = Math.abs(toMins(a.slot) - nowMins);
      const diffB = Math.abs(toMins(b.slot) - nowMins);
      if (diffA !== diffB) return diffA - diffB;
      return (a.slot || '99:99').localeCompare(b.slot || '99:99');
    });
  const statuses = getOrderStatuses();
  const grid     = document.getElementById('kitchen-grid');
  if (!grid) return;

  // Slots in kitchen header
  const kSlots = document.getElementById('kitchen-slots');
  if (kSlots) {
    // Count slots directly from active orders (reliable, no Firebase dependency)
    const allOrders = stats.orders || [];
    const slotCounts = {};
    allOrders.forEach(o => { const s = o.slot ? o.slot.trim() : null; if (s) slotCounts[s] = (slotCounts[s] || 0) + 1; });
    const slots = getSlots();
    // Also include slots from orders that don't appear in getSlots() yet
    const allSlots = [...new Set([...slots, ...Object.keys(slotCounts)])].sort();
    kSlots.innerHTML = allSlots.filter(slot => (slotCounts[slot] || 0) > 0 || slots.includes(slot)).map(slot => {
      const count = slotCounts[slot] || 0;
      const color = count >= getSlotMax() ? '#c0392b' : count > 0 ? '#E8943A' : '#555';
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
      const slotTime = new Date(); slotTime.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      minsToSlot = Math.floor((slotTime - nowMs) / 60000);
    }
    const isUrgent = minsToSlot !== null && minsToSlot <= 5 && minsToSlot >= -10;
    const isWarning = minsToSlot !== null && minsToSlot > 5 && minsToSlot <= 10;
    const slotLabel = o.slot ? (minsToSlot <= 0 ? 'Recogida: ya!' : 'Recogida en ' + minsToSlot + ' min') : '';
    const timeColor = isUrgent ? '#e74c3c' : isWarning ? '#E8943A' : '#888';
    const cardStyle = isUrgent ? 'animation:pulse-red 1.2s infinite;' : '';

    const itemsHtml = o.items ? o.items.map(function(it) {
      if (it.extras && it.extras.length > 0) {
        return '<div style="border-left:3px solid #E8943A;padding-left:8px;margin:5px 0">' +
          '<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:4px">' + it.qty + 'x ' + it.name + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
            it.extras.map(function(e) { return '<span style="background:#333;border:1px solid #555;border-radius:4px;padding:3px 8px;font-size:13px;color:#eee">' + e + '</span>'; }).join('') +
          '</div></div>';
      }
      return '<div class="kitchen-item-row">' + it.qty + 'x ' + it.name + '</div>';
    }).join('') : '<div style="font-size:13px;color:#999">Sin detalle</div>';

    const isJustArrived = o.ts && (Date.now() - o.ts) < 30000;
    const newClass = (status === 'nuevo' && isJustArrived) ? ' is-new' : '';
    const btnsHtml = '<div style="display:flex;gap:8px;margin-top:4px">' +
      '<button onclick="setLiveStatus(\'' + o.num + '\',\'entregado\')" style="flex:1;padding:14px;background:#27855a;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:900;cursor:pointer;font-family:\'DM Sans\',sans-serif">✅ Entregado</button>' +
      '<button onclick="cancelarPedidoAdmin(\'' + o.num + '\')" style="padding:14px 16px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:16px;cursor:pointer">❌</button>' +
    '</div>';

    return '<div class="kitchen-card status-' + status + newClass + '" style="' + cardStyle + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' +
        '<div class="kitchen-card-num">' + o.num + (isUrgent ? ' 🔴' : '') + '</div>' +
        (o.slot ? '<span style="background:#E8943A33;color:#E8943A;font-size:20px;font-weight:900;padding:5px 14px;border-radius:99px;border:1.5px solid #E8943A44">🕐 ' + o.slot + '</span>' : '') +
      '</div>' +
      '<div class="kitchen-card-name">' + o.name + '</div>' +
      '<div style="font-size:12px;color:' + timeColor + ';font-weight:700;margin-bottom:6px">' + (o.time ? 'Pedido: ' + o.time : '') + (isUrgent ? ' — URGENTE!' : '') + '</div>' +
      '<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;margin-bottom:4px">' +
        '<div style="font-size:10px;color:#555;font-weight:700;text-transform:uppercase;margin-bottom:6px">PRODUCTOS:</div>' +
        itemsHtml +
      '</div>' +
      '<div class="kitchen-status-btns">' + btnsHtml + '</div>' +
    '</div>';
  }).join('');
}

// ── SONIDO CONFIGURABLE ──
const SOUND_KEY = 'dpf_sound_config';

function getSoundConfig() {
  try { return JSON.parse(localStorage.getItem(SOUND_KEY) || '{}'); } catch { return {}; }
}
function saveSoundConfig() {
  const type   = document.getElementById('sound-type')?.value || 'ding';
  const volume = parseInt(document.getElementById('sound-volume')?.value || '60', 10);
  const cfg = { type, volume };
  localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
  if (window.fb_saveSoundConfig) window.fb_saveSoundConfig(cfg).catch(() => {});
  showToast('local-toast');
  logActivity(`🔔 Sonido configurado: ${type}, volumen ${volume}%`);
}
function loadSoundConfigUI() {
  const cfg = getSoundConfig();
  const sel = document.getElementById('sound-type');
  const vol = document.getElementById('sound-volume');
  const lbl = document.getElementById('sound-volume-label');
  if (sel && cfg.type) sel.value = cfg.type;
  if (vol) { vol.value = cfg.volume ?? 60; if (lbl) lbl.textContent = (cfg.volume ?? 60) + '%'; }
  if (vol) vol.addEventListener('input', () => { if (lbl) lbl.textContent = vol.value + '%'; });
}

function playNotificationSound(typeOverride) {
  const cfg  = getSoundConfig();
  const type = typeOverride || cfg.type || 'ding';
  const vol  = (cfg.volume ?? 90) / 100;
  if (type === 'none') return;
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const patterns = {
      ding:       [{ f:1046, t:0,    d:0.25, v:vol }, { f:1046, t:0.3,  d:0.25, v:vol*0.8 }],
      campana:    [{ f:880,  t:0,    d:0.15, v:vol }, { f:1108, t:0.18, d:0.15, v:vol }, { f:1320, t:0.36, d:0.15, v:vol }, { f:880, t:0.54, d:0.2, v:vol*0.9 }],
      caja:       [{ f:1318, t:0,    d:0.1,  v:vol }, { f:1046, t:0.12, d:0.1,  v:vol }, { f:1318, t:0.24, d:0.1, v:vol }, { f:1046, t:0.36, d:0.1, v:vol }, { f:1318, t:0.48, d:0.15, v:vol }],
      chime:      [{ f:784,  t:0,    d:0.2,  v:vol }, { f:988,  t:0.22, d:0.2,  v:vol }, { f:1175, t:0.44, d:0.2, v:vol }, { f:1568, t:0.66, d:0.3, v:vol }],
      bip:        [{ f:1600, t:0,    d:0.07, v:vol }, { f:1600, t:0.1,  d:0.07, v:vol }, { f:1600, t:0.2,  d:0.07, v:vol }, { f:1600, t:0.3, d:0.07, v:vol }, { f:1600, t:0.4, d:0.1, v:vol }],
      doble:      [{ f:1100, t:0,    d:0.15, v:vol }, { f:1100, t:0.2,  d:0.15, v:vol }, { f:1100, t:0.4,  d:0.15, v:vol }],
      coffeeshop: [{ f:698,  t:0,    d:0.15, v:vol }, { f:880,  t:0.18, d:0.15, v:vol }, { f:1046, t:0.36, d:0.15, v:vol }, { f:1318, t:0.54, d:0.2, v:vol }, { f:1046, t:0.78, d:0.2, v:vol }],
      urgente:    [{ f:1400, t:0,    d:0.1,  v:vol }, { f:800,  t:0.12, d:0.1,  v:vol }, { f:1400, t:0.24, d:0.1, v:vol }, { f:800,  t:0.36, d:0.1, v:vol }, { f:1400, t:0.48, d:0.1, v:vol }, { f:800, t:0.6, d:0.15, v:vol }],
    };
    const waveType = 'square';
    const pattern = patterns[type] || patterns.ding;
    // Calcular duración total del patrón para repetirlo 3 veces con pausa entre repeticiones
    const patternDuration = Math.max(...pattern.map(n => n.t + n.d)) + 0.15;
    const REPEATS = 3;
    for (let rep = 0; rep < REPEATS; rep++) {
      const offset = rep * patternDuration;
      pattern.forEach(({ f, t, d, v }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = f;
        osc.type = waveType;
        gain.gain.setValueAtTime(v, ctx.currentTime + offset + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + t + d);
        osc.start(ctx.currentTime + offset + t);
        osc.stop(ctx.currentTime + offset + t + d + 0.05);
      });
    }
  } catch(e) {}
}
function testNotificationSound() {
  const type = document.getElementById('sound-type')?.value || 'ding';
  const vol  = parseInt(document.getElementById('sound-volume')?.value || '60', 10);
  // Guardar temporalmente para que playNotificationSound lo use
  const prev = getSoundConfig();
  localStorage.setItem(SOUND_KEY, JSON.stringify({ type, volume: vol }));
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
    document.title = `(${newOrderCount}) ${_titleBase}`;
  } else {
    document.title = _titleBase;
  }
}

// ── ALERTA NUEVO PEDIDO ──
let _lastKnownOrderCount = null;
function checkForNewOrders(statsOverride) {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats = statsOverride || null;
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  }
  if (!stats || stats.date !== todayKey) return;
  const count = stats.count || 0;
  if (_lastKnownOrderCount === null) { _lastKnownOrderCount = count; return; }
  console.log('[DPF] checkForNewOrders: count=' + count + ' lastKnown=' + _lastKnownOrderCount + ' adminLoggedIn=' + _adminLoggedIn);
  if (count > _lastKnownOrderCount) {
    const diff = count - _lastKnownOrderCount;
    _lastKnownOrderCount = count;
    _unseenOrders += diff;
    updateTabTitle(_unseenOrders);
    console.log('[DPF] NEW ORDER — calling showNewOrderNotification, diff=' + diff);
    showNewOrderNotification(diff);
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

function startAlertLoop() {
  if (_alertLoopInterval) return; // ya está sonando
  playNotificationSound();
  // Calcular duración del patrón × 3 repeticiones + pausa
  const cfg = getSoundConfig();
  const type = cfg.type || 'ding';
  const patterns = {
    ding:0.7, campana:0.9, caja:0.8, chime:1.1, bip:0.65, doble:0.7, coffeeshop:1.1, urgente:0.9
  };
  const loopDelay = ((patterns[type] || 0.8) * 3 + 0.5) * 1000;
  _alertLoopInterval = setInterval(() => {
    if (_alertPendingOrders > 0) playNotificationSound();
    else stopAlertLoop();
  }, loopDelay);
}

function stopAlertLoop() {
  if (_alertLoopInterval) {
    clearInterval(_alertLoopInterval);
    _alertLoopInterval = null;
  }
}

function showNewOrderNotification(count) {
  console.log('[DPF] showNewOrderNotification: count=' + count + ' adminLoggedIn=' + _adminLoggedIn + ' audioUnlocked=' + _audioCtxUnlocked);
  // Solo sonar si hay sesión de admin activa (no al cliente que hace el pedido)
  if (_adminLoggedIn) {
    _alertPendingOrders = count;
    startAlertLoop();
    const toast = document.getElementById('new-order-toast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }
  }
}

// ── MARCAR TODOS COMO LISTOS (COCINA) ──
function confirmarTodosListos() {
  if (!confirm("Marcar TODOS los pedidos activos como listos?")) return;
  markAllKitchenReady();
}

function markAllKitchenReady() {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (stats.date !== todayKey) return;
  const orders = stats.orders || [];
  if (!orders.length) return;
  const statuses = getOrderStatuses();
  let changed = 0;
  orders.forEach(o => {
    const key = _normOrderKey(o.num);
    if ((statuses[key] || 'nuevo') !== 'listo' && statuses[key] !== 'cancelado' && statuses[key] !== 'entregado') {
      statuses[key] = 'listo';
      changed++;
    }
  });
  if (!changed) return;
  localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(statuses));
  refreshKitchenGrid();
  loadLiveOrders();
  logActivity(`✅ ${changed} pedido${changed !== 1 ? 's' : ''} marcado${changed !== 1 ? 's' : ''} como listo desde cocina`);
}

// Polling de fallback: solo actúa si Firebase no está disponible
// Con Firebase activo los listeners se encargan de todo en tiempo real
setInterval(() => {
  if (window._firebaseReady) return; // Firebase activo → los listeners ya cubren esto
  const adminOpen = document.getElementById('admin-overlay').classList.contains('open');
  const kitchenOpen = document.getElementById('kitchen-mode').classList.contains('open');
  if (!adminOpen && !kitchenOpen) return;
  checkForNewOrders();
  if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadLiveOrders();
  if (kitchenOpen) refreshKitchenGrid();
}, 10000);

// ── HISTORIAL MEJORADO ──
// ── BANNER DEL DÍA ───────────────────────────────────────────────────────────
const BANNER_KEY = 'dpf_banner_dia';

function getBannerDia() {
  try { return JSON.parse(localStorage.getItem(BANNER_KEY) || '{}'); } catch { return {}; }
}

const BANNER_TIPOS = {
  promo:   { bg:'#FFF8EE', border:'#E8943A', iconBg:'#E8943A', labelColor:'#E8943A', titleColor:'#3D1F0D', subColor:'#8A6A4E', label:'Oferta del día',   emoji:'🎉' },
  aviso:   { bg:'#fff3cd', border:'#E8943A', iconBg:'#E8943A', labelColor:'#b36a00', titleColor:'#5a3e1b', subColor:'#8a6530', label:'Aviso importante', emoji:'⚠️' },
  urgente: { bg:'#fdf0ee', border:'#c0392b', iconBg:'#c0392b', labelColor:'#c0392b', titleColor:'#7a1a0e', subColor:'#a03020', label:'Urgente',          emoji:'🔴' },
  info:    { bg:'#e8f4fd', border:'#2980b9', iconBg:'#2980b9', labelColor:'#2980b9', titleColor:'#1a3a52', subColor:'#2c5f7a', label:'Novedad',          emoji:'📢' },
};

function _applyBannerDia(data) {
  const el      = document.getElementById('banner-dia');
  const inner   = document.getElementById('banner-dia-inner');
  const iconEl  = document.getElementById('banner-dia-icon');
  const labelEl = document.getElementById('banner-dia-label');
  const textEl  = document.getElementById('banner-dia-text');
  const subEl   = document.getElementById('banner-dia-sub');
  if (!el) return;
  if (data && data.active && data.text) {
    const tipo = BANNER_TIPOS[data.tipo || 'promo'];
    el.style.display         = 'block';
    inner.style.background   = tipo.bg;
    inner.style.border       = '2px solid ' + tipo.border;
    iconEl.style.background  = tipo.iconBg;
    iconEl.textContent       = tipo.emoji;
    labelEl.textContent      = tipo.label;
    labelEl.style.color      = tipo.labelColor;
    textEl.textContent       = data.text;
    textEl.style.color       = tipo.titleColor;
    if (subEl) {
      subEl.textContent  = data.sub || '';
      subEl.style.color  = tipo.subColor;
      subEl.style.display = data.sub ? 'block' : 'none';
    }
  } else {
    el.style.display = 'none';
  }
}

function _updateBannerToggleBtn(active) {
  const btn = document.getElementById('banner-toggle-btn');
  if (!btn) return;
  btn.textContent      = active ? '🟢 Banner activo' : '🔴 Banner inactivo';
  btn.style.background = active ? '#27855a' : '#c0392b';
  btn.style.color      = '#fff';
  btn.style.border     = 'none';
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
  const text = document.getElementById('banner-dia-input')?.value.trim()     || '';
  const sub  = document.getElementById('banner-dia-sub-input')?.value.trim() || '';
  const tipo = document.getElementById('banner-dia-tipo')?.value             || 'promo';
  const data = getBannerDia();
  data.text = text;
  data.sub  = sub;
  data.tipo = tipo;
  localStorage.setItem(BANNER_KEY, JSON.stringify(data));
  if (window.fb_saveBannerDia) await window.fb_saveBannerDia(data).catch(() => {});
  _applyBannerDia(data);
  showToast('banner-toast');
}

function loadBannerDia() {
  if (window.fb_listenBannerDia) {
    window.fb_listenBannerDia(data => {
      if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
      const d = data || getBannerDia();
      _applyBannerDia(d);
      _updateBannerToggleBtn(d.active);
      const input  = document.getElementById('banner-dia-input');
      const subIn  = document.getElementById('banner-dia-sub-input');
      const tipoIn = document.getElementById('banner-dia-tipo');
      if (input  && d.text) input.value  = d.text;
      if (subIn  && d.sub)  subIn.value  = d.sub;
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
          try { data = typeof sn.val() === 'string' ? JSON.parse(sn.val()) : sn.val(); } catch {}
        }
        if (data) localStorage.setItem(BANNER_KEY, JSON.stringify(data));
        _applyBannerDia(data || getBannerDia());
      }).catch(() => _applyBannerDia(getBannerDia()));
    } catch(e) { _applyBannerDia(getBannerDia()); }
    return;
  }
  // Último fallback: localStorage
  _applyBannerDia(getBannerDia());
  _updateBannerToggleBtn(getBannerDia().active);
}


// ── EXPORTAR PDF ─────────────────────────────────────────────────────────────

function _pdfStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #2A1506; background: #fff; }
    .header { background: #3D1F0D; color: #FFF8EE; padding: 20px 28px; }
    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 2px; }
    .header p  { font-size: 12px; opacity: .7; }
    .content { padding: 24px 28px; }
    .order-card { border: 1.5px solid #F5E6C8; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; page-break-inside: avoid; }
    .order-num  { font-size: 18px; font-weight: 900; color: #C2711A; }
    .order-meta { font-size: 12px; color: #8A6A4E; margin: 4px 0 10px; }
    .order-items { font-size: 13px; color: #2A1506; border-top: 1px solid #F5E6C8; padding-top: 8px; }
    .order-item { display: flex; justify-content: space-between; padding: 3px 0; }
    .order-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #C2711A; border-top: 1.5px solid #F5E6C8; margin-top: 8px; padding-top: 8px; }
    .summary { background: #FFF8EE; border: 1.5px solid #E8943A; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 24px; flex-wrap: wrap; }
    .summary-item { text-align: center; }
    .summary-item .val { font-size: 24px; font-weight: 900; color: #C2711A; }
    .summary-item .lbl { font-size: 11px; color: #8A6A4E; text-transform: uppercase; letter-spacing: .05em; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;
}

function exportTicketPDF(num, name, time, total, slot, items, phone, notes) {
  const fecha = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const itemsHtml = (items || []).map(it =>
    `<div class="order-item"><span>${it.qty}x ${it.name}</span><span>${(it.subtotal||0).toFixed(2).replace('.',',')} €</span></div>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ticket ${num}</title>
  <style>${_pdfStyles()}
    body { max-width: 400px; margin: 0 auto; }
    .ticket-box { border: 2px solid #E8943A; border-radius: 14px; padding: 24px; margin: 24px; }
    .ticket-title { font-size: 13px; color: #8A6A4E; text-align:center; margin-bottom: 4px; }
    .ticket-num { font-size: 36px; font-weight: 900; color: #C2711A; text-align:center; margin-bottom: 16px; }
  </style></head><body>
  <div class="header" style="text-align:center">
    <h1>🥔 Dulce Patata Food</h1>
    <p>${fecha}</p>
  </div>
  <div class="ticket-box">
    <div class="ticket-title">Número de pedido</div>
    <div class="ticket-num">${num}</div>
    <div class="order-meta" style="text-align:center;margin-bottom:14px">
      👤 ${name || '—'}
      ${phone ? `&nbsp;·&nbsp; 📞 ${phone}` : ''}
      ${time  ? `&nbsp;·&nbsp; 🕐 ${time}` : ''}
      ${slot  ? `<br>📦 Recogida de patata a las ${slot}h` : ''}
    </div>
    ${itemsHtml ? `<div class="order-items">${itemsHtml}<div class="order-total"><span>Total a pagar</span><span>${parseFloat(total).toFixed(2).replace('.',',')} €</span></div></div>` : ''}
    ${notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:10px;font-style:italic">📝 ${notes}</div>` : ''}
    <div style="text-align:center;margin-top:16px;font-size:12px;color:#8A6A4E">Paga en caja cuando recojas 💛</div>
  </div>
  </body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
}

function switchHistorialTab(tab) {
  const diasBtn     = document.getElementById('htab-dias');
  const clientesBtn = document.getElementById('htab-clientes');
  const diasView    = document.getElementById('historial-tab-dias');
  const clientesView = document.getElementById('historial-tab-clientes');
  if (!diasBtn) return;
  if (tab === 'dias') {
    diasBtn.style.borderBottomColor     = 'var(--brown)';
    diasBtn.style.color                 = 'var(--brown)';
    diasBtn.style.fontWeight            = '700';
    clientesBtn.style.borderBottomColor = 'transparent';
    clientesBtn.style.color             = 'var(--muted)';
    clientesBtn.style.fontWeight        = '600';
    diasView.style.display    = 'block';
    clientesView.style.display = 'none';
  } else {
    clientesBtn.style.borderBottomColor = 'var(--brown)';
    clientesBtn.style.color             = 'var(--brown)';
    clientesBtn.style.fontWeight        = '700';
    diasBtn.style.borderBottomColor     = 'transparent';
    diasBtn.style.color                 = 'var(--muted)';
    diasBtn.style.fontWeight            = '600';
    diasView.style.display    = 'none';
    clientesView.style.display = 'block';
    renderClientes();
  }
}

function _buildClientesMap() {
  const hist = getHistorial();
  const map  = {}; // phone → { phone, names, count, total, lastDate, lastOrder, orders[] }
  hist.forEach(day => {
    (day.orders || []).forEach(o => {
      const phone = (o.phone || '').replace(/[\s\-().+]/g, '') || '—';
      const name  = o.name || '—';
      if (!map[phone]) map[phone] = { phone, names: new Set(), count: 0, total: 0, lastDate: '', lastOrder: null, orders: [] };
      map[phone].names.add(name);
      map[phone].count++;
      map[phone].total = parseFloat((map[phone].total + (o.total || 0)).toFixed(2));
      if (!map[phone].lastDate || day.date > map[phone].lastDate) {
        map[phone].lastDate  = day.date;
        map[phone].lastOrder = o;
      }
      map[phone].orders.push({ ...o, date: day.date });
    });
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

function renderClientes() {
  const clientes = _buildClientesMap();
  const q = (document.getElementById('clientes-search')?.value || '').trim().toLowerCase();
  const filtered = q
    ? clientes.filter(c => c.phone.includes(q) || [...c.names].some(n => n.toLowerCase().includes(q)))
    : clientes;

  // Stats rápidas
  const summaryEl = document.getElementById('clientes-summary');
  if (summaryEl) {
    const totalClientes  = clientes.length;
    const totalPedidos   = clientes.reduce((a, c) => a + c.count, 0);
    const ticketMedio    = totalPedidos ? (clientes.reduce((a, c) => a + c.total, 0) / totalPedidos).toFixed(2) : '0.00';
    summaryEl.innerHTML = `
      <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius);padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:900;font-family:'Playfair Display',serif;color:var(--brown)">${totalClientes}</div>
        <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;margin-top:4px">Clientes únicos</div>
      </div>
      <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius);padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:900;font-family:'Playfair Display',serif;color:var(--brown)">${totalPedidos}</div>
        <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;margin-top:4px">Pedidos totales</div>
      </div>
      <div style="background:var(--white);border:1.5px solid var(--amber);border-radius:var(--radius);padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:900;font-family:'Playfair Display',serif;color:var(--amber-dark)">${ticketMedio.replace('.',',')} €</div>
        <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;margin-top:4px">Ticket medio</div>
      </div>`;
  }

  const listEl = document.getElementById('clientes-list');
  if (!listEl) return;
  if (!filtered.length) {
    listEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:24px;font-size:13px">Sin resultados</div>';
    return;
  }

  listEl.innerHTML = filtered.map(c => {
    const nombre     = [...c.names].filter(n => n !== '—').join(', ') || '—';
    const isFrequent = c.count >= 5;
    const badge = isFrequent
      ? '<span style="font-size:14px" title="Cliente frecuente">⭐</span>'
      : '';
    const phoneDisplay = c.phone !== '—' ? c.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : '—';
    return `
    <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius);padding:14px;cursor:pointer" onclick="toggleClienteDetalle('${c.phone}')">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px">
            <span style="font-size:15px;font-weight:700;color:var(--brown)">${nombre}</span>
            ${badge}
          </div>
          <div style="font-size:12px;color:var(--muted)">${phoneDisplay}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:18px;font-weight:900;font-family:'Playfair Display',serif;color:var(--amber-dark)">${c.total.toFixed(2).replace('.',',')} €</div>
          <div style="font-size:11px;color:var(--muted)">${c.count} pedido${c.count !== 1 ? 's' : ''} · último ${c.lastDate}</div>
        </div>
      </div>
      <div id="cliente-detalle-${c.phone.replace(/\D/g,'')}" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--warm)">
        <div style="font-size:12px;font-weight:700;color:var(--brown);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Historial de pedidos</div>
        ${c.orders.slice().reverse().slice(0, 10).map(o => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dashed var(--warm);font-size:12px;gap:8px;flex-wrap:wrap">
            <span style="color:var(--amber-dark);font-weight:700">${o.num}</span>
            <span style="color:var(--muted)">${o.date} ${o.time || ''}</span>
            <span style="font-weight:700;color:var(--brown)">${(o.total||0).toFixed(2).replace('.',',')} €</span>
          </div>`).join('')}
        ${c.orders.length > 10 ? `<div style="font-size:11px;color:var(--muted);margin-top:6px">...y ${c.orders.length - 10} más</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function toggleClienteDetalle(phone) {
  const id = 'cliente-detalle-' + phone.replace(/\D/g,'');
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function exportClientesCSV() {
  const clientes = _buildClientesMap();
  const rows = [['Teléfono','Nombre','Pedidos','Total (€)','Último pedido']];
  clientes.forEach(c => {
    rows.push([
      c.phone,
      [...c.names].join(' / '),
      c.count,
      c.total.toFixed(2).replace('.',','),
      c.lastDate
    ]);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
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
  const list    = document.getElementById('historial-list');
  const chartEl = document.getElementById('historial-chart');
  if (!summary || !list) return;

  if (!hist.length) {
    summary.innerHTML = '';
    if (chartEl) chartEl.innerHTML = '';
    list.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Sin historial todavía</div>';
    return;
  }

  const totalDays   = hist.length;
  const totalOrders = hist.reduce((s,d) => s + d.count, 0);
  const totalMoney  = hist.reduce((s,d) => s + d.total, 0);
  const avgPerDay   = totalOrders / totalDays;
  const ticketMedio = totalOrders > 0 ? totalMoney / totalOrders : 0;

  summary.innerHTML = `
    <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius);padding:14px;text-align:center">
      <div style="font-size:24px;font-weight:900;font-family:'Playfair Display',serif;color:var(--brown)">${totalOrders}</div>
      <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;margin-top:2px">Pedidos totales</div>
    </div>
    <div style="background:var(--white);border:1.5px solid var(--amber);border-radius:var(--radius);padding:14px;text-align:center">
      <div style="font-size:24px;font-weight:900;font-family:'Playfair Display',serif;color:var(--amber-dark)">${totalMoney.toFixed(2).replace('.',',')} €</div>
      <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;margin-top:2px">Ingresos totales</div>
    </div>
    <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius);padding:14px;text-align:center">
      <div style="font-size:24px;font-weight:900;font-family:'Playfair Display',serif;color:var(--brown)">${ticketMedio.toFixed(2).replace('.',',')} €</div>
      <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;margin-top:2px">Ticket medio</div>
    </div>`;

  // Gráfico de barras (últimos 14 días)
  if (chartEl) {
    const recent = hist.slice(0, 14).reverse();
    const maxCount = Math.max(...recent.map(d => d.count), 1);
    chartEl.innerHTML = recent.map(d => {
      const pct = Math.round((d.count / maxCount) * 100);
      const label = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {day:'numeric',month:'short'});
      return `<div class="hist-bar-wrap" title="${label}: ${d.count} pedidos · ${d.total.toFixed(2)} €" onclick="expandHistorialDay('${d.date}')">
        <div class="hist-bar" style="height:${Math.max(pct,4)}%"></div>
        <div class="hist-bar-label">${label}</div>
      </div>`;
    }).join('');
  }


  list.innerHTML = hist.map(d => {
    const dateLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'short'});
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--warm);gap:8px;flex-wrap:wrap">
      <span style="font-weight:600;color:var(--text);font-size:13px;min-width:110px">${dateLabel}</span>
      <span style="font-size:13px;color:var(--muted)">${d.count} pedido${d.count !== 1 ? 's' : ''}</span>
      <span style="font-weight:700;color:var(--brown);font-size:14px">${d.total.toFixed(2).replace('.',',')} €</span>
      <button onclick="expandHistorialDay('${d.date}')" style="background:var(--warm);border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;color:var(--brown);font-weight:600">Ver detalle</button>
      <button onclick="exportDayPDFFromHistorial('${d.date}')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif">📄 PDF</button>
    </div>`;
  }).join('');
}

function exportDayPDFFromHistorial(date) {
  const hist = getHistorial();
  const day  = hist.find(d => d.date === date);
  if (!day || !day.orders || !day.orders.length) { alert('No hay pedidos para este día'); return; }
  const fecha = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  _exportDayDataPDF(day.orders, day.total, fecha, date);
}

async function exportDayPDF() {
  const todayKey = new Date().toISOString().slice(0,10);
  let stats = null;
  if (window.fb_getStats) { try { stats = await window.fb_getStats(todayKey); } catch {} }
  if (!stats) { try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch {} }
  if (!stats || !stats.orders || !stats.orders.length) { alert('No hay pedidos hoy para exportar'); return; }
  const fecha = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  _exportDayDataPDF(stats.orders, stats.total, fecha, todayKey);
}

function _exportDayDataPDF(orders, total, fecha, dateKey) {
  const t = total || orders.reduce((a, o) => a + (o.total || 0), 0);
  const ordersHtml = orders.map(o => {
    const itemsHtml = (o.items || []).map(it =>
      `<div class="order-item"><span>${it.qty}x ${it.name}</span><span>${(it.subtotal||0).toFixed(2).replace('.',',')} €</span></div>`
    ).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="order-num">${o.num}</div>
          <div class="order-meta">👤 ${o.name||'—'} &nbsp;·&nbsp; 🕐 ${o.time||'—'}${o.slot?` &nbsp;·&nbsp; 📦 ${o.slot}`:''}${o.phone?` &nbsp;·&nbsp; 📞 ${o.phone}`:''}</div>
        </div>
        <div style="font-size:18px;font-weight:900;color:#C2711A">${(o.total||0).toFixed(2).replace('.',',')} €</div>
      </div>
      ${itemsHtml ? `<div class="order-items">${itemsHtml}</div>` : ''}
      ${o.notes ? `<div style="font-size:12px;color:#8A6A4E;margin-top:6px;font-style:italic">📝 ${o.notes}</div>` : ''}
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedidos ${dateKey}</title>
  <style>${_pdfStyles()}</style></head><body>
  <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Resumen de pedidos · ${fecha}</p></div>
  <div class="content">
    <div class="summary">
      <div class="summary-item"><div class="val">${orders.length}</div><div class="lbl">Pedidos</div></div>
      <div class="summary-item"><div class="val">${t.toFixed(2).replace('.',',')} €</div><div class="lbl">Total</div></div>
      <div class="summary-item"><div class="val">${(t/orders.length).toFixed(2).replace('.',',')} €</div><div class="lbl">Ticket medio</div></div>
    </div>
    ${ordersHtml}
  </div></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
}

function exportHistorialPDF() {
  const hist = getHistorial();
  if (!hist.length) { alert('No hay historial para exportar'); return; }

  const totalOrders = hist.reduce((s,d) => s + d.count, 0);
  const totalMoney  = hist.reduce((s,d) => s + d.total, 0);

  const daysHtml = hist.slice().reverse().map(d => {
    const fecha = new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    const ordersHtml = (d.orders || []).map(o =>
      `<div class="order-item" style="font-size:12px"><span>${o.num} · ${o.name||'—'} ${o.time?'· '+o.time:''}</span><span>${(o.total||0).toFixed(2).replace('.',',')} €</span></div>`
    ).join('');
    return `<div class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div class="order-num" style="font-size:15px">${fecha}</div>
        <div style="font-size:14px;font-weight:700;color:#C2711A">${d.count} pedidos · ${d.total.toFixed(2).replace('.',',')} €</div>
      </div>
      ${ordersHtml}
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Historial Dulce Patata</title>
  <style>${_pdfStyles()}</style></head><body>
  <div class="header"><h1>🥔 Dulce Patata Food</h1><p>Historial completo · ${hist.length} días</p></div>
  <div class="content">
    <div class="summary">
      <div class="summary-item"><div class="val">${hist.length}</div><div class="lbl">Días</div></div>
      <div class="summary-item"><div class="val">${totalOrders}</div><div class="lbl">Pedidos</div></div>
      <div class="summary-item"><div class="val">${totalMoney.toFixed(2).replace('.',',')} €</div><div class="lbl">Total</div></div>
      <div class="summary-item"><div class="val">${totalOrders ? (totalMoney/totalOrders).toFixed(2).replace('.',',') : '0,00'} €</div><div class="lbl">Ticket medio</div></div>
    </div>
    ${daysHtml}
  </div></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
}

function expandHistorialDay(date) {
  const hist = getHistorial();
  const day = hist.find(d => d.date === date);
  if (!day) return;
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'});

  // Productos del día
  const prodCounts = {};
  (day.orders || []).forEach(o => {
    (o.items || []).forEach(it => {
      prodCounts[it.name] = (prodCounts[it.name] || 0) + it.qty;
    });
  });
  const topDay = Object.entries(prodCounts).sort((a,b)=>b[1]-a[1]);

  let html = `
    <h3 style="font-family:'Playfair Display',serif;color:var(--brown);margin-bottom:4px;font-size:18px">${dateLabel}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
      <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:var(--radius-sm);padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:900;color:var(--brown)">${day.count}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase">Pedidos</div>
      </div>
      <div style="background:var(--white);border:1.5px solid var(--amber);border-radius:var(--radius-sm);padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:900;color:var(--amber-dark)">${day.total.toFixed(2).replace('.',',')} €</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase">Total</div>
      </div>
    </div>`;

  if (topDay.length) {
    html += `<div style="font-size:12px;font-weight:700;color:var(--brown);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">🏆 Más vendido este día</div>`;
    html += topDay.slice(0,4).map(([name, qty]) =>
      `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--warm);font-size:13px">
        <span style="color:var(--text);font-weight:500">${name}</span>
        <span style="font-weight:700;color:var(--amber-dark)">${qty} uds</span>
      </div>`
    ).join('');
  }

  html += `<div style="font-size:12px;font-weight:700;color:var(--brown);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">🧾 Pedidos</div>`;
  (day.orders || []).forEach(o => {
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--warm);font-size:13px;gap:8px;flex-wrap:wrap">
      <span style="font-weight:700;color:var(--amber-dark)">${o.num}</span>
      <span style="flex:1;color:var(--text)">${o.name}</span>
      ${o.slot ? `<span style="background:var(--amber-light);color:var(--amber-dark);font-size:11px;font-weight:700;padding:2px 6px;border-radius:99px">🕐 ${o.slot}</span>` : ''}
      <span style="color:var(--muted);font-size:12px">${o.time}</span>
      <span style="font-weight:700;color:var(--brown)">${o.total.toFixed(2).replace('.',',')} €</span>
    </div>`;
  });
  html += `<div style="text-align:right;margin-top:12px"><button onclick="closeHistorialDayModal()" style="background:var(--warm);border:none;border-radius:8px;padding:8px 20px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;color:var(--brown)">Cerrar</button></div>`;

  const modal = document.getElementById('historial-day-modal');
  document.getElementById('historial-day-modal-content').innerHTML = html;
  modal.style.display = 'flex';
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

  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('admin-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'stats')     loadDayStats();
  if (id === 'historial') { loadHistorial(); loadAutoDeleteUI(); applyAutoDelete(); }
  if (id === 'pedidos')   { loadLiveOrdersWithLocalFirst(); _lastKnownOrderCount = null; checkForNewOrders(); clearUnseenOrders(); loadCatBlockUI(); }
  if (id === 'log')       renderActivityLog();
  if (id === 'pwd')       loadUrlTokenUI();
  if (id === 'stock-config') { loadStockAdminList(); setTimeout(pp2CheckFirebaseBanner, 500); }
  if (id === 'local')     { loadSoundConfigUI(); updateForceSlotsBtn(); loadSlotTurnosUI(); loadFeeUI(); loadModifyWindowInput(); }
  if (id === 'accesos')   { renderAccesosLog(); renderActivityLog(); }
  if (id === 'empleados') { setTimeout(empRenderAdmin, 50); }
  if (id === 'local')          { loadBannerDia(); }
  if (id === 'config')         { loadAntiSpamFromFirebase(); }
  if (id === 'pedidos-config') { loadAntiSpamFromFirebase(); }
}

async function renderAccesosLog() {
  const el = document.getElementById('accesos-log-list');
  if (!el) return;
  el.innerHTML = '<div style="font-size:13px;color:var(--muted)">Cargando...</div>';
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
      el.innerHTML = '<div style="font-size:13px;color:var(--muted)">Sin registros aún.</div>';
      return;
    }
    el.innerHTML = logs.slice(0, 100).map(function(l) {
      var esOk = l.resultado && l.resultado.indexOf('Acceso correcto') !== -1;
      var color = esOk ? '#eafaf1' : '#fdf0ee';
      var border = esOk ? '#27855a' : '#c0392b';
      var h = '<div style="background:' + color + ';border:1.5px solid ' + border + ';border-radius:10px;padding:12px;font-size:12px;margin-bottom:4px">';
      h += '<div style="font-weight:700;color:var(--brown);margin-bottom:4px">' + (l.resultado || '-') + '</div>';
      h += '<div style="color:var(--text);margin-bottom:2px">Email: ' + (l.email || '-') + '</div>';
      h += '<div style="color:var(--muted);margin-bottom:2px">Fecha: ' + (l.fecha || '-') + '</div>';
      h += '<div style="color:var(--muted);margin-bottom:2px">IP: ' + (l.ip || '-') + '</div>';
      h += '<div style="color:var(--muted);font-size:11px;word-break:break-all">Dispositivo: ' + (l.dispositivo || '-') + '</div>';
      h += '</div>';
      return h;
    }).join('');
  } catch(e) {
    el.innerHTML = '<div style="font-size:13px;color:#c0392b">Error al cargar: ' + e.message + '</div>';
  }
}

// Patch recordOrderStats to include items for kitchen display + Firebase sync
// Usa transacción Firebase para evitar sobreescribir pedidos de otros dispositivos
async function recordOrderStats(orderNum, name, total, slotTime) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const items = _lastTicketData ? _lastTicketData.items : [];
  const phone = _lastTicketData ? (_lastTicketData.phone || '') : '';
  const notes = _lastTicketData ? (_lastTicketData.notes || '') : '';
  const newOrder = { num: orderNum, name, phone, notes, total, items,
    time: new Date().toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'}),
    slot: slotTime || null,
    ts: Date.now() };

  // Intentar transacción atómica en Firebase para no perder pedidos de otros dispositivos
  if (typeof firebase !== 'undefined' && firebase.database) {
    try {
      await firebase.database().ref('stats/' + todayKey).transaction(function(current) {
        if (!current || current.date !== todayKey) {
          return { date: todayKey, count: 1, total: parseFloat(total.toFixed(2)), orders: [newOrder] };
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
    } catch(e) {
      console.warn('[DPF] Firebase transaction failed, usando fallback:', e);
    }
  }

  // Fallback sin Firebase: solo localStorage
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  if (stats.date !== todayKey) {
    if (stats.date && stats.count > 0) saveToHistorial(stats);
    stats = { date: todayKey, count: 0, total: 0, orders: [] };
  }
  stats.count++;
  stats.total = parseFloat((stats.total + total).toFixed(2));
  if (!stats.orders.find(o => _normOrderKey(o.num) === _normOrderKey(orderNum))) stats.orders.unshift(newOrder);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try { await window.fb_saveStats(stats); } catch(e) { console.warn('Firebase stats error', e); }
  }
}

scheduleSlotMidnightReset();

// ── STOCK SYSTEM ──
const STOCK_PWD_KEY = 'dpf_stock_pwd';
const STOCK_DATA_KEY = 'dpf_stock_data';

const STOCK_DEFAULTS = {
  congelados: [
    'Kebab','Carne picada','Tronquitos de mar','Gambas','York','Pulled pork','Bacon'
  ],
  latas_salsas: [
    'Tomate frito','Aceitunas','Maíz','Zanahoria','Remolacha','Champiñones','Piña',
    'Alioli','Mayonesa','Salsa rosa','Salsa de yogur','Salsa barbacoa','Salsa brava',
    'Salsa ketchup','Salsa roquefort','Salsa miel mostaza','Cebolla crujiente','Nata Vegecrem'
  ],
  estanteria_almacen: [
    'Atún','Crema de pistacho','Crema Kinder','Crema Lotus'
  ],
  frio: [
    'Philadelphia tarta','Philadelphia patatas','Mantequilla','Huevo cocido',
    'Queso mascarpone','Cuatro quesos','Rulo de cabra'
  ],
  estanteria_tartas: [
    'Galleta Lotus','Galleta Dino','Galleta María Oro','Filipinos blancos','Donuts','Leche Puleva'
  ],
  patatas_verdura: [
    'Uds. sacos de patatas','Uds. sacos de cebollas','Bolsas boniato pelado'
  ],
  masas: [
    'Masa cookies'
  ],
  queseria: [
    'Queso mozzarella'
  ],
  envases: [
    'Bol de pollo','Bol pequeño boniato','Redondel tartas plateadas','Papel de aluminio',
    'Papel film','Cajas de bolsas','Caja pasta 1/2','Caja pasta 1/4','Caja pizza',
    'Papel térmico 57×35 mm','Papel térmico 80 mm','Caja cucharas',
    'Rollo papel cocina / horno','Caja papel horno','Cacharrillos salsas pequeños',
    'Papeles marrones','Caja tartas completas'
  ],
  pan: [
    'Pan de leña','Paninis XXL'
  ],
  referencias_ali: [
    'Aceitunas rodajas','Aceite de oliva virgen extra','Cuajada tomates','Sal','Azúcar',
    'Pimienta','Orégano','Eneldo','Hierbas provenzales','Ajo en polvo','Nuez moscada',
    'Pistachos','Piña',
    'Nanas limpieza','Guantes talla L','Guantes talla M','Fregonas','Cepillos',
    'Recogedor','Trapos','Lejía','Desengrasante','Friegasuelos','Papel higiénico',
    'Estropajos','Ambientador','Limpia cristales','Servilletas'
  ],
  chocolates_galletas: [
    'Chocolate negro','Chocolate blanco','Chocolate con leche','Galleta Digestive'
  ]
};

const STOCK_GROUP_LABELS = {
  congelados:          '❄️ Congelados',
  latas_salsas:        '🥫 Latas / Conservas / Salsas',
  estanteria_almacen:  '📦 Estantería (Almacén)',
  frio:                '🧊 Frío',
  estanteria_tartas:   '🎂 Estantería Tartas',
  patatas_verdura:     '🥔 Patatas y Verdura',
  masas:               '🍪 Masas',
  queseria:            '🧀 Quesería',
  envases:             '📋 Envases / Packaging',
  pan:                 '🍞 Pan',
  referencias_ali:     '🛒 Referencias ALI',
  chocolates_galletas: '🍫 Chocolates y Galletas'
};
function getStockPwd() {
  return localStorage.getItem(STOCK_PWD_KEY) || '';
}

function changeStockPwd() {
  const n1 = document.getElementById('stock-pwd-new').value;
  const n2 = document.getElementById('stock-pwd-rep').value;
  const err = document.getElementById('stock-pwd-error');
  err.textContent = '';
  if (n1.length < 4) { err.textContent = 'La clave debe tener al menos 4 caracteres'; return; }
  if (n1 !== n2) { err.textContent = 'Las claves no coinciden'; return; }
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

function saveStockData(data) {
  localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
  if (window.fb_saveStockData) {
    window._stockDataLocalWrite = Date.now();
    window.fb_saveStockData(data).catch(() => {});
  }
}

// ── ADMIN: ingredient management ──
function loadStockAdminList() {
  const data = getStockData();
  const el = document.getElementById('stock-ingredients-admin-list');
  if (!el) return;
  el.innerHTML = Object.entries(data).map(([group, items]) => `
    <div style="margin-bottom:18px">
      <div style="font-size:13px;font-weight:700;color:var(--brown);margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid var(--warm)">${STOCK_GROUP_LABELS[group] || group}</div>
      <div id="stock-drag-group-${group}" data-group="${group}" style="display:flex;flex-direction:column;gap:4px">
        ${items.map((ing, i) => `
          <div draggable="true" data-group="${group}" data-index="${i}"
               style="display:flex;align-items:center;gap:8px;background:var(--white);border:1.5px solid var(--warm);border-radius:8px;padding:7px 12px;cursor:grab"
               ondragstart="stockDragStart(event)" ondragover="stockDragOver(event)" ondrop="stockDrop(event)" ondragend="stockDragEnd(event)">
            <span style="color:var(--muted);font-size:16px;cursor:grab;user-select:none">☰</span>
            <span style="font-size:14px;color:var(--text);flex:1">${ing}</span>
            <button onclick="removeStockItem('${group}',${i})" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer;font-weight:700">✕</button>
          </div>`).join('')}
      </div>
    </div>`).join('');
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
    el.style.background = 'var(--white)';
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
  const [moved] = arr.splice(srcIdx, 1);
  arr.splice(dstIdx, 0, moved);
  saveStockData(data);
  loadStockAdminList();
  showToast('stock-config-toast');
}
function _initStockDrag() {
  // Touch drag for mobile using touchstart/touchmove/touchend
  document.querySelectorAll('#stock-ingredients-admin-list [draggable]').forEach(el => {
    el.addEventListener('touchstart', _stockTouchStart, { passive: true });
    el.addEventListener('touchmove', _stockTouchMove, { passive: false });
    el.addEventListener('touchend', _stockTouchEnd, { passive: true });
  });
}
let _stockTouchItem = null, _stockTouchStartY = 0;
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
  if (!container) { _stockTouchItem = null; return; }
  const items = Array.from(container.querySelectorAll('[draggable]'));
  let targetIdx = srcIdx;
  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (endY > rect.top && endY < rect.bottom) targetIdx = i;
  });
  if (targetIdx !== srcIdx) {
    const data = getStockData();
    const arr = data[group];
    const [moved] = arr.splice(srcIdx, 1);
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
  if (data[group].includes(name)) { alert('Ya existe en ese grupo'); return; }
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
  if (btn) btn.style.background = _stockEditMode ? 'var(--amber)' : 'var(--white)';
  if (btn) btn.style.color = _stockEditMode ? '#fff' : 'var(--brown)';
  if (addPanel) addPanel.style.display = _stockEditMode ? 'block' : 'none';
  renderStockItems();
}

function stockOverlayAddItem() {
  const group = document.getElementById('stock-edit-group').value;
  const name = document.getElementById('stock-edit-name').value.trim();
  if (!name) return;
  const data = getStockData();
  if (!data[group]) data[group] = [];
  if (data[group].includes(name)) { alert('Ya existe en esa categoría'); return; }
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

function openStockFromAdmin() {
  // Guardar estado y deshabilitar el overlay admin mientras stock está abierto
  window._stockFromAdmin = true;
  window._adminWasLoggedIn = _adminLoggedIn;
  document.getElementById('admin-overlay').classList.add('hidden-for-stock');
  // Quitar temporalmente pointer-events para evitar clicks fantasma en el overlay
  document.getElementById('admin-overlay').style.pointerEvents = 'none';
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
}

function openStockOverlay() {
  _stockSelections = {};
  document.getElementById('stock-overlay').style.display = 'block';
  document.getElementById('stock-result-modal').style.display = 'none';
  document.body.style.overflow = 'hidden';

  // 🔥 Cargar historial de Firebase primero (para que el otro dispositivo vea el último stock)
  // luego activar listener de cambios en tiempo real
  requestAnimationFrame(() => {
    let _stockFirstLoad = false;
    if (window.fb_listenStockHistorial) {
      if (window._stockUnsubscribe) { try { window._stockUnsubscribe(); } catch(e) {} }
      window._stockUnsubscribe = window.fb_listenStockHistorial((data) => {
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
  if (window._stockUnsubscribe) { try { window._stockUnsubscribe(); } catch(e) {} window._stockUnsubscribe = null; }
  if (window._stockFromAdmin) {
    window._stockFromAdmin = false;
    _adminLoggedIn = window._adminWasLoggedIn || true;
    const overlay = document.getElementById('admin-overlay');
    overlay.classList.remove('hidden-for-stock');
    overlay.style.pointerEvents = '';
  }
}

function renderStockItems() {
  const data = getStockData();
  const container = document.getElementById('stock-items-list');
  // Build flat index for callbacks
  window._stockItemIndex = {};
  let idx = 0;
  Object.entries(data).forEach(([group, items]) => items.forEach(ing => { window._stockItemIndex[idx++] = ing; }));

  container.innerHTML = Object.entries(data).map(([group, items]) => {
    if (!items.length) return '';
    const isExtras = group === 'extras';
    return '<div style="margin-bottom:4px">'
      + '<div style="font-size:14px;font-weight:700;color:var(--brown);margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--amber)">' + (STOCK_GROUP_LABELS[group] || group) + '</div>'
      + items.map(ing => {
          if (_stockEditMode) {
            return '<div draggable="true" data-group="' + group + '" data-ing="' + ing.replace(/"/g,'&quot;') + '"'
              + ' style="display:flex;align-items:center;gap:8px;background:var(--white);border:1.5px solid var(--warm);border-radius:12px;padding:10px 14px;margin-bottom:6px;cursor:grab"'
              + ' ondragstart="stockOverlayDragStart(event)" ondragover="stockOverlayDragOver(event)" ondrop="stockOverlayDrop(event)" ondragend="stockOverlayDragEnd(event)">'
              + '<span style="color:var(--muted);font-size:18px;user-select:none">☰</span>'
              + '<span style="font-size:15px;font-weight:600;color:var(--brown);flex:1">' + ing + '</span>'
              + '<button onclick="stockOverlayRemoveItem(\'' + group + '\',\'' + ing.replace(/'/g,"\\'") + '\')" style="background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer">✕</button>'
              + '</div>';
          }
          const i = Object.values(window._stockItemIndex).indexOf(ing);
          if (isExtras) {
            const eid = 'extra_' + ing.replace(/[^a-z0-9]/gi,'_');
            return '<div style="background:var(--white);border:1.5px solid var(--warm);border-radius:12px;padding:10px 14px;margin-bottom:8px">'
              + '<div style="font-size:14px;font-weight:600;color:var(--brown);margin-bottom:6px">' + ing + '</div>'
              + '<textarea id="' + eid + '" placeholder="Escribe aqu\u00ED..." rows="2" style="width:100%;border:1.5px solid var(--warm);border-radius:8px;padding:8px 10px;font-size:13px;font-family:\'DM Sans\',sans-serif;color:var(--text);background:var(--cream);outline:none;resize:none;box-sizing:border-box"></textarea>'
              + '</div>';
          }
          const qty = _stockSelections[ing] || 0;
          const sel = qty > 0;
          const bg = sel ? 'var(--amber-light)' : 'var(--white)';
          const border = sel ? 'var(--amber)' : 'var(--warm)';
          return '<div style="display:flex;align-items:center;justify-content:space-between;background:' + bg + ';border:2px solid ' + border + ';border-radius:12px;padding:11px 14px;margin-bottom:8px">'
            + '<span onclick="stockToggle(' + i + ')" style="font-size:15px;font-weight:600;color:var(--brown);flex:1;cursor:pointer">' + ing + '</span>'
            + '<div style="display:flex;align-items:center;gap:10px">'
            + '<button onclick="stockQty(' + i + ',-1)" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--amber);background:var(--white);font-size:24px;font-weight:700;cursor:pointer;color:var(--amber-dark)">&#x2212;</button>'
            + '<span style="font-size:20px;font-weight:900;color:var(--brown);min-width:32px;text-align:center">' + (qty || '') + '</span>'
            + '<button onclick="stockQty(' + i + ',1)" style="width:40px;height:40px;border-radius:50%;border:none;background:var(--amber);font-size:24px;font-weight:700;cursor:pointer;color:#fff">+</button>'
            + '</div></div>';
        }).join('')
      + '</div>';
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
  const next = Math.max(0, (_stockSelections[ing] || 0) + delta);
  if (next === 0) delete _stockSelections[ing];
  else _stockSelections[ing] = next;
  renderStockItems();
}

function toggleStockItem(ing) {
  _stockSelections[ing] = _stockSelections[ing] ? 0 : 1;
  if (!_stockSelections[ing]) delete _stockSelections[ing];
  renderStockItems();
}

function changeStockQty(ing, delta) {
  const next = Math.max(0, (_stockSelections[ing] || 0) + delta);
  if (next === 0) delete _stockSelections[ing];
  else _stockSelections[ing] = next;
  renderStockItems();
}

const STOCK_HISTORIAL_KEY = 'dpf_stock_historial';

function getStockHistorial() {
  try { return JSON.parse(localStorage.getItem(STOCK_HISTORIAL_KEY) || '[]'); } catch { return []; }
}

function saveToStockHistorial(ts, lines) {
  const hist = getStockHistorial();
  hist.push({ ts, lines });
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
  if (hist.length <= 1) { alert('Solo hay una lista, no hay antiguas que borrar'); return; }
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
    el.innerHTML = '<p style="font-size:13px;color:var(--muted)">Sin listas guardadas aún.</p>';
    return;
  }
  // Most recent at top, shown separately; rest in "carpeta" collapsed
  const sorted = [...hist]; // oldest first, newest last
  const latest = sorted[sorted.length - 1];
  const older = sorted.slice(0, sorted.length - 1);

  let html = '';

  // Latest entry (always visible)
  html += '<div style="background:var(--amber-light);border:2px solid var(--amber);border-radius:12px;padding:14px;margin-bottom:12px">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
    + '<span style="font-size:13px;font-weight:700;color:var(--brown)">&#x1F4CC; Última lista — ' + latest.ts + '</span>'
    + '<button onclick="deleteStockHistorialEntry(' + (hist.length - 1) + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">&#x2715;</button>'
    + '</div>'
    + latest.lines.map(l => '<div style="font-size:13px;color:var(--text)">&#x2022; ' + l + '</div>').join('')
    + '</div>';

  // Older entries in a collapsible folder
  if (older.length) {
    html += '<details style="background:var(--white);border:1.5px solid var(--warm);border-radius:12px;padding:12px;margin-bottom:8px">'
      + '<summary style="font-size:13px;font-weight:700;color:var(--brown);cursor:pointer">&#x1F4C2; Listas anteriores (' + older.length + ')</summary>'
      + '<div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">'
      + older.map((entry, i) =>
          '<div style="background:var(--cream);border:1px solid var(--warm);border-radius:8px;padding:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
          + '<span style="font-size:12px;font-weight:600;color:var(--muted)">' + entry.ts + '</span>'
          + '<button onclick="deleteStockHistorialEntry(' + i + ')" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:2px 7px;font-size:11px;cursor:pointer">&#x2715;</button>'
          + '</div>'
          + entry.lines.map(l => '<div style="font-size:12px;color:var(--text)">&#x2022; ' + l + '</div>').join('')
          + '</div>'
        ).join('')
      + '</div></details>';
  }

  el.innerHTML = html;
}

function exportStockPDF() {
  const lines = window._lastStockLines || [];
  const ts = window._lastStockTs || '';
  if (!lines.length) return;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #2A1506; }
    h2 { color: #C2711A; margin-bottom: 4px; }
    p.ts { font-size: 12px; color: #8A6A4E; margin-bottom: 20px; }
    ul { list-style: none; padding: 0; }
    li { padding: 6px 0; border-bottom: 1px solid #F5E6C8; font-size: 14px; }
    li:before { content: "• "; color: #E8943A; font-weight: bold; }
  </style></head><body>
  <h2>📦 Lista de reposición</h2>
  <p class="ts">${ts}</p>
  <ul>${lines.map(l => '<li>' + l + '</li>').join('')}</ul>
  </body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) { setTimeout(() => { w.print(); }, 600); }
}

function closeStockResultModal() {
  document.getElementById('stock-result-modal').style.display = 'none';
  _stockSelections = {};
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
    if (arr.length) localInfo += ' | ultima ts: ' + (arr[arr.length-1].ts || '?');
  } catch(e) { localInfo += ' | ERROR parse'; }

  dbg.innerHTML = localInfo + '<br>FIREBASE: comprobando...';

  // Info Firebase — con reintentos si aún no está listo
  function checkFb(intentos) {
    const fbReady = window._firebaseReady ? 'SI' : 'NO';
    const fbLoad  = window.fb_loadStockHistorial ? 'SI' : 'NO';
    const fbSave  = window.fb_saveStockHistorial  ? 'SI' : 'NO';
    dbg.innerHTML = localInfo
      + '<br>Firebase listo: ' + fbReady
      + ' | fb_load: ' + fbLoad
      + ' | fb_save: ' + fbSave
      + (intentos < 25 ? ' | intentos: ' + (25 - intentos) : '');

    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial()
        .then(fbRaw => {
          let fbInfo = 'FIREBASE: ';
          if (!fbRaw) { fbInfo += 'VACIO/NULL'; }
          else {
            const arr = Array.isArray(fbRaw) ? fbRaw : Object.values(fbRaw);
            fbInfo += 'SI | ' + arr.length + ' entradas';
            if (arr.length) fbInfo += ' | ultima ts: ' + (arr[arr.length-1].ts || '?');
          }
          dbg.innerHTML = [localInfo, fbInfo,
            'fb_save: ' + (window.fb_saveStockHistorial ? 'DISPONIBLE' : 'NO DISPONIBLE')
          ].join('<br>');
        })
        .catch(e => { dbg.innerHTML = localInfo + '<br>FIREBASE ERROR: ' + e.message; });
    } else if (intentos > 0) {
      setTimeout(() => checkFb(intentos - 1), 400);
    } else {
      dbg.innerHTML = localInfo
        + '<br>FIREBASE: NO DISPONIBLE tras 10s'
        + '<br>_firebaseReady: ' + fbReady
        + '<br>Módulo cargado: ' + (window._firebaseModuleLoaded ? 'SI' : 'NO')
        + (window._firebaseError ? '<br>Error: ' + window._firebaseError : '');
    }
  }
  checkFb(25); // hasta 10 segundos
}

function mostrarUltimoStock() {
  const modal = document.getElementById('ultimo-stock-modal');
  const linesEl = document.getElementById('ultimo-stock-lines');
  const tsEl = document.getElementById('ultimo-stock-ts');
  modal.style.display = 'flex';
  linesEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">&#x1F504; Cargando \u00FAltimo stock\u2026</div>';
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
      linesEl.innerHTML = '<p style="color:var(--muted);font-size:13px">A\u00FAn no hay ning\u00FAn stock guardado.</p>';
      tsEl.textContent = '';
      return;
    }
    const last = arr[arr.length - 1];
    tsEl.textContent = '\uD83D\uDCC5 ' + (last.ts || '');
    const lines = normalizeHist(last.lines);
    linesEl.innerHTML = lines.map(l => '<div style="padding:2px 0">\u2022 ' + l + '</div>').join('') || '<p style="color:var(--muted);font-size:13px">Lista vac\u00EDa.</p>';
  }

  function tryLoad(intentos) {
    if (window.fb_loadStockHistorial) {
      window.fb_loadStockHistorial()
        .then(fbRaw => {
          const fbHist = normalizeHist(fbRaw);
          if (fbHist.length) {
            localStorage.setItem('dpf_stock_historial', JSON.stringify(fbHist));
            renderUltimo(fbHist);
          } else {
            renderUltimo(getStockHistorial());
          }
        })
        .catch(() => renderUltimo(getStockHistorial()));
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
  Object.entries(_stockSelections).filter(([,v]) => v > 0).forEach(([name, qty]) => {
    lines.push(name + ': ' + qty + ' ud' + (qty !== 1 ? 's' : ''));
  });
  // Extras: text fields
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi,'_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) { alert('Selecciona al menos un ingrediente con cantidad mayor a 0'); return; }
  const ts = new Date().toLocaleString('es-ES', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  try { logActivity('\uD83D\uDCE6 Reposici\u00F3n (' + ts + '): ' + lines.join(' | ')); } catch(e) {}
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
  if (modal) modal.style.display = 'flex';
}

function sendStockWhatsApp() {
  const data = getStockData();
  const lines = [];
  Object.entries(_stockSelections).filter(([,v]) => v > 0).forEach(([name, qty]) => {
    lines.push(name + ': ' + qty + ' ud' + (qty !== 1 ? 's' : ''));
  });
  (data.extras || []).forEach(ing => {
    const el = document.getElementById('extra_' + ing.replace(/[^a-z0-9]/gi,'_'));
    if (el && el.value.trim()) lines.push(ing + ': ' + el.value.trim());
  });
  if (!lines.length) { alert('Selecciona al menos un ingrediente con cantidad mayor a 0'); return; }
  const ts = new Date().toLocaleString('es-ES', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  const waText = encodeURIComponent('\uD83D\uDCE6 Stock (' + ts + '):\n' + lines.map(l => '\u2022 ' + l).join('\n'));
  window.open('https://wa.me/34638292510?text=' + waText, '_blank');
}

// bimba secret handled in unified keydown listener above

// ── EDITAR TOTAL DE PEDIDO ──
function startEditOrderTotal(orderNum) {
  const safeId = orderNum.replace('#','');
  const displayEl = document.getElementById('total-display-' + safeId);
  if (!displayEl) return;
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  const order = (stats.orders || []).find(o => o.num === orderNum);
  if (!order) return;
  const currentTotal = order.total;
  const inputEl = document.createElement('input');
  inputEl.type = 'number';
  inputEl.step = '0.01';
  inputEl.min = '0';
  inputEl.value = currentTotal.toFixed(2);
  inputEl.id = 'total-input-' + safeId;
  inputEl.style.cssText = 'width:90px;font-size:13px;font-weight:700;color:var(--brown);border:1.5px solid var(--amber);border-radius:6px;padding:2px 6px;text-align:right;background:var(--amber-light);outline:none';
  displayEl.replaceWith(inputEl);
  inputEl.focus();
  inputEl.select();
  function doSave() { saveOrderTotal(orderNum, inputEl.value); }
  inputEl.addEventListener('blur', doSave);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); doSave(); }
    if (e.key === 'Escape') { loadLiveOrders(); }
  });
}

async function saveOrderTotal(orderNum, rawValue) {
  const newTotal = parseFloat(rawValue);
  if (isNaN(newTotal) || newTotal < 0) { loadLiveOrders(); return; }
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  if (window.fb_getStats) {
    try { const fb = await window.fb_getStats(todayKey); if (fb) stats = fb; } catch(e) {}
  }
  if (!stats) {
    try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  }
  if (!stats || !stats.orders) { loadLiveOrders(); return; }
  const order = stats.orders.find(o => o.num === orderNum);
  if (!order) { loadLiveOrders(); return; }
  const oldTotal = order.total;
  stats.total = parseFloat((stats.total - oldTotal + newTotal).toFixed(2));
  order.total = newTotal;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  if (window.fb_saveStats) {
    try { await window.fb_saveStats(stats); } catch(e) { console.warn('Firebase stats error', e); }
  }
  logActivity('\u270f\ufe0f Precio editado: pedido ' + orderNum + ' \u2014 ' + oldTotal.toFixed(2) + ' \u20ac \u2192 ' + newTotal.toFixed(2) + ' \u20ac');
  loadLiveOrders();
  if (document.getElementById('admin-stats')?.classList.contains('active')) loadDayStats();
}


// ── INIT ADMIN DATA ──
loadSavedMenu();
initTabs();    // re-renderizar pestañas con el menú guardado
renderMenu();  // re-renderizar carta con los datos de localStorage
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
        // Si había horario local, re-evaluar por si Firebase tiene datos distintos
        checkAutoCloseWarning();
        loadOrdersStatus();
      }
    }).catch(() => {
      // Firebase no disponible: usar lo que haya en localStorage
      if (!horarioLocal) aplicarEstadoInicial();
    });
  } else {
    // Firebase no cargado aún: esperar al evento y mientras usar localStorage
    if (!horarioLocal) aplicarEstadoInicial();
    document.addEventListener('firebaseReady', function() {
    // Suprimir warnings de Firebase para no mostrarlos a clientes
    if (window.firebase && window.firebase.database) {
      try { window.firebase.database.enableLogging(false); } catch(e) {}
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

  // Carga inicial de datos críticos desde Firebase (empleados, fichajes, cats, slots)
  function _cargarCriticosDesdeFirebase() {
    if (window.fb_loadEmpleados) {
      window.fb_loadEmpleados().then(arr => {
        if (arr && arr.length) {
          localStorage.setItem('dpf_empleados', JSON.stringify(arr));
          if (document.getElementById('admin-empleados')?.classList.contains('active')) empRenderAdmin();
        }
      }).catch(() => {});
    }
    if (window.fb_loadFichajes) {
      window.fb_loadFichajes().then(arr => {
        if (arr && arr.length) {
          localStorage.setItem('dpf_fichajes', JSON.stringify(arr));
          if (document.getElementById('admin-empleados')?.classList.contains('active')) empRenderAdmin();
        }
      }).catch(() => {});
    }
    if (window.fb_loadBlockedCats) {
      window.fb_loadBlockedCats().then(cats => {
        if (cats) {
          localStorage.setItem(CAT_BLOCK_KEY, JSON.stringify(cats));
          renderMenu();
          if (document.getElementById('admin-pedidos')?.classList.contains('active')) loadCatBlockUI();
        }
      }).catch(() => {});
    }
    if (window.fb_loadSlotConfig) {
      window.fb_loadSlotConfig().then(cfg => {
        if (!cfg) return;
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max)    { localStorage.setItem(SLOT_MAX_KEY, cfg.max); SLOT_MAX = parseInt(cfg.max, 10); }
        renderSlotPicker();
        if (document.getElementById('admin-local')?.classList.contains('active')) loadSlotTurnosUI();
      }).catch(() => {});
    }
    if (window.fb_loadActivityLog) {
      window.fb_loadActivityLog().then(log => {
        if (log && log.length) {
          localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
          if (document.getElementById('admin-log')?.classList.contains('active')) renderActivityLog();
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
        if (!cfg) return;
        localStorage.setItem(SOUND_KEY, JSON.stringify(cfg));
        if (document.getElementById('admin-local')?.classList.contains('active')) loadSoundConfigUI();
      }).catch(() => {});
    }
    // CONFIG DEL LOCAL
    if (window.fb_loadConfig) {
      window.fb_loadConfig().then(c => {
        if (!c) return;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
        Object.assign(CONFIG, c);
        if (document.getElementById('admin-local')?.classList.contains('active')) loadAdminConfig();
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
        updateOrdersUI(val);
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
    // TOKENS DE ACCESO
    if (window.fb_loadUrlToken) {
      window.fb_loadUrlToken().then(t => {
        if (t) { localStorage.setItem(URL_TOKEN_KEY, t); loadUrlTokenUI(); }
      }).catch(() => {});
    }
    if (window.fb_loadBimbaToken) {
      window.fb_loadBimbaToken().then(t => {
        if (t) localStorage.setItem(BIMBA_TOKEN_KEY, t);
      }).catch(() => {});
    }
    // CLAVE DE STOCK
    if (window.fb_loadStockPwd) {
      window.fb_loadStockPwd().then(pwd => {
        if (pwd) localStorage.setItem(STOCK_PWD_KEY, pwd);
      }).catch(() => {});
    }
    // LISTA DE INGREDIENTES DE STOCK — listener en tiempo real
    if (window.fb_listenStockData) {
      window.fb_listenStockData(data => {
        if (!data) return;
        // Ignorar eco de nuestro propio guardado (menos de 2s)
        if (window._stockDataLocalWrite && Date.now() - window._stockDataLocalWrite < 2000) return;
        localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(data));
        if (document.getElementById('admin-stock-config')?.classList.contains('active')) loadStockAdminList();
        // Si el overlay de stock está abierto, actualizar la lista también
        if (document.getElementById('stock-overlay')?.style.display === 'block') renderStockItems();
      });
    }
    // DATOS EMPRESA (razón social + CIF)
    if (window.fb_loadEmpresa) {
      window.fb_loadEmpresa().then(d => {
        if (!d) return;
        if (d.empresa) localStorage.setItem(EMP_EMPRESA_KEY, d.empresa);
        if (d.cif)     localStorage.setItem(EMP_CIF_KEY, d.cif);
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



// ── BANNER PEDIDO ACTIVO ──────────────────────────────────────────────────────
const ACTIVE_ORDER_KEY = 'dpf_active_order';

function _checkActivePedido() {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !data.ts || !data.num) { localStorage.removeItem(ACTIVE_ORDER_KEY); return; }
    const elapsed = Date.now() - data.ts;
    if (elapsed >= getModifyWindowMs()) { localStorage.removeItem(ACTIVE_ORDER_KEY); return; }
    window._lastOrderData = data;
    _showActivePedidoBanner(data, elapsed);
  } catch(e) { localStorage.removeItem(ACTIVE_ORDER_KEY); }
}

function _showActivePedidoBanner(data, elapsed) {
  if (document.getElementById('_active-order-banner')) return;
  const remaining = Math.max(0, getModifyWindowMs() - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const slot = data.slot ? ' - recogida a las ' + data.slot : '';
  const banner = document.createElement('div');
  banner.id = '_active-order-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2000;background:#3D1F0D;color:#FFF8EE;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:\'DM Sans\',sans-serif;box-shadow:0 -4px 24px rgba(61,31,13,0.25)';
  banner.innerHTML =
    '<div style="flex:1;min-width:0">' +
      '<div style="font-size:13px;font-weight:700">Tienes un pedido activo: ' + data.num + slot + '</div>' +
      '<div id="_active-order-timer" style="font-size:11px;opacity:0.7;margin-top:2px">Puedes modificarlo durante ' + mins + ':' + String(secs).padStart(2,'0') + ' min</div>' +
    '</div>' +
    '<button onclick="modificarPedidoFromBanner()" style="flex-shrink:0;background:#E8943A;color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">Modificar</button>' +
    '<button onclick="_dismissActiveBanner()" style="flex-shrink:0;background:none;border:none;color:rgba(255,248,238,0.6);font-size:22px;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>';
  document.body.appendChild(banner);
  window._activeBannerInterval = setInterval(function() {
    const rem = Math.max(0, getModifyWindowMs() - (Date.now() - data.ts));
    if (rem <= 0) { _dismissActiveBanner(); localStorage.removeItem(ACTIVE_ORDER_KEY); return; }
    const m = Math.floor(rem / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const el = document.getElementById('_active-order-timer');
    if (el) el.textContent = 'Puedes modificarlo durante ' + m + ':' + String(s).padStart(2,'0') + ' min';
  }, 1000);
}

function _dismissActiveBanner() {
  const b = document.getElementById('_active-order-banner');
  if (b) b.remove();
  if (window._activeBannerInterval) { clearInterval(window._activeBannerInterval); window._activeBannerInterval = null; }
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
    setTimeout(function() { successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
    return;
  }
  modificarPedido();
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(_checkActivePedido, 800);
});
