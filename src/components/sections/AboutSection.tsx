'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { Award, Heart, Scissors, Users } from 'lucide-react'
import { useRef } from 'react'
import { GradientOrb, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'

const features = [
  {
    icon: Scissors,
    title: 'Precisione Artigianale',
    description: 'Tecniche tradizionali perfezionate con dedizione e passione',
  },
  {
    icon: Award,
    title: 'Prodotti Premium',
    description: 'Solo prodotti di prima qualità per risultati eccellenti',
  },
  {
    icon: Heart,
    title: 'Cura Personale',
    description: 'Ogni cliente riceve attenzione dedicata e personalizzata',
  },
  {
    icon: Users,
    title: 'Ambiente Accogliente',
    description: 'Un momento di relax in un ambiente familiare',
  },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])
  const contentY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <>
      <section ref={sectionRef} id="about" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="dark" size="lg" position="top-right" blur="xl" animate={false} />
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
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 0.8 }}
              className="text-[#d4a855] text-sm md:text-base uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              La Mia Storia
            </motion.p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Chi Siamo
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="gold-divider origin-center"
            />
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Images with Parallax */}
            <motion.div
              style={{ y: imageY }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-64 rounded-lg overflow-hidden group"
                >
                  <Image
                    src="/images/gallery-2.webp"
                    alt="Barber 99 Serra San Bruno"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-48 rounded-lg overflow-hidden group"
                >
                  <Image
                    src="/images/pennello-barbiere.jpg"
                    alt="Strumenti del barbiere"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 pt-8"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-48 rounded-lg overflow-hidden group"
                >
                  <Image
                    src="/images/rasatura-barba.webp"
                    alt="Rasatura tradizionale"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-64 rounded-lg overflow-hidden group"
                >
                  <Image
                    src="/images/gallery-4.webp"
                    alt="Barber Shop interno"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Text Content with Parallax */}
            <motion.div style={{ y: contentY }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a855]/20 to-[#d4a855]/5 flex items-center justify-center border border-[#d4a855]/20"
                  >
                    <span
                      className="text-2xl font-bold text-[#d4a855]"
                      style={{ fontFamily: 'var(--font-cinzel), serif' }}
                    >
                      3+
                    </span>
                  </motion.div>
                  <p className="text-white/80">Anni di Esperienza</p>
                </div>

                <h3
                  className="text-2xl md:text-3xl font-semibold text-white mb-6"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  Cosimo Pisani — Il Tuo Barbiere di Fiducia
                </h3>

                <div className="space-y-4 text-white/70 mb-8">
                  <p>
                    Sono Cosimo Pisani, titolare di Barber 99. Dal 2023 accolgo i miei
                    clienti in Via San Biagio 3, nel cuore di Serra San Bruno. Qui ho creato
                    uno spazio dove tradizione e cura del dettaglio si incontrano.
                  </p>
                  <p>
                    Ogni taglio, ogni rasatura è per me un&apos;occasione per esprimere la mia
                    passione. Utilizzo solo prodotti di prima qualità e dedico a ogni cliente
                    il tempo necessario per un risultato impeccabile e personalizzato.
                  </p>
                </div>

                {/* Features Grid with Staggered Animation */}
                <div className="grid grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 group cursor-default"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a855]/20 to-[#d4a855]/5 flex items-center justify-center flex-shrink-0 border border-[#d4a855]/10 group-hover:border-[#d4a855]/30 transition-colors duration-300"
                      >
                        <feature.icon className="w-5 h-5 text-[#d4a855] transition-transform duration-300 group-hover:scale-110" />
                      </motion.div>
                      <div>
                        <h4 className="text-white font-medium text-sm md:text-base group-hover:text-[#d4a855] transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-white/50 text-xs md:text-sm mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <SectionDivider variant="ornate" />
    </>
  )
}
