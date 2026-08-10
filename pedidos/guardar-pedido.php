<?php
// ═══════════════════════════════════════════════════════════
//  GUARDAR PEDIDO — Dulce Patata Food
//
//  Qué hace: cuando un cliente confirma un pedido (tras la
//  verificación SMS, o si esta falla y se deja pasar igualmente,
//  como ya hacía la web), este script guarda el ticket completo y
//  actualiza las estadísticas del día en Firebase, usando la cuenta
//  de servicio.
//
//  Por qué hace falta: tickets/ y stats/ exigen en las reglas de
//  seguridad el UID exacto del admin, tanto para leer como para
//  escribir. El navegador de un cliente anónimo (que es lo que es
//  cualquiera que pida desde su móvil sin haber iniciado sesión de
//  admin) nunca tiene ese UID, así que esas escrituras fallaban en
//  silencio — el pedido no llegaba a verse en cocina ni en las
//  estadísticas de ningún otro dispositivo. Ahora las hace este
//  script, que sí tiene permiso completo.
//
//  POST (JSON):
//   {
//     "orderNum": "T1234",
//     "name": "...", "phone": "...", "notes": "...",
//     "slotTime": "20:30" | null,
//     "items": [{"name":"...","qty":1,"subtotal":6.9,...}, ...],
//     "total": 12.34,
//     "discountCode": "ABC123" | null
//   }
//   → {"success":true}
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// ── LÍMITE DE INTENTOS: máximo 20 pedidos guardados por IP cada 10 minutos ──
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 20;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_guardarpedido_ip_' . md5($ip) . '.json';

// Limpieza ocasional de archivos de límite viejos (ver otros endpoints)
function dpf_gc_rate_limit_files() {
    if (mt_rand(1, 50) !== 1) return;
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
// abierto de principio a fin (ver el resto de endpoints para el porqué).
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

// php://input solo se puede leer una vez — se captura aquí (para la
// comprobación de "ping" de abajo) y se reutiliza más adelante en vez de
// volver a leerlo, que devolvería una cadena vacía la segunda vez.
$rawInput = file_get_contents('php://input');

// ── Comprobación de estado del sistema (panel Alertas → "Estado del
// sistema") ── Se resuelve ANTES del límite de intentos de pedidos y con su
// propio límite, mucho más permisivo — si compartiera el mismo contador que
// los pedidos reales (20/10min), comprobar el estado varias veces seguidas
// desde el panel (típicamente durante una hora punta, justo cuando más lo
// necesitas) podría dejar sin cupo a clientes de verdad que compartan la
// misma IP del wifi del local. No toca Firebase ni credenciales, así que se
// puede responder incluso antes de cargarlas.
$payloadPing = json_decode($rawInput, true);
if (is_array($payloadPing) && ($payloadPing['action'] ?? '') === 'ping') {
    if (!dpf_check_limit($tmp_dir . '/dpf_ping_ip_' . md5($ip) . '.json', 120, $window)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

if (!dpf_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit;
}

// ── Credenciales de Firebase (fuera de public_html, mismo sitio de siempre) ──
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

// ── Lectura/escritura CONDICIONAL de un nodo JSON cualquiera (con ETag) ──
function fbGetConEtag($databaseURL, $path, $accessToken) {
    $etag = null;
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'X-Firebase-ETag: true']);
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$etag) {
        if (stripos($header, 'ETag:') === 0) $etag = trim(substr($header, 5));
        return strlen($header);
    });
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return ['data' => $data, 'etag' => $etag];
}

function fbPutSiCoincide($databaseURL, $path, $accessToken, $data, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    $headers = ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'];
    if ($etag) $headers[] = 'If-Match: ' . $etag;
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

// Igual que _normOrderKey() en pedidos-vivo-cocina.js: quita '#' y una 'T' inicial
function normOrderKey($num) {
    return preg_replace('/^T/', '', str_replace('#', '', (string)$num));
}

// ── Tiempo estimado de espera para la pantalla de "pedido confirmado" ──
// Un cliente anónimo no puede leer stats/ ni orderStatus/ (solo-admin), así
// que este cálculo lo hace el propio servidor con la cuenta de servicio, y
// se manda ya hecho en la respuesta del pedido. Misma fórmula que
// _estimarMinutosEspera() en admin-config.js (JS), para que cliente y panel
// no digan números distintos si algún día se llega a mostrar en los dos sitios.
function calcularTiempoEsperaEstimado($databaseURL, $accessToken, $fecha) {
    $cfgResp = fbGetConEtag($databaseURL, 'config/avisoSaturacionConfig', $accessToken);
    $cfg = is_array($cfgResp['data']) ? $cfgResp['data'] : null;
    if (!$cfg || empty($cfg['enabled'])) {
        return ['pendientesHoy' => null, 'minutosEsperaExtra' => 0];
    }
    $statsResp = fbGetConEtag($databaseURL, 'stats/' . $fecha, $accessToken);
    $stats = is_array($statsResp['data']) ? $statsResp['data'] : null;
    $orders = ($stats && is_array($stats['orders'] ?? null)) ? $stats['orders'] : [];
    $statusResp = fbGetConEtag($databaseURL, 'orderStatus/' . $fecha, $accessToken);
    $statuses = is_array($statusResp['data']) ? $statusResp['data'] : [];

    $pendientes = 0;
    foreach ($orders as $o) {
        $key = normOrderKey($o['num'] ?? '');
        $estado = $statuses[$key] ?? 'nuevo';
        if ($estado !== 'listo' && $estado !== 'cancelado' && $estado !== 'entregado') $pendientes++;
    }

    $umbral = is_numeric($cfg['umbral'] ?? null) ? (int)$cfg['umbral'] : 8;
    $minPorPedido = is_numeric($cfg['minPorPedido'] ?? null) ? (int)$cfg['minPorPedido'] : 3;
    $minutosExtra = 0;
    if ($pendientes >= $umbral) {
        $minutosExtra = max(0, ($pendientes - $umbral + 1) * $minPorPedido);
    }
    return ['pendientesHoy' => $pendientes, 'minutosEsperaExtra' => $minutosExtra];
}

// Quita caracteres de control (todo lo que no sea texto normal, salvo
// saltos de línea) de un texto libre del cliente. El texto del pedido
// (nombre, notas, nombres de producto) acaba tal cual en el ticket que
// imprime la impresora térmica (js/index.js) como bytes ESC/POS — sin
// esto, un pedido con secuencias de escape (ESC/GS) coladas en el nombre
// o las notas podría mandar comandos a la impresora (cortar papel sin
// parar, abrir el cajón, etc.) en vez de imprimirse como texto.
function dpf_limpiar_texto($str) {
    return preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/', '', (string)$str);
}

// ── Copia de seguridad local, independiente de Firebase ──
// Si Firebase alguna vez fallara (caída del servicio, cuota agotada, fallo
// de red del servidor hacia Google...) el pedido ya se ha guardado aquí
// antes de intentarlo — un archivo de texto plano en el propio hosting,
// uno por día, que se puede abrir con el Administrador de archivos de
// Hostinger sin depender de nada externo. Es solo un backup de lectura
// (se añade una línea por pedido, nunca se borra ni se modifica desde
// aquí) — no sustituye a Firebase para nada de lo que ya hace la web.
function dpf_backup_pedido_local($ticketData) {
    // mkdir()/file_put_contents() NO lanzan Exception si fallan (permisos,
    // disco lleno...) — solo devuelven false y emiten un warning de PHP. Sin
    // el "@" ese warning podría imprimirse en la propia respuesta (si el
    // hosting tiene display_errors activo) y colar texto antes del JSON que
    // espera el navegador, rompiendo el "success":true de un pedido que en
    // realidad SÍ se guardó bien en Firebase. Por eso aquí no se confía en
    // try/catch (no atraparía este tipo de fallo) — se suprime el warning
    // con "@" y se comprueba el valor de retorno a mano.
    try {
        $dir = __DIR__ . '/backup-pedidos';
        if (!is_dir($dir)) {
            if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
                error_log('[guardar-pedido] backup local: no se pudo crear ' . $dir);
                return;
            }
            // .htaccess por si el hosting permite listar directorios — el
            // backup contiene nombres y teléfonos de clientes, no debe ser
            // accesible desde el navegador.
            @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n    Order deny,allow\n    Deny from all\n</IfModule>\n");
        }
        $file = $dir . '/pedidos-' . date('Y-m-d') . '.log';
        $linea = json_encode($ticketData, JSON_UNESCAPED_UNICODE) . "\n";
        if (@file_put_contents($file, $linea, FILE_APPEND | LOCK_EX) === false) {
            error_log('[guardar-pedido] backup local: no se pudo escribir en ' . $file);
        }
    } catch (Exception $e) {
        // Nunca debe romper el guardado real del pedido por un fallo de esta
        // copia extra — solo se registra en el log de errores del servidor.
        error_log('[guardar-pedido] backup local falló: ' . $e->getMessage());
    }
}

// ── Lectura-modificación-escritura condicional (con reintento) de
// stats/<fecha>, compartida por el guardado normal y por el botón
// "Reintentar guardado" de la pestaña Alertas del panel. Idempotente por
// número de pedido — reintentar un pedido que ya está en stats no lo duplica.
function guardarPedidoEnStats($databaseURL, $accessToken, $fecha, $newOrder, $total) {
    for ($intento = 0; $intento < 8; $intento++) {
        $leido = fbGetConEtag($databaseURL, 'stats/' . $fecha, $accessToken);
        $stats = is_array($leido['data']) ? $leido['data'] : null;
        if (!$stats || ($stats['date'] ?? null) !== $fecha) {
            $stats = ['date' => $fecha, 'count' => 0, 'total' => 0, 'orders' => []];
        }
        if (!is_array($stats['orders'] ?? null)) $stats['orders'] = [];

        $yaExiste = false;
        foreach ($stats['orders'] as $o) {
            if (normOrderKey($o['num'] ?? '') === normOrderKey($newOrder['num'])) { $yaExiste = true; break; }
        }
        if (!$yaExiste) {
            $stats['count'] = (int)($stats['count'] ?? 0) + 1;
            $stats['total'] = round((float)($stats['total'] ?? 0) + $total, 2);
            array_unshift($stats['orders'], $newOrder);
        }

        if (fbPutSiCoincide($databaseURL, 'stats/' . $fecha, $accessToken, $stats, $leido['etag'])) {
            return true;
        }
        usleep(rand(20000, 80000));
    }
    return false;
}

// ── Nodos guardados como STRING JSON (igual que jset/jget del resto de la
// web) sobre las mismas funciones fbGetConEtag/fbPutSiCoincide de arriba.
function fbGetJsonStringConEtag($databaseURL, $path, $accessToken) {
    $leido = fbGetConEtag($databaseURL, $path, $accessToken);
    $arr = is_string($leido['data']) ? json_decode($leido['data'], true) : null;
    return ['data' => is_array($arr) ? $arr : null, 'etag' => $leido['etag']];
}
function fbPutJsonStringSiCoincide($databaseURL, $path, $accessToken, $data, $etag) {
    return fbPutSiCoincide($databaseURL, $path, $accessToken, json_encode($data), $etag);
}

// ── Antifraude por teléfono (lista negra + cooldown/límite diario) ──
// Antes esto SOLO se comprobaba en el navegador (carrito-checkout.js, antes
// de llamar aquí) — quien mandara la petición directamente a este script,
// sin pasar por la web, se saltaba la lista negra y el límite de pedidos
// por teléfono sin más límite que el genérico de 20 pedidos/IP/10min.
// Devuelve null si puede pedir, o un mensaje de error si no.
function comprobarAntifraudeTelefono($databaseURL, $accessToken, $phoneClean, $todayKey) {
    $blResp = fbGetJsonStringConEtag($databaseURL, 'config/blacklist', $accessToken);
    $blacklist = is_array($blResp['data']) ? $blResp['data'] : [];
    if (in_array($phoneClean, $blacklist, true)) {
        return 'No es posible realizar pedidos desde este número de teléfono.';
    }

    $cfgResp = fbGetJsonStringConEtag($databaseURL, 'config/antiSpamCfg', $accessToken);
    $cfg = is_array($cfgResp['data']) ? $cfgResp['data'] : [];
    $cooldownMin = is_numeric($cfg['cooldown'] ?? null) ? (float)$cfg['cooldown'] : 45;
    $dailyLimit = is_numeric($cfg['dailyLimit'] ?? null) ? (int)$cfg['dailyLimit'] : 3;

    $logCh = curl_init($databaseURL . '/phoneLog/' . $todayKey . '/' . $phoneClean . '.json');
    curl_setopt($logCh, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($logCh, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $log = json_decode(curl_exec($logCh), true);
    curl_close($logCh);
    if (!is_array($log)) return null;

    $count = is_numeric($log['count'] ?? null) ? (int)$log['count'] : 0;
    if ($dailyLimit > 0 && $count >= $dailyLimit) {
        return 'Has alcanzado el límite de pedidos para hoy. Inténtalo mañana.';
    }
    $timestamps = is_array($log['timestamps'] ?? null) ? $log['timestamps'] : [];
    if ($cooldownMin > 0 && $timestamps) {
        $lastTs = max(array_map('floatval', $timestamps));
        $cooldownMs = $cooldownMin * 60 * 1000;
        $ahoraMs = microtime(true) * 1000;
        if ($lastTs && ($ahoraMs - $lastTs) < $cooldownMs) {
            $restanteMin = (int)ceil(($cooldownMs - ($ahoraMs - $lastTs)) / 60000);
            return 'Debes esperar ' . $restanteMin . ' minuto' . ($restanteMin !== 1 ? 's' : '') . ' antes de hacer otro pedido.';
        }
    }
    return null;
}

// Incrementa phoneLog/<fecha>/<phone> de forma atómica (lectura-modificación-
// escritura con reintento) — antes solo lo escribía el navegador DESPUÉS de
// que el pedido se diera por bueno, así que quien llamara aquí directamente
// podía saltarse tanto la comprobación como el propio registro.
function registrarPhoneLog($databaseURL, $accessToken, $phoneClean, $todayKey) {
    $path = 'phoneLog/' . $todayKey . '/' . $phoneClean;
    for ($intento = 0; $intento < 5; $intento++) {
        $leido = fbGetConEtag($databaseURL, $path, $accessToken);
        $log = is_array($leido['data']) ? $leido['data'] : ['count' => 0, 'timestamps' => []];
        $log['count'] = (is_numeric($log['count'] ?? null) ? (int)$log['count'] : 0) + 1;
        if (!is_array($log['timestamps'] ?? null)) $log['timestamps'] = [];
        $log['timestamps'][] = (int)(microtime(true) * 1000);
        if (fbPutSiCoincide($databaseURL, $path, $accessToken, $log, $leido['etag'])) return;
        usleep(rand(20000, 80000));
    }
}

// Lee el aforo máximo configurado por turno (config/slotConfig.max) con la
// cuenta de servicio — si no hay nada guardado, usa el valor por defecto
// que ya usaba el navegador (4).
function obtenerSlotMax($databaseURL, $accessToken) {
    $leido = fbGetConEtag($databaseURL, 'config/slotConfig', $accessToken);
    $cfg = is_array($leido['data']) ? $leido['data'] : null;
    return ($cfg && is_numeric($cfg['max'] ?? null)) ? (int)$cfg['max'] : 4;
}

// Libera un turno reservado (contador atómico slots/<fecha>/<turno>, -1 con
// suelo en 0) — contrapartida de la reserva que hace la acción 'reservarSlot'.
// Antes esto no existía: cancelar o modificar un pedido nunca liberaba su
// turno (ni aquí ni en el navegador, que tampoco tiene permiso de escritura
// directa sobre slots/ desde que se movió la reserva a este script), así que
// cada cancelación/modificación dejaba el turno "ocupado" para siempre —
// con el tiempo los turnos se llenaban de pedidos fantasma y rechazaban a
// clientes reales aunque quedara hueco de verdad. No baja de 0 aunque haya
// más liberaciones que reservas (p.ej. si ya se había liberado antes por un
// reintento) para no dejar el contador en negativo.
function liberarSlot($databaseURL, $accessToken, $fecha, $slotTime) {
    if (!$slotTime) return;
    $path = 'slots/' . $fecha . '/' . $slotTime;
    for ($intento = 0; $intento < 8; $intento++) {
        $leido = fbGetConEtag($databaseURL, $path, $accessToken);
        $count = is_numeric($leido['data']) ? (int)$leido['data'] : 0;
        if ($count <= 0) return; // nada que liberar
        if (fbPutSiCoincide($databaseURL, $path, $accessToken, $count - 1, $leido['etag'])) return;
        usleep(rand(20000, 80000));
    }
}

// Añade una entrada al mismo "Registro de actividad" que ya se ve en el
// panel de admin (config/activityLog) — para que un fallo silencioso del
// servidor, o un pedido con un precio que no cuadra, aparezcan donde el
// admin ya mira cada día en vez de perderse en el log de errores de PHP,
// que nadie revisa.
function fbAgregarActivityLog($databaseURL, $accessToken, $mensaje, $extra = []) {
    for ($intento = 0; $intento < 5; $intento++) {
        $leido = fbGetJsonStringConEtag($databaseURL, 'config/activityLog', $accessToken);
        $log = $leido['data'] ?: [];
        $ahora = new DateTime('now', new DateTimeZone('Europe/Madrid'));
        array_unshift($log, $extra + [
            'ts'     => $ahora->format('c'),
            'time'   => $ahora->format('d/m/Y, H:i:s'),
            'action' => $mensaje,
        ]);
        if (count($log) > 200) $log = array_slice($log, 0, 200);
        if (fbPutJsonStringSiCoincide($databaseURL, 'config/activityLog', $accessToken, $log, $leido['etag'])) return;
        usleep(rand(20000, 80000));
    }
}

// ── Comprobación (solo aviso, nunca bloquea el pedido) de que el precio
// enviado por el navegador coincide con el precio real del menú. Solo
// compara productos normales de la carta por nombre exacto — los
// personalizados (Al Gusto/Bomba) y los "extras" no se verifican aquí,
// porque su precio depende de una lógica más compleja (ingredientes,
// quesos...) que no merece la pena duplicar en PHP y arriesgar
// desincronizar del cálculo real del carrito.
function comprobarPreciosSospechosos($databaseURL, $accessToken, $items) {
    $menuResp = fbGetJsonStringConEtag($databaseURL, 'config/menu', $accessToken);
    // config/menu se guarda como {items:[...], ts} desde admin-config.js,
    // pero puede quedar en el formato legacy (array plano) si no se ha
    // vuelto a guardar desde el panel — el cliente ya maneja ambos casos
    // (ver fb_listenMenu en historial-export.js), así que aquí también.
    $menuData = $menuResp['data'] ?? null;
    if (is_array($menuData) && isset($menuData['items']) && is_array($menuData['items'])) {
        $menuItems = $menuData['items']; // formato actual: {items:[...], ts}
    } elseif (is_array($menuData)) {
        $menuItems = $menuData; // formato legacy: array plano de productos
    } else {
        $menuItems = [];
    }
    $menuPorNombre = [];
    foreach ($menuItems as $mi) {
        if (isset($mi['name'])) $menuPorNombre[$mi['name']] = $mi;
    }
    $avisos = [];
    foreach ($items as $it) {
        $nombre = $it['name'] ?? null;
        if (!$nombre || !isset($menuPorNombre[$nombre])) continue; // custom/extra, no catalogado aquí
        $qty = isset($it['qty']) ? (float)$it['qty'] : null;
        $subtotal = isset($it['subtotal']) ? (float)$it['subtotal'] : null;
        if ($qty === null || $subtotal === null) continue;
        // qty:0 con subtotal>0 es tan sospechoso como un precio que no
        // cuadra (antes se ignoraba del todo — qty>0 era obligatorio para
        // entrar aquí, así que un qty:0 se saltaba el aviso sin más).
        if ($qty <= 0) {
            if ($subtotal > 0.02) $avisos[] = sprintf('%s: qty=0 pero subtotal %.2f€', $nombre, $subtotal);
            continue;
        }
        $precioReal = (float)$menuPorNombre[$nombre]['price'];
        $precioEnviado = $subtotal / $qty;
        if (abs($precioEnviado - $precioReal) > 0.02) {
            $avisos[] = sprintf('%s: enviado %.2f€, precio real %.2f€', $nombre, $precioEnviado, $precioReal);
        }
    }
    return $avisos;
}

// ── Comprobación de horario / vacaciones / pausa manual (SÍ bloquea el
// pedido) ── Antes esto solo se comprobaba en el navegador (isOutsideHours,
// isTodayOpen, getOrdersOpen en admin-config.js) para decidir si mostrar el
// formulario, actualizado cada 60s por un setInterval. Si el cliente ya
// tenía el formulario abierto cuando cerró la tienda (o el admin activó
// vacaciones/pausó pedidos), el navegador dejaba pasar el pedido igual
// porque este script nunca comprobaba nada del lado servidor. La lógica de
// horario reproduce exactamente isOutsideHours()/isTodayOpen() del
// navegador (mismo criterio de "día de servicio" antes de las 06:00, mismo
// tratamiento de sesión continua manOpen→tarClose con posible cruce de
// medianoche) para no rechazar pedidos que la propia web sí deja hacer.
function comprobarTiendaAbierta($databaseURL, $accessToken) {
    $vac = fbGetConEtag($databaseURL, 'config/vacacionesActivo', $accessToken);
    if ($vac['data'] === true) {
        return 'Estamos de vacaciones ahora mismo. No se aceptan pedidos.';
    }
    $ordersOpen = fbGetConEtag($databaseURL, 'config/ordersOpen', $accessToken);
    if ($ordersOpen['data'] === false) {
        return 'No estamos aceptando pedidos en este momento.';
    }
    // Pausa exprés (botón manual con cuenta atrás, admin-shell.html) — es
    // independiente de ordersOpen (que gestiona la pausa manual normal y la
    // auto-pausa por saturación), así que se comprueba aparte. El navegador
    // ya la respeta en isShopBlocked() (carta.js) para no dejar ni empezar
    // el formulario, pero eso no evita que alguien llame a este script
    // directamente saltándose la web — igual que el resto de comprobaciones
    // de esta función, esta es la que de verdad no se puede evitar.
    $pausaExpres = fbGetConEtag($databaseURL, 'config/pausaExpresHasta', $accessToken);
    if (is_numeric($pausaExpres['data']) && (float)$pausaExpres['data'] > (microtime(true) * 1000)) {
        return 'Pedidos pausados temporalmente. Inténtalo de nuevo en unos minutos.';
    }
    $horResp = fbGetConEtag($databaseURL, 'config/horario', $accessToken);
    $h = is_array($horResp['data']) ? $horResp['data'] : null;
    if (!$h) return null; // sin horario configurado: mismo criterio que el navegador, asumir abierto

    $now = time();
    $hour = (int)date('G', $now);
    $minute = (int)date('i', $now);
    $dow = (int)date('w', $now); // 0=domingo, igual que Date.getDay() en JS

    $serviceDay = ($hour < 6) ? (($dow + 6) % 7) : $dow;
    $diasAbiertos = isset($h['diasAbiertos']) && is_array($h['diasAbiertos']) ? $h['diasAbiertos'] : [2, 3, 4, 5, 6, 0];
    if (!in_array($serviceDay, $diasAbiertos, true)) {
        return 'Hoy no abrimos.';
    }

    if (!empty($h['manOpen']) || !empty($h['tarOpen'])) {
        $rawMin = $hour * 60 + $minute;
        $nowMin = ($hour < 6) ? $rawMin + 1440 : $rawMin;
        $getMin = function ($timeStr, $isClose = false) {
            if (!$timeStr) return null;
            $parts = explode(':', (string)$timeStr);
            $hh = (int)($parts[0] ?? 0);
            $mm = (int)($parts[1] ?? 0);
            $mins = $hh * 60 + $mm;
            return ($isClose && $mins === 0) ? 1440 : $mins;
        };
        $openStart = $getMin($h['manOpen'] ?? null);
        if ($openStart === null) $openStart = $getMin($h['tarOpen'] ?? null);
        $closeEnd = $getMin($h['tarClose'] ?? null, true);
        if ($closeEnd === null) $closeEnd = $getMin($h['manClose'] ?? null, true);
        if ($openStart !== null && $closeEnd !== null) {
            $inSession = ($closeEnd < $openStart)
                ? ($nowMin >= $openStart && $nowMin < $closeEnd + 1440)
                : ($nowMin >= $openStart && $nowMin < $closeEnd);
            if (!$inSession) {
                return 'Estamos cerrados ahora mismo.';
            }
        }
    }
    return null;
}

// ── Comprobación (solo aviso, nunca bloquea el pedido) de que el TOTAL
// enviado no sea más bajo de lo que un descuento/premio legítimo podría
// explicar. La comprobación de precios de arriba solo mira productos que
// coinciden por nombre con la carta — esto la complementa mirando el
// total final, que hasta ahora no se verificaba en absoluto: se podía
// pedir con productos reales a precio real y aun así forzar el total a
// cualquier cifra.
//
// Margen que SÍ se admite como legítimo (no genera aviso):
//  - El código de descuento aplicado (si lo hay), por su % real guardado.
//  - El premio de fidelización (patata gratis), aproximado como el precio
//    unitario de la patata más cara del carrito — igual que calcula el
//    propio navegador en _finalizarPedido() (carrito-checkout.js).
// No se puede saber desde aquí si el cliente REALMENTE tenía derecho a
// ese premio, así que se admite siempre como margen: es mejor un falso
// negativo ocasional que bloquear/avisar de pedidos legítimos.
function comprobarTotalSospechoso($databaseURL, $accessToken, $items, $total, $discountCode, $esEstudianteJubilado) {
    $itemsSum = 0;
    $maxPatataUnit = 0;
    foreach ($items as $it) {
        if (!empty($it['isFee'])) continue; // los gastos de gestión suman aparte, no hace falta cubrirlos con margen
        $subtotal = isset($it['subtotal']) ? (float)$it['subtotal'] : 0;
        $qty = isset($it['qty']) && $it['qty'] > 0 ? (float)$it['qty'] : 1;
        $itemsSum += $subtotal;
        $nombre = isset($it['name']) ? mb_strtolower(trim((string)$it['name'])) : '';
        if (strpos($nombre, 'patata') === 0) {
            $unit = $subtotal / $qty;
            if ($unit > $maxPatataUnit) $maxPatataUnit = $unit;
        }
    }
    $descuentoCodigo = 0;
    if ($discountCode) {
        $discResp = fbGetConEtag($databaseURL, 'discounts/' . strtoupper($discountCode), $accessToken);
        $disc = is_array($discResp['data']) ? $discResp['data'] : null;
        if ($disc && isset($disc['pct'])) {
            // Tope de cordura: un % fuera de 0-100 no puede ser un
            // descuento real creado desde el panel — si discounts/<code>
            // aparece con un valor así es que alguien lo escribió a mano
            // (las reglas de Firebase deberían impedirlo, pero por si acaso
            // no se confía a ciegas en lo que haya ahí para calcular el margen).
            $pctSeguro = max(0, min(100, (float)$disc['pct']));
            $descuentoCodigo = $itemsSum * ($pctSeguro / 100);
        }
    }
    // Descuento estudiante/jubilado — igual que el de fidelización, ya viene
    // reflejado como línea negativa dentro de $items (así que $itemsSum ya lo
    // recoge), pero se añade también aquí como margen explícito por si esa
    // línea faltara alguna vez, para no generar un aviso de "total
    // manipulado" en pedidos legítimos con este descuento.
    $margenEstudiante = 0;
    if ($esEstudianteJubilado) {
        $sdResp = fbGetConEtag($databaseURL, 'config/studentDiscountConfig', $accessToken);
        $sd = is_array($sdResp['data']) ? $sdResp['data'] : null;
        if ($sd && !empty($sd['enabled']) && is_numeric($sd['pct'] ?? null)) {
            $pctSeguro2 = max(0, min(100, (float)$sd['pct']));
            $margenEstudiante = $itemsSum * ($pctSeguro2 / 100);
        }
    }
    // El código de descuento y el de estudiante/jubilado NO se combinan (a
    // petición expresa) — el navegador ya envía como máximo uno de los dos
    // "activo" a la vez, pero por si alguien llamara a este endpoint
    // directamente saltándose esa lógica, aquí se admite como margen el
    // mayor de los dos, nunca la suma de ambos.
    $margen = $maxPatataUnit + max($descuentoCodigo, $margenEstudiante) + 0.05;
    if ($total < ($itemsSum - $margen)) {
        return sprintf('total enviado %.2f€, suma de productos %.2f€ (margen de descuentos/premio admitido: %.2f€)', $total, $itemsSum, $margen);
    }
    return null;
}

// ── Verificación de gastos de gestión / bolsa contra la config real (solo
// aviso, no bloquea ni corrige el pedido) ── El navegador decide si cobrar
// fee1/fee2 según su propia copia de la configuración (localStorage), que
// puede no haber cargado a tiempo en una visita nueva/muy rápida — ya se
// mitigó del lado del cliente (ver esperarConfigCriticaLista() en
// admin-config.js), pero esto sirve de red de seguridad: si algún pedido
// se cuela sin el gasto que le tocaba (o con el que no le tocaba, p.ej. por
// el código de "pedido desde el local"), queda un aviso claro en Alertas
// con el importe exacto que falta, para poder cobrarlo/ajustarlo a mano si
// hiciera falta. No se corrige solo, porque el ticket que ya se imprimió o
// se le mostró al cliente no se puede cambiar retroactivamente — mejor
// avisar que desincronizar lo guardado de lo impreso.
function _esEtiquetaDeGestionPHP($label) {
    $l = mb_strtolower((string)$label);
    return (mb_strpos($l, 'gestión') !== false) || (mb_strpos($l, 'gestion') !== false);
}
function comprobarFeesEsperados($databaseURL, $accessToken, $items, $esPedidoLocal, $orderNum) {
    $feeResp = fbGetConEtag($databaseURL, 'config/feeConfig', $accessToken);
    $fee = is_array($feeResp['data']) ? $feeResp['data'] : null;
    $fee2Resp = fbGetConEtag($databaseURL, 'config/fee2Config', $accessToken);
    $fee2 = is_array($fee2Resp['data']) ? $fee2Resp['data'] : null;
    if (!$fee && !$fee2) return [];

    $fee1EsGestion = $fee && _esEtiquetaDeGestionPHP($fee['label'] ?? '');
    $fee2EsGestion = $fee2 && _esEtiquetaDeGestionPHP($fee2['label'] ?? '');
    $ningunaEsGestion = !$fee1EsGestion && !$fee2EsGestion;

    $avisos = [];
    $revisar = [];
    if ($fee) $revisar[] = ['cfg' => $fee, 'esperado' => !empty($fee['enabled']) && !($esPedidoLocal && ($fee1EsGestion || $ningunaEsGestion))];
    if ($fee2) $revisar[] = ['cfg' => $fee2, 'esperado' => !empty($fee2['enabled']) && !($esPedidoLocal && $fee2EsGestion)];

    foreach ($revisar as $r) {
        $label = trim((string)($r['cfg']['label'] ?? ''));
        if ($label === '') continue;
        $montoReal = round((float)($r['cfg']['amount'] ?? 0), 2);
        $enItems = null;
        foreach ($items as $it) {
            if (!empty($it['isFee']) && trim((string)($it['name'] ?? '')) === $label) { $enItems = $it; break; }
        }
        if ($r['esperado']) {
            if ($enItems === null) {
                $avisos[] = 'falta "' . $label . '" (' . number_format($montoReal, 2) . '€)';
            } elseif (abs((float)($enItems['subtotal'] ?? 0) - $montoReal) > 0.01) {
                $avisos[] = '"' . $label . '" cobrado ' . number_format((float)$enItems['subtotal'], 2) . '€ en vez de ' . number_format($montoReal, 2) . '€';
            }
        } elseif ($enItems !== null) {
            $avisos[] = '"' . $label . '" cobrado (' . number_format((float)$enItems['subtotal'], 2) . '€) cuando no debía aplicarse';
        }
    }
    return $avisos;
}

// ── Aviso (no bloquea) de un posible pedido duplicado: mismo teléfono e
// importe total guardados hace menos de 90 segundos — típico de un cliente
// que reintenta tras ver un error de red aunque el pedido original sí
// llegara a guardarse, o de un doble toque en "Confirmar". No se bloquea
// porque un cliente puede legítimamente hacer dos pedidos iguales seguidos.
function detectarPosibleDuplicado($databaseURL, $accessToken, $fecha, $phone, $total) {
    $leido = fbGetConEtag($databaseURL, 'tickets/' . $fecha, $accessToken);
    $tickets = is_array($leido['data']) ? $leido['data'] : [];
    $ahora = time();
    foreach ($tickets as $key => $t) {
        if (!is_array($t)) continue;
        if (($t['phone'] ?? null) !== $phone) continue;
        if (abs((float)($t['total'] ?? -1) - $total) > 0.01) continue;
        $ts = isset($t['time']) ? DateTime::createFromFormat('d/m/Y, H:i:s', (string)$t['time'], new DateTimeZone('Europe/Madrid')) : false;
        if (!$ts) continue;
        $diff = $ahora - $ts->getTimestamp();
        if ($diff >= 0 && $diff < 90) {
            return $t['orderNum'] ?? (string)$key;
        }
    }
    return null;
}

try {
    // $rawInput ya se leyó arriba (antes de la comprobación de "ping") —
    // php://input no se puede leer dos veces, así que se reutiliza en vez
    // de volver a llamar a file_get_contents().
    $payload = json_decode($rawInput, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Petición inválida']);
        exit;
    }

    // ── Botón "🔧 Reintentar guardado" de la pestaña Alertas del panel ──
    // Recupera el ticket YA guardado (tickets/<fecha>/<num> casi siempre se
    // guarda bien — lo que falla es el resumen agregado en stats/<fecha>) y
    // vuelve a intentar reflejarlo en las estadísticas del día. Nunca acepta
    // datos de pedido nuevos del cliente, solo relee lo que ya hay guardado,
    // así que no reabre el riesgo de precios/items manipulados.
    if (($payload['action'] ?? '') === 'reintentarStats') {
        // Esta acción no pide PIN ni sesión de admin (solo se llama desde
        // el botón de la pestaña Alertas, pero el propio endpoint no lo
        // comprueba) — no permite fabricar pedidos ni cambiar precios
        // (relee lo que ya hay guardado), pero si/no encuentra el ticket sí
        // deja adivinar qué números de pedido existieron un día dado. Un
        // límite mucho más estricto que el de pedidos normales (compartido
        // con clientes reales) reduce esa ventana a paso de tortuga.
        if (!dpf_check_limit($tmp_dir . '/dpf_reintentarstats_ip_' . md5($ip) . '.json', 5, $window)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
            exit;
        }
        $rOrderNum = isset($payload['orderNum']) ? (string)$payload['orderNum'] : '';
        $rFecha = isset($payload['fecha']) ? (string)$payload['fecha'] : '';
        if (!preg_match('/^T\d{3,5}$/', $rOrderNum) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $rFecha)) {
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            exit;
        }
        $accessToken = obtenerTokenAcceso($rutaCredenciales);
        $rTicketKey = normOrderKey($rOrderNum);
        $ticketLeido = fbGetConEtag($databaseURL, 'tickets/' . $rFecha . '/' . $rTicketKey, $accessToken);
        $ticket = is_array($ticketLeido['data']) ? $ticketLeido['data'] : null;
        if (!$ticket) {
            echo json_encode(['success' => false, 'error' => 'No se encontró el ticket original — puede que el pedido no llegara a guardarse en absoluto. Contacta al cliente para confirmarlo.']);
            exit;
        }
        $rTotal = is_numeric($ticket['total'] ?? null) ? (float)$ticket['total'] : 0;
        $rNewOrder = [
            'num'   => $ticket['orderNum'] ?? $rOrderNum,
            'name'  => $ticket['name'] ?? '',
            'phone' => $ticket['phone'] ?? '',
            'notes' => $ticket['notes'] ?? '',
            'total' => $rTotal,
            'items' => is_array($ticket['items'] ?? null) ? $ticket['items'] : [],
            'time'  => date('H:i'),
            'slot'  => $ticket['slotTime'] ?? null,
            'ts'    => (int)(microtime(true) * 1000),
        ];
        $rOk = guardarPedidoEnStats($databaseURL, $accessToken, $rFecha, $rNewOrder, $rTotal);
        if ($rOk) {
            fbAgregarActivityLog($databaseURL, $accessToken, '✅ Pedido ' . $rOrderNum . ' recuperado manualmente y guardado en estadísticas');
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Sigue sin poder guardarse en estadísticas. Inténtalo de nuevo en unos minutos.']);
        }
        exit;
    }

    // ── Reservar un turno (contador atómico slots/<fecha>/<turno>) ──
    // Sustituye la escritura directa que antes hacía el navegador contra
    // Firebase (incrementSlot() → fb_incrementSlot en carrito-checkout.js).
    // Antes, para que esa escritura funcionara, las reglas de Firebase
    // tenían que dejar escribir en slots/ a cualquier visitante anónimo
    // ("auth != null", que cualquiera cumple por el login anónimo
    // automático) — eso permitía inundar los turnos sin llegar a
    // completar ningún pedido real. Ahora lo hace este script con la
    // cuenta de servicio, así que las reglas ya pueden exigir el UID de
    // admin también para escribir aquí.
    if (($payload['action'] ?? '') === 'reservarSlot') {
        $slotTime = isset($payload['slotTime']) ? trim((string)$payload['slotTime']) : '';
        if (!preg_match('/^\d{1,2}:\d{2}$/', $slotTime)) {
            echo json_encode(['success' => false, 'error' => 'Turno inválido']);
            exit;
        }
        $accessToken = obtenerTokenAcceso($rutaCredenciales);
        $todayKey = date('Y-m-d');
        $slotMax = obtenerSlotMax($databaseURL, $accessToken);
        $path = 'slots/' . $todayKey . '/' . $slotTime;
        $reservado = false;
        for ($intento = 0; $intento < 8; $intento++) {
            $leido = fbGetConEtag($databaseURL, $path, $accessToken);
            $count = is_numeric($leido['data']) ? (int)$leido['data'] : 0;
            if ($count >= $slotMax) {
                echo json_encode(['success' => false, 'error' => 'slot_full']);
                exit;
            }
            if (fbPutSiCoincide($databaseURL, $path, $accessToken, $count + 1, $leido['etag'])) { $reservado = true; break; }
            usleep(rand(20000, 80000));
        }
        echo json_encode($reservado
            ? ['success' => true]
            : ['success' => false, 'error' => 'No se pudo reservar el turno, inténtalo de nuevo']);
        exit;
    }

    // ── Repartir la hora del ticket entre pedidos "desde el local" (código
    // QR del mostrador cuando hay cola) — ver TIENDA_ESPERA_KEY en
    // admin-config.js. Sin turno elegido por el cliente (needsSlot es false
    // para estos pedidos), así que si llegan varios seguidos todos saldrían
    // en el ticket como "para ahora mismo" a la vez. Cola virtual con un
    // único contador (config/tiendaEsperaNext = timestamp del próximo hueco
    // libre): cada pedido se lleva max(ahora, próximo hueco) + minutos
    // configurados, con lectura-modificación-escritura condicional (mismo
    // patrón CAS que reservarSlot arriba) para que dos pedidos casi
    // simultáneos no se lleven el mismo hueco. Si no ha habido pedidos "de
    // tienda" en un rato, el hueco guardado queda en el pasado y max()
    // vuelve a arrancar desde ahora solo — no hace falta limpiarlo aparte.
    if (($payload['action'] ?? '') === 'asignarHoraTienda') {
        $accessToken = obtenerTokenAcceso($rutaCredenciales);
        $cfgResp = fbGetConEtag($databaseURL, 'config/tiendaEsperaMinutos', $accessToken);
        $minutos = is_numeric($cfgResp['data']) ? (int)$cfgResp['data'] : 0;
        if ($minutos <= 0) {
            echo json_encode(['success' => true, 'hora' => null]);
            exit;
        }
        $path = 'config/tiendaEsperaNext';
        $nuevoHueco = null;
        for ($intento = 0; $intento < 8; $intento++) {
            $leido = fbGetConEtag($databaseURL, $path, $accessToken);
            $huecoActual = is_numeric($leido['data']) ? (int)$leido['data'] : 0;
            $ahoraMs = (int)(microtime(true) * 1000);
            $nuevoHueco = max($ahoraMs, $huecoActual) + $minutos * 60000;
            if (fbPutSiCoincide($databaseURL, $path, $accessToken, $nuevoHueco, $leido['etag'])) break;
            $nuevoHueco = null;
            usleep(rand(20000, 80000));
        }
        if ($nuevoHueco === null) {
            echo json_encode(['success' => false, 'error' => 'No se pudo asignar hora, inténtalo de nuevo']);
            exit;
        }
        echo json_encode(['success' => true, 'hora' => date('H:i', (int)($nuevoHueco / 1000))]);
        exit;
    }

    // ── Generar un número de pedido único del día (usedOrderNums/<fecha>) ──
    // Mismo motivo que arriba: antes lo reservaba el navegador
    // (generateOrderNumber() en carrito-checkout.js) escribiendo directo
    // en Firebase, lo que exigía dejar usedOrderNums/ abierto a escritura
    // anónima en las reglas.
    if (($payload['action'] ?? '') === 'reservarNumeroPedido') {
        $accessToken = obtenerTokenAcceso($rutaCredenciales);
        $todayKey = date('Y-m-d');
        $orderNumReservado = null;
        for ($intento = 0; $intento < 50; $intento++) {
            $num = random_int(1000, 9999);
            $path = 'usedOrderNums/' . $todayKey . '/' . $num;
            $leido = fbGetConEtag($databaseURL, $path, $accessToken);
            if ($leido['data'] !== null) continue; // ya usado, probar otro
            if (fbPutSiCoincide($databaseURL, $path, $accessToken, true, $leido['etag'])) {
                $orderNumReservado = 'T' . $num;
                break;
            }
            // 412 (otro proceso lo reservó a la vez): probar con otro número
        }
        echo json_encode($orderNumReservado
            ? ['success' => true, 'orderNum' => $orderNumReservado]
            : ['success' => false, 'error' => 'No se pudo generar el número de pedido, inténtalo de nuevo']);
        exit;
    }

    // ── Cancelar/anular un pedido (modificar o cancelar del propio cliente,
    // y también el botón "✕" del panel admin) ──
    // Mismo motivo que reservarSlot/reservarNumeroPedido arriba: orderStatus/
    // y stats/ exigen el UID exacto del admin en las reglas de seguridad, así
    // que cuando el propio cliente (auth anónima) cancelaba o modificaba su
    // pedido desde _borrarPedidoDeFirebase() escribiendo directo contra
    // Firebase, esa escritura fallaba en silencio — el pedido se quedaba
    // "activo" para siempre en cocina y en estadísticas en el resto de
    // dispositivos, aunque el propio cliente ya lo viera como cancelado en su
    // móvil. Ahora lo hace este script con la cuenta de servicio. Exige que
    // el teléfono coincida con el del ticket real (igual que revertirSello en
    // fidelizacion.php) para que nadie pueda cancelar el pedido de otra
    // persona solo adivinando el número.
    if (($payload['action'] ?? '') === 'cancelarPedido') {
        if (!dpf_check_limit($tmp_dir . '/dpf_cancelarpedido_ip_' . md5($ip) . '.json', 30, $window)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
            exit;
        }
        $cOrderNum = isset($payload['orderNum']) ? (string)$payload['orderNum'] : '';
        $cFecha = isset($payload['fecha']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$payload['fecha']) ? (string)$payload['fecha'] : date('Y-m-d');
        $cPhone = isset($payload['phone']) ? preg_replace('/\D/', '', (string)$payload['phone']) : '';
        if (!preg_match('/^T\d{3,5}$/', $cOrderNum)) {
            echo json_encode(['success' => false, 'error' => 'Número de pedido inválido']);
            exit;
        }
        if ($cPhone === '') {
            echo json_encode(['success' => false, 'error' => 'Falta el teléfono del pedido']);
            exit;
        }
        $accessToken = obtenerTokenAcceso($rutaCredenciales);
        $cKey = normOrderKey($cOrderNum);
        $cTicketLeido = fbGetConEtag($databaseURL, 'tickets/' . $cFecha . '/' . $cKey, $accessToken);
        $cTicket = is_array($cTicketLeido['data']) ? $cTicketLeido['data'] : null;
        if (!$cTicket) {
            echo json_encode(['success' => false, 'error' => 'No se encontró el pedido']);
            exit;
        }
        $cTicketPhone = preg_replace('/\D/', '', (string)($cTicket['phone'] ?? ''));
        if ($cTicketPhone === '' || $cPhone !== $cTicketPhone) {
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        // 1. Marcar como cancelado — escritura directa a la clave del pedido,
        // no hace falta condicional porque no comparte nodo con otros pedidos.
        fbPutSiCoincide($databaseURL, 'orderStatus/' . $cFecha . '/' . $cKey, $accessToken, 'cancelado', null);

        // 2. Quitarlo de stats/<fecha> (lectura-modificación-escritura
        // condicional con reintento, igual que guardarPedidoEnStats).
        $cSlot = null; $cItems = null; $cPhoneStats = null;
        for ($intento = 0; $intento < 8; $intento++) {
            $leido = fbGetConEtag($databaseURL, 'stats/' . $cFecha, $accessToken);
            $stats = is_array($leido['data']) ? $leido['data'] : null;
            if (!$stats || ($stats['date'] ?? null) !== $cFecha || !is_array($stats['orders'] ?? null)) {
                break; // nada que quitar
            }
            $pedido = null;
            foreach ($stats['orders'] as $o) {
                if (normOrderKey($o['num'] ?? '') === $cKey) { $pedido = $o; break; }
            }
            if ($pedido) {
                $cSlot = $pedido['slot'] ?? null;
                $cItems = $pedido['items'] ?? null;
                $cPhoneStats = $pedido['phone'] ?? null;
            }
            $stats['orders'] = array_values(array_filter($stats['orders'], function ($o) use ($cKey) {
                return normOrderKey($o['num'] ?? '') !== $cKey;
            }));
            $stats['count'] = max(0, count($stats['orders']));
            $stats['total'] = round(array_reduce($stats['orders'], function ($acc, $o) { return $acc + (is_numeric($o['total'] ?? null) ? (float)$o['total'] : 0); }, 0), 2);
            if (fbPutSiCoincide($databaseURL, 'stats/' . $cFecha, $accessToken, $stats, $leido['etag'])) break;
            usleep(rand(20000, 80000));
        }

        // 3. Liberar el turno reservado — se usa el slot de stats/ si se
        // encontró ahí, y si no el guardado en el propio ticket (p.ej. si
        // stats/ ya no tenía el pedido por un reintento anterior). Nunca
        // bloquea la respuesta de "cancelado con éxito" aunque falle: el
        // pedido ya está cancelado y fuera de stats, que es lo importante.
        $cSlotParaLiberar = $cSlot ?: ($cTicket['slotTime'] ?? null);
        if ($cSlotParaLiberar) {
            liberarSlot($databaseURL, $accessToken, $cFecha, $cSlotParaLiberar);
        }

        echo json_encode([
            'success' => true,
            'items'   => $cItems,
            'phone'   => $cPhoneStats ?: $cTicket['phone'] ?? null,
            'slot'    => $cSlot,
        ]);
        exit;
    }

    $orderNum = isset($payload['orderNum']) ? (string)$payload['orderNum'] : '';
    if (!preg_match('/^T\d{3,5}$/', $orderNum)) {
        echo json_encode(['success' => false, 'error' => 'Número de pedido inválido']);
        exit;
    }
    $name = isset($payload['name']) ? dpf_limpiar_texto(mb_substr(trim((string)$payload['name']), 0, 60)) : '';
    $phone = isset($payload['phone']) ? dpf_limpiar_texto(mb_substr(trim((string)$payload['phone']), 0, 20)) : '';
    $notes = isset($payload['notes']) ? dpf_limpiar_texto(mb_substr(trim((string)$payload['notes']), 0, 300)) : '';
    $slotTime = isset($payload['slotTime']) && $payload['slotTime'] !== '' ? (string)$payload['slotTime'] : null;
    // Cada campo de cada producto se acota — antes solo se limitaba el
    // NÚMERO de productos (100), pero no el tamaño de cada uno. Un pedido
    // con nombres/notas/extras de varios MB cada uno se guarda tal cual en
    // tickets/<fecha>/<num> Y en el nodo stats/<fecha> COMPARTIDO por todos
    // los pedidos del día — podía hincharlo lo bastante como para romper
    // "Pedidos en vivo" para todo el mundo ese día, no solo para quien lo mandó.
    $itemsRaw = is_array($payload['items'] ?? null) ? array_slice($payload['items'], 0, 100) : [];
    $items = array_map(function ($it) {
        if (!is_array($it)) return ['name' => '', 'qty' => 0, 'subtotal' => 0];
        $limpio = [
            'name'     => isset($it['name']) ? dpf_limpiar_texto(mb_substr(trim((string)$it['name']), 0, 120)) : '',
            'qty'      => isset($it['qty']) ? max(0, min(999, (float)$it['qty'])) : 0,
            // Rango con mínimo negativo: los descuentos (fidelización, código,
            // estudiante/jubilado) se envían como líneas de "producto" con
            // subtotal NEGATIVO — con el mínimo en 0 de antes, esas líneas se
            // guardaban (y se imprimían) siempre como 0,00€ aunque el
            // descuento sí se hubiera aplicado de verdad al total.
            'subtotal' => isset($it['subtotal']) ? max(-9999, min(9999, (float)$it['subtotal'])) : 0,
        ];
        if (!empty($it['isFee'])) $limpio['isFee'] = true;
        if (is_array($it['extras'] ?? null)) {
            $limpio['extras'] = array_map(function ($e) {
                if (is_array($e)) {
                    return [
                        'name'  => isset($e['name']) ? dpf_limpiar_texto(mb_substr(trim((string)$e['name']), 0, 80)) : '',
                        'price' => isset($e['price']) ? max(0, min(999, (float)$e['price'])) : 0,
                    ];
                }
                return dpf_limpiar_texto(mb_substr(trim((string)$e), 0, 80));
            }, array_slice($it['extras'], 0, 30));
        }
        return $limpio;
    }, $itemsRaw);
    $total = is_numeric($payload['total'] ?? null) ? round((float)$payload['total'], 2) : 0;
    if ($total < 0) $total = 0;
    $discountCode = isset($payload['discountCode']) && $payload['discountCode'] !== '' ? strtoupper((string)$payload['discountCode']) : null;
    // Pedido hecho desde el mostrador con el código de "pedido desde el
    // local" (sin gastos de gestión) — se guarda para poder priorizarlo en
    // cocina, ya que ese cliente está esperando físicamente en el local.
    $esPedidoLocal = !empty($payload['esPedidoLocal']);
    // Descuento estudiante/jubilado autodeclarado — se guarda para avisar en
    // el ticket y en cocina que hay que comprobar el carné al cobrar.
    $esEstudianteJubilado = !empty($payload['esEstudianteJubilado']);
    // Pedido que cumple los requisitos del sello de fidelización (patata +
    // mínimo de gasto) — se guarda para avisar en el ticket que hay que
    // comprobar/aplicar el sello, igual que el aviso de carné de arriba.
    $fidelizacionElegible = !empty($payload['fidelizacionElegible']);

    $phoneClean = preg_replace('/[^0-9]/', '', (string)$phone);
    // La web ya exige 9 dígitos (carrito-checkout.js) — comprobarlo también
    // aquí evita que un teléfono no numérico caiga en el mismo "cajón"
    // vacío de phoneLog/lista negra que cualquier otro teléfono inválido.
    if (!$name || !$phone || strlen($phoneClean) !== 9) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos del pedido']);
        exit;
    }

    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $todayKey = date('Y-m-d');
    $horaLabel = date('H:i');
    $ticketKey = normOrderKey($orderNum);

    // ── ANTIFRAUDE: lista negra + cooldown/límite diario por teléfono ──
    // Esto SÍ bloquea el pedido (a diferencia de los avisos de precio/total
    // de abajo) — son las mismas reglas que ya aplicaba el navegador, solo
    // que ahora también se hacen cumplir aquí para quien se salte la web.
    $errorAntifraude = comprobarAntifraudeTelefono($databaseURL, $accessToken, $phoneClean, $todayKey);
    if ($errorAntifraude) {
        echo json_encode(['success' => false, 'error' => $errorAntifraude]);
        exit;
    }

    // ── TIENDA CERRADA / VACACIONES / PEDIDOS PAUSADOS: SÍ bloquea el pedido ──
    $errorHorario = comprobarTiendaAbierta($databaseURL, $accessToken);
    if ($errorHorario) {
        echo json_encode(['success' => false, 'error' => $errorHorario]);
        exit;
    }

    // ── 0. COMPROBACIÓN DE PRECIOS Y TOTAL (solo aviso, nunca bloquea el pedido) ──
    $avisosPrecios = comprobarPreciosSospechosos($databaseURL, $accessToken, $items);
    if ($avisosPrecios) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Posible precio manipulado en pedido ' . $orderNum . ' — ' . implode(' · ', $avisosPrecios));
    }
    $avisoTotal = comprobarTotalSospechoso($databaseURL, $accessToken, $items, $total, $discountCode, $esEstudianteJubilado);
    if ($avisoTotal) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Posible total manipulado en pedido ' . $orderNum . ' — ' . $avisoTotal);
    }
    $avisosFees = comprobarFeesEsperados($databaseURL, $accessToken, $items, $esPedidoLocal, $orderNum);
    if ($avisosFees) {
        fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ Gastos de gestión/bolsa no coinciden en pedido ' . $orderNum . ' — ' . implode(' · ', $avisosFees));
    }
    $posibleDup = detectarPosibleDuplicado($databaseURL, $accessToken, $todayKey, $phone, $total);
    if ($posibleDup) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🔁 Posible pedido duplicado: mismo teléfono e importe en ' . $posibleDup . ' y ' . $orderNum . ' con menos de 90s de diferencia — comprueba si es el mismo pedido enviado dos veces');
    }

    // ── 1. GUARDAR TICKET (para reimprimir) ──
    // tickets/<fecha>/<num> es un nodo por pedido: sin condición de carrera
    // posible entre pedidos distintos (cada uno tiene su propia clave) —
    // PERO antes se escribía sin comprobar nada, con un PUT incondicional:
    // cualquiera que adivinara un T#### ya usado (el número se muestra al
    // cliente, y el espacio son solo 4 dígitos) podía sobrescribir el
    // ticket de OTRO pedido con datos propios, y hasta farmear sellos de
    // fidelización con él (fidelizacion.php confía en lo que haya en
    // tickets/<fecha>/<num>). Ahora se comprueba primero que el ticket no
    // exista ya, y la escritura es condicional (If-Match con el ETag de esa
    // misma lectura) para que dos peticiones casi simultáneas para el mismo
    // número no puedan pisarse entre sí tampoco.
    $ticketPath = 'tickets/' . $todayKey . '/' . $ticketKey;
    $leidoTicket = fbGetConEtag($databaseURL, $ticketPath, $accessToken);
    if ($leidoTicket['data'] !== null) {
        // Si es un reenvío del mismo pedido (mismo teléfono) que ya se había
        // guardado con éxito antes — p.ej. el cliente cerró la pestaña justo
        // después de confirmar y la web reintenta sola al reabrirla, o la
        // respuesta se perdió por un corte de red aunque el servidor sí
        // terminara de guardarlo — se responde como éxito en vez de error:
        // reenviar el mismo pedido no debe tratarse como un fallo ni
        // duplicarlo (las estadísticas ya son idempotentes por número de
        // pedido, ver guardarPedidoEnStats más abajo).
        $existente = $leidoTicket['data'];
        if (is_array($existente) && ($existente['phone'] ?? null) === $phone) {
            echo json_encode(['success' => true, 'yaGuardado' => true]);
            exit;
        }
        echo json_encode(['success' => false, 'error' => 'Este número de pedido ya se ha usado. Recarga la página e inténtalo de nuevo.']);
        exit;
    }
    $ticketData = [
        'orderNum' => $orderNum,
        'name'     => $name,
        'phone'    => $phone,
        'notes'    => $notes,
        'slotTime' => $slotTime,
        'items'    => $items,
        'total'    => $total,
        'time'     => date('d/m/Y, H:i:s'),
        'esPedidoLocal' => $esPedidoLocal,
        'esEstudianteJubilado' => $esEstudianteJubilado,
        'fidelizacionElegible' => $fidelizacionElegible,
    ];
    $ticketGuardado = fbPutSiCoincide($databaseURL, $ticketPath, $accessToken, $ticketData, $leidoTicket['etag']);
    if (!$ticketGuardado) {
        // No se pudo guardar de verdad (colisión con otra petición casi
        // simultánea para el mismo número, o fallo de red/Firebase). No se
        // sigue adelante: ni se tocan las estadísticas ni se consume el
        // límite diario de pedidos de este teléfono (más abajo) por un
        // pedido que en realidad no ha quedado guardado en ningún sitio.
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar el pedido, inténtalo de nuevo.']);
        exit;
    }
    dpf_backup_pedido_local($ticketData);

    // ── 2. ACTUALIZAR ESTADÍSTICAS DEL DÍA (lo que lee "Pedidos en vivo") ──
    // stats/<fecha> es UN único nodo compartido por todos los pedidos del
    // día, así que hace falta lectura-modificación-escritura condicional
    // (con reintento) para no perder el pedido de otro cliente que llegó
    // casi a la vez — el mismo patrón que ya usa fichar-pin-check.php.
    $newOrder = [
        'num'   => $orderNum,
        'name'  => $name,
        'phone' => $phone,
        'notes' => $notes,
        'total' => $total,
        'items' => $items,
        'time'  => $horaLabel,
        'slot'  => $slotTime,
        'esPedidoLocal' => $esPedidoLocal,
        'esEstudianteJubilado' => $esEstudianteJubilado,
        'fidelizacionElegible' => $fidelizacionElegible,
        'ts'    => (int)(microtime(true) * 1000),
    ];
    $statsGuardado = guardarPedidoEnStats($databaseURL, $accessToken, $todayKey, $newOrder, $total);

    if (!$statsGuardado) {
        error_log('[guardar-pedido] No se pudo actualizar stats para el pedido ' . $orderNum . ' tras varios intentos.');
        // Se guarda orderNum/fecha junto al aviso para que el botón
        // "🔧 Reintentar guardado" de la pestaña Alertas sepa qué ticket
        // recuperar sin tener que parsear el texto del mensaje.
        fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ Pedido ' . $orderNum . ' NO se pudo guardar en estadísticas tras varios intentos — revisa "Pedidos en vivo"', [
            'tipo'     => 'pedido_no_guardado',
            'orderNum' => $orderNum,
            'fecha'    => $todayKey,
        ]);
    }

    // ── 3. INCREMENTAR USO DEL CÓDIGO DE DESCUENTO (si se usó uno) ──
    if ($discountCode) {
        for ($intento = 0; $intento < 5; $intento++) {
            $leido = fbGetConEtag($databaseURL, 'discounts/' . $discountCode, $accessToken);
            $cupon = is_array($leido['data']) ? $leido['data'] : null;
            if (!$cupon) break; // el código no existe, nada que incrementar
            $usos = is_numeric($cupon['uses'] ?? null) ? (int)$cupon['uses'] : 0;
            $maxUsos = is_numeric($cupon['maxUses'] ?? null) ? (int)$cupon['maxUses'] : null;
            if ($maxUsos !== null && $usos >= $maxUsos) {
                // Antes esto se quedaba callado: el código seguía "funcionando"
                // indefinidamente para el total ya calculado en el navegador
                // (el descuento no se revierte, por el mismo motivo que el
                // total sospechoso de más abajo solo se avisa y no se
                // bloquea) — pero al menos ahora el admin se entera de que
                // se ha superado el cupo, en vez de no verlo nunca.
                fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Código de descuento ' . $discountCode . ' usado en el pedido ' . $orderNum . ' aunque ya había superado el máximo de usos (' . $usos . '/' . $maxUsos . ')');
                break;
            }
            // Premios de la ruleta/rasca caducados a las 48h (expiraEn) — los
            // códigos creados a mano desde el panel no llevan este campo.
            if (is_numeric($cupon['expiraEn'] ?? null) && (float)$cupon['expiraEn'] < (microtime(true) * 1000)) break;
            $cupon['uses'] = $usos + 1;
            if (fbPutSiCoincide($databaseURL, 'discounts/' . $discountCode, $accessToken, $cupon, $leido['etag'])) break;
            usleep(rand(20000, 80000));
        }
    }

    // ── 4. REGISTRAR EN phoneLog (para el cooldown/límite diario de próximos pedidos) ──
    registrarPhoneLog($databaseURL, $accessToken, $phoneClean, $todayKey);

    // ── 5. ESTADÍSTICA DE LA SUGERENCIA "¿ALGO DULCE DE POSTRE?" ──
    // Solo cuenta, nunca bloquea el pedido si falla. Se guarda un nodo por
    // día (upsellPostre/<fecha>) con cuántas veces se mostró la sugerencia y
    // cuántas de esas veces el cliente acabó añadiendo algo — para ver en el
    // panel "Estrellas y perdedores" si de verdad funciona.
    $upsellMostrado = !empty($payload['upsellMostrado']);
    $upsellAnadido = !empty($payload['upsellAnadido']);
    if ($upsellMostrado) {
        $upsellPath = 'upsellPostre/' . $todayKey;
        for ($intento = 0; $intento < 5; $intento++) {
            $leido = fbGetConEtag($databaseURL, $upsellPath, $accessToken);
            $stats = is_array($leido['data']) ? $leido['data'] : [];
            $stats['mostrado'] = (is_numeric($stats['mostrado'] ?? null) ? (int)$stats['mostrado'] : 0) + 1;
            if ($upsellAnadido) {
                $stats['anadido'] = (is_numeric($stats['anadido'] ?? null) ? (int)$stats['anadido'] : 0) + 1;
            }
            if (fbPutSiCoincide($databaseURL, $upsellPath, $accessToken, $stats, $leido['etag'])) break;
            usleep(rand(20000, 80000));
        }
    }

    // No debe poder tumbar un pedido ya guardado con éxito si esto falla por
    // lo que sea — es solo un dato informativo para la pantalla de éxito.
    $tiempoEspera = ['pendientesHoy' => null, 'minutosEsperaExtra' => 0];
    try {
        $tiempoEspera = calcularTiempoEsperaEstimado($databaseURL, $accessToken, $todayKey);
    } catch (Exception $e) {
        error_log('[guardar-pedido] No se pudo calcular el tiempo de espera estimado: ' . $e->getMessage());
    }

    echo json_encode(['success' => true, 'pendientesHoy' => $tiempoEspera['pendientesHoy'], 'minutosEsperaExtra' => $tiempoEspera['minutosEsperaExtra']]);
} catch (Exception $e) {
    error_log('[guardar-pedido] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
