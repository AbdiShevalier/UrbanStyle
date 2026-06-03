/* ──────────────────────────────────────────────────────────────
 *  URBAN STYLE · ui.js — estado, navegación, toasts, partículas.
 * ────────────────────────────────────────────────────────────── */

const STATE = {
  profile: null,
  basket: [],
  look: { superior: null, inferior: null, calzado: null, accesorios: null },
  lastResult: null,
  mode: 'demo',        // capacidad del backend: 'live' | 'demo'
  engineMode: 'demo',  // motor elegido: 'demo' | 'ia'
  features: {},
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showView(id) {
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + id));
  $$('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.view === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('#nav-links') && $('#nav-links').classList.remove('open');
  if (window.history && history.replaceState) history.replaceState(null, '', '#' + id);
}

function toast(message, type = 'info', ms = 3800) {
  const wrap = $('#toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, ms);
}

function openModal(html) { $('#modal-body').innerHTML = html; $('#modal').classList.add('open'); }
function closeModal() { $('#modal').classList.remove('open'); }

function saveProfile(profile) {
  STATE.profile = profile;
  try { localStorage.setItem(URBAN.STORAGE_KEYS.profile, JSON.stringify(profile)); } catch (e) {}
}
function loadProfile() {
  try { const p = JSON.parse(localStorage.getItem(URBAN.STORAGE_KEYS.profile)); if (p) STATE.profile = p; } catch (e) {}
  return STATE.profile;
}

function initParticles() {
  const canvas = $('#bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((w * h) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, a: Math.random() * 0.5 + 0.2,
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(25, 224, 224, ${p.a})`; ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); tick();
}

function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
    { threshold: 0.12 });
  $$('.reveal').forEach((el) => obs.observe(el));
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

window.STATE = STATE;
Object.assign(window, { $, $$, showView, toast, openModal, closeModal, saveProfile, loadProfile, initParticles, initReveal, esc });
