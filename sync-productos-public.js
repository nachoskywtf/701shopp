import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════════════');
console.log(' SINCRONIZANDO productos.json A /public');
console.log('═══════════════════════════════════════════════════════════════\n');

// Origen: catalog_output.json (tiene las rutas de imagen)
const sourcePath = 'src/lib/catalog_output.json';
// Destino: public/productos.json (accesible desde navegador)
const destPath = 'public/productos.json';

if (!fs.existsSync(sourcePath)) {
  console.error(`❌ No existe: ${sourcePath}`);
  process.exit(1);
}

// Leer el JSON de origen
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
console.log(`📄 Leído: ${sourcePath}`);
console.log(`   - Total productos: ${sourceData.length}`);

// Verificar cuántos tienen imágenes
let conImagen = 0;
let sinImagen = 0;

sourceData.forEach(p => {
  const hasImage = p.image || (p.images && p.images.length > 0);
  if (hasImage) conImagen++;
  else sinImagen++;
});

console.log(`   - Con imagen: ${conImagen}`);
console.log(`   - Sin imagen: ${sinImagen}`);

// Asegurar que existe el directorio destino
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`📁 Creado directorio: ${destDir}`);
}

// Copiar el archivo
fs.writeFileSync(destPath, JSON.stringify(sourceData, null, 2));
console.log(`✅ Copiado a: ${destPath}`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(' SINCRONIZACIÓN COMPLETADA');
console.log('═══════════════════════════════════════════════════════════════\n');
