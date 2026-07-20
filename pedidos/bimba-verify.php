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
    return $data['access_token'];
}
// Lee un nodo de tipo string (config/bimbaToken, config/urlToken) con la cuenta de servicio.
function fbGetStringConCuentaServicio($databaseURL, $path, $rutaCredenciales) {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    curl_close($ch);
    $val = json_decode($response, true);
    return is_string($val) ? $val : '';
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

if ($action === 'checkBimbaToken' || $action === 'checkAdminUrlToken') {
    $token = isset($data['token']) ? (string)$data['token'] : '';
    if ($token === '' || strlen($token) > 200) {
        dpf_bimba_fallo($fp, $log, $now);
    }
    try {
        $path = $action === 'checkBimbaToken' ? 'config/bimbaToken' : 'config/urlToken';
        $real = fbGetStringConCuentaServicio($databaseURL, $path, $rutaCredenciales);
    } catch (Exception $e) {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error interno']);
        exit();
    }
    if ($real !== '' && hash_equals($real, $token)) {
        dpf_bimba_acierto($fp);
    } else {
        dpf_bimba_fallo($fp, $log, $now);
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
