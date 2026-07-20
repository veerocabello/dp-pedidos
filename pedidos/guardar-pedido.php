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
function comprobarTotalSospechoso($databaseURL, $accessToken, $items, $total, $discountCode) {
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
    $margen = $maxPatataUnit + $descuentoCodigo + 0.05;
    if ($total < ($itemsSum - $margen)) {
        return sprintf('total enviado %.2f€, suma de productos %.2f€ (margen de descuentos/premio admitido: %.2f€)', $total, $itemsSum, $margen);
    }
    return null;
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
            'subtotal' => isset($it['subtotal']) ? max(0, min(9999, (float)$it['subtotal'])) : 0,
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

    // ── 0. COMPROBACIÓN DE PRECIOS Y TOTAL (solo aviso, nunca bloquea el pedido) ──
    $avisosPrecios = comprobarPreciosSospechosos($databaseURL, $accessToken, $items);
    if ($avisosPrecios) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Posible precio manipulado en pedido ' . $orderNum . ' — ' . implode(' · ', $avisosPrecios));
    }
    $avisoTotal = comprobarTotalSospechoso($databaseURL, $accessToken, $items, $total, $discountCode);
    if ($avisoTotal) {
        fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Posible total manipulado en pedido ' . $orderNum . ' — ' . $avisoTotal);
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

    // ── 4. REGISTRAR EN phoneLog (para el cooldown/límite diario de próximos pedidos) ──
    registrarPhoneLog($databaseURL, $accessToken, $phoneClean, $todayKey);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log('[guardar-pedido] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
