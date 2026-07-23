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
    <span class="notice-box__text">Al compartir zona de fritura y elaboración existe posibilidad de contaminación cruzada por trazas. Ante cualquier alergia o intolerancia, informa a nuestro personal antes de realizar tu pedido. Información según Reglamento (UE) nº 1169/2011.</span>
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

  return head + sections + renderLegend() + FOOTER;
}

/* ---------- Vista fichas ---------- */

function renderCards() {
  const sections = ALLERGEN_SECTIONS.map((sec) => {
    const cards = sec.items.map(([name, nums, note]) => {
      const clean = nums.length === 0;
      const chips = clean
        ? '<span class="chip-clean">Sin alérgenos declarados</span>'
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
          ${sec.sub ? `<span class="allergen-section__sub" style="color:var(--red)">${esc(sec.sub)}</span>` : ''}
        </div>
        <div class="card-grid">${cards}</div>
      </div>
    `;
  }).join('');

  return sections + FOOTER;
}

/* ---------- Descarga en PDF (impresión del navegador) ---------- */

function downloadPdf() {
  window.print();
}

/* ---------- Inicio ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('al-content');
  const view = document.body.dataset.view;
  root.innerHTML = view === 'fichas' ? renderCards() : renderMatrix();

  const btn = document.getElementById('btn-descargar');
  if (btn) btn.addEventListener('click', downloadPdf);
});
