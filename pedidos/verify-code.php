<?php
header('Access-Control-Allow-Origin: https://pedidos.dulcepatatafood.es');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// ── RATE LIMITING ──────────────────────────────────────────
// Máximo 5 intentos de verificación por IP cada 10 minutos
// Máximo 5 intentos de verificación por teléfono cada 10 minutos
// (evita fuerza bruta sobre el código de 4 dígitos = 10.000 combinaciones)
$tmp_dir = sys_get_temp_dir();
$window  = 600; // 10 minutos en segundos
$max_attempts = 5;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);

$ip_file = $tmp_dir . '/dpf_verify_ip_' . md5($ip) . '.json';

// Limpieza ocasional: sin esto se acumula un archivo por cada IP/teléfono
// distinto para siempre (solo se filtran las entradas de dentro, nunca se
// borra el archivo en sí). Se ejecuta con baja probabilidad para no
// penalizar cada petición, y borra archivos sin tocar hace más de 1 hora
// (bastante más que cualquier ventana de límite usada en esta web).
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

// Comprobar y RESERVAR el hueco en una única operación atómica (bajo un
// mismo flock) — antes esto era "consultar" (dpf_peek_limit, sin tocar el
// archivo) y "gastar" (dpf_consume_limit, con flock) en dos pasos
// separados, con la llamada a Twilio entera (hasta 8s) en medio. Varias
// peticiones casi simultáneas del mismo teléfono/IP podían pasar TODAS la
// comprobación antes de que ninguna quedara registrada, superando el
// límite real durante esa ventana — precisamente el límite pensado para
// frenar la fuerza bruta sobre el código de 4 dígitos. Ahora la reserva
// ocurre ANTES de llamar a Twilio; si luego resulta que Twilio no llegó a
// responder de verdad (fallo de red/timeout, no un intento real del
// cliente), se libera con dpf_liberar_intento — mismo criterio que antes,
// solo que ahora sin la ventana de carrera.
// Devuelve la marca de tiempo reservada (para poder liberarla después) o
// false si ya se había alcanzado el límite.
function dpf_reservar_intento($file, $max, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return time(); // sin poder abrir el archivo, no bloquea (fail-open, igual que antes)
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return time();
    }
    $now = time();
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $log = json_decode($raw, true) ?: [];
    $log = array_values(array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    }));
    if (count($log) >= $max) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }
    $log[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $now;
}

// Libera una reserva concreta (por su marca de tiempo) — se llama cuando
// Twilio no llegó a responder de verdad, para que un fallo de red/timeout
// no le cueste a un cliente real uno de sus intentos.
function dpf_liberar_intento($file, $marca) {
    if ($marca === false || $marca === null) return;
    $fp = fopen($file, 'c+');
    if ($fp === false) return;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $log = json_decode($raw, true) ?: [];
    $idx = array_search($marca, $log, true);
    if ($idx !== false) unset($log[$idx]);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($log)));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

// Comprobar y reservar el límite por IP
$marcaIp = dpf_reservar_intento($ip_file, $max_attempts, $window);
if ($marcaIp === false) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

// ── FIN RATE LIMITING IP ───────────────────────────────────

require_once __DIR__ . '/twilio-config.php';

$data = json_decode(file_get_contents('php://input'), true);
$phone = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', (string)$data['phone']) : '';
$code  = isset($data['code'])  ? preg_replace('/[^0-9]/', '', (string)$data['code'])   : '';

if (empty($phone) || empty($code)) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit();
}

if (!str_starts_with($phone, '+')) {
    if (str_starts_with($phone, '34')) {
        $phone = '+' . $phone;
    } else {
        $phone = '+34' . $phone;
    }
}

// Comprobar y reservar el límite por teléfono (independiente del de IP)
$phone_file = $tmp_dir . '/dpf_verify_phone_' . md5($phone) . '.json';
$marcaPhone = dpf_reservar_intento($phone_file, $max_attempts, $window);
if ($marcaPhone === false) {
    dpf_liberar_intento($ip_file, $marcaIp);
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos para este número. Espera unos minutos.']);
    exit();
}

$url = 'https://verify.twilio.com/v2/Services/' . TWILIO_SERVICE_SID . '/VerificationCheck';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'To'   => $phone,
    'Code' => $code
]));
curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

// Un intento solo cuenta de verdad si Twilio ha llegado a evaluar el código
// (aprobado o no) — un fallo de red/timeout de nuestro lado, o un error del
// propio Twilio (http_code distinto de 200), no es un intento del cliente y
// no debe gastarle uno de sus 5. Las reservas ya se hicieron arriba (antes
// de llamar a Twilio, para no dejar la ventana de carrera abierta) — si
// resulta que no fue un intento real, se liberan aquí.
$twilioRespondioDeVerdad = $response !== false && $http_code === 200 && is_array($result) && isset($result['status']);
if (!$twilioRespondioDeVerdad) {
    dpf_liberar_intento($ip_file, $marcaIp);
    dpf_liberar_intento($phone_file, $marcaPhone);
}

if (isset($result['status']) && $result['status'] === 'approved') {
    // Comprobante firmado de que ESTE teléfono verificó su código de
    // verdad con Twilio — guardar-pedido.php lo exige antes de aceptar
    // cualquier pedido (ver validarSmsToken allí). Sin esto, verificar
    // el SMS solo cambiaba lo que mostraba el navegador: el servidor
    // nunca comprobaba que hubiera pasado de verdad, así que cualquiera
    // podía llamar a guardar-pedido.php directamente saltándose el SMS
    // entero. Caduca a los 15 minutos — de sobra para terminar de
    // confirmar el pedido, poco margen para reutilizarlo más tarde.
    // $phone aquí siempre lleva el prefijo "+34" (se añade más arriba si
    // faltaba), así que quitarlo dan los mismos 9 dígitos que usa el
    // resto de la web para este número.
    $telefonoLimpio = preg_replace('/^\+34/', '', $phone);
    $exp = time() + (15 * 60);
    $firma = hash_hmac('sha256', $telefonoLimpio . '|' . $exp, TWILIO_AUTH_TOKEN);
    $smsToken = $telefonoLimpio . '|' . $exp . '|' . $firma;
    echo json_encode(['success' => true, 'verified' => true, 'smsToken' => $smsToken]);
} else {
    if (!$twilioRespondioDeVerdad) {
        $log_line = '[' . date('Y-m-d H:i:s') . "] [verify-code] Twilio ERROR — phone=$phone http_code=$http_code response=$response" . PHP_EOL;
        error_log($log_line, 3, __DIR__ . '/twilio-errores.log');
        echo json_encode(['success' => false, 'verified' => false, 'error' => 'No se pudo comprobar el código ahora mismo. Inténtalo de nuevo.']);
    } else {
        echo json_encode(['success' => false, 'verified' => false, 'error' => 'Código incorrecto']);
    }
}
