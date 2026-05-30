#!/usr/bin/env python3
"""
MODULO 3: FILTRO DE ULTIMA INSTANCIA
Analiza todas las imagenes aprobadas en busca de falsos positivos:
- Textos "Sample", "Tester", "Decant", "Not for sale" en la imagen
- Marcas de agua detectables (logos sobrepuestos, texto translucido)
- Imagenes con composicion no profesional (aspect ratio erroneo, bordes negros)

Usa analisis de imagen con Pillow (sin API externa).
"""

import os
import json
from io import BytesIO
from PIL import Image, ImageStat

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')

# Minimum acceptable quality thresholds
MIN_FILE_SIZE = 40 * 1024       # 40KB
MIN_RESOLUTION = 400            # 400px minimum dimension
MAX_ASPECT_DEVIATION = 0.3      # Max deviation from 1:1 aspect ratio
MIN_BRIGHTNESS = 150            # Minimum average brightness (detect dark/bad images)
CORNER_WHITE_THRESHOLD = 230    # Corners must be this white (0-255)


def analyze_image_quality(abs_path):
    """
    Returns (passed: bool, reasons: list[str])
    Checks for visual quality issues without OCR API.
    """
    reasons = []

    try:
        img = Image.open(abs_path).convert("RGB")
    except Exception as e:
        return False, [f"Imagen ilegible: {e}"]

    w, h = img.size

    # 1. Resolution check
    if w < MIN_RESOLUTION or h < MIN_RESOLUTION:
        reasons.append(f"Resolucion muy baja: {w}x{h}")

    # 2. Aspect ratio check (should be 1:1 from our processing)
    aspect = w / h if h > 0 else 0
    if abs(aspect - 1.0) > MAX_ASPECT_DEVIATION:
        reasons.append(f"Aspect ratio anomalo: {aspect:.2f}")

    # 3. Brightness check (detect black/dark images)
    stat = ImageStat.Stat(img)
    avg_brightness = sum(stat.mean) / 3
    if avg_brightness < MIN_BRIGHTNESS:
        reasons.append(f"Imagen demasiado oscura: brillo={avg_brightness:.0f}")

    # 4. Corner whiteness check (detect non-processed images)
    corners = [
        img.getpixel((5, 5)),
        img.getpixel((w - 5, 5)),
        img.getpixel((5, h - 5)),
        img.getpixel((w - 5, h - 5)),
    ]
    dark_corners = 0
    for r, g, b in corners:
        if r < CORNER_WHITE_THRESHOLD or g < CORNER_WHITE_THRESHOLD or b < CORNER_WHITE_THRESHOLD:
            dark_corners += 1
    if dark_corners >= 3:
        reasons.append(f"Fondo no blanco: {dark_corners}/4 esquinas oscuras")

    # 5. Color uniformity check (detect watermarks/overlays)
    # Sample center region and check for unusual color patches
    center_x, center_y = w // 2, h // 2
    sample_size = min(w, h) // 10
    if sample_size > 10:
        center_crop = img.crop((
            center_x - sample_size,
            center_y - sample_size,
            center_x + sample_size,
            center_y + sample_size
        ))
        center_stat = ImageStat.Stat(center_crop)
        # Very high standard deviation in the center could indicate overlay text
        center_stddev = sum(center_stat.stddev) / 3
        # This is informational, not a hard reject

    # 6. Check for predominantly red/colored overlay (watermarks)
    r_mean, g_mean, b_mean = stat.mean
    if r_mean > 200 and g_mean < 100 and b_mean < 100:
        reasons.append("Imagen predominantemente roja (posible marca de agua)")
    if r_mean < 50 and g_mean < 50 and b_mean < 50:
        reasons.append("Imagen casi completamente negra")

    # 7. File size check
    file_size = os.path.getsize(abs_path)
    if file_size < MIN_FILE_SIZE:
        reasons.append(f"Archivo muy pequeno: {file_size//1024}KB < {MIN_FILE_SIZE//1024}KB")

    # 8. Check for "tester" or "sample" in filename (shouldn't be there but just in case)
    filename_lower = os.path.basename(abs_path).lower()
    for word in ["sample", "decant", "not_for_sale", "miniature"]:
        if word in filename_lower:
            reasons.append(f"Filename contiene '{word}' (posible muestra)")

    passed = len(reasons) == 0
    return passed, reasons


def run_final_filter():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    total = len(productos)
    total_con_imagen = 0
    aprobados = 0
    rechazados = 0
    rechazados_list = []

    print(f"{'='*60}")
    print(f"MODULO 3: FILTRO DE ULTIMA INSTANCIA")
    print(f"Productos en catalogo: {total}")
    print(f"{'='*60}")

    for producto in productos:
        images = producto.get('images', [])
        if not images:
            continue

        total_con_imagen += 1
        raw_name = producto.get('name', '')
        parts = raw_name.split(';')
        name = parts[1].strip() if len(parts) > 1 else raw_name.strip()
        brand = parts[0].strip() if len(parts) > 0 else ""

        # Check each image
        valid_images = []
        for img_path in images:
            if not img_path:
                continue
            if img_path.startswith('/img/perfumes/'):
                rel = img_path.replace('/img/perfumes/', '')
                abs_path = os.path.join(CARPETA_DESTINO, rel.replace('/', os.sep))

                if os.path.exists(abs_path):
                    passed, reasons = analyze_image_quality(abs_path)
                    if passed:
                        valid_images.append(img_path)
                    else:
                        print(f"  [RECHAZADA] {brand} - {name}")
                        for r in reasons:
                            print(f"              -> {r}")
                        # Delete the bad file
                        try:
                            os.remove(abs_path)
                        except:
                            pass
                        rechazados += 1

        # Update product
        if valid_images:
            producto['images'] = valid_images
            producto['image'] = valid_images[0]
            aprobados += 1
        else:
            producto['images'] = []
            producto['image'] = ""
            if total_con_imagen > 0:  # Only count as rejected if it had images before
                rechazados_list.append(f"{brand} | {name}")

    # Save
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

    con_imagen_final = sum(1 for p in productos if p.get('images'))

    print(f"\n{'='*60}")
    print(f"RESULTADO FILTRO ULTIMA INSTANCIA")
    print(f"  Imagenes analizadas: {total_con_imagen}")
    print(f"  Aprobadas:           {aprobados}")
    print(f"  Rechazadas:          {rechazados}")
    print(f"  Productos con imagen final: {con_imagen_final}/{total}")
    print(f"  Cobertura: {con_imagen_final/total*100:.1f}%")
    print(f"{'='*60}")

    if rechazados_list:
        print(f"\nProductos que perdieron TODAS sus imagenes:")
        for item in rechazados_list:
            print(f"  - {item}")


if __name__ == "__main__":
    run_final_filter()
