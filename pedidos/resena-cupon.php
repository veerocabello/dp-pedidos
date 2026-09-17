<?php
// ═══════════════════════════════════════════════════════════
//  CUPÓN POR RESEÑA — Dulce Patata Food
//
//  Qué hace: un cliente escribe su número de móvil y pide un cupón del
//  10% a cambio de haber dejado una reseña en Google. NO se genera ningún
//  código solo por pedirlo — se guarda como "pendiente" y aparece como
//  aviso en el panel de admin (Alertas), y solo cuando la dueña lo aprueba
//  a mano (tras comprobar ella misma que la reseña existe de verdad en su
//  Google Business) se crea el cupón real y se manda un SMS de aviso real
//  por Twilio (Messages API, distinta de la Verify API que usan
//  send-code.php/verify-code.php para los códigos OTP del checkout —
//  necesita TWILIO_PHONE_NUMBER definido en twilio-secrets.php, ver
//  enviarSmsAvisoCuponAprobado más abajo). Si ese SMS falla o no está
//  configurado, no rompe la aprobación: el cupón ya es válido igual, y el
//  cliente lo verá de todos modos si vuelve a esta pantalla y escribe su
//  número otra vez (acción "consultarEstado" más abajo).
//
//  Sin verificación por SMS (OTP) al solicitar — a propósito: mandar un
//  código de un solo uso aquí solo para "demostrar" el número, cuando de
//  todas formas se va a avisar por SMS real al aprobar, era un SMS de más
//  sin necesidad real. El filtro de abuso de verdad sigue siendo el mismo
//  de siempre: la dueña comprueba a mano que la reseña existe antes de
//  aprobar nada, y el cupón generado solo lo puede canjear ESE teléfono
//  (discountCodeInvalido en guardar-pedido.php).
//
//  config/cuponesResena/<teléfono> exige el UID de admin en las reglas
//  de Firebase (igual que el resto de config/), así que un cliente
//  anónimo nunca podría escribir ahí por su cuenta — todo pasa por aquí,
//  con la cuenta de servicio.
//
//  POST (JSON):
//   {"action":"consultarEstado","phone":"6XXXXXXXX"}
//     → {"success":true,"estado":"ninguno"|"pendiente"|"aprobado"|"descartado","codigo":"RESENA-XXXX"|null}
//   {"action":"solicitar","phone":"...","nombreGoogle":"...","comentario":"...","captura":"data:image/jpeg;base64,...","contactoMetodo":"whatsapp"|"instagram","instagramUsuario":"..."}
//     → {"success":true,"estado":"pendiente"|"aprobado","codigo":"..."|null}
//     captura es obligatoria (ver guardarCapturaResena) — una captura de
//     pantalla de la reseña real en Google, para que la dueña la vea
//     directamente en Alertas al aprobar en vez de fiarse solo del nombre.
//     Se calcula también su huella perceptual y se compara contra las de
//     solicitudes anteriores (ver _dpfHashPerceptualImagen/
//     RESENA_HASH_DISTANCIA_SOSPECHOSA) — si se parece mucho a la de OTRO
//     teléfono, no se bloquea la solicitud, pero queda marcada
//     (capturaDuplicadaDe) para que se note en Alertas antes de aprobar.
//     phone SIEMPRE hace falta (protege el código, ver discountCodeInvalido
//     en guardar-pedido.php) — contactoMetodo solo dice por dónde avisar al
//     aprobar; si es "instagram", instagramUsuario es obligatorio también.
//   {"action":"aprobar","deviceId":"...","token":"...","phone":"..."}
//     → {"success":true,"codigo":"RESENA-XXXX"}
//   {"action":"descartar","deviceId":"...","token":"...","phone":"..."}
//     → {"success":true}
//   {"action":"borrarHistorial","deviceId":"...","token":"...","phone":"..."}
//     → {"success":true} — borra para siempre una solicitud ya aprobada o
//     descartada (y su captura en disco). No permite borrar una pendiente.
// ═══════════════════════════════════════════════════════════

date_default_timezone_set('Europe/Madrid');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// ── LÍMITE DE INTENTOS: máximo 20 peticiones por IP cada 10 minutos ──
// (consultarEstado se llama en cada verificación de móvil, más generoso
// que un límite pensado solo para "solicitar")
$tmp_dir = sys_get_temp_dir();
$window  = 600;
$max_ip  = 20;

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip = preg_replace('/[^0-9a-fA-F:.,]/', '', explode(',', $ip)[0]);
$ip_file = $tmp_dir . '/dpf_resena_ip_' . md5($ip) . '.json';

function dpf_gc_rate_limit_files() {
    if (mt_rand(1, 50) !== 1) return;
    $ahora = time();
    foreach (glob(sys_get_temp_dir() . '/dpf_resena_*.json') ?: [] as $f) {
        $mtime = @filemtime($f);
        if ($mtime !== false && ($ahora - $mtime) > 3600) {
            @unlink($f);
        }
    }
}
dpf_gc_rate_limit_files();

function dpf_resena_check_limit($file, $max, $window) {
    $fp = fopen($file, 'c+');
    if ($fp === false) return true; // fail-open, igual que el resto de límites de esta web
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

if (!dpf_resena_check_limit($ip_file, $max_ip, $window)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']);
    exit;
}

// ── Tope aparte, por teléfono: máximo 5 solicitudes NUEVAS ("solicitar")
// por día — evita que alguien reenvíe la misma solicitud sin parar y
// llene de avisos duplicados el panel de Alertas. No afecta a
// consultarEstado, que es de solo lectura. ──
$max_solicitudes_dia = 5;

require_once __DIR__ . '/twilio-config.php';

// ── Credenciales de Firebase (fuera de public_html, mismo sitio de siempre) ──
$rutaCredenciales = __DIR__ . '/../../firebase-credenciales.json';
$databaseURL = 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function obtenerTokenAcceso($rutaCredenciales) {
    // Cache del token compartido entre todos los endpoints (guardar-pedido.php,
    // fidelizacion.php, juegos.php, fichar-pin-check.php, webhook-incidencia.php,
    // bimba-verify.php, resena-cupon.php) — dura 1 hora entera, ver el
    // comentario largo original en juegos.php para el porqué.
    $rutaCache = dirname($rutaCredenciales) . '/firebase-token-cache.json';
    $cache = null;
    $fpCache = @fopen($rutaCache, 'r');
    if ($fpCache !== false) {
        if (flock($fpCache, LOCK_SH)) {
            $cache = @json_decode(stream_get_contents($fpCache), true);
        }
        fclose($fpCache);
    }
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

// ── config/activityLog usa la convención de "string JSON" (el valor
// guardado es un string con JSON dentro, no un array nativo) — mismos
// helpers que fidelizacion.php, necesarios para no romper ese formato al
// escribir el aviso de "cupón de reseña pendiente" en Alertas. ──
function fbGetJsonStringConEtag($databaseURL, $path, $accessToken) {
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
    if ($response === false) {
        curl_close($ch);
        throw new Exception('Fallo de red al leer ' . $path . ' de Firebase');
    }
    curl_close($ch);
    $raw = json_decode($response, true);
    $arr = is_string($raw) ? json_decode($raw, true) : null;
    return ['data' => is_array($arr) ? $arr : null, 'etag' => $etag];
}
function fbPutJsonStringSiCoincide($databaseURL, $path, $accessToken, $data, $etag) {
    $ch = curl_init($databaseURL . '/' . $path . '.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
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
function fbAgregarActivityLog($databaseURL, $accessToken, $mensaje, $extra = []) {
    // config/activityLog es un nodo COMPARTIDO por todo lo que pasa en la
    // web (cada pedido real, cada acción de admin...) — con 5 reintentos
    // (~20-80ms cada uno, ~250ms de margen total) un momento con bastante
    // actividad a la vez puede agotarlos todos por colisiones de ETag
    // seguidas, perdiendo el aviso en silencio: el cliente ve "solicitud
    // enviada" (el registro real en config/cuponesResena/<tel> sí se
    // guardó bien, eso no depende de esto) pero nunca aparece nada en
    // Alertas porque el aviso en sí nunca llegó a escribirse. Encontrado
    // en producción: "he solicitado el 10% y en alertas no sale nada".
    // Más reintentos (~20 × 20-80ms ≈ 1s de margen en el peor caso) para
    // que gane la carrera con mucha más frecuencia — sigue siendo mucho
    // menos que el timeout de 8s del cliente. Si aun así fallan todos, se
    // deja constancia en el log de errores de PHP en vez de desaparecer
    // sin dejar rastro.
    for ($intento = 0; $intento < 20; $intento++) {
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
    error_log('[resena-cupon] fbAgregarActivityLog: no se pudo escribir el aviso tras 20 intentos — "' . $mensaje . '" se ha perdido (el dato real en config/cuponesResena sí quedó guardado)');
}

// Manda el SMS real de aviso cuando se aprueba un cupón — API de Mensajes
// de Twilio (Messages), DISTINTA de la Verify API que usan send-code.php/
// verify-code.php para los códigos OTP: Verify no puede mandar texto
// libre, solo códigos de un solo uso. Para esto hace falta un número de
// Twilio propio como remitente ("From"), que aún no existe en este
// proyecto — hay que definir TWILIO_PHONE_NUMBER en twilio-secrets.php
// (fuera de public_html, junto a TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN).
// Si no está definido, se salta en silencio (con log) en vez de romper la
// aprobación: el cupón ya es válido igual, y el aviso queda pendiente de
// que se configure el número.
function enviarSmsAvisoCuponAprobado($telefono, $codigo) {
    if (!defined('TWILIO_PHONE_NUMBER') || !TWILIO_PHONE_NUMBER
        || !defined('TWILIO_ACCOUNT_SID') || !TWILIO_ACCOUNT_SID
        || !defined('TWILIO_AUTH_TOKEN') || !TWILIO_AUTH_TOKEN) {
        error_log('[' . date('Y-m-d H:i:s') . '] [resena-cupon] TWILIO_PHONE_NUMBER no configurado — no se manda SMS de aviso (cupón ' . $codigo . ' para ' . $telefono . ' sigue siendo válido igualmente)' . PHP_EOL, 3, __DIR__ . '/twilio-errores.log');
        return false;
    }
    $to = '+34' . $telefono;
    $mensaje = '🎉 ¡Tu 10% ya está listo! Código: ' . $codigo . ' — válido 60 días, un solo uso. Dulce Patata Food';
    $ch = curl_init('https://api.twilio.com/2010-04-01/Accounts/' . TWILIO_ACCOUNT_SID . '/Messages.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'To'   => $to,
        'From' => TWILIO_PHONE_NUMBER,
        'Body' => $mensaje,
    ]));
    curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode !== 201) {
        error_log('[' . date('Y-m-d H:i:s') . "] [resena-cupon] Twilio SMS aviso ERROR — to=$to http_code=$httpCode response=$response" . PHP_EOL, 3, __DIR__ . '/twilio-errores.log');
        return false;
    }
    return true;
}

// Huella perceptual de una imagen (dHash) — a diferencia de un hash
// criptográfico normal (sha256 de los bytes), esta SÍ reconoce la "misma"
// imagen aunque se haya recomprimido o reescalado de forma distinta (la
// foto ya pasa por _resenaComprimirImagen en el móvil, así que dos subidas
// de la misma captura pueden no ser bytes idénticos). Se reduce a un
// cuadrito de 9x8 en escala de grises y se compara cada píxel con el de su
// derecha: 1 si es más claro, 0 si no — 64 bits en total, codificados como
// 16 caracteres hexadecimales. Devuelve null si GD no está disponible o la
// imagen no se puede procesar (falla "abierto": si no se puede calcular la
// huella, simplemente no hay detección de duplicados para esta captura, la
// solicitud sigue adelante igual).
function _dpfHashPerceptualImagen($im) {
    if (!extension_loaded('gd')) return null;
    $w = 9; $h = 8;
    $mini = @imagecreatetruecolor($w, $h);
    if (!$mini) return null;
    @imagecopyresampled($mini, $im, 0, 0, 0, 0, $w, $h, imagesx($im), imagesy($im));
    @imagefilter($mini, IMG_FILTER_GRAYSCALE);
    $bits = '';
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w - 1; $x++) {
            $g1 = imagecolorat($mini, $x, $y) & 0xFF;
            $g2 = imagecolorat($mini, $x + 1, $y) & 0xFF;
            $bits .= ($g1 > $g2) ? '1' : '0';
        }
    }
    imagedestroy($mini);
    $hex = '';
    for ($i = 0; $i < 64; $i += 4) {
        $hex .= dechex(bindec(substr($bits, $i, 4)));
    }
    return $hex; // 16 caracteres hex = 64 bits
}
// Distancia de Hamming entre dos huellas (cuántos bits distintos hay) —
// cuanto más baja, más parecidas son las dos imágenes. 0 = idénticas tras
// reducir a 9x8; en la práctica, 8 o menos sobre 64 bits ya es una señal
// muy fuerte de que es la misma captura (o una recorte/recompresión de
// ella), sin llegar a marcar como sospechosas dos fotos de reseñas
// distintas que por casualidad se parezcan un poco.
const RESENA_HASH_DISTANCIA_SOSPECHOSA = 8;
function _dpfDistanciaHamming($hex1, $hex2) {
    if (!is_string($hex1) || !is_string($hex2) || strlen($hex1) !== 16 || strlen($hex2) !== 16) return 64;
    $dist = 0;
    for ($i = 0; $i < 16; $i++) {
        $dist += substr_count(decbin(hexdec($hex1[$i]) ^ hexdec($hex2[$i])), '1');
    }
    return $dist;
}

// Guarda la captura de pantalla de la reseña que manda el cliente, para
// que la dueña la vea directamente en Alertas al aprobar en vez de tener
// que fiarse solo del nombre escrito a mano. Se manda como data URL
// (base64) en el mismo POST JSON, ya comprimida en el móvil (ver
// _resenaComprimirImagen en resena-cupon-cliente.js) — aquí se revalida
// que sea una imagen de verdad y se REGENERA con GD (decodificar y volver
// a codificar a JPEG) en vez de guardar los bytes tal cual: así, aunque el
// "data:image/..." del payload fuera en realidad un archivo disfrazado
// (polyglot), lo único que llega a quedar en disco son los píxeles reales
// decodificados por GD, nunca los bytes originales. Devuelve ['ruta' =>
// ruta relativa guardada, 'hash' => huella perceptual o null], o lanza una
// excepción con un mensaje apto para mostrar al cliente si la imagen no es
// válida.
const RESENA_CAPTURA_MAX_BYTES = 3 * 1024 * 1024; // 3MB decodificados — de sobra para una captura ya comprimida en el móvil
function guardarCapturaResena($dataUrl, $telefono) {
    if (!is_string($dataUrl) || $dataUrl === '') {
        throw new Exception('Sube una captura de pantalla de tu reseña');
    }
    if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/s', $dataUrl, $m)) {
        throw new Exception('El archivo no es una imagen válida');
    }
    // Límite sobre el texto base64 ANTES de decodificar — barato, evita
    // gastar memoria decodificando algo enorme mandado a propósito.
    if (strlen($m[2]) > (int)(RESENA_CAPTURA_MAX_BYTES * 4 / 3) + 100) {
        throw new Exception('La imagen es demasiado grande');
    }
    $bytes = base64_decode($m[2], true);
    if ($bytes === false || strlen($bytes) === 0 || strlen($bytes) > RESENA_CAPTURA_MAX_BYTES) {
        throw new Exception('La imagen no es válida o es demasiado grande');
    }
    $info = @getimagesizefromstring($bytes);
    if ($info === false || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        throw new Exception('El archivo no es una imagen válida');
    }

    $dirUploads = __DIR__ . '/uploads/resenas';
    if (!is_dir($dirUploads) && !@mkdir($dirUploads, 0755, true) && !is_dir($dirUploads)) {
        throw new Exception('No se pudo guardar la imagen. Inténtalo de nuevo.');
    }
    $nombreArchivo = $telefono . '-' . (int)(microtime(true) * 1000) . '.jpg';
    $rutaCompleta = $dirUploads . '/' . $nombreArchivo;

    // Si GD está disponible, se regenera la imagen (decodificar+recodificar)
    // en vez de escribir los bytes originales — capa extra de seguridad
    // ante un archivo disfrazado de imagen. Si GD no estuviera disponible
    // en el hosting, se guardan los bytes ya validados por
    // getimagesizefromstring() como último recurso, en vez de romper la
    // función entera. De paso, con la imagen ya decodificada en memoria,
    // se calcula también su huella perceptual (ver _dpfHashPerceptualImagen)
    // para poder detectar más adelante si esta misma captura ya se usó
    // antes en otra solicitud.
    $guardado = false;
    $hash = null;
    if (extension_loaded('gd')) {
        $im = @imagecreatefromstring($bytes);
        if ($im !== false) {
            $hash = _dpfHashPerceptualImagen($im);
            $guardado = @imagejpeg($im, $rutaCompleta, 82);
            imagedestroy($im);
        }
    }
    if (!$guardado) {
        $guardado = @file_put_contents($rutaCompleta, $bytes) !== false;
    }
    if (!$guardado) {
        throw new Exception('No se pudo guardar la imagen. Inténtalo de nuevo.');
    }
    return ['ruta' => 'uploads/resenas/' . $nombreArchivo, 'hash' => $hash];
}

// Genera el código de descuento del 10% ligado a este teléfono — mismo
// mecanismo que ya usan los premios de Ruleta/Rasca (crearCodigoPremio en
// juegos.php): discounts/<código> con 'telefono' puesto, así que
// guardar-pedido.php ya rechaza solo que lo use un teléfono distinto (ver
// discountCodeInvalido allí). 60 días de validez — más margen que un
// premio de juego porque conseguir este cupón cuesta bastante más
// esfuerzo real (dejar una reseña) que un giro de ruleta.
const RESENA_CODIGO_VALIDEZ_MS = 60 * 24 * 60 * 60 * 1000;
const RESENA_PCT = 10;
function crearCodigoResena($databaseURL, $accessToken, $telefono) {
    for ($intento = 0; $intento < 20; $intento++) {
        $codigo = 'RESENA-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 4));
        $leido = fbGetConEtag($databaseURL, 'discounts/' . $codigo, $accessToken);
        if ($leido['data'] !== null) continue; // colisión (muy improbable), probar otro
        $ahoraMs = (int)(microtime(true) * 1000);
        $cupon = [
            'pct'       => RESENA_PCT,
            'maxUses'   => 1,
            'uses'      => 0,
            'createdAt' => $ahoraMs,
            'expiraEn'  => $ahoraMs + RESENA_CODIGO_VALIDEZ_MS,
            'origen'    => 'resena',
            'telefono'  => $telefono,
        ];
        if (fbPutSiCoincide($databaseURL, 'discounts/' . $codigo, $accessToken, $cupon, $leido['etag'])) {
            return $codigo;
        }
    }
    return null;
}

// Valida deviceId+token contra config/trustedDevices/<deviceId> — mismo
// mecanismo que checkTrustedDevice en bimba-verify.php, copiado aquí
// porque cada endpoint de este proyecto lleva sus propias copias de estos
// helpers (ver el comentario de obtenerTokenAcceso). Sin esto, aprobar o
// descartar un cupón sería una escritura de admin que cualquiera podría
// disparar sin haber iniciado sesión nunca.
function esDispositivoDeConfianza($databaseURL, $accessToken, $deviceId, $token) {
    if ($deviceId === '' || $token === '' || strlen($deviceId) > 100 || strlen($token) > 200 || !preg_match('/^[a-zA-Z0-9_-]+$/', $deviceId)) {
        return false;
    }
    $leido = fbGetConEtag($databaseURL, 'config/trustedDevices/' . $deviceId, $accessToken);
    $registro = $leido['data'];
    $tokenHashReal = is_array($registro) && isset($registro['tokenHash']) ? (string)$registro['tokenHash'] : '';
    $expirado = is_array($registro) && isset($registro['expiresAt']) && is_numeric($registro['expiresAt']) && (float)$registro['expiresAt'] < (microtime(true) * 1000);
    return !$expirado && $tokenHashReal !== '' && hash_equals($tokenHashReal, hash('sha256', (string)$token));
}

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    $action = isset($payload['action']) ? (string)$payload['action'] : '';

    $phone = isset($payload['phone']) ? preg_replace('/[^0-9]/', '', (string)$payload['phone']) : '';
    if (!preg_match('/^\d{9}$/', $phone)) {
        echo json_encode(['success' => false, 'error' => 'Teléfono no válido']);
        exit;
    }
    $cuponPath = 'config/cuponesResena/' . $phone;

    $accessToken = obtenerTokenAcceso($rutaCredenciales);

    if ($action === 'consultarEstado' || $action === 'solicitar') {
        // Ya NO se exige verificar el teléfono por SMS (OTP) para esto — con
        // el aviso real por SMS al aprobar (enviarSmsAvisoCuponAprobado más
        // arriba), pedir un código de un solo uso aquí solo para "demostrar"
        // el número antes de eso era un SMS de más sin necesidad real: la
        // dueña ya comprueba a mano que la reseña existe de verdad en Google
        // antes de aprobar nada, y el cupón generado solo lo puede canjear
        // ESE teléfono (discountCodeInvalido en guardar-pedido.php) — así que
        // poner el número de otra persona por error/broma no deja a nadie
        // usar el cupón, como mucho le llega un SMS de aviso a un número que
        // no es el suyo si la solicitud llegase a aprobarse por error.
        $leido = fbGetConEtag($databaseURL, $cuponPath, $accessToken);
        $registro = is_array($leido['data']) ? $leido['data'] : null;
        $estadoActual = $registro['estado'] ?? 'ninguno';

        if ($action === 'consultarEstado') {
            echo json_encode([
                'success' => true,
                'estado'  => in_array($estadoActual, ['pendiente', 'aprobado'], true) ? $estadoActual : 'ninguno',
                'codigo'  => $estadoActual === 'aprobado' ? ($registro['codigo'] ?? null) : null,
            ]);
            exit;
        }

        // action === 'solicitar'
        // Si ya hay una solicitud viva (pendiente o ya aprobada), no se crea
        // otra — se devuelve el estado real tal cual, para que el cliente
        // recupere lo que ya tenía en vez de generar avisos duplicados.
        if ($estadoActual === 'pendiente' || $estadoActual === 'aprobado') {
            echo json_encode([
                'success' => true,
                'estado'  => $estadoActual,
                'codigo'  => $estadoActual === 'aprobado' ? ($registro['codigo'] ?? null) : null,
            ]);
            exit;
        }

        $nombreGoogle = isset($payload['nombreGoogle']) && is_string($payload['nombreGoogle']) ? trim(mb_substr($payload['nombreGoogle'], 0, 60)) : '';
        if ($nombreGoogle === '') {
            echo json_encode(['success' => false, 'error' => 'Escribe el nombre con el que dejaste la reseña']);
            exit;
        }
        $comentario = isset($payload['comentario']) && is_string($payload['comentario']) ? trim(mb_substr($payload['comentario'], 0, 300)) : '';

        // Canal preferido para el aviso — el teléfono SIEMPRE hace falta (es
        // lo que protege el código, ver discountCodeInvalido en
        // guardar-pedido.php), esto solo dice por dónde prefiere que le
        // escriban al aprobar: WhatsApp (mismo número) o Instagram (un
        // usuario aparte, obligatorio en ese caso).
        $contactoMetodo = (isset($payload['contactoMetodo']) && $payload['contactoMetodo'] === 'instagram') ? 'instagram' : 'whatsapp';
        $instagramUsuario = isset($payload['instagramUsuario']) && is_string($payload['instagramUsuario']) ? trim(mb_substr($payload['instagramUsuario'], 0, 40)) : '';
        if ($contactoMetodo === 'instagram' && $instagramUsuario === '') {
            echo json_encode(['success' => false, 'error' => 'Escribe tu usuario de Instagram para poder avisarte ahí']);
            exit;
        }

        // Captura de pantalla obligatoria — sin ella no hay nada que
        // enseñarle a la dueña para confirmar la reseña a simple vista, así
        // que se rechaza la solicitud entera si falta o no es una imagen
        // válida (ver guardarCapturaResena más arriba).
        try {
            $capturaGuardada = guardarCapturaResena($payload['captura'] ?? null, $phone);
        } catch (Exception $eCaptura) {
            echo json_encode(['success' => false, 'error' => $eCaptura->getMessage()]);
            exit;
        }
        $capturaPath = $capturaGuardada['ruta'];
        $capturaHash = $capturaGuardada['hash'];

        // Detección de capturas reutilizadas: se compara la huella de esta
        // imagen contra las de TODAS las solicitudes anteriores (config/
        // cuponesResena/*) — si alguna de otro teléfono se parece mucho
        // (ver RESENA_HASH_DISTANCIA_SOSPECHOSA), no se bloquea la
        // solicitud (podría ser, p.ej., una pareja compartiendo teléfono),
        // pero se marca para que la dueña lo vea de un vistazo en Alertas y
        // decida ella con ese dato de más. Si algo falla leyendo el nodo, o
        // no se pudo calcular la huella de esta imagen (GD no disponible),
        // simplemente no hay aviso de duplicado — nunca bloquea la
        // solicitud del cliente.
        $capturaDuplicadaDe = null;
        if ($capturaHash) {
            $leidoTodos = fbGetConEtag($databaseURL, 'config/cuponesResena', $accessToken);
            $todosLosCupones = is_array($leidoTodos['data']) ? $leidoTodos['data'] : [];
            foreach ($todosLosCupones as $telOtro => $registroOtro) {
                if ($telOtro === $phone || !is_array($registroOtro) || empty($registroOtro['capturaHash'])) continue;
                if (_dpfDistanciaHamming($capturaHash, $registroOtro['capturaHash']) <= RESENA_HASH_DISTANCIA_SOSPECHOSA) {
                    $capturaDuplicadaDe = $telOtro;
                    break;
                }
            }
        }

        // Tope de solicitudes nuevas por teléfono y día — independiente del
        // límite de IP de arriba, para que no se pueda reintentar sin fin
        // con el mismo número y llenar Alertas de avisos repetidos.
        $solic_file = $tmp_dir . '/dpf_resena_solic_' . md5($phone) . '.json';
        if (!dpf_resena_check_limit($solic_file, $max_solicitudes_dia, 86400)) {
            echo json_encode(['success' => false, 'error' => 'Ya has solicitado el cupón varias veces hoy — espera a que lo revisemos.']);
            exit;
        }

        $ahoraMs = (int)(microtime(true) * 1000);
        $nuevoRegistro = [
            'estado'             => 'pendiente',
            'nombreGoogle'       => $nombreGoogle,
            'comentario'         => $comentario,
            'captura'            => $capturaPath,
            'capturaHash'        => $capturaHash,
            'capturaDuplicadaDe' => $capturaDuplicadaDe,
            'contactoMetodo'     => $contactoMetodo,
            'instagramUsuario'   => $instagramUsuario,
            'ts'                 => $ahoraMs,
        ];
        if (!fbPutSiCoincide($databaseURL, $cuponPath, $accessToken, $nuevoRegistro, $leido['etag'])) {
            echo json_encode(['success' => false, 'error' => 'No se pudo guardar la solicitud. Inténtalo de nuevo.']);
            exit;
        }

        $detalle = 'Dice haberla dejado como "' . $nombreGoogle . '"';
        if ($comentario !== '') $detalle .= ' — "' . $comentario . '"';
        fbAgregarActivityLog($databaseURL, $accessToken, '🎁 Cupón de reseña pendiente', [
            'tipo'               => 'cupon_resena_pendiente',
            'telefono'           => $phone,
            'nombreGoogle'       => $nombreGoogle,
            'comentario'         => $comentario,
            'captura'            => $capturaPath,
            'capturaDuplicadaDe' => $capturaDuplicadaDe,
            'contactoMetodo'     => $contactoMetodo,
            'instagramUsuario'   => $instagramUsuario,
        ]);

        echo json_encode(['success' => true, 'estado' => 'pendiente', 'codigo' => null]);
        exit;
    }

    if ($action === 'aprobar' || $action === 'descartar') {
        $deviceId = isset($payload['deviceId']) ? (string)$payload['deviceId'] : '';
        $token = isset($payload['token']) ? (string)$payload['token'] : '';
        if (!esDispositivoDeConfianza($databaseURL, $accessToken, $deviceId, $token)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Este dispositivo no está reconocido como de confianza. Inicia sesión de admin marcando "Dispositivo de confianza" e inténtalo de nuevo.']);
            exit;
        }

        $leido = fbGetConEtag($databaseURL, $cuponPath, $accessToken);
        $registro = is_array($leido['data']) ? $leido['data'] : null;
        if (!$registro) {
            echo json_encode(['success' => false, 'error' => 'No hay ninguna solicitud de este teléfono.']);
            exit;
        }

        if ($action === 'descartar') {
            $registro['estado'] = 'descartado';
            fbPutSiCoincide($databaseURL, $cuponPath, $accessToken, $registro, $leido['etag']);
            echo json_encode(['success' => true]);
            exit;
        }

        // action === 'aprobar' — idempotente: si ya estaba aprobado (doble
        // clic, o dos dispositivos aprobando casi a la vez), se devuelve el
        // mismo código ya generado en vez de crear uno segundo.
        if (($registro['estado'] ?? '') === 'aprobado' && !empty($registro['codigo'])) {
            echo json_encode(['success' => true, 'codigo' => $registro['codigo']]);
            exit;
        }

        $codigo = crearCodigoResena($databaseURL, $accessToken, $phone);
        if (!$codigo) {
            echo json_encode(['success' => false, 'error' => 'No se pudo generar el código de descuento. Inténtalo de nuevo.']);
            exit;
        }

        $registro['estado'] = 'aprobado';
        $registro['codigo'] = $codigo;
        if (!fbPutSiCoincide($databaseURL, $cuponPath, $accessToken, $registro, $leido['etag'])) {
            // El cupón discounts/<código> ya se creó y es válido igualmente
            // aunque este registro no se actualice — el cliente lo verá al
            // volver a "consultarEstado" en el próximo intento, cuando esta
            // escritura (o el reintento manual desde el panel) sí cuadre.
            enviarSmsAvisoCuponAprobado($phone, $codigo);
            echo json_encode(['success' => true, 'codigo' => $codigo]);
            exit;
        }

        // Best-effort: si Twilio falla o TWILIO_PHONE_NUMBER no está
        // configurado, no se rompe la aprobación — el cupón ya es válido
        // igual, el cliente lo verá si vuelve a comprobar el estado.
        enviarSmsAvisoCuponAprobado($phone, $codigo);
        echo json_encode(['success' => true, 'codigo' => $codigo]);
        exit;
    }

    if ($action === 'borrarHistorial') {
        // Borra PARA SIEMPRE una solicitud ya resuelta (aprobada o
        // descartada) — pensado para limpiar pruebas o solicitudes que ya
        // no hace falta conservar, desde "Ver cupones de reseña anteriores"
        // en el panel. A propósito NO deja borrar una 'pendiente': para esa
        // ya existe 'descartar' (revisable en el historial después), y
        // borrar aquí directamente una solicitud que el cliente todavía
        // está esperando sería fácil de pulsar sin querer. El cupón
        // discounts/<código> ya canjeado (o listo para canjear) NO se toca
        // — borrar el registro de la solicitud no debe invalidar un
        // descuento que ya se le dio al cliente.
        $deviceId = isset($payload['deviceId']) ? (string)$payload['deviceId'] : '';
        $token = isset($payload['token']) ? (string)$payload['token'] : '';
        if (!esDispositivoDeConfianza($databaseURL, $accessToken, $deviceId, $token)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Este dispositivo no está reconocido como de confianza. Inicia sesión de admin marcando "Dispositivo de confianza" e inténtalo de nuevo.']);
            exit;
        }
        $leido = fbGetConEtag($databaseURL, $cuponPath, $accessToken);
        $registro = is_array($leido['data']) ? $leido['data'] : null;
        if (!$registro) {
            echo json_encode(['success' => true]); // ya no existe — nada que borrar
            exit;
        }
        if (($registro['estado'] ?? '') === 'pendiente') {
            echo json_encode(['success' => false, 'error' => 'Esta solicitud sigue pendiente — descártala o apruébala primero.']);
            exit;
        }
        if (!fbPutSiCoincide($databaseURL, $cuponPath, $accessToken, null, $leido['etag'])) {
            echo json_encode(['success' => false, 'error' => 'No se pudo borrar. Inténtalo de nuevo.']);
            exit;
        }
        // Borrar también la imagen guardada en disco — best-effort, no
        // rompe la respuesta si falla (el registro ya está borrado, que es
        // lo importante).
        if (!empty($registro['captura']) && is_string($registro['captura'])) {
            $rutaCaptura = __DIR__ . '/' . ltrim($registro['captura'], '/');
            $rutaReal = @realpath($rutaCaptura);
            $dirUploadsReal = @realpath(__DIR__ . '/uploads/resenas');
            if ($rutaReal && $dirUploadsReal && strpos($rutaReal, $dirUploadsReal) === 0) {
                @unlink($rutaReal);
            }
        }
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
} catch (Exception $e) {
    error_log('[resena-cupon] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
}
