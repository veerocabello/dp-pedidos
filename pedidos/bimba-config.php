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
// de fallar en silencio con credenciales vacías. Antes esto solo escribía
// en error_log y seguía adelante — bimba-verify.php usa BIMBA_SALT/
// BIMBA_PWD_HASH directamente más abajo, así que si no llegan a
// definirse, PHP 8 lanza un Error fatal NO capturado en cuanto se
// referencian ("Undefined constant"): un despliegue con la ruta del
// secreto mal puesta se veía como un 500 en blanco sin ningún mensaje
// claro. Se corta aquí con una respuesta JSON limpia — igual que ya hace
// twilio-config.php para sus propias credenciales.
if (!defined('BIMBA_SALT') || !defined('BIMBA_PWD_HASH') || !BIMBA_SALT || !BIMBA_PWD_HASH) {
    error_log('[bimba-config] ERROR: PIN de bimba no disponible. Revisa bimba-secreto.php.');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Configuración incompleta']);
    exit();
}
