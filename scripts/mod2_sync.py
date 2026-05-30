#!/usr/bin/env python3
"""
MODULO 2: SYNC AUTOMATICO
Valida que cada producto tenga su campo 'image' y 'images' correctamente
vinculados al archivo fisico en public/img/perfumes/.
Sincroniza public/productos.json con catalog_output.json.
"""

import os
import json
import shutil

ARCHIVO_DB = 'src/lib/catalog_output.json'
ARCHIVO_PUBLIC = os.path.join('public', 'productos.json')
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')


def sync_catalog():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    total = len(productos)
    vinculados = 0
    huerfanos = 0
    corregidos = 0

    print(f"{'='*60}")
    print(f"MODULO 2: SYNC AUTOMATICO")
    print(f"Productos en catalogo: {total}")
    print(f"{'='*60}")

    for producto in productos:
        images = producto.get('images', [])
        image_main = producto.get('image', '')

        # Validate each image path points to a real file
        valid_images = []
        for img_path in images:
            if not img_path:
                continue
            if img_path.startswith('/img/perfumes/'):
                rel = img_path.replace('/img/perfumes/', '')
                abs_path = os.path.join(CARPETA_DESTINO, rel.replace('/', os.sep))
                if os.path.exists(abs_path) and os.path.getsize(abs_path) > 10000:
                    valid_images.append(img_path)
                else:
                    huerfanos += 1
                    print(f"  [HUERFANO] {img_path} -> archivo no existe o es muy pequeno")

        # Update product
        if valid_images:
            producto['images'] = valid_images
            producto['image'] = valid_images[0]
            vinculados += 1
        else:
            # No valid images found - clear the fields
            producto['images'] = []
            producto['image'] = ""
            corregidos += 1

        # Ensure 'image' field matches first entry in 'images'
        if producto.get('images') and producto.get('image') != producto['images'][0]:
            producto['image'] = producto['images'][0]
            corregidos += 1

    # Save corrected catalog
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

    # Sync to public/productos.json for frontend access
    shutil.copy2(ARCHIVO_DB, ARCHIVO_PUBLIC)

    # Count final stats
    con_imagen = sum(1 for p in productos if p.get('images'))
    sin_imagen = total - con_imagen

    print(f"\n  Vinculados correctamente: {vinculados}")
    print(f"  Rutas huerfanas removidas: {huerfanos}")
    print(f"  Campos corregidos: {corregidos}")
    print(f"  Con imagen final: {con_imagen}")
    print(f"  Sin imagen final: {sin_imagen}")
    print(f"\n  catalog_output.json -> ACTUALIZADO")
    print(f"  public/productos.json -> SINCRONIZADO")
    print(f"\nSync completado.")


if __name__ == "__main__":
    sync_catalog()
