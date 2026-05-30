import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
  const message = encodeURIComponent("Hola, quiero consultar por un perfume");
  return (
    <motion.a
      href={`https://wa.me/56900000000?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-15px_rgba(37,211,102,0.5)] md:bottom-8 md:right-8 md:py-3.5"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.5 }}
      whileHover={{ scale: 1.06, boxShadow: "0 24px 50px -12px rgba(37,211,102,0.6)" }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="h-5 w-5" fill="currentColor" />
      <span className="hidden sm:inline">WhatsApp</span>
    </motion.a>
  );
}
