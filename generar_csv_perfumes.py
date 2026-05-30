#!/usr/bin/env python3
"""
Script auxiliar para convertir tu CSV existente de precios
al formato que necesita bot_perfumes.py

Uso: python generar_csv_perfumes.py
"""

import csv
import re
import os

# === CONFIGURACIÓN ===
# Cambia estas rutas si tu archivo tiene otro nombre
ARCHIVO_ORIGEN = "Precios_Perfumes_Actualizados_990.csv"
ARCHIVO_DESTINO = "perfumes_catalogo.csv"


def limpiar_nombre(raw: str) -> str:
    """Extrae el nombre limpio del perfume del formato del CSV de precios."""
    # El CSV tiene formato: "MARCA;NOMBRE COMPLETO ;ESTADO; $PRECIO ; $PRECIO_XM"
    # La primera parte antes del primer ; es la marca
    # La segunda parte es el nombre completo del producto
    
    raw = raw.strip().strip('"')
    
    if ';' in raw:
        partes = raw.split(';')
        if len(partes) >= 2:
            nombre = partes[1].strip()
            # Limpiar trailing de estado y precios
            # Quitar cosas como "NUEVO", precios, etc. que quedaron
            nombre = re.sub(r'\s*;.*$', '', nombre)
            nombre = nombre.strip()
            if nombre:
                return nombre
    
    return raw.strip()


def main():
    if not os.path.exists(ARCHIVO_ORIGEN):
        print(f"❌ No se encontró '{ARCHIVO_ORIGEN}' en el directorio actual.")
        print(f"   Directorio actual: {os.getcwd()}")
        return
    
    perfumes = []
    
    with open(ARCHIVO_ORIGEN, 'r', encoding='utf-8-sig') as f:
        # Leer línea por línea para manejar el formato complejo
        lines = f.readlines()
    
    # Saltar la cabecera
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        
        nombre = limpiar_nombre(line)
        if nombre and len(nombre) > 3:
            perfumes.append(nombre)
    
    # Eliminar duplicados preservando orden
    vistos = set()
    unicos = []
    for p in perfumes:
        clave = p.upper()
        if clave not in vistos:
            vistos.add(clave)
            unicos.append(p)
    
    # Escribir CSV de salida
    with open(ARCHIVO_DESTINO, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Nombre_Perfume"])
        for nombre in unicos:
            writer.writerow([nombre])
    
    print(f"✅ CSV generado: {ARCHIVO_DESTINO}")
    print(f"   Total de perfumes únicos: {len(unicos)}")
    print(f"\n   Primeros 10 ejemplos:")
    for p in unicos[:10]:
        print(f"   • {p}")


if __name__ == "__main__":
    main()
