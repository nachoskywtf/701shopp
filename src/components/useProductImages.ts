import { useState, useEffect } from 'react';

export interface ProductImage {
  imagen_principal: string;
  imagenes: string[];
}

/**
 * Hook que resuelve las imágenes de un producto
 * 
 * Acepta CUALQUIER nombre de campo y los normaliza:
 * - nombre | name | title → nombre
 * - marca | brand | Brand → marca
 * - precio | price | Price → precio
 * - imagen_principal | image | imageUrl | photo → imagen_principal
 * - imagenes | images | photos → imagenes[]
 */
export function useProductImages(product: any) {
  const [images, setImages] = useState<ProductImage>({
    imagen_principal: '/img/perfumes/default-bottle.webp',
    imagenes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) {
      setLoading(false);
      return;
    }

    // Normalizar campos (acepta múltiples nombres)
    const nombre = product.nombre || product.name || product.title || '';
    const marca = product.marca || product.brand || product.Brand || '';
    const precio = product.precio || product.price || product.Price || 0;
    
    // Normalizar campos de imagen
    let imagenPrincipal = product.imagen_principal || product.image || product.imageUrl || product.photo || '';
    let imagenes = product.imagenes || product.images || product.photos || [];
    
    // Si no hay array pero hay imagen principal, crear array
    if (!Array.isArray(imagenes) && imagenPrincipal) {
      imagenes = [imagenPrincipal];
    }
    
    // Si hay array pero no imagen principal, usar la primera
    if (Array.isArray(imagenes) && imagenes.length > 0 && !imagenPrincipal) {
      imagenPrincipal = imagenes[0];
    }

    // Fallback si no hay imágenes
    if (!imagenPrincipal) {
      imagenPrincipal = '/img/perfumes/default-bottle.webp';
    }

    setImages({
      imagen_principal: imagenPrincipal,
      imagenes: Array.isArray(imagenes) ? imagenes : []
    });
    setLoading(false);
  }, [product]);

  return { images, loading };
}

/**
 * Función para resolver imágenes sin hook (para uso directo)
 */
export function resolveProductImages(product: any): ProductImage {
  if (!product) {
    return {
      imagen_principal: '/img/perfumes/default-bottle.webp',
      imagenes: []
    };
  }

  let imagenPrincipal = product.imagen_principal || product.image || product.imageUrl || product.photo || '';
  let imagenes = product.imagenes || product.images || product.photos || [];
  
  if (!Array.isArray(imagenes) && imagenPrincipal) {
    imagenes = [imagenPrincipal];
  }
  
  if (Array.isArray(imagenes) && imagenes.length > 0 && !imagenPrincipal) {
    imagenPrincipal = imagenes[0];
  }

  if (!imagenPrincipal) {
    imagenPrincipal = '/img/perfumes/default-bottle.webp';
  }

  return {
    imagen_principal: imagenPrincipal,
    imagenes: Array.isArray(imagenes) ? imagenes : []
  };
}
