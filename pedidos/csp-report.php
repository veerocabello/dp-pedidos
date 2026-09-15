<?php
// ═══════════════════════════════════════════════════════════
//  RECEPTOR DE AVISOS DE LA CSP (Content-Security-Policy)
//  Dulce Patata Food
//
//  Qué hace: cuando el navegador de un visitante bloquea algo por no
//  cumplir la Content-Security-Policy del .htaccess (un script, un
//  estilo, una conexión...), Chrome/Firefox mandan aquí automáticamente
//  un informe con qué se bloqueó y en qué página — sin esto, esos avisos
//  solo se ven en la consola del navegador de quien lo sufre, y nadie se
//  entera nunca de que algo se rompió (un script de terceros que cambia
//  de dominio, una regla de la CSP demasiado estricta para una librería
//  nueva, un intento real de inyección...).
//
//  Se activa añadiendo "report-uri /csp-report.php;" a la cabecera
//  Content-Security-Policy en el .htaccess.
//
//  Guarda un log de texto plano en csp-reports.log, un aviso por línea
//  — se revisa a mano desde el Administrador de archivos, igual que
//  twilio-errores.log. No usa Firebase: son informes automáticos del
//  navegador, no hace falta ni cuenta de servicio ni nada más.
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// ── LÍMITE DE INTENTOS: máximo 30 informes por IP cada 10 minutos ──
// Más alto que en otros endpoints porque un solo fallo real (p.ej. un CDN
// que cambia de dominio) puede disparar el mismo aviso desde MUCHOS
// visitantes distintos casi a la vez — el límite es solo para que nadie
// pueda mandar aquí basura sin límite y llenar el log/el disco, no para
// frenar avisos legítimos en una ráfaga real.
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 30;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_cspreport_ip_' . md5($ip) . '.json';

// Limpieza ocasional: sin esto se acumula un archivo por cada IP distinta
// para siempre (solo se filtran las entradas de dentro, nunca se borra el
// archivo en sí). Se ejecuta con baja probabilidad para no penalizar cada
// petición, y borra archivos sin tocar hace más de 1 hora (bastante más
// que cualquier ventana de límite usada en esta web).
function dpf_gc_rate_limit_files() {
    if (mt_rand(1, 50) !== 1) return; // ~2% de las peticiones
    $ahora = time();
    foreach (glob(sys_get_temp_dir() . '/dpf_*.json') ?: [] as $f) {
        $mtime = @filemtime($f);
        if ($mtime !== false && ($ahora - $mtime) > 3600) {
            @unlink($f);
        }
    }
}
dpf_gc_rate_limit_files();

// Todo esto (leer, contar, decidir, escribir) pasa con el lock exclusivo
// abierto de principio a fin — si no, dos peticiones a la vez podían leer
// el mismo estado antes de que ninguna escribiera y saltarse el límite.
function dpf_cspreport_check_limit($file, $max, $window) {
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

if (!dpf_cspreport_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiados informes.']);
    exit;
}

// El navegador manda "application/csp-report" (formato antiguo, el único
// que soportan todos los navegadores todavía) con el aviso dentro de
// {"csp-report": {...}} — se acepta también JSON plano por si algún día
// se usa una librería de terceros para generar el informe a mano.
$raw = file_get_contents('php://input');
// Nunca confiar en el tamaño que diga el navegador: un informe real de
// CSP pesa poco (unos cientos de bytes) — cualquier cosa mucho más grande
// no es un aviso real del navegador, así que se descarta sin ni
// intentar decodificarla ni escribirla.
if (strlen($raw) > 8192) {
    http_response_code(413);
    echo json_encode(['error' => 'Informe demasiado grande']);
    exit;
}

$data = json_decode($raw, true);
$report = is_array($data) && isset($data['csp-report']) && is_array($data['csp-report'])
    ? $data['csp-report']
    : $data;

if (!is_array($report)) {
    // Cuerpo vacío o no es JSON — algunos navegadores mandan un POST
    // vacío al arrancar la comprobación de la CSP; no es un error real,
    // solo no hay nada que registrar.
    http_response_code(204);
    exit;
}

// Solo se guardan los campos que interesan para depurar, recortados a un
// tamaño razonable — un informe manipulado a mano (esto es un endpoint
// público, cualquiera puede mandarle lo que quiera) no debe poder colar
// texto arbitrariamente largo en el log.
function dpf_csp_campo($report, $clave, $max = 300) {
    $v = $report[$clave] ?? '';
    return mb_substr((string)$v, 0, $max);
}
$linea = [
    'ts'          => date('Y-m-d H:i:s'),
    'ip'          => $ip,
    'documentUri' => dpf_csp_campo($report, 'document-uri'),
    'violatedDir' => dpf_csp_campo($report, 'violated-directive', 100),
    'blockedUri'  => dpf_csp_campo($report, 'blocked-uri', 300),
    'sourceFile'  => dpf_csp_campo($report, 'source-file', 300),
    'lineNumber'  => dpf_csp_campo($report, 'line-number', 20),
];

$logLine = json_encode($linea, JSON_UNESCAPED_UNICODE) . PHP_EOL;
// mkdir()/file_put_contents() NO lanzan Exception si fallan (permisos,
// disco lleno...) — solo devuelven false y emiten un warning de PHP. El
// "@" evita que ese warning se cuele en la respuesta si el hosting tiene
// display_errors activo (mismo motivo que dpf_backup_pedido_local en
// guardar-pedido.php).
@file_put_contents(__DIR__ . '/csp-reports.log', $logLine, FILE_APPEND | LOCK_EX);

http_response_code(204);
