const https = require("https");

const query = "Valentino Donna Born in Roma Green Stravaganza";
const url = `https://www.notino.es/api/catalog/v2/search?q=${encodeURIComponent(query)}`;

https.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json"
  }
}, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch(e) {
      console.log(data);
    }
  });
});
