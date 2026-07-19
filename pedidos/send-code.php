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

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);

$ip_file = $tmp_dir . '/dpf_sms_ip_' . md5($ip) . '.json';

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

// Todo esto (leer, contar, decidir, escribir) pasa con el lock exclusivo
// abierto de principio a fin — si no, dos peticiones a la vez podían leer
// el mismo estado antes de que ninguna escribiera y saltarse el límite.
function dpf_check_limit($file, $max, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return true; // no bloquear tráfico real por un fallo de disco
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return true;
    }
    $now = time();
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $log = json_decode($raw, true) ?: [];
    // Borrar entradas antiguas
    $log = array_values(array_filter($log, function($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    }));
    if (count($log) >= $max) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return false; // bloqueado
    }
    $log[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// Comprobar límite por IP
if (!dpf_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

// ── FIN RATE LIMITING IP ───────────────────────────────────

require_once __DIR__ . '/twilio-config.php';

$data  = json_decode(file_get_contents('php://input'), true);
$phone = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', $data['phone']) : '';

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

// Comprobar límite por teléfono
$phone_file = $tmp_dir . '/dpf_sms_phone_' . md5($phone) . '.json';
if (!dpf_check_limit($phone_file, $max_phone_pre, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos para este número. Espera unos minutos.']);
    exit();
}

// ── ENVIAR SMS ─────────────────────────────────────────────

$url = 'https://verify.twilio.com/v2/Services/' . TWILIO_SERVICE_SID . '/Verifications';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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

if ($http_code === 201 && isset($result['status']) && $result['status'] === 'pending') {
    echo json_encode(['success' => true]);
} else {
    $log_line = '[' . date('Y-m-d H:i:s') . "] [send-code] Twilio ERROR — phone=$phone http_code=$http_code response=$response" . PHP_EOL;
    error_log($log_line, 3, __DIR__ . '/twilio-errores.log');
    echo json_encode(['error' => 'No se pudo enviar el código. Inténtalo de nuevo.']);
}
