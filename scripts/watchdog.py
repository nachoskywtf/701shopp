#!/usr/bin/env python3
"""
WATCHDOG: Espera a que bot_premium.py termine y luego ejecuta el pipeline de seguridad.
Monitorea el archivo catalog_output.json buscando estabilidad (sin cambios por 30 segundos).
"""

import os
import time
import subprocess
import sys

ARCHIVO_DB = 'src/lib/catalog_output.json'
CHECK_INTERVAL = 15  # Check every 15 seconds
STABILITY_THRESHOLD = 60  # Must be unchanged for 60 seconds to consider "done"


def get_mtime():
    try:
        return os.path.getmtime(ARCHIVO_DB)
    except:
        return 0


def main():
    print("=" * 60)
    print("  WATCHDOG: Esperando a que el bot premium termine...")
    print("=" * 60)

    last_mtime = get_mtime()
    stable_since = time.time()

    while True:
        time.sleep(CHECK_INTERVAL)
        current_mtime = get_mtime()

        if current_mtime != last_mtime:
            # File was modified, reset stability counter
            last_mtime = current_mtime
            stable_since = time.time()
            elapsed = 0
            print(f"  [ACTIVO] Catalogo modificado. Reseteando contador...")
        else:
            elapsed = time.time() - stable_since
            print(f"  [ESPERANDO] Sin cambios hace {elapsed:.0f}s (necesita {STABILITY_THRESHOLD}s)")

        if elapsed >= STABILITY_THRESHOLD:
            print(f"\n  [ESTABLE] Catalogo sin cambios por {STABILITY_THRESHOLD}s. Bot terminado.")
            break

    # Launch security pipeline
    print("\n>>> Lanzando Pipeline de Seguridad <<<\n")
    result = subprocess.run(
        [sys.executable, "-X", "utf8", "scripts/run_security_pipeline.py"],
        cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )

    if result.returncode == 0:
        print("\n[EXITO] Pipeline de seguridad completado.")
    else:
        print(f"\n[ERROR] Pipeline retorno codigo {result.returncode}")


if __name__ == "__main__":
    main()
