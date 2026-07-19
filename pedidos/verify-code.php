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

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);

$ip_file = $tmp_dir . '/dpf_verify_ip_' . md5($ip) . '.json';

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
if (!dpf_check_limit($ip_file, $max_attempts, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

// ── FIN RATE LIMITING IP ───────────────────────────────────

require_once __DIR__ . '/twilio-config.php';

$data = json_decode(file_get_contents('php://input'), true);
$phone = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', $data['phone']) : '';
$code  = isset($data['code'])  ? preg_replace('/[^0-9]/', '', $data['code'])   : '';

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

// Comprobar límite por teléfono (independiente del límite por IP)
$phone_file = $tmp_dir . '/dpf_verify_phone_' . md5($phone) . '.json';
if (!dpf_check_limit($phone_file, $max_attempts, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados intentos para este número. Espera unos minutos.']);
    exit();
}

$url = 'https://verify.twilio.com/v2/Services/' . TWILIO_SERVICE_SID . '/VerificationCheck';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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

if (isset($result['status']) && $result['status'] === 'approved') {
    echo json_encode(['success' => true, 'verified' => true]);
} else {
    if ($http_code !== 200) {
        $log_line = '[' . date('Y-m-d H:i:s') . "] [verify-code] Twilio ERROR — phone=$phone http_code=$http_code response=$response" . PHP_EOL;
        error_log($log_line, 3, __DIR__ . '/twilio-errores.log');
    }
    echo json_encode(['success' => false, 'verified' => false, 'error' => 'Código incorrecto']);
}
