'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, MapPin, Clock, MessageCircle, Navigation, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import BookingForm from './BookingForm'

interface MobileAppHomeProps {
  onShowFullSite: () => void
}

export default function MobileAppHome({ onShowFullSite }: MobileAppHomeProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-[#0c0c0c] flex flex-col">
      {/* Compact Header */}
      <header className="px-4 pt-safe-top bg-[#0c0c0c] border-b border-white/10">
        <div className="flex items-center justify-between py-3">
          <Image
            src="/images/logo/barber99-logo.png"
            alt="Barber 99"
            width={50}
            height={60}
            className="h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-2">
            <a
              href="tel:+393271263091"
              className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center"
              aria-label="Chiama"
            >
              <Phone className="w-4 h-4 text-green-400" />
            </a>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              aria-label="Info"
            >
              <motion.div animate={{ rotate: showInfo ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Expandable Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-4 space-y-3 border-t border-white/10">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href="tel:+393271263091"
                    className="flex flex-col items-center gap-1 p-3 bg-[#1a1a1a] rounded-xl"
                  >
                    <Phone className="w-5 h-5 text-green-400" />
                    <span className="text-white/70 text-xs">Chiama</span>
                  </a>
                  <a
                    href="https://wa.me/393271263091"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-3 bg-[#1a1a1a] rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <span className="text-white/70 text-xs">WhatsApp</span>
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Via+San+Biagio+3,+89822+Serra+San+Bruno+VV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-3 bg-[#1a1a1a] rounded-xl"
                  >
                    <Navigation className="w-5 h-5 text-blue-400" />
                    <span className="text-white/70 text-xs">Mappa</span>
                  </a>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F4662F]" />
                    <span>Lun 10-19 | Mar-Sab 9-19</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F4662F]" />
                    <span>Via San Biagio 3, Serra San Bruno</span>
                  </div>
                </div>

                {/* Full Site Link */}
                <button
                  onClick={onShowFullSite}
                  className="w-full text-center text-white/40 text-xs py-2 underline underline-offset-2"
                >
                  Visualizza sito completo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Booking Form - Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-safe-bottom">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Prenota <span className="text-[#F4662F]">Appuntamento</span>
          </h1>
          <p className="text-white/50 text-sm">
            Scegli servizio, barbiere e orario
          </p>
        </div>

        <BookingForm />
      </main>
    </div>
  )
}
