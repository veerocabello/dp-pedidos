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

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Petición inválida']);
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
    $statsGuardado = false;
    for ($intento = 0; $intento < 8; $intento++) {
        $leido = fbGetConEtag($databaseURL, 'stats/' . $todayKey, $accessToken);
        $stats = is_array($leido['data']) ? $leido['data'] : null;
        if (!$stats || ($stats['date'] ?? null) !== $todayKey) {
            $stats = ['date' => $todayKey, 'count' => 0, 'total' => 0, 'orders' => []];
        }
        if (!is_array($stats['orders'] ?? null)) $stats['orders'] = [];

        // Idempotencia: si este pedido ya está guardado (reintento de red), no duplicar
        $yaExiste = false;
        foreach ($stats['orders'] as $o) {
            if (normOrderKey($o['num'] ?? '') === normOrderKey($orderNum)) { $yaExiste = true; break; }
        }
        if (!$yaExiste) {
            $stats['count'] = (int)($stats['count'] ?? 0) + 1;
            $stats['total'] = round((float)($stats['total'] ?? 0) + $total, 2);
            array_unshift($stats['orders'], $newOrder);
        }

        if (fbPutSiCoincide($databaseURL, 'stats/' . $todayKey, $accessToken, $stats, $leido['etag'])) {
            $statsGuardado = true;
            break;
        }
        usleep(rand(20000, 80000));
    }

    if (!$statsGuardado) {
        error_log('[guardar-pedido] No se pudo actualizar stats para el pedido ' . $orderNum . ' tras varios intentos.');
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
