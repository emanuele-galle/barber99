'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, ImageIcon, Loader2, X } from 'lucide-react'

const categories = [
  { value: 'haircut', label: 'Taglio' },
  { value: 'beard', label: 'Barba' },
  { value: 'styling', label: 'Styling' },
  { value: 'before-after', label: 'Before/After' },
  { value: 'shop', label: 'Negozio' },
]

export default function CaricaFotoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('haircut')
  const [featured, setFeatured] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine valido')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Il file è troppo grande (max 10MB)')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Seleziona un\'immagine')
      return
    }

    if (!title.trim()) {
      setError('Inserisci un titolo')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Step 1: Upload media file
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('alt', title)

      const mediaRes = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!mediaRes.ok) {
        const errorData = await mediaRes.json().catch(() => ({}))
        throw new Error(errorData.message || 'Errore durante upload immagine')
      }

      const mediaData = await mediaRes.json()
      const mediaId = mediaData.doc?.id

      if (!mediaId) {
        throw new Error('ID media non trovato nella risposta')
      }

      // Step 2: Create gallery entry
      const galleryRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          image: mediaId,
          category,
          featured,
        }),
        credentials: 'include',
      })

      if (!galleryRes.ok) {
        const errorData = await galleryRes.json().catch(() => ({}))
        throw new Error(errorData.message || 'Errore durante creazione galleria')
      }

      // Success - redirect to gallery
      router.push('/admin-panel/galleria')
      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Errore durante il caricamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin-panel/galleria"
          className="p-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Carica Foto</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Aggiungi una nuova foto alla galleria
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-card p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Image upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Immagine *
            </label>

            {preview ? (
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#111111] border border-[rgba(212,168,85,0.1)]">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-[rgba(212,168,85,0.3)] bg-[#111111] cursor-pointer hover:border-[rgba(212,168,85,0.5)] transition-colors"
              >
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#d4a855]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">
                      Clicca per selezionare
                    </p>
                    <p className="text-sm text-[rgba(255,255,255,0.5)]">
                      PNG, JPG fino a 10MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#d4a855]">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Carica immagine</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Right: Form fields */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Titolo *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Taglio moderno fade"
                className="admin-input w-full"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                Categoria *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input w-full"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
                />
                <span className="text-white">
                  Mostra in evidenza sulla homepage
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/admin-panel/galleria"
                className="admin-btn admin-btn-secondary flex-1"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="admin-btn admin-btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Carica Foto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
