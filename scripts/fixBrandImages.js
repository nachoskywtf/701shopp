import fs from 'fs/promises';
import path from 'path';

// Brand-specific image URLs from Unsplash (different images for each brand)
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

async function fixBrandImages() {
  const catalogPath = path.join(process.cwd(), 'src/lib/catalog_output.json');
  const raw = await fs.readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(raw);
  
  let updated = 0;
  const brandCounts = {};
  
  for (const entry of catalog) {
    const brand = entry.name.split(';')[0]?.trim() || 'default';
    const images = BRAND_IMAGES[brand] || BRAND_IMAGES['default'];
    
    // Add variation based on product ID to make images different within same brand
    const idHash = entry.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = idHash % images.length;
    const rotatedImages = [...images.slice(imageIndex), ...images.slice(0, imageIndex)];
    
    entry.image = rotatedImages[0];
    entry.images = rotatedImages;
    updated++;
    
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    
    if (updated % 100 === 0) {
      console.log(`✅ ${updated} productos actualizados...`);
    }
  }
  
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n✅ Completado. ${updated} productos actualizados con imágenes por marca.`);
  console.log(`📊 Resumen por marca:`);
  Object.entries(brandCounts).forEach(([brand, count]) => {
    console.log(`  - ${brand}: ${count} productos`);
  });
  console.log(`📄 Catálogo guardado en ${catalogPath}`);
}

fixBrandImages();
