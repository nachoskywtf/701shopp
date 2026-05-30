#!/usr/bin/env node
/**
 * FASE 1: ETL & Algoritmo de Filtrado Top 100
 * Pipeline: 438 productos → 100 productos
 * 
 * Heurística de ranking + Hardcoded Top 10 Overrides
 * Exit code 0 = success
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_JSON = path.join(ROOT, "public", "productos.json");
const LIB_JSON = path.join(ROOT, "src", "lib", "catalog_output.json");
const BACKUP_JSON = path.join(ROOT, "catalog_draft_backup.json");

console.log("═══════════════════════════════════════════════");
console.log("  FASE 1: ETL & ALGORITMO DE FILTRADO TOP 100  ");
console.log("═══════════════════════════════════════════════\n");

// ─── Step 1: Load full catalog ───
const rawCatalog = JSON.parse(fs.readFileSync(PUBLIC_JSON, "utf-8"));
const backupCatalog = JSON.parse(fs.readFileSync(BACKUP_JSON, "utf-8"));

// ─── User requested removals ───
const EXCLUDED_IDS = [
  "gucci-guilty-hombre-90ml-edt",
  "halloween-man-75ml-edt"
];
let filteredCatalog = rawCatalog.filter(p => !EXCLUDED_IDS.includes(p.id));

// Add products from backup to fill the gap so we have enough items to filter from
filteredCatalog = filteredCatalog.concat(backupCatalog);

console.log("[FETCH] Loaded " + filteredCatalog.length + " productos from catalog and backup (excluded " + EXCLUDED_IDS.length + ").");

// ─── Step 2: Inject missing mandatory SKUs ───
const NEW_SKUS = [
  {
    id: "xerjoff-erba-pura-100ml-edp",
    name: "XERJOFF;XERJOFF ERBA PURA 100ML EDP ;; $155.000 ; $129.990",
    image: "/img/perfumes/xerjoff_erba_pura_100ml_edp/xerjoff_erba_pura_100ml_edp_1.jpg",
    images: ["/img/perfumes/xerjoff_erba_pura_100ml_edp/xerjoff_erba_pura_100ml_edp_1.jpg"],
    notas: { salida: "Naranja, Limón siciliano", corazon: "Naranja amarga, Frutas", fondo: "Almizcle blanco, Ámbar" },
    duracion: "Larga duración",
    uso: "Para toda ocasión",
    otono: true,
    brand: "XERJOFF"
  },
  {
    id: "dior-miss-dior-edp-100ml-mujer",
    name: "DIOR;DIOR MISS DIOR EDP 100ML MUJER ;; $165.000 ; $119.990",
    image: "/img/perfumes/dior_miss_dior_edp_100ml_mujer/dior_miss_dior_edp_100ml_mujer_1.jpg",
    images: ["/img/perfumes/dior_miss_dior_edp_100ml_mujer/dior_miss_dior_edp_100ml_mujer_1.jpg"],
    notas: { salida: "Lirio del valle", corazon: "Rosa de Grasse, Peonía", fondo: "Almizcle, Madera de sándalo" },
    duracion: "Larga duración",
    uso: "Ideal para cualquier ocasión",
    otono: true,
    brand: "DIOR"
  },
  {
    id: "dior-sauvage-edp-100ml-hombre",
    name: "DIOR;DIOR SAUVAGE EDP 100ML HOMBRE ;; $160.000 ; $114.990",
    image: "/img/perfumes/dior_sauvage_edp_100ml_hombre/dior_sauvage_edp_100ml_hombre_1.jpg",
    images: ["/img/perfumes/dior_sauvage_edp_100ml_hombre/dior_sauvage_edp_100ml_hombre_1.jpg"],
    notas: { salida: "Bergamota de Calabria", corazon: "Pimienta de Sichuan, Lavanda", fondo: "Ambroxan, Cedro de Virginia" },
    duracion: "Larga duración",
    uso: "Para toda ocasión",
    otono: true,
    brand: "DIOR"
  },
  {
    id: "chanel-bleu-de-chanel-edp-100ml-hombre",
    name: "CHANEL;CHANEL BLEU DE CHANEL EDP 100ML HOMBRE ;; $170.000 ; $119.990",
    image: "/img/perfumes/chanel_bleu_de_chanel_edp_100ml_hombre/chanel_bleu_de_chanel_edp_100ml_hombre_1.jpg",
    images: ["/img/perfumes/chanel_bleu_de_chanel_edp_100ml_hombre/chanel_bleu_de_chanel_edp_100ml_hombre_1.jpg"],
    notas: { salida: "Limón, Menta, Pomelo", corazon: "Jengibre, Nuez moscada, Jazmín", fondo: "Cedro, Sándalo, Incienso" },
    duracion: "Larga duración",
    uso: "Para toda ocasión",
    otono: true,
    brand: "CHANEL"
  },
  {
    id: "valentino-uomo-born-in-roma-100ml-edt",
    name: "VALENTINO;VALENTINO UOMO BORN IN ROMA EDT 100ML HOMBRE ;; $120.000 ; $99.990",
    image: "/img/perfumes/valentino_uomo_born_in_roma_100ml_edt/valentino_uomo_born_in_roma_100ml_edt_1.jpg",
    images: ["/img/perfumes/valentino_uomo_born_in_roma_100ml_edt/valentino_uomo_born_in_roma_100ml_edt_1.jpg"],
    notas: { salida: "Hojas de violeta, Sal, Minerales", corazon: "Salvia, Jengibre", fondo: "Vetiver, Notas amaderadas" },
    duracion: "Larga duración",
    uso: "Para toda ocasión",
    otono: true,
    brand: "VALENTINO"
  },
  {
    id: "valentino-donna-born-in-roma-100ml-edp",
    name: "VALENTINO;VALENTINO DONNA BORN IN ROMA EDP 100ML MUJER ;; $130.000 ; $109.990",
    image: "/img/perfumes/valentino_donna_born_in_roma_100ml_edp/valentino_donna_born_in_roma_100ml_edp_1.jpg",
    images: ["/img/perfumes/valentino_donna_born_in_roma_100ml_edp/valentino_donna_born_in_roma_100ml_edp_1.jpg"],
    notas: { salida: "Grosellas negras, Bergamota, Pimienta rosa", corazon: "Jazmín sambac, Jazmín, Té de jazmín", fondo: "Vainilla Bourbon, Cachemira, Madera de gaiac" },
    duracion: "Larga duración",
    uso: "Para toda ocasión",
    otono: true,
    brand: "VALENTINO"
  }
];

// Only inject if not already present
let catalog = [...filteredCatalog];
NEW_SKUS.forEach(function(sku) {
  var exists = catalog.some(function(p) { return p.id === sku.id; });
  if (!exists) {
    catalog.push(sku);
    console.log("[INJECT] Added missing SKU: " + sku.id);
  } else {
    console.log("[SKIP] SKU already exists: " + sku.id);
  }
});

console.log("[MERGE] Catalog now has " + catalog.length + " productos.\n");

// ─── Step 3: Demand Heuristic Scoring ───
console.log("[HEURISTIC] Applying market demand scoring...");

// Brand Tier Classification (40% weight)
var BRAND_TIER = {
  // Tier S - Ultra Luxury (score 100)
  S: ["XERJOFF", "TOM FORD", "CREED"],
  // Tier A - Premium Houses (score 85)
  A: ["DIOR", "CHANEL", "JEAN PAUL GAULTIER", "GIORGIO ARMANI", "YVES SAINT LAURENT",
      "VERSACE", "GUCCI", "PACO RABANNE", "VALENTINO", "GIVENCHY", "BURBERRY"],
  // Tier B - Mid-Premium (score 70)  
  B: ["CAROLINA HERRERA", "DOLCE", "HUGO BOSS", "CALVIN KLEIN", "RALPH LAUREN",
      "THIERRY MUGLER", "MUGLER", "MARC JACOBS", "MOSCHINO", "VIKTOR & ROLF",
      "AZZARO", "DIESEL", "LANCOME", "MONT BLANC", "MONTBLANC", "ISSEY MIYAKE",
      "TOMMY HILFIGER"],
  // Tier C - Accessible Premium (score 55)
  C: ["LATTAFA", "ARMAF", "AFNAN", "AL HARAMAIN", "MAISON ALHAMBRA", "RASASI",
      "ARIANA GRANDE", "CACHAREL", "DAVIDOFF", "HALLOWEEN", "ANTONIO BANDERAS",
      "BRITNEY SPEARS", "DKNY", "ESCADA", "BENETTON", "BIOTHERM", "GUY LAROCHE",
      "VICTORINOX"],
  // Tier D - Niche/Unknown (score 40)
  D: ["FRAGRANCE WORLD", "FRAGANCE WORLD", "PARIS CORNER", "ARD AL", "ASDAAF",
      "JO MILANO", "KHADLAJ", "ORIENTICA", "VICTORIA SECRET", "VOLARÉ", "RAYHAAN"]
};

// Top sellers 2026 - Global fragrance trends (30% weight)
var TOP_SELLERS_2026 = [
  "erba pura", "le male elixir", "divine", "miss dior", "sauvage",
  "eros", "bleu de chanel", "stronger with you", "khamrah", "the most wanted",
  "black opium", "good girl", "la vie est belle", "light blue", "acqua di gio",
  "invictus", "one million", "born in roma", "phantom", "gentleman",
  "alien", "angel", "libre", "myslf", "code parfum",
  "club de nuit", "9 pm", "asad", "spicebomb", "amber oud",
  "guilty", "bloom", "cloud", "toy boy", "cool water",
  "ck one", "allure homme", "aventus", "baccarat", "interlude",
  "la nuit", "fierce", "bad boy", "212", "ch men",
  "halloween man", "fuel for life", "red tobacco", "hawas", "hayati",
  "royal musk"
];

function getBrandTier(brand) {
  var cleanBrand = brand.split(";")[0].trim().toUpperCase();
  if (BRAND_TIER.S.indexOf(cleanBrand) !== -1) return 100;
  if (BRAND_TIER.A.indexOf(cleanBrand) !== -1) return 85;
  if (BRAND_TIER.B.indexOf(cleanBrand) !== -1) return 70;
  if (BRAND_TIER.C.indexOf(cleanBrand) !== -1) return 55;
  if (BRAND_TIER.D.indexOf(cleanBrand) !== -1) return 40;
  // Check partial matches for multi-word brands
  for (var i = 0; i < BRAND_TIER.A.length; i++) {
    if (cleanBrand.includes(BRAND_TIER.A[i]) || BRAND_TIER.A[i].includes(cleanBrand)) return 82;
  }
  for (var j = 0; j < BRAND_TIER.B.length; j++) {
    if (cleanBrand.includes(BRAND_TIER.B[j]) || BRAND_TIER.B[j].includes(cleanBrand)) return 67;
  }
  return 35; // Unknown
}

function getPopularityScore(product) {
  var nameAndId = (product.name + " " + product.id).toLowerCase();
  var score = 0;
  var matchCount = 0;
  TOP_SELLERS_2026.forEach(function(term) {
    if (nameAndId.includes(term)) {
      matchCount++;
      score += 100;
    }
  });
  // Bonus for multiple matches
  if (matchCount > 1) score += matchCount * 20;
  return Math.min(score, 100);
}

function getPriceScore(product) {
  // Extract price from name string
  var parts = product.name.split(";");
  var priceStr = (parts[4] || "0").replace(/[^\d]/g, "");
  var price = parseInt(priceStr, 10) || 0;
  
  // Sweet spot: $25K-$120K CLP
  if (price >= 25000 && price <= 120000) return 100;
  if (price >= 15000 && price < 25000) return 75;
  if (price > 120000 && price <= 180000) return 70;
  if (price > 180000) return 50;
  if (price < 15000) return 40;
  return 60;
}

// Score every product
catalog = catalog.map(function(p) {
  var brandScore = getBrandTier(p.brand);
  var popScore = getPopularityScore(p);
  var priceScore = getPriceScore(p);
  
  // Weighted aggregate (brand 40%, popularity 30%, price 15%, base 15%)
  var demandScore = (brandScore * 0.40) + (popScore * 0.30) + (priceScore * 0.15) + (15);
  
  // Bonus: products with multiple images (better presentation)
  if (p.images && p.images.length >= 3) demandScore += 5;
  
  // Bonus: has notes filled
  if (p.notas && p.notas.salida && p.notas.salida.length > 0) demandScore += 3;
  
  // Penalty: testers
  if (p.id.toLowerCase().startsWith("tester")) demandScore -= 15;
  
  // Penalty: duplicate brand in brand field (data quality issue)
  if (p.brand.includes(";")) demandScore -= 2;
  
  p._demandScore = Math.round(demandScore * 100) / 100;
  return p;
});

// Sort by demand score descending
catalog.sort(function(a, b) { return b._demandScore - a._demandScore; });

console.log("[HEURISTIC] Top 20 by score (before overrides):");
catalog.slice(0, 20).forEach(function(p, i) {
  console.log("  " + (i + 1) + ". [" + p._demandScore + "] " + p.id);
});

// ─── Step 4: Hardcoded Top 10 Overrides ───
console.log("\n[OVERRIDE] Applying hardcoded Top 10...");

var TOP_10_IDS = [
  "xerjoff-erba-pura-100ml-edp",
  "jean-paul-gaultier-le-male-elixir-parfum-75-ml",
  "jean-paul-gaultier-divine-edp-100-ml-refillable-mujer",
  "dior-miss-dior-edp-100ml-mujer",
  "dior-sauvage-edp-100ml-hombre",
  "versace-eros-man-100ml-edp",
  "chanel-bleu-de-chanel-edp-100ml-hombre",
  "emporio-armani-stronger-with-you-intensely-man-100ml-edp",
  "lattafa-khamrah-100ml-edp",
  "azzaro-the-most-wanted-hombre-eau-de-parfum-intense-100ml-edp"
];

// Extract top 10 from catalog
var top10 = [];
TOP_10_IDS.forEach(function(id) {
  var idx = -1;
  for (var i = 0; i < catalog.length; i++) {
    if (catalog[i].id === id) { idx = i; break; }
  }
  if (idx !== -1) {
    top10.push(catalog.splice(idx, 1)[0]);
    console.log("  ✓ Override #" + top10.length + ": " + id);
  } else {
    console.log("  ✗ WARNING: SKU not found for override: " + id);
  }
});

// ─── Step 5: Gender balance enforcement ───
// Target: ~45% Hombre, ~35% Mujer, ~20% Unisex for remaining 90 slots
var remaining = catalog;
var hombre = [];
var mujer = [];
var unisex = [];

remaining.forEach(function(p) {
  var nameUpper = p.name.toUpperCase();
  if (nameUpper.includes("HOMBRE") || nameUpper.includes("HOMME") || nameUpper.includes("MEN ") || nameUpper.includes("MAN ") || nameUpper.includes("FOR HIM") || nameUpper.includes("POUR HOMME")) {
    hombre.push(p);
  } else if (nameUpper.includes("MUJER") || nameUpper.includes("FEMME") || nameUpper.includes("WOMAN") || nameUpper.includes("WOMEN") || nameUpper.includes("FOR HER") || nameUpper.includes("POUR FEMME")) {
    mujer.push(p);
  } else {
    unisex.push(p);
  }
});

console.log("\n[BALANCE] Gender distribution (after top 10 removal):");
console.log("  Hombre: " + hombre.length + ", Mujer: " + mujer.length + ", Unisex: " + unisex.length);

// Target slots for remaining 90: 40 Hombre, 30 Mujer, 20 Unisex
var targetH = 40, targetM = 30, targetU = 20;

// Already sorted by demandScore descending, pick top N from each
var selectedH = hombre.slice(0, targetH);
var selectedM = mujer.slice(0, targetM);
var selectedU = unisex.slice(0, targetU);

// If any category is short, redistribute slots
var total = selectedH.length + selectedM.length + selectedU.length;
if (total < 90) {
  var deficit = 90 - total;
  // Fill from whichever category has more remaining
  var allRemaining = [];
  if (selectedH.length < targetH) allRemaining = allRemaining.concat(mujer.slice(targetM), unisex.slice(targetU));
  else allRemaining = allRemaining.concat(hombre.slice(targetH), mujer.slice(targetM), unisex.slice(targetU));
  allRemaining.sort(function(a, b) { return b._demandScore - a._demandScore; });
  
  if (deficit <= allRemaining.length) {
    var extra = allRemaining.slice(0, deficit);
    // Add them to the appropriate arrays (doesn't matter which, they'll be merged)
    selectedH = selectedH.concat(extra);
  }
}

// Merge: Top 10 + rest sorted by demand
var rest = selectedH.concat(selectedM, selectedU);
rest.sort(function(a, b) { return b._demandScore - a._demandScore; });

var finalCatalog = top10.concat(rest);

// ─── Step 6: Truncate to 100 ───
if (finalCatalog.length > 100) {
  finalCatalog = finalCatalog.slice(0, 100);
}

console.log("\n[TRUNCATE] Final catalog: " + finalCatalog.length + " productos.");

// ─── Step 7: Clean output ───
// Remove internal scoring field and clean brand names
finalCatalog = finalCatalog.map(function(p) {
  // Clean brand: "Al Haramain;AL" → "Al Haramain"
  var cleanBrand = p.brand.split(";")[0].trim();
  // Normalize case: if all caps and > 3 chars, title case it
  if (cleanBrand === cleanBrand.toUpperCase() && cleanBrand.length > 3) {
    cleanBrand = cleanBrand.split(" ").map(function(w) {
      if (w.length <= 2) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(" ");
  }
  
  var cleaned = {
    id: p.id,
    name: p.name,
    image: p.image,
    images: p.images,
    notas: p.notas,
    duracion: p.duracion,
    uso: p.uso,
    brand: cleanBrand
  };
  if (p.otono) cleaned.otono = true;
  return cleaned;
});

// ─── Step 8: Write outputs ───
var outputStr = JSON.stringify(finalCatalog, null, 4);

fs.writeFileSync(PUBLIC_JSON, outputStr, "utf-8");
console.log("[WRITE] public/productos.json (" + finalCatalog.length + " items, " + Math.round(outputStr.length / 1024) + "KB)");

fs.writeFileSync(LIB_JSON, outputStr, "utf-8");
console.log("[WRITE] src/lib/catalog_output.json (synced)");

// ─── Step 9: Backup draft ───
var draftProducts = rawCatalog.filter(function(p) {
  return !finalCatalog.some(function(f) { return f.id === p.id; });
});
fs.writeFileSync(BACKUP_JSON, JSON.stringify(draftProducts, null, 2), "utf-8");
console.log("[BACKUP] " + draftProducts.length + " productos moved to draft: catalog_draft_backup.json");

// ─── Final Report ───
console.log("\n═══════════════════════════════════════════════");
console.log("  FASE 1 COMPLETE");
console.log("═══════════════════════════════════════════════");
console.log("  Input:    " + rawCatalog.length + " productos");
console.log("  Injected: " + NEW_SKUS.length + " mandatory SKUs");
console.log("  Output:   " + finalCatalog.length + " productos");
console.log("  Backup:   " + draftProducts.length + " productos (draft)");

// Gender report
var gH = 0, gM = 0, gU = 0;
finalCatalog.forEach(function(p) {
  var nameUpper = p.name.toUpperCase();
  if (nameUpper.includes("HOMBRE") || nameUpper.includes("HOMME") || nameUpper.includes("MEN ") || nameUpper.includes("MAN ") || nameUpper.includes("FOR HIM")) gH++;
  else if (nameUpper.includes("MUJER") || nameUpper.includes("FEMME") || nameUpper.includes("WOMAN") || nameUpper.includes("WOMEN") || nameUpper.includes("FOR HER")) gM++;
  else gU++;
});
console.log("  Gender: H=" + gH + " M=" + gM + " U=" + gU);

// Verify top 10
console.log("\n  Top 10 verified:");
TOP_10_IDS.forEach(function(id, i) {
  var pos = -1;
  for (var j = 0; j < finalCatalog.length; j++) {
    if (finalCatalog[j].id === id) { pos = j; break; }
  }
  console.log("    " + (i + 1) + ". " + (pos !== -1 ? "✓" : "✗") + " " + id + " (pos " + pos + ")");
});

console.log("\n  Exit code: 0");
process.exit(0);
