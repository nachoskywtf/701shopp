import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatCLP } from "@/lib/format";

const FREE_SHIPPING = 79990;

export function MiniCart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const promoActive = count >= 2;
  const discount = promoActive ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative flex items-center gap-2 text-sm font-medium transition hover:text-foreground" aria-label="Abrir carrito">
          <ShoppingBag className="h-5 w-5" />
          <span className="hidden sm:inline">Carrito</span>
          {mounted && count > 0 && (
            <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold text-background">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-5">
          <SheetTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Tu bolsa <span className="text-sm text-muted-foreground">({count})</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>Tu bolsa está vacía</p>
            <p className="mt-1 text-sm text-muted-foreground">Descubre nuestras fragancias de lujo.</p>
            <Link to="/shop" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background">
              Ver tienda
            </Link>
          </div>
        ) : (
          <>
            {/* Promo banner */}
            <div className={`px-6 py-3 text-center text-xs ${promoActive ? "bg-surface text-foreground" : "bg-surface text-muted-foreground"}`}>
              {promoActive ? (
                <>✓ ¡Promo aplicada! Lleva 2+ y obtén <b>10% OFF</b></>
              ) : (
                <>Lleva <b>2 productos</b> y obtén <b className="text-foreground">10% OFF</b></>
              )}
            </div>

            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-border py-4 last:border-0">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{item.brand}</p>
                        <p className="text-base" style={{ fontFamily: "var(--font-display)" }}>{item.name}</p>
                      </div>
                      <button onClick={() => remove(item.id)} aria-label="Quitar" className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface" aria-label="Disminuir">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-medium">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface" aria-label="Aumentar">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{formatCLP(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border bg-surface px-6 py-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCLP(subtotal)}</span></div>
                {promoActive && (
                  <div className="flex justify-between text-foreground"><span className="flex items-center gap-1"><Check className="h-3 w-3" /> Descuento 2x10%</span><span>−{formatCLP(discount)}</span></div>
                )}
                <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-semibold text-foreground">{formatCLP(total)}</span></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {subtotal >= FREE_SHIPPING ? "✓ Envío gratis desbloqueado" : `Agrega ${formatCLP(FREE_SHIPPING - subtotal)} para envío gratis`}
              </p>
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="shine relative mt-4 block w-full overflow-hidden rounded-full bg-foreground py-4 text-center text-xs font-semibold uppercase tracking-wider text-background"
              >
                Finalizar compra · {formatCLP(total)}
              </Link>
              <button onClick={() => setOpen(false)} className="mt-3 block w-full text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
