/**
 * Download missing images for Top 15 products using Playwright.
 * Also tags all Top 15 products with otono: true in catalog_output.json.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "img", "perfumes");

// Top 15 IDs (in order) that should be tagged as otoño
const TOP_15_IDS = [
  "emporio-armani-stronger-with-you-intensely-man-100ml-edp",
  "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer",
  "versace-eros-flame-edp-200-ml-hombre",
  "lattafa-khamrah-100ml-edp",
  "afnan-9-pm-men-edp-150-ml",
  "jean-paul-gaultier-le-male-elixir-parfum-75-ml",
  "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp",
  "lattafa-asad-man-100ml-edp",
  "yves-saint-lauren-myslf-60-ml-edp",
  "givenchy-gentleman-eau-de-toilette-intense-100ml",
  "paco-rabanne-phantom-intense-edp-intense-100-ml-hombre",
  "giorgio-armani-code-parfum-75ml-edp-hombre",
  "viktor-rolf-spicebomb-metallic-musk-edp-50-ml-hombre",
  "armaf-club-de-nuit-intense-man-105ml-edt",
  "maison-alhambra-jean-lowe-inmortal-edp-30-ml",
];

// Products that need images
const MISSING_IMAGES = [
  {
    id: "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer",
    query: "Valentino Born in Roma Green Stravaganza EDP bottle site:sephora.com OR site:ulta.com OR site:nordstrom.com",
    slug: "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer",
  },
  {
    id: "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp",
    query: "Azzaro The Most Wanted EDP Intense 100ml bottle site:sephora.com OR site:nordstrom.com OR site:ulta.com",
    slug: "azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp",
  },
  {
    id: "lattafa-asad-man-100ml-edp",
    query: "Lattafa Asad 100ml EDP perfume bottle white background",
    slug: "lattafa_asad_man_100ml_edp",
  },
  {
    id: "givenchy-gentleman-eau-de-toilette-intense-100ml",
    query: "Givenchy Gentleman Eau de Toilette Intense 100ml bottle site:sephora.com OR site:givenchybeauty.com",
    slug: "givenchy_gentleman_eau_de_toilette_intense_100ml",
  },
  {
    id: "paco-rabanne-phantom-intense-edp-intense-100-ml-hombre",
    query: "Paco Rabanne Phantom Intense EDP 100ml bottle site:sephora.com OR site:rabanne.com",
    slug: "paco_rabanne_phantom_intense_edp_intense_100_ml_hombre",
  },
  {
    id: "armaf-club-de-nuit-intense-man-105ml-edt",
    query: "Armaf Club de Nuit Intense Man 105ml EDT perfume bottle",
    slug: "armaf_club_de_nuit_intense_man_105ml_edt",
  },
  {
    id: "maison-alhambra-jean-lowe-inmortal-edp-30-ml",
    query: "Maison Alhambra Jean Lowe Immortal EDP perfume bottle",
    slug: "maison_alhambra_jean_lowe_inmortal_edp_30_ml",
  },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomDelay = (min, max) => sleep(Math.floor(Math.random() * (max - min)) + min);

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const proto = parsedUrl.protocol === "https:" ? https : http;
    const req = proto.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.google.com/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const fileStream = fs.createWriteStream(destPath);
      let bytes = 0;
      res.on("data", chunk => { bytes += chunk.length; });
      res.pipe(fileStream);
      fileStream.on("finish", () => { fileStream.close(); resolve(bytes); });
      fileStream.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function main() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  STEP 1: Tag Top 15 with otoño flag");
  console.log("═══════════════════════════════════════════════\n");

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const top15Set = new Set(TOP_15_IDS);

  let taggedCount = 0;
  catalog.forEach(item => {
    if (top15Set.has(item.id)) {
      item.otono = true;
      taggedCount++;
    }
  });
  console.log(`  ✅ Tagged ${taggedCount} products with otono: true`);

  // Save immediately
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
  const publicCatalog = path.resolve(__dirname, "..", "public", "productos.json");
  fs.writeFileSync(publicCatalog, JSON.stringify(catalog, null, 4), "utf8");
  console.log("  💾 Catalog saved\n");

  console.log("═══════════════════════════════════════════════");
  console.log("  STEP 2: Download missing images");
  console.log("═══════════════════════════════════════════════\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await context.newPage();
  const results = {};

  for (const product of MISSING_IMAGES) {
    console.log(`\n  🔍 Searching: ${product.id}`);
    const productDir = path.join(OUTPUT_DIR, product.slug);
    await fsp.mkdir(productDir, { recursive: true });

    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product.query)}&tbm=isch&tbs=isz:l`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await randomDelay(2000, 4000);

      // Accept cookies if visible
      try {
        const btn = page.locator('button:has-text("Accept all"), button:has-text("Aceptar todo")').first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          await randomDelay(800, 1500);
        }
      } catch {}

      // Wait for thumbnails
      await page.waitForSelector('div[data-ri]', { timeout: 15000 }).catch(() => {});

      // Click first thumbnail
      const thumbnails = await page.$$('div[data-ri]');
      let imageUrl = null;

      for (let t = 0; t < Math.min(thumbnails.length, 6); t++) {
        try {
          await thumbnails[t].click({ timeout: 5000 });
          await randomDelay(1500, 3000);

          // Try to get HD image from panel
          const selectors = [
            'img[jsname="kn3ccd"]',
            'c-wiz img[data-src]',
            'img.sFlh5c',
            'img.iPVvYb',
          ];

          for (const sel of selectors) {
            try {
              const el = await page.waitForSelector(sel, { timeout: 3000 });
              const src = await el.getAttribute("src") || await el.getAttribute("data-src");
              if (src && src.startsWith("http") && !src.includes("encrypted-tbn") && !src.includes("gstatic")) {
                imageUrl = src;
                break;
              }
            } catch { continue; }
          }

          // Fallback: find any large image
          if (!imageUrl) {
            imageUrl = await page.evaluate(() => {
              const imgs = [...document.querySelectorAll("img")];
              const big = imgs.find(img =>
                img.naturalWidth > 200 &&
                img.src.startsWith("http") &&
                !img.src.includes("encrypted-tbn") &&
                !img.src.includes("gstatic") &&
                !img.src.includes("google")
              );
              return big ? big.src : null;
            });
          }

          if (imageUrl) break;
        } catch (err) {
          console.log(`     ⚠️ Thumbnail ${t} failed: ${err.message}`);
        }
      }

      if (imageUrl) {
        console.log(`     ✅ Found image URL`);
        const ext = imageUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? "jpg";
        const fileName = `${product.slug}_1.${ext}`;
        const destPath = path.join(productDir, fileName);
        const relativePath = `/img/perfumes/${product.slug}/${fileName}`;

        try {
          const bytes = await downloadImage(imageUrl, destPath);
          if (bytes > 5000) {
            console.log(`     ✅ Downloaded: ${relativePath} (${(bytes / 1024).toFixed(1)} KB)`);
            results[product.id] = relativePath;
          } else {
            console.log(`     ⚠️ Image too small (${bytes} bytes), skipped`);
            await fsp.unlink(destPath).catch(() => {});
          }
        } catch (err) {
          console.log(`     ❌ Download failed: ${err.message}`);
        }
      } else {
        console.log(`     ❌ No image URL found`);
      }
    } catch (err) {
      console.log(`     ❌ Search failed: ${err.message}`);
    }

    await randomDelay(3000, 5000);
  }

  await browser.close();

  // Update catalog with new images
  console.log("\n═══════════════════════════════════════════════");
  console.log("  STEP 3: Update catalog with downloaded images");
  console.log("═══════════════════════════════════════════════\n");

  const updatedCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  let updatedCount = 0;

  for (const item of updatedCatalog) {
    if (results[item.id]) {
      item.image = results[item.id];
      item.images = [results[item.id]];
      updatedCount++;
      console.log(`  ✅ Updated: ${item.id}`);
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 4), "utf8");
  fs.writeFileSync(publicCatalog, JSON.stringify(updatedCatalog, null, 4), "utf8");

  console.log(`\n  💾 Updated ${updatedCount} products with new images`);
  console.log("\n  ✅ DONE!\n");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
