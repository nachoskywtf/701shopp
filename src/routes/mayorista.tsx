import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/mayorista")({
  head: () => ({
    meta: [
      { title: "Mayorista — Emprende con 701 Shop" },
      { name: "description", content: "Inicia tu negocio de perfumes con márgenes altamente competitivos." },
    ],
  }),
  component: Mayorista,
});

function Mayorista() {
  return (
    <main className="bg-background">
      {/* ─── Hero Mayorista ─── */}
      <section className="relative flex min-h-[80vh] w-full items-center overflow-hidden">
        {/* Full-width Image Background */}
        <div className="absolute inset-0 z-0 bg-black">
          <img
            src="/src/assets/wholesale_boxes.jpg"
            alt="Cajas al por mayor"
            className="h-full w-full object-cover object-right md:object-center"
          />
          {/* Gradient Overlay for Legibility */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>
        </div>
        
        {/* Text Container */}
        <div className="container relative z-20 mx-auto w-full px-6 md:w-1/2 md:px-12">
          <div className="flex max-w-xl flex-col justify-center">
            <h1
              className="text-balance text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Emprende tu Negocio de Perfumes
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-white drop-shadow-2xl md:text-lg font-medium">
              Inicia tu propio camino con una inversión mínima desde $150.000 pesos. Accede a nuestro catálogo mayorista, distribuye fragancias 100% originales y asegura márgenes de ganancia altamente competitivos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="https://wa.me/56957308791?text=Hola%2C%20quiero%20emprender%20con%20701shop%21%20Me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20los%20precios%20mayoristas."
                target="_blank"
                rel="noopener noreferrer"
                className="shine relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-shadow duration-300 hover:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)]"
              >
                Quiero Emprender <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
