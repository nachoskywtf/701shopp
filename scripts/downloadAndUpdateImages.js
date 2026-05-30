import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/lib/catalog_output.json');
const CARPETA_BASE = path.join(process.cwd(), 'public', 'assets', 'img', 'perfumes');

async function procesarCatalogo() {
  // Leer base de datos
  const raw = await fs.readFile(DB_FILE, 'utf-8');
  const productos = JSON.parse(raw);
  
  // Crear carpeta base
  await fs.mkdir(CARPETA_BASE, { recursive: true });
  
  console.log(`📋 Total productos: ${productos.length}`);
  console.log(`📁 Carpeta destino: ${CARPETA_BASE}`);
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let actualizados = 0;
  let fallidos = 0;
  
  for (let i = 0; i < productos.length; i++) {
    const prod = productos[i];
    const nombre = prod.name.split(';')[1]?.trim() || prod.name;
    const nombreLimpio = nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    console.log(`\n[${i + 1}/${productos.length}] Buscando foto para: ${nombre.substring(0, 50)}...`);
    
    try {
      // Buscar con términos específicos para fotos de alta calidad
      const query = `${nombre} perfume bottle photography pinterest aesthetic`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`;
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 3000));
      
      // Extraer URL de imagen
      const imgUrl = await page.evaluate(() => {
        const selectors = [
          '.tile--img__img',
          '.zci__images img',
          'img[src*="external-content"]',
          'img[data-src]',
          '.tile img',
          '.module--images img'
        ];
        
        for (const sel of selectors) {
          const imgs = Array.from(document.querySelectorAll(sel));
          for (const img of imgs) {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('href');
            if (src && src.startsWith('http') && !src.includes('favicon') && !src.includes('duckduckgo') && !src.includes('logo') && src.length > 50) {
              return src;
            }
          }
        }
        return null;
      });
      
      if (imgUrl) {
        // Descargar imagen
        const response = await page.goto(imgUrl, { timeout: 15000 });
        const buffer = Buffer.from(await response.arrayBuffer());
        
        // Guardar imagen
        const nombreArchivo = `${nombreLimpio}.jpg`;
        const rutaFisica = path.join(CARPETA_BASE, nombreArchivo);
        const rutaRelativa = `/assets/img/perfumes/${nombreArchivo}`;
        
        await fs.writeFile(rutaFisica, buffer);
        
        // ACTUALIZAR EL REGISTRO EN LA BASE DE DATOS
        prod.image = rutaRelativa;
        prod.images = [rutaRelativa];
        
        actualizados++;
        console.log(`  ✅ Descargado: ${nombreArchivo} (${buffer.length} bytes)`);
        console.log(`  📝 Ruta: ${rutaRelativa}`);
      } else {
        console.log(`  ⚠️ No se encontró imagen`);
        fallidos++;
      }
      
      // Pausa para evitar bloqueos
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      fallidos++;
    }
  }
  
  await browser.close();
  
  // GUARDAR LA BASE DE DATOS ACTUALIZADA
  await fs.writeFile(DB_FILE, JSON.stringify(productos, null, 2), 'utf-8');
  
  console.log(`\n🎉 Proceso completado:`);
  console.log(`  ✅ Actualizados: ${actualizados}`);
  console.log(`  ⚠️ Fallidos: ${fallidos}`);
  console.log(`  📄 Base de datos guardada en: ${DB_FILE}`);
}

procesarCatalogo();
