const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

let catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const initialCount = catalog.length;

const lowTierBrands = [
  "MUSH MUSH", "GAME OF", "GRANDEUR", "ASTEN", "MIRADA", 
  "MARYAJ", "DUMONT", "VOLARE", "ANTONIO PUIG", "AGUA BRAVA", "QUORUM",
  "POR DEFINIR", "SIN CATEGORIZAR", "DUBAI"
];

const deoKeywords = [
  "DEODORANT", "DESODORANTE", "BODY SPRAY", "BODY MIST", "SPLASH"
];

const filteredCatalog = catalog.filter(item => {
  const brand = (item.brand || "").toUpperCase();
  const name = (item.name || "").toUpperCase();

  // 1. Filtro: Sin foto
  if (!item.image || item.image.trim() === "") {
    return false;
  }

  // 2. Filtro: Desodorantes / Body Sprays / Mist
  for (const keyword of deoKeywords) {
    if (name.includes(keyword) || brand.includes(keyword)) {
      return false;
    }
  }

  // 3. Filtro: Marcas Low-Tier y etiquetas de error
  for (const lowBrand of lowTierBrands) {
    if (brand.includes(lowBrand)) {
      return false;
    }
  }
  
  // Si el item dice POR DEFINIR en su string "name", lo descartamos 
  // (a menos que lo queramos, pero como son de bajo nivel lo descartamos)
  if (name.includes("POR DEFINIR")) {
    return false;
  }

  return true;
});

const removedCount = initialCount - filteredCatalog.length;

fs.writeFileSync(CATALOG_PATH, JSON.stringify(filteredCatalog, null, 4), "utf8");
fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(filteredCatalog, null, 4), "utf8");

console.log(`✅ Purga completada.`);
console.log(`- Productos iniciales: ${initialCount}`);
console.log(`- Productos eliminados: ${removedCount}`);
console.log(`- Productos finales: ${filteredCatalog.length}`);
