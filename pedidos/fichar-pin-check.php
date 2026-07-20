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

// Lee un nodo que guarda un array como STRING JSON (jset/jget de la web)
function fbGetArrayString($databaseURL, $path, $accessToken) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $response = curl_exec($ch);
    curl_close($ch);
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
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'X-Firebase-ETag: true']);
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$etag) {
        if (stripos($header, 'ETag:') === 0) $etag = trim(substr($header, 5));
        return strlen($header);
    });
    $response = curl_exec($ch);
    curl_close($ch);
    $raw = json_decode($response, true);
    $arr = is_string($raw) ? json_decode($raw, true) : null;
    return ['arr' => is_array($arr) ? $arr : [], 'etag' => $etag];
}

// Devuelve true si escribió, false si hubo conflicto (otra petición escribió
// primero) — en ese caso el llamador debe releer y reintentar.
function fbSetArrayStringSiCoincide($databaseURL, $path, $accessToken, $arr, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
        $response = curl_exec($ch);
        curl_close($ch);
        $tokenReal = json_decode($response, true);
        echo json_encode(['success' => is_string($tokenReal) && $tokenReal === $token]);
        exit;
    }

    // ── LOGIN: comprobar PIN contra la lista completa ──
    if ($action === 'login') {
        $pin = isset($payload['pin']) ? preg_replace('/[^0-9]/', '', (string)$payload['pin']) : '';
        if (strlen($pin) !== 4) {
            echo json_encode(['success' => false, 'error' => 'PIN inválido']);
            exit;
        }
        $empleados = fbGetArrayString($databaseURL, 'config/empleados', $accessToken);
        $encontrado = null;
        foreach ($empleados as $emp) {
            if (isset($emp['pin']) && $emp['pin'] === $pin && empty($emp['deBaja'])) {
                $encontrado = $emp;
                break;
            }
        }
        if (!$encontrado) {
            echo json_encode(['success' => false, 'error' => 'PIN incorrecto']);
            exit;
        }
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

        $empleados = fbGetArrayString($databaseURL, 'config/empleados', $accessToken);
        $emp = null;
        foreach ($empleados as $e) {
            if (isset($e['id']) && $e['id'] === $empId) { $emp = $e; break; }
        }
        if (!$emp || !empty($emp['deBaja'])) {
            echo json_encode(['success' => false, 'error' => 'Empleado no válido']);
            exit;
        }

        $nuevoFichaje = [
            'empId'  => $empId,
            'fecha'  => $fecha,
            'hora'   => $hora,
            'tipo'   => $tipo,
            'manual' => true,
        ];
        $resultado = fbModificarFichajesSeguro($databaseURL, $accessToken, function ($todos) use ($nuevoFichaje) {
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
            $diffMan = abs($realMin - ($mh * 60 + $mm));
            $diffTar = abs($realMin - ($th * 60 + $tm));
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
        if (!empty($payload['firma'])) {
            $nuevoFichaje['firma'] = $payload['firma'];
        }

        // La guardia (evitar doble entrada/salida) se recalcula en cada
        // intento contra el estado más reciente leído de Firebase, no
        // contra una copia que pudo quedarse desfasada por otro fichaje
        // guardado entre medias.
        $resultado = fbModificarFichajesSeguro($databaseURL, $accessToken, function ($todos) use ($empId, $fecha, $tipo, $nuevoFichaje) {
            $suyosHoy = array_values(array_filter($todos, function ($f) use ($empId, $fecha) {
                return ($f['empId'] ?? '') === $empId && ($f['fecha'] ?? '') === $fecha;
            }));
            usort($suyosHoy, function ($a, $b) { return strcmp($a['hora'] ?? '', $b['hora'] ?? ''); });
            $ultimoTipo = count($suyosHoy) ? end($suyosHoy)['tipo'] : null;
            if ($tipo === 'entrada' && $ultimoTipo === 'entrada') {
                return ['error' => 'Ya tienes una entrada registrada. Registra primero la salida.'];
            }
            if ($tipo === 'salida' && $ultimoTipo !== 'entrada') {
                return ['error' => 'No tienes una entrada activa. Registra primero la entrada.'];
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

        echo json_encode(['success' => true, 'hora' => $hora, 'tipo' => $tipo]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
} catch (Exception $e) {
    error_log('[fichar-pin-check] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
