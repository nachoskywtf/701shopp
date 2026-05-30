import os
import json
import time
import requests
from ddgs import DDGS

# ==========================================
#  1. CONFIGURACIN DEL PROYECTO
# ==========================================
ARCHIVO_DB = 'src/lib/catalog_output.json'  # Ruta real de la base de datos
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')
FOTOS_POR_PRODUCTO = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# ==========================================
#  2. FUNCIONES UTILITARIAS
# ==========================================
def preparar_directorios():
    """Crea la carpeta principal si no existe."""
    if not os.path.exists(CARPETA_DESTINO):
        os.makedirs(CARPETA_DESTINO)

def formatear_nombre_carpeta(nombre):
    """Limpia el nombre del perfume para usarlo en carpetas y archivos."""
    caracteres_malos = [" ", "/", "\\", "&", "'", '"', "(", ")", "-"]
    nombre_limpio = nombre.lower()
    for char in caracteres_malos:
         nombre_limpio = nombre_limpio.replace(char, "_")
    # Eliminar guiones bajos duplicados
    while "__" in nombre_limpio:
        nombre_limpio = nombre_limpio.replace("__", "_")
    return nombre_limpio

# ==========================================
#  3. LGICA PRINCIPAL DEL SCRAPER
# ==========================================
def procesar_catalogo():
    preparar_directorios()
    
    # Intentar cargar la base de datos
    if not os.path.exists(ARCHIVO_DB):
        print(f" ERROR CRTICO: No se encontr el archivo '{ARCHIVO_DB}'.")
        return

    try:
        with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
            productos = json.load(f)
    except json.JSONDecodeError:
        print(f" ERROR CRTICO: El archivo '{ARCHIVO_DB}' no tiene un formato JSON vlido.")
        return

    cambios_realizados = False

    with DDGS() as ddgs:
        for index, producto in enumerate(productos):
            # Adaptado a la estructura real del JSON (name en lugar de nombre)
            raw_name = producto.get('name', '').strip()
            partes = raw_name.split(';')
            nombre_completo = partes[1].strip() if len(partes) > 1 else raw_name
            if not nombre_completo:
                continue

            # Saltar si ya tiene 3 imgenes vlidas
            if isinstance(producto.get('images'), list) and len(producto.get('images')) >= FOTOS_POR_PRODUCTO:
                continue

            print(f"\n Procesando: {nombre_completo}")
            
            # Consulta extremadamente estricta a tiendas profesionales para evitar marcas de agua o fotos caseras
            query = f'"{nombre_completo}" perfume (site:falabella.com OR site:sephora.com OR site:macys.com OR site:notino.es)'
            nombre_directorio = formatear_nombre_carpeta(nombre_completo)
            ruta_producto_local = os.path.join(CARPETA_DESTINO, nombre_directorio)
            os.makedirs(ruta_producto_local, exist_ok=True)

            rutas_front_end = []
            
            try:
                resultados = list(ddgs.images(query, safesearch="strict", size="Large", max_results=5))
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
                            # Heuristica estricta de palabras clave y Flankers
                            es_seguro = True
                            n_lower = nombre_completo.lower()
                            u_lower = img_url.lower()
                            t_lower = img_title.lower()
                            
                            palabras_ignoradas = {"100", "50", "150", "200", "30", "75", "90", "ml", "edp", "edt", "parfum", "hombre", "mujer", "unisex", "spray", "tester", "de", "la", "le", "el", "eau", "for", "men", "women"}
                            palabras_clave = [p for p in n_lower.replace('-', ' ').replace('_', ' ').split() if p not in palabras_ignoradas]
                            
                            for palabra in palabras_clave[:2]:
                                if palabra not in u_lower and palabra not in t_lower:
                                    es_seguro = False
                                    break
                            
                            if es_seguro:
                                for fl in ["elixir", "intense", "parfum", "absolu", "extreme", "sport"]:
                                    if fl in n_lower and fl not in u_lower and fl not in t_lower:
                                        es_seguro = False
                                        break
                            
                            if not es_seguro:
                                print(f"    Descartada por Heuristica (No coincide nombre o flanker): {img_url}")
                                continue

                            nombre_archivo = f"{nombre_directorio}_{fotos_guardadas + 1}.jpg"
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
                
                # Actualizar el registro en memoria si se bajaron fotos
                if rutas_front_end:
                    productos[index]['images'] = rutas_front_end
                    productos[index]['image'] = rutas_front_end[0]
                    cambios_realizados = True
                    try:
                        with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
                            json.dump(productos, f, indent=4, ensure_ascii=False)
                    except Exception as e:
                        pass

            except Exception as e_busqueda:
                print(f" Fallo al buscar {nombre_completo}: {e_busqueda}")

            time.sleep(1.5) # Pausa estricta anti-bloqueos

    # ==========================================
    #  4. GUARDADO DE DATOS
    # ==========================================
    if cambios_realizados:
        try:
            with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
                json.dump(productos, f, indent=4, ensure_ascii=False)
            print("\n BASE DE DATOS ACTUALIZADA CON XITO.")
        except Exception as e_guardado:
            print(f"\n Error al guardar la base de datos: {e_guardado}")
    else:
        print("\n Proceso terminado. No se realizaron modificaciones en la base de datos.")

if __name__ == "__main__":
    procesar_catalogo()
