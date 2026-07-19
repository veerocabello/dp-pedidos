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

function dpf_check_limit($file, $max, $window) {
    $now = time();
    $log = [];
    if (file_exists($file)) {
        $log = json_decode(file_get_contents($file), true) ?: [];
    }
    // Borrar entradas antiguas
    $log = array_filter($log, function($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    if (count($log) >= $max) {
        return false; // bloqueado
    }
    $log[] = $now;
    file_put_contents($file, json_encode(array_values($log)), LOCK_EX);
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
    echo json_encode(['error' => 'No se pudo enviar el código. Inténtalo de nuevo.']);
}
