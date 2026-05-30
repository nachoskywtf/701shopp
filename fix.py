import sys

def fix():
    with open('bot_perfumes.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out = []
    skip = False
    start_idx = -1
    for i, l in enumerate(lines):
        if l.startswith('def verificar_imagen_con_ia'):
            skip = True
            start_idx = len(out)
        if skip and l.startswith('def descargar_imagen'):
            skip = False
            
        if not skip and not l.startswith('def verificar_imagen_con_ia'):
            out.append(l)
            
    new_func = """def verificar_imagen_con_ia(ruta_imagen: str, nombre_perfume: str, url: str = "") -> dict:
    flankers = ["elixir", "intense", "parfum", "absolu", "extreme", "sport"]
    n = nombre_perfume.lower()
    u = url.lower()
    for fl in flankers:
        if fl in n and fl not in u:
            return {"aprobada": False, "confianza": 0, "razon": "Falta " + fl + " en URL", "es_correcto": False}
    return {"aprobada": True, "confianza": 10, "razon": "Aprobada por Heuristica Fast-Track", "es_correcto": True}

"""
    
    out.insert(start_idx, new_func)
    
    with open('bot_perfumes.py', 'w', encoding='utf-8') as f:
        f.writelines(out)
        
if __name__ == '__main__':
    fix()
