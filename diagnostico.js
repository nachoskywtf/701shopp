import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════════════');
console.log(' DIAGNÓSTICO DEL PROYECTO');
console.log('═══════════════════════════════════════════════════════════════\n');

// Detectar framework
console.log('📦 FRAMEWORK:');
const hasNextConfig = fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs');
const hasViteConfig = fs.existsSync('vite.config.js') || fs.existsSync('vite.config.ts');
const hasPackageJson = fs.existsSync('package.json');

if (hasPackageJson) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('  - Dependencies:', Object.keys(pkg.dependencies || {}).slice(0, 5).join(', '));
  if (pkg.dependencies?.next) console.log('  ✅ Next.js detectado');
  if (pkg.dependencies?.vite) console.log('  ✅ Vite detectado');
  if (pkg.dependencies?.['@tanstack/react-router']) console.log('  ✅ TanStack Router detectado');
}

// Buscar JSON de productos
console.log('\n📄 ARCHIVOS JSON DE PRODUCTOS:');
const possibleJsonPaths = [
  'productos.json',
  'src/lib/catalog_output.json',
  'src/data/products.json',
  'public/productos.json',
  'data/products.json'
];

let foundJson = null;
for (const jsonPath of possibleJsonPaths) {
  if (fs.existsSync(jsonPath)) {
    foundJson = jsonPath;
    console.log(`  ✅ Encontrado: ${jsonPath}`);
    break;
  }
}

if (!foundJson) {
  console.log('  ❌ No se encontró ningún JSON de productos');
} else {
  const jsonContent = JSON.parse(fs.readFileSync(foundJson, 'utf8'));
  console.log(`  - Total productos: ${jsonContent.length}`);
  
  if (jsonContent.length > 0) {
    const firstProduct = jsonContent[0];
    console.log('\n📋 CAMPOS DEL PRIMER PRODUCTO:');
    console.log('  - Keys:', Object.keys(firstProduct).join(', '));
    
    // Detectar nombres de campos de imagen
    const imageFields = Object.keys(firstProduct).filter(k => 
      k.toLowerCase().includes('image') || 
      k.toLowerCase().includes('imagen') ||
      k.toLowerCase().includes('photo') ||
      k.toLowerCase().includes('img')
    );
    console.log('\n🖼️  CAMPOS DE IMAGEN:');
    if (imageFields.length > 0) {
      imageFields.forEach(field => {
        const val = firstProduct[field];
        if (Array.isArray(val)) {
          console.log(`  - ${field}: [${val.length} imágenes]`);
          if (val.length > 0) console.log(`    Ejemplo: ${val[0]}`);
        } else {
          console.log(`  - ${field}: ${val}`);
        }
      });
    } else {
      console.log('  ❌ No se detectaron campos de imagen');
    }
  }
}

// Verificar carpeta de imágenes
console.log('\n📁 CARPETA DE IMÁGENES:');
const imgDirs = [
  'public/img/perfumes',
  'public/images',
  'public/img',
  'assets/images'
];

let foundImgDir = null;
for (const imgDir of imgDirs) {
  if (fs.existsSync(imgDir)) {
    foundImgDir = imgDir;
    const files = fs.readdirSync(imgDir);
    const imageFiles = files.filter(f => 
      f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    );
    console.log(`  ✅ ${imgDir}`);
    console.log(`  - Total archivos: ${files.length}`);
    console.log(`  - Archivos de imagen: ${imageFiles.length}`);
    if (imageFiles.length > 0) {
      console.log(`  - Ejemplos: ${imageFiles.slice(0, 3).join(', ')}`);
    }
    break;
  }
}

if (!foundImgDir) {
  console.log('  ❌ No se encontró carpeta de imágenes');
}

// Verificar componentes de producto
console.log('\n🧩 COMPONENTES DE PRODUCTO:');
const componentDirs = [
  'src/components',
  'components'
];

for (const compDir of componentDirs) {
  if (fs.existsSync(compDir)) {
    const files = fs.readdirSync(compDir);
    const productCards = files.filter(f => 
      f.toLowerCase().includes('product') || 
      f.toLowerCase().includes('card')
    );
    if (productCards.length > 0) {
      console.log(`  ✅ ${compDir}:`);
      productCards.forEach(f => console.log(`    - ${f}`));
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(' FIN DEL DIAGNÓSTICO');
console.log('═══════════════════════════════════════════════════════════════\n');
