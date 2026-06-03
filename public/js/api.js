/* ──────────────────────────────────────────────────────────────
 *  URBAN STYLE · api.js
 *  Cliente del backend + utilidades de imagen.
 *  apiBase configurable (window.URBAN_CONFIG.apiBase) para deploy
 *  separado frontend (Vercel) / backend (Render).
 * ────────────────────────────────────────────────────────────── */

const API = (function () {
  const base = (window.URBAN_CONFIG && window.URBAN_CONFIG.apiBase) || '';

  async function call(pathname, options = {}) {
    const res = await fetch(base + pathname, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try { const j = await res.json(); msg = j.error || msg; } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }

  return {
    /** Estado de integraciones (live/demo). */
    health: () => call('/api/health'),

    /** Virtual Try-On. payload: {humanImage, garmentImage, garmentName, brand, color, category, garmentDescription} */
    tryon: (payload) => call('/api/tryon', { method: 'POST', body: JSON.stringify(payload) }),

    /** Generador de outfits. payload: {profile, catalog, occasion, style} */
    outfits: (payload) => call('/api/outfits', { method: 'POST', body: JSON.stringify(payload) }),

    /** Recomendaciones. payload: {profile, catalog, outfit} */
    recommend: (payload) => call('/api/recommend', { method: 'POST', body: JSON.stringify(payload) }),

    /** Subida de imagen de producto (multipart). file: File */
    upload: async (file) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(base + '/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Fallo al subir la imagen');
      return res.json();
    },
  };
})();

/* ── Utilidades de imagen ───────────────────────────────────── */
const ImageUtil = {
  /**
   * Lee un File y lo redimensiona a un data URL JPEG/PNG con lado máx.
   * Reduce el peso del payload y el coste/tiempo de la API.
   */
  fileToDataURL(file, maxSide = 1024, quality = 0.9) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => this.resizeDataURL(reader.result, maxSide, quality).then(resolve).catch(reject);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /** Redimensiona un data URL existente (rasteriza SVG a PNG si hace falta). */
  resizeDataURL(dataUrl, maxSide = 1024, quality = 0.9) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let { width, height } = img;
        if (Math.max(width, height) > maxSide) {
          const r = maxSide / Math.max(width, height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width || maxSide;
        canvas.height = height || maxSide;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // fondo limpio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const isPng = /image\/png|image\/svg/.test(dataUrl.slice(0, 30));
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  },

  /** Convierte la URL de una imagen (incl. SVG del catálogo) a PNG data URL. */
  urlToPngDataURL(url, maxSide = 768) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const r = Math.min(1, maxSide / Math.max(img.width || maxSide, img.height || maxSide));
        canvas.width = Math.round((img.width || maxSide) * r);
        canvas.height = Math.round((img.height || maxSide) * r);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  },
};

window.API = API;
window.ImageUtil = ImageUtil;
