import { Link } from "@tanstack/react-router";
import { Heart, Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/wishlist";
import { MiniCart } from "@/components/MiniCart";
import { SearchCommand } from "@/components/SearchCommand";
import { easeOutQuint } from "@/lib/motion";

export function SiteHeader() {
  const wishCount = useWishlist((s) => s.ids.length);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => setMounted(true), []);
  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setScrolled(latest > 8);
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-foreground py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-background">
        Envío gratis sobre $79.990 · Garantía de autenticidad 100%
      </div>

      {/* Main header */}
      <motion.header
        className="sticky top-0 z-40 bg-background"
        animate={{
          borderBottomColor: scrolled ? "var(--border)" : "transparent",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.04)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3, ease: easeOutQuint as [number, number, number, number] }}
        style={{ borderBottom: "1px solid transparent" }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 md:gap-12">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center md:hidden"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo (Left) */}
          <Link to="/" className="flex shrink-0 items-center">
            <motion.img
              src="/logo.svg"
              alt="701 Shop"
              className="h-10 md:h-12 w-auto object-contain"
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                  "drop-shadow(0 0 18px rgba(255,255,255,1))",
                  "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </Link>

          {/* Search Bar (Center Desktop) */}
          <div className="hidden flex-1 md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center gap-3 rounded-full border border-border bg-surface px-6 py-3.5 text-sm text-muted-foreground transition-colors hover:bg-surface/80 hover:border-foreground/20"
            >
              <Search className="h-5 w-5" />
              <span>Buscar marcas, perfumes y más...</span>
            </button>
          </div>

          {/* Right icons */}
          <div className="flex shrink-0 items-center justify-end gap-4 md:gap-6">
            <motion.button
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
              className="text-muted-foreground md:hidden"
              whileHover={{ color: "var(--foreground)", scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="h-5 w-5" />
            </motion.button>
            <Link to="/wishlist" aria-label="Favoritos" className="relative text-muted-foreground transition-colors hover:text-foreground">
              <Heart className="h-5 w-5" />
              {mounted && wishCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background"
                >
                  {wishCount}
                </motion.span>
              )}
            </Link>
            <MiniCart />
          </div>
        </div>

        {/* Secondary Navigation (Categories) Desktop */}
        <div className="hidden border-t border-border bg-background md:block">
          <nav className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {[
              { to: "/", label: "Inicio", exact: true },
              { to: "/shop", label: "Tienda", exact: false },
              { to: "/mayorista", label: "Mayorista", exact: false },
              { to: "/#newsletter", label: "Ofertas", exact: false, isAnchor: true },
            ].map((item) =>
              item.isAnchor ? (
                <a
                  key={item.label}
                  href={item.to}
                  className="group relative text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {item.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left bg-foreground"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: easeOutQuint as [number, number, number, number] }}
                  />
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to as "/shop" | "/"}
                  activeOptions={item.exact ? { exact: true } : undefined}
                  activeProps={{ className: "text-foreground" }}
                  className="group relative text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        {/* Mobile search */}
        <div className="border-t border-border md:hidden">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 px-6 py-2.5 text-sm text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            Buscar fragancias…
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutQuint as [number, number, number, number] }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {[
                  { to: "/", label: "Inicio" },
                  { to: "/shop", label: "Tienda" },
                  { to: "/mayorista", label: "Mayorista" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3, ease: easeOutQuint as [number, number, number, number] }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 text-sm font-medium uppercase tracking-[0.18em] text-foreground"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
