'use client'

import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileAppHome from './MobileAppHome'

interface HomeWrapperProps {
  children: React.ReactNode
}

export default function HomeWrapper({ children }: HomeWrapperProps) {
  const [showFullSite, setShowFullSite] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile(768) // breakpoint md

  useEffect(() => {
    setMounted(true)
    // Controlla se l'utente ha già scelto di vedere il sito completo
    const preference = sessionStorage.getItem('barber-show-full-site')
    if (preference === 'true') {
      setShowFullSite(true)
    }
  }, [])

  const handleShowFullSite = () => {
    setShowFullSite(true)
    sessionStorage.setItem('barber-show-full-site', 'true')
  }

  // Durante l'hydration, mostra il contenuto normale per evitare flash
  if (!mounted) {
    return <>{children}</>
  }

  // Su mobile e senza preferenza per sito completo, mostra la webapp
  if (isMobile && !showFullSite) {
    return <MobileAppHome onShowFullSite={handleShowFullSite} />
  }

  // Desktop o utente ha scelto sito completo
  return <>{children}</>
}
