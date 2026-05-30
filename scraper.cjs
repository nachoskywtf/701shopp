/**
 * ============================================================
 *  PERFUME IMAGE SCRAPER  ·  Node.js + Playwright
 * ============================================================
 *  Autor    : Instructivo para Windsurf / Cursor / VS Code
 *  Propósito: Busca en Google Imágenes las fotos de cada
 *             perfume de productos.json, las descarga en
 *             /public/img/perfumes/{slug}/ y re-escribe el
 *             JSON con las rutas relativas.
 *
 *  Por qué Playwright y no requests/BeautifulSoup:
 *    Google detecta scrapers HTTP puros (sin JS) y bloquea.
 *    Playwright levanta un Chromium REAL que pasa los checks
 *    de bot-detection (canvas fingerprint, navigator props,
 *    WebGL, etc.).
 * ============================================================
 */

// ─── 1. IMPORTACIONES ────────────────────────────────────────
const { chromium }  = require("playwright");
const fs            = require("fs");
const fsp           = fs.promises;
const path          = require("path");
const https         = require("https");
const http          = require("http");
const { URL }       = require("url");

// ─── 2. CONFIGURACIÓN CENTRAL ─────────────────────────────────
// ⚠️  WINDSURF: ajusta INPUT_FILE y OUTPUT_DIR a la raíz de tu proyecto Next.js
const CONFIG = {
  INPUT_FILE    : path.join(__dirname, "productos.json"),
  OUTPUT_DIR    : path.join(__dirname, "public", "img", "perfumes"),
  FALLBACK_IMG  : "/img/perfumes/default-bottle.webp",
  IMAGES_PER_PRODUCT : 3,       // cuántas imágenes descargar por perfume
  MIN_SIZE_BYTES     : 15_000,  // ignorar imágenes < 15 KB (miniaturas/iconos)
  HEADLESS           : true,    // false → abre Chrome visible para depurar
  // Tiempos en ms – aleatorios para parecer humano
  DELAY_PRODUCTS : [4_000, 9_000],
  DELAY_ACTIONS  : [600,   1_500],
  PAGE_TIMEOUT   : 35_000,
};

// ─── 3. POOL DE USER-AGENTS ROTATIVOS ─────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

// ─── 4. UTILIDADES ────────────────────────────────────────────

/** Pausa aleatoria entre [min, max] ms para simular comportamiento humano */
const sleep = (min, max) => {
  const ms = max ? Math.floor(Math.random() * (max - min + 1)) + min : min;
  return new Promise(r => setTimeout(r, ms));
};

/** "Dior Sauvage EDP" → "dior-sauvage-edp" */
const slugify = str =>
  str.toLowerCase()
     .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9\s-]/g, "")
     .trim()
     .replace(/\s+/g, "-");

/** Devuelve un User-Agent aleatorio del pool */
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

/**
 * Descarga una URL de imagen (http o https) a destPath.
 * Retorna el tamaño en bytes (para validar calidad mínima).
 */
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const proto     = parsedUrl.protocol === "https:" ? https : http;

    const req = proto.get(url, { timeout: 15_000, headers: {
      "User-Agent"      : randomUA(),
      "Referer"         : "https://www.google.com/",
      "Accept"          : "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language" : "en-US,en;q=0.9",
    }}, (res) => {
      // Seguir redireccionamientos (301/302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath)
          .then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} descargando imagen`));
      }

      const fileStream = fs.createWriteStream(destPath);
      let bytes = 0;
      res.on("data", chunk => { bytes += chunk.length; });
      res.pipe(fileStream);
      fileStream.on("finish", () => { fileStream.close(); resolve(bytes); });
      fileStream.on("error", reject);
    });

    req.on("error",   reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout descargando imagen")); });
  });
}

/**
 * Dado un Page de Playwright, extrae URLs de imágenes de Google Images.
 * Estrategia: hace clic en la miniatura → lee la imagen HD del panel lateral.
 */
async function extractGoogleImageUrls(page, query, count) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:l`;

  console.log(`     🔍  Buscando: ${query}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: CONFIG.PAGE_TIMEOUT });
  await sleep(...CONFIG.DELAY_ACTIONS);

  // Aceptar cookies si aparece el banner (región EU)
  try {
    const cookieBtn = page.locator('button:has-text("Accept all"), button:has-text("Aceptar todo")').first();
    if (await cookieBtn.isVisible({ timeout: 3_000 })) {
      await cookieBtn.click();
      await sleep(800, 1_500);
    }
  } catch { /* No hay banner, continuar */ }

  // Esperar a que carguen las miniaturas
  await page.waitForSelector('div[data-ri]', { timeout: CONFIG.PAGE_TIMEOUT }).catch(() => {});

  const collectedUrls = [];

  // Iterar sobre las primeras N*2 miniaturas (por si algunas fallan)
  const thumbnails = await page.$$('div[data-ri]');
  const toTry = thumbnails.slice(0, count * 3);

  for (const thumb of toTry) {
    if (collectedUrls.length >= count) break;

    try {
      await thumb.click({ timeout: 5_000 });
      await sleep(...CONFIG.DELAY_ACTIONS);

      // El panel lateral de Google muestra la imagen HD aquí:
      const hdSelectors = [
        'img[jsname="kn3ccd"]',               // Google Images panel (2024)
        'c-wiz img[data-src]',                 // variante A
        'div[data-ved] img[src^="http"]',      // variante B
      ];

      let imgUrl = null;
      for (const sel of hdSelectors) {
        try {
          const el = await page.waitForSelector(sel, { timeout: 4_000 });
          const src = await el.getAttribute("src") || await el.getAttribute("data-src");
          if (src && src.startsWith("http") && !src.includes("encrypted-tbn")) {
            imgUrl = src;
            break;
          }
        } catch { continue; }
      }

      // Fallback: buscar en el DOM todas las img HD visibles en el panel
      if (!imgUrl) {
        imgUrl = await page.evaluate(() => {
          const panel = document.querySelector('div[data-ved]') ||
                        document.querySelector('[jscontroller]');
          if (!panel) return null;
          const imgs = [...panel.querySelectorAll("img")];
          const big  = imgs.find(img => img.naturalWidth > 300 &&
                                        img.src.startsWith("http") &&
                                        !img.src.includes("encrypted-tbn"));
          return big ? big.src : null;
        });
      }

      if (imgUrl) {
        console.log(`       ✅  URL capturada (${collectedUrls.length + 1}/${count})`);
        collectedUrls.push(imgUrl);
      }

      await sleep(...CONFIG.DELAY_ACTIONS);
    } catch (err) {
      console.warn(`       ⚠️   Miniatura falló: ${err.message}`);
    }
  }

  return collectedUrls;
}

// ─── 5. FUNCIÓN PRINCIPAL ─────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║      PERFUME IMAGE SCRAPER  ·  Playwright         ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // 5.1 — Leer productos.json
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    console.error(`❌  No encontré ${CONFIG.INPUT_FILE}`);
    process.exit(1);
  }
  const rawData = await fsp.readFile(CONFIG.INPUT_FILE, "utf-8");
  const productos = JSON.parse(rawData);
  console.log(`📦  ${productos.length} productos cargados.\n`);

  // 5.2 — Lanzar Playwright (Chromium headless con anti-detección)
  const browser = await chromium.launch({
    headless : CONFIG.HEADLESS,
    args     : [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",  // oculta que es Playwright
      "--disable-infobars",
      "--window-size=1366,768",
      "--lang=en-US,en",
    ],
  });

  const context = await browser.newContext({
    userAgent            : randomUA(),
    viewport             : { width: 1366, height: 768 },
    locale               : "en-US",
    timezoneId           : "America/New_York",
    // Inyecta scripts para parecer navegador humano
    javaScriptEnabled    : true,
    bypassCSP            : false,
    ignoreHTTPSErrors    : true,
    extraHTTPHeaders     : {
      "Accept-Language" : "en-US,en;q=0.9",
      "Accept-Encoding" : "gzip, deflate, br",
    },
  });

  // Anti-detección: ocultar que navigator.webdriver === true
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins",   { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  // 5.3 — Iterar sobre cada producto
  const productosActualizados = [];

  for (let i = 0; i < productos.length; i++) {
    const producto = { ...productos[i] };
    const { marca, nombre } = producto;
    const slug = slugify(`${marca} ${nombre}`);

    console.log(`\n[${i + 1}/${productos.length}]  🧴  ${marca} – ${nombre}`);
    console.log(`     Slug: ${slug}`);

    // Crear carpeta de destino
    const productDir = path.join(CONFIG.OUTPUT_DIR, slug);
    await fsp.mkdir(productDir, { recursive: true });

    // Query optimizada para fondos blancos de alta calidad
    const query = `${marca} ${nombre} perfume bottle high quality pure white background`;

    const imagenes    = [];
    let imgUrlsFromGoogle = [];

    try {
      imgUrlsFromGoogle = await extractGoogleImageUrls(page, query, CONFIG.IMAGES_PER_PRODUCT);
    } catch (err) {
      console.error(`     ❌  Error buscando en Google: ${err.message}`);
    }

    // 5.4 — Descargar cada imagen encontrada
    for (let j = 0; j < imgUrlsFromGoogle.length; j++) {
      const imgUrl  = imgUrlsFromGoogle[j];
      const ext     = imgUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? "jpg";
      const fileName = `${slug}-${j + 1}.${ext}`;
      const destPath = path.join(productDir, fileName);
      // Ruta relativa para el frontend (desde /public)
      const relativePath = `/img/perfumes/${slug}/${fileName}`;

      try {
        console.log(`     ⬇️   Descargando imagen ${j + 1}…`);
        const bytes = await downloadImage(imgUrl, destPath);

        if (bytes < CONFIG.MIN_SIZE_BYTES) {
          console.warn(`     ⚠️   Imagen ${j + 1} muy pequeña (${bytes} bytes), descartada.`);
          await fsp.unlink(destPath).catch(() => {});
          continue;
        }

        imagenes.push(relativePath);
        console.log(`     ✅  Guardada: ${relativePath} (${(bytes / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error(`     ❌  No se pudo descargar imagen ${j + 1}: ${err.message}`);
      }

      await sleep(...CONFIG.DELAY_ACTIONS);
    }

    // 5.5 — Inyectar rutas en el objeto del producto
    producto.imagenes        = imagenes.length > 0 ? imagenes : [];
    producto.imagen_principal = imagenes.length > 0 ? imagenes[0] : CONFIG.FALLBACK_IMG;

    productosActualizados.push(producto);

    // 5.6 — Guardar progreso incremental (por si se interrumpe)
    await fsp.writeFile(CONFIG.INPUT_FILE, JSON.stringify(productosActualizados.concat(
      productos.slice(i + 1)
    ), null, 2), "utf-8");

    console.log(`     💾  JSON actualizado con ${imagenes.length} imágenes.`);

    // Pausa entre productos (evitar rate-limiting)
    if (i < productos.length - 1) {
      const waitMs = Math.floor(Math.random() * (CONFIG.DELAY_PRODUCTS[1] - CONFIG.DELAY_PRODUCTS[0])) + CONFIG.DELAY_PRODUCTS[0];
      console.log(`     ⏱️   Esperando ${(waitMs / 1000).toFixed(1)}s antes del siguiente…`);
      await sleep(waitMs);
    }
  }

  // 5.7 — Escritura final del JSON completo
  await fsp.writeFile(CONFIG.INPUT_FILE, JSON.stringify(productosActualizados, null, 2), "utf-8");
  await browser.close();

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  ✅  SCRAPING COMPLETADO                          ║");
  console.log(`║  📁  Imágenes en: public/img/perfumes/             ║`);
  console.log(`║  📄  JSON actualizado: productos.json              ║`);
  console.log("╚══════════════════════════════════════════════════╝\n");
}

// ─── 6. EJECUCIÓN + MANEJO DE ERRORES GLOBALES ───────────────
main().catch(err => {
  console.error("\n💥  Error fatal:", err);
  process.exit(1);
});
