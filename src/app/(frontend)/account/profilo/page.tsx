'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'
import { ArrowLeft, Loader2, Save, User, Phone, Mail, Scissors, FileText } from 'lucide-react'

interface Service {
  id: string
  name: string
}

export default function ProfiloPage() {
  const router = useRouter()
  const { client, isLoading, isAuthenticated, refreshClient } = useClientAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hairNotes, setHairNotes] = useState('')
  const [preferredServiceIds, setPreferredServiceIds] = useState<string[]>([])

  const [services, setServices] = useState<Service[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (client) {
      setName(client.name || '')
      setPhone(client.phone || '')
      setHairNotes(client.preferences?.hairNotes || '')

      if (client.preferences?.preferredServices) {
        setPreferredServiceIds(
          client.preferences.preferredServices.map((s) =>
            typeof s === 'object' ? s.id : String(s)
          )
        )
      }
    }
  }, [client])

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setPreferredServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch(`/api/clients/${client?.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          preferences: {
            hairNotes,
            preferredServices: preferredServiceIds,
          },
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setMessage('Profilo aggiornato con successo')
        await refreshClient()
      } else {
        const data = await res.json()
        setError(data.error || 'Errore durante il salvataggio')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al tuo account
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profilo e preferenze</h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Modifica i tuoi dati e personalizza la tua esperienza
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Messages */}
          {message && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4a855]" />
              Dati personali
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
                  placeholder="Il tuo nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Telefono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
                    placeholder="Il tuo numero di telefono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                  <input
                    type="email"
                    value={client?.email || ''}
                    disabled
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-[rgba(255,255,255,0.5)] cursor-not-allowed"
                  />
                </div>
                <p className="text-[rgba(255,255,255,0.4)] text-xs mt-1">
                  L&apos;email non può essere modificata
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#d4a855]" />
              Preferenze
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Servizi preferiti
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        preferredServiceIds.includes(service.id)
                          ? 'bg-[#d4a855] text-black'
                          : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#d4a855]" />
              Note
            </h2>

            <div>
              <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                Note sui capelli
              </label>
              <textarea
                value={hairNotes}
                onChange={(e) => setHairNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors resize-none"
                placeholder="Es: Taglio corto ai lati, più lungo sopra..."
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#d4a855] hover:bg-[#c49745] disabled:bg-[#d4a855]/50 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salva modifiche
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
