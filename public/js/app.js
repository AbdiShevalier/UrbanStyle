/* ──────────────────────────────────────────────────────────────
 *  URBAN STYLE · app.js
 *  Catálogo, canasto, look (varias prendas), perfil, outfits,
 *  consejos, probador (look completo) y demo rápida.
 * ────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', init);

const SLOTS = ['superior', 'inferior', 'calzado', 'accesorios'];

async function init() {
  initParticles();
  initReveal();
  loadProfile();
  try {
    const h = await API.health();
    STATE.mode = h.mode; STATE.features = h.features || {};
  } catch (e) { STATE.mode = 'demo'; }
  setEngineMode('demo');

  wireNav();
  renderDemoProfiles();
  buildFilters();
  renderCatalog();
  wireAdmin();
  wireProfileForm();
  wireOutfits();
  wireRecommend();
  wireTryOn();
  wireEngineToggle();
  wireQuickDemo();
  refreshTryOnSubject();
  renderLook();
  renderBasket();
  renderDemoOutfits();

  const hash = (location.hash || '#inicio').slice(1);
  showView(['inicio','perfil','catalogo','outfits','probador','recomendaciones'].includes(hash) ? hash : 'inicio');
}

function wireNav() {
  $$('.nav-link, [data-goto]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const view = el.dataset.view || el.dataset.goto;
      if (view) { e.preventDefault(); showView(view); }
    });
  });
  const burger = $('#nav-burger');
  if (burger) burger.addEventListener('click', () => $('#nav-links').classList.toggle('open'));
}

/* ── CATÁLOGO ── */
function buildFilters() {
  const cat = $('#filter-cat'), brand = $('#filter-brand'), style = $('#filter-style');
  if (!cat) return;
  cat.innerHTML = '<option value="">Todas las categorías</option>' +
    URBAN.CONSTANTS.categorias.map((c) => `<option value="${c}">${URBAN.CONSTANTS.categoriaLabel[c]}</option>`).join('');
  brand.innerHTML = '<option value="">Todas las marcas</option>' +
    URBAN.CONSTANTS.marcas.map((m) => `<option value="${m}">${m}</option>`).join('');
  style.innerHTML = '<option value="">Todos los estilos</option>' +
    URBAN.CONSTANTS.estilos.map((s) => `<option value="${s}">${s}</option>`).join('');
  [cat, brand, style].forEach((sel) => sel.addEventListener('change', renderCatalog));
  $('#filter-search') && $('#filter-search').addEventListener('input', renderCatalog);
}

function getFilteredCatalog() {
  const c = $('#filter-cat')?.value || '';
  const b = $('#filter-brand')?.value || '';
  const s = $('#filter-style')?.value || '';
  const q = ($('#filter-search')?.value || '').toLowerCase().trim();
  return URBAN.getCatalog().filter((p) =>
    (!c || p.categoria === c) && (!b || p.marca === b) && (!s || p.estilo === s) &&
    (!q || (p.nombre + ' ' + p.marca).toLowerCase().includes(q)));
}

function productCard(p) {
  const inLook = STATE.look[p.categoria] === p.id;
  const body = URBAN.TRYABLE.includes(p.categoria);
  return `
  <article class="product-card reveal" data-id="${p.id}">
    <div class="product-media">
      <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy"/>
      <span class="chip chip-cat">${esc(URBAN.CONSTANTS.categoriaLabel[p.categoria] || p.categoria)}</span>
      ${body ? '<span class="chip chip-try">IA</span>' : ''}
    </div>
    <div class="product-info">
      <span class="product-brand">${esc(p.marca)}</span>
      <h3 class="product-name">${esc(p.nombre)}</h3>
      <div class="product-meta">
        <span class="swatch" style="background:${esc(p.color.hex)}"></span>
        <span>${esc(p.color.nombre)}</span><span class="dot">·</span><span>${esc(p.estilo)}</span>
      </div>
      <div class="product-actions">
        <button class="btn btn-mini ${inLook ? 'btn-on' : ''}" data-act="add" data-id="${p.id}">${inLook ? 'En tu look ✓' : '+ Añadir'}</button>
        <button class="btn btn-mini btn-ghost" data-act="info" data-id="${p.id}">Ver</button>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const grid = $('#catalog-grid');
  if (!grid) return;
  const items = getFilteredCatalog();
  grid.innerHTML = items.length ? items.map(productCard).join('') : '<p class="muted center">No hay prendas con ese filtro.</p>';
  $('#catalog-count') && ($('#catalog-count').textContent = `${items.length} prendas`);
  initReveal();
  grid.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = URBAN.findProduct(btn.dataset.id);
      if (!p) return;
      if (btn.dataset.act === 'add') addToLook(p);
      if (btn.dataset.act === 'info') showProductInfo(p);
    });
  });
}

function showProductInfo(p) {
  openModal(`
    <div class="modal-product">
      <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}"/>
      <div>
        <span class="product-brand">${esc(p.marca)}</span>
        <h2>${esc(p.nombre)}</h2>
        <p class="muted">${esc(URBAN.CONSTANTS.categoriaLabel[p.categoria])} · ${esc(p.estilo)} · ${esc(p.ocasion)}</p>
        <p><strong>Color:</strong> <span class="swatch" style="background:${esc(p.color.hex)}"></span> ${esc(p.color.nombre)}</p>
        <p><strong>Tallas:</strong> ${p.tallas.map(esc).join(', ')}</p>
        <p><strong>Ajuste:</strong> ${esc(p.ajuste)}</p>
        <button class="btn" data-act="add-modal">+ Añadir a mi look</button>
      </div>
    </div>`);
  $('[data-act="add-modal"]').addEventListener('click', () => { closeModal(); addToLook(p); });
}

/* ── CANASTO + LOOK ── */
function addToBasket(id) { if (!STATE.basket.includes(id)) STATE.basket.push(id); }

function addToLook(p) {
  addToBasket(p.id);
  STATE.look[p.categoria] = p.id;
  renderCatalog(); renderLook(); renderBasket();
  toast(`${p.nombre} añadido a tu look`, 'success');
}

function useFromBasket(id) {
  const p = URBAN.findProduct(id);
  if (!p) return;
  STATE.look[p.categoria] = id;
  renderCatalog(); renderLook(); renderBasket();
  toast(`${p.nombre} puesto en tu look`, 'success');
}

function removeFromBasket(id) {
  STATE.basket = STATE.basket.filter((b) => b !== id);
  SLOTS.forEach((c) => { if (STATE.look[c] === id) STATE.look[c] = null; });
  renderCatalog(); renderLook(); renderBasket();
}

function clearSlot(cat) { STATE.look[cat] = null; renderCatalog(); renderLook(); }

function getLookGarments() {
  return SLOTS.map((c) => (STATE.look[c] ? URBAN.findProduct(STATE.look[c]) : null)).filter(Boolean);
}

function renderLook() {
  const wrap = $('#look-slots');
  if (!wrap) return;
  wrap.innerHTML = SLOTS.map((cat) => {
    const p = STATE.look[cat] ? URBAN.findProduct(STATE.look[cat]) : null;
    return `
      <div class="slot ${p ? 'filled' : ''}">
        <span class="slot-cat">${esc(URBAN.CONSTANTS.categoriaLabel[cat])}</span>
        ${p ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}"/>
               <span class="slot-name">${esc(p.marca)} · ${esc(p.nombre)}</span>
               <button class="slot-x" data-clear="${cat}" title="Quitar">✕</button>`
            : `<span class="slot-empty">vacío</span>`}
      </div>`;
  }).join('');
  wrap.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', () => clearSlot(b.dataset.clear)));
  const n = getLookGarments().length;
  $('#look-count') && ($('#look-count').textContent = n ? `${n} prenda${n > 1 ? 's' : ''}` : 'vacío');
}

function renderBasket() {
  const wrap = $('#basket-list');
  if (!wrap) return;
  if (!STATE.basket.length) { wrap.innerHTML = '<p class="muted small">Tu canasto está vacío. Añade prendas desde el catálogo.</p>'; return; }
  wrap.innerHTML = STATE.basket.map((id) => {
    const p = URBAN.findProduct(id); if (!p) return '';
    const active = STATE.look[p.categoria] === id;
    return `
      <div class="basket-row ${active ? 'active' : ''}">
        <img src="${esc(p.imagen)}" alt=""/>
        <div class="basket-info"><strong>${esc(p.nombre)}</strong><span>${esc(p.marca)} · ${esc(URBAN.CONSTANTS.categoriaLabel[p.categoria])}</span></div>
        <button class="btn btn-mini ${active ? 'btn-on' : 'btn-ghost'}" data-use="${id}">${active ? 'En look' : 'Usar'}</button>
        <button class="btn btn-mini btn-danger" data-drop="${id}">✕</button>
      </div>`;
  }).join('');
  wrap.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => useFromBasket(b.dataset.use)));
  wrap.querySelectorAll('[data-drop]').forEach((b) => b.addEventListener('click', () => removeFromBasket(b.dataset.drop)));
}

/* ── ADMIN ── */
function wireAdmin() {
  const toggle = $('#admin-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => $('#admin-panel').classList.toggle('open'));
  const form = $('#admin-form');
  $('#adm-cat').innerHTML = URBAN.CONSTANTS.categorias.map((c) => `<option value="${c}">${URBAN.CONSTANTS.categoriaLabel[c]}</option>`).join('');
  $('#adm-style').innerHTML = URBAN.CONSTANTS.estilos.map((s) => `<option value="${s}">${s}</option>`).join('');
  $('#adm-occ').innerHTML = URBAN.CONSTANTS.ocasiones.map((o) => `<option value="${o}">${o}</option>`).join('');
  let editingId = null, pendingImage = null;
  $('#adm-image').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { pendingImage = await ImageUtil.fileToDataURL(file, 700, 0.92); $('#adm-preview').src = pendingImage; $('#adm-preview').style.display = 'block'; }
    catch (err) { toast('No se pudo leer la imagen', 'error'); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
      id: editingId || ('custom-' + Date.now()),
      nombre: $('#adm-name').value.trim() || 'Producto',
      marca: $('#adm-brand').value.trim() || 'Urban Style',
      categoria: $('#adm-cat').value,
      color: { nombre: $('#adm-color-name').value.trim() || 'Color', hex: $('#adm-color').value },
      estilo: $('#adm-style').value, ocasion: $('#adm-occ').value,
      tallas: ($('#adm-sizes').value || 'S,M,L').split(',').map((s) => s.trim()).filter(Boolean),
      ajuste: $('#adm-fit').value.trim() || 'regular',
      imagen: pendingImage || (editingId && URBAN.findProduct(editingId)?.imagen) || 'assets/productos/top-zara-tshirt.svg',
    };
    const custom = URBAN.getCustomProducts().filter((p) => p.id !== product.id);
    custom.push(product);
    localStorage.setItem(URBAN.STORAGE_KEYS.custom, JSON.stringify(custom));
    toast(editingId ? 'Producto actualizado' : 'Producto añadido', 'success');
    editingId = null; pendingImage = null; form.reset();
    $('#adm-preview').style.display = 'none'; $('#admin-submit').textContent = 'Añadir producto';
    renderCatalog(); renderAdminList(); renderBasket();
  });
  $('#admin-reset').addEventListener('click', () => {
    editingId = null; pendingImage = null; form.reset();
    $('#adm-preview').style.display = 'none'; $('#admin-submit').textContent = 'Añadir producto';
  });
  $('#admin-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-admact]'); if (!btn) return;
    const p = URBAN.findProduct(btn.dataset.id);
    if (btn.dataset.admact === 'edit' && p) {
      editingId = p.id;
      $('#adm-name').value = p.nombre; $('#adm-brand').value = p.marca; $('#adm-cat').value = p.categoria;
      $('#adm-style').value = p.estilo; $('#adm-occ').value = p.ocasion; $('#adm-color').value = p.color.hex;
      $('#adm-color-name').value = p.color.nombre; $('#adm-sizes').value = p.tallas.join(', '); $('#adm-fit').value = p.ajuste;
      pendingImage = null; $('#adm-preview').src = p.imagen; $('#adm-preview').style.display = 'block';
      $('#admin-submit').textContent = 'Guardar cambios'; $('#admin-panel').classList.add('open');
      $('#adm-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (btn.dataset.admact === 'del') deleteProduct(btn.dataset.id);
  });
  renderAdminList();
}

function deleteProduct(id) {
  const isCustom = URBAN.getCustomProducts().some((p) => p.id === id);
  if (isCustom) localStorage.setItem(URBAN.STORAGE_KEYS.custom, JSON.stringify(URBAN.getCustomProducts().filter((p) => p.id !== id)));
  else { const del = URBAN.getDeletedIds(); if (!del.includes(id)) del.push(id); localStorage.setItem(URBAN.STORAGE_KEYS.deleted, JSON.stringify(del)); }
  removeFromBasket(id);
  toast('Producto eliminado', 'info');
  renderCatalog(); renderAdminList();
}

function renderAdminList() {
  const list = $('#admin-list');
  if (!list) return;
  list.innerHTML = URBAN.getCatalog().map((p) => `
    <div class="admin-row">
      <img src="${esc(p.imagen)}" alt=""/>
      <div class="admin-row-info"><strong>${esc(p.nombre)}</strong><span>${esc(p.marca)} · ${esc(p.categoria)}</span></div>
      <div class="admin-row-actions">
        <button class="btn btn-mini btn-ghost" data-admact="edit" data-id="${p.id}">Editar</button>
        <button class="btn btn-mini btn-danger" data-admact="del" data-id="${p.id}">Borrar</button>
      </div>
    </div>`).join('');
}

/* ── PERFIL ── */
function renderDemoProfiles() {
  const wrap = $('#demo-profiles');
  if (!wrap) return;
  wrap.innerHTML = URBAN.DEMO_PROFILES.map((p) => `
    <button class="demo-profile" data-demo="${p.id}">
      <img src="${esc(p.foto)}" alt="${esc(p.nombre)}"/>
      <span>${esc(p.nombre)}</span><small>${esc(p.estilo)} · ${esc(p.ocasion)}</small>
    </button>`).join('');
  wrap.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => loadDemoProfile(b.dataset.demo)));
}

function loadDemoProfile(id) {
  const dp = URBAN.DEMO_PROFILES.find((p) => p.id === id);
  if (!dp) return;
  saveProfile({ ...dp });
  hydrateProfileForm(); refreshTryOnSubject();
  toast(`Perfil "${dp.nombre}" cargado`, 'success');
}

function hydrateProfileForm() {
  const p = STATE.profile; if (!p) return;
  ['altura','pecho','cintura','cadera','hombros','pierna','calzado','preferencias','nombre'].forEach((k) => {
    const el = $('#pf-' + k); if (el && p[k] != null) el.value = p[k];
  });
  $('#pf-complexion') && ($('#pf-complexion').value = p.complexion || 'regular');
  $('#pf-estilo') && ($('#pf-estilo').value = p.estilo || 'urbano');
  $('#pf-ocasion') && ($('#pf-ocasion').value = p.ocasion || 'casual');
  updatePhotoPreview(p.foto);
}

function updatePhotoPreview(src) {
  const prev = $('#pf-photo-preview'), hint = $('#pf-drop-hint'), clear = $('#pf-clear-photo');
  const real = src && src.startsWith('data:');
  if (prev) { prev.src = src || 'assets/demo/subject.svg'; prev.style.display = src ? 'block' : 'none'; }
  if (hint) hint.style.display = src ? 'none' : 'flex';
  if (clear) clear.style.display = real ? 'inline-flex' : 'none';
}

function wireProfileForm() {
  $('#pf-complexion') && ($('#pf-complexion').innerHTML = URBAN.CONSTANTS.complexiones.map((c) => `<option value="${c}">${c}</option>`).join(''));
  $('#pf-estilo') && ($('#pf-estilo').innerHTML = URBAN.CONSTANTS.estilos.map((s) => `<option value="${s}">${s}</option>`).join(''));
  $('#pf-ocasion') && ($('#pf-ocasion').innerHTML = URBAN.CONSTANTS.ocasiones.map((o) => `<option value="${o}">${o}</option>`).join(''));
  hydrateProfileForm();
  let photoData = STATE.profile?.foto || null;
  const drop = $('#pf-drop'), input = $('#pf-photo');
  async function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) return toast('Elige una imagen', 'error');
    try { photoData = await ImageUtil.fileToDataURL(file, 1024, 0.9); updatePhotoPreview(photoData); toast('Foto cargada', 'success'); }
    catch (e) { toast('No se pudo procesar la foto', 'error'); }
  }
  input && input.addEventListener('change', (e) => handleFile(e.target.files[0]));
  if (drop) {
    drop.addEventListener('click', (e) => { if (e.target.closest('#pf-clear-photo')) return; input.click(); });
    ['dragover','dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave','drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
  }
  $('#pf-clear-photo') && $('#pf-clear-photo').addEventListener('click', (e) => {
    e.stopPropagation();
    photoData = null;
    if (STATE.profile) { STATE.profile.foto = null; saveProfile(STATE.profile); }
    updatePhotoPreview(null); refreshTryOnSubject();
    toast('Foto eliminada', 'info');
  });
  $('#profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = {
      id: STATE.profile?.id || 'user', nombre: $('#pf-nombre').value.trim() || 'Mi perfil',
      foto: photoData || (STATE.profile && STATE.profile.foto) || null,
      altura: +$('#pf-altura').value || null, pecho: +$('#pf-pecho').value || null,
      cintura: +$('#pf-cintura').value || null, cadera: +$('#pf-cadera').value || null,
      hombros: +$('#pf-hombros').value || null, pierna: +$('#pf-pierna').value || null,
      calzado: +$('#pf-calzado').value || null, complexion: $('#pf-complexion').value,
      estilo: $('#pf-estilo').value, ocasion: $('#pf-ocasion').value, preferencias: $('#pf-preferencias').value.trim(),
    };
    saveProfile(profile); refreshTryOnSubject();
    toast('Perfil guardado', 'success'); showView('catalogo');
  });
}

/* ── OUTFITS ── */
function wireOutfits() {
  const btn = $('#gen-outfits'); if (!btn) return;
  $('#out-occ').innerHTML = '<option value="">(según mi perfil)</option>' + URBAN.CONSTANTS.ocasiones.map((o) => `<option value="${o}">${o}</option>`).join('');
  $('#out-style').innerHTML = '<option value="">(según mi perfil)</option>' + URBAN.CONSTANTS.estilos.map((s) => `<option value="${s}">${s}</option>`).join('');
  btn.addEventListener('click', async () => {
    const profile = STATE.profile || URBAN.DEMO_PROFILES[0];
    btn.disabled = true; btn.classList.add('loading');
    $('#outfits-result').innerHTML = loaderHTML('Armando outfits…');
    try {
      const data = await API.outfits({ profile, catalog: URBAN.getCatalog(), occasion: $('#out-occ').value || undefined, style: $('#out-style').value || undefined });
      renderOutfits(data.outfits || [], data.source);
    } catch (e) { toast('No se pudieron armar los outfits: ' + e.message, 'error'); $('#outfits-result').innerHTML = ''; }
    finally { btn.disabled = false; btn.classList.remove('loading'); }
  });
}

function renderDemoOutfits() {
  if ($('#outfits-result') && !$('#outfits-result').children.length) renderOutfits(URBAN.DEMO_OUTFITS, 'demo');
}

function renderOutfits(outfits, source) {
  const wrap = $('#outfits-result'); if (!wrap) return;
  if (!outfits.length) { wrap.innerHTML = '<p class="muted center">Sin outfits.</p>'; return; }
  wrap.innerHTML = outfits.map((o, i) => {
    const items = (o.itemIds || []).map((id) => URBAN.findProduct(id)).filter(Boolean);
    return `
    <article class="outfit-card reveal">
      <div class="outfit-head"><h3>${esc(o.nombre)}</h3><span class="chip chip-type">${esc(o.tipo)}</span></div>
      <div class="outfit-items">${items.map((p) => `<div class="outfit-thumb" title="${esc(p.nombre)} · ${esc(p.marca)}"><img src="${esc(p.imagen)}" alt="${esc(p.nombre)}"/></div>`).join('')}</div>
      <p class="outfit-why">${esc(o.explicacion || '')}</p>
      <div class="outfit-colors">${(o.colores || []).map((c) => `<span class="chip chip-soft">${esc(c)}</span>`).join('')}</div>
      <div class="outfit-actions"><button class="btn btn-mini" data-look="${i}">Probar este look</button></div>
    </article>`;
  }).join('');
  const tag = $('#outfits-source');
  if (tag) tag.textContent = source === 'openai' ? 'Hecho con OpenAI' : source === 'demo' ? 'Outfits de ejemplo' : 'Motor interno';
  initReveal();
  wrap.querySelectorAll('[data-look]').forEach((b) => b.addEventListener('click', () => loadOutfitIntoLook(outfits[+b.dataset.look])));
}

function loadOutfitIntoLook(outfit) {
  if (!outfit) return;
  SLOTS.forEach((c) => STATE.look[c] = null);
  (outfit.itemIds || []).forEach((id) => { const p = URBAN.findProduct(id); if (p) { addToBasket(id); STATE.look[p.categoria] = id; } });
  renderLook(); renderBasket(); renderCatalog();
  showView('probador');
  toast('Look cargado en el probador', 'success');
}

/* ── CONSEJOS ── */
function wireRecommend() {
  const btn = $('#gen-recommend'); if (!btn) return;
  btn.addEventListener('click', async () => {
    const profile = STATE.profile || URBAN.DEMO_PROFILES[0];
    btn.disabled = true; btn.classList.add('loading');
    $('#recommend-result').innerHTML = loaderHTML('Analizando…');
    try { renderRecommend(await API.recommend({ profile, catalog: URBAN.getCatalog() })); }
    catch (e) { toast('Error: ' + e.message, 'error'); $('#recommend-result').innerHTML = ''; }
    finally { btn.disabled = false; btn.classList.remove('loading'); }
  });
}

function renderRecommend(d) {
  const sizes = d.sizes || {};
  $('#recommend-result').innerHTML = `
    <div class="rec-grid">
      <div class="rec-card reveal"><h4>Tu estilo</h4><p class="rec-big">${esc(d.styleDetected || '—')}</p></div>
      <div class="rec-card reveal"><h4>Tus tallas</h4>
        <p>Arriba: <strong>${esc(sizes.superior || '—')}</strong></p>
        <p>Abajo: <strong>${esc(sizes.inferior || '—')}</strong></p>
        <p>Calzado: <strong>${esc(sizes.calzado || '—')}</strong></p></div>
      <div class="rec-card reveal"><h4>Colores</h4><div class="rec-colors">${(d.colors || []).map((c) => `<span class="chip chip-soft">${esc(c)}</span>`).join('')}</div></div>
      <div class="rec-card reveal"><h4>Accesorios</h4><ul class="rec-list">${(d.accessories || []).map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
    </div>
    <div class="rec-reason reveal"><h4>En corto</h4><p>${esc(d.reasoning || '')}</p>
      <span class="rec-source">${d.source === 'openai' ? 'OpenAI' : 'Motor interno'}</span></div>`;
  initReveal();
}

/* ── PROBADOR ── */
function refreshTryOnSubject() {
  const src = STATE.profile?.foto || 'assets/demo/subject.svg';
  const el = $('#tryon-subject-img'); if (el) el.src = src;
  const label = $('#tryon-subject-label');
  if (label) label.textContent = (STATE.profile && STATE.profile.foto) ? (STATE.profile.nombre || 'Mi foto') : 'Sujeto demo';
  const clear = $('#tryon-clear-photo'); if (clear) clear.style.display = (STATE.profile && STATE.profile.foto) ? 'inline-flex' : 'none';
}

function wireTryOn() {
  const subjectInput = $('#tryon-photo');
  subjectInput && subjectInput.addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = await ImageUtil.fileToDataURL(file, 1024, 0.9);
      const profile = STATE.profile || { id: 'user', nombre: 'Mi perfil' };
      profile.foto = data; saveProfile(profile); refreshTryOnSubject();
      toast('Foto lista', 'success');
    } catch (err) { toast('No se pudo cargar la foto', 'error'); }
  });
  $('#tryon-clear-photo') && $('#tryon-clear-photo').addEventListener('click', () => {
    if (STATE.profile) { STATE.profile.foto = null; saveProfile(STATE.profile); }
    refreshTryOnSubject(); updatePhotoPreview(null); toast('Foto eliminada', 'info');
  });
  $('#tryon-generate') && $('#tryon-generate').addEventListener('click', runTryOn);
  $('#tryon-clear-look') && $('#tryon-clear-look').addEventListener('click', () => { SLOTS.forEach((c) => STATE.look[c] = null); renderLook(); renderCatalog(); });
}

function buildGarmentDescription(p) {
  const region = p.categoria === 'inferior' ? 'lower-body' : 'upper-body';
  return `a ${p.color.nombre.toLowerCase()} ${region} ${p.nombre.toLowerCase()} by ${p.marca}`;
}

function wireEngineToggle() {
  $('#mode-demo') && $('#mode-demo').addEventListener('click', () => setEngineMode('demo'));
  $('#mode-ia') && $('#mode-ia').addEventListener('click', () => {
    if (STATE.mode !== 'live') { toast('Para usar IA, configura REPLICATE_API_TOKEN en .env', 'info', 5000); return; }
    setEngineMode('ia');
  });
}

function setEngineMode(mode) {
  if (mode === 'ia' && STATE.mode !== 'live') mode = 'demo';
  STATE.engineMode = mode;
  $('#mode-demo') && $('#mode-demo').classList.toggle('on', mode === 'demo');
  $('#mode-ia') && $('#mode-ia').classList.toggle('on', mode === 'ia');
  $('#mode-ia') && $('#mode-ia').classList.toggle('locked', STATE.mode !== 'live');
  const badge = $('#mode-badge');
  if (badge) {
    const ia = mode === 'ia';
    badge.classList.toggle('live', ia);
    badge.innerHTML = `<span class="badge-dot"></span>${ia ? 'GENERADOR IA' : 'MODO DEMO'}`;
    badge.title = ia ? `IDM-VTON vía Replicate (${STATE.features.tryonModel || 'idm-vton'})` : 'Vista previa instantánea, sin coste';
  }
  const hint = $('#tryon-mode-hint');
  if (hint) hint.textContent = mode === 'ia'
    ? 'IA real: viste tu foto con IDM-VTON (prenda superior e inferior).'
    : 'Demo: vista del look completo al instante, sin coste ni esperas.';
}

async function runTryOn() {
  const items = getLookGarments();
  if (!items.length) return toast('Añade al menos una prenda a tu look', 'error');
  const subjectSrc = STATE.profile?.foto || 'assets/demo/subject.svg';
  const useIA = STATE.engineMode === 'ia' && STATE.mode === 'live';
  const stage = $('#tryon-stage'), resultBox = $('#tryon-result');
  stage && stage.classList.add('scanning');
  resultBox.innerHTML = loaderHTML(useIA ? 'Vistiendo tu foto con IA…' : 'Generando tu look…');
  $('#tryon-generate').disabled = true;
  try {
    let humanImage = subjectSrc;
    if (useIA) humanImage = subjectSrc.startsWith('data:') ? await ImageUtil.resizeDataURL(subjectSrc, 1024) : await ImageUtil.urlToPngDataURL(subjectSrc, 1024);
    const garments = [];
    for (const p of items) {
      const g = { category: p.categoria, name: p.nombre, brand: p.marca, color: p.color.hex, description: buildGarmentDescription(p) };
      if (useIA && URBAN.TRYABLE.includes(p.categoria)) {
        g.image = p.imagen.startsWith('data:') ? await ImageUtil.resizeDataURL(p.imagen, 768) : await ImageUtil.urlToPngDataURL(p.imagen, 768);
      }
      garments.push(g);
    }
    const data = await API.tryon({ humanImage, garments, forceDemo: !useIA });
    STATE.lastResult = data.resultImage;
    renderTryOnResult(subjectSrc, data, items, useIA);
    if (data.mode === 'live') toast('Look generado con IA ✓', 'success');
    else if (data.mode === 'demo-fallback') toast('IA no disponible; te muestro la vista demo', 'info', 5000);
    else toast('Look generado ✓', 'success');
  } catch (e) {
    toast('No se pudo generar: ' + e.message, 'error');
    resultBox.innerHTML = `<p class="muted center">No se pudo generar. ${esc(e.message)}</p>`;
  } finally {
    stage && stage.classList.remove('scanning');
    $('#tryon-generate').disabled = false;
  }
}

function renderTryOnResult(beforeSrc, data, items, useIA) {
  const box = $('#tryon-result');
  const badge = data.mode === 'live' ? '<span class="result-badge live">CON IA</span>' : '<span class="result-badge">DEMO</span>';
  const pieces = items.map((p) => `<div class="result-piece" title="${esc(p.nombre)}"><img src="${esc(p.imagen)}" alt=""/><span>${esc(p.marca)}</span></div>`).join('');
  const note = useIA && items.some((p) => !URBAN.TRYABLE.includes(p.categoria))
    ? '<p class="muted small center">Calzado y accesorios se muestran como referencia del look (la IA viste superior e inferior).</p>' : '';
  box.innerHTML = `
    <div class="ba-grid">
      <figure class="ba-cell"><img src="${esc(beforeSrc)}" alt="Antes"/><figcaption>Antes</figcaption></figure>
      <div class="ba-arrow">→</div>
      <figure class="ba-cell after"><img src="${esc(data.resultImage)}" alt="Después"/><figcaption>Tu look ${badge}</figcaption></figure>
    </div>
    <div class="result-pieces">${pieces}</div>
    <div class="result-actions">
      <a class="btn btn-mini" href="${esc(data.resultImage)}" download="urban-style-look.png" target="_blank" rel="noopener">Descargar</a>
      <button class="btn btn-mini btn-ghost" id="tryon-more">Seguir añadiendo</button>
    </div>
    ${note}
    ${data.message ? `<p class="muted small center">${esc(data.message)}</p>` : ''}`;
  $('#tryon-more') && $('#tryon-more').addEventListener('click', () => showView('catalogo'));
}

/* ── DEMO RÁPIDA ── */
function wireQuickDemo() { $$('[data-quickdemo]').forEach((b) => b.addEventListener('click', quickDemo)); }

async function quickDemo() {
  if (!STATE.profile) loadDemoProfile('demo-andres');
  const demo = ['top-prada-shirt', 'bottom-zara-jeans', 'shoe-nike-sneaker', 'acc-dior-sunglasses'];
  SLOTS.forEach((c) => STATE.look[c] = null);
  demo.forEach((id) => { const p = URBAN.findProduct(id); if (p) { addToBasket(id); STATE.look[p.categoria] = id; } });
  setEngineMode('demo');
  renderLook(); renderBasket(); renderCatalog();
  showView('probador');
  toast('Demo lista: generando tu look…', 'info');
  setTimeout(runTryOn, 350);
}

function loaderHTML(text) { return `<div class="loader"><div class="loader-ring"></div><p>${esc(text)}</p></div>`; }
