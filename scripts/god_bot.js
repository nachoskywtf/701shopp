import fs from 'fs/promises';
import path from 'path';

const ARCHIVO_DB = path.join(process.cwd(), 'src/lib/catalog_output.json');
const CARPETA_FOTOS = path.join(process.cwd(), 'public', 'img', 'perfumes');

// Brand-specific Unsplash image URLs (different for each brand)
const BRAND_IMAGES = {
  'AFNAN': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Agua Brava': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Ajmal': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Al Haramain': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Chanel': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Dior': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Paco Rabanne': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Valentino': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Parfums de Marly': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Amouage': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Versace': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Montblanc': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Prada': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Nautica': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Issey Miyake': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Bvlgari': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Abercrombie & Fitch': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Coach': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Jimmy Choo': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Tom Ford': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Givenchy': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Bentley': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Hermès': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Guerlain': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Loewe': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Xerjoff': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Mancera': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Montale': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Nishane': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Initio': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Maison Margiela': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Byredo': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Juliette Has a Gun': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Escentric Molecules': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
  ],
  'Le Labo': [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'Kilian': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'
  ],
  'Clean Reserve': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'
  ]
};

async function buscarYActualizar() {
  console.log('🚀 INICIANDO MODO DIOS: Búsqueda y Actualización de DB...');
  
  // Leer base de datos
  const raw = await fs.readFile(ARCHIVO_DB, 'utf-8');
  const productos = JSON.parse(raw);
  
  // Crear carpeta de fotos
  await fs.mkdir(CARPETA_FOTOS, { recursive: true });
  
  let modificados = 0;
  let fallidos = 0;
  
  for (let i = 0; i < productos.length; i++) {
    const prod = productos[i];
    const marca = prod.name.split(';')[0]?.trim() || 'default';
    const nombre = prod.name.split(';')[1]?.trim() || prod.name;
    
    // Verificar si ya tiene imagen local válida
    if (prod.image && prod.image.startsWith('/img/perfumes/') && !prod.image.includes('coco')) {
      continue;
    }
    
    const nombreLimpio = nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const nombreArchivo = `${nombreLimpio}.jpg`;
    const rutaFisica = path.join(CARPETA_FOTOS, nombreArchivo);
    const rutaWeb = `/img/perfumes/${nombreArchivo}`;
    
    // Obtener imágenes de la marca
    const imagenesMarca = BRAND_IMAGES[marca] || BRAND_IMAGES['default'];
    
    // Rotar imágenes basado en ID para variación
    const idHash = prod.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imgUrl = imagenesMarca[idHash % imagenesMarca.length];
    
    console.log(`🔍 [${i + 1}/${productos.length}] Procesando: ${marca} ${nombre.substring(0, 40)}...`);
    
    try {
      // Descargar imagen
      const response = await fetch(imgUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Guardar imagen localmente
      await fs.writeFile(rutaFisica, buffer);
      
      // Inyección en la base de datos
      prod.image = rutaWeb;
      prod.images = [rutaWeb];
      
      modificados++;
      console.log(`  ✅ Guardada y enlazada: ${rutaWeb} (${buffer.length} bytes)`);
      
      // Pausa breve
      await new Promise(r => setTimeout(r, 100));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      fallidos++;
    }
  }
  
  // Sobrescribir la base de datos
  await fs.writeFile(ARCHIVO_DB, JSON.stringify(productos, null, 2), 'utf-8');
  
  console.log(`\n🎉 ¡ÉXITO! ${modificados} productos actualizados en la base de datos.`);
  console.log(`⚠️ Fallidos: ${fallidos}`);
  console.log(`📄 Base de datos guardada en: ${ARCHIVO_DB}`);
}

buscarYActualizar();
