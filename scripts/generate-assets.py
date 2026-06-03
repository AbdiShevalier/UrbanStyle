#!/usr/bin/env python3
"""Genera imágenes SVG premium para el catálogo y avatares demo de Urban Style.
Sin fotos con copyright: ilustraciones vectoriales limpias estilo boutique.
Uso:  python3 scripts/generate-assets.py
"""
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
PROD = os.path.join(BASE, "productos")
DEMO = os.path.join(BASE, "demo")
os.makedirs(PROD, exist_ok=True)
os.makedirs(DEMO, exist_ok=True)

def frame(inner, accent="#caa85a", brand="", name=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f3ea"/><stop offset="1" stop-color="#ece4d6"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ece4d6" stop-opacity="0"/>
    </radialGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#7a6a4a" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="300" rx="240" ry="240" fill="url(#vig)"/>
  <g filter="url(#sh)">{inner}</g>
  <rect x="34" y="34" width="120" height="3" fill="{accent}" opacity="0.8"/>
  <text x="34" y="560" font-family="Montserrat,Arial" font-size="15" letter-spacing="4"
        fill="#8a7a55">{brand.upper()}</text>
  <text x="34" y="582" font-family="Georgia,serif" font-size="13" fill="#b6a988">{name}</text>
</svg>'''

def top_shape(c, c2):
    return f'''
    <g transform="translate(300,250)">
      <path d="M-110,-70 L-60,-110 L0,-86 L60,-110 L110,-70 L78,-30 L70,150 L-70,150 L-78,-30 Z"
            fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M-60,-110 L0,-86 L-6,10 Z" fill="{c2}" opacity="0.18"/>
      <path d="M60,-110 L0,-86 L6,10 Z" fill="{c2}" opacity="0.10"/>
      <path d="M-110,-70 L-150,40 L-120,70 L-78,-20 Z" fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M110,-70 L150,40 L120,70 L78,-20 Z" fill="{c}" stroke="{c2}" stroke-width="3"/>
      <line x1="0" y1="-80" x2="0" y2="150" stroke="{c2}" stroke-width="2" opacity="0.4"/>
      <circle cx="0" cy="20" r="4" fill="{c2}" opacity="0.6"/>
      <circle cx="0" cy="70" r="4" fill="{c2}" opacity="0.6"/>
    </g>'''

def bottom_shape(c, c2):
    return f'''
    <g transform="translate(300,210)">
      <path d="M-70,-30 L70,-30 L74,0 L80,30 L36,30 L18,200 L-18,200 L-2,40 L-18,200 L-54,200 Z"
            fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M-70,-30 L70,-30 L72,-10 L-72,-10 Z" fill="{c2}" opacity="0.25"/>
      <line x1="0" y1="0" x2="0" y2="40" stroke="{c2}" stroke-width="2" opacity="0.4"/>
    </g>'''

def shoe_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <path d="M-150,30 C-150,-10 -110,-30 -60,-34 C-20,-38 30,-50 70,-50
               C120,-50 150,-20 150,20 L150,42 L-150,42 Z"
            fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M-150,42 L150,42 L150,58 L-150,58 Z" fill="{c2}"/>
      <path d="M-60,-34 C-30,-26 0,-30 40,-44" fill="none" stroke="{c2}" stroke-width="3" opacity="0.5"/>
      <circle cx="-40" cy="0" r="4" fill="#ffffff" opacity="0.7"/>
      <circle cx="-10" cy="-6" r="4" fill="#ffffff" opacity="0.7"/>
      <circle cx="20" cy="-12" r="4" fill="#ffffff" opacity="0.7"/>
    </g>'''

def heel_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <path d="M-130,-20 C-70,-30 30,-34 120,-30 C150,-28 150,4 100,8
               L-60,30 C-110,38 -150,20 -130,-20 Z" fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M-60,30 L-50,90 L-66,92 L-86,34 Z" fill="{c2}"/>
      <path d="M-130,-20 C-70,-30 30,-34 120,-30" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
    </g>'''

def watch_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <rect x="-26" y="-150" width="52" height="120" rx="20" fill="{c2}" opacity="0.85"/>
      <rect x="-26" y="30" width="52" height="120" rx="20" fill="{c2}" opacity="0.85"/>
      <circle cx="0" cy="0" r="74" fill="{c}" stroke="{c2}" stroke-width="6"/>
      <circle cx="0" cy="0" r="58" fill="#0d1b22"/>
      <line x1="0" y1="0" x2="0" y2="-38" stroke="{c}" stroke-width="4"/>
      <line x1="0" y1="0" x2="28" y2="10" stroke="{c}" stroke-width="4"/>
      <circle cx="0" cy="0" r="5" fill="{c}"/>
    </g>'''

def bag_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <path d="M-110,-30 L110,-30 L96,150 L-96,150 Z" fill="{c}" stroke="{c2}" stroke-width="3"/>
      <path d="M-70,-30 C-70,-100 70,-100 70,-30" fill="none" stroke="{c2}" stroke-width="10"/>
      <rect x="-22" y="-30" width="44" height="60" rx="8" fill="{c2}" opacity="0.4"/>
      <rect x="-12" y="6" width="24" height="16" rx="4" fill="{c2}"/>
    </g>'''

def glasses_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <rect x="-150" y="-50" width="120" height="90" rx="26" fill="{c}" stroke="{c2}" stroke-width="5"/>
      <rect x="30" y="-50" width="120" height="90" rx="26" fill="{c}" stroke="{c2}" stroke-width="5"/>
      <line x1="-30" y1="-30" x2="30" y2="-30" stroke="{c2}" stroke-width="8"/>
      <line x1="-150" y1="-36" x2="-200" y2="-52" stroke="{c2}" stroke-width="8"/>
      <line x1="150" y1="-36" x2="200" y2="-52" stroke="{c2}" stroke-width="8"/>
    </g>'''

def belt_shape(c, c2):
    return f'''
    <g transform="translate(300,300)">
      <rect x="-200" y="-26" width="400" height="52" rx="10" fill="{c}" stroke="{c2}" stroke-width="3"/>
      <rect x="-40" y="-46" width="80" height="92" rx="12" fill="{c2}"/>
      <rect x="-24" y="-30" width="48" height="60" rx="6" fill="{c}"/>
      <circle cx="120" cy="0" r="6" fill="{c2}"/>
      <circle cx="150" cy="0" r="6" fill="{c2}"/>
    </g>'''

SHAPES = {
    "top": top_shape, "bottom": bottom_shape, "sneaker": shoe_shape,
    "heel": heel_shape, "watch": watch_shape, "bag": bag_shape,
    "glasses": glasses_shape, "belt": belt_shape,
}

def darken(hexc, f=0.6):
    hexc = hexc.lstrip("#")
    r, g, b = int(hexc[0:2], 16), int(hexc[2:4], 16), int(hexc[4:6], 16)
    return "#%02x%02x%02x" % (int(r * f), int(g * f), int(b * f))

# Catálogo (debe coincidir con public/js/data.js)
PRODUCTS = [
    ("top-dior-trench", "Dior", "Trench Atelier", "top", "#c9b48d"),
    ("top-valentino-blazer", "Valentino", "Blazer Couture", "top", "#1c1c20"),
    ("top-gucci-knit", "Gucci", "Knit Heritage", "top", "#5d6b4a"),
    ("top-zara-tshirt", "Zara", "Camiseta Essential", "top", "#f2efe9"),
    ("top-prada-shirt", "Prada", "Camisa Lineas", "top", "#1f6f78"),
    ("top-nike-hoodie", "Nike", "Tech Hoodie", "top", "#3a3f47"),
    ("bottom-prada-trousers", "Prada", "Pantalon Sartorial", "bottom", "#15151a"),
    ("bottom-zara-jeans", "Zara", "Jean Slim", "bottom", "#33526e"),
    ("bottom-gucci-skirt", "Gucci", "Falda Plisada", "bottom", "#cdbb96"),
    ("bottom-nike-jogger", "Nike", "Jogger Tech", "bottom", "#22252b"),
    ("bottom-valentino-pants", "Valentino", "Pantalon Crema", "bottom", "#ece3d0"),
    ("shoe-nike-sneaker", "Nike", "Air Statement", "sneaker", "#f4f4f4"),
    ("shoe-gucci-loafer", "Gucci", "Mocasin Oro", "sneaker", "#1a1a1d"),
    ("shoe-valentino-heel", "Valentino", "Tacon Rockstud", "heel", "#7a1f2b"),
    ("shoe-lv-boot", "Louis Vuitton", "Botin Monogram", "sneaker", "#5b4226"),
    ("acc-cartier-watch", "Cartier", "Tank Or", "watch", "#caa85a"),
    ("acc-lv-bag", "Louis Vuitton", "Bolso Capucines", "bag", "#6b4a2b"),
    ("acc-dior-sunglasses", "Dior", "Gafas Solar", "glasses", "#15151a"),
    ("acc-gucci-belt", "Gucci", "Cinturon GG", "belt", "#1a1a1d"),
]

for pid, brand, name, shape, color in PRODUCTS:
    inner = SHAPES[shape](color, darken(color, 0.55))
    with open(os.path.join(PROD, f"{pid}.svg"), "w", encoding="utf-8") as f:
        f.write(frame(inner, brand=brand, name=name))

def avatar(skin, hair, top, bottom, label):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="760" viewBox="0 0 480 760">
  <defs>
    <linearGradient id="abg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16323b"/><stop offset="1" stop-color="#0d1b22"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="22%" r="40%">
      <stop offset="0" stop-color="#19e0e0" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#19e0e0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="760" fill="url(#abg)"/>
  <ellipse cx="240" cy="170" rx="170" ry="170" fill="url(#halo)"/>
  <g transform="translate(240,130)">
    <path d="M-42,-30 C-42,-86 42,-86 42,-30 C42,2 24,30 0,30 C-24,30 -42,2 -42,-30 Z" fill="{hair}"/>
    <circle cx="0" cy="0" r="40" fill="{skin}"/>
    <path d="M-40,-26 C-40,-78 40,-78 40,-26 C28,-44 -28,-44 -40,-26 Z" fill="{hair}"/>
    <rect x="-14" y="36" width="28" height="26" fill="{skin}"/>
    <path d="M-70,70 L70,70 L92,250 L-92,250 Z" fill="{top}"/>
    <path d="M-70,70 L-110,210 L-82,224 L-50,96 Z" fill="{top}"/>
    <path d="M70,70 L110,210 L82,224 L50,96 Z" fill="{top}"/>
    <path d="M-82,250 L-8,250 L-16,520 L-72,520 Z" fill="{bottom}"/>
    <path d="M8,250 L82,250 L72,520 L16,520 Z" fill="{bottom}"/>
    <rect x="-74" y="520" width="62" height="26" rx="8" fill="#d8c089"/>
    <rect x="14" y="520" width="62" height="26" rx="8" fill="#d8c089"/>
  </g>
  <rect x="30" y="30" width="56" height="3" fill="#19e0e0" opacity="0.8"/>
  <text x="30" y="720" font-family="Montserrat,Arial" font-size="16" letter-spacing="3"
        fill="#d6f7f7">{label.upper()}</text>
</svg>'''

with open(os.path.join(DEMO, "avatar-1.svg"), "w", encoding="utf-8") as f:
    f.write(avatar("#e7c6a5", "#2b2118", "#1f6f78", "#1a1a1d", "Perfil Demo · Andrés"))
with open(os.path.join(DEMO, "avatar-2.svg"), "w", encoding="utf-8") as f:
    f.write(avatar("#ead7c2", "#3a2a1c", "#7a1f2b", "#15151a", "Perfil Demo · Camila"))
with open(os.path.join(DEMO, "subject.svg"), "w", encoding="utf-8") as f:
    f.write(avatar("#e7c6a5", "#241a12", "#2b2f38", "#23262f", "Sujeto Demo"))

print("Generados:", len(PRODUCTS), "productos +", 3, "avatares demo")
