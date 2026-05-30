import fs from 'fs/promises';
import path from 'path';

const PLACEHOLDER = 'https://via.placeholder.com/400x500?text=Perfume';

const newPerfumes = [
  // ═══════════════════════════════════════
  // PERFUMES DE HOMBRE
  // ═══════════════════════════════════════
  {
    brand: "Chanel",
    name: "Bleu de Chanel EDT",
    price: 101990,
    retail: 139990,
    gender: "Hombre",
    notas: { salida: "Menta, Limón, Pomelo, Bergamota, Cilantro, Pimienta rosa", corazon: "Jengibre, Jazmín, Nuez moscada, Iso E Super", fondo: "Incienso, Almizcle, Cedro, Sándalo, Pachulí, Vetiver" }
  },
  {
    brand: "Chanel",
    name: "Bleu de Chanel EDP",
    price: 114990,
    retail: 154990,
    gender: "Hombre",
    notas: { salida: "Menta, Limón, Pomelo, Bergamota, Cilantro, Pimienta rosa", corazon: "Jengibre, Jazmín, Nuez moscada, Iso E Super", fondo: "Incienso, Almizcle, Cedro, Sándalo, Pachulí, Vetiver, Ámbar" }
  },
  {
    brand: "Chanel",
    name: "Bleu de Chanel Parfum",
    price: 128990,
    retail: 169990,
    gender: "Hombre",
    notas: { salida: "Menta, Limón, Bergamota, Cilantro, Pomelo", corazon: "Jazmín, Jengibre, Nuez moscada, Salvia", fondo: "Sándalo, Cedro, Incienso, Almizcle, Pachulí, Vetiver" }
  },
  {
    brand: "Chanel",
    name: "Allure Homme Sport",
    price: 107990,
    retail: 144990,
    gender: "Hombre",
    notas: { salida: "Menta, Naranja sanguina, Bergamota, Pimienta", corazon: "Cedro, Habas tonka, Jara, Elemi, Pimienta rosa", fondo: "Vetiver, Almizcle, Sándalo, Vainilla, Iso E Super" }
  },
  {
    brand: "Chanel",
    name: "Platinum Egoiste",
    price: 101990,
    retail: 134990,
    gender: "Hombre",
    notas: { salida: "Lavanda, Menta, Bergamota, Limón, Romero, Naranja amarga", corazon: "Salvia, Jazmín, Cedro, Geranio, Clavo", fondo: "Sándalo, Almizcle, Vetiver, Roble, Almizcle blanco" }
  },
  {
    brand: "Dior",
    name: "Sauvage EDT",
    price: 93990,
    retail: 124990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Pimienta", corazon: "Pimienta Sichuan, Lavanda, Pimienta rosa, Vetiver, Pachulí, Geranio, Elemi", fondo: "Ambroxan, Cedro, Ládano" }
  },
  {
    brand: "Dior",
    name: "Sauvage EDP",
    price: 107990,
    retail: 139990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Pimienta, Pimienta Sichuan", corazon: "Lavanda, Pimienta rosa, Geranio, Elemi, Pachulí, Vetiver", fondo: "Ambroxan, Cedro, Ládano, Vainilla" }
  },
  {
    brand: "Dior",
    name: "Sauvage Parfum",
    price: 121990,
    retail: 159990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Pimienta, Pimienta Sichuan", corazon: "Lavanda, Pimienta rosa, Geranio, Elemi", fondo: "Ambroxan, Cedro, Sándalo, Vainilla, Pachulí" }
  },
  {
    brand: "Dior",
    name: "Fahrenheit",
    price: 93990,
    retail: 124990,
    gender: "Hombre",
    notas: { salida: "Mandarina, Bergamota, Violeta, Cedro", corazon: "Jazmín, Lirio de los valles, Cedro, Sándalo, Vetiver", fondo: "Cuero, Almizcle, Ámbar, Pachulí, Vetiver" }
  },
  {
    brand: "Dior",
    name: "Homme Intense",
    price: 104990,
    retail: 139990,
    gender: "Hombre",
    notas: { salida: "Lavanda, Salvia, Bergamota", corazon: "Iris, Cacao, Habas tonka, Rosa", fondo: "Vetiver, Pachulí, Cuero, Iris, Habas tonka" }
  },
  {
    brand: "Dior",
    name: "Homme 2020",
    price: 90990,
    retail: 119990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Pimienta rosa, Cedro", corazon: "Iris, Pachulí, Habas tonka", fondo: "Vetiver, Almizcle blanco, Cuero" }
  },
  {
    brand: "Paco Rabanne",
    name: "Invictus Absolu",
    price: 90990,
    retail: 119990,
    gender: "Hombre",
    notas: { salida: "Pomelo, Naranja sanguina, Pimienta negra", corazon: "Canela, Jengibre, Laurel, Absenta", fondo: "Ámbar, Almizcle, Madera de cachemira" }
  },
  {
    brand: "Valentino",
    name: "Born in Roma Coral Fantasy 50ml",
    price: 65990,
    retail: 89990,
    gender: "Hombre",
    notas: { salida: "Pimienta rosa, Mandarina, Bergamota", corazon: "Iris, Habas tonka, Calabaza", fondo: "Vainilla, Sándalo, Almizcle" }
  },
  {
    brand: "Parfums de Marly",
    name: "Godolphin 120ml",
    price: 195990,
    retail: 259990,
    gender: "Hombre",
    notas: { salida: "Tomillo, Ajenjo, Bergamota", corazon: "Rosa, Jazmín, Iris, Pimienta negra", fondo: "Cuero, Almizcle, Ámbar, Pachulí, Cedro, Vetiver" }
  },
  {
    brand: "Parfums de Marly",
    name: "Layton",
    price: 195990,
    retail: 259990,
    gender: "Hombre",
    notas: { salida: "Manzana, Mandarina, Bergamota", corazon: "Jazmín, Rosa, Violeta", fondo: "Guayaco, Sándalo, Pachulí, Vainilla, Pimienta rosa" }
  },
  {
    brand: "Parfums de Marly",
    name: "Percival",
    price: 195990,
    retail: 259990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Mandarina, Geranio, Lavanda", corazon: "Jazmín, Rosa, Vainilla, Canela", fondo: "Ámbar, Almizcle, Madera de cachemira, Pachulí, Vetiver" }
  },
  {
    brand: "Amouage",
    name: "Reflection Man",
    price: 223990,
    retail: 299990,
    gender: "Hombre",
    notas: { salida: "Menta, Romero, Pimienta rosa, Bergamota", corazon: "Jazmín, Iris, Ylang-ylang, Jazmín de noche", fondo: "Sándalo, Cedro, Vetiver, Almizcle, Pachulí, Ámbar" }
  },
  {
    brand: "Versace",
    name: "Dylan Blue",
    price: 62990,
    retail: 84990,
    gender: "Hombre",
    notas: { salida: "Pomelo, Bergamota, Higos, Pimienta", corazon: "Pachulí, Pimienta negra, Violeta, Ajenjo", fondo: "Sándalo, Habas tonka, Azafrán, Almizcle, Madera de cachemira" }
  },
  {
    brand: "Montblanc",
    name: "Explorer",
    price: 58990,
    retail: 79990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Pimienta rosa, Salvia", corazon: "Iris, Habas tonka, Cedro", fondo: "Vetiver, Almizcle, Cuero, Ámbar, Akigalawood" }
  },
  {
    brand: "Montblanc",
    name: "Legend",
    price: 55990,
    retail: 74990,
    gender: "Hombre",
    notas: { salida: "Bergamota, Menta, Verbena, Pomelo", corazon: "Cedro, Jazmín, Rosa, Geranio", fondo: "Sándalo, Almizcle, Habas tonka, Vetiver" }
  },
  {
    brand: "Prada",
    name: "Luna Rossa Carbon",
    price: 76990,
    retail: 104990,
    gender: "Hombre",
    notas: { salida: "Lavanda, Menta, Naranja amarga", corazon: "Habas tonka, Geranio", fondo: "Ambroxan, Almizcle, Cedro, Pachulí" }
  },
  {
    brand: "Prada",
    name: "L'Homme",
    price: 83990,
    retail: 109990,
    gender: "Hombre",
    notas: { salida: "Iris, Neroli, Mandarina, Cedro, Ambarina", corazon: "Iris, Violeta, Geranio", fondo: "Habas tonka, Cuero, Sándalo, Vainilla" }
  },
  {
    brand: "Nautica",
    name: "Voyage",
    price: 20990,
    retail: 34990,
    gender: "Hombre",
    notas: { salida: "Manzana, Hojas verdes, Menta, Limón", corazon: "Muguete, Lirio acuático, Jazmín", fondo: "Cedro, Almizcle, Madera, Ámbar" }
  },
  {
    brand: "Issey Miyake",
    name: "L'Eau d'Issey Pour Homme",
    price: 58990,
    retail: 79990,
    gender: "Hombre",
    notas: { salida: "Mandarina, Limón, Cilantro, Salvia, Jazmín", corazon: "Azafrán, Canela, Cardamomo, Pimienta", fondo: "Vetiver, Almizcle, Sándalo, Pachulí, Ámbar" }
  },
  {
    brand: "Bvlgari",
    name: "Aqva Pour Homme",
    price: 65990,
    retail: 89990,
    gender: "Hombre",
    notas: { salida: "Mandarina, Naranja amarga, Posidonia", corazon: "Cedro, Santolina", fondo: "Ámbar, Almizcle blanco" }
  },
  {
    brand: "Bvlgari",
    name: "Man Wood Essence",
    price: 73990,
    retail: 99990,
    gender: "Hombre",
    notas: { salida: "Ciprés, Pomelo, Bergamota, Pimienta rosa", corazon: "Cedro, Vetiver, Iris", fondo: "Ámbar, Almizcle, Madera de cachemira, Habas tonka" }
  },
  {
    brand: "Abercrombie & Fitch",
    name: "Fierce",
    price: 65990,
    retail: 89990,
    gender: "Hombre",
    notas: { salida: "Menta, Pomelo, Bergamota, Pimienta rosa, Limón", corazon: "Jazmín, Rosa, Pino, Lirio de los valles", fondo: "Sándalo, Almizcle, Vetiver, Pachulí, Roble" }
  },
  {
    brand: "Coach",
    name: "for Men",
    price: 51990,
    retail: 71990,
    gender: "Hombre",
    notas: { salida: "Pera, Bergamota, Kumquat, Lavanda", corazon: "Geranio, Cedro, Coriandro", fondo: "Ante, Ámbar, Almizcle, Habas tonka" }
  },
  {
    brand: "Jimmy Choo",
    name: "Man",
    price: 51990,
    retail: 71990,
    gender: "Hombre",
    notas: { salida: "Mandarina, Lavanda, Piña", corazon: "Pachulí, Habas tonka, Geranio", fondo: "Ante, Almizcle, Vainilla, Cedro" }
  },
  {
    brand: "Tom Ford",
    name: "Noir Extreme",
    price: 146990,
    retail: 194990,
    gender: "Hombre",
    notas: { salida: "Mandarina, Neroli, Pimienta rosa, Salvia, Cilantro", corazon: "Kulfi, Rosa, Jazmín, Iris, Ámbar", fondo: "Vainilla, Sándalo, Madera de cachemira, Almizcle, Habas tonka" }
  },
  {
    brand: "Givenchy",
    name: "Gentleman Reserve Privée",
    price: 87990,
    retail: 114990,
    gender: "Hombre",
    notas: { salida: "Pimienta rosa, Bergamota, Canela", corazon: "Iris, Jazmín, Whisky", fondo: "Pachulí, Vetiver, Almizcle, Cedro, Vainilla" }
  },
  {
    brand: "Bentley",
    name: "for Men Intense",
    price: 30990,
    retail: 44990,
    gender: "Hombre",
    notas: { salida: "Pimienta negra, Pimienta rosa, Bergamota", corazon: "Incienso, Cedro, Pino, Elemi", fondo: "Ámbar, Almizcle, Habas tonka, Vetiver, Pachulí" }
  },
  {
    brand: "Hermès",
    name: "Terre d'Hermès",
    price: 93990,
    retail: 124990,
    gender: "Hombre",
    notas: { salida: "Naranja, Pomelo, Pimienta rosa, Bergamota", corazon: "Pimienta rosa, Geranio, Rosa, Pachulí", fondo: "Cedro, Vetiver, Sílex, Ámbar, Almizcle" }
  },
  {
    brand: "Guerlain",
    name: "L'Homme Ideal",
    price: 79990,
    retail: 104990,
    gender: "Hombre",
    notas: { salida: "Naranja amarga, Bergamota, Pomelo, Rosa", corazon: "Almendra, Iris, Habas tonka, Pimiento", fondo: "Cuero, Vetiver, Cedro, Pachulí, Almizcle" }
  },
  {
    brand: "Guerlain",
    name: "Vetiver",
    price: 73990,
    retail: 99990,
    gender: "Hombre",
    notas: { salida: "Vetiver, Limón, Bergamota, Coriandro, Naranja amarga", corazon: "Vetiver, Pimienta, Nuez moscada, Clavo", fondo: "Vetiver, Cedro, Tabaco, Almizcle, Ámbar" }
  },
  {
    brand: "Loewe",
    name: "7",
    price: 83990,
    retail: 109990,
    gender: "Hombre",
    notas: { salida: "Pimienta rosa, Incienso, Pimienta negra", corazon: "Cedro, Pachulí, Vetiver", fondo: "Almizcle, Cuero, Ámbar" }
  },

  // ═══════════════════════════════════════
  // PERFUMES DE MUJER
  // ═══════════════════════════════════════
  {
    brand: "Chanel",
    name: "Coco Mademoiselle 100ml",
    price: 121990,
    retail: 164990,
    gender: "Mujer",
    notas: { salida: "Naranja, Bergamota, Mandarina", corazon: "Jazmín, Rosa, Lichi, Ylang-ylang", fondo: "Pachulí, Vetiver, Vainilla, Almizcle blanco, Habas tonka" }
  },
  {
    brand: "Dior",
    name: "Miss Dior Blooming Bouquet 100ml",
    price: 104990,
    retail: 139990,
    gender: "Mujer",
    notas: { salida: "Mandarina, Bergamota, Peonía", corazon: "Peonía, Rosa de Damasco, Almendra", fondo: "Almizcle blanco, Pachulí" }
  },
  {
    brand: "Giorgio Armani",
    name: "My Way 50ML (No Tapa)",
    price: 65990,
    retail: 89990,
    gender: "Mujer",
    notas: { salida: "Naranja amarga, Bergamota, Flor de naranjo", corazon: "Tuberosa, Jazmín, Ylang-ylang, Iris", fondo: "Vainilla, Almizcle blanco, Sándalo, Cedro" }
  },
  {
    brand: "Parfums de Marly",
    name: "Delina 75ml",
    price: 216990,
    retail: 289990,
    gender: "Mujer",
    notas: { salida: "Lichi, Ruibarbo, Bergamota, Nuez moscada", corazon: "Rosa, Peonía, Lirio de los valles, Almizcle", fondo: "Vainilla, Almizcle, Cashmeran, Pachulí, Habas tonka" }
  },
  {
    brand: "Mancera",
    name: "Roses Greedy 120ml",
    price: 104990,
    retail: 139990,
    gender: "Mujer",
    notas: { salida: "Rosa, Lichi, Mandarina, Grosella negra", corazon: "Rosa, Jazmín, Violeta, Magnolia", fondo: "Vainilla, Almizcle blanco, Pachulí, Madera de cachemira" }
  },
  {
    brand: "Prada",
    name: "Paradoxe",
    price: 97990,
    retail: 129990,
    gender: "Mujer",
    notas: { salida: "Naranja amarga, Pera, Mandarina, Neroli", corazon: "Jazmín, Iris, Naranja, Tuberosa", fondo: "Vainilla, Almizcle blanco, Ambrofix, Pachulí" }
  },

  // ═══════════════════════════════════════
  // PERFUMES UNISEX
  // ═══════════════════════════════════════
  {
    brand: "Xerjoff",
    name: "Erba Pura 100ml",
    price: 202990,
    retail: 269990,
    gender: "Unisex",
    notas: { salida: "Frutas tropicales, Bergamota, Naranja, Limón", corazon: "Canela, Clavo, Rosa, Jazmín", fondo: "Vainilla, Ámbar, Almizcle, Madera de cachemira, Pachulí" }
  },
  {
    brand: "Xerjoff",
    name: "Torino 21",
    price: 216990,
    retail: 289990,
    gender: "Unisex",
    notas: { salida: "Menta, Lavanda, Bergamota, Limón", corazon: "Jengibre, Pimienta, Cardamomo, Canela", fondo: "Vetiver, Cedro, Almizcle, Pachulí" }
  },
  {
    brand: "Xerjoff",
    name: "Erba Gold",
    price: 216990,
    retail: 289990,
    gender: "Unisex",
    notas: { salida: "Bergamota, Naranja, Mandarina, Limón", corazon: "Jazmín, Ylang-ylang, Rosa, Canela", fondo: "Vainilla, Ámbar, Almizcle, Sándalo, Pachulí" }
  },
  {
    brand: "Xerjoff",
    name: "Groove",
    price: 216990,
    retail: 289990,
    gender: "Unisex",
    notas: { salida: "Bergamota, Pimienta rosa, Piña", corazon: "Jazmín, Iris, Rosa, Pachulí", fondo: "Vainilla, Ámbar, Almizcle, Madera de cachemira" }
  },
  {
    brand: "Xerjoff",
    name: "Naxos",
    price: 202990,
    retail: 269990,
    gender: "Unisex",
    notas: { salida: "Lavanda, Bergamota, Limón", corazon: "Miel, Canela, Cashmeran, Nuez moscada", fondo: "Tabaco, Vainilla, Habas tonka, Pachulí" }
  },
  {
    brand: "Mancera",
    name: "Royal Vainilla 120ml",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Vainilla, Canela, Pimienta rosa", corazon: "Rosa, Jazmín, Iris, Nuez moscada", fondo: "Vainilla, Pachulí, Almizcle, Ámbar, Madera de cachemira" }
  },
  {
    brand: "Mancera",
    name: "Instant Crush 120ml",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Mandarina, Bergamota, Pimienta rosa, Jengibre", corazon: "Jazmín, Iris, Rosa, Pachulí", fondo: "Vainilla, Almizcle, Ámbar, Madera de cachemira, Sándalo" }
  },
  {
    brand: "Mancera",
    name: "Cedrat Boise 120ml",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Limón, Bergamota, Mandarina, Frutas negras", corazon: "Cedro, Jazmín, Pachulí", fondo: "Sándalo, Vetiver, Almizcle, Pachulí, Habas tonka" }
  },
  {
    brand: "Montale",
    name: "Intense Cafe",
    price: 97990,
    retail: 129990,
    gender: "Unisex",
    notas: { salida: "Rosa, Azafrán, Pimienta", corazon: "Rosa, Café, Jazmín", fondo: "Vainilla, Almizcle, Ámbar, Pachulí" }
  },
  {
    brand: "Nishane",
    name: "Hacivat",
    price: 195990,
    retail: 259990,
    gender: "Unisex",
    notas: { salida: "Piña, Pomelo, Bergamota", corazon: "Jazmín, Iris, Lichi", fondo: "Madera de cachemira, Almizcle, Cedro, Pachulí, Roble" }
  },
  {
    brand: "Tom Ford",
    name: "Black Orchid",
    price: 132990,
    retail: 179990,
    gender: "Unisex",
    notas: { salida: "Trufa negra, Ylang-ylang, Bergamota, Pimienta negra", corazon: "Orquídea negra, Loto, Jazmín, Rosa", fondo: "Pachulí, Vainilla, Incienso, Chocolate, Habas tonka, Sándalo" }
  },
  {
    brand: "Initio",
    name: "Rehab",
    price: 223990,
    retail: 299990,
    gender: "Unisex",
    notas: { salida: "Lavanda, Bergamota, Menta, Limón", corazon: "Pachulí, Rosa, Cedro, Jazmín", fondo: "Almizcle, Vainilla, Ámbar, Sándalo, Habas tonka" }
  },
  {
    brand: "Initio",
    name: "EDP",
    price: 223990,
    retail: 299990,
    gender: "Unisex",
    notas: { salida: "Azafrán, Pimienta rosa, Bergamota", corazon: "Rosa, Jazmín, Iris, Cedro", fondo: "Pachulí, Almizcle, Ámbar, Vainilla, Madera de cachemira" }
  },
  {
    brand: "Maison Margiela",
    name: "Jazz Club",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Pimienta rosa, Limón, Neroli", corazon: "Ron, Jengibre, Habas tonka, Absenta", fondo: "Vainilla, Tabaco, Habas tonka, Vetiver, Almizcle" }
  },
  {
    brand: "Maison Margiela",
    name: "By the Fireplace",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Pimienta rosa, Naranja, Clavo", corazon: "Castaña, Guayaco, Cedro", fondo: "Vainilla, Pachulí, Bálsamo de Perú, Cashmeran" }
  },
  {
    brand: "Maison Margiela",
    name: "Lazy Sunday Morning",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Almendra, Bergamota, Lichi", corazon: "Lirio de los valles, Jazmín, Rosa, Iris", fondo: "Almizcle blanco, Madera de cachemira, Habas tonka, Pachulí" }
  },
  {
    brand: "Maison Margiela",
    name: "Under the Lemon Trees",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Limón, Lima, Pimienta verde", corazon: "Té verde, Cereza, Menta, Lila", fondo: "Madera de cachemira, Cedro, Almizcle blanco" }
  },
  {
    brand: "Maison Margiela",
    name: "Bubble Bath",
    price: 104990,
    retail: 139990,
    gender: "Unisex",
    notas: { salida: "Jabón, Bergamota, Pera, Rosa", corazon: "Lirio de los valles, Jazmín, Lavanda, Orquídea", fondo: "Almizcle blanco, Madera de cachemira, Pachulí, Habas tonka" }
  },
  {
    brand: "Byredo",
    name: "Gypsy Water",
    price: 174990,
    retail: 229990,
    gender: "Unisex",
    notas: { salida: "Bergamota, Limón, Pimienta rosa, Enebro", corazon: "Incienso, Pino, Orquídea", fondo: "Ámbar, Vainilla, Sándalo, Almizcle" }
  },
  {
    brand: "Juliette Has a Gun",
    name: "Not a Perfume",
    price: 90990,
    retail: 119990,
    gender: "Unisex",
    notas: { salida: "Cetalox (Ambroxan)", corazon: "Cetalox", fondo: "Cetalox, Almizcle" }
  },
  {
    brand: "Escentric Molecules",
    name: "Molecule 01",
    price: 97990,
    retail: 129990,
    gender: "Unisex",
    notas: { salida: "Iso E Super", corazon: "Iso E Super", fondo: "Iso E Super" }
  },
  {
    brand: "Le Labo",
    name: "Another 13",
    price: 195990,
    retail: 259990,
    gender: "Unisex",
    notas: { salida: "Pera, Manzana, Cítricos", corazon: "Ambroxan, Jazmín, Musgo", fondo: "Almizcle, Iso E Super, Cetalox, Habas tonka" }
  },
  {
    brand: "Kilian",
    name: "Angels' Share",
    price: 174990,
    retail: 229990,
    gender: "Unisex",
    notas: { salida: "Coñac, Canela", corazon: "Roble, Habas tonka, Avellana", fondo: "Vainilla, Praliné, Sándalo" }
  },
  {
    brand: "Clean Reserve",
    name: "Skin",
    price: 76990,
    retail: 99990,
    gender: "Unisex",
    notas: { salida: "Bergamota, Nectarina, Pera", corazon: "Jazmín, Musgo, Iris, Flor de naranjo", fondo: "Almizcle blanco, Sándalo, Vainilla, Pachulí" }
  }
];

async function addNewPerfumes() {
  const catalogPath = path.join(process.cwd(), 'src/lib/catalog_output.json');

  // Leer catálogo existente
  let existingCatalog = [];
  try {
    const raw = await fs.readFile(catalogPath, 'utf-8');
    existingCatalog = JSON.parse(raw);
    console.log(`📂 Catálogo existente: ${existingCatalog.length} productos`);
  } catch {
    console.log('📂 No se encontró catálogo existente, se creará uno nuevo');
  }

  // Generar entradas en formato del catálogo
  const newEntries = newPerfumes.map(p => {
    const catalogName = `${p.brand};${p.brand.toUpperCase()} ${p.name.toUpperCase()} ;NUEVO; $${(p.retail / 1000).toFixed(3).replace('.', '.')} ; $${(p.price / 1000).toFixed(3).replace('.', '.')} `;
    const id = `${p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return {
      id,
      name: catalogName,
      image: PLACEHOLDER,
      images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
      gender: p.gender,
      notas: p.notas
    };
  });

  // Verificar duplicados por id
  const existingIds = new Set(existingCatalog.map(e => e.id));
  const uniqueEntries = newEntries.filter(e => !existingIds.has(e.id));
  const duplicates = newEntries.length - uniqueEntries.length;

  if (duplicates > 0) {
    console.log(`⚠️ ${duplicates} productos duplicados omitidos`);
  }

  // Agregar al catálogo
  const finalCatalog = [...existingCatalog, ...uniqueEntries];
  await fs.writeFile(catalogPath, JSON.stringify(finalCatalog, null, 2), 'utf-8');

  console.log(`\n✅ ${uniqueEntries.length} nuevos perfumes agregados al catálogo`);
  console.log(`📄 Total: ${finalCatalog.length} productos en ${catalogPath}`);
  console.log(`\n🏷️  Resumen por categoría:`);
  const byGender = {};
  newPerfumes.forEach(p => {
    byGender[p.gender] = (byGender[p.gender] || 0) + 1;
  });
  Object.entries(byGender).forEach(([g, c]) => console.log(`   ${g}: ${c} perfumes`));
  console.log(`\n💡 Ejecuta 'node scripts/scraperSkill.js --update-missing' para buscar las fotos`);
}

addNewPerfumes().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
