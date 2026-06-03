/* ──────────────────────────────────────────────────────────────
 *  URBAN STYLE · data.js
 *  Catálogo demo, perfiles demo y constantes.
 *  El catálogo efectivo = productos por defecto + productos del admin
 *  (guardados en localStorage). Todo es editable desde la UI.
 * ────────────────────────────────────────────────────────────── */

const URBAN = window.URBAN || {};

/* Categorías que el Virtual Try-On (IDM-VTON) puede "vestir" realmente. */
URBAN.TRYABLE = ['superior', 'inferior'];

URBAN.CONSTANTS = {
  categorias: ['superior', 'inferior', 'calzado', 'accesorios'],
  categoriaLabel: {
    superior: 'Prenda superior',
    inferior: 'Prenda inferior',
    calzado: 'Calzado',
    accesorios: 'Accesorios',
  },
  marcas: ['Dior', 'Valentino', 'Gucci', 'Prada', 'Louis Vuitton', 'Zara', 'Nike', 'Cartier'],
  estilos: ['casual', 'urbano', 'luxury', 'formal', 'noche', 'minimalista'],
  ocasiones: ['casual', 'día', 'formal', 'noche', 'deporte'],
  complexiones: ['slim', 'regular', 'wide'],
};

/* ── Catálogo demo (las imágenes coinciden con public/assets/productos) ── */
URBAN.DEFAULT_CATALOG = [
  // ── Prenda superior ──
  { id: 'top-dior-trench', nombre: 'Trench Atelier', marca: 'Dior', categoria: 'superior',
    color: { nombre: 'Beige premium', hex: '#c9b48d' }, estilo: 'luxury', ocasion: 'formal',
    tallas: ['XS','S','M','L','XL'], ajuste: 'recto', imagen: 'assets/productos/top-dior-trench.svg' },
  { id: 'top-valentino-blazer', nombre: 'Blazer Couture', marca: 'Valentino', categoria: 'superior',
    color: { nombre: 'Negro elegante', hex: '#1c1c20' }, estilo: 'formal', ocasion: 'noche',
    tallas: ['XS','S','M','L','XL'], ajuste: 'slim', imagen: 'assets/productos/top-valentino-blazer.svg' },
  { id: 'top-gucci-knit', nombre: 'Knit Heritage', marca: 'Gucci', categoria: 'superior',
    color: { nombre: 'Verde oliva', hex: '#5d6b4a' }, estilo: 'luxury', ocasion: 'casual',
    tallas: ['S','M','L','XL'], ajuste: 'regular', imagen: 'assets/productos/top-gucci-knit.svg' },
  { id: 'top-zara-tshirt', nombre: 'Camiseta Essential', marca: 'Zara', categoria: 'superior',
    color: { nombre: 'Blanco crema', hex: '#f2efe9' }, estilo: 'minimalista', ocasion: 'casual',
    tallas: ['XS','S','M','L','XL'], ajuste: 'regular', imagen: 'assets/productos/top-zara-tshirt.svg' },
  { id: 'top-prada-shirt', nombre: 'Camisa Líneas', marca: 'Prada', categoria: 'superior',
    color: { nombre: 'Azul petróleo', hex: '#1f6f78' }, estilo: 'urbano', ocasion: 'día',
    tallas: ['S','M','L','XL'], ajuste: 'slim', imagen: 'assets/productos/top-prada-shirt.svg' },
  { id: 'top-nike-hoodie', nombre: 'Tech Hoodie', marca: 'Nike', categoria: 'superior',
    color: { nombre: 'Gris grafito', hex: '#3a3f47' }, estilo: 'urbano', ocasion: 'deporte',
    tallas: ['S','M','L','XL'], ajuste: 'oversize', imagen: 'assets/productos/top-nike-hoodie.svg' },

  // ── Prenda inferior ──
  { id: 'bottom-prada-trousers', nombre: 'Pantalón Sartorial', marca: 'Prada', categoria: 'inferior',
    color: { nombre: 'Negro elegante', hex: '#15151a' }, estilo: 'formal', ocasion: 'formal',
    tallas: ['XS','S','M','L','XL'], ajuste: 'recto', imagen: 'assets/productos/bottom-prada-trousers.svg' },
  { id: 'bottom-zara-jeans', nombre: 'Jean Slim', marca: 'Zara', categoria: 'inferior',
    color: { nombre: 'Azul índigo', hex: '#33526e' }, estilo: 'casual', ocasion: 'casual',
    tallas: ['XS','S','M','L','XL'], ajuste: 'slim', imagen: 'assets/productos/bottom-zara-jeans.svg' },
  { id: 'bottom-gucci-skirt', nombre: 'Falda Plisada', marca: 'Gucci', categoria: 'inferior',
    color: { nombre: 'Beige premium', hex: '#cdbb96' }, estilo: 'luxury', ocasion: 'día',
    tallas: ['XS','S','M','L'], ajuste: 'regular', imagen: 'assets/productos/bottom-gucci-skirt.svg' },
  { id: 'bottom-nike-jogger', nombre: 'Jogger Tech', marca: 'Nike', categoria: 'inferior',
    color: { nombre: 'Negro', hex: '#22252b' }, estilo: 'urbano', ocasion: 'deporte',
    tallas: ['S','M','L','XL'], ajuste: 'regular', imagen: 'assets/productos/bottom-nike-jogger.svg' },
  { id: 'bottom-valentino-pants', nombre: 'Pantalón Crema', marca: 'Valentino', categoria: 'inferior',
    color: { nombre: 'Blanco crema', hex: '#ece3d0' }, estilo: 'minimalista', ocasion: 'formal',
    tallas: ['XS','S','M','L','XL'], ajuste: 'recto', imagen: 'assets/productos/bottom-valentino-pants.svg' },

  // ── Calzado (no apto para try-on de prenda) ──
  { id: 'shoe-nike-sneaker', nombre: 'Air Statement', marca: 'Nike', categoria: 'calzado',
    color: { nombre: 'Blanco', hex: '#f4f4f4' }, estilo: 'urbano', ocasion: 'casual',
    tallas: ['38','39','40','41','42','43','44'], ajuste: 'regular', imagen: 'assets/productos/shoe-nike-sneaker.svg' },
  { id: 'shoe-gucci-loafer', nombre: 'Mocasín Oro', marca: 'Gucci', categoria: 'calzado',
    color: { nombre: 'Negro', hex: '#1a1a1d' }, estilo: 'luxury', ocasion: 'formal',
    tallas: ['39','40','41','42','43','44'], ajuste: 'regular', imagen: 'assets/productos/shoe-gucci-loafer.svg' },
  { id: 'shoe-valentino-heel', nombre: 'Tacón Rockstud', marca: 'Valentino', categoria: 'calzado',
    color: { nombre: 'Vino', hex: '#7a1f2b' }, estilo: 'noche', ocasion: 'noche',
    tallas: ['36','37','38','39','40'], ajuste: 'regular', imagen: 'assets/productos/shoe-valentino-heel.svg' },
  { id: 'shoe-lv-boot', nombre: 'Botín Monogram', marca: 'Louis Vuitton', categoria: 'calzado',
    color: { nombre: 'Marrón', hex: '#5b4226' }, estilo: 'luxury', ocasion: 'día',
    tallas: ['39','40','41','42','43','44'], ajuste: 'regular', imagen: 'assets/productos/shoe-lv-boot.svg' },

  // ── Accesorios ──
  { id: 'acc-cartier-watch', nombre: 'Tank Or', marca: 'Cartier', categoria: 'accesorios',
    color: { nombre: 'Dorado suave', hex: '#caa85a' }, estilo: 'luxury', ocasion: 'formal',
    tallas: ['Única'], ajuste: 'única', imagen: 'assets/productos/acc-cartier-watch.svg' },
  { id: 'acc-lv-bag', nombre: 'Bolso Capucines', marca: 'Louis Vuitton', categoria: 'accesorios',
    color: { nombre: 'Marrón', hex: '#6b4a2b' }, estilo: 'luxury', ocasion: 'noche',
    tallas: ['Única'], ajuste: 'única', imagen: 'assets/productos/acc-lv-bag.svg' },
  { id: 'acc-dior-sunglasses', nombre: 'Gafas Solar', marca: 'Dior', categoria: 'accesorios',
    color: { nombre: 'Negro', hex: '#15151a' }, estilo: 'urbano', ocasion: 'día',
    tallas: ['Única'], ajuste: 'única', imagen: 'assets/productos/acc-dior-sunglasses.svg' },
  { id: 'acc-gucci-belt', nombre: 'Cinturón GG', marca: 'Gucci', categoria: 'accesorios',
    color: { nombre: 'Negro', hex: '#1a1a1d' }, estilo: 'luxury', ocasion: 'formal',
    tallas: ['85','90','95','100'], ajuste: 'única', imagen: 'assets/productos/acc-gucci-belt.svg' },
];

/* ── Perfiles demo ── */
URBAN.DEMO_PROFILES = [
  {
    id: 'demo-andres', nombre: 'Andrés', foto: 'assets/demo/avatar-1.svg',
    altura: 178, pecho: 98, cintura: 82, cadera: 96, hombros: 46, pierna: 80, calzado: 42,
    complexion: 'regular', estilo: 'urbano', ocasion: 'casual',
    preferencias: 'Tonos fríos, prendas con estructura, estética tech.',
  },
  {
    id: 'demo-camila', nombre: 'Camila', foto: 'assets/demo/avatar-2.svg',
    altura: 168, pecho: 88, cintura: 70, cadera: 96, hombros: 40, pierna: 76, calzado: 38,
    complexion: 'slim', estilo: 'luxury', ocasion: 'noche',
    preferencias: 'Siluetas elegantes, dorados sutiles, acabado premium.',
  },
];

/* ── Outfits demo precargados (para presentación inmediata) ── */
URBAN.DEMO_OUTFITS = [
  { id: 'demo-out-1', nombre: 'Urban Petrol', tipo: 'urbano',
    itemIds: ['top-prada-shirt', 'bottom-zara-jeans', 'shoe-nike-sneaker', 'acc-dior-sunglasses'],
    colores: ['Azul petróleo', 'Índigo', 'Blanco'],
    explicacion: 'Una base urbana equilibrada: la camisa Prada en azul petróleo marca el tono tech, el jean slim aporta versatilidad y las sneakers blancas iluminan el conjunto.' },
  { id: 'demo-out-2', nombre: 'Noche Couture', tipo: 'noche',
    itemIds: ['top-valentino-blazer', 'bottom-prada-trousers', 'shoe-gucci-loafer', 'acc-cartier-watch'],
    colores: ['Negro', 'Dorado', 'Grafito'],
    explicacion: 'Elegancia nocturna: blazer Valentino y pantalón sartorial en negro, rematados con mocasín Gucci y un Cartier dorado que añade el acento de lujo.' },
  { id: 'demo-out-3', nombre: 'Minimal Cream', tipo: 'minimalista',
    itemIds: ['top-zara-tshirt', 'bottom-valentino-pants', 'shoe-lv-boot', 'acc-lv-bag'],
    colores: ['Crema', 'Blanco', 'Marrón'],
    explicacion: 'Minimalismo premium en tonos crema con contraste cálido del cuero Louis Vuitton. Líneas limpias, máxima cohesión.' },
];

/* ── Acceso al catálogo efectivo (defaults + admin) ── */
URBAN.STORAGE_KEYS = {
  profile: 'urban_profile',
  custom: 'urban_custom_products',
  deleted: 'urban_deleted_products',
};

URBAN.getCustomProducts = function () {
  try { return JSON.parse(localStorage.getItem(URBAN.STORAGE_KEYS.custom)) || []; }
  catch (e) { return []; }
};
URBAN.getDeletedIds = function () {
  try { return JSON.parse(localStorage.getItem(URBAN.STORAGE_KEYS.deleted)) || []; }
  catch (e) { return []; }
};
URBAN.getCatalog = function () {
  const deleted = URBAN.getDeletedIds();
  const custom = URBAN.getCustomProducts();
  const customIds = new Set(custom.map((p) => p.id));
  const base = URBAN.DEFAULT_CATALOG
    .filter((p) => !deleted.includes(p.id))   // respeta eliminaciones del admin
    .filter((p) => !customIds.has(p.id));     // las ediciones del admin tienen prioridad
  return [...base, ...custom];
};
URBAN.findProduct = function (id) {
  return URBAN.getCatalog().find((p) => p.id === id);
};

window.URBAN = URBAN;
