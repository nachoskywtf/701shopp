import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Heart, ShoppingBag, ShieldCheck, Truck, Lock, Star, Clock, Flame, Leaf } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getProduct, products } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/ProductCard";
import { Countdown } from "@/components/Countdown";
import { formatCLP, discountPct } from "@/lib/format";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.brand} ${loaderData.product.name} — 701 Shop` },
          { name: "description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>No encontrado</h1>
      <Link to="/shop" className="mt-6 inline-block text-sm underline">Volver a la tienda</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const [added, setAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const discount = discountPct(product.retail, product.price);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const images = product.images?.length > 0 ? product.images : [product.image];
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onMainSelect = useCallback(() => {
    if (!mainApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
  }, [mainApi]);

  const onThumbClick = useCallback((index: number) => {
    if (!mainApi) return;
    mainApi.scrollTo(index);
  }, [mainApi]);

  useEffect(() => {
    if (!mainApi) return;
    mainApi.on("select", onMainSelect);
    onMainSelect();
    return () => { mainApi.off("select", onMainSelect); };
  }, [mainApi, onMainSelect]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdd = () => {
    add({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pb-32 md:pb-12">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>
        <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative">
            <div className="sticky top-32">
              {/* Main image carousel */}
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-border">
                <div ref={mainRef} className="overflow-hidden">
                  <div className="flex">
                    {images.map((img, i) => (
                      <div key={i} style={{ flex: "0 0 100%", minWidth: 0 }}>
                        <img
                          src={img || "/logo.svg"}
                          alt={product.brand + " " + product.name + " " + (i + 1)}
                          width={1000}
                          height={1000}
                          className="aspect-square w-full object-contain p-8 md:p-16 transition-transform duration-1000 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/logo.svg";
                            e.currentTarget.className = "aspect-square w-full object-contain p-12 opacity-50";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <span className="absolute left-6 top-6 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                  −{discount}% OFF
                </span>
                {/* Carousel dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => onThumbClick(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === selectedIndex ? "w-6 bg-foreground" : "w-2 bg-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div ref={thumbRef} className="mt-3 overflow-hidden">
                  <div className="flex gap-2">
                    {images.map((img, i) => {
                      const thumbClass = i === selectedIndex
                        ? "min-w-0 overflow-hidden rounded-xl border-2 border-foreground opacity-100 transition-all duration-300 bg-white"
                        : "min-w-0 overflow-hidden rounded-xl border-2 border-transparent opacity-50 hover:opacity-80 transition-all duration-300 bg-white";
                      return (
                        <button
                          key={i}
                          onClick={() => onThumbClick(i)}
                          style={{ flex: "0 0 30%" }}
                          className={thumbClass}
                        >
                          <img
                            src={img || "/logo.svg"}
                            alt={"Miniatura " + (i + 1)}
                            width={200}
                            height={200}
                            className="aspect-square w-full object-contain p-2"
                            onError={(e) => { e.currentTarget.src = "/logo.svg"; }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="eyebrow">{product.brand}</span>
            <h1 className="mt-4 text-5xl md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}</div>
              <span>{product.reviews.rating} · {product.reviews.count} reseñas</span>
            </div>

            <div className="my-7 gold-rule" />

            {/* Otoño 2026 Badge */}
            {product.otono && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #b8690e, #d4930a)' }}>
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">Tendencia Otoño 2026</p>
                  <p className="text-xs text-amber-700">Recomendado para la temporada</p>
                </div>
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">{formatCLP(product.price)}</span>
              <span className="text-lg text-muted-foreground line-through">{formatCLP(product.retail)}</span>
              <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">Ahorras {formatCLP(product.retail - product.price)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">o 3 cuotas sin interés de {formatCLP(Math.round(product.price / 3))}</p>

            {/* Urgency */}
            {product.stock <= 5 && (
              <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Flame className="h-4 w-4" /> ¡Quedan solo <b>{product.stock} unidades</b>!
                </div>
              </div>
            )}

            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

            {/* CTAs */}
            <div className="mt-8 flex gap-3">
              <button onClick={handleAdd} className="shine relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition-shadow hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]">
                {added ? <><Check className="h-4 w-4" /> Agregado</> : <><ShoppingBag className="h-4 w-4" /> Agregar al carrito</>}
              </button>
              <button onClick={() => toggleWish(product.id)} aria-label="Favorito" className={`flex h-14 w-14 items-center justify-center rounded-full border transition hover:border-foreground ${wished ? "border-foreground bg-surface text-foreground" : "border-border bg-background text-muted-foreground"}`}>
                <Heart className="h-5 w-5" fill={wished ? "currentColor" : "none"} />
              </button>
            </div>
            <Link to="/cart" onClick={handleAdd} className="mt-3 block rounded-full border border-border py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-surface">
              Comprar ahora
            </Link>

            {/* Notas */}
            {(product.notas.salida || product.notas.corazon || product.notas.fondo) && (
              <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">Pirámide olfativa</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {product.notas.salida && <div className="flex gap-3"><dt className="w-24 text-muted-foreground">Salida</dt><dd>{product.notas.salida}</dd></div>}
                  {product.notas.corazon && <div className="flex gap-3"><dt className="w-24 text-muted-foreground">Corazón</dt><dd>{product.notas.corazon}</dd></div>}
                  {product.notas.fondo && <div className="flex gap-3"><dt className="w-24 text-muted-foreground">Fondo</dt><dd>{product.notas.fondo}</dd></div>}
                </dl>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Duración</p>
                    <p className="mt-1">{product.duracion}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Uso</p>
                    <p className="mt-1">{product.uso}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
              {[
                { icon: Truck, label: "Envío gratis" },
                { icon: ShieldCheck, label: "100% original" },
                { icon: Lock, label: "Pago seguro" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 text-center">
                  <b.icon className="h-5 w-5 text-foreground" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <section className="mt-32">
          <div className="mb-10">
            <span className="eyebrow">También te puede gustar</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-medium tracking-tight">
              Más de la <span className="text-muted-foreground">edición</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">{formatCLP(product.price)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatCLP(product.retail)}</span>
            </div>
          </div>
          <button onClick={handleAdd} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background">
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>

      {/* Desktop sticky reveal CTA */}
      <div className={`fixed inset-x-0 bottom-6 z-30 hidden justify-center px-6 transition-all duration-500 md:flex ${stickyVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-5 rounded-full border border-border bg-background/95 py-2 pl-2 pr-2 shadow-card-hover backdrop-blur-lg">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-surface">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
              <p className="text-sm font-medium leading-tight">{product.name}</p>
            </div>
          </div>
          <span className="pl-3 text-base font-bold text-foreground">{formatCLP(product.price)}</span>
          <button onClick={handleAdd} className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background">
            {added ? <><Check className="h-4 w-4" /> Agregado</> : <><ShoppingBag className="h-4 w-4" /> Agregar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
