# ✦ URBAN STYLE — Virtual Try-On Fashion-Tech

**Urban Style** es una solución *fashion-tech* de **Probador Digital (Virtual Try-On)** pensada para boutiques y marcas de moda premium. No es una tienda tradicional: es la capa tecnológica que permite a una tienda online dejar que sus clientes **vean cómo les queda realmente un outfit sobre su propio cuerpo antes de comprar** — aumentando la conversión y reduciendo las devoluciones por talla.

La característica central es el **cambio real de ropa sobre la foto del usuario** mediante modelos especializados (**IDM-VTON** vía Replicate), no overlays ni bloques superpuestos.

---

## ✨ Características

- **Probador real (look completo)** — IDM-VTON (Replicate) viste la foto con el outfit entero: aplica la prenda superior y luego la inferior **en cadena** (cada una sobre el resultado de la anterior), conservando rostro, pose y proporciones.
- **Canasto + look** — el canasto admite varias prendas (incluso del mismo tipo); el probador usa **una por tipo** (superior, inferior, calzado, accesorio). Cambia cualquiera con un clic.
- **Foto editable** — sube tu foto y bórrala cuando quieras; vuelve al sujeto demo.
- **Dos modos con un toggle** — **Demo** (vista del look completo al instante, sin coste) e **IA real** (IDM-VTON). Ideal para presentar: enseñas la demo y luego cambias a IA.
- **Perfil corporal** — foto + medidas (altura, pecho, cintura, cadera, hombros, pierna, calzado), complexión, estilo y ocasión.
- **Catálogo premium** — productos demo de Dior, Valentino, Gucci, Prada, Louis Vuitton, Zara, Nike y Cartier. Panel admin para subir, editar y borrar.
- **Outfits y consejos** — combinaciones por ocasión/estilo y consejos de talla, color y accesorios. Funcionan **incluso sin OpenAI** (motor interno).
- **Modo demo a prueba de fallos** — perfiles y outfits precargados + botón **"Probar demo"**: arma un look completo y lo genera en segundos, **sin claves de API**.
- **Diseño premium** — futurista, glassmorphism, glow, efecto *scan*, animaciones y 100% responsive.

---

## 🧠 Sobre el motor de Try-On (importante)

No existe una API de imagen de Claude/Anthropic para "vestir" personas — Claude genera texto, no imágenes. Para el cambio real de ropa, el estándar abierto mejor soportado es **IDM-VTON** (el que pediste), ejecutado en **Replicate**. OpenAI se usa **solo** para recomendaciones y generación de outfits, tal como en tu especificación.

En el Probador hay un **toggle Demo / IA**:

| Modo | Qué hace |
|------|----------|
| **Demo** | Dibuja el **look completo** al instante (maniquí vestido con todas las prendas + efecto scan). Sin coste ni esperas. Siempre disponible. |
| **IA real** | Viste tu foto con **IDM-VTON**: aplica superior e inferior en cadena. Requiere `REPLICATE_API_TOKEN` (si no, el botón queda bloqueado). |

Si la API de IA falla, el sistema cae automáticamente a la vista demo para no romper la presentación. El calzado y los accesorios se muestran en el look; la IA viste prenda superior e inferior (lo que soporta IDM-VTON).

> **Para resultados reales óptimos:** usa una **foto real de cuerpo completo** (buena luz, fondo simple) y una **foto real de la prenda** (tipo *flat-lay*/catálogo). Las ilustraciones SVG del catálogo demo sirven para mostrar el flujo, pero IDM-VTON rinde mejor con fotografías reales de producto.

---

## 🗂️ Estructura del proyecto

```
CUrbanStyle/                   (raíz del proyecto)
├── public/
│   ├── css/styles.css         # estilos premium (glassmorphism, glow, responsive)
│   ├── js/
│   │   ├── data.js            # catálogo, perfiles y outfits demo
│   │   ├── api.js             # cliente del backend + utilidades de imagen
│   │   ├── ui.js              # estado, navegación, toasts, partículas
│   │   └── app.js             # lógica de catálogo, perfil, outfits, probador…
│   ├── assets/
│   │   ├── demo/              # avatares y sujeto demo (SVG)
│   │   ├── productos/         # imágenes del catálogo (SVG)
│   │   └── generated/         # resultados generados (runtime)
│   └── index.html             # SPA
├── lib/engine.js              # lógica pura (reglas + vista previa) testeable
├── scripts/generate-assets.py # regenera los SVG del catálogo y avatares
├── test/engine.test.js        # pruebas unitarias del motor
├── uploads/                   # imágenes subidas por el admin (runtime)
├── server.js                  # backend Express + Replicate + OpenAI
├── package.json
├── .env.example
├── vercel.json                # deploy frontend (Vercel)
├── render.yaml                # deploy backend (Render)
└── README.md
```

---

## 🚀 Puesta en marcha

### 1. Requisitos
- Node.js **18+** (probado en Node 22)

### 2. Instalar
```bash
npm install
```

### 3. Configurar variables (opcional para la demo)
```bash
cp .env.example .env
```
Edita `.env`:
```env
PORT=3000
REPLICATE_API_TOKEN=r8_xxx          # opcional → activa el try-on real
REPLICATE_TRYON_MODEL=cuuupid/idm-vton
OPENAI_API_KEY=sk-xxx               # opcional → activa recomendaciones con IA
OPENAI_MODEL=gpt-4o-mini
```
- Token de Replicate: <https://replicate.com/account/api-tokens>
- Clave de OpenAI: <https://platform.openai.com/api-keys>

> Sin claves, la app arranca igualmente en **modo demo** completo.

### 4. Arrancar
```bash
npm start          # producción
npm run dev        # con recarga automática (node --watch)
```
Abre <http://localhost:3000>.

### 5. Pruebas
```bash
npm test           # pruebas unitarias del motor de reglas y vista previa
```

---

## 🔌 API (backend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/health` | Estado de integraciones (`live`/`demo`) |
| `POST` | `/api/tryon` | Virtual Try-On (IDM-VTON o vista previa demo) |
| `POST` | `/api/outfits` | Generador de outfits (OpenAI o motor de reglas) |
| `POST` | `/api/recommend` | Recomendaciones de estilo/talla |
| `POST` | `/api/upload` | Subida de imagen de producto (admin) |

**Ejemplo `/api/tryon`** (body JSON):
```json
{
  "humanImage": "data:image/png;base64,...",
  "garmentImage": "data:image/png;base64,...",
  "garmentName": "Camisa Líneas",
  "brand": "Prada",
  "color": "#1f6f78",
  "category": "superior",
  "garmentDescription": "a petrol blue upper-body shirt by Prada"
}
```
Respuesta:
```json
{ "ok": true, "mode": "live", "resultImage": "https://replicate.delivery/..." }
```

---

## ☁️ Despliegue

### Opción A — Todo en Render/Railway (recomendado, más simple)
El backend Express ya sirve el frontend. Despliega el repo completo como un servicio Node:
1. Sube el repo a GitHub.
2. En **Render** → *New Web Service* → selecciona el repo (detecta `render.yaml`).
3. Añade `REPLICATE_API_TOKEN` y `OPENAI_API_KEY` en *Environment*.
4. Deploy. El `PORT` lo asigna Render automáticamente.

> En **Railway** es equivalente: *New Project → Deploy from repo*, build `npm install`, start `npm start`, y añade las variables de entorno.

### Opción B — Frontend en Vercel + Backend en Render (separado)
1. Despliega el backend en Render (Opción A) y copia su URL pública, p. ej. `https://urban-style.onrender.com`.
2. En `public/index.html` define el backend:
   ```js
   window.URBAN_CONFIG = { apiBase: 'https://urban-style.onrender.com' };
   ```
3. Despliega en **Vercel** (detecta `vercel.json`, sirve `public/` como estático).
4. En el backend, ajusta `ALLOWED_ORIGIN` a la URL de Vercel.

---

## 📈 Escalabilidad (LocalStorage → Firebase/Supabase)

El estado de cliente (perfil, productos del admin) vive hoy en **LocalStorage** para que la demo funcione sin base de datos. La arquitectura está lista para migrar:
- **Perfiles / catálogo** → colección en Firestore o tabla en Supabase.
- **Imágenes** → Firebase Storage / Supabase Storage (sustituir `data:URL` por URLs públicas).
- **`/api/upload`** ya persiste a disco; cámbialo por subida a almacenamiento en la nube.

El backend es *stateless* (el catálogo viaja en el body), así que escala horizontalmente sin sesiones.

---

## 🧩 Regenerar los assets demo
```bash
python3 scripts/generate-assets.py
```
Genera los SVG de catálogo y avatares en `public/assets/`. Sin dependencias externas.

---

## 🛠️ Solución de problemas

- **El try-on muestra "vista previa demo"** → falta `REPLICATE_API_TOKEN` o la API falló. Revisa el token y la consola del servidor.
- **`Replicate 402 / 422`** → saldo insuficiente o entrada inválida; verifica que las imágenes lleguen como PNG y el modelo sea correcto.
- **Las recomendaciones dicen "motor interno"** → no hay `OPENAI_API_KEY`; es el fallback esperado.
- **Imágenes desalineadas** → usa fotos de cuerpo completo y de prenda en *flat-lay*; el sistema centra y redimensiona automáticamente.

---

## 📜 Licencia
MIT — proyecto demostrativo de fashion-tech. Las marcas citadas son referencias para fines educativos/demo.
