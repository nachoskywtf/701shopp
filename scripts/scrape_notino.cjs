const https = require('https');
const fs = require('fs');

async function scrapeNotino(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for the main product image. Usually hosted on cdn.notinoimg.com/detail_zoom or /detail_main
        const match = data.match(/https:\/\/cdn\.notinoimg\.com\/detail_zoom\/[^"']+/);
        if (match) {
          resolve(match[0]);
        } else {
          const match2 = data.match(/https:\/\/cdn\.notinoimg\.com\/detail_main\/[^"']+/);
          if (match2) resolve(match2[0]);
          else resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const products = {
    erba_pura: "https://www.notino.es/xerjoff/erba-pura-eau-de-parfum-unisex/",
    miss_dior: "https://www.notino.es/dior/miss-dior-eau-de-parfum-para-mujer/",
    eros: "https://www.notino.es/versace/eros-eau-de-parfum-para-hombre/",
    libre_intense: "https://www.notino.es/yves-saint-laurent/libre-intense-eau-de-parfum-para-mujer/",
    gucci_guilty: "https://www.notino.es/gucci/guilty-pour-homme-eau-de-toilette-para-hombre/",
    ck_shock: "https://www.notino.es/calvin-klein/ck-one-shock-eau-de-toilette-para-mujer/",
    halloween_man: "https://www.notino.es/jesus-del-pozo/halloween-man-eau-de-toilette-para-hombre/",
    halloween_x: "https://www.notino.es/jesus-del-pozo/halloween-man-x-eau-de-toilette-para-hombre/"
  };

  const results = {};
  for (const [key, url] of Object.entries(products)) {
    console.log(`Scraping: ${key}`);
    const imgUrl = await scrapeNotino(url);
    results[key] = imgUrl;
    console.log(`Found: ${imgUrl}`);
  }
  
  fs.writeFileSync('notino_images.json', JSON.stringify(results, null, 2));
}

run();
