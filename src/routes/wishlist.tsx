import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Favoritos — 701 Shop" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[60vh]" />;
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <span className="eyebrow">Guardados</span>
      <h1 className="mt-4 text-5xl md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
        Tus <span className="italic text-muted-foreground">favoritos</span>
      </h1>
      {items.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-border bg-surface p-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-6 text-2xl" style={{ fontFamily: "var(--font-display)" }}>Aún no guardaste nada</p>
          <p className="mt-2 text-sm text-muted-foreground">Toca el corazón en cualquier fragancia para guardarla.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-foreground px-7 py-3 text-xs font-semibold uppercase tracking-wider text-background">
            Ver fragancias
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
