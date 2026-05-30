const { chromium } = require("playwright");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const https = require("https");
const http = require("http");

const PUBLIC = path.resolve(__dirname, "..", "public", "img", "perfumes");
const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const slug = "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer";
const id = "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer";

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/*",
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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();

  console.log("🔍 Buscando en DuckDuckGo...");
  const query = "Valentino Donna Born in Roma Green Stravaganza 100ml bottle white background";
  await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`);
  
  await page.waitForSelector('img.tile--img__img', { timeout: 15000 }).catch(() => {});
  
  const images = await page.$$('img.tile--img__img');
  let imageUrl = null;

  for (let i = 0; i < images.length; i++) {
    const src = await images[i].getAttribute("src");
    if (src && src.startsWith("//")) {
      imageUrl = "https:" + src;
      break;
    } else if (src && src.startsWith("http")) {
      imageUrl = src;
      break;
    }
  }

  if (imageUrl) {
    console.log(`✅ URL encontrada: ${imageUrl}`);
    
    const dir = path.join(PUBLIC, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const destPath = path.join(dir, `${slug}_fix2.jpg`);
    const relPath = `/img/perfumes/${slug}/${slug}_fix2.jpg`;
    
    try {
      const bytes = await downloadImage(imageUrl, destPath);
      if (bytes > 2000) {
        console.log(`✅ Descargada: ${relPath} (${(bytes/1024).toFixed(1)} KB)`);
        
        // Update catalog
        const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
        let updated = false;
        for (const item of catalog) {
          if (item.id === id) {
            item.image = relPath;
            item.images = [relPath];
            updated = true;
            break;
          }
        }
        
        if (updated) {
          fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
          fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");
          console.log("💾 Catálogo actualizado.");
        }
      } else {
        console.log("⚠️ Imagen muy pequeña, descartada.");
        fs.unlinkSync(destPath);
      }
    } catch (e) {
      console.log(`❌ Error descargando: ${e.message}`);
    }
  } else {
    console.log("❌ No se encontraron imágenes en DuckDuckGo.");
  }

  await browser.close();
}

main().catch(console.error);
