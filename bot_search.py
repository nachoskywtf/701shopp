#!/usr/bin/env python3
"""
BOT SEARCH - BING ENGINE
Motor de scraping directo a Bing Images usando BeautifulSoup
Inmune a bloqueos de DuckDuckGo
"""

import os
import json
import time
import requests
from bs4 import BeautifulSoup
import re

# CASCADE: ARCHIVO REAL DE BASE DE DATOS (adaptado a la estructura real del proyecto)
ARCHIVO_DB = 'src/lib/catalog_output.json'
CARPETA_ASSETS = os.path.join('public', 'img', 'perfumes')

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
}

def limpiar_slug(texto):
    """Convierte texto a slug seguro para archivos."""
    if not texto:
        return ""
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9\s]', '_', texto)
    texto = re.sub(r'\s+', '_', texto).strip('_')
    return texto[:60]

def extraer_marca_nombre(item_name):
    """Extrae marca y nombre del formato 'BRAND;PRODUCT NAME ;...'"""
    if not item_name:
        return "", ""
    if ';' in item_name:
        parts = item_name.split(';')
        marca = parts[0].strip() if len(parts) > 0 else ""
        nombre = parts[1].strip() if len(parts) > 1 else item_name
        return marca, nombre
    return "", item_name

def buscar_imagen_bing(query):
    """Busca imágenes en Bing Images y devuelve lista de URLs."""
    url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}&qft=+filterui:imagesize-large"
    urls = []
    
    try:
        print(f"    🔎 Buscando en Bing: {query[:50]}...")
        res = requests.get(url, headers=HEADERS, timeout=15)
        
        if res.status_code != 200:
            print(f"    ⚠️  Bing respondió con status {res.status_code}")
            return urls
            
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Bing guarda URLs en atributo 'm' de enlaces con clase 'iusc'
        enlaces = soup.find_all('a', class_='iusc', limit=5)
        
        for enlace in enlaces:
            m_attr = enlace.get('m', '{}')
            try:
                m_data = json.loads(m_attr)
                if 'murl' in m_data:
                    img_url = m_data['murl']
                    if img_url.startswith('http'):
                        urls.append(img_url)
            except json.JSONDecodeError:
                continue
        
        # Fallback: buscar en src de imágenes
        if not urls:
            imgs = soup.find_all('img', limit=10)
            for img in imgs:
                src = img.get('src') or img.get('data-src')
                if src and src.startswith('http') and not src.startswith('data:'):
                    urls.append(src)
                    
    except Exception as e:
        print(f"    ❌ Error en Bing Scraper: {e}")
    
    return urls

def descargar_imagen(url, destino):
    """Descarga imagen desde URL y guarda en destino."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        res.raise_for_status()
        
        # Verificar tamaño mínimo
        content_length = res.headers.get('content-length')
        if content_length and int(content_length) < 10000:
            print(f"    ⚠️  Imagen muy pequeña ({content_length} bytes)")
            return False
        
        with open(destino, 'wb') as f:
            for chunk in res.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        # Verificar tamaño del archivo descargado
        if os.path.getsize(destino) < 10000:
            print(f"    ⚠️  Archivo descargado muy pequeño")
            os.remove(destino)
            return False
            
        return True
        
    except Exception as e:
        print(f"    ❌ Error descargando: {e}")
        return False

def ejecutar_bot():
    """Función principal del bot."""
    print("\n" + "="*70)
    print("🚀 INICIANDO BING ENGINE SCRAPER")
    print("="*70 + "\n")
    
    # Crear carpeta de assets
    os.makedirs(CARPETA_ASSETS, exist_ok=True)
    print(f"[+] Carpeta assets: {CARPETA_ASSETS}")
    
    # Verificar archivo de datos
    if not os.path.exists(ARCHIVO_DB):
        print(f"[-] ERROR: No encuentro {ARCHIVO_DB}")
        return
    
    # Cargar datos
    with open(ARCHIVO_DB, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    print(f"[+] Base de datos cargada: {len(db)} productos\n")
    
    modificados = 0
    saltados = 0
    fallidos = 0
    
    for idx, item in enumerate(db):
        # Extraer datos usando los campos reales del JSON
        item_name = item.get('name', '')
        marca, nombre = extraer_marca_nombre(item_name)
        
        if not nombre:
            continue
        
        # Verificar si ya tiene imagen válida (no placeholder, no coco)
        imagen_actual = item.get('image', '')
        if imagen_actual:
            imagen_lower = imagen_actual.lower()
            if 'coco' not in imagen_lower and 'placeholder' not in imagen_lower:
                # Verificar que el archivo físico exista
                ruta_fisica = os.path.join('public', imagen_actual.lstrip('/'))
                if os.path.exists(ruta_fisica):
                    saltados += 1
                    if idx < 5 or idx % 50 == 0:  # Mostrar algunos ejemplos
                        print(f"[{idx+1}/{len(db)}] ⏭️  {marca} {nombre[:30]}... - Ya tiene imagen")
                    continue
        
        print(f"\n[{idx+1}/{len(db)}] 🔍 {marca} {nombre[:40]}")
        
        # Query de búsqueda optimizado
        query = f"{marca} {nombre} perfume bottle isolated white background"
        
        # Buscar imágenes en Bing
        urls_encontradas = buscar_imagen_bing(query)
        
        if urls_encontradas:
            # Crear slug para archivo
            slug = limpiar_slug(f"{marca}_{nombre}")
            if not slug:
                slug = f"perfume_{idx}"
            
            # Intentar descargar la primera imagen válida
            descargada = False
            for img_url in urls_encontradas[:3]:  # Intentar con las primeras 3
                nombre_archivo = f"{slug}.jpg"
                ruta_fisica = os.path.join(CARPETA_ASSETS, nombre_archivo)
                ruta_web = f"/img/perfumes/{nombre_archivo}"
                
                print(f"    💾 Descargando: {img_url[:60]}...")
                
                if descargar_imagen(img_url, ruta_fisica):
                    # Actualizar item en la base de datos
                    item['image'] = ruta_web
                    item['images'] = [ruta_web]
                    modificados += 1
                    descargada = True
                    print(f"    ✅ Foto descargada y enlazada: {ruta_web}")
                    break
                else:
                    print(f"    ⚠️  Fallo descarga, intentando siguiente...")
            
            if not descargada:
                fallidos += 1
                print(f"    ❌ No se pudo descargar ninguna imagen")
        else:
            fallidos += 1
            print(f"    ⚠️  No se encontraron imágenes en Bing")
        
        # Pausa anti-ban
        time.sleep(1.5)
    
    # Guardar base de datos actualizada
    print("\n" + "="*70)
    if modificados > 0:
        with open(ARCHIVO_DB, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
        print(f"🎉 ÉXITO: {modificados} productos actualizados con imágenes de Bing")
    else:
        print(f"ℹ️  Nada que actualizar. {saltados} productos ya tenían imágenes.")
    
    if fallidos > 0:
        print(f"⚠️  {fallidos} productos no pudieron obtener imágenes")
    
    print("="*70 + "\n")

if __name__ == "__main__":
    ejecutar_bot()
