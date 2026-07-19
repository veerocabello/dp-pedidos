<?php
// ═══════════════════════════════════════════════════════════
//  VERIFICACIÓN DEL PIN DE "BIMBA" — EN EL SERVIDOR
//  Dulce Patata Food
//
//  Antes esto se comprobaba en el navegador (el hash del PIN
//  estaba visible en el código JavaScript). Ahora se comprueba
//  aquí, donde nadie puede verlo, y con límite de intentos.
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

// ── LÍMITE DE INTENTOS: máximo 5 intentos por IP cada 10 minutos ──
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 5;

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_bimba_ip_' . md5($ip) . '.json';

function dpf_bimba_check_limit($file, $max, $window) {
    $now = time();
    $log = [];
    if (file_exists($file)) {
        $log = json_decode(file_get_contents($file), true) ?: [];
    }
    $log = array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    if (count($log) >= $max) {
        return false;
    }
    $log[] = $now;
    file_put_contents($file, json_encode(array_values($log)), LOCK_EX);
    return true;
}

// Solo consulta si ya se ha superado el límite, sin registrar un intento nuevo
function dpf_bimba_check_limit_peek($file, $max, $window) {
    $now = time();
    $log = [];
    if (file_exists($file)) {
        $log = json_decode(file_get_contents($file), true) ?: [];
    }
    $log = array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    return count($log) < $max;
}

if (!dpf_bimba_check_limit_peek($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit();
}

// ── Comprobar el PIN ──
$data = json_decode(file_get_contents('php://input'), true);
$pin = isset($data['pin']) ? (string)$data['pin'] : '';

$hash = hash('sha256', $pin . BIMBA_SALT);

if (hash_equals(BIMBA_PWD_HASH, $hash)) {
    // Acierto: no cuenta para el límite, y limpiamos el contador de fallos de esta IP
    if (file_exists($ip_file)) unlink($ip_file);
    echo json_encode(['success' => true]);
} else {
    // Fallo: este sí cuenta para el límite
    dpf_bimba_check_limit($ip_file, $max_ip, $window);
    echo json_encode(['success' => false]);
}
