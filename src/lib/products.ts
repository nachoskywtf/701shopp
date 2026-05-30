import rawCatalog from "./catalog_output.json" with { type: "json" };

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;       // CLP
  retail: number;      // CLP
  image: string;
  images: string[];    // Gallery of 3 product photos
  notas: { salida: string; corazon: string; fondo: string };
  duracion: string;
  uso: string;
  description: string;
  gender: "Hombre" | "Mujer" | "Unisex";
  stock: number;
  reviews: { rating: number; count: number };
  otono: boolean;      // Recomendado para Otoño 2026
};

export const products: Product[] = rawCatalog.map((raw: any) => {
  // raw.name format: "BRAND;PRODUCT NAME ;STATUS; $RETAIL ; $PRICE "
  const parts = raw.name.split(";");
  const brand = raw.brand || parts[0]?.trim() || "701 Shop";
  let name = parts[1]?.trim() || "Fragancia Exclusiva";
  
  // Clean up name by removing the brand if it's duplicated at the start
  const brandUpper = brand.toUpperCase();
  if (name.toUpperCase().startsWith(brandUpper)) {
    name = name.substring(brandUpper.length).trim();
  }
  
  // Extract prices
  const retailStr = parts[3]?.replace(/[^\d]/g, "") || "0";
  const priceStr = parts[4]?.replace(/[^\d]/g, "") || "0";
  const retail = parseInt(retailStr, 10);
  const price = parseInt(priceStr, 10);
  
  // Infer gender: prefer explicit field, fallback to name-based detection
  let gender: "Hombre" | "Mujer" | "Unisex" = raw.gender || "Unisex";
  if (gender === "Unisex") {
    const upperName = name.toUpperCase();
    if (upperName.includes("HOMBRE") || upperName.includes("HOMME") || upperName.includes("MEN ") || upperName.includes("POUR HOMME") || upperName.includes("FOR HIM") || upperName.includes("MAN ")) {
      gender = "Hombre";
    } else if (upperName.includes("MUJER") || upperName.includes("FEMME") || upperName.includes("WOMAN") || upperName.includes("WOMEN") || upperName.includes("POUR FEMME") || upperName.includes("FOR HER")) {
      gender = "Mujer";
    }
  }
  
  return {
    id: raw.id || name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    brand: brand,
    price: price > 0 ? price : 29990,
    retail: retail > 0 ? retail : 39990,
    image: raw.image,
    images: raw.images || [raw.image],
    notas: raw.notas || { salida: "", corazon: "", fondo: "" },
    duracion: "Larga duración",
    uso: "Ideal para cualquier ocasión",
    description: `Descubre la esencia de ${name} por ${brand}. Una fragancia excepcional diseñada para cautivar los sentidos y elevar tu estándar.`,
    gender: gender,
    stock: 10,
    reviews: { rating: 4.8, count: Math.floor(Math.random() * 500) + 50 },
    otono: raw.otono === true,
  };
});

export const brands = Array.from(new Set(products.map(p => p.brand))).sort();

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}