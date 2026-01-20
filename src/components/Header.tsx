'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Phone, Calendar, MapPin } from 'lucide-react'

const navItems = [
  { href: '#about', label: 'Chi Siamo' },
  { href: '#services', label: 'Servizi' },
  { href: '#reviews', label: 'Recensioni' },
  { href: '#contact', label: 'Contatti' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Detect active section
      const sections = navItems.map(item => item.href.replace('#', ''))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0c0c0c]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[#F4662F]/10'
          : 'bg-gradient-to-b from-[#0c0c0c]/80 to-transparent'
      }`}
    >
      {/* Top bar - visible only when not scrolled */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block border-b border-white/10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-white/60">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Via+San+Biagio+3,+89822+Serra+San+Bruno+VV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#F4662F] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Via San Biagio 3, 89822 Serra San Bruno (VV)</span>
                </a>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <span>Lun 10-19, Mar-Sab 9-19</span>
                <span className="text-[#F4662F]/40">|</span>
                <a
                  href="tel:+393271263091"
                  className="flex items-center gap-2 text-[#F4662F] hover:text-[#FF8555] transition-colors font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>327 126 3091</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          {/* Logo */}
          <Link href="/" className="shrink-0 relative group">
            <motion.div
              animate={{ scale: isScrolled ? 0.85 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/images/logo/barber99-logo.png"
                alt="Barber 99 Logo"
                width={50}
                height={60}
                className="h-10 lg:h-12 w-auto transition-all duration-300"
                priority
              />
            </motion.div>
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-[#F4662F]/0 group-hover:bg-[#F4662F]/5 rounded-lg transition-colors duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm uppercase tracking-wider font-medium transition-all duration-300 rounded-lg ${
                    isActive
                      ? 'text-[#F4662F]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#F4662F] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {/* Phone - only when scrolled (top bar hidden) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.a
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  href="tel:+393271263091"
                  className="flex items-center gap-2 text-[#F4662F] hover:text-[#FF8555] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F4662F]/10 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                </motion.a>
              )}
            </AnimatePresence>

            <Link
              href="/prenota"
              className="group relative overflow-hidden bg-gradient-to-r from-[#F4662F] to-[#D4521F] text-[#0c0c0c] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm uppercase tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,168,85,0.4)] hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              <span>Prenota</span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#0c0c0c]/90 backdrop-blur-xl lg:hidden"
              style={{ top: isScrolled ? '64px' : '80px' }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 right-0 lg:hidden bg-[#0c0c0c] border-b border-[#F4662F]/20"
              style={{ top: isScrolled ? '64px' : '80px' }}
            >
              <nav className="max-w-7xl mx-auto px-4 py-6">
                <div className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 ${
                          activeSection === item.href.replace('#', '')
                            ? 'bg-[#F4662F]/10 text-[#F4662F]'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-lg font-medium">{item.label}</span>
                        {activeSection === item.href.replace('#', '') && (
                          <div className="w-2 h-2 rounded-full bg-[#F4662F]" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-white/10 space-y-4"
                >
                  {/* Info cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:+393271263091"
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#F4662F]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F4662F]/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#F4662F]" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">Chiama</span>
                    </a>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Via+San+Biagio+3,+89822+Serra+San+Bruno+VV"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#F4662F]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F4662F]/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#F4662F]" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">Mappa</span>
                    </a>
                  </div>

                  {/* Main CTA */}
                  <Link
                    href="/prenota"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#F4662F] to-[#D4521F] text-[#0c0c0c] font-bold rounded-xl text-lg uppercase tracking-wide"
                  >
                    <Calendar className="w-5 h-5" />
                    Prenota Appuntamento
                  </Link>

                  {/* Hours */}
                  <p className="text-center text-white/40 text-sm">
                    Lun 10-19, Mar-Sab 9-19
                  </p>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
