<?php
// ═══════════════════════════════════════════════════════════
//  FIDELIZACIÓN (SELLO DIGITAL) — Dulce Patata Food
//
//  Antes el navegador del cliente leía y escribía directamente
//  fidelizacion/<telefono> en Firebase (sellos, premios pendientes,
//  historial, nombre). Con las reglas de seguridad anteriores
//  cualquiera con las devtools abiertas podía escribirse ahí
//  premiosPendientes:999 y regalarse patatas gratis para siempre,
//  además de poder leer el nombre y el historial de cualquier
//  cliente solo sabiendo su teléfono.
//
//  Ahora el sello se calcula aquí, con la cuenta de servicio: el
//  cliente nunca puede sumar más de +1 sello por pedido real, y
//  cada pedido (por su número) solo puede sumar sello una vez
//  (evita duplicar si el navegador reintenta la petición).
//
//  Acciones (todas por POST, JSON):
//   - {"action":"consultar","telefono":"6XXXXXXXX"}
//       → {"success":true,"sellos":N,"premiosPendientes":N,"vecesCompletado":N}
//   - {"action":"registrarSello","telefono":"...","orderNum":"...",
//      "tienePatata":true,"consumioPremio":true|false,"nombre":"..."}
//       → {"success":true,"sellos":N,"premiosPendientes":N}
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

const FIDELIZACION_META = 10;

// ── LÍMITE DE INTENTOS: máximo 30 peticiones por IP cada 5 minutos ──
// (más alto que otros endpoints porque "consultar" se llama cada vez
// que el cliente termina de teclear su teléfono en el formulario)
$tmp_dir = sys_get_temp_dir();
$window  = 300;
$max_ip  = 30;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_fidelizacion_ip_' . md5($ip) . '.json';

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
// abierto de principio a fin — evita que ráfagas de peticiones a la vez
// se salten el límite.
function dpf_fidelizacion_check_limit($file, $max, $window) {
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

if (!dpf_fidelizacion_check_limit($ip_file, $max_ip, $window)) {
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

// Lee fidelizacion/<telefono> (guardado como STRING JSON, igual que jset/jget
// del resto de la web) junto a su ETag actual, para poder escribir después
// de forma condicional.
function fbGetClienteConEtag($databaseURL, $telefono, $accessToken) {
    $etag = null;
    $ch = curl_init($databaseURL . '/fidelizacion/' . $telefono . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'X-Firebase-ETag: true']);
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$etag) {
        if (stripos($header, 'ETag:') === 0) $etag = trim(substr($header, 5));
        return strlen($header);
    });
    $response = curl_exec($ch);
    curl_close($ch);
    $raw = json_decode($response, true);
    $cliente = is_string($raw) ? json_decode($raw, true) : null;
    return ['cliente' => is_array($cliente) ? $cliente : null, 'etag' => $etag];
}

// Devuelve true si escribió, false si hubo conflicto (otra petición para el
// mismo teléfono escribió justo entre medias) — el llamador debe reintentar.
function fbSetClienteSiCoincide($databaseURL, $telefono, $accessToken, $cliente, $etag) {
    $ch = curl_init($databaseURL . '/fidelizacion/' . $telefono . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    $headers = ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'];
    if ($etag) $headers[] = 'If-Match: ' . $etag;
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(json_encode($cliente)));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

// ── Lectura/escritura CONDICIONAL de un nodo cualquiera guardado como
// STRING JSON (con ETag) — para añadir al "Registro de actividad" del
// panel de admin.
function fbGetJsonStringConEtag($databaseURL, $path, $accessToken) {
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
    $raw = json_decode($response, true);
    $arr = is_string($raw) ? json_decode($raw, true) : null;
    return ['data' => is_array($arr) ? $arr : null, 'etag' => $etag];
}
function fbPutJsonStringSiCoincide($databaseURL, $path, $accessToken, $data, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    $headers = ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'];
    if ($etag) $headers[] = 'If-Match: ' . $etag;
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(json_encode($data)));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

// Igual que _normOrderKey() en pedidos-vivo-cocina.js: quita '#' y una 'T' inicial
function normOrderKey($num) {
    return preg_replace('/^T/', '', str_replace('#', '', (string)$num));
}

// Comprueba que orderNum es un pedido REAL guardado hoy, con ese teléfono
// exacto y con al menos un producto "Patata..." — antes registrarSello se
// fiaba de lo que dijera el cliente (orderNum, tienePatata, teléfono), así
// que se podían inventar números de pedido para sumar sellos y premios sin
// límite, sin haber pedido nada de verdad.
// Devuelve el ticket (array) si es válido para sumar sello, o null si no.
function ticketValidoParaSello($databaseURL, $accessToken, $orderNum, $telefono) {
    $todayKey = date('Y-m-d');
    $ticketKey = normOrderKey($orderNum);
    $ch = curl_init($databaseURL . '/tickets/' . $todayKey . '/' . $ticketKey . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    curl_close($ch);
    $ticket = json_decode($response, true);
    if (!is_array($ticket)) return null;
    $telefonoTicket = preg_replace('/[^0-9]/', '', (string)($ticket['phone'] ?? ''));
    if ($telefonoTicket !== $telefono) return null;
    foreach (($ticket['items'] ?? []) as $it) {
        $nombre = isset($it['name']) ? mb_strtolower(trim((string)$it['name'])) : '';
        if (strpos($nombre, 'patata') === 0) return $ticket;
    }
    return null;
}

// El navegador manda "consumioPremio" para saber si hay que restar el
// premio pendiente, pero es solo lo que dice el propio cliente — nada
// impedía llamar a este endpoint a mano con consumioPremio:false mientras
// el pedido real (guardado en el ticket) sí llevaba el descuento de la
// patata gratis ya aplicado, conservando el premio para reusarlo sin
// límite. Esto mira el ticket de verdad: si el total es al menos el
// precio de la patata más cara por debajo de la suma de productos, es que
// se aplicó un descuento grande (premio o código) — no se puede distinguir
// con certeza cuál de los dos fue, pero en ambos casos es más seguro
// restar el premio que dejar que un "consumioPremio:false" lo conserve
// intacto sobre un pedido que claramente ya se benefició de un descuento
// de ese tamaño.
function _ticketPareceConDescuentoGrande($ticket) {
    $itemsSum = 0;
    $maxPatataUnit = 0;
    foreach (($ticket['items'] ?? []) as $it) {
        if (!empty($it['isFee'])) continue;
        $subtotal = isset($it['subtotal']) ? (float)$it['subtotal'] : 0;
        $qty = isset($it['qty']) && $it['qty'] > 0 ? (float)$it['qty'] : 1;
        $itemsSum += $subtotal;
        $nombre = isset($it['name']) ? mb_strtolower(trim((string)$it['name'])) : '';
        if (strpos($nombre, 'patata') === 0) {
            $unit = $subtotal / $qty;
            if ($unit > $maxPatataUnit) $maxPatataUnit = $unit;
        }
    }
    if ($maxPatataUnit <= 0) return false;
    $total = isset($ticket['total']) ? (float)$ticket['total'] : $itemsSum;
    return $total <= ($itemsSum - $maxPatataUnit + 0.05);
}

// Añade una entrada al mismo "Registro de actividad" que ya se ve en el
// panel de admin (config/activityLog) — para que un fallo silencioso del
// servidor aparezca donde el admin ya mira cada día, en vez de perderse
// en el log de errores de PHP.
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

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!$payload || !isset($payload['action']) || !isset($payload['telefono'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Petición inválida']);
        exit;
    }
    $telefono = preg_replace('/[^0-9]/', '', (string)$payload['telefono']);
    if (!preg_match('/^\d{9}$/', $telefono)) {
        echo json_encode(['success' => false, 'error' => 'Teléfono no válido']);
        exit;
    }

    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $action = $payload['action'];

    // ── CONSULTAR: sellos/premios actuales de este teléfono ──
    if ($action === 'consultar') {
        // El teléfono no demuestra que quien pregunta es su dueño (sin login
        // de cliente en toda la web) — el límite general de arriba (30
        // peticiones/5min por IP) no distingue si son 30 consultas del mismo
        // número (normal: alguien corrigiendo un typo) o 30 números
        // DISTINTOS (alguien recorriendo teléfonos para fisgonear sellos
        // ajenos). Esto limita aparte cuántos números distintos puede
        // consultar una misma IP en la ventana — sin restringir repetir el
        // mismo número las veces que haga falta.
        $max_telefonos_distintos = 5;
        $vistos_file = $tmp_dir . '/dpf_fidelizacion_vistos_' . md5($ip) . '.json';
        $fp = fopen($vistos_file, 'c+');
        if ($fp !== false) {
            flock($fp, LOCK_EX);
            $now = time();
            $size = filesize($vistos_file) ?: 0;
            $raw2 = $size > 0 ? fread($fp, $size) : '';
            $vistos = json_decode($raw2, true) ?: [];
            $vistos = array_filter($vistos, function ($ts) use ($now, $window) { return ($now - $ts) < $window; });
            if (!isset($vistos[$telefono]) && count($vistos) >= $max_telefonos_distintos) {
                flock($fp, LOCK_UN);
                fclose($fp);
                http_response_code(429);
                echo json_encode(['success' => false, 'error' => 'Demasiadas consultas distintas. Espera unos minutos.']);
                exit;
            }
            $vistos[$telefono] = $now;
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($vistos));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
        }
        $leido = fbGetClienteConEtag($databaseURL, $telefono, $accessToken);
        $cliente = $leido['cliente'];
        $sellos = is_numeric($cliente['sellos'] ?? null) ? (int)$cliente['sellos'] : 0;
        $premiosPendientes = $cliente
            ? (is_numeric($cliente['premiosPendientes'] ?? null) ? (int)$cliente['premiosPendientes'] : (!empty($cliente['premioDisponible']) ? 1 : 0))
            : 0;
        $vecesCompletado = is_numeric($cliente['vecesCompletado'] ?? null) ? (int)$cliente['vecesCompletado'] : 0;
        echo json_encode([
            'success' => true,
            'sellos' => $sellos,
            'premiosPendientes' => $premiosPendientes,
            'vecesCompletado' => $vecesCompletado,
        ]);
        exit;
    }

    // ── REGISTRAR SELLO: al confirmar un pedido con patata ──
    if ($action === 'registrarSello') {
        $orderNum = isset($payload['orderNum']) ? (string)$payload['orderNum'] : '';
        $tienePatata = !empty($payload['tienePatata']);
        $consumioPremio = !empty($payload['consumioPremio']);
        $nombre = isset($payload['nombre']) ? mb_substr((string)$payload['nombre'], 0, 80) : '';

        if (!$orderNum || !$tienePatata) {
            echo json_encode(['success' => true, 'skipped' => true]);
            exit;
        }
        $ticket = ticketValidoParaSello($databaseURL, $accessToken, $orderNum, $telefono);
        if (!$ticket) {
            // Antes esto solo se registraba en el navegador del propio
            // cliente (con logActivity()), que no llega a Firebase para un
            // cliente anónimo real — así que el admin nunca se enteraba de
            // este fallo salvo que lo estuviera probando ella misma con el
            // panel de admin abierto en el mismo navegador. Ahora se
            // registra aquí, con la cuenta de servicio, para que sí llegue
            // siempre — y con los mismos campos que usa el botón "Reintentar
            // sello" en el panel de Alertas.
            fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ No se pudo sumar el sello de fidelización del pedido ' . $orderNum . ' (tel. ' . $telefono . ') — pedido no encontrado', [
                'tipo'     => 'sello_no_registrado',
                'orderNum' => $orderNum,
                'telefono' => $telefono,
                'nombre'   => $nombre,
            ]);
            echo json_encode(['success' => false, 'error' => 'Pedido no encontrado']);
            exit;
        }
        if (!$consumioPremio && _ticketPareceConDescuentoGrande($ticket)) {
            $consumioPremio = true;
        }

        $guardado = null;
        for ($intento = 0; $intento < 5; $intento++) {
            $leido = fbGetClienteConEtag($databaseURL, $telefono, $accessToken);
            $cliente = $leido['cliente'];
            if (!$cliente) {
                $cliente = ['nombre' => $nombre, 'sellos' => 0, 'premiosPendientes' => 0, 'vecesCompletado' => 0, 'historialCanjes' => [], 'historialSellos' => []];
            }
            // Migración de clientes antiguos (formato con premioDisponible booleano)
            if (!is_numeric($cliente['premiosPendientes'] ?? null)) {
                $cliente['premiosPendientes'] = !empty($cliente['premioDisponible']) ? 1 : 0;
            }
            unset($cliente['premioDisponible']);
            $cliente['sellos'] = is_numeric($cliente['sellos'] ?? null) ? (int)$cliente['sellos'] : 0;
            $cliente['premiosPendientes'] = (int)$cliente['premiosPendientes'];
            $cliente['vecesCompletado'] = is_numeric($cliente['vecesCompletado'] ?? null) ? (int)$cliente['vecesCompletado'] : 0;
            $historialSellos = is_array($cliente['historialSellos'] ?? null) ? $cliente['historialSellos'] : [];

            // Idempotencia: si este pedido ya sumó su sello (reintento de red,
            // doble clic...) no volver a sumar — solo devolver el estado actual.
            $yaRegistrado = false;
            foreach ($historialSellos as $h) {
                if (($h['orderNum'] ?? null) === $orderNum) { $yaRegistrado = true; break; }
            }
            if ($yaRegistrado) {
                echo json_encode(['success' => true, 'sellos' => $cliente['sellos'], 'premiosPendientes' => $cliente['premiosPendientes']]);
                exit;
            }

            if ($nombre) $cliente['nombre'] = $nombre;

            // Si este pedido consume un premio pendiente (la patata gratis ya
            // se descontó en el carrito), se resta 1 y se registra en el
            // historial de canjes. El contador de sellos no se toca aquí.
            if ($consumioPremio && $cliente['premiosPendientes'] > 0) {
                $cliente['premiosPendientes'] -= 1;
                $historialCanjes = is_array($cliente['historialCanjes'] ?? null) ? $cliente['historialCanjes'] : [];
                $historialCanjes[] = ['fecha' => date('c'), 'ticket' => $orderNum];
                $cliente['historialCanjes'] = $historialCanjes;
            }

            $cliente['sellos'] += 1;
            if ($cliente['sellos'] >= FIDELIZACION_META) {
                $cliente['sellos'] = 0;
                $cliente['premiosPendientes'] += 1;
                $cliente['vecesCompletado'] += 1;
            }

            // Registro de cuándo se pone cada sello (con el pedido que lo
            // generó), para detectar ritmos sospechosos y para la
            // idempotencia de arriba. Con solo los últimos 15, un cliente
            // que hiciera 15 pedidos reales más después de uno dado dejaba
            // ese orderNum fuera de la ventana y se podía volver a mandar
            // para sumar otro sello indebido por el mismo pedido — 100 hace
            // ese hueco mucho menos realista de explotar sin dejar de ser
            // un array pequeño.
            $historialSellos[] = ['ts' => (int)(microtime(true) * 1000), 'fecha' => date('c'), 'orderNum' => $orderNum];
            if (count($historialSellos) > 100) $historialSellos = array_slice($historialSellos, -100);
            $cliente['historialSellos'] = $historialSellos;

            if (fbSetClienteSiCoincide($databaseURL, $telefono, $accessToken, $cliente, $leido['etag'])) {
                $guardado = $cliente;
                break;
            }
            usleep(rand(20000, 80000));
        }

        if (!$guardado) {
            fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ No se pudo registrar el sello de fidelización del pedido ' . $orderNum . ' (tel. ' . $telefono . ') tras varios intentos', [
                'tipo'     => 'sello_no_registrado',
                'orderNum' => $orderNum,
                'telefono' => $telefono,
                'nombre'   => $nombre,
            ]);
            echo json_encode(['success' => false, 'error' => 'No se pudo registrar, inténtalo de nuevo.']);
            exit;
        }

        echo json_encode(['success' => true, 'sellos' => $guardado['sellos'], 'premiosPendientes' => $guardado['premiosPendientes']]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
} catch (Exception $e) {
    error_log('[fidelizacion] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
