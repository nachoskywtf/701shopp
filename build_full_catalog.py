import csv
import json
import re

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_]+', '-', text)[:100]

def build():
    catalog = []
    with open('Precios Perfumes.csv', 'r', encoding='cp1252') as f:
        lines = f.readlines()
        for line in lines[1:]:
            line = line.strip()
            if not line: continue
            
            parts = line.split(';')
            if len(parts) < 2: continue
            
            name_full = parts[1].strip()
            slug = slugify(name_full)
            
            item = {
                "id": slug,
                "name": line,
                "image": "/logo.svg",
                "images": ["/logo.svg"],
                "notas": {"salida": "", "corazon": "", "fondo": ""},
                "duracion": "Larga duración",
                "uso": "Para toda ocasión"
            }
            catalog.append(item)
            
    with open('src/lib/catalog_output.json', 'w', encoding='utf-8') as out:
        json.dump(catalog, out, indent=2, ensure_ascii=False)
        
    print(f"✅ Catálogo de {len(catalog)} productos generado en src/lib/catalog_output.json")

if __name__ == '__main__':
    build()
