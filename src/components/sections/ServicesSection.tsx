'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Scissors, Sparkles, Droplets, Crown, Palette, Star, Clock, ArrowRight, Package, Brush, Waves, LucideIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { GradientOrb, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Sparkles,
  Droplets,
  Crown,
  Palette,
  Star,
  Package,
  Brush,
  Waves,
}

// Smart icon fallback based on service name
function getServiceIcon(service: { icon?: string; name: string }): LucideIcon {
  if (service.icon && iconMap[service.icon]) return iconMap[service.icon]
  const name = service.name.toLowerCase()
  if (name.includes('barba')) return Brush
  if (name.includes('meches') || name.includes('colore')) return Palette
  if (name.includes('taglio') && name.includes('barba')) return Crown
  if (name.includes('taglio') && name.includes('meches')) return Sparkles
  if (name.includes('taglio')) return Scissors
  if (name.includes('pacchetto') || name.includes('+')) return Package
  if (name.includes('trattamento') || name.includes('shampoo')) return Droplets
  return Scissors
}

interface Service {
  id: string | number
  name: string
  shortDescription?: string
  price: number
  duration: number
  icon?: string
  featured?: boolean
}

interface ServicesSectionProps {
  services: Service[]
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const shouldReduceMotion = useShouldReduceMotion()

  // If no services from database, show empty state
  if (!services || services.length === 0) {
    return (
      <section id="services" className="section-padding bg-[#151515] relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">Nessun servizio disponibile al momento.</p>
        </div>
      </section>
    )
  }

  const maxDuration = Math.max(...services.map(s => s.duration), 90)

  return (
    <>
      <section id="services" className="section-padding bg-[#151515] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="dark" size="lg" position="top-left" blur="xl" animate={false} />
          <NoiseTexture opacity={0.02} />
        </div>


        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              I Nostri Servizi
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Cosa Offriamo
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="gold-divider origin-center"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mt-6"
            >
              Ogni servizio è eseguito con cura e attenzione ai dettagli,
              utilizzando tecniche tradizionali e prodotti di qualità superiore.
            </motion.p>
          </motion.div>

          {/* Services Grid - Desktop */}
          <div
            ref={containerRef}
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, index) => {
              const IconComponent = getServiceIcon(service)
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`group relative bg-[#1a1a1a] rounded-xl p-6 border transition-all duration-500 ${
                    service.featured
                      ? 'border-[#d4a855]/50 shadow-[0_0_30px_rgba(212,168,85,0.1)]'
                      : 'border-white/5 hover:border-[#d4a855]/30'
                  }`}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#d4a855]/0 to-[#d4a855]/0 group-hover:from-[#d4a855]/5 group-hover:to-transparent transition-all duration-500" />

                  {service.featured && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      <span className="bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] text-xs font-bold px-4 py-1.5 rounded-full uppercase shadow-lg">
                        Più Popolare
                      </span>
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a855]/20 to-[#d4a855]/5 flex items-center justify-center border border-[#d4a855]/10 group-hover:border-[#d4a855]/30 transition-all duration-300"
                      >
                        <IconComponent className="w-7 h-7 text-[#d4a855] transition-transform duration-300 group-hover:scale-110" />
                      </motion.div>
                      <div className="text-right">
                        <motion.p
                          className="text-2xl font-bold text-[#d4a855]"
                          style={{ fontFamily: 'var(--font-cinzel), serif' }}
                          animate={hoveredIndex === index ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          €{service.price}
                        </motion.p>
                        <div className="flex items-center justify-end gap-1 text-white/40 text-sm md:text-base">
                          <Clock className="w-3 h-3" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <h3
                      className="text-xl font-semibold text-white mb-2 group-hover:text-[#e8c882] transition-colors duration-300"
                      style={{ fontFamily: 'var(--font-cinzel), serif' }}
                    >
                      {service.name}
                    </h3>
                    <p className="text-white/60 text-sm md:text-lg mb-4">{service.shortDescription}</p>

                    {/* Duration Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs md:text-base text-white/40 mb-1">
                        <span>Durata</span>
                        <span>{service.duration} min</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#d4a855] to-[#e8c882] rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(service.duration / maxDuration) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/prenota?service=${encodeURIComponent(service.name)}`}
                      className="group/btn relative w-full py-3 rounded-lg border border-[#d4a855]/50 text-[#d4a855] font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#d4a855] hover:bg-[#d4a855] hover:text-[#0c0c0c]"
                    >
                      <span>Prenota</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Services Cards - Mobile Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory -mx-4 px-4">
              {services.map((service, index) => {
                const IconComponent = getServiceIcon(service)
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className={`relative bg-[#1a1a1a] rounded-xl p-5 flex-shrink-0 w-[260px] max-w-[85vw] snap-center border ${
                      service.featured ? 'border-[#d4a855]/50' : 'border-white/5'
                    }`}
                  >
                    {service.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] text-xs font-bold px-3 py-1 rounded-full uppercase">
                          Più Popolare
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a855]/20 to-[#d4a855]/5 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-[#d4a855]" />
                      </div>
                      <div className="text-right">
                        <p
                          className="text-xl font-bold text-[#d4a855]"
                          style={{ fontFamily: 'var(--font-cinzel), serif' }}
                        >
                          €{service.price}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-white/40 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <h3
                      className="text-lg font-semibold text-white mb-2"
                      style={{ fontFamily: 'var(--font-cinzel), serif' }}
                    >
                      {service.name}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {service.shortDescription}
                    </p>

                    {/* Duration Progress Bar Mobile */}
                    <div className="mb-4">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4a855] to-[#e8c882] rounded-full"
                          style={{ width: `${(service.duration / maxDuration) * 100}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/prenota?service=${encodeURIComponent(service.name)}`}
                      className="w-full py-2.5 rounded-lg border border-[#d4a855]/50 text-[#d4a855] font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      Prenota
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {services.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-2 h-2 rounded-full bg-white/20"
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-white/60 text-base md:text-lg mb-4">
              Non trovi quello che cerchi?
            </p>
            <Link
              href="/prenota"
              className="inline-flex items-center gap-2 text-[#d4a855] hover:text-[#e8c882] transition-colors group"
            >
              <span className="underline underline-offset-4">Prenota un servizio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
      <SectionDivider variant="gradient" />
    </>
  )
}
