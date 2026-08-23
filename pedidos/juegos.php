<?php
// ═══════════════════════════════════════════════════════════
//  RULETA DE PREMIOS / RASCA Y GANA — Dulce Patata Food
//
//  Qué hace: decide el premio de un giro/rasca con la cuenta de
//  servicio, en vez de dejar que lo decida el navegador. Si el
//  navegador decidiera el premio (como estaba montado el HTML antes
//  de esto — sin ninguna lógica detrás), cualquiera con las devtools
//  abiertas podría forzarse el premio más caro cada vez, exactamente
//  el mismo problema que ya resolvimos con el sello de fidelización.
//
//  El premio, si tiene descuento (%), se entrega como un código de
//  descuento de un solo uso creado aquí mismo en discounts/<código>
//  — así se reutiliza tal cual el sistema de códigos que ya existe
//  (y que ya está protegido en las reglas de Firebase: solo el admin
//  puede escribir ahí), en vez de inventar un segundo mecanismo de
//  aplicar premios.
//
//  Un teléfono solo puede jugar una vez al día por juego — se
//  registra en ruleta_giros/<fecha>/<telefono> o
//  rasca_giros/<fecha>/<telefono> (nodos de solo admin en las
//  reglas; el navegador nunca escribe ahí directamente). Si ya jugó
//  hoy, se le devuelve el mismo premio que ya ganó (para que pueda
//  recuperar su código si lo perdió), no bloquea, no da error.
//
//  POST (JSON):
//   {"action":"girar","juego":"ruleta"|"rasca","telefono":"6XXXXXXXX"}
//     → {"success":true,"yaJugaste":false,"premio":{...},"code":"RUL-AB12CD"|null}
// ═══════════════════════════════════════════════════════════

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// ── LÍMITE DE INTENTOS: máximo 15 peticiones por IP cada 10 minutos ──
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 15;
// ── TOPE DIARIO: máximo 1 jugada NUEVA por IP y por juego cada día,
// pase lo que pase con el teléfono que se escriba (ver más abajo) ──
$max_ip_day = 1;

// NOTA DE SEGURIDAD: X-Forwarded-For lo puede poner cualquiera a lo que
// quiera (no hay proxy/CDN de confianza delante en Hostinger que lo fije
// de verdad), así que confiar en él permite saltarse el límite de intentos
// mandando un valor distinto en cada petición. REMOTE_ADDR es la IP real
// de quien conecta — no se puede falsificar en la capa TCP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_juegos_ip_' . md5($ip) . '.json';

function dpf_gc_rate_limit_files() {
    if (mt_rand(1, 50) !== 1) return;
    $ahora = time();
    $hoy = date('Y-m-d');
    foreach (glob(sys_get_temp_dir() . '/dpf_*.json') ?: [] as $f) {
        // Los archivos de tope diario por IP (dpf_juegos_ipday_*) deben
        // sobrevivir aunque lleven horas sin tocarse (solo se escriben una
        // vez al día por IP+juego) — si no, el límite se reiniciaría solo
        // por no volver a intentarlo en la última hora.
        if (strpos(basename($f), 'dpf_juegos_ipday_') === 0) {
            $raw = @file_get_contents($f);
            $data = $raw ? json_decode($raw, true) : null;
            if (!is_array($data) || ($data['date'] ?? '') !== $hoy) {
                @unlink($f);
            }
            continue;
        }
        $mtime = @filemtime($f);
        if ($mtime !== false && ($ahora - $mtime) > 3600) {
            @unlink($f);
        }
    }
}
dpf_gc_rate_limit_files();

function dpf_juegos_check_limit($file, $max, $window) {
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

// ── TOPE DIARIO POR IP (independiente del teléfono) ──
// El límite de "una vez al día" de más abajo está atado al teléfono que
// se escribe, y ese campo no se verifica (no hay SMS ni nada parecido) —
// cualquiera puede escribir un teléfono distinto cada vez y seguir
// jugando sin límite real. Esto lo corta contando los intentos NUEVOS
// (no las recuperaciones de "ya jugaste hoy") por IP y por juego, sin
// importar qué teléfono se use. El modo incógnito no sirve para saltarse
// esto porque se basa en la IP, no en cookies/localStorage.
// Abre y bloquea (exclusivo) el fichero de tope diario por IP+juego, y
// devuelve el recuento actual junto con el handle YA bloqueado. El bloqueo
// se mantiene hasta dpf_juegos_ipday_marcar_y_liberar() (o hasta que el
// proceso termine por exit(), que libera cualquier flock() abierto solo) —
// igual que $topeLockFp más abajo — para que comprobar el recuento y
// marcarlo como usado sea una única operación atómica de principio a fin.
// Antes se leía sin lock (dpf_juegos_daily_ip_limit_alcanzado) y solo se
// bloqueaba al escribir (dpf_juegos_marcar_ip_usada), así que varias
// peticiones "girar" simultáneas desde la misma IP (con teléfonos
// inventados distintos, sin verificación SMS) podían pasar todas la
// comprobación antes de que ninguna se marcara como usada, sacando varios
// premios por IP/día en vez de uno.
function dpf_juegos_ipday_abrir($file) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return null; // no bloquear tráfico real por un fallo de disco
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return null;
    }
    $hoy = date('Y-m-d');
    $size = filesize($file) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $data = json_decode($raw, true);
    $count = (is_array($data) && ($data['date'] ?? '') === $hoy) ? (int)($data['count'] ?? 0) : 0;
    return ['fp' => $fp, 'count' => $count];
}

// Consume el tope de hoy usando el mismo handle ya bloqueado por
// dpf_juegos_ipday_abrir() — se llama SOLO cuando la jugada ya se ha
// guardado bien en Firebase, nunca antes de intentarlo. Si se consumiera
// antes y la jugada fallara a medias (Firebase caída, timeout...), el
// cliente se quedaría bloqueado el resto del día sin haber recibido premio
// ninguno, incluso reintentando con el mismo teléfono — en ese caso el
// código simplemente sale con exit() sin llamar a esta función, y el lock
// se libera solo al terminar el proceso.
function dpf_juegos_ipday_marcar_y_liberar($abierto) {
    if (!$abierto || $abierto['fp'] === false) return;
    $fp = $abierto['fp'];
    $data = ['date' => date('Y-m-d'), 'count' => $abierto['count'] + 1];
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

if (!dpf_juegos_check_limit($ip_file, $max_ip, $window)) {
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
    $cache = @json_decode(@file_get_contents($rutaCache), true);
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
    $data = json_decode($response, true);
    if (!isset($data['access_token'])) {
        throw new Exception('No se pudo obtener el token de acceso: ' . $response);
    }

    // Guardar en cache para las próximas peticiones — best-effort: si falla
    // escribir el archivo no pasa nada grave, simplemente se pedirá un
    // token nuevo también la próxima vez.
    @file_put_contents($rutaCache, json_encode([
        'token' => $data['access_token'],
        'exp'   => $now + (int)($data['expires_in'] ?? 3600),
    ]));

    return $data['access_token'];
}

function fbGetConEtag($databaseURL, $path, $accessToken) {
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
    // Antes un fallo de red/timeout aquí (curl_exec devuelve false) se
    // trataba como si Firebase hubiera respondido "no hay nada" — con
    // 'config/juegoActivo', eso hacía que una incidencia real de Firebase
    // se presentara al cliente como "Este juego no está disponible ahora
    // mismo" (mensaje que suena a que la dueña lo desactivó a propósito),
    // en vez de un error de servidor reintentable. Lanzar aquí deja que el
    // catch general de más abajo responda 'Error interno' (sí reintentable)
    // en su lugar.
    if ($response === false) {
        curl_close($ch);
        throw new Exception('Fallo de red al leer ' . $path . ' de Firebase');
    }
    curl_close($ch);
    $data = json_decode($response, true);
    return ['data' => $data, 'etag' => $etag];
}

function fbPutSiCoincide($databaseURL, $path, $accessToken, $data, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
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

// Elige un premio al azar respetando el "peso" (probabilidad relativa) de
// cada uno — igual que se le explica al admin en el panel: no hace falta
// que los pesos sumen 100, es una probabilidad relativa entre ellos.
function elegirPremio($premios) {
    $totalPeso = 0;
    foreach ($premios as $p) $totalPeso += max(0, (float)($p['peso'] ?? 0));
    if ($totalPeso <= 0) return null;
    $r = (mt_rand() / mt_getrandmax()) * $totalPeso;
    $acc = 0;
    foreach ($premios as $p) {
        $acc += max(0, (float)($p['peso'] ?? 0));
        if ($r <= $acc) return $p;
    }
    return $premios[count($premios) - 1];
}

// Genera un código de descuento de un solo uso para el premio ganado y lo
// guarda en discounts/<código> con la cuenta de servicio — discounts/ ya
// exige el UID de admin para escribir en las reglas de Firebase, así que
// el navegador nunca podría crear uno por su cuenta.
// Caduca a las 48h: un premio ganado y no usado no debería quedar como
// descuento válido para siempre — los códigos que crea el admin a mano
// (dcCrear en el panel) no llevan este campo, así que no les afecta.
const JUEGO_CODIGO_VALIDEZ_MS = 48 * 60 * 60 * 1000;
function crearCodigoPremio($databaseURL, $accessToken, $juego, $pct, $telefono) {
    $prefijo = $juego === 'ruleta' ? 'RUL-' : 'RAS-';
    for ($intento = 0; $intento < 20; $intento++) {
        $codigo = $prefijo . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        $leido = fbGetConEtag($databaseURL, 'discounts/' . $codigo, $accessToken);
        if ($leido['data'] !== null) continue; // colisión (muy improbable), probar otro
        $ahoraMs = (int)(microtime(true) * 1000);
        $cupon = [
            'pct'       => $pct,
            'maxUses'   => 1,
            'uses'      => 0,
            'createdAt' => $ahoraMs,
            'expiraEn'  => $ahoraMs + JUEGO_CODIGO_VALIDEZ_MS,
            'origen'    => $juego,
            'telefono'  => $telefono,
        ];
        if (fbPutSiCoincide($databaseURL, 'discounts/' . $codigo, $accessToken, $cupon, $leido['etag'])) {
            return $codigo;
        }
    }
    return null;
}

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!$payload || (($payload['action'] ?? '') !== 'girar')) {
        echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
        exit;
    }

    $juego = isset($payload['juego']) ? (string)$payload['juego'] : '';
    if (!in_array($juego, ['ruleta', 'rasca'], true)) {
        echo json_encode(['success' => false, 'error' => 'Juego no válido']);
        exit;
    }
    $telefono = preg_replace('/[^0-9]/', '', (string)($payload['telefono'] ?? ''));
    if (!preg_match('/^\d{9}$/', $telefono)) {
        echo json_encode(['success' => false, 'error' => 'Teléfono no válido']);
        exit;
    }

    $accessToken = obtenerTokenAcceso($rutaCredenciales);

    // ── ¿Es este el juego que el admin tiene activo ahora mismo? ──
    // Comprobado aquí (no solo en el navegador) para que nadie pueda seguir
    // ganando premios de un juego que el admin ya desactivó, aunque
    // modifique la petición a mano.
    $activoResp = fbGetConEtag($databaseURL, 'config/juegoActivo', $accessToken);
    if (($activoResp['data'] ?? null) !== $juego) {
        echo json_encode(['success' => false, 'error' => 'inactivo', 'message' => 'Este juego no está disponible ahora mismo.']);
        exit;
    }

    $cfgResp = fbGetConEtag($databaseURL, $juego . '_config', $accessToken);
    $cfg = is_array($cfgResp['data']) ? $cfgResp['data'] : null;
    $premios = ($cfg && is_array($cfg['premios'] ?? null)) ? $cfg['premios'] : [];
    if (!$cfg || empty($cfg['activa']) || !$premios) {
        echo json_encode(['success' => false, 'error' => 'inactivo', 'message' => 'Este juego no está disponible ahora mismo.']);
        exit;
    }

    $todayKey = date('Y-m-d');
    $giroPath = $juego . '_giros/' . $todayKey . '/' . $telefono;

    // ── Idempotente: si ya jugó hoy, se le devuelve lo que ya ganó (no
    // vuelve a sortear, no da error) — así puede recuperar su código si
    // recargó la página o lo perdió, sin poder jugar dos veces.
    //
    // El teléfono NO demuestra que quien pregunta es quien jugó — es un
    // campo de texto libre, sin verificación SMS en este juego. Sin más
    // comprobación, cualquiera que supiera o probara un teléfono ajeno
    // (9 dígitos) podía robar el código de descuento de otra persona con
    // solo "recuperar" su jugada. Por eso el giro guarda también un token
    // aleatorio que solo conoce el navegador que jugó (se lo guarda en su
    // propio localStorage) — sin ese token exacto, se confirma que ya
    // jugó pero no se revela el premio ni el código.
    $giroLeido = fbGetConEtag($databaseURL, $giroPath, $accessToken);
    if (is_array($giroLeido['data'])) {
        $tokenRecibido = isset($payload['token']) ? (string)$payload['token'] : '';
        $tokenGuardado = (string)($giroLeido['data']['token'] ?? '');
        $esDueno = $tokenGuardado !== '' && hash_equals($tokenGuardado, $tokenRecibido);
        echo json_encode([
            'success'   => true,
            'yaJugaste' => true,
            'premio'    => $esDueno ? ($giroLeido['data']['premio'] ?? null) : null,
            'code'      => $esDueno ? ($giroLeido['data']['code'] ?? null) : null,
        ]);
        exit;
    }

    // Este teléfono concreto no había jugado hoy — antes de dejarle jugar,
    // comprobar que esta IP no haya agotado ya su jugada nueva de hoy para
    // este juego (con otro teléfono distinto). No afecta a la recuperación
    // de arriba, solo a intentos realmente nuevos.
    $ip_day_file = $tmp_dir . '/dpf_juegos_ipday_' . $juego . '_' . md5($ip) . '.json';
    $ipDayAbierto = dpf_juegos_ipday_abrir($ip_day_file);
    if ($ipDayAbierto !== null && $ipDayAbierto['count'] >= $max_ip_day) {
        flock($ipDayAbierto['fp'], LOCK_UN);
        fclose($ipDayAbierto['fp']);
        echo json_encode(['success' => false, 'error' => 'limite_ip', 'message' => 'Ya se ha jugado hoy desde esta conexión. Inténtalo de nuevo mañana.']);
        exit;
    }

    // ── Tope diario de premios con descuento (config.topeDiario, 0/vacío =
    // sin tope) — cuenta cuántos premios con pct>0 se han entregado hoy y,
    // si ya se alcanzó, solo deja elegir entre los premios sin descuento
    // (pct=0). Si no hay ninguno así configurado, se rechaza el giro con
    // un aviso claro en vez de dar un error genérico.
    //
    // El recuento se hace releyendo todos los giros del día, sin ningún
    // bloqueo — dos giros casi simultáneos podían leer los dos "todavía no
    // se ha llegado al tope" antes de que ninguno terminara de escribir su
    // premio, y entregar los dos un premio con descuento, superando el
    // tope por 1. Se serializa con un lock de archivo por juego+día para
    // que solo un giro a la vez pueda contar/decidir/escribir — el tráfico
    // esperado es bajo, así que no penaliza en la práctica, y PHP libera
    // el lock solo al final de la petición (aunque se salga por `exit`).
    $topeLockFile = $tmp_dir . '/dpf_juegos_topelock_' . $juego . '_' . $todayKey . '.json';
    $topeLockFp = fopen($topeLockFile, 'c+');
    if ($topeLockFp !== false) flock($topeLockFp, LOCK_EX);

    $tope = is_numeric($cfg['topeDiario'] ?? null) ? (int)$cfg['topeDiario'] : 0;
    $premiosDisponibles = $premios;
    if ($tope > 0) {
        $girosHoyResp = fbGetConEtag($databaseURL, $juego . '_giros/' . $todayKey, $accessToken);
        $girosHoy = is_array($girosHoyResp['data']) ? $girosHoyResp['data'] : [];
        $entregados = 0;
        foreach ($girosHoy as $g) {
            if (is_array($g) && isset($g['premio']['pct']) && (float)$g['premio']['pct'] > 0) $entregados++;
        }
        if ($entregados >= $tope) {
            $premiosDisponibles = array_values(array_filter($premios, function ($p) {
                return !isset($p['pct']) || (float)$p['pct'] <= 0;
            }));
            if (!$premiosDisponibles) {
                echo json_encode(['success' => false, 'error' => 'tope_alcanzado', 'message' => 'Hoy ya se han repartido todos los premios disponibles. ¡Vuelve mañana!']);
                exit;
            }
        }
    }

    $premio = elegirPremio($premiosDisponibles);
    if (!$premio) {
        echo json_encode(['success' => false, 'error' => 'Este juego no está disponible ahora mismo.']);
        exit;
    }

    $pct = isset($premio['pct']) ? max(0, min(100, (float)$premio['pct'])) : 0;
    $code = $pct > 0 ? crearCodigoPremio($databaseURL, $accessToken, $juego, $pct, $telefono) : null;

    $token = bin2hex(random_bytes(16));
    $giroData = ['premio' => $premio, 'code' => $code, 'ts' => (int)(microtime(true) * 1000), 'token' => $token];
    // Si esta escritura pierde una carrera muy rara (dos pestañas del mismo
    // teléfono a la vez), el segundo intento simplemente sobreescribe con
    // OTRO premio recién sorteado — no hay forma de jugar dos veces de
    // verdad porque cada uno ya generó como mucho un código de un solo uso.
    $guardado = fbPutSiCoincide($databaseURL, $giroPath, $accessToken, $giroData, $giroLeido['etag']);
    if (!$guardado) {
        // No se ha podido registrar el giro (Firebase caída, timeout...).
        // No se consume el tope diario por IP ni se dice que ha ido bien —
        // así el cliente puede reintentarlo sin quedarse bloqueado por un
        // fallo que no es suyo. El código de descuento, si lo hay, ya se
        // creó de forma independiente en discounts/ y sigue siendo válido
        // aunque este registro de "ya jugaste hoy" no se guarde.
        echo json_encode(['success' => false, 'error' => 'Error al guardar la jugada. Inténtalo de nuevo.']);
        exit;
    }

    // Tope consumido solo ahora que el giro está guardado de verdad — con
    // el mismo handle bloqueado desde la comprobación de arriba, así que
    // ninguna otra petición de esta IP+juego pudo colarse entre medias.
    dpf_juegos_ipday_marcar_y_liberar($ipDayAbierto);

    if ($topeLockFp !== false) { flock($topeLockFp, LOCK_UN); fclose($topeLockFp); }
    echo json_encode(['success' => true, 'yaJugaste' => false, 'premio' => $premio, 'code' => $code, 'token' => $token]);
} catch (Exception $e) {
    error_log('[juegos] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
