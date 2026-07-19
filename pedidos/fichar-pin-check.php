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

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_fichar_ip_' . md5($ip) . '.json';

function dpf_fichar_check_limit($file, $max, $window) {
    $now = time();
    $log = [];
    if (file_exists($file)) {
        $log = json_decode(file_get_contents($file), true) ?: [];
    }
    $log = array_filter($log, function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    if (count($log) >= $max) {
        return false;
    }
    $log[] = $now;
    file_put_contents($file, json_encode(array_values($log)), LOCK_EX);
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

// Escribe de vuelta el array entero como STRING JSON, en el mismo formato
function fbSetArrayString($databaseURL, $path, $accessToken, $arr) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(json_encode(array_values($arr))));
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
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
            'success' => true,
            'empId'   => $encontrado['id'],
            'nombre'  => $encontrado['nombre'],
            'manIn'   => $encontrado['manIn']  ?? '',
            'manOut'  => $encontrado['manOut'] ?? '',
            'tarIn'   => $encontrado['tarIn']  ?? '',
            'tarOut'  => $encontrado['tarOut'] ?? '',
        ]);
        exit;
    }

    // ── HISTORIAL: solo los fichajes de ESE empleado concreto ──
    if ($action === 'historial') {
        $empId = isset($payload['empId']) ? (string)$payload['empId'] : '';
        if (!$empId) {
            echo json_encode(['success' => false, 'error' => 'Falta empId']);
            exit;
        }
        $todos = fbGetArrayString($databaseURL, 'config/fichajes', $accessToken);
        $propios = array_values(array_filter($todos, function ($f) use ($empId) {
            return isset($f['empId']) && $f['empId'] === $empId;
        }));
        echo json_encode(['success' => true, 'fichajes' => $propios]);
        exit;
    }

    // ── REGISTRAR: nueva entrada/salida ──
    if ($action === 'registrar') {
        $empId = isset($payload['empId']) ? (string)$payload['empId'] : '';
        $tipo  = isset($payload['tipo']) ? (string)$payload['tipo'] : '';
        if (!$empId || !in_array($tipo, ['entrada', 'salida'], true)) {
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

        $todos = fbGetArrayString($databaseURL, 'config/fichajes', $accessToken);

        // Guardia: evitar doble entrada o doble salida consecutiva
        $suyosHoy = array_values(array_filter($todos, function ($f) use ($empId, $fecha) {
            return ($f['empId'] ?? '') === $empId && ($f['fecha'] ?? '') === $fecha;
        }));
        usort($suyosHoy, function ($a, $b) { return strcmp($a['hora'] ?? '', $b['hora'] ?? ''); });
        $ultimoTipo = count($suyosHoy) ? end($suyosHoy)['tipo'] : null;
        if ($tipo === 'entrada' && $ultimoTipo === 'entrada') {
            echo json_encode(['success' => false, 'error' => 'Ya tienes una entrada registrada. Registra primero la salida.']);
            exit;
        }
        if ($tipo === 'salida' && $ultimoTipo !== 'entrada') {
            echo json_encode(['success' => false, 'error' => 'No tienes una entrada activa. Registra primero la entrada.']);
            exit;
        }

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

        $todos[] = $nuevoFichaje;
        fbSetArrayString($databaseURL, 'config/fichajes', $accessToken, $todos);

        echo json_encode(['success' => true, 'hora' => $hora, 'tipo' => $tipo]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
} catch (Exception $e) {
    error_log('[fichar-pin-check] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
