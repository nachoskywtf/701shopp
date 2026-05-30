"""
perfume_image_scraper.py — Bot de imágenes para catálogo de perfumes
Dependencias: pip install requests duckduckgo-search Pillow tqdm colorama
"""

import os, sys, json, time, hashlib, logging, argparse, mimetypes
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image
from tqdm import tqdm
from colorama import init, Fore, Style
from duckduckgo_search import DDGS

init(autoreset=True)
logging.basicConfig(level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("scraper.log"), logging.StreamHandler(sys.stdout)])
logger = logging.getLogger(__name__)

DEFAULT_JSON   = "productos.json"
DEFAULT_OUTPUT = "public/img/perfumes"
MIN_IMAGES     = 3
MAX_CANDIDATES = 20
MIN_WIDTH      = 400
MIN_HEIGHT     = 400
REQUEST_TIMEOUT= 15
DELAY_BETWEEN  = 2.5
MAX_RETRIES    = 3
HEADERS = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
VALID_EXTENSIONS = {".jpg",".jpeg",".png",".webp"}
EXCLUDE_KEYWORDS = ["pinterest","instagram","people","woman","man","model","wearing","lifestyle","review","blog"]

def slugify(text):
    import unicodedata, re
    text = unicodedata.normalize("NFKD", text).encode("ascii","ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]","",text).strip().lower()
    return re.sub(r"[\s_]+"," ",text).replace(" ","_")

def build_query(nombre, marca):
    return f"{marca} {nombre} perfume bottle official isolated white background product photography"

def is_valid_url(url):
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http","https"): return False
        return not any(kw in url.lower() for kw in EXCLUDE_KEYWORDS)
    except: return False

def download_image(url, dest_path):
    for attempt in range(1, MAX_RETRIES+1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, stream=True, allow_redirects=True)
            resp.raise_for_status()
            if "image" not in resp.headers.get("Content-Type",""):
                return False
            tmp = dest_path.with_suffix(".tmp")
            with open(tmp,"wb") as f:
                for chunk in resp.iter_content(8192):
                    if chunk: f.write(chunk)
            try:
                with Image.open(tmp) as img:
                    if img.size[0] < MIN_WIDTH or img.size[1] < MIN_HEIGHT:
                        tmp.unlink(missing_ok=True); return False
                    ext = {"JPEG":".jpg","PNG":".png","WEBP":".webp"}.get(img.format,".jpg")
                    final = dest_path.with_suffix(ext)
                    if img.mode in ("RGBA","P"):
                        bg = Image.new("RGB", img.size, (255,255,255))
                        if img.mode=="P": img=img.convert("RGBA")
                        bg.paste(img, mask=img.split()[3] if img.mode=="RGBA" else None)
                        img=bg
                    elif img.mode != "RGB": img=img.convert("RGB")
                    img.save(final, quality=92, optimize=True)
                    tmp.unlink(missing_ok=True)
                    return True
            except Exception as e:
                logger.debug(f"Error imagen: {e}"); tmp.unlink(missing_ok=True); return False
        except requests.RequestException as e:
            logger.warning(f"Intento {attempt}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES: time.sleep(attempt*2)
    return False

def search_images(query, max_results=MAX_CANDIDATES):
    urls = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.images(query, region="wt-wt", safesearch="moderate",
                                  size="Large", color="White", type_image="photo",
                                  max_results=max_results):
                url = r.get("image","")
                if url and is_valid_url(url): urls.append(url)
    except Exception as e: logger.error(f"Búsqueda fallida: {e}")
    return urls

def scrape_product_images(nombre, marca, output_dir, min_images=MIN_IMAGES):
    slug = slugify(f"{marca}_{nombre}")
    product_dir = output_dir / slug
    product_dir.mkdir(parents=True, exist_ok=True)
    urls = search_images(build_query(nombre, marca))
    if not urls: return []
    saved, seen, index = [], set(), 0
    for url in urls:
        if len(saved) >= min_images: break
        h = hashlib.md5(url.encode()).hexdigest()[:8]
        if h in seen: continue
        seen.add(h)
        dest = product_dir / f"{slug}_{index+1}"
        if download_image(url, dest):
            for ext in VALID_EXTENSIONS:
                candidate = product_dir / f"{slug}_{index+1}{ext}"
                if candidate.exists():
                    rel = "/" + str(candidate.relative_to(output_dir.parent.parent)).replace("\\","/")
                    saved.append(rel); index += 1
                    logger.info(f"  ✅ {rel}"); break
    return saved

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", default=DEFAULT_JSON)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument("--min-images", default=MIN_IMAGES, type=int)
    parser.add_argument("--skip-existing", action="store_true")
    args = parser.parse_args()
    json_path, output_dir = Path(args.json), Path(args.output)
    if not json_path.exists(): sys.exit(f"No existe: {json_path}")
    with open(json_path, encoding="utf-8") as f: productos = json.load(f)
    output_dir.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(tqdm(productos, desc="Scraping", unit="producto")):
        nombre, marca = p.get("nombre",""), p.get("marca","")
        if not nombre or not marca: continue
        print(f"\n{Fore.CYAN}[{i+1}/{len(productos)}] {marca} — {nombre}{Style.RESET_ALL}")
        if args.skip_existing and p.get("imagenes"): continue
        imgs = scrape_product_images(nombre, marca, output_dir, args.min_images)
        if imgs:
            p["imagenes"] = imgs
            p["imagen_principal"] = imgs[0]
            print(f"{Fore.GREEN}  ✔ {len(imgs)} imágenes{Style.RESET_ALL}")
        else:
            if not p.get("imagenes"): p["imagenes"] = []; p["imagen_principal"] = None
            print(f"{Fore.RED}  ✘ Sin imágenes{Style.RESET_ALL}")
        with open(json_path,"w",encoding="utf-8") as f: json.dump(productos,f,ensure_ascii=False,indent=2)
        if i < len(productos)-1: time.sleep(DELAY_BETWEEN)
    print(f"\n{Fore.YELLOW}✅ JSON actualizado: {json_path.resolve()}{Style.RESET_ALL}")

if __name__ == "__main__": main()
