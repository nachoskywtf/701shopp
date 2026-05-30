import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { ingestCatalog } from './scraperSkill.js';

const csvFilePath = path.join(process.cwd(), 'Precios_Perfumes_Actualizados_990.csv');

async function processCSV() {
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`CRITICAL ERROR: No se encuentra el archivo CSV en la ruta especificada: ${csvFilePath}. Por favor, verifica que el archivo realmente está en la raíz del proyecto.`);
  }

  const perfumes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Asumiendo que la columna se llama "Nombre" o similar
        const name = row.Nombre || row.nombre || row.Name || Object.values(row)[0];
        if (name) {
          perfumes.push(name);
        }
      })
      .on('end', async () => {
        console.log(`✅ CSV leído exitosamente. Se encontraron ${perfumes.length} perfumes.`);
        try {
          await ingestCatalog(perfumes);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

processCSV().catch(error => {
  console.error(error.message);
  process.exit(1);
});
