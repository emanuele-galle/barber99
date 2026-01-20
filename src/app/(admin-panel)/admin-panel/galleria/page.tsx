export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, ImageIcon, Trash2 } from 'lucide-react'
import { DeleteButton } from '@/components/admin-panel/DeleteButton'

async function getGalleryImages() {
  const payload = await getPayload({ config })
  const gallery = await payload.find({
    collection: 'gallery',
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })
  return gallery.docs
}

export default async function GalleriaPage() {
  const images = await getGalleryImages()

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Galleria</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Gestisci le foto del salone
          </p>
        </div>
        <Link href="/admin-panel/galleria/carica" className="admin-btn admin-btn-primary">
          <Plus className="w-5 h-5" />
          Carica Foto
        </Link>
      </div>

      {/* Gallery grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item) => {
            const image = item.image as { url?: string; alt?: string } | undefined
            return (
              <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[#111111] border border-[rgba(212,168,85,0.1)]">
                {image?.url ? (
                  <Image
                    src={image.url}
                    alt={item.title as string || 'Gallery image'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[rgba(255,255,255,0.2)]" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium text-white truncate mb-2">
                      {item.title || 'Senza titolo'}
                    </p>
                    <div className="flex gap-2">
                      <DeleteButton
                        collection="gallery"
                        id={String(item.id)}
                        name={item.title as string || 'questa immagine'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="admin-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-[#d4a855]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nessuna foto</h3>
          <p className="text-[rgba(255,255,255,0.5)] mb-6">
            Inizia caricando le foto del salone
          </p>
          <Link href="/admin-panel/galleria/carica" className="admin-btn admin-btn-primary">
            <Plus className="w-5 h-5" />
            Carica Foto
          </Link>
        </div>
      )}
    </div>
  )
}
