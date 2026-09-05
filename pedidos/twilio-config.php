<?php
// ═══════════════════════════════════════════════
//  Credenciales Twilio — se cargan desde un fichero
//  FUERA de public_html, nunca desde .htaccess ni
//  desde código versionado/zipeado.
//
//  El fichero real vive en:
//  /home/u817463787/domains/dulcepatatafood.es/twilio-secrets.php
//
//  Para rotar el Auth Token: edita solo ese fichero
//  externo, NUNCA este.
// ═══════════════════════════════════════════════

$secretsPath = __DIR__ . '/../../twilio-secrets.php';

if (file_exists($secretsPath)) {
    require_once $secretsPath;
} else {
    error_log('[twilio-config] ERROR: no se encuentra twilio-secrets.php fuera de public_html. Revisa la ruta.');
}

// Comprobación de seguridad: si el fichero no cargó bien, avisar en vez
// de fallar en silencio con credenciales vacías. Antes esto solo escribía
// en error_log y seguía adelante — quien incluye este fichero (send-code.php,
// verify-code.php) usa las constantes TWILIO_* directamente más abajo, así
// que si no llegan a definirse, PHP 8 lanza un Error fatal NO capturado en
// cuanto se referencian ("Undefined constant"): un despliegue con la ruta
// de secretos mal puesta se veía como un 500 en blanco sin ningún mensaje
// claro, en vez de un error entendible. Se corta aquí con una respuesta
// JSON limpia — igual que ya hace webhook-incidencia.php para su propio
// secreto (TALLY_SIGNING_SECRET).
if (!defined('TWILIO_ACCOUNT_SID') || !defined('TWILIO_AUTH_TOKEN') || !defined('TWILIO_SERVICE_SID')
    || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SERVICE_SID) {
    error_log('[twilio-config] ERROR: credenciales de Twilio no disponibles. Revisa twilio-secrets.php.');
    http_response_code(500);
    echo json_encode(['error' => 'Configuración incompleta']);
    exit();
}
