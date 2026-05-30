const https = require("https");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "..", "public", "img", "perfumes");
const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const TARGETS = [
  {
    id: "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp",
    slug: "azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp",
    url: "https://fimgs.net/mdimg/perfume/375x500.66914.jpg",
  },
  {
    id: "lattafa-asad-man-100ml-edp",
    slug: "lattafa_asad_man_100ml_edp",
    url: "https://fimgs.net/mdimg/perfume/375x500.69335.jpg",
  },
  {
    id: "givenchy-gentleman-eau-de-toilette-intense-100ml",
    slug: "givenchy_gentleman_eau_de_toilette_intense_100ml",
    url: "https://fimgs.net/mdimg/perfume/375x500.66633.jpg",
  },
  {
    id: "paco-rabanne-phantom-intense-edp-intense-100-ml-hombre",
    slug: "paco_rabanne_phantom_intense_edp_intense_100_ml_hombre",
    url: "https://fimgs.net/mdimg/perfume/375x500.91689.jpg",
  },
  {
    id: "armaf-club-de-nuit-intense-man-105ml-edt",
    slug: "armaf_club_de_nuit_intense_man_105ml_edt",
    url: "https://fimgs.net/mdimg/perfume/375x500.34696.jpg",
  },
  {
    id: "maison-alhambra-jean-lowe-inmortal-edp-30-ml",
    slug: "maison_alhambra_jean_lowe_inmortal_edp_30_ml",
    url: "https://fimgs.net/mdimg/perfume/375x500.82345.jpg",
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
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
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  let updatedCount = 0;

  for (const t of TARGETS) {
    const dir = path.join(PUBLIC, t.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // Usar suffix _fix4 para asegurar cache busting
    const dest = path.join(dir, `${t.slug}_fix4.jpg`);
    const rel = `/img/perfumes/${t.slug}/${t.slug}_fix4.jpg`;
    
    try {
      const bytes = await download(t.url, dest);
      if (bytes > 3000) {
        console.log(`✅ Descargada: ${rel} (${(bytes/1024).toFixed(1)} KB)`);
        for (const item of catalog) {
          if (item.id === t.id) {
            item.image = rel;
            item.images = [rel];
            updatedCount++;
            break;
          }
        }
      } else {
        console.log(`⚠️ Imagen muy pequeña para ${t.id}`);
        fs.unlinkSync(dest);
      }
    } catch (e) {
      console.log(`❌ Error con ${t.id}: ${e.message}`);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
    fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");
    console.log(`💾 Catálogos actualizados con ${updatedCount} imágenes correctas`);
  }
}

fix();
