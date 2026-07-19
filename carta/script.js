/* ==========================================================================
   Dulce Patata Food — Carta digital
   Datos de la carta + renderizado + descarga en PDF
   ========================================================================== */

/* ---------- Datos ---------- */

const PATATAS = [
  { n: 1, name: 'Simple', price: '3,00€', desc: 'Aceite de oliva o mantequilla, sal y pimienta' },
  { n: 2, name: 'Vegetal', price: '5,60€', desc: 'Aceite de oliva, maíz, aceitunas, zanahoria, remolacha, champiñón, tomate natural' },
  { n: 3, name: 'Picante', price: '5,60€', desc: 'Salsa brava, carne picada, remolacha, zanahoria, maíz, aceitunas' },
  { n: 4, name: 'Carbonara', price: '5,80€', desc: 'Nata, cebolla cocinada, bacon y mozzarella', nota: '(Salsa cocinada a diario, no se pueden quitar ingredientes)' },
  { n: 5, name: 'Boloñesa', price: '5,80€', desc: 'Tomate frito, carne picada, cebolla cocinada y mozzarella', nota: '(Salsa cocinada a diario, no se pueden quitar ingredientes)' },
  { n: 6, name: 'Hawaiana', price: '5,80€', desc: 'Mayonesa, york, aceitunas, maíz, piña y mozzarella' },
  { n: 7, name: 'Kebab', price: '5,90€', desc: 'Salsa de yogur, kebab de pollo, maíz, aceitunas y cebolla' },
  { n: 8, name: '4 Quesos', price: '5,90€', desc: 'Salsa roquefort, emmental, gouda y mozzarella' },
  { n: 9, name: 'Completa', price: '6,20€', desc: 'Alioli, york, atún, maíz, aceitunas, zanahoria, remolacha, champiñón' },
  { n: 10, name: 'Carnívora', price: '6,40€', desc: 'Alioli, york, bacon, kebab y carne picada' },
  { n: 11, name: 'Philadelphia', price: '6,40€', desc: 'Salsa philadelphia, york, huevo, pollo y mozzarella' },
  { n: 12, name: 'Ranchera', price: '6,50€', desc: 'Salsa ranchera, pollo, bacon y mozzarella' },
  { n: 13, name: 'Granollers', price: '6,50€', desc: 'Salsa rosa, atún, gambas, tronquitos, maíz, aceitunas, zanahoria' },
  { n: 14, name: 'Pulled Pork', price: '6,50€', desc: 'Salsa barbacoa, cebolla, carne pulled pork y mozzarella' },
  { n: 15, name: 'Cheddar Bacon', price: '8,50€', desc: 'Salsa queso cheddar, carne picada o kebab, caramelo bacon y mozzarella gratinada', nuevo: true },
  { n: 16, name: 'Al Gusto', price: '6,90€', desc: '1 salsa a elegir y 6 ingredientes' },
  { n: 17, name: 'Bomba', price: '8,40€', desc: '9 ingredientes y/o salsas al gusto ¡sin límite!' },
];

const INGREDIENTES_PREMIUM = ['Jamón York', 'Carne picada', 'Pollo', 'Carne kebab', 'Atún', 'Gambas', 'Tronquitos de mar', 'Huevo', 'Bacon', 'Mozzarella', '4 quesos'];
const INGREDIENTES_BASE = ['Tomate natural', 'Maíz', 'Aceitunas', 'Zanahoria', 'Remolacha', 'Piña', 'Cebolla', 'Champiñón'];
const SALSAS = ['Ranchera', 'Brava', 'BBQ', 'Ketchup', 'Mayonesa', 'Alioli', 'Salsa rosa', 'Salsa de yogur', 'Tomate frito', 'Philadelphia', 'Roquefort'];

const TARRINAS = [
  { name: 'Tarrina Lotus', desc: 'Salsa Lotus + bacon + mozzarella + galletas Lotus' },
  { name: 'Tarrina Bacon', desc: 'Salsa a elegir + bacon + mozzarella' },
  { name: 'Tarrina G.O.A.T.', desc: 'Salsa miel mostaza + cebolla crujiente + queso de cabra' },
  { name: 'Tarrina Pistacho', desc: 'Crema de pistacho + mozzarella + pistacho crujiente' },
  { name: 'Tarrina Pulled Pork', desc: 'Salsa cheddar + salsa yogur + pulled pork BBQ + cebolla crujiente + caramelo de bacon', nuevo: true },
];

const PANINIS = ['Jamón York y Queso', 'Carbonara', 'Barbacoa', 'Kebab', '4 Quesos'];
const COOKIES = ['Pistacho', 'Lotus', 'Oreo', 'Kit Kat', 'Nutella', 'Kinder', 'Huesitos blanco'];
const TARTAS_CLASICAS = ["Queso tradicional 'La Viña'", 'Tres chocolates', 'La abuela', 'El abuelo'];
const TARTAS_ESPECIALES = ['Queso Lotus', 'Queso Pistacho', 'Queso Dinosaurio', 'Queso Kinder', 'Filipinos blancos', 'Cereales rellenos de leche', 'Donuts'];

const BEBIDAS = [
  { name: 'Refrescos 2 litros', price: '2,50€' },
  { name: 'Nestea y Aquarius 1,5 l', price: '2,20€' },
  { name: 'Agua 1,5 litros', price: '1,30€' },
  { name: 'Agua pequeña', price: '0,80€' },
  { name: 'Cerveza 1 litro', price: '1,80€' },
  { name: 'Refresco 500 ml', price: '1,80€' },
  { name: 'Refresco lata', price: '1,10€' },
  { name: 'Cerveza lata', price: '1,20€' },
  { name: 'Monster o Red Bull', price: '1,80€' },
];

/* ---------- Helpers de render ---------- */

function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderPatatas() {
  return PATATAS.map((p) => {
    const notaText = p.nota ? p.nota.replace(/^\(|\)$/g, '') : '';
    return `
    <div class="menu-item__row">
      <div class="menu-item__main">
        <span class="menu-item__num">${String(p.n).padStart(2, '0')}</span>
        <span class="menu-item__name">${esc(p.name)}${p.nota ? '<sup class="menu-item__asterisk">*</sup>' : ''}</span>
        ${p.nuevo ? '<span class="badge-new">Nuevo</span>' : ''}
        <span class="menu-item__desc-inline">(${esc(p.desc).replace(/ o /, ' <u>o</u> ')})</span>
      </div>
      <span class="menu-item__price">${p.price}</span>
    </div>
    ${p.nota ? `<div class="menu-item__footnote">* ${esc(notaText)}</div>` : ''}
  `;
  }).join('');
}

function renderBebidas() {
  return BEBIDAS.map((b) => `
    <div class="drink-row">
      <span class="drink-row__name">${esc(b.name)}</span>
      <span class="drink-row__dots"></span>
      <span class="drink-row__price">${b.price}</span>
    </div>
  `).join('');
}

function renderTarrinas() {
  return TARRINAS.map((t) => `
    <div>
      <div class="tarrina-item__row">
        <span class="tarrina-item__name">${esc(t.name)}</span>
        ${t.nuevo ? '<span class="badge-new badge-new--sm">Nuevo</span>' : ''}
      </div>
      <div class="tarrina-item__desc">${esc(t.desc)}</div>
    </div>
  `).join('');
}

function renderTartaList(items) {
  return items.map((t) => `<div class="tarta-list__item">· ${esc(t)}</div>`).join('');
}

function renderCarta() {
  document.getElementById('lista-patatas').innerHTML = renderPatatas();
  document.getElementById('lista-bebidas').innerHTML = renderBebidas();
  document.getElementById('lista-tarrinas').innerHTML = renderTarrinas();
  document.getElementById('lista-paninis').textContent = PANINIS.join('   ·   ');
  document.getElementById('lista-cookies').textContent = COOKIES.join('   ·   ');
  document.getElementById('lista-tartas-clasicas').innerHTML = renderTartaList(TARTAS_CLASICAS);
  document.getElementById('lista-tartas-especiales').innerHTML = renderTartaList(TARTAS_ESPECIALES);
  document.getElementById('ingredientes-premium').textContent = INGREDIENTES_PREMIUM.join(' · ');
  document.getElementById('ingredientes-base').textContent = INGREDIENTES_BASE.join(' · ');
  document.getElementById('lista-salsas').textContent = SALSAS.join(' · ');
}

/* ---------- Descarga en PDF ---------- */

async function downloadCarta(ev) {
  const btn = ev.currentTarget;
  const label = btn.querySelector('.lbl');
  if (btn.dataset.busy === '1') return;
  btn.dataset.busy = '1';

  const restore = () => {
    btn.dataset.busy = '';
    if (label) label.textContent = 'Descargar carta';
  };

  try {
    if (!window.html2canvas || !window.jspdf) throw new Error('Faltan las librerías de exportación a PDF');
    if (label) label.textContent = 'Generando…';

    const sheets = document.querySelectorAll('.sheet');
    const JsPDF = window.jspdf.jsPDF;
    const pdf = new JsPDF({ unit: 'px', format: [794, 1123], orientation: 'portrait', compress: true });

    for (let i = 0; i < sheets.length; i++) {
      const canvas = await window.html2canvas(sheets[i], {
        scale: 3,
        backgroundColor: '#F5EAD3',
        useCORS: true,
        logging: false,
      });
      const img = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) pdf.addPage([794, 1123], 'portrait');
      pdf.addImage(img, 'JPEG', 0, 0, 794, 1123);
    }

    pdf.save('Carta Dulce Patata Food.pdf');
    restore();
  } catch (e) {
    console.warn('No se pudo generar el PDF, se abre el diálogo de impresión:', e);
    restore();
    window.print();
  }
}

/* ---------- Inicio ---------- */

document.addEventListener('DOMContentLoaded', () => {
  renderCarta();
  document.getElementById('btn-descargar').addEventListener('click', downloadCarta);
});
