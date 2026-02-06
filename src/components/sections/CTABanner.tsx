'use client'

import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'

export default function CTABanner() {
  return (
    <section className="py-12 px-4 bg-[#0c0c0c]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center py-10 px-6 rounded-2xl bg-gradient-to-br from-[#d4a855]/10 to-[#d4a855]/5 border border-[#d4a855]/20"
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Prenota il Tuo Appuntamento
        </h2>
        <p className="text-white/60 mb-6 max-w-lg mx-auto">
          Scegli il servizio che preferisci e prenota online in pochi secondi.
          Ti aspettiamo in Via San Biagio 3, Serra San Bruno.
        </p>
        <Link
          href="/prenota"
          className="btn-gold btn-ripple inline-flex items-center gap-3 text-base px-8 py-3 font-bold"
        >
          <Calendar className="w-5 h-5" />
          Prenota Ora
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  )
}
