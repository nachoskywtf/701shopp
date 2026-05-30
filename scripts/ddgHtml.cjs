const https = require("https");
const fs = require("fs");
const path = require("path");

const query = encodeURIComponent("Valentino Donna Born in Roma Green Stravaganza bottle white background");
const searchUrl = `https://duckduckgo.com/html/?q=${query}`;

https.get(searchUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    // Busca URLs de imágenes en el HTML
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const urls = [];
    while ((match = regex.exec(data)) !== null) {
      if (match[1].includes("http")) {
        urls.push(match[1]);
      } else if (match[1].startsWith("//")) {
        urls.push("https:" + match[1]);
      }
    }
    console.log(JSON.stringify(urls, null, 2));
  });
}).on("error", console.error);
