#!/usr/bin/env node
/**
 * FASE 3: QA AUTOMATIZADO Y VERIFICACIÓN DE SISTEMA
 * Health check before push to production
 * Exit code 0 = ALL TESTS PASS
 * Exit code 1 = TESTS FAILED
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_JSON = path.join(ROOT, "public", "productos.json");
const LIB_JSON = path.join(ROOT, "src", "lib", "catalog_output.json");
const PUBLIC = path.join(ROOT, "public");

console.log("═══════════════════════════════════════════════");
console.log("  FASE 3: QA AUTOMATIZADO & HEALTH CHECK       ");
console.log("═══════════════════════════════════════════════\n");

let passed = 0;
let failed = 0;

function test(name, condition, detail) {
  if (condition) {
    console.log("  ✓ PASS: " + name);
    passed++;
  } else {
    console.log("  ✗ FAIL: " + name + (detail ? " — " + detail : ""));
    failed++;
  }
}

// ─── Test 1: File existence ───
console.log("[TEST GROUP] File Integrity\n");

test("public/productos.json exists", fs.existsSync(PUBLIC_JSON));
test("src/lib/catalog_output.json exists", fs.existsSync(LIB_JSON));

// ─── Test 2: JSON sync ───
var pubContent = fs.readFileSync(PUBLIC_JSON, "utf-8");
var libContent = fs.readFileSync(LIB_JSON, "utf-8");
var pubHash = crypto.createHash("md5").update(pubContent).digest("hex");
var libHash = crypto.createHash("md5").update(libContent).digest("hex");

test("JSON files are synchronized (hash match)", pubHash === libHash,
     pubHash !== libHash ? "pub=" + pubHash + " lib=" + libHash : "");

// ─── Test 3: Exactly 100 nodes ───
var pubData = JSON.parse(pubContent);
var libData = JSON.parse(libContent);

test("public/productos.json has exactly 100 products", pubData.length === 100,
     "Found " + pubData.length);
test("catalog_output.json has exactly 100 products", libData.length === 100,
     "Found " + libData.length);

// ─── Test 4: No sold_count field ───
console.log("\n[TEST GROUP] Data Cleanliness\n");

var hasSoldCount = pubData.some(function(p) { return p.sold_count !== undefined; });
test("No 'sold_count' fields present", !hasSoldCount);

// ─── Test 5: No null values ───
var nullCount = 0;
pubData.forEach(function(p) {
  Object.keys(p).forEach(function(key) {
    if (p[key] === null) nullCount++;
  });
});
test("No null values in any field", nullCount === 0, "Found " + nullCount + " null values");

// ─── Test 6: No "POR DEFINIR" ───
var porDefinir = 0;
pubData.forEach(function(p) {
  var str = JSON.stringify(p);
  if (str.includes("POR DEFINIR")) porDefinir++;
});
test("No 'POR DEFINIR' strings", porDefinir === 0, "Found " + porDefinir + " instances");

// ─── Test 7: All required fields ───
var missingFields = 0;
var requiredFields = ["id", "name", "image", "images", "brand"];
pubData.forEach(function(p, i) {
  requiredFields.forEach(function(field) {
    if (p[field] === undefined || p[field] === "") {
      missingFields++;
    }
  });
});
test("All products have required fields (id, name, image, images, brand)",
     missingFields === 0, "Found " + missingFields + " missing fields");

// ─── Test 8: Unique IDs ───
var ids = pubData.map(function(p) { return p.id; });
var uniqueIds = new Set(ids);
test("All product IDs are unique", uniqueIds.size === pubData.length,
     "Found " + (pubData.length - uniqueIds.size) + " duplicates");

// ─── Test 9: Hardcoded overrides present in top 10 ───
console.log("\n[TEST GROUP] Hardcoded Overrides\n");

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

TOP_10_IDS.forEach(function(id, i) {
  var pos = -1;
  for (var j = 0; j < pubData.length; j++) {
    if (pubData[j].id === id) { pos = j; break; }
  }
  test("Override #" + (i+1) + " in top 10: " + id.substring(0, 40) + "...",
       pos >= 0 && pos < 10, pos === -1 ? "NOT FOUND" : "at position " + pos);
});

// ─── Test 10: Asset existence check ───
console.log("\n[TEST GROUP] Asset Status Check\n");

var missingAssets = 0;
var smallAssets = 0;
var validAssets = 0;

pubData.forEach(function(p) {
  var imgPath = path.join(PUBLIC, p.image);
  if (fs.existsSync(imgPath)) {
    var size = fs.statSync(imgPath).size;
    if (size < 20 * 1024) {
      smallAssets++;
    } else {
      validAssets++;
    }
  } else {
    missingAssets++;
  }
});

test("Image files exist (" + validAssets + " valid)",
     missingAssets <= 4, // Allow 4 missing for new products
     missingAssets + " missing, " + smallAssets + " under 40KB");

console.log("  → Valid: " + validAssets + ", Missing: " + missingAssets + ", Small: " + smallAssets);

// ─── Test 11: Brand cleanliness ───
console.log("\n[TEST GROUP] Data Quality\n");

var dirtyBrands = pubData.filter(function(p) { return p.brand.includes(";"); });
test("No semicolons in brand names", dirtyBrands.length === 0,
     "Found " + dirtyBrands.length + " dirty brands");

// ─── Test 12: Gender distribution ───
var gH = 0, gM = 0, gU = 0;
pubData.forEach(function(p) {
  var nameUpper = p.name.toUpperCase();
  if (nameUpper.includes("HOMBRE") || nameUpper.includes("HOMME") || nameUpper.includes("MEN ") || nameUpper.includes("MAN ")) gH++;
  else if (nameUpper.includes("MUJER") || nameUpper.includes("FEMME") || nameUpper.includes("WOMAN") || nameUpper.includes("WOMEN")) gM++;
  else gU++;
});
test("Gender balance reasonable (H=" + gH + " M=" + gM + " U=" + gU + ")",
     gH >= 20 && gM >= 15 && gU >= 5,
     "Imbalanced");

// ─── Final Report ───
console.log("\n═══════════════════════════════════════════════");
console.log("  FASE 3: QA COMPLETE");
console.log("═══════════════════════════════════════════════");
console.log("  Passed: " + passed + "/" + (passed + failed));
console.log("  Failed: " + failed + "/" + (passed + failed));

if (failed > 0) {
  console.log("\n  ⚠ SOME TESTS FAILED — Review above for details.");
  console.log("  Exit code: 1");
  process.exit(1);
} else {
  console.log("\n  ✓ ALL TESTS PASSED — System ready for production.");
  console.log("  Exit code: 0");
  process.exit(0);
}
