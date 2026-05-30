const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PUBLIC = path.resolve(__dirname, "..", "public", "img", "perfumes");
const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

// Direct CDN URLs for each missing product (fragrantica, sephora CDN, parfumo, etc.)
const TARGETS = [
  {
    id: "valentino-donna-born-in-roma-green-stravaganza-edp-100-ml-mujer",
    slug: "valentino_donna_born_in_roma_green_stravaganza_edp_100_ml_mujer",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.74684.jpg",
      "https://cdn.parfumo.com/images/parfumo/5b/5b_img-4823-valentino-donna-born-in-roma-green-stravaganza.webp",
      "https://www.valentino-beauty.us/dw/image/v2/BGMF_PRD/on/demandware.static/-/Sites-valentino-master-catalog/default/dw9e6e7b1e/ProductImages/28055280_1.jpg",
    ],
  },
  {
    id: "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp",
    slug: "azzaro_the_most_wanted_hombre_eau_de_parfum_intense_100ml_edp",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.72086.jpg",
      "https://cdn.parfumo.com/images/parfumo/70/70_img-9487-azzaro-the-most-wanted-eau-de-parfum-intense.webp",
      "https://www.azzaro.com/dw/image/v2/BCWP_PRD/on/demandware.static/-/Sites-azzaro-master-catalog/default/dwf000ab7e/images/hi-res/LC2982700_1.jpg",
    ],
  },
  {
    id: "lattafa-asad-man-100ml-edp",
    slug: "lattafa_asad_man_100ml_edp",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.72973.jpg",
      "https://cdn.parfumo.com/images/parfumo/67/67_img-2574-lattafa-perfumes-asad.webp",
      "https://m.media-amazon.com/images/I/61LoG8JJEPL._SL1500_.jpg",
    ],
  },
  {
    id: "givenchy-gentleman-eau-de-toilette-intense-100ml",
    slug: "givenchy_gentleman_eau_de_toilette_intense_100ml",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.70098.jpg",
      "https://cdn.parfumo.com/images/parfumo/2e/2e_img-5458-givenchy-gentleman-eau-de-toilette-intense.webp",
      "https://www.givenchybeauty.com/dw/image/v2/BCWN_PRD/on/demandware.static/-/Sites-givenchy-master-catalog/default/dweb24547e/images/hi-res/P011308_1.jpg",
    ],
  },
  {
    id: "paco-rabanne-phantom-intense-edp-intense-100-ml-hombre",
    slug: "paco_rabanne_phantom_intense_edp_intense_100_ml_hombre",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.78651.jpg",
      "https://cdn.parfumo.com/images/parfumo/33/33_img-1827-paco-rabanne-phantom-intense.webp",
      "https://www.rabanne.com/dw/image/v2/BCWQ_PRD/on/demandware.static/-/Sites-rabanne-master-catalog/default/dw85dfc2af/images/hi-res/65197555_1.jpg",
    ],
  },
  {
    id: "armaf-club-de-nuit-intense-man-105ml-edt",
    slug: "armaf_club_de_nuit_intense_man_105ml_edt",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.34696.jpg",
      "https://cdn.parfumo.com/images/parfumo/0c/0c_img-2685-armaf-club-de-nuit-intense-man.webp",
      "https://m.media-amazon.com/images/I/61c0RpFMi4L._SL1500_.jpg",
    ],
  },
  {
    id: "maison-alhambra-jean-lowe-inmortal-edp-30-ml",
    slug: "maison_alhambra_jean_lowe_inmortal_edp_30_ml",
    urls: [
      "https://fimgs.net/mdimg/perfume/375x500.82345.jpg",
      "https://m.media-amazon.com/images/I/51qOcXgxMeL._SL1100_.jpg",
      "https://m.media-amazon.com/images/I/61eLJJ2JlqL._SL1500_.jpg",
    ],
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const proto = parsedUrl.protocol === "https:" ? https : http;
    const req = proto.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/*,*/*;q=0.8",
      },
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
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const updates = {};

  for (const t of TARGETS) {
    const dir = path.join(PUBLIC, t.slug);
    fs.mkdirSync(dir, { recursive: true });
    let success = false;

    for (const url of t.urls) {
      const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? "jpg";
      const dest = path.join(dir, `${t.slug}_1.${ext}`);
      const rel = `/img/perfumes/${t.slug}/${t.slug}_1.${ext}`;
      try {
        const bytes = await download(url, dest);
        if (bytes > 3000) {
          console.log(`✅ ${t.id} → ${rel} (${(bytes/1024).toFixed(0)}KB)`);
          updates[t.id] = rel;
          success = true;
          break;
        } else {
          fs.unlinkSync(dest);
        }
      } catch (e) {
        // try next URL
      }
    }
    if (!success) console.log(`❌ ${t.id} — all URLs failed`);
  }

  // Update catalog
  let updated = 0;
  for (const item of catalog) {
    if (updates[item.id]) {
      item.image = updates[item.id];
      item.images = [updates[item.id]];
      updated++;
    }
  }
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
  fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");
  console.log(`\n💾 ${updated} productos actualizados con imágenes`);
}

main().catch(e => { console.error(e); process.exit(1); });
