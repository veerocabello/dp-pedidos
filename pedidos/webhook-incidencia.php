<?php
// ═══════════════════════════════════════════════════════════
//  RECEPTOR DE INCIDENCIAS DESDE TALLY
//  Dulce Patata Food
//
//  Qué hace: cuando alguien rellena el formulario de Tally
//  ("¿Algún problema con tu pedido?"), Tally manda aquí los
//  datos automáticamente, y este script los guarda en tu
//  Firebase, en el nodo "incidencias".
//
//  Este archivo SÍ va dentro de public_html/pedidos/ (tiene
//  que ser accesible por Tally desde fuera), pero las
//  credenciales de Firebase se leen desde fuera de
//  public_html, igual que en backup-firebase.php.
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

// Ruta al secreto de firma de Tally (fuera de public_html, mismo sitio que twilio-secrets.php)
$rutaSecretoTally = __DIR__ . '/../../tally-secreto.php';
if (file_exists($rutaSecretoTally)) {
    require_once $rutaSecretoTally;
} else {
    error_log('[webhook-incidencia] ERROR: no se encuentra tally-secreto.php fuera de public_html.');
}

// ── LÍMITE DE INTENTOS: máximo 20 incidencias por IP cada 10 minutos ──
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 20;

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_webhook_ip_' . md5($ip) . '.json';

// Todo esto (leer, contar, decidir, escribir) pasa con el lock exclusivo
// abierto de principio a fin — si no, dos peticiones a la vez podían leer
// el mismo estado antes de que ninguna escribiera y saltarse el límite.
function dpf_webhook_check_limit($file, $max, $window) {
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
    return true;
}

if (!dpf_webhook_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas peticiones.']);
    exit;
}

// ── COMPROBACIÓN DE FIRMA: rechazar cualquier petición que no venga de Tally ──
$rawBodyParaFirma = file_get_contents('php://input');
$firmaRecibida = $_SERVER['HTTP_TALLY_SIGNATURE'] ?? '';

if (!defined('TALLY_SIGNING_SECRET') || !TALLY_SIGNING_SECRET) {
    error_log('[webhook-incidencia] ERROR: TALLY_SIGNING_SECRET no configurado. Rechazando por seguridad.');
    http_response_code(500);
    echo json_encode(['error' => 'Configuración incompleta']);
    exit;
}

$firmaEsperada = base64_encode(hash_hmac('sha256', $rawBodyParaFirma, TALLY_SIGNING_SECRET, true));

if (!$firmaRecibida || !hash_equals($firmaEsperada, $firmaRecibida)) {
    error_log('[webhook-incidencia] Firma inválida o ausente — IP=' . $ip);
    http_response_code(401);
    echo json_encode(['error' => 'Firma no válida']);
    exit;
}

// Ruta a las credenciales (fuera de public_html, la misma carpeta de siempre)
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

try {
    // 1. Leer lo que ha mandado Tally (ya lo leímos antes para comprobar la firma)
    $raw = $rawBodyParaFirma;
    $payload = json_decode($raw, true);

    if (!$payload || !isset($payload['data']['fields'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }

    // 2. Convertir la lista de campos de Tally en algo legible: "Tu nombre" => "Juan"
    $respuestas = [];
    foreach ($payload['data']['fields'] as $campo) {
        $label = $campo['label'] ?? $campo['key'];
        $valor = $campo['value'];
        // Si es una pregunta de opción múltiple, el valor puede venir como lista de IDs;
        // Tally incluye "options" con el texto real cuando aplica.
        if (is_array($valor) && isset($campo['options'])) {
            $textos = [];
            foreach ($campo['options'] as $opt) {
                if (in_array($opt['id'], $valor)) $textos[] = $opt['text'];
            }
            $valor = implode(', ', $textos);
        }
        $respuestas[$label] = $valor;
    }

    // 3. Preparar la incidencia
    $incidencia = [
        'fecha'         => $payload['data']['createdAt'] ?? date('c'),
        'submissionId'  => $payload['data']['submissionId'] ?? '',
        'estado'        => 'nueva',
        'respuestas'    => $respuestas,
    ];

    // 4. Guardar en Firebase (nodo "incidencias", con clave única)
    $token = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/incidencias.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($incidencia));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
    ]);
    $resultado = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('Firebase respondió con error: ' . $resultado);
    }

    http_response_code(200);
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log('[webhook-incidencia] Error interno: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno']);
}
