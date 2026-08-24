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
// Máximo 5 SMS por IP cada 10 minutos
// Máximo 3 SMS por teléfono cada 10 minutos
$tmp_dir   = sys_get_temp_dir();
$window    = 600; // 10 minutos en segundos
$max_ip    = 5;
$max_phone_pre = 3; // antes de leer el teléfono limpiamos la IP
// Límite aparte, más generoso, que SÍ se gasta pase lo que pase con Twilio
// (a diferencia de $max_ip/$max_phone_pre, que solo se gastan si Twilio
// confirma el envío — a propósito, para no penalizar a un cliente real por
// una caída puntual de Twilio — se reserva igual que los demás, solo que
// nunca se libera). Sin este freno
// aparte, una caída SOSTENIDA de Twilio deja $max_ip sin gastarse nunca, y
// la misma IP puede repetir peticiones sin ningún límite justo cuando más
// falta hace uno.
$max_ip_raw = 20;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);

$ip_file = $tmp_dir . '/dpf_sms_ip_' . md5($ip) . '.json';
$ip_file_raw = $tmp_dir . '/dpf_sms_ip_raw_' . md5($ip) . '.json';

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
// peticiones casi simultáneas del mismo teléfono/IP (familia en el mismo
// wifi reintentando, o un script) podían pasar TODAS la comprobación antes
// de que ninguna quedara registrada, superando el límite real durante esa
// ventana. Ahora la reserva ocurre ANTES de llamar a Twilio, dentro del
// mismo candado que la comprobación — y como sigue sin querer penalizar a
// un cliente real por un fallo de Twilio, si el envío falla se libera la
// reserva justa que se acaba de hacer (dpf_liberar_intento) para $ip_file/
// $phone_file. $ip_file_raw (el freno de emergencia, que se gasta SIEMPRE,
// éxito o fallo) simplemente nunca se libera — se reserva aquí igual que
// los otros dos, para que también quede cerrada la misma ventana de
// carrera, pero su reserva ya ES su consumo definitivo.
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
// Twilio no confirma el envío, para que un fallo suyo no le cueste a un
// cliente real uno de sus intentos de $ip_file/$phone_file.
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

$marcaIp = dpf_reservar_intento($ip_file, $max_ip, $window);
if ($marcaIp === false) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}
$marcaIpRaw = dpf_reservar_intento($ip_file_raw, $max_ip_raw, $window);
if ($marcaIpRaw === false) {
    dpf_liberar_intento($ip_file, $marcaIp);
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

// ── FIN RATE LIMITING IP ───────────────────────────────────

require_once __DIR__ . '/twilio-config.php';

$data  = json_decode(file_get_contents('php://input'), true);
$phone = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', (string)$data['phone']) : '';

if (empty($phone)) {
    echo json_encode(['error' => 'Teléfono no válido']);
    exit();
}

// Añadir prefijo español si no lo tiene
if (!str_starts_with($phone, '+')) {
    if (str_starts_with($phone, '34')) {
        $phone = '+' . $phone;
    } else {
        $phone = '+34' . $phone;
    }
}

// Validar formato español
if (!preg_match('/^\+34[6789][0-9]{8}$/', $phone)) {
    echo json_encode(['error' => 'Introduce un número de teléfono español válido']);
    exit();
}

// Comprobar y reservar el límite por teléfono
$phone_file = $tmp_dir . '/dpf_sms_phone_' . md5($phone) . '.json';
$marcaPhone = dpf_reservar_intento($phone_file, $max_phone_pre, $window);
if ($marcaPhone === false) {
    dpf_liberar_intento($ip_file, $marcaIp);
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos para este número. Espera unos minutos.']);
    exit();
}

// ── ENVIAR SMS ─────────────────────────────────────────────

$url = 'https://verify.twilio.com/v2/Services/' . TWILIO_SERVICE_SID . '/Verifications';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'To'      => $phone,
    'Channel' => 'sms'
]));
curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

// $ip_file_raw ya quedó gastado en la reserva de arriba (el freno de
// emergencia se gasta SIEMPRE, éxito o fallo — ver el comentario junto a
// $max_ip_raw más arriba); aquí ya no hace falta tocarlo.
if ($http_code === 201 && isset($result['status']) && $result['status'] === 'pending') {
    // $ip_file y $phone_file ya quedaron reservados/gastados arriba —
    // Twilio ha confirmado el envío, así que no hay nada que liberar.
    echo json_encode(['success' => true]);
} else {
    // Twilio no ha confirmado el envío — liberar las reservas de $ip_file y
    // $phone_file para que este fallo no le cueste a un cliente real
    // ninguno de sus intentos.
    dpf_liberar_intento($ip_file, $marcaIp);
    dpf_liberar_intento($phone_file, $marcaPhone);
    $log_line = '[' . date('Y-m-d H:i:s') . "] [send-code] Twilio ERROR — phone=$phone http_code=$http_code response=$response" . PHP_EOL;
    error_log($log_line, 3, __DIR__ . '/twilio-errores.log');
    echo json_encode(['error' => 'No se pudo enviar el código. Inténtalo de nuevo.']);
}
