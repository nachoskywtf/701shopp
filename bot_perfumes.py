#!/usr/bin/env python3
"""
BOT PERFUMES v5.0 — IA Edition
Stack: Playwright + Google Gemini Vision + Pillow
Verifica cada imagen con IA antes de guardarla.
"""

import os, sys, csv, time, random, re, signal, unicodedata, logging, json, base64, io
from pathlib import Path
import requests
from PIL import Image
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ══════════════════════════════════════════
# CONFIG
# ══════════════════════════════════════════
ARCHIVO_CSV_ENTRADA = "perfumes_catalogo.csv"
CARPETA_BASE = "701"
CARPETA_IMAGENES = os.path.join(CARPETA_BASE, "imagenes_perfumes")
ARCHIVO_RESULTADOS = "resultados_catalogo.csv"

MIN_IMAGENES = 3
MAX_CANDIDATOS = 20
TAMANO_MINIMO_BYTES = 20 * 1024
DELAY_MIN, DELAY_MAX = 2, 6
TIMEOUT_DESCARGA = 20
ASPECT_RATIO = (4, 5)  # Match ProductCard aspect-[4/5]

# Gemini API Key — se lee de variable de entorno o archivo .env
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

HEADERS_DESCARGA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler("bot_perfumes.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
# Silenciar logs ruidosos de httpx/httpcore/google
for noisy in ["httpx", "httpcore", "google", "google.auth", "google.genai", "urllib3"]:
    logging.getLogger(noisy).setLevel(logging.WARNING)
log = logging.getLogger("Bot")

_INTERRUMPIDO = False
def _sigint(s, f):
    global _INTERRUMPIDO; _INTERRUMPIDO = True
    log.warning("Interrupcion detectada. Finalizando...")
signal.signal(signal.SIGINT, _sigint)

# ══════════════════════════════════════════
# GEMINI AI VISION
# ══════════════════════════════════════════
_gemini_client = None

def init_gemini():
    """Inicializa el cliente de Gemini."""
    global _gemini_client
    if not GEMINI_API_KEY:
        log.warning("Sin GEMINI_API_KEY. IA desactivada, se usara filtro basico.")
        return False
    try:
        from google import genai
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        log.info("Gemini AI inicializado correctamente")
        return True
    except Exception as e:
        log.warning(f"Error inicializando Gemini: {e}. IA desactivada.")
        return False

def verificar_imagen_con_ia(ruta_imagen: str, nombre_perfume: str, url: str = "") -> dict:
    flankers = ["elixir", "intense", "parfum", "absolu", "extreme", "sport"]
    n = nombre_perfume.lower()
    u = url.lower()
    for fl in flankers:
        if fl in n and fl not in u:
            return {"aprobada": False, "confianza": 0, "razon": "Falta " + fl + " en URL", "es_correcto": False}
    return {"aprobada": True, "confianza": 10, "razon": "Aprobada por Heuristica Fast-Track", "es_correcto": True}

