import json
import os
import time
from playwright.sync_api import sync_playwright

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')

MALAS_FOTOS = [
    "TURATHI ELECTRIC",
    "SHADOW ICE",
    "AFNAN 9 PM"
]

def formatear_nombre_carpeta(nombre):
    caracteres_malos = [" ", "/", "\\", "&", "'", '"', "(", ")", "-"]
    nombre_limpio = nombre.lower()
    for char in caracteres_malos:
         nombre_limpio = nombre_limpio.replace(char, "_")
    while "__" in nombre_limpio:
        nombre_limpio = nombre_limpio.replace("__", "_")
    return nombre_limpio

def fix_bad_images():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        for index, producto in enumerate(productos):
            nombre = producto.get('name', '').split(';')[1].strip() if ';' in producto.get('name', '') else producto.get('name', '')
            
            # Check if this product is in our "bad photos" list
            if not any(m in nombre.upper() for m in MALAS_FOTOS):
                continue
                
            print(f"\nCorrigiendo: {nombre}")
            
            # Search query: very strict
            query = f'{nombre} perfume bottle isolated "white background"'
            search_url = f"https://www.google.com/search?tbm=isch&q={query.replace(' ', '+')}"
            
            try:
                page.goto(search_url)
                time.sleep(2)
                
                # Click first image
                page.locator('h3').first.click()
                time.sleep(2)
                
                # Extract high-res URL
                img_element = page.locator('img[src^="http"]').nth(1)
                img_url = img_element.get_attribute('src')
                
                if img_url:
                    print(f"Encontrada nueva foto: {img_url[:60]}...")
                    
                    # Descargar
                    import requests
                    req = requests.get(img_url, timeout=10)
                    if req.status_code == 200:
                        nombre_dir = formatear_nombre_carpeta(nombre)
                        ruta_dir = os.path.join(CARPETA_DESTINO, nombre_dir)
                        os.makedirs(ruta_dir, exist_ok=True)
                        
                        nombre_archivo = f"{nombre_dir}_fixed.jpg"
                        ruta_fisica = os.path.join(ruta_dir, nombre_archivo)
                        
                        with open(ruta_fisica, 'wb') as f_img:
                            f_img.write(req.content)
                            
                        ruta_web = f"/img/perfumes/{nombre_dir}/{nombre_archivo}"
                        producto['images'] = [ruta_web]
                        producto['image'] = ruta_web
                        print("Exito!")
            except Exception as e:
                print(f"Error: {e}")
                
        browser.close()

    # Save
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    fix_bad_images()
