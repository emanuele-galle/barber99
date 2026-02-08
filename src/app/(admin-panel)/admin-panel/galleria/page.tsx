export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { Instagram, ExternalLink, ImageIcon, Eye, EyeOff } from 'lucide-react'
import { ToggleVisibilityButton } from '@/components/admin-panel/ToggleVisibilityButton'

async function getInstagramPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'instagram-posts',
    sort: '-timestamp',
    limit: 100,
  })
  return posts.docs
}

export default async function GalleriaPage() {
  const posts = await getInstagramPosts()
  const visibleCount = posts.filter((p) => p.isVisible).length

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Galleria Instagram</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            {posts.length} post sincronizzati &middot; {visibleCount} visibili sul sito
          </p>
        </div>
        <a
          href="https://instagram.com/barber___99"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn-secondary inline-flex items-center gap-2"
        >
          <Instagram className="w-4 h-4" />
          Vai al Profilo
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Info */}
      <div className="admin-card p-4 flex items-start gap-3 border-[rgba(212,168,85,0.2)]">
        <Instagram className="w-5 h-5 text-[#d4a855] mt-0.5 shrink-0" />
        <p className="text-sm text-[rgba(255,255,255,0.6)]">
          Le foto vengono sincronizzate automaticamente da Instagram.
          Puoi scegliere quali mostrare sul sito usando il pulsante visibilita'.
        </p>
      </div>

      {/* Gallery grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => {
            const imageUrl = (post.thumbnailUrl || post.mediaUrl) as string
            const isVisible = post.isVisible as boolean
            return (
              <div
                key={post.id}
                className={`group relative aspect-square rounded-xl overflow-hidden bg-[#111111] border transition-all ${
                  isVisible
                    ? 'border-[rgba(212,168,85,0.1)]'
                    : 'border-[rgba(255,255,255,0.05)] opacity-50'
                }`}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={(post.caption as string)?.slice(0, 50) || 'Instagram post'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[rgba(255,255,255,0.2)]" />
                  </div>
                )}

                {/* Type badge */}
                {post.mediaType !== 'IMAGE' && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white">
                    {post.mediaType === 'VIDEO' ? 'Video' : 'Carousel'}
                  </div>
                )}

                {/* Visibility badge */}
                <div className={`absolute top-2 right-2 p-1.5 rounded-full ${
                  isVisible ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    <p className="text-xs text-white/80 line-clamp-2">
                      {(post.caption as string) || 'Senza didascalia'}
                    </p>
                    <div className="flex items-center gap-2">
                      <ToggleVisibilityButton
                        id={String(post.id)}
                        currentVisibility={isVisible}
                      />
                      <a
                        href={post.permalink as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Instagram
                      </a>
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
            <Instagram className="w-8 h-8 text-[#d4a855]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nessun post Instagram</h3>
          <p className="text-[rgba(255,255,255,0.5)] mb-6">
            I post verranno sincronizzati automaticamente dal tuo profilo Instagram
          </p>
        </div>
      )}
    </div>
  )
}
