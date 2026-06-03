/**
 *  URBAN STYLE · lib/engine.js
 *  Lógica pura (sin red): categorías, tallas, reglas y vista del look.
 */

function mapCategory(category = '') {
  const c = String(category).toLowerCase();
  if (c.includes('inferior') || c.includes('lower') || c.includes('pant')) return 'lower_body';
  if (c.includes('vestido') || c.includes('dress')) return 'dresses';
  return 'upper_body';
}

const COLOR_LIBRARY = {
  luxury: ['Negro', 'Dorado', 'Crema', 'Azul petróleo'],
  formal: ['Azul marino', 'Gris', 'Blanco', 'Negro'],
  casual: ['Beige', 'Blanco', 'Azul claro', 'Verde oliva'],
  urbano: ['Negro', 'Gris', 'Cyan', 'Blanco roto'],
  noche: ['Negro', 'Dorado', 'Vino', 'Azul noche'],
  minimalista: ['Blanco', 'Negro', 'Beige', 'Gris piedra'],
};

function estimateSizes(profile = {}) {
  const chest = Number(profile.pecho) || 0;
  const waist = Number(profile.cintura) || 0;
  const complexion = profile.complexion || 'regular';
  const letterFromChest = (cm) => {
    if (!cm) return null;
    if (cm < 86) return 'XS'; if (cm < 94) return 'S'; if (cm < 102) return 'M';
    if (cm < 110) return 'L'; if (cm < 120) return 'XL'; return 'XXL';
  };
  const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  let top = letterFromChest(chest) || 'M';
  if (complexion === 'slim') top = order[Math.max(0, order.indexOf(top) - 1)];
  if (complexion === 'wide') top = order[Math.min(order.length - 1, order.indexOf(top) + 1)];
  const bottomNum = waist ? Math.round((waist / 2.54) * 0.95) : null;
  return {
    superior: top,
    inferior: bottomNum ? `${bottomNum} (US) / ${Math.round(waist)} cm` : top,
    calzado: profile.calzado ? `${profile.calzado} EU` : 'Sin dato',
  };
}

function ruleRecommend(profile = {}, catalog = []) {
  const style = (profile.estilo || 'urbano').toLowerCase();
  const occasion = profile.ocasion || 'el día a día';
  const palette = COLOR_LIBRARY[style] || COLOR_LIBRARY.urbano;
  const sizes = estimateSizes(profile);
  const accessories = catalog.filter((p) => /accesor/i.test(p.categoria)).slice(0, 3).map((p) => p.nombre);
  const colTxt = palette.slice(0, 3).join(', ').toLowerCase();
  const reasoning =
    `Vas de ${style}. Para ${occasion}, juega con ${colTxt}: combinan entre sí y son fáciles de llevar. ` +
    `Por tus medidas, arriba usas ${sizes.superior} y abajo ${sizes.inferior}. Suma un accesorio para rematar el look.`;
  return { source: 'rules', styleDetected: style, sizes, colors: palette,
    accessories: accessories.length ? accessories : ['Reloj', 'Cinturón', 'Gafas'], reasoning };
}

function ruleOutfits(profile = {}, catalog = [], occasionReq, styleReq) {
  const byCat = (re) => catalog.filter((p) => re.test(p.categoria));
  const tops = byCat(/superior/i), bottoms = byCat(/inferior/i), shoes = byCat(/calzado/i), accs = byCat(/accesor/i);
  const occasion = occasionReq || profile.ocasion || 'el día';
  const baseStyle = (styleReq || profile.estilo || 'urbano').toLowerCase();
  const TYPES = ['casual', 'urbano', 'luxury', 'formal', 'noche', 'minimalista'];
  const ordered = [baseStyle, ...TYPES.filter((t) => t !== baseStyle)];
  const matchStyle = (p, type) => (p.estilo || '').toLowerCase().includes(type) || (p.ocasion || '').toLowerCase().includes(type);
  const pick = (arr, type, i) => {
    if (!arr.length) return null;
    const matches = arr.filter((p) => matchStyle(p, type));
    const pool = matches.length ? matches : arr;
    return pool[i % pool.length];
  };
  const outfits = ordered.slice(0, 4).map((type, idx) => {
    const top = pick(tops, type, idx), bottom = pick(bottoms, type, idx), shoe = pick(shoes, type, idx), acc = pick(accs, type, idx);
    const items = [top, bottom, shoe, acc].filter(Boolean);
    const palette = COLOR_LIBRARY[type] || COLOR_LIBRARY.urbano;
    const partes = [];
    if (top) partes.push(top.nombre);
    if (bottom) partes.push(bottom.nombre);
    if (shoe) partes.push(shoe.nombre);
    const explicacion = `${partes.join(' + ')}.` + (acc ? ` Remata con ${acc.nombre}.` : '') + ` Look ${type}, listo para ${occasion}.`;
    return { id: `outfit-${type}-${idx}`, nombre: `${type.charAt(0).toUpperCase() + type.slice(1)}`, tipo: type,
      itemIds: items.map((p) => p.id), colores: palette.slice(0, 3), explicacion };
  });
  return { source: 'rules', occasion, style: baseStyle, outfits };
}

function escapeXml(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Dibuja el accesorio según su tipo, bien visible, sobre la figura.
function accessoryShape(acc, accC) {
  if (!acc) return '';
  const n = (acc.name || '').toLowerCase();
  if (/gafa|lente|sol|sunglass|glass/.test(n)) {
    return `<g stroke="${accC}" stroke-width="5" fill="#0b1419" fill-opacity="0.6">
      <rect x="-32" y="-12" width="28" height="22" rx="9"/><rect x="4" y="-12" width="28" height="22" rx="9"/>
      <line x1="-4" y1="-3" x2="4" y2="-3"/><line x1="-32" y1="-8" x2="-44" y2="-13"/><line x1="32" y1="-8" x2="44" y2="-13"/>
    </g>`;
  }
  if (/cintur|belt|gg/.test(n)) {
    return `<g><rect x="-94" y="238" width="188" height="20" rx="3" fill="${accC}"/>
      <rect x="-16" y="234" width="32" height="28" rx="5" fill="#caa85a" stroke="#0b1419" stroke-opacity="0.45" stroke-width="2"/>
      <rect x="-7" y="242" width="14" height="12" rx="2" fill="${accC}"/></g>`;
  }
  if (/bolso|bag|capucines|cartera/.test(n)) {
    return `<g><path d="M86,150 L128,150 L120,212 L94,212 Z" fill="${accC}"/>
      <path d="M94,150 C94,120 120,120 120,150" fill="none" stroke="${accC}" stroke-width="7"/>
      <rect x="100" y="168" width="14" height="10" rx="2" fill="#caa85a"/></g>`;
  }
  // reloj / por defecto: en la muñeca + banda sutil en la cintura
  return `<g><rect x="-112" y="198" width="24" height="26" rx="6" fill="${accC}"/>
    <circle cx="-100" cy="211" r="7" fill="#0b1419"/>
    <rect x="-90" y="246" width="180" height="9" rx="3" fill="${accC}" opacity="0.8"/></g>`;
}

function buildDemoLookSVG(garments = []) {
  const by = {};
  (garments || []).forEach((g) => { if (g && g.category && !by[g.category]) by[g.category] = g; });
  const top = by.superior, bottom = by.inferior, shoe = by.calzado, acc = by.accesorios;
  const skin = '#e7c6a5', hair = '#241a12';
  const topC = (top && top.color) || '#39434d';
  const botC = (bottom && bottom.color) || '#222a32';
  const shoeC = (shoe && shoe.color) || '#d8c089';
  const accC = (acc && acc.color) || '#caa85a';
  const isSkirt = bottom && /falda|skirt|vestido/i.test(bottom.name || '');
  const legFill = isSkirt ? skin : botC;
  const skirt = isSkirt ? `<path d="M-86,250 L86,250 L66,388 L-66,388 Z" fill="${botC}"/>` : '';
  const labels = [];
  const add = (g, t) => { if (g) labels.push(`${t}  ·  ${escapeXml((g.brand || '') + ' ' + (g.name || '')).trim()}`); };
  add(top, 'Superior'); add(bottom, 'Inferior'); add(shoe, 'Calzado'); add(acc, 'Accesorio');
  const labelRows = labels.map((t, i) => `<text x="40" y="${786 + i * 26}" fill="#e7eef0" font-family="Montserrat,Arial" font-size="15">${t}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="900" viewBox="0 0 560 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1b22"/><stop offset="1" stop-color="#13242c"/></linearGradient>
    <radialGradient id="spot" cx="50%" cy="30%" r="58%"><stop offset="0" stop-color="#1d3b44"/><stop offset="1" stop-color="#0d1b22"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19e0e0" stop-opacity="0.35"/><stop offset="1" stop-color="#19e0e0" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="560" height="900" fill="url(#bg)"/>
  <rect width="560" height="900" fill="url(#spot)" opacity="0.85"/>
  <ellipse cx="280" cy="732" rx="150" ry="26" fill="#000" opacity="0.35"/>
  <g transform="translate(280,180)">
    <path d="M-42,-30 C-42,-86 42,-86 42,-30 C42,2 24,30 0,30 C-24,30 -42,2 -42,-30 Z" fill="${hair}"/>
    <circle cx="0" cy="0" r="40" fill="${skin}"/>
    <path d="M-40,-26 C-40,-78 40,-78 40,-26 C28,-44 -28,-44 -40,-26 Z" fill="${hair}"/>
    <rect x="-14" y="36" width="28" height="26" fill="${skin}"/>
    <path d="M-82,250 L-8,250 L-16,520 L-72,520 Z" fill="${legFill}"/>
    <path d="M8,250 L82,250 L72,520 L16,520 Z" fill="${legFill}"/>
    ${skirt}
    <rect x="-74" y="520" width="62" height="26" rx="8" fill="${shoeC}"/>
    <rect x="14" y="520" width="62" height="26" rx="8" fill="${shoeC}"/>
    <path d="M-70,70 L70,70 L92,250 L-92,250 Z" fill="${topC}"/>
    <path d="M-70,70 L-110,210 L-82,224 L-50,96 Z" fill="${topC}"/>
    <path d="M70,70 L110,210 L82,224 L50,96 Z" fill="${topC}"/>
    ${accessoryShape(acc, accC)}
  </g>
  <rect x="0" width="560" height="130" fill="url(#beam)"><animate attributeName="y" values="-130;900;-130" dur="3s" repeatCount="indefinite"/></rect>
  <line x1="0" x2="560" stroke="#19e0e0" stroke-opacity="0.8" stroke-width="2"><animate attributeName="y1" values="0;900;0" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="0;900;0" dur="3s" repeatCount="indefinite"/></line>
  <g transform="translate(40,38)">
    <rect width="190" height="42" rx="21" fill="#0b1419" stroke="#19e0e0" stroke-opacity="0.5"/>
    <circle cx="25" cy="21" r="7" fill="#19e0e0"><animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/></circle>
    <text x="44" y="27" fill="#d6f7f7" font-family="Montserrat,Arial" font-size="14" letter-spacing="2">VISTA DEMO</text>
  </g>
  <rect x="24" y="756" width="512" height="${Math.max(40, labels.length * 26 + 18)}" rx="14" fill="#0b1419" fill-opacity="0.82" stroke="#caa85a" stroke-opacity="0.35"/>
  ${labelRows || `<text x="40" y="786" fill="#8fa3a8" font-family="Montserrat,Arial" font-size="15">Añade prendas a tu look</text>`}
</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

module.exports = { mapCategory, estimateSizes, ruleRecommend, ruleOutfits, buildDemoLookSVG, COLOR_LIBRARY };
