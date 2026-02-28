'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, Share, X, Smartphone } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'barber99_pwa_dismissed'
const DISMISS_DAYS = 30
const SHOW_DELAY = 3000

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
  )
}

export default function PWAInstallPrompt() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!isMobile || pathname !== '/' || isStandalone()) return

    // Check localStorage for recent dismissal
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < DISMISS_DAYS) return
    }

    const ios = isIOS()
    requestAnimationFrame(() => setIsIOSDevice(ios))

    if (ios) {
      // iOS: show instructions directly after delay
      const timer = setTimeout(() => setVisible(true), SHOW_DELAY)
      return () => clearTimeout(timer)
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setTimeout(() => setVisible(true), SHOW_DELAY)
    }

    const handleAppInstalled = () => {
      deferredPrompt.current = null
      setVisible(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isMobile, pathname])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setVisible(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.current = null
      setVisible(false)
    }
  }

  if (!isMobile) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-3 right-3 z-[48]"
          style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)' }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative bg-black/90 backdrop-blur-xl border border-[#d4a855]/30 rounded-2xl px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#d4a855] to-[#b8923d] rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#0c0c0c]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isIOSDevice ? (
                  <>
                    <p className="text-white font-semibold text-sm">
                      Aggiungi Barber 99 alla Home
                    </p>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">
                      Tocca{' '}
                      <Share className="inline w-3.5 h-3.5 text-[#d4a855] -mt-0.5" />{' '}
                      poi <span className="text-white/80">&quot;Aggiungi a schermata Home&quot;</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-semibold text-sm">
                      Installa Barber 99
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      Accedi piu veloce dal tuo telefono
                    </p>
                    <button
                      onClick={handleInstall}
                      className="mt-2 flex items-center gap-1.5 bg-gradient-to-r from-[#d4a855] to-[#b8923d] text-[#0c0c0c] text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Installa App
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
