import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatCLP } from "@/lib/format";

const FREE_SHIPPING = 79990;

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Carrito — 701 Shop" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const promo = count >= 2 ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : 4990;
  const total = subtotal - promo + shipping;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-4xl" style={{ fontFamily: "var(--font-display)" }}>Tu carrito está vacío</h1>
        <p className="mt-3 text-muted-foreground">Descubre nuestra selección curada de fragancias de lujo.</p>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-foreground px-7 py-4 text-xs font-semibold uppercase tracking-wider text-background">
          Empezar a comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-5xl md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
        Tu <span className="italic text-muted-foreground">carrito</span>
      </h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-background">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.brand}</p>
                <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>{item.name}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatCLP(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                <button onClick={() => setQty(item.id, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-background" aria-label="Disminuir"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                <button onClick={() => setQty(item.id, item.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-background" aria-label="Aumentar"><Plus className="h-3 w-3" /></button>
              </div>
              <button onClick={() => remove(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Resumen</h2>
          <div className={`mt-4 rounded-xl p-3 text-center text-xs ${count >= 2 ? "bg-background text-foreground" : "bg-background text-muted-foreground"}`}>
            {count >= 2 ? <>✓ ¡Promo aplicada! 2x10% OFF</> : <>Lleva 2+ y obtén <b className="text-foreground">10% OFF</b></>}
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
            {promo > 0 && (
              <div className="flex justify-between text-foreground"><dt className="flex items-center gap-1"><Check className="h-3 w-3" /> Descuento 2x10%</dt><dd>−{formatCLP(promo)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted-foreground">Envío (Starken)</dt><dd className="text-xs text-muted-foreground">Calculado en Checkout</dd></div>
            <div className="border-t border-border pt-3" />
            <div className="flex justify-between text-base"><dt className="font-semibold">Total Parcial</dt><dd className="font-bold text-foreground">{formatCLP(subtotal - promo)}</dd></div>
          </dl>

          <div className="mt-6 p-3 bg-foreground/5 border border-border rounded-lg text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Aviso logístico:</span> Los envíos son vía Starken. El costo a tu comuna se calculará y añadirá al precio final automáticamente en la pasarela de pago (FLOW).
          </div>

          <button className="shine relative mt-4 w-full overflow-hidden rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-wider text-background">
            Continuar al Pago Seguro
          </button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">Transacción encriptada por Flow · Devolución gratis 14 días</p>
        </aside>
      </div>
    </div>
  );
}
