'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Scissors,
  Calendar,
  Clock,
  ImageIcon,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  UserPlus,
  BarChart2,
  User,
} from 'lucide-react'

interface AdminSidebarProps {
  user: { email?: string; name?: string } | null
}

const menuItems = [
  { href: '/admin-panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-panel/appuntamenti', label: 'Appuntamenti', icon: Calendar },
  { href: '/admin-panel/coda', label: 'Coda Walk-in', icon: UserPlus },
  { href: '/admin-panel/clienti', label: 'Clienti', icon: User },
  { href: '/admin-panel/servizi', label: 'Servizi', icon: Scissors },
  { href: '/admin-panel/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin-panel/orari', label: 'Orari', icon: Clock },
  { href: '/admin-panel/galleria', label: 'Galleria', icon: ImageIcon },
  { href: '/admin-panel/recensioni', label: 'Recensioni', icon: Star },
  { href: '/admin-panel/contatti', label: 'Contatti', icon: MessageSquare },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin-panel') {
      return pathname === '/admin-panel'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="admin-sidebar w-64 flex-shrink-0 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(244,102,47,0.15)]">
        <Link href="/admin-panel" className="flex items-center gap-3">
          <Image
            src="/images/logo/barber99-logo.png"
            alt="Barber 99"
            width={40}
            height={50}
            className="h-10 w-auto"
          />
          <div>
            <h1 className="font-cinzel text-lg font-bold text-white">Barber 99</h1>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto admin-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[rgba(244,102,47,0.15)]">
        <div className="flex items-center gap-3 mb-4 px-3">
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
        <div className="space-y-1">
          <Link href="/admin-panel/impostazioni" className="admin-sidebar-link">
            <Settings className="w-5 h-5" />
            <span>Impostazioni</span>
          </Link>
          <form action="/admin-panel/logout" method="POST">
            <button type="submit" className="admin-sidebar-link w-full text-left text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" />
              <span>Esci</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
