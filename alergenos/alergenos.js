/* ==========================================================================
   Dulce Patata Food — Carta de alérgenos
   Renderizado (matriz o fichas) + descarga en PDF
   ========================================================================== */

function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function allergenIcon(a, sizeClass) {
  return `
    <span class="al-icon ${sizeClass || ''}" style="background:${a.color}">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${a.icon}</svg>
    </span>
  `;
}

function renderLegend() {
  const rows = ALLERGENS.map((a) => `
    <div class="legend-box__row">
      ${allergenIcon(a)}
      <span><b>${a.num}.</b> ${esc(a.name)}</span>
    </div>
  `).join('');
  return `
    <div class="legend-box">
      <div class="legend-box__note">
        <span class="matrix-dot" style="flex:none"></span>
        <span><b>Contiene el alérgeno.</b> Una casilla vacía indica que ese alérgeno no se añade de forma intencionada.</span>
      </div>
      <div class="legend-box__grid">${rows}</div>
    </div>
  `;
}

const FOOTER = `
  <div class="notice-box">
    <span class="notice-box__badge">¡ojo!</span>
    <span class="notice-box__text">Al compartir zona de elaboración existe posibilidad de contaminación cruzada por trazas. Ante cualquier alergia o intolerancia, informa a nuestro personal antes de realizar tu pedido. Información según Reglamento (UE) nº 1169/2011.</span>
  </div>
  <div class="al-footer">Carretera de Málaga 111 · 18015 Granada &nbsp;·&nbsp; 604 82 31 80 &nbsp;·&nbsp; @dulcepatata_food</div>
`;

/* ---------- Vista matriz ---------- */

function renderMatrix() {
  const head = `
    <div class="matrix-headrow">
      <div class="matrix-headrow__product">Producto</div>
      ${ALLERGENS.map((a) => `
        <div class="matrix-headrow__col">
          ${allergenIcon(a)}
          <div class="matrix-headrow__label">${esc(a.short)}</div>
        </div>
      `).join('')}
    </div>
  `;

  const sections = ALLERGEN_SECTIONS.map((sec) => {
    const rows = sec.items.map(([name, nums, note]) => {
      const set = new Set(nums);
      const cells = ALLERGENS.map((a) => `
        <div class="matrix-row__cell">${set.has(a.num) ? '<span class="matrix-dot"></span>' : ''}</div>
      `).join('');
      return `
        <div class="matrix-row">
          <div class="matrix-row__name">${esc(name)}${note ? `<span class="matrix-row__note"> ${esc(note)}</span>` : ''}</div>
          ${cells}
        </div>
      `;
    }).join('');
    return `
      <div class="allergen-section">
        <div class="allergen-section__head">
          <span class="allergen-section__title">${esc(sec.title)}</span>
          ${sec.sub ? `<span class="allergen-section__sub">${esc(sec.sub)}</span>` : ''}
        </div>
        ${rows}
      </div>
    `;
  }).join('');

  return `<div class="matrix-scroll"><div class="matrix-scroll__inner">${head}${sections}</div></div>` + renderLegend() + FOOTER;
}

/* ---------- Vista fichas ---------- */

function renderCards() {
  const sections = ALLERGEN_SECTIONS.map((sec) => {
    const cards = sec.items.map(([name, nums, note]) => {
      const clean = nums.length === 0 && !note;
      const chips = clean
        ? '<span class="chip-clean">Sin alérgenos declarados</span>'
        : nums.length === 0
          ? ''
          : nums.map((n) => {
              const a = ALLERGEN_BY_NUM[n];
              return `
                <span class="chip-allergen">
                  ${allergenIcon(a)}
                  <span class="chip-allergen__name">${esc(a.name)}</span>
                </span>
              `;
            }).join('');
      return `
        <div class="card-grid__item">
          <div class="card-grid__name">${esc(name)}${note ? `<span class="card-grid__note"> ${esc(note)}</span>` : ''}</div>
          <div class="card-grid__chips">${chips}</div>
        </div>
      `;
    }).join('');
    return `
      <div class="allergen-section">
        <div class="allergen-section__head" style="background:none;border-bottom:2px solid var(--gold);border-radius:0;padding:0 0 5px">
          <span class="allergen-section__title" style="font-size:17px">${esc(sec.title)}</span>
          ${sec.sub && !sec.hideSubCards ? `<span class="allergen-section__sub" style="color:var(--red)">${esc(sec.sub)}</span>` : ''}
        </div>
        <div class="card-grid">${cards}</div>
      </div>
    `;
  }).join('');

  return sections + FOOTER;
}

/* ---------- Descarga en PDF ----------
   Se captura cada bloque (cabecera, cada sección, leyenda, aviso) por
   separado con html2canvas y se colocan uno tras otro en el PDF, saltando
   de página cuando no cabe un bloque entero. Así nunca se corte una fila
   o una tarjeta a la mitad, a diferencia de una captura única recortada
   por altura de página. */

async function downloadPdf(ev) {
  const btn = ev.currentTarget;
  const label = btn.querySelector('.lbl');
  if (btn.dataset.busy === '1') return;
  btn.dataset.busy = '1';
  if (label) label.textContent = 'Generando…';

  const overlay = document.createElement('div');
  overlay.className = 'pdf-overlay';
  overlay.textContent = 'Generando PDF…';
  document.body.appendChild(overlay);

  const sheet = document.querySelector('.sheet');
  const prevWidth = sheet.style.width;
  const prevMaxWidth = sheet.style.maxWidth;
  let usedFallback = false;

  try {
    if (!window.html2canvas || !window.jspdf) throw new Error('Faltan las librerías de exportación a PDF');

    // Si la tabla estaba ampliada con el pellizco, se vuelve a su tamaño
    // normal: "zoom" afecta al layout, así que unas medidas ampliadas
    // descuadrarían el cálculo de bloques/páginas de más abajo.
    sheet.querySelectorAll('.matrix-scroll__inner').forEach((el) => { el.style.zoom = ''; });
    sheet.querySelectorAll('.matrix-scroll').forEach((el) => { el.scrollLeft = 0; el.style.overflowY = ''; });
    // Se fija el ancho de diseño para que el PDF salga siempre nítido y bien
    // proporcionado, aunque se genere desde un móvil donde la hoja se ve
    // encogida. pdf-export anula además las media-queries de layout móvil,
    // que dependen del ancho de la ventana y no del elemento.
    document.body.classList.add('pdf-export');
    sheet.style.width = '794px';
    sheet.style.maxWidth = 'none';
    await new Promise((r) => requestAnimationFrame(r));

    const sheetRect = sheet.getBoundingClientRect();
    const PAGE_W = Math.round(sheetRect.width);
    const PAGE_H = 1123;
    const MARGIN = 40;

    const blocks = [];
    const header = sheet.querySelector('.al-header');
    const goldBar = sheet.querySelector('.gold-bar');
    if (header) blocks.push({ el: header, bg: '#251309' });
    if (goldBar) blocks.push({ el: goldBar, bg: '#E3B23C' });

    const content = sheet.querySelector('#al-content');
    for (const child of content.children) {
      if (child.classList.contains('matrix-scroll')) {
        const inner = child.querySelector('.matrix-scroll__inner');
        for (const c of inner.children) blocks.push({ el: c, bg: '#F3E6CC' });
      } else {
        blocks.push({ el: child, bg: '#F3E6CC' });
      }
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'px', format: [PAGE_W, PAGE_H], orientation: 'portrait', compress: true });
    const paintPageBg = () => { pdf.setFillColor('#F3E6CC'); pdf.rect(0, 0, PAGE_W, PAGE_H, 'F'); };
    paintPageBg();

    let y = MARGIN;
    let started = false;
    for (const { el, bg } of blocks) {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 1 || h < 1) continue;
      const x = Math.round(rect.left - sheetRect.left);

      if (started && y + h > PAGE_H - MARGIN) {
        pdf.addPage([PAGE_W, PAGE_H], 'portrait');
        paintPageBg();
        y = MARGIN;
      }
      started = true;

      const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: bg, useCORS: true, logging: false });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, y, w, h);
      y += h;
    }

    const view = document.body.dataset.view === 'fichas' ? 'fichas' : 'matriz';
    pdf.save(`Carta de alergenos - ${view}.pdf`);
  } catch (e) {
    console.warn('No se pudo generar el PDF, se abre el diálogo de impresión:', e);
    usedFallback = true;
  } finally {
    document.body.classList.remove('pdf-export');
    sheet.style.width = prevWidth;
    sheet.style.maxWidth = prevMaxWidth;
    overlay.remove();
    if (label) label.textContent = 'Descargar PDF';
    btn.dataset.busy = '';
    if (usedFallback) window.print();
  }
}

/* ---------- Pellizcar para ampliar/reducir solo la tabla ----------
   Se usa la propiedad CSS "zoom" (no "transform: scale") porque zoom sí
   afecta al layout: el navegador recalcula el ancho/alto reales y el
   scroll se adapta solo. Con transform habría que reajustar el tamaño
   del contenedor a mano para poder desplazarse por el contenido ampliado. */

function setupPinchZoom() {
  const scroller = document.querySelector('.matrix-scroll');
  const inner = document.querySelector('.matrix-scroll__inner');
  if (!scroller || !inner) return;

  const MIN_SCALE = 1;
  const MAX_SCALE = 2.5;
  const pointers = new Map();
  let startDist = 0;
  let startScale = 1;
  let scale = 1;
  // Se marca en cuanto el gesto llega a tener 2 dedos, y solo se limpia
  // cuando se levanta el último. Así, al soltar los dos dedos de un
  // pellizco (dos pointerup casi seguidos) no se confunde el segundo con
  // un toque suelto, aunque en ese instante ya quede un solo puntero.
  let wasMultiTouch = false;
  let lastTap = 0;

  const dist = () => {
    const pts = [...pointers.values()];
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const applyScale = () => {
    inner.style.zoom = scale;
    scroller.style.overflowY = scale > 1.01 ? 'auto' : 'hidden';
  };

  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      wasMultiTouch = true;
      startDist = dist();
      startScale = scale;
    }
  });

  scroller.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && startDist > 0) {
      e.preventDefault();
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * (dist() / startDist)));
      applyScale();
    }
  }, { passive: false });

  scroller.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); if (pointers.size === 0) wasMultiTouch = false; });
  scroller.addEventListener('pointerleave', (e) => { pointers.delete(e.pointerId); if (pointers.size === 0) wasMultiTouch = false; });

  // Doble toque para volver al tamaño normal.
  scroller.addEventListener('pointerup', (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size > 0) return; // aún queda algún dedo del gesto en curso
    const isTap = e.pointerType === 'touch' && !wasMultiTouch;
    wasMultiTouch = false;
    if (!isTap) return;
    const now = Date.now();
    if (now - lastTap < 300 && scale > 1.01) {
      scale = 1;
      applyScale();
    }
    lastTap = now;
  });
}

/* ---------- Inicio ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('al-content');
  const view = document.body.dataset.view;
  root.innerHTML = view === 'fichas' ? renderCards() : renderMatrix();
  if (view !== 'fichas') setupPinchZoom();

  const btn = document.getElementById('btn-descargar');
  if (btn) btn.addEventListener('click', downloadPdf);
});
