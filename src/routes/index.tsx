import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck, Lock, Sparkles, Star, Quote, X, MessageSquare, Check } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import heroImg from "@/assets/hero.jpg";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Countdown } from "@/components/Countdown";
import {
  easeOutQuint,
  fadeUp,
  staggerContainer,
  defaultViewTransition,
} from "@/lib/motion";

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      { title: "701 Shop — Lujosos perfumes. Precios inteligentes." },
      { name: "description", content: "Fragancias 100% originales hasta 30% más baratas. Envío a todo Chile." },
    ],
  }),
  component: Home,
});

const initialReviews = [
  { name: "Matías C.", text: "Weno a cagar el Stronger with You pa la disco, las minas preguntan al tiro qué perfume es. Saludos a la 701.", rating: 5 },
  { name: "Ignacio T.", text: "Compré el Jean Paul dorado, exquisito. Llegó al día siguiente y me ahorré caleta de lucas comparado con el mall.", rating: 5 },
  { name: "Felipe R.", text: "Joya el Club de Nuit Intense. Dura todo el día en la piel, terrible brígido el aroma y proyecta una brutalidad.", rating: 5 },
  { name: "Sebastián M.", text: "La Vie Est Belle 100% original. Mi polola quedó feliz y yo no me fui a la quiebra jaja. Secos.", rating: 5 },
  { name: "Lucas V.", text: "Hermano, el 9 PM de Afnan es una locura. Huele a filete y rinde como bestia. Recomendadísimo.", rating: 5 },
  { name: "Nicolás O.", text: "Bacán la atención, me guiaron súper bien. El YSL Y EDP es la cumbia misma pa ir a la pega.", rating: 5 },
  { name: "Valentina S.", text: "Me pedí el Good Girl de Carolina Herrera y es la raja. Llegó impecable, súper bien envuelto, de lujo.", rating: 5 },
  { name: "Javiera L.", text: "A otro nivel el Baccarat Rouge 540. Pensé que era mula por el precio pero no, es originalísimo. Un manjar.", rating: 5 },
  { name: "Tomás A.", text: "El Acqua di Gio Profumo apañó súper bien pa este calor. Llegó soplado a Viña.", rating: 5 },
  { name: "Diego F.", text: "Terrible weno el Sauvage Elixir, te echái dos atomizaciones y quedái pasado pa todo el día. Vale cada peso.", rating: 5 },
  { name: "Andrés G.", text: "Compré pa revender y los precios están de locos. El Erba Pura se fue al toque. Un abrazo cabros.", rating: 5 },
  { name: "Joaquín P.", text: "Mi primer pedido y cero atado. El Hawas de Rasasi es piola y fresquito, ideal pal verano.", rating: 5 },
  { name: "Benjamín D.", text: "La cagó lo rico que es el Le Beau Le Parfum. Te sentís en el Caribe tomando piña colada. 10/10.", rating: 5 },
  { name: "Carlos E.", text: "Compré el CH Men Privé. Filete el aroma a cuero y copete, especial pa salir de noche.", rating: 5 },
  { name: "Camila J.", text: "Amo el Cloud de Ariana Grande, y acá lo encontré mucho más barato que en el retail. Llegó tiquitaca.", rating: 5 },
  { name: "Rodrigo M.", text: "Puta el Creed Aventus rico weón. Primera vez que lo pruebo y entiendo el hype. Servicio de 10.", rating: 5 },
  { name: "Patricio K.", text: "Tom Ford es otra cosa, huele a jefe millonario súper rápido el envío a Conce", rating: 5 },
  { name: "Marcelo S.", text: "Compre el versace eros flame está la zorra. Dulce y asi como picantito, a las chiquillas les encanta jaja", rating: 5 },
  { name: "Gonzalo T.", text: "Excelente página, me aclararon todas las dudas en wsp, se ganaron un cliente.", rating: 5 },
  { name: "Cristian N.", text: "Compré el asad lattafa a ciegas por tiktok y ta entero weno y literal es el Sauvage Elixir pero a precio pastero jajjajk.", rating: 5 },
  { name: "Fernanda C.", text: "El my way me matoo, secos cabros de 701", rating: 5 },
  { name: "Francisco L.", text: "Apaña caleta el one million dulce a cagar pero rinde una brutalidad. Full pa salir cabros", rating: 5 },
  { name: "Vicente C.", text: "La entrega más rápida que he visto. El Invictus Victory llegó intacto. Tremenda tienda se mandaron.", rating: 5 },
  { name: "Sofía W.", text: "El YSL me dejó loca huele finísimo se pasaron pa rápidosss", rating: 5 },
  { name: "Simón U.", text: "Hermano, el Mancera Red Tobacco no sale ni con lavalozas jaja. Potencia nuclear, la raja el perfume.", rating: 5 },
  { name: "Eduardo P.", text: "god girl me salvó el regalo de aniversario. me ayudaron para pillar el mejor gracias.", rating: 5 },
  { name: "Bastián G.", text: "Me arriesgué con el Khamrah de Lattafa y weonnn muy rico pa los días fríos es top", rating: 5 },
  { name: "Cristian F.", text: "Todo perfecto con el 212 llego al tiro a Antofacity voy a seguir comprando de una.", rating: 5 },
  { name: "Pablo Y.", text: "El Toy Boy de Moschino es rarísimo pero es adictivo jajaj, La presentación de lujo cabros.", rating: 5 },
  { name: "Daniela V.", text: "Pagué la mitad que en París por el Alien de Mugler y es la misma wea. Me ganaron como clienta frecuente.", rating: 5 },
];

const ease = easeOutQuint as [number, number, number, number];

function Home() {
  const bestsellersIds = [
    "xerjoff-erba-pura-100ml-edp",
    "jean-paul-gaultier-le-male-elixir-parfum-75-ml",
    "dior-miss-dior-edp-100ml-mujer",
    "dior-sauvage-edp-100ml-hombre"
  ];
  const bestsellers = bestsellersIds.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products;
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroProgress, [0, 1], [0, 60]);
  const heroGlowY = useTransform(heroProgress, [0, 1], [0, -40]);

  // Reviews State
  const [displayReviews, setDisplayReviews] = useState(() => {
    return initialReviews.filter((r) => r.rating >= 4).sort(() => 0.5 - Math.random()).slice(0, 3);
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayReviews(initialReviews.filter((r) => r.rating >= 4).sort(() => 0.5 - Math.random()).slice(0, 3));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"idle" | "success">("idle");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus("success");
    setTimeout(() => {
      setReviewModalOpen(false);
      setReviewStatus("idle");
    }, 3000);
  };

  return (
    <div>
      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative flex min-h-[80vh] w-full items-center overflow-hidden">
        {/* Full-width Image Background */}
        <motion.img
          src={heroImg}
          alt="Colección de fragancias de lujo"
          className="absolute inset-0 z-0 h-full w-full object-cover object-right md:object-center"
          style={{ scale: 1.1, y: heroImgY }}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 1.2, ease }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        
        {/* Text Container */}
        <div className="container relative z-20 mx-auto w-full px-6 md:w-1/2 md:px-12">
          <div className="flex max-w-xl flex-col justify-center">
            <motion.span
              className="eyebrow flex items-center gap-2 text-white/90 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
            >
              <Sparkles className="h-3 w-3" /> La Edición 701 · Otoño '26
            </motion.span>

            <motion.h1
              className="mt-7 text-balance text-[44px] leading-[0.92] sm:text-6xl md:text-7xl lg:text-[84px] text-white drop-shadow-2xl"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            >
              Lujosos<br />perfumes.<br />
              <span className="italic text-white/80">Precios</span> inteligentes.
            </motion.h1>

            <motion.p
              className="mt-7 max-w-md text-base leading-relaxed text-white/90 md:text-lg drop-shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.35 }}
            >
              Fragancias 100% originales de las casas más codiciadas — hasta{" "}
              <span className="font-semibold text-white">30% más baratas</span> que en retail.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
            >
              <Link
                to="/shop"
                className="shine relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition-shadow duration-300 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]"
              >
                Comprar ahora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="text-xs font-medium uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white drop-shadow-md"
              >
                Ver más vendidos
              </Link>
            </motion.div>

            <motion.div
              className="mt-10 flex items-center gap-4 text-xs text-white/90 drop-shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.65 }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-white text-white drop-shadow-md" />
                ))}
              </div>
              <span>4.8/5 · +800 ventas exitosas</span>
            </motion.div>
          </div>
        </div>
      </section>
      
      <div className="mx-auto max-w-7xl px-6"><div className="gold-rule" /></div>


      {/* ─── Benefits ─── */}
      <section className="border-b border-border bg-surface/50">
        <motion.div
          className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3"
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            { icon: Truck, title: "Envío a todo Chile", desc: "Gratis sobre $79.990" },
            { icon: ShieldCheck, title: "100% originales", desc: "calidad garantizada" },
            { icon: Lock, title: "Pago seguro", desc: "WebPay · MercadoPago · Flow" },
          ].map((b) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              transition={defaultViewTransition}
              className="flex items-center gap-5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                <b.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Bestsellers ─── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <motion.div
          className="mb-14 flex items-end justify-between"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <div>
            <span className="eyebrow">Más vendidos</span>
            <h2
              className="mt-3 text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Los más <span className="italic text-muted-foreground">amados</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {bestsellers.map((p) => (
            <motion.div key={p.id} variants={fadeUp} transition={defaultViewTransition}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Editorial ─── */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <motion.div
            className="grid items-center gap-12 md:grid-cols-2 md:gap-20"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
          >
            <div>
              <span className="eyebrow !text-background/50">La promesa 701</span>
              <h3
                className="mt-4 text-3xl !text-background md:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cada botella,{" "}
                <span className="italic text-background/60">una personalidad.</span>
              </h3>
              <p className="mt-5 max-w-md leading-relaxed text-background/60">
                Trabajamos directamente con distribuidores verificados, solo lo original.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-3 gap-6 text-center"
              variants={staggerContainer(0.15)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                { n: "100%", l: "Originales" },
                { n: "15-20%", l: "Ahorro Promedio" },
                { n: "5-7 Días", l: "Despacho" },
              ].map((s) => (
                <motion.div
                  key={s.l}
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                >
                  <p
                    className="text-4xl font-semibold text-background"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.n}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-background/40">
                    {s.l}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Reviews ─── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="eyebrow">Opiniones sobre nosotros</span>
          <h2
            className="mt-3 text-3xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            +800 Clientes <span className="italic text-muted-foreground">Felices</span>
          </h2>
        </motion.div>
        <div className="flex items-end justify-between mt-14 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-muted-foreground">Mostrando opiniones reales de clientes.</p>
          </motion.div>
          <motion.button
            onClick={() => setReviewModalOpen(true)}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <MessageSquare className="h-4 w-4" /> Dejar una reseña
          </motion.button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {displayReviews.map((r) => (
              <motion.div
                key={r.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease }}
                className="h-full rounded-2xl border border-border bg-background p-8"
              >
                <Quote className="h-6 w-6 text-muted-foreground/30" />
                <p className="mt-4 leading-relaxed text-foreground">"{r.text}"</p>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">— {r.name}</p>
                  <div className="flex">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModalOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              
              {reviewStatus === "success" ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>¡Gracias por tu reseña!</h3>
                  <p className="mt-2 text-muted-foreground">Tu opinión ha sido enviada y será moderada pronto.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Déjanos tu opinión</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Tu experiencia ayuda a miles de chilenos a elegir su próxima fragancia.</p>
                  
                  <form onSubmit={handleReviewSubmit} className="mt-8 space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Tu Nombre</label>
                      <input type="text" required placeholder="Ej: Matías C." className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Perfume Comprado</label>
                      <input type="text" required placeholder="Ej: Stronger With You" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Calificación</label>
                      <select required className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none">
                        <option value="5">★★★★★ Excelente</option>
                        <option value="4">★★★★☆ Muy bueno</option>
                        <option value="3">★★★☆☆ Bueno</option>
                        <option value="2">★★☆☆☆ Regular</option>
                        <option value="1">★☆☆☆☆ Malo</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Comentario</label>
                      <textarea required rows={4} placeholder="Cuéntanos qué te pareció..." className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"></textarea>
                    </div>
                    <button type="submit" className="w-full rounded-full bg-foreground px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition-transform hover:scale-[1.02]">
                      Enviar Reseña
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Newsletter ─── */}
      <section id="newsletter" className="mx-auto max-w-7xl px-6 pb-28">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-surface p-12 md:p-20"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease }}
        >
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="eyebrow">Solo miembros</span>
            <h2
              className="mt-5 text-balance text-4xl md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="italic text-muted-foreground">10% OFF</span> en tu
              primera compra
            </h2>
            <p className="mt-5 text-muted-foreground">
              Únete a la lista 701 para acceso anticipado a lanzamientos y ofertas
              privadas.
            </p>
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Tu correo electrónico"
                className="flex-1 rounded-full border border-border bg-background px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <button className="shine relative overflow-hidden rounded-full bg-foreground px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background">
                Suscribirme
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
