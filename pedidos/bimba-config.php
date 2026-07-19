<?php
// ═══════════════════════════════════════════════
//  PIN de "bimba" — se carga desde un fichero
//  FUERA de public_html, igual que twilio-secrets.php
//  y tally-secreto.php.
//
//  El fichero real vive en:
//  /home/u817463787/domains/dulcepatatafood.es/bimba-secreto.php
//  (un nivel por encima de public_html, NUNCA dentro)
//
//  Para cambiar el PIN: genera el nuevo hash con
//  hash('sha256', $nuevoPin . $salNueva) y edita solo
//  ese fichero externo, NUNCA este.
// ═══════════════════════════════════════════════

$secretoPath = __DIR__ . '/../../bimba-secreto.php';

if (file_exists($secretoPath)) {
    require_once $secretoPath;
} else {
    error_log('[bimba-config] ERROR: no se encuentra bimba-secreto.php fuera de public_html. Revisa la ruta.');
}

// Comprobación de seguridad: si el fichero no cargó bien, avisar en vez
// de fallar en silencio con credenciales vacías.
if (!defined('BIMBA_SALT') || !defined('BIMBA_PWD_HASH') || !BIMBA_SALT || !BIMBA_PWD_HASH) {
    error_log('[bimba-config] ERROR: PIN de bimba no disponible. Revisa bimba-secreto.php.');
}
