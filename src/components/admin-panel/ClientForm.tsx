'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, User, Phone, Mail, Scissors, Heart, Tag } from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  name: string
}

interface Client {
  id?: string
  name?: string
  phone?: string
  email?: string
  preferences?: {
    hairNotes?: string
    preferredServices?: string[] | { id: string }[]
  }
  notes?: string
  tags?: string[]
  totalVisits?: number
  lastVisit?: string
  noShowCount?: number
  totalSpent?: number
}

interface ClientFormProps {
  client?: Client
  isNew?: boolean
}

const tagOptions = [
  { value: 'vip', label: 'VIP', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'new', label: 'Nuovo', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'regular', label: 'Abituale', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'inactive', label: 'Inattivo', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
]

export function ClientForm({ client, isNew = false }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<Service[]>([])

  // Get the ID from relationship objects if needed
  const getPreferredServicesIds = () => {
    if (!client?.preferences?.preferredServices) return []
    return client.preferences.preferredServices.map(s =>
      typeof s === 'string' ? s : s.id
    )
  }

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    preferences: {
      hairNotes: client?.preferences?.hairNotes || '',
      preferredServices: getPreferredServicesIds(),
    },
    notes: client?.notes || '',
    tags: client?.tags || [],
  })

  // Load services for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/services?limit=100', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setServices(data.docs || [])
        }
      } catch (err) {
        console.error('Error loading services:', err)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = isNew ? '/api/clients' : `/api/clients/${client?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      // Prepare payload - convert empty strings to null for relationships
      const payload = {
        ...formData,
        preferences: {
          ...formData.preferences,
          preferredServices: formData.preferences.preferredServices.length > 0
            ? formData.preferences.preferredServices
            : null,
        },
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message || 'Errore durante il salvataggio')
      }

      router.push('/admin-panel/clienti')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagValue: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagValue)
        ? prev.tags.filter(t => t !== tagValue)
        : [...prev.tags, tagValue],
    }))
  }

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredServices: prev.preferences.preferredServices.includes(serviceId)
          ? prev.preferences.preferredServices.filter(s => s !== serviceId)
          : [...prev.preferences.preferredServices, serviceId],
      },
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin-panel/clienti"
        className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai clienti
      </Link>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4a855]" />
              Informazioni Contatto
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="admin-input"
                  placeholder="es. Mario Rossi"
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="admin-input"
                  placeholder="es. +39 333 1234567"
                />
                <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                  Identificativo unico del cliente
                </p>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="admin-input"
                  placeholder="es. mario.rossi@email.com"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#d4a855]" />
              Preferenze
            </h2>

            <div className="space-y-6">
              {/* Servizi Preferiti */}
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  <Scissors className="w-4 h-4 inline mr-1" />
                  Servizi Preferiti
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        formData.preferences.preferredServices.includes(service.id)
                          ? 'bg-[#d4a855]/20 text-[#d4a855] border-[#d4a855]/50'
                          : 'bg-[#1a1a1a] text-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Capelli/Stile */}
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Note Capelli/Stile
                </label>
                <textarea
                  value={formData.preferences.hairNotes}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, hairNotes: e.target.value }
                  })}
                  rows={3}
                  className="admin-input resize-none"
                  placeholder="Es: sfumatura bassa, taglio corto sui lati, gel leggero..."
                />
              </div>
            </div>
          </div>

          {/* Note Interne */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Note Interne</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="admin-input resize-none"
              placeholder="Note private visibili solo allo staff..."
            />
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#d4a855]" />
              Etichette
            </h2>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    formData.tags.includes(tag.value)
                      ? tag.color
                      : 'bg-[#1a1a1a] text-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics (read-only, only show for existing clients) */}
          {!isNew && client && (
            <div className="admin-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Statistiche</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[rgba(255,255,255,0.6)]">Visite Totali</span>
                  <span className="text-white font-semibold">{client.totalVisits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgba(255,255,255,0.6)]">Ultima Visita</span>
                  <span className="text-white">
                    {client.lastVisit
                      ? new Date(client.lastVisit).toLocaleDateString('it-IT')
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgba(255,255,255,0.6)]">No-Show</span>
                  <span className={`font-semibold ${(client.noShowCount || 0) > 0 ? 'text-red-400' : 'text-white'}`}>
                    {client.noShowCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgba(255,255,255,0.6)]">Totale Speso</span>
                  <span className="text-[#d4a855] font-semibold">€{client.totalSpent || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/admin-panel/clienti" className="admin-btn admin-btn-secondary">
          Annulla
        </Link>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isNew ? 'Crea Cliente' : 'Salva Modifiche'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
