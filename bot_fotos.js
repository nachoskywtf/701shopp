import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const lista_perfumes = [
    "Chanel Bleu de Chanel EDT", "Chanel Bleu de Chanel EDP", "Chanel Bleu de Chanel Parfum",
    "Chanel Allure Homme Sport", "Chanel Platinum Egoiste", "Dior Sauvage EDT", 
    "Dior Sauvage EDP", "Dior Sauvage Parfum", "Dior Fahrenheit", "Dior Homme Intense", 
    "Dior Homme 2020", "Paco Rabanne Invictus Absolu", "Valentino Born in Roma Coral Fantasy", 
    "Parfums de Marly Godolphin", "Parfums de Marly Layton", "Parfums de Marly Percival", 
    "Amouage Reflection Man", "Versace Dylan Blue", "Montblanc Explorer", "Montblanc Legend", 
    "Prada Luna Rossa Carbon", "Prada L'Homme", "Nautica Voyage", "Issey Miyake L'Eau d'Issey Pour Homme", 
    "Bvlgari Aqva Pour Homme", "Bvlgari Man Wood Essence", "Abercrombie & Fitch Fierce", 
    "Coach for Men", "Jimmy Choo Man", "Tom Ford Noir Extreme", "Givenchy Gentleman Reserve Privée", 
    "Bentley for Men Intense", "Terre d'Hermès", "Guerlain L'Homme Ideal", "Guerlain Vetiver", "Loewe 7",
    "Coco Chanel Mademoiselle", "Miss Dior Blooming Bouquet", "Giorgio Armani My Way", 
    "Parfums de Marly Delina", "Mancera Roses Greedy", "Prada Paradoxe", "Xerjoff Erba Pura", 
    "Xerjoff Torino 21", "Xerjoff Erba Gold", "Xerjoff Groove", "Xerjoff Naxos", 
    "Mancera Royal Vainilla", "Mancera Instant Crush", "Mancera Cedrat Boise", "Montale Intense Cafe", 
    "Nishane Hacivat", "Tom Ford Black Orchid", "Initio Rehab", "Initio EDP", 
    "Maison Margiela Jazz Club", "Maison Margiela By the Fireplace", "Maison Margiela Lazy Sunday Morning", 
    "Maison Margiela Under the Lemon Trees", "Maison Margiela Bubble Bath", "Byredo Gypsy Water", 
    "Juliette Has a Gun Not a Perfume", "Escentric Molecules Molecule 01", "Le Labo Another 13", 
    "Kilian Angels' Share", "Clean Reserve Skin"
];

const CARPETA_BASE = path.join(process.cwd(), 'assets', 'img', 'perfumes');
const NUM_FOTOS = 3;

async function descargarFotosBot(nombrePerfume) {
    console.log(`\n🤖 Buscando fotos 4K para: ${nombrePerfume}`);
    const query = `${nombrePerfume} fragrance official bottle product photography high resolution`;
    const nombreLimpio = nombrePerfume.toLowerCase().replace(/ /g, '_').replace(/'/g, '').replace(/&/g, 'y');
    const rutaGuardado = path.join(CARPETA_BASE, nombreLimpio);
    
    await fs.mkdir(rutaGuardado, { recursive: true });
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 3000));
        
        const imgUrls = await page.evaluate(() => {
            const urls = [];
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
                        if (!urls.includes(src)) urls.push(src);
                    }
                }
            }
            return urls;
        });
        
        for (let i = 0; i < Math.min(NUM_FOTOS, imgUrls.length); i++) {
            try {
                const imgUrl = imgUrls[i];
                const response = await fetch(imgUrl);
                const buffer = Buffer.from(await response.arrayBuffer());
                const extension = imgUrl.split('.').pop().split('?')[0].toLowerCase();
                const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
                const nombreArchivo = `${nombreLimpio}_${i + 1}.${validExtension}`;
                const rutaFinal = path.join(rutaGuardado, nombreArchivo);
                await fs.writeFile(rutaFinal, buffer);
                console.log(`  ✅ Descargada: ${nombreArchivo}`);
            } catch (err) {
                console.log(`  ⚠️ Error descargando imagen ${i + 1}: ${err.message}`);
            }
        }
    } catch (err) {
        console.log(`  ⚠️ Error buscando imágenes: ${err.message}`);
    }
    
    await browser.close();
}

async function main() {
    console.log('🚀 INICIANDO DESCARGA MASIVA...');
    await fs.mkdir(CARPETA_BASE, { recursive: true });
    
    for (const perfume of lista_perfumes) {
        await descargarFotosBot(perfume);
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log('\n🎉 PROCESO TERMINADO.');
}

main();
