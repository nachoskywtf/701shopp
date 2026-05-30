import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno locales si existen
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // O SERVICE_ROLE_KEY para permisos totales

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ FALTAN CREDENCIALES: Debes configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log("🚀 Iniciando Ingesta de Datos a Supabase...");

  const catalogPath = path.join(process.cwd(), 'src', 'lib', 'catalog_output.json');
  
  if (!fs.existsSync(catalogPath)) {
    console.error("❌ No se encontró catalog_output.json");
    process.exit(1);
  }

  const rawData = fs.readFileSync(catalogPath, 'utf-8');
  const products = JSON.parse(rawData);

  console.log(`📦 Encontrados ${products.length} productos para sembrar.`);

  // Formatear datos para la tabla 'products' (ajustar según esquema final)
  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    gender: p.gender,
    ml: p.ml,
    price: p.price,
    description: p.description || '',
    image: p.image,
    images: p.images || [p.image],
    stock: 10 // Stock por defecto para empezar
  }));

  const { data, error } = await supabase
    .from('products')
    .upsert(formattedProducts, { onConflict: 'id' });

  if (error) {
    console.error("❌ Error al insertar datos:", error.message);
  } else {
    console.log("✅ Base de datos poblada exitosamente con 100 productos.");
  }
}

seedDatabase();
