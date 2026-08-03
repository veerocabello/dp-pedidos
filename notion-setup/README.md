# Notion para Dulce Patata Food — Marketing y Redes

Guía para montar en Notion un sistema de gestión de contenido y promociones para Instagram, TikTok y Facebook. Empieza por aquí porque es el área que más te costaba organizar; luego podemos ampliar a pedidos/inventario, empleados o finanzas siguiendo el mismo patrón.

## 1. Crea el espacio de trabajo

1. En Notion, crea una página nueva llamada **"Dulce Patata Food"**.
2. Dentro, crea tres subpáginas vacías: **Calendario de Contenido**, **Banco de Ideas** y **Promociones**.

## 2. Importa las bases de datos (2 minutos cada una)

En cada subpágina:

1. Escribe `/importar` (o `/import`) y elige **CSV**.
2. Sube el archivo correspondiente de esta carpeta:
   - `calendario-contenido.csv` → página **Calendario de Contenido**
   - `banco-ideas.csv` → página **Banco de Ideas**
   - `promociones.csv` → página **Promociones**
3. Notion crea automáticamente una base de datos tipo tabla con esas columnas y filas de ejemplo.

## 3. Ajusta los tipos de columna

Al importar, Notion pone todas las columnas como texto. Cámbialas así (clic en el nombre de la columna → **Editar propiedad**):

**Calendario de Contenido**
- `Fecha` → tipo **Fecha**
- `Red social` → tipo **Selección** (opciones: Instagram, TikTok, Facebook)
- `Tipo de contenido` → **Selección** (Reel, Story, Carrusel, Post, Video corto)
- `Estado` → **Selección** con colores (Idea = gris, Guion = amarillo, Grabado = azul, Editado = morado, Publicado = verde)
- `Responsable` → **Persona** (si trabajas con más gente)
- `Resultado` → **Número** (alcance, likes o pedidos generados — el KPI que quieras medir)

**Banco de Ideas**
- `Categoría` → **Selección** (Producto, Detrás de cámaras, Promoción, Testimonio, Tendencia, Colaboración)
- `Prioridad` → **Selección** (Alta, Media, Baja) con colores rojo/amarillo/verde

**Promociones**
- `Fecha inicio` / `Fecha fin` → tipo **Fecha**
- `Canal` → **Multi-selección**

## 4. Crea vistas útiles

En **Calendario de Contenido**, añade dos vistas más (botón **+** junto a "Tabla"):
- **Vista Calendario**: agrupa por `Fecha`, así ves de un vistazo qué publicas cada día.
- **Vista Tablero (Kanban)**: agrupa por `Estado`, para mover cada publicación de "Idea" → "Publicado" como un tablero de tareas.

## 5. Conecta las páginas entre sí

En la página principal "Dulce Patata Food", enlaza las tres subpáginas y añade un pequeño resumen arriba (por ejemplo, cuántas publicaciones tienes en estado "Idea" esta semana) usando un bloque de tipo **Vista enlazada de base de datos** filtrada por `Estado = Idea`.

## 6. Rutina semanal sugerida

- **Lunes**: revisa Banco de Ideas y pasa 3-4 ideas al Calendario de Contenido de la semana.
- **Miércoles**: graba/edita el contenido de la semana (marca como "Grabado"/"Editado").
- **Publicación**: al publicar, marca "Publicado" y añade el enlace y resultado a los pocos días.
- **Fin de mes**: revisa la columna `Resultado` para ver qué tipo de contenido funcionó mejor y decide qué repetir.

## Siguientes áreas (cuando quieras seguir ampliando)

- **Pedidos e inventario**: base de datos de ingredientes con stock mínimo y proveedor.
- **Empleados y turnos**: calendario de turnos + checklist de tareas de apertura/cierre.
- **Finanzas**: tabla de gastos mensuales con relación a categorías (ingredientes, delivery, marketing).

Dímelo y preparo los CSV y la guía de la siguiente área con el mismo formato.
