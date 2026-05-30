const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "..", "public", "img", "perfumes");
const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const slug = "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer";
const id = "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer";

// The Parfumo and Valentino URLs are more reliable than Fragrantica's numeric ID which gave us the wrong image.
const targetUrls = [
  "https://cdn.parfumo.com/images/parfumo/5b/5b_img-4823-valentino-donna-born-in-roma-green-stravaganza.webp",
  "https://www.valentino-beauty.us/dw/image/v2/BGMF_PRD/on/demandware.static/-/Sites-valentino-master-catalog/default/dw9e6e7b1e/ProductImages/28055280_1.jpg",
  "https://m.media-amazon.com/images/I/61NlBvP24iL._SL1500_.jpg", // A generic fallback
  "https://m.media-amazon.com/images/I/511s-9ZcTcL._SX679_.jpg",
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const ws = fs.createWriteStream(dest);
      let bytes = 0;
      res.on("data", chunk => { bytes += chunk.length; });
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(bytes); });
      ws.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function fixValentino() {
  const dir = path.join(PUBLIC, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let downloadedPath = null;
  let downloadedRelPath = null;

  for (const url of targetUrls) {
    try {
      const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? "jpg";
      const dest = path.join(dir, `${slug}_fix.${ext}`);
      const rel = `/img/perfumes/${slug}/${slug}_fix.${ext}`;
      
      console.log(`Intentando: ${url}`);
      const bytes = await download(url, dest);
      
      if (bytes > 10000) {
        console.log(`✅ Descarga exitosa: ${rel} (${(bytes/1024).toFixed(1)} KB)`);
        downloadedPath = dest;
        downloadedRelPath = rel;
        break; // Éxito
      } else {
        console.log(`⚠️ Imagen demasiado pequeña (${bytes} bytes), ignorando...`);
        fs.unlinkSync(dest);
      }
    } catch (e) {
      console.log(`❌ Error con ${url}: ${e.message}`);
    }
  }

  if (downloadedRelPath) {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
    let updated = false;
    for (const item of catalog) {
      if (item.id === id) {
        item.image = downloadedRelPath;
        item.images = [downloadedRelPath];
        updated = true;
        break;
      }
    }
    
    if (updated) {
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
      fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");
      console.log("💾 Catálogos actualizados correctamente con la nueva imagen.");
    }
  } else {
    console.log("❌ No se pudo descargar ninguna imagen válida.");
  }
}

fixValentino();
