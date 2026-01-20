'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Bell, ExternalLink, Scissors } from 'lucide-react'

interface AdminHeaderProps {
  user: { email?: string; name?: string } | null
}

const menuItems = [
  { href: '/admin-panel', label: 'Dashboard' },
  { href: '/admin-panel/servizi', label: 'Servizi' },
  { href: '/admin-panel/appuntamenti', label: 'Appuntamenti' },
  { href: '/admin-panel/orari', label: 'Orari' },
  { href: '/admin-panel/galleria', label: 'Galleria' },
  { href: '/admin-panel/recensioni', label: 'Recensioni' },
  { href: '/admin-panel/contatti', label: 'Contatti' },
]

export function AdminHeader({ user }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const getPageTitle = () => {
    const item = menuItems.find((m) => {
      if (m.href === '/admin-panel') return pathname === '/admin-panel'
      return pathname.startsWith(m.href)
    })
    return item?.label || 'Dashboard'
  }

  return (
    <>
      <header className="h-16 border-b border-[rgba(244,102,47,0.15)] bg-[#0c0c0c]/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-white hover:text-[#F4662F] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F4662F] rounded-full" />
          </button>

          {/* View site */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)] hover:text-[#F4662F] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Vedi sito</span>
          </Link>

          {/* Mobile user avatar */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center text-sm font-bold text-[#0a0a0a]">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0c0c0c] border-r border-[rgba(244,102,47,0.15)] admin-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(244,102,47,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div>
                  <h1 className="font-cinzel text-lg font-bold text-white">Barber 99</h1>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[rgba(255,255,255,0.6)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const active =
                  item.href === '/admin-panel'
                    ? pathname === '/admin-panel'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[rgba(244,102,47,0.1)] text-[#F4662F]'
                        : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(244,102,47,0.15)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center text-sm font-bold text-[#0a0a0a]">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">{user?.email}</p>
                </div>
              </div>
              <form action="/admin-panel/logout" method="POST">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left"
                >
                  Esci
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
