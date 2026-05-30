import json
import os
from PIL import Image

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')

def generate_angles():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    productos_procesados = 0

    for producto in productos:
        imagenes = producto.get('images', [])
        if len(imagenes) == 1:
            img_principal = imagenes[0]
            if img_principal.startswith('/img/perfumes/'):
                ruta_relativa = img_principal.replace('/img/perfumes/', '')
                ruta_absoluta = os.path.join(CARPETA_DESTINO, ruta_relativa.replace('/', os.sep))
                
                if os.path.exists(ruta_absoluta):
                    try:
                        img = Image.open(ruta_absoluta).convert('RGB')
                        w, h = img.size
                        
                        # We want a 1:1 aspect ratio zoom
                        crop_size = int(min(w, h) * 0.7)
                        
                        # Detail 1: Top (Cap)
                        left1 = (w - crop_size) // 2
                        top1 = int(h * 0.05) # Near top
                        right1 = left1 + crop_size
                        bottom1 = top1 + crop_size
                        
                        if bottom1 > h:
                            bottom1 = h
                            top1 = h - crop_size
                            
                        # Detail 2: Center/Label
                        left2 = (w - crop_size) // 2
                        top2 = int(h * 0.25)
                        right2 = left2 + crop_size
                        bottom2 = top2 + crop_size
                        
                        if bottom2 > h:
                            bottom2 = h
                            top2 = h - crop_size

                        img1 = img.crop((left1, top1, right1, bottom1))
                        img2 = img.crop((left2, top2, right2, bottom2))
                        
                        base_name, ext = os.path.splitext(ruta_absoluta)
                        ruta_det1 = f"{base_name}_det1{ext}"
                        ruta_det2 = f"{base_name}_det2{ext}"
                        
                        img1.save(ruta_det1, quality=90)
                        img2.save(ruta_det2, quality=90)
                        
                        # Rutas web
                        base_web, ext_web = os.path.splitext(img_principal)
                        web_det1 = f"{base_web}_det1{ext_web}"
                        web_det2 = f"{base_web}_det2{ext_web}"
                        
                        producto['images'].extend([web_det1, web_det2])
                        productos_procesados += 1
                    except Exception as e:
                        print(f"Error procesando {ruta_absoluta}: {e}")

    # Save JSON
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

    print(f"Macro-recortes generados exitosamente para {productos_procesados} productos.")

if __name__ == "__main__":
    generate_angles()
