const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

// Función para inferir marca desde el nombre
function extractBrand(name) {
  const n = name.toUpperCase();
  if (n.includes("VALENTINO")) return "VALENTINO";
  if (n.includes("VERSACE")) return "VERSACE";
  if (n.includes("EMPORIO ARMANI") || n.includes("GIORGIO ARMANI") || n.includes("ARMANI CODE")) return "GIORGIO ARMANI";
  if (n.includes("XERJOFF")) return "XERJOFF";
  if (n.includes("DIOR") || n.includes("SAUVAGE")) return "DIOR";
  if (n.includes("CHANEL")) return "CHANEL";
  if (n.includes("LATTAFA") || n.includes("KHAMRAH") || n.includes("ASAD")) return "LATTAFA";
  if (n.includes("AFNAN")) return "AFNAN";
  if (n.includes("JEAN PAUL GAULTIER") || n.includes("LE MALE")) return "JEAN PAUL GAULTIER";
  if (n.includes("AZZARO")) return "AZZARO";
  if (n.includes("PARFUMS DE MARLY") || n.includes("LAYTON")) return "PARFUMS DE MARLY";
  if (n.includes("TOM FORD")) return "TOM FORD";
  if (n.includes("YSL") || n.includes("MYSLF") || n.includes("YVES SAINT LAURENT")) return "YVES SAINT LAURENT";
  if (n.includes("GIVENCHY")) return "GIVENCHY";
  if (n.includes("PACO RABANNE") || n.includes("RABANNE")) return "PACO RABANNE";
  if (n.includes("VIKTOR") && n.includes("ROLF")) return "VIKTOR & ROLF";
  if (n.includes("CLUB DE NUIT") || n.includes("ARMAF")) return "ARMAF";
  if (n.includes("MAISON ALHAMBRA") || n.includes("JEAN LOWE")) return "MAISON ALHAMBRA";
  
  const words = name.split(" ");
  return words[0] + (words.length > 1 ? " " + words[1] : ""); // Fallback
}

catalog.forEach(item => {
  // 1. Fix POR DEFINIR
  if (!item.brand || item.brand === "POR DEFINIR") {
    item.brand = extractBrand(item.name);
  }
  
  // 2. Limpieza de metadatos de ventas
  delete item.sold_count;
  delete item.sales;
  delete item.unidades_vendidas;
  delete item.popularity;
});

// El orden ya fue establecido en el paso anterior, pero nos aseguramos
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 4), "utf8");
fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(catalog, null, 4), "utf8");

console.log(`✅ Catálogo limpiado. Marcas corregidas y métricas de ventas eliminadas en ${catalog.length} productos.`);
