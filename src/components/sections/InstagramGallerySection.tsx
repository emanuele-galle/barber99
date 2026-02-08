'use client'

import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GradientOrb, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'
import { Instagram, ExternalLink } from 'lucide-react'

interface InstagramPost {
  id: string
  instagramId: string
  mediaUrl: string
  thumbnailUrl?: string
  permalink: string
  caption?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  timestamp: string
}

interface InstagramGallerySectionProps {
  instagramHandle?: string
}

export default function InstagramGallerySection({ instagramHandle = 'barber___99' }: InstagramGallerySectionProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const shouldReduceMotion = useShouldReduceMotion()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/instagram-posts?limit=12')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.docs || [])
        }
      } catch (error) {
        console.error('Error fetching Instagram posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              @{instagramHandle}
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Instagram
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-[#1a1a1a] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state - no posts synced yet
  if (posts.length === 0) {
    return (
      <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              I Nostri Lavori
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Instagram
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="text-center py-12">
            <Instagram className="w-16 h-16 text-[#d4a855] mx-auto mb-4 opacity-50" />
            <p className="text-white/60 mb-4">Le foto da Instagram saranno disponibili a breve.</p>
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold inline-flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              Seguici su Instagram
            </a>
          </div>
        </div>
        <SectionDivider variant="simple" />
      </section>
    )
  }

  // Mobile version - simplified
  if (shouldReduceMotion) {
    return (
      <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="dark" size="lg" position="top-left" blur="xl" animate={false} />
          <NoiseTexture opacity={0.02} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              <Instagram className="w-4 h-4" />
              @{instagramHandle}
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              I Nostri Lavori
            </h2>
            <div className="gold-divider" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post, index) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${post.caption?.slice(0, 50) || 'Post Instagram'} (apre Instagram)`}
                className={`relative overflow-hidden rounded-lg group ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                style={{ aspectRatio: '1' }}
              >
                <Image
                  src={post.thumbnailUrl || post.mediaUrl}
                  alt={post.caption?.slice(0, 50) || 'Instagram post'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Instagram icon */}
                <div className="absolute top-3 right-3 p-2 bg-black/50 rounded-full" aria-hidden="true">
                  <Instagram className="w-4 h-4 text-white" />
                </div>

                {/* Video indicator */}
                {post.mediaType === 'VIDEO' && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded text-xs text-white">
                    Video
                  </div>
                )}

                {/* Carousel indicator */}
                {post.mediaType === 'CAROUSEL_ALBUM' && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded text-xs text-white">
                    Carousel
                  </div>
                )}

                {/* Caption preview */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm md:text-base line-clamp-2">{post.caption || ''}</p>
                </div>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold inline-flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              Vedi tutto su Instagram
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <SectionDivider variant="simple" />
      </section>
    )
  }

  // Desktop version with animations
  return (
    <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb color="dark" size="lg" position="top-left" blur="xl" animate={false} />
        <NoiseTexture opacity={0.02} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p
            className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            <Instagram className="w-4 h-4" />
            @{instagramHandle}
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            I Nostri Lavori
          </h2>
          <div className="gold-divider" />
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <motion.a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${post.caption?.slice(0, 50) || 'Post Instagram'} (apre Instagram)`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                style={{ aspectRatio: '1' }}
              >
                <Image
                  src={post.thumbnailUrl || post.mediaUrl}
                  alt={post.caption?.slice(0, 50) || 'Instagram post'}
                  fill
                  className="gallery-image-zoom object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/95 via-[#0c0c0c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Instagram Icon */}
                <div className="absolute top-3 right-3 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Instagram className="w-4 h-4 text-white" />
                </div>

                {/* Video/Carousel indicator */}
                {post.mediaType !== 'IMAGE' && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded text-xs text-white">
                    {post.mediaType === 'VIDEO' ? 'Video' : 'Carousel'}
                  </div>
                )}

                {/* External link indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#d4a855]/80 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-[#0c0c0c]" />
                  </div>
                </div>

                {/* Caption on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm md:text-base line-clamp-3">{post.caption || ''}</p>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold btn-ripple inline-flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            Vedi tutto su Instagram
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      <SectionDivider variant="simple" />
    </section>
  )
}
