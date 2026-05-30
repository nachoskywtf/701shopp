import type { Transition, Variants } from "framer-motion";

/* ─── Shared easing curves ─── */
export const easeSnappy = [0.16, 1, 0.3, 1] as const;
export const easeOutQuint = [0.22, 1, 0.36, 1] as const;
export const easeInOutExpo = [0.87, 0, 0.13, 1] as const;

/* ─── Reusable transitions ─── */
export const smoothSpring: Transition = { type: "spring", stiffness: 260, damping: 30 };
export const gentleSpring: Transition = { type: "spring", stiffness: 120, damping: 20 };

/* ─── Reusable variants ─── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

/* ─── Stagger container factory ─── */
export const staggerContainer = (stagger = 0.1): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

/* ─── Default whileInView transition ─── */
export const defaultViewTransition: Transition = {
  duration: 0.7,
  ease: easeOutQuint as [number, number, number, number],
};
