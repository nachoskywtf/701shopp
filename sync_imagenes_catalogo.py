#!/usr/bin/env python3
"""
sync_imagenes_catalogo.py
Sincroniza las imágenes descargadas por bot_perfumes.py (701/imagenes_perfumes/)
con el catálogo del sitio web (src/lib/catalog_output.json + public/img/perfumes/).

USO: python -X utf8 sync_imagenes_catalogo.py
"""

import os, sys, json, re, shutil, unicodedata

CARPETA_DESCARGADAS = os.path.join("701", "imagenes_perfumes")
CARPETA_WEB = os.path.join("public", "img", "perfumes")
ARCHIVO_CATALOGO = os.path.join("src", "lib", "catalog_output.json")


def slugify(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii","ignore").decode("ascii")
    t = re.sub(r"[^\w\s-]","",t).strip().lower()
    return re.sub(r"[\s_]+","_",t)[:80] or "perfume"


def extraer_nombre_del_campo_name(raw_name):
    """Extrae el nombre del perfume del formato 'MARCA;NOMBRE ;ESTADO; $PRECIO ; $PRECIO'"""
    if ";" in raw_name:
        parts = raw_name.split(";")
        if len(parts) >= 2:
            return parts[1].strip()
    return raw_name.strip()


def main():
    if not os.path.exists(CARPETA_DESCARGADAS):
        print(f"No existe {CARPETA_DESCARGADAS}. Ejecuta bot_perfumes.py primero.")
        return

    if not os.path.exists(ARCHIVO_CATALOGO):
        print(f"No existe {ARCHIVO_CATALOGO}.")
        return

    os.makedirs(CARPETA_WEB, exist_ok=True)

    # Indexar imagenes descargadas: slug -> [archivos]
    descargadas = {}
    for f in os.listdir(CARPETA_DESCARGADAS):
        if f.lower().endswith(".jpg"):
            m = re.match(r"^(.+)_(\d+)\.jpg$", f, re.I)
            if m:
                slug = m.group(1)
                descargadas.setdefault(slug, []).append(f)

    # Ordenar cada grupo
    for slug in descargadas:
        descargadas[slug].sort()

    print(f"Imagenes descargadas: {sum(len(v) for v in descargadas.values())} archivos para {len(descargadas)} perfumes")

    # Cargar catalogo
    with open(ARCHIVO_CATALOGO, "r", encoding="utf-8") as f:
        catalogo = json.load(f)

    actualizados = 0
    copiados = 0

    for item in catalogo:
        raw_name = item.get("name", "")
        nombre_perfume = extraer_nombre_del_campo_name(raw_name)
        slug = slugify(nombre_perfume)

        if slug not in descargadas:
            continue

        archivos = descargadas[slug]
        rutas_web = []

        for archivo in archivos:
            src = os.path.join(CARPETA_DESCARGADAS, archivo)
            dst = os.path.join(CARPETA_WEB, archivo)

            # Copiar a public/img/perfumes/
            if not os.path.exists(dst):
                shutil.copy2(src, dst)
                copiados += 1

            rutas_web.append(f"/img/perfumes/{archivo}")

        # Actualizar JSON
        if rutas_web:
            item["image"] = rutas_web[0]
            item["images"] = rutas_web
            actualizados += 1

    # Guardar catalogo actualizado
    with open(ARCHIVO_CATALOGO, "w", encoding="utf-8") as f:
        json.dump(catalogo, f, indent=2, ensure_ascii=False)

    print(f"Catalogo actualizado: {actualizados} productos con nuevas imagenes")
    print(f"Archivos copiados a {CARPETA_WEB}: {copiados}")
    print("Listo! Ejecuta 'npm run dev' para ver los resultados.")


if __name__ == "__main__":
    main()
