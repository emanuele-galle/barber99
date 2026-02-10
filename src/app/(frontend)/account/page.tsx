'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'
import { Calendar, User, Clock, LogOut, Loader2, Scissors, ArrowRight, Star } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const { client, isLoading, isAuthenticated, logout } = useClientAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  if (!isAuthenticated || !client) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Ciao, {client.name?.split(' ')[0] || 'Cliente'}!
            </h1>
            <p className="text-[rgba(255,255,255,0.6)]">
              Gestisci le tue prenotazioni e il tuo profilo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Esci</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-4">
            <div className="text-[#d4a855] text-2xl font-bold">
              {client.totalVisits || 0}
            </div>
            <div className="text-[rgba(255,255,255,0.6)] text-sm">
              Visite totali
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-4">
            <div className="text-[#d4a855] text-2xl font-bold">
              {client.lastVisit
                ? new Date(client.lastVisit).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                : '-'}
            </div>
            <div className="text-[rgba(255,255,255,0.6)] text-sm">
              Ultima visita
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/prenota"
            className="bg-[#d4a855] hover:bg-[#c49745] text-black rounded-xl p-6 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Prenota ora</div>
                  <div className="text-black/70 text-sm">Scegli servizio, data e orario</div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/account/prenotazioni"
            className="bg-[#1a1a1a] hover:bg-[#252525] border border-[rgba(255,255,255,0.1)] text-white rounded-xl p-6 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[rgba(255,255,255,0.1)] rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#d4a855]" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Le tue prenotazioni</div>
                  <div className="text-[rgba(255,255,255,0.6)] text-sm">Visualizza storico e prossimi appuntamenti</div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[rgba(255,255,255,0.6)] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Google Review CTA */}
        <a
          href="https://search.google.com/local/writereview?placeid=ChIJh15YSTVFFRMR0Q84QLNKtP4"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-[#1a1a1a] to-[#1f1f1f] border border-[#d4a855]/20 hover:border-[#d4a855]/40 rounded-xl p-5 transition-all group mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d4a855]/10 rounded-lg flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-[#d4a855] fill-[#d4a855]" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">Lascia una recensione</div>
              <div className="text-[rgba(255,255,255,0.5)] text-sm">
                La tua opinione ci aiuta a migliorare. Racconta la tua esperienza su Google!
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#d4a855] group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </a>

        {/* Menu Links */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden">
          <Link
            href="/account/profilo"
            className="flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors border-b border-[rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#d4a855]" />
              <div>
                <div className="text-white font-medium">Profilo e preferenze</div>
                <div className="text-[rgba(255,255,255,0.5)] text-sm">Modifica i tuoi dati e preferenze</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          </Link>

          <Link
            href="/account/prenotazioni"
            className="flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#d4a855]" />
              <div>
                <div className="text-white font-medium">Storico appuntamenti</div>
                <div className="text-[rgba(255,255,255,0.5)] text-sm">Vedi tutti i tuoi appuntamenti passati</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-[rgba(255,255,255,0.4)] text-sm">
          <p>Email: {client.email}</p>
          <p>Telefono: {client.phone}</p>
        </div>
      </div>
    </div>
  )
}
