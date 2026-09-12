<?php
// ═══════════════════════════════════════════════════════════
//  BACKUP DIARIO DE FIREBASE — Dulce Patata Food
//
//  Qué hace: descarga una copia completa de la base de datos
//  (pedidos, menú, clientes, empleados, fichajes, todo) y la
//  guarda fuera de public_html, con la fecha en el nombre.
//  Se queda solo con los últimos $diasRetencion días — los
//  backups más viejos se borran solos.
//
//  Firebase ya guarda copias internas unos días por su cuenta,
//  pero esto es una copia propia, aparte, por si algo se borra
//  o se corrompe por error humano y hace falta recuperarlo.
//
//  SOLO se ejecuta por línea de comandos (cron) — no hace falta
//  que sea accesible desde fuera, así que ni lo intenta: si
//  alguien lo pide por navegador, no hace nada (también está
//  bloqueado aparte en .htaccess, esto es una segunda barrera).
//
//  Cómo programarlo en Hostinger (hPanel → Avanzado → Cron Jobs):
//  Comando:   php /home/u817463787/domains/dulcepatatafood.es/public_html/pedidos/backup-firebase.php
//  Frecuencia: una vez al día (p.ej. a las 05:00, hora de poco tráfico)
//
//  Los backups quedan en:
//  /home/u817463787/domains/dulcepatatafood.es/firebase-backups/
//  (fuera de public_html, no accesible por web — misma carpeta que
//  firebase-credenciales.json, twilio-secrets.php, etc.)
// ═══════════════════════════════════════════════════════════

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit;
}

date_default_timezone_set('Europe/Madrid');

$rutaCredenciales = __DIR__ . '/../../firebase-credenciales.json';
$databaseURL = 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app';
$carpetaBackups = __DIR__ . '/../../firebase-backups';
$diasRetencion = 30;

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function log_backup($carpetaBackups, $mensaje) {
    @file_put_contents($carpetaBackups . '/backup.log', '[' . date('Y-m-d H:i:s') . '] ' . $mensaje . "\n", FILE_APPEND);
}

try {
    if (!file_exists($rutaCredenciales)) {
        throw new Exception('No se encuentra firebase-credenciales.json');
    }
    if (!is_dir($carpetaBackups) && !mkdir($carpetaBackups, 0755, true) && !is_dir($carpetaBackups)) {
        throw new Exception('No se pudo crear la carpeta de backups: ' . $carpetaBackups);
    }

    $creds = json_decode(file_get_contents($rutaCredenciales), true);
    if (!$creds || !isset($creds['private_key'])) {
        throw new Exception('Archivo de credenciales de Firebase ilegible');
    }

    $now = time();
    $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    // Solo lectura (.readonly) — este script nunca necesita escribir en la
    // base de datos, así que pide el permiso mínimo posible.
    $claims = base64url_encode(json_encode([
        'iss'   => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.database.readonly https://www.googleapis.com/auth/userinfo.email',
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
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]));
    $tokenResponse = curl_exec($ch);
    curl_close($ch);
    $tokenData = json_decode($tokenResponse, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception('No se pudo obtener el token de acceso: ' . $tokenResponse);
    }

    // Descarga completa de la base de datos — timeout largo aposta: esto lo
    // lanza un cron sin nadie esperando delante, no una petición de un
    // cliente en directo, así que no hay prisa ninguna.
    $ch2 = curl_init($databaseURL . '/.json');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 120);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $tokenData['access_token']]);
    $body = curl_exec($ch2);
    $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($httpCode !== 200 || $body === false) {
        throw new Exception('Firebase respondió con código ' . $httpCode);
    }
    if ($body !== 'null' && json_decode($body) === null) {
        throw new Exception('La respuesta de Firebase no es JSON válido');
    }

    // Se escribe primero con nombre temporal y se renombra al final — así,
    // si el cron se corta a mitad (límite de tiempo del hosting, corte de
    // red, etc.), no queda un backup de hoy a medio escribir sustituyendo a
    // uno de un día anterior que sí estaba completo.
    $nombreFinal = $carpetaBackups . '/backup-' . date('Y-m-d') . '.json';
    $nombreTemporal = $nombreFinal . '.tmp';
    file_put_contents($nombreTemporal, $body);
    rename($nombreTemporal, $nombreFinal);

    // Marca de "último backup con éxito" — la lee estado-servidor.php para
    // avisar (de forma solo informativa, ver ese archivo) si llevamos más
    // de un día sin backup nuevo.
    file_put_contents($carpetaBackups . '/ultimo-ok.txt', (string) $now);

    // Retención: borrar backups de hace más de $diasRetencion días, para no
    // llenar poco a poco el disco del hosting para siempre.
    foreach (glob($carpetaBackups . '/backup-*.json') ?: [] as $f) {
        if (basename($f) === basename($nombreFinal)) continue;
        if (filemtime($f) < $now - ($diasRetencion * 86400)) {
            @unlink($f);
        }
    }

    log_backup($carpetaBackups, 'OK — ' . strlen($body) . ' bytes guardados en ' . basename($nombreFinal));
    echo "Backup completado: " . basename($nombreFinal) . ' (' . strlen($body) . " bytes)\n";

} catch (Exception $e) {
    log_backup($carpetaBackups, 'ERROR — ' . $e->getMessage());
    fwrite(STDERR, 'Error en backup: ' . $e->getMessage() . "\n");
    exit(1);
}
