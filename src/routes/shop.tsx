import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { products, brands } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCLP } from "@/lib/format";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  brand: fallback(z.string(), "").default(""),
  gender: fallback(z.enum(["", "Hombre", "Mujer", "Unisex"]), "").default(""),
  max: fallback(z.number(), 200000).default(200000),
  sort: fallback(z.enum(["destacado", "bajo", "alto"]), "destacado").default("destacado"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(schema),
  head: () => ({ meta: [{ title: "Tienda — 701 Shop" }, { name: "description", content: "Perfumes 100% originales en Chile." }] }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  const filtered = useMemo(() => {
    const term = search.q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (search.brand && p.brand !== search.brand) return false;
      if (search.gender && p.gender !== search.gender) return false;
      if (p.price > search.max) return false;
      if (term && !`${p.brand} ${p.name} ${p.notas.salida} ${p.notas.corazon} ${p.notas.fondo}`.toLowerCase().includes(term)) return false;
      return true;
    });
    if (search.sort === "bajo") list = [...list].sort((a, b) => a.price - b.price);
    if (search.sort === "alto") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [search]);

  const hasFilter = search.brand || search.gender || search.q || search.max < 200000;

  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(24);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => prev + 24);
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [filtered.length, visibleCount]);

  const AccordionSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-gray-200/50 py-5">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left focus:outline-none"
        >
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">{title}</h3>
          <span className="text-muted-foreground text-xs">{open ? "−" : "+"}</span>
        </button>
        {open && <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em]">Filtros</h2>
        {hasFilter && (
          <button onClick={() => navigate({ search: { q: "", brand: "", gender: "", max: 200000, sort: "destacado" } })} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Limpiar todo
          </button>
        )}
      </div>

      <AccordionSection title="Para">
        <div className="flex flex-wrap gap-2">
          {(["", "Hombre", "Mujer", "Unisex"] as const).map((g) => (
            <button
              key={g || "all"}
              onClick={() => update({ gender: g })}
              className={`rounded-sm border px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 ${
                search.gender === g
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {g || "Todos"}
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Precio">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Máximo</span>
            <span className="text-xs font-semibold text-foreground">{formatCLP(search.max)}</span>
          </div>
          <Slider
            value={[search.max]}
            min={10000}
            max={300000}
            step={10000}
            onValueChange={(v) => update({ max: v[0] })}
            className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_.bg-primary]:bg-foreground"
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Marcas" defaultOpen={false}>
        <div className="max-h-64 space-y-3 overflow-y-auto pr-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <button
            onClick={() => update({ brand: "" })}
            className="group flex w-full items-center gap-3 text-left"
          >
            <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${!search.brand ? "border-foreground bg-foreground" : "border-border bg-transparent group-hover:border-foreground"}`}>
              {!search.brand && <Check className="h-3 w-3 text-background" />}
            </div>
            <span className={`text-xs uppercase tracking-wider transition-colors ${!search.brand ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
              Todas
            </span>
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => update({ brand: b })}
              className="group flex w-full items-center gap-3 text-left"
            >
              <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${search.brand === b ? "border-foreground bg-foreground" : "border-border bg-transparent group-hover:border-foreground"}`}>
                {search.brand === b && <Check className="h-3 w-3 text-background" />}
              </div>
              <span className={`text-xs uppercase tracking-wider transition-colors ${search.brand === b ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                {b}
              </span>
            </button>
          ))}
        </div>
      </AccordionSection>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 md:py-10">

      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar fragancias, marcas, notas…"
            value={search.q}
            onChange={(e) => update({ q: e.target.value })}
            className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm focus:border-foreground focus:outline-none"
          />
          {search.q && (
            <button onClick={() => update({ q: "" })} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Limpiar"><X className="h-4 w-4" /></button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs font-medium uppercase tracking-wider hover:border-foreground lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filtros
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background">
              <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
              <div className="mt-6"><FilterPanel /></div>
            </SheetContent>
          </Sheet>
          <select value={search.sort} onChange={(e) => update({ sort: e.target.value as "destacado" | "bajo" | "alto" })} className="rounded-full border border-border bg-surface px-5 py-3 text-xs font-medium uppercase tracking-wider focus:border-foreground focus:outline-none">
            <option value="destacado">Destacados</option>
            <option value="bajo">Precio: menor a mayor</option>
            <option value="alto">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-32"><FilterPanel /></div></aside>
        <div>
          <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "fragancia" : "fragancias"}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-surface p-16 text-center ring-1 ring-border">
              <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>No hay fragancias que coincidan</p>
              <button onClick={() => navigate({ search: { q: "", brand: "", gender: "", max: 200000, sort: "destacado" } })} className="mt-4 text-xs uppercase tracking-wider text-foreground hover:underline">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                {filtered.slice(0, visibleCount).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (i % 24) * 0.05, ease: "easeOut" }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div ref={loadMoreRef} className="py-12 flex justify-center">
                  <span className="h-6 w-6 rounded-full border-2 border-border border-t-foreground animate-spin"></span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
