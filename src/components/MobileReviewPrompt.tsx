'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'barber99_review_dismissed'
const DISMISS_DAYS = 14
const SHOW_DELAY = 8000

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJh15YSTVFFRMR0Q84QLNKtP4'

export default function MobileReviewPrompt() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isMobile || pathname !== '/') return

    // Check localStorage for recent dismissal
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < DISMISS_DAYS) return
    }

    // Don't show if PWA install prompt hasn't been dismissed yet (avoid stacking)
    const pwaInstallDismissed = localStorage.getItem('barber99_pwa_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const pwaPromptWillShow = !pwaInstallDismissed && !isStandalone
    const delay = pwaPromptWillShow ? SHOW_DELAY + 5000 : SHOW_DELAY

    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [isMobile, pathname])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setVisible(false)
  }

  if (!isMobile) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-3 right-3 z-[49]"
          style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)' }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative bg-black/90 backdrop-blur-xl border border-[#d4a855]/30 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>

            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              {/* Google G logo */}
              <div className="flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#d4a855] text-[#d4a855]" />
                    ))}
                  </div>
                  <span className="text-white font-semibold text-xs">5.0</span>
                </div>
                <p className="text-white/80 text-sm font-medium mt-0.5">
                  Lascia una recensione <span className="text-[#d4a855]">&rarr;</span>
                </p>
              </div>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
