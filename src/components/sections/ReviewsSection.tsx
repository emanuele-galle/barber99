'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { GradientOrb, NoiseTexture } from '@/components/BackgroundEffects'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

interface Review {
  id: string | number
  author: string
  rating: number
  text: string
  createdAt: string
  source?: string
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(1)
  const shouldReduceMotion = useShouldReduceMotion()

  // Transform database reviews to display format
  const displayReviews = reviews.map(r => ({
    author: r.author,
    rating: r.rating,
    text: r.text,
    date: new Date(r.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
    source: r.source || 'Google',
  }))

  const reviewsCount = displayReviews.length

  const goToNext = useCallback(() => {
    if (reviewsCount === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % reviewsCount)
  }, [reviewsCount])

  const goToPrevious = useCallback(() => {
    if (reviewsCount === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + reviewsCount) % reviewsCount)
  }, [reviewsCount])

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Calculate average rating
  const avgRating = reviewsCount > 0
    ? (displayReviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : '5.0'

  // Auto-play solo su desktop
  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion || reviewsCount === 0) return

    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, goToNext, shouldReduceMotion, reviewsCount])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // If no reviews, show empty state
  if (!reviews || reviews.length === 0) {
    return (
      <section id="reviews" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="gold" size="lg" position="top-left" blur="xl" delay={0} />
          <NoiseTexture opacity={0.02} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Cosa Dicono di Noi
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Recensioni
            </h2>
            <div className="gold-divider" />
          </div>
          <p className="text-white/60 text-center">Nessuna recensione disponibile al momento.</p>
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Barber+99+Via+San+Biagio+3+Serra+San+Bruno+VV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4a855] underline underline-offset-4"
            >
              Lascia la prima recensione su Google →
            </a>
          </div>
        </div>
      </section>
    )
  }

  // Versione mobile semplificata - lista scrollabile
  if (shouldReduceMotion) {
    return (
      <section id="reviews" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
        {/* Background Effects - già ottimizzati */}
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="dark" size="lg" position="top-left" blur="xl" animate={false} />
          <NoiseTexture opacity={0.02} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p
              className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Cosa Dicono di Noi
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Recensioni
            </h2>
            <div className="gold-divider" />

            {/* Rating Summary */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(parseFloat(avgRating)) ? 'text-[#d4a855] fill-[#d4a855]' : 'text-white/20'}`}
                  />
                ))}
              </div>
              <span className="text-white text-base">
                <strong>{avgRating}</strong>/5 • <strong>{reviewsCount}</strong> recensioni
              </span>
            </div>
          </div>

          {/* Reviews - Scroll orizzontale semplice su mobile */}
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:hidden">
            {displayReviews.map((review, index) => (
              <div
                key={index}
                className="card-dark p-5 flex-shrink-0 w-[280px] snap-center relative"
              >
                <Quote className="absolute top-4 right-4 w-6 h-6 text-[#d4a855]/20" />

                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#d4a855] fill-[#d4a855]" />
                  ))}
                </div>

                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{review.author}</p>
                    <p className="text-white/40 text-xs md:text-sm">{review.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#d4a855]/10 text-[#d4a855]">
                    {review.source}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews Grid - Desktop */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {displayReviews.map((review, index) => (
              <div
                key={index}
                className="card-dark p-6 relative"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#d4a855]/20" />

                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#d4a855] fill-[#d4a855]" />
                  ))}
                </div>

                <p className="text-white/80 mb-6 md:text-lg leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium md:text-lg">{review.author}</p>
                    <p className="text-white/40 text-sm md:text-base">{review.date}</p>
                  </div>
                  <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-[#d4a855]/10 text-[#d4a855]">
                    {review.source}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Barber+99+Via+San+Biagio+3+Serra+San+Bruno+VV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4a855] md:text-lg underline underline-offset-4"
            >
              Lascia una recensione su Google →
            </a>
          </div>
        </div>
      </section>
    )
  }

  // Versione desktop con animazioni
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  return (
    <section id="reviews" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb color="dark" size="lg" position="top-left" blur="xl" animate={false} />
        <NoiseTexture opacity={0.02} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-[#d4a855] text-sm md:text-lg tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Cosa Dicono di Noi
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Recensioni
          </h2>
          <div className="gold-divider" />

          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(parseFloat(avgRating)) ? 'text-[#d4a855] fill-[#d4a855]' : 'text-white/20'}`}
                />
              ))}
            </div>
            <span className="text-white text-lg">
              <strong>{avgRating}</strong>/5 basato su <strong>{reviewsCount}</strong> recensioni
            </span>
          </div>
        </motion.div>

        {/* Reviews Carousel - Mobile */}
        <div
          className="md:hidden relative"
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
        >
          <div className="overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="card-dark p-6 relative"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#d4a855]/20" />

                <div className="flex mb-4">
                  {[...Array(displayReviews[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#d4a855] fill-[#d4a855]"
                    />
                  ))}
                </div>

                <p className="text-white/80 mb-6 leading-relaxed md:text-lg">
                  &ldquo;{displayReviews[currentIndex].text}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{displayReviews[currentIndex].author}</p>
                    <p className="text-white/40 text-xs">{displayReviews[currentIndex].date}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#d4a855]/10 text-[#d4a855]">
                    {displayReviews[currentIndex].source}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Dots & Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
              aria-label="Recensione precedente"
            >
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>

            <div className="flex gap-2">
              {displayReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-[#d4a855] w-4' : 'bg-white/20'
                  }`}
                  aria-label={`Vai alla recensione ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
              aria-label="Recensione successiva"
            >
              <ChevronRight className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Reviews Grid - Desktop */}
        <div
          className="hidden md:block relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {displayReviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`card-dark card-hover-lift p-6 relative ${
                  index === currentIndex ? 'ring-2 ring-[#d4a855]/30' : ''
                }`}
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#d4a855]/20" />

                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#d4a855] fill-[#d4a855]"
                    />
                  ))}
                </div>

                <p className="text-white/80 mb-6 md:text-lg leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium md:text-lg">{review.author}</p>
                    <p className="text-white/40 text-sm md:text-base">{review.date}</p>
                  </div>
                  <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-[#d4a855]/10 text-[#d4a855]">
                    {review.source}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {displayReviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[#d4a855] w-6'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Vai alla recensione ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.google.com/maps/search/?api=1&query=Barber+99+Via+San+Biagio+3+Serra+San+Bruno+VV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d4a855] md:text-lg hover:text-[#e8c882] transition-colors underline underline-offset-4"
          >
            Lascia una recensione su Google →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
