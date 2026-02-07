import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  User,
  Scissors,
  BarChart2,
  Clock,
  Star,
  MessageSquare,
} from 'lucide-react'

export const adminMenuItems = [
  { href: '/admin-panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-panel/appuntamenti', label: 'Appuntamenti', icon: Calendar },
  { href: '/admin-panel/coda', label: 'Senza appuntamento', icon: UserPlus },
  { href: '/admin-panel/clienti', label: 'Clienti', icon: User },
  { href: '/admin-panel/servizi', label: 'Servizi', icon: Scissors },
  { href: '/admin-panel/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin-panel/orari', label: 'Orari', icon: Clock },
  { href: '/admin-panel/recensioni', label: 'Recensioni', icon: Star },
  { href: '/admin-panel/contatti', label: 'Contatti', icon: MessageSquare },
] as const
