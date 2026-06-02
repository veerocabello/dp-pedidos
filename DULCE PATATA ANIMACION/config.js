/* ═══════════════════════════════════════════════════
   Configuración Firebase
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

  // Firebase ya está cargado desde el <head> del HTML (firebase-app-compat.js,
  // firebase-auth-compat.js, firebase-database-compat.js), no hay carga dinámica.
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

  // ── FIREBASE AUTH ──
  // Se inicializa de forma diferida para asegurar que firebase-auth-compat esté cargado
  function _setupFirebaseAuth() {
    console.log('[fb] _setupFirebaseAuth: firebase defined=', typeof firebase !== 'undefined', 'firebase.auth=', typeof (firebase||{}).auth);
    if (typeof firebase === 'undefined' || !firebase.auth) return false;
    try {
      var auth = firebase.auth();
      console.log('[fb] _setupFirebaseAuth: auth instance ready', auth ? true : false);
    } catch (e) {
      console.error('Firebase auth initialization failed:', e);
      return false;
    }

    // Login con email/contraseña
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

    // Cerrar sesión admin
    window.fb_adminLogout = async function() {
      try { await auth.signOut(); } catch(e) {}
    };

    // Verificar si hay sesión activa
    window.fb_getAdminUser = function() {
      return auth.currentUser;
    };

    // Escuchar cambios de sesión
    window.fb_onAuthChange = function(cb) {
      return auth.onAuthStateChanged(cb);
    };

    if (!window._firebaseAuthReady) {
      window._firebaseAuthReady = true;
      if (window._resolveFirebaseAuthReady) window._resolveFirebaseAuthReady();
    }

    return true;
  }

  // Firebase cargado en el <head>: auth disponible inmediatamente
  if (!_setupFirebaseAuth()) {
    console.warn('[fb] firebase.auth no disponible al arrancar — reintentando en 200ms');
    setTimeout(function() {
      if (!_setupFirebaseAuth()) {
        console.error('[fb] firebase.auth sigue sin estar disponible — comprueba que los scripts del <head> cargan correctamente');
      }
    }, 200);
  }


  var tK = function() { return new Date().toISOString().slice(0,10); };
  // helpers
  var jset = function(r,v) { return db.ref(r).set(v); };
  var jget = function(r) { return db.ref(r).once("value"); };
  var jlisten = function(r,cb) { return db.ref(r).on("value",cb); };
  var jparse = function(v) { try{return JSON.parse(v);}catch(e){return null;} };
  var jstr = function(v) { return JSON.stringify(v); };
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
  // CONFIG LOCAL
  window.fb_saveConfig = async function(c) { await jset("config/localConfig",jstr(c)); };
  window.fb_loadConfig = async function() { var sn=await jget("config/localConfig"); return sn.exists()?jparse(sn.val()):null; };
  // OPEN LOCAL
  window.fb_saveOpenLocal = async function(o) { await jset("config/openLocal",o); };
  window.fb_loadOpenLocal = async function() { var sn=await jget("config/openLocal"); return sn.exists()?sn.val():null; };
  window.fb_listenOpenLocal = function(cb) { return jlisten("config/openLocal",function(sn){if(sn.exists())cb(sn.val());}); };
  // ORDERS
  window.fb_saveOrdersOpen = async function(o) { await jset("config/ordersOpen",o); };
  window.fb_loadOrdersOpen = async function() { var sn=await jget("config/ordersOpen"); return sn.exists()?sn.val():null; };
  window.fb_saveOrdersMsg = async function(m) { await jset("config/ordersMsg",m); };
  window.fb_loadOrdersMsg = async function() { var sn=await jget("config/ordersMsg"); return sn.exists()?sn.val():null; };
  // TOKENS
  window.fb_saveUrlToken = async function(t) { await jset("config/urlToken",t); };
  window.fb_loadUrlToken = async function() { var sn=await jget("config/urlToken"); return sn.exists()?sn.val():null; };
  window.fb_saveBimbaToken = async function(t) { await jset("config/bimbaToken",t); };
  window.fb_loadBimbaToken = async function() { var sn=await jget("config/bimbaToken"); return sn.exists()?sn.val():null; };
  // STOCK PWD
  window.fb_saveStockPwd = async function(h) { await jset("config/stockPwd",h); };
  window.fb_loadStockPwd = async function() { var sn=await jget("config/stockPwd"); return sn.exists()?sn.val():null; };
  // ADMIN PWD
  window.fb_saveAdminPwd = async function(h) { await jset("config/adminPwd",h); };
  window.fb_loadAdminPwd = async function() { var sn=await jget("config/adminPwd"); return sn.exists()?sn.val():null; };
  // EMPRESA
  window.fb_saveEmpresa = async function(e,c) { await jset("config/empresa",jstr({empresa:e,cif:c})); };
  window.fb_loadEmpresa = async function() { var sn=await jget("config/empresa"); return sn.exists()?jparse(sn.val()):null; };
  // READY
  window._firebaseReady = true;
  document.dispatchEvent(new Event("firebaseReady"));
  console.log("Firebase compat OK");
  } catch(e) {
    console.error("Firebase error:",e);
    window._firebaseError = e.message;
  }
})();
}
_initFirebase();
