import os
import time

def auto_sync():
    print("Iniciando Auto-Sync (Sincronizacion cada 10 segundos)...")
    try:
        while True:
            os.system("python sync_imagenes_catalogo.py")
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n🛑 Auto-Sync detenido.")

if __name__ == "__main__":
    auto_sync()
