import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsApp";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "701 Shop — Lujosos perfumes. Precios inteligentes." },
      { name: "description", content: "Fragancias 100% originales hasta 30% más baratas. Envío a todo Chile." },
      { property: "og:title", content: "701 Shop — Perfumes originales en Chile" },
      { property: "og:description", content: "Fragancias 100% originales hasta 30% más baratas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@701shop" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function TopProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[100] h-1 bg-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          initial={{ scaleX: 0, opacity: 1, transformOrigin: "0% 50%" }}
          animate={{ scaleX: 1, transition: { duration: 2, ease: "circOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        />
      )}
    </AnimatePresence>
  );
}

function RootComponent() {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen flex-col">
      <TopProgressBar />
      <SiteHeader />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
