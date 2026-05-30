import fs from 'fs/promises';
import path from 'path';

async function assignProductSpecificImages() {
  const catalogPath = path.join(process.cwd(), 'src/lib/catalog_output.json');
  const raw = await fs.readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(raw);
  
  let updated = 0;
  
  for (const entry of catalog) {
    const brand = entry.name.split(';')[0]?.trim() || 'perfume';
    const productName = entry.name.split(';')[1]?.trim() || entry.name;
    
    // Clean product name for search query
    const cleanName = productName
      .replace(/\d+\s*(ML|EDT|EDP|EXTRAIT|PARFUM|INTENSE)?/gi, '')
      .replace(/;|;|;|;/g, '')
      .replace(/\$/g, '')
      .replace(/NUEVO/gi, '')
      .trim();
    
    // Generate 3 different images using Unsplash Source with different queries
    const queries = [
      `${brand} ${cleanName} perfume bottle`,
      `${cleanName} fragrance`,
      `${brand} perfume luxury`
    ];
    
    const images = queries.map((query, i) => 
      `https://source.unsplash.com/800x1000/?${encodeURIComponent(query)}&sig=${entry.id}-${i}`
    );
    
    entry.image = images[0];
    entry.images = images;
    updated++;
    
    if (updated % 100 === 0) {
      console.log(`✅ ${updated} productos actualizados...`);
    }
  }
  
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n✅ Completado. ${updated} productos actualizados con imágenes específicas por producto.`);
  console.log(`📄 Catálogo guardado en ${catalogPath}`);
}

assignProductSpecificImages();
