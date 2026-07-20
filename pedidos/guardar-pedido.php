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

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
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
        $qty = isset($it['qty']) && $it['qty'] > 0 ? (float)$it['qty'] : null;
        $subtotal = isset($it['subtotal']) ? (float)$it['subtotal'] : null;
        if ($qty === null || $subtotal === null) continue;
        $precioReal = (float)$menuPorNombre[$nombre]['price'];
        $precioEnviado = $subtotal / $qty;
        if (abs($precioEnviado - $precioReal) > 0.02) {
            $avisos[] = sprintf('%s: enviado %.2f€, precio real %.2f€', $nombre, $precioEnviado, $precioReal);
        }
    }
    return $avisos;
}

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
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

    $orderNum = isset($payload['orderNum']) ? (string)$payload['orderNum'] : '';
    if (!preg_match('/^T\d{3,5}$/', $orderNum)) {
        echo json_encode(['success' => false, 'error' => 'Número de pedido inválido']);
        exit;
    }
    $name = isset($payload['name']) ? mb_substr(trim((string)$payload['name']), 0, 60) : '';
    $phone = isset($payload['phone']) ? mb_substr(trim((string)$payload['phone']), 0, 20) : '';
    $notes = isset($payload['notes']) ? mb_substr(trim((string)$payload['notes']), 0, 300) : '';
    $slotTime = isset($payload['slotTime']) && $payload['slotTime'] !== '' ? (string)$payload['slotTime'] : null;
    $items = is_array($payload['items'] ?? null) ? array_slice($payload['items'], 0, 100) : [];
    $total = is_numeric($payload['total'] ?? null) ? round((float)$payload['total'], 2) : 0;
    if ($total < 0) $total = 0;
    $discountCode = isset($payload['discountCode']) && $payload['discountCode'] !== '' ? strtoupper((string)$payload['discountCode']) : null;

    if (!$name || !$phone) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos del pedido']);
        exit;
    }

    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $todayKey = date('Y-m-d');
    $horaLabel = date('H:i');
    $ticketKey = normOrderKey($orderNum);

    // ── 0. COMPROBACIÓN DE PRECIOS (solo aviso, nunca bloquea el pedido) ──
    $avisosPrecios = comprobarPreciosSospechosos($databaseURL, $accessToken, $items);
    if ($avisosPrecios) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Posible precio manipulado en pedido ' . $orderNum . ' — ' . implode(' · ', $avisosPrecios));
    }

    // ── 1. GUARDAR TICKET (para reimprimir) ──
    // tickets/<fecha>/<num> es un nodo por pedido: sin condición de carrera
    // posible entre pedidos distintos (cada uno tiene su propia clave).
    $ticketData = [
        'orderNum' => $orderNum,
        'name'     => $name,
        'phone'    => $phone,
        'notes'    => $notes,
        'slotTime' => $slotTime,
        'items'    => $items,
        'total'    => $total,
        'time'     => date('d/m/Y, H:i:s'),
    ];
    $chTicket = curl_init($databaseURL . '/tickets/' . $todayKey . '/' . $ticketKey . '.json');
    curl_setopt($chTicket, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chTicket, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($chTicket, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json']);
    curl_setopt($chTicket, CURLOPT_POSTFIELDS, json_encode($ticketData));
    curl_exec($chTicket);
    curl_close($chTicket);

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
            if ($maxUsos !== null && $usos >= $maxUsos) break; // ya agotado, no seguir incrementando
            $cupon['uses'] = $usos + 1;
            if (fbPutSiCoincide($databaseURL, 'discounts/' . $discountCode, $accessToken, $cupon, $leido['etag'])) break;
            usleep(rand(20000, 80000));
        }
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log('[guardar-pedido] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
