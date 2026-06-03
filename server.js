/**
 *  URBAN STYLE · Backend (Node.js + Express)
 *  Probador virtual. Endpoints:
 *    GET  /api/health     → estado (replicate / openai)
 *    POST /api/tryon      → look completo (IDM-VTON en cadena) o vista demo
 *    POST /api/outfits    → outfits (OpenAI o reglas)
 *    POST /api/recommend  → consejos de talla/estilo (OpenAI o reglas)
 *    POST /api/upload     → subida de imagen de producto (admin)
 *  Todo funciona sin claves (modo demo). El catálogo viaja en el body.
 */

require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const { mapCategory, ruleRecommend, ruleOutfits, buildDemoLookSVG } = require('./lib/engine');

const app = express();

const PORT = process.env.PORT || 3000;
const REPLICATE_API_TOKEN = (process.env.REPLICATE_API_TOKEN || '').trim();
const REPLICATE_TRYON_MODEL = (process.env.REPLICATE_TRYON_MODEL || 'cuuupid/idm-vton').trim();
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const HAS_REPLICATE = REPLICATE_API_TOKEN.length > 0;
const HAS_OPENAI = OPENAI_API_KEY.length > 0;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'img').replace(/[^a-z0-9.\-_]/gi, '_');
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)) });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runReplicateTryOn({ humanImage, garmentImage, garmentDescription }) {
  const [owner, name] = REPLICATE_TRYON_MODEL.split('/');
  const endpoint = `https://api.replicate.com/v1/models/${owner}/${name}/predictions`;
  const input = {
    human_img: humanImage, garm_img: garmentImage, garment_des: garmentDescription || 'fashion garment',
    is_checked: true, is_checked_crop: false, denoise_steps: 30, seed: 42,
  };
  const headers = { Authorization: `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait' };
  const createRes = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ input }) });
  if (!createRes.ok) { const d = await createRes.text(); throw new Error(`Replicate ${createRes.status}: ${d.slice(0, 300)}`); }
  let prediction = await createRes.json();
  const pollUrl = prediction.urls && prediction.urls.get;
  let attempts = 0;
  while (pollUrl && !['succeeded', 'failed', 'canceled'].includes(prediction.status) && attempts < 60) {
    await sleep(2000); attempts++;
    const pr = await fetch(pollUrl, { headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` } });
    prediction = await pr.json();
  }
  if (prediction.status !== 'succeeded') throw new Error(prediction.error || `Estado: ${prediction.status}`);
  const out = prediction.output;
  const url = Array.isArray(out) ? out[out.length - 1] : out;
  if (!url) throw new Error('Replicate no devolvió imagen.');
  return { url };
}

async function runOpenAIJSON(systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL, temperature: 0.7, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) { const d = await res.text(); throw new Error(`OpenAI ${res.status}: ${d.slice(0, 300)}`); }
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: HAS_REPLICATE ? 'live' : 'demo',
    features: { replicate: HAS_REPLICATE, openai: HAS_OPENAI, tryonModel: REPLICATE_TRYON_MODEL },
    timestamp: new Date().toISOString() });
});

// Look completo: en IA, encadena las prendas de cuerpo con IDM-VTON.
app.post('/api/tryon', async (req, res) => {
  const { humanImage, forceDemo } = req.body || {};
  let garments = Array.isArray(req.body && req.body.garments) ? req.body.garments : [];
  if (!garments.length && req.body && req.body.category) {
    garments = [{ category: req.body.category, name: req.body.garmentName, brand: req.body.brand,
      color: req.body.color, image: req.body.garmentImage, description: req.body.garmentDescription }];
  }
  if (!humanImage) return res.status(400).json({ ok: false, error: 'Falta la foto de la persona (humanImage).' });
  if (!garments.length) return res.status(400).json({ ok: false, error: 'Añade al menos una prenda al look.' });

  const demoMode = !HAS_REPLICATE || forceDemo === true;
  if (demoMode) {
    return res.json({ ok: true, mode: 'demo', resultImage: buildDemoLookSVG(garments),
      applied: garments.map((g) => g.category),
      message: HAS_REPLICATE ? 'Vista demo del look completo.' : 'Vista demo. Modo IA Proximamente.' });
  }

  const bodyOrder = ['superior', 'inferior'];
  const body = bodyOrder.map((cat) => garments.find((g) => g.category === cat && g.image)).filter(Boolean);
  if (!body.length) {
    return res.json({ ok: true, mode: 'demo-fallback', resultImage: buildDemoLookSVG(garments),
      message: 'El try-on con IA necesita una prenda superior o inferior. Mostrando vista demo del look.' });
  }
  try {
    let current = humanImage;
    const applied = [];
    for (const g of body) {
      const desc = g.description || `${g.name || 'garment'} by ${g.brand || 'brand'}, ${mapCategory(g.category).replace('_', ' ')}`;
      const { url } = await runReplicateTryOn({ humanImage: current, garmentImage: g.image, garmentDescription: desc });
      current = url;
      applied.push(g.category);
    }
    res.json({ ok: true, mode: 'live', resultImage: current, applied });
  } catch (err) {
    console.error('[tryon] error:', err.message);
    res.status(200).json({ ok: true, mode: 'demo-fallback', resultImage: buildDemoLookSVG(garments),
      error: err.message, message: 'El try-on con IA falló; mostrando vista demo del look.' });
  }
});

app.post('/api/outfits', async (req, res) => {
  const { profile = {}, catalog = [], occasion, style } = req.body || {};
  if (HAS_OPENAI && catalog.length) {
    try {
      const system = 'Eres un estilista. Devuelves SOLO JSON {"outfits":[{"id","nombre","tipo","itemIds":[ids del catálogo],"colores":[],"explicacion"}]}. Usa solo IDs existentes. 3-4 outfits.';
      const user = JSON.stringify({ perfil: profile, ocasion: occasion || profile.ocasion, estilo: style || profile.estilo,
        catalogo: catalog.map((p) => ({ id: p.id, nombre: p.nombre, marca: p.marca, categoria: p.categoria, color: p.color, estilo: p.estilo, ocasion: p.ocasion })) });
      const out = await runOpenAIJSON(system, user);
      return res.json({ ok: true, source: 'openai', ...out });
    } catch (err) { console.error('[outfits] OpenAI->reglas:', err.message); }
  }
  res.json({ ok: true, ...ruleOutfits(profile, catalog, occasion, style) });
});

app.post('/api/recommend', async (req, res) => {
  const { profile = {}, catalog = [], outfit } = req.body || {};
  if (HAS_OPENAI) {
    try {
      const system = 'Eres un asesor de imagen. Devuelves SOLO JSON {"styleDetected","sizes":{"superior","inferior","calzado"},"colors":[],"accessories":[],"reasoning"}. Claro y útil.';
      const out = await runOpenAIJSON(system, JSON.stringify({ perfil: profile, outfit: outfit || null }));
      return res.json({ ok: true, source: 'openai', ...out });
    } catch (err) { console.error('[recommend] OpenAI->reglas:', err.message); }
  }
  res.json({ ok: true, ...ruleRecommend(profile, catalog) });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No se recibió ninguna imagen.' });
  res.json({ ok: true, url: `/uploads/${req.file.filename}` });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n  URBAN STYLE  ·  http://localhost:' + PORT);
    console.log('  Try-On :', HAS_REPLICATE ? `IA (${REPLICATE_TRYON_MODEL})` : 'DEMO (sin token)');
    console.log('  Consejos:', HAS_OPENAI ? `IA (${OPENAI_MODEL})` : 'DEMO (reglas)\n');
  });
}
module.exports = app;
