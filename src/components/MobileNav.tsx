'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scissors, Calendar, User, Phone } from 'lucide-react'
import { motion } from 'motion/react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/#services', icon: Scissors, label: 'Servizi' },
  { href: '/prenota', icon: Calendar, label: 'Prenota', featured: true },
  { href: '/#reviews', icon: User, label: 'Recensioni' },
  { href: 'tel:+393271263091', icon: Phone, label: 'Chiama', isExternal: true },
]

export default function MobileNav() {
  const pathname = usePathname()

  // Non mostrare su /prenota (ha la sua nav)
  if (pathname === '/prenota') return null

  return (
    <nav className="mobile-nav md:hidden">
      <div className="absolute inset-0 bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-white/10" />
      <div className="relative flex justify-around items-end px-2 pb-safe-bottom">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          const isFeatured = item.featured
          const isExternal = item.isExternal

          if (isFeatured) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 group"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#d4a855] rounded-full blur-xl opacity-40 group-active:opacity-60 transition-opacity" />

                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#d4a855] to-[#b8923d] rounded-full flex items-center justify-center shadow-lg shadow-[#d4a855]/30">
                    <item.icon className="w-7 h-7 text-[#0c0c0c]" />
                  </div>
                  <span className="text-[#d4a855] text-[10px] font-bold mt-1 uppercase tracking-wide">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          }

          const Component = isExternal ? 'a' : Link
          const props = isExternal ? { href: item.href } : { href: item.href }

          return (
            <Component
              key={item.href}
              {...props}
              className={`flex flex-col items-center gap-1 py-4 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-[#d4a855]'
                  : 'text-white/50 active:text-white/80'
              }`}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <item.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Component>
          )
        })}
      </div>
    </nav>
  )
}
