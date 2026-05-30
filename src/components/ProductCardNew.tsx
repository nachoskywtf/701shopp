import React, { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

// ────────────────────────────────────────────────────────────────
//  ProductCard — Componente de carta de perfume
//
//  Props:
//    product   {Product}   — Un objeto del array products
//
//  Adaptado para usar la estructura existente:
//    - product.brand  → marca
//    - product.name   → nombre  
//    - product.price  → precio
//    - product.images → imagenes[]
//    - product.image  → imagen_principal
// ────────────────────────────────────────────────────────────────

const FALLBACK_IMG = "/img/perfumes/default-bottle.webp";

interface ProductCardProps {
  product: Product;
}

export default function ProductCardNew({ product }: ProductCardProps) {
  // ── Estado local: imagen activa y flag de error de carga ──
  // Mapear campos del producto existente al formato esperado
  const marca = product?.brand || "";
  const nombre = product?.name || "";
  const precio = product?.price || 0;
  const imagenes = product?.images || (product?.image ? [product.image] : []);
  const imagen_principal = product?.image || imagenes[0] || FALLBACK_IMG;
  
  const [imgSrc, setImgSrc]         = useState(imagen_principal || FALLBACK_IMG);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [isHovered, setIsHovered]   = useState(false);
  
  // Hook del carrito
  const addToCart = useCart((s) => s.add);

  if (!product) return null;

  const hasImages = imagenes.length > 0;

  // ── Manejadores de imagen ──────────────────────────────────
  const handleImgError = () => setImgSrc(FALLBACK_IMG);
  const handleThumbClick = (src: string, idx: number) => {
    setImgSrc(src);
    setThumbIndex(idx);
    setImgLoaded(false);
  };

  // ── Estilos (CSS-in-JS) ────────────────────────────────────
  // Se usan objetos de estilo inline para que el componente sea
  // 100% portable sin necesidad de archivos .css adicionales.

  const styles: Record<string, React.CSSProperties | any> = {
    card: {
      position        : "relative",
      width           : "100%",
      maxWidth        : "300px",
      borderRadius    : "20px",
      background      : "linear-gradient(145deg, #ffffff 0%, #f5f0eb 100%)",
      boxShadow       : isHovered
        ? "0 20px 60px rgba(139, 90, 43, 0.18), 0 4px 20px rgba(0,0,0,0.08)"
        : "0 4px 24px rgba(0,0,0,0.07)",
      border          : "1px solid rgba(139, 90, 43, 0.12)",
      overflow        : "hidden",
      transition      : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
      transform       : isHovered ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
      cursor          : "pointer",
      fontFamily      : "'Georgia', 'Times New Roman', serif",
    },

    // Contenedor de la imagen principal
    imageWrapper: {
      position        : "relative",
      width           : "100%",
      height          : "260px",
      background      : "#ffffff",               // fondo blanco para mix-blend
      display         : "flex",
      alignItems      : "center",
      justifyContent  : "center",
      overflow        : "hidden",
      borderBottom    : "1px solid rgba(139,90,43,0.08)",
    },

    // ⭐ LA CLAVE: mix-blend-mode:multiply elimina el fondo blanco
    //    object-fit:contain asegura que se vea completo el frasco
    productImage: {
      width           : "100%",
      height          : "100%",
      objectFit       : "contain",         // ← no recorta el frasco
      objectPosition  : "center",
      mixBlendMode    : "multiply",        // ← fondo blanco → transparente
      transition      : "opacity 0.4s ease, transform 0.4s ease",
      opacity         : imgLoaded ? 1 : 0, // fade-in al cargar
      transform       : isHovered ? "scale(1.06)" : "scale(1)",
      padding         : "12px",
    },

    // Skeleton mientras carga la imagen
    skeleton: {
      position        : "absolute",
      inset           : "0",
      background      : "linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%)",
      backgroundSize  : "200% 100%",
      animation       : "shimmer 1.5s infinite",
      display         : imgLoaded ? "none" : "block",
    },

    // Badge de marca
    brandBadge: {
      position        : "absolute",
      top             : "12px",
      left            : "12px",
      background      : "rgba(255,255,255,0.9)",
      backdropFilter  : "blur(8px)",
      border          : "1px solid rgba(139,90,43,0.2)",
      borderRadius    : "20px",
      padding         : "3px 10px",
      fontSize        : "10px",
      fontWeight      : "600",
      letterSpacing   : "0.12em",
      color           : "#8b5a2b",
      textTransform   : "uppercase",
    },

    // Miniaturas (galería)
    thumbsContainer: {
      display         : "flex",
      gap             : "6px",
      padding         : "8px 14px",
      justifyContent  : "center",
      background      : "#faf7f4",
      borderBottom    : "1px solid rgba(139,90,43,0.07)",
    },

    thumb: (isActive: boolean) => ({
      width           : "40px",
      height          : "40px",
      borderRadius    : "8px",
      overflow        : "hidden",
      border          : isActive ? "2px solid #8b5a2b" : "2px solid transparent",
      cursor          : "pointer",
      transition      : "border-color 0.2s ease, transform 0.2s ease",
      transform       : isActive ? "scale(1.08)" : "scale(1)",
      background      : "#ffffff",
      flexShrink      : 0,
    }),

    thumbImg: {
      width           : "100%",
      height          : "100%",
      objectFit       : "contain",
      mixBlendMode    : "multiply",
    },

    // Área de texto / info
    infoArea: {
      padding         : "16px 18px 18px",
    },

    productName: {
      margin          : "0 0 6px 0",
      fontSize        : "15px",
      fontWeight      : "600",
      color           : "#2c1810",
      lineHeight      : "1.35",
      letterSpacing   : "0.01em",
    },

    price: {
      fontSize        : "20px",
      fontWeight      : "700",
      color           : "#8b5a2b",
      margin          : "10px 0 14px",
      letterSpacing   : "-0.02em",
    },

    // Indicador de sin imagen
    noImageBadge: {
      position        : "absolute",
      bottom          : "8px",
      right           : "8px",
      background      : "rgba(255,200,100,0.15)",
      border          : "1px solid rgba(200,150,50,0.3)",
      borderRadius    : "6px",
      padding         : "2px 8px",
      fontSize        : "9px",
      color           : "#a07020",
      letterSpacing   : "0.08em",
      display         : hasImages ? "none" : "block",
    },

    addButton: {
      width           : "100%",
      padding         : "11px",
      background      : isHovered
        ? "linear-gradient(135deg, #8b5a2b 0%, #c4843d 100%)"
        : "linear-gradient(135deg, #6b4226 0%, #8b5a2b 100%)",
      color           : "#fff",
      border          : "none",
      borderRadius    : "12px",
      fontSize        : "13px",
      fontWeight      : "600",
      letterSpacing   : "0.08em",
      textTransform   : "uppercase",
      cursor          : "pointer",
      transition      : "all 0.3s ease",
      boxShadow       : "0 4px 16px rgba(139,90,43,0.3)",
    },
  };

  return (
    <>
      {/* Keyframes del skeleton — se inyectan una sola vez */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <article
        style={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Perfume ${marca} ${nombre}`}
      >
        {/* ── Imagen principal ─────────────────────────── */}
        <div style={styles.imageWrapper}>
          {/* Skeleton shimmer mientras carga */}
          <div style={styles.skeleton} aria-hidden="true" />

          <img
            src={imgSrc}
            alt={`${marca} ${nombre} — frasco de perfume`}
            style={styles.productImage}
            onLoad={() => setImgLoaded(true)}
            onError={handleImgError}
            loading="lazy"
          />

          {/* Badge de marca */}
          <span style={styles.brandBadge} aria-label={`Marca: ${marca}`}>
            {marca}
          </span>

          {/* Indicador si aún no tiene foto */}
          <span style={styles.noImageBadge} aria-label="Sin imagen disponible aún">
            📷 Pendiente
          </span>
        </div>

        {/* ── Galería de miniaturas (solo si hay más de 1) ── */}
        {hasImages && imagenes.length > 1 && (
          <div style={styles.thumbsContainer} role="list" aria-label="Galería de imágenes">
            {imagenes.map((src, idx) => (
              <div
                key={idx}
                style={styles.thumb(idx === thumbIndex)}
                onClick={() => handleThumbClick(src, idx)}
                role="listitem"
                aria-label={`Ver imagen ${idx + 1}`}
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && handleThumbClick(src, idx)}
              >
                <img
                  src={src}
                  alt={`Vista ${idx + 1}`}
                  style={styles.thumbImg}
                  onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Info del producto ─────────────────────────── */}
        <div style={styles.infoArea}>
          <h3 style={styles.productName}>{nombre}</h3>

          {precio != null && (
            <p style={styles.price} aria-label={`Precio: $${precio}`}>
              ${typeof precio === "number" ? precio.toLocaleString("es-CL") : precio}
            </p>
          )}

          <button
            style={styles.addButton}
            onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image })}
            aria-label={`Agregar ${nombre} al carrito`}
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    </>
  );
}
