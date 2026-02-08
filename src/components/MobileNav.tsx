'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scissors, Calendar, UserCircle, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/#services', icon: Scissors, label: 'Servizi' },
  { href: '/prenota', icon: Calendar, label: 'Prenota', featured: true },
  { href: '/account', icon: UserCircle, label: 'Account' },
  { href: 'tel:+393271263091', icon: Phone, label: 'Chiama', isExternal: true },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useClientAuth()

  // Non mostrare su /prenota (ha la sua nav)
  if (pathname === '/prenota') return null

  return (
    <nav className="mobile-nav md:hidden" aria-label="Navigazione mobile">
      <div className="absolute inset-0 bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-white/10" />
      <div className="relative flex justify-around items-center px-2 pt-2 pb-safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/account' && pathname?.startsWith('/account'))
          const isFeatured = item.featured
          const isExternal = item.isExternal
          const isAccount = item.href === '/account'

          if (isFeatured) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 group"
              >
                <motion.div
                  whileTap={{ scale: 0.93 }}
                  className="relative flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4a855] to-[#b8923d] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(212,168,85,0.35)]">
                    <item.icon className="w-6 h-6 text-[#0c0c0c]" />
                  </div>
                  <span className="text-[#d4a855] text-[10px] font-bold mt-1 uppercase tracking-wide">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          }

          const Component = isExternal ? 'a' : Link
          const href = isAccount && !isAuthenticated ? '/account/login' : item.href

          return (
            <Component
              key={item.href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-3 px-3 transition-colors ${
                isActive
                  ? 'text-[#d4a855]'
                  : 'text-white/45 active:text-white/70'
              }`}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isAccount && isAuthenticated && (
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </Component>
          )
        })}
      </div>
    </nav>
  )
}
