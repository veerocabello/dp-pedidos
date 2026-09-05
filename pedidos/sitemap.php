<?php
// Sitemap dinámico — la versión estática (sitemap.xml) llevaba la misma
// fecha de "lastmod" clavada desde el 3 de agosto para siempre, sin
// actualizarse nunca sola. Esta versión pone la fecha de hoy en cada
// visita — el menú (precios, productos) cambia con cierta frecuencia
// desde el panel, así que es más honesto que una fecha fija y vieja.
header('Content-Type: application/xml; charset=UTF-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pedidos.dulcepatatafood.es/</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
