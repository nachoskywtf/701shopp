import json
import os

ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_DESTINO = os.path.join('public', 'img', 'perfumes')

def clean_galleries():
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        productos = json.load(f)

    productos_actualizados = 0
    archivos_eliminados = 0

    for producto in productos:
        imagenes = producto.get('images', [])
        if len(imagenes) > 1:
            # Keep only the first image
            img_principal = imagenes[0]
            
            # Identify secondary images to delete
            for img_secundaria in imagenes[1:]:
                # img_secundaria might be like "/img/perfumes/afnan_9_pm/afnan_9_pm_2.jpg"
                if img_secundaria.startswith('/img/perfumes/'):
                    ruta_relativa = img_secundaria.replace('/img/perfumes/', '')
                    ruta_absoluta = os.path.join(CARPETA_DESTINO, ruta_relativa.replace('/', os.sep))
                    
                    if os.path.exists(ruta_absoluta):
                        try:
                            os.remove(ruta_absoluta)
                            archivos_eliminados += 1
                        except Exception as e:
                            print(f"Error eliminando {ruta_absoluta}: {e}")

            # Update JSON
            producto['images'] = [img_principal]
            productos_actualizados += 1

    # Save JSON
    with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
        json.dump(productos, f, indent=4, ensure_ascii=False)

    print(f"Limpieza completada. {productos_actualizados} galerias truncadas.")
    print(f"Archivos eliminados físicamente: {archivos_eliminados}")

if __name__ == "__main__":
    clean_galleries()
