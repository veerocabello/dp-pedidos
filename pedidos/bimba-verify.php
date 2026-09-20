<?php
// ═══════════════════════════════════════════════════════════
//  VERIFICACIÓN DEL PIN DE "BIMBA" Y DE LOS TOKENS DE ACCESO
//  POR URL (?bimba=... y ?key=...) — EN EL SERVIDOR
//  Dulce Patata Food
//
//  Antes esto se comprobaba en el navegador: el hash del PIN
//  estaba en el JS, y los tokens de ?bimba=/?key= se descargaban
//  a config/urlToken y config/bimbaToken en el localStorage de
//  CUALQUIER visitante (para que la comparación funcionara sin
//  haber iniciado sesión), lo que significaba que cualquier
//  cliente podía leer su propio localStorage y auto-concederse
//  acceso. Ahora los tres se comprueban aquí, con la cuenta de
//  servicio (el navegador nunca ve el valor real) y con límite
//  de intentos.
// ═══════════════════════════════════════════════════════════

header('Access-Control-Allow-Origin: https://pedidos.dulcepatatafood.es');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false]);
    exit();
}

// ── El mismo PIN y sal que ya tenías, ahora cargados desde fuera de public_html ──
require_once __DIR__ . '/bimba-config.php';

// ── Credenciales de Firebase (solo hacen falta para las acciones de token) ──
$rutaCredenciales = __DIR__ . '/../../firebase-credenciales.json';
$databaseURL = 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app';
// Sin esto, date()/time() usan UTC (el default del servidor) en vez de la
// hora de Madrid — igual que guardar-pedido.php. Lo necesita
// guardarLocalFeeCode (el campo "fecha" se compara con _todayKeyMadrid()
// en el navegador para validar el código del día; con UTC no coincidían
// durante la 1-2h de desfase tras la medianoche de Madrid, el mismo bug
// que ya se arregló en otro sitio de esta web).
date_default_timezone_set('Europe/Madrid');

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function obtenerTokenAcceso($rutaCredenciales) {
    // Cache del token compartido entre todos los endpoints (guardar-pedido.php,
    // fidelizacion.php, juegos.php, fichar-pin-check.php, webhook-incidencia.php,
    // bimba-verify.php) — dura 1 hora entera, pero sin este cache cada
    // petición pedía uno nuevo a Google desde cero (una ida y vuelta HTTP
    // extra, ~100-400ms) aunque el anterior siguiera siendo válido. En una
    // hora punta con muchos pedidos casi a la vez eso multiplicaba
    // peticiones externas y mantenía cada proceso PHP abierto más tiempo
    // del necesario — en un hosting compartido con límite de procesos
    // simultáneos, eso es justo lo que puede tumbar la web si entra mucha
    // gente a la vez.
    $rutaCache = dirname($rutaCredenciales) . '/firebase-token-cache.json';
    // Lectura con bloqueo compartido — antes era un file_get_contents()
    // suelto: si otra petición estaba a mitad de escribir el caché justo
    // en ese instante (dos procesos casi a la vez, típico en una ráfaga de
    // pedidos), esto podía leer el JSON a medio escribir y fallar a
    // decodificarlo (se trata igual que "caché caducado", así que no
    // rompe nada, pero desperdicia la optimización justo cuando más
    // falta hace).
    $cache = null;
    $fpCache = @fopen($rutaCache, 'r');
    if ($fpCache !== false) {
        if (flock($fpCache, LOCK_SH)) {
            $cache = @json_decode(stream_get_contents($fpCache), true);
        }
        fclose($fpCache);
    }
    // Margen de 5 minutos antes de la caducidad real, para no arriesgarse a
    // usar un token que caduque a mitad de la petición.
    if (is_array($cache) && isset($cache['token'], $cache['exp']) && (int)$cache['exp'] > (time() + 300)) {
        return $cache['token'];
    }

    $creds = json_decode(file_get_contents($rutaCredenciales), true);
    if (!$creds || !isset($creds['private_key'])) {
        throw new Exception('No se pudo leer el archivo de credenciales.');
    }
    $now = time();
    $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = base64url_encode(json_encode([
        'iss'   => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'exp'   => $now + 3600,
        'iat'   => $now,
    ]));
    $unsigned = $header . '.' . $claims;
    $signature = '';
    openssl_sign($unsigned, $signature, $creds['private_key'], 'SHA256');
    $jwt = $unsigned . '.' . base64url_encode($signature);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]));
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    if (!isset($data['access_token'])) {
        throw new Exception('No se pudo obtener el token de acceso: ' . $response);
    }

    // Guardar en cache para las próximas peticiones, con bloqueo exclusivo
    // — antes era un file_put_contents() suelto sin flock(): dos procesos
    // escribiendo casi a la vez (varios pedidos pidiendo token nuevo en el
    // mismo instante bajo una ráfaga) podían entrelazar sus escrituras y
    // dejar el archivo con JSON corrupto a medias. Sigue siendo
    // best-effort: si falla escribir el archivo no pasa nada grave,
    // simplemente se pedirá un token nuevo también la próxima vez.
    $fpCache = @fopen($rutaCache, 'c');
    if ($fpCache !== false) {
        if (flock($fpCache, LOCK_EX)) {
            ftruncate($fpCache, 0);
            fwrite($fpCache, json_encode([
                'token' => $data['access_token'],
                'exp'   => $now + (int)($data['expires_in'] ?? 3600),
            ]));
            flock($fpCache, LOCK_UN);
        }
        fclose($fpCache);
    }

    return $data['access_token'];
}
// Lee un nodo de tipo string (config/bimbaToken, config/urlToken) con la cuenta de servicio.
function fbGetStringConCuentaServicio($databaseURL, $path, $rutaCredenciales) {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    // Un fallo de red/timeout aquí (curl_exec devuelve false) antes se
    // trataba igual que "el token no coincide" (json_decode(false) da
    // null, is_string() falso, $val queda '') — un corte breve de Firebase
    // consumía uno de los 5 intentos por IP de alguien con el enlace/PIN
    // correcto. Lanzar aquí deja que el try/catch de quien llama (ya
    // preparado para esto) responda 500 sin gastar el intento, en vez de
    // dar por hecho que el secreto era incorrecto.
    if ($response === false) {
        curl_close($ch);
        throw new Exception('Fallo de red al leer ' . $path . ' de Firebase');
    }
    curl_close($ch);
    $val = json_decode($response, true);
    return is_string($val) ? $val : '';
}
// Lee un nodo cualquiera (objeto/array nativo) con la cuenta de servicio.
function fbGetNodoConCuentaServicio($databaseURL, $path, $rutaCredenciales) {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    // Ver el comentario en fbGetStringConCuentaServicio — mismo motivo.
    if ($response === false) {
        curl_close($ch);
        throw new Exception('Fallo de red al leer ' . $path . ' de Firebase');
    }
    curl_close($ch);
    return json_decode($response, true);
}
// Borra un nodo con la cuenta de servicio — para action=removerDispositivoConfianza
// más abajo, que necesita poder borrar config/trustedDevices/<deviceId> SIN que
// el navegador que llama tenga ya una sesión de admin real (ver el comentario
// junto a esa acción: el auto-borrado de un dispositivo por caducidad/rechazo
// pasa precisamente ANTES de tener sesión, así que exigir sesión de admin para
// esta escritura la dejaba fallando en silencio casi siempre).
function fbEliminarNodoConCuentaServicio($databaseURL, $path, $rutaCredenciales) {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}
// Escribe un nodo (objeto nativo, no un string JSON doblemente
// codificado) con la cuenta de servicio — para action=guardarBannerDia
// más abajo. config/bannerDia hereda el ".write" de "config" (exige
// auth.uid de una de las 2 cuentas de admin) sin tener su propio
// override, a diferencia de su ".read" (público) — un dispositivo con
// solo la sesión "de confianza" (sin sesión real de Firebase Auth
// activa en ese momento) podía leer el banner pero no guardarlo, y el
// guardado desde el navegador fallaba en silencio sin más aviso que
// "no se ha podido sincronizar". Pasarlo por aquí, verificado con el
// mismo dispositivo de confianza que ya usa checkTrustedDevice, evita
// depender de si hay o no una sesión de Firebase Auth viva en concreto.
function fbSetNodoConCuentaServicio($databaseURL, $path, $rutaCredenciales, $valor) {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($valor));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

// ── Guardado genérico "con dispositivo de confianza" — mismo patrón que
// guardarBannerDia: comprueba deviceId+token contra
// config/trustedDevices/<deviceId> y, si es válido, escribe $valor en
// $path con la cuenta de servicio (nunca depende de si hay o no una
// sesión de Firebase Auth realmente viva en el navegador en ese
// instante). Centraliza aquí el bloque que se repetía en cada acción de
// este tipo (avisoSaturacion, y las que se añadan después) — mismos
// pasos, mismos mensajes de error, para que no diverjan por accidente
// entre una acción y otra. Siempre termina la petición (echo + exit) —
// nunca vuelve al llamador.
function dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, $path, $valor) {
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, $path, $rutaCredenciales, $valor);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}

// ── LÍMITE DE INTENTOS: máximo 5 intentos por IP cada 10 minutos ──
// Compartido entre el PIN y los tokens de URL — todos son intentos de
// adivinar el mismo tipo de secreto de acceso al panel.
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 5;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_bimba_ip_' . md5($ip) . '.json';

// Limpieza ocasional: sin esto se acumula un archivo por cada IP distinta
// para siempre (solo se filtran las entradas de dentro, nunca se borra el
// archivo en sí). Se ejecuta con baja probabilidad para no penalizar cada
// petición, y borra archivos sin tocar hace más de 1 hora (bastante más
// que cualquier ventana de límite usada en esta web).
function dpf_gc_rate_limit_files() {
    if (mt_rand(1, 50) !== 1) return; // ~2% de las peticiones
    $ahora = time();
    foreach (glob(sys_get_temp_dir() . '/dpf_*.json') ?: [] as $f) {
        $mtime = @filemtime($f);
        if ($mtime !== false && ($ahora - $mtime) > 3600) {
            @unlink($f);
        }
    }
}
dpf_gc_rate_limit_files();

$data = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? (string)$data['action'] : 'pin';

// Todo el ciclo (comprobar el límite, verificar el secreto y anotar/limpiar
// el contador) pasa con el lock exclusivo abierto de principio a fin — si
// no, varias peticiones a la vez podían pasar la comprobación del límite
// antes de que ninguna anotara su fallo, saltándose el máximo de intentos.
$fp = fopen($ip_file, 'c+');
if ($fp === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
    exit();
}
flock($fp, LOCK_EX);

$now = time();
$size = filesize($ip_file) ?: 0;
$raw = $size > 0 ? fread($fp, $size) : '';
$log = json_decode($raw, true) ?: [];
$log = array_values(array_filter($log, function ($ts) use ($now, $window) {
    return ($now - $ts) < $window;
}));

if (count($log) >= $max_ip) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

function dpf_bimba_acierto($fp) {
    ftruncate($fp, 0);
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['success' => true]);
    exit();
}
function dpf_bimba_fallo($fp, $log, $now) {
    $log[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['success' => false]);
    exit();
}
// ── Variantes "sin lock mantenido" para las acciones que hacen una llamada
// de red a Google/Firebase (obtenerTokenAcceso, fbGet*ConCuentaServicio,
// fbSetNodoConCuentaServicio) entre medias — hasta 8s cada una según
// CURLOPT_TIMEOUT. Antes, TODAS esas acciones se procesaban con el lock de
// dpf_bimba_acierto/dpf_bimba_fallo abierto desde el principio (línea 263)
// hasta el final, así que una llamada lenta a Firebase bloqueaba con
// flock(LOCK_EX) cualquier OTRA petición de la MISMA IP mientras tanto —
// incluida una totalmente distinta (p.ej. guardarBannerDia mientras
// checkTrustedDevice seguía esperando a Firebase). En un hosting compartido
// con pocos workers, unas pocas peticiones lentas desde una IP podían
// encadenarse y agotar el cupo de esa IP sin que fuera un ataque real.
// Aquí solo se mantiene el lock durante la comprobación del límite (rápida,
// sin red) y se libera antes de la llamada de red; el resultado se anota
// reabriendo el archivo un instante al final, igual que antes pero sin
// tener el lock de por medio mientras se espera a Firebase.
function dpf_bimba_liberar_lock_temprano($fp) {
    flock($fp, LOCK_UN);
    fclose($fp);
}
function dpf_bimba_acierto_tras_red($ip_file) {
    $fp2 = @fopen($ip_file, 'c+');
    if ($fp2 !== false) {
        flock($fp2, LOCK_EX);
        ftruncate($fp2, 0);
        flock($fp2, LOCK_UN);
        fclose($fp2);
    }
    echo json_encode(['success' => true]);
    exit();
}
function dpf_bimba_fallo_tras_red($ip_file, $window) {
    $fp2 = @fopen($ip_file, 'c+');
    if ($fp2 !== false) {
        flock($fp2, LOCK_EX);
        $now2 = time();
        $size2 = filesize($ip_file) ?: 0;
        $raw2 = $size2 > 0 ? fread($fp2, $size2) : '';
        $log2 = json_decode($raw2, true) ?: [];
        $log2 = array_values(array_filter($log2, function ($ts) use ($now2, $window) {
            return ($now2 - $ts) < $window;
        }));
        $log2[] = $now2;
        ftruncate($fp2, 0);
        rewind($fp2);
        fwrite($fp2, json_encode($log2));
        fflush($fp2);
        flock($fp2, LOCK_UN);
        fclose($fp2);
    }
    echo json_encode(['success' => false]);
    exit();
}

if ($action === 'checkBimbaToken' || $action === 'checkAdminUrlToken') {
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($token === '' || strlen($token) > 200) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    // Liberar el lock ANTES de las llamadas de red de abajo (ver comentario
    // junto a dpf_bimba_acierto_tras_red más arriba) — el resultado se
    // anota al final reabriendo el archivo un instante.
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $path = $action === 'checkBimbaToken' ? 'config/bimbaToken' : 'config/urlToken';
        $real = fbGetStringConCuentaServicio($databaseURL, $path, $rutaCredenciales);
        // El enlace bimba caduca (ver bimbaGenBimbaToken en slots-alertas.js)
        // para que un enlace olvidado/filtrado no quede válido para siempre.
        // El token admin (?key=) no tiene este campo, así que no caduca.
        $expirado = false;
        if ($action === 'checkBimbaToken') {
            $expiry = fbGetNodoConCuentaServicio($databaseURL, 'config/bimbaTokenExpiry', $rutaCredenciales);
            if (is_numeric($expiry) && (float)$expiry < (microtime(true) * 1000)) $expirado = true;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if (!$expirado && $real !== '' && hash_equals($real, $token)) {
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
}

// ── Dispositivo de confianza: el navegador solo guarda un token aleatorio,
// el servidor guarda su hash en config/trustedDevices/<deviceId> y aquí se
// compara. Si el admin "expulsa" el dispositivo desde el panel, ese nodo
// se borra y esta comprobación empieza a fallar de verdad — no solo hasta
// que recargue la página, como pasaba antes.
if ($action === 'checkTrustedDevice') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    // La caducidad ("expira en N días", configurable desde el panel) antes
    // solo la comprobaba el propio navegador (isTrustedDevice(), ANTES de
    // llamar aquí) — este endpoint solo miraba el hash del token, así que
    // un localStorage restaurado de una copia vieja (o una llamada directa
    // aquí con el deviceId+token guardados) seguía siendo válido para
    // siempre, sin importar los días configurados. Mismo criterio que ya
    // usa checkBimbaToken con bimbaTokenExpiry justo arriba.
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if (!$expiradoDispositivo && $tokenHashReal !== '' && hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
}

// ── Guardar el banner del día pasando por el servidor (ver comentario
// junto a fbSetNodoConCuentaServicio arriba) — misma comprobación de
// dispositivo de confianza que checkTrustedDevice, así que no depende
// de si hay una sesión de Firebase Auth realmente viva en el navegador
// en ese momento concreto. Los campos se sanean aquí (tipo/longitud) —
// nunca se reenvía tal cual lo que mande el cliente.
if ($action === 'guardarBannerDia') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $banner = isset($data['banner']) && is_array($data['banner']) ? $data['banner'] : null;
    if ($deviceId === '' || $token === '' || $banner === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $tiposValidos = ['promo', 'aviso', 'urgente', 'info'];
    $tipo = isset($banner['tipo']) && is_string($banner['tipo']) && in_array($banner['tipo'], $tiposValidos, true) ? $banner['tipo'] : 'promo';
    $text = isset($banner['text']) && is_string($banner['text']) ? mb_substr($banner['text'], 0, 200) : '';
    $sub = isset($banner['sub']) && is_string($banner['sub']) ? mb_substr($banner['sub'], 0, 200) : '';
    $active = !empty($banner['active']);
    $bannerSaneado = ['active' => $active, 'text' => $text, 'sub' => $sub, 'tipo' => $tipo];
    // Liberar el lock antes de las DOS llamadas de red de abajo (get del
    // dispositivo de confianza + set del banner) — juntas pueden tardar
    // hasta 16s.
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'config/bannerDia', $rutaCredenciales, $bannerSaneado);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}

// ── Aviso previo de saturación: config y estado, mismo motivo exacto que
// guardarBannerDia — config/avisoSaturacionConfig y .../avisoSaturacionEstado
// heredan el ".write" de "config" (exige sesión de Firebase Auth real de
// admin), que un "dispositivo de confianza" no garantiza. Encontrado en
// producción: desactivar el aviso en Ajustes parecía guardarse (el
// interruptor cambiaba en pantalla, valor solo local) pero el banner de
// "hay bastante ambiente" seguía saliendo — el guardado de verdad nunca
// llegaba a Firebase. Dos acciones separadas (no una combinada) porque
// _actualizarAvisoSaturacion (pedidos-vivo-cocina.js) recalcula y publica
// el ESTADO solo, con cada cambio en el nº de pedidos pendientes — mucho
// más a menudo que la CONFIG, que solo cambia cuando alguien la toca a
// mano en Ajustes.
if ($action === 'guardarAvisoSaturacionConfig') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cfg = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;
    if ($deviceId === '' || $token === '' || $cfg === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $cfgSaneada = [
        'enabled' => !empty($cfg['enabled']),
        'umbral' => max(1, (int)($cfg['umbral'] ?? 8)),
        'msg' => isset($cfg['msg']) && is_string($cfg['msg']) ? mb_substr($cfg['msg'], 0, 200) : '',
        'minutosSalto' => max(0, (int)($cfg['minutosSalto'] ?? 30)),
        'minPorPedido' => max(0, (int)($cfg['minPorPedido'] ?? 3)),
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/avisoSaturacionConfig', $cfgSaneada);
}
if ($action === 'guardarAvisoSaturacionEstado') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $estadoSaneado = [
        'activo' => !empty($data['activo']),
        'msg' => isset($data['msg']) && is_string($data['msg']) ? mb_substr($data['msg'], 0, 200) : '',
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/avisoSaturacionEstado', $estadoSaneado);
}

// ── Gastos de gestión (Fee1/Fee2), pausar/reabrir pedidos, auto-pausa por
// saturación, pausa exprés y oferta relámpago — misma familia exacta de
// bug que avisoSaturacion*: todos heredan el ".write" de "config" sin
// override propio, así que un guardado desde un "dispositivo de
// confianza" sin sesión de Firebase Auth viva fallaba en silencio.
if ($action === 'guardarFeeConfig' || $action === 'guardarFee2Config') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cfg = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;
    if ($deviceId === '' || $token === '' || $cfg === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $cfgSaneada = [
        'enabled' => !empty($cfg['enabled']),
        'amount' => is_numeric($cfg['amount'] ?? null) ? (float)$cfg['amount'] : 0,
        'label' => isset($cfg['label']) && is_string($cfg['label']) ? mb_substr($cfg['label'], 0, 100) : '',
    ];
    if ($action === 'guardarFee2Config') {
        $cfgSaneada['modo'] = isset($cfg['modo']) && in_array($cfg['modo'], ['fijo', 'bolsas'], true) ? $cfg['modo'] : 'fijo';
    }
    $path = $action === 'guardarFeeConfig' ? 'config/feeConfig' : 'config/fee2Config';
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, $path, $cfgSaneada);
}
if ($action === 'guardarOrdersOpen') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = !empty($data['open']);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/ordersOpen', $valor);
}
if ($action === 'guardarOrdersMsg') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = isset($data['msg']) && is_string($data['msg']) ? mb_substr($data['msg'], 0, 300) : '';
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/ordersMsg', $valor);
}
if ($action === 'guardarAutoPausaConfig') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cfg = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;
    if ($deviceId === '' || $token === '' || $cfg === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $cfgSaneada = [
        'enabled' => !empty($cfg['enabled']),
        'umbral' => max(1, (int)($cfg['umbral'] ?? 8)),
        'msg' => isset($cfg['msg']) && is_string($cfg['msg']) ? mb_substr($cfg['msg'], 0, 200) : '',
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/autoPausaConfig', $cfgSaneada);
}
if ($action === 'guardarAutoPausaEstado') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $estadoSaneado = [
        'activa' => !empty($data['activa']),
        'cooldownUntil' => is_numeric($data['cooldownUntil'] ?? null) ? (float)$data['cooldownUntil'] : 0,
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/autoPausaEstado', $estadoSaneado);
}
if ($action === 'guardarPausaExpresHasta') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = is_numeric($data['hasta'] ?? null) ? (float)$data['hasta'] : 0;
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/pausaExpresHasta', $valor);
}
if ($action === 'guardarOfertaRelampago') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    // null cancela la oferta activa (orCancelar en admin-turnos-descuentos.js).
    $oferta = isset($data['oferta']) && is_array($data['oferta']) ? $data['oferta'] : null;
    $valor = null;
    if ($oferta !== null) {
        $tipo = isset($oferta['tipo']) && in_array($oferta['tipo'], ['total', 'producto'], true) ? $oferta['tipo'] : 'total';
        $productoIds = null;
        if ($tipo === 'producto' && isset($oferta['productoIds']) && is_array($oferta['productoIds'])) {
            $productoIds = array_values(array_map('intval', $oferta['productoIds']));
        }
        $valor = [
            'tipo' => $tipo,
            'productoIds' => $productoIds,
            'pct' => max(1, min(90, (int)($oferta['pct'] ?? 0))),
            'fin' => is_numeric($oferta['fin'] ?? null) ? (float)$oferta['fin'] : 0,
        ];
    }
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/ofertaRelampago', $valor);
}
// ── Turnos/aforo: se guarda como string JSON (igual que jstr() en el
// navegador) porque así lo espera getSlotTurnos()/getSlotMax() al leerlo.
// El array final de turnos ya lo calcula el panel admin en local (añadir/
// quitar/editar turno) — aquí solo se sanea y se escribe, igual que ya
// hacía fb_saveSlotConfig como reserva cuando no había transacción
// disponible.
if ($action === 'guardarSlotConfig') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $turnos = isset($data['turnos']) && is_array($data['turnos']) ? $data['turnos'] : null;
    if ($deviceId === '' || $token === '' || $turnos === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $turnosSaneados = [];
    foreach ($turnos as $t) {
        if (!is_array($t)) continue;
        $start = isset($t['start']) && is_string($t['start']) && preg_match('/^\d{2}:\d{2}$/', $t['start']) ? $t['start'] : '00:00';
        $end = isset($t['end']) && is_string($t['end']) && preg_match('/^\d{2}:\d{2}$/', $t['end']) ? $t['end'] : '00:00';
        $interval = in_array((int)($t['interval'] ?? 30), [15, 20, 30, 45, 60], true) ? (int)$t['interval'] : 30;
        $turnosSaneados[] = ['start' => $start, 'end' => $end, 'interval' => $interval];
    }
    $max = max(1, (int)($data['max'] ?? 4));
    $valor = json_encode(['turnos' => $turnosSaneados, 'max' => $max]);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/slotConfig', $valor);
}
// ── Crear/borrar código de descuento a mano. Antes esto pasaba por una
// transacción nativa de Firebase (fb_transactNative), que exige una
// sesión de Firebase Auth realmente viva — mismo problema que todo lo de
// arriba. Aquí se hace la misma comprobación (nunca pisar un código que
// ya sea premio real de un cliente, campo "origen") pero leyendo y
// escribiendo con la cuenta de servicio en vez de una transacción nativa;
// con el volumen de uso de este panel (una persona, de vez en cuando) el
// hueco entre leer y escribir es irrelevante en la práctica.
if ($action === 'crearCodigoDescuento') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $code = isset($data['code']) && is_string($data['code']) ? strtoupper(trim($data['code'])) : '';
    if ($deviceId === '' || $token === '' || $code === '' || strlen($code) > 40 || !preg_match('/^[A-Z0-9_-]+$/', $code) || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $pct = max(1, min(100, (int)($data['pct'] ?? 0)));
    $maxUses = max(1, (int)($data['maxUses'] ?? 0));
    $dias = is_numeric($data['dias'] ?? null) ? max(1, (int)$data['dias']) : null;
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $existente = fbGetNodoConCuentaServicio($databaseURL, 'discounts/' . $code, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if (is_array($existente) && !empty($existente['origen'])) {
        http_response_code(409);
        echo json_encode(['success' => false, 'reason' => 'origen', 'error' => 'Ese código ya existe como premio de la Ruleta/Rasca de un cliente — no se puede reutilizar.']);
        exit();
    }
    $datos = ['pct' => $pct, 'maxUses' => $maxUses, 'uses' => 0, 'createdAt' => round(microtime(true) * 1000)];
    if ($dias !== null) $datos['expiraEn'] = round(microtime(true) * 1000) + $dias * 24 * 60 * 60 * 1000;
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'discounts/' . $code, $rutaCredenciales, $datos);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}
if ($action === 'borrarCodigoDescuento') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $code = isset($data['code']) && is_string($data['code']) ? strtoupper(trim($data['code'])) : '';
    if ($deviceId === '' || $token === '' || $code === '' || strlen($code) > 40 || !preg_match('/^[A-Z0-9_-]+$/', $code) || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'discounts/' . $code, null);
}

// ── Lista negra de teléfonos, config antispam, SMS obligatorio, código
// "pedido desde el local", descuento estudiante/jubilado y días de
// caducidad del dispositivo de confianza — misma familia de bug otra vez:
// heredan el ".write" de "config" sin override propio.
if ($action === 'guardarBlacklist') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $list = isset($data['list']) && is_array($data['list']) ? $data['list'] : null;
    if ($deviceId === '' || $token === '' || $list === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $saneada = [];
    foreach ($list as $tel) {
        if (is_string($tel) && preg_match('/^\d{9}$/', $tel)) $saneada[] = $tel;
    }
    $saneada = array_values(array_unique($saneada));
    $valor = json_encode($saneada);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/blacklist', $valor);
}
if ($action === 'guardarAntiSpamCfg') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cfg = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;
    if ($deviceId === '' || $token === '' || $cfg === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $cfgSaneada = [
        'cooldown' => max(0, (int)($cfg['cooldown'] ?? 45)),
        'dailyLimit' => max(0, (int)($cfg['dailyLimit'] ?? 3)),
    ];
    $valor = json_encode($cfgSaneada);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/antiSpamCfg', $valor);
}
if ($action === 'guardarSmsVerificacionActiva') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = !empty($data['activa']);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/smsVerificacionActiva', $valor);
}
if ($action === 'guardarLocalFeeCode') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $code = isset($data['code']) && is_string($data['code']) ? mb_substr(strtoupper(trim($data['code'])), 0, 20) : '';
    $valor = ['code' => $code, 'fecha' => date('Y-m-d')];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/localFeeCode', $valor);
}
if ($action === 'guardarStudentDiscountConfig') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = [
        'enabled' => !empty($data['enabled']),
        'pct' => max(0, min(100, (int)($data['pct'] ?? 0))),
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/studentDiscountConfig', $valor);
}
if ($action === 'guardarTrustedDays') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = max(1, (int)($data['days'] ?? 30));
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/trustedDeviceDays', $valor);
}
// ── Ruleta y Rasca: NO viven bajo "config" (nodos propios ruleta_config/
// rasca_config), y su ".write" solo permite el UID admin principal (ni
// siquiera el segundo admin puede escribir ahí directo) — mismo problema
// de fondo (exige sesión de Firebase Auth real), la cuenta de servicio lo
// sortea igual que con "config".
if ($action === 'guardarRuletaConfig' || $action === 'guardarRascaConfig') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cfg = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;
    if ($deviceId === '' || $token === '' || $cfg === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $premios = [];
    if (isset($cfg['premios']) && is_array($cfg['premios'])) {
        foreach ($cfg['premios'] as $p) {
            if (!is_array($p)) continue;
            $nombre = isset($p['nombre']) && is_string($p['nombre']) ? mb_substr($p['nombre'], 0, 60) : '';
            if ($nombre === '') continue;
            $premios[] = [
                'id' => isset($p['id']) && is_string($p['id']) ? mb_substr($p['id'], 0, 60) : uniqid('premio_'),
                'emoji' => isset($p['emoji']) && is_string($p['emoji']) ? mb_substr($p['emoji'], 0, 10) : '🎁',
                'nombre' => $nombre,
                'pct' => max(0, min(100, (int)($p['pct'] ?? 0))),
                'peso' => max(0, (int)($p['peso'] ?? 1)),
            ];
        }
    }
    $cfgSaneada = [
        'activa' => !empty($cfg['activa']),
        'premios' => $premios,
        'topeDiario' => max(0, (int)($cfg['topeDiario'] ?? 0)),
    ];
    $path = $action === 'guardarRuletaConfig' ? 'ruleta_config' : 'rasca_config';
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, $path, $cfgSaneada);
}
// ── Promos: config/promos se guarda como string JSON (igual que jstr() en
// el navegador). El array final ya lo calcula el panel admin en local
// (crear/editar/borrar/ocultar una promo) — aquí solo se sanea y se
// escribe, igual que ya hacía guardarSlotConfig como reserva cuando no
// hay transacción disponible.
if ($action === 'guardarPromos') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $promos = isset($data['promos']) && is_array($data['promos']) ? $data['promos'] : null;
    if ($deviceId === '' || $token === '' || $promos === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $saneadas = [];
    foreach ($promos as $p) {
        if (!is_array($p)) continue;
        $nombre = isset($p['nombre']) && is_string($p['nombre']) ? mb_substr($p['nombre'], 0, 100) : '';
        if ($nombre === '') continue;
        $precio = is_numeric($p['precio'] ?? null) ? max(0, (float)$p['precio']) : 0;
        $precioAntes = is_numeric($p['precioAntes'] ?? null) ? (float)$p['precioAntes'] : null;
        $saneadas[] = [
            'id' => isset($p['id']) && is_string($p['id']) ? mb_substr($p['id'], 0, 60) : ('promo_' . count($saneadas)),
            'nombre' => $nombre,
            'descripcion' => isset($p['descripcion']) && is_string($p['descripcion']) ? mb_substr($p['descripcion'], 0, 300) : '',
            'precio' => $precio,
            'precioAntes' => $precioAntes,
            'opcionQueso' => !empty($p['opcionQueso']),
            'opcionGratinado' => !empty($p['opcionGratinado']),
            'permiteNota' => !empty($p['permiteNota']),
            'visible' => !array_key_exists('visible', $p) || $p['visible'] !== false,
        ];
    }
    $valor = json_encode($saneadas);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/promos', $valor);
}

// ── Horario, categorías bloqueadas, empresa/CIF y auto-borrado de
// historial — última tanda, misma familia de bug (config/* exige sesión
// de Firebase Auth real).
if ($action === 'guardarHorario') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $h = isset($data['horario']) && is_array($data['horario']) ? $data['horario'] : null;
    if ($deviceId === '' || $token === '' || $h === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $horaOk = function ($v) { return is_string($v) && preg_match('/^\d{2}:\d{2}$/', $v); };
    $diasAbiertos = [];
    if (isset($h['diasAbiertos']) && is_array($h['diasAbiertos'])) {
        foreach ($h['diasAbiertos'] as $d) {
            $d = (int)$d;
            if ($d >= 0 && $d <= 6) $diasAbiertos[] = $d;
        }
    }
    $hSaneado = [
        'manOpen' => $horaOk($h['manOpen'] ?? null) ? $h['manOpen'] : '',
        'manClose' => $horaOk($h['manClose'] ?? null) ? $h['manClose'] : '',
        'tarOpen' => $horaOk($h['tarOpen'] ?? null) ? $h['tarOpen'] : '',
        'tarClose' => $horaOk($h['tarClose'] ?? null) ? $h['tarClose'] : '',
        'diasAbiertos' => array_values(array_unique($diasAbiertos)),
        'closedMsgMid' => isset($h['closedMsgMid']) && is_string($h['closedMsgMid']) ? mb_substr($h['closedMsgMid'], 0, 200) : '',
        'closedMsgNight' => isset($h['closedMsgNight']) && is_string($h['closedMsgNight']) ? mb_substr($h['closedMsgNight'], 0, 200) : '',
        'closedMsgDay' => isset($h['closedMsgDay']) && is_string($h['closedMsgDay']) ? mb_substr($h['closedMsgDay'], 0, 200) : '',
    ];
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/horario', $hSaneado);
}
if ($action === 'guardarAutoDeleteDays') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $valor = max(0, (int)($data['days'] ?? 0));
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/autoDeleteDays', $valor);
}
if ($action === 'guardarBlockedCats') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $cats = isset($data['cats']) && is_array($data['cats']) ? $data['cats'] : null;
    if ($deviceId === '' || $token === '' || $cats === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $saneados = [];
    foreach ($cats as $c) {
        if (is_string($c) && $c !== '') $saneados[] = mb_substr($c, 0, 60);
    }
    $valor = json_encode(array_values(array_unique($saneados)));
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/blockedCats', $valor);
}
if ($action === 'guardarEmpresa') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    $empresa = isset($data['empresa']) && is_string($data['empresa']) ? mb_substr($data['empresa'], 0, 200) : '';
    $cif = isset($data['cif']) && is_string($data['cif']) ? mb_substr($data['cif'], 0, 30) : '';
    $valor = json_encode(['empresa' => $empresa, 'cif' => $cif]);
    dpf_bimba_guardar_con_confianza($databaseURL, $rutaCredenciales, $ip_file, $window, $fp, $log, $now, $deviceId, $token, 'config/empresa', $valor);
}
// ── Carta/menú: config/menu se guarda como objeto nativo {items, ts}, con
// el mismo merge "por producto tocado" que ya hacía fb_transactJsonString
// en el navegador (saveMenu, admin-config.js) — se lee lo último que haya
// en Firebase con la cuenta de servicio y solo se sobreescriben los
// productos que ESTE dispositivo tocó de verdad (comparando con la última
// foto sincronizada que mandó junto al guardado); lo demás se respeta tal
// cual esté en el servidor, para no perder cambios de otro dispositivo.
if ($action === 'guardarMenu') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $local = isset($data['local']) && is_array($data['local']) ? $data['local'] : null;
    $antes = isset($data['antes']) && is_array($data['antes']) ? $data['antes'] : [];
    $deletedIds = isset($data['deletedIds']) && is_array($data['deletedIds']) ? array_map('strval', $data['deletedIds']) : [];
    if ($deviceId === '' || $token === '' || $local === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    if (count($local) > 500) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $remoto = fbGetNodoConCuentaServicio($databaseURL, 'config/menu', $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $remotoItems = (is_array($remoto) && isset($remoto['items']) && is_array($remoto['items'])) ? $remoto['items'] : (is_array($remoto) ? $remoto : []);
    $antesPorId = [];
    foreach ($antes as $i) { if (is_array($i) && isset($i['id'])) $antesPorId[(string)$i['id']] = $i; }
    $localPorId = [];
    $localOrden = [];
    foreach ($local as $i) { if (is_array($i) && isset($i['id'])) { $localPorId[(string)$i['id']] = $i; $localOrden[] = (string)$i['id']; } }
    $merged = [];
    $ordenIds = [];
    foreach ($remotoItems as $ri) {
        if (!is_array($ri) || !isset($ri['id'])) continue;
        $rid = (string)$ri['id'];
        $tocadoAqui = json_encode($localPorId[$rid] ?? null) !== json_encode($antesPorId[$rid] ?? null);
        if (array_key_exists($rid, $localPorId)) {
            $merged[$rid] = $tocadoAqui ? $localPorId[$rid] : $ri;
            $ordenIds[] = $rid;
        } elseif (in_array($rid, $deletedIds, true)) {
            // Borrado de verdad — se respeta, no se resucita.
        } else {
            $merged[$rid] = $ri;
            $ordenIds[] = $rid;
        }
    }
    foreach ($localOrden as $lid) {
        if (!array_key_exists($lid, $merged)) {
            $merged[$lid] = $localPorId[$lid];
            $ordenIds[] = $lid;
        }
    }
    $itemsFinal = array_map(function ($id) use ($merged) { return $merged[$id]; }, $ordenIds);
    $valor = ['items' => array_values($itemsFinal), 'ts' => round(microtime(true) * 1000)];
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'config/menu', $rutaCredenciales, $valor);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) { flock($fp2, LOCK_EX); ftruncate($fp2, 0); flock($fp2, LOCK_UN); fclose($fp2); }
        echo json_encode(['success' => true, 'items' => $valor['items']]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}
// ── Stock: config/stockData se guarda como string JSON con merge "por
// grupo tocado" (mismo criterio que saveStockData en stock-empleados.js);
// stock/historial es un array nativo al que solo se AÑADE una entrada
// nueva sobre lo más fresco del servidor (nunca se sobreescribe entero).
if ($action === 'guardarStockData') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $local = isset($data['data']) && is_array($data['data']) ? $data['data'] : null;
    $snapshot = isset($data['snapshot']) && is_array($data['snapshot']) ? $data['snapshot'] : [];
    if ($deviceId === '' || $token === '' || $local === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $remotoRaw = fbGetNodoConCuentaServicio($databaseURL, 'config/stockData', $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $remoto = is_string($remotoRaw) ? (json_decode($remotoRaw, true) ?: []) : (is_array($remotoRaw) ? $remotoRaw : []);
    $grupos = array_unique(array_merge(array_keys($remoto), array_keys($local)));
    $merged = [];
    foreach ($grupos as $g) {
        $tocadoAqui = json_encode($local[$g] ?? null) !== json_encode($snapshot[$g] ?? null);
        $merged[$g] = $tocadoAqui ? ($local[$g] ?? null) : (array_key_exists($g, $remoto) ? $remoto[$g] : ($local[$g] ?? null));
    }
    $valor = json_encode($merged);
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'config/stockData', $rutaCredenciales, $valor);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) { flock($fp2, LOCK_EX); ftruncate($fp2, 0); flock($fp2, LOCK_UN); fclose($fp2); }
        echo json_encode(['success' => true, 'data' => $merged]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}
if ($action === 'guardarStockHistorialEntrada') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $ts = isset($data['ts']) && is_numeric($data['ts']) ? (float)$data['ts'] : null;
    $lines = isset($data['lines']) && is_array($data['lines']) ? $data['lines'] : null;
    if ($deviceId === '' || $token === '' || $ts === null || $lines === null || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $remoto = fbGetNodoConCuentaServicio($databaseURL, 'stock/historial', $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $arr = is_array($remoto) ? array_values($remoto) : [];
    $arr[] = ['ts' => $ts, 'lines' => $lines];
    if (count($arr) > 100) $arr = array_slice($arr, count($arr) - 100);
    try {
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'stock/historial', $rutaCredenciales, $arr);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) { flock($fp2, LOCK_EX); ftruncate($fp2, 0); flock($fp2, LOCK_UN); fclose($fp2); }
        echo json_encode(['success' => true, 'historial' => $arr]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}

// ── Auto-borrado de "dispositivo de confianza" propio (caducado, o
// rechazado por checkTrustedDevice de arriba porque el admin lo expulsó
// desde otro sitio) — setTrustedDevice(false) en admin-accesos.js borraba
// esto escribiendo DIRECTO en Firebase, lo que exige una sesión de admin
// autenticada de verdad en ESE instante. Pero los dos sitios que llaman a
// setTrustedDevice(false) para auto-limpiarse (token caducado localmente,
// o rechazo del servidor) ocurren precisamente ANTES de haber iniciado
// sesión — es la comprobación que decide si hace falta pedir la
// contraseña — así que casi nunca había sesión activa, y esa escritura
// fallaba en silencio casi siempre: el registro se quedaba huérfano en
// Firebase para siempre. Aquí se borra con la cuenta de servicio en vez
// de depender de una sesión, con la MISMA prueba de propiedad que ya usa
// checkTrustedDevice (el hash del token) — así nadie puede borrar el
// registro de otro dispositivo solo adivinando su deviceId.
if ($action === 'removerDispositivoConfianza') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    if ($tokenHashReal === '') {
        // Ya no había nada que borrar (se borró antes, o nunca existió) —
        // no es un fallo del que se deba culpar a quien llama.
        dpf_bimba_acierto_tras_red($ip_file);
    } elseif (hash_equals($tokenHashReal, hash('sha256', $token))) {
        fbEliminarNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
        dpf_bimba_acierto_tras_red($ip_file);
    } else {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
}

// ── Ocultar/restaurar un cliente de la lista "Clientes" pasando por el
// servidor (mismo motivo que guardarBannerDia más arriba: config/* exige
// sesión real de Firebase Auth para escribir, y un dispositivo "de
// confianza" sin esa sesión viva fallaba en silencio). A diferencia del
// banner, aquí además el propio cliente (ocultarCliente/restaurarCliente en
// banner-pdf.js) mandaba la LISTA ENTERA calculada con su copia local, que
// podía estar desactualizada si otro dispositivo había ocultado/restaurado
// a alguien más recientemente — el guardado de uno pisaba sin darse cuenta
// el cambio del otro. Aquí se lee la lista real de Firebase en el momento
// de escribir (no la que mande el cliente) y se añade/quita un único
// teléfono, así que dos dispositivos cambiando cosas distintas casi a la
// vez ya no se pisan entre sí.
if ($action === 'toggleClienteOculto') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $phone = isset($data['phone']) ? preg_replace('/[^0-9]/', '', (string)$data['phone']) : '';
    $ocultar = !empty($data['ocultar']);
    if ($deviceId === '' || $token === '' || !preg_match('/^\d{9}$/', $phone) || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    try {
        $actual = fbGetNodoConCuentaServicio($databaseURL, 'config/clientesOcultos', $rutaCredenciales);
        $lista = is_array($actual) ? array_values($actual) : [];
        $idx = array_search($phone, $lista, true);
        if ($ocultar) {
            if ($idx === false) $lista[] = $phone;
        } elseif ($idx !== false) {
            array_splice($lista, $idx, 1);
        }
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'config/clientesOcultos', $rutaCredenciales, $lista);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) {
            flock($fp2, LOCK_EX);
            ftruncate($fp2, 0);
            flock($fp2, LOCK_UN);
            fclose($fp2);
        }
        echo json_encode(['success' => true, 'lista' => $lista]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}

// ── Cola de impresión pendiente pasando por el servidor (mismo motivo que
// guardarBannerDia/toggleClienteOculto: config/colaImpresionPendiente exige
// sesión real de Firebase Auth, y un dispositivo "de confianza" sin esa
// sesión viva fallaba en silencio — un ticket que no consiguiera imprimirse
// se quedaba SOLO en el localStorage de ese dispositivo, sin respaldo
// ninguno; si se recargaba la página o se borraba su caché, ese ticket
// pendiente desaparecía sin que nadie se enterara).
//
// OJO con el formato: a diferencia de config/bannerDia y
// config/clientesOcultos (objetos/arrays nativos), config/colaImpresionPendiente
// sigue el convenio "string JSON" que ya usa config/empleados/config/fichajes
// (ver fb_transactJsonString en config.js) — el valor guardado en Firebase
// es un STRING que contiene el JSON, no un objeto nativo. Por eso aquí hace
// falta un nivel extra de decode al leer (fbGetNodoConCuentaServicio ya
// hace el primero, el de la respuesta REST) y de encode al escribir, antes
// de pasarlo por fbSetNodoConCuentaServicio.
function _colaImpresionLeerMapa($databaseURL, $rutaCredenciales) {
    $actualRaw = fbGetNodoConCuentaServicio($databaseURL, 'config/colaImpresionPendiente', $rutaCredenciales);
    $mapa = is_string($actualRaw) ? json_decode($actualRaw, true) : null;
    return is_array($mapa) ? $mapa : [];
}
if ($action === 'colaImpresionCambio' || $action === 'colaImpresionLeer') {
    $deviceId = isset($data['deviceId']) ? (string)$data['deviceId'] : '';
    $token = isset($data['token']) ? (string)$data['token'] : '';
    $orderNum = isset($data['orderNum']) ? (string)$data['orderNum'] : '';
    $modo = isset($data['modo']) ? (string)$data['modo'] : '';
    $ticket = isset($data['ticket']) && is_array($data['ticket']) ? $data['ticket'] : null;
    $esCambio = $action === 'colaImpresionCambio';
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)
        || ($esCambio && ($orderNum === '' || strlen($orderNum) > 30 || !in_array($modo, ['agregar', 'quitar'], true)
            || ($modo === 'agregar' && ($ticket === null || strlen(json_encode($ticket)) > 20000))))) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    dpf_bimba_liberar_lock_temprano($fp);
    try {
        $registro = fbGetNodoConCuentaServicio($databaseURL, 'config/trustedDevices/' . $deviceId, $rutaCredenciales);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expiradoDispositivo = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    if ($expiradoDispositivo || $tokenHashReal === '' || !hash_equals($tokenHashReal, hash('sha256', $token))) {
        dpf_bimba_fallo_tras_red($ip_file, $window);
    }
    if (!$esCambio) {
        try {
            $mapa = _colaImpresionLeerMapa($databaseURL, $rutaCredenciales);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error interno']);
            exit();
        }
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) { flock($fp2, LOCK_EX); ftruncate($fp2, 0); flock($fp2, LOCK_UN); fclose($fp2); }
        echo json_encode(['success' => true, 'mapa' => $mapa]);
        exit();
    }
    try {
        $mapa = _colaImpresionLeerMapa($databaseURL, $rutaCredenciales);
        if ($modo === 'agregar') {
            $mapa[$orderNum] = $ticket;
        } else {
            unset($mapa[$orderNum]);
        }
        $ok = fbSetNodoConCuentaServicio($databaseURL, 'config/colaImpresionPendiente', $rutaCredenciales, json_encode($mapa));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($ok) {
        $fp2 = @fopen($ip_file, 'c+');
        if ($fp2 !== false) { flock($fp2, LOCK_EX); ftruncate($fp2, 0); flock($fp2, LOCK_UN); fclose($fp2); }
        echo json_encode(['success' => true]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar en Firebase']);
        exit();
    }
}

// ── Comprobar el PIN (comportamiento por defecto, action: 'pin' u omitido) ──
$pin = isset($data['pin']) ? (string)$data['pin'] : '';
$hash = hash('sha256', $pin . BIMBA_SALT);

if (hash_equals(BIMBA_PWD_HASH, $hash)) {
    dpf_bimba_acierto($fp);
} else {
    dpf_bimba_fallo($fp, $log, $now);
}
