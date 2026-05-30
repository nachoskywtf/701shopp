/**
 * SPRINT FINAL — Build Final Catalog
 * ====================================
 * 1. Reads catalog_output.json
 * 2. Cleans metadata (removes any sales/popularity/stock fields)
 * 3. Re-orders Top 20 Otoño 2026 Chile to the front
 * 4. Validates all image links exist on disk
 * 5. Writes clean catalog_output.json + backup
 */

const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.resolve(__dirname, "..", "src", "lib", "catalog_output.json");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const BACKUP_PATH = path.resolve(__dirname, "..", "catalog_backup_" + new Date().toISOString().replace(/[:.]/g, "-") + ".json");

// ── Top 20 Otoño 2026 Chile ────────────────────────────────────────
// These search patterns will match against product names in the catalog.
// Order matters — this is the priority ranking.
const TOP_20_PATTERNS = [
  // 1. Xerjoff - Erba Pura → NOT in catalog, skip
  // 2. Emporio Armani - Stronger With You Intensely 100ml
  { brand: "armani", keywords: ["stronger", "intensely", "100ml"], id: null },
  // 3. Dior - Sauvage Elixir → NOT in catalog, skip  
  // 4. Valentino - Born In Roma Intense → check catalog
  { brand: "valentino", keywords: ["born", "roma"], id: null },
  // 5. Chanel - Bleu de Chanel Parfum → NOT in catalog, skip
  // 6. Versace - Eros Flame
  { brand: "versace", keywords: ["eros", "flame"], id: null },
  // 7. Lattafa - Khamrah 100ML
  { brand: "lattafa", keywords: ["khamrah", "100ml"], exclude: ["dukhan", "desodorante"], id: null },
  // 8. Afnan - 9PM (men 150ml)
  { brand: "afnan", keywords: ["9", "pm", "men"], exclude: ["elixir"], id: null },
  // 9. Jean Paul Gaultier - Le Male Elixir
  { brand: "jean paul gaultier", keywords: ["le", "male", "elixir"], id: null },
  // 10. Azzaro - Most Wanted Parfum 100ml
  { brand: "azzaro", keywords: ["most", "wanted", "parfum", "100ml"], id: null },
  // 11. Lattafa - Asad 100ml
  { brand: "lattafa", keywords: ["asad", "man", "100ml"], exclude: ["bourbon", "elixir", "desodorante", "12"], id: null },
  // 12. Parfums de Marly - Layton → NOT in catalog, skip
  // 13. Tom Ford - Ombré Leather → NOT in catalog (only Tuscan Leather), skip
  // 14. YSL - Myslf
  { brand: "yves saint laurent", keywords: ["myslf"], id: null },
  // 15. Givenchy - Gentleman Reserve Privée → check catalog for Gentleman
  { brand: "givenchy", keywords: ["gentleman"], id: null },
  // 16. Paco Rabanne - Phantom Intense
  { brand: "paco rabanne", keywords: ["phantom", "intense"], id: null },
  // 17. Armani Code - Parfum 75ml
  { brand: "armani", keywords: ["code", "parfum", "75ml"], id: null },
  // 18. Viktor&Rolf - Spicebomb Extreme → check catalog (Metallic Musk is close)
  { brand: "viktor", keywords: ["spicebomb"], exclude: ["infrared", "dark"], id: null },
  // 19. Club de Nuit - Intense Man
  { brand: "armaf", keywords: ["club", "nuit", "intense", "man"], exclude: ["desodorante"], id: null },
  // 20. Maison Alhambra - Jean Lowe Immortal
  { brand: "maison alhambra", keywords: ["jean", "low", "inmortal"], id: null },
];

// ── Load catalog ────────────────────────────────────────────────────
console.log("📂 Loading catalog from:", CATALOG_PATH);
const rawData = fs.readFileSync(CATALOG_PATH, "utf8");
let catalog = JSON.parse(rawData);
console.log(`   Total products: ${catalog.length}`);

// ── Step 1: Clean metadata ──────────────────────────────────────────
// Remove any sales/popularity/stock/unidades fields
const FORBIDDEN_FIELDS = [
  "unidades_vendidas", "popularidad", "ventas", "sales",
  "popularity", "sold", "stock", "rating", "reviews",
  "units_sold", "rank"
];

let cleanedCount = 0;
catalog = catalog.map((item) => {
  let modified = false;
  for (const field of FORBIDDEN_FIELDS) {
    if (item.hasOwnProperty(field)) {
      delete item[field];
      modified = true;
    }
  }
  if (modified) cleanedCount++;
  return item;
});
console.log(`🧹 Cleaned ${cleanedCount} products with forbidden fields`);

// ── Step 2: Find Top 20 products ────────────────────────────────────
function matchProduct(catalog, pattern) {
  const matches = catalog.filter((item) => {
    const nameField = (item.name || "").toLowerCase();
    const idField = (item.id || "").toLowerCase();
    const combined = nameField + " " + idField;

    // Check brand
    if (!combined.includes(pattern.brand.toLowerCase())) return false;

    // Check all keywords present
    const allKeywords = pattern.keywords.every((kw) =>
      combined.includes(kw.toLowerCase())
    );
    if (!allKeywords) return false;

    // Check exclusions
    if (pattern.exclude) {
      const anyExcluded = pattern.exclude.some((ex) =>
        combined.includes(ex.toLowerCase())
      );
      if (anyExcluded) return false;
    }

    return true;
  });

  if (matches.length > 0) {
    // Prefer the first match (usually the main product, not a tester/set)
    const nonTester = matches.find(
      (m) => !(m.name || "").toUpperCase().includes("TESTER") &&
             !(m.name || "").toUpperCase().includes("SET ")
    );
    return nonTester || matches[0];
  }
  return null;
}

console.log("\n🏆 Finding Top 20 products...");
const top20Ids = new Set();
const top20Items = [];
const notFound = [];

TOP_20_PATTERNS.forEach((pattern, idx) => {
  const match = matchProduct(catalog, pattern);
  if (match) {
    top20Ids.add(match.id);
    top20Items.push(match);
    console.log(`   ✅ #${idx + 1}: ${match.id}`);
  } else {
    notFound.push(pattern);
    console.log(`   ⚠️  #${idx + 1}: NOT FOUND — brand="${pattern.brand}" keywords=${pattern.keywords.join(",")}`);
  }
});

console.log(`\n   Found: ${top20Items.length} / ${TOP_20_PATTERNS.length}`);

// ── Step 3: Re-order catalog ────────────────────────────────────────
const remainingItems = catalog.filter((item) => !top20Ids.has(item.id));
const finalCatalog = [...top20Items, ...remainingItems];

console.log(`\n📋 Final catalog order:`);
console.log(`   Top 20 at front: ${top20Items.length} items`);
console.log(`   Remaining: ${remainingItems.length} items`);
console.log(`   Total: ${finalCatalog.length} items`);

// ── Step 4: Validate image links ────────────────────────────────────
console.log("\n🔍 Validating image links...");
let validImages = 0;
let missingImages = 0;
let emptyImages = 0;
const missingList = [];

finalCatalog.forEach((item) => {
  if (!item.image || item.image === "") {
    emptyImages++;
    return;
  }

  const imgPath = path.join(PUBLIC_DIR, item.image);
  if (fs.existsSync(imgPath)) {
    validImages++;
  } else {
    missingImages++;
    missingList.push({ id: item.id, image: item.image });
  }

  // Also validate gallery images
  if (item.images && Array.isArray(item.images)) {
    item.images.forEach((img) => {
      if (img && img !== "") {
        const galPath = path.join(PUBLIC_DIR, img);
        if (!fs.existsSync(galPath)) {
          // Don't double count, just log
        }
      }
    });
  }
});

console.log(`   ✅ Valid images: ${validImages}`);
console.log(`   ❌ Missing images: ${missingImages}`);
console.log(`   ⬜ No image set: ${emptyImages}`);

if (missingList.length > 0 && missingList.length <= 20) {
  console.log("\n   Missing image files:");
  missingList.forEach((m) => console.log(`      - ${m.id}: ${m.image}`));
}

// ── Step 5: Save backup and final catalog ───────────────────────────
console.log("\n💾 Saving backup to:", BACKUP_PATH);
fs.writeFileSync(BACKUP_PATH, rawData, "utf8");

console.log("💾 Writing final catalog to:", CATALOG_PATH);
fs.writeFileSync(CATALOG_PATH, JSON.stringify(finalCatalog, null, 4), "utf8");

// Also sync to public/productos.json
const PUBLIC_CATALOG = path.resolve(__dirname, "..", "public", "productos.json");
console.log("💾 Syncing to public/productos.json");
fs.writeFileSync(PUBLIC_CATALOG, JSON.stringify(finalCatalog, null, 4), "utf8");

// ── Summary ─────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log("  ✅  SPRINT FINAL COMPLETE");
console.log("═".repeat(60));
console.log(`  Products:        ${finalCatalog.length}`);
console.log(`  Top 20 at front: ${top20Items.length}`);
console.log(`  Valid images:    ${validImages}`);
console.log(`  Missing images:  ${missingImages}`);
console.log(`  Empty images:    ${emptyImages}`);
console.log(`  Backup:          ${path.basename(BACKUP_PATH)}`);
console.log("═".repeat(60));
