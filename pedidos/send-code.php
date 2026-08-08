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

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
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

// Solo consulta, sin gastar ningún intento — para rechazar rápido a quien ya
// esté al límite sin tener que llamar a Twilio.
function dpf_peek_limit($file, $max, $window) {
    $raw = @file_get_contents($file);
    $log = $raw ? (json_decode($raw, true) ?: []) : [];
    $now = time();
    $log = array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    return count($log) >= $max;
}

// Gasta un intento — se llama SOLO cuando Twilio ha confirmado que el SMS se
// ha enviado de verdad. Antes se gastaba el intento ANTES de llamar a
// Twilio, así que si Twilio fallaba (caída puntual, timeout...) un cliente
// real podía agotar sus intentos sin que le hubiera llegado ni un SMS, y
// quedarse bloqueado sin poder pedir el código otra vez hasta pasada la
// ventana de 10 minutos.
function dpf_consume_limit($file, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }
    $now = time();
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $log = json_decode($raw, true) ?: [];
    $log = array_values(array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    }));
    $log[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

// Comprobar límite por IP (sin gastarlo todavía)
if (dpf_peek_limit($ip_file, $max_ip, $window)) {
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

// Comprobar límite por teléfono (sin gastarlo todavía)
$phone_file = $tmp_dir . '/dpf_sms_phone_' . md5($phone) . '.json';
if (dpf_peek_limit($phone_file, $max_phone_pre, $window)) {
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
    // Solo se gastan los intentos de las dos ventanas (IP y teléfono) ahora
    // que Twilio ha confirmado el envío — así un fallo de Twilio nunca
    // consume el intento de un cliente real.
    dpf_consume_limit($ip_file, $window);
    dpf_consume_limit($phone_file, $window);
    echo json_encode(['success' => true]);
} else {
    $log_line = '[' . date('Y-m-d H:i:s') . "] [send-code] Twilio ERROR — phone=$phone http_code=$http_code response=$response" . PHP_EOL;
    error_log($log_line, 3, __DIR__ . '/twilio-errores.log');
    echo json_encode(['error' => 'No se pudo enviar el código. Inténtalo de nuevo.']);
}
