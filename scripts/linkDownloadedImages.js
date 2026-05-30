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

function normalizeName(name) {
    return name.toLowerCase().replace(/ /g, '_').replace(/'/g, '').replace(/&/g, 'y');
}

async function linkDownloadedImages() {
    const catalogPath = path.join(process.cwd(), 'src/lib/catalog_output.json');
    const raw = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(raw);
    
    const assetsBase = path.join(process.cwd(), 'assets', 'img', 'perfumes');
    
    let updated = 0;
    
    // Direct mapping from downloaded perfume names to catalog keywords
    const perfumeKeywords = {
        'chanel bleu de chanel edt': ['chanel', 'bleu', 'edt'],
        'chanel bleu de chanel edp': ['chanel', 'bleu', 'edp'],
        'chanel bleu de chanel parfum': ['chanel', 'bleu', 'parfum'],
        'chanel allure homme sport': ['chanel', 'allure', 'sport'],
        'chanel platinum egoiste': ['chanel', 'platinum', 'egoiste'],
        'dior sauvage edt': ['dior', 'sauvage', 'edt'],
        'dior sauvage edp': ['dior', 'sauvage', 'edp'],
        'dior sauvage parfum': ['dior', 'sauvage', 'parfum'],
        'dior fahrenheit': ['dior', 'fahrenheit'],
        'dior homme intense': ['dior', 'homme', 'intense'],
        'dior homme 2020': ['dior', 'homme', '2020'],
        'paco rabanne invictus absolu': ['paco', 'rabanne', 'invictus', 'absolu'],
        'valentino born in roma coral fantasy': ['valentino', 'born', 'roma', 'coral'],
        'parfums de marly godolphin': ['parfums', 'marly', 'godolphin'],
        'parfums de marly layton': ['parfums', 'marly', 'layton'],
        'parfums de marly percival': ['parfums', 'marly', 'percival'],
        'amouage reflection man': ['amouage', 'reflection'],
        'versace dylan blue': ['versace', 'dylan', 'blue'],
        'montblanc explorer': ['montblanc', 'explorer'],
        'montblanc legend': ['montblanc', 'legend'],
        'prada luna rossa carbon': ['prada', 'luna', 'rossa', 'carbon'],
        'prada lhomme': ['prada', 'homme'],
        'nautica voyage': ['nautica', 'voyage'],
        'issey miyake leau dissey pour homme': ['issey', 'miyake', 'leau', 'dissey'],
        'bvlgari aqva pour homme': ['bvlgari', 'aqva'],
        'bvlgari man wood essence': ['bvlgari', 'man', 'wood'],
        'abercrombie y fitch fierce': ['abercrombie', 'fitch', 'fierce'],
        'coach for men': ['coach', 'men'],
        'jimmy choo man': ['jimmy', 'choo', 'man'],
        'tom ford noir extreme': ['tom', 'ford', 'noir', 'extreme'],
        'givenchy gentleman reserve privée': ['givenchy', 'gentleman', 'reserve'],
        'bentley for men intense': ['bentley', 'men', 'intense'],
        'terre dhermès': ['hermès', 'terre'],
        'guerlain lhomme ideal': ['guerlain', 'homme', 'ideal'],
        'guerlain vetiver': ['guerlain', 'vetiver'],
        'loewe 7': ['loewe'],
        'coco chanel mademoiselle': ['chanel', 'coco', 'mademoiselle'],
        'miss dior blooming bouquet': ['dior', 'miss', 'blooming'],
        'giorgio armani my way': ['armani', 'my', 'way'],
        'parfums de marly delina': ['parfums', 'marly', 'delina'],
        'mancera roses greedy': ['mancera', 'roses', 'greedy'],
        'prada paradoxe': ['prada', 'paradoxe'],
        'xerjoff erba pura': ['xerjoff', 'erba', 'pura'],
        'xerjoff torino 21': ['xerjoff', 'torino'],
        'xerjoff erba gold': ['xerjoff', 'erba', 'gold'],
        'xerjoff groove': ['xerjoff', 'groove'],
        'xerjoff naxos': ['xerjoff', 'naxos'],
        'mancera royal vainilla': ['mancera', 'royal', 'vainilla'],
        'mancera instant crush': ['mancera', 'instant', 'crush'],
        'mancera cedrat boise': ['mancera', 'cedrat', 'boise'],
        'montale intense cafe': ['montale', 'intense', 'cafe'],
        'nishane hacivat': ['nishane', 'hacivat'],
        'tom ford black orchid': ['tom', 'ford', 'black', 'orchid'],
        'initio rehab': ['initio', 'rehab'],
        'initio edp': ['initio'],
        'maison margiela jazz club': ['margiela', 'jazz', 'club'],
        'maison margiela by the fireplace': ['margiela', 'fireplace'],
        'maison margiela lazy sunday morning': ['margiela', 'lazy', 'sunday'],
        'maison margiela under the lemon trees': ['margiela', 'lemon'],
        'maison margiela bubble bath': ['margiela', 'bubble', 'bath'],
        'byredo gypsy water': ['byredo', 'gypsy', 'water'],
        'juliette has a gun not a perfume': ['juliette', 'gun', 'not', 'perfume'],
        'escentric molecules molecule 01': ['escentric', 'molecules', 'molecule'],
        'le labo another 13': ['le', 'labo', 'another'],
        'kilian angels share': ['kilian', 'angels', 'share'],
        'clean reserve skin': ['clean', 'reserve', 'skin']
    };
    
    console.log(`📋 Catálogo: ${catalog.length} productos`);
    console.log(`📁 Perfumes descargados: ${Object.keys(perfumeKeywords).length}`);
    
    // List actual downloaded folders
    const actualFolders = await fs.readdir(assetsBase);
    console.log(`📁 Carpetas descargadas: ${actualFolders.slice(0,10).join(', ')}...`);
    console.log(`📁 Ruta base: ${assetsBase}`);
    
    for (const entry of catalog) {
        const entryName = entry.name.toLowerCase();
        
        // Check if this entry matches any downloaded perfume
        for (const [perfumeKey, keywords] of Object.entries(perfumeKeywords)) {
            const normalized = normalizeName(perfumeKey);
            const matchCount = keywords.filter(kw => entryName.includes(kw.toLowerCase())).length;
            
            if (matchCount >= 2) {
                const perfumeFolder = path.join(assetsBase, normalized);
                const folderExists = actualFolders.includes(normalized);
                
                if (entryName.includes('chanel')) {
                    console.log(`🔍 Chanel match: ${entry.name.substring(0,50)}... -> ${normalized} (matchCount: ${matchCount}, folderExists: ${folderExists})`);
                }
                
                try {
                    const files = await fs.readdir(perfumeFolder);
                    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
                    
                    if (entryName.includes('chanel')) {
                        console.log(`  📁 Files in ${normalized}: ${files.length} total, ${imageFiles.length} images`);
                    }
                    
                    if (imageFiles.length > 0) {
                        const images = imageFiles.map(f => `/assets/img/perfumes/${normalized}/${f}`);
                        entry.image = images[0];
                        entry.images = images;
                        updated++;
                        console.log(`✅ ${entry.name.substring(0,60)}... -> ${images.length} imágenes (${perfumeKey})`);
                        break;
                    }
                } catch (err) {
                    console.log(`⚠️ Error reading folder ${normalized}: ${err.message}`);
                }
            }
        }
    }
    
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    console.log(`\n✅ Completado. ${updated} productos actualizados con imágenes locales.`);
    console.log(`📄 Catálogo guardado en ${catalogPath}`);
}

linkDownloadedImages();
