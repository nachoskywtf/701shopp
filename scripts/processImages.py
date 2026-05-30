import os
import sys
from PIL import Image

try:
    import rembg
except ImportError:
    print("rembg no está instalado. Instalando...")
    os.system("pip install rembg pillow")
    import rembg

def process_image(input_path, output_path):
    print(f"Procesando: {input_path}")
    
    # Abrir la imagen original
    try:
        orig_img = Image.open(input_path)
    except Exception as e:
        print(f"Error abriendo {input_path}: {e}")
        return False
        
    orig_img = orig_img.convert("RGBA")
    
    # 1. Remover el fondo con U2Net
    try:
        print("Removiendo fondo...")
        subject_img = rembg.remove(orig_img)
    except Exception as e:
        print(f"Error en rembg: {e}")
        return False

    # 2. Obtener el bounding box del objeto real para recortar píxeles transparentes
    bbox = subject_img.getbbox()
    if bbox:
        subject_img = subject_img.crop(bbox)
    
    # 3. Crear lienzo 1200x1200 blanco
    CANVAS_SIZE = 1200
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 255))
    
    # 4. Escalar al 85% del lienzo (1020x1020) manteniendo proporción
    TARGET_SIZE = int(CANVAS_SIZE * 0.85)
    
    # Calcular escala
    w, h = subject_img.size
    scale = min(TARGET_SIZE / w, TARGET_SIZE / h)
    new_w, new_h = int(w * scale), int(h * scale)
    
    # Redimensionar usando LANCZOS (alta calidad)
    subject_img = subject_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 5. Centrar en el lienzo
    paste_x = (CANVAS_SIZE - new_w) // 2
    paste_y = (CANVAS_SIZE - new_h) // 2
    
    # Pegar usando la misma imagen como máscara para la transparencia
    canvas.paste(subject_img, (paste_x, paste_y), subject_img)
    
    # Guardar como JPEG con fondo blanco puro
    final_img = canvas.convert("RGB")
    final_img.save(output_path, "JPEG", quality=95)
    
    # Verificación de esquinas (blanco puro)
    corners = [
        final_img.getpixel((0, 0)),
        final_img.getpixel((CANVAS_SIZE-1, 0)),
        final_img.getpixel((0, CANVAS_SIZE-1)),
        final_img.getpixel((CANVAS_SIZE-1, CANVAS_SIZE-1))
    ]
    
    assert all(c == (255, 255, 255) for c in corners), "Error: Las esquinas no son blanco puro."
    
    print(f"OK Guardado: {output_path} (1200x1200, centrado al 85%, fondo #FFFFFF)")
    return True

if __name__ == "__main__":
    PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "img", "perfumes"))
    
    # Las 7 imágenes corregidas
    targets = [
        ("valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer", "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer_fix3.jpg"),
        ("azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp", "azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp_fix4.jpg"),
        ("lattafa_asad_man_100ml_edp", "lattafa_asad_man_100ml_edp_fix4.jpg"),
        ("givenchy_gentleman_eau_de_toilette_intense_100ml", "givenchy_gentleman_eau_de_toilette_intense_100ml_fix4.jpg"),
        ("paco_rabanne_phantom_intense_edp_intense_100_ml_hombre", "paco_rabanne_phantom_intense_edp_intense_100_ml_hombre_fix4.jpg"),
        ("armaf_club_de_nuit_intense_man_105ml_edt", "armaf_club_de_nuit_intense_man_105ml_edt_fix4.jpg"),
        ("maison_alhambra_jean_lowe_inmortal_edp_30_ml", "maison_alhambra_jean_lowe_inmortal_edp_30_ml_fix4.jpg"),
    ]
    
    for folder, filename in targets:
        input_path = os.path.join(PUBLIC_DIR, folder, filename)
        if os.path.exists(input_path):
            # Guardamos sobrescribiendo la misma imagen
            process_image(input_path, input_path)
        else:
            print(f"WARN No encontrado: {input_path}")
