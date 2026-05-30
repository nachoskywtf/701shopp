#!/usr/bin/env python3
"""
PIPELINE DE SEGURIDAD: Ejecuta los 3 modulos de validacion en cadena.
No requiere intervencion manual. El bot es el juez final.

1. mod1_audit   -> Auditoria de integridad + reintento de faltantes
2. mod3_filter  -> Filtro de ultima instancia (calidad visual)
3. mod2_sync    -> Sync final a produccion

Orden: Audit -> Filter -> Sync (sync al final para que refleje el estado limpio)
"""

import sys
import os

# Add scripts dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

print("=" * 60)
print("  PIPELINE DE SEGURIDAD - 701 SHOP")
print("  Automatizacion total. 0 intervencion manual.")
print("=" * 60)

# Module 1
print("\n\n>>> EJECUTANDO MODULO 1: AUDITORIA DE INTEGRIDAD <<<\n")
from mod1_audit import audit_and_repair
audit_and_repair()

# Module 3 (filter before sync)
print("\n\n>>> EJECUTANDO MODULO 3: FILTRO DE ULTIMA INSTANCIA <<<\n")
from mod3_filter import run_final_filter
run_final_filter()

# Module 2 (sync last, after all cleaning)
print("\n\n>>> EJECUTANDO MODULO 2: SYNC AUTOMATICO <<<\n")
from mod2_sync import sync_catalog
sync_catalog()

print("\n" + "=" * 60)
print("  PIPELINE COMPLETO. CATALOGO LISTO PARA PRODUCCION.")
print("=" * 60)
