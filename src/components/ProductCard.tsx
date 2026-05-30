import { Link } from "@tanstack/react-router";
import { Heart, Eye, ShoppingBag, Check, Star, Leaf } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { QuickView } from "@/components/QuickView";
import { formatCLP, discountPct } from "@/lib/format";
import { easeOutQuint } from "@/lib/motion";

const ease = easeOutQuint as [number, number, number, number];

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPct(product.retail, product.price);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const [quickOpen, setQuickOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images?.length > 0 ? product.images : [product.image];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <motion.div
        className="group relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4, ease }}
      >
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="relative block overflow-hidden rounded-2xl border border-border bg-background transition-shadow duration-500 hover:shadow-card-hover"
        >
          {/* Image area */}
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <div ref={emblaRef} className="h-full overflow-hidden">
              <div className="flex h-full">
                {images.map((img, i) => (
                  <div key={i} className="min-w-0 flex-[0_0_100%] h-full">
                    <motion.img
                      src={img || "/logo.svg"}
                      alt={`${product.brand} ${product.name} ${i + 1}`}
                      loading="lazy"
                      width={1000}
                      height={1200}
                      className="h-full w-full object-contain p-4 bg-white"
                      style={{ mixBlendMode: 'multiply' }}
                      onError={(e) => {
                        e.currentTarget.src = "/logo.svg";
                        e.currentTarget.className = "h-full w-full object-contain p-12 opacity-50";
                      }}
                      animate={{ scale: isHovered && i === selectedIndex ? 1.06 : 1 }}
                      transition={{ duration: 1.2, ease }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Carousel dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); emblaApi?.scrollTo(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === selectedIndex ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}


            {/* Discount badge - Removed */}

            {/* Badges */}
            <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
              <span className="rounded bg-foreground/95 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-background backdrop-blur-sm">
                {product.gender}
              </span>
              {product.otono && (
                <span className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #b8690e, #d4930a)' }}>
                  <Leaf className="h-2.5 w-2.5" /> Otoño 2026
                </span>
              )}
            </div>

            {/* Stock warning */}
            {product.stock <= 5 && (
              <span className="absolute bottom-4 left-4 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-medium text-foreground backdrop-blur-sm">
                Quedan solo {product.stock}
              </span>
            )}

            {/* Hover overlay CTA */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent p-4 pt-16"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <button
                    onClick={handleAdd}
                    className="shine relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-wider text-background"
                  >
                    {added ? (
                      <><Check className="h-4 w-4" /> Agregado</>
                    ) : (
                      <><ShoppingBag className="h-4 w-4" /> Agregar al carrito</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info area */}
          <div className="space-y-1.5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                {product.brand}
              </p>
            </div>
            <h3
              className="text-lg md:text-xl leading-tight text-foreground line-clamp-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-base font-semibold text-foreground">
                {formatCLP(Math.floor(product.price / 1000) * 1000 + 990)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatCLP(Math.floor(product.retail / 1000) * 1000 + 990)}
              </span>
            </div>
          </div>
        </Link>

        {/* Floating actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute right-4 top-4 flex flex-col gap-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25, ease }}
            >
              <motion.button
                onClick={(e: React.MouseEvent) => { e.preventDefault(); toggleWish(product.id); }}
                aria-label="Favorito"
                className={`flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition ${
                  wished ? "border-foreground text-foreground" : "border-border text-muted-foreground"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
              </motion.button>
              <motion.button
                onClick={(e: React.MouseEvent) => { e.preventDefault(); setQuickOpen(true); }}
                aria-label="Vista rápida"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always-visible mobile actions */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 md:hidden">
          <button
            onClick={(e: React.MouseEvent) => { e.preventDefault(); toggleWish(product.id); }}
            aria-label="Favorito"
            className={`flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm ${
              wished ? "border-foreground text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
          </button>
        </div>
      </motion.div>

      <QuickView product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}
