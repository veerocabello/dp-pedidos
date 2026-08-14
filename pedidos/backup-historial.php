<?php
// ═══════════════════════════════════════════════
//  Backup semanal del historial de pedidos.
//
//  Lee todo el histórico guardado en Firebase (stats/) y lo
//  manda por email en formato CSV. Pensado para lanzarse solo
//  desde un Cron Job de Hostinger (una vez por semana).
//
//  Credenciales en un fichero FUERA de public_html, igual que
//  twilio-secrets.php:
//  /home/u817463787/domains/dulcepatatafood.es/firebase-secrets.php
// ═══════════════════════════════════════════════

$secretsPath = __DIR__ . '/../firebase-secrets.php';
if (file_exists($secretsPath)) {
    require_once $secretsPath;
} else {
    error_log('[backup-historial] ERROR: no se encuentra firebase-secrets.php fuera de public_html.');
    http_response_code(500);
    exit('Config no disponible');
}

// ── Protección: solo por CLI (cron) o con el token secreto correcto ───────
$esCli = (php_sapi_name() === 'cli');
if (!$esCli) {
    $token = $_GET['token'] ?? '';
    if (!defined('BACKUP_SECRET_TOKEN') || !BACKUP_SECRET_TOKEN || !hash_equals(BACKUP_SECRET_TOKEN, (string) $token)) {
        http_response_code(403);
        exit('No autorizado');
    }
}

function base64url($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// Autenticación contra Google usando la cuenta de servicio (JWT Bearer flow)
function getFirebaseAccessToken() {
    $now = time();
    $header = base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = base64url(json_encode([
        'iss'   => FIREBASE_CLIENT_EMAIL,
        'scope' => 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'exp'   => $now + 3600,
        'iat'   => $now,
    ]));
    $unsigned = $header . '.' . $claims;

    $privateKey = openssl_pkey_get_private(FIREBASE_PRIVATE_KEY);
    if (!$privateKey) throw new Exception('Clave privada de Firebase inválida (revisa firebase-secrets.php)');
    openssl_sign($unsigned, $signature, $privateKey, 'SHA256');
    $jwt = $unsigned . '.' . base64url($signature);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);
    if ($httpCode !== 200 || empty($data['access_token'])) {
        throw new Exception('No se pudo obtener token de acceso de Google: ' . $response);
    }
    return $data['access_token'];
}

function descargarHistorial($accessToken) {
    $url = rtrim(FIREBASE_DB_URL, '/') . '/stats.json';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode !== 200) {
        throw new Exception('Error al leer stats de Firebase: HTTP ' . $httpCode);
    }
    return json_decode($response, true) ?: [];
}

// Mismo formato que exportHistorialCSV() del panel web
function construirCSV($statsPorDia) {
    $filas = ['Fecha,Num Pedido,Cliente,Hora,Turno,Total (EUR)'];
    ksort($statsPorDia);
    foreach ($statsPorDia as $fecha => $dia) {
        if (empty($dia['orders'])) continue;
        foreach ($dia['orders'] as $o) {
            $nombre = str_replace('"', '""', $o['name'] ?? '');
            $filas[] = sprintf(
                '%s,%s,"%s",%s,%s,%s',
                $fecha,
                $o['num'] ?? '',
                $nombre,
                $o['time'] ?? '',
                $o['slot'] ?? '',
                number_format($o['total'] ?? 0, 2, '.', '')
            );
        }
    }
    return implode("\r\n", $filas);
}

function enviarEmailConAdjunto($destino, $asunto, $cuerpo, $nombreArchivo, $contenidoArchivo) {
    $boundary = md5(uniqid('', true));
    $desde = defined('BACKUP_EMAIL_FROM') && BACKUP_EMAIL_FROM ? BACKUP_EMAIL_FROM : 'no-reply@dulcepatatafood.es';
    $headers  = "From: $desde\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    $body  = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $body .= $cuerpo . "\r\n\r\n";

    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/csv; name=\"$nombreArchivo\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"$nombreArchivo\"\r\n\r\n";
    $body .= chunk_split(base64_encode($contenidoArchivo)) . "\r\n";
    $body .= "--$boundary--";

    return mail($destino, $asunto, $body, $headers);
}

function logBackup($linea) {
    file_put_contents(__DIR__ . '/backup-historial.log', '[' . date('Y-m-d H:i:s') . '] ' . $linea . "\n", FILE_APPEND);
}

try {
    $accessToken = getFirebaseAccessToken();
    $stats = descargarHistorial($accessToken);
    $csv = construirCSV($stats);

    $numPedidosTotal = 0;
    foreach ($stats as $dia) { $numPedidosTotal += count($dia['orders'] ?? []); }

    $asunto = 'Backup semanal de pedidos - Dulce Patata Food (' . date('d/m/Y') . ')';
    $cuerpo = "Backup automatico del historial de pedidos.\n\n"
        . 'Dias incluidos: ' . count($stats) . "\n"
        . "Pedidos totales: $numPedidosTotal\n\n"
        . 'Adjunto el CSV completo.';
    $ok = enviarEmailConAdjunto(BACKUP_EMAIL_TO, $asunto, $cuerpo, 'historial_pedidos_' . date('Y-m-d') . '.csv', $csv);

    logBackup(($ok ? 'OK' : 'ERROR al enviar mail()') . " — $numPedidosTotal pedidos, " . count($stats) . ' dias');
    echo $ok ? "Backup enviado correctamente.\n" : "Fallo al enviar el email.\n";
} catch (Exception $e) {
    logBackup('ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error: ' . $e->getMessage() . "\n";
}
