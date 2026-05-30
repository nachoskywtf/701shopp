import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";
import { formatCLP } from "@/lib/format";

export function SearchCommand({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  useEffect(() => { if (!open) setQ(""); }, [open]);
  const term = q.trim().toLowerCase();
  const results = term
    ? products.filter((p) =>
        `${p.name} ${p.brand} ${p.notas.salida} ${p.notas.corazon} ${p.notas.fondo}`.toLowerCase().includes(term),
      )
    : products.slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl border-border bg-surface p-0">
        <DialogTitle className="sr-only">Buscar fragancias</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar fragancias, marcas, notas…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sin resultados para "{q}"</p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-background/60"
            >
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-background">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.brand}</p>
                <p className="text-sm font-medium">{p.name}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{formatCLP(p.price)}</span>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
