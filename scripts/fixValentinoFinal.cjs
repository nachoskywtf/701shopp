const https = require("https");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "..", "public", "img", "perfumes");
const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const slug = "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer";
const id = "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer";

const url = "https://fimgs.net/mdimg/perfume/375x500.89510.jpg";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" },
    }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const ws = fs.createWriteStream(dest);
      let bytes = 0;
      res.on("data", c => { bytes += c.length; });
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(bytes); });
      ws.on("error", reject);
    }).on("error", reject);
  });
}

async function fix() {
  const dir = path.join(PUBLIC, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${slug}_fix3.jpg`);
  const rel = `/img/perfumes/${slug}/${slug}_fix3.jpg`;
  
  try {
    const bytes = await download(url, dest);
    if (bytes > 3000) {
      console.log(`✅ Descargada: ${rel} (${(bytes/1024).toFixed(1)} KB)`);
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
      let updated = false;
      for (const item of catalog) {
        if (item.id === id) {
          item.image = rel;
          item.images = [rel];
          updated = true;
          break;
        }
      }
      if (updated) {
        fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
        fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");
        console.log("💾 Catálogos actualizados");
      }
    } else {
      console.log("⚠️ Imagen muy pequeña");
      fs.unlinkSync(dest);
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

fix();
