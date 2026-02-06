'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Instagram, Phone, ChevronDown } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '#about', label: 'Chi Siamo' },
  { href: '#services', label: 'Servizi' },
  { href: '#reviews', label: 'Recensioni' },
  { href: '#contact', label: 'Contatti' },
]

const services = [
  { href: '/#services', label: 'Taglio' },
  { href: '/#services', label: 'Meches' },
  { href: '/#services', label: 'Barba' },
  { href: '/#services', label: 'Taglio + Barba' },
  { href: '/#services', label: 'Taglio + Meches' },
]

interface AccordionSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="md:hidden border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between"
        aria-expanded={isOpen}
      >
        <h4
          className="text-white font-semibold"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[#d4a855]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0c] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/images/logo/barber99-logo.png"
                alt="Barber 99 Logo"
                width={80}
                height={100}
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-white/60 text-sm mb-6">
              Cosimo Pisani — Il tuo barbiere di fiducia a Serra San Bruno dal 2023.
              Taglio, barba e meches con passione e precisione.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/barber___99/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4a855]/20 transition-colors"
                aria-label="Seguici su Instagram"
              >
                <Instagram className="w-5 h-5 text-[#d4a855]" />
              </a>
              <a
                href="tel:+393271263091"
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4a855]/20 transition-colors"
                aria-label="Chiamaci"
              >
                <Phone className="w-5 h-5 text-[#d4a855]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-white font-semibold mb-6"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Link Rapidi
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#d4a855] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-white font-semibold mb-6"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Servizi
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="text-white/60 hover:text-[#d4a855] transition-colors text-sm"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-semibold mb-6"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Contatti
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-white/60">
                <span className="text-white">Indirizzo:</span>
                <br />
                Via San Biagio 3
                <br />
                89822 Serra San Bruno (VV)
              </p>
              <p className="text-white/60">
                <span className="text-white">Telefono:</span>
                <br />
                <a
                  href="tel:+393271263091"
                  className="hover:text-[#d4a855] transition-colors"
                >
                  +39 327 126 3091
                </a>
              </p>
              <p className="text-white/60">
                <span className="text-white">Orari:</span>
                <br />
                Lun: 10:00-19:00
                <br />
                Mar-Sab: 09:00-19:00
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden">
          {/* Brand - Always visible */}
          <div className="text-center mb-8">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/images/logo/barber99-logo.png"
                alt="Barber 99 Logo"
                width={70}
                height={85}
                className="h-20 w-auto mx-auto"
              />
            </Link>
            <p className="text-white/60 text-sm mb-4">
              Cosimo Pisani — Il tuo barbiere dal 2023.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/barber___99/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4a855]/20 transition-colors"
                aria-label="Seguici su Instagram"
              >
                <Instagram className="w-5 h-5 text-[#d4a855]" />
              </a>
              <a
                href="tel:+393271263091"
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d4a855]/20 transition-colors"
                aria-label="Chiamaci"
              >
                <Phone className="w-5 h-5 text-[#d4a855]" />
              </a>
            </div>
          </div>

          {/* Accordion Sections */}
          <AccordionSection title="Link Rapidi">
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#d4a855] transition-colors text-sm block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection title="Servizi">
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="text-white/60 hover:text-[#d4a855] transition-colors text-sm block py-1"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection title="Contatti" defaultOpen={true}>
            <div className="space-y-3 text-sm">
              <p className="text-white/60">
                <span className="text-white">Indirizzo:</span>
                <br />
                Via San Biagio 3, 89822 Serra San Bruno (VV)
              </p>
              <p className="text-white/60">
                <span className="text-white">Telefono:</span>{' '}
                <a
                  href="tel:+393271263091"
                  className="hover:text-[#d4a855] transition-colors"
                >
                  +39 327 126 3091
                </a>
              </p>
              <p className="text-white/60">
                <span className="text-white">Orari:</span> Lun 10-19, Mar-Sab 9-19
              </p>
            </div>
          </AccordionSection>
        </div>

        {/* Bottom */}
        <div className="mt-8 md:mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Barber 99 Serra San Bruno. Tutti i diritti
              riservati.
            </p>
            <p className="text-white/30 text-xs mt-1">
              Sito web realizzato da{' '}
              <a
                href="https://www.fodisrl.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4a855]/60 hover:text-[#d4a855] transition-colors"
              >
                Fodi S.r.l.
              </a>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-white/40 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie"
              className="text-white/40 hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="/termini"
              className="text-white/40 hover:text-white transition-colors"
            >
              Termini
            </Link>
            <Link
              href="/admin"
              className="text-white/20 hover:text-white/40 text-xs transition-colors"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Safe Area - accounts for fixed MobileNav + device safe area */}
      <div className="h-20 pb-safe-bottom md:hidden" />
    </footer>
  )
}
