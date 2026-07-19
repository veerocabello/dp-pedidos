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

// ── Comprobar el PIN ──
$data = json_decode(file_get_contents('php://input'), true);
$pin = isset($data['pin']) ? (string)$data['pin'] : '';
$hash = hash('sha256', $pin . BIMBA_SALT);

// Todo el ciclo (comprobar el límite, verificar el PIN y anotar/limpiar el
// contador) pasa con el lock exclusivo abierto de principio a fin. Antes el
// límite se consultaba (peek) y se anotaba (check_limit) en dos pasos
// sueltos y sin lock en la lectura: varias peticiones a la vez podían pasar
// el peek antes de que ninguna anotara su fallo, saltándose el máximo de
// intentos por fuerza bruta.
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

if (hash_equals(BIMBA_PWD_HASH, $hash)) {
    // Acierto: no cuenta para el límite, se limpia el contador de fallos de esta IP
    ftruncate($fp, 0);
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['success' => true]);
} else {
    // Fallo: este sí cuenta para el límite
    $log[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['success' => false]);
}
