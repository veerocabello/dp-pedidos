<?php
// ═══════════════════════════════════════════════════════════
//  DIAGNÓSTICO TEMPORAL — leer config/bannerDia directo del
//  servidor de Firebase, sin pasar por el navegador ni por
//  ninguna caché del SDK cliente. BORRAR este archivo en cuanto
//  se resuelva el problema del banner del día.
// ═══════════════════════════════════════════════════════════

header('Content-Type: text/plain; charset=utf-8');

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
        'iss' => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
        'aud' => 'https://oauth2.googleapis.com/token',
        'exp' => $now + 3600,
        'iat' => $now
    ]));
    $signInput = $header . '.' . $claims;
    openssl_sign($signInput, $signature, $creds['private_key'], 'SHA256');
    $jwt = $signInput . '.' . base64url_encode($signature);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]));
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    if (!isset($data['access_token'])) {
        throw new Exception('No se pudo obtener token: ' . $response);
    }
    return $data['access_token'];
}

try {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ch = curl_init($databaseURL . '/config/bannerDia.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP code: $httpCode\n";
    echo "RAW body (tal cual lo manda Firebase):\n";
    echo $raw . "\n\n";

    $decoded = json_decode($raw, true);
    echo "gettype(json_decode(raw)): " . gettype($decoded) . "\n";
    echo "var_export:\n";
    var_export($decoded);
    echo "\n";

    // Si json_decode del valor YA decodificado da algo, es que estaba
    // doblemente codificado (un string que contenía JSON dentro).
    if (is_string($decoded)) {
        $decoded2 = json_decode($decoded, true);
        echo "\nEl valor es un STRING. Su contenido, decodificado otra vez:\n";
        var_export($decoded2);
        echo "\n";
    }
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
}
