import fs from 'fs/promises';
import path from 'path';

/**
 * Asigna imágenes de alta calidad por marca usando Unsplash Source API
 * Esta estrategia es más confiable que el scraping de motores de búsqueda
 */

const BRAND_IMAGE_MAP = {
  'Chanel': ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Dior': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80'],
  'Paco Rabanne': ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Valentino': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Parfums de Marly': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Amouage': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Versace': ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Montblanc': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Prada': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Nautica': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Issey Miyake': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Bvlgari': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Abercrombie & Fitch': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Coach': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Jimmy Choo': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Tom Ford': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Givenchy': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Bentley': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Hermès': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Guerlain': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Loewe': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Xerjoff': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Mancera': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Montale': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Nishane': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Initio': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Maison Margiela': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Byredo': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Juliette Has a Gun': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Escentric Molecules': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Le Labo': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  'Kilian': ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
  'Clean Reserve': ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'],
  // Default perfume images for other brands
  'default': ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80']
};

async function assignBrandImages() {
  const outputPath = path.join(process.cwd(), 'src/lib/catalog_output.json');
  const raw = await fs.readFile(outputPath, 'utf-8');
  const catalog = JSON.parse(raw);

  let updated = 0;
  const placeholder = 'via.placeholder.com';

  for (const entry of catalog) {
    // Skip if already has real images
    if (entry.image && !entry.image.includes(placeholder) && entry.images && !entry.images.some(i => i.includes(placeholder))) {
      continue;
    }

    // Extract brand from name
    const brand = entry.name.split(';')[0]?.trim() || 'default';
    const images = BRAND_IMAGE_MAP[brand] || BRAND_IMAGE_MAP['default'];

    entry.image = images[0];
    entry.images = images;
    updated++;

    if (updated % 50 === 0) {
      console.log(`✅ ${updated} productos actualizados...`);
    }
  }

  await fs.writeFile(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n✅ Completado. ${updated} productos actualizados con imágenes de marca.`);
  console.log(`📄 Catálogo guardado en ${outputPath}`);
}

assignBrandImages();
