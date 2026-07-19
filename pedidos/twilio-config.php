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
// de fallar en silencio con credenciales vacías.
if (!defined('TWILIO_ACCOUNT_SID') || !defined('TWILIO_AUTH_TOKEN') || !defined('TWILIO_SERVICE_SID')
    || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SERVICE_SID) {
    error_log('[twilio-config] ERROR: credenciales de Twilio no disponibles. Revisa twilio-secrets.php.');
}
