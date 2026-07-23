/* ==========================================================================
   Dulce Patata Food — Editor de la carta de alérgenos
   Herramienta de uso interno (sin backend): edita ALLERGEN_SECTIONS en el
   formulario y descarga un alergenos-data.js listo para subir a Hostinger.
   Reutiliza ALLERGENS, ALLERGEN_SECTIONS y renderMatrix() de los otros
   archivos (cargados antes que este).
   ========================================================================== */

function escAttr(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function editorRenderItem(item, ii) {
  const [name, nums, note] = item;
  const set = new Set(nums || []);
  const row = document.createElement('div');
  row.className = 'ed-item';
  row.dataset.item = ii;

  const checks = ALLERGENS.map((a) => `
    <label class="ed-allergen-check">
      <input type="checkbox" class="ed-item__allergen" value="${a.num}" ${set.has(a.num) ? 'checked' : ''}>
      ${a.name}
    </label>
  `).join('');

  row.innerHTML = `
    <div class="ed-item__row">
      <input class="ed-input ed-item__name" placeholder="Nombre del producto" value="${escAttr(name)}">
      <input class="ed-input ed-item__note" placeholder="Nota (opcional)" value="${escAttr(note || '')}">
      <button type="button" class="ed-btn ed-btn--danger ed-del-item">Eliminar</button>
    </div>
    <div class="ed-allergen-grid">${checks}</div>
  `;

  row.querySelector('.ed-del-item').addEventListener('click', () => row.remove());
  return row;
}

function editorRenderSection(sec, si) {
  const box = document.createElement('fieldset');
  box.className = 'ed-section';
  box.dataset.section = si;

  box.innerHTML = `
    <div class="ed-section__head">
      <input class="ed-input ed-section__title" placeholder="Nombre de la sección" value="${escAttr(sec.title || '')}">
      <input class="ed-input ed-section__sub" placeholder="Subtítulo (opcional)" value="${escAttr(sec.sub || '')}">
      <input class="ed-input ed-section__icon" placeholder="🥔" title="Emoji (sin uso visible por ahora)" value="${escAttr(sec.icon || '')}" maxlength="4">
      <button type="button" class="ed-btn ed-btn--danger ed-del-section">Eliminar sección</button>
    </div>
    <label class="ed-checkline">
      <input type="checkbox" class="ed-section__hideSubCards" ${sec.hideSubCards ? 'checked' : ''}>
      No repetir el subtítulo en la vista de fichas
    </label>
    <div class="ed-items"></div>
    <button type="button" class="ed-btn ed-add-item">+ Añadir producto</button>
  `;

  const itemsBox = box.querySelector('.ed-items');
  (sec.items || []).forEach((item, ii) => itemsBox.appendChild(editorRenderItem(item, ii)));

  box.querySelector('.ed-add-item').addEventListener('click', () => {
    itemsBox.appendChild(editorRenderItem(['', [], ''], itemsBox.children.length));
  });

  box.querySelector('.ed-del-section').addEventListener('click', () => {
    if (confirm('¿Eliminar esta sección entera y todos sus productos?')) box.remove();
  });

  return box;
}

function editorBuildForm() {
  const container = document.getElementById('editor-form');
  container.innerHTML = '';
  ALLERGEN_SECTIONS.forEach((sec, si) => container.appendChild(editorRenderSection(sec, si)));
}

function editorCollectData() {
  const sections = [];
  document.querySelectorAll('.ed-section').forEach((box) => {
    const title = box.querySelector('.ed-section__title').value.trim();
    const sub = box.querySelector('.ed-section__sub').value.trim();
    const icon = box.querySelector('.ed-section__icon').value.trim();
    const hideSubCards = box.querySelector('.ed-section__hideSubCards').checked;

    const items = [];
    box.querySelectorAll('.ed-item').forEach((row) => {
      const name = row.querySelector('.ed-item__name').value.trim();
      if (!name) return; // se ignoran productos sin nombre
      const note = row.querySelector('.ed-item__note').value.trim();
      const nums = [...row.querySelectorAll('.ed-item__allergen:checked')].map((cb) => Number(cb.value));
      items.push([name, nums, note]);
    });

    if (!title && items.length === 0) return; // sección vacía sin usar
    sections.push({ title, sub, icon, hideSubCards, items });
  });
  return sections;
}

function editorApplyToGlobalData() {
  ALLERGEN_SECTIONS.length = 0;
  ALLERGEN_SECTIONS.push(...editorCollectData());
}

function editorRefreshPreview() {
  editorApplyToGlobalData();
  document.getElementById('al-content').innerHTML = renderMatrix();
}

function editorDownloadData() {
  editorApplyToGlobalData();

  const fecha = new Date().toLocaleDateString('es-ES');
  const content = `/* ==========================================================================
   Dulce Patata Food — Carta de alérgenos
   Archivo generado con el editor (alergenos/editor.html) el ${fecha}.
   Sube este archivo a la carpeta alergenos en Hostinger, reemplazando el
   alergenos-data.js actual.
   ========================================================================== */

const ALLERGENS = ${JSON.stringify(ALLERGENS, null, 2)};

const ALLERGEN_BY_NUM = {};
ALLERGENS.forEach((a) => { ALLERGEN_BY_NUM[a.num] = a; });

const ALLERGEN_SECTIONS = ${JSON.stringify(ALLERGEN_SECTIONS, null, 2)};
`;

  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'alergenos-data.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  editorBuildForm();
  document.getElementById('btn-add-section').addEventListener('click', () => {
    const container = document.getElementById('editor-form');
    container.appendChild(editorRenderSection({ title: '', sub: '', icon: '', hideSubCards: false, items: [] }, container.children.length));
  });
  document.getElementById('btn-preview').addEventListener('click', editorRefreshPreview);
  document.getElementById('btn-download-data').addEventListener('click', editorDownloadData);
});
