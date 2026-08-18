/* ═══════════════════════════════════════════════════
   Configuración Firebase
   ═══════════════════════════════════════════════════
   SEGURIDAD:
   - La apiKey de Firebase es un identificador público (by design de Google).
     La seguridad real está en las Firebase Security Rules de la consola.
   - Asegúrate de que en Firebase Console → Realtime Database → Rules
     tengan autenticación requerida para escritura y lectura sensible.
   - En Firebase Console → Authentication → Settings → Authorized domains
     añade solo tus dominios (dulcepatatafood.es, pedidos.dulcepatatafood.es).
   ═══════════════════════════════════════════════════ */

function _initFirebase() {
(function() {
  window._firebaseModuleLoaded = true;
  window._firebaseAuthReady = false;
  window._firebaseAuthReadyPromise = new Promise(function(resolve) { window._resolveFirebaseAuthReady = resolve; });
  window.fb_adminLogin = null;
  window.fb_adminLogout = null;
  window.fb_getAdminUser = null;
  window.fb_onAuthChange = null;

  window.fb = window.fb || {};
  window.fb.ready = function() { return window._firebaseAuthReadyPromise; };
  window.fb.adminLogin = async function(email, password) {
    if (!window.fb_adminLogin) throw new Error('Firebase Auth no está listo');
    return window.fb_adminLogin(email, password);
  };
  window.fb.adminLogout = async function() {
    if (!window.fb_adminLogout) throw new Error('Firebase Auth no está listo');
    return window.fb_adminLogout();
  };
  window.fb.getAdminUser = function() {
    if (!window.fb_getAdminUser) return null;
    return window.fb_getAdminUser();
  };
  window.fb.onAuthChange = function(cb) {
    if (!window.fb_onAuthChange) throw new Error('Firebase Auth no está listo');
    return window.fb_onAuthChange(cb);
  };

  try {
  var fc = {
    apiKey: "AIzaSyApnK2y64MiUVRMquh-jF2KjzTa6Bfjcvw",
    authDomain: "dulce-patata-e96c2.firebaseapp.com",
    databaseURL: "https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dulce-patata-e96c2",
    storageBucket: "dulce-patata-e96c2.firebasestorage.app",
    messagingSenderId: "750258999945",
    appId: "1:750258999945:web:e05ec45f9c65088495ec58"
  };
  if (!firebase.apps.length) firebase.initializeApp(fc);
  var db = firebase.database();

  function _setupFirebaseAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) return false;
    try {
      var auth = firebase.auth();
    } catch (e) {
      console.error('Firebase auth initialization failed:', e);
      return false;
    }

    window.fb_adminLogin = async function(email, password) {
      try {
        await auth.signInWithEmailAndPassword(email, password);
        return { ok: true };
      } catch(e) {
        var msg = 'Error al iniciar sesión';
        if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential')
          msg = 'Email o contraseña incorrectos';
        else if (e.code === 'auth/too-many-requests')
          msg = 'Demasiados intentos. Espera unos minutos.';
        else if (e.code === 'auth/invalid-email')
          msg = 'Email no válido';
        return { ok: false, msg: msg };
      }
    };

    window.fb_adminLogout = async function() {
      try { await auth.signOut(); } catch(e) {}
    };

    window.fb_getAdminUser = function() {
      return auth.currentUser;
    };

    window.fb_onAuthChange = function(cb) {
      return auth.onAuthStateChanged(cb);
    };

    if (!window._firebaseAuthReady) {
      window._firebaseAuthReady = true;
      if (window._resolveFirebaseAuthReady) window._resolveFirebaseAuthReady();
    }

    // Login anónimo automático: permite que las Firebase Security Rules
    // exijan "auth != null" en escritura sin que el cliente público tenga
    // que identificarse con nada. Si ya hay sesión (anónima o de admin),
    // no se vuelve a iniciar sesión.
    auth.onAuthStateChanged(function(user) {
      if (!user) {
        auth.signInAnonymously().catch(function(e) {
          console.error('[fb] signInAnonymously falló:', e);
        });
      }
    });

    return true;
  }

  if (!_setupFirebaseAuth()) {
    setTimeout(function() {
      if (!_setupFirebaseAuth()) {
        console.error('[fb] firebase.auth no disponible — comprueba que los scripts del <head> cargan correctamente');
      }
    }, 200);
  }

  var tK = function() { return new Date().toISOString().slice(0,10); };
  var jset = function(r,v) { return db.ref(r).set(v); };
  var jget = function(r) { return db.ref(r).once("value"); };
  var jlisten = function(r,cb) { return db.ref(r).on("value",cb); };
  var jparse = function(v) { try{return JSON.parse(v);}catch(e){return null;} };
  var jstr = function(v) { return JSON.stringify(v); };
  // Escritura ATÓMICA de un nodo que guarda un objeto/array como STRING JSON
  // (el mismo formato que jset/jget en toda la web). mutatorFn recibe el
  // valor YA PARSEADO actual (o null si no existía) y debe devolver el
  // nuevo valor a guardar. Usa una transacción real de Firebase: si dos
  // dispositivos escriben casi a la vez, Firebase reintenta automáticamente
  // con el dato más reciente en vez de que uno pise el cambio del otro.
  window.fb_transactJsonString = async function(path, mutatorFn) {
    var result = await db.ref(path).transaction(function(current) {
      var parsed = null;
      if (typeof current === 'string') {
        parsed = jparse(current);
      } else if (current !== null && current !== undefined) {
        parsed = current;
      }
      var updated = mutatorFn(parsed);
      return jstr(updated);
    });
    if (!result.committed) return null;
    return result.snapshot.exists() ? jparse(result.snapshot.val()) : null;
  };
  // Igual que fb_transactJsonString pero para nodos que guardan el objeto/
  // array nativo de Firebase directamente (sin pasar por JSON.stringify),
  // como pp2/*.
  window.fb_transactNative = async function(path, mutatorFn) {
    var result = await db.ref(path).transaction(function(current) {
      return mutatorFn(current === undefined ? null : current);
    });
    if (!result.committed) return null;
    return result.snapshot.exists() ? result.snapshot.val() : null;
  };
  // SLOTS
  window.fb_incrementSlot = async function(s) { await db.ref("slots/"+tK()+"/"+s).transaction(function(v){return(v||0)+1;}); };
  window.fb_getSlotCount = async function(s) { var sn=await jget("slots/"+tK()+"/"+s); return sn.exists()?sn.val():0; };
  window.fb_getAllSlots = async function() { var sn=await jget("slots/"+tK()); return sn.exists()?sn.val():{}; };
  window.fb_listenSlots = function(cb) { return jlisten("slots/"+tK(),function(sn){cb(sn.exists()?sn.val():{});}); };
  window.fb_resetSlots = async function() { await jset("slots/"+tK(),null); };
  // STATS
  window.fb_saveStats = async function(st) { await jset("stats/"+st.date,st); };
  window.fb_getStats = async function(d) { var sn=await jget("stats/"+d); return sn.exists()?sn.val():null; };
  window.fb_listenStats = function(d,cb) { return jlisten("stats/"+d,function(sn){cb(sn.exists()?sn.val():null);}); };
  // ORDER STATUS
  window.fb_setOrderStatus = async function(n,st) { await jset("orderStatus/"+tK()+"/"+n.replace("#","").replace("T",""),st); };
  window.fb_saveTicket = async function(num, data) { await jset("tickets/"+tK()+"/"+num.replace("#","").replace("T",""), data); };
  window.fb_loadAllTicketDates = async function() { var sn=await jget("tickets"); return sn.exists()?Object.keys(sn.val()):[]; };
  window.fb_loadTicketsByDate = async function(fecha) { var sn=await jget("tickets/"+fecha); return sn.exists()?sn.val():null; };
  window.fb_getOrderStatuses = async function() { var sn=await jget("orderStatus/"+tK()); return sn.exists()?sn.val():{}; };
  window.fb_listenOrderStatuses = function(cb) { return jlisten("orderStatus/"+tK(),function(sn){cb(sn.exists()?sn.val():{});}); };
  // OPEN
  window.fb_setOpen = async function(o) { await jset("config/open",o); };
  window.fb_listenOpen = function(cb) { return jlisten("config/open",function(sn){cb(sn.exists()?sn.val():true);}); };
  // HISTORIAL
  window.fb_loadHistorial = async function(days) {
    days=days||30; var res=[],now=new Date(),proms=[];
    for(var i=0;i<days;i++){(function(k){proms.push(jget("stats/"+k).then(function(sn){if(sn.exists()){var v=sn.val();v.date=k;res.push(v);}}).catch(function(){}));})(new Date(now.getTime()-i*86400000).toISOString().slice(0,10));}
    await Promise.all(proms); return res.sort(function(a,b){return a.date.localeCompare(b.date);});
  };
  // HORARIO
  window.fb_saveHorario = async function(h) { await jset("config/horario",h); };
  window.fb_loadHorario = async function() { var sn=await jget("config/horario"); return sn.exists()?sn.val():null; };
  window.fb_listenHorario = function(cb) { return jlisten("config/horario",function(sn){cb(sn.exists()?sn.val():null);}); };
  // MENU
  window.fb_saveMenu = async function(d) { await jset("config/menu",jstr(d)); };
  window.fb_loadMenu = async function() { var sn=await jget("config/menu"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenMenu = function(cb) { return jlisten("config/menu",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // ACTIVITY LOG
  window.fb_saveActivityLog = async function(l) { await jset("config/activityLog",jstr(l)); };
  window.fb_loadActivityLog = async function() { var sn=await jget("config/activityLog"); return sn.exists()?jparse(sn.val()):null; };
  // AUTO-BORRADO
  window.fb_saveAutoDelete = async function(d) { await jset("config/autoDeleteDays",d); };
  window.fb_loadAutoDelete = async function() { var sn=await jget("config/autoDeleteDays"); return sn.exists()?sn.val():null; };
  // SONIDO
  window.fb_saveSoundConfig = async function(c) { await jset("config/soundConfig",jstr(c)); };
  window.fb_loadSoundConfig = async function() { var sn=await jget("config/soundConfig"); return sn.exists()?jparse(sn.val()):null; };
  // EMPLEADOS
  window.fb_saveEmpleados = async function(a) { await jset("config/empleados",jstr(a)); };
  window.fb_loadEmpleados = async function() { var sn=await jget("config/empleados"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenEmpleados = function(cb) { return jlisten("config/empleados",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // FICHAJES
  window.fb_saveFichajes = async function(a) { await jset("config/fichajes",jstr(a)); };
  window.fb_loadFichajes = async function() { var sn=await jget("config/fichajes"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenFichajes = function(cb) { return jlisten("config/fichajes",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // CATS BLOQUEADAS
  window.fb_saveBlockedCats = async function(a) { await jset("config/blockedCats",jstr(a)); };
  window.fb_loadBlockedCats = async function() { var sn=await jget("config/blockedCats"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenBlockedCats = function(cb) { return jlisten("config/blockedCats",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // SLOTS CONFIG
  window.fb_saveSlotConfig = async function(t,m) { await jset("config/slotConfig",jstr({turnos:t,max:m})); };
  window.fb_loadSlotConfig = async function() { var sn=await jget("config/slotConfig"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenSlotConfig = function(cb) { return jlisten("config/slotConfig",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // FICHAR TOKEN
  window.fb_saveFicharToken = async function(t) { await jset("config/ficharToken",t); };
  window.fb_loadFicharToken = async function() { var sn=await jget("config/ficharToken"); return sn.exists()?sn.val():null; };
  // STOCK HISTORIAL
  window.fb_saveStockHistorial = async function(h) { await jset("stock/historial",h); };
  window.fb_loadStockHistorial = async function() { var sn=await jget("stock/historial"); return sn.exists()?sn.val():null; };
  window.fb_listenStockHistorial = function(cb) {
    return jlisten("stock/historial",function(sn){
      var d=sn.exists()?sn.val():null;
      if(d) localStorage.setItem("dpf_stock_historial",jstr(d));
      cb(d);
    });
  };
  // STOCK DATA
  window.fb_saveStockData = async function(d) { await jset("config/stockData",jstr(d)); };
  window.fb_loadStockData = async function() { var sn=await jget("config/stockData"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenStockData = function(cb) { return jlisten("config/stockData",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // PP2
  var PP2K={"state":"dpf_pedidos_prov_list","custom":"dpf_pp_custom_items","hidden":"dpf_pp_hidden_items","provHab":"dpf_pp_prov_habitual","minimos":"dpf_pp_minimos","historial":"dpf_pp_historial","customProvs":"dpf_pp_custom_provs","order":"dpf_pp_order"};
  window.fb_savePP2 = async function(k,v) { await jset("pp2/"+k,v); };
  window.fb_loadPP2 = async function(k) { var sn=await jget("pp2/"+k); return sn.exists()?sn.val():null; };
  window.fb_listenPP2 = function(cb) {
    return jlisten("pp2",function(sn){
      if(!sn.exists()) return; var d=sn.val();
      Object.keys(PP2K).forEach(function(k){if(d[k]!==undefined)localStorage.setItem(PP2K[k],jstr(d[k]));});
      cb(d);
    });
  };
  window.fb_syncPP2toLocal = async function() {
    var sn=await jget("pp2"); if(!sn.exists()) return; var d=sn.val();
    Object.keys(PP2K).forEach(function(k){if(d[k]!==undefined)localStorage.setItem(PP2K[k],jstr(d[k]));});
    try{var sh=await jget("stock/historial");if(sh.exists())localStorage.setItem("dpf_stock_historial",jstr(sh.val()));}catch(e){}
  };
  // FIDELIZACIÓN (sello digital, indexado por teléfono)
  // Estructura: fidelizacion/<telefono> = { nombre, sellos, premioDisponible, historialCanjes: [{fecha, ticket}] }
  window.fb_saveFidelizacionCliente = async function(telefono, data) { await jset("fidelizacion/"+telefono, jstr(data)); };
  window.fb_deleteFidelizacionCliente = async function(telefono) { await db.ref("fidelizacion/"+telefono).remove(); };
  window.fb_loadFidelizacionCliente = async function(telefono) { var sn=await jget("fidelizacion/"+telefono); return sn.exists()?jparse(sn.val()):null; };
  window.fb_loadFidelizacionAll = async function() {
    var sn = await jget("fidelizacion");
    if (!sn.exists()) return null;
    var raw = sn.val();
    var parsed = {};
    Object.keys(raw).forEach(function(tel) {
      parsed[tel] = typeof raw[tel] === 'string' ? jparse(raw[tel]) : raw[tel];
    });
    return parsed;
  };
  window.fb_listenFidelizacionAll = function(cb) { return jlisten("fidelizacion",function(sn){cb(sn.exists()?sn.val():{});}); };

  window.fb_saveConfig = async function(c) { await jset("config/localConfig",jstr(c)); };
  window.fb_loadConfig = async function() { var sn=await jget("config/localConfig"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_savePromos = async function(p) { await jset("config/promos",jstr(p)); };
  window.fb_loadPromos = async function() { var sn=await jget("config/promos"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenPromos = function(cb) { return jlisten("config/promos",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // OPEN LOCAL
  window.fb_saveOpenLocal = async function(o) { await jset("config/openLocal",o); };
  window.fb_loadOpenLocal = async function() { var sn=await jget("config/openLocal"); return sn.exists()?sn.val():null; };
  window.fb_listenOpenLocal = function(cb) { return jlisten("config/openLocal",function(sn){if(sn.exists())cb(sn.val());}); };
  // ORDERS
  window.fb_saveOrdersOpen = async function(o) { await jset("config/ordersOpen",o); };
  window.fb_loadOrdersOpen = async function() { var sn=await jget("config/ordersOpen"); return sn.exists()?sn.val():null; };
  // En tiempo real (no solo al cargar la página) — para que si la
  // auto-pausa por saturación cierra/reabre los pedidos, un cliente que ya
  // tenga la web abierta lo vea al momento sin tener que recargar.
  window.fb_listenOrdersOpen = function(cb) { return jlisten("config/ordersOpen", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  window.fb_saveOrdersMsg = async function(m) { await jset("config/ordersMsg",m); };
  window.fb_loadOrdersMsg = async function() { var sn=await jget("config/ordersMsg"); return sn.exists()?sn.val():null; };
  window.fb_listenOrdersMsg = function(cb) { return jlisten("config/ordersMsg", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  // AUTO-PAUSA POR SATURACIÓN
  window.fb_saveAutoPausaConfig = async function(enabled, umbral, msg) { await jset("config/autoPausaConfig", {enabled:enabled, umbral:umbral, msg:msg}); };
  window.fb_listenAutoPausaConfig = function(cb) { return jlisten("config/autoPausaConfig", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  // Estado compartido entre dispositivos: si la pausa actual la activó el
  // propio sistema (para saber si puede reabrirla sola) y hasta cuándo no
  // debe tocar nada tras un toggle manual del admin.
  window.fb_saveAutoPausaEstado = async function(activa, cooldownUntil) { await jset("config/autoPausaEstado", {activa:activa, cooldownUntil:cooldownUntil||0}); };
  window.fb_listenAutoPausaEstado = function(cb) { return jlisten("config/autoPausaEstado", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  // AVISO SUAVE DE SATURACIÓN (previo a la auto-pausa)
  window.fb_saveAvisoSaturacionConfig = async function(enabled, umbral, msg, minutosSalto, minPorPedido) { await jset("config/avisoSaturacionConfig", {enabled:enabled, umbral:umbral, msg:msg, minutosSalto:minutosSalto, minPorPedido:minPorPedido}); };
  window.fb_listenAvisoSaturacionConfig = function(cb) { return jlisten("config/avisoSaturacionConfig", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  // Estado PÚBLICO del aviso (activo/mensaje ahora mismo) — a diferencia de
  // avisoSaturacionConfig (los umbrales, solo para admin), esto sí lo lee
  // cualquier visitante anónimo para pintar el banner, porque solo una
  // sesión de admin/cocina puede contar los pedidos pendientes de verdad
  // (stats/ y orderStatus/ son de solo-admin) — el admin publica aquí el
  // resultado ya calculado, nunca los datos en bruto.
  window.fb_saveAvisoSaturacionEstado = async function(activo, msg) { await jset("config/avisoSaturacionEstado", {activo:activo, msg:msg||''}); };
  window.fb_listenAvisoSaturacionEstado = function(cb) { return jlisten("config/avisoSaturacionEstado", function(sn){ cb(sn.exists()?sn.val():{activo:false,msg:''}); }); };
  // PAUSA EXPRÉS (pausa temporal con cuenta atrás, independiente de la auto-pausa)
  window.fb_savePausaExpresHasta = async function(ts) { await jset("config/pausaExpresHasta", ts||0); };
  window.fb_listenPausaExpresHasta = function(cb) { return jlisten("config/pausaExpresHasta", function(sn){ cb(sn.exists()?sn.val():0); }); };
  // OFERTA RELÁMPAGO (descuento por tiempo limitado, lanzada a mano desde el
  // panel). null = sin oferta activa; "activa" se decide comparando el campo
  // fin contra la hora actual (nunca un booleano aparte), así que cancelarla
  // es simplemente borrar el nodo.
  window.fb_saveOfertaRelampago = async function(oferta) { await jset("config/ofertaRelampago", oferta); };
  window.fb_listenOfertaRelampago = function(cb) { return jlisten("config/ofertaRelampago", function(sn){ cb(sn.exists()?sn.val():null); }); };
  // TOKENS
  window.fb_saveUrlToken = async function(t) { await jset("config/urlToken",t); };
  window.fb_loadUrlToken = async function() { var sn=await jget("config/urlToken"); return sn.exists()?sn.val():null; };
  window.fb_saveBimbaToken = async function(t) { await jset("config/bimbaToken",t); };
  window.fb_loadBimbaToken = async function() { var sn=await jget("config/bimbaToken"); return sn.exists()?sn.val():null; };
  window.fb_saveBimbaTokenExpiry = async function(ts) { await jset("config/bimbaTokenExpiry",ts); };
  // STOCK PWD
  window.fb_saveStockPwd = async function(h) { await jset("config/stockPwd",h); };
  window.fb_loadStockPwd = async function() { var sn=await jget("config/stockPwd"); return sn.exists()?sn.val():null; };
  // EMPRESA
  window.fb_saveEmpresa = async function(e,c) { await jset("config/empresa",jstr({empresa:e,cif:c})); };
  window.fb_loadEmpresa = async function() { var sn=await jget("config/empresa"); return sn.exists()?jparse(sn.val()):null; };
  // CÓDIGOS DE DESCUENTO
  window.fb_saveDiscount = async function(code, data) { await jset("discounts/" + code.toUpperCase(), data); };
  window.fb_loadDiscounts = async function() { var sn=await jget("discounts"); return sn.exists()?sn.val():{}; };
  window.fb_getDiscount = async function(code) { var sn=await jget("discounts/"+code.toUpperCase()); return sn.exists()?sn.val():null; };
  window.fb_deleteDiscount = async function(code) { await jset("discounts/"+code.toUpperCase(), null); };
  window.fb_incrementDiscountUse = async function(code) {
    await firebase.database().ref("discounts/"+code.toUpperCase()+"/uses").transaction(function(v){ return (v||0)+1; });
  };
  // RULETA DE PREMIOS — un registro por giro, para ver en el panel cuánta gente juega
  window.fb_pushRuletaGiro = async function(data) {
    await db.ref("ruleta_giros/" + data.fecha).push(data);
  };
  window.fb_loadRuletaGiros = async function(fecha) {
    var sn = await jget("ruleta_giros/" + fecha);
    return sn.exists() ? sn.val() : {};
  };
  window.fb_loadRascaGiros = async function(fecha) {
    var sn = await jget("rasca_giros/" + fecha);
    return sn.exists() ? sn.val() : {};
  };
  window.fb_saveRuletaConfig = async function(config) {
    await jset("ruleta_config", config);
  };
  window.fb_loadRuletaConfig = async function() {
    var sn = await jget("ruleta_config");
    return sn.exists() ? sn.val() : null;
  };
  window.fb_listenRuletaConfig = function(cb) { return jlisten("ruleta_config", function(sn){ cb(sn.exists()?sn.val():null); }); };
  // RASCA Y GANA — mismo formato que la ruleta (premios con peso)
  window.fb_saveRascaConfig = async function(config) { await jset("rasca_config", config); };
  window.fb_loadRascaConfig = async function() {
    var sn = await jget("rasca_config");
    return sn.exists() ? sn.val() : null;
  };
  window.fb_listenRascaConfig = function(cb) { return jlisten("rasca_config", function(sn){ cb(sn.exists()?sn.val():null); }); };
  // JUEGO ACTIVO — qué juego (si alguno) ve el cliente en la carta
  window.fb_saveJuegoActivo = async function(juego) { await jset("config/juegoActivo", juego); };
  window.fb_loadJuegoActivo = async function() { var sn=await jget("config/juegoActivo"); return sn.exists()?sn.val():'ninguno'; };
  window.fb_listenJuegoActivo = function(cb) { return jlisten("config/juegoActivo", function(sn){ cb(sn.exists()?sn.val():'ninguno'); }); };
  // LOGIN LOG (intentos de acceso al panel)
  window.fb_saveLoginLog = async function(entry) {
    var sid = entry.ts || Date.now();
    await jset("loginLog/"+sid, entry);
  };
  window.fb_loadLoginLog = async function() {
    var sn=await jget("loginLog");
    if (!sn.exists()) return [];
    var val = sn.val();
    return Object.values(val).sort(function(a,b){ return b.ts - a.ts; }).slice(0, 100);
  };
  // SESIONES ACTIVAS
  window.fb_registerSession = async function(sessionData) {
    var sid = sessionData.sid;
    await jset("activeSessions/"+sid, sessionData);
  };
  window.fb_unregisterSession = async function(sid) {
    await jset("activeSessions/"+sid, null);
  };
  window.fb_listenActiveSessions = function(cb) {
    return jlisten("activeSessions", function(sn){ cb(sn.exists() ? sn.val() : {}); });
  };
  window.fb_killSession = async function(sid) {
    await jset("activeSessions/"+sid+"/killed", true);
  };
  // CONTADORES DE PEDIDO (por día — contador atómico para generateOrderNumber)
  window.fb_getDayCounter = async function() {
    var todayKey = new Date().toISOString().slice(0,10);
    var sn = await jget("counters/"+todayKey);
    return sn.exists() ? sn.val() : 0;
  };
  window.fb_resetDayCounter = async function() {
    var todayKey = new Date().toISOString().slice(0,10);
    await jset("counters/"+todayKey, 0);
  };
  // BLACKLIST (teléfonos bloqueados)
  window.fb_saveBlacklist = async function(list) { await jset("config/blacklist", jstr(list)); };
  window.fb_loadBlacklist = async function() { var sn=await jget("config/blacklist"); return sn.exists()?jparse(sn.val()):null; };
  window.fb_listenBlacklist = function(cb) { return jlisten("config/blacklist",function(sn){if(sn.exists())cb(jparse(sn.val()));}); };
  // ANTISPAM CONFIG (cooldown + dailyLimit)
  window.fb_saveAntiSpamCfg = async function(cfg) { await jset("config/antiSpamCfg", jstr(cfg)); };
  window.fb_loadAntiSpamCfg = async function() { var sn=await jget("config/antiSpamCfg"); return sn.exists()?jparse(sn.val()):null; };
  // ESTADO DE LA ÚLTIMA COPIA DE SEGURIDAD (lo escribe backup-firebase.php,
  // fuera de public_html, con la cuenta de servicio tras cada ejecución del
  // cron — aquí solo se lee para mostrarlo en el panel).
  window.fb_loadBackupStatus = async function() { var sn=await jget("config/backupStatus"); return sn.exists()?sn.val():null; };
  // PHONE LOG (registro de pedidos por teléfono para cooldown)
  window.fb_logPhoneOrder = async function(phone, ts) {
    var todayKey = new Date().toISOString().slice(0,10);
    await firebase.database().ref("phoneLog/"+todayKey+"/"+phone).transaction(function(cur) {
      if (!cur) return { count:1, timestamps:[ts] };
      cur.count = (cur.count||0)+1;
      if (!cur.timestamps) cur.timestamps=[];
      cur.timestamps.push(ts);
      return cur;
    });
  };
  window.fb_getPhoneLog = async function(phone) {
    var todayKey = new Date().toISOString().slice(0,10);
    var sn=await jget("phoneLog/"+todayKey+"/"+phone);
    return sn.exists()?sn.val():null;
  };
  // FEE CONFIG
  window.fb_saveFeeConfig = async function(enabled, amount, label) { await jset("config/feeConfig", {enabled:enabled, amount:amount, label:label}); };
  window.fb_listenFeeConfig = function(cb) { return jlisten("config/feeConfig", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  // Lectura directa de una sola vez — igual que fb_loadLocalFeeCode: el
  // listener en tiempo real puede tardar en entregar su primer valor más
  // de lo que tarda un cliente en rellenar el formulario y confirmar, y
  // hasta entonces getFeeEnabled()/getFee2Enabled() devuelven el valor por
  // defecto (desactivado) aunque estén activados de verdad.
  window.fb_loadFeeConfig = async function() { var sn = await jget("config/feeConfig"); return sn.exists() ? sn.val() : null; };
  // FEE2 CONFIG (segundo gasto fijo, independiente del anterior)
  window.fb_saveFee2Config = async function(enabled, amount, label) { await jset("config/fee2Config", {enabled:enabled, amount:amount, label:label}); };
  window.fb_saveStudentDiscountConfig = async function(enabled, pct) { await jset("config/studentDiscountConfig", {enabled:enabled, pct:pct}); };
  window.fb_listenStudentDiscountConfig = function(cb) { return jlisten("config/studentDiscountConfig", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  window.fb_loadStudentDiscountConfig = async function() { var sn = await jget("config/studentDiscountConfig"); return sn.exists() ? sn.val() : null; };
  window.fb_listenFee2Config = function(cb) { return jlisten("config/fee2Config", function(sn){ if(sn.exists()) cb(sn.val()); }); };
  window.fb_loadFee2Config = async function() { var sn = await jget("config/fee2Config"); return sn.exists() ? sn.val() : null; };
  // CÓDIGO "PEDIDO DESDE EL LOCAL" (quita los gastos de gestión y, si es de
  // hoy, también salta el SMS — ver validarSmsToken/localCodeValido en
  // guardar-pedido.php). Se guarda con la fecha del día en que se creó para
  // que caduque solo a la mañana siguiente sin tener que borrarlo a mano —
  // y como solo se guarda un código a la vez, generar uno nuevo de urgencia
  // desde el mostrador invalida el anterior al instante, lo sobrescribe.
  // Normaliza: si en Firebase quedó el formato antiguo (string suelto, de
  // antes de que el código caducara cada día), se trata como código sin
  // fecha — no coincidirá con el día de hoy, así que simplemente deja de
  // aplicar hasta que se guarde de nuevo desde el panel (que ya escribe
  // siempre el formato nuevo).
  var _normLocalCode = function(v) {
    if (v && typeof v === 'object') return { code: v.code || '', fecha: v.fecha || '' };
    return { code: v || '', fecha: '' };
  };
  window.fb_saveLocalFeeCode = async function(code) { await jset("config/localFeeCode", { code: code, fecha: tK() }); };
  window.fb_listenLocalFeeCode = function(cb) { return jlisten("config/localFeeCode", function(sn){ cb(sn.exists()?_normLocalCode(sn.val()):{code:"",fecha:""}); }); };
  // Lectura directa de una sola vez — para cuando hace falta el valor YA
  // (comprobar el ?local= del QR) y no se puede esperar a que el listener
  // en tiempo real reciba su primer dato, que en una visita nueva/incógnito
  // puede tardar más de lo que tarda el cliente en rellenar el formulario.
  window.fb_loadLocalFeeCode = async function() { var sn = await jget("config/localFeeCode"); return sn.exists() ? _normLocalCode(sn.val()) : {code:"",fecha:""}; };
  // TIEMPO DE ESPERA ENTRE TICKETS (pedidos hechos con QR desde tienda)
  window.fb_saveTiendaEsperaMinutos = async function(min) { await jset("config/tiendaEsperaMinutos", min); };
  window.fb_listenTiendaEsperaMinutos = function(cb) { return jlisten("config/tiendaEsperaMinutos", function(sn){ cb(sn.exists()?sn.val():0); }); };
  // INCIDENCIAS DE CLIENTES (formulario Tally "¿Algún problema con tu pedido?",
  // recibidas y guardadas por webhook-incidencia.php en el nodo "incidencias")
  window.fb_listenIncidencias = function(cb) { return jlisten("incidencias", function(sn){ cb(sn.exists()?sn.val():{}); }); };
  window.fb_setIncidenciaEstado = async function(key, estado) { await jset("incidencias/"+key+"/estado", estado); };
  // ESTADO DE CONEXIÓN — ".info/connected" es la única señal fiable de que
  // el cliente tiene una conexión REAL con Firebase en cada momento;
  // _firebaseReady (más abajo) solo confirma que el SDK cargó al principio,
  // no que los datos en tiempo real sigan llegando después.
  window.fb_listenConnectionState = function(cb) { return db.ref(".info/connected").on("value", function(sn){ cb(sn.val() === true); }); };
  window.fb_checkConnection = async function() { var sn = await db.ref(".info/connected").once("value"); return sn.val() === true; };
  // READY
  window._firebaseReady = true;
  document.dispatchEvent(new Event("firebaseReady"));
  } catch(e) {
    console.error("Firebase error:",e);
    window._firebaseError = e.message;
  }
})();
}
_initFirebase();
