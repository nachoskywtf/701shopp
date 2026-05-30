import os
import sys
import json
import urllib.request
from PIL import Image
try:
    import rembg
except ImportError:
    os.system("pip install rembg pillow")
    import rembg

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "img", "perfumes"))
CATALOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "lib", "catalog_output.json"))
PUBLIC_CATALOG = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "productos.json"))

TARGETS = [
    {
        "id": "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer",
        "slug": "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer",
        "url": "https://www.vrperfumery.com/216182-pd4_def/donna-born-in-roma-green-stravaganza-edp-100ml.jpg"
    },
    {
        "id": "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp",
        "slug": "azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp",
        "url": "https://media.ulta.com/i/ulta/2579633cm_alt04?w=1000&h=1000&fmt=auto"
    },
    {
        "id": "lattafa-asad-man-100ml-edp",
        "slug": "lattafa_asad_man_100ml_edp",
        "url": "https://m.media-amazon.com/images/I/41sEt5JVj0L.jpg"
    },
    {
        "id": "givenchy-gentleman-eau-de-toilette-intense-100ml",
        "slug": "givenchy_gentleman_eau_de_toilette_intense_100ml",
        "url": "https://image-optimizer-reg.production.sephora-asia.net/images/product_images/zoom_3_Product_3274872423008-Givenchy-Gentleman-Eau-De-Toilette-Intense-100ml_decb865b12c6818daeca34a733594c243c2971e4_1619114243.png"
    },
    {
        "id": "paco-rabanne-phantom-intense-edp-intense-100-ml-hombre",
        "slug": "paco_rabanne_phantom_intense_edp_intense_100_ml_hombre",
        "url": "https://www.perfumenz.co.nz/cdn/shop/files/paco-phantom-intense_1554x1554.png?v=1720665614"
    },
    {
        "id": "maison-alhambra-jean-lowe-inmortal-edp-30-ml",
        "slug": "maison_alhambra_jean_lowe_inmortal_edp_30_ml",
        "url": "https://m.media-amazon.com/images/I/61NEu-tUeFL.jpg"
    }
]

def download_image(url, dest):
    print(f"Descargando {url} ...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as response, open(dest, 'wb') as out_file:
        out_file.write(response.read())

def process_image(input_path, output_path):
    print(f"Procesando con rembg: {input_path}")
    orig_img = Image.open(input_path).convert("RGBA")
    
    # 1. Remover fondo
    subject_img = rembg.remove(orig_img)
    
    # 2. Bounding box
    bbox = subject_img.getbbox()
    if bbox:
        subject_img = subject_img.crop(bbox)
        
    # 3. Canvas 1200x1200 #FFFFFF
    CANVAS_SIZE = 1200
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 255))
    
    # 4. Escalar al 85%
    TARGET_SIZE = int(CANVAS_SIZE * 0.85)
    w, h = subject_img.size
    scale = min(TARGET_SIZE / w, TARGET_SIZE / h)
    new_w, new_h = int(w * scale), int(h * scale)
    subject_img = subject_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 5. Centrar
    paste_x = (CANVAS_SIZE - new_w) // 2
    paste_y = (CANVAS_SIZE - new_h) // 2
    canvas.paste(subject_img, (paste_x, paste_y), subject_img)
    
    final_img = canvas.convert("RGB")
    final_img.save(output_path, "JPEG", quality=95)
    
    corners = [
        final_img.getpixel((0, 0)),
        final_img.getpixel((CANVAS_SIZE-1, 0)),
        final_img.getpixel((0, CANVAS_SIZE-1)),
        final_img.getpixel((CANVAS_SIZE-1, CANVAS_SIZE-1))
    ]
    assert all(c == (255, 255, 255) for c in corners), "Error: Las esquinas no son blanco puro."
    print(f"OK Guardado: {output_path}")
    return True

def main():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)
        
    updated = 0
    for t in TARGETS:
        dir_path = os.path.join(PUBLIC_DIR, t["slug"])
        os.makedirs(dir_path, exist_ok=True)
        
        tmp_path = os.path.join(dir_path, f"{t['slug']}_tmp.jpg")
        final_filename = f"{t['slug']}_final.jpg"
        final_path = os.path.join(dir_path, final_filename)
        rel_path = f"/img/perfumes/{t['slug']}/{final_filename}"
        
        try:
            download_image(t["url"], tmp_path)
            process_image(tmp_path, final_path)
            os.remove(tmp_path)
            
            for item in catalog:
                if item["id"] == t["id"]:
                    item["image"] = rel_path
                    item["images"] = [rel_path]
                    updated += 1
                    break
        except Exception as e:
            print(f"Error procesando {t['id']}: {e}")
            
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=4)
    with open(PUBLIC_CATALOG, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=4)
        
    print(f"Catálogo actualizado. {updated} imágenes procesadas con éxito.")

if __name__ == "__main__":
    main()
