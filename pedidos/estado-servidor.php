<?php
// ═══════════════════════════════════════════════════════════
//  ESTADO DEL SERVIDOR — Dulce Patata Food
//
//  Qué hace: comprueba que Firebase y Twilio responden de verdad
//  (no solo que las credenciales están puestas) y devuelve un
//  JSON + código HTTP que cualquier monitor externo (UptimeRobot,
//  healthchecks.io, cron-job.org...) puede vigilar sin tener que
//  entender el JSON — 200 si todo va bien, 503 si algo falla.
//
//  No manda ningún SMS de verdad (costaría dinero en cada
//  comprobación) — la parte de Twilio solo pide los datos de la
//  cuenta con las credenciales configuradas, una llamada de
//  solo-lectura que no consume nada.
//
//  GET/POST, sin cuerpo — pensado para que un monitor externo
//  simplemente pida esta URL cada pocos minutos:
//  https://pedidos.dulcepatatafood.es/estado-servidor.php
// ═══════════════════════════════════════════════════════════

date_default_timezone_set('Europe/Madrid');
header('Content-Type: application/json');

// ── Límite de intentos: no es un endpoint pensado para clientes, pero
// tampoco debe poder usarse para machacar Firebase/Twilio a base de
// peticiones — 30 cada 10 minutos es de sobra para cualquier monitor
// externo normal (que suele pedir cada 1-5 min) y frena un abuso real. ──
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 30;
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_estadoservidor_ip_' . md5($ip) . '.json';

function dpf_check_limit($file, $max, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return true;
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

if (!dpf_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit;
}

$resultado = [
    'ok' => true,
    'hora' => date('d/m/Y H:i:s'),
    'firebase' => ['ok' => false, 'detalle' => ''],
    'twilio' => ['ok' => false, 'detalle' => ''],
];

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// ── Firebase: pedir un token de acceso de verdad y leer un nodo real —
// confirma que las credenciales de servicio siguen siendo válidas Y que
// Firebase responde, no solo que el archivo de credenciales existe. ──
try {
    $rutaCredenciales = __DIR__ . '/../../firebase-credenciales.json';
    $databaseURL = 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app';

    if (!file_exists($rutaCredenciales)) {
        throw new Exception('No se encuentra el archivo de credenciales de Firebase');
    }
    $creds = json_decode(file_get_contents($rutaCredenciales), true);
    if (!$creds || !isset($creds['private_key'])) {
        throw new Exception('Archivo de credenciales de Firebase ilegible');
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
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]));
    $tokenResponse = curl_exec($ch);
    curl_close($ch);
    $tokenData = json_decode($tokenResponse, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception('No se pudo obtener el token de acceso de Google');
    }

    $ch2 = curl_init($databaseURL . '/config/ordersOpen.json');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $tokenData['access_token']]);
    curl_exec($ch2);
    $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);
    if ($httpCode !== 200) {
        throw new Exception('Firebase respondió con código ' . $httpCode);
    }

    $resultado['firebase'] = ['ok' => true, 'detalle' => 'Token obtenido y lectura de prueba correcta'];
} catch (Exception $e) {
    $resultado['ok'] = false;
    $resultado['firebase'] = ['ok' => false, 'detalle' => $e->getMessage()];
}

// ── Twilio: pedir los datos de la propia cuenta (solo-lectura, no manda
// ningún SMS ni consume saldo) para confirmar que las credenciales
// siguen siendo válidas y que Twilio responde. ──
try {
    $secretsPath = __DIR__ . '/../../twilio-secrets.php';
    if (!file_exists($secretsPath)) {
        throw new Exception('No se encuentra el archivo de credenciales de Twilio');
    }
    require $secretsPath;
    if (!defined('TWILIO_ACCOUNT_SID') || !defined('TWILIO_AUTH_TOKEN') || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        throw new Exception('Credenciales de Twilio incompletas');
    }
    $ch3 = curl_init('https://api.twilio.com/2010-04-01/Accounts/' . TWILIO_ACCOUNT_SID . '.json');
    curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch3, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch3, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch3, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
    curl_exec($ch3);
    $httpCode3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
    curl_close($ch3);
    if ($httpCode3 !== 200) {
        throw new Exception('Twilio respondió con código ' . $httpCode3);
    }
    $resultado['twilio'] = ['ok' => true, 'detalle' => 'Credenciales válidas y cuenta accesible'];
} catch (Exception $e) {
    $resultado['ok'] = false;
    $resultado['twilio'] = ['ok' => false, 'detalle' => $e->getMessage()];
}

// ── Backup diario de Firebase: informativo, a propósito NO afecta al "ok"
// general (no queremos que un backup atrasado dispare una alerta de
// "caída" en el monitor externo) — pero si pasan más de 30 horas sin uno
// nuevo, se ve aquí para quien mire este endpoint a mano. Ver
// backup-firebase.php (pensado para un cron diario). ──
$marcaBackup = __DIR__ . '/../../firebase-backups/ultimo-ok.txt';
if (file_exists($marcaBackup)) {
    $ultimoOk = (int) trim(file_get_contents($marcaBackup));
    $horasDesde = round((time() - $ultimoOk) / 3600, 1);
    $resultado['backupFirebase'] = [
        'ok' => $horasDesde < 30,
        'detalle' => $horasDesde < 30
            ? 'Último backup hace ' . $horasDesde . ' horas'
            : 'Sin backup nuevo desde hace ' . $horasDesde . ' horas — revisar el cron',
    ];
} else {
    $resultado['backupFirebase'] = ['ok' => false, 'detalle' => 'Todavía no se ha hecho ningún backup'];
}

if (!$resultado['ok']) {
    http_response_code(503);
}
echo json_encode($resultado, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
