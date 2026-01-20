'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Service {
  id?: string
  name?: string
  slug?: string
  shortDescription?: string
  price?: number
  duration?: number
  category?: string
  icon?: string
  featured?: boolean
  active?: boolean
  order?: number
}

interface ServiceFormProps {
  service?: Service
  isNew?: boolean
}

const categories = [
  { value: 'haircut', label: 'Taglio' },
  { value: 'beard', label: 'Barba' },
  { value: 'styling', label: 'Styling' },
  { value: 'treatment', label: 'Trattamento' },
  { value: 'package', label: 'Pacchetto' },
]

export function ServiceForm({ service, isNew = false }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    shortDescription: service?.shortDescription || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    category: service?.category || 'haircut',
    icon: service?.icon || 'Scissors',
    featured: service?.featured || false,
    active: service?.active ?? true,
    order: service?.order || 0,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: isNew ? generateSlug(value) : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = isNew ? '/api/services' : `/api/services/${service?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message || 'Errore durante il salvataggio')
      }

      router.push('/admin-panel/servizi')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin-panel/servizi"
        className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai servizi
      </Link>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Informazioni Servizio</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Nome Servizio *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="admin-input"
              placeholder="es. Taglio Classico"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="admin-input"
              placeholder="taglio-classico"
            />
          </div>

          {/* Prezzo */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Prezzo (€) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min={0}
              step={0.5}
              className="admin-input"
            />
          </div>

          {/* Durata */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Durata (minuti) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              required
              min={15}
              step={5}
              className="admin-input"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="admin-input admin-select"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icona */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Icona (Lucide)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="admin-input"
              placeholder="Scissors, Crown, Droplets..."
            />
          </div>

          {/* Ordine */}
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              Ordine
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              className="admin-input"
            />
          </div>
        </div>

        {/* Descrizione breve */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
            Descrizione Breve
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            rows={3}
            maxLength={200}
            className="admin-input resize-none"
            placeholder="Breve descrizione del servizio..."
          />
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
            {formData.shortDescription.length}/200 caratteri
          </p>
        </div>

        {/* Checkboxes */}
        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Servizio attivo</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
            />
            <span className="text-sm text-white">In evidenza</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/admin-panel/servizi" className="admin-btn admin-btn-secondary">
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
              {isNew ? 'Crea Servizio' : 'Salva Modifiche'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
