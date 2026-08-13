<?php
// ═══════════════════════════════════════════════════════════
//  RENDERIZADO DEL MENÚ EN EL PROPIO HTML (SEO)
//
//  Por qué existe: antes, la lista de productos (y sus datos
//  estructurados) solo aparecía después de que el navegador ejecutara
//  el JavaScript de la web — la mayoría de los buscadores actuales lo
//  ejecutan sin problema, pero no todos (algunos rastreadores de IA,
//  Bing en parte) esperan a que termine. Este archivo genera esa misma
//  información ya escrita en el HTML que sale del servidor, antes de
//  que se ejecute una sola línea de JavaScript.
//
//  Fuente de los datos: config/menu en Firebase (el menú real, con los
//  cambios hechos desde el panel — el mismo nodo que ya lee el
//  navegador, es de lectura pública). Se guarda ahí como un JSON
//  "dentro de otro JSON" (jstr() en config.js lo mete como string), por
//  eso hace falta json_decode() dos veces seguidas.
//
//  Si Firebase no responde (caída puntual, timeout) se usa la última
//  copia en caché (menu-cache.json, aquí al lado, nunca se sube al
//  repo) y si tampoco existe, se cae al menú "de fábrica"
//  (menu-default.json, generado por scripts/build.js a partir de
//  carta.js). Así una web estática nunca se puede quedar caída ni
//  lenta por culpa de este archivo — en el peor de los casos, sale con
//  el menú por defecto en vez del más actualizado.
// ═══════════════════════════════════════════════════════════

define('DPF_MENU_DATABASE_URL', 'https://dulce-patata-e96c2-default-rtdb.europe-west1.firebasedatabase.app');
define('DPF_MENU_CACHE_TTL', 300); // 5 minutos — no tiene sentido pedirle a Firebase el menú en cada visita

// Devuelve el array de productos actual (ver prioridad arriba). Nunca
// lanza una excepción: en el peor caso devuelve un array vacío.
function dpf_menu_actual() {
    $cacheFile = __DIR__ . '/menu-cache.json';

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < DPF_MENU_CACHE_TTL) {
        $cacheado = json_decode(file_get_contents($cacheFile), true);
        if (is_array($cacheado) && count($cacheado)) return $cacheado;
    }

    // cURL, no file_get_contents() — igual que el resto de llamadas a
    // Firebase de este proyecto (ver fbGetConEtag en guardar-pedido.php):
    // no todos los hostings compartidos tienen activado allow_url_fopen,
    // y esto ya está probado que funciona en el hosting real. Timeout
    // corto a propósito: si Firebase tarda, esta página no puede quedarse
    // esperando — mejor servir algo (caché vieja o el menú por defecto)
    // que dejar a un visitante mirando una pantalla en blanco.
    $respuesta = false;
    $ch = curl_init(DPF_MENU_DATABASE_URL . '/config/menu.json');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    $curlResult = curl_exec($ch);
    if ($curlResult !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200) $respuesta = $curlResult;
    curl_close($ch);
    if ($respuesta !== false) {
        // config/menu se guarda con jstr() (JSON.stringify) — el valor real
        // en Firebase es un STRING que contiene JSON, no un array directo.
        $valor = json_decode($respuesta, true);
        if (is_string($valor)) $valor = json_decode($valor, true);
        if (is_array($valor) && count($valor)) {
            @file_put_contents($cacheFile, json_encode($valor));
            return $valor;
        }
    }

    // Firebase no respondió o config/menu está vacío — caché vieja es
    // mejor que nada (refleja el menú real, aunque no sea del todo actual).
    if (file_exists($cacheFile)) {
        $cacheado = json_decode(file_get_contents($cacheFile), true);
        if (is_array($cacheado) && count($cacheado)) return $cacheado;
    }

    $defaultFile = __DIR__ . '/menu-default.json';
    if (file_exists($defaultFile)) {
        $default = json_decode(file_get_contents($defaultFile), true);
        if (is_array($default)) return $default;
    }
    return [];
}

// HTML estático que ve cualquier rastreador antes de que se ejecute
// JavaScript — en un navegador normal, renderMenu() (carta.js) lo
// sustituye por la versión interactiva a los pocos milisegundos de
// cargar, así que no hace falta que tenga botones de añadir al carrito
// ni nada interactivo, solo el contenido real: nombre, descripción y
// precio de cada producto, agrupado por categoría igual que en la carta
// de verdad.
function dpf_menu_html($menu) {
    $emojiMap = ['Patatas' => '🥔', 'Boniato' => '🍠', 'Paninis' => '🍕', 'Cookies' => '🍪', 'Tartas' => '🍰', 'Bebidas' => '🥤'];
    $porCategoria = [];
    foreach ($menu as $item) {
        if (!empty($item['hidden'])) continue;
        $cat = $item['cat'] ?? 'Otros';
        if (!isset($porCategoria[$cat])) $porCategoria[$cat] = [];
        $porCategoria[$cat][] = $item;
    }
    $html = '';
    foreach ($porCategoria as $cat => $items) {
        $emoji = $emojiMap[$cat] ?? '';
        $html .= '<div class="menu-cat-sep"><div class="menu-cat-left"><h3 class="menu-cat-name">' . htmlspecialchars($emoji ? $emoji . ' ' . mb_strtoupper($cat) : mb_strtoupper($cat)) . '</h3></div></div>';
        foreach ($items as $item) {
            $precio = number_format((float)($item['price'] ?? 0), 2, ',', '');
            $html .= '<div class="item-card">'
                . '<div class="item-info">'
                . '<div class="item-name">' . htmlspecialchars($item['name'] ?? '') . '</div>'
                . '<div class="item-desc">' . htmlspecialchars($item['desc'] ?? '') . '</div>'
                . '</div>'
                . '<div class="item-price">' . $precio . ' €</div>'
                . '</div>';
        }
    }
    return $html;
}

// Datos estructurados (schema.org Menu) — sustituye a la generación por
// JavaScript que había antes (_generarMenuJsonLd en carta.js): mismo
// formato, pero ya presente en el HTML que sirve el servidor.
function dpf_menu_jsonld($menu) {
    $porCategoria = [];
    foreach ($menu as $item) {
        if (!empty($item['hidden'])) continue;
        $cat = $item['cat'] ?? 'Otros';
        if (!isset($porCategoria[$cat])) $porCategoria[$cat] = [];
        $porCategoria[$cat][] = $item;
    }
    $hasMenuSection = [];
    foreach ($porCategoria as $cat => $items) {
        $hasMenuItem = [];
        foreach ($items as $item) {
            $menuItem = [
                '@type' => 'MenuItem',
                'name' => $item['name'] ?? '',
                'offers' => [
                    '@type' => 'Offer',
                    'price' => number_format((float)($item['price'] ?? 0), 2, '.', ''),
                    'priceCurrency' => 'EUR',
                ],
            ];
            if (!empty($item['desc'])) $menuItem['description'] = $item['desc'];
            $hasMenuItem[] = $menuItem;
        }
        $hasMenuSection[] = ['@type' => 'MenuSection', 'name' => $cat, 'hasMenuItem' => $hasMenuItem];
    }
    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'Menu',
        'name' => 'Carta Dulce Patata Food',
        'hasMenuSection' => $hasMenuSection,
    ];
    return '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_UNICODE) . '</script>';
}
