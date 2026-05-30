const https = require('https');
const fs = require('fs');

async function searchImage(query) {
  return new Promise((resolve, reject) => {
    const searchUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' perfume bottle white background');
    
    https.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find image URLs in the duckduckgo results
        // DuckDuckGo HTML version contains image links in a specific format
        const imgRegex = /<img[^>]+src="(\/\/external-content\.duckduckgo\.com\/iu\/\?u=[^"]+)"/g;
        const match = imgRegex.exec(data);
        if (match && match[1]) {
          const imgUrl = 'https:' + match[1];
          // Extract the actual URL from the proxy
          const actualUrlMatch = imgUrl.match(/u=([^&]+)/);
          if (actualUrlMatch && actualUrlMatch[1]) {
            resolve(decodeURIComponent(actualUrlMatch[1]));
            return;
          }
          resolve(imgUrl);
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const queries = [
    "Xerjoff Erba Pura 100ml",
    "Dior Miss Dior EDP 2021",
    "Versace Eros Man EDP",
    "YSL Libre Intense",
    "Gucci Guilty Pour Homme",
    "CK One Shock For Her",
    "Halloween Man X",
    "Valentino Uomo Born in Roma",
    "Valentino Donna Born in Roma"
  ];

  for (const q of queries) {
    console.log(`Searching for: ${q}`);
    const url = await searchImage(q);
    console.log(`Found: ${url}`);
  }
}

run();
