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

// ── Comprobar el PIN (comportamiento por defecto, action: 'pin' u omitido) ──
$pin = isset($data['pin']) ? (string)$data['pin'] : '';
$hash = hash('sha256', $pin . BIMBA_SALT);

if (hash_equals(BIMBA_PWD_HASH, $hash)) {
    dpf_bimba_acierto($fp);
} else {
    dpf_bimba_fallo($fp, $log, $now);
}
