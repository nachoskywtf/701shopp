import os
import sys
import json
import urllib.request
from PIL import Image
import rembg

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "img", "perfumes"))
CATALOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "lib", "catalog_output.json"))
PUBLIC_CATALOG = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "productos.json"))

def download_image(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as response, open(dest, 'wb') as out_file:
        out_file.write(response.read())

def process_image(input_path, output_path):
    orig_img = Image.open(input_path).convert("RGBA")
    subject_img = rembg.remove(orig_img)
    bbox = subject_img.getbbox()
    if bbox:
        subject_img = subject_img.crop(bbox)
        
    CANVAS_SIZE = 1200
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 255))
    TARGET_SIZE = int(CANVAS_SIZE * 0.85)
    w, h = subject_img.size
    scale = min(TARGET_SIZE / w, TARGET_SIZE / h)
    new_w, new_h = int(w * scale), int(h * scale)
    subject_img = subject_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    paste_x = (CANVAS_SIZE - new_w) // 2
    paste_y = (CANVAS_SIZE - new_h) // 2
    canvas.paste(subject_img, (paste_x, paste_y), subject_img)
    
    final_img = canvas.convert("RGB")
    final_img.save(output_path, "JPEG", quality=95)
    print(f"OK Guardado: {output_path}")

def main():
    slug = "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer"
    id_val = "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer"
    # Added fake query params just to make sure we get the image
    url = "https://www.valentino-beauty.us/dw/image/v2/AAFM_PRD/on/demandware.static/-/Sites-valentino-master-catalog/default/dw8c751aea/RE-SIZED%20PDP/VLTN-BIR-GREEN-100ML-DONNA.jpg"
    
    dir_path = os.path.join(PUBLIC_DIR, slug)
    os.makedirs(dir_path, exist_ok=True)
    
    tmp_path = os.path.join(dir_path, f"{slug}_tmp.jpg")
    final_filename = f"{slug}_final.jpg"
    final_path = os.path.join(dir_path, final_filename)
    rel_path = f"/img/perfumes/{slug}/{final_filename}"
    
    download_image(url, tmp_path)
    process_image(tmp_path, final_path)
    os.remove(tmp_path)
    
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)
        
    for item in catalog:
        if item["id"] == id_val:
            item["image"] = rel_path
            item["images"] = [rel_path]
            break
            
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=4)
    with open(PUBLIC_CATALOG, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=4)
        
    print("Valentino actualizado con exito.")

if __name__ == "__main__":
    main()
