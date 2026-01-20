'use client'

import { useState, useEffect } from 'react'

// Breakpoint 1024 include tablet
export function useIsMobile(breakpoint: number = 1024): boolean {
  // Default TRUE per evitare flash di animazioni su mobile
  // (mobile-first approach)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check immediato
    checkMobile()

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [breakpoint])

  return isMobile
}

// Hook per rilevare se l'utente preferisce animazioni ridotte
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(true) // Default true

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

// Hook combinato: true se mobile O se preferisce animazioni ridotte
export function useShouldReduceMotion(): boolean {
  const isMobile = useIsMobile()
  const prefersReduced = usePrefersReducedMotion()
  return isMobile || prefersReduced
}
