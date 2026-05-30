const https = require("https");
const http = require("http");

const queries = [
  "Azzaro The Most Wanted Eau de Parfum Intense",
  "Lattafa Asad",
  "Givenchy Gentleman Eau de Toilette Intense",
  "Paco Rabanne Phantom Intense",
  "Armaf Club de Nuit Intense Man",
  "Maison Alhambra Jean Lowe Immortal"
];

function searchNotino(query) {
  return new Promise((resolve) => {
    // Sephora autocomplete API
    const url = `https://www.sephora.com/api/v1/search/autocomplete?q=${encodeURIComponent(query)}`;
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({query, data: data.substring(0, 500)}));
    }).on("error", () => resolve({query, error: true}));
  });
}

Promise.all(queries.map(searchNotino)).then(results => {
  console.log(JSON.stringify(results, null, 2));
});
