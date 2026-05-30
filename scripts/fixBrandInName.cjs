const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

catalog.forEach(item => {
  if (item.name.startsWith("POR DEFINIR;")) {
    const parts = item.name.split(";");
    // Extraer marca desde la 2da parte (el nombre del perfume)
    const n = parts[1].toUpperCase();
    let realBrand = "POR DEFINIR";
    
    if (n.includes("VALENTINO")) realBrand = "VALENTINO";
    else if (n.includes("VERSACE")) realBrand = "VERSACE";
    else if (n.includes("VIKTOR") && n.includes("ROLF")) realBrand = "VIKTOR & ROLF";
    else if (n.includes("MAISON ALHAMBRA")) realBrand = "MAISON ALHAMBRA";
    else if (n.includes("LATTAFA")) realBrand = "LATTAFA";
    else if (n.includes("AFNAN")) realBrand = "AFNAN";
    else if (n.includes("YVES SAINT LAURENT") || n.includes("YSL")) realBrand = "YVES SAINT LAURENT";
    else if (n.includes("JEAN PAUL GAULTIER")) realBrand = "JEAN PAUL GAULTIER";
    else if (n.includes("GIORGIO ARMANI") || n.includes("EMPORIO ARMANI")) realBrand = "GIORGIO ARMANI";
    else if (n.includes("DIOR")) realBrand = "DIOR";
    else if (n.includes("PACO RABANNE")) realBrand = "PACO RABANNE";
    else if (n.includes("AZZARO")) realBrand = "AZZARO";
    else if (n.includes("ARMAF")) realBrand = "ARMAF";
    else if (n.includes("GIVENCHY")) realBrand = "GIVENCHY";
    else {
      // Tomar la primera palabra
      realBrand = parts[1].trim().split(" ")[0];
    }
    
    parts[0] = realBrand;
    item.name = parts.join(";");
  }
});

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");

console.log(`✅ Marcas corregidas dentro de item.name.`);
