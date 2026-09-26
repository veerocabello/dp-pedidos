#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  PRUEBA DE CARGA — solo "ping" (sin efectos secundarios)
#  Dulce Patata Food
#
#  Qué hace: lanza muchas peticiones en paralelo contra la acción
#  "ping" de guardar-pedido.php. NO crea pedidos reales, NO toca
#  Firebase, NO imprime nada — sirve para medir si el servidor
#  aguanta ráfagas de tráfico y cuánto tarda en responder.
#
#  Cómo usarlo:
#    1. Guarda este archivo en tu Mac (o pégalo en el Terminal).
#    2. chmod +x test-carga-ping.sh
#    3. ./test-carga-ping.sh
#
#  Puedes cambiar estos dos números para probar más o menos fuerte:
# ═══════════════════════════════════════════════════════════

URL="https://pedidos.dulcepatatafood.es/guardar-pedido.php"
TOTAL=100        # cuántas peticiones en total
CONCURRENCIA=20  # cuántas a la vez (simula gente pidiendo en el mismo minuto)

# NOTA: "ping" tiene su propio límite de 120 peticiones cada 10 minutos POR IP
# (para no dejar sin cupo a clientes reales que compartan el wifi del local).
# Como este script lanza todo desde tu misma conexión, si subes TOTAL por
# encima de 120 vas a empezar a ver "código=429" — es el límite funcionando
# bien, no un fallo real. Para simular más de 120 "clientes" a la vez habría
# que lanzarlo desde varias IPs distintas (fuera del alcance de este script).

echo "Lanzando $TOTAL peticiones (máx. $CONCURRENCIA a la vez) contra:"
echo "$URL"
echo ""

hacer_ping() {
  local inicio=$(date +%s%N)
  local resultado=$(curl -s -o /dev/null -w "%{http_code}" -m 15 \
    -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d '{"action":"ping"}')
  local fin=$(date +%s%N)
  local ms=$(( (fin - inicio) / 1000000 ))
  echo "  código=$resultado  tiempo=${ms}ms"
}
export -f hacer_ping
export URL

seq 1 "$TOTAL" | xargs -P "$CONCURRENCIA" -I {} bash -c hacer_ping

echo ""
echo "Listo. Si ves algún 'código=000' es que esa petición no llegó a"
echo "responder a tiempo (falló de verdad) — código 200 es normal."
