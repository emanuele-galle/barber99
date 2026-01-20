'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useShouldReduceMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax effect for background - solo su desktop
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Versione mobile semplificata
  if (shouldReduceMotion) {
    return (
      <section
        ref={sectionRef}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Image statico */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Barber 99 Serra San Bruno"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/80 via-[#0c0c0c]/70 to-[#0c0c0c]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 md:px-8 max-w-4xl mx-auto pt-20">
          <div className="relative py-8 md:py-12 px-6 md:px-10 rounded-2xl bg-[#0c0c0c]/40 backdrop-blur-sm border border-white/5">
            <p
              className="text-[#F4662F] text-base md:text-lg tracking-[0.3em] uppercase mb-4 font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                textShadow: '0 0 30px rgba(244, 102, 47, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              Serra San Bruno
            </p>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              style={{
                fontFamily: 'var(--font-cinzel), serif',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.9), 0 8px 16px rgba(0, 0, 0, 0.6), 0 16px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              L&apos;Arte del{' '}
              <span
                className="text-[#FF8555]"
                style={{
                  textShadow: '0 0 40px rgba(255, 133, 85, 0.6), 0 0 80px rgba(244, 102, 47, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
                }}
              >
                Barbiere
              </span>
            </h1>

            <p
              className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.6)'
              }}
            >
              Cosimo Pisani — Tradizione, precisione e passione dal 2015.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/prenota"
                className="btn-gold btn-ripple inline-flex items-center justify-center gap-3 text-base px-6 py-3 font-bold"
              >
                <Calendar className="w-5 h-5" />
                Prenota Appuntamento
              </Link>
              <Link
                href="#services"
                className="btn-outline-gold btn-ripple inline-flex items-center justify-center gap-3 text-base px-6 py-3 font-semibold"
              >
                Scopri i Servizi
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - statico */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-white/60 text-sm uppercase tracking-wider font-medium"
              style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
            >
              Scorri
            </span>
            <ChevronDown className="w-8 h-8 text-[#F4662F]" />
          </div>
        </div>
      </section>
    )
  }

  // Versione desktop con parallax
  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <Image
          src="/images/hero-bg.jpg"
          alt="Barber 99 Serra San Bruno"
          fill
          className="object-cover scale-110"
          priority
        />
        {/* Stronger overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/80 via-[#0c0c0c]/70 to-[#0c0c0c]" />
      </motion.div>

      {/* Content with backdrop */}
      <motion.div
        className="relative z-10 text-center px-6 md:px-8 max-w-4xl mx-auto pt-20"
        style={{ y: contentY, opacity }}
      >
        {/* Content container with subtle backdrop for better readability */}
        <div className="relative py-8 md:py-12 px-6 md:px-10 rounded-2xl bg-[#0c0c0c]/40 backdrop-blur-sm border border-white/5">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p
              className="text-[#F4662F] text-base md:text-lg tracking-[0.3em] uppercase mb-4 font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                textShadow: '0 0 30px rgba(244, 102, 47, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              Serra San Bruno
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.9), 0 8px 16px rgba(0, 0, 0, 0.6), 0 16px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            L&apos;Arte del{' '}
            <span
              className="text-[#FF8555]"
              style={{
                textShadow: '0 0 40px rgba(255, 133, 85, 0.6), 0 0 80px rgba(244, 102, 47, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              Barbiere
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.6)'
            }}
          >
            Cosimo Pisani — Tradizione, precisione e passione dal 2015.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/prenota"
              className="btn-gold btn-ripple inline-flex items-center justify-center gap-3 text-base px-6 py-3 font-bold animate-pulse-gold"
            >
              <Calendar className="w-5 h-5" />
              Prenota Appuntamento
            </Link>
            <Link
              href="#services"
              className="btn-outline-gold btn-ripple inline-flex items-center justify-center gap-3 text-base px-6 py-3 font-semibold"
            >
              Scopri i Servizi
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="text-white/60 text-sm uppercase tracking-wider font-medium"
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
          >
            Scorri
          </span>
          <ChevronDown className="w-8 h-8 text-[#F4662F]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
