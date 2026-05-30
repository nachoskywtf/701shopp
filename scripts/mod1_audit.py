#!/usr/bin/env python3
"""
MODULO 1: AUDITORIA DE INTEGRIDAD DE DATOS
Cruza los 796 productos contra la carpeta de salida.
Detecta SKUs sin imagen, imágenes corruptas (<40KB), y archivos ilegibles.
Genera un reporte y reintenta los faltantes con queries alternativas.
"""

import os
import json
import time
import re
import unicodedata
import requests
from io import BytesIO
from PIL import Image
from rembg import remove
from ddgs import DDGS

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')
MIN_SIZE_BYTES = 40 * 1024  # 40KB minimum
LOG_FILE = 'audit_report.log'

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
}

PALABRAS_IGNORADAS = {
    "100", "50", "150", "200", "30", "75", "90", "80", "60", "125", "120",
    "ml", "edp", "edt", "parfum", "hombre", "mujer", "unisex", "spray",
    "tester", "de", "la", "le", "el", "eau", "for", "men", "women", "man",
    "woman", "pour", "homme", "femme", "him", "her", "set", "gift",
}


def slugify(nombre):
    t = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode("ascii")
    t = re.sub(r"[^\w\s-]", "", t).strip().lower()
    return re.sub(r"[\s_]+", "_", t)[:80] or "perfume"


def process_image_premium(img_content):
    """Remove background and center on 1200x1200 white canvas."""
    try:
        no_bg = remove(img_content)
    except:
        return None
    img = Image.open(BytesIO(no_bg)).convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    w, h = cropped.size
    if w < 100 or h < 100:
        return None
    target = 1200
    max_dim = int(target * 0.85)
    ratio = min(max_dim / w, max_dim / h)
    nw, nh = int(w * ratio), int(h * ratio)
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    final = Image.new("RGB", (target, target), (255, 255, 255))
    final.paste(resized, ((target - nw) // 2, (target - nh) // 2), resized)
    # Validate corners
    for cx, cy in [(5, 5), (target-5, 5), (5, target-5), (target-5, target-5)]:
        r, g, b = final.getpixel((cx, cy))
        if r < 240 or g < 240 or b < 240:
            return None
    buf = BytesIO()
    final.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def audit_and_repair():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    total = len(productos)
    faltantes = []
    corruptos = []
    ok_count = 0

    print(f"{'='*60}")
    print(f"MODULO 1: AUDITORIA DE INTEGRIDAD")
    print(f"Total productos en catalogo: {total}")
    print(f"{'='*60}")

    # Phase 1: Check existence and corruption
    for producto in productos:
        raw_name = producto.get('name', '')
        parts = raw_name.split(';')
        name = parts[1].strip() if len(parts) > 1 else raw_name.strip()
        brand = parts[0].strip() if len(parts) > 0 else ""
        pid = producto.get('id', name)

        images = producto.get('images', [])
        if not images or not images[0]:
            faltantes.append((producto, brand, name))
            continue

        img_path = images[0]
        if img_path.startswith('/img/perfumes/'):
            rel = img_path.replace('/img/perfumes/', '')
            abs_path = os.path.join(CARPETA_DESTINO, rel.replace('/', os.sep))
        else:
            abs_path = None

        if not abs_path or not os.path.exists(abs_path):
            faltantes.append((producto, brand, name))
            continue

        # Corruption check
        file_size = os.path.getsize(abs_path)
        if file_size < MIN_SIZE_BYTES:
            corruptos.append((producto, brand, name, abs_path, file_size))
            continue

        # Readability check
        try:
            img = Image.open(abs_path)
            img.verify()
            ok_count += 1
        except Exception:
            corruptos.append((producto, brand, name, abs_path, file_size))

    print(f"\n  Imagenes OK:       {ok_count}")
    print(f"  SKUs sin imagen:   {len(faltantes)}")
    print(f"  Imagenes corruptas: {len(corruptos)}")

    # Phase 2: Remove corrupt images and add to retry list
    retry_list = list(faltantes)  # (producto, brand, name)
    for producto, brand, name, abs_path, size in corruptos:
        print(f"  [CORRUPT] {name} ({size//1024}KB) -> eliminando {abs_path}")
        try:
            os.remove(abs_path)
        except:
            pass
        producto['images'] = []
        producto['image'] = ""
        retry_list.append((producto, brand, name))

    print(f"\n  Total a reintentar: {len(retry_list)}")

    # Phase 3: Retry with alternative queries
    if retry_list:
        print(f"\n--- REINTENTO FORZADO ({len(retry_list)} SKUs) ---")
        reparados = 0

        with DDGS() as ddgs:
            for i, (producto, brand, name) in enumerate(retry_list):
                print(f"\n  [{i+1}/{len(retry_list)}] Reintentando: {brand} - {name}")

                slug = slugify(name)
                ruta_local = os.path.join(CARPETA_DESTINO, slug)
                os.makedirs(ruta_local, exist_ok=True)

                # Alternative queries: broader, less strict
                alt_queries = [
                    f'{name} {brand} perfume bottle -pinterest -ebay -amazon',
                    f'{name} perfume product photo -pinterest -ebay -amazon -aliexpress',
                    f'{brand} {name.split()[0] if name.split() else name} perfume -pinterest -ebay',
                ]

                found = False
                for qi, query in enumerate(alt_queries):
                    if found:
                        break
                    try:
                        results = list(ddgs.images(query, safesearch="strict", size="Large", max_results=5))
                    except Exception as e:
                        print(f"    [DDGS error] {e}")
                        time.sleep(3)
                        continue

                    for img_data in results:
                        if found:
                            break
                        img_url = img_data.get('image', '')
                        if not img_url:
                            continue

                        # Banned domains
                        banned = ["pinterest.com", "ebay.com", "aliexpress.com",
                                  "mercadolibre.com", "amazon.com", "reddit.com",
                                  "tiktok.com", "facebook.com", "instagram.com"]
                        if any(b in img_url.lower() for b in banned):
                            continue

                        try:
                            req = requests.get(img_url, headers=HEADERS, timeout=10)
                            if req.status_code != 200 or len(req.content) < 15000:
                                continue

                            processed = process_image_premium(req.content)
                            if not processed:
                                continue

                            archivo = f"{slug}_1.jpg"
                            ruta = os.path.join(ruta_local, archivo)
                            with open(ruta, 'wb') as f:
                                f.write(processed)

                            ruta_web = f"/img/perfumes/{slug}/{archivo}"
                            producto['images'] = [ruta_web]
                            producto['image'] = ruta_web
                            found = True
                            reparados += 1
                            print(f"    [REPARADO] {ruta_web} ({len(processed)//1024}KB)")
                        except:
                            continue

                if not found:
                    print(f"    [FALLO DEFINITIVO] No se pudo encontrar imagen para {name}")

                time.sleep(1.5)

        print(f"\n  Reparados: {reparados}/{len(retry_list)}")

    # Save final state
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

    # Write log
    with open(LOG_FILE, 'w', encoding='utf-8') as log:
        log.write(f"AUDITORIA DE INTEGRIDAD - REPORTE\n")
        log.write(f"{'='*50}\n")
        log.write(f"Total productos: {total}\n")
        log.write(f"OK: {ok_count}\n")
        log.write(f"Faltantes originales: {len(faltantes)}\n")
        log.write(f"Corruptos detectados: {len(corruptos)}\n")
        log.write(f"\nSKUs que fallaron definitivamente:\n")
        for producto, brand, name in retry_list:
            if not producto.get('images'):
                log.write(f"  - {brand} | {name}\n")

    print(f"\nAuditoria completada. Reporte guardado en {LOG_FILE}")
    return productos


if __name__ == "__main__":
    audit_and_repair()
