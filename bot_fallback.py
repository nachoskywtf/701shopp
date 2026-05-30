import os
import json
import time
import requests
from ddgs import DDGS

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')
FOTOS_POR_PRODUCTO = 2

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def formatear_nombre_carpeta(nombre):
    caracteres_malos = [" ", "/", "\\", "&", "'", '"', "(", ")", "-"]
    nombre_limpio = nombre.lower()
    for char in caracteres_malos:
         nombre_limpio = nombre_limpio.replace(char, "_")
    while "__" in nombre_limpio:
        nombre_limpio = nombre_limpio.replace("__", "_")
    return nombre_limpio

def run_fallback():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    with DDGS() as ddgs:
        for index, producto in enumerate(productos):
            if isinstance(producto.get('images'), list) and len(producto.get('images')) > 0:
                continue

            raw_name = producto.get('name', '').strip()
            partes = raw_name.split(';')
            nombre_completo = partes[1].strip() if len(partes) > 1 else raw_name
            if not nombre_completo:
                continue

            print(f"\n[Fallback] Procesando: {nombre_completo}")
            
            # Query for general web minus the bad sites
            query = f'"{nombre_completo}" fragrance bottle -fragrantica -mercadolibre -ebay -pinterest -amazon -reddit -aliexpress'
            nombre_directorio = formatear_nombre_carpeta(nombre_completo)
            ruta_producto_local = os.path.join(CARPETA_DESTINO, nombre_directorio)
            os.makedirs(ruta_producto_local, exist_ok=True)

            rutas_front_end = []
            
            try:
                resultados = list(ddgs.images(query, safesearch="strict", size="Large", max_results=8))
                fotos_guardadas = 0
                
                for img_data in resultados:
                    if fotos_guardadas >= FOTOS_POR_PRODUCTO:
                        break
                        
                    img_url = img_data.get('image')
                    img_title = img_data.get('title', '')
                    if not img_url:
                        continue
                        
                    try:
                        print(f"    Descargando intento {fotos_guardadas + 1}...")
                        req = requests.get(img_url, headers=HEADERS, timeout=8)
                        
                        if req.status_code == 200 and len(req.content) > 10000:
                            es_seguro = True
                            n_lower = nombre_completo.lower()
                            u_lower = img_url.lower()
                            t_lower = img_title.lower()
                            
                            palabras_ignoradas = {"100", "50", "150", "200", "30", "75", "90", "ml", "edp", "edt", "parfum", "hombre", "mujer", "unisex", "spray", "tester", "de", "la", "le", "el", "eau", "for", "men", "women"}
                            palabras_clave = [p for p in n_lower.replace('-', ' ').replace('_', ' ').split() if p not in palabras_ignoradas]
                            
                            # Fallback: Just require the first keyword
                            if len(palabras_clave) > 0:
                                palabra = palabras_clave[0]
                                if palabra not in u_lower and palabra not in t_lower:
                                    es_seguro = False
                            
                            if es_seguro:
                                for fl in ["elixir", "intense", "parfum", "absolu", "extreme", "sport"]:
                                    if fl in n_lower and fl not in u_lower and fl not in t_lower:
                                        es_seguro = False
                                        break
                            
                            if not es_seguro:
                                print(f"    Descartada por Heuristica Fallback: {img_url}")
                                continue

                            nombre_archivo = f"{nombre_directorio}_fb_{fotos_guardadas + 1}.jpg"
                            ruta_archivo_fisico = os.path.join(ruta_producto_local, nombre_archivo)
                            
                            with open(ruta_archivo_fisico, 'wb') as f_img:
                                f_img.write(req.content)
                                
                            ruta_web = f"/img/perfumes/{nombre_directorio}/{nombre_archivo}"
                            rutas_front_end.append(ruta_web)
                            fotos_guardadas += 1
                            print(f"    OK: {ruta_web}")
                        else:
                            print("    Imagen descartada (baja calidad o error).")
                    except Exception as e_descarga:
                        print(f"    Error al descargar: {e_descarga}")
                
                if rutas_front_end:
                    productos[index]['images'] = rutas_front_end
                    productos[index]['image'] = rutas_front_end[0]
                    try:
                        with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
                            json.dump(productos, f, indent=4, ensure_ascii=False)
                    except:
                        pass

            except Exception as e_busqueda:
                print(f" Fallo al buscar {nombre_completo}: {e_busqueda}")

            time.sleep(1.0)

if __name__ == "__main__":
    run_fallback()
