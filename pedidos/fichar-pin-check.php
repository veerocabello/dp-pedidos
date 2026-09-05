<?php
// ═══════════════════════════════════════════════════════════
//  COMPROBACIÓN DE PIN Y FICHAJES — Dulce Patata Food
//
//  Qué hace: en vez de que el navegador del empleado tenga que
//  leer la lista COMPLETA de empleados de Firebase (con DNI,
//  teléfono y PIN de todos) para comprobar su propio PIN, se lo
//  pregunta a este script. Este script sí tiene permiso completo
//  (vía la cuenta de servicio) y solo devuelve lo mínimo: si el
//  PIN es válido, y de quién es — nunca la lista entera.
//
//  Los datos viven en config/empleados y config/fichajes, guardados
//  como un ÚNICO STRING con el array en JSON (igual que hace el
//  resto de la web vía jset/jget), no como nodos nativos de Firebase.
//
//  Acciones (todas por POST, JSON):
//   - {"action":"login","pin":"1234"}
//       → {"success":true,"empId":"...","nombre":"...","manIn":"...",...}
//   - {"action":"historial","empId":"..."}
//       → {"success":true,"fichajes":[...]}  (solo los de ese empleado)
//   - {"action":"registrar","empId":"...","tipo":"entrada|salida","firma":"..."}
//       → {"success":true}
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

// ── LÍMITE DE INTENTOS: máximo 15 peticiones por IP cada 5 minutos ──
$tmp_dir = sys_get_temp_dir();
$window  = 300;
$max_ip  = 15;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo
// fije de verdad), así que confiar en él permite saltarse el límite de
// intentos mandando un valor distinto en cada petición. REMOTE_ADDR es
// la IP real de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_fichar_ip_' . md5($ip) . '.json';

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

// Nota: todo esto (leer, contar, decidir, escribir) pasa mientras se tiene
// el lock exclusivo abierto — así dos peticiones que llegan a la vez no
// pueden leer ambas el mismo estado "antes" de que ninguna escriba, que es
// lo que permitía saltarse el límite bajo ráfaga concurrente.
function dpf_fichar_check_limit($file, $max, $window) {
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

if (!dpf_fichar_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit;
}

// ── Límite específico de PIN de fichaje INCORRECTOS (aparte del general de
// arriba, que cuenta TODAS las acciones — login, historial, registrar). Con
// solo el límite general (15 peticiones/5min), alguien podía probar los
// 10.000 PIN de 4 dígitos posibles desde una sola conexión en 2-3 días sin
// que nadie se enterara (hallazgo de la auditoría de seguridad
// pre-apertura). Aquí solo cuentan los intentos que FALLAN (un PIN correcto
// no gasta presupuesto) y con un límite mucho más estricto — 5 fallos cada
// 15 minutos por conexión, que estira ese mismo ataque a más de 20 días.
//
// La comprobación y el registro del fallo se hacían por separado (mirar el
// límite sin lock, y solo si el PIN resultaba incorrecto, registrar el
// fallo bajo lock) — varias peticiones en paralelo podían mirar el límite
// todas a la vez, verlo por debajo de 5, y fallar todas antes de que
// ninguna llegara a registrar nada, triplicando (o más) el margen real por
// encima de los 5 fallos previstos. Ahora dpf_fichar_pinfail_abrir()
// reserva el lock exclusivo DESDE la comprobación, y se mantiene abierto
// durante toda la comprobación del PIN (solo serializa peticiones de la
// MISMA conexión — justo lo que hace falta para contar fallos de verdad) —
// se libera con dpf_fichar_pinfail_registrar_y_cerrar() (PIN incorrecto,
// añade el fallo) o dpf_fichar_pinfail_cerrar() (PIN correcto, no cuenta).
function dpf_fichar_pinfail_abrir($file, $max, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return ['ok' => true, 'fp' => null, 'log' => []]; // no bloquear tráfico real por un fallo de disco
    if (!flock($fp, LOCK_EX)) { fclose($fp); return ['ok' => true, 'fp' => null, 'log' => []]; }
    $now = time();
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $log = json_decode($raw, true) ?: [];
    $log = array_values(array_filter($log, function ($ts) use ($now, $window) { return ($now - $ts) < $window; }));
    if (count($log) >= $max) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return ['ok' => false, 'fp' => null, 'log' => []];
    }
    return ['ok' => true, 'fp' => $fp, 'log' => $log];
}
// PIN incorrecto: añade el fallo y libera el lock. Devuelve el log
// resultante (ya con el fallo nuevo) para que el llamador pueda contar
// cuántos fallos van sin tener que releer el archivo aparte.
function dpf_fichar_pinfail_registrar_y_cerrar($fp, $log, $file) {
    if ($fp === null) return $log;
    $log[] = time();
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($log));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $log;
}
// PIN correcto: no cuenta como fallo, solo libera el lock.
function dpf_fichar_pinfail_cerrar($fp) {
    if ($fp === null) return;
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ── Credenciales de Firebase (fuera de public_html, mismo sitio de siempre) ──
$rutaCredenciales = __DIR__ . '/../../firebase-credenciales.json';
$databaseURL = 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function obtenerTokenAcceso($rutaCredenciales) {
    // Cache del token compartido entre todos los endpoints (guardar-pedido.php,
    // fidelizacion.php, juegos.php, fichar-pin-check.php, webhook-incidencia.php,
    // bimba-verify.php) — dura 1 hora entera, pero sin este cache cada
    // petición pedía uno nuevo a Google desde cero (una ida y vuelta HTTP
    // extra, ~100-400ms) aunque el anterior siguiera siendo válido. En una
    // hora punta con muchos pedidos casi a la vez eso multiplicaba
    // peticiones externas y mantenía cada proceso PHP abierto más tiempo
    // del necesario — en un hosting compartido con límite de procesos
    // simultáneos, eso es justo lo que puede tumbar la web si entra mucha
    // gente a la vez.
    $rutaCache = dirname($rutaCredenciales) . '/firebase-token-cache.json';
    // Lectura con bloqueo compartido — antes era un file_get_contents()
    // suelto: si otra petición estaba a mitad de escribir el caché justo
    // en ese instante (dos procesos casi a la vez, típico en una ráfaga de
    // pedidos), esto podía leer el JSON a medio escribir y fallar a
    // decodificarlo (se trata igual que "caché caducado", así que no
    // rompe nada, pero desperdicia la optimización justo cuando más
    // falta hace).
    $cache = null;
    $fpCache = @fopen($rutaCache, 'r');
    if ($fpCache !== false) {
        if (flock($fpCache, LOCK_SH)) {
            $cache = @json_decode(stream_get_contents($fpCache), true);
        }
        fclose($fpCache);
    }
    // Margen de 5 minutos antes de la caducidad real, para no arriesgarse a
    // usar un token que caduque a mitad de la petición.
    if (is_array($cache) && isset($cache['token'], $cache['exp']) && (int)$cache['exp'] > (time() + 300)) {
        return $cache['token'];
    }

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
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]));
    $response = curl_exec($ch);
    curl_close($ch);
    if ($response === false) {
        throw new Exception('Fallo de conexión al obtener el token de acceso');
    }
    $data = json_decode($response, true);
    if (!isset($data['access_token'])) {
        throw new Exception('No se pudo obtener el token de acceso: ' . $response);
    }

    // Guardar en cache para las próximas peticiones, con bloqueo exclusivo
    // — antes era un file_put_contents() suelto sin flock(): dos procesos
    // escribiendo casi a la vez (varios pedidos pidiendo token nuevo en el
    // mismo instante bajo una ráfaga) podían entrelazar sus escrituras y
    // dejar el archivo con JSON corrupto a medias. Sigue siendo
    // best-effort: si falla escribir el archivo no pasa nada grave,
    // simplemente se pedirá un token nuevo también la próxima vez.
    $fpCache = @fopen($rutaCache, 'c');
    if ($fpCache !== false) {
        if (flock($fpCache, LOCK_EX)) {
            ftruncate($fpCache, 0);
            fwrite($fpCache, json_encode([
                'token' => $data['access_token'],
                'exp'   => $now + (int)($data['expires_in'] ?? 3600),
            ]));
            flock($fpCache, LOCK_UN);
        }
        fclose($fpCache);
    }

    return $data['access_token'];
}

// Lee un nodo que guarda un array como STRING JSON (jset/jget de la web)
function fbGetArrayString($databaseURL, $path, $accessToken) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    curl_close($ch);
    // Un corte de red aquí NO es lo mismo que "config/empleados está
    // vacío" — antes se confundían, y en 'login' (más abajo) una lista de
    // empleados vacía significa "ningún PIN puede ser correcto", así que
    // un corte de Firebase se contaba como un PIN incorrecto real. Con el
    // límite de 5 fallos/15min pensado para frenar fuerza bruta, bastaban
    // 5 empleados fichando durante un corte breve para bloquear el
    // fichaje de TODA la plantilla 15 minutos — y de paso disparaba el
    // aviso de "🚨 varios PIN incorrectos" al admin como si fuera un
    // ataque real.
    if ($response === false) {
        throw new Exception('Fallo de conexión al leer ' . $path . ' de Firebase');
    }
    $raw = json_decode($response, true); // quita el primer nivel (respuesta de la REST API)
    if (!is_string($raw)) return [];
    $arr = json_decode($raw, true); // decodifica el string JSON de verdad
    return is_array($arr) ? $arr : [];
}

// ── Lectura/escritura CONDICIONAL de config/fichajes (con ETag) ──────────
// config/fichajes es un único nodo (todo el array guardado como string), así
// que registrar un fichaje es leer-modificar-escribir el árbol entero. Sin
// más, dos empleados fichando casi a la vez podían perder uno de los dos
// fichajes (el segundo PUT pisaba el primero). Firebase RTDB soporta
// escritura condicional por ETag: si el nodo cambió desde que lo leímos, el
// PUT falla (412) y volvemos a leer + reintentar en vez de pisar el fichaje
// que el otro acababa de guardar.
function fbGetArrayStringConEtag($databaseURL, $path, $accessToken) {
    $etag = null;
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'X-Firebase-ETag: true']);
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$etag) {
        if (stripos($header, 'ETag:') === 0) $etag = trim(substr($header, 5));
        return strlen($header);
    });
    $response = curl_exec($ch);
    curl_close($ch);
    if ($response === false) {
        throw new Exception('Fallo de conexión al leer ' . $path . ' de Firebase');
    }
    $raw = json_decode($response, true);
    $arr = is_string($raw) ? json_decode($raw, true) : null;
    return ['arr' => is_array($arr) ? $arr : [], 'etag' => $etag];
}

// Devuelve true si escribió, false si hubo conflicto (otra petición escribió
// primero) — en ese caso el llamador debe releer y reintentar.
function fbSetArrayStringSiCoincide($databaseURL, $path, $accessToken, $arr, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    $headers = ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'];
    if ($etag) $headers[] = 'If-Match: ' . $etag;
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(json_encode(array_values($arr))));
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $httpCode === 200;
}

// ── SESIÓN DE FICHAJE ──────────────────────────────────────────────────
// Antes, tras el login (comprobar el PIN una vez), el navegador se
// quedaba con el empId en texto plano y lo mandaba tal cual en cada
// acción posterior (historial/registrar/registrarManual) — cualquiera
// que supiera o adivinara el empId de OTRO empleado podía leer su
// historial o ficharlo/desficharlo sin saber su PIN, porque nada
// volvía a comprobar que quien llama de verdad pasó el login. Ahora el
// login devuelve un token firmado (HMAC) con el empId y una caducidad,
// y esas tres acciones exigen ese token — el empId real se saca DEL
// TOKEN, nunca del campo suelto que mande el cliente.
function ficharSessionSecret($rutaCredenciales) {
    // Deriva la clave de firma de las credenciales de Firebase (ya son un
    // secreto protegido fuera de public_html) — no hace falta pedirle a la
    // dueña que cree un fichero de secretos nuevo solo para esto.
    static $secret = null;
    if ($secret !== null) return $secret;
    $creds = json_decode(file_get_contents($rutaCredenciales), true);
    $secret = hash('sha256', ($creds['private_key'] ?? '') . '|fichar-session');
    return $secret;
}
function generarSessionToken($empId, $rutaCredenciales) {
    $exp = time() + 12 * 3600; // 12 horas — de sobra para un turno
    $payload = $empId . '.' . $exp;
    $firma = hash_hmac('sha256', $payload, ficharSessionSecret($rutaCredenciales));
    return $payload . '.' . $firma;
}
// Devuelve el empId si el token es válido y no ha caducado, o null si no.
function verificarSessionToken($token, $rutaCredenciales) {
    if (!is_string($token) || substr_count($token, '.') !== 2) return null;
    list($empId, $exp, $firma) = explode('.', $token);
    if ((int)$exp < time()) return null;
    $esperada = hash_hmac('sha256', $empId . '.' . $exp, ficharSessionSecret($rutaCredenciales));
    if (!hash_equals($esperada, $firma)) return null;
    return $empId;
}

// Añade una entrada al mismo "Registro de actividad" que ya se ve en el
// panel de admin (config/activityLog, guardado igual que config/fichajes:
// un array como STRING JSON) — para que un fallo silencioso del servidor
// aparezca donde el admin ya mira cada día.
function fbAgregarActivityLog($databaseURL, $accessToken, $mensaje) {
    for ($intento = 0; $intento < 5; $intento++) {
        $leido = fbGetArrayStringConEtag($databaseURL, 'config/activityLog', $accessToken);
        $log = $leido['arr'];
        $ahora = new DateTime('now', new DateTimeZone('Europe/Madrid'));
        array_unshift($log, [
            'ts'     => $ahora->format('c'),
            'time'   => $ahora->format('d/m/Y, H:i:s'),
            'action' => $mensaje,
        ]);
        if (count($log) > 200) $log = array_slice($log, 0, 200);
        if (fbSetArrayStringSiCoincide($databaseURL, 'config/activityLog', $accessToken, $log, $leido['etag'])) return;
        usleep(rand(20000, 80000));
    }
}

// Aplica $mutator($fichajesActuales) sobre config/fichajes de forma segura
// frente a fichajes concurrentes. $mutator debe devolver:
//   ['todos' => $arrayNuevo]   → intentar guardar
//   ['error' => 'mensaje']     → abortar sin escribir (p.ej. guardia de doble entrada)
// Si otra petición escribió entre medias, vuelve a leer el estado real y
// reintenta (hasta 8 veces) en vez de perder el fichaje ajeno.
function fbModificarFichajesSeguro($databaseURL, $accessToken, $mutator) {
    for ($intento = 0; $intento < 8; $intento++) {
        $leido = fbGetArrayStringConEtag($databaseURL, 'config/fichajes', $accessToken);
        $resultado = $mutator($leido['arr']);
        if (isset($resultado['error'])) {
            return ['ok' => false, 'error' => $resultado['error']];
        }
        if (fbSetArrayStringSiCoincide($databaseURL, 'config/fichajes', $accessToken, $resultado['todos'], $leido['etag'])) {
            return ['ok' => true];
        }
        usleep(rand(20000, 80000)); // pequeña espera aleatoria para no reintentar todos a la vez
    }
    return ['ok' => false, 'error' => 'No se pudo registrar, inténtalo de nuevo.'];
}

try {
    $raw = file_get_contents('php://input');
    // A diferencia de otros endpoints ya corregidos, esta petición no tenía
    // ningún límite de tamaño de cuerpo — cualquiera podía mandar varios MB
    // por petición, gasto de CPU/memoria innecesario (aunque limitado por
    // el límite de peticiones por IP de arriba). El límite es más generoso
    // que csp-report.php porque "firma" lleva la firma manuscrita como PNG
    // en base64 (canvas de 320×160 — de sobra con margen).
    if (strlen($raw) > 204800) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'Petición demasiado grande']);
        exit;
    }
    $payload = json_decode($raw, true);
    if (!$payload || !isset($payload['action'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Petición inválida']);
        exit;
    }

    $accessToken = obtenerTokenAcceso($rutaCredenciales);
    $action = $payload['action'];

    // ── CHECKTOKEN: validar el token del enlace ?fichar=... ──
    if ($action === 'checkToken') {
        $token = isset($payload['token']) ? (string)$payload['token'] : '';
        if (!$token) {
            echo json_encode(['success' => false]);
            exit;
        }
        $ch = curl_init($databaseURL . '/config/ficharToken.json');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
        $response = curl_exec($ch);
        curl_close($ch);
        if ($response === false) {
            // Un corte de red aquí NO significa "enlace inválido" — antes se
            // confundían y el empleado veía "enlace no válido" en vez de un
            // aviso de incidencia real.
            throw new Exception('Fallo de conexión al comprobar el token de fichaje');
        }
        $tokenReal = json_decode($response, true);
        // hash_equals (no ===) por consistencia con el resto de comparaciones
        // de secretos del fichero (verificarSessionToken más arriba) — mismo
        // motivo: comparar en tiempo constante en vez de carácter a carácter.
        echo json_encode(['success' => is_string($tokenReal) && hash_equals($tokenReal, $token)]);
        exit;
    }

    // ── LOGIN: comprobar PIN contra la lista completa ──
    if ($action === 'login') {
        $pinFailFile = $tmp_dir . '/dpf_fichar_pinfail_ip_' . md5($ip) . '.json';
        $pinFailWindow = 900; // 15 minutos
        $pinFailGate = dpf_fichar_pinfail_abrir($pinFailFile, 5, $pinFailWindow);
        if (!$pinFailGate['ok']) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.']);
            exit;
        }
        $pin = isset($payload['pin']) ? preg_replace('/[^0-9]/', '', (string)$payload['pin']) : '';
        if (strlen($pin) !== 4) {
            dpf_fichar_pinfail_cerrar($pinFailGate['fp']); // formato inválido no cuenta como fallo, como antes
            echo json_encode(['success' => false, 'error' => 'PIN inválido']);
            exit;
        }
        $empleados = fbGetArrayString($databaseURL, 'config/empleados', $accessToken);
        $encontrado = null;
        $coincidencias = 0;
        foreach ($empleados as $emp) {
            // hash_equals (no ===) por la misma razón que el resto de
            // comparaciones de secretos del fichero — tiempo constante en
            // vez de carácter a carácter.
            if (isset($emp['pin']) && hash_equals((string)$emp['pin'], $pin) && empty($emp['deBaja'])) {
                $coincidencias++;
                if (!$encontrado) $encontrado = $emp;
            }
        }
        // El panel ya no deja guardar un PIN duplicado (comprobación
        // transaccional en empModalGuardar, js/auth.js), pero esto es la
        // red de seguridad por si algún dato antiguo se quedó así: si dos
        // empleados comparten PIN, se deja entrar igual (el primero que
        // coincida — no se puede rechazar un fichaje real por un problema
        // de datos ajeno a quien está delante del mostrador), pero se deja
        // constancia clara para que se corrija cuanto antes, porque el
        // segundo empleado está fichando en silencio a nombre del primero.
        if ($coincidencias > 1) {
            fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Dos o más empleados tienen el mismo PIN de fichaje — revísalo en el panel, alguien puede estar fichando a nombre de otro sin darse cuenta');
        }
        if (!$encontrado) {
            // Avisar a caja al tercer fallo seguido, sin esperar a que se
            // agote el límite del todo — así se puede revisar mientras pasa.
            // $fallos ya es el log actualizado (con este fallo incluido),
            // no hace falta releer el archivo aparte.
            $fallos = dpf_fichar_pinfail_registrar_y_cerrar($pinFailGate['fp'], $pinFailGate['log'], $pinFailFile);
            if (count($fallos) === 3) {
                fbAgregarActivityLog($databaseURL, $accessToken, '🚨 Varios PIN de fichaje incorrectos seguidos desde la misma conexión — posible intento de adivinar un PIN');
            }
            echo json_encode(['success' => false, 'error' => 'PIN incorrecto']);
            exit;
        }
        dpf_fichar_pinfail_cerrar($pinFailGate['fp']); // PIN correcto, no cuenta como fallo
        echo json_encode([
            'success'      => true,
            'empId'        => $encontrado['id'],
            'nombre'       => $encontrado['nombre'],
            'manIn'        => $encontrado['manIn']  ?? '',
            'manOut'       => $encontrado['manOut'] ?? '',
            'tarIn'        => $encontrado['tarIn']  ?? '',
            'tarOut'       => $encontrado['tarOut'] ?? '',
            'sessionToken' => generarSessionToken($encontrado['id'], $rutaCredenciales),
        ]);
        exit;
    }

    // ── HISTORIAL: solo los fichajes de ESE empleado concreto ──
    if ($action === 'historial') {
        $empId = verificarSessionToken($payload['sessionToken'] ?? null, $rutaCredenciales);
        if (!$empId) {
            echo json_encode(['success' => false, 'error' => 'Sesión caducada, vuelve a introducir tu PIN.']);
            exit;
        }
        $todos = fbGetArrayString($databaseURL, 'config/fichajes', $accessToken);
        $propios = array_values(array_filter($todos, function ($f) use ($empId) {
            return isset($f['empId']) && $f['empId'] === $empId;
        }));
        echo json_encode(['success' => true, 'fichajes' => $propios]);
        exit;
    }

    // ── REGISTRAR MANUAL: "¿Olvidaste fichar?" — fecha/hora las da el empleado,
    //    sin la guardia de doble entrada/salida (puede ser un día pasado) ni el
    //    ajuste a hora oficial de turno (es una corrección puntual) ──
    if ($action === 'registrarManual') {
        $empId = verificarSessionToken($payload['sessionToken'] ?? null, $rutaCredenciales);
        $tipo  = isset($payload['tipo']) ? (string)$payload['tipo'] : '';
        $fecha = isset($payload['fecha']) ? (string)$payload['fecha'] : '';
        $hora  = isset($payload['hora']) ? (string)$payload['hora'] : '';
        if (!$empId) {
            echo json_encode(['success' => false, 'error' => 'Sesión caducada, vuelve a introducir tu PIN.']);
            exit;
        }
        if (!in_array($tipo, ['entrada', 'salida'], true)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)
            || !preg_match('/^\d{2}:\d{2}$/', $hora)) {
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            exit;
        }

        // Rango de cordura: antes $fecha solo se comprobaba de FORMA
        // (regex), así que un empleado autenticado con su propio PIN podía
        // fabricar fichajes manuales en cualquier fecha (pasada o futura,
        // sin límite) — con las horas que quisiera y sin la guardia de
        // doble entrada/salida (deliberadamente desactivada aquí porque es
        // una corrección puntual), inflando horas trabajadas sin ningún
        // tope. Una corrección real es "se me olvidó fichar hoy o ayer",
        // nunca un día futuro ni de hace semanas.
        $hoyMadrid = new DateTime('now', new DateTimeZone('Europe/Madrid'));
        $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha, new DateTimeZone('Europe/Madrid'));
        if (!$fechaObj) {
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            exit;
        }
        $diffDias = (int)$hoyMadrid->diff($fechaObj)->format('%r%a');
        if ($diffDias > 0 || $diffDias < -7) {
            echo json_encode(['success' => false, 'error' => 'Solo puedes corregir fichajes de los últimos 7 días, nunca de una fecha futura.']);
            exit;
        }

        $empleados = fbGetArrayString($databaseURL, 'config/empleados', $accessToken);
        $emp = null;
        foreach ($empleados as $e) {
            if (isset($e['id']) && $e['id'] === $empId) { $emp = $e; break; }
        }
        if (!$emp || !empty($emp['deBaja'])) {
            echo json_encode(['success' => false, 'error' => 'Empleado no válido']);
            exit;
        }

        $hoyKey = $hoyMadrid->format('Y-m-d');
        $nuevoFichaje = [
            'empId'       => $empId,
            'fecha'       => $fecha,
            'hora'        => $hora,
            'tipo'        => $tipo,
            'manual'      => true,
            // Fecha en la que se REGISTRA la corrección (siempre hoy), no la
            // fecha corregida — sirve para limitar cuántas correcciones
            // puede hacer el mismo empleado en un mismo día, sea cual sea el
            // día que estén corrigiendo.
            'registradoEn' => $hoyKey,
        ];
        // Máximo de correcciones manuales que un mismo empleado puede
        // registrar EN UN DÍA (contando todas las que ya hizo hoy, aunque
        // corrijan fechas distintas) — de sobra para "se me olvidó fichar
        // ayer" alguna vez, pero corta en seco un intento de fabricar
        // muchos fichajes de golpe.
        $MAX_MANUAL_POR_DIA = 6;
        $resultado = fbModificarFichajesSeguro($databaseURL, $accessToken, function ($todos) use ($nuevoFichaje, $empId, $hoyKey, $MAX_MANUAL_POR_DIA) {
            $yaHoy = 0;
            foreach ($todos as $f) {
                if (($f['empId'] ?? '') === $empId && !empty($f['manual']) && ($f['registradoEn'] ?? '') === $hoyKey) {
                    $yaHoy++;
                }
            }
            if ($yaHoy >= $MAX_MANUAL_POR_DIA) {
                return ['error' => 'Has alcanzado el máximo de correcciones manuales por hoy. Contacta con administración si necesitas más.'];
            }
            $todos[] = $nuevoFichaje;
            return ['todos' => $todos];
        });
        if (!$resultado['ok']) {
            if ($resultado['error'] === 'No se pudo registrar, inténtalo de nuevo.') {
                fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ No se pudo registrar el fichaje manual de ' . $empId . ' (' . $fecha . ' ' . $hora . ') tras varios intentos');
            }
            echo json_encode(['success' => false, 'error' => $resultado['error']]);
            exit;
        }

        echo json_encode(['success' => true]);
        exit;
    }

    // ── REGISTRAR: nueva entrada/salida ──
    if ($action === 'registrar') {
        $empId = verificarSessionToken($payload['sessionToken'] ?? null, $rutaCredenciales);
        $tipo  = isset($payload['tipo']) ? (string)$payload['tipo'] : '';
        if (!$empId) {
            echo json_encode(['success' => false, 'error' => 'Sesión caducada, vuelve a introducir tu PIN.']);
            exit;
        }
        if (!in_array($tipo, ['entrada', 'salida'], true)) {
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            exit;
        }

        $empleados = fbGetArrayString($databaseURL, 'config/empleados', $accessToken);
        $emp = null;
        foreach ($empleados as $e) {
            if (isset($e['id']) && $e['id'] === $empId) { $emp = $e; break; }
        }
        if (!$emp || !empty($emp['deBaja'])) {
            echo json_encode(['success' => false, 'error' => 'Empleado no válido']);
            exit;
        }

        $ahora = new DateTime('now', new DateTimeZone('Europe/Madrid'));
        $fecha = $ahora->format('Y-m-d');
        $hora  = $ahora->format('H:i');

        // Hora oficial según el turno del contrato más cercano a la hora real
        $horaOficial = $hora;
        $realMin = ((int)$ahora->format('H')) * 60 + (int)$ahora->format('i');
        $campoIn  = $tipo === 'entrada' ? 'manIn'  : 'manOut';
        $campoIn2 = $tipo === 'entrada' ? 'tarIn'  : 'tarOut';
        if (!empty($emp[$campoIn]) && !empty($emp[$campoIn2])) {
            list($mh, $mm) = array_map('intval', explode(':', $emp[$campoIn]));
            list($th, $tm) = array_map('intval', explode(':', $emp[$campoIn2]));
            // Distancia circular (24h), no la resta directa — si no, un turno
            // programado a las 00:00 parece estar a "23h y pico" de un
            // fichaje real a las 23:50, en vez de a los ~10 minutos que
            // realmente hay, y se elige el turno equivocado como "hora
            // oficial" para ese fichaje.
            $diffMan = min(abs($realMin - ($mh * 60 + $mm)), 1440 - abs($realMin - ($mh * 60 + $mm)));
            $diffTar = min(abs($realMin - ($th * 60 + $tm)), 1440 - abs($realMin - ($th * 60 + $tm)));
            $horaOficial = $diffMan <= $diffTar ? $emp[$campoIn] : $emp[$campoIn2];
        } elseif (!empty($emp[$campoIn2])) {
            $horaOficial = $emp[$campoIn2];
        } elseif (!empty($emp[$campoIn])) {
            $horaOficial = $emp[$campoIn];
        }

        $nuevoFichaje = [
            'empId'    => $empId,
            'fecha'    => $fecha,
            'hora'     => $horaOficial,
            'horaReal' => $hora,
            'tipo'     => $tipo,
        ];
        // A diferencia del resto de campos de este formulario (tipo, fecha,
        // hora…), la firma no se normalizaba a texto antes de guardarla —
        // si llegaba algo que no fuera texto plano (un array, un número),
        // se colaba tal cual en el fichaje guardado.
        if (!empty($payload['firma']) && is_string($payload['firma'])) {
            $nuevoFichaje['firma'] = $payload['firma'];
        }

        // La guardia (evitar doble entrada/salida) se recalcula en cada
        // intento contra el estado más reciente leído de Firebase, no
        // contra una copia que pudo quedarse desfasada por otro fichaje
        // guardado entre medias.
        // Se guarda aparte de $fecha porque, si el último fichaje de TODOS
        // los días de este empleado (no solo hoy) sigue siendo una entrada
        // sin salida de un día distinto, es que quedó huérfano (olvido,
        // móvil sin batería...) — antes esto pasaba totalmente
        // desapercibido: la guardia solo miraba los fichajes de HOY, así
        // que el día siguiente no veía ninguna entrada activa y dejaba
        // fichar una entrada nueva igual, dejando la de antes abierta para
        // siempre (fuera de "quién trabaja ahora" y sin contar en las horas
        // de personal de bimba, sin que nadie se enterase).
        $entradaOrfanaDe = null;
        $resultado = fbModificarFichajesSeguro($databaseURL, $accessToken, function ($todos) use ($empId, $fecha, $tipo, $nuevoFichaje, &$entradaOrfanaDe) {
            $suyos = array_values(array_filter($todos, function ($f) use ($empId) {
                return ($f['empId'] ?? '') === $empId;
            }));
            usort($suyos, function ($a, $b) { return strcmp(($a['fecha'] ?? '') . ($a['hora'] ?? ''), ($b['fecha'] ?? '') . ($b['hora'] ?? '')); });
            $suyosHoy = array_values(array_filter($suyos, function ($f) use ($fecha) { return ($f['fecha'] ?? '') === $fecha; }));
            $ultimoTipo = count($suyosHoy) ? end($suyosHoy)['tipo'] : null;
            if ($tipo === 'entrada' && $ultimoTipo === 'entrada') {
                return ['error' => 'Ya tienes una entrada registrada. Registra primero la salida.'];
            }
            if ($tipo === 'salida' && $ultimoTipo !== 'entrada') {
                return ['error' => 'No tienes una entrada activa. Registra primero la entrada.'];
            }
            if ($tipo === 'entrada' && count($suyos)) {
                $ultimoDeTodos = end($suyos);
                if (($ultimoDeTodos['tipo'] ?? '') === 'entrada' && ($ultimoDeTodos['fecha'] ?? '') !== $fecha) {
                    $entradaOrfanaDe = $ultimoDeTodos['fecha'] ?? null;
                }
            }
            $todos[] = $nuevoFichaje;
            return ['todos' => $todos];
        });

        if (!$resultado['ok']) {
            if ($resultado['error'] === 'No se pudo registrar, inténtalo de nuevo.') {
                fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ No se pudo registrar el fichaje de ' . $empId . ' (' . $tipo . ') tras varios intentos');
            }
            echo json_encode(['success' => false, 'error' => $resultado['error']]);
            exit;
        }

        if ($entradaOrfanaDe) {
            $nombreEmp = $emp['nombre'] ?? $empId;
            fbAgregarActivityLog($databaseURL, $accessToken, '⚠️ ' . $nombreEmp . ' fichó entrada sin haber cerrado la del ' . $entradaOrfanaDe . ' — revísalo en Fichajes');
        }

        echo json_encode(['success' => true, 'hora' => $hora, 'tipo' => $tipo]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
} catch (Exception $e) {
    error_log('[fichar-pin-check] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
