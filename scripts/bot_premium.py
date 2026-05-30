#!/usr/bin/env python3
"""
BOT PREMIUM v2 - 100% Local, 0 API dependencies
Stack: DDGS + rembg (U2Net local AI) + Pillow + Strict Heuristics
No Gemini needed. OCR replaced by ultra-strict text matching on URL + title + page metadata.
"""

import os
import json
import time
import requests
import re
import unicodedata
from io import BytesIO
from PIL import Image
from rembg import remove
from ddgs import DDGS

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}

# Words to ignore when building keyword sets for matching
PALABRAS_IGNORADAS = {
    "100", "50", "150", "200", "30", "75", "90", "80", "60", "125", "120",
    "ml", "edp", "edt", "parfum", "hombre", "mujer", "unisex", "spray",
    "tester", "de", "la", "le", "el", "eau", "for", "men", "women", "man",
    "woman", "pour", "homme", "femme", "him", "her", "set", "gift",
}

# Flanker keywords that MUST match exactly if present in product name
# Only critical variants that truly distinguish different perfumes
FLANKERS = ["elixir", "intense", "absolu", "extreme", "sport", "privee",
            "royal", "legend", "ultra"]

# Flankers that should match bidirectionally (if in image but not product = reject)
STRICT_FLANKERS = ["elixir", "intense", "absolu", "extreme", "sport"]

# Trusted retail domains (prioritized sources)
TRUSTED_DOMAINS = [
    "sephora.com", "falabella.com", "notino.es", "notino.com",
    "macys.com", "nordstrom.com", "ulta.com", "dior.com",
    "chanel.com", "yslbeauty.com", "armanibeauty.com",
    "parfumo.com",
]

# Domains to NEVER download from
BANNED_DOMAINS = [
    "pinterest.com", "pinterest.cl", "ebay.com", "aliexpress.com",
    "mercadolibre.com", "amazon.com", "reddit.com", "tiktok.com",
    "facebook.com", "instagram.com", "twitter.com",
]


def slugify(nombre):
    t = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode("ascii")
    t = re.sub(r"[^\w\s-]", "", t).strip().lower()
    return re.sub(r"[\s_]+", "_", t)[:80] or "perfume"


def get_perfume_details(raw_name):
    """Parse: BRAND;PRODUCT NAME ;STATUS; $RETAIL ; $PRICE"""
    parts = raw_name.split(";")
    brand = parts[0].strip() if len(parts) > 0 else ""
    name = parts[1].strip() if len(parts) > 1 else raw_name.strip()

    # Extract concentration
    conc = ""
    for c in ["ELIXIR", "INTENSE", "ABSOLU", "EXTREME", "SPORT",
              "PARFUM", "EDP", "EDT", "COLOGNE", "EXTRAIT"]:
        if c in name.upper():
            conc = c
            break

    # Extract volume
    vol = ""
    vol_match = re.search(r'(\d+)\s*ML', name.upper())
    if vol_match:
        vol = vol_match.group(1)

    return brand, name, conc, vol


def build_keyword_set(name):
    """Build the set of significant keywords from a product name."""
    cleaned = name.lower().replace('-', ' ').replace('_', ' ').replace("'", "").replace("`", "")
    words = cleaned.split()
    return [w for w in words if w not in PALABRAS_IGNORADAS and len(w) > 1]


def strict_match(name, brand, conc, img_url, img_title):
    """
    Ultra-strict heuristic matching. Returns (passed, reason).
    """
    n_lower = name.lower()
    combined_meta = (img_url + " " + img_title).lower()

    # 1. Check banned domains
    for banned in BANNED_DOMAINS:
        if banned in img_url.lower():
            return False, f"Dominio prohibido: {banned}"

    # 2. Build keyword set and require significant keywords to appear
    keywords = build_keyword_set(name)

    # Brand check: try multiple slug formats common in URLs
    brand_lower = brand.lower()
    brand_slug_dash = brand_lower.replace(" ", "-")
    brand_slug_none = brand_lower.replace(" ", "")
    brand_slug_under = brand_lower.replace(" ", "_")
    brand_words = build_keyword_set(brand)
    
    # Common brand abbreviations
    BRAND_ABBREVS = {
        "calvin klein": ["ck", "calvinklein", "calvin-klein"],
        "yves saint laurent": ["ysl", "saintlaurent", "saint-laurent"],
        "carolina herrera": ["ch", "herrera"],
        "dolce & gabbana": ["dg", "d&g", "dolcegabbana", "dolce-gabbana"],
        "dolce gabbana": ["dg", "d&g", "dolcegabbana", "dolce-gabbana"],
        "ralph lauren": ["ralphlauren", "ralph-lauren"],
        "jean paul gaultier": ["jpg", "gaultier", "jean-paul-gaultier"],
        "giorgio armani": ["armani", "giorgioarmani"],
        "paco rabanne": ["rabanne", "pacorabanne", "paco-rabanne"],
        "hugo boss": ["boss", "hugoboss", "hugo-boss"],
        "van cleef & arpels": ["vanclef", "van-cleef"],
        "issey miyake": ["isseymiyake", "issey-miyake", "miyake"],
        "narciso rodriguez": ["narciso", "narcisorodriguez"],
        "antonio banderas": ["banderas", "antonio-banderas", "antoniobanderas"],
        "fragance world": ["fraganceworld", "fragrance-world", "fragranceworld"],
        "al haramain": ["alharamain", "al-haramain", "haramain"],
        "ariana grande": ["arianagrande", "ariana-grande"],
        "victoria secret": ["victoriassecret", "victoria-secret", "victoriasecret"],
        "abercrombie & fitch": ["abercrombie", "abercrombie-fitch"],
        "agua brava": ["aguabrava", "agua-brava"],
    }
    
    brand_found = False
    # Try exact slug variants
    for slug in [brand_slug_dash, brand_slug_none, brand_slug_under]:
        if slug in combined_meta:
            brand_found = True
            break
    
    # Try abbreviations
    if not brand_found:
        abbrevs = BRAND_ABBREVS.get(brand_lower, [])
        for ab in abbrevs:
            if ab in combined_meta:
                brand_found = True
                break

    # For multi-word brands, check if at least 1 significant word appears
    if not brand_found and brand_words:
        bw_found = sum(1 for bw in brand_words if bw in combined_meta)
        if bw_found >= 1:
            brand_found = True

    if not brand_found:
        return False, f"Marca '{brand}' no encontrada en metadata"

    # Require at least 2 significant keywords from name
    matched_count = 0
    for kw in keywords[:3]:
        if kw in combined_meta:
            matched_count += 1

    if matched_count < min(2, len(keywords)):
        return False, f"Solo {matched_count}/{min(2, len(keywords))} keywords coinciden"

    # 3. FLANKER STRICT CHECK: If product has a flanker word, it MUST appear in URL/title
    for fl in FLANKERS:
        if fl in n_lower:
            if fl not in combined_meta:
                return False, f"Flanker '{fl}' esta en producto pero NO en imagen"

    # Also check reverse: if a STRICT flanker is in image but NOT in product
    for fl in STRICT_FLANKERS:
        if fl in combined_meta and fl not in n_lower:
            return False, f"Flanker '{fl}' esta en imagen pero NO en producto"

    # 4. Concentration check (only for special concentrations, not generic EDP/EDT)
    if conc and conc.lower() not in ["edp", "edt"]:
        if conc.lower() not in combined_meta:
            return False, f"Concentracion '{conc}' no encontrada"

    return True, "Aprobada por heuristica estricta"


def is_from_trusted_domain(url):
    """Check if URL is from a trusted retail domain."""
    for domain in TRUSTED_DOMAINS:
        if domain in url.lower():
            return True
    return False


def process_image_premium(img_content):
    """
    Full premium pipeline:
    1. Remove background with rembg (U2Net neural network)
    2. Center on 1200x1200 pure white canvas (#FFFFFF)
    3. Product occupies 85% of frame
    """
    # 1. Remove background
    try:
        no_bg_bytes = remove(img_content)
    except Exception as e:
        print(f"    [rembg error] {e}")
        return None

    # 2. Open and validate
    img = Image.open(BytesIO(no_bg_bytes)).convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        return None
    img_cropped = img.crop(bbox)

    w, h = img_cropped.size
    if w < 100 or h < 100:
        return None  # Too small, likely garbage

    # 3. Calculate size for 85% of 1200x1200
    target_size = 1200
    max_dim = int(target_size * 0.85)  # 1020

    ratio = min(max_dim / w, max_dim / h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)

    img_resized = img_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 4. Paste on pure white #FFFFFF
    final = Image.new("RGB", (target_size, target_size), (255, 255, 255))
    paste_x = (target_size - new_w) // 2
    paste_y = (target_size - new_h) // 2
    final.paste(img_resized, (paste_x, paste_y), img_resized)

    # 5. Validate: check corners are white (no leftover artifacts)
    corners = [
        final.getpixel((5, 5)),
        final.getpixel((target_size - 5, 5)),
        final.getpixel((5, target_size - 5)),
        final.getpixel((target_size - 5, target_size - 5)),
    ]
    for corner in corners:
        r, g, b = corner
        if r < 240 or g < 240 or b < 240:
            return None  # Corner not white enough, background removal failed

    # Save to buffer
    buf = BytesIO()
    final.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def run_premium_bot():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    total = len(productos)
    procesados = 0
    exitosos = 0
    fallidos = 0

    with DDGS() as ddgs:
        for index, producto in enumerate(productos):
            raw_name = producto.get('name', '')
            brand, name, conc, vol = get_perfume_details(raw_name)
            if not name:
                continue

            # Skip products that already have valid premium images
            existing_images = producto.get('images', [])
            if existing_images and len(existing_images) >= 1:
                # Check if the image file actually exists
                first_img = existing_images[0]
                if first_img.startswith('/img/perfumes/'):
                    rel = first_img.replace('/img/perfumes/', '')
                    abs_path = os.path.join(CARPETA_DESTINO, rel.replace('/', os.sep))
                    if os.path.exists(abs_path):
                        # Quick quality check: is it at least 50KB?
                        if os.path.getsize(abs_path) > 50000:
                            continue

            procesados += 1
            print(f"\n[{index+1}/{total}] {brand} - {name}")

            slug = slugify(name)
            ruta_local = os.path.join(CARPETA_DESTINO, slug)
            os.makedirs(ruta_local, exist_ok=True)

            # Hierarchical queries
            queries = [
                f'"{name}" {brand} perfume bottle site:sephora.com OR site:falabella.com OR site:notino.es OR site:macys.com',
                f'"{name}" {brand} perfume bottle white background -pinterest -ebay -aliexpress -amazon -mercadolibre',
                f'{name} {brand} fragrance product photo -pinterest -ebay -aliexpress -amazon -mercadolibre -reddit',
            ]

            fotos_aprobadas = []

            for qi, query in enumerate(queries):
                if fotos_aprobadas:
                    break  # One perfect photo is enough

                print(f"  Q{qi+1}: {query[:70]}...")
                try:
                    resultados = list(ddgs.images(query, safesearch="strict", size="Large", max_results=8))
                except Exception as e:
                    print(f"  [DDGS error] {e}")
                    time.sleep(3)
                    continue

                # Sort: trusted domains first
                resultados.sort(key=lambda x: 0 if is_from_trusted_domain(x.get('image', '')) else 1)

                for img_data in resultados:
                    if fotos_aprobadas:
                        break

                    img_url = img_data.get('image', '')
                    img_title = img_data.get('title', '')
                    if not img_url:
                        continue

                    # Pre-filter: strict text match
                    passed, reason = strict_match(name, brand, conc, img_url, img_title)
                    if not passed:
                        print(f"    [SKIP] {reason}")
                        continue

                    # Download
                    try:
                        print(f"    [DL] Descargando de {'[TRUSTED] ' if is_from_trusted_domain(img_url) else ''}{img_url[:60]}...")
                        req = requests.get(img_url, headers=HEADERS, timeout=10)
                        if req.status_code != 200 or len(req.content) < 15000:
                            print(f"    [SKIP] Imagen muy pequena o error HTTP ({req.status_code})")
                            continue

                        # Process: rembg + canvas
                        print(f"    [AI] Procesando con rembg + canvas 1200x1200...")
                        processed = process_image_premium(req.content)
                        if not processed:
                            print(f"    [SKIP] Fallo en procesamiento (fondo no limpio o imagen corrupta)")
                            continue

                        # Save
                        nombre_archivo = f"{slug}_1.jpg"
                        ruta_fisica = os.path.join(ruta_local, nombre_archivo)
                        with open(ruta_fisica, 'wb') as f_img:
                            f_img.write(processed)

                        ruta_web = f"/img/perfumes/{slug}/{nombre_archivo}"
                        fotos_aprobadas.append(ruta_web)
                        print(f"    [OK] Guardada: {ruta_web} ({len(processed)//1024}KB)")

                    except Exception as e:
                        print(f"    [ERROR] {e}")

            # Update JSON
            if fotos_aprobadas:
                producto['images'] = fotos_aprobadas
                producto['image'] = fotos_aprobadas[0]
                exitosos += 1

                # Save incrementally
                with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
                    json.dump(productos, f, indent=4, ensure_ascii=False)
            else:
                fallidos += 1
                print(f"  [!] Sin imagen perfecta para {name}")

            # Anti-ban delay
            time.sleep(1.5)

    print(f"\n{'='*60}")
    print(f"RESULTADO FINAL")
    print(f"  Procesados: {procesados}")
    print(f"  Exitosos:   {exitosos}")
    print(f"  Fallidos:   {fallidos}")
    print(f"{'='*60}")


if __name__ == "__main__":
    run_premium_bot()
