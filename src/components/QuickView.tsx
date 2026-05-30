import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatCLP, discountPct } from "@/lib/format";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  if (!product) return null;
  const discount = discountPct(product.retail, product.price);

  const handleAdd = () => {
    add({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-3xl border-border bg-surface p-0">
        <DialogTitle className="sr-only">{product.brand} {product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-background md:aspect-auto">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{product.brand}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-foreground text-foreground" /> {product.reviews.rating} ({product.reviews.count})
              </span>
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              {product.name}
            </h2>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{product.duracion}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-foreground">{formatCLP(product.price)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatCLP(product.retail)}</span>
            </div>
            <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={handleAdd}
                className="shine relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background"
              >
                {added ? <><Check className="h-4 w-4" /> Agregado</> : <><ShoppingBag className="h-4 w-4" /> Agregar al carrito</>}
              </button>
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                onClick={() => onOpenChange(false)}
                className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Ver detalles completos
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
