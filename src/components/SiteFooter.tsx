import { motion } from "framer-motion";
import { fadeUp, staggerContainer, defaultViewTransition, easeOutQuint } from "@/lib/motion";

const ease = easeOutQuint as [number, number, number, number];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <motion.div
        className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-4"
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} transition={defaultViewTransition}>
          <img src="/logo.svg" alt="701 Shop" className="mb-4 h-12 w-auto object-contain" />
          <p className="mt-4 text-sm text-background/50">
            Fragancias a precios inteligentes. Perfumes de las casas más codiciadas del mundo, a la puerta de tu casa.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} transition={defaultViewTransition}>
          <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background/40">Tienda</h4>
          <ul className="space-y-2.5 text-sm text-background/60">
            {["Más vendidos", "Novedades", "Hombre", "Mujer"].map((item) => (
              <li key={item}>
                <motion.span
                  className="cursor-pointer transition-colors hover:text-background"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {item}
                </motion.span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} transition={defaultViewTransition}>
          <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background/40">Ayuda</h4>
          <ul className="space-y-2.5 text-sm text-background/60">
            {["Envíos a todo Chile", "Cambios y devoluciones", "Compras Mayoristas", "Contacto WhatsApp"].map((item) => (
              <li key={item}>
                <motion.span
                  className="cursor-pointer transition-colors hover:text-background"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {item}
                </motion.span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} transition={defaultViewTransition}>
          <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background/40">Pago seguro</h4>
          <ul className="space-y-2.5 text-sm text-background/60">
            {["WebPay · Mach", "Mercado Pago", "Transferencia"].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
      <div className="border-t border-background/10 py-6 text-center text-xs text-background/30">
        © {new Date().getFullYear()} 701 Shop · Chile · Todos los derechos reservados
      </div>
    </footer>
  );
}
