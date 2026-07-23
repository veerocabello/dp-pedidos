/* ==========================================================================
   Dulce Patata Food — Carta de alérgenos
   Datos: los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011)
   y el listado de productos con los alérgenos que contiene cada uno.

   Los productos y precios están sincronizados con carta/script.js (la carta
   digital). Los alérgenos asignados a cada producto deben revisarse siempre
   que cambie una receta o un proveedor.
   ========================================================================== */

const ALLERGENS = [
  { num: 1, name: 'Gluten', short: 'GLUTEN', color: '#C9832E',
    icon: '<path d="M12 3v15"/><path d="M12 6.4 9.6 5M12 6.4l2.4-1.4M12 9.8 9.6 8.4M12 9.8l2.4-1.4M12 13.2 9.6 11.8M12 13.2l2.4-1.4"/><path d="M9 21l3-3 3 3"/>' },
  { num: 2, name: 'Lácteos', short: 'LÁCTEOS', color: '#6B4A2E',
    icon: '<path d="M9.3 3h5.4l1 3.2V20a1 1 0 0 1-1 1H9.3a1 1 0 0 1-1-1V6.2l1-3.2z"/><path d="M8.3 9.5h7.4"/>' },
  { num: 3, name: 'Huevos', short: 'HUEVOS', color: '#E08A2B',
    icon: '<path d="M12 4c3 3.6 5 7.6 5 10.5a5 5 0 0 1-10 0C7 11.6 9 7.6 12 4z"/>' },
  { num: 4, name: 'Moluscos', short: 'MOLUSCOS', color: '#4FA8C9',
    icon: '<path d="M4 16.5c2.3-8 5-11 8-11s5.7 3 8 11"/><path d="M4 16.5h16"/><path d="M8 16.5c0-5.2 1.4-8.3 4-9.3M16 16.5c0-5.2-1.4-8.3-4-9.3"/>' },
  { num: 5, name: 'Crustáceos', short: 'CRUSTÁCEOS', color: '#E0642B',
    icon: '<path d="M5 8.3C6 5.3 8.7 3.4 11.6 4c3.6.8 5.4 4.6 3.6 8.3-1 2-3 3.4-5.3 3.4"/><path d="M6.2 6.8 4.3 5.7M6.6 9 4.6 9.6"/>' },
  { num: 6, name: 'Pescado', short: 'PESCADO', color: '#2C4A7C',
    icon: '<path d="M3 12.5c3-4 8-6 12-4 2 1 4 2 6 3.8-2 2-4 3-6 4-4 2-9 0-12-3.8z"/><circle cx="8" cy="11.3" r=".7" fill="#fff"/><path d="M15.4 8.4l3-2.6M15.4 16.2l3 2.6"/>' },
  { num: 7, name: 'Mostaza', short: 'MOSTAZA', color: '#B68A1E',
    icon: '<rect x="8" y="9.2" width="8" height="9.8" rx="1.4"/><path d="M10 9.2V6.4a2 2 0 0 1 4 0v2.8"/><circle cx="10.5" cy="13.6" r=".7" fill="#fff"/><circle cx="13.5" cy="13.6" r=".7" fill="#fff"/><circle cx="12" cy="16" r=".7" fill="#fff"/>' },
  { num: 8, name: 'Soja', short: 'SOJA', color: '#4C8C4A',
    icon: '<path d="M7.2 6c-2 3-2 8.7 0 11.7 1.9 1.9 5.7 1.9 7.6 0 2.9-3.9 2.9-8.7 0-12.6"/><circle cx="10" cy="9.2" r="1.3"/><circle cx="12.5" cy="13" r="1.3"/><circle cx="10.6" cy="16.6" r="1.3"/>' },
  { num: 9, name: 'Frutos de cáscara', short: 'F. CÁSCARA', color: '#A63B2C',
    icon: '<circle cx="12" cy="12" r="7"/><path d="M12 5.4v13.2M8.2 8c1.4 1 1.9 2.5 1.9 4s-.5 3-1.9 4M15.8 8c-1.4 1-1.9 2.5-1.9 4s.5 3 1.9 4"/>' },
  { num: 10, name: 'Cacahuetes', short: 'CACAHUETES', color: '#C99A5B',
    icon: '<ellipse cx="12" cy="8.1" rx="3.2" ry="3.7"/><ellipse cx="12" cy="15.9" rx="3.2" ry="3.7"/><path d="M12 11v2"/>' },
  { num: 11, name: 'Sésamo', short: 'SÉSAMO', color: '#D4B23C',
    icon: '<ellipse cx="8" cy="9.3" rx="1.5" ry="2.4" transform="rotate(-20 8 9.3)"/><ellipse cx="13.3" cy="6.8" rx="1.5" ry="2.4" transform="rotate(15 13.3 6.8)"/><ellipse cx="16.2" cy="12.2" rx="1.5" ry="2.4" transform="rotate(65 16.2 12.2)"/><ellipse cx="9.8" cy="15.6" rx="1.5" ry="2.4" transform="rotate(-40 9.8 15.6)"/><ellipse cx="14.8" cy="17.3" rx="1.5" ry="2.4" transform="rotate(25 14.8 17.3)"/>' },
  { num: 12, name: 'Altramuces', short: 'ALTRAMUCES', color: '#8B7CA6',
    icon: '<ellipse cx="12" cy="12" rx="6.4" ry="5"/><path d="M5.8 12h12.4"/>' },
  { num: 13, name: 'Sulfitos', short: 'SULFITOS', color: '#7A4C8C',
    icon: '<path d="M8 4h8l-1.1 6.2a3 3 0 0 1-5.8 0L8 4z"/><path d="M12 13.2V19M9 19h6"/>' },
  { num: 14, name: 'Apio', short: 'APIO', color: '#5C8C4A',
    icon: '<path d="M9 20.5V10c0-3 1-5 1-8M12 20.5V9c0-3 1-5 2-8M15 20.5V11c0-3 1-5 0-8"/><path d="M8 8.2c1-1 2-1 3 0M11 7.2c1-1 2-1 3 0M14 8.2c1-1 1-1 2 0"/>' },
];

const ALLERGEN_BY_NUM = {};
ALLERGENS.forEach((a) => { ALLERGEN_BY_NUM[a.num] = a; });

/* items: [nombre, [nºs de alérgeno], nota opcional] */
const ALLERGEN_SECTIONS = [
  {
    title: 'Patatas Asadas', sub: 'recién asadas a partir de las 19:30h', hideSubCards: true, icon: '🥔',
    items: [
      ['Simple', []],
      ['Vegetal', []],
      ['Picante', []],
      ['Carbonara', [2]],
      ['Boloñesa', [2]],
      ['Hawaiana', [2, 3]],
      ['Kebab', [2]],
      ['4 Quesos', [2]],
      ['Completa', [3, 6]],
      ['Carnívora', [3]],
      ['Philadelphia', [2, 3]],
      ['Ranchera', [2]],
      ['Granollers', [3, 5, 6]],
      ['Pulled Pork', [2]],
      ['Cheddar Bacon', [2]],
      ['Al Gusto', [], 'personalizada: los alérgenos dependen de lo que tú añadas'],
      ['Bomba', [], 'personalizada: los alérgenos dependen de lo que tú añadas'],
    ],
  },
  {
    title: 'Boniato Fries', sub: 'tarrinas', icon: '🍠',
    items: [
      ['Tarrina Lotus', [1, 2]],
      ['Tarrina Bacon', [2]],
      ['Tarrina G.O.A.T.', [2, 7]],
      ['Tarrina Pistacho', [2, 9]],
      ['Tarrina Pulled Pork', [2]],
    ],
  },
  {
    title: 'Paninis', sub: 'pan de leña', icon: '🍕',
    items: [
      ['Jamón York y Queso', [1, 2]],
      ['Carbonara', [1, 2]],
      ['Barbacoa', [1]],
      ['Kebab', [1]],
      ['4 Quesos', [1, 2]],
    ],
  },
  {
    title: 'Crumbl Cookies', sub: 'galletas estilo americano', icon: '🍪',
    items: [
      ['Pistacho', [1, 2, 3, 9]],
      ['Lotus', [1, 2, 3]],
      ['Oreo', [1, 2, 3]],
      ['Kit Kat', [1, 2, 3]],
      ['Nutella', [1, 2, 3, 9]],
      ['Kinder', [1, 2, 3]],
      ['Huesitos Blanco', [1, 2, 3]],
    ],
  },
  {
    title: 'Tartas Caseras', sub: 'elaboración propia', icon: '🍰',
    items: [
      ["Queso tradicional 'La Viña'", [1, 2, 3]],
      ['Tres chocolates', [1, 2, 3]],
      ['La Abuela', [1, 2, 3]],
      ['El Abuelo', [1, 2, 3]],
      ['Queso Lotus', [1, 2, 3]],
      ['Queso Pistacho', [1, 2, 3, 9]],
      ['Queso Dinosaurio', [1, 2, 3]],
      ['Queso Kinder', [1, 2, 3]],
      ['Filipinos Blancos', [1, 2, 3]],
      ['Cereales rellenos de leche', [1, 2, 3]],
      ['Donuts', [1, 2, 3]],
    ],
  },
];
