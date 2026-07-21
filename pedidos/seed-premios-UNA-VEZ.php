<?php
// ═══════════════════════════════════════════════════════════
//  SCRIPT DE UN SOLO USO — precarga los premios de la ruleta y
//  el rasca con unos valores de ejemplo razonables.
//
//  Cómo usarlo: súbelo junto a los demás archivos PHP, ábrelo una
//  vez en el navegador (https://pedidos.dulcepatatafood.es/seed-
//  premios-UNA-VEZ.php), comprueba el mensaje de "hecho", y
//  BÓRRALO del servidor — no hace falta dejarlo puesto, y no
//  conviene dejar un script que reescribe la configuración
//  abierto sin contraseña más tiempo del necesario.
//
//  Qué hace exactamente: activa la ruleta y el rasca (activa:true)
//  y les pone estos 12 premios (6 cada uno). Si ya tenías premios
//  guardados, ESTE SCRIPT LOS SUSTITUYE — solo ejecútalo si
//  quieres partir de estos valores de ejemplo.
// ═══════════════════════════════════════════════════════════

header('Content-Type: text/html; charset=utf-8');

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
function fbPut($databaseURL, $path, $accessToken, $data) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

$ruletaConfig = [
    'activa' => true,
    'premios' => [
        ['id' => 'rul1', 'emoji' => '🍀', 'nombre' => 'Suerte la próxima', 'pct' => 0,  'peso' => 40],
        ['id' => 'rul2', 'emoji' => '🎁', 'nombre' => '5% descuento',      'pct' => 5,  'peso' => 25],
        ['id' => 'rul3', 'emoji' => '🔥', 'nombre' => '10% descuento',     'pct' => 10, 'peso' => 20],
        ['id' => 'rul4', 'emoji' => '🌟', 'nombre' => '15% descuento',     'pct' => 15, 'peso' => 10],
        ['id' => 'rul5', 'emoji' => '👑', 'nombre' => '25% descuento',     'pct' => 25, 'peso' => 4],
        ['id' => 'rul6', 'emoji' => '💎', 'nombre' => '50% descuento',     'pct' => 50, 'peso' => 1],
    ],
];
$rascaConfig = [
    'activa' => true,
    'premios' => [
        ['id' => 'ras1', 'emoji' => '🎁', 'nombre' => '5% descuento',  'pct' => 5,  'peso' => 40],
        ['id' => 'ras2', 'emoji' => '🔥', 'nombre' => '10% descuento', 'pct' => 10, 'peso' => 30],
        ['id' => 'ras3', 'emoji' => '🌟', 'nombre' => '15% descuento', 'pct' => 15, 'peso' => 18],
        ['id' => 'ras4', 'emoji' => '👑', 'nombre' => '20% descuento', 'pct' => 20, 'peso' => 8],
        ['id' => 'ras5', 'emoji' => '💎', 'nombre' => '40% descuento', 'pct' => 40, 'peso' => 3],
        ['id' => 'ras6', 'emoji' => '🏆', 'nombre' => '60% descuento', 'pct' => 60, 'peso' => 1],
    ],
];

try {
    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $ok1 = fbPut($databaseURL, 'ruleta_config', $accessToken, $ruletaConfig);
    $ok2 = fbPut($databaseURL, 'rasca_config', $accessToken, $rascaConfig);
    echo '<h2>' . ($ok1 && $ok2 ? '✅ Premios guardados correctamente' : '⚠️ Algo falló') . '</h2>';
    echo '<p>Ruleta: ' . ($ok1 ? 'OK' : 'ERROR') . ' — Rasca: ' . ($ok2 ? 'OK' : 'ERROR') . '</p>';
    echo '<p><b>Ahora borra este archivo (seed-premios-UNA-VEZ.php) del servidor.</b></p>';
    echo '<p>Ve al panel de admin → Promociones → elige qué juego quieres activo para clientes.</p>';
} catch (Exception $e) {
    echo '<h2>❌ Error</h2><p>' . htmlspecialchars($e->getMessage()) . '</p>';
}
