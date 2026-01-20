'use client'

import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Lightbox from '@/components/Lightbox'
import { GradientOrb, FloatingParticles, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

const categories = [
  { id: 'all', label: 'Tutti' },
  { id: 'haircut', label: 'Taglio' },
  { id: 'beard', label: 'Barba' },
  { id: 'styling', label: 'Styling' },
  { id: 'shop', label: 'Shop' },
]

// Map database category values to display labels
const categoryLabels: Record<string, string> = {
  haircut: 'Taglio',
  beard: 'Barba',
  styling: 'Styling',
  'before-after': 'Before/After',
  shop: 'Shop',
}

interface GalleryImage {
  id: string | number
  title: string
  image?: { url?: string } | null
  category: string
  featured?: boolean
}

interface GallerySectionProps {
  images: GalleryImage[]
}

export default function GallerySection({ images }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const shouldReduceMotion = useShouldReduceMotion()

  // Transform database images to display format
  const galleryImages = images.map(img => ({
    src: (img.image?.url || '/images/gallery-1.jpg').replace('/api/media/file/', '/images/'),
    alt: img.title,
    category: img.category,
  }))

  const filteredImages = activeCategory === 'all'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory)

  const openLightbox = (index: number) => {
    const actualIndex = activeCategory === 'all'
      ? index
      : galleryImages.findIndex((img) => img.src === filteredImages[index].src)
    setLightboxIndex(actualIndex)
    setLightboxOpen(true)
  }

  // If no images, show empty state with fallback images
  if (!images || images.length === 0) {
    return (
      <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              I Nostri Lavori
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Galleria
            </h2>
            <div className="gold-divider" />
          </div>
          <p className="text-white/60 text-center">Nessuna foto disponibile al momento.</p>
        </div>
        <SectionDivider variant="simple" />
      </section>
    )
  }

  // Versione mobile semplificata - nessuna animazione Framer Motion
  if (shouldReduceMotion) {
    return (
      <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
        {/* Background Effects - già ottimizzati nel componente */}
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="dark" size="xl" position="top-left" blur="xl" delay={0} />
          <GradientOrb color="gold" size="lg" position="bottom-right" blur="lg" delay={1.5} />
          <NoiseTexture opacity={0.02} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              I Nostri Lavori
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Galleria
            </h2>
            <div className="gold-divider" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category.id
                    ? 'bg-[#d4a855] text-[#0c0c0c]'
                    : 'bg-white/5 text-white/60'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid - versione statica */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.src + index}
                className={`gallery-item relative overflow-hidden rounded-lg cursor-pointer ${
                  index === 0 && activeCategory === 'all' ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                style={{ aspectRatio: '1' }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay sempre visibile su mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-[#d4a855] text-xs uppercase tracking-wider font-medium">
                    {categoryLabels[image.category] || image.category}
                  </span>
                  <p className="text-white text-sm mt-1 font-medium">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/60">Nessuna immagine trovata in questa categoria</p>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="btn-outline-gold inline-flex items-center gap-2"
            >
              Vedi Tutta la Galleria
            </Link>
          </div>
        </div>

        <Lightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        <SectionDivider variant="simple" />
      </section>
    )
  }

  // Versione desktop con animazioni
  return (
    <section id="gallery" className="section-padding bg-[#151515] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb color="dark" size="xl" position="top-left" blur="xl" delay={0} />
        <GradientOrb color="gold" size="lg" position="bottom-right" blur="lg" delay={1.5} />
        <FloatingParticles count={8} color="gold" />
        <NoiseTexture opacity={0.02} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p
            className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            I Nostri Lavori
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Galleria
          </h2>
          <div className="gold-divider" />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-[#d4a855] text-[#0c0c0c]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.src + index}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className={`gallery-item relative overflow-hidden rounded-lg group cursor-pointer ${
                  index === 0 && activeCategory === 'all' ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                style={{ aspectRatio: '1' }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="gallery-image-zoom object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/95 via-[#0c0c0c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Zoom Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#d4a855]/80 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#0c0c0c]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[#d4a855] text-xs uppercase tracking-wider text-shadow-gold font-medium">
                    {categoryLabels[image.category] || image.category}
                  </span>
                  <p className="text-white text-sm mt-1 text-shadow font-medium">{image.alt}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-white/60">Nessuna immagine trovata in questa categoria</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/gallery"
            className="btn-outline-gold btn-ripple inline-flex items-center gap-2"
          >
            Vedi Tutta la Galleria
          </Link>
        </motion.div>
      </div>

      <Lightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <SectionDivider variant="simple" />
    </section>
  )
}
