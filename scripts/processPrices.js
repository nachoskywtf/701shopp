import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const inputFile = path.join(process.cwd(), 'Precios Perfumes.csv');
const outputFile = path.join(process.cwd(), 'Precios_Perfumes_Actualizados_990.csv');

// Regex básicos para determinar género basado en el nombre
function determineGender(name) {
  const n = name.toLowerCase();
  if (n.includes('hombre') || n.includes('men') || n.includes('pour homme')) return 'Hombre';
  if (n.includes('mujer') || n.includes('women') || n.includes('pour femme')) return 'Mujer';
  return 'Unisex';
}

function roundTo990(priceStr) {
  // Limpiar string de precio (quitar signos de dólar, puntos, comas, etc)
  const numericStr = String(priceStr).replace(/[^0-9]/g, '');
  if (!numericStr) return 0;
  
  let price = parseInt(numericStr, 10);
  
  // Redondear el precio para que termine en 990
  // Por ejemplo, 30882 -> 30990
  let basePrice = Math.floor(price / 1000) * 1000;
  let newPrice = basePrice + 990;
  
  // Si el nuevo precio es menor (ej: 30995 -> 30990), podemos sumarle 1000 para no perder dinero, 
  // pero la regla simple es terminar en 990.
  if (price - basePrice > 990) {
     newPrice += 1000;
  }
  
  return newPrice;
}

async function processPrices() {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`CRITICAL ERROR: No se encontró el archivo original '${inputFile}'. Asegúrate de que el archivo 'Precios Perfumes.csv' está en la carpeta raíz.`);
  }

  const results = [];
  let headers = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('headers', (hdr) => {
        headers = [...hdr, 'Genero', 'Precio_Optimizado'];
      })
      .on('data', (data) => {
        // Encontrar columna de nombre
        const nameKey = Object.keys(data).find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name'));
        const name = nameKey ? data[nameKey] : Object.values(data)[0];
        
        // Encontrar columna de precio
        const priceKey = Object.keys(data).find(k => k.toLowerCase().includes('precio') || k.toLowerCase().includes('price'));
        const price = priceKey ? data[priceKey] : 0;

        data['Genero'] = determineGender(name);
        data['Precio_Optimizado'] = roundTo990(price);
        
        results.push(data);
      })
      .on('end', () => {
        // Escribir a CSV nuevo
        const ws = fs.createWriteStream(outputFile);
        ws.write(headers.join(',') + '\n');
        
        for (const row of results) {
          const rowData = headers.map(h => `"${row[h] || ''}"`).join(',');
          ws.write(rowData + '\n');
        }
        
        ws.end();
        console.log(`✅ Archivo procesado exitosamente: ${outputFile}`);
        resolve();
      })
      .on('error', reject);
  });
}

processPrices().catch(err => {
  console.error(err.message);
  process.exit(1);
});
