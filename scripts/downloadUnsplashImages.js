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
    
    console.log(`\n[${i + 1}/${productos.length}] Procesando: ${nombre.substring(0, 50)}...`);
    
    try {
      // Generar URL de Unsplash Source específica para este producto
      const query = `${nombre} perfume bottle luxury photography`;
      const imageUrl = `https://source.unsplash.com/800x1000/?${encodeURIComponent(query)}&sig=${prod.id}`;
      
      // Descargar imagen
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
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
      
      // Pausa breve
      await new Promise(r => setTimeout(r, 100));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      fallidos++;
    }
  }
  
  // GUARDAR LA BASE DE DATOS ACTUALIZADA
  await fs.writeFile(DB_FILE, JSON.stringify(productos, null, 2), 'utf-8');
  
  console.log(`\n🎉 Proceso completado:`);
  console.log(`  ✅ Actualizados: ${actualizados}`);
  console.log(`  ⚠️ Fallidos: ${fallidos}`);
  console.log(`  📄 Base de datos guardada en: ${DB_FILE}`);
}

procesarCatalogo();
