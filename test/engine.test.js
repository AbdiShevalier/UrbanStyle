const assert = require('assert');
const { mapCategory, estimateSizes, ruleRecommend, ruleOutfits, buildDemoLookSVG } = require('../lib/engine');
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('  ✓', name); };
const CATALOG = [
  { id: 't1', nombre: 'Camisa', marca: 'Prada', categoria: 'superior', color: { nombre: 'Azul', hex: '#1f6f78' }, estilo: 'urbano', ocasion: 'día' },
  { id: 't2', nombre: 'Blazer', marca: 'Valentino', categoria: 'superior', color: { nombre: 'Negro', hex: '#111' }, estilo: 'formal', ocasion: 'noche' },
  { id: 'b1', nombre: 'Jean', marca: 'Zara', categoria: 'inferior', color: { nombre: 'Indigo', hex: '#335' }, estilo: 'casual', ocasion: 'casual' },
  { id: 'b2', nombre: 'Pantalon', marca: 'Prada', categoria: 'inferior', color: { nombre: 'Negro', hex: '#111' }, estilo: 'formal', ocasion: 'formal' },
  { id: 's1', nombre: 'Sneaker', marca: 'Nike', categoria: 'calzado', color: { nombre: 'Blanco', hex: '#fff' }, estilo: 'urbano', ocasion: 'casual' },
  { id: 'a1', nombre: 'Reloj', marca: 'Cartier', categoria: 'accesorios', color: { nombre: 'Oro', hex: '#caa85a' }, estilo: 'luxury', ocasion: 'formal' },
];
console.log('\nlib/engine');
test('mapCategory', () => {
  assert.strictEqual(mapCategory('superior'), 'upper_body');
  assert.strictEqual(mapCategory('inferior'), 'lower_body');
  assert.strictEqual(mapCategory('vestido'), 'dresses');
  assert.strictEqual(mapCategory(), 'upper_body');
});
test('estimateSizes ajusta por complexión', () => {
  assert.strictEqual(estimateSizes({ pecho: 98, complexion: 'regular' }).superior, 'M');
  assert.strictEqual(estimateSizes({ pecho: 98, complexion: 'slim' }).superior, 'S');
  assert.strictEqual(estimateSizes({ pecho: 98, complexion: 'wide' }).superior, 'L');
  assert.strictEqual(estimateSizes({ pecho: 112 }).superior, 'XL');
  assert.ok(estimateSizes({ cintura: 82 }).inferior.includes('82 cm'));
});
test('ruleRecommend estructura', () => {
  const r = ruleRecommend({ estilo: 'luxury', pecho: 98 }, CATALOG);
  assert.strictEqual(r.styleDetected, 'luxury');
  assert.ok(r.colors.length >= 3 && r.accessories.includes('Reloj'));
  assert.ok(r.reasoning.length > 20 && r.sizes.superior);
});
test('ruleOutfits: 4 outfits, estilo preferido primero, ids reales', () => {
  const o = ruleOutfits({ estilo: 'formal' }, CATALOG);
  assert.strictEqual(o.outfits.length, 4);
  assert.strictEqual(o.outfits[0].tipo, 'formal');
  o.outfits.forEach((out) => {
    assert.ok(out.itemIds.every((id) => CATALOG.some((p) => p.id === id)));
    assert.strictEqual(out.colores.length, 3);
    assert.ok(out.explicacion.length > 5);
  });
});
test('buildDemoLookSVG dibuja el look completo', () => {
  const uri = buildDemoLookSVG([
    { category: 'superior', name: 'Camisa Lineas', brand: 'Prada', color: '#1f6f78' },
    { category: 'inferior', name: 'Jean Slim', brand: 'Zara', color: '#33526e' },
    { category: 'calzado', name: 'Air', brand: 'Nike', color: '#f4f4f4' },
    { category: 'accesorios', name: 'Gafas', brand: 'Dior', color: '#15151a' },
  ]);
  assert.ok(uri.startsWith('data:image/svg+xml;base64,'));
  const svg = Buffer.from(uri.split(',')[1], 'base64').toString('utf-8');
  assert.ok(svg.startsWith('<svg') && svg.trim().endsWith('</svg>'));
  ['Camisa Lineas', 'Jean Slim', 'Air', 'Gafas'].forEach((n) => assert.ok(svg.includes(n), 'falta ' + n));
  ['#1f6f78', '#33526e', '#f4f4f4'].forEach((c) => assert.ok(svg.includes(c), 'falta ' + c));
});
test('buildDemoLookSVG vacío y con una prenda', () => {
  assert.ok(buildDemoLookSVG([]).startsWith('data:image/svg+xml;base64,'));
  const uno = Buffer.from(buildDemoLookSVG([{ category: 'superior', name: 'Top', brand: 'X', color: '#abcdef' }]).split(',')[1], 'base64').toString();
  assert.ok(uno.includes('#abcdef') && uno.includes('Top'));
});
console.log(`\n${passed} pruebas superadas\n`);
