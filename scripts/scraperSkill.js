import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Web Scraper Skill para Catálogo de Perfumes
 * Busca 3 imágenes en alta calidad desde Google Images
 * y extrae las notas olfativas desde Fragrantica.
 */

const NUM_IMAGES = 3;
const PLACEHOLDER = 'https://via.placeholder.com/400x500?text=Perfume';

async function getPerfumeImages(perfumeName, page) {
  const images = [];

  try {
    // Use Google Images with direct URL format
    const queries = [
      `${perfumeName} perfume bottle`,
      `${perfumeName} fragrance`,
      `${perfumeName} perfume`
    ];

    for (const query of queries) {
      try {
        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 3000));

        const imgUrls = await page.evaluate(() => {
          const urls = [];
          // Try various Google Images selectors
          const selectors = [
            'img[src*="encrypted-tbn"]',
            'img[data-src]',
            '.yD4bb img',
            '.n3VNCb img',
            'img.rg_i'
          ];

          for (const sel of selectors) {
            const imgs = Array.from(document.querySelectorAll(sel));
            for (const img of imgs) {
              const src = img.src || img.getAttribute('data-src');
              if (src && src.startsWith('http') && !src.includes('favicon') && src.length > 50) {
                urls.push(src);
              }
            }
          }
          return urls;
        });

        for (const url of imgUrls) {
          if (!images.includes(url) && images.length < NUM_IMAGES) {
            images.push(url);
            console.log(`  📸 Imagen ${images.length}: ${url.substring(0, 80)}...`);
          }
        }

        if (images.length >= NUM_IMAGES) break;
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.log(`  ⚠️ Error en query "${query}": ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`  ⚠️ Error general buscando imágenes: ${err.message}`);
  }

  // Rellenar con placeholders si no se encontraron suficientes
  while (images.length < NUM_IMAGES) {
    images.push(PLACEHOLDER);
  }

  return images.slice(0, NUM_IMAGES);
}

async function getPerfumeNotas(perfumeName, page) {
  try {
    await page.goto(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(perfumeName + ' fragrantica notas olfativas')}`,
      { waitUntil: 'networkidle2', timeout: 15000 }
    );

    const textContext = await page.evaluate(() => document.body.innerText);

    const salidaMatch = textContext.match(/Salida son (.*?);/i)
      || textContext.match(/notas de salida[:\s]+(.*?)(?=\.|\n|;)/i)
      || textContext.match(/Top notes[:\s]+(.*?)(?=\.|\n|;)/i);
    const corazonMatch = textContext.match(/Coraz[oó]n son (.*?);/i)
      || textContext.match(/notas de coraz[oó]n[:\s]+(.*?)(?=\.|\n|;)/i)
      || textContext.match(/Middle notes[:\s]+(.*?)(?=\.|\n|;)/i)
      || textContext.match(/Heart notes[:\s]+(.*?)(?=\.|\n|;)/i);
    const fondoMatch = textContext.match(/Fondo son (.*?)\./i)
      || textContext.match(/notas de fondo[:\s]+(.*?)(?=\.|\n|;)/i)
      || textContext.match(/Base notes[:\s]+(.*?)(?=\.|\n|;)/i);

    return {
      salida: salidaMatch ? salidaMatch[1].trim() : '',
      corazon: corazonMatch ? corazonMatch[1].trim() : '',
      fondo: fondoMatch ? fondoMatch[1].trim() : ''
    };
  } catch (error) {
    console.log(`  ⚠️ Error buscando notas: ${error.message}`);
    return { salida: '', corazon: '', fondo: '' };
  }
}

async function getPerfumeData(perfumeName, page) {
  console.log(`\n🔍 Procesando: ${perfumeName}`);
  const images = await getPerfumeImages(perfumeName, page);
  const notas = await getPerfumeNotas(perfumeName, page);
  return { images, notas, image: images[0] };
}

/**
 * Ingesta completa: agrega nuevos productos al catálogo existente
 * y les asigna 3 fotos + notas olfativas.
 */
async function ingestCatalog(perfumeList, { append = false } = {}) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Bloquear recursos innecesarios para acelerar
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['stylesheet', 'font', 'media'].includes(type)) req.abort();
    else req.continue();
  });

  let existingCatalog = [];
  const outputPath = path.join(process.cwd(), 'src/lib/catalog_output.json');

  if (append) {
    try {
      const raw = await fs.readFile(outputPath, 'utf-8');
      existingCatalog = JSON.parse(raw);
      console.log(`📂 Catálogo existente: ${existingCatalog.length} productos`);
    } catch {
      console.log('📂 No se encontró catálogo existente, se creará uno nuevo');
    }
  }

  const newEntries = [];

  for (const entry of perfumeList) {
    // Soporta tanto strings simples como objetos con datos completos
    const perfumeName = typeof entry === 'string' ? entry : entry.name;
    const extraData = typeof entry === 'object' ? entry : {};

    const data = await getPerfumeData(perfumeName, page);

    const catalogEntry = {
      id: extraData.id || perfumeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: extraData.catalogName || perfumeName,
      image: data.image,
      images: data.images,
      notas: {
        salida: extraData.notas?.salida || data.notas.salida || '',
        corazon: extraData.notas?.corazon || data.notas.corazon || '',
        fondo: extraData.notas?.fondo || data.notas.fondo || ''
      }
    };

    newEntries.push(catalogEntry);
    console.log(`  ✅ ${perfumeName} — ${data.images.filter(i => i !== PLACEHOLDER).length}/3 fotos reales`);

    // Pausa entre productos para no saturar
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  const finalCatalog = append ? [...existingCatalog, ...newEntries] : newEntries;
  await fs.writeFile(outputPath, JSON.stringify(finalCatalog, null, 2), 'utf-8');
  console.log(`\n✅ Ingesta completa. ${newEntries.length} productos procesados.`);
  console.log(`📄 Catálogo guardado en ${outputPath} (${finalCatalog.length} productos totales)`);
}

/**
 * Actualiza solo las imágenes de productos existentes que tengan placeholders.
 */
async function updateMissingImages() {
  const outputPath = path.join(process.cwd(), 'src/lib/catalog_output.json');
  const raw = await fs.readFile(outputPath, 'utf-8');
  const catalog = JSON.parse(raw);

  const placeholder = 'via.placeholder.com';
  const toUpdate = catalog.filter(p =>
    (p.image && p.image.includes(placeholder)) ||
    !p.images ||
    p.images.length < NUM_IMAGES ||
    p.images.some(img => img.includes(placeholder))
  );

  console.log(`🔄 Productos sin fotos reales: ${toUpdate.length}/${catalog.length}`);

  if (toUpdate.length === 0) {
    console.log('✅ Todos los productos ya tienen fotos. Nada que actualizar.');
    return;
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['stylesheet', 'font', 'media'].includes(type)) req.abort();
    else req.continue();
  });

  for (const entry of toUpdate) {
    const perfumeName = entry.name.split(';')[1]?.trim() || entry.name;
    const data = await getPerfumeData(perfumeName, page);

    entry.image = data.image;
    entry.images = data.images;

    // También actualizar notas si están vacías
    if (!entry.notas.salida && data.notas.salida) entry.notas.salida = data.notas.salida;
    if (!entry.notas.corazon && data.notas.corazon) entry.notas.corazon = data.notas.corazon;
    if (!entry.notas.fondo && data.notas.fondo) entry.notas.fondo = data.notas.fondo;

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  await fs.writeFile(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n✅ Actualización de imágenes completa. Guardado en ${outputPath}`);
}

// CLI: soporta --append, --update-missing, o lista de nombres
if (process.argv[2]) {
  const args = process.argv.slice(2);
  if (args.includes('--update-missing')) {
    updateMissingImages();
  } else {
    const append = args.includes('--append');
    const names = args.filter(a => !a.startsWith('--'));
    ingestCatalog(names, { append });
  }
}

export { ingestCatalog, getPerfumeData, getPerfumeImages, getPerfumeNotas, updateMissingImages };
